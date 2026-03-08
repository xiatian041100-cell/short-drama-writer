import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 资产库类型定义
export interface AssetLibrary {
  scriptId: string;
  outline: {
    philosophy: string;
    oneCard: string;
    worldBuilding: string;
  };
  characters: Character[];
  scenes: Scene[];
  props: Prop[];
  locations: Location[];
  worldRules: WorldRule[];
  themes: Theme[];
}

export interface Character {
  id: string;
  name: string;
  aliases?: string[];
  age: string;
  gender: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  personality: string[];
  background: string;
  goals: string[];
  fears: string[];
  relationships: Relationship[];
  visualGenes: {
    primaryColor: string;
    contrastColor: string;
    materials: string[];
    lighting: string;
    style: string;
    signature: string;
  };
  characterArc: string;
  keyScenes: number[]; // 出现的关键集数
}

export interface Relationship {
  characterId: string;
  characterName: string;
  type: string; // 父子、恋人、仇敌等
  description: string;
}

export interface Scene {
  id: string;
  name: string;
  description: string;
  locationId: string;
  significance: string;
  firstAppearance: number; // 首次出现的集数
  keyEvents: string[];
}

export interface Prop {
  id: string;
  name: string;
  description: string;
  significance: string;
  owner?: string; // 角色ID
  firstAppearance: number;
  category: 'weapon' | 'treasure' | 'tool' | 'symbol' | 'other';
}

export interface Location {
  id: string;
  name: string;
  description: string;
  type: 'indoor' | 'outdoor' | 'virtual';
  significance: string;
  connectedLocations: string[]; // 关联地点ID
  visualStyle: string;
}

export interface WorldRule {
  id: string;
  name: string;
  description: string;
  category: 'magic' | 'technology' | 'social' | 'physical' | 'other';
  importance: 'critical' | 'important' | 'minor';
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  expression: string; // 如何在剧情中体现
}

export interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

/**
 * 创建资产库
 */
export async function createAssetLibrary(library: AssetLibrary) {
  return await prisma.assetLibrary.create({
    data: {
      scriptId: library.scriptId,
      outline: JSON.stringify(library.outline),
      characters: JSON.stringify(library.characters),
      scenes: JSON.stringify(library.scenes),
      props: JSON.stringify(library.props),
      locations: JSON.stringify(library.locations),
      worldRules: JSON.stringify(library.worldRules),
      themes: JSON.stringify(library.themes),
    },
  });
}

/**
 * 获取资产库
 */
export async function getAssetLibrary(scriptId: string) {
  const library = await prisma.assetLibrary.findUnique({
    where: { scriptId },
  });

  if (!library) return null;

  return {
    scriptId: library.scriptId,
    outline: JSON.parse(library.outline),
    characters: JSON.parse(library.characters),
    scenes: JSON.parse(library.scenes),
    props: JSON.parse(library.props),
    locations: JSON.parse(library.locations),
    worldRules: JSON.parse(library.worldRules),
    themes: JSON.parse(library.themes),
  } as AssetLibrary;
}

/**
 * 更新资产库
 */
export async function updateAssetLibrary(
  scriptId: string,
  updates: Partial<AssetLibrary>
) {
  const existing = await prisma.assetLibrary.findUnique({
    where: { scriptId },
  });

  if (!existing) {
    throw new Error('资产库不存在');
  }

  const updateData: any = {};
  if (updates.outline) updateData.outline = JSON.stringify(updates.outline);
  if (updates.characters) updateData.characters = JSON.stringify(updates.characters);
  if (updates.scenes) updateData.scenes = JSON.stringify(updates.scenes);
  if (updates.props) updateData.props = JSON.stringify(updates.props);
  if (updates.locations) updateData.locations = JSON.stringify(updates.locations);
  if (updates.worldRules) updateData.worldRules = JSON.stringify(updates.worldRules);
  if (updates.themes) updateData.themes = JSON.stringify(updates.themes);

  return await prisma.assetLibrary.update({
    where: { scriptId },
    data: updateData,
  });
}

/**
 * 验证剧集内容是否符合资产库设定
 */
export async function validateEpisodeAgainstAssets(
  scriptId: string,
  episode: any
): Promise<ValidationResult> {
  const library = await getAssetLibrary(scriptId);
  
  if (!library) {
    return { valid: false, warnings: [], errors: ['资产库不存在'] };
  }

  const warnings: string[] = [];
  const errors: string[] = [];

  // 1. 检查角色一致性
  const characterNames = new Set(library.characters.map(c => c.name));
  const characterAliases = new Set(
    library.characters.flatMap(c => c.aliases || [])
  );

  episode.scenes?.forEach((scene: any, sceneIndex: number) => {
    // 检查场景中的角色
    scene.characters?.forEach((charName: string) => {
      if (!characterNames.has(charName) && !characterAliases.has(charName)) {
        warnings.push(`场景 ${sceneIndex + 1} 中出现未定义角色: ${charName}`);
      }
    });

    // 检查道具
    scene.props?.forEach((propName: string) => {
      const propExists = library.props.some(p => p.name === propName);
      if (!propExists) {
        warnings.push(`场景 ${sceneIndex + 1} 中出现未定义道具: ${propName}`);
      }
    });

    // 检查地点
    if (scene.location) {
      const locationExists = library.locations.some(l => l.name === scene.location);
      if (!locationExists) {
        warnings.push(`场景 ${sceneIndex + 1} 中出现未定义地点: ${scene.location}`);
      }
    }
  });

  // 2. 检查世界观一致性
  // TODO: 使用 AI 检查剧情是否违背世界观规则

  // 3. 检查角色行为一致性
  // TODO: 检查角色行为是否符合其性格设定

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * 添加新发现的资产
 */
export async function addDiscoveredAsset(
  scriptId: string,
  type: 'character' | 'prop' | 'location' | 'scene',
  asset: any
) {
  const library = await getAssetLibrary(scriptId);
  
  if (!library) {
    throw new Error('资产库不存在');
  }

  switch (type) {
    case 'character':
      library.characters.push(asset);
      break;
    case 'prop':
      library.props.push(asset);
      break;
    case 'location':
      library.locations.push(asset);
      break;
    case 'scene':
      library.scenes.push(asset);
      break;
  }

  await updateAssetLibrary(scriptId, library);
}

/**
 * 获取角色详情
 */
export async function getCharacterDetail(scriptId: string, characterId: string) {
  const library = await getAssetLibrary(scriptId);
  
  if (!library) return null;
  
  return library.characters.find(c => c.id === characterId);
}

/**
 * 获取角色关系网络
 */
export async function getCharacterNetwork(scriptId: string, characterId: string) {
  const library = await getAssetLibrary(scriptId);
  
  if (!library) return null;
  
  const character = library.characters.find(c => c.id === characterId);
  if (!character) return null;

  const network = character.relationships.map(rel => {
    const relatedChar = library.characters.find(c => c.id === rel.characterId);
    return {
      ...rel,
      characterDetails: relatedChar,
    };
  });

  return network;
}

/**
 * 检查道具使用一致性
 */
export async function validatePropUsage(
  scriptId: string,
  propId: string,
  episodeNumber: number
) {
  const library = await getAssetLibrary(scriptId);
  
  if (!library) return { valid: false, error: '资产库不存在' };

  const prop = library.props.find(p => p.id === propId);
  if (!prop) return { valid: false, error: '道具不存在' };

  // 检查道具是否在该集数之前已出现
  if (prop.firstAppearance > episodeNumber) {
    return {
      valid: false,
      error: `道具 ${prop.name} 在第 ${prop.firstAppearance} 集才首次出现，不能在第 ${episodeNumber} 集使用`,
    };
  }

  return { valid: true };
}
