const axios = require('axios');
const Script = require('../models/Script');
const PromptVersion = require('../models/PromptVersion');
const EncryptionService = require('./encryptionService');

class AIService {
  // 获取当前激活的智能体指令
  static async getActivePrompt() {
    const activeVersion = await PromptVersion.findOne({ isActive: true });
    if (!activeVersion) {
      throw new Error('没有激活的提示词版本');
    }
    
    return EncryptionService.decrypt({
      encrypted: activeVersion.content,
      iv: activeVersion.iv,
      authTag: activeVersion.authTag
    });
  }

  // 生成剧本
  static async generateScript(scriptId, userPrompt, type, style) {
    try {
      const script = await Script.findById(scriptId);
      if (!script) {
        throw new Error('剧本不存在');
      }

      // 获取智能体指令
      const systemPrompt = await this.getActivePrompt();

      // 构建用户消息
      const userMessage = `
用户创意：${userPrompt}
剧本类型：${type}
时代风格：${style}
预计集数：80集

请按照系统指令，生成完整的80集短剧剧本。
      `.trim();

      // 调用AI API
      const aiResponse = await this.callAIAPI(systemPrompt, userMessage);

      // 解析AI响应
      const parsedContent = this.parseAIResponse(aiResponse);

      // 更新剧本
      script.title = parsedContent.title || userPrompt.slice(0, 30);
      script.content = aiResponse;
      script.episodes = parsedContent.episodes || [];
      script.assets = parsedContent.assets || { characters: [], scenes: [] };
      script.status = 'completed';
      await script.save();

      return script;
    } catch (error) {
      console.error('AI生成失败:', error);
      
      // 更新剧本状态为失败
      await Script.findByIdAndUpdate(scriptId, {
        status: 'failed',
        errorMessage: error.message
      });
      
      throw error;
    }
  }

  // 调用AI API
  static async callAIAPI(systemPrompt, userMessage) {
    // 优先使用 OpenAI
    if (process.env.OPENAI_API_KEY) {
      return this.callOpenAI(systemPrompt, userMessage);
    }
    
    // 备选使用 Claude
    if (process.env.ANTHROPIC_API_KEY) {
      return this.callClaude(systemPrompt, userMessage);
    }

    // 如果没有配置API密钥，返回模拟数据（开发测试用）
    console.warn('未配置AI API密钥，使用模拟数据');
    return this.getMockResponse();
  }

  // 调用 OpenAI
  static async callOpenAI(systemPrompt, userMessage) {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.8,
        max_tokens: 4000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 120000 // 2分钟超时
      }
    );

    return response.data.choices[0].message.content;
  }

  // 调用 Claude
  static async callClaude(systemPrompt, userMessage) {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userMessage }
        ]
      },
      {
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        timeout: 120000
      }
    );

    return response.data.content[0].text;
  }

  // 解析AI响应
  static parseAIResponse(response) {
    try {
      // 尝试提取JSON格式的数据
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                       response.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }

      // 如果无法解析JSON，返回结构化文本
      return {
        title: this.extractTitle(response),
        episodes: this.extractEpisodes(response),
        assets: this.extractAssets(response)
      };
    } catch (error) {
      console.error('解析AI响应失败:', error);
      return {
        title: '未命名剧本',
        episodes: [],
        assets: { characters: [], scenes: [] }
      };
    }
  }

  // 提取标题
  static extractTitle(response) {
    const titleMatch = response.match(/#\s*(.+)/);
    return titleMatch ? titleMatch[1].trim() : '未命名剧本';
  }

  // 提取分集内容
  static extractEpisodes(response) {
    const episodes = [];
    const episodeMatches = response.matchAll(/第(\d+)集[：:]\s*(.+?)\n([\s\S]*?)(?=第\d+集|$)/g);
    
    for (const match of episodeMatches) {
      episodes.push({
        episodeNumber: parseInt(match[1]),
        title: match[2].trim(),
        content: match[3].trim(),
        scenes: []
      });
    }

    return episodes;
  }

  // 提取视觉资产
  static extractAssets(response) {
    const assets = {
      characters: [],
      scenes: []
    };

    // 提取角色
    const charMatches = response.matchAll(/【角色】\s*(.+?)\n([\s\S]*?)(?=【角色】|$)/g);
    for (const match of charMatches) {
      assets.characters.push({
        name: match[1].trim(),
        description: this.extractField(match[2], '描述'),
        mjPrompt: this.extractField(match[2], 'MJ提示词')
      });
    }

    // 提取场景
    const sceneMatches = response.matchAll(/【场景】\s*(.+?)\n([\s\S]*?)(?=【场景】|$)/g);
    for (const match of sceneMatches) {
      assets.scenes.push({
        name: match[1].trim(),
        description: this.extractField(match[2], '描述'),
        mjPrompt: this.extractField(match[2], 'MJ提示词')
      });
    }

    return assets;
  }

  // 提取字段
  static extractField(text, fieldName) {
    const match = text.match(new RegExp(`${fieldName}[：:]\s*(.+?)(?=\n|$)`));
    return match ? match[1].trim() : '';
  }

  // 模拟响应（开发测试用）
  static getMockResponse() {
    return `
# 穷小子逆袭记

## 第1集：命运的转折

林逸是一个普通的穷小子，每天为了生计奔波。某天意外获得神秘超能力...

【角色】林逸
描述：穷小子，20岁，善良坚韧
MJ提示词：A young poor man in his 20s, wearing worn clothes, kind eyes, modern city slum background, cinematic lighting, 8k, hyperrealistic --ar 9:16

【场景】贫民窟
描述：主角最初生活的地方
MJ提示词：Poor urban neighborhood, narrow alley, old buildings, sunset lighting, cinematic atmosphere, 8k, concept art --ar 16:9

...
    `.trim();
  }
}

module.exports = AIService;