import React, { useRef, useCallback } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/index';
import { setCursorPosition } from '../../store/editorSlice';

interface Props {
  path: string;
  content: string;
  onChange: (value: string | undefined) => void;
  showMinimap: boolean;
  fontSize: number;
}

function getLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    js: 'javascript', ts: 'typescript', jsx: 'javascript', tsx: 'typescript',
    html: 'html', css: 'css', json: 'json', md: 'markdown',
    py: 'python', cs: 'csharp', glsl: 'glsl', cpp: 'cpp',
    c: 'c', yml: 'yaml', yaml: 'yaml', xml: 'xml', svg: 'xml',
  };
  return langMap[ext || ''] || 'plaintext';
}

export default function MonacoWrapper({ path, content, onChange, showMinimap, fontSize }: Props) {
  const editorRef = useRef<any>(null);
  const dispatch = useDispatch<AppDispatch>();

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;

    editor.onDidChangeCursorPosition((e) => {
      dispatch(setCursorPosition({ line: e.position.lineNumber, column: e.position.column }));
    });
  };

  const handleBeforeMount = (monaco: any) => {
    monaco.editor.defineTheme('foundry-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editor.lineHighlightBackground': '#2a2d2e',
        'editor.selectionBackground': '#264f78',
        'editorCursor.foreground': '#aeafad',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#c6c6c6',
        'editor.inactiveSelectionBackground': '#3a3d41',
      },
    });
  };

  return (
    <Editor
      path={path}
      defaultLanguage={getLanguage(path)}
      value={content}
      onChange={onChange}
      theme="foundry-dark"
      beforeMount={handleBeforeMount}
      onMount={handleEditorDidMount}
      options={{
        fontSize,
        fontFamily: "'Cascadia Code', 'Fira Code', 'Source Code Pro', monospace",
        minimap: { enabled: showMinimap },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on',
        lineNumbers: 'on',
        renderWhitespace: 'selection',
        bracketPairColorization: { enabled: true },
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
        formatOnPaste: true,
        folding: true,
        foldingHighlight: true,
        links: true,
        mouseWheelZoom: true,
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        padding: { top: 8 },
      }}
    />
  );
}
