'use server';

import { createClient } from '@/utils/supabase/server';

export async function verifyGroqApiKey(): Promise<{ valid: boolean, error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let apiKey = process.env.GROQ_API_KEY;

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('custom_api_key')
        .eq('id', user.id)
        .single();
        
      if (profile?.custom_api_key) {
        apiKey = profile.custom_api_key;
      }
    }

    if (!apiKey) {
      return { valid: false, error: 'No API key is configured.' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    // Ping Groq's models endpoint
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) return { valid: false, error: 'Your API key is invalid or unauthorized.' };
      if (response.status === 429) return { valid: false, error: 'Your API key has reached its rate limit or token limit.' };
      return { valid: false, error: `API Check Failed (${response.status})` };
    }

    return { valid: true };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { valid: false, error: 'API check timed out.' };
    }
    return { valid: false, error: error.message };
  }
}
