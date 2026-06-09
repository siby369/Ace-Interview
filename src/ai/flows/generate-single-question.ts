'use server';

import { createFastTextCompletion } from '@/ai/groq';
import { z } from 'zod';

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
  const { role, topics, previousQuestions, jdContext } = GenerateSingleInterviewQuestionInputSchema.parse(input);

  const topicStrings = Object.entries(topics)
    .map(([topic, difficulty]) => `- Topic: ${topic}, Difficulty: ${difficulty}`)
    .join('\n');

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

  const prompt = `You are an expert interview question generator. For the given role, generate exactly ONE new relevant interview question.
Select one of the provided topics to focus on, ensuring the question matches the specified difficulty level.
- If the difficulty is "Easy", ask a straightforward definition-based or simple-concept question. These should not require typing.
- If the difficulty is "Medium", ask a question that requires explaining a process or comparing concepts. These should not require typing.
- If the difficulty is "Hard", ask a complex scenario-based or design/coding question. Only set requiresTyping to true for questions that explicitly ask to write code or a complex algorithm.

Role: ${role}
${jdContextString}
Selected Topics to choose from:
${topicStrings}
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
    return GenerateSingleInterviewQuestionOutputSchema.parse(json);
  } catch (error) {
    console.error('Error generating single interview question:', error);
    throw error;
  }
}
