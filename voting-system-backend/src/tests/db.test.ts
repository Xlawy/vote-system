import 'dotenv/config';
import { connectMongoDB, redis, closeConnections } from '../config/db';

async function testDatabaseConnections() {
  try {
    // 测试 MongoDB 连接
    console.log('正在测试 MongoDB 连接...');
    await connectMongoDB();
    console.log('MongoDB 连接测试成功！');

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
