import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Settings, 
  RefreshCw, 
  Download, 
  Copy, 
  Check, 
  Code, 
  Sliders, 
  FileCheck,
  CheckCircle2,
  FolderSync
} from 'lucide-react';
import { 
  fetchVsCodeSettings, 
  updateVsCodeSetting, 
  addOrUpdateFile, 
  openTab 
} from '../../redux/ideSlice';

export default function SettingsPanel() {
  const dispatch = useDispatch();
  const { vscodeSettings, settingsFetched, settingsSource, files } = useSelector(state => state.ide);
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("gui"); // "gui" | "json"

  const hasLocalSettingsFile = files.some(f => f.path.includes(".vscode/settings.json"));

  const handleCopyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(vscodeSettings, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSettings = () => {
    const blob = new Blob([JSON.stringify(vscodeSettings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "settings.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleInjectIntoProject = () => {
    dispatch(addOrUpdateFile({
      path: ".vscode/settings.json",
      name: "settings.json",
      content: JSON.stringify(vscodeSettings, null, 2),
      language: "json"
    }));
    dispatch(openTab(".vscode/settings.json"));
  };

  return (
    <div className="w-80 bg-[#252526] border-r border-[#2b2b2b] flex flex-col h-full text-slate-300 select-none shrink-0 overflow-hidden">
      {/* Settings Header */}
      <div className="h-9 px-4 flex items-center justify-between border-b border-[#2b2b2b] shrink-0">
        <span className="text-[11px] font-semibold tracking-wider text-[#bbbbbb] uppercase flex items-center gap-1.5">
          <Settings size={13} className="text-indigo-400" />
          VS Code Settings
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveSubTab(activeSubTab === "gui" ? "json" : "gui")}
            title={activeSubTab === "gui" ? "Switch to JSON" : "Switch to GUI"}
            className="p-1 hover:bg-[#37373d] rounded text-[#858585] hover:text-white transition-colors cursor-pointer"
          >
            {activeSubTab === "gui" ? <Code size={13} /> : <Sliders size={13} />}
          </button>
          <button
            onClick={handleCopyJson}
            title="Copy Settings JSON"
            className="p-1 hover:bg-[#37373d] rounded text-[#858585] hover:text-white transition-colors cursor-pointer"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>
        </div>
      </div>

      {/* Fetch Settings Hero Bar */}
      <div className="p-3 bg-[#1e1e1e] border-b border-[#2b2b2b] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white">Repository Settings</span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
            hasLocalSettingsFile 
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
          }`}>
            {hasLocalSettingsFile ? "Found in Repo" : "Default Config"}
          </span>
        </div>

        <p className="text-[11px] text-slate-400 leading-tight">
          {settingsFetched
            ? `Successfully synchronized settings from ${settingsSource}.`
            : "Click below to inspect or fetch all VS Code settings from the uploaded repository."}
        </p>

        <div className="flex gap-1.5 pt-1">
          <button
            onClick={() => dispatch(fetchVsCodeSettings())}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition-colors cursor-pointer"
          >
            <FolderSync size={13} />
            Fetch All Settings
          </button>
          <button
            onClick={handleInjectIntoProject}
            title="Save as .vscode/settings.json in project"
            className="p-1.5 bg-[#333] hover:bg-[#444] text-slate-200 rounded text-xs transition-colors cursor-pointer"
          >
            <FileCheck size={14} />
          </button>
          <button
            onClick={handleDownloadSettings}
            title="Download settings.json"
            className="p-1.5 bg-[#333] hover:bg-[#444] text-slate-200 rounded text-xs transition-colors cursor-pointer"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Settings Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeSubTab === "gui" ? (
          <>
            {/* Editor Group */}
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 border-b border-white/5 pb-1">
                Text Editor
              </h3>
              
              {/* Font Size */}
              <div className="mb-3">
                <label className="text-[12px] text-slate-300 flex justify-between mb-1">
                  <span>editor.fontSize</span>
                  <span className="text-indigo-400 font-mono">{vscodeSettings["editor.fontSize"]}px</span>
                </label>
                <input
                  type="range"
                  min="11"
                  max="22"
                  value={vscodeSettings["editor.fontSize"] || 14}
                  onChange={(e) => dispatch(updateVsCodeSetting({
                    key: "editor.fontSize",
                    value: Number(e.target.value)
                  }))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Tab Size */}
              <div className="mb-3">
                <label className="text-[12px] text-slate-300 block mb-1">editor.tabSize</label>
                <div className="flex gap-2">
                  {[2, 4, 8].map(size => (
                    <button
                      key={size}
                      onClick={() => dispatch(updateVsCodeSetting({
                        key: "editor.tabSize",
                        value: size
                      }))}
                      className={`flex-1 py-1 text-xs rounded border transition-colors cursor-pointer ${
                        vscodeSettings["editor.tabSize"] === size
                          ? "bg-indigo-600 text-white border-transparent"
                          : "bg-[#333] text-slate-400 border-transparent hover:bg-[#3f3f3f]"
                      }`}
                    >
                      {size} Spaces
                    </button>
                  ))}
                </div>
              </div>

              {/* Word Wrap */}
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-[12px] text-slate-300">editor.wordWrap</div>
                  <div className="text-[10px] text-slate-500">Wrap long code lines</div>
                </div>
                <input
                  type="checkbox"
                  checked={vscodeSettings["editor.wordWrap"] === "on"}
                  onChange={(e) => dispatch(updateVsCodeSetting({
                    key: "editor.wordWrap",
                    value: e.target.checked ? "on" : "off"
                  }))}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Minimap */}
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-[12px] text-slate-300">editor.minimap.enabled</div>
                  <div className="text-[10px] text-slate-500">Code overview outline</div>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(vscodeSettings["editor.minimap.enabled"])}
                  onChange={(e) => dispatch(updateVsCodeSetting({
                    key: "editor.minimap.enabled",
                    value: e.target.checked
                  }))}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Format On Save */}
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-[12px] text-slate-300">editor.formatOnSave</div>
                  <div className="text-[10px] text-slate-500">Automatically clean & format</div>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(vscodeSettings["editor.formatOnSave"])}
                  onChange={(e) => dispatch(updateVsCodeSetting({
                    key: "editor.formatOnSave",
                    value: e.target.checked
                  }))}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Workbench Group */}
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 border-b border-white/5 pb-1">
                Workbench Theme
              </h3>
              <div className="flex flex-col gap-1.5">
                {[
                  { id: "vs-dark", label: "VS Code Dark+" },
                  { id: "hc-black", label: "High Contrast Dark" },
                  { id: "light", label: "VS Code Light" }
                ].map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => dispatch(updateVsCodeSetting({
                      key: "workbench.colorTheme",
                      value: theme.id
                    }))}
                    className={`flex items-center justify-between px-3 py-1.5 rounded text-xs border transition-colors cursor-pointer ${
                      vscodeSettings["workbench.colorTheme"] === theme.id
                        ? "bg-indigo-600/30 border-indigo-500 text-white font-medium"
                        : "bg-[#333] border-transparent text-slate-400 hover:bg-[#3f3f3f]"
                    }`}
                  >
                    <span>{theme.label}</span>
                    {vscodeSettings["workbench.colorTheme"] === theme.id && (
                      <CheckCircle2 size={13} className="text-indigo-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col">
            <span className="text-[11px] text-slate-400 mb-2 font-mono">
              .vscode/settings.json
            </span>
            <pre className="flex-1 bg-[#1e1e1e] border border-[#333] p-3 rounded text-[11px] font-mono text-emerald-300 overflow-auto whitespace-pre leading-relaxed select-text">
              {JSON.stringify(vscodeSettings, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

