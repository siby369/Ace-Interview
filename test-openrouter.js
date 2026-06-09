const Groq = require('groq-sdk');
require('dotenv').config();

console.log('TEXT_API_KEY:', process.env.TEXT_API_KEY ? 'exists' : 'missing');
console.log('TEXT_BASE_URL:', process.env.TEXT_BASE_URL);
console.log('TEXT_MODEL:', process.env.TEXT_MODEL);

const groq = {
  chat: {
    completions: {
      create: async (params) => {
        const apiKey = process.env.TEXT_API_KEY || 'localmode';
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
          throw new Error(`API error (${response.status}): ${errText}`);
        }

        return await response.json();
      }
    }
  }
};

async function main() {
    try {
        console.log('Sending chat completion request with meta-llama/llama-3.3-70b-instruct:free...');
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: 'Say hello in 5 words or less' }],
            model: 'meta-llama/llama-3.3-70b-instruct:free',
        });
        console.log('Success:', completion.choices[0]?.message?.content);
    } catch (e) {
        console.error('Error occurred:', e.message || e);
    }
}

main();
