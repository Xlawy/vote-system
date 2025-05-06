import mongoose, { Schema, Document } from 'mongoose';

// 投票选项接口
interface IOption {
  id: string;
  text: string;
  description?: string;
  imageUrl?: string;
  normalVotes: number;      // 普通票数
  expertVotes: number;      // 专家票数
}

// 投票状态枚举
export enum PollStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  ENDED = 'ended'
}

// 投票类型枚举
export enum PollType {
  SINGLE = 'single',    // 单选
  MULTIPLE = 'multiple' // 多选
}

// 投票接口定义
export interface IPoll extends Document {
  title: string;
  description: string;
  type: PollType;
  options: IOption[];
  creator: mongoose.Types.ObjectId;
  expertVoters: mongoose.Types.ObjectId[];  // 指定的专家投票者
  startTime: Date;
  endTime: Date;
  status: PollStatus;
  maxChoices?: number;                      // 多选时的最大选择数
  expertWeight: number;                     // 专家票权重
  isDeleted: boolean;
  banner?: string;                          // 投票banner图片URL
  createdAt: Date;
  updatedAt: Date;
}

// 投票Schema定义
const pollSchema = new Schema<IPoll>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: Object.values(PollType),
    required: true
  },
  options: [{
    id: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    description: String,
    imageUrl: String,
    normalVotes: {
      type: Number,
      default: 0
    },
    expertVotes: {
      type: Number,
      default: 0
    }
  }],
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expertVoters: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(PollStatus),
    default: PollStatus.NOT_STARTED
  },
  maxChoices: {
    type: Number,
    validate: {
      validator: function(v: number) {
        return this.type === PollType.SINGLE ? v === 1 : v > 1;
      },
      message: '单选投票只能选择一个选项'
    }
  },
  expertWeight: {
    type: Number,
    default: 1,
    min: 1
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  banner: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// 添加索引
pollSchema.index({ status: 1 });
pollSchema.index({ creator: 1 });
pollSchema.index({ startTime: 1, endTime: 1 });

export const Poll = mongoose.model<IPoll>('Poll', pollSchema);
