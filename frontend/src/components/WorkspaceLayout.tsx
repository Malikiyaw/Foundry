import React, { useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/index';
import { fetchProject } from '../store/projectsSlice';
import { fetchFiles } from '../store/filesSlice';
import { joinProject, leaveProject, getSocket } from '../services/socket';

import MenuBar from './MenuBar';
import Sidebar from './Sidebar/Sidebar';
import Editor from './Editor/Editor';
import SavedPreview from './Preview/SavedPreview';
import LivePreview from './Preview/LivePreview';
import BottomPanel from './BottomPanel/BottomPanel';

export default function WorkspaceLayout() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { sidebarOpen, bottomPanelOpen, showRightPanel } = useSelector((state: RootState) => state.ui);
  const { isZenMode } = useSelector((state: RootState) => state.editor);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchProject(id));
    dispatch(fetchFiles(id));
    joinProject(id);
    return () => { leaveProject(id); };
  }, [id, dispatch]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        if (content) {
          import('../services/api').then(({ default: api }) => {
            api.post(`/projects/${id}/files`, { path: file.name, content, fileType: 'code' });
          });
        }
      };
      reader.readAsText(file);
    });
  }, [id]);

  if (!id) return null;

  return (
    <div className="flex h-screen flex-col bg-[#1e1e1e]" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      <MenuBar projectId={id} />

      <div className="flex flex-1 overflow-hidden">
        {!isZenMode && sidebarOpen && <Sidebar projectId={id} />}

        <div className="flex flex-1 flex-col overflow-hidden">
          <Editor projectId={id} />
        </div>

        {!isZenMode && showRightPanel && (
          <div className="flex w-[400px] min-w-[300px] flex-col border-l border-[#3c3c3c] bg-[#1e1e1e]">
            <div className="flex-1 border-b border-[#3c3c3c]">
              <SavedPreview projectId={id} />
            </div>
            <div className="flex-1">
              <LivePreview projectId={id} />
            </div>
          </div>
        )}
      </div>

      {!isZenMode && bottomPanelOpen && <BottomPanel projectId={id} />}
    </div>
  );
}
