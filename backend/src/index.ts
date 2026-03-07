import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import authRoutes from './routes/auth';
import scriptRoutes from './routes/scripts';
import paymentRoutes from './routes/payments';

const app = express();

// 安全中间件
app.use(helmet());

// CORS
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));

// 限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP最多100个请求
  message: { error: 'Too many requests, please try again later' },
});
app.use(limiter);

// 解析JSON
app.use(express.json({ limit: '10mb' }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/scripts', scriptRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/pricing', paymentRoutes);

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// 启动服务器
app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
});

export default app;