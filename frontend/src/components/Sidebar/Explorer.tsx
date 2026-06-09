import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/index';
import { openFile } from '../../store/editorSlice';
import { createFile, deleteFile } from '../../store/filesSlice';
import FileItem from './FileItem';

interface Props { projectId: string }

interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children: TreeNode[];
  fileId?: string;
  isGenerated?: boolean;
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
          name: parts[i],
          path: parts.slice(0, i + 1).join('/'),
          type: isFile ? 'file' : 'folder',
          children: [],
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
  const [newItemType, setNewItemType] = useState<'file' | 'folder'>('file');

  const tree = buildTree(files);

  const handleFileClick = useCallback((fileId: string, path: string) => {
    dispatch(openFile({ fileId, path }));
  }, [dispatch]);

  const handleContextMenu = useCallback((e: React.MouseEvent, node?: TreeNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  }, []);

  const handleNewFile = useCallback((parentPath: string) => {
    setNewItemPath(parentPath);
    setNewItemType('file');
    setContextMenu(null);
  }, []);

  const handleNewFolder = useCallback((parentPath: string) => {
    setNewItemPath(parentPath);
    setNewItemType('folder');
    setContextMenu(null);
  }, []);

  const handleCreateItem = useCallback((name: string) => {
    if (!name || !newItemPath) return;
    const fullPath = newItemPath ? `${newItemPath}/${name}` : name;
    dispatch(createFile({ projectId, path: fullPath }));
    setNewItemPath(null);
  }, [dispatch, projectId, newItemPath]);

  const handleDelete = useCallback((fileId: string) => {
    dispatch(deleteFile({ projectId, fileId }));
    setContextMenu(null);
  }, [dispatch, projectId]);

  const renderNode = (node: TreeNode, depth: number = 0) => (
    <FileItem
      key={node.path}
      node={node}
      depth={depth}
      onClick={() => node.fileId && handleFileClick(node.fileId, node.path)}
      onContextMenu={(e) => handleContextMenu(e, node)}
      onNewFile={() => handleNewFile(node.path)}
      onNewFolder={() => handleNewFolder(node.path)}
      onDelete={() => node.fileId && handleDelete(node.fileId)}
    >
      {node.children.map((child) => renderNode(child, depth + 1))}
    </FileItem>
  );

  return (
    <div
      className="py-1"
      onContextMenu={(e) => handleContextMenu(e)}
      onClick={() => setContextMenu(null)}
    >
      {tree.map((node) => renderNode(node))}

      {newItemPath && (
        <div className="flex items-center px-2 py-0.5" style={{ paddingLeft: `${16 + (newItemPath.split('/').length) * 16}px` }}>
          <input
            autoFocus
            className="w-full bg-[#3c3c3c] px-1 py-0.5 text-xs text-[#cccccc] outline-none border border-[#0078d4]"
            placeholder={newItemType === 'file' ? 'filename.js' : 'folder-name'}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateItem((e.target as HTMLInputElement).value);
              if (e.key === 'Escape') setNewItemPath(null);
            }}
            onBlur={(e) => handleCreateItem(e.target.value)}
          />
        </div>
      )}

      {contextMenu && (
        <div
          className="fixed z-50 min-w-[160px] rounded border border-[#3c3c3c] bg-[#252526] py-1 shadow-xl"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="w-full px-4 py-1.5 text-left text-xs text-[#cccccc] hover:bg-[#094771]" onClick={() => handleNewFile(contextMenu.node?.path || '')}>
            New File
          </button>
          <button className="w-full px-4 py-1.5 text-left text-xs text-[#cccccc] hover:bg-[#094771]" onClick={() => handleNewFolder(contextMenu.node?.path || '')}>
            New Folder
          </button>
          {contextMenu.node?.fileId && (
            <>
              <div className="my-1 border-t border-[#3c3c3c]" />
              <button className="w-full px-4 py-1.5 text-left text-xs text-red-400 hover:bg-[#094771]" onClick={() => handleDelete(contextMenu.node!.fileId!)}>
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
