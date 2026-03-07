const express = require('express');
const AIModel = require('../models/AIModel');
const EncryptionService = require('../services/encryptionService');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// 获取所有可用的AI模型（用户）
router.get('/available', authMiddleware, async (req, res) => {
  try {
    const models = await AIModel.find({ isActive: true })
      .select('-apiKey -iv -authTag -apiEndpoint')
      .sort({ createdAt: -1 });
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: '获取模型列表失败' });
  }
});

// 获取所有模型（管理员）
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const models = await AIModel.find()
      .select('-apiKey -iv -authTag')
      .sort({ createdAt: -1 });
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: '获取模型列表失败' });
  }
});

// 添加新模型（管理员）
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, provider, modelId, apiEndpoint, apiKey, config, description, icon } = req.body;
    
    // 加密API密钥
    const encrypted = EncryptionService.encrypt(apiKey);
    
    const model = new AIModel({
      name,
      provider,
      modelId,
      apiEndpoint,
      apiKey: encrypted.encrypted,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      config,
      description,
      icon,
      createdBy: req.user._id
    });
    
    await model.save();
    
    res.status(201).json({
      message: '模型添加成功',
      model: {
        id: model._id,
        name: model.name,
        provider: model.provider,
        modelId: model.modelId,
        isActive: model.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ error: '添加模型失败: ' + error.message });
  }
});

// 更新模型（管理员）
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, apiEndpoint, apiKey, config, isActive, description } = req.body;
    
    const updateData = { name, apiEndpoint, config, isActive, description };
    
    // 如果提供了新的API密钥，加密后更新
    if (apiKey) {
      const encrypted = EncryptionService.encrypt(apiKey);
      updateData.apiKey = encrypted.encrypted;
      updateData.iv = encrypted.iv;
      updateData.authTag = encrypted.authTag;
    }
    
    const model = await AIModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-apiKey -iv -authTag');
    
    if (!model) {
      return res.status(404).json({ error: '模型不存在' });
    }
    
    res.json({ message: '模型更新成功', model });
  } catch (error) {
    res.status(500).json({ error: '更新模型失败' });
  }
});

// 删除模型（管理员）
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const model = await AIModel.findByIdAndDelete(req.params.id);
    
    if (!model) {
      return res.status(404).json({ error: '模型不存在' });
    }
    
    res.json({ message: '模型已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除模型失败' });
  }
});

// 设置默认模型（管理员）
router.put('/:id/default', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // 先将所有模型设为非默认
    await AIModel.updateMany({}, { isDefault: false });
    
    // 设置指定模型为默认
    const model = await AIModel.findByIdAndUpdate(
      req.params.id,
      { isDefault: true },
      { new: true }
    ).select('-apiKey -iv -authTag');
    
    if (!model) {
      return res.status(404).json({ error: '模型不存在' });
    }
    
    res.json({ message: '默认模型已设置', model });
  } catch (error) {
    res.status(500).json({ error: '设置默认模型失败' });
  }
});

// 测试模型连接（管理员）
router.post('/:id/test', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const model = await AIModel.findById(req.params.id);
    
    if (!model) {
      return res.status(404).json({ error: '模型不存在' });
    }
    
    // 解密API密钥
    const apiKey = EncryptionService.decrypt({
      encrypted: model.apiKey,
      iv: model.iv,
      authTag: model.authTag
    });
    
    // 根据提供商调用不同的测试方法
    let testResult;
    switch (model.provider) {
      case 'openai':
        testResult = await testOpenAI(model.apiEndpoint, apiKey, model.modelId);
        break;
      case 'anthropic':
        testResult = await testAnthropic(model.apiEndpoint, apiKey, model.modelId);
        break;
      case 'google':
        testResult = await testGoogle(model.apiEndpoint, apiKey, model.modelId);
        break;
      case 'alibaba':
        testResult = await testAlibaba(model.apiEndpoint, apiKey, model.modelId);
        break;
      case 'baidu':
        testResult = await testBaidu(model.apiEndpoint, apiKey, model.modelId);
        break;
      case 'bytedance':
        testResult = await testByteDance(model.apiEndpoint, apiKey, model.modelId);
        break;
      default:
        testResult = { success: false, error: '未知的提供商' };
    }
    
    res.json(testResult);
  } catch (error) {
    res.status(500).json({ error: '测试失败: ' + error.message });
  }
});

// 测试各个平台的API
async function testOpenAI(endpoint, apiKey, modelId) {
  try {
    const axios = require('axios');
    const response = await axios.post(
      endpoint || 'https://api.openai.com/v1/chat/completions',
      {
        model: modelId,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      },
      {
        headers: { 'Authorization': `Bearer ${apiKey}` },
        timeout: 10000
      }
    );
    return { success: true, message: '连接成功', model: response.data.model };
  } catch (error) {
    return { success: false, error: error.response?.data?.error?.message || error.message };
  }
}

async function testAnthropic(endpoint, apiKey, modelId) {
  try {
    const axios = require('axios');
    const response = await axios.post(
      endpoint || 'https://api.anthropic.com/v1/messages',
      {
        model: modelId,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hello' }]
      },
      {
        headers: { 
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        timeout: 10000
      }
    );
    return { success: true, message: '连接成功' };
  } catch (error) {
    return { success: false, error: error.response?.data?.error?.message || error.message };
  }
}

async function testGoogle(endpoint, apiKey, modelId) {
  // Google Gemini API测试
  return { success: false, error: '测试功能开发中' };
}

async function testAlibaba(endpoint, apiKey, modelId) {
  // 阿里通义千问API测试
  return { success: false, error: '测试功能开发中' };
}

async function testBaidu(endpoint, apiKey, modelId) {
  // 百度文心一言API测试
  return { success: false, error: '测试功能开发中' };
}

async function testByteDance(endpoint, apiKey, modelId) {
  // 字节豆包API测试
  return { success: false, error: '测试功能开发中' };
}

module.exports = router;