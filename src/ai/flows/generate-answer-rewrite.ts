'use server';

import { groq } from '@/ai/groq';
import { z } from 'zod';

const InputSchema = z.object({
  role: z.string(),
  question: z.string(),
  answer: z.string(),
  feedback: z.string(),
});

const OutputSchema = z.object({
  improvedAnswer: z.string(),
  structureTips: z.array(z.string()),
  conciseVersion: z.string(),
});

export type GenerateAnswerRewriteOutput = z.infer<typeof OutputSchema>;

export async function generateAnswerRewrite(input: z.infer<typeof InputSchema>): Promise<GenerateAnswerRewriteOutput> {
  const { role, question, answer, feedback } = InputSchema.parse(input);
  const prompt = `You are an interview coach.

Role: ${role}
Question: ${question}
User answer: ${answer}
Feedback received: ${feedback}

Write a stronger sample answer that still sounds natural and realistic.
Return ONLY a valid JSON object with no conversational text:
{
  "improvedAnswer": "string",
  "structureTips": ["string"],
  "conciseVersion": "string"
}`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: process.env.TEXT_MODEL || 'openrouter/free',
    response_format: { type: 'json_object' },
  });

  let content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('No content received from Groq');
  
  // Extract JSON from potential markdown wrapping or conversational text
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    content = jsonMatch[0];
  } else {
    content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
  
  return OutputSchema.parse(JSON.parse(content));
}
