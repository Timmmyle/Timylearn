#!/usr/bin/env node
/* Kiểm tra file đề ôn (data/hk1/src, data/hk2/src).
   node scripts/data/hk-check.mjs data/hk2/src/10-toan-gk2.json [file khác…]
   Không truyền file → kiểm tra tất cả. Thoát mã 1 nếu có lỗi. */
import fs from "node:fs";
import path from "node:path";
import katex from "katex";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const old = fs.readFileSync(path.join(ROOT, "data/hk/old-topics.txt"), "utf8").trim().split("\n").map((l) => { const m = /^"([^"]+)","([^"]+)",(\d+),(\d),(\d)/.exec(l); return [m[1], m[2], +m[3], +m[4], +m[5]]; });
const neu = JSON.parse(fs.readFileSync(path.join(ROOT, "data/hk/new-topics.json"), "utf8"));
const TOPICS = new Map([...old, ...neu].map(([s, t, g, hk, p]) => [s + "|" + t, { s, t, g, hk, p }]));

const STRUCT = { "Toán": [12, 4, 6], "Vật lí": [18, 4, 6], "Hóa học": [18, 4, 6], "Sinh học": [18, 4, 6], "Tin học": [24, 4, 0], "Công nghệ": [24, 4, 0], "GD Kinh tế và Pháp luật": [24, 4, 0], "Tiếng Anh": [40, 0, 0] };
const RE = /(\$\$[^$]+\$\$|\$[^$\n]+\$)/g;
function texErrors(s) {
  const errs = []; const parts = String(s).replace(/\\\$/g, "").split(RE);
  if (parts.filter((_, i) => i % 2 === 0).join("").includes("$")) errs.push("dấu $ lẻ");
  parts.forEach((p, i) => { if (i % 2) { try { katex.renderToString(p.replace(/^\$\$?|\$\$?$/g, ""), { throwOnError: true, strict: "ignore" }); } catch (e) { errs.push("KaTeX: " + e.message.slice(0, 90)); } } });
  return errs;
}

const files = process.argv.slice(2).length ? process.argv.slice(2) : ["data/hk1/src", "data/hk2/src"].flatMap((d) => fs.existsSync(d) ? fs.readdirSync(d).filter((f) => f.endsWith(".json")).map((f) => path.join(d, f)) : []);
let bad = 0;
for (const f of files) {
  const errs = []; const warn = [];
  let d; try { d = JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { console.log(`✗ ${f}: JSON lỗi ${e.message}`); bad++; continue; }
  const name = path.basename(f, ".json"); const m = /^(1[0-2])-([a-z]+)-(gk|ck)([12])$/.exec(name);
  if (!m) errs.push("tên file phải dạng <lớp>-<môn>-<gk|ck><1|2>.json");
  else { if (d.grade !== +m[1]) errs.push("grade không khớp tên file"); if (d.exam !== m[3] + m[4]) errs.push("exam không khớp tên file"); }
  const hk = m ? +m[4] : 1, full = m && m[3] === "ck";
  for (const k of ["grade", "subject", "exam", "duration_min", "title"]) if (d[k] == null) errs.push("thiếu " + k);
  if (d.subject === "Ngữ văn") {
    if (!d.passage || d.passage.length < 200) errs.push("passage quá ngắn");
    if (!d.work || !d.work.author || !d.work.title) errs.push("thiếu work.author/title");
    if (!Array.isArray(d.questions) || d.questions.length < 4) errs.push("cần ≥ 4 câu đọc hiểu");
    if (!Array.isArray(d.essays) || d.essays.length !== 2) errs.push("cần 2 câu viết (essays)");
    for (const q of [...(d.questions || []), ...(d.essays || [])]) { if (!q.q || !Array.isArray(q.points) || !q.points.length || !q.model) errs.push("câu thiếu q/points/model: " + String(q.q).slice(0, 40)); }
  } else {
    const st = STRUCT[d.subject]; if (!st) errs.push("môn lạ: " + d.subject);
    const qs = d.questions || []; const c = { mcq: 0, tf: 0, short: 0 }; const pos = [0, 0, 0, 0]; const stems = new Set();
    qs.forEach((q, i) => {
      const at = `câu ${i + 1}`; const kind = q.qtype || "mcq"; c[kind] = (c[kind] || 0) + 1;
      if (!q.stem) errs.push(at + ": thiếu stem"); const key = q.stem + JSON.stringify(q.options || q.statements || ""); if (stems.has(key)) errs.push(at + ": trùng câu"); stems.add(key);
      if (![1, 2, 3].includes(q.level)) errs.push(at + ": level 1|2|3");
      if (!q.explanation || q.explanation.length < 15) errs.push(at + ": thiếu lời giải");
      if (d.subject !== "Tiếng Anh") {
        const tp = TOPICS.get(q.tk);
        if (!tp) errs.push(at + `: tk "${q.tk}" không có trong danh sách chủ đề`);
        else if (tp.s !== d.subject || tp.g !== d.grade || tp.hk !== hk) errs.push(at + `: tk "${q.tk}" không thuộc ${d.subject} lớp ${d.grade} HK${hk}`);
        else if (!full && tp.p !== 1) errs.push(at + `: đề giữa kì chỉ dùng chủ đề nửa đầu (p=1), "${q.tk}" là nửa sau`);
      } else if (q.tk && !TOPICS.has(q.tk)) errs.push(at + `: tk "${q.tk}" không có trong danh sách`);
      const texts = [q.stem, q.explanation, ...(q.options || []), ...(q.statements || []).map((x) => x.t), q.answer_text || ""];
      for (const x of texts) { for (const e of texErrors(x)) errs.push(at + ": " + e); if (/undefined|NaN|\[object/.test(String(x))) errs.push(at + ": chữ undefined/NaN"); }
      if (kind === "mcq") {
        if (!Array.isArray(q.options) || q.options.length !== 4 || new Set(q.options.map((x) => String(x).trim())).size !== 4) errs.push(at + ": cần 4 phương án khác nhau");
        if (!(q.answer >= 0 && q.answer <= 3)) errs.push(at + ": answer 0–3"); else pos[q.answer]++;
      } else if (kind === "tf") {
        if (!Array.isArray(q.statements) || q.statements.length !== 4) errs.push(at + ": tf cần 4 ý");
        else if (!q.statements.some((x) => x.a === true) || !q.statements.some((x) => x.a === false)) errs.push(at + ": tf cần cả Đúng và Sai");
      } else if (kind === "short") {
        if (!/^-?\d+(,\d+)?$/.test(String(q.answer_text || "")) || String(q.answer_text).length > 4) errs.push(at + `: short "${q.answer_text}" phải là số ≤ 4 ký tự, dấu phẩy`);
      } else errs.push(at + ": qtype lạ " + kind);
    });
    if (st) { const want = { mcq: st[0], tf: st[1], short: st[2] }; for (const k of ["mcq", "tf", "short"]) if (c[k] !== want[k]) errs.push(`số câu ${k} = ${c[k]}, cần ${want[k]}`); }
    const n = pos.reduce((a, b) => a + b, 0); if (n >= 12 && Math.max(...pos) > n * 0.4) warn.push("đáp án đúng dồn vào một vị trí: " + pos.join("/"));
    const lv = [1, 2, 3].map((l) => qs.filter((q) => q.level === l).length); if (qs.length && lv[0] < qs.length * 0.25) warn.push("ít câu nhận biết: " + lv.join("/"));
  }
  if (errs.length) { bad++; console.log(`✗ ${f}`); for (const e of [...new Set(errs)].slice(0, 30)) console.log("    " + e); }
  else console.log(`✓ ${f}${warn.length ? "  (lưu ý: " + warn.join("; ") + ")" : ""}`);
}
process.exit(bad ? 1 : 0);
