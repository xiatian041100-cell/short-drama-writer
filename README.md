# AI短剧剧本生成器

基于AI智能体的专业短剧剧本生成工具，一句话生成80集完整短剧剧本 + Midjourney视觉资产。

## 功能特点

- 🤖 **AI智能生成** - 基于GPT-4/Claude等大模型，生成专业级剧本
- 🎨 **视觉资产** - 自动生成Midjourney专业级提示词
- 💰 **付费卡点** - 专业设计的付费转化点
- 🎭 **多种类型** - 支持爽剧、悬疑、喜剧、虐心等多种风格
- 🔒 **安全可靠** - 智能体指令加密存储，防爬虫反编译

## 技术栈

### 前端
- React 18 + Vite
- Tailwind CSS
- React Router
- Axios

### 后端
- Node.js + Express
- MongoDB + Mongoose
- JWT认证
- AES-256加密

### 部署
- 前端：GitHub Pages
- 后端：Vercel
- 数据库：MongoDB Atlas

## 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/yourusername/short-drama-writer.git
cd short-drama-writer
```

### 2. 安装依赖
```bash
# 前端
cd frontend
npm install

# 后端
cd ../backend
npm install
```

### 3. 配置环境变量
```bash
# 后端
cd backend
cp .env.example .env
# 编辑 .env 文件，填入你的配置
```

### 4. 启动开发服务器
```bash
# 前端 (端口 3000)
cd frontend
npm run dev

# 后端 (端口 5000)
cd backend
npm run dev
```

## 部署指南

### 部署前端到 GitHub Pages

1. 在 GitHub 创建仓库
2. 推送代码到仓库
3. 在 Settings → Pages 中启用 GitHub Pages
4. 配置 GitHub Actions 自动部署（已包含在工作流中）

### 部署后端到 Vercel

1. 安装 Vercel CLI
```bash
npm i -g vercel
```

2. 登录并部署
```bash
cd backend
vercel
```

3. 在 Vercel Dashboard 中配置环境变量

### 配置 MongoDB Atlas

1. 注册 MongoDB Atlas 账号
2. 创建免费集群
3. 添加数据库用户
4. 获取连接字符串，填入环境变量

## 项目结构

```
short-drama-writer/
├── frontend/           # React前端
│   ├── src/
│   │   ├── components/ # 组件
│   │   ├── pages/      # 页面
│   │   └── services/   # API服务
│   └── package.json
├── backend/            # Node.js后端
│   ├── models/         # 数据模型
│   ├── routes/         # API路由
│   ├── middleware/     # 中间件
│   └── services/       # 业务逻辑
└── README.md
```

## 智能体指令加密

智能体指令使用 AES-256-GCM 加密存储，确保：
- 指令内容不会泄露
- 防止爬虫和反编译
- 支持版本管理和更新

## 会员系统

| 等级 | 价格 | 功能 |
|-----|------|------|
| 免费版 | ¥0 | 每天1次生成 |
| 标准版 | ¥29/月 | 每天10次，完整功能 |
| 专业版 | ¥99/月 | 无限次，API接入 |

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License