# 部署指南

## 快速部署步骤

### 1. 准备工作

- GitHub 账号
- Vercel 账号（免费）
- MongoDB Atlas 账号（免费）

### 2. 部署后端到 Vercel

```bash
# 进入后端目录
cd backend

# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署
vercel

# 按照提示完成部署
```

### 3. 配置环境变量

在 Vercel Dashboard 中设置以下环境变量：

```
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_32_byte_encryption_key
OPENAI_API_KEY=your_openai_key (可选)
ANTHROPIC_API_KEY=your_anthropic_key (可选)
FRONTEND_URL=your_github_pages_url
```

### 4. 配置 MongoDB Atlas

1. 创建免费集群
2. 创建数据库用户
3. 添加IP白名单（允许所有IP: 0.0.0.0/0）
4. 获取连接字符串

### 5. 初始化智能体指令

```bash
# 在本地运行初始化脚本
cd backend
npm install
node scripts/initPrompt.js
```

### 6. 部署前端到 GitHub Pages

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 构建
npm run build

# 推送到 GitHub
git add .
git commit -m "Initial commit"
git push origin main
```

在 GitHub 仓库设置中启用 GitHub Pages，选择 `gh-pages` 分支。

### 7. 配置前端环境变量

在前端目录创建 `.env` 文件：

```
VITE_API_URL=https://your-backend.vercel.app/api
```

## 详细配置说明

### 生成密钥

```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Encryption Key (32字节)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 更新智能体指令

1. 登录管理后台 `/admin`
2. 编辑指令内容
3. 保存新版本
4. 激活新版本

## 故障排查

### 后端无法连接数据库
- 检查 MongoDB Atlas IP 白名单
- 确认连接字符串正确
- 检查数据库用户权限

### 前端无法调用 API
- 检查 CORS 配置
- 确认 API URL 正确
- 检查浏览器控制台错误

### AI 生成失败
- 确认 API 密钥有效
- 检查 API 余额
- 查看后端日志

## 更新部署

### 更新后端
```bash
cd backend
vercel --prod
```

### 更新前端
```bash
cd frontend
npm run build
# 推送到 GitHub，自动部署
```