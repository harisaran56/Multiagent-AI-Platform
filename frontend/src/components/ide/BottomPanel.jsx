import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Terminal as TerminalIcon, 
  AlertCircle, 
  FileText, 
  X, 
  Trash2, 
  Play, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { 
  toggleBottomPanel, 
  addTerminalLog, 
  clearTerminalLogs, 
  fetchVsCodeSettings 
} from '../../redux/ideSlice';

export default function BottomPanel({ onFormatDocument }) {
  const dispatch = useDispatch();
  const { isBottomPanelOpen, activeBottomPanel, terminalHistory, projectName } = useSelector(state => state.ide);
  const [activeTab, setActiveTab] = useState(activeBottomPanel || "terminal");
  const [cmdInput, setCmdInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalHistory]);

  if (!isBottomPanelOpen) return null;

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    if (!cmdInput.trim()) return;

    const cmd = cmdInput.trim();
    dispatch(addTerminalLog({ type: "command", text: `$ ${cmd}` }));
    setCmdInput("");

    // Simple built-in IDE terminal command handler
    if (cmd === "help") {
      dispatch(addTerminalLog({
        type: "info",
        text: "Available commands:\n  fetch-settings  - Fetch and synchronize all VS Code settings\n  format          - Format current open file\n  clear           - Clear terminal logs\n  run             - Build and test active workspace\n  status          - Show workspace and git branch status"
      }));
    } else if (cmd === "fetch-settings" || cmd === "settings") {
      dispatch(fetchVsCodeSettings());
      dispatch(addTerminalLog({
        type: "success",
        text: "Successfully fetched and synchronized VS Code settings!"
      }));
    } else if (cmd === "format") {
      onFormatDocument?.();
      dispatch(addTerminalLog({
        type: "success",
        text: "Executed document formatting."
      }));
    } else if (cmd === "clear") {
      dispatch(clearTerminalLogs());
    } else if (cmd === "run" || cmd === "npm run dev" || cmd === "npm start") {
      dispatch(addTerminalLog({
        type: "info",
        text: `Starting dev server for ${projectName}...\n> Ready at http://localhost:5173\n> Live reload enabled.`
      }));
    } else if (cmd === "status") {
      dispatch(addTerminalLog({
        type: "info",
        text: `On branch main\nProject: ${projectName}\nCortexAI Agent Pair-Programmer: Active`
      }));
    } else {
      dispatch(addTerminalLog({
        type: "warn",
        text: `command not recognized: '${cmd}'. Type 'help' for command list.`
      }));
    }
  };

  return (
    <div className="h-48 bg-[#181818] border-t border-[#2b2b2b] flex flex-col select-none shrink-0 z-10">
      {/* Panel header tabs */}
      <div className="h-8 px-3 bg-[#1e1e1e] border-b border-[#2b2b2b] flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab("terminal")}
            className={`flex items-center gap-1.5 py-1 uppercase tracking-wider cursor-pointer border-b-2 transition-colors ${
              activeTab === "terminal" 
                ? "text-white border-indigo-500 font-semibold" 
                : "text-slate-400 border-transparent hover:text-white"
            }`}
          >
            <TerminalIcon size={12} />
            Terminal
          </button>

          <button
            onClick={() => setActiveTab("output")}
            className={`flex items-center gap-1.5 py-1 uppercase tracking-wider cursor-pointer border-b-2 transition-colors ${
              activeTab === "output" 
                ? "text-white border-indigo-500 font-semibold" 
                : "text-slate-400 border-transparent hover:text-white"
            }`}
          >
            <FileText size={12} />
            Output
          </button>

          <button
            onClick={() => setActiveTab("problems")}
            className={`flex items-center gap-1.5 py-1 uppercase tracking-wider cursor-pointer border-b-2 transition-colors ${
              activeTab === "problems" 
                ? "text-white border-indigo-500 font-semibold" 
                : "text-slate-400 border-transparent hover:text-white"
            }`}
          >
            <AlertCircle size={12} />
            Problems (0)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch(clearTerminalLogs())}
            title="Clear Terminal"
            className="p-1 hover:bg-[#333] rounded text-[#858585] hover:text-white transition-colors cursor-pointer"
          >
            <Trash2 size={12} />
          </button>
          <button
            onClick={() => dispatch(toggleBottomPanel(null))}
            title="Close Panel"
            className="p-1 hover:bg-[#333] rounded text-[#858585] hover:text-white transition-colors cursor-pointer"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs select-text">
        {activeTab === "terminal" && (
          <div className="space-y-1.5">
            {terminalHistory.map((item, index) => (
              <div
                key={index}
                className={`whitespace-pre-wrap leading-relaxed ${
                  item.type === "command"
                    ? "text-indigo-400 font-bold"
                    : item.type === "success"
                    ? "text-emerald-400"
                    : item.type === "warn"
                    ? "text-amber-400"
                    : item.type === "error"
                    ? "text-rose-400"
                    : "text-slate-300"
                }`}
              >
                {item.text}
              </div>
            ))}
            <div ref={endRef} />
            <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 pt-1">
              <span className="text-emerald-400 font-bold select-none">➜</span>
              <span className="text-indigo-400 select-none">cortex-ide:</span>
              <input
                type="text"
                value={cmdInput}
                onChange={(e) => setCmdInput(e.target.value)}
                placeholder="type 'help' or commands..."
                className="flex-1 bg-transparent text-slate-100 outline-none font-mono text-xs"
              />
            </form>
          </div>
        )}

        {activeTab === "output" && (
          <div className="text-slate-400 space-y-1">
            <p>[CortexAI Extension Host] Initialized successfully.</p>
            <p>[Language Server] Analyzing workspace syntax and dependencies...</p>
            <p>[Prettier / Linter] Ready. Format on save active.</p>
          </div>
        )}

        {activeTab === "problems" && (
          <div className="flex items-center gap-2 text-slate-400 py-4 justify-center">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>No problems or diagnostics detected in workspace.</span>
          </div>
        )}
      </div>
    </div>
  );
}

