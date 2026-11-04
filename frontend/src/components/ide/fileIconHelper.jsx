import React from 'react';
import { 
  FileCode, 
  FileText, 
  FileJson, 
  Folder, 
  FolderOpen, 
  File, 
  Settings, 
  GitBranch, 
  FileSpreadsheet,
  Terminal,
  Code2
} from 'lucide-react';

export const getFileIcon = (fileName = "", isDirectory = false, isOpen = false) => {
  if (isDirectory) {
    if (fileName === ".vscode") {
      return <Settings size={15} className="text-blue-400 shrink-0" />;
    }
    if (fileName === ".git") {
      return <GitBranch size={15} className="text-orange-400 shrink-0" />;
    }
    return isOpen 
      ? <FolderOpen size={15} className="text-amber-400 shrink-0" />
      : <Folder size={15} className="text-amber-400 shrink-0" />;
  }

  const lower = fileName.toLowerCase();

  if (lower === "settings.json" || lower.endsWith(".vscode/settings.json")) {
    return <Settings size={14} className="text-blue-400 shrink-0" />;
  }
  if (lower.endsWith(".jsx") || lower.endsWith(".tsx")) {
    return <Code2 size={14} className="text-cyan-400 shrink-0" />;
  }
  if (lower.endsWith(".js") || lower.endsWith(".mjs")) {
    return <FileCode size={14} className="text-yellow-400 shrink-0" />;
  }
  if (lower.endsWith(".ts")) {
    return <FileCode size={14} className="text-blue-400 shrink-0" />;
  }
  if (lower.endsWith(".html") || lower.endsWith(".htm")) {
    return <FileCode size={14} className="text-orange-500 shrink-0" />;
  }
  if (lower.endsWith(".css") || lower.endsWith(".scss") || lower.endsWith(".less")) {
    return <FileCode size={14} className="text-sky-400 shrink-0" />;
  }
  if (lower.endsWith(".json")) {
    return <FileJson size={14} className="text-amber-300 shrink-0" />;
  }
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) {
    return <FileText size={14} className="text-indigo-400 shrink-0" />;
  }
  if (lower.endsWith(".py")) {
    return <FileCode size={14} className="text-emerald-400 shrink-0" />;
  }
  if (lower.endsWith(".sh") || lower.endsWith(".bash")) {
    return <Terminal size={14} className="text-emerald-300 shrink-0" />;
  }
  if (lower.endsWith(".csv")) {
    return <FileSpreadsheet size={14} className="text-emerald-500 shrink-0" />;
  }

  return <File size={14} className="text-slate-400 shrink-0" />;
};

