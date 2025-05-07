import express, { Request, Response, NextFunction } from 'express';
import { PollController } from '../controllers/poll.controller';
import { auth } from '../middleware/auth';
import { UserRole } from '../models/user.model';
import { validateRequest } from '../middleware/validate';
import { createPollSchema, submitVoteSchema, updatePollSchema } from '../validators/poll.validator';

const router = express.Router();

// 包装器函数，用于处理异步路由
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 获取投票列表
router.get('/', asyncHandler(PollController.getPolls));

// 获取投票详情
router.get('/:id', asyncHandler(PollController.getPoll));

// 创建投票（需要管理员权限）
router.post('/', 
  auth([UserRole.ADMIN, UserRole.SUPER_ADMIN]), 
  validateRequest(createPollSchema), 
  asyncHandler(PollController.createPoll)
);

// 提交投票（需要登录）
router.post('/:id/vote', 
  auth(), 
  validateRequest(submitVoteSchema), 
  asyncHandler(PollController.submitVote)
);

// 更新投票（需要管理员权限）
router.put('/:id', 
  auth([UserRole.ADMIN, UserRole.SUPER_ADMIN]), 
  validateRequest(updatePollSchema), 
  asyncHandler(PollController.updatePoll)
);

// 删除投票（需要管理员权限）
router.delete('/:id', 
  auth([UserRole.ADMIN, UserRole.SUPER_ADMIN]), 
  asyncHandler(PollController.deletePoll)
);

// 提前关闭投票（需要管理员权限）
router.post('/:id/close', 
  auth([UserRole.ADMIN, UserRole.SUPER_ADMIN]), 
  asyncHandler(PollController.closePoll)
);

export default router;
