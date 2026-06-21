import type { LucideIcon } from "lucide-react";
import type { ProvideAnswerFeedbackOutput } from "@/ai/flows/provide-answer-feedback";
import type { GetPronunciationFeedbackOutput } from "@/ai/flows/get-pronunciation-feedback";

export interface Role {
  name: string;
  description: string;
  icon: LucideIcon;
}

export type Feedback = ProvideAnswerFeedbackOutput;
export type PronunciationFeedback = GetPronunciationFeedbackOutput;

export type InterviewPersona = 'friendly' | 'strict' | 'faang' | 'rapid-fire';

export interface InterviewAnswerRecord {
  id?: string;
  question: string;
  answer: string;
  score: number;
  feedback: string;
  weaknesses?: string;
  strengths?: string;
  timestamp: string;
}

export interface InterviewSessionRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  role: string;
  company?: string;
  persona: InterviewPersona;
  topics: Record<string, string>;
  questionCount: number;
  completed: boolean;
  answers: InterviewAnswerRecord[];
  bookmarkedQuestions: string[];
  summary?: string;
  recommendedPractice?: string[];
}

export interface PracticeSettings {
  voiceLanguage: string;
  defaultDifficulty: 'Easy' | 'Medium' | 'Hard';
  preferredPersona: InterviewPersona;
  responseMode: 'typed' | 'spoken' | 'mixed';
}

export interface PracticePlanItem {
  day: string;
  focus: string;
  durationMinutes: number;
}
