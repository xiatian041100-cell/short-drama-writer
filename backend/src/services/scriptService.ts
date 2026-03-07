import { PrismaClient } from '@prisma/client';
import { generateFullScript, GenerationProgress } from './aiService';
import { deductCredits } from './authService';
import { config } from '../config';
import { sendProgress } from './websocketService';

const prisma = new PrismaClient();

export interface CreateScriptInput {
  userId: string;
  prompt: string;
  genre?: string;
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
  generateScriptContent(script.id, userId, prompt, genre).catch(console.error);

  return script;
}

/**
 * 生成剧本内容
 */
async function generateScriptContent(
  scriptId: string,
  userId: string,
  prompt: string,
  genre?: string
) {
  try {
    const result = await generateFullScript(prompt, {
      genre,
      onProgress: (progress: GenerationProgress) => {
        // 通过 WebSocket 发送进度
        sendProgress(userId, {
          type: 'progress',
          scriptId,
          stage: progress.stage,
          progress: progress.progress,
          message: progress.message,
        });
      },
    });

    // 更新剧本记录
    await prisma.script.update({
      where: { id: scriptId },
      data: {
        title: result.title,
        outline: JSON.stringify(result.outline),
        characters: JSON.stringify(result.characters),
        episodes: JSON.stringify(result.episodes),
        assets: JSON.stringify(result.assets),
        status: 'COMPLETED',
      },
    });

    // 发送完成消息
    sendProgress(userId, {
      type: 'complete',
      scriptId,
      stage: 'complete',
      progress: 100,
      message: '剧本生成完成！',
      data: { title: result.title },
    });

  } catch (error: any) {
    console.error('Script generation failed:', error);
    
    // 更新为失败状态
    await prisma.script.update({
      where: { id: scriptId },
      data: {
        status: 'FAILED',
      },
    });

    // 发送错误消息
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
