export const groq = {
  chat: {
    completions: {
      create: async (params: {
        messages: { role: string; content: string }[];
        model: string;
        response_format?: { type: 'json_object' | 'text' };
      }) => {
        const apiKey = process.env.TEXT_API_KEY || process.env.GROQ_API_KEY || 'localmode';
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
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
          throw new Error("GROQ_API_KEY is not set. Please get a free key from console.groq.com to use the fast analysis engine.");
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
  const groqKey = process.env.GROQ_API_KEY;
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

  throw new Error(errors.join(' | ') || 'No text generation provider configured.');
}
