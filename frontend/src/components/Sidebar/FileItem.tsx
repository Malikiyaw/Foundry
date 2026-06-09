import React, { useState } from 'react';

interface TreeNode { name: string; path: string; type: 'file' | 'folder'; children: TreeNode[]; fileId?: string; isGenerated?: boolean; }

interface Props {
  node: TreeNode; depth: number;
  onClick: () => void; onContextMenu: (e: React.MouseEvent) => void;
  onNewFile: () => void; onDelete: () => void;
  children?: React.ReactNode;
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const iconMap: Record<string, string> = {
    js: 'JS', ts: 'TS', jsx: '⚛', tsx: '⚛', html: '🌐', css: '🎨', scss: '🎨',
    json: '{ }', md: '📝', py: '🐍', rb: '💎', go: '🔷', rs: '🦀',
    yml: '⚙', yaml: '⚙', xml: '📄', sql: '🗄', sh: '⚡', bat: '🪟',
    ps1: '🔵', env: '🔒', lock: '🔒', gitignore: '👁', svg: '🖼', png: '🖼',
    jpg: '🖼', jpeg: '🖼', gif: '🖼', mp3: '🎵', wav: '🎵', ogg: '🎵',
  };
  return <span className="text-[11px] w-4 text-center">{iconMap[ext] || '📄'}</span>;
}

export default function FileItem({ node, depth, onClick, onContextMenu, onNewFile, onDelete, children }: Props) {
  const [expanded, setExpanded] = useState(node.type === 'folder');

  const handleClick = () => {
    if (node.type === 'folder') setExpanded(!expanded);
    else onClick();
  };

  return (
    <div>
      <div
        className="flex items-center gap-1 px-2 py-0.5 cursor-pointer text-xs text-[#cccccc] hover:bg-[#2a2d2e] transition-colors group"
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={handleClick}
        onContextMenu={onContextMenu}
      >
        {node.type === 'folder' && (
          <span className={`text-[8px] text-[#858585] transition-transform ${expanded ? 'rotate-90' : ''}`}>▶</span>
        )}
        {node.type === 'folder' ? (
          <span className={`text-[11px] ${expanded ? 'text-yellow-400' : 'text-yellow-600'}`}>📁</span>
        ) : (
          <FileIcon name={node.name} />
        )}
        <span className="truncate flex-1">{node.name}</span>
        {node.isGenerated && <span className="text-[8px] text-blue-400" title="AI Generated">◆</span>}
        {node.type === 'folder' && (
          <div className="ml-auto hidden group-hover:flex gap-0.5">
            <button className="px-1 text-[9px] text-[#858585] hover:text-white" onClick={(e) => { e.stopPropagation(); onNewFile(); }} title="New File">
              +
            </button>
          </div>
        )}
      </div>
      {node.type === 'folder' && expanded && children}
    </div>
  );
}
