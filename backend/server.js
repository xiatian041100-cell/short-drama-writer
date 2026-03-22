require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const { logger, requestLogger } = require('./utils/logger');
const { globalErrorHandler } = require('./middleware/errorHandler');

const app = express();

// 信任代理（用于获取真实IP）
app.set('trust proxy', 1);

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS配置
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 压缩响应
app.use(compression());

// 请求日志
app.use(requestLogger);

// 限流配置
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制100个请求
  message: {
    success: false,
    error: {
      message: '请求过于频繁，请稍后再试',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// API限流
app.use('/api/', limiter);

// 更严格的限流（认证相关）
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 10, // 10次尝试
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: {
      message: '登录尝试次数过多，请1小时后再试',
      code: 'AUTH_RATE_LIMIT'
    }
  }
});
app.use('/api/auth/login', authLimiter);

// Body解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 数据安全
app.use(mongoSanitize()); // 防止NoSQL注入
app.use(xss()); // 防止XSS攻击
app.use(hpp()); // 防止HTTP参数污染

// 数据库连接
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/short-drama-writer', {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    data: {
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0'
    }
  });
});

// API路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/scripts', require('./routes/scripts'));
app.use('/api/admin/prompts', require('./routes/admin'));
app.use('/api/ai-models', require('./routes/aiModels'));
app.use('/api/generation', require('./routes/generation'));
app.use('/api/payment', require('./routes/payment'));

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'API endpoint not found',
      code: 'NOT_FOUND'
    }
  });
});

// 全局错误处理
app.use(globalErrorHandler);

// 未捕获的Promise拒绝
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err);
  process.exit(1);
});

// 未捕获的异常
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated!');
  });
});

module.exports = app;
