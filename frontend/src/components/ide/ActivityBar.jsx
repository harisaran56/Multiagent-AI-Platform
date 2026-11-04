import React from 'react';
import { 
  Files, 
  Search, 
  GitBranch, 
  Settings, 
  Bot, 
  Terminal, 
  Play, 
  Columns, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setActiveSidebarTab, 
  toggleBottomPanel, 
  setViewMode,
  toggleRightAgent 
} from '../../redux/ideSlice';

export default function ActivityBar() {
  const dispatch = useDispatch();
  const { activeSidebarTab, isBottomPanelOpen, viewMode, settingsFetched, isRightAgentOpen } = useSelector(state => state.ide);

  const topItems = [
    { id: "explorer", icon: Files, title: "Explorer (Ctrl+Shift+E)" },
    { id: "search", icon: Search, title: "Search (Ctrl+Shift+F)" },
    { id: "git", icon: GitBranch, title: "Source Control (Ctrl+Shift+G)" },
    { 
      id: "agent", 
      icon: Bot, 
      title: "CortexAI Agent Pair-Programmer", 
      badge: "AI", 
      highlight: true 
    },
    { 
      id: "settings", 
      icon: Settings, 
      title: "VS Code Settings & Configuration",
      badge: settingsFetched ? "✓" : null
    }
  ];

  return (
    <div className="w-12 bg-[#181818] border-r border-[#2b2b2b] flex flex-col justify-between items-center py-2 select-none z-10 shrink-0">
      {/* Top Icons */}
      <div className="flex flex-col items-center gap-1 w-full">
        {topItems.map(item => {
          const Icon = item.icon;
          const isActive = item.id === "agent" ? isRightAgentOpen : activeSidebarTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "agent") {
                  dispatch(toggleRightAgent());
                } else {
                  dispatch(setActiveSidebarTab(item.id));
                }
              }}
              title={item.title}
              className={`relative w-12 h-11 flex items-center justify-center transition-colors group cursor-pointer ${
                isActive ? "text-white" : "text-[#858585] hover:text-white"
              }`}
            >
              {/* Left active border indicator (VS Code style) */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-indigo-500 rounded-r" />
              )}
              <div className="relative">
                <Icon size={20} strokeWidth={1.75} className={item.highlight && !isActive ? "text-indigo-400 group-hover:text-indigo-300" : ""} />
                {item.badge && (
                  <span className={`absolute -top-1.5 -right-2 text-[9px] font-bold px-1 py-0.2 rounded-full leading-tight ${
                    item.badge === "✓" ? "bg-emerald-600 text-white" : "bg-indigo-600 text-white animate-pulse"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Icons */}
      <div className="flex flex-col items-center gap-1 w-full">
        {/* Toggle Terminal Bottom Panel */}
        <button
          onClick={() => dispatch(toggleBottomPanel("terminal"))}
          title="Toggle Terminal (Ctrl+`)"
          className={`w-12 h-10 flex items-center justify-center transition-colors cursor-pointer ${
            isBottomPanelOpen ? "text-white" : "text-[#858585] hover:text-white"
          }`}
        >
          <Terminal size={18} strokeWidth={1.75} />
        </button>

        {/* Switch to Split Mode */}
        <button
          onClick={() => dispatch(setViewMode(viewMode === "split" ? "ide" : "split"))}
          title={viewMode === "split" ? "Switch to Full IDE" : "Split View (Chat + IDE)"}
          className={`w-12 h-10 flex items-center justify-center transition-colors cursor-pointer ${
            viewMode === "split" ? "text-indigo-400" : "text-[#858585] hover:text-white"
          }`}
        >
          <Columns size={18} strokeWidth={1.75} />
        </button>

        {/* Back to Chat View */}
        <button
          onClick={() => dispatch(setViewMode("chat"))}
          title="Switch to Chat View"
          className="w-12 h-10 flex items-center justify-center text-[#858585] hover:text-white transition-colors cursor-pointer"
        >
          <MessageSquare size={18} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

