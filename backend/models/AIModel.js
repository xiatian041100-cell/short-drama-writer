const mongoose = require('mongoose');

const aiModelSchema = new mongoose.Schema({
  name: { type: String, required: true }, // 显示名称：GPT-4、Claude、Gemini等
  provider: { type: String, required: true }, // 提供商：openai、anthropic、google等
  modelId: { type: String, required: true }, // 模型ID：gpt-4、claude-3-opus等
  apiEndpoint: { type: String, required: true }, // API端点
  apiKey: { type: String, required: true }, // 加密存储的API密钥
  iv: { type: String, required: true }, // 加密IV
  authTag: { type: String, required: true }, // 认证标签
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
  config: {
    maxTokens: { type: Number, default: 4000 },
    temperature: { type: Number, default: 0.8 },
    timeout: { type: Number, default: 120000 }
  },
  description: { type: String },
  icon: { type: String }, // 模型图标URL或emoji
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('AIModel', aiModelSchema);