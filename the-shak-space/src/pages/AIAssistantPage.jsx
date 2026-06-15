import React from "react";
import { Bot, Send } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function AIAssistantPage() {
  const {
    aiInput,
    setAiInput,
    aiMessages,
    isAiTyping,
    askAiSimulation
  } = useApp();

  return (
    <div className="space-y-6 max-w-3xl mx-auto h-[calc(100vh-140px)] flex flex-col justify-between">
      <div className="border-b border-white/[0.08] pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot size={20} className="text-[#4F8CFF]" />
            AI Intelligent Synthesizer
          </h1>
          <p className="text-[11px] text-[#A0A6B1]">Instruct your local space agent to trigger actions and index logs</p>
        </div>
        <span className="text-[10px] font-mono bg-[#4F8CFF]/10 text-[#4F8CFF] px-2 py-0.5 rounded border border-[#4F8CFF]/20">
          Gemini 2.5 Flash Online
        </span>
      </div>

      {/* Message Log */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] custom-scrollbar">
        {aiMessages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
          >
            <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-bold text-[10px] ${
              msg.role === "user" ? "bg-indigo-600 text-white" : "bg-[#4F8CFF] text-white"
            }`}>
              {msg.role === "user" ? "SH" : "AI"}
            </div>
            <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
              msg.role === "user" ? "bg-[#4F8CFF] text-white" : "bg-[#14171C] text-white/90 border border-white/[0.04]"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isAiTyping && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-7 h-7 rounded-lg bg-[#4F8CFF] text-white shrink-0 flex items-center justify-center font-bold text-[10px]">
              AI
            </div>
            <div className="p-3 bg-[#14171C] text-[#A0A6B1] border border-white/[0.04] rounded-2xl text-[11px] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A0A6B1] animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#A0A6B1] animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#A0A6B1] animate-bounce" style={{ animationDelay: "300ms" }} />
              <span>Indexing workspaces filesystem...</span>
            </div>
          </div>
        )}
      </div>

      {/* Console Input Bar */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          askAiSimulation();
        }}
        className="flex items-center gap-3 p-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl shrink-0"
      >
        <input
          id="ai-console-input"
          type="text"
          placeholder="Type your instruction or try: 'index my recent workspaces'..."
          value={aiInput}
          onChange={(e) => setAiInput(e.target.value)}
          className="flex-1 bg-transparent px-3 text-xs outline-none text-white placeholder-white/30"
        />
        <button 
          type="submit"
          className="p-2 rounded-xl bg-[#4F8CFF] hover:bg-blue-600 text-white cursor-pointer transition-transform shrink-0"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
