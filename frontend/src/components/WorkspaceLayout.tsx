import React, { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { AppDispatch, RootState } from '../store/index';
import { fetchProject } from '../store/projectsSlice';
import { fetchFiles, clearFiles, addFile } from '../store/filesSlice';
import { logout } from '../store/authSlice';
import { Spinner } from './shared/Spinner';

import MenuBar from './MenuBar';
import Sidebar from './Sidebar/Sidebar';
import Editor from './Editor/Editor';
import SavedPreview from './Preview/SavedPreview';
import LivePreview from './Preview/LivePreview';
import BottomPanel from './BottomPanel/BottomPanel';

function ResizeHandle({ className = '' }: { className?: string }) {
  return (
    <Separator className={`group relative w-[5px] cursor-col-resize transition-colors ${className}`}
      style={{ background: 'transparent' }}
    >
      <div className="absolute inset-y-0 left-[-1px] right-[-1px] group-hover:bg-[var(--accent)]/20 transition-colors" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'var(--accent)' }} />
    </Separator>
  );
}

function HorizontalResizeHandle() {
  return (
    <Separator className="group relative h-[5px] cursor-row-resize transition-colors"
      style={{ background: 'transparent' }}
    >
      <div className="absolute inset-x-0 top-[-1px] bottom-[-1px] group-hover:bg-[var(--accent)]/20 transition-colors" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'var(--accent)' }} />
    </Separator>
  );
}

export default function WorkspaceLayout() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { sidebarOpen, bottomPanelOpen, showRightPanel } = useSelector((state: RootState) => state.ui);
  const { isZenMode } = useSelector((state: RootState) => state.editor);
  const { isDemo } = useSelector((state: RootState) => state.auth);
  const files = useSelector((state: RootState) => state.files.items);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchProject(id));
    dispatch(fetchFiles(id));
    return () => { dispatch(clearFiles()); };
  }, [id, dispatch]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const fileList = Array.from(e.dataTransfer.files);
    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        if (content) {
          dispatch(addFile({ projectId: id!, path: file.name, content, fileType: 'code' } as any));
        }
      };
      reader.readAsText(file);
    });
  }, [id, dispatch]);

  if (!id) return null;

  return (
    <div className="flex h-screen flex-col select-none" style={{ background: 'var(--bg-primary)' }} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      {isDemo && (
        <div className="flex items-center justify-between gap-3 px-4 py-1.5 text-xs" style={{ background: 'var(--accent-subtle)', borderBottom: '1px solid var(--border-primary)' }}>
          <span style={{ color: 'var(--accent)' }}>🔍 Demo mode — changes are not saved permanently.</span>
          <button
            className="rounded-full px-3 py-0.5 text-[10px] font-medium text-white"
            style={{ background: 'var(--accent)' }}
            onClick={() => { dispatch(logout()); navigate('/'); }}
          >
            Exit Demo
          </button>
        </div>
      )}
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
