'use server';

import { groq } from '@/ai/groq';
import { z } from 'zod';
import { checkAndConsumeQuota } from '@/lib/quota';

const AnswerSchema = z.object({
  question: z.string(),
  answer: z.string(),
  score: z.number(),
  feedback: z.string(),
});

const InputSchema = z.object({
  role: z.string(),
  company: z.string().optional(),
  persona: z.string(),
  answers: z.array(AnswerSchema),
});

const OutputSchema = z.object({
  summary: z.string(),
  topStrengths: z.array(z.string()),
  topWeaknesses: z.array(z.string()),
  nextPractice: z.array(z.string()),
});

export type GenerateSessionReviewOutput = z.infer<typeof OutputSchema>;

export async function generateSessionReview(input: z.infer<typeof InputSchema>): Promise<GenerateSessionReviewOutput> {
  const quota = await checkAndConsumeQuota(5);
  if (!quota.success) {
    throw new Error(quota.error);
  }

  const { role, company, persona, answers } = InputSchema.parse(input);
  const prompt = `You are an interview coach creating a session review.

Role: ${role}
Company: ${company || 'N/A'}
Persona: ${persona}
Answers:
${answers.map((a, i) => `${i + 1}. Q: ${a.question}\nA: ${a.answer}\nScore: ${a.score}\nFeedback: ${a.feedback}`).join('\n\n')}

Return ONLY a valid JSON object with no conversational text:
{
  "summary": "string",
  "topStrengths": ["string"],
  "topWeaknesses": ["string"],
  "nextPractice": ["string"]
}`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: process.env.TEXT_MODEL || 'openrouter/free',
    response_format: { type: 'json_object' },
  });
  let content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('No content received from Groq');
  
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    content = jsonMatch[0];
  } else {
    content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
  
  return OutputSchema.parse(JSON.parse(content));
}
