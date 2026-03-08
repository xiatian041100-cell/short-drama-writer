import { ScriptGenerationResult } from '../services/aiService';

/**
 * 导出为标准剧本 Word 文档格式
 * 包含：剧本名称、类型、人物小传、剧本大纲、剧本正文
 */
export function exportToScriptDocument(script: ScriptGenerationResult): string {
  const { title, genre, outline, characters, episodes } = script;
  
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      size: A4;
      margin: 2.5cm 2cm;
    }
    body { 
      font-family: "SimSun", "宋体", serif; 
      font-size: 12pt;
      line-height: 1.8; 
      color: #000;
      max-width: 21cm;
      margin: 0 auto;
      padding: 2cm;
    }
    
    /* 封面 */
    .cover {
      text-align: center;
      padding-top: 8cm;
      page-break-after: always;
    }
    .cover-title {
      font-size: 26pt;
      font-weight: bold;
      margin-bottom: 1cm;
      letter-spacing: 0.3em;
    }
    .cover-genre {
      font-size: 14pt;
      color: #666;
      margin-bottom: 0.5cm;
    }
    .cover-info {
      font-size: 12pt;
      color: #666;
      margin-top: 4cm;
    }
    
    /* 标题 */
    h1 {
      font-size: 18pt;
      text-align: center;
      margin: 1.5cm 0 1cm;
      page-break-before: always;
    }
    h1:first-of-type {
      page-break-before: auto;
    }
    h2 {
      font-size: 14pt;
      margin: 1cm 0 0.5cm;
      border-bottom: 1px solid #ccc;
      padding-bottom: 0.3cm;
    }
    h3 {
      font-size: 12pt;
      margin: 0.8cm 0 0.4cm;
    }
    
    /* 人物小传 */
    .character-card {
      margin: 0.8cm 0;
      padding: 0.5cm;
      border-left: 3px solid #333;
      background: #fafafa;
    }
    .character-name {
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 0.3cm;
    }
    .character-info {
      font-size: 11pt;
      color: #555;
      margin-bottom: 0.3cm;
    }
    .character-desc {
      font-size: 11pt;
      text-indent: 2em;
    }
    
    /* 剧本正文 */
    .episode {
      margin: 1cm 0;
      page-break-inside: avoid;
    }
    .episode-title {
      font-size: 14pt;
      font-weight: bold;
      text-align: center;
      margin: 0.8cm 0;
    }
    .scene-header {
      font-size: 11pt;
      color: #666;
      margin: 0.6cm 0 0.3cm;
      text-align: center;
    }
    .scene-location {
      font-weight: bold;
    }
    .action {
      text-indent: 2em;
      margin: 0.3cm 0;
    }
    .dialogue {
      margin: 0.3cm 0 0.3cm 2cm;
    }
    .character {
      font-weight: bold;
      margin-bottom: 0.1cm;
    }
    .dialogue-text {
      text-indent: 0;
    }
    
    /* 分页控制 */
    .page-break {
      page-break-before: always;
    }
    
    /* 大纲样式 */
    .outline-section {
      margin: 0.5cm 0;
    }
    .outline-title {
      font-weight: bold;
      margin-bottom: 0.2cm;
    }
    .outline-content {
      text-indent: 2em;
    }
  </style>
</head>
<body>

<!-- 封面 -->
<div class="cover">
  <div class="cover-title">${title}</div>
  <div class="cover-genre">类型：${genre || '短剧'}</div>
  <div class="cover-info">
    <p>总集数：${episodes.length}集</p>
    <p>每集时长：1-2分钟</p>
  </div>
</div>

<!-- 人物小传 -->
<h1>人物小传</h1>

${characters.map(char => `
<div class="character-card">
  <div class="character-name">${char.name}</div>
  <div class="character-info">
    ${char.gender} · ${char.age} · ${char.role === 'protagonist' ? '主角' : char.role === 'antagonist' ? '反派' : '配角'}
  </div>
  <div class="character-desc">
    ${char.background || '暂无背景介绍'}
  </div>
  ${char.personality && char.personality.length > 0 ? `
  <div style="margin-top: 0.3cm; font-size: 11pt;">
    <strong>性格特点：</strong>${char.personality.join('、')}
  </div>
  ` : ''}
  ${char.goals && char.goals.length > 0 ? `
  <div style="margin-top: 0.2cm; font-size: 11pt;">
    <strong>目标：</strong>${char.goals.join('、')}
  </div>
  ` : ''}
</div>
`).join('')}

<!-- 剧本大纲 -->
<h1 class="page-break">剧本大纲</h1>

<div class="outline-section">
  <div class="outline-title">一、故事核心</div>
  <div class="outline-content">${outline.oneCard}</div>
</div>

<div class="outline-section">
  <div class="outline-title">二、哲学内核</div>
  <div class="outline-content">${outline.philosophy}</div>
</div>

<div class="outline-section">
  <div class="outline-title">三、世界观设定</div>
  <div class="outline-content">${outline.worldBuilding}</div>
</div>

<!-- 分集大纲 -->
<h2>分集大纲</h2>

<table style="width: 100%; border-collapse: collapse; font-size: 10.5pt;">
  <tr style="background: #f0f0f0;">
    <th style="border: 1px solid #ccc; padding: 8px; width: 8%;">集数</th>
    <th style="border: 1px solid #ccc; padding: 8px; width: 20%;">标题</th>
    <th style="border: 1px solid #ccc; padding: 8px;">主要内容</th>
    <th style="border: 1px solid #ccc; padding: 8px; width: 12%;">备注</th>
  </tr>
  ${episodes.map(ep => `
  <tr>
    <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${ep.episodeNumber}</td>
    <td style="border: 1px solid #ccc; padding: 8px;">${ep.title}</td>
    <td style="border: 1px solid #ccc; padding: 8px;">
      ${ep.scenes && ep.scenes[0] ? ep.scenes[0].content.substring(0, 100) + '...' : ''}
    </td>
    <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">
      ${ep.isPaywall ? '<span style="color: #c00;">付费点</span>' : ''}
    </td>
  </tr>
  `).join('')}
</table>

<!-- 剧本正文 -->
<h1 class="page-break">剧本正文</h1>

${episodes.map(ep => `
<div class="episode">
  <div class="episode-title">第${ep.episodeNumber}集 ${ep.title}</div>
  
  ${ep.scenes ? ep.scenes.map((scene, idx) => `
  <div class="scene-header">
    <span class="scene-location">${scene.location}</span> · ${scene.time}
  </div>
  
  <div class="action">
    ${scene.content}
  </div>
  
  ${scene.climax ? `
  <div style="margin: 0.3cm 0; padding: 0.3cm; background: #fff8f0; border-left: 3px solid #f90;">
    <strong>【高潮】</strong>${scene.climax}
  </div>
  ` : ''}
  
  ${scene.hook ? `
  <div style="margin: 0.3cm 0; padding: 0.3cm; background: #f0f8ff; border-left: 3px solid #09f;">
    <strong>【钩子】</strong>${scene.hook}
  </div>
  ` : ''}
  `).join('') : ''}
  
  ${ep.isPaywall ? `
  <div style="text-align: center; margin: 0.5cm 0; padding: 0.3cm; border: 2px dashed #c00;">
    <strong>【付费卡点】</strong>
  </div>
  ` : ''}
</div>
`).join('')}

</body>
</html>`;

  return html;
}

/**
 * 导出为简化的拍摄剧本格式
 */
export function exportToShootingScript(script: ScriptGenerationResult): string {
  const { title, genre, characters, episodes } = script;
  
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title} - 拍摄剧本</title>
  <style>
    @page { size: A4; margin: 2cm; }
    body { 
      font-family: "SimSun", serif; 
      font-size: 11pt;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      margin-bottom: 1cm;
      padding-bottom: 0.5cm;
      border-bottom: 2px solid #000;
    }
    .episode-header {
      background: #f0f0f0;
      padding: 0.3cm 0.5cm;
      margin: 0.8cm 0 0.4cm;
      font-weight: bold;
      page-break-after: avoid;
    }
    .scene {
      margin: 0.4cm 0;
      page-break-inside: avoid;
    }
    .scene-info {
      background: #e8e8e8;
      padding: 0.2cm 0.4cm;
      font-size: 10pt;
      margin-bottom: 0.2cm;
    }
    .content {
      text-indent: 2em;
    }
    .character-list {
      column-count: 2;
      column-gap: 1cm;
      font-size: 10pt;
      margin: 0.5cm 0;
    }
    .character-item {
      margin: 0.2cm 0;
    }
  </style>
</head>
<body>

<div class="header">
  <h1>${title}</h1>
  <p>类型：${genre} | 集数：${episodes.length}集</p>
</div>

<h2>出场人物</h2>
<div class="character-list">
  ${characters.map(c => `
    <div class="character-item">
      <strong>${c.name}</strong> - ${c.role === 'protagonist' ? '主角' : '配角'}
    </div>
  `).join('')}
</div>

${episodes.map(ep => `
  <div class="episode-header">
    第${ep.episodeNumber}集 ${ep.title} ${ep.isPaywall ? '(付费点)' : ''}
  </div>
  
  ${ep.scenes ? ep.scenes.map((scene, idx) => `
    <div class="scene">
      <div class="scene-info">
        场景 ${idx + 1} | ${scene.location} | ${scene.time}
      </div>
      <div class="content">
        ${scene.content}
      </div>
    </div>
  `).join('') : ''}
`).join('')}

</body>
</html>`;

  return html;
}
