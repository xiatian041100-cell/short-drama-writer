import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { config } from '../config';

const ALGORITHM = 'aes-256-gcm';

// 从配置获取加密密钥
const getKey = () => {
  const key = config.encryptionKey;
  if (key.length !== 32) {
    throw new Error('Encryption key must be 32 bytes');
  }
  return Buffer.from(key);
};

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
}

/**
 * 加密数据
 */
export function encrypt(text: string): EncryptedData {
  const key = getKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex')
  };
}

/**
 * 解密数据
 */
export function decrypt(data: EncryptedData): string {
  const key = getKey();
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(data.iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(data.tag, 'hex'));
  
  let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * 加密对象并转为Base64字符串（用于存储）
 */
export function encryptToString(data: string): string {
  const encrypted = encrypt(data);
  return Buffer.from(JSON.stringify(encrypted)).toString('base64');
}

/**
 * 从Base64字符串解密
 */
export function decryptFromString(str: string): string {
  const data: EncryptedData = JSON.parse(Buffer.from(str, 'base64').toString());
  return decrypt(data);
}