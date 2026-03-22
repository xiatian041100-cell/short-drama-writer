const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  // 基础信息
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  
  // 订阅信息（新商业模式）
  subscription: {
    plan: { 
      type: String, 
      enum: ['free', 'standard', 'pro', 'enterprise'], 
      default: 'free' 
    },
    status: { 
      type: String, 
      enum: ['active', 'canceled', 'past_due', 'unpaid'], 
      default: 'active' 
    },
    // Stripe 相关
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    // 周期管理
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false }
  },
  
  // 使用统计（精确控制）
  usage: {
    dailyGenerations: { type: Number, default: 0 },
    lastResetDate: { type: Date, default: Date.now },
    totalGenerations: { type: Number, default: 0 },
    monthlyGenerations: { type: Number, default: 0 },
    lastMonthReset: { type: Date, default: Date.now }
  },
  
  // 推荐系统
  referral: {
    code: { type: String, unique: true, sparse: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    inviteCount: { type: Number, default: 0 },
    rewardBalance: { type: Number, default: 0 }, // 单位：元
    totalRewardEarned: { type: Number, default: 0 }
  },
  
  // 管理员
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

// 生成推荐码
userSchema.pre('save', function(next) {
  if (this.isNew && !this.referral.code) {
    // 生成8位推荐码：用户ID前4位 + 随机4位
    const random = crypto.randomBytes(2).toString('hex').toUpperCase();
    this.referral.code = random;
  }
  next();
});

// 检查是否需要重置每日使用次数
userSchema.methods.checkAndResetDailyUsage = function() {
  const now = new Date();
  const lastReset = new Date(this.usage.lastResetDate);
  
  // 检查是否是新的一天
  if (now.getDate() !== lastReset.getDate() ||
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear()) {
    this.usage.dailyGenerations = 0;
    this.usage.lastResetDate = now;
    return true; // 已重置
  }
  return false; // 无需重置
};

// 获取当前计划限制
userSchema.methods.getPlanLimits = function() {
  const limits = {
    free: {
      dailyGenerations: 1,
      maxEpisodes: 30,
      features: {
        mjPrompts: false,
        payPoints: false,
        exportPdf: true, // 但带水印
        apiAccess: false,
        teamCollaboration: false
      }
    },
    standard: {
      dailyGenerations: 20,
      maxEpisodes: 80,
      features: {
        mjPrompts: true,
        payPoints: true,
        exportPdf: true,
        apiAccess: false,
        teamCollaboration: false
      }
    },
    pro: {
      dailyGenerations: Infinity,
      maxEpisodes: 80,
      features: {
        mjPrompts: true,
        payPoints: true,
        exportPdf: true,
        apiAccess: true,
        teamCollaboration: true,
        maxTeamMembers: 5
      }
    },
    enterprise: {
      dailyGenerations: Infinity,
      maxEpisodes: 100, // 可定制
      features: {
        mjPrompts: true,
        payPoints: true,
        exportPdf: true,
        apiAccess: true,
        teamCollaboration: true,
        maxTeamMembers: Infinity,
        customModel: true,
        sla: true
      }
    }
  };
  
  return limits[this.subscription.plan] || limits.free;
};

// 检查是否有权限使用某功能
userSchema.methods.hasFeature = function(featureName) {
  const limits = this.getPlanLimits();
  return limits.features[featureName] || false;
};

// 检查是否可以生成剧本
userSchema.methods.canGenerate = function() {
  this.checkAndResetDailyUsage();
  const limits = this.getPlanLimits();
  return this.usage.dailyGenerations < limits.dailyGenerations;
};

// 增加使用次数
userSchema.methods.incrementUsage = function() {
  this.checkAndResetDailyUsage();
  this.usage.dailyGenerations += 1;
  this.usage.totalGenerations += 1;
  this.usage.monthlyGenerations += 1;
};

// 检查订阅是否有效
userSchema.methods.hasActiveSubscription = function() {
  if (this.subscription.plan === 'free') return true;
  if (this.subscription.status !== 'active') return false;
  if (this.subscription.currentPeriodEnd && 
      new Date() > this.subscription.currentPeriodEnd) return false;
  return true;
};

module.exports = mongoose.model('User', userSchema);
