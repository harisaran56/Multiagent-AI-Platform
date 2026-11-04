import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronUp, Bot, ShieldCheck, Search, Code2, Compass } from "lucide-react";

function LoadingAnimation() {
    const { agentActivity, activityLogs } = useSelector(state => state.message);
    const [showLogs, setShowLogs] = useState(false);

    // Fallback animation if no streaming activity yet
    const defaultLabel = "Thinking";
    const activeMessage = agentActivity?.message || defaultLabel;
    const activeAgent = (agentActivity?.agent || "agent").toLowerCase();

    const getAgentBadge = (agent) => {
        switch (agent) {
            case "router":
                return { label: "Router", icon: Compass, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
            case "search":
                return { label: "Searcher", icon: Search, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" };
            case "coding":
                return { label: "Coder", icon: Code2, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
            case "verifier":
                return { label: "Verifier", icon: ShieldCheck, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
            default:
                return { label: "Agent", icon: Bot, color: "text-violet-400 bg-violet-500/10 border-violet-500/20" };
        }
    };

    const badge = getAgentBadge(activeAgent);
    const BadgeIcon = badge.icon;

    return (
        <div className='flex flex-col gap-2 max-w-[85%] md:max-w-[72%] py-2'>
            {/* Live Activity Row */}
            <div className='flex items-center gap-3'>
                {/* Glowing Pulse Orb */}
                <div className='relative w-8 h-8 flex items-center justify-center shrink-0'>
                    {[0, 0.45, 0.9].map((delay, i) => (
                        <motion.div
                            key={i}
                            className="absolute inset-0 rounded-full border border-cyan-400/30"
                            initial={{ scale: 0.3, opacity: 0.55 }}
                            animate={{ scale: 1.7, opacity: 0 }}
                            transition={{
                                duration: 1.8,
                                repeat: Infinity,
                                delay,
                                ease: "easeOut",
                            }}
                        />
                    ))}

                    <motion.span
                        className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-cyan-300 to-violet-400"
                        style={{ boxShadow: "0 0 14px rgba(125,211,252,0.55)" }}
                        animate={{ scale: [1, 1.25, 1] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>

                {/* Agent Badge & Status Text */}
                <div className='flex items-center gap-2 flex-wrap'>
                    {agentActivity && (
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${badge.color}`}>
                            <BadgeIcon className="w-3 h-3" />
                            {badge.label}
                        </span>
                    )}

                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={activeMessage}
                            className="text-[13px] font-medium text-slate-300 tracking-wide"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeMessage}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Toggle to view execution timeline/logs if multiple steps occurred */}
                {activityLogs && activityLogs.length > 1 && (
                    <button
                        onClick={() => setShowLogs(prev => !prev)}
                        className="text-slate-500 hover:text-slate-300 p-1 text-[11px] flex items-center gap-1 transition cursor-pointer"
                        title="View agent steps"
                    >
                        <span>{activityLogs.length} steps</span>
                        {showLogs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                )}
            </div>

            {/* Expandable Step History */}
            {showLogs && activityLogs && activityLogs.length > 0 && (
                <div className="ml-11 mt-1 p-2.5 bg-black/40 border border-white/5 rounded-xl text-[11px] text-slate-400 space-y-1.5 animate-fadeIn">
                    <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Live Agent Telemetry</p>
                    {activityLogs.map((log, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 shrink-0" />
                            <span className="font-mono text-[10px] text-slate-400 uppercase">[{log.agent}]</span>
                            <span className="text-slate-300">{log.message}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default LoadingAnimation;
