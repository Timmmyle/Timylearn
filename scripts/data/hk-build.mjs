#!/usr/bin/env node
/**
 * Đề ôn giữa kì / cuối kì (soạn theo SGK GDPT 2018) → file tĩnh trong public/de-hk
 *   node scripts/data/hk-build.mjs            (đọc data/hk1/src/*.json và data/hk2/src/*.json)
 * App tải public/de-hk/index.json, mở đề nào thì tải file đề đó. Không cần Supabase.
 */
import fs from "node:fs";
import path from "node:path";

const SRCS = (process.argv[2] ? [process.argv[2]] : ["data/hk1/src", "data/hk2/src"]).map((d) => path.resolve(d)).filter((d) => fs.existsSync(d));
const OUT = path.resolve("public/de-hk");
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) fs.unlinkSync(path.join(OUT, f));

const EXN = { gk1: "giữa học kì 1", ck1: "cuối học kì 1", gk2: "giữa học kì 2", ck2: "cuối học kì 2" };
const index = [];
let nq = 0;
const ALL = SRCS.flatMap((dir) => fs.readdirSync(dir).filter((x) => x.endsWith(".json")).sort().map((f) => [dir, f]));
for (const [SRC, f] of ALL) {
  const d = JSON.parse(fs.readFileSync(path.join(SRC, f), "utf8"));
  const id = "hk-" + f.replace(/\.json$/, "");
  const base = { id, grade: d.grade, subject: d.subject || "Ngữ văn", exam: d.exam, duration_min: d.duration_min || 90,
    title: d.title || `Đề ôn ${EXN[d.exam]} – ${d.subject} ${d.grade}`, scope: d.scope || d.genre || "" };
  if (Array.isArray(d.essays) || d.passage) {
    // Ngữ văn: đọc hiểu + viết, luyện trong mục "Luyện trình bày"
    const w = d.work || {};
    const P = {
      id, title: base.title, passage: d.passage, src: d.src || `${w.author || ""}, ${w.title || ""}`,
      qs: [...d.questions, ...(d.essays || [])].map((q) => ({ q: String(q.q).replace(/^Câu\s*\d+\s*[.:]?\s*/, "").replace(/^(\([^)]*điểm\))\s*[.:]\s*/, "$1 "), type: q.type || "noidung", points: q.points || [], model: q.model || "" })),
    };
    index.push({ ...base, kind: "write", count: P.qs.length, work: [w.author, w.title].filter(Boolean).join(" – ") });
    fs.writeFileSync(path.join(OUT, id + ".json"), JSON.stringify({ ...base, passage: P }));
    continue;
  }
  const qs = d.questions.map((q, i) => {
    const o = { id: `${id}-${String(i + 1).padStart(2, "0")}`, s: d.subject, t: q.topic || "Đề ôn", l: q.level || 2, q: q.stem, o: [], a: -1, e: q.explanation || "", setId: id, remote: true };
    if (q.tk) o.tk = q.tk;
    if (q.qtype === "tf") { o.qt = "tf"; o.st = q.statements.map((x) => ({ t: String(x.t).replace(/^[a-d]\)\s*/, ""), a: !!x.a })); }
    else if (q.qtype === "short") { o.qt = "short"; o.sa = String(q.answer_text); }
    else { if (q.options.length !== 4 || !(q.answer >= 0 && q.answer <= 3)) throw new Error(`${f} câu ${i + 1}: mcq sai định dạng`); o.o = q.options.map(String); o.a = q.answer; }
    return o;
  });
  nq += qs.length;
  const parts = { mcq: 0, tf: 0, short: 0 }; d.questions.forEach((q) => parts[q.qtype || "mcq"]++);
  index.push({ ...base, kind: "quiz", count: qs.length, parts });
  fs.writeFileSync(path.join(OUT, id + ".json"), JSON.stringify({ ...base, questions: qs }));
}
fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify(index));
console.log(`✓ ${index.length} đề (${nq} câu trắc nghiệm, ${index.filter((x) => x.kind === "write").length} đề Ngữ văn) → public/de-hk`);
