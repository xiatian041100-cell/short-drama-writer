const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  membership: {
    type: { type: String, enum: ['free', 'standard', 'pro', 'enterprise'], default: 'free' },
    expiresAt: { type: Date },
    dailyUsage: { type: Number, default: 0 },
    lastReset: { type: Date, default: Date.now }
  },
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);