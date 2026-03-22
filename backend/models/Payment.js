const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  
  // 支付类型
  type: { 
    type: String, 
    enum: ['stripe', 'alipay', 'wechat', 'referral_reward'], 
    required: true 
  },
  
  // 支付金额
  amount: { type: Number, required: true }, // 单位：分（避免浮点数）
  currency: { type: String, default: 'CNY' },
  
  // 支付状态
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded', 'canceled'], 
    default: 'pending',
    index: true 
  },
  
  // 订阅信息
  subscription: {
    plan: { 
      type: String, 
      enum: ['standard', 'pro', 'enterprise'] 
    },
    interval: { 
      type: String, 
      enum: ['month', 'year'] 
    },
    // 原价和折扣
    originalAmount: Number,
    discountAmount: Number,
    discountCode: String
  },
  
  // 第三方平台信息
  provider: {
    // Stripe
    stripe: {
      customerId: String,
      subscriptionId: String,
      invoiceId: String,
      chargeId: String,
      paymentIntentId: String
    },
    // 支付宝
    alipay: {
      tradeNo: String,      // 支付宝交易号
      outTradeNo: String,   // 商户订单号
      buyerId: String,
      buyerLogonId: String
    }
  },
  
  // 描述信息
  description: { type: String },
  
  // 元数据
  metadata: { type: mongoose.Schema.Types.Mixed },
  
  // 退款信息
  refund: {
    amount: Number,
    reason: String,
    refundedAt: Date,
    refundId: String // 第三方退款ID
  },
  
  // 支付完成时间
  paidAt: { type: Date },
  
  // 失败信息
  failure: {
    code: String,
    message: String
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true }
});

// 虚拟字段：格式化金额
paymentSchema.virtual('amountYuan').get(function() {
  return (this.amount / 100).toFixed(2);
});

// 索引优化查询
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ 'provider.stripe.subscriptionId': 1 });
paymentSchema.index({ 'provider.alipay.tradeNo': 1 });

// 静态方法：获取用户支付历史
paymentSchema.statics.getUserPayments = function(userId, options = {}) {
  const query = { userId };
  if (options.status) query.status = options.status;
  if (options.type) query.type = options.type;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

// 静态方法：获取收入统计
paymentSchema.statics.getRevenueStats = async function(startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        status: 'completed',
        paidAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$subscription.plan',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  return stats;
};

module.exports = mongoose.model('Payment', paymentSchema);
