import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import { config } from './config';

// 存储活跃的 WebSocket 连接
const clients = new Map<string, WebSocket>();

export interface ProgressMessage {
  type: 'progress' | 'complete' | 'error';
  scriptId: string;
  stage: string;
  progress: number;
  message: string;
  data?: any;
}

/**
 * 初始化 WebSocket 服务器
 */
export function initWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ 
    server,
    path: '/ws',
  });

  wss.on('connection', (ws: WebSocket, req) => {
    console.log('New WebSocket connection');

    // 从 URL 参数中获取 token
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(1008, 'Missing token');
      return;
    }

    // 验证 token
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
      const userId = decoded.userId;
      
      // 存储连接
      clients.set(userId, ws);
      console.log(`User ${userId} connected via WebSocket`);

      // 发送连接成功消息
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'WebSocket connected successfully',
      }));

      // 处理断开连接
      ws.on('close', () => {
        clients.delete(userId);
        console.log(`User ${userId} disconnected`);
      });

      // 处理错误
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clients.delete(userId);
      });

    } catch (error) {
      console.error('WebSocket auth error:', error);
      ws.close(1008, 'Invalid token');
    }
  });

  console.log('WebSocket server initialized on /ws');
  return wss;
}

/**
 * 向用户发送进度更新
 */
export function sendProgress(userId: string, message: ProgressMessage): boolean {
  const ws = clients.get(userId);
  
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    console.log(`User ${userId} not connected, skipping progress update`);
    return false;
  }

  try {
    ws.send(JSON.stringify(message));
    return true;
  } catch (error) {
    console.error('Failed to send WebSocket message:', error);
    return false;
  }
}

/**
 * 广播消息给所有连接的客户端
 */
export function broadcast(message: ProgressMessage): void {
  clients.forEach((ws, userId) => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Failed to send to user ${userId}:`, error);
      }
    }
  });
}
