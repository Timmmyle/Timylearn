"use client";
import Link from "next/link";
import { useState } from "react";
import { loadSet, useRemote, type RemoteSet } from "@/lib/remote";
import { useApp, startSession } from "@/lib/store";
import { toast } from "@/lib/toast";
import { BANK, EXB, EXLIST, LV, SCI, SUBJECT_OPTS, TOP, TOPICS } from "@/lib/data/curriculum";
import { examLabel, getQ, gradeNum, lc, qOfTopics, today } from "@/lib/logic";
import { aiErrorText, aiJson } from "@/lib/api";
import { startHK, useHK, type HKSet } from "@/lib/hk";
import { MathText } from "@/components/MathText";
import { examSeason } from "@/lib/logic";
import { startWrite } from "../WritePanel";
import GenPanel from "../GenPanel";
import DgnlPanel from "../DgnlPanel";
import type { AiSet, AppState, Question, WritePassage } from "@/lib/types";

type ExamSet = { id: string; exam: string; grade: number | string; subject: string; title: string; qids: string[]; ai?: boolean };

export function examSets(S: AppState): ExamSet[] {
  const sets: ExamSet[] = [];
  for (const g of [10, 11, 12]) for (const e of EXLIST.filter((x) => x.school)) for (const s of SCI) {
    const tk = TOPICS.filter((t) => t.s === s && t.g === g && t.hk === e.hk && (e.full || t.p === 1)).map((t) => t.k); const qids = qOfTopics(tk);
    if (qids.length >= 3) sets.push({ id: `b-${e.id}-${g}-${s}`, exam: e.id, grade: g, subject: s, title: `Đề ${lc(e.n)} môn ${s} lớp ${g}`, qids });
  }
  const vt = (s: string, t?: string[]) => qOfTopics(TOPICS.filter((x) => x.s === s && (!t || t.includes(x.t))).map((x) => x.k));
  sets.push({ id: "b-van-tv", exam: "*", grade: "*", subject: "Ngữ văn", title: "Đề luyện thực hành tiếng Việt", qids: vt("Ngữ văn", ["Biện pháp tu từ", "Từ Hán Việt", "Lỗi dùng từ, lỗi câu", "Thành phần biệt lập, liên kết câu"]) });
  sets.push({ id: "b-van-dh", exam: "*", grade: "*", subject: "Ngữ văn", title: "Đề trắc nghiệm đọc hiểu Ngữ văn", qids: vt("Ngữ văn", ["Phương thức biểu đạt và thể loại", "Biện pháp tu từ"]) });
  sets.push({ id: "b-anh-np", exam: "*", grade: "*", subject: "Tiếng Anh", title: "Đề ngữ pháp Tiếng Anh", qids: vt("Tiếng Anh", ["Thì của động từ", "Câu bị động", "So sánh", "Câu điều kiện", "Mệnh đề quan hệ", "Câu tường thuật"]) });
  sets.push({ id: "b-anh-all", exam: "*", grade: "*", subject: "Tiếng Anh", title: "Đề tổng hợp Tiếng Anh", qids: vt("Tiếng Anh") });
  for (const s of SCI) {
    sets.push({ id: "b-thpt12-" + s, exam: "thpt", grade: 12, subject: s, title: `Đề ôn tốt nghiệp THPT môn ${s} (kiến thức lớp 12)`, qids: BANK.filter((q) => q.s === s && TOP[q.s + "|" + q.t].g === 12).map((q) => q.id) });
    sets.push({ id: "b-thptall-" + s, exam: "thpt", grade: 12, subject: s, title: `Đề tổng ôn ${s} lớp 10–12`, qids: BANK.filter((q) => q.s === s).map((q) => q.id).slice(-20) });
  }
  return sets;
}

function aiSubjectsFor(S: AppState, exId: string) {
  const e = EXB[exId]; if (e && e.subs) return e.subs;
  const mine = [...S.profile.subjects, ...(S.profile.subjectOther.trim() ? [S.profile.subjectOther.trim()] : [])];
  return [...new Set([...mine, ...SUBJECT_OPTS])];
}
type AiUI = { exam: string; subject: string; grade: number; level: number; n: number };
function aiTopics(a: AiUI) { const e = EXB[a.exam]; if (!e.school) return []; return TOPICS.filter((t) => t.s === a.subject && t.g === a.grade && t.hk === e.hk && (e.full || t.p === 1)).map((t) => t.t); }
function aiScopeShort(S: AppState, a: AiUI) {
  const e = EXB[a.exam], g = gradeNum(S);
  if (e.school) { const tp = aiTopics(a); return `${e.n} lớp ${a.grade}${tp.length ? ": " + tp.join(", ") : ", kiến thức " + a.subject + " đã học đến " + (e.full ? "cuối" : "giữa") + " học kì " + e.hk}`; }
  if (a.exam === "thpt") return g < 12 ? `Đề kiểu tốt nghiệp THPT, chỉ dùng kiến thức lớp 10${g > 10 ? "–" + g : ""}` : "Đề kiểu tốt nghiệp THPT, chủ yếu kiến thức lớp 12";
  if (a.exam === "other") return `${examLabel(S, "other")}, kiến thức lớp ${a.grade}`;
  return e.n + (g < 12 ? `, chỉ dùng kiến thức đến lớp ${g}` : "");
}
/** Mô tả phạm vi gửi cho server để soạn prompt */
function aiScope(S: AppState, a: AiUI) {
  const e = EXB[a.exam], g = gradeNum(S);
  if (e.school) { const tp = aiTopics(a); return `bài kiểm tra ${lc(e.n)} lớp ${a.grade}, môn ${a.subject}, chương trình GDPT 2018. ` + (tp.length ? `Chỉ ra câu hỏi trong các chủ đề: ${tp.join(", ")}.` : `Chỉ dùng kiến thức môn ${a.subject} lớp ${a.grade} đã học đến ${e.full ? "cuối" : "giữa"} học kì ${e.hk}.`) + ` Tuyệt đối không dùng kiến thức của học kì sau hoặc lớp trên.`; }
  if (a.exam === "thpt") return `kỳ thi tốt nghiệp THPT môn ${a.subject}, chương trình GDPT 2018. ` + (g < 12 ? `Học sinh đang học lớp ${g} nên chỉ dùng kiến thức lớp 10${g > 10 ? " và 11" : ""}.` : "Chủ yếu kiến thức lớp 12, có một phần lớp 10, 11.");
  if (a.exam === "other") return `kỳ thi “${S.profile.examOther.trim()}”, môn/phần ${a.subject}, dành cho học sinh lớp ${a.grade}. Chỉ dùng kiến thức đến lớp ${a.grade}.`;
  return `${e.desc}, phần “${a.subject}”.` + (g < 12 ? ` Học sinh đang học lớp ${g}, chỉ dùng kiến thức đến lớp ${g}.` : "");
}

/** Lưu đề AI vào máy, đánh dấu "mới" và mở bài làm ngay */
function saveAndOpen(set: AiSet, newQ: Record<string, Question>, minutes?: number) {
  const { update, setUI } = useApp.getState();
  update((S) => {
    Object.assign(S.aiQ, newQ); S.aiSets.unshift(set);
    while (S.aiSets.length > 12) { const old = S.aiSets.pop()!; old.qids.forEach((id) => { if (!S.mistakes[id]) delete S.aiQ[id]; }); }
  });
  setUI((u) => { u.ai.newId = set.id; });
  toast("Đã tạo đề " + set.qids.length + " câu, vào làm ngay");
  startSession("exam", set.qids, set.title, { keepOrder: true, durationMin: +minutes! > 0 ? Math.min(180, +minutes!) : Math.max(10, Math.ceil(set.qids.length * 1.8)) });
}

type RawQ = { type?: string; topic?: string; level?: number; q?: string; o?: unknown[]; a?: number; st?: { t?: unknown; a?: unknown }[]; sa?: unknown; e?: unknown };
/** Kiểm tra và chuyển câu AI trả về thành câu hỏi của app (bỏ câu sai định dạng) */
function toQuestion(x: RawQ, id: string, subject: string, lvDefault: number): Question | null {
  if (!x || typeof x.q !== "string" || !x.q.trim()) return null;
  const l = [1, 2, 3].includes(Number(x.level)) ? Number(x.level) : lvDefault;
  const base = { id, s: subject, t: String(x.topic || "Tổng hợp").slice(0, 60), l, q: x.q, e: String(x.e || ""), ai: true } as const;
  const type = x.type || (Array.isArray(x.st) ? "tf" : x.sa != null && !Array.isArray(x.o) ? "short" : "mcq");
  if (type === "tf") {
    if (!Array.isArray(x.st) || x.st.length !== 4) return null;
    const st = x.st.map((y) => ({ t: String(y?.t ?? ""), a: y?.a === true || y?.a === "true" || y?.a === "Đúng" }));
    if (st.some((y) => !y.t)) return null;
    return { ...base, o: [], a: -1, qt: "tf", st };
  }
  if (type === "short") {
    const sa = String(x.sa ?? "").trim().replace(".", ",");
    if (!/^-?\d+(,\d+)?$/.test(sa)) return null;
    return { ...base, o: [], a: -1, qt: "short", sa };
  }
  if (!Array.isArray(x.o) || x.o.length !== 4 || !Number.isInteger(x.a) || x.a! < 0 || x.a! > 3) return null;
  return { ...base, o: x.o.map(String), a: x.a! };
}

/** Đề theo tài liệu người dùng tải lên (ma trận, đặc tả, dàn ý, dạng câu, đề mẫu).
   Quy trình như giáo viên ra đề: B1 lập phiếu đặc tả → B2 soạn đề đúng phiếu → B3 (Văn) phản biện, sửa chỗ lệch → vào làm ngay. */
export type DocFile = { name: string; type: string; data: string; size: number };
type Spec = {
  subject?: string; grade?: number; exam_label?: string; minutes?: number; kind: "van" | "quiz"; summary?: string;
  van?: { genre?: string; genre_label?: string; reading?: { form: string; level: number; skill: string; points: number }[]; writing?: { form: string; type: string; words: number; points: number; focus: string }[] };
  quiz?: { sections: { topic: string; need?: string; mcq?: number[]; tf?: number; short?: number }[] };
};
type VanQ = { q?: string; type?: string; points?: unknown[]; model?: string };
const stripNo = (q: string) => String(q).replace(/^\s*Câu\s*\d+\s*[.:]?\s*/i, "").replace(/^(\([^)]*điểm\))\s*[.:]\s*/, "$1 ");
const step = (t: string) => useApp.getState().setUI((u) => { u.ai.step = t; });
const secCount = (x: { mcq?: number[]; tf?: number; short?: number }) => (x.mcq || []).reduce((a, b) => a + (+b || 0), 0) + (+x.tf! || 0) + (+x.short! || 0);

async function aiFromDoc(o: { text: string; files: DocFile[]; subject: string; grade: number; n: number; types: string[]; note: string }) {
  const { setUI, S, update } = useApp.getState();
  setUI((u) => { u.ai.busy = true; u.ai.err = ""; u.ai.step = ""; });
  try {
    step("Bước 1/3: AI đang đọc tài liệu và lập phiếu đặc tả đề…");
    const spec = await aiJson<Spec>("spec", { text: o.text, files: o.files.map(({ name, type, data }) => ({ name, type, data })), subject: o.subject, grade: o.grade, note: o.note });
    const grade = +spec.grade! || o.grade, label = spec.exam_label || "Đề kiểm tra";

    if (spec.kind === "van" && spec.van) {
      step(`Bước 2/3: Đã nhận ra thể loại “${spec.van.genre_label || spec.van.genre}”. Đang chọn văn bản và soạn đề…`);
      const made = await aiJson<{ exam: { title?: string; questions: VanQ[]; essays?: VanQ[] }; passage: { text: string; src: string; title: string; author: string; mine: boolean } }>("van_make", { spec });
      let exam = made.exam;
      step("Bước 3/3: Đang kiểm tra đề với phiếu đặc tả (đủ câu, đúng mức độ, tổng 10 điểm)…");
      try { exam = await aiJson("van_check", { spec, exam, passage: made.passage.text }); } catch { /* giữ bản chưa phản biện */ }
      const qs = [...(exam.questions || []), ...(exam.essays || []).map((x) => ({ ...x, type: "viet" }))]
        .filter((x) => x && x.q && Array.isArray(x.points) && x.model)
        .map((x) => ({ q: stripNo(String(x.q)), type: ["nhanbiet", "tutu", "noidung", "quandiem", "viet"].includes(String(x.type)) ? String(x.type) : "noidung", points: (x.points as unknown[]).map(String), model: String(x.model) }));
      if (!qs.length) throw new Error("empty");
      const P: WritePassage = {
        id: "aw-" + Date.now(), ai: true, doc: true, created: today(),
        title: (exam.title || `${label} – Ngữ văn ${grade}`).slice(0, 110),
        passage: made.passage.text, src: made.passage.src + (made.passage.mine ? "" : ""), qs,
        note: spec.summary ? String(spec.summary).slice(0, 400) : undefined,
      };
      update((S) => { S.aiWrite = S.aiWrite || []; S.aiWrite.unshift(P); if (S.aiWrite.length > 8) S.aiWrite.length = 8; });
      setUI((u) => { u.ai.newId = P.id; });
      toast("Đã tạo đề Ngữ văn, vào làm ngay");
      startWrite(P.id, 0);
    } else {
      const secs = (spec.quiz?.sections || []).filter((x) => secCount(x) > 0);
      if (!secs.length) throw new Error("empty");
      // chia nhóm dòng ma trận, mỗi lần AI soạn ≤ 14 câu; chạy song song tối đa 3 nhóm
      const groups: (typeof secs)[] = []; let cur: typeof secs = [], cnt = 0;
      for (const x of secs) { const c = secCount(x); if (cur.length && cnt + c > 14) { groups.push(cur); cur = []; cnt = 0; } cur.push(x); cnt += c; }
      if (cur.length) groups.push(cur);
      const total = secs.reduce((a, x) => a + secCount(x), 0);
      step(`Bước 2/3: Phiếu đặc tả có ${secs.length} chủ đề, ${total} câu. Đang soạn câu hỏi theo ma trận…`);
      const results: RawQ[][] = new Array(groups.length);
      let done = 0;
      for (let i = 0; i < groups.length; i += 3) {
        await Promise.all(groups.slice(i, i + 3).map(async (g, k) => {
          try { results[i + k] = await aiJson<RawQ[]>("quiz_make", { spec, sections: g }); } catch (e) { if (groups.length === 1) throw e; results[i + k] = []; }
          done++; step(`Bước 2/3: Đã soạn ${done}/${groups.length} nhóm chủ đề…`);
        }));
      }
      step("Bước 3/3: Đang kiểm tra định dạng từng câu…");
      const setId = "ai-" + Date.now(), qids: string[] = [], newQ: Record<string, Question> = {};
      const subject = spec.subject || o.subject || "Tổng hợp";
      const order = { mcq: 0, tf: 1, short: 2 } as Record<string, number>;
      const all = results.flat().map((x, i) => toQuestion(x, setId + "-" + i, subject, 2)).filter(Boolean) as Question[];
      all.sort((a, b) => order[a.qt || "mcq"] - order[b.qt || "mcq"]);
      all.forEach((q) => { newQ[q.id] = q; qids.push(q.id); });
      if (!qids.length) throw new Error("empty");
      saveAndOpen({ id: setId, exam: "*", grade, subject, title: `${label} – ${subject} ${grade} (AI theo tài liệu)`.slice(0, 110), qids, created: today(), doc: true }, newQ, spec.minutes);
    }
  } catch (err) {
    setUI((u) => { u.ai.err = aiErrorText(err, "Chưa tạo được đề. Thử lại, hoặc dán phần ma trận/dàn ý ngắn gọn hơn."); });
  }
  setUI((u) => { u.ai.busy = false; u.ai.step = ""; });
}

async function aiGenerate(a: AiUI) {
  const { setUI, S, update } = useApp.getState();
  setUI((u) => { u.ai.busy = true; u.ai.err = ""; });
  try {
    const arr = await aiJson<{ topic?: string; q: string; o: string[]; a: number; e?: string }[]>("exam", { scope: aiScope(S, a), level: a.level, n: a.n });
    if (!Array.isArray(arr)) throw new Error("bad");
    const e = EXB[a.exam], g = gradeNum(S);
    const setId = "ai-" + Date.now(), qids: string[] = [], newQ: Record<string, Question> = {};
    const subLabel = (e.dgnl ? e.n.split(" ")[0] + ": " : "") + a.subject;
    arr.forEach((x, i) => {
      if (x && typeof x.q === "string" && Array.isArray(x.o) && x.o.length === 4 && Number.isInteger(x.a) && x.a >= 0 && x.a < 4) {
        const id = setId + "-" + i;
        newQ[id] = { id, s: subLabel, t: String(x.topic || "Tổng hợp").slice(0, 60), l: a.level, q: x.q, o: x.o.map(String), a: x.a, e: String(x.e || ""), ai: true };
        qids.push(id);
      }
    });
    if (!qids.length) throw new Error("empty");
    const gr = e.school || a.exam === "other" ? a.grade : a.exam === "thpt" ? 12 : g;
    const set: AiSet = { id: setId, exam: a.exam, grade: gr, subject: a.subject, title: `Đề AI ${e.school ? lc(e.n) + " lớp " + a.grade : a.exam === "other" ? examLabel(S, "other") : e.n}: ${a.subject}, ${lc(LV[a.level])}`, qids, created: today() };
    saveAndOpen(set, newQ);
  } catch (err) {
    setUI((u) => { u.ai.err = aiErrorText(err, "Chưa tạo được đề. Thử lại hoặc giảm số câu."); });
  }
  setUI((u) => { u.ai.busy = false; });
}

function AiGen() {
  const S = useApp((s) => s.S);
  const uiAi = useApp((s) => s.ui.ai);
  const ai = useApp((s) => s.ai);
  const user = useApp((s) => s.user);
  const setUI = useApp((s) => s.setUI);
  const p = S.profile;
  const exam = uiAi.exam && EXB[uiAi.exam] ? uiAi.exam : p.exams[0] || "gk1";
  const grade = uiAi.grade || gradeNum(S);
  const subs = aiSubjectsFor(S, exam);
  const subject = uiAi.subject && subs.includes(uiAi.subject) ? uiAi.subject : subs[0];
  const a: AiUI = { exam, grade, subject, level: uiAi.level, n: uiAi.n };
  const e = EXB[exam];
  const exOrder = [...p.exams, ...EXLIST.map((x) => x.id).filter((id) => !p.exams.includes(id) && (id !== "other" || p.examOther))];
  const set = (k: keyof typeof uiAi, v: string | number) => setUI((u) => { (u.ai as Record<string, unknown>)[k] = v; });

  return (
    <>
      <h2 id="ai-gen">Tạo đề bằng AI</h2>
      <div className="panel">
        {!ai.enabled ? (
          <p className="!m-0">Tính năng tạo đề bằng AI cần server có cấu hình NavyAI API (biến môi trường <code>NAVY_API_KEY</code>). Bạn vẫn dùng được toàn bộ kho đề mẫu ở trên.</p>
        ) : ai.needAuth && !user ? (
          <p className="!m-0"><Link href="/dang-nhap" className="font-semibold text-accent underline">Đăng nhập</Link> để tạo đề bằng AI.</p>
        ) : (
          <>
            <div className="seg !mb-3" role="tablist">
              <button aria-pressed={uiAi.mode !== "doc"} onClick={() => set("mode", "exam")}>Theo kỳ thi</button>
              <button aria-pressed={uiAi.mode === "doc"} onClick={() => set("mode", "doc")}>Theo tài liệu của bạn</button>
            </div>
            {uiAi.mode === "doc" ? <AiDoc /> : <>
            <p className="small muted">AI soạn đề trong đúng phạm vi lớp và kỳ thi bạn chọn. Câu hỏi AI có thể sai, nên giáo viên cần duyệt trước khi dùng chính thức.</p>
            <label className="flabel">Kỳ thi</label>
            <div className="seg">{exOrder.map((id) => <button key={id} aria-pressed={exam === id} onClick={() => set("exam", id)}>{id === "other" ? examLabel(S, "other") : EXB[id].n}</button>)}</div>
            {(e.school || exam === "other") && (
              <><label className="flabel">Lớp</label>
                <div className="seg">{[10, 11, 12].map((g) => <button key={g} aria-pressed={grade === g} onClick={() => set("grade", g)}>Lớp {g}</button>)}</div></>
            )}
            <label className="flabel">{e.dgnl && e.subs ? "Phần thi" : "Môn"}</label>
            <div className="seg">{subs.map((s) => <button key={s} aria-pressed={subject === s} onClick={() => set("subject", s)}>{s}</button>)}</div>
            <label className="flabel">Mức độ</label>
            <div className="seg">{[1, 2, 3].map((l) => <button key={l} aria-pressed={uiAi.level === l} onClick={() => set("level", l)}>{LV[l]}</button>)}</div>
            <label className="flabel">Số câu</label>
            <div className="seg">{[5, 10, 15].map((n) => <button key={n} aria-pressed={uiAi.n === n} onClick={() => set("n", n)}>{n} câu</button>)}</div>
            <p className="small muted !mb-0 mt-3">Phạm vi: {aiScopeShort(S, a)}</p>
            <button className="btn mt-3 w-full" disabled={uiAi.busy} onClick={() => aiGenerate(a)}>{uiAi.busy ? "Đang soạn đề, khoảng 30 giây…" : "Tạo đề"}</button>
            {uiAi.err && <p className="small !mb-0 mt-2.5 text-bad">{uiAi.err}</p>}
            </>}
          </>
        )}
      </div>
    </>
  );
}

const MAX_FILE = 3 * 1024 * 1024, MAX_TOTAL = 3.3 * 1024 * 1024;
const ACCEPT = ".pdf,.docx,.txt,.md,.csv,image/png,image/jpeg,image/webp";
const readB64 = (f: File) => new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).replace(/^data:[^,]*,/, "")); r.onerror = () => rej(r.error); r.readAsDataURL(f); });
const kb = (n: number) => (n > 1024 * 1024 ? (n / 1024 / 1024).toFixed(1).replace(".", ",") + " MB" : Math.ceil(n / 1024) + " KB");

/** Tạo đề từ ma trận / dàn ý / dạng câu / đề mẫu của người dùng */
function AiDoc() {
  const S = useApp((s) => s.S);
  const uiAi = useApp((s) => s.ui.ai);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<DocFile[]>([]);
  const [fErr, setFErr] = useState("");
  const [subject, setSubject] = useState(S.profile.subjects[0] || "Toán");
  const [grade, setGrade] = useState(gradeNum(S));
  const [note, setNote] = useState("");
  const [drag, setDrag] = useState(false);

  const add = async (list: FileList | null) => {
    if (!list) return; setFErr("");
    const next = [...files];
    for (const f of Array.from(list)) {
      if (next.length >= 3) { setFErr("Tối đa 3 tệp."); break; }
      if (!/\.(pdf|docx|txt|md|csv|png|jpe?g|webp)$/i.test(f.name)) { setFErr(`“${f.name}”: chỉ nhận PDF, Word (.docx), ảnh, .txt, .csv.`); continue; }
      if (f.size > MAX_FILE) { setFErr(`“${f.name}” lớn hơn 3 MB. Hãy cắt bớt hoặc chụp phần cần thiết.`); continue; }
      if (next.reduce((t, x) => t + x.size, 0) + f.size > MAX_TOTAL) { setFErr("Tổng dung lượng tối đa khoảng 3 MB."); break; }
      if (/\.doc$/i.test(f.name)) { setFErr("File .doc cũ: hãy lưu lại thành .docx hoặc PDF."); continue; }
      next.push({ name: f.name, type: f.type, size: f.size, data: await readB64(f) });
    }
    setFiles(next);
  };
  const ready = (text.trim().length >= 10 || files.length > 0) && !uiAi.busy;

  return (
    <>
      <p className="small muted">Tải lên <b>ma trận / đặc tả đề</b>, <b>đề cương</b>, <b>bảng dạng câu hỏi</b>, <b>dàn ý</b> hoặc <b>đề mẫu</b> (PDF, Word, ảnh chụp, .txt). AI làm như giáo viên ra đề: lập phiếu đặc tả (số câu, mức độ, điểm), rồi soạn đề mới đúng phiếu và tự kiểm tra lại. Xong là vào làm bài ngay.</p>
      <p className="small muted !mt-[-4px]"><b>Ngữ văn:</b> AI nhận ra thể loại (thơ, truyện, nghị luận, văn bản thông tin, kịch, kí…) từ cách hỏi và dàn ý, chọn văn bản đọc hiểu cùng thể loại, ra đủ Đọc hiểu + Viết (đoạn văn, bài văn) kèm hướng dẫn chấm; bài viết được AI chấm theo biểu điểm.</p>
      <label
        className={`block cursor-pointer rounded-[var(--r)] border-2 border-dashed px-4 py-5 text-center ${drag ? "border-accent bg-accent-soft" : "border-line"}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }}>
        <input type="file" className="sr-only" multiple accept={ACCEPT} onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
        <b className="block">Chọn tệp hoặc kéo thả vào đây</b>
        <span className="small muted">PDF, Word (.docx), ảnh PNG/JPG, .txt, .csv · tối đa 3 tệp, 3 MB</span>
      </label>
      {files.length > 0 && (
        <ul className="mt-2 !pl-0">
          {files.map((f, i) => (
            <li key={i} className="small flex list-none items-center gap-2 border-b border-line py-1.5">
              <span className="flex-1 truncate">{f.name}</span><span className="muted">{kb(f.size)}</span>
              <button className="underline underline-offset-4" onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label={"Bỏ tệp " + f.name}>Bỏ</button>
            </li>
          ))}
        </ul>
      )}
      {fErr && <p className="small !mb-0 mt-2 text-bad">{fErr}</p>}
      <label className="flabel" htmlFor="ai-doc-text">Hoặc dán nội dung / ghi chú dàn ý</label>
      <textarea id="ai-doc-text" className="field min-h-28" maxLength={12000} value={text} onChange={(e) => setText(e.target.value)}
        placeholder={"Ví dụ:\nMa trận đề giữa kì 2 Toán 11, 35 câu:\n- Mũ – logarit: 4 nhận biết, 3 thông hiểu, 2 vận dụng\n- Quan hệ vuông góc: 3 NB, 3 TH, 1 VD\n…"} />
      <div className="mt-1 flex flex-wrap gap-x-3">
        <div className="min-w-[140px] flex-1">
          <label className="flabel" htmlFor="ai-doc-sub">Môn</label>
          <select id="ai-doc-sub" className="field" value={subject} onChange={(e) => setSubject(e.target.value)}>
            {[...new Set([...S.profile.subjects, ...SUBJECT_OPTS])].map((x) => <option key={x}>{x}</option>)}
          </select>
        </div>
        <div className="min-w-[110px] flex-1">
          <label className="flabel" htmlFor="ai-doc-gr">Lớp</label>
          <select id="ai-doc-gr" className="field" value={grade} onChange={(e) => setGrade(+e.target.value)}>
            {[10, 11, 12].map((g) => <option key={g} value={g}>Lớp {g}</option>)}
          </select>
        </div>
      </div>
      <label className="flabel" htmlFor="ai-doc-note">Yêu cầu thêm (không bắt buộc)</label>
      <input id="ai-doc-note" className="field" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ví dụ: đề giữa kì 2; đọc hiểu là thơ; câu nghị luận về lòng biết ơn" />
      <button className="btn mt-3 w-full" disabled={!ready} onClick={() => aiFromDoc({ text, files, subject, grade, n: 0, types: [], note })}>
        {uiAi.busy ? "Đang tạo đề…" : "Tạo đề và làm ngay"}
      </button>
      {uiAi.busy && <p className="small !mb-0 mt-2" role="status">{uiAi.step || "Đang gửi tài liệu…"} <span className="muted">(cả quá trình khoảng 1–3 phút, đừng tắt trang)</span></p>}
      {uiAi.err && <p className="small !mb-0 mt-2.5 text-bad">{uiAi.err}</p>}
      <p className="small muted !mb-0 mt-2">Tài liệu chỉ dùng để soạn đề lần này, không lưu trên máy chủ. Câu AI soạn có thể sai, hãy dùng nút “Báo đáp án sai” nếu thấy nghi ngờ.</p>
    </>
  );
}

/** Đề AI đã tạo: luôn hiện ở đầu trang, đề vừa tạo được tô sáng */
function AiMine() {
  const S = useApp((s) => s.S);
  const newId = useApp((s) => s.ui.ai.newId);
  const update = useApp((s) => s.update);
  const setUI = useApp((s) => s.setUI);
  type Row = { id: string; title: string; n: number; created?: string; tag: string; note?: string; open: () => void; del: () => void };
  const rows: Row[] = [
    ...(S.aiWrite || []).filter((P) => P.doc).map((P): Row => ({
      id: P.id, title: P.title, n: P.qs.length, created: P.created, tag: "AI · Văn", note: P.note,
      open: () => startWrite(P.id, 0),
      del: () => update((S) => { S.aiWrite = (S.aiWrite || []).filter((x) => x.id !== P.id); }),
    })),
    ...S.aiSets.map((a): Row => ({
      id: a.id, title: a.title, n: a.qids.filter((id) => getQ(S, id)).length, created: a.created, tag: a.doc ? "AI · tài liệu" : "AI",
      open: () => startSession("exam", a.qids, a.title, { keepOrder: true, durationMin: Math.max(10, Math.ceil(a.qids.length * 1.8)) }),
      del: () => update((S) => { const i = S.aiSets.findIndex((y) => y.id === a.id); if (i >= 0) { S.aiSets[i].qids.forEach((id) => { if (!S.mistakes[id]) delete S.aiQ[id]; }); S.aiSets.splice(i, 1); } }),
    })),
  ].sort((x, y) => (y.id.replace(/\D/g, "") > x.id.replace(/\D/g, "") ? 1 : -1));
  if (!rows.length) return null;
  return (
    <>
      <h2>Đề AI của bạn</h2>
      <div className="grid gap-x-3 lg:grid-cols-2">
        {rows.map((r) => {
          const isNew = r.id === newId;
          return (
            <div className={`panel flex flex-col ${isNew ? "!border-accent ring-4 ring-accent/40" : ""}`} key={r.id} ref={isNew ? (el) => { if (el) el.scrollIntoView({ block: "center", behavior: "smooth" }); } : undefined}>
              <div className="flex flex-1 items-start gap-2.5">
                <div className="flex-1">
                  <h3>{r.title}</h3>
                  <p className="small muted !m-0">{r.n} câu{r.created ? " · tạo " + r.created.split("-").reverse().join("/") : ""}</p>
                  {r.note && <details className="small mt-1"><summary className="cursor-pointer underline underline-offset-4">AI hiểu đề của bạn thế nào</summary><p className="!mb-0 mt-1">{r.note}</p></details>}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {isNew && <span className="tag tag-l3">Mới</span>}
                  <span className="tag tag-ai">{r.tag}</span>
                </div>
              </div>
              <div className="mt-2.5 flex gap-2.5">
                <button className="btn flex-1" onClick={() => { setUI((u) => { u.ai.newId = null; }); r.open(); }}>{isNew ? "Làm đề vừa tạo" : "Làm bài"}</button>
                <button className="btn btn-line" aria-label="Xóa đề" onClick={r.del}>Xóa</button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

const PAGE = 12;

async function startRemote(r: RemoteSet, setBusy: (id: string | null) => void) {
  setBusy(r.id);
  try {
    const qs = await loadSet(r.id);
    if (!qs.length) { toast("Đề này chưa có câu hỏi"); return; }
    startSession("exam", qs.map((q) => q.id), r.title, { durationMin: r.duration_min || undefined, keepOrder: true });
  } catch {
    toast("Chưa tải được đề. Kiểm tra kết nối mạng rồi thử lại.");
  } finally { setBusy(null); }
}

/* ---------------- Kho đề thật (Supabase): lọc riêng, không phụ thuộc kỳ thi/lớp ---------------- */
function Bank() {
  const S = useApp((s) => s.S);
  const sets = useRemote((r) => r.sets);
  const status = useRemote((r) => r.status);
  const [sub, setSub] = useState("Tất cả");
  const [kind, setKind] = useState("all");
  const isNew = (r: RemoteSet) => r.curriculum !== "2006"; // GDPT 2018 (đề từ 2025)
  const nNew = sets.filter(isNew).length, nOld = sets.length - nNew;
  // Mặc định: chương trình mới nếu đã có đề, chưa có thì hiện tất cả
  const [curSel, setCur] = useState<"all" | "new" | "old" | null>(null);
  const cur = curSel ?? (nNew ? "new" : "all");
  const [year, setYear] = useState("Tất cả");
  const [shown, setShown] = useState(PAGE);
  const [busy, setBusy] = useState<string | null>(null);
  const mine = S.profile.subjects;
  const subjects = [...new Set(sets.map((r) => r.subject))].sort((a, b) => (mine.includes(b) ? 1 : 0) - (mine.includes(a) ? 1 : 0) || a.localeCompare(b, "vi"));
  const years = [...new Set(sets.map((r) => r.year).filter(Boolean) as number[])].sort((a, b) => b - a);
  const list = sets.filter((r) => (sub === "Tất cả" || r.subject === sub) && (kind === "all" || r.kind === kind) && (year === "Tất cả" || String(r.year) === year)
      && (cur === "all" || (cur === "new") === isNew(r)))
    // Ưu tiên: chương trình mới → năm gần nhất → đề chính thức → môn của bạn
    .sort((a, b) => Number(isNew(b)) - Number(isNew(a)) || (b.year || 0) - (a.year || 0) || Number(b.kind === "official") - Number(a.kind === "official")
      || Number(mine.includes(b.subject)) - Number(mine.includes(a.subject)) || a.subject.localeCompare(b.subject, "vi") || a.id.localeCompare(b.id, "en", { numeric: true }));
  const reset = () => setShown(PAGE);
  const dgnl = S.profile.exams.some((id) => EXB[id]?.dgnl);

  if (!sets.length) {
    return (
      <div className="panel mt-3">
        <p className="!m-0">{status === "loading" ? "Đang tải kho đề…" : status === "off" ? "Chưa kết nối Supabase nên chưa có kho đề. Xem README mục “Nạp kho đề thi thật”." : status === "offline" ? "Không tải được kho đề (mất mạng hoặc Supabase chưa cấp quyền đọc). Thử lại sau." : "Kho đề đang trống. Chạy npm run data:upload để nạp đề."}</p>
      </div>
    );
  }
  return (
    <>
      {dgnl && <p className="small muted mt-3">Đề tốt nghiệp THPT dùng tốt để ôn phần kiến thức Toán, Khoa học, Tiếng Anh cho bài thi đánh giá năng lực.</p>}
      <label className="flabel">Chương trình</label>
      <div className="seg">{([["new", `Mới – GDPT 2018 (${nNew})`], ["old", `Cũ – 2006 (${nOld})`], ["all", "Tất cả"]] as const).map(([k, l]) => <button key={k} aria-pressed={cur === k} onClick={() => { setCur(k); reset(); }}>{l}</button>)}</div>
      <label className="flabel">Môn</label>
      <div className="seg">{["Tất cả", ...subjects].map((s) => <button key={s} aria-pressed={sub === s} onClick={() => { setSub(s); reset(); }}>{s}</button>)}</div>
      <div className="mt-1 flex flex-wrap items-end gap-2.5">
        <div className="flex-1">
          <label className="flabel">Loại đề</label>
          <div className="seg">{([["all", "Tất cả"], ["official", "Đề chính thức"], ["practice", "Đề ôn luyện"]] as const).map(([k, l]) => <button key={k} aria-pressed={kind === k} onClick={() => { setKind(k); reset(); }}>{l}</button>)}</div>
        </div>
        {years.length > 0 && (
          <div className="min-w-[120px]">
            <label className="flabel" htmlFor="f-year">Năm</label>
            <select className="field" id="f-year" value={year} onChange={(e) => { setYear(e.target.value); reset(); }}>
              {["Tất cả", ...years.map(String)].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        )}
      </div>
      <h2>{list.length} đề</h2>
      {status === "offline" && <p className="small muted">Đang ngoại tuyến: chỉ mở được các đề đã tải trước đó.</p>}
      {!list.length && <div className="panel"><p className="!m-0">{cur === "new" && !nNew ? "Chưa có đề theo chương trình mới (GDPT 2018). Đề tốt nghiệp từ năm 2025 có thêm dạng Đúng/Sai và trả lời ngắn; khi nạp vào kho, đề sẽ hiện ở đây. Hiện có thể luyện bằng đề chương trình cũ." : "Không có đề khớp bộ lọc."}</p>{cur === "new" && !nNew && nOld > 0 && <button className="btn btn-ghost mt-3" onClick={() => { setCur("old"); reset(); }}>Xem {nOld} đề chương trình cũ</button>}</div>}
      <div className="grid gap-x-3 lg:grid-cols-2">
        {list.slice(0, shown).map((r) => (
          <div className="panel flex flex-col" key={r.id}>
            <div className="flex flex-1 items-start gap-2.5">
              <div className="flex-1">
                <h3>{r.title}</h3>
                <p className="small muted !m-0">{r.question_count} câu, {r.duration_min || Math.ceil(r.question_count * 1.5)} phút{r.year ? ` · năm ${r.year}` : ""}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {r.kind === "official" ? <span className="tag tag-l3">Chính thức</span> : <span className="tag">Ôn luyện</span>}
                {isNew(r) ? <span className="tag tag-l1">CT mới</span> : <span className="tag">CT cũ</span>}
                {mine.includes(r.subject) && <span className="tag tag-l1">Môn của bạn</span>}
              </div>
            </div>
            <button className="btn mt-2.5 w-full" disabled={busy === r.id} onClick={() => startRemote(r, setBusy)}>{busy === r.id ? "Đang tải đề…" : "Làm bài thi thử"}</button>
          </div>
        ))}
      </div>
      {list.length > shown && <button className="btn btn-line w-full" onClick={() => setShown(shown + PAGE * 2)}>Xem thêm {Math.min(PAGE * 2, list.length - shown)} đề (còn {list.length - shown})</button>}
      {sets.some((r) => r.source === "VNHSGE") && <p className="small muted mt-3">Đề tốt nghiệp THPT 2019–2023 và đề ôn luyện lấy từ bộ dữ liệu VNHSGE (Dao Xuan Quy và cộng sự). Đề theo chương trình cũ; từ 2025 đề thi có thêm câu Đúng/Sai và trả lời ngắn.</p>}
    </>
  );
}

/* ---------------- Đề ôn giữa kì / cuối kì soạn theo SGK mới ---------------- */
const SUB_ORDER = ["Toán", "Ngữ văn", "Tiếng Anh", "Vật lí", "Hóa học", "Sinh học", "Tin học", "Công nghệ", "GD Kinh tế và Pháp luật"];
function HKList({ ef }: { ef: { exam: string; grade: string; subject: string } }) {
  const S = useApp((s) => s.S);
  const sets = useHK((h) => h.sets);
  const [busy, setBusy] = useState<string | null>(null);
  const list = sets.filter((x) => (ef.exam === "Tất cả" || x.exam === ef.exam) && (ef.grade === "Tất cả" || String(x.grade) === ef.grade) && (ef.subject === "Tất cả" || x.subject === ef.subject))
    .sort((a, b) => Number(S.profile.subjects.includes(b.subject)) - Number(S.profile.subjects.includes(a.subject)) || a.grade - b.grade || a.exam.localeCompare(b.exam) || SUB_ORDER.indexOf(a.subject) - SUB_ORDER.indexOf(b.subject));
  if (!list.length) return null;
  const season = examSeason();
  const open = async (x: HKSet) => { setBusy(x.id); await startHK(x, startWrite); setBusy(null); };
  return (
    <>
      <h2>Đề ôn {ef.exam !== "Tất cả" && EXB[ef.exam] ? lc(EXB[ef.exam].n) : "giữa kì, cuối kì"} – soạn theo SGK mới</h2>
      <p className="small muted !mt-[-4px]">Bám sát chương trình GDPT 2018 (sách Kết nối tri thức, dùng được cho các bộ sách khác). Cấu trúc như đề kiểm tra hiện nay: trắc nghiệm, Đúng/Sai, trả lời ngắn; Ngữ văn gồm đọc hiểu và viết.</p>
      <div className="grid gap-x-3 lg:grid-cols-2">
        {list.map((x) => {
          const mine = S.profile.subjects.includes(x.subject) && String(gradeNum(S)) === String(x.grade);
          const hot = season && season.exam === x.exam;
          return (
            <div className="panel flex flex-col" key={x.id}>
              <div className="flex flex-1 items-start gap-2.5">
                <div className="min-w-0 flex-1">
                  <h3>{x.title}</h3>
                  <p className="small muted !mb-1">{x.kind === "write" ? `Đọc hiểu ${x.count - 2} câu + Viết 2 câu · ${x.duration_min} phút` : `${x.count} câu${x.parts && x.parts.tf ? ` (${x.parts.mcq} trắc nghiệm, ${x.parts.tf} Đúng/Sai, ${x.parts.short} trả lời ngắn)` : ""} · ${x.duration_min} phút`}</p>
                  <p className="read !m-0 text-[13px] leading-snug opacity-75">{x.kind === "write" ? "Văn bản: " + x.work : <MathText text={x.scope} />}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {hot && <span className="tag tag-l3">Mùa thi</span>}
                  {mine && <span className="tag tag-l1">Hợp với bạn</span>}
                </div>
              </div>
              <button className="btn mt-2.5 w-full" disabled={busy === x.id} onClick={() => open(x)}>{busy === x.id ? "Đang tải đề…" : x.kind === "write" ? "Luyện đề (đọc hiểu + viết)" : "Làm bài thi thử"}</button>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ---------------- Đề mẫu theo kỳ thi của bạn + đề AI ---------------- */
function Mine() {
  const S = useApp((s) => s.S);
  const efUI = useApp((s) => s.ui.ef);
  const setUI = useApp((s) => s.setUI);
  const update = useApp((s) => s.update);
  const p = S.profile;
  let ef = efUI;
  if (!ef) { const first = p.exams.find((id) => id !== "other" && !EXB[id].dgnl); ef = { exam: first || "Tất cả", grade: first === "thpt" ? "12" : String(gradeNum(S)), subject: "Tất cả" }; }
  const all = examSets(S);
  const hkSets = useHK((h) => h.sets); const hkSubs = hkSets.map((x) => x.subject);
  const exOpts = ["Tất cả", ...EXLIST.filter((e) => e.id !== "other" || p.examOther).map((e) => e.id)], grOpts = ["Tất cả", "10", "11", "12"], subOpts = ["Tất cả", ...new Set([...all.map((x) => x.subject), ...hkSubs])];
  const list = all.filter((x) => (ef!.exam === "Tất cả" || x.exam === ef!.exam || x.exam === "*") && (ef!.grade === "Tất cả" || String(x.grade) === ef!.grade || x.grade === "*") && (ef!.subject === "Tất cả" || x.subject === ef!.subject));
  const name = (o: string) => (o === "Tất cả" ? o : EXB[o] ? (o === "other" ? examLabel(S, "other") : EXB[o].n) : /^\d+$/.test(o) ? "Lớp " + o : o);
  const sel = (id: "exam" | "grade" | "subject", opts: string[], v: string, lab: string) => (
    <div className="min-w-[130px] flex-1">
      <label className="flabel" htmlFor={"f-" + id}>{lab}</label>
      <select className="field" id={"f-" + id} value={v} onChange={(ev) => setUI({ ef: { ...ef!, [id]: ev.target.value } })}>
        {opts.map((o) => <option key={o} value={o}>{name(o)}</option>)}
      </select>
    </div>
  );
  return (
    <>
      <div className="mt-1.5 flex flex-wrap gap-2.5">
        {sel("exam", exOpts, ef.exam, "Kỳ thi")}
        {sel("grade", grOpts, ef.grade, "Lớp")}
        {sel("subject", subOpts, ef.subject, "Môn")}
      </div>
      <div className="panel-soft mt-3 flex flex-wrap items-center gap-2.5">
        <p className="small !m-0 flex-1 min-w-[200px]"><b>Có ma trận đề, dàn ý hoặc đề mẫu?</b> Tải lên để AI soạn đề mới đúng dạng, làm ngay.</p>
        <button className="btn btn-sm" onClick={() => { setUI((u) => { u.ai.mode = "doc"; }); document.getElementById("ai-gen")?.scrollIntoView({ behavior: "smooth" }); }}>Tạo đề từ tài liệu</button>
      </div>
      <AiMine />
      {EXB[ef.exam]?.dgnl ? <DgnlPanel exam={ef.exam} /> : <><GenPanel ef={ef} />
      <HKList ef={ef} /></>}
      <h2>{list.length} đề luyện nhanh</h2>
      {!list.length && <div className="panel"><p className="!m-0">Chưa có đề mẫu khớp bộ lọc. Tạo đề đúng phạm vi bằng AI ở bên dưới, hoặc xem tab Kho đề thi thật.</p></div>}
      <div className="grid gap-x-3 lg:grid-cols-2">
        {list.map((x) => {
          const n = x.qids.filter((id) => getQ(S, id)).length;
          const mine = (x.exam === "*" ? p.subjects.includes(x.subject) : p.exams.includes(x.exam)) && (EXB[x.exam] && EXB[x.exam].school ? x.grade === gradeNum(S) : true) && (x.ai || p.subjects.includes(x.subject));
          return (
            <div className="panel flex flex-col" key={x.id}>
              <div className="flex flex-1 items-start gap-2.5">
                <div className="flex-1"><h3>{x.title}</h3><p className="small muted !m-0">{n} câu, {Math.ceil(n * 1.5)} phút</p></div>
                <div className="flex flex-col items-end gap-1">
                  {x.ai && <span className="tag tag-ai">AI</span>}
                  {x.exam === "*" && <span className="tag">Mọi kỳ thi</span>}
                  {mine && <span className="tag tag-l1">Hợp với bạn</span>}
                </div>
              </div>
              <div className="mt-2.5 flex gap-2.5">
                <button className="btn flex-1" onClick={() => startSession("exam", x.qids, x.title)}>Làm bài thi thử</button>
                {x.ai && (
                  <button className="btn btn-line" onClick={() => update((S) => { const i = S.aiSets.findIndex((y) => y.id === x.id); if (i >= 0) { S.aiSets[i].qids.forEach((id) => { if (!S.mistakes[id]) delete S.aiQ[id]; }); S.aiSets.splice(i, 1); } })}>Xóa</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <AiGen />
    </>
  );
}

export default function Exams() {
  const sets = useRemote((r) => r.sets);
  const examTab = useApp((s) => s.ui.examTab);
  const setUI = useApp((s) => s.setUI);
  const S = useApp((s) => s.S);
  // Mùa thi ở trường: mở sẵn tab đề theo kỳ thi
  const schoolSeason = !!examSeason() && S.profile.exams.some((id) => EXB[id]?.school);
  const tab = examTab || (schoolSeason || !sets.length ? "mine" : "bank");
  const official = sets.filter((r) => r.kind === "official").length;
  return (
    <>
      <div className="mt-3.5 grid grid-cols-2 gap-1 rounded-2xl border border-line bg-surface p-1" role="tablist">
        {([["bank", "Kho đề thi thật", sets.length ? `${sets.length} đề · ${official} chính thức` : "Đề tốt nghiệp các năm"], ["mine", "Đề theo kỳ thi", "Giữa kì, cuối kì, đề AI"]] as const).map(([k, l, sub]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setUI({ examTab: k })}
            className={`rounded-xl px-3 py-2 text-left transition-colors ${tab === k ? "bg-accent text-on-accent" : "hover:bg-accent-soft"}`}>
            <b className="block text-[15px]">{l}</b>
            <span className={`text-xs ${tab === k ? "opacity-85" : "muted"}`}>{sub}</span>
          </button>
        ))}
      </div>
      {tab === "bank" ? <Bank /> : <Mine />}
    </>
  );
}
