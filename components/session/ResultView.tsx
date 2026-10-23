"use client";
import { MathText, clipMath } from "@/components/MathText";
import { QImage } from "@/components/QImage";
import { examScore, isCorrect, points, qtype } from "@/lib/grading";
import { ShortInput, TFInput } from "./QTypes";
import { useRouter } from "next/navigation";
import { useApp, startSession } from "@/lib/store";
import { BOTS } from "@/lib/data/curriculum";
import { comma } from "@/lib/logic";
import type { QuizSession } from "@/lib/types";
import { Icon } from "../Icon";
import { startFight } from "../screens/Fight";
import { useGame } from "@/lib/game";
import { Coin } from "../Icon";
import ReportButton from "./Report";

export default function ResultView() {
  const s = useApp((st) => st.ses) as QuizSession;
  const S = useApp((st) => st.S);
  const router = useRouter();
  const n = s.items.length, c = s.items.filter((q, i) => isCorrect(q, s.picks[i])).length;
  const wrong = s.items.filter((q, i) => !isCorrect(q, s.picks[i]));
  const score = examScore(s.items, s.picks);
  const multi = s.items.some((q) => qtype(q) !== "mcq");
  const secStats = [...new Set(s.items.map((q) => q.sec).filter(Boolean) as string[])].map((k) => { const idx = s.items.map((q, i) => (q.sec === k ? i : -1)).filter((i) => i >= 0); return { k, n: idx.length, c: idx.filter((i) => isCorrect(s.items[i], s.picks[i])).length }; });
  const reward = useGame((g) => (g.lastReward && g.lastReward.ref === String(s.start) ? g.lastReward.coins : null));
  const gReady = useGame((g) => g.status === "ready");

  return (
    <div className="pt-safe">
      <div className="pt-[22px]">
        {s.kind === "fight" ? (
          <div className="arena text-center">
            <div className="my-1.5 font-display text-[44px] font-bold leading-tight">{s.res === 1 ? "Chiến thắng!" : s.res === 0.5 ? "Hòa" : "Thua rồi"}</div>
            <p className="opacity-80">{s.me} – {s.bot} trước {BOTS[s.botLv!].n}</p>
            <p className="!m-0 font-bold">Xếp hạng {s.delta! >= 0 ? "+" : ""}{s.delta} ({S.fight.rating}){s.res === 1 ? ", +50 XP" : ""}</p>
          </div>
        ) : s.kind === "exam" ? (
          <>
            <p className="muted !m-0">{s.title}</p>
            {s.scale ? (
              <div className="hero !mt-2"><span className="big">{Math.round((c / n) * s.scale)}</span><span className="unit">/ {s.scale} điểm</span>
                <p className="muted !mb-0 mt-2">{c}/{n} câu đúng. Điểm quy đổi ước tính theo tỉ lệ câu đúng; điểm thật của kỳ thi còn phụ thuộc độ khó từng câu.</p>
                {secStats.length > 1 && <ul className="small !mb-0 mt-2">{secStats.map((x) => <li key={x.k}>{x.k}: {x.c}/{x.n} câu đúng</li>)}</ul>}
              </div>
            ) : (
            <div className="hero !mt-2"><span className="big">{comma(score.toFixed(2))}</span><span className="unit">điểm</span>
              <p className="muted !mb-0 mt-2">{c}/{n} câu đúng hoàn toàn{multi ? " (điểm tính theo cách chấm của Bộ, có điểm từng phần cho câu Đúng/Sai)" : ""}, mục tiêu {comma(S.profile.target)} điểm</p></div>
            )}
          </>
        ) : (
          <div className="hero"><span className="big">{c}/{n}</span><span className="unit">câu đúng</span>
            <p className="muted !mb-0 mt-2">{s.kind === "review" ? "Câu đúng tiến thêm một bậc trong sổ lỗi sai, câu sai quay lại từ đầu." : s.kind === "diag" ? "App đã ghi nhận chủ đề bạn còn yếu. Nút “Học tiếp lộ trình” ở trang chủ sẽ dẫn bạn đi đúng thứ tự." : "+" + c * 10 + " XP"}</p>
          </div>
        )}
        {gReady && (
          <p className="chip !inline-flex mt-1 text-[18px]">
            <Coin size={18} />{reward === null ? "Đang nhận xu…" : reward > 0 ? `+${reward} xu` : s.kind !== "fight" && c === 0 ? "Trả lời đúng để nhận xu" : "Hôm nay đã nhận đủ xu cho hoạt động này"}
          </p>
        )}
        {wrong.length > 0 && s.kind !== "review" && <p className="small">{wrong.length} câu sai đã được thêm vào sổ lỗi sai để ôn lại.</p>}
        <div className="my-3 flex flex-wrap gap-2.5">
          <button className="btn flex-1" onClick={() => { useApp.setState({ ses: null }); router.push("/"); }}>{s.kind === "diag" ? "Vào app" : "Xong"}</button>
          {s.kind === "fight" && <button className="btn btn-ghost flex-1" onClick={() => { useApp.setState({ ses: null }); startFight(); }}>Đấu tiếp</button>}
          {wrong.length > 0 && s.kind !== "review" && s.kind !== "diag" && (
            <button className="btn btn-line flex-1" onClick={() => { const ids = wrong.map((q) => q.id); useApp.setState({ ses: null }); startSession("review", ids, "Ôn lỗi sai"); }}>Ôn ngay câu sai</button>
          )}
        </div>
        <h2>Xem lại bài</h2>
        {s.items.map((q, i) => {
          const pk = s.picks[i], ok = isCorrect(q, pk), t = qtype(q), pt = points(q, pk);
          return (
            <details className="panel" key={i}>
              <summary className="flex cursor-pointer items-start gap-2.5">
                <span className={`tick ${ok ? "on" : ""}`} style={ok ? undefined : { borderColor: "var(--red)", color: "var(--red)" }}>{ok ? <Icon name="check" size={16} /> : "✕"}</span>
                <span className="flex-1">Câu {i + 1}: <MathText text={clipMath(q.q, 90)} /></span>
                {multi && !s.scale && <span className="small muted flex-none tabular-nums">{comma(pt.got)}/{comma(pt.max)}đ</span>}
              </summary>
              <div className="mt-2.5">
                {q.ctx && <details className="small !mb-2"><summary className="cursor-pointer underline underline-offset-4">Xem đoạn dữ kiện</summary><p className="read mt-1 whitespace-pre-wrap"><MathText text={q.ctx} /></p></details>}
                {q.q.length > 90 && <p className="small !mb-2 whitespace-pre-wrap"><MathText text={q.q} /></p>}
                <QImage src={q.img} alt="Hình minh họa đề bài" />
                {t === "mcq" && q.opts.map((o, j) => (
                  <div key={j} className="small py-[3px]" style={j === q.ans ? { color: "var(--green)", fontWeight: 700 } : j === pk ? { color: "var(--red)" } : undefined}>
                    {"ABCD"[j]}. <MathText text={o} />{j === pk ? " (bạn chọn)" : ""}
                  </div>
                ))}
                {t === "tf" && <TFInput q={q} value={pk} onChange={() => {}} reveal />}
                {t === "short" && <ShortInput q={q} value={pk} onChange={() => {}} reveal />}
                {q.e && <p className="small muted !mb-0 mt-2 whitespace-pre-wrap"><MathText text={q.e} /></p>}
                <QImage src={q.imgA} alt="Hình minh họa lời giải" />
                {s.kind !== "fight" && <ReportButton i={i} q={q} pick={pk} />}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
