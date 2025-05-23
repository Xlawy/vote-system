import { Request, Response, NextFunction } from 'express';
import mongoose, { isValidObjectId } from 'mongoose';
import { Poll, IPoll, PollStatus } from '../models/poll.model';
import { Vote } from '../models/vote.model';

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
                startTime: poll.startTime,
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
                    text: option.text,
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
                startTime: poll.startTime,
                banner: poll.banner
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

            // 为每个选项生成唯一ID
            const options = req.body.options.map((option: { text: string; description?: string; imageUrl?: string; }) => ({
                ...option,
                id: new mongoose.Types.ObjectId().toString(),
                normalVotes: 0,
                expertVotes: 0
            }));

            // 根据开始时间和结束时间设置状态
            const now = new Date();
            const startTime = new Date(req.body.startTime);
            const endTime = new Date(req.body.endTime);

            let status = PollStatus.NOT_STARTED;
            if (now >= startTime && now < endTime) {
                status = PollStatus.IN_PROGRESS;
            } else if (now >= endTime) {
                status = PollStatus.ENDED;
            }

            const pollData = {
                ...req.body,
                options,
                creator: userId,
                status
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

    // 更新投票
    static updatePoll = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?._id;
            if (!userId) {
                next(new Error('未授权'));
                return;
            }

            const { id } = req.params;
            if (!isValidObjectId(id)) {
                next(new Error('无效的投票ID'));
                return;
            }

            // 检查投票是否存在且属于当前用户
            const poll = await Poll.findOne({ _id: id, creator: userId, isDeleted: false });
            if (!poll) {
                next(new Error('投票不存在或无权修改'));
                return;
            }

            // 如果投票已经开始，只允许修改部分字段
            if (poll.status !== PollStatus.NOT_STARTED) {
                const allowedFields = ['description', 'banner'];
                const updateData: any = {};
                for (const field of allowedFields) {
                    if (req.body[field] !== undefined) {
                        updateData[field] = req.body[field];
                    }
                }
                await Poll.updateOne({ _id: id }, updateData);
            } else {
                // 如果投票未开始，可以修改所有字段
                const updateData = {
                    ...req.body,
                    options: req.body.options?.map((option: any) => ({
                        ...option,
                        normalVotes: 0,
                        expertVotes: 0
                    }))
                };
                await Poll.updateOne({ _id: id }, updateData);
            }

            const updatedPoll = await Poll.findById(id);
            res.json(updatedPoll);
            return;
        } catch (error) {
            console.error('更新投票失败:', error);
            next(error);
            return;
        }
    }

    // 删除投票
    static deletePoll = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?._id;
            if (!userId) {
                next(new Error('未授权'));
                return;
            }

            const { id } = req.params;
            if (!isValidObjectId(id)) {
                next(new Error('无效的投票ID'));
                return;
            }

            // 检查投票是否存在且属于当前用户
            const poll = await Poll.findOne({ _id: id, creator: userId, isDeleted: false });
            if (!poll) {
                next(new Error('投票不存在或无权删除'));
                return;
            }

            // 软删除投票
            await Poll.updateOne({ _id: id }, { isDeleted: true });
            res.json({ message: '投票已删除' });
            return;
        } catch (error) {
            console.error('删除投票失败:', error);
            next(error);
            return;
        }
    }

    // 提前关闭投票
    static closePoll = async (req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?._id;
            if (!userId) {
                next(new Error('未授权'));
                return;
            }

            const { id } = req.params;
            if (!isValidObjectId(id)) {
                next(new Error('无效的投票ID'));
                return;
            }

            // 检查投票是否存在且属于当前用户
            const poll = await Poll.findOne({ _id: id, creator: userId, isDeleted: false });
            if (!poll) {
                next(new Error('投票不存在或无权操作'));
                return;
            }

            // 如果投票已经结束，则返回错误
            if (poll.status === PollStatus.ENDED) {
                next(new Error('投票已经结束'));
                return;
            }

            // 更新投票状态为已结束
            await Poll.updateOne(
                { _id: id },
                { 
                    status: PollStatus.ENDED,
                    endTime: new Date() // 将结束时间设置为当前时间
                }
            );

            res.json({ message: '投票已提前关闭' });
            return;
        } catch (error) {
            console.error('关闭投票失败:', error);
            next(error);
            return;
        }
    }
}
