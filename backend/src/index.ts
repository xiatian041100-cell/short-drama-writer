import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { config } from './config';
import authRoutes from './routes/auth';
import scriptRoutes from './routes/scripts';
import paymentRoutes from './routes/payments';
import { initWebSocketServer } from './services/websocketService';

const app = express();
const server = createServer(app);

// 初始化 WebSocket
initWebSocketServer(server);

// 中间件
app.use(helmet());
app.use(cors({
  origin: config.server.frontendUrl,
  credentials: true,
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP最多100个请求
  message: { error: '请求过于频繁，请稍后再试' },
});
app.use(limiter);

app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/scripts', scriptRoutes);
app.use('/api/payments', paymentRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

const PORT = config.server.port;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready on ws://localhost:${PORT}/ws`);
});
