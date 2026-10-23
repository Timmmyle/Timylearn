/* Dạng bài có tham số – Toán 10, học kì 2 (Kết nối tri thức).
   half 1: Ch.VI Hàm số, đồ thị và ứng dụng; Ch.VII Phương pháp tọa độ trong mặt phẳng.
   half 2: Ch.VIII Đại số tổ hợp; Ch.IX Tính xác suất theo định nghĩa cổ điển. */
import { mcq, tf, short as shortCore, frac, vn as vnCore, need, sqrtTex, poly, term, coef, gcd, round, Retry, type Template, type Rng } from "./core.ts";

/* vn(x, 0) của core cắt nhầm số 0 cuối của số nguyên, nên dùng bản sửa như toan10.ts. */
const vn = (x: number, dp = 2) => vnCore(round(x, dp), Math.max(dp, 1));
const tex = (x: number, dp = 2) => vn(x, dp).replace(",", "{,}");
const short = (x: number, dp = 2) => shortCore(round(x, dp), Math.max(dp, 1));

const S = "Toán" as const, G = 10 as const;
const C6 = "Chương VI. Hàm số, đồ thị và ứng dụng";
const C7 = "Chương VII. Phương pháp tọa độ trong mặt phẳng";
const C8 = "Chương VIII. Đại số tổ hợp";
const C9 = "Chương IX. Tính xác suất theo định nghĩa cổ điển";
const B6 = { subject: S, grade: G, hk: 2 as const, chapter: C6, tk: "Toán|Hàm số bậc hai", half: 1 as const };
const B7 = { subject: S, grade: G, hk: 2 as const, chapter: C7, tk: "Toán|Tọa độ trong mặt phẳng", half: 1 as const };
const B8 = { subject: S, grade: G, hk: 2 as const, chapter: C8, tk: "Toán|Đại số tổ hợp", half: 2 as const };
const B9 = { subject: S, grade: G, hk: 2 as const, chapter: C9, tk: "Toán|Xác suất", half: 2 as const };

/* ====================== Tiện ích chung ====================== */
const rg = (a: number, b: number) => { const o: number[] = []; for (let i = a; i <= b; i++) o.push(i); return o; };
const setT = (xs: (number | string)[]) => (xs.length ? `\\{${xs.join(";\\ ")}\\}` : "\\varnothing");
const pt = (x: number | string, y: number | string) => `(${x};\\ ${y})`;
const M = (s: string | number) => `$${s}$`;
const isSq = (n: number) => n >= 0 && Math.round(Math.sqrt(n)) ** 2 === n;
const RR = "\\mathbb{R}";
/** số âm thì đặt trong ngoặc */
const pr = (n: number) => (n < 0 ? `(${n})` : `${n}`);
const PINF = "+\\infty", NINF = "-\\infty";

/** Biểu thức tuyến tính: linE([2,-3,1], ["x","y",""]) = "2x - 3y + 1" */
function linE(cs: number[], vs: string[]): string { let o = ""; cs.forEach((c, i) => { o += term(c, vs[i], o === ""); }); return o || "0"; }
const L = (a: number, b: number, c: number) => linE([a, b, c], ["x", "y", ""]);
/** Chuẩn hóa phương trình đường thẳng: chia ƯCLN, hệ số đầu dương */
function norm3(a: number, b: number, c: number): [number, number, number] {
  need(a !== 0 || b !== 0);
  const g = gcd(gcd(a, b), c), s = a < 0 || (a === 0 && b < 0) ? -1 : 1;
  return [(s * a) / g || 0, (s * b) / g || 0, (s * c) / g || 0];
}
const lineT = (a: number, b: number, c: number) => { const [p, q, s] = norm3(a, b, c); return `${L(p, q, s)} = 0`; };
/** (x - a)^2 */
const sh = (v: string, a: number) => (a === 0 ? `${v}^2` : `(${v}${term(-a)})^2`);
/** (x - a) hoặc x */
const shp = (v: string, a: number) => (a === 0 ? v : `(${v}${term(-a)})`);
const circ = (a: number, b: number, R2: number | string) => `${sh("x", a)} + ${sh("y", b)} = ${R2}`;
const circE = (a: number, b: number, c: number) => `x^2 + y^2${term(-2 * a, "x")}${term(-2 * b, "y")}${term(c)} = 0`;
const param = (x0: number, y0: number, u: number, v: number) => `\\begin{cases} x = ${linE([x0, u], ["", "t"])}\\\\ y = ${linE([y0, v], ["", "t"])}\\end{cases}`;
/** a(x - x0) + b(y - y0) = 0 dạng hiển thị */
const pnEq = (a: number, b: number, x0: number, y0: number) => `${coef(a)}${shp("x", x0)}${b < 0 ? " - " : " + "}${coef(Math.abs(b))}${shp("y", y0)} = 0`;

/** (p/q)·√m dạng LaTeX, rút gọn căn và phân số */
function radTex(p: number, q: number, m: number): string {
  need(q !== 0 && m >= 0 && Number.isInteger(m));
  if (p === 0 || m === 0) return "0";
  let a = 1, b = m;
  for (let k = 2; k * k <= b; k++) while (b % (k * k) === 0) { b /= k * k; a *= k; }
  p *= a;
  const g = gcd(p, q); p /= g; q /= g; if (q < 0) { p = -p; q = -q; }
  if (b === 1) return frac(p, q);
  const sg = p < 0 ? "-" : "", ap = Math.abs(p);
  const nu = (ap === 1 ? "" : ap) + `\\sqrt{${b}}`;
  return q === 1 ? sg + nu : `${sg}\\dfrac{${nu}}{${q}}`;
}

const ROUND = ["làm tròn kết quả đến hàng đơn vị", "làm tròn kết quả đến hàng phần mười", "làm tròn kết quả đến hàng phần trăm"];
function fit(x: number, maxDp = 2): { dp: number; note: string } {
  for (let dp = 0; dp <= maxDp; dp++) if (Math.abs(x * 10 ** dp - Math.round(x * 10 ** dp)) < 1e-9 && vn(x, dp).length <= 4) return { dp, note: "" };
  for (let dp = maxDp; dp >= 0; dp--) if (vn(x, dp).length <= 4) return { dp, note: ROUND[dp] };
  throw new Retry("fit");
}
const withNote = (note: string) => (note ? ` (${note})` : "");

/* ---------- Tổ hợp ---------- */
const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
const Ank = (n: number, k: number) => (k < 0 || k > n ? 0 : fact(n) / fact(n - k));
const Cnk = (n: number, k: number) => (k < 0 || k > n ? 0 : Ank(n, k) / fact(k));
const CT = (n: number | string, k: number | string) => `C_{${n}}^{${k}}`;
const AT = (n: number | string, k: number | string) => `A_{${n}}^{${k}}`;
/** Đếm số có k chữ số (chữ số đầu khác 0) lập từ tập D, thỏa ok */
function countNums(D: number[], k: number, distinct: boolean, ok: (ds: number[]) => boolean): number {
  let cnt = 0;
  const rec = (pre: number[]) => {
    if (pre.length === k) { if (ok(pre)) cnt++; return; }
    for (const d of D) { if (pre.length === 0 && d === 0) continue; if (distinct && pre.includes(d)) continue; rec([...pre, d]); }
  };
  rec([]); return cnt;
}
const over = (k: number) => `\\overline{${rg(1, k).map((i) => `a_${i}`).join("")}}`;

/* ====================== CÁC DẠNG BÀI ====================== */
export const TEMPLATES: Template[] = [
  /* ===================== CHƯƠNG VI – MCQ ===================== */
  {
    id: "t10k2-ham-so-tap-xac-dinh", ...B6, topic: "Tập xác định của hàm số", level: 1, kind: "mcq",
    make: (r) => {
      const t = r.int(0, 4), a = r.int(-6, 6);
      const ex = (s: string | number) => `${RR}\\setminus\\{${s}\\}`;
      const xa = linE([1, -a], ["x", ""]);
      let f: string, c: string, w: string[], why: string;
      if (t === 0) {
        const p = r.nz(-5, 5), q = r.int(-9, 9); need(q !== -p * a);
        f = `\\dfrac{${linE([p, q], ["x", ""])}}{${xa}}`; c = ex(a);
        w = [ex(-a), RR, `(${a};\\ ${PINF})`, `[${a};\\ ${PINF})`];
        why = `Hàm số xác định khi $${xa} \\ne 0 \\Leftrightarrow x \\ne ${a}$`;
      } else if (t === 1 || t === 2) {
        const k = r.pick([1, 2, 3, -1, -2, -3]), inside = linE([k, -k * a], ["x", ""]), pos = k > 0;
        if (t === 1) {
          f = `\\sqrt{${inside}}`; c = pos ? `[${a};\\ ${PINF})` : `(${NINF};\\ ${a}]`;
          w = [pos ? `(${a};\\ ${PINF})` : `(${NINF};\\ ${a})`, pos ? `(${NINF};\\ ${a}]` : `[${a};\\ ${PINF})`, ex(a), pos ? `[${-a};\\ ${PINF})` : `(${NINF};\\ ${-a}]`];
          why = `Hàm số xác định khi $${inside} \\ge 0 \\Leftrightarrow x ${pos ? "\\ge" : "\\le"} ${a}$`;
        } else {
          const m = r.int(1, 9);
          f = `\\dfrac{${m}}{\\sqrt{${inside}}}`; c = pos ? `(${a};\\ ${PINF})` : `(${NINF};\\ ${a})`;
          w = [pos ? `[${a};\\ ${PINF})` : `(${NINF};\\ ${a}]`, pos ? `(${NINF};\\ ${a})` : `(${a};\\ ${PINF})`, ex(a), RR];
          why = `Hàm số xác định khi $${inside} > 0 \\Leftrightarrow x ${pos ? ">" : "<"} ${a}$`;
        }
      } else if (t === 3) {
        const b = a + r.int(1, 5), xb = linE([1, -b], ["x", ""]);
        f = `\\sqrt{${xa}} + \\dfrac{1}{${xb}}`; c = `[${a};\\ ${PINF})\\setminus\\{${b}\\}`;
        w = [`[${a};\\ ${PINF})`, `(${a};\\ ${PINF})\\setminus\\{${b}\\}`, ex(b), `[${a};\\ ${b})`];
        why = `Hàm số xác định khi $\\begin{cases} ${xa} \\ge 0\\\\ ${xb} \\ne 0\\end{cases} \\Leftrightarrow \\begin{cases} x \\ge ${a}\\\\ x \\ne ${b}\\end{cases}$`;
      } else {
        const k = r.int(2, 6), p = r.int(-9, 9); need(Math.abs(p) !== k);
        f = `\\dfrac{${linE([1, p], ["x", ""])}}{x^2 - ${k * k}}`; c = ex(`-${k};\\ ${k}`);
        w = [ex(k), ex(k * k), `(-${k};\\ ${k})`, ex(-p)];
        why = `Hàm số xác định khi $x^2 - ${k * k} \\ne 0 \\Leftrightarrow x \\ne \\pm ${k}$`;
      }
      return { stem: `Tập xác định của hàm số $y = ${f}$ là`, ...mcq(r, M(`D = ${c}`), w.map((x) => M(`D = ${x}`))),
        explanation: `${why}. Vậy tập xác định là $D = ${c}$.` };
    },
  },
  {
    id: "t10k2-ham-so-do-thi-dong-bien", ...B6, topic: "Giá trị hàm số, điểm thuộc đồ thị, tính đồng biến – nghịch biến", level: 1, kind: "mcq",
    make: (r) => {
      const ask = r.int(0, 2);
      if (ask === 0) {
        const a = r.nz(-3, 3), b = r.int(-5, 5), c = r.int(-5, 5), f = (x: number) => a * x * x + b * x + c;
        const x0 = r.nz(-3, 3), y0 = f(x0);
        const cand = [[x0, y0 + r.nz(-3, 3)], [-x0, y0], [y0, x0], [x0, -y0], [x0 + 1, y0], [0, y0], [x0, c]];
        const w = cand.filter((p) => f(p[0]) !== p[1]).map((p) => M(pt(p[0], p[1])));
        return { stem: `Điểm nào sau đây thuộc đồ thị hàm số $y = ${poly([a, b, c])}$?`, ...mcq(r, M(pt(x0, y0)), w),
          explanation: `Với $x = ${x0}$ thì $y = ${a}\\cdot ${pr(x0)}^2${b ? `${term(b)}\\cdot ${pr(x0)}` : ""}${term(c)} = ${y0}$, nên điểm $${pt(x0, y0)}$ thuộc đồ thị. Thay tọa độ các điểm còn lại vào công thức hàm số đều không thỏa mãn.` };
      }
      if (ask === 1) {
        const k = r.int(-2, 2), p = r.nz(-4, 4), q = r.int(-6, 6), u = r.nz(-3, 3), v = r.int(-6, 6);
        const f1 = (x: number) => p * x + q, f2 = (x: number) => u * x * x + v, f = (x: number) => (x >= k ? f1(x) : f2(x));
        const x0 = r.int(-4, 4), y = f(x0);
        const wv = [x0 >= k ? f2(x0) : f1(x0), f(-x0), f1(x0) + f2(x0), -y, y + p].filter((z) => z !== y);
        return {
          stem: `Cho hàm số $f(x) = \\begin{cases} ${linE([p, q], ["x", ""])} & \\text{khi } x \\ge ${k}\\\\ ${poly([u, 0, v])} & \\text{khi } x < ${k}\\end{cases}$. Giá trị của $f(${x0})$ bằng`,
          ...mcq(r, M(y), wv.map(M)),
          explanation: `Vì $${x0} ${x0 >= k ? "\\ge" : "<"} ${k}$ nên $f(${x0}) = ${x0 >= k ? `${p}\\cdot(${x0})${term(q)}` : `${u}\\cdot(${x0})^2${term(v)}`} = ${y}$.`,
        };
      }
      const up = r.chance(0.5), a = r.int(1, 5) * (up ? 1 : -1), b = r.int(-9, 9), a2 = r.int(1, 5) * (up ? -1 : 1), b2 = r.int(-9, 9);
      const fx = (p: number, q: number) => `y = ${linE([p, q], ["x", ""])}`;
      return {
        stem: `Hàm số nào sau đây ${up ? "đồng biến" : "nghịch biến"} trên $${RR}$?`,
        ...mcq(r, M(fx(a, b)), [M(fx(-a, b)), M(fx(a2, b2)), M(`y = ${r.int(-9, 9)}`), M(`y = ${poly([up ? 1 : -1, 0, r.int(-5, 5)])}`)]),
        explanation: `Hàm số $y = ax + b$ đồng biến trên $${RR}$ khi $a > 0$, nghịch biến trên $${RR}$ khi $a < 0$; hàm hằng không đồng biến, không nghịch biến; hàm số bậc hai $y = \\pm x^2 + c$ đổi chiều biến thiên tại $x = 0$. Hàm số $${fx(a, b)}$ có $a = ${a} ${up ? ">" : "<"} 0$ nên ${up ? "đồng biến" : "nghịch biến"} trên $${RR}$.`,
      };
    },
  },
  {
    id: "t10k2-parabol-dinh-truc", ...B6, topic: "Đỉnh, trục đối xứng của parabol", level: 1, kind: "mcq",
    make: (r) => {
      const a = r.nz(-3, 3), h = r.nz(-4, 4), k = r.int(-6, 6), b = -2 * a * h, c = a * h * h + k, f = (x: number) => a * x * x + b * x + c;
      const P = poly([a, b, c]);
      const base = `Ta có $x_I = -\\dfrac{b}{2a} = -\\dfrac{${b}}{2\\cdot ${pr(a)}} = ${h}$, $y_I = f(${h}) = ${k}$.`;
      if (r.chance(0.55)) {
        return { stem: `Tọa độ đỉnh $I$ của parabol $(P): y = ${P}$ là`,
          ...mcq(r, M(`I${pt(h, k)}`), [[-h, f(-h)], [-h, k], [h, -k], [k, h], [h, c]].filter((p) => !(p[0] === h && p[1] === k)).map((p) => M(`I${pt(p[0], p[1])}`))),
          explanation: `${base} Vậy $I${pt(h, k)}$.` };
      }
      return { stem: `Trục đối xứng của parabol $(P): y = ${P}$ là đường thẳng`,
        ...mcq(r, M(`x = ${h}`), [M(`x = ${-h}`), M(`x = ${2 * h}`), M(`x = ${-2 * h}`), M(`y = ${k}`)]),
        explanation: `Trục đối xứng của parabol $y = ax^2 + bx + c$ là đường thẳng $x = -\\dfrac{b}{2a}$. ${base} Vậy trục đối xứng là $x = ${h}$.` };
    },
  },
  {
    id: "t10k2-parabol-bien-thien", ...B6, topic: "Khoảng đồng biến, nghịch biến của hàm số bậc hai", level: 1, kind: "mcq",
    make: (r) => {
      const a = r.nz(-3, 3), h = r.nz(-4, 4), k = r.int(-6, 6), b = -2 * a * h, c = a * h * h + k;
      const up = r.chance(0.5);
      const right = (a > 0) === up; // khoảng đúng là (h; +∞)?
      const iv = (lo: number | string, hi: number | string) => `(${lo};\\ ${hi})`;
      const cor = right ? iv(h, PINF) : iv(NINF, h);
      const d = r.int(1, 3);
      const w = right ? [iv(NINF, h), iv(h - d, PINF), iv(NINF, -h), iv(-h - d, PINF)] : [iv(h, PINF), iv(NINF, h + d), iv(-h, PINF), iv(NINF, -h + d)];
      return {
        stem: `Hàm số $y = ${poly([a, b, c])}$ ${up ? "đồng biến" : "nghịch biến"} trên khoảng nào sau đây?`,
        ...mcq(r, M(cor), w.filter((x) => x !== cor).map(M)),
        explanation: `Hàm số có $a = ${a} ${a > 0 ? ">" : "<"} 0$, đỉnh có hoành độ $x = -\\dfrac{b}{2a} = ${h}$. Do đó hàm số ${a > 0 ? "nghịch biến" : "đồng biến"} trên $(${NINF};\\ ${h})$ và ${a > 0 ? "đồng biến" : "nghịch biến"} trên $(${h};\\ ${PINF})$. Vậy hàm số ${up ? "đồng biến" : "nghịch biến"} trên $${cor}$.`,
      };
    },
  },
  {
    id: "t10k2-ham-bac-hai-gtln-gtnn", ...B6, topic: "Giá trị lớn nhất, nhỏ nhất của hàm số bậc hai", level: 2, kind: "mcq",
    make: (r) => {
      const a = r.nz(-2, 2), h = r.int(-3, 3), k = r.int(-6, 6), b = -2 * a * h, c = a * h * h + k, f = (x: number) => a * x * x + b * x + c;
      const P = poly([a, b, c]);
      if (r.chance(0.4)) {
        const mx = a < 0;
        return {
          stem: `Giá trị ${mx ? "lớn nhất" : "nhỏ nhất"} của hàm số $y = ${P}$ trên $${RR}$ là`,
          ...mcq(r, M(k), [h, c, f(-h - 1), -k, f(h + 1), k + 2 * a].filter((x) => x !== k).map(M)),
          explanation: `Hàm số có $a = ${a} ${mx ? "<" : ">"} 0$ nên đạt giá trị ${mx ? "lớn nhất" : "nhỏ nhất"} tại đỉnh $x = -\\dfrac{b}{2a} = ${h}$; giá trị đó là $f(${h}) = ${k}$.`,
        };
      }
      const p = r.int(-4, 2), q = p + r.int(2, 5), askMax = r.chance(0.5);
      const ins = h >= p && h <= q;
      const cand = [f(p), f(q), ...(ins ? [k] : [])];
      const ans = askMax ? Math.max(...cand) : Math.min(...cand);
      const w = [f(p), f(q), k, askMax ? Math.min(...cand) : Math.max(...cand), c, f(h + 1)].filter((x) => x !== ans);
      return {
        stem: `Giá trị ${askMax ? "lớn nhất" : "nhỏ nhất"} của hàm số $y = ${P}$ trên đoạn $[${p};\\ ${q}]$ là`,
        ...mcq(r, M(ans), w.map(M)),
        explanation: `Đỉnh của parabol có hoành độ $x = ${h}$ ${ins ? `thuộc` : `không thuộc`} đoạn $[${p};\\ ${q}]$. Ta có $f(${p}) = ${f(p)}$, $f(${q}) = ${f(q)}$${ins ? `, $f(${h}) = ${k}$` : ""}. Vậy giá trị ${askMax ? "lớn nhất" : "nhỏ nhất"} cần tìm là $${ans}$.`,
      };
    },
  },
  {
    id: "t10k2-dau-tam-thuc", ...B6, topic: "Dấu của tam thức bậc hai", level: 1, kind: "mcq",
    make: (r) => {
      const ask = r.int(0, 2);
      if (ask < 2) {
        const sg = ask === 0 ? 1 : -1, a = r.int(1, 3), p = r.nz(-4, 4);
        const c = Math.floor((p * p) / a) + r.int(1, 5), c2 = Math.ceil((p * p) / a) - r.int(1, 5);
        need(p * p < a * c && p * p > a * c2);
        const p2 = r.nz(-4, 4), a3 = r.int(1, 3), c3 = r.int(1, 9);
        const cor = poly([sg * a, sg * 2 * p, sg * c]);
        return {
          stem: `Tam thức bậc hai nào sau đây luôn ${sg > 0 ? "dương" : "âm"} với mọi $x\\in${RR}$?`,
          ...mcq(r, M(`f(x) = ${cor}`), [poly([sg * a, sg * 2 * p, sg * c2]), poly([sg, sg * 2 * p2, sg * p2 * p2]), poly([-sg * a3, 2 * p2, -sg * c3])].map((x) => M(`f(x) = ${x}`))),
          explanation: `$f(x) = ax^2 + bx + c$ luôn ${sg > 0 ? "dương" : "âm"} với mọi $x$ khi và chỉ khi $a ${sg > 0 ? ">" : "<"} 0$ và $\\Delta < 0$. Tam thức $${cor}$ có $a = ${sg * a}$ và $\\Delta' = ${p * p} - ${sg * a}\\cdot(${sg * c}) = ${p * p - a * c} < 0$ nên thỏa mãn. Tam thức $${poly([sg, sg * 2 * p2, sg * p2 * p2])}$ có $\\Delta' = 0$ nên bằng $0$ tại $x = ${-p2}$; các tam thức còn lại có $\\Delta > 0$ hoặc hệ số $a$ trái dấu.`,
        };
      }
      const x1 = r.int(-6, 3), x2 = x1 + r.int(1, 6), a = r.pick([1, -1, 2, -2]);
      const fi = a > 0 ? "<" : ">", fo = a > 0 ? ">" : "<";
      const st = (s: string, iv: string) => `$f(x) ${s} 0$ với mọi $x\\in${iv}$`;
      const I = `(${x1};\\ ${x2})`, Ro = `(${x2};\\ ${PINF})`, Le = `(${NINF};\\ ${x1})`;
      return {
        stem: `Cho tam thức bậc hai $f(x) = ${poly([a, -a * (x1 + x2), a * x1 * x2])}$. Khẳng định nào sau đây đúng?`,
        ...mcq(r, st(fi, I), [st(fo, I), st(fi, Ro), st(fi, Le), st(fo, RR)]),
        explanation: `$f(x)$ có hai nghiệm $x_1 = ${x1}$, $x_2 = ${x2}$ và hệ số $a = ${a} ${a > 0 ? ">" : "<"} 0$. Theo định lí về dấu của tam thức bậc hai: $f(x)$ cùng dấu với $a$ khi $x\\in(${NINF};\\ ${x1})\\cup(${x2};\\ ${PINF})$ và trái dấu với $a$ khi $x\\in${I}$. Vậy $f(x) ${fi} 0$ với mọi $x\\in${I}$.`,
      };
    },
  },
  {
    id: "t10k2-bpt-bac-hai", ...B6, topic: "Giải bất phương trình bậc hai một ẩn", level: 2, kind: "mcq",
    make: (r) => {
      const op = r.pick([">", "<", "\\ge", "\\le"]), posAsk = op === ">" || op === "\\ge", strict = op === ">" || op === "<";
      if (r.chance(0.7)) {
        const x1 = r.int(-6, 4), x2 = x1 + r.int(1, 7), a = r.pick([1, -1, 2, -2, 3, -3]);
        const inside = (a > 0) !== posAsk;
        const inS = `(${x1};\\ ${x2})`, inN = `[${x1};\\ ${x2}]`, outS = `(${NINF};\\ ${x1})\\cup(${x2};\\ ${PINF})`, outN = `(${NINF};\\ ${x1}]\\cup[${x2};\\ ${PINF})`;
        const cor = inside ? (strict ? inS : inN) : (strict ? outS : outN);
        return {
          stem: `Tập nghiệm của bất phương trình $${poly([a, -a * (x1 + x2), a * x1 * x2])} ${op} 0$ là`,
          ...mcq(r, M(`S = ${cor}`), [inS, inN, outS, outN].filter((x) => x !== cor).map((x) => M(`S = ${x}`))),
          explanation: `Tam thức $f(x) = ${poly([a, -a * (x1 + x2), a * x1 * x2])}$ có hai nghiệm $x = ${x1}$, $x = ${x2}$ và $a = ${a} ${a > 0 ? ">" : "<"} 0$, nên $f(x)$ ${a > 0 ? "dương" : "âm"} ngoài khoảng hai nghiệm và ${a > 0 ? "âm" : "dương"} trong khoảng hai nghiệm. Do đó $f(x) ${op} 0 \\Leftrightarrow x\\in${cor}$.`,
        };
      }
      const p = r.int(-4, 4), dbl = r.chance(0.5), c = dbl ? p * p : p * p + r.int(1, 6);
      const Rm = `${RR}\\setminus\\{${p}\\}`, Pt = `\\{${p}\\}`;
      const cor = dbl ? (op === ">" ? Rm : op === "\\ge" ? RR : op === "<" ? "\\varnothing" : Pt) : (posAsk ? RR : "\\varnothing");
      const f = poly([1, -2 * p, c]);
      return {
        stem: `Tập nghiệm của bất phương trình $${f} ${op} 0$ là`,
        ...mcq(r, M(`S = ${cor}`), [RR, "\\varnothing", Rm, Pt, `(${p};\\ ${PINF})`].filter((x) => x !== cor).map((x) => M(`S = ${x}`))),
        explanation: dbl
          ? `Ta có $${f} = ${sh("x", p)} \\ge 0$ với mọi $x$, dấu bằng xảy ra khi $x = ${p}$. Do đó $${sh("x", p)} ${op} 0 \\Leftrightarrow x\\in ${cor}$.`
          : `Tam thức có $a = 1 > 0$ và $\\Delta' = ${p * p} - ${c} = ${p * p - c} < 0$ nên $${f} > 0$ với mọi $x$. Vậy $S = ${cor}$.`,
      };
    },
  },
  {
    id: "t10k2-pt-chua-can", ...B6, topic: "Phương trình quy về phương trình bậc hai (chứa căn)", level: 3, kind: "mcq",
    make: (r) => {
      const r1 = r.int(-5, 6), r2 = r.int(-5, 6); need(r1 < r2);
      const B = -(r1 + r2), C = r1 * r2;
      let eq: string, valid: number[], expl: string;
      if (r.chance(0.5)) {
        const d = r.nz(-3, 3), e = r.int(-6, 6), b = B + d, c = C + e, D = linE([d, e], ["x", ""]);
        valid = [r1, r2].filter((x) => d * x + e >= 0);
        eq = `\\sqrt{${poly([1, b, c])}} = \\sqrt{${D}}`;
        expl = `Bình phương hai vế: $${poly([1, b, c])} = ${D} \\Leftrightarrow ${poly([1, B, C])} = 0 \\Leftrightarrow x = ${r1}$ hoặc $x = ${r2}$. Thử lại điều kiện $${D} \\ge 0$: ${[r1, r2].map((x) => `$x = ${x}$ cho $${D} = ${d * x + e}$ (${d * x + e >= 0 ? "thỏa mãn" : "loại"})`).join("; ")}.`;
      } else {
        const k = r.int(-3, 4), b = B + 2 * k, c = C + k * k, D = linE([1, k], ["x", ""]);
        valid = [r1, r2].filter((x) => x + k >= 0);
        eq = `\\sqrt{${poly([2, b, c])}} = ${D}`;
        expl = `Điều kiện $${D} \\ge 0 \\Leftrightarrow x \\ge ${-k}$. Bình phương hai vế: $${poly([2, b, c])} = ${poly([1, 2 * k, k * k])} \\Leftrightarrow ${poly([1, B, C])} = 0 \\Leftrightarrow x = ${r1}$ hoặc $x = ${r2}$. Đối chiếu điều kiện $x \\ge ${-k}$: ${[r1, r2].map((x) => `$x = ${x}$ ${x + k >= 0 ? "thỏa mãn" : "bị loại"}`).join(", ")}.`;
      }
      need(valid.length >= 1 || r.chance(0.2));
      const inval = [r1, r2].filter((x) => !valid.includes(x));
      const cor = setT(valid);
      return {
        stem: `Tập nghiệm của phương trình $${eq}$ là`,
        ...mcq(r, M(`S = ${cor}`), [setT([r1, r2]), setT(inval), setT([-r2, -r1]), setT([r1]), setT([r2])].filter((x) => x !== cor).map((x) => M(`S = ${x}`))),
        explanation: `${expl} Vậy $S = ${cor}$.`,
      };
    },
  },

  /* ===================== CHƯƠNG VI – TF ===================== */
  {
    id: "t10k2-tf-ham-so-bac-hai", ...B6, topic: "Tính chất của hàm số bậc hai (Đúng/Sai)", level: 2, kind: "tf",
    make: (r) => {
      const a = r.nz(-2, 2), h = r.nz(-3, 3), k = r.int(-5, 5), b = -2 * a * h, c = a * h * h + k;
      const s = [r.chance(0.5), r.chance(0.5), r.chance(0.5), r.chance(0.5)];
      const mono: [string, boolean][] = [
        [`Hàm số đồng biến trên khoảng $(${h};\\ ${PINF})$`, a > 0], [`Hàm số nghịch biến trên khoảng $(${h};\\ ${PINF})$`, a < 0],
        [`Hàm số đồng biến trên khoảng $(${NINF};\\ ${h})$`, a < 0], [`Hàm số nghịch biến trên khoảng $(${NINF};\\ ${h})$`, a > 0],
      ];
      const last: [string, boolean] = r.chance(0.5)
        ? [`Đồ thị hàm số cắt trục hoành tại hai điểm phân biệt`, a * k < 0]
        : [`Giá trị ${a > 0 ? "nhỏ nhất" : "lớn nhất"} của hàm số trên $${RR}$ bằng $${s[3] ? k : k + r.nz(-2, 2)}$`, s[3]];
      const D = b * b - 4 * a * c;
      return {
        stem: `Cho hàm số bậc hai $y = ${poly([a, b, c])}$. Xét tính đúng sai của các khẳng định sau.`,
        ...tf([
          [`Đồ thị hàm số là parabol có đỉnh $I${s[0] ? pt(h, k) : pt(-h, k)}$`, s[0]],
          [`Đồ thị hàm số cắt trục tung tại điểm có tung độ bằng $${s[1] ? c : c + r.nz(-3, 3)}$`, s[1]],
          r.pick(mono),
          last,
        ]),
        explanation: `Đỉnh $I$ có $x_I = -\\dfrac{b}{2a} = ${h}$, $y_I = ${k}$, tức $I${pt(h, k)}$. Với $x = 0$ thì $y = ${c}$. Vì $a = ${a} ${a > 0 ? ">" : "<"} 0$ nên hàm số ${a > 0 ? "nghịch biến" : "đồng biến"} trên $(${NINF};\\ ${h})$, ${a > 0 ? "đồng biến" : "nghịch biến"} trên $(${h};\\ ${PINF})$ và có giá trị ${a > 0 ? "nhỏ nhất" : "lớn nhất"} bằng $${k}$. Biệt thức $\\Delta = ${D}${D > 0 ? " > 0$ nên đồ thị cắt trục hoành tại hai điểm phân biệt" : D === 0 ? "$ nên đồ thị tiếp xúc với trục hoành" : " < 0$ nên đồ thị không cắt trục hoành"}.`,
      };
    },
  },
  {
    id: "t10k2-tf-bpt-bac-hai", ...B6, topic: "Dấu tam thức, bất phương trình bậc hai (Đúng/Sai)", level: 3, kind: "tf",
    make: (r) => {
      const x1 = r.int(-5, 3), x2 = x1 + r.int(2, 6), a = r.pick([1, -1]);
      const f = poly([a, -a * (x1 + x2), a * x1 * x2]);
      const s = [r.chance(0.5), r.chance(0.5), r.chance(0.5), r.chance(0.5)];
      const inS = `(${x1};\\ ${x2})`, outS = `(${NINF};\\ ${x1})\\cup(${x2};\\ ${PINF})`;
      const posSet = a > 0 ? outS : inS, shown0 = s[0] ? posSet : (a > 0 ? inS : outS);
      const N = x2 - x1 + 1, shown1 = s[1] ? N : N - 2;
      const sg = r.pick([">", "<"]);
      const p = r.nz(-3, 3), cnt = 10 - p * p, shown3 = s[3] ? cnt : cnt + 1;
      return {
        stem: `Cho tam thức bậc hai $f(x) = ${f}$. Xét tính đúng sai của các khẳng định sau.`,
        ...tf([
          [`Bất phương trình $f(x) > 0$ có tập nghiệm là $S = ${shown0}$`, s[0]],
          [`Bất phương trình $f(x) ${a > 0 ? "\\le" : "\\ge"} 0$ có đúng $${shown1}$ nghiệm nguyên`, s[1]],
          [`$f(x) ${sg} 0$ với mọi $x\\in(${x2};\\ ${PINF})$`, (sg === ">") === (a > 0)],
          [`Có đúng $${shown3}$ giá trị nguyên của tham số $m$ thuộc đoạn $[-10;\\ 10]$ để $x^2${term(2 * p, "x")} + m > 0$ với mọi $x\\in${RR}$`, s[3]],
        ]),
        explanation: `$f(x)$ có hai nghiệm $${x1}$ và $${x2}$, hệ số $a = ${a}$ nên $f(x) > 0 \\Leftrightarrow x\\in${posSet}$ và $f(x) ${a > 0 ? "\\le" : "\\ge"} 0 \\Leftrightarrow x\\in[${x1};\\ ${x2}]$, có $${x2} - ${x1 < 0 ? `(${x1})` : x1} + 1 = ${N}$ nghiệm nguyên. Trên $(${x2};\\ ${PINF})$, $f(x)$ cùng dấu với $a$ nên $f(x) ${a > 0 ? ">" : "<"} 0$. Ý cuối: $x^2${term(2 * p, "x")} + m > 0\\ \\forall x \\Leftrightarrow \\Delta' = ${p * p} - m < 0 \\Leftrightarrow m > ${p * p}$; với $m$ nguyên thuộc $[-10;\\ 10]$ có ${cnt === 1 ? "$m = 10$" : `$m\\in\\{${p * p + 1};\\ \\ldots;\\ 10\\}$`}, gồm $${cnt}$ giá trị.`,
      };
    },
  },

  /* ===================== CHƯƠNG VI – SHORT ===================== */
  {
    id: "t10k2-short-xac-dinh-parabol", ...B6, topic: "Xác định parabol y = ax² + bx + c", level: 3, kind: "short",
    make: (r) => {
      if (r.chance(0.5)) {
        const a = r.nz(-3, 3), h = r.nz(-3, 3), k = r.int(-5, 5), b = -2 * a * h, c = a * h * h + k, x0 = h + r.nz(-2, 2), y0 = a * (x0 - h) ** 2 + k;
        const E = r.pick([{ t: "a + b + c", v: a + b + c }, { t: "a - b + c", v: a - b + c }, { t: "2a + b - c", v: 2 * a + b - c }, { t: "a + 2b + 3c", v: a + 2 * b + 3 * c }]);
        return {
          stem: `Biết parabol $(P): y = ax^2 + bx + c$ có đỉnh $I${pt(h, k)}$ và đi qua điểm $A${pt(x0, y0)}$. Tính $T = ${E.t}$.`,
          ...short(E.v, 0),
          explanation: `Vì $(P)$ có đỉnh $I${pt(h, k)}$ nên $y = a${sh("x", h)}${term(k)}$. Thay tọa độ $A$: $${y0} = a\\cdot ${(x0 - h) ** 2}${term(k)} \\Rightarrow a = ${a}$. Do đó $y = ${poly([a, b, c])}$, tức $a = ${a}$, $b = ${b}$, $c = ${c}$ và $T = ${E.v}$.`,
        };
      }
      const a = r.nz(-3, 3), b = r.int(-5, 5), c = r.int(-5, 5), f = (x: number) => a * x * x + b * x + c;
      const xs = r.shuffle([-3, -2, 0, 2, 3]).slice(0, 3).sort((u, v) => u - v);
      const E = r.pick([{ t: "a + b + c", v: a + b + c }, { t: "a - b + c", v: a - b + c }, { t: "2a - b + c", v: 2 * a - b + c }, { t: "a^2 + b^2 + c^2", v: a * a + b * b + c * c }]);
      const nm = ["A", "B", "C"];
      return {
        stem: `Biết parabol $(P): y = ax^2 + bx + c$ đi qua ba điểm ${xs.map((x, i) => `$${nm[i]}${pt(x, f(x))}$`).join(", ")}. Tính $T = ${E.t}$.`,
        ...short(E.v, 0),
        explanation: `Thay tọa độ ba điểm vào $y = ax^2 + bx + c$: $\\begin{cases}${xs.map((x) => `${x * x === 0 ? "" : `${x * x}a`}${x === 0 ? "" : x * x === 0 ? linE([x], ["b"]) : term(x, "b")}${x === 0 ? "c" : " + c"} = ${f(x)}`).join("\\\\ ")}\\end{cases}$. Giải hệ được $a = ${a}$, $b = ${b}$, $c = ${c}$. Vậy $T = ${E.v}$.`,
      };
    },
  },
  {
    id: "t10k2-short-tam-thuc-tham-so", ...B6, topic: "Tam thức không đổi dấu – tìm tham số m", level: 3, kind: "short",
    make: (r) => {
      const m1 = r.int(-6, 2), m2 = m1 + r.int(2, 9), p = r.int(-3, 3);
      const s = 2 * p + m1 + m2, t = p * p - m1 * m2; need(s !== 0);
      const mid = p === 0 ? "2mx" : `2(m${term(p)})x`;
      const fr = `${s > 0 ? " + " : " - "}${coef(Math.abs(s))}m${term(t)}`;
      const f = `x^2 - ${mid}${fr}`;
      const v = r.int(0, 3);
      const strictD = v === 0 || v === 3; // Δ' < 0
      const cond = [`$f(x) > 0$ với mọi $x\\in${RR}$`, `$f(x) \\ge 0$ với mọi $x\\in${RR}$`, `bất phương trình $f(x) < 0$ vô nghiệm`, `bất phương trình $f(x) \\le 0$ vô nghiệm`][v];
      const ans = strictD ? m2 - m1 - 1 : m2 - m1 + 1;
      need(ans >= 1);
      return {
        stem: `Cho $f(x) = ${f}$ ($m$ là tham số). Có bao nhiêu giá trị nguyên của $m$ để ${cond}?`,
        ...short(ans, 0),
        explanation: `Hệ số $a = 1 > 0$ nên yêu cầu bài toán $\\Leftrightarrow \\Delta' ${strictD ? "<" : "\\le"} 0$${v >= 2 ? ` (vì ${v === 2 ? "$f(x) < 0$ vô nghiệm $\\Leftrightarrow f(x) \\ge 0\\ \\forall x$" : "$f(x) \\le 0$ vô nghiệm $\\Leftrightarrow f(x) > 0\\ \\forall x$"})` : ""}. Ta có $\\Delta' = (m${term(p)})^2 - (${linE([s, t], ["m", ""])}) = ${poly([1, 2 * p - s, p * p - t], "m")}$, có hai nghiệm $m = ${m1}$, $m = ${m2}$. Do đó $\\Delta' ${strictD ? "<" : "\\le"} 0 \\Leftrightarrow ${m1} ${strictD ? "<" : "\\le"} m ${strictD ? "<" : "\\le"} ${m2}$, có $${ans}$ giá trị nguyên của $m$.`,
      };
    },
  },
  {
    id: "t10k2-short-ung-dung-ham-bac-hai", ...B6, topic: "Bài toán thực tế về hàm số bậc hai", level: 3, kind: "short",
    make: (r) => {
      const t = r.int(0, 3);
      if (t === 0) {
        const v = r.pick([10, 15, 20, 25, 30]), h0 = r.int(1, 20), H = h0 + (v * v) / 20, tm = v / 10, askH = r.chance(0.6);
        const val = askH ? H : tm, f = fit(val, 1);
        return {
          stem: `Một quả bóng được ném lên từ độ cao $${h0}$ m. Độ cao $h$ (mét) của quả bóng sau $t$ giây được cho bởi $h(t) = -5t^2 + ${v}t + ${h0}$. ${askH ? "Độ cao lớn nhất quả bóng đạt được là bao nhiêu mét" : "Sau bao nhiêu giây thì quả bóng đạt độ cao lớn nhất"}${withNote(f.note)}?`,
          ...short(val, f.dp),
          explanation: `$h(t)$ là hàm số bậc hai có $a = -5 < 0$ nên đạt giá trị lớn nhất tại $t = -\\dfrac{${v}}{2\\cdot(-5)} = ${tex(tm)}$ (giây); khi đó $h = -5\\cdot ${tex(tm)}^2 + ${v}\\cdot ${tex(tm)} + ${h0} = ${tex(H)}$ (m).`,
        };
      }
      if (t === 1) {
        const k = r.pick([2, 5, 10, 20]), cst = r.int(20, 40), p0 = cst + r.int(10, 30), m = r.int(4, p0 - cst);
        need((cst + p0 + m) % 2 === 0);
        const n0 = k * m, xs = (cst + p0 + m) / 2;
        need(xs > cst && xs <= p0);
        return {
          stem: `Một cửa hàng nhập một loại sản phẩm với giá $${cst}$ nghìn đồng/sản phẩm. Nếu bán với giá $${p0}$ nghìn đồng/sản phẩm thì mỗi tháng bán được $${n0}$ sản phẩm; cứ giảm giá bán $1$ nghìn đồng thì mỗi tháng bán thêm được $${k}$ sản phẩm. Hỏi cửa hàng nên bán với giá bao nhiêu nghìn đồng/sản phẩm để lợi nhuận mỗi tháng lớn nhất?`,
          ...short(xs, 0),
          explanation: `Gọi giá bán là $x$ (nghìn đồng), $x \\le ${p0}$. Số sản phẩm bán được là $${n0} + ${k}(${p0} - x)$. Lợi nhuận $L(x) = (x - ${cst})(${n0 + k * p0} - ${k}x) = ${poly([-k, n0 + k * p0 + k * cst, -cst * (n0 + k * p0)])}$. Đây là hàm bậc hai có $a < 0$, đạt giá trị lớn nhất tại $x = \\dfrac{${n0 + k * p0 + k * cst}}{${2 * k}} = ${xs}$.`,
        };
      }
      if (t === 2) {
        const Lf = 4 * r.int(5, 60), area = (Lf * Lf) / 8;
        return {
          stem: `Một người dùng $${Lf}$ m lưới để rào một mảnh vườn hình chữ nhật, trong đó một cạnh của mảnh vườn dựa vào bức tường có sẵn (không cần rào). Hỏi diện tích lớn nhất của mảnh vườn có thể rào được là bao nhiêu mét vuông?`,
          ...short(area, 0),
          explanation: `Gọi $x$ (m) là độ dài mỗi cạnh vuông góc với tường ($0 < x < ${Lf / 2}$), cạnh song song với tường dài $${Lf} - 2x$. Diện tích $S(x) = x(${Lf} - 2x) = -2x^2 + ${Lf}x$, đạt giá trị lớn nhất tại $x = \\dfrac{${Lf}}{4} = ${Lf / 4}$. Khi đó $S = ${Lf / 4}\\cdot ${Lf / 2} = ${area}$ (m$^2$).`,
        };
      }
      const w = 2 * r.int(3, 10), H = r.int(4, 12), d = r.int(1, w / 2 - 1), y = (4 * H * d * (w - d)) / (w * w), f = fit(y, 2);
      return {
        stem: `Một cổng có dạng parabol, khoảng cách giữa hai chân cổng là $${w}$ m và chiều cao của cổng (từ đỉnh xuống mặt đất) là $${H}$ m. Tại một điểm trên mặt đất cách một chân cổng $${d}$ m, chiều cao của cổng là bao nhiêu mét${withNote(f.note)}?`,
        ...short(y, f.dp),
        explanation: `Chọn hệ trục với gốc tọa độ tại trung điểm hai chân cổng, trục $Oy$ đi qua đỉnh. Parabol có đỉnh $(0;\\ ${H})$, đi qua $(${w / 2};\\ 0)$ nên $y = ${H} - ${frac(H, (w * w) / 4)}x^2$. Điểm cách chân cổng $${d}$ m có $x = ${w / 2 - d}$, khi đó $y = ${H} - ${frac(H, (w * w) / 4)}\\cdot ${(w / 2 - d) ** 2} = ${frac(4 * H * d * (w - d), w * w)}${f.note ? ` \\approx ${tex(y, f.dp)}` : ""}$ (m).`,
      };
    },
  },

  /* ===================== CHƯƠNG VII – MCQ ===================== */
  {
    id: "t10k2-toa-do-vecto", ...B7, topic: "Tọa độ vectơ, trung điểm, trọng tâm, độ dài, tích vô hướng", level: 1, kind: "mcq",
    make: (r) => {
      const xA = r.int(-5, 5), yA = r.int(-5, 5), xB = r.int(-5, 5), yB = r.int(-5, 5);
      need(xA !== xB && yA !== yB);
      const dx = xB - xA, dy = yB - yA, ask = r.int(0, 4);
      const AB = `A${pt(xA, yA)}`, BB = `B${pt(xB, yB)}`;
      if (ask === 0) return { stem: `Trong mặt phẳng $Oxy$, cho hai điểm $${AB}$ và $${BB}$. Tọa độ của vectơ $\\overrightarrow{AB}$ là`,
        ...mcq(r, M(pt(dx, dy)), [pt(-dx, -dy), pt(xA + xB, yA + yB), pt(dy, dx), pt(xB + xA, yB - yA)].map(M)),
        explanation: `$\\overrightarrow{AB} = (x_B - x_A;\\ y_B - y_A) = ${pt(dx, dy)}$.` };
      if (ask === 1) {
        const I = pt(frac(xA + xB, 2), frac(yA + yB, 2));
        return { stem: `Trong mặt phẳng $Oxy$, cho hai điểm $${AB}$ và $${BB}$. Tọa độ trung điểm $I$ của đoạn thẳng $AB$ là`,
          ...mcq(r, M(I), [pt(xA + xB, yA + yB), pt(frac(dx, 2), frac(dy, 2)), pt(frac(yA + yB, 2), frac(xA + xB, 2)), pt(frac(-dx, 2), frac(-dy, 2))].map(M)),
          explanation: `$x_I = \\dfrac{x_A + x_B}{2} = ${frac(xA + xB, 2)}$, $y_I = \\dfrac{y_A + y_B}{2} = ${frac(yA + yB, 2)}$.` };
      }
      if (ask === 2) {
        const d2 = dx * dx + dy * dy;
        return { stem: `Trong mặt phẳng $Oxy$, cho hai điểm $${AB}$ và $${BB}$. Độ dài đoạn thẳng $AB$ bằng`,
          ...mcq(r, M(sqrtTex(d2)), [String(d2), String(Math.abs(dx) + Math.abs(dy)), sqrtTex((xA + xB) ** 2 + (yA + yB) ** 2), sqrtTex(Math.abs(dx * dx - dy * dy))].filter((x) => x !== "0").map(M)),
          explanation: `$AB = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2} = \\sqrt{${pr(dx)}^2 + ${pr(dy)}^2} = ${sqrtTex(d2)}$.` };
      }
      if (ask === 3) {
        const a = r.nz(-5, 5), b = r.nz(-5, 5), c = r.nz(-5, 5), d = r.nz(-5, 5), v = a * c + b * d;
        return { stem: `Trong mặt phẳng $Oxy$, cho hai vectơ $\\overrightarrow{u} = ${pt(a, b)}$ và $\\overrightarrow{v} = ${pt(c, d)}$. Tích vô hướng $\\overrightarrow{u}\\cdot\\overrightarrow{v}$ bằng`,
          ...mcq(r, M(v), [a * d + b * c, a * c - b * d, a * b + c * d, -v].filter((x) => x !== v).map(M)),
          explanation: `$\\overrightarrow{u}\\cdot\\overrightarrow{v} = x_1x_2 + y_1y_2 = ${a}\\cdot ${pr(c)} + ${b}\\cdot ${pr(d)} = ${v}$.` };
      }
      const xC = r.int(-5, 5), yC = r.int(-5, 5), sx = xA + xB + xC, sy = yA + yB + yC;
      return { stem: `Trong mặt phẳng $Oxy$, cho tam giác $ABC$ có $${AB}$, $${BB}$, $C${pt(xC, yC)}$. Tọa độ trọng tâm $G$ của tam giác $ABC$ là`,
        ...mcq(r, M(pt(frac(sx, 3), frac(sy, 3))), [pt(sx, sy), pt(frac(sx, 2), frac(sy, 2)), pt(frac(-sx, 3), frac(-sy, 3)), pt(frac(sy, 3), frac(sx, 3))].map(M)),
        explanation: `$x_G = \\dfrac{x_A + x_B + x_C}{3} = ${frac(sx, 3)}$, $y_G = \\dfrac{y_A + y_B + y_C}{3} = ${frac(sy, 3)}$.` };
    },
  },
  {
    id: "t10k2-dt-vtpt-vtcp", ...B7, topic: "Vectơ pháp tuyến, vectơ chỉ phương, điểm thuộc đường thẳng", level: 1, kind: "mcq",
    make: (r) => {
      const ask = r.int(0, 4);
      if (ask <= 1) {
        const a = r.nz(-6, 6), b = r.nz(-6, 6), c = r.int(-9, 9); need(Math.abs(a) !== Math.abs(b) && c !== b);
        const d = `${L(a, b, c)} = 0`;
        if (ask === 0) return { stem: `Trong mặt phẳng $Oxy$, một vectơ pháp tuyến của đường thẳng $d: ${d}$ là`,
          ...mcq(r, M(`\\overrightarrow{n} = ${pt(a, b)}`), [pt(b, -a), pt(b, a), pt(a, c), pt(-b, a)].map((x) => M(`\\overrightarrow{n} = ${x}`))),
          explanation: `Đường thẳng $ax + by + c = 0$ có một vectơ pháp tuyến là $\\overrightarrow{n} = (a;\\ b) = ${pt(a, b)}$.` };
        const cu = r.chance(0.5) ? pt(b, -a) : pt(-b, a);
        return { stem: `Trong mặt phẳng $Oxy$, một vectơ chỉ phương của đường thẳng $d: ${d}$ là`,
          ...mcq(r, M(`\\overrightarrow{u} = ${cu}`), [pt(a, b), pt(b, a), pt(-a, -b), pt(a, c)].map((x) => M(`\\overrightarrow{u} = ${x}`))),
          explanation: `Đường thẳng $d$ có vectơ pháp tuyến $\\overrightarrow{n} = ${pt(a, b)}$ nên có vectơ chỉ phương $\\overrightarrow{u} = ${pt(b, -a)}$ (hoặc $${pt(-b, a)}$), vì $\\overrightarrow{u}\\perp\\overrightarrow{n}$.` };
      }
      const x0 = r.int(-5, 5), y0 = r.int(-5, 5), u = r.nz(-5, 5), v = r.nz(-5, 5); need(Math.abs(u) !== Math.abs(v));
      const d = param(x0, y0, u, v);
      const on = (p: number[]) => (p[0] - x0) * v - (p[1] - y0) * u === 0;
      if (ask === 2) return { stem: `Trong mặt phẳng $Oxy$, một vectơ chỉ phương của đường thẳng $d: ${d}$ là`,
        ...mcq(r, M(`\\overrightarrow{u} = ${pt(u, v)}`), [pt(x0, y0), pt(v, u), pt(v, -u), pt(u, -v)].filter((x) => x !== pt(u, v)).map((x) => M(`\\overrightarrow{u} = ${x}`))),
        explanation: `Đường thẳng $\\begin{cases} x = x_0 + at\\\\ y = y_0 + bt\\end{cases}$ có vectơ chỉ phương $\\overrightarrow{u} = (a;\\ b)$, ở đây là $${pt(u, v)}$. (Chú ý $${pt(x0, y0)}$ là tọa độ một điểm thuộc $d$.)` };
      if (ask === 3) {
        const cn = r.chance(0.5) ? pt(v, -u) : pt(-v, u);
        return { stem: `Trong mặt phẳng $Oxy$, một vectơ pháp tuyến của đường thẳng $d: ${d}$ là`,
          ...mcq(r, M(`\\overrightarrow{n} = ${cn}`), [pt(u, v), pt(v, u), pt(-u, -v), pt(u, -v)].map((x) => M(`\\overrightarrow{n} = ${x}`))),
          explanation: `$d$ có vectơ chỉ phương $\\overrightarrow{u} = ${pt(u, v)}$ nên có vectơ pháp tuyến $\\overrightarrow{n} = ${pt(v, -u)}$ (hoặc $${pt(-v, u)}$).` };
      }
      const t0 = r.pick([1, -1, 2]), P = [x0 + u * t0, y0 + v * t0];
      const cand = [[u, v], [-x0, -y0], [x0 + v, y0 + u], [x0 + u, y0 - v], [y0, x0]].filter((p) => !on(p));
      return { stem: `Trong mặt phẳng $Oxy$, điểm nào sau đây thuộc đường thẳng $d: ${d}$?`,
        ...mcq(r, M(pt(P[0], P[1])), cand.map((p) => M(pt(p[0], p[1])))),
        explanation: `Với $t = ${t0}$ ta có $x = ${x0}${term(u * t0)} = ${P[0]}$, $y = ${y0}${term(v * t0)} = ${P[1]}$ nên điểm $${pt(P[0], P[1])}$ thuộc $d$. Với các điểm còn lại, không có giá trị $t$ nào thỏa mãn đồng thời hai phương trình.` };
    },
  },
  {
    id: "t10k2-dt-lap-phuong-trinh", ...B7, topic: "Lập phương trình tổng quát của đường thẳng", level: 2, kind: "mcq",
    make: (r) => {
      const x0 = r.int(-5, 5), y0 = r.int(-5, 5), t = r.int(0, 3);
      const lt = (a: number, b: number, c: number) => M(lineT(a, b, c));
      const Mp = `M${pt(x0, y0)}`;
      if (t === 0) {
        const a = r.nz(-4, 4), b = r.nz(-4, 4), k = a * x0 + b * y0;
        return { stem: `Trong mặt phẳng $Oxy$, phương trình tổng quát của đường thẳng $d$ đi qua điểm $${Mp}$ và có vectơ pháp tuyến $\\overrightarrow{n} = ${pt(a, b)}$ là`,
          ...mcq(r, lt(a, b, -k), [lt(a, b, k), lt(b, -a, -(b * x0 - a * y0)), lt(a, b, -(a * y0 + b * x0)), lt(b, -a, b * x0 - a * y0)]),
          explanation: `$d: ${pnEq(a, b, x0, y0)} \\Leftrightarrow ${lineT(a, b, -k)}$.` };
      }
      if (t === 1) {
        let u = r.int(-5, 5), v = r.int(-5, 5); need(u !== 0 || v !== 0);
        const xB = x0 + u, yB = y0 + v, g = gcd(u, v); u /= g; v /= g;
        return { stem: `Trong mặt phẳng $Oxy$, phương trình tổng quát của đường thẳng đi qua hai điểm $A${pt(x0, y0)}$ và $B${pt(xB, yB)}$ là`,
          ...mcq(r, lt(v, -u, -(v * x0 - u * y0)), [lt(u, v, -(u * x0 + v * y0)), lt(v, -u, v * x0 - u * y0), lt(u, v, -(u * xB + v * yB)), lt(v, u, -(v * x0 + u * y0))]),
          explanation: `$\\overrightarrow{AB} = ${pt(xB - x0, yB - y0)}$ cùng phương với $\\overrightarrow{u} = ${pt(u, v)}$ nên đường thẳng $AB$ có vectơ pháp tuyến $\\overrightarrow{n} = ${pt(v, -u)}$. Phương trình: $${pnEq(v, -u, x0, y0)} \\Leftrightarrow ${lineT(v, -u, -(v * x0 - u * y0))}$.` };
      }
      const a = r.nz(-4, 4), b = r.nz(-4, 4), c = r.int(-9, 9); need(a * x0 + b * y0 + c !== 0);
      const dT = `${L(a, b, c)} = 0`;
      if (t === 2) return { stem: `Trong mặt phẳng $Oxy$, đường thẳng đi qua điểm $${Mp}$ và song song với đường thẳng $\\Delta: ${dT}$ có phương trình là`,
        ...mcq(r, lt(a, b, -(a * x0 + b * y0)), [lt(b, -a, -(b * x0 - a * y0)), lt(a, b, c), lt(a, b, a * x0 + b * y0), lt(a, -b, -(a * x0 - b * y0))]),
        explanation: `Đường thẳng cần tìm song song với $\\Delta$ nên nhận $\\overrightarrow{n} = ${pt(a, b)}$ làm vectơ pháp tuyến: $${pnEq(a, b, x0, y0)} \\Leftrightarrow ${lineT(a, b, -(a * x0 + b * y0))}$ (khác $\\Delta$ vì $M\\notin\\Delta$).` };
      return { stem: `Trong mặt phẳng $Oxy$, đường thẳng đi qua điểm $${Mp}$ và vuông góc với đường thẳng $\\Delta: ${dT}$ có phương trình là`,
        ...mcq(r, lt(b, -a, -(b * x0 - a * y0)), [lt(a, b, -(a * x0 + b * y0)), lt(b, -a, b * x0 - a * y0), lt(b, a, -(b * x0 + a * y0)), lt(a, -b, -(a * x0 - b * y0))]),
        explanation: `Đường thẳng cần tìm vuông góc với $\\Delta$ nên nhận vectơ pháp tuyến của $\\Delta$ là $${pt(a, b)}$ làm vectơ chỉ phương, do đó có vectơ pháp tuyến $${pt(b, -a)}$: $${pnEq(b, -a, x0, y0)} \\Leftrightarrow ${lineT(b, -a, -(b * x0 - a * y0))}$.` };
    },
  },
  {
    id: "t10k2-dt-vi-tri-tuong-doi", ...B7, topic: "Vị trí tương đối của hai đường thẳng", level: 1, kind: "mcq",
    make: (r) => {
      const cs = r.int(0, 3), a1 = r.nz(-4, 4), b1 = r.nz(-4, 4), qx = r.int(-4, 4), qy = r.int(-4, 4), c1 = -(a1 * qx + b1 * qy);
      let a2: number, b2: number;
      if (cs === 0) { a2 = r.nz(-4, 4); b2 = r.nz(-4, 4); need(a1 * b2 - a2 * b1 !== 0 && a1 * a2 + b1 * b2 !== 0); }
      else if (cs === 1) { const k = r.nz(-2, 2); a2 = -k * b1; b2 = k * a1; }
      else { const k = r.pick([-3, -2, -1, 2, 3]); a2 = k * a1; b2 = k * b1; }
      let P: number[];
      if (cs === 3) { const tt = r.nz(-2, 2); P = [qx + tt * b1, qy - tt * a1]; }
      else { P = [r.int(-5, 5), r.int(-5, 5)]; if (cs === 2) need(a1 * P[0] + b1 * P[1] + c1 !== 0); }
      const c2 = -(a2 * P[0] + b2 * P[1]);
      const isPar = r.chance(0.4), sg = r.pick([1, -1]), g = gcd(a2, b2);
      const u2 = [(sg * b2) / g, (-sg * a2) / g];
      const d2 = isPar ? param(P[0], P[1], u2[0], u2[1]) : `${L(a2, b2, c2)} = 0`;
      const OPT = ["Cắt nhau nhưng không vuông góc", "Vuông góc với nhau", "Song song với nhau", "Trùng nhau"];
      const n2 = isPar ? `$d_2$ có vectơ chỉ phương $${pt(u2[0], u2[1])}$ nên có vectơ pháp tuyến $\\overrightarrow{n_2} = ${pt(-u2[1], u2[0])}$` : `$\\overrightarrow{n_2} = ${pt(a2, b2)}$`;
      const nn = isPar ? [-u2[1], u2[0]] : [a2, b2], dot = a1 * nn[0] + b1 * nn[1], v1 = a1 * P[0] + b1 * P[1] + c1;
      const why = [
        `hai vectơ pháp tuyến không cùng phương nên $d_1$, $d_2$ cắt nhau; $\\overrightarrow{n_1}\\cdot\\overrightarrow{n_2} = ${dot} \\ne 0$ nên chúng không vuông góc`,
        `$\\overrightarrow{n_1}\\cdot\\overrightarrow{n_2} = ${a1}\\cdot ${pr(nn[0])} + ${pr(b1)}\\cdot ${pr(nn[1])} = 0$ nên $d_1 \\perp d_2$`,
        `hai vectơ pháp tuyến cùng phương nên $d_1$, $d_2$ song song hoặc trùng nhau; điểm $${pt(P[0], P[1])}\\in d_2$ có $${L(a1, b1, c1)} = ${v1} \\ne 0$ nên không thuộc $d_1$. Vậy $d_1 \\parallel d_2$`,
        `hai vectơ pháp tuyến cùng phương và điểm $${pt(P[0], P[1])}\\in d_2$ cũng thuộc $d_1$ (vì $${L(a1, b1, c1)} = 0$) nên $d_1$ trùng $d_2$`,
      ][cs];
      return {
        stem: `Trong mặt phẳng $Oxy$, cho hai đường thẳng $d_1: ${L(a1, b1, c1)} = 0$ và $d_2: ${d2}$. Vị trí tương đối của $d_1$ và $d_2$ là`,
        ...mcq(r, OPT[cs], OPT.filter((_, i) => i !== cs)),
        explanation: `$d_1$ có vectơ pháp tuyến $\\overrightarrow{n_1} = ${pt(a1, b1)}$; ${n2}. Ta thấy ${why}.`,
      };
    },
  },
  {
    id: "t10k2-khoang-cach-diem-dt", ...B7, topic: "Khoảng cách từ một điểm đến một đường thẳng", level: 1, kind: "mcq",
    make: (r) => {
      const [a0, b0] = r.pick([[3, 4], [4, 3], [5, 12], [12, 5], [6, 8], [8, 6], [1, 1], [1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [3, 2]]);
      const a = a0, b = b0 * r.pick([1, -1]), c = r.int(-9, 9), x0 = r.int(-5, 5), y0 = r.int(-5, 5);
      const num = a * x0 + b * y0 + c; need(num !== 0);
      const s = a * a + b * b, d = radTex(Math.abs(num), s, s);
      const tg = r.chance(0.3);
      const w = [String(Math.abs(num)), frac(Math.abs(num), s), radTex(Math.abs(a * x0 + b * y0 - c) || 1, s, s), radTex(Math.abs(num), 1, s), radTex(Math.abs(a * y0 + b * x0 + c) || 1, s, s)];
      return {
        stem: tg ? `Trong mặt phẳng $Oxy$, bán kính của đường tròn tâm $I${pt(x0, y0)}$ tiếp xúc với đường thẳng $\\Delta: ${L(a, b, c)} = 0$ bằng`
          : `Trong mặt phẳng $Oxy$, khoảng cách từ điểm $M${pt(x0, y0)}$ đến đường thẳng $\\Delta: ${L(a, b, c)} = 0$ bằng`,
        ...mcq(r, M(d), w.filter((x) => x !== d).map(M)),
        explanation: `${tg ? "Bán kính bằng khoảng cách từ tâm đến tiếp tuyến: " : ""}$d = \\dfrac{|${a}\\cdot ${pr(x0)} + ${pr(b)}\\cdot ${pr(y0)}${term(c)}|}{\\sqrt{${a}^2 + ${pr(b)}^2}} = \\dfrac{${Math.abs(num)}}{\\sqrt{${s}}} = ${d}$.`,
      };
    },
  },
  {
    id: "t10k2-goc-hai-duong-thang", ...B7, topic: "Góc giữa hai đường thẳng", level: 2, kind: "mcq",
    make: (r) => {
      if (r.chance(0.7)) {
        const INC: Record<number, { e: (m: number) => string; n: string }> = {
          0: { e: (m) => `y${term(m)} = 0`, n: "(0;\\ 1)" }, 90: { e: (m) => `x${term(m)} = 0`, n: "(1;\\ 0)" },
          45: { e: (m) => `x - y${term(m)} = 0`, n: "(1;\\ -1)" }, 135: { e: (m) => `x + y${term(m)} = 0`, n: "(1;\\ 1)" },
          60: { e: (m) => `\\sqrt{3}x - y${term(m)} = 0`, n: "(\\sqrt{3};\\ -1)" }, 120: { e: (m) => `\\sqrt{3}x + y${term(m)} = 0`, n: "(\\sqrt{3};\\ 1)" },
          30: { e: (m) => `x - \\sqrt{3}y${term(m)} = 0`, n: "(1;\\ -\\sqrt{3})" }, 150: { e: (m) => `x + \\sqrt{3}y${term(m)} = 0`, n: "(1;\\ \\sqrt{3})" },
        };
        const K = [0, 30, 45, 60, 90, 120, 135, 150];
        const t1 = r.pick(K), t2 = r.pick(K); let ang = Math.abs(t1 - t2); if (ang > 90) ang = 180 - ang;
        need([30, 45, 60, 90].includes(ang));
        const COS: Record<number, string> = { 30: "\\dfrac{\\sqrt{3}}{2}", 45: "\\dfrac{\\sqrt{2}}{2}", 60: "\\dfrac{1}{2}", 90: "0" };
        return {
          stem: `Trong mặt phẳng $Oxy$, góc giữa hai đường thẳng $d_1: ${INC[t1].e(r.int(-6, 6))}$ và $d_2: ${INC[t2].e(r.int(-6, 6))}$ bằng`,
          ...mcq(r, M(`${ang}^\\circ`), [30, 45, 60, 90, 120, 135, 150].filter((x) => x !== ang && x !== 180 - ang).slice(0, 3).map((x) => M(`${x}^\\circ`))),
          explanation: `$d_1$, $d_2$ có vectơ pháp tuyến lần lượt là $\\overrightarrow{n_1} = ${INC[t1].n}$, $\\overrightarrow{n_2} = ${INC[t2].n}$. Ta có $\\cos(d_1, d_2) = \\dfrac{|\\overrightarrow{n_1}\\cdot\\overrightarrow{n_2}|}{|\\overrightarrow{n_1}|\\cdot|\\overrightarrow{n_2}|} = ${COS[ang]}$, nên góc giữa $d_1$ và $d_2$ bằng $${ang}^\\circ$ (góc giữa hai đường thẳng luôn thuộc $[0^\\circ;\\ 90^\\circ]$).`,
        };
      }
      const a1 = r.nz(-4, 4), b1 = r.nz(-4, 4), a2 = r.nz(-4, 4), b2 = r.nz(-4, 4);
      const dot = a1 * a2 + b1 * b2, s1 = a1 * a1 + b1 * b1, s2 = a2 * a2 + b2 * b2, cr = a1 * b2 - a2 * b1;
      need(dot !== 0 && cr !== 0);
      const cor = radTex(Math.abs(dot), s1 * s2, s1 * s2);
      const w = [radTex(Math.abs(cr), s1 * s2, s1 * s2), frac(Math.abs(dot), s1 * s2), radTex(-Math.abs(dot), s1 * s2, s1 * s2), frac(Math.abs(dot), s1 + s2)];
      return {
        stem: `Trong mặt phẳng $Oxy$, gọi $\\varphi$ là góc giữa hai đường thẳng $d_1: ${L(a1, b1, r.int(-6, 6))} = 0$ và $d_2: ${L(a2, b2, r.int(-6, 6))} = 0$. Giá trị của $\\cos\\varphi$ bằng`,
        ...mcq(r, M(cor), w.filter((x) => x !== cor).map(M)),
        explanation: `$\\cos\\varphi = \\dfrac{|a_1a_2 + b_1b_2|}{\\sqrt{a_1^2 + b_1^2}\\cdot\\sqrt{a_2^2 + b_2^2}} = \\dfrac{|${dot}|}{\\sqrt{${s1}}\\cdot\\sqrt{${s2}}} = ${cor}$.`,
      };
    },
  },
  {
    id: "t10k2-duong-tron-tam-ban-kinh", ...B7, topic: "Tâm và bán kính của đường tròn; nhận dạng phương trình đường tròn", level: 1, kind: "mcq",
    make: (r) => {
      const a = r.nz(-5, 5), b = r.nz(-5, 5), ask = r.int(0, 4);
      if (ask === 4) {
        const c = r.int(-9, 9), R2 = a * a + b * b - c; need(R2 > 0);
        const cb = a * a + b * b + r.int(1, 9);
        return { stem: "Trong mặt phẳng $Oxy$, phương trình nào sau đây là phương trình của một đường tròn?",
          ...mcq(r, M(circE(a, b, c)), [circE(a, b, cb), `x^2 + 2y^2${term(-2 * a, "x")}${term(-2 * b, "y")}${term(c)} = 0`, `x^2 - y^2${term(-2 * a, "x")}${term(-2 * b, "y")}${term(c)} = 0`, `x^2 + y^2 + 2xy${term(-2 * a, "x")}${term(c)} = 0`].map(M)),
          explanation: `Phương trình $x^2 + y^2 - 2ax - 2by + c = 0$ là phương trình đường tròn khi và chỉ khi $a^2 + b^2 - c > 0$. Phương trình $${circE(a, b, c)}$ có $a = ${a}$, $b = ${b}$, $c = ${c}$ và $a^2 + b^2 - c = ${R2} > 0$. Phương trình $${circE(a, b, cb)}$ có $a^2 + b^2 - c = ${a * a + b * b - cb} < 0$; các phương trình còn lại có hệ số của $x^2$, $y^2$ khác nhau hoặc chứa hạng tử $xy$.` };
      }
      const exp = ask >= 2;
      let R2: number, eq: string, c = 0;
      if (exp) { c = r.int(-12, 9); R2 = a * a + b * b - c; need(R2 > 0); eq = circE(a, b, c); }
      else { R2 = r.int(1, 30); eq = circ(a, b, R2); }
      const ctr = ask % 2 === 0;
      if (ctr) return { stem: `Trong mặt phẳng $Oxy$, tâm $I$ của đường tròn $(C): ${eq}$ có tọa độ là`,
        ...mcq(r, M(`I${pt(a, b)}`), [pt(-a, -b), pt(a, -b), pt(-a, b), pt(2 * a, 2 * b), pt(-2 * a, -2 * b)].map((x) => M(`I${x}`))),
        explanation: exp ? `Phương trình có dạng $x^2 + y^2 - 2ax - 2by + c = 0$ với $-2a = ${-2 * a}$, $-2b = ${-2 * b}$ nên tâm $I${pt(a, b)}$.` : `Đường tròn $(x - a)^2 + (y - b)^2 = R^2$ có tâm $I(a;\\ b)$, ở đây $I${pt(a, b)}$.` };
      const R = sqrtTex(R2);
      const w = [String(R2), sqrtTex(R2 + 2 * c * c + 1), sqrtTex(a * a + b * b + Math.abs(c) + 1), String(2 * R2), sqrtTex(4 * R2)];
      return { stem: `Trong mặt phẳng $Oxy$, bán kính của đường tròn $(C): ${eq}$ bằng`,
        ...mcq(r, M(`R = ${R}`), w.filter((x) => x !== R).map((x) => M(`R = ${x}`))),
        explanation: exp ? `Ta có $a = ${a}$, $b = ${b}$, $c = ${c}$ nên $R = \\sqrt{a^2 + b^2 - c} = \\sqrt{${R2}} = ${R}$.` : `Ta có $R^2 = ${R2}$ nên $R = ${R}$.` };
    },
  },
  {
    id: "t10k2-duong-tron-lap-pt", ...B7, topic: "Lập phương trình đường tròn", level: 2, kind: "mcq",
    make: (r) => {
      const a = r.int(-5, 5), b = r.int(-5, 5), t = r.int(0, 2);
      need(a !== 0 || b !== 0);
      if (t <= 1) {
        const u = r.nz(-4, 4), v = r.nz(-4, 4), R2 = u * u + v * v;
        const w = [circ(-a, -b, R2), circ(a, b, sqrtTex(R2)), circ(a, b, t === 1 ? 4 * R2 : 2 * R2), circ(-a, -b, sqrtTex(R2))];
        if (t === 0) return { stem: `Trong mặt phẳng $Oxy$, phương trình đường tròn có tâm $I${pt(a, b)}$ và đi qua điểm $A${pt(a + u, b + v)}$ là`,
          ...mcq(r, M(circ(a, b, R2)), w.map(M)),
          explanation: `Bán kính $R = IA = \\sqrt{${pr(u)}^2 + ${pr(v)}^2} = \\sqrt{${R2}}$ nên $R^2 = ${R2}$. Phương trình: $${circ(a, b, R2)}$.` };
        return { stem: `Trong mặt phẳng $Oxy$, phương trình đường tròn đường kính $AB$ với $A${pt(a + u, b + v)}$, $B${pt(a - u, b - v)}$ là`,
          ...mcq(r, M(circ(a, b, R2)), w.map(M)),
          explanation: `Tâm $I$ là trung điểm $AB$: $I${pt(a, b)}$. Bán kính $R = \\dfrac{AB}{2}$, với $AB^2 = ${4 * R2}$ nên $R^2 = \\dfrac{AB^2}{4} = ${R2}$. Phương trình: $${circ(a, b, R2)}$.` };
      }
      const [p, q, s] = r.pick([[3, 4, 5], [4, 3, 5], [3, -4, 5], [4, -3, 5], [5, 12, 13], [12, -5, 13], [6, 8, 10], [8, -6, 10]]);
      const R = r.int(1, 4), num = R * s * r.pick([1, -1]), c = num - (p * a + q * b);
      return { stem: `Trong mặt phẳng $Oxy$, phương trình đường tròn có tâm $I${pt(a, b)}$ và tiếp xúc với đường thẳng $\\Delta: ${L(p, q, c)} = 0$ là`,
        ...mcq(r, M(circ(a, b, R * R)), [circ(a, b, R), circ(-a, -b, R * R), circ(a, b, num * num), circ(-a, -b, R)].filter((x) => x !== circ(a, b, R * R)).map(M)),
        explanation: `Bán kính $R = d(I, \\Delta) = \\dfrac{|${p}\\cdot ${pr(a)} + ${pr(q)}\\cdot ${pr(b)}${term(c)}|}{\\sqrt{${p}^2 + ${pr(q)}^2}} = \\dfrac{${Math.abs(num)}}{${s}} = ${R}$. Phương trình: $${circ(a, b, R * R)}$.` };
    },
  },
  {
    id: "t10k2-conic-nhan-dang", ...B7, topic: "Phương trình chính tắc của ba đường conic; tiêu điểm, đường chuẩn parabol", level: 1, kind: "mcq",
    make: (r) => {
      const ask = r.int(0, 4);
      let A: number, B: number;
      if (r.chance(0.6)) { const a = r.int(2, 7), b = r.int(1, a - 1); A = a * a; B = b * b; } else { A = r.int(5, 30); B = r.int(1, A - 1); }
      const N = r.int(1, 12) * r.pick([1, 2]);
      const el = (x: number, y: number) => `\\dfrac{x^2}{${x}} + \\dfrac{y^2}{${y}} = 1`, hy = (x: number, y: number) => `\\dfrac{x^2}{${x}} - \\dfrac{y^2}{${y}} = 1`;
      const pa = `y^2 = ${N}x`;
      if (ask === 0) return { stem: "Trong mặt phẳng $Oxy$, phương trình nào sau đây là phương trình chính tắc của một elip?",
        ...mcq(r, M(el(A, B)), [hy(A, B), el(B, A), pa, `\\dfrac{x}{${A}} + \\dfrac{y}{${B}} = 1`].map(M)),
        explanation: `Phương trình chính tắc của elip có dạng $\\dfrac{x^2}{a^2} + \\dfrac{y^2}{b^2} = 1$ với $a > b > 0$. Phương trình $${el(A, B)}$ có $a^2 = ${A} > b^2 = ${B}$ nên thỏa mãn; $${el(B, A)}$ có $a^2 < b^2$ nên không phải dạng chính tắc.` };
      if (ask === 1) return { stem: "Trong mặt phẳng $Oxy$, phương trình nào sau đây là phương trình chính tắc của một hypebol?",
        ...mcq(r, M(hy(A, B)), [el(A, B), `\\dfrac{y^2}{${A}} - \\dfrac{x^2}{${B}} = 1`, `x^2 = ${N}y`, `\\dfrac{x^2}{${A}} + \\dfrac{y^2}{${B}} = 0`].map(M)),
        explanation: `Phương trình chính tắc của hypebol có dạng $\\dfrac{x^2}{a^2} - \\dfrac{y^2}{b^2} = 1$ với $a, b > 0$. Vậy chọn $${hy(A, B)}$.` };
      if (ask === 2) return { stem: "Trong mặt phẳng $Oxy$, phương trình nào sau đây là phương trình chính tắc của một parabol?",
        ...mcq(r, M(pa), [`x^2 = ${N}y`, `y^2 = -${N}x`, `y = ${N}x^2`, el(A, B)].map(M)),
        explanation: `Phương trình chính tắc của parabol có dạng $y^2 = 2px$ với $p > 0$. Phương trình $${pa}$ có $2p = ${N}$, $p = ${frac(N, 2)} > 0$ nên thỏa mãn.` };
      const p2 = frac(N, 4);
      if (ask === 3) return { stem: `Trong mặt phẳng $Oxy$, parabol $(P): ${pa}$ có tiêu điểm là`,
        ...mcq(r, M(`F${pt(p2, 0)}`), [pt(frac(N, 2), 0), pt(N, 0), pt(frac(-N, 4), 0), pt(0, p2)].map((x) => M(`F${x}`))),
        explanation: `$(P): y^2 = 2px$ với $2p = ${N}$ nên $p = ${frac(N, 2)}$, tiêu điểm $F\\left(\\dfrac{p}{2};\\ 0\\right) = F${pt(p2, 0)}$.` };
      return { stem: `Trong mặt phẳng $Oxy$, đường chuẩn của parabol $(P): ${pa}$ có phương trình là`,
        ...mcq(r, M(`x = ${frac(-N, 4)}`), [`x = ${p2}`, `x = ${frac(-N, 2)}`, `y = ${frac(-N, 4)}`, `x = ${-N}`].map(M)),
        explanation: `$(P): y^2 = 2px$ với $p = ${frac(N, 2)}$ có đường chuẩn $\\Delta: x = -\\dfrac{p}{2} = ${frac(-N, 4)}$.` };
    },
  },
  {
    id: "t10k2-elip-hypebol-yeu-to", ...B7, topic: "Các yếu tố của elip, hypebol (trục, tiêu điểm, tiêu cự)", level: 1, kind: "mcq",
    make: (r) => {
      const hyp = r.chance(0.4);
      let A: number, B: number;
      if (!hyp && r.chance(0.5)) { const [a, b] = r.pick([[5, 4], [5, 3], [13, 12], [13, 5], [10, 8], [10, 6], [17, 15], [17, 8], [25, 24], [15, 12], [15, 9]]); A = a * a; B = b * b; }
      else if (hyp && r.chance(0.5)) { const [a, b] = r.pick([[3, 4], [4, 3], [5, 12], [12, 5], [6, 8], [8, 6], [8, 15], [15, 8], [9, 12]]); A = a * a; B = b * b; }
      else { A = r.int(5, 40); B = hyp ? r.int(1, 40) : r.int(1, A - 1); }
      const c2 = hyp ? A + B : A - B, alt = hyp ? Math.abs(A - B) : A + B;
      const nm = hyp ? "hypebol" : "elip", eq = `\\dfrac{x^2}{${A}} ${hyp ? "-" : "+"} \\dfrac{y^2}{${B}} = 1`;
      const two = (n: number) => radTex(2, 1, n);
      const ask = r.int(0, 3);
      const rule = hyp ? `$c^2 = a^2 + b^2 = ${A} + ${B} = ${c2}$` : `$c^2 = a^2 - b^2 = ${A} - ${B} = ${c2}$`;
      if (ask === 0) {
        const c = sqrtTex(c2), F = (x: string) => `F_1${pt("-" + x, 0)},\\ F_2${pt(x, 0)}`;
        const w = [alt ? F(sqrtTex(alt)) : "", `F_1${pt(0, "-" + c)},\\ F_2${pt(0, c)}`, F(String(c2)), F(two(c2))].filter(Boolean);
        return { stem: `Trong mặt phẳng $Oxy$, ${nm} $(${hyp ? "H" : "E"}): ${eq}$ có hai tiêu điểm là`,
          ...mcq(r, M(F(c)), w.map(M)),
          explanation: `Ta có $a^2 = ${A}$, $b^2 = ${B}$, ${rule}, nên $c = ${c}$. Hai tiêu điểm là $F_1(-c;\\ 0)$, $F_2(c;\\ 0)$, tức $${F(c)}$.` };
      }
      if (ask === 1) return { stem: `Trong mặt phẳng $Oxy$, tiêu cự của ${nm} $(${hyp ? "H" : "E"}): ${eq}$ bằng`,
        ...mcq(r, M(two(c2)), [sqrtTex(c2), alt ? two(alt) : "", String(2 * c2), String(c2)].filter((x) => x && x !== two(c2)).map(M)),
        explanation: `Ta có ${rule}, $c = ${sqrtTex(c2)}$. Tiêu cự bằng $2c = ${two(c2)}$.` };
      const big = ask === 2, v = big ? A : B;
      const nmAx = hyp ? (big ? "trục thực" : "trục ảo") : (big ? "trục lớn" : "trục nhỏ");
      return { stem: `Trong mặt phẳng $Oxy$, độ dài ${nmAx} của ${nm} $(${hyp ? "H" : "E"}): ${eq}$ bằng`,
        ...mcq(r, M(two(v)), [sqrtTex(v), String(2 * v), two(big ? B : A), two(c2)].filter((x) => x !== two(v)).map(M)),
        explanation: `Ta có $a^2 = ${A}$, $b^2 = ${B}$ nên $a = ${sqrtTex(A)}$, $b = ${sqrtTex(B)}$. Độ dài ${nmAx} bằng $${big ? "2a" : "2b"} = ${two(v)}$.` };
    },
  },

  /* ===================== CHƯƠNG VII – TF ===================== */
  {
    id: "t10k2-tf-tam-giac-toa-do", ...B7, topic: "Tam giác trong mặt phẳng tọa độ (Đúng/Sai)", level: 2, kind: "tf",
    make: (r) => {
      const xA = r.int(-4, 4), yA = r.int(-4, 4), u = r.nz(-4, 4), v = r.nz(-4, 4), xB = xA + u, yB = yA + v;
      const right = r.chance(0.5), k = r.nz(-2, 2);
      const [xC, yC] = right ? [xA - k * v, yA + k * u] : [xA + r.nz(-4, 4), yA + r.nz(-4, 4)];
      const ux = xC - xB, uy = yC - yB; need(u * (yC - yA) - v * (xC - xA) !== 0);
      const dot = u * (xC - xA) + v * (yC - yA), isR = dot === 0;
      const s = [r.chance(0.5), r.chance(0.5), r.chance(0.5)];
      const sx = xA + xB + xC, sy = yA + yB + yC;
      const bcT = lineT(uy, -ux, -(uy * xB - ux * yB)), bcF = lineT(ux, uy, -(ux * xB + uy * yB));
      return {
        stem: `Trong mặt phẳng $Oxy$, cho tam giác $ABC$ có $A${pt(xA, yA)}$, $B${pt(xB, yB)}$, $C${pt(xC, yC)}$. Xét tính đúng sai của các khẳng định sau.`,
        ...tf([
          [`$\\overrightarrow{AB} = ${s[0] ? pt(u, v) : pt(-u, -v)}$`, s[0]],
          [`Trọng tâm của tam giác $ABC$ là $G${s[1] ? pt(frac(sx, 3), frac(sy, 3)) : pt(sx, sy)}$`, s[1] || (sx === 0 && sy === 0)],
          [`Đường thẳng $BC$ có phương trình $${s[2] ? bcT : bcF}$`, s[2] || bcT === bcF],
          [`Tam giác $ABC$ vuông tại $A$`, isR],
        ]),
        explanation: `$\\overrightarrow{AB} = ${pt(u, v)}$. Trọng tâm $G\\left(\\dfrac{x_A + x_B + x_C}{3};\\ \\dfrac{y_A + y_B + y_C}{3}\\right) = ${pt(frac(sx, 3), frac(sy, 3))}$. $\\overrightarrow{BC} = ${pt(ux, uy)}$ nên $BC$ có vectơ pháp tuyến $${pt(uy, -ux)}$, phương trình $${bcT}$. $\\overrightarrow{AC} = ${pt(xC - xA, yC - yA)}$, $\\overrightarrow{AB}\\cdot\\overrightarrow{AC} = ${dot}$ ${isR ? "$= 0$ nên tam giác vuông tại $A$" : "$\\ne 0$ nên tam giác không vuông tại $A$"}.`,
      };
    },
  },
  {
    id: "t10k2-tf-duong-tron", ...B7, topic: "Đường tròn: tâm, bán kính, vị trí điểm, tiếp tuyến (Đúng/Sai)", level: 3, kind: "tf",
    make: (r) => {
      const a = r.nz(-4, 4), b = r.nz(-4, 4), u = r.nz(-4, 4), v = r.int(-4, 4), R2 = u * u + v * v, c = a * a + b * b - R2;
      const xA = a + u, yA = b + v, R = sqrtTex(R2);
      const mx = r.int(-6, 6), my = r.int(-6, 6), IM2 = (mx - a) ** 2 + (my - b) ** 2; need(IM2 !== R2);
      const askIn = r.chance(0.5), inside = IM2 < R2;
      const s = [r.chance(0.5), r.chance(0.5), r.chance(0.5)];
      const tg = lineT(u, v, -(u * xA + v * yA)), tgF = lineT(v, -u, -(v * xA - u * yA));
      need(R2 > 1);
      return {
        stem: `Trong mặt phẳng $Oxy$, cho đường tròn $(C): ${circE(a, b, c)}$ và điểm $A${pt(xA, yA)}$. Xét tính đúng sai của các khẳng định sau.`,
        ...tf([
          [`$(C)$ có tâm $I${s[0] ? pt(a, b) : pt(-a, -b)}$`, s[0]],
          [`$(C)$ có bán kính $R = ${s[1] ? R : String(R2)}$`, s[1]],
          [`Điểm $M${pt(mx, my)}$ nằm ${askIn ? "bên trong" : "bên ngoài"} đường tròn $(C)$`, askIn === inside],
          [`Tiếp tuyến của $(C)$ tại điểm $A$ có phương trình $${s[2] ? tg : tgF}$`, s[2]],
        ]),
        explanation: `$(C)$ có tâm $I${pt(a, b)}$, bán kính $R = \\sqrt{${a * a} + ${b * b} - (${c})} = ${R}$. $IM^2 = ${IM2}$ ${inside ? "$< R^2$ nên $M$ nằm trong" : "$> R^2$ nên $M$ nằm ngoài"} đường tròn. Điểm $A$ thuộc $(C)$; tiếp tuyến tại $A$ nhận $\\overrightarrow{IA} = ${pt(u, v)}$ làm vectơ pháp tuyến: $${pnEq(u, v, xA, yA)} \\Leftrightarrow ${tg}$.`,
      };
    },
  },

  /* ===================== CHƯƠNG VII – SHORT ===================== */
  {
    id: "t10k2-short-khoang-cach-dien-tich", ...B7, topic: "Khoảng cách, diện tích tam giác bằng tọa độ", level: 3, kind: "short",
    make: (r) => {
      const t = r.int(0, 3);
      if (t === 0) {
        const xA = r.int(-5, 5), yA = r.int(-5, 5), xB = r.int(-5, 5), yB = r.int(-5, 5), xC = r.int(-5, 5), yC = r.int(-5, 5);
        const det = (xB - xA) * (yC - yA) - (xC - xA) * (yB - yA); need(det !== 0);
        const Sv = Math.abs(det) / 2, f = fit(Sv, 1);
        const bc2 = (xC - xB) ** 2 + (yC - yB) ** 2;
        return { stem: `Trong mặt phẳng $Oxy$, cho tam giác $ABC$ có $A${pt(xA, yA)}$, $B${pt(xB, yB)}$, $C${pt(xC, yC)}$. Tính diện tích tam giác $ABC$.`,
          ...short(Sv, f.dp),
          explanation: `$BC = \\sqrt{${bc2}}$; đường thẳng $BC$: $${lineT(yC - yB, -(xC - xB), -((yC - yB) * xB - (xC - xB) * yB))}$; $d(A, BC) = \\dfrac{${Math.abs(det)}}{\\sqrt{${bc2}}}$. Vậy $S = \\dfrac{1}{2}\\cdot BC\\cdot d(A, BC) = \\dfrac{${Math.abs(det)}}{2} = ${tex(Sv)}$.` };
      }
      if (t === 1) {
        const a = r.nz(-5, 5), b = r.nz(-5, 5), c = r.int(-9, 9), x0 = r.int(-5, 5), y0 = r.int(-5, 5), num = a * x0 + b * y0 + c, s = a * a + b * b;
        need(num !== 0); const d = Math.abs(num) / Math.sqrt(s), f = fit(d, 2);
        return { stem: `Trong mặt phẳng $Oxy$, tính khoảng cách từ điểm $M${pt(x0, y0)}$ đến đường thẳng $\\Delta: ${L(a, b, c)} = 0$${withNote(f.note)}.`,
          ...short(d, f.dp),
          explanation: `$d(M, \\Delta) = \\dfrac{|${a}\\cdot ${pr(x0)} + ${pr(b)}\\cdot ${pr(y0)}${term(c)}|}{\\sqrt{${s}}} = \\dfrac{${Math.abs(num)}}{\\sqrt{${s}}}${f.note ? " \\approx " : " = "}${tex(d, f.dp)}$.` };
      }
      if (t === 2) {
        const a = r.nz(-5, 5), b = r.nz(-5, 5), c1 = r.int(-9, 9), k = r.pick([1, 2, -1, -2]), c2 = r.int(-9, 9) * k; need(c2 !== k * c1);
        const s = a * a + b * b, d = Math.abs(c2 / k - c1) / Math.sqrt(s), f = fit(d, 2);
        return { stem: `Trong mặt phẳng $Oxy$, tính khoảng cách giữa hai đường thẳng song song $d_1: ${L(a, b, c1)} = 0$ và $d_2: ${L(k * a, k * b, c2)} = 0$${withNote(f.note)}.`,
          ...short(d, f.dp),
          explanation: `${k !== 1 ? `Chia hai vế phương trình $d_2$ cho $${k}$: $d_2: ${L(a, b, c2 / k)} = 0$. ` : ""}Lấy điểm $M\\in d_1$, khoảng cách cần tìm là $d(M, d_2) = \\dfrac{|${c1} - (${c2 / k})|}{\\sqrt{${s}}}${f.note ? " \\approx " : " = "}${tex(d, f.dp)}$.` };
      }
      const [p, q, sq] = r.pick([[3, 4, 5], [4, 3, 5], [3, -4, 5], [4, -3, 5], [5, 12, 13], [12, -5, 13], [6, 8, 10], [8, -6, 10]]);
      const x0 = r.int(-5, 5), y0 = r.int(-5, 5), d = r.int(1, 4), k0 = p * x0 + q * y0;
      const ms = [-k0 + d * sq, -k0 - d * sq], askSum = r.chance(0.5), ans = askSum ? ms[0] + ms[1] : Math.max(...ms);
      return { stem: `Trong mặt phẳng $Oxy$, cho điểm $M${pt(x0, y0)}$ và đường thẳng $\\Delta: ${L(p, q, 0)} + m = 0$. ${askSum ? "Tính tổng các giá trị của tham số $m$" : "Tìm giá trị lớn nhất của tham số $m$"} để khoảng cách từ $M$ đến $\\Delta$ bằng $${d}$.`,
        ...short(ans, 0),
        explanation: `$d(M, \\Delta) = \\dfrac{|${k0} + m|}{${sq}} = ${d} \\Leftrightarrow |${k0} + m| = ${d * sq} \\Leftrightarrow m = ${ms[0]}$ hoặc $m = ${ms[1]}$. Đáp số: $${ans}$.` };
    },
  },
  {
    id: "t10k2-short-tiep-tuyen-duong-tron", ...B7, topic: "Tiếp tuyến của đường tròn", level: 3, kind: "short",
    make: (r) => {
      const a = r.int(-5, 5), b = r.int(-5, 5);
      if (r.chance(0.5)) {
        const [p, q, s] = r.pick([[3, 4, 5], [4, 3, 5], [3, -4, 5], [4, -3, 5], [5, 12, 13], [12, -5, 13], [6, 8, 10], [8, -6, 10]]);
        const R = r.int(1, 4), k0 = p * a + q * b, ms = [-k0 + R * s, -k0 - R * s];
        const ask = r.int(0, 2), ans = ask === 0 ? ms[0] + ms[1] : ask === 1 ? Math.max(...ms) : Math.min(...ms);
        return {
          stem: `Trong mặt phẳng $Oxy$, cho đường tròn $(C): ${circ(a, b, R * R)}$ và đường thẳng $\\Delta: ${L(p, q, 0)} + m = 0$. ${["Tính tổng các giá trị của $m$", "Tìm giá trị lớn nhất của $m$", "Tìm giá trị nhỏ nhất của $m$"][ask]} để $\\Delta$ tiếp xúc với $(C)$.`,
          ...short(ans, 0),
          explanation: `$(C)$ có tâm $I${pt(a, b)}$, bán kính $R = ${R}$. $\\Delta$ tiếp xúc $(C) \\Leftrightarrow d(I, \\Delta) = R \\Leftrightarrow \\dfrac{|${k0} + m|}{${s}} = ${R} \\Leftrightarrow m = ${ms[0]}$ hoặc $m = ${ms[1]}$. Đáp số: $${ans}$.`,
        };
      }
      const u = r.pick([1, -1]), v = r.nz(-4, 4), R2 = u * u + v * v, xA = a + u, yA = b + v;
      const bb = v / u, cc = -(xA + bb * yA);
      const E = r.pick([{ t: "b + c", v: bb + cc }, { t: "b - c", v: bb - cc }, { t: "2b + c", v: 2 * bb + cc }]);
      return {
        stem: `Trong mặt phẳng $Oxy$, cho đường tròn $(C): ${circE(a, b, a * a + b * b - R2)}$ và điểm $A${pt(xA, yA)}$ thuộc $(C)$. Tiếp tuyến của $(C)$ tại $A$ có phương trình $x + by + c = 0$. Tính $${E.t}$.`,
        ...short(E.v, 0),
        explanation: `$(C)$ có tâm $I${pt(a, b)}$. Tiếp tuyến tại $A$ nhận $\\overrightarrow{IA} = ${pt(u, v)}$ làm vectơ pháp tuyến: $${pnEq(u, v, xA, yA)} \\Leftrightarrow ${L(1, bb, cc)} = 0$. Vậy $b = ${bb}$, $c = ${cc}$, $${E.t} = ${E.v}$.`,
      };
    },
  },
  {
    id: "t10k2-short-conic", ...B7, topic: "Tính toán với elip, hypebol, parabol", level: 2, kind: "short",
    make: (r) => {
      const t = r.int(0, 3);
      if (t === 0) {
        const hyp = r.chance(0.4);
        const [a, b, c] = hyp ? r.pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [6, 8, 10], [8, 6, 10], [8, 15, 17], [15, 8, 17]]) : r.pick([[5, 4, 3], [5, 3, 4], [13, 12, 5], [13, 5, 12], [10, 8, 6], [10, 6, 8], [17, 15, 8], [17, 8, 15], [25, 24, 7], [15, 12, 9]]);
        return { stem: `Trong mặt phẳng $Oxy$, tính tiêu cự của ${hyp ? "hypebol" : "elip"} $\\dfrac{x^2}{${a * a}} ${hyp ? "-" : "+"} \\dfrac{y^2}{${b * b}} = 1$.`,
          ...short(2 * c, 0),
          explanation: `$c^2 = ${a * a} ${hyp ? "+" : "-"} ${b * b} = ${c * c}$ nên $c = ${c}$, tiêu cự $2c = ${2 * c}$.` };
      }
      if (t === 1) {
        const a = r.int(3, 12), c = r.int(1, a - 1), b2 = a * a - c * c, ask = r.chance(0.5);
        const v = ask ? b2 : a * a + b2;
        return { stem: `Trong mặt phẳng $Oxy$, elip $(E)$ có phương trình chính tắc $\\dfrac{x^2}{a^2} + \\dfrac{y^2}{b^2} = 1$, độ dài trục lớn bằng $${2 * a}$ và tiêu cự bằng $${2 * c}$. Tính $${ask ? "b^2" : "a^2 + b^2"}$.`,
          ...short(v, 0),
          explanation: `$2a = ${2 * a} \\Rightarrow a = ${a}$; $2c = ${2 * c} \\Rightarrow c = ${c}$; $b^2 = a^2 - c^2 = ${a * a} - ${c * c} = ${b2}$. Đáp số: $${v}$.` };
      }
      if (t === 2) {
        const N = 2 * r.int(1, 10), x0 = r.int(1, 15), val = x0 + N / 4, f = fit(val, 2);
        return { stem: `Trong mặt phẳng $Oxy$, cho parabol $(P): y^2 = ${N}x$ có tiêu điểm $F$. Điểm $M$ thuộc $(P)$ có hoành độ bằng $${x0}$. Tính độ dài $MF$.`,
          ...short(val, f.dp),
          explanation: `$2p = ${N} \\Rightarrow p = ${N / 2}$. Với $M(x_0;\\ y_0)\\in(P)$ ta có $MF = x_0 + \\dfrac{p}{2} = ${x0} + ${tex(N / 4)} = ${tex(val)}$.` };
      }
      const a = r.int(2, 15), b = r.int(1, a - 1), x0 = r.int(-a + 1, a - 1);
      return { stem: `Trong mặt phẳng $Oxy$, cho elip $(E): \\dfrac{x^2}{${a * a}} + \\dfrac{y^2}{${b * b}} = 1$ với hai tiêu điểm $F_1$, $F_2$. Điểm $M$ thuộc $(E)$ có hoành độ bằng $${x0}$. Tính $MF_1 + MF_2$.`,
        ...short(2 * a, 0),
        explanation: `Với mọi điểm $M$ thuộc elip ta có $MF_1 + MF_2 = 2a$. Ở đây $a^2 = ${a * a}$, $a = ${a}$ nên $MF_1 + MF_2 = ${2 * a}$ (không phụ thuộc vị trí của $M$).` };
    },
  },

  /* ===================== CHƯƠNG VIII – MCQ ===================== */
  {
    id: "t10k2-quy-tac-cong-nhan", ...B8, topic: "Quy tắc cộng, quy tắc nhân", level: 1, kind: "mcq",
    make: (r) => {
      const t = r.int(0, 4), m = r.int(3, 12), n = r.int(2, 10), p = r.int(2, 8);
      let stem: string, ans: number, w: number[], ex: string;
      if (t === 0) {
        stem = `Một lớp có $${m}$ học sinh nam và $${n}$ học sinh nữ. Có bao nhiêu cách chọn một học sinh của lớp đi dự đại hội?`;
        ans = m + n; w = [m * n, Cnk(m + n, 2), 2 * (m + n), Math.max(m, n)]; ex = `Chọn một học sinh nam ($${m}$ cách) hoặc một học sinh nữ ($${n}$ cách). Theo quy tắc cộng có $${m} + ${n} = ${ans}$ cách.`;
      } else if (t === 1) {
        stem = `Bạn An có $${m}$ chiếc áo khác nhau và $${n}$ chiếc quần khác nhau. Hỏi An có bao nhiêu cách chọn một bộ quần áo (gồm một áo và một quần)?`;
        ans = m * n; w = [m + n, Cnk(m + n, 2), m ** 2 * n, Ank(m + n, 2)]; ex = `Chọn áo có $${m}$ cách, ứng với mỗi cách chọn áo có $${n}$ cách chọn quần. Theo quy tắc nhân có $${m}\\cdot ${n} = ${ans}$ cách.`;
      } else if (t === 2) {
        const a = r.int(2, 6), b = r.int(2, 6), back = r.chance(0.5);
        stem = back ? `Từ thành phố A đến thành phố B có $${a}$ con đường, từ B đến C có $${b}$ con đường. Có bao nhiêu cách đi từ A đến C (qua B) rồi quay về A (qua B)?` : `Từ thành phố A đến thành phố B có $${a}$ con đường, từ B đến C có $${b}$ con đường. Có bao nhiêu cách đi từ A đến C, phải đi qua B?`;
        ans = back ? (a * b) ** 2 : a * b; w = back ? [a * b, 2 * a * b, a * b * (a - 1) * (b - 1), (a + b) ** 2] : [a + b, a ** b, b ** a, 2 * a * b];
        ex = back ? `Đi từ A đến C có $${a}\\cdot ${b} = ${a * b}$ cách, quay về cũng có $${a * b}$ cách. Theo quy tắc nhân có $${a * b}^2 = ${ans}$ cách.` : `Đi từ A đến B có $${a}$ cách, từ B đến C có $${b}$ cách. Theo quy tắc nhân có $${a}\\cdot ${b} = ${ans}$ cách.`;
      } else if (t === 3) {
        stem = `Thực đơn của một nhà hàng có $${m}$ món khai vị, $${n}$ món chính và $${p}$ món tráng miệng. Thực khách chọn một bữa ăn gồm một món khai vị, một món chính và một món tráng miệng. Có bao nhiêu cách chọn?`;
        ans = m * n * p; w = [m + n + p, m * n + p, m + n * p, Cnk(m + n + p, 3)]; ex = `Chọn lần lượt từng món, theo quy tắc nhân có $${m}\\cdot ${n}\\cdot ${p} = ${ans}$ cách.`;
      } else {
        stem = `Một hộp có $${m}$ viên bi đỏ, $${n}$ viên bi xanh và $${p}$ viên bi vàng (các viên bi đôi một khác nhau). Có bao nhiêu cách lấy ra một viên bi từ hộp?`;
        ans = m + n + p; w = [m * n * p, Cnk(m + n + p, 3), m * n + p, 3 * (m + n + p)]; ex = `Lấy một viên bi đỏ, hoặc xanh, hoặc vàng. Theo quy tắc cộng có $${m} + ${n} + ${p} = ${ans}$ cách.`;
      }
      return { stem, ...mcq(r, M(ans), w.filter((x) => x !== ans).map(M)), explanation: ex };
    },
  },
  {
    id: "t10k2-hoan-vi-chinh-hop-to-hop", ...B8, topic: "Hoán vị, chỉnh hợp, tổ hợp", level: 1, kind: "mcq",
    make: (r) => {
      const n = r.int(5, 12), k = r.int(2, 4), t = r.int(0, 3);
      if (t === 3) {
        const sym = r.int(0, 2);
        const opts = [`${AT(n, k)}`, `${CT(n, k)}`, `${n}!`, `${n}^{${k}}`, `${k}!`];
        const cor = [AT(n, k), CT(n, k), `${n}!`][sym];
        const st = [`Có $${n}$ học sinh. Số cách chọn ra $${k}$ học sinh và xếp họ vào $${k}$ vị trí khác nhau là`, `Có $${n}$ học sinh. Số cách chọn ra một nhóm $${k}$ học sinh là`, `Số cách xếp $${n}$ học sinh thành một hàng dọc là`][sym];
        return { stem: st, ...mcq(r, M(cor), opts.filter((x) => x !== cor).map(M)),
          explanation: ["Mỗi cách chọn có thứ tự $k$ phần tử từ $n$ phần tử là một chỉnh hợp chập $k$ của $n$: có $A_n^k$ cách.", "Mỗi cách chọn $k$ phần tử (không kể thứ tự) từ $n$ phần tử là một tổ hợp chập $k$ của $n$: có $C_n^k$ cách.", "Mỗi cách xếp $n$ phần tử theo thứ tự là một hoán vị của $n$ phần tử: có $P_n = n!$ cách."][sym] + ` Ở đây là $${cor}$.` };
      }
      const nn = t === 0 ? r.int(4, 7) : n;
      const vals: Record<string, number> = { P: fact(nn), A: Ank(nn, k), C: Cnk(nn, k), pw: nn ** k, kp: k ** nn };
      const ans = t === 0 ? vals.P : t === 1 ? vals.A : vals.C;
      const role = r.pick([["lớp trưởng", "lớp phó", "thủ quỹ", "bí thư"], ["giải nhất", "giải nhì", "giải ba", "giải khuyến khích"]]);
      const st = [
        `Có bao nhiêu cách xếp $${nn}$ bạn học sinh ngồi vào một dãy gồm $${nn}$ chiếc ghế?`,
        `Từ $${nn}$ ${role[0] === "lớp trưởng" ? "học sinh" : "bài dự thi"}, có bao nhiêu cách chọn ra $${k}$ ${role[0] === "lớp trưởng" ? "bạn để giữ" : "bài để trao"} $${k}$ ${role[0] === "lớp trưởng" ? "chức vụ" : "giải"} khác nhau (${role.slice(0, k).join(", ")})?`,
        `Có bao nhiêu cách chọn ra $${k}$ học sinh từ một nhóm $${nn}$ học sinh để đi lao động?`,
      ][t];
      const ex = [`Mỗi cách xếp là một hoán vị của $${nn}$ phần tử: $P_{${nn}} = ${nn}! = ${ans}$.`, `Mỗi cách chọn là một chỉnh hợp chập $${k}$ của $${nn}$: $${AT(nn, k)} = ${ans}$.`, `Mỗi cách chọn là một tổ hợp chập $${k}$ của $${nn}$: $${CT(nn, k)} = ${ans}$.`][t];
      return { stem: st, ...mcq(r, M(ans), Object.values(vals).filter((x) => x !== ans).map(M)), explanation: ex };
    },
  },
  {
    id: "t10k2-lap-so-tu-chu-so", ...B8, topic: "Bài toán lập số từ các chữ số", level: 2, kind: "mcq",
    make: (r) => {
      const has0 = r.chance(0.5), n = r.int(5, 7), k = r.int(3, 4);
      const D = (has0 ? [0, ...r.shuffle(rg(1, 9)).slice(0, n - 1)] : r.shuffle(rg(1, 9)).slice(0, n)).sort((x, y) => x - y);
      const type = r.int(0, 3); // 0 khác nhau, 1 tùy ý, 2 chẵn khác nhau, 3 chia hết cho 5 khác nhau
      const T = type === 2 ? D.filter((d) => d % 2 === 0) : type === 3 ? D.filter((d) => d % 5 === 0) : [];
      if (type >= 2) need(T.length >= 1 && T.some((d) => d !== 0));
      const distinct = type !== 1;
      const ok = (ds: number[]) => (type === 2 ? ds[k - 1] % 2 === 0 : type === 3 ? ds[k - 1] % 5 === 0 : true);
      const brute = countNums(D, k, distinct, ok);
      let f: number, ex: string;
      const first = has0 ? n - 1 : n;
      if (type === 0) { f = first * Ank(n - 1, k - 1); ex = has0 ? `$a_1 \\ne 0$ nên có $${n - 1}$ cách chọn $a_1$; các chữ số còn lại là một chỉnh hợp chập $${k - 1}$ của $${n - 1}$ chữ số còn lại: $${AT(n - 1, k - 1)}$ cách. Vậy có $${n - 1}\\cdot ${Ank(n - 1, k - 1)} = ${f}$ số.` : `Mỗi số là một chỉnh hợp chập $${k}$ của $${n}$ chữ số: $${AT(n, k)} = ${f}$ số.`; }
      else if (type === 1) { f = first * n ** (k - 1); ex = `$a_1$ có $${first}$ cách chọn${has0 ? " (khác $0$)" : ""}, mỗi chữ số còn lại có $${n}$ cách chọn. Vậy có $${first}\\cdot ${n}^{${k - 1}} = ${f}$ số.`; }
      else {
        const parts: string[] = []; f = 0;
        for (const d of T) {
          const c = d === 0 || !has0 ? Ank(n - 1, k - 1) : (n - 2) * Ank(n - 2, k - 2);
          f += c; parts.push(d === 0 || !has0 ? `$a_${k} = ${d}$: các chữ số còn lại có $${AT(n - 1, k - 1)} = ${c}$ cách` : `$a_${k} = ${d}$: $a_1$ có $${n - 2}$ cách (khác $0$ và khác $${d}$), các chữ số giữa có $${AT(n - 2, k - 2)}$ cách, tức $${c}$ số`);
        }
        ex = `${type === 2 ? "Số chẵn" : "Số chia hết cho $5$"} nên $a_${k}\\in${setT(T)}$. ${parts.join("; ")}. Tổng cộng có $${f}$ số.`;
      }
      need(f === brute);
      const w = [Ank(n, k), n ** k, Cnk(n, k), distinct ? n ** k - first : Ank(n, k), type >= 2 ? T.length * Ank(n - 1, k - 1) : first * Ank(n, k - 1), f + Ank(n - 1, k - 1)].filter((x) => x !== f && x > 0);
      const what = ["có $" + k + "$ chữ số đôi một khác nhau", "có $" + k + "$ chữ số", "chẵn có $" + k + "$ chữ số đôi một khác nhau", "có $" + k + "$ chữ số đôi một khác nhau và chia hết cho $5$"][type];
      return {
        stem: `Từ các chữ số $${D.join(";\\ ")}$ lập được bao nhiêu số tự nhiên ${what}?`,
        ...mcq(r, M(f), w.map(M)),
        explanation: `Gọi số cần lập là $${over(k)}$. ${ex}`,
      };
    },
  },
  {
    id: "t10k2-to-hop-chon-nhom", ...B8, topic: "Bài toán chọn nhóm (tổ hợp) có điều kiện", level: 2, kind: "mcq",
    make: (r) => {
      const b = r.int(4, 10), g = r.int(3, 9), n = b + g, k = r.int(3, 4), t = r.int(0, 2);
      const C = r.pick([{ x: "học sinh nam", y: "học sinh nữ", g: "một tổ có", z: "học sinh" }, { x: "viên bi đỏ", y: "viên bi xanh", g: "một hộp có", z: "viên bi" }, { x: "giáo viên Toán", y: "giáo viên Văn", g: "một trường có", z: "giáo viên" }]);
      let ans: number, cond: string, ex: string, w: number[];
      if (t === 0) {
        const i = r.int(1, k - 1);
        ans = Cnk(b, i) * Cnk(g, k - i); cond = `trong đó có đúng $${i}$ ${C.x}`;
        w = [Cnk(b, i) + Cnk(g, k - i), Ank(b, i) * Ank(g, k - i), Cnk(n, k), Cnk(b, k - i) * Cnk(g, i)];
        ex = `Chọn $${i}$ ${C.x}: $${CT(b, i)}$ cách; chọn $${k - i}$ ${C.y}: $${CT(g, k - i)}$ cách. Theo quy tắc nhân có $${CT(b, i)}\\cdot ${CT(g, k - i)} = ${ans}$ cách.`;
      } else if (t === 1) {
        ans = Cnk(n, k) - Cnk(b, k); cond = `trong đó có ít nhất một ${C.y}`;
        w = [g * Cnk(n - 1, k - 1), Cnk(n, k), Cnk(n, k) - Cnk(g, k), g * Cnk(b, k - 1)];
        ex = `Số cách chọn tùy ý: $${CT(n, k)} = ${Cnk(n, k)}$; số cách chọn không có ${C.y} nào: $${CT(b, k)} = ${Cnk(b, k)}$. Vậy có $${Cnk(n, k)} - ${Cnk(b, k)} = ${ans}$ cách.`;
      } else {
        ans = Cnk(n, k) - Cnk(b, k) - Cnk(g, k); cond = `trong đó có cả ${C.x} và ${C.y}`;
        w = [Cnk(n, k) - Cnk(b, k), b * g * Cnk(n - 2, k - 2), Cnk(n, k), Cnk(b, 1) * Cnk(g, 1)];
        ex = `Số cách chọn tùy ý: $${Cnk(n, k)}$; chỉ có ${C.x}: $${CT(b, k)} = ${Cnk(b, k)}$; chỉ có ${C.y}: $${CT(g, k)} = ${Cnk(g, k)}$. Vậy có $${Cnk(n, k)} - ${Cnk(b, k)} - ${Cnk(g, k)} = ${ans}$ cách.`;
      }
      need(ans > 0);
      return { stem: `Trong ${C.g} $${b}$ ${C.x} và $${g}$ ${C.y}. Có bao nhiêu cách chọn ra $${k}$ ${C.z} ${cond}?`,
        ...mcq(r, M(ans), w.filter((x) => x !== ans && x > 0).map(M)), explanation: ex };
    },
  },
  {
    id: "t10k2-nhi-thuc-he-so", ...B8, topic: "Hệ số của một số hạng trong khai triển nhị thức Newton", level: 2, kind: "mcq",
    make: (r) => {
      const n = r.int(4, 5), a = r.pick([1, 2, 3, -1, -2]), b = r.nz(-3, 3), k = r.int(1, n - 1);
      need(Math.abs(a) !== 1 || Math.abs(b) !== 1);
      const v = Cnk(n, k) * a ** k * b ** (n - k);
      const two = r.chance(0.3);
      const base = two ? `(${linE([a, b], ["x", "y"])})^{${n}}` : `(${linE([a, b], ["x", ""])})^{${n}}`;
      const xp = (e: number) => (e === 1 ? "" : `^{${e}}`);
      const mono = two ? `x${xp(k)}y${xp(n - k)}` : `x${xp(k)}`;
      const w = [Cnk(n, k) * a ** (n - k) * b ** k, a ** k * b ** (n - k), Math.abs(v), Cnk(n, k), Cnk(n, k) * a * b, -v];
      return {
        stem: `Hệ số của ${two ? "số hạng chứa " : ""}$${mono}$ trong khai triển của $${base}$ là`,
        ...mcq(r, M(v), w.filter((x) => x !== v).map(M)),
        explanation: `Số hạng tổng quát: $${CT(n, "k")}(${coef(a)}x)^{k}\\cdot(${two ? coef(b) + "y" : b})^{${n} - k}$. Số hạng chứa $${mono}$ ứng với $k = ${k}$, hệ số là $${CT(n, k)}\\cdot ${pr(a)}^{${k}}\\cdot ${pr(b)}^{${n - k}} = ${Cnk(n, k)}\\cdot ${pr(a ** k)}\\cdot ${pr(b ** (n - k))} = ${v}$.`,
      };
    },
  },
  {
    id: "t10k2-nhi-thuc-khai-trien", ...B8, topic: "Khai triển nhị thức Newton (n ≤ 5)", level: 1, kind: "mcq",
    make: (r) => {
      const n = r.int(3, 5), a = r.pick([1, -1, 2, -2, 3, -3]);
      if (r.chance(0.3)) {
        const p = r.pick([1, 2, 3]);
        return { stem: `Khai triển nhị thức $(${linE([p, a], ["x", ""])})^{${n}}$ có bao nhiêu số hạng?`,
          ...mcq(r, M(n + 1), [n, n + 2, 2 * n, n - 1].map(M)),
          explanation: `Khai triển $(a + b)^n$ có $n + 1$ số hạng, nên khai triển đã cho có $${n} + 1 = ${n + 1}$ số hạng.` };
      }
      need(n <= 4 || Math.abs(a) <= 2);
      const cor = rg(0, n).map((i) => Cnk(n, i) * a ** i);
      const w1 = rg(0, n).map((i) => a ** i), w2 = rg(0, n).map((i) => Cnk(n, i) * Math.abs(a) ** i), w3 = rg(0, n).map((i) => Cnk(n, i) * a * (i === 0 ? 0 : 1) + (i === 0 ? 1 : 0)), w4 = rg(0, n).map((i) => (i === 0 || i === n ? cor[i] : cor[i] * -1));
      return {
        stem: `Khai triển $(${linE([1, a], ["x", ""])})^{${n}}$ ta được`,
        ...mcq(r, M(poly(cor)), [w1, w2, w3, w4].map((x) => M(poly(x)))),
        explanation: `Theo công thức nhị thức Newton: $(x${term(a)})^{${n}} = ${rg(0, n).map((i) => `${CT(n, i)}x^{${n - i}}(${a})^{${i}}`).join(" + ")} = ${poly(cor)}$.`,
      };
    },
  },

  /* ===================== CHƯƠNG VIII – TF ===================== */
  {
    id: "t10k2-tf-dem-to-hop", ...B8, topic: "Hoán vị, chỉnh hợp, tổ hợp trong bài toán đếm (Đúng/Sai)", level: 2, kind: "tf",
    make: (r) => {
      const b = r.int(4, 7), g = r.int(3, 6), n = b + g, k = r.int(3, 4);
      need(g >= k);
      const s = [r.chance(0.5), r.chance(0.5), r.chance(0.5), r.chance(0.5)];
      const one = g * Cnk(b, k - 1), both = Cnk(n, k) - Cnk(b, k) - Cnk(g, k);
      return {
        stem: `Một nhóm học sinh gồm $${b}$ bạn nam và $${g}$ bạn nữ. Xét tính đúng sai của các khẳng định sau.`,
        ...tf([
          [`Số cách xếp cả nhóm thành một hàng ngang là $${s[0] ? fact(n) : Ank(n, 2) * fact(n - 2) / 2}$`, s[0]],
          [`Số cách chọn ra một nhóm trưởng và một nhóm phó là $${s[1] ? Ank(n, 2) : Cnk(n, 2)}$`, s[1]],
          [`Số cách chọn ra $${k}$ bạn trong đó có đúng một bạn nữ là $${s[2] ? one : g + Cnk(b, k - 1)}$`, s[2]],
          [`Số cách chọn ra $${k}$ bạn có cả nam và nữ là $${s[3] ? both : Cnk(n, k) - Cnk(b, k)}$`, s[3]],
        ]),
        explanation: `Xếp $${n}$ bạn thành hàng: $${n}! = ${fact(n)}$ cách. Chọn nhóm trưởng, nhóm phó (có thứ tự): $${AT(n, 2)} = ${Ank(n, 2)}$. Đúng một nữ: $${CT(g, 1)}\\cdot ${CT(b, k - 1)} = ${one}$. Có cả nam và nữ: $${CT(n, k)} - ${CT(b, k)} - ${CT(g, k)} = ${Cnk(n, k)} - ${Cnk(b, k)} - ${Cnk(g, k)} = ${both}$.`,
      };
    },
  },

  /* ===================== CHƯƠNG VIII – SHORT ===================== */
  {
    id: "t10k2-short-bai-toan-dem", ...B8, topic: "Bài toán đếm vận dụng", level: 3, kind: "short",
    make: (r) => {
      const t = r.int(0, 4);
      if (t === 0) {
        const n = r.int(6, 20), v = (n * (n - 3)) / 2;
        return { stem: `Một đa giác lồi có $${n}$ cạnh. Hỏi đa giác đó có bao nhiêu đường chéo?`, ...short(v, 0),
          explanation: `Mỗi đoạn thẳng nối hai đỉnh là một cạnh hoặc một đường chéo. Số đoạn thẳng: $${CT(n, 2)} = ${Cnk(n, 2)}$; trừ đi $${n}$ cạnh được $${v}$ đường chéo.` };
      }
      if (t === 1) {
        const m = r.int(3, 10), n = r.int(3, 10), v = Cnk(m, 2) * n + Cnk(n, 2) * m;
        return { stem: `Trên đường thẳng $d_1$ lấy $${m}$ điểm phân biệt, trên đường thẳng $d_2$ song song với $d_1$ lấy $${n}$ điểm phân biệt. Có bao nhiêu tam giác có ba đỉnh là ba trong số các điểm đã cho?`, ...short(v, 0),
          explanation: `Tam giác có 2 đỉnh trên $d_1$, 1 đỉnh trên $d_2$: $${CT(m, 2)}\\cdot ${n} = ${Cnk(m, 2) * n}$; có 1 đỉnh trên $d_1$, 2 đỉnh trên $d_2$: $${m}\\cdot ${CT(n, 2)} = ${m * Cnk(n, 2)}$. Tổng: $${v}$.` };
      }
      if (t === 2) {
        const b = r.int(2, 4), g = r.int(2, 4), v = fact(g + 1) * fact(b); need(v <= 9999);
        return { stem: `Có bao nhiêu cách xếp $${b}$ bạn nam và $${g}$ bạn nữ thành một hàng ngang sao cho các bạn nam luôn đứng cạnh nhau?`, ...short(v, 0),
          explanation: `Coi nhóm $${b}$ bạn nam là một phần tử, cùng $${g}$ bạn nữ có $${g + 1}$ phần tử: $${g + 1}! = ${fact(g + 1)}$ cách xếp. Trong nhóm nam có $${b}! = ${fact(b)}$ cách đổi chỗ. Vậy có $${fact(g + 1)}\\cdot ${fact(b)} = ${v}$ cách.` };
      }
      if (t === 3) {
        const n = r.int(6, 20), twice = r.chance(0.4), v = twice ? Ank(n, 2) : Cnk(n, 2);
        return { stem: `Một giải bóng đá có $${n}$ đội tham gia, thi đấu vòng tròn ${twice ? "hai lượt (lượt đi và lượt về)" : "một lượt"}, mỗi cặp đội gặp nhau ${twice ? "hai lần" : "đúng một lần"}. Hỏi giải có tất cả bao nhiêu trận đấu?`, ...short(v, 0),
          explanation: twice ? `Mỗi trận ứng với một cách chọn có thứ tự (đội chủ nhà, đội khách): $${AT(n, 2)} = ${v}$ trận.` : `Mỗi trận ứng với một cách chọn $2$ đội từ $${n}$ đội: $${CT(n, 2)} = ${v}$ trận.` };
      }
      const has0 = true, n = r.int(5, 7), D = [0, ...r.shuffle(rg(1, 9)).slice(0, n - 1)].sort((x, y) => x - y), k = 3;
      const even = r.chance(0.5), T = D.filter((d) => (even ? d % 2 === 0 : d % 5 === 0));
      need(has0 && T.some((d) => d !== 0));
      const v = countNums(D, k, true, (ds) => (even ? ds[2] % 2 === 0 : ds[2] % 5 === 0));
      const p1 = Ank(n - 1, 2), p2 = (T.length - 1) * (n - 2) * (n - 2);
      need(v === p1 + p2);
      return { stem: `Từ các chữ số $${D.join(";\\ ")}$ lập được bao nhiêu số tự nhiên ${even ? "chẵn" : "chia hết cho $5$"} có ba chữ số đôi một khác nhau?`, ...short(v, 0),
        explanation: `Gọi số cần lập là $\\overline{abc}$ với $c\\in${setT(T)}$. Nếu $c = 0$: chọn $a, b$ có $${AT(n - 1, 2)} = ${p1}$ cách. Nếu $c \\ne 0$ ($${T.length - 1}$ cách): $a$ có $${n - 2}$ cách (khác $0$ và $c$), $b$ có $${n - 2}$ cách, được $${p2}$ số. Tổng: $${v}$.` };
    },
  },
  {
    id: "t10k2-short-nhi-thuc", ...B8, topic: "Nhị thức Newton: hệ số, số hạng không chứa x, tổng hệ số", level: 3, kind: "short",
    make: (r) => {
      const t = r.int(0, 3);
      if (t === 0) {
        const n = r.int(4, 5), a = r.pick([1, 2, 3, -1, -2, -3]), b = r.nz(-3, 3), k = r.int(1, n - 1), v = Cnk(n, k) * a ** k * b ** (n - k);
        return { stem: `Tìm hệ số của $x^{${k}}$ trong khai triển của $(${linE([a, b], ["x", ""])})^{${n}}$.`, ...short(v, 0),
          explanation: `Số hạng chứa $x^{${k}}$ là $${CT(n, k)}(${a}x)^{${k}}(${b})^{${n - k}}$, hệ số bằng $${Cnk(n, k)}\\cdot ${a ** k}\\cdot ${b ** (n - k)} = ${v}$.` };
      }
      if (t === 1) {
        const b = r.nz(-3, 3);
        if (r.chance(0.5)) {
          const n = 4, v = Cnk(4, 2) * b ** 2;
          return { stem: `Tìm số hạng không chứa $x$ trong khai triển của $\\left(x ${b < 0 ? "-" : "+"} \\dfrac{${Math.abs(b)}}{x}\\right)^{${n}}$ (với $x \\ne 0$).`, ...short(v, 0),
            explanation: `Số hạng tổng quát $${CT(4, "k")}x^{4 - k}\\left(\\dfrac{${b}}{x}\\right)^k = ${CT(4, "k")}(${b})^k x^{4 - 2k}$. Không chứa $x$ khi $k = 2$: $${CT(4, 2)}\\cdot(${b})^2 = ${v}$.` };
        }
        const i = r.int(1, 4), e = 10 - 3 * i, v = Cnk(5, i) * b ** i;
        return { stem: `Tìm hệ số của $x^{${e}}$ trong khai triển của $\\left(x^2 ${b < 0 ? "-" : "+"} \\dfrac{${Math.abs(b)}}{x}\\right)^{5}$ (với $x \\ne 0$).`, ...short(v, 0),
          explanation: `Số hạng tổng quát $${CT(5, "k")}(x^2)^{5 - k}\\left(\\dfrac{${b}}{x}\\right)^k = ${CT(5, "k")}(${b})^k x^{10 - 3k}$. Cho $10 - 3k = ${e}$ được $k = ${i}$, hệ số là $${CT(5, i)}\\cdot(${b})^{${i}} = ${v}$.` };
      }
      if (t === 2) {
        const n = r.int(3, 5), a = r.nz(-3, 3), b = r.nz(-3, 3), v = (a + b) ** n;
        return { stem: `Tính tổng các hệ số trong khai triển của $(${linE([a, b], ["x", ""])})^{${n}}$ thành đa thức.`, ...short(v, 0),
          explanation: `Tổng các hệ số của đa thức $P(x)$ bằng $P(1) = (${a}${term(b)})^{${n}} = ${v}$.` };
      }
      const p = r.nz(-2, 2), q = r.nz(-3, 3), k = r.int(2, 3), v = Cnk(4, k) * p ** (4 - k) + Cnk(5, k) * q ** (5 - k);
      return { stem: `Tìm hệ số của $x^{${k}}$ trong khai triển của biểu thức $P(x) = (x${term(p)})^4 + (x${term(q)})^5$ thành đa thức.`, ...short(v, 0),
        explanation: `Hệ số của $x^{${k}}$ trong $(x${term(p)})^4$ là $${CT(4, k)}\\cdot(${p})^{${4 - k}} = ${Cnk(4, k) * p ** (4 - k)}$; trong $(x${term(q)})^5$ là $${CT(5, k)}\\cdot(${q})^{${5 - k}} = ${Cnk(5, k) * q ** (5 - k)}$. Tổng: $${v}$.` };
    },
  },

  /* ===================== CHƯƠNG IX – MCQ ===================== */
  {
    id: "t10k2-khong-gian-mau", ...B9, topic: "Không gian mẫu, biến cố", level: 1, kind: "mcq",
    make: (r) => {
      const t = r.int(0, 5);
      if (t === 5) {
        const pick = r.int(0, 2);
        const all = ["SS", "SN", "NS", "NN"];
        const ev = [{ d: "mặt sấp xuất hiện đúng một lần", s: ["SN", "NS"] }, { d: "mặt sấp xuất hiện ít nhất một lần", s: ["SS", "SN", "NS"] }, { d: "hai lần gieo có kết quả giống nhau", s: ["SS", "NN"] }][pick];
        const cands = [["SN"], ["SS", "SN"], ["SN", "NS", "NN"], ["SS", "NS"], all, ["SS", "NN"], ["SN", "NS"], ["SS", "SN", "NS"]].filter((x) => x.join() !== ev.s.join());
        const T = (xs: string[]) => setT(xs.map((x) => `\\text{${x}}`));
        return { stem: `Gieo một đồng xu cân đối hai lần liên tiếp (S: sấp, N: ngửa). Biến cố $A$: “${ev.d}” là tập hợp nào sau đây?`,
          ...mcq(r, M(`A = ${T(ev.s)}`), r.shuffle(cands).map((x) => M(`A = ${T(x)}`))),
          explanation: `Không gian mẫu $\\Omega = ${T(all)}$. Các kết quả thuận lợi cho $A$ là $${T(ev.s)}$.` };
      }
      let stem: string, v: number, w: number[], ex: string;
      if (t === 0) { const n = r.int(2, 5); v = 2 ** n; stem = `Gieo một đồng xu cân đối $${n}$ lần liên tiếp. Số phần tử của không gian mẫu là`; w = [2 * n, n * n, n + 1, Cnk(2 * n, 2)]; ex = `Mỗi lần gieo có $2$ kết quả nên $n(\\Omega) = 2^{${n}} = ${v}$.`; }
      else if (t === 1) { const n = r.int(2, 3); v = 6 ** n; stem = `Gieo một con xúc xắc cân đối $${n}$ lần liên tiếp. Số phần tử của không gian mẫu là`; w = [6 * n, n ** 6, Cnk(6 + n - 1, n), 6 ** (n - 1) + 6]; ex = `Mỗi lần gieo có $6$ kết quả nên $n(\\Omega) = 6^{${n}} = ${v}$.`; }
      else if (t === 2) { const n = r.int(6, 15), k = r.int(2, 3); v = Cnk(n, k); stem = `Một hộp có $${n}$ quả cầu được đánh số từ $1$ đến $${n}$. Lấy ngẫu nhiên đồng thời $${k}$ quả cầu. Số phần tử của không gian mẫu là`; w = [Ank(n, k), n ** k, n * k, Cnk(n, k - 1)]; ex = `Mỗi kết quả là một tổ hợp chập $${k}$ của $${n}$: $n(\\Omega) = ${CT(n, k)} = ${v}$.`; }
      else if (t === 3) { const n = r.int(6, 15); v = Ank(n, 2); stem = `Một lớp có $${n}$ học sinh ứng cử. Chọn ngẫu nhiên một bạn làm lớp trưởng và một bạn khác làm lớp phó. Số phần tử của không gian mẫu là`; w = [Cnk(n, 2), n * n, 2 * n, n]; ex = `Mỗi kết quả là một chỉnh hợp chập $2$ của $${n}$: $n(\\Omega) = ${AT(n, 2)} = ${v}$.`; }
      else { const m = r.int(2, 3); v = 2 * 6 ** (m - 1); stem = m === 2 ? "Gieo một đồng xu cân đối và một con xúc xắc cân đối. Số phần tử của không gian mẫu là" : "Gieo một đồng xu cân đối và hai con xúc xắc cân đối. Số phần tử của không gian mẫu là"; w = m === 2 ? [8, 6, 36, 2] : [14, 36, 144, 12]; ex = `Theo quy tắc nhân: $n(\\Omega) = 2${m === 2 ? "\\cdot 6" : "\\cdot 6\\cdot 6"} = ${v}$.`; }
      return { stem, ...mcq(r, M(v), w.filter((x) => x !== v).map(M)), explanation: ex };
    },
  },
  {
    id: "t10k2-xac-suat-xuc-xac-dong-xu", ...B9, topic: "Xác suất khi gieo xúc xắc, đồng xu", level: 2, kind: "mcq",
    make: (r) => {
      if (r.chance(0.25)) {
        const n = r.int(3, 4), atl = r.chance(0.5), h = r.int(1, n - 1);
        const fav = atl ? 2 ** n - 1 : Cnk(n, h), tot = 2 ** n;
        return { stem: `Gieo một đồng xu cân đối $${n}$ lần liên tiếp. Xác suất để ${atl ? "mặt sấp xuất hiện ít nhất một lần" : `mặt sấp xuất hiện đúng $${h}$ lần`} là`,
          ...mcq(r, M(frac(fav, tot)), [frac(1, tot), frac(fav - 1, tot), frac(1, 2), frac(h, n), frac(tot - fav, tot), frac(fav, 2 * n)].filter((x) => x !== frac(fav, tot)).map(M)),
          explanation: `$n(\\Omega) = 2^{${n}} = ${tot}$. ${atl ? `Biến cố đối “không lần nào sấp” có $1$ kết quả, nên số kết quả thuận lợi là $${tot} - 1 = ${fav}$.` : `Số kết quả có đúng $${h}$ lần sấp là $${CT(n, h)} = ${fav}$.`} Xác suất: $${frac(fav, tot)}$.` };
      }
      const t = r.int(0, 7), sv = r.int(3, 11), d = r.int(1, 4), k = r.pick([3, 4, 5]);
      const E: { d: string; f: (i: number, j: number) => boolean } = [
        { d: `tổng số chấm xuất hiện bằng $${sv}$`, f: (i: number, j: number) => i + j === sv },
        { d: `tổng số chấm xuất hiện lớn hơn hoặc bằng $${Math.max(sv, 8)}$`, f: (i: number, j: number) => i + j >= Math.max(sv, 8) },
        { d: `tổng số chấm xuất hiện nhỏ hơn $${Math.min(sv, 7)}$`, f: (i: number, j: number) => i + j < Math.min(sv, 7) },
        { d: "tích số chấm xuất hiện là một số chẵn", f: (i: number, j: number) => (i * j) % 2 === 0 },
        { d: "số chấm xuất hiện trên hai con xúc xắc bằng nhau", f: (i: number, j: number) => i === j },
        { d: `hiệu số chấm (lớn trừ nhỏ) trên hai con xúc xắc bằng $${d}$`, f: (i: number, j: number) => Math.abs(i - j) === d },
        { d: `tổng số chấm xuất hiện chia hết cho $${k}$`, f: (i: number, j: number) => (i + j) % k === 0 },
        { d: "có ít nhất một con xúc xắc xuất hiện mặt $6$ chấm", f: (i: number, j: number) => i === 6 || j === 6 },
      ][t];
      let c = 0; const fav: string[] = [];
      for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) if (E.f(i, j)) { c++; fav.push(pt(i, j)); }
      need(c > 0 && c < 36);
      const cor = frac(c, 36);
      return {
        stem: `Gieo hai con xúc xắc cân đối và đồng chất. Xác suất để ${E.d} là`,
        ...mcq(r, M(cor), [[c, 11], [c + 1, 36], [c - 1, 36], [36 - c, 36], [c, 12], [c, 21], [c + 2, 36]].filter((q) => q[0] > 0 && q[0] < q[1]).map((q) => frac(q[0], q[1])).filter((x) => x !== cor).map(M)),
        explanation: `$n(\\Omega) = 6\\cdot 6 = 36$. ${c <= 12 ? `Các kết quả thuận lợi: $${fav.join(",\\ ")}$, có $${c}$ kết quả.` : `Đếm được $${c}$ kết quả thuận lợi (biến cố đối có $${36 - c}$ kết quả).`} Vậy $P = \\dfrac{${c}}{36}${gcd(c, 36) > 1 ? ` = ${cor}` : ""}$.`,
      };
    },
  },
  {
    id: "t10k2-xac-suat-chon-ngau-nhien", ...B9, topic: "Xác suất khi chọn ngẫu nhiên đồ vật, người", level: 2, kind: "mcq",
    make: (r) => {
      const a = r.int(3, 8), b = r.int(3, 8), n = a + b, k = r.int(2, 3), t = r.int(0, 3);
      const C = r.pick([{ g: "Một hộp có", x: "quả cầu đỏ", y: "quả cầu xanh", z: "quả cầu", act: "Lấy ngẫu nhiên đồng thời" }, { g: "Một nhóm có", x: "học sinh nam", y: "học sinh nữ", z: "học sinh", act: "Chọn ngẫu nhiên" }, { g: "Một lô hàng có", x: "sản phẩm tốt", y: "sản phẩm lỗi", z: "sản phẩm", act: "Lấy ngẫu nhiên" }]);
      const N = Cnk(n, k);
      let fav: number, d: string, ex: string, w: string[];
      if (t === 0) { fav = Cnk(a, k); d = `cả $${k}$ ${C.z} đều là ${C.x}`; ex = `$n(A) = ${CT(a, k)} = ${fav}$`; w = [frac(a, n), frac(a ** k, n ** k), frac(Cnk(b, k), N), frac(N - fav, N)]; }
      else if (t === 1) { const i = r.int(1, k - 1); fav = Cnk(a, i) * Cnk(b, k - i); d = `có đúng $${i}$ ${C.x}`; ex = `$n(A) = ${CT(a, i)}\\cdot ${CT(b, k - i)} = ${fav}$`; w = [frac(Cnk(a, i) + Cnk(b, k - i), N), frac(N - fav, N), frac(i, k), frac(Cnk(a, i), N)]; }
      else if (t === 2) { fav = N - Cnk(b, k); d = `có ít nhất một ${C.x}`; ex = `Biến cố đối “không có ${C.x} nào” có $${CT(b, k)} = ${Cnk(b, k)}$ kết quả nên $n(A) = ${N} - ${Cnk(b, k)} = ${fav}$`; w = [frac(Cnk(b, k), N), frac(a * Cnk(n - 1, k - 1), N), frac(a, n), frac(Cnk(a, k), N)]; }
      else { fav = Cnk(a, k) + Cnk(b, k); d = `các ${C.z} được chọn cùng loại`; ex = `$n(A) = ${CT(a, k)} + ${CT(b, k)} = ${fav}$`; w = [frac(Cnk(a, k) * Cnk(b, k), N), frac(N - fav, N), frac(Cnk(a, k), N), frac(2, n)]; }
      need(fav > 0 && fav < N);
      const cor = frac(fav, N);
      return {
        stem: `${C.g} $${a}$ ${C.x} và $${b}$ ${C.y}. ${C.act} $${k}$ ${C.z}. Xác suất để ${d} là`,
        ...mcq(r, M(cor), w.filter((x) => x !== cor && x !== "0" && x !== "1").map(M)),
        explanation: `$n(\\Omega) = ${CT(n, k)} = ${N}$. ${ex}. Vậy $P(A) = \\dfrac{${fav}}{${N}}${gcd(fav, N) > 1 ? ` = ${cor}` : ""}$.`,
      };
    },
  },
  {
    id: "t10k2-bien-co-doi", ...B9, topic: "Biến cố đối, tính chất của xác suất", level: 1, kind: "mcq",
    make: (r) => {
      const t = r.int(0, 2);
      if (t === 0) {
        if (r.chance(0.5)) {
          const q = r.int(3, 15), p = r.int(1, q - 1); need(gcd(p, q) === 1);
          return { stem: `Cho biến cố $A$ có $P(A) = ${frac(p, q)}$. Xác suất của biến cố đối $\\overline{A}$ là`,
            ...mcq(r, M(frac(q - p, q)), [frac(p, q), frac(q, q + p), frac(p, q - p), frac(1, q), frac(q - p, q + p)].filter((x) => x !== frac(q - p, q)).map(M)),
            explanation: `$P(\\overline{A}) = 1 - P(A) = 1 - ${frac(p, q)} = ${frac(q - p, q)}$.` };
        }
        const p = r.int(1, 19) * 5;
        return { stem: `Cho biến cố $A$ có $P(A) = ${tex(p / 100)}$. Xác suất của biến cố đối $\\overline{A}$ là`,
          ...mcq(r, M(tex(1 - p / 100)), [tex(p / 100), tex(Math.abs(0.5 - p / 100) + 0.05), tex(1 + p / 100), tex(Math.min(0.95, p / 50 === 1 ? 0.3 : p / 50))].filter((x) => x !== tex(1 - p / 100)).map(M)),
          explanation: `$P(\\overline{A}) = 1 - P(A) = 1 - ${tex(p / 100)} = ${tex(1 - p / 100)}$.` };
      }
      if (t === 1) {
        const n = r.int(2, 5), k = r.int(2, 5), m = r.int(2, 20), sh = r.int(2, 4);
        const B = [
          { c: `Gieo một đồng xu $${n}$ lần. Xét biến cố $A$: “Có ít nhất một lần xuất hiện mặt ngửa”.`, a: "“Không có lần nào xuất hiện mặt ngửa”", w: ["“Có đúng một lần xuất hiện mặt ngửa”", "“Có ít nhất một lần xuất hiện mặt sấp”", "“Tất cả các lần đều xuất hiện mặt ngửa”"] },
          { c: `Chọn ngẫu nhiên $${k}$ học sinh từ một lớp có cả nam và nữ. Xét biến cố $A$: “Có ít nhất một học sinh nữ”.`, a: `“Cả $${k}$ học sinh đều là nam”`, w: ["“Có ít nhất một học sinh nam”", `“Cả $${k}$ học sinh đều là nữ”`, "“Có đúng một học sinh nữ”"] },
          { c: `Một xạ thủ bắn $${sh}$ viên đạn vào bia. Xét biến cố $A$: “Tất cả các viên đều trúng bia”.`, a: "“Có ít nhất một viên trượt bia”", w: ["“Tất cả các viên đều trượt bia”", "“Có đúng một viên trúng bia”", "“Có ít nhất một viên trúng bia”"] },
          { c: `Rút ngẫu nhiên một thẻ từ hộp có các thẻ đánh số từ $1$ đến $${m + r.int(5, 20)}$. Xét biến cố $A$: “Số ghi trên thẻ lớn hơn $${m}$”.`, a: `“Số ghi trên thẻ nhỏ hơn hoặc bằng $${m}$”`, w: [`“Số ghi trên thẻ nhỏ hơn $${m}$”`, `“Số ghi trên thẻ lớn hơn hoặc bằng $${m}$”`, `“Số ghi trên thẻ bằng $${m}$”`] },
          { c: "Gieo một con xúc xắc. Xét biến cố $A$: “Số chấm xuất hiện là số chẵn”.", a: "“Số chấm xuất hiện là số lẻ”", w: ["“Số chấm xuất hiện chia hết cho $3$”", "“Số chấm xuất hiện là $1$”", "“Số chấm xuất hiện nhỏ hơn $6$”"] },
        ];
        const e = r.pick(B);
        return { stem: `${e.c} Biến cố đối $\\overline{A}$ của $A$ là`, ...mcq(r, e.a, e.w),
          explanation: `Biến cố đối $\\overline{A}$ xảy ra khi và chỉ khi $A$ không xảy ra. Phủ định của “${e.a === B[0].a ? "có ít nhất một" : "khẳng định trong $A$"}” cho ta $\\overline{A}$: ${e.a}.` };
      }
      const nO = r.int(10, 60), nA = r.int(1, nO - 1);
      const st = r.int(0, 1);
      if (st === 0) return { stem: `Một phép thử có không gian mẫu gồm $${nO}$ kết quả đồng khả năng. Biến cố $A$ có $${nA}$ kết quả thuận lợi. Số kết quả thuận lợi cho biến cố đối $\\overline{A}$ là`,
        ...mcq(r, M(nO - nA), [nA, nO + nA, nO, nO - nA - 1].filter((x) => x !== nO - nA).map(M)),
        explanation: `$n(\\overline{A}) = n(\\Omega) - n(A) = ${nO} - ${nA} = ${nO - nA}$.` };
      const T = ["$0 \\le P(A) \\le 1$ với mọi biến cố $A$", "$P(\\Omega) = 1$", "$P(\\varnothing) = 0$", "$P(A) + P(\\overline{A}) = 1$"];
      const F = ["$P(A) + P(\\overline{A}) = 0$", "$P(\\Omega) = 0$", "$P(\\overline{A}) = P(A) - 1$", "$-1 \\le P(A) \\le 1$ với mọi biến cố $A$", "$P(\\varnothing) = 1$", "$P(A) = \\dfrac{n(\\Omega)}{n(A)}$"];
      const want = r.chance(0.6);
      const [cs, ws] = want ? [T, F] : [F, T];
      return { stem: `Cho phép thử có không gian mẫu $\\Omega$ và biến cố $A$. Khẳng định nào sau đây ${want ? "đúng" : "sai"}?`,
        ...mcq(r, r.pick(cs), r.shuffle([...ws]).slice(0, 3)),
        explanation: `Theo định nghĩa cổ điển $P(A) = \\dfrac{n(A)}{n(\\Omega)}$, nên $0 \\le P(A) \\le 1$, $P(\\Omega) = 1$, $P(\\varnothing) = 0$ và $P(\\overline{A}) = 1 - P(A)$.` };
    },
  },

  /* ===================== CHƯƠNG IX – TF ===================== */
  {
    id: "t10k2-tf-xac-suat-hop-bi", ...B9, topic: "Xác suất lấy bi nhiều màu (Đúng/Sai)", level: 3, kind: "tf",
    make: (r) => {
      const x = r.int(3, 6), y = r.int(2, 6), z = r.int(1, 5), n = x + y + z, N = Cnk(n, 3);
      const s = [r.chance(0.5), r.chance(0.5), r.chance(0.5), r.chance(0.5)];
      const pAll = frac(Cnk(x, 3), N), pDiff = frac(x * y * z, N), pAtl = frac(N - Cnk(n - y, 3), N);
      const wAll = frac(Cnk(x, 3), Ank(n, 3)), wDiff = frac(x + y + z, N), wAtl = frac(Cnk(n - y, 3), N);
      return {
        stem: `Một hộp có $${x}$ viên bi đỏ, $${y}$ viên bi xanh và $${z}$ viên bi vàng (các viên bi khác nhau về số thứ tự). Lấy ngẫu nhiên đồng thời $3$ viên bi. Xét tính đúng sai của các khẳng định sau.`,
        ...tf([
          [`Số phần tử của không gian mẫu là $${s[0] ? N : Ank(n, 3)}$`, s[0]],
          [`Xác suất để lấy được $3$ viên bi đỏ là $${s[1] ? pAll : wAll}$`, s[1] || pAll === wAll],
          [`Xác suất để lấy được $3$ viên bi đủ ba màu là $${s[2] ? pDiff : wDiff}$`, s[2] || pDiff === wDiff],
          [`Xác suất để có ít nhất một viên bi xanh là $${s[3] ? pAtl : wAtl}$`, s[3] || pAtl === wAtl],
        ]),
        explanation: `$n(\\Omega) = ${CT(n, 3)} = ${N}$. Ba bi đỏ: $${CT(x, 3)} = ${Cnk(x, 3)}$ cách, xác suất $${pAll}$. Đủ ba màu: $${x}\\cdot ${y}\\cdot ${z} = ${x * y * z}$ cách, xác suất $${pDiff}$. Không có bi xanh: $${CT(n - y, 3)} = ${Cnk(n - y, 3)}$ cách, nên xác suất có ít nhất một bi xanh là $1 - \\dfrac{${Cnk(n - y, 3)}}{${N}} = ${pAtl}$.`,
      };
    },
  },
  {
    id: "t10k2-tf-xac-suat-xuc-xac", ...B9, topic: "Gieo hai con xúc xắc (Đúng/Sai)", level: 2, kind: "tf",
    make: (r) => {
      const cnt = (f: (i: number, j: number) => boolean) => { let c = 0; for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) if (f(i, j)) c++; return c; };
      const sv = r.int(3, 11), cS = cnt((i, j) => i + j === sv), g = r.int(8, 11), cG = cnt((i, j) => i + j >= g);
      const s = [r.chance(0.5), r.chance(0.5), r.chance(0.5), r.chance(0.5)];
      const ev = r.pick([{ d: "tích số chấm là số chẵn", c: 27 }, { d: "tích số chấm là số lẻ", c: 9 }, { d: "số chấm trên hai con xúc xắc bằng nhau", c: 6 }, { d: "có ít nhất một mặt $6$ chấm", c: 11 }, { d: "hai số chấm khác nhau", c: 30 }]);
      const wrongEv = r.pick([frac(ev.c + 1, 36), frac(ev.c - 1, 36), frac(36 - ev.c, 36)].filter((x) => x !== frac(ev.c, 36)));
      return {
        stem: `Gieo hai con xúc xắc cân đối và đồng chất. Gọi $A$ là biến cố “tổng số chấm bằng $${sv}$”, $B$ là biến cố “${ev.d}”, $C$ là biến cố “tổng số chấm lớn hơn hoặc bằng $${g}$”. Xét tính đúng sai của các khẳng định sau.`,
        ...tf([
          [`Không gian mẫu có $${s[0] ? 36 : r.pick([12, 21])}$ phần tử`, s[0]],
          [`Biến cố $A$ có $${s[1] ? cS : cS + r.pick([-1, 1])}$ kết quả thuận lợi`, s[1]],
          [`$P(B) = ${s[2] ? frac(ev.c, 36) : wrongEv}$`, s[2]],
          [`$P(C) = ${s[3] ? frac(cG, 36) : frac(cG + 1, 36)}$`, s[3]],
        ]),
        explanation: `$n(\\Omega) = 6\\cdot 6 = 36$. Biến cố $A$ có $${cS}$ kết quả thuận lợi. Biến cố $B$ có $${ev.c}$ kết quả nên $P(B) = \\dfrac{${ev.c}}{36} = ${frac(ev.c, 36)}$. Biến cố $C$ có $${cG}$ kết quả nên $P(C) = ${frac(cG, 36)}$.`,
      };
    },
  },

  /* ===================== CHƯƠNG IX – SHORT ===================== */
  {
    id: "t10k2-short-xac-suat-chon-nhom", ...B9, topic: "Xác suất chọn nhóm người, đồ vật (tính số)", level: 3, kind: "short",
    make: (r) => {
      const a = r.int(4, 12), b = r.int(3, 10), n = a + b, k = r.int(3, 5), t = r.int(0, 3);
      const C = r.pick([{ s: `Một lớp có $${a}$ học sinh nam và $${b}$ học sinh nữ. Chọn ngẫu nhiên $${k}$ học sinh tham gia đội văn nghệ.`, x: "nam", y: "nữ", z: "học sinh" }, { s: `Một hộp có $${a}$ viên bi trắng và $${b}$ viên bi đen. Lấy ngẫu nhiên đồng thời $${k}$ viên bi.`, x: "trắng", y: "đen", z: "viên bi" }, { s: `Một đội tình nguyện có $${a}$ đoàn viên khối 10 và $${b}$ đoàn viên khối 11. Chọn ngẫu nhiên $${k}$ người.`, x: "khối 10", y: "khối 11", z: "người" }]);
      const N = Cnk(n, k);
      let fav: number, d: string, how: string;
      if (t === 0) { fav = N - Cnk(a, k); d = `có ít nhất một ${C.z} ${C.y}`; how = `$n(A) = ${CT(n, k)} - ${CT(a, k)} = ${fav}$`; }
      else if (t === 1) { const i = r.int(1, k - 1); fav = Cnk(a, i) * Cnk(b, k - i); d = `có đúng $${i}$ ${C.z} ${C.x}`; how = `$n(A) = ${CT(a, i)}\\cdot ${CT(b, k - i)} = ${fav}$`; }
      else if (t === 2) { fav = N - Cnk(a, k) - Cnk(b, k); d = `có cả ${C.z} ${C.x} và ${C.z} ${C.y}`; how = `$n(A) = ${CT(n, k)} - ${CT(a, k)} - ${CT(b, k)} = ${fav}$`; }
      else { fav = Cnk(a, k) + Cnk(b, k); d = `tất cả ${C.z} được chọn đều cùng loại (cùng ${C.x} hoặc cùng ${C.y})`; how = `$n(A) = ${CT(a, k)} + ${CT(b, k)} = ${fav}$`; }
      need(fav > 0 && fav < N && k <= a && k <= b);
      const p = fav / N, f = fit(p, 2);
      need(p >= 0.05 && p <= 0.95);
      return {
        stem: `${C.s} Tính xác suất để ${d}${withNote(f.note)}.`,
        ...short(p, f.dp),
        explanation: `$n(\\Omega) = ${CT(n, k)} = ${N}$. ${how}. Vậy $P(A) = \\dfrac{${fav}}{${N}}${f.note ? " \\approx " : " = "}${tex(p, f.dp)}$.`,
      };
    },
  },
  {
    id: "t10k2-short-xac-suat-so", ...B9, topic: "Xác suất chọn số, rút thẻ (tính số)", level: 3, kind: "short",
    make: (r) => {
      const t = r.int(0, 2);
      if (t === 0) {
        const a = r.int(2, 9), b = r.int(2, 9); need(a < b && b % a !== 0);
        const two = r.chance(0.5), xs = rg(10, 99);
        const fav = xs.filter((x) => (two ? x % a === 0 || x % b === 0 : x % a === 0)).length, p = fav / 90, f = fit(p, 2);
        return { stem: `Chọn ngẫu nhiên một số tự nhiên có hai chữ số. Tính xác suất để số được chọn chia hết cho $${a}$${two ? ` hoặc chia hết cho $${b}$` : ""}${withNote(f.note)}.`,
          ...short(p, f.dp),
          explanation: `$n(\\Omega) = 90$. ${two ? `Số các số có hai chữ số chia hết cho $${a}$ là $${xs.filter((x) => x % a === 0).length}$, chia hết cho $${b}$ là $${xs.filter((x) => x % b === 0).length}$, chia hết cho cả hai (tức chia hết cho $${(a * b) / gcd(a, b)}$) là $${xs.filter((x) => x % a === 0 && x % b === 0).length}$; nên $n(A) = ${fav}$` : `Các số chia hết cho $${a}$ là $${xs.find((x) => x % a === 0)}, \\ldots, ${xs.filter((x) => x % a === 0).pop()}$, có $${fav}$ số`}. $P = \\dfrac{${fav}}{90}${f.note ? " \\approx " : " = "}${tex(p, f.dp)}$.` };
      }
      if (t === 1) {
        const N = r.int(8, 20), ev = r.int(0, 2), o = Math.ceil(N / 2), e = Math.floor(N / 2), tot = Cnk(N, 2);
        const fav = ev === 0 ? Cnk(e, 2) + Cnk(o, 2) : ev === 1 ? tot - Cnk(o, 2) : e * o;
        const p = fav / tot, f = fit(p, 2);
        const d = ["tổng hai số ghi trên hai thẻ là số chẵn", "tích hai số ghi trên hai thẻ là số chẵn", "tổng hai số ghi trên hai thẻ là số lẻ"][ev];
        const how = [`hai thẻ cùng chẵn hoặc cùng lẻ: $${CT(e, 2)} + ${CT(o, 2)} = ${fav}$`, `trừ đi trường hợp hai thẻ đều lẻ: $${tot} - ${CT(o, 2)} = ${fav}$`, `một thẻ chẵn, một thẻ lẻ: $${e}\\cdot ${o} = ${fav}$`][ev];
        return { stem: `Một hộp có $${N}$ thẻ được đánh số từ $1$ đến $${N}$. Rút ngẫu nhiên đồng thời hai thẻ. Tính xác suất để ${d}${withNote(f.note)}.`,
          ...short(p, f.dp),
          explanation: `$n(\\Omega) = ${CT(N, 2)} = ${tot}$. Có $${e}$ thẻ chẵn, $${o}$ thẻ lẻ. Số kết quả thuận lợi: ${how}. $P = \\dfrac{${fav}}{${tot}}${f.note ? " \\approx " : " = "}${tex(p, f.dp)}$.` };
      }
      const s = r.int(4, 14), xs = rg(10, 99), favs = xs.filter((x) => Math.floor(x / 10) + (x % 10) === s), p = favs.length / 90, f = fit(p, 2);
      need(favs.length > 0);
      return { stem: `Chọn ngẫu nhiên một số tự nhiên có hai chữ số. Tính xác suất để tổng các chữ số của số được chọn bằng $${s}$${withNote(f.note)}.`,
        ...short(p, f.dp),
        explanation: `$n(\\Omega) = 90$. Các số thỏa mãn: $${favs.join(";\\ ")}$, có $${favs.length}$ số. $P = \\dfrac{${favs.length}}{90}${f.note ? " \\approx " : " = "}${tex(p, f.dp)}$.` };
    },
  },
];
