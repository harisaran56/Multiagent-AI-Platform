import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  X, 
  Play, 
  Settings2, 
  Check, 
  Split, 
  Code2, 
  Eye, 
  Sparkles,
  Sliders
} from 'lucide-react';
import { 
  setActiveTab, 
  closeTab, 
  closeAllTabs, 
  setPreviewOpen, 
  fetchVsCodeSettings, 
  setActiveSidebarTab,
  toggleRightAgent 
} from '../../redux/ideSlice';
import { getFileIcon } from './fileIconHelper';

export default function EditorTabs({ onFormatDocument }) {
  const dispatch = useDispatch();
  const { openTabs, activeTab, files, previewOpen, settingsFetched, isRightAgentOpen } = useSelector(state => state.ide);

  const activeFile = files.find(f => f.path === activeTab);
  const canPreview = files.some(f => f.name.endsWith(".html") || f.name.endsWith(".jsx"));

  return (
    <div className="h-9 bg-[#252526] border-b border-[#1e1e1e] flex items-center justify-between select-none overflow-hidden shrink-0">
      {/* Tabs list */}
      <div className="flex items-center h-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {openTabs.map(tabPath => {
          const file = files.find(f => f.path === tabPath);
          const fileName = file?.name || tabPath.split("/").pop();
          const isActive = activeTab === tabPath;

          return (
            <div
              key={tabPath}
              onClick={() => dispatch(setActiveTab(tabPath))}
              className={`h-full flex items-center gap-2 px-3 border-r border-[#1e1e1e] text-[12px] cursor-pointer transition-colors relative group shrink-0 ${
                isActive 
                  ? "bg-[#1e1e1e] text-white font-medium" 
                  : "bg-[#2d2d2d] text-[#969696] hover:bg-[#2a2a2a] hover:text-[#cccccc]"
              }`}
            >
              {/* VS Code active tab top accent border */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-indigo-500" />
              )}

              {getFileIcon(fileName, false)}
              <span className="truncate max-w-[140px]">{fileName}</span>

              {/* Dirty indicator or Close button */}
              <div className="w-4 h-4 flex items-center justify-center">
                {file?.isModified ? (
                  <span className="w-2 h-2 rounded-full bg-indigo-400 group-hover:hidden" />
                ) : null}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(closeTab(tabPath));
                  }}
                  className={`p-0.5 rounded hover:bg-[#444] text-[#858585] hover:text-white transition-opacity cursor-pointer ${
                    file?.isModified ? "hidden group-hover:flex" : "flex"
                  }`}
                  title="Close (Ctrl+W)"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right side editor action toolbar */}
      <div className="flex items-center gap-1 px-2 shrink-0 bg-[#252526] h-full border-l border-[#1e1e1e]">
        {/* Live Preview Toggle */}
        {canPreview && (
          <button
            onClick={() => dispatch(setPreviewOpen(!previewOpen))}
            title={previewOpen ? "Close Live Preview" : "Open Live Preview"}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
              previewOpen 
                ? "bg-indigo-600 text-white" 
                : "text-slate-400 hover:text-white hover:bg-[#333]"
            }`}
          >
            <Eye size={13} />
            <span className="hidden sm:inline text-[11px]">Preview</span>
          </button>
        )}

        {/* Format Document Button */}
        <button
          onClick={onFormatDocument}
          title="Format Document (Shift+Alt+F)"
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#333] transition-colors cursor-pointer"
        >
          <Code2 size={14} />
        </button>

        {/* Fetch / Open VS Code Settings Button */}
        <button
          onClick={() => {
            dispatch(fetchVsCodeSettings());
            dispatch(setActiveSidebarTab("settings"));
          }}
          title="Fetch & Configure VS Code Settings"
          className="flex items-center gap-1 p-1.5 rounded text-slate-400 hover:text-indigo-400 hover:bg-[#333] transition-colors cursor-pointer"
        >
          <Sliders size={14} />
          {settingsFetched && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          )}
        </button>

        {/* Toggle CortexAI Agent Panel (Right Side) */}
        <button
          onClick={() => dispatch(toggleRightAgent())}
          title={isRightAgentOpen ? "Close AI Agent Panel" : "Open AI Agent Panel (Right)"}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
            isRightAgentOpen 
              ? "bg-indigo-600 text-white font-medium shadow-sm" 
              : "text-indigo-400 hover:text-white hover:bg-[#333]"
          }`}
        >
          <Sparkles size={13} className={isRightAgentOpen ? "text-amber-300" : "text-indigo-400"} />
          <span className="hidden md:inline text-[11px]">AI Agent</span>
        </button>
      </div>
    </div>
  );
}

