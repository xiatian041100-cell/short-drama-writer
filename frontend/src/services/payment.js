import api from './api';

export const paymentService = {
  // 创建结账会话
  async createCheckoutSession(plan, interval) {
    const response = await api.post('/payment/create-checkout-session', {
      plan,
      interval
    });
    return response.data;
  },

  // 获取客户门户链接（管理订阅）
  async getCustomerPortal() {
    const response = await api.post('/payment/customer-portal');
    return response.data;
  },

  // 取消订阅
  async cancelSubscription() {
    const response = await api.post('/payment/cancel-subscription');
    return response.data;
  },

  // 恢复订阅
  async resumeSubscription() {
    const response = await api.post('/payment/resume-subscription');
    return response.data;
  },

  // 获取支付历史
  async getPaymentHistory(limit = 20) {
    const response = await api.get(`/payment/history?limit=${limit}`);
    return response.data;
  },

  // 验证支付状态
  async verifyPayment(sessionId) {
    const response = await api.get(`/payment/verify/${sessionId}`);
    return response.data;
  },

  // 获取订阅状态
  async getSubscriptionStatus() {
    const response = await api.get('/payment/subscription-status');
    return response.data;
  }
};
