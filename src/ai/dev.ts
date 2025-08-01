import { config } from 'dotenv';
config();

import '@/ai/flows/generate-interview-questions.ts';
import '@/ai/flows/provide-answer-feedback.ts';
import '@/ai/flows/transcribe-audio.ts';
