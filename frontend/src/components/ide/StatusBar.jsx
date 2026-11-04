import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  GitBranch, 
  AlertCircle, 
  CheckCircle2, 
  Sliders, 
  Sparkles, 
  Terminal,
  Radio
} from 'lucide-react';
import { 
  toggleBottomPanel, 
  fetchVsCodeSettings, 
  setActiveSidebarTab,
  toggleRightAgent 
} from '../../redux/ideSlice';

export default function StatusBar({ cursorPosition }) {
  const dispatch = useDispatch();
  const { files, activeTab, vscodeSettings, settingsFetched, isRightAgentOpen } = useSelector(state => state.ide);

  const activeFile = files.find(f => f.path === activeTab);
  const lang = activeFile?.language || (activeFile?.name ? activeFile.name.split(".").pop().toUpperCase() : "Plain Text");

  return (
    <div className="h-6 bg-[#007acc] text-white flex items-center justify-between px-2 text-[11px] select-none shrink-0 z-20 font-sans">
      {/* Left items */}
      <div className="flex items-center gap-3">
        {/* Git Branch */}
        <div className="flex items-center gap-1 hover:bg-black/15 px-1.5 py-0.5 rounded cursor-pointer">
          <GitBranch size={12} />
          <span>main*</span>
        </div>

        {/* Problems count */}
        <button
          onClick={() => dispatch(toggleBottomPanel("problems"))}
          className="flex items-center gap-1 hover:bg-black/15 px-1.5 py-0.5 rounded cursor-pointer"
        >
          <CheckCircle2 size={11} />
          <span>0</span>
          <AlertCircle size={11} className="ml-1" />
          <span>0</span>
        </button>

        {/* VS Code Settings quick status */}
        <button
          onClick={() => {
            dispatch(fetchVsCodeSettings());
            dispatch(setActiveSidebarTab("settings"));
          }}
          className="hidden sm:flex items-center gap-1 hover:bg-black/15 px-1.5 py-0.5 rounded cursor-pointer"
          title="Click to view/fetch all VS Code settings"
        >
          <Sliders size={11} />
          <span>VS Code Settings: {settingsFetched ? "Synced" : "Fetch"}</span>
        </button>
      </div>

      {/* Right items */}
      <div className="flex items-center gap-3">
        {/* Line & Column */}
        <div className="hover:bg-black/15 px-1.5 py-0.5 rounded cursor-pointer">
          Ln {cursorPosition.lineNumber || 1}, Col {cursorPosition.column || 1}
        </div>

        {/* Spaces / Indentation */}
        <div className="hover:bg-black/15 px-1.5 py-0.5 rounded cursor-pointer">
          Spaces: {vscodeSettings["editor.tabSize"] || 2}
        </div>

        {/* Encoding */}
        <div className="hover:bg-black/15 px-1.5 py-0.5 rounded cursor-pointer">
          UTF-8
        </div>

        {/* Language Mode */}
        <div className="hover:bg-black/15 px-1.5 py-0.5 rounded cursor-pointer uppercase font-medium">
          {lang}
        </div>

        {/* CortexAI Pair Programmer Status */}
        <button
          onClick={() => dispatch(toggleRightAgent())}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded cursor-pointer font-medium transition-colors ${
            isRightAgentOpen ? "bg-black/35 text-amber-300" : "bg-black/15 hover:bg-black/25 text-white"
          }`}
          title="Toggle AI Agent Section (Right)"
        >
          <Sparkles size={11} className="text-amber-300" />
          <span>CortexAI {isRightAgentOpen ? "Active" : ""}</span>
        </button>
      </div>
    </div>
  );
}

