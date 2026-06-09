interface CallOptions {
  model: string;
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

const GOOGLE_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

export async function callGoogle(apiKey: string, opts: CallOptions) {
  const model = opts.model || 'gemini-2.0-flash';
  const url = `${GOOGLE_API_BASE}/models/${model}:generateContent?key=${apiKey}`;

  const body: Record<string, unknown> = {
    contents: [{ parts: [{ text: opts.prompt }] }],
    generationConfig: {
      maxOutputTokens: opts.maxTokens || 4096,
      temperature: opts.temperature ?? 0.7,
    },
  };

  if (opts.systemPrompt) {
    body.systemInstruction = { parts: [{ text: opts.systemPrompt }] };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google AI API error ${response.status}: ${errText}`);
  }

  const data = (await response.json()) as any;
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  return {
    content: text,
    modelUsed: model,
    tokensUsed: data?.usageMetadata?.totalTokenCount || 0,
    costUsd: 0,
  };
}
