'use server';



import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getPronunciationFeedback } from './get-pronunciation-feedback';

const ProvideAnswerFeedbackInputSchema = z.object({
  jobRole: z.string(),
  interviewQuestion: z.string(),
  userAnswerText: z.string(),
   audioDataUri: z.optional(z.string()),
});
export type ProvideAnswerFeedbackInput = z.infer<typeof ProvideAnswerFeedbackInputSchema>;

const WordFeedbackSchema = z.object({
  word: z.string(),
  isCorrect: z.boolean(),
  feedback: z.optional(z.string()),
});

const PronunciationAnalysisSchema = z.object({
  overallScore: z.number(),
  transcript: z.string(),
  wordLevelFeedback: z.array(WordFeedbackSchema),
  generalFeedback: z.string(),
});

const ProvideAnswerFeedbackOutputSchema = z.object({
  feedback: z.string(),
  strengths: z.string(),
  weaknesses: z.string(),
  overallScore: z.number(),
  answerStructure: z.string(),
  languageAnalysis: z.string(),
  pronunciationAnalysis: z.optional(PronunciationAnalysisSchema)
});
export type ProvideAnswerFeedbackOutput = z.infer<typeof ProvideAnswerFeedbackOutputSchema>;

export async function provideAnswerFeedback(input: ProvideAnswerFeedbackInput): Promise<ProvideAnswerFeedbackOutput> {
  return provideAnswerFeedbackFlow(input);
}

const provideAnswerFeedbackPrompt = ai.definePrompt({
  name: 'provideAnswerFeedbackPrompt',
  input: {schema: z.object({
    jobRole: z.string(),
    interviewQuestion: z.string(),
    userAnswerText: z.string(),
  })},
  output: {schema: z.object({
    feedback: z.string(),
    strengths: z.string(),
    weaknesses: z.string(),
    overallScore: z.number(),
    answerStructure: z.string(),
    languageAnalysis: z.string(),
  })},
  prompt: `You are an AI interview coach providing feedback to a candidate.
  Your task is to analyze the user's answer based on its content, structure, and clarity. Do NOT analyze pronunciation, as that is handled separately.

  Job Role: {{{jobRole}}}
  Interview Question: {{{interviewQuestion}}}
  User's Answer (transcribed if spoken): {{{userAnswerText}}}

  Provide constructive feedback on the user's answer. Include the following:
  - A general feedback summary.
  - Strengths and weaknesses of the answer's content.
  - An overall score (0-100) for the content quality.
  - An analysis of the answer structure (e.g. STAR method, relevance, depth).
  - An analysis of the language used (clarity, tone, filler words).
  `,
});

const provideAnswerFeedbackFlow = ai.defineFlow(
  {
    name: 'provideAnswerFeedbackFlow',
    inputSchema: ProvideAnswerFeedbackInputSchema,
    outputSchema: ProvideAnswerFeedbackOutputSchema,
  },
  async (input) => {
    const contentFeedbackPromise = provideAnswerFeedbackPrompt({
        jobRole: input.jobRole,
        interviewQuestion: input.interviewQuestion,
        userAnswerText: input.userAnswerText
    });
    
    let pronunciationFeedbackPromise;
    if (input.audioDataUri) {
        pronunciationFeedbackPromise = getPronunciationFeedback({
            audioDataUri: input.audioDataUri,
            expectedText: input.userAnswerText
        });
    }

    const [{ output: contentFeedback }, pronunciationFeedback] = await Promise.all([
      contentFeedbackPromise,
      pronunciationFeedbackPromise,
    ]);

    if (!contentFeedback) {
        throw new Error("Failed to generate content feedback.");
    }

    return {
        ...contentFeedback,
        pronunciationAnalysis: pronunciationFeedback,
    };
  }
);
