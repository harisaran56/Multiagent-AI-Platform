import React from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FolderArchive, 
  Sparkles, 
  CheckCircle2, 
  FileCode2, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';

export default function RepoLoadingModal() {
  const { repoLoading } = useSelector(state => state.ide);

  if (!repoLoading?.isLoading) return null;

  const isDone = repoLoading.percentage >= 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 16 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-[#13151c]/95 border border-indigo-500/30 rounded-2xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative overflow-hidden"
        >
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Orbital Animation */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className="relative w-16 h-16 flex items-center justify-center mb-3">
              {/* Spinning Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 border-r-purple-500/60"
              />
              {/* Outer Counter-Spinning Ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-1 rounded-full border border-dashed border-indigo-400/20"
              />
              {/* Center Icon */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-600/30 border border-indigo-500/40 flex items-center justify-center shadow-inner shadow-indigo-500/20">
                {isDone ? (
                  <CheckCircle2 size={24} className="text-emerald-400" />
                ) : (
                  <FolderArchive size={22} className="text-indigo-400 animate-pulse" />
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">
              <Sparkles size={13} />
              <span>CortexAI Workspace Loader</span>
            </div>

            <h3 className="text-base font-semibold text-white tracking-tight truncate max-w-full">
              Loading {repoLoading.repoName || "Project Repository"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {repoLoading.phase || "Initializing workspace structure..."}
            </p>
          </div>

          {/* Progress Bar Container */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-400">
                {repoLoading.processedFiles.toLocaleString()} / {repoLoading.totalFiles.toLocaleString()} files
              </span>
              <span className="text-indigo-400 font-mono font-bold">
                {repoLoading.percentage}%
              </span>
            </div>

            {/* Glowing Track */}
            <div className="w-full h-2.5 bg-[#1e2230] rounded-full overflow-hidden p-0.5 border border-white/5 relative">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400"
                style={{ width: `${repoLoading.percentage}%` }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Current File Marquee */}
          {repoLoading.currentFile && (
            <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl text-xs mb-4 overflow-hidden">
              <FileCode2 size={14} className="text-indigo-400 shrink-0" />
              <span className="text-slate-400 shrink-0">Reading:</span>
              <span className="text-slate-200 font-mono truncate text-[11px]">
                {repoLoading.currentFile}
              </span>
            </div>
          )}

          {/* Smart Optimizations Note */}
          <div className="flex items-start gap-2 pt-2 border-t border-white/[0.06] text-[11px] text-slate-500">
            <Zap size={13} className="text-amber-400 shrink-0 mt-0.5" />
            <span>
              Auto-optimizing: filtered out <code className="text-slate-400 font-mono">node_modules</code>, <code className="text-slate-400 font-mono">.git</code>, and large binary blobs for maximum IDE performance.
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

