interface CallOptions {
  model: string;
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';

export async function callOpenRouter(apiKey: string, opts: CallOptions) {
  const messages: { role: string; content: string }[] = [];
  if (opts.systemPrompt) {
    messages.push({ role: 'system', content: opts.systemPrompt });
  }
  messages.push({ role: 'user', content: opts.prompt });

  const response = await fetch(`${OPENROUTER_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://foundry.gg',
    },
    body: JSON.stringify({
      model: opts.model || 'openai/gpt-4o',
      messages,
      max_tokens: opts.maxTokens || 4096,
      temperature: opts.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${errText}`);
  }

  const data = (await response.json()) as any;
  return {
    content: data?.choices?.[0]?.message?.content || '',
    modelUsed: data?.model || opts.model,
    tokensUsed: data?.usage?.total_tokens || 0,
    costUsd: 0,
  };
}
