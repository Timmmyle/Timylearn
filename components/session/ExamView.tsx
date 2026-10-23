"use client";
import Ctx from "./Ctx";
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
  // Đề ĐGNL chia theo phần thi (sec); đề THPT/kiểm tra chia theo dạng câu (Phần I/II/III)
  const bySec = s.items.some((x) => x.sec);
  const keyOf = (x: (typeof s.items)[number]) => (bySec ? x.sec || "" : qtype(x));
  const multiPart = bySec || s.items.some((x) => qtype(x) !== "mcq");
  const numInPart = (i: number) => s.items.slice(0, i + 1).filter((x) => keyOf(x) === keyOf(s.items[i])).length;
  const groups: string[] | null = multiPart ? [...new Set(s.items.map(keyOf))] : null;
  const label = (k: string) => (bySec ? k : PART[k as "mcq"]);
  const TYPE_NOTE: Record<string, string> = { tf: "Đúng/Sai: chọn Đúng hoặc Sai cho từng ý", short: "Điền đáp án là số" };

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
          <p className="small muted !mb-0 mt-2 font-semibold">{label(k)}</p>
          <div className="navgrid !mt-1" aria-label={label(k)}>{s.items.map((x, i) => (keyOf(x) === k ? cell(i) : null))}</div>
        </div>
      )) : <div className="navgrid" aria-label="Danh sách câu">{s.items.map((_, i) => cell(i))}</div>}
      <p className="small muted !mb-0 mt-2.5">{multiPart ? `${label(keyOf(q))} – câu ${numInPart(s.i)}` : `Câu ${s.i + 1}/${n}`}{bySec && t !== "mcq" ? ` · ${TYPE_NOTE[t]}` : ""}</p>
      <Ctx key={q.id} text={q.ctx} />
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
