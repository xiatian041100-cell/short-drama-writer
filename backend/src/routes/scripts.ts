import { Router } from 'express';
import { createScript, getUserScripts, getScriptDetail, deleteScript, retryScript } from '../services/scriptService';
import { verifyToken } from '../services/authService';

const router = Router();

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
 * 创建剧本生成任务
 * POST /api/scripts
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { prompt, genre } = req.body;
    const userId = req.userId;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const script = await createScript({ userId, prompt, genre });
    res.json({ script });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * 获取用户的剧本列表
 * GET /api/scripts
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const scripts = await getUserScripts(userId);
    res.json({ scripts });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * 获取剧本详情
 * GET /api/scripts/:id
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const script = await getScriptDetail(userId, id);
    res.json({ script });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * 重试生成失败的剧本
 * POST /api/scripts/:id/retry
 */
router.post('/:id/retry', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const result = await retryScript({ userId, scriptId: id });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * 删除剧本
 * DELETE /api/scripts/:id
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    await deleteScript(userId, id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
