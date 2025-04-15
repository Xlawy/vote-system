import { z } from 'zod';
import { UserRole } from '../models/user.model';

// 注册请求验证
export const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少6个字符'),
  username: z.string().min(2, '用户名至少2个字符'),
  role: z.enum([UserRole.NORMAL, UserRole.EXPERT, UserRole.ADMIN, UserRole.SUPER_ADMIN], {
    errorMap: () => ({ message: '无效的用户角色' }),
  }).optional(),
});

// 登录请求验证
export const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '请输入密码'),
});

// 类型定义
export type RegisterRequest = z.infer<typeof registerSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
