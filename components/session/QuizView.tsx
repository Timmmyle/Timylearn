"use client";
import { MathText } from "@/components/MathText";
import { QImage } from "@/components/QImage";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { LV, TOP } from "@/lib/data/curriculum";
import { gradeLabel } from "@/lib/logic";
import { aiErrorText, aiStream } from "@/lib/api";
import { answerText, answered, isCorrect, PART, pickText, points, qtype } from "@/lib/grading";
import type { QuizSession } from "@/lib/types";
import { answer, checkCurrent, nextQ, SesTop, setPick } from "./SessionView";
import { ShortInput, TFInput } from "./QTypes";

import ReportButton from "./Report";

export default function QuizView() {
  const s = useApp((st) => st.ses) as QuizSession;
  const aiOn = useApp((st) => st.ai.enabled);
  const q = s.items[s.i], pk = s.picks[s.i], n = s.items.length, tp = TOP[q.s + "|" + q.t];
  const t = qtype(q);
  const done = t === "mcq" ? pk !== null : !!s.checked?.[s.i];
  const ok = done && isCorrect(q, pk);
  const tfPts = t === "tf" && done ? points(q, pk).got : 0;

  return (
    <div key={s.i}>
      <SesTop>
        <div className="flex-1"><div className="bar"><i style={{ width: ((s.i + (done ? 1 : 0)) / n) * 100 + "%" }} /></div></div>
        <span className="small muted">{s.i + 1}/{n}</span>
      </SesTop>
      <div className="flex flex-wrap gap-2">
        <span className="tag">{q.s}: {q.t}</span>
        {tp && tp.g ? <span className="tag">Lớp {tp.g}</span> : null}
        {t !== "mcq" && <span className="tag tag-l1">{t === "tf" ? "Đúng/Sai" : "Trả lời ngắn"}</span>}
        <span className={`tag ${q.l === 1 ? "tag-l1" : q.l === 3 ? "tag-l3" : ""}`}>{LV[q.l]}</span>
        {q.ai && <span className="tag tag-ai">Câu hỏi AI</span>}
        {s.kind === "review" && <span className="tag tag-l3">Ôn lỗi sai</span>}
      </div>
      <div className="qtext"><MathText text={q.q} /></div>
      <QImage src={q.img} alt="Hình minh họa đề bài" />

      {t === "mcq" && q.opts.map((o, i) => {
        const c = pk !== null ? (i === q.ans ? "ok" : i === pk ? "bad" : "") : "";
        return (
          <button key={i} className={`opt ${c}`} disabled={pk !== null} onClick={() => answer(i)}>
            <span className="k">{"ABCD"[i]}</span><MathText text={o} />
          </button>
        );
      })}
      {t === "tf" && <TFInput q={q} value={pk} onChange={setPick} reveal={done} />}
      {t === "short" && <ShortInput q={q} value={pk} onChange={setPick} reveal={done} onEnter={() => answered(q, pk) && checkCurrent()} />}
      {t !== "mcq" && !done && (
        <button className="btn mt-1 w-full" disabled={!answered(q, pk)} onClick={checkCurrent}>
          {answered(q, pk) ? "Kiểm tra" : t === "tf" ? "Chọn Đúng hoặc Sai cho cả 4 ý" : "Nhập đáp số"}
        </button>
      )}

      {done && (
        <>
          <div className={`fb pop ${ok ? "ok" : "bad"}`} role="status">
            <h3>{ok ? "Chính xác! +10 XP" : t === "tf" ? `Đúng ${q.st ? q.st.filter((x, i) => Array.isArray(pk) && pk[i] === x.a).length : 0}/4 ý (${String(tfPts).replace(".", ",")} điểm theo cách chấm của Bộ)` : "Chưa đúng. Đáp án: " + answerText(q)}</h3>
            {q.e && <p className="!m-0 whitespace-pre-wrap"><MathText text={q.e} /></p>}
            <QImage src={q.imgA} alt="Hình minh họa lời giải" />
            {!ok && s.kind !== "review" && <p className="small muted !mb-0 mt-2">Đã thêm vào sổ lỗi sai.</p>}
            {!ok && aiOn && <AiExplain />}
            <ReportButton i={s.i} q={q} pick={pk} />
          </div>
          <button className="btn w-full" onClick={nextQ}>{s.i + 1 < n ? "Câu tiếp theo" : "Xem kết quả"}</button>
        </>
      )}
      {t !== "mcq" && <p className="small muted mt-3">{PART[t]}{t === "tf" ? ": đúng 1 ý 0,1 điểm · 2 ý 0,25 · 3 ý 0,5 · 4 ý 1 điểm." : q.s === "Toán" ? ": 0,5 điểm/câu." : ": 0,25 điểm/câu."}</p>}
    </div>
  );
}

function AiExplain() {
  const s = useApp((st) => st.ses) as QuizSession;
  const S = useApp((st) => st.S);
  const saved = s.aiex?.[s.i];
  const [text, setText] = useState<string | null>(saved || null);
  if (text !== null) return <div className="aiex"><MathText text={text} /></div>;

  const run = async () => {
    const q = s.items[s.i], pk = s.picks[s.i], tp = TOP[q.s + "|" + q.t], idx = s.i, t = qtype(q);
    const options = t === "mcq" ? q.opts.map((o, i) => "ABCD"[i] + ". " + o).join(" | ") : t === "tf" ? (q.st || []).map((x, i) => "abcd"[i] + ") " + x.t).join(" | ") + " (Đúng/Sai từng ý)" : "(câu trả lời ngắn, điền số)";
    setText("Đang giải thích…");
    try {
      const full = await aiStream("explain", {
        gradeLabel: gradeLabel(S), subject: q.s, topic: q.t, grade: tp?.g || 0, question: q.q,
        options, picked: pickText(q, pk), correct: answerText(q), solution: q.e,
      }, (t) => setText(t));
      useApp.getState().act((_S, ses) => { const x = ses as QuizSession; if (x) { x.aiex = x.aiex || {}; x.aiex[idx] = full; } });
    } catch (e) { setText(aiErrorText(e, "Chưa giải thích được. Thử lại sau.")); }
  };
  return <div className="aiex"><button className="btn btn-ghost" onClick={run}>Giải thích kỹ hơn bằng AI</button></div>;
}
