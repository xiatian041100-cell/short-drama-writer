const express = require('express');
const Script = require('../models/Script');
const AIService = require('../services/aiService');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// 获取用户的所有剧本
router.get('/', authMiddleware, async (req, res) => {
  try {
    const scripts = await Script.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('-content'); // 不返回完整内容，减少传输
    res.json(scripts);
  } catch (error) {
    res.status(500).json({ error: '获取剧本失败' });
  }
});

// 获取单个剧本
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const script = await Script.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!script) {
      return res.status(404).json({ error: '剧本不存在' });
    }
    
    res.json(script);
  } catch (error) {
    res.status(500).json({ error: '获取剧本失败' });
  }
});

// 创建新剧本（启动生成）
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { prompt, type, style, includeAssets } = req.body;
    
    // 检查用户权限和次数
    if (req.user.membership.type === 'free') {
      if (req.user.membership.dailyUsage >= 1) {
        return res.status(403).json({ 
          error: '今日生成次数已用完，请升级会员',
          code: 'DAILY_LIMIT_REACHED'
        });
      }
    } else if (req.user.membership.type === 'standard') {
      if (req.user.membership.dailyUsage >= 10) {
        return res.status(403).json({ 
          error: '今日生成次数已用完',
          code: 'DAILY_LIMIT_REACHED'
        });
      }
    }

    // 创建剧本记录
    const script = new Script({
      userId: req.user._id,
      title: prompt.slice(0, 30) + '...',
      prompt,
      type,
      style,
      status: 'generating'
    });
    
    await script.save();
    
    // 更新用户使用次数
    req.user.membership.dailyUsage += 1;
    await req.user.save();
    
    // 异步生成剧本（不等待完成）
    AIService.generateScript(script._id, prompt, type, style)
      .then(() => {
        console.log(`剧本 ${script._id} 生成完成`);
      })
      .catch((error) => {
        console.error(`剧本 ${script._id} 生成失败:`, error);
      });
    
    res.status(201).json({
      scriptId: script._id,
      status: 'generating',
      message: '剧本生成已启动，预计需要2-5分钟'
    });
  } catch (error) {
    console.error('创建剧本失败:', error);
    res.status(500).json({ error: '创建剧本失败' });
  }
});

// 检查剧本生成状态
router.get('/:id/status', authMiddleware, async (req, res) => {
  try {
    const script = await Script.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).select('status errorMessage updatedAt');
    
    if (!script) {
      return res.status(404).json({ error: '剧本不存在' });
    }
    
    res.json({
      status: script.status,
      errorMessage: script.errorMessage,
      updatedAt: script.updatedAt
    });
  } catch (error) {
    res.status(500).json({ error: '获取状态失败' });
  }
});

// 删除剧本
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const script = await Script.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!script) {
      return res.status(404).json({ error: '剧本不存在' });
    }
    
    res.json({ message: '剧本已删除' });
  } catch (error) {
    res.status(500).json({ error: '删除剧本失败' });
  }
});

module.exports = router;