import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/index';
import { closeTab, setActiveTab, moveTab, markDirty } from '../../store/editorSlice';
import { updateFileContent } from '../../store/filesSlice';
import MonacoWrapper from './MonacoWrapper';
import TabBar from './TabBar';

interface Props { projectId: string }

export default function Editor({ projectId }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { openTabs, activeTabIndex, showMinimap, fontSize } = useSelector((state: RootState) => state.editor);
  const files = useSelector((state: RootState) => state.files.items);

  const activeTab = openTabs[activeTabIndex];
  const activeFile = activeTab ? files.find((f) => f.id === activeTab.fileId) : null;

  const handleTabClose = (index: number) => {
    dispatch(closeTab(index));
  };

  const handleTabSelect = (index: number) => {
    dispatch(setActiveTab(index));
  };

  const handleTabMove = (from: number, to: number) => {
    dispatch(moveTab({ from, to }));
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeTab && value !== undefined) {
      dispatch(updateFileContent({ fileId: activeTab.fileId, content: value }));
      dispatch(markDirty(activeTab.fileId));
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#1e1e1e]">
      <TabBar
        tabs={openTabs}
        activeIndex={activeTabIndex}
        onClose={handleTabClose}
        onSelect={handleTabSelect}
        onMove={handleTabMove}
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
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="text-3xl mb-2">📁</div>
              <p className="text-sm text-[#858585]">Select a file from the explorer</p>
              <p className="mt-1 text-xs text-[#858585]">or create a new one to start editing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
