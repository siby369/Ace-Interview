import type { LucideIcon } from "lucide-react";
import type { ProvideAnswerFeedbackOutput } from "@/ai/flows/provide-answer-feedback";

export interface Role {
  name: string;
  description: string;
  icon: LucideIcon;
}

export type Feedback = ProvideAnswerFeedbackOutput;
