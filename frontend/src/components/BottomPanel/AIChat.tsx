import React, { useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState, store } from '../../store/index';
import { batchUpdateFiles } from '../../store/filesSlice';

interface Props { projectId: string }

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export default function AIChat({ projectId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'system', content: 'AI Chat — describe what you want to change in your game. Try: "Make the player jump higher" or "/generate enemy"', timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const genSocket = io('/generation', {
        auth: { token: localStorage.getItem('foundry_token') },
        transports: ['websocket', 'polling'],
      });

      const state = store.getState();
      const existingFiles = state.files.items.map((f: any) => ({ path: f.path, content: f.content }));

      genSocket.emit('modify-game', { projectId, instruction: input, files: existingFiles });

      genSocket.on('modification-complete', (data: any) => {
        const assistantMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Modified ${data.files.length} file(s): ${data.files.map((f: any) => f.path).join(', ')}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);

        store.dispatch(batchUpdateFiles({ projectId, files: data.files }));
        setLoading(false);
        genSocket.disconnect();
      });

      genSocket.on('generation-error', (err: any) => {
        const errorMsg: ChatMessage = { id: Date.now().toString(), role: 'system', content: `Error: ${err.error}`, timestamp: new Date() };
        setMessages((prev) => [...prev, errorMsg]);
        setLoading(false);
        genSocket.disconnect();
      });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Failed to send message';
      const errorMsg: ChatMessage = { id: Date.now().toString(), role: 'system', content: `Error: ${errMsg}`, timestamp: new Date() };
      setMessages((prev) => [...prev, errorMsg]);
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e]">
      <div className="flex-1 overflow-auto p-3 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-[#0078d4] text-white'
                  : msg.role === 'system'
                  ? 'bg-[#2d2d2d] text-[#858585] italic'
                  : 'bg-[#2d2d2d] text-[#cccccc]'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="rounded-lg bg-[#2d2d2d] px-3 py-2 text-sm text-[#858585]">Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-[#3c3c3c] p-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Type a command... (/generate enemy, /style dark, /explain)"
            className="flex-1 rounded border border-[#3c3c3c] bg-[#3c3c3c] px-3 py-1.5 text-sm text-[#cccccc] placeholder-[#858585] focus:border-[#0078d4] focus:outline-none"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="rounded bg-[#0078d4] px-3 py-1.5 text-sm text-white hover:bg-[#1e8ae6] disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
