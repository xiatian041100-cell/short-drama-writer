import { Router, Request, Response } from 'express';
import { authenticateToken } from '../services/authService';
import { getScriptDetail } from '../services/scriptService';
import { 
  exportToMarkdown, 
  exportToText, 
  exportToJSON, 
  exportToWord,
  exportEpisodesToCSV 
} from '../utils/exportUtils';

const router = Router();

/**
 * 导出剧本
 * GET /api/scripts/:id/export?format=markdown|text|json|word|csv
 */
router.get('/:id/export', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const format = (req.query.format as string) || 'markdown';
    const userId = (req as any).userId;

    // 获取剧本详情
    const script = await getScriptDetail(userId, id);

    if (!script) {
      return res.status(404).json({ error: '剧本不存在' });
    }

    if (script.status !== 'COMPLETED') {
      return res.status(400).json({ error: '剧本尚未生成完成' });
    }

    // 解析剧本数据
    const scriptData = {
      title: script.title,
      genre: script.genre,
      outline: script.outline,
      characters: script.characters || [],
      episodes: script.episodes || [],
      assets: script.assets || [],
    };

    let content: string;
    let filename: string;
    let contentType: string;

    switch (format) {
      case 'markdown':
      case 'md':
        content = exportToMarkdown(scriptData as any);
        filename = `${script.title}.md`;
        contentType = 'text/markdown; charset=utf-8';
        break;

      case 'text':
      case 'txt':
        content = exportToText(scriptData as any);
        filename = `${script.title}.txt`;
        contentType = 'text/plain; charset=utf-8';
        break;

      case 'json':
        content = exportToJSON(scriptData as any);
        filename = `${script.title}.json`;
        contentType = 'application/json; charset=utf-8';
        break;

      case 'word':
      case 'html':
        content = exportToWord(scriptData as any);
        filename = `${script.title}.html`;
        contentType = 'text/html; charset=utf-8';
        break;

      case 'csv':
        content = exportEpisodesToCSV(scriptData.episodes);
        filename = `${script.title}_episodes.csv`;
        contentType = 'text/csv; charset=utf-8';
        break;

      default:
        return res.status(400).json({ error: '不支持的导出格式' });
    }

    // 设置响应头
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    
    res.send(content);

  } catch (error: any) {
    console.error('Export error:', error);
    res.status(500).json({ 
      error: '导出失败',
      message: error.message 
    });
  }
});

export default router;
