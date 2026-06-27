export function highlightCode(code) {
  if (!code) return [{ type: "plain", text: "" }];

  const lines = code.split("\n");
  const tokens = [];

  for (let li = 0; li < lines.length; li++) {
    if (li > 0) tokens.push({ type: "plain", text: "\n" });
    tokens.push(...highlightLine(lines[li]));
  }

  return tokens.length ? tokens : [{ type: "plain", text: code }];
}

function highlightLine(line) {
  const patterns = [
    { type: "comment", regex: /^(\/\/.*|#.*)$/ },
    { type: "string", regex: /("(?:[^"\\]|\\.)*"|'(?:[^"\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/ },
    { type: "keyword", regex: /\b(const|let|var|function|return|import|export|from|default|if|else|for|while|class|interface|type|extends|async|await|new|this|true|false|null|undefined|def|print)\b/ },
    { type: "tag", regex: /(<\/?[A-Za-z][\w.-]*)/ },
    { type: "number", regex: /\b(\d+\.?\d*)\b/ },
    { type: "function", regex: /\b([a-zA-Z_$][\w$]*)(?=\s*\()/ },
  ];

  let remaining = line;
  const result = [];

  while (remaining.length > 0) {
    let earliest = null;

    for (const p of patterns) {
      const m = remaining.match(p.regex);
      if (m && m.index !== undefined) {
        if (!earliest || m.index < earliest.index) {
          earliest = { index: m.index, length: m[0].length, type: p.type, text: m[0] };
        }
      }
    }

    if (!earliest) {
      result.push({ type: "plain", text: remaining });
      break;
    }

    if (earliest.index > 0) {
      result.push({ type: "plain", text: remaining.slice(0, earliest.index) });
    }
    result.push({ type: earliest.type, text: earliest.text });
    remaining = remaining.slice(earliest.index + earliest.length);
  }

  return result.length ? result : [{ type: "plain", text: line }];
}

export const TOKEN_STYLES = {
  plain: "text-[#E2E8F0]",
  keyword: "text-[#C792EA]",
  string: "text-[#C3E88D]",
  comment: "text-[#546E7A] italic",
  number: "text-[#F78C6C]",
  function: "text-[#82AAFF]",
  tag: "text-[#F07178]",
};
