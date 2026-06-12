import React, { useState } from 'react';

interface Props { projectId: string }

export default function Terminal({ projectId }: Props) {
  const [output, setOutput] = useState<string[]>([
    'Foundry Terminal v1.0',
    `Project: ${projectId}`,
    '---',
  ]);
  const [cmdInput, setCmdInput] = useState('');

  const COMMANDS: Record<string, (args: string[]) => string[]> = {
    help: () => ['Commands: help, clear, generate, status, build, deploy'],
    clear: () => { setOutput(['']); return []; },
    status: () => [`Project: ${projectId}`, 'Status: Active'],
    generate: (args) => args.length ? [`Queuing AI generation: "${args.join(' ')}"...`] : ['Usage: generate <description>'],
    build: () => ['Building...', '✓ Build complete.'],
    deploy: (args) => [`Deploying to ${args[0] || 'foundry'}...`],
  };

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();
    setOutput((prev) => [...prev, `$ ${trimmed}`]);
    if (COMMANDS[command]) {
      const result = COMMANDS[command](parts.slice(1));
      if (result.length > 0) setOutput((prev) => [...prev, ...result]);
    } else {
      setOutput((prev) => [...prev, `Unknown command: ${command}. Type 'help'.`]);
    }
    setCmdInput('');
  };

  return (
    <div className="flex h-full flex-col" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs leading-relaxed">
        {output.map((line, i) => (
          <div key={i} style={{ color: line.startsWith('$ ') ? 'var(--success)' : 'var(--text-secondary)' }}>
            {line.startsWith('$ ') ? <><span style={{ color: 'var(--accent)' }}>$ </span>{line.slice(2)}</> : line}
          </div>
        ))}
        <div className="flex items-center" style={{ color: 'var(--accent)' }}>
          <span>$ </span>
          <input
            autoFocus
            className="flex-1 bg-transparent border-none outline-none font-mono text-xs ml-1"
            style={{ color: 'var(--text-primary)' }}
            value={cmdInput}
            onChange={(e) => setCmdInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCommand(cmdInput); }}
            placeholder="Type a command..."
          />
        </div>
      </div>
    </div>
  );
}
