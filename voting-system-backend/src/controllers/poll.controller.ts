import { Request, Response, NextFunction } from 'express';
import { Poll, IPoll, PollStatus } from '../models/poll.model';
import { Vote } from '../models/vote.model';
import { isValidObjectId } from 'mongoose';

export class PollController {
  // 获取投票列表
  static getPolls = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, isExpertOnly } = req.query;
      const query: any = { isDeleted: false };

      // 根据状态筛选
      if (status) {
        query.status = status;
      }

      // 如果只查看专家投票
      if (isExpertOnly === 'true') {
        query.expertVoters = { $exists: true, $not: { $size: 0 } };
      }

      const polls = await Poll.find(query)
        .populate('creator', 'username')
        .sort({ createdAt: -1 });

      // 转换为前端需要的格式
      const formattedPolls = polls.map(poll => ({
        id: poll._id,
        title: poll.title,
        description: poll.description,
        endTime: poll.endTime,
        status: poll.status === PollStatus.NOT_STARTED ? 'upcoming' :
                poll.status === PollStatus.IN_PROGRESS ? 'active' : 'ended',
        totalVotes: poll.options.reduce((sum, option) => 
          sum + option.normalVotes + option.expertVotes, 0),
        isExpertVote: poll.expertVoters.length > 0
      }));

      res.json(formattedPolls);
      return;
    } catch (error) {
      console.error('获取投票列表失败:', error);
      next(error);
      return;
    }
  }

  // 获取投票详情
  static getPoll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        next(new Error('无效的投票ID'));
        return;
      }

      const poll = await Poll.findOne({ _id: id, isDeleted: false })
        .populate('creator', 'username')
        .populate('expertVoters', 'username');

      if (!poll) {
        next(new Error('投票不存在'));
        return;
      }

      // 检查用户是否已投票
      const userId = (req as any).user?._id;
      const hasVoted = userId ? await Vote.exists({ poll: id, voter: userId }) : false;

      // 转换为前端需要的格式
      const formattedPoll = {
        id: poll._id,
        title: poll.title,
        description: poll.description,
        type: poll.type,
        options: poll.options.map(option => ({
          id: option.id,
          content: option.text,
          description: option.description,
          imageUrl: option.imageUrl,
          votes: option.normalVotes + option.expertVotes,
          percentage: ((option.normalVotes + option.expertVotes * poll.expertWeight) / 
            (poll.options.reduce((sum, opt) => 
              sum + opt.normalVotes + opt.expertVotes * poll.expertWeight, 0) || 1)) * 100
        })),
        endTime: poll.endTime,
        status: poll.status === PollStatus.NOT_STARTED ? 'upcoming' :
                poll.status === PollStatus.IN_PROGRESS ? 'active' : 'ended',
        totalVotes: poll.options.reduce((sum, option) => 
          sum + option.normalVotes + option.expertVotes, 0),
        isExpertVote: poll.expertVoters.length > 0,
        hasVoted: hasVoted,
        creator: poll.creator,
        expertVoters: poll.expertVoters,
        maxChoices: poll.maxChoices,
        expertWeight: poll.expertWeight,
        startTime: poll.startTime
      };

      res.json(formattedPoll);
      return;
    } catch (error) {
      console.error('获取投票详情失败:', error);
      next(error);
      return;
    }
  }

  // 创建投票
  static createPoll = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        next(new Error('未授权'));
        return;
      }

      const pollData = {
        ...req.body,
        creator: userId,
        status: PollStatus.NOT_STARTED
      };

      const poll = new Poll(pollData);
      await poll.save();

      res.status(201).json(poll);
      return;
    } catch (error) {
      console.error('创建投票失败:', error);
      next(error);
      return;
    }
  }

  // 提交投票
  static submitVote = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        next(new Error('未授权'));
        return;
      }

      const { id } = req.params;
      const { selectedOptions } = req.body;

      if (!isValidObjectId(id)) {
        next(new Error('无效的投票ID'));
        return;
      }

      const poll = await Poll.findOne({ _id: id, isDeleted: false });
      if (!poll) {
        next(new Error('投票不存在'));
        return;
      }

      if (poll.status !== PollStatus.IN_PROGRESS) {
        next(new Error('投票未开始或已结束'));
        return;
      }

      // 检查是否已投票
      const existingVote = await Vote.findOne({ poll: id, voter: userId });
      if (existingVote) {
        next(new Error('您已经投过票了'));
        return;
      }

      // 检查选项数量
      if (poll.type === 'single' && selectedOptions.length !== 1) {
        next(new Error('单选投票只能选择一个选项'));
        return;
      }
      if (poll.maxChoices && selectedOptions.length > poll.maxChoices) {
        next(new Error(`最多只能选择 ${poll.maxChoices} 个选项`));
        return;
      }

      // 检查是否为专家投票
      const isExpertVote = poll.expertVoters.some(voter => voter.equals(userId));

      // 创建投票记录
      const vote = new Vote({
        poll: id,
        voter: userId,
        selectedOptions,
        isExpertVote
      });
      await vote.save();

      // 更新投票选项的票数
      for (const optionId of selectedOptions) {
        const option = poll.options.find(opt => opt.id === optionId);
        if (option) {
          if (isExpertVote) {
            option.expertVotes += 1;
          } else {
            option.normalVotes += 1;
          }
        }
      }
      await poll.save();

      res.json({ message: '投票成功' });
      return;
    } catch (error) {
      console.error('提交投票失败:', error);
      next(error);
      return;
    }
  }
}
