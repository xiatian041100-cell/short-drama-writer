import { ScriptGenerationResult } from '../services/aiService';

/**
 * 将剧本导出为 Markdown 格式
 */
export function exportToMarkdown(script: ScriptGenerationResult): string {
  const { title, genre, outline, characters, episodes, assets } = script;
  
  let markdown = `# ${title}\n\n`;
  markdown += `**类型**: ${genre}\n\n`;
  markdown += `**总集数**: ${episodes.length}集\n\n`;
  markdown += `---\n\n`;
  
  // 大纲
  markdown += `## 📖 剧本大纲\n\n`;
  markdown += `### 一卡亮点\n${outline.oneCard}\n\n`;
  markdown += `### 哲学内核\n${outline.philosophy}\n\n`;
  markdown += `### 世界观\n${outline.worldBuilding}\n\n`;
  markdown += `---\n\n`;
  
  // 角色
  markdown += `## 👥 角色设定\n\n`;
  characters.forEach((char, index) => {
    markdown += `### ${index + 1}. ${char.name}\n\n`;
    markdown += `- **身份**: ${char.role}\n`;
    markdown += `- **性别**: ${char.gender}\n`;
    markdown += `- **年龄**: ${char.age}\n`;
    markdown += `- **性格**: ${char.personality.join('、')}\n`;
    markdown += `- **视觉风格**: ${char.visualGenes.style}\n`;
    markdown += `- **主色调**: ${char.visualGenes.primaryColor}\n`;
    markdown += `- **光影**: ${char.visualGenes.lighting}\n\n`;
  });
  markdown += `---\n\n`;
  
  // 分集大纲
  markdown += `## 🎬 分集大纲\n\n`;
  episodes.forEach((ep) => {
    markdown += `### 第${ep.episodeNumber}集: ${ep.title}\n\n`;
    
    if (ep.isPaywall) {
      markdown += `> 💰 **付费卡点**\n\n`;
    }
    
    ep.scenes.forEach((scene) => {
      markdown += `**${scene.sceneNumber}** | ${scene.time} | ${scene.location}\n\n`;
      markdown += `${scene.content}\n\n`;
      
      if (scene.climax) {
        markdown += `🔥 **高潮**: ${scene.climax}\n\n`;
      }
      if (scene.hook) {
        markdown += `🪝 **钩子**: ${scene.hook}\n\n`;
      }
    });
    
    markdown += `---\n\n`;
  });
  
  // 视觉资产
  markdown += `## 🎨 Midjourney 视觉资产\n\n`;
  
  const characterAssets = assets.filter(a => a.type === 'character');
  const sceneAssets = assets.filter(a => a.type === 'scene');
  const propAssets = assets.filter(a => a.type === 'prop');
  
  if (characterAssets.length > 0) {
    markdown += `### 角色立绘\n\n`;
    characterAssets.forEach((asset) => {
      markdown += `**${asset.name}** (第${asset.episodeRef}集)\n\n`;
      markdown += "```\n";
      markdown += `${asset.prompt}\n`;
      markdown += "```\n\n";
    });
  }
  
  if (sceneAssets.length > 0) {
    markdown += `### 场景设定\n\n`;
    sceneAssets.forEach((asset) => {
      markdown += `**${asset.name}** (第${asset.episodeRef}集)\n\n`;
      markdown += "```\n";
      markdown += `${asset.prompt}\n`;
      markdown += "```\n\n";
    });
  }
  
  if (propAssets.length > 0) {
    markdown += `### 道具设定\n\n`;
    propAssets.forEach((asset) => {
      markdown += `**${asset.name}** (第${asset.episodeRef}集)\n\n`;
      markdown += "```\n";
      markdown += `${asset.prompt}\n`;
      markdown += "```\n\n";
    });
  }
  
  return markdown;
}

/**
 * 将剧本导出为纯文本格式（适合复制粘贴）
 */
export function exportToText(script: ScriptGenerationResult): string {
  const { title, genre, outline, characters, episodes, assets } = script;
  
  let text = `${title}\n`;
  text += `${'='.repeat(title.length)}\n\n`;
  text += `类型: ${genre}\n`;
  text += `总集数: ${episodes.length}集\n\n`;
  
  // 大纲
  text += `【剧本大纲】\n\n`;
  text += `一卡亮点:\n${outline.oneCard}\n\n`;
  text += `哲学内核:\n${outline.philosophy}\n\n`;
  text += `世界观:\n${outline.worldBuilding}\n\n`;
  
  // 角色
  text += `【角色设定】\n\n`;
  characters.forEach((char, index) => {
    text += `${index + 1}. ${char.name}\n`;
    text += `   身份: ${char.role}\n`;
    text += `   性别: ${char.gender}  年龄: ${char.age}\n`;
    text += `   性格: ${char.personality.join('、')}\n`;
    text += `   视觉: ${char.visualGenes.style}, ${char.visualGenes.lighting}\n\n`;
  });
  
  // 分集
  text += `【分集大纲】\n\n`;
  episodes.forEach((ep) => {
    text += `第${ep.episodeNumber}集: ${ep.title}\n`;
    if (ep.isPaywall) {
      text += `[付费卡点]\n`;
    }
    text += `${'-'.repeat(40)}\n`;
    
    ep.scenes.forEach((scene) => {
      text += `${scene.sceneNumber} | ${scene.time} | ${scene.location}\n`;
      text += `${scene.content}\n`;
      if (scene.climax) {
        text += `高潮: ${scene.climax}\n`;
      }
      if (scene.hook) {
        text += `钩子: ${scene.hook}\n`;
      }
      text += `\n`;
    });
  });
  
  // 资产
  text += `【Midjourney 提示词】\n\n`;
  assets.forEach((asset) => {
    text += `[${asset.type === 'character' ? '角色' : asset.type === 'scene' ? '场景' : '道具'}] ${asset.name}\n`;
    text += `${asset.prompt}\n\n`;
  });
  
  return text;
}

/**
 * 将剧本导出为 JSON 格式
 */
export function exportToJSON(script: ScriptGenerationResult): string {
  return JSON.stringify(script, null, 2);
}

/**
 * 导出为 Word 文档格式 (HTML 格式，可被 Word 打开)
 */
export function exportToWord(script: ScriptGenerationResult): string {
  const { title, genre, outline, characters, episodes, assets } = script;
  
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: "Microsoft YaHei", SimSun, sans-serif; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 40px; }
    h1 { color: #333; border-bottom: 3px solid #8b5cf6; padding-bottom: 10px; }
    h2 { color: #555; border-bottom: 2px solid #e879f9; padding-bottom: 8px; margin-top: 30px; }
    h3 { color: #666; margin-top: 20px; }
    .meta { color: #888; margin-bottom: 20px; }
    .character { background: #f9f9f9; padding: 15px; margin: 10px 0; border-left: 4px solid #8b5cf6; }
    .episode { background: #fafafa; padding: 20px; margin: 15px 0; border: 1px solid #eee; }
    .paywall { background: #fffbeb; border: 2px solid #f59e0b; padding: 10px; margin: 10px 0; }
    .scene { margin: 15px 0; padding: 10px; background: #fff; }
    .climax { color: #dc2626; font-weight: bold; }
    .hook { color: #7c3aed; font-weight: bold; }
    .asset { background: #f3f4f6; padding: 10px; margin: 10px 0; font-family: monospace; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background: #f3f4f6; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">
    <p><strong>类型:</strong> ${genre}</p>
    <p><strong>总集数:</strong> ${episodes.length}集</p>
  </div>
  
  <h2>📖 剧本大纲</h2>
  <h3>一卡亮点</h3>
  <p>${outline.oneCard}</p>
  
  <h3>哲学内核</h3>
  <p>${outline.philosophy}</p>
  
  <h3>世界观</h3>
  <p>${outline.worldBuilding}</p>
  
  <h2>👥 角色设定</h2>
  <table>
    <tr>
      <th>角色</th>
      <th>身份</th>
      <th>性别</th>
      <th>年龄</th>
      <th>性格特点</th>
    </tr>`;
  
  characters.forEach((char) => {
    html += `
    <tr>
      <td><strong>${char.name}</strong></td>
      <td>${char.role}</td>
      <td>${char.gender}</td>
      <td>${char.age}</td>
      <td>${char.personality.join('、')}</td>
    </tr>`;
  });
  
  html += `
  </table>
  
  <h2>🎬 分集大纲</h2>`;
  
  episodes.forEach((ep) => {
    html += `
  <div class="episode">
    <h3>第${ep.episodeNumber}集: ${ep.title}</h3>`;
    
    if (ep.isPaywall) {
      html += `
    <div class="paywall">💰 付费卡点</div>`;
    }
    
    ep.scenes.forEach((scene) => {
      html += `
    <div class="scene">
      <p><strong>${scene.sceneNumber}</strong> | ${scene.time} | ${scene.location}</p>
      <p>${scene.content}</p>`;
      
      if (scene.climax) {
        html += `
      <p class="climax">🔥 高潮: ${scene.climax}</p>`;
      }
      if (scene.hook) {
        html += `
      <p class="hook">🪝 钩子: ${scene.hook}</p>`;
      }
      
      html += `
    </div>`;
    });
    
    html += `
  </div>`;
  });
  
  html += `
  
  <h2>🎨 Midjourney 视觉资产</h2>`;
  
  assets.forEach((asset) => {
    const typeName = asset.type === 'character' ? '角色' : asset.type === 'scene' ? '场景' : '道具';
    html += `
  <div class="asset">
    <p><strong>[${typeName}] ${asset.name}</strong> (第${asset.episodeRef}集)</p>
    <pre>${asset.prompt}</pre>
  </div>`;
  });
  
  html += `
</body>
</html>`;
  
  return html;
}

/**
 * 导出为 CSV 格式（仅分集数据）
 */
export function exportEpisodesToCSV(episodes: ScriptGenerationResult['episodes']): string {
  let csv = '集数,标题,场景编号,时间,地点,内容,高潮,钩子,是否付费\n';
  
  episodes.forEach((ep) => {
    ep.scenes.forEach((scene) => {
      const content = scene.content.replace(/"/g, '""');
      const climax = (scene.climax || '').replace(/"/g, '""');
      const hook = (scene.hook || '').replace(/"/g, '""');
      
      csv += `${ep.episodeNumber},"${ep.title}","${scene.sceneNumber}","${scene.time}","${scene.location}","${content}","${climax}","${hook}",${ep.isPaywall ? '是' : '否'}\n`;
    });
  });
  
  return csv;
}
