'use server';

import { createFastTextCompletion } from '@/ai/groq';
import { z } from 'zod';
import { checkAndConsumeQuota } from '@/lib/quota';

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
  companyName: z.string().optional().describe('The name of the company.'),
  rawJD: z.string().optional().describe('Raw text of the job description.'),
  codingOnly: z.boolean().optional().describe('If true, force the question to be a strict coding/implementation task.'),
});

export type GeneratePanelQuestionInput = z.infer<typeof GeneratePanelQuestionInputSchema>;

const GeneratePanelQuestionOutputSchema = z.object({
  question: z.string().describe('The interview question.'),
  requiresTyping: z.boolean().describe('Whether the candidate should type their answer (e.g. for coding questions).'),
});

export type GeneratePanelQuestionOutput = z.infer<typeof GeneratePanelQuestionOutputSchema>;

export async function generatePanelQuestion(
  input: GeneratePanelQuestionInput
): Promise<GeneratePanelQuestionOutput> {
  const quota = await checkAndConsumeQuota(1);
  if (!quota.success) {
    throw new Error(quota.error);
  }

  const { persona, jobRole, previousQuestions, jdContext, companyName, rawJD, codingOnly } = GeneratePanelQuestionInputSchema.parse(input);

  const codingOnlyString = codingOnly ? '\nCRITICAL REQUIREMENT: The user has selected "Coding Only" mode. Regardless of your persona, you MUST generate a programming, algorithmic, or coding implementation task appropriate for the candidate\'s role. You MUST set requiresTyping to true.' : '';

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

  const companyString = companyName ? `\nTarget Company: ${companyName}` : '';
  const rawJdString = rawJD ? `\nRaw Job Description:\n${rawJD}\n` : '';

  const prompt = `You are playing the role of ${persona.name}, a ${persona.role} interviewing a candidate for the ${jobRole} role.
Your specific focus for this question is: ${persona.focus}.

Generate exactly ONE new relevant interview question from your perspective.
Ensure your question aligns with your role and focus. For example, if you are an Engineering Manager, you might ask about system design trade-offs, team collaboration, or delivering under pressure. If you are HR, you might ask about cultural fit, conflict resolution, or long-term career goals.

${companyName ? `Target Company Context:
- The candidate is interviewing at ${companyName}.
- You must draw directly from your knowledge of actual, real-world past interview questions asked at ${companyName} for the ${jobRole} role.
- Integrate a natural, legit reference to this company context in your question phrasing to build trust (e.g., 'At ${companyName}, engineers are often asked to...', 'This scenario mimics a real problem ${companyName} team members faced...').
` : ''}

Candidate Role: ${jobRole}${companyString}
${jdContextString}
${rawJdString}
${previousQuestionsString}
${codingOnlyString}

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
