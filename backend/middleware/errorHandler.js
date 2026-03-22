// middleware/errorHandler.js
const logger = require('../utils/logger');

// 自定义错误类
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 异步错误包装器
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 全局错误处理中间件
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || '服务器内部错误';

  // 记录错误日志
  logger.error({
    message: err.message,
    statusCode: err.statusCode,
    code: err.code,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    user: req.user?._id,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // 开发环境返回详细错误
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code,
        stack: err.stack
      }
    });
  }

  // 生产环境
  // Mongoose 重复键错误
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: {
        message: '数据已存在',
        code: 'DUPLICATE_ERROR'
      }
    });
  }

  // Mongoose 验证错误
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      error: {
        message: messages.join(', '),
        code: 'VALIDATION_ERROR'
      }
    });
  }

  // Mongoose CastError (无效的ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: {
        message: `无效的 ${err.path}: ${err.value}`,
        code: 'CAST_ERROR'
      }
    });
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        message: '无效的认证令牌',
        code: 'INVALID_TOKEN'
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        message: '认证令牌已过期',
        code: 'TOKEN_EXPIRED'
      }
    });
  }

  // 操作错误（已知错误）
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code
      }
    });
  }

  // 未知错误
  return res.status(500).json({
    success: false,
    error: {
      message: '服务器内部错误',
      code: 'INTERNAL_ERROR'
    }
  });
};

module.exports = {
  AppError,
  asyncHandler,
  globalErrorHandler
};
