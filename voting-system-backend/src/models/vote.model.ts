import mongoose, { Schema, Document } from 'mongoose';

// 投票记录接口
export interface IVote extends Document {
  poll: mongoose.Types.ObjectId;
  voter: mongoose.Types.ObjectId;
  selectedOptions: string[];  // 选项ID数组
  isExpertVote: boolean;     // 是否为专家投票
  createdAt: Date;
  updatedAt: Date;
}

// 投票记录Schema定义
const voteSchema = new Schema<IVote>({
  poll: {
    type: Schema.Types.ObjectId,
    ref: 'Poll',
    required: true
  },
  voter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  selectedOptions: [{
    type: String,
    required: true
  }],
  isExpertVote: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 添加复合唯一索引，确保每个用户在每个投票中只能投票一次
voteSchema.index({ poll: 1, voter: 1 }, { unique: true });

export const Vote = mongoose.model<IVote>('Vote', voteSchema);
