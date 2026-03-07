const mongoose = require('mongoose');

const scriptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  prompt: { type: String, required: true },
  type: { type: String, required: true },
  style: { type: String, required: true },
  content: { type: String },
  episodes: [{ type: Object }],
  assets: [{ type: Object }],
  status: { type: String, enum: ['generating', 'completed', 'failed'], default: 'generating' },
  errorMessage: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Script', scriptSchema);