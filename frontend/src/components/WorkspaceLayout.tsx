import React, { useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { AppDispatch, RootState } from '../store/index';
import { fetchProject } from '../store/projectsSlice';
import { fetchFiles, clearFiles } from '../store/filesSlice';
import { joinProject, leaveProject } from '../services/socket';
import { Spinner } from './shared/Spinner';

import MenuBar from './MenuBar';
import Sidebar from './Sidebar/Sidebar';
import Editor from './Editor/Editor';
import SavedPreview from './Preview/SavedPreview';
import LivePreview from './Preview/LivePreview';
import BottomPanel from './BottomPanel/BottomPanel';

function ResizeHandle({ className = '' }: { className?: string }) {
  return (
    <Separator className={`group relative w-[4px] bg-transparent hover:bg-[#0078d4]/30 transition-colors cursor-col-resize ${className}`}>
      <div className="absolute inset-y-0 left-[-2px] right-[-2px]" />
    </Separator>
  );
}

function HorizontalResizeHandle() {
  return (
    <Separator className="group relative h-[4px] bg-transparent hover:bg-[#0078d4]/30 transition-colors cursor-row-resize">
      <div className="absolute inset-x-0 top-[-2px] bottom-[-2px]" />
    </Separator>
  );
}

export default function WorkspaceLayout() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { sidebarOpen, bottomPanelOpen, showRightPanel } = useSelector((state: RootState) => state.ui);
  const { isZenMode } = useSelector((state: RootState) => state.editor);
  const files = useSelector((state: RootState) => state.files.items);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchProject(id));
    dispatch(fetchFiles(id));
    joinProject(id);
    return () => { leaveProject(id); dispatch(clearFiles()); };
  }, [id, dispatch]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const fileList = Array.from(e.dataTransfer.files);
    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        if (content) {
          fetch(`/api/projects/${id}/files`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('foundry_token')}` },
            body: JSON.stringify({ path: file.name, content, fileType: 'code' }),
          });
        }
      };
      reader.readAsText(file);
    });
  }, [id]);

  if (!id) return null;

  return (
    <div className="flex h-screen flex-col bg-[#1e1e1e] select-none" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      <MenuBar projectId={id} />

      <div className="flex flex-1 overflow-hidden">
        <Group direction="horizontal" autoSaveId="foundry-main">
          {!isZenMode && sidebarOpen && (
            <>
              <Panel defaultSize={18} minSize={12} maxSize={35}>
                <Sidebar projectId={id} />
              </Panel>
              <ResizeHandle />
            </>
          )}

          <Panel minSize={30}>
            <Group direction="vertical" autoSaveId="foundry-editor-panel">
              <Panel defaultSize={70} minSize={20}>
                <Editor projectId={id} />
              </Panel>

              {!isZenMode && bottomPanelOpen && (
                <>
                  <HorizontalResizeHandle />
                  <Panel defaultSize={30} minSize={10} maxSize={60}>
                    <BottomPanel projectId={id} />
                  </Panel>
                </>
              )}
            </Group>
          </Panel>

          {!isZenMode && showRightPanel && (
            <>
              <ResizeHandle />
              <Panel defaultSize={25} minSize={15} maxSize={45}>
                <Group direction="vertical" autoSaveId="foundry-preview-panel">
                  <Panel defaultSize={50} minSize={20}>
                    <SavedPreview projectId={id} />
                  </Panel>
                  <HorizontalResizeHandle />
                  <Panel defaultSize={50} minSize={20}>
                    <LivePreview projectId={id} />
                  </Panel>
                </Group>
              </Panel>
            </>
          )}
        </Group>
      </div>
    </div>
  );
}
