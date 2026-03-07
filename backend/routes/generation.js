const express = require('express');
const GenerationSession = require('../models/GenerationSession');
const AIModel = require('../models/AIModel');
const PromptVersion = require('../models/PromptVersion');
const EncryptionService = require('../services/encryptionService');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// 创建新的生成会话
router.post('/start', authMiddleware, async (req, res) => {
  try {
    const { aiModelId, prompt, scriptType, scriptStyle } = req.body;
    
    // 检查用户权限
    if (req.user.membership.type === 'free' && req.user.membership.dailyUsage >= 1) {
      return res.status(403).json({ 
        error: '今日生成次数已用完',
        code: 'DAILY_LIMIT_REACHED'
      });
    }
    
    // 获取AI模型
    const aiModel = await AIModel.findById(aiModelId);
    if (!aiModel || !aiModel.isActive) {
      return res.status(400).json({ error: 'AI模型不可用' });
    }
    
    // 获取智能体指令
    const promptVersion = await PromptVersion.findOne({ isActive: true });
    if (!promptVersion) {
      return res.status(500).json({ error: '智能体指令未配置' });
    }
    
    const systemPrompt = EncryptionService.decrypt({
      encrypted: promptVersion.content,
      iv: promptVersion.iv,
      authTag: promptVersion.authTag
    });
    
    // 创建会话
    const session = new GenerationSession({
      userId: req.user._id,
      aiModelId: aiModel._id,
      originalPrompt: prompt,
      scriptType,
      scriptStyle,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `我想创作一个${scriptType}类型的短剧，风格是${scriptStyle}。创意是：${prompt}` }
      ]
    });
    
    await session.save();
    
    // 更新用户使用次数
    req.user.membership.dailyUsage += 1;
    await req.user.save();
    
    // 发送第一条AI回复（欢迎消息）
    const welcomeMessage = await generateAIResponse(session, aiModel);
    
    res.status(201).json({
      sessionId: session._id,
      message: welcomeMessage,
      currentStep: session.currentStep,
      messages: session.messages
    });
  } catch (error) {
    res.status(500).json({ error: '创建会话失败: ' + error.message });
  }
});

// 继续对话
router.post('/:sessionId/chat', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const session = await GenerationSession.findOne({
      _id: req.params.sessionId,
      userId: req.user._id
    });
    
    if (!session) {
      return res.status(404).json({ error: '会话不存在' });
    }
    
    if (session.status !== 'active') {
      return res.status(400).json({ error: '会话已结束' });
    }
    
    // 添加用户消息
    session.messages.push({
      role: 'user',
      content: message
    });
    
    // 获取AI模型
    const aiModel = await AIModel.findById(session.aiModelId);
    
    // 生成AI回复
    const aiResponse = await generateAIResponse(session, aiModel);
    
    // 检查是否需要更新步骤
    updateSessionStep(session, aiResponse);
    
    await session.save();
    
    res.json({
      message: aiResponse,
      currentStep: session.currentStep,
      generatedContent: session.generatedContent,
      messages: session.messages.slice(-5) // 只返回最近5条消息
    });
  } catch (error) {
    res.status(500).json({ error: '对话失败: ' + error.message });
  }
});

// 获取会话详情
router.get('/:sessionId', authMiddleware, async (req, res) => {
  try {
    const session = await GenerationSession.findOne({
      _id: req.params.sessionId,
      userId: req.user._id
    }).populate('aiModelId', 'name provider icon');
    
    if (!session) {
      return res.status(404).json({ error: '会话不存在' });
    }
    
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: '获取会话失败' });
  }
});

// 完成会话并保存为剧本
router.post('/:sessionId/complete', authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;
    const session = await GenerationSession.findOne({
      _id: req.params.sessionId,
      userId: req.user._id
    });
    
    if (!session) {
      return res.status(404).json({ error: '会话不存在' });
    }
    
    // 创建剧本
    const Script = require('../models/Script');
    const script = new Script({
      userId: req.user._id,
      title: title || session.generatedContent.title || '未命名剧本',
      prompt: session.originalPrompt,
      type: session.scriptType,
      style: session.scriptStyle,
      content: JSON.stringify(session.generatedContent),
      episodes: session.generatedContent.episodes || [],
      assets: session.generatedContent.assets || { characters: [], scenes: [] },
      status: 'completed',
      aiModel: session.aiModelId
    });
    
    await script.save();
    
    // 更新会话状态
    session.status = 'completed';
    session.scriptId = script._id;
    await session.save();
    
    res.json({
      message: '剧本已保存',
      scriptId: script._id
    });
  } catch (error) {
    res.status(500).json({ error: '保存剧本失败: ' + error.message });
  }
});

// 生成AI回复
async function generateAIResponse(session, aiModel) {
  try {
    // 解密API密钥
    const apiKey = EncryptionService.decrypt({
      encrypted: aiModel.apiKey,
      iv: aiModel.iv,
      authTag: aiModel.authTag
    });
    
    const axios = require('axios');
    let response;
    
    // 根据提供商调用不同的API
    switch (aiModel.provider) {
      case 'openai':
        response = await callOpenAI(aiModel, apiKey, session.messages);
        break;
      case 'anthropic':
        response = await callAnthropic(aiModel, apiKey, session.messages);
        break;
      default:
        throw new Error('暂不支持该AI模型');
    }
    
    // 添加AI回复到会话
    session.messages.push({
      role: 'assistant',
      content: response.content,
      metadata: {
        tokenUsage: response.tokenUsage,
        model: aiModel.modelId
      }
    });
    
    session.tokenUsage += response.tokenUsage || 0;
    session.messageCount += 1;
    
    return response.content;
  } catch (error) {
    console.error('AI生成失败:', error);
    throw error;
  }
}

// 调用OpenAI API
async function callOpenAI(aiModel, apiKey, messages) {
  const axios = require('axios');
  
  const response = await axios.post(
    aiModel.apiEndpoint || 'https://api.openai.com/v1/chat/completions',
    {
      model: aiModel.modelId,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      max_tokens: aiModel.config.maxTokens,
      temperature: aiModel.config.temperature
    },
    {
      headers: { 'Authorization': `Bearer ${apiKey}` },
      timeout: aiModel.config.timeout
    }
  );
  
  return {
    content: response.data.choices[0].message.content,
    tokenUsage: response.data.usage?.total_tokens || 0
  };
}

// 调用Anthropic API
async function callAnthropic(aiModel, apiKey, messages) {
  const axios = require('axios');
  
  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const userMessages = messages.filter(m => m.role !== 'system');
  
  const response = await axios.post(
    aiModel.apiEndpoint || 'https://api.anthropic.com/v1/messages',
    {
      model: aiModel.modelId,
      max_tokens: aiModel.config.maxTokens,
      temperature: aiModel.config.temperature,
      system: systemMessage,
      messages: userMessages.map(m => ({ role: m.role, content: m.content }))
    },
    {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      timeout: aiModel.config.timeout
    }
  );
  
  return {
    content: response.data.content[0].text,
    tokenUsage: response.data.usage?.input_tokens + response.data.usage?.output_tokens || 0
  };
}

// 更新会话步骤
function updateSessionStep(session, aiResponse) {
  // 根据AI回复内容判断当前步骤
  if (aiResponse.includes('【大纲完成】') || aiResponse.includes('大纲已生成')) {
    session.currentStep = 'characters';
  } else if (aiResponse.includes('【角色完成】') || aiResponse.includes('角色已设定')) {
    session.currentStep = 'episodes';
  } else if (aiResponse.includes('【剧本完成】') || aiResponse.includes('80集剧本已生成')) {
    session.currentStep = 'assets';
  } else if (aiResponse.includes('【资产完成】') || aiResponse.includes('视觉资产已生成')) {
    session.currentStep = 'completed';
  }
  
  // 解析生成的内容（简化版，实际应该更复杂的解析逻辑）
  // 这里只是示例
}

module.exports = router;