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
        <EmptyState icon="📂" title="No files" description="Create a file to get started" />
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
            className="w-full bg-[#3c3c3c] px-1.5 py-0.5 text-xs text-[#cccccc] outline-none border border-[#0078d4] rounded"
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
          className="fixed z-50 min-w-[170px] rounded border border-[#3c3c3c] bg-[#252526] py-1 shadow-2xl animate-scaleIn"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="flex w-full items-center gap-2 px-4 py-1.5 text-left text-xs text-[#cccccc] hover:bg-[#094771] transition-colors" onClick={() => handleNewFile(contextMenu.node?.path || '')}>
            <span>📄</span> New File
          </button>
          <button className="flex w-full items-center gap-2 px-4 py-1.5 text-left text-xs text-[#cccccc] hover:bg-[#094771] transition-colors" onClick={() => handleNewFile(contextMenu.node?.path || '')}>
            <span>📁</span> New Folder
          </button>
          {contextMenu.node?.fileId && (
            <>
              <div className="my-1 border-t border-[#3c3c3c]" />
              <button className="flex w-full items-center gap-2 px-4 py-1.5 text-left text-xs text-red-400 hover:bg-[#094771] transition-colors" onClick={() => handleDelete(contextMenu.node!.fileId!)}>
                <span>🗑</span> Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
