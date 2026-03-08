import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface UpdateEpisodeInput {
  userId: string;
  scriptId: string;
  episodeNumber: number;
  title?: string;
  scenes?: Array<{
    sceneNumber: string;
    time: string;
    location: string;
    characters: string[];
    props: string[];
    content: string;
    climax?: string;
    hook?: string;
  }>;
}

export interface UpdateScriptTitleInput {
  userId: string;
  scriptId: string;
  title: string;
}

export interface UpdateCharacterInput {
  userId: string;
  scriptId: string;
  characterId: string;
  name?: string;
  age?: string;
  gender?: string;
  role?: string;
  personality?: string[];
}

/**
 * 更新剧本标题
 */
export async function updateScriptTitle(input: UpdateScriptTitleInput) {
  const { userId, scriptId, title } = input;

  const script = await prisma.script.findFirst({
    where: { id: scriptId, userId },
  });

  if (!script) {
    throw new Error('剧本不存在');
  }

  if (script.status !== 'COMPLETED') {
    throw new Error('只有已完成的剧本可以编辑');
  }

  const updatedScript = await prisma.script.update({
    where: { id: scriptId },
    data: { title },
  });

  return updatedScript;
}

/**
 * 更新单集内容
 */
export async function updateEpisode(input: UpdateEpisodeInput) {
  const { userId, scriptId, episodeNumber, title, scenes } = input;

  const script = await prisma.script.findFirst({
    where: { id: scriptId, userId },
  });

  if (!script) {
    throw new Error('剧本不存在');
  }

  if (script.status !== 'COMPLETED') {
    throw new Error('只有已完成的剧本可以编辑');
  }

  // 解析现有剧集
  const episodes = JSON.parse(script.episodes || '[]');
  const episodeIndex = episodes.findIndex(
    (ep: any) => ep.episodeNumber === episodeNumber
  );

  if (episodeIndex === -1) {
    throw new Error('集数不存在');
  }

  // 更新剧集
  if (title) {
    episodes[episodeIndex].title = title;
  }
  if (scenes) {
    episodes[episodeIndex].scenes = scenes;
  }

  // 保存更新
  const updatedScript = await prisma.script.update({
    where: { id: scriptId },
    data: { episodes: JSON.stringify(episodes) },
  });

  return {
    ...updatedScript,
    episodes,
  };
}

/**
 * 更新角色信息
 */
export async function updateCharacter(input: UpdateCharacterInput) {
  const { userId, scriptId, characterId, ...updates } = input;

  const script = await prisma.script.findFirst({
    where: { id: scriptId, userId },
  });

  if (!script) {
    throw new Error('剧本不存在');
  }

  if (script.status !== 'COMPLETED') {
    throw new Error('只有已完成的剧本可以编辑');
  }

  // 解析现有角色
  const characters = JSON.parse(script.characters || '[]');
  const characterIndex = characters.findIndex(
    (char: any) => char.id === characterId
  );

  if (characterIndex === -1) {
    throw new Error('角色不存在');
  }

  // 更新角色
  Object.keys(updates).forEach((key) => {
    if (updates[key as keyof typeof updates] !== undefined) {
      characters[characterIndex][key] = updates[key as keyof typeof updates];
    }
  });

  // 保存更新
  const updatedScript = await prisma.script.update({
    where: { id: scriptId },
    data: { characters: JSON.stringify(characters) },
  });

  return {
    ...updatedScript,
    characters,
  };
}

/**
 * 重新生成单集（使用 AI）
 */
export async function regenerateEpisode(
  userId: string,
  scriptId: string,
  episodeNumber: number
) {
  const script = await prisma.script.findFirst({
    where: { id: scriptId, userId },
  });

  if (!script) {
    throw new Error('剧本不存在');
  }

  if (script.status !== 'COMPLETED') {
    throw new Error('只有已完成的剧本可以重新生成单集');
  }

  // TODO: 调用 AI 服务重新生成单集
  // 这里需要集成 aiService 中的生成逻辑
  
  throw new Error('重新生成功能开发中');
}
