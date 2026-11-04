import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FolderArchive, 
  Upload, 
  Columns, 
  MessageSquare, 
  Sliders, 
  Settings2, 
  Sparkles,
  Maximize2,
  X,
  Code2
} from 'lucide-react';
import ActivityBar from './ActivityBar';
import ExplorerPanel from './ExplorerPanel';
import SearchPanel from './SearchPanel';
import GitPanel from './GitPanel';
import SettingsPanel from './SettingsPanel';
import AgentPanel from './AgentPanel';
import EditorTabs from './EditorTabs';
import MonacoEditorContainer from './MonacoEditorContainer';
import BottomPanel from './BottomPanel';
import StatusBar from './StatusBar';
import LivePreview from './LivePreview';
import { 
  setViewMode, 
  fetchVsCodeSettings, 
  setActiveSidebarTab 
} from '../../redux/ideSlice';

export default function VsCodeIde({ isEmbedded = false }) {
  const dispatch = useDispatch();
  const { 
    activeSidebarTab, 
    viewMode, 
    projectName, 
    activeTab, 
    settingsFetched,
    isRightAgentOpen 
  } = useSelector(state => state.ide);

  const [cursorPosition, setCursorPosition] = useState({ lineNumber: 1, column: 1 });
  const editorRef = useRef(null);

  const handleFormatDocument = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  return (
    <div className={`flex flex-col bg-[#1e1e1e] text-slate-200 select-none overflow-hidden ${
      isEmbedded ? "w-full h-full" : "fixed inset-0 z-40"
    }`}>
      {/* VS Code Window Top Title Bar */}
      <div className="h-8 bg-[#323233] border-b border-[#252526] flex items-center justify-between px-3 text-xs select-none shrink-0 z-30">
        {/* Left: Window actions & title */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block" />
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <Code2 size={14} className="text-indigo-400" />
            <span>CortexAI Studio</span>
          </div>
        </div>

        {/* Center: Breadcrumb / Active File */}
        <div className="hidden md:flex items-center gap-1.5 text-slate-400 text-[11px] font-mono bg-black/20 px-3 py-1 rounded-md border border-white/5">
          <span className="text-indigo-300 font-semibold">{projectName}</span>
          <span>&gt;</span>
          <span className="text-slate-200">{activeTab || "No file active"}</span>
        </div>

        {/* Right: Mode toggles and quick actions */}
        <div className="flex items-center gap-2">
          {/* Quick fetch settings button in title bar */}
          <button
            onClick={() => {
              dispatch(fetchVsCodeSettings());
              dispatch(setActiveSidebarTab("settings"));
            }}
            className="flex items-center gap-1.5 px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[11px] font-medium text-slate-300 transition-colors cursor-pointer"
            title="Fetch and Inspect VS Code Settings"
          >
            <Sliders size={12} className="text-indigo-400" />
            <span>{settingsFetched ? "Settings (Synced)" : "Fetch Settings"}</span>
          </button>

          {/* View mode switcher */}
          <div className="flex items-center bg-black/30 p-0.5 rounded border border-white/10">
            <button
              onClick={() => dispatch(setViewMode("chat"))}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                viewMode === "chat" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <MessageSquare size={11} /> Chat
            </button>
            <button
              onClick={() => dispatch(setViewMode("split"))}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                viewMode === "split" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Columns size={11} /> Split
            </button>
            <button
              onClick={() => dispatch(setViewMode("ide"))}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                viewMode === "ide" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Maximize2 size={11} /> Full IDE
            </button>
          </div>
        </div>
      </div>

      {/* Main VS Code Workspace Body */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* 1. Left Activity Bar */}
        <ActivityBar />

        {/* 2. Side Panel */}
        {activeSidebarTab === "explorer" && <ExplorerPanel />}
        {activeSidebarTab === "search" && <SearchPanel />}
        {activeSidebarTab === "git" && <GitPanel />}
        {activeSidebarTab === "settings" && <SettingsPanel />}

        {/* 3. Center Editor Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e] overflow-hidden">
          {/* Top Tabs */}
          <EditorTabs onFormatDocument={handleFormatDocument} />

          {/* Middle: Code Editor & Live Preview */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            <MonacoEditorContainer
              editorRef={editorRef}
              onCursorChange={setCursorPosition}
            />
            <LivePreview />
          </div>

          {/* Bottom Panel (Terminal / Output / Problems) */}
          <BottomPanel onFormatDocument={handleFormatDocument} />
        </div>

        {/* 4. Right Side: CortexAI Agent Panel */}
        {isRightAgentOpen && <AgentPanel />}
      </div>

      {/* 4. VS Code Status Bar */}
      <StatusBar cursorPosition={cursorPosition} />
    </div>
  );
}

