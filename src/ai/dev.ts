'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-interview-questions.ts';
import '@/ai/flows/provide-answer-feedback.ts';
import '@/ai/flows/transcribe-audio.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/get-pronunciation-feedback.ts';
