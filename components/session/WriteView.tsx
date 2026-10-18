"use client";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { toast } from "@/lib/toast";
import { TYPES, WKEY } from "@/lib/data/curriculum";
import { bump, comma, gradeLabel, today, touchStreak } from "@/lib/logic";
import { aiErrorText, aiJson } from "@/lib/api";
import type { WriteSession } from "@/lib/types";
import { SesTop } from "./SessionView";
import { startWrite } from "../WritePanel";

const setW = (fn: (s: WriteSession) => void) => useApp.getState().act((_S, ses) => { fn(ses as WriteSession); });

function writeRecord(score: number) {
  useApp.getState().act((S, ses) => {
    const s = ses as WriteSession; if (s.recorded) return; s.recorded = true;
    const ok = score >= 7, d = today();
    S.stats[d] = S.stats[d] || {}; const r = (S.stats[d][WKEY] = S.stats[d][WKEY] || { c: 0, t: 0 }); r.t++; if (ok) r.c++;
    S.xp += Math.round(score * 2); bump(S, "answers"); bump(S, "practice"); touchStreak(S);
  });
}

async function aiGrade() {
  const { ses, S } = useApp.getState(); const s = ses as WriteSession; const Qn = s.p.qs[s.qi];
  if (!s.answer.trim()) { toast("Viết câu trả lời trước khi chấm"); return; }
  setW((x) => { x.busy = true; x.err = ""; });
  try {
    const j = await aiJson<{ score?: number; dat?: string[]; thieu?: string[]; sua?: string }>("grade", {
      gradeLabel: gradeLabel(S), passage: s.p.passage, question: Qn.q, points: Qn.points, model: Qn.model, answer: s.answer,
    });
    const sc = Math.max(0, Math.min(10, Math.round((+(j.score ?? 0) || 0) * 2) / 2));
    setW((x) => { x.res = { ai: true, score: sc, checks: [], dat: Array.isArray(j.dat) ? j.dat.map(String).slice(0, 5) : [], thieu: Array.isArray(j.thieu) ? j.thieu.map(String).slice(0, 5) : [], sua: String(j.sua || "") }; });
    writeRecord(sc);
  } catch (e) {
    setW((x) => { x.err = aiErrorText(e, "Chưa chấm được. Thử lại hoặc tự chấm với đáp án gợi ý."); });
  }
  setW((x) => { x.busy = false; });
}

export default function WriteView() {
  const s = useApp((st) => st.ses) as WriteSession;
  const aiOn = useApp((st) => st.ai.enabled);
  const setUI = useApp((st) => st.setUI);
  const router = useRouter();
  const P = s.p, Qn = P.qs[s.qi], ty = TYPES[Qn.type] || TYPES.noidung, r = s.res;

  return (
    <div key={P.id + s.qi}>
      <SesTop><b className="flex-1 truncate">{P.title}</b><span className="small muted">Câu {s.qi + 1}/{P.qs.length}</span></SesTop>
      <div className="lg:grid lg:grid-cols-2 lg:gap-6">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="passage">{P.passage}<p className="small muted !mb-0 mt-2">{P.src}</p></div>
        </div>
        <div>
          <div className="qtext !mt-2">Câu {s.qi + 1}. {Qn.q}</div>
          <details className="panel"><summary className="cursor-pointer font-bold">{ty[0]}: cách trình bày</summary><p className="small !mb-0 mt-2">{ty[1]}</p></details>
          <label className="flabel" htmlFor="wans">Câu trả lời của bạn</label>
          <textarea className="field min-h-40 resize-y leading-relaxed" id="wans" rows={7} placeholder="Viết thành câu hoàn chỉnh như khi làm bài thi" readOnly={!!r}
            value={s.answer} onChange={(e) => { const v = e.target.value; setW((x) => { x.answer = v; }); }} />
          {!r ? (
            <>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {aiOn && <button className="btn flex-1" disabled={s.busy} onClick={aiGrade}>{s.busy ? "Đang chấm…" : "Chấm bằng AI"}</button>}
                <button className={`btn flex-1 ${aiOn ? "btn-line" : ""}`} disabled={s.busy}
                  onClick={() => { if (!s.answer.trim() && !confirm("Bạn chưa viết câu trả lời. Vẫn xem đáp án?")) return; setW((x) => { x.res = { self: true, checks: [] }; }); }}>
                  Tự chấm với đáp án gợi ý
                </button>
              </div>
              {s.err && <p className="small mt-2 text-bad">{s.err}</p>}
            </>
          ) : (
            <div className="mt-3">
              {r.self && s.recorded && (
                <div className={`fb pop ${r.score! >= 7 ? "ok" : "bad"}`}>
                  <h3>Tự chấm: {comma(r.score!)}/10 điểm</h3>
                  <p className="small !m-0">{r.score! >= 7 ? "Đạt yêu cầu. Đọc lại đáp án gợi ý để trau chuốt cách diễn đạt." : "Đối chiếu các ý còn thiếu bên dưới, lần sau viết đủ các bước."}</p>
                </div>
              )}
              {r.ai && (
                <div className={`fb pop ${r.score! >= 7 ? "ok" : "bad"}`}>
                  <h3>{comma(r.score!)}/10 điểm</h3>
                  {!!r.dat?.length && <><p className="small mb-0.5 mt-1.5 font-bold">Đã làm tốt</p>{r.dat.map((x, i) => <p key={i} className="small !m-0">✓ {x}</p>)}</>}
                  {!!r.thieu?.length && <><p className="small mb-0.5 mt-2 font-bold">Cần bổ sung hoặc sửa</p>{r.thieu.map((x, i) => <p key={i} className="small !m-0">• {x}</p>)}</>}
                  {r.sua && <><p className="small mb-0.5 mt-2 font-bold">Gợi ý viết lại từ bài của bạn</p><p className="small !m-0">{r.sua}</p></>}
                </div>
              )}
              <div className="panel">
                <h3>Ý cần có</h3>
                {Qn.points.map((pt, i) => r.self && !s.recorded ? (
                  <label key={i} className="flex cursor-pointer items-start gap-2.5 py-1.5">
                    <input type="checkbox" className="mt-0.5 h-5 w-5 accent-[var(--accent)]" checked={!!r.checks[i]} onChange={(e) => { const v = e.target.checked; setW((x) => { x.res!.checks[i] = v; }); }} />
                    <span className="small">{pt}</span>
                  </label>
                ) : <p key={i} className="small !mb-1">• {pt}</p>)}
                <h3 className="mt-3">Đáp án gợi ý</h3>
                <p className="small !m-0">{Qn.model}</p>
              </div>
              {r.self && !s.recorded ? (
                <button className="btn w-full" onClick={() => {
                  const n = Qn.points.length, c = r.checks.filter(Boolean).length, sc = Math.round((c / n) * 20) / 2;
                  setW((x) => { x.res!.score = sc; }); writeRecord(sc); toast(`Đạt ${c}/${n} ý (${comma(sc)} điểm)`);
                }}>Ghi nhận số ý đã đạt</button>
              ) : (
                <button className="btn w-full" onClick={() => {
                  if (s.qi + 1 < P.qs.length) startWrite(P.id, s.qi + 1);
                  else { useApp.setState({ ses: null }); setUI({ learnSub: "Ngữ văn" }); router.push("/hoc"); }
                }}>{s.qi + 1 < P.qs.length ? "Câu tiếp theo" : "Xong"}</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
