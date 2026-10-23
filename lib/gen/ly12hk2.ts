/* Vật lí 12 – Học kì 2 (Kết nối tri thức)
   half 1: Chương III. Từ trường (từ trường, cảm ứng điện từ + dòng điện xoay chiều)
   half 2: Chương IV. Vật lí hạt nhân */
import { mcq, tf, short, tex, vn, need, round, frac, type Template, type Rng } from "./core.ts";

const S = "Vật lí" as const, G = 12 as const;
const CH3 = "Chương III. Từ trường";
const CH4 = "Chương IV. Vật lí hạt nhân";
/** khung chung cho từng nhóm chủ đề */
const TT = { subject: S, grade: G, hk: 2 as const, chapter: CH3, tk: "Vật lí|Từ trường", half: 1 as const };
const XC = { subject: S, grade: G, hk: 2 as const, chapter: CH3, tk: "Vật lí|Dòng điện xoay chiều", half: 1 as const };
const HN = { subject: S, grade: G, hk: 2 as const, chapter: CH4, tk: "Vật lí|Hạt nhân", half: 2 as const };

/* ---------------- tiện ích ---------------- */
/** làm tròn n chữ số có nghĩa */
const sig = (x: number, n = 3): number => {
  if (x === 0 || !Number.isFinite(x)) return x;
  const d = n - 1 - Math.floor(Math.log10(Math.abs(x)));
  return d >= 0 ? round(x, d) : Math.round(x / 10 ** -d) * 10 ** -d;
};
/** số (3 chữ số có nghĩa) trong công thức */
const ts = (x: number, n = 3) => tex(sig(x, n), 8);
/** dạng khoa học a{,}bc·10^n */
const sci = (x: number, dp = 2): string => {
  need(Number.isFinite(x) && x !== 0);
  let e = Math.floor(Math.log10(Math.abs(x)));
  let m = round(x / 10 ** e, dp);
  if (Math.abs(m) >= 10) { m = round(m / 10, dp); e++; }
  return e === 0 ? tex(m, dp) : `${tex(m, dp)}\\cdot 10^{${e}}`;
};
/** đại lượng có đơn vị: $x\ \text{u}$ */
const q = (x: number | string, u: string, dp = 2) => `$${typeof x === "number" ? tex(x, dp) : x}\\ \\text{${u}}$`;
/** đại lượng 3 chữ số có nghĩa */
const qs = (x: number, u: string) => `$${ts(x)}\\ \\text{${u}}$`;
/** diện tích theo cm² */
const ohm = (x: number) => `$${tex(x, 2)}\\ \\Omega$`;
const cm2 = (x: number) => `$${tex(x, 2)}\\ \\text{cm}^2$`;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** mcq số: định dạng chung, bỏ nhiễu không hữu hạn/ không dương */
const nopt = (r: Rng, right: number, wrong: number[], f: (x: number) => string) => {
  need(Number.isFinite(right));
  return mcq(r, f(right), wrong.filter((w) => Number.isFinite(w) && w > 0).map(f));
};
/** chọn k phần tử khác nhau */
const pickN = <T,>(r: Rng, a: readonly T[], k: number): T[] => r.shuffle([...a]).slice(0, k);
/** x có biểu diễn đúng bằng ≤ dp chữ số thập phân */
const exact = (x: number, dp: number) => Math.abs(round(x, dp) - x) < 1e-9;
const sinD = (d: number) => (d === 30 || d === 150 ? 0.5 : d === 90 ? 1 : d === 0 || d === 180 ? 0 : Math.sin((d * Math.PI) / 180));
const cosD = (d: number) => (d === 60 ? 0.5 : d === 120 ? -0.5 : d === 0 ? 1 : d === 90 ? 0 : Math.cos((d * Math.PI) / 180));
const NAMES = ["An", "Bình", "Chi", "Dũng", "Hà", "Khoa", "Lan", "Minh", "Nam", "Phương", "Quân", "Trang"];

/* ================================================================
   HALF 1a – TỪ TRƯỜNG, CẢM ỨNG ĐIỆN TỪ
   ================================================================ */
const TRUE_TT = [
  "Từ trường là dạng vật chất tồn tại xung quanh nam châm và xung quanh dòng điện.",
  "Từ trường tác dụng lực từ lên nam châm hoặc dòng điện đặt trong nó.",
  "Các đường sức từ là những đường cong khép kín hoặc vô hạn ở hai đầu.",
  "Bên ngoài nam châm, đường sức từ đi ra từ cực Bắc và đi vào cực Nam.",
  "Qua mỗi điểm trong từ trường chỉ vẽ được một đường sức từ.",
  "Đường sức từ của dòng điện thẳng dài là những đường tròn đồng tâm nằm trong mặt phẳng vuông góc với dòng điện.",
  "Từ trường đều có các đường sức từ là những đường thẳng song song, cùng chiều và cách đều nhau.",
  "Đơn vị của cảm ứng từ là tesla (T).",
  "Đơn vị của từ thông là weber (Wb), với $1\\ \\text{Wb} = 1\\ \\text{T}\\cdot\\text{m}^2$.",
  "Lực từ tác dụng lên đoạn dây dẫn mang dòng điện bằng 0 khi đoạn dây song song với đường sức từ.",
  "Lực từ tác dụng lên đoạn dây dẫn mang dòng điện vuông góc với cả đoạn dây và đường sức từ.",
  "Dòng điện cảm ứng chỉ xuất hiện trong mạch kín khi từ thông qua mạch biến thiên.",
  "Dòng điện cảm ứng có chiều sao cho từ trường do nó sinh ra chống lại sự biến thiên của từ thông qua mạch.",
  "Độ lớn suất điện động cảm ứng tỉ lệ với tốc độ biến thiên của từ thông qua mạch.",
  "Điện trường biến thiên theo thời gian sinh ra từ trường, từ trường biến thiên theo thời gian sinh ra điện trường xoáy.",
  "Sóng điện từ là sóng ngang và truyền được trong chân không.",
];
const FALSE_TT = [
  "Đường sức từ của nam châm thẳng là những đường thẳng song song nối hai cực.",
  "Bên ngoài nam châm, đường sức từ đi ra từ cực Nam và đi vào cực Bắc.",
  "Các đường sức từ có thể cắt nhau tại những điểm có từ trường mạnh.",
  "Lực từ tác dụng lên đoạn dây dẫn mang dòng điện lớn nhất khi đoạn dây song song với đường sức từ.",
  "Lực từ tác dụng lên đoạn dây dẫn mang dòng điện có phương trùng với đường sức từ.",
  "Đơn vị của từ thông là tesla (T).",
  "Đơn vị của cảm ứng từ là weber (Wb).",
  "Khi từ thông qua mạch kín có giá trị lớn và không đổi thì trong mạch có dòng điện cảm ứng.",
  "Dòng điện cảm ứng luôn sinh ra từ trường cùng chiều với từ trường ban đầu qua mạch.",
  "Độ lớn suất điện động cảm ứng tỉ lệ với từ thông qua mạch.",
  "Từ trường chỉ tồn tại xung quanh nam châm vĩnh cửu.",
  "Sóng điện từ không truyền được trong chân không.",
  "Từ trường của dòng điện thẳng dài là từ trường đều.",
];
const FIELD_Q: [string, string, string[]][] = [
  ["Đường sức từ của dòng điện chạy trong dây dẫn thẳng dài là", "những đường tròn đồng tâm nằm trong mặt phẳng vuông góc với dây, tâm nằm trên dây",
    ["những đường thẳng song song với dây dẫn", "những đường thẳng vuông góc với dây dẫn, hướng ra xa dây", "những đường xoắn ốc quấn quanh dây dẫn"]],
  ["Bên ngoài một nam châm thẳng, các đường sức từ", "đi ra từ cực Bắc và đi vào cực Nam",
    ["đi ra từ cực Nam và đi vào cực Bắc", "là những đường thẳng song song nối hai cực", "là những đường tròn đồng tâm bao quanh nam châm"]],
  ["Từ trường đều là từ trường có các đường sức từ", "song song, cùng chiều và cách đều nhau",
    ["là những đường tròn đồng tâm", "song song nhưng càng xa nam châm càng thưa", "xuất phát từ một điểm và tỏa đều ra mọi phía"]],
  ["Trong lòng một ống dây dài có dòng điện không đổi chạy qua, các đường sức từ", "gần như là những đường thẳng song song cách đều nhau, dọc theo trục ống dây",
    ["là những đường tròn đồng tâm quanh trục ống dây", "là những đường xoắn ốc theo các vòng dây", "vuông góc với trục của ống dây"]],
  ["Chiều của đường sức từ do dòng điện thẳng dài gây ra được xác định bằng", "quy tắc nắm tay phải", ["quy tắc bàn tay trái", "định luật Lenz", "định luật Faraday"]],
  ["Chiều của lực từ tác dụng lên đoạn dây dẫn mang dòng điện được xác định bằng", "quy tắc bàn tay trái", ["quy tắc nắm tay phải", "định luật Lenz", "định luật Faraday"]],
  ["Chiều của dòng điện cảm ứng trong mạch kín được xác định bằng", "định luật Lenz", ["quy tắc bàn tay trái", "định luật Faraday", "định luật Ohm"]],
  ["Độ lớn của suất điện động cảm ứng trong mạch kín được xác định bằng", "định luật Faraday", ["định luật Lenz", "quy tắc bàn tay trái", "định luật Coulomb"]],
  ["Tại một điểm trong từ trường, kim nam châm thử nằm cân bằng thì trục Nam – Bắc của nó", "nằm dọc theo tiếp tuyến của đường sức từ tại điểm đó",
    ["vuông góc với đường sức từ tại điểm đó", "luôn hướng theo phương Bắc – Nam địa lí", "luôn hướng về phía dòng điện gần nhất"]],
  ["Tesla (T) là đơn vị đo của", "cảm ứng từ", ["từ thông", "suất điện động cảm ứng", "lực từ"]],
  ["Weber (Wb) là đơn vị đo của", "từ thông", ["cảm ứng từ", "lực từ", "cường độ dòng điện"]],
  ["Trong sóng điện từ, tại mỗi điểm, vectơ cường độ điện trường $\\vec{E}$ và vectơ cảm ứng từ $\\vec{B}$", "vuông góc với nhau và cùng vuông góc với phương truyền sóng",
    ["cùng phương với phương truyền sóng", "song song với nhau và vuông góc với phương truyền sóng", "dao động lệch pha nhau $90^\\circ$"]],
  ["Cảm ứng từ tại một điểm trong từ trường có hướng", "trùng với hướng tiếp tuyến của đường sức từ tại điểm đó",
    ["vuông góc với đường sức từ tại điểm đó", "luôn hướng về cực Nam của nam châm gần nhất", "trùng với hướng của lực từ tác dụng lên dòng điện đặt tại đó"]],
];
const EMI_YES = [
  "máy phát điện xoay chiều", "máy biến áp", "bếp từ (bếp cảm ứng)", "bộ sạc không dây của điện thoại", "micro điện động",
  "hệ thống phanh điện từ của tàu điện", "bộ cảm biến (pick-up) của đàn guitar điện", "lò nung cảm ứng luyện kim",
];
const EMI_NO = [
  "bóng đèn sợi đốt", "pin mặt trời", "acquy chì", "bàn là điện dùng dây điện trở", "nhiệt kế thủy ngân", "pin điện hóa (pin con thỏ)", "đèn LED", "bình nóng lạnh dùng thanh điện trở",
];

type V3 = [number, number, number];
const DIRS: { v: V3; n: string }[] = [
  { v: [1, 0, 0], n: "từ trái sang phải" }, { v: [-1, 0, 0], n: "từ phải sang trái" },
  { v: [0, 1, 0], n: "từ dưới lên trên" }, { v: [0, -1, 0], n: "từ trên xuống dưới" },
  { v: [0, 0, 1], n: "vuông góc với mặt phẳng hình vẽ, từ trong ra ngoài" }, { v: [0, 0, -1], n: "vuông góc với mặt phẳng hình vẽ, từ ngoài vào trong" },
];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const neg = (a: V3): V3 => [-a[0], -a[1], -a[2]];
const dirOf = (v: V3) => { const d = DIRS.find((x) => x.v.every((c, i) => c === v[i])); need(d); return d!; };
const LEFT_HAND = "Quy tắc bàn tay trái: đặt bàn tay trái sao cho các đường sức từ hướng vào lòng bàn tay, chiều từ cổ tay đến ngón giữa là chiều dòng điện thì ngón cái choãi ra $90^\\circ$ chỉ chiều lực từ";

const H1T: Template[] = [
  /* ---------- MCQ ---------- */
  {
    ...TT, id: "l12k2-tu-truong-ly-thuyet", topic: "Từ trường, lực từ, cảm ứng điện từ – lí thuyết", level: 1, kind: "mcq",
    make: (r) => {
      const askTrue = r.chance(0.5);
      const right = r.pick(askTrue ? TRUE_TT : FALSE_TT), wrong = pickN(r, askTrue ? FALSE_TT : TRUE_TT, 3);
      return {
        stem: `${r.pick(["Khi ôn tập về từ trường và cảm ứng điện từ, phát biểu", `Bạn ${r.pick(NAMES)} ghi lại một số phát biểu về từ trường. Phát biểu`, "Xét các kiến thức về từ trường. Phát biểu", "Trong giờ thảo luận nhóm về từ trường, phát biểu"])} nào sau đây là ${askTrue ? "đúng" : "sai"}?`,
        ...mcq(r, right, wrong),
        explanation: askTrue ? `Phát biểu đúng: ${right} Các phát biểu còn lại sai.` : `Phát biểu sai: ${right} Các phát biểu còn lại đúng.`,
      };
    },
  },
  {
    ...TT, id: "l12k2-duong-suc-tu", topic: "Đường sức từ, cảm ứng từ, các quy tắc", level: 1, kind: "mcq",
    make: (r) => {
      const [s, right, wrong] = r.pick(FIELD_Q);
      return {
        stem: s,
        ...mcq(r, right, wrong),
        explanation: `${s} ${right}.`,
      };
    },
  },
  {
    ...TT, id: "l12k2-quy-tac-ban-tay-trai", topic: "Chiều của lực từ – quy tắc bàn tay trái", level: 2, kind: "mcq",
    make: (r) => {
      const par = r.chance(0.15), askI = !par && r.chance(0.35);
      const I = r.pick(DIRS), B = r.pick(DIRS), d = dot(I.v, B.v);
      need(par ? d !== 0 : d === 0);
      const ctx = "Coi mặt phẳng hình vẽ là mặt phẳng trang giấy đặt trước mặt người quan sát.";
      if (askI) {
        const F = dirOf(cross(I.v, B.v));
        return {
          stem: `${ctx} Một đoạn dây dẫn thẳng mang dòng điện đặt trong từ trường đều, vuông góc với các đường sức từ. Cảm ứng từ có hướng ${B.n}; lực từ tác dụng lên đoạn dây có hướng ${F.n}. Dòng điện trong đoạn dây có chiều`,
          ...mcq(r, cap(I.n), [cap(dirOf(neg(I.v)).n), ...r.shuffle(DIRS.filter((x) => x !== I && dot(x.v, I.v) === 0)).map((x) => cap(x.n))]),
          explanation: `${LEFT_HAND}. Với cảm ứng từ hướng ${B.n} và lực từ hướng ${F.n} thì dòng điện phải có chiều ${I.n}.`,
        };
      }
      const ZERO = "Lực từ bằng 0";
      if (par) {
        return {
          stem: `${ctx} Một đoạn dây dẫn thẳng mang dòng điện có chiều ${I.n} đặt trong từ trường đều có cảm ứng từ hướng ${B.n}. Lực từ tác dụng lên đoạn dây`,
          ...mcq(r, ZERO, r.shuffle(DIRS.map((x) => `Có hướng ${x.n}`))),
          explanation: `Đoạn dây song song với đường sức từ ($\\alpha = ${d > 0 ? 0 : 180}^\\circ$) nên $F = BIl\\sin\\alpha = 0$.`,
        };
      }
      const F = dirOf(cross(I.v, B.v));
      return {
        stem: `${ctx} Một đoạn dây dẫn thẳng mang dòng điện có chiều ${I.n} đặt trong từ trường đều có cảm ứng từ hướng ${B.n}. Lực từ tác dụng lên đoạn dây`,
        ...mcq(r, `Có hướng ${F.n}`, [`Có hướng ${dirOf(neg(F.v)).n}`, ...r.shuffle([ZERO, `Có hướng ${B.n}`, `Có hướng ${I.n}`, `Có hướng ${dirOf(neg(B.v)).n}`])]),
        explanation: `${LEFT_HAND}: lực từ có hướng ${F.n}.`,
      };
    },
  },
  {
    ...TT, id: "l12k2-luc-tu-F-BIl", topic: "Lực từ tác dụng lên đoạn dây – $F = BIl\\sin\\alpha$", level: 1, kind: "mcq",
    make: (r) => {
      const B = r.pick([0.02, 0.04, 0.05, 0.1, 0.2, 0.25, 0.4, 0.5, 0.6, 0.8]), I = r.int(1, 12), lcm = r.pick([5, 8, 10, 12, 15, 20, 25, 30, 40, 50]);
      const a = r.pick([30, 90, 90, 150]), l = lcm / 100, s = sinD(a), F = B * I * l * s;
      need(exact(F, 6) && Math.abs(sig(F) - F) < 1e-12);
      const ang = a === 90 ? "vuông góc với các đường sức từ" : `hợp với các đường sức từ một góc $${a}^\\circ$`;
      const ask = r.pick(["F", "F", "B", "I"]);
      if (ask === "F") {
        return {
          stem: `Một đoạn dây dẫn thẳng dài ${q(lcm, "cm")} mang dòng điện cường độ ${q(I, "A")} đặt trong từ trường đều có cảm ứng từ ${q(B, "T")}, đoạn dây ${ang}. Độ lớn lực từ tác dụng lên đoạn dây là`,
          ...nopt(r, F, [B * I * lcm * s, 2 * F, F / 2, Math.abs(B * I * l * cosD(a))], (x) => qs(x, "N")),
          explanation: `$F = BIl\\sin\\alpha = ${tex(B)}\\cdot ${I}\\cdot ${tex(l)}\\cdot \\sin ${a}^\\circ = ${ts(F)}\\ \\text{N}$ (đổi $${lcm}\\ \\text{cm} = ${tex(l)}\\ \\text{m}$).`,
        };
      }
      if (ask === "B") {
        return {
          stem: `Một đoạn dây dẫn thẳng dài ${q(lcm, "cm")} mang dòng điện cường độ ${q(I, "A")} đặt trong từ trường đều, đoạn dây ${ang}. Lực từ tác dụng lên đoạn dây có độ lớn ${qs(F, "N")}. Độ lớn cảm ứng từ là`,
          ...nopt(r, B, [F / (I * lcm * s), F / (I * l), 2 * B, B / 2, F * I * l], (x) => qs(x, "T")),
          explanation: `$B = \\dfrac{F}{Il\\sin\\alpha} = \\dfrac{${ts(F)}}{${I}\\cdot ${tex(l)}\\cdot \\sin ${a}^\\circ} = ${tex(B)}\\ \\text{T}$.`,
        };
      }
      return {
        stem: `Một đoạn dây dẫn thẳng dài ${q(lcm, "cm")} đặt trong từ trường đều có cảm ứng từ ${q(B, "T")}, đoạn dây ${ang}. Khi cho dòng điện chạy qua, lực từ tác dụng lên đoạn dây có độ lớn ${qs(F, "N")}. Cường độ dòng điện chạy qua đoạn dây là`,
        ...nopt(r, I, [F / (B * lcm * s), F / (B * l), 2 * I, I / 2], (x) => qs(x, "A")),
        explanation: `$I = \\dfrac{F}{Bl\\sin\\alpha} = \\dfrac{${ts(F)}}{${tex(B)}\\cdot ${tex(l)}\\cdot \\sin ${a}^\\circ} = ${I}\\ \\text{A}$.`,
      };
    },
  },
  {
    ...TT, id: "l12k2-tu-thong", topic: "Từ thông $\\Phi = NBS\\cos\\alpha$", level: 2, kind: "mcq",
    make: (r) => {
      const N = r.pick([1, 1, 10, 20, 50, 100, 200]), B = r.pick([0.02, 0.04, 0.05, 0.1, 0.2, 0.25, 0.4, 0.5]), Scm = r.pick([10, 20, 25, 40, 50, 60, 80, 100, 120, 200]);
      const byPlane = r.chance(0.5), al = r.pick([0, 30, 60]), beta = 90 - al;
      const S2 = Scm * 1e-4, Phi = N * B * S2 * cosD(al);
      const geo = byPlane ? `mặt phẳng khung dây hợp với các đường sức từ một góc $${beta}^\\circ$` : al === 0 ? "vectơ pháp tuyến của mặt phẳng khung dây cùng hướng với cảm ứng từ" : `vectơ pháp tuyến của mặt phẳng khung dây hợp với cảm ứng từ một góc $${al}^\\circ$`;
      const coil = N > 1 ? `Một khung dây phẳng gồm ${N} vòng, diện tích mỗi vòng ${cm2(Scm)}` : `Một vòng dây dẫn phẳng có diện tích ${cm2(Scm)}`;
      return {
        stem: `${coil}, đặt trong từ trường đều có cảm ứng từ ${q(B, "T")}, ${geo}. Từ thông qua ${N > 1 ? "khung dây" : "vòng dây"} có độ lớn là`,
        ...nopt(r, Phi, [N * B * S2 * sinD(al), Phi * 1e4, N > 1 ? Phi / N : 2 * Phi, Phi / 2], (x) => `$${sci(x)}\\ \\text{Wb}$`),
        explanation: `${byPlane ? `Góc giữa pháp tuyến và $\\vec{B}$ là $\\alpha = 90^\\circ - ${beta}^\\circ = ${al}^\\circ$. ` : ""}$\\Phi = ${N > 1 ? "N" : ""}BS\\cos\\alpha = ${N > 1 ? N + "\\cdot " : ""}${tex(B)}\\cdot ${sci(S2)}\\cdot\\cos ${al}^\\circ \\approx ${sci(Phi)}\\ \\text{Wb}$ (đổi $${Scm}\\ \\text{cm}^2 = ${sci(S2)}\\ \\text{m}^2$).`,
      };
    },
  },
  {
    ...TT, id: "l12k2-suat-dien-dong-cam-ung", topic: "Định luật Faraday – suất điện động cảm ứng", level: 2, kind: "mcq",
    make: (r) => {
      const N = r.pick([10, 20, 50, 100, 200, 250, 500]), Scm = r.pick([20, 25, 40, 50, 60, 80, 100, 150, 200]);
      const B1 = r.pick([0, 0.1, 0.2, 0.3, 0.4, 0.5]), B2 = r.pick([0, 0.1, 0.2, 0.4, 0.5, 0.6, 0.8, 1]), dt = r.pick([0.01, 0.02, 0.04, 0.05, 0.1, 0.2, 0.25, 0.5]);
      need(B1 !== B2);
      const S2 = Scm * 1e-4, dB = Math.abs(B2 - B1), e = (N * S2 * dB) / dt;
      need(e >= 0.01 && e <= 500);
      const chg = B2 === 0 ? `giảm đều từ ${q(B1, "T")} về 0` : B1 === 0 ? `tăng đều từ 0 lên ${q(B2, "T")}` : `${B2 > B1 ? "tăng" : "giảm"} đều từ ${q(B1, "T")} đến ${q(B2, "T")}`;
      return {
        stem: `Một khung dây phẳng gồm ${N} vòng, diện tích mỗi vòng ${cm2(Scm)}, đặt trong từ trường đều sao cho mặt phẳng khung vuông góc với các đường sức từ. Trong thời gian ${q(dt, "s")}, cảm ứng từ ${chg}. Độ lớn suất điện động cảm ứng xuất hiện trong khung là`,
        ...nopt(r, e, [e / N, e * 1e4, (N * S2 * Math.max(B1, B2)) / dt, (N * S2 * (B1 + B2)) / dt, 2 * e, e * dt * dt], (x) => qs(x, "V")),
        explanation: `$|e| = N\\dfrac{|\\Delta\\Phi|}{\\Delta t} = \\dfrac{NS|\\Delta B|}{\\Delta t} = \\dfrac{${N}\\cdot ${sci(S2)}\\cdot ${tex(dB)}}{${tex(dt)}} = ${ts(e)}\\ \\text{V}$.`,
      };
    },
  },
  {
    ...TT, id: "l12k2-dinh-luat-lenz", topic: "Định luật Lenz – chiều dòng điện cảm ứng", level: 2, kind: "mcq",
    make: (r) => {
      const pole = r.pick(["Bắc", "Nam"]), other = pole === "Bắc" ? "Nam" : "Bắc", near = r.chance(0.5), moveCoil = r.chance(0.5);
      const setup = moveCoil
        ? `Giữ cố định một nam châm thẳng, ${near ? "đưa" : "kéo"} một vòng dây dẫn kín ${near ? "lại gần" : "ra xa"} cực ${pole} của nam châm`
        : `${near ? "Đưa" : "Kéo"} cực ${pole} của một nam châm thẳng ${near ? "lại gần" : "ra xa"} một vòng dây dẫn kín đặt cố định`;
      const axis = " (trục nam châm vuông góc với mặt phẳng vòng dây và đi qua tâm vòng dây).";
      if (r.chance(0.5)) {
        const opt = (p: string, push: boolean) => `Mặt đó là mặt ${p}; vòng dây và nam châm ${push ? "đẩy" : "hút"} nhau`;
        const right = near ? opt(pole, true) : opt(other, false);
        return {
          stem: `${setup}${axis} Theo định luật Lenz, mặt của vòng dây đối diện với nam châm trở thành mặt nào và tương tác giữa chúng ra sao?`,
          ...mcq(r, right, [opt(pole, true), opt(pole, false), opt(other, true), opt(other, false)]),
          explanation: near
            ? `Từ thông qua vòng dây tăng nên dòng điện cảm ứng sinh ra từ trường chống lại sự tăng đó: mặt đối diện là mặt ${pole} (cùng tên với cực nam châm) và đẩy nam châm ra.`
            : `Từ thông qua vòng dây giảm nên dòng điện cảm ứng sinh ra từ trường chống lại sự giảm đó: mặt đối diện là mặt ${other} (khác tên với cực nam châm) và hút nam châm lại.`,
        };
      }
      const opt = (inc: boolean, same: boolean) => `Từ thông qua vòng dây ${inc ? "tăng" : "giảm"}; cảm ứng từ của dòng điện cảm ứng tại tâm vòng dây ${same ? "cùng chiều" : "ngược chiều"} với cảm ứng từ của nam châm`;
      const right = opt(near, !near);
      return {
        stem: `${setup}${axis} Trong quá trình đó`,
        ...mcq(r, right, [opt(true, true), opt(true, false), opt(false, true), opt(false, false)]),
        explanation: `Khoảng cách giữa nam châm và vòng dây ${near ? "giảm nên từ thông qua vòng dây tăng; dòng điện cảm ứng sinh ra từ trường ngược chiều để chống lại sự tăng" : "tăng nên từ thông qua vòng dây giảm; dòng điện cảm ứng sinh ra từ trường cùng chiều để chống lại sự giảm"} (định luật Lenz).`,
      };
    },
  },
  {
    ...TT, id: "l12k2-ung-dung-cam-ung", topic: "Ứng dụng hiện tượng cảm ứng điện từ", level: 1, kind: "mcq",
    make: (r) => {
      const yes = r.chance(0.5);
      const right = r.pick(yes ? EMI_YES : EMI_NO), wrong = pickN(r, yes ? EMI_NO : EMI_YES, 3);
      return {
        stem: `${r.pick(["", `Bạn ${r.pick(NAMES)} tìm hiểu các thiết bị điện trong gia đình và nhà máy. `, `Trong giờ học về ứng dụng của cảm ứng điện từ, nhóm của bạn ${r.pick(NAMES)} liệt kê một số thiết bị. `, "Hiện tượng cảm ứng điện từ có nhiều ứng dụng trong đời sống và kĩ thuật. "])}${yes
          ? r.pick(["Thiết bị nào sau đây hoạt động dựa trên hiện tượng cảm ứng điện từ?", "Trong các thiết bị sau, thiết bị nào là ứng dụng của hiện tượng cảm ứng điện từ?"])
          : r.pick(["Thiết bị nào sau đây KHÔNG hoạt động dựa trên hiện tượng cảm ứng điện từ?", "Trong các thiết bị sau, thiết bị nào KHÔNG phải là ứng dụng của hiện tượng cảm ứng điện từ?"])}`,
        ...mcq(r, cap(right), wrong.map(cap)),
        explanation: yes
          ? `${cap(right)} hoạt động nhờ từ thông biến thiên làm xuất hiện suất điện động (dòng điện) cảm ứng. Các thiết bị còn lại dùng tác dụng nhiệt của dòng điện, hiện tượng quang điện, phản ứng hóa học hoặc sự phát quang.`
          : `${cap(right)} không dựa trên cảm ứng điện từ. Các thiết bị còn lại đều dùng từ thông biến thiên để tạo ra dòng điện cảm ứng.`,
      };
    },
  },

  /* ---------- TF ---------- */
  {
    ...TT, id: "l12k2-tf-luc-tu", topic: "Lực từ tác dụng lên đoạn dây dẫn – Đúng/Sai", level: 2, kind: "tf",
    make: (r) => {
      const B = r.pick([0.05, 0.1, 0.2, 0.25, 0.4, 0.5, 0.8]), I = r.int(2, 10), lcm = r.pick([10, 15, 20, 25, 30, 40, 50]), a = r.pick([30, 90, 150]);
      const l = lcm / 100, F = B * I * l * sinD(a), Fm = B * I * l;
      need(Math.abs(sig(F) - F) < 1e-12);
      const c1 = r.chance(0.5), c2 = r.chance(0.5), c3 = r.chance(0.5), c4 = r.chance(0.5);
      return {
        stem: `Một đoạn dây dẫn thẳng dài ${q(lcm, "cm")} mang dòng điện ${q(I, "A")} được đặt trong từ trường đều có cảm ứng từ ${q(B, "T")}, đoạn dây ${a === 90 ? "vuông góc với các đường sức từ" : `hợp với các đường sức từ một góc $${a}^\\circ$`}.`,
        ...tf([
          [`Lực từ tác dụng lên đoạn dây có độ lớn ${qs(c1 ? F : B * I * lcm * sinD(a), "N")}.`, c1],
          [c2 ? "Nếu xoay đoạn dây cho song song với các đường sức từ thì lực từ tác dụng lên nó bằng 0." : "Nếu xoay đoạn dây cho song song với các đường sức từ thì lực từ tác dụng lên nó có độ lớn cực đại.", c2],
          [`Giữ nguyên vị trí đoạn dây, nếu tăng cường độ dòng điện lên gấp đôi thì lực từ tăng ${c3 ? "gấp đôi" : "gấp bốn"}.`, c3],
          [`Thay đổi hướng đặt đoạn dây trong từ trường, lực từ tác dụng lên đoạn dây có độ lớn lớn nhất là ${qs(c4 ? Fm : 2 * Fm, "N")}.`, c4],
        ]),
        explanation: `$F = BIl\\sin\\alpha = ${tex(B)}\\cdot ${I}\\cdot ${tex(l)}\\cdot\\sin ${a}^\\circ = ${ts(F)}\\ \\text{N}$. Dây song song đường sức ($\\alpha = 0$) thì $F = 0$. $F$ tỉ lệ thuận với $I$. Lực lớn nhất khi dây vuông góc đường sức: $F_{max} = BIl = ${ts(Fm)}\\ \\text{N}$.`,
      };
    },
  },
  {
    ...TT, id: "l12k2-tf-cam-ung-khung-day", topic: "Cảm ứng điện từ trong khung dây – Đúng/Sai", level: 3, kind: "tf",
    make: (r) => {
      const N = r.pick([50, 100, 200, 250, 500]), Scm = r.pick([20, 40, 50, 80, 100, 200]), B1 = r.pick([0.1, 0.2, 0.4, 0.5]), B2 = r.pick([0, 0.1, 0.2, 0.6, 0.8, 1]);
      const dt = r.pick([0.05, 0.1, 0.2, 0.25, 0.5]), R = r.pick([2, 4, 5, 8, 10, 20]);
      need(B1 !== B2);
      const S2 = Scm * 1e-4, Phi1 = N * B1 * S2, dB = Math.abs(B2 - B1), e = (N * S2 * dB) / dt, I = e / R;
      need(e >= 0.1 && e < 1000);
      const inc = B2 > B1;
      const c1 = r.chance(0.5), c2 = r.chance(0.5), c3 = r.chance(0.5), c4 = r.chance(0.5);
      return {
        stem: `Một khung dây dẫn phẳng, kín gồm ${N} vòng, diện tích mỗi vòng ${cm2(Scm)}, điện trở tổng cộng ${ohm(R)}, đặt trong từ trường đều sao cho mặt phẳng khung vuông góc với các đường sức từ. Trong khoảng thời gian ${q(dt, "s")}, cảm ứng từ ${inc ? "tăng" : "giảm"} đều từ ${q(B1, "T")} đến ${q(B2, "T")}.`,
        ...tf([
          [`Lúc đầu, từ thông qua khung dây có độ lớn $${sci(c1 ? Phi1 : B1 * S2 * (N === 1 ? 2 : 1))}\\ \\text{Wb}$.`, c1],
          [`Độ lớn suất điện động cảm ứng trong khung là ${qs(c2 ? e : (N * S2 * B2 || N * S2 * B1 * 2) / dt, "V")}.`, c2],
          [`Cường độ dòng điện cảm ứng trong khung là ${qs(c3 ? I : e * R, "A")}.`, c3],
          [`Bên trong khung dây, cảm ứng từ do dòng điện cảm ứng sinh ra ${(c4 ? !inc : inc) ? "cùng chiều" : "ngược chiều"} với cảm ứng từ của từ trường ngoài.`, c4],
        ]),
        explanation: `$\\Phi_1 = NB_1S = ${N}\\cdot ${tex(B1)}\\cdot ${sci(S2)} = ${sci(Phi1)}\\ \\text{Wb}$. $|e| = \\dfrac{NS|\\Delta B|}{\\Delta t} = \\dfrac{${N}\\cdot ${sci(S2)}\\cdot ${tex(dB)}}{${tex(dt)}} = ${ts(e)}\\ \\text{V}$; $I = \\dfrac{|e|}{R} = ${ts(I)}\\ \\text{A}$. Từ thông ${inc ? "tăng nên từ trường cảm ứng ngược chiều" : "giảm nên từ trường cảm ứng cùng chiều"} với từ trường ngoài (định luật Lenz).`,
      };
    },
  },

  /* ---------- SHORT ---------- */
  {
    ...TT, id: "l12k2-s-luc-tu", topic: "Tính lực từ, cảm ứng từ – trả lời ngắn", level: 1, kind: "short",
    make: (r) => {
      const B = r.pick([0.05, 0.1, 0.2, 0.25, 0.4, 0.5, 0.6, 0.8]), I = r.int(1, 12), lcm = r.pick([10, 15, 20, 25, 30, 40, 50]), a = r.pick([30, 90, 90, 150]);
      const l = lcm / 100, F = B * I * l * sinD(a);
      const ang = a === 90 ? "vuông góc với các đường sức từ" : `hợp với các đường sức từ một góc $${a}^\\circ$`;
      if (r.chance(0.6)) {
        need(F >= 0.01);
        return {
          stem: `Một đoạn dây dẫn thẳng dài ${q(lcm, "cm")} mang dòng điện ${q(I, "A")} đặt trong từ trường đều có cảm ứng từ ${q(B, "T")}, đoạn dây ${ang}. Lực từ tác dụng lên đoạn dây có độ lớn bao nhiêu niutơn? (Làm tròn đến hàng phần trăm.)`,
          ...short(F, 2),
          explanation: `$F = BIl\\sin\\alpha = ${tex(B)}\\cdot ${I}\\cdot ${tex(l)}\\cdot\\sin ${a}^\\circ = ${tex(F, 4)}\\ \\text{N} \\approx ${tex(F, 2)}\\ \\text{N}$.`,
        };
      }
      need(exact(F, 4));
      const mN = F * 1000;
      return {
        stem: `Một đoạn dây dẫn thẳng dài ${q(lcm, "cm")} mang dòng điện ${q(I, "A")} đặt trong từ trường đều, đoạn dây ${ang}. Lực từ tác dụng lên đoạn dây có độ lớn ${q(mN, "mN", 1)}. Cảm ứng từ của từ trường có độ lớn bao nhiêu tesla? (Làm tròn đến hàng phần trăm.)`,
        ...short(B, 2),
        explanation: `$B = \\dfrac{F}{Il\\sin\\alpha} = \\dfrac{${tex(F, 4)}}{${I}\\cdot ${tex(l)}\\cdot\\sin ${a}^\\circ} = ${tex(B)}\\ \\text{T}$.`,
      };
    },
  },
  {
    ...TT, id: "l12k2-s-suat-dien-dong", topic: "Suất điện động, dòng điện cảm ứng – trả lời ngắn", level: 3, kind: "short",
    make: (r) => {
      const N = r.pick([20, 50, 100, 200, 250, 500]), Scm = r.pick([20, 25, 40, 50, 60, 80, 100, 150, 200]), B = r.pick([0.05, 0.1, 0.2, 0.25, 0.4, 0.5]);
      const dt = r.pick([0.02, 0.05, 0.1, 0.2, 0.25, 0.5]), R = r.pick([2, 4, 5, 8, 10, 20, 25]), S2 = Scm * 1e-4;
      const form = r.pick(["rot90", "rot180", "off"]);
      const dPhi = form === "rot180" ? 2 * N * B * S2 : N * B * S2, e = dPhi / dt;
      const askI = r.chance(0.5), val = askI ? e / R : e;
      need(val >= 0.1 && val < 100);
      const dp = val < 10 ? 2 : 1;
      const proc = form === "off"
        ? `Trong thời gian ${q(dt, "s")}, người ta giảm đều cảm ứng từ về 0`
        : `Quay đều khung trong thời gian ${q(dt, "s")} đến khi ${form === "rot90" ? "mặt phẳng khung song song với các đường sức từ" : "khung quay được nửa vòng (pháp tuyến đổi hướng ngược lại)"}`;
      return {
        stem: `Một khung dây dẫn kín gồm ${N} vòng, diện tích mỗi vòng ${cm2(Scm)}, điện trở ${ohm(R)}, ban đầu đặt trong từ trường đều ${q(B, "T")} với mặt phẳng khung vuông góc với các đường sức từ. ${proc}. ${askI ? "Cường độ dòng điện cảm ứng trung bình trong khung là bao nhiêu ampe?" : "Độ lớn suất điện động cảm ứng trung bình trong khung là bao nhiêu vôn?"} (Làm tròn đến hàng ${dp === 2 ? "phần trăm" : "phần mười"}.)`,
        ...short(val, dp),
        explanation: `$|\\Delta\\Phi| = ${form === "rot180" ? "2NBS" : "NBS"} = ${form === "rot180" ? "2\\cdot " : ""}${N}\\cdot ${tex(B)}\\cdot ${sci(S2)} = ${ts(dPhi)}\\ \\text{Wb}$${form === "rot180" ? " (từ thông đổi từ $NBS$ sang $-NBS$)" : ""}. $|e| = \\dfrac{|\\Delta\\Phi|}{\\Delta t} = ${ts(e)}\\ \\text{V}$${askI ? `; $I = \\dfrac{|e|}{R} = ${ts(e / R)}\\ \\text{A}$` : ""}.`,
      };
    },
  },
];

/* ================================================================
   HALF 1b – DÒNG ĐIỆN XOAY CHIỀU
   ================================================================ */
const TRUE_XC = [
  "Dòng điện xoay chiều hình sin là dòng điện có cường độ biến thiên điều hòa theo thời gian.",
  "Số chỉ của ampe kế xoay chiều cho biết giá trị hiệu dụng của cường độ dòng điện.",
  "Giá trị hiệu dụng của điện áp xoay chiều hình sin bằng giá trị cực đại chia cho $\\sqrt{2}$.",
  "Máy phát điện xoay chiều hoạt động dựa trên hiện tượng cảm ứng điện từ.",
  "Máy biến áp hoạt động dựa trên hiện tượng cảm ứng điện từ.",
  "Máy biến áp không làm thay đổi tần số của dòng điện xoay chiều.",
  "Máy biến áp có số vòng dây cuộn thứ cấp lớn hơn số vòng dây cuộn sơ cấp là máy tăng áp.",
  "Máy biến áp không biến đổi được điện áp của dòng điện không đổi.",
  "Để giảm hao phí khi truyền tải điện năng đi xa, người ta tăng điện áp ở nơi phát trước khi truyền đi.",
  "Công suất hao phí trên đường dây tải điện tỉ lệ nghịch với bình phương điện áp hiệu dụng ở nơi phát.",
  "Điện áp $220\\ \\text{V}$ ghi trên các thiết bị điện dân dụng là giá trị hiệu dụng.",
  "Mạng điện dân dụng ở Việt Nam có tần số $50\\ \\text{Hz}$.",
];
const FALSE_XC = [
  "Số chỉ của vôn kế xoay chiều cho biết giá trị cực đại của điện áp.",
  "Giá trị hiệu dụng của dòng điện xoay chiều hình sin bằng giá trị cực đại nhân với $\\sqrt{2}$.",
  "Máy biến áp có thể biến đổi điện áp của dòng điện không đổi.",
  "Máy biến áp làm thay đổi tần số của dòng điện xoay chiều.",
  "Máy hạ áp có số vòng dây cuộn thứ cấp lớn hơn số vòng dây cuộn sơ cấp.",
  "Để giảm hao phí khi truyền tải điện năng đi xa, cách hiệu quả nhất là giảm điện áp ở nơi phát.",
  "Công suất hao phí trên đường dây tải điện tỉ lệ thuận với bình phương điện áp ở nơi phát.",
  "Máy phát điện xoay chiều biến đổi điện năng thành cơ năng.",
  "Điện áp $220\\ \\text{V}$ ghi trên các thiết bị điện dân dụng là giá trị cực đại.",
  "Mạng điện dân dụng ở Việt Nam có tần số $60\\ \\text{Hz}$.",
  "Với máy biến áp lí tưởng, cường độ dòng điện hiệu dụng trong mỗi cuộn tỉ lệ thuận với số vòng dây của cuộn đó.",
];
/** biên độ dạng k√2 hoặc k */
const amp = (k: number, rt: boolean) => (rt ? (k === 1 ? "\\sqrt{2}" : `${k}\\sqrt{2}`) : `${k}`);
/** pha ban đầu (đơn vị π): [tử, mẫu] */
const PHASES: [number, number][] = [[0, 1], [1, 3], [-1, 3], [1, 6], [-1, 6], [1, 4], [-1, 4], [1, 2], [-1, 2], [2, 3], [-2, 3]];
const phT = (n: number, d: number) => (n === 0 ? "0" : `${n < 0 ? "-" : ""}\\dfrac{${Math.abs(n) === 1 ? "" : Math.abs(n)}\\pi}{${d}}`);
const phTerm = (n: number, d: number) => (n === 0 ? "" : ` ${n < 0 ? "-" : "+"} ${phT(Math.abs(n), d)}`);
const XSYM = [
  { s: "u", u: "V", n: "điện áp", amps: [100, 110, 120, 200, 220, 240] },
  { s: "e", u: "V", n: "suất điện động", amps: [100, 110, 120, 200, 220, 240] },
  { s: "i", u: "A", n: "cường độ dòng điện", amps: [2, 4, 6, 8, 10] },
];
/** chu kì 1/f dạng số thập phân (nếu hữu hạn gọn) hoặc phân số */
const tT = (n: number, d: number) => (exact(n / d, 4) ? tex(n / d, 4) : frac(n, d));

const H1X: Template[] = [
  /* ---------- MCQ ---------- */
  {
    ...XC, id: "l12k2-xc-doc-bieu-thuc", topic: "Biểu thức dòng điện, điện áp xoay chiều – đọc các đại lượng", level: 1, kind: "mcq",
    make: (r) => {
      const X = r.pick(XSYM), a = r.pick(X.amps), rt = r.chance(0.6), f = r.pick([20, 25, 40, 50, 50, 100]), [pn, pd] = r.pick(PHASES);
      const expr = `$${X.s} = ${amp(a, rt)}\\cos\\left(${2 * f}\\pi t${phTerm(pn, pd)}\\right)\\ (\\text{${X.u}})$`;
      const pre = `${cap(X.n)} xoay chiều có biểu thức ${expr}, trong đó $t$ tính bằng giây.`;
      const U = (s: string) => `$${s}\\ \\text{${X.u}}$`;
      const ask = r.pick(["max", "eff", "f", "T", "w", "ph"]);
      if (ask === "max") {
        return {
          stem: `${pre} Giá trị cực đại của ${X.n} là`,
          ...mcq(r, U(amp(a, rt)), (rt ? [amp(a, false), amp(2 * a, true), amp(a / 2, true)] : [amp(a / 2, true), amp(a, true), amp(2 * a, false), amp(a / 2, false)]).map(U)),
          explanation: `Hệ số đứng trước hàm cos là giá trị cực đại: $${X.s.toUpperCase()}_0 = ${amp(a, rt)}\\ \\text{${X.u}}$.`,
        };
      }
      if (ask === "eff") {
        const right = rt ? amp(a, false) : amp(a / 2, true);
        return {
          stem: `${pre} Giá trị hiệu dụng của ${X.n} là`,
          ...mcq(r, U(right), (rt ? [amp(a, true), amp(2 * a, false), amp(a / 2, false)] : [amp(a, false), amp(a, true), amp(a / 2, false)]).map(U)),
          explanation: `Giá trị hiệu dụng bằng giá trị cực đại chia $\\sqrt{2}$: $\\dfrac{${amp(a, rt)}}{\\sqrt{2}} = ${right}\\ \\text{${X.u}}$.`,
        };
      }
      if (ask === "f") {
        const H = (s: string) => `$${s}\\ \\text{Hz}$`;
        return {
          stem: `${pre} Tần số của ${X.n} là`,
          ...mcq(r, H(`${f}`), [H(`${2 * f}`), H(`${2 * f}\\pi`), H(`${f / 2}`.replace(".", "{,}"))]),
          explanation: `$\\omega = ${2 * f}\\pi\\ \\text{rad/s}$ nên $f = \\dfrac{\\omega}{2\\pi} = ${f}\\ \\text{Hz}$.`,
        };
      }
      if (ask === "T") {
        const Sx = (s: string) => `$${s}\\ \\text{s}$`;
        return {
          stem: `${pre} Chu kì của ${X.n} là`,
          ...mcq(r, Sx(tT(1, f)), [Sx(tT(1, 2 * f)), Sx(tT(2, f)), Sx(tT(1, 4 * f))]),
          explanation: `$T = \\dfrac{2\\pi}{\\omega} = \\dfrac{2\\pi}{${2 * f}\\pi} = ${tT(1, f)}\\ \\text{s}$.`,
        };
      }
      if (ask === "w") {
        const W = (s: string) => `$${s}\\ \\text{rad/s}$`;
        return {
          stem: `${pre} Tần số góc của ${X.n} là`,
          ...mcq(r, W(`${2 * f}\\pi`), [W(`${f}\\pi`), W(`${2 * f}`), W(`${4 * f}\\pi`)]),
          explanation: `So sánh với dạng $${X.s} = ${X.s.toUpperCase()}_0\\cos(\\omega t + \\varphi)$: $\\omega = ${2 * f}\\pi\\ \\text{rad/s}$.`,
        };
      }
      const P = (s: string) => `$${s}\\ \\text{rad}$`;
      const others = PHASES.filter(([n, d]) => !(n === pn && d === pd) && !(n === -pn && d === pd));
      const [on, od] = r.pick(others);
      return {
        stem: `${pre} Pha ban đầu của ${X.n} là`,
        ...mcq(r, P(phT(pn, pd)), [P(phT(-pn, pd)), P(`${2 * f}\\pi t${phTerm(pn, pd)}`), P(phT(on, od)), P(`${2 * f}\\pi`)]),
        explanation: `So sánh với dạng $${X.s} = ${X.s.toUpperCase()}_0\\cos(\\omega t + \\varphi)$: pha ban đầu $\\varphi = ${phT(pn, pd)}\\ \\text{rad}$; còn $(${2 * f}\\pi t${phTerm(pn, pd)})$ là pha tại thời điểm $t$.`,
      };
    },
  },
  {
    ...XC, id: "l12k2-xc-gia-tri-hieu-dung", topic: "Giá trị hiệu dụng của điện áp, cường độ dòng điện", level: 1, kind: "mcq",
    make: (r) => {
      const form = r.pick(["U0", "Ueff", "I0", "Ieff"]);
      if (form === "U0") {
        const U0 = r.pick([100, 120, 150, 156, 200, 240, 300, 311, 400, 537]), U = U0 / Math.SQRT2;
        return {
          stem: `Một điện áp xoay chiều hình sin có giá trị cực đại ${q(U0, "V")}. Giá trị hiệu dụng của điện áp này xấp xỉ bằng`,
          ...nopt(r, U, [U0 * Math.SQRT2, U0 / 2, U0, 2 * U0], (x) => qs(x, "V")),
          explanation: `$U = \\dfrac{U_0}{\\sqrt{2}} = \\dfrac{${U0}}{\\sqrt{2}} \\approx ${ts(U)}\\ \\text{V}$.`,
        };
      }
      if (form === "Ueff") {
        const [dev, U] = r.pick([["một bóng đèn", 220], ["một quạt điện", 220], ["một máy sấy tóc", 110], ["một ấm điện", 220], ["một động cơ điện", 380], ["một bàn là", 120], ["một nồi cơm điện", 220], ["một máy bơm nước", 380]] as [string, number][]);
        const U0 = U * Math.SQRT2;
        return {
          stem: `Trên ${dev} có ghi điện áp định mức ${q(U, "V")} (dùng điện xoay chiều). Khi thiết bị hoạt động đúng định mức, điện áp tức thời giữa hai đầu thiết bị có giá trị lớn nhất xấp xỉ bằng`,
          ...nopt(r, U0, [U / Math.SQRT2, 2 * U, U, U * 3], (x) => qs(x, "V")),
          explanation: `Điện áp ghi trên thiết bị là giá trị hiệu dụng: $U_0 = U\\sqrt{2} = ${U}\\sqrt{2} \\approx ${ts(U0)}\\ \\text{V}$.`,
        };
      }
      const I = r.pick([0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8]);
      if (form === "I0") {
        const I0 = I * Math.SQRT2;
        return {
          stem: `Một ampe kế xoay chiều mắc nối tiếp với một đoạn mạch chỉ ${q(I, "A")}. Cường độ dòng điện cực đại qua đoạn mạch xấp xỉ bằng`,
          ...nopt(r, I0, [I / Math.SQRT2, 2 * I, I, I0 * 2], (x) => qs(x, "A")),
          explanation: `Ampe kế xoay chiều chỉ giá trị hiệu dụng: $I_0 = I\\sqrt{2} = ${tex(I)}\\sqrt{2} \\approx ${ts(I0)}\\ \\text{A}$.`,
        };
      }
      const I0 = r.pick([1, 2, 3, 4, 5, 6, 8, 10]), f = r.pick([50, 60, 100]);
      return {
        stem: `Dòng điện xoay chiều chạy qua một đoạn mạch có biểu thức $i = ${I0}\\cos(${2 * f}\\pi t)\\ (\\text{A})$. Mắc nối tiếp một ampe kế xoay chiều vào đoạn mạch thì số chỉ của ampe kế xấp xỉ là`,
        ...nopt(r, I0 / Math.SQRT2, [I0, I0 * Math.SQRT2, I0 / 2, 2 * I0], (x) => qs(x, "A")),
        explanation: `Ampe kế xoay chiều chỉ giá trị hiệu dụng: $I = \\dfrac{I_0}{\\sqrt{2}} = \\dfrac{${I0}}{\\sqrt{2}} \\approx ${ts(I0 / Math.SQRT2)}\\ \\text{A}$.`,
      };
    },
  },
  {
    ...XC, id: "l12k2-may-phat-dien", topic: "Máy phát điện xoay chiều – tần số, suất điện động", level: 2, kind: "mcq",
    make: (r) => {
      const form = r.pick(["f", "n", "E"]);
      if (form === "f" || form === "n") {
        const f = r.pick([50, 60]), p = r.pick([1, 2, 3, 4, 5, 6, 8, 10, 12]), n = (60 * f) / p;
        need(Number.isInteger(n));
        if (form === "f") {
          return {
            stem: `Rôto của một máy phát điện xoay chiều một pha là nam châm có ${p} cặp cực (${2 * p} cực), quay đều với tốc độ ${n} vòng/phút. Tần số của suất điện động do máy tạo ra là`,
            ...nopt(r, f, [p * n, (2 * p * n) / 60, n / 60, f / 2], (x) => q(x, "Hz", 1)),
            explanation: `Tốc độ quay $n = ${n}$ vòng/phút $= ${tex(n / 60, 2)}$ vòng/s. $f = pn = ${p}\\cdot ${tex(n / 60, 2)} = ${f}\\ \\text{Hz}$.`,
          };
        }
        return {
          stem: `Một máy phát điện xoay chiều một pha có rôto là nam châm gồm ${p} cặp cực. Để suất điện động do máy tạo ra có tần số ${q(f, "Hz")} thì rôto phải quay với tốc độ`,
          ...nopt(r, n, [f / p, (60 * f) / (2 * p), 60 * f * p, n * 2], (x) => `$${tex(x, 2)}$ vòng/phút`),
          explanation: `$f = \\dfrac{pn}{60}$ ($n$ tính bằng vòng/phút) $\\Rightarrow n = \\dfrac{60f}{p} = \\dfrac{60\\cdot ${f}}{${p}} = ${n}$ vòng/phút.`,
        };
      }
      const N = r.pick([50, 100, 200, 250, 500, 1000]), B = r.pick([0.05, 0.1, 0.2, 0.4, 0.5]), Scm = r.pick([50, 100, 200, 250, 400, 500]), f = r.pick([25, 50, 50, 60]);
      const S2 = Scm * 1e-4, w = 2 * Math.PI * f, E0 = N * B * S2 * w, askE = r.chance(0.4);
      need(E0 >= 1 && E0 < 5000);
      const right = askE ? E0 / Math.SQRT2 : E0;
      return {
        stem: `Một khung dây phẳng gồm ${N} vòng, diện tích mỗi vòng ${cm2(Scm)}, quay đều với tần số ${q(f, "Hz")} quanh một trục nằm trong mặt phẳng khung, vuông góc với các đường sức của từ trường đều ${q(B, "T")}. ${askE ? "Giá trị hiệu dụng" : "Giá trị cực đại"} của suất điện động cảm ứng trong khung xấp xỉ bằng`,
        ...nopt(r, right, askE ? [E0, E0 / Math.SQRT2 / (2 * Math.PI), B * S2 * w / Math.SQRT2, E0 * Math.SQRT2] : [E0 / Math.SQRT2, N * B * S2 * f, B * S2 * w, E0 * 2], (x) => qs(x, "V")),
        explanation: `$\\omega = 2\\pi f = ${2 * f}\\pi\\ \\text{rad/s}$; $E_0 = NBS\\omega = ${N}\\cdot ${tex(B)}\\cdot ${sci(S2)}\\cdot ${2 * f}\\pi \\approx ${ts(E0)}\\ \\text{V}$${askE ? `; $E = \\dfrac{E_0}{\\sqrt{2}} \\approx ${ts(E0 / Math.SQRT2)}\\ \\text{V}$` : ""}.`,
      };
    },
  },
  {
    ...XC, id: "l12k2-may-bien-ap", topic: "Máy biến áp lí tưởng", level: 1, kind: "mcq",
    make: (r) => {
      const N1 = r.int(2, 40) * 50, N2 = r.int(1, 40) * 50, U1 = r.pick([110, 120, 220, 240, 380]);
      need(N1 !== N2);
      const U2 = (U1 * N2) / N1;
      need(exact(U2, 1) && U2 >= 1);
      const form = r.pick(["U2", "U2", "N2", "I1", "type"]);
      const ctx = `Một máy biến áp lí tưởng có cuộn sơ cấp ${N1} vòng, cuộn thứ cấp ${N2} vòng.`;
      if (form === "U2") {
        return {
          stem: `${ctx} Đặt vào hai đầu cuộn sơ cấp điện áp xoay chiều có giá trị hiệu dụng ${q(U1, "V")}. Điện áp hiệu dụng giữa hai đầu cuộn thứ cấp để hở là`,
          ...nopt(r, U2, [(U1 * N1) / N2, 2 * U2, U2 / 2, U1 + U2], (x) => q(round(x, 1), "V", 1)),
          explanation: `$\\dfrac{U_2}{U_1} = \\dfrac{N_2}{N_1} \\Rightarrow U_2 = U_1\\dfrac{N_2}{N_1} = ${U1}\\cdot\\dfrac{${N2}}{${N1}} = ${tex(U2, 1)}\\ \\text{V}$.`,
        };
      }
      if (form === "N2") {
        return {
          stem: `Một máy biến áp lí tưởng có cuộn sơ cấp ${N1} vòng. Đặt vào hai đầu cuộn sơ cấp điện áp xoay chiều có giá trị hiệu dụng ${q(U1, "V")} thì điện áp hiệu dụng giữa hai đầu cuộn thứ cấp để hở là ${q(U2, "V", 1)}. Số vòng dây của cuộn thứ cấp là`,
          ...nopt(r, N2, [(N1 * U1) / U2, 2 * N2, N2 / 2, N1 + N2], (x) => `$${tex(round(x), 0)}$ vòng`),
          explanation: `$N_2 = N_1\\dfrac{U_2}{U_1} = ${N1}\\cdot\\dfrac{${tex(U2, 1)}}{${U1}} = ${N2}$ vòng.`,
        };
      }
      if (form === "I1") {
        const I2 = r.pick([0.5, 1, 1.5, 2, 2.5, 3, 4, 5]), I1 = (I2 * N2) / N1;
        need(exact(I1, 3));
        return {
          stem: `${ctx} Khi máy hoạt động có tải, cường độ dòng điện hiệu dụng trong cuộn thứ cấp là ${q(I2, "A")}. Cường độ dòng điện hiệu dụng trong cuộn sơ cấp là`,
          ...nopt(r, I1, [(I2 * N1) / N2, I2, 2 * I1, I1 / 2], (x) => qs(x, "A")),
          explanation: `Máy lí tưởng: $U_1I_1 = U_2I_2 \\Rightarrow I_1 = I_2\\dfrac{N_2}{N_1} = ${tex(I2)}\\cdot\\dfrac{${N2}}{${N1}} = ${ts(I1)}\\ \\text{A}$.`,
        };
      }
      const up = N2 > N1, inv = (U1 * N1) / N2;
      const opt = (u: boolean, v: number) => `Máy ${u ? "tăng" : "hạ"} áp; $U_2 \\approx ${ts(v)}\\ \\text{V}$`;
      return {
        stem: `${ctx} Đặt vào hai đầu cuộn sơ cấp điện áp xoay chiều có giá trị hiệu dụng ${q(U1, "V")}. Nhận xét nào sau đây đúng?`,
        ...mcq(r, opt(up, U2), [opt(!up, U2), opt(up, inv), opt(!up, inv)]),
        explanation: `$N_2 ${up ? ">" : "<"} N_1$ nên là máy ${up ? "tăng" : "hạ"} áp; $U_2 = U_1\\dfrac{N_2}{N_1} = ${tex(U2, 1)}\\ \\text{V}$.`,
      };
    },
  },
  {
    ...XC, id: "l12k2-truyen-tai-dien", topic: "Truyền tải điện năng – hao phí, hiệu suất", level: 3, kind: "mcq",
    make: (r) => {
      const form = r.pick(["H", "dP", "k", "need"]);
      if (form === "H" || form === "dP") {
        const P = r.pick([100, 200, 400, 500, 1000, 2000]), U = r.pick([5, 10, 20, 25, 35]), R = r.int(2, 30);
        const dP = (P * 1e3) ** 2 * R / (U * 1e3) ** 2 / 1e3, H = 1 - dP / P; // dP theo kW
        need(H > 0.5 && H < 0.999);
        const ctx = `Một nhà máy điện truyền đi công suất ${q(P, "kW")} với điện áp hiệu dụng ở nơi phát là ${q(U, "kV")}, đường dây tải điện có điện trở tổng cộng ${ohm(R)}. Coi hệ số công suất bằng 1.`;
        const expl = `$\\Delta P = \\dfrac{P^2R}{U^2} = \\dfrac{(${sci(P * 1e3)})^2\\cdot ${R}}{(${sci(U * 1e3)})^2} = ${ts(dP * 1e3)}\\ \\text{W}$`;
        if (form === "dP") {
          return {
            stem: `${ctx} Công suất hao phí trên đường dây là`,
            ...nopt(r, dP, [(P * 1e3 * R) / (U * 1e3) / 1e3, dP * 2, dP / 2, (P * 1e3) ** 2 * R / (U * 1e3) / 1e3 / 1e3], (x) => qs(x, "kW")),
            explanation: `${expl} $= ${ts(dP)}\\ \\text{kW}$.`,
          };
        }
        return {
          stem: `${ctx} Hiệu suất truyền tải điện năng là`,
          ...nopt(r, H * 100, [(dP / P) * 100, (1 - 2 * dP / P) * 100, (1 - dP / P / 2) * 100, (1 - Math.sqrt(dP / P)) * 100], (x) => `$${ts(x)}\\%$`),
          explanation: `${expl}; $H = 1 - \\dfrac{\\Delta P}{P} \\approx ${ts(H * 100)}\\%$.`,
        };
      }
      if (form === "k") {
        const H1 = r.pick([75, 80, 84, 85, 88, 90, 92]), k = r.pick([2, 3, 4, 5]), loss = (100 - H1) / (k * k), H2 = 100 - loss;
        return {
          stem: `Điện năng được truyền đi từ một nhà máy điện với công suất không đổi, hệ số công suất bằng 1. Ban đầu hiệu suất truyền tải là $${H1}\\%$. Nếu tăng điện áp hiệu dụng ở nơi phát lên ${k} lần (giữ nguyên công suất truyền đi và đường dây) thì hiệu suất truyền tải là`,
          ...nopt(r, H2, [100 - (100 - H1) / k, Math.min(H1 * k, 99.99), 100 - (100 - H1) * k, 100 - (100 - H1) / (2 * k)], (x) => `$${ts(x, 4)}\\%$`),
          explanation: `$\\Delta P = \\dfrac{P^2R}{U^2}$ nên tăng $U$ lên ${k} lần thì $\\Delta P$ giảm $${k * k}$ lần: tỉ lệ hao phí từ $${100 - H1}\\%$ còn $\\dfrac{${100 - H1}\\%}{${k * k}} = ${ts(loss, 4)}\\%$, hiệu suất $H' = ${ts(H2, 4)}\\%$.`,
        };
      }
      const pairs: [number, number, number][] = [[80, 95, 2], [84, 96, 2], [80, 99.2, 5], [75, 99, 5], [90, 97.5, 2], [82, 98, 3], [64, 96, 3], [60, 97.5, 4], [68, 98, 4], [70, 99.7, 10], [91, 99, 3]];
      const [H1, H2, k] = r.pick(pairs);
      need(Math.abs((100 - H1) / (100 - H2) - k * k) < 1e-9);
      return {
        stem: `Điện năng được truyền đi từ một nhà máy điện với công suất không đổi trên một đường dây xác định, hệ số công suất bằng 1. Ban đầu hiệu suất truyền tải là $${tex(H1, 1)}\\%$. Để hiệu suất truyền tải tăng lên $${tex(H2, 1)}\\%$ thì phải tăng điện áp hiệu dụng ở nơi phát lên`,
        ...mcq(r, `${k} lần`, [`${k * k} lần`, `${vn(sig(Math.sqrt(k), 3))} lần`, `${vn(sig(H2 / H1, 3))} lần`, `${2 * k} lần`]),
        explanation: `Tỉ lệ hao phí giảm từ $${tex(100 - H1, 1)}\\%$ xuống $${tex(100 - H2, 1)}\\%$, tức giảm $${k * k}$ lần. Vì $\\Delta P \\sim \\dfrac{1}{U^2}$ nên $U$ phải tăng $\\sqrt{${k * k}} = ${k}$ lần.`,
      };
    },
  },
  {
    ...XC, id: "l12k2-xc-ly-thuyet", topic: "Dòng điện xoay chiều, máy biến áp, truyền tải – lí thuyết", level: 1, kind: "mcq",
    make: (r) => {
      const askTrue = r.chance(0.5);
      const right = r.pick(askTrue ? TRUE_XC : FALSE_XC), wrong = pickN(r, askTrue ? FALSE_XC : TRUE_XC, 3);
      return {
        stem: `${r.pick(["Khi ôn tập về dòng điện xoay chiều, phát biểu", `Bạn ${r.pick(NAMES)} ghi lại một số phát biểu về dòng điện xoay chiều và máy biến áp. Phát biểu`, "Xét các kiến thức về máy phát điện, máy biến áp và truyền tải điện năng. Phát biểu"])} nào sau đây là ${askTrue ? "đúng" : "sai"}?`,
        ...mcq(r, right, wrong),
        explanation: askTrue ? `Phát biểu đúng: ${right} Các phát biểu còn lại sai.` : `Phát biểu sai: ${right} Các phát biểu còn lại đúng.`,
      };
    },
  },

  /* ---------- TF ---------- */
  {
    ...XC, id: "l12k2-tf-bieu-thuc-xc", topic: "Biểu thức điện áp xoay chiều – Đúng/Sai", level: 2, kind: "tf",
    make: (r) => {
      const a = r.pick([100, 110, 120, 200, 220]), rt = r.chance(0.6), f = r.pick([25, 50, 50, 60, 100]);
      const [pn, pd] = r.pick(PHASES.filter(([n, d]) => n !== 0 && !(Math.abs(n) === 1 && d === 2)));
      const U0 = rt ? a * Math.SQRT2 : a, Ueff = U0 / Math.SQRT2, u0 = U0 * Math.cos((pn * Math.PI) / pd);
      const c1 = r.chance(0.5), c2 = r.chance(0.5), c3 = r.chance(0.5), c4 = r.chance(0.5);
      return {
        stem: `Đặt vào hai đầu một đoạn mạch điện áp xoay chiều $u = ${amp(a, rt)}\\cos\\left(${2 * f}\\pi t${phTerm(pn, pd)}\\right)\\ (\\text{V})$, $t$ tính bằng giây.`,
        ...tf([
          [`Điện áp hiệu dụng giữa hai đầu đoạn mạch ${c1 ? "xấp xỉ " : "là "}${c1 ? qs(Ueff, "V") : `$${amp(a, rt)}\\ \\text{V}$`}.`, c1],
          [`Tần số của điện áp là ${q(c2 ? f : 2 * f, "Hz")}.`, c2],
          [`Tại thời điểm $t = 0$, điện áp tức thời giữa hai đầu đoạn mạch xấp xỉ bằng ${qs(c3 ? u0 : U0 * Math.sin((pn * Math.PI) / pd), "V")}.`, c3],
          [`Trong mỗi giây, điện áp đổi dấu ${c4 ? 2 * f : f} lần.`, c4],
        ]),
        explanation: `$U = \\dfrac{U_0}{\\sqrt{2}} = \\dfrac{${amp(a, rt)}}{\\sqrt{2}} \\approx ${ts(Ueff)}\\ \\text{V}$. $f = \\dfrac{\\omega}{2\\pi} = ${f}\\ \\text{Hz}$. Tại $t = 0$: $u = ${amp(a, rt)}\\cos\\left(${phT(pn, pd)}\\right) \\approx ${ts(u0)}\\ \\text{V}$. Mỗi chu kì điện áp đổi dấu 2 lần nên mỗi giây đổi dấu $2f = ${2 * f}$ lần.`,
      };
    },
  },
  {
    ...XC, id: "l12k2-tf-bien-ap-truyen-tai", topic: "Máy biến áp và truyền tải điện năng – Đúng/Sai", level: 3, kind: "tf",
    make: (r) => {
      const P = r.pick([100, 200, 400, 500, 1000]), U1 = r.pick([1, 2, 2.5, 4, 5]), k = r.pick([5, 10, 20, 25, 40]), R = r.int(5, 40);
      const N1 = r.pick([100, 200, 250, 500]), N2 = N1 * k, U2 = U1 * k;
      const I = (P * 1e3) / (U2 * 1e3), dP = I * I * R, pct = (dP / (P * 1e3)) * 100;
      need(pct > 0.05 && pct < 30);
      const Iw = (P * 1e3) / (U1 * 1e3), pctW = (Iw * Iw * R) / (P * 1e3) * 100;
      const c1 = r.chance(0.5), c2 = r.chance(0.5), c3 = r.chance(0.5), c4 = r.chance(0.5);
      return {
        stem: `Một máy phát điện cung cấp công suất ${q(P, "kW")} với điện áp hiệu dụng ${q(U1, "kV")} vào cuộn sơ cấp (${N1} vòng) của một máy biến áp lí tưởng có cuộn thứ cấp ${N2} vòng. Điện năng từ cuộn thứ cấp được truyền đi trên đường dây có điện trở tổng cộng ${ohm(R)}. Coi hệ số công suất bằng 1.`,
        ...tf([
          [`Máy biến áp này là máy ${c1 ? "tăng" : "hạ"} áp.`, c1],
          [`Điện áp hiệu dụng ở đầu đường dây tải điện là ${qs(c2 ? U2 : U1 / k, "kV")}.`, c2],
          [`Cường độ dòng điện hiệu dụng trên đường dây tải điện là ${qs(c3 ? I : Iw, "A")}.`, c3],
          [`Công suất hao phí trên đường dây bằng khoảng $${ts(c4 ? pct : Math.min(pctW, pct * k), 3)}\\%$ công suất truyền đi.`, c4],
        ]),
        explanation: `$N_2 > N_1$ nên là máy tăng áp; $U_2 = U_1\\dfrac{N_2}{N_1} = ${tex(U1)}\\cdot ${k} = ${tex(U2)}\\ \\text{kV}$. $I = \\dfrac{P}{U_2} = \\dfrac{${sci(P * 1e3)}}{${sci(U2 * 1e3)}} = ${ts(I)}\\ \\text{A}$. $\\Delta P = I^2R = ${ts(dP)}\\ \\text{W}$, chiếm $\\dfrac{\\Delta P}{P} \\approx ${ts(pct)}\\%$.`,
      };
    },
  },

  /* ---------- SHORT ---------- */
  {
    ...XC, id: "l12k2-s-hieu-dung", topic: "Giá trị hiệu dụng, cực đại – trả lời ngắn", level: 1, kind: "short",
    make: (r) => {
      const form = r.pick(["U", "U0", "I0", "I"]);
      if (form === "U") {
        const U0 = r.pick([100, 120, 150, 200, 250, 300, 400, 500, 600]);
        return {
          stem: `Điện áp xoay chiều $u = ${U0}\\cos(100\\pi t)\\ (\\text{V})$. Giá trị hiệu dụng của điện áp này là bao nhiêu vôn? (Làm tròn đến hàng đơn vị.)`,
          ...short(round(U0 / Math.SQRT2), 0),
          explanation: `$U = \\dfrac{U_0}{\\sqrt{2}} = \\dfrac{${U0}}{\\sqrt{2}} \\approx ${tex(U0 / Math.SQRT2, 2)} \\approx ${round(U0 / Math.SQRT2)}\\ \\text{V}$.`,
        };
      }
      if (form === "U0") {
        const U = r.pick([110, 120, 127, 220, 230, 240, 380]);
        return {
          stem: `Một thiết bị điện được ghi ${q(U, "V")} (điện áp xoay chiều). Khi hoạt động bình thường, điện áp tức thời giữa hai đầu thiết bị có giá trị lớn nhất là bao nhiêu vôn? (Làm tròn đến hàng đơn vị.)`,
          ...short(round(U * Math.SQRT2), 0),
          explanation: `$U_0 = U\\sqrt{2} = ${U}\\sqrt{2} \\approx ${round(U * Math.SQRT2)}\\ \\text{V}$.`,
        };
      }
      if (form === "I0") {
        const I = r.pick([0.5, 1.2, 1.5, 2, 2.5, 3, 3.5, 4.5, 5]);
        return {
          stem: `Ampe kế xoay chiều mắc nối tiếp với một đoạn mạch chỉ ${q(I, "A")}. Cường độ dòng điện cực đại qua đoạn mạch là bao nhiêu ampe? (Làm tròn đến hàng phần trăm.)`,
          ...short(I * Math.SQRT2, 2),
          explanation: `$I_0 = I\\sqrt{2} = ${tex(I)}\\sqrt{2} \\approx ${tex(I * Math.SQRT2, 2)}\\ \\text{A}$.`,
        };
      }
      const P = r.pick([40, 60, 75, 100, 500, 800, 1000, 1200, 1500, 2000]), U = 220, I = P / U;
      return {
        stem: `Một thiết bị điện có ghi $${U}\\ \\text{V} - ${P}\\ \\text{W}$ hoạt động đúng định mức với mạng điện xoay chiều (coi hệ số công suất bằng 1). Cường độ dòng điện cực đại qua thiết bị là bao nhiêu ampe? (Làm tròn đến hàng phần trăm.)`,
        ...short(I * Math.SQRT2, 2),
        explanation: `$I = \\dfrac{P}{U} = \\dfrac{${P}}{${U}} \\approx ${tex(I, 3)}\\ \\text{A}$; $I_0 = I\\sqrt{2} \\approx ${tex(I * Math.SQRT2, 2)}\\ \\text{A}$.`,
      };
    },
  },
  {
    ...XC, id: "l12k2-s-may-bien-ap", topic: "Máy biến áp lí tưởng – trả lời ngắn", level: 2, kind: "short",
    make: (r) => {
      const N1 = r.int(2, 40) * 50, N2 = r.int(1, 40) * 50, U1 = r.pick([110, 120, 220, 240]);
      need(N1 !== N2);
      const U2 = (U1 * N2) / N1;
      const form = r.pick(["U2", "N2", "I1"]);
      if (form === "U2") return {
        stem: `Một máy biến áp lí tưởng có cuộn sơ cấp ${N1} vòng, cuộn thứ cấp ${N2} vòng. Đặt vào hai đầu cuộn sơ cấp điện áp xoay chiều có giá trị hiệu dụng ${q(U1, "V")}. Điện áp hiệu dụng giữa hai đầu cuộn thứ cấp để hở là bao nhiêu vôn? (Làm tròn đến hàng phần mười.)`,
        ...short(U2, 1),
        explanation: `$U_2 = U_1\\dfrac{N_2}{N_1} = ${U1}\\cdot\\dfrac{${N2}}{${N1}} \\approx ${tex(U2, 1)}\\ \\text{V}$.`,
      };
      if (form === "N2") {
        need(exact(U2, 1));
        return {
          stem: `Một máy biến áp lí tưởng có cuộn sơ cấp ${N1} vòng. Khi đặt vào hai đầu cuộn sơ cấp điện áp hiệu dụng ${q(U1, "V")} thì điện áp hiệu dụng giữa hai đầu cuộn thứ cấp để hở là ${q(U2, "V", 1)}. Cuộn thứ cấp có bao nhiêu vòng dây?`,
          ...short(N2, 0),
          explanation: `$N_2 = N_1\\dfrac{U_2}{U_1} = ${N1}\\cdot\\dfrac{${tex(U2, 1)}}{${U1}} = ${N2}$ vòng.`,
        };
      }
      const I2 = r.pick([0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6]), I1 = (I2 * N2) / N1;
      return {
        stem: `Một máy biến áp lí tưởng có cuộn sơ cấp ${N1} vòng, cuộn thứ cấp ${N2} vòng. Khi máy hoạt động, cường độ dòng điện hiệu dụng qua cuộn thứ cấp là ${q(I2, "A")}. Cường độ dòng điện hiệu dụng qua cuộn sơ cấp là bao nhiêu ampe? (Làm tròn đến hàng phần trăm.)`,
        ...short(I1, 2),
        explanation: `$\\dfrac{I_1}{I_2} = \\dfrac{N_2}{N_1} \\Rightarrow I_1 = ${tex(I2)}\\cdot\\dfrac{${N2}}{${N1}} \\approx ${tex(I1, 2)}\\ \\text{A}$.`,
      };
    },
  },
  {
    ...XC, id: "l12k2-s-truyen-tai", topic: "Truyền tải điện năng – trả lời ngắn", level: 3, kind: "short",
    make: (r) => {
      const P = r.pick([100, 200, 300, 400, 500, 800, 1000]), U = r.pick([5, 6, 10, 15, 20, 22, 25]), R = r.int(2, 40);
      const dP = ((P * 1e3) ** 2 * R) / (U * 1e3) ** 2, H = (1 - dP / (P * 1e3)) * 100;
      need(H > 50 && H < 99.95);
      if (r.chance(0.5)) return {
        stem: `Một trạm phát điện truyền đi công suất ${q(P, "kW")} với điện áp hiệu dụng ${q(U, "kV")} trên đường dây có điện trở tổng cộng ${ohm(R)}. Coi hệ số công suất bằng 1. Hiệu suất truyền tải điện năng là bao nhiêu phần trăm? (Làm tròn đến hàng phần mười.)`,
        ...short(H, 1),
        explanation: `$\\Delta P = \\dfrac{P^2R}{U^2} = \\dfrac{(${sci(P * 1e3)})^2\\cdot ${R}}{(${sci(U * 1e3)})^2} \\approx ${ts(dP)}\\ \\text{W}$; $H = 1 - \\dfrac{\\Delta P}{P} \\approx ${tex(H, 1)}\\%$.`,
      };
      need(dP / 1e3 >= 0.1 && dP / 1e3 < 100);
      return {
        stem: `Một trạm phát điện truyền đi công suất ${q(P, "kW")} với điện áp hiệu dụng ${q(U, "kV")} trên đường dây có điện trở tổng cộng ${ohm(R)}. Coi hệ số công suất bằng 1. Công suất hao phí trên đường dây là bao nhiêu kilôoát? (Làm tròn đến hàng phần mười.)`,
        ...short(dP / 1e3, 1),
        explanation: `$\\Delta P = \\dfrac{P^2R}{U^2} = \\dfrac{(${sci(P * 1e3)})^2\\cdot ${R}}{(${sci(U * 1e3)})^2} \\approx ${ts(dP)}\\ \\text{W} \\approx ${tex(dP / 1e3, 1)}\\ \\text{kW}$.`,
      };
    },
  },
  {
    ...XC, id: "l12k2-s-may-phat", topic: "Máy phát điện xoay chiều – trả lời ngắn", level: 3, kind: "short",
    make: (r) => {
      if (r.chance(0.4)) {
        const p = r.pick([2, 3, 4, 5, 6, 8, 10, 12, 16, 24]), f = r.pick([50, 60]), n = (60 * f) / p;
        if (r.chance(0.5)) return {
          stem: `Một máy phát điện xoay chiều một pha có rôto là nam châm gồm ${2 * p} cực (${p} cặp cực). Để máy phát ra dòng điện có tần số ${q(f, "Hz")} thì rôto phải quay với tốc độ bao nhiêu vòng/phút? (Làm tròn đến hàng đơn vị.)`,
          ...short(round(n), 0),
          explanation: `$f = \\dfrac{pn}{60} \\Rightarrow n = \\dfrac{60f}{p} = \\dfrac{60\\cdot ${f}}{${p}} ${exact(n, 0) ? "=" : "\\approx"} ${round(n)}$ vòng/phút. Chú ý ${2 * p} cực ứng với $p = ${p}$ cặp cực.`,
        };
        need(Number.isInteger(n));
        return {
          stem: `Một máy phát điện xoay chiều một pha có rôto là nam châm gồm ${2 * p} cực, quay đều với tốc độ ${n} vòng/phút. Tần số của suất điện động do máy phát ra là bao nhiêu hertz?`,
          ...short(f, 0),
          explanation: `Số cặp cực $p = ${p}$; $f = \\dfrac{pn}{60} = \\dfrac{${p}\\cdot ${n}}{60} = ${f}\\ \\text{Hz}$.`,
        };
      }
      const N = r.pick([100, 200, 250, 500, 1000]), B = r.pick([0.05, 0.1, 0.2, 0.25, 0.4]), Scm = r.pick([50, 100, 150, 200, 400]), f = r.pick([25, 50, 60]);
      const E0 = N * B * Scm * 1e-4 * 2 * Math.PI * f, E = E0 / Math.SQRT2;
      need(E >= 10 && E < 9999);
      return {
        stem: `Khung dây của một máy phát điện xoay chiều đơn giản gồm ${N} vòng, diện tích mỗi vòng ${cm2(Scm)}, quay đều với tần số ${q(f, "Hz")} trong từ trường đều ${q(B, "T")} quanh trục vuông góc với các đường sức từ. Giá trị hiệu dụng của suất điện động do máy tạo ra là bao nhiêu vôn? (Làm tròn đến hàng đơn vị.)`,
        ...short(round(E), 0),
        explanation: `$E_0 = NBS\\omega = ${N}\\cdot ${tex(B)}\\cdot ${sci(Scm * 1e-4)}\\cdot 2\\pi\\cdot ${f} \\approx ${tex(E0, 1)}\\ \\text{V}$; $E = \\dfrac{E_0}{\\sqrt{2}} \\approx ${round(E)}\\ \\text{V}$.`,
      };
    },
  },
];

/* ================================================================
   HALF 2 – VẬT LÍ HẠT NHÂN
   ================================================================ */
const EL = ["n", "H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne", "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar", "K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn",
  "Ga", "Ge", "As", "Se", "Br", "Kr", "Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Te", "I", "Xe", "Cs", "Ba", "La", "Ce", "Pr", "Nd",
  "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn", "Fr", "Ra", "Ac", "Th",
  "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf"];
const symOf = (A: number, Z: number) => (A === 0 ? "e" : Z === 0 ? "n" : A === 1 && Z === 1 ? "p" : EL[Z]);
/** kí hiệu hạt nhân ^A_Z X */
const nuc = (A: number, Z: number) => { need(Z >= -1 && Z < EL.length); return `{}^{${A}}_{${A === 0 && Z === 1 ? "+1" : Z}}\\mathrm{${symOf(A, Z)}}`; };
const nucM = (A: number, Z: number) => `$${nuc(A, Z)}$`;
const ALPHA = nuc(4, 2);
type Nu = [number, number];
/** vế phản ứng: gộp hạt giống nhau liên tiếp thành hệ số */
const side = (xs: Nu[]) => {
  const out: string[] = [];
  for (let i = 0; i < xs.length; i++) {
    let c = 1; while (i + 1 < xs.length && xs[i + 1][0] === xs[i][0] && xs[i + 1][1] === xs[i][1]) { c++; i++; }
    out.push((c > 1 ? `${c}\\,` : "") + nuc(xs[i][0], xs[i][1]));
  }
  return out.join(" + ");
};
const MP = 1.0073, MN = 1.0087, UC = 931.5, NA = 6.02e23, MEV = 1.6e-13, YEAR = 365 * 86400;
const MP_T = "$m_p = 1{,}0073\\ \\text{u}$, $m_n = 1{,}0087\\ \\text{u}$, $1\\ \\text{u} = 931{,}5\\ \\text{MeV/c}^2$";
/** khối lượng hạt nhân (u) */
const MASS: Record<string, number> = {
  "1,0": 1.0087, "1,1": 1.0073, "2,1": 2.0136, "3,1": 3.0155, "3,2": 3.0149, "4,2": 4.0015, "6,3": 6.0135, "7,3": 7.0144, "9,4": 9.0100, "10,5": 10.0102,
  "12,6": 11.9967, "14,6": 13.9999, "14,7": 13.9992, "16,8": 15.9905, "17,8": 16.9947, "20,10": 19.9870, "23,11": 22.9837, "27,13": 26.9744, "30,15": 29.9701,
  "40,18": 39.9525, "56,26": 55.9207, "235,92": 234.9934, "238,92": 238.0003,
};
const mOf = (x: Nu) => { const m = MASS[`${x[0]},${x[1]}`]; need(m); return m; };
/** hạt nhân dùng cho bài năng lượng liên kết */
const BIND: Nu[] = [[4, 2], [7, 3], [9, 4], [12, 6], [14, 7], [16, 8], [20, 10], [23, 11], [27, 13], [40, 18], [56, 26], [235, 92], [238, 92]];
const bind = (x: Nu) => {
  const [A, Z] = x, N = A - Z, m = mOf(x), dm = round(Z * MP + N * MN - m, 4), W = dm * UC;
  return { A, Z, N, m, dm, W, eps: W / A };
};
/** phản ứng có đủ khối lượng (để tính năng lượng) */
const RXE: { l: Nu[]; r: Nu[] }[] = [
  { l: [[2, 1], [3, 1]], r: [[4, 2], [1, 0]] },
  { l: [[2, 1], [2, 1]], r: [[3, 2], [1, 0]] },
  { l: [[7, 3], [1, 1]], r: [[4, 2], [4, 2]] },
  { l: [[14, 7], [4, 2]], r: [[17, 8], [1, 1]] },
  { l: [[9, 4], [4, 2]], r: [[12, 6], [1, 0]] },
  { l: [[27, 13], [4, 2]], r: [[30, 15], [1, 0]] },
  { l: [[10, 5], [1, 0]], r: [[7, 3], [4, 2]] },
  { l: [[6, 3], [1, 0]], r: [[3, 1], [4, 2]] },
  { l: [[2, 1], [2, 1]], r: [[3, 1], [1, 1]] },
  { l: [[3, 2], [2, 1]], r: [[4, 2], [1, 1]] },
  { l: [[6, 3], [2, 1]], r: [[4, 2], [4, 2]] },
  { l: [[14, 7], [1, 0]], r: [[14, 6], [1, 1]] },
  { l: [[7, 3], [4, 2]], r: [[10, 5], [1, 0]] },
];
const rxE = (x: { l: Nu[]; r: Nu[] }) => {
  const ml = x.l.reduce((s, p) => s + mOf(p), 0), mr = x.r.reduce((s, p) => s + mOf(p), 0);
  const dm = round(ml - mr, 4);
  return { ml, mr, dm, E: dm * UC };
};
/** liệt kê khối lượng các hạt (không trùng) trong phản ứng */
const massList = (x: { l: Nu[]; r: Nu[] }) => {
  const seen = new Set<string>(); const out: string[] = [];
  for (const p of [...x.l, ...x.r]) { const k = `${p[0]},${p[1]}`; if (seen.has(k)) continue; seen.add(k); out.push(`$${p[0] === 1 ? `m_${p[1] === 0 ? "n" : "p"}` : `m(${nuc(p[0], p[1])})`} = ${tex(mOf(p), 4)}\\ \\text{u}$`); }
  return out.join(", ");
};
/** phản ứng hạt nhân (kiểm tra bảo toàn A, Z) */
const RXN: { l: [number, number, number][]; r: [number, number, number][]; n: string }[] = [
  { l: [[14, 7, 1], [4, 2, 1]], r: [[17, 8, 1], [1, 1, 1]], n: "Rutherford" },
  { l: [[9, 4, 1], [4, 2, 1]], r: [[12, 6, 1], [1, 0, 1]], n: "" },
  { l: [[27, 13, 1], [4, 2, 1]], r: [[30, 15, 1], [1, 0, 1]], n: "" },
  { l: [[7, 3, 1], [1, 1, 1]], r: [[4, 2, 2]], n: "" },
  { l: [[10, 5, 1], [1, 0, 1]], r: [[7, 3, 1], [4, 2, 1]], n: "" },
  { l: [[2, 1, 1], [3, 1, 1]], r: [[4, 2, 1], [1, 0, 1]], n: "" },
  { l: [[2, 1, 2]], r: [[3, 2, 1], [1, 0, 1]], n: "" },
  { l: [[235, 92, 1], [1, 0, 1]], r: [[141, 56, 1], [92, 36, 1], [1, 0, 3]], n: "" },
  { l: [[235, 92, 1], [1, 0, 1]], r: [[140, 54, 1], [94, 38, 1], [1, 0, 2]], n: "" },
  { l: [[235, 92, 1], [1, 0, 1]], r: [[139, 53, 1], [95, 39, 1], [1, 0, 2]], n: "" },
  { l: [[37, 17, 1], [1, 1, 1]], r: [[37, 18, 1], [1, 0, 1]], n: "" },
  { l: [[14, 7, 1], [1, 0, 1]], r: [[14, 6, 1], [1, 1, 1]], n: "" },
  { l: [[6, 3, 1], [1, 0, 1]], r: [[3, 1, 1], [4, 2, 1]], n: "" },
  { l: [[239, 94, 1], [1, 0, 1]], r: [[134, 54, 1], [103, 40, 1], [1, 0, 3]], n: "" },
];
const termT = (t: [number, number, number], hide: boolean) => (t[2] > 1 ? `${t[2]}\\,` : "") + (hide ? "\\mathrm{X}" : nuc(t[0], t[1]));
/** phóng xạ: a = alpha, b- , b+ */
const DECAY: { A: number; Z: number; t: "a" | "b-" | "b+" }[] = [
  { A: 14, Z: 6, t: "b-" }, { A: 32, Z: 15, t: "b-" }, { A: 60, Z: 27, t: "b-" }, { A: 90, Z: 38, t: "b-" }, { A: 131, Z: 53, t: "b-" }, { A: 137, Z: 55, t: "b-" },
  { A: 24, Z: 11, t: "b-" }, { A: 3, Z: 1, t: "b-" }, { A: 40, Z: 19, t: "b-" }, { A: 234, Z: 90, t: "b-" },
  { A: 22, Z: 11, t: "b+" }, { A: 18, Z: 9, t: "b+" }, { A: 13, Z: 7, t: "b+" }, { A: 11, Z: 6, t: "b+" }, { A: 15, Z: 8, t: "b+" },
  { A: 210, Z: 84, t: "a" }, { A: 226, Z: 88, t: "a" }, { A: 238, Z: 92, t: "a" }, { A: 222, Z: 86, t: "a" }, { A: 239, Z: 94, t: "a" }, { A: 232, Z: 90, t: "a" }, { A: 241, Z: 95, t: "a" },
];
const daughter = (d: { A: number; Z: number; t: string }): Nu => (d.t === "a" ? [d.A - 4, d.Z - 2] : d.t === "b-" ? [d.A, d.Z + 1] : [d.A, d.Z - 1]);
const emitT = (t: string) => (t === "a" ? ALPHA : t === "b-" ? `{}^{0}_{-1}\\mathrm{e} + \\bar{\\nu}` : `{}^{0}_{+1}\\mathrm{e} + \\nu`);
const decayEq = (d: { A: number; Z: number; t: string }) => { const [a, z] = daughter(d); return `${nuc(d.A, d.Z)} \\to ${nuc(a, z)} + ${emitT(d.t)}`; };
const TYPE_NAME: Record<string, string> = { a: "phóng xạ $\\alpha$", "b-": "phóng xạ $\\beta^-$", "b+": "phóng xạ $\\beta^+$" };
/** chất phóng xạ có chu kì bán rã */
const HALF: { A: number; Z: number; T: number; u: string; s: number }[] = [
  { A: 210, Z: 84, T: 138, u: "ngày", s: 86400 }, { A: 131, Z: 53, T: 8, u: "ngày", s: 86400 }, { A: 222, Z: 86, T: 3.8, u: "ngày", s: 86400 },
  { A: 24, Z: 11, T: 15, u: "giờ", s: 3600 }, { A: 32, Z: 15, T: 14, u: "ngày", s: 86400 }, { A: 14, Z: 6, T: 5730, u: "năm", s: YEAR },
  { A: 60, Z: 27, T: 5.27, u: "năm", s: YEAR }, { A: 137, Z: 55, T: 30, u: "năm", s: YEAR }, { A: 226, Z: 88, T: 1600, u: "năm", s: YEAR },
  { A: 90, Z: 38, T: 28, u: "năm", s: YEAR }, { A: 18, Z: 9, T: 110, u: "phút", s: 60 },
];
const Tq = (h: { T: number; u: string }, x = h.T) => `$${tex(x, 2)}$ ${h.u}`;
const YEAR_T = "1 năm = 365 ngày";
const TRUE_HN = [
  "Hạt nhân nguyên tử được cấu tạo từ các proton và neutron, gọi chung là nucleon.",
  "Lực hạt nhân là lực hút rất mạnh giữa các nucleon, chỉ phát huy tác dụng trong phạm vi kích thước hạt nhân (cỡ $10^{-15}\\ \\text{m}$).",
  "Kích thước hạt nhân rất nhỏ so với kích thước nguyên tử.",
  "Hạt nhân có năng lượng liên kết riêng càng lớn thì càng bền vững.",
  "Khối lượng của một hạt nhân luôn nhỏ hơn tổng khối lượng các nucleon tạo thành nó.",
  "Các hạt nhân có số khối trung bình (cỡ hạt nhân sắt) có năng lượng liên kết riêng lớn nhất, bền vững nhất.",
  "Phóng xạ là quá trình phân rã tự phát của hạt nhân không bền.",
  "Quá trình phóng xạ không chịu ảnh hưởng của các tác động bên ngoài như nhiệt độ, áp suất.",
  "Tia $\\alpha$ là dòng các hạt nhân $^{4}_{2}\\mathrm{He}$.",
  "Tia $\\beta^-$ là dòng các electron chuyển động rất nhanh.",
  "Tia $\\gamma$ là sóng điện từ có bước sóng rất ngắn, không mang điện.",
  "Trong phản ứng hạt nhân, số nucleon và điện tích được bảo toàn.",
  "Phản ứng phân hạch và phản ứng nhiệt hạch đều là phản ứng tỏa năng lượng.",
  "Phản ứng nhiệt hạch chỉ xảy ra ở nhiệt độ rất cao, cỡ hàng chục triệu độ.",
  "Mỗi phân hạch của $^{235}_{92}\\mathrm{U}$ giải phóng 2 hoặc 3 neutron, có thể gây ra phản ứng dây chuyền.",
  "Các đồng vị của cùng một nguyên tố có cùng số proton nhưng khác số neutron.",
];
const FALSE_HN = [
  "Hạt nhân nguyên tử được cấu tạo từ các proton và electron.",
  "Lực hạt nhân có bản chất là lực tĩnh điện.",
  "Lực hạt nhân có bán kính tác dụng rất lớn, tương đương kích thước nguyên tử.",
  "Hạt nhân có năng lượng liên kết càng lớn thì càng bền vững.",
  "Khối lượng của một hạt nhân luôn lớn hơn tổng khối lượng các nucleon tạo thành nó.",
  "Có thể làm chậm quá trình phóng xạ của một chất bằng cách hạ nhiệt độ của nó.",
  "Tia $\\gamma$ là dòng các hạt mang điện tích âm.",
  "Tia $\\alpha$ có khả năng đâm xuyên mạnh hơn tia $\\gamma$.",
  "Trong phản ứng hạt nhân, tổng khối lượng nghỉ của các hạt luôn được bảo toàn.",
  "Phản ứng nhiệt hạch có thể xảy ra ở nhiệt độ thường.",
  "Phân hạch là quá trình hai hạt nhân nhẹ kết hợp thành một hạt nhân nặng hơn.",
  "Nhiệt hạch là quá trình một hạt nhân nặng vỡ thành hai hạt nhân nhẹ hơn.",
  "Sau một chu kì bán rã, toàn bộ lượng chất phóng xạ bị phân rã hết.",
  "Chu kì bán rã của một chất phóng xạ phụ thuộc vào khối lượng ban đầu của chất đó.",
  "Các đồng vị của cùng một nguyên tố có cùng số neutron nhưng khác số proton.",
];
/** hạt nhân cho bài cấu tạo */
const NUCS: Nu[] = [[2, 1], [3, 1], [3, 2], [4, 2], [7, 3], [9, 4], [12, 6], [14, 6], [14, 7], [16, 8], [17, 8], [23, 11], [27, 13], [40, 19], [56, 26], [60, 27], [90, 38], [131, 53], [137, 55], [210, 84], [226, 88], [235, 92], [238, 92], [239, 94]];
const ISO: Nu[][] = [[[1, 1], [2, 1], [3, 1]], [[3, 2], [4, 2]], [[12, 6], [13, 6], [14, 6]], [[14, 7], [15, 7]], [[16, 8], [17, 8], [18, 8]], [[235, 92], [238, 92]], [[59, 27], [60, 27]], [[127, 53], [131, 53]], [[133, 55], [137, 55]], [[39, 19], [40, 19]], [[6, 3], [7, 3]], [[35, 17], [37, 17]]];
const ISOBAR: [Nu, Nu][] = [[[14, 6], [14, 7]], [[3, 1], [3, 2]], [[40, 19], [40, 20]], [[40, 18], [40, 19]], [[60, 27], [60, 28]], [[131, 53], [131, 54]], [[137, 55], [137, 56]], [[90, 38], [90, 39]], [[32, 15], [32, 16]], [[24, 11], [24, 12]]];
const CHAINS: [Nu, Nu][] = [[[238, 92], [206, 82]], [[235, 92], [207, 82]], [[232, 90], [208, 82]], [[226, 88], [206, 82]], [[222, 86], [206, 82]], [[238, 92], [226, 88]], [[238, 92], [234, 92]], [[237, 93], [209, 83]], [[234, 92], [206, 82]], [[228, 88], [208, 82]], [[210, 82], [206, 82]], [[239, 94], [207, 82]]];
const pct = (x: number) => `$${ts(x, 3)}\\%$`;

const H2N: Template[] = [
  /* ---------- MCQ ---------- */
  {
    ...HN, id: "l12k2-cau-tao-hat-nhan", topic: "Cấu tạo hạt nhân – số proton, neutron, nucleon", level: 1, kind: "mcq",
    make: (r) => {
      const [A, Z] = r.pick(NUCS), N = A - Z, X = nucM(A, Z);
      const ask = r.pick(["n", "p", "A", "sym"]);
      if (ask === "n") return {
        stem: `Hạt nhân ${X} có số neutron là`,
        ...nopt(r, N, [Z, A, A + Z, N + 1], (x) => `$${x}$`),
        explanation: `Số neutron $N = A - Z = ${A} - ${Z} = ${N}$.`,
      };
      if (ask === "p") return {
        stem: `Hạt nhân ${X} có số proton là`,
        ...nopt(r, Z, [N, A, A + Z, Z + 2], (x) => `$${x}$`),
        explanation: `Số proton bằng số thứ tự $Z = ${Z}$ (chỉ số dưới).`,
      };
      if (ask === "A") return {
        stem: `Hạt nhân ${X} có số nucleon là`,
        ...nopt(r, A, [Z, N, A + Z, A - 1], (x) => `$${x}$`),
        explanation: `Số nucleon bằng số khối $A = ${A}$ (gồm $${Z}$ proton và $${N}$ neutron).`,
      };
      need(N !== Z);
      const sy = symOf(A, Z), o = (a: number, z: number) => `$${`{}^{${a}}_{${z}}\\mathrm{${sy}}`}$`;
      return {
        stem: `Hạt nhân của nguyên tố ${sy} có ${Z} proton và ${N} neutron. Kí hiệu của hạt nhân này là`,
        ...mcq(r, o(A, Z), [o(N, Z), o(Z, A), o(A, N), o(A + Z, Z)]),
        explanation: `Số khối $A = Z + N = ${Z} + ${N} = ${A}$, nên kí hiệu là ${X}.`,
      };
    },
  },
  {
    ...HN, id: "l12k2-dong-vi", topic: "Đồng vị", level: 1, kind: "mcq",
    make: (r) => {
      const pair = (a: Nu, b: Nu) => `$${nuc(a[0], a[1])}$ và $${nuc(b[0], b[1])}$`;
      if (r.chance(0.2)) {
        return {
          stem: `Các hạt nhân đồng vị là những hạt nhân có`,
          ...mcq(r, "cùng số proton nhưng khác số neutron", ["cùng số neutron nhưng khác số proton", "cùng số nucleon nhưng khác số proton", "cùng số proton và cùng số neutron", "cùng khối lượng nhưng khác điện tích"]),
          explanation: "Đồng vị là các hạt nhân có cùng số proton $Z$ (cùng vị trí trong bảng tuần hoàn) nhưng khác số neutron, do đó khác số khối $A$.",
        };
      }
      const g = r.pick(ISO), [a, b] = pickN(r, g, 2);
      if (r.chance(0.6)) {
        const iso = ISOBAR.filter(([u, v]) => (u[0] === a[0] && u[1] === a[1]) || (v[0] === a[0] && v[1] === a[1])).map(([u, v]) => (u[0] === a[0] && u[1] === a[1] ? v : u));
        const same: Nu[] = [[a[0] + 1, a[1] + 1], [a[0] + 2, a[1] + 1], [a[0], a[1] + 1], [a[0] + 1, a[1] - 1], [a[0] - 1, a[1] + 1]];
        const wr = r.shuffle([...iso, ...same].filter(([u, v]) => v >= 1 && u >= v && v !== a[1]));
        return {
          stem: `Hạt nhân nào sau đây là đồng vị của hạt nhân ${nucM(a[0], a[1])}?`,
          ...mcq(r, nucM(b[0], b[1]), wr.map(([u, v]) => nucM(u, v))),
          explanation: `Đồng vị có cùng số proton $Z = ${a[1]}$ nhưng khác số neutron: ${nucM(b[0], b[1])} (${b[0] - b[1]} neutron) và ${nucM(a[0], a[1])} (${a[0] - a[1]} neutron).`,
        };
      }
      const [i1, i2] = r.pick(ISOBAR);
      const x1 = r.pick(NUCS), x2 = r.pick(NUCS);
      need(x1[1] !== x2[1] && x1[0] !== x2[0] && x1[0] - x1[1] !== x2[0] - x2[1]);
      const x3: Nu = r.pick([[13, 6], [14, 7], [16, 8], [27, 13], [56, 26], [12, 6]] as Nu[]), x4: Nu = [x3[0] + 1, x3[1] + 1]; // cùng số neutron
      return {
        stem: `${r.pick(["Cặp hạt nhân nào sau đây là đồng vị của nhau?", "Hai hạt nhân nào sau đây là hai đồng vị của cùng một nguyên tố?"])}`,
        ...mcq(r, pair(a, b), [pair(i1, i2), pair(x1, x2), pair(x3, x4)]),
        explanation: `${pair(a, b)} có cùng số proton $Z = ${a[1]}$ nhưng khác số neutron nên là đồng vị. ${pair(i1, i2)} có cùng số khối nhưng khác $Z$ (không phải đồng vị).`,
      };
    },
  },
  {
    ...HN, id: "l12k2-hat-nhan-ly-thuyet", topic: "Hạt nhân, phóng xạ, phản ứng hạt nhân – lí thuyết", level: 1, kind: "mcq",
    make: (r) => {
      const askTrue = r.chance(0.5);
      const right = r.pick(askTrue ? TRUE_HN : FALSE_HN), wrong = pickN(r, askTrue ? FALSE_HN : TRUE_HN, 3);
      return {
        stem: `${r.pick(["Khi ôn tập về vật lí hạt nhân, phát biểu", `Bạn ${r.pick(NAMES)} ghi lại một số phát biểu về hạt nhân nguyên tử. Phát biểu`, "Xét các kiến thức về hạt nhân và phóng xạ. Phát biểu", "Trong giờ thảo luận về năng lượng hạt nhân, phát biểu"])} nào sau đây là ${askTrue ? "đúng" : "sai"}?`,
        ...mcq(r, right, wrong),
        explanation: askTrue ? `Phát biểu đúng: ${right} Các phát biểu còn lại sai.` : `Phát biểu sai: ${right} Các phát biểu còn lại đúng.`,
      };
    },
  },
  {
    ...HN, id: "l12k2-bao-toan-phan-ung", topic: "Định luật bảo toàn số nucleon và điện tích trong phản ứng hạt nhân", level: 1, kind: "mcq",
    make: (r) => {
      const R = r.pick(RXN), all = [...R.l.map((t, i) => ({ s: "l", i, t })), ...R.r.map((t, i) => ({ s: "r", i, t }))].filter((x) => x.t[2] === 1);
      const h = r.pick(all), [A, Z] = h.t;
      const eq = `${R.l.map((t, i) => termT(t, h.s === "l" && h.i === i)).join(" + ")} \\to ${R.r.map((t, i) => termT(t, h.s === "r" && h.i === i)).join(" + ")}`;
      const cand: Nu[] = r.shuffle([[A, Z + 1], [A, Z - 1], [A + 1, Z], [A - 1, Z], [A + 2, Z + 1], [A - 2, Z - 1], [A + 4, Z + 2]] as Nu[]).filter(([a, z]) => a >= 1 && z >= 0 && z <= a && !(a === A && z === Z));
      const sA = R.l.reduce((s, t) => s + t[0] * t[2], 0), sZ = R.l.reduce((s, t) => s + t[1] * t[2], 0);
      return {
        stem: `Cho phản ứng hạt nhân: $${eq}$. Hạt X là`,
        ...mcq(r, nucM(A, Z), cand.map(([a, z]) => nucM(a, z))),
        explanation: `Bảo toàn số nucleon và điện tích: tổng số khối hai vế bằng $${sA}$, tổng điện tích hai vế bằng $${sZ}$, suy ra X có $A = ${A}$, $Z = ${Z}$: X là ${nucM(A, Z)}.`,
      };
    },
  },
  {
    ...HN, id: "l12k2-do-hut-khoi", topic: "Độ hụt khối, năng lượng liên kết, năng lượng liên kết riêng", level: 2, kind: "mcq",
    make: (r) => {
      const b = bind(r.pick(BIND)), X = nucM(b.A, b.Z);
      const ctx = `Cho khối lượng hạt nhân ${X} là $${tex(b.m, 4)}\\ \\text{u}$; ${MP_T}.`;
      const swap = round(b.Z * MN + b.N * MP - b.m, 4);
      const ask = r.pick(["dm", "W", "eps"]);
      const sol = `$\\Delta m = Zm_p + (A - Z)m_n - m_X = ${b.Z}\\cdot 1{,}0073 + ${b.N}\\cdot 1{,}0087 - ${tex(b.m, 4)} = ${tex(b.dm, 4)}\\ \\text{u}$`;
      if (ask === "dm") return {
        stem: `${ctx} Độ hụt khối của hạt nhân ${X} là`,
        ...nopt(r, b.dm, [swap, round(b.A * MP - b.m, 4), round(b.A * MN - b.m, 4), round(b.dm / 2, 4)], (x) => q(x, "u", 4)),
        explanation: `${sol}.`,
      };
      if (ask === "W") return {
        stem: `${ctx} Năng lượng liên kết của hạt nhân ${X} là`,
        ...nopt(r, b.W, [b.eps, swap * UC, (b.A * MP - b.m) * UC, b.W / b.Z], (x) => q(round(x, 1), "MeV", 1)),
        explanation: `${sol}; $W_{lk} = \\Delta m c^2 = ${tex(b.dm, 4)}\\cdot 931{,}5 \\approx ${tex(b.W, 1)}\\ \\text{MeV}$.`,
      };
      return {
        stem: `${ctx} Năng lượng liên kết riêng của hạt nhân ${X} là`,
        ...nopt(r, b.eps, [b.W / b.Z, b.W, (swap * UC) / b.A, (b.A * MN - b.m) * UC / b.A, b.W / b.N], (x) => q(round(x, 2), "MeV/nucleon", 2)),
        explanation: `${sol}; $W_{lk} = ${tex(b.dm, 4)}\\cdot 931{,}5 \\approx ${tex(b.W, 1)}\\ \\text{MeV}$; $W_{lkr} = \\dfrac{W_{lk}}{A} = \\dfrac{${tex(b.W, 1)}}{${b.A}} \\approx ${tex(b.eps, 2)}\\ \\text{MeV/nucleon}$.`,
      };
    },
  },
  {
    ...HN, id: "l12k2-so-sanh-ben-vung", topic: "So sánh độ bền vững của hạt nhân", level: 2, kind: "mcq",
    make: (r) => {
      const four = pickN(r, BIND, 4).map((x) => { const b = bind(x); const W = round(b.W, 1); return { ...b, W, eps: W / b.A }; });
      need(new Set(four.map((x) => round(x.eps, 2))).size === 4);
      const list = four.map((x) => `${nucM(x.A, x.Z)}: $${tex(x.W, 1)}\\ \\text{MeV}$`).join("; ");
      const best = r.chance(0.6);
      if (r.chance(0.7)) {
        const sorted = [...four].sort((a, b) => b.eps - a.eps), right = best ? sorted[0] : sorted[3];
        return {
          stem: `Năng lượng liên kết của một số hạt nhân như sau: ${list}. Hạt nhân ${best ? "bền vững nhất" : "kém bền vững nhất"} là`,
          ...mcq(r, nucM(right.A, right.Z), four.filter((x) => x !== right).map((x) => nucM(x.A, x.Z))),
          explanation: `So sánh năng lượng liên kết riêng $W_{lk}/A$: ${four.map((x) => `${nucM(x.A, x.Z)}: $${tex(x.eps, 2)}$`).join("; ")} (MeV/nucleon). Hạt nhân có năng lượng liên kết riêng ${best ? "lớn" : "nhỏ"} nhất là ${nucM(right.A, right.Z)} nên ${best ? "bền vững nhất" : "kém bền vững nhất"}.`,
        };
      }
      const three = four.slice(0, 3), inc = [...three].sort((a, b) => a.eps - b.eps), byW = [...three].sort((a, b) => a.W - b.W);
      const ord = (xs: typeof three) => xs.map((x) => nucM(x.A, x.Z)).join(", ");
      const l3 = three.map((x) => `${nucM(x.A, x.Z)}: $${tex(x.W, 1)}\\ \\text{MeV}$`).join("; ");
      return {
        stem: `Năng lượng liên kết của ba hạt nhân như sau: ${l3}. Sắp xếp theo thứ tự độ bền vững tăng dần là`,
        ...mcq(r, ord(inc), [ord(byW), ord([...inc].reverse()), ord([inc[1], inc[0], inc[2]]), ord([inc[0], inc[2], inc[1]])]),
        explanation: `Năng lượng liên kết riêng: ${three.map((x) => `${nucM(x.A, x.Z)}: $${tex(x.eps, 2)}$`).join("; ")} (MeV/nucleon). Năng lượng liên kết riêng càng lớn thì hạt nhân càng bền: ${ord(inc)}.`,
      };
    },
  },
  {
    ...HN, id: "l12k2-nang-luong-phan-ung", topic: "Năng lượng của phản ứng hạt nhân", level: 3, kind: "mcq",
    make: (r) => {
      const x = r.pick(RXE), e = rxE(x), E = Math.abs(e.E), toa = e.E > 0;
      const o = (t: boolean, v: number, dp = 2) => `${t ? "Tỏa" : "Thu"} năng lượng $${tex(v, dp)}\\ \\text{MeV}$`;
      return {
        stem: `Cho phản ứng hạt nhân $${side(x.l)} \\to ${side(x.r)}$. Biết khối lượng các hạt nhân: ${massList(x)}; $1\\ \\text{u} = 931{,}5\\ \\text{MeV/c}^2$. Phản ứng này`,
        ...mcq(r, o(toa, E), [o(!toa, E), o(toa, Math.abs(e.dm), 4), o(!toa, Math.abs(e.dm), 4)]),
        explanation: `$\\Delta E = (m_{trước} - m_{sau})c^2 = (${tex(e.ml, 4)} - ${tex(e.mr, 4)})\\cdot 931{,}5 \\approx ${tex(e.E, 2)}\\ \\text{MeV}$ ${toa ? "> 0: phản ứng tỏa năng lượng" : "< 0: phản ứng thu năng lượng"} $${tex(E, 2)}\\ \\text{MeV}$.`,
      };
    },
  },
  {
    ...HN, id: "l12k2-phan-hach-nhiet-hach", topic: "Phân hạch, nhiệt hạch, phóng xạ – nhận dạng phản ứng", level: 1, kind: "mcq",
    make: (r) => {
      const FIS: [Nu[], Nu[]][] = [
        [[[235, 92], [1, 0]], [[141, 56], [92, 36], [1, 0], [1, 0], [1, 0]]], [[[235, 92], [1, 0]], [[140, 54], [94, 38], [1, 0], [1, 0]]],
        [[[235, 92], [1, 0]], [[139, 53], [95, 39], [1, 0], [1, 0]]], [[[239, 94], [1, 0]], [[134, 54], [103, 40], [1, 0], [1, 0], [1, 0]]],
      ];
      const FUS: [Nu[], Nu[]][] = [[[[2, 1], [3, 1]], [[4, 2], [1, 0]]], [[[2, 1], [2, 1]], [[3, 2], [1, 0]]], [[[2, 1], [2, 1]], [[3, 1], [1, 1]]], [[[3, 2], [2, 1]], [[4, 2], [1, 1]]]];
      const kind = r.pick(["fis", "fus", "a", "b-", "b+"]);
      const NAMEK: Record<string, string> = { fis: "Phản ứng phân hạch", fus: "Phản ứng nhiệt hạch", a: "Phóng xạ $\\alpha$", "b-": "Phóng xạ $\\beta^-$", "b+": "Phóng xạ $\\beta^+$" };
      let eq: string;
      if (kind === "fis" || kind === "fus") { const [l, rr] = r.pick(kind === "fis" ? FIS : FUS); eq = `${side(l)} \\to ${side(rr)}`; }
      else eq = decayEq(r.pick(DECAY.filter((d) => d.t === kind)));
      const why: Record<string, string> = {
        fis: "một hạt nhân nặng hấp thụ neutron rồi vỡ thành hai hạt nhân trung bình kèm theo vài neutron",
        fus: "hai hạt nhân rất nhẹ kết hợp thành một hạt nhân nặng hơn",
        a: "hạt nhân tự phát phát ra hạt $\\alpha$ ($^{4}_{2}\\mathrm{He}$)",
        "b-": "hạt nhân tự phát phát ra electron và phản neutrino",
        "b+": "hạt nhân tự phát phát ra positron và neutrino",
      };
      return {
        stem: `Phản ứng $${eq}$ là`,
        ...mcq(r, NAMEK[kind], Object.keys(NAMEK).filter((k) => k !== kind).map((k) => NAMEK[k])),
        explanation: `Trong phản ứng này ${why[kind]}, nên đó là ${NAMEK[kind].charAt(0).toLowerCase() + NAMEK[kind].slice(1)}.`,
      };
    },
  },
  {
    ...HN, id: "l12k2-loai-phong-xa", topic: "Các dạng phóng xạ $\\alpha$, $\\beta^-$, $\\beta^+$", level: 1, kind: "mcq",
    make: (r) => {
      const d = r.pick(DECAY), [a, z] = daughter(d), P = nucM(d.A, d.Z), D = nucM(a, z);
      if (r.chance(0.5)) {
        return {
          stem: `Hạt nhân ${P} phóng xạ và biến đổi thành hạt nhân ${D}. Đây là`,
          ...mcq(r, TYPE_NAME[d.t], [...Object.keys(TYPE_NAME).filter((k) => k !== d.t).map((k) => TYPE_NAME[k]), "phóng xạ $\\gamma$"]),
          explanation: `Số khối ${d.t === "a" ? "giảm 4, điện tích giảm 2: phát ra hạt $\\alpha$" : d.t === "b-" ? "không đổi, điện tích tăng 1: phát ra electron ($\\beta^-$)" : "không đổi, điện tích giảm 1: phát ra positron ($\\beta^+$)"}. Phương trình: $${decayEq(d)}$.`,
        };
      }
      const wr: Nu[] = d.t === "a" ? [[d.A - 2, d.Z - 4], [d.A - 4, d.Z + 2], [d.A, d.Z - 2], [d.A - 4, d.Z - 4]] : d.t === "b-" ? [[d.A, d.Z - 1], [d.A - 1, d.Z + 1], [d.A + 1, d.Z], [d.A - 1, d.Z]] : [[d.A, d.Z + 1], [d.A - 1, d.Z], [d.A + 1, d.Z - 1], [d.A - 1, d.Z - 1]];
      return {
        stem: `Hạt nhân ${P} là chất ${TYPE_NAME[d.t]}. Hạt nhân con tạo thành là`,
        ...mcq(r, D, wr.map(([x, y]) => nucM(x, y))),
        explanation: `$${decayEq(d)}$. ${d.t === "a" ? "Phóng xạ $\\alpha$: $A$ giảm 4, $Z$ giảm 2" : d.t === "b-" ? "Phóng xạ $\\beta^-$: $A$ không đổi, $Z$ tăng 1" : "Phóng xạ $\\beta^+$: $A$ không đổi, $Z$ giảm 1"}.`,
      };
    },
  },
  {
    ...HN, id: "l12k2-dinh-luat-phong-xa", topic: "Định luật phóng xạ – lượng chất còn lại", level: 1, kind: "mcq",
    make: (r) => {
      const h = r.pick(HALF), k = r.int(2, 5), t = h.T * k, X = nucM(h.A, h.Z), p = 2 ** k;
      const ctx = `Chất phóng xạ ${X} có chu kì bán rã ${Tq(h)}.`;
      const F = (n: number, d: number) => `$${frac(n, d)}$`;
      const ask = r.pick(["rem", "dec", "m"]);
      if (ask === "rem") return {
        stem: `${ctx} Sau thời gian ${Tq(h, t)}, số hạt nhân ${X} còn lại bằng bao nhiêu phần số hạt nhân ban đầu?`,
        ...mcq(r, F(1, p), [F(p - 1, p), F(1, k), F(1, 2 * k), F(1, 2 * p)]),
        explanation: `$t = ${k}T$ nên $N = N_0\\cdot 2^{-t/T} = \\dfrac{N_0}{2^{${k}}} = \\dfrac{N_0}{${p}}$.`,
      };
      if (ask === "dec") return {
        stem: `${ctx} Sau thời gian ${Tq(h, t)}, số hạt nhân ${X} đã bị phân rã bằng bao nhiêu phần số hạt nhân ban đầu?`,
        ...mcq(r, F(p - 1, p), [F(1, p), F(k - 1, k), F(1, 2 * k), F(2 * p - 1, 2 * p)]),
        explanation: `Số hạt còn lại $\\dfrac{N_0}{2^{${k}}} = \\dfrac{N_0}{${p}}$, số hạt đã phân rã $\\Delta N = N_0 - \\dfrac{N_0}{${p}} = ${frac(p - 1, p)}N_0$.`,
      };
      const m0 = r.pick([16, 32, 48, 64, 80, 96, 100, 128, 160, 200, 256]), m = m0 / p;
      return {
        stem: `${ctx} Ban đầu có ${q(m0, "g")} ${X}. Sau thời gian ${Tq(h, t)}, khối lượng ${X} còn lại là`,
        ...nopt(r, m, [m0 - m, m0 / k, m0 / (2 * k), m0 / (2 * p)], (x) => q(x, "g", 3)),
        explanation: `$m = m_0\\cdot 2^{-t/T} = \\dfrac{${m0}}{2^{${k}}} = ${tex(m, 3)}\\ \\text{g}$.`,
      };
    },
  },
  {
    ...HN, id: "l12k2-chu-ki-ban-ra", topic: "Chu kì bán rã – tìm chu kì, thời gian, lượng chất", level: 3, kind: "mcq",
    make: (r) => {
      const form = r.pick(["T", "ratio", "m"]);
      if (form === "T") {
        const T = r.int(2, 40), k = r.int(2, 5), t = T * k, p = 2 ** k, u = r.pick(["ngày", "giờ", "phút"]);
        const decPct = (1 - 1 / p) * 100;
        return {
          stem: `Sau ${t} ${u}, $${tex(decPct, 3)}\\%$ số hạt nhân của một mẫu chất phóng xạ đã bị phân rã. Chu kì bán rã của chất phóng xạ đó là`,
          ...nopt(r, T, [t / (p - 1), t / (k + 1), t / p, t / (k - 1)], (x) => `$${ts(x)}$ ${u}`),
          explanation: `Số hạt còn lại bằng $${tex(100 / p, 3)}\\% = \\dfrac{1}{${p}} = 2^{-${k}}$ số hạt ban đầu, nên $t = ${k}T \\Rightarrow T = \\dfrac{${t}}{${k}} = ${T}$ ${u}.`,
        };
      }
      if (form === "ratio") {
        const h = r.pick(HALF), k = r.int(1, 5), ratio = 2 ** k - 1, X = nucM(h.A, h.Z);
        return {
          stem: `Chất phóng xạ ${X} có chu kì bán rã ${Tq(h)}. Ban đầu mẫu chất là ${X} nguyên chất. Tại thời điểm $t$, tỉ số giữa số hạt nhân con tạo thành và số hạt nhân ${X} còn lại là $${ratio}$. Giá trị của $t$ là`,
          ...nopt(r, k * h.T, [ratio * h.T, (k + 1) * h.T, (ratio * h.T) / 2, Math.log2(ratio) * h.T], (x) => `$${ts(x)}$ ${h.u}`),
          explanation: `$\\dfrac{N_{con}}{N} = \\dfrac{N_0(1 - 2^{-t/T})}{N_0 2^{-t/T}} = 2^{t/T} - 1 = ${ratio} \\Rightarrow 2^{t/T} = ${ratio + 1} \\Rightarrow t = ${k}T = ${ts(k * h.T)}$ ${h.u}.`,
        };
      }
      const h = r.pick(HALF), X = nucM(h.A, h.Z), m0 = r.pick([10, 20, 50, 80, 100, 200]), f = r.pick([0.5, 1.5, 2.5, 3.5, 0.25, 1.25]), t = h.T * f, m = m0 * 2 ** -f;
      need(exact(t, 2));
      return {
        stem: `Chất phóng xạ ${X} có chu kì bán rã ${Tq(h)}. Ban đầu có ${q(m0, "g")} ${X}. Sau thời gian ${Tq(h, t)}, khối lượng ${X} còn lại xấp xỉ bằng`,
        ...nopt(r, m, [m0 / (2 * f), m0 - m, m0 * Math.exp(-f), m0 * (1 - f / 2)], (x) => qs(x, "g")),
        explanation: `$m = m_0\\cdot 2^{-t/T} = ${m0}\\cdot 2^{-${tex(f, 2)}} \\approx ${ts(m)}\\ \\text{g}$.`,
      };
    },
  },
  {
    ...HN, id: "l12k2-do-phong-xa", topic: "Độ phóng xạ, hằng số phóng xạ", level: 3, kind: "mcq",
    make: (r) => {
      const h = r.pick(HALF.filter((x) => x.u !== "phút")), X = nucM(h.A, h.Z);
      const Ts = h.T * h.s, lam = Math.LN2 / Ts;
      const unit = h.T > 100 && h.u === "năm" ? "g" : "mg", m = r.pick([1, 2, 5, 10, 20]), mg = unit === "g" ? m : m / 1000;
      const N = (mg / h.A) * NA, H = lam * N;
      const ctx = `Chất phóng xạ ${X} có chu kì bán rã ${Tq(h)}${h.u === "năm" ? ` (lấy ${YEAR_T})` : ""}. Lấy $N_A = 6{,}02\\cdot 10^{23}\\ \\text{mol}^{-1}$, khối lượng mol của ${X} xấp xỉ $${h.A}\\ \\text{g/mol}$.`;
      const Bq = (x: number) => `$${sci(x)}\\ \\text{Bq}$`;
      if (r.chance(0.6)) return {
        stem: `${ctx} Độ phóng xạ của ${q(m, unit)} ${X} là`,
        ...nopt(r, H, [H * h.s, H / Math.LN2, H * 1000, H * Math.LN2], Bq),
        explanation: `$\\lambda = \\dfrac{\\ln 2}{T} = \\dfrac{0{,}693}{${sci(Ts)}\\ \\text{s}} \\approx ${sci(lam)}\\ \\text{s}^{-1}$; $N = \\dfrac{m}{A}N_A = \\dfrac{${sci(mg)}}{${h.A}}\\cdot 6{,}02\\cdot 10^{23} \\approx ${sci(N)}$; $H = \\lambda N \\approx ${sci(H)}\\ \\text{Bq}$.`,
      };
      const Hc = sig(H, 3), mm = (Hc / lam / NA) * h.A * (unit === "g" ? 1 : 1000);
      return {
        stem: `${ctx} Một mẫu ${X} có độ phóng xạ $${sci(Hc)}\\ \\text{Bq}$. Khối lượng ${X} trong mẫu xấp xỉ bằng`,
        ...nopt(r, mm, [mm / h.s, mm * Math.LN2, mm / Math.LN2, mm * 1000], (x) => `$${x < 0.01 || x >= 1e4 ? sci(x) : ts(x)}\\ \\text{${unit}}$`),
        explanation: `$\\lambda = \\dfrac{\\ln 2}{T} \\approx ${sci(lam)}\\ \\text{s}^{-1}$; $N = \\dfrac{H}{\\lambda} \\approx ${sci(Hc / lam)}$; $m = \\dfrac{N}{N_A}A \\approx ${ts(mm)}\\ \\text{${unit}}$.`,
      };
    },
  },
  {
    ...HN, id: "l12k2-chuoi-phong-xa", topic: "Chuỗi phóng xạ – số hạt $\\alpha$, $\\beta^-$", level: 3, kind: "mcq",
    make: (r) => {
      const [[A1, Z1], [A2, Z2]] = r.pick(CHAINS), dA = A1 - A2, a = dA / 4, b = 2 * a - (Z1 - Z2);
      need(Number.isInteger(a) && b >= 0);
      const o = (x: number, y: number) => `${x} hạt $\\alpha$ và ${y} hạt $\\beta^-$`;
      const wr: [number, number][] = [[b, a], [a, b + 2], [a + 1, b], [a, Z1 - Z2], [a, Math.abs(b - 2)], [a - 1, b + 1]];
      return {
        stem: `Hạt nhân ${nucM(A1, Z1)} sau một chuỗi phóng xạ $\\alpha$ và $\\beta^-$ biến đổi thành hạt nhân ${nucM(A2, Z2)}. Số hạt $\\alpha$ và $\\beta^-$ được phát ra trong chuỗi phóng xạ đó là`,
        ...mcq(r, o(a, b), wr.filter(([x, y]) => x >= 0 && y >= 0 && !(x === a && y === b)).map(([x, y]) => o(x, y))),
        explanation: `Gọi $x$, $y$ là số hạt $\\alpha$, $\\beta^-$. Bảo toàn số nucleon: $${A1} = ${A2} + 4x \\Rightarrow x = ${a}$. Bảo toàn điện tích: $${Z1} = ${Z2} + 2x - y \\Rightarrow y = ${b}$.`,
      };
    },
  },

  /* ---------- TF ---------- */
  {
    ...HN, id: "l12k2-tf-nang-luong-lien-ket", topic: "Cấu tạo hạt nhân, năng lượng liên kết – Đúng/Sai", level: 2, kind: "tf",
    make: (r) => {
      const b = bind(r.pick(BIND.filter((x) => x[0] !== 4))), X = nucM(b.A, b.Z), he = bind([4, 2]);
      const swap = round(b.Z * MN + b.N * MP - b.m, 4);
      need(swap !== b.dm);
      const c1 = r.chance(0.5), c2 = r.chance(0.5), c3 = r.chance(0.5);
      const stronger = b.eps > he.eps, c4 = r.chance(0.5);
      return {
        stem: `${r.pick(["Cho", "Biết", `Bạn ${r.pick(NAMES)} tra cứu được`])} khối lượng hạt nhân ${X} là $${tex(b.m, 4)}\\ \\text{u}$; ${MP_T}. Năng lượng liên kết riêng của hạt nhân $${nuc(4, 2)}$ là $${tex(he.eps, 2)}\\ \\text{MeV/nucleon}$.`,
        ...tf([
          [`Hạt nhân ${X} có ${c1 ? b.N : b.A} neutron.`, c1],
          [`Độ hụt khối của hạt nhân ${X} là ${q(c2 ? b.dm : swap, "u", 4)}.`, c2],
          [`Năng lượng liên kết của hạt nhân ${X} xấp xỉ ${q(round(c3 ? b.W : swap * UC, 1), "MeV", 1)}.`, c3],
          [`Hạt nhân ${X} ${(c4 ? stronger : !stronger) ? "bền vững hơn" : "kém bền vững hơn"} hạt nhân $${nuc(4, 2)}$.`, c4],
        ]),
        explanation: `$N = A - Z = ${b.N}$. $\\Delta m = ${b.Z}\\cdot 1{,}0073 + ${b.N}\\cdot 1{,}0087 - ${tex(b.m, 4)} = ${tex(b.dm, 4)}\\ \\text{u}$. $W_{lk} = \\Delta m\\cdot 931{,}5 \\approx ${tex(b.W, 1)}\\ \\text{MeV}$; $W_{lkr} = \\dfrac{W_{lk}}{A} \\approx ${tex(b.eps, 2)}\\ \\text{MeV/nucleon}$ ${stronger ? ">" : "<"} $${tex(he.eps, 2)}$ nên ${X} ${stronger ? "bền vững hơn" : "kém bền vững hơn"} $${nuc(4, 2)}$.`,
      };
    },
  },
  {
    ...HN, id: "l12k2-tf-phong-xa", topic: "Định luật phóng xạ – Đúng/Sai", level: 2, kind: "tf",
    make: (r) => {
      const h = r.pick(HALF), X = nucM(h.A, h.Z), k = r.int(1, 4), t = h.T * k, p = 2 ** k, m0 = r.pick([8, 16, 32, 40, 64, 80, 100, 160, 200]), m = m0 / p;
      const lam = Math.LN2 / h.T;
      const c1 = r.chance(0.5), c2 = r.chance(0.5), c3 = r.chance(0.5), c4 = r.chance(0.5);
      return {
        stem: `Một mẫu chứa ${q(m0, "g")} chất phóng xạ ${X} nguyên chất, chu kì bán rã của ${X} là ${Tq(h)}.`,
        ...tf([
          [`Hằng số phóng xạ của ${X} xấp xỉ $${ts(c1 ? lam : 1 / h.T)}\\ \\text{${h.u}}^{-1}$.`, c1],
          [`Sau ${Tq(h, t)}, khối lượng ${X} còn lại là ${q(c2 ? m : m0 / (2 * k), "g", 3)}.`, c2],
          [`Sau ${Tq(h, t)}, khối lượng ${X} đã bị phân rã là ${q(c3 ? m0 - m : m, "g", 3)}.`, c3],
          [c4 ? `Nếu mẫu ban đầu có khối lượng gấp đôi thì chu kì bán rã của ${X} vẫn không đổi.` : `Nếu mẫu ban đầu có khối lượng gấp đôi thì chu kì bán rã của ${X} cũng tăng gấp đôi.`, c4],
        ]),
        explanation: `$\\lambda = \\dfrac{\\ln 2}{T} = \\dfrac{0{,}693}{${tex(h.T, 2)}} \\approx ${ts(lam)}\\ \\text{${h.u}}^{-1}$. $t = ${k}T$: $m = \\dfrac{m_0}{2^{${k}}} = ${tex(m, 3)}\\ \\text{g}$; đã phân rã $${tex(m0 - m, 3)}\\ \\text{g}$. Chu kì bán rã chỉ phụ thuộc bản chất hạt nhân, không phụ thuộc khối lượng mẫu.`,
      };
    },
  },
  {
    ...HN, id: "l12k2-tf-phan-ung-toa-nang-luong", topic: "Phản ứng hạt nhân tỏa năng lượng – Đúng/Sai", level: 3, kind: "tf",
    make: (r) => {
      const x = r.pick(RXE.filter((y) => rxE(y).E > 0)), e = rxE(x);
      const hideI = r.int(0, x.r.length - 1), hid = x.r[hideI];
      const rhs = x.r.map((p, i) => (i === hideI ? "\\mathrm{X}" : nuc(p[0], p[1]))).join(" + ");
      const first = x.l[0], cnt = x.l.filter((p) => p[0] === first[0] && p[1] === first[1]).length;
      const reactions = (1 / first[0]) * NA / cnt, EJ = reactions * e.E * MEV;
      const wrongX: Nu = hid[1] === 0 ? [1, 1] : hid[0] === 1 ? [1, 0] : [hid[0] - 1, hid[1]];
      const c1 = r.chance(0.5), c2 = r.chance(0.5), c3 = r.chance(0.5), c4 = r.chance(0.5);
      return {
        stem: `Cho phản ứng hạt nhân $${side(x.l)} \\to ${rhs}$. Biết khối lượng các hạt nhân: ${massList(x)}; $1\\ \\text{u} = 931{,}5\\ \\text{MeV/c}^2$, $1\\ \\text{MeV} = 1{,}6\\cdot 10^{-13}\\ \\text{J}$, $N_A = 6{,}02\\cdot 10^{23}\\ \\text{mol}^{-1}$.`,
        ...tf([
          [`Hạt X là ${nucM(...(c1 ? hid : wrongX))}.`, c1],
          [c2 ? "Phản ứng này tỏa năng lượng." : "Phản ứng này thu năng lượng.", c2],
          [`Năng lượng tỏa ra của một phản ứng xấp xỉ ${q(c3 ? e.E : e.E * 2, "MeV", 2)}.`, c3],
          [`Năng lượng tỏa ra khi dùng hết $1\\ \\text{g}$ ${nucM(first[0], first[1])} xấp xỉ $${sci(c4 ? EJ : EJ * (cnt > 1 ? cnt : first[0]))}\\ \\text{J}$.`, c4],
        ]),
        explanation: `Bảo toàn số nucleon và điện tích: X là ${nucM(hid[0], hid[1])}. $\\Delta E = (${tex(e.ml, 4)} - ${tex(e.mr, 4)})\\cdot 931{,}5 \\approx ${tex(e.E, 2)}\\ \\text{MeV} > 0$: tỏa năng lượng. $1\\ \\text{g}$ ${nucM(first[0], first[1])} có $\\dfrac{1}{${first[0]}}N_A$ hạt, ${cnt > 1 ? `mỗi phản ứng dùng ${cnt} hạt nên có $\\dfrac{N_A}{${first[0] * cnt}}$ phản ứng` : "ứng với cùng số phản ứng"}; $E \\approx ${sci(reactions)}\\cdot ${tex(e.E, 2)}\\cdot 1{,}6\\cdot 10^{-13} \\approx ${sci(EJ)}\\ \\text{J}$.`,
      };
    },
  },
  {
    ...HN, id: "l12k2-tf-ly-thuyet-hat-nhan", topic: "Hạt nhân, phóng xạ, phân hạch, nhiệt hạch – Đúng/Sai", level: 1, kind: "tf",
    make: (r) => {
      const tr = pickN(r, TRUE_HN, 4), fa = pickN(r, FALSE_HN, 4);
      const items: [string, boolean][] = [0, 1, 2, 3].map((i) => (r.chance(0.5) ? [tr[i], true] : [fa[i], false]));
      return {
        stem: `${r.pick([`Bạn ${r.pick(NAMES)} đưa ra các phát biểu sau`, `Trong giờ thảo luận, nhóm của bạn ${r.pick(NAMES)} nêu các phát biểu sau`, "Xét các phát biểu sau"])} về hạt nhân nguyên tử, phóng xạ và năng lượng hạt nhân.`,
        ...tf(items),
        explanation: items.map(([t, a]) => `${a ? "Đúng" : "Sai"}: ${t}`).join(" "),
      };
    },
  },

  /* ---------- SHORT ---------- */
  {
    ...HN, id: "l12k2-s-nang-luong-lien-ket", topic: "Năng lượng liên kết, năng lượng liên kết riêng – trả lời ngắn", level: 2, kind: "short",
    make: (r) => {
      const b = bind(r.pick(BIND)), X = nucM(b.A, b.Z);
      const ctx = `Cho khối lượng hạt nhân ${X} là $${tex(b.m, 4)}\\ \\text{u}$; ${MP_T}.`;
      const sol = `$\\Delta m = ${b.Z}\\cdot 1{,}0073 + ${b.N}\\cdot 1{,}0087 - ${tex(b.m, 4)} = ${tex(b.dm, 4)}\\ \\text{u}$; $W_{lk} = \\Delta m\\cdot 931{,}5 \\approx ${tex(b.W, 2)}\\ \\text{MeV}$`;
      if (r.chance(0.6)) return {
        stem: `${ctx} Năng lượng liên kết riêng của hạt nhân ${X} là bao nhiêu MeV/nucleon? (Làm tròn đến hàng phần trăm.)`,
        ...short(b.eps, 2),
        explanation: `${sol}; $W_{lkr} = \\dfrac{W_{lk}}{A} \\approx ${tex(b.eps, 2)}\\ \\text{MeV/nucleon}$.`,
      };
      return {
        stem: `${ctx} Năng lượng liên kết của hạt nhân ${X} là bao nhiêu MeV? (Làm tròn đến hàng đơn vị.)`,
        ...short(round(b.W), 0),
        explanation: `${sol} $\\approx ${round(b.W)}\\ \\text{MeV}$.`,
      };
    },
  },
  {
    ...HN, id: "l12k2-s-phong-xa", topic: "Định luật phóng xạ – trả lời ngắn", level: 2, kind: "short",
    make: (r) => {
      const h = r.pick(HALF), X = nucM(h.A, h.Z), form = r.pick(["pct", "t", "m"]);
      if (form === "pct") {
        const k = r.int(1, 6), p = 2 ** k, dec = r.chance(0.5), v = dec ? 100 - 100 / p : 100 / p;
        return {
          stem: `Chất phóng xạ ${X} có chu kì bán rã ${Tq(h)}. Sau thời gian ${Tq(h, h.T * k)}, số hạt nhân ${X} ${dec ? "đã bị phân rã" : "còn lại"} bằng bao nhiêu phần trăm số hạt nhân ban đầu? (Làm tròn đến hàng phần mười.)`,
          ...short(v, 1),
          explanation: `$t = ${k}T$: số hạt còn lại $\\dfrac{N_0}{2^{${k}}} = ${tex(100 / p, 3)}\\%\\,N_0$${dec ? `; đã phân rã $${tex(100 - 100 / p, 3)}\\% \\approx ${tex(v, 1)}\\%$` : ` $\\approx ${tex(v, 1)}\\%$`}.`,
        };
      }
      if (form === "t") {
        const k = r.int(2, 5), p = 2 ** k, t = h.T * k;
        need(t < 9999 && exact(t, 1) && vn(t, 1).length <= 4);
        return {
          stem: `Chất phóng xạ ${X} có chu kì bán rã ${Tq(h)}. Sau bao nhiêu ${h.u} thì số hạt nhân ${X} trong một mẫu chỉ còn bằng $${frac(1, p)}$ số hạt nhân ban đầu?`,
          ...short(t, 1),
          explanation: `$\\dfrac{N}{N_0} = 2^{-t/T} = \\dfrac{1}{${p}} = 2^{-${k}} \\Rightarrow t = ${k}T = ${tex(t, 2)}$ ${h.u}.`,
        };
      }
      const m0 = r.pick([10, 20, 25, 50, 80, 100, 120, 200]), f = r.pick([0.5, 1.5, 2.5, 3, 4, 0.25]), m = m0 * 2 ** -f;
      need(exact(h.T * f, 2));
      return {
        stem: `Ban đầu có ${q(m0, "g")} chất phóng xạ ${X} nguyên chất, chu kì bán rã ${Tq(h)}. Khối lượng ${X} còn lại sau ${Tq(h, h.T * f)} là bao nhiêu gam? (Làm tròn đến hàng phần mười.)`,
        ...short(m, 1),
        explanation: `$\\dfrac{t}{T} = ${tex(f, 2)}$; $m = m_0\\cdot 2^{-t/T} = ${m0}\\cdot 2^{-${tex(f, 2)}} \\approx ${tex(m, 2)}\\ \\text{g}$.`,
      };
    },
  },
  {
    ...HN, id: "l12k2-s-nang-luong-phan-ung", topic: "Năng lượng phản ứng hạt nhân – trả lời ngắn", level: 3, kind: "short",
    make: (r) => {
      const x = r.pick(RXE), e = rxE(x), E = Math.abs(e.E), dp = E >= 10 ? 1 : 2;
      return {
        stem: `Cho phản ứng hạt nhân $${side(x.l)} \\to ${side(x.r)}$. Biết khối lượng các hạt nhân: ${massList(x)}; $1\\ \\text{u} = 931{,}5\\ \\text{MeV/c}^2$. Năng lượng mà một phản ứng ${r.pick(["tỏa ra hoặc thu vào", "trao đổi với bên ngoài"])} có độ lớn bằng bao nhiêu MeV? (Làm tròn đến hàng ${dp === 1 ? "phần mười" : "phần trăm"}.)`,
        ...short(E, dp),
        explanation: `$\\Delta E = (m_{trước} - m_{sau})c^2 = (${tex(e.ml, 4)} - ${tex(e.mr, 4)})\\cdot 931{,}5 \\approx ${tex(e.E, 3)}\\ \\text{MeV}$: phản ứng ${e.E > 0 ? "tỏa" : "thu"} năng lượng có độ lớn khoảng $${tex(E, dp)}\\ \\text{MeV}$.`,
      };
    },
  },
  {
    ...HN, id: "l12k2-s-do-phong-xa", topic: "Độ phóng xạ – trả lời ngắn", level: 3, kind: "short",
    make: (r) => {
      const h = r.pick(HALF.filter((x) => x.u !== "phút")), X = nucM(h.A, h.Z), Ts = h.T * h.s, lam = Math.LN2 / Ts;
      if (r.chance(0.6)) {
        const unit = h.u === "năm" && h.T > 100 ? "g" : "mg", m = r.pick([1, 2, 4, 5, 10]), mg = unit === "g" ? m : m / 1000;
        const H = lam * (mg / h.A) * NA, e = Math.floor(Math.log10(H)), x = H / 10 ** e;
        need(round(x, 2) < 10);
        return {
          stem: `Chất phóng xạ ${X} có chu kì bán rã ${Tq(h)}${h.u === "năm" ? ` (lấy ${YEAR_T})` : ""}. Lấy $N_A = 6{,}02\\cdot 10^{23}\\ \\text{mol}^{-1}$, khối lượng mol của ${X} là $${h.A}\\ \\text{g/mol}$. Độ phóng xạ của ${q(m, unit)} ${X} là $x\\cdot 10^{${e}}\\ \\text{Bq}$. Tìm $x$ (làm tròn đến hàng phần trăm).`,
          ...short(x, 2),
          explanation: `$\\lambda = \\dfrac{\\ln 2}{T} = \\dfrac{0{,}693}{${sci(Ts)}} \\approx ${sci(lam, 3)}\\ \\text{s}^{-1}$; $N = \\dfrac{${sci(mg)}}{${h.A}}\\cdot 6{,}02\\cdot 10^{23} \\approx ${sci(mg / h.A * NA, 3)}$; $H = \\lambda N \\approx ${sci(H)}\\ \\text{Bq}$.`,
        };
      }
      const H0 = r.pick([2, 4, 5, 8, 10, 20]), ratio = r.pick([3, 5, 6, 10, 12, 20]), t = h.T * Math.log2(ratio);
      need(t < 9999 && vn(t, 1).length <= 4);
      return {
        stem: `Một mẫu chất phóng xạ ${X} (chu kì bán rã ${Tq(h)}) có độ phóng xạ ban đầu $${H0}\\cdot 10^{10}\\ \\text{Bq}$. Sau bao nhiêu ${h.u} thì độ phóng xạ của mẫu giảm ${ratio} lần? (Làm tròn đến hàng phần mười.)`,
        ...short(t, 1),
        explanation: `$H = H_0\\cdot 2^{-t/T} \\Rightarrow 2^{t/T} = ${ratio} \\Rightarrow t = T\\log_2 ${ratio} = ${tex(h.T, 2)}\\cdot ${tex(Math.log2(ratio), 3)} \\approx ${tex(t, 1)}$ ${h.u}.`,
      };
    },
  },
];

export const TEMPLATES: Template[] = [...H1T, ...H1X, ...H2N];
