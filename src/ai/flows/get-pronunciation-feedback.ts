'use server';

/**
 * @fileOverview A flow to analyze user's pronunciation from an audio recording against expected text.
 *
 * - getPronunciationFeedback - A function that provides a detailed analysis of pronunciation.
 * - GetPronunciationFeedbackInput - The input type for the getPronunciationFeedback function.
 * - GetPronunciationFeedbackOutput - The return type for the getPronunciationFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetPronunciationFeedbackInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A chunk of audio, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  expectedText: z
    .string()
    .describe('The text the user was supposed to read.'),
});
export type GetPronunciationFeedbackInput = z.infer<
  typeof GetPronunciationFeedbackInputSchema
>;

const WordFeedbackSchema = z.object({
  word: z.string().describe('The word from the expected text.'),
  isCorrect: z.boolean().describe('Whether the word was pronounced correctly.'),
  feedback: z.string().optional().describe('Specific feedback for this word if mispronounced.'),
});

const GetPronunciationFeedbackOutputSchema = z.object({
  overallScore: z.number().describe('An overall pronunciation score from 0 to 100.'),
  transcript: z.string().describe('The transcribed text from the user\'s audio.'),
  wordLevelFeedback: z.array(WordFeedbackSchema).describe('An array of feedback for each word in the expected text.'),
  generalFeedback: z.string().describe('General tips and suggestions for improving pronunciation based on the user\'s performance.'),
});
export type GetPronunciationFeedbackOutput = z.infer<
  typeof GetPronunciationFeedbackOutputSchema
>;

export async function getPronunciationFeedback(
  input: GetPronunciationFeedbackInput
): Promise<GetPronunciationFeedbackOutput> {
  return getPronunciationFeedbackFlow(input);
}

