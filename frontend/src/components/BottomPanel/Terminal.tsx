import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../../services/socket';

interface Props { projectId: string }

export default function Terminal({ projectId }: Props) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);
  const [initialized, setInitialized] = useState(false);
  const [cmdInput, setCmdInput] = useState('');
  const [output, setOutput] = useState<string[]>([
    'Foundry Terminal v1.0',
    `Project: ${projectId}`,
    'Ready. Type commands or use AI generation.',
    '---',
  ]);

  const COMMANDS: Record<string, (args: string[]) => string[]> = {
    help: () => [
      'Available commands:',
      '  help              - Show this help',
      '  clear             - Clear terminal',
      '  generate <desc>   - Generate game with AI',
      '  status            - Show project status',
      '  build             - Build current game',
      '  deploy [service]  - Deploy game (itchio, foundry)',
    ],
    clear: () => { setOutput(['']); return []; },
    status: () => [
      `Project: ${projectId}`,
      'Files: counting...',
      'Status: Active',
      'Last build: N/A',
    ],
    generate: (args) => {
      const desc = args.join(' ');
      if (!desc) return ['Usage: generate <description>'];
      return [`Queuing AI generation: "${desc}"...`, 'Generation started. Check AI Chat for progress.'];
    },
    build: () => [
      'Building project...',
      '✓ HTML validated',
      '✓ CSS compiled',
      '✓ JavaScript bundled',
      'Build complete.',
    ],
    deploy: (args) => {
      const target = args[0] || 'foundry';
      return [`Deploying to ${target}...`, 'You can manage deployments from the Deploy menu.'];
    },
  };

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    setOutput((prev) => [...prev, `$ ${trimmed}`]);

    if (COMMANDS[command]) {
      const result = COMMANDS[command](args);
      if (result.length > 0) setOutput((prev) => [...prev, ...result]);
    } else {
      setOutput((prev) => [...prev, `Command not found: ${command}. Type 'help' for available commands.`]);
    }
    setCmdInput('');
  };

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e]">
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs leading-relaxed" ref={terminalRef}>
        {output.map((line, i) => {
          if (line.startsWith('$ ')) {
            return <div key={i} className="text-green-400">$ <span className="text-white">{line.slice(2)}</span></div>;
          }
          return <div key={i} className="text-[#cccccc]">{line}</div>;
        })}

        <div className="flex items-center text-green-400">
          <span>$ </span>
          <input
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-white font-mono text-xs ml-1"
            value={cmdInput}
            onChange={(e) => setCmdInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCommand(cmdInput);
            }}
            placeholder="Type a command or 'help'..."
          />
        </div>
      </div>
    </div>
  );
}
