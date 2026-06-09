'use server';

import { z } from 'zod';

const TranscribeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe("A chunk of audio, as a data URI that must include a MIME type and use Base64 encoding."),
  languageCode: z.string().describe('The BCP-47 language code for transcription (e.g., "en-US", "es-ES").')
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

const TranscribeAudioOutputSchema = z.object({
  text: z.string().describe('The transcribed text from the audio.'),
});
export type TranscribeAudioOutput = z.infer<typeof TranscribeAudioOutputSchema>;

export async function transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
  const { audioDataUri, languageCode } = input;
  
  // Extract base64 payload
  const match = audioDataUri.match(/^data:(audio\/[a-zA-Z0-9.-]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid audio data URI format');
  }
  
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, 'base64');
  
  const assemblyApiKey = process.env.AUDIO_API_KEY;
  if (!assemblyApiKey || assemblyApiKey === 'localmode') {
      throw new Error("AUDIO_API_KEY is not set or invalid for AssemblyAI.");
  }
  
  const baseUrl = process.env.AUDIO_BASE_URL || 'https://api.assemblyai.com/v2';
  
  // 1. Upload audio to AssemblyAI
  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': assemblyApiKey,
      'Content-Type': 'application/octet-stream'
    },
    body: buffer
  });
  
  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload audio to AssemblyAI: ${uploadResponse.statusText}`);
  }
  
  const uploadResult = await uploadResponse.json();
  const uploadUrl = uploadResult.upload_url;
  
  // 2. Request transcription
  // Convert language codes like 'en-US' to 'en' (AssemblyAI expects 2-letter codes)
  const shortLangCode = languageCode.split('-')[0];
  
  const transcriptResponse = await fetch(`${baseUrl}/transcript`, {
    method: 'POST',
    headers: {
      'Authorization': assemblyApiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      audio_url: uploadUrl,
      language_code: shortLangCode,
      speech_models: ["universal-3-pro", "universal-2"]
    })
  });
  
  if (!transcriptResponse.ok) {
    throw new Error(`Failed to request transcript from AssemblyAI: ${transcriptResponse.statusText}`);
  }
  
  const transcriptResult = await transcriptResponse.json();
  const transcriptId = transcriptResult.id;
  
  // 3. Poll for completion
  let status = transcriptResult.status;
  let text = '';
  
  while (status !== 'completed' && status !== 'error') {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const pollResponse = await fetch(`${baseUrl}/transcript/${transcriptId}`, {
      headers: {
        'Authorization': assemblyApiKey
      }
    });
    
    const pollResult = await pollResponse.json();
    status = pollResult.status;
    
    if (status === 'completed') {
      text = pollResult.text;
    } else if (status === 'error') {
      throw new Error(`AssemblyAI Transcription error: ${pollResult.error}`);
    }
  }
  
  return { text };
}
