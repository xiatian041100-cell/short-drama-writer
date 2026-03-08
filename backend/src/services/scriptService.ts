import { PrismaClient } from '@prisma/client';
import { generateFullScript, GenerationProgress } from './aiService';
import { deductCredits, refundCredits } from './authService';
import { config } from '../config';
import { sendProgress } from './websocketService';
import { 
  createAssetLibrary, 
  updateAssetLibrary,
  validateEpisodeAgainstAssets,
  AssetLibrary 
} from './assetLibraryService';

const prisma = new PrismaClient();

export interface CreateScriptInput {
  userId: string;
  prompt: string;
  genre?: string;
}

export interface RetryScriptInput {
  userId: string;
  scriptId: string;
}

/**
 * 创建剧本生成任务
 */
export async function createScript(
  input: CreateScriptInput
) {
  const { userId, prompt, genre } = input;

  // 检查用户积分
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // 检查会员权益
  const cost = config.pricing.scriptGenerationCost;
  let actualCost = cost;
  
  // 会员有免费生成额度
  const membershipBenefits = config.pricing.membershipBenefits[user.membershipType];
  const monthlyScripts = membershipBenefits?.monthlyScripts || 0;
  
  // 查询本月已生成的剧本数
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const scriptsThisMonth = await prisma.script.count({
    where: {
      userId,
      createdAt: { gte: startOfMonth },
      status: 'COMPLETED',
    },
  });

  // 如果在免费额度内，不扣积分
  if (scriptsThisMonth < monthlyScripts) {
    actualCost = 0;
  }

  // 扣除积分
  if (actualCost > 0) {
    await deductCredits(userId, actualCost);
  }

  // 创建剧本记录
  const script = await prisma.script.create({
    data: {
      userId,
      title: '生成中...',
      prompt,
      genre: genre || '爽剧',
      episodesCount: 80,
      status: 'GENERATING',
      creditsUsed: actualCost,
      retryCount: 0,
    },
  });

  // 发送开始生成消息
  sendProgress(userId, {
    type: 'progress',
    scriptId: script.id,
    stage: 'outline',
    progress: 0,
    message: '开始生成剧本...',
  });

  // 异步生成剧本
  generateScriptWithAssetLibrary(script.id, userId, prompt, genre).catch(console.error);

  return script;
}

/**
 * 使用资产库生成剧本
 */
async function generateScriptWithAssetLibrary(
  scriptId: string,
  userId: string,
  prompt: string,
  genre?: string
) {
  try {
    // 1. 生成大纲和资产库
    sendProgress(userId, {
      type: 'progress',
      scriptId,
      stage: 'outline',
      progress: 5,
      message: '正在构思剧本核心...',
    });

    // TODO: 调用 AI 生成大纲和资产库
    // 这里模拟生成资产库
    const assetLibrary: AssetLibrary = {
      scriptId,
      outline: {
        philosophy: '待生成...',
        oneCard: '待生成...',
        worldBuilding: '待生成...',
      },
      characters: [],
      scenes: [],
      props: [],
      locations: [],
      worldRules: [],
      themes: [],
    };

    // 创建资产库
    await createAssetLibrary(assetLibrary);

    // 2. 逐集生成并检查一致性
    const episodes: any[] = [];
    
    for (let epNum = 1; epNum <= 80; epNum++) {
      const progress = 10 + (epNum / 80) * 80;
      
      sendProgress(userId, {
        type: 'progress',
        scriptId,
        stage: 'episodes',
        progress,
        message: `正在生成第 ${epNum}/80 集...`,
      });

      // TODO: 调用 AI 生成单集
      // 生成后验证一致性
      const episode = {
        episodeNumber: epNum,
        title: `第${epNum}集`,
        scenes: [],
        isPaywall: epNum % 10 === 0,
      };

      // 验证一致性
      const validation = await validateEpisodeAgainstAssets(scriptId, episode);
      if (!validation.valid) {
        console.warn(`Episode ${epNum} validation warnings:`, validation.warnings);
        // 可以选择重新生成或标记警告
      }

      episodes.push(episode);

      // 每10集更新一次资产库
      if (epNum % 10 === 0) {
        await updateAssetLibrary(scriptId, {
          // 更新新增的场景、道具等
        });
      }
    }

    // 3. 生成视觉资产
    sendProgress(userId, {
      type: 'progress',
      scriptId,
      stage: 'assets',
      progress: 95,
      message: '正在生成视觉资产...',
    });

    // TODO: 生成 Midjourney 提示词

    // 4. 完成
    await prisma.script.update({
      where: { id: scriptId },
      data: {
        title: '生成的剧本标题', // TODO: 从大纲中获取
        outline: JSON.stringify(assetLibrary.outline),
        characters: JSON.stringify(assetLibrary.characters),
        episodes: JSON.stringify(episodes),
        assets: JSON.stringify([]), // TODO: 视觉资产
        status: 'COMPLETED',
      },
    });

    sendProgress(userId, {
      type: 'complete',
      scriptId,
      stage: 'complete',
      progress: 100,
      message: '剧本生成完成！',
      data: { title: '生成的剧本标题' },
    });

  } catch (error: any) {
    console.error('Script generation failed:', error);
    
    await prisma.script.update({
      where: { id: scriptId },
      data: {
        status: 'FAILED',
      },
    });

    sendProgress(userId, {
      type: 'error',
      scriptId,
      stage: 'error',
      progress: 0,
      message: error.message || '生成失败',
    });
  }
}

/**
 * 重试生成失败的剧本
 */
export async function retryScript(
  input: RetryScriptInput
) {
  const { userId, scriptId } = input;

  const script = await prisma.script.findFirst({
    where: { id: scriptId, userId },
  });

  if (!script) {
    throw new Error('剧本不存在');
  }

  if (script.status !== 'FAILED') {
    throw new Error('只有生成失败的剧本可以重试');
  }

  const maxRetries = 3;
  if ((script.retryCount || 0) >= maxRetries) {
    throw new Error(`已达到最大重试次数 (${maxRetries}次)，请创建新剧本`);
  }

  await prisma.script.update({
    where: { id: scriptId },
    data: {
      status: 'GENERATING',
      retryCount: { increment: 1 },
      title: '生成中...',
    },
  });

  sendProgress(userId, {
    type: 'progress',
    scriptId,
    stage: 'outline',
    progress: 0,
    message: `开始第 ${(script.retryCount || 0) + 1} 次重试...`,
  });

  generateScriptWithAssetLibrary(scriptId, userId, script.prompt, script.genre).catch(console.error);

  return { scriptId, message: '重试已开始' };
}

/**
 * 获取用户的剧本列表
 */
export async function getUserScripts(userId: string) {
  const scripts = await prisma.script.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      prompt: true,
      genre: true,
      episodesCount: true,
      status: true,
      creditsUsed: true,
      retryCount: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return scripts;
}

/**
 * 获取剧本详情
 */
export async function getScriptDetail(userId: string, scriptId: string) {
  const script = await prisma.script.findFirst({
    where: { id: scriptId, userId },
  });

  if (!script) {
    throw new Error('Script not found');
  }

  return {
    ...script,
    outline: script.outline ? JSON.parse(script.outline) : null,
    characters: script.characters ? JSON.parse(script.characters) : null,
    episodes: script.episodes ? JSON.parse(script.episodes) : null,
    assets: script.assets ? JSON.parse(script.assets) : null,
  };
}

/**
 * 删除剧本
 */
export async function deleteScript(userId: string, scriptId: string) {
  const script = await prisma.script.findFirst({
    where: { id: scriptId, userId },
  });

  if (!script) {
    throw new Error('Script not found');
  }

  await prisma.script.delete({
    where: { id: scriptId },
  });

  return true;
}
