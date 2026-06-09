import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

export default function Terminal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<XTerm | null>(null);

  useEffect(() => {
    if (!containerRef.current || terminalRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: 'block',
      fontSize: 13,
      fontFamily: "'Cascadia Code', 'Fira Code', 'Source Code Pro', monospace",
      theme: {
        background: '#1e1e1e',
        foreground: '#cccccc',
        cursor: '#aeafad',
        selectionBackground: '#264f78',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);

    term.writeln('Foundry Terminal v1.0.0');
    term.writeln('Type "help" for commands.');
    term.write('$ ');

    let currentLine = '';
    term.onKey(({ key, domEvent }) => {
      if (domEvent.key === 'Enter') {
        term.writeln('');
        term.write('$ ');
        currentLine = '';
      } else if (domEvent.key === 'Backspace') {
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          term.write('\b \b');
        }
      } else if (!domEvent.ctrlKey && !domEvent.altKey && key.length === 1) {
        currentLine += key;
        term.write(key);
      }
    });

    terminalRef.current = term;

    const resize = () => fitAddon.fit();
    window.addEventListener('resize', resize);
    setTimeout(() => fitAddon.fit(), 100);

    return () => {
      window.removeEventListener('resize', resize);
      term.dispose();
      terminalRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
}
