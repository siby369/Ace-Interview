'use server';

import { createFastTextCompletion } from '@/ai/groq';
import { z } from 'zod';

const PersonaSchema = z.object({
  name: z.string(),
  role: z.string(),
  focus: z.string(),
});

const GeneratePanelQuestionInputSchema = z.object({
  persona: PersonaSchema,
  jobRole: z.string().describe('The overall role the candidate is interviewing for.'),
  previousQuestions: z.array(z.string()).describe('Questions already asked.'),
  jdContext: z.object({
    extractedSkills: z.array(z.string()),
    focusAreas: z.array(z.string()),
    companyCulture: z.string(),
    questionAngle: z.string(),
    seniority: z.string(),
  }).optional().describe('Parsed job description context to tailor questions.'),
});

export type GeneratePanelQuestionInput = z.infer<typeof GeneratePanelQuestionInputSchema>;

const GeneratePanelQuestionOutputSchema = z.object({
  question: z.string().describe('The interview question.'),
  requiresTyping: z.boolean().optional().describe('Whether the candidate should type their answer (e.g. for coding questions).'),
});

export type GeneratePanelQuestionOutput = z.infer<typeof GeneratePanelQuestionOutputSchema>;

export async function generatePanelQuestion(
  input: GeneratePanelQuestionInput
): Promise<GeneratePanelQuestionOutput> {
  const { persona, jobRole, previousQuestions, jdContext } = GeneratePanelQuestionInputSchema.parse(input);

  const previousQuestionsString = previousQuestions.length > 0
    ? `\nPreviously Asked Questions (DO NOT ask anything similar to these):\n${previousQuestions.map(q => `- ${q}`).join('\n')}`
    : '';

  const jdContextString = jdContext ? `
Job Description Context:
- Seniority: ${jdContext.seniority}
- Key Skills Required: ${jdContext.extractedSkills.join(', ')}
- Focus Areas: ${jdContext.focusAreas.join(', ')}
- Company Culture: ${jdContext.companyCulture}
- Interview Angle: ${jdContext.questionAngle}
` : '';

  const prompt = `You are playing the role of ${persona.name}, a ${persona.role} interviewing a candidate for the ${jobRole} role.
Your specific focus for this question is: ${persona.focus}.

Generate exactly ONE new relevant interview question from your perspective.
Ensure your question aligns with your role and focus. For example, if you are an Engineering Manager, you might ask about system design trade-offs, team collaboration, or delivering under pressure. If you are HR, you might ask about cultural fit, conflict resolution, or long-term career goals.

Candidate Role: ${jobRole}
${jdContextString}
${previousQuestionsString}

Return ONLY a valid JSON object with this EXACT structure:
{
  "question": "The question text",
  "requiresTyping": boolean
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
    return GeneratePanelQuestionOutputSchema.parse(json);
  } catch (error) {
    console.error('Error generating panel question:', error);
    throw error;
  }
}
