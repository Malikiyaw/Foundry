import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/index';
import { openFile } from '../../store/editorSlice';
import { createFile, deleteFile } from '../../store/filesSlice';
import FileItem from './FileItem';
import { EmptyState } from '../shared/Spinner';

interface Props { projectId: string }

interface TreeNode {
  name: string; path: string; type: 'file' | 'folder';
  children: TreeNode[]; fileId?: string; isGenerated?: boolean;
}

function buildTree(files: { id: string; path: string; isGenerated: boolean }[]): TreeNode[] {
  const root: TreeNode[] = [];
  for (const file of files) {
    const parts = file.path.split('/');
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const isFile = i === parts.length - 1;
      const existing = current.find((n) => n.name === parts[i]);
      if (existing) {
        current = existing.children;
      } else {
        const node: TreeNode = {
          name: parts[i], path: parts.slice(0, i + 1).join('/'),
          type: isFile ? 'file' : 'folder', children: [],
          fileId: isFile ? file.id : undefined,
          isGenerated: isFile ? file.isGenerated : undefined,
        };
        current.push(node);
        current = node.children;
      }
    }
  }
  return root;
}

export default function Explorer({ projectId }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const files = useSelector((state: RootState) => state.files.items);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node?: TreeNode } | null>(null);
  const [newItemPath, setNewItemPath] = useState<string | null>(null);

  const tree = buildTree(files);

  const handleFileClick = useCallback((fileId: string, path: string) => {
    dispatch(openFile({ fileId, path }));
  }, [dispatch]);

  const handleContextMenu = useCallback((e: React.MouseEvent, node?: TreeNode) => {
    e.preventDefault(); e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  }, []);

  const handleNewFile = useCallback((parentPath: string) => {
    setNewItemPath(parentPath); setContextMenu(null);
  }, []);

  const handleCreateItem = useCallback((name: string) => {
    if (!name || !newItemPath) return;
    dispatch(createFile({ projectId, path: `${newItemPath}/${name}` }));
    setNewItemPath(null);
  }, [dispatch, projectId, newItemPath]);

  const handleDelete = useCallback((fileId: string) => {
    dispatch(deleteFile({ projectId, fileId }));
    setContextMenu(null);
  }, [dispatch, projectId]);

  const renderNode = (node: TreeNode, depth: number = 0) => (
    <FileItem
      key={node.path}
      node={node} depth={depth}
      onClick={() => node.fileId && handleFileClick(node.fileId, node.path)}
      onContextMenu={(e) => handleContextMenu(e, node)}
      onNewFile={() => handleNewFile(node.path)}
      onDelete={() => node.fileId && handleDelete(node.fileId)}
    >
      {node.children.map((child) => renderNode(child, depth + 1))}
    </FileItem>
  );

  if (files.length === 0) {
    return (
      <div className="h-full">
        <EmptyState title="No files" description="Create a file to get started" />
      </div>
    );
  }

  return (
    <div className="py-0.5" onContextMenu={(e) => handleContextMenu(e)} onClick={() => setContextMenu(null)}>
      {tree.map((node) => renderNode(node))}

      {newItemPath && (
        <div className="flex items-center px-2 py-0.5 animate-fadeIn" style={{ paddingLeft: `${16 + (newItemPath.split('/').length) * 16}px` }}>
          <input
            autoFocus
            className="w-full px-1.5 py-0.5 text-xs outline-none rounded"
            style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--accent)' }}
            placeholder="filename.js"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateItem((e.target as HTMLInputElement).value);
              if (e.key === 'Escape') setNewItemPath(null);
            }}
            onBlur={(e) => e.target.value && handleCreateItem(e.target.value)}
          />
        </div>
      )}

      {contextMenu && (
        <div
          className="fixed z-50 min-w-[170px] rounded py-1 animate-scaleIn border"
          style={{ left: contextMenu.x, top: contextMenu.y, background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="flex w-full items-center gap-2 px-4 py-1.5 text-left text-xs transition-colors" style={{ color: 'var(--text-primary)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'} onClick={() => handleNewFile(contextMenu.node?.path || '')}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New File
          </button>
          <button className="flex w-full items-center gap-2 px-4 py-1.5 text-left text-xs transition-colors" style={{ color: 'var(--text-primary)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'} onClick={() => handleNewFile(contextMenu.node?.path || '')}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
            New Folder
          </button>
          {contextMenu.node?.fileId && (
            <>
              <div className="my-1 border-t" style={{ borderColor: 'var(--border-primary)' }} />
              <button className="flex w-full items-center gap-2 px-4 py-1.5 text-left text-xs transition-colors" style={{ color: 'var(--danger)' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'} onClick={() => handleDelete(contextMenu.node!.fileId!)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
