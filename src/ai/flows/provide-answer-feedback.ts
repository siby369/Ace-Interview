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
  languageAnalysis: z
    .string()
    .describe(
      'Analysis of the language used, including clarity, tone, and filler words.'
    ),
  answerStructure: z
    .string()
    .describe(
      'Analysis of the answer structure, like using the STAR method, relevance, and depth.'
    ),
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

  Provide constructive feedback on the user's answer. Include the following:
  - Strengths and weaknesses.
  - An overall score (0-100).
  - An analysis of the language used (clarity, tone, filler words).
  - An analysis of the answer structure (e.g. STAR method, relevance, depth).
  `,
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
