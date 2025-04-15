import 'dotenv/config';
import { connectMongoDB, redis, closeConnections } from '../config/db';

async function testDatabaseConnections() {
  try {
    // 测试 MongoDB 连接
    console.log('正在测试 MongoDB 连接...');
    await connectMongoDB();
    console.log('MongoDB 连接测试成功！');

    // 测试 Redis 连接
    console.log('正在测试 Redis 连接...');
    await redis.ping();
    console.log('Redis 连接测试成功！');

    // 测试 Redis 写入和读取
    console.log('测试 Redis 读写操作...');
    await redis.set('test_key', 'Hello Redis');
    const value = await redis.get('test_key');
    console.log('Redis 读写测试结果:', value);
    await redis.del('test_key');

    // 关闭连接
    await closeConnections();
    console.log('数据库连接测试完成，所有测试通过！');
    process.exit(0);
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
testDatabaseConnections();
