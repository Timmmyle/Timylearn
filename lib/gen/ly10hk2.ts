/* Vật lí 10 – học kì 2 (Kết nối tri thức).
   half 1: Chương IV (Năng lượng, công, công suất) + Chương V (Động lượng);
   half 2: Chương VI (Chuyển động tròn) + Chương VII (Biến dạng của vật rắn. Áp suất chất lỏng). */
import { mcq, tf, short, tex, vn, need, sqrtTex, round, gcd, type Template, type Rng } from "./core.ts";

const S = "Vật lí" as const, G = 10 as const;
const C4 = "Chương IV. Năng lượng, công, công suất", C5 = "Chương V. Động lượng";
const C6 = "Chương VI. Chuyển động tròn", C7 = "Chương VII. Biến dạng của vật rắn. Áp suất chất lỏng";
const M4 = { subject: S, grade: G, hk: 2, chapter: C4, tk: "Vật lí|Năng lượng, công, công suất", half: 1 } as const;
const M5 = { subject: S, grade: G, hk: 2, chapter: C5, tk: "Vật lí|Động lượng", half: 1 } as const;
const M6 = { subject: S, grade: G, hk: 2, chapter: C6, tk: "Vật lí|Chuyển động tròn", half: 2 } as const;
const M7 = { subject: S, grade: G, hk: 2, chapter: C7, tk: "Vật lí|Biến dạng của vật rắn", half: 2 } as const;
const NAMES = ["An", "Bình", "Chi", "Dũng", "Hà", "Hùng", "Lan", "Linh", "Minh", "Nam", "Phong", "Quân", "Trang", "Vy"];

/* ---------------- tiện ích ---------------- */
const U = (x: number, u: string, dp = 2) => `${vn(x, dp)} ${u}`;
const pickN = <T,>(r: Rng, a: readonly T[], n: number): T[] => r.shuffle([...a]).slice(0, n);
const isInt = (x: number) => Math.abs(x - Math.round(x)) < 1e-9;
const okDp = (x: number, dp: number) => isInt(round(x * Math.pow(10, dp), 6));
const ok4 = (x: number, dp = 2) => vn(x, dp).length <= 4;
const gTxt = (g: number) => `$g = ${tex(g)}$ m/s²`;
const ABC = ["a", "b", "c", "d"];
const tfExp = (st: { t: string; a: boolean }[], why: string[]) =>
  st.map((s, i) => `${ABC[i]}) ${why[i]} → ${s.a ? "Đúng" : "Sai"}.`).join(" ");
function tfv(r: Rng, items: [string, string][]) {
  return tf(items.map(([t, f]) => (r.chance(0.5) ? [t, true] : [f, false]) as [string, boolean]));
}
function theory(r: Rng, T: readonly string[], F: readonly string[], stemT: string[], stemF: string[], why: (c: string, askT: boolean) => string) {
  const askT = r.chance(0.5);
  const c = r.pick(askT ? T : F);
  const w = pickN(r, askT ? F : T, 3);
  const st = askT ? [...stemT, "Trong các phát biểu sau, phát biểu nào đúng?", "Phát biểu nào dưới đây là đúng?"]
    : [...stemF, "Trong các phát biểu sau, phát biểu nào sai?", "Phát biểu nào dưới đây là KHÔNG đúng?"];
  return { stem: r.pick(st), ...mcq(r, c, w), explanation: why(c, askT) };
}
const eq = (x: number, dp: number) => (okDp(x, dp) ? "=" : "\\approx");
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const lc = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
/** pπ/q dạng LaTeX */
function piT(p: number, q: number): string {
  if (p === 0) return "0";
  const g = gcd(p, q); p /= g; q /= g;
  const num = p === 1 ? "\\pi" : `${p}\\pi`;
  return q === 1 ? num : `\\dfrac{${num}}{${q}}`;
}
const piD = (x: number) => (x === 1 ? "\\pi" : `${tex(x)}\\pi`);
/** a·10^n trong công thức */
function sci(x: number, dp = 3): string {
  need(x > 0);
  let n = Math.floor(Math.log10(x) + 1e-9); let a = round(x / Math.pow(10, n), dp);
  if (a >= 10) { a = round(a / 10, dp); n++; }
  return n === 0 ? tex(a, dp) : a === 1 ? `10^{${n}}` : `${tex(a, dp)}\\cdot 10^{${n}}`;
}
const PI = 3.14;
const DEG = (a: number) => (a * Math.PI) / 180;

/* ================= CHƯƠNG IV ================= */
type EC = { d: string; f: string; t: string; x?: string[] };
const ECV: EC[] = [
  { d: "Bàn là (bàn ủi) điện đang hoạt động", f: "điện năng", t: "nhiệt năng" },
  { d: "Ấm siêu tốc đang đun nước", f: "điện năng", t: "nhiệt năng" },
  { d: "Quạt điện đang quay", f: "điện năng", t: "cơ năng", x: ["điện năng|nhiệt năng"] },
  { d: "Máy bơm nước chạy bằng điện đang hoạt động", f: "điện năng", t: "cơ năng", x: ["điện năng|nhiệt năng"] },
  { d: "Tấm pin mặt trời đang được chiếu sáng", f: "quang năng", t: "điện năng" },
  { d: "Máy phát điện của nhà máy thủy điện đang hoạt động", f: "cơ năng", t: "điện năng" },
  { d: "Tua bin gió đang phát điện", f: "cơ năng", t: "điện năng" },
  { d: "Ắc quy đang được nạp điện", f: "điện năng", t: "hóa năng" },
  { d: "Pin của chiếc điều khiển từ xa đang cung cấp điện cho mạch", f: "hóa năng", t: "điện năng" },
  { d: "Bóng đèn LED đang sáng", f: "điện năng", t: "quang năng", x: ["điện năng|nhiệt năng"] },
  { d: "Lá cây xanh đang quang hợp", f: "quang năng", t: "hóa năng" },
  { d: "Loa điện đang phát nhạc", f: "điện năng", t: "năng lượng âm", x: ["điện năng|cơ năng", "điện năng|nhiệt năng"] },
  { d: "Hai bàn tay xoa mạnh vào nhau thấy nóng lên", f: "cơ năng", t: "nhiệt năng" },
  { d: "Má phanh xe đạp nóng lên khi hãm phanh liên tục", f: "cơ năng", t: "nhiệt năng" },
  { d: "Bếp gas đang đun nấu", f: "hóa năng", t: "nhiệt năng" },
];
const key = (e: { f: string; t: string }) => `${e.f}|${e.t}`;

const CONG_T = [
  "Công cơ học là đại lượng vô hướng, đơn vị trong hệ SI là jun (J)",
  "Khi lực vuông góc với hướng chuyển động thì lực không sinh công",
  "Khi góc giữa lực và hướng chuyển động là góc tù thì lực sinh công âm (công cản)",
  "Khi góc giữa lực và hướng chuyển động là góc nhọn thì lực sinh công dương (công phát động)",
  "Lực ma sát trượt tác dụng lên vật đang trượt trên mặt sàn đứng yên sinh công âm",
  "Công của lực không đổi được tính bằng $A = Fs\\cos\\alpha$, với $\\alpha$ là góc giữa lực và hướng chuyển động",
  "1 J là công do lực 1 N thực hiện khi điểm đặt của lực dịch chuyển 1 m theo hướng của lực",
  "Trọng lực không sinh công khi vật chuyển động trên mặt phẳng nằm ngang",
  "Công suất là đại lượng đặc trưng cho tốc độ thực hiện công, đơn vị là oát (W)",
];
const CONG_F = [
  "Công cơ học là đại lượng vectơ, có cùng hướng với lực tác dụng",
  "Lực luôn sinh công khi tác dụng lên một vật đang chuyển động",
  "Khi lực vuông góc với hướng chuyển động thì lực sinh công lớn nhất",
  "Công của một lực luôn là một số dương",
  "Đơn vị của công trong hệ SI là oát (W)",
  "Công của trọng lực luôn dương dù vật đi lên hay đi xuống",
  "Lực hợp với hướng chuyển động một góc tù thì sinh công dương",
  "Công của lực không phụ thuộc vào góc hợp bởi lực và hướng chuyển động",
  "Công suất cho biết lực tác dụng lên vật lớn hay nhỏ",
];
const CN_T = [
  "Cơ năng của vật bằng tổng động năng và thế năng của vật",
  "Khi vật chỉ chịu tác dụng của trọng lực, cơ năng của vật được bảo toàn",
  "Trong quá trình rơi tự do, động năng của vật tăng còn thế năng của vật giảm",
  "Khi vật được ném lên cao (bỏ qua sức cản), động năng giảm bao nhiêu thì thế năng tăng bấy nhiêu",
  "Động năng là đại lượng vô hướng, không âm",
  "Thế năng trọng trường của vật phụ thuộc vào việc chọn mốc thế năng",
  "Khi có lực cản của không khí, cơ năng của vật giảm dần",
  "Độ biến thiên động năng của vật bằng tổng công của các lực tác dụng lên vật",
  "Khi tốc độ của vật tăng gấp đôi thì động năng của vật tăng gấp bốn",
];
const CN_F = [
  "Cơ năng của vật luôn được bảo toàn trong mọi trường hợp",
  "Động năng của vật có thể có giá trị âm",
  "Thế năng trọng trường của vật không phụ thuộc vào việc chọn mốc thế năng",
  "Khi vật rơi tự do, thế năng của vật tăng dần",
  "Động năng của vật tỉ lệ thuận với tốc độ của vật",
  "Khi có lực ma sát, cơ năng của vật tăng lên",
  "Khi vật chuyển động thẳng đều trên mặt phẳng nằm ngang, động năng của vật tăng dần",
  "Thế năng trọng trường là đại lượng vectơ, có hướng thẳng đứng xuống dưới",
  "Khi tốc độ của vật tăng gấp đôi thì động năng của vật tăng gấp đôi",
];

const H4: Template[] = [
  {
    id: "l10k2-nang-luong-chuyen-hoa", ...M4, topic: "Các dạng năng lượng và sự chuyển hóa năng lượng",
    level: 1, kind: "mcq",
    make: (r) => {
      const e = r.pick(ECV); const k = key(e);
      const lab = (f: string, t: string) => `Từ ${f} sang ${t}`;
      if (r.chance(0.5)) {
        const labels = [...new Set(ECV.map(key))].filter((x) => x !== k && !(e.x || []).includes(x));
        const w = [`${e.t}|${e.f}`, ...r.shuffle(labels)].map((x) => { const [f, t] = x.split("|"); return lab(f, t); });
        return {
          stem: r.pick([`Khi ${lc(e.d)}, năng lượng chủ yếu được chuyển hóa`, `${e.d}. Trong quá trình này, năng lượng chủ yếu được chuyển hóa`]),
          ...mcq(r, lab(e.f, e.t), w),
          explanation: `${e.d}: năng lượng chủ yếu được chuyển hóa từ ${e.f} sang ${e.t}.`,
        };
      }
      const w = r.shuffle(ECV.filter((x) => key(x) !== k && !(x.x || []).includes(k))).map((x) => x.d);
      return {
        stem: `Trường hợp nào sau đây năng lượng chủ yếu được chuyển hóa từ ${e.f} sang ${e.t}?`,
        ...mcq(r, e.d, w),
        explanation: `${e.d}: ${e.f} chủ yếu chuyển hóa thành ${e.t}. Các trường hợp còn lại có dạng chuyển hóa năng lượng khác.`,
      };
    },
  },
  {
    id: "l10k2-cong-ly-thuyet", ...M4, topic: "Công cơ học, công suất – lí thuyết",
    level: 1, kind: "mcq",
    make: (r) => theory(r, CONG_T, CONG_F,
      ["Phát biểu nào sau đây đúng?", "Khi nói về công cơ học, phát biểu nào sau đây đúng?", "Chọn phát biểu đúng về công và công suất.", "Phát biểu nào sau đây về công của lực là đúng?"],
      ["Phát biểu nào sau đây SAI?", "Khi nói về công cơ học, phát biểu nào sau đây KHÔNG đúng?", "Chọn phát biểu sai về công và công suất.", "Phát biểu nào sau đây về công của lực là sai?"],
      (c, t) => `"${c}" là phát biểu ${t ? "đúng" : "sai"}. Nhớ: $A = Fs\\cos\\alpha$ là đại lượng vô hướng (J); $A > 0$ khi $\\alpha$ nhọn, $A = 0$ khi $\\alpha = 90^\\circ$, $A < 0$ khi $\\alpha$ tù; công suất $\\mathscr{P} = \\dfrac{A}{t}$ (W).`),
  },
  {
    id: "l10k2-cong-tinh", ...M4, topic: "Tính công của lực",
    level: 2, kind: "mcq",
    make: (r) => {
      const ty = r.pick(["keo", "keo", "ms", "P"]);
      const obj = r.pick(["một thùng hàng", "một chiếc vali", "một xe trượt", "một thùng gỗ", "một bao gạo"]);
      if (ty === "keo") {
        const F = r.int(2, 30) * 10, s = r.int(2, 25), al = r.pick([0, 30, 45, 60]);
        const A = F * s * Math.cos(DEG(al)), Aw = F * s * Math.sin(DEG(al));
        const ex = okDp(A, 0);
        return {
          stem: `Bạn ${r.pick(NAMES)} kéo ${obj} chuyển động thẳng trên mặt sàn nằm ngang bằng một sợi dây. Lực kéo có độ lớn ${F} N, ${al === 0 ? "có phương nằm ngang" : `hợp với phương ngang một góc ${al}°`}. Công của lực kéo khi vật dịch chuyển được ${s} m là${ex ? "" : " (làm tròn đến hàng đơn vị)"}`,
          ...mcq(r, U(round(A), "J", 0), [U(F * s, "J", 0), U(round(Aw), "J", 0), U(-round(A), "J", 0), U(round(2 * A), "J", 0)]),
          explanation: `$A = Fs\\cos\\alpha = ${F}\\cdot ${s}\\cdot \\cos ${al}^\\circ ${eq(A, 0)} ${round(A)}$ J.`,
        };
      }
      if (ty === "ms") {
        const m = r.int(2, 30), mu = r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]), s = r.int(2, 20);
        const A = mu * m * 10 * s;
        return {
          stem: `Đẩy ${obj} khối lượng ${m} kg trượt trên mặt sàn nằm ngang. Hệ số ma sát trượt giữa vật và sàn là ${vn(mu)}, lấy $g = 10$ m/s². Công của lực ma sát khi vật trượt được ${s} m là`,
          ...mcq(r, U(-A, "J", 1), [U(A, "J", 1), U(-mu * m * s, "J", 1), U(-m * 10 * s, "J", 1), U(-A / 2, "J", 1)]),
          explanation: `$F_{ms} = \\mu mg = ${tex(mu)}\\cdot ${m}\\cdot 10 = ${tex(mu * m * 10)}$ N, ngược hướng chuyển động ($\\alpha = 180^\\circ$): $A = -F_{ms}s = -${tex(mu * m * 10)}\\cdot ${s} = ${tex(-A, 1)}$ J.`,
        };
      }
      const m = r.int(2, 20), h = r.int(1, 10), L = h * r.pick([2, 3, 4, 5]);
      return {
        stem: `Một vật khối lượng ${m} kg trượt từ đỉnh xuống chân một mặt phẳng nghiêng dài ${L} m, cao ${h} m. Lấy $g = 10$ m/s². Công của trọng lực trong quá trình đó là`,
        ...mcq(r, U(m * 10 * h, "J"), [U(m * 10 * L, "J"), U(-m * 10 * h, "J"), U(m * h, "J"), U(m * 10 * (L - h), "J")]),
        explanation: `Công của trọng lực chỉ phụ thuộc độ cao: $A_P = mgh = ${m}\\cdot 10\\cdot ${h} = ${m * 10 * h}$ J (dương vì vật đi xuống).`,
      };
    },
  },
  {
    id: "l10k2-cong-suat", ...M4, topic: "Công suất",
    level: 2, kind: "mcq",
    make: (r) => {
      if (r.chance(0.5)) {
        const m = r.int(2, 40) * 25, h = r.int(2, 30), t = r.int(2, 60);
        const P = m * 10 * h / t; need(okDp(P, 0) && P >= 100);
        const who = r.pick(["Một cần cẩu", "Một máy tời", "Một động cơ thang máy", "Một ròng rọc điện"]);
        return {
          stem: `${who} nâng đều một kiện hàng khối lượng ${m} kg lên độ cao ${h} m trong ${t} s. Lấy $g = 10$ m/s². Công suất trung bình của ${lc(who.replace("Một ", ""))} là`,
          ...mcq(r, U(P, "W", 0), [U(m * 10 * h, "W", 0), U(round(m * h / t, 1), "W", 1), U(m * 10 * h * t, "W", 0), U(round(m * 10 * t / h, 1), "W", 1)]),
          explanation: `$A = mgh = ${m}\\cdot 10\\cdot ${h} = ${m * 10 * h}$ J; $\\mathscr{P} = \\dfrac{A}{t} = \\dfrac{${m * 10 * h}}{${t}} = ${P}$ W.`,
        };
      }
      const kmh = r.pick([36, 54, 72, 90, 108]), v = kmh / 3.6, F = r.int(4, 40) * 100;
      const P = F * v / 1000;
      const who = r.pick(["Một ô tô", "Một xe tải", "Một xe khách", "Một đầu máy kéo"]);
      return {
        stem: `${who} chuyển động thẳng đều với tốc độ ${kmh} km/h. Lực kéo của động cơ có độ lớn ${F} N. Công suất của động cơ là`,
        ...mcq(r, U(P, "kW", 1), [U(F * kmh / 1000, "kW", 1), U(F * v, "kW", 0), U(round(F / v / 1000, 3), "kW", 3), U(2 * P, "kW", 1)]),
        explanation: `$v = ${kmh}$ km/h $= ${tex(v)}$ m/s. $\\mathscr{P} = Fv = ${F}\\cdot ${tex(v)} = ${F * v}$ W $= ${tex(P, 1)}$ kW.`,
      };
    },
  },
  {
    id: "l10k2-dong-nang", ...M4, topic: "Động năng",
    level: 1, kind: "mcq",
    make: (r) => {
      const ty = r.pick(["kg", "g", "t"]);
      if (ty === "kg") {
        const m = r.int(2, 80), v = r.int(2, 12); const W = m * v * v / 2;
        const obj = r.pick(["Một vận động viên", "Một quả tạ", "Một chiếc xe đạp (tính cả người)", "Một con chó đang chạy", "Một thùng hàng"]);
        return {
          stem: `${obj} có khối lượng ${m} kg chuyển động với tốc độ ${v} m/s. Động năng của ${lc(obj.replace("Một ", "")).replace(" (tính cả người)", "")} là`,
          ...mcq(r, U(W, "J", 1), [U(m * v * v, "J"), U(m * v / 2, "J", 1), U(m * v, "J"), U(m * m * v / 2, "J", 1)]),
          explanation: `$W_{\\text{đ}} = \\dfrac{1}{2}mv^2 = \\dfrac{1}{2}\\cdot ${m}\\cdot ${v}^2 = ${tex(W, 1)}$ J.`,
        };
      }
      if (ty === "g") {
        const o = r.pick([{ n: "Một viên đạn", ms: [5, 10, 20], vs: [200, 300, 400, 500, 600] }, { n: "Một quả bóng tennis", ms: [50, 60], vs: [10, 20, 30, 40] }, { n: "Một hòn đá nhỏ", ms: [100, 200, 500], vs: [4, 6, 8, 10, 12] }]);
        const mg = r.pick(o.ms), v = r.pick(o.vs); const m = mg / 1000; const W = m * v * v / 2;
        return {
          stem: `${o.n} có khối lượng ${mg} g bay với tốc độ ${v} m/s. Động năng của vật là`,
          ...mcq(r, U(W, "J"), [U(mg * v * v / 2, "J"), U(m * v * v, "J"), U(m * v / 2, "J", 3), U(W / 10, "J")]),
          explanation: `$m = ${mg}$ g $= ${tex(m, 3)}$ kg. $W_{\\text{đ}} = \\dfrac{1}{2}mv^2 = \\dfrac{1}{2}\\cdot ${tex(m, 3)}\\cdot ${v}^2 = ${tex(W)}$ J.`,
        };
      }
      const mt = r.pick([1, 1.2, 1.5, 2, 2.5]), kmh = r.pick([36, 54, 72]); const v = kmh / 3.6; const W = mt * 1000 * v * v / 2 / 1000;
      return {
        stem: `Một ô tô có khối lượng ${vn(mt)} tấn chuyển động với tốc độ ${kmh} km/h. Động năng của ô tô là`,
        ...mcq(r, U(W, "kJ", 1), [U(mt * kmh * kmh / 2, "kJ", 1), U(2 * W, "kJ", 1), U(mt * v / 2, "kJ", 2), U(W * 1000, "kJ", 0)]),
        explanation: `$m = ${tex(mt * 1000, 0)}$ kg; $v = ${kmh}$ km/h $= ${tex(v)}$ m/s. $W_{\\text{đ}} = \\dfrac{1}{2}mv^2 = \\dfrac{1}{2}\\cdot ${mt * 1000}\\cdot ${tex(v)}^2 = ${tex(W * 1000, 0)}$ J $= ${tex(W, 1)}$ kJ.`,
      };
    },
  },
  {
    id: "l10k2-the-nang", ...M4, topic: "Thế năng trọng trường",
    level: 1, kind: "mcq",
    make: (r) => {
      const m = r.int(1, 20), g = r.pick([10, 9.8]);
      const ty = r.pick(["dat", "gieng", "ban", "tran", "day"]);
      const h = r.int(2, 15);
      let z: number, stem: string, why: string;
      if (ty === "dat") { z = h; stem = `ở độ cao ${h} m so với mặt đất. Chọn mốc thế năng tại mặt đất`; why = `$z = ${h}$ m`; }
      else if (ty === "gieng") { const d = r.int(2, 12); z = h + d; stem = `ở độ cao ${h} m so với mặt đất. Chọn mốc thế năng tại đáy một cái giếng sâu ${d} m`; why = `Vật cao hơn mốc $z = ${h} + ${d} = ${z}$ m`; }
      else if (ty === "ban") { const b = r.pick([0.8, 1, 1.2]); need(h > b); z = round(h - b, 1); stem = `ở độ cao ${h} m so với mặt đất. Chọn mốc thế năng tại mặt bàn cao ${vn(b)} m so với mặt đất`; why = `$z = ${h} - ${tex(b)} = ${tex(z)}$ m`; }
      else if (ty === "tran") { const H = h + r.int(1, 6); z = h - H; stem = `ở độ cao ${h} m so với mặt đất. Chọn mốc thế năng tại một điểm ở độ cao ${H} m so với mặt đất`; why = `Vật ở dưới mốc nên $z = ${h} - ${H} = ${z}$ m`; }
      else { const d = r.int(2, 15); z = -d; stem = `nằm ở đáy một cái giếng sâu ${d} m. Chọn mốc thế năng tại mặt đất`; why = `Vật ở dưới mốc nên $z = -${d}$ m`; }
      const W = m * g * z;
      return {
        stem: `Một vật khối lượng ${m} kg ${stem}. Lấy ${gTxt(g)}. Thế năng trọng trường của vật là`,
        ...mcq(r, U(W, "J", 1), [U(-W, "J", 1), U(m * g * h, "J", 1), U(m * z, "J", 1), U(m * g * (h + 2 * Math.abs(z)), "J", 1), U(m * g * Math.abs(z) / 2, "J", 1)]),
        explanation: `$W_t = mgz$ với $z$ là độ cao so với mốc thế năng. ${why}, nên $W_t = ${m}\\cdot ${tex(g)}\\cdot ${z < 0 ? `(${tex(z)})` : tex(z)} = ${tex(W, 1)}$ J.`,
      };
    },
  },
  {
    id: "l10k2-co-nang-ly-thuyet", ...M4, topic: "Động năng, thế năng, cơ năng – lí thuyết",
    level: 1, kind: "mcq",
    make: (r) => theory(r, CN_T, CN_F,
      ["Phát biểu nào sau đây đúng?", "Khi nói về động năng, thế năng và cơ năng, phát biểu nào sau đây đúng?", "Chọn phát biểu đúng.", "Khi nói về định luật bảo toàn cơ năng, phát biểu nào sau đây đúng?"],
      ["Phát biểu nào sau đây SAI?", "Khi nói về động năng, thế năng và cơ năng, phát biểu nào sau đây KHÔNG đúng?", "Chọn phát biểu sai.", "Khi nói về định luật bảo toàn cơ năng, phát biểu nào sau đây sai?"],
      (c, t) => `"${c}" là phát biểu ${t ? "đúng" : "sai"}. Nhớ: $W_{\\text{đ}} = \\dfrac{1}{2}mv^2 \\ge 0$; $W_t = mgz$ phụ thuộc mốc; $W = W_{\\text{đ}} + W_t$ chỉ bảo toàn khi vật chỉ chịu tác dụng của trọng lực (lực thế).`),
  },
  {
    id: "l10k2-bao-toan-co-nang", ...M4, topic: "Định luật bảo toàn cơ năng",
    level: 2, kind: "mcq",
    make: (r) => {
      const ty = r.pick(["roi", "truot", "len", "wd"]);
      const gg = "Bỏ qua sức cản của không khí, lấy $g = 10$ m/s².";
      if (ty === "roi" || ty === "truot") {
        const v = r.pick([4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 30]); const h = v * v / 20;
        const L = round(h * r.pick([1.5, 2, 2.5, 3]), 2);
        const stem = ty === "roi"
          ? `Một vật được thả rơi tự do không vận tốc đầu từ độ cao ${vn(h)} m so với mặt đất. ${gg} Tốc độ của vật ngay trước khi chạm đất là`
          : `Một vật nhỏ trượt không vận tốc đầu, không ma sát từ đỉnh một mặt phẳng nghiêng cao ${vn(h)} m, dài ${vn(L)} m. Lấy $g = 10$ m/s². Tốc độ của vật ở chân mặt phẳng nghiêng là`;
        return {
          stem,
          ...mcq(r, U(v, "m/s"), [U(v * v, "m/s"), U(round(Math.sqrt(10 * h), 1), "m/s", 1), ty === "truot" ? U(round(Math.sqrt(20 * L), 1), "m/s", 1) : U(2 * v, "m/s"), U(v / 2, "m/s"), U(10 * h, "m/s")]),
          explanation: `Chọn mốc thế năng ở ${ty === "roi" ? "mặt đất" : "chân mặt phẳng nghiêng"}. Bảo toàn cơ năng: $mgh = \\dfrac{1}{2}mv^2 \\Rightarrow v = \\sqrt{2gh} = \\sqrt{2\\cdot 10\\cdot ${tex(h)}} = ${v}$ m/s${ty === "truot" ? " (không phụ thuộc chiều dài mặt phẳng nghiêng)" : ""}.`,
        };
      }
      if (ty === "len") {
        const v0 = r.int(3, 20); const H = v0 * v0 / 20;
        return {
          stem: `Từ mặt đất, một vật được ném thẳng đứng lên trên với tốc độ ban đầu ${v0} m/s. ${gg} Độ cao cực đại mà vật đạt được là`,
          ...mcq(r, U(H, "m"), [U(v0 * v0 / 10, "m"), U(v0 * v0 / 2, "m"), U(v0 / 2, "m"), U(v0 / 20, "m")]),
          explanation: `Chọn mốc thế năng ở mặt đất. Tại độ cao cực đại $v = 0$: $\\dfrac{1}{2}mv_0^2 = mgH \\Rightarrow H = \\dfrac{v_0^2}{2g} = \\dfrac{${v0}^2}{20} = ${tex(H)}$ m.`,
        };
      }
      const H = r.int(5, 60), n = r.pick([1, 2, 3, 4]); const h = H / (n + 1); need(okDp(h, 2));
      return {
        stem: `Một vật được thả rơi tự do từ độ cao ${H} m so với mặt đất. ${gg} Chọn mốc thế năng tại mặt đất. Ở độ cao nào thì động năng của vật bằng ${n === 1 ? "" : n + " lần "}thế năng của nó?`,
        ...mcq(r, U(h, "m"), [U(H / n, "m"), U(n * H / (n + 1), "m"), U(H / (n + 2), "m"), U(2 * H / (n + 2), "m"), U(H / (2 * n + 2), "m")]),
        explanation: `Cơ năng $W = mgH$. Khi $W_{\\text{đ}} = ${n === 1 ? "" : n}W_t$: $W = ${n + 1}W_t = ${n + 1}mgh \\Rightarrow h = \\dfrac{H}{${n + 1}} = ${tex(h)}$ m.`,
      };
    },
  },
  {
    id: "l10k2-hieu-suat", ...M4, topic: "Hiệu suất",
    level: 2, kind: "mcq",
    make: (r) => {
      if (r.chance(0.55)) {
        const Hp = r.int(10, 19) * 5, m = r.int(2, 40) * 10, h = r.int(2, 20), t = r.int(2, 30);
        const Pci = m * 10 * h / t; const Ptp = Pci * 100 / Hp; need(okDp(Ptp, 0) && okDp(Pci, 2));
        const Hw = round(m * h / t / Ptp * 100, 1);
        return {
          stem: `Một động cơ điện có công suất tiêu thụ ${Ptp} W nâng đều một vật khối lượng ${m} kg lên độ cao ${h} m trong ${t} s. Lấy $g = 10$ m/s². Hiệu suất của động cơ là`,
          ...mcq(r, `${Hp}%`, [`${100 - Hp}%`, `${vn(Hw, 1)}%`, `${vn(round(Ptp / Pci * 100, 1), 1)}%`, `${vn(round(Hp / 2, 1), 1)}%`]),
          explanation: `Công suất có ích $\\mathscr{P}_{ci} = \\dfrac{mgh}{t} = \\dfrac{${m}\\cdot 10\\cdot ${h}}{${t}} = ${tex(Pci)}$ W. Hiệu suất $H = \\dfrac{\\mathscr{P}_{ci}}{\\mathscr{P}_{tp}} = \\dfrac{${tex(Pci)}}{${Ptp}} = ${Hp}\\%$.`,
        };
      }
      const Hp = r.int(5, 18) * 5, Q = r.int(4, 60) * 5; const A = Hp * Q / 100;
      const dev = r.pick(["Một động cơ nhiệt", "Một động cơ xăng", "Một động cơ diesel", "Một máy hơi nước"]);
      return {
        stem: `${dev} có hiệu suất ${Hp}%. Trong một khoảng thời gian, nhiên liệu cháy cung cấp cho động cơ năng lượng ${Q} MJ. Công có ích mà động cơ thực hiện được trong khoảng thời gian đó là`,
        ...mcq(r, U(A, "MJ"), [U(Q - A, "MJ"), U(round(Q * 100 / Hp, 2), "MJ"), U(Q, "MJ"), U(round(A / 10, 2), "MJ")]),
        explanation: `$H = \\dfrac{A_{ci}}{A_{tp}} \\Rightarrow A_{ci} = H\\cdot A_{tp} = ${tex(Hp / 100)}\\cdot ${Q} = ${tex(A)}$ MJ.`,
      };
    },
  },
  {
    id: "l10k2-dinh-ly-dong-nang", ...M4, topic: "Định lí động năng – lực cản",
    level: 3, kind: "mcq",
    make: (r) => {
      if (r.chance(0.5)) {
        const mg = r.pick([5, 10, 20]), v1 = r.int(6, 16) * 50, v2 = r.int(1, 10) * 50, dcm = r.pick([2, 4, 5, 8, 10, 20]); need(v2 < v1);
        const m = mg / 1000, d = dcm / 100; const F = m * (v1 * v1 - v2 * v2) / (2 * d); need(okDp(F, 0));
        return {
          stem: `Một viên đạn khối lượng ${mg} g bay theo phương ngang với tốc độ ${v1} m/s xuyên qua một tấm gỗ dày ${dcm} cm. Sau khi xuyên qua tấm gỗ, tốc độ của viên đạn còn ${v2} m/s. Độ lớn lực cản trung bình của tấm gỗ tác dụng lên viên đạn là`,
          ...mcq(r, U(F, "N", 0), [U(round(m * (v1 - v2) ** 2 / (2 * d)), "N", 0), U(2 * F, "N", 0), U(round(m * v1 * v1 / (2 * d)), "N", 0), U(round(F / 100), "N", 0)]),
          explanation: `Định lí động năng: $A_c = \\dfrac{1}{2}m(v_2^2 - v_1^2) = -F_c d$ $\\Rightarrow F_c = \\dfrac{m(v_1^2 - v_2^2)}{2d} = \\dfrac{${tex(m, 3)}(${v1}^2 - ${v2}^2)}{2\\cdot ${tex(d)}} = ${F}$ N.`,
        };
      }
      const mt = r.pick([1, 1.2, 1.5, 2, 2.5, 3]), kmh = r.pick([36, 54, 72, 90]), s = r.int(2, 20) * 5;
      const m = mt * 1000, v = kmh / 3.6; const F = m * v * v / (2 * s); need(okDp(F, 0));
      return {
        stem: `Một ô tô khối lượng ${vn(mt)} tấn đang chạy với tốc độ ${kmh} km/h thì hãm phanh, đi thêm được ${s} m thì dừng lại. Độ lớn lực hãm trung bình tác dụng lên xe là`,
        ...mcq(r, U(F, "N", 0), [U(2 * F, "N", 0), U(round(m * kmh * kmh / (2 * s)), "N", 0), U(round(m * v / (2 * s)), "N", 0), U(F / 2, "N", 0)]),
        explanation: `$v_0 = ${tex(v)}$ m/s. Định lí động năng: $0 - \\dfrac{1}{2}mv_0^2 = -F s \\Rightarrow F = \\dfrac{mv_0^2}{2s} = \\dfrac{${m}\\cdot ${tex(v)}^2}{2\\cdot ${s}} = ${F}$ N.`,
      };
    },
  },
  /* ---- Đúng/Sai ---- */
  {
    id: "l10k2-tf-nem-thang-dung", ...M4, topic: "Bảo toàn cơ năng – vật ném thẳng đứng",
    level: 2, kind: "tf",
    make: (r) => {
      const v0 = r.int(4, 20), vg = r.int(v0 + 1, 40); const h0 = (vg * vg - v0 * v0) / 20; need(okDp(h0, 1) && h0 >= 2 && h0 <= 60);
      const m = r.pick([0.1, 0.2, 0.5, 1, 2]); const Hm = h0 + v0 * v0 / 20; const W = m * 10 * Hm;
      need(okDp(Hm / 2, 3) && okDp(W, 2));
      const st = tfv(r, [
        [`Cơ năng của vật bằng ${vn(W)} J.`, `Cơ năng của vật bằng ${vn(m * v0 * v0 / 2)} J.`],
        [`Độ cao cực đại vật đạt được so với mặt đất là ${vn(Hm, 3)} m.`, `Độ cao cực đại vật đạt được so với mặt đất là ${vn(v0 * v0 / 20, 3)} m.`],
        [`Tốc độ của vật ngay trước khi chạm đất là ${vg} m/s.`, `Tốc độ của vật ngay trước khi chạm đất là ${vn(round(Math.sqrt(20 * h0), 1), 1)} m/s.`],
        [`Ở độ cao ${vn(Hm / 2, 3)} m so với mặt đất, động năng của vật bằng thế năng của nó.`, `Ở độ cao ${vn(h0 / 2, 3)} m so với mặt đất, động năng của vật bằng thế năng của nó.`],
      ]);
      return {
        stem: `Từ độ cao ${vn(h0)} m so với mặt đất, một vật khối lượng ${m >= 1 ? `${m} kg` : `${vn(m * 1000)} g`} được ném thẳng đứng lên trên với tốc độ ban đầu ${v0} m/s. Bỏ qua sức cản của không khí, lấy $g = 10$ m/s², chọn mốc thế năng tại mặt đất.`,
        ...st,
        explanation: tfExp(st.statements, [
          `$W = \\dfrac{1}{2}mv_0^2 + mgh_0 = \\dfrac{1}{2}\\cdot ${tex(m)}\\cdot ${v0}^2 + ${tex(m)}\\cdot 10\\cdot ${tex(h0)} = ${tex(W)}$ J`,
          `$W = mgH_{max} \\Rightarrow H_{max} = \\dfrac{${tex(W)}}{${tex(m * 10)}} = ${tex(Hm, 3)}$ m`,
          `$\\dfrac{1}{2}mv^2 = W \\Rightarrow v = \\sqrt{v_0^2 + 2gh_0} = \\sqrt{${v0 * v0} + ${tex(20 * h0)}} = ${vg}$ m/s`,
          `$W_{\\text{đ}} = W_t \\Rightarrow W = 2mgh \\Rightarrow h = \\dfrac{H_{max}}{2} = ${tex(Hm / 2, 3)}$ m`,
        ]),
      };
    },
  },
  {
    id: "l10k2-tf-may-nang", ...M4, topic: "Công, công suất, hiệu suất của động cơ",
    level: 3, kind: "tf",
    make: (r) => {
      const m = r.int(2, 20) * 50, v = r.pick([0.2, 0.25, 0.4, 0.5, 0.8, 1, 1.2, 1.5]);
      const Pci = m * 10 * v; const Hp = r.int(12, 18) * 5; const Ptp = Pci * 100 / Hp; need(isInt(Ptp));
      const h = r.int(3, 20); const t = h / v; need(okDp(t, 2));
      const A = m * 10 * h;
      const st = tfv(r, [
        [`Lực kéo của động cơ có độ lớn bằng trọng lượng của vật.`, `Lực kéo của động cơ lớn hơn trọng lượng của vật.`],
        [`Công có ích động cơ thực hiện khi nâng vật lên cao ${h} m là ${vn(A / 1000, 3)} kJ.`, `Công có ích động cơ thực hiện khi nâng vật lên cao ${h} m là ${vn(m * h / 1000, 3)} kJ.`],
        [`Thời gian để nâng vật lên cao ${h} m là ${vn(t)} s.`, `Thời gian để nâng vật lên cao ${h} m là ${vn(okDp(h * v, 2) && round(h * v, 2) !== round(t, 2) ? h * v : 2 * t)} s.`],
        [`Hiệu suất của động cơ là ${Hp}%.`, `Hiệu suất của động cơ là ${100 - Hp}%.`],
      ]);
      return {
        stem: `Một động cơ điện có công suất tiêu thụ ${Ptp} W được dùng để kéo một vật khối lượng ${m} kg lên cao theo phương thẳng đứng với tốc độ không đổi ${vn(v)} m/s. Lấy $g = 10$ m/s².`,
        ...st,
        explanation: tfExp(st.statements, [
          `Vật chuyển động thẳng đều nên lực kéo cân bằng trọng lực: $F = mg = ${m * 10}$ N`,
          `$A_{ci} = mgh = ${m}\\cdot 10\\cdot ${h} = ${A}$ J $= ${tex(A / 1000, 3)}$ kJ`,
          `$t = \\dfrac{h}{v} = \\dfrac{${h}}{${tex(v)}} = ${tex(t)}$ s`,
          `$\\mathscr{P}_{ci} = Fv = ${m * 10}\\cdot ${tex(v)} = ${tex(Pci)}$ W; $H = \\dfrac{${tex(Pci)}}{${Ptp}} = ${Hp}\\%$`,
        ]),
      };
    },
  },
  /* ---- Trả lời ngắn ---- */
  {
    id: "l10k2-s-cong", ...M4, topic: "Tính công của lực",
    level: 1, kind: "short",
    make: (r) => {
      const ty = r.pick(["ngang", "60", "P"]);
      if (ty === "P") {
        const m = r.int(1, 30), h = r.int(2, 30); const A = m * 10 * h; need(ok4(A, 0));
        return { stem: `Một vật khối lượng ${m} kg rơi từ độ cao ${h} m xuống mặt đất. Lấy $g = 10$ m/s². Công của trọng lực trong quá trình đó bằng bao nhiêu jun?`, ...short(A, 0), explanation: `$A_P = mgh = ${m}\\cdot 10\\cdot ${h} = ${A}$ J.` };
      }
      const F = r.int(2, 50) * 10, s = r.int(2, 20); const c = ty === "60" ? 0.5 : 1; const A = F * s * c; need(ok4(A, 0));
      return {
        stem: `Một người kéo một thùng hàng chuyển động trên sàn nằm ngang bằng lực ${F} N ${ty === "60" ? "có hướng hợp với phương ngang một góc 60°" : "theo phương ngang"}. Công của lực kéo khi thùng dịch chuyển được ${s} m bằng bao nhiêu jun?`,
        ...short(A, 0),
        explanation: `$A = Fs\\cos\\alpha = ${F}\\cdot ${s}\\cdot \\cos ${ty === "60" ? 60 : 0}^\\circ = ${A}$ J.`,
      };
    },
  },
  {
    id: "l10k2-s-cong-suat", ...M4, topic: "Công suất",
    level: 1, kind: "short",
    make: (r) => {
      if (r.chance(0.5)) {
        const m = r.int(5, 20), h = r.int(4, 15), t = r.int(5, 40); const P = m * 10 * h / t; need(ok4(round(P, 1), 1));
        return { stem: `Một người kéo đều một gàu nước khối lượng ${m} kg từ giếng sâu ${h} m lên trong ${t} s. Lấy $g = 10$ m/s². Công suất trung bình của người đó bằng bao nhiêu oát? (làm tròn đến hàng phần mười)`, ...short(P, 1), explanation: `$A = mgh = ${m * 10 * h}$ J; $\\mathscr{P} = \\dfrac{A}{t} = \\dfrac{${m * 10 * h}}{${t}} ${eq(P, 1)} ${tex(P, 1)}$ W.` };
      }
      const A = r.int(3, 90) * 10, tm = r.pick([1, 2, 4, 5, 10]); const P = A * 1000 / (tm * 60); need(ok4(round(P, 1), 1));
      return { stem: `Một máy thực hiện công ${A} kJ trong ${tm} phút. Công suất trung bình của máy bằng bao nhiêu oát? (làm tròn đến hàng phần mười)`, ...short(P, 1), explanation: `$\\mathscr{P} = \\dfrac{A}{t} = \\dfrac{${A}\\cdot 10^3}{${tm * 60}} ${eq(P, 1)} ${tex(P, 1)}$ W.` };
    },
  },
  {
    id: "l10k2-s-bao-toan-co-nang", ...M4, topic: "Định luật bảo toàn cơ năng",
    level: 3, kind: "short",
    make: (r) => {
      const g = r.pick([10, 9.8]);
      if (r.chance(0.55)) {
        const v0 = r.int(2, 20), h = r.int(2, 40); const v = Math.sqrt(v0 * v0 + 2 * g * h); need(ok4(round(v, 1), 1));
        const how = r.pick(["thẳng đứng lên trên", "thẳng đứng xuống dưới", "theo phương ngang", "xiên lên một góc 30° so với phương ngang", "xiên lên một góc 45° so với phương ngang"]);
        return { stem: `Từ độ cao ${h} m so với mặt đất, một vật được ném ${how} với tốc độ ban đầu ${v0} m/s. Bỏ qua sức cản của không khí, lấy ${gTxt(g)}. Tốc độ của vật ngay trước khi chạm đất bằng bao nhiêu m/s? (làm tròn đến hàng phần mười)`, ...short(v, 1), explanation: `Bảo toàn cơ năng (mốc ở mặt đất): $\\dfrac{1}{2}mv_0^2 + mgh = \\dfrac{1}{2}mv^2 \\Rightarrow v = \\sqrt{v_0^2 + 2gh} = \\sqrt{${v0}^2 + 2\\cdot ${tex(g)}\\cdot ${h}} ${eq(v, 1)} ${tex(v, 1)}$ m/s (không phụ thuộc hướng ném).` };
      }
      const v0 = r.int(8, 30), v1 = r.int(1, v0 - 2); const z = (v0 * v0 - v1 * v1) / (2 * g); need(ok4(round(z, 2), 2));
      return { stem: `Từ mặt đất, một vật được ném thẳng đứng lên trên với tốc độ ${v0} m/s. Bỏ qua sức cản của không khí, lấy ${gTxt(g)}. Khi vật có tốc độ ${v1} m/s thì vật ở độ cao bao nhiêu mét so với mặt đất? (làm tròn đến hàng phần trăm)`, ...short(z, 2), explanation: `$\\dfrac{1}{2}mv_0^2 = \\dfrac{1}{2}mv^2 + mgz \\Rightarrow z = \\dfrac{v_0^2 - v^2}{2g} = \\dfrac{${v0}^2 - ${v1}^2}{2\\cdot ${tex(g)}} ${eq(z, 2)} ${tex(z)}$ m.` };
    },
  },
  {
    id: "l10k2-s-hieu-suat", ...M4, topic: "Hiệu suất",
    level: 3, kind: "short",
    make: (r) => {
      if (r.chance(0.5)) {
        const V = r.int(3, 30) * 10, h = r.int(4, 30), P = r.int(4, 40) * 100; const Pci = V * 10 * h / 60; const H = Pci / P * 100; need(H > 30 && H < 95);
        return { stem: `Một máy bơm mỗi phút bơm được ${V} lít nước lên bể chứa ở độ cao ${h} m. Công suất tiêu thụ của máy bơm là ${P} W. Biết khối lượng riêng của nước là 1000 kg/m³, lấy $g = 10$ m/s². Hiệu suất của máy bơm bằng bao nhiêu phần trăm? (làm tròn đến hàng đơn vị)`, ...short(H, 0), explanation: `${V} lít nước có khối lượng ${V} kg. Công có ích trong 1 phút: $A = mgh = ${V}\\cdot 10\\cdot ${h} = ${V * 10 * h}$ J; $\\mathscr{P}_{ci} = \\dfrac{${V * 10 * h}}{60} ${eq(Pci, 2)} ${tex(Pci)}$ W. $H = \\dfrac{\\mathscr{P}_{ci}}{\\mathscr{P}} \\approx ${tex(round(H, 0), 0)}\\%$.` };
      }
      const m = r.int(5, 50) * 2, h = r.pick([0.5, 0.8, 1, 1.2, 1.5, 2]), L = r.pick([2, 2.5, 3, 4, 5, 6]); need(L > 1.5 * h);
      const F = round(m * 10 * h / L * r.pick([1.1, 1.2, 1.25, 1.3, 1.4, 1.5]), 0); const H = m * 10 * h / (F * L) * 100; need(H > 40 && H < 98);
      return { stem: `Để đưa một thùng hàng khối lượng ${m} kg lên sàn xe tải cao ${vn(h)} m, người ta dùng một tấm ván nghiêng dài ${vn(L)} m và đẩy thùng đều lên với lực ${F} N song song với mặt ván. Lấy $g = 10$ m/s². Hiệu suất của mặt phẳng nghiêng bằng bao nhiêu phần trăm? (làm tròn đến hàng đơn vị)`, ...short(H, 0), explanation: `$A_{ci} = mgh = ${m}\\cdot 10\\cdot ${tex(h)} = ${tex(m * 10 * h)}$ J; $A_{tp} = FL = ${F}\\cdot ${tex(L)} = ${tex(F * L)}$ J. $H = \\dfrac{A_{ci}}{A_{tp}} ${eq(H, 0)} ${round(H)}\\%$.` };
    },
  },
];

/* ================= CHƯƠNG V ================= */
const DL_T = [
  "Động lượng của một vật là đại lượng vectơ, cùng hướng với vận tốc của vật",
  "Đơn vị của động lượng trong hệ SI là kg.m/s",
  "Động lượng của một hệ kín (hệ cô lập) được bảo toàn",
  "Xung lượng của lực tác dụng lên vật trong khoảng thời gian $\\Delta t$ bằng độ biến thiên động lượng của vật trong khoảng thời gian đó",
  "Trong va chạm mềm, sau va chạm hai vật dính vào nhau và chuyển động với cùng vận tốc",
  "Chuyển động bằng phản lực của tên lửa tuân theo định luật bảo toàn động lượng",
  "Hệ hai vật va chạm nhau trong thời gian rất ngắn có thể coi gần đúng là hệ kín",
  "Trong va chạm đàn hồi, động lượng và động năng của hệ đều được bảo toàn",
  "Trong va chạm mềm, động lượng của hệ được bảo toàn nhưng động năng của hệ giảm",
];
const DL_F = [
  "Động lượng là đại lượng vô hướng, luôn dương",
  "Đơn vị của động lượng trong hệ SI là kg.m/s²",
  "Động lượng của một vật luôn được bảo toàn dù vật chịu tác dụng của ngoại lực",
  "Trong va chạm mềm, động năng của hệ được bảo toàn",
  "Động lượng của vật tỉ lệ với bình phương tốc độ của vật",
  "Vật chuyển động tròn đều thì động lượng của vật không đổi",
  "Xung lượng của lực bằng tích của lực và quãng đường vật đi được",
  "Hai vật có cùng khối lượng, chuyển động với cùng tốc độ thì luôn có cùng động lượng",
  "Trong va chạm đàn hồi, động lượng của hệ được bảo toàn nhưng động năng của hệ giảm",
];
const H5: Template[] = [
  {
    id: "l10k2-dong-luong-ly-thuyet", ...M5, topic: "Động lượng, va chạm – lí thuyết",
    level: 1, kind: "mcq",
    make: (r) => theory(r, DL_T, DL_F,
      ["Phát biểu nào sau đây đúng?", "Khi nói về động lượng, phát biểu nào sau đây đúng?", "Chọn phát biểu đúng về động lượng và định luật bảo toàn động lượng.", "Khi nói về va chạm và định luật bảo toàn động lượng, phát biểu nào sau đây đúng?"],
      ["Phát biểu nào sau đây SAI?", "Khi nói về động lượng, phát biểu nào sau đây KHÔNG đúng?", "Chọn phát biểu sai về động lượng và định luật bảo toàn động lượng.", "Khi nói về va chạm và định luật bảo toàn động lượng, phát biểu nào sau đây sai?"],
      (c, t) => `"${c}" là phát biểu ${t ? "đúng" : "sai"}. Nhớ: $\\vec p = m\\vec v$ (kg.m/s) là vectơ; $\\vec F\\Delta t = \\Delta \\vec p$; hệ kín thì động lượng bảo toàn; va chạm đàn hồi bảo toàn cả động năng, va chạm mềm thì động năng giảm.`),
  },
  {
    id: "l10k2-dong-luong-tinh", ...M5, topic: "Tính động lượng",
    level: 1, kind: "mcq",
    make: (r) => {
      const ty = r.pick(["kg", "g", "t"]);
      if (ty === "kg") {
        const m = r.int(2, 80), v = r.int(2, 15); const obj = r.pick(["Một vận động viên", "Một quả tạ", "Một chiếc xe đẩy", "Một con chó", "Một thùng hàng"]);
        return { stem: `${obj} có khối lượng ${m} kg chuyển động với tốc độ ${v} m/s. Độ lớn động lượng của vật là`, ...mcq(r, U(m * v, "kg.m/s"), [U(m * v * v / 2, "kg.m/s", 1), U(m * v / 2, "kg.m/s", 1), U(round(m / v, 2), "kg.m/s"), U(m * v * v, "kg.m/s")]), explanation: `$p = mv = ${m}\\cdot ${v} = ${m * v}$ kg.m/s.` };
      }
      if (ty === "g") {
        const o = r.pick([{ n: "Một viên đạn", ms: [5, 10, 20], vs: [200, 300, 400, 500, 600, 800] }, { n: "Một quả bóng tennis", ms: [50, 60], vs: [10, 20, 30, 40] }, { n: "Một quả bóng chày", ms: [140, 150], vs: [20, 30, 40] }]);
        const mg = r.pick(o.ms), v = r.pick(o.vs); const p = mg * v / 1000;
        return { stem: `${o.n} khối lượng ${mg} g bay với tốc độ ${v} m/s. Độ lớn động lượng của vật là`, ...mcq(r, U(p, "kg.m/s"), [U(mg * v, "kg.m/s"), U(p / 2, "kg.m/s", 3), U(p * v / 2, "kg.m/s", 1), U(p * 10, "kg.m/s")]), explanation: `$p = mv = ${tex(mg / 1000, 3)}\\cdot ${v} = ${tex(p)}$ kg.m/s.` };
      }
      const mt = r.pick([1, 1.2, 1.5, 2, 2.5, 4]), kmh = r.pick([36, 54, 72, 90]); const v = kmh / 3.6; const p = mt * 1000 * v;
      return { stem: `Một ô tô có khối lượng ${vn(mt)} tấn chuyển động thẳng với tốc độ ${kmh} km/h. Độ lớn động lượng của ô tô là`, ...mcq(r, U(p, "kg.m/s", 0), [U(mt * 1000 * kmh, "kg.m/s", 0), U(mt * v, "kg.m/s", 1), U(p * v / 2, "kg.m/s", 0), U(p / 2, "kg.m/s", 0)]), explanation: `$m = ${mt * 1000}$ kg, $v = ${tex(v)}$ m/s. $p = mv = ${mt * 1000}\\cdot ${tex(v)} = ${p}$ kg.m/s.` };
    },
  },
  {
    id: "l10k2-xung-luong", ...M5, topic: "Xung lượng của lực, độ biến thiên động lượng",
    level: 2, kind: "mcq",
    make: (r) => {
      const ty = r.pick(["F", "dp", "v"]);
      if (ty === "v") {
        const m = r.pick([0.5, 1, 2, 4, 5]), F = r.int(2, 30) * 5, dt = r.pick([0.1, 0.2, 0.4, 0.5, 1, 2]); const v = F * dt / m; need(okDp(v, 2));
        return { stem: `Một vật khối lượng ${vn(m)} kg đang đứng yên trên mặt phẳng nằm ngang nhẵn thì chịu tác dụng của lực ${F} N theo phương ngang trong thời gian ${vn(dt)} s. Tốc độ của vật ngay sau khi lực ngừng tác dụng là`, ...mcq(r, U(v, "m/s"), [U(F * dt * m, "m/s"), U(round(F / (m * dt), 2), "m/s"), U(F * dt, "m/s"), U(v / 2, "m/s")]), explanation: `$F\\Delta t = \\Delta p = mv - 0 \\Rightarrow v = \\dfrac{F\\Delta t}{m} = \\dfrac{${F}\\cdot ${tex(dt)}}{${tex(m)}} = ${tex(v)}$ m/s.` };
      }
      const mg = r.pick([50, 100, 200, 300, 400, 450, 500]), v = r.int(4, 20), dt = r.pick([0.01, 0.02, 0.04, 0.05, 0.1]);
      const m = mg / 1000; const dp = 2 * m * v; const F = dp / dt; need(okDp(F, 1));
      const ball = r.pick(["Một quả bóng", "Một quả bóng cao su", "Một quả bóng tennis", "Một quả bóng đá"]);
      const intro = `${ball} khối lượng ${mg} g bay theo phương vuông góc với một bức tường với tốc độ ${v} m/s, đập vào tường rồi bật ngược trở lại với cùng tốc độ.`;
      if (ty === "dp") return { stem: `${intro} Độ lớn độ biến thiên động lượng của quả bóng là`, ...mcq(r, U(dp, "kg.m/s"), [U(0, "kg.m/s"), U(m * v, "kg.m/s"), U(2 * mg * v, "kg.m/s"), U(4 * m * v, "kg.m/s")]), explanation: `Chọn chiều dương là chiều bóng bật ra: $\\Delta p = mv - (-mv) = 2mv = 2\\cdot ${tex(m, 3)}\\cdot ${v} = ${tex(dp)}$ kg.m/s (không bằng 0 vì động lượng là vectơ).` };
      return { stem: `${intro} Thời gian va chạm là ${vn(dt)} s. Độ lớn lực trung bình do tường tác dụng lên bóng là`, ...mcq(r, U(F, "N", 1), [U(F / 2, "N", 1), U(0, "N"), U(round(dp * dt, 4), "N", 4), U(2 * F, "N", 1)]), explanation: `$\\Delta p = 2mv = ${tex(dp)}$ kg.m/s. $F = \\dfrac{\\Delta p}{\\Delta t} = \\dfrac{${tex(dp)}}{${tex(dt)}} = ${tex(F, 1)}$ N.` };
    },
  },
  {
    id: "l10k2-va-cham-mem", ...M5, topic: "Định luật bảo toàn động lượng – va chạm mềm, súng giật",
    level: 2, kind: "mcq",
    make: (r) => {
      if (r.chance(0.3)) {
        const M = r.pick([2, 3, 4, 5, 6, 8, 10]), mg = r.pick([10, 15, 20, 25, 30, 40, 50]), v = r.int(3, 9) * 100; const V = mg / 1000 * v / M; need(okDp(V, 2));
        const gun = r.pick(["Một khẩu súng", "Một khẩu súng trường", "Một khẩu súng săn"]);
        return { stem: `${gun} có khối lượng ${M} kg đang đứng yên thì bắn ra một viên đạn khối lượng ${mg} g theo phương ngang với tốc độ ${v} m/s. Tốc độ giật lùi của súng ngay sau khi bắn là`, ...mcq(r, U(V, "m/s"), [U(mg * v / M, "m/s"), U(round(M * v / (mg / 1000), 0), "m/s", 0), U(mg / 1000 * v, "m/s"), U(V * 2, "m/s")]), explanation: `Hệ súng – đạn kín, ban đầu đứng yên: $0 = m\\vec v + M\\vec V \\Rightarrow V = \\dfrac{mv}{M} = \\dfrac{${tex(mg / 1000, 3)}\\cdot ${v}}{${M}} = ${tex(V)}$ m/s, súng chuyển động ngược chiều đạn.` };
      }
      const m1 = r.int(1, 10), m2 = r.int(1, 10), v1 = r.int(2, 12), v2 = r.int(1, 8);
      const mode = r.pick(["rest", "same", "opp"]); const s = mode === "rest" ? 0 : mode === "same" ? 1 : -1;
      need(!(mode === "same" && v2 >= v1));
      const V = (m1 * v1 + s * m2 * v2) / (m1 + m2); need(okDp(V, 2) && V !== 0);
      const obj = r.pick(["xe lăn", "toa xe", "xe goòng", "viên bi"]);
      const st2 = mode === "rest" ? `đứng yên` : `chuyển động với tốc độ ${v2} m/s ${mode === "same" ? "cùng chiều" : "ngược chiều"} với ${obj} thứ nhất`;
      const alt = Math.abs((m1 * v1 - s * m2 * v2) / (m1 + m2));
      return {
        stem: `Một ${obj} khối lượng ${m1} kg chuyển động thẳng với tốc độ ${v1} m/s đến va chạm vào ${obj} thứ hai khối lượng ${m2} kg đang ${st2}. Sau va chạm hai ${obj} dính vào nhau và chuyển động cùng vận tốc. Bỏ qua ma sát. Tốc độ của hai ${obj} ngay sau va chạm là`,
        ...mcq(r, U(Math.abs(V), "m/s"), [U(mode === "rest" ? v1 / 2 : alt, "m/s"), U(round(m1 * v1 / m2, 2), "m/s"), U((v1 + s * v2) / 2 === Math.abs(V) ? v1 : Math.abs((v1 + s * v2) / 2), "m/s"), U(round((m1 * v1 + s * m2 * v2) / m1, 2), "m/s"), U(v1, "m/s")]),
        explanation: `Chọn chiều dương là chiều chuyển động của ${obj} thứ nhất. Bảo toàn động lượng: $m_1v_1 ${mode === "rest" ? "" : `${s > 0 ? "+" : "-"} m_2v_2`} = (m_1 + m_2)V \\Rightarrow V = \\dfrac{${m1}\\cdot ${v1}${mode === "rest" ? "" : ` ${s > 0 ? "+" : "-"} ${m2}\\cdot ${v2}`}}{${m1 + m2}} = ${tex(V)}$ m/s${V < 0 ? " (dấu âm: hai vật chuyển động theo chiều ngược với chiều dương)" : ""}. Tốc độ là $${tex(Math.abs(V))}$ m/s.`,
      };
    },
  },
  {
    id: "l10k2-dong-luong-he", ...M5, topic: "Động lượng của hệ hai vật",
    level: 3, kind: "mcq",
    make: (r) => {
      const ty = r.pick(["0", "180", "90", "90", "60", "120"]);
      const opt = (s: string) => `$${s}$ kg.m/s`;
      if (ty === "90") {
        const [a, b] = r.pick([[3, 4], [6, 8], [5, 12], [8, 6], [4, 3], [12, 5], [8, 15], [9, 12], [15, 8], [12, 9]]);
        const k = r.pick([1, 2]); const p1 = a * k, p2 = b * k; const p = Math.sqrt(p1 * p1 + p2 * p2);
        const m1 = r.pick([1, 2, 3, 4, 5, 6].filter((d) => p1 % d === 0)), m2 = r.pick([1, 2, 3, 4, 5, 6].filter((d) => p2 % d === 0));
        const v1 = p1 / m1, v2 = p2 / m2;
        return { stem: `Hệ gồm hai vật có khối lượng $m_1 = ${m1}$ kg và $m_2 = ${m2}$ kg, chuyển động với tốc độ lần lượt là $v_1 = ${v1}$ m/s và $v_2 = ${v2}$ m/s theo hai hướng vuông góc với nhau. Độ lớn động lượng của hệ là`, ...mcq(r, opt(String(p)), [opt(String(p1 + p2)), opt(String(Math.abs(p1 - p2))), opt(String(p1 * p1 + p2 * p2)), opt(tex((p1 + p2) / 2, 1))]), explanation: `$p_1 = m_1v_1 = ${p1}$ kg.m/s, $p_2 = m_2v_2 = ${p2}$ kg.m/s, $\\vec p_1 \\perp \\vec p_2$ nên $p = \\sqrt{p_1^2 + p_2^2} = \\sqrt{${p1}^2 + ${p2}^2} = ${p}$ kg.m/s.` };
      }
      if (ty === "60" || ty === "120") {
        const m = r.int(1, 5), v = r.int(2, 10); const p = m * v; const m2 = r.pick([m, 2 * m]); need(isInt(p / m2)); const v2 = p / m2;
        const P = ty === "60" ? `${p}\\sqrt{3}` : String(p);
        const w = ty === "60" ? [String(2 * p), String(p), `${p}\\sqrt{2}`, "0"] : [String(2 * p), `${p}\\sqrt{3}`, `${p}\\sqrt{2}`, "0"];
        return { stem: `Hệ gồm hai vật: vật 1 khối lượng ${m} kg chuyển động với tốc độ ${v} m/s, vật 2 khối lượng ${m2} kg chuyển động với tốc độ ${v2} m/s. Hướng vận tốc của hai vật hợp với nhau một góc ${ty}°. Độ lớn động lượng của hệ là`, ...mcq(r, opt(P), w.map(opt)), explanation: `$p_1 = p_2 = ${p}$ kg.m/s. $p^2 = p_1^2 + p_2^2 + 2p_1p_2\\cos ${ty}^\\circ$ $\\Rightarrow p = ${ty === "60" ? `2p_1\\cos 30^\\circ = ${p}\\sqrt{3}` : `p_1 = ${p}`}$ kg.m/s.` };
      }
      const m1 = r.int(1, 8), v1 = r.int(2, 10), m2 = r.int(1, 8), v2 = r.int(2, 10); const p1 = m1 * v1, p2 = m2 * v2; need(p1 !== p2);
      const same = ty === "0"; const p = same ? p1 + p2 : Math.abs(p1 - p2);
      const pv = Math.sqrt(p1 * p1 + p2 * p2);
      return { stem: `Hệ gồm hai vật chuyển động trên cùng một đường thẳng, ${same ? "cùng chiều" : "ngược chiều"} nhau: vật 1 khối lượng ${m1} kg, tốc độ ${v1} m/s; vật 2 khối lượng ${m2} kg, tốc độ ${v2} m/s. Độ lớn động lượng của hệ là`, ...mcq(r, opt(String(p)), [opt(String(same ? Math.abs(p1 - p2) : p1 + p2)), opt(isInt(pv) ? String(pv) : sqrtTex(p1 * p1 + p2 * p2)), opt(String((m1 + m2) * (v1 + v2))), opt(String(p1)), opt(String(p2))]), explanation: `$p_1 = ${p1}$ kg.m/s, $p_2 = ${p2}$ kg.m/s. Hai vectơ ${same ? "cùng chiều nên $p = p_1 + p_2" : "ngược chiều nên $p = |p_1 - p_2|"} = ${p}$ kg.m/s.` };
    },
  },
  /* ---- Đúng/Sai ---- */
  {
    id: "l10k2-tf-va-cham-mem", ...M5, topic: "Va chạm mềm",
    level: 3, kind: "tf",
    make: (r) => {
      const m1 = r.int(1, 10), m2 = r.int(1, 10), v1 = r.int(2, 12);
      const V = m1 * v1 / (m1 + m2); need(okDp(V, 2));
      const K1 = m1 * v1 * v1 / 2, loss = K1 * m2 / (m1 + m2); need(okDp(loss, 2));
      const obj = r.pick(["xe lăn", "viên bi", "toa xe nhỏ"]);
      const st = tfv(r, [
        [`Động lượng của hệ trước va chạm có độ lớn ${m1 * v1} kg.m/s.`, `Động lượng của hệ trước va chạm có độ lớn ${(m1 + m2) * v1} kg.m/s.`],
        [`Ngay sau va chạm, hai vật chuyển động với tốc độ ${vn(V)} m/s.`, `Ngay sau va chạm, hai vật chuyển động với tốc độ ${vn(m1 === m2 ? v1 : round(v1 * m2 / (m1 + m2), 2))} m/s.`],
        [`Động năng của hệ sau va chạm nhỏ hơn động năng của hệ trước va chạm.`, `Động năng của hệ được bảo toàn trong va chạm.`],
        [`Phần động năng của hệ chuyển hóa thành các dạng năng lượng khác (nhiệt, biến dạng…) là ${vn(loss)} J.`, `Phần động năng của hệ chuyển hóa thành các dạng năng lượng khác (nhiệt, biến dạng…) là ${vn(K1)} J.`],
      ]);
      return {
        stem: `Trên mặt phẳng nằm ngang nhẵn, một ${obj} khối lượng ${m1} kg chuyển động với tốc độ ${v1} m/s đến va chạm vào một ${obj} khác khối lượng ${m2} kg đang đứng yên. Sau va chạm hai vật dính vào nhau và chuyển động cùng vận tốc.`,
        ...st,
        explanation: tfExp(st.statements, [
          `$p = m_1v_1 = ${m1}\\cdot ${v1} = ${m1 * v1}$ kg.m/s (vật 2 đứng yên)`,
          `$V = \\dfrac{m_1v_1}{m_1 + m_2} = \\dfrac{${m1 * v1}}{${m1 + m2}} = ${tex(V)}$ m/s`,
          `Va chạm mềm: động lượng bảo toàn nhưng động năng giảm`,
          `$W_{\\text{đ}1} = \\dfrac{1}{2}\\cdot ${m1}\\cdot ${v1}^2 = ${tex(K1)}$ J; $W_{\\text{đ}2} = \\dfrac{1}{2}\\cdot ${m1 + m2}\\cdot ${tex(V)}^2 = ${tex(K1 - loss)}$ J; phần mất đi $= ${tex(loss)}$ J`,
        ]),
      };
    },
  },
  /* ---- Trả lời ngắn ---- */
  {
    id: "l10k2-s-va-cham-mem", ...M5, topic: "Bảo toàn động lượng – va chạm mềm",
    level: 2, kind: "short",
    make: (r) => {
      if (r.chance(0.5)) {
        const mg = r.pick([10, 20, 25, 50]), v = r.int(2, 8) * 100, M = r.pick([1, 2, 2.5, 4, 5]); const V = mg / 1000 * v / (M + mg / 1000); need(ok4(round(V, 2), 2));
        return { stem: `Một viên đạn khối lượng ${mg} g bay theo phương ngang với tốc độ ${v} m/s, cắm vào một bao cát khối lượng ${vn(M)} kg đang treo đứng yên và nằm lại trong bao cát. Tốc độ của bao cát (cùng viên đạn) ngay sau va chạm bằng bao nhiêu m/s? (làm tròn đến hàng phần trăm)`, ...short(V, 2), explanation: `Va chạm mềm: $mv = (m + M)V \\Rightarrow V = \\dfrac{${tex(mg / 1000, 3)}\\cdot ${v}}{${tex(mg / 1000, 3)} + ${tex(M)}} ${eq(V, 2)} ${tex(V)}$ m/s.` };
      }
      const m1 = r.pick([1, 1.5, 2, 3, 4, 5]), m2 = r.pick([1, 2, 2.5, 3, 4, 6]), v1 = r.int(2, 10), v2 = r.int(1, 6);
      const opp = r.chance(0.5); need(opp || v1 > v2); const V = Math.abs((m1 * 1000 * v1 + (opp ? -1 : 1) * m2 * 1000 * v2) / ((m1 + m2) * 1000)); need(ok4(round(V, 2), 2) && V > 0);
      return { stem: `Một toa xe khối lượng ${vn(m1)} tấn chạy với tốc độ ${v1} m/s đến va chạm vào toa xe thứ hai khối lượng ${vn(m2)} tấn đang chạy với tốc độ ${v2} m/s ${opp ? "ngược chiều" : "cùng chiều"} trên cùng đường ray${opp ? "" : " (toa thứ nhất chạy nhanh hơn)"}. Sau va chạm hai toa móc vào nhau và chuyển động cùng vận tốc. Bỏ qua ma sát. Tốc độ của hai toa ngay sau va chạm bằng bao nhiêu m/s? (làm tròn đến hàng phần trăm)`, ...short(V, 2), explanation: `Chọn chiều dương là chiều chuyển động của toa thứ nhất: $V = \\dfrac{m_1v_1 ${opp ? "-" : "+"} m_2v_2}{m_1 + m_2} = \\dfrac{${tex(m1)}\\cdot ${v1} ${opp ? "-" : "+"} ${tex(m2)}\\cdot ${v2}}{${tex(m1 + m2)}} ${eq(V, 2)} ${opp && m1 * v1 < m2 * v2 ? "-" : ""}${tex(V)}$ m/s. Tốc độ là $${tex(V)}$ m/s.` };
    },
  },
  {
    id: "l10k2-s-xung-luc", ...M5, topic: "Lực trung bình trong va chạm",
    level: 3, kind: "short",
    make: (r) => {
      if (r.chance(0.55)) {
        const mg = r.pick([50, 100, 150, 200, 300, 400, 450]), v1 = r.int(4, 25), v2 = r.int(2, 20), dt = r.pick([0.01, 0.02, 0.04, 0.05, 0.1]);
        const F = mg / 1000 * (v1 + v2) / dt; need(ok4(round(F, 0), 0));
        return { stem: `Một quả bóng khối lượng ${mg} g bay theo phương ngang với tốc độ ${v1} m/s đập vuông góc vào một bức tường rồi bật ngược trở lại theo phương cũ với tốc độ ${v2} m/s. Thời gian va chạm là ${vn(dt)} s. Độ lớn lực trung bình do tường tác dụng lên bóng bằng bao nhiêu niutơn? (làm tròn đến hàng đơn vị)`, ...short(F, 0), explanation: `Chọn chiều dương là chiều bóng bật ra: $\\Delta p = mv_2 - (-mv_1) = m(v_1 + v_2) = ${tex(mg / 1000, 3)}\\cdot ${v1 + v2} = ${tex(mg / 1000 * (v1 + v2), 3)}$ kg.m/s. $F = \\dfrac{\\Delta p}{\\Delta t} ${eq(F, 0)} ${round(F)}$ N.` };
      }
      const mg = r.pick([45, 50, 60, 100, 150, 200, 400, 450]), v = r.int(10, 50), dt = r.pick([0.005, 0.01, 0.02, 0.05]); const F = mg / 1000 * v / dt; need(ok4(round(F, 0), 0));
      const ball = r.pick(["Một quả bóng gôn", "Một quả bóng đá", "Một quả bóng chày", "Một quả bóng tennis"]);
      return { stem: `${ball} khối lượng ${mg} g đang nằm yên thì được đánh (sút) và bay đi với tốc độ ${v} m/s. Thời gian tiếp xúc là ${vn(dt, 3)} s. Độ lớn lực trung bình tác dụng lên bóng bằng bao nhiêu niutơn? (làm tròn đến hàng đơn vị)`, ...short(F, 0), explanation: `$F\\Delta t = mv - 0 \\Rightarrow F = \\dfrac{${tex(mg / 1000, 3)}\\cdot ${v}}{${tex(dt, 3)}} ${eq(F, 0)} ${round(F)}$ N.` };
    },
  },
];

/* ================= CHƯƠNG VI ================= */
const CT_T = [
  "Trong chuyển động tròn đều, tốc độ của vật không đổi",
  "Trong chuyển động tròn đều, vectơ vận tốc có phương tiếp tuyến với quỹ đạo tại mỗi điểm",
  "Gia tốc hướng tâm luôn hướng vào tâm quỹ đạo",
  "Chu kì là thời gian vật đi hết một vòng tròn",
  "Tần số cho biết số vòng vật đi được trong một giây",
  "Đơn vị của tốc độ góc là rad/s",
  "Lực hướng tâm không phải là một loại lực mới mà là hợp lực (hoặc một lực) gây ra gia tốc hướng tâm",
  "1 rad là góc ở tâm chắn cung có độ dài bằng bán kính đường tròn",
  "Trong chuyển động tròn đều, tốc độ dài tỉ lệ thuận với bán kính quỹ đạo khi tốc độ góc không đổi",
];
const CT_F = [
  "Trong chuyển động tròn đều, vectơ vận tốc không đổi",
  "Trong chuyển động tròn đều, gia tốc của vật bằng không",
  "Gia tốc hướng tâm có phương tiếp tuyến với quỹ đạo",
  "Chu kì là số vòng vật đi được trong một giây",
  "Tần số tỉ lệ thuận với chu kì",
  "Tốc độ góc có đơn vị là m/s",
  "Lực hướng tâm là một loại lực mới, chỉ xuất hiện khi vật chuyển động tròn",
  "Gia tốc hướng tâm tỉ lệ nghịch với bình phương tốc độ dài",
  "Các điểm trên một đĩa quay đều có cùng tốc độ dài",
];
const H6: Template[] = [
  {
    id: "l10k2-doi-don-vi-goc", ...M6, topic: "Radian, độ dịch chuyển góc",
    level: 1, kind: "mcq",
    make: (r) => {
      const ty = r.pick(["d2r", "r2d", "arc"]);
      if (ty === "arc") {
        const rc = r.int(2, 50), th = r.pick([0.2, 0.4, 0.5, 0.8, 1.2, 1.5, 2, 2.5, 3]); const s = round(rc * th, 2);
        if (r.chance(0.5)) return { stem: `Một chất điểm chuyển động trên đường tròn bán kính ${rc} cm. Khi chất điểm đi được cung tròn dài ${vn(s)} cm thì độ dịch chuyển góc của nó là`, ...mcq(r, U(th, "rad"), [U(round(rc / s, 3), "rad", 3), U(round(s * rc, 1), "rad", 1), U(round(th * 180 / Math.PI, 1), "rad", 1), U(round(th / 2, 2), "rad")]), explanation: `$\\theta = \\dfrac{s}{r} = \\dfrac{${tex(s)}}{${rc}} = ${tex(th)}$ rad.` };
        return { stem: `Một chất điểm chuyển động trên đường tròn bán kính ${rc} cm, độ dịch chuyển góc là ${vn(th)} rad. Độ dài cung tròn mà chất điểm đi được là`, ...mcq(r, U(s, "cm"), [U(round(rc / th, 2), "cm"), U(round(th / rc, 3), "cm", 3), U(round(2 * s, 2), "cm"), U(round(s * Math.PI, 1), "cm", 1)]), explanation: `$s = r\\theta = ${rc}\\cdot ${tex(th)} = ${tex(s)}$ cm.` };
      }
      const deg = r.pick([15, 20, 30, 36, 40, 45, 60, 72, 90, 120, 135, 150, 180, 210, 240, 270, 300, 360]);
      const rad = `$${piT(deg, 180)}$ rad`;
      if (ty === "d2r") return { stem: `Góc ${deg}° có số đo theo radian là`, ...mcq(r, rad, [`$${piT(deg, 360)}$ rad`, `$${piT(deg, 90)}$ rad`, `$${piT(180, deg)}$ rad`, `$${tex(round(deg / 180, 2))}$ rad`]), explanation: `$\\alpha\\ (\\text{rad}) = \\dfrac{\\pi}{180}\\cdot ${deg} = ${piT(deg, 180)}$ rad.` };
      return { stem: `Góc $${piT(deg, 180)}$ rad có số đo theo độ là`, ...mcq(r, `${deg}°`, [`${deg * 2}°`, `${deg / 2}°`.replace(".", ","), `${360 - deg === deg ? deg + 90 : 360 - deg}°`, `${deg + 90}°`]), explanation: `$1$ rad $= \\dfrac{180^\\circ}{\\pi}$ nên $${piT(deg, 180)}\\ \\text{rad} = ${deg}^\\circ$.` };
    },
  },
  {
    id: "l10k2-toc-do-goc-chu-ki", ...M6, topic: "Tốc độ góc, chu kì, tần số",
    level: 1, kind: "mcq",
    make: (r) => {
      const ty = r.pick(["clock", "nt", "nt", "rpm"]);
      const rs = (s: string) => `$${s}$ rad/s`;
      if (ty === "clock") {
        const H = [{ n: "kim giây", T: 60 }, { n: "kim phút", T: 3600 }, { n: "kim giờ", T: 43200 }];
        const h = r.pick(H);
        if (r.chance(0.6)) return { stem: `Coi chuyển động của đầu ${h.n} của một đồng hồ là chuyển động tròn đều. Tốc độ góc của ${h.n} là`, ...mcq(r, rs(piT(2, h.T)), [...H.filter((x) => x !== h).map((x) => rs(piT(2, x.T))), rs(piT(1, h.T)), rs(piT(4, h.T))]), explanation: `Chu kì của ${h.n} là $T = ${h.T}$ s. $\\omega = \\dfrac{2\\pi}{T} = ${piT(2, h.T)}$ rad/s.` };
        return { stem: `Chu kì quay của ${h.n} trên một đồng hồ chạy đúng là`, ...mcq(r, `${h.T} s`, H.filter((x) => x !== h).map((x) => `${x.T} s`).concat([`${h.T * 2} s`, `${h.T / 2} s`])), explanation: `${cap(h.n)} quay hết một vòng trong ${h.n === "kim giây" ? "1 phút = 60 s" : h.n === "kim phút" ? "1 giờ = 3600 s" : "12 giờ = 43200 s"}.` };
      }
      if (ty === "rpm") {
        const n = r.pick([30, 45, 60, 90, 120, 150, 180, 240, 300, 360, 600, 900, 1200]);
        const dev = r.pick(["Một chiếc quạt điện", "Một bánh xe", "Một đĩa quay", "Một trục động cơ", "Một máy li tâm"]);
        return { stem: `${dev} quay đều với tốc độ ${n} vòng/phút. Tốc độ góc của nó là`, ...mcq(r, rs(piT(n, 30)), [rs(piT(2 * n, 1)), rs(piT(n, 60)), rs(tex(round(n / 60, 2))), rs(piT(n, 15))]), explanation: `$f = \\dfrac{${n}}{60}$ vòng/s; $\\omega = 2\\pi f = 2\\pi\\cdot \\dfrac{${n}}{60} = ${piT(n, 30)}$ rad/s.` };
      }
      const n = r.int(2, 30), t = r.int(1, 20); const T = t / n, f = n / t; need(okDp(T, 2) && okDp(f, 2) && n !== t);
      const q = r.pick(["T", "f", "w"]);
      const intro = `Một vật chuyển động tròn đều, thực hiện được ${n} vòng trong ${t} s.`;
      if (q === "T") return { stem: `${intro} Chu kì chuyển động của vật là`, ...mcq(r, U(T, "s"), [U(f, "s"), U(n * t, "s"), U(round(2 * Math.PI * T, 2), "s"), U(t, "s")]), explanation: `$T = \\dfrac{t}{N} = \\dfrac{${t}}{${n}} = ${tex(T)}$ s.` };
      if (q === "f") return { stem: `${intro} Tần số chuyển động của vật là`, ...mcq(r, U(f, "Hz"), [U(T, "Hz"), U(n * t, "Hz"), U(round(2 * f, 2), "Hz"), U(n, "Hz")]), explanation: `$f = \\dfrac{N}{t} = \\dfrac{${n}}{${t}} = ${tex(f)}$ Hz.` };
      return { stem: `${intro} Tốc độ góc của vật là`, ...mcq(r, rs(piT(2 * n, t)), [rs(piT(n, t)), rs(piT(2 * t, n)), rs(piT(t, n)), rs(piT(4 * n, t))]), explanation: `$\\omega = 2\\pi f = 2\\pi\\cdot \\dfrac{${n}}{${t}} = ${piT(2 * n, t)}$ rad/s.` };
    },
  },
  {
    id: "l10k2-toc-do-dai", ...M6, topic: "Tốc độ dài, liên hệ $v = \\omega r$",
    level: 1, kind: "mcq",
    make: (r) => {
      const ty = r.pick(["wr", "fr", "ratio"]);
      if (ty === "wr") {
        const w = r.int(2, 20), rr = r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.8, 1, 1.5, 2]); const v = w * rr;
        return { stem: `Một điểm trên vành bánh xe chuyển động tròn đều với tốc độ góc ${w} rad/s, bán kính quỹ đạo ${vn(rr)} m. Tốc độ dài của điểm đó là`, ...mcq(r, U(v, "m/s"), [U(round(w / rr, 2), "m/s"), U(round(rr / w, 3), "m/s", 3), U(round(w * rr * rr, 3), "m/s", 3), U(round(w * w * rr, 2), "m/s")]), explanation: `$v = \\omega r = ${w}\\cdot ${tex(rr)} = ${tex(v)}$ m/s.` };
      }
      if (ty === "fr") {
        const f = r.pick([0.5, 1, 2, 2.5, 4, 5, 10]), rc = r.pick([10, 20, 25, 30, 40, 50]); const v = round(2 * PI * f * rc / 100, 3);
        return { stem: `Một đĩa tròn bán kính ${rc} cm quay đều với tần số ${vn(f)} vòng/s. Lấy $\\pi = 3{,}14$. Tốc độ dài của một điểm trên mép đĩa là`, ...mcq(r, U(v, "m/s", 3), [U(round(PI * f * rc / 100, 3), "m/s", 3), U(round(f * rc / 100, 3), "m/s", 3), U(round(2 * PI * f * rc, 1), "m/s", 1), U(round(2 * PI * rc / 100 / f, 3), "m/s", 3)]), explanation: `$\\omega = 2\\pi f = ${tex(2 * PI * f, 2)}$ rad/s; $v = \\omega r = ${tex(2 * PI * f, 2)}\\cdot ${tex(rc / 100)} = ${tex(v, 3)}$ m/s.` };
      }
      const r1 = r.int(4, 30), r2 = r.int(2, 30); need(r1 !== r2 && gcd(r1, r2) === 1);
      const fr = (a: number, b: number) => `$\\dfrac{v_A}{v_B} = \\dfrac{${a}}{${b}}$`.replace(`\\dfrac{${a}}{1}`, String(a));
      return { stem: `Một đĩa tròn quay đều quanh trục qua tâm. Điểm A cách trục quay ${r1} cm, điểm B cách trục quay ${r2} cm. Tỉ số tốc độ dài của A và B là`, ...mcq(r, fr(r1, r2), [fr(r2, r1), "$\\dfrac{v_A}{v_B} = 1$", fr(r1 * r1, r2 * r2), fr(r2 * r2, r1 * r1)]), explanation: `Mọi điểm trên đĩa có cùng tốc độ góc $\\omega$; $v = \\omega r$ nên $\\dfrac{v_A}{v_B} = \\dfrac{r_A}{r_B} = \\dfrac{${r1}}{${r2}}$.` };
    },
  },
  {
    id: "l10k2-gia-toc-huong-tam", ...M6, topic: "Gia tốc hướng tâm",
    level: 2, kind: "mcq",
    make: (r) => {
      if (r.chance(0.55)) {
        const kmh = r.pick([18, 36, 54, 72, 90]), R = r.int(2, 40) * 10; const v = kmh / 3.6; const a = v * v / R; need(okDp(a, 3));
        const who = r.pick(["Một ô tô", "Một xe máy", "Một xe buýt", "Một đoàn tàu"]);
        return { stem: `${who} chuyển động đều với tốc độ ${kmh} km/h trên một đoạn đường cong có dạng cung tròn bán kính ${R} m. Độ lớn gia tốc hướng tâm của xe là`, ...mcq(r, U(a, "m/s²", 3), [U(round(kmh * kmh / R, 2), "m/s²"), U(round(v / R, 3), "m/s²", 3), U(round(v * v / (2 * R), 3), "m/s²", 3), U(round(v * R, 1), "m/s²", 1)]), explanation: `$v = ${kmh}$ km/h $= ${tex(v)}$ m/s. $a_{ht} = \\dfrac{v^2}{r} = \\dfrac{${tex(v)}^2}{${R}} = ${tex(a, 3)}$ m/s².` };
      }
      const w = r.int(2, 12), rr = r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.8, 1, 1.2, 1.5]); const a = w * w * rr;
      return { stem: `Một chất điểm chuyển động tròn đều trên quỹ đạo bán kính ${vn(rr)} m với tốc độ góc ${w} rad/s. Độ lớn gia tốc hướng tâm của chất điểm là`, ...mcq(r, U(a, "m/s²"), [U(w * rr, "m/s²"), U(round(w * w / rr, 2), "m/s²"), U(round(w * rr * rr, 3), "m/s²", 3), U(round(2 * w * rr, 2), "m/s²")]), explanation: `$a_{ht} = \\omega^2 r = ${w}^2\\cdot ${tex(rr)} = ${tex(a)}$ m/s².` };
    },
  },
  {
    id: "l10k2-luc-huong-tam", ...M6, topic: "Lực hướng tâm",
    level: 2, kind: "mcq",
    make: (r) => {
      const ty = r.pick(["day", "xe", "w"]);
      if (ty === "xe") {
        const mt = r.pick([1, 1.2, 1.5, 2, 2.5]), kmh = r.pick([36, 54, 72]), R = r.int(5, 30) * 10; const v = kmh / 3.6; const F = mt * 1000 * v * v / R; need(okDp(F, 0));
        return { stem: `Một ô tô khối lượng ${vn(mt)} tấn chuyển động đều với tốc độ ${kmh} km/h qua một khúc cua phẳng nằm ngang có dạng cung tròn bán kính ${R} m. Lực ma sát nghỉ đóng vai trò lực hướng tâm. Độ lớn lực ma sát nghỉ tác dụng lên xe là`, ...mcq(r, U(F, "N", 0), [U(round(mt * 1000 * kmh * kmh / R), "N", 0), U(round(mt * 1000 * v / R), "N", 0), U(mt * 10000, "N", 0), U(round(F / 2), "N", 0)]), explanation: `$v = ${tex(v)}$ m/s. $F_{ht} = \\dfrac{mv^2}{r} = \\dfrac{${mt * 1000}\\cdot ${tex(v)}^2}{${R}} = ${F}$ N.` };
      }
      if (ty === "w") {
        const mg = r.pick([50, 100, 200, 250, 400, 500]), w = r.int(2, 10), rr = r.pick([0.2, 0.25, 0.4, 0.5, 0.8, 1]); const F = mg / 1000 * w * w * rr; need(okDp(F, 3));
        return { stem: `Một vật nhỏ khối lượng ${mg} g đặt trên một bàn quay nằm ngang, cách trục quay ${vn(rr)} m. Bàn quay đều với tốc độ góc ${w} rad/s và vật quay cùng bàn. Độ lớn lực hướng tâm tác dụng lên vật là`, ...mcq(r, U(F, "N", 3), [U(round(mg / 1000 * w * rr, 3), "N", 3), U(mg * w * w * rr, "N", 1), U(round(mg / 1000 * w * w / rr, 3), "N", 3), U(round(F * 2, 3), "N", 3)]), explanation: `$F_{ht} = m\\omega^2 r = ${tex(mg / 1000, 3)}\\cdot ${w}^2\\cdot ${tex(rr)} = ${tex(F, 3)}$ N.` };
      }
      const m = r.pick([0.1, 0.2, 0.3, 0.5, 1, 2]), v = r.int(1, 10), L = r.pick([0.2, 0.25, 0.4, 0.5, 0.8, 1, 1.2, 1.5, 2]); const F = m * v * v / L; need(okDp(F, 2));
      return { stem: `Một quả cầu nhỏ khối lượng ${vn(m * 1000)} g buộc vào đầu một sợi dây nhẹ dài ${vn(L)} m, đầu kia của dây cố định. Quả cầu chuyển động tròn đều trên mặt bàn nằm ngang nhẵn với tốc độ ${v} m/s. Lực căng của dây là`, ...mcq(r, U(F, "N"), [U(round(m * v / L, 2), "N"), U(round(m * v * v * L, 2), "N"), U(round(m * v * v / (2 * L), 2), "N"), U(round(m * 1000 * v * v / L, 0), "N", 0)]), explanation: `Lực căng dây đóng vai trò lực hướng tâm: $T = \\dfrac{mv^2}{r} = \\dfrac{${tex(m)}\\cdot ${v}^2}{${tex(L)}} = ${tex(F)}$ N.` };
    },
  },
  {
    id: "l10k2-chuyen-dong-tron-ly-thuyet", ...M6, topic: "Chuyển động tròn đều – lí thuyết",
    level: 1, kind: "mcq",
    make: (r) => theory(r, CT_T, CT_F,
      ["Phát biểu nào sau đây đúng?", "Khi nói về chuyển động tròn đều, phát biểu nào sau đây đúng?", "Chọn phát biểu đúng.", "Khi nói về gia tốc hướng tâm và lực hướng tâm, phát biểu nào sau đây đúng?"],
      ["Phát biểu nào sau đây SAI?", "Khi nói về chuyển động tròn đều, phát biểu nào sau đây KHÔNG đúng?", "Chọn phát biểu sai.", "Khi nói về gia tốc hướng tâm và lực hướng tâm, phát biểu nào sau đây sai?"],
      (c, t) => `"${c}" là phát biểu ${t ? "đúng" : "sai"}. Nhớ: chuyển động tròn đều có tốc độ không đổi nhưng vận tốc đổi hướng; $\\omega = \\dfrac{2\\pi}{T} = 2\\pi f$, $v = \\omega r$, $a_{ht} = \\dfrac{v^2}{r} = \\omega^2r$ hướng vào tâm.`),
  },
  {
    id: "l10k2-cau-vong", ...M6, topic: "Lực hướng tâm – xe qua cầu vồng, cầu võng",
    level: 3, kind: "mcq",
    make: (r) => {
      const mt = r.pick([1, 1.2, 1.5, 2, 2.5, 3, 4]), kmh = r.pick([18, 36, 54, 72]), R = r.int(5, 20) * 10; const v = kmh / 3.6; const m = mt * 1000;
      if (r.chance(0.25)) {
        const vm = Math.sqrt(10 * R);
        return { stem: `Một ô tô chuyển động qua đỉnh một cầu vồng (mặt cầu cong lên) có dạng cung tròn bán kính ${R} m. Lấy $g = 10$ m/s². Để xe không bị rời khỏi mặt cầu tại đỉnh cầu thì tốc độ của xe tại đó không được vượt quá`, ...mcq(r, U(round(vm, 1), "m/s", 1), [U(round(Math.sqrt(20 * R), 1), "m/s", 1), U(10 * R, "m/s"), U(round(Math.sqrt(R / 10), 2), "m/s"), U(round(vm * 3.6, 1), "m/s", 1)]), explanation: `Tại đỉnh cầu: $mg - N = \\dfrac{mv^2}{R}$. Xe không rời mặt cầu khi $N \\ge 0 \\Rightarrow v \\le \\sqrt{gR} = \\sqrt{10\\cdot ${R}} ${eq(vm, 1)} ${tex(vm, 1)}$ m/s.` };
      }
      const up = r.chance(0.5); const a = v * v / R; const N = m * (10 + (up ? -a : a)); need(N > 0 && okDp(N, 0));
      return {
        stem: `Một ô tô khối lượng ${vn(mt)} tấn chuyển động đều với tốc độ ${kmh} km/h qua ${up ? "điểm cao nhất của một cầu vồng (mặt cầu cong lên)" : "điểm thấp nhất của một cầu võng (mặt cầu cong xuống)"} có dạng cung tròn bán kính ${R} m. Lấy $g = 10$ m/s². Áp lực của ô tô lên mặt cầu tại điểm đó là`,
        ...mcq(r, U(N, "N", 0), [U(m * 10, "N", 0), U(m * (10 + (up ? a : -a)), "N", 0), U(round(m * a), "N", 0), U(round(m * (10 + (up ? -1 : 1) * kmh * kmh / R)), "N", 0)]),
        explanation: `$v = ${tex(v)}$ m/s. Hợp lực của trọng lực và phản lực đóng vai trò lực hướng tâm (hướng ${up ? "xuống" : "lên"}, về tâm): $${up ? "mg - N" : "N - mg"} = \\dfrac{mv^2}{R} \\Rightarrow N = m\\left(g ${up ? "-" : "+"} \\dfrac{v^2}{R}\\right) = ${m}\\left(10 ${up ? "-" : "+"} ${tex(a, 3)}\\right) = ${N}$ N. Áp lực lên cầu bằng $N$.`,
      };
    },
  },
  /* ---- Đúng/Sai ---- */
  {
    id: "l10k2-tf-chuyen-dong-tron-deu", ...M6, topic: "Các đại lượng của chuyển động tròn đều",
    level: 2, kind: "tf",
    make: (r) => {
      const f = r.pick([0.5, 1, 2, 2.5, 4, 5]), rr = r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.8, 1]), t = r.int(2, 10); const N = f * t; need(isInt(N) && N >= 2);
      const T = 1 / f, w = 2 * PI * f, v = round(w * rr, 3), a = round(w * w * rr, 2);
      const st = tfv(r, [
        [`Chu kì chuyển động của vật là ${vn(T, 3)} s.`, `Chu kì chuyển động của vật là ${t} s.`],
        [`Tốc độ góc của vật là $${piD(2 * f)}$ rad/s.`, `Tốc độ góc của vật là $${piD(f)}$ rad/s.`],
        [`Tốc độ dài của vật xấp xỉ ${vn(v, 3)} m/s.`, `Tốc độ dài của vật xấp xỉ ${vn(round(PI * f * rr, 3), 3)} m/s.`],
        [`Gia tốc hướng tâm của vật có độ lớn xấp xỉ ${vn(a)} m/s².`, `Gia tốc của vật bằng 0 vì tốc độ của vật không đổi.`],
      ]);
      return {
        stem: `Một vật nhỏ chuyển động tròn đều trên quỹ đạo bán kính ${vn(rr)} m, thực hiện được ${N} vòng trong ${t} s. Lấy $\\pi = 3{,}14$.`,
        ...st,
        explanation: tfExp(st.statements, [
          `$T = \\dfrac{t}{N} = \\dfrac{${t}}{${N}} = ${tex(T, 3)}$ s`,
          `$f = \\dfrac{1}{T} = ${tex(f)}$ Hz, $\\omega = 2\\pi f = ${piD(2 * f)}$ rad/s`,
          `$v = \\omega r = ${tex(w, 2)}\\cdot ${tex(rr)} \\approx ${tex(v, 3)}$ m/s`,
          `Vận tốc đổi hướng liên tục nên vật có gia tốc hướng tâm $a_{ht} = \\omega^2 r = ${tex(w, 2)}^2\\cdot ${tex(rr)} \\approx ${tex(a)}$ m/s²`,
        ]),
      };
    },
  },
  /* ---- Trả lời ngắn ---- */
  {
    id: "l10k2-s-toc-do-goc", ...M6, topic: "Tốc độ góc, tốc độ dài",
    level: 2, kind: "short",
    make: (r) => {
      const n = r.pick([30, 45, 60, 90, 120, 150, 180, 240, 300, 360, 450, 600, 900]);
      const dev = r.pick(["Một bánh xe", "Một chiếc quạt trần", "Một đĩa quay", "Một trục động cơ", "Cánh quạt của một máy sấy"]);
      if (r.chance(0.5)) {
        const w = n * 2 * PI / 60;
        return { stem: `${dev} quay đều với tốc độ ${n} vòng/phút. Lấy $\\pi = 3{,}14$. Tốc độ góc của nó bằng bao nhiêu rad/s? (làm tròn đến hàng phần mười)`, ...short(w, 1), explanation: `$\\omega = 2\\pi f = 2\\cdot 3{,}14\\cdot \\dfrac{${n}}{60} ${eq(w, 1)} ${tex(w, 1)}$ rad/s.` };
      }
      const rc = r.pick([10, 15, 20, 25, 30, 40, 50, 60]); const v = n * 2 * PI / 60 * rc / 100; need(ok4(round(v, 2), 2));
      return { stem: `${dev} có bán kính ${rc} cm, quay đều với tốc độ ${n} vòng/phút. Lấy $\\pi = 3{,}14$. Tốc độ dài của một điểm trên mép ngoài bằng bao nhiêu m/s? (làm tròn đến hàng phần trăm)`, ...short(v, 2), explanation: `$\\omega = 2\\pi\\cdot \\dfrac{${n}}{60} ${eq(n * 2 * PI / 60, 3)} ${tex(n * 2 * PI / 60, 3)}$ rad/s; $v = \\omega r = ${tex(n * 2 * PI / 60, 3)}\\cdot ${tex(rc / 100)} ${eq(v, 2)} ${tex(v)}$ m/s.` };
    },
  },
  {
    id: "l10k2-s-luc-huong-tam", ...M6, topic: "Lực hướng tâm – vận dụng",
    level: 3, kind: "short",
    make: (r) => {
      if (r.chance(0.5)) {
        const mu = r.pick([0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.8]), R = r.int(2, 30) * 10; const v = Math.sqrt(mu * 10 * R);
        const kmh = r.chance(0.5); const val = kmh ? v * 3.6 : v; need(ok4(round(val, 1), 1));
        return { stem: `Một ô tô chuyển động qua một khúc cua phẳng nằm ngang có dạng cung tròn bán kính ${R} m. Hệ số ma sát nghỉ cực đại giữa lốp xe và mặt đường là ${vn(mu)}, lấy $g = 10$ m/s². Để xe không bị trượt, tốc độ tối đa của xe khi qua khúc cua là bao nhiêu ${kmh ? "km/h" : "m/s"}? (làm tròn đến hàng phần mười)`, ...short(val, 1), explanation: `Lực ma sát nghỉ đóng vai trò lực hướng tâm: $\\dfrac{mv^2}{R} \\le \\mu mg \\Rightarrow v_{max} = \\sqrt{\\mu gR} = \\sqrt{${tex(mu)}\\cdot 10\\cdot ${R}} \\approx ${tex(v, 2)}$ m/s${kmh ? ` $\\approx ${tex(val, 1)}$ km/h` : ""}.` };
      }
      const mt = r.pick([1, 1.2, 1.5, 2, 2.5, 3]), kmh = r.pick([18, 36, 54, 72]), R = r.int(5, 20) * 10; const v = kmh / 3.6; const up = r.chance(0.5);
      const N = mt * 1000 * (10 + (up ? -1 : 1) * v * v / R) / 1000; need(N > 0 && ok4(round(N, 1), 1));
      return { stem: `Một ô tô khối lượng ${vn(mt)} tấn chuyển động đều với tốc độ ${kmh} km/h qua ${up ? "đỉnh một cầu vồng (cong lên)" : "điểm thấp nhất của một cầu võng (cong xuống)"} có bán kính cong ${R} m. Lấy $g = 10$ m/s². Áp lực của ô tô lên mặt cầu tại điểm đó bằng bao nhiêu kN? (làm tròn đến hàng phần mười)`, ...short(N, 1), explanation: `$v = ${tex(v)}$ m/s. $N = m\\left(g ${up ? "-" : "+"} \\dfrac{v^2}{R}\\right) = ${mt * 1000}\\left(10 ${up ? "-" : "+"} \\dfrac{${tex(v)}^2}{${R}}\\right) ${eq(N * 1000, 0)} ${tex(round(N * 1000, 0), 0)}$ N $${eq(N, 1)} ${tex(N, 1)}$ kN.` };
    },
  },
];

/* ================= CHƯƠNG VII ================= */
const BD_T = [
  "Biến dạng đàn hồi là biến dạng mà vật lấy lại được hình dạng, kích thước ban đầu khi ngoại lực thôi tác dụng",
  "Biến dạng dẻo là biến dạng mà vật không lấy lại được hình dạng, kích thước ban đầu khi ngoại lực thôi tác dụng",
  "Lực đàn hồi của lò xo có hướng ngược với hướng của ngoại lực gây biến dạng",
  "Trong giới hạn đàn hồi, độ lớn lực đàn hồi của lò xo tỉ lệ thuận với độ biến dạng của lò xo",
  "Đơn vị của độ cứng lò xo trong hệ SI là N/m",
  "Khi chịu biến dạng nén, chiều dài của vật giảm so với chiều dài tự nhiên",
  "Khi lực tác dụng vượt quá giới hạn đàn hồi, vật bị biến dạng dẻo",
  "Độ cứng của lò xo phụ thuộc vào vật liệu, kích thước và hình dạng của lò xo",
];
const BD_F = [
  "Lực đàn hồi của lò xo luôn tỉ lệ thuận với chiều dài của lò xo",
  "Lực đàn hồi của lò xo cùng hướng với ngoại lực gây biến dạng",
  "Đơn vị của độ cứng lò xo trong hệ SI là N.m",
  "Định luật Hooke đúng với mọi độ biến dạng, kể cả khi vượt quá giới hạn đàn hồi",
  "Khi chịu biến dạng kéo, chiều dài của vật giảm so với chiều dài tự nhiên",
  "Biến dạng dẻo là biến dạng mà vật lấy lại được hình dạng ban đầu khi thôi tác dụng lực",
  "Lò xo có độ cứng càng lớn thì càng dễ bị biến dạng",
  "Lực đàn hồi chỉ xuất hiện khi vật bị biến dạng dẻo",
];
const KEO = ["Sợi dây treo đèn chùm trên trần nhà", "Dây cáp của cần cẩu đang treo kiện hàng", "Dây đàn ghi-ta đã được lên dây", "Sợi dây chun đang bị kéo dãn", "Lò xo của lực kế đang treo quả nặng", "Sợi dây xích đang kéo một chiếc xe bị hỏng"];
const NEN = ["Trụ cầu đỡ mặt cầu", "Cột nhà đỡ mái nhà", "Chân ghế khi có người ngồi lên", "Lò xo trong giảm xóc của xe máy khi xe chở nặng", "Đế giày khi người đứng trên mặt đất", "Viên gạch ở hàng dưới cùng của bức tường"];
const DH = ["Quả bóng cao su bị bóp nhẹ rồi thả ra", "Lò xo bị kéo dãn vừa phải rồi thả ra", "Cành tre bị gió uốn cong rồi trở lại như cũ", "Thước nhựa dẻo bị uốn cong nhẹ rồi thả ra", "Sợi dây chun bị kéo nhẹ rồi thả ra"];
const DEO = ["Cục đất sét bị nặn thành hình con vật", "Dây đồng bị uốn cong thành chiếc móc", "Lò xo bị kéo quá mạnh, khi thả ra không trở về hình dạng cũ", "Thanh sắt nung đỏ bị rèn dẹt", "Lon nước ngọt bằng nhôm bị bóp bẹp", "Miếng kẹo cao su bị kéo dài ra"];
const AS_T = [
  "Áp suất chất lỏng tại một điểm tác dụng theo mọi hướng",
  "Tại cùng một độ sâu trong chất lỏng đứng yên, áp suất tại mọi điểm như nhau",
  "Áp suất chất lỏng tăng theo độ sâu",
  "Đơn vị của áp suất trong hệ SI là paxcan (Pa), với 1 Pa = 1 N/m²",
  "Độ chênh lệch áp suất giữa hai điểm trong chất lỏng đứng yên tỉ lệ với độ chênh lệch độ sâu giữa hai điểm đó",
  "Khối lượng riêng của một chất là khối lượng của một đơn vị thể tích chất đó",
  "Áp suất có độ lớn bằng áp lực tác dụng vuông góc lên một đơn vị diện tích bị ép",
  "Áp suất tại một điểm trong chất lỏng bằng tổng áp suất khí quyển trên mặt thoáng và áp suất do cột chất lỏng phía trên gây ra",
];
const AS_F = [
  "Áp suất chất lỏng chỉ tác dụng lên đáy bình chứa",
  "Áp suất chất lỏng tại một điểm không phụ thuộc vào độ sâu của điểm đó",
  "Áp suất chất lỏng tại đáy bình phụ thuộc vào hình dạng của bình chứa",
  "Đơn vị của áp suất trong hệ SI là N.m",
  "Áp suất nước tại đáy bình càng lớn khi diện tích đáy bình càng lớn",
  "Khối lượng riêng của một chất tỉ lệ thuận với thể tích của vật làm bằng chất đó",
  "Tại cùng một độ sâu, áp suất chất lỏng theo phương thẳng đứng hướng xuống lớn hơn theo phương ngang",
  "Áp suất tại một điểm trong chất lỏng chỉ bằng áp suất do cột chất lỏng phía trên gây ra, không phụ thuộc áp suất khí quyển",
];
const MATS = [
  { n: "nước", rho: 1000, solid: false }, { n: "dầu ăn", rho: 800, solid: false }, { n: "nhôm", rho: 2700, solid: true }, { n: "sắt", rho: 7800, solid: true },
  { n: "đồng", rho: 8900, solid: true }, { n: "thủy ngân", rho: 13600, solid: false }, { n: "chì", rho: 11300, solid: true }, { n: "xăng", rho: 700, solid: false },
  { n: "kẽm", rho: 7100, solid: true },
];
const PA = 101000;
const paTxt = "Áp suất khí quyển tại mặt thoáng là $p_a = 1{,}01\\cdot 10^5$ Pa";

const H7: Template[] = [
  {
    id: "l10k2-bien-dang-ly-thuyet", ...M7, topic: "Biến dạng của vật rắn, định luật Hooke – lí thuyết",
    level: 1, kind: "mcq",
    make: (r) => theory(r, BD_T, BD_F,
      ["Phát biểu nào sau đây đúng?", "Khi nói về biến dạng của vật rắn, phát biểu nào sau đây đúng?", "Khi nói về lực đàn hồi của lò xo và định luật Hooke, phát biểu nào sau đây đúng?", "Chọn phát biểu đúng."],
      ["Phát biểu nào sau đây SAI?", "Khi nói về biến dạng của vật rắn, phát biểu nào sau đây KHÔNG đúng?", "Khi nói về lực đàn hồi của lò xo và định luật Hooke, phát biểu nào sau đây sai?", "Chọn phát biểu sai."],
      (c, t) => `"${c}" là phát biểu ${t ? "đúng" : "sai"}. Nhớ: trong giới hạn đàn hồi $F_{\\text{đh}} = k|\\Delta \\ell|$ ($k$ tính bằng N/m), lực đàn hồi ngược hướng với ngoại lực gây biến dạng; vượt giới hạn đàn hồi thì vật biến dạng dẻo.`),
  },
  {
    id: "l10k2-bien-dang-vi-du", ...M7, topic: "Biến dạng kéo, nén; đàn hồi, dẻo – ví dụ",
    level: 1, kind: "mcq",
    make: (r) => {
      if (r.chance(0.5)) {
        const k = r.chance(0.5);
        return { stem: r.pick([`Vật nào sau đây đang chịu biến dạng ${k ? "kéo" : "nén"}?`, `Trường hợp nào sau đây là biến dạng ${k ? "kéo" : "nén"}?`, `Trong các vật sau, vật nào chịu biến dạng ${k ? "kéo" : "nén"}?`]), ...mcq(r, r.pick(k ? KEO : NEN), pickN(r, k ? NEN : KEO, 3)), explanation: `Biến dạng kéo: vật bị kéo dãn (dây treo, dây cáp, dây đàn, lò xo lực kế…); biến dạng nén: vật bị ép ngắn lại (trụ cầu, cột nhà, chân ghế, giảm xóc…).` };
      }
      const e = r.chance(0.5);
      return { stem: r.pick([`Trường hợp nào sau đây là biến dạng ${e ? "đàn hồi" : "dẻo (không đàn hồi)"}?`, `Vật nào sau đây bị biến dạng ${e ? "đàn hồi" : "dẻo"}?`, `Trong các trường hợp sau, trường hợp nào vật bị biến dạng ${e ? "đàn hồi" : "dẻo"}?`]), ...mcq(r, r.pick(e ? DH : DEO), pickN(r, e ? DEO : DH, 3)), explanation: `Biến dạng đàn hồi: vật trở lại hình dạng ban đầu khi thôi tác dụng lực; biến dạng dẻo: vật không trở lại hình dạng ban đầu.` };
    },
  },
  {
    id: "l10k2-hooke", ...M7, topic: "Định luật Hooke",
    level: 1, kind: "mcq",
    make: (r) => {
      const ty = r.pick(["F", "dl", "k"]);
      const k = r.int(2, 40) * 10;
      if (ty === "F") {
        const dl = r.int(1, 12); const F = k * dl / 100;
        return { stem: `Một lò xo có độ cứng ${k} N/m bị kéo dãn ${dl} cm (trong giới hạn đàn hồi). Độ lớn lực đàn hồi của lò xo là`, ...mcq(r, U(F, "N"), [U(k * dl, "N"), U(round(k / dl, 2), "N"), U(round(F / 2, 2), "N"), U(F * 10, "N")]), explanation: `$F_{\\text{đh}} = k|\\Delta \\ell| = ${k}\\cdot ${tex(dl / 100)} = ${tex(F)}$ N (đổi ${dl} cm $= ${tex(dl / 100)}$ m).` };
      }
      if (ty === "dl") {
        const mg = r.int(1, 20) * 50; const dl = mg / 1000 * 10 / k * 100; need(okDp(dl, 2));
        return { stem: `Treo một vật khối lượng ${mg} g vào đầu dưới của một lò xo có độ cứng ${k} N/m, đầu trên cố định. Lấy $g = 10$ m/s². Khi vật cân bằng, lò xo dãn một đoạn`, ...mcq(r, U(dl, "cm"), [U(round(dl / 10, 3), "cm", 3), U(round(mg / k, 2), "cm"), U(dl * 10, "cm"), U(round(k / (mg / 100), 2), "cm")]), explanation: `Khi cân bằng $k\\Delta \\ell = mg \\Rightarrow \\Delta \\ell = \\dfrac{mg}{k} = \\dfrac{${tex(mg / 1000, 3)}\\cdot 10}{${k}} = ${tex(dl / 100, 4)}$ m $= ${tex(dl)}$ cm.` };
      }
      const l0 = r.int(10, 40), dl = r.int(1, 10), F = k * dl / 100; need(okDp(F, 2));
      return { stem: `Một lò xo có chiều dài tự nhiên ${l0} cm. Khi bị kéo bằng lực ${vn(F)} N, lò xo có chiều dài ${l0 + dl} cm. Độ cứng của lò xo là`, ...mcq(r, U(k, "N/m"), [U(round(F / ((l0 + dl) / 100), 1), "N/m", 1), U(round(F / dl, 2), "N/m"), U(round(F * dl / 100, 3), "N/m", 3), U(2 * k, "N/m")]), explanation: `$\\Delta \\ell = ${l0 + dl} - ${l0} = ${dl}$ cm $= ${tex(dl / 100)}$ m. $k = \\dfrac{F}{\\Delta \\ell} = \\dfrac{${tex(F)}}{${tex(dl / 100)}} = ${k}$ N/m.` };
    },
  },
  {
    id: "l10k2-hooke-hai-lan-treo", ...M7, topic: "Định luật Hooke – treo hai vật",
    level: 3, kind: "mcq",
    make: (r) => {
      const l0 = r.int(10, 40), k = r.pick([20, 25, 40, 50, 80, 100, 125, 200]);
      const m1 = r.int(1, 8) * 50, m2 = r.int(1, 12) * 50; need(m2 > m1);
      const d1 = m1 / 1000 * 10 / k * 100, d2 = m2 / 1000 * 10 / k * 100; need(okDp(d1, 1) && okDp(d2, 1) && d2 <= 40);
      const l1 = round(l0 + d1, 1), l2 = round(l0 + d2, 1);
      const intro = `Một lò xo nhẹ treo thẳng đứng, đầu trên cố định. Khi treo vật khối lượng ${m1} g vào đầu dưới thì lò xo dài ${vn(l1)} cm; khi treo vật khối lượng ${m2} g thì lò xo dài ${vn(l2)} cm. Lấy $g = 10$ m/s².`;
      const kExp = `$k(\\ell_2 - \\ell_1) = (m_2 - m_1)g \\Rightarrow k = \\dfrac{${tex((m2 - m1) / 1000, 3)}\\cdot 10}{${tex((l2 - l1) / 100, 3)}} = ${k}$ N/m`;
      if (r.chance(0.5)) return { stem: `${intro} Độ cứng của lò xo là`, ...mcq(r, U(k, "N/m"), [U(round(m2 / 100 / (l2 / 100), 1), "N/m", 1), U(round((m2 - m1) / 100 / (l2 - l1), 3), "N/m", 3), U(round((m1 + m2) / 100 / ((l1 + l2) / 100), 1), "N/m", 1), U(k * 2, "N/m"), U(k / 2, "N/m", 1)]), explanation: `${kExp}.` };
      const c = [round(2 * l1 - l2, 1), round((l1 + l2) / 2, 1), round(l1 - d1 / 2, 1), round(l1 - 2 * d1, 1), round(l2 - d1, 1)].filter((x) => x > 0 && x !== l0);
      return { stem: `${intro} Chiều dài tự nhiên của lò xo là`, ...mcq(r, U(l0, "cm", 1), c.map((x) => U(x, "cm", 1))), explanation: `${kExp}. Khi treo $m_1$: $\\Delta \\ell_1 = \\dfrac{m_1g}{k} = ${tex(d1 / 100, 3)}$ m $= ${tex(d1, 1)}$ cm nên $\\ell_0 = ${tex(l1, 1)} - ${tex(d1, 1)} = ${l0}$ cm.` };
    },
  },
  {
    id: "l10k2-khoi-luong-rieng", ...M7, topic: "Khối lượng riêng",
    level: 1, kind: "mcq",
    make: (r) => {
      const ty = r.pick(["rho", "m", "cube"]);
      const mt = r.pick(MATS.filter((x) => x.solid));
      if (ty === "m") {
        const liq = r.pick(MATS.filter((x) => ["nước", "dầu ăn", "xăng", "thủy ngân"].includes(x.n)));
        const V = r.pick(liq.n === "thủy ngân" ? [0.1, 0.2, 0.5] : [0.5, 1, 1.5, 2, 3, 5, 10]); const m = liq.rho * V / 1000;
        return { stem: `Biết khối lượng riêng của ${liq.n} là ${liq.rho} kg/m³. Khối lượng của ${vn(V)} lít ${liq.n} là`, ...mcq(r, U(m, "kg", 3), [U(liq.rho * V, "kg", 0), U(V, "kg"), U(round(V / liq.rho * 1000, 3), "kg", 3), U(m * 10, "kg", 2)]), explanation: `$V = ${tex(V)}$ lít $= ${sci(V / 1000)}$ m³. $m = \\rho V = ${liq.rho}\\cdot ${sci(V / 1000)} = ${tex(m, 3)}$ kg.` };
      }
      if (ty === "cube") {
        const a = r.pick([2, 3, 4, 5, 10]); const m = mt.rho * a * a * a / 1e6;
        return { stem: `Một khối lập phương đặc bằng ${mt.n} có cạnh ${a} cm. Biết khối lượng riêng của ${mt.n} là ${mt.rho} kg/m³. Khối lượng của khối lập phương là`, ...mcq(r, U(m, "kg", 4), [U(mt.rho * a * a * a, "kg", 0), U(round(mt.rho * a / 100, 2), "kg"), U(round(m * 1000, 1), "kg", 1), U(round(mt.rho * a * a / 1e4, 3), "kg", 3)]), explanation: `$V = a^3 = ${a}^3 = ${a * a * a}$ cm³ $= ${sci(a * a * a / 1e6)}$ m³. $m = \\rho V = ${mt.rho}\\cdot ${sci(a * a * a / 1e6)} = ${tex(m, 4)}$ kg.` };
      }
      const V = r.pick([50, 100, 200, 250, 400, 500]); const m = mt.rho * V / 1000;
      return { stem: `Một vật đặc làm bằng một chất đồng chất có thể tích ${V} cm³ và khối lượng ${vn(m)} g. Khối lượng riêng của chất làm vật là`, ...mcq(r, U(mt.rho, "kg/m³", 0), [U(mt.rho / 1000, "kg/m³"), U(round(V / m, 3), "kg/m³", 3), U(mt.rho * 1000, "kg/m³", 0), U(mt.rho / 100, "kg/m³", 0)]), explanation: `$\\rho = \\dfrac{m}{V} = \\dfrac{${tex(m)}}{${V}} = ${tex(mt.rho / 1000)}$ g/cm³ $= ${mt.rho}$ kg/m³ (chất đó là ${mt.n}).` };
    },
  },
  {
    id: "l10k2-ap-suat-chat-long", ...M7, topic: "Áp suất chất lỏng $p = p_a + \\rho gh$",
    level: 2, kind: "mcq",
    make: (r) => {
      const ty = r.pick(["p", "p", "dp"]);
      const liq = r.pick([{ n: "nước", rho: 1000 }, { n: "nước biển", rho: 1030 }, { n: "dầu", rho: 800 }]);
      const opt = (x: number) => `$${sci(x, 4)}$ Pa`;
      if (ty === "p") {
        const h = r.int(1, 40); const p = PA + liq.rho * 10 * h;
        return { stem: `Một điểm nằm ở độ sâu ${h} m dưới mặt thoáng của một khối ${liq.n} đứng yên (khối lượng riêng ${liq.rho} kg/m³). ${paTxt}, lấy $g = 10$ m/s². Áp suất tại điểm đó là`, ...mcq(r, opt(p), [opt(liq.rho * 10 * h), opt(PA + liq.rho * h), opt(PA * h), opt(PA + 2 * liq.rho * 10 * h)]), explanation: `$p = p_a + \\rho gh = 1{,}01\\cdot 10^5 + ${liq.rho}\\cdot 10\\cdot ${h} = ${sci(p, 4)}$ Pa.` };
      }
      const h1 = r.int(1, 20), h2 = r.int(2, 40); need(h2 > h1); const dp = liq.rho * 10 * (h2 - h1);
      return { stem: `Hai điểm A và B trong một khối ${liq.n} đứng yên (khối lượng riêng ${liq.rho} kg/m³) lần lượt ở độ sâu ${h1} m và ${h2} m so với mặt thoáng. Lấy $g = 10$ m/s². Độ chênh lệch áp suất giữa B và A là`, ...mcq(r, opt(dp), [opt(liq.rho * 10 * (h1 + h2)), opt(liq.rho * 10 * h2), opt(PA + dp), opt(liq.rho * (h2 - h1))]), explanation: `$\\Delta p = p_B - p_A = \\rho g(h_B - h_A) = ${liq.rho}\\cdot 10\\cdot (${h2} - ${h1}) = ${sci(dp, 4)}$ Pa.` };
    },
  },
  {
    id: "l10k2-ap-suat-ly-thuyet", ...M7, topic: "Khối lượng riêng, áp suất chất lỏng – lí thuyết",
    level: 1, kind: "mcq",
    make: (r) => theory(r, AS_T, AS_F,
      ["Phát biểu nào sau đây đúng?", "Khi nói về áp suất chất lỏng, phát biểu nào sau đây đúng?", "Chọn phát biểu đúng.", "Khi nói về khối lượng riêng và áp suất, phát biểu nào sau đây đúng?"],
      ["Phát biểu nào sau đây SAI?", "Khi nói về áp suất chất lỏng, phát biểu nào sau đây KHÔNG đúng?", "Chọn phát biểu sai.", "Khi nói về khối lượng riêng và áp suất, phát biểu nào sau đây sai?"],
      (c, t) => `"${c}" là phát biểu ${t ? "đúng" : "sai"}. Nhớ: $\\rho = \\dfrac{m}{V}$ là đặc trưng của chất; $p = \\dfrac{F}{S}$ (Pa); trong chất lỏng đứng yên $p = p_a + \\rho gh$, tác dụng theo mọi hướng, chỉ phụ thuộc độ sâu.`),
  },
  /* ---- Đúng/Sai ---- */
  {
    id: "l10k2-tf-lo-xo", ...M7, topic: "Lò xo treo vật – định luật Hooke",
    level: 3, kind: "tf",
    make: (r) => {
      const l0 = r.int(15, 40), k = r.pick([20, 25, 40, 50, 80, 100, 200]), mg = r.int(1, 10) * 50;
      const P = mg / 1000 * 10; const dl = P / k * 100; need(okDp(dl, 2) && dl < l0 && dl >= 0.5 && dl <= 15);
      const l = l0 + dl;
      const st = tfv(r, [
        [`Khi vật cân bằng, lực đàn hồi của lò xo có độ lớn ${vn(P)} N và hướng thẳng đứng lên trên.`, `Khi vật cân bằng, lực đàn hồi của lò xo cùng hướng với trọng lực tác dụng lên vật.`],
        [`Khi vật cân bằng, lò xo dãn một đoạn ${vn(dl)} cm.`, `Khi vật cân bằng, lò xo dãn một đoạn ${vn(l)} cm.`],
        [`Khi vật cân bằng, chiều dài của lò xo là ${vn(l)} cm.`, `Khi vật cân bằng, chiều dài của lò xo là ${vn(l0 - dl)} cm.`],
        [`Nếu treo thêm một vật giống hệt vật trên thì chiều dài của lò xo khi cân bằng là ${vn(l0 + 2 * dl)} cm.`, `Nếu treo thêm một vật giống hệt vật trên thì chiều dài của lò xo khi cân bằng là ${vn(2 * l)} cm.`],
      ]);
      return {
        stem: `Một lò xo nhẹ có chiều dài tự nhiên ${l0} cm, độ cứng ${k} N/m, được treo thẳng đứng, đầu trên cố định. Treo vào đầu dưới một vật nhỏ khối lượng ${mg} g. Lấy $g = 10$ m/s².`,
        ...st,
        explanation: tfExp(st.statements, [
          `Vật cân bằng: $F_{\\text{đh}} = P = mg = ${tex(P)}$ N, ngược hướng trọng lực`,
          `$\\Delta \\ell = \\dfrac{mg}{k} = \\dfrac{${tex(P)}}{${k}} = ${tex(dl / 100, 4)}$ m $= ${tex(dl)}$ cm`,
          `$\\ell = \\ell_0 + \\Delta \\ell = ${l0} + ${tex(dl)} = ${tex(l)}$ cm`,
          `Lực tăng gấp đôi thì độ dãn gấp đôi (không phải chiều dài gấp đôi): $\\ell' = ${l0} + 2\\cdot ${tex(dl)} = ${tex(l0 + 2 * dl)}$ cm`,
        ]),
      };
    },
  },
  {
    id: "l10k2-tf-ap-suat-tho-lan", ...M7, topic: "Áp suất chất lỏng – người thợ lặn",
    level: 3, kind: "tf",
    make: (r) => {
      const liq = r.pick([{ n: "nước hồ", rho: 1000 }, { n: "nước biển", rho: 1030 }]);
      const h = r.int(2, 30), dh = r.int(2, 15);
      const ph = liq.rho * 10 * h, p = PA + ph, dp = liq.rho * 10 * dh;
      const st = tfv(r, [
        [`Áp suất do riêng cột ${liq.n} gây ra tại độ sâu ${h} m là $${sci(ph, 4)}$ Pa.`, `Áp suất do riêng cột ${liq.n} gây ra tại độ sâu ${h} m là $${sci(liq.rho * h, 4)}$ Pa.`],
        [`Áp suất tác dụng lên người thợ lặn ở độ sâu ${h} m là $${sci(p, 4)}$ Pa.`, `Áp suất tác dụng lên người thợ lặn ở độ sâu ${h} m là $${sci(PA * h, 4)}$ Pa.`],
        [`Nếu người thợ lặn lặn sâu thêm ${dh} m thì áp suất tác dụng lên người đó tăng thêm $${sci(dp, 4)}$ Pa.`, `Nếu người thợ lặn lặn sâu thêm ${dh} m thì áp suất tác dụng lên người đó tăng thêm $${sci(PA + dp, 4)}$ Pa.`],
        [`Tại cùng một độ sâu, áp suất nước tác dụng lên người thợ lặn theo mọi hướng có độ lớn như nhau.`, `Tại cùng một độ sâu, áp suất nước tác dụng lên người thợ lặn theo phương thẳng đứng hướng xuống lớn hơn theo phương ngang.`],
      ]);
      return {
        stem: `Một người thợ lặn đang ở độ sâu ${h} m dưới mặt ${liq.n} (khối lượng riêng ${liq.rho} kg/m³). ${paTxt}, lấy $g = 10$ m/s².`,
        ...st,
        explanation: tfExp(st.statements, [
          `$\\rho gh = ${liq.rho}\\cdot 10\\cdot ${h} = ${sci(ph, 4)}$ Pa`,
          `$p = p_a + \\rho gh = 1{,}01\\cdot 10^5 + ${sci(ph, 4)} = ${sci(p, 4)}$ Pa`,
          `$\\Delta p = \\rho g\\Delta h = ${liq.rho}\\cdot 10\\cdot ${dh} = ${sci(dp, 4)}$ Pa`,
          `Áp suất chất lỏng tại một điểm tác dụng theo mọi hướng với cùng độ lớn`,
        ]),
      };
    },
  },
  /* ---- Trả lời ngắn ---- */
  {
    id: "l10k2-s-hooke", ...M7, topic: "Định luật Hooke",
    level: 2, kind: "short",
    make: (r) => {
      const ty = r.pick(["k", "l", "m"]);
      if (ty === "k") {
        const mg = r.int(1, 20) * 50, l0 = r.int(10, 40), dlmm = r.int(5, 100); const dl = dlmm / 10; const k = mg / 1000 * 10 / (dl / 100); need(ok4(round(k, 1), 1));
        return { stem: `Một lò xo nhẹ có chiều dài tự nhiên ${l0} cm, treo thẳng đứng. Khi treo vào đầu dưới một vật khối lượng ${mg} g thì lò xo dài ${vn(l0 + dl)} cm. Lấy $g = 10$ m/s². Độ cứng của lò xo bằng bao nhiêu N/m? (làm tròn đến hàng phần mười)`, ...short(k, 1), explanation: `$\\Delta \\ell = ${tex(dl)}$ cm $= ${tex(dl / 100, 3)}$ m. $k = \\dfrac{mg}{\\Delta \\ell} = \\dfrac{${tex(mg / 100, 2)}}{${tex(dl / 100, 3)}} ${eq(k, 1)} ${tex(k, 1)}$ N/m.` };
      }
      const k = r.int(2, 40) * 10, l0 = r.int(10, 40);
      if (ty === "l") {
        const F = r.int(1, 20) * 0.5; const dl = F / k * 100; const l = l0 + (r.chance(0.5) ? dl : -dl); const comp = l < l0; need(ok4(round(l, 2), 2) && dl < l0 / 2);
        return { stem: `Một lò xo có chiều dài tự nhiên ${l0} cm, độ cứng ${k} N/m. ${comp ? "Nén" : "Kéo"} lò xo bằng một lực ${vn(F)} N dọc theo trục lò xo. Chiều dài của lò xo khi đó bằng bao nhiêu centimét? (làm tròn đến hàng phần trăm)`, ...short(l, 2), explanation: `$|\\Delta \\ell| = \\dfrac{F}{k} = \\dfrac{${tex(F)}}{${k}} ${eq(dl / 100, 4)} ${tex(dl / 100, 4)}$ m $= ${tex(dl)}$ cm. Lò xo bị ${comp ? "nén" : "kéo"}: $\\ell = ${l0} ${comp ? "-" : "+"} ${tex(dl)} ${eq(l, 2)} ${tex(l)}$ cm.` };
      }
      const dl = r.int(1, 12); const m = k * dl / 100 / 10 * 1000; need(ok4(round(m, 0), 0));
      return { stem: `Một lò xo nhẹ độ cứng ${k} N/m treo thẳng đứng, đầu trên cố định. Phải treo vào đầu dưới một vật có khối lượng bao nhiêu gam để khi vật cân bằng lò xo dãn ${dl} cm? Lấy $g = 10$ m/s².`, ...short(m, 0), explanation: `$mg = k\\Delta \\ell \\Rightarrow m = \\dfrac{k\\Delta \\ell}{g} = \\dfrac{${k}\\cdot ${tex(dl / 100)}}{10} = ${tex(m / 1000, 3)}$ kg $= ${round(m)}$ g.` };
    },
  },
  {
    id: "l10k2-s-ap-suat", ...M7, topic: "Áp suất chất lỏng – vận dụng",
    level: 3, kind: "short",
    make: (r) => {
      const liq = r.pick([{ n: "nước", rho: 1000 }, { n: "nước biển", rho: 1030 }, { n: "dầu", rho: 800 }]);
      const ty = r.pick(["h", "p", "ratio"]);
      if (ty === "h") {
        const p = r.int(12, 40) * 0.1; const h = (p * 1e5 - PA) / (liq.rho * 10); need(h > 0 && ok4(round(h, 1), 1));
        return { stem: `Trong một khối ${liq.n} đứng yên (khối lượng riêng ${liq.rho} kg/m³), ${lc(paTxt)}, lấy $g = 10$ m/s². Ở độ sâu bao nhiêu mét so với mặt thoáng thì áp suất bằng $${tex(p, 1)}\\cdot 10^5$ Pa? (làm tròn đến hàng phần mười)`, ...short(h, 1), explanation: `$p = p_a + \\rho gh \\Rightarrow h = \\dfrac{p - p_a}{\\rho g} = \\dfrac{${tex(p, 1)}\\cdot 10^5 - 1{,}01\\cdot 10^5}{${liq.rho}\\cdot 10} ${eq(h, 1)} ${tex(h, 1)}$ m.` };
      }
      if (ty === "p") {
        const h = r.int(1, 40); const p = (PA + liq.rho * 10 * h) / 1000; need(ok4(round(p, 1), 1));
        return { stem: `Một điểm ở độ sâu ${h} m dưới mặt thoáng của một khối ${liq.n} đứng yên (khối lượng riêng ${liq.rho} kg/m³). ${paTxt}, lấy $g = 10$ m/s². Áp suất tại điểm đó bằng bao nhiêu kPa? (làm tròn đến hàng phần mười)`, ...short(p, 1), explanation: `$p = p_a + \\rho gh = 101000 + ${liq.rho}\\cdot 10\\cdot ${h} = ${p * 1000}$ Pa $= ${tex(p, 1)}$ kPa.` };
      }
      const n = r.pick([2, 3, 1.5, 2.5]); const h = (n - 1) * PA / (liq.rho * 10); need(ok4(round(h, 1), 1));
      return { stem: `Trong một khối ${liq.n} đứng yên (khối lượng riêng ${liq.rho} kg/m³), ${lc(paTxt)}, lấy $g = 10$ m/s². Ở độ sâu bao nhiêu mét thì áp suất gấp ${vn(n)} lần áp suất khí quyển? (làm tròn đến hàng phần mười)`, ...short(h, 1), explanation: `$p_a + \\rho gh = ${tex(n)}p_a \\Rightarrow h = \\dfrac{${tex(n - 1)}p_a}{\\rho g} = \\dfrac{${tex(n - 1)}\\cdot 1{,}01\\cdot 10^5}{${liq.rho}\\cdot 10} ${eq(h, 1)} ${tex(h, 1)}$ m.` };
    },
  },
];

export const TEMPLATES: Template[] = [...H4, ...H5, ...H6, ...H7];
