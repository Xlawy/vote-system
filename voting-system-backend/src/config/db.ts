import mongoose from 'mongoose';
import Redis from 'ioredis';
import { dbConfig } from './db.config';

// MongoDB连接
export const connectMongoDB = async () => {
  try {
    await mongoose.connect(dbConfig.mongodb.url);
    console.log('MongoDB连接成功');
  } catch (error) {
    console.error('MongoDB连接失败:', error);
    process.exit(1);
  }
};

// Redis客户端
export const redis = new Redis({
  host: dbConfig.redis.host,
  port: dbConfig.redis.port,
  password: dbConfig.redis.password,
  db: dbConfig.redis.db,
  retryStrategy: (times: number) => {
    if (times > 3) {
      console.error('Redis连接失败，已超过最大重试次数');
      return null; // 停止重试
    }
    const delay = Math.min(times * 200, 1000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

// 监听Redis连接事件
redis.on('connect', () => {
  console.log('Redis连接成功');
});

redis.on('error', (error) => {
  console.error('Redis连接错误:', error);
});

// 优雅关闭数据库连接
export const closeConnections = async () => {
  try {
    await mongoose.disconnect();
    await redis.quit();
    console.log('数据库连接已关闭');
  } catch (error) {
    console.error('关闭数据库连接时出错:', error);
    process.exit(1);
  }
};
