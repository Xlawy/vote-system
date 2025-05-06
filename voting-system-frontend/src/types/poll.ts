export enum PollType {
  SINGLE = 'single',
  MULTIPLE = 'multiple'
}

export enum PollStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  ENDED = 'ended'
}

export interface PollOption {
  id?: string;
  text: string;
  description?: string;
  imageUrl?: string;
  normalVotes: number;
  expertVotes: number;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  type: PollType;
  options: PollOption[];
  creator: string;
  expertVoters: string[];
  startTime: string;
  endTime: string;
  status: PollStatus;
  maxChoices?: number;
  expertWeight: number;
  isDeleted: boolean;
  banner?: string;
  createdAt: string;
  updatedAt: string;
} 