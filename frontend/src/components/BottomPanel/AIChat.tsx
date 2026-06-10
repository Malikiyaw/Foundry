import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index';
import { getDecryptedKey } from '../../store/keysSlice';
import { streamAIResponse } from '../../services/aiProviders';
import { db, generateId } from '../../services/db';

interface Props { projectId: string }

interface Message { role: 'user' | 'assistant' | 'system'; content: string; timestamp: Date }

export default function AIChat({ projectId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const keys = useSelector((state: RootState) => state.keys.items);

  useEffect(() => { setAvailableProviders(keys.filter(k => k.isActive).map(k => k.provider)); }, [keys]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamedContent]);

  const extractCodeBlocks = (text: string): { lang: string; code: string }[] => {
    const blocks: { lang: string; code: string }[] = [];
    const regex = /```(\w*)\n([\s\S]*?)```/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      blocks.push({ lang: match[1] || 'text', code: match[2] });
    }
    return blocks;
  };

  const guessFilePath = (lang: string): string => {
    const map: Record<string, string> = {
      javascript: 'game.js', typescript: 'game.ts', html: 'index.html',
      css: 'style.css', python: 'main.py', json: 'config.json',
      js: 'game.js', ts: 'game.ts',
    };
    return map[lang] || `file.${lang}`;
  };

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;
    const userMsg: Message = { role: 'user', content: input, timestamp: new Date() };
    setMessages((p) => [...p, userMsg]);
    setInput(''); setIsStreaming(true); setStreamedContent('');

    const activeKeys = keys.filter(k => k.isActive);
    const provider = activeKeys.find(k => k.provider === selectedProvider) || activeKeys[0];
    if (!provider) {
      setMessages((p) => [...p, { role: 'system', content: 'No active API key found. Add a key in Settings first.', timestamp: new Date() }]);
      setIsStreaming(false); return;
    }

    try {
      const apiKey = await getDecryptedKey(provider.id);
      if (!apiKey) { throw new Error('Failed to decrypt API key'); }

      abortRef.current = new AbortController();
      const systemPrompt = `You are a game developer assistant. Generate complete, working game code.
Generate files with code blocks using markdown format: \`\`\`language\ncode\n\`\`\`
The main HTML file should be named index.html. Use Phaser 3 (loaded from CDN) for game development.
Include all necessary logic. Make sure the game is fully functional and runnable.`;

      await streamAIResponse(
        provider.provider, apiKey, input, systemPrompt,
        (chunk) => setStreamedContent((p) => p + chunk),
        async (fullText) => {
          setStreamedContent('');
          setMessages((p) => [...p, { role: 'assistant', content: fullText, timestamp: new Date() }]);

          // Extract code blocks and save as files
          const blocks = extractCodeBlocks(fullText);
          for (const block of blocks) {
            if (block.code.trim()) {
              const path = guessFilePath(block.lang);
              const existing = await db.files.where({ projectId, path }).first();
              if (existing) {
                await db.files.update(existing.id, { content: block.code, updatedAt: new Date().toISOString(), isGenerated: true });
              } else {
                await db.files.add({
                  id: generateId(), projectId, path, content: block.code,
                  fileType: 'code', isGenerated: true,
                  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
                });
              }
            }
          }
          setIsStreaming(false);
        },
        (err) => {
          setMessages((p) => [...p, { role: 'system', content: err, timestamp: new Date() }]);
          setStreamedContent(''); setIsStreaming(false);
        },
        abortRef.current?.signal,
      );
    } catch (e: any) {
      setMessages((p) => [...p, { role: 'system', content: e.message, timestamp: new Date() }]);
      setStreamedContent(''); setIsStreaming(false);
    }
  };

  const cancelStream = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
  };

  return (
    <div className="flex h-full flex-col" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex shrink-0 items-center gap-2 border-b px-3 py-1.5" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
        <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>AI:</span>
        <select
          className="rounded-md border px-2 py-1 text-[10px] font-mono outline-none"
          style={{ background: 'var(--bg-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value)}
        >
          {keys.filter(k => k.isActive).map((k) => (
            <option key={k.id} value={k.provider}>{k.provider}</option>
          ))}
          {keys.filter(k => k.isActive).length === 0 && (
            <option value="">No keys active</option>
          )}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fadeIn">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'var(--gradient-1)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Foundry AI</h3>
            <p className="text-xs max-w-[280px] mb-5" style={{ color: 'var(--text-secondary)' }}>
              Describe your game idea. AI agents will generate code directly in your browser.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed whitespace-pre-wrap" style={{
              background: msg.role === 'user' ? 'var(--accent)' : msg.role === 'system' ? 'var(--danger-subtle)' : 'var(--bg-secondary)',
              color: msg.role === 'system' ? 'var(--danger)' : 'var(--text-primary)',
              borderBottomRightRadius: msg.role === 'user' ? '4px' : undefined,
              borderBottomLeftRadius: msg.role !== 'user' ? '4px' : undefined,
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex justify-start animate-fadeIn">
            <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-2.5 text-xs" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
              {streamedContent || (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full animate-bounce" style={{ background: 'var(--accent)', animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full animate-bounce" style={{ background: 'var(--accent)', animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full animate-bounce" style={{ background: 'var(--accent)', animationDelay: '300ms' }} />
                  </div>
                  <span style={{ color: 'var(--text-muted)' }}>Generating...</span>
                </div>
              )}
              {streamedContent && <span className="inline-block h-3.5 w-0.5 ml-0.5 animate-pulse" style={{ background: 'var(--accent)' }} />}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-3 shrink-0" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
        <div className="flex items-end gap-2">
          <textarea ref={inputRef} className="input-field !resize-none !rounded-xl" rows={2} placeholder="Describe what to build or change..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
          <button
            className="flex h-[42px] w-[42px] items-center justify-center rounded-xl shrink-0 transition-all"
            style={{ background: isStreaming ? 'var(--danger)' : 'var(--gradient-1)', opacity: (!input.trim() && !isStreaming) ? 0.5 : 1 }}
            onClick={isStreaming ? cancelStream : sendMessage}
            disabled={!input.trim() && !isStreaming}
          >
            {isStreaming ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><rect x="6" y="6" width="12" height="12" rx="1" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
