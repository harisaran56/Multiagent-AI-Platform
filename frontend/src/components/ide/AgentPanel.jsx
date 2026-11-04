import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Bug, 
  HelpCircle, 
  Zap, 
  CheckCircle2, 
  FileCode2, 
  RefreshCw,
  ArrowRight,
  Code
} from 'lucide-react';
import { sendMessageStream } from '../../features/sendMessage';
import { 
  addOrUpdateFile, 
  openTab, 
  addTerminalLog,
  setRightAgentOpen,
  showToast 
} from '../../redux/ideSlice';
import { createConversation } from '../../features/createConversation';
import { X } from 'lucide-react';

export default function AgentPanel({ onClose }) {
  const dispatch = useDispatch();
  const { files, activeTab, projectName } = useSelector(state => state.ide);
  const { selectedConversation } = useSelector(state => state.conversation);
  
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [agentStatus, setAgentStatus] = useState("");
  const [responses, setResponses] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: `Hello! I'm your CortexAI Coding Agent. I have full context of project repository "${projectName}". You can ask me to write new components, explain files, find bugs, or format your codebase.`
    }
  ]);

  const activeFileObj = files.find(f => f.path === activeTab);

  const handleRunAgentAction = async (actionType) => {
    let actionPrompt = "";
    if (!activeFileObj && actionType !== "general") {
      dispatch(showToast({ message: "Please open a file in an editor tab first!", type: "warn" }));
      return;
    }

    if (actionType === "explain") {
      actionPrompt = `Please explain this file (${activeFileObj.name}):\n\n\`\`\`${activeFileObj.language}\n${activeFileObj.content}\n\`\`\``;
    } else if (actionType === "debug") {
      actionPrompt = `Find potential bugs, edge cases, or syntax problems in this file (${activeFileObj.name}) and suggest fixes:\n\n\`\`\`${activeFileObj.language}\n${activeFileObj.content}\n\`\`\``;
    } else if (actionType === "optimize") {
      actionPrompt = `Optimize and clean up this code for better performance and readability (${activeFileObj.name}):\n\n\`\`\`${activeFileObj.language}\n${activeFileObj.content}\n\`\`\``;
    }

    await executeAgentPrompt(actionPrompt);
  };

  const executeAgentPrompt = async (textToSend) => {
    if (!textToSend.trim() || isProcessing) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: textToSend
    };
    setResponses(prev => [...prev, userMessage]);
    setPrompt("");
    setIsProcessing(true);
    setAgentStatus("Analyzing code with Coding Agent...");

    try {
      let convId = selectedConversation?._id;
      if (!convId) {
        const newConv = await createConversation();
        convId = newConv?._id;
      }

      const formData = new FormData();
      formData.append("prompt", textToSend);
      formData.append("conversationId", convId || "ide-session");
      formData.append("agent", "coding");

      const result = await sendMessageStream(formData, (update) => {
        if (update && update.message) {
          setAgentStatus(update.message);
        }
      });

      const assistantMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        text: result?.answer || result?.aiResponse || "Completed processing your request.",
        artifacts: result?.artifacts || [],
        verification: result?.verification
      };

      setResponses(prev => [...prev, assistantMessage]);

      // If the agent returned file artifacts, offer to import/apply them
      if (result?.artifacts && result.artifacts.length > 0) {
        result.artifacts.forEach(art => {
          art.files?.forEach(f => {
            dispatch(addOrUpdateFile({
              name: f.name,
              path: f.name,
              content: f.content
            }));
            dispatch(addTerminalLog({
              type: "success",
              text: `[Agent] Updated or created ${f.name} in workspace.`
            }));
          });
        });
      }
    } catch (err) {
      console.error("Agent error:", err);
      setResponses(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          text: "I encountered an error communicating with the agent server. Please try again."
        }
      ]);
    } finally {
      setIsProcessing(false);
      setAgentStatus("");
    }
  };

  return (
    <div className="w-[360px] max-w-[420px] bg-[#252526] border-l border-[#2b2b2b] flex flex-col h-full text-slate-300 select-none shrink-0 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-[#2b2b2b] shrink-0 bg-[#1e1e1e]">
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-indigo-400" />
          <span className="text-[12px] font-semibold tracking-wider text-white">
            CortexAI Agent
          </span>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded-full font-medium ml-1">
            Pair Programmer
          </span>
        </div>
        <button
          onClick={onClose ?? (() => dispatch(setRightAgentOpen(false)))}
          title="Close AI Agent panel"
          className="p-1 hover:bg-[#333] rounded text-[#858585] hover:text-white transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      {/* Quick Actions for active file */}
      <div className="p-2.5 bg-[#1e1e1e] border-b border-[#2b2b2b] flex flex-col gap-1.5 shrink-0">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Active Context:</span>
          <span className="text-indigo-400 font-mono lowercase truncate max-w-[120px]">
            {activeTab || "none"}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => handleRunAgentAction("explain")}
            disabled={!activeTab || isProcessing}
            className="flex items-center justify-center gap-1 py-1.5 px-2 bg-[#333] hover:bg-[#3f3f3f] disabled:opacity-50 text-[11px] text-slate-200 rounded transition-colors cursor-pointer"
          >
            <HelpCircle size={12} className="text-sky-400" />
            Explain
          </button>
          <button
            onClick={() => handleRunAgentAction("debug")}
            disabled={!activeTab || isProcessing}
            className="flex items-center justify-center gap-1 py-1.5 px-2 bg-[#333] hover:bg-[#3f3f3f] disabled:opacity-50 text-[11px] text-slate-200 rounded transition-colors cursor-pointer"
          >
            <Bug size={12} className="text-rose-400" />
            Debug
          </button>
          <button
            onClick={() => handleRunAgentAction("optimize")}
            disabled={!activeTab || isProcessing}
            className="flex items-center justify-center gap-1 py-1.5 px-2 bg-[#333] hover:bg-[#3f3f3f] disabled:opacity-50 text-[11px] text-slate-200 rounded transition-colors cursor-pointer"
          >
            <Zap size={12} className="text-amber-400" />
            Optimize
          </button>
        </div>
      </div>

      {/* Message Chat Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {responses.map(res => (
          <div
            key={res.id}
            className={`flex flex-col gap-1 text-xs select-text ${
              res.role === "user"
                ? "bg-indigo-600/20 border border-indigo-500/30 p-2.5 rounded-lg text-indigo-100 ml-4"
                : "bg-[#1e1e1e] border border-white/5 p-2.5 rounded-lg text-slate-200 mr-2"
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                {res.role === "assistant" ? <Bot size={12} className="text-indigo-400" /> : "You"}
              </span>
              {res.verification && (
                <span className="text-emerald-400 flex items-center gap-0.5 text-[9px]">
                  <CheckCircle2 size={10} /> Verified {res.verification.score}%
                </span>
              )}
            </div>
            <p className="whitespace-pre-wrap leading-relaxed">{res.text}</p>

            {/* If files were produced by agent */}
            {res.artifacts && res.artifacts.length > 0 && (
              <div className="mt-2 pt-2 border-t border-white/10 flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-indigo-300">Generated Files:</span>
                {res.artifacts[0]?.files?.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => dispatch(openTab(f.name))}
                    className="flex items-center justify-between py-1 px-2 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-[11px] text-left transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <FileCode2 size={12} />
                      {f.name}
                    </span>
                    <ArrowRight size={11} />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-2 p-2 bg-indigo-950/40 border border-indigo-500/20 rounded-lg text-xs text-indigo-300 animate-pulse">
            <RefreshCw size={12} className="animate-spin" />
            <span className="truncate">{agentStatus || "Agent working..."}</span>
          </div>
        )}
      </div>

      {/* Input box */}
      <div className="p-2.5 border-t border-[#2b2b2b] bg-[#1e1e1e]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeAgentPrompt(prompt);
          }}
          className="flex items-center gap-1.5 bg-[#3c3c3c] rounded px-2.5 py-1.5 border border-transparent focus-within:border-indigo-500"
        >
          <input
            type="text"
            placeholder="Ask agent to write or edit code..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isProcessing}
            className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isProcessing}
            className="text-slate-400 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Send size={13} />
          </button>
        </form>
      </div>
    </div>
  );
}

