import 'dotenv/config';
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectMongoDB, closeConnections, redis } from './config/db';
import authRoutes from './routes/auth.routes';
import pollRoutes from './routes/poll.routes';
import uploadRoutes from './routes/upload.routes';
import { updatePollStatus } from './jobs/update-poll-status';
import path from 'path';
import fs from 'fs';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
  }
});

// 创建上传目录
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 安全中间件
app.use(helmet());

// CORS 配置
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
};

app.use(cors(corsOptions));

// 请求体解析
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(uploadDir, {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// 基础路由
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Voting System API' });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/upload', uploadRoutes);

// 错误处理中间件
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('错误:', err);
  res.status(500).json({
    status: 'error',
    message: err.message || '服务器内部错误'
  });
});

// 设置定时任务，每分钟检查一次投票状态
setInterval(updatePollStatus, 60 * 1000);

// 连接数据库
connectMongoDB();

// 关闭
process.on('SIGINT', async () => {
  await closeConnections();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeConnections();
  process.exit(0);
});

// Socket.IO 连接处理
io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 8000;

// 检查数据库连接并启动服务器
async function startServer() {
  try {
    // 等待 MongoDB 和 Redis 连接
    console.log('正在连接数据库...');
    
    // 设置超时
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('数据库连接超时')), 5000);
    });

    // 尝试连接数据库
    await Promise.race([
      Promise.all([
        // MongoDB 连接已经在之前的代码中处理
        new Promise(resolve => setTimeout(resolve, 1000)), // 等待MongoDB连接完成
        // 测试 Redis 连接
        redis.ping().then(() => console.log('Redis连接成功'))
      ]),
      timeout
    ]);

    // 启动服务器
    httpServer.listen(PORT, () => {
      console.log(`服务器正在运行，端口: ${PORT}`);
      console.log(`环境: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    // 关闭所有连接
    await closeConnections();
    process.exit(1);
  }
}

startServer();
