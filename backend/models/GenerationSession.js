const mongoose = require('mongoose');

const generationSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scriptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Script' },
  
  // 选择的AI模型
  aiModelId: { type: mongoose.Schema.Types.ObjectId, ref: 'AIModel', required: true },
  
  // 会话状态
  status: { 
    type: String, 
    enum: ['active', 'completed', 'paused', 'error'], 
    default: 'active' 
  },
  
  // 对话历史
  messages: [{
    role: { type: String, enum: ['system', 'user', 'assistant'] },
    content: { type: String },
    timestamp: { type: Date, default: Date.now },
    metadata: { type: Object } // 额外信息，如token使用量等
  }],
  
  // 当前步骤
  currentStep: { 
    type: String, 
    enum: ['idea', 'outline', 'characters', 'episodes', 'assets', 'completed'],
    default: 'idea'
  },
  
  // 生成的内容
  generatedContent: {
    title: String,
    outline: Object,
    characters: [Object],
    episodes: [Object],
    assets: {
      characters: [Object],
      scenes: [Object],
      props: [Object]
    }
  },
  
  // 用户输入的原始创意
  originalPrompt: String,
  
  // 类型和风格
  scriptType: String,
  scriptStyle: String,
  
  // 统计信息
  tokenUsage: { type: Number, default: 0 },
  messageCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('GenerationSession', generationSessionSchema);