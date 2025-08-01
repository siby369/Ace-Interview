// Implemented the Genkit flow for providing AI feedback on interview answers.

'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing AI feedback on interview answers.
 *
 * - provideAnswerFeedback - A function that takes the job role, interview question, and user's answer as input and returns AI feedback.
 * - ProvideAnswerFeedbackInput - The input type for the provideAnswerFeedback function.
 * - ProvideAnswerFeedbackOutput - The return type for the provideAnswerFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideAnswerFeedbackInputSchema = z.object({
  jobRole: z.string().describe('The job role for the interview.'),
  interviewQuestion: z.string().describe('The interview question asked.'),
  userAnswer: z.string().describe('The user\'s answer to the interview question.'),
});
export type ProvideAnswerFeedbackInput = z.infer<typeof ProvideAnswerFeedbackInputSchema>;

const ProvideAnswerFeedbackOutputSchema = z.object({
  feedback: z.string().describe('AI feedback on the user\'s answer.'),
  strengths: z.string().describe('The strengths of the answer.'),
  weaknesses: z.string().describe('The weaknesses of the answer.'),
  overallScore: z.number().describe('An overall score for the answer (0-100).'),
});
export type ProvideAnswerFeedbackOutput = z.infer<typeof ProvideAnswerFeedbackOutputSchema>;

export async function provideAnswerFeedback(input: ProvideAnswerFeedbackInput): Promise<ProvideAnswerFeedbackOutput> {
  return provideAnswerFeedbackFlow(input);
}

const provideAnswerFeedbackPrompt = ai.definePrompt({
  name: 'provideAnswerFeedbackPrompt',
  input: {schema: ProvideAnswerFeedbackInputSchema},
  output: {schema: ProvideAnswerFeedbackOutputSchema},
  prompt: `You are an AI interview coach providing feedback to a candidate.

  Job Role: {{{jobRole}}}
  Interview Question: {{{interviewQuestion}}}
  User's Answer: {{{userAnswer}}}

  Provide constructive feedback on the user's answer, including strengths, weaknesses, and an overall score (0-100).
  Format the response as a JSON object with 'feedback', 'strengths', 'weaknesses', and 'overallScore' fields.`,
});

const provideAnswerFeedbackFlow = ai.defineFlow(
  {
    name: 'provideAnswerFeedbackFlow',
    inputSchema: ProvideAnswerFeedbackInputSchema,
    outputSchema: ProvideAnswerFeedbackOutputSchema,
  },
  async input => {
    const {output} = await provideAnswerFeedbackPrompt(input);
    return output!;
  }
);
