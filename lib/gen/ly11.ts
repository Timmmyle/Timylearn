/* Vật lí 11 – Học kì 1 (Kết nối tri thức): Chương I. Dao động (half 1), Chương II. Sóng (half 2). */
import { mcq, tf, short, frac, tex, vn, need, round, gcd, type Template, type Rng, type GenOut } from "./core.ts";

const S = "Vật lí", G = 11 as const;
const C1 = "Chương I. Dao động";
const C2 = "Chương II. Sóng";

/* ---------------- tiện ích riêng ---------------- */
/** (p/q)·π dạng LaTeX */
function piT(p: number, q = 1): string {
  if (p === 0) return "0";
  const g = gcd(p, q); p /= g; q /= g;
  const s = p < 0 ? "-" : "", a = Math.abs(p), num = a === 1 ? "\\pi" : `${a}\\pi`;
  return q === 1 ? s + num : `${s}\\dfrac{${num}}{${q}}`;
}
/** hạng tử pha ban đầu nối sau ωt */
const phaseTerm = (p: number, q = 1) => (p === 0 ? "" : (p < 0 ? " - " : " + ") + piT(Math.abs(p), q));
/** ω = kπ */
const kpi = (k: number) => (k === 1 ? "\\pi" : `${tex(k)}\\pi`);
/** phương trình li độ (đã bọc $) */
const eqX = (A: number, w: string, p = 0, q = 1) =>
  p === 0 ? `$x = ${tex(A)}\\cos(${w} t)$` : `$x = ${tex(A)}\\cos\\left(${w} t${phaseTerm(p, q)}\\right)$`;
/** p·√n / q rút gọn (p, n, q nguyên dương) */
function surd(p: number, n: number, q = 1): string {
  let a = 1, b = n;
  for (let k = 2; k * k <= b; k++) while (b % (k * k) === 0) { b /= k * k; a *= k; }
  p *= a; const g = gcd(p, q); p /= g; q /= g;
  const rad = b === 1 ? "" : `\\sqrt{${b}}`;
  const num = b === 1 ? String(p) : p === 1 ? rad : `${p}${rad}`;
  return q === 1 ? num : `\\dfrac{${num}}{${q}}`;
}
/** số hiển thị ngoài công thức, tối đa 4 chữ số thập phân */
const n4 = (x: number) => vn(x, 4);
/** số trong công thức */
const t4 = (x: number) => tex(x, 4);

type QA = { q: string; a: string; w: string[]; e: string };
/** câu lí thuyết: chọn 1 mục trong bảng, phương án nhiễu riêng của mục */
function theory(r: Rng, intros: string[], items: QA[]): GenOut {
  const it = r.pick(items), intro = r.pick(intros);
  return { stem: (intro ? intro + " " : "") + it.q, ...mcq(r, it.a, r.shuffle([...it.w])), explanation: it.e };
}
/** cặp phát biểu đúng/sai: chọn ngẫu nhiên bản đúng hay bản sai */
const pickTF = (r: Rng, t: string, f: string, p = 0.5): [string, boolean] => (r.chance(p) ? [t, true] : [f, false]);
const DS = (b: boolean) => (b ? "Đúng" : "Sai");

/* Bảng pha ban đầu theo vị trí: cos φ = x0/A, chiều chuyển động */
type Pos = { lab: (A: number) => string; ang: [number, number] }; // ang: arccos(x0/A) = (p/q)π
const POS: Pos[] = [
  { lab: (A) => `$x = ${A}$ cm (biên dương)`, ang: [0, 1] },
  { lab: (A) => `$x = -${A}$ cm (biên âm)`, ang: [1, 1] },
  { lab: () => `vị trí cân bằng`, ang: [1, 2] },
  { lab: (A) => `$x = ${tex(A / 2)}$ cm`, ang: [1, 3] },
  { lab: (A) => `$x = -${tex(A / 2)}$ cm`, ang: [2, 3] },
  { lab: (A) => `$x = ${surd(A, 2, 2)}$ cm`, ang: [1, 4] },
  { lab: (A) => `$x = -${surd(A, 2, 2)}$ cm`, ang: [3, 4] },
  { lab: (A) => `$x = ${surd(A, 3, 2)}$ cm`, ang: [1, 6] },
  { lab: (A) => `$x = -${surd(A, 3, 2)}$ cm`, ang: [5, 6] },
];

/* ============================ HALF 1 – DAO ĐỘNG ============================ */
const H1: Template[] = [
  {
    id: "l11-ddh-dai-luong", subject: S, grade: G, chapter: C1, topic: "Các đại lượng đặc trưng của dao động điều hòa",
    half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const mode = r.pick([0, 0, 1, 1, 2]);
      const EQ = "$x = A\\cos(\\omega t + \\varphi)$";
      if (mode === 0) {
        const SYM: [string, string][] = [
          ["A", "biên độ của dao động"], ["\\omega", "tần số góc của dao động"], ["\\varphi", "pha ban đầu của dao động"],
          ["(\\omega t + \\varphi)", "pha của dao động tại thời điểm $t$"], ["x", "li độ của vật tại thời điểm $t$"],
        ];
        const [sym, name] = r.pick(SYM);
        const pool = [...SYM.map((s) => s[1]).filter((s) => s !== name), "tần số của dao động", "chu kì của dao động"];
        const stem = r.pick([
          `Một vật dao động điều hòa theo phương trình ${EQ} với $A > 0$, $\\omega > 0$. Đại lượng $${sym}$ được gọi là`,
          `Trong phương trình dao động điều hòa ${EQ}, đại lượng $${sym}$ là`,
        ]);
        return { stem, ...mcq(r, name, r.shuffle(pool)), explanation: `Trong ${EQ}: $A$ là biên độ, $\\omega$ là tần số góc, $\\varphi$ là pha ban đầu, $(\\omega t + \\varphi)$ là pha dao động tại thời điểm $t$, $x$ là li độ. Vậy $${sym}$ là ${name}.` };
      }
      if (mode === 1) {
        const DEF: QA[] = [
          { q: "Chu kì của dao động điều hòa là", a: "khoảng thời gian để vật thực hiện được một dao động toàn phần", w: ["khoảng thời gian ngắn nhất để vật đi từ vị trí biên này đến vị trí biên kia", "số dao động toàn phần vật thực hiện được trong một giây", "khoảng thời gian để vật đi từ vị trí cân bằng ra vị trí biên"], e: "Chu kì $T$ là khoảng thời gian vật thực hiện được một dao động toàn phần. Đi từ biên này sang biên kia chỉ mất $T/2$." },
          { q: "Tần số của dao động điều hòa là", a: "số dao động toàn phần vật thực hiện được trong một giây", w: ["khoảng thời gian để vật thực hiện được một dao động toàn phần", "số dao động toàn phần vật thực hiện được trong một chu kì", "số lần vật đi qua vị trí cân bằng trong một giây"], e: "Tần số $f = \\dfrac{1}{T}$ là số dao động toàn phần thực hiện được trong một giây, đơn vị Hz." },
          { q: "Biên độ của dao động điều hòa là", a: "độ lớn cực đại của li độ", w: ["khoảng cách giữa hai vị trí biên", "quãng đường vật đi được trong một chu kì", "li độ của vật tại thời điểm ban đầu"], e: "Biên độ $A$ là độ lớn cực đại của li độ; khoảng cách giữa hai biên là $2A$, quãng đường trong một chu kì là $4A$." },
          { q: "Li độ của vật dao động điều hòa là", a: "tọa độ của vật tính từ vị trí cân bằng", w: ["quãng đường vật đi được kể từ thời điểm ban đầu", "độ lớn cực đại của độ dời", "khoảng cách từ vật đến vị trí biên"], e: "Li độ $x$ là tọa độ (độ dịch chuyển) của vật tính từ vị trí cân bằng, có thể âm hoặc dương." },
          { q: "Hệ thức liên hệ giữa tần số góc $\\omega$, chu kì $T$ và tần số $f$ là", a: "$\\omega = \\dfrac{2\\pi}{T} = 2\\pi f$", w: ["$\\omega = 2\\pi T = \\dfrac{2\\pi}{f}$", "$\\omega = \\dfrac{T}{2\\pi} = \\dfrac{1}{2\\pi f}$", "$\\omega = \\dfrac{\\pi}{T} = \\pi f$"], e: "$\\omega = \\dfrac{2\\pi}{T} = 2\\pi f$." },
        ];
        return theory(r, ["", "Chọn phát biểu đúng."], DEF);
      }
      const UNIT: [string, string][] = [["tần số góc $\\omega$", "rad/s"], ["tần số $f$", "Hz"], ["chu kì $T$", "s"], ["pha ban đầu $\\varphi$", "rad"], ["biên độ $A$", "m"]];
      const [nm, u] = r.pick(UNIT);
      const pool = ["rad/s", "Hz", "s", "rad", "m", "m/s"].filter((x) => x !== u);
      return { stem: `Trong hệ SI, đơn vị của ${nm} của dao động điều hòa là`, ...mcq(r, u, r.shuffle(pool)), explanation: `Đơn vị SI: $\\omega$ (rad/s), $f$ (Hz), $T$ (s), $\\varphi$ (rad), $A$ (m). Vậy đơn vị của ${nm} là ${u}.` };
    },
  },
  {
    id: "l11-ddh-doc-phuong-trinh", subject: S, grade: G, chapter: C1, topic: "Đọc các đại lượng từ phương trình dao động",
    half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const A = r.int(2, 12), k = r.pick([1, 2, 4, 5, 10, 0.5]);
      const [p, q] = r.pick([[0, 1], [1, 3], [-1, 3], [1, 2], [-1, 2], [1, 6], [-1, 6], [2, 3], [-2, 3], [1, 4], [-1, 4], [3, 4], [1, 1]] as [number, number][]);
      const T = 2 / k, f = k / 2, ask = r.pick(["A", "T", "f", "phi", "w"]);
      const head = `Một vật dao động điều hòa với phương trình ${eqX(A, kpi(k), p, q)} (cm), $t$ tính bằng giây.`;
      const base = `Từ phương trình: $A = ${A}$ cm, $\\omega = ${kpi(k)}$ rad/s, $\\varphi = ${piT(p, q)}$ rad; $T = \\dfrac{2\\pi}{\\omega} = ${t4(T)}$ s, $f = \\dfrac{1}{T} = ${t4(f)}$ Hz.`;
      let Q = "", right = "", wrong: string[] = [];
      if (ask === "A") { Q = "Biên độ dao động của vật là"; right = `${A} cm`; wrong = [`${2 * A} cm`, `${n4(A / 2)} cm`, `${4 * A} cm`]; }
      if (ask === "T") { Q = "Chu kì dao động của vật là"; right = `${n4(T)} s`; wrong = [`${n4(f)} s`, `${n4(1 / k)} s`, `${n4(2 * k)} s`, `${n4(k)} s`, `${n4(4 / k)} s`]; }
      if (ask === "f") { Q = "Tần số dao động của vật là"; right = `${n4(f)} Hz`; wrong = [`${n4(T)} Hz`, `${n4(k)} Hz`, `${n4(2 * k)} Hz`, `${n4(1 / k)} Hz`]; }
      if (ask === "phi") {
        Q = "Pha ban đầu của dao động là"; right = `$${piT(p, q)}$ rad`;
        wrong = [p !== 0 && !(p === 1 && q === 1) ? `$${piT(-p, q)}$ rad` : "$\\pi$ rad", `$${kpi(k)}$ rad`, `$${kpi(k)} t${phaseTerm(p, q)}$ rad`, "$\\dfrac{\\pi}{2}$ rad", "$0$ rad"];
      }
      if (ask === "w") { Q = "Tần số góc của dao động là"; right = `$${kpi(k)}$ rad/s`; wrong = [`$${tex(k)}$ rad/s`, `$${kpi(2 * k)}$ rad/s`, `$${kpi(k / 2)}$ rad/s`, `$${tex(f)}$ rad/s`]; }
      return { stem: `${head} ${Q}`, ...mcq(r, right, wrong), explanation: base };
    },
  },
  {
    id: "l11-ddh-vmax-amax", subject: S, grade: G, chapter: C1, topic: "Tốc độ cực đại, gia tốc cực đại",
    half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const w = r.pick([2, 4, 5, 8, 10, 20]), A = r.int(2, 10), mode = r.pick(["v", "a", "rev"]);
      const useL = r.chance(0.35), useEq = !useL && r.chance(0.5);
      const desc = useEq ? `theo phương trình ${eqX(A, String(w))} (cm), $t$ tính bằng giây` : useL ? `trên một quỹ đạo thẳng dài ${2 * A} cm với tần số góc ${w} rad/s` : `với biên độ ${A} cm và tần số góc ${w} rad/s`;
      const obj = r.pick(["Một vật nhỏ", "Một chất điểm", "Một quả cầu nhỏ", "Một pít-tông"]);
      const Aexp = useL ? `$A = \\dfrac{${2 * A}}{2} = ${A}$ cm` : `$A = ${A}$ cm`;
      if (mode === "v") {
        return { stem: `${obj} dao động điều hòa ${desc}. Tốc độ cực đại của vật là`, ...mcq(r, `${w * A} cm/s`, [`${w * 2 * A} cm/s`, `${w * w * A} cm/s`, `${n4(w * A / 2)} cm/s`]), explanation: `${Aexp}; $v_{\\max} = \\omega A = ${w}\\cdot ${A} = ${w * A}$ cm/s.` };
      }
      if (mode === "a") {
        const a = w * w * A / 100;
        return { stem: `${obj} dao động điều hòa ${desc}. Độ lớn gia tốc cực đại của vật là`, ...mcq(r, `${n4(a)} m/s²`, [`${w * w * A} m/s²`, `${n4(w * A / 100)} m/s²`, `${n4(2 * a)} m/s²`]), explanation: `${Aexp}; $a_{\\max} = \\omega^2 A = ${w}^2\\cdot ${A} = ${w * w * A}$ cm/s² $= ${t4(a)}$ m/s².` };
      }
      const v = w * A, a = w * w * A / 100;
      return { stem: `${obj} dao động điều hòa có tốc độ cực đại ${v} cm/s và độ lớn gia tốc cực đại ${n4(a)} m/s². Biên độ dao động của vật là`, ...mcq(r, `${A} cm`, [`${100 * A} cm`, `${w} cm`, `${2 * A} cm`]), explanation: `$a_{\\max} = ${t4(a)}$ m/s² $= ${w * w * A}$ cm/s². $\\omega = \\dfrac{a_{\\max}}{v_{\\max}} = \\dfrac{${w * w * A}}{${v}} = ${w}$ rad/s, $A = \\dfrac{v_{\\max}}{\\omega} = \\dfrac{${v}}{${w}} = ${A}$ cm.` };
    },
  },
  {
    id: "l11-ddh-ly-thuyet-van-toc-gia-toc", subject: S, grade: G, chapter: C1, topic: "Vận tốc, gia tốc trong dao động điều hòa (lí thuyết)",
    half: 1, level: 1, kind: "mcq",
    make: (r) => theory(r, ["Một vật dao động điều hòa trên trục Ox quanh vị trí cân bằng O.", "Một con lắc lò xo dao động điều hòa.", "Một chất điểm dao động điều hòa."], [
      { q: "Khi vật đi qua vị trí cân bằng thì", a: "tốc độ của vật cực đại, gia tốc bằng 0", w: ["vận tốc bằng 0, gia tốc có độ lớn cực đại", "tốc độ và độ lớn gia tốc đều cực đại", "vận tốc và gia tốc đều bằng 0"], e: "Tại VTCB $x = 0$ nên $a = -\\omega^2x = 0$ và $|v| = \\omega A$ cực đại." },
      { q: "Khi vật ở vị trí biên thì", a: "vận tốc bằng 0, gia tốc có độ lớn cực đại", w: ["tốc độ cực đại, gia tốc bằng 0", "vận tốc và gia tốc đều bằng 0", "tốc độ và độ lớn gia tốc đều cực đại"], e: "Tại biên $|x| = A$: $v = 0$, $|a| = \\omega^2A$ cực đại." },
      { q: "Khi vật đi từ vị trí biên về vị trí cân bằng thì", a: "vật chuyển động nhanh dần", w: ["vật chuyển động chậm dần", "vật chuyển động thẳng đều", "độ lớn gia tốc của vật tăng dần"], e: "Từ biên về VTCB tốc độ tăng (vectơ vận tốc và gia tốc cùng hướng về VTCB) nên vật chuyển động nhanh dần, còn $|a|$ giảm." },
      { q: "Khi vật đi từ vị trí cân bằng ra vị trí biên thì", a: "vật chuyển động chậm dần", w: ["vật chuyển động nhanh dần", "độ lớn gia tốc giảm dần", "tốc độ của vật tăng dần"], e: "Từ VTCB ra biên tốc độ giảm, $|a| = \\omega^2|x|$ tăng: chuyển động chậm dần." },
      { q: "Vectơ gia tốc của vật luôn", a: "hướng về vị trí cân bằng", w: ["hướng ra xa vị trí cân bằng", "cùng hướng với vectơ vận tốc", "hướng theo chiều chuyển động"], e: "$a = -\\omega^2x$ luôn ngược dấu li độ nên vectơ gia tốc luôn hướng về VTCB." },
      { q: "So với li độ, vận tốc của vật biến thiên điều hòa", a: "sớm pha $\\dfrac{\\pi}{2}$", w: ["ngược pha", "cùng pha", "trễ pha $\\dfrac{\\pi}{2}$"], e: "$v = -\\omega A\\sin(\\omega t + \\varphi) = \\omega A\\cos\\left(\\omega t + \\varphi + \\dfrac{\\pi}{2}\\right)$ nên $v$ sớm pha $\\dfrac{\\pi}{2}$ so với $x$." },
      { q: "So với li độ, gia tốc của vật biến thiên điều hòa", a: "ngược pha", w: ["cùng pha", "sớm pha $\\dfrac{\\pi}{2}$", "trễ pha $\\dfrac{\\pi}{2}$"], e: "$a = -\\omega^2x$ nên gia tốc ngược pha với li độ." },
      { q: "Hệ thức giữa gia tốc $a$ và li độ $x$ của vật (tần số góc $\\omega$) là", a: "$a = -\\omega^2x$", w: ["$a = \\omega^2x$", "$a = -\\omega x$", "$a = -\\omega x^2$"], e: "Trong dao động điều hòa $a = -\\omega^2x$." },
      { q: "Vận tốc của vật đổi chiều khi vật", a: "ở vị trí biên", w: ["đi qua vị trí cân bằng", "ở vị trí có li độ bằng nửa biên độ", "có gia tốc bằng 0"], e: "Vật dừng lại và quay đầu ở vị trí biên nên vận tốc đổi chiều tại biên." },
      { q: "Gia tốc của vật đổi chiều khi vật", a: "đi qua vị trí cân bằng", w: ["ở vị trí biên", "có vận tốc bằng 0", "ở vị trí có li độ bằng nửa biên độ"], e: "$a = -\\omega^2x$ đổi dấu khi $x$ đổi dấu, tức khi vật đi qua VTCB." },
      { q: "Tốc độ cực đại của vật được tính bằng", a: "$v_{\\max} = \\omega A$", w: ["$v_{\\max} = \\omega^2A$", "$v_{\\max} = \\dfrac{A}{\\omega}$", "$v_{\\max} = 2\\omega A$"], e: "$v_{\\max} = \\omega A$, còn $a_{\\max} = \\omega^2A$." },
    ]),
  },
  {
    id: "l11-con-lac-lo-xo-chu-ki", subject: S, grade: G, chapter: C1, topic: "Chu kì, tần số con lắc lò xo",
    half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const T = r.pick([0.2, 0.4, 0.5, 0.8, 1]), mg = r.pick([100, 200, 250, 400, 500, 800, 1000]);
      const kk = 40 * (mg / 1000) / (T * T); need(Math.abs(kk - Math.round(kk)) < 1e-6 && kk >= 10 && kk <= 500);
      const k = Math.round(kk), m = mg / 1000, ask = r.pick(["T", "f", "k", "m"]);
      const lx = r.pick(["Một con lắc lò xo", "Một con lắc lò xo nằm ngang", "Một con lắc lò xo treo thẳng đứng"]);
      const sol = `$T = 2\\pi\\sqrt{\\dfrac{m}{k}}$ với $m = ${t4(m)}$ kg, $\\pi^2 = 10$: $T^2 = \\dfrac{4\\pi^2 m}{k} = \\dfrac{40\\cdot ${t4(m)}}{${k}} = ${t4(T * T)}`;
      if (ask === "T") return { stem: `${lx} gồm vật nặng khối lượng ${mg} g và lò xo có độ cứng ${k} N/m. Lấy $\\pi^2 = 10$. Chu kì dao động của con lắc là`, ...mcq(r, `${n4(T)} s`, [`${n4(1 / T)} s`, `${n4(T / 2)} s`, `${n4(2 * T)} s`, `${n4(round(40 / T, 2))} s`]), explanation: `${sol}$ nên $T = ${t4(T)}$ s.` };
      if (ask === "f") return { stem: `${lx} gồm vật nặng khối lượng ${mg} g và lò xo có độ cứng ${k} N/m. Lấy $\\pi^2 = 10$. Tần số dao động của con lắc là`, ...mcq(r, `${n4(1 / T)} Hz`, [`${n4(T)} Hz`, `${n4(1 / (2 * T))} Hz`, `${n4(2 / T)} Hz`, `${n4(4 / T)} Hz`]), explanation: `${sol}$ nên $T = ${t4(T)}$ s và $f = \\dfrac{1}{T} = ${t4(1 / T)}$ Hz.` };
      if (ask === "k") return { stem: `${lx} có vật nặng khối lượng ${mg} g dao động điều hòa với chu kì ${n4(T)} s. Lấy $\\pi^2 = 10$. Độ cứng của lò xo là`, ...mcq(r, `${k} N/m`, [`${n4(k / 4)} N/m`, `${2 * k} N/m`, `${n4(round(40 * m * T * T, 2))} N/m`, `${4 * k} N/m`]), explanation: `$k = \\dfrac{4\\pi^2 m}{T^2} = \\dfrac{40\\cdot ${t4(m)}}{${t4(T)}^2} = ${k}$ N/m.` };
      return { stem: `${lx} có lò xo độ cứng ${k} N/m, dao động điều hòa với chu kì ${n4(T)} s. Lấy $\\pi^2 = 10$. Khối lượng vật nặng là`, ...mcq(r, `${mg} g`, [`${4 * mg} g`, `${n4(mg / 4)} g`, `${2 * mg} g`]), explanation: `$m = \\dfrac{kT^2}{4\\pi^2} = \\dfrac{${k}\\cdot ${t4(T)}^2}{40} = ${t4(m)}$ kg $= ${mg}$ g.` };
    },
  },
  {
    id: "l11-con-lac-don-chu-ki", subject: S, grade: G, chapter: C1, topic: "Chu kì con lắc đơn",
    half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const s = r.pick([0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5]), l = round(s * s, 4), T = round(2 * s, 4);
      const ask = r.pick(["T", "T", "l", "f"]), inCm = r.chance(0.5);
      const ltxt = inCm ? `${n4(l * 100)} cm` : `${n4(l)} m`;
      const place = r.pick(["tại nơi có gia tốc trọng trường $g = \\pi^2$ m/s²", "tại một nơi có $g = \\pi^2$ m/s²"]);
      const conv = inCm ? `$\\ell = ${t4(l * 100)}$ cm $= ${t4(l)}$ m; ` : "";
      if (ask === "T") return { stem: `Một con lắc đơn có chiều dài dây treo ${ltxt} dao động nhỏ ${place}. Chu kì dao động của con lắc là`, ...mcq(r, `${n4(T)} s`, [`${n4(s)} s`, `${n4(round(2 / s, 2))} s`, inCm ? `${n4(20 * s)} s` : `${n4(2 * l)} s`, `${n4(4 * s)} s`]), explanation: `${conv}$T = 2\\pi\\sqrt{\\dfrac{\\ell}{g}} = 2\\pi\\sqrt{\\dfrac{${t4(l)}}{\\pi^2}} = 2\\sqrt{${t4(l)}} = ${t4(T)}$ s.` };
      if (ask === "f") return { stem: `Một con lắc đơn có chiều dài dây treo ${ltxt} dao động nhỏ ${place}. Tần số dao động của con lắc xấp xỉ bằng`, ...mcq(r, `${vn(1 / T, 2)} Hz`, [`${n4(T)} Hz`, `${vn(1 / s, 2)} Hz`, `${vn(s / 2, 2)} Hz`]), explanation: `${conv}$T = 2\\sqrt{${t4(l)}} = ${t4(T)}$ s, $f = \\dfrac{1}{T} \\approx ${tex(1 / T, 2)}$ Hz.` };
      return { stem: `Một con lắc đơn dao động nhỏ ${place} với chu kì ${n4(T)} s. Chiều dài dây treo của con lắc là`, ...mcq(r, `${n4(l)} m`, [`${n4(s)} m`, `${n4(round(T * T, 4))} m`, `${n4(round(T * T / 2, 4))} m`]), explanation: `$T = 2\\pi\\sqrt{\\dfrac{\\ell}{g}} \\Rightarrow \\ell = \\dfrac{gT^2}{4\\pi^2} = \\dfrac{T^2}{4} = \\dfrac{${t4(T)}^2}{4} = ${t4(l)}$ m.` };
    },
  },
  {
    id: "l11-chu-ki-thay-doi", subject: S, grade: G, chapter: C1, topic: "Sự phụ thuộc của chu kì vào các đại lượng",
    half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const SYS: { txt: string; what: string; e: number; f: string }[] = [
        { txt: "con lắc đơn", what: "chiều dài dây treo", e: 0.5, f: "T = 2\\pi\\sqrt{\\dfrac{\\ell}{g}}" },
        { txt: "con lắc đơn", what: "khối lượng vật nặng", e: 0, f: "T = 2\\pi\\sqrt{\\dfrac{\\ell}{g}}" },
        { txt: "con lắc đơn", what: "biên độ góc (vẫn nhỏ)", e: 0, f: "T = 2\\pi\\sqrt{\\dfrac{\\ell}{g}}" },
        { txt: "con lắc lò xo", what: "khối lượng vật nặng", e: 0.5, f: "T = 2\\pi\\sqrt{\\dfrac{m}{k}}" },
        { txt: "con lắc lò xo", what: "độ cứng của lò xo", e: -0.5, f: "T = 2\\pi\\sqrt{\\dfrac{m}{k}}" },
        { txt: "con lắc lò xo", what: "biên độ dao động", e: 0, f: "T = 2\\pi\\sqrt{\\dfrac{m}{k}}" },
      ];
      const sy = r.pick(SYS), n = r.pick([4, 9, 16]), up = r.chance(0.5), ask = r.pick(["chu kì", "tần số"]);
      let ex = sy.e * (up ? 1 : -1) * (ask === "tần số" ? -1 : 1);
      const sq = Math.sqrt(n);
      const lab = (x: number, fac: number) => (x === 0 ? "không đổi" : `${x > 0 ? "tăng" : "giảm"} ${fac} lần`);
      const right = lab(ex, sq);
      const wrong = [lab(-ex || 1, sq), lab(ex || 1, n), lab(-ex || -1, n), "không đổi", lab(1, sq), lab(-1, sq)];
      return {
        stem: `Một ${sy.txt} dao động điều hòa. Nếu ${up ? "tăng" : "giảm"} ${sy.what} ${n} lần và giữ nguyên các yếu tố khác thì ${ask} dao động của con lắc`,
        ...mcq(r, right, wrong),
        explanation: `$${sy.f}$, $f = \\dfrac{1}{T}$. ${sy.e === 0 ? `Chu kì không phụ thuộc ${sy.what} nên ${ask} không đổi.` : `${ask === "chu kì" ? "$T$" : "$f$"} ${sy.e * (ask === "tần số" ? -1 : 1) > 0 ? "tỉ lệ thuận" : "tỉ lệ nghịch"} với căn bậc hai của ${sy.what}, nên khi ${sy.what} ${up ? "tăng" : "giảm"} ${n} lần thì ${ask} ${right}.`}`,
      };
    },
  },
  {
    id: "l11-co-nang", subject: S, grade: G, chapter: C1, topic: "Cơ năng của con lắc",
    half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const mode = r.pick(["kA", "kA", "mw", "mv"]);
      if (mode === "kA") {
        const k = r.pick([20, 40, 50, 80, 100, 120, 200, 250]), A = r.int(2, 10), Am = A / 100, W = 0.5 * k * Am * Am;
        return { stem: `${r.pick(["Một con lắc lò xo", "Một con lắc lò xo nằm ngang", "Một con lắc lò xo treo thẳng đứng"])} có lò xo độ cứng ${k} N/m dao động điều hòa với biên độ ${A} cm. Cơ năng của con lắc là`, ...mcq(r, `${n4(W)} J`, [`${n4(2 * W)} J`, `${n4(0.5 * k * A * A)} J`, `${n4(0.5 * k * Am)} J`]), explanation: `$W = \\dfrac{1}{2}kA^2 = \\dfrac{1}{2}\\cdot ${k}\\cdot ${t4(Am)}^2 = ${t4(W)}$ J.` };
      }
      if (mode === "mw") {
        const mg = r.pick([100, 200, 250, 400, 500]), w = r.pick([5, 10, 20]), A = r.int(2, 8), W = 0.5 * (mg / 1000) * w * w * (A / 100) ** 2 * 1000;
        return { stem: `Một vật nhỏ khối lượng ${mg} g dao động điều hòa với tần số góc ${w} rad/s và biên độ ${A} cm. Cơ năng của vật là`, ...mcq(r, `${n4(W)} mJ`, [`${n4(2 * W)} mJ`, `${n4(W * 1000)} mJ`, `${n4(W / w)} mJ`]), explanation: `$W = \\dfrac{1}{2}m\\omega^2A^2 = \\dfrac{1}{2}\\cdot ${t4(mg / 1000)}\\cdot ${w}^2\\cdot ${t4(A / 100)}^2 = ${tex(W / 1000, 6)}$ J $= ${t4(W)}$ mJ.` };
      }
      const mg = r.pick([100, 200, 250, 400, 500]), v = r.pick([20, 30, 40, 50, 60, 80, 100]), W = 0.5 * (mg / 1000) * (v / 100) ** 2 * 1000;
      return { stem: `Một vật nhỏ khối lượng ${mg} g dao động điều hòa. Khi đi qua vị trí cân bằng, tốc độ của vật là ${v} cm/s. Cơ năng của vật là`, ...mcq(r, `${n4(W)} mJ`, [`${n4(2 * W)} mJ`, `${n4(W * 10000)} mJ`, `${n4(W / 1000)} mJ`]), explanation: `Tại VTCB thế năng bằng 0 nên $W = \\dfrac{1}{2}mv_{\\max}^2 = \\dfrac{1}{2}\\cdot ${t4(mg / 1000)}\\cdot ${t4(v / 100)}^2 = ${tex(W / 1000, 6)}$ J $= ${t4(W)}$ mJ.` };
    },
  },
  {
    id: "l11-dong-nang-the-nang-ti-so", subject: S, grade: G, chapter: C1, topic: "Vị trí động năng bằng n lần thế năng",
    half: 1, level: 3, kind: "mcq",
    make: (r) => {
      const mode = r.pick(["dn", "tn", "ratio"]), A = r.int(2, 12);
      if (mode === "ratio") {
        const s = r.pick([2, 3, 4, 5]); need(A % s === 0);
        const x = A / s, n = s * s - 1;
        return { stem: `Một vật dao động điều hòa với biên độ ${A} cm (mốc thế năng ở vị trí cân bằng). Khi vật có li độ ${x} cm thì tỉ số giữa động năng và thế năng của vật là`, ...mcq(r, `${n}`, [`${s * s}`, `${s - 1}`, `$${frac(1, n)}$`, `${s}`]), explanation: `$\\dfrac{W_đ}{W_t} = \\dfrac{A^2 - x^2}{x^2} = \\dfrac{${A}^2 - ${x}^2}{${x}^2} = ${n}$.` };
      }
      const n = r.pick([1, 3, 8, 15, 24]), s1 = n + 1;
      const dn = surd(A, s1, s1), tn = surd(A, n * s1, s1); // A/√(n+1), A√(n/(n+1))
      const nTxt = n === 1 ? "bằng" : `bằng ${n} lần`;
      if (mode === "dn") {
        return { stem: `Một vật dao động điều hòa với biên độ ${A} cm, mốc thế năng ở vị trí cân bằng. Tại vị trí động năng ${nTxt} thế năng, li độ của vật có độ lớn bằng`, ...mcq(r, `$${dn}$ cm`, [`$${tn}$ cm`, `$${frac(A, s1)}$ cm`, `$${frac(A * n, s1)}$ cm`, `$${frac(A, n + 2)}$ cm`]), explanation: `$W = W_đ + W_t = (${n} + 1)W_t$ nên $\\dfrac{1}{2}kA^2 = ${s1}\\cdot\\dfrac{1}{2}kx^2 \\Rightarrow |x| = \\dfrac{A}{\\sqrt{${s1}}} = ${dn}$ cm.` };
      }
      return { stem: `Một vật dao động điều hòa với biên độ ${A} cm, mốc thế năng ở vị trí cân bằng. Tại vị trí thế năng ${nTxt} động năng, li độ của vật có độ lớn bằng`, ...mcq(r, `$${tn}$ cm`, [`$${dn}$ cm`, `$${frac(A * n, s1)}$ cm`, `$${frac(A, s1)}$ cm`, `$${frac(A, n + 2)}$ cm`]), explanation: `$W_t = ${n}W_đ$ nên $W = W_t + \\dfrac{W_t}{${n}} = \\dfrac{${s1}}{${n}}W_t \\Rightarrow x^2 = \\dfrac{${n}}{${s1}}A^2 \\Rightarrow |x| = A\\sqrt{\\dfrac{${n}}{${s1}}} = ${tn}$ cm.` };
    },
  },
  {
    id: "l11-tat-dan-cuong-buc-ly-thuyet", subject: S, grade: G, chapter: C1, topic: "Dao động tắt dần, cưỡng bức, cộng hưởng (lí thuyết)",
    half: 1, level: 1, kind: "mcq",
    make: (r) => theory(r, [""], [
      { q: "Dao động tắt dần là dao động có", a: "biên độ giảm dần theo thời gian", w: ["biên độ không đổi theo thời gian", "tần số tăng dần theo thời gian", "biên độ tăng dần theo thời gian"], e: "Dao động tắt dần có biên độ (và cơ năng) giảm dần theo thời gian." },
      { q: "Nguyên nhân gây ra dao động tắt dần là", a: "lực cản của môi trường tác dụng lên vật", w: ["trọng lực tác dụng lên vật", "lực đàn hồi của lò xo tác dụng lên vật", "ngoại lực tuần hoàn tác dụng lên vật"], e: "Lực cản (ma sát) của môi trường sinh công âm làm cơ năng giảm dần nên dao động tắt dần." },
      { q: "Trong dao động tắt dần, đại lượng giảm dần theo thời gian là", a: "cơ năng của vật", w: ["khối lượng của vật", "gia tốc trọng trường", "độ cứng của lò xo"], e: "Cơ năng chuyển dần thành nhiệt do lực cản nên giảm dần, kéo theo biên độ giảm." },
      { q: "Dao động cưỡng bức ở giai đoạn ổn định có tần số", a: "bằng tần số của ngoại lực cưỡng bức", w: ["bằng tần số riêng của hệ", "luôn lớn hơn tần số của ngoại lực", "giảm dần theo thời gian"], e: "Ở giai đoạn ổn định, hệ dao động với tần số bằng tần số của ngoại lực cưỡng bức." },
      { q: "Biên độ của dao động cưỡng bức ở giai đoạn ổn định không phụ thuộc vào", a: "pha ban đầu của ngoại lực cưỡng bức", w: ["biên độ của ngoại lực cưỡng bức", "tần số của ngoại lực cưỡng bức", "lực cản của môi trường"], e: "Biên độ dao động cưỡng bức phụ thuộc biên độ, tần số ngoại lực và lực cản; không phụ thuộc pha ban đầu của ngoại lực." },
      { q: "Hiện tượng cộng hưởng xảy ra khi", a: "tần số của ngoại lực cưỡng bức bằng tần số riêng của hệ", w: ["tần số của ngoại lực cưỡng bức lớn hơn nhiều tần số riêng của hệ", "biên độ của ngoại lực cưỡng bức bằng biên độ dao động của hệ", "lực cản của môi trường lớn nhất"], e: "Cộng hưởng: biên độ dao động cưỡng bức đạt cực đại khi $f = f_0$." },
      { q: "Bộ phận giảm xóc của ô tô, xe máy là ứng dụng của", a: "dao động tắt dần", w: ["hiện tượng cộng hưởng", "dao động cưỡng bức", "dao động điều hòa không ma sát"], e: "Giảm xóc dùng dầu nhớt tạo lực cản để dao động của khung xe tắt nhanh: ứng dụng dao động tắt dần." },
      { q: "Hộp đàn của đàn ghi-ta có tác dụng khuếch đại âm thanh do dây đàn phát ra. Đó là ứng dụng của", a: "hiện tượng cộng hưởng", w: ["dao động tắt dần", "hiện tượng giao thoa", "dao động điều hòa"], e: "Không khí trong hộp đàn dao động cộng hưởng với dây đàn, làm âm to hơn." },
      { q: "Một đoàn quân đi đều bước qua một cây cầu có thể làm cầu dao động rất mạnh, thậm chí gãy cầu. Nguyên nhân là do", a: "hiện tượng cộng hưởng", w: ["dao động tắt dần", "trọng lượng của đoàn quân quá lớn", "lực ma sát giữa chân và mặt cầu"], e: "Nhịp bước đều tạo ngoại lực tuần hoàn; nếu tần số bước trùng tần số riêng của cầu thì xảy ra cộng hưởng." },
      { q: "Khi xảy ra cộng hưởng, biên độ dao động cưỡng bức", a: "đạt giá trị cực đại", w: ["bằng 0", "bằng biên độ của ngoại lực", "giảm dần đến 0"], e: "Khi $f = f_0$ biên độ dao động cưỡng bức lớn nhất." },
      { q: "Với cùng một ngoại lực cưỡng bức, lực cản của môi trường càng nhỏ thì", a: "biên độ dao động khi cộng hưởng càng lớn", w: ["biên độ dao động khi cộng hưởng càng nhỏ", "tần số cộng hưởng càng lớn", "hiện tượng cộng hưởng càng khó xảy ra"], e: "Lực cản càng nhỏ thì đỉnh cộng hưởng càng cao và nhọn (cộng hưởng rõ nét)." },
      { q: "Biên độ dao động cưỡng bức càng lớn khi", a: "tần số ngoại lực càng gần tần số riêng của hệ", w: ["tần số ngoại lực càng xa tần số riêng của hệ", "lực cản của môi trường càng lớn", "pha ban đầu của ngoại lực càng lớn"], e: "Biên độ dao động cưỡng bức càng lớn khi $|f - f_0|$ càng nhỏ." },
    ]),
  },
  {
    id: "l11-cong-huong-thuc-te", subject: S, grade: G, chapter: C1, topic: "Cộng hưởng trong thực tế (tính tốc độ)",
    half: 1, level: 3, kind: "mcq",
    make: (r) => {
      const ctx = r.pick(["xo", "xe", "tau", "cau"]);
      if (ctx === "xo" || ctx === "cau") {
        const L = r.pick([40, 45, 50, 55, 60, 65, 70]), T0 = r.pick([0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.2]), v = L / 100 / T0;
        const who = r.pick(["Một người", "Bạn An", "Bạn Minh", "Bạn Lan"]);
        const stem = ctx === "xo"
          ? `${who} xách một xô nước đi trên đường, mỗi bước đi dài ${L} cm. Chu kì dao động riêng của nước trong xô là ${n4(T0)} s. Nước trong xô bị sóng sánh mạnh nhất khi người đó đi với tốc độ xấp xỉ`
          : `${who} đi bộ qua một chiếc cầu tre, mỗi bước đi dài ${L} cm. Chu kì dao động riêng của cầu là ${n4(T0)} s. Cầu rung mạnh nhất khi người đó đi với tốc độ xấp xỉ`;
        return { stem, ...mcq(r, `${vn(v, 2)} m/s`, [`${vn(L / 100 * T0, 2)} m/s`, `${vn(v * 3.6, 2)} m/s`, `${vn(T0 / (L / 100), 2)} m/s`, `${vn(v / 2, 2)} m/s`]), explanation: `Cộng hưởng khi chu kì bước đi bằng chu kì riêng: $\\Delta t = T_0 = ${t4(T0)}$ s. Tốc độ $v = \\dfrac{L}{T_0} = \\dfrac{${t4(L / 100)}}{${t4(T0)}} \\approx ${tex(v, 2)}$ m/s.` };
      }
      const L = ctx === "xe" ? r.pick([8, 9, 10, 12, 15]) : r.pick([10, 12, 12.5, 15]), T0 = r.pick([0.5, 0.6, 0.8, 1, 1.2, 1.5]), v = L / T0;
      const stem = ctx === "xe"
        ? `Một chiếc xe chạy trên con đường lát bê tông, cứ cách ${n4(L)} m lại có một rãnh nhỏ giữa các tấm bê tông. Chu kì dao động riêng của khung xe trên các lò xo giảm xóc là ${n4(T0)} s. Xe bị xóc mạnh nhất khi chạy với tốc độ xấp xỉ`
        : `Một đoàn tàu hỏa chạy trên đường ray, mỗi thanh ray dài ${n4(L)} m, giữa hai thanh ray có một khe hở nhỏ. Chu kì dao động riêng của toa tàu trên các lò xo giảm xóc là ${n4(T0)} s. Toa tàu rung mạnh nhất khi tàu chạy với tốc độ xấp xỉ`;
      return { stem, ...mcq(r, `${vn(v * 3.6, 1)} km/h`, [`${vn(v, 1)} km/h`, `${vn(v / 3.6, 1)} km/h`, `${vn(L * T0 * 3.6, 1)} km/h`, `${vn(v * 7.2, 1)} km/h`]), explanation: `Cộng hưởng khi thời gian đi hết một khoảng $L$ bằng chu kì riêng: $v = \\dfrac{L}{T_0} = \\dfrac{${t4(L)}}{${t4(T0)}} \\approx ${tex(v, 2)}$ m/s $\\approx ${tex(v * 3.6, 1)}$ km/h.` };
    },
  },
  {
    id: "l11-ddh-pha-ban-dau", subject: S, grade: G, chapter: C1, topic: "Xác định pha ban đầu từ điều kiện ban đầu",
    half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const A = r.pick([2, 4, 6, 8, 10, 12]), pos = r.pick(POS), [ap, aq] = pos.ang;
      const atEdge = ap === 0 || (ap === 1 && aq === 1), dirPos = r.chance(0.5);
      const p = atEdge ? ap : dirPos ? -ap : ap; // v > 0 → φ < 0
      const right = `$${piT(p, aq)}$`;
      const others = POS.map((x) => x.ang).filter(([a, b]) => !(a === ap && b === aq)).map(([a, b]) => `$${piT(r.chance(0.5) ? a : -a, b)}$`);
      const wrong = [atEdge ? (ap === 0 ? "$\\pi$" : "$0$") : `$${piT(-p, aq)}$`, ...r.shuffle(others)];
      const when = atEdge ? `vật ở vị trí ${pos.lab(A)}` : `vật đi qua ${pos.lab(A)} theo chiều ${dirPos ? "dương" : "âm"}`;
      return {
        stem: `Một vật dao động điều hòa trên trục Ox với biên độ ${A} cm theo phương trình $x = A\\cos(\\omega t + \\varphi)$ $(-\\pi < \\varphi \\le \\pi)$. Chọn gốc thời gian lúc ${when}. Pha ban đầu $\\varphi$ là`,
        ...mcq(r, right, wrong),
        explanation: `Tại $t = 0$: $\\cos\\varphi = \\dfrac{x_0}{A}$${atEdge ? "" : ` và $v_0 = -\\omega A\\sin\\varphi$ ${dirPos ? "$> 0$ nên $\\sin\\varphi < 0$" : "$< 0$ nên $\\sin\\varphi > 0$"}`}. Suy ra $\\varphi = ${piT(p, aq)}$.`,
      };
    },
  },
  {
    id: "l11-ddh-van-toc-tai-li-do", subject: S, grade: G, chapter: C1, topic: "Liên hệ vận tốc, gia tốc và li độ",
    half: 1, level: 3, kind: "mcq",
    make: (r) => {
      const [a, b, c] = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 6, 10], [4, 3, 5], [12, 5, 13]]);
      const A = c, x = a, o = b, w = r.pick([2, 4, 5, 10, 20]), mode = r.pick(["v", "v", "x", "a"]);
      const obj = r.pick(["Một vật nhỏ", "Một chất điểm", "Vật nặng của một con lắc lò xo"]);
      const head = r.chance(0.5) ? `${obj} dao động điều hòa theo phương trình ${eqX(A, String(w))} (cm), $t$ tính bằng giây.` : `${obj} dao động điều hòa với biên độ ${A} cm và tần số góc ${w} rad/s.`;
      if (mode === "v") return { stem: `${head} Khi vật có li độ ${x} cm thì tốc độ của vật là`, ...mcq(r, `${w * o} cm/s`, [`${w * x} cm/s`, `${w * (A - x)} cm/s`, `${w * A} cm/s`]), explanation: `$v = \\omega\\sqrt{A^2 - x^2} = ${w}\\sqrt{${A}^2 - ${x}^2} = ${w}\\cdot ${o} = ${w * o}$ cm/s.` };
      if (mode === "x") return { stem: `${head} Khi tốc độ của vật là ${w * o} cm/s thì li độ của vật có độ lớn là`, ...mcq(r, `${x} cm`, [`${o} cm`, `${A - o} cm`, `${n4(A / 2)} cm`]), explanation: `$x^2 = A^2 - \\dfrac{v^2}{\\omega^2} = ${A}^2 - \\left(\\dfrac{${w * o}}{${w}}\\right)^2 = ${x * x}$ nên $|x| = ${x}$ cm.` };
      const ac = w * w * x / 100;
      return { stem: `${head} Khi vật có li độ ${x} cm thì độ lớn gia tốc của vật là`, ...mcq(r, `${n4(ac)} m/s²`, [`${w * w * x} m/s²`, `${n4(w * x / 100)} m/s²`, `${n4(w * w * A / 100)} m/s²`]), explanation: `$|a| = \\omega^2|x| = ${w}^2\\cdot ${x} = ${w * w * x}$ cm/s² $= ${t4(ac)}$ m/s².` };
    },
  },
  {
    id: "l11-ddh-thoi-gian-ngan-nhat", subject: S, grade: G, chapter: C1, topic: "Thời gian ngắn nhất giữa hai vị trí",
    half: 1, level: 3, kind: "mcq",
    make: (r) => {
      const PAIRS: [string, string, number][] = [
        ["vị trí biên", "vị trí cân bằng", 1 / 4], ["vị trí $x = A$", "vị trí $x = \\dfrac{A}{2}$", 1 / 6],
        ["vị trí cân bằng", "vị trí $x = \\dfrac{A}{2}$", 1 / 12], ["vị trí $x = \\dfrac{A}{2}$", "vị trí $x = -\\dfrac{A}{2}$", 1 / 6],
        ["vị trí $x = A$", "vị trí $x = -\\dfrac{A}{2}$", 1 / 3], ["vị trí cân bằng", "vị trí $x = \\dfrac{A\\sqrt{2}}{2}$", 1 / 8],
        ["vị trí $x = A$", "vị trí $x = \\dfrac{A\\sqrt{2}}{2}$", 1 / 8], ["vị trí cân bằng", "vị trí $x = \\dfrac{A\\sqrt{3}}{2}$", 1 / 6],
        ["vị trí $x = A$", "vị trí $x = \\dfrac{A\\sqrt{3}}{2}$", 1 / 12], ["vị trí $x = -A$", "vị trí $x = \\dfrac{A}{2}$", 1 / 3],
        ["vị trí $x = A$", "vị trí $x = -A$", 1 / 2],
      ];
      const [p1, p2, fr] = r.pick(PAIRS), T = r.pick([0.6, 1.2, 1.5, 2.4, 3, 4.8, 6]);
      const rev = r.chance(0.5), from = rev ? p2 : p1, to = rev ? p1 : p2;
      const fracs = [1 / 4, 1 / 6, 1 / 12, 1 / 8, 1 / 3, 1 / 2].filter((x) => x !== fr);
      const qn = (x: number) => Math.round(1 / x);
      return {
        stem: `Một vật dao động điều hòa với chu kì ${n4(T)} s và biên độ $A$. Thời gian ngắn nhất để vật đi từ ${from} đến ${to} là`,
        ...mcq(r, `${vn(T * fr, 3)} s`, r.shuffle(fracs).map((x) => `${vn(T * x, 3)} s`)),
        explanation: `Dùng vòng tròn pha: góc quét từ ${from} đến ${to} là $\\Delta\\varphi = ${piT(2, qn(fr))}$, nên $\\Delta t = \\dfrac{\\Delta\\varphi}{2\\pi}T = \\dfrac{T}{${qn(fr)}} = \\dfrac{${t4(T)}}{${qn(fr)}} = ${tex(T * fr, 3)}$ s.`,
      };
    },
  },
  /* ---------- Đúng/Sai half 1 ---------- */
  {
    id: "l11-tf-phuong-trinh-ddh", subject: S, grade: G, chapter: C1, topic: "Phương trình dao động điều hòa (Đ/S)",
    half: 1, level: 2, kind: "tf",
    make: (r) => {
      const A = r.int(2, 10), k = r.pick([1, 2, 4, 5, 10]);
      const [p, q] = r.pick([[1, 3], [-1, 3], [1, 2], [-1, 2], [2, 3], [-2, 3], [1, 6], [-1, 6]] as [number, number][]);
      const T = 2 / k, f = k / 2;
      const s1 = pickTF(r, `Biên độ dao động của vật là ${A} cm.`, `Biên độ dao động của vật là ${2 * A} cm.`);
      const Tw = T === f ? 2 * T : f;
      const s2 = pickTF(r, `Chu kì dao động của vật là ${n4(T)} s.`, `Chu kì dao động của vật là ${n4(Tw)} s.`);
      const s3 = pickTF(r, `Tốc độ cực đại của vật là $${A * k}\\pi$ cm/s.`, `Tốc độ cực đại của vật là $${A * k * k}\\pi^2$ cm/s.`);
      const cosMap: Record<string, string> = { "1,3": tex(A / 2), "2,3": "-" + tex(A / 2), "1,2": "0", "1,6": surd(A, 3, 2) };
      const x0 = cosMap[`${Math.abs(p)},${q}`], dir = p > 0 ? "âm" : "dương";
      const s4 = pickTF(r, `Tại thời điểm $t = 0$, vật đi qua vị trí có li độ $${x0}$ cm theo chiều ${dir}.`, `Tại thời điểm $t = 0$, vật đi qua vị trí có li độ $${x0}$ cm theo chiều ${p > 0 ? "dương" : "âm"}.`);
      return {
        stem: `Một vật dao động điều hòa với phương trình ${eqX(A, kpi(k), p, q)} (cm), $t$ tính bằng giây.`,
        ...tf([s1, s2, s3, s4]),
        explanation: `${DS(s1[1])}: $A = ${A}$ cm. ${DS(s2[1])}: $T = \\dfrac{2\\pi}{\\omega} = \\dfrac{2\\pi}{${kpi(k)}} = ${t4(T)}$ s. ${DS(s3[1])}: $v_{\\max} = \\omega A = ${A * k}\\pi$ cm/s (còn $${A * k * k}\\pi^2$ cm/s² là $a_{\\max}$). ${DS(s4[1])}: $x_0 = ${A}\\cos\\left(${piT(p, q)}\\right) = ${x0}$ cm, $v_0 = -\\omega A\\sin\\varphi$ ${p > 0 ? "$< 0$" : "$> 0$"} nên vật đi theo chiều ${dir}.`,
      };
    },
  },
  {
    id: "l11-tf-nang-luong-lo-xo", subject: S, grade: G, chapter: C1, topic: "Năng lượng con lắc lò xo (Đ/S)",
    half: 1, level: 3, kind: "tf",
    make: (r) => {
      const w = r.pick([5, 10, 20]), mg = r.pick([100, 200, 250, 400, 500, 1000]), m = mg / 1000, k = round(m * w * w, 6);
      need(Number.isInteger(k) && k >= 10 && k <= 400);
      const [x, o, A] = r.pick([[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13]]);
      const W = 0.5 * k * (A / 100) ** 2 * 1000, Wd = 0.5 * k * ((A * A - x * x) / 10000) * 1000, Wt = 0.5 * k * (x * x / 10000) * 1000;
      const s1 = pickTF(r, `Tần số góc của dao động là ${w} rad/s.`, `Tần số góc của dao động là ${w * w} rad/s.`);
      const s2 = pickTF(r, `Cơ năng của con lắc là ${n4(W)} mJ.`, `Cơ năng của con lắc là ${n4(2 * W)} mJ.`);
      const s3 = pickTF(r, `Tốc độ của vật khi đi qua vị trí cân bằng là ${n4(w * A)} cm/s.`, `Tốc độ của vật khi đi qua vị trí cân bằng là ${n4(w * w * A)} cm/s.`);
      const s4 = pickTF(r, `Khi vật có li độ ${x} cm, động năng của vật là ${n4(Wd)} mJ.`, `Khi vật có li độ ${x} cm, động năng của vật là ${n4(Wt)} mJ.`);
      need(Wd !== Wt);
      return {
        stem: `Một con lắc lò xo nằm ngang gồm lò xo có độ cứng ${k} N/m và vật nặng khối lượng ${mg} g. Kéo vật ra khỏi vị trí cân bằng ${A} cm rồi thả nhẹ cho vật dao động điều hòa, bỏ qua mọi ma sát, mốc thế năng ở vị trí cân bằng.`,
        ...tf([s1, s2, s3, s4]),
        explanation: `Thả nhẹ nên $A = ${A}$ cm. ${DS(s1[1])}: $\\omega = \\sqrt{\\dfrac{k}{m}} = \\sqrt{\\dfrac{${k}}{${t4(m)}}} = ${w}$ rad/s. ${DS(s2[1])}: $W = \\dfrac{1}{2}kA^2 = \\dfrac{1}{2}\\cdot ${k}\\cdot ${t4(A / 100)}^2 = ${tex(W / 1000, 6)}$ J $= ${t4(W)}$ mJ. ${DS(s3[1])}: $v_{\\max} = \\omega A = ${w * A}$ cm/s. ${DS(s4[1])}: $W_đ = \\dfrac{1}{2}k(A^2 - x^2) = \\dfrac{1}{2}\\cdot ${k}\\cdot(${t4(A / 100)}^2 - ${t4(x / 100)}^2) = ${t4(Wd)}$ mJ (còn $${t4(Wt)}$ mJ là thế năng).`,
      };
    },
  },
  {
    id: "l11-tf-con-lac-don", subject: S, grade: G, chapter: C1, topic: "Con lắc đơn (Đ/S)",
    half: 1, level: 2, kind: "tf",
    make: (r) => {
      const s = r.pick([0.5, 0.6, 0.8, 0.9, 1, 1.2]), l = round(s * s, 4), T = round(2 * s, 4), mg = r.pick([50, 100, 200, 300]), N = r.int(5, 20);
      const s1 = pickTF(r, `Chu kì dao động nhỏ của con lắc là ${n4(T)} s.`, `Chu kì dao động nhỏ của con lắc là ${vn(2 / s, 2)} s.`);
      need(n4(T) !== vn(2 / s, 2));
      const s2 = pickTF(r, `Nếu thay vật nặng bằng vật có khối lượng ${2 * mg} g thì chu kì dao động nhỏ không đổi.`, `Nếu thay vật nặng bằng vật có khối lượng ${2 * mg} g thì chu kì dao động nhỏ tăng $\\sqrt{2}$ lần.`);
      const s3 = pickTF(r, `Nếu giảm chiều dài dây treo đi 4 lần thì chu kì dao động nhỏ giảm 2 lần.`, `Nếu giảm chiều dài dây treo đi 4 lần thì chu kì dao động nhỏ giảm 4 lần.`);
      const s4 = pickTF(r, `Trong ${n4(N * T)} s, con lắc thực hiện được ${N} dao động toàn phần.`, `Trong ${n4(N * T)} s, con lắc thực hiện được ${2 * N} dao động toàn phần.`);
      return {
        stem: `Một con lắc đơn gồm vật nhỏ khối lượng ${mg} g treo vào sợi dây nhẹ, không dãn dài ${n4(l * 100)} cm, dao động nhỏ tại nơi có gia tốc trọng trường $g = \\pi^2$ m/s².`,
        ...tf([s1, s2, s3, s4]),
        explanation: `${DS(s1[1])}: $T = 2\\pi\\sqrt{\\dfrac{\\ell}{g}} = 2\\sqrt{${t4(l)}} = ${t4(T)}$ s. ${DS(s2[1])}: chu kì con lắc đơn không phụ thuộc khối lượng vật. ${DS(s3[1])}: $T \\sim \\sqrt{\\ell}$ nên $\\ell$ giảm 4 lần thì $T$ giảm 2 lần. ${DS(s4[1])}: số dao động $N = \\dfrac{t}{T} = \\dfrac{${t4(N * T)}}{${t4(T)}} = ${N}$.`,
      };
    },
  },
  {
    id: "l11-tf-tat-dan-cuong-buc", subject: S, grade: G, chapter: C1, topic: "Dao động tắt dần, cưỡng bức, cộng hưởng (Đ/S)",
    half: 1, level: 1, kind: "tf",
    make: (r) => {
      const f0 = r.pick([2, 2.5, 4, 5, 8, 10]), env = r.pick(["không khí", "nước", "dầu nhớt"]);
      const sys = r.pick(["Một con lắc lò xo", "Một con lắc đơn", "Một hệ dao động"]);
      const s1 = pickTF(r, `Nếu không có ngoại lực, dao động của vật trong ${env} là dao động tắt dần.`, `Nếu không có ngoại lực, dao động của vật trong ${env} có biên độ không đổi theo thời gian.`);
      const s2 = pickTF(r, `Ở giai đoạn ổn định, vật dao động với tần số bằng tần số $f$ của ngoại lực.`, `Ở giai đoạn ổn định, vật luôn dao động với tần số bằng tần số riêng ${n4(f0)} Hz.`);
      const fw = r.pick([2 * f0, f0 / 2]);
      const s3 = pickTF(r, `Biên độ dao động cưỡng bức lớn nhất khi $f = ${t4(f0)}$ Hz.`, `Biên độ dao động cưỡng bức lớn nhất khi $f = ${t4(fw)}$ Hz.`);
      const below = r.chance(0.5), f1 = below ? round(f0 / 2, 2) : round(f0 * 1.5, 2), f2 = below ? round(f0 * 2, 2) : round(f0 * 3, 2);
      const tr = below ? "tăng rồi giảm" : "giảm", fl = below ? "luôn tăng" : "tăng rồi giảm";
      const s4 = pickTF(r, `Khi tăng dần $f$ từ ${n4(f1)} Hz đến ${n4(f2)} Hz thì biên độ dao động cưỡng bức ${tr}.`, `Khi tăng dần $f$ từ ${n4(f1)} Hz đến ${n4(f2)} Hz thì biên độ dao động cưỡng bức ${fl}.`);
      return {
        stem: `${sys} có tần số dao động riêng $f_0 = ${t4(f0)}$ Hz, đặt trong ${env}. Tác dụng vào vật một ngoại lực cưỡng bức tuần hoàn có biên độ không đổi và tần số $f$ thay đổi được.`,
        ...tf([s1, s2, s3, s4]),
        explanation: `${DS(s1[1])}: lực cản của ${env} làm biên độ giảm dần nên dao động tắt dần. ${DS(s2[1])}: dao động cưỡng bức ổn định có tần số bằng tần số ngoại lực. ${DS(s3[1])}: cộng hưởng khi $f = f_0 = ${t4(f0)}$ Hz. ${DS(s4[1])}: ${below ? `khoảng $[${t4(f1)}; ${t4(f2)}]$ chứa $f_0$ nên biên độ tăng đến cực đại tại $f_0$ rồi giảm` : `$f$ luôn lớn hơn $f_0$ và ngày càng xa $f_0$ nên biên độ giảm`}.`,
      };
    },
  },
  /* ---------- Trả lời ngắn half 1 ---------- */
  {
    id: "l11-s-chu-ki-lo-xo", subject: S, grade: G, chapter: C1, topic: "Chu kì, tần số con lắc lò xo (trả lời ngắn)",
    half: 1, level: 1, kind: "short",
    make: (r) => {
      const T = r.pick([0.2, 0.4, 0.5, 0.8, 1]), mg = r.pick([100, 200, 250, 400, 500, 800, 1000]);
      const kk = 40 * (mg / 1000) / (T * T); need(Math.abs(kk - Math.round(kk)) < 1e-6 && kk >= 10 && kk <= 500);
      const k = Math.round(kk), askF = r.chance(0.5);
      const sol = `$T = 2\\pi\\sqrt{\\dfrac{m}{k}} = 2\\pi\\sqrt{\\dfrac{${t4(mg / 1000)}}{${k}}} = ${t4(T)}$ s`;
      return {
        stem: `Một con lắc lò xo gồm vật nặng khối lượng ${mg} g và lò xo có độ cứng ${k} N/m dao động điều hòa. Lấy $\\pi^2 = 10$. ${askF ? "Tần số dao động của con lắc là bao nhiêu héc (Hz)?" : "Chu kì dao động của con lắc là bao nhiêu giây?"}`,
        ...short(askF ? 1 / T : T, 2),
        explanation: askF ? `${sol}; $f = \\dfrac{1}{T} = ${t4(1 / T)}$ Hz.` : `${sol}.`,
      };
    },
  },
  {
    id: "l11-s-chieu-dai-con-lac-don", subject: S, grade: G, chapter: C1, topic: "Chiều dài con lắc đơn (trả lời ngắn)",
    half: 1, level: 2, kind: "short",
    make: (r) => {
      const T = r.pick([1, 1.2, 1.4, 1.5, 1.6, 1.8, 2, 2.2, 2.4]), g = r.pick([9.8, 9.81, 10]), l = g * T * T / (4 * Math.PI ** 2);
      const cm = r.chance(0.5);
      need(cm ? true : l < 9.995);
      return {
        stem: `Một con lắc đơn dao động nhỏ tại nơi có gia tốc trọng trường ${n4(g)} m/s² với chu kì ${n4(T)} s. Chiều dài dây treo của con lắc là bao nhiêu ${cm ? "xentimét (làm tròn kết quả đến hàng đơn vị)" : "mét (làm tròn kết quả đến hàng phần trăm)"}?`,
        ...short(cm ? Math.round(l * 100) : l, 2),
        explanation: `$\\ell = \\dfrac{gT^2}{4\\pi^2} = \\dfrac{${t4(g)}\\cdot ${t4(T)}^2}{4\\pi^2} \\approx ${tex(l, 4)}$ m $\\approx ${cm ? tex(Math.round(l * 100), 1) + "$ cm" : tex(l, 2) + "$ m"}.`,
      };
    },
  },
  {
    id: "l11-s-toc-do-tai-li-do", subject: S, grade: G, chapter: C1, topic: "Tốc độ tại một li độ (trả lời ngắn)",
    half: 1, level: 3, kind: "short",
    make: (r) => {
      const [x0, o0, A0] = r.pick([[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13]]);
      const sc = r.pick([1, 0.8, 0.5, 1.2]), A = A0 * sc, x = x0 * sc, o = o0 * sc, w = r.pick([2, 4, 5, 10, 20]);
      const v = w * o; need(Number.isInteger(round(v, 6)));
      const mode = r.chance(0.6);
      return mode ? {
        stem: `Một vật dao động điều hòa với phương trình ${eqX(A, String(w))} (cm), $t$ tính bằng giây. Khi vật có li độ ${n4(x)} cm thì tốc độ của vật là bao nhiêu cm/s?`,
        ...short(Math.round(v), 1),
        explanation: `$v = \\omega\\sqrt{A^2 - x^2} = ${w}\\sqrt{${t4(A)}^2 - ${t4(x)}^2} = ${w}\\cdot ${t4(o)} = ${round(v, 2)}$ cm/s.`,
      } : {
        stem: `Một vật dao động điều hòa với biên độ ${n4(A)} cm. Khi vật có li độ ${n4(x)} cm thì tốc độ của vật là ${round(v, 2)} cm/s. Tần số góc của dao động là bao nhiêu rad/s?`,
        ...short(w, 1),
        explanation: `$\\omega = \\dfrac{v}{\\sqrt{A^2 - x^2}} = \\dfrac{${round(v, 2)}}{\\sqrt{${t4(A)}^2 - ${t4(x)}^2}} = \\dfrac{${round(v, 2)}}{${t4(o)}} = ${w}$ rad/s.`,
      };
    },
  },
  {
    id: "l11-s-dong-nang-the-nang", subject: S, grade: G, chapter: C1, topic: "Động năng, thế năng tại một li độ (trả lời ngắn)",
    half: 1, level: 2, kind: "short",
    make: (r) => {
      const k = r.pick([20, 40, 50, 80, 100, 200]), A = r.int(4, 10), x = r.int(1, A - 1), askD = r.chance(0.6);
      const Wd = 0.5 * k * (A * A - x * x) / 10000 * 1000, Wt = 0.5 * k * x * x / 10000 * 1000, ans = askD ? Wd : Wt;
      return {
        stem: `Một con lắc lò xo có lò xo độ cứng ${k} N/m dao động điều hòa với biên độ ${A} cm, mốc thế năng ở vị trí cân bằng. Khi vật có li độ ${x} cm, ${askD ? "động năng" : "thế năng"} của con lắc là bao nhiêu mJ${Number.isInteger(round(ans, 6)) ? "" : " (làm tròn kết quả đến hàng phần mười)"}?`,
        ...short(ans, 1),
        explanation: askD
          ? `$W_đ = W - W_t = \\dfrac{1}{2}k(A^2 - x^2) = \\dfrac{1}{2}\\cdot ${k}\\cdot(${t4(A / 100)}^2 - ${t4(x / 100)}^2) = ${tex(Wd / 1000, 6)}$ J $= ${t4(Wd)}$ mJ.`
          : `$W_t = \\dfrac{1}{2}kx^2 = \\dfrac{1}{2}\\cdot ${k}\\cdot ${t4(x / 100)}^2 = ${tex(Wt / 1000, 6)}$ J $= ${t4(Wt)}$ mJ.`,
      };
    },
  },
  {
    id: "l11-s-cong-huong-toc-do", subject: S, grade: G, chapter: C1, topic: "Cộng hưởng – tốc độ gây rung mạnh (trả lời ngắn)",
    half: 1, level: 3, kind: "short",
    make: (r) => {
      const xe = r.chance(0.5), L = xe ? r.pick([8, 9, 10, 12, 15]) : r.pick([10, 12, 12.5, 15, 18]), T0 = r.pick([0.6, 0.8, 1, 1.2, 1.5, 2]);
      const v = L / T0 * 3.6;
      return {
        stem: xe
          ? `Một chiếc xe máy chạy trên đường, cứ cách ${n4(L)} m lại có một gờ nhỏ chắn ngang đường. Chu kì dao động riêng của khung xe trên các lò xo giảm xóc là ${n4(T0)} s. Xe bị xóc mạnh nhất khi chạy với tốc độ bao nhiêu km/h (làm tròn kết quả đến hàng phần mười)?`
          : `Một toa tàu chạy trên đường ray, mỗi thanh ray dài ${n4(L)} m. Chu kì dao động riêng của toa tàu trên các lò xo giảm xóc là ${n4(T0)} s. Toa tàu rung mạnh nhất khi tàu chạy với tốc độ bao nhiêu km/h (làm tròn kết quả đến hàng phần mười)?`,
        ...short(v, 1),
        explanation: `Cộng hưởng khi thời gian đi hết khoảng $L$ bằng chu kì riêng: $v = \\dfrac{L}{T_0} = \\dfrac{${t4(L)}}{${t4(T0)}}$ m/s $= \\dfrac{${t4(L)}}{${t4(T0)}}\\cdot 3{,}6 \\approx ${tex(v, 1)}$ km/h.`,
      };
    },
  },
];

/* ============================ HALF 2 – SÓNG ============================ */
type WaveCtx = { name: string; lam: number; f: number; v: number; lu: string; vu: string; conv: number; kind: "am" | "nuoc" | "day" };
/** bối cảnh sóng: v (đơn vị vu) = lam (đơn vị lu) · f · conv */
function waveCtx(r: Rng): WaveCtx {
  const c = r.pick(["am", "amnuoc", "nuoc", "nuoc", "day", "day"]);
  if (c === "am") { const f = r.pick([85, 100, 170, 200, 250, 340, 400, 425, 500, 680, 850, 1000, 1360]); return { name: r.pick(["Một sóng âm truyền trong không khí", "Âm do một chiếc loa phát ra truyền trong không khí", "Âm của một chiếc còi truyền trong không khí"]), f, v: 340, lam: 340 / f, lu: "m", vu: "m/s", conv: 1, kind: "am" }; }
  if (c === "amnuoc") { const f = r.pick([500, 750, 1000, 1500, 2000, 2500, 3000, 5000, 7500]); return { name: r.pick(["Một sóng âm truyền trong nước", "Sóng âm do một thiết bị dưới nước phát ra"]), f, v: 1500, lam: 1500 / f, lu: "m", vu: "m/s", conv: 1, kind: "am" }; }
  if (c === "nuoc") { const f = r.pick([5, 10, 20, 25, 40, 50]), lam = r.pick([0.8, 1, 1.2, 1.5, 2, 2.5, 3, 4]); return { name: r.pick(["Một sóng cơ lan truyền trên mặt nước", "Sóng do một cần rung tạo ra trên mặt nước", "Sóng tròn lan truyền trên mặt hồ nước"]), f, lam, v: round(lam * f, 6), lu: "cm", vu: "cm/s", conv: 1, kind: "nuoc" }; }
  const f = r.pick([10, 20, 25, 40, 50, 100]), lam = r.pick([20, 25, 40, 50, 60, 80, 100]);
  return { name: r.pick(["Một sóng ngang truyền trên một sợi dây đàn hồi rất dài", "Sóng truyền trên một sợi dây cao su căng ngang", "Một sóng cơ truyền dọc theo một sợi dây dài"]), f, lam, v: round(lam * f / 100, 6), lu: "cm", vu: "m/s", conv: 0.01, kind: "day" };
}
const pos = (xs: number[]) => xs.filter((x) => x > 0 && Number.isFinite(x));

const EM = ["sóng vô tuyến", "tia hồng ngoại", "ánh sáng nhìn thấy", "tia tử ngoại", "tia X", "tia gamma"]; // bước sóng giảm dần
type EMSrc = { n: string; u: string; vals: number[]; mul: number; p: string };
const EMSRC: EMSrc[] = [
  { n: "Một đài phát thanh FM phát sóng điện từ", u: "MHz", vals: [75, 96, 100, 120, 150], mul: 1e6, p: "10^6" },
  { n: "Một đài phát thanh AM phát sóng điện từ", u: "kHz", vals: [500, 600, 750, 1000, 1200, 1500], mul: 1e3, p: "10^3" },
  { n: "Một trạm phát sóng điện thoại di động phát sóng điện từ", u: "MHz", vals: [750, 1200, 1500], mul: 1e6, p: "10^6" },
  { n: "Một bộ phát Wi-Fi phát sóng điện từ", u: "GHz", vals: [2.4, 5], mul: 1e9, p: "10^9" },
  { n: "Một lò vi sóng sử dụng sóng điện từ", u: "GHz", vals: [2.5], mul: 1e9, p: "10^9" },
];
const exact4 = (x: number) => x >= 1e-3 && Math.abs(round(x, 4) - x) < 1e-9;

const H2: Template[] = [
  {
    id: "l11-song-khai-niem", subject: S, grade: G, chapter: C2, topic: "Mô tả sóng – khái niệm cơ bản",
    half: 2, level: 1, kind: "mcq",
    make: (r) => theory(r, [""], [
      { q: "Sóng cơ là", a: "dao động cơ lan truyền trong một môi trường", w: ["dao động của mọi điểm trong một môi trường", "sự truyền chuyển động của các phần tử vật chất trong môi trường", "một dạng chuyển động thẳng đều của môi trường"], e: "Sóng cơ là dao động cơ lan truyền trong một môi trường; các phần tử chỉ dao động tại chỗ." },
      { q: "Sóng ngang là sóng có phương dao động của các phần tử môi trường", a: "vuông góc với phương truyền sóng", w: ["trùng với phương truyền sóng", "luôn là phương nằm ngang", "luôn là phương thẳng đứng"], e: "Sóng ngang: phần tử dao động theo phương vuông góc với phương truyền sóng." },
      { q: "Sóng dọc là sóng có phương dao động của các phần tử môi trường", a: "trùng với phương truyền sóng", w: ["vuông góc với phương truyền sóng", "luôn là phương nằm ngang", "luôn là phương thẳng đứng"], e: "Sóng dọc: phần tử dao động dọc theo phương truyền sóng." },
      { q: "Bước sóng là", a: "quãng đường sóng truyền được trong một chu kì", w: ["quãng đường sóng truyền được trong một giây", "khoảng cách giữa hai điểm dao động ngược pha trên cùng một phương truyền sóng", "quãng đường mà phần tử môi trường đi được trong một chu kì"], e: "Bước sóng $\\lambda = vT$ là quãng đường sóng truyền được trong một chu kì (cũng là khoảng cách giữa hai điểm gần nhau nhất dao động cùng pha)." },
      { q: "Sóng cơ không truyền được trong", a: "chân không", w: ["chất rắn", "chất lỏng", "chất khí"], e: "Sóng cơ cần môi trường vật chất để truyền nên không truyền được trong chân không." },
      { q: "Sóng dọc truyền được trong", a: "chất rắn, chất lỏng và chất khí", w: ["chỉ chất rắn và bề mặt chất lỏng", "chân không", "chỉ chất khí"], e: "Sóng dọc (sóng nén – dãn) truyền được trong chất rắn, lỏng và khí." },
      { q: "Hệ thức liên hệ giữa bước sóng $\\lambda$, tốc độ truyền sóng $v$, chu kì $T$ và tần số $f$ của sóng là", a: "$\\lambda = vT = \\dfrac{v}{f}$", w: ["$\\lambda = \\dfrac{v}{T} = vf$", "$\\lambda = \\dfrac{T}{v} = \\dfrac{1}{vf}$", "$\\lambda = 2vT = \\dfrac{2v}{f}$"], e: "$\\lambda = vT = \\dfrac{v}{f}$." },
      { q: "Khi sóng cơ truyền qua một môi trường, đại lượng không được truyền đi theo sóng là", a: "các phần tử vật chất của môi trường", w: ["năng lượng dao động", "pha dao động", "trạng thái dao động"], e: "Sóng truyền năng lượng và pha dao động; các phần tử chỉ dao động quanh vị trí cân bằng của chúng." },
      { q: "Trên cùng một phương truyền sóng, hai điểm gần nhau nhất dao động ngược pha cách nhau", a: "nửa bước sóng", w: ["một bước sóng", "một phần tư bước sóng", "hai bước sóng"], e: "Hai điểm cách nhau $(k + \\tfrac{1}{2})\\lambda$ dao động ngược pha; gần nhất là $\\dfrac{\\lambda}{2}$." },
      { q: "Trên cùng một phương truyền sóng, hai điểm gần nhau nhất dao động cùng pha cách nhau", a: "một bước sóng", w: ["nửa bước sóng", "một phần tư bước sóng", "hai bước sóng"], e: "Hai điểm cách nhau $k\\lambda$ dao động cùng pha; gần nhất là $\\lambda$." },
      { q: "Tần số của sóng là", a: "tần số dao động của các phần tử môi trường khi có sóng truyền qua", w: ["số bước sóng có trên một mét", "quãng đường sóng truyền được trong một giây", "số lần sóng phản xạ trong một giây"], e: "Tần số sóng bằng tần số dao động của các phần tử môi trường (bằng tần số nguồn)." },
      { q: "Cường độ sóng là", a: "năng lượng sóng truyền qua một đơn vị diện tích vuông góc với phương truyền sóng trong một đơn vị thời gian", w: ["năng lượng của nguồn sóng phát ra trong một giây", "biên độ dao động của các phần tử môi trường", "năng lượng sóng truyền đi trong một chu kì"], e: "$I = \\dfrac{E}{S\\Delta t} = \\dfrac{P}{S}$ (W/m²)." },
    ]),
  },
  {
    id: "l11-song-buoc-song-toc-do", subject: S, grade: G, chapter: C2, topic: "Bước sóng, tần số, tốc độ truyền sóng",
    half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const c = waveCtx(r), { lam, f, v, lu, vu, conv } = c, ask = r.pick(["v", "lam", "f", "lamT"]);
      const L = (x: number) => `${n4(x)} ${lu}`, V = (x: number) => `${n4(x)} ${vu}`;
      const convTxt = conv !== 1 ? `$\\lambda = ${t4(lam)}$ cm $= ${t4(lam / 100)}$ m; ` : "";
      const lamSol = `$\\lambda = \\dfrac{v}{f} = \\dfrac{${t4(v)}}{${f}} = ${t4(lam * conv)}$ ${conv !== 1 ? `m $= ${t4(lam)}$ cm` : lu}.`;
      if (ask === "v") return { stem: `${c.name} với tần số ${f} Hz và bước sóng ${L(lam)}. Tốc độ truyền sóng là`, ...mcq(r, V(v), pos([conv !== 1 ? lam * f : 2 * v, lam / f * conv, v / 2, 2 * v, 4 * v]).filter((x) => exact4(x) && x >= 0.01).map(V)), explanation: `${convTxt}$v = \\lambda f = ${t4(lam * conv)}\\cdot ${f} = ${t4(v)}$ ${vu}.` };
      if (ask === "lam") return { stem: `${c.name} với tần số ${f} Hz và tốc độ ${V(v)}. Bước sóng của sóng này là`, ...mcq(r, L(lam), pos([conv !== 1 ? lam * conv : f / v, f / v, 2 * lam, lam / 2, 4 * lam]).filter((x) => exact4(x) && x >= 0.01).map(L)), explanation: lamSol };
      if (ask === "f") return { stem: `${c.name} với tốc độ ${V(v)} và bước sóng ${L(lam)}. Tần số của sóng là`, ...mcq(r, `${f} Hz`, pos([conv !== 1 ? v / lam : lam / v, f / 2, 2 * f, 4 * f]).filter((x) => exact4(x) && x >= 0.01).map((x) => `${n4(x)} Hz`)), explanation: `${convTxt}$f = \\dfrac{v}{\\lambda} = \\dfrac{${t4(v)}}{${t4(lam * conv)}} = ${f}$ Hz.` };
      const T = 1 / f; need(exact4(T));
      return { stem: `${c.name} với chu kì ${n4(T)} s và tốc độ ${V(v)}. Bước sóng của sóng này là`, ...mcq(r, L(lam), pos([conv !== 1 ? lam * conv : v / T, 2 * lam, lam / 2, 4 * lam]).filter((x) => exact4(x) && x >= 0.01).map(L)), explanation: `$\\lambda = vT = ${t4(v)}\\cdot ${t4(T)} = ${t4(lam * conv)}$ ${conv !== 1 ? `m $= ${t4(lam)}$ cm` : lu}.` };
    },
  },
  {
    id: "l11-song-gon-loi", subject: S, grade: G, chapter: C2, topic: "Xác định bước sóng từ gợn sóng, phao nổi",
    half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const mode = r.pick(["gon", "phao", "nguoc"]);
      if (mode === "gon") {
        const lam = r.pick([0.5, 0.8, 1, 1.2, 1.5, 2, 2.5, 3]), n = r.int(3, 9), f = r.pick([5, 10, 20, 25, 40, 50]), d = round((n - 1) * lam, 4), v = round(lam * f, 4);
        const what = r.pick(["gợn lồi", "đỉnh sóng"]);
        return { stem: `Tại điểm O trên mặt nước yên lặng, một cần rung dao động với tần số ${f} Hz tạo ra sóng tròn lan rộng. Người ta đo được khoảng cách giữa ${n} ${what} liên tiếp trên cùng một phương truyền là ${n4(d)} cm. Tốc độ truyền sóng trên mặt nước là`, ...mcq(r, `${n4(v)} cm/s`, [`${vn(d * f / n, 2)} cm/s`, `${n4(d * f)} cm/s`, `${n4(2 * v)} cm/s`, `${vn(d * f / (n + 1), 2)} cm/s`]), explanation: `${n} ${what} liên tiếp có ${n - 1} khoảng $\\lambda$: $\\lambda = \\dfrac{${t4(d)}}{${n - 1}} = ${t4(lam)}$ cm; $v = \\lambda f = ${t4(lam)}\\cdot ${f} = ${t4(v)}$ cm/s.` };
      }
      if (mode === "phao") {
        const T = r.pick([0.5, 1, 1.5, 2, 2.5, 3, 4]), n = r.int(5, 11), t = round((n - 1) * T, 4), lam = r.pick([1, 1.5, 2, 2.5, 3, 4, 5, 6]), v = lam / T;
        const who = r.pick(["Một người ngồi trên bờ biển", "Một ngư dân", "Một bạn học sinh đứng trên cầu cảng"]);
        return { stem: `${who} quan sát thấy một chiếc phao nhô lên cao ${n} lần trong ${n4(t)} s, và khoảng cách giữa hai đỉnh sóng liên tiếp là ${n4(lam)} m. Tốc độ truyền sóng trên mặt biển là`, ...mcq(r, `${vn(v, 2)} m/s`, [`${vn(lam * n / t, 2)} m/s`, `${vn(lam * T, 2)} m/s`, `${vn(2 * v, 2)} m/s`, `${vn(v / 2, 2)} m/s`]), explanation: `Phao nhô lên ${n} lần ứng với ${n - 1} chu kì: $T = \\dfrac{${t4(t)}}{${n - 1}} = ${t4(T)}$ s. $\\lambda = ${t4(lam)}$ m nên $v = \\dfrac{\\lambda}{T} = ${tex(v, 2)}$ m/s.` };
      }
      const lam = r.pick([4, 5, 6, 8, 10, 12, 16, 20]), d = lam / 2, f = r.pick([10, 20, 25, 40, 50]), v = lam * f / 100;
      return { stem: `Một sóng cơ có tần số ${f} Hz truyền trên một sợi dây đàn hồi. Hai điểm gần nhau nhất trên dây dao động ngược pha nhau cách nhau ${n4(d)} cm. Tốc độ truyền sóng trên dây là`, ...mcq(r, `${n4(v)} m/s`, [`${n4(d * f / 100)} m/s`, `${n4(4 * d * f / 100)} m/s`, `${n4(lam * f)} m/s`]), explanation: `Hai điểm gần nhất ngược pha cách nhau $\\dfrac{\\lambda}{2}$ nên $\\lambda = 2\\cdot ${t4(d)} = ${lam}$ cm $= ${t4(lam / 100)}$ m; $v = \\lambda f = ${t4(lam / 100)}\\cdot ${f} = ${t4(v)}$ m/s.` };
    },
  },
  {
    id: "l11-song-doc-ngang-phan-loai", subject: S, grade: G, chapter: C2, topic: "Phân loại sóng dọc, sóng ngang",
    half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const NG = ["sóng truyền trên sợi dây đàn hồi căng ngang khi một đầu dây được rung theo phương thẳng đứng", "sóng trên mặt nước", "sóng điện từ", "sóng S (sóng thứ cấp) của động đất", "sóng truyền trên dây đàn ghi-ta khi được gảy"];
      const DO = ["sóng âm truyền trong không khí", "sóng truyền trên lò xo khi nén, dãn một đầu lò xo theo phương trục lò xo", "sóng P (sóng sơ cấp) của động đất", "sóng siêu âm truyền trong nước"];
      const nd = r.pick([1, 2, 2, 3]);
      const items = r.shuffle([...r.shuffle([...DO]).slice(0, nd).map((t) => ({ t, d: true })), ...r.shuffle([...NG]).slice(0, 4 - nd).map((t) => ({ t, d: false }))]);
      const askD = r.chance(0.5);
      const idx = items.map((x, i) => (x.d === askD ? i + 1 : 0)).filter(Boolean);
      const lab = (s: number[]) => s.map((i) => `(${i})`).join(s.length > 2 ? ", " : " và ").replace(/, (\(\d\))$/, " và $1");
      const all: number[][] = []; for (let m = 1; m < 16; m++) all.push([1, 2, 3, 4].filter((_, i) => m & (1 << i)));
      const key = idx.join(), comp = [1, 2, 3, 4].filter((i) => !idx.includes(i));
      const wrong = [lab(comp), ...r.shuffle(all.filter((s) => s.join() !== key && s.join() !== comp.join() && s.length < 4)).map(lab)];
      return {
        stem: `Xét các sóng sau: ${items.map((x, i) => `(${i + 1}) ${x.t}`).join("; ")}. Trong các sóng trên, những sóng là sóng ${askD ? "dọc" : "ngang"} gồm`,
        ...mcq(r, lab(idx), wrong),
        explanation: `Sóng dọc: ${items.map((x, i) => (x.d ? `(${i + 1})` : "")).filter(Boolean).join(", ")} (phần tử dao động dọc theo phương truyền: sóng âm trong chất lưu, sóng nén – dãn lò xo, sóng P). Sóng ngang: ${items.map((x, i) => (!x.d ? `(${i + 1})` : "")).filter(Boolean).join(", ") || "không có"}.`,
      };
    },
  },
  {
    id: "l11-song-dien-tu-thang", subject: S, grade: G, chapter: C2, topic: "Thang sóng điện từ và ứng dụng",
    half: 2, level: 1, kind: "mcq",
    make: (r) => {
      if (r.chance(0.5)) {
        const ids = r.shuffle([0, 1, 2, 3, 4, 5]).slice(0, 4).sort((a, b) => a - b);
        const ask = r.pick(["bước sóng dài nhất", "bước sóng ngắn nhất", "tần số lớn nhất", "tần số nhỏ nhất"]);
        const ans = ask === "bước sóng dài nhất" || ask === "tần số nhỏ nhất" ? ids[0] : ids[3];
        const lst = r.shuffle(ids.map((i) => EM[i]));
        return { stem: `Trong chân không, xét các bức xạ điện từ: ${lst.join(", ")}. Bức xạ có ${ask} là`, ...mcq(r, EM[ans], ids.filter((i) => i !== ans).map((i) => EM[i])), explanation: `Theo thứ tự bước sóng giảm dần (tần số tăng dần): sóng vô tuyến, tia hồng ngoại, ánh sáng nhìn thấy, tia tử ngoại, tia X, tia gamma. Vậy bức xạ có ${ask} là ${EM[ans]}.` };
      }
      const APP: [string, number][] = [
        ["chụp X-quang (chiếu điện) để chẩn đoán bệnh", 4], ["điều khiển từ xa ti vi, điều hòa", 1], ["khử trùng nước, diệt khuẩn trong bệnh viện", 3],
        ["truyền thông tin trong phát thanh, truyền hình, điện thoại di động", 0], ["xạ trị, tiêu diệt tế bào ung thư", 5], ["sưởi ấm, sấy khô nông sản", 1],
        ["giúp mắt người nhìn thấy các vật", 2], ["kiểm tra hành lí ở sân bay, phát hiện khuyết tật bên trong vật đúc", 4], ["phát hiện tiền giả (làm phát quang mực in)", 3],
      ];
      const [u, i] = r.pick(APP);
      return { stem: `Bức xạ điện từ thường được dùng để ${u} là`, ...mcq(r, EM[i], r.shuffle(EM.filter((_, j) => j !== i))), explanation: `${EM[i][0].toUpperCase() + EM[i].slice(1)} được dùng để ${u}.` };
    },
  },
  {
    id: "l11-song-dien-tu-buoc-song", subject: S, grade: G, chapter: C2, topic: "Bước sóng, tần số sóng điện từ",
    half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const src = r.pick(EMSRC), fv = r.pick(src.vals), lam = 3e8 / (fv * src.mul);
      need(exact4(lam) || lam >= 1);
      const head = `${src.n} có tần số ${n4(fv)} ${src.u}.`;
      if (r.chance(0.6)) {
        const w = pos([lam * 10, lam / 10, lam * 1000, lam / 1000, lam * 100]).filter((x) => exact4(x)).map((x) => `${n4(x)} m`);
        return { stem: `${src.n} có tần số ${n4(fv)} ${src.u}. Lấy tốc độ ánh sáng trong chân không $c = 3\\cdot 10^8$ m/s. Bước sóng của sóng này trong chân không là`, ...mcq(r, `${n4(lam)} m`, w), explanation: `$\\lambda = \\dfrac{c}{f} = \\dfrac{3\\cdot 10^8}{${t4(fv)}\\cdot ${src.p}} = ${t4(lam)}$ m.` };
      }
      void head;
      const w = pos([fv * 10, fv / 10, fv * 1000, fv / 1000, fv * 100]).filter((x) => exact4(x)).map((x) => `${n4(x)} ${src.u}`);
      const nm = src.n.replace(" phát sóng điện từ", "").replace(" sử dụng sóng điện từ", "");
      return { stem: `${nm} sử dụng sóng điện từ có bước sóng ${n4(lam)} m trong chân không. Lấy $c = 3\\cdot 10^8$ m/s. Tần số của sóng này là`, ...mcq(r, `${n4(fv)} ${src.u}`, w), explanation: `$f = \\dfrac{c}{\\lambda} = \\dfrac{3\\cdot 10^8}{${t4(lam)}} = ${t4(fv)}\\cdot ${src.p}$ Hz $= ${t4(fv)}$ ${src.u}.` };
    },
  },
  {
    id: "l11-giao-thoa-loai-diem", subject: S, grade: G, chapter: C2, topic: "Giao thoa sóng – điểm cực đại, cực tiểu",
    half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const lam = r.pick([1, 1.5, 2, 2.5, 3, 4]), k = r.int(1, 4), isMax = r.chance(0.5), d1 = r.int(5, 15);
      const d2 = round(d1 + (isMax ? k : k + 0.5) * lam, 4), viaVF = r.chance(0.4);
      const f = r.pick([10, 20, 25, 40, 50]), v = round(lam * f, 4);
      const src = viaVF ? `dao động cùng pha với tần số ${f} Hz, tốc độ truyền sóng trên mặt nước là ${n4(v)} cm/s` : `dao động cùng pha, phát sóng có bước sóng ${n4(lam)} cm`;
      const right = isMax ? `đường cực đại bậc ${k}` : `đường cực tiểu thứ ${k + 1}`;
      const wrong = isMax ? [`đường cực tiểu thứ ${k}`, `đường cực tiểu thứ ${k + 1}`, `đường cực đại bậc ${k + 1}`, `đường cực đại bậc ${2 * k}`] : [`đường cực đại bậc ${k}`, `đường cực đại bậc ${k + 1}`, `đường cực tiểu thứ ${k}`, `đường cực tiểu thứ ${k + 2}`];
      const M = r.pick(["M", "N", "P"]);
      return {
        stem: `Trên mặt nước có hai nguồn kết hợp $S_1$, $S_2$ ${src}. Điểm ${M} trên mặt nước cách hai nguồn lần lượt ${d1} cm và ${n4(d2)} cm. Điểm ${M} nằm trên`,
        ...mcq(r, right, wrong),
        explanation: `${viaVF ? `$\\lambda = \\dfrac{v}{f} = ${t4(lam)}$ cm. ` : ""}$d_2 - d_1 = ${t4(d2 - d1)}$ cm $= ${isMax ? k : t4(k + 0.5)}\\lambda$. ${isMax ? `Hiệu đường đi bằng số nguyên lần bước sóng ($k = ${k}$) nên ${M} thuộc cực đại bậc ${k}.` : `Hiệu đường đi bằng $(k + 0{,}5)\\lambda$ với $k = ${k}$ nên ${M} thuộc cực tiểu thứ ${k + 1} (tính từ trung trực).`}`,
      };
    },
  },
  {
    id: "l11-young-khoang-van", subject: S, grade: G, chapter: C2, topic: "Giao thoa Young – khoảng vân",
    half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const a = r.pick([0.5, 1, 1.2, 1.5, 2]), D = r.pick([1, 1.2, 1.5, 2, 2.5]), lam = r.pick([0.4, 0.45, 0.5, 0.6, 0.64, 0.7, 0.75]);
      const i = lam * D / a; need(Math.abs(round(i, 3) - i) < 1e-9);
      const head = `Trong thí nghiệm Young về giao thoa ánh sáng, khoảng cách giữa hai khe là ${n4(a)} mm, khoảng cách từ mặt phẳng chứa hai khe đến màn là ${n4(D)} m`;
      if (r.chance(0.6)) return { stem: `${head}, ánh sáng đơn sắc có bước sóng ${n4(lam)} μm. Khoảng vân trên màn là`, ...mcq(r, `${n4(i)} mm`, pos([round(lam * a / D, 4), round(i * 10, 4), round(i / 10, 4), 2 * i]).filter(exact4).map((x) => `${n4(x)} mm`)), explanation: `$i = \\dfrac{\\lambda D}{a} = \\dfrac{${t4(lam)}\\cdot 10^{-6}\\cdot ${t4(D)}}{${t4(a)}\\cdot 10^{-3}} = ${t4(i)}\\cdot 10^{-3}$ m $= ${t4(i)}$ mm.` };
      return { stem: `${head}. Người ta đo được khoảng vân trên màn là ${n4(i)} mm. Bước sóng của ánh sáng dùng trong thí nghiệm là`, ...mcq(r, `${n4(lam)} μm`, pos([round(i * D / a, 4), round(i * a * D, 4), lam * 10, lam / 2]).filter(exact4).map((x) => `${n4(x)} μm`)), explanation: `$\\lambda = \\dfrac{ia}{D} = \\dfrac{${t4(i)}\\cdot 10^{-3}\\cdot ${t4(a)}\\cdot 10^{-3}}{${t4(D)}} = ${t4(lam)}\\cdot 10^{-6}$ m $= ${t4(lam)}$ μm.` };
    },
  },
  {
    id: "l11-young-vi-tri-van", subject: S, grade: G, chapter: C2, topic: "Giao thoa Young – vị trí vân sáng, vân tối",
    half: 2, level: 3, kind: "mcq",
    make: (r) => {
      const i = r.pick([0.4, 0.5, 0.6, 0.8, 1, 1.2, 1.5, 2]), same = r.chance(0.5), st = r.chance(0.5);
      const k1 = r.int(1, 5), k2 = r.int(1, 6);
      const side = same ? "ở cùng một phía" : "ở hai phía";
      let right: number, wrong: number[], q: string, e: string;
      if (!st) {
        need(k1 !== k2);
        const a = Math.min(k1, k2), b = Math.max(k1, k2);
        right = same ? (b - a) * i : (a + b) * i; wrong = [same ? (a + b) * i : (b - a) * i, (b - a + 1) * i, b * i, (a + b - 1) * i];
        q = `vân sáng bậc ${a} và vân sáng bậc ${b} ${side} so với vân sáng trung tâm`;
        e = `$x_{s${a}} = ${a}i$, $x_{s${b}} = ${b}i$; ${same ? `khoảng cách $= (${b} - ${a})i` : `khoảng cách $= (${a} + ${b})i`} = ${t4(round(right, 4))}$ mm.`;
      } else {
        const xs = k1, xt = k2 - 0.5;
        right = same ? Math.abs(xs - xt) * i : (xs + xt) * i; wrong = [same ? (xs + xt) * i : Math.abs(xs - xt) * i, same ? Math.abs(k1 - k2) * i : (k1 + k2) * i, same ? Math.abs(k1 - k2 - 0.5) * i : (k1 + k2 + 0.5) * i, (k1 + k2) * i];
        q = `vân sáng bậc ${k1} và vân tối thứ ${k2} ${side} so với vân sáng trung tâm`;
        e = `$x_{s${k1}} = ${k1}i$, vân tối thứ ${k2}: $x_{t${k2}} = (${k2} - 0{,}5)i = ${tex(xt)}i$; khoảng cách $= ${same ? `|${k1} - ${tex(xt)}|` : `(${k1} + ${tex(xt)})`}i = ${t4(round(right, 4))}$ mm.`;
      }
      right = round(right, 4); need(right > 0);
      return {
        stem: `Trong thí nghiệm Young về giao thoa ánh sáng đơn sắc, khoảng vân trên màn là ${n4(i)} mm. Khoảng cách giữa ${q} là`,
        ...mcq(r, `${n4(right)} mm`, pos(wrong.map((x) => round(x, 4))).map((x) => `${n4(x)} mm`)),
        explanation: e,
      };
    },
  },
  {
    id: "l11-song-dung-ly-thuyet", subject: S, grade: G, chapter: C2, topic: "Sóng dừng (lí thuyết)",
    half: 2, level: 1, kind: "mcq",
    make: (r) => theory(r, ["", "Một sợi dây đàn hồi đang có sóng dừng ổn định."], [
      { q: "Khoảng cách giữa hai nút sóng liên tiếp bằng", a: "nửa bước sóng", w: ["một bước sóng", "một phần tư bước sóng", "hai bước sóng"], e: "Hai nút (hoặc hai bụng) liên tiếp cách nhau $\\dfrac{\\lambda}{2}$." },
      { q: "Khoảng cách giữa một nút sóng và bụng sóng liền kề bằng", a: "một phần tư bước sóng", w: ["nửa bước sóng", "một bước sóng", "hai lần bước sóng"], e: "Nút và bụng liền kề cách nhau $\\dfrac{\\lambda}{4}$." },
      { q: "Khoảng cách giữa hai bụng sóng liên tiếp bằng", a: "nửa bước sóng", w: ["một phần tư bước sóng", "một bước sóng", "hai bước sóng"], e: "Hai bụng liên tiếp cách nhau $\\dfrac{\\lambda}{2}$." },
      { q: "Điều kiện để có sóng dừng trên sợi dây có hai đầu cố định là chiều dài dây bằng", a: "một số nguyên lần nửa bước sóng", w: ["một số lẻ lần một phần tư bước sóng", "một số nguyên lần bước sóng", "một số lẻ lần nửa bước sóng"], e: "Hai đầu cố định: $\\ell = k\\dfrac{\\lambda}{2}$ ($k$ = số bụng)." },
      { q: "Điều kiện để có sóng dừng trên sợi dây có một đầu cố định, một đầu tự do là chiều dài dây bằng", a: "một số lẻ lần một phần tư bước sóng", w: ["một số nguyên lần nửa bước sóng", "một số nguyên lần bước sóng", "một số chẵn lần một phần tư bước sóng"], e: "Một đầu cố định, một đầu tự do: $\\ell = (2k + 1)\\dfrac{\\lambda}{4}$." },
      { q: "Các điểm nút sóng là những điểm", a: "luôn đứng yên", w: ["dao động với biên độ cực đại", "dao động cùng pha với nguồn", "dao động với biên độ bằng nửa biên độ bụng"], e: "Nút sóng là điểm luôn đứng yên (biên độ bằng 0)." },
      { q: "Các điểm bụng sóng là những điểm", a: "dao động với biên độ cực đại", w: ["luôn đứng yên", "dao động với biên độ bằng 0", "không dao động"], e: "Bụng sóng dao động với biên độ cực đại." },
      { q: "Sóng dừng trên dây là kết quả của", a: "sự giao thoa giữa sóng tới và sóng phản xạ trên cùng một phương truyền", w: ["sự giao thoa của hai sóng từ hai nguồn kết hợp trên mặt nước", "sự nhiễu xạ của sóng khi gặp vật cản", "sự tắt dần của sóng khi truyền đi"], e: "Sóng tới và sóng phản xạ giao thoa với nhau tạo thành sóng dừng." },
      { q: "Hai điểm trên dây nằm ở hai bó sóng liền kề (hai bên một nút sóng) dao động", a: "ngược pha nhau", w: ["cùng pha nhau", "lệch pha nhau $\\dfrac{\\pi}{2}$", "lệch pha nhau $\\dfrac{\\pi}{4}$"], e: "Các điểm thuộc hai bó sóng liền kề dao động ngược pha." },
      { q: "Các điểm nằm trên cùng một bó sóng (giữa hai nút liên tiếp) dao động", a: "cùng pha nhau", w: ["ngược pha nhau", "lệch pha nhau $\\dfrac{\\pi}{2}$", "với cùng biên độ"], e: "Các điểm trong cùng một bó sóng dao động cùng pha (biên độ khác nhau)." },
      { q: "Khoảng thời gian giữa hai lần liên tiếp sợi dây duỗi thẳng bằng", a: "nửa chu kì sóng", w: ["một chu kì sóng", "một phần tư chu kì sóng", "hai chu kì sóng"], e: "Dây duỗi thẳng khi các phần tử qua VTCB, xảy ra 2 lần trong một chu kì: cách nhau $\\dfrac{T}{2}$." },
    ]),
  },
  {
    id: "l11-song-dung-hai-dau-co-dinh", subject: S, grade: G, chapter: C2, topic: "Sóng dừng trên dây hai đầu cố định",
    half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const l = r.pick([0.6, 0.8, 0.9, 1, 1.2, 1.5, 1.8, 2, 2.4]), k = r.int(2, 6), f = r.pick([20, 25, 40, 50, 60, 100]);
      const lam = 2 * l / k, v = lam * f; need(Math.abs(round(v, 2) - v) < 1e-9);
      const dv = r.pick([`Một sợi dây đàn hồi AB dài ${n4(l)} m căng ngang, hai đầu cố định`, `Một sợi dây đàn dài ${n4(l * 100)} cm được căng giữa hai điểm cố định`, `Một sợi dây thép dài ${n4(l)} m có hai đầu cố định`]);
      const mode = r.pick(["v", "v", "f", "nut"]);
      const sol = `$\\ell = k\\dfrac{\\lambda}{2}$ với $k = ${k}$ bụng: $\\lambda = \\dfrac{2\\ell}{k} = \\dfrac{2\\cdot ${t4(l)}}{${k}} = ${tex(lam, 4)}$ m`;
      if (mode === "v") return { stem: `${dv}. Khi dây dao động với tần số ${f} Hz thì trên dây có sóng dừng với ${k} bụng sóng. Tốc độ truyền sóng trên dây là`, ...mcq(r, `${vn(v, 2)} m/s`, [l * f / k, 4 * l * f / k, 2 * l * f / (k + 1), 2 * l * f / (k - 1)].map((x) => `${vn(x, 2)} m/s`)), explanation: `${sol}; $v = \\lambda f = ${tex(v, 2)}$ m/s.` };
      if (mode === "f") return { stem: `${dv}. Tốc độ truyền sóng trên dây là ${vn(v, 2)} m/s. Để trên dây có sóng dừng với ${k} bụng sóng thì tần số dao động của dây phải bằng`, ...mcq(r, `${f} Hz`, [f / 2, 2 * f, f * (k + 1) / k, f * (k - 1) / k].map((x) => `${vn(x, 2)} Hz`)), explanation: `${sol}; $f = \\dfrac{v}{\\lambda} = \\dfrac{${tex(v, 2)}}{${tex(lam, 4)}} = ${f}$ Hz.` };
      return { stem: `${dv}. Kích thích cho dây dao động với tần số ${f} Hz, tốc độ truyền sóng trên dây là ${vn(v, 2)} m/s. Trên dây có sóng dừng với số nút sóng (kể cả hai đầu dây) là`, ...mcq(r, `${k + 1}`, [`${k}`, `${k + 2}`, `${2 * k + 1}`, `${k - 1}`]), explanation: `$\\lambda = \\dfrac{v}{f} = ${tex(lam, 4)}$ m; số bụng $k = \\dfrac{2\\ell}{\\lambda} = ${k}$; số nút $= k + 1 = ${k + 1}$.` };
    },
  },
  {
    id: "l11-song-dung-mot-dau-tu-do", subject: S, grade: G, chapter: C2, topic: "Sóng dừng một đầu cố định, một đầu tự do",
    half: 2, level: 3, kind: "mcq",
    make: (r) => {
      const N = r.int(1, 4), ong = r.chance(0.4);
      let lam: number, f: number, stem: string;
      if (ong) {
        f = r.pick([250, 340, 400, 425, 500, 680, 850]); lam = 34000 / f;
        const l = round((2 * N - 1) * lam / 4, 4); need(exact4(l));
        stem = `Một ống thủy tinh thẳng dài ${n4(l)} cm, một đầu kín, một đầu hở. Đặt một âm thoa dao động với tần số ${f} Hz ở miệng ống thì trong cột không khí có sóng dừng với ${N} nút sóng (đầu kín là nút, đầu hở là bụng). Tốc độ truyền âm trong không khí là`;
      } else {
        f = r.pick([10, 20, 25, 40, 50]); lam = r.pick([8, 10, 12, 16, 20, 24, 40]);
        const l = round((2 * N - 1) * lam / 4, 4);
        stem = `Một sợi dây đàn hồi dài ${n4(l)} cm treo thẳng đứng, đầu trên gắn với cần rung dao động với tần số ${f} Hz (coi là nút sóng), đầu dưới tự do. Trên dây có sóng dừng với ${N} nút sóng (kể cả đầu trên). Tốc độ truyền sóng trên dây là`;
      }
      const l = (2 * N - 1) * lam / 4, v = lam * f / 100;
      const w = [N > 1 ? 2 * l * f / (N - 1) / 100 : 2 * v, 4 * l * f / (2 * N + 1) / 100, 2 * l * f / N / 100, l * f / 100, v / 2];
      return {
        stem,
        ...mcq(r, `${vn(v, 2)} m/s`, w.map((x) => `${vn(x, 2)} m/s`)),
        explanation: `Một đầu nút, một đầu bụng: $\\ell = (2n - 1)\\dfrac{\\lambda}{4}$ với $n = ${N}$ nút. $\\lambda = \\dfrac{4\\ell}{${2 * N - 1}} = \\dfrac{4\\cdot ${t4(l)}}{${2 * N - 1}} = ${t4(lam)}$ cm; $v = \\lambda f = ${t4(lam / 100)}\\cdot ${f} = ${tex(v, 2)}$ m/s.`,
      };
    },
  },
  {
    id: "l11-do-toc-do-am", subject: S, grade: G, chapter: C2, topic: "Thực hành đo tốc độ truyền âm",
    half: 2, level: 3, kind: "mcq",
    make: (r) => {
      const f = r.pick([256, 320, 384, 400, 440, 480, 500, 512]), vt = r.int(330, 346), lam = vt / f * 100;
      const l1 = round(lam / 4, 1), l2 = round(3 * lam / 4, 1), two = r.chance(0.6);
      const head = `Trong giờ thực hành đo tốc độ truyền âm trong không khí, một nhóm học sinh đặt một âm thoa có tần số ${f} Hz ở miệng một ống thủy tinh hình trụ có một đầu kín (do mực nước trong ống), thay đổi chiều cao cột không khí trong ống.`;
      if (two) {
        const d = round(l2 - l1, 1), v = 2 * f * d / 100;
        return { stem: `${head} Hai vị trí liên tiếp của mực nước cho âm to nhất ứng với chiều dài cột không khí ${vn(l1, 1)} cm và ${vn(l2, 1)} cm. Tốc độ truyền âm đo được xấp xỉ bằng`, ...mcq(r, `${vn(v, 1)} m/s`, [f * d / 100, 4 * f * d / 100, 2 * f * l2 / 100].map((x) => `${vn(x, 1)} m/s`)), explanation: `Hai lần cộng hưởng liên tiếp cách nhau $\\dfrac{\\lambda}{2}$: $\\lambda = 2(${tex(l2, 1)} - ${tex(l1, 1)}) = ${tex(2 * d, 1)}$ cm. $v = \\lambda f = ${tex(2 * d / 100, 4)}\\cdot ${f} \\approx ${tex(v, 1)}$ m/s.` };
      }
      const v = 4 * f * l1 / 100;
      return { stem: `${head} Khi chiều dài cột không khí là ${vn(l1, 1)} cm thì nghe được âm to nhất lần đầu tiên. Coi miệng ống là bụng sóng. Tốc độ truyền âm đo được xấp xỉ bằng`, ...mcq(r, `${vn(v, 1)} m/s`, [f * l1 / 100, 2 * f * l1 / 100, 8 * f * l1 / 100].map((x) => `${vn(x, 1)} m/s`)), explanation: `Cộng hưởng lần đầu: $\\ell_1 = \\dfrac{\\lambda}{4}$ nên $\\lambda = 4\\cdot ${tex(l1, 1)} = ${tex(4 * l1, 1)}$ cm. $v = \\lambda f = ${tex(4 * l1 / 100, 4)}\\cdot ${f} \\approx ${tex(v, 1)}$ m/s.` };
    },
  },
  {
    id: "l11-giao-thoa-so-cuc-dai", subject: S, grade: G, chapter: C2, topic: "Số điểm cực đại, cực tiểu giữa hai nguồn",
    half: 2, level: 3, kind: "mcq",
    make: (r) => {
      const lam = r.pick([1, 1.2, 1.5, 2, 2.5, 3, 4]), AB = r.int(6, 20), q = AB / lam;
      need(Math.abs(2 * q - Math.round(2 * q)) > 1e-6);
      const nMax = 2 * Math.floor(q) + 1, nMin = 2 * Math.floor(q + 0.5), askMax = r.chance(0.5), viaVF = r.chance(0.4);
      const f = r.pick([10, 20, 25, 40, 50]), v = round(lam * f, 4);
      const src = viaVF ? `dao động cùng pha với tần số ${f} Hz; tốc độ truyền sóng trên mặt nước là ${n4(v)} cm/s` : `dao động cùng pha, phát sóng có bước sóng ${n4(lam)} cm`;
      const n = askMax ? nMax : nMin;
      return {
        stem: `Trên mặt nước có hai nguồn kết hợp A và B cách nhau ${AB} cm, ${src}. Số điểm dao động với biên độ ${askMax ? "cực đại" : "cực tiểu"} trên đoạn thẳng AB là`,
        ...mcq(r, `${n}`, [n + 2, n - 2, n + 1, n - 1].filter((x) => x > 0).map(String)),
        explanation: `${viaVF ? `$\\lambda = \\dfrac{v}{f} = ${t4(lam)}$ cm. ` : ""}${askMax ? `Cực đại: $-AB < k\\lambda < AB \\Leftrightarrow -${tex(q, 2)} < k < ${tex(q, 2)}$ nên $k = -${Math.floor(q)}, \\ldots, ${Math.floor(q)}$: có ${nMax} điểm.` : `Cực tiểu: $-AB < (k + 0{,}5)\\lambda < AB \\Leftrightarrow -${tex(q + 0.5, 2)} < k < ${tex(q - 0.5, 2)}$: có ${nMin} giá trị $k$, tức ${nMin} điểm.`}`,
      };
    },
  },
  /* ---------- Đúng/Sai half 2 ---------- */
  {
    id: "l11-tf-song-co", subject: S, grade: G, chapter: C2, topic: "Sóng cơ – bước sóng, độ lệch pha (Đ/S)",
    half: 2, level: 2, kind: "tf",
    make: (r) => {
      const day = r.chance(0.5), f = r.pick([10, 20, 25, 40, 50]);
      const lam = day ? r.pick([20, 40, 50, 60, 80, 100]) : r.pick([1, 1.5, 2, 2.4, 3, 4]);
      const v = day ? lam * f / 100 : round(lam * f, 4), vu = day ? "m/s" : "cm/s", t = r.pick([2, 3, 5]);
      const head = day ? `Một sóng ngang có tần số ${f} Hz truyền trên một sợi dây đàn hồi rất dài với tốc độ ${n4(v)} m/s.` : `Một cần rung dao động với tần số ${f} Hz tạo ra trên mặt nước một sóng truyền với tốc độ ${n4(v)} cm/s.`;
      const s1 = pickTF(r, `Các phần tử ${day ? "dây" : "nước"} dao động theo phương vuông góc với phương truyền sóng.`, `Các phần tử ${day ? "dây" : "nước"} dao động theo phương trùng với phương truyền sóng.`);
      const s2 = pickTF(r, `Bước sóng của sóng là ${n4(lam)} cm.`, `Bước sóng của sóng là ${n4(day ? lam / 100 : 2 * lam)} cm.`);
      const dist = v * t; // quãng đường sóng truyền
      const s3 = pickTF(r, `Trong ${t} s, sóng truyền đi được quãng đường ${n4(dist)} ${day ? "m" : "cm"}.`, `Trong ${t} s, sóng truyền đi được quãng đường ${n4(lam * t)} ${day ? "m" : "cm"}.`);
      need(n4(dist) !== n4(lam * t));
      const m = r.int(1, 3), half = r.chance(0.5), d = round((half ? m + 0.5 : m) * lam, 4), claimNg = r.chance(0.5);
      const s4: [string, boolean] = [`Hai điểm trên cùng một phương truyền sóng cách nhau ${n4(d)} cm dao động ${claimNg ? "ngược pha" : "cùng pha"} nhau.`, claimNg === half];
      return {
        stem: head,
        ...tf([s1, s2, s3, s4]),
        explanation: `${DS(s1[1])}: ${day ? "sóng trên dây là sóng ngang" : "sóng trên mặt nước là sóng ngang"}. ${DS(s2[1])}: $\\lambda = \\dfrac{v}{f} = \\dfrac{${t4(v)}}{${f}} = ${day ? `${t4(lam / 100)}$ m $= ${t4(lam)}$ cm` : `${t4(lam)}$ cm`}. ${DS(s3[1])}: $s = vt = ${t4(v)}\\cdot ${t} = ${t4(dist)}$ ${day ? "m" : "cm"}. ${DS(s4[1])}: $d = ${t4(d)}$ cm $= ${half ? tex(m + 0.5) : m}\\lambda$ nên hai điểm dao động ${half ? "ngược pha" : "cùng pha"}.`,
      };
    },
  },
  {
    id: "l11-tf-young", subject: S, grade: G, chapter: C2, topic: "Giao thoa ánh sáng Young (Đ/S)",
    half: 2, level: 3, kind: "tf",
    make: (r) => {
      const a = r.pick([0.5, 1, 1.5, 2]), D = r.pick([1, 1.5, 2]), lam = r.pick([0.4, 0.5, 0.6, 0.75]);
      const i = lam * D / a; need(exact4(i));
      const k = r.int(2, 5), kt = r.int(2, 5), dD = 0.5, i2 = lam * (D + dD) / a; need(exact4(i2));
      const s1 = pickTF(r, `Khoảng vân trên màn là ${n4(i)} mm.`, `Khoảng vân trên màn là ${n4(round(lam * a / D, 4))} mm.`);
      need(n4(i) !== n4(round(lam * a / D, 4)));
      const s2 = pickTF(r, `Vân sáng bậc ${k} cách vân sáng trung tâm ${n4(k * i)} mm.`, `Vân sáng bậc ${k} cách vân sáng trung tâm ${n4((k - 0.5) * i)} mm.`);
      const s3 = pickTF(r, `Vân tối thứ ${kt} cách vân sáng trung tâm ${n4((kt - 0.5) * i)} mm.`, `Vân tối thứ ${kt} cách vân sáng trung tâm ${n4(kt * i)} mm.`);
      const s4 = pickTF(r, `Nếu dịch màn ra xa mặt phẳng chứa hai khe thêm ${vn(dD)} m thì khoảng vân bằng ${n4(i2)} mm.`, `Nếu dịch màn ra xa mặt phẳng chứa hai khe thêm ${vn(dD)} m thì khoảng vân bằng ${n4(round(lam * (D - dD) / a, 4))} mm.`);
      need(D - dD > 0);
      return {
        stem: `Trong thí nghiệm Young về giao thoa ánh sáng, khoảng cách giữa hai khe là ${n4(a)} mm, khoảng cách từ mặt phẳng chứa hai khe đến màn là ${n4(D)} m, ánh sáng đơn sắc có bước sóng ${n4(lam)} μm.`,
        ...tf([s1, s2, s3, s4]),
        explanation: `${DS(s1[1])}: $i = \\dfrac{\\lambda D}{a} = \\dfrac{${t4(lam)}\\cdot ${t4(D)}}{${t4(a)}} = ${t4(i)}$ mm. ${DS(s2[1])}: $x_s = ki = ${k}\\cdot ${t4(i)} = ${t4(k * i)}$ mm. ${DS(s3[1])}: $x_t = (k - 0{,}5)i = ${tex(kt - 0.5)}\\cdot ${t4(i)} = ${t4((kt - 0.5) * i)}$ mm. ${DS(s4[1])}: $i' = \\dfrac{\\lambda(D + ${tex(dD)})}{a} = \\dfrac{${t4(lam)}\\cdot ${t4(D + dD)}}{${t4(a)}} = ${t4(i2)}$ mm.`,
      };
    },
  },
  {
    id: "l11-tf-song-dung", subject: S, grade: G, chapter: C2, topic: "Sóng dừng trên dây (Đ/S)",
    half: 2, level: 3, kind: "tf",
    make: (r) => {
      const l = r.pick([0.6, 0.8, 0.9, 1, 1.2, 1.5, 1.8, 2]), k = r.int(2, 6), f = r.pick([20, 25, 40, 50, 60, 100]);
      const lam = 2 * l / k, v = lam * f; need(Math.abs(round(v, 2) - v) < 1e-9 && Math.abs(round(lam, 4) - lam) < 1e-9);
      const f2 = f * (k + 1) / k, f2w = f * k / (k + 1); need(Math.abs(round(f2, 2) - f2) < 1e-9 && Math.abs(round(f2w, 2) - f2w) < 1e-9);
      const s1 = pickTF(r, `Trên dây có ${k + 1} nút sóng (kể cả hai đầu dây).`, `Trên dây có ${k} nút sóng (kể cả hai đầu dây).`);
      const s2 = pickTF(r, `Bước sóng trên dây là ${n4(lam * 100)} cm.`, `Bước sóng trên dây là ${n4(round(lam * 50, 4))} cm.`);
      const s3 = pickTF(r, `Tốc độ truyền sóng trên dây là ${vn(v, 2)} m/s.`, `Tốc độ truyền sóng trên dây là ${vn(v / 2, 2)} m/s.`);
      const s4 = pickTF(r, `Giữ nguyên tốc độ truyền sóng, để trên dây có sóng dừng với ${k + 1} bụng sóng thì tần số phải là ${vn(f2, 2)} Hz.`, `Giữ nguyên tốc độ truyền sóng, để trên dây có sóng dừng với ${k + 1} bụng sóng thì tần số phải là ${vn(f2w, 2)} Hz.`);
      return {
        stem: `Một sợi dây đàn hồi dài ${n4(l * 100)} cm có hai đầu cố định. Khi dây dao động với tần số ${f} Hz thì trên dây có sóng dừng với ${k} bụng sóng.`,
        ...tf([s1, s2, s3, s4]),
        explanation: `${DS(s1[1])}: hai đầu cố định, $k$ bụng thì có $k + 1 = ${k + 1}$ nút. ${DS(s2[1])}: $\\ell = k\\dfrac{\\lambda}{2} \\Rightarrow \\lambda = \\dfrac{2\\cdot ${t4(l * 100)}}{${k}} = ${t4(lam * 100)}$ cm. ${DS(s3[1])}: $v = \\lambda f = ${t4(lam)}\\cdot ${f} = ${tex(v, 2)}$ m/s. ${DS(s4[1])}: $f = \\dfrac{kv}{2\\ell}$ tỉ lệ với số bụng nên $f' = ${f}\\cdot\\dfrac{${k + 1}}{${k}} = ${tex(f2, 2)}$ Hz.`,
      };
    },
  },
  {
    id: "l11-tf-song-dien-tu", subject: S, grade: G, chapter: C2, topic: "Sóng điện từ (Đ/S)",
    half: 2, level: 1, kind: "tf",
    make: (r) => {
      const src = r.pick(EMSRC), fv = r.pick(src.vals), lam = 3e8 / (fv * src.mul);
      need(exact4(lam) || lam >= 1);
      const s1 = pickTF(r, "Sóng điện từ truyền được trong chân không.", "Sóng điện từ không truyền được trong chân không.");
      const s2 = pickTF(r, "Sóng điện từ là sóng ngang.", "Sóng điện từ là sóng dọc.");
      const lw = lam * 10;
      const s3 = pickTF(r, `Bước sóng của sóng này trong chân không là ${n4(lam)} m.`, `Bước sóng của sóng này trong chân không là ${n4(lw)} m.`);
      const s4 = pickTF(r, "Sóng này có bước sóng dài hơn bước sóng của ánh sáng nhìn thấy.", "Sóng này có bước sóng ngắn hơn bước sóng của tia tử ngoại.");
      return {
        stem: `${src.n} có tần số ${n4(fv)} ${src.u}. Lấy tốc độ ánh sáng trong chân không $c = 3\\cdot 10^8$ m/s.`,
        ...tf([s1, s2, s3, s4]),
        explanation: `${DS(s1[1])}: sóng điện từ lan truyền được cả trong chân không với tốc độ $c$. ${DS(s2[1])}: $\\vec{E}$ và $\\vec{B}$ vuông góc với phương truyền nên sóng điện từ là sóng ngang. ${DS(s3[1])}: $\\lambda = \\dfrac{c}{f} = \\dfrac{3\\cdot 10^8}{${t4(fv)}\\cdot ${src.p}} = ${t4(lam)}$ m. ${DS(s4[1])}: đây là sóng vô tuyến, có bước sóng dài hơn ánh sáng nhìn thấy (cỡ $10^{-7}$ m) và dài hơn tia tử ngoại.`,
      };
    },
  },
  /* ---------- Trả lời ngắn half 2 ---------- */
  {
    id: "l11-s-buoc-song", subject: S, grade: G, chapter: C2, topic: "Bước sóng, tốc độ truyền sóng (trả lời ngắn)",
    half: 2, level: 1, kind: "short",
    make: (r) => {
      const c = waveCtx(r), askV = r.chance(0.4);
      if (askV) return { stem: `${c.name} với tần số ${c.f} Hz và bước sóng ${n4(c.lam)} ${c.lu}. Tốc độ truyền sóng là bao nhiêu ${c.vu}?`, ...short(c.v, 2), explanation: `${c.conv !== 1 ? `$\\lambda = ${t4(c.lam)}$ cm $= ${t4(c.lam / 100)}$ m; ` : ""}$v = \\lambda f = ${t4(c.lam * c.conv)}\\cdot ${c.f} = ${t4(c.v)}$ ${c.vu}.` };
      return { stem: `${c.name} với tần số ${c.f} Hz và tốc độ ${n4(c.v)} ${c.vu}. Bước sóng của sóng này là bao nhiêu ${c.lu === "m" ? "mét" : "xentimét"}?`, ...short(c.lam, 2), explanation: `$\\lambda = \\dfrac{v}{f} = \\dfrac{${t4(c.v)}}{${c.f}} = ${t4(c.lam * c.conv)}$ ${c.conv !== 1 ? `m $= ${t4(c.lam)}$ cm` : c.lu}.` };
    },
  },
  {
    id: "l11-s-khoang-van", subject: S, grade: G, chapter: C2, topic: "Khoảng vân, vị trí vân (trả lời ngắn)",
    half: 2, level: 2, kind: "short",
    make: (r) => {
      const a = r.pick([0.5, 0.8, 1, 1.2, 1.5, 2]), D = r.pick([1, 1.2, 1.5, 2, 2.5]), lam = r.pick([0.4, 0.45, 0.5, 0.55, 0.6, 0.64, 0.7, 0.75]);
      const i = lam * D / a, k = r.int(2, 6), mode = r.pick(["i", "xs", "xt"]);
      const x = mode === "i" ? i : mode === "xs" ? k * i : (k - 0.5) * i;
      const exact = Math.abs(round(x, 2) - x) < 1e-9;
      const what = mode === "i" ? "Khoảng vân trên màn" : mode === "xs" ? `Khoảng cách từ vân sáng trung tâm đến vân sáng bậc ${k}` : `Khoảng cách từ vân sáng trung tâm đến vân tối thứ ${k}`;
      return {
        stem: `Trong thí nghiệm Young về giao thoa ánh sáng, khoảng cách giữa hai khe là ${n4(a)} mm, khoảng cách từ mặt phẳng chứa hai khe đến màn là ${n4(D)} m, ánh sáng đơn sắc có bước sóng ${n4(lam)} μm. ${what} là bao nhiêu milimét${exact ? "" : " (làm tròn kết quả đến hàng phần trăm)"}?`,
        ...short(x, 2),
        explanation: `$i = \\dfrac{\\lambda D}{a} = \\dfrac{${t4(lam)}\\cdot ${t4(D)}}{${t4(a)}} ${Math.abs(round(i, 4) - i) < 1e-9 ? "=" : "\\approx"} ${t4(i)}$ mm${mode === "i" ? "" : mode === "xs" ? `; $x_s = ${k}i ${exact ? "=" : "\\approx"} ${tex(x, 2)}$ mm` : `; $x_t = (${k} - 0{,}5)i ${exact ? "=" : "\\approx"} ${tex(x, 2)}$ mm`}.`,
      };
    },
  },
  {
    id: "l11-s-song-dung-toc-do", subject: S, grade: G, chapter: C2, topic: "Sóng dừng – tốc độ, tần số (trả lời ngắn)",
    half: 2, level: 2, kind: "short",
    make: (r) => {
      const lcm = r.pick([45, 50, 60, 64, 65, 70, 75, 80, 90, 100, 120]), k = r.int(1, 5), f = r.pick([50, 60, 80, 98, 100, 110, 120, 196, 220]);
      const v = 2 * lcm / 100 * f / k, askF = r.chance(0.3);
      const ctx = k === 1 ? r.pick([`Một dây đàn ghi-ta dài ${lcm} cm giữa hai điểm cố định. Khi gảy, dây phát âm cơ bản (trên dây có sóng dừng với 1 bụng sóng) có tần số ${f} Hz.`, `Một sợi dây đàn dài ${lcm} cm có hai đầu cố định dao động với tần số ${f} Hz, trên dây có sóng dừng với 1 bụng sóng.`]) : `Một sợi dây đàn hồi dài ${lcm} cm có hai đầu cố định dao động với tần số ${f} Hz, trên dây có sóng dừng với ${k} bụng sóng.`;
      if (askF) {
        const k2 = k + 1, f2 = f * k2 / k; need(Math.abs(round(f2, 1) - f2) < 1e-9);
        return { stem: `${ctx} Giữ nguyên lực căng dây, để trên dây có sóng dừng với ${k2} bụng sóng thì tần số dao động phải bằng bao nhiêu Hz?`, ...short(f2, 1), explanation: `$f = \\dfrac{kv}{2\\ell}$, $v$ không đổi nên $f$ tỉ lệ với số bụng: $f' = ${f}\\cdot\\dfrac{${k2}}{${k}} = ${tex(f2, 1)}$ Hz.` };
      }
      const exact = Math.abs(round(v, 1) - v) < 1e-9;
      return { stem: `${ctx} Tốc độ truyền sóng trên dây là bao nhiêu m/s${exact ? "" : " (làm tròn kết quả đến hàng phần mười)"}?`, ...short(v, 1), explanation: `$\\ell = k\\dfrac{\\lambda}{2} \\Rightarrow \\lambda = \\dfrac{2\\cdot ${t4(lcm / 100)}}{${k}} ${Math.abs(round(2 * lcm / 100 / k, 4) - 2 * lcm / 100 / k) < 1e-9 ? "=" : "\\approx"} ${t4(2 * lcm / 100 / k)}$ m; $v = \\lambda f ${exact ? "=" : "\\approx"} ${tex(v, 1)}$ m/s.` };
    },
  },
  {
    id: "l11-s-so-cuc-dai", subject: S, grade: G, chapter: C2, topic: "Số điểm cực đại, cực tiểu (trả lời ngắn)",
    half: 2, level: 3, kind: "short",
    make: (r) => {
      const f = r.pick([10, 20, 25, 40, 50]), lam = r.pick([1, 1.2, 1.5, 2, 2.5, 3, 4]), v = round(lam * f, 4), AB = r.int(6, 24), q = AB / lam;
      need(Math.abs(2 * q - Math.round(2 * q)) > 1e-6);
      const nMax = 2 * Math.floor(q) + 1, nMin = 2 * Math.floor(q + 0.5), askMax = r.chance(0.5);
      return {
        stem: `Ở mặt chất lỏng có hai nguồn kết hợp A, B cách nhau ${AB} cm, dao động cùng pha theo phương thẳng đứng với tần số ${f} Hz. Tốc độ truyền sóng ở mặt chất lỏng là ${n4(v)} cm/s. Trên đoạn thẳng AB có bao nhiêu điểm dao động với biên độ ${askMax ? "cực đại" : "cực tiểu"}?`,
        ...short(askMax ? nMax : nMin, 1),
        explanation: `$\\lambda = \\dfrac{v}{f} = ${t4(lam)}$ cm, $\\dfrac{AB}{\\lambda} \\approx ${tex(q, 2)}$. ${askMax ? `Cực đại: $-${tex(q, 2)} < k < ${tex(q, 2)}$, $k$ nguyên: ${nMax} điểm.` : `Cực tiểu: $-${tex(q, 2)} < k + 0{,}5 < ${tex(q, 2)}$, $k$ nguyên: ${nMin} điểm.`}`,
      };
    },
  },
  {
    id: "l11-s-toc-do-am", subject: S, grade: G, chapter: C2, topic: "Đo tốc độ truyền âm (trả lời ngắn)",
    half: 2, level: 3, kind: "short",
    make: (r) => {
      const f = r.pick([256, 320, 384, 400, 440, 480, 500, 512]), vt = r.int(330, 346), lam = vt / f * 100;
      const l1 = round(lam / 4, 1), l2 = round(3 * lam / 4, 1), d = round(l2 - l1, 1), v = 2 * f * d / 100;
      return {
        stem: `Để đo tốc độ truyền âm trong không khí, một học sinh dùng âm thoa có tần số ${f} Hz đặt ở miệng một ống thủy tinh có cột không khí với một đầu kín (mặt nước), chiều dài cột không khí thay đổi được. Học sinh nghe thấy âm to nhất khi chiều dài cột không khí là ${vn(l1, 1)} cm và lần tiếp theo là ${vn(l2, 1)} cm. Tốc độ truyền âm đo được là bao nhiêu m/s (làm tròn kết quả đến hàng đơn vị)?`,
        ...short(Math.round(v), 1),
        explanation: `Hai lần cộng hưởng liên tiếp cách nhau $\\dfrac{\\lambda}{2}$: $\\lambda = 2(${tex(l2, 1)} - ${tex(l1, 1)}) = ${tex(2 * d, 1)}$ cm. $v = \\lambda f = ${tex(2 * d / 100, 4)}\\cdot ${f} \\approx ${tex(v, 1)}$ m/s $\\approx ${Math.round(v)}$ m/s.`,
      };
    },
  },
];

export const TEMPLATES: Template[] = [...H1, ...H2];
