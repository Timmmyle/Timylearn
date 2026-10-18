"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { loadLeaderboard, useGame, type LbRow } from "@/lib/game";
import { hasSupabase } from "@/lib/supabase";
import { Coin } from "../Icon";
import HeroArt from "./HeroArt";

export type LbKind = "level" | "rating" | "week";
export const LB_LABEL: Record<LbKind, string> = { level: "Cấp độ", rating: "Lực chiến", week: "Xu tuần này" };

export function useBoard(kind: LbKind, lim: number) {
  const user = useApp((s) => s.user);
  const xp = useApp((s) => s.S.xp);
  const coins = useGame((g) => g.coins);
  const [rows, setRows] = useState<LbRow[] | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    let live = true;
    const t = setTimeout(() => loadLeaderboard(kind, lim).then((r) => { if (!live) return; setRows(r || []); setErr(r === null); }), 300);
    return () => { live = false; clearTimeout(t); };
  }, [kind, lim, user, Math.floor(xp / 50), Math.floor(coins / 50)]); // eslint-disable-line react-hooks/exhaustive-deps
  return { rows, err };
}

export const valueText = (kind: LbKind, r: LbRow) =>
  kind === "level" ? `Lv. ${r.level}` : kind === "rating" ? `${r.value}` : r.value.toLocaleString("vi-VN");

/** Danh sách ngắn (đại sảnh, quyết đấu) */
export function TopList({ kind, lim = 5, title }: { kind: LbKind; lim?: number; title?: string }) {
  const { rows, err } = useBoard(kind, lim);
  const user = useApp((s) => s.user);
  if (!hasSupabase) return null;
  return (
    <>
      <div className="mt-6 mb-2.5 flex items-baseline gap-2">
        <h2 className="!m-0 flex-1">{title || "Bảng phong thần"}</h2>
        <Link href="/bang-xep-hang" className="small underline underline-offset-4">Xem tất cả</Link>
      </div>
      <div className="panel !py-2">
        {!rows ? <p className="small muted !my-2">Đang tải…</p>
          : err ? <p className="small muted !my-2">Chưa tải được bảng xếp hạng.</p>
          : !rows.length ? <p className="small muted !my-2">Chưa có ai trên bảng. Vào trận đầu tiên để ghi tên!</p>
          : rows.map((r) => (
            <div className={`mission ${r.is_me ? "text-accent" : ""}`} key={r.rank}>
              <span className={`rank-badge ${r.rank <= 3 ? "top" : ""}`}>{r.rank}</span>
              <HeroArt lv={r.level} equip={r.equip} size={44} bust animated className="flex-none rounded-full border-2 border-chalk bg-[var(--hero-card)]" />
              <span className="min-w-0 flex-1 truncate">{r.hero_name}{r.is_me ? " (bạn)" : ""}<span className="small muted block truncate">{r.display_name}</span></span>
              <b className="inline-flex items-center gap-1 font-normal tabular-nums">{kind === "week" && <Coin size={15} />}{valueText(kind, r)}</b>
            </div>
          ))}
        {!user && <p className="small muted !mb-1 mt-1">Đăng nhập để có tên trên bảng.</p>}
      </div>
    </>
  );
}
