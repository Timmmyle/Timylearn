/* Chấm điểm theo cấu trúc đề tốt nghiệp THPT từ 2025 (GDPT 2018):
   - Phần I  trắc nghiệm 4 lựa chọn: 0,25 điểm/câu
   - Phần II Đúng/Sai (4 ý): đúng 1 ý 0,1 · 2 ý 0,25 · 3 ý 0,5 · 4 ý 1 điểm
   - Phần III trả lời ngắn: Toán 0,5 điểm/câu, các môn khác 0,25 điểm/câu */
import type { Pick, PlayQ, Question, QType } from "./types";

export const qtype = (q: Question): QType => q.qt || "mcq";
export const PART: Record<QType, string> = { mcq: "Phần I. Trắc nghiệm nhiều lựa chọn", tf: "Phần II. Trắc nghiệm Đúng/Sai", short: "Phần III. Trả lời ngắn" };

const norm = (s: string) => s.trim().replace(/\s+/g, "").replace(/,/g, ".").replace(/^\+/, "");
export function shortOk(q: Question, v: Pick) {
  if (typeof v !== "string" || !v.trim() || !q.sa) return false;
  const a = norm(q.sa), b = norm(v);
  if (a === b) return true;
  const x = Number(a), y = Number(b);
  return !isNaN(x) && !isNaN(y) && Math.abs(x - y) < 1e-9;
}
export function tfCount(q: Question, v: Pick) {
  if (!Array.isArray(v) || !q.st) return 0;
  return q.st.filter((s, i) => v[i] === s.a).length;
}
export function isCorrect(q: PlayQ, v: Pick) {
  const t = qtype(q);
  if (t === "tf") return !!q.st && tfCount(q, v) === q.st.length;
  if (t === "short") return shortOk(q, v);
  return v === q.ans;
}
export function answered(q: Question, v: Pick) {
  const t = qtype(q);
  if (t === "tf") return Array.isArray(v) && !!q.st && q.st.every((_, i) => v[i] === true || v[i] === false);
  if (t === "short") return typeof v === "string" && v.trim() !== "";
  return v !== null && v !== undefined;
}
/** Đã làm một phần (dùng tô màu ô số câu) */
export const touched = (v: Pick) => (Array.isArray(v) ? v.some((x) => x !== null && x !== undefined) : typeof v === "string" ? v.trim() !== "" : v !== null && v !== undefined);

const TF_PTS = [0, 0.1, 0.25, 0.5, 1];
export function points(q: PlayQ, v: Pick): { got: number; max: number } {
  const t = qtype(q);
  if (t === "tf") {
    const n = q.st?.length || 4, k = tfCount(q, v);
    return { got: n === 4 ? TF_PTS[k] : k / n, max: 1 };
  }
  if (t === "short") { const per = q.s === "Toán" ? 0.5 : 0.25; return { got: shortOk(q, v) ? per : 0, max: per }; }
  return { got: v === q.ans ? 0.25 : 0, max: 0.25 };
}
/** Điểm thang 10 của cả bài */
export function examScore(items: PlayQ[], picks: Pick[]) {
  let got = 0, max = 0;
  items.forEach((q, i) => { const p = points(q, picks[i]); got += p.got; max += p.max; });
  return max ? (got / max) * 10 : 0;
}
export function answerText(q: PlayQ) {
  const t = qtype(q);
  if (t === "tf") return (q.st || []).map((s, i) => "abcd"[i] + ") " + (s.a ? "Đúng" : "Sai")).join(", ");
  if (t === "short") return q.sa || "";
  return "ABCD"[q.ans] || "";
}
export function pickText(q: PlayQ, v: Pick) {
  const t = qtype(q);
  if (t === "tf") return Array.isArray(v) ? v.map((x, i) => "abcd"[i] + ") " + (x === true ? "Đúng" : x === false ? "Sai" : "bỏ trống")).join(", ") : "bỏ trống";
  if (t === "short") return typeof v === "string" && v.trim() ? v.trim() : "bỏ trống";
  return typeof v === "number" ? "ABCD"[v] : "bỏ trống";
}
