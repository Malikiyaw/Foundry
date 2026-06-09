import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../../services/socket';

interface Props { projectId: string }

export default function AIChat({ projectId }: Props) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant' | 'system'; content: string; timestamp: Date }[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const [selectedModel, setSelectedModel] = useState('auto');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const socket = useSocket();

  const SUGGESTIONS = [
    'Create a platformer game with 3 levels',
    'Add a scoring system and leaderboard',
    'Improve the physics and collision detection',
    'Add sound effects and background music',
    'Create a main menu with start/options buttons',
    'Add mobile touch controls',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamedContent]);

  useEffect(() => {
    if (!socket) return;
    socket.on('ai:stream', ({ content }: { content: string }) => {
      setStreamedContent((prev) => prev + content);
    });
    socket.on('ai:complete', ({ content }: { content: string }) => {
      setMessages((prev) => [...prev, { role: 'assistant', content: streamedContent + content, timestamp: new Date() }]);
      setStreamedContent('');
      setIsStreaming(false);
    });
    socket.on('ai:error', ({ message }: { message: string }) => {
      setMessages((prev) => [...prev, { role: 'system', content: `Error: ${message}`, timestamp: new Date() }]);
      setStreamedContent('');
      setIsStreaming(false);
    });
    return () => {
      socket.off('ai:stream'); socket.off('ai:complete'); socket.off('ai:error');
    };
  }, [socket, streamedContent]);

  const sendMessage = () => {
    if (!input.trim() || !socket || isStreaming) return;
    const userMsg = { role: 'user' as const, content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);
    setStreamedContent('');
    socket.emit('ai:generate', { projectId, prompt: input, model: selectedModel });
  };

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e]">
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-2xl mb-3">✦</div>
            <h3 className="text-sm text-[#cccccc] font-medium mb-1">Foundry AI Assistant</h3>
            <p className="text-[11px] text-[#858585] mb-3 max-w-[300px]">
              Describe the game or feature you want to build. I'll generate the code, assets, and sounds.
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center max-w-[350px]">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  className="rounded-full border border-[#3c3c3c] bg-[#2d2d2d] px-2.5 py-1 text-[10px] text-[#cccccc] hover:bg-[#094771] hover:border-[#094771] transition-colors"
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg px-3 py-1.5 text-xs ${
              msg.role === 'user' ? 'bg-[#094771] text-white' :
              msg.role === 'system' ? 'bg-[#3c3c3c] text-red-400' : 'bg-[#2d2d2d] text-[#cccccc]'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg bg-[#2d2d2d] px-3 py-1.5 text-xs text-[#cccccc]">
              {streamedContent}
              <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-blue-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-[#3c3c3c] bg-[#252526] p-2 shrink-0">
        <div className="flex items-start gap-2">
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              className="w-full resize-none rounded border border-[#3c3c3c] bg-[#3c3c3c] px-2.5 py-1.5 text-xs text-[#cccccc] outline-none focus:border-[#0078d4] transition-colors placeholder-[#858585]"
              rows={2}
              placeholder="Describe what you want to build or change..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            />
          </div>
          <button
            className={`flex h-[34px] w-[34px] items-center justify-center rounded transition-colors ${
              isStreaming ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0078d4] hover:bg-[#1e8ae6]'
            }`}
            onClick={isStreaming ? () => { socket?.emit('ai:cancel'); setIsStreaming(false); } : sendMessage}
            disabled={!input.trim() && !isStreaming}
            title={isStreaming ? 'Cancel' : 'Send'}
          >
            {isStreaming ? (
              <span className="text-white text-xs">■</span>
            ) : (
              <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
