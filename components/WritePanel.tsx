"use client";
import { useApp } from "@/lib/store";
import { toast } from "@/lib/toast";
import { TSHORT, TYPES, WKEY } from "@/lib/data/curriculum";
import { gradeLabel, pct, topicStat, writeList } from "@/lib/logic";
import { aiErrorText, aiJson } from "@/lib/api";
import type { WritePassage } from "@/lib/types";
import { useRemote } from "@/lib/remote";

export function startWrite(pid: string, qi: number) {
  const S = useApp.getState().S;
  const P = writeList(S).find((x) => x.id === pid); if (!P) return;
  useApp.setState({ ses: { kind: "write", p: P, qi, answer: "", res: null, busy: false } });
  window.scrollTo(0, 0);
}

async function aiNewPassage() {
  const { setUI, S, update } = useApp.getState();
  setUI({ wBusy: true, wErr: "" });
  try {
    const j = await aiJson<{ title?: string; passage?: string; questions?: { q: string; type: string; points: string[]; model: string }[] }>("passage", { gradeLabel: gradeLabel(S) });
    const qs = (Array.isArray(j.questions) ? j.questions : [])
      .filter((q) => q && q.q && Array.isArray(q.points) && q.model)
      .map((q) => ({ q: String(q.q), type: TYPES[q.type] ? q.type : "noidung", points: q.points.map(String), model: String(q.model) }));
    if (!j.passage || !qs.length) throw new Error("bad");
    const P: WritePassage = { id: "aw-" + Date.now(), ai: true, title: String(j.title || "Văn bản AI"), passage: String(j.passage), src: "Văn bản do AI sáng tác, cần giáo viên kiểm tra", qs };
    update((S) => { S.aiWrite = S.aiWrite || []; S.aiWrite.unshift(P); if (S.aiWrite.length > 6) S.aiWrite.length = 6; });
    toast("Đã tạo văn bản mới");
  } catch (e) {
    setUI({ wErr: aiErrorText(e, "Chưa tạo được văn bản. Thử lại sau.") });
  }
  setUI({ wBusy: false });
}

export default function WritePanel() {
  const S = useApp((s) => s.S);
  const ai = useApp((s) => s.ai.enabled);
  const { wBusy, wErr } = useApp((s) => s.ui);
  const update = useApp((s) => s.update);
  useRemote((r) => r.passages); // vẽ lại khi tải xong bài đọc hiểu từ kho đề
  const st = topicStat(S, WKEY);

  return (
    <div className="panel mt-3">
      <h3>Luyện trình bày bài đọc hiểu</h3>
      <p className="small muted">Viết câu trả lời như khi làm bài thật, sau đó {ai ? "cho AI chấm theo đáp án hoặc " : ""}tự chấm với đáp án gợi ý.{st.t ? ` Đã luyện ${st.t} câu, đạt ${pct(st.c, st.t)}%.` : ""}</p>
      <details className="mb-1.5">
        <summary className="cursor-pointer py-1.5 font-bold">Cách trình bày từng dạng câu hỏi</summary>
        {Object.values(TYPES).map(([n, t]) => (
          <div className="formula" key={n}><span className="small font-bold">{n}</span><p className="small !mb-0 mt-0.5">{t}</p></div>
        ))}
        <div className="formula"><span className="small font-bold">Lỗi hay gặp</span><p className="small !mb-0 mt-0.5">Trả lời cụt ý bằng gạch đầu dòng; chép lại văn bản; quên nêu tác dụng nội dung của biện pháp tu từ; viết quá dài ở câu nhận biết, quá ngắn ở câu vận dụng.</p></div>
      </details>
      {writeList(S).map((P) => (
        <div className="topic" key={P.id}>
          <b>{P.title}</b>{P.ai && <> <span className="tag tag-ai">AI</span></>}{P.remote && <> <span className="tag tag-l3">Đề thật</span></>}
          <p className="small muted mb-2 mt-0.5">{P.passage.slice(0, 90)}…</p>
          <div className="flex flex-wrap gap-2.5">
            {P.qs.map((q, i) => (
              <button key={i} className="btn btn-line btn-sm" onClick={() => startWrite(P.id, i)}>Câu {i + 1}: {TSHORT[q.type] || "Câu hỏi"}</button>
            ))}
            {P.ai && <button className="btn btn-line btn-sm" onClick={() => update((S) => { S.aiWrite = (S.aiWrite || []).filter((x) => x.id !== P.id); })}>Xóa</button>}
          </div>
        </div>
      ))}
      {ai && (
        <>
          <button className="btn btn-ghost mt-3 w-full" disabled={wBusy} onClick={aiNewPassage}>{wBusy ? "Đang soạn văn bản mới…" : "Tạo văn bản đọc hiểu mới bằng AI"}</button>
          {wErr && <p className="small !mb-0 mt-2 text-bad">{wErr}</p>}
        </>
      )}
    </div>
  );
}
