import { mcq, tf, short, frac, tex, vn, need, gcd, round, poly, term, coef, type Template, type Rng } from "./core.ts";

/* Toán 11 – Học kì 1 (Kết nối tri thức) */
const S = "Toán", G = 11 as const;
const C1 = "Chương I. Hàm số lượng giác và phương trình lượng giác";
const C2 = "Chương II. Dãy số. Cấp số cộng và cấp số nhân";
const C3 = "Chương III. Các số đặc trưng đo xu thế trung tâm của mẫu số liệu ghép nhóm";
const C4 = "Chương IV. Quan hệ song song trong không gian";
const C5 = "Chương V. Giới hạn. Hàm số liên tục";

/* ---------------- tiện ích riêng ---------------- */
const $ = (s: string) => `$${s}$`;
const num = (x: number, dp = 2) => $(tex(x, dp));
/** n·π/d dạng LaTeX rút gọn */
function piT(n: number, d: number): string {
  if (n === 0) return "0";
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d); n /= g; d /= g;
  const s = n < 0 ? "-" : "", a = Math.abs(n);
  const nu = a === 1 ? "\\pi" : `${a}\\pi`;
  return d === 1 ? s + nu : `${s}\\dfrac{${nu}}{${d}}`;
}
const kAdd = (a: string, per: string) => (a === "0" ? per : `${a} + ${per}`);
const KZ = "\\ (k\\in\\mathbb{Z})";
const mod = (a: number, m: number) => ((a % m) + m) % m;
const sgnT = (x: number) => (x > 0 ? ">" : "<");
const pickN = <T,>(r: Rng, a: readonly T[], k: number): T[] => r.shuffle([...a]).slice(0, k);
/** a·x thay vào biểu thức có biến n (để viết lời giải) */
const subN = (tx: string, k: number) => tx.replace(/(\d)n/g, `$1\\cdot ${k}`).replace(/n/g, k < 0 ? `(${k})` : String(k));
const par = (x: number) => (x < 0 ? `(${x})` : String(x));
const INF = (s: number) => (s > 0 ? "+\\infty" : "-\\infty");

/* bộ ba Pythagore */
const TRI: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]];
/* góc phần tư: dấu [sin, cos, tan, cot] */
const QD = [
  { iv: "0<\\alpha<\\dfrac{\\pi}{2}", name: "I", s: [1, 1, 1, 1], ex: [2, 3, 4] },
  { iv: "\\dfrac{\\pi}{2}<\\alpha<\\pi", name: "II", s: [1, -1, -1, -1], ex: [8, 9, 10] },
  { iv: "\\pi<\\alpha<\\dfrac{3\\pi}{2}", name: "III", s: [-1, -1, 1, 1], ex: [14, 15, 16] },
  { iv: "\\dfrac{3\\pi}{2}<\\alpha<2\\pi", name: "IV", s: [-1, 1, -1, -1], ex: [20, 21, 22] },
];
const FN = ["\\sin\\alpha", "\\cos\\alpha", "\\tan\\alpha", "\\cot\\alpha"];

/* giá trị lượng giác đặc biệt (góc đo theo đơn vị π/12) */
const SV = [
  { n: "1", t: "\\dfrac{1}{2}", sinA: 2, cosA: 4 },
  { n: "\\sqrt{2}", t: "\\dfrac{\\sqrt{2}}{2}", sinA: 3, cosA: 3 },
  { n: "\\sqrt{3}", t: "\\dfrac{\\sqrt{3}}{2}", sinA: 4, cosA: 2 },
];
const TV = [
  { l: "\\sqrt{3}\\tan x", rr: "1", t: "\\dfrac{\\sqrt{3}}{3}", A: 2 },
  { l: "\\tan x", rr: "1", t: "1", A: 3 },
  { l: "\\tan x", rr: "\\sqrt{3}", t: "\\sqrt{3}", A: 4 },
];
const solSin = (a: number, U = 12) => `x = ${kAdd(piT(a, U), "k2\\pi")},\\ x = ${kAdd(piT(U - a, U), "k2\\pi")}`;
const solCos = (a: number, U = 12) => `x = \\pm ${piT(a, U)} + k2\\pi`;
const solTan = (a: number, U = 12) => `x = ${kAdd(piT(a, U), "k\\pi")}`;
/** các nghiệm (đơn vị π/U) của sin t = m hoặc cos t = m, cho bởi góc cơ sở a; trả về số dư theo chu kì 2U */
const roots = (f: "sin" | "cos", a: number, U: number) => (f === "sin" ? [mod(a, 2 * U), mod(U - a, 2 * U)] : [mod(a, 2 * U), mod(-a, 2 * U)]);
/** liệt kê nghiệm x (đơn vị π/U) của f(kx) = m trên đoạn [L·π; R·π] */
function listSol(f: "sin" | "cos", a: number, U: number, k: number, L: number, R: number): number[] {
  const rs = [...new Set(roots(f, a, U))]; const out: number[] = [];
  for (let t = k * L * U; t <= k * R * U; t++) if (rs.includes(mod(t, 2 * U))) out.push(t / k);
  return out;
}

/* ---------------- dữ liệu ghép nhóm ---------------- */
const GCTX = [
  { lab: "Thời gian (phút)", who: "học sinh", intro: (n: number) => `Thời gian (phút) đi từ nhà đến trường của $${n}$ học sinh lớp 11A được ghi lại trong bảng sau:`, hs: [5, 10], as: [0, 5] },
  { lab: "Chiều cao (cm)", who: "cây", intro: (n: number) => `Chiều cao (cm) của $${n}$ cây giống trong một vườn ươm được thống kê như sau:`, hs: [5, 10], as: [10, 20, 30] },
  { lab: "Cân nặng (kg)", who: "học sinh", intro: (n: number) => `Cân nặng (kg) của $${n}$ học sinh nam khối 11 của một trường được cho trong bảng sau:`, hs: [3, 4, 5], as: [40, 42, 45] },
  { lab: "Thời gian (giờ)", who: "học sinh", intro: (n: number) => `Thời gian tự học trong một tuần (giờ) của $${n}$ học sinh được thống kê như sau:`, hs: [2, 3], as: [0, 2] },
  { lab: "Điểm", who: "học sinh", intro: (n: number) => `Điểm bài kiểm tra (thang điểm 100) của $${n}$ học sinh được cho trong bảng sau:`, hs: [10], as: [30, 40] },
  { lab: "Tuổi", who: "người", intro: (n: number) => `Tuổi của $${n}$ người tham gia một câu lạc bộ dưỡng sinh được thống kê như sau:`, hs: [5], as: [50, 55] },
  { lab: "Thời gian (chục giờ)", who: "bóng đèn", intro: (n: number) => `Một cửa hàng thử nghiệm $${n}$ bóng đèn và ghi lại thời gian sáng liên tục (đơn vị: chục giờ) như sau:`, hs: [4, 5], as: [20, 30] },
];
type GD = { intro: string; table: string; a: number; h: number; f: number[]; n: number; k: number; lo: (i: number) => number; grp: (i: number) => string; mid: (i: number) => number; cum: number[] };
function gdata(r: Rng, k = r.pick([5, 5, 6])): GD {
  const c = r.pick(GCTX), h = r.pick(c.hs), a = r.pick(c.as);
  const f = Array.from({ length: k }, () => r.int(2, 14));
  const n = f.reduce((x, y) => x + y, 0);
  const lo = (i: number) => a + i * h, grp = (i: number) => `[${lo(i)};${lo(i) + h})`, mid = (i: number) => lo(i) + h / 2;
  const cum: number[] = []; f.reduce((s, x, i) => (cum[i] = s + x), 0);
  const table = `$\\begin{array}{|c|${"c|".repeat(k)}}\\hline \\text{${c.lab}} & ${f.map((_, i) => grp(i)).join(" & ")} \\\\ \\hline \\text{Số ${c.who}} & ${f.join(" & ")} \\\\ \\hline\\end{array}$`;
  return { intro: c.intro(n), table, a, h, f, n, k, lo, grp, mid, cum };
}
const gMean = (d: GD, w = (i: number) => d.mid(i)) => d.f.reduce((s, fi, i) => s + fi * w(i), 0) / d.n;
/** nhóm chứa vị trí p·n và giá trị phân vị */
function gQuant(d: GD, p: number) {
  const pos = p * d.n; let m = 0; while (d.cum[m] < pos) m++;
  const C = m ? d.cum[m - 1] : 0;
  return { m, C, pos, v: d.lo(m) + ((pos - C) / d.f[m]) * d.h };
}
function gMode(d: GD) {
  const mx = Math.max(...d.f); need(d.f.filter((x) => x === mx).length === 1);
  const m = d.f.indexOf(mx), fp = m ? d.f[m - 1] : 0, fn = m < d.k - 1 ? d.f[m + 1] : 0;
  return { m, fp, fn, fm: mx, v: d.lo(m) + ((mx - fp) / (mx - fp + (mx - fn))) * d.h, sw: d.lo(m) + ((mx - fn) / (mx - fp + (mx - fn))) * d.h };
}
const QN: Record<string, { p: number; t: string; name: string; ft: string }> = {
  me: { p: 0.5, t: "M_e", name: "trung vị", ft: "\\dfrac{n}{2}" },
  q1: { p: 0.25, t: "Q_1", name: "tứ phân vị thứ nhất", ft: "\\dfrac{n}{4}" },
  q3: { p: 0.75, t: "Q_3", name: "tứ phân vị thứ ba", ft: "\\dfrac{3n}{4}" },
};
const cumText = (d: GD) => `Tần số tích lũy: ${d.cum.map((c, i) => `$${d.grp(i)}: ${c}$`).join("; ")}.`;

export const TEMPLATES: Template[] = [
  /* =================================================================== HALF 1 – MCQ */
  {
    id: "t11-goc-doi-do-radian", subject: S, grade: G, chapter: C1, topic: "Đổi số đo độ – radian", half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const deg = r.pick([15, 18, 20, 30, 36, 40, 45, 60, 72, 75, 105, 108, 120, 135, 144, 150, 210, 225, 240, 270, 300, 315, 330]) * (r.chance(0.2) ? -1 : 1);
      const rad = piT(deg, 180);
      if (r.chance(0.5)) {
        return {
          stem: r.pick([`Đổi góc $${deg}^\\circ$ sang đơn vị radian, ta được`, `Góc có số đo $${deg}^\\circ$ thì có số đo theo radian là`, `Số đo theo radian của góc lượng giác $${deg}^\\circ$ là`]),
          ...mcq(r, $(rad), [$(piT(deg, 360)), $(piT(deg, 90)), $(piT(180, deg)), $(`${deg}\\pi`)]),
          explanation: `Vì $1^\\circ = \\dfrac{\\pi}{180}$ rad nên $${deg}^\\circ = ${deg}\\cdot\\dfrac{\\pi}{180} = ${rad}$.`,
        };
      }
      return {
        stem: r.pick([`Góc lượng giác có số đo $${rad}$ rad đổi sang đơn vị độ là`, `Đổi $${rad}$ rad sang độ, ta được`]),
        ...mcq(r, $(`${deg}^\\circ`), [$(`${2 * deg}^\\circ`), $(`${tex(deg / 2, 1)}^\\circ`), $(`${180 - deg}^\\circ`), $(`${360 - deg}^\\circ`)]),
        explanation: `Vì $1\\text{ rad} = \\left(\\dfrac{180}{\\pi}\\right)^\\circ$ nên $${rad} = ${rad}\\cdot\\dfrac{180^\\circ}{\\pi} = ${deg}^\\circ$.`,
      };
    },
  },
  {
    id: "t11-dau-gia-tri-luong-giac", subject: S, grade: G, chapter: C1, topic: "Dấu của giá trị lượng giác", half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const qi = r.int(0, 3), q = QD[qi], idx = r.shuffle([0, 1, 2, 3]), askTrue = r.chance(0.5);
      const st = (i: number, s: number) => $(`${FN[i]} ${sgnT(s)} 0`);
      const correct = st(idx[0], askTrue ? q.s[idx[0]] : -q.s[idx[0]]);
      const wrong = idx.slice(1).map((i) => st(i, askTrue ? -q.s[i] : q.s[i]));
      const v = r.int(0, 2);
      const cond = v === 0 ? `Cho góc $\\alpha$ thỏa mãn $${q.iv}$.` : v === 1 ? `Cho góc lượng giác $\\alpha$ có điểm biểu diễn trên đường tròn lượng giác nằm trong góc phần tư thứ ${q.name}.` : `Cho $\\alpha = ${piT(r.pick(q.ex), 12)}$.`;
      return {
        stem: `${cond} Khẳng định nào sau đây ${askTrue ? "đúng" : "sai"}?`,
        ...mcq(r, correct, wrong),
        explanation: `Điểm biểu diễn của $\\alpha$ thuộc góc phần tư thứ ${q.name} nên $\\sin\\alpha ${sgnT(q.s[0])} 0$, $\\cos\\alpha ${sgnT(q.s[1])} 0$, $\\tan\\alpha ${sgnT(q.s[2])} 0$, $\\cot\\alpha ${sgnT(q.s[3])} 0$. Khẳng định ${askTrue ? "đúng" : "sai"} là ${correct}.`,
      };
    },
  },
  {
    id: "t11-cong-thuc-nhan-doi", subject: S, grade: G, chapter: C1, topic: "Công thức nhân đôi, giá trị lượng giác", half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const [p0, q0, c] = r.pick(TRI), sw = r.chance(0.5), sa = sw ? q0 : p0, ca = sw ? p0 : q0;
      const q = QD[r.int(0, 3)], s = sa * q.s[0], co = ca * q.s[1];
      const gs = r.chance(0.5);
      const given = gs ? `\\sin\\alpha = ${frac(s, c)}` : `\\cos\\alpha = ${frac(co, c)}`;
      const other = gs ? `\\cos\\alpha = ${q.s[1] < 0 ? "-" : ""}\\sqrt{1-\\sin^2\\alpha} = ${frac(co, c)}` : `\\sin\\alpha = ${q.s[0] < 0 ? "-" : ""}\\sqrt{1-\\cos^2\\alpha} = ${frac(s, c)}`;
      const gv = gs ? s : co;
      const ask = r.pick(["sin2", "cos2", "tan"]);
      let right: string, wrong: string[], ex: string, at: string;
      if (ask === "sin2") {
        at = "\\sin 2\\alpha"; right = frac(2 * s * co, c * c);
        wrong = [frac(-2 * s * co, c * c), frac(2 * gv, c), frac(s * co, c * c)];
        ex = `\\sin 2\\alpha = 2\\sin\\alpha\\cos\\alpha = 2\\cdot\\left(${frac(s, c)}\\right)\\cdot\\left(${frac(co, c)}\\right) = ${right}`;
      } else if (ask === "cos2") {
        at = "\\cos 2\\alpha"; right = frac(co * co - s * s, c * c);
        wrong = [frac(s * s - co * co, c * c), frac(2 * gv, c), frac(co * co - s * s, c), frac(2 * co * co + c * c, c * c)];
        ex = `\\cos 2\\alpha = \\cos^2\\alpha - \\sin^2\\alpha = ${frac(co * co, c * c)} - ${frac(s * s, c * c)} = ${right}`;
      } else {
        at = "\\tan\\alpha"; right = frac(s, co);
        wrong = [frac(co, s), frac(-s, co), frac(-co, s)];
        ex = `\\tan\\alpha = \\dfrac{\\sin\\alpha}{\\cos\\alpha} = ${right}`;
      }
      return {
        stem: `Cho $${given}$ với $${q.iv}$. Giá trị của $${at}$ bằng`,
        ...mcq(r, $(right), wrong.map($)),
        explanation: `Vì $${q.iv}$ nên $${other}$. Do đó $${ex}$.`,
      };
    },
  },
  {
    id: "t11-chu-ki-ham-so", subject: S, grade: G, chapter: C1, topic: "Chu kì của hàm số lượng giác", half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const f = r.pick(["sin", "cos", "tan", "cot"]), [p, q] = r.pick([[1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [1, 2], [1, 3], [2, 3], [3, 2], [6, 1]]);
      const B = f === "sin" || f === "cos" ? 2 : 1, oB = 3 - B;
      const kx = q === 1 ? `${coef(p)}x` : p === 1 ? `\\dfrac{x}{${q}}` : `\\dfrac{${p}x}{${q}}`;
      const ph = r.pick(["", ` + \\dfrac{\\pi}{3}`, ` - \\dfrac{\\pi}{4}`, ` + \\dfrac{\\pi}{6}`]);
      const A = r.pick(["", "2", "3", "-"]), cc = r.pick(["", " + 1", " - 2", " + 3"]);
      const T = piT(B * q, p);
      return {
        stem: r.chance(0.5) ? `Chu kì tuần hoàn của hàm số $y = ${A}\\${f}\\left(${kx}${ph}\\right)${cc}$ là` : `Hàm số $y = ${A}\\${f}\\left(${kx}${ph}\\right)${cc}$ tuần hoàn với chu kì`,
        ...mcq(r, $(T), [$(piT(oB * q, p)), $(piT(B * p, q)), $(piT(oB * p, q)), $(piT(B, 1)), $(piT(4 * q, p))]),
        explanation: `Hàm số $y = \\${f}(ax+b)$ tuần hoàn với chu kì $T = \\dfrac{${B === 2 ? "2\\pi" : "\\pi"}}{|a|}$. Ở đây $a = ${frac(p, q)}$ nên $T = ${T}$ (hệ số trước hàm và hằng số cộng thêm không làm thay đổi chu kì).`,
      };
    },
  },
  {
    id: "t11-tap-gia-tri-luong-giac", subject: S, grade: G, chapter: C1, topic: "Tập giá trị, GTLN – GTNN của hàm lượng giác", half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const a = r.nz(-5, 5), b = r.int(-5, 5), f = r.pick(["\\sin", "\\cos"]), arg = r.pick(["x", "2x", "3x", "\\left(x + \\dfrac{\\pi}{3}\\right)"]);
      need(Math.abs(a) > 1 || b !== 0);
      const A = Math.abs(a), lo = b - A, hi = b + A;
      const y = `y = ${coef(a)}${f} ${arg}${term(b)}`;
      const ask = r.pick(["range", "max", "min"]);
      const ex = `Vì $-1\\le ${f} ${arg}\\le 1$ nên $${-A}\\le ${coef(a)}${f} ${arg}\\le ${A}$, suy ra $${lo}\\le y\\le ${hi}$.`;
      if (ask === "range") {
        const iv = (l: number, h: number) => $(`[${l};${h}]`);
        return {
          stem: `Tập giá trị của hàm số $${y}$ là`,
          ...mcq(r, iv(lo, hi), [iv(-1, 1), iv(-A, A), iv(b - 1, b + 1), iv(-A - b, A - b), iv(lo, hi + 1)]),
          explanation: `${ex} Tập giá trị là $[${lo};${hi}]$.`,
        };
      }
      const v = ask === "max" ? hi : lo;
      return {
        stem: `Giá trị ${ask === "max" ? "lớn nhất" : "nhỏ nhất"} của hàm số $${y}$ bằng`,
        ...mcq(r, num(v), [num(ask === "max" ? lo : hi), num(ask === "max" ? A : -A), num(ask === "max" ? b + 1 : b - 1), num(a + b), num(v + 1)]),
        explanation: `${ex} Vậy giá trị ${ask === "max" ? "lớn nhất" : "nhỏ nhất"} của hàm số là $${v}$.`,
      };
    },
  },
  {
    id: "t11-ham-so-chan-le", subject: S, grade: G, chapter: C1, topic: "Hàm số chẵn, hàm số lẻ", half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const odd = ["y = \\sin x", "y = \\tan x", "y = \\cot x", "y = x\\cos x", "y = \\sin 2x", "y = x^3 + \\sin x", "y = \\sin x\\cos^2 x", "y = \\tan 3x", "y = x^2\\sin x"];
      const even = ["y = \\cos x", "y = x\\sin x", "y = \\sin^2 x", "y = |\\sin x|", "y = \\cos 3x + x^2", "y = x\\tan x", "y = \\cos x + 1", "y = \\cos^2 x - \\sin^2 x"];
      const none = ["y = \\sin x + \\cos x", "y = \\sin x + 1", "y = \\cos x + \\sin 2x", "y = x + \\cos x", "y = \\tan x - 1", "y = \\sin\\left(x + \\dfrac{\\pi}{4}\\right)"];
      const wantOdd = r.chance(0.5), nm = wantOdd ? "lẻ" : "chẵn", other = wantOdd ? "chẵn" : "lẻ";
      const yes = wantOdd ? odd : even, no = [...(wantOdd ? even : odd), ...none];
      const why = `(dùng $\\sin(-x) = -\\sin x$, $\\cos(-x) = \\cos x$, $\\tan(-x) = -\\tan x$, $\\cot(-x) = -\\cot x$)`;
      const mode = r.int(0, 3);
      if (mode === 3) {
        const c = r.int(1, 3), fs = r.shuffle([...pickN(r, yes, c), ...pickN(r, no, 4 - c)]);
        return {
          stem: `Cho các hàm số ${fs.map($).join(", ")}. Trong các hàm số trên, có bao nhiêu hàm số ${nm}?`,
          ...mcq(r, num(c), [0, 1, 2, 3, 4].filter((x) => x !== c).map((x) => num(x))),
          explanation: `Xét $f(-x)$ ${why}: các hàm số ${nm} là ${fs.filter((x) => yes.includes(x)).map($).join(", ")}. Vậy có $${c}$ hàm số ${nm}.`,
        };
      }
      if (mode === 2) {
        const good = r.pick(no), bad = pickN(r, yes, 3);
        return {
          stem: `Hàm số nào sau đây không phải là hàm số ${nm}?`,
          ...mcq(r, $(good), bad.map($)),
          explanation: `Ba hàm số ${bad.map($).join(", ")} đều thỏa mãn $f(-x) = ${wantOdd ? "-f(x)" : "f(x)"}$ ${why} nên là hàm số ${nm}. Hàm số $${good}$ ${none.includes(good) ? "không chẵn cũng không lẻ" : `là hàm số ${other}`}.`,
        };
      }
      const good = r.pick(yes), bad = pickN(r, no, 3);
      return {
        stem: `${mode ? "Trong các hàm số sau, hàm số nào là" : "Hàm số nào sau đây là"} hàm số ${nm}?`,
        ...mcq(r, $(good), bad.map($)),
        explanation: `Các hàm số đều có tập xác định đối xứng. Với $${good}$ ta có $f(-x) = ${wantOdd ? "-f(x)" : "f(x)"}$ ${why} nên đó là hàm số ${nm}; các hàm số còn lại không có tính chất này.`,
      };
    },
  },
  {
    id: "t11-phuong-trinh-luong-giac-co-ban", subject: S, grade: G, chapter: C1, topic: "Phương trình lượng giác cơ bản", half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const f = r.pick(["sin", "cos", "tan"]), sg = r.pick([1, -1]), form = r.chance(0.5);
      let eq: string, right: string, wrong: string[], ex: string;
      if (f === "tan") {
        const v = r.pick(TV), a = sg * v.A;
        eq = form ? `${v.l} ${sg > 0 ? "-" : "+"} ${v.rr} = 0` : `\\tan x = ${sg < 0 ? "-" : ""}${v.t}`;
        right = solTan(a); wrong = [`x = ${kAdd(piT(a, 12), "k2\\pi")}`, solTan(-a), solTan(sg * (6 - v.A))];
        ex = `$\\tan x = ${sg < 0 ? "-" : ""}${v.t} = \\tan\\left(${piT(a, 12)}\\right) \\Leftrightarrow ${right}${KZ}$.`;
      } else {
        const v = r.pick(SV), m = `${sg < 0 ? "-" : ""}${v.t}`;
        eq = form ? `2\\${f} x ${sg > 0 ? "-" : "+"} ${v.n} = 0` : `\\${f} x = ${m}`;
        if (f === "sin") {
          const a = sg * v.sinA; right = solSin(a);
          wrong = [solCos(Math.abs(a)), `x = ${kAdd(piT(a, 12), "k\\pi")}`, solSin(-a)];
          ex = `$\\sin x = ${m} = \\sin\\left(${piT(a, 12)}\\right) \\Leftrightarrow ${right}${KZ}$.`;
        } else {
          const a = sg > 0 ? v.cosA : 12 - v.cosA; right = solCos(a);
          wrong = [solSin(a), `x = \\pm ${piT(a, 12)} + k\\pi`, solCos(12 - a)];
          ex = `$\\cos x = ${m} = \\cos ${piT(a, 12)} \\Leftrightarrow ${right}${KZ}$.`;
        }
      }
      return {
        stem: r.pick([`Nghiệm của phương trình $${eq}$ là`, `Phương trình $${eq}$ có các nghiệm là`, `Tất cả các nghiệm của phương trình $${eq}$ là`]),
        ...mcq(r, $(right + KZ), wrong.map((w) => $(w + KZ))),
        explanation: (form ? "Biến đổi phương trình về dạng cơ bản: " : "") + ex,
      };
    },
  },
  {
    id: "t11-so-hang-day-so", subject: S, grade: G, chapter: C2, topic: "Số hạng của dãy số cho bởi công thức", half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const t = r.int(0, 3);
      let tx: string, v: (n: number) => [number, number];
      if (t === 0) { const a = r.nz(-3, 3), b = r.int(-5, 5), c = r.int(-5, 5); tx = poly([a, b, c], "n"); v = (n) => [a * n * n + b * n + c, 1]; }
      else if (t === 1) { const a = r.nz(-4, 4), b = r.int(-5, 5), c = r.int(1, 3), d = r.int(0, 4); need(a * d - b * c !== 0); tx = `\\dfrac{${poly([a, b], "n")}}{${poly([c, d], "n")}}`; v = (n) => [a * n + b, c * n + d]; }
      else if (t === 2) { const B = r.pick([2, 3]), a = r.nz(-2, 3), b = r.nz(-5, 5); tx = `${a === 1 ? "" : a === -1 ? "-" : a + "\\cdot "}${B}^{n}${term(b)}`; v = (n) => [a * B ** n + b, 1]; }
      else { const a = r.nz(-3, 3), b = r.nz(-4, 4); tx = `(-1)^{n}(${poly([a, b], "n")})`; v = (n) => [(n % 2 ? -1 : 1) * (a * n + b), 1]; }
      const k = r.int(2, 6), F = (n: number) => frac(...v(n)), [p, q] = v(k);
      return {
        stem: `Cho dãy số $(u_n)$ với $u_n = ${tx}$. ${r.pick([`Số hạng $u_{${k}}$ bằng`, `Số hạng thứ $${k}$ của dãy số là`, `Giá trị của $u_{${k}}$ là`])}`,
        ...mcq(r, $(F(k)), [$(F(k - 1)), $(F(k + 1)), $(frac(-p, q)), $(F(k + 2))]),
        explanation: `Thay $n = ${k}$ vào công thức: $u_{${k}} = ${subN(tx, k)} = ${F(k)}$.`,
      };
    },
  },
  {
    id: "t11-cap-so-cong-so-hang", subject: S, grade: G, chapter: C2, topic: "Số hạng tổng quát, công sai của cấp số cộng", half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const u1 = r.int(-10, 15), d = r.nz(-5, 6), n = r.int(6, 25), un = u1 + (n - 1) * d, mode = r.int(0, 2);
      if (mode === 0) return {
        stem: `Cho cấp số cộng $(u_n)$ có $u_1 = ${u1}$ và công sai $d = ${d}$. Số hạng $u_{${n}}$ bằng`,
        ...mcq(r, num(un), [num(u1 + n * d), num((n - 1) * d), num(u1 - (n - 1) * d), num(u1 + (n - 2) * d)]),
        explanation: `$u_{${n}} = u_1 + ${n - 1}d = ${u1} + ${n - 1}\\cdot(${d}) = ${un}$.`,
      };
      if (mode === 1) return {
        stem: `Cho cấp số cộng $(u_n)$ có $u_1 = ${u1}$ và $u_{${n}} = ${un}$. Công sai của cấp số cộng đó là`,
        ...mcq(r, num(d), [$(frac(un - u1, n)), num(-d), $(frac(un + u1, n - 1)), $(frac(un, n - 1))]),
        explanation: `$u_{${n}} = u_1 + ${n - 1}d \\Rightarrow d = \\dfrac{${un} - (${u1})}{${n - 1}} = ${d}$.`,
      };
      const m = r.int(4, 12), um = u1 + (m - 1) * d;
      return {
        stem: `Cho cấp số cộng $(u_n)$ có $u_{${m}} = ${um}$ và công sai $d = ${d}$. Số hạng đầu $u_1$ bằng`,
        ...mcq(r, num(u1), [num(um - m * d), num(um + (m - 1) * d), num(um - (m - 2) * d), num(um - d)]),
        explanation: `$u_{${m}} = u_1 + ${m - 1}d \\Rightarrow u_1 = ${um} - ${m - 1}\\cdot(${d}) = ${u1}$.`,
      };
    },
  },
  {
    id: "t11-cap-so-nhan-tong", subject: S, grade: G, chapter: C2, topic: "Số hạng, tổng n số hạng đầu của cấp số nhân", half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const [p, s] = r.pick([[2, 1], [3, 1], [-2, 1], [-3, 1], [1, 2], [-1, 2], [2, 1], [3, 1]]);
      const n = r.int(4, 6);
      const u1 = s === 1 ? r.nz(-4, 5) : r.pick([16, 32, 64, -32]);
      const U = (k: number) => frac(u1 * p ** (k - 1), s ** (k - 1));
      const Sn = (k: number) => frac(u1 * (s ** k - p ** k), s ** (k - 1) * (s - p));
      const qT = frac(p, s);
      if (r.chance(0.55)) return {
        stem: `Cho cấp số nhân $(u_n)$ có $u_1 = ${u1}$ và công bội $q = ${qT}$. ${r.pick([`Tổng $${n}$ số hạng đầu tiên $S_{${n}}$ bằng`, `Giá trị của $S_{${n}} = u_1 + u_2 + \\cdots + u_{${n}}$ là`])}`,
        ...mcq(r, $(Sn(n)), [$(U(n)), $(Sn(n - 1)), $(Sn(n + 1)), $(frac(u1 * (p ** n - s ** n), s ** (n - 1) * (s + p)))]),
        explanation: `$S_{${n}} = u_1\\cdot\\dfrac{1 - q^{${n}}}{1 - q} = ${u1}\\cdot\\dfrac{1 - \\left(${qT}\\right)^{${n}}}{1 - \\left(${qT}\\right)} = ${Sn(n)}$.`,
      };
      return {
        stem: `Cho cấp số nhân $(u_n)$ có $u_1 = ${u1}$ và công bội $q = ${qT}$. Số hạng $u_{${n}}$ bằng`,
        ...mcq(r, $(U(n)), [$(U(n + 1)), $(frac(u1 * s + (n - 1) * p, s)), $(Sn(n)), $(U(n - 1))]),
        explanation: `$u_{${n}} = u_1 q^{${n - 1}} = ${u1}\\cdot\\left(${qT}\\right)^{${n - 1}} = ${U(n)}$.`,
      };
    },
  },
  {
    id: "t11-day-so-tang-giam", subject: S, grade: G, chapter: C2, topic: "Dãy số tăng, dãy số giảm", half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const a = r.nz(-5, 5), b = r.int(-6, 6), c = r.int(1, 3), d = r.int(1, 5), D = a * d - b * c;
      need(D !== 0);
      const tx = `\\dfrac{${poly([a, b], "n")}}{${poly([c, d], "n")}}`;
      const inc = D > 0;
      const O = ["Dãy số $(u_n)$ là dãy số tăng.", "Dãy số $(u_n)$ là dãy số giảm.", "Dãy số $(u_n)$ không tăng cũng không giảm.", "Dãy số $(u_n)$ là một cấp số cộng.", "Dãy số $(u_n)$ không bị chặn."];
      return {
        stem: `Cho dãy số $(u_n)$ với $u_n = ${tx}$. Khẳng định nào sau đây đúng?`,
        ...mcq(r, O[inc ? 0 : 1], [O[inc ? 1 : 0], ...pickN(r, O.slice(2), 2)]),
        explanation: `$u_{n+1} - u_n = \\dfrac{${coef(a)}(n+1)${term(b)}}{${coef(c)}(n+1)${term(d)}} - ${tx} = \\dfrac{${D}}{(${poly([c, c + d], "n")})(${poly([c, d], "n")})}$, ${inc ? "dương" : "âm"} với mọi $n\\ge 1$. Vậy dãy số ${inc ? "tăng" : "giảm"} (và bị chặn vì $u_n$ nằm giữa $u_1$ và $${frac(a, c)}$).`,
      };
    },
  },
  {
    id: "t11-nhan-biet-csc-csn", subject: S, grade: G, chapter: C2, topic: "Nhận biết công sai, công bội", half: 1, level: 1, kind: "mcq",
    make: (r) => {
      if (r.chance(0.5)) {
        const p = r.int(-6, 9), q = r.nz(-5, 5);
        const tx = p === 0 ? `${coef(q)}n` : r.chance(0.5) ? `${p}${term(q, "n")}` : `${coef(q)}n${term(p)}`;
        return {
          stem: `Dãy số $(u_n)$ với $u_n = ${tx}$ là một cấp số cộng có công sai bằng`,
          ...mcq(r, num(q), [num(-q), num(p), num(p + q), num(q + 1)]),
          explanation: `$u_{n+1} - u_n = \\left(${tx.replace(/n/g, "(n+1)")}\\right) - \\left(${tx}\\right) = ${q}$ với mọi $n$, nên công sai $d = ${q}$ (còn $u_1 = ${p + q}$).`,
        };
      }
      const q = r.pick([2, 3, -2, -3, 4, 5]), c = r.pick([1, 2, 3, 5, -1]);
      const base = q < 0 ? `(${q})^{n}` : `${q}^{n}`, tx = c === 1 ? base : c === -1 ? `-${base}` : `${c}\\cdot ${base}`;
      return {
        stem: `Dãy số $(u_n)$ với $u_n = ${tx}$ là một cấp số nhân có công bội bằng`,
        ...mcq(r, num(q), [num(c), num(c * q), $(frac(1, q)), num(-q)]),
        explanation: `$\\dfrac{u_{n+1}}{u_n} = \\dfrac{${tx.replace("{n}", "{n+1}")}}{${tx}} = ${q}$ nên công bội $q = ${q}$ (còn $u_1 = ${c * q}$).`,
      };
    },
  },

  /* =================================================================== HALF 1 – TF */
  {
    id: "t11-tf-gia-tri-luong-giac", subject: S, grade: G, chapter: C1, topic: "Giá trị lượng giác và công thức lượng giác", half: 1, level: 2, kind: "tf",
    make: (r) => {
      const [p0, q0, c] = r.pick(TRI), sw = r.chance(0.5), sa = sw ? q0 : p0, ca = sw ? p0 : q0;
      const q = QD[r.int(1, 3)], s = sa * q.s[0], co = ca * q.s[1], gs = r.chance(0.5);
      const oth = gs ? "\\cos\\alpha" : "\\sin\\alpha", ov = gs ? co : s, osg = gs ? q.s[1] : q.s[0];
      const t = [r.chance(0.5), r.chance(0.5), r.chance(0.5), r.chance(0.5)];
      const use2 = r.chance(0.5);
      const v4 = use2 ? frac(2 * s * co, c * c) : frac(co * co - s * s, c * c), w4 = use2 ? frac(-2 * s * co, c * c) : frac(s * s - co * co, c * c);
      return {
        stem: `Cho góc $\\alpha$ thỏa mãn $${gs ? `\\sin\\alpha = ${frac(s, c)}` : `\\cos\\alpha = ${frac(co, c)}`}$ và $${q.iv}$.`,
        ...tf([
          [`$${oth} ${sgnT(t[0] ? osg : -osg)} 0$.`, t[0]],
          [`$${oth} = ${frac(t[1] ? ov : -ov, c)}$.`, t[1]],
          [`$\\tan\\alpha = ${t[2] ? frac(s, co) : frac(co, s)}$.`, t[2]],
          [`$${use2 ? "\\sin 2\\alpha" : "\\cos 2\\alpha"} = ${t[3] ? v4 : w4}$.`, t[3]],
        ]),
        explanation: `Vì $${q.iv}$ nên $${oth} ${sgnT(osg)} 0$; $${oth} = ${osg < 0 ? "-" : ""}\\sqrt{1 - ${frac(gs ? s * s : co * co, c * c)}} = ${frac(ov, c)}$. $\\tan\\alpha = \\dfrac{\\sin\\alpha}{\\cos\\alpha} = ${frac(s, co)}$. ${use2 ? `$\\sin 2\\alpha = 2\\sin\\alpha\\cos\\alpha = ${v4}$` : `$\\cos 2\\alpha = \\cos^2\\alpha - \\sin^2\\alpha = ${v4}$`}.`,
      };
    },
  },
  {
    id: "t11-tf-phuong-trinh-luong-giac", subject: S, grade: G, chapter: C1, topic: "Phương trình lượng giác cơ bản – nghiệm trên đoạn", half: 1, level: 3, kind: "tf",
    make: (r) => {
      const f = r.pick(["sin", "cos"] as const), v = r.pick(SV), sg = r.pick([1, -1]);
      const m = `${sg < 0 ? "-" : ""}${v.t}`, mw = `${sg > 0 ? "-" : ""}${v.t}`;
      const a = f === "sin" ? sg * v.sinA : sg > 0 ? v.cosA : 12 - v.cosA;
      const aw = f === "sin" ? -a : 12 - a;
      const fam = f === "sin" ? solSin(a) : solCos(a), famW = f === "sin" ? solCos(Math.abs(a)) : solSin(a);
      const [L, R] = r.pick([[0, 1], [-1, 1], [0, 2], [-1, 0]]);
      const sol = listSol(f, a, 12, 1, L, R), N = sol.length;
      need(N > 0);
      const all = listSol(f, a, 12, 1, 0, 2), sum = all.reduce((x, y) => x + y, 0);
      const allW = listSol(f, aw, 12, 1, 0, 2), sumW0 = allW.reduce((x, y) => x + y, 0), sumW = sumW0 !== sum ? sumW0 : sum / 2;
      const t = [r.chance(0.5), r.chance(0.5), r.chance(0.5), r.chance(0.5)];
      const Nw = N === 0 ? 1 : r.chance(0.5) ? N + 1 : N - 1;
      const iv = `\\left[${piT(L, 1)};${piT(R, 1)}\\right]`;
      return {
        stem: `Cho phương trình $${r.pick([`2\\${f} x ${sg > 0 ? "-" : "+"} ${v.n} = 0`, `2\\${f} x = ${sg < 0 ? "-" : ""}${v.n}`, `${sg > 0 ? "" : "-"}${v.n} ${sg > 0 ? "-" : "-"} 2\\${f} x = 0`])}\\quad(1)$.`,
        ...tf([
          [`Phương trình $(1)$ tương đương với $\\${f} x = ${t[0] ? m : mw}$.`, t[0]],
          [`Phương trình $(1)$ có các nghiệm là $${t[1] ? fam : famW}${KZ}$.`, t[1]],
          [`Phương trình $(1)$ có đúng $${t[2] ? N : Nw}$ nghiệm thuộc đoạn $${iv}$.`, t[2]],
          [`Tổng các nghiệm của phương trình $(1)$ thuộc đoạn $[0;2\\pi]$ bằng $${piT(t[3] ? sum : sumW, 12)}$.`, t[3]],
        ]),
        explanation: `$(1)\\Leftrightarrow \\${f} x = ${m} \\Leftrightarrow ${fam}${KZ}$. Các nghiệm thuộc $${iv}$: ${N ? sol.map((x) => `$${piT(x, 12)}$`).join(", ") : "không có"} (${N} nghiệm). Các nghiệm thuộc $[0;2\\pi]$ là ${all.map((x) => `$${piT(x, 12)}$`).join(" và ")}, tổng bằng $${piT(sum, 12)}$.`,
      };
    },
  },
  {
    id: "t11-tf-cap-so-cong-thuc-te", subject: S, grade: G, chapter: C2, topic: "Cấp số cộng trong thực tế", half: 1, level: 2, kind: "tf",
    make: (r) => {
      const ctx = r.pick([
        { intro: (n: number, u: number, d: number) => `Một rạp hát có $${n}$ hàng ghế. Hàng thứ nhất có $${u}$ ghế, mỗi hàng sau nhiều hơn hàng liền trước $${d}$ ghế.`, say: (k: string, v: string) => `Hàng thứ ${k} có ${v} ghế.`, tot: (v: string) => `Rạp hát có tất cả ${v} ghế.`, first: (x: number, m: number) => `Hàng đầu tiên có nhiều hơn $${x}$ ghế là hàng thứ $${m}$.` },
        { intro: (n: number, u: number, d: number) => `Khán đài của một sân vận động có $${n}$ dãy ghế. Dãy thứ nhất có $${u}$ chỗ ngồi, mỗi dãy sau nhiều hơn dãy liền trước $${d}$ chỗ ngồi.`, say: (k: string, v: string) => `Dãy thứ ${k} có ${v} chỗ ngồi.`, tot: (v: string) => `Khán đài có tất cả ${v} chỗ ngồi.`, first: (x: number, m: number) => `Dãy đầu tiên có nhiều hơn $${x}$ chỗ ngồi là dãy thứ $${m}$.` },
        { intro: (n: number, u: number, d: number) => `Người ta xếp các ống thép thành $${n}$ lớp. Lớp trên cùng có $${u}$ ống, mỗi lớp phía dưới nhiều hơn lớp ngay trên nó $${d}$ ống.`, say: (k: string, v: string) => `Lớp thứ ${k} (tính từ trên xuống) có ${v} ống thép.`, tot: (v: string) => `Có tất cả ${v} ống thép.`, first: (x: number, m: number) => `Lớp đầu tiên (tính từ trên xuống) có nhiều hơn $${x}$ ống là lớp thứ $${m}$.` },
        { intro: (n: number, u: number, d: number) => `Bạn Minh tiết kiệm tiền trong $${n}$ tuần: tuần đầu bỏ vào ống heo $${u}$ nghìn đồng, mỗi tuần sau bỏ nhiều hơn tuần liền trước $${d}$ nghìn đồng.`, say: (k: string, v: string) => `Tuần thứ ${k} Minh bỏ vào ống heo ${v} nghìn đồng.`, tot: (v: string) => `Sau tất cả các tuần đó Minh tiết kiệm được ${v} nghìn đồng.`, first: (x: number, m: number) => `Tuần đầu tiên Minh bỏ vào nhiều hơn $${x}$ nghìn đồng là tuần thứ $${m}$.` },
      ]);
      const n = r.int(12, 30), u = r.int(5, 30), d = r.int(2, 6), un = u + (n - 1) * d, Sn = (n * (u + un)) / 2;
      const x = r.int(u + 2 * d, un - 2 * d), m = Math.floor((x - u) / d) + 2;
      need(m <= n);
      const t = [r.chance(0.5), r.chance(0.5), r.chance(0.5), r.chance(0.5)];
      const n$ = `$${n}$`;
      return {
        stem: ctx.intro(n, u, d),
        ...tf([
          [ctx.say("$2$", `$${t[0] ? u + d : u + 2 * d}$`), t[0]],
          [ctx.say(n$, `$${t[1] ? un : u + n * d}$`), t[1]],
          [ctx.tot(`$${tex(t[2] ? Sn : (n * (2 * u + n * d)) / 2, 1)}$`), t[2]],
          [ctx.first(x, t[3] ? m : m + r.pick([-1, 1])), t[3]],
        ]),
        explanation: `Số lượng theo thứ tự lập thành cấp số cộng với $u_1 = ${u}$, $d = ${d}$. $u_2 = ${u + d}$; $u_{${n}} = ${u} + ${n - 1}\\cdot ${d} = ${un}$; $S_{${n}} = \\dfrac{${n}(${u} + ${un})}{2} = ${Sn}$. $u_k > ${x} \\Leftrightarrow ${u} + (k-1)\\cdot ${d} > ${x} \\Leftrightarrow k > ${tex(round((x - u) / d + 1, 2))}$, nên $k = ${m}$.`,
      };
    },
  },
  {
    id: "t11-tf-ham-luong-giac-thuc-te", subject: S, grade: G, chapter: C1, topic: "Hàm số lượng giác trong thực tế", half: 1, level: 3, kind: "tf",
    make: (r) => {
      const A = r.int(2, 5), B = r.int(8, 15), w = r.pick([6, 12]), f = r.pick(["cos", "sin"] as const);
      const ctx = r.pick([
        `Độ sâu mực nước tại một cảng biển (đơn vị: mét) sau $t$ giờ kể từ $0$ giờ được cho bởi`,
        `Độ sâu của mực nước ở một con kênh (đơn vị: mét) tại thời điểm $t$ (giờ) trong ngày được cho bởi`,
      ]);
      const ht = `h(t) = ${A}\\${f}\\dfrac{\\pi t}{${w}} + ${B}`;
      const k = r.pick([1, 2, 3, 4]), t0 = f === "cos" ? (w * [0, 1, 1, 2, 3][k]) / [1, 3, 2, 3, 3][k] : (w * [0, 1, 1, 5, 7][k]) / [1, 6, 2, 6, 6][k];
      const val = (t: number) => B + A * (f === "cos" ? Math.cos((Math.PI * t) / w) : Math.sin((Math.PI * t) / w));
      const h0 = round(val(t0), 4);
      const maxT: number[] = []; for (let t = 0; t <= 24; t++) if (Math.abs(val(t) - (A + B)) < 1e-9) maxT.push(t);
      const tt = [r.chance(0.5), r.chance(0.5), r.chance(0.5), r.chance(0.5)];
      const cnt = maxT.length;
      return {
        stem: `${ctx} $${ht}$ với $0\\le t\\le 24$.`,
        ...tf([
          [`Mực nước sâu nhất là $${tt[0] ? A + B : r.pick([A, B, B + 2 * A])}$ m.`, tt[0]],
          [`Hàm số $h(t)$ tuần hoàn với chu kì $${tt[1] ? 2 * w : w}$ giờ.`, tt[1]],
          [`Tại thời điểm $t = ${t0}$ giờ, độ sâu mực nước là $${tex(tt[2] ? h0 : round(B - (h0 - B), 4))}$ m.`, tt[2] || h0 === B],
          [`Trong khoảng thời gian từ $0$ giờ đến $24$ giờ, có đúng $${tt[3] ? cnt : cnt + 1}$ thời điểm mực nước sâu nhất.`, tt[3]],
        ]),
        explanation: `Vì $-1\\le\\${f}\\dfrac{\\pi t}{${w}}\\le 1$ nên $${B - A}\\le h(t)\\le ${A + B}$: sâu nhất $${A + B}$ m. Chu kì $T = \\dfrac{2\\pi}{\\pi/${w}} = ${2 * w}$ giờ. $h(${t0}) = ${A}\\${f}${piT(t0, w)} + ${B} = ${tex(h0)}$ m. $h(t) = ${A + B}\\Leftrightarrow \\${f}\\dfrac{\\pi t}{${w}} = 1$, trên $[0;24]$ được $t\\in\\{${maxT.join(";")}\\}$: ${cnt} thời điểm.`,
      };
    },
  },

  /* =================================================================== HALF 1 – SHORT */
  {
    id: "t11-sh-do-dai-cung-tron", subject: S, grade: G, chapter: C1, topic: "Độ dài cung tròn", half: 1, level: 2, kind: "short",
    make: (r) => {
      const R = r.int(4, 30), v = r.int(0, 2);
      let rad: number, stem: string, ex: string;
      if (v === 0) {
        const deg = r.pick([20, 30, 36, 40, 45, 60, 72, 75, 90, 120, 135, 150]); rad = (deg * Math.PI) / 180;
        stem = `Trên đường tròn bán kính $${R}$ cm, tính độ dài của cung tròn có số đo $${deg}^\\circ$ (đơn vị: cm, làm tròn kết quả đến hàng phần mười).`;
        ex = `$${deg}^\\circ = ${piT(deg, 180)}$ rad nên $l = R\\alpha = ${R}\\cdot ${piT(deg, 180)}\\approx ${tex(R * rad, 1)}$ cm.`;
      } else if (v === 1) {
        const m = r.pick([5, 10, 15, 20, 25, 40, 45]); rad = (m * 6 * Math.PI) / 180;
        stem = `Kim phút của một chiếc đồng hồ dài $${R}$ cm. Trong $${m}$ phút, đầu kim phút vạch nên một cung tròn có độ dài bằng bao nhiêu xentimét? (làm tròn kết quả đến hàng phần mười)`;
        ex = `Mỗi phút kim phút quay $6^\\circ$, nên trong $${m}$ phút quay $${6 * m}^\\circ = ${piT(6 * m, 180)}$ rad. Độ dài cung: $l = ${R}\\cdot ${piT(6 * m, 180)}\\approx ${tex(R * rad, 1)}$ cm.`;
      } else {
        const a = r.pick([0.5, 1.2, 1.5, 2, 2.5, 3]); rad = a;
        stem = `Một bánh xe có bán kính $${R}$ cm quay quanh trục một góc $${tex(a, 1)}$ rad. Tính quãng đường mà một điểm trên vành bánh xe đã đi được (đơn vị: cm, làm tròn kết quả đến hàng phần mười).`;
        ex = `Quãng đường bằng độ dài cung: $l = R\\alpha = ${R}\\cdot ${tex(a, 1)} = ${tex(R * a, 1)}$ cm.`;
      }
      return { stem, ...short(R * rad, 1), explanation: ex };
    },
  },
  {
    id: "t11-sh-gtln-asinx-bcosx", subject: S, grade: G, chapter: C1, topic: "GTLN – GTNN của a sin x + b cos x + c", half: 1, level: 3, kind: "short",
    make: (r) => {
      const [p, q, R] = r.pick(TRI.slice(0, 3)), sw = r.chance(0.5);
      const a = (sw ? p : q) * r.pick([1, -1]), b = (sw ? q : p) * r.pick([1, -1]), c = r.int(-6, 6);
      const arg = r.pick(["x", "2x"]), isMax = r.chance(0.5), v = isMax ? c + R : c - R;
      const y = `y = ${coef(a)}\\sin ${arg}${term(b, `\\cos ${arg}`)}${term(c)}`;
      return {
        stem: `Tìm giá trị ${isMax ? "lớn nhất" : "nhỏ nhất"} của hàm số $${y}$.`,
        ...short(v),
        explanation: `Ta có $${coef(a)}\\sin ${arg}${term(b, `\\cos ${arg}`)} = ${R}\\sin(${arg} + \\varphi)$ với $\\sqrt{${a * a} + ${b * b}} = ${R}$, nên $${-R}\\le ${coef(a)}\\sin ${arg}${term(b, `\\cos ${arg}`)}\\le ${R}$. Suy ra $${c - R}\\le y\\le ${c + R}$; giá trị ${isMax ? "lớn nhất" : "nhỏ nhất"} là $${v}$.`,
      };
    },
  },
  {
    id: "t11-sh-so-nghiem-tren-doan", subject: S, grade: G, chapter: C1, topic: "Số nghiệm của phương trình lượng giác trên một đoạn", half: 1, level: 3, kind: "short",
    make: (r) => {
      const f = r.pick(["sin", "cos"] as const), v = r.pick(SV), sg = r.pick([1, -1]), k = r.pick([1, 2, 2]);
      const a = 2 * (f === "sin" ? sg * v.sinA : sg > 0 ? v.cosA : 12 - v.cosA); // đơn vị π/24
      const [L, R] = r.pick([[0, 1], [0, 2], [-1, 1], [0, 3], [-1, 2], [-2, 2]]);
      const sol = listSol(f, a, 24, k, L, R);
      const kx = k === 1 ? "x" : "2x";
      return {
        stem: `Phương trình $2\\${f} ${kx} ${sg > 0 ? "-" : "+"} ${v.n} = 0$ có bao nhiêu nghiệm thuộc đoạn $\\left[${piT(L, 1)};${piT(R, 1)}\\right]$?`,
        ...short(sol.length),
        explanation: `Phương trình $\\Leftrightarrow \\${f} ${kx} = ${sg < 0 ? "-" : ""}${v.t} \\Leftrightarrow ${f === "sin" ? `${kx} = ${kAdd(piT(a, 24), "k2\\pi")}` + `\\text{ hoặc } ${kx} = ${kAdd(piT(24 - a, 24), "k2\\pi")}` : `${kx} = \\pm ${piT(a, 24)} + k2\\pi`}${k === 2 ? ` \\Leftrightarrow ${f === "sin" ? `x = ${kAdd(piT(a, 48), "k\\pi")}\\text{ hoặc } x = ${kAdd(piT(24 - a, 48), "k\\pi")}` : `x = \\pm ${piT(a, 48)} + k\\pi`}` : ""}$. Các nghiệm thuộc đoạn đã cho: ${sol.length ? sol.map((x) => `$${piT(x, 24)}$`).join(", ") : "không có"}. Vậy có $${sol.length}$ nghiệm.`,
      };
    },
  },
  {
    id: "t11-sh-tong-cap-so-cong", subject: S, grade: G, chapter: C2, topic: "Tổng n số hạng đầu của cấp số cộng", half: 1, level: 2, kind: "short",
    make: (r) => {
      const u1 = r.int(-10, 12), d = r.nz(-4, 5), p = r.int(2, 4), q = r.int(5, 9), n = r.int(8, 25);
      const up = u1 + (p - 1) * d, uq = u1 + (q - 1) * d, Sn = (n * (2 * u1 + (n - 1) * d)) / 2;
      const ask = r.pick(["S", "u"]), m = r.int(10, 40), um = u1 + (m - 1) * d;
      return {
        stem: `Cho cấp số cộng $(u_n)$ có $u_{${p}} = ${up}$ và $u_{${q}} = ${uq}$. ${ask === "S" ? `Tính tổng $${n}$ số hạng đầu tiên của cấp số cộng đó.` : `Tìm số hạng $u_{${m}}$.`}`,
        ...short(ask === "S" ? Sn : um),
        explanation: `$\\begin{cases}u_1 + ${coef(p - 1)}d = ${up}\\\\ u_1 + ${q - 1}d = ${uq}\\end{cases}\\Rightarrow d = \\dfrac{${uq} - ${par(up)}}{${q - p}} = ${d},\\ u_1 = ${u1}$. ${ask === "S" ? `$S_{${n}} = \\dfrac{${n}\\left[2\\cdot ${par(u1)} + ${n - 1}\\cdot ${par(d)}\\right]}{2} = ${Sn}$.` : `$u_{${m}} = ${u1} + ${m - 1}\\cdot ${par(d)} = ${um}$.`}`,
      };
    },
  },
  {
    id: "t11-sh-cap-so-nhan-thuc-te", subject: S, grade: G, chapter: C2, topic: "Cấp số nhân trong thực tế", half: 1, level: 3, kind: "short",
    make: (r) => {
      const v = r.int(0, 3);
      if (v === 0) {
        const N0 = r.int(2, 12), T = r.pick([10, 15, 20, 30]), H = r.int(1, 4), st = (60 * H) / T, N = N0 * 2 ** st;
        need(N <= 9999);
        return {
          stem: `Một loại vi khuẩn cứ sau $${T}$ phút thì số lượng tăng gấp đôi. Ban đầu có $${N0}$ con vi khuẩn. Hỏi sau đúng $${H}$ giờ có bao nhiêu con vi khuẩn?`,
          ...short(N),
          explanation: `$${H}$ giờ $= ${60 * H}$ phút gồm $${st}$ lần nhân đôi. Số vi khuẩn lập thành cấp số nhân công bội $2$: $N = ${N0}\\cdot 2^{${st}} = ${N}$.`,
        };
      }
      if (v === 1) {
        const N0 = r.int(2, 10), T = r.pick([10, 15, 20, 30]), st = r.int(3, 9), N = N0 * 2 ** st;
        need(N <= 99999);
        return {
          stem: `Một mẻ nuôi cấy có $${N0}$ tế bào, cứ sau $${T}$ phút thì số tế bào tăng gấp đôi. Sau ít nhất bao nhiêu phút thì số tế bào đạt $${N}$?`,
          ...short(st * T),
          explanation: `Sau $k$ lần nhân đôi có $${N0}\\cdot 2^k$ tế bào. $${N0}\\cdot 2^k = ${N}\\Leftrightarrow 2^k = ${2 ** st}\\Leftrightarrow k = ${st}$. Thời gian: $${st}\\cdot ${T} = ${st * T}$ phút.`,
        };
      }
      if (v === 2) {
        const h = r.int(4, 20), [p, s] = r.pick([[1, 2], [2, 3], [3, 4], [3, 5], [4, 5]]), n = r.int(2, 5), H = h * (p / s) ** n;
        return {
          stem: `Một quả bóng được thả rơi từ độ cao $${h}$ m. Mỗi lần chạm đất, quả bóng nảy lên đến độ cao bằng $${frac(p, s)}$ độ cao ngay trước đó. Tính độ cao quả bóng đạt được sau lần chạm đất thứ $${n}$ (đơn vị: m, làm tròn kết quả đến hàng phần trăm).`,
          ...short(H, 2),
          explanation: `Độ cao sau các lần nảy lập thành cấp số nhân với $u_1 = ${h}\\cdot ${frac(p, s)}$, $q = ${frac(p, s)}$. Sau lần thứ $${n}$: $u_{${n}} = ${h}\\cdot\\left(${frac(p, s)}\\right)^{${n}}\\approx ${tex(H, 2)}$ m.`,
        };
      }
      const q = r.pick([2, 3]), n = r.int(6, 12), k = r.int(1, 3);
      const nm = q === 2 ? "gấp đôi" : "gấp ba";
      return {
        stem: `Trên mặt một hồ nước, diện tích bèo phủ mỗi ngày tăng ${nm} so với ngày trước đó. Sau đúng $${n}$ ngày thì bèo phủ kín mặt hồ. Hỏi sau bao nhiêu ngày thì bèo phủ được $${frac(1, q ** k)}$ mặt hồ?`,
        ...short(n - k),
        explanation: `Diện tích bèo theo ngày lập thành cấp số nhân công bội $${q}$. Ngày thứ $${n}$ phủ kín hồ thì ngày thứ $${n} - ${k}$ phủ $\\dfrac{1}{${q}^{${k}}} = ${frac(1, q ** k)}$ mặt hồ. Đáp số: $${n - k}$ ngày.`,
      };
    },
  },
  {
    id: "t11-sh-csc-csn-ket-hop", subject: S, grade: G, chapter: C2, topic: "Kết hợp cấp số cộng và cấp số nhân", half: 1, level: 3, kind: "short",
    make: (r) => {
      const a = r.int(1, 6), m = r.int(2, 5), b = a * m * m, x = a * m, y2 = a + b; // y = (a+b)/2
      need(y2 % 2 === 0 || r.chance(0.5));
      const y = y2 / 2, ask = r.pick(["x+y", "y-x", "xy"]);
      const v = ask === "x+y" ? x + y : ask === "y-x" ? y - x : x * y;
      return {
        stem: `Biết ba số $${a}$, $x$, $${b}$ theo thứ tự lập thành một cấp số nhân với $x > 0$, và ba số $${a}$, $y$, $${b}$ theo thứ tự lập thành một cấp số cộng. Tính $${ask === "xy" ? "x\\cdot y" : ask}$${Number.isInteger(v) ? "" : " (làm tròn đến hàng phần mười)"}.`,
        ...short(v, 1),
        explanation: `Cấp số nhân: $x^2 = ${a}\\cdot ${b} = ${a * b}$, $x>0$ nên $x = ${x}$. Cấp số cộng: $y = \\dfrac{${a} + ${b}}{2} = ${tex(y, 1)}$. Vậy $${ask === "xy" ? "x\\cdot y" : ask} = ${tex(v, 1)}$.`,
      };
    },
  },
  /* =================================================================== HALF 2 – MCQ */
  {
    id: "t11-ghep-nhom-so-trung-binh", subject: S, grade: G, chapter: C3, topic: "Số trung bình của mẫu số liệu ghép nhóm", half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const d = gdata(r), x = gMean(d), xl = gMean(d, d.lo), xr = gMean(d, (i) => d.lo(i) + d.h), xu = d.f.reduce((s, _, i) => s + d.mid(i), 0) / d.k;
      return {
        stem: `${d.intro} ${d.table} Số trung bình của mẫu số liệu ghép nhóm trên (làm tròn đến hàng phần trăm) là`,
        ...mcq(r, num(x), [num(xl), num(xr), num(xu)]),
        explanation: `Giá trị đại diện của các nhóm lần lượt là ${d.f.map((_, i) => `$${tex(d.mid(i), 1)}$`).join("; ")}. Số trung bình: $\\bar x = \\dfrac{${d.f.map((fi, i) => `${fi}\\cdot ${tex(d.mid(i), 1)}`).join(" + ")}}{${d.n}}\\approx ${tex(x)}$.`,
      };
    },
  },
  {
    id: "t11-ghep-nhom-nhom-chua", subject: S, grade: G, chapter: C3, topic: "Nhóm chứa trung vị, tứ phân vị, mốt", half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const d = gdata(r), ask = r.pick(["me", "q1", "q3", "mo"]);
      let m: number, ex: string, name: string;
      if (ask === "mo") { const M = gMode(d); m = M.m; name = "mốt"; ex = `Nhóm chứa mốt là nhóm có tần số lớn nhất: nhóm $${d.grp(m)}$ với tần số $${M.fm}$.`; }
      else {
        const Q = gQuant(d, QN[ask].p); m = Q.m; name = QN[ask].name;
        ex = `Cỡ mẫu $n = ${d.n}$, $${QN[ask].ft} = ${tex(Q.pos)}$. ${cumText(d)} Nhóm đầu tiên có tần số tích lũy lớn hơn hoặc bằng $${tex(Q.pos)}$ là $${d.grp(m)}$, đó là nhóm chứa ${name}.`;
      }
      const others = [m - 1, m + 1, ...r.shuffle(d.f.map((_, i) => i))].filter((i, j, a) => i >= 0 && i < d.k && i !== m && a.indexOf(i) === j);
      return {
        stem: `${d.intro} ${d.table} Nhóm chứa ${name} của mẫu số liệu trên là`,
        ...mcq(r, $(d.grp(m)), others.map((i) => $(d.grp(i)))),
        explanation: ex,
      };
    },
  },
  {
    id: "t11-ghep-nhom-trung-vi-tu-phan-vi", subject: S, grade: G, chapter: C3, topic: "Trung vị, tứ phân vị của mẫu số liệu ghép nhóm", half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const d = gdata(r), key = r.pick(["me", "me", "q1", "q3"]), qn = QN[key], { m, C, pos, v } = gQuant(d, qn.p), f = d.f[m], lo = d.lo(m), h = d.h;
      const w1 = lo + ((qn.p * (d.n + 1) - C) / f) * h, w2 = lo + (pos / f) * h, w3 = d.mid(m), w4 = lo + h - ((pos - C) / f) * h;
      return {
        stem: `${d.intro} ${d.table} ${qn.name === "trung vị" ? "Trung vị" : qn.name[0].toUpperCase() + qn.name.slice(1)} $${qn.t}$ của mẫu số liệu ghép nhóm trên (làm tròn đến hàng phần trăm) là`,
        ...mcq(r, num(v), [num(w1), num(w2), num(w3), num(w4)]),
        explanation: `$n = ${d.n}$, $${qn.ft} = ${tex(pos)}$. ${cumText(d)} Nhóm chứa $${qn.t}$ là $${d.grp(m)}$ với $C = ${C}$, tần số $${f}$. $${qn.t} = ${lo} + \\dfrac{${tex(pos)} - ${C}}{${f}}\\cdot ${h}\\approx ${tex(v)}$.`,
      };
    },
  },
  {
    id: "t11-ghep-nhom-mot", subject: S, grade: G, chapter: C3, topic: "Mốt của mẫu số liệu ghép nhóm", half: 2, level: 3, kind: "mcq",
    make: (r) => {
      const d = gdata(r), M = gMode(d), lo = d.lo(M.m), h = d.h, k1 = M.fm - M.fp, k2 = M.fm - M.fn;
      return {
        stem: `${d.intro} ${d.table} Mốt của mẫu số liệu ghép nhóm trên (làm tròn đến hàng phần trăm) là`,
        ...mcq(r, num(M.v), [num(M.sw), num(d.mid(M.m)), num(lo + k1 / (k1 + k2)), num(lo + (M.fm / (M.fp + M.fn + M.fm)) * h), num(lo + h - (k1 / (k1 + k2)) * h)]),
        explanation: `Nhóm chứa mốt là $${d.grp(M.m)}$ (tần số lớn nhất $${M.fm}$); nhóm trước có tần số $${M.fp}$, nhóm sau có tần số $${M.fn}$. $M_o = ${lo} + \\dfrac{${M.fm} - ${M.fp}}{(${M.fm} - ${M.fp}) + (${M.fm} - ${M.fn})}\\cdot ${h}\\approx ${tex(M.v)}$.`,
      };
    },
  },
  {
    id: "t11-ss-khang-dinh-dung-sai", subject: S, grade: G, chapter: C4, topic: "Tính chất của quan hệ song song (lý thuyết)", half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const [P, Q] = r.pick([["(P)", "(Q)"], ["(\\alpha)", "(\\beta)"]]), [a, b] = r.pick([["a", "b"], ["d", "d'"], ["m", "n"]]);
      const T = [
        `Qua ba điểm phân biệt không thẳng hàng có duy nhất một mặt phẳng.`,
        `Hai đường thẳng phân biệt cùng song song với một đường thẳng thứ ba thì song song với nhau.`,
        `Nếu đường thẳng $${a}$ không nằm trong mặt phẳng $${P}$ và $${a}$ song song với một đường thẳng nằm trong $${P}$ thì $${a}\\parallel ${P}$.`,
        `Hai mặt phẳng phân biệt cùng song song với một mặt phẳng thứ ba thì song song với nhau.`,
        `Nếu hai mặt phẳng song song cùng bị cắt bởi một mặt phẳng thứ ba thì hai giao tuyến song song với nhau.`,
        `Một đường thẳng và một điểm không thuộc đường thẳng đó xác định duy nhất một mặt phẳng.`,
        `Nếu mặt phẳng $${P}$ chứa hai đường thẳng cắt nhau cùng song song với mặt phẳng $${Q}$ thì $${P}\\parallel ${Q}$.`,
        `Hai đường thẳng cắt nhau xác định duy nhất một mặt phẳng.`,
        `Phép chiếu song song biến hai đường thẳng song song thành hai đường thẳng song song hoặc trùng nhau.`,
      ];
      const FR: [string, string][] = [
        [`Qua ba điểm phân biệt bất kì có duy nhất một mặt phẳng.`, `nếu ba điểm thẳng hàng thì có vô số mặt phẳng đi qua chúng`],
        [`Hai đường thẳng không có điểm chung thì song song với nhau.`, `hai đường thẳng không có điểm chung có thể chéo nhau`],
        [`Hai đường thẳng phân biệt cùng song song với một mặt phẳng thì song song với nhau.`, `hai đường thẳng đó còn có thể cắt nhau hoặc chéo nhau`],
        [`Nếu đường thẳng $${a}$ song song với mặt phẳng $${P}$ thì $${a}$ song song với mọi đường thẳng nằm trong $${P}$.`, `$${a}$ có thể chéo nhau với một đường thẳng nằm trong $${P}$`],
        [`Hai mặt phẳng phân biệt cùng song song với một đường thẳng thì song song với nhau.`, `hai mặt phẳng đó có thể cắt nhau theo giao tuyến song song với đường thẳng đã cho`],
        [`Nếu mặt phẳng $${P}$ chứa hai đường thẳng cùng song song với mặt phẳng $${Q}$ thì $${P}\\parallel ${Q}$.`, `cần hai đường thẳng đó cắt nhau; nếu chúng song song thì $${P}$ vẫn có thể cắt $${Q}$`],
        [`Hai đường thẳng chéo nhau thì có đúng một điểm chung.`, `hai đường thẳng chéo nhau không có điểm chung`],
        [`Nếu hai đường thẳng $${a}$ và $${b}$ không có điểm chung thì chúng cùng nằm trong một mặt phẳng.`, `chúng có thể chéo nhau, tức là không đồng phẳng`],
        [`Phép chiếu song song biến hai đường thẳng chéo nhau thành hai đường thẳng chéo nhau.`, `hình chiếu nằm trên một mặt phẳng nên không thể chéo nhau (chúng cắt nhau hoặc song song)`],
      ];
      const F = FR.map((x) => x[0]), why = (st: string) => FR.find((x) => x[0] === st)![1];
      const askT = r.chance(0.5), good = r.pick(askT ? T : F), bad = pickN(r, askT ? F : T, 3);
      return {
        stem: `${r.pick(["Trong không gian, ", `Trong không gian, cho các đường thẳng $${a}$, $${b}$ và các mặt phẳng $${P}$, $${Q}$. `, `Cho hai đường thẳng $${a}$, $${b}$ và hai mặt phẳng $${P}$, $${Q}$ trong không gian. `])}${r.pick(["Khẳng định", "Mệnh đề"])} nào sau đây ${askT ? "đúng" : "sai"}?`.replace("Trong không gian, Khẳng", "Trong không gian, khẳng").replace("Trong không gian, Mệnh", "Trong không gian, mệnh"),
        ...mcq(r, good, bad),
        explanation: askT ? `Khẳng định đúng: "${good}" Các khẳng định còn lại sai: ${bad.map((x) => `"${x}" sai vì ${why(x)}`).join("; ")}.` : `Khẳng định "${good}" sai vì ${why(good)}. Ba khẳng định còn lại là các tính chất đã học về quan hệ song song.`,
      };
    },
  },
  {
    id: "t11-ss-vi-tri-tuong-doi", subject: S, grade: G, chapter: C4, topic: "Vị trí tương đối của đường thẳng, mặt phẳng", half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const [P, Q] = r.pick([["(P)", "(Q)"], ["(\\alpha)", "(\\beta)"]]), [a, b] = r.pick([["a", "b"], ["d", "\\Delta"], ["m", "n"]]);
      const D: [string, string, string[], string][] = [
        [`Trong không gian, hai đường thẳng không có điểm chung thì`, `song song hoặc chéo nhau`, [`song song với nhau`, `chéo nhau`, `cắt nhau hoặc chéo nhau`], `Hai đường thẳng không có điểm chung có thể đồng phẳng (song song) hoặc không đồng phẳng (chéo nhau).`],
        [`Hai đường thẳng phân biệt cùng nằm trong một mặt phẳng và không có điểm chung thì`, `song song với nhau`, [`chéo nhau`, `cắt nhau`, `song song hoặc chéo nhau`], `Hai đường thẳng đồng phẳng, không có điểm chung thì song song.`],
        [`Cho đường thẳng $${a}$ song song với mặt phẳng $${P}$. Số điểm chung của $${a}$ và $${P}$ là`, `$0$`, [`$1$`, `$2$`, `vô số`], `Đường thẳng song song với mặt phẳng khi chúng không có điểm chung.`],
        [`Cho hai mặt phẳng phân biệt $${P}$ và $${Q}$ có một điểm chung $M$. Khi đó $${P}$ và $${Q}$`, `cắt nhau theo một giao tuyến đi qua $M$`, [`song song với nhau`, `chỉ có một điểm chung duy nhất là $M$`, `trùng nhau`], `Hai mặt phẳng phân biệt có một điểm chung thì có một đường thẳng chung đi qua điểm đó.`],
        [`Cho hai đường thẳng chéo nhau $${a}$ và $${b}$. Có bao nhiêu mặt phẳng chứa $${a}$ và song song với $${b}$?`, `Đúng một`, [`Không có`, `Đúng hai`, `Vô số`], `Qua một trong hai đường thẳng chéo nhau có duy nhất một mặt phẳng song song với đường thẳng còn lại.`],
        [`Cho điểm $A$ nằm ngoài mặt phẳng $${P}$. Qua $A$ có bao nhiêu mặt phẳng song song với $${P}$?`, `Đúng một`, [`Không có`, `Đúng hai`, `Vô số`], `Qua một điểm nằm ngoài một mặt phẳng có duy nhất một mặt phẳng song song với mặt phẳng đó.`],
        [`Cho điểm $A$ không thuộc đường thẳng $${a}$. Qua $A$ có bao nhiêu đường thẳng song song với $${a}$?`, `Đúng một`, [`Không có`, `Đúng hai`, `Vô số`], `Qua một điểm không nằm trên đường thẳng $${a}$ có đúng một đường thẳng song song với $${a}$.`],
        [`Cho đường thẳng $${a}$ nằm trong mặt phẳng $${P}$ và $${P}\\parallel ${Q}$. Khẳng định nào sau đây đúng?`, `$${a}\\parallel ${Q}$`, [`$${a}$ cắt $${Q}$`, `$${a}\\subset ${Q}$`, `$${a}$ cắt hoặc nằm trong $${Q}$`], `Nếu hai mặt phẳng song song thì mọi đường thẳng nằm trong mặt phẳng này đều song song với mặt phẳng kia.`],
        [`Cho điểm $A$ nằm ngoài mặt phẳng $${P}$. Qua $A$ có bao nhiêu đường thẳng song song với $${P}$?`, `Vô số`, [`Đúng một`, `Đúng hai`, `Không có`], `Mọi đường thẳng qua $A$ nằm trong mặt phẳng qua $A$ song song với $${P}$ đều song song với $${P}$: có vô số.`],
        [`Qua phép chiếu song song, hình chiếu của trung điểm đoạn thẳng $AB$ là`, `trung điểm của hình chiếu đoạn thẳng $AB$`, [`một điểm nằm ngoài hình chiếu của $AB$`, `một đầu mút của hình chiếu của $AB$`, `điểm chia hình chiếu của $AB$ theo tỉ số $1:2$`], `Phép chiếu song song bảo toàn tỉ số độ dài của hai đoạn thẳng nằm trên một đường thẳng, nên biến trung điểm thành trung điểm.`],
      ];
      const [st, good, bad, ex] = r.pick(D);
      return { stem: st, ...mcq(r, good, bad), explanation: ex };
    },
  },
  {
    id: "t11-ss-giao-tuyen", subject: S, grade: G, chapter: C4, topic: "Giao tuyến của hai mặt phẳng", half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const hbh = "Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình bình hành tâm $O$.";
      const ht = "Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình thang với $AD\\parallel BC$ và $AD > BC$. Gọi $O$ là giao điểm của $AC$ và $BD$, $I$ là giao điểm của $AB$ và $CD$.";
      const qs = (v: string) => `đường thẳng đi qua $S$ và song song với $${v}$`;
      const D: [string, string, string, string, string[], string][] = [
        [hbh, "(SAC)", "(SBD)", "$SO$", ["$SA$", "$AC$", qs("AC")], "$S$ và $O$ (giao điểm của $AC$, $BD$) là hai điểm chung."],
        [hbh, "(SAB)", "(SCD)", qs("AB"), ["$SO$", qs("AD"), "$SC$"], "Hai mặt phẳng có điểm chung $S$ và lần lượt chứa $AB\\parallel CD$ nên giao tuyến qua $S$ và song song với $AB$."],
        [hbh, "(SAD)", "(SBC)", qs("AD"), ["$SO$", qs("AB"), "$SB$"], "Hai mặt phẳng có điểm chung $S$ và lần lượt chứa $AD\\parallel BC$ nên giao tuyến qua $S$ và song song với $AD$."],
        [hbh, "(SAB)", "(SAD)", "$SA$", ["$SO$", "$AB$", "$SB$"], "$S$ và $A$ là hai điểm chung của hai mặt phẳng."],
        [hbh + " Gọi $M$ là trung điểm của $SC$.", "(MBD)", "(SAC)", "$MO$", ["$MA$", "$SO$", "$BM$"], "$M\\in SC\\subset(SAC)$ và $O\\in AC$, $O\\in BD$ nên $M$, $O$ là hai điểm chung."],
        [hbh + " Gọi $M$, $N$ lần lượt là trung điểm của $SA$, $SB$.", "(MNC)", "(ABCD)", "$CD$", ["$AB$", "$AC$", "đường thẳng qua $C$ song song với $AD$"], "$MN\\parallel AB\\parallel CD$ nên $(MNC)$ chứa $CD$; giao tuyến với $(ABCD)$ là $CD$."],
        [ht, "(SAC)", "(SBD)", "$SO$", ["$SI$", qs("AD"), "$SA$"], "$S$ và $O$ là hai điểm chung."],
        [ht, "(SAB)", "(SCD)", "$SI$", ["$SO$", qs("AB"), qs("AD")], "$I\\in AB\\subset(SAB)$ và $I\\in CD\\subset(SCD)$ nên $S$, $I$ là hai điểm chung."],
        [ht, "(SAD)", "(SBC)", qs("AD"), ["$SI$", "$SO$", qs("AB")], "Hai mặt phẳng có điểm chung $S$ và lần lượt chứa $AD\\parallel BC$ nên giao tuyến qua $S$ và song song với $AD$."],
      ];
      const [ctx, p1, p2, good, bad, ex] = r.pick(D), sw = r.chance(0.5);
      return {
        stem: `${ctx} Giao tuyến của hai mặt phẳng $${sw ? p2 : p1}$ và $${sw ? p1 : p2}$ là`,
        ...mcq(r, good, bad),
        explanation: `${ex} Vậy giao tuyến là ${good}.`,
      };
    },
  },
  {
    id: "t11-ss-duong-thang-song-song-mp", subject: S, grade: G, chapter: C4, topic: "Đường thẳng song song với mặt phẳng", half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const hbh = "Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình bình hành tâm $O$.";
      const D: [string, string, string, string[], string[]][] = [
        [hbh + " Gọi $M$, $N$ lần lượt là trung điểm của $SA$, $SB$.", "MN", "$MN$ là đường trung bình của tam giác $SAB$ nên $MN\\parallel AB\\parallel CD$.", ["(ABCD)", "(SCD)"], ["(SAB)", "(SAC)", "(SBD)", "(SAD)", "(SBC)"]],
        [hbh + " Gọi $M$, $N$ lần lượt là trung điểm của $SA$, $SD$.", "MN", "$MN$ là đường trung bình của tam giác $SAD$ nên $MN\\parallel AD\\parallel BC$.", ["(ABCD)", "(SBC)"], ["(SAD)", "(SAB)", "(SCD)", "(SAC)", "(SBD)"]],
        [hbh + " Gọi $M$ là trung điểm của $SC$.", "OM", "$OM$ là đường trung bình của tam giác $SAC$ nên $OM\\parallel SA$.", ["(SAB)", "(SAD)"], ["(SAC)", "(SBC)", "(SCD)", "(SBD)"]],
        [hbh + " Gọi $M$ là trung điểm của $SB$.", "OM", "$OM$ là đường trung bình của tam giác $SBD$ nên $OM\\parallel SD$.", ["(SAD)", "(SCD)"], ["(SBD)", "(SAB)", "(SBC)", "(SAC)"]],
        [hbh + " Gọi $M$ là trung điểm của $SA$.", "OM", "$OM$ là đường trung bình của tam giác $SAC$ nên $OM\\parallel SC$.", ["(SBC)", "(SCD)"], ["(SAC)", "(SAB)", "(SAD)", "(SBD)"]],
        ["Cho tứ diện $ABCD$. Gọi $M$, $N$ lần lượt là trung điểm của $AB$, $AC$.", "MN", "$MN$ là đường trung bình của tam giác $ABC$ nên $MN\\parallel BC$.", ["(BCD)"], ["(ABC)", "(ABD)", "(ACD)"]],
        ["Cho tứ diện $ABCD$. Gọi $M$, $N$ lần lượt là trung điểm của $AC$, $AD$.", "MN", "$MN$ là đường trung bình của tam giác $ACD$ nên $MN\\parallel CD$.", ["(BCD)"], ["(ACD)", "(ABC)", "(ABD)"]],
        ["Cho tứ diện $ABCD$. Gọi $G_1$, $G_2$ lần lượt là trọng tâm của các tam giác $ABC$, $ABD$.", "G_1G_2", "Gọi $I$ là trung điểm $AB$; $\\dfrac{IG_1}{IC} = \\dfrac{IG_2}{ID} = \\dfrac{1}{3}$ nên $G_1G_2\\parallel CD$.", ["(BCD)", "(ACD)"], ["(ABC)", "(ABD)", "(ICD)"]],
      ];
      const [ctx, l, why, yes, no] = r.pick(D), good = r.pick(yes);
      return {
        stem: `${ctx} ${r.pick([`Đường thẳng $${l}$ song song với mặt phẳng nào sau đây?`, `Mặt phẳng nào sau đây song song với đường thẳng $${l}$?`])}`,
        ...mcq(r, $(good), pickN(r, no, 3).map($)),
        explanation: `${why} Đường thẳng này nằm trong ${yes.map($).join(", ")} và không nằm trong $${good}$ nên $${l}\\parallel ${good}$. Các mặt phẳng còn lại chứa $${l}$ hoặc có điểm chung với $${l}$.`.replace(` nằm trong ${yes.map($).join(", ")} và`, ` song song với một đường thẳng nằm trong $${good}$,`),
      };
    },
  },
  {
    id: "t11-gh-gioi-han-day-so", subject: S, grade: G, chapter: C5, topic: "Giới hạn của dãy số dạng phân thức", half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const t = r.int(0, 3), a = r.nz(-6, 6), b = r.int(-6, 6), c = r.nz(-5, 5), d = r.nz(-6, 6), e = r.int(-5, 5);
      const tq = (x: number, p: number) => (x === 0 ? "" : ` ${x < 0 ? "-" : "+"} \\dfrac{${Math.abs(x)}}{n${p > 1 ? `^{${p}}` : ""}}`);
      let N: string, Dn: string, right: string, wrong: string[], ex: string;
      if (t === 0) {
        N = poly([a, b], "n"); Dn = poly([c, d], "n"); right = frac(a, c);
        wrong = [frac(b, d), INF(a * c), "0", c + d !== 0 ? frac(a + b, c + d) : frac(-a, c)];
        ex = `Chia cả tử và mẫu cho $n$: $\\lim\\dfrac{${a}${tq(b, 1)}}{${c}${tq(d, 1)}} = ${right}$.`;
      } else if (t === 1) {
        N = poly([a, b, e], "n"); Dn = poly([c, 0, d], "n"); right = frac(a, c);
        wrong = [frac(e, d), INF(a * c), "0", frac(b, c)];
        ex = `Chia cả tử và mẫu cho $n^2$: $\\lim\\dfrac{${a}${tq(b, 1)}${tq(e, 2)}}{${c}${tq(d, 2)}} = ${right}$.`;
      } else if (t === 2) {
        N = poly([a, b], "n"); Dn = poly([c, e, d], "n"); right = "0";
        wrong = [frac(a, c), INF(a * c), frac(b, d)];
        ex = `Chia cả tử và mẫu cho $n^2$: $\\lim\\dfrac{\\frac{${a}}{n}${tq(b, 2)}}{${c}${tq(e, 1)}${tq(d, 2)}} = \\dfrac{0}{${c}} = 0$.`;
      } else {
        N = poly([a, 0, b], "n"); Dn = poly([c, d], "n"); right = INF(a * c);
        wrong = [INF(-a * c), frac(a, c), "0"];
        ex = `Chia cả tử và mẫu cho $n$: $\\dfrac{${a}n${tq(b, 1)}}{${c}${tq(d, 1)}}$; tử $\\to ${INF(a)}$, mẫu $\\to ${c}$ nên giới hạn bằng $${right}$.`;
      }
      need(!wrong.includes(right));
      return { stem: `$\\lim\\dfrac{${N}}{${Dn}}$ bằng`, ...mcq(r, $(right), wrong.map($)), explanation: ex };
    },
  },
  {
    id: "t11-gh-dang-vo-dinh-0-0", subject: S, grade: G, chapter: C5, topic: "Giới hạn hàm số dạng 0/0", half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const t = r.int(0, 3), x0 = r.nz(-4, 5);
      let N: string, L: number | [number, number], wrong: (number | [number, number])[], ex: string;
      if (t === 0) {
        const p = r.int(-5, 5); need(p !== x0);
        N = poly([1, -(x0 + p), x0 * p], "x"); L = x0 - p; wrong = [x0 + p, p - x0, 0, 2 * x0];
        ex = `\\dfrac{${N}}{${poly([1, -x0], "x")}} = \\dfrac{(${poly([1, -x0], "x")})(${poly([1, -p], "x")})}{${poly([1, -x0], "x")}} = ${poly([1, -p], "x")}\\to ${L}`;
      } else if (t === 1) {
        N = poly([1, 0, -x0 * x0], "x"); L = 2 * x0; wrong = [x0, 0, -2 * x0, x0 * x0];
        ex = `\\dfrac{${N}}{${poly([1, -x0], "x")}} = ${poly([1, x0], "x")}\\to ${L}`;
      } else if (t === 2) {
        const dd = r.int(2, 4), c = dd * dd - x0;
        N = `\\sqrt{${poly([1, c], "x")}} - ${dd}`; L = [1, 2 * dd]; wrong = [[1, dd], 2 * dd, 0, [-1, 2 * dd]];
        ex = `\\dfrac{${N}}{${poly([1, -x0], "x")}} = \\dfrac{${poly([1, c - dd * dd], "x")}}{(${poly([1, -x0], "x")})\\left(\\sqrt{${poly([1, c], "x")}} + ${dd}\\right)} = \\dfrac{1}{\\sqrt{${poly([1, c], "x")}} + ${dd}}\\to ${frac(1, 2 * dd)}`;
      } else {
        N = poly([1, 0, 0, -(x0 ** 3)], "x"); L = 3 * x0 * x0; wrong = [x0 * x0, 3 * x0, 0, 2 * x0 * x0];
        ex = `\\dfrac{${N}}{${poly([1, -x0], "x")}} = ${poly([1, x0, x0 * x0], "x")}\\to ${L}`;
      }
      const F = (v: number | [number, number]) => $(Array.isArray(v) ? frac(v[0], v[1]) : String(v));
      return {
        stem: `$\\displaystyle\\lim_{x\\to ${x0}}\\dfrac{${N}}{${poly([1, -x0], "x")}}$ bằng`,
        ...mcq(r, F(L), wrong.map(F)),
        explanation: `Dạng $\\dfrac{0}{0}$. Với $x\\ne ${x0}$: $${ex}$ khi $x\\to ${x0}$.`,
      };
    },
  },
  {
    id: "t11-gh-gioi-han-mot-ben", subject: S, grade: G, chapter: C5, topic: "Giới hạn một bên, giới hạn vô cực", half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const x0 = r.nz(-4, 5), p = r.nz(-4, 4), q = r.int(-6, 6), Nv = p * x0 + q; need(Nv !== 0);
      const side = r.pick([1, -1]), flip = r.chance(0.35) && x0 > 0;
      const D = flip ? `${x0} - x` : poly([1, -x0], "x"), dS = side * (flip ? -1 : 1), res = Math.sign(Nv) * dS;
      return {
        stem: `$\\displaystyle\\lim_{x\\to ${x0}^{${side > 0 ? "+" : "-"}}}\\dfrac{${poly([p, q], "x")}}{${D}}$ bằng`,
        ...mcq(r, $(INF(res)), [$(INF(-res)), $(String(flip ? -p : p)), "$0$"]),
        explanation: `Khi $x\\to ${x0}^{${side > 0 ? "+" : "-"}}$: tử số $${poly([p, q], "x")}\\to ${Nv} ${Nv > 0 ? ">" : "<"} 0$, mẫu số $${D}\\to 0$ và $${D} ${dS > 0 ? ">" : "<"} 0$. Do đó giới hạn bằng $${INF(res)}$.`,
      };
    },
  },
  {
    id: "t11-gh-cap-so-nhan-lui-vo-han", subject: S, grade: G, chapter: C5, topic: "Tổng của cấp số nhân lùi vô hạn", half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const [p, s] = r.pick([[1, 2], [-1, 2], [1, 3], [-1, 3], [2, 3], [-2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [-1, 4]]);
      const u1 = r.nz(-6, 12), Sv = frac(u1 * s, s - p), qT = frac(p, s);
      const tm = (k: number) => { const nu = u1 * p ** k, de = s ** k; return { sg: nu < 0 ? "-" : "+", ab: frac(Math.abs(nu), de) }; };
      const series = [0, 1, 2, 3].map((k, i) => { const t = tm(k); return i === 0 ? (t.sg === "-" ? "-" : "") + t.ab : ` ${t.sg} ${t.ab}`; }).join("") + " + \\cdots";
      const v = r.chance(0.5);
      return {
        stem: v ? `Tổng $S = ${series}$ bằng` : `Cho cấp số nhân lùi vô hạn $(u_n)$ có $u_1 = ${u1}$ và công bội $q = ${qT}$. Tổng của cấp số nhân đó bằng`,
        ...mcq(r, $(Sv), [$(frac(u1 * s, s + p)), $(frac(u1 * p, s - p)), $(frac(u1 * s, p - s)), $(frac(u1 * (s - p), s))]),
        explanation: `${v ? `Đây là tổng của cấp số nhân lùi vô hạn với $u_1 = ${u1}$, $q = ${qT}$ ($|q|<1$). ` : ""}$S = \\dfrac{u_1}{1 - q} = \\dfrac{${u1}}{1 - \\left(${qT}\\right)} = ${Sv}$.`,
      };
    },
  },
  {
    id: "t11-gh-lien-tuc-tham-so", subject: S, grade: G, chapter: C5, topic: "Tìm tham số để hàm số liên tục", half: 2, level: 3, kind: "mcq",
    make: (r) => {
      const t = r.int(0, 2), x0 = r.nz(-3, 4);
      const [ea, eb] = r.pick([[1, 0], [2, 0], [1, 1], [1, -2], [2, 1], [3, -1]]);
      const em = `${coef(ea)}m${term(eb)}`, solve = (L: number | [number, number]) => { const [pn, pd] = Array.isArray(L) ? L : [L, 1]; return `$m = ${frac(pn - eb * pd, ea * pd)}$`; };
      if (t === 2) {
        const a = r.nz(-3, 3), b = r.int(-5, 5), m = x0 * x0 + b - a * x0;
        return {
          stem: `Cho hàm số $f(x) = \\begin{cases} ${poly([a, 0], "x")} + m & \\text{khi } x\\le ${x0}\\\\ ${poly([1, 0, b], "x")} & \\text{khi } x > ${x0}\\end{cases}$. Giá trị của tham số $m$ để hàm số liên tục tại $x = ${x0}$ là`,
          ...mcq(r, `$m = ${m}$`, [`$m = ${x0 * x0 + b + a * x0}$`, `$m = ${x0 * x0 + b}$`, `$m = ${a * x0 - x0 * x0 - b}$`, `$m = ${m + 1}$`]),
          explanation: `$f(${x0}) = \\displaystyle\\lim_{x\\to ${x0}^-}f(x) = ${a * x0} + m$; $\\displaystyle\\lim_{x\\to ${x0}^+}f(x) = ${x0 * x0}${term(b)} = ${x0 * x0 + b}$. Liên tục tại $x = ${x0}$ khi $${a * x0} + m = ${x0 * x0 + b}\\Leftrightarrow m = ${m}$.`,
        };
      }
      let top: string, L: number | [number, number], wrongL: (number | [number, number])[], ex: string;
      if (t === 0) {
        const p = r.int(-4, 4); need(p !== x0);
        top = `\\dfrac{${poly([1, -(x0 + p), x0 * p], "x")}}{${poly([1, -x0], "x")}}`; L = x0 - p; wrongL = [x0 + p, 0, p - x0, 2 * x0];
        ex = `$\\displaystyle\\lim_{x\\to ${x0}}${top} = \\lim_{x\\to ${x0}}(${poly([1, -p], "x")}) = ${L}$`;
      } else {
        const dd = r.int(2, 4), c = dd * dd - x0;
        top = `\\dfrac{\\sqrt{${poly([1, c], "x")}} - ${dd}}{${poly([1, -x0], "x")}}`; L = [1, 2 * dd]; wrongL = [[1, dd], 0, 2 * dd, [-1, 2 * dd]];
        ex = `$\\displaystyle\\lim_{x\\to ${x0}}${top} = \\lim_{x\\to ${x0}}\\dfrac{1}{\\sqrt{${poly([1, c], "x")}} + ${dd}} = ${frac(1, 2 * dd)}$`;
      }
      const Lt = Array.isArray(L) ? frac(L[0], L[1]) : String(L);
      return {
        stem: `Cho hàm số $f(x) = \\begin{cases} ${top} & \\text{khi } x\\ne ${x0}\\\\ ${em} & \\text{khi } x = ${x0}\\end{cases}$. Giá trị của tham số $m$ để hàm số liên tục tại $x = ${x0}$ là`,
        ...mcq(r, solve(L), wrongL.map(solve)),
        explanation: `${ex}. Hàm số liên tục tại $x = ${x0}$ khi $f(${x0}) = ${Lt}$, tức là $${em} = ${Lt}\\Leftrightarrow ${solve(L).slice(1, -1)}$.`,
      };
    },
  },
  {
    id: "t11-gh-da-thuc-tai-vo-cuc", subject: S, grade: G, chapter: C5, topic: "Giới hạn của đa thức tại vô cực", half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const deg = r.pick([2, 3, 4]), a = r.nz(-4, 4), cs = [a, ...Array.from({ length: deg }, () => r.int(-6, 6))];
      const isSeq = r.chance(0.3), side = isSeq ? 1 : r.pick([1, -1]), v = isSeq ? "n" : "x";
      const res = Math.sign(a) * (deg % 2 ? side : 1);
      const lim = isSeq ? "\\lim" : `\\displaystyle\\lim_{x\\to ${side > 0 ? "+" : "-"}\\infty}`;
      return {
        stem: `$${lim}\\left(${poly(cs, v)}\\right)$ bằng`,
        ...mcq(r, $(INF(res)), [$(INF(-res)), $(String(a)), "$0$"]),
        explanation: `$${poly(cs, v)} = ${v}^{${deg}}\\left(${a} + \\ldots\\right)$, trong đó phần trong ngoặc dần tới $${a}$. Vì $${v}^{${deg}}\\to ${INF(deg % 2 ? side : 1)}$ và $${a} ${a > 0 ? ">" : "<"} 0$ nên giới hạn bằng $${INF(res)}$.`,
      };
    },
  },

  /* =================================================================== HALF 2 – TF */
  {
    id: "t11-tf-ghep-nhom", subject: S, grade: G, chapter: C3, topic: "Các số đặc trưng của mẫu số liệu ghép nhóm", half: 2, level: 2, kind: "tf",
    make: (r) => {
      const d = gdata(r), i = r.int(0, d.k - 1), Me = gQuant(d, 0.5), M = gMode(d), x = gMean(d), xl = gMean(d, d.lo);
      need(tex(x) !== tex(xl) && tex(M.v) !== tex(M.sw));
      const t = [r.chance(0.5), r.chance(0.5), r.chance(0.5), r.chance(0.5)];
      const wm = Me.m + (Me.m === 0 ? 1 : Me.m === d.k - 1 ? -1 : r.pick([-1, 1]));
      return {
        stem: `${d.intro} ${d.table}`,
        ...tf([
          [`Giá trị đại diện của nhóm $${d.grp(i)}$ là $${tex(t[0] ? d.mid(i) : d.lo(i), 1)}$.`, t[0]],
          [`Nhóm chứa trung vị của mẫu số liệu là $${d.grp(t[1] ? Me.m : wm)}$.`, t[1]],
          [`Số trung bình của mẫu số liệu (làm tròn đến hàng phần trăm) là $${tex(t[2] ? x : xl)}$.`, t[2]],
          [`Mốt của mẫu số liệu (làm tròn đến hàng phần trăm) là $${tex(t[3] ? M.v : M.sw)}$.`, t[3]],
        ]),
        explanation: `Giá trị đại diện của nhóm $${d.grp(i)}$ là $\\dfrac{${d.lo(i)} + ${d.lo(i) + d.h}}{2} = ${tex(d.mid(i), 1)}$. $n = ${d.n}$, $\\dfrac{n}{2} = ${tex(d.n / 2)}$; ${cumText(d)} Nhóm chứa trung vị là $${d.grp(Me.m)}$. $\\bar x = \\dfrac{${d.f.map((fi, j) => `${fi}\\cdot ${tex(d.mid(j), 1)}`).join(" + ")}}{${d.n}}\\approx ${tex(x)}$. Nhóm chứa mốt $${d.grp(M.m)}$: $M_o = ${d.lo(M.m)} + \\dfrac{${M.fm} - ${M.fp}}{(${M.fm} - ${M.fp}) + (${M.fm} - ${M.fn})}\\cdot ${d.h}\\approx ${tex(M.v)}$.`,
      };
    },
  },
  {
    id: "t11-tf-hinh-chop-song-song", subject: S, grade: G, chapter: C4, topic: "Quan hệ song song trong hình chóp, tứ diện", half: 2, level: 2, kind: "tf",
    make: (r) => {
      const C: [string, [string, string, string][]][] = [
        ["Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình bình hành tâm $O$. Gọi $M$ là trung điểm của cạnh $SC$.", [
          ["$OM\\parallel SA$.", "$OM\\parallel SB$.", "$OM$ là đường trung bình của tam giác $SAC$ nên $OM\\parallel SA$."],
          ["$OM\\parallel(SAB)$.", "$OM\\parallel(SBC)$.", "$OM\\parallel SA\\subset(SAB)$; còn $M\\in(SBC)$ nên $OM$ cắt $(SBC)$."],
          ["$OM\\parallel(SAD)$.", "$OM\\parallel(SCD)$.", "$OM\\parallel SA\\subset(SAD)$; còn $M\\in(SCD)$."],
          ["Giao tuyến của hai mặt phẳng $(SAC)$ và $(SBD)$ là đường thẳng $SO$.", "Giao tuyến của hai mặt phẳng $(SAC)$ và $(SBD)$ là đường thẳng $SA$.", "$S$, $O$ là hai điểm chung của $(SAC)$ và $(SBD)$."],
          ["Giao tuyến của hai mặt phẳng $(MBD)$ và $(SAC)$ là đường thẳng $OM$.", "Giao tuyến của hai mặt phẳng $(MBD)$ và $(SAC)$ là đường thẳng $MA$.", "$M$, $O$ là hai điểm chung của $(MBD)$ và $(SAC)$; $A\\notin(MBD)$."],
          ["Giao điểm của đường thẳng $AM$ với mặt phẳng $(SBD)$ là trọng tâm của tam giác $SAC$.", "Giao điểm của đường thẳng $AM$ với mặt phẳng $(SBD)$ là điểm $O$.", "Trong tam giác $SAC$, $AM$ và $SO$ là hai trung tuyến cắt nhau tại trọng tâm, mà $SO\\subset(SBD)$."],
        ]],
        ["Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình bình hành. Gọi $M$, $N$ lần lượt là trung điểm của $SA$, $SB$.", [
          ["$MN\\parallel AB$.", "$MN\\parallel AD$.", "$MN$ là đường trung bình của tam giác $SAB$."],
          ["$MN\\parallel CD$.", "$MN$ và $CD$ chéo nhau.", "$MN\\parallel AB$ và $AB\\parallel CD$ nên $MN\\parallel CD$."],
          ["$MN\\parallel(ABCD)$.", "$MN$ cắt mặt phẳng $(ABCD)$.", "$MN\\parallel AB\\subset(ABCD)$ và $MN\\not\\subset(ABCD)$."],
          ["$MN\\parallel(SCD)$.", "$MN\\parallel(SAD)$.", "$MN\\parallel CD\\subset(SCD)$; còn $M\\in(SAD)$."],
          ["$MN = \\dfrac{1}{2}CD$.", "$MN = CD$.", "$MN = \\dfrac{1}{2}AB = \\dfrac{1}{2}CD$."],
          ["Tứ giác $MNCD$ là hình thang.", "Tứ giác $MNCD$ là hình bình hành.", "$MN\\parallel CD$ nhưng $MN = \\dfrac{1}{2}CD\\ne CD$ nên $MNCD$ là hình thang (không là hình bình hành)."],
        ]],
        ["Cho tứ diện $ABCD$. Gọi $M$, $N$ lần lượt là trung điểm của $AB$, $AC$.", [
          ["$MN\\parallel BC$.", "$MN\\parallel BD$.", "$MN$ là đường trung bình của tam giác $ABC$."],
          ["$MN\\parallel(BCD)$.", "$MN\\parallel(ABD)$.", "$MN\\parallel BC\\subset(BCD)$; còn $M\\in(ABD)$."],
          ["$MN = \\dfrac{1}{2}BC$.", "$MN = \\dfrac{1}{3}BC$.", "Tính chất đường trung bình."],
          ["Hai đường thẳng $MN$ và $CD$ chéo nhau.", "Hai đường thẳng $MN$ và $CD$ cắt nhau.", "$MN\\subset(ABC)$, $CD$ cắt $(ABC)$ tại $C\\notin MN$ nên $MN$, $CD$ không đồng phẳng."],
          ["Giao tuyến của hai mặt phẳng $(DMN)$ và $(BCD)$ là đường thẳng qua $D$ song song với $BC$.", "Giao tuyến của hai mặt phẳng $(DMN)$ và $(BCD)$ là đường thẳng $DB$.", "Hai mặt phẳng có điểm chung $D$ và lần lượt chứa $MN\\parallel BC$."],
          ["Mặt phẳng $(DMN)$ song song với đường thẳng $BC$.", "Mặt phẳng $(DMN)$ chứa đường thẳng $BC$.", "$BC\\parallel MN\\subset(DMN)$ và $BC\\not\\subset(DMN)$."],
        ]],
      ];
      const ci = r.int(0, C.length - 1), [ctx, pool] = C[ci], idx = pickN(r, pool.map((_, i) => i), 4).sort((x, y) => x - y);
      const t = idx.map(() => r.chance(0.5));
      const [m1, n1] = ci === 0 ? [r.pick(["M", "I", "K", "E", "N"]), "N"] : r.pick([["M", "N"], ["E", "F"], ["I", "K"], ["P", "Q"]]);
      const rn = (x: string) => x.replace(/\$[^$]*\$/g, (seg) => seg.replace(/[MN]/g, (ch) => (ch === "M" ? m1 : n1)));
      return {
        stem: rn(ctx),
        ...tf(idx.map((i, j) => [rn(t[j] ? pool[i][0] : pool[i][1]), t[j]] as [string, boolean])),
        explanation: rn(idx.map((i, j) => `${t[j] ? "Đúng" : "Sai"}: ${pool[i][2]}`).join(" ")),
      };
    },
  },
  {
    id: "t11-tf-gioi-han", subject: S, grade: G, chapter: C5, topic: "Giới hạn dãy số và hàm số", half: 2, level: 2, kind: "tf",
    make: (r) => {
      const a = r.nz(-6, 6), b = r.int(-6, 6), c = r.nz(1, 5), d = r.nz(-6, 6), x0 = r.nz(-4, 4), k = r.nz(-9, 9);
      need(frac(a, c) !== frac(b, d));
      const [p, s] = r.pick([[1, 2], [2, 3], [-1, 3], [3, 4], [-2, 5]]), [P, Sb] = r.pick([[3, 2], [4, 3], [5, 2], [5, 4]]);
      const t = [r.chance(0.5), r.chance(0.5), r.chance(0.5), r.chance(0.5)];
      const w3 = r.pick([0, x0]), w4 = r.pick([0, k]);
      return {
        stem: `Cho dãy số $(u_n)$ với $u_n = \\dfrac{${poly([a, b], "n")}}{${poly([c, d], "n")}}$ và hàm số $f(x) = \\dfrac{${poly([1, 0, -x0 * x0], "x")}}{${poly([1, -x0], "x")}}$. Xét tính đúng sai của các khẳng định sau.`,
        ...tf([
          [`$\\lim u_n = ${t[0] ? frac(a, c) : frac(b, d)}$.`, t[0]],
          [`$\\lim\\left(${t[1] ? frac(p, s) : frac(P, Sb)}\\right)^{n} = 0$.`, t[1]],
          [`$\\displaystyle\\lim_{x\\to ${x0}}f(x) = ${t[2] ? 2 * x0 : w3}$.`, t[2]],
          [`$\\lim\\left(\\sqrt{${poly([1, k, 0], "n")}} - n\\right) = ${t[3] ? frac(k, 2) : w4}$.`, t[3]],
        ]),
        explanation: `Chia tử và mẫu cho $n$: giới hạn thứ nhất bằng $${frac(a, c)}$. $\\lim q^n = 0$ khi $|q|<1$, còn $\\lim\\left(${frac(P, Sb)}\\right)^n = +\\infty$. $\\dfrac{x^2 - ${x0 * x0}}{${poly([1, -x0], "x")}} = ${poly([1, x0], "x")}\\to ${2 * x0}$. $\\sqrt{${poly([1, k, 0], "n")}} - n = \\dfrac{${coef(k)}n}{\\sqrt{${poly([1, k, 0], "n")}} + n} = \\dfrac{${k}}{\\sqrt{1 ${k < 0 ? "-" : "+"} \\frac{${Math.abs(k)}}{n}} + 1}\\to ${frac(k, 2)}$.`,
      };
    },
  },
  {
    id: "t11-tf-ham-so-lien-tuc", subject: S, grade: G, chapter: C5, topic: "Hàm số liên tục", half: 2, level: 3, kind: "tf",
    make: (r) => {
      const x0 = r.pick([1, 2, -1, -2]), as = r.int(-4, 4), b = r.nz(-3, 4), c = x0 * x0 + as * x0 - b * x0;
      const R = b * x0 + c, aExpr = (s: number) => `${x0 * x0}${term(s * x0, "a")}`;
      const aw = (R - x0 * x0) !== as ? R - x0 * x0 : as + 1;
      const t = [r.chance(0.5), r.chance(0.5), r.chance(0.5), r.chance(0.5)];
      return {
        stem: `Cho hàm số $f(x) = \\begin{cases} x^2 + ax & \\text{khi } x\\le ${x0}\\\\ ${poly([b, c], "x")} & \\text{khi } x > ${x0}\\end{cases}$ với $a$ là tham số.`,
        ...tf([
          [`$f(${x0}) = ${aExpr(t[0] ? 1 : -1)}$.`, t[0]],
          [`$\\displaystyle\\lim_{x\\to ${x0}^+}f(x) = ${t[1] ? R : -b * x0 + c}$.`, t[1]],
          [`Hàm số liên tục tại $x = ${x0}$ khi và chỉ khi $a = ${t[2] ? as : aw}$.`, t[2]],
          [t[3] ? `Với $a = ${as}$, hàm số liên tục trên $\\mathbb{R}$.` : `Với $a = ${as}$, hàm số gián đoạn tại $x = ${x0}$.`, t[3]],
        ]),
        explanation: `$f(${x0}) = \\displaystyle\\lim_{x\\to ${x0}^-}f(x) = ${aExpr(1)}$; $\\displaystyle\\lim_{x\\to ${x0}^+}f(x) = ${b}\\cdot(${x0})${term(c)} = ${R}$. Liên tục tại $x = ${x0}$ $\\Leftrightarrow ${aExpr(1)} = ${R}\\Leftrightarrow a = ${as}$. Khi đó trên mỗi khoảng $(-\\infty;${x0})$, $(${x0};+\\infty)$ hàm số là đa thức nên liên tục, và liên tục tại $x = ${x0}$, do đó liên tục trên $\\mathbb{R}$.`,
      };
    },
  },

  /* =================================================================== HALF 2 – SHORT */
  {
    id: "t11-sh-gioi-han-can-thuc", subject: S, grade: G, chapter: C5, topic: "Giới hạn dạng ∞ − ∞ chứa căn", half: 2, level: 3, kind: "short",
    make: (r) => {
      const t = r.int(0, 3), k = r.nz(-9, 9), e = r.int(-5, 5);
      let L: number, e1: string, ex: string;
      if (t === 0) { L = k / 2; e1 = `\\sqrt{${poly([1, k, e], "n")}} - n`; ex = `\\dfrac{${poly([k, e], "n")}}{\\sqrt{${poly([1, k, e], "n")}} + n}\\to\\dfrac{${k}}{1 + 1}`; }
      else if (t === 1) { L = k / 4; e1 = `\\sqrt{${poly([4, k, 0], "n")}} - 2n`; ex = `\\dfrac{${k}n}{\\sqrt{${poly([4, k, 0], "n")}} + 2n}\\to\\dfrac{${k}}{2 + 2}`; }
      else if (t === 2) { L = k / 2; e1 = `n - \\sqrt{${poly([1, -k, 0], "n")}}`; ex = `\\dfrac{${k}n}{n + \\sqrt{${poly([1, -k, 0], "n")}}}\\to\\dfrac{${k}}{1 + 1}`; }
      else { const j = r.int(-6, 6); need(j !== k); L = (k - j) / 2; e1 = `\\sqrt{${poly([1, k, 0], "n")}} - \\sqrt{${poly([1, j, 0], "n")}}`; ex = `\\dfrac{${k - j}n}{\\sqrt{${poly([1, k, 0], "n")}} + \\sqrt{${poly([1, j, 0], "n")}}}\\to\\dfrac{${k - j}}{1 + 1}`; }
      return {
        stem: `Tính $\\lim\\left(${e1}\\right)$${Number.isInteger(L) ? "" : " (viết kết quả dưới dạng số thập phân)"}.`,
        ...short(L, 2),
        explanation: `Nhân và chia với biểu thức liên hợp: $${e1} = ${ex} = ${tex(L)}$ (chia cả tử và mẫu cho $n$).`,
      };
    },
  },
  {
    id: "t11-sh-qua-bong-nay", subject: S, grade: G, chapter: C5, topic: "Ứng dụng tổng cấp số nhân lùi vô hạn", half: 2, level: 3, kind: "short",
    make: (r) => {
      const h = r.int(2, 20), [p, s] = r.pick([[1, 2], [2, 3], [3, 4], [3, 5], [4, 5], [1, 3], [2, 5]]), v = r.chance(0.6);
      const D = v ? (h * (s + p)) / (s - p) : (h * p) / (s - p), q = frac(p, s);
      return {
        stem: `Một quả bóng được thả rơi từ độ cao $${h}$ m xuống mặt đất. Mỗi lần chạm đất, quả bóng nảy lên đến độ cao bằng $${q}$ độ cao lần rơi ngay trước đó. Giả sử quả bóng chuyển động mãi theo quy luật trên, ${v ? "tính tổng quãng đường mà quả bóng di chuyển, gồm cả các lần rơi và nảy lên" : "tính tổng độ cao của tất cả các lần quả bóng nảy lên"}, theo đơn vị mét${Number.isInteger(D) ? "" : " (làm tròn kết quả đến hàng phần mười)"}.`,
        ...short(D, 1),
        explanation: `Độ cao các lần nảy lên lập thành cấp số nhân lùi vô hạn: $u_1 = ${h}\\cdot ${q}$, công bội $${q}$; tổng các độ cao nảy lên là $\\dfrac{${h}\\cdot ${q}}{1 - ${q}} = ${frac(h * p, s - p)}$. ${v ? `Quãng đường rơi bằng $${h}$ cộng tổng độ cao nảy lên, quãng đường nảy lên bằng tổng độ cao nảy lên, nên tổng quãng đường là $${h} + 2\\cdot ${frac(h * p, s - p)} = ${frac(h * (s + p), s - p)}${Number.isInteger(D) ? "" : `\\approx ${tex(D, 1)}`}$ m.` : `Đáp số $${Number.isInteger(D) ? D : `\\approx ${tex(D, 1)}`}$ m.`}`,
      };
    },
  },
  {
    id: "t11-sh-ghep-nhom-dac-trung", subject: S, grade: G, chapter: C3, topic: "Tính mốt, trung vị, tứ phân vị của mẫu ghép nhóm", half: 2, level: 3, kind: "short",
    make: (r) => {
      const d = gdata(r), key = r.pick(["mo", "me", "q1", "q3"]);
      if (key === "mo") {
        const M = gMode(d);
        return {
          stem: `${d.intro} ${d.table} Tìm mốt của mẫu số liệu ghép nhóm trên (làm tròn kết quả đến hàng phần mười).`,
          ...short(M.v, 1),
          explanation: `Nhóm chứa mốt $${d.grp(M.m)}$: $M_o = ${d.lo(M.m)} + \\dfrac{${M.fm} - ${M.fp}}{(${M.fm} - ${M.fp}) + (${M.fm} - ${M.fn})}\\cdot ${d.h}\\approx ${tex(M.v, 1)}$.`,
        };
      }
      const qn = QN[key], Q = gQuant(d, qn.p);
      return {
        stem: `${d.intro} ${d.table} Tìm ${qn.name} $${qn.t}$ của mẫu số liệu ghép nhóm trên (làm tròn kết quả đến hàng phần mười).`,
        ...short(Q.v, 1),
        explanation: `$n = ${d.n}$, $${qn.ft} = ${tex(Q.pos)}$. ${cumText(d)} Nhóm chứa $${qn.t}$ là $${d.grp(Q.m)}$. $${qn.t} = ${d.lo(Q.m)} + \\dfrac{${tex(Q.pos)} - ${Q.C}}{${d.f[Q.m]}}\\cdot ${d.h}\\approx ${tex(Q.v, 1)}$.`,
      };
    },
  },
  {
    id: "t11-sh-gioi-han-tim-tham-so", subject: S, grade: G, chapter: C5, topic: "Tìm tham số từ giới hạn dạng 0/0", half: 2, level: 3, kind: "short",
    make: (r) => {
      const x0 = r.nz(-3, 3), L = r.nz(-6, 8), a = L - 2 * x0, b = -x0 * x0 - a * x0, ask = r.pick(["a+b", "a-b", "ab", "2a+b"]);
      const v = ask === "a+b" ? a + b : ask === "a-b" ? a - b : ask === "ab" ? a * b : 2 * a + b;
      return {
        stem: `Biết $\\displaystyle\\lim_{x\\to ${x0}}\\dfrac{x^2 + ax + b}{${poly([1, -x0], "x")}} = ${L}$ với $a$, $b$ là các số thực. Tính $${ask === "ab" ? "a\\cdot b" : ask}$.`,
        ...short(v),
        explanation: `Mẫu dần tới $0$ nên tử phải có nghiệm $x = ${x0}$: $${x0 * x0}${term(x0, "a")} + b = 0$. Khi đó $x^2 + ax + b = (${poly([1, -x0], "x")})(x${term(x0)} + a)$ nên giới hạn bằng $${2 * x0} + a = ${L}$, suy ra $a = ${a}$, $b = ${b}$. Vậy $${ask === "ab" ? "a\\cdot b" : ask} = ${v}$.`,
      };
    },
  },
  {
    id: "t11-sh-thiet-dien-song-song", subject: S, grade: G, chapter: C4, topic: "Thiết diện song song với đáy", half: 2, level: 3, kind: "short",
    make: (r) => {
      const [p, q] = r.pick([[1, 1], [1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [3, 2], [3, 4]]), k = p / (p + q);
      const ctx = r.pick([
        { s: "Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình bình hành", base: "đáy $ABCD$", pt: "$M$ là điểm trên cạnh $SA$ sao cho", rel: `SM = ${coef(p) || ""}${frac(p, q) === String(p / q) ? "" : ""}`, A: "S", B: "A", pl: "(ABCD)", fig: "hình bình hành" },
        { s: "Cho hình chóp $S.ABC$", base: "đáy $ABC$", pt: "$M$ là điểm trên cạnh $SB$ sao cho", rel: "", A: "S", B: "B", pl: "(ABC)", fig: "tam giác" },
        { s: "Cho tứ diện $ABCD$", base: "tam giác $BCD$", pt: "$M$ là điểm trên cạnh $AB$ sao cho", rel: "", A: "A", B: "B", pl: "(BCD)", fig: "tam giác" },
      ]);
      const area = r.chance(0.6), X = area ? r.pick([18, 24, 27, 30, 36, 40, 45, 48, 50, 60, 72, 80]) : r.int(12, 40);
      const ratio = p === 1 && q === 1 ? `${ctx.A}M = M${ctx.B}` : q === 1 ? `${ctx.A}M = ${p}M${ctx.B}` : p === 1 ? `${q}${ctx.A}M = M${ctx.B}` : `${q}${ctx.A}M = ${p}M${ctx.B}`;
      const ans = area ? X * k * k : X * k;
      return {
        stem: `${ctx.s} với ${area ? `diện tích ${ctx.base} bằng $${X}\\ \\text{cm}^2$` : `chu vi ${ctx.base} bằng $${X}$ cm`}. Gọi ${ctx.pt} $${ratio}$. Mặt phẳng qua $M$ và song song với mặt phẳng $${ctx.pl}$ cắt hình chóp theo một thiết diện. Tính ${area ? "diện tích (đơn vị: cm², " : "chu vi (đơn vị: cm, "}làm tròn kết quả đến hàng phần mười) của thiết diện đó.`,
        ...short(ans, 1),
        explanation: `$\\dfrac{${ctx.A}M}{${ctx.A}${ctx.B}} = ${frac(p, p + q)}$. Thiết diện là ${ctx.fig} có các cạnh song song với các cạnh tương ứng của ${ctx.base} và bằng $${frac(p, p + q)}$ lần (định lí Thalès), nên ${area ? `diện tích bằng $\\left(${frac(p, p + q)}\\right)^2\\cdot ${X} ${Number.isInteger(round(ans * 10, 6)) ? "=" : "\\approx"} ${tex(ans, 1)}$` : `chu vi bằng $${frac(p, p + q)}\\cdot ${X} ${Number.isInteger(round(ans * 10, 6)) ? "=" : "\\approx"} ${tex(ans, 1)}$`}.`,
      };
    },
  },
  {
    id: "t11-sh-so-thap-phan-tuan-hoan", subject: S, grade: G, chapter: C5, topic: "Số thập phân vô hạn tuần hoàn và cấp số nhân lùi vô hạn", half: 2, level: 3, kind: "short",
    make: (r) => {
      const t = r.int(0, 2);
      let x: string, pn: number, pd: number, ex: string;
      if (t === 0) { const D = r.int(1, 98); need(D % 11 !== 0); const ds = String(D).padStart(2, "0"); x = `0{,}(${ds})`; pn = D; pd = 99; ex = `${x} = \\dfrac{${D}}{100} + \\dfrac{${D}}{100^2} + \\cdots = \\dfrac{\\frac{${D}}{100}}{1 - \\frac{1}{100}} = \\dfrac{${D}}{99}`; }
      else if (t === 1) { const a = r.int(1, 5), b = r.int(1, 8); x = `${a}{,}(${b})`; pn = 9 * a + b; pd = 9; ex = `${x} = ${a} + \\dfrac{${b}}{10} + \\dfrac{${b}}{10^2} + \\cdots = ${a} + \\dfrac{\\frac{${b}}{10}}{1 - \\frac{1}{10}} = ${a} + \\dfrac{${b}}{9}`; }
      else { const a = r.int(1, 9), b = r.int(1, 9); need(a !== b); x = `0{,}${a}(${b})`; pn = 9 * a + b; pd = 90; ex = `${x} = \\dfrac{${a}}{10} + \\dfrac{${b}}{100} + \\dfrac{${b}}{1000} + \\cdots = \\dfrac{${a}}{10} + \\dfrac{\\frac{${b}}{100}}{1 - \\frac{1}{10}} = \\dfrac{${a}}{10} + \\dfrac{${b}}{90}`; }
      const g = gcd(pn, pd), A = pn / g, B = pd / g, ask = r.pick(["a+b", "b-a", "a+b"]);
      need(B !== 1);
      const v = ask === "a+b" ? A + B : B - A;
      need(ask === "a+b" || v > 0);
      return {
        stem: `Số thập phân vô hạn tuần hoàn $${x}$ được viết dưới dạng phân số tối giản $\\dfrac{a}{b}$ với $a$, $b$ là các số nguyên dương. Tính $${ask === "a+b" ? "a + b" : "b - a"}$.`,
        ...short(v),
        explanation: `$${ex}${frac(pn, pd) === `\\dfrac{${pn}}{${pd}}` ? "" : ` = ${frac(pn, pd)}`}$. Do đó $a = ${A}$, $b = ${B}$ và $${ask === "a+b" ? "a + b" : "b - a"} = ${v}$.`,
      };
    },
  },
];
