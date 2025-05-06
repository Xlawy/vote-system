import { z } from 'zod';
import { PollType } from '../models/poll.model';

// 创建投票的验证模式
export const createPollSchema = z.object({
  body: z.object({
    title: z.string().min(1, '标题不能为空').max(100, '标题最多100个字符'),
    description: z.string().min(1, '描述不能为空').max(500, '描述最多500个字符'),
    type: z.enum([PollType.SINGLE, PollType.MULTIPLE], {
      errorMap: () => ({ message: '投票类型无效' })
    }),
    options: z.array(z.object({
      text: z.string().min(1, '选项内容不能为空').max(100, '选项内容最多100个字符'),
      description: z.string().optional(),
      imageUrl: z.string().url('图片URL格式无效').optional()
    })).min(2, '至少需要2个选项').max(10, '最多10个选项'),
    expertVoters: z.array(z.string()).optional(),
    startTime: z.string().datetime('开始时间格式无效'),
    endTime: z.string().datetime('结束时间格式无效'),
    maxChoices: z.number().int().positive().optional(),
    expertWeight: z.number().min(1).max(10).default(2)
  }).refine(data => {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    return start < end;
  }, {
    message: '结束时间必须晚于开始时间',
    path: ['endTime']
  }).refine(data => {
    if (data.type === PollType.SINGLE && data.maxChoices && data.maxChoices > 1) {
      return false;
    }
    return true;
  }, {
    message: '单选投票不能选择多个选项',
    path: ['maxChoices']
  })
});

// 提交投票的验证模式
export const submitVoteSchema = z.object({
  body: z.object({
    selectedOptions: z.array(z.string()).min(1, '至少选择一个选项')
  })
});

// 更新投票的验证模式
export const updatePollSchema = z.object({
  body: z.object({
    title: z.string().min(1, '标题不能为空').max(100, '标题最多100个字符').optional(),
    description: z.string().min(1, '描述不能为空').max(500, '描述最多500个字符').optional(),
    type: z.enum([PollType.SINGLE, PollType.MULTIPLE], {
      errorMap: () => ({ message: '投票类型无效' })
    }).optional(),
    options: z.array(z.object({
      id: z.string().optional(),
      text: z.string().min(1, '选项内容不能为空').max(100, '选项内容最多100个字符'),
      description: z.string().optional(),
      imageUrl: z.string().url('图片URL格式无效').optional()
    })).min(2, '至少需要2个选项').max(10, '最多10个选项').optional(),
    expertVoters: z.array(z.string()).optional(),
    startTime: z.string().datetime('开始时间格式无效').optional(),
    endTime: z.string().datetime('结束时间格式无效').optional(),
    maxChoices: z.number().int().positive().optional(),
    expertWeight: z.number().min(1).max(10).optional(),
    banner: z.string().regex(/^\/uploads\/.+/, 'banner图片路径格式无效').optional()
  }).refine(data => {
    if (data.startTime && data.endTime) {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      return start < end;
    }
    return true;
  }, {
    message: '结束时间必须晚于开始时间',
    path: ['endTime']
  }).refine(data => {
    if (data.type === PollType.SINGLE && data.maxChoices && data.maxChoices > 1) {
      return false;
    }
    return true;
  }, {
    message: '单选投票不能选择多个选项',
    path: ['maxChoices']
  })
});
