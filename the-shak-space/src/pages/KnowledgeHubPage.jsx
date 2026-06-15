import React from "react";
import { Plus, FileText } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function KnowledgeHubPage() {
  const { notes, handleAddNewNote } = useApp();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h1 className="text-2xl font-black text-white">Knowledge Hub</h1>
          <p className="text-xs text-[#A0A6B1] mt-1">
            Store notes, reference metadata, specifications, and internal assets safely in optimized storage.
          </p>
        </div>
        <button 
          onClick={handleAddNewNote}
          className="px-4 py-2 bg-[#4F8CFF] hover:bg-blue-600 font-bold text-xs text-white rounded-xl flex items-center gap-2 cursor-pointer transition-transform duration-150"
        >
          <Plus size={14} /> New Document
        </button>
      </div>

      <div className="space-y-4">
        {notes.map((note) => (
          <div 
            key={note.id}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">{note.title}</h3>
                <p className="text-[10px] text-[#A0A6B1] mt-0.5">Updated on {note.date} • Shared publicly</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-[#A0A6B1] bg-white/[0.04] px-2 py-1 rounded-md border border-white/[0.06] font-mono">
                {note.duration}
              </span>
              <button 
                onClick={() => alert(`Reviewing document: ${note.title}`)}
                className="p-1 px-[10px] rounded hover:bg-white/5 text-[11px] text-[#4F8CFF] font-semibold border border-transparent hover:border-white/[0.06] cursor-pointer"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
