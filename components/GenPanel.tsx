"use client";
/* Đề tự sinh theo ma trận + luyện theo dạng (Toán, Vật lí, Hóa học – HK1, HK2 lớp 10–12).
   Bộ dạng bài khá nặng nên chỉ tải khi người dùng bấm. */
import { useState } from "react";
import { useApp, startSession } from "@/lib/store";
import { remember } from "@/lib/remote";
import { examSeason, gradeNum } from "@/lib/logic";
import { toast } from "@/lib/toast";

const SUBS = ["Toán", "Vật lí", "Hóa học"] as const;
type Sub = (typeof SUBS)[number];
const STR: Record<Sub, string> = { "Toán": "12 trắc nghiệm, 4 Đúng/Sai, 6 trả lời ngắn · 90 phút", "Vật lí": "18 trắc nghiệm, 4 Đúng/Sai, 6 trả lời ngắn · 50 phút", "Hóa học": "18 trắc nghiệm, 4 Đúng/Sai, 6 trả lời ngắn · 50 phút" };
const LV = ["", "Nhận biết", "Thông hiểu", "Vận dụng"];
const KIND: Record<string, string> = { mcq: "Trắc nghiệm", tf: "Đúng/Sai", short: "Trả lời ngắn" };
type Cat = { chapter: string; half: 1 | 2; items: { id: string; topic: string; level: number; kind: string }[] }[];

const load = () => import("@/lib/gen/build");

export default function GenPanel({ ef }: { ef: { exam: string; grade: string; subject: string } }) {
  const S = useApp((s) => s.S);
  const [busy, setBusy] = useState<string | null>(null);
  const [cat, setCat] = useState<{ key: string; data: Cat } | null>(null);
  const grade = /^1[0-2]$/.test(ef.grade) ? +ef.grade : Math.min(12, Math.max(10, gradeNum(S)));
  const subs: Sub[] = (SUBS as readonly string[]).includes(ef.subject) ? [ef.subject as Sub] : ef.subject === "Tất cả" ? [...SUBS] : [];
  const season = examSeason();
  type Ex = "gk1" | "ck1" | "gk2" | "ck2";
  const EXS: Ex[] = ["gk1", "ck1", "gk2", "ck2"];
  const exam: Ex | null = (EXS as string[]).includes(ef.exam) ? (ef.exam as Ex) : ef.exam === "Tất cả" ? (season?.exam || "gk1") : null;
  if (!subs.length) return null;
  if (!exam) return (
    <div className="panel !mt-4"><p className="small !m-0">Đề tự sinh có cho <b>giữa kì, cuối kì học kì 1 và học kì 2</b> (Toán, Vật lí, Hóa học lớp 10–12). Chọn một kì kiểm tra để tạo đề.</p></div>
  );
  const hk = exam.endsWith("2") ? 2 : 1;
  const en = { gk1: "giữa học kì 1", ck1: "cuối học kì 1", gk2: "giữa học kì 2", ck2: "cuối học kì 2" }[exam];

  const makeExam = async (s: Sub) => {
    setBusy(s);
    try {
      const G = await load();
      const x = G.buildExam(s, grade, exam);
      if (!x.questions.length) { toast("Chưa có dạng bài cho lựa chọn này"); return; }
      remember(x.questions);
      startSession("exam", x.questions.map((q) => q.id), x.title, { durationMin: x.minutes, keepOrder: true });
    } catch { toast("Chưa tạo được đề, thử lại nhé"); } finally { setBusy(null); }
  };
  const practice = async (id: string, topic: string) => {
    setBusy(id);
    try {
      const G = await load();
      const qs = G.practiceSet(id, 5);
      remember(qs);
      startSession("practice", qs.map((q) => q.id), "Luyện dạng: " + topic);
    } finally { setBusy(null); }
  };
  const openCat = async (s: Sub) => {
    const key = s + grade + "-" + hk;
    if (cat?.key === key) return;
    const G = await load();
    setCat({ key, data: G.catalog(s, grade, hk) as Cat });
  };

  return (
    <>
      <h2>Đề tự sinh theo ma trận – {en} lớp {grade}</h2>
      <p className="small muted !mt-[-4px]">Mỗi lần bấm là một đề mới: máy chọn dạng bài theo ma trận đề kiểm tra (khoảng 40% nhận biết, 30% thông hiểu, 30% vận dụng), đổi số liệu và cách hỏi, đáp án do máy tính nên luôn khớp số liệu.</p>
      <div className="grid gap-x-3 lg:grid-cols-3">
        {subs.map((s) => (
          <div className="panel flex flex-col" key={s}>
            <h3>{s} {grade}</h3>
            <p className="small muted !mb-2 flex-1">{STR[s]}</p>
            <button className="btn btn-gold w-full" disabled={busy === s} onClick={() => makeExam(s)}>{busy === s ? "Đang tạo đề…" : "Tạo đề mới"}</button>
            <details className="mt-2" onToggle={(e) => { if ((e.target as HTMLDetailsElement).open) openCat(s); }}>
              <summary className="small cursor-pointer py-1 underline underline-offset-4">Luyện từng dạng bài</summary>
              {cat?.key === s + grade + "-" + hk ? cat.data.map((c) => (
                <div key={c.chapter} className="mt-2">
                  <p className="small !mb-1 font-semibold">{c.chapter}{c.half === 2 ? " · chỉ cuối kì" : ""}</p>
                  {c.items.map((it) => (
                    <button key={it.id} className="read flex w-full items-center gap-2 border-t border-line py-1.5 text-left text-[13px] hover:text-accent disabled:opacity-50" disabled={busy === it.id} onClick={() => practice(it.id, it.topic)}>
                      <span className="flex-1">{it.topic}</span>
                      <span className="muted flex-none">{KIND[it.kind]} · {LV[it.level]}</span>
                    </button>
                  ))}
                </div>
              )) : <p className="small muted !my-2">Đang tải…</p>}
            </details>
          </div>
        ))}
      </div>
    </>
  );
}
