"use client";
import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { claimLevels, levelInfo, levelReward, renameHero, TIERS, tierOf, useGame, type Equip } from "@/lib/game";
import { hasSupabase } from "@/lib/supabase";
import { Coin, Icon } from "../Icon";
import HeroArt from "./HeroArt";

/** Thẻ nhân vật: cấp nhân vật = cấp học tập của người chơi */
export default function HeroCard({ compact, preview }: { compact?: boolean; preview?: Equip }) {
  const xp = useApp((s) => s.S.xp);
  const g = useGame();
  const [editing, setEditing] = useState(false);
  const [nm, setNm] = useState("");
  const { lv, into, need } = levelInfo(xp);
  const tier = TIERS[tierOf(lv)].name;
  const ready = g.status === "ready";
  const unclaimed = ready ? Math.max(0, lv - g.claimedLevel) : 0;
  const reward = unclaimed ? Array.from({ length: unclaimed }, (_, i) => levelReward(g.claimedLevel + 1 + i)).reduce((a, b) => a + b, 0) : 0;
  const name = (ready && g.name) || tier;
  const equip = preview || g.equip;

  const nameRow = editing ? (
    <form className="flex gap-1.5" onSubmit={async (e) => { e.preventDefault(); if (await renameHero(nm)) setEditing(false); }}>
      <input className="field !min-h-9 !py-1 !text-[15px]" value={nm} maxLength={24} onChange={(e) => setNm(e.target.value)} aria-label="Tên nhân vật" autoFocus />
      <button className="btn btn-sm btn-gold">Lưu</button>
    </form>
  ) : (
    <div className="flex items-center justify-center gap-1">
      <b className="truncate text-[26px] font-normal leading-tight">{name}</b>
      {ready && <button className="iconbtn !h-8 !w-8" aria-label="Đổi tên nhân vật" onClick={() => { setNm(g.name); setEditing(true); }}><Icon name="pencil" size={16} /></button>}
    </div>
  );

  const action = !hasSupabase ? null : !ready ? (
    g.status === "guest" ? <Link href="/dang-nhap" className="btn btn-line btn-sm w-full">Đăng nhập để nhận xu</Link>
      : g.status === "error" ? <p className="small !m-0 opacity-70">Máy chủ chưa bật chế độ game.</p> : null
  ) : unclaimed ? (
    <button className="btn btn-gold pulse w-full" disabled={g.busy === "level"} onClick={claimLevels}>
      {g.busy === "level" ? "Đang nhận…" : <>TĂNG CẤP · +{reward} <Coin size={16} /></>}
    </button>
  ) : (
    <Link href="/cua-hang" className="btn btn-line btn-sm w-full">TRANG BỊ / CỬA HÀNG</Link>
  );

  if (compact) {
    return (
      <section className="hero-card mt-3 flex items-center gap-3 !p-3" aria-label="Nhân vật của bạn">
        <HeroArt lv={lv} equip={equip} size={104} animated />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1"><b className="truncate text-[22px] font-normal leading-tight">{name}</b>
            {ready && <span className="ml-auto inline-flex items-center gap-1 text-[17px] tabular-nums"><Coin size={16} />{g.coins.toLocaleString("vi-VN")}</span>}</div>
          <p className="!m-0 text-[15px] opacity-75">{tier} · Lv. {lv} ({xp.toLocaleString("vi-VN")} exp)</p>
          <div className="bar my-1.5" aria-label={`Kinh nghiệm ${into}/${need}`}><i style={{ width: (into / need) * 100 + "%" }} /></div>
          <p className="!mb-1.5 text-center text-[14px] opacity-75">{into.toLocaleString("vi-VN")} exp / {need.toLocaleString("vi-VN")} exp</p>
          {action}
        </div>
      </section>
    );
  }

  return (
    <section className="hero-card text-center" aria-label="Nhân vật của bạn">
      <div className="flex justify-center"><HeroArt lv={lv} equip={equip} size={210} animated /></div>
      {nameRow}
      <p className="!mb-2 text-[15px] opacity-75">{tier} · Lv. {lv} ({xp.toLocaleString("vi-VN")} exp)</p>
      <div className="bar" aria-label={`Kinh nghiệm ${into}/${need}`}><i style={{ width: (into / need) * 100 + "%" }} /></div>
      <p className="!mb-3 mt-1 text-[14px] opacity-75">{into.toLocaleString("vi-VN")} exp / {need.toLocaleString("vi-VN")} exp</p>
      {ready && <p className="!mb-3 inline-flex items-center gap-1.5 text-[20px] tabular-nums"><Coin size={20} />{g.coins.toLocaleString("vi-VN")} xu</p>}
      {action}
      <p className="!mb-0 mt-2.5 text-[13px] opacity-60">Trả lời đúng +10 exp. Lên cấp thì nhân vật lên bậc và nhận xu.</p>
    </section>
  );
}
