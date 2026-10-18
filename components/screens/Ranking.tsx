"use client";
import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { hasSupabase } from "@/lib/supabase";
import { Coin } from "../Icon";
import HeroArt from "../game/HeroArt";
import { LB_LABEL, useBoard, valueText, type LbKind } from "../game/Leaderboard";

const HINT: Record<LbKind, string> = {
  level: "Xếp theo tổng kinh nghiệm. Trả lời đúng càng nhiều, cấp càng cao.",
  rating: "Xếp theo điểm Quyết Đấu của người đã đấu ít nhất 1 trận.",
  week: "Xu kiếm được từ thứ Hai tuần này. Mỗi tuần bắt đầu lại từ 0.",
};
const STEP = ["var(--p-yellow)", "var(--p-sky)", "var(--p-pink)"];

export default function Ranking() {
  const [kind, setKind] = useState<LbKind>("level");
  const { rows, err } = useBoard(kind, 50);
  const user = useApp((s) => s.user);

  if (!hasSupabase) return <div className="panel mt-3.5">Chưa cấu hình Supabase nên chưa có bảng xếp hạng.</div>;
  const top = rows?.slice(0, 3) || [];
  const me = rows?.find((r) => r.is_me);

  return (
    <>
      <div className="seg mt-3.5">
        {(Object.keys(LB_LABEL) as LbKind[]).map((k) => <button key={k} aria-pressed={kind === k} onClick={() => setKind(k)}>{LB_LABEL[k]}</button>)}
      </div>
      <p className="small muted mt-2">{HINT[kind]}</p>

      {!rows ? <div className="panel">Đang tải…</div> : err ? <div className="panel">Chưa tải được bảng xếp hạng. Kiểm tra đã chạy <code>0005_game.sql</code> chưa.</div> : !rows.length ? (
        <div className="panel">Chưa có ai trên bảng này. {user ? "Vào trận để ghi tên đầu tiên!" : <Link href="/dang-nhap" className="underline">Đăng nhập</Link>}</div>
      ) : (
        <>
          {/* Bục vinh quang: hạng 2 – 1 – 3 */}
          <div className="podium mt-4" aria-label="Ba người dẫn đầu">
            {[1, 0, 2].map((i) => {
              const r = top[i]; if (!r) return <div key={i} />;
              return (
                <div key={i}>
                  <div className="flex justify-center"><HeroArt lv={r.level} equip={r.equip} size={i === 0 ? 132 : 104} animated /></div>
                  <b className={`block truncate font-normal ${i === 0 ? "text-[21px]" : "text-[18px]"} ${r.is_me ? "text-accent" : ""}`}>{r.hero_name}</b>
                  <span className="small muted block truncate">{r.display_name}</span>
                  <span className="inline-flex items-center gap-1 tabular-nums">{kind === "week" && <Coin size={15} />}{valueText(kind, r)}</span>
                  <div className="step mt-1.5" style={{ background: STEP[i], height: i === 0 ? 74 : i === 1 ? 54 : 40 }}>{i + 1}</div>
                </div>
              );
            })}
          </div>
          <div className="panel !rounded-t-none !py-2">
            {rows.slice(3).map((r) => (
              <div className={`mission ${r.is_me ? "text-accent" : ""}`} key={r.rank}>
                <span className="w-8 text-center text-[19px] tabular-nums">{r.rank}</span>
                <HeroArt lv={r.level} equip={r.equip} size={46} bust className="flex-none rounded-full border-2 border-chalk bg-[var(--hero-card)]" />
                <span className="min-w-0 flex-1 truncate">{r.hero_name}{r.is_me ? " (bạn)" : ""}<span className="small muted block truncate">{r.display_name} · Lv. {r.level}</span></span>
                <b className="inline-flex items-center gap-1 font-normal tabular-nums">{kind === "week" && <Coin size={15} />}{valueText(kind, r)}</b>
              </div>
            ))}
            {rows.length <= 3 && <p className="small muted !my-2">Chỉ mới có {rows.length} người trên bảng.</p>}
          </div>
          {user && !me && <p className="small muted">Bạn chưa có mặt trong top {rows.length}. Tiếp tục vượt ải để leo hạng!</p>}
        </>
      )}
    </>
  );
}
