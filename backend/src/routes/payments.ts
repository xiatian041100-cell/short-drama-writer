import { Router } from 'express';
import { config } from '../config';
import { addCredits } from '../services/authService';
import { verifyToken } from '../services/authService';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// 认证中间件
const authenticate = (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

/**
 * 获取定价信息
 * GET /api/pricing
 */
router.get('/', async (req, res) => {
  res.json({
    creditPrice: config.pricing.creditPrice,
    scriptGenerationCost: config.pricing.scriptGenerationCost,
    membership: config.pricing.membership,
    membershipBenefits: config.pricing.membershipBenefits,
  });
});

/**
 * 创建充值订单
 * POST /api/payments/create
 */
router.post('/create', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { type, amount, credits } = req.body;

    // 创建支付记录
    const payment = await prisma.payment.create({
      data: {
        userId,
        type,
        amount,
        credits,
        status: 'PENDING',
      },
    });

    // TODO: 集成实际支付平台（支付宝/微信）
    // 这里返回模拟的支付链接
    res.json({
      payment,
      payUrl: `/api/payments/mock-pay/${payment.id}`,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * 模拟支付回调（开发测试用）
 * GET /api/payments/mock-pay/:id
 */
router.get('/mock-pay/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status === 'PAID') {
      return res.json({ message: 'Already paid' });
    }

    // 更新支付状态
    await prisma.payment.update({
      where: { id },
      data: {
        status: 'PAID',
        tradeNo: `MOCK_${Date.now()}`,
      },
    });

    // 增加用户积分
    await addCredits(payment.userId, payment.credits);

    res.json({ success: true, message: 'Payment successful' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * 获取用户支付记录
 * GET /api/payments/history
 */
router.get('/history', authenticate, async (req, res) => {
  try {
    const userId = req.userId;

    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ payments });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;