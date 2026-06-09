import OpenAI from 'openai';

interface CallOptions {
  model: string;
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export async function callOpenAI(apiKey: string, opts: CallOptions) {
  const client = new OpenAI({ apiKey });

  const messages: { role: 'system' | 'user'; content: string }[] = [];
  if (opts.systemPrompt) {
    messages.push({ role: 'system', content: opts.systemPrompt });
  }
  messages.push({ role: 'user', content: opts.prompt });

  const response = await client.chat.completions.create({
    model: opts.model || 'gpt-4o',
    messages,
    max_tokens: opts.maxTokens || 4096,
    temperature: opts.temperature ?? 0.7,
  });

  const choice = response.choices[0];
  return {
    content: choice?.message?.content || '',
    modelUsed: response.model || opts.model,
    tokensUsed: response.usage?.total_tokens || 0,
    costUsd: calculateCost(response.model || opts.model, response.usage?.total_tokens || 0),
  };
}

function calculateCost(model: string, tokens: number): number {
  const isGpt4 = model.includes('gpt-4');
  const ratePerToken = isGpt4 ? 0.00003 : 0.00001;
  return tokens * ratePerToken;
}
