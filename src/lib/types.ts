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
