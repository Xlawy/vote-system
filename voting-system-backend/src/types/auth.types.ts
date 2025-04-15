import { UserRole } from '../models/user.model';

// 用户信息
export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

// 认证响应
export interface AuthResponse {
  message: string;
  token: string;
  user: UserInfo;
}

// 错误响应
export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

// 会话信息
export interface SessionInfo {
  userId: string;
  role: UserRole;
  exp?: number;
}
