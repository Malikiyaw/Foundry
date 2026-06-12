import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/index';
import { getDecryptedKey } from '../../store/keysSlice';
import { streamAIResponse } from '../../services/aiProviders';
import { db, generateId, nowISO } from '../../services/db';
import { addFile, applyFileContent } from '../../store/filesSlice';
import { gameOrchestrator, StageProgress } from '../../services/gameOrchestrator';

interface Props { projectId: string }

interface Message { role: 'user' | 'assistant' | 'system'; content: string; timestamp: Date }

const TEMPLATES = [
  { id: 'platformer', label: 'Platformer', desc: 'Side-scrolling jump & run' },
  { id: 'rpg', label: 'Top-Down RPG', desc: 'Character movement, NPCs, inventory' },
  { id: 'runner', label: 'Endless Runner', desc: 'Auto-scrolling obstacle game' },
  { id: 'match3', label: 'Match-3 Puzzle', desc: 'Grid swapping puzzle game' },
  { id: 'visualnovel', label: 'Visual Novel', desc: 'Dialogue choices & branching' },
  { id: 'card', label: 'Card Battler', desc: 'Deck-building turn-based game' },
  { id: 'blank', label: 'Blank', desc: 'Start from scratch' },
];

export default function AIChat({ projectId }: Props) {
  const dispatch = useDispatch<AppDispatch>();
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

  const [showGenerator, setShowGenerator] = useState(false);
  const [genPrompt, setGenPrompt] = useState('');
  const [genTemplate, setGenTemplate] = useState('platformer');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState('');

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

  const addProjectFile = async (path: string, content: string, fileType = 'code') => {
    const existing = await db.files.where({ projectId, path }).first();
    const now = nowISO();
    if (existing) {
      await db.files.update(existing.id, { content, updatedAt: now, isGenerated: true });
      dispatch(applyFileContent({ fileId: existing.id, content }));
    } else {
      const id = generateId();
      const file = { id, projectId, path, content, fileType, isGenerated: true, createdAt: now, updatedAt: now };
      await db.files.add(file);
      dispatch(addFile(file));
    }
  };

  const handleGenerateGame = async () => {
    if (!genPrompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setGenProgress('');
    setShowGenerator(false);

    const systemMsg: Message = { role: 'system', content: `Starting game generation (${genTemplate})...`, timestamp: new Date() };
    setMessages((p) => [...p, systemMsg]);

    try {
      const result = await gameOrchestrator.generateGame(
        'local-user', projectId, genPrompt, genTemplate,
        (progress: StageProgress) => {
          setGenProgress(progress.message);
          const msg: Message = {
            role: 'system',
            content: progress.complete ? `Done: ${progress.message}` : `In progress: ${progress.message}`,
            timestamp: new Date(),
          };
          setMessages((p) => [...p, msg]);
        }
      );

      for (const file of result.files) {
        await addProjectFile(file.path, file.content, 'code');
      }

      for (const asset of result.assets) {
        await addProjectFile(asset.filename, atob(asset.data), 'image');
      }

      const summary = `**Generation Complete!**
- ${result.files.length} source files created
- ${result.assets.length} placeholder assets created
- ${result.sounds.length} sounds

${result.playtestResults ? `\n**Playtest Review:**\n${result.playtestResults}` : ''}`;

      setMessages((p) => [...p, { role: 'assistant', content: summary, timestamp: new Date() }]);
    } catch (e: any) {
      setMessages((p) => [...p, { role: 'system', content: `Failed: ${e.message}`, timestamp: new Date() }]);
    } finally {
      setIsGenerating(false);
      setGenProgress('');
      setGenPrompt('');
    }
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

          const blocks = extractCodeBlocks(fullText);
          for (const block of blocks) {
            if (block.code.trim()) {
              const path = guessFilePath(block.lang);
              await addProjectFile(path, block.code);
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
        <div className="flex-1" />
        <button
          className="rounded-md px-2 py-1 text-[10px] font-medium transition-all hover:opacity-80"
          style={{ background: 'var(--accent)', color: 'white' }}
          onClick={() => setShowGenerator(!showGenerator)}
        >
          {showGenerator ? 'Cancel' : 'Generate Game'}
        </button>
      </div>

      {showGenerator && (
        <div className="border-b p-3 space-y-2 animate-fadeIn" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
          <div className="grid grid-cols-4 gap-1.5">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                className={`rounded-lg p-2 text-[10px] text-left transition-all ${genTemplate === t.id ? 'ring-2' : 'opacity-70 hover:opacity-100'}`}
                style={{
                  background: genTemplate === t.id ? 'var(--accent)' : 'var(--bg-tertiary)',
                  color: genTemplate === t.id ? 'white' : 'var(--text-primary)',
                  borderColor: genTemplate === t.id ? 'var(--accent)' : 'transparent',
                }}
                onClick={() => setGenTemplate(t.id)}
              >
                <div className="font-medium">{t.label}</div>
                <div className="opacity-60">{t.desc}</div>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="input-field flex-1 !rounded-lg !text-[11px]"
              placeholder="Describe your game — theme, mechanics, style..."
              value={genPrompt}
              onChange={(e) => setGenPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerateGame(); } }}
            />
            <button
              className="rounded-lg px-4 py-2 text-[11px] font-medium transition-all"
              style={{ background: 'var(--accent)', color: 'white', opacity: (!genPrompt.trim() || isGenerating) ? 0.5 : 1 }}
              onClick={handleGenerateGame}
              disabled={!genPrompt.trim() || isGenerating}
            >
              {isGenerating ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full animate-bounce" style={{ background: 'white', animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full animate-bounce" style={{ background: 'white', animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full animate-bounce" style={{ background: 'white', animationDelay: '300ms' }} />
                </span>
              ) : 'Generate'}
            </button>
          </div>
          {genProgress && (
            <div className="text-[10px] animate-pulse" style={{ color: 'var(--text-muted)' }}>{genProgress}</div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fadeIn">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'var(--accent)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">Foundry AI</h3>
            <p className="text-xs max-w-[280px] mb-5" style={{ color: 'var(--text-secondary)' }}>
              Click "Generate Game" above for a full multi-agent pipeline, or chat below for individual prompts.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed whitespace-pre-wrap" style={{
              background: msg.role === 'user' ? 'var(--accent)' : msg.role === 'system' ? 'var(--danger-subtle)' : 'var(--bg-secondary)',
              color: msg.role === 'system' ? 'var(--text-primary)' : 'var(--text-primary)',
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
          <textarea ref={inputRef} className="input-field !resize-none !rounded-xl" rows={2} placeholder="Ask AI to write code, fix bugs, or improve your game..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
          <button
            className="flex h-[42px] w-[42px] items-center justify-center rounded-xl shrink-0 transition-all"
            style={{ background: isStreaming ? 'var(--danger)' : 'var(--accent)', opacity: (!input.trim() && !isStreaming) ? 0.5 : 1 }}
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
