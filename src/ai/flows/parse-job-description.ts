'use server';

import { groq } from '@/ai/groq';
import { z } from 'zod';

const InputSchema = z.object({
  jobDescription: z.string(),
  companyName: z.string().optional(),
});

const OutputSchema = z.object({
  extractedSkills: z.array(z.string()),
  seniority: z.string(),
  focusAreas: z.array(z.string()),
  companyCulture: z.string(),
  questionAngle: z.string(),
});

export type ParseJobDescriptionOutput = z.infer<typeof OutputSchema>;

export async function parseJobDescription(
  input: z.infer<typeof InputSchema>
): Promise<ParseJobDescriptionOutput> {
  const { jobDescription, companyName } = InputSchema.parse(input);

  const prompt = `You are an expert at analyzing job descriptions for interview preparation.

${companyName ? `Company: ${companyName}` : ''}
Job Description:
${jobDescription}

Analyze this job description and extract:
1. The key technical and soft skills required
2. The seniority level (Junior / Mid / Senior / Staff / Principal / Director)
3. The main focus areas of the role (e.g., "distributed systems", "frontend performance", "cross-functional leadership")
4. The company culture vibe inferred from the JD language (e.g., "move fast startup", "process-driven enterprise", "data-driven product team")
5. A "questionAngle" — a single sentence describing how an interviewer from this company would frame questions (e.g., "Will ask behavioral questions using Amazon's Leadership Principles as a lens" or "Will probe deeply on system design scalability and trade-offs")

Return ONLY a valid JSON object:
{
  "extractedSkills": ["skill1", "skill2"],
  "seniority": "Mid",
  "focusAreas": ["area1", "area2"],
  "companyCulture": "brief culture description",
  "questionAngle": "one sentence on how interviews will be framed"
}`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: process.env.TEXT_MODEL || 'openrouter/free',
    response_format: { type: 'json_object' },
  });

  let content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('No content from Groq');

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) content = jsonMatch[0];

  return OutputSchema.parse(JSON.parse(content));
}
