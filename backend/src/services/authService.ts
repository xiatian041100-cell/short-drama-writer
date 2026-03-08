import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';

const prisma = new PrismaClient();

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    name: string | null;
    membershipType: string;
    credits: number;
  };
  token: string;
}

/**
 * 用户注册
 */
export async function register(input: RegisterInput): Promise<AuthResult> {
  const { email, password, name } = input;

  // 检查邮箱是否已存在
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('Email already registered');
  }

  // 加密密码
  const hashedPassword = await bcrypt.hash(password, 10);

  // 创建用户
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      credits: 10, // 新用户赠送10积分
    },
  });

  // 生成JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      membershipType: user.membershipType,
      credits: user.credits,
    },
    token,
  };
}

/**
 * 用户登录
 */
export async function login(input: LoginInput): Promise<AuthResult> {
  const { email, password } = input;

  // 查找用户
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // 验证密码
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  // 生成JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      membershipType: user.membershipType,
      credits: user.credits,
    },
    token,
  };
}

/**
 * 验证JWT Token
 */
export function verifyToken(token: string): { userId: string; email: string } {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; email: string };
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

/**
 * 获取当前用户
 */
export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      membershipType: true,
      membershipExpiresAt: true,
      credits: true,
      totalSpent: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

/**
 * 扣除用户积分
 */
export async function deductCredits(userId: string, amount: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.credits < amount) {
    throw new Error('Insufficient credits');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { credits: user.credits - amount },
  });

  return updatedUser.credits;
}

/**
 * 增加用户积分
 */
export async function addCredits(userId: string, amount: number) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { credits: { increment: amount } },
  });

  return user.credits;
}

/**
 * 退还用户积分（生成失败时使用）
 */
export async function refundCredits(userId: string, amount: number) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { credits: { increment: amount } },
  });

  return user.credits;
}