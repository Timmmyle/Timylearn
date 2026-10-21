"use client";
import { ask } from "@/lib/confirm";
import { MathText } from "@/components/MathText";
import { QImage } from "@/components/QImage";
import { useEffect, useState } from "react";
import { useApp, finishSession } from "@/lib/store";
import { answered as isAnswered, PART, qtype, touched } from "@/lib/grading";
import type { Pick, QuizSession } from "@/lib/types";
import { examPick, SesTop } from "./SessionView";
import { ShortInput, TFInput } from "./QTypes";

export default function ExamView() {
  const s = useApp((st) => st.ses) as QuizSession;
  const act = useApp((st) => st.act);
  const q = s.items[s.i], n = s.items.length, t = qtype(q);
  const [left, setLeft] = useState(() => Math.max(0, (s.end || 0) - Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      const l = Math.max(0, (s.end || 0) - Date.now()); setLeft(l);
      if (l <= 0) { clearInterval(id); finishSession(); }
    }, 500);
    return () => clearInterval(id);
  }, [s.end]);

  const go = (i: number) => { if (i >= 0 && i < n) act((_S, ses) => { (ses as QuizSession).i = i; }); window.scrollTo(0, 0); };
  const setV = (v: Pick) => act((_S, ses) => { const x = ses as QuizSession; x.picks[x.i] = v; });
  const answered = s.items.filter((qq, i) => isAnswered(qq, s.picks[i])).length;
  const multiPart = s.items.some((x) => qtype(x) !== "mcq");
  // Số thứ tự câu trong từng phần (Phần I câu 1…, Phần II câu 1…)
  const numInPart = (i: number) => s.items.slice(0, i + 1).filter((x) => qtype(x) === qtype(s.items[i])).length;
  const groups = multiPart ? (["mcq", "tf", "short"] as const).filter((k) => s.items.some((x) => qtype(x) === k)) : null;

  const cell = (i: number) => {
    const v = s.picks[i], full = isAnswered(s.items[i], v), part = !full && touched(v);
    return (
      <button key={i} className={`${full ? "done" : ""} ${i === s.i ? "cur" : ""} ${part ? "!border-dashed !border-accent" : ""}`} onClick={() => go(i)}
        aria-label={`Câu ${i + 1}${full ? ", đã làm" : part ? ", làm dở" : ""}`}>{multiPart ? numInPart(i) : i + 1}</button>
    );
  };

  return (
    <>
      <SesTop>
        <b className="flex-1 truncate">{s.title}</b>
        <span className={`chip tabular-nums ${left < 60000 ? "text-bad" : ""}`}>{Math.floor(left / 60000)}:{String(Math.floor(left / 1000) % 60).padStart(2, "0")}</span>
      </SesTop>
      {groups ? groups.map((k) => (
        <div key={k}>
          <p className="small muted !mb-0 mt-2 font-semibold">{PART[k]}</p>
          <div className="navgrid !mt-1" aria-label={PART[k]}>{s.items.map((x, i) => (qtype(x) === k ? cell(i) : null))}</div>
        </div>
      )) : <div className="navgrid" aria-label="Danh sách câu">{s.items.map((_, i) => cell(i))}</div>}
      <p className="small muted !mb-0 mt-2.5">{multiPart ? `${PART[t]} – câu ${numInPart(s.i)}` : `Câu ${s.i + 1}/${n}`}</p>
      <div className="qtext"><MathText text={q.q} /></div>
      <QImage src={q.img} alt="Hình minh họa đề bài" />
      {t === "mcq" && q.opts.map((o, i) => (
        <button key={i} className={`opt ${s.picks[s.i] === i ? "sel" : ""}`} onClick={() => examPick(i)}>
          <span className="k">{"ABCD"[i]}</span><MathText text={o} />
        </button>
      ))}
      {t === "tf" && <TFInput q={q} value={s.picks[s.i]} onChange={setV} />}
      {t === "short" && <ShortInput q={q} value={s.picks[s.i]} onChange={setV} onEnter={() => go(s.i + 1)} />}
      <div className="mt-2 flex gap-2.5">
        <button className="btn btn-line" disabled={s.i === 0} onClick={() => go(s.i - 1)}>Câu trước</button>
        <button className="btn btn-line flex-1" disabled={s.i === n - 1} onClick={() => go(s.i + 1)}>Câu sau</button>
      </div>
      <button className="btn mt-2.5 w-full" onClick={async () => {
        const rest = n - answered;
        if (rest && !(await ask({ title: "Nộp bài?", msg: `Còn ${rest} câu chưa làm xong. Vẫn nộp bài?`, ok: "Nộp bài", cancel: "Làm tiếp", icon: "warn" }))) return;
        finishSession();
      }}>Nộp bài ({answered}/{n} câu đã làm)</button>
    </>
  );
}
