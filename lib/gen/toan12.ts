/* Toán 12 – Học kì 1 (Kết nối tri thức).
   half 1: Ch.I Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số.
   half 2: Ch.II Vectơ và hệ trục tọa độ trong không gian; Ch.III Số đặc trưng đo mức độ phân tán của mẫu số liệu ghép nhóm. */
import { mcq, tf, short, frac, tex, vn, need, poly, term, coef, sqrtTex, round, type Template, type Rng } from "./core.ts";

const S = "Toán", G = 12 as const;
const C1 = "Chương I. Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số";
const C2 = "Chương II. Vectơ và hệ trục tọa độ trong không gian";
const C3 = "Chương III. Các số đặc trưng đo mức độ phân tán của mẫu số liệu ghép nhóm";

/* ---------------- tiện ích chung ---------------- */
const NI = "-\\infty", PI = "+\\infty";
const iv = (a: number | string, b: number | string) => `$(${a};${b})$`;
const ev = (cs: number[], x: number) => cs.reduce((s, c) => s * x + c, 0);
const der = (cs: number[]) => cs.slice(0, -1).map((c, i) => c * (cs.length - 1 - i));
/** (x - p) ; x nếu p = 0 */
const fx = (p: number) => (p === 0 ? "x" : `(x${term(-p)})`);
/** cx + d, viết "1 - x" khi c < 0 < d */
const lin = (c: number, d: number, v = "x") => (c < 0 && d > 0 ? `${d}${term(c, v)}` : poly([c, d], v));
/** y = a x^3 + b x^2 + c x + d có y' = 3a(x - p)(x - q) */
function cubic(a: number, p: number, q: number, d: number) {
  const b = (-3 * a * (p + q)) / 2; need(Number.isInteger(b));
  return [a, b, 3 * a * p * q, d];
}
const P3 = (v: number[]) => `(${v.join(";")})`;
const P3f = (v: number[], den: number) => `\\left(${v.map((x) => frac(x, den)).join(";")}\\right)`;
const add3 = (u: number[], v: number[]) => u.map((x, i) => x + v[i]);
const sub3 = (u: number[], v: number[]) => u.map((x, i) => x - v[i]);
const mul3 = (k: number, u: number[]) => u.map((x) => k * x);
const dot3 = (u: number[], v: number[]) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
const eq3 = (u: number[], v: number[]) => u.every((x, i) => x === v[i]);
const n2 = (u: number[]) => dot3(u, u);
const vec3 = (r: Rng, a = -4, b = 4) => [r.int(a, b), r.int(a, b), r.int(a, b)];
/** số trong tích: bọc ngoặc nếu âm */
const nm = (x: number) => (x < 0 ? `(${x})` : `${x}`);
const dotExpl = (u: number[], v: number[]) => u.map((x, i) => `${nm(x)}\\cdot ${nm(v[i])}`).join(" + ");
const tick = (b: boolean) => (b ? "Đúng" : "Sai");
const ABC = ["a", "b", "c", "d"];
function sortedDistinct(r: Rng, n: number, a: number, b: number): number[] {
  const all: number[] = []; for (let x = a; x <= b; x++) all.push(x);
  return r.shuffle(all).slice(0, n).sort((x, y) => x - y);
}
const fmtInf = (v: number) => (v === Infinity ? PI : v === -Infinity ? NI : String(v));

/** Bảng biến thiên: xs các điểm tới hạn, V = [giá trị tại -∞, f(x1), …, giá trị tại +∞] */
function bbt(xs: number[], V: number[], name = "f"): string {
  const X = [NI, ...xs.map(String), PI];
  const rx: string[] = [], rd: string[] = [], rf: string[] = [];
  for (let i = 0; i < X.length; i++) {
    rx.push(X[i]); rd.push(i === 0 || i === X.length - 1 ? "" : "0"); rf.push(fmtInf(V[i]));
    if (i < X.length - 1) { rx.push(""); const up = V[i + 1] > V[i]; rd.push(up ? "+" : "-"); rf.push(up ? "\\nearrow" : "\\searrow"); }
  }
  return `$\\begin{array}{|c|${"c".repeat(rx.length)}|}\\hline x & ${rx.join(" & ")} \\\\ \\hline ${name}'(x) & ${rd.join(" & ")} \\\\ \\hline ${name}(x) & ${rf.join(" & ")} \\\\ \\hline\\end{array}$`;
}
/** Số nghiệm f(x) = m từ dãy giá trị tại các nút (hàm đơn điệu ngặt giữa hai nút liên tiếp) */
function rootsBBT(xs: number[], V: number[], m: number): { cnt: number; why: string[] } {
  let cnt = 0; const why: string[] = []; const X = [NI, ...xs.map(String), PI];
  for (let i = 1; i < V.length - 1; i++) if (V[i] === m) { cnt++; why.push(`nghiệm $x = ${xs[i - 1]}$`); }
  for (let i = 0; i < V.length - 1; i++) {
    const lo = Math.min(V[i], V[i + 1]), hi = Math.max(V[i], V[i + 1]);
    if (m > lo && m < hi) { cnt++; why.push(`một nghiệm thuộc $(${X[i]};${X[i + 1]})$`); }
  }
  return { cnt, why };
}

/* =============================== HALF 1 =============================== */
const H1: Template[] = [
  {
    id: "t12-don-dieu-ham-da-thuc", subject: S, grade: G, chapter: C1, topic: "Tính đơn điệu của hàm số đa thức",
    half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const ask = r.pick(["đồng biến", "nghịch biến"]); const inc = ask === "đồng biến";
      if (r.chance(0.6)) {
        const a = r.pick([1, -1, 2, -2]), p = r.int(-3, 2), q = p + r.int(1, 4), d = r.int(-5, 5);
        need((a * (p + q)) % 2 === 0);
        const cs = cubic(a, p, q, d), ds = der(cs);
        const A = iv(NI, p), M = iv(p, q), B = iv(q, PI);
        const midInc = a < 0;
        let right: string, wrong: string[];
        if (midInc === inc) { right = M; wrong = r.shuffle([A, B, iv(p, PI), iv(NI, q)]); }
        else { right = r.pick([A, B]); wrong = r.shuffle([M, iv(p, PI), iv(NI, q)]).concat(["$\\mathbb{R}$"]); }
        const pos = a > 0 ? `$(${NI};${p})$ và $(${q};${PI})$` : `$(${p};${q})$`;
        const neg = a > 0 ? `$(${p};${q})$` : `$(${NI};${p})$ và $(${q};${PI})$`;
        return {
          stem: `Hàm số $y = ${poly(cs)}$ ${ask} trên khoảng nào dưới đây?`,
          ...mcq(r, right, wrong),
          explanation: `$y' = ${poly(ds)} = ${3 * a}${fx(p)}${fx(q)}$; $y' = 0 \\Leftrightarrow x = ${p}$ hoặc $x = ${q}$. Lập bảng xét dấu: $y' > 0$ trên ${pos}; $y' < 0$ trên ${neg}. Vậy hàm số đồng biến trên ${pos}, nghịch biến trên ${neg}. Đáp án: ${right}.`,
        };
      }
      const a = r.pick([1, -1]), b = r.int(1, 3), d = r.int(-4, 5);
      const cs = [a, 0, -2 * a * b * b, 0, d];
      const I = [iv(NI, -b), iv(-b, 0), iv(0, b), iv(b, PI)];
      const incSet = a > 0 ? [I[1], I[3]] : [I[0], I[2]], decSet = a > 0 ? [I[0], I[2]] : [I[1], I[3]];
      const right = r.pick(inc ? incSet : decSet);
      const wrong = r.shuffle([...(inc ? decSet : incSet), iv(-b, b)]);
      return {
        stem: `Hàm số $y = ${poly(cs)}$ ${ask} trên khoảng nào dưới đây?`,
        ...mcq(r, right, wrong),
        explanation: `$y' = ${poly(der(cs))} = ${4 * a}x(x - ${b})(x + ${b})$; $y' = 0 \\Leftrightarrow x = 0$ hoặc $x = \\pm ${b}$. Xét dấu $y'$: hàm số đồng biến trên ${incSet.join(" và ")}, nghịch biến trên ${decSet.join(" và ")}. Đáp án: ${right}.`,
      };
    },
  },
  {
    id: "t12-don-dieu-bang-xet-dau", subject: S, grade: G, chapter: C1, topic: "Đơn điệu từ bảng xét dấu đạo hàm",
    half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const xs = sortedDistinct(r, 3, -4, 5);
      const s = [0, 1, 2, 3].map(() => (r.chance(0.5) ? 1 : -1));
      need(s.some((x) => x > 0) && s.some((x) => x < 0));
      const ask = r.pick(["đồng biến", "nghịch biến"]), want = ask === "đồng biến" ? 1 : -1;
      const E = [NI, ...xs.map(String), PI];
      const good: string[] = [], bad: string[] = [];
      for (let i = 0; i < 4; i++) for (let j = i + 1; j <= 4; j++) {
        const seg = s.slice(i, j);
        if (j === i + 1) (seg[0] === want ? good : bad).push(iv(E[i], E[j]));
        else if (seg.some((x) => x !== want)) bad.push(iv(E[i], E[j]));
      }
      need(good.length > 0);
      const right = r.pick(good);
      const sg = (x: number) => (x > 0 ? "+" : "-");
      const table = `$\\begin{array}{|c|ccccccccc|}\\hline x & -\\infty & & ${xs[0]} & & ${xs[1]} & & ${xs[2]} & & +\\infty \\\\ \\hline f'(x) & & ${sg(s[0])} & 0 & ${sg(s[1])} & 0 & ${sg(s[2])} & 0 & ${sg(s[3])} & \\\\ \\hline\\end{array}$`;
      const listOf = (w: number) => [0, 1, 2, 3].filter((i) => s[i] === w).map((i) => iv(E[i], E[i + 1])).join(", ") || "không khoảng nào";
      return {
        stem: `Cho hàm số $y = f(x)$ có bảng xét dấu đạo hàm như sau:\n${table}\nHàm số đã cho ${ask} trên khoảng nào dưới đây?`,
        ...mcq(r, right, r.shuffle(bad)),
        explanation: `Từ bảng xét dấu: $f'(x) > 0$ trên ${listOf(1)} nên hàm số đồng biến trên các khoảng đó; $f'(x) < 0$ trên ${listOf(-1)} nên hàm số nghịch biến trên các khoảng đó. Các khoảng chứa cả phần $f'$ mang dấu khác đều bị loại. Đáp án: ${right}.`,
      };
    },
  },
  {
    id: "t12-cuc-tri-gia-tri", subject: S, grade: G, chapter: C1, topic: "Điểm cực trị, giá trị cực trị của hàm bậc ba",
    half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const a = r.pick([1, -1, 2, -2]), p = r.int(-3, 2), q = p + r.int(1, 3), d = r.int(-5, 5);
      const cs = cubic(a, p, q, d);
      const xCD = a > 0 ? p : q, xCT = a > 0 ? q : p, yCD = ev(cs, xCD), yCT = ev(cs, xCT);
      need(new Set([xCD, xCT, yCD, yCT]).size === 4 && Math.abs(yCD) < 100 && Math.abs(yCT) < 100);
      const k = r.int(0, 3);
      const asks = [
        [`Giá trị cực đại của hàm số $y = ${poly(cs)}$ bằng`, yCD],
        [`Giá trị cực tiểu của hàm số $y = ${poly(cs)}$ bằng`, yCT],
        [r.pick([`Điểm cực đại của hàm số $y = ${poly(cs)}$ là`, `Hàm số $y = ${poly(cs)}$ đạt cực đại tại điểm`]), xCD],
        [r.pick([`Điểm cực tiểu của hàm số $y = ${poly(cs)}$ là`, `Hàm số $y = ${poly(cs)}$ đạt cực tiểu tại điểm`]), xCT],
      ] as const;
      const vals = [yCD, yCT, xCD, xCT];
      const fmt = (i: number, v: number) => (i >= 2 ? `$x = ${v}$` : `$${v}$`);
      const right = fmt(k, vals[k]);
      const wrong = [0, 1, 2, 3].filter((i) => i !== k).map((i) => fmt(k, vals[i]));
      return {
        stem: asks[k][0], ...mcq(r, right, wrong),
        explanation: `$y' = ${poly(der(cs))} = ${3 * a}${fx(p)}${fx(q)}$, $y' = 0 \\Leftrightarrow x = ${p}$ hoặc $x = ${q}$. Vì hệ số của $x^3$ ${a > 0 ? "dương" : "âm"} nên $y'$ đổi dấu từ $+$ sang $-$ qua $x = ${xCD}$ và từ $-$ sang $+$ qua $x = ${xCT}$. Hàm số đạt cực đại tại $x = ${xCD}$, $y_{\\text{CĐ}} = y(${xCD}) = ${yCD}$; đạt cực tiểu tại $x = ${xCT}$, $y_{\\text{CT}} = y(${xCT}) = ${yCT}$.`,
      };
    },
  },
  {
    id: "t12-cuc-tri-dem-tu-dao-ham", subject: S, grade: G, chapter: C1, topic: "Số điểm cực trị khi biết f'(x)",
    half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const n = r.int(2, 4); const roots = sortedDistinct(r, n, -3, 3);
      const ms = roots.map(() => r.pick([1, 1, 2, 3, 2]));
      need(ms.some((m) => m % 2 === 1));
      const neg = r.chance(0.3), extra = r.chance(0.3) ? r.int(1, 4) : 0;
      const fac = roots.map((x, i) => (ms[i] === 1 ? fx(x) : `${fx(x)}^{${ms[i]}}`));
      const expr = (neg ? "-" : "") + fac.join("") + (extra ? `(x^2 + ${extra})` : "");
      const sgn = (x: number) => (neg ? -1 : 1) * roots.reduce((s, t, i) => s * Math.pow(x - t, ms[i]), 1);
      let cd = 0, ct = 0; const why: string[] = [];
      roots.forEach((t, i) => {
        const L = Math.sign(sgn(t - 0.5)), R = Math.sign(sgn(t + 0.5));
        if (L > 0 && R < 0) { cd++; why.push(`qua $x = ${t}$: $f'$ đổi dấu từ $+$ sang $-$ (cực đại)`); }
        else if (L < 0 && R > 0) { ct++; why.push(`qua $x = ${t}$: $f'$ đổi dấu từ $-$ sang $+$ (cực tiểu)`); }
        else why.push(`qua $x = ${t}$ (nghiệm bội chẵn): $f'$ không đổi dấu`);
      });
      const k = r.int(0, 2);
      const name = ["điểm cực trị", "điểm cực đại", "điểm cực tiểu"][k];
      const ans = [cd + ct, cd, ct][k];
      const wrong = [n, [cd + ct, cd, ct][(k + 1) % 3], ans + 1, ans - 1, ans + 2].filter((x) => x >= 0).map((x) => `$${x}$`);
      return {
        stem: `Cho hàm số $y = f(x)$ có đạo hàm $f'(x) = ${expr}$ với mọi $x \\in \\mathbb{R}$. Số ${name} của hàm số đã cho là`,
        ...mcq(r, `$${ans}$`, wrong),
        explanation: `$f'(x) = 0 \\Leftrightarrow x \\in \\{${roots.join(";\\,")}\\}$${extra ? ` (vì $x^2 + ${extra} > 0$)` : ""}. Xét dấu $f'(x)$: ${why.join("; ")}. Vậy hàm số có ${cd} điểm cực đại và ${ct} điểm cực tiểu, nên số ${name} là ${ans}.`,
      };
    },
  },
  {
    id: "t12-gtln-gtnn-tren-doan", subject: S, grade: G, chapter: C1, topic: "GTLN – GTNN của hàm bậc ba trên đoạn",
    half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const a = r.pick([1, -1]), p = r.int(-3, 1), q = p + r.pick([2, 4]), d = r.int(-5, 5);
      const cs = cubic(a, p, q, d);
      const sc = r.int(0, 2);
      let al: number, be: number;
      if (sc === 0) { al = r.int(p - 2, p); be = r.int(q, q + 2); }
      else if (sc === 1) { al = r.int(p + 1, q - 1); be = r.int(q, q + 2); }
      else { al = r.int(p - 2, p); be = r.int(p + 1, q - 1); }
      const f = (x: number) => ev(cs, x);
      const inside = [p, q].filter((x) => x > al && x < be), outside = [p, q].filter((x) => x < al || x > be);
      const cand = [al, ...inside, be]; const vals = cand.map(f);
      need([p, q, al, be].every((x) => Math.abs(f(x)) < 100));
      const isMax = r.chance(0.5);
      const ans = isMax ? Math.max(...vals) : Math.min(...vals), other = isMax ? Math.min(...vals) : Math.max(...vals);
      const wrong = [...outside.map(f), other, ...vals, -ans, ans + 1].filter((v) => v !== ans).map((v) => `$${v}$`);
      return {
        stem: `Giá trị ${isMax ? "lớn nhất" : "nhỏ nhất"} của hàm số $f(x) = ${poly(cs)}$ trên đoạn $[${al};${be}]$ bằng`,
        ...mcq(r, `$${ans}$`, wrong),
        explanation: `$f'(x) = ${poly(der(cs))}$, $f'(x) = 0 \\Leftrightarrow x = ${p}$ hoặc $x = ${q}$${outside.length ? ` ($x = ${outside.join("$, $x = ")}$ không thuộc đoạn $[${al};${be}]$, loại)` : ""}. Ta có ${cand.map((x) => `$f(${x}) = ${f(x)}$`).join(", ")}. Vậy $\\${isMax ? "max" : "min"}\\limits_{[${al};${be}]} f(x) = ${ans}$.`,
      };
    },
  },
  {
    id: "t12-tiem-can-dung-ngang", subject: S, grade: G, chapter: C1, topic: "Tiệm cận đứng, tiệm cận ngang của hàm phân thức",
    half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const c = r.pick([1, 2, -1, 3]), d = r.nz(-5, 5), a = r.nz(-4, 4), b = r.int(-5, 5);
      need(a * d - b * c !== 0);
      const fn = `y = \\dfrac{${lin(a, b)}}{${lin(c, d)}}`;
      const vert = r.chance(0.5);
      const right = vert ? `$x = ${frac(-d, c)}$` : `$y = ${frac(a, c)}$`;
      const wrong = vert
        ? [`$x = ${frac(d, c)}$`, `$y = ${frac(a, c)}$`, `$x = ${frac(-b, a)}$`, `$y = ${frac(-d, c)}$`]
        : [`$x = ${frac(-d, c)}$`, `$y = ${frac(-a, c)}$`, `$y = ${frac(c, a)}$`, b ? `$y = ${frac(b, d)}$` : `$y = ${frac(a, d)}$`];
      return {
        stem: `Tiệm cận ${vert ? "đứng" : "ngang"} của đồ thị hàm số $${fn}$ là đường thẳng`,
        ...mcq(r, right, wrong),
        explanation: vert
          ? `Mẫu bằng $0$ khi $x = ${frac(-d, c)}$ và tử khác $0$ tại đó, nên giới hạn một bên của $y$ khi $x \\to ${frac(-d, c)}$ là vô cực. Tiệm cận đứng là $x = ${frac(-d, c)}$.`
          : `$\\lim\\limits_{x \\to \\pm\\infty} y = \\dfrac{${a}}{${c}} = ${frac(a, c)}$ (tỉ số hệ số của $x$ ở tử và mẫu). Tiệm cận ngang là $y = ${frac(a, c)}$.`,
      };
    },
  },
  {
    id: "t12-tiem-can-xien", subject: S, grade: G, chapter: C1, topic: "Tiệm cận xiên của hàm phân thức bậc hai trên bậc nhất",
    half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const a = r.pick([1, 1, 2, -1]), m = r.nz(-3, 3), b = r.int(-4, 4), c = r.int(-5, 5);
      const R = a * m * m + b * m + c; need(R !== 0);
      const k = b + a * m;
      const right = `$y = ${poly([a, k])}$`;
      const wrong = [`$y = ${poly([a, b])}$`, `$y = ${poly([a, -k])}$`, `$y = ${poly([a, b - a * m])}$`, `$x = ${m}$`, `$y = ${poly([a, k + 1])}$`];
      return {
        stem: `Tiệm cận xiên của đồ thị hàm số $y = \\dfrac{${poly([a, b, c])}}{${poly([1, -m])}}$ là đường thẳng`,
        ...mcq(r, right, wrong),
        explanation: `Chia đa thức: $y = ${poly([a, k])} ${R < 0 ? "-" : "+"} \\dfrac{${Math.abs(R)}}{${poly([1, -m])}}$. Vì $\\lim\\limits_{x \\to \\pm\\infty} \\left[y - (${poly([a, k])})\\right] = 0$ nên tiệm cận xiên là $y = ${poly([a, k])}$.`,
      };
    },
  },
  {
    id: "t12-don-dieu-tham-so-bac-ba", subject: S, grade: G, chapter: C1, topic: "Tham số để hàm bậc ba đơn điệu trên ℝ",
    half: 1, level: 3, kind: "mcq",
    make: (r) => {
      const form = r.int(0, 3), b = r.nz(-3, 3), d = r.int(-5, 5);
      let fn: string, yp: string, T: number, W: number, ge: boolean, why: string;
      if (form === 0) { fn = `x^3${term(3 * b, "x^2")} + mx${term(d)}`; yp = `3x^2${term(6 * b, "x")} + m`; T = 3 * b * b; W = 9 * b * b; ge = true; why = `\\Delta' = ${9 * b * b} - 3m \\le 0`; }
      else if (form === 1) { fn = `-x^3${term(3 * b, "x^2")} + mx${term(d)}`; yp = `-3x^2${term(6 * b, "x")} + m`; T = -3 * b * b; W = -9 * b * b; ge = false; why = `\\Delta' = ${9 * b * b} + 3m \\le 0`; }
      else if (form === 2) { fn = `\\dfrac{1}{3}x^3${term(b, "x^2")} + mx${term(d)}`; yp = `x^2${term(2 * b, "x")} + m`; T = b * b; W = 4 * b * b; ge = true; why = `\\Delta' = ${b * b} - m \\le 0`; }
      else { fn = `-\\dfrac{1}{3}x^3${term(b, "x^2")} + mx${term(d)}`; yp = `-x^2${term(2 * b, "x")} + m`; T = -b * b; W = -4 * b * b; ge = false; why = `\\Delta' = ${b * b} + m \\le 0`; }
      const ask = ge ? "đồng biến" : "nghịch biến";
      const rel = (op: string, v: number) => `$m ${op} ${v}$`;
      const right = rel(ge ? "\\ge" : "\\le", T);
      const wrong = [rel(ge ? ">" : "<", T), rel(ge ? "\\le" : "\\ge", T), rel(ge ? "\\ge" : "\\le", W), rel(ge ? "\\ge" : "\\le", -T)];
      return {
        stem: `Tìm tất cả các giá trị của tham số $m$ để hàm số $y = ${fn}$ ${ask} trên $\\mathbb{R}$.`,
        ...mcq(r, right, wrong),
        explanation: `$y' = ${yp}$. Hàm số ${ask} trên $\\mathbb{R}$ $\\Leftrightarrow y' ${ge ? "\\ge" : "\\le"} 0$ với mọi $x$ (dấu bằng chỉ tại hữu hạn điểm) $\\Leftrightarrow ${why} \\Leftrightarrow m ${ge ? "\\ge" : "\\le"} ${T}$.`,
      };
    },
  },
  {
    id: "t12-nhan-dien-ham-tu-tiem-can", subject: S, grade: G, chapter: C1, topic: "Nhận diện hàm phân thức từ hai tiệm cận",
    half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const p = r.nz(-4, 4), q = r.nz(-3, 3), s = r.nz(-5, 5);
      need(p !== q && s !== q && s !== -p * q && s !== p * q && s * p + q !== 0);
      const F = (n1: number, n0: number, d0: number) => `$y = \\dfrac{${lin(n1, n0)}}{${lin(1, d0)}}$`;
      const right = F(q, s, -p);
      const wrong = [F(q, s, p), F(p, s, -q), F(s, q, -p)];
      return {
        stem: `Đồ thị của hàm số nào dưới đây có tiệm cận đứng là đường thẳng $x = ${p}$ và tiệm cận ngang là đường thẳng $y = ${q}$?`,
        ...mcq(r, right, wrong),
        explanation: `Hàm số $y = \\dfrac{ax + b}{x - x_0}$ (với $ax_0 + b \\ne 0$) có tiệm cận đứng $x = x_0$ và tiệm cận ngang $y = a$. ${right} có tiệm cận đứng $x = ${p}$, tiệm cận ngang $y = ${q}$. Các phương án còn lại lần lượt có tiệm cận $x = ${-p}, y = ${q}$; $x = ${q}, y = ${p}$; $x = ${p}, y = ${s}$.`,
      };
    },
  },
  {
    id: "t12-tam-doi-xung-phan-thuc", subject: S, grade: G, chapter: C1, topic: "Tâm đối xứng của đồ thị hàm phân thức bậc nhất",
    half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const c = r.pick([1, 1, 2, -1]), d = r.nz(-5, 5), a = r.nz(-4, 4), b = r.int(-5, 5);
      need(a * d - b * c !== 0);
      const I = (x: string, y: string) => `$I\\left(${x};${y}\\right)$`;
      const right = I(frac(-d, c), frac(a, c));
      const wrong = [I(frac(d, c), frac(a, c)), I(frac(a, c), frac(-d, c)), I(frac(-d, c), frac(-a, c)), I(frac(-d, c), b ? frac(b, d) : frac(c, a))];
      return {
        stem: r.pick([
          `Tâm đối xứng của đồ thị hàm số $y = \\dfrac{${lin(a, b)}}{${lin(c, d)}}$ là điểm`,
          `Giao điểm của hai đường tiệm cận của đồ thị hàm số $y = \\dfrac{${lin(a, b)}}{${lin(c, d)}}$ là điểm`,
        ]),
        ...mcq(r, right, wrong),
        explanation: `Đồ thị có tiệm cận đứng $x = ${frac(-d, c)}$ và tiệm cận ngang $y = ${frac(a, c)}$. Giao điểm hai tiệm cận ${right} là tâm đối xứng của đồ thị.`,
      };
    },
  },
  {
    id: "t12-bbt-so-nghiem", subject: S, grade: G, chapter: C1, topic: "Số nghiệm phương trình từ bảng biến thiên",
    half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const sh = r.int(0, 3);
      let xs: number[], V: number[];
      if (sh < 2) {
        xs = sortedDistinct(r, 2, -3, 3);
        const lo = r.int(-5, 2), hi = lo + r.int(2, 6);
        V = sh === 0 ? [-Infinity, hi, lo, Infinity] : [Infinity, lo, hi, -Infinity];
      } else {
        xs = sortedDistinct(r, 3, -3, 3);
        const y1 = r.int(-5, 2), y2 = r.chance(0.5) ? y1 : r.int(-5, 2);
        if (sh === 2) { const y0 = Math.max(y1, y2) + r.int(2, 5); V = [Infinity, y1, y0, y2, Infinity]; }
        else { const y0 = Math.min(y1, y2) - r.int(2, 5); V = [-Infinity, y1, y0, y2, -Infinity]; }
      }
      const fin = V.filter((v) => Number.isFinite(v));
      const m = r.pick([...fin, ...fin.map((v) => v + 1), ...fin.map((v) => v - 1)]);
      const k = r.pick([1, 1, 2, 3]), c = -k * m;
      const eqs = k === 1 && r.chance(0.5) ? `f(x) = ${m}` : `${coef(k)}f(x)${term(c)} = 0`;
      const { cnt, why } = rootsBBT(xs, V, m);
      const wrong = r.shuffle([0, 1, 2, 3, 4].filter((x) => x !== cnt)).map((x) => `$${x}$`);
      return {
        stem: `Cho hàm số $y = f(x)$ có bảng biến thiên như sau:\n${bbt(xs, V)}\nSố nghiệm thực của phương trình $${eqs}$ là`,
        ...mcq(r, `$${cnt}$`, wrong),
        explanation: `${eqs.startsWith("f(x) =") ? "" : `$${eqs} \\Leftrightarrow f(x) = ${m}$. `}Số nghiệm bằng số giao điểm của đồ thị $y = f(x)$ với đường thẳng $y = ${m}$. Dựa vào bảng biến thiên: ${why.length ? why.join("; ") : "đường thẳng không cắt đồ thị"}. Vậy phương trình có ${cnt} nghiệm.`,
      };
    },
  },
  {
    id: "t12-toi-uu-hop-khong-nap", subject: S, grade: G, chapter: C1, topic: "Bài toán tối ưu: hộp gấp từ tấm hình vuông",
    half: 1, level: 3, kind: "mcq",
    make: (r) => {
      const k = r.int(1, 5), a = 6 * k, u = r.pick(["cm", "dm"]);
      const mat = r.pick(["tấm bìa", "tấm tôn", "tấm nhôm", "tấm nhựa", "tấm giấy cứng"]);
      const askX = r.chance(0.5);
      const V = (x: number) => x * (a - 2 * x) * (a - 2 * x);
      const stem0 = `Từ một ${mat} hình vuông cạnh $${a}$ ${u}, người ta cắt bỏ ở bốn góc bốn hình vuông bằng nhau cạnh $x$ ${u} rồi gấp lại thành một chiếc hộp không nắp hình hộp chữ nhật.`;
      const right = askX ? `$x = ${k}$` : `$${V(k)}\\ \\text{${u}}^3$`;
      const wrong = askX ? [`$x = ${tex(a / 4)}$`, `$x = ${2 * k}$`, `$x = ${tex(a / 12)}$`]
        : [V(a / 4), V(a / 3), V(a / 12)].map((v) => `$${tex(v)}\\ \\text{${u}}^3$`);
      return {
        stem: stem0 + (askX ? ` Để thể tích chiếc hộp lớn nhất thì $x$ bằng bao nhiêu ${u}?` : ` Thể tích lớn nhất của chiếc hộp bằng`),
        ...mcq(r, right, wrong),
        explanation: `Đáy hộp là hình vuông cạnh $${a} - 2x$, chiều cao $x$ $(0 < x < ${tex(a / 2)})$: $V(x) = x(${a} - 2x)^2$. $V'(x) = (${a} - 2x)(${a} - 6x) = 0 \\Leftrightarrow x = ${k}$ (vì $x < ${tex(a / 2)}$). $V'$ đổi dấu từ $+$ sang $-$ qua $x = ${k}$ nên $V$ lớn nhất tại $x = ${k}$, $V_{\\max} = ${k}\\cdot ${4 * k}^2 = ${V(k)}$ (${u}³).`,
      };
    },
  },

  /* ---------- Đúng/Sai ---------- */
  {
    id: "t12-tf-khao-sat-bac-ba", subject: S, grade: G, chapter: C1, topic: "Khảo sát hàm số bậc ba",
    half: 1, level: 2, kind: "tf",
    make: (r) => {
      const a = r.pick([1, -1]), p = r.int(-3, 1), q = p + r.pick([2, 4]), d = r.int(-4, 5);
      const cs = cubic(a, p, q, d), ds = der(cs), f = (x: number) => ev(cs, x);
      const xCD = a > 0 ? p : q, xCT = a > 0 ? q : p;
      const t1 = r.chance(0.5);
      const mds = ds[1] !== 0 ? [ds[0], -ds[1], ds[2]] : [ds[0], ds[1], -ds[2]];
      need(!eq3(mds, ds));
      const s2 = r.pick(["đồng biến", "nghịch biến"]), t2 = (s2 === "nghịch biến") === (a > 0);
      const t3 = r.chance(0.5), y3 = t3 ? f(xCD) : f(xCT);
      const al = p - r.int(1, 2), be = q + r.int(-1, 1);
      const cand = [al, be, ...[p, q].filter((x) => x > al && x < be)];
      const M = Math.max(...cand.map(f));
      const t4 = r.chance(0.5);
      const alts = [f(p), f(q), f(al), f(be)].filter((v) => v !== M);
      need(alts.length > 0);
      const y4 = t4 ? M : r.pick(alts);
      return {
        stem: `Cho hàm số $f(x) = ${poly(cs)}$.`,
        ...tf([
          [`Đạo hàm của hàm số là $f'(x) = ${poly(t1 ? ds : mds)}$.`, t1],
          [`Hàm số ${s2} trên khoảng $(${p};${q})$.`, t2],
          [`Giá trị cực đại của hàm số bằng $${y3}$.`, t3],
          [`Giá trị lớn nhất của hàm số trên đoạn $[${al};${be}]$ bằng $${y4}$.`, t4],
        ]),
        explanation: `a) ${tick(t1)}: $f'(x) = ${poly(ds)} = ${3 * a}${fx(p)}${fx(q)}$. b) ${tick(t2)}: trên $(${p};${q})$ ta có $f'(x) ${a > 0 ? "<" : ">"} 0$ nên hàm số ${a > 0 ? "nghịch biến" : "đồng biến"}. c) ${tick(t3)}: hàm số đạt cực đại tại $x = ${xCD}$, $f_{\\text{CĐ}} = f(${xCD}) = ${f(xCD)}$ (giá trị cực tiểu là $f(${xCT}) = ${f(xCT)}$). d) ${tick(t4)}: so sánh ${cand.map((x) => `$f(${x}) = ${f(x)}$`).join(", ")} được giá trị lớn nhất là $${M}$.`,
      };
    },
  },
  {
    id: "t12-tf-ham-phan-thuc", subject: S, grade: G, chapter: C1, topic: "Khảo sát hàm phân thức bậc nhất trên bậc nhất",
    half: 1, level: 3, kind: "tf",
    make: (r) => {
      const a = r.nz(-3, 3), d = r.nz(-4, 4), b = r.int(-6, 6);
      const D = b - a * d; need(D !== 0 && Math.abs(D) <= 12);
      const t1 = r.chance(0.5), t2 = r.chance(0.5), t4 = r.chance(0.5);
      const fn = `y = \\dfrac{${lin(a, b)}}{${poly([1, d])}}`;
      const s3 = r.pick(["đồng biến", "nghịch biến"]), up = a * d - b > 0, t3 = (s3 === "đồng biến") === up;
      const y2 = t2 ? a : b !== 0 && b / d !== a && Number.isInteger(b / d) ? b / d : -a;
      let tau = 0; for (let e = 1; e <= Math.abs(D); e++) if (D % e === 0) tau++;
      const N = 2 * tau, N4 = t4 ? N : tau;
      return {
        stem: `Cho hàm số $${fn}$.`,
        ...tf([
          [`Đồ thị hàm số có tiệm cận đứng là đường thẳng $x = ${t1 ? -d : d}$.`, t1],
          [`Đồ thị hàm số có tiệm cận ngang là đường thẳng $y = ${y2}$.`, t2],
          [`Hàm số ${s3} trên từng khoảng xác định.`, t3],
          [`Trên đồ thị hàm số có đúng $${N4}$ điểm có hoành độ và tung độ đều là số nguyên.`, t4],
        ]),
        explanation: `Tập xác định $\\mathbb{R} \\setminus \\{${-d}\\}$. a) ${tick(t1)}: tiệm cận đứng $x = ${-d}$. b) ${tick(t2)}: $\\lim\\limits_{x\\to\\pm\\infty} y = ${a}$ nên tiệm cận ngang $y = ${a}$. c) ${tick(t3)}: $y' = \\dfrac{${a}\\cdot ${nm(d)} - ${nm(b)}}{(${poly([1, d])})^2} = \\dfrac{${a * d - b}}{(${poly([1, d])})^2} ${up ? ">" : "<"} 0$ nên hàm số ${up ? "đồng biến" : "nghịch biến"} trên từng khoảng xác định. d) ${tick(t4)}: $y = ${a} ${D < 0 ? "-" : "+"} \\dfrac{${Math.abs(D)}}{${poly([1, d])}}$; $y$ nguyên $\\Leftrightarrow ${poly([1, d])}$ là ước của $${Math.abs(D)}$. Số $${Math.abs(D)}$ có ${tau} ước dương nên có $2\\cdot ${tau} = ${N}$ ước nguyên, tức là ${N} điểm.`,
      };
    },
  },
  {
    id: "t12-tf-doc-bang-bien-thien", subject: S, grade: G, chapter: C1, topic: "Đọc bảng biến thiên của hàm số",
    half: 1, level: 1, kind: "tf",
    make: (r) => {
      const xs = sortedDistinct(r, 2, -3, 4);
      const lo = r.int(-4, 2), hi = lo + r.int(2, 6), up = r.chance(0.5);
      const V = up ? [-Infinity, hi, lo, Infinity] : [Infinity, lo, hi, -Infinity];
      const xCD = up ? xs[0] : xs[1], xCT = up ? xs[1] : xs[0];
      need(hi !== xCD && lo !== xCT && hi !== xCT);
      const E = [NI, String(xs[0]), String(xs[1]), PI];
      const segUp = up ? [true, false, true] : [false, true, false];
      const j = r.int(0, 2), ph = r.pick(["đồng biến", "nghịch biến"]), t1 = (ph === "đồng biến") === segUp[j];
      const t2 = r.chance(0.5), x2 = t2 ? xCD : r.pick([hi, xCT]);
      const t3 = r.chance(0.5), y3 = t3 ? lo : hi;
      const m = r.pick([lo, hi, lo + 1, hi + 1, lo - 1, hi - 1, lo + 1]);
      const cnt = rootsBBT(xs, V, m).cnt;
      const claim = r.pick([1, 2, 3]), t4 = claim === cnt;
      return {
        stem: `Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có bảng biến thiên như sau:\n${bbt(xs, V)}`,
        ...tf([
          [`Hàm số ${ph} trên khoảng $(${E[j]};${E[j + 1]})$.`, t1],
          [`Hàm số đạt cực đại tại $x = ${x2}$.`, t2],
          [`Giá trị cực tiểu của hàm số bằng $${y3}$.`, t3],
          [`Phương trình $f(x) = ${m}$ có đúng ${claim === 1 ? "một nghiệm" : `$${claim}$ nghiệm phân biệt`}.`, t4],
        ]),
        explanation: `a) ${tick(t1)}: trên $(${E[j]};${E[j + 1]})$ đạo hàm mang dấu $${segUp[j] ? "+" : "-"}$ nên hàm số ${segUp[j] ? "đồng biến" : "nghịch biến"}. b) ${tick(t2)}: hàm số đạt cực đại tại $x = ${xCD}$ (giá trị cực đại $${hi}$). c) ${tick(t3)}: giá trị cực tiểu là $${lo}$, đạt tại $x = ${xCT}$. d) ${tick(t4)}: đường thẳng $y = ${m}$ cắt đồ thị tại ${cnt} điểm nên phương trình có ${cnt} nghiệm.`,
      };
    },
  },
  {
    id: "t12-tf-nong-do-thuoc", subject: S, grade: G, chapter: C1, topic: "Ứng dụng đạo hàm: nồng độ thuốc theo thời gian",
    half: 1, level: 3, kind: "tf",
    make: (r) => {
      const B = r.pick([2, 3, 4, 6]);
      const pairs: [number, number][] = []; for (let t = 1; t < B; t++) if ((B * B) % t === 0) pairs.push([t, (B * B) / t]);
      const [t1, t2] = r.pick(pairs);
      const lcm = (x: number, y: number) => { let g = x, h = y; while (h) [g, h] = [h, g % h]; return (x * y) / g; };
      const L = lcm(t1 + t2, 2 * B); const j = r.int(1, Math.max(1, Math.floor(240 / L))); const A = L * j;
      need(A <= 300);
      const c = A / (t1 + t2), Cm = A / (2 * B);
      const drug = r.pick(["một loại thuốc", "một loại thuốc kháng sinh", "một loại thuốc giảm đau", "một loại thuốc hạ sốt"]);
      const t0 = r.pick([1, 2, 3, 5].filter((x) => x !== B));
      const C = (t: number) => frac(A * t, t * t + B * B);
      const s1 = r.chance(0.5), v1 = s1 ? C(t0) : frac(A * t0, t0 * t0 + B);
      need(v1 !== C(t0) || s1);
      const s2 = r.chance(0.5), T2 = s2 ? B : r.pick([B * B, 2 * B].filter((x) => x !== B));
      const s3 = r.chance(0.5), V3 = s3 ? frac(A, 2 * B) : frac(A, B);
      const s4 = r.chance(0.5), D4 = s4 ? t2 - t1 : r.pick([t1 + t2, t2 - t1 + 1, t2 - t1 - 1].filter((x) => x > 0 && x !== t2 - t1));
      return {
        stem: `Nồng độ của ${drug} trong máu của một bệnh nhân sau $t$ giờ kể từ khi tiêm được cho bởi $C(t) = \\dfrac{${A}t}{t^2 + ${B * B}}$ (mg/L), $t \\ge 0$.`,
        ...tf([
          [`Sau $${t0}$ giờ kể từ khi tiêm, nồng độ thuốc trong máu là $${v1}$ mg/L.`, s1],
          [`Nồng độ thuốc trong máu đạt giá trị lớn nhất tại thời điểm $t = ${T2}$ giờ.`, s2],
          [`Nồng độ thuốc lớn nhất trong máu bằng $${V3}$ mg/L.`, s3],
          [`Khoảng thời gian mà nồng độ thuốc trong máu không nhỏ hơn $${tex(c)}$ mg/L kéo dài $${D4}$ giờ.`, s4],
        ]),
        explanation: `a) ${tick(s1)}: $C(${t0}) = \\dfrac{${A}\\cdot ${t0}}{${t0 * t0} + ${B * B}} = ${C(t0)}$. b) ${tick(s2)}: $C'(t) = \\dfrac{${A}(${B * B} - t^2)}{(t^2 + ${B * B})^2}$, $C'(t) = 0 \\Leftrightarrow t = ${B}$ ($t \\ge 0$); $C'$ đổi dấu từ $+$ sang $-$ qua $t = ${B}$. c) ${tick(s3)}: $C_{\\max} = C(${B}) = \\dfrac{${A}\\cdot ${B}}{${2 * B * B}} = ${frac(A, 2 * B)}$. d) ${tick(s4)}: $C(t) \\ge ${tex(c)} \\Leftrightarrow ${tex(c)}t^2 - ${A}t + ${tex(c * B * B)} \\le 0 \\Leftrightarrow ${t1} \\le t \\le ${t2}$, kéo dài $${t2} - ${t1} = ${t2 - t1}$ giờ.`,
      };
    },
  },

  /* ---------- Trả lời ngắn ---------- */
  {
    id: "t12-sh-gtnn-x-cong-k-chia-x", subject: S, grade: G, chapter: C1, topic: "GTLN – GTNN của y = ax + b/x trên khoảng",
    half: 1, level: 2, kind: "short",
    make: (r) => {
      const a = r.int(1, 4), x0 = r.int(1, 6), b = a * x0 * x0, c = r.chance(0.5) ? 0 : r.nz(-5, 5);
      const pos = r.chance(0.7), askVal = r.chance(0.6);
      const fn = `y = ${coef(a)}x + \\dfrac{${b}}{x}${term(c)}`;
      const ext = pos ? 2 * a * x0 + c : -2 * a * x0 + c, xe = pos ? x0 : -x0;
      const kind = pos ? "nhỏ nhất" : "lớn nhất";
      const dom = pos ? `(0;+\\infty)` : `(-\\infty;0)`;
      return {
        stem: askVal ? `Tìm giá trị ${kind} của hàm số $${fn}$ trên khoảng $${dom}$.` : `Hàm số $${fn}$ đạt giá trị ${kind} trên khoảng $${dom}$ tại $x = x_0$. Tìm $x_0$.`,
        ...short(askVal ? ext : xe),
        explanation: `$y' = ${a} - \\dfrac{${b}}{x^2} = 0 \\Leftrightarrow x^2 = ${x0 * x0} \\Leftrightarrow x = \\pm ${x0}$. Trên $${dom}$ chỉ có $x = ${xe}$; $y'$ đổi dấu từ ${pos ? "$-$ sang $+$" : "$+$ sang $-$"} qua đó nên hàm số đạt giá trị ${kind} tại $x = ${xe}$, bằng $${a * xe} + \\dfrac{${b}}{${xe}}${term(c)} = ${ext}$.`,
      };
    },
  },
  {
    id: "t12-sh-dem-tiem-can", subject: S, grade: G, chapter: C1, topic: "Đếm số đường tiệm cận đứng và ngang",
    half: 1, level: 3, kind: "short",
    make: (r) => {
      const [p, q, u] = r.shuffle([-4, -3, -2, -1, 1, 2, 3, 4]).slice(0, 3);
      const den2 = (x: number, y: number) => poly([1, -(x + y), x * y]);
      const ty = r.int(0, 5);
      let num: string, den: string, ans: number, why: string;
      if (ty === 0) { num = poly([1, -p]); den = den2(p, q); ans = 2; why = `$y = \\dfrac{${poly([1, -p])}}{${fx(p)}${fx(q)}} = \\dfrac{1}{${poly([1, -q])}}$ với $x \\ne ${p}$, nên $\\lim\\limits_{x\\to ${p}} y = ${frac(1, p - q)}$: $x = ${p}$ không là tiệm cận đứng. Đồ thị có 1 tiệm cận đứng $x = ${q}$ và tiệm cận ngang $y = 0$`; }
      else if (ty === 1) { num = poly([1, -u]); den = den2(p, q); ans = 3; why = `Mẫu có hai nghiệm $x = ${p}$, $x = ${q}$ đều không là nghiệm của tử nên có 2 tiệm cận đứng; bậc tử nhỏ hơn bậc mẫu nên có tiệm cận ngang $y = 0$`; }
      else if (ty === 2) { const k = r.int(1, 9); num = poly([r.nz(-3, 3), u]); den = `x^2 + ${k}`; ans = 1; why = `Mẫu $x^2 + ${k} > 0$ nên không có tiệm cận đứng; bậc tử nhỏ hơn bậc mẫu nên có tiệm cận ngang $y = 0$`; }
      else if (ty === 3) { num = den2(p, u); den = den2(p, q); ans = 2; why = `$y = \\dfrac{${fx(p)}${fx(u)}}{${fx(p)}${fx(q)}} = \\dfrac{${poly([1, -u])}}{${poly([1, -q])}}$ với $x \\ne ${p}$ nên chỉ có tiệm cận đứng $x = ${q}$; $\\lim\\limits_{x\\to\\pm\\infty} y = 1$ nên có tiệm cận ngang $y = 1$`; }
      else if (ty === 4) { const a2 = r.pick([1, 2, -1]), b1 = r.int(-3, 3), c0 = r.int(-4, 4); need(a2 * p * p + b1 * p + c0 !== 0); num = poly([a2, b1, c0]); den = poly([1, -p]); ans = 1; why = `Có tiệm cận đứng $x = ${p}$; bậc tử lớn hơn bậc mẫu nên $\\lim\\limits_{x\\to\\pm\\infty} y = \\pm\\infty$, không có tiệm cận ngang (đồ thị có tiệm cận xiên)`; }
      else { const k2 = r.int(2, 3); num = poly([k2, -k2 * u]); den = poly([1, -2 * p, p * p]); ans = 2; why = `Mẫu $= ${fx(p)}^2$ có nghiệm kép $x = ${p}$ (không là nghiệm của tử) nên có 1 tiệm cận đứng; bậc tử nhỏ hơn bậc mẫu nên có tiệm cận ngang $y = 0$`; }
      return {
        stem: `Đồ thị hàm số $y = \\dfrac{${num}}{${den}}$ có tất cả bao nhiêu đường tiệm cận đứng và tiệm cận ngang?`,
        ...short(ans),
        explanation: `${why}. Tổng cộng có ${ans} đường tiệm cận đứng và ngang.`,
      };
    },
  },
  {
    id: "t12-sh-cuc-tri-tham-so", subject: S, grade: G, chapter: C1, topic: "Tìm tham số để hàm bậc ba đạt cực trị tại điểm cho trước",
    half: 1, level: 3, kind: "short",
    make: (r) => {
      const k = r.int(1, 3), K = k * k, x0 = r.int(-3, 4), c = r.int(-5, 5), cd = r.chance(0.5);
      const m = cd ? x0 + k : x0 - k;
      const form = r.chance(0.5);
      const fn = form ? `y = \\dfrac{1}{3}x^3 - mx^2 + (m^2 - ${K})x${term(c)}` : `y = x^3 - 3mx^2 + 3(m^2 - ${K})x${term(c)}`;
      const yp = form ? `y' = x^2 - 2mx + m^2 - ${K}` : `y' = 3(x^2 - 2mx + m^2 - ${K})`;
      return {
        stem: `Tìm giá trị của tham số $m$ để hàm số $${fn}$ đạt cực ${cd ? "đại" : "tiểu"} tại $x = ${x0}$.`,
        ...short(m),
        explanation: `$${yp}$. $y'(${x0}) = 0 \\Leftrightarrow m^2 ${term(-2 * x0, "m")} ${term(x0 * x0 - K)} = 0 \\Leftrightarrow m = ${x0 - k}$ hoặc $m = ${x0 + k}$. Ta có $y'' = ${form ? "" : "3("}2x - 2m${form ? "" : ")"}$. Với $m = ${x0 + k}$: $y''(${x0}) ${"<"} 0$ (cực đại); với $m = ${x0 - k}$: $y''(${x0}) > 0$ (cực tiểu). Vậy $m = ${m}$.`,
      };
    },
  },
  {
    id: "t12-sh-toi-uu-hang-rao", subject: S, grade: G, chapter: C1, topic: "Bài toán tối ưu: rào mảnh đất hình chữ nhật",
    half: 1, level: 3, kind: "short",
    make: (r) => {
      const L = 4 * r.int(8, 40), ty = r.int(0, 2);
      const who = r.pick(["Một bác nông dân", "Một người", "Một trang trại", "Ông An", "Bà Hoa"]);
      const place = r.pick(["một mảnh vườn", "một khu chuồng nuôi gà", "một bãi tập kết vật liệu", "một khu trồng rau"]);
      const mat = r.pick(["lưới thép", "hàng rào gỗ", "lưới B40"]);
      const askA = r.chance(0.6);
      let stem: string, ans: number, ex: string;
      if (ty === 0) {
        stem = `${who} có $${L}$ m ${mat} để rào ${place} hình chữ nhật, trong đó một cạnh dựa vào bức tường có sẵn nên không cần rào.`;
        const x = L / 4, y = L / 2;
        ans = askA ? x * y : r.chance(0.5) ? y : x;
        const q = askA ? " Diện tích lớn nhất có thể rào được là bao nhiêu mét vuông?" : ans === y ? " Để diện tích rào được lớn nhất thì cạnh song song với bức tường dài bao nhiêu mét?" : " Để diện tích rào được lớn nhất thì cạnh vuông góc với bức tường dài bao nhiêu mét?";
        stem += q;
        ex = `Gọi $x$ (m) là cạnh vuông góc với tường, cạnh song song với tường là $${L} - 2x$. $S(x) = x(${L} - 2x)$, $S'(x) = ${L} - 4x = 0 \\Leftrightarrow x = ${x}$. Khi đó cạnh song song với tường dài $${y}$ m và $S_{\\max} = ${x}\\cdot ${y} = ${x * y}$ (m²).`;
      } else if (ty === 1) {
        stem = `${who} có $${L}$ m ${mat} để rào xung quanh ${place} hình chữ nhật (rào cả bốn cạnh).` + (askA ? " Diện tích lớn nhất có thể rào được là bao nhiêu mét vuông?" : " Để diện tích rào được lớn nhất thì chiều dài mảnh đất bằng bao nhiêu mét?");
        const x = L / 4; ans = askA ? x * x : x;
        ex = `Gọi chiều dài là $x$ thì chiều rộng là $${L / 2} - x$. $S(x) = x(${L / 2} - x)$, $S'(x) = ${L / 2} - 2x = 0 \\Leftrightarrow x = ${x}$: mảnh đất là hình vuông cạnh $${x}$ m, $S_{\\max} = ${x * x}$ (m²).`;
      } else {
        stem = `${who} có $${L}$ m ${mat} để rào ${place} hình chữ nhật nằm ở góc giữa hai bức tường vuông góc có sẵn (hai cạnh dựa vào tường không cần rào).` + (askA ? " Diện tích lớn nhất có thể rào được là bao nhiêu mét vuông?" : " Để diện tích rào được lớn nhất thì mỗi cạnh cần rào dài bao nhiêu mét?");
        const x = L / 2; ans = askA ? x * x : x;
        ex = `Hai cạnh cần rào có tổng $${L}$ m: $x$ và $${L} - x$. $S(x) = x(${L} - x)$, $S'(x) = ${L} - 2x = 0 \\Leftrightarrow x = ${x}$, $S_{\\max} = ${x}^2 = ${x * x}$ (m²).`;
      }
      return { stem, ...short(ans), explanation: ex };
    },
  },
  {
    id: "t12-sh-toi-uu-be-hinh-hop", subject: S, grade: G, chapter: C1, topic: "Bài toán tối ưu: bể/hộp đáy vuông tốn ít vật liệu nhất",
    half: 1, level: 3, kind: "short",
    make: (r) => {
      const ctx = r.pick([
        { o: "bể nước", u: "m", xs: [2, 4, 6] },
        { o: "thùng chứa bằng tôn", u: "dm", xs: [4, 6, 8, 10] },
        { o: "hộp giấy", u: "cm", xs: [10, 12, 14, 16, 20] },
        { o: "bể cá bằng kính", u: "dm", xs: [2, 4, 6, 8] },
      ]);
      const x = r.pick(ctx.xs), lid = r.chance(0.35);
      const V = lid ? x * x * x : (x * x * x) / 2, h = lid ? x : x / 2, Smin = lid ? 6 * x * x : 3 * x * x;
      const ask = r.int(0, 2);
      const q = ["Diện tích nhỏ nhất của phần vật liệu cần dùng bằng bao nhiêu", "Để tốn ít vật liệu nhất thì cạnh đáy bằng bao nhiêu", "Để tốn ít vật liệu nhất thì chiều cao bằng bao nhiêu"][ask];
      const unit = ask === 0 ? `${ctx.u}²` : ctx.u;
      return {
        stem: `Người ta cần làm một ${ctx.o} ${lid ? "có nắp" : "không nắp"} dạng hình hộp chữ nhật có đáy là hình vuông, thể tích $${V}$ ${ctx.u}³. ${q} (đơn vị: ${unit})?`,
        ...short([Smin, x, h][ask]),
        explanation: `Gọi cạnh đáy là $x$, chiều cao $h = \\dfrac{${V}}{x^2}$. Diện tích vật liệu $S(x) = ${lid ? "2" : ""}x^2 + 4xh = ${lid ? "2" : ""}x^2 + \\dfrac{${4 * V}}{x}$ $(x > 0)$. $S'(x) = ${lid ? 4 : 2}x - \\dfrac{${4 * V}}{x^2} = 0 \\Leftrightarrow x^3 = ${lid ? V : 2 * V} \\Leftrightarrow x = ${x}$; $S'$ đổi dấu từ $-$ sang $+$ nên $S$ nhỏ nhất tại $x = ${x}$. Khi đó $h = ${h}$ và $S_{\\min} = ${Smin}$ (${ctx.u}²).`,
      };
    },
  },
  {
    id: "t12-sh-toi-uu-gia-ban", subject: S, grade: G, chapter: C1, topic: "Bài toán tối ưu: giá bán cho lợi nhuận lớn nhất",
    half: 1, level: 3, kind: "short",
    make: (r) => {
      const it = r.pick([
        { n: "áo phông", u: "chiếc", c: [60, 70, 80, 90] }, { n: "hộp sữa chua", u: "hộp", c: [15, 18, 20, 25] },
        { n: "hộp bánh", u: "hộp", c: [40, 50, 60] }, { n: "quyển sổ tay", u: "quyển", c: [20, 25, 30] },
        { n: "chiếc mũ bảo hiểm", u: "chiếc", c: [120, 150, 180] }, { n: "chậu cây cảnh", u: "chậu", c: [30, 40, 50] },
      ]);
      const c = r.pick(it.c), M = r.int(10, 40), k = r.int(1, 5), dec = r.chance(0.5);
      const p0 = c + M; let xs: number, n0: number, price: number, P: number;
      if (dec) { xs = r.int(1, Math.floor((M - 1) / 2)); n0 = k * (M - 2 * xs); price = p0 - xs; P = k * (M - xs) * (M - xs); }
      else { xs = r.int(1, 15); n0 = k * (M + 2 * xs); price = p0 + xs; P = k * (M + xs) * (M + xs); }
      need(n0 >= 10 && n0 <= 300);
      const askP = r.chance(0.4);
      const rule = dec ? `cứ giảm giá bán $1$ nghìn đồng thì mỗi ngày bán thêm được $${k}$ ${it.u}` : `cứ tăng giá bán $1$ nghìn đồng thì mỗi ngày bán ít đi $${k}$ ${it.u}`;
      return {
        stem: `Một cửa hàng nhập ${it.n} với giá $${c}$ nghìn đồng/${it.u}. Nếu bán với giá $${p0}$ nghìn đồng/${it.u} thì mỗi ngày bán được $${n0}$ ${it.u}; ${rule}. ${askP ? "Lợi nhuận lớn nhất mỗi ngày của cửa hàng là bao nhiêu nghìn đồng?" : `Để lợi nhuận mỗi ngày lớn nhất thì cửa hàng nên bán với giá bao nhiêu nghìn đồng một ${it.u}?`}`,
        ...short(askP ? P : price),
        explanation: `Gọi $x$ (nghìn đồng) là số tiền ${dec ? "giảm" : "tăng"} giá. Lợi nhuận một ${it.u} là $${M} ${dec ? "-" : "+"} x$, số ${it.u} bán được là $${n0} ${dec ? "+" : "-"} ${coef(k)}x$. $P(x) = (${M} ${dec ? "-" : "+"} x)(${n0} ${dec ? "+" : "-"} ${coef(k)}x)$, $P'(x) = ${dec ? `${k * M - n0} - ${2 * k}x` : `${n0 - k * M} - ${2 * k}x`} = 0 \\Leftrightarrow x = ${xs}$ (đổi dấu từ $+$ sang $-$). Giá bán $${p0} ${dec ? "-" : "+"} ${xs} = ${price}$ nghìn đồng, lợi nhuận lớn nhất $P(${xs}) = ${dec ? M - xs : M + xs}\\cdot ${dec ? n0 + k * xs : n0 - k * xs} = ${P}$ nghìn đồng.`,
      };
    },
  },
];

/* =============================== HALF 2: tiện ích ============================== */
/** Đỉnh hình hộp ABCD.A'B'C'D' theo cơ sở (AB, AD, AA') */
const HV: Record<string, number[]> = { A: [0, 0, 0], B: [1, 0, 0], C: [1, 1, 0], D: [0, 1, 0], "A'": [0, 0, 1], "B'": [1, 0, 1], "C'": [1, 1, 1], "D'": [0, 1, 1] };
const HN = Object.keys(HV);
const ov = (X: string, Y: string) => `\\overrightarrow{${X}${Y}}`;
const findV = (c: number[]) => HN.find((n) => eq3(HV[n], c));
const hd = (u: number[], v: number[]) => u.reduce((s, x, i) => s + Math.abs(x - v[i]), 0);

/** Một đẳng thức vectơ trong hình hộp, đúng hoặc sai theo yêu cầu */
function hhStmt(r: Rng, truth: boolean): { s: string; ok: string; why: string } {
  for (let it = 0; it < 80; it++) {
    const form = r.int(1, 5), X = r.pick(HN), x = HV[X];
    const nb = r.shuffle(HN.filter((n) => hd(HV[n], x) === 1));
    let lhs: string, res: number[], St = X, why: string;
    if (form === 1) { lhs = nb.map((n) => ov(X, n)).join(" + "); res = nb.reduce((s, n) => add3(s, sub3(HV[n], x)), [0, 0, 0]); why = "quy tắc hình hộp"; }
    else if (form === 2) { const [P, Q] = nb; lhs = `${ov(X, P)} + ${ov(X, Q)}`; res = add3(sub3(HV[P], x), sub3(HV[Q], x)); why = "quy tắc hình bình hành"; }
    else if (form === 3) { const [Y, Z] = r.shuffle(HN.filter((n) => n !== X)); lhs = `${ov(X, Y)} - ${ov(X, Z)}`; res = sub3(HV[Y], HV[Z]); St = Z; why = "quy tắc hiệu"; }
    else if (form === 4) { const [Y, Z] = r.shuffle(HN.filter((n) => n !== X)); lhs = `${ov(X, Y)} + ${ov(Y, Z)}`; res = sub3(HV[Z], x); why = "quy tắc ba điểm"; }
    else {
      const [P, Q] = nb, d2 = sub3(HV[Q], x);
      const Ws = HN.filter((w) => w !== X && findV(add3(HV[w], d2)));
      if (!Ws.length) continue;
      const W = r.pick(Ws), W2 = findV(add3(HV[W], d2))!;
      lhs = `${ov(X, P)} + ${ov(W, W2)}`; res = add3(sub3(HV[P], x), d2); why = `$${ov(W, W2)} = ${ov(X, Q)}$ rồi dùng quy tắc hình bình hành`;
    }
    const Tn = findV(add3(HV[St], res));
    if (!Tn || Tn === St) continue;
    const ok = `$${lhs} = ${ov(St, Tn)}$`;
    if (truth) return { s: ok, ok, why };
    const alt = r.chance(0.35) ? ov(Tn, St) : ov(St, r.pick(HN.filter((n) => n !== Tn && n !== St)));
    return { s: `$${lhs} = ${alt}$`, ok, why };
  }
  throw new Error("hhStmt");
}

type Ctx = { intro: (n: number) => string; row: string; obj: string; unit: string; starts: number[]; hs: number[] };
const CTX: Ctx[] = [
  { intro: (n) => `Chiều cao của ${n} học sinh lớp 12A được thống kê trong bảng sau:`, row: "Chiều cao (cm)", obj: "Số học sinh", unit: "cm", starts: [145, 150, 155], hs: [5] },
  { intro: (n) => `Cân nặng của ${n} học sinh lớp 12B được cho trong bảng sau:`, row: "Cân nặng (kg)", obj: "Số học sinh", unit: "kg", starts: [40, 45], hs: [5] },
  { intro: (n) => `Thời gian tự học mỗi ngày của ${n} học sinh lớp 12C được thống kê trong bảng sau:`, row: "Thời gian (phút)", obj: "Số học sinh", unit: "phút", starts: [0, 20, 30], hs: [10, 20] },
  { intro: (n) => `Thời gian sử dụng điện thoại mỗi ngày của ${n} học sinh được cho trong bảng sau:`, row: "Thời gian (giờ)", obj: "Số học sinh", unit: "giờ", starts: [0], hs: [1, 2] },
  { intro: (n) => `Quãng đường chạy bộ trong một tuần của ${n} thành viên một câu lạc bộ thể thao được cho trong bảng sau:`, row: "Quãng đường (km)", obj: "Số người", unit: "km", starts: [0, 5, 10], hs: [5] },
  { intro: (n) => `Doanh thu mỗi ngày của một cửa hàng trong ${n} ngày được thống kê trong bảng sau:`, row: "Doanh thu (triệu đồng)", obj: "Số ngày", unit: "triệu đồng", starts: [5, 10, 20], hs: [5, 10] },
  { intro: (n) => `Thời gian hoàn thành một bài kiểm tra trực tuyến của ${n} học sinh được cho trong bảng sau:`, row: "Thời gian (phút)", obj: "Số học sinh", unit: "phút", starts: [10, 15, 20], hs: [5] },
  { intro: (n) => `Tuổi thọ của ${n} chiếc bóng đèn được kiểm tra cho trong bảng sau:`, row: "Tuổi thọ (tháng)", obj: "Số bóng đèn", unit: "tháng", starts: [20, 24], hs: [4, 6] },
  { intro: (n) => `Lượng mưa đo được trong ${n} ngày mùa mưa tại một trạm khí tượng được cho trong bảng sau:`, row: "Lượng mưa (mm)", obj: "Số ngày", unit: "mm", starts: [0, 10, 20], hs: [10] },
];
type GD = { c: Ctx; lows: number[]; h: number; f: number[]; n: number; k: number };
function gd(r: Rng): GD {
  const c = r.pick(CTX), k = r.int(5, 6), l0 = r.pick(c.starts), h = r.pick(c.hs);
  const f = Array.from({ length: k }, () => r.int(2, 14));
  const lows = f.map((_, i) => l0 + i * h);
  return { c, lows, h, f, k, n: f.reduce((s, x) => s + x, 0) };
}
function gdTable(g: GD): string {
  const cells = g.lows.map((l) => `[${l};${l + g.h})`).join(" & ");
  return `$\\begin{array}{|c|${"c|".repeat(g.k)}}\\hline \\text{${g.c.row}} & ${cells} \\\\ \\hline \\text{${g.c.obj}} & ${g.f.join(" & ")} \\\\ \\hline\\end{array}$`;
}
const gdStem = (g: GD) => `${g.c.intro(g.n)}\n${gdTable(g)}`;
/** Tứ phân vị thứ p (p = 1, 2, 3) */
function quart(g: GD, p: number) {
  const t = (p * g.n) / 4; let cf = 0, i = 0;
  while (cf + g.f[i] < t) { cf += g.f[i]; i++; }
  const Q = g.lows[i] + ((t - cf) / g.f[i]) * g.h;
  const expl = `$\\dfrac{${p === 1 ? "" : p}${p === 1 ? "n" : "n"}}{4} = ${tex(t)}$ thuộc nhóm $[${g.lows[i]};${g.lows[i] + g.h})$ nên $Q_${p} = ${g.lows[i]} + \\dfrac{${tex(t)} - ${cf}}{${g.f[i]}}\\cdot ${g.h} \\approx ${tex(Q)}$`;
  return { Q, i, cf, t, expl };
}
function stats(g: GD) {
  const xs = g.lows.map((l) => l + g.h / 2);
  const mean = xs.reduce((s, x, i) => s + g.f[i] * x, 0) / g.n;
  const m2 = xs.reduce((s, x, i) => s + g.f[i] * x * x, 0) / g.n;
  const v = m2 - mean * mean;
  const mad = xs.reduce((s, x, i) => s + g.f[i] * Math.abs(x - mean), 0) / g.n;
  const expl = `Giá trị đại diện các nhóm: $${xs.map((x) => tex(x)).join(";\\ ")}$. $\\overline{x} = \\dfrac{${xs.map((x, i) => `${g.f[i]}\\cdot ${tex(x)}`).join(" + ")}}{${g.n}} \\approx ${tex(mean)}$; $s^2 = \\dfrac{1}{${g.n}}\\left(${xs.map((x, i) => `${g.f[i]}\\cdot ${tex(x)}^2`).join(" + ")}\\right) - \\overline{x}^2 \\approx ${tex(v)}$; $s = \\sqrt{s^2} \\approx ${tex(Math.sqrt(v))}$`;
  return { xs, mean, v, s: Math.sqrt(v), mad, expl };
}

/** Góc đẹp giữa hai vectơ nguyên */
function niceAngle(r: Rng): { u: number[]; v: number[]; th: number; cosT: string } {
  for (let it = 0; it < 400; it++) {
    const u = vec3(r, -2, 2), v = vec3(r, -2, 2);
    const a = n2(u), b = n2(v), d = dot3(u, v);
    if (!a || !b) continue;
    let th = -1, cosT = "";
    if (d === 0) { if (!r.chance(0.15)) continue; th = 90; cosT = "0"; }
    else if (4 * d * d === a * b) { th = d > 0 ? 60 : 120; cosT = d > 0 ? "\\dfrac{1}{2}" : "-\\dfrac{1}{2}"; }
    else if (2 * d * d === a * b) { th = d > 0 ? 45 : 135; cosT = d > 0 ? "\\dfrac{\\sqrt{2}}{2}" : "-\\dfrac{\\sqrt{2}}{2}"; }
    else if (4 * d * d === 3 * a * b) { th = d > 0 ? 30 : 150; cosT = d > 0 ? "\\dfrac{\\sqrt{3}}{2}" : "-\\dfrac{\\sqrt{3}}{2}"; }
    if (th >= 0) return { u, v, th, cosT };
  }
  throw new Error("niceAngle");
}
const angExpl = (u: number[], v: number[], cosT: string, th: number) =>
  `$\\cos(\\vec{u},\\vec{v}) = \\dfrac{\\vec{u}\\cdot\\vec{v}}{|\\vec{u}|\\cdot|\\vec{v}|} = \\dfrac{${dotExpl(u, v)}}{\\sqrt{${n2(u)}}\\cdot\\sqrt{${n2(v)}}} = ${cosT}$ nên $(\\vec{u},\\vec{v}) = ${th}^\\circ$.`;

const QUAD = [[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [4, 4, 7, 9], [2, 6, 9, 11], [6, 6, 7, 11], [2, 10, 11, 15]];

/* =============================== HALF 2 =============================== */
const H2: Template[] = [
  {
    id: "t12-vecto-hinh-hop-dang-thuc", subject: S, grade: G, chapter: C2, topic: "Đẳng thức vectơ trong hình hộp",
    half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const askTrue = r.chance(0.65);
      const want = askTrue ? [true, false, false, false] : [false, true, true, true];
      const items: { s: string; ok: string; why: string }[] = []; const seen = new Set<string>();
      for (const t of want) for (let i = 0; i < 30; i++) { const x = hhStmt(r, t); if (!seen.has(x.s)) { seen.add(x.s); items.push(x); break; } }
      need(items.length === 4);
      const L = r.pick(["ABCD", "ABCD", "MNPQ", "EFGH"]);
      const rl = (x: string) => x.replace(/[ABCD]/g, (ch) => L["ABCD".indexOf(ch)]);
      const it = items.map((x) => ({ s: rl(x.s), ok: rl(x.ok), why: rl(x.why) }));
      const solid = r.pick(["hình hộp", "hình hộp", "hình lập phương", "hình hộp chữ nhật"]);
      const q = r.pick(["Khẳng định nào sau đây", "Đẳng thức vectơ nào sau đây", "Mệnh đề nào dưới đây"]);
      const right = it[0].s;
      return {
        stem: `Cho ${solid} $${L}.${L.split("").map((c) => c + "'").join("")}$. ${q} ${askTrue ? "đúng" : "sai"}?`,
        ...mcq(r, right, it.slice(1).map((x) => x.s)),
        explanation: askTrue
          ? `${right} đúng theo ${it[0].why}. Các khẳng định còn lại sai, chẳng hạn đẳng thức đúng phải là ${it[1].ok}.`
          : `${right} sai, đẳng thức đúng là ${it[0].ok} (${it[0].why}). Ba khẳng định còn lại đều đúng.`,
      };
    },
  },
  {
    id: "t12-vecto-tim-he-so-k", subject: S, grade: G, chapter: C2, topic: "Biểu diễn vectơ: tìm hệ số k",
    half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const [P0, P1, P2, P3] = r.pick([["A", "B", "C", "D"], ["S", "A", "B", "C"], ["M", "N", "P", "Q"]]);
      const td = `${P0}${P1}${P2}${P3}`;
      const form = r.int(0, 4);
      let setup: string, lhs: string, base: [string, string], k: number, why: string;
      if (form === 0) { setup = `Cho tứ diện $${td}$, gọi $G$ là trọng tâm tam giác $${P1}${P2}${P3}$.`; lhs = `${ov(P0, P1)} + ${ov(P0, P2)} + ${ov(P0, P3)}`; base = [P0, "G"]; k = 3; why = `$${lhs} = 3${ov(P0, "G")} + (${ov("G", P1)} + ${ov("G", P2)} + ${ov("G", P3)}) = 3${ov(P0, "G")}$ vì $G$ là trọng tâm tam giác $${P1}${P2}${P3}$`; }
      else if (form === 1) { setup = `Cho tứ diện $${td}$ có $G$ là trọng tâm và $O$ là một điểm bất kì.`; lhs = [P0, P1, P2, P3].map((x) => ov("O", x)).join(" + "); base = ["O", "G"]; k = 4; why = `$${lhs} = 4${ov("O", "G")} + (${[P0, P1, P2, P3].map((x) => ov("G", x)).join(" + ")}) = 4${ov("O", "G")}$`; }
      else if (form === 2) { setup = `Cho tứ diện $${td}$, gọi $I$, $J$ lần lượt là trung điểm của $${P0}${P1}$ và $${P2}${P3}$.`; const [X1, X2] = r.chance(0.5) ? [P2, P3] : [P3, P2]; lhs = `${ov(P0, X1)} + ${ov(P1, X2)}`; base = ["I", "J"]; k = 2; why = `$${ov("I", "J")} = ${ov("I", P0)} + ${ov(P0, X1)} + ${ov(X1, "J")}$ và $${ov("I", "J")} = ${ov("I", P1)} + ${ov(P1, X2)} + ${ov(X2, "J")}$; cộng vế theo vế, với $${ov("I", P0)} + ${ov("I", P1)} = \\vec{0}$, $${ov(X1, "J")} + ${ov(X2, "J")} = \\vec{0}$, được $2${ov("I", "J")} = ${lhs}$`; }
      else if (form === 3) { setup = `Cho tứ diện $${td}$, gọi $K$ là trung điểm của $${P1}${P2}$.`; lhs = `${ov(P0, P1)} + ${ov(P0, P2)}`; base = [P0, "K"]; k = 2; why = `$K$ là trung điểm $${P1}${P2}$ nên $${lhs} = 2${ov(P0, "K")}$`; }
      else {
        const X = r.pick(HN), nb = HN.filter((n) => hd(HV[n], HV[X]) === 1), Y = findV(HV[X].map((t) => 1 - t))!;
        setup = `Cho hình hộp $ABCD.A'B'C'D'$ có tâm $O$.`; lhs = nb.map((n) => ov(X, n)).join(" + "); base = [X, "O"]; k = 2;
        why = `theo quy tắc hình hộp $${lhs} = ${ov(X, Y)}$, mà $O$ là trung điểm của $${X}${Y}$ nên $${ov(X, Y)} = 2${ov(X, "O")}$`;
      }
      const rev = r.chance(0.4);
      const rhs = rev ? ov(base[1], base[0]) : ov(base[0], base[1]);
      const ans = rev ? -k : k;
      return {
        stem: `${setup} Biết $${lhs} = k\\,${rhs}$. Giá trị của $k$ bằng`,
        ...mcq(r, `$${ans}$`, [`$${-ans}$`, `$${frac(1, ans)}$`, `$${ans + (ans > 0 ? 1 : -1)}$`, `$${ans > 0 ? ans - 1 : ans + 1}$`]),
        explanation: `Ta có ${why}${rev ? `, mà $${ov(base[0], base[1])} = -${rhs}$` : ""}. Vậy $k = ${ans}$.`,
      };
    },
  },
  {
    id: "t12-toa-do-vecto-ijk", subject: S, grade: G, chapter: C2, topic: "Tọa độ của vectơ theo i, j, k",
    half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const w = [r.int(-5, 5), r.int(-5, 5), r.int(-5, 5)];
      if (r.chance(0.7)) w[r.int(0, 2)] = 0;
      need(w.filter((x) => x !== 0).length >= 2);
      const names = ["\\vec{i}", "\\vec{j}", "\\vec{k}"];
      let ex = ""; w.forEach((x, i) => { ex += term(x, names[i], ex === ""); });
      const pt = r.chance(0.4);
      const nonz = w.filter((x) => x !== 0), compact = [...nonz, ...w.filter((x) => x === 0)];
      const right = `$${P3(w)}$`;
      return {
        stem: pt ? `Trong không gian $Oxyz$, cho điểm $M$ thỏa mãn $\\overrightarrow{OM} = ${ex}$. Tọa độ của điểm $M$ là` : `Trong không gian $Oxyz$, tọa độ của vectơ $\\vec{u} = ${ex}$ là`,
        ...mcq(r, right, [P3(compact), P3([w[1], w[0], w[2]]), P3([-w[0], -w[1], -w[2]]), P3([w[2], w[1], w[0]]), P3([w[0], w[2], w[1]])].map((s) => `$${s}$`)),
        explanation: `$${pt ? "\\overrightarrow{OM}" : "\\vec{u}"} = ${w[0]}\\vec{i} + ${nm(w[1])}\\vec{j} + ${nm(w[2])}\\vec{k}$ nên ${pt ? "$M" : "$\\vec{u} = "}${P3(w)}$ (hệ số nào vắng mặt thì tọa độ tương ứng bằng $0$).`,
      };
    },
  },
  {
    id: "t12-toa-do-phep-toan-vecto", subject: S, grade: G, chapter: C2, topic: "Tọa độ của tổng, hiệu, tích vectơ với số",
    half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const a = vec3(r), b = vec3(r), m = r.pick([1, 2, 3, -1, -2]), n = r.pick([1, 2, 3, -1, -2, -3]);
      need(!(m === 1 && Math.abs(n) === 1) || r.chance(0.5));
      const res = add3(mul3(m, a), mul3(n, b));
      const expr = `${coef(m)}\\vec{a} ${n > 0 ? "+" : "-"} ${coef(Math.abs(n))}\\vec{b}`;
      const wrong = [add3(mul3(m, a), mul3(-n, b)), add3(a, mul3(n, b)), add3(mul3(m, a), mul3(Math.sign(n), b)), add3(mul3(n, a), mul3(m, b))].map((v) => `$${P3(v)}$`);
      return {
        stem: `Trong không gian $Oxyz$, cho $\\vec{a} = ${P3(a)}$ và $\\vec{b} = ${P3(b)}$. Tọa độ của vectơ $${expr}$ là`,
        ...mcq(r, `$${P3(res)}$`, wrong),
        explanation: `$${expr} = \\left(${[0, 1, 2].map((i) => `${nm(m)}\\cdot ${nm(a[i])} + ${nm(n)}\\cdot ${nm(b[i])}`).join(";\\ ")}\\right) = ${P3(res)}$.`,
      };
    },
  },
  {
    id: "t12-toa-do-trung-diem-trong-tam", subject: S, grade: G, chapter: C2, topic: "Tọa độ trung điểm, trọng tâm",
    half: 2, level: 1, kind: "mcq",
    make: (r) => {
      if (r.chance(0.5)) {
        const I = vec3(r, -4, 4), d = vec3(r, -3, 3); need(n2(d) > 0);
        const A = sub3(I, d), B = add3(I, d);
        return {
          stem: `Trong không gian $Oxyz$, cho hai điểm $A${P3(A)}$ và $B${P3(B)}$. Tọa độ trung điểm $I$ của đoạn thẳng $AB$ là`,
          ...mcq(r, `$${P3(I)}$`, [mul3(2, I), d, mul3(-1, d), mul3(-1, I)].map((v) => `$${P3(v)}$`)),
          explanation: `$I\\left(\\dfrac{${A[0]} + ${nm(B[0])}}{2};\\dfrac{${A[1]} + ${nm(B[1])}}{2};\\dfrac{${A[2]} + ${nm(B[2])}}{2}\\right) = ${P3(I)}$.`,
        };
      }
      const Gc = vec3(r, -3, 3), A = vec3(r), B = vec3(r), C = sub3(sub3(mul3(3, Gc), A), B);
      need(C.every((x) => Math.abs(x) <= 9));
      const sum = mul3(3, Gc);
      return {
        stem: `Trong không gian $Oxyz$, cho tam giác $ABC$ có $A${P3(A)}$, $B${P3(B)}$, $C${P3(C)}$. Tọa độ trọng tâm $G$ của tam giác $ABC$ là`,
        ...mcq(r, `$${P3(Gc)}$`, [`$${P3(sum)}$`, `$${P3f(sum, 2)}$`, `$${P3f(add3(A, B), 2)}$`, `$${P3(mul3(-1, Gc))}$`]),
        explanation: `$G\\left(\\dfrac{x_A + x_B + x_C}{3};\\dfrac{y_A + y_B + y_C}{3};\\dfrac{z_A + z_B + z_C}{3}\\right) = \\left(\\dfrac{${sum[0]}}{3};\\dfrac{${sum[1]}}{3};\\dfrac{${sum[2]}}{3}\\right) = ${P3(Gc)}$.`,
      };
    },
  },
  {
    id: "t12-tich-vo-huong-toa-do", subject: S, grade: G, chapter: C2, topic: "Tích vô hướng theo tọa độ",
    half: 2, level: 1, kind: "mcq",
    make: (r) => {
      let u: number[], v: number[], stem: string, nu: string, nv: string;
      if (r.chance(0.6)) {
        u = vec3(r); v = vec3(r); nu = "\\vec{a}"; nv = "\\vec{b}";
        stem = `Trong không gian $Oxyz$, cho $\\vec{a} = ${P3(u)}$ và $\\vec{b} = ${P3(v)}$. Tích vô hướng $\\vec{a}\\cdot\\vec{b}$ bằng`;
      } else {
        const A = vec3(r, -3, 3), B = vec3(r, -3, 3), C = vec3(r, -3, 3); u = sub3(B, A); v = sub3(C, A); nu = "\\overrightarrow{AB}"; nv = "\\overrightarrow{AC}";
        stem = `Trong không gian $Oxyz$, cho ba điểm $A${P3(A)}$, $B${P3(B)}$, $C${P3(C)}$. Tích vô hướng $\\overrightarrow{AB}\\cdot\\overrightarrow{AC}$ bằng`;
      }
      need(n2(u) > 0 && n2(v) > 0);
      const d = dot3(u, v);
      const wrong = [`$${P3(u.map((x, i) => x * v[i]))}$`, `$${u[0] * v[0] + u[1] * v[1] - u[2] * v[2]}$`, `$${-d}$`, `$${u.reduce((s, x, i) => s + Math.abs(x * v[i]), 0)}$`, `$${d + 2}$`];
      return {
        stem, ...mcq(r, `$${d}$`, wrong),
        explanation: `${nu.startsWith("\\over") ? `$\\overrightarrow{AB} = ${P3(u)}$, $\\overrightarrow{AC} = ${P3(v)}$. ` : ""}$${nu}\\cdot ${nv} = ${dotExpl(u, v)} = ${d}$.`,
      };
    },
  },
  {
    id: "t12-hinh-binh-hanh-dinh-thu-tu", subject: S, grade: G, chapter: C2, topic: "Tìm đỉnh thứ tư của hình bình hành",
    half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const A = vec3(r), B = vec3(r), C = vec3(r);
      const u = sub3(B, A), v = sub3(C, A);
      need(n2([u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]) > 0);
      const abcd = r.chance(0.6);
      const D = abcd ? sub3(add3(A, C), B) : sub3(add3(B, C), A);
      const other = abcd ? sub3(add3(B, C), A) : sub3(add3(A, C), B);
      const name = abcd ? "ABCD" : "ABDC";
      return {
        stem: `Trong không gian $Oxyz$, cho ba điểm $A${P3(A)}$, $B${P3(B)}$, $C${P3(C)}$. Tọa độ điểm $D$ để $${name}$ là hình bình hành là`,
        ...mcq(r, `$${P3(D)}$`, [`$${P3(other)}$`, `$${P3(sub3(add3(A, B), C))}$`, `$${P3f(abcd ? add3(A, C) : add3(B, C), 2)}$`]),
        explanation: abcd
          ? `$ABCD$ là hình bình hành $\\Leftrightarrow \\overrightarrow{AD} = \\overrightarrow{BC} = ${P3(sub3(C, B))}$ nên $D = ${P3(D)}$.`
          : `$ABDC$ là hình bình hành $\\Leftrightarrow \\overrightarrow{CD} = \\overrightarrow{AB} = ${P3(u)}$ nên $D = ${P3(D)}$.`,
      };
    },
  },
  {
    id: "t12-do-dai-vecto-khoang-cach", subject: S, grade: G, chapter: C2, topic: "Độ dài vectơ, khoảng cách hai điểm",
    half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const A = vec3(r), B = vec3(r), d = sub3(B, A), s = n2(d);
      need(s > 0 && s <= 99);
      const absSum = d.reduce((t, x) => t + Math.abs(x), 0);
      const sumAB = n2(add3(A, B));
      need(sumAB > 0);
      const vec = r.chance(0.35);
      return {
        stem: vec ? `Trong không gian $Oxyz$, độ dài của vectơ $\\vec{u} = ${P3(d)}$ bằng` : `Trong không gian $Oxyz$, cho hai điểm $A${P3(A)}$ và $B${P3(B)}$. Độ dài đoạn thẳng $AB$ bằng`,
        ...mcq(r, `$${sqrtTex(s)}$`, [`$${sqrtTex(absSum)}$`, `$${s}$`, vec ? `$${absSum}$` : `$${sqrtTex(sumAB)}$`, `$${sqrtTex(s + 1)}$`]),
        explanation: `${vec ? "" : `$\\overrightarrow{AB} = ${P3(d)}$, `}$${vec ? "|\\vec{u}|" : "AB"} = \\sqrt{${d.map((x) => `${nm(x)}^2`).join(" + ")}} = \\sqrt{${s}}${sqrtTex(s) === `\\sqrt{${s}}` ? "" : ` = ${sqrtTex(s)}`}$.`,
      };
    },
  },
  {
    id: "t12-hinh-chieu-doi-xung-diem", subject: S, grade: G, chapter: C2, topic: "Hình chiếu, điểm đối xứng qua mặt phẳng tọa độ / trục / gốc",
    half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const TR: [string, (v: number[]) => number[], string][] = [
        ["hình chiếu vuông góc của điểm $M$ trên mặt phẳng $(Oxy)$", (v) => [v[0], v[1], 0], "giữ hoành độ, tung độ, cho cao độ bằng $0$"],
        ["hình chiếu vuông góc của điểm $M$ trên mặt phẳng $(Oyz)$", (v) => [0, v[1], v[2]], "cho hoành độ bằng $0$"],
        ["hình chiếu vuông góc của điểm $M$ trên mặt phẳng $(Oxz)$", (v) => [v[0], 0, v[2]], "cho tung độ bằng $0$"],
        ["hình chiếu vuông góc của điểm $M$ trên trục $Ox$", (v) => [v[0], 0, 0], "chỉ giữ hoành độ"],
        ["hình chiếu vuông góc của điểm $M$ trên trục $Oy$", (v) => [0, v[1], 0], "chỉ giữ tung độ"],
        ["hình chiếu vuông góc của điểm $M$ trên trục $Oz$", (v) => [0, 0, v[2]], "chỉ giữ cao độ"],
        ["điểm đối xứng với $M$ qua mặt phẳng $(Oxy)$", (v) => [v[0], v[1], -v[2]], "đổi dấu cao độ"],
        ["điểm đối xứng với $M$ qua mặt phẳng $(Oyz)$", (v) => [-v[0], v[1], v[2]], "đổi dấu hoành độ"],
        ["điểm đối xứng với $M$ qua gốc tọa độ $O$", (v) => [-v[0], -v[1], -v[2]], "đổi dấu cả ba tọa độ"],
        ["điểm đối xứng với $M$ qua trục $Ox$", (v) => [v[0], -v[1], -v[2]], "giữ hoành độ, đổi dấu tung độ và cao độ"],
      ];
      const M = r.shuffle([1, 2, 3, 4, 5, 6]).slice(0, 3).map((x) => (r.chance(0.5) ? -x : x));
      const k = r.int(0, TR.length - 1);
      const right = `$${P3(TR[k][1](M))}$`;
      const wrong = r.shuffle(TR.filter((_, i) => i !== k).map((t) => `$${P3(t[1](M))}$`));
      return {
        stem: `Trong không gian $Oxyz$, cho điểm $M${P3(M)}$. Tọa độ ${TR[k][0]} là`,
        ...mcq(r, right, wrong),
        explanation: `Để tìm ${TR[k][0]} ta ${TR[k][2]}: kết quả là ${right}.`,
      };
    },
  },
  {
    id: "t12-goc-giua-hai-vecto", subject: S, grade: G, chapter: C2, topic: "Góc giữa hai vectơ theo tọa độ",
    half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const { u, v, th, cosT } = niceAngle(r);
      const wrong = [180 - th, ...r.shuffle([30, 45, 60, 90, 120, 135, 150])].filter((x) => x !== th).map((x) => `$${x}^\\circ$`);
      return {
        stem: `Trong không gian $Oxyz$, cho hai vectơ $\\vec{u} = ${P3(u)}$ và $\\vec{v} = ${P3(v)}$. Góc giữa hai vectơ $\\vec{u}$ và $\\vec{v}$ bằng`,
        ...mcq(r, `$${th}^\\circ$`, wrong),
        explanation: angExpl(u, v, cosT, th),
      };
    },
  },
  {
    id: "t12-ghep-nhom-khoang-bien-thien", subject: S, grade: G, chapter: C3, topic: "Khoảng biến thiên của mẫu số liệu ghép nhóm",
    half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const g = gd(r), R = g.k * g.h, u = g.c.unit;
      const last = g.lows[g.k - 1] + g.h;
      const wrong = [(g.k - 1) * g.h, g.h, Math.max(...g.f) - Math.min(...g.f), last].map((x) => `$${x}$ ${u}`);
      return {
        stem: `${gdStem(g)}\nKhoảng biến thiên của mẫu số liệu ghép nhóm trên là`,
        ...mcq(r, `$${R}$ ${u}`, wrong),
        explanation: `Khoảng biến thiên bằng đầu mút phải của nhóm cuối trừ đầu mút trái của nhóm đầu: $R = ${last} - ${g.lows[0]} = ${R}$ (${u}).`,
      };
    },
  },
  {
    id: "t12-ghep-nhom-tu-phan-vi", subject: S, grade: G, chapter: C3, topic: "Tứ phân vị và khoảng tứ phân vị của mẫu ghép nhóm",
    half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const g = gd(r), q1 = quart(g, 1), q2 = quart(g, 2), q3 = quart(g, 3);
      const noCF = (q: { i: number; t: number }) => g.lows[q.i] + (q.t / g.f[q.i]) * g.h;
      const ask = r.int(0, 2);
      const F = (x: number) => `$${tex(round(x, 2))}$`;
      let right: string, wrong: string[], name: string, ex: string;
      if (ask === 0) { name = "Tứ phân vị thứ nhất $Q_1$"; right = F(q1.Q); wrong = [F(q3.Q), F(noCF(q1)), F(q2.Q), F(q3.Q - q1.Q)]; ex = `${q1.expl}.`; }
      else if (ask === 1) { name = "Tứ phân vị thứ ba $Q_3$"; right = F(q3.Q); wrong = [F(q1.Q), F(noCF(q3)), F(q2.Q), F(q3.Q - q1.Q)]; ex = `${q3.expl}.`; }
      else { name = "Khoảng tứ phân vị $\\Delta_Q$"; right = F(round(q3.Q, 2) - round(q1.Q, 2)); wrong = [F(noCF(q3) - noCF(q1)), F((q3.Q - q1.Q) / 2), F(g.k * g.h), F(q3.Q)]; ex = `${q1.expl}; ${q3.expl}. Vậy $\\Delta_Q = Q_3 - Q_1 \\approx ${tex(round(q3.Q, 2) - round(q1.Q, 2))}$.`; }
      return {
        stem: `${gdStem(g)}\n${name} của mẫu số liệu ghép nhóm trên (làm tròn đến hàng phần trăm) là`,
        ...mcq(r, right, wrong),
        explanation: `Cỡ mẫu $n = ${g.n}$. ${ex}`,
      };
    },
  },
  {
    id: "t12-ghep-nhom-phuong-sai", subject: S, grade: G, chapter: C3, topic: "Phương sai, độ lệch chuẩn của mẫu ghép nhóm",
    half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const g = gd(r), st = stats(g);
      need(st.v > 0.5);
      const askV = r.chance(0.5);
      const F = (x: number) => `$${tex(round(x, 2))}$`;
      const vb = (st.v * g.n) / (g.n - 1);
      const right = askV ? F(st.v) : F(st.s);
      const wrong = askV ? [F(st.s), F(vb), F(st.mad), F(st.v * st.v)] : [F(st.v), F(Math.sqrt(vb)), F(st.mad), F(st.s / 2)];
      return {
        stem: `${gdStem(g)}\n${askV ? "Phương sai" : "Độ lệch chuẩn"} của mẫu số liệu ghép nhóm trên (làm tròn đến hàng phần trăm) là`,
        ...mcq(r, right, wrong),
        explanation: `${st.expl}.`,
      };
    },
  },
  {
    id: "t12-phan-tan-ly-thuyet", subject: S, grade: G, chapter: C3, topic: "Ý nghĩa các số đặc trưng đo mức độ phân tán",
    half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const T = [
        "Khoảng biến thiên của mẫu số liệu ghép nhóm bằng hiệu giữa đầu mút phải của nhóm cuối cùng và đầu mút trái của nhóm đầu tiên.",
        "Khoảng tứ phân vị của mẫu số liệu ghép nhóm bằng $Q_3 - Q_1$.",
        "Độ lệch chuẩn bằng căn bậc hai số học của phương sai.",
        "Khoảng tứ phân vị phản ánh mức độ phân tán của nửa giữa mẫu số liệu (khoảng 50% số liệu chính giữa).",
        "Phương sai càng lớn thì các giá trị của mẫu số liệu càng phân tán quanh số trung bình.",
        "Độ lệch chuẩn có cùng đơn vị đo với số liệu.",
        "Khoảng biến thiên dễ bị ảnh hưởng bởi các giá trị bất thường của mẫu số liệu.",
      ];
      const F = [
        "Khoảng tứ phân vị của mẫu số liệu ghép nhóm bằng $Q_3 + Q_1$.",
        "Khoảng tứ phân vị của mẫu số liệu ghép nhóm bằng $\\dfrac{Q_3 - Q_1}{2}$.",
        "Độ lệch chuẩn bằng bình phương của phương sai.",
        "Phương sai có cùng đơn vị đo với số liệu.",
        "Độ lệch chuẩn có thể nhận giá trị âm.",
        "Khoảng tứ phân vị luôn lớn hơn khoảng biến thiên của cùng một mẫu số liệu.",
        "Phương sai càng nhỏ thì các giá trị của mẫu số liệu càng phân tán.",
      ];
      if (r.chance(0.45)) {
        const ty = r.int(0, 2);
        if (ty === 0) {
          const s0 = r.pick([1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 1.2, 1.4]), v = round(s0 * s0, 2);
          return {
            stem: `Một mẫu số liệu ghép nhóm có phương sai $s^2 = ${tex(v)}$. Độ lệch chuẩn của mẫu số liệu đó bằng`,
            ...mcq(r, `$${tex(s0)}$`, [`$${tex(v / 2)}$`, `$${tex(round(v * v, 2))}$`, `$${tex(s0 / 2)}$`, `$${tex(s0 * 2)}$`]),
            explanation: `Độ lệch chuẩn là căn bậc hai số học của phương sai: $s = \\sqrt{${tex(v)}} = ${tex(s0)}$.`,
          };
        }
        if (ty === 1) {
          const q1 = r.int(20, 160) / 2, d = r.int(4, 40) / 2, q3 = q1 + d;
          return {
            stem: `Một mẫu số liệu ghép nhóm có tứ phân vị thứ nhất $Q_1 = ${tex(q1)}$ và tứ phân vị thứ ba $Q_3 = ${tex(q3)}$. Khoảng tứ phân vị của mẫu số liệu đó bằng`,
            ...mcq(r, `$${tex(d)}$`, [`$${tex(q1 + q3)}$`, `$${tex(d / 2)}$`, `$${tex((q1 + q3) / 2)}$`]),
            explanation: `$\\Delta_Q = Q_3 - Q_1 = ${tex(q3)} - ${tex(q1)} = ${tex(d)}$.`,
          };
        }
        const l0 = r.int(1, 30) * 5, h = r.pick([2, 5, 10]), k = r.int(5, 8);
        return {
          stem: `Một mẫu số liệu ghép nhóm có ${k} nhóm với độ dài mỗi nhóm bằng nhau; nhóm đầu tiên là $[${l0};${l0 + h})$ và nhóm cuối cùng là $[${l0 + (k - 1) * h};${l0 + k * h})$. Khoảng biến thiên của mẫu số liệu là`,
          ...mcq(r, `$${k * h}$`, [`$${(k - 1) * h}$`, `$${h}$`, `$${l0 + k * h}$`, `$${(k + 1) * h}$`]),
          explanation: `$R = ${l0 + k * h} - ${l0} = ${k * h}$ (đầu mút phải nhóm cuối trừ đầu mút trái nhóm đầu).`,
        };
      }
      const askTrue = r.chance(0.5);
      const right = r.pick(askTrue ? T : F);
      const wrong = r.shuffle([...(askTrue ? F : T)]);
      const lead = r.pick(["Khẳng định nào sau đây là", "Phát biểu nào sau đây là", "Trong các khẳng định sau về các số đặc trưng đo mức độ phân tán của mẫu số liệu ghép nhóm, khẳng định nào"]);
      return {
        stem: `${lead} ${askTrue ? "đúng" : "sai"}?`,
        ...mcq(r, right, wrong),
        explanation: askTrue
          ? `Khẳng định đúng: ${right} Ghi nhớ: $R = $ đầu mút phải nhóm cuối $-$ đầu mút trái nhóm đầu; $\\Delta_Q = Q_3 - Q_1$; $s = \\sqrt{s^2}$, phương sai có đơn vị là bình phương đơn vị của số liệu.`
          : `Khẳng định sai: ${right} Ghi nhớ: $\\Delta_Q = Q_3 - Q_1 \\le R$; $s = \\sqrt{s^2} \\ge 0$ cùng đơn vị với số liệu; phương sai càng lớn thì số liệu càng phân tán.`,
      };
    },
  },

  /* ---------- Đúng/Sai ---------- */
  {
    id: "t12-tf-ba-diem-oxyz", subject: S, grade: G, chapter: C2, topic: "Biểu thức tọa độ: ba điểm trong không gian",
    half: 2, level: 2, kind: "tf",
    make: (r) => {
      const A = vec3(r), B = vec3(r), Gc = vec3(r, -3, 3), C = sub3(sub3(mul3(3, Gc), A), B);
      need(C.every((x) => Math.abs(x) <= 8) && n2(Gc) > 0);
      const AB = sub3(B, A), AC = sub3(C, A);
      need(n2([AB[1] * AC[2] - AB[2] * AC[1], AB[2] * AC[0] - AB[0] * AC[2], AB[0] * AC[1] - AB[1] * AC[0]]) > 0);
      const d = dot3(AB, AC), D = sub3(add3(A, C), B);
      const t1 = r.chance(0.5), t2 = r.chance(0.5), t3 = r.chance(0.5), t4 = r.chance(0.5);
      return {
        stem: `Trong không gian $Oxyz$, cho ba điểm $A${P3(A)}$, $B${P3(B)}$, $C${P3(C)}$.`,
        ...tf([
          [`$\\overrightarrow{AB} = ${P3(t1 ? AB : mul3(-1, AB))}$.`, t1],
          [`Trọng tâm của tam giác $ABC$ là $G${P3(t2 ? Gc : mul3(3, Gc))}$.`, t2],
          [`$\\overrightarrow{AB}\\cdot\\overrightarrow{AC} = ${t3 ? d : d !== 0 ? -d : n2(AB)}$.`, t3],
          [`Điểm $D${P3(t4 ? D : sub3(add3(B, C), A))}$ thỏa mãn $ABCD$ là hình bình hành.`, t4],
        ]),
        explanation: `a) ${tick(t1)}: $\\overrightarrow{AB} = (x_B - x_A; y_B - y_A; z_B - z_A) = ${P3(AB)}$. b) ${tick(t2)}: $G = \\left(\\dfrac{${3 * Gc[0]}}{3};\\dfrac{${3 * Gc[1]}}{3};\\dfrac{${3 * Gc[2]}}{3}\\right) = ${P3(Gc)}$. c) ${tick(t3)}: $\\overrightarrow{AC} = ${P3(AC)}$, $\\overrightarrow{AB}\\cdot\\overrightarrow{AC} = ${dotExpl(AB, AC)} = ${d}$. d) ${tick(t4)}: $ABCD$ là hình bình hành $\\Leftrightarrow \\overrightarrow{AD} = \\overrightarrow{BC}$ $\\Leftrightarrow D = A + C - B = ${P3(D)}$.`,
      };
    },
  },
  {
    id: "t12-tf-hinh-hop-chu-nhat-vecto", subject: S, grade: G, chapter: C2, topic: "Vectơ, tích vô hướng trong hình hộp chữ nhật",
    half: 2, level: 2, kind: "tf",
    make: (r) => {
      const cube = r.chance(0.4);
      const [a, b, c] = cube ? (() => { const s = r.int(1, 4); return [s, s, s]; })() : [r.int(1, 5), r.int(1, 5), r.int(1, 5)];
      need(cube || new Set([a, b, c]).size >= 2);
      const P = (n: string) => [HV[n][0] * a, HV[n][1] * b, HV[n][2] * c];
      const V = (X: string, Y: string) => sub3(P(Y), P(X));
      const pickPair = () => { const [X, Y] = r.shuffle([...HN]); const [Z, W] = r.shuffle([...HN]); return [X, Y, Z, W]; };
      const prs = [pickPair(), pickPair()];
      need(prs[0].join() !== prs[1].join());
      const diag = r.pick([["A", "C'"], ["B", "D'"], ["C", "A'"], ["D", "B'"]]);
      const s2 = a * a + b * b + c * c;
      const t1 = r.chance(0.5), t2 = r.chance(0.5), t3 = r.chance(0.5), t4 = r.chance(0.5);
      const dv = prs.map(([X, Y, Z, W]) => dot3(V(X, Y), V(Z, W)));
      const mut = (d: number) => (d !== 0 ? -d : a * a + 1);
      const h4 = hhStmt(r, t4);
      const dl = (k: number, t: boolean) => { const [X, Y, Z, W] = prs[k]; return `$${ov(X, Y)}\\cdot${ov(Z, W)} = ${t ? dv[k] : mut(dv[k])}$.`; };
      const intro = cube ? `Cho hình lập phương $ABCD.A'B'C'D'$ có cạnh bằng $${a}$.` : `Cho hình hộp chữ nhật $ABCD.A'B'C'D'$ có $AB = ${a}$, $AD = ${b}$, $AA' = ${c}$.`;
      return {
        stem: intro,
        ...tf([
          [`Độ dài đoạn thẳng $${diag[0]}${diag[1]}$ bằng $${t1 ? sqrtTex(s2) : a + b + c}$.`, t1],
          [dl(0, t2), t2],
          [dl(1, t3), t3],
          [`${h4.s.slice(0, -1)}$.`, t4],
        ]),
        explanation: `Chọn hệ trục $Oxyz$ với $A$ là gốc, $B(${a};0;0)$, $D(0;${b};0)$, $A'(0;0;${c})$. a) ${tick(t1)}: $${diag[0]}${diag[1]} = \\sqrt{${a}^2 + ${b}^2 + ${c}^2} = ${sqrtTex(s2)}$. ${[0, 1].map((k) => { const [X, Y, Z, W] = prs[k]; return `${k ? "c" : "b"}) ${tick(k ? t3 : t2)}: $${ov(X, Y)} = ${P3(V(X, Y))}$, $${ov(Z, W)} = ${P3(V(Z, W))}$ nên tích vô hướng bằng $${dv[k]}$.`; }).join(" ")} d) ${tick(t4)}: đẳng thức đúng là ${h4.ok} (${h4.why}).`,
      };
    },
  },
  {
    id: "t12-tf-mau-ghep-nhom", subject: S, grade: G, chapter: C3, topic: "Các số đặc trưng của mẫu số liệu ghép nhóm",
    half: 2, level: 3, kind: "tf",
    make: (r) => {
      const g = gd(r), q1 = quart(g, 1), st = stats(g), u = g.c.unit;
      const t1 = r.chance(0.5), t2 = r.chance(0.5), t3 = r.chance(0.5), t4 = r.chance(0.5);
      const gi = t2 ? q1.i : q1.i + 1 < g.k ? q1.i + 1 : q1.i - 1;
      const m3 = t3 ? st.mean : st.mean - g.h / 2, s4 = t4 ? st.s : st.v;
      need(Math.abs(st.v - st.s) > 0.1);
      return {
        stem: gdStem(g),
        ...tf([
          [`Khoảng biến thiên của mẫu số liệu là $${t1 ? g.k * g.h : (g.k - 1) * g.h}$ ${u}.`, t1],
          [`Tứ phân vị thứ nhất $Q_1$ thuộc nhóm $[${g.lows[gi]};${g.lows[gi] + g.h})$.`, t2],
          [`Số trung bình của mẫu số liệu xấp xỉ bằng $${tex(round(m3, 2))}$ ${u} (làm tròn đến hàng phần trăm).`, t3],
          [`Độ lệch chuẩn của mẫu số liệu xấp xỉ bằng $${tex(round(s4, 2))}$ ${u} (làm tròn đến hàng phần trăm).`, t4],
        ]),
        explanation: `a) ${tick(t1)}: $R = ${g.lows[g.k - 1] + g.h} - ${g.lows[0]} = ${g.k * g.h}$. b) ${tick(t2)}: ${q1.expl}. c), d) ${st.expl}. Vậy c) ${tick(t3)} (nếu dùng đầu mút trái thay cho giá trị đại diện sẽ được $${tex(round(st.mean - g.h / 2, 2))}$), d) ${tick(t4)} (phương sai là $${tex(round(st.v, 2))}$).`,
      };
    },
  },
  {
    id: "t12-tf-flycam-toa-do", subject: S, grade: G, chapter: C2, topic: "Ứng dụng tọa độ: chuyển động thẳng đều trong không gian",
    half: 2, level: 3, kind: "tf",
    make: (r) => {
      const qd = r.pick(QUAD), L = qd[3];
      const pr = r.shuffle([qd[0], qd[1], qd[2]]).map((x) => (r.chance(0.5) ? -x : x));
      const k = r.int(2, 5), tau = r.int(2, 5), j = r.int(1, k - 1);
      const A = [r.int(0, 50), r.int(0, 50), r.int(20, 60)], AB = mul3(k, pr), B = add3(A, AB);
      need(B[2] >= 10 && B[2] <= 150);
      const T = k * tau, t = j * tau, M = add3(A, mul3(j, pr));
      const who = r.pick(["Một flycam", "Một máy bay không người lái", "Một thiết bị bay giao hàng", "Một khinh khí cầu điều khiển từ xa"]);
      const t1 = r.chance(0.5), t2 = r.chance(0.5), t3 = r.chance(0.5), t4 = r.chance(0.5);
      const mutM = [add3(A, mul3(t, pr)), sub3(A, mul3(j, pr)), add3(A, mul3(j + 1, pr))].find((v) => !eq3(v, M))!;
      const spd = L / tau, mutS = r.pick([(k * L) / tau, L / T, (k * L) / T].filter((x) => Math.abs(x - spd) > 1e-9));
      const sumAbs = k * (Math.abs(pr[0]) + Math.abs(pr[1]) + Math.abs(pr[2]));
      return {
        stem: `Trong không gian $Oxyz$ (đơn vị trên mỗi trục là mét), mặt đất là mặt phẳng $(Oxy)$. ${who} bay thẳng đều từ điểm $A${P3(A)}$ đến điểm $B${P3(B)}$ hết $${T}$ giây.`,
        ...tf([
          [`$\\overrightarrow{AB} = ${P3(t1 ? AB : mul3(-1, AB))}$.`, t1],
          [`Quãng đường bay từ $A$ đến $B$ dài $${t2 ? k * L : sumAbs}$ m.`, t2],
          [`Sau $${t}$ giây kể từ khi xuất phát, nó ở vị trí có tọa độ $${P3(t3 ? M : mutM)}$ và cách mặt đất $${t3 ? M[2] : mutM[2]}$ m.`, t3 && M[2] > 0],
          [`Tốc độ bay là $${tex(t4 ? spd : mutS)}$ m/s.`, t4],
        ]),
        explanation: `a) ${tick(t1)}: $\\overrightarrow{AB} = B - A = ${P3(AB)}$. b) ${tick(t2)}: $AB = \\sqrt{${AB.map((x) => `${nm(x)}^2`).join(" + ")}} = ${k * L}$ (m). c) ${tick(t3 && M[2] > 0)}: sau $${t}$ giây nó đi được $\\dfrac{${t}}{${T}} = ${frac(j, k)}$ quãng đường, $\\overrightarrow{AM} = ${frac(j, k)}\\overrightarrow{AB} = ${P3(mul3(j, pr))}$ nên $M${P3(M)}$, cách mặt đất $${M[2]}$ m. d) ${tick(t4)}: tốc độ $v = \\dfrac{${k * L}}{${T}} = ${tex(spd)}$ (m/s).`,
      };
    },
  },

  /* ---------- Trả lời ngắn ---------- */
  {
    id: "t12-sh-diem-tren-truc-cach-deu", subject: S, grade: G, chapter: C2, topic: "Điểm trên trục tọa độ cách đều hai điểm",
    half: 2, level: 3, kind: "short",
    make: (r) => {
      const ax = r.int(0, 2), A = vec3(r), B = vec3(r);
      need(A[ax] !== B[ax]);
      const num = n2(B) - n2(A), den = 2 * (B[ax] - A[ax]);
      need(num % den === 0);
      const x = num / den;
      const axis = ["Ox", "Oy", "Oz"][ax], coordName = ["hoành độ", "tung độ", "cao độ"][ax];
      const Mv = [0, 0, 0]; Mv[ax] = x;
      const Mt = ["(t;0;0)", "(0;t;0)", "(0;0;t)"][ax];
      return {
        stem: r.pick([
          `Trong không gian $Oxyz$, cho hai điểm $A${P3(A)}$ và $B${P3(B)}$. Điểm $M$ thuộc trục $${axis}$ thỏa mãn $MA = MB$. Tìm ${coordName} của $M$.`,
          `Trong không gian $Oxyz$, cho hai điểm $A${P3(A)}$ và $B${P3(B)}$. Tìm ${coordName} của điểm $M$ nằm trên trục $${axis}$ và cách đều hai điểm $A$, $B$.`,
        ]),
        ...short(x),
        explanation: `Gọi $M${Mt}$. $MA^2 = MB^2 \\Leftrightarrow ${[0, 1, 2].map((i) => (i === ax ? (A[i] ? `(t${term(-A[i])})^2` : "t^2") : `${nm(A[i])}^2`)).join(" + ")} = ${[0, 1, 2].map((i) => (i === ax ? (B[i] ? `(t${term(-B[i])})^2` : "t^2") : `${nm(B[i])}^2`)).join(" + ")} \\Leftrightarrow ${den}t = ${num} \\Leftrightarrow t = ${x}$. Vậy $M${P3(Mv)}$.`,
      };
    },
  },
  {
    id: "t12-sh-goc-hai-vecto-do", subject: S, grade: G, chapter: C2, topic: "Số đo góc giữa hai vectơ",
    half: 2, level: 1, kind: "short",
    make: (r) => {
      const { u, v, th, cosT } = niceAngle(r);
      return {
        stem: `Trong không gian $Oxyz$, cho $\\vec{u} = ${P3(u)}$ và $\\vec{v} = ${P3(v)}$. Góc giữa hai vectơ $\\vec{u}$ và $\\vec{v}$ bằng bao nhiêu độ?`,
        ...short(th), explanation: angExpl(u, v, cosT, th),
      };
    },
  },
  {
    id: "t12-sh-tich-vo-huong-hinh-hop", subject: S, grade: G, chapter: C2, topic: "Tích vô hướng trong hình lập phương / hình hộp chữ nhật",
    half: 2, level: 2, kind: "short",
    make: (r) => {
      const cube = r.chance(0.5);
      const [a, b, c] = cube ? (() => { const s = r.int(1, 6); return [s, s, s]; })() : [r.int(1, 5), r.int(1, 5), r.int(1, 5)];
      const P = (n: string) => [HV[n][0] * a, HV[n][1] * b, HV[n][2] * c];
      const [X, Y] = r.shuffle([...HN]), [Z, W] = r.shuffle([...HN]);
      need(!(X === Z && Y === W));
      const u = sub3(P(Y), P(X)), v = sub3(P(W), P(Z)), d = dot3(u, v);
      need(d !== 0 || r.chance(0.1));
      return {
        stem: `${cube ? `Cho hình lập phương $ABCD.A'B'C'D'$ có cạnh bằng $${a}$.` : `Cho hình hộp chữ nhật $ABCD.A'B'C'D'$ có $AB = ${a}$, $AD = ${b}$, $AA' = ${c}$.`} Tính tích vô hướng $${ov(X, Y)}\\cdot${ov(Z, W)}$.`,
        ...short(d),
        explanation: `Chọn hệ trục $Oxyz$ có gốc $A$, $B(${a};0;0)$, $D(0;${b};0)$, $A'(0;0;${c})$. Khi đó ${[...new Set([X, Y, Z, W])].map((n) => `$${n}${P3(P(n))}$`).join(", ")}; $${ov(X, Y)} = ${P3(u)}$, $${ov(Z, W)} = ${P3(v)}$ nên tích vô hướng bằng $${dotExpl(u, v)} = ${d}$.`,
      };
    },
  },
  {
    id: "t12-sh-tham-so-vecto", subject: S, grade: G, chapter: C2, topic: "Tìm tham số: vuông góc, cùng phương, độ dài",
    half: 2, level: 2, kind: "short",
    make: (r) => {
      const form = r.int(0, 2);
      if (form === 0) {
        const a = vec3(r, -3, 3), al = [r.pick([0, 1, -1, 2]), r.pick([0, 1, -1, 2]), r.pick([0, 1, -1])], be = vec3(r, -4, 4);
        const den = dot3(a, al), num = -dot3(a, be);
        need(den !== 0 && num % den === 0 && al.filter((x) => x !== 0).length >= 1);
        const m = num / den; need(Math.abs(m) <= 20);
        const bs = al.map((x, i) => lin(x, be[i], "m"));
        return {
          stem: `Trong không gian $Oxyz$, cho $\\vec{a} = ${P3(a)}$ và $\\vec{b} = (${bs.join(";")})$. Tìm giá trị của tham số $m$ để $\\vec{a} \\perp \\vec{b}$.`,
          ...short(m),
          explanation: `$\\vec{a} \\perp \\vec{b} \\Leftrightarrow \\vec{a}\\cdot\\vec{b} = 0 \\Leftrightarrow ${a.map((x, i) => `${nm(x)}(${bs[i]})`).join(" + ")} = 0 \\Leftrightarrow ${poly([den, -num], "m")} = 0 \\Leftrightarrow m = ${m}$.`,
        };
      }
      if (form === 1) {
        const a = vec3(r, -3, 3); need(a[0] !== 0);
        const k = r.pick([-3, -2, 2, 3]), m = k * a[1], n = k * a[2];
        const plus = r.chance(0.6);
        return {
          stem: `Trong không gian $Oxyz$, cho $\\vec{a} = ${P3(a)}$ và $\\vec{b} = (${k * a[0]};m;n)$. Biết $\\vec{a}$ và $\\vec{b}$ cùng phương. Tính $${plus ? "m + n" : "m - n"}$.`,
          ...short(plus ? m + n : m - n),
          explanation: `$\\vec{b}$ cùng phương với $\\vec{a}$ $\\Leftrightarrow \\vec{b} = k\\vec{a}$. Từ hoành độ: $k = \\dfrac{${k * a[0]}}{${a[0]}} = ${k}$, suy ra $m = ${k}\\cdot ${nm(a[1])} = ${m}$, $n = ${k}\\cdot ${nm(a[2])} = ${n}$. Vậy $${plus ? "m + n" : "m - n"} = ${plus ? m + n : m - n}$.`,
        };
      }
      const qd = r.pick(QUAD), L = qd[3], idx = r.int(0, 2), m = qd[idx];
      const others = qd.slice(0, 3).filter((_, i) => i !== idx).map((x) => (r.chance(0.5) ? -x : x));
      const pos = r.int(0, 2); const comps = [...others]; comps.splice(pos, 0, NaN);
      const show = comps.map((x) => (Number.isNaN(x) ? "m" : String(x)));
      return {
        stem: `Trong không gian $Oxyz$, cho vectơ $\\vec{u} = (${show.join(";")})$ với $m > 0$. Tìm $m$ để $|\\vec{u}| = ${L}$.`,
        ...short(m),
        explanation: `$|\\vec{u}|^2 = m^2 + ${others.map((x) => `${nm(x)}^2`).join(" + ")} = ${L * L} \\Leftrightarrow m^2 = ${m * m}$, mà $m > 0$ nên $m = ${m}$.`,
      };
    },
  },
  {
    id: "t12-sh-khoang-tu-phan-vi", subject: S, grade: G, chapter: C3, topic: "Tính khoảng tứ phân vị của mẫu ghép nhóm",
    half: 2, level: 3, kind: "short",
    make: (r) => {
      const g = gd(r), q1 = quart(g, 1), q3 = quart(g, 3), D = q3.Q - q1.Q, dp: number = 1;
      need(round(D, 1) === round(round(q3.Q, 2) - round(q1.Q, 2), 1));
      return {
        stem: `${gdStem(g)}\nTính khoảng tứ phân vị của mẫu số liệu ghép nhóm trên (đơn vị: ${g.c.unit}; làm tròn kết quả đến hàng ${dp === 2 ? "phần trăm" : "phần mười"}).`,
        ...short(D, dp),
        explanation: `Cỡ mẫu $n = ${g.n}$. ${q1.expl}; ${q3.expl}. Vậy $\\Delta_Q = Q_3 - Q_1 \\approx ${tex(D, dp)}$.`,
      };
    },
  },
  {
    id: "t12-sh-phuong-sai-do-lech-chuan", subject: S, grade: G, chapter: C3, topic: "Tính phương sai / độ lệch chuẩn của mẫu ghép nhóm",
    half: 2, level: 3, kind: "short",
    make: (r) => {
      const g = gd(r), st = stats(g), askS = r.chance(0.6);
      const x = askS ? st.s : st.v, dp = x < 10 ? 2 : 1;
      const mr = round(st.mean, 2), v2 = st.v + st.mean * st.mean - mr * mr, alt = askS ? Math.sqrt(v2) : v2;
      need(round(alt, dp) === round(x, dp));
      return {
        stem: `${gdStem(g)}\nTính ${askS ? "độ lệch chuẩn" : "phương sai"} của mẫu số liệu ghép nhóm trên (làm tròn kết quả đến hàng ${dp === 2 ? "phần trăm" : "phần mười"}).`,
        ...short(x, dp),
        explanation: `${st.expl}. Đáp số: ${vn(x, dp)}.`,
      };
    },
  },
];

export const TEMPLATES: Template[] = [...H1, ...H2];
export default TEMPLATES;
