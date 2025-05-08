import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const auth = (roles?: UserRole[]): express.RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        next(new Error('请先登录'));
        return;
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: UserRole };
      const user = await User.findById(decoded.userId);
      if (!user) {
        next(new Error('用户不存在'));
        return;
      }
      if (roles && !roles.includes(user.role as UserRole)) {
        next(new Error('权限不足'));
        return;
      }
      (req as any).user = user;
      next();


    } catch (error) {
      next(error);
    }
  };
};
