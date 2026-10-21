"use client";
import { ask } from "@/lib/confirm";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { buyItem, equipItem, levelInfo, RARITY_LABEL, SLOT_LABEL, useGame, type Equip, type Item, type Slot } from "@/lib/game";
import { hasSupabase } from "@/lib/supabase";
import { Coin, Icon } from "../Icon";
import HeroCard from "../game/HeroCard";
import { ItemArt } from "../game/HeroArt";

const SLOTS: (Slot | "all")[] = ["all", "weapon", "shield", "helmet", "armor", "cape", "pet", "aura", "consumable"];
const EARN: [string, string, string, number][] = [
  ["practice", "Vượt ải, sửa sai lầm", "2 xu mỗi câu đúng", 200],
  ["exam", "Thử thách (thi thử)", "5 xu mỗi điểm", 150],
  ["fight", "Quyết đấu", "Thắng 25, hòa 10, thua 5 xu", 150],
  ["mission", "Nhiệm vụ hằng ngày", "20 xu mỗi nhiệm vụ", 80],
];

export default function Shop() {
  const xp = useApp((s) => s.S.xp);
  const g = useGame();
  const [tab, setTab] = useState<"shop" | "bag">("shop");
  const [slot, setSlot] = useState<Slot | "all">("all");
  const [tryOn, setTryOn] = useState<Item | null>(null);
  const lv = levelInfo(xp).lv;
  const ready = g.status === "ready";

  const list = useMemo(() => {
    let L = g.items.slice().sort((a, b) => a.sort - b.sort);
    if (tab === "bag") L = L.filter((x) => g.inventory[x.id]);
    if (slot !== "all") L = L.filter((x) => x.slot === slot);
    return L;
  }, [g.items, g.inventory, tab, slot]);

  const preview: Equip | undefined = tryOn && tryOn.slot !== "consumable" ? { ...g.equip, [tryOn.slot]: tryOn.id } : undefined;

  const buy = async (it: Item) => {
    if (!(await ask({ title: "Mua vật phẩm", msg: `Mua ${it.name} với giá ${it.price.toLocaleString("vi-VN")} xu?`, ok: "Mua", icon: "coin" }))) return;
    if (await buyItem(it.id)) setTryOn(null);
  };

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:gap-6">
      <div className="min-w-0">
        <div className="lg:hidden"><HeroCard compact preview={preview} /></div>

        {hasSupabase && g.status === "guest" && (
          <div className="panel mt-3.5 flex flex-wrap items-center gap-3 !bg-p-yellow !text-on-pastel">
            <span className="flex-1">Đăng nhập để kiếm xu, mua đồ và có tên trên bảng xếp hạng. Bạn vẫn xem và thử đồ được.</span>
            <Link href="/dang-nhap" className="btn btn-sm btn-line !text-on-pastel !border-on-pastel">Đăng nhập</Link>
          </div>
        )}
        {g.status === "error" && <div className="panel mt-3.5">Máy chủ chưa bật chế độ game. Chạy <code>supabase/migrations/0005_game.sql</code> trong Supabase → SQL Editor.</div>}
        {!hasSupabase && <div className="panel mt-3.5">Chưa cấu hình Supabase nên chưa mua đồ được. Bạn vẫn xem và thử đồ được.</div>}

        <div className="mt-3.5 flex items-center gap-2">
          <div className="seg flex-1" role="tablist">
            <button role="tab" aria-pressed={tab === "shop"} onClick={() => setTab("shop")}><Icon name="shop" size={16} /> Cửa hàng</button>
            <button role="tab" aria-pressed={tab === "bag"} onClick={() => setTab("bag")}><Icon name="bag" size={16} /> Túi đồ ({Object.keys(g.inventory).length})</button>
          </div>
          {ready && <span className="chip text-[18px] tabular-nums"><Coin size={18} />{g.coins.toLocaleString("vi-VN")}</span>}
        </div>
        <div className="seg mt-2.5">
          {SLOTS.map((s) => <button key={s} aria-pressed={slot === s} onClick={() => setSlot(s)}>{s === "all" ? "Tất cả" : SLOT_LABEL[s]}</button>)}
        </div>

        {!list.length && <div className="panel mt-3.5">{tab === "bag" ? "Túi đồ còn trống. Ghé cửa hàng để sắm trang bị đầu tiên!" : "Chưa có vật phẩm loại này."}</div>}
        <div className="mt-3.5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {list.map((it) => {
            const owned = !!g.inventory[it.id], worn = it.slot !== "consumable" && g.equip[it.slot as keyof Equip] === it.id;
            const locked = lv < it.min_level, poor = ready && g.coins < it.price;
            const trying = tryOn?.id === it.id;
            return (
              <div key={it.id} className={`item-card ${trying || worn ? "on" : ""}`}>
                <button className="art" onClick={() => setTryOn(trying ? null : it)} aria-label={`Thử ${it.name}`} title="Bấm để thử lên nhân vật">
                  <ItemArt slot={it.slot} id={it.id} size={76} />
                </button>
                <div className="flex items-start gap-1">
                  <b className="flex-1 text-[18px] font-normal leading-tight">{it.name}</b>
                  {worn && <span className="tag !bg-p-mint !text-on-pastel">Đang mặc</span>}
                </div>
                <span className={`text-[14px] r-${it.rarity}`}>{RARITY_LABEL[it.rarity]} · {SLOT_LABEL[it.slot]}{it.min_level > 1 ? ` · cấp ${it.min_level}` : ""}</span>
                <p className="read !m-0 text-[13px] leading-snug opacity-75">{it.description}</p>
                <div className="mt-auto pt-1">
                  {owned && it.slot !== "consumable" ? (
                    worn
                      ? <button className="btn btn-line btn-sm w-full" onClick={() => equipItem(it.slot as Exclude<Slot, "consumable">, null)}>Tháo ra</button>
                      : <button className="btn btn-sm w-full" onClick={() => { setTryOn(null); equipItem(it.slot as Exclude<Slot, "consumable">, it.id); }}>Mặc vào</button>
                  ) : locked ? (
                    <button className="btn btn-line btn-sm w-full" disabled><Icon name="lock" size={15} /> Cần cấp {it.min_level}</button>
                  ) : (
                    <button className="btn btn-gold btn-sm w-full tabular-nums" disabled={!ready || poor || g.busy === it.id} onClick={() => buy(it)}
                      title={!ready ? "Đăng nhập để mua" : poor ? `Còn thiếu ${(it.price - g.coins).toLocaleString("vi-VN")} xu` : undefined}>
                      <Coin size={15} />{it.price.toLocaleString("vi-VN")}{owned ? ` · có ${g.inventory[it.id]}` : ""}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <h2>Cách kiếm xu</h2>
        <div className="panel">
          {EARN.map(([k, t, d, cap]) => {
            const got = g.todayEarned[k] || 0;
            return (
              <div className="mission" key={k}>
                <span className="flex-1">{t}<span className="small muted block">{d}</span></span>
                <span className="small tabular-nums opacity-80">{ready ? `${got}/${cap}` : `tối đa ${cap}`} xu hôm nay</span>
              </div>
            );
          })}
          <div className="mission"><span className="flex-1">Lên cấp<span className="small muted block">30 + 20 × cấp mới, bấm “Tăng cấp” trên thẻ nhân vật</span></span></div>
          <p className="small muted !mb-0 mt-2">Mỗi hoạt động có mức xu tối đa mỗi ngày để bảng xếp hạng công bằng. Xu được máy chủ cộng, không sửa được trên máy.</p>
        </div>
      </div>

      <aside className="sticky top-[78px] mt-3.5 hidden lg:block">
        <HeroCard preview={preview} />
        {tryOn && <p className="small muted mt-2 text-center">Đang thử: {tryOn.name}. Bấm lại vào ảnh để bỏ thử.</p>}
      </aside>
    </div>
  );
}
