const mongoose = require('mongoose');

const promptVersionSchema = new mongoose.Schema({
  version: { type: String, required: true },
  content: { type: String, required: true }, // 加密存储
  iv: { type: String, required: true },
  authTag: { type: String, required: true },
  isActive: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('PromptVersion', promptVersionSchema);