import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../../services/socket';

interface Props { projectId: string }

interface Message { role: 'user' | 'assistant' | 'system'; content: string; timestamp: Date }

export default function AIChat({ projectId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const socket = useSocket();

  const SUGGESTIONS = [
    'Create a platformer with 3 levels',
    'Add scoring and leaderboard',
    'Add sound effects and music',
    'Create a main menu',
    'Add mobile touch controls',
    'Improve physics and collisions',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamedContent]);

  useEffect(() => {
    if (!socket) return;
    socket.on('ai:stream', ({ content }: { content: string }) => setStreamedContent((p) => p + content));
    socket.on('ai:complete', ({ content }: { content: string }) => {
      setMessages((p) => [...p, { role: 'assistant', content: streamedContent + content, timestamp: new Date() }]);
      setStreamedContent(''); setIsStreaming(false);
    });
    socket.on('ai:error', ({ message }: { message: string }) => {
      setMessages((p) => [...p, { role: 'system', content: `Error: ${message}`, timestamp: new Date() }]);
      setStreamedContent(''); setIsStreaming(false);
    });
    return () => { socket.off('ai:stream'); socket.off('ai:complete'); socket.off('ai:error'); };
  }, [socket, streamedContent]);

  const sendMessage = () => {
    if (!input.trim() || !socket || isStreaming) return;
    setMessages((p) => [...p, { role: 'user', content: input, timestamp: new Date() }]);
    setInput(''); setIsStreaming(true); setStreamedContent('');
    socket.emit('ai:generate', { projectId, prompt: input });
  };

  return (
    <div className="flex h-full flex-col" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fadeIn">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'var(--gradient-1)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Foundry AI</h3>
            <p className="text-xs max-w-[280px] mb-5" style={{ color: 'var(--text-secondary)' }}>
              Describe your game idea. AI agents will generate code, assets, and sounds.
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center max-w-[340px]">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  className="rounded-full px-3 py-1.5 text-[10px] font-medium transition-all hover:scale-105"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' }}
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            <div
              className="max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed"
              style={{
                background: msg.role === 'user'
                  ? 'var(--accent)'
                  : msg.role === 'system'
                    ? 'var(--danger-subtle)'
                    : 'var(--bg-secondary)',
                color: msg.role === 'system' ? 'var(--danger)' : 'var(--text-primary)',
                borderBottomRightRadius: msg.role === 'user' ? '4px' : undefined,
                borderBottomLeftRadius: msg.role !== 'user' ? '4px' : undefined,
              }}
            >
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
                  <span style={{ color: 'var(--text-muted)' }}>Thinking...</span>
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
          <textarea
            ref={inputRef}
            className="input-field !resize-none !rounded-xl"
            rows={2}
            placeholder="Describe what to build or change..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          />
          <button
            className="flex h-[42px] w-[42px] items-center justify-center rounded-xl shrink-0 transition-all"
            style={{
              background: isStreaming ? 'var(--danger)' : 'var(--gradient-1)',
              opacity: (!input.trim() && !isStreaming) ? 0.5 : 1,
            }}
            onClick={isStreaming ? () => { socket?.emit('ai:cancel'); setIsStreaming(false); } : sendMessage}
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
