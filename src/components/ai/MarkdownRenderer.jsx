import { useState } from "react";
import { Copy, Check, Code2 } from "lucide-react";
import { motion } from "motion/react";
import { parseMarkdownBlocks, inlineMarkdown } from "../../utils/aiHelpers";
import { highlightCode, TOKEN_STYLES } from "../../utils/syntaxHighlight";

function CodeBlock({ lang, content }) {
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

export default function MarkdownRenderer({ content, isStreaming = false }) {
  const blocks = parseMarkdownBlocks(content ?? "");

  return (
    <div className="prose-ai space-y-2.5 text-[13px] leading-[1.7] text-white/90">
      {blocks.map((block, i) => {
        if (block.type === "code") {
          return <CodeBlock key={i} lang={block.lang} content={block.content} />;
        }
        if (block.type === "table") {
          const [header, , ...rows] = block.rows;
          const headers = header.split("|").filter(Boolean).map((c) => c.trim());
          return (
            <div key={i} className="my-3 overflow-x-auto rounded-xl border border-white/[0.08] bg-white/[0.02]">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-white/[0.05]">
                    {headers.map((h, j) => (
                      <th key={j} className="px-3.5 py-2.5 text-left font-semibold text-white border-b border-white/[0.08]">
                        <span dangerouslySetInnerHTML={{ __html: inlineMarkdown(h) }} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, ri) => {
                    const cells = row.split("|").filter(Boolean).map((c) => c.trim());
                    return (
                      <tr key={ri} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                        {cells.map((cell, ci) => (
                          <td key={ci} className="px-3.5 py-2.5 text-[#A0A6B1]" dangerouslySetInnerHTML={{ __html: inlineMarkdown(cell) }} />
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        }
        if (block.type === "h1") return <h1 key={i} className="text-lg font-black text-white mt-3 mb-1 tracking-tight">{block.content}</h1>;
        if (block.type === "h2") return <h2 key={i} className="text-base font-bold text-white mt-3 mb-1">{block.content}</h2>;
        if (block.type === "h3") return <h3 key={i} className="text-sm font-bold text-white mt-2 mb-0.5">{block.content}</h3>;
        if (block.type === "quote") return (
          <blockquote
            key={i}
            className="my-2 pl-3.5 border-l-2 border-[#4F8CFF]/60 bg-[#4F8CFF]/5 py-2 pr-3 rounded-r-lg text-[#A0A6B1] italic"
            dangerouslySetInnerHTML={{ __html: inlineMarkdown(block.content) }}
          />
        );
        if (block.type === "hr") return <hr key={i} className="my-4 border-white/[0.08]" />;
        if (block.type === "ul") return (
          <ul key={i} className="my-1.5 space-y-1 pl-1">
            {block.items.map((item, j) => (
              <li key={j} className="flex gap-2 text-[#C8CDD6]">
                <span className="text-[#4F8CFF] shrink-0 mt-1.5 w-1 h-1 rounded-full bg-[#4F8CFF]" />
                <span dangerouslySetInnerHTML={{ __html: inlineMarkdown(item) }} />
              </li>
            ))}
          </ul>
        );
        if (block.type === "ol") return (
          <ol key={i} className="my-1.5 space-y-1 list-decimal list-inside text-[#C8CDD6] marker:text-[#4F8CFF] marker:font-semibold">
            {block.items.map((item, j) => (
              <li key={j} dangerouslySetInnerHTML={{ __html: inlineMarkdown(item) }} />
            ))}
          </ol>
        );
        return (
          <p key={i} className="text-white/85" dangerouslySetInnerHTML={{ __html: inlineMarkdown(block.content) }} />
        );
      })}

      {isStreaming && (
        <motion.span
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block w-[2px] h-[1em] bg-[#4F8CFF] ml-0.5 align-text-bottom rounded-full shadow-[0_0_8px_rgba(79,140,255,0.6)]"
        />
      )}
    </div>
  );
}
