/* Toán 12 – Học kì 2 (Kết nối tri thức).
   half 1: Ch.IV Nguyên hàm và tích phân.
   half 2: Ch.V Phương pháp tọa độ trong không gian; Ch.VI Xác suất có điều kiện. */
import { mcq, tf, short, frac, tex, vn, need, poly, term, coef, sqrtTex, round, gcd, type Template, type Rng } from "./core.ts";

const S = "Toán", G = 12 as const, HK = 2 as const;
const C4 = "Chương IV. Nguyên hàm và tích phân";
const C5 = "Chương V. Phương pháp tọa độ trong không gian";
const C6 = "Chương VI. Xác suất có điều kiện";
const K4 = "Toán|Nguyên hàm – tích phân", K5 = "Toán|Phương pháp tọa độ Oxyz", K6 = "Toán|Xác suất có điều kiện";

/* ---------------- tiện ích chung ---------------- */
const tick = (b: boolean) => (b ? "Đúng" : "Sai");
const nm = (x: number) => (x < 0 ? `(${x})` : `${x}`);
const ev = (cs: number[], x: number) => cs.reduce((s, c) => s * x + c, 0);
const der = (cs: number[]) => cs.slice(0, -1).map((c, i) => c * (cs.length - 1 - i));
/** nối hai hạng tử (hạng tử sau có thể bắt đầu bằng dấu -) */
const J = (a: string, b: string) => a + (b.startsWith("-") ? " - " + b.slice(1) : " + " + b);

/* ---- số hữu tỉ ---- */
type Q = [number, number];
const Qn = (p: number, q = 1): Q => { need(q !== 0); const g = gcd(p, q); let a = p / g, b = q / g; if (b < 0) { a = -a; b = -b; } return [a + 0, b]; };
const Qa = (x: Q, y: Q) => Qn(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
const Qs = (x: Q, y: Q) => Qn(x[0] * y[1] - y[0] * x[1], x[1] * y[1]);
const Qm = (x: Q, y: Q) => Qn(x[0] * y[0], x[1] * y[1]);
const Qt = (x: Q) => frac(x[0], x[1]);
const Qv = (x: Q) => x[0] / x[1];
/** k·sym với k hữu tỉ, vd sym = "\\pi" → \dfrac{8\pi}{3} */
function symQ(x: Q, sym: string): string {
  const [n, d] = x; if (n === 0) return "0";
  const a = Math.abs(n), sg = n < 0 ? "-" : "";
  if (d === 1) return sg + (a === 1 ? sym : a + sym);
  return sg + `\\dfrac{${a === 1 ? sym : a + sym}}{${d}}`;
}
/** nguyên hàm (hằng số 0) của đa thức hệ số nguyên, hệ số bậc cao → thấp */
const antider = (cs: number[]): Q[] => [...cs.map((c, i) => Qn(c, cs.length - i)), [0, 1] as Q];
const evQ = (qs: Q[], x: number): Q => qs.reduce<Q>((s, c) => Qa(Qm(s, [x, 1]), c), [0, 1]);
function polyQ(qs: Q[], v = "x"): string {
  const n = qs.length - 1; let out = "";
  qs.forEach(([p, q], i) => {
    if (p === 0) return;
    const d = n - i, vv = d === 0 ? "" : d === 1 ? v : `${v}^{${d}}`, a = Math.abs(p);
    const body = q === 1 ? (vv ? (a === 1 ? vv : a + vv) : String(a)) : `\\dfrac{${a}}{${q}}${vv}`;
    out += out === "" ? (p < 0 ? "-" : "") + body : (p < 0 ? " - " : " + ") + body;
  });
  return out || "0";
}

/* ---- tọa độ không gian ---- */
const P3 = (v: number[]) => `(${v.join(";")})`;
const dot3 = (u: number[], v: number[]) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
const n2 = (u: number[]) => dot3(u, u);
const add3 = (u: number[], v: number[]) => u.map((x, i) => x + v[i]);
const sub3 = (u: number[], v: number[]) => u.map((x, i) => x - v[i]);
const mul3 = (k: number, u: number[]) => u.map((x) => k * x + 0);
const cross3 = (u: number[], v: number[]) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
const par3 = (u: number[], v: number[]) => n2(cross3(u, v)) === 0;
const eq3 = (u: number[], v: number[]) => u.every((x, i) => x === v[i]);
const vec3 = (r: Rng, a = -4, b = 4) => [r.int(a, b), r.int(a, b), r.int(a, b)];
const XYZ = ["x", "y", "z"];
/** phương trình mặt phẳng ax + by + cz + d = 0 */
function eqP(n: number[], d: number): string {
  let s = ""; XYZ.forEach((v, i) => { s += term(n[i], v, s === ""); }); s += term(d, "", s === "");
  return s + " = 0";
}
const sh = (v: string, a: number) => (a === 0 ? v : `${v}${term(-a)}`);
const pc = (p: number, u: number) => (u === 0 ? `${p}` : p === 0 ? term(u, "t", true) : `${p}${term(u, "t")}`);
const ptts = (M: number[], u: number[]) => `\\begin{cases} x = ${pc(M[0], u[0])} \\\\ y = ${pc(M[1], u[1])} \\\\ z = ${pc(M[2], u[2])} \\end{cases}`;
const ctac = (M: number[], u: number[]) => XYZ.map((v, i) => `\\dfrac{${sh(v, M[i])}}{${u[i]}}`).join(" = ");
const sq = (v: string, a: number) => (a === 0 ? `${v}^2` : `(${sh(v, a)})^2`);
const sphere = (I: number[], R2: number) => `${XYZ.map((v, i) => sq(v, I[i])).join(" + ")} = ${R2}`;
const dotEx = (u: number[], v: number[]) => u.map((x, i) => `${nm(x)}\\cdot ${nm(v[i])}`).join(" + ");
/** vectơ pháp tuyến "đẹp" có độ dài nguyên */
const NICE = [[1, 2, 2], [2, 3, 6], [1, 4, 8], [0, 3, 4], [2, 6, 9], [4, 4, 7], [0, 0, 1]];
function niceN(r: Rng, noZero = false): { n: number[]; L: number } {
  const base = r.pick(noZero ? NICE.slice(0, 6).filter((b) => b[0] !== 0) : NICE.slice(0, 6));
  const n = r.shuffle([...base]).map((x) => (r.chance(0.5) ? -x : x) + 0);
  return { n, L: Math.sqrt(n2(n)) };
}

/* ---- xác suất ---- */
const pct = (x: number) => `${tex(x, 2)}\\%`;

/* =============================== HALF 1: NGUYÊN HÀM – TÍCH PHÂN =============================== */
const H1: Template[] = [
  {
    id: "t12k2-nguyen-ham-da-thuc", subject: S, grade: G, hk: HK, half: 1, tk: K4, chapter: C4, topic: "Nguyên hàm của hàm đa thức",
    level: 1, kind: "mcq",
    make: (r) => {
      const top = r.int(2, 4);
      const f = Array.from({ length: top + 1 }, (_, i) => (i === 0 ? r.nz(-5, 5) : r.chance(0.6) ? r.int(-6, 6) : 0));
      need(f.filter((c) => c !== 0).length >= 2);
      const F = antider(f);
      const up = [...f.map((c, i) => c * (top - i + 1)), 0];
      const flip = F.map((q, i) => (i === 0 ? Qn(-q[0], q[1]) : q));
      const right = `$${polyQ(F)} + C$`;
      return {
        stem: r.pick([`Họ tất cả các nguyên hàm của hàm số $f(x) = ${poly(f)}$ là`, `$\\displaystyle\\int (${poly(f)})\\,dx$ bằng`]),
        ...mcq(r, right, r.shuffle([`$${poly(der(f))} + C$`, `$${poly([...f, 0])} + C$`, `$${poly(up)} + C$`, `$${polyQ(flip)} + C$`])),
        explanation: `Áp dụng $\\displaystyle\\int x^n\\,dx = \\dfrac{x^{n+1}}{n+1} + C$ $(n \\ne -1)$ và $\\displaystyle\\int k\\,dx = kx + C$ cho từng hạng tử: $\\displaystyle\\int (${poly(f)})\\,dx = ${polyQ(F)} + C$.`,
      };
    },
  },
  {
    id: "t12k2-nguyen-ham-co-ban", subject: S, grade: G, hk: HK, half: 1, tk: K4, chapter: C4, topic: "Nguyên hàm của hàm lượng giác, mũ, 1/x",
    level: 1, kind: "mcq",
    make: (r) => {
      const a = r.pick([2, 3, 5]);
      const sgnF = (k: number, num: string, den: string) => `${k < 0 ? "-" : ""}\\dfrac{${num}}{${den}}`;
      const kd = (k: number) => (Math.abs(k) === 1 ? "" : `${Math.abs(k)}\\cdot `);
      const B = [
        { f: (k: number) => `${coef(k)}\\sin x`, F: (k: number) => `${coef(-k)}\\cos x`, W: (k: number) => `${coef(k)}\\cos x`, rule: "\\int \\sin x\\,dx = -\\cos x + C" },
        { f: (k: number) => `${coef(k)}\\cos x`, F: (k: number) => `${coef(k)}\\sin x`, W: (k: number) => `${coef(-k)}\\sin x`, rule: "\\int \\cos x\\,dx = \\sin x + C" },
        { f: (k: number) => `${coef(k)}e^x`, F: (k: number) => `${coef(k)}e^x`, W: (k: number) => `${coef(k)}xe^{x-1}`, rule: "\\int e^x\\,dx = e^x + C" },
        { f: (k: number) => sgnF(k, String(Math.abs(k)), "x"), F: (k: number) => `${coef(k)}\\ln|x|`, W: (k: number) => sgnF(-k, String(Math.abs(k)), "x^2"), rule: "\\int \\dfrac{1}{x}\\,dx = \\ln|x| + C" },
        { f: (k: number) => `${k < 0 ? "-" : ""}${kd(k)}${a}^x`, F: (k: number) => sgnF(k, `${kd(k)}${a}^x`, `\\ln ${a}`), W: (k: number) => `${k < 0 ? "-" : ""}${kd(k)}${a}^x\\ln ${a}`, rule: `\\int ${a}^x\\,dx = \\dfrac{${a}^x}{\\ln ${a}} + C` },
        { f: (k: number) => sgnF(k, String(Math.abs(k)), "\\cos^2 x"), F: (k: number) => `${coef(k)}\\tan x`, W: (k: number) => `${coef(-k)}\\cot x`, rule: "\\int \\dfrac{1}{\\cos^2 x}\\,dx = \\tan x + C" },
        { f: (k: number) => sgnF(k, String(Math.abs(k)), "\\sin^2 x"), F: (k: number) => `${coef(-k)}\\cot x`, W: (k: number) => `${coef(k)}\\cot x`, rule: "\\int \\dfrac{1}{\\sin^2 x}\\,dx = -\\cot x + C" },
      ];
      const [i1, i2] = r.shuffle([0, 1, 2, 3, 4, 5, 6]).slice(0, 2).sort();
      const k1 = r.pick([1, 2, 3, 4, 5, -1, -2, -3]), k2 = r.pick([1, 2, 3, 4, -1, -2, -3, -4]);
      const b1 = B[i1], b2 = B[i2];
      const right = `$${J(b1.F(k1), b2.F(k2))} + C$`;
      return {
        stem: r.pick([`Họ tất cả các nguyên hàm của hàm số $f(x) = ${J(b1.f(k1), b2.f(k2))}$ là`, `Nguyên hàm $\\displaystyle\\int \\left(${J(b1.f(k1), b2.f(k2))}\\right)dx$ bằng`]),
        ...mcq(r, right, [`$${J(b1.W(k1), b2.F(k2))} + C$`, `$${J(b1.F(k1), b2.W(k2))} + C$`, `$${J(b1.W(k1), b2.W(k2))} + C$`]),
        explanation: `Dùng các công thức $\\displaystyle${b1.rule}$, $\\displaystyle${b2.rule}$ và tính chất $\\displaystyle\\int [kf(x) + lg(x)]\\,dx = k\\int f(x)\\,dx + l\\int g(x)\\,dx$. Kết quả: ${right}.`,
      };
    },
  },
  {
    id: "t12k2-tinh-chat-nguyen-ham-tich-phan", subject: S, grade: G, hk: HK, half: 1, tk: K4, chapter: C4, topic: "Tính chất của nguyên hàm và tích phân",
    level: 1, kind: "mcq",
    make: (r) => {
      const T: [string, string][] = [
        ["$\\displaystyle\\int kf(x)\\,dx = k\\int f(x)\\,dx$ (với $k$ là hằng số khác $0$)", "hằng số khác $0$ đưa được ra ngoài dấu nguyên hàm"],
        ["$\\displaystyle\\int [f(x) + g(x)]\\,dx = \\int f(x)\\,dx + \\int g(x)\\,dx$", "nguyên hàm của một tổng bằng tổng các nguyên hàm"],
        ["$\\displaystyle\\int [f(x) - g(x)]\\,dx = \\int f(x)\\,dx - \\int g(x)\\,dx$", "nguyên hàm của một hiệu bằng hiệu các nguyên hàm"],
        ["$\\displaystyle\\int f'(x)\\,dx = f(x) + C$", "$f(x)$ là một nguyên hàm của $f'(x)$"],
        ["$\\displaystyle\\left(\\int f(x)\\,dx\\right)' = f(x)$", "đạo hàm của nguyên hàm trả lại hàm số ban đầu"],
        ["$\\displaystyle\\int_a^b f(x)\\,dx = -\\int_b^a f(x)\\,dx$", "đổi cận thì tích phân đổi dấu"],
        ["$\\displaystyle\\int_a^a f(x)\\,dx = 0$", "tích phân có hai cận bằng nhau bằng $0$"],
        ["$\\displaystyle\\int_a^b f(x)\\,dx = \\int_a^c f(x)\\,dx + \\int_c^b f(x)\\,dx$", "tính chất cộng cận"],
        ["$\\displaystyle\\int_a^b f(x)\\,dx = \\int_a^b f(t)\\,dt$", "tích phân không phụ thuộc vào kí hiệu biến"],
      ];
      const F: [string, string][] = [
        ["$\\displaystyle\\int f(x)g(x)\\,dx = \\int f(x)\\,dx\\cdot\\int g(x)\\,dx$", "không có quy tắc nguyên hàm của một tích bằng tích các nguyên hàm"],
        ["$\\displaystyle\\int \\dfrac{f(x)}{g(x)}\\,dx = \\dfrac{\\int f(x)\\,dx}{\\int g(x)\\,dx}$", "không có quy tắc nguyên hàm của một thương bằng thương các nguyên hàm"],
        ["$\\displaystyle\\left(\\int f(x)\\,dx\\right)' = f'(x)$", "đúng ra $\\left(\\int f(x)\\,dx\\right)' = f(x)$"],
        ["$\\displaystyle\\int_a^b f(x)\\,dx = F(a) - F(b)$ với $F$ là một nguyên hàm của $f$", "đúng ra $\\int_a^b f(x)\\,dx = F(b) - F(a)$"],
        ["$\\displaystyle\\int_a^b f(x)g(x)\\,dx = \\int_a^b f(x)\\,dx\\cdot\\int_a^b g(x)\\,dx$", "tích phân của một tích nói chung khác tích các tích phân"],
        ["$\\displaystyle\\int_a^b f(x)\\,dx = \\int_b^a f(x)\\,dx$", "đổi cận thì tích phân đổi dấu"],
        ["$\\displaystyle\\int_a^b kf(x)\\,dx = k + \\int_a^b f(x)\\,dx$", "đúng ra $\\int_a^b kf(x)\\,dx = k\\int_a^b f(x)\\,dx$"],
      ];
      const askTrue = r.chance(0.6);
      const [one, many] = askTrue ? [T, F] : [F, T];
      const [fn, gn] = r.pick([["f", "g"], ["u", "v"], ["f", "h"], ["p", "q"], ["g", "h"]]);
      const rn = (t: string) => t.replace(/f(?='?\()/g, "§").replace(/g(?=\()/g, gn).replace(/§/g, fn);
      const x = r.pick(one).map(rn), ys = r.shuffle([...many]).slice(0, 3).map((y) => y.map(rn));
      return {
        stem: `Cho $${fn}(x)$, $${gn}(x)$ là các hàm số liên tục trên $\\mathbb{R}$ và $a, b, c$ là các số thực. ${r.pick(["Khẳng định", "Mệnh đề", "Đẳng thức"])} nào sau đây ${askTrue ? "đúng" : "sai"}?`,
        ...mcq(r, x[0], ys.map((y) => y[0])),
        explanation: askTrue
          ? `${x[0]} đúng vì ${x[1]}. Các khẳng định còn lại sai, chẳng hạn ${ys[0][0]} sai vì ${ys[0][1]}.`
          : `${x[0]} sai vì ${x[1]}. Ba khẳng định còn lại đều đúng.`,
      };
    },
  },
  {
    id: "t12k2-tich-phan-da-thuc", subject: S, grade: G, hk: HK, half: 1, tk: K4, chapter: C4, topic: "Tính tích phân của hàm đa thức",
    level: 1, kind: "mcq",
    make: (r) => {
      const f = [r.nz(-3, 3), r.int(-4, 4), r.int(-5, 5)], a = r.int(-2, 2), b = a + r.int(1, 3);
      const F = antider(f), I = Qs(evQ(F, b), evQ(F, a));
      need(I[0] !== 0);
      const G2 = [...f, 0];
      const wrong = [Qn(-I[0], I[1]), Qn(ev(G2, b) - ev(G2, a)), Qn(ev(f, b) - ev(f, a)), evQ(F, b)];
      return {
        stem: `Tích phân $\\displaystyle\\int_{${a}}^{${b}} (${poly(f)})\\,dx$ bằng`,
        ...mcq(r, `$${Qt(I)}$`, wrong.map((w) => `$${Qt(w)}$`)),
        explanation: `Một nguyên hàm của hàm số là $F(x) = ${polyQ(F)}$. Do đó $\\displaystyle\\int_{${a}}^{${b}} (${poly(f)})\\,dx = F(${b}) - F(${a}) = ${Qt(evQ(F, b))} - ${Qv(evQ(F, a)) < 0 ? `\\left(${Qt(evQ(F, a))}\\right)` : Qt(evQ(F, a))} = ${Qt(I)}$.`,
      };
    },
  },
  {
    id: "t12k2-tich-phan-tinh-chat-so", subject: S, grade: G, hk: HK, half: 1, tk: K4, chapter: C4, topic: "Tính tích phân nhờ tính chất",
    level: 1, kind: "mcq",
    make: (r) => {
      const a = r.int(-2, 2), b = a + r.int(1, 4), c = b + r.int(1, 3), p = r.nz(-6, 8), q = r.nz(-6, 8), ty = r.int(0, 3);
      const I = (lo: number, hi: number, fx = "f(x)") => `\\displaystyle\\int_{${lo}}^{${hi}} ${fx}\\,dx`;
      let stem: string, ans: number, wrong: number[], ex: string;
      if (ty === 0) {
        const al = r.nz(-3, 3), be = r.nz(-3, 3);
        const ex0 = `${coef(al)}f(x)${term(be, "g(x)")}`;
        stem = `Cho $${I(a, b)} = ${p}$ và $${I(a, b, "g(x)")} = ${q}$. Tích phân $${I(a, b, `[${ex0}]`)}$ bằng`;
        ans = al * p + be * q; wrong = [al * p - be * q, al * q + be * p, p + q, al * p];
        ex = `$${I(a, b, `[${ex0}]`)} = ${al}\\cdot ${nm(p)} + ${nm(be)}\\cdot ${nm(q)} = ${ans}$.`;
      } else if (ty === 1) {
        stem = `Cho $${I(a, c)} = ${p}$ và $${I(a, b)} = ${q}$. Tích phân $${I(b, c)}$ bằng`;
        ans = p - q; wrong = [p + q, q - p, -p - q];
        ex = `$${I(a, c)} = ${I(a, b)} + ${I(b, c)}$ nên $${I(b, c)} = ${p} - ${nm(q)} = ${ans}$.`;
      } else if (ty === 2) {
        const k = r.nz(-3, 4), m = r.nz(-4, 4);
        stem = `Cho $${I(a, b)} = ${p}$. Tích phân $${I(a, b, `[${coef(k)}f(x)${term(m)}]`)}$ bằng`;
        ans = k * p + m * (b - a); wrong = [k * p + m, k * p, k * (p + m), k * p - m * (b - a)];
        ex = `$${I(a, b, `[${coef(k)}f(x)${term(m)}]`)} = ${coef(k)}${I(a, b)} + ${I(a, b, `(${m})`)} = ${k}\\cdot ${nm(p)} + ${nm(m)}\\cdot(${b} - ${nm(a)}) = ${ans}$.`;
      } else {
        const k = r.pick([2, 3, 4, -2, -3, 5]);
        stem = `Cho $${I(a, b)} = ${p}$. Tích phân $${I(b, a, `${k}f(x)`)}$ bằng`;
        ans = -k * p; wrong = [k * p, -p, p, k + p];
        ex = `$${I(b, a, `${k}f(x)`)} = ${-k}${I(a, b)} = ${-k}\\cdot ${nm(p)} = ${ans}$ (đổi cận thì tích phân đổi dấu).`;
      }
      return { stem, ...mcq(r, `$${ans}$`, wrong.map((w) => `$${w}$`)), explanation: ex };
    },
  },
  {
    id: "t12k2-tich-phan-luong-giac-mu", subject: S, grade: G, hk: HK, half: 1, tk: K4, chapter: C4, topic: "Tích phân của hàm lượng giác, mũ, 1/x",
    level: 1, kind: "mcq",
    make: (r) => {
      const ty = r.int(0, 3);
      let stem: string, right: string, wrong: string[], ex: string;
      if (ty === 0) {
        const a = r.nz(-4, 5), b = r.nz(-4, 5); need(a !== b && a !== -b);
        const fx = J(`${coef(a)}\\sin x`, `${coef(b)}\\cos x`);
        stem = `Tích phân $\\displaystyle\\int_0^{\\frac{\\pi}{2}} (${fx})\\,dx$ bằng`;
        right = `$${a + b}$`; wrong = [`$${b - a}$`, `$${a - b}$`, `$${-a - b}$`];
        ex = `$\\displaystyle\\int_0^{\\frac{\\pi}{2}} (${fx})\\,dx = \\left(${J(`${coef(-a)}\\cos x`, `${coef(b)}\\sin x`)}\\right)\\Big|_0^{\\frac{\\pi}{2}} = (${b}) - (${-a}) = ${a + b}$.`;
      } else if (ty === 1) {
        const a = r.nz(-4, 4), b = r.nz(-3, 3);
        const fx = `${coef(a)}\\sin x${term(b)}`;
        const W = (x: number) => (x === 0 ? `${coef(b)}\\pi` : `${x}${term(b, "\\pi")}`);
        stem = `Tích phân $\\displaystyle\\int_0^{\\pi} (${fx})\\,dx$ bằng`;
        right = `$${W(2 * a)}$`; wrong = [`$${W(-2 * a)}$`, `$${W(0)}$`, `$${W(a)}$`];
        ex = `$\\displaystyle\\int_0^{\\pi} (${fx})\\,dx = \\left(${coef(-a)}\\cos x${term(b, "x")}\\right)\\Big|_0^{\\pi} = \\left(${a}${term(b, "\\pi")}\\right) - (${-a}) = ${W(2 * a)}$.`;
      } else if (ty === 2) {
        const k = r.pick([1, 2, 3, 4, 5, -2, -3]), n = r.int(1, 4);
        const en = n === 1 ? "e" : `e^{${n}}`;
        stem = `Tích phân $\\displaystyle\\int_1^{${en}} \\dfrac{${Math.abs(k)}}{x}\\,dx$ bằng`.replace("\\int_1", k < 0 ? "-\\int_1" : "\\int_1");
        right = `$${k * n}$`; wrong = [`$${coef(k)}${en}$`, k === 1 ? `$${en} - 1$` : `$${k}(${en} - 1)$`, `$${-k * n}$`, `$${k * (n + 1)}$`];
        ex = `$\\displaystyle\\int_1^{${en}} \\dfrac{1}{x}\\,dx = \\ln|x|\\Big|_1^{${en}} = \\ln ${en} - \\ln 1 = ${n}$${k === 1 ? "" : `, nên kết quả bằng $${k}\\cdot ${n} = ${k * n}$`}.`;
      } else {
        const k = r.pick([1, 2, 3, 4, -2, -3]), m = r.int(2, 6);
        stem = `Tích phân $\\displaystyle\\int_0^{\\ln ${m}} ${coef(k)}e^x\\,dx$ bằng`;
        right = `$${k * (m - 1)}$`; wrong = [`$${k * m}$`, `$${coef(k)}\\ln ${m}$`, `$${k * (m + 1)}$`, `$${-k * (m - 1)}$`];
        ex = `$\\displaystyle\\int_0^{\\ln ${m}} ${coef(k)}e^x\\,dx = ${coef(k)}e^x\\Big|_0^{\\ln ${m}} = ${k}(e^{\\ln ${m}} - e^0) = ${k}(${m} - 1) = ${k * (m - 1)}$.`;
      }
      return { stem, ...mcq(r, right, wrong), explanation: ex };
    },
  },
  {
    id: "t12k2-tich-phan-tri-tuyet-doi", subject: S, grade: G, hk: HK, half: 1, tk: K4, chapter: C4, topic: "Tích phân của hàm chứa dấu giá trị tuyệt đối",
    level: 2, kind: "mcq",
    make: (r) => {
      const c = r.int(-2, 3), a = c - r.int(1, 3), b = c + r.int(1, 3), k = r.pick([1, 1, 2, 3]);
      const u = c - a, v = b - c;
      const I = Qn(k * (u * u + v * v), 2);
      const wrong = [Qn(k * Math.abs(v * v - u * u), 2), Qn(k * (b - a) * (b - a), 2), Qn(k * (u * u + v * v)), Qn(k * (b - a) * (b - a)), Qn(k * (v * v - u * u), 2)];
      const g = poly([k, -k * c]);
      return {
        stem: `Tích phân $\\displaystyle\\int_{${a}}^{${b}} |${g}|\\,dx$ bằng`,
        ...mcq(r, `$${Qt(I)}$`, wrong.map((w) => `$${Qt(w)}$`)),
        explanation: `Ta có $${g} \\le 0$ trên $[${a};${c}]$ và $${g} \\ge 0$ trên $[${c};${b}]$. Do đó $\\displaystyle\\int_{${a}}^{${b}} |${g}|\\,dx = \\int_{${a}}^{${c}} (${poly([-k, k * c])})\\,dx + \\int_{${c}}^{${b}} (${g})\\,dx = ${Qt(Qn(k * u * u, 2))} + ${Qt(Qn(k * v * v, 2))} = ${Qt(I)}$.`,
      };
    },
  },
  {
    id: "t12k2-dien-tich-parabol-truc-hoanh", subject: S, grade: G, hk: HK, half: 1, tk: K4, chapter: C4, topic: "Diện tích hình phẳng giới hạn bởi parabol và trục hoành",
    level: 2, kind: "mcq",
    make: (r) => {
      const k = r.pick([1, -1, 2, -2, 3, -3]), p = r.int(-3, 2), q = p + r.int(1, 4), d = q - p;
      const cs = [k, -k * (p + q), k * p * q];
      const Sq = Qn(Math.abs(k) * d * d * d, 6);
      const wrong = [`$${Qt(Qn(Math.abs(k) * d ** 3, 3))}$`, `$${Qt(Qn(Math.abs(k) * d ** 3, 2))}$`, `$${symQ(Sq, "\\pi")}$`, `$${Qt(Qn(k * k * d ** 5, 30))}$`];
      const F = antider(cs);
      return {
        stem: `Diện tích hình phẳng giới hạn bởi parabol $y = ${poly(cs)}$ và trục hoành bằng`,
        ...mcq(r, `$${Qt(Sq)}$`, wrong),
        explanation: `Phương trình hoành độ giao điểm: $${poly(cs)} = 0 \\Leftrightarrow x = ${p}$ hoặc $x = ${q}$. Trên $[${p};${q}]$ hàm số không đổi dấu nên $S = \\left|\\displaystyle\\int_{${p}}^{${q}} (${poly(cs)})\\,dx\\right| = \\left|\\left(${polyQ(F)}\\right)\\Big|_{${p}}^{${q}}\\right| = ${Qt(Sq)}$.`,
      };
    },
  },
  {
    id: "t12k2-cong-thuc-the-tich-tron-xoay", subject: S, grade: G, hk: HK, half: 1, tk: K4, chapter: C4, topic: "Thể tích khối tròn xoay quay quanh trục Ox",
    level: 2, kind: "mcq",
    make: (r) => {
      const ty = r.int(0, 3);
      let fx: string, a: number, b: number, V: Q, ns: Q | null, ex: string;
      if (ty === 0) {
        const k = r.pick([1, 2, 3, 4, 5, 6]); a = r.int(0, 2); b = a + r.int(1, 3);
        fx = k === 1 ? "\\sqrt{x}" : `\\sqrt{${k}x}`; V = Qn(k * (b * b - a * a), 2); ns = null;
        ex = `$V = \\pi\\displaystyle\\int_{${a}}^{${b}} ${k === 1 ? "" : k}x\\,dx = \\pi\\cdot ${Qt(Qn(k, 2))}x^2\\Big|_{${a}}^{${b}} = ${symQ(V, "\\pi")}$.`;
      } else if (ty === 1) {
        a = r.int(0, 1); b = a + r.int(1, 2); fx = "x^2"; V = Qn(b ** 5 - a ** 5, 5); ns = Qn(b ** 3 - a ** 3, 3);
        ex = `$V = \\pi\\displaystyle\\int_{${a}}^{${b}} x^4\\,dx = \\pi\\cdot\\dfrac{x^5}{5}\\Big|_{${a}}^{${b}} = ${symQ(V, "\\pi")}$.`;
      } else if (ty === 2) {
        const m = r.int(1, 4); a = 0; b = r.int(1, 4); fx = `${coef(m)}x`; V = Qn(m * m * b ** 3, 3); ns = Qn(m * b * b, 2);
        ex = `$V = \\pi\\displaystyle\\int_0^{${b}} ${m * m === 1 ? "" : m * m}x^2\\,dx = \\pi\\cdot ${Qt(Qn(m * m, 3))}x^3\\Big|_0^{${b}} = ${symQ(V, "\\pi")}$.`;
      } else {
        const c = r.int(1, 3); a = 0; b = r.int(1, 3); fx = `x + ${c}`; V = Qn((b + c) ** 3 - c ** 3, 3); ns = Qn(b * b + 2 * c * b, 2);
        ex = `$V = \\pi\\displaystyle\\int_0^{${b}} (x + ${c})^2\\,dx = \\pi\\cdot\\dfrac{(x + ${c})^3}{3}\\Big|_0^{${b}} = ${symQ(V, "\\pi")}$.`;
      }
      const wrong = [`$${Qt(V)}$`, ns ? `$${symQ(ns, "\\pi")}$` : `$${symQ(Qm(V, [2, 1]), "\\pi")}$`, `$${symQ(Qm(V, [1, 2]), "\\pi")}$`, `$${symQ(V, "\\pi^2")}$`];
      return {
        stem: `Cho hình phẳng giới hạn bởi đồ thị hàm số $y = ${fx}$, trục hoành và hai đường thẳng $x = ${a}$, $x = ${b}$. Thể tích khối tròn xoay tạo thành khi quay hình phẳng đó quanh trục $Ox$ bằng`,
        ...mcq(r, `$${symQ(V, "\\pi")}$`, wrong),
        explanation: `Áp dụng $V = \\pi\\displaystyle\\int_a^b f^2(x)\\,dx$: ${ex}`,
      };
    },
  },
  {
    id: "t12k2-the-tich-vat-the-thiet-dien", subject: S, grade: G, hk: HK, half: 1, tk: K4, chapter: C4, topic: "Thể tích vật thể khi biết diện tích thiết diện",
    level: 3, kind: "mcq",
    make: (r) => {
      const ty = r.int(0, 2);
      const intro = (a: string, b: string, shape: string) => `Tính thể tích của vật thể nằm giữa hai mặt phẳng $x = ${a}$ và $x = ${b}$, biết rằng thiết diện của vật thể bị cắt bởi mặt phẳng vuông góc với trục $Ox$ tại điểm có hoành độ $x$ $(${a} \\le x \\le ${b})$ là ${shape}.`;
      if (ty === 0) {
        const p = r.int(2, 6), h = r.int(1, p);
        const V = Qn(p ** 3 - (p - h) ** 3, 3);
        return {
          stem: intro("0", String(h), `một hình vuông có cạnh bằng $${p} - x$`),
          ...mcq(r, `$${Qt(V)}$`, [`$${symQ(V, "\\pi")}$`, `$${Qt(Qn(p * p - (p - h) ** 2, 2))}$`, `$${Qt(Qm(V, [3, 1]))}$`, `$${Qt(Qn(p * p * h))}$`]),
          explanation: `Diện tích thiết diện $S(x) = (${p} - x)^2$. $V = \\displaystyle\\int_0^{${h}} (${p} - x)^2\\,dx = -\\dfrac{(${p} - x)^3}{3}\\Big|_0^{${h}} = \\dfrac{${p ** 3} - ${(p - h) ** 3}}{3} = ${Qt(V)}$.`,
        };
      }
      if (ty === 1) {
        const m = r.int(1, 3), n = r.int(0, 4), a = r.int(0, 2), b = a + r.int(1, 3);
        const Sx = [m, n, 0], F = antider(Sx), V = Qs(evQ(F, b), evQ(F, a));
        const wrongSum = Qs(evQ(antider([m + 1, n]), b), evQ(antider([m + 1, n]), a));
        return {
          stem: intro(String(a), String(b), `một hình chữ nhật có hai kích thước là $x$ và $${poly([m, n])}$`),
          ...mcq(r, `$${Qt(V)}$`, [`$${symQ(V, "\\pi")}$`, `$${Qt(wrongSum)}$`, `$${Qt(Qm(Qn(b - a), Qn(ev(Sx, b))))}$`, `$${Qt(Qm(V, [1, 2]))}$`]),
          explanation: `Diện tích thiết diện $S(x) = x(${poly([m, n])}) = ${poly(Sx)}$. $V = \\displaystyle\\int_{${a}}^{${b}} (${poly(Sx)})\\,dx = \\left(${polyQ(F)}\\right)\\Big|_{${a}}^{${b}} = ${Qt(V)}$.`,
        };
      }
      const c = r.int(1, 4), half = r.chance(0.5);
      const V = Qn(c * c, half ? 4 : 2), up = half ? "\\dfrac{\\pi}{2}" : "\\pi";
      const side = c === 1 ? "\\sqrt{\\sin x}" : `${c}\\sqrt{\\sin x}`;
      return {
        stem: intro("0", up, `một tam giác đều có cạnh bằng $${side}$`),
        ...mcq(r, `$${symQ(V, "\\sqrt{3}")}$`, [`$${symQ(V, "\\sqrt{3}\\pi")}$`, `$${Qt(Qm(V, [4, 1]))}$`, `$${symQ(Qm(V, [4, 1]), "\\sqrt{3}")}$`, `$${symQ(Qm(V, [1, 2]), "\\sqrt{3}")}$`]),
        explanation: `Tam giác đều cạnh $a$ có diện tích $\\dfrac{a^2\\sqrt{3}}{4}$ nên $S(x) = ${symQ(Qn(c * c, 4), "\\sqrt{3}")}\\sin x$. $V = \\displaystyle\\int_0^{${up}} ${symQ(Qn(c * c, 4), "\\sqrt{3}")}\\sin x\\,dx = ${symQ(Qn(c * c, 4), "\\sqrt{3}")}\\cdot(-\\cos x)\\Big|_0^{${up}} = ${symQ(Qn(c * c, 4), "\\sqrt{3}")}\\cdot ${half ? 1 : 2} = ${symQ(V, "\\sqrt{3}")}$.`,
      };
    },
  },

  /* ---------- Đúng/Sai ---------- */
  {
    id: "t12k2-tf-nguyen-ham-tich-phan", subject: S, grade: G, hk: HK, half: 1, tk: K4, chapter: C4, topic: "Nguyên hàm và tích phân của hàm đa thức",
    level: 2, kind: "tf",
    make: (r) => {
      const al = r.nz(-2, 2), be = r.nz(-3, 3), ga = r.int(-4, 4), c0 = r.int(-5, 5);
      const f = [3 * al, 2 * be, ga], Fc = [al, be, ga, 0];
      const s1 = r.chance(0.5), s2 = r.chance(0.5), s3 = r.chance(0.5), s4 = r.chance(0.5);
      const F1 = al + be + ga + c0, I2 = 8 * al + 4 * be + 2 * ga, I3 = 2 * al + 2 * ga;
      need(I2 !== 0);
      const v2 = s2 ? F1 : F1 + r.pick([-2, -1, 1, 2]);
      const v3 = s3 ? I2 : -I2;
      const v4 = s4 ? I3 : I3 + 2 * be;
      return {
        stem: `Cho hàm số $f(x) = ${poly(f)}$.`,
        ...tf([
          [`$\\displaystyle\\int f(x)\\,dx = ${s1 ? poly(Fc) : poly([3 * al, 2 * be, ga, 0])} + C$.`, s1],
          [`Nếu $F(x)$ là một nguyên hàm của $f(x)$ thỏa mãn $F(0) = ${c0}$ thì $F(1) = ${v2}$.`, s2],
          [`$\\displaystyle\\int_0^2 f(x)\\,dx = ${v3}$.`, s3],
          [`$\\displaystyle\\int_{-1}^{1} f(x)\\,dx = ${v4}$.`, s4],
        ]),
        explanation: `a) ${tick(s1)}: $\\displaystyle\\int f(x)\\,dx = ${poly(Fc)} + C$. b) ${tick(s2)}: $F(x) = ${poly(Fc)}${term(c0)}$ nên $F(1) = ${F1}$. c) ${tick(s3)}: $\\displaystyle\\int_0^2 f(x)\\,dx = (${poly(Fc)})\\Big|_0^2 = ${I2}$. d) ${tick(s4)}: $\\displaystyle\\int_{-1}^{1} f(x)\\,dx = (${poly(Fc)})\\Big|_{-1}^{1} = ${al + be + ga} - (${-al + be - ga}) = ${I3}$.`,
      };
    },
  },
  {
    id: "t12k2-tf-dien-tich-the-tich", subject: S, grade: G, hk: HK, half: 1, tk: K4, chapter: C4, topic: "Diện tích và thể tích của hình phẳng giới hạn bởi parabol và đường thẳng",
    level: 3, kind: "tf",
    make: (r) => {
      const k = r.int(1, 4), m = r.int(0, 3);
      const P = poly([1, 0, m]), d = poly([k, m]), kx = `${coef(k)}x`;
      const s1 = r.chance(0.5), s2 = r.chance(0.5), s3 = r.chance(0.5), s4 = r.chance(0.5);
      const Sq = Qn(k ** 3, 6), V = Qa(Qn(2 * k ** 5, 15), Qn(m * k ** 3, 3)), Vw = Qn(k ** 5, 30);
      return {
        stem: `Cho hình phẳng $(H)$ giới hạn bởi parabol $(P): y = ${P}$ và đường thẳng $d: y = ${d}$.`,
        ...tf([
          [`Hoành độ giao điểm của $(P)$ và $d$ là $x = 0$ và $x = ${s1 ? k : -k}$.`, s1],
          [`Diện tích của $(H)$ được tính bởi công thức $S = \\displaystyle\\int_0^{${k}} (${s2 ? `${kx} - x^2` : `x^2 - ${kx}`})\\,dx$.`, s2],
          [`Diện tích của $(H)$ bằng $${Qt(s3 ? Sq : Qn(k ** 3, 3))}$.`, s3],
          [`Thể tích khối tròn xoay tạo thành khi quay $(H)$ quanh trục $Ox$ bằng $${symQ(s4 ? V : Vw, "\\pi")}$.`, s4],
        ]),
        explanation: `a) ${tick(s1)}: $${P} = ${d} \\Leftrightarrow x^2 - ${kx} = 0 \\Leftrightarrow x = 0$ hoặc $x = ${k}$. b) ${tick(s2)}: trên $[0;${k}]$ ta có $${d} \\ge ${P}$ nên $S = \\displaystyle\\int_0^{${k}} (${kx} - x^2)\\,dx$. c) ${tick(s3)}: $S = \\left(${Qt(Qn(k, 2))}x^2 - \\dfrac{x^3}{3}\\right)\\Big|_0^{${k}} = ${Qt(Sq)}$. d) ${tick(s4)}: $V = \\pi\\displaystyle\\int_0^{${k}} \\left[(${d})^2 - (${P})^2\\right]dx = \\pi\\displaystyle\\int_0^{${k}} (${poly([-1, 0, k * k - 2 * m, 2 * k * m, 0])})\\,dx = ${symQ(V, "\\pi")}$ (không phải $\\pi\\displaystyle\\int_0^{${k}} (${kx} - x^2)^2\\,dx$).`,
      };
    },
  },
  {
    id: "t12k2-tf-chuyen-dong-phanh", subject: S, grade: G, hk: HK, half: 1, tk: K4, chapter: C4, topic: "Ứng dụng tích phân: quãng đường ô tô khi phanh",
    level: 3, kind: "tf",
    make: (r) => {
      const v0 = r.pick([10, 12, 15, 16, 18, 20, 25]), a = r.pick([4, 5, 6, 8, 10]), tr = r.pick([0.5, 1, 1.5, 2]);
      const T = v0 / a, sb = (v0 * v0) / (2 * a), tot = v0 * tr + sb;
      need(round(T, 2) === T && round(sb, 2) === sb && round(tot, 2) === tot);
      const D = round(tot + r.pick([-6, -4, -2, 2, 3, 5, 8]), 0); need(D > 0 && D !== tot);
      const s1 = r.chance(0.5), s2 = r.chance(0.5), s3 = r.chance(0.5);
      const T1 = s1 ? T : T * 2, S2 = s2 ? sb : (v0 * v0) / a, S3 = s3 ? tot : sb;
      need(T1 !== T || s1); need(S3 !== tot || s3);
      const stop = tot < D;
      return {
        stem: `Một ô tô đang chạy với vận tốc $${v0}$ m/s thì người lái xe phát hiện chướng ngại vật phía trước cách xe $${D}$ m. Sau $${tex(tr)}$ giây (thời gian phản ứng) người lái đạp phanh; từ lúc đạp phanh, ô tô chuyển động chậm dần đều với vận tốc $v(t) = ${v0} - ${a}t$ (m/s), trong đó $t$ (giây) là thời gian tính từ lúc đạp phanh.`,
        ...tf([
          [`Ô tô dừng hẳn sau $${tex(T1)}$ giây kể từ lúc đạp phanh.`, s1],
          [`Quãng đường ô tô đi được từ lúc đạp phanh đến khi dừng hẳn là $${tex(S2)}$ m.`, s2],
          [`Quãng đường ô tô đi được từ lúc phát hiện chướng ngại vật đến khi dừng hẳn là $${tex(S3)}$ m.`, s3],
          [`Ô tô dừng lại trước khi chạm vào chướng ngại vật.`, stop],
        ]),
        explanation: `a) ${tick(s1)}: $v(t) = 0 \\Leftrightarrow t = \\dfrac{${v0}}{${a}} = ${tex(T)}$ (s). b) ${tick(s2)}: $s = \\displaystyle\\int_0^{${tex(T)}} (${v0} - ${a}t)\\,dt = \\left(${v0}t - ${tex(a / 2)}t^2\\right)\\Big|_0^{${tex(T)}} = ${tex(sb)}$ (m). c) ${tick(s3)}: trong thời gian phản ứng xe đi $${v0}\\cdot ${tex(tr)} = ${tex(v0 * tr)}$ m, tổng quãng đường $${tex(v0 * tr)} + ${tex(sb)} = ${tex(tot)}$ (m). d) ${tick(stop)}: $${tex(tot)} ${stop ? "<" : ">"} ${D}$ nên ô tô ${stop ? "dừng trước" : "không kịp dừng trước"} chướng ngại vật.`,
      };
    },
  },

  /* ---------- Trả lời ngắn ---------- */
  {
    id: "t12k2-sh-nguyen-ham-dieu-kien", subject: S, grade: G, hk: HK, half: 1, tk: K4, chapter: C4, topic: "Nguyên hàm thỏa mãn điều kiện cho trước",
    level: 2, kind: "short",
    make: (r) => {
      if (r.chance(0.3)) {
        const k = r.pick([1, 2, 3, 4, -2, -3]), y0 = r.int(-6, 6), m = r.int(2, 5);
        const C = y0 - k;
        const val = k * m + C;
        return {
          stem: `Biết $F(x)$ là một nguyên hàm của hàm số $f(x) = ${coef(k)}e^x$ thỏa mãn $F(0) = ${y0}$. Tính $F(\\ln ${m})$.`,
          ...short(val),
          explanation: `$F(x) = ${coef(k)}e^x + C$. $F(0) = ${k} + C = ${y0} \\Rightarrow C = ${C}$. Vậy $F(\\ln ${m}) = ${k}\\cdot ${m}${term(C)} = ${val}$.`,
        };
      }
      const al = r.nz(-2, 2), be = r.int(-3, 3), ga = r.int(-5, 5), x0 = r.int(-2, 2), x1 = r.int(-2, 3), y0 = r.int(-9, 9);
      need(x1 !== x0);
      const Fc = [al, be, ga, 0], C0 = y0 - ev(Fc, x0), ans = ev(Fc, x1) + C0;
      const f = [3 * al, 2 * be, ga];
      return {
        stem: `Biết $F(x)$ là một nguyên hàm của hàm số $f(x) = ${poly(f)}$ thỏa mãn $F(${x0}) = ${y0}$. Tính $F(${x1})$.`,
        ...short(ans),
        explanation: `$F(x) = ${poly(Fc)} + C$. $F(${x0}) = ${ev(Fc, x0)} + C = ${y0} \\Rightarrow C = ${C0}$. Vậy $F(${x1}) = ${ev(Fc, x1)}${term(C0)} = ${ans}$.`,
      };
    },
  },
  {
    id: "t12k2-sh-dien-tich-parabol-duong-thang", subject: S, grade: G, hk: HK, half: 1, tk: K4, chapter: C4, topic: "Diện tích hình phẳng giới hạn bởi parabol và đường thẳng",
    level: 3, kind: "short",
    make: (r) => {
      const a = r.pick([1, 1, -1, 2, -2]), p = r.int(-3, 2), q = p + r.int(1, 5), m = r.int(-3, 3), n = r.int(-4, 4);
      const d = q - p, Sv = (Math.abs(a) * d ** 3) / 6; need(Sv < 100);
      const P = [a, -a * (p + q) + m, a * p * q + n];
      return {
        stem: `Tính diện tích hình phẳng giới hạn bởi parabol $y = ${poly(P)}$ và đường thẳng $y = ${poly([m, n])}$ (làm tròn kết quả đến hàng phần mười).`,
        ...short(Sv, 1),
        explanation: `Hoành độ giao điểm: $${poly(P)} = ${poly([m, n])} \\Leftrightarrow ${poly([a, -a * (p + q), a * p * q])} = 0 \\Leftrightarrow x = ${p}$ hoặc $x = ${q}$. $S = \\displaystyle\\int_{${p}}^{${q}} \\left|${poly([a, -a * (p + q), a * p * q])}\\right|dx = ${Qt(Qn(Math.abs(a) * d ** 3, 6))} \\approx ${tex(Sv, 1)}$.`,
      };
    },
  },
  {
    id: "t12k2-sh-quang-duong-van-toc", subject: S, grade: G, hk: HK, half: 1, tk: K4, chapter: C4, topic: "Ứng dụng tích phân: quãng đường từ vận tốc",
    level: 2, kind: "short",
    make: (r) => {
      if (r.chance(0.5)) {
        const v0 = r.pick([10, 12, 14, 15, 16, 18, 20, 24]), a = r.int(3, 10), s = (v0 * v0) / (2 * a);
        need(s < 100);
        const obj = r.pick(["Một ô tô", "Một xe khách", "Một xe máy", "Một chiếc xe tải"]);
        return {
          stem: `${obj} đang chạy với vận tốc $${v0}$ m/s thì người lái đạp phanh; từ thời điểm đó, xe chuyển động chậm dần đều với vận tốc $v(t) = ${v0} - ${a}t$ (m/s), trong đó $t$ là thời gian tính bằng giây kể từ lúc đạp phanh. Tính quãng đường (đơn vị: mét) xe đi được từ lúc đạp phanh đến khi dừng hẳn (làm tròn kết quả đến hàng phần mười).`,
          ...short(s, 1),
          explanation: `Xe dừng khi $v(t) = 0 \\Leftrightarrow t = ${frac(v0, a)}$. Quãng đường $s = \\displaystyle\\int_0^{${frac(v0, a)}} (${v0} - ${a}t)\\,dt = \\left(${v0}t - ${frac(a, 2)}t^2\\right)\\Big|_0^{${frac(v0, a)}} = ${frac(v0 * v0, 2 * a)} \\approx ${tex(s, 1)}$ (m).`,
        };
      }
      const al = r.int(1, 2), be = r.int(0, 3), ga = r.int(0, 6), t1 = r.int(0, 2), t2 = t1 + r.int(1, 3);
      const v = [3 * al, 2 * be, ga], Fc = [al, be, ga, 0], s = ev(Fc, t2) - ev(Fc, t1);
      const obj = r.pick(["Một vật", "Một chất điểm", "Một chiếc xe đồ chơi điều khiển từ xa"]);
      return {
        stem: `${obj} chuyển động thẳng với vận tốc $v(t) = ${poly(v, "t")}$ (m/s), trong đó $t$ là thời gian tính bằng giây. Tính quãng đường (đơn vị: mét) vật đi được từ thời điểm $t = ${t1}$ s đến thời điểm $t = ${t2}$ s.`,
        ...short(s),
        explanation: `Vì $v(t) \\ge 0$ nên quãng đường $s = \\displaystyle\\int_{${t1}}^{${t2}} (${poly(v, "t")})\\,dt = (${poly(Fc, "t")})\\Big|_{${t1}}^{${t2}} = ${ev(Fc, t2)} - ${ev(Fc, t1)} = ${s}$ (m).`,
      };
    },
  },
  {
    id: "t12k2-sh-tich-phan-tim-tham-so", subject: S, grade: G, hk: HK, half: 1, tk: K4, chapter: C4, topic: "Tìm tham số từ giá trị tích phân",
    level: 3, kind: "short",
    make: (r) => {
      if (r.chance(0.5)) {
        const a = r.int(2, 7), b = r.int(-3, 4); need(-b - a <= 1);
        const val = a * a - 1 + b * (a - 1);
        return {
          stem: `Tìm số thực $a > 1$ thỏa mãn $\\displaystyle\\int_1^a (${poly([2, b])})\\,dx = ${val}$.`,
          ...short(a),
          explanation: `$\\displaystyle\\int_1^a (${poly([2, b])})\\,dx = (${poly([1, b, 0])})\\Big|_1^a = ${poly([1, b, 0], "a")} - ${nm(1 + b)}$. Ta có $${poly([1, b, -(1 + b) - val], "a")} = 0 \\Leftrightarrow a = ${a}$ hoặc $a = ${-b - a}$. Vì $a > 1$ nên $a = ${a}$.`,
        };
      }
      const k = r.int(1, 4), m = r.nz(-6, 6); need((m * k * k) % 2 === 0);
      const val = k ** 3 + (m * k * k) / 2;
      return {
        stem: `Tìm số thực $m$ thỏa mãn $\\displaystyle\\int_0^{${k}} (3x^2 + mx)\\,dx = ${val}$.`,
        ...short(m),
        explanation: `$\\displaystyle\\int_0^{${k}} (3x^2 + mx)\\,dx = \\left(x^3 + \\dfrac{m}{2}x^2\\right)\\Big|_0^{${k}} = ${k ** 3} + ${frac(k * k, 2)}m$. Giải $${k ** 3} + ${frac(k * k, 2)}m = ${val}$ được $m = ${m}$.`,
      };
    },
  },
  {
    id: "t12k2-sh-tich-phan-dao-ham", subject: S, grade: G, hk: HK, half: 1, tk: K4, chapter: C4, topic: "Tích phân của đạo hàm",
    level: 1, kind: "short",
    make: (r) => {
      const a = r.int(-2, 2), b = a + r.int(1, 4), A = r.int(-6, 6), B = r.int(-6, 9), k = r.nz(-3, 3), m = r.int(-4, 4);
      const ans = k * (B - A) + m * (b - a);
      const integ = m === 0 ? `${k}f'(x)` : `[${coef(k)}f'(x)${term(m)}]`;
      return {
        stem: `Cho hàm số $f(x)$ có đạo hàm liên tục trên $[${a};${b}]$, $f(${a}) = ${A}$ và $f(${b}) = ${B}$. Tính $\\displaystyle\\int_{${a}}^{${b}} ${integ}\\,dx$.`,
        ...short(ans),
        explanation: `Vì $f(x)$ là một nguyên hàm của $f'(x)$ nên $\\displaystyle\\int_{${a}}^{${b}} f'(x)\\,dx = f(${b}) - f(${a}) = ${B - A}$. Do đó tích phân cần tính bằng $${k}\\cdot ${nm(B - A)}${m ? ` + ${nm(m)}\\cdot (${b} - ${nm(a)})` : ""} = ${ans}$.`,
      };
    },
  },
];

/* =============================== HALF 2: TỌA ĐỘ OXYZ =============================== */
const H2a: Template[] = [
  {
    id: "t12k2-mp-vecto-phap-tuyen", subject: S, grade: G, hk: HK, half: 2, tk: K5, chapter: C5, topic: "Vectơ pháp tuyến của mặt phẳng",
    level: 1, kind: "mcq",
    make: (r) => {
      const n = vec3(r, -5, 5); if (r.chance(0.35)) n[r.int(0, 2)] = 0;
      need(n.filter((x) => x !== 0).length >= 2);
      const d = r.nz(-6, 6), k = r.pick([1, 1, -1, 2]);
      const name = r.pick(["(P)", "(Q)", "(\\alpha)"]);
      const right = `$${P3(mul3(k, n))}$`;
      const cand = [[n[0], n[1], d], [n[0], -n[1], n[2]], [-n[0], n[1], n[2]], [n[1], n[0], n[2]], [n[0], n[2], d], n.filter((x) => x !== 0).concat([d]).slice(0, 3), [n[0], n[1], -n[2]]];
      const wrong = cand.filter((v) => n2(v) > 0 && !par3(v, n)).map((v) => `$${P3(v)}$`);
      return {
        stem: `Trong không gian $Oxyz$, mặt phẳng $${name}: ${eqP(n, d)}$ có một vectơ pháp tuyến là`,
        ...mcq(r, right, wrong),
        explanation: `Mặt phẳng $ax + by + cz + d = 0$ có vectơ pháp tuyến $\\vec n = (a;b;c)$, nên $${name}$ có vectơ pháp tuyến $${P3(n)}$; mọi vectơ $k\\vec n$ $(k \\ne 0)$ cũng là vectơ pháp tuyến. Đáp án: ${right}.`,
      };
    },
  },
  {
    id: "t12k2-mp-qua-diem-vtpt", subject: S, grade: G, hk: HK, half: 2, tk: K5, chapter: C5, topic: "Phương trình mặt phẳng qua một điểm, biết vectơ pháp tuyến",
    level: 1, kind: "mcq",
    make: (r) => {
      const M = vec3(r, -4, 4), n = vec3(r, -4, 4);
      need(n.filter((x) => x !== 0).length >= 2 && n2(M) > 0 && !par3(M, n));
      const d = -dot3(n, M); need(d !== 0);
      const right = `$${eqP(n, d)}$`;
      return {
        stem: `Trong không gian $Oxyz$, mặt phẳng đi qua điểm $M${P3(M)}$ và nhận $\\vec n = ${P3(n)}$ làm vectơ pháp tuyến có phương trình là`,
        ...mcq(r, right, [`$${eqP(n, -d)}$`, `$${eqP(M, -dot3(M, n))}$`, `$${eqP(n, 0)}$`, `$${eqP(M, dot3(M, n))}$`]),
        explanation: `Phương trình: $${n[0]}(${sh("x", M[0])}) + ${nm(n[1])}(${sh("y", M[1])}) + ${nm(n[2])}(${sh("z", M[2])}) = 0 \\Leftrightarrow ${eqP(n, d)}$.`,
      };
    },
  },
  {
    id: "t12k2-mp-trung-truc-vuong-goc", subject: S, grade: G, hk: HK, half: 2, tk: K5, chapter: C5, topic: "Mặt phẳng trung trực / mặt phẳng vuông góc với đoạn thẳng",
    level: 2, kind: "mcq",
    make: (r) => {
      const A = vec3(r, -4, 4), B = vec3(r, -4, 4);
      need(!eq3(A, B));
      const AB = sub3(B, A), g = gcd(gcd(AB[0], AB[1]), AB[2]), n = mul3(1 / g, AB);
      if (r.chance(0.5)) {
        need(AB.every((x) => x % 2 === 0));
        const I = mul3(0.5, add3(A, B)), d = -dot3(n, I);
        return {
          stem: `Trong không gian $Oxyz$, cho hai điểm $A${P3(A)}$ và $B${P3(B)}$. Mặt phẳng trung trực của đoạn thẳng $AB$ có phương trình là`,
          ...mcq(r, `$${eqP(n, d)}$`, [`$${eqP(n, -dot3(n, A))}$`, `$${eqP(n, -dot3(n, B))}$`, `$${eqP(n, -d)}$`]),
          explanation: `Trung điểm của $AB$ là $I${P3(I)}$, $\\overrightarrow{AB} = ${P3(AB)}$${g !== 1 ? ` cùng phương với $\\vec n = ${P3(n)}$` : ""}. Mặt phẳng trung trực đi qua $I$ và vuông góc với $AB$: $${eqP(n, d)}$.`,
        };
      }
      const C = vec3(r, -4, 4); need(!eq3(C, A) && !eq3(C, B));
      const d = -dot3(n, C); need(d !== -dot3(n, A) && d !== 0);
      const AC = sub3(C, A); need(n2(AC) > 0 && !par3(AC, n));
      return {
        stem: `Trong không gian $Oxyz$, cho ba điểm $A${P3(A)}$, $B${P3(B)}$ và $C${P3(C)}$. Mặt phẳng đi qua $C$ và vuông góc với đường thẳng $AB$ có phương trình là`,
        ...mcq(r, `$${eqP(n, d)}$`, [`$${eqP(n, -dot3(n, A))}$`, `$${eqP(n, -d)}$`, `$${eqP(AC, -dot3(AC, C))}$`, `$${eqP(C, -dot3(C, n))}$`]),
        explanation: `Mặt phẳng vuông góc với $AB$ nên nhận $\\overrightarrow{AB} = ${P3(AB)}$${g !== 1 ? ` (hay $${P3(n)}$)` : ""} làm vectơ pháp tuyến; đi qua $C${P3(C)}$ nên có phương trình $${eqP(n, d)}$.`,
      };
    },
  },
  {
    id: "t12k2-kc-diem-mat-phang", subject: S, grade: G, hk: HK, half: 2, tk: K5, chapter: C5, topic: "Khoảng cách từ một điểm đến mặt phẳng",
    level: 1, kind: "mcq",
    make: (r) => {
      const { n, L } = niceN(r), d = r.int(-8, 8), M = vec3(r, -4, 4);
      const num = Math.abs(dot3(n, M) + d); need(num !== 0);
      const right = `$${frac(num, L)}$`;
      return {
        stem: `Trong không gian $Oxyz$, khoảng cách từ điểm $M${P3(M)}$ đến mặt phẳng $(P): ${eqP(n, d)}$ bằng`,
        ...mcq(r, right, [`$${frac(num, L * L)}$`, `$${frac(Math.abs(dot3(n, M)), L)}$`, `$${num}$`, `$${frac(Math.abs(dot3(n, M) - d), L)}$`, `$${frac(num + 1, L)}$`]),
        explanation: `$d(M,(P)) = \\dfrac{|${dotEx(n, M)}${term(d)}|}{\\sqrt{${n.map((x) => nm(x) + "^2").join(" + ")}}} = ${frac(num, L) === `\\dfrac{${num}}{${L}}` ? frac(num, L) : `\\dfrac{${num}}{${L}} = ${frac(num, L)}`}$.`,
      };
    },
  },
  {
    id: "t12k2-dt-vtcp-diem-thuoc", subject: S, grade: G, hk: HK, half: 2, tk: K5, chapter: C5, topic: "Vectơ chỉ phương, điểm thuộc đường thẳng",
    level: 1, kind: "mcq",
    make: (r) => {
      const M = vec3(r, -4, 4), u = vec3(r, -4, 4).map((x) => (x === 0 ? r.pick([1, -1, 2, -2]) : x));
      if (r.chance(0.3)) u[r.int(0, 2)] = 0;
      need(n2(M) > 0 && !par3(M, u));
      const can = u.every((x) => x !== 0) && r.chance(0.5);
      const eqd = can ? `d: ${ctac(M, u)}` : `d: ${ptts(M, u)}`;
      const on = (P: number[]) => par3(sub3(P, M), u);
      if (r.chance(0.5)) {
        const k = r.pick([1, -1, 2]);
        const wrong = [M, mul3(-1, M), [u[0], u[1], M[2]], [u[0], -u[1], u[2]], [M[0], u[1], u[2]]].filter((v) => n2(v) > 0 && !par3(v, u));
        return {
          stem: `Trong không gian $Oxyz$, cho đường thẳng $${eqd}$${can ? "" : " $(t \\in \\mathbb{R})$"}. Một vectơ chỉ phương của $d$ là`,
          ...mcq(r, `$${P3(mul3(k, u))}$`, wrong.map((v) => `$${P3(v)}$`)),
          explanation: `Đường thẳng $d$ đi qua $M${P3(M)}$ và có vectơ chỉ phương $\\vec u = ${P3(u)}$; mọi vectơ $k\\vec u$ $(k \\ne 0)$ cũng là vectơ chỉ phương. Đáp án: $${P3(mul3(k, u))}$.`,
        };
      }
      const t = r.pick([1, -1, 2, 0]), Pt = add3(M, mul3(t, u));
      const wrong = [u, mul3(-1, M), add3(Pt, [1, 0, 0]), add3(Pt, [0, -1, 0]), sub3(M, u).map((x, i) => (i === 2 ? x + 1 : x))].filter((v) => !on(v));
      const nameP = r.pick(["M", "N", "P", "Q"]);
      return {
        stem: `Trong không gian $Oxyz$, cho đường thẳng $${eqd}$${can ? "" : " $(t \\in \\mathbb{R})$"}. Điểm nào dưới đây thuộc $d$?`,
        ...mcq(r, `$${nameP}${P3(Pt)}$`, wrong.map((v) => `$${nameP}${P3(v)}$`)),
        explanation: `Với $t = ${t}$ ta được điểm $${P3(Pt)}$ thuộc $d$. Các điểm còn lại không thỏa mãn phương trình của $d$ với cùng một giá trị $t$.`,
      };
    },
  },
  {
    id: "t12k2-dt-qua-hai-diem", subject: S, grade: G, hk: HK, half: 2, tk: K5, chapter: C5, topic: "Phương trình chính tắc của đường thẳng qua hai điểm",
    level: 1, kind: "mcq",
    make: (r) => {
      const A = vec3(r, -4, 4), B = vec3(r, -4, 4), u = sub3(B, A);
      need(u.every((x) => x !== 0));
      const right = `$${ctac(A, u)}$`;
      const cand: string[] = [`$${ctac(mul3(-1, A), u)}$`];
      if (B.every((x) => x !== 0) && !par3(B, u)) cand.push(`$${ctac(A, B)}$`);
      const AB2 = add3(A, B); if (AB2.every((x) => x !== 0) && !par3(AB2, u)) cand.push(`$${ctac(A, AB2)}$`);
      if (A.every((x) => x !== 0) && !par3(A, u)) cand.push(`$${ctac(u, A)}$`);
      cand.push(`$${ctac(A, [u[0], u[1], -u[2]])}$`, `$${ctac(B, [-u[0], u[1], u[2]])}$`);
      return {
        stem: `Trong không gian $Oxyz$, cho hai điểm $A${P3(A)}$ và $B${P3(B)}$. Đường thẳng $AB$ có phương trình chính tắc là`,
        ...mcq(r, right, cand),
        explanation: `Đường thẳng $AB$ đi qua $A${P3(A)}$ và có vectơ chỉ phương $\\overrightarrow{AB} = ${P3(u)}$ nên có phương trình $${ctac(A, u)}$.`,
      };
    },
  },
  {
    id: "t12k2-goc-trong-khong-gian", subject: S, grade: G, hk: HK, half: 2, tk: K5, chapter: C5, topic: "Góc giữa hai đường thẳng, đường thẳng và mặt phẳng, hai mặt phẳng",
    level: 2, kind: "mcq",
    make: (r) => {
      const ty = r.int(0, 2);
      let u: number[] = [], v: number[] = [], ang = 0, found = false;
      for (let i = 0; i < 400 && !found; i++) {
        u = vec3(r, -2, 2); v = vec3(r, -2, 2);
        if (u.filter((x) => x !== 0).length < 2 || v.filter((x) => x !== 0).length < 2) continue;
        const D2 = dot3(u, v) ** 2, P = n2(u) * n2(v);
        let c2: number;
        if (4 * D2 === P) c2 = 1; else if (2 * D2 === P) c2 = 2; else if (4 * D2 === 3 * P) c2 = 3; else if (D2 === 0) c2 = 0; else continue;
        // c2: 1 ↔ giá trị 1/2, 2 ↔ √2/2, 3 ↔ √3/2, 0 ↔ 0
        if (ty === 1) ang = c2 === 1 ? 30 : c2 === 2 ? 45 : c2 === 3 ? 60 : 0;
        else ang = c2 === 1 ? 60 : c2 === 2 ? 45 : c2 === 3 ? 30 : 90;
        if (ang === 0) continue;
        found = true;
      }
      need(found);
      const M = vec3(r, -3, 3), d1 = r.int(-5, 5), d2 = r.int(-5, 5);
      const val = { 30: ty === 1 ? "\\dfrac{1}{2}" : "\\dfrac{\\sqrt{3}}{2}", 45: "\\dfrac{\\sqrt{2}}{2}", 60: ty === 1 ? "\\dfrac{\\sqrt{3}}{2}" : "\\dfrac{1}{2}", 90: ty === 1 ? "1" : "0" }[ang as 30 | 45 | 60 | 90];
      const lineU = `${ptts(M, u)}`;
      let stem: string, fn: string;
      if (ty === 0) { stem = `Trong không gian $Oxyz$, góc giữa hai đường thẳng $d_1: ${lineU}$ và $d_2: ${ptts(vec3(r, -3, 3), v)}$ bằng`; fn = "\\cos(d_1,d_2)"; }
      else if (ty === 1) { stem = `Trong không gian $Oxyz$, góc giữa đường thẳng $d: ${lineU}$ và mặt phẳng $(P): ${eqP(v, d1)}$ bằng`; fn = "\\sin(d,(P))"; }
      else { stem = `Trong không gian $Oxyz$, góc giữa hai mặt phẳng $(P): ${eqP(u, d1)}$ và $(Q): ${eqP(v, d2)}$ bằng`; fn = "\\cos((P),(Q))"; }
      const opts = [30, 45, 60, 90].map((x) => `$${x}^\\circ$`);
      return {
        stem,
        ...mcq(r, `$${ang}^\\circ$`, opts.filter((o) => o !== `$${ang}^\\circ$`)),
        explanation: `${ty === 2 ? "Hai vectơ pháp tuyến" : ty === 1 ? "Vectơ chỉ phương của $d$ và vectơ pháp tuyến của $(P)$" : "Hai vectơ chỉ phương"} lần lượt là $${P3(u)}$ và $${P3(v)}$. $${fn} = \\dfrac{|${dotEx(u, v)}|}{\\sqrt{${n2(u)}}\\cdot\\sqrt{${n2(v)}}} = ${val}$ nên góc cần tìm bằng $${ang}^\\circ$.`,
      };
    },
  },
  {
    id: "t12k2-mat-cau-tam-ban-kinh", subject: S, grade: G, hk: HK, half: 2, tk: K5, chapter: C5, topic: "Tâm và bán kính mặt cầu",
    level: 1, kind: "mcq",
    make: (r) => {
      const I = vec3(r, -5, 5), R2 = r.pick([1, 4, 9, 16, 25, 2, 3, 5, 8, 10, 12]);
      need(n2(I) > 0);
      const gen = r.chance(0.5), d = n2(I) - R2;
      const eq = gen ? `x^2 + y^2 + z^2${term(-2 * I[0], "x")}${term(-2 * I[1], "y")}${term(-2 * I[2], "z")}${term(d)} = 0` : sphere(I, R2);
      const askC = r.chance(0.5);
      if (askC) {
        const wrong = [mul3(-1, I), mul3(-2, I), mul3(2, I), [I[0], I[1], -I[2]]].filter((v) => !eq3(v, I)).map((v) => `$I${P3(v)}$`);
        return {
          stem: `Trong không gian $Oxyz$, mặt cầu $(S): ${eq}$ có tâm là`,
          ...mcq(r, `$I${P3(I)}$`, wrong),
          explanation: gen ? `Mặt cầu $x^2 + y^2 + z^2 - 2ax - 2by - 2cz + d = 0$ có tâm $I(a;b;c)$, ở đây $a = ${I[0]}$, $b = ${I[1]}$, $c = ${I[2]}$.` : `Mặt cầu $(x - a)^2 + (y - b)^2 + (z - c)^2 = R^2$ có tâm $I(a;b;c)$, nên tâm là $I${P3(I)}$.`,
        };
      }
      const R = sqrtTex(R2);
      const wrong = [`$${R2}$`, gen ? `$${sqrtTex(Math.abs(d)) }$` : `$${R2 * 2}$`, `$${sqrtTex(R2 + 1)}$`, `$${sqrtTex(R2 * 2)}$`, `$${R2 + 1}$`];
      return {
        stem: `Trong không gian $Oxyz$, bán kính của mặt cầu $(S): ${eq}$ bằng`,
        ...mcq(r, `$${R}$`, wrong),
        explanation: gen ? `Tâm $I${P3(I)}$, $R = \\sqrt{a^2 + b^2 + c^2 - d} = \\sqrt{${n2(I)} - ${nm(d)}} = ${R}$.` : `Ta có $R^2 = ${R2}$ nên $R = ${R}$.`,
      };
    },
  },
  {
    id: "t12k2-mat-cau-tiep-xuc-mp", subject: S, grade: G, hk: HK, half: 2, tk: K5, chapter: C5, topic: "Mặt cầu tâm I tiếp xúc với mặt phẳng",
    level: 2, kind: "mcq",
    make: (r) => {
      const I = vec3(r, -3, 3), { n, L } = niceN(r), R = r.int(2, 4), sg = r.pick([1, -1]);
      need(n2(I) > 0);
      const d = sg * R * L - dot3(n, I); need(Math.abs(d) <= 30);
      const right = `$${sphere(I, R * R)}$`;
      return {
        stem: `Trong không gian $Oxyz$, mặt cầu có tâm $I${P3(I)}$ và tiếp xúc với mặt phẳng $(P): ${eqP(n, d)}$ có phương trình là`,
        ...mcq(r, right, [`$${sphere(I, R)}$`, `$${sphere(mul3(-1, I), R * R)}$`, `$${sphere(I, (R * L) ** 2)}$`, `$${sphere(mul3(-1, I), R)}$`]),
        explanation: `Bán kính $R = d(I,(P)) = \\dfrac{|${dotEx(n, I)}${term(d)}|}{\\sqrt{${n2(n)}}} = \\dfrac{${R * L}}{${L}} = ${R}$. Phương trình mặt cầu: $${sphere(I, R * R)}$.`,
      };
    },
  },
  {
    id: "t12k2-vi-tri-hai-mat-phang", subject: S, grade: G, hk: HK, half: 2, tk: K5, chapter: C5, topic: "Vị trí tương đối của hai mặt phẳng",
    level: 1, kind: "mcq",
    make: (r) => {
      const n1 = vec3(r, -4, 4); need(n1.filter((x) => x !== 0).length >= 2);
      const d1 = r.int(-6, 6), ty = r.int(0, 3);
      let n2v: number[], d2: number;
      if (ty < 2) { const k = r.pick([1, 2, -1, 3, -2]); n2v = mul3(k, n1); d2 = ty === 0 ? k * d1 + r.nz(-5, 5) : k * d1; }
      else {
        let ok = false; n2v = [0, 0, 0];
        for (let i = 0; i < 300 && !ok; i++) { n2v = vec3(r, -4, 4); ok = n2(n2v) > 0 && !par3(n1, n2v) && (ty === 2 ? dot3(n1, n2v) === 0 : dot3(n1, n2v) !== 0); }
        need(ok); d2 = r.int(-6, 6);
      }
      const L = ["song song", "trùng nhau", "vuông góc với nhau", "cắt nhau nhưng không vuông góc"];
      const lab = L.map((x) => `$(P)$ và $(Q)$ ${x}`);
      const why = ty < 2
        ? `$\\vec n_Q = ${P3(n2v)}$ cùng phương với $\\vec n_P = ${P3(n1)}$ ($\\vec n_Q = ${n2v.find((x) => x !== 0)! / n1.find((x) => x !== 0)!}\\vec n_P$); ${ty === 0 ? "nhưng hệ số tự do không theo cùng tỉ lệ nên hai mặt phẳng song song" : "và hệ số tự do cũng theo cùng tỉ lệ nên hai mặt phẳng trùng nhau"}.`
        : `$\\vec n_P = ${P3(n1)}$, $\\vec n_Q = ${P3(n2v)}$ không cùng phương nên hai mặt phẳng cắt nhau; $\\vec n_P\\cdot\\vec n_Q = ${dotEx(n1, n2v)} = ${dot3(n1, n2v)}$ nên chúng ${ty === 2 ? "vuông góc" : "không vuông góc"}.`;
      return {
        stem: `Trong không gian $Oxyz$, cho hai mặt phẳng $(P): ${eqP(n1, d1)}$ và $(Q): ${eqP(n2v, d2)}$. Khẳng định nào sau đây đúng?`,
        ...mcq(r, lab[ty], lab.filter((_, i) => i !== ty)),
        explanation: why,
      };
    },
  },

  /* ---------- Đúng/Sai ---------- */
  {
    id: "t12k2-tf-mp-hinh-chieu", subject: S, grade: G, hk: HK, half: 2, tk: K5, chapter: C5, topic: "Mặt phẳng, đường thẳng vuông góc và hình chiếu của điểm",
    level: 3, kind: "tf",
    make: (r) => {
      const { n, L } = niceN(r, true), H = vec3(r, -3, 3), k = r.pick([1, -1, 2, -2]);
      const A = add3(H, mul3(k, n)), d = -dot3(n, H);
      const s1 = r.chance(0.5), s2 = r.chance(0.5), s3 = r.chance(0.5), s4 = r.chance(0.5);
      const iNz = [0, 1, 2].filter((i) => n[i] !== 0);
      const j = r.pick(iNz), nf = n.map((x, i) => (i === j ? -x : x));
      const A2 = add3(H, mul3(-k, n));
      return {
        stem: `Trong không gian $Oxyz$, cho mặt phẳng $(P): ${eqP(n, d)}$ và điểm $A${P3(A)}$. Gọi $\\Delta$ là đường thẳng đi qua $A$ và vuông góc với $(P)$.`,
        ...tf([
          [`Mặt phẳng $(P)$ có một vectơ pháp tuyến là $\\vec n = ${P3(s1 ? n : nf)}$.`, s1],
          [`Đường thẳng $\\Delta$ có phương trình tham số $${s2 ? ptts(A, n) : ptts(mul3(-1, A), n)}$ $(t \\in \\mathbb{R})$.`, s2 || eq3(A, mul3(-1, A))],
          [`Khoảng cách từ $A$ đến $(P)$ bằng $${s3 ? Math.abs(k) * L : Math.abs(k) * L * L}$.`, s3],
          [`Hình chiếu vuông góc của $A$ trên $(P)$ là điểm $H${P3(s4 ? H : A2)}$.`, s4],
        ]),
        explanation: `a) ${tick(s1)}: $(P)$ có vectơ pháp tuyến $\\vec n = ${P3(n)}$. b) ${tick(s2)}: $\\Delta$ qua $A${P3(A)}$, nhận $\\vec n$ làm vectơ chỉ phương: $${ptts(A, n)}$. c) ${tick(s3)}: $d(A,(P)) = \\dfrac{|${dotEx(n, A)}${term(d)}|}{${L}} = ${Math.abs(k) * L}$. d) ${tick(s4)}: thay phương trình $\\Delta$ vào $(P)$: $${n2(n)}t${term(dot3(n, A) + d)} = 0 \\Leftrightarrow t = ${-k}$, được $H${P3(H)}$ (điểm $${P3(A2)}$ là điểm đối xứng của $A$ qua $(P)$).`,
      };
    },
  },
  {
    id: "t12k2-tf-mat-cau", subject: S, grade: G, hk: HK, half: 2, tk: K5, chapter: C5, topic: "Mặt cầu: tâm, bán kính, vị trí điểm và mặt phẳng",
    level: 2, kind: "tf",
    make: (r) => {
      const I = vec3(r, -4, 4), R = r.int(2, 6), { n, L } = niceN(r);
      need(n2(I) > 0);
      const dd = n2(I) - R * R;
      const eq = `x^2 + y^2 + z^2${term(-2 * I[0], "x")}${term(-2 * I[1], "y")}${term(-2 * I[2], "z")}${term(dd)} = 0`;
      const M = add3(I, vec3(r, -3, 3)), dm2 = n2(sub3(M, I)); need(dm2 !== R * R);
      const h = r.int(0, R - 1), sg = r.pick([1, -1]), d = sg * h * L - dot3(n, I);
      const r2 = R * R - h * h;
      const s1 = r.chance(0.5), s2 = r.chance(0.5), s3 = r.pick(["trong", "ngoài"]), s4 = r.chance(0.5);
      const t3 = (s3 === "trong") === (dm2 < R * R);
      const rr = s4 ? sqrtTex(r2) : sqrtTex(R * R + h * h);
      need(s4 || h > 0);
      return {
        stem: `Trong không gian $Oxyz$, cho mặt cầu $(S): ${eq}$ và mặt phẳng $(P): ${eqP(n, d)}$.`,
        ...tf([
          [`Mặt cầu $(S)$ có tâm $I${P3(s1 ? I : mul3(-1, I))}$.`, s1],
          [`Mặt cầu $(S)$ có bán kính bằng $${s2 ? R : R * R}$.`, s2],
          [`Điểm $M${P3(M)}$ nằm ${s3} mặt cầu $(S)$.`, t3],
          [`Mặt phẳng $(P)$ cắt mặt cầu $(S)$ theo giao tuyến là một đường tròn có bán kính bằng $${rr}$.`, s4],
        ]),
        explanation: `a) ${tick(s1)}: tâm $I${P3(I)}$. b) ${tick(s2)}: $R = \\sqrt{${n2(I)} - ${nm(dd)}} = ${R}$. c) ${tick(t3)}: $IM^2 = ${dm2} ${dm2 < R * R ? "<" : ">"} ${R * R} = R^2$ nên $M$ nằm ${dm2 < R * R ? "trong" : "ngoài"} mặt cầu. d) ${tick(s4)}: $d(I,(P)) = \\dfrac{|${dotEx(n, I)}${term(d)}|}{${L}} = ${h} < R$, bán kính đường tròn giao tuyến $r = \\sqrt{R^2 - d^2} = \\sqrt{${R * R} - ${h * h}} = ${sqrtTex(r2)}$.`,
      };
    },
  },
  {
    id: "t12k2-tf-flycam", subject: S, grade: G, hk: HK, half: 2, tk: K5, chapter: C5, topic: "Bài toán thực tế: chuyển động thẳng trong không gian",
    level: 3, kind: "tf",
    make: (r) => {
      const base = r.pick(NICE.slice(0, 6));
      const perm = r.shuffle([...base]); need(perm[2] !== 0);
      const v = [r.chance(0.5) ? perm[0] : -perm[0], r.chance(0.5) ? perm[1] : -perm[1], -Math.abs(perm[2])].map((x) => x + 0);
      const sp = Math.sqrt(n2(v)), T = r.int(5, 20);
      const A = [r.int(-30, 30), r.int(-30, 30), -v[2] * T];
      need(A[2] <= 200);
      const t1 = r.int(2, 4), t2 = r.int(1, T - 1);
      const obj = r.pick(["một chiếc flycam", "một thiết bị bay không người lái", "một chiếc drone giao hàng"]);
      const s1 = r.chance(0.5), s2 = r.chance(0.5), s3 = r.chance(0.5), s4 = r.chance(0.5);
      const P1 = add3(A, mul3(t1, v)), P1w = add3(A, v);
      const B = add3(A, mul3(T, v)), Bw = add3(A, mul3(T + 1, v)).map((x, i) => (i === 2 ? 0 : x));
      const z2 = A[2] + t2 * v[2];
      return {
        stem: `Trong không gian $Oxyz$ (đơn vị trên mỗi trục là mét), mặt đất là mặt phẳng $(Oxy)$. Tại thời điểm ban đầu, ${obj} ở vị trí $A${P3(A)}$ và bắt đầu bay thẳng đều với vectơ vận tốc $\\vec v = ${P3(v)}$ (mỗi giây di chuyển một đoạn ứng với $\\vec v$).`,
        ...tf([
          [`Sau $${t1}$ giây, thiết bị ở vị trí có tọa độ $${P3(s1 ? P1 : P1w)}$.`, s1],
          [`Tốc độ bay của thiết bị là $${s2 ? sp : sp * sp}$ m/s.`, s2],
          [`Sau $${t2}$ giây, thiết bị ở độ cao $${s3 ? z2 : A[2] - t2 * v[2]}$ m so với mặt đất.`, s3],
          [`Thiết bị chạm đất tại điểm $${P3(s4 ? B : Bw)}$.`, s4],
        ]),
        explanation: `Vị trí sau $t$ giây: $M(t) = A + t\\vec v = \\left(${[0, 1, 2].map((i) => pc(A[i], v[i])).join(";")}\\right)$. a) ${tick(s1)}: $M(${t1}) = ${P3(P1)}$. b) ${tick(s2)}: $|\\vec v| = \\sqrt{${n2(v)}} = ${sp}$ (m/s). c) ${tick(s3)}: độ cao $z = ${A[2]} ${term(v[2] * t2).trim()} = ${z2}$ (m). d) ${tick(s4)}: chạm đất khi $z = 0 \\Leftrightarrow ${A[2]}${term(v[2], "t")} = 0 \\Leftrightarrow t = ${T}$, tại điểm $${P3(B)}$.`,
      };
    },
  },

  /* ---------- Trả lời ngắn ---------- */
  {
    id: "t12k2-sh-kc-hai-mp-song-song", subject: S, grade: G, hk: HK, half: 2, tk: K5, chapter: C5, topic: "Khoảng cách giữa hai mặt phẳng song song",
    level: 2, kind: "short",
    make: (r) => {
      const { n, L } = niceN(r), d1 = r.int(-12, 12), d2 = r.int(-12, 12), k = r.pick([1, 1, 2, -1, -2]);
      need(d1 !== d2);
      const dist = Math.abs(d1 - d2) / L; need(dist < 10);
      return {
        stem: `Trong không gian $Oxyz$, tính khoảng cách giữa hai mặt phẳng song song $(P): ${eqP(n, d1)}$ và $(Q): ${eqP(mul3(k, n), k * d2)}$ (làm tròn kết quả đến hàng phần trăm).`,
        ...short(dist, 2),
        explanation: `${k !== 1 ? `Chia hai vế phương trình $(Q)$ cho $${k}$: $(Q): ${eqP(n, d2)}$. ` : ""}Lấy $M \\in (P)$, $d((P),(Q)) = d(M,(Q)) = \\dfrac{|${d1} - ${nm(d2)}|}{\\sqrt{${n2(n)}}} = ${frac(Math.abs(d1 - d2), L)} \\approx ${tex(dist, 2)}$.`,
      };
    },
  },
  {
    id: "t12k2-sh-goc-day-neo", subject: S, grade: G, hk: HK, half: 2, tk: K5, chapter: C5, topic: "Bài toán thực tế: góc giữa dây và mặt đất",
    level: 3, kind: "short",
    make: (r) => {
      const h = r.int(6, 24), x = r.int(2, 12), y = r.int(-12, 12);
      const g = Math.sqrt(x * x + y * y), ang = (Math.atan2(h, g) * 180) / Math.PI;
      const askPole = r.chance(0.4), val = askPole ? 90 - ang : ang;
      need(Math.abs(val - Math.round(val)) < 0.45);
      const obj = r.pick(["một cột ăng-ten", "một cột cờ", "một cột điện", "một tháp thu phát sóng"]);
      const B = [x, y, 0];
      return {
        stem: `Trong không gian $Oxyz$ (đơn vị: mét), mặt đất là mặt phẳng $(Oxy)$. Người ta dựng ${obj} thẳng đứng có chân tại gốc $O$ và đỉnh tại $A(0;0;${h})$, rồi căng một sợi dây thẳng từ $A$ xuống điểm neo $B${P3(B)}$ trên mặt đất. Tính góc giữa sợi dây $AB$ và ${askPole ? "cột" : "mặt đất"} (đơn vị: độ, làm tròn đến hàng đơn vị).`,
        ...short(val, 0),
        explanation: `$\\overrightarrow{AB} = ${P3([x, y, -h])}$, $AB = \\sqrt{${x * x + y * y + h * h}}$. ${askPole
          ? `Cột có vectơ chỉ phương $\\vec k = (0;0;1)$: $\\cos\\varphi = \\dfrac{${h}}{\\sqrt{${x * x + y * y + h * h}}}$ nên $\\varphi \\approx ${tex(val, 0)}^\\circ$.`
          : `Mặt đất có vectơ pháp tuyến $\\vec k = (0;0;1)$: $\\sin\\varphi = \\dfrac{|-${h}|}{\\sqrt{${x * x + y * y + h * h}}}$ nên $\\varphi \\approx ${tex(val, 0)}^\\circ$.`}`,
      };
    },
  },
  {
    id: "t12k2-sh-tham-so-vuong-goc-song-song", subject: S, grade: G, hk: HK, half: 2, tk: K5, chapter: C5, topic: "Tìm tham số để mặt phẳng, đường thẳng vuông góc/song song",
    level: 2, kind: "short",
    make: (r) => {
      const ty = r.int(0, 2);
      if (ty === 0) {
        const n = vec3(r, -4, 4), a2 = r.int(-4, 4), c2 = r.int(-4, 4), e = r.int(-6, 6); need(n[1] !== 0);
        const num = -(n[0] * a2 + n[2] * c2); need(num % n[1] === 0);
        const m = num / n[1]; need(m !== 0);
        return {
          stem: `Trong không gian $Oxyz$, cho hai mặt phẳng $(P): ${eqP(n, r.int(-5, 5))}$ và $(Q): ${a2 ? `${coef(a2)}x + ` : ""}my${term(c2, "z")}${term(e)} = 0$. Tìm $m$ để $(P) \\perp (Q)$.`,
          ...short(m),
          explanation: `$(P) \\perp (Q) \\Leftrightarrow \\vec n_P\\cdot\\vec n_Q = 0 \\Leftrightarrow ${n[0]}\\cdot ${nm(a2)} + ${nm(n[1])}m + ${nm(n[2])}\\cdot ${nm(c2)} = 0 \\Leftrightarrow m = ${m}$.`,
        };
      }
      if (ty === 1) {
        const { n } = { n: vec3(r, -4, 4) }; need(n[1] !== 0);
        const M = vec3(r, -3, 3), u0 = r.nz(-4, 4), u2 = r.int(-4, 4), d = r.int(-6, 6);
        const num = -(n[0] * u0 + n[2] * u2); need(num % n[1] === 0);
        const m = num / n[1]; need(m !== 0 && dot3(n, M) + d !== 0);
        const yrow = M[1] === 0 ? "mt" : `${M[1]} + mt`;
        const lineEq = `\\begin{cases} x = ${pc(M[0], u0)} \\\\ y = ${yrow} \\\\ z = ${pc(M[2], u2)} \\end{cases}`;
        return {
          stem: `Trong không gian $Oxyz$, cho mặt phẳng $(P): ${eqP(n, d)}$ và đường thẳng $d: ${lineEq}$ $(t \\in \\mathbb{R})$. Tìm $m$ để $d$ song song với $(P)$.`,
          ...short(m),
          explanation: `$d$ đi qua $M${P3(M)}$, có vectơ chỉ phương $\\vec u = (${u0};m;${u2})$. $d \\parallel (P) \\Rightarrow \\vec u\\cdot\\vec n = 0 \\Leftrightarrow ${nm(n[0])}\\cdot ${nm(u0)} + ${nm(n[1])}m + ${nm(n[2])}\\cdot ${nm(u2)} = 0 \\Leftrightarrow m = ${m}$. Kiểm tra: $M \\notin (P)$ (vì $${dotEx(n, M)}${term(d)} = ${dot3(n, M) + d} \\ne 0$) nên $d$ không nằm trong $(P)$. Vậy $m = ${m}$.`,
        };
      }
      const n = vec3(r, -4, 4); need(n.every((x) => x !== 0));
      const k = r.pick([2, 3, -2, -1]), d1 = r.int(-5, 5), d2 = r.int(-9, 9); need(d2 !== k * d1);
      const m = k * n[1];
      return {
        stem: `Trong không gian $Oxyz$, cho hai mặt phẳng $(P): ${eqP(n, d1)}$ và $(Q): ${k * n[0]}x + my${term(k * n[2], "z")}${term(d2)} = 0$. Tìm $m$ để $(P)$ song song với $(Q)$.`,
        ...short(m),
        explanation: `$(P) \\parallel (Q) \\Leftrightarrow \\dfrac{${k * n[0]}}{${n[0]}} = \\dfrac{m}{${n[1]}} = \\dfrac{${k * n[2]}}{${n[2]}} \\ne \\dfrac{${d2}}{${d1}}$, nên $m = ${k}\\cdot ${nm(n[1])} = ${m}$ (hệ số tự do $${d2} \\ne ${k * d1}$ nên hai mặt phẳng không trùng nhau).`,
      };
    },
  },
  {
    id: "t12k2-sh-giao-diem-dt-mp", subject: S, grade: G, hk: HK, half: 2, tk: K5, chapter: C5, topic: "Giao điểm của đường thẳng và mặt phẳng",
    level: 3, kind: "short",
    make: (r) => {
      const M = vec3(r, -3, 3), u = vec3(r, -3, 3), n = vec3(r, -3, 3), t0 = r.nz(-3, 3);
      need(n2(u) > 0 && n.filter((x) => x !== 0).length >= 2 && dot3(n, u) !== 0);
      const X = add3(M, mul3(t0, u)), d = -dot3(n, X);
      const can = u.every((x) => x !== 0) && r.chance(0.5);
      return {
        stem: `Trong không gian $Oxyz$, đường thẳng $d: ${can ? ctac(M, u) : ptts(M, u)}$${can ? "" : " $(t \\in \\mathbb{R})$"} cắt mặt phẳng $(P): ${eqP(n, d)}$ tại điểm $I(a;b;c)$. Tính $a + b + c$.`,
        ...short(X[0] + X[1] + X[2]),
        explanation: `${can ? `Viết $d$ dưới dạng tham số $${ptts(M, u)}$. ` : ""}Thay vào $(P)$: $${dot3(n, u)}t${term(dot3(n, M) + d)} = 0 \\Leftrightarrow t = ${t0}$, suy ra $I${P3(X)}$. Vậy $a + b + c = ${X[0] + X[1] + X[2]}$.`,
      };
    },
  },
];

/* =============================== HALF 2: XÁC SUẤT CÓ ĐIỀU KIỆN =============================== */
const LETTERS: [string, string][] = [["A", "B"], ["A", "C"], ["E", "F"], ["H", "K"], ["M", "N"]];
const cases2 = (a: number, b: number, c: number, d: number, R: string[], Cc: string[]) =>
  `$\\begin{array}{|l|c|c|}\\hline & \\text{${Cc[0]}} & \\text{${Cc[1]}} \\\\ \\hline \\text{${R[0]}} & ${a} & ${b} \\\\ \\hline \\text{${R[1]}} & ${c} & ${d} \\\\ \\hline\\end{array}$`;
const TABLE_CTX = [
  { who: "học sinh khối 12 của một trường", unit: "học sinh", R: ["Nam", "Nữ"], C: ["Biết bơi", "Chưa biết bơi"], r: ["là nam", "là nữ"], c: ["biết bơi", "chưa biết bơi"] },
  { who: "học sinh lớp 12A", unit: "học sinh", R: ["Nam", "Nữ"], C: ["Thích bóng đá", "Không thích bóng đá"], r: ["là nam", "là nữ"], c: ["thích bóng đá", "không thích bóng đá"] },
  { who: "người trưởng thành ở một địa phương", unit: "người", R: ["Hút thuốc", "Không hút thuốc"], C: ["Có bệnh phổi", "Không có bệnh phổi"], r: ["hút thuốc", "không hút thuốc"], c: ["có bệnh phổi", "không có bệnh phổi"] },
  { who: "khách hàng của một cửa hàng", unit: "khách hàng", R: ["Khách quen", "Khách mới"], C: ["Có mua hàng", "Không mua hàng"], r: ["là khách quen", "là khách mới"], c: ["có mua hàng", "không mua hàng"] },
];
const SUPPLY = [
  { intro: "Một nhà máy sản xuất sản phẩm trên", unit: "dây chuyền", it: "sản phẩm", src: ["dây chuyền I", "dây chuyền II", "dây chuyền III"], bad: "là phế phẩm" },
  { intro: "Một cửa hàng nhập bóng đèn từ", unit: "nhà cung cấp", it: "bóng đèn", src: ["nhà cung cấp A", "nhà cung cấp B", "nhà cung cấp C"], bad: "bị lỗi" },
  { intro: "Một kho chứa linh kiện điện tử được sản xuất ở", unit: "phân xưởng", it: "linh kiện", src: ["phân xưởng 1", "phân xưởng 2", "phân xưởng 3"], bad: "bị hỏng" },
];
function supply(r: Rng) {
  const c = r.pick(SUPPLY), k = r.pick([2, 2, 3]);
  let p: number[];
  if (k === 2) { const p1 = 5 * r.int(6, 15); p = [p1, 100 - p1]; }
  else { const p1 = 5 * r.int(4, 10), p2 = 5 * r.int(3, 18 - p1 / 5); p = [p1, p2, 100 - p1 - p2]; need(p[2] >= 10); }
  const q = p.map(() => r.int(1, 6)); need(new Set(q).size > 1);
  const tot = p.reduce((s, x, i) => s + x * q[i], 0);
  const desc = `${c.intro} ${k === 2 ? "hai" : "ba"} ${c.unit}: ${c.src.slice(0, k).join(k === 2 ? " và " : ", ")}. Trong tổng số ${c.it}, ${c.src.slice(0, k).map((s, i) => `${s} chiếm $${p[i]}\\%$`).join(", ")}; tỉ lệ ${c.it} ${c.bad} của ${c.src.slice(0, k).map((s, i) => `${s} là $${q[i]}\\%$`).join(", ")}.`;
  return { c, k, p, q, tot, desc };
}

const H2b: Template[] = [
  {
    id: "t12k2-xs-cong-thuc-ly-thuyet", subject: S, grade: G, hk: HK, half: 2, tk: K6, chapter: C6, topic: "Công thức xác suất có điều kiện, toàn phần, Bayes",
    level: 1, kind: "mcq",
    make: (r) => {
      const [A, B] = r.pick(LETTERS), ty = r.int(0, 5);
      const P = (x: string) => `P(${x})`, nb = `\\overline{${B}}`, na = `\\overline{${A}}`;
      const c = (x: string, y: string) => `P(${x}\\,|\\,${y})`;
      const Q: [string, string, string[], string][] = [
        [`Cho hai biến cố $${A}$, $${B}$ với $${P(B)} > 0$. Xác suất có điều kiện $${c(A, B)}$ bằng`, `\\dfrac{${P(`${A}\\cap ${B}`)}}{${P(B)}}`, [`\\dfrac{${P(`${A}\\cap ${B}`)}}{${P(A)}}`, `\\dfrac{${P(A)}}{${P(B)}}`, `${P(A)}\\cdot ${P(B)}`], "định nghĩa xác suất có điều kiện"],
        [`Cho hai biến cố $${A}$, $${B}$ với $0 < ${P(B)} < 1$. Theo công thức xác suất toàn phần, $${P(A)}$ bằng`, `${P(B)}\\cdot ${c(A, B)} + ${P(nb)}\\cdot ${c(A, nb)}`, [`${c(A, B)} + ${c(A, nb)}`, `${P(B)}\\cdot ${c(B, A)} + ${P(nb)}\\cdot ${c(nb, A)}`, `${c(A, B)}\\cdot ${c(A, nb)}`], "công thức xác suất toàn phần"],
        [`Cho hai biến cố $${A}$, $${B}$ với $${P(A)} > 0$, $${P(B)} > 0$. Theo công thức Bayes, $${c(B, A)}$ bằng`, `\\dfrac{${P(B)}\\cdot ${c(A, B)}}{${P(A)}}`, [`\\dfrac{${P(A)}\\cdot ${c(A, B)}}{${P(B)}}`, `\\dfrac{${P(A)}\\cdot ${P(B)}}{${c(A, B)}}`, `${P(B)}\\cdot ${c(A, B)}`], "công thức Bayes"],
        [`Cho hai biến cố độc lập $${A}$, $${B}$ với $${P(B)} > 0$. Khi đó $${c(A, B)}$ bằng`, `${P(A)}`, [`${P(B)}`, `${P(A)}\\cdot ${P(B)}`, `1 - ${P(A)}`], "khi $A$, $B$ độc lập thì việc $B$ xảy ra không ảnh hưởng tới xác suất của $A$".replace(/\$A\$/g, `$${A}$`).replace(/\$B\$/g, `$${B}$`)],
        [`Cho hai biến cố $${A}$, $${B}$ với $${P(B)} > 0$. Theo công thức nhân xác suất, $${P(`${A}\\cap ${B}`)}$ bằng`, `${P(B)}\\cdot ${c(A, B)}`, [`${P(A)}\\cdot ${c(A, B)}`, `\\dfrac{${c(A, B)}}{${P(B)}}`, `${c(A, B)} + ${P(B)}`], "công thức nhân xác suất"],
        [`Cho hai biến cố $${A}$, $${B}$ với $${P(B)} > 0$. Khi đó $${c(na, B)}$ bằng`, `1 - ${c(A, B)}`, [`1 - ${c(A, nb)}`, `${c(A, nb)}`, `1 - ${c(B, A)}`], "$P(\\overline{A}\\,|\\,B) + P(A\\,|\\,B) = 1$".replace(/A/g, A).replace(/B/g, B)],
      ];
      const [stem, right, wrong, why] = Q[ty];
      return { stem, ...mcq(r, `$${right}$`, wrong.map((w) => `$${w}$`)), explanation: `Theo ${why}: đáp án là $${right}$.` };
    },
  },
  {
    id: "t12k2-xs-dieu-kien-tinh-nhanh", subject: S, grade: G, hk: HK, half: 2, tk: K6, chapter: C6, topic: "Tính xác suất có điều kiện, công thức nhân",
    level: 1, kind: "mcq",
    make: (r) => {
      const [A, B] = r.pick(LETTERS);
      if (r.chance(0.5)) {
        const y = r.pick([0.2, 0.4, 0.5, 0.6, 0.8]), p = r.pick([0.2, 0.25, 0.4, 0.5, 0.6, 0.75, 0.8]);
        const x = round(y * p, 4); need(round(x, 3) === x);
        const z = r.pick([0.3, 0.4, 0.5, 0.6, 0.7, 0.9]); need(z > x && z !== y);
        const wrong = [round(x / z, 2), round(x * y, 4), round(1 - p, 2), round(y - x, 3), x].filter((w) => w !== p);
        return {
          stem: `Cho hai biến cố $${A}$, $${B}$ có $P(${A}) = ${tex(z)}$, $P(${B}) = ${tex(y)}$ và $P(${A}\\cap ${B}) = ${tex(x, 3)}$. Xác suất $P(${A}\\,|\\,${B})$ bằng`,
          ...mcq(r, `$${tex(p)}$`, wrong.map((w) => `$${tex(w, 4)}$`)),
          explanation: `$P(${A}\\,|\\,${B}) = \\dfrac{P(${A}\\cap ${B})}{P(${B})} = \\dfrac{${tex(x, 3)}}{${tex(y)}} = ${tex(p)}$.`,
        };
      }
      const y = r.pick([0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]), p = r.pick([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]);
      const x = round(y * p, 4);
      const wrong = [round(y * (1 - p), 4), round(1 - x, 4), round((1 - y) * p, 4), p, y].filter((w) => w !== x);
      return {
        stem: `Cho hai biến cố $${A}$, $${B}$ có $P(${A}) = ${tex(y)}$ và $P(${B}\\,|\\,${A}) = ${tex(p)}$. Xác suất $P(${A}\\cap ${B})$ bằng`,
        ...mcq(r, `$${tex(x, 4)}$`, wrong.map((w) => `$${tex(w, 4)}$`)),
        explanation: `Theo công thức nhân: $P(${A}\\cap ${B}) = P(${A})\\cdot P(${B}\\,|\\,${A}) = ${tex(y)}\\cdot ${tex(p)} = ${tex(x, 4)}$.`,
      };
    },
  },
  {
    id: "t12k2-xs-dieu-kien-bang", subject: S, grade: G, hk: HK, half: 2, tk: K6, chapter: C6, topic: "Xác suất có điều kiện từ bảng số liệu",
    level: 2, kind: "mcq",
    make: (r) => {
      const ctx = r.pick(TABLE_CTX), a = r.int(5, 25), b = r.int(5, 25), c = r.int(5, 25), d = r.int(5, 25), N = a + b + c + d;
      const M = [[a, b], [c, d]], i = r.int(0, 1), j = r.int(0, 1);
      const row = M[i][0] + M[i][1], col = M[0][j] + M[1][j], cell = M[i][j];
      const byRow = r.chance(0.5);
      const right = byRow ? frac(cell, row) : frac(cell, col);
      const wrong = [byRow ? frac(cell, col) : frac(cell, row), frac(cell, N), byRow ? frac(col, N) : frac(row, N), byRow ? frac(M[1 - i][j], M[1 - i][0] + M[1 - i][1]) : frac(M[i][1 - j], M[0][1 - j] + M[1][1 - j])];
      const q = byRow ? `${ctx.c[j]}, biết rằng người đó ${ctx.r[i]}` : `${ctx.r[i]}, biết rằng người đó ${ctx.c[j]}`;
      return {
        stem: `Kết quả khảo sát ${N} ${ctx.who} được cho trong bảng sau:\n${cases2(a, b, c, d, ctx.R, ctx.C)}\nChọn ngẫu nhiên một ${ctx.unit}. Xác suất để người đó ${q} là`,
        ...mcq(r, `$${right}$`, wrong.map((w) => `$${w}$`)),
        explanation: byRow
          ? `Trong ${row} ${ctx.unit} ${ctx.r[i]} có ${cell} ${ctx.unit} ${ctx.c[j]}, nên xác suất cần tìm là $\\dfrac{${cell}}{${row}} = ${right}$.`
          : `Trong ${col} ${ctx.unit} ${ctx.c[j]} có ${cell} ${ctx.unit} ${ctx.r[i]}, nên xác suất cần tìm là $\\dfrac{${cell}}{${col}} = ${right}$.`,
      };
    },
  },
  {
    id: "t12k2-xs-toan-phan-san-pham", subject: S, grade: G, hk: HK, half: 2, tk: K6, chapter: C6, topic: "Công thức xác suất toàn phần",
    level: 2, kind: "mcq",
    make: (r) => {
      const { c, k, p, q, tot, desc } = supply(r);
      const P = tot / 10000;
      const mean = q.reduce((s, x) => s + x, 0) / k / 100, sum = q.reduce((s, x) => s + x, 0) / 100;
      const wrong = [round(mean, 4), round(sum, 4), round((p[0] * q[0]) / 10000, 4), round(1 - P, 4), round(Math.max(...q) / 100, 4)].filter((w) => w !== round(P, 4));
      return {
        stem: `${desc} Chọn ngẫu nhiên một ${c.it}. Xác suất để ${c.it} đó ${c.bad} là`,
        ...mcq(r, `$${tex(P, 4)}$`, wrong.map((w) => `$${tex(w, 4)}$`)),
        explanation: `Gọi $B$ là biến cố "${c.it} ${c.bad}"; ${c.src.slice(0, k).map((_, i) => `$A_${i + 1}$`).join(", ")} lần lượt là biến cố "${c.it} đến từ ${c.src.slice(0, k).join(", ")}". Theo công thức xác suất toàn phần: $P(B) = ${p.map((x, i) => `${tex(x / 100)}\\cdot ${tex(q[i] / 100)}`).join(" + ")} = ${tex(P, 4)}$.`,
      };
    },
  },
  {
    id: "t12k2-xs-bayes-san-pham", subject: S, grade: G, hk: HK, half: 2, tk: K6, chapter: C6, topic: "Công thức Bayes",
    level: 3, kind: "mcq",
    make: (r) => {
      const { c, k, p, q, tot, desc } = supply(r);
      const i = r.int(0, k - 1), j = (i + 1) % k;
      const right = frac(p[i] * q[i], tot);
      const wrong = [frac(p[i] * q[i], 10000), frac(q[i], 100), frac(p[i], 100), frac(p[j] * q[j], tot), frac(q[i], q.reduce((s, x) => s + x, 0))];
      return {
        stem: `${desc} Chọn ngẫu nhiên một ${c.it} thì thấy ${c.it} đó ${c.bad}. Xác suất để ${c.it} đó do ${c.src[i]} sản xuất (cung cấp) là`,
        ...mcq(r, `$${right}$`, wrong.map((w) => `$${w}$`)),
        explanation: `Gọi $B$: "${c.it} ${c.bad}", $A_${i + 1}$: "${c.it} đến từ ${c.src[i]}". Xác suất toàn phần $P(B) = ${p.map((x, t) => `${tex(x / 100)}\\cdot ${tex(q[t] / 100)}`).join(" + ")} = ${tex(tot / 10000, 4)}$. Theo công thức Bayes: $P(A_${i + 1}\\,|\\,B) = \\dfrac{${tex(p[i] / 100)}\\cdot ${tex(q[i] / 100)}}{${tex(tot / 10000, 4)}} = ${right}$.`,
      };
    },
  },

  /* ---------- Đúng/Sai ---------- */
  {
    id: "t12k2-tf-xs-bang-doc-lap", subject: S, grade: G, hk: HK, half: 2, tk: K6, chapter: C6, topic: "Bảng số liệu: xác suất có điều kiện và tính độc lập",
    level: 1, kind: "tf",
    make: (r) => {
      const ctx = r.pick(TABLE_CTX);
      let a: number, b: number, c: number, d: number;
      if (r.chance(0.35)) { const x = r.int(1, 4), y = r.int(1, 4), u = r.int(2, 6), v = r.int(2, 6); a = x * u; b = y * u; c = x * v; d = y * v; need(a + b + c + d >= 20); }
      else { a = r.int(5, 25); b = r.int(5, 25); c = r.int(5, 25); d = r.int(5, 25); }
      const N = a + b + c + d, R0 = a + b, C0 = a + c;
      const indep = a * N === R0 * C0;
      const s1 = r.chance(0.5), s2 = r.chance(0.5), s3 = r.chance(0.5);
      const v1 = s1 ? frac(R0, N) : frac(a, N);
      const v2 = s2 ? frac(a, R0) : frac(a, C0);
      const v3 = s3 ? frac(c, C0) : frac(c, c + d);
      need((s1 || frac(R0, N) !== frac(a, N)) && (s2 || frac(a, R0) !== frac(a, C0)) && (s3 || frac(c, C0) !== frac(c, c + d)));
      const sayIndep = r.chance(0.5);
      return {
        stem: `Kết quả khảo sát ${N} ${ctx.who} được cho trong bảng sau:\n${cases2(a, b, c, d, ctx.R, ctx.C)}\nChọn ngẫu nhiên một ${ctx.unit}. Gọi $A$ là biến cố "người đó ${ctx.r[0]}", $B$ là biến cố "người đó ${ctx.c[0]}".`,
        ...tf([
          [`$P(A) = ${v1}$.`, s1],
          [`$P(B\\,|\\,A) = ${v2}$.`, s2],
          [`$P(\\overline{A}\\,|\\,B) = ${v3}$.`, s3],
          [`Hai biến cố $A$ và $B$ ${sayIndep ? "độc lập" : "không độc lập"}.`, sayIndep === indep],
        ]),
        explanation: `a) ${tick(s1)}: $P(A) = \\dfrac{${R0}}{${N}}${frac(R0, N) === `\\dfrac{${R0}}{${N}}` ? "" : ` = ${frac(R0, N)}`}$. b) ${tick(s2)}: trong ${R0} người ${ctx.r[0]} có ${a} người ${ctx.c[0]}, $P(B\\,|\\,A) = ${frac(a, R0)}$. c) ${tick(s3)}: trong ${C0} người ${ctx.c[0]} có ${c} người ${ctx.r[1]}, $P(\\overline{A}\\,|\\,B) = ${frac(c, C0)}$. d) ${tick(sayIndep === indep)}: $P(B\\,|\\,A) = ${frac(a, R0)}$, $P(B) = ${frac(C0, N)}$; ${indep ? "hai giá trị bằng nhau nên $A$, $B$ độc lập" : "hai giá trị khác nhau nên $A$, $B$ không độc lập"}.`,
      };
    },
  },
  {
    id: "t12k2-tf-xs-hai-hop-bayes", subject: S, grade: G, hk: HK, half: 2, tk: K6, chapter: C6, topic: "Chọn hộp rồi lấy bóng: xác suất toàn phần và Bayes",
    level: 3, kind: "tf",
    make: (r) => {
      const a = r.int(2, 8), b = r.int(2, 8), c = r.int(2, 8), d = r.int(2, 8);
      need(a * (c + d) !== c * (a + b));
      const coin = r.chance(0.5);
      const p1: Q = coin ? [1, 2] : [1, 3], p2 = Qs([1, 1], p1);
      const r1 = Qn(a, a + b), r2 = Qn(c, c + d);
      const PR = Qa(Qm(p1, r1), Qm(p2, r2)), B1 = Qn(Qm(p1, r1)[0] * PR[1], Qm(p1, r1)[1] * PR[0]);
      const s1 = r.chance(0.5), s2 = r.chance(0.5), s3 = r.chance(0.5);
      const w2 = Qa(r1, r2).map((x, i) => (i === 1 ? x * 2 : x)) as Q;
      const w2n = Qn(w2[0], w2[1]);
      need(s2 || Qt(w2n) !== Qt(PR));
      const v1 = s1 ? Qt(r1) : frac(a, a + b + c + d);
      need(s1 || v1 !== Qt(r1));
      const v3 = s3 ? Qt(B1) : Qt(Qm(p1, r1)); need(s3 || v3 !== Qt(B1));
      const more = Qv(B1) > 0.5, say = r.chance(0.5);
      need(Qv(B1) !== 0.5);
      const rule = coin ? "Tung một đồng xu cân đối: nếu được mặt sấp thì chọn hộp I, mặt ngửa thì chọn hộp II" : "Gieo một con xúc xắc cân đối: nếu số chấm xuất hiện chia hết cho 3 thì chọn hộp I, ngược lại chọn hộp II";
      return {
        stem: `Hộp I có $${a}$ quả bóng đỏ và $${b}$ quả bóng xanh; hộp II có $${c}$ quả bóng đỏ và $${d}$ quả bóng xanh (các quả bóng cùng kích thước). ${rule}; sau đó lấy ngẫu nhiên một quả bóng từ hộp đã chọn.`,
        ...tf([
          [`Xác suất lấy được bóng đỏ, biết rằng đã chọn hộp I, bằng $${v1}$.`, s1],
          [`Xác suất lấy được bóng đỏ bằng $${s2 ? Qt(PR) : Qt(w2n)}$.`, s2],
          [`Biết quả bóng lấy ra màu đỏ, xác suất để nó thuộc hộp I bằng $${v3}$.`, s3],
          [`Biết quả bóng lấy ra màu đỏ, khả năng nó thuộc hộp I ${say ? "lớn hơn" : "nhỏ hơn"} khả năng nó thuộc hộp II.`, say === more],
        ]),
        explanation: `Gọi $H$: "chọn hộp I", $D$: "lấy được bóng đỏ". $P(H) = ${Qt(p1)}$, $P(\\overline{H}) = ${Qt(p2)}$. a) ${tick(s1)}: $P(D\\,|\\,H) = ${Qt(r1)}$. b) ${tick(s2)}: $P(D) = ${Qt(p1)}\\cdot ${Qt(r1)} + ${Qt(p2)}\\cdot ${Qt(r2)} = ${Qt(PR)}$. c) ${tick(s3)}: $P(H\\,|\\,D) = \\dfrac{${Qt(p1)}\\cdot ${Qt(r1)}}{${Qt(PR)}} = ${Qt(B1)}$. d) ${tick(say === more)}: $P(H\\,|\\,D) = ${Qt(B1)} ${more ? ">" : "<"} \\dfrac{1}{2}$ nên khả năng thuộc hộp I ${more ? "lớn hơn" : "nhỏ hơn"}.`,
      };
    },
  },

  /* ---------- Trả lời ngắn ---------- */
  {
    id: "t12k2-sh-bayes-xet-nghiem", subject: S, grade: G, hk: HK, half: 2, tk: K6, chapter: C6, topic: "Công thức Bayes: xét nghiệm y tế",
    level: 3, kind: "short",
    make: (r) => {
      const p = r.pick([1, 2, 3, 4, 5, 8, 10]), s = r.pick([90, 92, 95, 98, 99]), f = r.pick([1, 2, 3, 5, 8, 10]);
      const askNeg = r.chance(0.25);
      const dis = r.pick(["một loại bệnh", "một bệnh truyền nhiễm", "bệnh tiểu đường", "một loại virus"]);
      let ans: number, ex: string;
      if (!askNeg) {
        ans = (p * s) / (p * s + (100 - p) * f);
        ex = `Gọi $A$: "người đó mắc bệnh", $B$: "kết quả dương tính". $P(A) = ${tex(p / 100)}$, $P(B\\,|\\,A) = ${tex(s / 100)}$, $P(B\\,|\\,\\overline{A}) = ${tex(f / 100)}$. $P(B) = ${tex(p / 100)}\\cdot ${tex(s / 100)} + ${tex(1 - p / 100)}\\cdot ${tex(f / 100)} = ${tex((p * s + (100 - p) * f) / 10000, 4)}$. Theo công thức Bayes: $P(A\\,|\\,B) = \\dfrac{${tex((p * s) / 10000, 4)}}{${tex((p * s + (100 - p) * f) / 10000, 4)}} \\approx ${tex(ans, 2)}$.`;
      } else {
        ans = ((100 - p) * (100 - f)) / ((100 - p) * (100 - f) + p * (100 - s));
        ex = `Gọi $A$: "người đó mắc bệnh", $B$: "kết quả dương tính". $P(\\overline{B}) = ${tex(p / 100)}\\cdot ${tex(1 - s / 100)} + ${tex(1 - p / 100)}\\cdot ${tex(1 - f / 100)}$. $P(\\overline{A}\\,|\\,\\overline{B}) = \\dfrac{${tex(1 - p / 100)}\\cdot ${tex(1 - f / 100)}}{P(\\overline{B})} \\approx ${tex(ans, 2)}$.`;
      }
      need(ans < 0.995);
      return {
        stem: `Tỉ lệ người mắc ${dis} trong một cộng đồng là $${p}\\%$. Một phương pháp xét nghiệm cho kết quả dương tính với $${s}\\%$ người mắc bệnh và cho kết quả dương tính (nhầm) với $${f}\\%$ người không mắc bệnh. Chọn ngẫu nhiên một người trong cộng đồng đi xét nghiệm và nhận kết quả ${askNeg ? "âm tính" : "dương tính"}. Tính xác suất người đó ${askNeg ? "thực sự không mắc bệnh" : "thực sự mắc bệnh"} (làm tròn kết quả đến hàng phần trăm).`,
        ...short(ans, 2),
        explanation: ex,
      };
    },
  },
  {
    id: "t12k2-sh-xs-dieu-kien-rut-bong", subject: S, grade: G, hk: HK, half: 2, tk: K6, chapter: C6, topic: "Xác suất có điều kiện: lấy bóng không hoàn lại",
    level: 2, kind: "short",
    make: (r) => {
      const a = r.int(3, 9), b = r.int(3, 9), n = a + b, ty = r.int(0, 2);
      const C2 = (x: number) => (x * (x - 1)) / 2;
      let ans: number, q: string, ex: string;
      if (ty === 0) { ans = (a - 1) / (n - 1); q = `Tính xác suất để lần thứ hai lấy được bóng đỏ, biết rằng lần thứ nhất lấy được bóng đỏ`; ex = `Sau khi lấy ra 1 bóng đỏ, hộp còn $${n - 1}$ quả, trong đó $${a - 1}$ quả đỏ. Xác suất cần tìm là $${frac(a - 1, n - 1)} \\approx ${tex(ans, 2)}$.`; }
      else if (ty === 1) { ans = b / (n - 1); q = `Tính xác suất để lần thứ hai lấy được bóng xanh, biết rằng lần thứ nhất lấy được bóng đỏ`; ex = `Sau khi lấy ra 1 bóng đỏ, hộp còn $${n - 1}$ quả, trong đó $${b}$ quả xanh. Xác suất cần tìm là $${frac(b, n - 1)} \\approx ${tex(ans, 2)}$.`; }
      else {
        ans = C2(a) / (C2(n) - C2(b));
        q = `Tính xác suất để cả hai quả đều màu đỏ, biết rằng có ít nhất một quả màu đỏ`;
        ex = `Gọi $A$: "cả hai quả đỏ", $B$: "có ít nhất một quả đỏ"; $A \\subset B$. $P(A) = \\dfrac{C_{${a}}^2}{C_{${n}}^2} = \\dfrac{${C2(a)}}{${C2(n)}}$, $P(B) = 1 - \\dfrac{C_{${b}}^2}{C_{${n}}^2} = \\dfrac{${C2(n) - C2(b)}}{${C2(n)}}$. $P(A\\,|\\,B) = \\dfrac{P(A)}{P(B)} = ${frac(C2(a), C2(n) - C2(b))} \\approx ${tex(ans, 2)}$.`;
      }
      return {
        stem: `Một hộp có $${a}$ quả bóng đỏ và $${b}$ quả bóng xanh, các quả bóng có cùng kích thước và khối lượng. Lấy ngẫu nhiên lần lượt ${ty === 2 ? "" : "và không hoàn lại "}hai quả bóng${ty === 2 ? " (không hoàn lại)" : ""}. ${q} (làm tròn kết quả đến hàng phần trăm).`,
        ...short(ans, 2),
        explanation: ex,
      };
    },
  },
  {
    id: "t12k2-sh-xs-toan-phan-chuyen-bong", subject: S, grade: G, hk: HK, half: 2, tk: K6, chapter: C6, topic: "Công thức xác suất toàn phần: chuyển bóng giữa hai hộp",
    level: 3, kind: "short",
    make: (r) => {
      const a = r.int(2, 7), b = r.int(2, 7), c = r.int(2, 7), d = r.int(2, 7), m = c + d + 1;
      const askRed = r.chance(0.5);
      const num = askRed ? a * (c + 1) + b * c : a * d + b * (d + 1), den = (a + b) * m, ans = num / den;
      const col = askRed ? "đỏ" : "xanh";
      return {
        stem: `Hộp thứ nhất có $${a}$ quả bóng đỏ và $${b}$ quả bóng xanh; hộp thứ hai có $${c}$ quả bóng đỏ và $${d}$ quả bóng xanh. Lấy ngẫu nhiên một quả bóng từ hộp thứ nhất bỏ sang hộp thứ hai, rồi lấy ngẫu nhiên một quả bóng từ hộp thứ hai. Tính xác suất để quả bóng lấy ra từ hộp thứ hai có màu ${col} (làm tròn kết quả đến hàng phần trăm).`,
        ...short(ans, 2),
        explanation: `Gọi $A$: "bóng chuyển sang màu đỏ", $B$: "bóng lấy ra từ hộp thứ hai màu ${col}". $P(A) = \\dfrac{${a}}{${a + b}}$, $P(\\overline{A}) = \\dfrac{${b}}{${a + b}}$. Sau khi chuyển, hộp thứ hai có $${m}$ quả: $P(B\\,|\\,A) = \\dfrac{${askRed ? c + 1 : d}}{${m}}$, $P(B\\,|\\,\\overline{A}) = \\dfrac{${askRed ? c : d + 1}}{${m}}$. Theo công thức xác suất toàn phần: $P(B) = \\dfrac{${a}\\cdot ${askRed ? c + 1 : d} + ${b}\\cdot ${askRed ? c : d + 1}}{${a + b}\\cdot ${m}} = ${frac(num, den)} \\approx ${tex(ans, 2)}$.`,
      };
    },
  },
];

export const TEMPLATES: Template[] = [...H1, ...H2a, ...H2b];
export default TEMPLATES;
