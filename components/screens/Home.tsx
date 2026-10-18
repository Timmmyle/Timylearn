"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { agg, diffDays, dueMistakes, levelInfo, MISSIONS, nextStep, pct, roadmap, routeTitle, streakAlive, today, topicStat } from "@/lib/logic";
import { Icon } from "../Icon";
import { startTopic, startReview } from "./Learn";
import HeroCard from "../game/HeroCard";
import { TopList } from "../game/Leaderboard";

export default function Home() {
  const S = useApp((s) => s.S);
  const router = useRouter();
  const p = S.profile, days = p.examDate ? diffDays(today(), p.examDate) : null, w7 = agg(S, 7), due = dueMistakes(S).length, nx = nextStep(S), r = roadmap(S);
  const done = r.filter((t) => topicStat(S, t.k).st === "done").length;
  const { lv, into, need } = levelInfo(S.xp);
  const streak = streakAlive(S);
  const missions = S.missions.day === today() ? S.missions : { c: {} as Record<string, number> };

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:gap-6">
      <div className="min-w-0">
        <div className="lg:hidden"><HeroCard compact /></div>

        <section className="panel mt-3.5">
          {days !== null && days >= 0 ? (
            <p className="!mb-0 text-[16px] opacity-80">Còn đến {p.examName || routeTitle(S)}</p>
          ) : (
            <p className="!mb-0 text-[16px] opacity-80">Chưa đặt ngày đại chiến. <Link href="/cai-dat" className="underline underline-offset-4">Đặt ngày thi</Link> để xem đếm ngược.</p>
          )}
          <div className="mt-1 grid grid-cols-[1.25fr_1fr_1fr] items-end gap-2">
            <div>
              <div className="leading-none text-accent"><span className="text-[54px] md:text-[64px] tabular-nums">{days !== null && days >= 0 ? days : "–"}</span><span className="ml-1.5 text-[30px] md:text-[38px]">ngày</span></div>
              <div className="text-[15px] opacity-75">Chuỗi {streak} ngày{S.streak.freezes ? ` · ${S.streak.freezes} thẻ giữ` : ""}</div>
            </div>
            <div><b className="block text-[24px] font-normal tabular-nums">{done}/{r.length}</b><span className="text-[15px] opacity-75">Ải đã vượt</span></div>
            <div><b className="block text-[24px] font-normal">Cấp {lv}</b><span className="text-[15px] opacity-75 tabular-nums">({into}/{need} XP)</span></div>
          </div>
          <div className="bar mt-3" aria-label="Tiến độ cấp độ"><i style={{ width: (into / need) * 100 + "%" }} /></div>
        </section>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <button className="quick-card c-yellow" onClick={() => (nx ? startTopic(nx.k) : router.push("/hoc"))}>
            <b>{nx ? "Tiếp tục viễn chinh" : "Vượt ải"}</b>
            <span>{nx ? nx.s + ": " + nx.t : r.length ? "Bạn đã vượt toàn bộ bản đồ!" : "Mở bản đồ Vượt Ải"}</span>
          </button>
          <button className="quick-card c-mint" onClick={() => startReview()}>
            <b>Sửa sai lầm</b><span>{due ? due + " quái cần diệt hôm nay" : "Chưa có quái nào đến hạn"}</span>
          </button>
          <Link className="quick-card c-lime" href="/dau"><b>Đấu nhanh</b><span>Lực chiến {S.fight.rating}</span></Link>
          <Link className="quick-card c-lav" href="/tien-do"><b>Xem chiến tích</b><span>{w7.t ? pct(w7.c, w7.t) + "% đúng 7 ngày qua" : "7 ngày, 30 ngày, cả năm"}</span></Link>
        </div>

        <h2>Nhiệm vụ hằng ngày</h2>
        <div className="panel">
          <div className="grid md:grid-cols-2 md:gap-x-8">
            {MISSIONS.map((m) => {
              const c = Math.min(missions.c[m.id] || 0, m.n), on = c >= m.n;
              return (
                <div className="mission md:[&:nth-child(2)]:border-t-0" key={m.id}>
                  <span className={`tick ${on ? "on" : ""}`}>{on && <Icon name="check" size={16} />}</span>
                  <span className={`flex-1 ${on ? "line-through opacity-70" : ""}`}>{m.t}</span>
                  <span className="tabular-nums opacity-80">{c}/{m.n}</span>
                </div>
              );
            })}
          </div>
          <p className="small muted !mb-0 mt-2">Mỗi nhiệm vụ hoàn thành được +20 XP và +20 xu. Vượt ải đủ 7 ngày liên tiếp để nhận thẻ giữ chuỗi.</p>
        </div>

        <TopList kind="level" lim={5} />
      </div>

      <aside className="sticky top-[78px] mt-3.5 hidden lg:block"><HeroCard /></aside>
    </div>
  );
}
