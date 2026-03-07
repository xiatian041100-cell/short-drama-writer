# Vercel 后端部署指南

## 步骤一：注册/登录 Vercel

1. 打开浏览器访问：https://vercel.com
2. 点击 **"Sign Up"**
3. 选择 **"Continue with GitHub"**
4. 使用你的 GitHub 账号（夏天）登录并授权

---

## 步骤二：导入项目

1. 登录后，在 Vercel Dashboard 点击 **"Add New..."**
2. 选择 **"Project"**
3. 在列表中找到 **"short-drama-writer"** 仓库
4. 点击 **"Import"**

---

## 步骤三：配置项目

### 基本设置

| 设置项 | 值 |
|--------|-----|
| **Project Name** | `short-drama-writer-api` (建议) |
| **Framework Preset** | `Other` |
| **Root Directory** | `./` (根目录) |

### 重要：配置环境变量

点击 **"Environment Variables"** 展开，添加以下变量：

```
NODE_ENV=production
JWT_SECRET=your-jwt-secret-key-change-this-in-production
ENCRYPTION_KEY=your-32-byte-hex-encryption-key
MONGODB_URI=your-mongodb-connection-string
FRONTEND_URL=https://xiatian041100-cell.github.io
```

### 生成密钥

如果你需要生成密钥，可以使用以下命令：

**JWT Secret** (64字符十六进制):
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Encryption Key** (32字符十六进制):
```
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

---

## 步骤四：部署

1. 点击 **"Deploy"** 按钮
2. 等待部署完成（约1-2分钟）
3. 部署成功后，会显示成功页面

---

## 步骤五：获取部署地址

部署成功后，你会获得一个类似这样的域名：
```
https://short-drama-writer-api.vercel.app
```

**复制这个地址**，下一步需要用到。

---

## 步骤六：配置前端API地址

1. 回到 GitHub 仓库
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加：
   - **Name**: `API_URL`
   - **Value**: `https://你的vercel域名/api`
   
   例如：`https://short-drama-writer-api.vercel.app/api`

5. 点击 **Add secret**

---

## 步骤七：设置 MongoDB Atlas

### 7.1 创建账户
1. 访问 https://www.mongodb.com/cloud/atlas
2. 注册/登录账号

### 7.2 创建集群
1. 点击 **"Create"** 创建新集群
2. 选择 **M0 (免费版)**
3. 选择最近的区域（如 AWS / Singapore）
4. 点击 **"Create Cluster"**

### 7.3 配置数据库访问
1. 点击 **"Database Access"**
2. 点击 **"Add New Database User"**
3. 选择 **"Password"** 认证方式
4. 输入用户名和密码（记住这些！）
5. 点击 **"Add User"**

### 7.4 配置网络访问
1. 点击 **"Network Access"**
2. 点击 **"Add IP Address"**
3. 选择 **"Allow Access from Anywhere"** (0.0.0.0/0)
4. 点击 **"Confirm"**

### 7.5 获取连接字符串
1. 回到 **"Database"** 页面
2. 点击 **"Connect"**
3. 选择 **"Drivers"**
4. 复制连接字符串，替换 `<password>` 为你的数据库密码

例如：
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/short-drama-writer?retryWrites=true&w=majority
```

### 7.6 更新Vercel环境变量
1. 回到 Vercel Dashboard
2. 进入你的项目
3. 点击 **"Settings"** → **"Environment Variables"**
4. 更新 `MONGODB_URI` 为刚才复制的连接字符串
5. 点击 **"Save"**
6. Vercel 会自动重新部署

---

## 步骤八：初始化智能体指令

### 方式一：通过Vercel CLI（推荐）

1. 安装 Vercel CLI:
```bash
npm i -g vercel
```

2. 登录:
```bash
vercel login
```

3. 进入项目目录:
```bash
cd short-drama-writer
```

4. 运行初始化脚本:
```bash
vercel --prod
# 然后运行
node backend/scripts/initPrompt.js
```

### 方式二：手动初始化

1. 在 Vercel Dashboard 中，点击 **"Runtime Logs"**
2. 查看是否有初始化相关的日志
3. 或者等待第一次API调用时自动初始化

---

## ✅ 部署完成！

### 检查部署状态

1. 访问你的 Vercel 域名：`https://你的项目名.vercel.app`
2. 访问健康检查API：`https://你的项目名.vercel.app/api/health`
3. 应该返回：`{"status":"ok"}`

### 更新前端配置

确保前端的环境变量 `API_URL` 已正确设置为你的 Vercel 域名。

---

## 🔧 故障排查

### 部署失败
- 检查环境变量是否全部配置
- 查看 Vercel 的 Build Logs

### 数据库连接失败
- 确认 MongoDB Atlas IP 白名单包含 `0.0.0.0/0`
- 检查连接字符串格式是否正确
- 确认数据库用户密码正确

### API 返回 404
- 检查 `vercel.json` 配置是否正确
- 确认路由配置匹配

### CORS 错误
- 检查 `FRONTEND_URL` 环境变量是否正确
- 确认包含 `https://` 协议

---

## 🎉 完成后

后端部署完成后，你的网站就可以：
- ✅ 用户注册/登录
- ✅ 生成剧本
- ✅ 保存剧本历史
- ✅ 管理智能体指令

**前端地址**: https://xiatian041100-cell.github.io/short-drama-writer/
**后端地址**: https://你的项目名.vercel.app