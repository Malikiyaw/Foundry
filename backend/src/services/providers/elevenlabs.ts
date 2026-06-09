interface CallOptions {
  model: string;
  prompt: string;
  maxTokens?: number;
}

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';

export async function callElevenLabs(apiKey: string, opts: CallOptions) {
  const voiceId = opts.model || '21m00Tcm4TlvDq8ikWAM';

  const response = await fetch(`${ELEVENLABS_API_BASE}/text-to-speech/${voiceId}/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text: opts.prompt,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.5 },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ElevenLabs API error ${response.status}: ${errText}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());

  return {
    content: audioBuffer.toString('base64'),
    modelUsed: `elevenlabs-${voiceId}`,
    tokensUsed: 0,
    costUsd: 0.01,
  };
}
