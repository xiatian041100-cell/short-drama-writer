import OpenAI from 'openai';
import { config } from '../config';
import { getEncryptedPrompt } from '../prompts/scriptAgent';
import { encryptToString } from '../utils/encryption';

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
  baseURL: config.openai.baseUrl,
});

export interface GenerationProgress {
  stage: string;
  progress: number;
  message: string;
}

export interface ScriptGenerationResult {
  title: string;
  genre: string;
  outline: {
    philosophy: string;
    oneCard: string;
    worldBuilding: string;
  };
  characters: Array<{
    id: string;
    name: string;
    age: string;
    gender: string;
    role: string;
    personality: string[];
    visualGenes: {
      primaryColor: string;
      contrastColor: string;
      materials: string[];
      lighting: string;
      style: string;
      signature: string;
    };
  }>;
  episodes: Array<{
    episodeNumber: number;
    title: string;
    scenes: Array<{
      sceneNumber: string;
      time: string;
      location: string;
      characters: string[];
      props: string[];
      content: string;
      climax: string;
      hook: string;
    }>;
    isPaywall: boolean;
    paywallType?: string;
  }>;
  assets: Array<{
    type: 'character' | 'scene' | 'prop';
    name: string;
    episodeRef: number;
    prompt: string;
    parameters: string;
  }>;
}

/**
 * 生成剧本大纲
 */
export async function generateOutline(
  userPrompt: string,
  genre?: string
): Promise<Partial<ScriptGenerationResult>> {
  const systemPrompt = getEncryptedPrompt();
  
  const response = await openai.chat.completions.create({
    model: config.openai.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `用户创意：${userPrompt}\n${genre ? `偏好类型：${genre}` : ''}\n\n请生成剧本的哲学内核、一卡亮点和世界观设定。以JSON格式返回。`
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.8,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Failed to generate outline');

  return JSON.parse(content);
}

/**
 * 生成人物设定
 */
export async function generateCharacters(
  userPrompt: string,
  outline: any
): Promise<Partial<ScriptGenerationResult>> {
  const systemPrompt = getEncryptedPrompt();
  
  const response = await openai.chat.completions.create({
    model: config.openai.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `剧本大纲：${JSON.stringify(outline)}\n\n请生成完整的人物系统，包括主要角色（3-6人）的详细档案和视觉基因。以JSON格式返回。`
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.8,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Failed to generate characters');

  return JSON.parse(content);
}

/**
 * 生成80集分集大纲
 */
export async function generateEpisodes(
  outline: any,
  characters: any[],
  onProgress?: (progress: GenerationProgress) => void
): Promise<Partial<ScriptGenerationResult>> {
  const systemPrompt = getEncryptedPrompt();
  const episodes: any[] = [];
  
  // 分批生成，每批10集
  const batchSize = 10;
  const totalBatches = 8;
  
  for (let batch = 0; batch < totalBatches; batch++) {
    const startEp = batch * batchSize + 1;
    const endEp = Math.min((batch + 1) * batchSize, 80);
    
    onProgress?.({
      stage: 'episodes',
      progress: (batch / totalBatches) * 100,
      message: `正在生成第${startEp}-${endEp}集...`,
    });

    const response = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `世界观：${JSON.stringify(outline)}\n人物：${JSON.stringify(characters)}\n\n请生成第${startEp}-${endEp}集的分集大纲，每集包含：集号、标题、核心事件、反转点、集末钩子、是否付费卡点。以JSON格式返回。`
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      const batchEpisodes = JSON.parse(content);
      episodes.push(...(batchEpisodes.episodes || []));
    }
  }

  return { episodes };
}

/**
 * 生成关键集数详细剧本
 */
export async function generateDetailedScript(
  episodeNumber: number,
  episodeOutline: any,
  characters: any[]
): Promise<string> {
  const systemPrompt = getEncryptedPrompt();
  
  const response = await openai.chat.completions.create({
    model: config.openai.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `第${episodeNumber}集大纲：${JSON.stringify(episodeOutline)}\n人物：${JSON.stringify(characters)}\n\n请生成这一集的完整剧本，严格遵循竖屏短剧格式规范。`
      },
    ],
    temperature: 0.8,
  });

  return response.choices[0]?.message?.content || '';
}

/**
 * 生成Midjourney提示词资产
 */
export async function generateAssets(
  characters: any[],
  episodes: any[]
): Promise<Partial<ScriptGenerationResult>> {
  const systemPrompt = getEncryptedPrompt();
  
  const response = await openai.chat.completions.create({
    model: config.openai.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `人物：${JSON.stringify(characters)}\n关键集数：${JSON.stringify(episodes.slice(0, 10))}\n\n请生成Midjourney提示词资产包，包括：角色立绘、关键场景、重要道具。每项都要符合六项视觉强制标准。以JSON格式返回。`
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Failed to generate assets');

  return JSON.parse(content);
}

/**
 * 完整的剧本生成流程
 */
export async function generateFullScript(
  userPrompt: string,
  options: {
    genre?: string;
    onProgress?: (progress: GenerationProgress) => void;
  }
): Promise<ScriptGenerationResult> {
  const { genre, onProgress } = options;
  
  // 1. 生成大纲
  onProgress?.({ stage: 'outline', progress: 0, message: '正在构思剧本核心...' });
  const outlineResult = await generateOutline(userPrompt, genre);
  
  // 2. 生成人物
  onProgress?.({ stage: 'characters', progress: 20, message: '正在创建角色...' });
  const charactersResult = await generateCharacters(userPrompt, outlineResult);
  
  // 3. 生成80集大纲
  onProgress?.({ stage: 'episodes', progress: 40, message: '正在构建80集故事线...' });
  const episodesResult = await generateEpisodes(
    outlineResult,
    charactersResult.characters || [],
    onProgress
  );
  
  // 4. 生成资产
  onProgress?.({ stage: 'assets', progress: 90, message: '正在生成视觉资产...' });
  const assetsResult = await generateAssets(
    charactersResult.characters || [],
    episodesResult.episodes || []
  );
  
  onProgress?.({ stage: 'complete', progress: 100, message: '剧本生成完成！' });
  
  return {
    title: outlineResult.title || '未命名剧本',
    genre: genre || '爽剧',
    outline: outlineResult.outline as any,
    characters: charactersResult.characters || [],
    episodes: episodesResult.episodes || [],
    assets: assetsResult.assets || [],
  };
}