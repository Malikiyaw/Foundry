import React, { useState } from 'react';

interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children: TreeNode[];
  fileId?: string;
  isGenerated?: boolean;
}

interface Props {
  node: TreeNode;
  depth: number;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onDelete: () => void;
  children?: React.ReactNode;
}

const FILE_ICONS: Record<string, string> = {
  js: '📄', ts: '📘', jsx: '⚛️', tsx: '⚛️',
  html: '🌐', css: '🎨', json: '📋', md: '📝',
  png: '🖼️', jpg: '🖼️', gif: '🖼️', svg: '🖼️',
  wav: '🔊', mp3: '🎵', ogg: '🔊',
};

function getIcon(filename: string): string {
  const ext = filename.split('.').pop() || '';
  return FILE_ICONS[ext] || (filename.endsWith('/') || !ext ? '📁' : '📄');
}

function getStatusIcon(isGenerated?: boolean): string | null {
  if (isGenerated === true) return null; // 'A' for AI generated
  return null;
}

export default function FileItem({ node, depth, onClick, onContextMenu, children }: Props) {
  const [expanded, setExpanded] = useState(true);

  const isFolder = node.type === 'folder';
  const icon = isFolder ? (expanded ? '📂' : '📁') : getIcon(node.name);

  return (
    <div>
      <div
        className="flex cursor-pointer items-center gap-1 px-2 py-0.5 text-xs text-[#cccccc] hover:bg-[#2a2d2e]"
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => { if (isFolder) setExpanded(!expanded); else onClick(); }}
        onContextMenu={onContextMenu}
      >
        <span className="w-4 text-center text-xs">{icon}</span>
        <span className="flex-1 truncate">{node.name}</span>
        {node.isGenerated && (
          <span className="text-[10px] text-[#4ecdc4] font-medium" title="AI Generated">A</span>
        )}
      </div>
      {isFolder && expanded && children}
    </div>
  );
}
