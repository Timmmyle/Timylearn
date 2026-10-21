"use client";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { BOTS } from "@/lib/data/curriculum";
import { learnSubjects } from "@/lib/logic";
import { league, levelInfo, useGame, type Equip } from "@/lib/game";
import { startFight } from "../screens/Fight";
import { Coin } from "../Icon";
import HeroArt from "./HeroArt";

/* Ngoại hình đối thủ máy theo cấp độ */
const BOT_LOOK: { lv: number; equip: Equip }[] = [
  { lv: 3, equip: { helmet: "mu-vai" } },
  { lv: 8, equip: { weapon: "riu-chien", helmet: "mu-sung", shield: "khien-go" } },
  { lv: 18, equip: { weapon: "kiem-lua", helmet: "mu-hiep-si", armor: "giap-tam", shield: "khien-rong", cape: "ao-choang-do", aura: "hao-quang-vang" } },
];

/** Bảng Đấu trường: trung tâm Đại Sảnh */
export default function ArenaPanel() {
  const S = useApp((s) => s.S);
  const ui = useApp((s) => s.ui);
  const setUI = useApp((s) => s.setUI);
  const g = useGame();
  const f = S.fight, lg = league(f.rating), lv = levelInfo(S.xp).lv;
  const games = f.w + f.d + f.l, rate = games ? Math.round((f.w / games) * 100) : 0;
  const bot = BOTS[ui.bot] || BOTS[1], look = BOT_LOOK[ui.bot] || BOT_LOOK[1];
  const subs = ["Lộ trình", ...learnSubjects(S)];
  const fightCoins = g.todayEarned.fight || 0;

  return (
    <section className="arena !mt-3.5 overflow-hidden !p-0" aria-label="Đấu trường">
      <div className="flex items-center gap-2 px-4 pt-3.5">
        <h2 className="arena-title !m-0 flex-1 text-[26px] leading-none">Đấu trường</h2>
        <span className="chip !border-[var(--arena-line)] !bg-transparent !text-[var(--arena-ink)]">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: lg.color }} />{lg.name} · {f.rating}
        </span>
      </div>

      {/* Hai nhân vật đối mặt */}
      <div className="relative grid grid-cols-[1fr_auto_1fr] items-end gap-1 px-2 pt-1">
        <div className="text-center">
          <div className="flex justify-center"><HeroArt lv={lv} equip={g.equip} size={190} animated className="h-auto max-w-full" /></div>
          <b className="block truncate text-[18px] font-normal">{(g.status === "ready" && g.name) || "Bạn"}</b>
          <span className="text-[14px] opacity-70">Lv. {lv}</span>
        </div>
        <div className="mb-10 grid h-14 w-14 place-items-center rounded-full border-2 border-[var(--arena-ink)] bg-p-yellow text-[24px] text-on-pastel shadow-[2px_3px_0_rgba(0,0,0,.4)]">VS</div>
        <div className="text-center">
          <div className="flex justify-center" style={{ transform: "scaleX(-1)" }}><HeroArt lv={look.lv} equip={look.equip} size={190} animated className="h-auto max-w-full" label={`Đối thủ ${bot.n}`} /></div>
          <b className="block truncate text-[18px] font-normal">{bot.n}</b>
          <span className="text-[14px] opacity-70">Lực chiến {bot.r}</span>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="mt-2 grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Chọn đối thủ">
          {BOTS.map((b, i) => (
            <button key={i} role="radio" aria-checked={ui.bot === i} onClick={() => setUI({ bot: i })}
              className={`rounded-[10px] border-2 px-1 py-1.5 text-[15px] leading-tight ${ui.bot === i ? "border-[var(--arena-ink)] bg-[rgba(255,255,255,.14)]" : "border-[var(--arena-line)] opacity-80"}`}>
              {b.n}<span className="block text-[12px] opacity-70">đúng ~{Math.round(b.acc * 100)}%</span>
            </button>
          ))}
        </div>
        <label className="sr-only" htmlFor="arena-sub">Chiến trường</label>
        <select id="arena-sub" className="field mt-2 !min-h-10 !border-[var(--arena-line)] !bg-[rgba(255,255,255,.06)] !py-1.5 !text-[var(--arena-ink)]"
          value={ui.fightSub} onChange={(e) => setUI({ fightSub: e.target.value })}>
          {subs.map((s) => <option key={s} value={s} className="text-black">{s === "Lộ trình" ? "Chiến trường: kỳ thi gần nhất" : "Chiến trường: " + s}</option>)}
        </select>
        <button className="btn btn-gold pulse mt-2.5 w-full !min-h-14 text-[24px]" onClick={startFight}>VÀO TRẬN!</button>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[14px]">
          <div><b className="block text-[20px] font-normal tabular-nums">{f.w}/{f.d}/{f.l}</b><span className="opacity-70">Thắng/Hòa/Thua</span></div>
          <div><b className="block text-[20px] font-normal tabular-nums">{rate}%</b><span className="opacity-70">Tỉ lệ thắng</span></div>
          <div><b className="inline-flex items-center justify-center gap-1 text-[20px] font-normal tabular-nums">{g.status === "ready" ? fightCoins : "–"}<Coin size={16} /></b><span className="block opacity-70">xu đấu hôm nay /150</span></div>
        </div>
        <div className="mt-2 flex justify-between text-[14px] opacity-80">
          <span>10 câu · 20 giây/câu · đúng nhanh được thưởng</span>
          <Link href="/bang-xep-hang" className="underline underline-offset-4">Bảng lực chiến</Link>
        </div>
      </div>
    </section>
  );
}
