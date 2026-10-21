/* Dạng bài có tham số – Toán 10, học kì 1 (Kết nối tri thức).
   half 1: Ch.I Mệnh đề – tập hợp; Ch.II BPT, hệ BPT bậc nhất hai ẩn; Ch.III Hệ thức lượng trong tam giác.
   half 2: Ch.IV Vectơ; Ch.V Các số đặc trưng của mẫu số liệu không ghép nhóm. */
import { mcq, tf, short as shortCore, frac, vn as vnCore, need, sqrtTex, poly, term, gcd, round, Retry, type Template, type Rng } from "./core.ts";

/* vn(x, 0) của core cắt nhầm số 0 cuối của số nguyên (vn(10, 0) = "1"), nên dùng bản sửa: luôn làm tròn trước rồi định dạng với dp ≥ 1. */
const vn = (x: number, dp = 2) => vnCore(round(x, dp), Math.max(dp, 1));
const tex = (x: number, dp = 2) => vn(x, dp).replace(",", "{,}");
const short = (x: number, dp = 2) => shortCore(round(x, dp), Math.max(dp, 1));

const S = "Toán" as const, G = 10 as const;
const C1 = "Chương I. Mệnh đề và tập hợp";
const C2 = "Chương II. Bất phương trình và hệ bất phương trình bậc nhất hai ẩn";
const C3 = "Chương III. Hệ thức lượng trong tam giác";
const C4 = "Chương IV. Vectơ";
const C5 = "Chương V. Các số đặc trưng của mẫu số liệu không ghép nhóm";

/* ====================== Tiện ích chung ====================== */
const rg = (a: number, b: number) => { const o: number[] = []; for (let i = a; i <= b; i++) o.push(i); return o; };
const setT = (xs: (number | string)[]) => (xs.length ? `\\{${xs.join(";\\ ")}\\}` : "\\varnothing");
const pt = (x: number | string, y: number | string) => `(${x};\\ ${y})`;
const V = (s: string) => `\\overrightarrow{${s}}`;
const pickN = <T>(r: Rng, a: readonly T[], k: number): T[] => r.shuffle([...a]).slice(0, k);
const M = (s: string | number) => `$${s}$`;
const lin = (a: number, b: number) => `${term(a, "x", true)}${term(b, "y")}`;
const isPrime = (n: number) => { if (n < 2) return false; for (let k = 2; k * k <= n; k++) if (n % k === 0) return false; return true; };
const sd = (n: number) => { for (let k = 2; k * k <= n; k++) if (n % k === 0) return k; return n; };
const isSq = (n: number) => n >= 0 && Math.round(Math.sqrt(n)) ** 2 === n;
const DEG = Math.PI / 180;

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

/** Chọn số chữ số thập phân để đáp án trả lời ngắn ≤ 4 ký tự; kèm lời dặn làm tròn */
const ROUND = ["làm tròn kết quả đến hàng đơn vị", "làm tròn kết quả đến hàng phần mười", "làm tròn kết quả đến hàng phần trăm"];
function fit(x: number, maxDp = 2): { dp: number; note: string } {
  for (let dp = 0; dp <= maxDp; dp++) if (Math.abs(x * 10 ** dp - Math.round(x * 10 ** dp)) < 1e-9 && vn(x, dp).length <= 4) return { dp, note: "" };
  for (let dp = maxDp; dp >= 0; dp--) if (vn(x, dp).length <= 4) return { dp, note: ROUND[dp] };
  throw new Retry("fit");
}
const withNote = (note: string) => (note ? ` (${note})` : "");

/* ---------- Giá trị lượng giác góc đặc biệt: [p, q, m] nghĩa là (p/q)√m ---------- */
type R3 = [number, number, number];
const rt = (v: R3) => radTex(v[0], v[1], v[2]);
const neg3 = (v: R3): R3 => [-v[0], v[1], v[2]];
type Fn = "sin" | "cos" | "tan" | "cot";
const TRIG: Record<number, Record<Fn, R3 | null>> = {
  0: { sin: [0, 1, 1], cos: [1, 1, 1], tan: [0, 1, 1], cot: null },
  30: { sin: [1, 2, 1], cos: [1, 2, 3], tan: [1, 3, 3], cot: [1, 1, 3] },
  45: { sin: [1, 2, 2], cos: [1, 2, 2], tan: [1, 1, 1], cot: [1, 1, 1] },
  60: { sin: [1, 2, 3], cos: [1, 2, 1], tan: [1, 1, 3], cot: [1, 3, 3] },
  90: { sin: [1, 1, 1], cos: [0, 1, 1], tan: null, cot: [0, 1, 1] },
  120: { sin: [1, 2, 3], cos: [-1, 2, 1], tan: [-1, 1, 3], cot: [-1, 3, 3] },
  135: { sin: [1, 2, 2], cos: [-1, 2, 2], tan: [-1, 1, 1], cot: [-1, 1, 1] },
  150: { sin: [1, 2, 1], cos: [-1, 2, 3], tan: [-1, 3, 3], cot: [-1, 1, 3] },
  180: { sin: [0, 1, 1], cos: [-1, 1, 1], tan: [0, 1, 1], cot: null },
};
const ANG = [0, 30, 45, 60, 90, 120, 135, 150, 180];
const PYT: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41], [12, 35, 37]];

/* ---------- Tam giác: bộ ba cạnh có góc 60°/120°, tam giác Heron ---------- */
const T60: number[][] = [], T120: number[][] = [];
for (let b = 1; b <= 16; b++) for (let c = b + 1; c <= 16; c++) {
  const s1 = b * b + c * c - b * c, s2 = b * b + c * c + b * c;
  if (isSq(s1)) T60.push([b, c, Math.round(Math.sqrt(s1))]);
  if (isSq(s2)) T120.push([b, c, Math.round(Math.sqrt(s2))]);
}
const HERON: number[][] = [];
for (let a = 3; a <= 20; a++) for (let b = a; b <= 20; b++) for (let c = b; c <= 20 && c < a + b; c++) {
  const N = (a + b + c) * (-a + b + c) * (a - b + c) * (a + b - c);
  if (isSq(N) && Math.round(Math.sqrt(N)) % 4 === 0) HERON.push([a, b, c, Math.round(Math.sqrt(N)) / 4]);
}
const TRI_NAMES = [["A", "B", "C"], ["M", "N", "P"], ["D", "E", "F"], ["H", "I", "K"]];

/* ---------- Thống kê ---------- */
const sum = (a: number[]) => a.reduce((s, x) => s + x, 0);
const mean = (a: number[]) => sum(a) / a.length;
const srt = (a: number[]) => [...a].sort((x, y) => x - y);
const med = (s: number[]) => { const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
/** Tứ phân vị theo SGK KNTT: n lẻ thì không tính trung vị vào hai nửa */
const quart = (a: number[]) => { const s = srt(a), n = s.length, h = Math.floor(n / 2); return [med(s.slice(0, h)), med(s), med(s.slice(n - h))]; };
/** Cách tính "sai": n lẻ vẫn gộp trung vị vào hai nửa */
const quartAlt = (a: number[]) => { const s = srt(a), n = s.length, h = Math.ceil(n / 2); return [med(s.slice(0, h)), med(s), med(s.slice(n - h))]; };
const variance = (a: number[]) => { const m = mean(a); return sum(a.map((x) => (x - m) ** 2)) / a.length; };
const lst = (a: number[]) => a.map((x) => tex(x)).join(";\\ ");
const modeOf = (a: number[]): number | null => {
  const f = new Map<number, number>(); a.forEach((x) => f.set(x, (f.get(x) || 0) + 1));
  const mx = Math.max(...f.values()); const ms = [...f].filter(([, c]) => c === mx).map(([v]) => v);
  return ms.length === 1 && mx > 1 ? ms[0] : null;
};
const exact2 = (x: number) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-9;
const DATA_CTX = [
  { t: (n: number) => `Số bàn thắng mà một đội bóng ghi được trong $${n}$ trận đấu lần lượt là`, lo: 0, hi: 6 },
  { t: (n: number) => `Điểm kiểm tra môn Toán của $${n}$ học sinh một tổ lần lượt là`, lo: 3, hi: 10 },
  { t: (n: number) => `Nhiệt độ cao nhất (đơn vị: $^\\circ$C) của một thành phố trong $${n}$ ngày liên tiếp lần lượt là`, lo: 24, hi: 36 },
  { t: (n: number) => `Số giờ tự học trong một tuần của $${n}$ bạn học sinh lần lượt là`, lo: 3, hi: 15 },
  { t: (n: number) => `Chiều cao (đơn vị: cm) của $${n}$ cây giống trong một vườn ươm lần lượt là`, lo: 20, hi: 40 },
  { t: (n: number) => `Số cuốn sách mà $${n}$ bạn trong câu lạc bộ đọc được trong một tháng lần lượt là`, lo: 0, hi: 9 },
  { t: (n: number) => `Cân nặng (đơn vị: kg) của $${n}$ bạn học sinh lớp 10A lần lượt là`, lo: 40, hi: 60 },
  { t: (n: number) => `Số khách hàng đến một cửa hàng trong $${n}$ giờ đầu tiên mở cửa lần lượt là`, lo: 5, hi: 25 },
];
const dataOf = (r: Rng, n: number, lo: number, hi: number) => rg(1, n).map(() => r.int(lo, hi));

/* ---------- Khoảng, đoạn, nửa khoảng ---------- */
type Iv = { a: number | null; ai: boolean; b: number | null; bi: boolean };
const ivT = (v: Iv) => (v.a === null ? "(-\\infty" : (v.ai ? "[" : "(") + v.a) + ";\\ " + (v.b === null ? "+\\infty)" : v.b + (v.bi ? "]" : ")"));
function ivPair(r: Rng) {
  const a = r.int(-6, 0), c = a + r.int(1, 4), b = c + r.int(1, 4), d = b + r.int(1, 4);
  const A: Iv = { a, ai: r.chance(0.5), b, bi: r.chance(0.5) };
  const B: Iv = { a: c, ai: r.chance(0.5), b: d, bi: r.chance(0.5) };
  if (r.chance(0.25)) { A.a = null; A.ai = false; }
  if (r.chance(0.25)) { B.b = null; B.bi = false; }
  return { A, B };
}
const ivOps = (A: Iv, B: Iv) => ({
  cap: { a: B.a, ai: B.ai, b: A.b, bi: A.bi } as Iv,
  cup: { a: A.a, ai: A.ai, b: B.b, bi: B.bi } as Iv,
  amb: { a: A.a, ai: A.ai, b: B.a, bi: !B.ai } as Iv,
  bma: { a: A.b, ai: !A.bi, b: B.b, bi: B.bi } as Iv,
});
const flipL = (v: Iv): Iv | null => (v.a === null ? null : { ...v, ai: !v.ai });
const flipR = (v: Iv): Iv | null => (v.b === null ? null : { ...v, bi: !v.bi });
const flipB = (v: Iv): Iv | null => (v.a === null || v.b === null ? null : { ...v, ai: !v.ai, bi: !v.bi });
const altIv = (v: Iv) => flipL(v) || flipR(v);
const intCount = (v: Iv) => { const lo = (v.a as number) + (v.ai ? 0 : 1), hi = (v.b as number) - (v.bi ? 0 : 1); return Math.max(0, hi - lo + 1); };

/* ---------- Quy hoạch tuyến tính: miền tứ giác O, (Xi;0), (x0;y0), (0;Yi) ---------- */
function lpBuild(r: Rng, reduce = true) {
  const x0 = r.int(1, 6), y0 = r.int(1, 6);
  let a1 = r.int(1, 4), b1 = r.int(1, 4), a2 = r.int(1, 4), b2 = r.int(1, 4);
  need(a1 * b2 !== a2 * b1);
  let c1 = a1 * x0 + b1 * y0, c2 = a2 * x0 + b2 * y0;
  const X1 = c1 / a1, X2 = c2 / a2, Y1 = c1 / b1, Y2 = c2 / b2;
  need((X1 < X2 && Y1 > Y2) || (X1 > X2 && Y1 < Y2));
  const Xi = Math.min(X1, X2), Yi = Math.min(Y1, Y2), Xo = Math.max(X1, X2), Yo = Math.max(Y1, Y2);
  need([Xi, Yi, Xo, Yo].every(Number.isInteger));
  if (reduce) {
    let g = gcd(gcd(a1, b1), c1); a1 /= g; b1 /= g; c1 /= g;
    g = gcd(gcd(a2, b2), c2); a2 /= g; b2 /= g; c2 /= g;
  }
  return { x0, y0, a1, b1, c1, a2, b2, c2, Xi, Yi, Xo, Yo, V: [[0, 0], [Xi, 0], [x0, y0], [0, Yi]] as number[][] };
}

/** Thử dựng miền nghiệm nhiều lần trong một seed (tỉ lệ bộ số hợp lệ khá thấp) */
function lpTry(r: Rng, reduce = true) {
  for (let i = 0; i < 300; i++) { try { return lpBuild(r, reduce); } catch (e) { if (!(e instanceof Retry)) throw e; } }
  throw new Retry("lp");
}

/* ---------- Phân số ---------- */
type Fr = [number, number];
const fadd = (a: Fr, b: Fr): Fr => [a[0] * b[1] + b[0] * a[1], a[1] * b[1]];
const fmul = (k: number, a: Fr): Fr => [k * a[0], a[1]];
const ftex = (a: Fr) => frac(a[0], a[1]);

/* ---------- Mệnh đề: ngân hàng câu ---------- */
function propBank(r: Rng): [string, boolean, string][] {
  const n = r.int(11, 70), a = r.int(12, 99), b = r.pick([3, 4, 6, 7, 9]), x = r.int(5, 40), y = r.int(5, 40), k = r.int(1, 9), m = r.int(2, 50);
  const s = r.chance(0.5) ? x + y : x + y + r.pick([-1, 1]);
  const sq = Math.round(Math.sqrt(m));
  return [
    [`$${n}$ là số nguyên tố.`, isPrime(n), isPrime(n) ? `$${n}$ chỉ có hai ước nguyên dương là $1$ và $${n}$` : `$${n}$ chia hết cho $${sd(n)}$`],
    [`$${a}$ chia hết cho $${b}$.`, a % b === 0, `$${a} = ${b}\\cdot ${Math.floor(a / b)}${a % b ? ` + ${a % b}` : ""}$`],
    [`$${x} + ${y} = ${s}$.`, s === x + y, `$${x} + ${y} = ${x + y}$`],
    [`$\\sqrt{${m}}$ là một số hữu tỉ.`, isSq(m), isSq(m) ? `$\\sqrt{${m}} = ${sq}$` : `$${m}$ không là số chính phương nên $\\sqrt{${m}}$ là số vô tỉ`],
    [`Phương trình $x^2 + ${k} = 0$ có nghiệm thực.`, false, `$x^2 + ${k} \\ge ${k} > 0$ với mọi số thực $x$`],
    [`$${a}$ là số chẵn.`, a % 2 === 0, a % 2 ? `$${a}$ là số lẻ` : `$${a} = 2\\cdot ${a / 2}$`],
    ["Hà Nội là thủ đô của Việt Nam.", true, ""],
    ["Tổng ba góc trong một tam giác bằng $180^\\circ$.", true, ""],
    ["Mọi hình vuông đều là hình thoi.", true, "hình vuông có bốn cạnh bằng nhau"],
    ["Số $\\pi$ là một số hữu tỉ.", false, "$\\pi$ là số vô tỉ"],
    ["Mọi hình chữ nhật đều là hình vuông.", false, "hình chữ nhật có hai cạnh kề không bằng nhau thì không là hình vuông"],
    ["Tam giác đều có ba góc bằng nhau.", true, ""],
  ];
}
function nonPropBank(r: Rng): string[] {
  const a = r.int(2, 9), b = r.int(2, 20), k = r.pick([3, 5, 7]);
  return ["Hôm nay trời đẹp quá!", "Bạn đã làm bài tập về nhà chưa?", "Hãy đóng cửa sổ lại!", `$x + ${a} > ${b}$.`, `$${a}x - ${b} = 0$.`,
    "Bây giờ là mấy giờ?", `$n$ chia hết cho $${k}$.`, "Môn Toán thật là thú vị!", "Hãy giải bài tập này.", `$x^2 - ${a} \\ge 0$.`, "Bạn có thích đọc sách không?"];
}
const NEG: Record<string, string> = { ">": "\\le", "\\ge": "<", "<": "\\ge", "\\le": ">", "=": "\\ne", "\\ne": "=" };
const WRONG: Record<string, string> = { ">": "<", "\\ge": "\\le", "<": ">", "\\le": "\\ge", "=": ">", "\\ne": "<" };

/* ====================== CÁC DẠNG BÀI ====================== */
export const TEMPLATES: Template[] = [
  /* ===================== HALF 1 – MCQ ===================== */
  {
    id: "t10-menh-de-nhan-biet", subject: S, grade: G, chapter: C1, topic: "Nhận biết mệnh đề, mệnh đề đúng – sai",
    half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const props = propBank(r), non = nonPropBank(r), ask = r.int(0, 5);
      const q = (s: string) => `“${s}”`;
      if (ask >= 4) {
        let items: [string, boolean][];
        if (ask === 4) { const kP = r.int(1, 3); items = r.shuffle([...pickN(r, props, kP).map((x) => [x[0], true] as [string, boolean]), ...pickN(r, non, 4 - kP).map((x) => [x, false] as [string, boolean])]); }
        else { items = pickN(r, props, 4).map((x) => [x[0], x[1]]); }
        const k = items.filter((x) => x[1]).length;
        need(k >= 1 && k <= 3);
        const listing = items.map((x, i) => `(${i + 1}) ${x[0]}`).join("\n\n");
        return { stem: `Cho các câu sau:\n\n${listing}\n\nCó bao nhiêu câu là ${ask === 4 ? "mệnh đề" : "mệnh đề đúng"}?`,
          ...mcq(r, M(k), [0, 1, 2, 3, 4].filter((x) => x !== k).map(M)),
          explanation: `${ask === 4 ? "Các câu là mệnh đề (khẳng định có tính đúng sai xác định)" : "Các mệnh đề đúng"}: ${items.map((x, i) => (x[1] ? `(${i + 1})` : "")).filter(Boolean).join(", ")}. ${ask === 4 ? "Các câu còn lại là câu hỏi, câu cảm thán, câu cầu khiến hoặc mệnh đề chứa biến." : "Các mệnh đề còn lại sai."} Vậy có $${k}$ câu.` };
      }
      if (ask === 0) {
        const c = r.pick(props)[0];
        return { stem: "Câu nào sau đây là mệnh đề?", ...mcq(r, c, pickN(r, non, 3)),
          explanation: `${q(c)} là một khẳng định có tính đúng hoặc sai xác định nên là mệnh đề. Các câu còn lại là câu hỏi, câu cảm thán, câu cầu khiến hoặc mệnh đề chứa biến (chưa xác định được tính đúng sai) nên không phải là mệnh đề.` };
      }
      if (ask === 1) {
        const c = r.pick(non);
        return { stem: "Câu nào sau đây không phải là mệnh đề?", ...mcq(r, c, pickN(r, props, 3).map((x) => x[0])),
          explanation: `${q(c)} là câu hỏi, câu cảm thán, câu cầu khiến hoặc chứa biến nên không xác định được tính đúng sai, do đó không phải mệnh đề. Ba câu còn lại đều là mệnh đề.` };
      }
      const want = ask === 2;
      const cs = props.filter((x) => x[1] === want), ws = props.filter((x) => x[1] !== want);
      need(ws.length >= 3);
      const c = r.pick(cs);
      return { stem: `Mệnh đề nào sau đây là mệnh đề ${want ? "đúng" : "sai"}?`, ...mcq(r, c[0], pickN(r, ws, 3).map((x) => x[0])),
        explanation: `${q(c[0])} là mệnh đề ${want ? "đúng" : "sai"}${c[2] ? " vì " + c[2] : ""}. Các mệnh đề còn lại đều ${want ? "sai" : "đúng"}.` };
    },
  },
  {
    id: "t10-menh-de-phu-dinh", subject: S, grade: G, chapter: C1, topic: "Phủ định mệnh đề chứa kí hiệu ∀, ∃",
    half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const D = r.pick(["\\mathbb{R}", "\\mathbb{Z}", "\\mathbb{N}", "\\mathbb{Q}"]);
      const v = D === "\\mathbb{N}" || D === "\\mathbb{Z}" ? "n" : "x";
      const k = r.int(1, 9), a = r.nz(-5, 5), b = r.nz(-9, 9);
      const f = r.pick([`${v}^2 + ${k}`, poly([1, -k, r.int(1, 9)], v), poly([a, b], v), `${v}^2 - ${k}`, `${v}^2 - ${v}`, `${v}^3 - ${v}`]);
      const c = r.chance(0.6) ? 0 : r.int(-5, 9);
      const op = r.pick([">", "\\ge", "<", "\\le", "=", "\\ne"]);
      const Q = r.pick(["\\forall", "\\exists"]), Q2 = Q === "\\forall" ? "\\exists" : "\\forall";
      const st = (q: string, o: string) => `$${q} ${v}\\in ${D},\\ ${f} ${o} ${c}$`;
      return {
        stem: `Mệnh đề phủ định của mệnh đề “${st(Q, op)}” là`,
        ...mcq(r, st(Q2, NEG[op]), [st(Q2, op), st(Q, NEG[op]), st(Q2, WRONG[op]), st(Q, WRONG[op])]),
        explanation: `Phủ định của “$\\forall ${v}\\in X,\\ P(${v})$” là “$\\exists ${v}\\in X,\\ \\overline{P(${v})}$” và phủ định của “$\\exists ${v}\\in X,\\ P(${v})$” là “$\\forall ${v}\\in X,\\ \\overline{P(${v})}$”. Phủ định của “$${op}$” là “$${NEG[op]}$”. Vậy mệnh đề phủ định là “${st(Q2, NEG[op])}”.`,
      };
    },
  },
  {
    id: "t10-tap-hop-liet-ke", subject: S, grade: G, chapter: C1, topic: "Liệt kê phần tử của tập hợp",
    half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const tp = r.int(0, 2), nm = r.pick(["A", "B", "X", "M", "E"]);
      let desc: string, truth: number[], wrongs: number[][], why: string;
      if (tp === 0) {
        const lo = r.int(-5, 2), hi = lo + r.int(3, 6), ls = r.pick(["<", "\\le"]), hs = r.pick(["<", "\\le"]);
        const L = ls === "<" ? lo + 1 : lo, H = hs === "<" ? hi - 1 : hi, L2 = ls === "<" ? lo : lo + 1, H2 = hs === "<" ? hi : hi - 1;
        desc = `\\{x\\in\\mathbb{Z}\\mid ${lo} ${ls} x ${hs} ${hi}\\}`;
        truth = rg(L, H); wrongs = [rg(L2, H), rg(L, H2), rg(L2, H2), rg(L - 1, H + 1)];
        why = `$x$ là số nguyên thỏa mãn $${lo} ${ls} x ${hs} ${hi}$ (dấu “$<$” không lấy đầu mút, dấu “$\\le$” lấy đầu mút)`;
      } else if (tp === 1) {
        const k = r.int(2, 4), s = r.pick(["<", "\\le"]), K = s === "<" ? k - 1 : k, K2 = s === "<" ? k : k - 1;
        desc = `\\{x\\in\\mathbb{Z}\\mid |x| ${s} ${k}\\}`;
        truth = rg(-K, K); wrongs = [rg(0, K), rg(-K2, K2), rg(1, K), rg(-K, -1)];
        why = `$|x| ${s} ${k} \\Leftrightarrow -${k} ${s} x ${s} ${k}$ với $x$ nguyên`;
      } else {
        const b = r.int(3, 7), s = r.pick(["<", "\\le"]), star = r.chance(0.5), st = star ? 1 : 0, H = s === "<" ? b - 1 : b, H2 = s === "<" ? b : b - 1;
        desc = `\\{x\\in\\mathbb{N}${star ? "^*" : ""}\\mid x ${s} ${b}\\}`;
        truth = rg(st, H); wrongs = [rg(1 - st, H), rg(st, H2), rg(1 - st, H2)];
        why = `$\\mathbb{N}$ chứa số $0$ còn $\\mathbb{N}^*$ không chứa số $0$; điều kiện $x ${s} ${b}$`;
      }
      wrongs = wrongs.filter((w) => w.length > 0);
      need(truth.length >= 2 && truth.length <= 9);
      if (r.chance(0.7)) {
        return { stem: `Cho tập hợp $${nm} = ${desc}$. Liệt kê các phần tử của tập hợp $${nm}$ ta được`,
          ...mcq(r, M(`${nm} = ${setT(truth)}`), wrongs.map((w) => M(`${nm} = ${setT(w)}`))),
          explanation: `Ta có ${why}, nên $${nm} = ${setT(truth)}$.` };
      }
      const n = truth.length;
      return { stem: `Tập hợp $${nm} = ${desc}$ có bao nhiêu phần tử?`,
        ...mcq(r, M(n), [...wrongs.map((w) => M(w.length)), M(n + 1), M(n - 1), M(n + 2)]),
        explanation: `Ta có ${why}, nên $${nm} = ${setT(truth)}$ có $${n}$ phần tử.` };
    },
  },
  {
    id: "t10-tap-hop-khoang", subject: S, grade: G, chapter: C1, topic: "Giao, hợp, hiệu của các khoảng, đoạn",
    half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const { A, B } = ivPair(r), o = ivOps(A, B);
      const key = r.pick(["cap", "cup", "amb", "bma"] as const);
      const OP = { cap: "A\\cap B", cup: "A\\cup B", amb: "A\\setminus B", bma: "B\\setminus A" };
      const WHY = { cap: "gồm các số thuộc cả $A$ và $B$", cup: "gồm các số thuộc $A$ hoặc thuộc $B$", amb: "gồm các số thuộc $A$ nhưng không thuộc $B$", bma: "gồm các số thuộc $B$ nhưng không thuộc $A$" };
      const res = o[key];
      const others = (Object.keys(o) as (keyof typeof o)[]).filter((k) => k !== key).map((k) => o[k]);
      const wr = [flipL(res), flipR(res), flipB(res), ...others].filter((x): x is Iv => !!x).map((x) => M(ivT(x)));
      let note = "";
      if (key === "amb") note = ` Chú ý: $${B.a}$ ${B.ai ? "thuộc $B$ nên không thuộc" : "không thuộc $B$ nên thuộc"} $A\\setminus B$.`;
      if (key === "bma") note = ` Chú ý: $${A.b}$ ${A.bi ? "thuộc $A$ nên không thuộc" : "không thuộc $A$ nên thuộc"} $B\\setminus A$.`;
      return {
        stem: `Cho hai tập hợp $A = ${ivT(A)}$ và $B = ${ivT(B)}$. Tập hợp $${OP[key]}$ là`,
        ...mcq(r, M(ivT(res)), wr),
        explanation: `Biểu diễn hai tập hợp trên trục số: $${OP[key]}$ ${WHY[key]}, nên $${OP[key]} = ${ivT(res)}$.${note}`,
      };
    },
  },
  {
    id: "t10-tap-hop-roi-rac", subject: S, grade: G, chapter: C1, topic: "Phép toán trên tập hợp hữu hạn",
    half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const pool = r.shuffle(rg(0, 15)), nc = r.int(1, 3), na = r.int(1, 3), nb = r.int(1, 3);
      const letters = r.chance(0.3);
      const show = (xs: number[]) => setT(srt(xs).map((x) => (letters ? String.fromCharCode(97 + x) : x)));
      const com = pool.slice(0, nc), oa = pool.slice(nc, nc + na), ob = pool.slice(nc + na, nc + na + nb);
      const [X, Y] = r.pick([["A", "B"], ["X", "Y"], ["M", "N"], ["E", "F"]]);
      const res = { cap: com, cup: [...com, ...oa, ...ob], amb: oa, bma: ob };
      const OP = { cap: `${X}\\cap ${Y}`, cup: `${X}\\cup ${Y}`, amb: `${X}\\setminus ${Y}`, bma: `${Y}\\setminus ${X}` };
      const WHY = { cap: `các phần tử thuộc cả $${X}$ và $${Y}$`, cup: `các phần tử thuộc $${X}$ hoặc thuộc $${Y}$`, amb: `các phần tử thuộc $${X}$ mà không thuộc $${Y}$`, bma: `các phần tử thuộc $${Y}$ mà không thuộc $${X}$` };
      const key = r.pick(["cap", "cup", "amb", "bma"] as const);
      const wr = (Object.keys(res) as (keyof typeof res)[]).filter((k) => k !== key).map((k) => M(show(res[k])));
      return {
        stem: `Cho hai tập hợp $${X} = ${show([...com, ...oa])}$ và $${Y} = ${show([...com, ...ob])}$. Tập hợp $${OP[key]}$ là`,
        ...mcq(r, M(show(res[key])), wr),
        explanation: `$${OP[key]}$ gồm ${WHY[key]}, nên $${OP[key]} = ${show(res[key])}$.`,
      };
    },
  },
  {
    id: "t10-bpt-nghiem", subject: S, grade: G, chapter: C2, topic: "Nghiệm, miền nghiệm của BPT và hệ BPT bậc nhất hai ẩn",
    half: 1, level: 1, kind: "mcq",
    make: (r) => {
      type Q = { a: number; b: number; c: number; op: string };
      const mk = (): Q => ({ a: r.nz(-4, 4), b: r.nz(-4, 4), c: r.int(-6, 6), op: r.pick([">", "<", "\\ge", "\\le"]) });
      const sys = r.chance(0.35), I = sys ? [mk(), mk()] : [mk()];
      const val = (q: Q, x: number, y: number) => q.a * x + q.b * y + q.c;
      const ok1 = (q: Q, x: number, y: number) => { const v = val(q, x, y); return q.op === ">" ? v > 0 : q.op === "<" ? v < 0 : q.op === "\\ge" ? v >= 0 : v <= 0; };
      const ok = (p: number[]) => I.every((q) => ok1(q, p[0], p[1]));
      const pts: number[][] = []; for (let x = -3; x <= 3; x++) for (let y = -3; y <= 3; y++) pts.push([x, y]);
      const neg = r.chance(0.3);
      const good = pts.filter(ok), bad = pts.filter((p) => !ok(p));
      const [cs, ws] = neg ? [bad, good] : [good, bad];
      need(cs.length > 0 && ws.length >= 3);
      const c = r.pick(cs);
      const bnd = ws.filter((p) => I.some((q) => val(q, p[0], p[1]) === 0));
      const w = [...r.shuffle([...bnd]).slice(0, 1), ...r.shuffle([...ws])].map((p) => M(pt(p[0], p[1])));
      const E = (q: Q) => `${lin(q.a, q.b)}${term(q.c)} ${q.op} 0`;
      const body = sys ? `hệ bất phương trình $\\begin{cases}${E(I[0])}\\\\ ${E(I[1])}\\end{cases}$` : `bất phương trình $${E(I[0])}$`;
      const kind = r.chance(0.5);
      const stem = kind ? `Cặp số $(x;y)$ nào sau đây ${neg ? "không là" : "là"} một nghiệm của ${body}?` : `Điểm có tọa độ nào sau đây ${neg ? "không thuộc" : "thuộc"} miền nghiệm của ${body}?`;
      const sub = I.map((q) => { const v = val(q, c[0], c[1]); return `$${lin(q.a, q.b)}${term(q.c)} = ${v}$, ${ok1(q, c[0], c[1]) ? "thỏa mãn" : "không thỏa mãn"} $${v} ${q.op} 0$`; }).join("; ");
      return { stem, ...mcq(r, M(pt(c[0], c[1])), w),
        explanation: `Thay $x = ${c[0]},\\ y = ${c[1]}$: ${sub}. Vậy $${pt(c[0], c[1])}$ ${neg ? "không là nghiệm" : "là nghiệm"}; kiểm tra tương tự, các cặp số còn lại ${neg ? "đều là nghiệm" : "đều không là nghiệm"}${!neg && bnd.length && I.some((q) => q.op === ">" || q.op === "<") ? " (lưu ý điểm nằm trên đường thẳng bờ không thỏa mãn bất phương trình chặt)" : ""}.` };
    },
  },
  {
    id: "t10-he-bpt-gtln", subject: S, grade: G, chapter: C2, topic: "GTLN, GTNN của F = ax + by trên miền nghiệm",
    half: 1, level: 3, kind: "mcq",
    make: (r) => {
      const L = lpTry(r);
      const p = r.nz(-3, 6), q = r.nz(-3, 6);
      const F = (v: number[]) => p * v[0] + q * v[1];
      const vals = L.V.map(F), mx = Math.max(...vals), mn = Math.min(...vals);
      const fake = [[L.Xo, 0], [0, L.Yo]];
      const ask = r.int(0, 2);
      const lines = r.shuffle(["x \\ge 0", "y \\ge 0", `${lin(L.a1, L.b1)} \\le ${L.c1}`, `${lin(L.a2, L.b2)} \\le ${L.c2}`]);
      const sys = `\\begin{cases}${lines.join("\\\\ ")}\\end{cases}`;
      const Ft = lin(p, q);
      const nm = ["O", "A", "B", "C"];
      const vt = L.V.map((v, i) => `${nm[i]}${pt(v[0], v[1])}`).join(",\\ ");
      const ev = L.V.map((v, i) => `F(${nm[i]}) = ${vals[i]}`).join(",\\ ");
      const base = `Miền nghiệm của hệ là tứ giác $OABC$ với $${vt}$ ($B$ là giao điểm của hai đường thẳng $${lin(L.a1, L.b1)} = ${L.c1}$ và $${lin(L.a2, L.b2)} = ${L.c2}$). Giá trị lớn nhất, nhỏ nhất của $F$ đạt tại các đỉnh: $${ev}$.`;
      if (ask === 0) {
        need(mx > 0);
        return { stem: `Giá trị lớn nhất của biểu thức $F = ${Ft}$ trên miền nghiệm của hệ $${sys}$ là`,
          ...mcq(r, M(mx), [...fake.map(F), ...vals, mn].filter((x) => x !== mx).map(M)),
          explanation: `${base} Vậy $\\max F = ${mx}$.` };
      }
      if (ask === 1) {
        need(mn < 0);
        return { stem: `Giá trị nhỏ nhất của biểu thức $F = ${Ft}$ trên miền nghiệm của hệ $${sys}$ là`,
          ...mcq(r, M(mn), [...fake.map(F), ...vals, mx].filter((x) => x !== mn).map(M)),
          explanation: `${base} Vậy $\\min F = ${mn}$.` };
      }
      need(mx > 0 && vals.filter((x) => x === mx).length === 1);
      const best = L.V[vals.indexOf(mx)];
      return { stem: `Biểu thức $F = ${Ft}$ đạt giá trị lớn nhất trên miền nghiệm của hệ $${sys}$ tại điểm $(x;y)$ nào sau đây?`,
        ...mcq(r, M(pt(best[0], best[1])), [...fake, ...L.V].filter((v) => v !== best).map((v) => M(pt(v[0], v[1])))),
        explanation: `${base} Vậy $F$ đạt giá trị lớn nhất bằng $${mx}$ tại $${pt(best[0], best[1])}$.` };
    },
  },
  {
    id: "t10-gtlg-goc-dac-biet", subject: S, grade: G, chapter: C3, topic: "Giá trị lượng giác của góc đặc biệt (0° đến 180°)",
    half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const A = r.pick(ANG), f = r.pick(["sin", "cos", "tan", "cot"] as const);
      const v = TRIG[A][f]; need(v);
      const other = ({ sin: "cos", cos: "sin", tan: "cot", cot: "tan" } as const)[f];
      const ov = TRIG[A][other], sv = TRIG[180 - A][f];
      const w = [rt(neg3(v!)), ov ? rt(ov) : "", sv ? rt(sv) : "", ...r.shuffle(ANG.filter((x) => x !== A)).map((x) => TRIG[x][f]).filter((x): x is R3 => !!x).map(rt)];
      const stem = r.chance(0.5) ? `Giá trị của $\\${f} ${A}^\\circ$ bằng` : `Cho góc $\\alpha = ${A}^\\circ$. Giá trị của $\\${f}\\alpha$ bằng`;
      const how = A > 90
        ? `$\\${f} ${A}^\\circ = ${f === "sin" ? "" : "-"}\\${f}(180^\\circ - ${A}^\\circ) = ${f === "sin" ? "" : "-"}\\${f} ${180 - A}^\\circ = ${rt(v!)}$`
        : `Theo bảng giá trị lượng giác của các góc đặc biệt, $\\${f} ${A}^\\circ = ${rt(v!)}$`;
      return { stem, ...mcq(r, M(rt(v!)), w.filter(Boolean).map(M)),
        explanation: `${how}.${A > 90 ? " (Hai góc bù nhau có sin bằng nhau; côsin, tang, côtang đối nhau.)" : ""}` };
    },
  },
  {
    id: "t10-gtlg-he-thuc", subject: S, grade: G, chapter: C3, topic: "Hệ thức giữa các giá trị lượng giác, góc bù nhau",
    half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const a = r.pick(["\\alpha", "\\beta", "x"]);
      const T = [
        `\\sin(180^\\circ - ${a}) = \\sin ${a}`, `\\cos(180^\\circ - ${a}) = -\\cos ${a}`, `\\tan(180^\\circ - ${a}) = -\\tan ${a}`, `\\cot(180^\\circ - ${a}) = -\\cot ${a}`,
        `\\sin(90^\\circ - ${a}) = \\cos ${a}`, `\\cos(90^\\circ - ${a}) = \\sin ${a}`, `\\sin^2 ${a} + \\cos^2 ${a} = 1`, `1 + \\tan^2 ${a} = \\dfrac{1}{\\cos^2 ${a}}`,
        `1 + \\cot^2 ${a} = \\dfrac{1}{\\sin^2 ${a}}`, `\\tan ${a}\\cdot\\cot ${a} = 1`, `\\tan ${a} = \\dfrac{\\sin ${a}}{\\cos ${a}}`,
      ];
      const F = [
        `\\sin(180^\\circ - ${a}) = -\\sin ${a}`, `\\cos(180^\\circ - ${a}) = \\cos ${a}`, `\\tan(180^\\circ - ${a}) = \\tan ${a}`, `\\cot(180^\\circ - ${a}) = \\cot ${a}`,
        `\\sin(90^\\circ - ${a}) = -\\cos ${a}`, `\\sin^2 ${a} - \\cos^2 ${a} = 1`, `1 + \\tan^2 ${a} = \\dfrac{1}{\\sin^2 ${a}}`, `1 + \\cot^2 ${a} = \\dfrac{1}{\\cos^2 ${a}}`,
        `\\tan ${a}\\cdot\\cot ${a} = -1`, `\\tan ${a} = \\dfrac{\\cos ${a}}{\\sin ${a}}`, `\\sin ${a} + \\cos ${a} = 1`,
      ];
      const want = r.chance(0.6);
      if (r.chance(0.45)) {
        const t = r.int(91, 179), u = 180 - t;
        const NT = [`\\sin ${t}^\\circ = \\sin ${u}^\\circ`, `\\cos ${t}^\\circ = -\\cos ${u}^\\circ`, `\\tan ${t}^\\circ = -\\tan ${u}^\\circ`, `\\cot ${t}^\\circ = -\\cot ${u}^\\circ`, `\\sin ${u}^\\circ = \\cos ${90 - u}^\\circ`, `\\sin^2 ${t}^\\circ + \\cos^2 ${t}^\\circ = 1`, `\\cos ${t}^\\circ < 0`, `\\tan ${t}^\\circ < 0`];
        const NF = [`\\sin ${t}^\\circ = -\\sin ${u}^\\circ`, `\\cos ${t}^\\circ = \\cos ${u}^\\circ`, `\\tan ${t}^\\circ = \\tan ${u}^\\circ`, `\\cot ${t}^\\circ = \\cot ${u}^\\circ`, `\\sin ${t}^\\circ < 0`, `\\cos ${t}^\\circ > 0`, `\\sin^2 ${t}^\\circ - \\cos^2 ${t}^\\circ = 1`, `\\tan ${t}^\\circ\\cdot\\cot ${t}^\\circ = -1`];
        const [cs, ws] = want ? [NT, NF] : [NF, NT];
        return {
          stem: `Khẳng định nào sau đây về giá trị lượng giác của góc $${t}^\\circ$ là ${want ? "đúng" : "sai"}?`,
          ...mcq(r, M(r.pick(cs)), pickN(r, ws, 3).map(M)),
          explanation: `Góc $${t}^\\circ$ là góc tù và bù với góc $${u}^\\circ$ nên $\\sin ${t}^\\circ = \\sin ${u}^\\circ > 0$, $\\cos ${t}^\\circ = -\\cos ${u}^\\circ < 0$, $\\tan ${t}^\\circ = -\\tan ${u}^\\circ < 0$, $\\cot ${t}^\\circ = -\\cot ${u}^\\circ$; ngoài ra $\\sin ${u}^\\circ = \\cos ${90 - u}^\\circ$ (hai góc phụ nhau), $\\sin^2 ${t}^\\circ + \\cos^2 ${t}^\\circ = 1$ và $\\tan ${t}^\\circ\\cdot\\cot ${t}^\\circ = 1$.`,
        };
      }
      const [cs, ws] = want ? [T, F] : [F, T];
      return {
        stem: `Cho góc $${a}$ với $0^\\circ < ${a} < 180^\\circ$ (giả thiết các biểu thức đều có nghĩa). Đẳng thức nào sau đây ${want ? "đúng" : "sai"}?`,
        ...mcq(r, M(r.pick(cs)), pickN(r, ws, 3).map(M)),
        explanation: `Ghi nhớ: $\\sin(180^\\circ - ${a}) = \\sin ${a}$, $\\cos(180^\\circ - ${a}) = -\\cos ${a}$, $\\tan(180^\\circ - ${a}) = -\\tan ${a}$, $\\cot(180^\\circ - ${a}) = -\\cot ${a}$; $\\sin(90^\\circ - ${a}) = \\cos ${a}$; $\\sin^2 ${a} + \\cos^2 ${a} = 1$, $1 + \\tan^2 ${a} = \\dfrac{1}{\\cos^2 ${a}}$, $1 + \\cot^2 ${a} = \\dfrac{1}{\\sin^2 ${a}}$, $\\tan ${a}\\cdot\\cot ${a} = 1$.`,
      };
    },
  },
  {
    id: "t10-tam-giac-dinh-li-cosin", subject: S, grade: G, chapter: C3, topic: "Định lí côsin – tính cạnh, tính góc",
    half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const nm = r.pick(TRI_NAMES), tri = nm.join(""), [P, Q, R] = r.shuffle([...nm]);
      const mode = r.int(0, 2);
      if (mode < 2) {
        const b = r.int(2, 10), c = r.int(2, 10);
        let a2: number, cosT: string, sgn: number[], wr: string[];
        if (mode === 0) {
          const ang = r.pick([60, 120]); const k = ang === 60 ? -1 : 1;
          a2 = b * b + c * c + k * b * c; cosT = `\\cos ${ang}^\\circ`;
          wr = [sqrtTex(b * b + c * c - k * b * c), sqrtTex(b * b + c * c), (b * c) % 2 === 0 ? sqrtTex(b * b + c * c + (k * b * c) / 2) : "", String(a2)];
          sgn = [ang];
        } else {
          const [p, q] = r.pick([[1, 3], [2, 3], [1, 4], [3, 4], [-1, 3], [-2, 3], [-1, 4], [-3, 4], [1, 5], [2, 5], [-2, 5]]);
          need((2 * b * c * p) % q === 0);
          a2 = b * b + c * c - (2 * b * c * p) / q; cosT = frac(p, q);
          wr = [sqrtTex(b * b + c * c + (2 * b * c * p) / q), sqrtTex(b * b + c * c), (b * c * p) % q === 0 ? sqrtTex(b * b + c * c - (b * c * p) / q) : "", String(a2)];
          sgn = [p, q];
        }
        need(a2 > 0);
        const given = mode === 0 ? `\\widehat{${Q}${P}${R}} = ${sgn[0]}^\\circ` : `\\cos\\widehat{${Q}${P}${R}} = ${cosT}`;
        const cv = mode === 0 ? (sgn[0] === 60 ? "\\dfrac{1}{2}" : "\\left(-\\dfrac{1}{2}\\right)") : (sgn[0] < 0 ? `\\left(${cosT}\\right)` : cosT);
        return {
          stem: `Cho tam giác $${tri}$ có $${P}${Q} = ${c}$, $${P}${R} = ${b}$ và $${given}$. Độ dài cạnh $${Q}${R}$ bằng`,
          ...mcq(r, M(sqrtTex(a2)), wr.filter(Boolean).map(M)),
          explanation: `Theo định lí côsin: $${Q}${R}^2 = ${P}${Q}^2 + ${P}${R}^2 - 2\\cdot ${P}${Q}\\cdot ${P}${R}\\cdot\\cos\\widehat{${Q}${P}${R}} = ${c}^2 + ${b}^2 - 2\\cdot ${c}\\cdot ${b}\\cdot ${cv} = ${a2}$, nên $${Q}${R} = ${sqrtTex(a2)}$.`,
        };
      }
      const is60 = r.chance(0.5), [b, c, a] = r.pick(is60 ? T60 : T120), ang = is60 ? 60 : 120;
      const [x, y] = r.chance(0.5) ? [b, c] : [c, b];
      return {
        stem: `Cho tam giác $${tri}$ có $${P}${Q} = ${x}$, $${P}${R} = ${y}$, $${Q}${R} = ${a}$. Số đo góc $\\widehat{${Q}${P}${R}}$ bằng`,
        ...mcq(r, M(`${ang}^\\circ`), [180 - ang, is60 ? 30 : 150, is60 ? 45 : 135, is60 ? 150 : 30].map((d) => M(`${d}^\\circ`))),
        explanation: `$\\cos\\widehat{${Q}${P}${R}} = \\dfrac{${P}${Q}^2 + ${P}${R}^2 - ${Q}${R}^2}{2\\cdot ${P}${Q}\\cdot ${P}${R}} = \\dfrac{${x * x} + ${y * y} - ${a * a}}{${2 * x * y}} = ${frac(x * x + y * y - a * a, 2 * x * y)}$, nên $\\widehat{${Q}${P}${R}} = ${ang}^\\circ$.`,
      };
    },
  },
  {
    id: "t10-tam-giac-dinh-li-sin", subject: S, grade: G, chapter: C3, topic: "Định lí sin – cạnh và bán kính đường tròn ngoại tiếp",
    half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const nm = r.pick(TRI_NAMES), tri = nm.join(""), [P, Q, R] = r.shuffle([...nm]);
      const mode = r.int(0, 2);
      if (mode === 0) {
        const A = r.pick([30, 45, 60, 90, 120, 135]), B = r.pick([30, 45, 60, 90, 120, 135]);
        need(A + B < 180 && A !== B);
        const sA = TRIG[A].sin!, sB = TRIG[B].sin!, a = r.int(2, 12);
        const ok = radTex(a * sB[0] * sA[1], sB[1] * sA[0] * sA[2], sB[2] * sA[2]);
        const wr = [radTex(a * sA[0] * sB[1], sA[1] * sB[0] * sB[2], sA[2] * sB[2]), radTex(a * sB[0], sB[1], sB[2]), radTex(a * sA[1], 2 * sA[0] * sA[2], sA[2]), radTex(a * sB[1], sB[0] * sB[2], sB[2])];
        return {
          stem: `Cho tam giác $${tri}$ có $\\widehat{${P}} = ${A}^\\circ$, $\\widehat{${Q}} = ${B}^\\circ$ và $${Q}${R} = ${a}$. Độ dài cạnh $${P}${R}$ bằng`,
          ...mcq(r, M(ok), wr.map(M)),
          explanation: `Theo định lí sin: $\\dfrac{${Q}${R}}{\\sin ${P}} = \\dfrac{${P}${R}}{\\sin ${Q}}$, suy ra $${P}${R} = \\dfrac{${Q}${R}\\cdot\\sin ${B}^\\circ}{\\sin ${A}^\\circ} = \\dfrac{${a}\\cdot ${rt(sB)}}{${rt(sA)}} = ${ok}$.`,
        };
      }
      const A = r.pick([30, 45, 60, 90, 120, 135, 150]), sA = TRIG[A].sin!;
      if (mode === 1) {
        const a = r.int(2, 12);
        const ok = radTex(a * sA[1], 2 * sA[0] * sA[2], sA[2]);
        const wr = [radTex(a * sA[1], sA[0] * sA[2], sA[2]), radTex(a * sA[0], 2 * sA[1], sA[2]), radTex(2 * a * sA[0], sA[1], sA[2]), radTex(a * sA[1], 4 * sA[0] * sA[2], sA[2])];
        return {
          stem: `Cho tam giác $${tri}$ có $${Q}${R} = ${a}$ và $\\widehat{${Q}${P}${R}} = ${A}^\\circ$. Bán kính $R$ của đường tròn ngoại tiếp tam giác $${tri}$ bằng`,
          ...mcq(r, M(ok), wr.map(M)),
          explanation: `Theo định lí sin: $\\dfrac{${Q}${R}}{\\sin ${P}} = 2R$, suy ra $R = \\dfrac{${Q}${R}}{2\\sin ${A}^\\circ} = \\dfrac{${a}}{2\\cdot ${rt(sA)}} = ${ok}$.`,
        };
      }
      const Rr = r.int(2, 10);
      const ok = radTex(2 * Rr * sA[0], sA[1], sA[2]);
      const wr = [radTex(Rr * sA[0], sA[1], sA[2]), radTex(2 * Rr * sA[1], sA[0] * sA[2], sA[2]), radTex(Rr * sA[1], 2 * sA[0] * sA[2], sA[2]), String(2 * Rr)];
      return {
        stem: `Cho tam giác $${tri}$ nội tiếp đường tròn bán kính $R = ${Rr}$ và có $\\widehat{${Q}${P}${R}} = ${A}^\\circ$. Độ dài cạnh $${Q}${R}$ bằng`,
        ...mcq(r, M(ok), wr.map(M)),
        explanation: `Theo định lí sin: $${Q}${R} = 2R\\sin ${P} = 2\\cdot ${Rr}\\cdot\\sin ${A}^\\circ = 2\\cdot ${Rr}\\cdot ${rt(sA)} = ${ok}$.`,
      };
    },
  },
  {
    id: "t10-tam-giac-dien-tich", subject: S, grade: G, chapter: C3, topic: "Diện tích tam giác (công thức sin, Heron)",
    half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const nm = r.pick(TRI_NAMES), tri = nm.join(""), [P, Q, R] = r.shuffle([...nm]);
      if (r.chance(0.55)) {
        const A = r.pick([30, 60, 120, 150]), s = TRIG[A].sin!, cs = TRIG[A].cos!, b = r.int(2, 12), c = r.int(2, 12);
        const ok = radTex(b * c * s[0], 2 * s[1], s[2]);
        const wr = [radTex(b * c * s[0], s[1], s[2]), radTex(b * c * Math.abs(cs[0]), 2 * cs[1], cs[2]), radTex(b * c, 2, 1), radTex(b * c * Math.abs(cs[0]), cs[1], cs[2])];
        const land = r.chance(0.4);
        return {
          stem: land
            ? `Một mảnh vườn hình tam giác $${tri}$ có $${P}${Q} = ${c}$ m, $${P}${R} = ${b}$ m và $\\widehat{${Q}${P}${R}} = ${A}^\\circ$. Diện tích mảnh vườn (đơn vị: m²) bằng`
            : `Cho tam giác $${tri}$ có $${P}${Q} = ${c}$, $${P}${R} = ${b}$ và $\\widehat{${Q}${P}${R}} = ${A}^\\circ$. Diện tích tam giác $${tri}$ bằng`,
          ...mcq(r, M(ok), wr.map(M)),
          explanation: `$S = \\dfrac{1}{2}\\cdot ${P}${Q}\\cdot ${P}${R}\\cdot\\sin\\widehat{${Q}${P}${R}} = \\dfrac{1}{2}\\cdot ${c}\\cdot ${b}\\cdot ${rt(s)} = ${ok}$${land ? " (m²)" : ""}.`,
        };
      }
      const [a, b, c, Sa] = r.pick(HERON), p = (a + b + c) / 2;
      const [x, y, z] = r.shuffle([a, b, c]);
      return {
        stem: `Cho tam giác $${tri}$ có $${Q}${R} = ${x}$, $${P}${R} = ${y}$, $${P}${Q} = ${z}$. Diện tích tam giác $${tri}$ bằng`,
        ...mcq(r, M(Sa), [M(2 * Sa), M(frac(x * y, 2)), M(frac(Sa, 2)), M(frac(y * z, 2)), M(frac(x * z, 2))]),
        explanation: `Nửa chu vi $p = \\dfrac{${x} + ${y} + ${z}}{2} = ${p}$. Theo công thức Heron: $S = \\sqrt{p(p - ${x})(p - ${y})(p - ${z})} = \\sqrt{${p}\\cdot ${p - x}\\cdot ${p - y}\\cdot ${p - z}} = \\sqrt{${Sa * Sa}} = ${Sa}$.`,
      };
    },
  },
  {
    id: "t10-tam-giac-ban-kinh", subject: S, grade: G, chapter: C3, topic: "Bán kính đường tròn ngoại tiếp, nội tiếp tam giác",
    half: 1, level: 3, kind: "mcq",
    make: (r) => {
      const nm = r.pick(TRI_NAMES), tri = nm.join("");
      const [a, b, c, Sa] = r.pick(HERON), p = (a + b + c) / 2;
      const [x, y, z] = r.shuffle([a, b, c]);
      const Rt = frac(a * b * c, 4 * Sa), rr = frac(Sa, p);
      const pre = `Nửa chu vi $p = ${p}$, diện tích $S = \\sqrt{${p}\\cdot ${p - x}\\cdot ${p - y}\\cdot ${p - z}} = ${Sa}$.`;
      const stem0 = `Cho tam giác $${tri}$ có độ dài ba cạnh lần lượt là $${x}$, $${y}$, $${z}$.`;
      if (r.chance(0.5)) {
        return { stem: `${stem0} Bán kính $R$ của đường tròn ngoại tiếp tam giác bằng`,
          ...mcq(r, M(Rt), [M(frac(a * b * c, 2 * Sa)), M(frac(a * b * c, Sa)), M(rr), M(frac(a * b * c, 4 * p))]),
          explanation: `${pre} Do $S = \\dfrac{abc}{4R}$ nên $R = \\dfrac{abc}{4S} = \\dfrac{${x}\\cdot ${y}\\cdot ${z}}{4\\cdot ${Sa}} = ${Rt}$.` };
      }
      return { stem: `${stem0} Bán kính $r$ của đường tròn nội tiếp tam giác bằng`,
        ...mcq(r, M(rr), [M(frac(Sa, 2 * p)), M(frac(2 * Sa, p)), M(Rt), M(frac(p, Sa))]),
        explanation: `${pre} Do $S = pr$ nên $r = \\dfrac{S}{p} = \\dfrac{${Sa}}{${p}} = ${rr}$ (chú ý $p$ là nửa chu vi).` };
    },
  },

  /* ===================== HALF 1 – TF ===================== */
  {
    id: "t10-tf-tap-hop-khoang", subject: S, grade: G, chapter: C1, topic: "Các phép toán trên khoảng, đoạn (Đúng/Sai)",
    half: 1, level: 2, kind: "tf",
    make: (r) => {
      const { A, B } = ivPair(r), o = ivOps(A, B);
      const s = [r.chance(0.5), r.chance(0.5), r.chance(0.5), r.chance(0.5)];
      const show = (v: Iv, ok: boolean) => { const w = altIv(v); return ivT(ok || !w ? v : w); };
      if (!altIv(o.cup)) s[1] = true;
      const n = intCount(o.cap), nf = r.chance(0.5) ? n + 1 : Math.max(0, n - 1);
      return {
        stem: `Cho hai tập hợp $A = ${ivT(A)}$ và $B = ${ivT(B)}$. Xét tính đúng sai của các khẳng định sau.`,
        ...tf([
          [`$A\\cap B = ${show(o.cap, s[0])}$`, s[0]],
          [`$A\\cup B = ${show(o.cup, s[1])}$`, s[1]],
          [`$A\\setminus B = ${show(o.amb, s[2])}$`, s[2]],
          [`Tập hợp $A\\cap B$ có đúng $${s[3] ? n : nf}$ phần tử là số nguyên`, s[3] || nf === n],
        ]),
        explanation: `$A\\cap B = ${ivT(o.cap)}$; $A\\cup B = ${ivT(o.cup)}$; $A\\setminus B = ${ivT(o.amb)}$ (vì $${B.a}$ ${B.ai ? "thuộc" : "không thuộc"} $B$). Các số nguyên thuộc $A\\cap B$ là $${setT(rg((o.cap.a as number) + (o.cap.ai ? 0 : 1), (o.cap.b as number) - (o.cap.bi ? 0 : 1)))}$, gồm $${n}$ số.`,
      };
    },
  },
  {
    id: "t10-tf-menh-de-chua-bien", subject: S, grade: G, chapter: C1, topic: "Mệnh đề chứa biến, kéo theo, mệnh đề đảo (Đúng/Sai)",
    half: 1, level: 2, kind: "tf",
    make: (r) => {
      const [a, b] = r.pick([[6, 3], [6, 2], [4, 2], [8, 4], [9, 3], [10, 5], [12, 4], [12, 6], [12, 3], [15, 5], [15, 3], [20, 4], [20, 10], [18, 9], [18, 6], [10, 2], [14, 7], [16, 8], [16, 4], [21, 7], [24, 8], [24, 6], [30, 10], [30, 15]]);
      const k = r.chance(0.5) ? a * r.int(2, 9) : r.int(11, 99);
      const pk = k % a === 0;
      const say = r.chance(0.5), s2 = r.chance(0.5), s3 = r.int(0, 3), N = r.int(30, 100);
      const cnt = Math.floor(N / b) - Math.floor(N / a), cf = r.pick([Math.floor(N / b), cnt + 1, cnt - 1]);
      const s4 = r.chance(0.5);
      const S3: [string, boolean][] = [
        ["Mệnh đề đảo của mệnh đề “$P(n)\\Rightarrow Q(n)$” là “$Q(n)\\Rightarrow P(n)$”", true],
        ["Mệnh đề đảo của mệnh đề “$P(n)\\Rightarrow Q(n)$” là “$\\overline{P(n)}\\Rightarrow\\overline{Q(n)}$”", false],
        [`Mệnh đề “$\\forall n\\in\\mathbb{N},\\ Q(n)\\Rightarrow P(n)$” là mệnh đề đúng`, false],
        [`Mệnh đề “$\\exists n\\in\\mathbb{N},\\ Q(n)$ và $\\overline{P(n)}$” là mệnh đề đúng`, true],
      ];
      return {
        stem: `Với $n$ là số tự nhiên, xét hai mệnh đề chứa biến $P(n)$: “$n$ chia hết cho $${a}$” và $Q(n)$: “$n$ chia hết cho $${b}$”.`,
        ...tf([
          [`$P(${k})$ là mệnh đề ${say ? "đúng" : "sai"}`, say === pk],
          [s2 ? `Mệnh đề “$\\forall n\\in\\mathbb{N},\\ P(n)\\Rightarrow Q(n)$” là mệnh đề đúng` : `Mệnh đề “$\\forall n\\in\\mathbb{N},\\ Q(n)\\Rightarrow P(n)$” là mệnh đề đúng`, s2],
          S3[s3],
          [`Có đúng $${s4 ? cnt : cf}$ số tự nhiên $n$ thuộc đoạn $[1;\\ ${N}]$ thỏa mãn $Q(n)$ nhưng không thỏa mãn $P(n)$`, s4 || cf === cnt],
        ]),
        explanation: `$${k}$ ${pk ? "chia hết" : "không chia hết"} cho $${a}$ nên $P(${k})$ ${pk ? "đúng" : "sai"}. Vì $${b}$ là ước của $${a}$ nên số chia hết cho $${a}$ thì chia hết cho $${b}$: “$P(n)\\Rightarrow Q(n)$” đúng với mọi $n$; ngược lại $n = ${b}$ chia hết cho $${b}$ nhưng không chia hết cho $${a}$ nên “$Q(n)\\Rightarrow P(n)$” không đúng với mọi $n$. Mệnh đề đảo của $P\\Rightarrow Q$ là $Q\\Rightarrow P$. Trên $[1;\\ ${N}]$ có $${Math.floor(N / b)}$ số chia hết cho $${b}$, trong đó $${Math.floor(N / a)}$ số chia hết cho $${a}$, nên có $${cnt}$ số thỏa mãn $Q(n)$ mà không thỏa mãn $P(n)$.`,
      };
    },
  },
  {
    id: "t10-tf-gtlg-goc-tu", subject: S, grade: G, chapter: C3, topic: "Giá trị lượng giác của góc tù (Đúng/Sai)",
    half: 1, level: 2, kind: "tf",
    make: (r) => {
      const [p, q, z] = r.pick(PYT), [x, y] = r.chance(0.5) ? [p, q] : [q, p]; // |cos| = x/z, sin = y/z
      const giveCos = r.chance(0.5), m = r.int(1, 9), n = r.int(1, 9);
      const s = [r.chance(0.5), r.chance(0.5), r.chance(0.5), r.chance(0.5)];
      const Pv: Fr = [m * y - n * x, z], Pw: Fr = [m * y + n * x, z];
      return {
        stem: `Cho góc $\\alpha$ thỏa mãn $90^\\circ < \\alpha < 180^\\circ$ và ${giveCos ? `$\\cos\\alpha = ${frac(-x, z)}$` : `$\\sin\\alpha = ${frac(y, z)}$`}. Xét tính đúng sai của các khẳng định sau.`,
        ...tf([
          [giveCos ? `$\\sin\\alpha = ${frac(s[0] ? y : -y, z)}$` : `$\\cos\\alpha = ${frac(s[0] ? -x : x, z)}$`, s[0]],
          [`$\\tan\\alpha = ${s[1] ? frac(-y, x) : r.pick([frac(y, x), frac(-x, y)])}$`, s[1]],
          [`$\\cos(180^\\circ - \\alpha) = ${frac(s[2] ? x : -x, z)}$`, s[2]],
          [`Giá trị của biểu thức $P = ${m === 1 ? "" : m}\\sin\\alpha + ${n === 1 ? "" : n}\\cos\\alpha$ bằng $${ftex(s[3] ? Pv : Pw)}$`, s[3]],
        ]),
        explanation: `Vì $90^\\circ < \\alpha < 180^\\circ$ nên $\\sin\\alpha > 0$, $\\cos\\alpha < 0$. Từ $\\sin^2\\alpha + \\cos^2\\alpha = 1$ suy ra ${giveCos ? `$\\sin\\alpha = \\sqrt{1 - ${frac(x * x, z * z)}} = ${frac(y, z)}$` : `$\\cos\\alpha = -\\sqrt{1 - ${frac(y * y, z * z)}} = ${frac(-x, z)}$`}. $\\tan\\alpha = \\dfrac{\\sin\\alpha}{\\cos\\alpha} = ${frac(-y, x)}$; $\\cos(180^\\circ - \\alpha) = -\\cos\\alpha = ${frac(x, z)}$; $P = ${m}\\cdot ${frac(y, z)} + ${n}\\cdot\\left(${frac(-x, z)}\\right) = ${ftex(Pv)}$.`,
      };
    },
  },
  {
    id: "t10-tf-tam-giac-ba-canh", subject: S, grade: G, chapter: C3, topic: "Giải tam giác biết ba cạnh (Đúng/Sai)",
    half: 1, level: 3, kind: "tf",
    make: (r) => {
      const a = r.int(3, 12), b = r.int(3, 12), c = r.int(3, 12);
      need(a < b + c && b < a + c && c < a + b && new Set([a, b, c]).size === 3);
      const nA = b * b + c * c - a * a; need(nA !== 0);
      const N = (a + b + c) * (-a + b + c) * (a - b + c) * (a + b - c);
      const ma = 2 * b * b + 2 * c * c - a * a;
      const s = [r.chance(0.5), r.chance(0.5), r.chance(0.5), r.chance(0.5)];
      const askTu = r.chance(0.5), tu = nA < 0;
      const cosW = frac(a * a + b * b - c * c, 2 * a * b);
      need(cosW !== frac(nA, 2 * b * c));
      return {
        stem: `Cho tam giác $ABC$ có $BC = ${a}$, $CA = ${b}$, $AB = ${c}$. Xét tính đúng sai của các khẳng định sau.`,
        ...tf([
          [`$\\cos A = ${s[0] ? frac(nA, 2 * b * c) : cosW}$`, s[0]],
          [`Góc $A$ là góc ${askTu ? "tù" : "nhọn"}`, askTu === tu],
          [`Diện tích tam giác $ABC$ bằng $${s[2] ? radTex(1, 4, N) : radTex(1, 2, N)}$`, s[2]],
          [`Độ dài đường trung tuyến kẻ từ đỉnh $A$ bằng $${s[3] ? radTex(1, 2, ma) : sqrtTex(ma)}$`, s[3]],
        ]),
        explanation: `$\\cos A = \\dfrac{b^2 + c^2 - a^2}{2bc} = \\dfrac{${b * b} + ${c * c} - ${a * a}}{${2 * b * c}} = ${frac(nA, 2 * b * c)}$ ${tu ? "$< 0$ nên góc $A$ tù" : "$> 0$ nên góc $A$ nhọn"}. Nửa chu vi $p = ${tex((a + b + c) / 2)}$, $S = \\sqrt{p(p-a)(p-b)(p-c)} = \\dfrac{\\sqrt{(a+b+c)(-a+b+c)(a-b+c)(a+b-c)}}{4} = \\dfrac{\\sqrt{${N}}}{4}${radTex(1, 4, N) === `\\dfrac{\\sqrt{${N}}}{4}` ? "" : ` = ${radTex(1, 4, N)}`}$. Trung tuyến $m_a^2 = \\dfrac{2b^2 + 2c^2 - a^2}{4} = \\dfrac{${ma}}{4}$ nên $m_a = ${radTex(1, 2, ma)}$.`,
      };
    },
  },

  /* ===================== HALF 1 – SHORT ===================== */
  {
    id: "t10-short-venn", subject: S, grade: G, chapter: C1, topic: "Bài toán thực tế dùng biểu đồ Ven",
    half: 1, level: 2, kind: "short",
    make: (r) => {
      const k = r.int(2, 12), oa = r.int(3, 15), ob = r.int(3, 15), z = r.int(1, 9);
      const x = oa + k, y = ob + k, N = oa + ob + k + z;
      const C = r.pick([
        { i: `Lớp 10A có $${N}$ học sinh, trong đó có $${x}$ bạn thích bóng đá, $${y}$ bạn thích cầu lông và $${z}$ bạn không thích môn nào trong hai môn này.`, u: "học sinh", A: "bóng đá", B: "cầu lông", both: "thích cả hai môn", one: "chỉ thích đúng một môn" },
        { i: `Trong một đoàn $${N}$ du khách có $${x}$ người biết tiếng Anh, $${y}$ người biết tiếng Pháp và $${z}$ người không biết cả hai thứ tiếng này.`, u: "du khách", A: "tiếng Anh", B: "tiếng Pháp", both: "biết cả hai thứ tiếng", one: "biết đúng một trong hai thứ tiếng" },
        { i: `Khảo sát $${N}$ hộ gia đình trong một khu phố thấy có $${x}$ hộ nuôi chó, $${y}$ hộ nuôi mèo và $${z}$ hộ không nuôi con vật nào trong hai loại trên.`, u: "hộ", A: "chó", B: "mèo", both: "nuôi cả chó và mèo", one: "chỉ nuôi đúng một trong hai loại" },
        { i: `Một câu lạc bộ có $${N}$ thành viên, trong đó $${x}$ người chơi cờ vua, $${y}$ người chơi cờ tướng và $${z}$ người không chơi môn cờ nào trong hai môn đó.`, u: "thành viên", A: "cờ vua", B: "cờ tướng", both: "chơi cả hai môn cờ", one: "chỉ chơi đúng một môn cờ" },
        { i: `Kết thúc học kì, lớp 10B có $${N}$ học sinh, trong đó $${x}$ bạn đạt điểm giỏi môn Toán, $${y}$ bạn đạt điểm giỏi môn Ngữ văn và $${z}$ bạn không đạt điểm giỏi môn nào trong hai môn này.`, u: "học sinh", A: "Toán", B: "Ngữ văn", both: "giỏi cả hai môn", one: "giỏi đúng một trong hai môn" },
        { i: `Hỏi $${N}$ người về thói quen đọc tin tức, có $${x}$ người đọc báo giấy, $${y}$ người đọc báo điện tử và $${z}$ người không đọc cả hai loại báo.`, u: "người", A: "báo giấy", B: "báo điện tử", both: "đọc cả hai loại báo", one: "chỉ đọc đúng một loại báo" },
      ]);
      const ask = r.int(0, 3);
      const Q = [C.both, `chỉ có ${C.A} (không có ${C.B})`, `chỉ có ${C.B} (không có ${C.A})`, C.one];
      const ans = [k, x - k, y - k, x + y - 2 * k][ask];
      const qtext = ask === 1 || ask === 2 ? `thuộc nhóm ${ask === 1 ? C.A : C.B} nhưng không thuộc nhóm ${ask === 1 ? C.B : C.A}` : Q[ask];
      return {
        stem: `${C.i} Hỏi có bao nhiêu ${C.u} ${qtext}?`,
        ...short(ans, 0),
        explanation: `Số ${C.u} thuộc ít nhất một nhóm là $${N} - ${z} = ${N - z}$. Số ${C.u} thuộc cả hai nhóm là $${x} + ${y} - ${N - z} = ${k}$. Chỉ thuộc nhóm ${C.A}: $${x} - ${k} = ${x - k}$; chỉ thuộc nhóm ${C.B}: $${y} - ${k} = ${y - k}$; đúng một nhóm: $${x - k} + ${y - k} = ${x + y - 2 * k}$. Đáp số: $${ans}$.`,
      };
    },
  },
  {
    id: "t10-short-tap-hop-tham-so", subject: S, grade: G, chapter: C1, topic: "Tập con, giao khác rỗng có tham số",
    half: 1, level: 3, kind: "short",
    make: (r) => {
      const k = r.int(1, 5), p = r.int(-8, 0), q = p + k + r.int(2, 10);
      if (r.chance(0.5)) {
        const Al = r.chance(0.5), Ar = r.chance(0.5), Bl = r.chance(0.5), Br = r.chance(0.5);
        const A = `${Al ? "[" : "("}m;\\ m + ${k}${Ar ? "]" : ")"}`, B = `${Bl ? "[" : "("}${p};\\ ${q}${Br ? "]" : ")"}`;
        const ls = Al && !Bl, hs = Ar && !Br;
        const lo = ls ? p + 1 : p, hi = hs ? q - k - 1 : q - k, cnt = hi - lo + 1;
        need(cnt >= 1);
        return {
          stem: `Cho hai tập hợp $A = ${A}$ và $B = ${B}$. Có bao nhiêu số nguyên $m$ để $A\\subset B$?`,
          ...short(cnt, 0),
          explanation: `$A\\subset B \\Leftrightarrow \\begin{cases} m ${ls ? ">" : "\\ge"} ${p}\\\\ m + ${k} ${hs ? "<" : "\\le"} ${q}\\end{cases} \\Leftrightarrow ${lo} \\le m \\le ${hi}$ (với $m$ nguyên). Có $${hi} - (${lo}) + 1 = ${cnt}$ số nguyên $m$.`,
        };
      }
      const Mx = r.pick([5, 8, 10]), empty = r.chance(0.4);
      const lo = Math.max(p - k + 1, -Mx), hi = Math.min(q - 1, Mx), cnt = Math.max(0, hi - lo + 1), ans = empty ? 2 * Mx + 1 - cnt : cnt;
      need(cnt >= 1 && ans >= 1);
      return {
        stem: `Cho hai tập hợp $A = [m;\\ m + ${k}]$ và $B = (${p};\\ ${q})$. Có bao nhiêu số nguyên $m$ thuộc đoạn $[-${Mx};\\ ${Mx}]$ để $A\\cap B ${empty ? "= \\varnothing" : "\\ne \\varnothing"}$?`,
        ...short(ans, 0),
        explanation: `$A\\cap B \\ne\\varnothing \\Leftrightarrow \\begin{cases} m < ${q}\\\\ m + ${k} > ${p}\\end{cases} \\Leftrightarrow ${p - k} < m < ${q}$. Kết hợp $m\\in[-${Mx};\\ ${Mx}]$, $m$ nguyên: $${lo} \\le m \\le ${hi}$, có $${cnt}$ số.${empty ? ` Do đó số giá trị để $A\\cap B = \\varnothing$ là $${2 * Mx + 1} - ${cnt} = ${ans}$.` : ""}`,
      };
    },
  },
  {
    id: "t10-short-qhtt-thuc-te", subject: S, grade: G, chapter: C2, topic: "Bài toán tối ưu thực tế (hệ BPT bậc nhất hai ẩn)",
    half: 1, level: 3, kind: "short",
    make: (r) => {
      let L: ReturnType<typeof lpBuild> | null = null, p = 0, q = 0;
      for (let i = 0; i < 400 && !L; i++) {
        try {
          const T = lpBuild(r, false); p = r.int(1, 9); q = r.int(1, 9);
          const vv = T.V.map((v) => p * v[0] + q * v[1]);
          if (vv.every((v, j) => j === 2 || v < vv[2])) L = T;
        } catch (e) { if (!(e instanceof Retry)) throw e; }
      }
      need(L); L = L!;
      const F = (v: number[]) => p * v[0] + q * v[1], vals = L.V.map(F), best = vals[2];
      const { a1, b1, c1, a2, b2, c2 } = L;
      const C = r.pick([
        { s: `Một xưởng sản xuất hai loại sản phẩm I và II. Để sản xuất mỗi tấn sản phẩm I cần $${a1}$ tấn nguyên liệu và $${a2}$ giờ máy, lãi $${p}$ triệu đồng; mỗi tấn sản phẩm II cần $${b1}$ tấn nguyên liệu và $${b2}$ giờ máy, lãi $${q}$ triệu đồng. Xưởng có tối đa $${c1}$ tấn nguyên liệu và $${c2}$ giờ máy.`, x: "số tấn sản phẩm I", y: "số tấn sản phẩm II", u: "triệu đồng" },
        { s: `Một tiệm bánh làm hai loại bánh A và B. Mỗi mẻ bánh A cần $${a1}$ kg bột và $${a2}$ kg đường, lãi $${p}$ trăm nghìn đồng; mỗi mẻ bánh B cần $${b1}$ kg bột và $${b2}$ kg đường, lãi $${q}$ trăm nghìn đồng. Tiệm có $${c1}$ kg bột và $${c2}$ kg đường.`, x: "số mẻ bánh A", y: "số mẻ bánh B", u: "trăm nghìn đồng" },
        { s: `Một hộ nông dân định trồng ngô và đậu. Mỗi sào ngô cần $${a1}$ ngày công và $${a2}$ triệu đồng vốn, lãi $${p}$ triệu đồng; mỗi sào đậu cần $${b1}$ ngày công và $${b2}$ triệu đồng vốn, lãi $${q}$ triệu đồng. Gia đình có tối đa $${c1}$ ngày công và $${c2}$ triệu đồng vốn.`, x: "số sào ngô", y: "số sào đậu", u: "triệu đồng" },
        { s: `Một xưởng mộc làm bàn và ghế. Mỗi chiếc bàn cần $${a1}$ giờ cắt gỗ và $${a2}$ giờ lắp ráp, lãi $${p}$ trăm nghìn đồng; mỗi chiếc ghế cần $${b1}$ giờ cắt gỗ và $${b2}$ giờ lắp ráp, lãi $${q}$ trăm nghìn đồng. Mỗi ngày xưởng có tối đa $${c1}$ giờ cắt gỗ và $${c2}$ giờ lắp ráp.`, x: "số bàn", y: "số ghế", u: "trăm nghìn đồng" },
        { s: `Một nhà máy trộn hai loại thức ăn chăn nuôi X và Y. Mỗi tấn loại X cần $${a1}$ tấn ngô và $${a2}$ tấn đậu tương, lãi $${p}$ triệu đồng; mỗi tấn loại Y cần $${b1}$ tấn ngô và $${b2}$ tấn đậu tương, lãi $${q}$ triệu đồng. Kho có $${c1}$ tấn ngô và $${c2}$ tấn đậu tương.`, x: "số tấn loại X", y: "số tấn loại Y", u: "triệu đồng" },
      ]);
      const nm = ["O", "A", "B", "C"];
      return {
        stem: `${C.s} Hỏi tiền lãi lớn nhất có thể thu được là bao nhiêu ${C.u}?`,
        ...short(best, 0),
        explanation: `Gọi $x$ là ${C.x}, $y$ là ${C.y} ($x, y \\ge 0$). Điều kiện: $${lin(a1, b1)} \\le ${c1}$, $${lin(a2, b2)} \\le ${c2}$. Tiền lãi $F = ${lin(p, q)}$. Miền nghiệm là tứ giác có các đỉnh $${L.V.map((v, i) => nm[i] + pt(v[0], v[1])).join(",\\ ")}$; $${L.V.map((v, i) => `F(${nm[i]}) = ${vals[i]}`).join(",\\ ")}$. Lãi lớn nhất là $${best}$ ${C.u} khi $x = ${L.x0},\\ y = ${L.y0}$.`,
      };
    },
  },
  {
    id: "t10-short-gtlg-bieu-thuc", subject: S, grade: G, chapter: C3, topic: "Tính giá trị biểu thức lượng giác của góc tù",
    half: 1, level: 3, kind: "short",
    make: (r) => {
      const [p0, q0, z] = r.pick(PYT), [x, y] = r.chance(0.5) ? [p0, q0] : [q0, p0];
      const m = r.int(1, 15), n = r.int(1, 15), e = r.int(0, 3), giveCos = r.chance(0.6);
      const sn: Fr = [y, z], cs: Fr = [-x, z], tn: Fr = [-y, x], ct: Fr = [-x, y];
      const E = [
        { t: `${m}\\sin\\alpha + ${n}\\cos\\alpha`, v: fadd(fmul(m, sn), fmul(n, cs)) },
        { t: `${m}\\sin\\alpha - ${n}\\tan\\alpha`, v: fadd(fmul(m, sn), fmul(-n, tn)) },
        { t: `${m}\\cos\\alpha + ${n}\\cot\\alpha`, v: fadd(fmul(m, cs), fmul(n, ct)) },
        { t: `${m}\\tan\\alpha + ${n}\\cot\\alpha`, v: fadd(fmul(m, tn), fmul(n, ct)) },
      ][e];
      const val = E.v[0] / E.v[1], f = fit(val);
      return {
        stem: `Cho góc $\\alpha$ thỏa mãn $90^\\circ < \\alpha < 180^\\circ$ và ${giveCos ? `$\\cos\\alpha = ${frac(-x, z)}$` : `$\\sin\\alpha = ${frac(y, z)}$`}. Tính giá trị của biểu thức $P = ${E.t}$${withNote(f.note)}.`,
        ...short(val, f.dp),
        explanation: `Vì $90^\\circ < \\alpha < 180^\\circ$ nên $\\sin\\alpha > 0$, $\\cos\\alpha < 0$; từ $\\sin^2\\alpha + \\cos^2\\alpha = 1$ ta được $\\sin\\alpha = ${frac(y, z)}$, $\\cos\\alpha = ${frac(-x, z)}$, $\\tan\\alpha = ${frac(-y, x)}$, $\\cot\\alpha = ${frac(-x, y)}$. Do đó $P = ${ftex(E.v)}${f.note ? ` \\approx ${tex(val, f.dp)}` : ""}$.`,
      };
    },
  },
  {
    id: "t10-short-khoang-cach-cosin", subject: S, grade: G, chapter: C3, topic: "Ứng dụng định lí côsin: khoảng cách thực tế",
    half: 1, level: 3, kind: "short",
    make: (r) => {
      const th = r.pick([30, 40, 45, 50, 60, 70, 75, 80, 100, 110, 120, 135, 150]);
      const cos = Math.cos(th * DEG);
      if (r.chance(0.6)) {
        const v1 = r.int(4, 40), v2 = r.int(4, 40), t = r.pick([0.5, 1, 1.5, 2, 2.5, 3]);
        need(v1 !== v2);
        const a = v1 * t, b = v2 * t, d = Math.sqrt(a * a + b * b - 2 * a * b * cos);
        const f = fit(d, 1);
        const C = r.pick([
          `Hai tàu thủy cùng xuất phát từ cảng $O$ và đi thẳng theo hai hướng tạo với nhau một góc $${th}^\\circ$. Tàu thứ nhất chạy với tốc độ $${v1}$ km/h, tàu thứ hai chạy với tốc độ $${v2}$ km/h.`,
          `Hai bạn cùng xuất phát từ ngã ba $O$, đi xe đạp trên hai con đường thẳng tạo với nhau một góc $${th}^\\circ$ với tốc độ lần lượt là $${v1}$ km/h và $${v2}$ km/h.`,
          `Hai thiết bị bay không người lái cùng cất cánh từ điểm $O$, bay thẳng ở cùng độ cao theo hai hướng hợp với nhau một góc $${th}^\\circ$ với tốc độ lần lượt là $${v1}$ km/h và $${v2}$ km/h.`,
        ]);
        return {
          stem: `${C} Hỏi sau $${tex(t)}$ giờ, khoảng cách giữa chúng là bao nhiêu kilômét${withNote(f.note)}?`,
          ...short(d, f.dp),
          explanation: `Sau $${tex(t)}$ giờ, quãng đường đi được là $OA = ${tex(v1)}\\cdot ${tex(t)} = ${tex(a)}$ km và $OB = ${tex(v2)}\\cdot ${tex(t)} = ${tex(b)}$ km. Theo định lí côsin: $AB^2 = OA^2 + OB^2 - 2\\cdot OA\\cdot OB\\cdot\\cos ${th}^\\circ \\approx ${tex(d * d, 2)}$, nên $AB \\approx ${tex(d, f.dp)}$ km.`,
        };
      }
      const a = r.int(20, 90) * 10, b = r.int(20, 90) * 10, d = Math.sqrt(a * a + b * b - 2 * a * b * cos);
      const f = fit(d, 0);
      const obj = r.pick(["một hồ nước", "một đầm lầy", "một ngọn đồi", "một khu rừng"]);
      return {
        stem: `Để đo khoảng cách giữa hai điểm $A$ và $B$ ở hai phía của ${obj}, người ta chọn một điểm $C$ và đo được $CA = ${a}$ m, $CB = ${b}$ m, $\\widehat{ACB} = ${th}^\\circ$. Tính khoảng cách $AB$ (đơn vị: mét${f.note ? ", " + f.note : ""}).`,
        ...short(d, f.dp),
        explanation: `Theo định lí côsin: $AB^2 = CA^2 + CB^2 - 2\\cdot CA\\cdot CB\\cdot\\cos ${th}^\\circ = ${a * a} + ${b * b} - 2\\cdot ${a}\\cdot ${b}\\cdot\\cos ${th}^\\circ \\approx ${tex(d * d, 0)}$, nên $AB \\approx ${tex(d, f.dp)}$ m.`,
      };
    },
  },
  {
    id: "t10-short-do-chieu-cao-sin", subject: S, grade: G, chapter: C3, topic: "Ứng dụng định lí sin: đo chiều cao, khoảng cách",
    half: 1, level: 3, kind: "short",
    make: (r) => {
      if (r.chance(0.5)) {
        const al = r.int(20, 50), be = al + r.int(10, 30), d = r.int(10, 40);
        need(be <= 75);
        const BC = (d * Math.sin(al * DEG)) / Math.sin((be - al) * DEG), h = BC * Math.sin(be * DEG);
        need(h < 100);
        const obj = r.pick(["một tòa tháp", "một cột cờ", "một cây cổ thụ", "một tòa nhà", "một cột ăng-ten"]);
        return {
          stem: `Từ điểm $A$ trên mặt đất, một người nhìn đỉnh $C$ của ${obj} với góc nâng $${al}^\\circ$. Người đó đi thêm $${d}$ m thẳng về phía chân $H$ của ${obj.replace("một ", "")} đến điểm $B$ thì nhìn đỉnh $C$ với góc nâng $${be}^\\circ$. Bỏ qua chiều cao của người quan sát. Tính chiều cao $CH$ (đơn vị: mét, làm tròn đến hàng phần mười).`,
          ...short(h, 1),
          explanation: `Trong tam giác $ABC$: $\\widehat{CAB} = ${al}^\\circ$, $\\widehat{ABC} = 180^\\circ - ${be}^\\circ$ nên $\\widehat{ACB} = ${be}^\\circ - ${al}^\\circ = ${be - al}^\\circ$. Theo định lí sin: $BC = \\dfrac{AB\\sin ${al}^\\circ}{\\sin ${be - al}^\\circ} \\approx ${tex(BC, 2)}$ m. Trong tam giác vuông $BHC$: $CH = BC\\sin ${be}^\\circ \\approx ${tex(h, 1)}$ m.`,
        };
      }
      const al = r.int(35, 80), be = r.int(35, 80), d = r.int(5, 40) * 10;
      const C = 180 - al - be, AC = (d * Math.sin(be * DEG)) / Math.sin(C * DEG), h = AC * Math.sin(al * DEG);
      const askH = r.chance(0.5), ans = askH ? h : AC, f = fit(ans, 1);
      const ctx = r.pick([
        { s: `Để đo khoảng cách từ vị trí $A$ trên bờ sông đến một cái cây $C$ ở bờ bên kia, người ta chọn điểm $B$ cùng bờ với $A$ sao cho $AB = ${d}$ m và đo được $\\widehat{CAB} = ${al}^\\circ$, $\\widehat{CBA} = ${be}^\\circ$.`, h: "khoảng cách từ cây $C$ đến đường thẳng $AB$ (bờ sông)" },
        { s: `Hai trạm quan sát $A$ và $B$ trên bờ biển cách nhau $${d}$ m cùng nhìn thấy một con thuyền $C$. Biết $\\widehat{CAB} = ${al}^\\circ$ và $\\widehat{CBA} = ${be}^\\circ$.`, h: "khoảng cách từ con thuyền $C$ đến đường thẳng $AB$" },
        { s: `Từ hai điểm $A$ và $B$ trên một con đường thẳng cách nhau $${d}$ m, người ta nhìn thấy một ngọn hải đăng $C$ trên đảo với $\\widehat{CAB} = ${al}^\\circ$ và $\\widehat{CBA} = ${be}^\\circ$.`, h: "khoảng cách từ ngọn hải đăng $C$ đến con đường" },
      ]);
      return {
        stem: `${ctx.s} Tính ${askH ? ctx.h : "khoảng cách $AC$"} (đơn vị: mét${f.note ? ", " + f.note : ""}).`,
        ...short(ans, f.dp),
        explanation: `$\\widehat{ACB} = 180^\\circ - ${al}^\\circ - ${be}^\\circ = ${C}^\\circ$. Theo định lí sin: $AC = \\dfrac{AB\\sin ${be}^\\circ}{\\sin ${C}^\\circ} \\approx ${tex(AC, 2)}$ m.${askH ? ` Khoảng cách cần tìm là $AC\\sin ${al}^\\circ \\approx ${tex(h, f.dp)}$ m.` : ""}`,
      };
    },
  },

  /* ===================== HALF 2 – MCQ ===================== */
  {
    id: "t10-vecto-hinh-binh-hanh", subject: S, grade: G, chapter: C4, topic: "Tổng, hiệu vectơ trong hình bình hành",
    half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const nm = r.pick(["ABCD", "MNPQ", "EFGH", "PQRS"]), [A, B, C, D] = nm.split(""), O = nm === "MNPQ" || nm === "PQRS" ? "I" : "O";
      const shape = r.pick(["hình bình hành", "hình chữ nhật", "hình thoi", "hình vuông"]);
      const v = (x: string, y: string) => V(x + y);
      const T = [
        `${v(A, B)} = ${v(D, C)}`, `${v(A, D)} = ${v(B, C)}`, `${v(A, B)} + ${v(A, D)} = ${v(A, C)}`, `${v(B, A)} + ${v(B, C)} = ${v(B, D)}`,
        `${v(A, B)} - ${v(A, D)} = ${v(D, B)}`, `${v(C, B)} + ${v(C, D)} = ${v(C, A)}`, `${v(O, A)} + ${v(O, C)} = \\vec{0}`, `${v(A, B)} + ${v(C, D)} = \\vec{0}`, `${v(A, C)} - ${v(A, B)} = ${v(A, D)}`,
      ];
      const F: [string, string][] = [
        [`${v(A, B)} = ${v(C, D)}`, `${v(A, B)} = ${v(D, C)}`], [`${v(A, D)} = ${v(C, B)}`, `${v(A, D)} = ${v(B, C)}`], [`${v(A, B)} + ${v(A, D)} = ${v(B, D)}`, `${v(A, B)} + ${v(A, D)} = ${v(A, C)}`],
        [`${v(A, B)} - ${v(A, D)} = ${v(B, D)}`, `${v(A, B)} - ${v(A, D)} = ${v(D, B)}`], [`${v(B, A)} + ${v(B, C)} = ${v(A, C)}`, `${v(B, A)} + ${v(B, C)} = ${v(B, D)}`],
        [`${v(C, B)} + ${v(C, D)} = ${v(A, C)}`, `${v(C, B)} + ${v(C, D)} = ${v(C, A)}`], [`${v(A, B)} + ${v(B, C)} = ${v(C, A)}`, `${v(A, B)} + ${v(B, C)} = ${v(A, C)}`], [`${v(O, A)} = ${v(O, C)}`, `${v(O, A)} = -${v(O, C)}`],
      ];
      const want = r.chance(0.6);
      const stem = `Cho ${shape} $${nm}$ có tâm $${O}$. Đẳng thức nào sau đây ${want ? "đúng" : "sai"}?`;
      if (want) {
        const c = r.pick(T), w = pickN(r, F, 3);
        return { stem, ...mcq(r, M(c), w.map((x) => M(x[0]))),
          explanation: `${shape === "hình bình hành" ? "" : `Mọi ${shape} đều là hình bình hành. `}Đẳng thức đúng: $${c}$ (dựa vào quy tắc hình bình hành $${v(A, B)} + ${v(A, D)} = ${v(A, C)}$, quy tắc hiệu, hai vectơ bằng nhau $${v(A, B)} = ${v(D, C)}$ và $${O}$ là trung điểm hai đường chéo). Các đẳng thức còn lại sai, chẳng hạn ${w.map((x) => `$${x[1]}$`).join("; ")}.` };
      }
      const c = r.pick(F);
      return { stem, ...mcq(r, M(c[0]), pickN(r, T, 3).map(M)),
        explanation: `Đẳng thức $${c[0]}$ sai; đúng phải là $${c[1]}$. Các đẳng thức còn lại đều đúng theo quy tắc hình bình hành, quy tắc ba điểm, quy tắc hiệu.` };
    },
  },
  {
    id: "t10-vecto-trung-diem-trong-tam", subject: S, grade: G, chapter: C4, topic: "Tích vectơ với một số: trung điểm, trọng tâm",
    half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const want = r.chance(0.6);
      let T: string[], F: [string, string][], stem0: string;
      if (r.chance(0.5)) {
        const [A, B] = r.pick([["A", "B"], ["M", "N"], ["P", "Q"], ["C", "D"]]), I = r.pick(["I", "K"]), Mp = r.pick(["O", "E"]);
        T = [`${V(I + A)} + ${V(I + B)} = \\vec{0}`, `${V(A + I)} = ${V(I + B)}`, `${V(Mp + A)} + ${V(Mp + B)} = 2${V(Mp + I)}`, `${V(A + B)} = 2${V(A + I)}`, `${V(A + B)} = 2${V(I + B)}`, `${V(I + A)} = -${V(I + B)}`];
        F = [[`${V(A + I)} = ${V(B + I)}`, `${V(A + I)} = -${V(B + I)}`], [`${V(I + A)} = ${V(I + B)}`, `${V(I + A)} = -${V(I + B)}`], [`${V(Mp + A)} + ${V(Mp + B)} = ${V(Mp + I)}`, `${V(Mp + A)} + ${V(Mp + B)} = 2${V(Mp + I)}`],
          [`${V(A + B)} = 2${V(B + I)}`, `${V(A + B)} = 2${V(I + B)}`], [`${V(I + A)} + ${V(I + B)} = ${V(A + B)}`, `${V(I + A)} + ${V(I + B)} = \\vec{0}`], [`${V(A + B)} = 2${V(I + A)}`, `${V(A + B)} = 2${V(A + I)}`]];
        stem0 = `Cho $${I}$ là trung điểm của đoạn thẳng $${A}${B}$ và $${Mp}$ là một điểm bất kì.`;
      } else {
        const Gn = "G", Mn = r.pick(["M", "N"]), O = r.pick(["O", "K"]);
        T = [`${V("GA")} + ${V("GB")} + ${V("GC")} = \\vec{0}`, `${V("A" + Gn)} = \\dfrac{2}{3}${V("A" + Mn)}`, `${V(Gn + Mn)} = \\dfrac{1}{3}${V("A" + Mn)}`, `${V(O + "A")} + ${V(O + "B")} + ${V(O + "C")} = 3${V(O + Gn)}`, `${V("GA")} = -2${V(Gn + Mn)}`, `${V("A" + Mn)} = 3${V(Gn + Mn)}`];
        F = [[`${V("A" + Gn)} = \\dfrac{1}{2}${V("A" + Mn)}`, `${V("A" + Gn)} = \\dfrac{2}{3}${V("A" + Mn)}`], [`${V("GA")} + ${V("GB")} = ${V("GC")}`, `${V("GA")} + ${V("GB")} = -${V("GC")}`],
          [`${V(O + "A")} + ${V(O + "B")} + ${V(O + "C")} = ${V(O + Gn)}`, `${V(O + "A")} + ${V(O + "B")} + ${V(O + "C")} = 3${V(O + Gn)}`], [`${V("A" + Gn)} = \\dfrac{2}{3}${V(Mn + "A")}`, `${V("A" + Gn)} = -\\dfrac{2}{3}${V(Mn + "A")}`],
          [`${V("GA")} = 2${V(Gn + Mn)}`, `${V("GA")} = -2${V(Gn + Mn)}`], [`${V("A" + Mn)} = 2${V("A" + Gn)}`, `${V("A" + Mn)} = \\dfrac{3}{2}${V("A" + Gn)}`]];
        stem0 = `Cho tam giác $ABC$ có trọng tâm $G$, $${Mn}$ là trung điểm của cạnh $BC$ và $${O}$ là một điểm bất kì.`;
      }
      const stem = `${stem0} Khẳng định nào sau đây ${want ? "đúng" : "sai"}?`;
      if (want) {
        const c = r.pick(T), w = pickN(r, F, 3);
        return { stem, ...mcq(r, M(c), w.map((x) => M(x[0]))), explanation: `Khẳng định đúng: $${c}$. Các khẳng định còn lại sai, sửa lại cho đúng: ${w.map((x) => `$${x[1]}$`).join("; ")}.` };
      }
      const c = r.pick(F);
      return { stem, ...mcq(r, M(c[0]), pickN(r, T, 3).map(M)), explanation: `Khẳng định $${c[0]}$ sai; đúng phải là $${c[1]}$. Các khẳng định còn lại đều đúng.` };
    },
  },
  {
    id: "t10-vecto-do-dai", subject: S, grade: G, chapter: C4, topic: "Độ dài vectơ tổng, hiệu trong hình quen thuộc",
    half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const a = r.int(2, 10), k = r.int(1, 4), [p3, p4, p5] = r.pick([[3, 4, 5], [5, 12, 13], [8, 6, 10]]);
      const sc = r.int(0, 7);
      const SQ = `Cho hình vuông $ABCD$ cạnh $${a}$.`, EQ = `Cho tam giác đều $ABC$ cạnh $${a}$.`, RC = `Cho hình chữ nhật $ABCD$ có $AB = ${p3 * k}$, $AD = ${p4 * k}$.`;
      const L = [
        { s: SQ, e: `${V("AB")} + ${V("AD")}`, ok: radTex(a, 1, 2), w: [2 * a, a, radTex(a, 2, 2)], x: `$${V("AB")} + ${V("AD")} = ${V("AC")}$ nên độ dài bằng $AC = ${radTex(a, 1, 2)}$` },
        { s: SQ, e: `${V("AB")} - ${V("AD")}`, ok: radTex(a, 1, 2), w: [0, a, 2 * a], x: `$${V("AB")} - ${V("AD")} = ${V("DB")}$ nên độ dài bằng $DB = ${radTex(a, 1, 2)}$` },
        { s: SQ, e: `${V("AB")} + ${V("AC")}`, ok: radTex(a, 1, 5), w: [`${a} + ${radTex(a, 1, 2)}`, radTex(a, 2, 5), radTex(a, 1, 3)], x: `Gọi $M$ là trung điểm $BC$: $${V("AB")} + ${V("AC")} = 2${V("AM")}$, $AM = \\sqrt{AB^2 + BM^2} = ${radTex(a, 2, 5)}$, nên độ dài bằng $${radTex(a, 1, 5)}$` },
        { s: EQ, e: `${V("AB")} + ${V("AC")}`, ok: radTex(a, 1, 3), w: [2 * a, radTex(a, 2, 3), a], x: `Gọi $M$ là trung điểm $BC$: $${V("AB")} + ${V("AC")} = 2${V("AM")}$, $AM = ${radTex(a, 2, 3)}$ nên độ dài bằng $${radTex(a, 1, 3)}$` },
        { s: EQ, e: `${V("AB")} - ${V("AC")}`, ok: String(a), w: [0, radTex(a, 1, 3), 2 * a], x: `$${V("AB")} - ${V("AC")} = ${V("CB")}$ nên độ dài bằng $CB = ${a}$` },
        { s: EQ, e: `${V("AB")} + ${V("BC")}`, ok: String(a), w: [2 * a, radTex(a, 1, 3), 0], x: `$${V("AB")} + ${V("BC")} = ${V("AC")}$ nên độ dài bằng $AC = ${a}$` },
        { s: RC, e: `${V("AB")} + ${V("AD")}`, ok: String(p5 * k), w: [(p3 + p4) * k, Math.abs(p4 - p3) * k, radTex(p5 * k, 2, 1)], x: `$${V("AB")} + ${V("AD")} = ${V("AC")}$, $AC = \\sqrt{${p3 * k}^2 + ${p4 * k}^2} = ${p5 * k}$` },
        { s: RC, e: `${V("AB")} - ${V("AD")}`, ok: String(p5 * k), w: [Math.abs(p4 - p3) * k, (p3 + p4) * k, 0], x: `$${V("AB")} - ${V("AD")} = ${V("DB")}$, $DB = \\sqrt{${p3 * k}^2 + ${p4 * k}^2} = ${p5 * k}$` },
      ][sc];
      return { stem: `${L.s} Độ dài của vectơ $${L.e}$ bằng`, ...mcq(r, M(L.ok), L.w.map((x) => M(x))), explanation: `${L.x}. (Chú ý không cộng, trừ trực tiếp độ dài hai vectơ.)` };
    },
  },
  {
    id: "t10-vecto-toa-do-phep-toan", subject: S, grade: G, chapter: C4, topic: "Tọa độ vectơ, trung điểm, trọng tâm",
    half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const md = r.int(0, 4);
      const c = () => r.int(-6, 6);
      if (md === 0) {
        const x1 = r.nz(-5, 5), y1 = r.nz(-5, 5), x2 = r.nz(-5, 5), y2 = r.nz(-5, 5), m = r.nz(-3, 3), n = r.nz(-3, 3);
        const ok = pt(m * x1 + n * x2, m * y1 + n * y2);
        const e = `${m === 1 ? "" : m === -1 ? "-" : m}\\vec{a}${n > 0 ? " + " : " - "}${Math.abs(n) === 1 ? "" : Math.abs(n)}\\vec{b}`;
        return { stem: `Trong mặt phẳng tọa độ $Oxy$, cho $\\vec{a} = ${pt(x1, y1)}$ và $\\vec{b} = ${pt(x2, y2)}$. Tọa độ của vectơ $\\vec{u} = ${e}$ là`,
          ...mcq(r, M(ok), [pt(m * x1 - n * x2, m * y1 - n * y2), pt(m * x1 + n * x2, m * y1 - n * y2), pt(m * x1 + n * y1, m * x2 + n * y2), pt(m * x1 - n * x2, m * y1 + n * y2)].map(M)),
          explanation: `$\\vec{u} = ${pt(`${m}\\cdot(${x1}) + (${n})\\cdot(${x2})`, `${m}\\cdot(${y1}) + (${n})\\cdot(${y2})`)} = ${ok}$.` };
      }
      const A = [c(), c()], B = [c(), c()], C = [c(), c()];
      need(A[0] !== B[0] || A[1] !== B[1]);
      const sA = `A${pt(A[0], A[1])}`, sB = `B${pt(B[0], B[1])}`, sC = `C${pt(C[0], C[1])}`;
      const fp = (x: number, q: number, y: number) => pt(frac(x, q), frac(y, q));
      if (md === 1) {
        const ok = pt(B[0] - A[0], B[1] - A[1]);
        return { stem: `Trong mặt phẳng tọa độ $Oxy$, cho hai điểm $${sA}$ và $${sB}$. Tọa độ của vectơ $${V("AB")}$ là`,
          ...mcq(r, M(ok), [pt(A[0] - B[0], A[1] - B[1]), pt(A[0] + B[0], A[1] + B[1]), fp(A[0] + B[0], 2, A[1] + B[1]), pt(B[0] - A[1], B[1] - A[0])].map(M)),
          explanation: `$${V("AB")} = (x_B - x_A;\\ y_B - y_A) = ${ok}$.` };
      }
      if (md === 2) {
        const ok = fp(A[0] + B[0], 2, A[1] + B[1]);
        return { stem: `Trong mặt phẳng tọa độ $Oxy$, cho hai điểm $${sA}$ và $${sB}$. Tọa độ trung điểm $I$ của đoạn thẳng $AB$ là`,
          ...mcq(r, M(ok), [fp(B[0] - A[0], 2, B[1] - A[1]), pt(A[0] + B[0], A[1] + B[1]), pt(B[0] - A[0], B[1] - A[1]), fp(A[0] - B[0], 2, A[1] - B[1])].map(M)),
          explanation: `$x_I = \\dfrac{x_A + x_B}{2} = ${frac(A[0] + B[0], 2)}$, $y_I = \\dfrac{y_A + y_B}{2} = ${frac(A[1] + B[1], 2)}$. Vậy $I${ok}$.` };
      }
      need((A[0] - B[0]) * (C[1] - B[1]) !== (A[1] - B[1]) * (C[0] - B[0]));
      const sx = A[0] + B[0] + C[0], sy = A[1] + B[1] + C[1];
      if (md === 3) {
        need(sx % 3 === 0 && sy % 3 === 0);
        const ok = pt(sx / 3, sy / 3);
        return { stem: `Trong mặt phẳng tọa độ $Oxy$, cho tam giác $ABC$ với $${sA}$, $${sB}$, $${sC}$. Tọa độ trọng tâm $G$ của tam giác $ABC$ là`,
          ...mcq(r, M(ok), [pt(sx, sy), fp(sx, 2, sy), pt(-sx / 3, -sy / 3), fp(B[0] + C[0], 2, B[1] + C[1])].map(M)),
          explanation: `$x_G = \\dfrac{x_A + x_B + x_C}{3} = \\dfrac{${sx}}{3} = ${sx / 3}$, $y_G = \\dfrac{${sy}}{3} = ${sy / 3}$. Vậy $G${ok}$.` };
      }
      const ok = pt(A[0] + C[0] - B[0], A[1] + C[1] - B[1]);
      return { stem: `Trong mặt phẳng tọa độ $Oxy$, cho ba điểm $${sA}$, $${sB}$, $${sC}$. Tọa độ điểm $D$ để $ABCD$ là hình bình hành là`,
        ...mcq(r, M(ok), [pt(B[0] + C[0] - A[0], B[1] + C[1] - A[1]), pt(A[0] + B[0] - C[0], A[1] + B[1] - C[1]), fp(A[0] + C[0], 2, A[1] + C[1])].map(M)),
        explanation: `$ABCD$ là hình bình hành $\\Leftrightarrow ${V("AD")} = ${V("BC")} = ${pt(C[0] - B[0], C[1] - B[1])}$, suy ra $D = ${pt(`${A[0]} + (${C[0] - B[0]})`, `${A[1]} + (${C[1] - B[1]})`)} = ${ok}$.` };
    },
  },
  {
    id: "t10-vecto-tich-vo-huong-toa-do", subject: S, grade: G, chapter: C4, topic: "Tích vô hướng theo tọa độ, góc giữa hai vectơ",
    half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const md = r.int(0, 3);
      const x1 = r.nz(-5, 5), y1 = r.nz(-5, 5), x2 = r.nz(-5, 5), y2 = r.nz(-5, 5);
      const dot = x1 * x2 + y1 * y2, ab = `$\\vec{a} = ${pt(x1, y1)}$ và $\\vec{b} = ${pt(x2, y2)}$`;
      if (md === 0) {
        return { stem: `Trong mặt phẳng tọa độ $Oxy$, cho ${ab}. Tích vô hướng $\\vec{a}\\cdot\\vec{b}$ bằng`,
          ...mcq(r, M(dot), [x1 * x2 - y1 * y2, x1 * y2 + x2 * y1, x1 * y1 + x2 * y2, x1 * y2 - x2 * y1, -dot].map(M)),
          explanation: `$\\vec{a}\\cdot\\vec{b} = x_1x_2 + y_1y_2 = (${x1})\\cdot(${x2}) + (${y1})\\cdot(${y2}) = ${dot}$.` };
      }
      const La = x1 * x1 + y1 * y1, Lb = x2 * x2 + y2 * y2;
      if (md === 1) {
        need(dot !== 0);
        const ok = radTex(dot, La * Lb, La * Lb);
        return { stem: `Trong mặt phẳng tọa độ $Oxy$, cho ${ab}. Giá trị của $\\cos(\\vec{a},\\vec{b})$ bằng`,
          ...mcq(r, M(ok), [radTex(-dot, La * Lb, La * Lb), radTex(x1 * y2 - x2 * y1, La * Lb, La * Lb), frac(dot, La + Lb), radTex(dot, 1, 1)].map(M)),
          explanation: `$\\vec{a}\\cdot\\vec{b} = ${dot}$, $|\\vec{a}| = \\sqrt{${La}}$, $|\\vec{b}| = \\sqrt{${Lb}}$. Do đó $\\cos(\\vec{a},\\vec{b}) = \\dfrac{${dot}}{\\sqrt{${La}}\\cdot\\sqrt{${Lb}}} = ${ok}$.` };
      }
      if (md === 2) {
        need(Math.abs(y1 * y2) % Math.abs(x2) === 0);
        const m = -(y1 * y2) / x2;
        return { stem: `Trong mặt phẳng tọa độ $Oxy$, cho $\\vec{a} = ${pt("m", y1)}$ và $\\vec{b} = ${pt(x2, y2)}$. Giá trị của $m$ để $\\vec{a}\\perp\\vec{b}$ là`,
          ...mcq(r, M(`m = ${m}`), [-m, (y1 * x2) / y2, (x2 * y2) / y1, m + 1].filter((x) => Number.isInteger(x)).map((x) => M(`m = ${x}`))),
          explanation: `$\\vec{a}\\perp\\vec{b} \\Leftrightarrow \\vec{a}\\cdot\\vec{b} = 0 \\Leftrightarrow ${x2}m ${y1 * y2 < 0 ? "-" : "+"} ${Math.abs(y1 * y2)} = 0 \\Leftrightarrow m = ${m}$.` };
      }
      for (let i = 0; i < 300; i++) {
        const u = [r.nz(-5, 5), r.int(-5, 5)], w = [r.int(-5, 5), r.nz(-5, 5)];
        const d = u[0] * w[0] + u[1] * w[1], A2 = u[0] ** 2 + u[1] ** 2, B2 = w[0] ** 2 + w[1] ** 2;
        const ang = Math.round((Math.acos(d / Math.sqrt(A2 * B2)) * 180) / Math.PI);
        if (![45, 90, 135].includes(ang) || Math.abs(Math.cos(ang * DEG) - d / Math.sqrt(A2 * B2)) > 1e-9) continue;
        return { stem: `Trong mặt phẳng tọa độ $Oxy$, cho $\\vec{a} = ${pt(u[0], u[1])}$ và $\\vec{b} = ${pt(w[0], w[1])}$. Góc giữa hai vectơ $\\vec{a}$ và $\\vec{b}$ bằng`,
          ...mcq(r, M(`${ang}^\\circ`), (ang === 90 ? [45, 135, 0, 60] : [180 - ang, 90, ang === 45 ? 60 : 120, ang === 45 ? 30 : 150]).map((x) => M(`${x}^\\circ`))),
          explanation: `$\\vec{a}\\cdot\\vec{b} = ${d}$, $|\\vec{a}| = \\sqrt{${A2}}$, $|\\vec{b}| = \\sqrt{${B2}}$, nên $\\cos(\\vec{a},\\vec{b}) = \\dfrac{${d}}{\\sqrt{${A2 * B2}}} = ${radTex(d, A2 * B2, A2 * B2)}$. Vậy góc giữa hai vectơ bằng $${ang}^\\circ$.` };
      }
      throw new Retry();
    },
  },
  {
    id: "t10-vecto-tich-vo-huong-hinh", subject: S, grade: G, chapter: C4, topic: "Tích vô hướng trong tam giác đều, hình vuông",
    half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const sym = r.chance(0.35), a = r.int(2, 10);
      const kT = (p: number, q: number, m: number) => {
        if (!sym) return radTex(p * a * a, q, m);
        if (p === 0) return "0";
        const g = gcd(p, q); p /= g; q /= g;
        const sg = p < 0 ? "-" : "", nu = (Math.abs(p) === 1 ? "" : Math.abs(p)) + "a^2" + (m > 1 ? `\\sqrt{${m}}` : "");
        return q === 1 ? sg + nu : `${sg}\\dfrac{${nu}}{${q}}`;
      };
      const eq = r.chance(0.5), sd0 = sym ? "a" : String(a);
      type It = [string, number, number, string];
      const EQ: It[] = [
        [`${V("AB")}\\cdot ${V("AC")}`, 1, 2, `AB\\cdot AC\\cdot\\cos 60^\\circ`], [`${V("AB")}\\cdot ${V("BC")}`, -1, 2, `AB\\cdot BC\\cdot\\cos 120^\\circ`],
        [`${V("BA")}\\cdot ${V("BC")}`, 1, 2, `BA\\cdot BC\\cdot\\cos 60^\\circ`], [`${V("CA")}\\cdot ${V("CB")}`, 1, 2, `CA\\cdot CB\\cdot\\cos 60^\\circ`],
        [`${V("AB")}\\cdot ${V("CA")}`, -1, 2, `AB\\cdot CA\\cdot\\cos 120^\\circ`], [`${V("AM")}\\cdot ${V("BC")}`, 0, 1, `0 \\text{ (vì } AM\\perp BC)`],
        [`${V("AB")}\\cdot ${V("AM")}`, 3, 4, `AB\\cdot AM\\cdot\\cos 30^\\circ = ${sd0}\\cdot\\dfrac{${sd0}\\sqrt{3}}{2}\\cdot\\dfrac{\\sqrt{3}}{2}`],
      ];
      const SQ: It[] = [
        [`${V("AB")}\\cdot ${V("AC")}`, 1, 1, `AB\\cdot AC\\cdot\\cos 45^\\circ = ${sd0}\\cdot ${sd0}\\sqrt{2}\\cdot\\dfrac{\\sqrt{2}}{2}`], [`${V("AB")}\\cdot ${V("AD")}`, 0, 1, `0 \\text{ (vì } AB\\perp AD)`],
        [`${V("AC")}\\cdot ${V("BD")}`, 0, 1, `0 \\text{ (hai đường chéo vuông góc)}`], [`${V("AB")}\\cdot ${V("CD")}`, -1, 1, `AB\\cdot CD\\cdot\\cos 180^\\circ`],
        [`${V("AB")}\\cdot ${V("BD")}`, -1, 1, `AB\\cdot BD\\cdot\\cos 135^\\circ = ${sd0}\\cdot ${sd0}\\sqrt{2}\\cdot\\left(-\\dfrac{\\sqrt{2}}{2}\\right)`],
        [`${V("AO")}\\cdot ${V("AB")}`, 1, 2, `AO\\cdot AB\\cdot\\cos 45^\\circ = \\dfrac{${sd0}\\sqrt{2}}{2}\\cdot ${sd0}\\cdot\\dfrac{\\sqrt{2}}{2}`], [`${V("AC")}\\cdot ${V("AC")}`, 2, 1, `AC^2 = (${sd0}\\sqrt{2})^2`],
        [`${V("OA")}\\cdot ${V("OB")}`, 0, 1, `0 \\text{ (vì } OA\\perp OB)`],
      ];
      const [e, p, q, how] = r.pick(eq ? EQ : SQ);
      const rad = eq ? 3 : 2;
      const w = p === 0 ? [kT(1, 1, 1), kT(1, 2, 1), kT(-1, 1, 1), kT(1, 2, 3)] : [kT(-p, q, 1), kT(p, q, rad), kT(2 * p, q, 1), kT(p, 2 * q, 1), kT(-p, q, rad)];
      return {
        stem: eq ? `Cho tam giác đều $ABC$ cạnh ${M(sd0)}, $M$ là trung điểm của $BC$. Tích vô hướng $${e}$ bằng` : `Cho hình vuông $ABCD$ cạnh ${M(sd0)}, tâm $O$. Tích vô hướng $${e}$ bằng`,
        ...mcq(r, M(kT(p, q, 1)), w.map(M)),
        explanation: `$${e} = ${how} = ${kT(p, q, 1)}$. (Chú ý góc giữa hai vectơ phải xét khi hai vectơ chung điểm đầu.)`,
      };
    },
  },
  {
    id: "t10-so-gan-dung-quy-tron", subject: S, grade: G, chapter: C5, topic: "Số gần đúng, quy tròn số",
    half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const decT = (q: number, k: number) => { if (k <= 0) return String(q * 10 ** -k); const s = String(q).padStart(k + 1, "0"); return `${s.slice(0, -k)}{,}${s.slice(-k)}`; };
      const PL: Record<number, string> = { [-5]: "trăm nghìn", [-4]: "chục nghìn", [-3]: "nghìn", [-2]: "trăm", [-1]: "chục", 0: "đơn vị", 1: "phần mười", 2: "phần trăm", 3: "phần nghìn" };
      if (r.chance(0.55)) {
        const src = r.int(0, 2);
        let N: number, Dd: number, name: string, shown: string;
        if (src === 1) {
          const n = r.pick([2, 3, 5, 6, 7, 8, 10, 11, 13, 15, 17, 19]); Dd = 7; N = Math.floor(Math.sqrt(n) * 1e7);
          name = `\\sqrt{${n}}`; shown = `Biết $\\sqrt{${n}} = ${decT(N, 7)}\\ldots$`;
        } else if (src === 2) {
          Dd = 7; N = 31415926; name = "\\pi"; shown = `Biết $\\pi = 3{,}1415926\\ldots$`;
        } else {
          Dd = r.int(5, 6); const ip = r.int(1, 99); const ds = rg(1, Dd).map(() => r.int(0, 9)); ds[Dd - 1] = r.int(1, 9);
          const k0 = r.int(1, 3); ds[k0] = r.chance(0.6) ? r.int(5, 9) : r.int(0, 4);
          N = ip * 10 ** Dd + Number(ds.join("")); name = "a"; shown = `Cho số $a = ${decT(N, Dd)}$.`;
        }
        const k = r.int(1, 3);
        const rnd = (kk: number) => { const P = 10 ** (Dd - kk); return Math.floor(N / P) + (N % P >= P / 2 ? 1 : 0); };
        const ok = rnd(k), trunc = Math.floor(N / 10 ** (Dd - k)), nextD = Math.floor(N / 10 ** (Dd - k - 1)) % 10;
        return {
          stem: `${shown} Số quy tròn của $${name}$ đến hàng ${PL[k]} là`,
          ...mcq(r, M(decT(ok, k)), [ok === trunc ? trunc + 1 : trunc].map((x) => M(decT(x, k))).concat([M(decT(rnd(k + 1), k + 1)), M(decT(rnd(k - 1), k - 1)), M(decT(rnd(k + 2), k + 2))])),
          explanation: `Chữ số ngay sau hàng ${PL[k]} là $${nextD}$ ${nextD >= 5 ? "$\\ge 5$ nên cộng thêm $1$ vào chữ số hàng làm tròn" : "$< 5$ nên giữ nguyên chữ số hàng làm tròn"} và bỏ các chữ số phía sau. Vậy số quy tròn là $${decT(ok, k)}$.`,
        };
      }
      const big = r.chance(0.5);
      let A: number, Dd: number, d: number;
      if (big) { Dd = 0; A = r.int(100000, 9999999); d = r.pick([3, 5, 8, 20, 30, 50, 80, 200, 300, 500, 2000, 3000]); }
      else { Dd = 4; A = r.int(10000, 999999); if (A % 10 === 0) A += r.int(1, 9); d = r.pick([1, 2, 3, 5, 10, 20, 30, 50]); }
      const j = String(d).length, P = 10 ** j, k = Dd - j;
      const rd = (pp: number) => Math.round(A / pp);
      const ok = rd(P);
      const dShow = big ? String(d) : tex(d / 10 ** Dd, Dd);
      const ctx = big ? r.pick([`Số dân của một tỉnh được ước lượng là $${A} \\pm ${d}$ người.`, `Kết quả đo chiều dài một con đê là $${A} \\pm ${d}$ (mm).`, `Cho số gần đúng $a = ${A}$ với độ chính xác $d = ${d}$.`])
        : r.pick([`Cho số gần đúng $a = ${decT(A, Dd)}$ với độ chính xác $d = ${dShow}$.`, `Một học sinh đo được độ dài một đoạn thẳng là $${decT(A, Dd)} \\pm ${dShow}$ (cm).`]);
      return {
        stem: `${ctx} Số quy tròn của số gần đúng đó là`,
        ...mcq(r, M(decT(ok, k)), [M(decT(rd(P / 10), k + 1)), M(decT(Math.floor(A / P), k)), M(decT(rd(P * 10), k - 1)), M(decT(ok + 1, k))]),
        explanation: `Vì độ chính xác $d = ${dShow}$ nhỏ hơn $1$ đơn vị của hàng ${PL[k]} nên ta quy tròn số gần đúng đến hàng ${PL[k]}, được $${decT(ok, k)}$.`,
      };
    },
  },
  {
    id: "t10-thong-ke-trung-vi", subject: S, grade: G, chapter: C5, topic: "Trung vị, số trung bình của mẫu số liệu",
    half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const C = r.pick(DATA_CTX), n = r.int(7, 10), d = dataOf(r, n, C.lo, C.hi), s = srt(d);
      const md = med(s), mu = mean(d);
      const askMean = r.chance(0.35);
      if (askMean) {
        need(exact2(mu));
        return { stem: `${C.t(n)}: $${lst(d)}$. Số trung bình của mẫu số liệu trên là`,
          ...mcq(r, M(tex(mu)), [sum(d) / (n - 1), md, (s[0] + s[n - 1]) / 2, sum(d) / (n + 1)].filter(exact2).map((x) => M(tex(x)))),
          explanation: `$\\bar{x} = \\dfrac{${d.join(" + ")}}{${n}} = \\dfrac{${sum(d)}}{${n}} = ${tex(mu)}$.` };
      }
      const um = n % 2 ? d[(n - 1) / 2] : (d[n / 2 - 1] + d[n / 2]) / 2;
      const cand = [um, n % 2 ? s[(n + 1) / 2] : s[n / 2], n % 2 ? s[(n - 3) / 2] : s[n / 2 - 1], exact2(mu) ? mu : NaN, modeOf(d) ?? NaN, s[n - 1] - s[0]].filter((x) => Number.isFinite(x));
      return {
        stem: `${C.t(n)}: $${lst(d)}$. Trung vị của mẫu số liệu trên là`,
        ...mcq(r, M(tex(md)), cand.map((x) => M(tex(x)))),
        explanation: `Sắp xếp theo thứ tự không giảm: $${lst(s)}$. Có $${n}$ giá trị nên trung vị là ${n % 2 ? `giá trị thứ $${(n + 1) / 2}$, bằng $${tex(md)}$` : `trung bình cộng của giá trị thứ $${n / 2}$ và thứ $${n / 2 + 1}$: $M_e = \\dfrac{${s[n / 2 - 1]} + ${s[n / 2]}}{2} = ${tex(md)}$`} (phải sắp xếp trước khi tìm giá trị ở giữa).`,
      };
    },
  },
  {
    id: "t10-thong-ke-bang-tan-so", subject: S, grade: G, chapter: C5, topic: "Mốt, số trung bình từ bảng tần số",
    half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const C = r.pick([
        { h: "Điểm", f: "Số học sinh", x: () => { const b = r.int(4, 6); return rg(b, b + 4); } },
        { h: "Cỡ giày", f: "Số đôi bán được", x: () => { const b = r.int(35, 38); return rg(b, b + 4); } },
        { h: "Số con", f: "Số gia đình", x: () => rg(0, 4) },
        { h: "Số lỗi chính tả", f: "Số bài viết", x: () => rg(0, 4) },
        { h: "Thời gian (phút)", f: "Số học sinh", x: () => [15, 20, 25, 30, 35] },
        { h: "Số cuộc gọi", f: "Số ngày", x: () => { const b = r.int(2, 6); return rg(b, b + 4); } },
      ]);
      const xs = C.x(), fs = xs.map(() => r.int(1, 12));
      const N = sum(fs), mx = Math.max(...fs);
      need(fs.filter((f) => f === mx).length === 1);
      const mo = xs[fs.indexOf(mx)];
      const tbl = `$\\begin{array}{|c|${xs.map(() => "c|").join("")}}\\hline \\text{${C.h}} & ${xs.join(" & ")} \\\\ \\hline \\text{${C.f}} & ${fs.join(" & ")} \\\\ \\hline\\end{array}$`;
      const all: number[] = []; xs.forEach((x, i) => { for (let k = 0; k < fs[i]; k++) all.push(x); });
      const SX = sum(xs.map((x, i) => x * fs[i]));
      if (r.chance(0.5)) {
        const f2 = srt(fs)[3];
        return { stem: `Cho bảng tần số sau:\n\n${tbl}\n\nMốt của mẫu số liệu là`,
          ...mcq(r, M(mo), [mx, xs[fs.indexOf(f2)], xs[4], med(srt(all)), N].map((x) => M(tex(x)))),
          explanation: `Giá trị $${mo}$ có tần số lớn nhất ($${mx}$) nên mốt $M_o = ${mo}$ (mốt là giá trị, không phải tần số).` };
      }
      const mu = SX / N, f = exact2(mu) ? "" : " (làm tròn đến hàng phần trăm)";
      return { stem: `Cho bảng tần số sau:\n\n${tbl}\n\nSố trung bình của mẫu số liệu${f} là`,
        ...mcq(r, M(tex(mu)), [sum(xs) / 5, SX / 5, med(srt(all)), mo].map((x) => M(tex(x)))),
        explanation: `Cỡ mẫu $n = ${fs.join(" + ")} = ${N}$. $\\bar{x} = \\dfrac{${xs.map((x, i) => `${x}\\cdot ${fs[i]}`).join(" + ")}}{${N}} = \\dfrac{${SX}}{${N}} ${f ? "\\approx" : "="} ${tex(mu)}$.` };
    },
  },
  {
    id: "t10-thong-ke-phuong-sai", subject: S, grade: G, chapter: C5, topic: "Phương sai, độ lệch chuẩn",
    half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const C = r.pick(DATA_CTX), n = r.int(5, 8), m = r.int(C.lo + 2, C.hi - 2);
      const d = dataOf(r, n - 1, C.lo, C.hi); const last = n * m - sum(d);
      need(last >= C.lo && last <= C.hi); d.push(last); r.shuffle(d);
      const Sq = sum(d.map((x) => (x - m) ** 2)); need(Sq > 0);
      const dev = `\\dfrac{${d.map((x) => `(${x} - ${m})^2`).join(" + ")}}{${n}}`;
      if (r.chance(0.5)) {
        return { stem: `${C.t(n)}: $${lst(d)}$. Phương sai của mẫu số liệu trên bằng`,
          ...mcq(r, M(frac(Sq, n)), [frac(Sq, n - 1), radTex(1, n, Sq * n), String(Sq), frac(Sq, n * n)].map(M)),
          explanation: `$\\bar{x} = ${m}$. Phương sai $s^2 = ${dev} = ${frac(Sq, n)}$.` };
      }
      return { stem: `${C.t(n)}: $${lst(d)}$. Độ lệch chuẩn của mẫu số liệu trên bằng`,
        ...mcq(r, M(radTex(1, n, Sq * n)), [frac(Sq, n), radTex(1, n - 1, Sq * (n - 1)), sqrtTex(Sq), radTex(1, n, Sq)].map(M)),
        explanation: `$\\bar{x} = ${m}$. $s^2 = ${dev} = ${frac(Sq, n)}$, nên độ lệch chuẩn $s = \\sqrt{${frac(Sq, n)}} = ${radTex(1, n, Sq * n)}$.` };
    },
  },
  {
    id: "t10-thong-ke-tu-phan-vi", subject: S, grade: G, chapter: C5, topic: "Tứ phân vị, khoảng tứ phân vị",
    half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const C = r.pick(DATA_CTX), n = r.int(8, 12), d = dataOf(r, n, C.lo, C.hi), s = srt(d);
      const [q1, q2, q3] = quart(d), [a1, , a3] = quartAlt(d), ask = r.int(0, 2);
      const h = Math.floor(n / 2);
      const ex = `Sắp xếp: $${lst(s)}$. Trung vị $Q_2 = ${tex(q2)}$. $Q_1$ là trung vị của nửa dưới $${lst(s.slice(0, h))}$ nên $Q_1 = ${tex(q1)}$; $Q_3$ là trung vị của nửa trên $${lst(s.slice(n - h))}$ nên $Q_3 = ${tex(q3)}$${n % 2 ? " (n lẻ nên không tính $Q_2$ vào hai nửa)" : ""}.`;
      const T = [["tứ phân vị thứ nhất $Q_1$", q1, [a1, q2, q3, s[Math.floor(n / 4)], s[0]]], ["tứ phân vị thứ ba $Q_3$", q3, [a3, q2, q1, s[Math.floor((3 * n) / 4)], s[n - 1]]], ["khoảng tứ phân vị $\\Delta_Q$", q3 - q1, [a3 - a1, s[n - 1] - s[0], q3 - q2, q2 - q1, q3 + q1]]] as [string, number, number[]][];
      const [nm, ok, w] = T[ask];
      return { stem: `${C.t(n)}: $${lst(d)}$. ${nm[0].toUpperCase() + nm.slice(1)} của mẫu số liệu trên là`,
        ...mcq(r, M(tex(ok)), w.map((x) => M(tex(x)))),
        explanation: `${ex}${ask === 2 ? ` Vậy $\\Delta_Q = Q_3 - Q_1 = ${tex(q3)} - ${tex(q1)} = ${tex(q3 - q1)}$.` : ""}` };
    },
  },
  {
    id: "t10-thong-ke-bat-thuong", subject: S, grade: G, chapter: C5, topic: "Khoảng biến thiên, giá trị bất thường",
    half: 2, level: 3, kind: "mcq",
    make: (r) => {
      const C = r.pick(DATA_CTX), n = r.int(8, 11);
      if (r.chance(0.4)) {
        const d = dataOf(r, n, C.lo, C.hi), s = srt(d), R = s[n - 1] - s[0], [q1, , q3] = quart(d);
        return { stem: `${C.t(n)}: $${lst(d)}$. Khoảng biến thiên của mẫu số liệu trên là`,
          ...mcq(r, M(R), [Math.abs(d[n - 1] - d[0]), q3 - q1, s[n - 1], s[n - 1] - s[1], s[n - 2] - s[0]].map((x) => M(tex(x)))),
          explanation: `Giá trị lớn nhất là $${s[n - 1]}$, giá trị nhỏ nhất là $${s[0]}$ nên khoảng biến thiên $R = ${s[n - 1]} - ${s[0]} = ${R}$.` };
      }
      const lo = r.int(10, 40), wdt = r.int(4, 8);
      const base = dataOf(r, n - 1, lo, lo + wdt), up = r.chance(0.6);
      const out = up ? lo + wdt + r.int(2 * wdt, 4 * wdt) : lo - r.int(2 * wdt, 4 * wdt);
      need(out > 0);
      const d = r.shuffle([...base, out]), [q1, , q3] = quart(d), dq = q3 - q1;
      const L = q1 - 1.5 * dq, U = q3 + 1.5 * dq;
      const outs = d.filter((x) => x < L || x > U); need(outs.length === 1 && outs[0] === out);
      const s = srt(base);
      const ctx = r.pick([`Thời gian (đơn vị: phút) đi từ nhà đến trường của $${n}$ bạn học sinh là`, `Số sản phẩm một tổ công nhân làm được trong $${n}$ ngày là`, `Khối lượng (đơn vị: kg) của $${n}$ bao hàng là`, `Chiều dài (đơn vị: cm) của $${n}$ con cá giống là`]);
      return { stem: `${ctx}: $${lst(d)}$. Giá trị nào sau đây là giá trị bất thường của mẫu số liệu?`,
        ...mcq(r, M(out), [s[n - 2], s[0], med(s), s[Math.floor(n / 2) + 1]].map((x) => M(tex(x)))),
        explanation: `Ta có $Q_1 = ${tex(q1)}$, $Q_3 = ${tex(q3)}$, $\\Delta_Q = ${tex(dq)}$. Giá trị bất thường là giá trị lớn hơn $Q_3 + 1{,}5\\Delta_Q = ${tex(U)}$ hoặc nhỏ hơn $Q_1 - 1{,}5\\Delta_Q = ${tex(L)}$. Chỉ có $${out}$ thỏa mãn.` };
    },
  },

  /* ===================== HALF 2 – TF ===================== */
  {
    id: "t10-tf-vecto-hinh-vuong-tam-giac-deu", subject: S, grade: G, chapter: C4, topic: "Vectơ và tích vô hướng trong hình vuông, tam giác đều (Đúng/Sai)",
    half: 2, level: 2, kind: "tf",
    make: (r) => {
      const a = r.int(2, 14), s = [r.chance(0.5), r.chance(0.5), r.chance(0.5), r.chance(0.5)];
      if (r.chance(0.5)) {
        return {
          stem: `Cho hình vuông $ABCD$ cạnh bằng $${a}$, tâm $O$. Gọi $M$ là trung điểm của cạnh $BC$. Xét tính đúng sai của các khẳng định sau.`,
          ...tf([
            [`$\\left|${V("AB")} + ${V("AD")}\\right| = ${s[0] ? radTex(a, 1, 2) : 2 * a}$`, s[0]],
            [`$${V("AB")}\\cdot ${V("AC")} = ${s[1] ? a * a : radTex(a * a, 1, 2)}$`, s[1]],
            [s[2] ? `$${V("OA")} + ${V("OC")} = \\vec{0}$` : `$${V("OA")} + ${V("OB")} = ${V("OC")} + ${V("OD")}$`, s[2]],
            [`$${V("AM")}\\cdot ${V("BD")} = ${s[3] ? frac(-a * a, 2) : frac(a * a, 2)}$`, s[3]],
          ]),
          explanation: `$${V("AB")} + ${V("AD")} = ${V("AC")}$ nên độ dài bằng $AC = ${radTex(a, 1, 2)}$. $${V("AB")}\\cdot ${V("AC")} = ${a}\\cdot ${radTex(a, 1, 2)}\\cdot\\cos 45^\\circ = ${a * a}$. $O$ là trung điểm $AC$ nên $${V("OA")} + ${V("OC")} = \\vec{0}$; còn $${V("OA")} + ${V("OB")} = -(${V("OC")} + ${V("OD")}) \\ne \\vec{0}$. $${V("AM")}\\cdot ${V("BD")} = \\left(${V("AB")} + \\dfrac{1}{2}${V("AD")}\\right)\\cdot\\left(${V("AD")} - ${V("AB")}\\right) = -AB^2 + \\dfrac{1}{2}AD^2 = ${frac(-a * a, 2)}$.`,
        };
      }
      return {
        stem: `Cho tam giác đều $ABC$ cạnh bằng $${a}$, $M$ là trung điểm của $BC$ và $G$ là trọng tâm tam giác. Xét tính đúng sai của các khẳng định sau.`,
        ...tf([
          [`$\\left|${V("AB")} + ${V("AC")}\\right| = ${s[0] ? radTex(a, 1, 3) : 2 * a}$`, s[0]],
          [`$${V("AB")}\\cdot ${V("AC")} = ${s[1] ? frac(a * a, 2) : radTex(a * a, 2, 3)}$`, s[1]],
          [`$${V("AG")} = ${s[2] ? "\\dfrac{2}{3}" : "\\dfrac{1}{2}"}${V("AM")}$`, s[2]],
          [`$${V("AM")}\\cdot ${V("AC")} = ${s[3] ? frac(3 * a * a, 4) : frac(a * a, 2)}$`, s[3]],
        ]),
        explanation: `$${V("AB")} + ${V("AC")} = 2${V("AM")}$, $AM = ${radTex(a, 2, 3)}$ nên độ dài bằng $${radTex(a, 1, 3)}$. $${V("AB")}\\cdot ${V("AC")} = ${a}\\cdot ${a}\\cdot\\cos 60^\\circ = ${frac(a * a, 2)}$. $G$ thuộc đoạn $AM$ với $AG = \\dfrac{2}{3}AM$ nên $${V("AG")} = \\dfrac{2}{3}${V("AM")}$. $${V("AM")}\\cdot ${V("AC")} = \\dfrac{1}{2}\\left(${V("AB")}\\cdot ${V("AC")} + AC^2\\right) = \\dfrac{1}{2}\\left(${frac(a * a, 2)} + ${a * a}\\right) = ${frac(3 * a * a, 4)}$.`,
      };
    },
  },
  {
    id: "t10-tf-toa-do-tam-giac", subject: S, grade: G, chapter: C4, topic: "Vectơ trong mặt phẳng tọa độ (Đúng/Sai)",
    half: 2, level: 1, kind: "tf",
    make: (r) => {
      const c = () => r.int(-4, 5);
      const A = [c(), c()], B = [c(), c()], C = [c(), c()];
      const u = [B[0] - A[0], B[1] - A[1]], v = [C[0] - A[0], C[1] - A[1]];
      need(u[0] * v[1] - u[1] * v[0] !== 0);
      const dot = u[0] * v[0] + u[1] * v[1], wdot = u[0] * v[0] - u[1] * v[1] === dot ? -dot : u[0] * v[0] - u[1] * v[1];
      need(dot !== 0 && wdot !== dot);
      const s = [r.chance(0.5), r.chance(0.5), r.chance(0.5), r.chance(0.5)], mid = r.chance(0.5);
      const fp = (x: number, q: number, y: number) => pt(frac(x, q), frac(y, q));
      const D = [A[0] + C[0] - B[0], A[1] + C[1] - B[1]], Dw = [B[0] + C[0] - A[0], B[1] + C[1] - A[1]];
      const gx = A[0] + B[0] + C[0], gy = A[1] + B[1] + C[1];
      return {
        stem: `Trong mặt phẳng tọa độ $Oxy$, cho ba điểm $A${pt(A[0], A[1])}$, $B${pt(B[0], B[1])}$, $C${pt(C[0], C[1])}$. Xét tính đúng sai của các khẳng định sau.`,
        ...tf([
          [`$${V("AB")} = ${s[0] ? pt(u[0], u[1]) : pt(-u[0], -u[1])}$`, s[0]],
          mid ? [`Trung điểm của đoạn thẳng $BC$ là $M${s[1] ? fp(B[0] + C[0], 2, B[1] + C[1]) : fp(C[0] - B[0], 2, C[1] - B[1])}$`, s[1] || (B[0] === 0 && B[1] === 0)]
            : [`Trọng tâm tam giác $ABC$ là $G${s[1] ? fp(gx, 3, gy) : pt(gx, gy)}$`, s[1] || (gx === 0 && gy === 0)],
          [`Điểm $D$ để $ABCD$ là hình bình hành là $D${s[2] ? pt(D[0], D[1]) : pt(Dw[0], Dw[1])}$`, s[2] || (D[0] === Dw[0] && D[1] === Dw[1])],
          [`$${V("AB")}\\cdot ${V("AC")} = ${s[3] ? dot : wdot}$`, s[3]],
        ]),
        explanation: `$${V("AB")} = ${pt(u[0], u[1])}$, $${V("AC")} = ${pt(v[0], v[1])}$. ${mid ? `Trung điểm $BC$ là $M${fp(B[0] + C[0], 2, B[1] + C[1])}$` : `Trọng tâm $G\\left(\\dfrac{x_A + x_B + x_C}{3};\\ \\dfrac{y_A + y_B + y_C}{3}\\right) = ${fp(gx, 3, gy)}$`}. $ABCD$ là hình bình hành $\\Leftrightarrow ${V("AD")} = ${V("BC")}$ nên $D${pt(D[0], D[1])}$. $${V("AB")}\\cdot ${V("AC")} = (${u[0]})\\cdot(${v[0]}) + (${u[1]})\\cdot(${v[1]}) = ${dot}$.`,
      };
    },
  },
  {
    id: "t10-tf-thong-ke-mau", subject: S, grade: G, chapter: C5, topic: "Các số đặc trưng của mẫu số liệu (Đúng/Sai)",
    half: 2, level: 2, kind: "tf",
    make: (r) => {
      const C = r.pick(DATA_CTX), n = r.int(8, 11), d = dataOf(r, n, C.lo, C.hi), s = srt(d);
      const mu = mean(d), mo = modeOf(d); need(exact2(mu) && mo !== null);
      const md = med(s), [q1, , q3] = quart(d), [a1, , a3] = quartAlt(d), R = s[n - 1] - s[0];
      const st = [r.chance(0.5), r.chance(0.5), r.chance(0.5), r.chance(0.5)];
      const muW = exact2(sum(d) / (n - 1)) ? sum(d) / (n - 1) : mu + 0.5;
      const um = n % 2 ? d[(n - 1) / 2] : (d[n / 2 - 1] + d[n / 2]) / 2, mdW = um !== md ? um : md + 1;
      const fq = d.filter((x) => x === mo).length, moW = fq !== mo ? fq : mo + 1;
      const dqW = n % 2 && a3 - a1 !== q3 - q1 ? a3 - a1 : R;
      need(dqW !== q3 - q1);
      return {
        stem: `${C.t(n)}: $${lst(d)}$. Xét tính đúng sai của các khẳng định sau.`,
        ...tf([
          [`Số trung bình của mẫu số liệu là $${tex(st[0] ? mu : muW)}$`, st[0]],
          [`Trung vị của mẫu số liệu là $${tex(st[1] ? md : mdW)}$`, st[1]],
          [`Mốt của mẫu số liệu là $${st[2] ? mo : moW}$`, st[2]],
          [`Khoảng tứ phân vị của mẫu số liệu bằng $${tex(st[3] ? q3 - q1 : dqW)}$`, st[3]],
        ]),
        explanation: `Sắp xếp: $${lst(s)}$. $\\bar{x} = \\dfrac{${sum(d)}}{${n}} = ${tex(mu)}$; trung vị $M_e = ${tex(md)}$; giá trị $${mo}$ xuất hiện nhiều nhất ($${fq}$ lần) nên $M_o = ${mo}$; $Q_1 = ${tex(q1)}$, $Q_3 = ${tex(q3)}$ nên $\\Delta_Q = ${tex(q3 - q1)}$.`,
      };
    },
  },

  /* ===================== HALF 2 – SHORT ===================== */
  {
    id: "t10-short-hop-luc", subject: S, grade: G, chapter: C4, topic: "Hợp lực của hai lực (tổng hai vectơ)",
    half: 2, level: 3, kind: "short",
    make: (r) => {
      const th = r.pick([30, 40, 45, 50, 60, 70, 80, 90, 100, 110, 120, 135, 150]);
      const F1 = r.int(5, 60), F2 = r.int(5, 60);
      const F = Math.sqrt(F1 * F1 + F2 * F2 + 2 * F1 * F2 * Math.cos(th * DEG)), f = fit(F, 1);
      const u = r.chance(0.3) ? "kN" : "N";
      const ctx = r.pick([
        { s: `Hai lực $\\vec{F_1}$, $\\vec{F_2}$ cùng tác dụng vào một vật tại điểm $O$, có độ lớn lần lượt là $${F1}$ ${u} và $${F2}$ ${u}, hợp với nhau một góc $${th}^\\circ$.`, q: `độ lớn của hợp lực $\\vec{F} = \\vec{F_1} + \\vec{F_2}$` },
        { s: `Hai chiếc tàu kéo cùng kéo một sà lan bằng hai sợi dây cáp hợp với nhau một góc $${th}^\\circ$, lực kéo của hai tàu có độ lớn lần lượt là $${F1}$ ${u} và $${F2}$ ${u}.`, q: "độ lớn hợp lực tác dụng lên sà lan" },
        { s: `Hai người cùng kéo một chiếc xe bằng hai sợi dây hợp với nhau một góc $${th}^\\circ$, với lực kéo có độ lớn lần lượt là $${F1}$ ${u} và $${F2}$ ${u}.`, q: "độ lớn của hợp lực kéo chiếc xe" },
        { s: `Một vật đứng yên dưới tác dụng của ba lực $\\vec{F_1}$, $\\vec{F_2}$, $\\vec{F_3}$. Biết $\\vec{F_1}$, $\\vec{F_2}$ có độ lớn lần lượt là $${F1}$ ${u}, $${F2}$ ${u} và hợp với nhau một góc $${th}^\\circ$.`, q: "độ lớn của lực $\\vec{F_3}$" },
      ]);
      return {
        stem: `${ctx.s} Tính ${ctx.q} (đơn vị: ${u}${f.note ? ", " + f.note : ""}).`,
        ...short(F, f.dp),
        explanation: `${ctx.q.includes("F_3") ? "Vật cân bằng nên $\\vec{F_3} = -(\\vec{F_1} + \\vec{F_2})$, do đó $F_3 = |\\vec{F_1} + \\vec{F_2}|$. " : ""}$|\\vec{F_1} + \\vec{F_2}|^2 = F_1^2 + F_2^2 + 2F_1F_2\\cos ${th}^\\circ = ${F1 * F1} + ${F2 * F2} + 2\\cdot ${F1}\\cdot ${F2}\\cdot\\cos ${th}^\\circ ${f.note ? "\\approx" : "="} ${tex(F * F, 2)}$, nên độ lớn cần tìm $${f.note ? "\\approx" : "="} ${tex(F, f.dp)}$ ${u}. (Chú ý dấu “$+$” vì $\\vec{F_1}\\cdot\\vec{F_2} = F_1F_2\\cos ${th}^\\circ$.)`,
      };
    },
  },
  {
    id: "t10-short-cong-luc", subject: S, grade: G, chapter: C4, topic: "Công của lực (ứng dụng tích vô hướng)",
    half: 2, level: 3, kind: "short",
    make: (r) => {
      const al = r.pick([20, 25, 30, 35, 40, 45, 50, 60, 70]), F = r.int(2, 30) * 5, s = r.int(2, 60);
      const A = F * s * Math.cos(al * DEG); need(A < 9999.5);
      const f = fit(A, 0);
      const ctx = r.pick([
        `Một người kéo một thùng hàng trượt trên sàn nhà bằng một sợi dây, lực kéo $\\vec{F}$ có độ lớn $${F}$ N và hợp với hướng dịch chuyển một góc $${al}^\\circ$. Thùng hàng dịch chuyển được $${s}$ m.`,
        `Một em nhỏ kéo xe trượt tuyết bằng sợi dây hợp với phương ngang một góc $${al}^\\circ$, lực kéo có độ lớn $${F}$ N. Xe di chuyển theo phương ngang được $${s}$ m.`,
        `Một người kéo chiếc vali trên mặt đường nằm ngang bằng lực có độ lớn $${F}$ N, tay kéo hợp với mặt đường một góc $${al}^\\circ$, vali di chuyển được $${s}$ m.`,
        `Trên bờ kênh, một người dùng dây kéo con thuyền đi dọc theo kênh được $${s}$ m; dây kéo hợp với hướng chuyển động của thuyền một góc $${al}^\\circ$ và lực kéo có độ lớn $${F}$ N.`,
      ]);
      return {
        stem: `${ctx} Tính công $A$ của lực kéo (đơn vị: J${f.note ? ", " + f.note : ""}).`,
        ...short(A, f.dp),
        explanation: `Công của lực: $A = \\vec{F}\\cdot\\vec{d} = |\\vec{F}|\\cdot|\\vec{d}|\\cdot\\cos ${al}^\\circ = ${F}\\cdot ${s}\\cdot\\cos ${al}^\\circ ${f.note ? "\\approx" : "="} ${tex(A, f.dp)}$ (J).`,
      };
    },
  },
  {
    id: "t10-short-phuong-sai-an", subject: S, grade: G, chapter: C5, topic: "Tìm giá trị chưa biết rồi tính phương sai, độ lệch chuẩn",
    half: 2, level: 3, kind: "short",
    make: (r) => {
      const C = r.pick(DATA_CTX), n = r.int(5, 8), m = r.int(C.lo + 2, C.hi - 2);
      const d = dataOf(r, n - 1, C.lo, C.hi), x = n * m - sum(d);
      need(x >= C.lo && x <= C.hi);
      const v = variance([...d, x]); need(v > 0);
      const askSd = r.chance(0.5), ans = askSd ? Math.sqrt(v) : v, f = fit(ans, 2);
      return {
        stem: `${C.t(n)}: $${lst(d)};\\ x$. Biết số trung bình của mẫu số liệu là $${m}$. Tính ${askSd ? "độ lệch chuẩn" : "phương sai"} của mẫu số liệu${withNote(f.note)}.`,
        ...short(ans, f.dp),
        explanation: `Từ $\\bar{x} = ${m}$ suy ra $x = ${n}\\cdot ${m} - ${sum(d)} = ${x}$. Phương sai $s^2 = \\dfrac{1}{${n}}\\sum (x_i - ${m})^2 = \\dfrac{${round(v * n)}}{${n}} ${exact2(v) ? "=" : "\\approx"} ${tex(v, 2)}$${askSd ? `, độ lệch chuẩn $s = \\sqrt{s^2} \\approx ${tex(Math.sqrt(v), f.dp)}$` : ""}.`,
      };
    },
  },
  {
    id: "t10-short-tu-phan-vi", subject: S, grade: G, chapter: C5, topic: "Tính tứ phân vị, khoảng tứ phân vị",
    half: 2, level: 2, kind: "short",
    make: (r) => {
      const C = r.pick(DATA_CTX), n = r.int(8, 13), d = dataOf(r, n, C.lo, C.hi), s = srt(d);
      const [q1, q2, q3] = quart(d), h = Math.floor(n / 2), ask = r.int(0, 2);
      const ans = [q1, q3, q3 - q1][ask], nm = ["tứ phân vị thứ nhất $Q_1$", "tứ phân vị thứ ba $Q_3$", "khoảng tứ phân vị $\\Delta_Q$"][ask];
      return {
        stem: `${C.t(n)}: $${lst(d)}$. Tìm ${nm} của mẫu số liệu.`,
        ...short(ans, 2),
        explanation: `Sắp xếp: $${lst(s)}$; $Q_2 = ${tex(q2)}$. Nửa dưới $${lst(s.slice(0, h))}$ có trung vị $Q_1 = ${tex(q1)}$; nửa trên $${lst(s.slice(n - h))}$ có trung vị $Q_3 = ${tex(q3)}$${n % 2 ? " (n lẻ nên không tính $Q_2$ vào hai nửa)" : ""}. $\\Delta_Q = Q_3 - Q_1 = ${tex(q3 - q1)}$. Đáp số: $${tex(ans)}$.`,
      };
    },
  },
  {
    id: "t10-short-vecto-tham-so", subject: S, grade: G, chapter: C4, topic: "Tìm tham số: vuông góc, cùng phương, độ dài",
    half: 2, level: 3, kind: "short",
    make: (r) => {
      const md = r.int(0, 3);
      const okNum = (x: number) => { need(Number.isFinite(x) && Math.abs(round(x, 2) - x) < 1e-9); return x; };
      if (md === 0) {
        const y1 = r.nz(-6, 6), x2 = r.nz(-6, 6), y2 = r.nz(-6, 6), m = okNum(-(y1 * y2) / x2);
        return { stem: `Trong mặt phẳng tọa độ $Oxy$, cho $\\vec{a} = ${pt("m", y1)}$ và $\\vec{b} = ${pt(x2, y2)}$. Tìm $m$ để $\\vec{a}\\perp\\vec{b}$.`,
          ...short(m, 2), explanation: `$\\vec{a}\\perp\\vec{b} \\Leftrightarrow ${x2}m + (${y1})\\cdot(${y2}) = 0 \\Leftrightarrow m = ${frac(-(y1 * y2), x2)}$.` };
      }
      if (md === 1) {
        const y1 = r.nz(-6, 6), x2 = r.nz(-6, 6), y2 = r.nz(-6, 6), m = okNum((y1 * x2) / y2);
        return { stem: `Trong mặt phẳng tọa độ $Oxy$, cho $\\vec{a} = ${pt("m", y1)}$ và $\\vec{b} = ${pt(x2, y2)}$. Tìm $m$ để hai vectơ $\\vec{a}$ và $\\vec{b}$ cùng phương.`,
          ...short(m, 2), explanation: `$\\vec{a}$, $\\vec{b}$ cùng phương $\\Leftrightarrow m\\cdot(${y2}) - (${y1})\\cdot(${x2}) = 0 \\Leftrightarrow m = ${frac(y1 * x2, y2)}$.` };
      }
      if (md === 2) {
        const c = () => r.int(-4, 5);
        const A = [c(), c()], B = [c(), c()], yC = c();
        need(B[0] !== A[0] && yC !== A[1]);
        const m = okNum(A[0] - ((B[1] - A[1]) * (yC - A[1])) / (B[0] - A[0]));
        return { stem: `Trong mặt phẳng tọa độ $Oxy$, cho $A${pt(A[0], A[1])}$, $B${pt(B[0], B[1])}$ và $C${pt("m", yC)}$. Tìm $m$ để tam giác $ABC$ vuông tại $A$.`,
          ...short(m, 2), explanation: `$${V("AB")} = ${pt(B[0] - A[0], B[1] - A[1])}$, $${V("AC")} = ${pt(`m - (${A[0]})`, yC - A[1])}$. Tam giác vuông tại $A \\Leftrightarrow ${V("AB")}\\cdot ${V("AC")} = 0 \\Leftrightarrow ${B[0] - A[0]}(m - (${A[0]})) + (${B[1] - A[1]})\\cdot(${yC - A[1]}) = 0 \\Leftrightarrow m = ${frac(A[0] * (B[0] - A[0]) - (B[1] - A[1]) * (yC - A[1]), B[0] - A[0])}$.` };
      }
      const [p, q, z] = r.pick(PYT.slice(0, 4)), k = r.int(1, 2), [mm, y1] = r.chance(0.5) ? [p * k, q * k] : [q * k, p * k], L = z * k;
      const sg = r.chance(0.5) ? 1 : -1;
      return { stem: `Trong mặt phẳng tọa độ $Oxy$, cho $\\vec{a} = ${pt("m", sg * y1)}$ với $m > 0$. Tìm $m$ để $|\\vec{a}| = ${L}$.`,
        ...short(mm, 0), explanation: `$|\\vec{a}| = \\sqrt{m^2 + ${y1 * y1}} = ${L} \\Leftrightarrow m^2 = ${L * L} - ${y1 * y1} = ${mm * mm}$, mà $m > 0$ nên $m = ${mm}$.` };
    },
  },
  {
    id: "t10-short-sai-so-tuong-doi", subject: S, grade: G, chapter: C5, topic: "Sai số tuyệt đối, sai số tương đối",
    half: 2, level: 1, kind: "short",
    make: (r) => {
      const C = r.pick([
        { o: "chiều dài một cây cầu", u: "m", a: () => r.int(120, 990), d: [0.1, 0.2, 0.5, 1] },
        { o: "chiều cao một ngọn tháp", u: "m", a: () => r.int(30, 150), d: [0.05, 0.1, 0.2, 0.5] },
        { o: "khối lượng một bao gạo", u: "kg", a: () => r.int(20, 50), d: [0.05, 0.1, 0.2] },
        { o: "đường kính một chi tiết máy", u: "mm", a: () => r.float(10, 90, 1), d: [0.01, 0.02, 0.05] },
        { o: "quãng đường từ nhà Lan đến trường", u: "km", a: () => r.float(2, 9, 1), d: [0.01, 0.02, 0.05, 0.1] },
        { o: "diện tích một thửa ruộng", u: "m²", a: () => r.int(400, 2000), d: [1, 2, 5] },
      ]);
      const a = C.a(), d = r.pick(C.d);
      if (r.chance(0.6)) {
        const del = (d / a) * 100, f = fit(del, 2);
        return { stem: `Kết quả đo ${C.o} được ghi là $${tex(a, 2)} \\pm ${tex(d, 2)}$ (${C.u}). Sai số tương đối của phép đo không vượt quá bao nhiêu phần trăm${withNote(f.note)}?`,
          ...short(del, f.dp), explanation: `$\\delta_a \\le \\dfrac{d}{|a|} = \\dfrac{${tex(d, 2)}}{${tex(a, 2)}} \\approx ${tex(del / 100, 5)} = ${tex(del, f.dp)}\\%$.` };
      }
      const pct = r.pick([0.1, 0.2, 0.4, 0.5, 1, 2]), dd = (a * pct) / 100;
      need(Math.abs(round(dd, 3) - dd) < 1e-9 && vn(dd, 3).length <= 4);
      return { stem: `Một phép đo ${C.o} cho kết quả gần đúng $a = ${tex(a, 2)}$ (${C.u}) với sai số tương đối không vượt quá $${tex(pct)}\\%$. Hỏi sai số tuyệt đối của $a$ không vượt quá bao nhiêu ${C.u}?`,
        ...short(dd, 3), explanation: `$\\Delta_a = \\delta_a\\cdot|a| \\le ${tex(pct)}\\%\\cdot ${tex(a, 2)} = ${tex(dd, 3)}$ (${C.u}).` };
    },
  },
];
