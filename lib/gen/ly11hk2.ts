/* Vật lí 11 – Học kì 2 (Kết nối tri thức): Chương III. Điện trường (half 1), Chương IV. Dòng điện. Mạch điện (half 2). */
import { mcq, tf, short, tex, vn, need, round, type Template, type Rng, type GenOut } from "./core.ts";

const S = "Vật lí", G = 11 as const;
const C3 = "Chương III. Điện trường";
const C4 = "Chương IV. Dòng điện. Mạch điện";
const K3 = "Vật lí|Điện trường";
const K4 = "Vật lí|Dòng điện, mạch điện";
/** điện tích nguyên tố, khối lượng electron */
const EC = 1.6e-19, ME = 9.1e-31;

/* ---------------- tiện ích riêng ---------------- */
/** x gần đúng bằng chính nó làm tròn dp chữ số */
const isNice = (x: number, dp: number) => Math.abs(x - round(x, dp)) < 1e-9 * Math.max(1, Math.abs(x));
/** [phần định trị, số mũ] của |x| */
function sciParts(x: number, dp = 2): [number, number] {
  const a = Math.abs(x); let e = Math.floor(Math.log10(a)); let m = round(a / Math.pow(10, e), dp);
  if (m >= 10) { m = round(m / 10, dp); e++; }
  if (m < 1) { m = round(m * 10, dp); e--; }
  return [m, e];
}
/** dạng khoa học trong công thức: 1{,}6\cdot 10^{-19} */
function sci(x: number, dp = 2): string {
  if (x === 0) return "0";
  const [m, e] = sciParts(x, dp), s = x < 0 ? "-" : "";
  if (e === 0) return s + tex(m, dp);
  return s + (m === 1 ? "" : tex(m, dp) + "\\cdot ") + `10^{${e}}`;
}
/** định trị của x có tối đa dp chữ số thập phân */
const niceSci = (x: number, dp = 2) => { const [m] = sciParts(x, 8); return Math.abs(m - round(m, dp)) < 1e-6; };
/** số chữ số thập phân để giữ 4 chữ số có nghĩa */
const sigDp = (x: number) => (x === 0 ? 0 : Math.min(6, Math.max(0, 3 - Math.floor(Math.log10(Math.abs(x))))));
const big = (x: number) => x !== 0 && (Math.abs(x) >= 1e5 || Math.abs(x) < 1e-3);
/** số kèm đơn vị cho văn bản (tự chuyển sang dạng khoa học khi quá lớn/ nhỏ) */
const num = (x: number, unit: string) => (big(x) ? `$${sci(x)}$ ${unit}` : `${vn(x, sigDp(x))} ${unit}`);
/** số trong công thức */
const numT = (x: number) => (big(x) ? sci(x) : tex(x, sigDp(x)));
/** số âm trong ngoặc khi đứng sau dấu nhân */
const par = (x: number, dp = 4) => (x < 0 ? `(${tex(x, dp)})` : tex(x, dp));
/** chọn cách làm tròn để đáp án trả lời ngắn ≤ 4 ký tự */
function fit(x: number): { v: number; dp: number; note: string } {
  const H = ["đơn vị", "phần mười", "phần trăm"];
  for (const dp of [2, 1, 0]) {
    const v = round(x, dp);
    if (vn(v, dp).length <= 4) return { v, dp, note: isNice(x, dp) ? "" : ` (làm tròn kết quả đến hàng ${H[dp]})` };
  }
  need(false, "fit: quá 4 ký tự");
  return { v: 0, dp: 0, note: "" };
}
const ser = (a: number, b: number) => (a * b) / (a + b);

type QA = { q: string; a: string; w: string[]; e: string };
/** câu lí thuyết: chọn 1 mục trong bảng, phương án nhiễu riêng của mục */
function theory(r: Rng, intros: string[], items: QA[]): GenOut {
  const it = r.pick(items), intro = r.pick(intros);
  return { stem: (intro ? intro + " " : "") + it.q, ...mcq(r, it.a, r.shuffle([...it.w])), explanation: it.e };
}
/** cặp phát biểu đúng/sai: chọn ngẫu nhiên bản đúng hay bản sai */
const pickTF = (r: Rng, t: string, f: string, p = 0.5): [string, boolean] => (r.chance(p) ? [t, true] : [f, false]);
const DS = (b: boolean) => (b ? "Đúng" : "Sai");
const EMF = "\\mathscr{E}";

/* ============================ HALF 1 – ĐIỆN TRƯỜNG ============================ */
const H1: Template[] = [
  {
    id: "l11k2-coulomb-ly-thuyet", subject: S, grade: G, chapter: C3, topic: "Điện tích, định luật Coulomb (lí thuyết)",
    hk: 2, half: 1, tk: K3, level: 1, kind: "mcq",
    make: (r) => theory(r, [""], [
      { q: "Hai điện tích điểm cùng dấu đặt gần nhau thì chúng", a: "đẩy nhau", w: ["hút nhau", "không tương tác với nhau", "lúc hút lúc đẩy nhau"], e: "Các điện tích cùng dấu đẩy nhau, trái dấu hút nhau." },
      { q: "Hai điện tích điểm trái dấu đặt gần nhau thì chúng", a: "hút nhau", w: ["đẩy nhau", "không tương tác với nhau", "lúc hút lúc đẩy nhau"], e: "Các điện tích trái dấu hút nhau, cùng dấu đẩy nhau." },
      { q: "Độ lớn lực tương tác giữa hai điện tích điểm đứng yên trong chân không", a: "tỉ lệ thuận với tích độ lớn hai điện tích và tỉ lệ nghịch với bình phương khoảng cách giữa chúng", w: ["tỉ lệ thuận với tích độ lớn hai điện tích và tỉ lệ nghịch với khoảng cách giữa chúng", "tỉ lệ thuận với tổng độ lớn hai điện tích và tỉ lệ nghịch với bình phương khoảng cách giữa chúng", "tỉ lệ thuận với bình phương khoảng cách giữa chúng"], e: "Định luật Coulomb: $F = k\\dfrac{|q_1q_2|}{r^2}$." },
      { q: "Biểu thức của định luật Coulomb cho hai điện tích điểm đặt trong chân không là", a: "$F = k\\dfrac{|q_1q_2|}{r^2}$", w: ["$F = k\\dfrac{|q_1q_2|}{r}$", "$F = \\dfrac{|q_1q_2|}{kr^2}$", "$F = k\\dfrac{|q_1 + q_2|}{r^2}$"], e: "$F = k\\dfrac{|q_1q_2|}{r^2}$ với $k = 9\\cdot 10^9$ N·m²/C²." },
      { q: "Đặt hai điện tích điểm trong một điện môi đồng chất có hằng số điện môi $\\varepsilon$, giữ nguyên khoảng cách. So với khi đặt trong chân không, lực tương tác giữa chúng", a: "giảm $\\varepsilon$ lần", w: ["tăng $\\varepsilon$ lần", "giảm $\\varepsilon^2$ lần", "không thay đổi"], e: "Trong điện môi $F = k\\dfrac{|q_1q_2|}{\\varepsilon r^2}$, nhỏ hơn trong chân không $\\varepsilon$ lần." },
      { q: "Trong hệ SI, đơn vị của điện tích là", a: "culông (C)", w: ["vôn (V)", "ampe (A)", "niutơn (N)"], e: "Điện tích có đơn vị culông (C)." },
      { q: "Trong hệ SI, hằng số $k$ trong định luật Coulomb có giá trị", a: "$9\\cdot 10^9$ N·m²/C²", w: ["$9\\cdot 10^{-9}$ N·m²/C²", "$8{,}85\\cdot 10^{-12}$ N·m²/C²", "$1{,}6\\cdot 10^{-19}$ N·m²/C²"], e: "$k = \\dfrac{1}{4\\pi\\varepsilon_0} = 9\\cdot 10^9$ N·m²/C²." },
      { q: "Lực tương tác giữa hai điện tích điểm có phương", a: "trùng với đường thẳng nối hai điện tích", w: ["vuông góc với đường thẳng nối hai điện tích", "luôn thẳng đứng", "hợp với đường thẳng nối hai điện tích một góc 45°"], e: "Lực Coulomb có phương trùng với đường thẳng nối hai điện tích điểm." },
      { q: "Cọ xát thanh thủy tinh vào mảnh lụa, sau đó thanh thủy tinh hút được các mẩu giấy vụn. Thanh thủy tinh đã bị nhiễm điện do", a: "cọ xát", w: ["tiếp xúc", "hưởng ứng", "bị nung nóng"], e: "Đây là hiện tượng nhiễm điện do cọ xát." },
      { q: "Điện tích của một electron là", a: "$-1{,}6\\cdot 10^{-19}$ C", w: ["$1{,}6\\cdot 10^{-19}$ C", "$-9{,}1\\cdot 10^{-31}$ C", "$-1{,}6\\cdot 10^{19}$ C"], e: "Electron mang điện tích $-e = -1{,}6\\cdot 10^{-19}$ C ($9{,}1\\cdot 10^{-31}$ kg là khối lượng electron)." },
      { q: "Một vật trung hòa về điện bị mất bớt electron thì vật", a: "nhiễm điện dương", w: ["nhiễm điện âm", "vẫn trung hòa về điện", "có khối lượng tăng lên"], e: "Mất electron thì tổng điện tích dương lớn hơn: vật nhiễm điện dương." },
      { q: "Đưa một vật nhiễm điện lại gần (không chạm) một thanh kim loại trung hòa thì hai đầu thanh kim loại xuất hiện điện tích trái dấu. Đó là hiện tượng nhiễm điện do", a: "hưởng ứng", w: ["cọ xát", "tiếp xúc", "dẫn nhiệt"], e: "Electron tự do trong kim loại dịch chuyển dưới tác dụng của vật nhiễm điện: nhiễm điện do hưởng ứng." },
    ]),
  },
  {
    id: "l11k2-coulomb-tinh-luc", subject: S, grade: G, chapter: C3, topic: "Tính lực tương tác Coulomb",
    hk: 2, half: 1, tk: K3, level: 1, kind: "mcq",
    make: (r) => {
      const a = r.int(1, 9), b = r.int(1, 9), c = r.pick([2, 3, 4, 5, 6, 10, 12, 15, 20, 30]);
      const [eps, med] = r.pick([[1, "chân không"], [1, "chân không"], [2, "dầu hỏa có hằng số điện môi $\\varepsilon = 2$"], [4, "một điện môi có hằng số điện môi $\\varepsilon = 4$"]] as [number, string][]);
      const F = (90 * a * b) / (eps * c * c);
      need(isNice(F, 3) && F >= 0.01 && F <= 500);
      const s1 = r.pick([-1, 1]), s2 = r.pick([-1, 1]), hut = s1 * s2 < 0;
      const ty = hut ? "lực hút" : "lực đẩy", ot = hut ? "lực đẩy" : "lực hút";
      const Fns = num((0.9 * a * b) / (eps * c), "N"), Fcm = num((0.009 * a * b) / (eps * c * c), "N");
      const Fe = eps > 1 ? num((90 * a * b * eps) / (c * c), "N") : Fcm;
      const q = (s: number, v: number) => `${s < 0 ? "-" : ""}${v}\\cdot 10^{-6}`;
      return {
        stem: `Hai điện tích điểm $q_1 = ${q(s1, a)}$ C và $q_2 = ${q(s2, b)}$ C đặt cách nhau ${c} cm trong ${med}. Lấy $k = 9\\cdot 10^9$ N·m²/C². Lực tương tác giữa hai điện tích là`,
        ...mcq(r, `${ty} có độ lớn ${num(F, "N")}`, [`${ot} có độ lớn ${num(F, "N")}`, `${ty} có độ lớn ${Fns}`, `${ty} có độ lớn ${Fe}`, `${ot} có độ lớn ${Fns}`, `${ty} có độ lớn ${Fcm}`]),
        explanation: `$F = k\\dfrac{|q_1q_2|}{\\varepsilon r^2} = 9\\cdot 10^9\\cdot\\dfrac{${a}\\cdot 10^{-6}\\cdot ${b}\\cdot 10^{-6}}{${eps === 1 ? "" : eps + "\\cdot "}${tex(c / 100)}^2} = ${numT(F)}$ N. Hai điện tích ${hut ? "trái dấu nên hút nhau" : "cùng dấu nên đẩy nhau"}.`,
      };
    },
  },
  {
    id: "l11k2-coulomb-thay-doi", subject: S, grade: G, chapter: C3, topic: "Lực Coulomb thay đổi khi thay đổi điện tích, khoảng cách, môi trường",
    hk: 2, half: 1, tk: K3, level: 2, kind: "mcq",
    make: (r) => {
      const F0 = r.pick([1.2, 1.8, 2.4, 3.6, 4.8, 7.2, 9, 12, 16, 18, 36]);
      const aq1 = r.pick([1, 1, 2, 3]), aq2 = r.pick([1, 1, 2]), rho = r.pick([1, 2, 3, 0.5, 1 / 3]), eps = r.pick([1, 1, 2, 4]);
      const nCh = (aq1 > 1 ? 1 : 0) + (aq2 > 1 ? 1 : 0) + (rho !== 1 ? 1 : 0) + (eps > 1 ? 1 : 0);
      need(nCh >= 1 && nCh <= 2);
      const aq = aq1 * aq2, fac = aq / (eps * rho * rho), F = F0 * fac;
      need(isNice(F, 4) && F >= 0.01);
      const ch: string[] = [];
      if (aq1 > 1 && aq1 === aq2) ch.push(`tăng độ lớn mỗi điện tích lên ${aq1} lần`);
      else { if (aq1 > 1) ch.push(`tăng độ lớn điện tích $q_1$ lên ${aq1} lần`); if (aq2 > 1) ch.push(`tăng độ lớn điện tích $q_2$ lên ${aq2} lần`); }
      if (rho > 1) ch.push(`tăng khoảng cách giữa chúng lên ${rho} lần`);
      if (rho < 1) ch.push(`giảm khoảng cách giữa chúng đi ${round(1 / rho)} lần`);
      if (eps > 1) ch.push(`đặt chúng vào trong điện môi có hằng số điện môi $\\varepsilon = ${eps}$`);
      const rhoT = rho >= 1 ? String(rho) : `\\dfrac{1}{${round(1 / rho)}}`;
      const W = [F0 * aq / (eps * rho), F0 * aq * rho * rho / eps, F0 * aq * eps / (rho * rho), F0 / fac, F0].filter((x) => x >= 0.001 && Math.abs(x - F) > 1e-9);
      return {
        stem: `Hai điện tích điểm đặt trong chân không ${r.pick(["hút", "đẩy"])} nhau bằng một lực có độ lớn ${vn(F0)} N. Nếu ${ch.join(" và ")} thì lực tương tác giữa chúng có độ lớn là`,
        ...mcq(r, `${vn(F, 4)} N`, W.map((x) => `${vn(x, 4)} N`)),
        explanation: `$F = k\\dfrac{|q_1q_2|}{\\varepsilon r^2}$ nên $F' = F\\cdot\\dfrac{${aq}}{${eps}\\cdot\\left(${rhoT}\\right)^2} = ${tex(F0)}\\cdot ${tex(fac, 4)} = ${tex(F, 4)}$ N.`,
      };
    },
  },
  {
    id: "l11k2-coulomb-hop-luc", subject: S, grade: G, chapter: C3, topic: "Lực điện tổng hợp tác dụng lên một điện tích",
    hk: 2, half: 1, tk: K3, level: 3, kind: "mcq",
    make: (r) => {
      const out = r.chance(0.4);
      const q1 = r.pick([-1, 1]) * r.int(1, 8), q2 = r.pick([-1, 1]) * r.int(1, 8), q3 = r.pick([-1, 1]) * r.int(1, 5);
      const L = [2, 3, 4, 5, 6, 10];
      let AC: number, BC: number, d: number;
      if (!out) { AC = r.pick(L); BC = r.pick(L); d = AC + BC; } else { d = r.pick(L); BC = r.pick(L); AC = d + BC; }
      const F1 = (90 * q1 * q3) / (AC * AC), F2 = ((90 * q2 * q3) / (BC * BC)) * (out ? 1 : -1);
      const m1 = Math.abs(F1), m2 = Math.abs(F2), net = Math.abs(F1 + F2), same = F1 * F2 > 0;
      need(net >= 0.05 && net <= 500 && Math.abs(m1 - m2) > 0.05);
      const f = (x: number) => `${vn(x, 2)} N`;
      return {
        stem: `Ba điện tích điểm $q_1 = ${q1}$ μC, $q_2 = ${q2}$ μC và $q_3 = ${q3}$ μC đặt trong chân không lần lượt tại ba điểm A, B, C thẳng hàng, AB = ${d} cm, ${out ? `C nằm ngoài đoạn AB về phía B và BC = ${BC} cm` : `C nằm trên đoạn AB và AC = ${AC} cm`}. Lấy $k = 9\\cdot 10^9$ N·m²/C². Độ lớn lực điện tổng hợp do $q_1$, $q_2$ tác dụng lên $q_3$ xấp xỉ bằng`,
        ...mcq(r, f(net), [f(same ? Math.abs(m1 - m2) : m1 + m2), f(Math.sqrt(m1 * m1 + m2 * m2)), f(m1), f(m2)]),
        explanation: `AC = ${AC} cm, BC = ${BC} cm. $F_{13} = k\\dfrac{|q_1q_3|}{AC^2} = 9\\cdot 10^9\\cdot\\dfrac{${Math.abs(q1 * q3)}\\cdot 10^{-12}}{${tex(AC / 100)}^2} \\approx ${tex(m1, 3)}$ N; $F_{23} = k\\dfrac{|q_2q_3|}{BC^2} \\approx ${tex(m2, 3)}$ N. Xét chiều (cùng dấu đẩy, trái dấu hút): hai lực ${same ? "cùng chiều" : "ngược chiều"} nên $F = ${same ? "F_{13} + F_{23}" : "|F_{13} - F_{23}|"} \\approx ${tex(net, 2)}$ N.`,
      };
    },
  },
  {
    id: "l11k2-dien-truong-ly-thuyet", subject: S, grade: G, chapter: C3, topic: "Điện trường, cường độ điện trường, đường sức (lí thuyết)",
    hk: 2, half: 1, tk: K3, level: 1, kind: "mcq",
    make: (r) => theory(r, [""], [
      { q: "Điện trường là", a: "môi trường bao quanh điện tích, gắn với điện tích và tác dụng lực điện lên điện tích khác đặt trong nó", w: ["môi trường chứa các electron tự do", "môi trường không khí bao quanh điện tích", "khoảng không gian chỉ tồn tại giữa hai bản kim loại tích điện"], e: "Điện trường là dạng vật chất bao quanh điện tích, tác dụng lực điện lên điện tích khác đặt trong nó." },
      { q: "Cường độ điện trường tại một điểm là đại lượng đặc trưng cho", a: "tác dụng lực của điện trường tại điểm đó", w: ["khả năng sinh công của điện trường tại điểm đó", "thể tích vùng có điện trường", "tốc độ dịch chuyển của điện tích tại điểm đó"], e: "$\\vec{E} = \\dfrac{\\vec{F}}{q}$ đặc trưng cho điện trường về phương diện tác dụng lực." },
      { q: "Trong hệ SI, đơn vị của cường độ điện trường là", a: "vôn trên mét (V/m)", w: ["vôn nhân mét (V·m)", "niutơn nhân mét (N·m)", "culông trên mét (C/m)"], e: "Đơn vị của $E$ là V/m (cũng bằng N/C)." },
      { q: "Vectơ cường độ điện trường do một điện tích điểm dương $Q$ gây ra tại điểm M", a: "có phương nằm trên đường thẳng nối $Q$ với M và hướng ra xa $Q$", w: ["có phương nằm trên đường thẳng nối $Q$ với M và hướng về phía $Q$", "vuông góc với đường thẳng nối $Q$ với M", "có độ lớn tỉ lệ nghịch với khoảng cách từ $Q$ đến M"], e: "Điện tích dương: $\\vec{E}$ hướng ra xa điện tích, độ lớn $E = k\\dfrac{|Q|}{r^2}$." },
      { q: "Vectơ cường độ điện trường do một điện tích điểm âm $Q$ gây ra tại điểm M", a: "có phương nằm trên đường thẳng nối $Q$ với M và hướng về phía $Q$", w: ["có phương nằm trên đường thẳng nối $Q$ với M và hướng ra xa $Q$", "vuông góc với đường thẳng nối $Q$ với M", "có độ lớn tỉ lệ thuận với khoảng cách từ $Q$ đến M"], e: "Điện tích âm: $\\vec{E}$ hướng về phía điện tích." },
      { q: "Lực điện tác dụng lên một điện tích âm đặt trong điện trường", a: "ngược hướng với vectơ cường độ điện trường tại điểm đặt điện tích", w: ["cùng hướng với vectơ cường độ điện trường tại điểm đặt điện tích", "vuông góc với vectơ cường độ điện trường", "luôn hướng về điện tích gây ra điện trường"], e: "$\\vec{F} = q\\vec{E}$; $q < 0$ nên $\\vec{F}$ ngược hướng $\\vec{E}$." },
      { q: "Cường độ điện trường do điện tích điểm $Q$ gây ra tại điểm cách nó một khoảng $r$ trong chân không có độ lớn", a: "$E = k\\dfrac{|Q|}{r^2}$", w: ["$E = k\\dfrac{|Q|}{r}$", "$E = k\\dfrac{Q^2}{r^2}$", "$E = \\dfrac{|Q|}{kr^2}$"], e: "$E = k\\dfrac{|Q|}{r^2}$ (trong điện môi chia thêm cho $\\varepsilon$)." },
      { q: "Đường sức điện của điện trường tĩnh", a: "là những đường không khép kín, đi ra từ điện tích dương và kết thúc ở điện tích âm", w: ["là những đường cong khép kín", "có thể cắt nhau tại những điểm có điện trường mạnh", "đi ra từ điện tích âm và kết thúc ở điện tích dương"], e: "Đường sức điện không khép kín, không cắt nhau, đi ra từ điện tích dương (hoặc vô cực) và kết thúc ở điện tích âm (hoặc vô cực)." },
      { q: "Điện trường đều là điện trường có", a: "vectơ cường độ điện trường tại mọi điểm đều như nhau", w: ["độ lớn cường độ điện trường giảm dần theo khoảng cách", "các đường sức là những đường cong đồng tâm", "chiều của vectơ cường độ điện trường thay đổi theo thời gian"], e: "Điện trường đều: $\\vec{E}$ cùng phương, chiều, độ lớn tại mọi điểm; đường sức là các đường thẳng song song cách đều." },
      { q: "Điện trường giữa hai bản kim loại phẳng, song song, tích điện trái dấu có độ lớn bằng nhau (bỏ qua hiệu ứng ở mép) là", a: "điện trường đều có đường sức vuông góc với các bản, hướng từ bản dương sang bản âm", w: ["điện trường đều có đường sức vuông góc với các bản, hướng từ bản âm sang bản dương", "điện trường có cường độ tăng dần khi lại gần bản dương", "điện trường đều có đường sức song song với các bản"], e: "Giữa hai bản là điện trường đều, đường sức vuông góc với các bản và hướng từ bản dương sang bản âm." },
      { q: "Hệ thức liên hệ giữa cường độ điện trường đều $E$ và hiệu điện thế $U$ giữa hai điểm nằm trên cùng một đường sức, cách nhau $d$ là", a: "$E = \\dfrac{U}{d}$", w: ["$E = Ud$", "$E = \\dfrac{d}{U}$", "$E = \\dfrac{U}{d^2}$"], e: "$U = Ed \\Rightarrow E = \\dfrac{U}{d}$." },
      { q: "Một hạt mang điện bay vào điện trường đều theo phương vuông góc với đường sức (bỏ qua trọng lực). Quỹ đạo của hạt trong điện trường là", a: "một phần đường parabol", w: ["một đường thẳng", "một đường tròn", "một đường xoắn ốc"], e: "Lực điện không đổi vuông góc với vận tốc ban đầu, giống chuyển động ném ngang nên quỹ đạo là một phần parabol." },
    ]),
  },
  {
    id: "l11k2-cuong-do-dien-truong-diem", subject: S, grade: G, chapter: C3, topic: "Cường độ điện trường của điện tích điểm",
    hk: 2, half: 1, tk: K3, level: 1, kind: "mcq",
    make: (r) => {
      const a = r.int(1, 9), sg = r.pick([-1, 1]), c = r.pick([1, 2, 3, 5, 6, 10, 15, 20, 30]);
      const [eps, med] = r.pick([[1, "chân không"], [1, "không khí"], [2, "dầu có hằng số điện môi $\\varepsilon = 2$"], [4, "điện môi có hằng số điện môi $\\varepsilon = 4$"]] as [number, string][]);
      const E = (9e4 * a) / (eps * c * c);
      need(isNice(E, 2) && E >= 1);
      const eT = eps === 1 ? "" : eps + "\\cdot ";
      const sol = `$E = k\\dfrac{|Q|}{\\varepsilon r^2} = 9\\cdot 10^9\\cdot\\dfrac{${a}\\cdot 10^{-9}}{${eT}${tex(c / 100)}^2} = ${numT(E)}$ V/m.`;
      if (r.chance(0.65)) {
        const W = [(900 * a) / (eps * c), (9 * a) / (eps * c * c), (9e13 * a) / (eps * c * c), eps > 1 ? (9e4 * a * eps) / (c * c) : (9e4 * a) / c];
        return { stem: `Một điện tích điểm $Q = ${sg * a}\\cdot 10^{-9}$ C đặt trong ${med}. Lấy $k = 9\\cdot 10^9$ N·m²/C². Cường độ điện trường do $Q$ gây ra tại điểm cách nó ${c} cm có độ lớn là`, ...mcq(r, num(E, "V/m"), W.map((x) => num(x, "V/m"))), explanation: sol };
      }
      const W = [(E * c) / 900 * eps, (E * c * c) / 9 * eps, a * 10, round(a / 10, 2)].filter((x) => x !== a);
      return {
        stem: `Một điện tích điểm $Q$ đặt trong ${med} gây ra tại điểm cách nó ${c} cm một điện trường có cường độ ${num(E, "V/m")}. Lấy $k = 9\\cdot 10^9$ N·m²/C². Độ lớn của $Q$ là`,
        ...mcq(r, `${a} nC`, W.map((x) => num(x, "nC"))),
        explanation: `$|Q| = \\dfrac{\\varepsilon E r^2}{k} = \\dfrac{${eT}${numT(E)}\\cdot ${tex(c / 100)}^2}{9\\cdot 10^9} = ${a}\\cdot 10^{-9}$ C $= ${a}$ nC.`,
      };
    },
  },
  {
    id: "l11k2-chong-chat-dien-truong", subject: S, grade: G, chapter: C3, topic: "Chồng chất điện trường",
    hk: 2, half: 1, tk: K3, level: 3, kind: "mcq",
    make: (r) => {
      const mode = r.pick(["mid", "out", "vuong"]);
      const q1 = r.pick([-1, 1]) * r.int(1, 9), q2 = r.pick([-1, 1]) * r.int(1, 9);
      const f = (x: number) => `${vn(x, 2)} kV/m`;
      if (mode === "vuong") {
        const s = r.pick([1, 2]), MA = 3 * s, MB = 4 * s, d = 5 * s;
        const E1 = (90 * Math.abs(q1)) / (MA * MA), E2 = (90 * Math.abs(q2)) / (MB * MB), E = Math.hypot(E1, E2);
        need(Math.abs(E1 - E2) > 0.05);
        return {
          stem: `Hai điện tích điểm $q_1 = ${q1}$ nC và $q_2 = ${q2}$ nC đặt tại hai điểm A, B cách nhau ${d} cm trong chân không. Lấy $k = 9\\cdot 10^9$ N·m²/C². Độ lớn cường độ điện trường tổng hợp tại điểm M cách A ${MA} cm và cách B ${MB} cm xấp xỉ bằng`,
          ...mcq(r, f(E), [f(E1 + E2), f(Math.abs(E1 - E2)), f(E1), f(E2)]),
          explanation: `$MA^2 + MB^2 = ${MA * MA + MB * MB} = AB^2$ nên $\\widehat{AMB} = 90^\\circ$, hai vectơ $\\vec{E}_1 \\perp \\vec{E}_2$. $E_1 = k\\dfrac{|q_1|}{MA^2} = ${tex(E1 * 1000, 0)}$ V/m, $E_2 = k\\dfrac{|q_2|}{MB^2} \\approx ${tex(E2 * 1000, 0)}$ V/m. $E = \\sqrt{E_1^2 + E_2^2} \\approx ${tex(E, 2)}$ kV/m.`,
        };
      }
      let d: number, MA: number, MB: number, E1x: number, E2x: number, desc: string;
      if (mode === "mid") { d = r.pick([4, 6, 8, 10, 12, 20]); MA = MB = d / 2; E1x = (90 * q1) / (MA * MA); E2x = (-90 * q2) / (MB * MB); desc = "là trung điểm của AB"; }
      else { d = r.pick([2, 3, 4, 5, 6, 10]); MB = r.pick([2, 3, 4, 5, 6, 10]); MA = d + MB; E1x = (90 * q1) / (MA * MA); E2x = (90 * q2) / (MB * MB); desc = `nằm trên đường thẳng AB, ngoài đoạn AB về phía B và cách B ${MB} cm`; }
      const e1 = Math.abs(E1x), e2 = Math.abs(E2x), E = Math.abs(E1x + E2x), same = E1x * E2x > 0;
      need(E >= 0.1 && Math.abs(e1 - e2) > 0.05);
      return {
        stem: `Hai điện tích điểm $q_1 = ${q1}$ nC và $q_2 = ${q2}$ nC đặt tại hai điểm A, B cách nhau ${d} cm trong chân không. Lấy $k = 9\\cdot 10^9$ N·m²/C². Độ lớn cường độ điện trường tổng hợp tại điểm M ${desc} xấp xỉ bằng`,
        ...mcq(r, f(E), [f(same ? Math.abs(e1 - e2) : e1 + e2), f(Math.hypot(e1, e2)), f(e1), f(e2)]),
        explanation: `MA = ${MA} cm, MB = ${MB} cm. $E_1 = k\\dfrac{|q_1|}{MA^2} \\approx ${tex(e1, 3)}$ kV/m, $E_2 = k\\dfrac{|q_2|}{MB^2} \\approx ${tex(e2, 3)}$ kV/m (điện tích dương: $\\vec{E}$ hướng ra xa; âm: hướng lại gần). Hai vectơ ${same ? "cùng chiều" : "ngược chiều"} nên $E = ${same ? "E_1 + E_2" : "|E_1 - E_2|"} \\approx ${tex(E, 2)}$ kV/m.`,
      };
    },
  },
  {
    id: "l11k2-dien-truong-deu", subject: S, grade: G, chapter: C3, topic: "Điện trường đều giữa hai bản phẳng: E = U/d",
    hk: 2, half: 1, tk: K3, level: 1, kind: "mcq",
    make: (r) => {
      const U = r.pick([6, 9, 12, 24, 50, 100, 120, 200, 220, 300, 400, 500, 1000]), dcm = r.pick([0.5, 1, 2, 2.5, 4, 5, 10]);
      const d = dcm / 100, E = U / d;
      need(isNice(E, 2));
      const mode = r.pick(["E", "E", "U", "d"]);
      const head = "Hai bản kim loại phẳng, song song, đặt cách nhau";
      if (mode === "E") return { stem: `${head} ${vn(dcm)} cm và được nối với nguồn có hiệu điện thế ${U} V. Cường độ điện trường đều giữa hai bản là`, ...mcq(r, num(E, "V/m"), [num(U * d, "V/m"), num(U / dcm, "V/m"), num(U * dcm, "V/m")]), explanation: `$E = \\dfrac{U}{d} = \\dfrac{${U}}{${tex(d, 3)}} = ${numT(E)}$ V/m.` };
      if (mode === "U") return { stem: `${head} ${vn(dcm)} cm. Cường độ điện trường đều giữa hai bản là ${num(E, "V/m")}. Hiệu điện thế giữa hai bản là`, ...mcq(r, `${U} V`, [num(E / d, "V"), num(E * dcm, "V"), num(E / dcm, "V")]), explanation: `$U = Ed = ${numT(E)}\\cdot ${tex(d, 3)} = ${U}$ V.` };
      return { stem: `Giữa hai bản kim loại phẳng, song song đặt hiệu điện thế ${U} V thì cường độ điện trường đều giữa hai bản là ${num(E, "V/m")}. Khoảng cách giữa hai bản là`, ...mcq(r, `${vn(dcm)} cm`, [`${vn(dcm * 10)} cm`, `${vn(dcm / 10, 3)} cm`, `${vn(dcm * 100)} cm`]), explanation: `$d = \\dfrac{U}{E} = \\dfrac{${U}}{${numT(E)}} = ${tex(d, 3)}$ m $= ${tex(dcm)}$ cm.` };
    },
  },
  {
    id: "l11k2-hat-mang-dien-can-bang", subject: S, grade: G, chapter: C3, topic: "Hạt mang điện cân bằng trong điện trường đều",
    hk: 2, half: 1, tk: K3, level: 3, kind: "mcq",
    make: (r) => {
      const n = r.int(2, 30), U = r.pick([100, 120, 150, 160, 200, 240, 250, 300, 320, 400, 500]), dcm = r.pick([0.5, 1, 2, 4, 5]);
      const q = n * EC, d = dcm / 100, m = (q * U) / (10 * d);
      need(niceSci(m, 2));
      const upPos = r.chance(0.5), sg = upPos ? "-" : "";
      const stem = `Một hạt bụi nhỏ có khối lượng $m = ${sci(m)}$ kg nằm lơ lửng trong khoảng giữa hai bản kim loại phẳng nằm ngang, song song, cách nhau ${vn(dcm)} cm. Hiệu điện thế giữa hai bản là ${U} V, bản phía trên tích điện ${upPos ? "dương" : "âm"}. Lấy $g = 10$ m/s², $e = 1{,}6\\cdot 10^{-19}$ C.`;
      const sol = `Hạt cân bằng: lực điện hướng lên và $|q|\\dfrac{U}{d} = mg \\Rightarrow |q| = \\dfrac{mgd}{U} = \\dfrac{${sci(m)}\\cdot 10\\cdot ${tex(d, 3)}}{${U}} = ${sci(q)}$ C. Bản trên tích điện ${upPos ? "dương nên $\\vec{E}$ hướng xuống, lực điện hướng lên khi hạt mang điện âm" : "âm nên $\\vec{E}$ hướng lên, lực điện hướng lên khi hạt mang điện dương"}.`;
      if (r.chance(0.5)) {
        return { stem: `${stem} Điện tích của hạt bụi là`, ...mcq(r, `$${sg}${sci(q)}$ C`, [`$${upPos ? "" : "-"}${sci(q)}$ C`, `$${sg}${sci(q * 100)}$ C`, `$${sg}${sci((m * 10 * U) / d)}$ C`, `$${sg}${sci((m * 10) / (U * d))}$ C`]), explanation: sol };
      }
      const a = upPos ? "thừa" : "thiếu", b = upPos ? "thiếu" : "thừa";
      return { stem: `${stem} Hạt bụi đang`, ...mcq(r, `${a} ${n} electron`, [`${b} ${n} electron`, `${a} ${n * 100} electron`, `${b} ${n * 100} electron`]), explanation: `${sol} Số electron ${a}: $N = \\dfrac{|q|}{e} = ${n}$.` };
    },
  },
  {
    id: "l11k2-cong-dien-the-ly-thuyet", subject: S, grade: G, chapter: C3, topic: "Công của lực điện, thế năng điện, điện thế (lí thuyết)",
    hk: 2, half: 1, tk: K3, level: 1, kind: "mcq",
    make: (r) => theory(r, [""], [
      { q: "Công của lực điện làm dịch chuyển một điện tích trong điện trường", a: "không phụ thuộc hình dạng đường đi mà chỉ phụ thuộc vị trí điểm đầu và điểm cuối", w: ["phụ thuộc hình dạng đường đi", "chỉ phụ thuộc độ dài quãng đường đi được", "luôn bằng 0"], e: "Lực điện là lực thế: công không phụ thuộc hình dạng đường đi." },
      { q: "Công của lực điện khi điện tích $q$ di chuyển từ M đến N trong điện trường đều $E$ là $A = qEd$, trong đó $d$ là", a: "độ dài đại số của hình chiếu MN lên một đường sức (chiều dương là chiều đường sức)", w: ["độ dài đoạn MN", "độ dài quãng đường điện tích đi được", "khoảng cách từ M đến bản tích điện dương"], e: "$d$ là hình chiếu của độ dời MN lên phương đường sức, lấy chiều đường sức làm chiều dương." },
      { q: "Khi một điện tích di chuyển dọc theo một đường cong kín trong điện trường thì công của lực điện", a: "bằng 0", w: ["luôn dương", "luôn âm", "tỉ lệ với độ dài đường cong"], e: "Điểm đầu trùng điểm cuối nên công của lực điện bằng 0." },
      { q: "Điện thế tại một điểm M trong điện trường đặc trưng cho", a: "điện trường tại M về phương diện tạo ra thế năng khi đặt tại đó một điện tích $q$", w: ["điện trường tại M về phương diện tác dụng lực", "khả năng tích điện của vật dẫn tại M", "tốc độ dịch chuyển của điện tích tại M"], e: "$V_M = \\dfrac{W_M}{q}$ đặc trưng cho điện trường về phương diện tạo thế năng." },
      { q: "Hiệu điện thế giữa hai điểm M, N được xác định bởi", a: "$U_{MN} = V_M - V_N$", w: ["$U_{MN} = V_N - V_M$", "$U_{MN} = V_M + V_N$", "$U_{MN} = \\dfrac{V_M}{V_N}$"], e: "$U_{MN} = V_M - V_N$." },
      { q: "Trong hệ SI, đơn vị của điện thế là", a: "vôn (V)", w: ["vôn trên mét (V/m)", "jun (J)", "culông (C)"], e: "Điện thế và hiệu điện thế có đơn vị vôn (V)." },
      { q: "Hệ thức liên hệ giữa công của lực điện và hiệu điện thế khi điện tích $q$ di chuyển từ M đến N là", a: "$A_{MN} = qU_{MN}$", w: ["$A_{MN} = \\dfrac{U_{MN}}{q}$", "$A_{MN} = \\dfrac{q}{U_{MN}}$", "$A_{MN} = q^2U_{MN}$"], e: "$A_{MN} = W_M - W_N = q(V_M - V_N) = qU_{MN}$." },
      { q: "Thế năng điện của điện tích $q$ đặt tại điểm M có điện thế $V_M$ là", a: "$W_M = qV_M$", w: ["$W_M = \\dfrac{V_M}{q}$", "$W_M = \\dfrac{q}{V_M}$", "$W_M = \\dfrac{1}{2}qV_M^2$"], e: "$V_M = \\dfrac{W_M}{q} \\Rightarrow W_M = qV_M$." },
      { q: "Một điện tích dương di chuyển cùng chiều đường sức của một điện trường đều. Công của lực điện", a: "dương", w: ["âm", "bằng 0", "có dấu phụ thuộc độ dài quãng đường"], e: "Lực điện cùng chiều đường sức và cùng chiều dịch chuyển nên $A = qEd > 0$." },
      { q: "Một electron di chuyển cùng chiều đường sức của một điện trường đều. Công của lực điện", a: "âm", w: ["dương", "bằng 0", "có dấu phụ thuộc độ dài quãng đường"], e: "$q = -e < 0$, $d > 0$ nên $A = qEd < 0$." },
      { q: "Khi điện tích dịch chuyển giữa hai điểm và lực điện sinh công dương thì thế năng điện của điện tích", a: "giảm", w: ["tăng", "không đổi", "bằng 0"], e: "$A_{MN} = W_M - W_N > 0$ nên $W_N < W_M$: thế năng điện giảm." },
    ]),
  },
  {
    id: "l11k2-cong-luc-dien", subject: S, grade: G, chapter: C3, topic: "Tính công của lực điện trong điện trường đều",
    hk: 2, half: 1, tk: K3, level: 2, kind: "mcq",
    make: (r) => {
      const q = r.pick([-1, 1]) * r.pick([1, 2, 3, 4, 5, 8, 10]), E = r.pick([1000, 2000, 3000, 4000, 5000, 10000]), s = r.pick([2, 4, 5, 10, 20]), ang = r.pick([0, 0, 60, 120, 180]);
      const cs = ({ 0: 1, 60: 0.5, 120: -0.5, 180: -1 } as Record<number, number>)[ang];
      const A = q * E * (s / 100) * cs; // μJ
      const u = Math.abs(A) >= 1000 ? 1000 : 1, lab = u === 1000 ? "mJ" : "μJ";
      const f = (x: number) => `${vn(x / u, 4)} ${lab}`;
      const dir = ang === 0 ? "dọc theo một đường sức, cùng chiều đường sức" : ang === 180 ? "dọc theo một đường sức, ngược chiều đường sức" : `theo hướng hợp với chiều đường sức một góc ${ang}°`;
      const dd = (s / 100) * cs;
      return {
        stem: `Một điện tích $q = ${q}$ μC di chuyển một đoạn thẳng dài ${s} cm trong điện trường đều có cường độ ${E} V/m, ${dir}. Công của lực điện thực hiện là`,
        ...mcq(r, f(A), [f(-A), f(A * 100), f(ang === 0 || ang === 180 ? A / 2 : q * E * (s / 100)), f(-q * E * (s / 100) * (ang === 0 || ang === 180 ? 1 : Math.sign(cs)) * 2)]),
        explanation: `$A = qEd$ với $d = s\\cos\\alpha = ${tex(s / 100)}\\cdot\\cos ${ang}^\\circ = ${tex(dd, 3)}$ m. $A = ${q}\\cdot 10^{-6}\\cdot ${E}\\cdot ${par(dd, 3)} = ${numT(A * 1e-6)}$ J $= ${tex(A / u, 4)}$ ${lab}.`,
      };
    },
  },
  {
    id: "l11k2-dien-the-hieu-dien-the", subject: S, grade: G, chapter: C3, topic: "Điện thế, hiệu điện thế và công của lực điện",
    hk: 2, half: 1, tk: K3, level: 2, kind: "mcq",
    make: (r) => {
      const VM = r.int(-12, 30) * 10, VN = r.int(-12, 30) * 10, mode = r.pick(["U", "A", "A", "VN"]);
      need(VM !== VN && VM + VN !== 0 && VM !== 0 && VN !== 0);
      const U = VM - VN;
      if (mode === "U") {
        return { stem: `Điện thế tại hai điểm M, N trong một điện trường lần lượt là $V_M = ${VM}$ V và $V_N = ${VN}$ V. Hiệu điện thế $U_{MN}$ bằng`, ...mcq(r, `${U} V`, [`${-U} V`, `${VM + VN} V`, `${-(VM + VN)} V`]), explanation: `$U_{MN} = V_M - V_N = ${VM} - ${par(VN, 0)} = ${U}$ V.` };
      }
      const q = r.pick([-1, 1]) * r.pick([1, 2, 3, 4, 5]), A = q * U;
      if (mode === "A") {
        return { stem: `Một điện tích $q = ${q}$ μC di chuyển từ điểm M đến điểm N trong điện trường. Biết điện thế tại M và N lần lượt là $V_M = ${VM}$ V, $V_N = ${VN}$ V. Công của lực điện thực hiện là`, ...mcq(r, `${A} μJ`, [`${-A} μJ`, `${q * (VM + VN)} μJ`, `${-q * (VM + VN)} μJ`, `${q * VM} μJ`]), explanation: `$A_{MN} = qU_{MN} = q(V_M - V_N) = ${q}\\cdot 10^{-6}\\cdot ${par(U, 0)} = ${A}\\cdot 10^{-6}$ J $= ${A}$ μJ.` };
      }
      return { stem: `Khi một điện tích $q = ${q}$ μC di chuyển từ điểm M đến điểm N trong điện trường thì lực điện thực hiện công ${A} μJ. Biết điện thế tại M là $V_M = ${VM}$ V. Điện thế tại N là`, ...mcq(r, `${VN} V`, [`${VM + U} V`, `${U} V`, `${-VN} V`, `${-U} V`]), explanation: `$U_{MN} = \\dfrac{A_{MN}}{q} = \\dfrac{${A}}{${q}} = ${U}$ V; $V_N = V_M - U_{MN} = ${VM} - ${par(U, 0)} = ${VN}$ V.` };
    },
  },
  {
    id: "l11k2-tu-dien-ly-thuyet", subject: S, grade: G, chapter: C3, topic: "Tụ điện, điện dung, ghép tụ, năng lượng tụ (lí thuyết)",
    hk: 2, half: 1, tk: K3, level: 1, kind: "mcq",
    make: (r) => theory(r, [""], [
      { q: "Tụ điện là", a: "hệ hai vật dẫn đặt gần nhau và ngăn cách nhau bằng một lớp cách điện", w: ["hệ hai vật dẫn đặt tiếp xúc với nhau", "một vật dẫn được bao bọc bởi một lớp cách điện", "hệ hai vật cách điện đặt gần nhau"], e: "Tụ điện gồm hai vật dẫn (bản tụ) đặt gần nhau, ngăn cách bởi lớp điện môi." },
      { q: "Điện dung của tụ điện là đại lượng đặc trưng cho", a: "khả năng tích điện của tụ điện ở một hiệu điện thế nhất định", w: ["khả năng tạo ra dòng điện của tụ", "khả năng cản trở dòng điện của tụ", "độ bền cách điện của lớp điện môi"], e: "$C = \\dfrac{Q}{U}$ đặc trưng cho khả năng tích điện của tụ." },
      { q: "Trong hệ SI, đơn vị của điện dung là", a: "fara (F)", w: ["culông (C)", "vôn (V)", "ôm (Ω)"], e: "Điện dung có đơn vị fara (F); thường dùng μF, nF, pF." },
      { q: "Công thức định nghĩa điện dung của tụ điện là", a: "$C = \\dfrac{Q}{U}$", w: ["$C = QU$", "$C = \\dfrac{U}{Q}$", "$C = \\dfrac{Q}{U^2}$"], e: "$C = \\dfrac{Q}{U}$." },
      { q: "Điện dung của một tụ điện đã cho", a: "không phụ thuộc vào điện tích và hiệu điện thế giữa hai bản tụ", w: ["tỉ lệ thuận với điện tích của tụ", "tỉ lệ nghịch với hiệu điện thế giữa hai bản tụ", "tỉ lệ thuận với hiệu điện thế giữa hai bản tụ"], e: "Điện dung chỉ phụ thuộc cấu tạo của tụ; $Q$ tỉ lệ với $U$ nên $\\dfrac{Q}{U}$ không đổi." },
      { q: "Ghép nối tiếp các tụ điện $C_1$, $C_2$, …, $C_n$, điện dung tương đương $C_b$ của bộ tụ thỏa mãn", a: "$\\dfrac{1}{C_b} = \\dfrac{1}{C_1} + \\dfrac{1}{C_2} + \\dots + \\dfrac{1}{C_n}$", w: ["$C_b = C_1 + C_2 + \\dots + C_n$", "$C_b = \\dfrac{1}{C_1} + \\dfrac{1}{C_2} + \\dots + \\dfrac{1}{C_n}$", "$\\dfrac{1}{C_b} = C_1 + C_2 + \\dots + C_n$"], e: "Ghép nối tiếp: $\\dfrac{1}{C_b} = \\sum\\dfrac{1}{C_i}$; ghép song song: $C_b = \\sum C_i$." },
      { q: "Ghép song song các tụ điện $C_1$, $C_2$, …, $C_n$, điện dung tương đương $C_b$ của bộ tụ là", a: "$C_b = C_1 + C_2 + \\dots + C_n$", w: ["$\\dfrac{1}{C_b} = \\dfrac{1}{C_1} + \\dfrac{1}{C_2} + \\dots + \\dfrac{1}{C_n}$", "$C_b = C_1C_2\\dots C_n$", "$C_b = \\dfrac{C_1 + C_2 + \\dots + C_n}{n}$"], e: "Ghép song song: $C_b = C_1 + C_2 + \\dots + C_n$." },
      { q: "Năng lượng điện trường của tụ điện có điện dung $C$, hiệu điện thế $U$ là", a: "$W = \\dfrac{1}{2}CU^2$", w: ["$W = CU^2$", "$W = \\dfrac{1}{2}CU$", "$W = \\dfrac{1}{2}C^2U$"], e: "$W = \\dfrac{1}{2}CU^2 = \\dfrac{Q^2}{2C} = \\dfrac{1}{2}QU$." },
      { q: "Trên vỏ một tụ điện có ghi \"20 μF – 200 V\". Số liệu 200 V là", a: "hiệu điện thế giới hạn được phép đặt vào hai bản tụ", w: ["hiệu điện thế tối thiểu để tụ tích được điện", "hiệu điện thế luôn có giữa hai bản tụ", "suất điện động của tụ điện"], e: "Giá trị ghi trên vỏ là hiệu điện thế giới hạn; vượt quá thì lớp điện môi có thể bị đánh thủng." },
      { q: "Khi ghép nối tiếp các tụ điện (ban đầu chưa tích điện) rồi nối vào nguồn thì", a: "điện tích của các tụ bằng nhau", w: ["hiệu điện thế giữa hai bản các tụ bằng nhau", "điện dung của bộ tụ lớn hơn điện dung mỗi tụ", "tụ có điện dung lớn có điện tích lớn hơn"], e: "Ghép nối tiếp: $Q_b = Q_1 = Q_2 = \\dots$, còn $U_b = U_1 + U_2 + \\dots$" },
      { q: "Khi ghép song song các tụ điện rồi nối vào nguồn thì", a: "hiệu điện thế giữa hai bản các tụ bằng nhau", w: ["điện tích của các tụ bằng nhau", "điện dung của bộ tụ nhỏ hơn điện dung mỗi tụ", "tụ có điện dung lớn có hiệu điện thế lớn hơn"], e: "Ghép song song: $U_b = U_1 = U_2 = \\dots$, còn $Q_b = Q_1 + Q_2 + \\dots$" },
    ]),
  },
  {
    id: "l11k2-tu-dien-q-cu", subject: S, grade: G, chapter: C3, topic: "Điện tích, điện dung, hiệu điện thế của tụ điện",
    hk: 2, half: 1, tk: K3, level: 1, kind: "mcq",
    make: (r) => {
      const C = r.pick([1, 2, 2.5, 4, 5, 10, 20, 50, 100]), U = r.pick([5, 6, 9, 10, 12, 20, 24, 50, 100, 110, 220]), Q = C * U;
      const mode = r.pick(["Q", "Q", "C", "U"]);
      const tu = r.pick(["Một tụ điện", "Một tụ điện phẳng", "Một tụ điện trong mạch điện tử"]);
      if (mode === "Q") {
        const inC = r.chance(0.4), f = (x: number) => (inC ? `$${sci(x * 1e-6)}$ C` : num(x, "μC"));
        return { stem: `${tu} có điện dung ${vn(C)} μF được nối vào hai cực của nguồn điện có hiệu điện thế ${U} V. Điện tích của tụ điện là`, ...mcq(r, f(Q), [f(C / U), f(U / C), f(Q / 2), f(2 * Q)]), explanation: `$Q = CU = ${tex(C)}\\cdot 10^{-6}\\cdot ${U} = ${sci(Q * 1e-6)}$ C $= ${tex(Q)}$ μC.` };
      }
      if (mode === "C") return { stem: `${tu} được tích điện đến hiệu điện thế ${U} V thì điện tích của tụ là ${vn(Q)} μC. Điện dung của tụ điện là`, ...mcq(r, `${vn(C)} μF`, [num(Q * U, "μF"), num(U / Q, "μF"), num((2 * Q) / U, "μF")]), explanation: `$C = \\dfrac{Q}{U} = \\dfrac{${tex(Q)}\\cdot 10^{-6}}{${U}} = ${tex(C)}\\cdot 10^{-6}$ F $= ${tex(C)}$ μF.` };
      return { stem: `${tu} có điện dung ${vn(C)} μF, điện tích của tụ là ${vn(Q)} μC. Hiệu điện thế giữa hai bản tụ là`, ...mcq(r, `${U} V`, [num(Q * C, "V"), num(C / Q, "V"), num(U / 2, "V"), num(2 * U, "V")]), explanation: `$U = \\dfrac{Q}{C} = \\dfrac{${tex(Q)}}{${tex(C)}} = ${U}$ V.` };
    },
  },
  {
    id: "l11k2-ghep-tu", subject: S, grade: G, chapter: C3, topic: "Điện dung tương đương của bộ tụ ghép",
    hk: 2, half: 1, tk: K3, level: 2, kind: "mcq",
    make: (r) => {
      const P = [1, 2, 3, 4, 6, 8, 10, 12, 15, 20, 30, 40, 60];
      const C1 = r.pick(P), C2 = r.pick(P), C3v = r.pick(P), mode = r.pick(["nt", "ss", "m1", "m2"]);
      const f = (x: number) => `${vn(x, 2)} μF`;
      let Cb: number, W: number[], desc: string, sol: string;
      if (mode === "nt") { Cb = ser(C1, C2); W = [C1 + C2, (C1 + C2) / 2, C1 * C2, Math.abs(C1 - C2)]; desc = `Hai tụ điện $C_1 = ${C1}$ μF và $C_2 = ${C2}$ μF được ghép nối tiếp.`; sol = `$C_b = \\dfrac{C_1C_2}{C_1 + C_2} = \\dfrac{${C1}\\cdot ${C2}}{${C1} + ${C2}} = ${tex(Cb)}$ μF.`; }
      else if (mode === "ss") { Cb = C1 + C2; W = [ser(C1, C2), (C1 + C2) / 2, C1 * C2]; desc = `Hai tụ điện $C_1 = ${C1}$ μF và $C_2 = ${C2}$ μF được ghép song song.`; sol = `$C_b = C_1 + C_2 = ${Cb}$ μF.`; }
      else if (mode === "m1") { Cb = ser(C1, C2 + C3v); W = [C1 + ser(C2, C3v), C1 + C2 + C3v, ser(ser(C1, C2), C3v), ser(C1, C2) + C3v]; desc = `Bộ tụ gồm tụ $C_1 = ${C1}$ μF ghép nối tiếp với cụm hai tụ $C_2 = ${C2}$ μF và $C_3 = ${C3v}$ μF ghép song song.`; sol = `$C_{23} = C_2 + C_3 = ${C2 + C3v}$ μF; $C_b = \\dfrac{C_1C_{23}}{C_1 + C_{23}} = \\dfrac{${C1}\\cdot ${C2 + C3v}}{${C1 + C2 + C3v}} = ${tex(Cb)}$ μF.`; }
      else { Cb = ser(C1, C2) + C3v; W = [ser(C1 + C2, C3v), C1 + C2 + C3v, ser(ser(C1, C2), C3v), C1 + ser(C2, C3v)]; desc = `Bộ tụ gồm hai tụ $C_1 = ${C1}$ μF và $C_2 = ${C2}$ μF ghép nối tiếp, rồi cả cụm ghép song song với tụ $C_3 = ${C3v}$ μF.`; sol = `$C_{12} = \\dfrac{C_1C_2}{C_1 + C_2} = ${tex(ser(C1, C2))}$ μF; $C_b = C_{12} + C_3 = ${tex(Cb)}$ μF.`; }
      need(isNice(Cb, 2) && W.every((x) => isNice(x, 2) || Math.abs(x - Cb) > 0.02));
      return { stem: `${desc} Điện dung tương đương của bộ tụ là`, ...mcq(r, f(Cb), W.map(f)), explanation: sol };
    },
  },
  {
    id: "l11k2-nang-luong-tu", subject: S, grade: G, chapter: C3, topic: "Năng lượng của tụ điện",
    hk: 2, half: 1, tk: K3, level: 2, kind: "mcq",
    make: (r) => {
      const C = r.pick([1, 2, 4, 5, 10, 20, 50, 100, 200, 500, 1000]), U = r.pick([5, 6, 10, 12, 20, 50, 100, 200]);
      const Cf = C * 1e-6, Q = Cf * U, W = 0.5 * Cf * U * U;
      need(W >= 1e-5 && W <= 100);
      const f = (x: number) => num(x, "J"), mode = r.pick(["CU", "CU", "QC", "U"]);
      if (mode === "CU") return { stem: `Một tụ điện có điện dung ${C} μF được tích điện đến hiệu điện thế ${U} V. Năng lượng điện trường dự trữ trong tụ điện là`, ...mcq(r, f(W), [f(2 * W), f(0.5 * Cf * U), f(0.5 * C * U * U), f(W / 2)]), explanation: `$W = \\dfrac{1}{2}CU^2 = \\dfrac{1}{2}\\cdot ${C}\\cdot 10^{-6}\\cdot ${U}^2 = ${numT(W)}$ J.` };
      if (mode === "QC") return { stem: `Một tụ điện có điện dung ${C} μF đang tích điện tích ${num(Q * 1e6, "μC")}. Năng lượng điện trường của tụ điện là`, ...mcq(r, f(W), [f(2 * W), f((Q * Cf) / 2), f(Q / (2 * Cf)), f(W / 2)]), explanation: `$W = \\dfrac{Q^2}{2C} = \\dfrac{(${numT(Q)})^2}{2\\cdot ${C}\\cdot 10^{-6}} = ${numT(W)}$ J.` };
      return { stem: `Một tụ điện có điện dung ${C} μF dự trữ năng lượng điện trường ${num(W, "J")}. Hiệu điện thế giữa hai bản tụ là`, ...mcq(r, `${U} V`, [num((2 * W) / Cf, "V"), num(round(Math.sqrt(W / Cf), 1), "V"), num(2 * U, "V"), num(U / 2, "V")]), explanation: `$W = \\dfrac{1}{2}CU^2 \\Rightarrow U = \\sqrt{\\dfrac{2W}{C}} = \\sqrt{\\dfrac{2\\cdot ${numT(W)}}{${C}\\cdot 10^{-6}}} = ${U}$ V.` };
    },
  },
  /* ---------- Đúng/Sai half 1 ---------- */
  {
    id: "l11k2-tf-coulomb", subject: S, grade: G, chapter: C3, topic: "Lực tương tác giữa hai điện tích (Đ/S)",
    hk: 2, half: 1, tk: K3, level: 2, kind: "tf",
    make: (r) => {
      const a = r.int(1, 9), b = r.int(1, 9), c = r.pick([3, 5, 6, 10, 15, 20, 30]), F = (90 * a * b) / (c * c);
      need(isNice(F, 3) && F >= 0.01);
      const s1 = r.pick([-1, 1]), s2 = r.pick([-1, 1]), hut = s1 * s2 < 0, n = r.pick([2, 3]), eps = r.pick([2, 4]);
      const st1 = pickTF(r, `Hai điện tích ${hut ? "hút" : "đẩy"} nhau.`, `Hai điện tích ${hut ? "đẩy" : "hút"} nhau.`);
      const st2 = pickTF(r, `Lực tương tác giữa hai điện tích có độ lớn ${num(F, "N")}.`, `Lực tương tác giữa hai điện tích có độ lớn ${num((0.9 * a * b) / c, "N")}.`);
      const st3 = pickTF(r, `Nếu tăng khoảng cách giữa hai điện tích lên ${n} lần thì độ lớn lực tương tác giảm ${n * n} lần.`, `Nếu tăng khoảng cách giữa hai điện tích lên ${n} lần thì độ lớn lực tương tác giảm ${n} lần.`);
      const st4 = pickTF(r, `Nếu đặt hai điện tích trong điện môi có hằng số điện môi $\\varepsilon = ${eps}$ và giữ nguyên khoảng cách thì lực tương tác có độ lớn ${num(F / eps, "N")}.`, `Nếu đặt hai điện tích trong điện môi có hằng số điện môi $\\varepsilon = ${eps}$ và giữ nguyên khoảng cách thì lực tương tác có độ lớn ${num(F * eps, "N")}.`);
      return {
        stem: `Hai điện tích điểm $q_1 = ${s1 * a}$ μC và $q_2 = ${s2 * b}$ μC đặt cách nhau ${c} cm trong chân không. Lấy $k = 9\\cdot 10^9$ N·m²/C².`,
        ...tf([st1, st2, st3, st4]),
        explanation: `${DS(st1[1])}: hai điện tích ${hut ? "trái dấu nên hút nhau" : "cùng dấu nên đẩy nhau"}. ${DS(st2[1])}: $F = k\\dfrac{|q_1q_2|}{r^2} = 9\\cdot 10^9\\cdot\\dfrac{${a * b}\\cdot 10^{-12}}{${tex(c / 100)}^2} = ${numT(F)}$ N. ${DS(st3[1])}: $F \\sim \\dfrac{1}{r^2}$ nên $r$ tăng ${n} lần thì $F$ giảm ${n * n} lần. ${DS(st4[1])}: trong điện môi $F' = \\dfrac{F}{\\varepsilon} = ${numT(F / eps)}$ N.`,
      };
    },
  },
  {
    id: "l11k2-tf-dien-truong-deu", subject: S, grade: G, chapter: C3, topic: "Electron trong điện trường đều (Đ/S)",
    hk: 2, half: 1, tk: K3, level: 2, kind: "tf",
    make: (r) => {
      const U = r.pick([50, 100, 120, 200, 240, 300, 400, 500]), dcm = r.pick([1, 2, 4, 5, 10]), E = U / (dcm / 100), F = EC * E, A = EC * U;
      need(niceSci(F, 2) && niceSci(A, 2));
      const st1 = pickTF(r, `Cường độ điện trường giữa hai bản là ${num(E, "V/m")}.`, `Cường độ điện trường giữa hai bản là ${num(U / dcm, "V/m")}.`);
      const st2 = pickTF(r, `Lực điện tác dụng lên electron có độ lớn $${sci(F)}$ N.`, `Lực điện tác dụng lên electron có độ lớn $${sci(EC * U)}$ N.`);
      const st3 = pickTF(r, `Lực điện tác dụng lên electron hướng về phía bản tích điện dương.`, `Lực điện tác dụng lên electron cùng chiều với đường sức điện.`);
      const st4 = pickTF(r, `Khi electron di chuyển từ bản âm đến bản dương, lực điện sinh công dương bằng $${sci(A)}$ J.`, `Khi electron di chuyển từ bản âm đến bản dương, lực điện sinh công âm bằng $-${sci(A)}$ J.`);
      return {
        stem: `Hai bản kim loại phẳng, song song, đặt cách nhau ${dcm} cm được nối với nguồn có hiệu điện thế ${U} V. Một electron ($-e = -1{,}6\\cdot 10^{-19}$ C) ở trong khoảng giữa hai bản. Bỏ qua trọng lực.`,
        ...tf([st1, st2, st3, st4]),
        explanation: `${DS(st1[1])}: $E = \\dfrac{U}{d} = \\dfrac{${U}}{${tex(dcm / 100)}} = ${numT(E)}$ V/m. ${DS(st2[1])}: $F = eE = 1{,}6\\cdot 10^{-19}\\cdot ${numT(E)} = ${sci(F)}$ N. ${DS(st3[1])}: electron mang điện âm nên lực điện ngược chiều đường sức, tức hướng về bản dương. ${DS(st4[1])}: $A = qU_{(-)(+)} = (-e)(-U) = eU = ${sci(A)}$ J $> 0$.`,
      };
    },
  },
  {
    id: "l11k2-tf-tu-dien", subject: S, grade: G, chapter: C3, topic: "Tụ điện: điện tích, năng lượng, ghép tụ (Đ/S)",
    hk: 2, half: 1, tk: K3, level: 3, kind: "tf",
    make: (r) => {
      const C = r.pick([2, 4, 5, 10, 20, 50, 100]), U = r.pick([6, 10, 12, 20, 50, 100, 200]), Q = C * U, W = 0.5 * C * 1e-6 * U * U;
      const ser2 = r.chance(0.5);
      const st1 = pickTF(r, `Điện tích của tụ điện là ${num(Q, "μC")}.`, `Điện tích của tụ điện là ${num(2 * Q, "μC")}.`);
      const st2 = pickTF(r, `Năng lượng điện trường dự trữ trong tụ là ${num(W, "J")}.`, `Năng lượng điện trường dự trữ trong tụ là ${num(2 * W, "J")}.`);
      const st3 = pickTF(r, `Nếu tăng hiệu điện thế của nguồn lên gấp đôi thì năng lượng của tụ tăng 4 lần.`, `Nếu tăng hiệu điện thế của nguồn lên gấp đôi thì năng lượng của tụ tăng 2 lần.`);
      const right4 = ser2 ? Q / 2 : 2 * Q, wrong4 = ser2 ? 2 * Q : Q / 2;
      const txt4 = ser2 ? "ghép nối tiếp tụ này với một tụ điện giống hệt nó (chưa tích điện) rồi nối bộ tụ vào nguồn trên thì điện tích của bộ tụ" : "ghép song song tụ này với một tụ điện giống hệt nó rồi nối bộ tụ vào nguồn trên thì điện tích của bộ tụ";
      const st4 = pickTF(r, `Nếu ${txt4} là ${num(right4, "μC")}.`, `Nếu ${txt4} là ${num(wrong4, "μC")}.`);
      return {
        stem: `Một tụ điện có điện dung ${C} μF được nối vào hai cực của nguồn điện có hiệu điện thế ${U} V.`,
        ...tf([st1, st2, st3, st4]),
        explanation: `${DS(st1[1])}: $Q = CU = ${C}\\cdot ${U} = ${Q}$ μC. ${DS(st2[1])}: $W = \\dfrac{1}{2}CU^2 = \\dfrac{1}{2}\\cdot ${C}\\cdot 10^{-6}\\cdot ${U}^2 = ${numT(W)}$ J. ${DS(st3[1])}: $W \\sim U^2$ nên $U$ tăng 2 lần thì $W$ tăng 4 lần. ${DS(st4[1])}: ${ser2 ? `$C_b = \\dfrac{C}{2} = ${tex(C / 2)}$ μF` : `$C_b = 2C = ${2 * C}$ μF`}, $Q_b = C_bU = ${tex(right4)}$ μC.`,
      };
    },
  },
  {
    id: "l11k2-tf-dien-truong-diem", subject: S, grade: G, chapter: C3, topic: "Điện trường của điện tích điểm (Đ/S)",
    hk: 2, half: 1, tk: K3, level: 3, kind: "tf",
    make: (r) => {
      const a = r.int(1, 9), sg = r.pick([-1, 1]), c = r.pick([1, 2, 3, 5, 6, 10, 15, 30]), E = (9e4 * a) / (c * c);
      need(isNice(E, 2) && E >= 10);
      const b = r.int(1, 5), sb = r.pick([-1, 1]), F = b * 1e-9 * E;
      need(niceSci(F, 2) && niceSci(E / 4, 2));
      const st1 = pickTF(r, `Cường độ điện trường tại M có độ lớn ${num(E, "V/m")}.`, `Cường độ điện trường tại M có độ lớn ${num((900 * a) / c, "V/m")}.`);
      const st2 = pickTF(r, `Vectơ cường độ điện trường tại M hướng ${sg > 0 ? "ra xa" : "về phía"} điện tích $Q$.`, `Vectơ cường độ điện trường tại M hướng ${sg > 0 ? "về phía" : "ra xa"} điện tích $Q$.`);
      const st3 = pickTF(r, `Tại điểm N cách $Q$ một khoảng ${2 * c} cm, cường độ điện trường có độ lớn ${num(E / 4, "V/m")}.`, `Tại điểm N cách $Q$ một khoảng ${2 * c} cm, cường độ điện trường có độ lớn ${num(E / 2, "V/m")}.`);
      const sameDir = sg * sb > 0;
      const st4 = pickTF(r, `Đặt tại M điện tích $q = ${sb * b}$ nC thì lực điện tác dụng lên $q$ có độ lớn $${sci(F)}$ N và ${sameDir ? "hướng ra xa" : "hướng về phía"} $Q$.`, `Đặt tại M điện tích $q = ${sb * b}$ nC thì lực điện tác dụng lên $q$ có độ lớn $${sci(F)}$ N và ${sameDir ? "hướng về phía" : "hướng ra xa"} $Q$.`);
      return {
        stem: `Một điện tích điểm $Q = ${sg * a}$ nC đặt tại điểm O trong chân không. Điểm M cách O một khoảng ${c} cm. Lấy $k = 9\\cdot 10^9$ N·m²/C².`,
        ...tf([st1, st2, st3, st4]),
        explanation: `${DS(st1[1])}: $E_M = k\\dfrac{|Q|}{r^2} = 9\\cdot 10^9\\cdot\\dfrac{${a}\\cdot 10^{-9}}{${tex(c / 100)}^2} = ${numT(E)}$ V/m. ${DS(st2[1])}: $Q ${sg > 0 ? "> 0" : "< 0"}$ nên $\\vec{E}$ hướng ${sg > 0 ? "ra xa" : "về phía"} $Q$. ${DS(st3[1])}: $E \\sim \\dfrac{1}{r^2}$, khoảng cách gấp đôi thì $E$ giảm 4 lần: $${numT(E / 4)}$ V/m. ${DS(st4[1])}: $F = |q|E = ${b}\\cdot 10^{-9}\\cdot ${numT(E)} = ${sci(F)}$ N; $Q$ và $q$ ${sameDir ? "cùng dấu nên đẩy nhau" : "trái dấu nên hút nhau"}.`,
      };
    },
  },
  /* ---------- Trả lời ngắn half 1 ---------- */
  {
    id: "l11k2-s-coulomb", subject: S, grade: G, chapter: C3, topic: "Định luật Coulomb (trả lời ngắn)",
    hk: 2, half: 1, tk: K3, level: 2, kind: "short",
    make: (r) => {
      const a = r.int(1, 9), b = r.int(1, 9), c = r.pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30]), F = (90 * a * b) / (c * c);
      need(F >= 0.05);
      if (r.chance(0.55)) {
        const ft = fit(F);
        return { stem: `Hai điện tích điểm $q_1 = ${a}$ μC và $q_2 = -${b}$ μC đặt cách nhau ${c} cm trong chân không. Lấy $k = 9\\cdot 10^9$ N·m²/C². Độ lớn lực tương tác giữa hai điện tích là bao nhiêu niutơn${ft.note}?`, ...short(ft.v, ft.dp), explanation: `$F = k\\dfrac{|q_1q_2|}{r^2} = 9\\cdot 10^9\\cdot\\dfrac{${a * b}\\cdot 10^{-12}}{${tex(c / 100)}^2} \\approx ${tex(F, 4)}$ N.` };
      }
      need(isNice(F, 3));
      return { stem: `Hai điện tích điểm $q_1 = ${a}$ μC và $q_2 = ${b}$ μC đặt trong chân không đẩy nhau bằng một lực có độ lớn ${num(F, "N")}. Lấy $k = 9\\cdot 10^9$ N·m²/C². Khoảng cách giữa hai điện tích là bao nhiêu xentimét?`, ...short(c, 0), explanation: `$r = \\sqrt{\\dfrac{k|q_1q_2|}{F}} = \\sqrt{\\dfrac{9\\cdot 10^9\\cdot ${a * b}\\cdot 10^{-12}}{${numT(F)}}} = ${tex(c / 100)}$ m $= ${c}$ cm.` };
    },
  },
  {
    id: "l11k2-s-cong-dien", subject: S, grade: G, chapter: C3, topic: "Công của lực điện (trả lời ngắn)",
    hk: 2, half: 1, tk: K3, level: 2, kind: "short",
    make: (r) => {
      const q = r.pick([-1, 1]) * r.pick([1, 2, 3, 4, 5, 6, 8]);
      if (r.chance(0.5)) {
        const VM = r.int(-10, 30) * 10, VN = r.int(-10, 30) * 10, U = VM - VN, A = q * U;
        need(U !== 0 && String(A).length <= 4);
        return { stem: `Một điện tích $q = ${q}$ μC di chuyển từ điểm M có điện thế ${VM} V đến điểm N có điện thế ${VN} V. Công của lực điện thực hiện là bao nhiêu μJ?`, ...short(A, 0), explanation: `$A_{MN} = q(V_M - V_N) = ${q}\\cdot 10^{-6}\\cdot ${par(U, 0)} = ${A}\\cdot 10^{-6}$ J $= ${A}$ μJ.` };
      }
      const E = r.pick([500, 1000, 1500, 2000, 2500, 4000, 5000]), s = r.pick([2, 3, 4, 5, 6, 8, 10]), cs = r.pick([1, -1, 0.5, -0.5]);
      const ang = cs === 1 ? 0 : cs === -1 ? 180 : cs === 0.5 ? 60 : 120, A = q * E * (s / 100) * cs;
      need(isNice(A, 1) && vn(A, 1).length <= 4);
      return { stem: `Một điện tích $q = ${q}$ μC di chuyển một đoạn thẳng dài ${s} cm trong điện trường đều có cường độ ${E} V/m theo hướng hợp với chiều đường sức một góc ${ang}°. Công của lực điện thực hiện là bao nhiêu μJ?`, ...short(A, 1), explanation: `$A = qEs\\cos\\alpha = ${q}\\cdot 10^{-6}\\cdot ${E}\\cdot ${tex(s / 100)}\\cdot ${par(cs, 1)} = ${tex(A, 1)}\\cdot 10^{-6}$ J $= ${tex(A, 1)}$ μJ.` };
    },
  },
  {
    id: "l11k2-s-tu-ghep", subject: S, grade: G, chapter: C3, topic: "Bộ tụ ghép hỗn hợp (trả lời ngắn)",
    hk: 2, half: 1, tk: K3, level: 3, kind: "short",
    make: (r) => {
      const P = [1, 2, 3, 4, 6, 8, 10, 12];
      const C1 = r.pick(P), C2 = r.pick(P), C3v = r.pick(P), U = r.pick([6, 9, 10, 12, 18, 20, 24, 30, 36, 48, 60]);
      const C23 = C2 + C3v, Cb = ser(C1, C23), Q = Cb * U, U1 = Q / C1, U23 = Q / C23, Wm = (0.5 * Cb * U * U) / 1000;
      need(isNice(Cb, 2) && isNice(Q, 2));
      const ask = r.pick(["Cb", "Q", "U1", "U23", "W"]);
      const [val, txt] = ({ Cb: [Cb, "Điện dung tương đương của bộ tụ là bao nhiêu μF"], Q: [Q, "Điện tích của tụ $C_1$ là bao nhiêu μC"], U1: [U1, "Hiệu điện thế giữa hai bản tụ $C_1$ là bao nhiêu vôn"], U23: [U23, "Hiệu điện thế giữa hai bản tụ $C_2$ là bao nhiêu vôn"], W: [Wm, "Năng lượng của bộ tụ là bao nhiêu mJ"] } as Record<string, [number, string]>)[ask];
      const ft = fit(val);
      return {
        stem: `Cho bộ tụ gồm tụ $C_1 = ${C1}$ μF ghép nối tiếp với cụm hai tụ $C_2 = ${C2}$ μF và $C_3 = ${C3v}$ μF ghép song song. Đặt vào hai đầu bộ tụ hiệu điện thế ${U} V. ${txt}${ft.note}?`,
        ...short(ft.v, ft.dp),
        explanation: `$C_{23} = C_2 + C_3 = ${C23}$ μF; $C_b = \\dfrac{C_1C_{23}}{C_1 + C_{23}} = ${tex(Cb)}$ μF. $Q_b = Q_1 = Q_{23} = C_bU = ${tex(Q)}$ μC; $U_1 = \\dfrac{Q_1}{C_1} \\approx ${tex(U1, 3)}$ V; $U_2 = U_3 = \\dfrac{Q_{23}}{C_{23}} \\approx ${tex(U23, 3)}$ V; $W = \\dfrac{1}{2}C_bU^2 \\approx ${tex(Wm, 4)}$ mJ.`,
      };
    },
  },
  {
    id: "l11k2-s-electron-tang-toc", subject: S, grade: G, chapter: C3, topic: "Electron được tăng tốc bởi điện trường (trả lời ngắn)",
    hk: 2, half: 1, tk: K3, level: 3, kind: "short",
    make: (r) => {
      if (r.chance(0.6)) {
        const U = r.pick([10, 20, 25, 40, 50, 75, 80, 100, 120, 150, 200, 250, 300, 400, 500]), v = Math.sqrt((2 * EC * U) / ME) / 1e6;
        return { stem: `Một electron (khối lượng $9{,}1\\cdot 10^{-31}$ kg, điện tích $-1{,}6\\cdot 10^{-19}$ C) bắt đầu chuyển động từ trạng thái nghỉ, được tăng tốc bởi điện trường giữa hai điểm có hiệu điện thế ${U} V. Bỏ qua trọng lực. Tốc độ của electron sau khi được tăng tốc là $v = x\\cdot 10^6$ m/s. Giá trị của $x$ là bao nhiêu (làm tròn kết quả đến hàng phần mười)?`, ...short(round(v, 1), 1), explanation: `Định lí động năng: $\\dfrac{1}{2}mv^2 = |q|U \\Rightarrow v = \\sqrt{\\dfrac{2eU}{m}} = \\sqrt{\\dfrac{2\\cdot 1{,}6\\cdot 10^{-19}\\cdot ${U}}{9{,}1\\cdot 10^{-31}}} \\approx ${tex(v, 3)}\\cdot 10^6$ m/s.` };
      }
      const a = r.int(1, 9), U = (ME * (a * 1e6) ** 2) / (2 * EC), dp = U >= 100 ? 0 : 1;
      return { stem: `Một electron (khối lượng $9{,}1\\cdot 10^{-31}$ kg, điện tích $-1{,}6\\cdot 10^{-19}$ C) bắt đầu chuyển động từ trạng thái nghỉ, được tăng tốc bởi điện trường và đạt tốc độ $${a}\\cdot 10^6$ m/s. Bỏ qua trọng lực. Hiệu điện thế đã tăng tốc electron là bao nhiêu vôn (làm tròn kết quả đến hàng ${dp ? "phần mười" : "đơn vị"})?`, ...short(round(U, dp), dp), explanation: `$eU = \\dfrac{1}{2}mv^2 \\Rightarrow U = \\dfrac{mv^2}{2e} = \\dfrac{9{,}1\\cdot 10^{-31}\\cdot (${a}\\cdot 10^6)^2}{2\\cdot 1{,}6\\cdot 10^{-19}} \\approx ${tex(U, 2)}$ V.` };
    },
  },
];

/* ============================ HALF 2 – DÒNG ĐIỆN, MẠCH ĐIỆN ============================ */
const H2: Template[] = [
  {
    id: "l11k2-dong-dien-ly-thuyet", subject: S, grade: G, chapter: C4, topic: "Dòng điện, cường độ dòng điện (lí thuyết)",
    hk: 2, half: 2, tk: K4, level: 1, kind: "mcq",
    make: (r) => theory(r, [""], [
      { q: "Dòng điện là", a: "dòng chuyển dời có hướng của các hạt mang điện", w: ["dòng chuyển động hỗn loạn của các hạt mang điện", "dòng chuyển dời có hướng của các nguyên tử trung hòa", "dòng chuyển động nhiệt của các phân tử"], e: "Dòng điện là dòng chuyển dời có hướng của các hạt mang điện (hạt tải điện)." },
      { q: "Chiều quy ước của dòng điện là", a: "chiều dịch chuyển có hướng của các điện tích dương", w: ["chiều dịch chuyển có hướng của các electron", "chiều dịch chuyển của các ion âm", "chiều từ cực âm sang cực dương ở mạch ngoài"], e: "Quy ước: chiều dòng điện là chiều chuyển động của điện tích dương (ngược chiều chuyển động của electron)." },
      { q: "Cường độ dòng điện được xác định bằng", a: "thương số giữa điện lượng dịch chuyển qua tiết diện thẳng của vật dẫn và khoảng thời gian dịch chuyển", w: ["tích của điện lượng dịch chuyển qua tiết diện thẳng và thời gian dịch chuyển", "thương số giữa thời gian dịch chuyển và điện lượng dịch chuyển", "điện lượng dịch chuyển qua vật dẫn trong một phút"], e: "$I = \\dfrac{\\Delta q}{\\Delta t}$." },
      { q: "Trong hệ SI, đơn vị của cường độ dòng điện là", a: "ampe (A)", w: ["vôn (V)", "culông (C)", "oát (W)"], e: "Cường độ dòng điện có đơn vị ampe (A); $1$ A $= 1$ C/s." },
      { q: "Để đo cường độ dòng điện chạy qua một bóng đèn, người ta dùng", a: "ampe kế mắc nối tiếp với bóng đèn", w: ["ampe kế mắc song song với bóng đèn", "vôn kế mắc nối tiếp với bóng đèn", "vôn kế mắc song song với bóng đèn"], e: "Ampe kế được mắc nối tiếp với đoạn mạch cần đo cường độ dòng điện." },
      { q: "Hạt tải điện trong kim loại là", a: "electron tự do", w: ["ion dương", "ion âm", "proton"], e: "Trong kim loại, dòng điện là dòng chuyển dời có hướng của các electron tự do." },
      { q: "Dòng điện không đổi là dòng điện có", a: "chiều và cường độ không thay đổi theo thời gian", w: ["chiều không đổi, cường độ thay đổi theo thời gian", "cường độ không đổi, chiều thay đổi theo thời gian", "chiều và cường độ thay đổi tuần hoàn theo thời gian"], e: "Dòng điện không đổi có cả chiều và cường độ không đổi theo thời gian." },
      { q: "Cường độ dòng điện chạy trong dây dẫn có tiết diện $S$, mật độ hạt tải điện $n$, mỗi hạt có điện tích $e$ và tốc độ dịch chuyển có hướng $v$ là", a: "$I = Snve$", w: ["$I = \\dfrac{nve}{S}$", "$I = \\dfrac{Sne}{v}$", "$I = Snv$"], e: "Trong thời gian $\\Delta t$ số hạt qua tiết diện là $nSv\\Delta t$ nên $I = Snve$." },
      { q: "Điện lượng chuyển qua tiết diện thẳng của dây dẫn có dòng điện không đổi $I$ chạy qua trong thời gian $t$ là", a: "$q = It$", w: ["$q = \\dfrac{I}{t}$", "$q = \\dfrac{t}{I}$", "$q = I^2t$"], e: "$I = \\dfrac{q}{t} \\Rightarrow q = It$." },
      { q: "Dòng điện chạy qua một dây dẫn kim loại có chiều", a: "ngược với chiều chuyển động của các electron tự do", w: ["cùng chiều chuyển động của các electron tự do", "vuông góc với chiều chuyển động của electron", "cùng chiều chuyển động nhiệt hỗn loạn của electron"], e: "Electron mang điện âm nên chiều dòng điện ngược chiều chuyển động có hướng của electron." },
    ]),
  },
  {
    id: "l11k2-cuong-do-dong-dien", subject: S, grade: G, chapter: C4, topic: "Tính cường độ dòng điện, điện lượng, số electron",
    hk: 2, half: 2, tk: K4, level: 1, kind: "mcq",
    make: (r) => {
      const mode = r.pick(["I", "q", "N"]);
      if (mode === "I") {
        const I = r.pick([0.2, 0.25, 0.4, 0.5, 0.8, 1, 1.2, 1.5, 2, 2.5, 3, 4, 5]), t = r.pick([2, 4, 5, 10, 20, 30, 60]), q = I * t;
        return { stem: `Trong khoảng thời gian ${t} s có một điện lượng ${vn(q)} C dịch chuyển qua tiết diện thẳng của một dây dẫn. Cường độ dòng điện chạy qua dây dẫn là`, ...mcq(r, num(I, "A"), [num(q * t, "A"), num(t / q, "A"), num(q, "A"), num(I * 1000, "A")]), explanation: `$I = \\dfrac{\\Delta q}{\\Delta t} = \\dfrac{${tex(q)}}{${t}} = ${tex(I)}$ A.` };
      }
      if (mode === "q") {
        const I = r.pick([0.2, 0.5, 0.8, 1, 1.5, 2, 2.5, 3]), tm = r.pick([1, 2, 5, 10, 15, 30]), q = I * 60 * tm;
        return { stem: `Một dòng điện không đổi có cường độ ${vn(I)} A chạy qua một dây dẫn. Điện lượng chuyển qua tiết diện thẳng của dây dẫn trong ${tm} phút là`, ...mcq(r, num(q, "C"), [num(I * tm, "C"), num(I / (60 * tm), "C"), num(q * 60, "C"), num((60 * tm) / I, "C")]), explanation: `$t = ${tm}$ phút $= ${60 * tm}$ s; $q = It = ${tex(I)}\\cdot ${60 * tm} = ${tex(q)}$ C.` };
      }
      const I = r.pick([0.16, 0.32, 0.4, 0.8, 1.6, 2, 3.2, 4, 0.48, 0.64]), t = r.pick([1, 2, 5, 10, 20, 60]), N = (I * t) / EC;
      need(niceSci(N, 2));
      return { stem: `Một dòng điện không đổi có cường độ ${vn(I)} A chạy qua một dây dẫn kim loại. Biết điện tích electron có độ lớn $1{,}6\\cdot 10^{-19}$ C. Số electron dịch chuyển qua tiết diện thẳng của dây trong ${t} s là`, ...mcq(r, `$${sci(N)}$`, [`$${sci(I * t * EC)}$`, `$${sci(I / EC)}$`, `$${sci(N * 10)}$`, `$${sci(N / 10)}$`].filter((x) => x !== `$${sci(N)}$`)), explanation: `$N = \\dfrac{q}{e} = \\dfrac{It}{e} = \\dfrac{${tex(I)}\\cdot ${t}}{1{,}6\\cdot 10^{-19}} = ${sci(N)}$.` };
    },
  },
  {
    id: "l11k2-dien-tro-ly-thuyet", subject: S, grade: G, chapter: C4, topic: "Điện trở, định luật Ohm, đặc tuyến I–U (lí thuyết)",
    hk: 2, half: 2, tk: K4, level: 1, kind: "mcq",
    make: (r) => theory(r, [""], [
      { q: "Điện trở của một vật dẫn là đại lượng đặc trưng cho", a: "mức độ cản trở dòng điện của vật dẫn", w: ["khả năng tích điện của vật dẫn", "khả năng thực hiện công của nguồn điện", "mức độ nhanh hay chậm của dòng điện"], e: "Điện trở đặc trưng cho mức độ cản trở dòng điện của vật dẫn, $R = \\dfrac{U}{I}$." },
      { q: "Trong hệ SI, đơn vị của điện trở là", a: "ôm (Ω)", w: ["vôn (V)", "ampe (A)", "fara (F)"], e: "Điện trở có đơn vị ôm (Ω); $1$ Ω $= 1$ V/A." },
      { q: "Định luật Ohm đối với đoạn mạch chỉ có điện trở $R$ là", a: "$I = \\dfrac{U}{R}$", w: ["$I = UR$", "$I = \\dfrac{R}{U}$", "$U = \\dfrac{I}{R}$"], e: "Cường độ dòng điện tỉ lệ thuận với hiệu điện thế và tỉ lệ nghịch với điện trở: $I = \\dfrac{U}{R}$." },
      { q: "Điện trở của một dây dẫn kim loại hình trụ đồng chất có chiều dài $\\ell$, tiết diện $S$, điện trở suất $\\rho$ là", a: "$R = \\rho\\dfrac{\\ell}{S}$", w: ["$R = \\rho\\dfrac{S}{\\ell}$", "$R = \\dfrac{\\ell S}{\\rho}$", "$R = \\rho\\ell S$"], e: "$R = \\rho\\dfrac{\\ell}{S}$: tỉ lệ thuận với chiều dài, tỉ lệ nghịch với tiết diện." },
      { q: "Khi nhiệt độ tăng, điện trở của dây dẫn kim loại", a: "tăng", w: ["giảm", "không thay đổi", "giảm đến 0"], e: "Nhiệt độ tăng, các ion dao động mạnh hơn, cản trở chuyển động của electron nhiều hơn nên điện trở kim loại tăng." },
      { q: "Ở nhiệt độ không đổi, đường đặc trưng vôn – ampe ($I$ theo $U$) của một vật dẫn tuân theo định luật Ohm là", a: "một đoạn thẳng đi qua gốc tọa độ", w: ["một đường cong parabol", "một đường thẳng song song với trục hoành", "một đường hypebol"], e: "$I = \\dfrac{U}{R}$ với $R$ không đổi nên $I$ tỉ lệ thuận với $U$: đường thẳng qua gốc tọa độ." },
      { q: "Đường đặc trưng vôn – ampe của bóng đèn sợi đốt không phải là đường thẳng vì", a: "điện trở của dây tóc tăng khi nhiệt độ của nó tăng", w: ["điện trở của dây tóc giảm khi nhiệt độ của nó tăng", "dây tóc bóng đèn không có điện trở", "hiệu điện thế giữa hai đầu đèn luôn không đổi"], e: "Dòng điện càng lớn, dây tóc càng nóng, điện trở càng tăng nên $I$ không tỉ lệ thuận với $U$." },
      { q: "Điện trở nhiệt loại NTC có đặc điểm", a: "điện trở giảm khi nhiệt độ tăng", w: ["điện trở tăng khi nhiệt độ tăng", "điện trở không phụ thuộc nhiệt độ", "điện trở chỉ phụ thuộc cường độ ánh sáng"], e: "NTC (hệ số nhiệt điện trở âm): nhiệt độ tăng thì điện trở giảm; PTC thì ngược lại." },
      { q: "Điện trở suất $\\rho$ của một vật liệu phụ thuộc vào", a: "bản chất của vật liệu và nhiệt độ", w: ["chiều dài của dây dẫn", "tiết diện của dây dẫn", "hiệu điện thế đặt vào hai đầu dây"], e: "$\\rho$ đặc trưng cho vật liệu, phụ thuộc bản chất và nhiệt độ, không phụ thuộc kích thước dây." },
      { q: "Ghép nối tiếp hai điện trở $R_1$ và $R_2$, điện trở tương đương của đoạn mạch là", a: "$R = R_1 + R_2$", w: ["$R = \\dfrac{R_1R_2}{R_1 + R_2}$", "$\\dfrac{1}{R} = R_1 + R_2$", "$R = R_1R_2$"], e: "Nối tiếp: $R = R_1 + R_2$; song song: $\\dfrac{1}{R} = \\dfrac{1}{R_1} + \\dfrac{1}{R_2}$." },
      { q: "Ghép song song hai điện trở $R_1$ và $R_2$, điện trở tương đương $R$ của đoạn mạch thỏa mãn", a: "$\\dfrac{1}{R} = \\dfrac{1}{R_1} + \\dfrac{1}{R_2}$", w: ["$R = R_1 + R_2$", "$\\dfrac{1}{R} = R_1 + R_2$", "$R = \\dfrac{R_1 + R_2}{R_1R_2}$"], e: "Song song: $\\dfrac{1}{R} = \\dfrac{1}{R_1} + \\dfrac{1}{R_2}$, tức $R = \\dfrac{R_1R_2}{R_1 + R_2}$." },
    ]),
  },
  {
    id: "l11k2-dinh-luat-ohm", subject: S, grade: G, chapter: C4, topic: "Định luật Ohm cho đoạn mạch chỉ có điện trở",
    hk: 2, half: 2, tk: K4, level: 1, kind: "mcq",
    make: (r) => {
      const I = r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75, 0.8, 1, 1.2, 1.5, 2, 2.5, 3]), R = r.pick([2, 4, 5, 6, 8, 10, 12, 15, 20, 24, 30, 40, 50, 60, 100]), U = I * R;
      need(isNice(U, 2) && U <= 240 && U >= 1);
      const mode = r.pick(["I", "U", "R", "tl"]), dt = r.pick(["một dây dẫn", "một vật dẫn", "một đoạn dây kim loại"]);
      if (mode === "I") return { stem: `Đặt hiệu điện thế ${vn(U)} V vào hai đầu ${dt} có điện trở ${R} Ω. Cường độ dòng điện chạy qua là`, ...mcq(r, num(I, "A"), [num(U * R, "A"), num(R / U, "A"), num(I * 2, "A")]), explanation: `$I = \\dfrac{U}{R} = \\dfrac{${tex(U)}}{${R}} = ${tex(I)}$ A.` };
      if (mode === "U") return { stem: `Cho dòng điện có cường độ ${vn(I)} A chạy qua ${dt} có điện trở ${R} Ω. Hiệu điện thế giữa hai đầu ${dt.replace("một ", "")} là`, ...mcq(r, num(U, "V"), [num(I / R, "V"), num(R / I, "V"), num(I * I * R, "V")]), explanation: `$U = IR = ${tex(I)}\\cdot ${R} = ${tex(U)}$ V.` };
      if (mode === "R") return { stem: `Đặt hiệu điện thế ${vn(U)} V vào hai đầu ${dt} thì cường độ dòng điện chạy qua là ${vn(I)} A. Điện trở của ${dt.replace("một ", "")} là`, ...mcq(r, `${R} Ω`, [num(U * I, "Ω"), num(I / U, "Ω"), num(R / 2, "Ω"), num(2 * R, "Ω")]), explanation: `$R = \\dfrac{U}{I} = \\dfrac{${tex(U)}}{${tex(I)}} = ${R}$ Ω.` };
      const k = r.pick([2, 3, 4, 0.5, 1.5]), U2 = U * k, I2 = I * k;
      need(isNice(U2, 2) && isNice(I2, 3));
      return { stem: `Đặt hiệu điện thế ${vn(U)} V vào hai đầu ${dt} thì cường độ dòng điện chạy qua là ${vn(I)} A. Nếu hiệu điện thế đặt vào là ${vn(U2)} V (điện trở không đổi) thì cường độ dòng điện chạy qua là`, ...mcq(r, num(I2, "A"), [num(I / k, "A"), num(I + (U2 - U), "A"), num(I * k * k, "A")]), explanation: `$R = \\dfrac{U}{I}$ không đổi nên $I$ tỉ lệ thuận với $U$: $I_2 = I_1\\dfrac{U_2}{U_1} = ${tex(I)}\\cdot\\dfrac{${tex(U2)}}{${tex(U)}} = ${tex(I2, 3)}$ A.` };
    },
  },
  {
    id: "l11k2-dien-tro-day-dan", subject: S, grade: G, chapter: C4, topic: "Điện trở của dây dẫn R = ρℓ/S",
    hk: 2, half: 2, tk: K4, level: 2, kind: "mcq",
    make: (r) => {
      if (r.chance(0.5)) {
        const [mat, rho, rhoT] = r.pick([["nicrom", 1.1e-6, "1{,}1\\cdot 10^{-6}"], ["constantan", 0.5e-6, "0{,}5\\cdot 10^{-6}"], ["đồng", 1.7e-8, "1{,}7\\cdot 10^{-8}"], ["nhôm", 2.8e-8, "2{,}8\\cdot 10^{-8}"], ["vonfram", 5.5e-8, "5{,}5\\cdot 10^{-8}"]] as [string, number, string][]);
        const l = r.pick([0.5, 1, 2, 4, 5, 10, 20, 50, 100, 200]), Smm = r.pick([0.1, 0.2, 0.25, 0.5, 1, 2]), R = (rho * l) / (Smm * 1e-6);
        need(isNice(R, 3) && R >= 0.01 && R <= 2000);
        return { stem: `Một dây dẫn bằng ${mat} có điện trở suất $${rhoT}$ Ω·m, dài ${vn(l)} m, tiết diện ${vn(Smm)} mm². Điện trở của dây dẫn là`, ...mcq(r, num(R, "Ω"), [num(R * 1e-6, "Ω"), num((rho * Smm * 1e-6) / l, "Ω"), num(2 * R, "Ω"), num(R / 2, "Ω")]), explanation: `$S = ${tex(Smm)}$ mm² $= ${sci(Smm * 1e-6)}$ m². $R = \\rho\\dfrac{\\ell}{S} = ${rhoT}\\cdot\\dfrac{${tex(l)}}{${sci(Smm * 1e-6)}} = ${numT(R)}$ Ω.` };
      }
      const R0 = r.pick([2, 4, 5, 6, 8, 10, 12, 16, 20, 24, 36]), a = r.pick([1, 2, 3, 4, 0.5]), b = r.pick([1, 2, 3, 1]);
      need(a !== 1 || b !== 1);
      const R = (R0 * a) / (b * b);
      need(isNice(R, 3));
      const lt = a === 1 ? "cùng chiều dài" : a === 0.5 ? "chiều dài bằng một nửa" : `chiều dài gấp ${a} lần`;
      const dt = b === 1 ? "cùng đường kính tiết diện" : `đường kính tiết diện gấp ${b} lần`;
      return {
        stem: `Một dây dẫn kim loại hình trụ có điện trở ${R0} Ω. Một dây dẫn khác cùng chất, cùng nhiệt độ, có ${lt} và ${dt} dây thứ nhất. Điện trở của dây thứ hai là`,
        ...mcq(r, num(R, "Ω"), [num((R0 * a) / b, "Ω"), num(R0 * a * b * b, "Ω"), num((R0 * b * b) / a, "Ω"), num((R0 * a) / b ** 4, "Ω"), num(R0 / a, "Ω")]),
        explanation: `$R = \\rho\\dfrac{\\ell}{S}$, $S = \\dfrac{\\pi d^2}{4}$ nên $R \\sim \\dfrac{\\ell}{d^2}$: $R_2 = R_1\\cdot\\dfrac{${tex(a)}}{${b}^2} = ${tex(R, 3)}$ Ω.`,
      };
    },
  },
  {
    id: "l11k2-ghep-dien-tro", subject: S, grade: G, chapter: C4, topic: "Điện trở tương đương khi ghép nối tiếp, song song",
    hk: 2, half: 2, tk: K4, level: 2, kind: "mcq",
    make: (r) => {
      const mode = r.pick(["nt", "ss2", "ss2", "ss3"]), f = (x: number) => `${vn(x, 2)} Ω`;
      if (mode === "ss3") {
        const [a, b, c] = r.pick([[2, 3, 6], [3, 6, 6], [4, 6, 12], [6, 12, 12], [10, 15, 30], [12, 12, 12], [6, 6, 6], [4, 12, 6], [20, 30, 60], [8, 8, 4]]);
        const R = 1 / (1 / a + 1 / b + 1 / c);
        return { stem: `Ba điện trở $R_1 = ${a}$ Ω, $R_2 = ${b}$ Ω và $R_3 = ${c}$ Ω được mắc song song. Điện trở tương đương của đoạn mạch là`, ...mcq(r, f(R), [f(a + b + c), f((a * b * c) / (a + b + c)), f((a + b + c) / 3), f(1 / a + 1 / b + 1 / c)]), explanation: `$\\dfrac{1}{R} = \\dfrac{1}{${a}} + \\dfrac{1}{${b}} + \\dfrac{1}{${c}} = \\dfrac{1}{${tex(R)}}$ nên $R = ${tex(R)}$ Ω.` };
      }
      const P = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 24, 30, 40, 60];
      const a = r.pick(P), b = r.pick(P);
      if (mode === "nt") {
        const c = r.pick(P), R = a + b + c;
        return { stem: `Ba điện trở $R_1 = ${a}$ Ω, $R_2 = ${b}$ Ω và $R_3 = ${c}$ Ω được mắc nối tiếp. Điện trở tương đương của đoạn mạch là`, ...mcq(r, f(R), [f(1 / (1 / a + 1 / b + 1 / c)), f(R / 3), f(ser(a, b) + c), f(a * b * c / R)]), explanation: `Nối tiếp: $R = R_1 + R_2 + R_3 = ${R}$ Ω.` };
      }
      const R = ser(a, b);
      need(isNice(R, 2));
      return { stem: `Hai điện trở $R_1 = ${a}$ Ω và $R_2 = ${b}$ Ω được mắc song song. Điện trở tương đương của đoạn mạch là`, ...mcq(r, f(R), [f(a + b), f((a + b) / 2), f(a * b), f(Math.abs(a - b)), f(1 / a + 1 / b)]), explanation: `$R = \\dfrac{R_1R_2}{R_1 + R_2} = \\dfrac{${a}\\cdot ${b}}{${a} + ${b}} = ${tex(R)}$ Ω.` };
    },
  },
  {
    id: "l11k2-mach-hon-hop", subject: S, grade: G, chapter: C4, topic: "Mạch điện hỗn hợp: R1 nt (R2 // R3)",
    hk: 2, half: 2, tk: K4, level: 3, kind: "mcq",
    make: (r) => {
      const P = [2, 3, 4, 6, 8, 10, 12, 15, 20, 30, 60];
      const R1 = r.int(1, 20), R2 = r.pick(P), R3 = r.pick(P), R23 = ser(R2, R3), Rt = R1 + R23;
      need(isNice(R23, 2));
      const I = r.pick([0.2, 0.25, 0.4, 0.5, 0.6, 0.75, 0.8, 1, 1.2, 1.5, 2, 2.5, 3]), U = I * Rt;
      need(isNice(U, 2) && U <= 240);
      const I2 = (I * R3) / (R2 + R3), U23 = I * R23, U1 = I * R1, ask = r.pick(["Rt", "I", "I2", "U1"]);
      need(isNice(I2, 3) && isNice(U1, 3));
      const stem = `Cho mạch điện gồm điện trở $R_1 = ${R1}$ Ω mắc nối tiếp với đoạn mạch gồm $R_2 = ${R2}$ Ω mắc song song với $R_3 = ${R3}$ Ω. Đặt vào hai đầu mạch hiệu điện thế ${vn(U)} V.`;
      const base = `$R_{23} = \\dfrac{R_2R_3}{R_2 + R_3} = ${tex(R23)}$ Ω; $R_{tđ} = R_1 + R_{23} = ${tex(Rt)}$ Ω; $I = \\dfrac{U}{R_{tđ}} = ${tex(I)}$ A`;
      const f = (x: number, u: string) => `${vn(x, 3)} ${u}`;
      if (ask === "Rt") return { stem: `${stem} Điện trở tương đương của mạch là`, ...mcq(r, f(Rt, "Ω"), [f(R1 + R2 + R3, "Ω"), f(ser(R1 + R2, R3), "Ω"), f(1 / (1 / R1 + 1 / R2 + 1 / R3), "Ω"), f(R1 + (R2 + R3) / 2, "Ω")]), explanation: `${base}.` };
      if (ask === "I") return { stem: `${stem} Cường độ dòng điện chạy qua $R_1$ là`, ...mcq(r, f(I, "A"), [f(U / (R1 + R2 + R3), "A"), f(U / R1, "A"), f(I2, "A"), f(U / ser(R1 + R2, R3), "A")]), explanation: `${base}; $R_1$ nằm trên mạch chính nên $I_1 = I = ${tex(I)}$ A.` };
      if (ask === "I2") {
        need(R2 !== R3);
        return { stem: `${stem} Cường độ dòng điện chạy qua $R_2$ là`, ...mcq(r, f(I2, "A"), [f(I - I2, "A"), f(I, "A"), f(I / 2, "A"), f(U / R2, "A")]), explanation: `${base}; $U_{23} = IR_{23} = ${tex(U23, 3)}$ V; $I_2 = \\dfrac{U_{23}}{R_2} = ${tex(I2, 3)}$ A.` };
      }
      return { stem: `${stem} Hiệu điện thế giữa hai đầu $R_1$ là`, ...mcq(r, f(U1, "V"), [f(U23, "V"), f(U / 2, "V"), f((U * R1) / (R1 + R2 + R3), "V"), f(U, "V")]), explanation: `${base}; $U_1 = IR_1 = ${tex(I)}\\cdot ${R1} = ${tex(U1, 3)}$ V.` };
    },
  },
  {
    id: "l11k2-nguon-dien-ly-thuyet", subject: S, grade: G, chapter: C4, topic: "Nguồn điện, suất điện động, điện trở trong (lí thuyết)",
    hk: 2, half: 2, tk: K4, level: 1, kind: "mcq",
    make: (r) => theory(r, [""], [
      { q: "Suất điện động của nguồn điện là đại lượng đặc trưng cho", a: "khả năng thực hiện công của lực lạ bên trong nguồn điện", w: ["khả năng tác dụng lực điện của nguồn điện", "khả năng tích điện cho hai cực của nó", "khả năng dự trữ điện tích của nguồn điện"], e: "Suất điện động $" + EMF + " = \\dfrac{A}{q}$ đặc trưng cho khả năng thực hiện công của lực lạ." },
      { q: "Suất điện động của nguồn điện được xác định bằng công thức", a: `$${EMF} = \\dfrac{A}{q}$`, w: [`$${EMF} = Aq$`, `$${EMF} = \\dfrac{q}{A}$`, `$${EMF} = \\dfrac{A}{q^2}$`], e: `$${EMF} = \\dfrac{A}{q}$ với $A$ là công của lực lạ khi dịch chuyển điện tích dương $q$ bên trong nguồn từ cực âm sang cực dương.` },
      { q: "Bên trong nguồn điện, lực lạ có tác dụng", a: "làm dịch chuyển các điện tích dương từ cực âm sang cực dương", w: ["làm dịch chuyển các điện tích dương từ cực dương sang cực âm", "tạo ra các điện tích mới trong nguồn", "làm giảm điện trở trong của nguồn"], e: "Lực lạ thắng lực điện, đưa điện tích dương từ cực âm sang cực dương để duy trì hiệu điện thế giữa hai cực." },
      { q: "Biểu thức định luật Ohm đối với toàn mạch là", a: `$I = \\dfrac{${EMF}}{R + r}$`, w: [`$I = \\dfrac{${EMF}}{R}$`, `$I = \\dfrac{${EMF}}{R - r}$`, `$I = \\dfrac{R + r}{${EMF}}$`], e: `Cường độ dòng điện trong mạch kín: $I = \\dfrac{${EMF}}{R + r}$.` },
      { q: "Khi mạch kín có dòng điện $I$, hiệu điện thế giữa hai cực của nguồn điện (suất điện động $" + EMF + "$, điện trở trong $r$) là", a: `$U = ${EMF} - Ir$`, w: [`$U = ${EMF} + Ir$`, "$U = Ir$", `$U = ${EMF}$`], e: `$U_N = IR = ${EMF} - Ir$.` },
      { q: "Hiện tượng đoản mạch xảy ra khi", a: "nối hai cực của nguồn điện bằng dây dẫn có điện trở rất nhỏ", w: ["mạch ngoài để hở", "nối hai cực của nguồn với một điện trở rất lớn", "dùng nguồn có suất điện động quá nhỏ"], e: `Khi $R \\approx 0$: $I = \\dfrac{${EMF}}{r}$ rất lớn, gây đoản mạch.` },
      { q: "Khi mạch ngoài để hở, hiệu điện thế giữa hai cực của nguồn điện", a: "bằng suất điện động của nguồn", w: ["bằng 0", "lớn hơn suất điện động của nguồn", "bằng nửa suất điện động của nguồn"], e: `Mạch hở $I = 0$ nên $U = ${EMF} - Ir = ${EMF}$.` },
      { q: "Trong hệ SI, đơn vị của suất điện động là", a: "vôn (V)", w: ["ampe (A)", "jun (J)", "oát (W)"], e: "Suất điện động có đơn vị vôn (V), $1$ V $= 1$ J/C." },
      { q: "Khi điện trở mạch ngoài tăng thì hiệu điện thế giữa hai cực của nguồn điện", a: "tăng", w: ["giảm", "không đổi", "giảm đến 0"], e: `$U = ${EMF} - Ir$; $R$ tăng thì $I$ giảm nên $U$ tăng.` },
      { q: "Pin, acquy là các nguồn điện biến đổi", a: "hóa năng thành điện năng", w: ["cơ năng thành điện năng", "quang năng thành điện năng", "nhiệt năng thành điện năng"], e: "Trong pin, acquy, lực lạ là lực hóa học: hóa năng chuyển thành điện năng." },
    ]),
  },
  {
    id: "l11k2-ohm-toan-mach", subject: S, grade: G, chapter: C4, topic: "Định luật Ohm cho toàn mạch",
    hk: 2, half: 2, tk: K4, level: 2, kind: "mcq",
    make: (r) => {
      const E = r.pick([1.5, 3, 4.5, 6, 9, 12, 24]), rr = r.pick([0.5, 1, 1.5, 2, 2.5, 3, 4]), R = r.int(1, 20), I = E / (R + rr);
      need(isNice(I, 3));
      const mode = r.pick(["I", "I", "U", "r", "sc"]), f = (x: number, u: string) => num(round(x, 4), u);
      const head = `Một nguồn điện có suất điện động ${vn(E)} V`;
      if (mode === "I") return { stem: `${head} và điện trở trong ${vn(rr)} Ω được nối với điện trở ngoài $R = ${R}$ Ω thành mạch kín. Cường độ dòng điện trong mạch là`, ...mcq(r, f(I, "A"), [f(E / R, "A"), f(E / rr, "A"), f(E / (R + 2 * rr), "A"), f(E * (R + rr), "A")]), explanation: `$I = \\dfrac{${EMF}}{R + r} = \\dfrac{${tex(E)}}{${R} + ${tex(rr)}} = ${tex(I, 3)}$ A.` };
      if (mode === "U") return { stem: `${head} và điện trở trong ${vn(rr)} Ω được nối với điện trở ngoài $R = ${R}$ Ω thành mạch kín. Hiệu điện thế giữa hai cực của nguồn là`, ...mcq(r, f(I * R, "V"), [f(E, "V"), f(I * rr, "V"), f(E + I * rr, "V")]), explanation: `$I = \\dfrac{${EMF}}{R + r} = ${tex(I, 3)}$ A; $U = IR = ${tex(I * R, 3)}$ V (bằng $${EMF} - Ir$).` };
      if (mode === "r") return { stem: `${head} được nối với điện trở ngoài $R = ${R}$ Ω thành mạch kín thì cường độ dòng điện trong mạch là ${vn(I, 3)} A. Điện trở trong của nguồn là`, ...mcq(r, f(rr, "Ω"), [f(E / I, "Ω"), f(R + rr, "Ω"), f(E * I - R, "Ω"), f(2 * rr, "Ω")].filter((s) => !s.startsWith("-"))), explanation: `$I = \\dfrac{${EMF}}{R + r} \\Rightarrow r = \\dfrac{${EMF}}{I} - R = \\dfrac{${tex(E)}}{${tex(I, 3)}} - ${R} = ${tex(rr)}$ Ω.` };
      return { stem: `${head} và điện trở trong ${vn(rr)} Ω. Khi xảy ra đoản mạch (nối hai cực bằng dây dẫn có điện trở không đáng kể), cường độ dòng điện chạy qua nguồn là`, ...mcq(r, f(E / rr, "A"), [f(E * rr, "A"), f(rr / E, "A"), f(E / (2 * rr), "A"), f(0, "A")]), explanation: `Đoản mạch $R \\approx 0$: $I = \\dfrac{${EMF}}{r} = \\dfrac{${tex(E)}}{${tex(rr)}} = ${tex(E / rr, 3)}$ A.` };
    },
  },
  {
    id: "l11k2-nang-luong-cong-suat-ly-thuyet", subject: S, grade: G, chapter: C4, topic: "Năng lượng và công suất điện (lí thuyết)",
    hk: 2, half: 2, tk: K4, level: 1, kind: "mcq",
    make: (r) => theory(r, [""], [
      { q: "Điện năng tiêu thụ của một đoạn mạch có hiệu điện thế $U$, dòng điện $I$ trong thời gian $t$ là", a: "$A = UIt$", w: ["$A = UI$", "$A = \\dfrac{UI}{t}$", "$A = \\dfrac{Ut}{I}$"], e: "$A = qU = UIt$." },
      { q: "Công suất điện của một đoạn mạch là", a: "$\\mathscr{P} = UI$", w: ["$\\mathscr{P} = UIt$", "$\\mathscr{P} = \\dfrac{U}{I}$", "$\\mathscr{P} = U^2I$"], e: "$\\mathscr{P} = \\dfrac{A}{t} = UI$." },
      { q: "Một kilôoát giờ (1 kWh) bằng", a: "$3{,}6\\cdot 10^6$ J", w: ["$3600$ J", "$1000$ J", "$3{,}6\\cdot 10^3$ J"], e: "$1$ kWh $= 1000$ W $\\cdot 3600$ s $= 3{,}6\\cdot 10^6$ J." },
      { q: "Nhiệt lượng tỏa ra trên vật dẫn có điện trở $R$ khi có dòng điện $I$ chạy qua trong thời gian $t$ là", a: "$Q = RI^2t$", w: ["$Q = RIt$", "$Q = R^2It$", "$Q = \\dfrac{I^2t}{R}$"], e: "Định luật Joule – Lenz: $Q = RI^2t$." },
      { q: "Công của nguồn điện có suất điện động $" + EMF + "$ khi có dòng điện $I$ chạy qua trong thời gian $t$ là", a: `$A = ${EMF}It$`, w: [`$A = ${EMF}I$`, `$A = \\dfrac{${EMF}t}{I}$`, `$A = ${EMF}I^2t$`], e: `Công của nguồn: $A = q${EMF} = ${EMF}It$.` },
      { q: "Hiệu suất của nguồn điện (hiệu điện thế mạch ngoài $U_N$, suất điện động $" + EMF + "$) là", a: `$H = \\dfrac{U_N}{${EMF}}$`, w: [`$H = \\dfrac{${EMF}}{U_N}$`, `$H = \\dfrac{U_N}{${EMF} + U_N}$`, `$H = U_N${EMF}$`], e: `$H = \\dfrac{A_{ích}}{A} = \\dfrac{U_NIt}{${EMF}It} = \\dfrac{U_N}{${EMF}}$.` },
      { q: "Trên một bóng đèn có ghi \"220 V – 100 W\". Số 100 W cho biết", a: "công suất của đèn khi đèn hoạt động bình thường", w: ["điện năng đèn tiêu thụ trong 1 giờ", "công suất tối thiểu để đèn sáng", "công suất của đèn khi mắc vào mọi hiệu điện thế"], e: "100 W là công suất định mức, đạt được khi đèn hoạt động ở hiệu điện thế định mức 220 V." },
      { q: "Trong hệ SI, đơn vị của công suất điện là", a: "oát (W)", w: ["jun (J)", "kilôoát giờ (kWh)", "vôn (V)"], e: "Công suất có đơn vị oát (W); kWh là đơn vị năng lượng." },
      { q: "Dụng cụ dùng để đo điện năng tiêu thụ của các hộ gia đình là", a: "công tơ điện", w: ["ampe kế", "vôn kế", "điện kế"], e: "Công tơ điện đo điện năng tiêu thụ (đơn vị kWh)." },
      { q: "Nhiệt lượng tỏa ra trên một điện trở không đổi trong cùng một khoảng thời gian", a: "tỉ lệ thuận với bình phương cường độ dòng điện", w: ["tỉ lệ thuận với cường độ dòng điện", "tỉ lệ nghịch với cường độ dòng điện", "không phụ thuộc cường độ dòng điện"], e: "$Q = RI^2t$ nên $Q \\sim I^2$." },
      { q: "Công suất tỏa nhiệt trên điện trở $R$ khi hiệu điện thế giữa hai đầu là $U$ được tính bằng", a: "$\\mathscr{P} = \\dfrac{U^2}{R}$", w: ["$\\mathscr{P} = \\dfrac{U}{R}$", "$\\mathscr{P} = U^2R$", "$\\mathscr{P} = \\dfrac{R}{U^2}$"], e: "$\\mathscr{P} = UI = I^2R = \\dfrac{U^2}{R}$." },
    ]),
  },
  {
    id: "l11k2-dien-nang-tieu-thu", subject: S, grade: G, chapter: C4, topic: "Điện năng tiêu thụ của thiết bị điện",
    hk: 2, half: 2, tk: K4, level: 1, kind: "mcq",
    make: (r) => {
      const [dev, P] = r.pick([["bóng đèn LED", 10], ["bóng đèn LED", 20], ["quạt điện", 50], ["quạt điện", 60], ["ti vi", 100], ["ti vi", 120], ["nồi cơm điện", 600], ["nồi cơm điện", 800], ["bàn là", 1000], ["ấm siêu tốc", 1500], ["ấm siêu tốc", 2000], ["máy điều hòa", 1200]] as [string, number][]);
      if (r.chance(0.6)) {
        const h = r.pick([0.5, 1, 2, 3, 4, 5, 6, 8]), days = r.pick([30, 30, 10, 20]), A = (P * h * days) / 1000;
        need(isNice(A, 2) && A >= 0.1);
        return { stem: `Một ${dev} có công suất ${P} W, mỗi ngày sử dụng ${vn(h)} giờ. Điện năng mà ${dev} tiêu thụ trong ${days} ngày là`, ...mcq(r, `${vn(A, 2)} kWh`, [`${vn(A * 1000, 2)} kWh`, `${vn(A / days, 3)} kWh`, `${vn(A * 3.6, 2)} kWh`, `${vn((P * days) / 1000, 2)} kWh`]), explanation: `$A = \\mathscr{P}t = ${tex(P / 1000, 3)}$ kW $\\cdot ${tex(h)}\\cdot ${days}$ h $= ${tex(A)}$ kWh.` };
      }
      const tm = r.pick([1, 2, 5, 10, 15, 20, 30]), A = P * tm * 60;
      return { stem: `Một ${dev} có công suất ${P} W hoạt động bình thường trong ${tm} phút. Điện năng tiêu thụ của ${dev} là`, ...mcq(r, num(A, "J"), [num(P * tm, "J"), num(A / 1000, "J"), num(A * 60, "J"), num(P / (tm * 60), "J")]), explanation: `$A = \\mathscr{P}t = ${P}\\cdot ${tm * 60} = ${numT(A)}$ J.` };
    },
  },
  {
    id: "l11k2-den-dinh-muc", subject: S, grade: G, chapter: C4, topic: "Giá trị định mức của dụng cụ điện",
    hk: 2, half: 2, tk: K4, level: 2, kind: "mcq",
    make: (r) => {
      const [U, P] = r.pick([[6, 3], [12, 6], [6, 6], [12, 24], [220, 100], [220, 40], [110, 100], [12, 18], [3, 1.5], [24, 12], [220, 1000], [220, 484]] as [number, number][]);
      const R = (U * U) / P, I = P / U, mode = r.pick(["R", "I", "P", "P"]);
      const head = `Trên một bóng đèn có ghi ${vn(U)} V – ${vn(P)} W.`;
      if (mode === "R") return { stem: `${head} Điện trở của đèn khi sáng bình thường là`, ...mcq(r, num(R, "Ω"), [num(P / U, "Ω"), num(U / P, "Ω"), num((P * P) / U, "Ω"), num(U * P, "Ω")]), explanation: `$R = \\dfrac{U_{đm}^2}{\\mathscr{P}_{đm}} = \\dfrac{${tex(U)}^2}{${tex(P)}} = ${numT(R)}$ Ω.` };
      if (mode === "I") return { stem: `${head} Cường độ dòng điện định mức của đèn ${isNice(I, 4) ? "là" : "xấp xỉ bằng"}`, ...mcq(r, num(round(I, 4), "A"), [num(round(U / P, 4), "A"), num(U * P, "A"), num(round(P / (U * U), 4), "A")]), explanation: `$I_{đm} = \\dfrac{\\mathscr{P}_{đm}}{U_{đm}} = \\dfrac{${tex(P)}}{${tex(U)}} \\approx ${tex(I, 4)}$ A.` };
      const k = r.pick([0.5, 0.5, 0.8, 0.9]), U2 = U * k, P2 = P * k * k;
      need(isNice(U2, 2) && isNice(P2, 3));
      return { stem: `${head} Coi điện trở của đèn không đổi. Khi mắc đèn vào hiệu điện thế ${vn(U2)} V thì công suất tiêu thụ của đèn là`, ...mcq(r, num(P2, "W"), [num(P * k, "W"), num(P, "W"), num(P / k, "W"), num(P * k * k * k, "W")]), explanation: `$R = \\dfrac{U_{đm}^2}{\\mathscr{P}_{đm}} = ${numT(R)}$ Ω; $\\mathscr{P} = \\dfrac{U^2}{R} = \\mathscr{P}_{đm}\\left(\\dfrac{U}{U_{đm}}\\right)^2 = ${tex(P)}\\cdot ${tex(k)}^2 = ${tex(P2, 3)}$ W.` };
    },
  },
  {
    id: "l11k2-hieu-suat-cong-suat-nguon", subject: S, grade: G, chapter: C4, topic: "Hiệu suất, công suất của nguồn và mạch ngoài",
    hk: 2, half: 2, tk: K4, level: 3, kind: "mcq",
    make: (r) => {
      const E = r.pick([3, 6, 9, 12, 24]), rr = r.pick([0.5, 1, 2, 3, 4]), R = r.pick([1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20]), I = E / (R + rr), mode = r.pick(["H", "P", "max", "Png"]);
      const head = `Một nguồn điện có suất điện động ${E} V, điện trở trong ${vn(rr)} Ω`;
      const f = (x: number, u: string) => `${vn(x, 2)} ${u}`;
      if (mode === "H") {
        const H = (100 * R) / (R + rr);
        need(isNice(H, 1));
        return { stem: `${head} được nối với điện trở ngoài $R = ${R}$ Ω. Hiệu suất của nguồn điện là`, ...mcq(r, `${vn(H, 1)}%`, [`${vn(100 - H, 1)}%`, `${vn((100 * rr) / R, 1)}%`, `${vn(Math.min(99, (100 * R) / (R + 2 * rr)), 1)}%`, "100%"]), explanation: `$H = \\dfrac{U_N}{${EMF}} = \\dfrac{R}{R + r} = \\dfrac{${R}}{${R} + ${tex(rr)}} = ${tex(H, 1)}\\%$.` };
      }
      if (mode === "P" || mode === "Png") {
        need(isNice(I, 3));
        const PN = I * I * R, Png = E * I;
        if (mode === "P") return { stem: `${head} được nối với điện trở ngoài $R = ${R}$ Ω. Công suất tiêu thụ ở mạch ngoài là`, ...mcq(r, f(PN, "W"), [f((E * E) / R, "W"), f(Png, "W"), f(I * I * rr, "W"), f(I * R, "W")]), explanation: `$I = \\dfrac{${EMF}}{R + r} = ${tex(I, 3)}$ A; $\\mathscr{P}_N = I^2R = ${tex(I, 3)}^2\\cdot ${R} \\approx ${tex(PN, 2)}$ W.` };
        return { stem: `${head} được nối với điện trở ngoài $R = ${R}$ Ω. Công suất của nguồn điện là`, ...mcq(r, f(Png, "W"), [f(PN, "W"), f((E * E) / R, "W"), f(I * I * rr, "W"), f((E * E) / rr, "W")]), explanation: `$I = \\dfrac{${EMF}}{R + r} = ${tex(I, 3)}$ A; $\\mathscr{P}_{ng} = ${EMF}I = ${E}\\cdot ${tex(I, 3)} \\approx ${tex(Png, 2)}$ W.` };
      }
      const Pm = (E * E) / (4 * rr);
      return { stem: `${head} được nối với một biến trở $R$. Công suất tiêu thụ trên biến trở đạt giá trị lớn nhất bằng`, ...mcq(r, f(Pm, "W"), [f((E * E) / rr, "W"), f((E * E) / (2 * rr), "W"), f(E / (4 * rr), "W"), f((E * E) / (8 * rr), "W")]), explanation: `$\\mathscr{P} = \\dfrac{${EMF}^2R}{(R + r)^2} = \\dfrac{${EMF}^2}{\\left(\\sqrt{R} + \\dfrac{r}{\\sqrt{R}}\\right)^2}$ lớn nhất khi $R = r = ${tex(rr)}$ Ω (bất đẳng thức Cô-si): $\\mathscr{P}_{\\max} = \\dfrac{${EMF}^2}{4r} = \\dfrac{${E}^2}{4\\cdot ${tex(rr)}} = ${tex(Pm, 2)}$ W.` };
    },
  },
  /* ---------- Đúng/Sai half 2 ---------- */
  {
    id: "l11k2-tf-ohm-toan-mach", subject: S, grade: G, chapter: C4, topic: "Mạch điện kín, định luật Ohm toàn mạch (Đ/S)",
    hk: 2, half: 2, tk: K4, level: 2, kind: "tf",
    make: (r) => {
      const E = r.pick([3, 4.5, 6, 9, 12, 24]), rr = r.pick([0.5, 1, 1.5, 2, 3]), R = r.int(2, 20), I = E / (R + rr);
      need(isNice(I, 2));
      const U = I * R, H = (100 * R) / (R + rr), tm = r.pick([1, 2, 5, 10]), Q = I * I * R * tm * 60;
      need(isNice(H, 1));
      const st1 = pickTF(r, `Cường độ dòng điện trong mạch là ${vn(I, 2)} A.`, `Cường độ dòng điện trong mạch là ${vn(E / R, 2)} A.`);
      need(vn(I, 2) !== vn(E / R, 2));
      const st2 = pickTF(r, `Hiệu điện thế giữa hai cực của nguồn là ${vn(U, 2)} V.`, `Hiệu điện thế giữa hai cực của nguồn là ${vn(E, 2)} V.`);
      const st3 = pickTF(r, `Hiệu suất của nguồn điện là ${vn(H, 1)}%.`, `Hiệu suất của nguồn điện là ${vn(100 - H, 1)}%.`);
      need(Math.abs(H - 50) > 0.1);
      const st4 = pickTF(r, `Nhiệt lượng tỏa ra trên $R$ trong ${tm} phút là ${num(round(Q, 2), "J")}.`, `Nhiệt lượng tỏa ra trên $R$ trong ${tm} phút là ${num(round(Q / 60, 2), "J")}.`);
      return {
        stem: `Một nguồn điện có suất điện động ${vn(E)} V, điện trở trong ${vn(rr)} Ω được nối với điện trở $R = ${R}$ Ω thành mạch kín.`,
        ...tf([st1, st2, st3, st4]),
        explanation: `${DS(st1[1])}: $I = \\dfrac{${EMF}}{R + r} = \\dfrac{${tex(E)}}{${R + rr}} = ${tex(I, 2)}$ A. ${DS(st2[1])}: $U = IR = ${tex(U, 2)}$ V (nhỏ hơn $${EMF}$ vì có độ giảm thế $Ir$). ${DS(st3[1])}: $H = \\dfrac{R}{R + r} = ${tex(H, 1)}\\%$. ${DS(st4[1])}: $Q = I^2Rt = ${tex(I, 2)}^2\\cdot ${R}\\cdot ${tm * 60} = ${numT(round(Q, 2))}$ J.`,
      };
    },
  },
  {
    id: "l11k2-tf-ghep-dien-tro", subject: S, grade: G, chapter: C4, topic: "Đoạn mạch nối tiếp, song song (Đ/S)",
    hk: 2, half: 2, tk: K4, level: 1, kind: "tf",
    make: (r) => {
      const P = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 24, 30];
      const R1 = r.pick(P), R2 = r.pick(P), U = r.pick([6, 9, 12, 18, 24, 30, 36, 48, 60]);
      need(R1 !== R2);
      const ss = r.chance(0.5);
      if (!ss) {
        const R = R1 + R2, I = U / R, U1 = I * R1;
        need(isNice(I, 3) && isNice(U1, 2));
        const st1 = pickTF(r, `Điện trở tương đương của đoạn mạch là ${R} Ω.`, `Điện trở tương đương của đoạn mạch là ${vn(ser(R1, R2), 2)} Ω.`);
        const st2 = pickTF(r, `Cường độ dòng điện qua $R_1$ và qua $R_2$ bằng nhau.`, `Cường độ dòng điện qua $R_${R1 > R2 ? 1 : 2}$ lớn hơn qua điện trở còn lại.`);
        const st3 = pickTF(r, `Hiệu điện thế giữa hai đầu $R_1$ là ${vn(U1, 2)} V.`, `Hiệu điện thế giữa hai đầu $R_1$ là ${vn(U - U1, 2)} V.`);
        const st4 = pickTF(r, `Điện trở có giá trị lớn hơn tiêu thụ công suất lớn hơn.`, `Điện trở có giá trị nhỏ hơn tiêu thụ công suất lớn hơn.`);
        return { stem: `Hai điện trở $R_1 = ${R1}$ Ω và $R_2 = ${R2}$ Ω mắc nối tiếp rồi đặt vào hai đầu đoạn mạch hiệu điện thế ${U} V.`, ...tf([st1, st2, st3, st4]), explanation: `${DS(st1[1])}: $R = R_1 + R_2 = ${R}$ Ω. ${DS(st2[1])}: mạch nối tiếp có cường độ dòng điện như nhau: $I = \\dfrac{U}{R} = ${tex(I, 3)}$ A. ${DS(st3[1])}: $U_1 = IR_1 = ${tex(U1, 2)}$ V. ${DS(st4[1])}: cùng $I$ nên $\\mathscr{P} = I^2R$ lớn hơn ở điện trở lớn hơn.` };
      }
      const R = ser(R1, R2), I1 = U / R1, I = U / R;
      need(isNice(R, 2) && isNice(I1, 3) && isNice(I, 3));
      const st1 = pickTF(r, `Điện trở tương đương của đoạn mạch là ${vn(R, 2)} Ω.`, `Điện trở tương đương của đoạn mạch là ${R1 + R2} Ω.`);
      const st2 = pickTF(r, `Hiệu điện thế giữa hai đầu $R_1$ và hai đầu $R_2$ đều bằng ${U} V.`, `Hiệu điện thế giữa hai đầu $R_1$ là ${vn((U * R1) / (R1 + R2), 2)} V.`);
      const st3 = pickTF(r, `Cường độ dòng điện qua mạch chính là ${vn(I, 3)} A.`, `Cường độ dòng điện qua mạch chính là ${vn(U / (R1 + R2), 3)} A.`);
      const st4 = pickTF(r, `Điện trở có giá trị nhỏ hơn tiêu thụ công suất lớn hơn.`, `Điện trở có giá trị lớn hơn tiêu thụ công suất lớn hơn.`);
      return { stem: `Hai điện trở $R_1 = ${R1}$ Ω và $R_2 = ${R2}$ Ω mắc song song rồi đặt vào hai đầu đoạn mạch hiệu điện thế ${U} V.`, ...tf([st1, st2, st3, st4]), explanation: `${DS(st1[1])}: $R = \\dfrac{R_1R_2}{R_1 + R_2} = ${tex(R)}$ Ω. ${DS(st2[1])}: mạch song song có hiệu điện thế như nhau, bằng ${U} V. ${DS(st3[1])}: $I = \\dfrac{U}{R} = ${tex(I, 3)}$ A. ${DS(st4[1])}: cùng $U$ nên $\\mathscr{P} = \\dfrac{U^2}{R}$ lớn hơn ở điện trở nhỏ hơn.` };
    },
  },
  {
    id: "l11k2-tf-den-dinh-muc", subject: S, grade: G, chapter: C4, topic: "Đèn mắc với điện trở phụ để sáng bình thường (Đ/S)",
    hk: 2, half: 2, tk: K4, level: 3, kind: "tf",
    make: (r) => {
      const [Ud, Pd] = r.pick([[6, 3], [6, 6], [12, 6], [12, 12], [3, 1.5], [6, 1.8], [12, 18], [24, 12], [6, 9], [3, 3]] as [number, number][]);
      const U = r.pick([9, 12, 15, 18, 24, 36]);
      need(U > Ud);
      const I = Pd / Ud, Rd = (Ud * Ud) / Pd, Rx = (U - Ud) / I, Px = (U - Ud) * I, H = (100 * Ud) / U;
      need(isNice(Rx, 2) && isNice(H, 1));
      const st1 = pickTF(r, `Cường độ dòng điện định mức của đèn là ${vn(I, 3)} A.`, `Cường độ dòng điện định mức của đèn là ${vn(Ud / Pd, 3)} A.`);
      need(vn(I, 3) !== vn(Ud / Pd, 3));
      const st2 = pickTF(r, `Điện trở của đèn khi sáng bình thường là ${vn(Rd, 2)} Ω.`, `Điện trở của đèn khi sáng bình thường là ${vn(Ud * Pd, 2)} Ω.`);
      const st3 = pickTF(r, `Để đèn sáng bình thường, điện trở $R$ phải có giá trị ${vn(Rx, 2)} Ω.`, `Để đèn sáng bình thường, điện trở $R$ phải có giá trị ${vn(U / I, 2)} Ω.`);
      const st4 = pickTF(r, `Khi đèn sáng bình thường, công suất tiêu thụ trên $R$ là ${vn(Px, 2)} W.`, `Khi đèn sáng bình thường, công suất tiêu thụ trên $R$ là ${vn(Pd, 2)} W.`);
      need(vn(Px, 2) !== vn(Pd, 2));
      return {
        stem: `Một bóng đèn có ghi ${vn(Ud)} V – ${vn(Pd)} W được mắc nối tiếp với một điện trở $R$ rồi nối vào hai cực của một nguồn có hiệu điện thế không đổi ${U} V (bỏ qua điện trở dây nối và điện trở trong của nguồn).`,
        ...tf([st1, st2, st3, st4]),
        explanation: `${DS(st1[1])}: $I_{đm} = \\dfrac{\\mathscr{P}_{đm}}{U_{đm}} = ${tex(I, 3)}$ A. ${DS(st2[1])}: $R_đ = \\dfrac{U_{đm}^2}{\\mathscr{P}_{đm}} = ${tex(Rd, 2)}$ Ω. ${DS(st3[1])}: đèn sáng bình thường thì $I = I_{đm}$, $U_R = ${U} - ${tex(Ud)} = ${tex(U - Ud)}$ V nên $R = \\dfrac{U_R}{I} = ${tex(Rx, 2)}$ Ω. ${DS(st4[1])}: $\\mathscr{P}_R = U_RI = ${tex(U - Ud)}\\cdot ${tex(I, 3)} = ${tex(Px, 2)}$ W.`,
      };
    },
  },
  /* ---------- Trả lời ngắn half 2 ---------- */
  {
    id: "l11k2-s-so-electron", subject: S, grade: G, chapter: C4, topic: "Điện lượng, số electron (trả lời ngắn)",
    hk: 2, half: 2, tk: K4, level: 1, kind: "short",
    make: (r) => {
      const I = r.pick([0.16, 0.2, 0.32, 0.4, 0.5, 0.8, 1, 1.2, 1.6, 2, 3.2, 4]), t = r.pick([1, 2, 5, 10, 20, 30, 60]);
      if (r.chance(0.5)) {
        const x = (I * t) / EC / 1e18;
        need(isNice(x, 1) && vn(x, 1).length <= 4);
        return { stem: `Một dòng điện không đổi có cường độ ${vn(I)} A chạy qua một dây dẫn kim loại. Số electron dịch chuyển qua tiết diện thẳng của dây trong ${t} s là $N = x\\cdot 10^{18}$. Biết $e = 1{,}6\\cdot 10^{-19}$ C. Giá trị của $x$ là bao nhiêu?`, ...short(x, 1), explanation: `$N = \\dfrac{It}{e} = \\dfrac{${tex(I)}\\cdot ${t}}{1{,}6\\cdot 10^{-19}} = ${tex(x, 1)}\\cdot 10^{18}$.` };
      }
      const tm = r.pick([1, 2, 5, 10]), q = I * tm * 60;
      need(isNice(q, 1) && vn(q, 1).length <= 4);
      return { stem: `Một dòng điện không đổi có cường độ ${vn(I)} A chạy qua một dây dẫn. Điện lượng chuyển qua tiết diện thẳng của dây trong ${tm} phút là bao nhiêu culông?`, ...short(q, 1), explanation: `$q = It = ${tex(I)}\\cdot ${tm * 60} = ${tex(q, 1)}$ C.` };
    },
  },
  {
    id: "l11k2-s-ohm-toan-mach", subject: S, grade: G, chapter: C4, topic: "Định luật Ohm cho toàn mạch (trả lời ngắn)",
    hk: 2, half: 2, tk: K4, level: 2, kind: "short",
    make: (r) => {
      const E = r.pick([1.5, 3, 4.5, 6, 9, 12, 24]), rr = r.pick([0.2, 0.5, 1, 1.5, 2, 2.5, 3]), R = r.int(1, 25), I = E / (R + rr), U = I * R;
      const ask = r.pick(["I", "U", "Ir"]);
      const [val, txt] = ({ I: [I, "Cường độ dòng điện trong mạch là bao nhiêu ampe"], U: [U, "Hiệu điện thế giữa hai cực của nguồn là bao nhiêu vôn"], Ir: [I * rr, "Độ giảm thế bên trong nguồn là bao nhiêu vôn"] } as Record<string, [number, string]>)[ask];
      need(val >= 0.05);
      const ft = fit(val);
      return { stem: `Một nguồn điện có suất điện động ${vn(E)} V, điện trở trong ${vn(rr)} Ω được nối với điện trở $R = ${R}$ Ω thành mạch kín. ${txt}${ft.note}?`, ...short(ft.v, ft.dp), explanation: `$I = \\dfrac{${EMF}}{R + r} = \\dfrac{${tex(E)}}{${tex(R + rr)}} \\approx ${tex(I, 4)}$ A; $U = IR \\approx ${tex(U, 4)}$ V; $Ir \\approx ${tex(I * rr, 4)}$ V.` };
    },
  },
  {
    id: "l11k2-s-tien-dien", subject: S, grade: G, chapter: C4, topic: "Tiền điện phải trả (trả lời ngắn)",
    hk: 2, half: 2, tk: K4, level: 2, kind: "short",
    make: (r) => {
      const [dev, P] = r.pick([["ấm điện", 1500], ["ấm điện", 2000], ["bàn là", 1000], ["nồi cơm điện", 700], ["máy điều hòa", 1200], ["bình nóng lạnh", 2500], ["ti vi", 120], ["tủ lạnh", 150]] as [string, number][]);
      const h = r.pick([0.5, 1, 1.5, 2, 3, 4, 5, 8, 10, 24]), days = 30, price = r.pick([1800, 2000, 2500, 3000]);
      const kwh = (P * h * days) / 1000, cost = (kwh * price) / 1000;
      need(cost >= 5 && cost < 10000);
      const ft = fit(cost);
      need(ft.dp === 0 || isNice(cost, 0));
      return { stem: `Một ${dev} có công suất ${P} W, mỗi ngày dùng ${vn(h)} giờ. Giá điện là ${price} đồng/kWh. Số tiền điện phải trả cho ${dev} này trong ${days} ngày là bao nhiêu nghìn đồng${isNice(cost, 0) ? "" : " (làm tròn kết quả đến hàng đơn vị)"}?`, ...short(round(cost), 0), explanation: `$A = ${tex(P / 1000, 3)}\\cdot ${tex(h)}\\cdot ${days} = ${tex(kwh, 2)}$ kWh; tiền điện $= ${tex(kwh, 2)}\\cdot ${price} = ${tex(kwh * price, 0)}$ đồng $\\approx ${round(cost)}$ nghìn đồng.` };
    },
  },
  {
    id: "l11k2-s-mach-hon-hop", subject: S, grade: G, chapter: C4, topic: "Mạch điện hỗn hợp (trả lời ngắn)",
    hk: 2, half: 2, tk: K4, level: 3, kind: "short",
    make: (r) => {
      const P = [2, 3, 4, 6, 8, 10, 12, 15, 20, 30];
      const R1 = r.int(1, 12), R2 = r.pick(P), R3 = r.pick(P), E = r.pick([6, 9, 12, 18, 24]), rr = r.pick([0, 0.5, 1, 2]);
      const R23 = ser(R2, R3), RN = R1 + R23, I = E / (RN + rr), U23 = I * R23, I3 = U23 / R3, PN = I * I * RN;
      need(isNice(R23, 2));
      const ask = r.pick(["RN", "I", "U23", "I3", "PN"]);
      const [val, txt] = ({ RN: [RN, "Điện trở tương đương của mạch ngoài là bao nhiêu ôm"], I: [I, "Cường độ dòng điện chạy qua nguồn là bao nhiêu ampe"], U23: [U23, "Hiệu điện thế giữa hai đầu $R_2$ là bao nhiêu vôn"], I3: [I3, "Cường độ dòng điện chạy qua $R_3$ là bao nhiêu ampe"], PN: [PN, "Công suất tiêu thụ của mạch ngoài là bao nhiêu oát"] } as Record<string, [number, string]>)[ask];
      need(val >= 0.05);
      const ft = fit(val);
      const src = rr === 0 ? `Nguồn điện có suất điện động ${E} V, điện trở trong không đáng kể` : `Nguồn điện có suất điện động ${E} V, điện trở trong ${vn(rr)} Ω`;
      return {
        stem: `${src}, mạch ngoài gồm điện trở $R_1 = ${R1}$ Ω mắc nối tiếp với đoạn mạch gồm $R_2 = ${R2}$ Ω song song với $R_3 = ${R3}$ Ω. ${txt}${ft.note}?`,
        ...short(ft.v, ft.dp),
        explanation: `$R_{23} = \\dfrac{R_2R_3}{R_2 + R_3} = ${tex(R23)}$ Ω; $R_N = R_1 + R_{23} = ${tex(RN)}$ Ω; $I = \\dfrac{${EMF}}{R_N + r} \\approx ${tex(I, 4)}$ A; $U_2 = U_3 = IR_{23} \\approx ${tex(U23, 4)}$ V; $I_3 = \\dfrac{U_3}{R_3} \\approx ${tex(I3, 4)}$ A; $\\mathscr{P}_N = I^2R_N \\approx ${tex(PN, 4)}$ W.`,
      };
    },
  },
  {
    id: "l11k2-s-cong-suat-cuc-dai", subject: S, grade: G, chapter: C4, topic: "Công suất cực đại trên biến trở (trả lời ngắn)",
    hk: 2, half: 2, tk: K4, level: 3, kind: "short",
    make: (r) => {
      const E = r.pick([6, 9, 12, 18, 24]), rr = r.pick([0.5, 1, 1.5, 2, 3]), R0 = r.pick([1, 2, 3, 4, 5, 6, 8, 10]), Rx = R0 + rr, Pm = (E * E) / (4 * Rx);
      const askR = r.chance(0.5);
      const ft = fit(askR ? Rx : Pm);
      return {
        stem: `Một nguồn điện có suất điện động ${E} V, điện trở trong ${vn(rr)} Ω được nối với mạch ngoài gồm điện trở $R_0 = ${R0}$ Ω mắc nối tiếp với biến trở $R_x$. ${askR ? "Để công suất tiêu thụ trên biến trở lớn nhất thì $R_x$ phải bằng bao nhiêu ôm" : "Công suất tiêu thụ lớn nhất trên biến trở là bao nhiêu oát"}${ft.note}?`,
        ...short(ft.v, ft.dp),
        explanation: `Coi $R_0$ gộp với nguồn thành nguồn tương đương có điện trở trong $r' = R_0 + r = ${tex(Rx)}$ Ω. $\\mathscr{P}_x = \\dfrac{${EMF}^2R_x}{(R_x + r')^2}$ lớn nhất khi $R_x = r' = ${tex(Rx)}$ Ω, khi đó $\\mathscr{P}_{\\max} = \\dfrac{${EMF}^2}{4r'} = \\dfrac{${E}^2}{4\\cdot ${tex(Rx)}} \\approx ${tex(Pm, 3)}$ W.`,
      };
    },
  },
];

export const TEMPLATES: Template[] = [...H1, ...H2];
