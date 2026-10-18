"use client";
import { useApp, startSession } from "@/lib/store";
import { toast } from "@/lib/toast";
import { BOTS } from "@/lib/data/curriculum";
import { fightPool, gradeLabel, learnSubjects, shuffle } from "@/lib/logic";
import { TopList } from "../game/Leaderboard";
import { league } from "@/lib/game";

export function startFight() {
  const { S, ui } = useApp.getState();
  const ids = shuffle(fightPool(S, ui.fightSub)).slice(0, 10);
  if (!ids.length) { toast("Chưa có câu hỏi phù hợp để đấu"); return; }
  startSession("fight", ids, "Đấu", { botLv: ui.bot });
}

export default function Fight() {
  const S = useApp((s) => s.S);
  const ui = useApp((s) => s.ui);
  const setUI = useApp((s) => s.setUI);
  const f = S.fight;
  const gl = gradeLabel(S);
  return (
    <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-6">
      <div>
        <div className="arena mt-3.5">
          <div className="hud">
            <div><div className="text-[15px] opacity-75">Lực chiến</div><div className="score">{f.rating}</div></div>
            <div className="text-center"><div className="text-[15px] opacity-75">Hạng</div><div className="text-[22px]" style={{ color: league(f.rating).color }}>{league(f.rating).name}</div></div>
            <div className="text-right"><div className="text-[15px] opacity-75">Thắng / Hòa / Thua</div><div className="score !text-2xl">{f.w} / {f.d} / {f.l}</div></div>
          </div>
          <p className="small !mb-0 mt-3.5 opacity-85">10 câu, mỗi câu 20 giây. Đúng được 100 điểm, trả lời càng nhanh càng được thưởng thêm tới 50 điểm. Đoán bừa sai là mất trắng. Thắng +25 xu, hòa +10, thua +5.</p>
        </div>
        <h2>Chọn chiến trường</h2>
        <div className="seg">
          {["Lộ trình", ...learnSubjects(S)].map((s) => (
            <button key={s} aria-pressed={ui.fightSub === s} onClick={() => setUI({ fightSub: s })}>{s === "Lộ trình" ? "Kỳ thi gần nhất" : s}</button>
          ))}
        </div>
        <p className="small muted mt-2">Chỉ dùng kiến thức đến {gl === "thí sinh tự do" ? "lớp 12" : gl}.</p>
        <h2>Chọn đối thủ</h2>
        {BOTS.map((b, i) => (
          <button key={i} className="choice" aria-pressed={ui.bot === i} onClick={() => setUI({ bot: i })}>
            <span className="flex-1"><b>{b.n}</b><small>Xếp hạng {b.r}, trả lời đúng khoảng {Math.round(b.acc * 100)}%</small></span>
          </button>
        ))}
        <button className="btn btn-gold mt-3 w-full text-[22px]" onClick={startFight}>Vào trận!</button>
        <p className="small muted mt-2.5">Câu sai trong trận được tự động thêm vào sổ lỗi sai. Mẹo: trên máy tính bấm phím A, B, C, D để trả lời nhanh.</p>
      </div>
      <div><TopList kind="rating" lim={8} title="Top lực chiến" /></div>
    </div>
  );
}
