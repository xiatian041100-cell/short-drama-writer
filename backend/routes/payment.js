const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const StripeService = require('../services/stripeService');
const { authMiddleware } = require('../middleware/auth');
const Payment = require('../models/Payment');

// 创建结账会话
router.post('/create-checkout-session', authMiddleware, async (req, res) => {
  try {
    const { plan, interval } = req.body;
    
    // 验证参数
    if (!['standard', 'pro'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }
    if (!['month', 'year'].includes(interval)) {
      return res.status(400).json({ error: 'Invalid interval' });
    }

    const successUrl = `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.FRONTEND_URL}/payment/cancel`;

    const session = await StripeService.createCheckoutSession(
      req.user,
      plan,
      interval,
      successUrl,
      cancelUrl
    );

    res.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ error: '创建支付会话失败' });
  }
});

// 获取客户门户链接（管理订阅）
router.post('/customer-portal', authMiddleware, async (req, res) => {
  try {
    const returnUrl = `${process.env.FRONTEND_URL}/dashboard/settings`;
    const session = await StripeService.createPortalSession(req.user, returnUrl);
    
    res.json({ url: session.url });
  } catch (error) {
    console.error('Portal session error:', error);
    res.status(500).json({ error: '创建管理门户失败' });
  }
});

// 取消订阅
router.post('/cancel-subscription', authMiddleware, async (req, res) => {
  try {
    await StripeService.cancelSubscription(req.user);
    res.json({ 
      success: true, 
      message: '订阅将在当前周期结束后取消'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: '取消订阅失败' });
  }
});

// 恢复订阅
router.post('/resume-subscription', authMiddleware, async (req, res) => {
  try {
    await StripeService.resumeSubscription(req.user);
    res.json({ 
      success: true, 
      message: '订阅已恢复'
    });
  } catch (error) {
    console.error('Resume subscription error:', error);
    res.status(500).json({ error: '恢复订阅失败' });
  }
});

// 获取支付历史
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const payments = await Payment.getUserPayments(req.user._id, {
      limit: parseInt(req.query.limit) || 20
    });
    
    res.json(payments);
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: '获取支付历史失败' });
  }
});

// 验证支付状态
router.get('/verify/:sessionId', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.customer !== req.user.subscription.stripeCustomerId) {
      return res.status(403).json({ error: '无权查看此会话' });
    }

    res.json({
      status: session.payment_status,
      plan: session.metadata?.plan,
      interval: session.metadata?.interval
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: '验证支付状态失败' });
  }
});

// Stripe Webhook（处理支付事件）
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await StripeService.handleWebhookEvent(event);
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).json({ error: '处理webhook失败' });
  }
});

// 获取订阅状态
router.get('/subscription-status', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const limits = user.getPlanLimits();
    
    res.json({
      plan: user.subscription.plan,
      status: user.subscription.status,
      currentPeriodEnd: user.subscription.currentPeriodEnd,
      cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
      limits,
      usage: {
        daily: user.usage.dailyGenerations,
        total: user.usage.totalGenerations,
        monthly: user.usage.monthlyGenerations
      }
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ error: '获取订阅状态失败' });
  }
});

module.exports = router;
