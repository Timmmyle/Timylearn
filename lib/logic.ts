/* Logic thuần (không phụ thuộc giao diện) — chuyển từ on-thi.html. Hàm nào nhận `S` đều có thể chạy trong immer draft. */
import { BANK, BYID, EXB, EXLIST, LEN, SUBJECTS, TOPICS, TOP, WKEY, WRITE } from "./data/curriculum";
import type { AppState, Profile, Question, PlayQ, Topic, CT } from "./types";
import { toast } from "./toast";
import { REMOTE_Q, useRemote } from "./remote";
import { applyFix, FIX } from "./fixes";

export const STORAGE_KEY = "onthi-state-v1";
export const DEFP = (): Profile => ({ grade: "", exams: [], examOther: "", subjects: [], subjectOther: "", target: 8, minutes: 30, examName: "", nameAuto: true, examDate: "", days: [1, 3, 5], time: "20:00" });
export const DEF = (): AppState => ({
  v: 2, onboarded: false, profile: DEFP(), theme: { mode: "auto", accent: "tim" }, xp: 0,
  streak: { count: 0, last: null, freezes: 0, best: 0 }, stats: {}, mistakes: {}, graduated: 0, aiQ: {}, aiSets: [], aiWrite: [],
  fight: { rating: 1000, w: 0, l: 0, d: 0 }, missions: { day: null, c: {}, claimed: {} }, updatedAt: 0,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrate(o: any): AppState {
  const s = Object.assign(DEF(), o);
  if (!o.v || o.v < 2) { s.v = 2; s.profile = DEFP(); s.onboarded = false; s.aiSets = []; }
  s.profile = Object.assign(DEFP(), s.profile);
  return s;
}

/* ---------- Helpers ---------- */
export const dstr = (d: Date) => { const z = (n: number) => String(n).padStart(2, "0"); return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate()); };
export const today = () => dstr(new Date());
export const addDays = (s: string, n: number) => { const d = new Date(s + "T00:00:00"); d.setDate(d.getDate() + n); return dstr(d); };
export const diffDays = (a: string, b: string) => Math.round((+new Date(b + "T00:00:00") - +new Date(a + "T00:00:00")) / 864e5);
export const shuffle = <T,>(a: T[]): T[] => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const pct = (c: number, t: number) => (t ? Math.round((c / t) * 100) : 0);
export const lc = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
export const comma = (x: number | string) => String(x).replace(".", ",");
export const fmtNum = (x: number) => {
  if (!isFinite(x)) return "—"; const a = Math.abs(x);
  if (a !== 0 && (a < 1e-3 || a >= 1e7)) return x.toExponential(4).replace(".", ",");
  return (+x.toPrecision(7)).toLocaleString("vi-VN", { maximumFractionDigits: 6 });
};
export const getQ = (S: AppState, id: string): Question | undefined => { const q = BYID[id] || S.aiQ[id] || REMOTE_Q[id]; return q && FIX[id] ? applyFix(q) : q; };
/* Cấp độ (cũng là cấp nhân vật): từ cấp L lên L+1 cần 100 + 100·L XP — khớp hàm hero_level trong 0005_game.sql */
export const xpForLevel = (n: number) => 50 * n * (n - 1) + 100 * (n - 1);
export function levelInfo(xp: number) {
  let lv = 1;
  while (lv < 200 && xp >= xpForLevel(lv + 1)) lv++;
  const base = xpForLevel(lv), next = xpForLevel(lv + 1);
  return { lv, into: xp - base, need: next - base, next };
}
export const level = (S: AppState) => levelInfo(S.xp).lv;

/* ---------- Lộ trình ---------- */
export const gradeNum = (S: AppState) => (S.profile.grade === "free" ? 12 : +S.profile.grade || 12);
export const gradeLabel = (S: AppState) => (S.profile.grade === "free" ? "thí sinh tự do" : "lớp " + gradeNum(S));
export function examLabel(S: AppState, id: string, g?: number) {
  const e = EXB[id]; if (!e) return "";
  if (id === "other") return S.profile.examOther.trim() || "Kỳ thi khác";
  return e.school ? `${e.n} lớp ${g || gradeNum(S)}` : e.n;
}
export const bankSubs = (S: AppState) => S.profile.subjects.filter((s) => SUBJECTS.includes(s));
export function scopeFor(S: AppState, id: string): Topic[] {
  const g = gradeNum(S), e = EXB[id]; if (!e) return [];
  if (e.school) return TOPICS.filter((t) => (t.g === g && t.hk === e.hk && (e.full || t.p === 1)) || t.g === 0).sort((a, b) => a.p - b.p || SUBJECTS.indexOf(a.s) - SUBJECTS.indexOf(b.s));
  if (id === "thpt") return [12, 11, 10, 0].filter((x) => x <= g).flatMap((x) => TOPICS.filter((t) => t.g === x));
  if (id === "other") return TOPICS.filter((t) => t.g === g || t.g === 0);
  return [0, 10, 11, 12].filter((x) => x <= g).flatMap((x) => TOPICS.filter((t) => t.g === x));
}
export type RouteTopic = Topic & { ex: string };
export function roadmap(S: AppState): RouteTopic[] {
  const subs = bankSubs(S), seen = new Set<string>(), out: RouteTopic[] = [];
  for (const e of EXLIST) {
    if (!S.profile.exams.includes(e.id)) continue;
    for (const t of scopeFor(S, e.id)) if (subs.includes(t.s) && !seen.has(t.k)) { seen.add(t.k); out.push({ ...t, ex: e.id }); }
  }
  return out;
}
export function topicStat(S: AppState, k: string) {
  const a = agg(S, 0).byTopic[k] || { c: 0, t: 0 };
  const st = a.t >= 5 && a.c / a.t >= 0.8 ? "done" : a.t > 0 ? "doing" : "new";
  return { ...a, st, acc: a.t ? a.c / a.t : -1 };
}
export const qOfTopics = (keys: string[]) => BANK.filter((q) => keys.includes(q.s + "|" + q.t)).map((q) => q.id);
export const nextStep = (S: AppState) => roadmap(S).find((t) => topicStat(S, t.k).st !== "done") || null;
export function routeTitle(S: AppState) { const ex = S.profile.exams.map((id) => examLabel(S, id)); return ex.length ? ex.join(", ") : "Chưa chọn kỳ thi"; }
export function syncExamName(S: AppState) { const p = S.profile; if (p.nameAuto) p.examName = p.exams.length ? examLabel(S, p.exams[0]) : ""; }

/* ---------- Tiến độ, gamification ---------- */
export const MISSIONS = [
  { id: "practice", n: 1, t: "Hoàn thành 1 ải luyện tập" },
  { id: "fight", n: 1, t: "Quyết đấu 1 trận" },
  { id: "review", n: 3, t: "Diệt đúng 3 quái trong sổ lỗi sai" },
  { id: "answers", n: 20, t: "Công phá 20 câu bất kỳ" },
];
export function ensureMissions(S: AppState) { if (S.missions.day !== today()) S.missions = { day: today(), c: {}, claimed: {} }; }
export function bump(S: AppState, id: string, n = 1) {
  ensureMissions(S); S.missions.c[id] = (S.missions.c[id] || 0) + n;
  const m = MISSIONS.find((x) => x.id === id);
  if (m && S.missions.c[id] >= m.n && !S.missions.claimed[id]) { S.missions.claimed[id] = true; S.xp += 20; toast("Xong nhiệm vụ: " + m.t + " (+20 XP, +20 xu)"); }
}
export function touchStreak(S: AppState) {
  const t = today(), st = S.streak; if (st.last === t) return;
  const gap = st.last ? diffDays(st.last, t) : 99;
  if (gap === 1) st.count++;
  else if (gap === 2 && st.freezes > 0) { st.freezes--; st.count++; toast("Đã dùng 1 thẻ giữ chuỗi cho hôm qua"); }
  else st.count = 1;
  st.last = t; st.best = Math.max(st.best, st.count);
  if (st.count % 7 === 0 && st.freezes < 2) { st.freezes++; toast("Chuỗi " + st.count + " ngày! Nhận thêm 1 thẻ giữ chuỗi"); }
}
export function streakAlive(S: AppState) { const st = S.streak; if (!st.last) return 0; const g = diffDays(st.last, today()); return g <= 1 || (g === 2 && st.freezes > 0) ? st.count : 0; }
export function record(S: AppState, q: Question, ok: boolean, kind: string) {
  const d = today(), k = q.s + "|" + q.t;
  S.stats[d] = S.stats[d] || {}; const r = (S.stats[d][k] = S.stats[d][k] || { c: 0, t: 0 }); r.t++;
  if (ok) { r.c++; S.xp += 10; }
  bump(S, "answers");
  const m = S.mistakes[q.id];
  if (kind === "review" && m) {
    if (ok) { m.box++; if (m.box >= 3) { delete S.mistakes[q.id]; S.graduated++; } else m.due = addDays(d, m.box === 1 ? 1 : 3); bump(S, "review"); }
    else { m.box = 0; m.due = addDays(d, 1); m.wrong = (m.wrong || 0) + 1; }
  } else if (!ok) S.mistakes[q.id] = { box: 0, due: d, wrong: ((m && m.wrong) || 0) + 1, added: d };
}
export type Agg = { c: number; t: number; byTopic: Record<string, CT>; bySub: Record<string, CT>; byDay: Record<string, CT> };
export function agg(S: AppState, days: number): Agg {
  const res: Agg = { c: 0, t: 0, byTopic: {}, bySub: {}, byDay: {} };
  const from = days ? addDays(today(), -(days - 1)) : "0000";
  for (const [d, o] of Object.entries(S.stats)) {
    if (d < from) continue;
    for (const [k, v] of Object.entries(o)) {
      res.c += v.c; res.t += v.t;
      const bt = (res.byTopic[k] = res.byTopic[k] || { c: 0, t: 0 }); bt.c += v.c; bt.t += v.t;
      const s = k.split("|")[0]; const bs = (res.bySub[s] = res.bySub[s] || { c: 0, t: 0 }); bs.c += v.c; bs.t += v.t;
      const bd = (res.byDay[d] = res.byDay[d] || { c: 0, t: 0 }); bd.c += v.c; bd.t += v.t;
    }
  }
  return res;
}
export const dueMistakes = (S: AppState) => Object.entries(S.mistakes).filter(([id, m]) => m.due <= today() && getQ(S, id)).map(([id]) => id);
export function learnSubjects(S: AppState) {
  const b = bankSubs(S);
  const base = b.length ? [...b, ...SUBJECTS.filter((s) => !b.includes(s))] : SUBJECTS.slice();
  // Môn chỉ có trong kho đề thật (Lịch sử, Địa lí, GDCD…): môn bạn đã chọn lên trước
  const extra = Object.keys(useRemote.getState().counts).filter((s) => !base.includes(s));
  const picked = (s: string) => S.profile.subjects.includes(s) || (s === "GDCD" && S.profile.subjects.includes("GD Kinh tế và Pháp luật"));
  return [...base.filter((s) => b.includes(s)), ...extra.filter(picked), ...base.filter((s) => !b.includes(s)), ...extra.filter((s) => !picked(s))];
}
export function scopeTopics(S: AppState, sub: string, scope: string): Topic[] {
  if (scope === "route") return roadmap(S).filter((t) => t.s === sub);
  if (scope === "grade") return TOPICS.filter((t) => t.s === sub && (t.g === gradeNum(S) || t.g === 0));
  return TOPICS.filter((t) => t.s === sub);
}
export function weakestIn(S: AppState, topics: Topic[]) {
  const list = topics.map((t) => ({ ...t, ...topicStat(S, t.k) }));
  list.sort((a, b) => (a.acc === b.acc ? a.t - b.t : a.acc - b.acc));
  return list;
}
export function planText(S: AppState, all: RouteTopic[]) {
  const r = all.filter((t) => t.ex === (all[0] && all[0].ex)); const nm = r.length ? " của kỳ " + lc(examLabel(S, r[0].ex)) : "";
  const left = r.filter((t) => topicStat(S, t.k).st !== "done").length; const p = S.profile;
  if (!left) return `Bạn đã vững các chủ đề${nm}. Làm đề thi thử và đấu để giữ phong độ.`;
  if (!p.examDate) return `Còn ${left} chủ đề${nm} chưa vững. Đặt ngày thi trong Cài đặt để app chia lịch học.`;
  const d = diffDays(today(), p.examDate);
  if (d <= 0) return `Còn ${left} chủ đề${nm} chưa vững. Ưu tiên ôn lỗi sai và các chủ đề có tỉ lệ đúng thấp.`;
  const studyDays = Math.max(1, Math.round((d * (p.days.length || 5)) / 7) - 1);
  return studyDays >= left
    ? `Còn ${d} ngày, ${left} chủ đề${nm} chưa vững: mỗi chủ đề khoảng ${Math.floor(studyDays / left)} buổi học, dành buổi cuối để làm đề thi thử.`
    : `Còn ${d} ngày nhưng có ${left} chủ đề${nm} chưa vững: mỗi buổi nên học khoảng ${Math.ceil(left / studyDays)} chủ đề. Tăng thời gian học nếu có thể.`;
}

/* ---------- Phiên làm bài ---------- */
export function prep(q: Question): PlayQ {
  if (q.qt && q.qt !== "mcq") return { ...q, opts: q.o || [], ans: -1 };
  const idx = shuffle(q.o.map((_, i) => i)); return { ...q, opts: idx.map((i) => q.o[i]), ans: idx.indexOf(q.a) };
}
export function pickPool(S: AppState, ids: string[], lvl: number) {
  return shuffle(ids.slice()).sort((a, b) => Math.abs(getQ(S, a)!.l - lvl) - Math.abs(getQ(S, b)!.l - lvl)).slice(0, LEN[lvl]);
}
export function fightPool(S: AppState, fightSub: string) {
  if (fightSub === "Lộ trình") {
    const r = roadmap(S);
    let ids = qOfTopics(r.filter((t) => t.ex === (r[0] && r[0].ex)).map((t) => t.k));
    if (ids.length < 5) ids = qOfTopics(r.map((t) => t.k));
    if (ids.length < 5) ids = BANK.filter((q) => TOP[q.s + "|" + q.t].g <= gradeNum(S) && (bankSubs(S).length ? bankSubs(S) : SUBJECTS).includes(q.s)).map((q) => q.id);
    return ids;
  }
  return BANK.filter((q) => q.s === fightSub && TOP[q.s + "|" + q.t].g <= gradeNum(S)).map((q) => q.id);
}
export function diagIds(S: AppState) {
  const all = roadmap(S); let r = all.filter((t) => t.ex === (all[0] && all[0].ex));
  if (qOfTopics(r.map((t) => t.k)).length < 4) r = all;
  const bySub: Record<string, { t: Topic; qs: string[] }[]> = {};
  r.forEach((t) => { (bySub[t.s] = bySub[t.s] || []).push({ t, qs: shuffle(qOfTopics([t.k])) }); });
  const ids: string[] = []; const subs = Object.keys(bySub); let round = 0;
  while (ids.length < 8 && round < 12) {
    for (const s of subs) { const L = bySub[s]; if (!L.length) continue; const it = L[round % L.length]; const q = it.qs[Math.floor(round / L.length)]; if (q && !ids.includes(q) && ids.length < 8) ids.push(q); }
    round++;
  }
  return ids;
}
export function writeList(S: AppState) { const r = useRemote.getState(); return [...r.localPassages, ...WRITE, ...r.passages, ...(S.aiWrite || [])]; }
export { WKEY };

/* ---------- Hóa học ---------- */
import { MASS } from "./data/curriculum";
export function molarMass(f: string) {
  f = f.replace(/[₀-₉]/g, (c) => "0123456789"["₀₁₂₃₄₅₆₇₈₉".indexOf(c)]).replace(/\s/g, ""); let i = 0;
  const num = () => { let n = ""; while (i < f.length && /\d/.test(f[i])) n += f[i++]; return n ? +n : 1; };
  const group = (): number => {
    let tot = 0;
    while (i < f.length) {
      const c = f[i];
      if (c === "(") { i++; const g = group(); if (f[i] !== ")") throw "("; i++; tot += g * num(); }
      else if (c === ")") return tot;
      else if (/[A-Z]/.test(c)) { let s = c; i++; if (i < f.length && /[a-z]/.test(f[i])) s += f[i++]; if (!(s in MASS)) throw s; tot += MASS[s] * num(); }
      else throw c;
    }
    return tot;
  };
  const r = group(); if (i !== f.length || !r) throw ")"; return r;
}

/* ---------- Lịch .ics ---------- */
export function makeIcs(S: AppState): string | null {
  const p = S.profile, z = (n: number | string) => String(n).padStart(2, "0"), now = new Date();
  const stamp = now.getUTCFullYear() + z(now.getUTCMonth() + 1) + z(now.getUTCDate()) + "T" + z(now.getUTCHours()) + z(now.getUTCMinutes()) + "00Z";
  if (!p.examDate && !p.days.length) return null;
  const L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//OnThi//VI", "CALSCALE:GREGORIAN"];
  if (p.examDate) {
    const d = p.examDate.replace(/-/g, ""), nd = addDays(p.examDate, 1).replace(/-/g, "");
    L.push("BEGIN:VEVENT", "UID:exam-" + d + "@onthi", "DTSTAMP:" + stamp, "DTSTART;VALUE=DATE:" + d, "DTEND;VALUE=DATE:" + nd, "SUMMARY:" + (p.examName || routeTitle(S)).replace(/[,;]/g, " "), "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", "DESCRIPTION:Ngày mai thi. Ngủ sớm và chuẩn bị giấy tờ!", "END:VALARM", "END:VEVENT");
  }
  if (p.days.length) {
    const BY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"]; const d = new Date();
    while (!p.days.includes(d.getDay())) d.setDate(d.getDate() + 1);
    const [hh, mm] = (p.time || "20:00").split(":"); const ds = dstr(d).replace(/-/g, "") + "T" + z(hh) + z(mm) + "00";
    L.push("BEGIN:VEVENT", "UID:study-" + Date.now() + "@onthi", "DTSTAMP:" + stamp, "DTSTART:" + ds, "DURATION:PT" + p.minutes + "M",
      "RRULE:FREQ=WEEKLY;BYDAY=" + p.days.map((x) => BY[x]).join(",") + (p.examDate ? ";UNTIL=" + p.examDate.replace(/-/g, "") + "T235959" : ""),
      "SUMMARY:Ôn thi " + p.minutes + " phút", "BEGIN:VALARM", "TRIGGER:-PT10M", "ACTION:DISPLAY", "DESCRIPTION:Sắp đến giờ ôn thi", "END:VALARM", "END:VEVENT");
  }
  L.push("END:VCALENDAR");
  return L.join("\r\n");
}

/** Mùa thi ở trường theo tháng (giữa/cuối học kì) */
export function examSeason(d = new Date()): { exam: "gk1" | "ck1" | "gk2" | "ck2"; label: string } | null {
  const m = d.getMonth() + 1, day = d.getDate();
  if (m === 9 || m === 10 || (m === 11 && day < 15)) return { exam: "gk1", label: "giữa học kì 1" };
  if (m === 11 || m === 12 || m === 1) return { exam: "ck1", label: "cuối học kì 1" };
  if (m === 2 || m === 3) return { exam: "gk2", label: "giữa học kì 2" };
  if (m === 4 || m === 5) return { exam: "ck2", label: "cuối học kì 2" };
  return null;
}
