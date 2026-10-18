"use client";
import katex from "katex";
import { memo } from "react";

/* Hiển thị văn bản có công thức LaTeX: $...$ (trong dòng) và $$...$$ (dòng riêng).
   Phần chữ thường được render như text (an toàn); chỉ đoạn công thức đi qua KaTeX. */
const cache = new Map<string, string>();
function tex(src: string, display: boolean) {
  const key = (display ? "D" : "I") + src;
  let html = cache.get(key);
  if (html === undefined) {
    html = katex.renderToString(src, { throwOnError: false, strict: "ignore", displayMode: display, output: "html", trust: false });
    if (cache.size > 2000) cache.clear();
    cache.set(key, html);
  }
  return html;
}

const ESC = "\uE000";
const RE = /(\$\$[^$]+\$\$|\$[^$\n]+\$)/g;

function MathTextImpl({ text, className }: { text: string; className?: string }) {
  // \$ = dấu đô-la thường (vd "\$50"), không phải công thức
  const s = String(text ?? "").replace(/\\\$/g, ESC);
  if (!s.includes("$")) { const t = s.replaceAll(ESC, "$"); return className ? <span className={className}>{t}</span> : <>{t}</>; }
  const parts = s.split(RE);
  return (
    <span className={className}>
      {parts.map((p, i) => {
        if (i % 2 === 0) return p.replaceAll(ESC, "$");
        const display = p.startsWith("$$");
        // \frac trong dòng in rất nhỏ → dùng \dfrac để phân số dễ đọc như sách giáo khoa
        const src = (display ? p.slice(2, -2) : p.slice(1, -1)).replaceAll(ESC, "\\$").replace(/\\frac(?![a-zA-Z])/g, "\\dfrac");
        return <span key={i} className={display ? "math-display" : "math-inline"} dangerouslySetInnerHTML={{ __html: tex(src, display) }} />;
      })}
    </span>
  );
}
export const MathText = memo(MathTextImpl);

/** Cắt ngắn văn bản mà không cắt đôi một công thức $...$ */
export function clipMath(s: string, n: number) {
  if (s.length <= n) return s;
  let cut = n, inside = false;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "$") inside = !inside;
    if (i >= n && !inside) { cut = i + (s[i] === "$" ? 1 : 0); break; }
    cut = i + 1;
  }
  return cut < s.length ? s.slice(0, cut) + "…" : s;
}
