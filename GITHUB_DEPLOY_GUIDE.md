# 🚀 GitHub 部署指南

## 准备工作

你需要准备：
1. GitHub 账号（已准备好：夏天）
2. 仓库名称建议：`short-drama-writer`

---

## 步骤一：在 GitHub 上创建仓库

1. 打开浏览器，访问 https://github.com
2. 登录"夏天"的账号
3. 点击右上角的 **+** 号 → **New repository**
4. 填写信息：
   - **Repository name**: `short-drama-writer`
   - **Description**: AI短剧剧本生成器 - 一句话生成80集完整剧本
   - **Public** (选中)
   - **Add a README file** (不要勾选，我们已有README)
5. 点击 **Create repository**

---

## 步骤二：上传项目文件

### 方式A：通过网页上传（推荐，不需要安装Git）

1. 在新创建的仓库页面，点击 **uploading an existing file** 链接
2. 打开文件夹：`C:\Users\Administrator\Desktop\网站搭建\short-drama-writer`
3. 选择所有文件和文件夹，拖拽到网页上传区域
4. 或者点击 **choose your files** 逐个选择文件

**注意**：需要保持目录结构：
```
short-drama-writer/
├── frontend/
├── backend/
├── docs/
├── .github/
├── README.md
└── PROJECT_SUMMARY.md
```

5. 填写提交信息：
   - **Commit changes**: `Initial commit`
6. 点击 **Commit changes**

---

## 步骤三：配置 GitHub Pages

1. 在仓库页面，点击 **Settings** 标签
2. 左侧菜单选择 **Pages**
3. **Source** 部分：
   - 选择 **GitHub Actions**
4. 等待自动部署完成

---

## 步骤四：配置环境变量

1. 在仓库页面，点击 **Settings** 标签
2. 左侧菜单选择 **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加以下 secrets：

| Name | Value | 说明 |
|------|-------|------|
| `API_URL` | `https://your-backend.vercel.app/api` | 后端API地址（先部署后端） |

---

## 步骤五：部署后端到 Vercel

### 5.1 注册/登录 Vercel

1. 访问 https://vercel.com
2. 点击 **Sign Up**，选择 **Continue with GitHub**
3. 授权 GitHub 账号

### 5.2 导入项目

1. 在 Vercel Dashboard，点击 **Add New...** → **Project**
2. 选择 `short-drama-writer` 仓库
3. 点击 **Import**

### 5.3 配置项目

1. **Framework Preset**: 选择 `Other`
2. **Root Directory**: 输入 `backend`
3. 点击 **Deploy**

### 5.4 配置环境变量

1. 部署完成后，进入项目设置
2. 选择 **Environment Variables**
3. 添加以下变量：

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/short-drama-writer
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-32-byte-hex-key
OPENAI_API_KEY=sk-your-openai-key (可选)
FRONTEND_URL=https://yourusername.github.io/short-drama-writer
```

### 5.5 重新部署

添加环境变量后，Vercel 会自动重新部署。

---

## 步骤六：配置 MongoDB Atlas

1. 访问 https://www.mongodb.com/cloud/atlas
2. 注册/登录账号
3. 创建免费集群（M0）
4. 创建数据库用户
5. 添加 IP 白名单：`0.0.0.0/0`（允许所有IP）
6. 获取连接字符串，填入 Vercel 环境变量

---

## 步骤七：初始化智能体指令

1. 在 Vercel 项目页面，点击 **Runtime Logs**
2. 找到初始化脚本的运行日志
3. 或者本地运行：
   ```bash
   cd backend
   npm install
   node scripts/initPrompt.js
   ```

---

## 完成！

部署完成后，你可以访问：

- **前端**: `https://你的用户名.github.io/short-drama-writer`
- **后端**: `https://你的项目名.vercel.app`
- **API文档**: `https://你的项目名.vercel.app/api/health`

---

## 故障排查

### 前端显示404
- 检查 GitHub Actions 是否运行成功
- 确认 Settings → Pages → Source 设置为 GitHub Actions

### 后端API无法访问
- 检查 Vercel 环境变量是否配置正确
- 查看 Vercel Runtime Logs

### 数据库连接失败
- 确认 MongoDB Atlas IP 白名单包含 `0.0.0.0/0`
- 检查连接字符串格式是否正确

---

## 更新部署

### 更新代码
1. 在 GitHub 仓库页面点击 **Add file** → **Upload files**
2. 上传修改后的文件
3. 提交更改

### 自动部署
- 前端：推送到 main 分支会自动触发 GitHub Actions 部署
- 后端：Vercel 会自动重新部署

---

**需要帮助？** 查看 `docs/deployment.md` 获取更详细的说明。