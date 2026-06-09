import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index';

export default function DiffPanel() {
  const diffs = useSelector((state: RootState) => state.files.diffs);

  if (!diffs || diffs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-[#1e1e1e]">
        <div className="text-center">
          <div className="text-2xl mb-2">⇄</div>
          <p className="text-[11px] text-[#858585]">No changes to show</p>
          <p className="text-[10px] text-[#858585] mt-1">Generate AI changes to see diffs here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e] overflow-auto">
      {diffs.map((diff: any, i: number) => (
        <div key={i} className="border-b border-[#3c3c3c]">
          <div className="flex items-center gap-2 bg-[#252526] px-3 py-1.5">
            <span className="text-xs text-[#cccccc] font-medium">{diff.filePath}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              diff.type === 'modified' ? 'bg-yellow-500/20 text-yellow-400' :
              diff.type === 'added' ? 'bg-green-500/20 text-green-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {diff.type}
            </span>
          </div>
          <pre className="p-2 text-xs font-mono leading-relaxed overflow-x-auto">
            {diff.content?.split('\n').map((line: string, j: number) => (
              <div key={j} className={`${
                line.startsWith('+') ? 'bg-green-900/30 text-green-300' :
                line.startsWith('-') ? 'bg-red-900/30 text-red-300' :
                'text-[#cccccc]'
              }`}>
                {line}
              </div>
            ))}
          </pre>
        </div>
      ))}
    </div>
  );
}
