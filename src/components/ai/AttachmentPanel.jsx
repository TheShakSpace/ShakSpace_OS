import { FileText, Image, FileCode, X } from "lucide-react";

const KIND_ICONS = {
  image: Image,
  pdf: FileText,
  markdown: FileText,
  text: FileText,
  code: FileCode,
};

export default function AttachmentPanel({ attachments, onRemove }) {
  if (!attachments?.length) return null;

  return (
    <div className="flex flex-wrap gap-2 px-1">
      {attachments.map((a) => {
        const Icon = KIND_ICONS[a.kind] ?? FileText;
        return (
          <div
            key={a.id}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] text-[#A0A6B1]"
          >
            <Icon size={12} className="text-[#4F8CFF] shrink-0" />
            <span className="truncate max-w-[120px] font-mono">{a.name}</span>
            <button
              type="button"
              onClick={() => onRemove(a.id)}
              className="p-0.5 rounded hover:text-white hover:bg-white/[0.08] cursor-pointer shrink-0"
              aria-label={`Remove ${a.name}`}
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
