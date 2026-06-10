const PROVIDER_URLS: Record<string, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  google: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  replicate: 'https://api.replicate.com/v1/predictions',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
};

export async function streamAIResponse(
  provider: string,
  apiKey: string,
  prompt: string,
  systemPrompt: string,
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: (err: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const url = PROVIDER_URLS[provider];
 if (!url) {
   onError(`Provider "${provider}" not supported for streaming`);
   return;
  }

  if (provider === 'openai' || provider === 'openrouter') {
    try {
      const res = await fetch(url, {
    method: 'POST',
    headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          ...(provider === 'openrouter' ? { 'HTTP-Referer': window.location.origin } : {}),
        },
        body: JSON.stringify({
          model: provider === 'openrouter' ? 'openai/gpt-4o-mini' : 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          stream: true,
        }),
        signal,
      });
      if (!res.ok) { const err = await res.text(); onError(`API error: ${res.status} - ${err}`); return; }
      const reader = res.body?.getReader();
      if (!reader) { onError('No response body'); return; }
      const decoder = new TextDecoder();
      let fullText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.startsWith('data: ') && !l.includes('[DONE]'));
        for (const line of lines) {
          try {
            const json = JSON.parse(line.slice(6));
            const text = json.choices?.[0]?.delta?.content || '';
            if (text) { fullText += text; onChunk(text); }
          } catch {}
        }
      }
      onDone(fullText);
    } catch (e: any) {
      if (e.name === 'AbortError') { onDone(''); return; }
      onError(e.message);
    }
  } else if (provider === 'anthropic') {
    try {
      const res = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          system: systemPrompt,
          messages: [{ role: 'user', content: prompt }],
          stream: true,
        }),
        signal,
      });
      if (!res.ok) { const err = await res.text(); onError(`Anthropic error: ${res.status} - ${err}`); return; }
      const reader = res.body?.getReader();
      if (!reader) { onError('No response body'); return; }
      const decoder = new TextDecoder();
      let fullText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n').filter(l => l.startsWith('data: '))) {
          try {
            const json = JSON.parse(line.slice(6));
            if (json.type === 'content_block_delta' && json.delta?.text) {
              fullText += json.delta.text; onChunk(json.delta.text);
            }
          } catch {}
        }
      }
      onDone(fullText);
    } catch (e: any) {
      if (e.name === 'AbortError') { onDone(''); return; }
      onError(e.message);
    }
  } else if (provider === 'google') {
    try {
      const res = await fetch(`${url}?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }],
          generationConfig: { maxOutputTokens: 4096 },
        }),
        signal,
      });
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(data);
      onChunk(text); onDone(text);
    } catch (e: any) {
      if (e.name === 'AbortError') { onDone(''); return; }
      onError(e.message);
    }
  } else {
    // Fallback for unsupported streaming providers
    try {
      const res = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ input: { prompt: `${systemPrompt}\n\n${prompt}` } }),
        signal,
      });
      const data = await res.json();
      const text = JSON.stringify(data);
      onChunk(text); onDone(text);
    } catch (e: any) {
      if (e.name === 'AbortError') { onDone(''); return; }
      onError(e.message);
   }
  }
}

export async function callAIProvider(
  provider: string,
  apiKey: string,
  prompt: string,
  systemPrompt: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    streamAIResponse(provider, apiKey, prompt, systemPrompt,
      () => {},
      (text) => resolve(text),
      (err) => reject(new Error(err)),
    );
  });
}
