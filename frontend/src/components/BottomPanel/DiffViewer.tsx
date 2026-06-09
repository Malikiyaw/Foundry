import React, { useState } from 'react';
import { diffLines, Change } from 'diff';

interface DiffEntry {
  filePath: string;
  oldContent: string;
  newContent: string;
}

export default function DiffViewer() {
  const [diffs] = useState<DiffEntry[]>([]);

  if (diffs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-[#1e1e1e]">
        <p className="text-sm text-[#858585]">No changes to show. AI edits will appear here.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-[#1e1e1e] p-2 font-mono text-xs">
      {diffs.map((diff) => {
        const changes: Change[] = diffLines(diff.oldContent, diff.newContent);
        let lineNum = 0;
        return (
          <div key={diff.filePath} className="mb-4">
            <div className="mb-1 text-sm font-medium text-[#3794ff]">{diff.filePath}</div>
            {changes.map((change, idx) => {
              const lines = change.value.split('\n').filter(Boolean);
              return lines.map((line: string, i: number) => {
                lineNum++;
                let bg = '';
                let prefix = ' ';
                if (change.added) { bg = 'bg-green-900/30'; prefix = '+'; }
                else if (change.removed) { bg = 'bg-red-900/30'; prefix = '-'; }
                return (
                  <div key={`${idx}-${i}`} className={`flex ${bg}`}>
                    <span className="w-8 shrink-0 text-right text-[#858585]">{lineNum}</span>
                    <span className="w-4 shrink-0 text-center">{prefix}</span>
                    <span className="flex-1 whitespace-pre">{line}</span>
                  </div>
                );
              });
            })}
          </div>
        );
      })}
    </div>
  );
}
