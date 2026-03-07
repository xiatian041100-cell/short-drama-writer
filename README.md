# 影刃剧本生成器 - 短剧创作平台

## 项目概述
一个基于大语言模型的智能短剧剧本生成网站，用户只需输入一句话或一个想法，即可生成完整的80集短剧剧本。

## 核心功能
1. **AI剧本生成** - 接入大模型API，基于"影刃"智能体指令生成专业剧本
2. **用户系统** - 注册/登录/会员管理
3. **收费系统** - 积分制/会员制付费
4. **剧本管理** - 历史记录、导出、编辑
5. **加密保护** - 智能体指令加密存储，防爬虫反编译

## 技术栈
- **前端**: Next.js 14 + React + Tailwind CSS + shadcn/ui
- **后端**: Node.js + Express
- **数据库**: SQLite (本地开发) / PostgreSQL (生产)
- **AI**: OpenAI API / Claude API / 其他大模型
- **加密**: AES-256-GCM

## 目录结构
```
script-generator/
├── frontend/          # Next.js前端
├── backend/           # Express后端
├── shared/            # 共享类型和工具
└── docs/             # 文档
```

## 快速启动

### 1. 安装依赖
```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

### 2. 配置环境变量
```bash
# backend/.env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
ENCRYPTION_KEY="your-32-byte-encryption-key"
OPENAI_API_KEY="your-openai-key"
PORT=3001
```

### 3. 启动服务
```bash
# 启动后端
cd backend
npm run dev

# 启动前端 (新终端)
cd frontend
npm run dev
```

### 4. 访问
打开 http://localhost:3000

## 功能模块

### 用户系统
- [x] 用户注册/登录
- [x] JWT认证
- [x] 会员等级管理
- [x] 积分系统

### 剧本生成
- [x] 一句话生成完整剧本
- [x] 80集分集大纲
- [x] 付费卡点设计
- [x] 人物设定生成
- [x] Midjourney提示词生成

### 支付系统
- [x] 积分充值
- [x] 会员订阅
- [x] 生成消耗积分

### 安全
- [x] 指令词加密存储
- [x] API限流
- [x] 用户数据隔离
