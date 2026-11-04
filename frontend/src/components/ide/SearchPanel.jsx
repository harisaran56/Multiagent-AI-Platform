import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, ChevronRight, FileCode2 } from 'lucide-react';
import { setSearchQuery, openTab } from '../../redux/ideSlice';

export default function SearchPanel() {
  const dispatch = useDispatch();
  const { searchQuery, searchResults } = useSelector(state => state.ide);

  return (
    <div className="w-72 bg-[#252526] border-r border-[#2b2b2b] flex flex-col h-full text-slate-300 select-none shrink-0 overflow-hidden">
      <div className="h-9 px-4 flex items-center justify-between border-b border-[#2b2b2b] shrink-0">
        <span className="text-[11px] font-semibold tracking-wider text-[#bbbbbb] uppercase">
          Search
        </span>
        <span className="text-[10px] text-slate-500">
          {searchResults.length} matches
        </span>
      </div>

      <div className="p-3 border-b border-[#2b2b2b] bg-[#1e1e1e]">
        <div className="flex items-center gap-1.5 bg-[#3c3c3c] rounded px-2.5 py-1.5 border border-transparent focus-within:border-indigo-500">
          <Search size={13} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search across files..."
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {searchResults.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            {searchQuery ? "No matching lines found." : "Type a term to search project files."}
          </div>
        ) : (
          <div className="space-y-1">
            {searchResults.map((res, idx) => (
              <div
                key={idx}
                onClick={() => dispatch(openTab(res.filePath))}
                className="p-2 rounded hover:bg-[#2a2d2e] cursor-pointer text-xs transition-colors group"
              >
                <div className="flex items-center gap-1.5 text-slate-300 font-medium truncate mb-1">
                  <FileCode2 size={12} className="text-indigo-400 shrink-0" />
                  <span className="truncate">{res.fileName}</span>
                  <span className="text-[10px] text-slate-500">: {res.lineNumber}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono truncate pl-4 border-l border-white/10 group-hover:text-slate-200">
                  {res.lineContent}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

