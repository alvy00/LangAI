// types.ts

// Utility types
export interface TranscriptItem {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

// Feedback related
export interface Feedback {
  id: string;
  interviewId: string;
  totalScore: number;
  categoryScores?: Array<{
    name: string;
    score: number;
    comment: string;
  }>;

  strengths?: string[];
  areasForImprovement?: string[];
  finalAssessment?: string;
  createdAt: string;
}

export interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: TranscriptItem[];
  feedbackId?: string;
}

// Interview related
export interface Interview {
  id: string;
  level: string;
  questions: string[];
  createdAt: string;
  userId: string;
  type: string;
  finalized: boolean;
}

export interface InterviewCardProps {
  id?: string;
  userId?: string;
  type: string;
  createdAt?: string;
}

export interface InterviewFormProps {
  interviewId: string;
  level: string;
  type: string;
  amount: number;
}

// Agent related
export interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: 'generate' | 'interview';
  questions?: string[];
}

// Auth related
export interface User {
  name: string;
  email: string;
  id: string;
}

export interface SignInParams {
  email: string;
  idToken: string;
}

export interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
}

export type FormType = 'sign-in' | 'sign-up';

// Feedback fetching
export interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

export interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}

// Route params (Next.js dynamic route handler)
export interface RouteParams {
  params: Record<string, string>;
  searchParams: Record<string, string>;
}

// Score clamping helper
export function clampScore(score: number): number {
  return Math.max(0, Math.min(score, 100));
}
