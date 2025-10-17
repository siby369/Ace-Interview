'use server';

/**
 * @fileOverview A flow to generate interview questions based on the selected role, topics and their difficulties.
 *
 * - generateInterviewQuestions - A function that generates interview questions.
 * - GenerateInterviewQuestionsInput - The input type for the generateInterviewQuestions function.
 * - GenerateInterviewQuestionsOutput - The return type for the generateInterviewQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInterviewQuestionsInputSchema = z.object({
  role: z.string().describe('The role for which to generate interview questions.'),
  topics: z.record(z.string()).describe('A map of topics to their difficulty level (e.g. { "data-structures": "Hard" }).'),
  questionCount: z.number().describe('The total number of questions to generate.'),
});

export type GenerateInterviewQuestionsInput = z.infer<
  typeof GenerateInterviewQuestionsInputSchema
>;

const GeneratedQuestionSchema = z.object({
  question: z.string().describe('The interview question.'),
  requiresTyping: z.boolean().describe('Whether the question requires the user to type an answer (e.g., for a coding problem). Set to false for conceptual or behavioral questions.')
});

const GenerateInterviewQuestionsOutputSchema = z.object({
  questions: z
    .array(GeneratedQuestionSchema)
    .describe('An array of generated interview questions.'),
});

export type GenerateInterviewQuestionsOutput = z.infer<
  typeof GenerateInterviewQuestionsOutputSchema
>;

export async function generateInterviewQuestions(
  input: GenerateInterviewQuestionsInput
): Promise<GenerateInterviewQuestionsOutput> {
  return generateInterviewQuestionsFlow(input);
}

const generateInterviewQuestionsPrompt = ai.definePrompt({
  name: 'generateInterviewQuestionsPrompt',
  input: {schema: GenerateInterviewQuestionsInputSchema},
  output: {schema: GenerateInterviewQuestionsOutputSchema},
  prompt: `You are an expert interview question generator. For the given role, generate a list of relevant interview questions.
You must generate a total of {{{questionCount}}} questions, distributed evenly among the selected topics.
For each topic, you must generate questions that match the specified difficulty level.
- If the difficulty is "Easy", ask a straightforward definition-based or simple-concept question. These should not require typing.
- If the difficulty is "Medium", ask a question that requires explaining a process or comparing concepts. These should not require typing.
- If the difficulty is "Hard", ask a complex scenario-based or design/coding question that requires deep, applied knowledge. Only set requiresTyping to true for questions that explicitly ask to write code or a complex algorithm.

Role: {{{role}}}

{{#each topics}}
Topic: {{@key}}
Difficulty: {{this}}
{{/each}}

Total Questions to Generate: {{{questionCount}}}

Questions:`,
});

const generateInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'generateInterviewQuestionsFlow',
    inputSchema: GenerateInterviewQuestionsInputSchema,
    outputSchema: GenerateInterviewQuestionsOutputSchema,
  },
  async input => {
    const {output} = await generateInterviewQuestionsPrompt(input);
    return output!;
  }
);
