import Anthropic from '@anthropic-ai/sdk';

interface CallOptions {
  model: string;
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export async function callAnthropic(apiKey: string, opts: CallOptions) {
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: opts.model || 'claude-sonnet-4-20250514',
    max_tokens: opts.maxTokens || 4096,
    system: opts.systemPrompt || '',
    messages: [{ role: 'user', content: opts.prompt }],
    temperature: opts.temperature ?? 0.7,
  });

  const content = response.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as any).text)
    .join('\n');

  return {
    content,
    modelUsed: response.model,
    tokensUsed: (response as any).usage?.input_tokens + (response as any).usage?.output_tokens || 0,
    costUsd: 0.000015 * ((response as any).usage?.input_tokens + (response as any).usage?.output_tokens || 0),
  };
}
