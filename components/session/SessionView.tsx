"use client";
import { ask } from "@/lib/confirm";
import { useEffect } from "react";
import { useApp, finishSession } from "@/lib/store";
import { record } from "@/lib/logic";
import { isCorrect, qtype } from "@/lib/grading";
import type { Pick } from "@/lib/types";
import type { QuizSession } from "@/lib/types";
import QuizView from "./QuizView";
import ExamView from "./ExamView";
import FightView, { fightResolve } from "./FightView";
import ResultView from "./ResultView";
import WriteView from "./WriteView";
import { Icon } from "../Icon";

export function answer(i: number) {
  useApp.getState().act((S, ses) => {
    const s = ses as QuizSession; if (!s || s.picks[s.i] !== null) return;
    s.picks[s.i] = i; const q = s.items[s.i]; record(S, q, isCorrect(q, i), s.kind);
  });
}
/** Câu Đúng/Sai, trả lời ngắn: lưu bản nháp lựa chọn */
export function setPick(v: Pick) {
  useApp.getState().act((_S, ses) => { const s = ses as QuizSession; if (s.checked?.[s.i]) return; s.picks[s.i] = v; });
}
/** Luyện tập: bấm “Kiểm tra” cho câu Đúng/Sai, trả lời ngắn */
export function checkCurrent() {
  useApp.getState().act((S, ses) => {
    const s = ses as QuizSession; s.checked = s.checked || {};
    if (s.checked[s.i]) return;
    s.checked[s.i] = true; const q = s.items[s.i]; record(S, q, isCorrect(q, s.picks[s.i]), s.kind);
  });
}
export function examPick(i: number) {
  useApp.getState().act((_S, ses) => { const s = ses as QuizSession; s.picks[s.i] = i; });
}
export function nextQ() {
  const s = useApp.getState().ses as QuizSession;
  if (s.i + 1 < s.items.length) { useApp.getState().act((_S, ses) => { (ses as QuizSession).i++; }); window.scrollTo(0, 0); }
  else finishSession();
}
export async function quit() {
  const { ses, update } = useApp.getState(); if (!ses) return;
  if ((ses.kind === "exam" || ses.kind === "fight") && !(ses as QuizSession).done && !(await ask({ title: "Thoát bài?", msg: "Thoát bây giờ? Kết quả lượt này sẽ không được tính.", ok: "Thoát", cancel: "Ở lại", danger: true, icon: "warn" }))) return;
  if (useApp.getState().ses !== ses) return;
  if (ses.kind === "diag") update((S) => { S.onboarded = true; });
  useApp.setState({ ses: null });
}

export function SesTop({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-10 -mx-4 flex items-center gap-2.5 bg-paper px-4 py-2.5 pt-safe">
      <button className="iconbtn" onClick={quit} aria-label="Thoát"><Icon name="x" /></button>
      {children}
    </div>
  );
}

export default function SessionView() {
  const ses = useApp((s) => s.ses)!;

  // Phím tắt A/B/C/D trên máy tính
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useApp.getState().ses as QuizSession | null;
      if (!s || s.done || (s.kind as string) === "write") return;
      const t = e.target as HTMLElement; if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      const i = "ABCD".indexOf(e.key.toUpperCase()); if (i < 0) return;
      if (qtype(s.items[s.i]) !== "mcq") return;
      if (s.kind === "fight") { if (!s.reveal) fightResolve(i); }
      else if (s.kind === "exam") examPick(i);
      else if (s.picks[s.i] === null) answer(i);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (ses.kind === "write") return <WriteView />;
  const s = ses as QuizSession;
  if (s.done) return <ResultView />;
  if (s.kind === "fight") return <FightView />;
  if (s.kind === "exam") return <ExamView />;
  return <QuizView />;
}

export { finishSession };
