'use server';

import { createFastTextCompletion } from '@/ai/groq';
import { z } from 'zod';

const ExtractJdTopicsOutputSchema = z.object({
  topics: z.array(z.string()).describe('List of 5 to 10 key technical skills, tools, or domain knowledge areas extracted from the job description.'),
});

export type ExtractJdTopicsOutput = z.infer<typeof ExtractJdTopicsOutputSchema>;

export async function extractJdTopics(jd: string): Promise<ExtractJdTopicsOutput> {
  if (!jd || jd.trim().length === 0) {
    return { topics: [] };
  }

  const prompt = `You are an expert technical recruiter. Analyze the following job description and extract 5 to 10 of the most important technical skills, tools, or domain knowledge areas required for the role.
Make the topics concise (1-3 words each), like "React", "System Design", "AWS", "Product Strategy", etc.
Only include hard skills and core competencies, ignore soft skills like "team player" or "communication".

Job Description:
${jd}

Return ONLY a valid JSON object with this EXACT structure:
{
  "topics": ["Skill 1", "Skill 2", "Skill 3"]
}`;

  try {
    const completion = await createFastTextCompletion({
      messages: [{ role: 'user', content: prompt }],
    });

    let content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No content received from Groq');

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    } else {
      content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }

    const json = JSON.parse(content);
    return ExtractJdTopicsOutputSchema.parse(json);
  } catch (error) {
    console.error('Error extracting JD topics:', error);
    return { topics: [] };
  }
}
