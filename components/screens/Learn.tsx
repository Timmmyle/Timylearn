"use client";
import { MathText } from "@/components/MathText";
import { useApp, startSession } from "@/lib/store";
import { toast } from "@/lib/toast";
import { LEN, LV, TOP, TOPICS, WKEY } from "@/lib/data/curriculum";

const TOPICS_SUBS = new Set(TOPICS.map((t) => t.s));
import {
  dueMistakes, getQ, gradeLabel, learnSubjects, nextStep, pct, pickPool, planText, qOfTopics, roadmap, routeTitle, scopeTopics, topicStat, weakestIn, writeList,
} from "@/lib/logic";
import WritePanel, { startWrite } from "../WritePanel";
import { useState } from "react";
import { loadRandom, useRemote } from "@/lib/remote";

export function startTopic(k: string) {
  if (k === WKEY) { const S = useApp.getState().S; const pick = writeList(S)[0]; if (pick) startWrite(pick.id, 0); return; }
  const t = TOP[k];
  startSession("practice", qOfTopics([k]), t ? t.t : "Luyện tập");
}
export function startReview(all = false) {
  const S = useApp.getState().S;
  const ids = all ? Object.keys(S.mistakes).filter((id) => getQ(S, id)) : dueMistakes(S);
  if (!ids.length) { toast("Chưa có câu nào đến hạn ôn hôm nay"); return; }
  startSession("review", ids, "Ôn lỗi sai");
}

export default function Learn() {
  const S = useApp((s) => s.S);
  const ui = useApp((s) => s.ui);
  const setUI = useApp((s) => s.setUI);
  const r = roadmap(S), nx = nextStep(S), done = r.filter((t) => topicStat(S, t.k).st === "done").length;
  const due = dueMistakes(S).length, total = Object.keys(S.mistakes).length;
  const remoteCounts = useRemote((r) => r.counts);
  const [rBusy, setRBusy] = useState(false);
  const subs = learnSubjects(S);
  const sub = ui.learnSub && subs.includes(ui.learnSub) ? ui.learnSub : subs[0];
  const tps = scopeTopics(S, sub, ui.learnScope);
  const pool = qOfTopics(tps.map((t) => t.k));
  const gl = gradeLabel(S);
  let lastHead = "";

  return (
    <>
      <div className="panel mt-3.5">
        <h3>Lộ trình: {routeTitle(S)}</h3>
        <p className="small muted !mb-2">{gl.charAt(0).toUpperCase() + gl.slice(1)}, {done}/{r.length} chủ đề đã vững (đúng từ 80% trên ít nhất 5 câu).</p>
        <div className="bar"><i style={{ width: (r.length ? (done / r.length) * 100 : 0) + "%" }} /></div>
        <p className="small my-2.5">{planText(S, r)}</p>
        {nx && <button className="btn w-full" onClick={() => startTopic(nx.k)}>Học tiếp: {nx.s}, {nx.t}</button>}
        {!r.length && <p className="small !m-0">Chưa có chủ đề nào trong lộ trình. Kiểm tra lớp, kỳ thi và môn trong Cài đặt.</p>}
      </div>

      <div className="panel">
        <h3>Sổ lỗi sai</h3>
        <p className="small muted !m-0">
          {total ? `${total} câu trong sổ, ${due} câu cần ôn hôm nay. Đúng 3 lần liên tiếp (cách nhau 1 và 3 ngày) thì câu được gỡ khỏi sổ.` : "Câu bạn làm sai khi luyện tập hoặc đấu sẽ tự vào đây."}
          {S.graduated ? ` Đã gỡ ${S.graduated} câu.` : ""}
        </p>
        <div className="mt-2.5 flex gap-2.5">
          <button className="btn btn-ghost flex-1" disabled={!due} onClick={() => startReview()}>Ôn {due || ""} câu đến hạn</button>
          <button className="btn btn-line" disabled={!total} onClick={() => startReview(true)}>Ôn tất cả</button>
        </div>
      </div>

      <h2>Theo môn</h2>
      <div className="seg mb-2">
        {subs.map((s) => <button key={s} aria-pressed={s === sub} onClick={() => setUI({ learnSub: s })}>{s}</button>)}
      </div>
      <label className="flabel !mt-1">Phạm vi</label>
      <div className="seg">
        {([["route", "Theo lộ trình"], ["grade", "Cả năm " + (S.profile.grade === "free" ? "lớp 12" : gl)], ["all", "Lớp 10–12"]] as const).map(([k, l]) => (
          <button key={k} aria-pressed={ui.learnScope === k} onClick={() => setUI({ learnScope: k })}>{l}</button>
        ))}
      </div>

      {(remoteCounts[sub] || 0) > 0 && (
        <div className="panel mt-3">
          <h3>Luyện câu hỏi từ đề thi thật</h3>
          <p className="small muted">{remoteCounts[sub]} câu {sub} lấy từ đề thi tốt nghiệp THPT các năm và đề ôn luyện, có lời giải. Mỗi lượt lấy ngẫu nhiên 15 câu.</p>
          <button className="btn w-full" disabled={rBusy} onClick={async () => {
            setRBusy(true);
            try { const qs = await loadRandom(sub, 15); if (!qs.length) toast("Chưa lấy được câu hỏi"); else startSession("practice", qs.map((q) => q.id), "Đề thật: " + sub); }
            catch { toast("Chưa tải được câu hỏi. Kiểm tra kết nối mạng."); }
            setRBusy(false);
          }}>{rBusy ? "Đang lấy câu hỏi…" : "Luyện 15 câu đề thật"}</button>
        </div>
      )}
      {!tps.length ? (
        <div className="panel mt-3"><p className="!m-0">{remoteCounts[sub] && !TOPICS_SUBS.has(sub) ? `Lý thuyết môn ${sub} chưa có trong app. Luyện bằng câu hỏi đề thi thật ở trên.` : `${sub} chưa có chủ đề nào trong phạm vi này. Chọn phạm vi khác${!S.profile.subjects.includes(sub) ? " hoặc thêm môn này trong Cài đặt" : ""}.`}</p></div>
      ) : (
        <>
          {sub === "Ngữ văn" && <WritePanel />}
          <div className="panel mt-3">
            <h3>{sub === "Ngữ văn" ? "Trắc nghiệm thực hành tiếng Việt" : "Luyện tập nhanh"}</h3>
            <p className="small muted">{pool.length} câu trong phạm vi. Câu khó thì ít câu hơn để thời gian mỗi phiên gần bằng nhau. Đáp án được trộn mỗi lần làm.</p>
            <div className="flex flex-wrap gap-2.5">
              {[1, 2, 3].map((l) => (
                <button key={l} className={`btn flex-1 ${l === 2 ? "" : "btn-ghost"}`}
                  onClick={() => startSession("practice", pickPool(S, pool, l), "Luyện tập " + sub)}>
                  {LV[l]}: {Math.min(LEN[l], pool.length)} câu
                </button>
              ))}
            </div>
            <button className="btn btn-line mt-2.5 w-full"
              onClick={() => { const w = weakestIn(S, tps).slice(0, 2); startSession("practice", qOfTopics(w.map((t) => t.k)), "Phần yếu nhất"); }}>
              Luyện phần yếu nhất
            </button>
          </div>

          <h2>Ôn lý thuyết</h2>
          <div className="panel">
            {tps.map((t) => {
              const s = topicStat(S, t.k); const a = s.t ? pct(s.c, s.t) : null;
              const head = t.g ? `Lớp ${t.g}, học kì ${t.hk}` : "Kỹ năng dùng cho mọi lớp";
              const showHead = head !== lastHead; const first = !lastHead; lastHead = head;
              const col = s.st === "done" ? "var(--green)" : s.st === "doing" ? ((a ?? 0) >= 50 ? "var(--yellow)" : "var(--red)") : "var(--line)";
              return (
                <div key={t.k}>
                  {showHead && <p className="small muted font-bold" style={{ margin: `${first ? 0 : 14}px 0 4px` }}>{head}</p>}
                  <details className="topic">
                    <summary className="flex cursor-pointer items-center gap-2.5">
                      <span className="dot" style={{ background: col }} />
                      <span className="flex-1"><b>{t.t}</b><br />
                        <span className="small muted">{s.st === "done" ? "Đã vững, " : ""}{a === null ? "Chưa luyện" : a + "% đúng, " + s.t + " câu"}</span>
                      </span>
                      <span className="w-16 flex-none"><span className="bar block"><i style={{ width: (a || 0) + "%" }} /></span></span>
                    </summary>
                    <div className="theory"><MathText text={t.th} /></div>
                    <button className="btn btn-ghost" onClick={() => startTopic(t.k)}>
                      {t.k === WKEY ? "Luyện viết câu trả lời" : `Luyện chủ đề này (${qOfTopics([t.k]).length} câu)`}
                    </button>
                  </details>
                </div>
              );
            })}
          </div>
          <p className="small muted">Thứ tự chương theo bộ Kết nối tri thức. Kho câu hỏi mẫu còn nhỏ; tạo thêm câu theo đúng phạm vi bằng AI trong mục Đề thi.</p>
        </>
      )}
    </>
  );
}
