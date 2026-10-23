#!/usr/bin/env node
/* Kiểm tra file đề luyện ĐGNL: data/dgnl/src/<kỳ thi>/<de1|de2|luyen>-<phần>.json
   node scripts/data/dgnl-check.mjs [file…]   (không truyền → kiểm tra tất cả) */
import fs from "node:fs";
import path from "node:path";
import katex from "katex";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const EX = JSON.parse(fs.readFileSync(path.join(ROOT, "data/dgnl/exams.json"), "utf8"));
const RE = /(\$\$[^$]+\$\$|\$[^$\n]+\$)/g;
function texErrors(s) {
  const errs = []; const parts = String(s).replace(/\\\$/g, "").split(RE);
  if (parts.filter((_, i) => i % 2 === 0).join("").includes("$")) errs.push("dấu $ lẻ");
  parts.forEach((p, i) => { if (i % 2) { try { katex.renderToString(p.replace(/^\$\$?|\$\$?$/g, ""), { throwOnError: true, strict: "ignore" }); } catch (e) { errs.push("KaTeX: " + e.message.slice(0, 90)); } } });
  return errs;
}
const SRC = path.join(ROOT, "data/dgnl/src");
const files = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(SRC).flatMap((d) => fs.readdirSync(path.join(SRC, d)).filter((f) => f.endsWith(".json")).map((f) => path.join(SRC, d, f)));
let bad = 0;
for (const f of files) {
  const errs = [], warn = [];
  let d; try { d = JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { console.log(`✗ ${f}: JSON lỗi ${e.message}`); bad++; continue; }
  const exam = path.basename(path.dirname(f)), m = /^(de\d|luyen)-([a-z]+)$/.exec(path.basename(f, ".json"));
  const E = EX[exam]; const P = E && m && E.parts.find((p) => p.id === m[2]);
  if (!E) errs.push("thư mục kỳ thi lạ: " + exam);
  if (!m) errs.push("tên file phải dạng de1-<phần>.json / de2-… / luyen-…");
  else if (!P) errs.push("phần lạ: " + m[2]);
  if (d.exam !== exam || (m && (d.part !== m[2] || d.set !== m[1]))) errs.push("exam/part/set không khớp tên file");
  const qs = d.questions || [], pas = d.passages || {};
  if (P && m && m[1] !== "luyen" && qs.length !== P.n) errs.push(`đề thi thử cần ${P.n} câu, đang có ${qs.length}`);
  if (m && m[1] === "luyen" && (qs.length < 12 || qs.length > 30)) errs.push(`bộ luyện nên 15–20 câu, đang có ${qs.length}`);
  if (P && P.mix && m && m[1] !== "luyen") { const c = ["mcq", "tf", "short"].map((k) => qs.filter((q) => (q.qtype || "mcq") === k).length); if (c.join() !== P.mix.join()) errs.push(`cấu trúc mcq/tf/short = ${c.join("/")}, cần ${P.mix.join("/")}`); }
  for (const [k, v] of Object.entries(pas)) { if (String(v).length < 80) errs.push(`đoạn ${k} quá ngắn`); for (const e of texErrors(v)) errs.push(`đoạn ${k}: ${e}`); }
  const used = new Set(); const pos = [0, 0, 0, 0]; const seen = new Set();
  qs.forEach((q, i) => {
    const at = `câu ${i + 1}`, k = q.qtype || "mcq";
    if (q.passage) { if (!pas[q.passage]) errs.push(at + `: passage "${q.passage}" không có`); used.add(q.passage); }
    if (!q.stem) errs.push(at + ": thiếu stem");
    const key = (q.passage || "") + q.stem + JSON.stringify(q.options || q.statements || ""); if (seen.has(key)) errs.push(at + ": trùng câu"); seen.add(key);
    if (![1, 2, 3].includes(q.level)) errs.push(at + ": level 1|2|3");
    if (!q.topic) errs.push(at + ": thiếu topic");
    if (!q.explanation || q.explanation.length < 10) errs.push(at + ": thiếu lời giải");
    for (const x of [q.stem, q.explanation, ...(q.options || []), ...(q.statements || []).map((s) => s.t)]) { for (const e of texErrors(x || "")) errs.push(at + ": " + e); if (/undefined|\[object/.test(String(x))) errs.push(at + ": chữ undefined"); }
    if (k === "mcq") {
      if (!Array.isArray(q.options) || q.options.length !== 4 || new Set(q.options.map((x) => String(x).trim())).size !== 4) errs.push(at + ": cần 4 phương án khác nhau");
      if (!(q.answer >= 0 && q.answer <= 3)) errs.push(at + ": answer 0–3"); else pos[q.answer]++;
    } else if (k === "tf") {
      if (!Array.isArray(q.statements) || q.statements.length !== 4) errs.push(at + ": tf cần 4 ý");
      else if (!q.statements.some((x) => x.a === true) || !q.statements.some((x) => x.a === false)) errs.push(at + ": tf cần cả Đúng và Sai");
    } else if (k === "short") {
      if (!/^-?\d+(,\d+)?$/.test(String(q.answer_text || "")) || String(q.answer_text).length > 6) errs.push(at + `: short "${q.answer_text}" phải là số ≤ 6 ký tự, dấu phẩy`);
    } else errs.push(at + ": qtype lạ " + k);
  });
  for (const k of Object.keys(pas)) if (!used.has(k)) warn.push(`đoạn ${k} không câu nào dùng`);
  const n = pos.reduce((a, b) => a + b, 0); if (n >= 12 && Math.max(...pos) > n * 0.4) warn.push("đáp án dồn một vị trí: " + pos.join("/"));
  if (errs.length) { bad++; console.log(`✗ ${f}`); for (const e of [...new Set(errs)].slice(0, 30)) console.log("    " + e); }
  else console.log(`✓ ${f} (${qs.length} câu)${warn.length ? "  lưu ý: " + warn.join("; ") : ""}`);
}
process.exit(bad ? 1 : 0);
