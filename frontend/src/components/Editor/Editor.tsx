import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/index';
import { closeTab, setActiveTab, markDirty } from '../../store/editorSlice';
import { updateFileContent } from '../../store/filesSlice';
import MonacoWrapper from './MonacoWrapper';
import TabBar from './TabBar';
import { EmptyState } from '../shared/Spinner';

interface Props { projectId: string }

export default function Editor({ projectId }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { openTabs, activeTabIndex, showMinimap, fontSize } = useSelector((state: RootState) => state.editor);
  const files = useSelector((state: RootState) => state.files.items);

  const activeTab = openTabs[activeTabIndex];
  const activeFile = activeTab ? files.find((f) => f.id === activeTab.fileId) : null;

  const handleEditorChange = (value: string | undefined) => {
    if (activeTab && value !== undefined) {
      dispatch(updateFileContent({ fileId: activeTab.fileId, content: value }));
      dispatch(markDirty(activeTab.fileId));
    }
  };

  return (
    <div className="flex h-full flex-col" style={{ background: 'var(--bg-primary)' }}>
      <TabBar
        tabs={openTabs}
        activeIndex={activeTabIndex}
        onClose={(i) => dispatch(closeTab(i))}
        onSelect={(i) => dispatch(setActiveTab(i))}
      />

      <div className="flex-1 overflow-hidden">
        {activeFile ? (
          <MonacoWrapper
            key={activeFile.id}
            path={activeFile.path}
            content={activeFile.content}
            onChange={handleEditorChange}
            showMinimap={showMinimap}
            fontSize={fontSize}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <EmptyState
              title="No file open"
              description="Select a file from the explorer or create a new one to start editing"
            />
          </div>
        )}
      </div>
    </div>
  );
}
