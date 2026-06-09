interface CallOptions {
  model: string;
  prompt: string;
  imageData?: Buffer;
}

const STABILITY_API_BASE = 'https://api.stability.ai/v2beta';

export async function callStability(apiKey: string, opts: CallOptions) {
  const model = opts.model || 'stable-image-ultra';

  const formData = new FormData();
  formData.append('prompt', opts.prompt);
  formData.append('output_format', 'png');

  if (opts.imageData) {
    const blob = new Blob([opts.imageData]);
    formData.append('image', blob, 'input.png');
  }

  const response = await fetch(`${STABILITY_API_BASE}/generation/${model}/image-to-image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'image/*',
    },
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Stability API error ${response.status}: ${errText}`);
  }

  const imageBuffer = Buffer.from(await response.arrayBuffer());

  return {
    content: imageBuffer.toString('base64'),
    modelUsed: model,
    tokensUsed: 0,
    costUsd: 0.04,
  };
}
