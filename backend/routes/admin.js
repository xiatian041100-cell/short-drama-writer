const express = require('express');
const PromptVersion = require('../models/PromptVersion');
const EncryptionService = require('../services/encryptionService');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// 获取所有提示词版本（仅管理员）
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const versions = await PromptVersion.find()
      .sort({ createdAt: -1 })
      .select('-content -iv -authTag');
    res.json(versions);
  } catch (error) {
    res.status(500).json({ error: '获取版本失败' });
  }
});

// 创建新版本（仅管理员）
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { version, content } = req.body;
    
    // 加密内容
    const encrypted = EncryptionService.encrypt(content);
    
    const promptVersion = new PromptVersion({
      version,
      content: encrypted.encrypted,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      createdBy: req.user._id
    });
    
    await promptVersion.save();
    
    res.status(201).json({
      message: '版本创建成功',
      version: promptVersion.version
    });
  } catch (error) {
    res.status(500).json({ error: '创建版本失败' });
  }
});

// 激活指定版本（仅管理员）
router.put('/:id/activate', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // 先将所有版本设为非激活
    await PromptVersion.updateMany({}, { isActive: false });
    
    // 激活指定版本
    const version = await PromptVersion.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );
    
    if (!version) {
      return res.status(404).json({ error: '版本不存在' });
    }
    
    res.json({ message: '版本已激活' });
  } catch (error) {
    res.status(500).json({ error: '激活版本失败' });
  }
});

// 获取当前激活的提示词（内部使用）
router.get('/active', async (req, res) => {
  try {
    const activeVersion = await PromptVersion.findOne({ isActive: true });
    
    if (!activeVersion) {
      return res.status(404).json({ error: '没有激活的提示词版本' });
    }
    
    // 解密内容
    const decrypted = EncryptionService.decrypt({
      encrypted: activeVersion.content,
      iv: activeVersion.iv,
      authTag: activeVersion.authTag
    });
    
    res.json({
      version: activeVersion.version,
      content: decrypted
    });
  } catch (error) {
    res.status(500).json({ error: '获取提示词失败' });
  }
});

module.exports = router;