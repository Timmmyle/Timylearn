"use client";
import { MathText } from "@/components/MathText";
import { QImage } from "@/components/QImage";
import { useEffect, useState } from "react";
import { useApp, finishSession } from "@/lib/store";
import { BOTS } from "@/lib/data/curriculum";
import { record } from "@/lib/logic";
import type { QuizSession } from "@/lib/types";
import { SesTop } from "./SessionView";

const LIMIT = 20; // giây mỗi câu
let qStart = 0;

/** Chốt câu trả lời (pick = null khi hết giờ) rồi tự sang câu sau */
export function fightResolve(pick: number | null) {
  const cur = useApp.getState().ses as QuizSession;
  if (!cur || cur.kind !== "fight" || cur.reveal || cur.done) return;
  const el = Math.min(LIMIT, (performance.now() - qStart) / 1000);
  useApp.getState().act((S, ses) => {
    const s = ses as QuizSession; const q = s.items[s.i];
    s.picks[s.i] = pick; const ok = pick === q.ans, pts = ok ? 100 + Math.round((50 * (LIMIT - el)) / LIMIT) : 0;
    s.me! += pts; s.myRes![s.i] = { ok, pts };
    const bp = s.botPlan![s.i]; s.bot! += bp.ok ? 100 + Math.round((50 * (LIMIT - bp.t)) / LIMIT) : 0; s.botRes![s.i] = bp;
    record(S, q, ok, "fight"); s.reveal = true;
  });
  const id = cur.start;
  setTimeout(() => {
    const s = useApp.getState().ses as QuizSession;
    if (!s || s.start !== id) return;
    if (s.i + 1 < s.items.length) useApp.getState().act((_S, ses) => { const x = ses as QuizSession; x.reveal = false; x.i++; });
    else { useApp.getState().act((_S, ses) => { (ses as QuizSession).reveal = false; }); finishSession(); }
  }, 1700);
}

export default function FightView() {
  const s = useApp((st) => st.ses) as QuizSession;
  const q = s.items[s.i], n = s.items.length, b = BOTS[s.botLv!], rv = s.reveal;
  const [el, setEl] = useState(0);

  useEffect(() => {
    if (rv) return;
    qStart = performance.now(); setEl(0);
    const id = setInterval(() => {
      const e = (performance.now() - qStart) / 1000; setEl(e);
      if (e >= LIMIT) { clearInterval(id); fightResolve(null); }
    }, 100);
    return () => clearInterval(id);
  }, [s.i, rv]);

  const bt = s.botPlan![s.i];
  const botText = rv ? (s.botRes![s.i].ok ? `${b.n} trả lời đúng sau ${s.botRes![s.i].t.toFixed(1)} giây` : `${b.n} trả lời sai`) : el >= bt.t ? b.n + " đã trả lời" : b.n + " đang suy nghĩ…";
  const m = s.myRes![s.i];

  return (
    <>
      <SesTop><b className="flex-1">Câu {s.i + 1}/{n}</b><span className="small muted">{q.s}</span></SesTop>
      <div className="arena">
        <div className="hud">
          <div><div className="text-[13px] opacity-75">Bạn</div><div className="score">{s.me}</div></div>
          <div className="font-display text-[15px] font-bold opacity-60">VS</div>
          <div className="text-right"><div className="text-[13px] opacity-75">{b.n}</div><div className="score">{s.bot}</div></div>
        </div>
        <div className="tbar"><i style={{ width: (rv ? 0 : Math.max(0, 100 - (el / LIMIT) * 100)) + "%" }} /></div>
        <div className="min-h-5 text-[13px] opacity-80">{botText}</div>
        <div className="qtext"><MathText text={q.q} /></div>
        <QImage src={q.img} alt="Hình minh họa đề bài" />
        {q.opts.map((o, i) => {
          const c = rv ? (i === q.ans ? "ok" : i === s.picks[s.i] ? "bad" : "") : "";
          return (
            <button key={i} className={`opt ${c}`} disabled={rv} onClick={() => fightResolve(i)}>
              <span className="k">{"ABCD"[i]}</span><MathText text={o} />
            </button>
          );
        })}
        {rv && m && <p className="pop !mb-0 mt-1 font-bold">{m.pts ? `+${m.pts} điểm` : s.picks[s.i] === null ? "Hết giờ" : "Sai rồi, 0 điểm"}</p>}
      </div>
    </>
  );
}
