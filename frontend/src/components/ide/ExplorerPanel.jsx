import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ChevronRight, 
  ChevronDown, 
  FolderPlus, 
  FilePlus, 
  Upload, 
  RefreshCw, 
  Trash2, 
  Settings2, 
  Download,
  Sliders,
  FolderArchive,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { 
  openTab, 
  deleteFile, 
  addOrUpdateFile, 
  setProject, 
  fetchVsCodeSettings,
  setActiveSidebarTab,
  setRepoLoading,
  resetRepoLoading,
  showToast 
} from '../../redux/ideSlice';
import { buildFileTree, readFolderFiles, openProjectFolderWithFileSystemApi } from './treeUtils';
import { getFileIcon } from './fileIconHelper';

export default function ExplorerPanel() {
  const dispatch = useDispatch();
  const { files, activeTab, projectName, vscodeSettings, settingsFetched, settingsSource } = useSelector(state => state.ide);
  const [collapsedFolders, setCollapsedFolders] = useState({});
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const folderInputRef = useRef(null);

  const tree = buildFileTree(files);

  const toggleFolder = (folderPath) => {
    setCollapsedFolders(prev => ({
      ...prev,
      [folderPath]: !prev[folderPath]
    }));
  };

  const handleStartFolderPicker = async () => {
    if (typeof window.showDirectoryPicker === "function") {
      dispatch(setRepoLoading({
        isLoading: true,
        repoName: "Selected Folder",
        totalFiles: 0,
        processedFiles: 0,
        percentage: 5,
        currentFile: "",
        phase: "Opening directory picker..."
      }));

      try {
        const result = await openProjectFolderWithFileSystemApi((progress) => {
          dispatch(setRepoLoading({
            isLoading: true,
            repoName: progress.fileName,
            totalFiles: progress.total,
            processedFiles: progress.current,
            percentage: progress.percentage,
            currentFile: progress.fileName,
            phase: progress.phase
          }));
        });

        if (!result) {
          dispatch(resetRepoLoading());
          folderInputRef.current?.click();
          return;
        }

        if (result.cancelled) {
          dispatch(resetRepoLoading());
          return;
        }

        dispatch(setProject({
          name: result.name,
          files: result.files,
          vscodeSettings: result.vscodeSettings
        }));

        if (result.vscodeSettings) {
          dispatch(fetchVsCodeSettings());
        }

        dispatch(showToast({
          message: `Workspace "${result.name}" loaded with ${result.files.length} files.`,
          type: "success"
        }));

        setTimeout(() => {
          dispatch(resetRepoLoading());
        }, 500);
        return;
      } catch (err) {
        console.warn("Picker failed, trying input fallback:", err);
        dispatch(resetRepoLoading());
        folderInputRef.current?.click();
        return;
      }
    }

    folderInputRef.current?.click();
  };

  const handleFolderUpload = async (e) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    const topFolderName = uploadedFiles[0].webkitRelativePath?.split(/[/\\]/)[0] || "uploaded-repo";

    dispatch(setRepoLoading({
      isLoading: true,
      repoName: topFolderName,
      totalFiles: uploadedFiles.length,
      processedFiles: 0,
      percentage: 2,
      currentFile: uploadedFiles[0]?.name || "",
      phase: "Starting workspace scanner..."
    }));

    try {
      const { files: parsedFiles, vscodeSettings: extractedSettings } = await readFolderFiles(
        uploadedFiles,
        (progress) => {
          dispatch(setRepoLoading({
            isLoading: true,
            repoName: topFolderName,
            totalFiles: progress.total,
            processedFiles: progress.current,
            percentage: progress.percentage,
            currentFile: progress.fileName,
            phase: progress.phase
          }));
        }
      );
      
      dispatch(setProject({
        name: topFolderName,
        files: parsedFiles,
        vscodeSettings: extractedSettings
      }));

      if (extractedSettings) {
        dispatch(fetchVsCodeSettings());
      }

      dispatch(showToast({
        message: `Workspace "${topFolderName}" loaded with ${parsedFiles.length} files.`,
        type: "success"
      }));

      setTimeout(() => {
        dispatch(resetRepoLoading());
      }, 500);
    } catch (err) {
      console.error("Folder upload failed:", err);
      dispatch(resetRepoLoading());
      dispatch(showToast({
        message: "Failed to read project folder. Please check file permissions.",
        type: "error"
      }));
    } finally {
      if (folderInputRef.current) {
        folderInputRef.current.value = "";
      }
    }
  };

  const handleCreateFileSubmit = (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    const path = newFileName.trim();
    dispatch(addOrUpdateFile({
      path,
      content: "",
      name: path.split("/").pop()
    }));
    setNewFileName("");
    setIsCreatingFile(false);
  };

  const renderTreeItem = (item, depth = 0) => {
    const isFolder = item.isDirectory;
    const isCollapsed = collapsedFolders[item.path];
    const isSelected = activeTab === item.path;

    if (isFolder) {
      return (
        <div key={item.path} className="w-full">
          <div
            onClick={() => toggleFolder(item.path)}
            className="flex items-center gap-1.5 py-1 px-2 hover:bg-[#2a2d2e] cursor-pointer text-[#cccccc] text-[13px] select-none group"
            style={{ paddingLeft: `${depth * 14 + 10}px` }}
          >
            <span className="text-[#858585] group-hover:text-white">
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </span>
            {getFileIcon(item.name, true, !isCollapsed)}
            <span className="truncate font-medium">{item.name}</span>
          </div>
          {!isCollapsed && (
            <div className="w-full">
              {item.children.map(child => renderTreeItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={item.path}
        onClick={() => dispatch(openTab(item.path))}
        className={`flex items-center justify-between py-1 px-2 cursor-pointer text-[13px] select-none group transition-colors ${
          isSelected 
            ? "bg-[#37373d] text-white font-medium border-l-2 border-indigo-500" 
            : "text-[#cccccc] hover:bg-[#2a2d2e] hover:text-white"
        }`}
        style={{ paddingLeft: `${depth * 14 + 20}px` }}
      >
        <div className="flex items-center gap-2 truncate">
          {getFileIcon(item.name, false)}
          <span className="truncate">{item.name}</span>
          {item.isModified && (
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" title="Unsaved changes" />
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            dispatch(deleteFile(item.path));
            dispatch(showToast({ message: `Deleted ${item.name}`, type: "info" }));
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-[#858585] hover:text-red-400 transition-opacity bg-transparent border-none cursor-pointer"
          title="Delete File"
        >
          <Trash2 size={12} />
        </button>
      </div>
    );
  };

  return (
    <div className="w-64 bg-[#252526] border-r border-[#2b2b2b] flex flex-col h-full text-slate-300 select-none shrink-0 overflow-hidden">
      {/* Hidden File Input for Folder Selection */}
      <input
        type="file"
        ref={folderInputRef}
        webkitdirectory="true"
        directory="true"
        multiple
        onChange={handleFolderUpload}
        className="hidden"
      />

      {/* Explorer Header */}
      <div className="h-9 px-4 flex items-center justify-between border-b border-[#2b2b2b] shrink-0">
        <span className="text-[11px] font-semibold tracking-wider text-[#bbbbbb] uppercase">
          Explorer
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleStartFolderPicker}
            title="Upload Project Folder / Repo"
            className="p-1 hover:bg-[#37373d] rounded text-[#858585] hover:text-white transition-colors cursor-pointer"
          >
            <Upload size={14} />
          </button>
          <button
            onClick={() => setIsCreatingFile(true)}
            title="New File"
            className="p-1 hover:bg-[#37373d] rounded text-[#858585] hover:text-white transition-colors cursor-pointer"
          >
            <FilePlus size={14} />
          </button>
          <button
            onClick={() => dispatch(fetchVsCodeSettings())}
            title="Fetch VS Code Settings"
            className="p-1 hover:bg-[#37373d] rounded text-[#858585] hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <Settings2 size={14} />
          </button>
        </div>
      </div>

      {/* Project Root Section */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1e1e1e] border-b border-[#2b2b2b] text-[11px] font-bold tracking-wide uppercase text-slate-300">
        <div className="flex items-center gap-1.5 truncate">
          <ChevronDown size={14} />
          <span className="truncate">{projectName}</span>
        </div>
        <span className="text-[10px] text-slate-500 lowercase font-normal">
          {files.length} files
        </span>
      </div>

      {/* Inline File Creator */}
      {isCreatingFile && (
        <form onSubmit={handleCreateFileSubmit} className="p-2 border-b border-[#333] bg-[#1e1e1e]">
          <input
            type="text"
            autoFocus
            placeholder="filename.ext (e.g. Header.jsx)"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onBlur={() => {
              if (!newFileName.trim()) setIsCreatingFile(false);
            }}
            className="w-full text-xs bg-[#3c3c3c] text-white px-2 py-1 rounded outline-none border border-indigo-500"
          />
        </form>
      )}

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-1">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500 gap-3">
            <FolderArchive size={36} className="text-slate-600" />
            <p className="text-xs">No repository loaded yet.</p>
            <button
              onClick={handleStartFolderPicker}
              className="flex items-center gap-2 px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium cursor-pointer"
            >
              <Upload size={14} /> Upload Folder
            </button>
          </div>
        ) : (
          tree.map(item => renderTreeItem(item))
        )}
      </div>

      {/* Upload Progress Overlay */}
      {isUploading && (
        <div className="p-3 bg-indigo-950/80 border-t border-indigo-500/30 text-xs text-indigo-200 flex items-center gap-2 animate-pulse">
          <RefreshCw size={14} className="animate-spin" />
          <span>Reading folder repository...</span>
        </div>
      )}

      {/* Bottom Accordion: Quick VS Code Settings Banner */}
      <div className="border-t border-[#2b2b2b] bg-[#1e1e1e] p-2.5 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <Sliders size={13} className="text-indigo-400" />
            <span>VS Code Settings</span>
          </div>
          {settingsFetched && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
              <CheckCircle2 size={11} /> Fetched
            </span>
          )}
        </div>

        <p className="text-[11px] text-slate-400 leading-tight">
          {settingsFetched 
            ? `Active configuration (${settingsSource}): ${vscodeSettings["workbench.colorTheme"]}, ${vscodeSettings["editor.tabSize"]} spaces.`
            : "No custom settings fetched. Fetch to sync editor preferences."}
        </p>

        <button
          onClick={() => {
            dispatch(fetchVsCodeSettings());
            dispatch(setActiveSidebarTab("settings"));
          }}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] rounded text-[11px] font-medium text-slate-200 transition-colors cursor-pointer"
        >
          <Settings2 size={13} className="text-indigo-400" />
          {settingsFetched ? "View / Edit Settings" : "Fetch VS Code Settings"}
        </button>
      </div>
    </div>
  );
}

