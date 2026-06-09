const Groq = require('groq-sdk');

const groq1 = new Groq({ apiKey: 'test', baseURL: 'https://openrouter.ai/api/v1' });
console.log('groq1.baseURL:', groq1.baseURL);

const groq2 = new Groq({ apiKey: 'test', baseURL: 'https://openrouter.ai/api' });
console.log('groq2.baseURL:', groq2.baseURL);

const groq3 = new Groq({ apiKey: 'test' });
console.log('groq3.baseURL (default):', groq3.baseURL);
