import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  jwtExpiresIn: '7d',
  
  // Encryption
  encryptionKey: process.env.ENCRYPTION_KEY || 'default-32-byte-encryption-key!',
  
  // AI API
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    model: 'gpt-4o',
  },
  
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  },
  
  moonshot: {
    apiKey: process.env.MOONSHOT_API_KEY || '',
  },
  
  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Pricing
  pricing: {
    // 积分价格 (元/积分)
    creditPrice: 0.1,
    
    // 生成消耗
    scriptGenerationCost: 100,  // 生成一部80集剧本消耗100积分
    
    // 会员价格 (月)
    membership: {
      BASIC: 29,
      PRO: 99,
      ENTERPRISE: 299,
    },
    
    // 会员权益
    membershipBenefits: {
      FREE: {
        monthlyScripts: 0,
        creditBonus: 0,
      },
      BASIC: {
        monthlyScripts: 5,
        creditBonus: 50,
      },
      PRO: {
        monthlyScripts: 20,
        creditBonus: 200,
      },
      ENTERPRISE: {
        monthlyScripts: 100,
        creditBonus: 1000,
      },
    },
  },
};