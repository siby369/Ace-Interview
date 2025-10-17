'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing AI feedback on interview answers,
 * including content and pronunciation analysis.
 *
 * - provideAnswerFeedback - A function that takes interview context and user's answer (text and/or audio) and returns AI feedback.
 * - ProvideAnswerFeedbackInput - The input type for the provideAnswerFeedback function.
 * - ProvideAnswerFeedbackOutput - The return type for the provideAnswerFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getPronunciationFeedback } from './get-pronunciation-feedback';

const ProvideAnswerFeedbackInputSchema = z.object({
  jobRole: z.string().describe('The job role for the interview.'),
  interviewQuestion: z.string().describe('The interview question asked.'),
  userAnswerText: z.string().describe("The user's answer to the interview question, either typed or transcribed."),
   audioDataUri: z.optional(z.string().describe(
      "A chunk of audio, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    )),
});
export type ProvideAnswerFeedbackInput = z.infer<typeof ProvideAnswerFeedbackInputSchema>;

const WordFeedbackSchema = z.object({
  word: z.string().describe('The word from the expected text.'),
  isCorrect: z.boolean().describe('Whether the word was pronounced correctly.'),
  feedback: z.optional(z.string()).describe('Specific feedback for this word if mispronounced.'),
});

const PronunciationAnalysisSchema = z.object({
  overallScore: z.number().describe('An overall pronunciation score from 0 to 100.'),
  transcript: z.string().describe("The transcribed text from the user's audio."),
  wordLevelFeedback: z.array(WordFeedbackSchema).describe('An array of feedback for each word in the expected text.'),
  generalFeedback: z.string().describe("General tips and suggestions for improving pronunciation based on the user's performance."),
});

const ProvideAnswerFeedbackOutputSchema = z.object({
  feedback: z.string().describe("AI feedback on the user's answer content."),
  strengths: z.string().describe('The strengths of the answer content.'),
  weaknesses: z.string().describe('The weaknesses of the answer content.'),
  overallScore: z.number().describe('An overall score for the answer content (0-100).'),
  answerStructure: z
    .string()
    .describe(
      'Analysis of the answer structure, like using the STAR method, relevance, and depth.'
    ),
  languageAnalysis: z
    .string()
    .describe(
      'Analysis of the language used, including clarity, tone, and filler words.'
    ),
  pronunciationAnalysis: z.optional(PronunciationAnalysisSchema).describe('A detailed analysis of the user\'s pronunciation, if audio was provided.')
});
export type ProvideAnswerFeedbackOutput = z.infer<typeof ProvideAnswerFeedbackOutputSchema>;

export async function provideAnswerFeedback(input: ProvideAnswerFeedbackInput): Promise<ProvideAnswerFeedbackOutput> {
  return provideAnswerFeedbackFlow(input);
}


