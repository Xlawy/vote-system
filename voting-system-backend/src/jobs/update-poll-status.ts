import { Poll, PollStatus } from '../models/poll.model';

/**
 * 更新投票状态的定时任务
 */
export const updatePollStatus = async (): Promise<void> => {
  try {
    const now = new Date();

    // 更新已经开始的投票
    await Poll.updateMany(
      {
        startTime: { $lte: now },
        endTime: { $gt: now },
        status: PollStatus.NOT_STARTED,
        isDeleted: false
      },
      { status: PollStatus.IN_PROGRESS }
    );

    // 更新已经结束的投票
    await Poll.updateMany(
      {
        endTime: { $lte: now },
        status: PollStatus.IN_PROGRESS,
        isDeleted: false
      },
      { status: PollStatus.ENDED }
    );

    console.log('投票状态更新完成:', new Date().toISOString());
  } catch (error) {
    console.error('更新投票状态失败:', error);
  }
};
