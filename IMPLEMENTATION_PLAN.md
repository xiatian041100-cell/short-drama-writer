# AI短剧剧本生成器 - 功能修改计划
## 基于新商业模式的实施方案

### 阶段一：核心变现功能（本周完成）

#### 1. 支付系统接入 ⭐ 最高优先级
**目标**：接入 Stripe + 支付宝，实现真实付费

**修改内容：**
- [ ] 后端：创建支付路由 `/api/payment/*`
- [ ] 后端：集成 Stripe 订阅 API
- [ ] 后端：集成支付宝当面付/网页支付
- [ ] 后端：Webhook 处理支付回调
- [ ] 前端：Pricing 页面接入真实支付按钮
- [ ] 前端：支付成功/失败页面
- [ ] 数据库：更新 User 模型添加订阅字段
- [ ] 环境变量：配置支付密钥

**技术方案：**
```javascript
// 新文件：backend/routes/payment.js
// - Stripe 订阅创建
// - 支付宝订单创建
// - Webhook 处理
// - 订阅状态查询
```

#### 2. 会员权限系统完善
**修改内容：**
- [ ] 更新会员中间件，精确控制功能权限
- [ ] 添加每日使用次数限制（精确计数）
- [ ] 添加功能解锁提示（引导升级）

**权限矩阵：**
| 功能 | 免费版 | 标准版 | 专业版 | 企业版 |
|-----|-------|-------|-------|-------|
| 每日生成次数 | 1 | 20 | 无限 | 无限 |
| 剧本集数 | 30 | 80 | 80 | 定制 |
| MJ提示词 | ❌ | ✅ | ✅ | ✅ |
| 付费卡点 | ❌ | ✅ | ✅ | ✅ |
| 导出PDF | 水印 | 无水印 | 无水印 | 定制 |
| API接入 | ❌ | ❌ | ✅ | ✅ |
| 团队协作 | ❌ | ❌ | 5人 | 无限 |

---

### 阶段二：用户体验优化（下周完成）

#### 3. 剧本导出功能
**目标**：支持导出 PDF / Word / 文本

**修改内容：**
- [ ] 后端：PDF生成服务（puppeteer）
- [ ] 后端：Word文档生成（docx库）
- [ ] 后端：纯文本导出
- [ ] 前端：导出按钮 + 格式选择
- [ ] 前端：导出进度显示

#### 4. AI流式生成
**目标**：实时显示生成进度，提升体验

**修改内容：**
- [ ] 后端：SSE 流式响应接口
- [ ] 前端：流式接收 + 实时显示
- [ ] 前端：生成进度条
- [ ] 优化：分阶段生成（大纲→角色→剧本→资产）

#### 5. 使用统计仪表盘
**目标**：让用户清晰看到使用情况

**修改内容：**
- [ ] 后端：精确记录每次生成
- [ ] 后端：使用统计 API
- [ ] 前端：仪表盘显示今日/本月使用
- [ ] 前端：额度不足提示 + 升级引导

---

### 阶段三：转化优化（第3周）

#### 6. 落地页重新设计
**目标**：提高转化率

**修改内容：**
- [ ] 添加真实案例展示（生成示例剧本）
- [ ] 添加用户见证/评价
- [ ] 添加信任标识（安全支付、企业认证）
- [ ] 优化CTA按钮文案和位置
- [ ] 添加FAQ部分
- [ ] 添加实时生成演示

#### 7. 首次用户体验优化
**目标**：3分钟内完成首次生成

**修改内容：**
- [ ] 简化首次使用流程
- [ ] 添加引导教程
- [ ] 提供示例创意一键使用
- [ ] 首次生成后庆祝动画

---

### 阶段四：增长功能（第4周）

#### 8. 推荐返利系统
**目标**：老带新增长

**修改内容：**
- [ ] 后端：推荐码生成
- [ ] 后端：推荐关系追踪
- [ ] 后端：奖励发放
- [ ] 前端：推荐页面
- [ ] 前端：奖励展示

**规则：**
- 邀请好友注册，双方各得3天标准版
- 好友付费，邀请人得20%返现

#### 9. 邮件营销系统
**目标**：提高留存和付费转化

**邮件场景：**
- 欢迎邮件（注册后）
- 使用引导（注册后1天）
- 额度提醒（免费额度80%）
- 付费转化（免费额度用完）
- 续费提醒（到期前3天）
- 流失挽回（7天未登录）

---

### 数据库模型变更

#### User 模型更新
```javascript
{
  // 原有字段...
  
  // 新增订阅相关
  subscription: {
    plan: { type: String, enum: ['free', 'standard', 'pro', 'enterprise'], default: 'free' },
    status: { type: String, enum: ['active', 'canceled', 'past_due'], default: 'active' },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: { type: Boolean, default: false }
  },
  
  // 使用统计
  usage: {
    dailyGenerations: { type: Number, default: 0 },
    lastResetDate: { type: Date, default: Date.now },
    totalGenerations: { type: Number, default: 0 }
  },
  
  // 推荐系统
  referral: {
    code: { type: String, unique: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    inviteCount: { type: Number, default: 0 },
    rewardBalance: { type: Number, default: 0 }
  }
}
```

#### 新增 Payment 记录模型
```javascript
{
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['stripe', 'alipay'] },
  amount: Number,
  currency: String,
  status: { type: String, enum: ['pending', 'completed', 'failed'] },
  description: String,
  metadata: Object,
  createdAt: { type: Date, default: Date.now }
}
```

---

### 文件创建清单

#### 后端新文件
```
backend/
├── routes/
│   ├── payment.js          # 支付路由
│   ├── usage.js            # 使用统计
│   └── referral.js         # 推荐系统
├── services/
│   ├── stripeService.js    # Stripe集成
│   ├── alipayService.js    # 支付宝集成
│   ├── pdfService.js       # PDF生成
│   └── emailService.js     # 邮件服务
├── middleware/
│   └── subscription.js     # 订阅权限检查
└── models/
    └── Payment.js          # 支付记录
```

#### 前端新文件
```
frontend/src/
├── pages/
│   ├── PaymentSuccess.jsx  # 支付成功
│   ├── PaymentCancel.jsx   # 支付取消
│   └── Referral.jsx        # 推荐页面
├── components/
│   ├── ExportButton.jsx    # 导出按钮
│   ├── UsageStats.jsx      # 使用统计
│   └── UpgradePrompt.jsx   # 升级提示
└── services/
    ├── payment.js          # 支付API
    └── export.js           # 导出API
```

---

### 实施顺序建议

**本周（阶段一）：**
1. 更新 User 模型 ✅ 先完成
2. 创建支付路由和Stripe集成
3. 修改 Pricing 页面接入支付
4. 更新会员中间件

**下周（阶段二）：**
5. PDF导出功能
6. 使用统计仪表盘
7. AI流式生成（可选）

**第3周（阶段三）：**
8. 落地页重新设计
9. 首次用户体验优化

**第4周（阶段四）：**
10. 推荐系统
11. 邮件营销

---

### 立即开始

要我立即开始实施吗？建议从 **支付系统** 开始，因为这是变现的核心。

我可以：
1. 立即创建 Stripe 支付集成
2. 更新数据库模型
3. 修改前端 Pricing 页面
4. 测试支付流程

开始吗？🚀
