import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, UserRole, IUser } from '../models/user.model';
import { AuthResponse, ErrorResponse, SessionInfo } from '../types/auth.types';
import { RegisterRequest, LoginRequest } from '../validators/auth.validator';
import { redis } from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = req.body as RegisterRequest;

    // 检查用户是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const errorResponse: ErrorResponse = {
        message: '该邮箱已被注册',
      };
      res.status(400).json(errorResponse);
      return;
    }

    // 创建新用户
    const user: IUser = new User({
      email,
      password, // 密码会在 pre save 中间件中自动加密
      name,
      role: role || UserRole.NORMAL,
      isEmailVerified: false,
    });

    await user.save();

    // 生成会话信息
    const userId = user._id.toString();
    const sessionInfo: SessionInfo = {
      userId,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24小时
    };

    // 生成 JWT token
    const token = jwt.sign(sessionInfo, JWT_SECRET);

    // 将会话信息存入 Redis
    await redis.set(
      `session:${userId}`,
      JSON.stringify(sessionInfo),
      'EX',
      24 * 60 * 60 // 24小时
    );

    const response: AuthResponse = {
      message: '注册成功',
      token,
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('注册错误:', error);
    const errorResponse: ErrorResponse = {
      message: '服务器错误',
    };
    res.status(500).json(errorResponse);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginRequest;

    // 查找用户
    const user: IUser | null = await User.findOne({ email });
    if (!user) {
      const errorResponse: ErrorResponse = {
        message: '邮箱或密码错误',
      };
      res.status(401).json(errorResponse);
      return;
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      const errorResponse: ErrorResponse = {
        message: '邮箱或密码错误',
      };
      res.status(401).json(errorResponse);
      return;
    }

    // 生成会话信息
    const userId = user._id.toString();
    const sessionInfo: SessionInfo = {
      userId,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24小时
    };

    // 生成 JWT token
    const token = jwt.sign(sessionInfo, JWT_SECRET);

    // 将会话信息存入 Redis
    await redis.set(
      `session:${userId}`,
      JSON.stringify(sessionInfo),
      'EX',
      24 * 60 * 60 // 24小时
    );

    const response: AuthResponse = {
      message: '登录成功',
      token,
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('登录错误:', error);
    const errorResponse: ErrorResponse = {
      message: '服务器错误',
    };
    res.status(500).json(errorResponse);
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId; // 从中间件获取用户ID
    if (!userId) {
      const errorResponse: ErrorResponse = {
        message: '未授权',
      };
      res.status(401).json(errorResponse);
      return;
    }

    // 检查Redis中的会话信息
    const sessionData = await redis.get(`session:${userId}`);
    if (!sessionData) {
      const errorResponse: ErrorResponse = {
        message: '会话已过期',
      };
      res.status(401).json(errorResponse);
      return;
    }

    const user: IUser | null = await User.findById(userId).select('-password');
    if (!user) {
      const errorResponse: ErrorResponse = {
        message: '用户不存在',
      };
      res.status(404).json(errorResponse);
      return;
    }

    const response = {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    } as const;

    res.json(response);
  } catch (error) {
    console.error('获取当前用户信息错误:', error);
    const errorResponse: ErrorResponse = {
      message: '服务器错误',
    };
    res.status(500).json(errorResponse);
  }
};
