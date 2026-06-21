'use server';

import { createFastTextCompletion } from '@/ai/groq';
import { z } from 'zod';
import { checkAndConsumeQuota } from '@/lib/quota';

const GenerateSingleInterviewQuestionInputSchema = z.object({
  role: z.string().describe('The role for which to generate interview questions.'),
  topics: z.record(z.string()).describe('A map of topics to their difficulty level.'),
  previousQuestions: z.array(z.string()).describe('Questions already asked — avoid duplicates.'),
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

export type GenerateSingleInterviewQuestionInput = z.infer<typeof GenerateSingleInterviewQuestionInputSchema>;

const GenerateSingleInterviewQuestionOutputSchema = z.object({
  question: z.string().describe('The interview question.'),
  requiresTyping: z.boolean().describe('Whether the question requires the user to type an answer.')
});

export type GenerateSingleInterviewQuestionOutput = z.infer<typeof GenerateSingleInterviewQuestionOutputSchema>;

export async function generateSingleInterviewQuestion(
  input: GenerateSingleInterviewQuestionInput
): Promise<GenerateSingleInterviewQuestionOutput> {
  const quota = await checkAndConsumeQuota(1);
  if (!quota.success) {
    throw new Error(quota.error);
  }

  const { role, topics, previousQuestions, jdContext, companyName, rawJD, codingOnly } = GenerateSingleInterviewQuestionInputSchema.parse(input);

  const codingOnlyString = codingOnly ? '\nCRITICAL REQUIREMENT: The user has selected "Coding Only" mode. You MUST generate a programming, algorithm, or coding implementation task appropriate for the role (e.g., scripting for SWE, SQL for Data Analysts, HTML/CSS for UX). You MUST set requiresTyping to true.' : '';

  const topicStrings = Object.keys(topics).length > 0 
    ? `\nSelected Topics to choose from:\n${Object.entries(topics).map(([topic, difficulty]) => `- Topic: ${topic}, Difficulty: ${difficulty}`).join('\n')}\n\nSelect one of the provided topics to focus on, ensuring the question matches the specified difficulty level.`
    : '\nGenerate a question relevant to the job description and role.';

  const previousQuestionsString = previousQuestions.length > 0
    ? `\nPreviously Asked Questions (DO NOT ask anything similar to these):\n${previousQuestions.map(q => `- ${q}`).join('\n')}`
    : '';

  const jdContextString = jdContext ? `
Job Description Context (tailor the question to match this context closely):
- Seniority: ${jdContext.seniority}
- Key Skills Required: ${jdContext.extractedSkills.join(', ')}
- Focus Areas: ${jdContext.focusAreas.join(', ')}
- Company Culture: ${jdContext.companyCulture}
- Interview Angle: ${jdContext.questionAngle}
` : '';

  const companyString = companyName ? `\nTarget Company: ${companyName}` : '';
  const rawJdString = rawJD ? `\nRaw Job Description:\n${rawJD}\n` : '';

  const prompt = `You are an expert interview question generator. For the given role, generate exactly ONE new relevant interview question.
- If the difficulty is "Easy", ask a straightforward definition-based or simple-concept question. These should not require typing.
- If the difficulty is "Medium", ask a question that requires explaining a process or comparing concepts. These should not require typing.
- If the difficulty is "Hard", ask a complex scenario-based or design/coding question. For technical roles, ensure you include coding tasks requiring the user to write code (setting requiresTyping to true).

${companyName ? `Target Company Context:
- The candidate is interviewing at ${companyName}.
- Draw directly from actual, real-world past interview questions asked at ${companyName} for this role.
- Ground the question by referencing the target company's actual technical challenges or question style to build trust (e.g., 'A common question asked during ${companyName} interviews is...', '${companyName} interviewers frequently ask candidates to...'). Keep it highly realistic and legitimate.
` : ''}

Role: ${role}${companyString}
${jdContextString}
${rawJdString}
${topicStrings}
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
    return GenerateSingleInterviewQuestionOutputSchema.parse(json);
  } catch (error) {
    console.error('Error generating single interview question:', error);
    throw error;
  }
}
