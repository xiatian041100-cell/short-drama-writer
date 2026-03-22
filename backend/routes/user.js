const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// 获取用户使用统计
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    // 确保使用次数已重置
    user.checkAndResetDailyUsage();
    await user.save();
    
    const limits = user.getPlanLimits();
    
    res.json({
      success: true,
      data: {
        plan: user.subscription.plan,
        status: user.subscription.status,
        currentPeriodEnd: user.subscription.currentPeriodEnd,
        cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
        usage: {
          daily: {
            used: user.usage.dailyGenerations,
            limit: limits.dailyGenerations,
            remaining: limits.dailyGenerations === Infinity 
              ? 'unlimited' 
              : Math.max(0, limits.dailyGenerations - user.usage.dailyGenerations),
            percentage: limits.dailyGenerations === Infinity 
              ? 0 
              : Math.round((user.usage.dailyGenerations / limits.dailyGenerations) * 100)
          },
          total: user.usage.totalGenerations,
          monthly: user.usage.monthlyGenerations
        },
        features: limits.features,
        lastResetDate: user.usage.lastResetDate
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: { message: '获取使用统计失败' }
    });
  }
});

// 获取用户个人资料
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const limits = user.getPlanLimits();
    
    res.json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        subscription: {
          plan: user.subscription.plan,
          status: user.subscription.status,
          currentPeriodEnd: user.subscription.currentPeriodEnd,
          cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd
        },
        usage: {
          dailyGenerations: user.usage.dailyGenerations,
          totalGenerations: user.usage.totalGenerations,
          dailyLimit: limits.dailyGenerations
        },
        referral: {
          code: user.referral.code,
          inviteCount: user.referral.inviteCount,
          rewardBalance: user.referral.rewardBalance
        },
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: { message: '获取个人资料失败' }
    });
  }
});

// 更新用户个人资料
router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, avatar } = req.body;
    
    // 验证用户名
    if (username) {
      if (username.length < 3 || username.length > 20) {
        return res.status(400).json({
          success: false,
          error: { message: '用户名长度必须在3-20个字符之间' }
        });
      }
      
      // 检查用户名是否已被使用
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: req.user._id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: { message: '用户名已被使用' }
        });
      }
      
      req.user.username = username;
    }
    
    if (avatar) {
      req.user.avatar = avatar;
    }
    
    await req.user.save();
    
    res.json({
      success: true,
      data: {
        username: req.user.username,
        avatar: req.user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: { message: '更新个人资料失败' }
    });
  }
});

// 获取推荐信息
router.get('/referral', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    // 如果没有推荐码，生成一个
    if (!user.referral.code) {
      const crypto = require('crypto');
      user.referral.code = crypto.randomBytes(3).toString('hex').toUpperCase();
      await user.save();
    }
    
    res.json({
      success: true,
      data: {
        code: user.referral.code,
        inviteCount: user.referral.inviteCount,
        rewardBalance: user.referral.rewardBalance,
        totalRewardEarned: user.referral.totalRewardEarned,
        referralLink: `${process.env.FRONTEND_URL}/register?ref=${user.referral.code}`
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: { message: '获取推荐信息失败' }
    });
  }
});

// 使用推荐码
router.post('/referral/apply', authMiddleware, async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: { message: '请输入推荐码' }
      });
    }
    
    // 不能推荐自己
    if (code === req.user.referral.code) {
      return res.status(400).json({
        success: false,
        error: { message: '不能使用自己的推荐码' }
      });
    }
    
    // 检查是否已经被邀请过
    if (req.user.referral.invitedBy) {
      return res.status(400).json({
        success: false,
        error: { message: '你已经使用过推荐码了' }
      });
    }
    
    // 查找推荐人
    const referrer = await User.findOne({ 'referral.code': code });
    if (!referrer) {
      return res.status(404).json({
        success: false,
        error: { message: '推荐码无效' }
      });
    }
    
    // 建立推荐关系
    req.user.referral.invitedBy = referrer._id;
    
    // 给新用户奖励（3天标准版）
    req.user.subscription.plan = 'standard';
    req.user.subscription.status = 'active';
    req.user.subscription.currentPeriodEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    
    await req.user.save();
    
    // 给推荐人奖励
    referrer.referral.inviteCount += 1;
    referrer.referral.rewardBalance += 10; // 奖励10元
    referrer.referral.totalRewardEarned += 10;
    await referrer.save();
    
    res.json({
      success: true,
      data: {
        message: '推荐码使用成功！你获得了3天标准版会员',
        reward: {
          plan: 'standard',
          days: 3
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: { message: '使用推荐码失败' }
    });
  }
});

module.exports = router;
