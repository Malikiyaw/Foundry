import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Spinner } from '../shared/Spinner';

interface Props {
  path: string;
  content: string;
  onChange?: (value: string | undefined) => void;
  showMinimap: boolean;
  fontSize: number;
}

type MonacoEditor = any;

const LANGUAGE_MAP: Record<string, string> = {
  js: 'javascript', ts: 'typescript', jsx: 'javascript', tsx: 'typescript',
  html: 'html', htm: 'html', css: 'css', scss: 'scss', less: 'less',
  json: 'json', md: 'markdown', py: 'python', rb: 'ruby', go: 'go',
  rs: 'rust', swift: 'swift', kt: 'kotlin', dart: 'dart', lua: 'lua',
  yml: 'yaml', yaml: 'yaml', xml: 'xml', sql: 'sql', sh: 'shell',
  bat: 'bat', ps1: 'powershell', env: 'dotenv',
};

const VSCODE_DARK_THEME = {
  base: 'vs-dark', inherit: true,
  rules: [
    { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
    { token: 'keyword', foreground: '569CD6' },
    { token: 'string', foreground: 'CE9178' },
    { token: 'number', foreground: 'B5CEA8' },
    { token: 'type', foreground: '4EC9B0' },
    { token: 'function', foreground: 'DCDCAA' },
    { token: 'variable', foreground: '9CDCFE' },
    { token: 'constant', foreground: '4FC1FF' },
    { token: 'operator', foreground: 'D4D4D4' },
    { token: 'delimiter', foreground: 'D4D4D4' },
  ],
  colors: {
    'editor.background': '#1e1e1e',
    'editor.foreground': '#d4d4d4',
    'editor.lineHighlightBackground': '#2a2d2e',
    'editor.selectionBackground': '#264f78',
    'editorCursor.foreground': '#aeafad',
    'editorLineNumber.foreground': '#858585',
    'editorLineNumber.activeForeground': '#c6c6c6',
    'editorIndentGuide.background': '#404040',
    'editorIndentGuide.activeBackground': '#707070',
  },
};

export default function MonacoWrapper({ path, content, onChange, showMinimap, fontSize }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<MonacoEditor>(null);
  const monacoRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const valueRef = useRef(content);

  useEffect(() => { valueRef.current = content; }, [content]);

  const ext = path.split('.').pop()?.toLowerCase() || '';
  const language = LANGUAGE_MAP[ext] || 'plaintext';

  useEffect(() => {
    let cancelled = false;
    const loadMonaco = async () => {
      try {
        const monaco = await import('monaco-editor');
        if (cancelled) return;
        monacoRef.current = monaco;

        monaco.editor.defineTheme('vscode-dark-foundry', VSCODE_DARK_THEME);
        monaco.editor.setTheme('vscode-dark-foundry');

        if (containerRef.current) {
          const editor = monaco.editor.create(containerRef.current, {
            value: content,
            language,
            theme: 'vscode-dark-foundry',
            fontSize,
            fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
            fontLigatures: true,
            minimap: { enabled: showMinimap },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true },
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            padding: { top: 8 },
          });

          editorRef.current = editor;
          editor.onDidChangeModelContent(() => {
            if (onChange) onChange(editor.getValue());
          });

          editor.focus();
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load Monaco Editor:', err);
      }
    };
    loadMonaco();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.updateOptions({ minimap: { enabled: showMinimap } });
  }, [showMinimap]);

  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.updateOptions({ fontSize });
  }, [fontSize]);

  useEffect(() => {
    if (!editorRef.current || language === LANGUAGE_MAP[ext]) return;
    const model = editorRef.current.getModel();
    if (model) monacoRef.current?.editor.setModelLanguage(model, language);
  }, [path]);

  return (
    <div className="relative h-full w-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e] z-10">
          <Spinner size="lg" text="Loading Editor..." />
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
