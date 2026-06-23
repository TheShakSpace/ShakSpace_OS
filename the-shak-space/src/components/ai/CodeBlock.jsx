import { useState } from "react";
import { Copy, Check, Code2 } from "lucide-react";
import { highlightCode, TOKEN_STYLES } from "../../utils/syntaxHighlight";

export default function CodeBlock({ lang, content }) {
  const [copied, setCopied] = useState(false);
  const tokens = highlightCode(content, lang);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/[0.10] bg-[#0A0D12]/90 shadow-inner shadow-black/30">
      <div className="flex items-center justify-between px-3.5 py-2 bg-white/[0.04] border-b border-white/[0.08] backdrop-blur-sm">
        <span className="flex items-center gap-2 text-[10px] font-mono text-[#A0A6B1]">
          <Code2 size={12} className="text-[#4F8CFF]" />
          {lang || "text"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
            copied
              ? "text-emerald-400 bg-emerald-500/10"
              : "text-[#A0A6B1] hover:text-white hover:bg-white/[0.08]"
          }`}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "Copied!" : "Copy code"}
        </button>
      </div>
      <pre className="p-4 text-[12px] font-mono leading-[1.65] overflow-x-auto">
        <code>
          {tokens.map((token, i) => (
            <span key={i} className={TOKEN_STYLES[token.type] ?? TOKEN_STYLES.plain}>
              {token.text}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
