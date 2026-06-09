'use server';

import { fastGroq } from '@/ai/groq';
import { z } from 'zod';

const InputSchema = z.object({
  originalTranscript: z.string(),
  question: z.string(),
  role: z.string(),
});

const ChangeSchema = z.object({
  original: z.string(),
  coached: z.string(),
  reason: z.string(),
});

const OutputSchema = z.object({
  coachedVersion: z.string(),
  changes: z.array(ChangeSchema),
});

export type CoachSpeechDeliveryOutput = z.infer<typeof OutputSchema>;

export async function coachSpeechDelivery(
  input: z.infer<typeof InputSchema>
): Promise<CoachSpeechDeliveryOutput> {
  const { originalTranscript, question, role } = InputSchema.parse(input);

  const prompt = `You are an expert interview speech coach. Your ONLY job is to improve HOW the candidate said their answer, NOT to rewrite it with new content.

Role: ${role}
Question: ${question}
Candidate's exact words: ${originalTranscript}

Rules:
1. Keep all the same points, facts, and ideas the candidate mentioned.
2. Fix filler words (um, uh, like, you know, basically, literally, right?) — replace with natural pauses or remove.
3. Fix run-on sentences — break them into clean, punchy sentences.
4. Tighten up any rambling — say the same thing more confidently and concisely.
5. Do NOT add new ideas, examples, or content that the candidate did not mention.
6. Keep the vocabulary natural — do not make it sound robotic or like a textbook.

Return ONLY a valid JSON object:
{
  "coachedVersion": "the coached version of their exact answer",
  "changes": [
    {
      "original": "the original phrase or sentence",
      "coached": "the improved version",
      "reason": "brief reason (e.g. 'removed filler word', 'split run-on', 'tightened phrasing')"
    }
  ]
}`;

  const completion = await fastGroq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.1-8b-instant',
    response_format: { type: 'json_object' },
  });

  let content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('No content received from Groq');

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) content = jsonMatch[0];

  return OutputSchema.parse(JSON.parse(content));
}
