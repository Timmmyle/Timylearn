import { mcq, tf, short, frac, tex, vn, need, gcd, round, poly, term, coef, type Template, type Rng } from "./core.ts";

/* Toán 11 – Học kì 2 (Kết nối tri thức) */
const S = "Toán", G = 11 as const;
const C6 = "Chương VI. Hàm số mũ và hàm số logarit";
const C7 = "Chương VII. Quan hệ vuông góc trong không gian";
const C8 = "Chương VIII. Các quy tắc tính xác suất";
const C9 = "Chương IX. Đạo hàm";
const b6 = { subject: S, grade: G, hk: 2, half: 1, chapter: C6, tk: "Toán|Mũ – logarit" } as const;
const b7 = { subject: S, grade: G, hk: 2, half: 1, chapter: C7, tk: "Toán|Quan hệ vuông góc – thể tích" } as const;
const b8 = { subject: S, grade: G, hk: 2, half: 2, chapter: C8, tk: "Toán|Quy tắc tính xác suất" } as const;
const b9 = { subject: S, grade: G, hk: 2, half: 2, chapter: C9, tk: "Toán|Đạo hàm" } as const;

/* ---------------- tiện ích riêng ---------------- */
const $ = (s: string) => `$${s}$`;
const num = (x: number, dp = 2) => $(tex(x, dp));
const pickN = <T,>(r: Rng, a: readonly T[], k: number): T[] => r.shuffle([...a]).slice(0, k);
const par = (x: number) => (x < 0 ? `(${x})` : String(x));
/** phân số nhỏ \frac (dùng trong số mũ, chỉ số) */
function fs(p: number, q: number): string {
  need(q !== 0);
  const g = gcd(p, q); p /= g; q /= g; if (q < 0) { p = -p; q = -q; }
  return q === 1 ? String(p) : `${p < 0 ? "-" : ""}\\frac{${Math.abs(p)}}{${q}}`;
}
/** frac an toàn: mẫu 0 → "" (để lọc khỏi phương án nhiễu) */
const sf = (p: number, q: number) => (q === 0 ? "" : frac(p, q));
const pw = (v: string, e: string) => (e === "0" ? "1" : e === "1" ? v : `${v}^{${e}}`);
const deg = (d: number) => $(`${d}^\\circ`);
const INF = "+\\infty", NINF = "-\\infty";
/** khoảng: lo/hi = null là vô cực; lc/rc = đầu mút đóng */
const ivT = (lo: string | number | null, hi: string | number | null, lc = false, rc = false) =>
  `${lo === null ? "(" + NINF : (lc ? "[" : "(") + lo};${hi === null ? INF + ")" : hi + (rc ? "]" : ")")}`;
const setT = (a: number[]) => (a.length ? `\\{${a.join(";")}\\}` : "\\varnothing");
/** p√k/q rút gọn */
function surd(p: number, k: number, q: number): string {
  const g = gcd(p, q); p /= g; q /= g; if (q < 0) { p = -p; q = -q; }
  const s = p < 0 ? "-" : "", a = Math.abs(p), top = `${a === 1 ? "" : a}\\sqrt{${k}}`;
  return q === 1 ? s + top : `${s}\\dfrac{${top}}{${q}}`;
}
/** đạo hàm, giá trị của đa thức (hệ số bậc cao → thấp) */
const der = (cs: number[]) => cs.slice(0, -1).map((c, i) => c * (cs.length - 1 - i));
const ev = (cs: number[], x: number) => cs.reduce((s, c) => s * x + c, 0);
const P4 = (x: number) => tex(x, 4);
const isPrime = (n: number) => { if (n < 2) return false; for (let k = 2; k * k <= n; k++) if (n % k === 0) return false; return true; };
const wrapB = (b: string) => (/^[0-9a-z]+$|^\\pi$/.test(b) ? b : `\\left(${b}\\right)`);
/** "=" nếu x đúng bằng giá trị làm tròn, ngược lại "≈" */
const ap = (x: number, dp: number) => (Math.abs(round(x, dp) - x) < 1e-9 ? "=" : "\\approx");
const sgnOp = (gt: boolean, st: boolean) => (gt ? (st ? ">" : "\\ge") : st ? "<" : "\\le");

export const TEMPLATES: Template[] = [
  /* =================================================================== HALF 1 – MCQ – Chương VI */
  {
    id: "t11k2-luy-thua-rut-gon", ...b6, topic: "Lũy thừa với số mũ hữu tỉ, số mũ thực – rút gọn", level: 1, kind: "mcq",
    make: (r) => {
      const v = r.pick(["x", "a", "b"]);
      if (r.chance(0.6)) {
        const n = r.pick([2, 3, 4, 5, 6]), m = r.int(1, 7), k = r.pick([2, 3, 4]), mul = r.chance(0.5);
        need(gcd(m, n) === 1);
        const rt = k === 2 ? `\\sqrt{${v}}` : `\\sqrt[${k}]{${v}}`;
        const E = mul ? m * k + n : m * k - n;
        need(E !== 0);
        const P = mul ? `${pw(v, fs(m, n))}\\cdot ${rt}` : `\\dfrac{${pw(v, fs(m, n))}}{${rt}}`;
        const ans = pw(v, fs(E, n * k));
        const wr = [fs(m, n * k), fs(mul ? m * k - n : m * k + n, n * k), fs(m + (mul ? 1 : -1), n + k), fs(m * k, n), fs(m, n + k)];
        return {
          stem: `Cho $${v} > 0$. Rút gọn biểu thức $P = ${P}$ ta được`,
          ...mcq(r, $(`P = ${ans}`), r.shuffle(wr).map((e) => $(`P = ${pw(v, e)}`))),
          explanation: `Ta có $${rt} = ${pw(v, fs(1, k))}$ nên $P = ${v}^{${fs(m, n)} ${mul ? "+" : "-"} ${fs(1, k)}} = ${ans}$.`,
        };
      }
      const k = r.pick([2, 3, 5, 6, 7]), c = r.pick([1, 2]), s = r.nz(-3, 3);
      need(k !== c * c);
      const E = k - c * c + s, ans = pw(v, String(E));
      const P = `\\left(${v}^{\\sqrt{${k}} - ${c}}\\right)^{\\sqrt{${k}} + ${c}}\\cdot ${pw(v, String(s))}`;
      const wr = [String(k + c * c + s), String(k - c * c - s), String(E + 1), `2\\sqrt{${k}}${term(s)}`, String(k + s)];
      return {
        stem: `Cho $${v} > 0$. Biểu thức $P = ${P}$ được rút gọn thành`,
        ...mcq(r, $(`P = ${ans}`), r.shuffle(wr).map((e) => $(`P = ${pw(v, e)}`))),
        explanation: `$\\left(${v}^{\\sqrt{${k}} - ${c}}\\right)^{\\sqrt{${k}} + ${c}} = ${v}^{(\\sqrt{${k}} - ${c})(\\sqrt{${k}} + ${c})} = ${v}^{${k} - ${c * c}} = ${pw(v, String(k - c * c))}$. Do đó $P = ${v}^{${k - c * c}${term(s)}} = ${ans}$.`,
      };
    },
  },
  {
    id: "t11k2-log-tinh-gia-tri", ...b6, topic: "Tính giá trị biểu thức logarit", level: 1, kind: "mcq",
    make: (r) => {
      const g = r.pick([2, 3, 5]), i = r.pick([1, 1, 2, 3]), sb = r.pick([1, 1, -1]), j = r.int(-3, 6), h = r.pick([1, 1, 2]);
      need(j !== 0 && g ** Math.abs(j) <= 625 && g ** i <= 125 && (h === 1 || j % 2 !== 0));
      const B = g ** i, base = sb > 0 ? String(B) : `\\frac{1}{${B}}`;
      const Nv = g ** Math.abs(j), inner = h === 1 ? String(Nv) : `\\sqrt{${Nv}}`;
      const N = j > 0 ? inner : `\\dfrac{1}{${inner}}`;
      const val = frac(j, h * i * sb);
      const wr = [frac(h * i * sb, j), frac(j * i * sb, h), frac(-j, h * i * sb), frac(j + 1, h * i * sb), frac(j, h * i * sb + 1)];
      return {
        stem: r.pick([`Giá trị của $\\log_{${base}} ${N}$ bằng`, `Giá trị của biểu thức $P = \\log_{${base}} ${N}$ là`]),
        ...mcq(r, $(val), r.shuffle(wr).map($)),
        explanation: `Ta có $${base} = ${g}^{${sb * i}}$ và $${N} = ${g}^{${fs(j, h)}}$. Áp dụng $\\log_{a^{\\alpha}} a^{\\beta} = \\dfrac{\\beta}{\\alpha}$: $\\log_{${base}} ${N} = \\dfrac{1}{${sb * i}}\\cdot ${fs(j, h) === String(j) ? par(j) : `\\left(${fs(j, h)}\\right)`} = ${val}$.`,
      };
    },
  },
  {
    id: "t11k2-log-tinh-chat", ...b6, topic: "Tính chất, quy tắc tính logarit", level: 1, kind: "mcq",
    make: (r) => {
      const K = r.pick(["\\alpha", "2", "3", "5"]), isA = K === "\\alpha";
      const [la, lb, lc] = r.pick([["a", "b", "c"], ["a", "x", "y"], ["a", "m", "n"]]);
      const L = (s: string) => s.replace(/A/g, la).replace(/B/g, lb).replace(/C/g, lc);
      const T = [
        `\\log_A(BC) = \\log_A B + \\log_A C`, `\\log_A\\dfrac{B}{C} = \\log_A B - \\log_A C`, `\\log_A B^{${K}} = ${K}\\log_A B`,
        `\\log_{A^{${K}}} B = \\dfrac{1}{${K}}\\log_A B`, `\\log_A B = \\dfrac{\\log_C B}{\\log_C A}`, `A^{\\log_A B} = B`, `\\log_A\\dfrac{1}{B} = -\\log_A B`,
      ].map(L);
      const F = [
        `\\log_A(BC) = \\log_A B\\cdot\\log_A C`, `\\log_A\\dfrac{B}{C} = \\dfrac{\\log_A B}{\\log_A C}`, `\\log_A(B + C) = \\log_A B + \\log_A C`,
        `\\log_A B^{${K}} = \\dfrac{1}{${K}}\\log_A B`, `\\log_{A^{${K}}} B = ${K}\\log_A B`, `\\log_A B = \\dfrac{\\log_C A}{\\log_C B}`, `\\log_A\\dfrac{1}{B} = \\dfrac{1}{\\log_A B}`,
      ].map(L);
      const askTrue = r.chance(0.5), good = r.pick(askTrue ? T : F), bad = pickN(r, askTrue ? F : T, 3);
      return {
        stem: `Cho ${L("$A, B, C$")} là các số thực dương, ${L("$A\\ne 1$, $C\\ne 1$")}${isA ? " và $\\alpha$ là số thực khác $0$" : ""}. Khẳng định nào sau đây ${askTrue ? "đúng" : "sai"}?`,
        ...mcq(r, $(good), bad.map($)),
        explanation: `Các quy tắc đúng: ${T.slice(0, 6).map($).join("; ")}. Vậy khẳng định ${askTrue ? "đúng" : "sai"} là $${good}$.`,
      };
    },
  },
  {
    id: "t11k2-log-bieu-dien", ...b6, topic: "Biểu diễn logarit theo logarit đã cho", level: 2, kind: "mcq",
    make: (r) => {
      const [p, q] = r.pick([[2, 3], [2, 5], [3, 2], [3, 5], [5, 2], [5, 3], [2, 7]]);
      const m = r.int(0, 3), n = r.pick([1, 2, -1, 3]), k = r.pick([1, 1, 2]);
      const top = p ** m * (n > 0 ? q ** n : 1), bot = n < 0 ? q ** -n : 1;
      need(top <= 1000 && !(m === 0 && n === 1 && k === 1));
      const lin = (A: number, B: number) => (A === 0 ? String(B) : `${coef(A)}a${term(B)}`);
      const ex = (A: number, B: number, kk: number) => (kk === 1 ? lin(A, B) : `\\dfrac{${lin(A, B)}}{${kk}}`);
      const right = ex(n, m, k);
      const wr = [ex(m, n, k), ex(n, m, 3 - k), ex(n, -m, k), ex(n, m + 1, k), ex(-n, m, k)];
      const parts = [m ? pw(String(p), String(m)) : "", pw(String(q), String(n))].filter(Boolean).join("\\cdot ");
      const N = frac(top, bot), bse = p ** k;
      return {
        stem: `Đặt $a = \\log_{${p}} ${q}$. Khi đó $\\log_{${bse}} ${N}$ bằng`,
        ...mcq(r, $(right), r.shuffle(wr).map($)),
        explanation: `Ta có $${N} = ${parts}$ nên $\\log_{${p}} ${N} = ${m ? `${m} + ` : ""}${n === 1 ? "" : n === -1 ? "-" : n}\\log_{${p}} ${q} = ${lin(n, m)}$.${k === 2 ? ` Do đó $\\log_{${bse}} ${N} = \\dfrac{1}{2}\\log_{${p}} ${N} = ${right}$.` : ""}`,
      };
    },
  },
  {
    id: "t11k2-tap-xac-dinh-mu-log", ...b6, topic: "Tập xác định của hàm số lũy thừa, logarit", level: 1, kind: "mcq",
    make: (r) => {
      const c = r.int(-5, 6), mode = r.int(0, 3), L = r.pick(["\\log_{2}", "\\log_{3}", "\\ln", "\\log", "\\log_{\\frac{1}{2}}"]);
      const R = "\\mathbb{R}", Rc = (xs: number[]) => `\\mathbb{R}\\setminus\\{${xs.join(";")}\\}`;
      let y: string, right: string, wrong: string[], ex: string;
      if (mode === 0) {
        const p = r.pick([1, -1, 2, -2, 3, -3]), e = poly([p, -p * c]);
        y = `${L}(${e})`;
        right = p > 0 ? ivT(c, null) : ivT(null, c);
        wrong = [p > 0 ? ivT(c, null, true) : ivT(null, c, false, true), p > 0 ? ivT(null, c) : ivT(c, null), Rc([c]), p > 0 ? ivT(-c, null) : ivT(null, -c)];
        ex = `Hàm số xác định khi $${e} > 0 \\Leftrightarrow x ${p > 0 ? ">" : "<"} ${c}$. Tập xác định $D = ${right}$.`;
      } else if (mode === 1) {
        const r1 = r.int(-4, 3), r2 = r1 + r.int(1, 5), s = r.pick([1, -1]);
        const e = poly([s, -s * (r1 + r2), s * r1 * r2]);
        const out = `(-\\infty;${r1})\\cup(${r2};+\\infty)`, inn = `(${r1};${r2})`;
        y = `${L}\\left(${e}\\right)`;
        right = s > 0 ? out : inn;
        wrong = [s > 0 ? inn : out, `[${r1};${r2}]`, `(-\\infty;${r1}]\\cup[${r2};+\\infty)`, Rc([r1, r2])];
        ex = `Hàm số xác định khi $${e} > 0$. Tam thức có hai nghiệm $${r1}$; $${r2}$ và hệ số của $x^2$ ${s > 0 ? "dương" : "âm"} nên ${s > 0 ? `$x < ${r1}$ hoặc $x > ${r2}$` : `$${r1} < x < ${r2}$`}. Tập xác định $D = ${right}$.`;
      } else {
        const p = r.pick([1, -1, 2]), e = poly([p, -p * c]), bse = e === "x" ? "x" : `(${e})`;
        if (mode === 2) {
          const al = r.pick(["\\sqrt{2}", "\\frac{1}{3}", "\\pi", "-\\frac{2}{5}", "\\sqrt{3}", "\\frac{3}{4}"]);
          y = `${bse}^{${al}}`;
          right = p > 0 ? ivT(c, null) : ivT(null, c);
          wrong = [R, Rc([c]), p > 0 ? ivT(c, null, true) : ivT(null, c, false, true), p > 0 ? ivT(null, c) : ivT(c, null)];
          ex = `Số mũ $${al}$ không phải số nguyên nên hàm số xác định khi cơ số dương: $${e} > 0 \\Leftrightarrow x ${p > 0 ? ">" : "<"} ${c}$.`;
        } else {
          const k = r.int(1, 4);
          y = `${bse}^{-${k}}`;
          right = Rc([c]);
          wrong = [R, ivT(c, null), ivT(c, null, true), ivT(null, c)];
          ex = `Số mũ $-${k}$ là số nguyên âm nên hàm số xác định khi cơ số khác $0$: $${e}\\ne 0 \\Leftrightarrow x\\ne ${c}$. Vậy $D = ${right}$.`;
        }
      }
      return { stem: `Tập xác định của hàm số $y = ${y}$ là`, ...mcq(r, $(right), wrong.map($)), explanation: ex };
    },
  },
  {
    id: "t11k2-ham-mu-log-don-dieu", ...b6, topic: "Tính đơn điệu của hàm số mũ, hàm số logarit", level: 1, kind: "mcq",
    make: (r) => {
      const INC: [string, number][] = [["2", 2], ["3", 3], ["\\sqrt{3}", 1.732], ["\\dfrac{3}{2}", 1.5], ["e", 2.718], ["\\pi", 3.142], ["\\dfrac{\\pi}{3}", 1.047], ["\\sqrt{2}", 1.414], ["\\dfrac{5}{4}", 1.25], ["\\dfrac{e}{2}", 1.359]];
      const DEC: [string, number][] = [["\\dfrac{1}{2}", 0.5], ["\\dfrac{2}{3}", 0.667], ["\\sqrt{2}-1", 0.414], ["\\dfrac{e}{3}", 0.906], ["\\dfrac{\\pi}{4}", 0.785], ["\\dfrac{1}{\\sqrt{3}}", 0.577], ["0{,}7", 0.7], ["\\dfrac{3}{\\pi}", 0.955]];
      const inc = r.chance(0.5), isExp = r.chance(0.5);
      const g = r.pick(inc ? INC : DEC), bad = pickN(r, inc ? DEC : INC, 3);
      const f = (b: string) => (isExp ? `y = ${wrapB(b)}^{x}` : `y = \\log_{${b.replace(/\\dfrac/g, "\\frac")}} x`);
      const approx = Number.isInteger(g[1]) ? "" : ` \\approx ${tex(g[1], 2)}`;
      return {
        stem: `${r.pick(["Hàm số nào sau đây", "Trong các hàm số sau, hàm số nào", "Hàm số nào dưới đây"])} ${inc ? "đồng biến" : "nghịch biến"} trên ${isExp ? r.pick(["$\\mathbb{R}$", "khoảng $(-\\infty;+\\infty)$"]) : "khoảng $(0;+\\infty)$"}?`,
        ...mcq(r, $(f(g[0])), bad.map((b) => $(f(b[0])))),
        explanation: `Hàm số $${isExp ? "y = a^x" : "y = \\log_a x"}$ đồng biến khi $a > 1$ và nghịch biến khi $0 < a < 1$. Ta có $${g[0]}${approx}$ ${inc ? "lớn hơn $1$" : "thuộc khoảng $(0;1)$"}, còn cơ số của ba hàm số còn lại ${inc ? "đều thuộc khoảng $(0;1)$" : "đều lớn hơn $1$"}. Vậy hàm số cần tìm là $${f(g[0])}$.`,
      };
    },
  },
  {
    id: "t11k2-pt-mu-co-ban", ...b6, topic: "Phương trình mũ cơ bản", level: 1, kind: "mcq",
    make: (r) => {
      const g = r.pick([2, 3, 5]);
      let eq: string, x: string, wr: string[], ex: string;
      if (r.chance(0.55)) {
        const p = r.pick([1, 2, 3, -1]), q = r.int(-4, 4), k = r.int(-2, 4);
        need(g ** Math.abs(k) <= 625 && k !== q);
        const R = k >= 0 ? String(g ** k) : `\\dfrac{1}{${g ** -k}}`;
        x = frac(k - q, p);
        eq = `${g}^{${poly([p, q])}} = ${R}`;
        wr = [sf(k + q, p), sf(q - k, p), k >= 0 ? sf(g ** k - q, p) : sf(-k - q, p), sf(k - q, p + 1), sf(k, p)];
        ex = `Ta có $${R} = ${g}^{${k}}$ nên phương trình $\\Leftrightarrow ${poly([p, q])} = ${k} \\Leftrightarrow x = ${x}$.`;
      } else {
        const m = r.pick([2, 3]), p = r.pick([1, 2, 3, 4]), q = r.int(-4, 4), s = r.nz(-3, 3);
        need(p !== m && g ** m <= 125);
        x = frac(m * s - q, p - m);
        eq = `${g}^{${poly([p, q])}} = ${g ** m}^{${poly([1, s])}}`;
        wr = [sf(s - q, p - 1), sf(m * s - q, m - p), sf(m * s - q, p + m), sf(s - q, p - m), sf(m * s + q, p - m)];
        ex = `Ta có $${g ** m} = ${g}^{${m}}$ nên phương trình $\\Leftrightarrow ${g}^{${poly([p, q])}} = ${g}^{${poly([m, m * s])}} \\Leftrightarrow ${poly([p, q])} = ${poly([m, m * s])} \\Leftrightarrow x = ${x}$.`;
      }
      return {
        stem: r.pick([`Nghiệm của phương trình $${eq}$ là`, `Phương trình $${eq}$ có nghiệm là`]),
        ...mcq(r, $(`x = ${x}`), r.shuffle(wr.filter(Boolean)).map((w) => $(`x = ${w}`))),
        explanation: ex,
      };
    },
  },
  {
    id: "t11k2-pt-log-co-ban", ...b6, topic: "Phương trình logarit cơ bản", level: 2, kind: "mcq",
    make: (r) => {
      const g = r.pick([2, 3, 5]);
      if (r.chance(0.5)) {
        const k = r.int(1, 3), p = r.pick([1, 2, 3, -1]), q = r.int(-5, 5);
        need(g ** k <= 125);
        const x = frac(g ** k - q, p), e = poly([p, q]);
        const wr = [sf(k - q, p), sf(g * k - q, p), sf(g ** k + q, p), sf(k ** g - q, p), sf(g ** k - q, -p)];
        return {
          stem: r.pick([`Nghiệm của phương trình $\\log_{${g}}(${e}) = ${k}$ là`, `Phương trình $\\log_{${g}}(${e}) = ${k}$ có nghiệm là`]),
          ...mcq(r, $(`x = ${x}`), r.shuffle(wr.filter(Boolean)).map((w) => $(`x = ${w}`))),
          explanation: `Điều kiện: $${e} > 0$. Phương trình $\\Leftrightarrow ${e} = ${g}^{${k}} = ${g ** k} \\Leftrightarrow x = ${x}$ (thỏa mãn điều kiện vì khi đó $${e} = ${g ** k} > 0$).`,
        };
      }
      const [p, s] = pickN(r, [1, 2, 3, -1, -2], 2), x0 = r.int(-4, 5), ok = r.chance(0.5);
      const v = ok ? r.int(1, 8) : r.int(-6, 0), q = v - p * x0, t = v - s * x0;
      const e1 = poly([p, q]), e2 = poly([s, t]);
      const V0 = "Phương trình vô nghiệm.", Vx = (z: string) => `Phương trình có nghiệm duy nhất $x = ${z}$.`, V2 = "Phương trình có hai nghiệm phân biệt.";
      const right = ok ? Vx(String(x0)) : V0;
      const wr = ok ? [V0, Vx(String(-x0)), V2, Vx(String(x0 + 1))] : [Vx(String(x0)), Vx(sf(t + q, p - s) || "0"), V2, Vx(String(-x0))];
      return {
        stem: `Khẳng định nào sau đây đúng về phương trình $\\log_{${g}}(${e1}) = \\log_{${g}}(${e2})$?`,
        ...mcq(r, right, wr),
        explanation: `Điều kiện: $${e1} > 0$ và $${e2} > 0$. Khi đó phương trình $\\Leftrightarrow ${e1} = ${e2} \\Leftrightarrow x = ${x0}$. Với $x = ${x0}$ thì $${e1} = ${v}$ ${ok ? "$> 0$, thỏa mãn điều kiện. Vậy phương trình có nghiệm duy nhất $x = " + x0 + "$." : "$\\le 0$, không thỏa mãn điều kiện. Vậy phương trình vô nghiệm."}`,
      };
    },
  },
  {
    id: "t11k2-bpt-mu-log", ...b6, topic: "Bất phương trình mũ, logarit cơ bản", level: 2, kind: "mcq",
    make: (r) => {
      const [bn, bd] = r.pick([[2, 1], [3, 1], [1, 2], [1, 3], [5, 1]]), big = bn > bd;
      const bT = bd === 1 ? String(bn) : `\\frac{${bn}}{${bd}}`;
      const op = r.pick([{ t: ">", gt: true, st: true }, { t: "<", gt: false, st: true }, { t: "\\ge", gt: true, st: false }, { t: "\\le", gt: false, st: false }]);
      const powR = (k: number): [number, number] => (k >= 0 ? [bn ** k, bd ** k] : [bd ** -k, bn ** -k]);
      const ivDir = (c: string | number, gt: boolean, st: boolean) => (gt ? ivT(c, null, !st) : ivT(null, c, false, !st));
      const gt = big ? op.gt : !op.gt, why = big ? "cơ số lớn hơn $1$ nên giữ nguyên chiều bất phương trình" : "cơ số thuộc khoảng $(0;1)$ nên đổi chiều bất phương trình";
      let stem: string, right: string, wrong: string[], ex: string;
      if (r.chance(0.5)) {
        const s = r.int(-3, 3), k = r.int(-2, 3), [a1, a2] = powR(k);
        need(a1 <= 243 && a2 <= 243);
        const c = k - s;
        stem = `${wrapB(bT)}^{${poly([1, s])}} ${op.t} ${frac(a1, a2)}`;
        right = ivDir(c, gt, op.st);
        wrong = [ivDir(c, !gt, op.st), ivDir(c, gt, !op.st), ivDir(k + s, gt, op.st), ivDir(c, !gt, !op.st)];
        ex = `Ta có $${frac(a1, a2)} = ${wrapB(bT)}^{${k}}$; ${why}: $${poly([1, s])} ${sgnOp(gt, op.st)} ${k} \\Leftrightarrow x ${sgnOp(gt, op.st)} ${c}$. Tập nghiệm $S = ${right}$.`;
      } else {
        const c0 = r.int(-3, 4), k = r.pick([-1, 1, 2, 3]), [a1, a2] = powR(k);
        need(a1 <= 27);
        const E = frac(c0 * a2 + a1, a2), x = poly([1, -c0]);
        const dom = (rc: boolean) => `(${c0};${E}${rc ? "]" : ")"}`;
        stem = `\\log_{${bT}}(${x}) ${op.t} ${k}`;
        right = gt ? ivT(E, null, !op.st) : dom(!op.st);
        wrong = gt ? [ivT(null, E, false, !op.st), dom(!op.st), ivT(E, null, op.st), ivT(c0, null)] : [ivT(null, E, false, !op.st), ivT(E, null, !op.st), dom(op.st), ivT(c0, null)];
        ex = `Điều kiện: $x > ${c0}$. Ta có $${k} = \\log_{${bT}} ${frac(a1, a2)}$; ${why}: $${x} ${sgnOp(gt, op.st)} ${frac(a1, a2)} \\Leftrightarrow x ${sgnOp(gt, op.st)} ${E}$. Kết hợp điều kiện, tập nghiệm $S = ${right}$.`;
      }
      return { stem: `Tập nghiệm của bất phương trình $${stem}$ là`, ...mcq(r, $(right), wrong.map($)), explanation: ex };
    },
  },

  /* =================================================================== HALF 1 – MCQ – Chương VII */
  {
    id: "t11k2-goc-hai-duong-thang", ...b7, topic: "Góc giữa hai đường thẳng", level: 2, kind: "mcq",
    make: (r) => {
      const cu = "Cho hình lập phương $ABCD.A'B'C'D'$.", te = "Cho tứ diện đều $ABCD$.", ch = "Cho hình chóp $S.ABCD$ có đáy là hình vuông và tất cả các cạnh đều bằng nhau.";
      const D: [string, string, string, number, string][] = [
        [cu, "AB", "B'C'", 90, "Vì $B'C'\\parallel BC$ nên góc cần tìm bằng góc giữa $AB$ và $BC$, tức là $\\widehat{ABC} = 90^\\circ$."],
        [cu, "AB", "A'C'", 45, "Vì $A'C'\\parallel AC$ nên góc cần tìm bằng $\\widehat{BAC} = 45^\\circ$ (đường chéo hình vuông tạo với cạnh góc $45^\\circ$)."],
        [cu, "AC", "B'D'", 90, "Vì $B'D'\\parallel BD$ và $AC\\perp BD$ (hai đường chéo hình vuông) nên góc cần tìm bằng $90^\\circ$."],
        [cu, "AB'", "BC'", 60, "Vì $BC'\\parallel AD'$ nên góc cần tìm bằng $\\widehat{B'AD'}$. Tam giác $AB'D'$ có ba cạnh là đường chéo của ba hình vuông bằng nhau nên đều, suy ra góc bằng $60^\\circ$."],
        [cu, "AC", "B'C", 60, "Tam giác $ACB'$ có ba cạnh là đường chéo của ba mặt hình vuông bằng nhau nên là tam giác đều; góc cần tìm bằng $\\widehat{ACB'} = 60^\\circ$."],
        [cu, "AA'", "BD", 90, "$AA'\\perp (ABCD)$ mà $BD\\subset (ABCD)$ nên $AA'\\perp BD$, góc bằng $90^\\circ$."],
        [cu, "AB'", "CD'", 90, "Vì $CD'\\parallel BA'$ và $AB'\\perp A'B$ (hai đường chéo của hình vuông $ABB'A'$) nên góc bằng $90^\\circ$."],
        [cu, "AD'", "BD", 60, "Vì $AD'\\parallel BC'$ nên góc cần tìm bằng $\\widehat{DBC'}$; tam giác $BC'D$ đều nên góc bằng $60^\\circ$."],
        [cu, "AC'", "BD", 90, "$BD\\perp AC$ và $BD\\perp AA'$ nên $BD\\perp (ACC'A')$, suy ra $BD\\perp AC'$; góc bằng $90^\\circ$."],
        [cu, "A'D", "AB", 90, "$AB\\perp AD$ và $AB\\perp AA'$ nên $AB\\perp (ADD'A')$, suy ra $AB\\perp A'D$; góc bằng $90^\\circ$."],
        [cu, "AC", "DC'", 60, "Vì $DC'\\parallel AB'$ nên góc cần tìm bằng $\\widehat{CAB'}$; tam giác $AB'C$ đều nên góc bằng $60^\\circ$."],
        [te, "AB", "CD", 90, "Gọi $M$ là trung điểm của $CD$. Hai tam giác $ACD$, $BCD$ đều nên $CD\\perp AM$, $CD\\perp BM$, suy ra $CD\\perp (ABM)$, do đó $CD\\perp AB$; góc bằng $90^\\circ$."],
        [ch, "SA", "BC", 60, "Vì $BC\\parallel AD$ nên góc cần tìm bằng $\\widehat{SAD}$; tam giác $SAD$ đều nên góc bằng $60^\\circ$."],
        [ch, "SB", "CD", 60, "Vì $CD\\parallel AB$ nên góc cần tìm bằng $\\widehat{SBA}$; tam giác $SAB$ đều nên góc bằng $60^\\circ$."],
        [ch, "SA", "SC", 90, "Gọi cạnh bằng $a$: $SA = SC = a$, $AC = a\\sqrt{2}$ nên $SA^2 + SC^2 = AC^2$, tam giác $SAC$ vuông tại $S$; góc bằng $90^\\circ$."],
      ];
      const [ctx, l1, l2, ang, ex] = r.pick(D), sw = r.chance(0.5);
      return {
        stem: `${ctx} Góc giữa hai đường thẳng $${sw ? l2 : l1}$ và $${sw ? l1 : l2}$ bằng`,
        ...mcq(r, deg(ang), [30, 45, 60, 90].filter((x) => x !== ang).map(deg)),
        explanation: ex,
      };
    },
  },
  {
    id: "t11k2-duong-vuong-goc-mat", ...b7, topic: "Đường thẳng vuông góc với mặt phẳng", level: 1, kind: "mcq",
    make: (r) => {
      const C: [string, string[], string[], string][] = [
        ["Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình vuông, $SA\\perp (ABCD)$.",
          ["BC\\perp (SAB)", "CD\\perp (SAD)", "BD\\perp (SAC)", "AB\\perp (SAD)", "AD\\perp (SAB)"],
          ["BC\\perp (SAC)", "AC\\perp (SBD)", "CD\\perp (SBC)", "BD\\perp (SBC)", "SC\\perp (ABCD)", "AB\\perp (SBC)"],
          "$SA$ vuông góc với mọi đường thẳng nằm trong $(ABCD)$. $BC\\perp AB$, $BC\\perp SA$ nên $BC\\perp (SAB)$; tương tự $CD\\perp (SAD)$, $AB\\perp (SAD)$, $AD\\perp (SAB)$; $BD\\perp AC$, $BD\\perp SA$ nên $BD\\perp (SAC)$."],
        ["Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình chữ nhật với $AB\\ne AD$, $SA\\perp (ABCD)$.",
          ["BC\\perp (SAB)", "CD\\perp (SAD)", "AB\\perp (SAD)", "AD\\perp (SAB)", "SA\\perp BD"],
          ["BD\\perp (SAC)", "BC\\perp (SAC)", "AC\\perp (SBD)", "CD\\perp (SBC)", "SC\\perp (ABCD)"],
          "$SA\\perp (ABCD)$ nên $SA$ vuông góc với $AB, AD, BC, CD, BD$. $BC\\perp AB$, $BC\\perp SA$ nên $BC\\perp (SAB)$; tương tự $CD\\perp (SAD)$. Vì đáy là hình chữ nhật không vuông nên $BD$ không vuông góc với $AC$, do đó $BD$ không vuông góc với $(SAC)$."],
        ["Cho hình chóp $S.ABC$ có $SA\\perp (ABC)$ và tam giác $ABC$ vuông tại $B$.",
          ["BC\\perp (SAB)", "BC\\perp SB", "SA\\perp BC", "SA\\perp AC"],
          ["AB\\perp (SBC)", "AC\\perp (SAB)", "SB\\perp (ABC)", "AC\\perp (SBC)", "BC\\perp (SAC)"],
          "$SA\\perp (ABC)$ nên $SA\\perp BC$, $SA\\perp AC$. $BC\\perp AB$ và $BC\\perp SA$ nên $BC\\perp (SAB)$, suy ra $BC\\perp SB$."],
      ];
      const [ctx, T, F, ex] = r.pick(C), askTrue = r.chance(0.5);
      const good = r.pick(askTrue ? T : F), bad = pickN(r, askTrue ? F : T, 3);
      return {
        stem: `${ctx} ${r.pick(["Khẳng định nào sau đây", "Mệnh đề nào dưới đây", "Trong các khẳng định sau, khẳng định nào"])} ${askTrue ? "đúng" : "sai"}?`,
        ...mcq(r, $(good), bad.map($)),
        explanation: `${ex} Vậy khẳng định ${askTrue ? "đúng" : "sai"} là $${good}$.`,
      };
    },
  },
  {
    id: "t11k2-hai-mat-phang-vuong-goc", ...b7, topic: "Hai mặt phẳng vuông góc", level: 1, kind: "mcq",
    make: (r) => {
      const C: [string, string[], string[], string][] = [
        ["Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình vuông, $SA\\perp (ABCD)$.",
          ["(SAB)\\perp (ABCD)", "(SAB)\\perp (SBC)", "(SAD)\\perp (SCD)", "(SAC)\\perp (SBD)", "(SAB)\\perp (SAD)", "(SAC)\\perp (ABCD)"],
          ["(SBC)\\perp (SCD)", "(SAB)\\perp (SCD)", "(SBD)\\perp (ABCD)", "(SBC)\\perp (ABCD)", "(SBC)\\perp (SAD)", "(SCD)\\perp (ABCD)"],
          "Mặt phẳng chứa $SA$ thì vuông góc với $(ABCD)$. $BC\\perp (SAB)$ nên $(SBC)\\perp (SAB)$; $CD\\perp (SAD)$ nên $(SCD)\\perp (SAD)$; $BD\\perp (SAC)$ nên $(SBD)\\perp (SAC)$; $AD\\perp (SAB)$ nên $(SAD)\\perp (SAB)$."],
        ["Cho hình chóp $S.ABC$ có $SA\\perp (ABC)$ và tam giác $ABC$ vuông tại $B$.",
          ["(SAB)\\perp (ABC)", "(SAC)\\perp (ABC)", "(SBC)\\perp (SAB)"],
          ["(SBC)\\perp (ABC)", "(SAC)\\perp (SBC)", "(SAB)\\perp (SAC)", "(SBC)\\perp (SAC)"],
          "$(SAB)$ và $(SAC)$ chứa $SA\\perp (ABC)$ nên cùng vuông góc với $(ABC)$. $BC\\perp AB$, $BC\\perp SA$ nên $BC\\perp (SAB)$, suy ra $(SBC)\\perp (SAB)$."],
        ["Cho hình chóp tứ giác đều $S.ABCD$ có $O$ là tâm của đáy.",
          ["(SAC)\\perp (ABCD)", "(SBD)\\perp (ABCD)", "(SAC)\\perp (SBD)"],
          ["(SAB)\\perp (ABCD)", "(SBC)\\perp (ABCD)", "(SCD)\\perp (ABCD)", "(SAD)\\perp (ABCD)"],
          "$SO\\perp (ABCD)$ nên $(SAC)$, $(SBD)$ (cùng chứa $SO$) vuông góc với $(ABCD)$. $BD\\perp AC$, $BD\\perp SO$ nên $BD\\perp (SAC)$, suy ra $(SBD)\\perp (SAC)$. Các mặt bên tạo với đáy góc nhọn nên không vuông góc với đáy."],
      ];
      const [ctx, T, F, ex] = r.pick(C), askTrue = r.chance(0.5);
      const good = r.pick(askTrue ? T : F), bad = pickN(r, askTrue ? F : T, 3);
      return {
        stem: `${ctx} ${r.pick(["Khẳng định nào sau đây", "Mệnh đề nào dưới đây", "Trong các khẳng định sau, khẳng định nào"])} ${askTrue ? "đúng" : "sai"}?`,
        ...mcq(r, $(good), bad.map($)),
        explanation: `${ex} Vậy khẳng định ${askTrue ? "đúng" : "sai"} là $${good}$.`,
      };
    },
  },
  {
    id: "t11k2-goc-duong-thang-mat-phang", ...b7, topic: "Góc giữa đường thẳng và mặt phẳng", level: 2, kind: "mcq",
    make: (r) => {
      const tanT: Record<number, string> = { 30: "\\dfrac{\\sqrt{3}}{3}", 45: "1", 60: "\\sqrt{3}" };
      const cosT: Record<number, string> = { 30: "\\dfrac{\\sqrt{3}}{2}", 45: "\\dfrac{\\sqrt{2}}{2}", 60: "\\dfrac{1}{2}" };
      const mode = r.int(0, 3);
      let stem: string, ang: number, ex: string;
      if (mode === 0) {
        const [SA, a] = r.pick([["\\dfrac{a\\sqrt{6}}{3}", 30], ["a\\sqrt{2}", 45], ["a\\sqrt{6}", 60]] as [string, number][]); ang = a;
        stem = `Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình vuông cạnh $a$, $SA\\perp (ABCD)$ và $SA = ${SA}$. Góc giữa đường thẳng $SC$ và mặt phẳng $(ABCD)$ bằng`;
        ex = `$AC$ là hình chiếu của $SC$ trên $(ABCD)$ nên góc cần tìm là $\\widehat{SCA}$. Ta có $AC = a\\sqrt{2}$, $\\tan\\widehat{SCA} = \\dfrac{SA}{AC} = ${tanT[ang]}$ nên $\\widehat{SCA} = ${ang}^\\circ$.`;
      } else if (mode === 1 || mode === 2) {
        const [SA, a] = r.pick([["\\dfrac{a\\sqrt{3}}{3}", 30], ["a", 45], ["a\\sqrt{3}", 60]] as [string, number][]); ang = a;
        const [base, pl, ln, pr] = mode === 1 ? ["hình vuông $ABCD$ cạnh $a$", "(ABCD)", ...r.pick([["SB", "AB"], ["SD", "AD"]])] : ["tam giác đều $ABC$ cạnh $a$", "(ABC)", ...r.pick([["SB", "AB"], ["SC", "AC"]])];
        stem = `Cho hình chóp $S.${mode === 1 ? "ABCD" : "ABC"}$ có đáy là ${base}, $SA\\perp ${pl}$ và $SA = ${SA}$. Góc giữa đường thẳng $${ln}$ và mặt phẳng $${pl}$ bằng`;
        ex = `$${pr}$ là hình chiếu của $${ln}$ trên $${pl}$ nên góc cần tìm là $\\widehat{S${ln[1]}A}$. Ta có $\\tan\\widehat{S${ln[1]}A} = \\dfrac{SA}{${pr}} = ${tanT[ang]}$ nên góc bằng $${ang}^\\circ$.`;
      } else {
        const [b, a] = r.pick([["\\dfrac{a\\sqrt{6}}{3}", 30], ["a", 45], ["a\\sqrt{2}", 60]] as [string, number][]); ang = a;
        const ln = r.pick(["SA", "SB", "SC", "SD"]);
        stem = `Cho hình chóp tứ giác đều $S.ABCD$ có cạnh đáy bằng $a$ và cạnh bên bằng $${b}$. Góc giữa cạnh bên $${ln}$ và mặt phẳng đáy bằng`;
        ex = `Gọi $O$ là tâm đáy thì $SO\\perp (ABCD)$, $O${ln[1]}$ là hình chiếu của $${ln}$ nên góc cần tìm là $\\widehat{S${ln[1]}O}$. Ta có $O${ln[1]} = \\dfrac{a\\sqrt{2}}{2}$, $\\cos\\widehat{S${ln[1]}O} = \\dfrac{O${ln[1]}}{${ln}} = ${cosT[ang]}$ nên góc bằng $${ang}^\\circ$.`;
      }
      return { stem, ...mcq(r, deg(ang), [30, 45, 60, 90].filter((x) => x !== ang).map(deg)), explanation: ex };
    },
  },
  {
    id: "t11k2-the-tich-chop-lang-tru", ...b7, topic: "Thể tích khối chóp, khối lăng trụ", level: 1, kind: "mcq",
    make: (r) => {
      const v = r.int(0, 3), a = r.int(2, 9), b = r.int(2, 9), h = r.int(2, 12);
      const U = "$\\text{cm}^3$";
      let ctx: string, V: string, wr: string[], ex: string;
      if (v === 0) {
        ctx = `Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình vuông cạnh $${a}$ cm, $SA\\perp (ABCD)$ và $SA = ${h}$ cm. Thể tích của khối chóp $S.ABCD$ bằng`;
        V = frac(a * a * h, 3); wr = [String(a * a * h), frac(a * a * h, 6), frac(a * h, 3), frac(a * a * h, 2)];
        ex = `$V = \\dfrac{1}{3}S_{ABCD}\\cdot SA = \\dfrac{1}{3}\\cdot ${a}^2\\cdot ${h} = ${V}$ (${U}).`;
      } else if (v === 1) {
        need(a !== b);
        ctx = `Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình chữ nhật với $AB = ${a}$ cm, $AD = ${b}$ cm, $SA\\perp (ABCD)$ và $SA = ${h}$ cm. Thể tích của khối chóp $S.ABCD$ bằng`;
        V = frac(a * b * h, 3); wr = [String(a * b * h), frac(a * b * h, 6), frac((a + b) * h, 3), frac(a * b * h, 2)];
        ex = `$V = \\dfrac{1}{3}\\cdot AB\\cdot AD\\cdot SA = \\dfrac{1}{3}\\cdot ${a}\\cdot ${b}\\cdot ${h} = ${V}$ (${U}).`;
      } else if (v === 2) {
        ctx = `Cho hình chóp $S.ABC$ có đáy $ABC$ là tam giác vuông tại $B$ với $AB = ${a}$ cm, $BC = ${b}$ cm, $SA\\perp (ABC)$ và $SA = ${h}$ cm. Thể tích của khối chóp $S.ABC$ bằng`;
        V = frac(a * b * h, 6); wr = [frac(a * b * h, 3), frac(a * b * h, 2), String(a * b * h), frac(a * b * h, 12)];
        ex = `$S_{ABC} = \\dfrac{1}{2}\\cdot ${a}\\cdot ${b} = ${frac(a * b, 2)}$, nên $V = \\dfrac{1}{3}\\cdot ${frac(a * b, 2)}\\cdot ${h} = ${V}$ (${U}).`;
      } else {
        ctx = `Cho hình lăng trụ đứng $ABC.A'B'C'$ có đáy $ABC$ là tam giác vuông tại $A$ với $AB = ${a}$ cm, $AC = ${b}$ cm và $AA' = ${h}$ cm. Thể tích của khối lăng trụ đã cho bằng`;
        V = frac(a * b * h, 2); wr = [String(a * b * h), frac(a * b * h, 6), frac(a * b * h, 3), frac(a * b * h, 4)];
        ex = `Khối lăng trụ có $V = S_{ABC}\\cdot AA' = \\dfrac{1}{2}\\cdot ${a}\\cdot ${b}\\cdot ${h} = ${V}$ (${U}).`;
      }
      return { stem: `${ctx} (đơn vị: ${U})`, ...mcq(r, $(V), wr.map($)), explanation: ex };
    },
  },

  /* =================================================================== HALF 1 – TF */
  {
    id: "t11k2-tf-logarit", ...b6, topic: "Tính chất của logarit", level: 2, kind: "tf",
    make: (r) => {
      const g = r.pick([2, 3, 5]), m = r.nz(-3, 5), n = r.nz(-3, 5), p = r.pick([2, 3]), q = r.pick([2, 3, 4]);
      need(m !== n && m !== -n && p !== q && m + n !== m * n);
      const t = [r.chance(0.5), r.chance(0.5), r.chance(0.5), r.chance(0.5)];
      return {
        stem: `Cho $x, y$ là các số thực dương thỏa mãn $\\log_{${g}} x = ${m}$ và $\\log_{${g}} y = ${n}$.`,
        ...tf([
          [`$\\log_{${g}}(xy) = ${t[0] ? m + n : m * n}$.`, t[0]],
          [`$\\log_{${g}}\\left(x^{${p}}y^{${q}}\\right) = ${t[1] ? p * m + q * n : q * m + p * n}$.`, t[1]],
          [`$\\log_{${g * g}} x = ${t[2] ? frac(m, 2) : 2 * m}$.`, t[2]],
          [`$\\log_{y} x = ${t[3] ? frac(m, n) : frac(n, m)}$.`, t[3]],
        ]),
        explanation: `$\\log_{${g}}(xy) = \\log_{${g}} x + \\log_{${g}} y = ${m + n}$. $\\log_{${g}}(x^{${p}}y^{${q}}) = ${p}\\cdot ${par(m)} + ${q}\\cdot ${par(n)} = ${p * m + q * n}$. $\\log_{${g * g}} x = \\dfrac{1}{2}\\log_{${g}} x = ${frac(m, 2)}$. $\\log_y x = \\dfrac{\\log_{${g}} x}{\\log_{${g}} y} = ${frac(m, n)}$.`,
      };
    },
  },
  {
    id: "t11k2-tf-ham-mu-log", ...b6, topic: "Tính chất của hàm số mũ, hàm số logarit", level: 2, kind: "tf",
    make: (r) => {
      const [bT, bn, bd] = r.pick([["2", 2, 1], ["3", 3, 1], ["\\dfrac{1}{2}", 1, 2], ["\\dfrac{1}{3}", 1, 3], ["4", 4, 1], ["\\dfrac{2}{3}", 2, 3], ["\\dfrac{3}{2}", 3, 2]] as [string, number, number][]);
      const inc = bn > bd, isLog = r.chance(0.5), k = r.pick([2, 3, -1, -2]);
      const [vn1, vd1] = k > 0 ? [bn ** k, bd ** k] : [bd ** -k, bn ** -k];
      need(vn1 <= 81 && vd1 <= 81);
      const V = frac(vn1, vd1);
      const t = [0, 1, 2, 3, 4].map(() => r.chance(0.5));
      let items: [string, boolean][], ex: string;
      if (isLog) {
        const f = `\\log_{${bT.replace("\\dfrac", "\\frac")}} x`;
        items = [
          [`Tập xác định của hàm số là $${t[0] ? "(0;+\\infty)" : "\\mathbb{R}"}$.`, t[0]],
          [`Hàm số ${(t[1] ? inc : !inc) ? "đồng biến" : "nghịch biến"} trên khoảng $(0;+\\infty)$.`, t[1]],
          [`Đồ thị hàm số đi qua điểm $${t[2] ? "(1;0)" : "(0;1)"}$.`, t[2]],
          [`$f\\left(${V}\\right) = ${t[3] ? k : -k}$.`, t[3]],
          [`Tập giá trị của hàm số là $${t[4] ? "\\mathbb{R}" : "(0;+\\infty)"}$.`, t[4]],
        ];
        ex = `Hàm số $f(x) = ${f}$ có tập xác định $(0;+\\infty)$, tập giá trị $\\mathbb{R}$, ${inc ? "đồng biến" : "nghịch biến"} vì cơ số ${inc ? "lớn hơn $1$" : "thuộc $(0;1)$"}, đồ thị qua $(1;0)$ vì $f(1) = 0$. $f\\left(${V}\\right) = \\log_{${bT.replace("\\dfrac", "\\frac")}} ${wrapB(bT)}^{${k}} = ${k}$.`;
        items = pickN(r, [0, 1, 2, 3, 4], 4).sort().map((i) => items[i]);
        return { stem: `Cho hàm số $f(x) = ${f}$.`, ...tf(items), explanation: ex };
      }
      const f = `${wrapB(bT)}^{x}`;
      items = [
        [`Tập xác định của hàm số là $${t[0] ? "\\mathbb{R}" : "(0;+\\infty)"}$.`, t[0]],
        [`Hàm số ${(t[1] ? inc : !inc) ? "đồng biến" : "nghịch biến"} trên $\\mathbb{R}$.`, t[1]],
        [`Đồ thị hàm số đi qua điểm $${t[2] ? "(0;1)" : "(1;0)"}$.`, t[2]],
        [`$f(${k}) = ${t[3] ? V : frac(vd1, vn1)}$.`, t[3]],
        [`Tập giá trị của hàm số là $${t[4] ? "(0;+\\infty)" : "\\mathbb{R}"}$.`, t[4]],
      ];
      ex = `Hàm số $f(x) = ${f}$ có tập xác định $\\mathbb{R}$, tập giá trị $(0;+\\infty)$, ${inc ? "đồng biến" : "nghịch biến"} trên $\\mathbb{R}$ vì cơ số ${inc ? "lớn hơn $1$" : "thuộc $(0;1)$"}, đồ thị qua $(0;1)$ vì $f(0) = 1$. $f(${k}) = ${wrapB(bT)}^{${k}} = ${V}$.`;
      items = pickN(r, [0, 1, 2, 3, 4], 4).sort().map((i) => items[i]);
      return { stem: `Cho hàm số $f(x) = ${f}$.`, ...tf(items), explanation: ex };
    },
  },
  {
    id: "t11k2-tf-pt-mu-dat-an", ...b6, topic: "Phương trình mũ đưa về phương trình bậc hai", level: 3, kind: "tf",
    make: (r) => {
      const g = r.pick([2, 3]), two = r.chance(0.6);
      const u = r.int(0, 2), v = two ? r.int(u + 1, 3) : 0, t1 = g ** u, t2 = two ? g ** v : -r.int(1, 4);
      need(Math.abs(t2) <= 27);
      const Sm = t1 + t2, P = t1 * t2;
      need(Sm !== 0);
      const mid = ` ${Sm > 0 ? "-" : "+"} ${Math.abs(Sm) === 1 ? "" : Math.abs(Sm) + "\\cdot "}${g}^{x}`;
      const eq = `${g * g}^{x}${mid}${term(P)} = 0`;
      const N = two ? 2 : 1, sum = two ? u + v : u, top = two ? v : u, ttop = two ? t2 : t1;
      const t = [r.chance(0.5), r.chance(0.5), r.chance(0.5), r.chance(0.5)];
      const wrongSum = Sm !== sum ? Sm : sum + 1;
      return {
        stem: `Cho phương trình $${eq}$.`,
        ...tf([
          [`Đặt $t = ${g}^{x}$ $(t > 0)$, phương trình trở thành $${poly(t[0] ? [1, -Sm, P] : [1, Sm, P], "t")} = 0$.`, t[0]],
          [`Phương trình có đúng $${t[1] ? N : 3 - N}$ nghiệm thực.`, t[1]],
          [`Tổng các nghiệm của phương trình bằng $${t[2] ? sum : wrongSum}$.`, t[2]],
          [`${two ? "Nghiệm lớn nhất của phương trình là" : "Nghiệm của phương trình là"} $x = ${t[3] ? top : ttop}$.`, t[3]],
        ]),
        explanation: `Vì $${g * g}^{x} = (${g}^{x})^2$, đặt $t = ${g}^{x} > 0$ được $${poly([1, -Sm, P], "t")} = 0 \\Leftrightarrow t = ${t1}$ hoặc $t = ${t2}$. ${two ? `Cả hai giá trị đều dương: $${g}^{x} = ${t1} \\Leftrightarrow x = ${u}$; $${g}^{x} = ${t2} \\Leftrightarrow x = ${v}$. Phương trình có $2$ nghiệm, tổng bằng $${u + v}$, nghiệm lớn nhất là $${v}$.` : `Loại $t = ${t2} < 0$. $${g}^{x} = ${t1} \\Leftrightarrow x = ${u}$. Phương trình có đúng $1$ nghiệm $x = ${u}$.`}`,
      };
    },
  },
  {
    id: "t11k2-tf-hinh-chop-vuong-goc", ...b7, topic: "Quan hệ vuông góc, góc, khoảng cách, thể tích trong hình chóp", level: 3, kind: "tf",
    make: (r) => {
      const [a, h, c] = r.pick([[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13], [9, 12, 15], [12, 9, 15], [8, 15, 17], [15, 8, 17], [12, 16, 20], [16, 12, 20]]);
      const U = r.pick(["cm", "dm", "m"]);
      const t = [r.chance(0.5), r.chance(0.5), r.chance(0.5), r.chance(0.5)];
      const tanR = surd(h, 2, 2 * a), V = frac(a * a * h, 3), d = frac(a * h, c);
      return {
        stem: `Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình vuông cạnh $${a}$ ${U}, $SA\\perp (ABCD)$ và $SA = ${h}$ ${U}.`,
        ...tf([
          [`$${t[0] ? r.pick(["BC\\perp (SAB)", "CD\\perp (SAD)", "BD\\perp (SAC)"]) : r.pick(["BC\\perp (SAC)", "BD\\perp (SBC)", "CD\\perp (SBC)"])}$.`, t[0]],
          [`Tang của góc giữa đường thẳng $SC$ và mặt phẳng $(ABCD)$ bằng $${t[1] ? tanR : frac(h, a)}$.`, t[1]],
          [`Thể tích khối chóp $S.ABCD$ bằng $${t[2] ? V : a * a * h}\\ \\text{${U}}^3$.`, t[2]],
          [`Khoảng cách từ $A$ đến mặt phẳng $(SBC)$ bằng $${t[3] ? d : a}$ ${U}.`, t[3]],
        ]),
        explanation: `$BC\\perp AB$, $BC\\perp SA$ nên $BC\\perp (SAB)$; tương tự $CD\\perp (SAD)$, $BD\\perp (SAC)$ (còn $BC$ không vuông góc với $AC$, $BD$ không vuông góc với $SB$, $CD$ không vuông góc với $SC$). Góc giữa $SC$ và đáy là $\\widehat{SCA}$, $AC = ${a}\\sqrt{2}$, $\\tan\\widehat{SCA} = \\dfrac{${h}}{${a}\\sqrt{2}} = ${tanR}$. $V = \\dfrac{1}{3}\\cdot ${a}^2\\cdot ${h} = ${V}$. Kẻ $AH\\perp SB$ thì $AH\\perp (SBC)$ (vì $BC\\perp (SAB)$), $AH = \\dfrac{SA\\cdot AB}{SB} = \\dfrac{${h}\\cdot ${a}}{${c}} = ${d}$ ${U}.`,
      };
    },
  },

  /* =================================================================== HALF 1 – SHORT */
  {
    id: "t11k2-sh-lai-kep-tang-truong", ...b6, topic: "Lãi kép, tăng trưởng, phân rã", level: 3, kind: "short",
    make: (r) => {
      const v = r.int(0, 3);
      if (v === 0) {
        const A = r.pick([50, 80, 100, 120, 150, 200, 250, 300, 500]), rr = r.pick([5, 5.5, 6, 6.5, 7, 7.5, 8]), n = r.int(3, 10);
        const T = A * (1 + rr / 100) ** n;
        return {
          stem: `Một người gửi $${A}$ triệu đồng vào ngân hàng theo hình thức lãi kép, kì hạn $1$ năm với lãi suất $${tex(rr, 1)}\\%$/năm. Giả sử lãi suất không đổi và người đó không rút tiền. Sau $${n}$ năm, người đó nhận được tổng số tiền (cả gốc và lãi) là bao nhiêu triệu đồng? (làm tròn kết quả đến hàng đơn vị)`,
          ...short(T, 0),
          explanation: `Công thức lãi kép: $T = A(1 + r)^n = ${A}\\cdot(1 + ${tex(rr / 100, 3)})^{${n}}\\approx ${tex(T, 2)}$. Làm tròn: $${round(T)}$ triệu đồng.`,
        };
      }
      if (v === 1) {
        const rr = r.pick([5, 6, 6.5, 7, 7.5, 8, 8.5, 9]), k = r.pick([1.5, 2, 3]);
        const x = Math.log(k) / Math.log(1 + rr / 100), n = Math.ceil(x);
        need(n - x > 1e-6);
        const goal = k === 2 ? "gấp đôi số tiền ban đầu" : k === 3 ? "gấp ba số tiền ban đầu" : "tăng thêm ít nhất $50\\%$ so với số tiền ban đầu";
        return {
          stem: `Một người gửi tiết kiệm theo hình thức lãi kép, kì hạn $1$ năm với lãi suất $${tex(rr, 1)}\\%$/năm (lãi suất không đổi, không rút tiền). Hỏi sau ít nhất bao nhiêu năm thì tổng số tiền (cả gốc và lãi) ${goal.replace("ít nhất ", "")}${k === 1.5 ? "" : " trở lên"}?`,
          ...short(n, 0),
          explanation: `Cần $A(1 + ${tex(rr / 100, 3)})^n \\ge ${tex(k, 1)}A \\Leftrightarrow n \\ge \\log_{${tex(1 + rr / 100, 3)}} ${tex(k, 1)} \\approx ${tex(x, 2)}$. Vậy cần ít nhất $${n}$ năm.`,
        };
      }
      if (v === 2) {
        const A = r.int(20, 90) * 10, rr = r.pick([1, 1.2, 1.5, 2, 2.5, 3]), t = r.int(5, 15), N = A * Math.exp((rr / 100) * t);
        return {
          stem: `Dân số của một thành phố được ước tính theo công thức $S = A\\cdot e^{rt}$, trong đó $A$ là dân số ở thời điểm ban đầu, $r$ là tỉ lệ tăng dân số hằng năm, $t$ là số năm. Năm 2024 thành phố có $${A}$ nghìn người, tỉ lệ tăng dân số là $${tex(rr, 1)}\\%$/năm. Theo công thức trên, sau $${t}$ năm dân số thành phố khoảng bao nhiêu nghìn người? (làm tròn kết quả đến hàng đơn vị)`,
          ...short(N, 0),
          explanation: `$S = ${A}\\cdot e^{${tex(rr / 100, 3)}\\cdot ${t}} = ${A}\\cdot e^{${tex((rr * t) / 100, 3)}}\\approx ${tex(N, 2)}$, tức khoảng $${round(N)}$ nghìn người.`,
        };
      }
      const m0 = r.int(4, 20) * 5, T = r.pick([3, 4, 5, 6, 8, 10]), t = r.int(2, 30), m = m0 * 0.5 ** (t / T);
      need(t % T !== 0 && m >= 1);
      return {
        stem: `Một chất phóng xạ có chu kì bán rã là $${T}$ ngày, khối lượng còn lại sau $t$ ngày được tính theo công thức $m(t) = m_0\\left(\\dfrac{1}{2}\\right)^{\\frac{t}{T}}$, trong đó $m_0$ là khối lượng ban đầu và $T$ là chu kì bán rã. Ban đầu có $${m0}$ gam chất đó. Sau $${t}$ ngày khối lượng chất phóng xạ còn lại là bao nhiêu gam? (làm tròn kết quả đến hàng phần mười)`,
        ...short(m, 1),
        explanation: `$m = ${m0}\\cdot\\left(\\dfrac{1}{2}\\right)^{\\frac{${t}}{${T}}}\\approx ${tex(m, 3)}$, làm tròn được $${tex(m, 1)}$ gam.`,
      };
    },
  },
  {
    id: "t11k2-sh-the-tich-chop-deu", ...b7, topic: "Thể tích khối chóp đều, lăng trụ đều", level: 2, kind: "short",
    make: (r) => {
      const v = r.int(0, 2);
      if (v === 0) {
        const a = r.pick([2, 4, 6]), h = r.int(1, 8), b2 = (a * a) / 2 + h * h, V = (a * a * h) / 3;
        const bT = Number.isInteger(Math.sqrt(b2)) ? String(Math.sqrt(b2)) : `\\sqrt{${b2}}`;
        return {
          stem: `Cho hình chóp tứ giác đều $S.ABCD$ có cạnh đáy bằng $${a}$ cm và cạnh bên bằng $${bT}$ cm. Tính thể tích của khối chóp $S.ABCD$ (đơn vị: $\\text{cm}^3$, làm tròn kết quả đến hàng phần mười).`,
          ...short(V, 1),
          explanation: `Gọi $O$ là tâm đáy, $SO\\perp (ABCD)$, $OA = \\dfrac{${a}\\sqrt{2}}{2}$, $OA^2 = ${(a * a) / 2}$. $SO = \\sqrt{SA^2 - OA^2} = \\sqrt{${b2} - ${(a * a) / 2}} = ${h}$. $V = \\dfrac{1}{3}\\cdot ${a}^2\\cdot ${h} = ${frac(a * a * h, 3)}\\approx ${tex(V, 1)}$.`,
        };
      }
      if (v === 1) {
        const a = r.int(2, 6), h = r.int(2, 9), V = (Math.sqrt(3) / 12) * a * a * h;
        return {
          stem: `Cho hình chóp tam giác đều $S.ABC$ có cạnh đáy bằng $${a}$ cm và chiều cao bằng $${h}$ cm. Tính thể tích của khối chóp đó (đơn vị: $\\text{cm}^3$, làm tròn kết quả đến hàng phần mười).`,
          ...short(V, 1),
          explanation: `Diện tích đáy $S = \\dfrac{${a}^2\\sqrt{3}}{4}$. $V = \\dfrac{1}{3}\\cdot\\dfrac{${a * a}\\sqrt{3}}{4}\\cdot ${h} = ${surd(a * a * h, 3, 12)}\\approx ${tex(V, 1)}$.`,
        };
      }
      const a = r.int(2, 5), h = r.int(2, 8), V = (Math.sqrt(3) / 4) * a * a * h;
      return {
        stem: `Cho hình lăng trụ tam giác đều $ABC.A'B'C'$ có cạnh đáy bằng $${a}$ dm và cạnh bên bằng $${h}$ dm. Tính thể tích của khối lăng trụ đó (đơn vị: $\\text{dm}^3$, làm tròn kết quả đến hàng phần mười).`,
        ...short(V, 1),
        explanation: `Lăng trụ đều là lăng trụ đứng nên chiều cao bằng cạnh bên. $V = S_{ABC}\\cdot AA' = \\dfrac{${a}^2\\sqrt{3}}{4}\\cdot ${h} = ${surd(a * a * h, 3, 4)}\\approx ${tex(V, 1)}$.`,
      };
    },
  },
  {
    id: "t11k2-sh-the-tich-chop-cut", ...b7, topic: "Thể tích khối chóp cụt đều", level: 3, kind: "short",
    make: (r) => {
      const a = r.int(3, 8), b = r.int(1, a - 1), h = r.int(2, 6), V = (h * (a * a + a * b + b * b)) / 3;
      const dp = V < 100 ? 1 : 0, rt = dp ? "làm tròn kết quả đến hàng phần mười" : "làm tròn kết quả đến hàng đơn vị";
      const v = r.int(0, 2);
      let stem: string, pre = "";
      if (v === 0) {
        stem = `Cho khối chóp cụt tứ giác đều có cạnh đáy lớn bằng $${a}$ cm, cạnh đáy nhỏ bằng $${b}$ cm và chiều cao bằng $${h}$ cm. Tính thể tích của khối chóp cụt đó (đơn vị: $\\text{cm}^3$, ${rt}).`;
      } else if (v === 1) {
        need((a - b) % 2 === 0);
        const c2 = ((a - b) * (a - b)) / 2 + h * h, cT = Number.isInteger(Math.sqrt(c2)) ? String(Math.sqrt(c2)) : `\\sqrt{${c2}}`;
        stem = `Cho khối chóp cụt tứ giác đều $ABCD.A'B'C'D'$ có $AB = ${a}$ cm, $A'B' = ${b}$ cm và cạnh bên $AA' = ${cT}$ cm. Tính thể tích của khối chóp cụt đó (đơn vị: $\\text{cm}^3$, ${rt}).`;
        pre = `Gọi $O$, $O'$ là tâm hai đáy; trong hình thang vuông $OAA'O'$: $OA - O'A' = \\dfrac{(${a} - ${b})\\sqrt{2}}{2}$, nên chiều cao $h = \\sqrt{AA'^2 - \\dfrac{(${a} - ${b})^2}{2}} = \\sqrt{${c2} - ${((a - b) * (a - b)) / 2}} = ${h}$. `;
      } else {
        stem = `Một chiếc chậu trồng cây có dạng khối chóp cụt tứ giác đều (không tính độ dày thành chậu), miệng chậu là hình vuông cạnh $${a}$ dm, đáy chậu là hình vuông cạnh $${b}$ dm và chiều cao $${h}$ dm. Hỏi chậu chứa được tối đa bao nhiêu lít đất? (${rt})`;
      }
      return {
        stem,
        ...short(V, dp),
        explanation: `${pre}$S = ${a}^2 = ${a * a}$, $S' = ${b}^2 = ${b * b}$. $V = \\dfrac{h}{3}\\left(S + \\sqrt{SS'} + S'\\right) = \\dfrac{${h}}{3}(${a * a} + ${a * b} + ${b * b}) = ${frac(h * (a * a + a * b + b * b), 3)}${Number.isInteger(V) ? "" : `\\approx ${tex(V, 2)}`}$.`,
      };
    },
  },
  {
    id: "t11k2-sh-khoang-cach", ...b7, topic: "Khoảng cách từ điểm đến mặt phẳng, giữa hai đường thẳng chéo nhau", level: 3, kind: "short",
    make: (r) => {
      const v = r.int(0, 2), a = r.int(1, 8), h = r.int(1, 8), b = r.int(2, 8);
      if (v === 0) {
        const d0 = (a * h) / Math.sqrt(a * a + h * h), ask = r.int(0, 3);
        const [txt, d, how] = ([
          ["từ điểm $A$ đến mặt phẳng $(SBC)$", d0, "Kẻ $AH\\perp SB$; vì $BC\\perp (SAB)$ nên $BC\\perp AH$, suy ra $AH\\perp (SBC)$ và $d(A,(SBC)) = AH$."],
          ["từ điểm $D$ đến mặt phẳng $(SBC)$", d0, "Vì $AD\\parallel BC$ nên $AD\\parallel (SBC)$, do đó $d(D,(SBC)) = d(A,(SBC)) = AH$ với $AH\\perp SB$ ($AH\\perp (SBC)$ vì $BC\\perp (SAB)$)."],
          ["giữa hai đường thẳng $AB$ và $SC$", d0, "Vì $AB\\parallel CD$ nên $AB\\parallel (SCD)$, $d(AB,SC) = d(A,(SCD)) = AH$ với $AH\\perp SD$ ($AH\\perp (SCD)$ vì $CD\\perp (SAD)$); tam giác $SAD$ vuông tại $A$ có $AD = AB$."],
          ["từ tâm $O$ của đáy đến mặt phẳng $(SBC)$", d0 / 2, "$O$ là trung điểm $AC$ và $C\\in (SBC)$ nên $d(O,(SBC)) = \\dfrac{1}{2}d(A,(SBC)) = \\dfrac{1}{2}AH$ với $AH\\perp SB$."],
        ] as [string, number, string][])[ask];
        return {
          stem: `Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình vuông cạnh $${a}$ cm, $SA\\perp (ABCD)$ và $SA = ${h}$ cm. Tính khoảng cách ${txt} (đơn vị: cm, làm tròn kết quả đến hàng phần trăm).`,
          ...short(d, 2),
          explanation: `${how} $AH = \\dfrac{SA\\cdot AB}{\\sqrt{SA^2 + AB^2}} = \\dfrac{${h}\\cdot ${a}}{\\sqrt{${h * h + a * a}}}\\approx ${tex(d0, 3)}$.${ask === 3 ? ` Vậy khoảng cách $\\approx ${tex(d, 3)}$.` : ""} Làm tròn: $${tex(d, 2)}$ cm.`,
        };
      }
      if (v === 1) {
        const d = (b * h) / Math.sqrt(b * b + h * h);
        return {
          stem: `Cho hình chóp $S.ABC$ có $SA\\perp (ABC)$, tam giác $ABC$ vuông tại $B$, $AB = ${b}$ cm và $SA = ${h}$ cm. Tính khoảng cách từ $A$ đến mặt phẳng $(SBC)$ (đơn vị: cm, làm tròn kết quả đến hàng phần trăm).`,
          ...short(d, 2),
          explanation: `$BC\\perp AB$, $BC\\perp SA$ nên $BC\\perp (SAB)$. Kẻ $AH\\perp SB$ thì $AH\\perp (SBC)$. $AH = \\dfrac{SA\\cdot AB}{\\sqrt{SA^2 + AB^2}} = \\dfrac{${h * b}}{\\sqrt{${h * h + b * b}}}\\approx ${tex(d, 3)}$.`,
        };
      }
      need(a !== b);
      const d = 1 / Math.sqrt(1 / (a * a) + 1 / (b * b) + 1 / (h * h));
      return {
        stem: `Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình chữ nhật với $AB = ${a}$ cm, $AD = ${b}$ cm, $SA\\perp (ABCD)$ và $SA = ${h}$ cm. Tính khoảng cách từ $A$ đến mặt phẳng $(SBD)$ (đơn vị: cm, làm tròn kết quả đến hàng phần trăm).`,
        ...short(d, 2),
        explanation: `Tứ diện $A.SBD$ có $AS$, $AB$, $AD$ đôi một vuông góc nên $\\dfrac{1}{d^2} = \\dfrac{1}{AS^2} + \\dfrac{1}{AB^2} + \\dfrac{1}{AD^2} = \\dfrac{1}{${h * h}} + \\dfrac{1}{${a * a}} + \\dfrac{1}{${b * b}}$, suy ra $d\\approx ${tex(d, 3)}$ cm.`,
      };
    },
  },
  {
    id: "t11k2-sh-so-do-goc", ...b7, topic: "Tính số đo góc giữa đường thẳng và mặt phẳng, góc nhị diện", level: 3, kind: "short",
    make: (r) => {
      const v = r.int(0, 3), a = r.int(2, 8), b = r.int(2, 8), h = r.int(1, 9);
      const D = (x: number) => (x * 180) / Math.PI;
      let stem: string, ang: number, ex: string;
      if (v === 0) {
        need(a !== b);
        ang = D(Math.atan(h / Math.sqrt(a * a + b * b)));
        stem = `Cho hình chóp $S.ABCD$ có đáy là hình chữ nhật, $AB = ${a}$ cm, $AD = ${b}$ cm, $SA\\perp (ABCD)$ và $SA = ${h}$ cm. Tính số đo góc giữa đường thẳng $SC$ và mặt phẳng $(ABCD)$`;
        ex = `Góc cần tìm là $\\widehat{SCA}$; $AC = \\sqrt{${a * a} + ${b * b}} = \\sqrt{${a * a + b * b}}$, $\\tan\\widehat{SCA} = \\dfrac{${h}}{\\sqrt{${a * a + b * b}}}$ nên $\\widehat{SCA}\\approx ${tex(ang, 2)}^\\circ$.`;
      } else if (v === 1) {
        need(2 * b * b > a * a);
        ang = D(Math.acos((a * Math.SQRT2) / (2 * b)));
        stem = `Cho hình chóp tứ giác đều $S.ABCD$ có cạnh đáy bằng $${a}$ và cạnh bên bằng $${b}$. Tính số đo góc giữa cạnh bên $SA$ và mặt phẳng đáy`;
        ex = `Gọi $O$ là tâm đáy, góc cần tìm là $\\widehat{SAO}$ với $AO = \\dfrac{${a}\\sqrt{2}}{2}$, $\\cos\\widehat{SAO} = \\dfrac{AO}{SA} = \\dfrac{${a}\\sqrt{2}}{${2 * b}}$ nên $\\widehat{SAO}\\approx ${tex(ang, 2)}^\\circ$.`;
      } else if (v === 2) {
        ang = D(Math.atan((2 * h) / a));
        stem = `Cho hình chóp tứ giác đều $S.ABCD$ có cạnh đáy bằng $${a}$ và chiều cao bằng $${h}$. Tính số đo của góc nhị diện $[S, CD, A]$ (góc giữa mặt bên $(SCD)$ và mặt đáy)`;
        ex = `Gọi $O$ là tâm đáy, $M$ là trung điểm $CD$: $OM\\perp CD$, $SM\\perp CD$ nên góc phẳng nhị diện là $\\widehat{SMO}$. $OM = \\dfrac{${a}}{2}$, $\\tan\\widehat{SMO} = \\dfrac{SO}{OM} = \\dfrac{${2 * h}}{${a}}$ nên $\\widehat{SMO}\\approx ${tex(ang, 2)}^\\circ$.`;
      } else {
        need(h !== a);
        ang = D(Math.atan(h / a));
        stem = `Cho hình chóp $S.ABCD$ có đáy là hình vuông cạnh $${a}$, $SA\\perp (ABCD)$ và $SA = ${h}$. Tính số đo của góc nhị diện $[S, BC, A]$`;
        ex = `$BC\\perp AB$, $BC\\perp SB$ (vì $BC\\perp (SAB)$) nên góc phẳng nhị diện là $\\widehat{SBA}$. $\\tan\\widehat{SBA} = \\dfrac{SA}{AB} = ${frac(h, a)}$ nên $\\widehat{SBA}\\approx ${tex(ang, 2)}^\\circ$.`;
      }
      const frac5 = ang - Math.floor(ang);
      need(Math.abs(frac5 - 0.5) > 0.02);
      return { stem: `${stem} (đơn vị: độ, làm tròn kết quả đến hàng đơn vị).`, ...short(ang, 0), explanation: `${ex} Làm tròn: $${round(ang)}^\\circ$.` };
    },
  },

  /* =================================================================== HALF 2 – MCQ – Chương VIII */
  {
    id: "t11k2-xs-bien-co-hop-giao", ...b8, topic: "Biến cố hợp, biến cố giao", level: 1, kind: "mcq",
    make: (r) => {
      const die = r.chance(0.5), N = die ? 6 : r.pick([10, 12, 15]);
      const k1 = r.int(Math.max(2, N - 8), N - 3), k2 = r.int(3, Math.min(N - 1, 8));
      const P: [string, (x: number) => boolean][] = [
        ["là số chẵn", (x) => x % 2 === 0], ["là số lẻ", (x) => x % 2 === 1], ["chia hết cho $3$", (x) => x % 3 === 0],
        ["là số nguyên tố", isPrime], [`lớn hơn $${k1}$`, (x) => x > k1], [`nhỏ hơn $${k2}$`, (x) => x < k2],
      ];
      if (!die) P.push(["chia hết cho $4$", (x) => x % 4 === 0]);
      const [A, B] = pickN(r, P, 2), U = Array.from({ length: N }, (_, i) => i + 1);
      const sA = U.filter(A[1]), sB = U.filter(B[1]);
      const uni = U.filter((x) => A[1](x) || B[1](x)), inter = U.filter((x) => A[1](x) && B[1](x));
      need(setT(sA) !== setT(sB) && inter.length > 0 && uni.length < N);
      const askU = r.chance(0.5), right = askU ? uni : inter;
      const intro = die
        ? `Gieo một con xúc xắc cân đối và đồng chất một lần. Xét các biến cố $A$: “Số chấm xuất hiện ${A[0]}” và $B$: “Số chấm xuất hiện ${B[0]}”.`
        : `Chọn ngẫu nhiên một số nguyên dương không lớn hơn $${N}$. Xét các biến cố $A$: “Số được chọn ${A[0]}” và $B$: “Số được chọn ${B[0]}”.`;
      const q = askU ? r.pick(["Biến cố $A\\cup B$ là", "Biến cố “$A$ hoặc $B$ xảy ra” là"]) : r.pick(["Biến cố $A\\cap B$ là", "Biến cố $AB$ (“cả $A$ và $B$ cùng xảy ra”) là"]);
      return {
        stem: `${intro} ${q}`,
        ...mcq(r, $(setT(right)), [askU ? inter : uni, sA, sB, sA.filter((x) => !sB.includes(x)), sB.filter((x) => !sA.includes(x))].map((s) => $(setT(s)))),
        explanation: `$A = ${setT(sA)}$, $B = ${setT(sB)}$. ${askU ? `$A\\cup B$ gồm các kết quả thuộc $A$ hoặc thuộc $B$: $A\\cup B = ${setT(uni)}$.` : `$A\\cap B$ gồm các kết quả thuộc cả $A$ và $B$: $A\\cap B = ${setT(inter)}$.`}`,
      };
    },
  },
  {
    id: "t11k2-xs-cong-thuc-cong", ...b8, topic: "Công thức cộng xác suất", level: 1, kind: "mcq",
    make: (r) => {
      const v = r.int(0, 2), pA = 5 * r.int(2, 12), pB = 5 * r.int(2, 12), f = (x: number) => num(x / 100, 4);
      if (v === 0) {
        need(pA + pB <= 95);
        return {
          stem: `Cho hai biến cố xung khắc $A$ và $B$ với $P(A) = ${tex(pA / 100)}$ và $P(B) = ${tex(pB / 100)}$. Giá trị của $P(A\\cup B)$ bằng`,
          ...mcq(r, f(pA + pB), [f((pA * pB) / 100), f(pA + pB - (pA * pB) / 100), f(Math.abs(pA - pB)), f(100 - pA - pB)]),
          explanation: `$A$, $B$ xung khắc nên $P(A\\cup B) = P(A) + P(B) = ${tex(pA / 100)} + ${tex(pB / 100)} = ${tex((pA + pB) / 100)}$.`,
        };
      }
      const pAB = 5 * r.int(1, 6);
      need(pAB < Math.min(pA, pB) && pA + pB - pAB <= 95);
      const pU = pA + pB - pAB;
      if (v === 1) return {
        stem: `Cho hai biến cố $A$ và $B$ có $P(A) = ${tex(pA / 100)}$, $P(B) = ${tex(pB / 100)}$ và $P(AB) = ${tex(pAB / 100)}$. Giá trị của $P(A\\cup B)$ bằng`,
        ...mcq(r, f(pU), [f(pA + pB), f(pA + pB + pAB), f(pA + pB - 2 * pAB), f((pA * pB) / 100)]),
        explanation: `Công thức cộng: $P(A\\cup B) = P(A) + P(B) - P(AB) = ${tex(pA / 100)} + ${tex(pB / 100)} - ${tex(pAB / 100)} = ${tex(pU / 100)}$.`,
      };
      return {
        stem: `Cho hai biến cố $A$ và $B$ có $P(A) = ${tex(pA / 100)}$, $P(B) = ${tex(pB / 100)}$ và $P(A\\cup B) = ${tex(pU / 100)}$. Giá trị của $P(AB)$ bằng`,
        ...mcq(r, f(pAB), [f(pU - pA), f(pU - pB), f((pA * pB) / 100), f(pA + pB + pU - 100)].filter((x) => !x.includes("-"))),
        explanation: `Từ $P(A\\cup B) = P(A) + P(B) - P(AB)$ suy ra $P(AB) = ${tex(pA / 100)} + ${tex(pB / 100)} - ${tex(pU / 100)} = ${tex(pAB / 100)}$.`,
      };
    },
  },
  {
    id: "t11k2-xs-cong-thuc-nhan", ...b8, topic: "Biến cố độc lập, công thức nhân xác suất", level: 1, kind: "mcq",
    make: (r) => {
      const p = r.int(5, 9) * 10 + r.pick([0, 0, 5]), q = r.int(4, 9) * 10 + r.pick([0, 0, 5]);
      need(p <= 95 && q <= 95);
      const a = p / 100, b = q / 100, f = (x: number) => num(x, 4);
      const ctx = r.pick([
        ["Hai xạ thủ cùng bắn vào một bia một cách độc lập với nhau, mỗi người bắn một viên. Xác suất bắn trúng bia của xạ thủ thứ nhất và thứ hai lần lượt là", "cả hai xạ thủ đều bắn trúng", "cả hai xạ thủ đều bắn trượt"],
        ["Hai bạn An và Bình mỗi người ném một quả bóng vào rổ một cách độc lập. Xác suất ném trúng rổ của An và Bình lần lượt là", "cả hai bạn đều ném trúng", "cả hai bạn đều ném trượt"],
        ["Một hệ thống có hai bộ phận hoạt động độc lập với nhau. Trong một ngày, xác suất để bộ phận I và bộ phận II hoạt động tốt lần lượt là", "cả hai bộ phận đều hoạt động tốt", "cả hai bộ phận đều không hoạt động tốt"],
      ]);
      const both = r.chance(0.5), v = both ? a * b : (1 - a) * (1 - b);
      return {
        stem: `${ctx[0]} $${tex(a)}$ và $${tex(b)}$. Xác suất để ${both ? ctx[1] : ctx[2]} là`,
        ...mcq(r, f(v), [f(both ? (1 - a) * (1 - b) : a * b), f(a + b - a * b), f(1 - a * b), f(both ? (a + b) / 2 : 2 - a - b), f(a * (1 - b) + b * (1 - a))].filter((x) => !/^\$1(\{,\}|\$)|^\$-|^\$[2-9]/.test(x))),
        explanation: `Hai biến cố độc lập nên áp dụng công thức nhân: ${both ? `$P = ${tex(a)}\\cdot ${tex(b)} = ${P4(v)}$` : `xác suất của các biến cố đối lần lượt là $${tex(1 - a)}$ và $${tex(1 - b)}$, $P = ${tex(1 - a)}\\cdot ${tex(1 - b)} = ${P4(v)}$`}.`,
      };
    },
  },
  {
    id: "t11k2-xs-it-nhat-dung-mot", ...b8, topic: "Xác suất có ít nhất một, đúng một biến cố xảy ra", level: 2, kind: "mcq",
    make: (r) => {
      const a = r.int(3, 9) / 10, b = r.int(3, 9) / 10, f = (x: number) => num(x, 4);
      const atl = 1 - (1 - a) * (1 - b), one = a * (1 - b) + (1 - a) * b, askAtl = r.chance(0.5);
      const ctx = r.pick([
        ["Hai máy bay ném bom một mục tiêu một cách độc lập, mỗi máy ném một quả. Xác suất trúng mục tiêu của máy thứ nhất và máy thứ hai lần lượt là", "mục tiêu bị trúng ít nhất một quả bom", "mục tiêu bị trúng đúng một quả bom"],
        ["Hai bạn Minh và Lan cùng giải độc lập một bài toán khó. Xác suất giải được bài toán của Minh và Lan lần lượt là", "bài toán được giải (có ít nhất một bạn giải được)", "có đúng một bạn giải được bài toán"],
        ["Hai xạ thủ bắn độc lập vào một bia, mỗi người bắn một viên. Xác suất bắn trúng của hai xạ thủ lần lượt là", "bia bị trúng ít nhất một viên", "bia bị trúng đúng một viên"],
      ]);
      const v = askAtl ? atl : one;
      return {
        stem: `${ctx[0]} $${tex(a)}$ và $${tex(b)}$. Xác suất để ${askAtl ? ctx[1] : ctx[2]} là`,
        ...mcq(r, f(v), [f(askAtl ? one : atl), f(a * b), f((1 - a) * (1 - b)), f(1 - a * b), f(a * (1 - b))]),
        explanation: askAtl
          ? `Biến cố đối là “cả hai đều không thành công”, có xác suất $(1 - ${tex(a)})(1 - ${tex(b)}) = ${P4((1 - a) * (1 - b))}$. Vậy $P = 1 - ${P4((1 - a) * (1 - b))} = ${P4(atl)}$.`
          : `$P = ${tex(a)}\\cdot ${tex(1 - b)} + ${tex(1 - a)}\\cdot ${tex(b)} = ${P4(a * (1 - b))} + ${P4((1 - a) * b)} = ${P4(one)}$ (dùng quy tắc cộng cho hai biến cố xung khắc và quy tắc nhân cho các biến cố độc lập).`,
      };
    },
  },
  {
    id: "t11k2-xs-ba-bien-co-doc-lap", ...b8, topic: "Quy tắc cộng và nhân với ba biến cố độc lập", level: 3, kind: "mcq",
    make: (r) => {
      const t = [r.int(4, 9), r.int(4, 9), r.int(4, 9)], pr = t.map((x) => x / 10);
      const Pk = [0, 0, 0, 0];
      for (let m = 0; m < 8; m++) { let p = 1, c = 0; for (let i = 0; i < 3; i++) { if (m & (1 << i)) { p *= pr[i]; c++; } else p *= 1 - pr[i]; } Pk[c] += p; }
      const ask = r.pick(["1", "2", "ge2"]), v = ask === "1" ? Pk[1] : ask === "2" ? Pk[2] : Pk[2] + Pk[3];
      const f = (x: number) => num(x, 4);
      const what = ask === "1" ? "có đúng một người bắn trúng" : ask === "2" ? "có đúng hai người bắn trúng" : "có ít nhất hai người bắn trúng";
      const [a, b, c] = pr.map((x) => tex(x)), [a1, b1, c1] = pr.map((x) => tex(1 - x));
      const ex = ask === "1"
        ? `$P = ${a}\\cdot ${b1}\\cdot ${c1} + ${a1}\\cdot ${b}\\cdot ${c1} + ${a1}\\cdot ${b1}\\cdot ${c} = ${P4(Pk[1])}$.`
        : `$P(\\text{đúng hai}) = ${a}\\cdot ${b}\\cdot ${c1} + ${a}\\cdot ${b1}\\cdot ${c} + ${a1}\\cdot ${b}\\cdot ${c} = ${P4(Pk[2])}$.${ask === "ge2" ? ` $P(\\text{cả ba}) = ${a}\\cdot ${b}\\cdot ${c} = ${P4(Pk[3])}$. Vậy $P = ${P4(Pk[2])} + ${P4(Pk[3])} = ${P4(v)}$.` : ""}`;
      return {
        stem: `Ba xạ thủ bắn độc lập vào một bia, mỗi người bắn một viên. Xác suất bắn trúng của ba xạ thủ lần lượt là $${a}$; $${b}$; $${c}$. Xác suất để ${what} là`,
        ...mcq(r, f(v), r.shuffle([f(Pk[1]), f(Pk[2]), f(Pk[3]), f(Pk[0]), f(1 - v), f(Pk[1] + Pk[2]), f(Pk[2] + Pk[3])])),
        explanation: `Các xạ thủ bắn độc lập nên dùng quy tắc nhân cho từng trường hợp và quy tắc cộng cho các trường hợp xung khắc. ${ex}`,
      };
    },
  },

  /* =================================================================== HALF 2 – MCQ – Chương IX */
  {
    id: "t11k2-dh-y-nghia", ...b9, topic: "Định nghĩa và ý nghĩa của đạo hàm", level: 1, kind: "mcq",
    make: (r) => {
      const v = r.int(0, 2), x0 = r.nz(-3, 3);
      if (v === 0) {
        const a = r.nz(-3, 3), b = r.int(-5, 5), c = r.int(-5, 5), fp = 2 * a * x0 + b, fx = a * x0 * x0 + b * x0 + c;
        return {
          stem: `Cho hàm số $f(x) = ${poly([a, b, c])}$. Giá trị của $\\displaystyle\\lim_{x\\to ${x0}}\\dfrac{f(x) - f(${x0})}{x ${x0 < 0 ? "+" : "-"} ${Math.abs(x0)}}$ bằng`,
          ...mcq(r, num(fp), [num(fx), num(a * x0 + b), num(2 * a * x0), num(-fp), num(fp + 1)]),
          explanation: `Theo định nghĩa, giới hạn đó bằng $f'(${x0})$. Ta có $f'(x) = ${poly([2 * a, b])}$ nên $f'(${x0}) = ${fp}$.`,
        };
      }
      const cs = [r.nz(-2, 2), r.int(-4, 4), r.int(-6, 6), r.int(-5, 5)], d = der(cs);
      if (v === 1) {
        const t0 = r.int(1, 5), s = [Math.abs(cs[0]), r.int(0, 4), r.int(1, 8), 0], ds = der(s), vt = ev(ds, t0);
        return {
          stem: `Một chất điểm chuyển động có phương trình $s(t) = ${poly(s, "t")}$ ($t$ tính bằng giây, $s$ tính bằng mét). Vận tốc tức thời của chất điểm tại thời điểm $t = ${t0}$ giây bằng`,
          ...mcq(r, $(`${vt}\\ \\text{m/s}`), [ev(s, t0), ev(der(ds), t0), vt + ds[ds.length - 1], ev(s, t0) / t0].filter((x) => Number.isInteger(x)).map((x) => $(`${x}\\ \\text{m/s}`))),
          explanation: `Vận tốc tức thời $v(t) = s'(t) = ${poly(ds, "t")}$. Tại $t = ${t0}$: $v(${t0}) = ${vt}$ m/s.`,
        };
      }
      const k = ev(d, x0), y0 = ev(cs, x0);
      return {
        stem: `Hệ số góc của tiếp tuyến của đồ thị hàm số $y = ${poly(cs)}$ tại điểm có hoành độ $x_0 = ${x0}$ bằng`,
        ...mcq(r, num(k), [num(y0), num(ev(der(d), x0)), num(-k), num(k + cs[3])]),
        explanation: `Hệ số góc của tiếp tuyến tại điểm có hoành độ $x_0$ là $y'(x_0)$. $y' = ${poly(d)}$ nên $y'(${x0}) = ${k}$.`,
      };
    },
  },
  {
    id: "t11k2-dh-da-thuc", ...b9, topic: "Đạo hàm của hàm số đa thức, căn thức, phân thức đơn giản", level: 1, kind: "mcq",
    make: (r) => {
      const n = r.pick([3, 4]), cs = [r.nz(-4, 5), ...Array.from({ length: n - 1 }, () => r.int(-6, 6)), r.nz(-9, 9)];
      const d = der(cs), extra = r.int(0, 2), k = r.nz(-6, 6);
      let y = poly(cs), right = poly(d), wr = [poly(cs.slice(0, -1)), `${poly(d)}${term(cs[n])}`, poly([...d, 0]), poly(d.map((c, i) => (i === 1 ? -c : c)))];
      if (extra === 1) {
        need(k % 2 === 0);
        const kk = k / 2, s = (z: number) => `${z > 0 ? "+" : "-"} \\dfrac{${Math.abs(z)}}{\\sqrt{x}}`;
        y = `${poly(cs.slice(0, -1).concat(0))} ${k > 0 ? "+" : "-"} ${Math.abs(k)}\\sqrt{x}`;
        const dd = der(cs.slice(0, -1).concat(0));
        right = `${poly(dd)} ${s(kk)}`;
        wr = [`${poly(dd)} ${s(k)}`, `${poly(dd)} ${s(-kk)}`, `${poly(cs.slice(0, -2))} ${s(kk)}`, `${poly(dd)} ${k > 0 ? "+" : "-"} ${Math.abs(kk)}\\sqrt{x}`];
      } else if (extra === 2) {
        const s = (z: number, e: string) => `${z > 0 ? "+" : "-"} \\dfrac{${Math.abs(z)}}{x${e}}`;
        y = `${poly(cs.slice(0, -1).concat(0))} ${s(k, "")}`;
        const dd = der(cs.slice(0, -1).concat(0));
        right = `${poly(dd)} ${s(-k, "^{2}")}`;
        wr = [`${poly(dd)} ${s(k, "^{2}")}`, `${poly(dd)} ${s(k, "")}`, `${poly(cs.slice(0, -2))} ${s(-k, "^{2}")}`, `${poly(dd)} ${s(-k, "")}`];
      }
      return {
        stem: `Đạo hàm của hàm số $y = ${y}$${extra === 0 ? "" : " (với $x > 0$)"} là`,
        ...mcq(r, $(`y' = ${right}`), wr.map((w) => $(`y' = ${w}`))),
        explanation: `Dùng $(x^n)' = nx^{n-1}$, $(c)' = 0$${extra === 1 ? ", $(\\sqrt{x})' = \\dfrac{1}{2\\sqrt{x}}$" : extra === 2 ? ", $\\left(\\dfrac{1}{x}\\right)' = -\\dfrac{1}{x^2}$" : ""} và quy tắc đạo hàm của tổng: $y' = ${right}$.`,
      };
    },
  },
  {
    id: "t11k2-dh-thuong", ...b9, topic: "Đạo hàm của thương", level: 2, kind: "mcq",
    make: (r) => {
      const a = r.nz(-5, 5), b = r.int(-6, 6), c = r.nz(-3, 3), d = r.nz(-6, 6), D = a * d - b * c;
      need(D !== 0);
      const den = poly([c, d]), q = (x: number, sq = true) => `${x < 0 ? "-" : ""}\\dfrac{${Math.abs(x)}}{(${den})${sq ? "^2" : ""}}`;
      return {
        stem: `Đạo hàm của hàm số $y = \\dfrac{${poly([a, b])}}{${den}}$ là`,
        ...mcq(r, $(`y' = ${q(D)}`), [$(`y' = ${q(-D)}`), $(`y' = ${q(D, false)}`), $(`y' = ${q(a * d + b * c)}`), $(`y' = ${frac(a, c)}`)]),
        explanation: `$y' = \\dfrac{(${poly([a, b])})'(${den}) - (${poly([a, b])})(${den})'}{(${den})^2} = \\dfrac{${a}\\cdot ${par(d)} - ${par(b)}\\cdot ${par(c)}}{(${den})^2} = ${q(D)}$.`,
      };
    },
  },
  {
    id: "t11k2-dh-ham-hop", ...b9, topic: "Đạo hàm của hàm số hợp", level: 2, kind: "mcq",
    make: (r) => {
      const v = r.int(0, 2);
      if (v < 2) {
        const n = r.int(3, 7), inner = v === 0 ? [r.nz(-4, 4), r.nz(-6, 6)] : [1, r.int(-5, 5), r.nz(-6, 6)];
        need(v === 1 || Math.abs(inner[0]) !== 1);
        const u = poly(inner), du = der(inner), duT = poly(du), pw2 = (k: number) => (k === 1 ? `(${u})` : `(${u})^{${k}}`);
        const right = v === 0 ? `${coef(n * inner[0])}${pw2(n - 1)}` : `${n}(${duT})${pw2(n - 1)}`;
        const wr = v === 0
          ? [`${n}${pw2(n - 1)}`, `${coef(n * inner[0])}${pw2(n)}`, `${coef(inner[0])}${pw2(n - 1)}`, `${coef((n - 1) * inner[0])}${pw2(n - 2)}`]
          : [`${n}${pw2(n - 1)}`, `(${duT})${pw2(n - 1)}`, `${n}(${duT})${pw2(n)}`, `${n - 1}(${duT})${pw2(n - 2)}`];
        return {
          stem: `Đạo hàm của hàm số $y = ${pw2(n)}$ là`,
          ...mcq(r, $(`y' = ${right}`), wr.map((w) => $(`y' = ${w}`))),
          explanation: `Đặt $u = ${u}$ thì $y = u^{${n}}$, $y' = ${n}u^{${n - 1}}\\cdot u' = ${n}\\cdot ${v === 0 ? par(inner[0]) + "\\cdot " : `(${duT})`}${pw2(n - 1)} = ${right}$.`,
        };
      }
      const a = r.nz(-3, 3), b = r.int(-5, 5), c = r.int(1, 9), u = poly([a, b, c]), du = poly([2 * a, b]);
      need(b !== 0 || a !== 0);
      return {
        stem: `Đạo hàm của hàm số $y = \\sqrt{${u}}$ là`,
        ...mcq(r, $(`y' = \\dfrac{${du}}{2\\sqrt{${u}}}`), [$(`y' = \\dfrac{1}{2\\sqrt{${u}}}`), $(`y' = \\dfrac{${du}}{\\sqrt{${u}}}`), $(`y' = \\dfrac{${poly([a, b])}}{2\\sqrt{${u}}}`), $(`y' = ${du}\\cdot\\sqrt{${u}}`)]),
        explanation: `$(\\sqrt{u})' = \\dfrac{u'}{2\\sqrt{u}}$ với $u = ${u}$, $u' = ${du}$. Vậy $y' = \\dfrac{${du}}{2\\sqrt{${u}}}$.`,
      };
    },
  },
  {
    id: "t11k2-dh-luong-giac", ...b9, topic: "Đạo hàm của hàm số lượng giác", level: 1, kind: "mcq",
    make: (r) => {
      const fn = r.pick(["sin", "cos", "tan", "cot", "mix"]), k = r.pick([2, 3, 4, 5, -2, -3]);
      const arg = r.pick([`${coef(k)}x`, `${coef(k)}x + \\dfrac{\\pi}{3}`, `${coef(k)}x - \\dfrac{\\pi}{4}`, `${coef(k)}x + 1`]);
      const A = `\\left(${arg}\\right)`, fr = (z: number, den: string) => `${z < 0 ? "-" : ""}\\dfrac{${Math.abs(z)}}{${den}}`;
      let y: string, right: string, wr: string[], rule: string;
      if (fn === "sin") { y = `\\sin${A}`; right = `${coef(k)}\\cos${A}`; wr = [`\\cos${A}`, `${coef(-k)}\\cos${A}`, `${coef(-k)}\\sin${A}`]; rule = "(\\sin u)' = u'\\cos u"; }
      else if (fn === "cos") { y = `\\cos${A}`; right = `${coef(-k)}\\sin${A}`; wr = [`-\\sin${A}`, `${coef(k)}\\sin${A}`, `${coef(k)}\\cos${A}`]; rule = "(\\cos u)' = -u'\\sin u"; }
      else if (fn === "tan") { y = `\\tan${A}`; right = fr(k, `\\cos^2${A}`); wr = [`\\dfrac{1}{\\cos^2${A}}`, fr(-k, `\\sin^2${A}`), fr(k, `\\sin^2${A}`)]; rule = "(\\tan u)' = \\dfrac{u'}{\\cos^2 u}"; }
      else if (fn === "cot") { y = `\\cot${A}`; right = fr(-k, `\\sin^2${A}`); wr = [`-\\dfrac{1}{\\sin^2${A}}`, fr(k, `\\sin^2${A}`), fr(k, `\\cos^2${A}`)]; rule = "(\\cot u)' = -\\dfrac{u'}{\\sin^2 u}"; }
      else {
        const a = r.nz(-5, 5), b = r.nz(-5, 5);
        y = `${coef(a)}\\sin x${term(b, "\\cos x")}`; right = `${coef(a)}\\cos x${term(-b, "\\sin x")}`;
        wr = [`${coef(a)}\\cos x${term(b, "\\sin x")}`, `${coef(-a)}\\cos x${term(-b, "\\sin x")}`, `${coef(-a)}\\cos x${term(b, "\\sin x")}`];
        rule = "(\\sin x)' = \\cos x,\\ (\\cos x)' = -\\sin x";
      }
      return {
        stem: `Đạo hàm của hàm số $y = ${y}$ là`,
        ...mcq(r, $(`y' = ${right}`), wr.map((w) => $(`y' = ${w}`))),
        explanation: `Áp dụng $${rule}$${fn === "mix" ? "" : ` với $u = ${arg}$, $u' = ${k}$`}: $y' = ${right}$.`,
      };
    },
  },
  {
    id: "t11k2-dh-mu-log", ...b9, topic: "Đạo hàm của hàm số mũ, hàm số logarit", level: 1, kind: "mcq",
    make: (r) => {
      const v = r.int(0, 4), a = r.pick([2, 3, 4, 5, -2, -3]), b = r.int(-5, 5), g = r.pick([2, 3, 5, 10]);
      const u = poly([a, b]);
      const C: [string, string, string[], string][] = [
        [`e^{${u}}`, `${coef(a)}e^{${u}}`, [`e^{${u}}`, `(${u})e^{${poly([a, b - 1])}}`, `\\dfrac{e^{${u}}}{${a}}`], `(e^u)' = u'e^u`],
        [`${g}^{x}`, `${g}^{x}\\ln ${g}`, [`x\\cdot ${g}^{x - 1}`, `${g}^{x}`, `\\dfrac{${g}^{x}}{\\ln ${g}}`], `(a^x)' = a^x\\ln a`],
        [`\\ln(${u})`, `\\dfrac{${a}}{${u}}`, [`\\dfrac{1}{${u}}`, `\\dfrac{1}{x}`, `${a}\\ln(${u})`, `\\dfrac{${u}}{${a}}`], `(\\ln u)' = \\dfrac{u'}{u}`],
        [`\\log_{${g}} x`, `\\dfrac{1}{x\\ln ${g}}`, [`\\dfrac{1}{x}`, `\\dfrac{\\ln ${g}}{x}`, `x\\ln ${g}`], `(\\log_a x)' = \\dfrac{1}{x\\ln a}`],
        [`\\log_{${g}}(${u})`, `\\dfrac{${a}}{(${u})\\ln ${g}}`, [`\\dfrac{1}{(${u})\\ln ${g}}`, `\\dfrac{${a}}{${u}}`, `\\dfrac{${a}\\ln ${g}}{${u}}`], `(\\log_a u)' = \\dfrac{u'}{u\\ln a}`],
      ];
      const [y, right, wr, rule] = C[v];
      return {
        stem: `Đạo hàm của hàm số $y = ${y}$ là`,
        ...mcq(r, $(`y' = ${right}`), wr.map((w) => $(`y' = ${w}`))),
        explanation: `Áp dụng công thức $${rule}$, ta được $y' = ${right}$.`,
      };
    },
  },
  {
    id: "t11k2-dh-tiep-tuyen", ...b9, topic: "Phương trình tiếp tuyến tại một điểm", level: 2, kind: "mcq",
    make: (r) => {
      const cs = [r.pick([1, -1, 2]), r.int(-3, 3), r.int(-4, 4), r.int(-5, 5)], x0 = r.int(-2, 2);
      const k = ev(der(cs), x0), y0 = ev(cs, x0), m = y0 - k * x0;
      const L = (A: number, B: number) => $(`y = ${poly([A, B])}`);
      const askM = r.chance(0.5);
      return {
        stem: `Phương trình tiếp tuyến của đồ thị hàm số $y = ${poly(cs)}$ ${askM ? `tại điểm $M(${x0};${y0})$` : `tại điểm có hoành độ $x_0 = ${x0}$`} là`,
        ...mcq(r, L(k, m), [L(k, y0), L(k, y0 + k * x0), L(y0, k), L(k, -m), L(-k, m)]),
        explanation: `$y' = ${poly(der(cs))}$, $y'(${x0}) = ${k}$${askM ? "" : `, $y(${x0}) = ${y0}$`}. Tiếp tuyến: $y = ${k}(x ${x0 < 0 ? "+" : "-"} ${Math.abs(x0)}) ${y0 < 0 ? "-" : "+"} ${Math.abs(y0)}$, tức là $y = ${poly([k, m])}$.`,
      };
    },
  },
  {
    id: "t11k2-dh-cap-hai", ...b9, topic: "Đạo hàm cấp hai", level: 1, kind: "mcq",
    make: (r) => {
      if (r.chance(0.75)) {
        const n = r.pick([3, 4]), cs = [r.nz(-3, 3), ...Array.from({ length: n }, () => r.int(-5, 5))], x0 = r.int(-2, 3);
        const d1 = der(cs), d2 = der(d1), v = ev(d2, x0);
        return {
          stem: `Cho hàm số $f(x) = ${poly(cs)}$. Giá trị của $f''(${x0})$ bằng`,
          ...mcq(r, num(v), [num(ev(d1, x0)), num(ev(cs, x0)), num(ev(der(cs.slice(0, -1)), x0)), num(v + 2 * cs[n - 2]), num(-v)]),
          explanation: `$f'(x) = ${poly(d1)}$, $f''(x) = ${poly(d2)}$. Do đó $f''(${x0}) = ${v}$.`,
        };
      }
      const k = r.int(2, 5), A = r.nz(-3, 3), isSin = r.chance(0.5);
      const f = `${coef(A)}\\${isSin ? "sin" : "cos"} ${k}x`, x0 = isSin ? `\\dfrac{\\pi}{${2 * k}}` : "0", v = -A * k * k;
      return {
        stem: `Cho hàm số $f(x) = ${f}$. Giá trị của $f''\\left(${x0}\\right)$ bằng`,
        ...mcq(r, num(v), [num(-v), num(A * k), num(-A * k), num(A * k * k * 2)]),
        explanation: `$f''(x) = -${k * k}\\cdot ${par(A)}\\${isSin ? "sin" : "cos"} ${k}x$. Tại $x = ${x0}$ thì $\\${isSin ? "sin" : "cos"} ${k}x = 1$ nên $f''\\left(${x0}\\right) = ${v}$.`,
      };
    },
  },

  /* =================================================================== HALF 2 – TF */
  {
    id: "t11k2-tf-xac-suat-doc-lap", ...b8, topic: "Quy tắc cộng, nhân xác suất với hai biến cố độc lập", level: 2, kind: "tf",
    make: (r) => {
      const a = r.int(3, 9) / 10, b = r.int(2, 9) / 10;
      const both = a * b, none = (1 - a) * (1 - b), atl = 1 - none, one = a * (1 - b) + (1 - a) * b;
      const ctx = r.pick([
        ["Hai bạn An và Bình mỗi người ném một quả bóng vào rổ một cách độc lập. Xác suất ném trúng của An là", "của Bình là", "cả hai bạn đều ném trúng", "không bạn nào ném trúng", "có ít nhất một bạn ném trúng", "có đúng một bạn ném trúng"],
        ["Hai xạ thủ bắn độc lập vào một bia, mỗi người bắn một viên. Xác suất bắn trúng của người thứ nhất là", "của người thứ hai là", "cả hai người đều bắn trúng", "cả hai người đều bắn trượt", "bia bị trúng ít nhất một viên", "bia bị trúng đúng một viên"],
        ["Một cửa hàng có hai máy pha cà phê hoạt động độc lập. Xác suất trong một ngày máy I không gặp sự cố là", "của máy II là", "cả hai máy đều không gặp sự cố", "cả hai máy đều gặp sự cố", "có ít nhất một máy không gặp sự cố", "có đúng một máy không gặp sự cố"],
      ]);
      const t = [r.chance(0.5), r.chance(0.5), r.chance(0.5), r.chance(0.5)];
      const w3 = a + b <= 1 ? a + b : a * b;
      need(Math.abs(both - none) > 1e-9 && Math.abs(none - (1 - both)) > 1e-9 && Math.abs(w3 - atl) > 1e-9 && Math.abs(one - a * (1 - b)) > 1e-9);
      return {
        stem: `${ctx[0]} $${tex(a)}$, ${ctx[1]} $${tex(b)}$.`,
        ...tf([
          [`Xác suất để ${ctx[2]} bằng $${P4(t[0] ? both : none)}$.`, t[0]],
          [`Xác suất để ${ctx[3]} bằng $${P4(t[1] ? none : 1 - both)}$.`, t[1]],
          [`Xác suất để ${ctx[4]} bằng $${P4(t[2] ? atl : w3)}$.`, t[2]],
          [`Xác suất để ${ctx[5]} bằng $${P4(t[3] ? one : a * (1 - b))}$.`, t[3]],
        ]),
        explanation: `Hai biến cố độc lập. Cả hai: $${tex(a)}\\cdot ${tex(b)} = ${P4(both)}$. Không ai: $${tex(1 - a)}\\cdot ${tex(1 - b)} = ${P4(none)}$. Ít nhất một: $1 - ${P4(none)} = ${P4(atl)}$. Đúng một: $${tex(a)}\\cdot ${tex(1 - b)} + ${tex(1 - a)}\\cdot ${tex(b)} = ${P4(one)}$.`,
      };
    },
  },
  {
    id: "t11k2-tf-dao-ham-da-thuc", ...b9, topic: "Đạo hàm cấp một, cấp hai của hàm đa thức", level: 2, kind: "tf",
    make: (r) => {
      const r1 = r.int(-3, 2), r2 = r1 + r.int(1, 4), a = r.pick([1, 1, -1, 2]), d = r.int(-5, 5);
      need((r1 + r2) % 2 === 0);
      const cs = [a, (-3 * a * (r1 + r2)) / 2, 3 * a * r1 * r2, d], d1 = der(cs), d2 = der(d1);
      const x0 = r.int(-2, 3), x1 = r.int(-2, 3), v1 = ev(d1, x0), v2 = ev(d2, x1);
      const t = [r.chance(0.5), r.chance(0.5), r.chance(0.5), r.chance(0.5)];
      const wd1 = r1 + r2 !== 0 ? poly([3 * a, cs[1], cs[2]]) : poly([a, 0, cs[2]]);
      const neg = a > 0;
      return {
        stem: `Cho hàm số $f(x) = ${poly(cs)}$.`,
        ...tf([
          [`$f'(x) = ${t[0] ? poly(d1) : wd1}$.`, t[0]],
          [`$f'(${x0}) = ${t[1] ? v1 : ev(cs, x0) !== v1 ? ev(cs, x0) : v1 + 3}$.`, t[1]],
          [`$f''(${x1}) = ${t[2] ? v2 : v2 !== d2[0] * x1 ? d2[0] * x1 : v2 + 2}$.`, t[2]],
          [`$f'(x) < 0$ khi và chỉ khi ${(t[3] ? neg : !neg) ? `$${r1} < x < ${r2}$` : `$x < ${r1}$ hoặc $x > ${r2}$`}.`, t[3]],
        ]),
        explanation: `$f'(x) = ${poly(d1)} = ${coef(3 * a)}(x ${r1 < 0 ? "+" : "-"} ${Math.abs(r1)})(x ${r2 < 0 ? "+" : "-"} ${Math.abs(r2)})$, $f'(${x0}) = ${v1}$. $f''(x) = ${poly(d2)}$, $f''(${x1}) = ${v2}$. Vì hệ số $${3 * a}$ ${neg ? "dương" : "âm"} nên $f'(x) < 0 \\Leftrightarrow ${neg ? `${r1} < x < ${r2}` : `x < ${r1}\\text{ hoặc } x > ${r2}`}$.`.replace("(x - 0)", "x").replace("(x + 0)", "x"),
      };
    },
  },
  {
    id: "t11k2-tf-chuyen-dong", ...b9, topic: "Vận tốc, gia tốc của chuyển động", level: 3, kind: "tf",
    make: (r) => {
      const p = r.int(1, 4), q = p + 2 * r.int(1, 3), al = (p + q) / 2;
      const s = [1, -3 * al, 3 * p * q, 0], v = der(s), A = der(v), T = r.int(0, q + 2);
      const aT = ev(A, T), vmin = ev(v, al);
      const t = [r.chance(0.5), r.chance(0.5), r.chance(0.5), r.chance(0.5)];
      return {
        stem: `Một vật chuyển động thẳng có phương trình $s(t) = ${poly(s, "t")}$, trong đó $t\\ge 0$ tính bằng giây và $s$ tính bằng mét.`,
        ...tf([
          [`Vận tốc của vật tại thời điểm $t$ là $v(t) = ${t[0] ? poly(v, "t") : poly([3, -3 * al, 3 * p * q], "t")}$ (m/s).`, t[0]],
          [`Vật dừng lại (vận tốc bằng $0$) lần đầu tiên tại thời điểm $t = ${t[1] ? p : q}$ giây.`, t[1]],
          [`Gia tốc của vật tại thời điểm $t = ${T}$ giây bằng $${t[2] ? aT : aT + 6}\\ \\text{m/s}^2$.`, t[2]],
          [`Tại thời điểm gia tốc bằng $0$, vận tốc của vật bằng $${t[3] ? vmin : -vmin}$ m/s.`, t[3]],
        ]),
        explanation: `$v(t) = s'(t) = ${poly(v, "t")} = 3(t - ${p})(t - ${q})$, nên vật dừng lại tại $t = ${p}$ và $t = ${q}$; lần đầu là $t = ${p}$. Gia tốc $a(t) = v'(t) = ${poly(A, "t")}$, $a(${T}) = ${aT}$. $a(t) = 0 \\Leftrightarrow t = ${al}$, khi đó $v(${al}) = ${vmin}$ m/s.`,
      };
    },
  },

  /* =================================================================== HALF 2 – SHORT */
  {
    id: "t11k2-sh-xs-it-nhat-mot-lan", ...b8, topic: "Xác suất có ít nhất một lần thành công", level: 3, kind: "short",
    make: (r) => {
      const v = r.int(0, 1), p = r.pick([0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4]);
      const ctx = r.pick([
        ["Một xạ thủ bắn", "phát súng", "bắn trúng", "lần bắn"],
        ["Một cầu thủ sút", "quả phạt đền", "sút thành công", "lần sút"],
        ["Một người gieo", "lần một con xúc xắc", "", ""],
      ]);
      const dice = ctx[2] === "", pp = dice ? 1 / 6 : p;
      const pT = dice ? "\\dfrac{1}{6}" : tex(p);
      const ev1 = dice ? "xuất hiện mặt $6$ chấm" : ctx[2];
      if (v === 0) {
        const n = r.int(3, 8), P = 1 - (1 - pp) ** n;
        need(P < 0.995);
        return {
          stem: `${ctx[0]} $${n}$ ${ctx[1]} một cách độc lập${dice ? "" : `, xác suất ${ctx[2]} ở mỗi ${ctx[3]} đều bằng $${pT}$`}. Tính xác suất để có ít nhất một lần ${ev1} (làm tròn kết quả đến hàng phần trăm).`,
          ...short(P, 2),
          explanation: `Biến cố đối: không lần nào ${ev1}, có xác suất $\\left(1 - ${pT}\\right)^{${n}}$ (quy tắc nhân cho các biến cố độc lập). Vậy $P = 1 - \\left(1 - ${pT}\\right)^{${n}}\\approx ${tex(P, 4)}$.`,
        };
      }
      const qq = r.pick([0.9, 0.95, 0.99]), x = Math.log(1 - qq) / Math.log(1 - pp), n = Math.ceil(x);
      need(n - x > 1e-6 && n <= 60);
      return {
        stem: `${dice ? "Gieo một con xúc xắc cân đối và đồng chất nhiều lần" : `${ctx[0]} nhiều ${ctx[1]} một cách độc lập, xác suất ${ctx[2]} ở mỗi ${ctx[3]} đều bằng $${pT}$`}. Cần thực hiện ít nhất bao nhiêu lần để xác suất có ít nhất một lần ${ev1} không nhỏ hơn $${tex(qq)}$?`,
        ...short(n, 0),
        explanation: `Sau $n$ lần, $P = 1 - \\left(1 - ${pT}\\right)^{n}\\ge ${tex(qq)} \\Leftrightarrow \\left(1 - ${pT}\\right)^{n}\\le ${tex(1 - qq)} \\Leftrightarrow n\\ge \\dfrac{\\ln ${tex(1 - qq)}}{\\ln\\left(1 - ${pT}\\right)}\\approx ${tex(x, 2)}$. Vậy cần ít nhất $${n}$ lần.`,
      };
    },
  },
  {
    id: "t11k2-sh-xs-cong-nhan", ...b8, topic: "Vận dụng công thức cộng, nhân xác suất", level: 3, kind: "short",
    make: (r) => {
      const v = r.int(0, 1);
      if (v === 0) {
        const N = r.int(30, 45), a = r.int(10, 25), b = r.int(8, 22), c = r.int(3, 8);
        need(c < Math.min(a, b) && a + b - c < N);
        const notAny = r.chance(0.5), P = notAny ? (N - (a + b - c)) / N : (a + b - c) / N;
        const sub = r.pick([["thích bóng đá", "thích cầu lông"], ["học giỏi môn Toán", "học giỏi môn Tiếng Anh"], ["tham gia câu lạc bộ Văn", "tham gia câu lạc bộ Võ"]]);
        return {
          stem: `Lớp 11A có $${N}$ học sinh, trong đó có $${a}$ học sinh ${sub[0]}, $${b}$ học sinh ${sub[1]} và $${c}$ học sinh ${sub[0]} và ${sub[1]}. Chọn ngẫu nhiên một học sinh của lớp. Tính xác suất để học sinh được chọn ${notAny ? `không ${sub[0]} và cũng không ${sub[1]}` : `${sub[0]} hoặc ${sub[1]}`} (làm tròn kết quả đến hàng phần trăm).`,
          ...short(P, 2),
          explanation: `Gọi $A$, $B$ là các biến cố tương ứng: $P(A) = \\dfrac{${a}}{${N}}$, $P(B) = \\dfrac{${b}}{${N}}$, $P(AB) = \\dfrac{${c}}{${N}}$. $P(A\\cup B) = \\dfrac{${a} + ${b} - ${c}}{${N}} = \\dfrac{${a + b - c}}{${N}}$.${notAny ? ` Xác suất cần tìm là $1 - P(A\\cup B) = \\dfrac{${N - a - b + c}}{${N}}$` : " Xác suất cần tìm"} $\\approx ${tex(P, 4)}$.`,
        };
      }
      const pa = r.int(2, 8), pb = r.int(2, 8), U = 100 - (10 - pa) * (10 - pb); // phần trăm
      return {
        stem: `Cho $A$ và $B$ là hai biến cố độc lập với $P(A) = ${tex(pa / 10)}$ và $P(A\\cup B) = ${tex(U / 100)}$. Tính $P(B)$.`,
        ...short(pb / 10, 2),
        explanation: `$A$, $B$ độc lập nên $P(AB) = P(A)P(B)$. Từ $P(A\\cup B) = P(A) + P(B) - P(A)P(B)$: $${tex(U / 100)} = ${tex(pa / 10)} + ${tex(1 - pa / 10)}\\cdot P(B)$, suy ra $P(B) = \\dfrac{${tex(U / 100 - pa / 10)}}{${tex(1 - pa / 10)}} = ${tex(pb / 10)}$.`,
      };
    },
  },
  {
    id: "t11k2-sh-dh-gia-tri", ...b9, topic: "Tính đạo hàm tại một điểm", level: 2, kind: "short",
    make: (r) => {
      const v = r.int(0, 3);
      if (v === 0) {
        const a = r.nz(-3, 3), b = r.int(-4, 4), n = r.int(2, 5), x0 = r.int(-2, 2), val = n * a * (a * x0 + b) ** (n - 1);
        return {
          stem: `Cho hàm số $f(x) = (${poly([a, b])})^{${n}}$. Tính $f'(${x0})$.`,
          ...short(val, 0),
          explanation: `$f'(x) = ${n}\\cdot ${par(a)}\\cdot(${poly([a, b])})^{${n - 1}}$ nên $f'(${x0}) = ${n * a}\\cdot ${par(a * x0 + b)}^{${n - 1}} = ${val}$.`,
        };
      }
      if (v === 1) {
        const x0 = r.nz(-4, 4), c = r.int(1, 12), val = x0 / Math.sqrt(x0 * x0 + c);
        return {
          stem: `Cho hàm số $f(x) = \\sqrt{x^2 + ${c}}$. Tính $f'(${x0})$ (làm tròn kết quả đến hàng phần trăm).`,
          ...short(val, 2),
          explanation: `$f'(x) = \\dfrac{2x}{2\\sqrt{x^2 + ${c}}} = \\dfrac{x}{\\sqrt{x^2 + ${c}}}$ nên $f'(${x0}) = \\dfrac{${x0}}{\\sqrt{${x0 * x0 + c}}} ${ap(val, 4)} ${tex(val, 4)}$.`,
        };
      }
      if (v === 2) {
        const a = r.nz(-4, 4), b = r.int(-5, 5), c = r.nz(-3, 3), d = r.int(-5, 5), x0 = r.int(-2, 3), D = a * d - b * c, den = c * x0 + d;
        need(D !== 0 && den !== 0);
        const val = D / (den * den);
        return {
          stem: `Cho hàm số $f(x) = \\dfrac{${poly([a, b])}}{${poly([c, d])}}$. Tính $f'(${x0})$ (làm tròn kết quả đến hàng phần trăm).`,
          ...short(val, 2),
          explanation: `$f'(x) = \\dfrac{${D}}{(${poly([c, d])})^2}$ nên $f'(${x0}) = \\dfrac{${D}}{${den * den}} ${ap(val, 4)} ${tex(val, 4)}$.`,
        };
      }
      const a = r.int(1, 4), b = r.int(1, 9), x0 = r.int(1, 3), val = (2 * a * x0) / (a * x0 * x0 + b);
      return {
        stem: `Cho hàm số $f(x) = \\ln(${poly([a, 0, b])})$. Tính $f'(${x0})$ (làm tròn kết quả đến hàng phần trăm).`,
        ...short(val, 2),
        explanation: `$f'(x) = \\dfrac{${poly([2 * a, 0])}}{${poly([a, 0, b])}}$ nên $f'(${x0}) = \\dfrac{${2 * a * x0}}{${a * x0 * x0 + b}}${Number.isInteger(val) ? ` = ${val}` : ` ${ap(val, 4)} ${tex(val, 4)}`}$.`,
      };
    },
  },
  {
    id: "t11k2-sh-tiep-tuyen", ...b9, topic: "Bài toán tiếp tuyến", level: 3, kind: "short",
    make: (r) => {
      const v = r.int(0, 2), a = r.pick([1, -1]);
      if (v < 2) {
        const cs = [a, r.int(-3, 3), r.int(-4, 4), r.int(-5, 5)], x0 = r.nz(-2, 3);
        const k = ev(der(cs), x0), y0 = ev(cs, x0), m = y0 - k * x0;
        if (v === 0) return {
          stem: `Tiếp tuyến của đồ thị hàm số $y = ${poly(cs)}$ tại điểm có hoành độ $x_0 = ${x0}$ cắt trục tung tại điểm có tung độ bằng bao nhiêu?`,
          ...short(m, 0),
          explanation: `$y'(${x0}) = ${k}$, $y(${x0}) = ${y0}$. Tiếp tuyến: $y = ${k}(${poly([1, -x0])})${term(y0)} = ${poly([k, m])}$. Cho $x = 0$ được $y = ${m}$.`,
        };
        need(k !== 0);
        const X = x0 - y0 / k;
        return {
          stem: `Tiếp tuyến của đồ thị hàm số $y = ${poly(cs)}$ tại điểm có hoành độ $x_0 = ${x0}$ cắt trục hoành tại điểm có hoành độ bằng bao nhiêu? (làm tròn kết quả đến hàng phần trăm)`,
          ...short(X, 2),
          explanation: `$y'(${x0}) = ${k}$, $y(${x0}) = ${y0}$. Tiếp tuyến: $y = ${poly([k, m])}$. Cho $y = 0$: $x = ${frac(-m, k)}${Number.isInteger(X) ? "" : ` ${ap(X, 4)} ${tex(X, 4)}`}$.`,
        };
      }
      const x1 = r.int(-2, 1), x2 = x1 + 2 * r.int(1, 2), k = r.int(-4, 6), d = r.int(-4, 4);
      const cs = [a, (-3 * a * (x1 + x2)) / 2, 3 * a * x1 * x2 + k, d], f1 = ev(cs, x1), f2 = ev(cs, x2), e = r.int(-6, 6);
      need(f1 - k * x1 !== e && f2 - k * x2 !== e);
      return {
        stem: `Cho hàm số $y = ${poly(cs)}$ có đồ thị $(C)$. Biết $(C)$ có hai tiếp tuyến song song với đường thẳng $y = ${poly([k, e])}$. Tính tổng tung độ các tiếp điểm của hai tiếp tuyến đó.`,
        ...short(f1 + f2, 0),
        explanation: `Tiếp tuyến song song với đường thẳng đã cho nên có hệ số góc $${k}$: $y' = ${poly(der(cs))} = ${k} \\Leftrightarrow ${poly(der(cs).map((c, i) => (i === 2 ? c - k : c)))} = 0 \\Leftrightarrow x = ${x1}$ hoặc $x = ${x2}$. Tung độ tiếp điểm: $y(${x1}) = ${f1}$, $y(${x2}) = ${f2}$ (hai tiếp tuyến không trùng với đường thẳng đã cho). Tổng bằng $${f1 + f2}$.`,
      };
    },
  },
  {
    id: "t11k2-sh-van-toc-gia-toc", ...b9, topic: "Ứng dụng đạo hàm: vận tốc, gia tốc, cường độ dòng điện", level: 3, kind: "short",
    make: (r) => {
      const v = r.int(0, 2);
      if (v === 0) {
        const al = r.int(2, 6), be = r.int(0, 20), Tm = r.int(al + 1, al + 6), s = [-1, 3 * al, be, 0], vmax = 3 * al * al + be;
        return {
          stem: `Một vật chuyển động theo quy luật $s(t) = ${poly(s, "t")}$, với $t$ (giây) là khoảng thời gian tính từ lúc vật bắt đầu chuyển động và $s$ (mét) là quãng đường vật đi được. Trong khoảng $${Tm}$ giây đầu tiên, vận tốc lớn nhất của vật đạt được bằng bao nhiêu mét/giây?`,
          ...short(vmax, 0),
          explanation: `$v(t) = s'(t) = ${poly(der(s), "t")}$, $a(t) = v'(t) = ${poly(der(der(s)), "t")} = 0 \\Leftrightarrow t = ${al}$. $v(t) = -3(t - ${al})^2 + ${vmax}\\le ${vmax}$, dấu bằng tại $t = ${al}\\in [0;${Tm}]$. Vậy vận tốc lớn nhất là $${vmax}$ m/s.`,
        };
      }
      if (v === 1) {
        const v0 = r.int(10, 40), t0 = r.int(1, 3), ask = r.chance(0.5);
        const val = ask ? v0 / 9.8 : v0 - 9.8 * t0;
        need(ask || val > 0);
        return {
          stem: `Một vật được ném thẳng đứng lên cao từ mặt đất, độ cao của vật (mét) sau $t$ giây là $h(t) = ${v0}t - 4{,}9t^2$. ${ask ? "Sau bao nhiêu giây thì vật đạt độ cao lớn nhất? (làm tròn kết quả đến hàng phần trăm)" : `Tính vận tốc tức thời của vật tại thời điểm $t = ${t0}$ giây (đơn vị: m/s, làm tròn kết quả đến hàng phần mười).`}`,
          ...short(val, ask ? 2 : 1),
          explanation: `Vận tốc $v(t) = h'(t) = ${v0} - 9{,}8t$. ${ask ? `Vật đạt độ cao lớn nhất khi $v(t) = 0 \\Leftrightarrow t = \\dfrac{${v0}}{9{,}8}\\approx ${tex(val, 4)}$ giây.` : `$v(${t0}) = ${v0} - 9{,}8\\cdot ${t0} = ${tex(val, 1)}$ m/s.`}`,
        };
      }
      const a = r.int(1, 5), b = r.int(1, 9), c = r.int(0, 3), t0 = r.int(1, 6), Q = [a, b, c], I = 2 * a * t0 + b;
      return {
        stem: `Điện lượng truyền trong một dây dẫn được cho bởi $Q(t) = ${poly(Q, "t")}$ ($Q$ tính bằng culông, $t$ tính bằng giây). Biết cường độ dòng điện tức thời là $I(t) = Q'(t)$. Tính cường độ dòng điện tại thời điểm $t = ${t0}$ giây (đơn vị: ampe).`,
        ...short(I, 0),
        explanation: `$I(t) = Q'(t) = ${poly(der(Q), "t")}$ nên $I(${t0}) = ${2 * a}\\cdot ${t0} + ${b} = ${I}$ A.`,
      };
    },
  },
];
