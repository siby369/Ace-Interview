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

const getPronunciationFeedbackPrompt = ai.definePrompt({
  name: 'getPronunciationFeedbackPrompt',
  input: {schema: GetPronunciationFeedbackInputSchema},
  output: {schema: GetPronunciationFeedbackOutputSchema},
  prompt: `You are an expert English pronunciation coach. Your task is to analyze a user's audio recording and compare their pronunciation to the provided text.

  Expected Text: "{{{expectedText}}}"
  User's Audio: {{media url=audioDataUri}}

  First, transcribe the user's audio.
  Then, compare the transcription and the phonetic pronunciation from the audio to the expected text, word by word.

  Provide the following analysis:
  1.  **Overall Score**: An overall score from 0-100 representing the accuracy of the pronunciation compared to a native speaker. A perfect match is 100. Deduct points for mispronounced words, missing words, or extra words.
  2.  **Transcript**: The text you transcribed from the audio.
  3.  **Word-level Feedback**: For each word in the *original expected text*, provide a feedback object. Indicate if the word was pronounced correctly. If it was mispronounced, provide a short, specific tip (e.g., "The 'a' sound was closer to 'cat' than 'car'"). If the user skipped the word, mark it as incorrect.
  4.  **General Feedback**: Provide a summary of the user's performance with 1-2 actionable tips for overall improvement. Focus on the most important issues.

  Analyze the pronunciation carefully based on the audio provided. Do not base your analysis solely on the text transcription.
  `,
});

const getPronunciationFeedbackFlow = ai.defineFlow(
  {
    name: 'getPronunciationFeedbackFlow',
    inputSchema: GetPronunciationFeedbackInputSchema,
    outputSchema: GetPronunciationFeedbackOutputSchema,
  },
  async input => {
    const {output} = await getPronunciationFeedbackPrompt(input);
    return output!;
  }
);
