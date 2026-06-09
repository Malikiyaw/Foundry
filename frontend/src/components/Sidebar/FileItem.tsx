import React, { useState } from 'react';

interface TreeNode { name: string; path: string; type: 'file' | 'folder'; children: TreeNode[]; fileId?: string; isGenerated?: boolean; }

interface Props {
  node: TreeNode; depth: number;
  onClick: () => void; onContextMenu: (e: React.MouseEvent) => void;
  onNewFile: () => void; onDelete: () => void;
  children?: React.ReactNode;
}

const FILE_COLORS: Record<string, string> = {
  js: '#f7df1e', ts: '#3178c6', jsx: '#61dafb', tsx: '#3178c6',
  html: '#e34c26', css: '#264de4', scss: '#cc6699', less: '#1d365d',
  json: '#5b5b5b', md: '#083fa1', py: '#3776ab', rb: '#cc342d',
  go: '#00add8', rs: '#ce422b', dart: '#0175c2', lua: '#000080',
  yml: '#cb171e', yaml: '#cb171e', xml: '#0060ac', sql: '#e38c00',
  sh: '#4eaa25', svg: '#ffb13b', png: '#a855f7', jpg: '#a855f7',
  gif: '#a855f7', mp3: '#1db954', wav: '#1db954', ogg: '#1db954',
  css: '#264de4', lock: '#6b7280', env: '#ecd53f',
};

function FileIcon({ name, isFolder, isExpanded }: { name: string; isFolder?: boolean; isExpanded?: boolean }) {
  if (isFolder) {
    return (
      <span className="text-xs" style={{ color: isExpanded ? 'var(--accent-orange)' : 'var(--text-muted)' }}>
        {isExpanded ? '📂' : '📁'}
      </span>
    );
  }
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const color = FILE_COLORS[ext] || 'var(--text-muted)';
  return (
    <span
      className="inline-block h-2 w-2 rounded-full shrink-0"
      style={{ background: color }}
      title={`.${ext}`}
    />
  );
}

export default function FileItem({ node, depth, onClick, onContextMenu, onNewFile, onDelete, children }: Props) {
  const [expanded, setExpanded] = useState(node.type === 'folder');
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    if (node.type === 'folder') setExpanded(!expanded);
    else onClick();
  };

  return (
    <div>
      <div
        className="flex items-center gap-2 py-1 px-2 cursor-pointer text-xs rounded-md mx-1 transition-all group"
        style={{
          paddingLeft: `${8 + depth * 14}px`,
          background: hovered ? 'var(--bg-hover)' : 'transparent',
          color: 'var(--text-primary)',
        }}
        onClick={handleClick}
        onContextMenu={onContextMenu}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {node.type === 'folder' && (
          <svg
            width="10" height="10" viewBox="0 0 24 24" fill="none"
            stroke="var(--text-muted)" strokeWidth="2"
            className="shrink-0 transition-transform"
            style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        )}
        {node.type !== 'folder' && <div className="w-[10px]" />}
        <FileIcon name={node.name} isFolder={node.type === 'folder'} isExpanded={expanded} />
        <span className="truncate flex-1">{node.name}</span>
        {node.isGenerated && (
          <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: 'var(--accent)' }} title="AI Generated" />
        )}
        {hovered && node.type === 'folder' && (
          <button
            className="icon-btn !h-5 !w-5 opacity-0 group-hover:opacity-100"
            onClick={(e) => { e.stopPropagation(); onNewFile(); }}
            title="New File"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </button>
        )}
      </div>
      {node.type === 'folder' && expanded && children}
    </div>
  );
}
