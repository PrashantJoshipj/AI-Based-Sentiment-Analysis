export interface Comment {
  id: string;
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  platform: 'youtube' | 'facebook' | 'instagram' | 'snapchat';
  author?: string;
  likes?: number;
  timestamp?: string;
  isReply?: boolean;
  parentId?: string;
}

export interface AnalysisResult {
  comments: Comment[];
  summary: {
    total: number;
    positive: number;
    negative: number;
    neutral: number;
  };
}

export interface AnalysisError {
  message: string;
  code?: string;
}