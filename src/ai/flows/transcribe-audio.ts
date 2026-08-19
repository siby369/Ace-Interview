'use server';

import { z } from 'zod';
import { getCustomApiKey } from '@/ai/groq';

const TranscribeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe("A chunk of audio, as a data URI that must include a MIME type and use Base64 encoding."),
  languageCode: z.string().describe('The BCP-47 language code for transcription (e.g., "en-US", "es-ES").')
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

const TranscribeAudioOutputSchema = z.object({
  text: z.string().optional(),
  error: z.string().optional()
});
export type TranscribeAudioOutput = z.infer<typeof TranscribeAudioOutputSchema>;

export async function transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
  try {
    const { audioDataUri, languageCode } = input;
    
    // Extract base64 payload
    const match = audioDataUri.match(/^data:(audio\/[a-zA-Z0-9.-]+);base64,(.+)$/);
    if (!match) {
      throw new Error('Invalid audio data URI format');
    }
    
    const mimeType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    const groqApiKey = await getCustomApiKey();
    if (!groqApiKey) {
      return { error: 'Groq API Key is not set. Please open Settings and enter your Groq API Key.' };
    }

    const blob = new Blob([buffer], { type: mimeType });
    const formData = new FormData();
    // Groq expects a filename
    let extension = 'webm';
    if (mimeType.includes('mp4')) extension = 'mp4';
    if (mimeType.includes('mp3')) extension = 'mp3';
    
    formData.append('file', blob, `audio.${extension}`);
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('response_format', 'json');
    if (languageCode) {
      formData.append('language', languageCode.split('-')[0]); // Use 2-letter code
    }

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: formData
    });

    if (!response.ok) {
       const text = await response.text();
       console.error('Groq transcription failed:', text);
       return { error: 'Failed to transcribe audio' };
    }

    const result = await response.json();
    return { text: result.text || '' };
  } catch (err: any) {
    console.error('Transcription error:', err);
    return { error: err.message || 'Unknown transcription error' };
  }
}
