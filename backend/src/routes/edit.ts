import { Router } from 'express';
import { 
  updateScriptTitle, 
  updateEpisode, 
  updateCharacter,
  regenerateEpisode 
} from '../services/editService';
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
 * 更新剧本标题
 * PUT /api/scripts/:id/title
 */
router.put('/:id/title', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { title } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: '标题不能为空' });
    }

    const script = await updateScriptTitle({ userId, scriptId: id, title });
    res.json({ script });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * 更新单集内容
 * PUT /api/scripts/:id/episodes/:episodeNumber
 */
router.put('/:id/episodes/:episodeNumber', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { id, episodeNumber } = req.params;
    const { title, scenes } = req.body;

    const script = await updateEpisode({
      userId,
      scriptId: id,
      episodeNumber: parseInt(episodeNumber),
      title,
      scenes,
    });
    res.json({ script });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * 更新角色信息
 * PUT /api/scripts/:id/characters/:characterId
 */
router.put('/:id/characters/:characterId', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { id, characterId } = req.params;
    const updates = req.body;

    const script = await updateCharacter({
      userId,
      scriptId: id,
      characterId,
      ...updates,
    });
    res.json({ script });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * 重新生成单集（AI）
 * POST /api/scripts/:id/episodes/:episodeNumber/regenerate
 */
router.post('/:id/episodes/:episodeNumber/regenerate', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { id, episodeNumber } = req.params;

    const script = await regenerateEpisode(
      userId,
      id,
      parseInt(episodeNumber)
    );
    res.json({ script });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
