// models/AIModel.js - 更新版
const mongoose = require('mongoose');

const aiModelSchema = new mongoose.Schema({
  // 基础信息
  name: { 
    type: String, 
    required: true,
    index: true 
  },
  provider: { 
    type: String, 
    required: true,
    enum: [
      'openai',           // OpenAI GPT-4/GPT-3.5
      'anthropic',        // Claude
      'google',           // Gemini
      'moonshot',         // 月之暗面 Kimi
      'baidu',            // 百度文心一言
      'alibaba',          // 阿里通义千问
      'tencent',          // 腾讯混元
      'zhipu',            // 智谱AI GLM
      'minimax',          // MiniMax
      'xinghuo',          // 讯飞星火
      'azure',            // Azure OpenAI
      'cohere',           // Cohere
      'mistral',          // Mistral AI
      'llama',            // Llama (本地/第三方)
      'custom'            // 自定义API
    ]
  },
  
  // 模型标识
  modelId: { 
    type: String, 
    required: true 
  },
  
  // 显示信息
  displayName: String,
  description: String,
  icon: String,
  
  // 能力标识
  capabilities: {
    chat: { type: Boolean, default: true },
    streaming: { type: Boolean, default: true },
    functionCalling: { type: Boolean, default: false },
    vision: { type: Boolean, default: false },
    jsonMode: { type: Boolean, default: false }
  },
  
  // 配置参数
  config: {
    maxTokens: { type: Number, default: 4000 },
    temperature: { type: Number, default: 0.8 },
    topP: { type: Number, default: 1 },
    timeout: { type: Number, default: 120000 }, // 2分钟
    retries: { type: Number, default: 3 }
  },
  
  // 价格配置（每1000 tokens）
  pricing: {
    input: Number,      // 输入价格
    output: Number,     // 输出价格
    currency: { type: String, default: 'USD' }
  },
  
  // API端点配置（加密存储）
  apiConfig: {
    baseUrl: String,    // 基础URL
    endpoint: String,   // 具体端点
    version: String,    // API版本
    region: String      // 区域（部分API需要）
  },
  
  // 认证信息（加密存储）
  auth: {
    type: { 
      type: String, 
      enum: ['bearer', 'apiKey', 'aksk', 'oauth', 'custom'],
      default: 'bearer'
    },
    // 加密后的密钥
    credentials: {
      encrypted: String,
      iv: String,
      authTag: String
    }
  },
  
  // 状态
  isActive: { type: Boolean, default: true },
  isPublic: { type: Boolean, default: false }, // 是否所有用户可用
  isDefault: { type: Boolean, default: false }, // 默认模型
  
  // 使用限制
  restrictions: {
    allowedPlans: [{ type: String, enum: ['free', 'standard', 'pro', 'enterprise'] }],
    rateLimit: {
      requests: Number,
      window: Number // 毫秒
    }
  },
  
  // 统计
  stats: {
    totalRequests: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    averageLatency: { type: Number, default: 0 }
  },
  
  // 创建者
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { 
  timestamps: true 
});

// 索引
aiModelSchema.index({ provider: 1, isActive: 1 });
aiModelSchema.index({ isPublic: 1, isActive: 1 });

// 获取解密后的凭证
aiModelSchema.methods.getCredentials = function() {
  const EncryptionService = require('../services/encryptionService');
  return EncryptionService.decrypt({
    encrypted: this.auth.credentials.encrypted,
    iv: this.auth.credentials.iv,
    authTag: this.auth.credentials.authTag
  });
};

module.exports = mongoose.model('AIModel', aiModelSchema);
