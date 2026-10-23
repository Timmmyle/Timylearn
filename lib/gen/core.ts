/* Bộ sinh câu hỏi theo "dạng bài" có tham số.
   Mỗi dạng (Template) tự chọn số liệu từ một hạt giống (seed) và TỰ TÍNH đáp án bằng code,
   nên mỗi lần sinh ra một câu mới mà đáp án luôn đúng. Cùng seed → cùng câu (tái tạo được từ id). */

export type Kind = "mcq" | "tf" | "short";
export type Exam = "gk1" | "ck1" | "gk2" | "ck2";
export type Subject = "Toán" | "Vật lí" | "Hóa học";

export interface Rng {
  /** số nguyên trong [a, b] */ int(a: number, b: number): number;
  /** số nguyên khác 0 trong [a, b] */ nz(a: number, b: number): number;
  pick<T>(a: readonly T[]): T;
  /** số thực trong [a, b] làm tròn dp chữ số thập phân */ float(a: number, b: number, dp: number): number;
  shuffle<T>(a: T[]): T[];
  chance(p: number): boolean;
}

export type GenOut = {
  stem: string;
  /** mcq: 4 phương án (dùng helper mcq) */ options?: string[]; answer?: number;
  /** tf: 4 ý */ statements?: { t: string; a: boolean }[];
  /** short: đáp án số, tối đa 4 ký tự, dấu phẩy thập phân */ answer_text?: string;
  explanation: string;
};

export type Template = {
  id: string;            // duy nhất toàn hệ thống, vd "t10-menh-de-phu-dinh"
  subject: Subject;
  grade: 10 | 11 | 12;
  chapter: string;       // tên chương, vd "Chương I. Mệnh đề và tập hợp"
  topic: string;         // tên dạng bài ngắn, vd "Phủ định của mệnh đề"
  /** học kì; bỏ trống = 1 */ hk?: 1 | 2;
  half: 1 | 2;           // 1 = nửa đầu học kì (vào đề giữa kì và cuối kì), 2 = nửa sau học kì (chỉ cuối kì)
  /** khóa chủ đề trong mục Vượt Ải, vd "Toán|Đạo hàm" (để nút "Luyện chủ đề này" lấy đúng dạng) */ tk?: string;
  level: 1 | 2 | 3;      // 1 nhận biết, 2 thông hiểu, 3 vận dụng
  kind: Kind;
  make: (r: Rng) => GenOut;
};

/** Ném lỗi này khi số liệu chọn ra không đẹp → hệ thống chọn bộ số khác */
export class Retry extends Error { constructor(m = "retry") { super(m); } }
export const need = (cond: unknown, m = "retry"): void => { if (!cond) throw new Retry(m); };

/* ---------------- Ngẫu nhiên có hạt giống (mulberry32) ---------------- */
export function rng(seed: number): Rng {
  let s = seed >>> 0 || 1;
  const next = () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const int = (a: number, b: number) => a + Math.floor(next() * (b - a + 1));
  return {
    int,
    nz: (a, b) => { for (let i = 0; i < 50; i++) { const v = int(a, b); if (v !== 0) return v; } return b || 1; },
    pick: (a) => a[Math.floor(next() * a.length)],
    float: (a, b, dp) => round(a + next() * (b - a), dp),
    shuffle: (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
    chance: (p) => next() < p,
  };
}

/* ---------------- Số và LaTeX ---------------- */
export const round = (x: number, dp = 0) => { const k = Math.pow(10, dp); return Math.round((x + Number.EPSILON * Math.sign(x)) * k) / k; };
export const gcd = (a: number, b: number): number => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
/** Số kiểu Việt Nam cho văn bản thường: 2,5 ; -3 ; 1 250 không tách nghìn (đề thi viết 1250) */
export function vn(x: number, dp = 2): string {
  const v = round(x, dp);
  let s = Math.abs(v).toFixed(dp);
  if (s.includes(".")) s = s.replace(/\.?0+$/, ""); // chỉ bỏ số 0 thừa sau dấu thập phân
  if (s === "") s = "0";
  return (v < 0 && s !== "0" ? "-" : "") + s.replace(".", ",");
}
/** Số trong công thức $...$: dấu phẩy thập phân viết {,} để KaTeX không chèn khoảng trắng */
export const tex = (x: number, dp = 2) => vn(x, dp).replace(",", "{,}");
/** Phân số tối giản dạng LaTeX: \dfrac{p}{q}, số nguyên nếu chia hết */
export function frac(p: number, q: number): string {
  need(q !== 0);
  const g = gcd(p, q); p /= g; q /= g; if (q < 0) { p = -p; q = -q; }
  if (q === 1) return String(p);
  return (p < 0 ? "-" : "") + `\\dfrac{${Math.abs(p)}}{${q}}`;
}
/** √n rút gọn: a\sqrt{b} */
export function sqrtTex(n: number): string {
  need(n >= 0 && Number.isInteger(n));
  let a = 1, b = n;
  for (let k = 2; k * k <= b; k++) while (b % (k * k) === 0) { b /= k * k; a *= k; }
  if (b === 1) return String(a);
  return (a === 1 ? "" : a) + `\\sqrt{${b}}`;
}
/** Hệ số đứng trước biến: 1→"", -1→"-", còn lại số */
export const coef = (k: number) => (k === 1 ? "" : k === -1 ? "-" : String(k));
/** Hạng tử có dấu để nối vào đa thức: "+ 3x", "- x", "" nếu k = 0 */
export const term = (k: number, v = "", first = false) => {
  if (k === 0) return "";
  const a = Math.abs(k), body = v ? (a === 1 ? v : a + v) : String(a);
  return first ? (k < 0 ? "-" : "") + body : (k < 0 ? " - " : " + ") + body;
};
/** Đa thức từ hệ số bậc cao → thấp, vd poly([1,-3,2],"x") = "x^2 - 3x + 2" */
export function poly(cs: number[], v = "x"): string {
  const n = cs.length - 1; let out = "";
  cs.forEach((c, i) => { const d = n - i; const vv = d === 0 ? "" : d === 1 ? v : `${v}^{${d}}`; const t = term(c, vv, out === ""); out += t; });
  return out || "0";
}

/* ---------------- Dựng câu hỏi ---------------- */
/** Trắc nghiệm 4 phương án: 1 đúng + các phương án nhiễu (bỏ trùng). Thiếu nhiễu → Retry. */
export function mcq(r: Rng, correct: string, wrong: string[]): { options: string[]; answer: number } {
  const norm = (s: string) => s.replace(/\s+/g, "");
  const seen = new Set([norm(correct)]); const w: string[] = [];
  for (const x of wrong) { const k = norm(x); if (x && !seen.has(k)) { seen.add(k); w.push(x); } if (w.length === 3) break; }
  need(w.length === 3, "mcq: thiếu phương án nhiễu");
  const options = r.shuffle([correct, ...w]);
  return { options, answer: options.indexOf(correct) };
}
/** Đúng/Sai: 4 ý [nội dung, đúng?]. Cần có cả ý Đúng và ý Sai. */
export function tf(items: [string, boolean][]): { statements: { t: string; a: boolean }[] } {
  need(items.length === 4);
  need(items.some((x) => x[1]) && items.some((x) => !x[1]), "tf: cần cả Đúng và Sai");
  return { statements: items.map(([t, a]) => ({ t, a })) };
}
/** Đáp án trả lời ngắn (≤ 4 ký tự theo phiếu trả lời) */
export function short(x: number, dp = 2): { answer_text: string } {
  need(Number.isFinite(x));
  const s = vn(x, dp);
  need(s.length <= 4, "short: quá 4 ký tự");
  return { answer_text: s };
}
/** Biến đề thành phương án nhiễu "ngẫu nhiên gần đúng" khi cần thêm */
export const near = (r: Rng, x: number, spread: number, dp = 0) => round(x + r.pick([-1, 1]) * r.int(1, 3) * spread, dp);

/** Sinh câu từ dạng + seed. Gặp Retry thì thử seed khác (tối đa 60 lần). */
export function generate(t: Template, seed: number): { out: GenOut; seed: number } {
  let last: unknown;
  for (let k = 0; k < 60; k++) {
    const sd = (seed + k * 7919) >>> 0;
    try { return { out: t.make(rng(sd)), seed: sd }; } catch (e) { last = e; if (!(e instanceof Retry)) throw e; }
  }
  throw new Error(`Dạng ${t.id}: không sinh được câu hợp lệ (${(last as Error)?.message})`);
}
