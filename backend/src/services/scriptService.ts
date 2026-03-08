import { PrismaClient } from '@prisma/client';
import { generateFullScript, GenerationProgress } from './aiService';
import { deductCredits, refundCredits } from './authService';
import { config } from '../config';
import { sendProgress } from './websocketService';

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
  generateScriptContent(script.id, userId, prompt, genre).catch(console.error);

  return script;
}

/**
 * 重试生成失败的剧本
 */
export async function retryScript(
  input: RetryScriptInput
) {
  const { userId, scriptId } = input;

  // 获取原剧本信息
  const script = await prisma.script.findFirst({
    where: { id: scriptId, userId },
  });

  if (!script) {
    throw new Error('剧本不存在');
  }

  if (script.status !== 'FAILED') {
    throw new Error('只有生成失败的剧本可以重试');
  }

  // 检查重试次数限制
  const maxRetries = 3;
  if ((script.retryCount || 0) >= maxRetries) {
    throw new Error(`已达到最大重试次数 (${maxRetries}次)，请创建新剧本`);
  }

  // 更新剧本状态为重试中
  await prisma.script.update({
    where: { id: scriptId },
    data: {
      status: 'GENERATING',
      retryCount: { increment: 1 },
      title: '生成中...',
    },
  });

  // 发送开始重试消息
  sendProgress(userId, {
    type: 'progress',
    scriptId,
    stage: 'outline',
    progress: 0,
    message: `开始第 ${(script.retryCount || 0) + 1} 次重试...`,
  });

  // 异步重新生成剧本
  generateScriptContent(scriptId, userId, script.prompt, script.genre).catch(console.error);

  return { scriptId, message: '重试已开始' };
}

/**
 * 生成剧本内容（带重试机制）
 */
async function generateScriptContent(
  scriptId: string,
  userId: string,
  prompt: string,
  genre?: string,
  maxRetries: number = 2
) {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // 如果不是第一次尝试，发送重试消息
      if (attempt > 0) {
        sendProgress(userId, {
          type: 'progress',
          scriptId,
          stage: 'outline',
          progress: 0,
          message: `第 ${attempt + 1} 次尝试生成...`,
        });
      }

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

      return; // 成功，退出重试循环

    } catch (error: any) {
      lastError = error;
      console.error(`Script generation attempt ${attempt + 1} failed:`, error);
      
      // 如果不是最后一次尝试，等待后重试
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 指数退避: 1s, 2s
        
        sendProgress(userId, {
          type: 'progress',
          scriptId,
          stage: 'retry',
          progress: 0,
          message: `生成失败，${delay / 1000}秒后重试...`,
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // 所有重试都失败了
  console.error('All retry attempts failed:', lastError);
  
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
    message: lastError?.message || '生成失败，已尝试多次',
  });
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
