'use server';

import { transcribeAudio } from './transcribe-audio';
import { groq } from '@/ai/groq';
import { z } from 'zod';
import { checkAndConsumeQuota } from '@/lib/quota';

const GetPronunciationFeedbackInputSchema = z.object({
  audioDataUri: z.string().describe("A chunk of audio, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"),
  expectedText: z.string().describe('The text the user was supposed to read.'),
});

export type GetPronunciationFeedbackInput = z.infer<typeof GetPronunciationFeedbackInputSchema>;

const WordFeedbackSchema = z.object({
  word: z.string(),
  isCorrect: z.boolean(),
  feedback: z.string().optional(),
});

const GetPronunciationFeedbackOutputSchema = z.object({
  overallScore: z.number(),
  transcript: z.string(),
  wordLevelFeedback: z.array(WordFeedbackSchema),
  generalFeedback: z.string(),
});

export type GetPronunciationFeedbackOutput = z.infer<typeof GetPronunciationFeedbackOutputSchema>;

function scoreTranscript(expectedText: string, transcript: string) {
  const expectedWords = expectedText.replace(/[^\w\s']/g, '').split(/\s+/).filter(Boolean);
  const transcriptWords = transcript.replace(/[^\w\s']/g, '').split(/\s+/).filter(Boolean);
  const transcriptSet = new Set(transcriptWords.map((w) => w.toLowerCase()));
  const matched = expectedWords.filter((word) => transcriptSet.has(word.toLowerCase())).length;
  return Math.max(20, Math.min(100, Math.round((matched / Math.max(expectedWords.length, 1)) * 100)));
}

export async function getPronunciationFeedback(
  input: GetPronunciationFeedbackInput
): Promise<GetPronunciationFeedbackOutput> {
  const quota = await checkAndConsumeQuota(3);
  if (!quota.success) {
    throw new Error(quota.error);
  }

  const { audioDataUri, expectedText } = GetPronunciationFeedbackInputSchema.parse(input);

  const transcriptResult = await transcribeAudio({ audioDataUri, languageCode: 'en-US' });
  const transcript = transcriptResult.text || '';

  const prompt = `You are an expert pronunciation and speaking coach.

Expected text:
${expectedText}

User transcript:
${transcript}

Analyze the user's spoken delivery. Focus on likely pronunciation, pacing, omitted words, extra words, and confidence based on the transcript mismatch and phrasing.

Return JSON exactly in this shape:
{
  "overallScore": number,
  "transcript": "string",
  "wordLevelFeedback": [
    {
      "word": "string",
      "isCorrect": boolean,
      "feedback": "string"
    }
  ],
  "generalFeedback": "string"
}

Use short, concrete feedback. If a word appears in the expected text but not the transcript, mark it incorrect.`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: process.env.TEXT_MODEL || 'openrouter/free',
    response_format: { type: 'json_object' },
  });

  let content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content received from Groq');
  }

  content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  const parsed = GetPronunciationFeedbackOutputSchema.parse(JSON.parse(content));
  return {
    ...parsed,
    transcript: parsed.transcript || transcript,
    overallScore: Number.isFinite(parsed.overallScore) ? parsed.overallScore : scoreTranscript(expectedText, transcript),
  };
}
