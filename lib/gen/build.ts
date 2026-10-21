/* Dựng đề theo ma trận và luyện theo dạng từ các dạng bài tự sinh.
   File này nặng (≈ 420 dạng) nên phía giao diện chỉ tải bằng import() khi cần. */
import type { Question } from "../types.ts";
import { generate, type Exam, type Kind, type Subject, type Template } from "./core.ts";
import { TEMPLATES } from "./index.ts";

export { TEMPLATES };
export const TBYID: Record<string, Template> = Object.fromEntries(TEMPLATES.map((t) => [t.id, t]));

/** Cấu trúc đề kiểm tra định kì hiện hành */
export const STRUCT: Record<Subject, { mcq: number; tf: number; short: number; min: number }> = {
  "Toán": { mcq: 12, tf: 4, short: 6, min: 90 },
  "Vật lí": { mcq: 18, tf: 4, short: 6, min: 50 },
  "Hóa học": { mcq: 18, tf: 4, short: 6, min: 50 },
};
export const GEN_SUBJECTS = Object.keys(STRUCT) as Subject[];

/** Câu hỏi của app từ một dạng + seed. id = g:<dạng>:<seed> nên tái tạo được bất cứ lúc nào. */
export function toQuestion(t: Template, seed: number): Question {
  const { out, seed: sd } = generate(t, seed);
  const q: Question = { id: `g:${t.id}:${sd}`, s: t.subject, t: t.topic, l: t.level, q: out.stem, o: [], a: -1, e: out.explanation, remote: true, gen: true };
  if (t.kind === "mcq") { q.o = out.options!; q.a = out.answer!; }
  else if (t.kind === "tf") { q.qt = "tf"; q.st = out.statements; }
  else { q.qt = "short"; q.sa = out.answer_text; }
  return q;
}
export function genById(id: string): Question | null {
  const m = /^g:(.+):(\d+)$/.exec(id); if (!m) return null;
  const t = TBYID[m[1]]; if (!t) return null;
  try { return toQuestion(t, +m[2]); } catch { return null; }
}

let seedBase = (Date.now() % 1_000_000) * 7 + 1;
const newSeed = () => (seedBase = (seedBase * 48271 + 11) % 2147483647);
const rnd = (n: number) => Math.floor(Math.random() * n);
const shuffle = <T,>(a: T[]) => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/** Chọn n dạng: trải đều chương, mức độ gần 40/30/30, hạn chế lặp dạng */
function pickTemplates(pool: Template[], n: number): Template[] {
  if (!pool.length || n <= 0) return [];
  const want: Record<number, number> = { 1: Math.round(n * 0.4), 2: Math.round(n * 0.3) }; want[3] = n - want[1] - want[2];
  const out: Template[] = [];
  const chapters = [...new Set(pool.map((t) => t.chapter))];
  const byChap = new Map(chapters.map((c) => [c, shuffle(pool.filter((t) => t.chapter === c))]));
  let ci = rnd(chapters.length), guard = 0;
  while (out.length < n && guard++ < n * 40) {
    const c = chapters[ci++ % chapters.length]; const list = byChap.get(c)!;
    // ưu tiên mức độ còn thiếu, dạng chưa dùng
    const lvNeed = [1, 2, 3].filter((l) => out.filter((x) => x.level === l).length < want[l]);
    const cand = list.find((t) => !out.includes(t) && lvNeed.includes(t.level)) || list.find((t) => !out.includes(t));
    if (cand) out.push(cand);
    else if (guard > n * 20) out.push(list[rnd(list.length)]); // hết dạng mới: cho lặp với bộ số khác
  }
  return out;
}

/** Đề thi thử theo ma trận: gk1 = nửa đầu HK1; ck1 = cả HK1, ~60% nửa sau */
export function buildExam(subject: Subject, grade: number, exam: Exam): { questions: Question[]; minutes: number; title: string } {
  const S = STRUCT[subject];
  const all = TEMPLATES.filter((t) => t.subject === subject && t.grade === grade && (exam === "ck1" || t.half === 1));
  const qs: Question[] = [];
  for (const kind of ["mcq", "tf", "short"] as Kind[]) {
    const n = S[kind]; const pool = all.filter((t) => t.kind === kind);
    let picks: Template[];
    if (exam === "ck1") {
      const n2 = Math.round(n * 0.6);
      picks = [...pickTemplates(pool.filter((t) => t.half === 1), n - n2), ...pickTemplates(pool.filter((t) => t.half === 2), n2)];
      if (picks.length < n) picks.push(...pickTemplates(pool, n - picks.length));
    } else picks = pickTemplates(pool, n);
    // thứ tự như đề thật: theo chương rồi mức độ tăng dần
    const order = [...new Set(all.map((t) => t.chapter))];
    picks.sort((a, b) => order.indexOf(a.chapter) - order.indexOf(b.chapter) || a.level - b.level);
    for (const t of picks) { try { qs.push(toQuestion(t, newSeed())); } catch { /* bỏ dạng lỗi */ } }
  }
  const en = exam === "gk1" ? "giữa học kì 1" : "cuối học kì 1";
  return { questions: qs, minutes: S.min, title: `Đề tự sinh ${en} – ${subject} ${grade}` };
}

/** Luyện một dạng: n biến thể khác nhau */
export function practiceSet(templateId: string, n = 5): Question[] {
  const t = TBYID[templateId]; if (!t) return [];
  const out: Question[] = []; const seen = new Set<string>();
  for (let k = 0; k < n * 4 && out.length < n; k++) { try { const q = toQuestion(t, newSeed()); if (!seen.has(q.q)) { seen.add(q.q); out.push(q); } } catch { /* */ } }
  return out;
}

/** Danh mục dạng theo chương (cho mục "Luyện theo dạng") */
export function catalog(subject: string, grade: number) {
  const list = TEMPLATES.filter((t) => t.subject === subject && t.grade === grade);
  const chapters = [...new Set(list.map((t) => t.chapter))];
  return chapters.map((c) => ({ chapter: c, half: list.find((t) => t.chapter === c)!.half, items: list.filter((t) => t.chapter === c).map((t) => ({ id: t.id, topic: t.topic, level: t.level, kind: t.kind })) }));
}
export function countFor(subject: string, grade: number) { return TEMPLATES.filter((t) => t.subject === subject && t.grade === grade).length; }
