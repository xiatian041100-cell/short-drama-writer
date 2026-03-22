// services/cacheService.js
const NodeCache = require('node-cache');

// 创建缓存实例
const cache = new NodeCache({
  stdTTL: 600, // 默认10分钟
  checkperiod: 120, // 每2分钟检查过期
  useClones: false
});

class CacheService {
  // 获取缓存
  static get(key) {
    return cache.get(key);
  }

  // 设置缓存
  static set(key, value, ttl = 600) {
    return cache.set(key, value, ttl);
  }

  // 删除缓存
  static del(key) {
    return cache.del(key);
  }

  // 根据模式删除缓存
  static delPattern(pattern) {
    const keys = cache.keys();
    const matchingKeys = keys.filter(key => key.includes(pattern));
    return cache.del(matchingKeys);
  }

  // 清空缓存
  static flush() {
    return cache.flushAll();
  }

  // 获取缓存统计
  static getStats() {
    return cache.getStats();
  }

  // 生成缓存键
  static generateKey(prefix, params) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `${prefix}:${sortedParams}`;
  }
}

// 缓存中间件
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // 只缓存GET请求
    if (req.method !== 'GET') {
      return next();
    }

    const key = CacheService.generateKey('api', {
      path: req.originalUrl,
      user: req.user?._id || 'anonymous'
    });

    const cachedResponse = CacheService.get(key);

    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    // 保存原始的json方法
    const originalJson = res.json.bind(res);

    // 重写json方法以缓存响应
    res.json = (data) => {
      CacheService.set(key, data, duration);
      return originalJson(data);
    };

    next();
  };
};

module.exports = { CacheService, cacheMiddleware };
