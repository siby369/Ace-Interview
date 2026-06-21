async function getCustomApiKey(): Promise<string | null> {
  try {
    const { createClient } = await import('@/utils/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('custom_api_key')
      .eq('id', user.id)
      .single();
      
    return profile?.custom_api_key || null;
  } catch (error) {
    console.error('Error fetching custom API key from Supabase:', error);
    return null;
  }
}

export const groq = {
  chat: {
    completions: {
      create: async (params: {
        messages: { role: string; content: string }[];
        model: string;
        response_format?: { type: 'json_object' | 'text' };
      }) => {
        const customKey = await getCustomApiKey();
        const apiKey = customKey || process.env.TEXT_API_KEY || process.env.GROQ_API_KEY || 'localmode';
        const authHeader = apiKey.startsWith('Bearer ') ? apiKey : `Bearer ${apiKey}`;
        const baseUrl = process.env.TEXT_BASE_URL || 'https://api.groq.com/openai/v1';
        
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: params.model,
            messages: params.messages,
            response_format: params.response_format,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`OpenAI API error (${response.status}): ${errText}`);
        }

        return await response.json();
      }
    }
  }
};

export const fastGroq = {
  chat: {
    completions: {
      create: async (params: {
        messages: { role: string; content: string }[];
        model: string;
        response_format?: { type: 'json_object' | 'text' };
      }) => {
        const customKey = await getCustomApiKey();
        const apiKey = customKey || process.env.GROQ_API_KEY;
        if (!apiKey) {
          throw new Error("Groq API Key is not set. Please open Settings in the top-right and enter your Groq API Key to start practicing.");
        }
        
        const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: params.model,
            messages: params.messages,
            response_format: params.response_format,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Groq API error (${response.status}): ${errText}`);
        }

        return await response.json();
      }
    }
  }
};

type CompletionParams = {
  messages: { role: string; content: string }[];
  model?: string;
  response_format?: { type: 'json_object' | 'text' };
};

async function createWithTimeout(
  url: string,
  headers: Record<string, string>,
  body: Record<string, unknown>,
  timeoutMs = 8000
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API error (${response.status}): ${errText}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function createFastTextCompletion(params: CompletionParams) {
  const customKey = await getCustomApiKey();
  const groqKey = customKey || process.env.GROQ_API_KEY;
  const textKey = process.env.TEXT_API_KEY;
  const textBaseUrl = process.env.TEXT_BASE_URL || 'https://openrouter.ai/api/v1';

  const primaryModel = process.env.GROQ_TEXT_MODEL || 'llama-3.1-8b-instant';
  const fallbackModel = process.env.TEXT_MODEL || 'openrouter/free';

  const errors: string[] = [];

  if (groqKey) {
    try {
      return await createWithTimeout(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        {
          model: primaryModel,
          messages: params.messages,
          response_format: params.response_format,
        },
        5000
      );
    } catch (error) {
      errors.push(`Groq failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (textKey) {
    try {
      return await createWithTimeout(
        `${textBaseUrl}/chat/completions`,
        {
          Authorization: textKey.startsWith('Bearer ') ? textKey : `Bearer ${textKey}`,
          'Content-Type': 'application/json',
        },
        {
          model: fallbackModel,
          messages: params.messages,
          response_format: params.response_format,
        },
        9000
      );
    } catch (error) {
      errors.push(`Fallback failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(errors.join(' | ') || 'No API key configured. Please open Settings in the top-right and enter your Groq API Key to start practicing.');
}
