/* Kiểm tra các dạng bài tự sinh.
   node --experimental-strip-types scripts/gen-check.ts lib/gen/toan10.ts [số seed, mặc định 300]
   (không truyền file → kiểm tra toàn bộ lib/gen/index.ts) */
import katex from "katex";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { generate, type Template } from "../lib/gen/core.ts";

const file = process.argv[2] || "lib/gen/index.ts";
const N = +(process.argv[3] || 300);
const mod = await import(pathToFileURL(path.resolve(file)).href);
const list: Template[] = mod.TEMPLATES || mod.default;
if (!Array.isArray(list)) { console.error("File phải export const TEMPLATES: Template[]"); process.exit(1); }

const RE = /(\$\$[^$]+\$\$|\$[^$\n]+\$)/g;
function texErrors(s: string): string[] {
  const errs: string[] = []; const parts = s.replace(/\\\$/g, "").split(RE);
  if (parts.filter((_, i) => i % 2 === 0).join("").includes("$")) errs.push("dấu $ lẻ");
  parts.forEach((p, i) => { if (i % 2) { try { katex.renderToString(p.replace(/^\$\$?|\$\$?$/g, "").replace(/\\frac(?![a-zA-Z])/g, "\\dfrac"), { throwOnError: true, strict: "ignore" }); } catch (e) { errs.push("KaTeX: " + (e as Error).message.slice(0, 90)); } } });
  return errs;
}
const ids = new Set<string>(); let bad = 0; const kinds: Record<string, number> = {};
for (const t of list) {
  const probs = new Map<string, number>(); const add = (m: string) => probs.set(m, (probs.get(m) || 0) + 1);
  if (ids.has(t.id)) add("id trùng"); ids.add(t.id);
  if (!t.chapter || !t.topic || ![1, 2].includes(t.half) || ![1, 2, 3].includes(t.level) || !["mcq", "tf", "short"].includes(t.kind)) add("thiếu/ sai metadata");
  kinds[t.kind] = (kinds[t.kind] || 0) + 1;
  const stems = new Set<string>(); const pos = [0, 0, 0, 0]; let example = "";
  for (let s = 1; s <= N; s++) {
    let o;
    try { o = generate(t, s * 2654435761).out; } catch (e) { add("không sinh được: " + (e as Error).message.slice(0, 80)); continue; }
    stems.add(o.stem); if (!example) example = o.stem.slice(0, 110);
    const texts = [o.stem, o.explanation, ...(o.options || []), ...(o.statements || []).map((x) => x.t), o.answer_text || ""];
    for (const x of texts) { if (/undefined|NaN|Infinity|\[object|null/.test(x)) add("có chữ undefined/NaN"); for (const e of texErrors(x)) add(e); if (/\d\.\d/.test(x.replace(/\$[^$]*\$/g, ""))) add("dấu chấm thập phân ngoài công thức"); }
    if (!o.explanation || o.explanation.length < 10) add("thiếu lời giải");
    if (t.kind === "mcq") {
      if (!o.options || o.options.length !== 4 || new Set(o.options.map((x) => x.replace(/\s+/g, ""))).size !== 4) add("mcq: cần 4 phương án khác nhau");
      if (!(o.answer! >= 0 && o.answer! <= 3)) add("mcq: answer sai"); else pos[o.answer!]++;
    } else if (t.kind === "tf") {
      if (!o.statements || o.statements.length !== 4) add("tf: cần 4 ý");
      else if (!o.statements.some((x) => x.a) || !o.statements.some((x) => !x.a)) add("tf: cần cả Đúng và Sai");
    } else if (!/^-?\d+(,\d+)?$/.test(o.answer_text || "") || (o.answer_text || "").length > 4) add(`short: đáp án "${o.answer_text}" không hợp lệ`);
  }
  const minVar = Math.min(10, Math.ceil(N / 30));
  if (stems.size < minVar) add(`ít biến thể (${stems.size} đề khác nhau / ${N})`);
  if (t.kind === "mcq" && Math.min(...pos) === 0) add("đáp án đúng luôn nằm ở một số vị trí");
  if (probs.size) { bad++; console.log(`✗ ${t.id}`); for (const [m, c] of probs) console.log(`    ${m} ×${c}`); }
  else console.log(`✓ ${t.id.padEnd(34)} ${t.kind.padEnd(5)} L${t.level} ${stems.size} biến thể · ${example}`);
}
console.log(`\n${list.length} dạng (${Object.entries(kinds).map(([k, v]) => k + " " + v).join(", ")}), lỗi ở ${bad} dạng.`);
process.exit(bad ? 1 : 0);
