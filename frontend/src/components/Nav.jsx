import { MessageSquare, Code2, Columns, FolderArchive, Upload, Sliders, CheckCircle2 } from 'lucide-react'
import React, { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  setViewMode, 
  setProject, 
  fetchVsCodeSettings, 
  setActiveSidebarTab,
  setRepoLoading,
  resetRepoLoading,
  showToast 
} from '../redux/ideSlice'
import { readFolderFiles, openProjectFolderWithFileSystemApi } from './ide/treeUtils'

function Nav() {
  const dispatch = useDispatch()
  const { selectedConversation } = useSelector(state => state.conversation)
  const { messages } = useSelector(state => state.message)
  const { viewMode, projectName, settingsFetched } = useSelector(state => state.ide)
  const folderInputRef = useRef(null)

  const handleStartFolderPicker = async () => {
    // 1. Modern File System API (bypasses Chrome's "Upload 109,827 files" security prompt by skipping node_modules before scanning)
    if (typeof window.showDirectoryPicker === "function") {
      dispatch(setRepoLoading({
        isLoading: true,
        repoName: "Selected Folder",
        totalFiles: 0,
        processedFiles: 0,
        percentage: 5,
        currentFile: "",
        phase: "Opening directory picker..."
      }))

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
          }))
        })

        if (!result) {
          dispatch(resetRepoLoading())
          folderInputRef.current?.click()
          return
        }

        if (result.cancelled) {
          dispatch(resetRepoLoading())
          return
        }

        dispatch(setProject({
          name: result.name,
          files: result.files,
          vscodeSettings: result.vscodeSettings
        }))

        if (result.vscodeSettings) {
          dispatch(fetchVsCodeSettings())
        }
        dispatch(setViewMode("ide"))
        dispatch(showToast({
          message: `Workspace "${result.name}" loaded successfully with ${result.files.length} files.`,
          type: "success"
        }))

        setTimeout(() => {
          dispatch(resetRepoLoading())
        }, 500)
        return
      } catch (err) {
        console.warn("Picker failed, trying input fallback", err)
        dispatch(resetRepoLoading())
        folderInputRef.current?.click()
        return
      }
    }

    // 2. Legacy fallback
    folderInputRef.current?.click()
  }

  const handleFolderUpload = async (e) => {
    const uploadedFiles = e.target.files
    if (!uploadedFiles || uploadedFiles.length === 0) return

    const topFolderName = uploadedFiles[0].webkitRelativePath?.split(/[/\\]/)[0] || "uploaded-repo"

    dispatch(setRepoLoading({
      isLoading: true,
      repoName: topFolderName,
      totalFiles: uploadedFiles.length,
      processedFiles: 0,
      percentage: 2,
      currentFile: uploadedFiles[0]?.name || "",
      phase: "Starting workspace scanner..."
    }))

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
          }))
        }
      )

      dispatch(setProject({
        name: topFolderName,
        files: parsedFiles,
        vscodeSettings: extractedSettings
      }))

      if (extractedSettings) {
        dispatch(fetchVsCodeSettings())
      }
      dispatch(setViewMode("ide"))
      dispatch(showToast({
        message: `Workspace "${topFolderName}" loaded successfully with ${parsedFiles.length} files.`,
        type: "success"
      }))

      setTimeout(() => {
        dispatch(resetRepoLoading())
      }, 500)
    } catch (err) {
      console.error("Folder upload failed:", err)
      dispatch(resetRepoLoading())
      dispatch(showToast({
        message: "Failed to read project folder. Please check file permissions.",
        type: "error"
      }))
    } finally {
      if (folderInputRef.current) {
        folderInputRef.current.value = ""
      }
    }
  }

  return (
    <>
      <input
        type="file"
        ref={folderInputRef}
        webkitdirectory="true"
        directory="true"
        multiple
        onChange={handleFolderUpload}
        className="hidden"
      />

      <div className='h-14 flex items-center justify-between px-5 border-b border-white/[0.06] bg-[#0d0f14] shrink-0'>
        {/* Left: Chat info */}
        <div className='flex items-center gap-2.5 truncate'>
          <div className='flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 shrink-0'>
            <MessageSquare size={13} className="text-indigo-400" />
          </div>
          <div className='text-[14px] font-semibold text-slate-100 tracking-tight truncate max-w-[200px] sm:max-w-[300px]'>
            {selectedConversation?.title || "New Chat"}
          </div>
          <div className='hidden sm:flex text-[10px] font-medium text-slate-600 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-full shrink-0'>
            {messages?.length || 0} Messages
          </div>
        </div>

        {/* Right: IDE & Repo Controls */}
        <div className='flex items-center gap-2 shrink-0'>
          {/* Upload Project Repo Button */}
          <button
            onClick={handleStartFolderPicker}
            className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-medium text-slate-200 transition-all cursor-pointer'
            title='Upload a complete local folder repository'
          >
            <Upload size={13} className="text-indigo-400" />
            <span className='hidden md:inline'>Upload Repo</span>
          </button>

          {/* Fetch VS Code Settings Button */}
          <button
            onClick={() => {
              dispatch(fetchVsCodeSettings())
              dispatch(setActiveSidebarTab("settings"))
              dispatch(setViewMode("ide"))
            }}
            className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-medium text-slate-200 transition-all cursor-pointer'
            title='Fetch all VS Code settings'
          >
            <Sliders size={13} className="text-indigo-400" />
            <span className='hidden lg:inline'>VS Code Settings</span>
            {settingsFetched && (
              <span className='w-1.5 h-1.5 rounded-full bg-emerald-400' />
            )}
          </button>

          {/* View Mode Switcher (Chat | Split | VS Code IDE) */}
          <div className='flex items-center bg-black/40 p-1 rounded-xl border border-white/[0.08] gap-0.5'>
            <button
              onClick={() => dispatch(setViewMode("chat"))}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === "chat" 
                  ? "bg-indigo-600 text-white shadow-sm" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <MessageSquare size={12} />
              <span className='hidden sm:inline'>Chat</span>
            </button>
            <button
              onClick={() => dispatch(setViewMode("split"))}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === "split" 
                  ? "bg-indigo-600 text-white shadow-sm" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Columns size={12} />
              <span className='hidden sm:inline'>Split</span>
            </button>
            <button
              onClick={() => dispatch(setViewMode("ide"))}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === "ide" 
                  ? "bg-indigo-600 text-white shadow-sm" 
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Code2 size={12} />
              <span className='hidden sm:inline'>VS Code IDE</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Nav
