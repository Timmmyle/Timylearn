"use client";
import { MathText } from "@/components/MathText";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { CAT, FORMULAS, PROCESSES, PT, SUBJECTS, UNITS, VIRUS_TABLE } from "@/lib/data/curriculum";

// Thứ tự môn ở tab Công thức: Toán → Hóa → Lý → các môn còn lại
const FORMULA_ORDER = ["Toán", "Hóa học", "Vật lí", ...SUBJECTS.filter((s) => !["Toán", "Hóa học", "Vật lí"].includes(s))];
import { comma, fmtNum, molarMass } from "@/lib/logic";

const TABS: [string, string][] = [["cong-thuc", "Công thức"], ["bth", "Bảng tuần hoàn"], ["luong-giac", "Lượng giác"], ["don-vi", "Đổi đơn vị"], ["mol", "Tính mol"], ["hoa-sinh", "Điều chế, Sinh học"]];

export default function Tools() {
  const tab = useApp((s) => s.ui.toolTab);
  const setUI = useApp((s) => s.setUI);
  return (
    <>
      <div className="seg mt-3.5">{TABS.map(([k, l]) => <button key={k} aria-pressed={tab === k} onClick={() => setUI({ toolTab: k })}>{l}</button>)}</div>
      <div className="h-3.5" />
      {tab === "cong-thuc" && <Formulas />}
      {tab === "bth" && <Periodic />}
      {tab === "luong-giac" && <Trig />}
      {tab === "don-vi" && <Units />}
      {tab === "mol" && <Mol />}
      {tab === "hoa-sinh" && <ChemBio />}
    </>
  );
}

function Formulas() {
  const fq = useApp((s) => s.ui.fq);
  const setUI = useApp((s) => s.setUI);
  const q = fq.trim().toLowerCase();
  return (
    <>
      <input className="field" type="search" placeholder="Tìm công thức, ví dụ: logarit, con lắc, pH" value={fq} aria-label="Tìm công thức" onChange={(e) => setUI({ fq: e.target.value })} />
      <div className="h-3" />
      {/* Một cột giống điện thoại: môn này nằm trên môn sau */}
      <div className="flex flex-col gap-2 lg:gap-4">
        {FORMULA_ORDER.map((s) => {
          const items = FORMULAS.filter((f) => f[0] === s && (!q || (f[1] + " " + f[2]).toLowerCase().includes(q)));
          if (!items.length) return null;
          return (
            <section key={s}>
              <h2 className="!mt-2">{s}</h2>
              <div className="panel lg:!px-6 lg:!py-3">
                {items.map((f) => <div className="formula lg:!py-3.5 lg:first:!pt-2" key={f[1]}><span className="small muted">{f[1]}</span><FormulaLine v={f[2]} /></div>)}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

/** Mỗi công thức (ngăn bằng ";  ") là một khối riêng, tự xuống dòng khi hẹp */
function FormulaLine({ v }: { v: string }) {
  return (
    <code className="flex flex-wrap items-center gap-x-7 gap-y-0.5">
      {v.split(/;\s{2}/).map((part, i) => <span key={i}><MathText text={part} /></span>)}
    </code>
  );
}

function Periodic() {
  const ptSel = useApp((s) => s.ui.ptSel);
  const setUI = useApp((s) => s.setUI);
  const sel = ptSel ? PT.find((e) => e[0] === ptSel) : null;
  const cells = [];
  for (let per = 1; per <= 4; per++) for (let g = 1; g <= 18; g++) {
    const e = PT.find((x) => x[4] === per && x[5] === g);
    cells.push(e ? (
      <button key={e[0]} className={{ m: "metal", g: "noble", s: "metalloid", n: "" }[e[6]]} aria-pressed={ptSel === e[0]} aria-label={e[2]} onClick={() => setUI({ ptSel: e[0] })}>
        <small>{e[0]}</small><b>{e[1]}</b><small>{comma(e[3])}</small>
      </button>
    ) : <span key={per + "-" + g} />);
  }
  return (
    <>
      <div className="panel">
        {sel ? (
          <div className="flex items-center gap-2.5">
            <div className="min-w-16 text-[40px] font-extrabold text-accent">{sel[1]}</div>
            <div><b>{sel[2]}</b><br /><span className="small muted">Z = {sel[0]}, M ≈ {comma(sel[3])} g/mol, chu kì {sel[4]}, nhóm {sel[5]}, {CAT[sel[6]]}</span></div>
          </div>
        ) : <p className="!m-0">Chạm vào một nguyên tố để xem số hiệu, khối lượng mol, vị trí và loại nguyên tố.</p>}
      </div>
      <div className="panel overflow-x-auto"><div className="pt">{cells}</div></div>
      <p className="small muted">Hiện có 36 nguyên tố đầu (chu kì 1–4). Tím nhạt: kim loại, xanh: á kim, vàng: khí hiếm, trắng: phi kim.<span className="md:hidden"> Trên điện thoại vuốt ngang để xem cả bảng.</span></p>
    </>
  );
}

function Trig() {
  const rows = [
    ["$0$", "$0$", "$1$", "$0$"],
    ["$\\dfrac{\\pi}{6}$ (30°)", "$\\dfrac{1}{2}$", "$\\dfrac{\\sqrt{3}}{2}$", "$\\dfrac{\\sqrt{3}}{3}$"],
    ["$\\dfrac{\\pi}{4}$ (45°)", "$\\dfrac{\\sqrt{2}}{2}$", "$\\dfrac{\\sqrt{2}}{2}$", "$1$"],
    ["$\\dfrac{\\pi}{3}$ (60°)", "$\\dfrac{\\sqrt{3}}{2}$", "$\\dfrac{1}{2}$", "$\\sqrt{3}$"],
    ["$\\dfrac{\\pi}{2}$ (90°)", "$1$", "$0$", "Không xác định"],
    ["$\\pi$ (180°)", "$0$", "$-1$", "$0$"],
  ];
  const extra: [string, string][] = [
    ["Hằng đẳng thức", "$\\sin^2 x + \\cos^2 x = 1$;  $1 + \\tan^2 x = \\dfrac{1}{\\cos^2 x}$"],
    ["Phương trình cơ bản", "$\\sin x = \\sin\\alpha \\Leftrightarrow x = \\alpha + k2\\pi$ hoặc $x = \\pi - \\alpha + k2\\pi$;  $\\cos x = \\cos\\alpha \\Leftrightarrow x = \\pm\\alpha + k2\\pi$"],
  ];
  return (
    <>
      <div className="panel overflow-x-auto">
        <table className="tb"><thead><tr><th>Góc</th><th>sin</th><th>cos</th><th>tan</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} className="!py-2.5"><MathText text={c} /></td>)}</tr>)}</tbody></table>
      </div>
      <div className="panel">
        {[...FORMULAS.filter((f) => ["Công thức cộng", "Nhân đôi"].includes(f[1])).map((f) => [f[1], f[2]] as [string, string]), ...extra].map(([n, v]) => (
          <div className="formula" key={n}><span className="small muted">{n}</span><FormulaLine v={v} /></div>
        ))}
      </div>
    </>
  );
}

function Units() {
  const cat = useApp((s) => s.ui.unitCat);
  const setUI = useApp((s) => s.setUI);
  const c = UNITS[cat], keys = Object.keys(c.u);
  const [val, setVal] = useState("1");
  const [from, setFrom] = useState(keys[0]);
  const f = keys.includes(from) ? from : keys[0];
  const v = parseFloat(val);
  return (
    <>
      <div className="seg">{Object.keys(UNITS).map((k) => <button key={k} aria-pressed={cat === k} onClick={() => setUI({ unitCat: k })}>{k}</button>)}</div>
      <div className="panel mt-3">
        <div className="flex flex-wrap gap-2.5">
          <div className="min-w-[120px] flex-1"><label className="flabel" htmlFor="uv">Giá trị</label><input className="field" id="uv" type="number" inputMode="decimal" value={val} onChange={(e) => setVal(e.target.value)} /></div>
          <div className="min-w-[120px] flex-1"><label className="flabel" htmlFor="uf">Từ đơn vị</label>
            <select className="field" id="uf" value={f} onChange={(e) => setFrom(e.target.value)}>{keys.map((k) => <option key={k}>{k}</option>)}</select></div>
        </div>
        <div className="mt-3">
          {isNaN(v) ? <p className="muted !m-0">Nhập một số để đổi.</p> : keys.filter((k) => k !== f).map((k) => {
            let r: number;
            if (c.temp) { const C = f === "°C" ? v : f === "K" ? v - 273.15 : ((v - 32) * 5) / 9; r = k === "°C" ? C : k === "K" ? C + 273.15 : (C * 9) / 5 + 32; }
            else r = (v * c.u[f]) / c.u[k];
            return <div className="mission" key={k}><span className="flex-1">{k}</span><b>{fmtNum(r)}</b></div>;
          })}
        </div>
      </div>
    </>
  );
}

function Mol() {
  const m = useApp((s) => s.ui.molMode);
  const setUI = useApp((s) => s.setUI);
  const [f, setF] = useState({ mf: "H2SO4", mm: "9.8", mv: "4.958", mc: "24.79", mcm: "0.5", mvl: "200" });
  const inp = (k: keyof typeof f, label: string, type = "number") => (
    <><label className="flabel" htmlFor={k}>{label}</label>
      <input className="field" id={k} type={type} inputMode={type === "number" ? "decimal" : undefined} autoComplete="off" spellCheck={false} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></>
  );
  let out: React.ReactNode;
  try {
    let n: number, extra: string;
    if (m === "m") { const M = molarMass(f.mf); const mm = parseFloat(f.mm); if (isNaN(mm)) throw "m"; n = mm / M; extra = `M = ${fmtNum(M)} g/mol, n = m/M = ${fmtNum(mm)}/${fmtNum(M)}`; }
    else if (m === "v") { const V = parseFloat(f.mv), k = parseFloat(f.mc); if (isNaN(V)) throw "v"; n = V / k; extra = `n = V/${comma(k)} = ${fmtNum(V)}/${comma(k)}`; }
    else { const C = parseFloat(f.mcm), V = parseFloat(f.mvl); if (isNaN(C) || isNaN(V)) throw "c"; n = (C * V) / 1000; extra = `n = C_M·V = ${fmtNum(C)}·${fmtNum(V / 1000)} L`; }
    out = <><div className="text-[28px] font-extrabold text-accent">n = {fmtNum(n)} mol</div><p className="small muted !mb-0 mt-1">{extra}</p></>;
  } catch (e) {
    out = <p className="!m-0 text-bad">{m === "m" && typeof e === "string" && /^[A-Z][a-z]?$/.test(e) ? `Chưa có khối lượng mol của nguyên tố “${e}”.` : "Kiểm tra lại công thức hoặc số liệu. Ví dụ công thức hợp lệ: Ca(OH)2, CuSO4, C2H5OH."}</p>;
  }
  return (
    <>
      <div className="seg">{[["m", "Từ khối lượng"], ["v", "Từ thể tích khí"], ["c", "Từ dung dịch"]].map(([k, l]) => <button key={k} aria-pressed={m === k} onClick={() => setUI({ molMode: k })}>{l}</button>)}</div>
      <div className="panel mt-3">
        {m === "m" && <>{inp("mf", "Công thức hóa học", "text")}{inp("mm", "Khối lượng (gam)")}</>}
        {m === "v" && <>{inp("mv", "Thể tích khí (lít)")}
          <label className="flabel" htmlFor="mc">Điều kiện</label>
          <select className="field" id="mc" value={f.mc} onChange={(e) => setF({ ...f, mc: e.target.value })}>
            <option value="24.79">Điều kiện chuẩn đkc (25 °C, 1 bar): 24,79 L/mol</option>
            <option value="22.4">Đktc (0 °C, 1 atm): 22,4 L/mol</option>
          </select></>}
        {m === "c" && <>{inp("mcm", "Nồng độ mol C_M (mol/L)")}{inp("mvl", "Thể tích dung dịch (mL)")}</>}
        <div className="mt-3.5">{out}</div>
      </div>
    </>
  );
}

function ChemBio() {
  return (
    <>
      <h2 className="!mt-1">Virus và vi khuẩn</h2>
      <div className="panel overflow-x-auto">
        <table className="tb"><thead><tr><th>Đặc điểm</th><th>Virus</th><th>Vi khuẩn</th></tr></thead>
          <tbody>{VIRUS_TABLE.map((r) => <tr key={r[0]}><th>{r[0]}</th><td>{r[1]}</td><td>{r[2]}</td></tr>)}</tbody></table>
      </div>
      <h2>Điều chế và các quá trình</h2>
      <div className="panel">{PROCESSES.map((p) => <div className="formula" key={p[0]}><span className="small muted">{p[0]}</span><code className="!font-semibold">{p[1]}</code></div>)}</div>
    </>
  );
}
