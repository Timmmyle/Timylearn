"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp, hydrateLocal, pullRemote } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { level, streakAlive } from "@/lib/logic";
import { supabase, hasSupabase } from "@/lib/supabase";
import { aiStatus } from "@/lib/api";
import { initRemote } from "@/lib/remote";
import { Icon, Flame, Coin } from "./Icon";
import { initGame, league, useGame } from "@/lib/game";
import Onboarding from "./Onboarding";
import SessionView from "./session/SessionView";

const NAV: [string, string, string][] = [
  ["/", "Đại Sảnh", "home"],
  ["/hoc", "Vượt Ải", "book"],
  ["/dau", "Quyết Đấu", "sword"],
  ["/de-thi", "Thử Thách", "paper"],
  ["/cua-hang", "Cửa Hàng", "shop"],
  ["/bang-xep-hang", "Đua Top", "trophy"],
  ["/tien-ich", "Hành Trang", "grid"],
  ["/tien-do", "Kỷ Lục", "chart"],
  ["/cai-dat", "Thiết Lập", "gear"],
];
const TABS = NAV.slice(0, 5);
const TITLES: Record<string, string> = {
  "/": "Chinh Phục", "/hoc": "Vượt Ải", "/dau": "Quyết Đấu", "/de-thi": "Thử Thách", "/cua-hang": "Cửa Hàng", "/bang-xep-hang": "Đua Top",
  "/tien-ich": "Hành Trang", "/tien-do": "Kỷ Lục", "/cai-dat": "Thiết Lập", "/dang-nhap": "Tài khoản",
};
const WIDE = ["/", "/cua-hang", "/bang-xep-hang", "/dau"];
const norm = (p: string) => (p.length > 1 ? p.replace(/\/$/, "") : p);

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = norm(usePathname() || "/");
  const hydrated = useApp((s) => s.hydrated);
  const S = useApp((s) => s.S);
  const ses = useApp((s) => s.ses);
  const user = useApp((s) => s.user);

  // Khởi động: đọc dữ liệu máy, kiểm tra AI, lắng nghe đăng nhập Supabase, đăng ký service worker
  useEffect(() => {
    hydrateLocal();
    aiStatus().then((ai) => useApp.setState({ ai }));
    initRemote();
    initGame();
    let unsub: (() => void) | undefined;
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        const u = data.session?.user;
        if (u) { useApp.setState({ user: { id: u.id, email: u.email } }); pullRemote(u.id); }
      });
      const { data } = supabase.auth.onAuthStateChange((ev, session) => {
        const u = session?.user;
        useApp.setState({ user: u ? { id: u.id, email: u.email } : null });
        if (u && ev === "SIGNED_IN") pullRemote(u.id);
        if (!u) useApp.setState({ syncNote: "Đang lưu trên thiết bị này" });
      });
      unsub = () => data.subscription.unsubscribe();
    }
    // PWA trên web (trong app Capacitor thì tài nguyên đã nằm sẵn trong app, không cần service worker)
    const isNative = !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.();
    if (!isNative && "serviceWorker" in navigator && process.env.NODE_ENV === "production" && location.protocol === "https:") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    return () => unsub?.();
  }, []);

  // Áp giao diện sáng/tối và màu chủ đạo
  useEffect(() => {
    const r = document.documentElement;
    if (S.theme.mode === "auto") delete r.dataset.theme; else r.dataset.theme = S.theme.mode;
    r.dataset.accent = S.theme.accent;
  }, [S.theme.mode, S.theme.accent]);

  const [menu, setMenu] = useState(false);
  useEffect(() => setMenu(false), [path]);
  const coins = useGame((g) => g.coins), gStatus = useGame((g) => g.status);

  if (!hydrated) return <div className="min-h-dvh grid place-items-center muted">Đang tải…</div>;

  const inSession = !!ses;
  const showOnboard = !S.onboarded && path !== "/dang-nhap";
  const subPage = !TABS.some(([h]) => h === path);
  const lg = league(S.fight.rating);

  return (
    <>
      {/* Thanh bên trên máy tính */}
      {!inSession && !showOnboard && (
        <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-60 flex-col border-r-2 border-chalk bg-paper px-3 pt-safe">
          <Link href="/" className="flex items-center gap-2.5 px-2 py-5">
            <span className="grid h-9 w-9 place-items-center rounded-[10px_12px_9px_11px] border-2 border-chalk bg-p-lav text-xl text-on-pastel shadow-[2px_3px_0_var(--shadow)]" title="Cấp độ">{level(S)}</span>
            <span className="text-[26px] leading-none">Chinh Phục</span>
          </Link>
          <nav className="flex flex-col gap-1" aria-label="Điều hướng chính">
            {NAV.map(([href, label, ic]) => (
              <Link key={href} href={href} aria-current={path === href ? "page" : undefined}
                className={`flex items-center gap-3 rounded-[11px_13px_10px_12px] border-2 px-3 py-[7px] text-[19px] transition-colors ${path === href ? "border-chalk bg-p-yellow text-on-pastel shadow-[2px_3px_0_var(--shadow)]" : "border-transparent hover:border-line"}`}>
                <Icon name={ic} size={20} />{label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto pb-5">
            {hasSupabase && (
              <Link href="/dang-nhap" className="flex items-center gap-2.5 rounded-xl px-2 py-2 text-[15px] hover:bg-accent-soft">
                <span className="grid h-8 w-8 flex-none place-items-center rounded-full border-2 border-chalk bg-surface-2 text-base">{(user?.email || "N").charAt(0).toUpperCase()}</span>
                <span className="truncate">{user ? user.email : "Đăng nhập để lưu tiến trình và nhận xu"}</span>
              </Link>
            )}
          </div>
        </aside>
      )}

      <div className={!inSession && !showOnboard ? "md:pl-60" : ""}>
        <main className={`mx-auto w-full px-4 ${!inSession && !showOnboard && WIDE.includes(path) ? "max-w-2xl lg:max-w-5xl" : "max-w-2xl lg:max-w-3xl"} ${inSession || showOnboard ? "pb-10" : "pb-tabbar"}`}>
          {inSession ? <SessionView /> : showOnboard ? <Onboarding /> : (
            <>
              <header className="sticky top-0 z-20 -mx-4 flex h-[62px] items-center gap-2 bg-paper px-4 pt-safe box-content">
                {subPage && <Link href="/" className="iconbtn md:hidden" aria-label="Quay lại"><Icon name="back" /></Link>}
                <h1 className="m-0 flex-1 truncate text-[30px] font-normal leading-none">{TITLES[path] || "Chinh Phục"}</h1>
                {hasSupabase && (
                  <Link href={gStatus === "ready" ? "/cua-hang" : "/dang-nhap"} className="chip tabular-nums" title={gStatus === "ready" ? "Xu của bạn" : "Đăng nhập để nhận xu"}>
                    <Coin size={17} />{gStatus === "ready" ? coins.toLocaleString("vi-VN") : "—"}
                  </Link>
                )}
                <span className="chip text-[#E8590C]" title="Chuỗi ngày học"><Flame />{streakAlive(S)}</span>
                <Link href="/dau" className="chip hidden sm:inline-flex" title={`Hạng đấu (điểm ${S.fight.rating})`}>
                  <span className="h-2.5 w-2.5 rounded-full border border-chalk" style={{ background: lg.color }} />{lg.name}
                </Link>
                <button className="iconbtn md:hidden" aria-label="Mở menu" aria-expanded={menu} onClick={() => setMenu(true)}><Icon name="menu" /></button>
              </header>
              {children}
            </>
          )}
        </main>
      </div>

      {/* Thanh tab dưới trên điện thoại */}
      {!inSession && !showOnboard && (
        <nav className="fixed inset-x-0 bottom-0 z-[25] border-t-2 border-chalk bg-paper pb-safe md:hidden" aria-label="Điều hướng chính">
          <div className="mx-auto flex max-w-2xl gap-1 px-1.5 py-1.5">
            {TABS.map(([href, label, ic]) => (
              <Link key={href} href={href} aria-current={path === href ? "page" : undefined}
                className={`flex flex-1 flex-col items-center gap-0 rounded-[11px_13px_10px_12px] border-2 px-0.5 py-1 text-[14px] leading-tight ${path === href ? "border-chalk bg-p-yellow text-on-pastel" : "border-transparent text-muted"}`}>
                <Icon name={ic} />
                <span className="whitespace-nowrap">{label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
      {/* Menu đầy đủ trên điện thoại */}
      {menu && !inSession && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="absolute inset-0 bg-black/45" aria-label="Đóng menu" onClick={() => setMenu(false)} />
          <div className="pop absolute inset-x-3 top-[calc(var(--sat)+10px)] rounded-[18px_22px_17px_21px] border-2 border-chalk bg-paper p-3 shadow-[4px_5px_0_var(--shadow)]">
            <div className="mb-2 flex items-center px-1">
              <b className="flex-1 text-[24px] font-normal">Chinh Phục</b>
              <button className="iconbtn" aria-label="Đóng" onClick={() => setMenu(false)}><Icon name="x" /></button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[...NAV, ...(hasSupabase ? [["/dang-nhap", user ? "Tài khoản" : "Đăng nhập", "user"] as [string, string, string]] : [])].map(([href, label, ic]) => (
                <Link key={href} href={href} aria-current={path === href ? "page" : undefined}
                  className={`flex flex-col items-center gap-1 rounded-[11px_13px_10px_12px] border-2 px-1 py-2.5 text-[16px] ${path === href ? "border-chalk bg-p-yellow text-on-pastel" : "border-line"}`}>
                  <Icon name={ic} />{label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      <Toast />
    </>
  );
}

function Toast() {
  const { msg, id } = useToast();
  if (!msg) return null;
  return (
    <div key={id} role="status"
      className="pop fixed left-1/2 z-50 w-max max-w-[90vw] -translate-x-1/2 rounded-[12px_14px_11px_13px] border-2 border-chalk bg-p-yellow px-4 py-2 text-[17px] text-on-pastel shadow-[3px_4px_0_var(--shadow)] bottom-[calc(84px+var(--sab))] md:bottom-8">
      {msg}
    </div>
  );
}
