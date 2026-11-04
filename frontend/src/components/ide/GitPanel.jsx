import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GitBranch, Check, RotateCcw, FileCode, CheckCircle2 } from 'lucide-react';
import { openTab, addTerminalLog } from '../../redux/ideSlice';

export default function GitPanel() {
  const dispatch = useDispatch();
  const { files } = useSelector(state => state.ide);
  const [commitMessage, setCommitMessage] = useState("");
  const [isCommitted, setIsCommitted] = useState(false);

  const modifiedFiles = files.filter(f => f.isModified);

  const handleCommit = (e) => {
    e.preventDefault();
    if (!commitMessage.trim()) return;

    dispatch(addTerminalLog({
      type: "info",
      text: `[Git] Committed ${modifiedFiles.length} change(s): "${commitMessage.trim()}"`
    }));

    setIsCommitted(true);
    setTimeout(() => setIsCommitted(false), 2500);
    setCommitMessage("");
  };

  return (
    <div className="w-72 bg-[#252526] border-r border-[#2b2b2b] flex flex-col h-full text-slate-300 select-none shrink-0 overflow-hidden">
      <div className="h-9 px-4 flex items-center justify-between border-b border-[#2b2b2b] shrink-0">
        <span className="text-[11px] font-semibold tracking-wider text-[#bbbbbb] uppercase flex items-center gap-1.5">
          <GitBranch size={13} className="text-orange-400" />
          Source Control
        </span>
        <span className="text-[10px] text-slate-500 font-mono">main*</span>
      </div>

      <div className="p-3 border-b border-[#2b2b2b] bg-[#1e1e1e]">
        <form onSubmit={handleCommit} className="space-y-2">
          <input
            type="text"
            placeholder="Commit message (Ctrl+Enter)..."
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            className="w-full bg-[#3c3c3c] rounded px-2.5 py-1.5 text-xs text-white outline-none border border-transparent focus:border-indigo-500 placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={!commitMessage.trim() || modifiedFiles.length === 0}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded text-xs font-medium transition-colors cursor-pointer"
          >
            {isCommitted ? <CheckCircle2 size={13} className="text-emerald-300" /> : <Check size={13} />}
            Commit & Stage ({modifiedFiles.length})
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 flex justify-between">
          <span>Changes</span>
          <span>{modifiedFiles.length}</span>
        </div>

        {modifiedFiles.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            Working tree clean. No modified files.
          </div>
        ) : (
          <div className="space-y-0.5">
            {modifiedFiles.map(file => (
              <div
                key={file.path}
                onClick={() => dispatch(openTab(file.path))}
                className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-[#2a2d2e] cursor-pointer text-xs group"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode size={13} className="text-amber-400 shrink-0" />
                  <span className="truncate text-slate-300">{file.name}</span>
                </div>
                <span className="text-[10px] font-bold text-amber-400 font-mono">M</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

