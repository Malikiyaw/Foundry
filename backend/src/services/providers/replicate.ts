import Replicate from 'replicate';

interface CallOptions {
  model: string;
  prompt: string;
  maxTokens?: number;
}

export async function callReplicate(apiKey: string, opts: CallOptions) {
  const client = new Replicate({ auth: apiKey });

  const output = await client.run(
    opts.model as `${string}/${string}` | `${string}/${string}:${string}`,
    {
      input: {
        prompt: opts.prompt,
        max_tokens: opts.maxTokens || 2048,
      },
    }
  );

  const content = Array.isArray(output) ? output.join('\n') : String(output);

  return {
    content,
    modelUsed: opts.model,
    tokensUsed: 0,
    costUsd: 0,
  };
}
