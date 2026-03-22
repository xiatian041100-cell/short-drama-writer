const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const Payment = require('../models/Payment');

class StripeService {
  // 价格配置（对应新商业模式）
 static PRICES = {
    standard: {
      month: process.env.STRIPE_PRICE_STANDARD_MONTH,
      year: process.env.STRIPE_PRICE_STANDARD_YEAR
    },
    pro: {
      month: process.env.STRIPE_PRICE_PRO_MONTH,
      year: process.env.STRIPE_PRICE_PRO_YEAR
    }
  };

  // 创建 Stripe Customer
  static async createCustomer(user) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.username,
      metadata: {
        userId: user._id.toString()
      }
    });

    user.subscription.stripeCustomerId = customer.id;
    await user.save();

    return customer;
  }

  // 创建订阅结账会话
  static async createCheckoutSession(user, plan, interval, successUrl, cancelUrl) {
    // 确保用户有 Stripe Customer
    if (!user.subscription.stripeCustomerId) {
      await this.createCustomer(user);
    }

    const priceId = this.PRICES[plan]?.[interval];
    if (!priceId) {
      throw new Error('Invalid plan or interval');
    }

    const session = await stripe.checkout.sessions.create({
      customer: user.subscription.stripeCustomerId,
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user._id.toString(),
        plan,
        interval
      },
      subscription_data: {
        metadata: {
          userId: user._id.toString(),
          plan
        }
      }
    });

    // 创建待支付记录
    await Payment.create({
      userId: user._id,
      type: 'stripe',
      amount: 0, // 将在webhook中更新
      currency: 'CNY',
      status: 'pending',
      subscription: { plan, interval },
      description: `订阅 ${plan} 计划 (${interval})`,
      metadata: {
        checkoutSessionId: session.id
      }
    });

    return session;
  }

  // 创建客户门户会话（管理订阅）
  static async createPortalSession(user, returnUrl) {
    if (!user.subscription.stripeCustomerId) {
      throw new Error('No Stripe customer found');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.subscription.stripeCustomerId,
      return_url: returnUrl
    });

    return session;
  }

  // 取消订阅
  static async cancelSubscription(user) {
    if (!user.subscription.stripeSubscriptionId) {
      throw new Error('No active subscription');
    }

    // 设置到期取消（而不是立即取消）
    await stripe.subscriptions.update(
      user.subscription.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    user.subscription.cancelAtPeriodEnd = true;
    await user.save();

    return { success: true };
  }

  // 恢复订阅
  static async resumeSubscription(user) {
    if (!user.subscription.stripeSubscriptionId) {
      throw new Error('No subscription to resume');
    }

    await stripe.subscriptions.update(
      user.subscription.stripeSubscriptionId,
      { cancel_at_period_end: false }
    );

    user.subscription.cancelAtPeriodEnd = false;
    await user.save();

    return { success: true };
  }

  // 处理 Webhook 事件
  static async handleWebhookEvent(event) {
    console.log(`Processing Stripe webhook: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;

      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;
    }

    return { received: true };
  }

  // 处理结账完成
  static async handleCheckoutCompleted(session) {
    const { userId, plan, interval } = session.metadata;
    
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found:', userId);
      return;
    }

    // 获取订阅详情
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    
    // 更新用户订阅信息
    user.subscription.plan = plan;
    user.subscription.status = 'active';
    user.subscription.stripeSubscriptionId = subscription.id;
    user.subscription.currentPeriodStart = new Date(subscription.current_period_start * 1000);
    user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    user.subscription.cancelAtPeriodEnd = subscription.cancel_at_period_end;
    
    await user.save();

    // 更新支付记录
    await Payment.findOneAndUpdate(
      { 'metadata.checkoutSessionId': session.id },
      {
        status: 'completed',
        paidAt: new Date(),
        'provider.stripe.subscriptionId': subscription.id,
        'provider.stripe.customerId': session.customer
      }
    );

    console.log(`Subscription activated for user ${userId}: ${plan}`);
  }

  // 处理发票支付成功
  static async handleInvoicePaymentSucceeded(invoice) {
    const subscriptionId = invoice.subscription;
    
    // 查找用户
    const user = await User.findOne({
      'subscription.stripeSubscriptionId': subscriptionId
    });

    if (!user) {
      console.error('User not found for subscription:', subscriptionId);
      return;
    }

    // 获取订阅详情更新周期
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    user.subscription.currentPeriodStart = new Date(subscription.current_period_start * 1000);
    user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    await user.save();

    // 创建支付记录
    await Payment.create({
      userId: user._id,
      type: 'stripe',
      amount: invoice.amount_paid,
      currency: invoice.currency.toUpperCase(),
      status: 'completed',
      subscription: {
        plan: user.subscription.plan,
        interval: invoice.lines.data[0]?.plan?.interval || 'month'
      },
      description: `订阅续费 - ${user.subscription.plan}`,
      paidAt: new Date(),
      provider: {
        stripe: {
          subscriptionId,
          invoiceId: invoice.id,
          chargeId: invoice.charge
        }
      }
    });

    console.log(`Payment recorded for user ${user._id}: ${invoice.amount_paid}`);
  }

  // 处理支付失败
  static async handleInvoicePaymentFailed(invoice) {
    const subscriptionId = invoice.subscription;
    
    const user = await User.findOne({
      'subscription.stripeSubscriptionId': subscriptionId
    });

    if (user) {
      user.subscription.status = 'past_due';
      await user.save();

      // TODO: 发送支付失败通知邮件
    }
  }

  // 处理订阅删除
  static async handleSubscriptionDeleted(subscription) {
    const user = await User.findOne({
      'subscription.stripeSubscriptionId': subscription.id
    });

    if (user) {
      user.subscription.plan = 'free';
      user.subscription.status = 'canceled';
      user.subscription.stripeSubscriptionId = null;
      user.subscription.currentPeriodEnd = null;
      await user.save();

      console.log(`Subscription canceled for user ${user._id}`);
    }
  }

  // 处理订阅更新
  static async handleSubscriptionUpdated(subscription) {
    const user = await User.findOne({
      'subscription.stripeSubscriptionId': subscription.id
    });

    if (user) {
      user.subscription.cancelAtPeriodEnd = subscription.cancel_at_period_end;
      user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      await user.save();
    }
  }
}

module.exports = StripeService;
