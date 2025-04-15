import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Poll, PollStatus, PollType } from '../models/poll.model';
import { User, UserRole } from '../models/user.model';

async function seedPolls() {
  // 生成密码哈希
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://127.0.0.1:27030/voting_system');
    console.log('Connected to MongoDB');

    // 创建一个管理员用户
    const admin = await User.findOneAndUpdate(
      { email: 'admin@example.com' },
      {
        username: 'Admin',
        email: 'admin@example.com',
        password: hashedPassword, // 请替换为实际的哈希密码
        role: UserRole.ADMIN
      },
      { upsert: true, new: true }
    );

    // 创建一些专家用户
    const expert1 = await User.findOneAndUpdate(
      { email: 'expert1@example.com' },
      {
        username: '专家一',
        email: 'expert1@example.com',
        password: hashedPassword,
        role: UserRole.EXPERT
      },
      { upsert: true, new: true }
    );

    const expert2 = await User.findOneAndUpdate(
      { email: 'expert2@example.com' },
      {
        username: '专家二',
        email: 'expert2@example.com',
        password: hashedPassword,
        role: UserRole.EXPERT
      },
      { upsert: true, new: true }
    );

    // 创建测试投票
    const polls = [
      {
        title: '最受欢迎的编程语言',
        description: '2025年最受开发者欢迎的编程语言调查',
        type: PollType.SINGLE,
        options: [
          { id: '1', text: 'JavaScript', description: '网页开发的主流语言', normalVotes: 10, expertVotes: 2 },
          { id: '2', text: 'Python', description: '数据科学和人工智能的首选', normalVotes: 15, expertVotes: 3 },
          { id: '3', text: 'Java', description: '企业级应用的标准选择', normalVotes: 8, expertVotes: 1 },
          { id: '4', text: 'Go', description: '云原生开发的新星', normalVotes: 5, expertVotes: 2 }
        ],
        creator: admin._id,
        expertVoters: [expert1._id, expert2._id],
        startTime: new Date(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 一周后结束
        status: PollStatus.IN_PROGRESS,
        expertWeight: 2,
        isDeleted: false
      },
      {
        title: '最佳开发工具',
        description: '选择你最喜欢的IDE和开发工具（可多选）',
        type: PollType.MULTIPLE,
        options: [
          { id: '5', text: 'VSCode', description: '轻量级但功能强大的编辑器', normalVotes: 20, expertVotes: 4 },
          { id: '6', text: 'IntelliJ IDEA', description: 'JetBrains的旗舰IDE', normalVotes: 12, expertVotes: 3 },
          { id: '7', text: 'Sublime Text', description: '快速且可扩展的编辑器', normalVotes: 8, expertVotes: 1 },
          { id: '8', text: 'WebStorm', description: '专业的Web开发IDE', normalVotes: 6, expertVotes: 2 }
        ],
        creator: admin._id,
        expertVoters: [expert1._id],
        startTime: new Date(),
        endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 两周后结束
        status: PollStatus.IN_PROGRESS,
        maxChoices: 2,
        expertWeight: 2,
        isDeleted: false
      },
      {
        title: '2025年最具潜力的技术趋势',
        description: '预测未来一年最有发展潜力的技术领域',
        type: PollType.MULTIPLE,
        options: [
          { id: '9', text: '人工智能/机器学习', description: '深度学习和神经网络的进一步发展', normalVotes: 0, expertVotes: 0 },
          { id: '10', text: '区块链技术', description: '去中心化应用和智能合约', normalVotes: 0, expertVotes: 0 },
          { id: '11', text: '量子计算', description: '量子计算机的实际应用', normalVotes: 0, expertVotes: 0 },
          { id: '12', text: '元宇宙', description: '虚拟现实和增强现实的融合', normalVotes: 0, expertVotes: 0 }
        ],
        creator: admin._id,
        expertVoters: [expert1._id, expert2._id],
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 明天开始
        endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后结束
        status: PollStatus.NOT_STARTED,
        maxChoices: 3,
        expertWeight: 3,
        isDeleted: false
      }
    ];

    // 清除现有数据
    await Poll.deleteMany({});

    // 插入新数据
    await Poll.insertMany(polls);

    console.log('Successfully seeded polls data');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedPolls();
