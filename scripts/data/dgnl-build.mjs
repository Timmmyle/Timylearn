#!/usr/bin/env node
/**
 * Đề luyện thi đánh giá năng lực (V-ACT, HSA, TSA, SPT) → file tĩnh trong public/de-dgnl
 *   node scripts/data/dgnl-build.mjs        (đọc data/dgnl/src/<kỳ thi>/<de1|de2|luyen>-<phần>.json)
 * - Đề thi thử: ghép các phần theo thứ tự trong data/dgnl/exams.json (SPT: mỗi môn một đề).
 * - Luyện từng phần: gộp mọi câu của phần đó (đề 1, đề 2, bộ luyện); app bốc ngẫu nhiên mỗi lượt.
 */
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve("data/dgnl/src"), OUT = path.resolve("public/de-dgnl");
const EX = JSON.parse(fs.readFileSync("data/dgnl/exams.json", "utf8"));
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) fs.unlinkSync(path.join(OUT, f));

const load = (exam, set, part) => {
  const f = path.join(SRC, exam, `${set}-${part}.json`);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null;
};
function toQs(d, id, sec, subject) {
  return d.questions.map((q, i) => {
    const o = { id: `${id}-${String(i + 1).padStart(2, "0")}`, s: subject, t: q.topic || sec || subject, l: q.level || 2, q: q.stem, o: [], a: -1, e: q.explanation || "", setId: id, remote: true };
    if (sec) o.sec = sec;
    if (q.passage && d.passages?.[q.passage]) o.ctx = d.passages[q.passage];
    if (q.qtype === "tf") { o.qt = "tf"; o.st = q.statements.map((x) => ({ t: String(x.t).replace(/^[a-d]\)\s*/, ""), a: !!x.a })); }
    else if (q.qtype === "short") { o.qt = "short"; o.sa = String(q.answer_text); }
    else { o.o = q.options.map(String); o.a = q.answer; }
    return o;
  });
}
const index = []; let nq = 0;
const write = (id, data) => fs.writeFileSync(path.join(OUT, id + ".json"), JSON.stringify(data));

for (const [exam, E] of Object.entries(EX)) {
  const short = E.name.split(" ")[0];
  if (E.perSubject) {
    for (const p of E.parts) {
      for (const set of ["de1", "de2", "de3"]) {
        const d = load(exam, set, p.id); if (!d) continue;
        const id = `${exam}-${set}-${p.id}`, qs = toQs(d, id, null, p.name);
        write(id, { id, questions: qs }); nq += qs.length;
        index.push({ id, exam, kind: "mock", title: `${short} ${p.name} – đề số ${set.slice(2)}`, count: qs.length, minutes: p.minutes, part: p.id });
      }
      const pool = ["de1", "de2", "de3", "luyen"].flatMap((set) => { const d = load(exam, set, p.id); return d ? toQs(d, `${exam}-${set}-${p.id}`, null, p.name) : []; });
      if (pool.length) { const id = `${exam}-luyen-${p.id}`; write(id, { id, questions: pool }); index.push({ id, exam, kind: "part", title: `${short} – luyện ${p.name}`, count: pool.length, part: p.id }); }
    }
    continue;
  }
  for (const set of ["de1", "de2", "de3"]) {
    const parts = E.parts.map((p) => [p, load(exam, set, p.id)]);
    if (parts.some(([, d]) => !d)) continue;
    const id = `${exam}-${set}`;
    const qs = parts.flatMap(([p, d]) => toQs(d, `${id}-${p.id}`, p.name, `${short}: ${p.name}`));
    write(id, { id, questions: qs }); nq += qs.length;
    index.push({ id, exam, kind: "mock", title: `Đề thi thử ${short} số ${set.slice(2)}`, count: qs.length, minutes: E.minutes, scale: E.scale, parts: E.parts.map((p) => `${p.name} (${p.n})`).join(" · ") });
  }
  for (const p of E.parts) {
    const pool = ["de1", "de2", "de3", "luyen"].flatMap((set) => { const d = load(exam, set, p.id); return d ? toQs(d, `${exam}-${set}-${p.id}`, p.name, `${short}: ${p.name}`) : []; });
    if (!pool.length) continue;
    const id = `${exam}-luyen-${p.id}`; write(id, { id, questions: pool });
    index.push({ id, exam, kind: "part", title: `Luyện phần ${p.name}`, count: pool.length, part: p.id, minutes: p.minutes, n: p.n });
  }
}
write("index", index);
console.log(`✓ ${index.filter((x) => x.kind === "mock").length} đề thi thử (${nq} câu), ${index.filter((x) => x.kind === "part").length} bộ luyện từng phần → public/de-dgnl`);
