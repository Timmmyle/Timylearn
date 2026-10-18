"use client";
import { useApp } from "@/lib/store";
import { addDays, agg, comma, dstr, pct, today } from "@/lib/logic";

export default function Progress() {
  const S = useApp((s) => s.S);
  const R = useApp((s) => s.ui.progRange);
  const setUI = useApp((s) => s.setUI);
  const A = agg(S, R), all = agg(S, 0);

  const pts: { lab: string; c: number; t: number }[] = [];
  if (R === 365) {
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1); const key = dstr(d).slice(0, 7); let c = 0, t = 0;
      for (const [dd, v] of Object.entries(A.byDay)) if (dd.startsWith(key)) { c += v.c; t += v.t; }
      pts.push({ lab: "T" + (d.getMonth() + 1), c, t });
    }
  } else {
    for (let i = R - 1; i >= 0; i--) {
      const d = addDays(today(), -i); const v = A.byDay[d] || { c: 0, t: 0 };
      pts.push({ lab: R === 7 ? ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][new Date(d + "T00:00:00").getDay()] : d.slice(8), c: v.c, t: v.t });
    }
  }
  const W = 600, H = 200, pad = 26, bw = (W - pad * 2) / pts.length, mx = Math.max(5, ...pts.map((p) => p.t));
  const subsSeen = Object.keys(all.bySub);
  const topics = Object.entries(A.byTopic).sort((a, b) => a[1].c / a[1].t - b[1].c / b[1].t);
  const start = addDays(today(), -83 - new Date().getDay());
  const cells: { d: string; t: number }[] = [];
  for (let i = 0; i < 91; i++) { const d = addDays(start, i); if (d > today()) break; const v = all.byDay[d]; cells.push({ d, t: v ? v.t : 0 }); }

  return (
    <>
      <div className="seg mt-3.5">
        {([[7, "7 ngày"], [30, "30 ngày"], [365, "Cả năm"]] as const).map(([v, l]) => <button key={v} aria-pressed={R === v} onClick={() => setUI({ progRange: v })}>{l}</button>)}
      </div>
      <div className="panel mt-3">
        <div className="stats3 !mt-0">
          <div><b>{A.t}</b><span>Câu đã làm</span></div>
          <div><b>{A.t ? pct(A.c, A.t) + "%" : "—"}</b><span>Tỉ lệ đúng</span></div>
          <div><b>{S.streak.best}</b><span>Chuỗi dài nhất</span></div>
        </div>
      </div>

      <h2>Số câu đúng</h2>
      <div className="panel">
        <svg className="block h-auto w-full" viewBox={`0 0 ${W} ${H + 30}`} role="img" aria-label="Số câu đúng và tổng số câu theo thời gian">
          <line x1={pad} y1={H} x2={W - pad} y2={H} stroke="var(--line)" />
          {pts.map((p, i) => {
            const x = pad + i * bw + bw * 0.18, w = bw * 0.64, ht = (p.t / mx) * (H - 20), hc = (p.c / mx) * (H - 20);
            return (
              <g key={i}>
                <rect x={x} y={H - ht} width={w} height={ht} rx={3} fill="var(--line)"><title>{`${p.lab}: ${p.c}/${p.t} câu đúng`}</title></rect>
                <rect x={x} y={H - hc} width={w} height={hc} rx={3} fill="var(--accent)" />
                {(pts.length <= 12 || i % 5 === 0) && <text x={x + w / 2} y={H + 24} textAnchor="middle" fontSize={19} fill="var(--muted)">{p.lab}</text>}
              </g>
            );
          })}
        </svg>
        <p className="small muted !mb-0 mt-1.5">Cột đậm là câu đúng, cột nhạt là tổng số câu đã làm.</p>
      </div>

      <h2>Ước tính điểm theo môn</h2>
      <div className="panel">
        {!subsSeen.length && <p className="!m-0">Làm vài phiên luyện tập để app ước tính điểm cho bạn.</p>}
        {subsSeen.map((s) => {
          const v = A.bySub[s] || all.bySub[s]; const ok = v.t >= 5, sc = (v.c / v.t) * 10, tg = +S.profile.target || 8;
          return (
            <div className="mission" key={s}>
              <span className="flex-1"><b>{s}</b><br /><span className="small muted">{v.t} câu</span></span>
              <span className="text-right">
                <b>{ok ? comma(sc.toFixed(1)) + " điểm" : "Cần thêm dữ liệu"}</b>
                {ok && <><br /><span className="small" style={{ color: sc >= tg ? "var(--green)" : "var(--red)" }}>{sc >= tg ? "Đạt mục tiêu" : "Mục tiêu " + comma(tg)}</span></>}
              </span>
            </div>
          );
        })}
      </div>

      <h2>Bản đồ chủ đề</h2>
      {!topics.length ? <div className="panel"><p className="!m-0">Chưa có dữ liệu trong khoảng thời gian này.</p></div> : (
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
          {topics.map(([k, v]) => {
            const a = pct(v.c, v.t); const col = a >= 80 ? "var(--green)" : a >= 50 ? "var(--yellow)" : "var(--red)";
            return (
              <div key={k} className="rounded-[10px] border border-line p-2.5 text-sm" style={{ background: `color-mix(in srgb,${col} 16%,var(--surface))` }}>
                <b className="block text-[13px] font-semibold">{k.replace("|", ": ")}</b>{a}% đúng, {v.t} câu
              </div>
            );
          })}
        </div>
      )}

      <h2>Lịch học 12 tuần</h2>
      <div className="panel">
        <div className="cal" aria-label="Lịch hoạt động 12 tuần">
          {cells.map(({ d, t }) => {
            const o = t === 0 ? 0 : t < 10 ? 0.35 : t < 25 ? 0.6 : 1;
            return <i key={d} title={`${d}: ${t} câu`} style={o ? { background: `color-mix(in srgb,var(--accent) ${o * 100}%,var(--line))` } : undefined} />;
          })}
        </div>
      </div>
    </>
  );
}
