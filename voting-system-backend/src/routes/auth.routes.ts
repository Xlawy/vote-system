import { Router } from 'express';
import { register, login, getCurrentUser } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validator.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';

const router = Router();

// 注册路由
router.post('/register', validateRequest(registerSchema), register);

// 登录路由
router.post('/login', validateRequest(loginSchema), login);

// 获取当前用户信息路由（需要认证）
router.get('/me', authMiddleware, getCurrentUser);

export default router;
