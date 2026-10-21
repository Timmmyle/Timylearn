"use client";
/* Nút "Báo đáp án sai": học sinh chọn đáp án mình cho là đúng → AI giải lại và thẩm định.
   Nếu đáp án cũ sai thật: sửa ngay trong bài đang xem (tính lại điểm) và lưu đáp án đúng cho mọi người. */
import { useState } from "react";
import { useApp } from "@/lib/store";
import { aiErrorText, aiJson } from "@/lib/api";
import { setFix } from "@/lib/fixes";
import { getQ } from "@/lib/logic";
import { isCorrect, qtype } from "@/lib/grading";
import type { PlayQ, Pick, QuizSession } from "@/lib/types";
import { MathText } from "../MathText";
import { Icon } from "../Icon";
import { toast } from "@/lib/toast";

type Res = { verdict: "fixed" | "kept" | "review"; saved: boolean; kind: "mcq" | "tf" | "short"; correct: { a?: number; text?: string; st?: boolean[] }; explanation: string; solution: string; local: boolean };

export default function ReportButton({ i, q, pick }: { i: number; q: PlayQ; pick: Pick }) {
  const aiOn = useApp((s) => s.ai.enabled);
  const user = useApp((s) => s.user);
  const t = qtype(q);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Res | null>(null);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [mc, setMc] = useState<number | null>(typeof pick === "number" && pick !== q.ans ? pick : null);
  const [st, setSt] = useState<boolean[]>(() => (q.st || []).map((x, k) => (Array.isArray(pick) && typeof pick[k] === "boolean" ? (pick[k] as boolean) : x.a)));
  const [sa, setSa] = useState(typeof pick === "string" ? pick : "");

  if (!aiOn) return null;
  if (res) {
    const fixed = res.verdict === "fixed";
    return (
      <div className={`fb mt-2 ${fixed ? "ok" : ""}`} role="status">
        <b className="block">{fixed ? (res.saved ? "AI xác nhận đáp án cũ sai. Đã sửa đáp án cho mọi người." : "AI xác nhận đáp án cũ sai. Đã sửa trong bài của bạn và gửi để giáo viên duyệt.") : res.verdict === "review" ? (q.gen ? "Đáp án câu này do máy tính từ số liệu. AI có ý kiến khác nên câu đã được gửi để giáo viên xem lại dạng bài." : "AI chưa chắc chắn, câu này được gửi để giáo viên xem lại.") : "AI đã giải lại: đáp án hiện tại là đúng."}</b>
        {res.explanation && <p className="small !mb-0 mt-1 whitespace-pre-wrap"><MathText text={res.explanation} /></p>}
        {fixed && <p className="small muted !mb-0 mt-1">Điểm của bạn đã được tính lại theo đáp án mới. Cảm ơn bạn đã báo!</p>}
      </div>
    );
  }

  const claimReady = t === "mcq" ? mc !== null && mc !== q.ans : t === "tf" ? st.some((v, k) => v !== q.st![k].a) : sa.trim() !== "";
  const send = async () => {
    setBusy(true); setErr("");
    try {
      const claim = t === "mcq" ? { text: q.opts[mc!] } : t === "tf" ? { st } : { text: sa.trim() };
      const orig = getQ(useApp.getState().S, q.id) || q;
      const r = await aiJson<Res>("review", { qid: q.id, claim, note, shown: { id: q.id, s: q.s, q: orig.q, o: orig.o, a: orig.a, qt: orig.qt, st: orig.st, sa: orig.sa, e: orig.e } });
      setRes(r);
      if (r.verdict === "fixed") applyToSession(i, q, r);
    } catch (e) {
      setErr(aiErrorText(e, "Chưa gửi được. Thử lại sau nhé."));
    }
    setBusy(false);
  };

  return (
    <div className="mt-2">
      {!open ? (
        <button className="small inline-flex items-center gap-1 underline underline-offset-4 opacity-80 hover:opacity-100" onClick={() => setOpen(true)}>
          <Icon name="x" size={14} /> Báo đáp án sai
        </button>
      ) : (
        <div className="panel-soft mt-1">
          <b className="block">Bạn cho rằng đáp án đúng là:</b>
          {t === "mcq" && q.opts.map((o, k) => (
            <label key={k} className={`read mt-1.5 flex cursor-pointer items-start gap-2 rounded-lg border px-2 py-1.5 text-[14px] ${mc === k ? "border-chalk bg-accent-soft" : "border-line"} ${k === q.ans ? "opacity-60" : ""}`}>
              <input type="radio" name={`rp-${q.id}`} className="mt-1" checked={mc === k} disabled={k === q.ans} onChange={() => setMc(k)} />
              <span><b>{"ABCD"[k]}.</b> <MathText text={o} />{k === q.ans ? " (đáp án hiện tại)" : ""}</span>
            </label>
          ))}
          {t === "tf" && q.st!.map((x, k) => (
            <div key={k} className="read mt-1.5 flex items-center gap-2 text-[14px]">
              <span className="flex-1"><b>{"abcd"[k]})</b> <MathText text={x.t} /></span>
              {[true, false].map((b) => (
                <button key={String(b)} type="button" aria-pressed={st[k] === b} onClick={() => setSt((a) => a.map((v, j) => (j === k ? b : v)))}
                  className={`h-8 min-w-11 rounded-md border px-1.5 text-[13px] ${st[k] === b ? "border-chalk bg-accent text-on-accent" : "border-line"}`}>{b ? "Đúng" : "Sai"}</button>
              ))}
            </div>
          ))}
          {t === "short" && <input className="field mt-1.5" inputMode="decimal" placeholder={`Đáp số bạn cho là đúng (hiện tại: ${q.sa})`} value={sa} onChange={(e) => setSa(e.target.value)} />}
          <label className="flabel" htmlFor={`rn-${q.id}`}>Lý do (không bắt buộc)</label>
          <textarea id={`rn-${q.id}`} className="field min-h-16" maxLength={600} placeholder="Ví dụ: đề cho a = 3 nhưng lời giải dùng a = 4" value={note} onChange={(e) => setNote(e.target.value)} />
          {!user && <p className="small text-bad !mb-0 mt-2">Đăng nhập để gửi báo cáo.</p>}
          {err && <p className="small text-bad !mb-0 mt-2">{err}</p>}
          <div className="mt-2.5 flex gap-2">
            <button className="btn btn-line btn-sm" onClick={() => setOpen(false)}>Hủy</button>
            <button className="btn btn-sm flex-1" disabled={!claimReady || busy || !user} onClick={send}>{busy ? "AI đang giải lại câu này…" : "Gửi cho AI kiểm tra"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Sửa đáp án trong bài đang xem + lưu bản sửa trên máy (thứ tự phương án gốc) */
function applyToSession(i: number, q: PlayQ, r: Res) {
  const orig = getQ(useApp.getState().S, q.id);
  useApp.getState().act((S, ses) => {
    const s = ses as QuizSession; const it = s.items[i]; if (!it) return;
    if (r.kind === "mcq" && r.correct.text != null) { const k = it.opts.findIndex((o) => o === r.correct.text); if (k >= 0) it.ans = k; }
    if (r.kind === "tf" && r.correct.st && it.st) it.st = it.st.map((x, k) => ({ ...x, a: !!r.correct.st![k] }));
    if (r.kind === "short" && r.correct.text != null) it.sa = String(r.correct.text);
    if (r.solution) it.e = r.solution;
    if (isCorrect(it, s.picks[i])) delete S.mistakes[it.id]; // giờ thành câu đúng: bỏ khỏi sổ lỗi sai
  });
  if (orig) {
    const a = r.kind === "mcq" && r.correct.text != null ? orig.o.indexOf(r.correct.text) : undefined;
    setFix(q.id, { ...(a != null && a >= 0 ? { a } : {}), ...(r.correct.st ? { st: r.correct.st } : {}), ...(r.kind === "short" && r.correct.text != null ? { sa: String(r.correct.text) } : {}), ...(r.solution ? { e: r.solution } : {}) });
  }
  toast("Đã cập nhật đáp án và tính lại điểm");
}
