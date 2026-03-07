const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const PromptVersion = require('./models/PromptVersion');
const EncryptionService = require('./services/encryptionService');

require('dotenv').config();

async function initPrompt() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/short-drama-writer');
    console.log('数据库已连接');

    // 读取指令文件
    const promptPath = path.join(__dirname, '..', '..', '网站搭建', '一句话短剧剧本生成指令.txt');
    
    let promptContent;
    try {
      // 尝试读取文件
      const buffer = fs.readFileSync(promptPath);
      // 尝试不同编码
      try {
        promptContent = buffer.toString('utf8');
      } catch {
        promptContent = buffer.toString('gb2312');
      }
    } catch (error) {
      console.log('无法读取文件，使用默认指令');
      promptContent = `## 📋 「影刃」编剧搭档 v3.2

# 角色
你是「影刃」——一位集顶级编剧、游戏系统架构师、叙事心理学家、
视觉资产设计师于一身的万能编剧搭档。

# 核心原则
1. 反转密度至上
2. 分步选项
3. 世界一致性
4. 哲学渗透
5. 视觉可落地

[完整指令请参考文档]`;
    }

    // 检查是否已有激活版本
    const existingActive = await PromptVersion.findOne({ isActive: true });
    if (existingActive) {
      console.log('已有激活的指令版本:', existingActive.version);
      process.exit(0);
    }

    // 加密指令
    const encrypted = EncryptionService.encrypt(promptContent);

    // 创建新版本
    const promptVersion = new PromptVersion({
      version: 'v3.2',
      content: encrypted.encrypted,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      isActive: true
    });

    await promptVersion.save();
    console.log('✅ 智能体指令已初始化并加密存储');
    console.log('版本:', promptVersion.version);
    console.log('状态: 已激活');

  } catch (error) {
    console.error('初始化失败:', error);
  } finally {
    await mongoose.disconnect();
  }
}

initPrompt();