/* Vật lí 10 – học kì 1 (Kết nối tri thức).
   half 1: Mở đầu + Động học; half 2: Động lực học. */
import { mcq, tf, short, tex, vn, need, sqrtTex, round, type Template, type Rng } from "./core.ts";

const S = "Vật lí", G = 10 as const;
const C1 = "Chương I. Mở đầu", C2 = "Chương II. Động học", C3 = "Chương III. Động lực học";
const NAMES = ["An", "Bình", "Chi", "Dũng", "Hà", "Hùng", "Lan", "Linh", "Minh", "Nam", "Phong", "Quân", "Trang", "Vy"];

/* ---------------- tiện ích ---------------- */
const U = (x: number, u: string, dp = 2) => `${vn(x, dp)} ${u}`;
const pickN = <T,>(r: Rng, a: readonly T[], n: number): T[] => r.shuffle([...a]).slice(0, n);
const isInt = (x: number) => Math.abs(x - Math.round(x)) < 1e-9;
const okDp = (x: number, dp: number) => isInt(round(x * Math.pow(10, dp), 6));
const ok4 = (x: number, dp = 2) => vn(x, dp).length <= 4;
const gTxt = (g: number) => `$g = ${tex(g)}$ m/s²`;
const ABC = ["a", "b", "c", "d"];
/** lời giải Đúng/Sai: "a) … → Đúng." */
const tfExp = (st: { t: string; a: boolean }[], why: string[]) =>
  st.map((s, i) => `${ABC[i]}) ${why[i]} → ${s.a ? "Đúng" : "Sai"}.`).join(" ");
/** mỗi ý: [phát biểu đúng, phát biểu sai]; chọn ngẫu nhiên phiên bản */
function tfv(r: Rng, items: [string, string][]) {
  return tf(items.map(([t, f]) => (r.chance(0.5) ? [t, true] : [f, false]) as [string, boolean]));
}
/** câu lí thuyết: chọn 1 phát biểu đúng + 3 sai (hoặc ngược lại) */
function theory(r: Rng, T: readonly string[], F: readonly string[], stemT: string | string[], stemF: string | string[], why: (c: string, askT: boolean) => string) {
  const askT = r.chance(0.5);
  const pk = (x: string | string[]) => (Array.isArray(x) ? r.pick(x) : x);
  const c = r.pick(askT ? T : F);
  const w = pickN(r, askT ? F : T, 3);
  return { stem: askT ? pk(stemT) : pk(stemF), ...mcq(r, c, w), explanation: why(c, askT) };
}
const eq = (x: number, dp: number) => (okDp(x, dp) ? "=" : "\\approx");
const f2 = (v: number) => v.toFixed(2).replace(".", "{,}");
const lc = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/* ================= HALF 1: MỞ ĐẦU ================= */
const SAFE = [
  "Tắt công tắc nguồn của thiết bị điện trước khi cắm hoặc tháo thiết bị",
  "Chỉ cắm thiết bị điện vào nguồn có hiệu điện thế phù hợp với hiệu điện thế định mức của thiết bị",
  "Đeo kính bảo hộ, găng tay khi làm thí nghiệm với nguồn nhiệt hoặc vật dễ vỡ",
  "Đọc kĩ hướng dẫn sử dụng và quan sát các kí hiệu trên thiết bị trước khi sử dụng",
  "Kiểm tra cẩn thận dụng cụ thí nghiệm trước khi sử dụng",
  "Sắp xếp gọn gàng, vệ sinh dụng cụ sau khi kết thúc thí nghiệm",
  "Báo ngay cho giáo viên khi phát hiện dây điện bị hở hoặc thiết bị có dấu hiệu bất thường",
  "Bố trí dây điện gọn gàng, tránh vướng chân khi đi lại",
];
const UNSAFE = [
  "Dùng tay chạm trực tiếp vào chỗ dây điện bị hở khi nguồn điện đang bật",
  "Rút phích cắm bằng cách cầm vào dây điện và giật mạnh",
  "Để chất dễ cháy gần thiết bị đang được đốt nóng",
  "Ăn uống, đùa nghịch trong phòng thí nghiệm",
  "Tự ý tiến hành thí nghiệm khi chưa có sự cho phép của giáo viên",
  "Cắm thiết bị điện có hiệu điện thế định mức 110 V vào ổ điện 220 V",
  "Dùng nước để dập đám cháy do chập điện khi chưa ngắt nguồn điện",
  "Tiếp tục sử dụng dụng cụ thủy tinh đã bị nứt vỡ",
];
const LAB = ["Khi làm thí nghiệm Vật lí trong phòng thí nghiệm", "Trong giờ thực hành Vật lí", "Khi sử dụng các thiết bị điện trong phòng thí nghiệm", "Theo quy tắc an toàn trong phòng thực hành", "Khi tiến hành thí nghiệm theo nhóm", "Để đảm bảo an toàn cho bản thân và các bạn trong phòng thí nghiệm"];
const SIGNS = [
  { d: "hình tam giác đều, viền đen, nền vàng, bên trong có hình tia sét", m: "Cảnh báo nguy hiểm về điện", g: 0 },
  { d: "hình tam giác đều, viền đen, nền vàng, bên trong có hình ngọn lửa", m: "Cảnh báo chất dễ cháy", g: 0 },
  { d: "hình tam giác đều, viền đen, nền vàng, bên trong có hình đầu lâu xương chéo", m: "Cảnh báo chất độc", g: 0 },
  { d: "hình tam giác đều, viền đen, nền vàng, bên trong có dấu chấm than", m: "Cảnh báo nguy hiểm, cần thận trọng", g: 0 },
  { d: "hình tam giác đều, viền đen, nền vàng, bên trong có hình chất lỏng nhỏ xuống bàn tay", m: "Cảnh báo chất ăn mòn", g: 0 },
  { d: "hình tròn, viền đỏ, nền trắng, có gạch chéo đỏ đè lên hình que diêm đang cháy", m: "Cấm lửa", g: 1 },
  { d: "hình tròn, viền đỏ, nền trắng, có gạch chéo đỏ đè lên hình cốc nước", m: "Cấm uống nước", g: 1 },
  { d: "hình tròn, viền đỏ, nền trắng, có gạch chéo đỏ đè lên hình bàn tay", m: "Cấm chạm tay vào", g: 1 },
  { d: "hình tròn, nền xanh lam, bên trong có hình kính bảo hộ màu trắng", m: "Bắt buộc đeo kính bảo hộ", g: 2 },
  { d: "hình tròn, nền xanh lam, bên trong có hình đôi găng tay màu trắng", m: "Bắt buộc đeo găng tay bảo hộ", g: 2 },
  { d: "hình chữ nhật, nền xanh lá, có hình người chạy qua cửa", m: "Lối thoát hiểm", g: 3 },
  { d: "hình vuông, nền đỏ, có hình bình chữa cháy màu trắng", m: "Vị trí đặt bình chữa cháy", g: 3 },
];
const SYS = [
  "Kim của đồng hồ đo điện chưa được chỉnh về vạch số 0 trước khi đo",
  "Thước đo bị mòn mất một đoạn ở đầu có vạch số 0",
  "Cân điện tử chưa được hiệu chỉnh nên hiện 0,2 g khi chưa đặt vật lên",
  "Đồng hồ bấm giây luôn chạy chậm hơn so với đồng hồ chuẩn",
  "Vạch chia trên nhiệt kế bị in lệch so với giá trị đúng",
  "Dụng cụ đo có độ chia nhỏ nhất quá lớn so với đại lượng cần đo",
];
const RAND = [
  "Phản xạ của người bấm đồng hồ khi thì nhanh, khi thì chậm trong các lần đo",
  "Gió thổi thất thường làm ảnh hưởng đến chuyển động của vật trong các lần đo",
  "Nhiệt độ phòng thay đổi không theo quy luật trong quá trình đo",
  "Bàn thí nghiệm bị rung nhẹ một cách ngẫu nhiên khi đọc kết quả",
  "Thao tác đặt thước của người đo không giống nhau giữa các lần đo",
  "Điện áp nguồn dao động bất thường trong khi tiến hành các lần đo",
];
const MEAS = [
  { what: "thời gian một viên bi lăn hết một máng nghiêng", sym: "t", unit: "s", lo: 150, hi: 350, dc: 0.01 },
  { what: "chu kì dao động của một con lắc đơn", sym: "T", unit: "s", lo: 120, hi: 250, dc: 0.01 },
  { what: "thời gian rơi của một viên bi từ một độ cao cố định", sym: "t", unit: "s", lo: 40, hi: 90, dc: 0.01 },
  { what: "đường kính một viên bi (dùng thước kẹp)", sym: "d", unit: "mm", lo: 1000, hi: 2500, dc: 0.02 },
  { what: "chiều dài một cuốn sách", sym: "\\ell", unit: "cm", lo: 2400, hi: 2800, dc: 0.05 },
  { what: "khối lượng một vật nhỏ (dùng cân điện tử)", sym: "m", unit: "g", lo: 4500, hi: 5500, dc: 0.01 },
];
/** bộ số đo: giá trị trung bình đẹp, độ lệch nguyên (đơn vị 0,01) */
function measSet(r: Rng, n: number, lo: number, hi: number) {
  const base = r.int(lo, hi);
  const d: number[] = []; for (let i = 0; i < n - 1; i++) d.push(r.int(-3, 3));
  const last = -d.reduce((a, b) => a + b, 0); need(Math.abs(last) <= 4); d.push(last);
  const absS = d.reduce((a, b) => a + Math.abs(b), 0); need(absS > 0 && d.some((x) => x !== d[0]));
  return { base, d, absS, vals: d.map((x) => (base + x) / 100), mean: base / 100, dbar: absS / n / 100, maxd: Math.max(...d.map(Math.abs)) / 100 };
}
const measTable = (sym: string, unit: string, vals: number[]) =>
  `$\\begin{array}{|c|${"c|".repeat(vals.length)}}\\hline \\text{Lần đo} & ${vals.map((_, i) => i + 1).join(" & ")} \\\\ \\hline ${sym}\\ (\\text{${unit}}) & ${vals.map(f2).join(" & ")} \\\\ \\hline\\end{array}$`;

const VEC = ["Độ dịch chuyển", "Vận tốc", "Gia tốc", "Lực", "Trọng lực", "Vận tốc trung bình"];
const SCA = ["Quãng đường đi được", "Tốc độ", "Thời gian", "Khối lượng", "Tốc độ trung bình", "Nhiệt độ"];

const GIATOC_T = [
  "Gia tốc là đại lượng vectơ, đặc trưng cho sự biến thiên nhanh hay chậm của vận tốc",
  "Đơn vị của gia tốc trong hệ SI là m/s²",
  "Trong chuyển động thẳng nhanh dần đều, vectơ gia tốc cùng chiều với vectơ vận tốc",
  "Trong chuyển động thẳng chậm dần đều, vectơ gia tốc ngược chiều với vectơ vận tốc",
  "Trong chuyển động thẳng biến đổi đều, gia tốc không đổi theo thời gian",
  "Đồ thị vận tốc – thời gian của chuyển động thẳng biến đổi đều là một đoạn thẳng",
  "Độ dốc của đồ thị vận tốc – thời gian cho biết gia tốc của vật",
  "Diện tích giới hạn bởi đồ thị vận tốc – thời gian và trục thời gian cho biết độ dịch chuyển của vật",
  "Ở cùng một nơi gần mặt đất, mọi vật rơi tự do với cùng một gia tốc",
];
const GIATOC_F = [
  "Trong chuyển động thẳng chậm dần đều, gia tốc luôn có giá trị âm",
  "Trong chuyển động thẳng nhanh dần đều, gia tốc luôn có giá trị dương",
  "Gia tốc cho biết vật chuyển động nhanh hay chậm",
  "Trong chuyển động thẳng biến đổi đều, vận tốc không đổi theo thời gian",
  "Đồ thị độ dịch chuyển – thời gian của chuyển động thẳng biến đổi đều là một đường thẳng",
  "Khi rơi tự do, vật nặng luôn rơi nhanh hơn vật nhẹ",
  "Đơn vị của gia tốc trong hệ SI là m/s",
  "Độ dốc của đồ thị vận tốc – thời gian cho biết độ dịch chuyển của vật",
];

const H1: Template[] = [
  {
    id: "l10-mo-dau-an-toan", subject: S, grade: G, chapter: C1, topic: "Quy tắc an toàn trong phòng thí nghiệm",
    half: 1, level: 1, kind: "mcq",
    make: (r) => theory(r, SAFE, UNSAFE,
      LAB.map((x) => `${x}, việc làm nào sau đây đảm bảo an toàn?`),
      LAB.map((x) => `${x}, việc làm nào sau đây KHÔNG đảm bảo an toàn?`),
      (c, t) => t ? `"${c}" là việc làm đúng quy tắc an toàn; các phương án còn lại đều có nguy cơ gây điện giật, cháy nổ hoặc tai nạn.`
        : `"${c}" vi phạm quy tắc an toàn (có thể gây điện giật, cháy nổ, tai nạn); các phương án còn lại là những việc nên làm.`),
  },
  {
    id: "l10-mo-dau-bien-bao", subject: S, grade: G, chapter: C1, topic: "Biển báo, kí hiệu an toàn",
    half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const s = r.pick(SIGNS);
      const others = r.shuffle(SIGNS.filter((x) => x !== s)).sort((a, b) => (a.g === s.g ? 0 : 1) - (b.g === s.g ? 0 : 1));
      const rule = "Quy ước: biển tam giác nền vàng là biển cảnh báo; biển tròn viền đỏ có gạch chéo là biển cấm; biển tròn nền xanh là biển bắt buộc; biển chữ nhật/vuông nền xanh lá hoặc đỏ là biển chỉ dẫn (thoát hiểm, phòng cháy).";
      if (r.chance(0.6)) {
        return {
          stem: `Trong phòng thí nghiệm, biển báo có dạng ${s.d} mang ý nghĩa nào sau đây?`,
          ...mcq(r, s.m, others.map((x) => x.m)),
          explanation: `Biển ${s.d} là biển "${s.m}". ${rule}`,
        };
      }
      return {
        stem: `Biển báo "${s.m}" trong phòng thí nghiệm có dạng nào sau đây?`,
        ...mcq(r, s.d.charAt(0).toUpperCase() + s.d.slice(1), others.map((x) => x.d.charAt(0).toUpperCase() + x.d.slice(1))),
        explanation: `Biển "${s.m}" có dạng ${s.d}. ${rule}`,
      };
    },
  },
  {
    id: "l10-sai-so-he-thong-ngau-nhien", subject: S, grade: G, chapter: C1, topic: "Sai số hệ thống và sai số ngẫu nhiên",
    half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const sys = r.chance(0.5);
      const c = r.pick(sys ? SYS : RAND), w = pickN(r, sys ? RAND : SYS, 3);
      return {
        stem: r.pick([
          `Nguyên nhân nào sau đây gây ra sai số ${sys ? "hệ thống" : "ngẫu nhiên"} khi đo một đại lượng vật lí?`,
          `Trong các trường hợp sau, trường hợp nào dẫn đến sai số ${sys ? "hệ thống" : "ngẫu nhiên"} của phép đo?`,
          `Khi thực hiện phép đo trong phòng thí nghiệm, trường hợp nào sau đây gây ra sai số ${sys ? "hệ thống" : "ngẫu nhiên"}?`,
          `Sai số ${sys ? "hệ thống" : "ngẫu nhiên"} có thể xuất hiện trong trường hợp nào sau đây?`,
          `Một nhóm học sinh tiến hành đo nhiều lần cùng một đại lượng. Yếu tố nào sau đây gây ra sai số ${sys ? "hệ thống" : "ngẫu nhiên"}?`,
          `Kết quả đo bị ảnh hưởng bởi sai số ${sys ? "hệ thống" : "ngẫu nhiên"} trong trường hợp nào sau đây?`,
        ]),
        ...mcq(r, c, w),
        explanation: sys
          ? `Sai số hệ thống do dụng cụ đo (hỏng, chưa hiệu chỉnh, độ chia thô…), làm kết quả lệch về một phía theo một quy luật. "${c}" là nguyên nhân như vậy; các phương án còn lại là nguyên nhân gây sai số ngẫu nhiên.`
          : `Sai số ngẫu nhiên do các yếu tố thay đổi thất thường (giác quan, thao tác, điều kiện bên ngoài), làm kết quả lúc lớn lúc nhỏ. "${c}" là nguyên nhân như vậy; các phương án còn lại gây sai số hệ thống.`,
      };
    },
  },
  {
    id: "l10-sai-so-tinh-toan", subject: S, grade: G, chapter: C1, topic: "Giá trị trung bình và sai số tuyệt đối",
    half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const c = r.pick(MEAS), n = r.pick([4, 5]);
      const m = measSet(r, n, c.lo, c.hi);
      const name = r.pick(NAMES);
      const intro = `Bạn ${name} đo ${c.what} ${n} lần, được kết quả như bảng sau:\n\n${measTable(c.sym, c.unit, m.vals)}\n\n`;
      const devs = m.d.map((x) => tex(Math.abs(x) / 100)).join(" + ");
      const sumV = m.vals.map(f2).join(" + ");
      const meanExp = `$\\overline{${c.sym}} = \\dfrac{${sumV}}{${n}} = ${tex(m.mean)}$ ${c.unit}.`;
      if (r.chance(0.35)) {
        const mx = Math.max(...m.vals), mn = Math.min(...m.vals);
        return {
          stem: intro + `Giá trị trung bình của ${c.sym === "\\ell" ? "chiều dài" : "đại lượng"} $${c.sym}$ là`,
          ...mcq(r, U(m.mean, c.unit), [U(round((mx + mn) / 2, 3), c.unit, 3), U(round(m.vals.reduce((a, b) => a + b, 0) / (n - 1), 2), c.unit), U(m.vals[0], c.unit), U(m.vals[n - 1], c.unit)]),
          explanation: meanExp,
        };
      }
      return {
        stem: intro + `Sai số tuyệt đối trung bình $\\overline{\\Delta ${c.sym}}$ của phép đo là`,
        ...mcq(r, U(m.dbar, c.unit, 4), [U(m.absS / 100, c.unit), U(m.maxd, c.unit), U(round(m.absS / (n - 1) / 100, 4), c.unit, 4), U(round(m.dbar + c.dc, 4), c.unit, 4)]),
        explanation: `${meanExp} Sai số tuyệt đối từng lần $\\Delta ${c.sym}_i = |${c.sym}_i - \\overline{${c.sym}}|$ lần lượt là ${m.d.map((x) => `$${tex(Math.abs(x) / 100)}$`).join("; ")}. Do đó $\\overline{\\Delta ${c.sym}} = \\dfrac{${devs}}{${n}} = ${tex(m.dbar, 4)}$ ${c.unit}.`,
      };
    },
  },
  {
    id: "l10-vecto-vo-huong", subject: S, grade: G, chapter: C2, topic: "Đại lượng vectơ và đại lượng vô hướng",
    half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const v = r.chance(0.5);
      const c = r.pick(v ? VEC : SCA); const w = pickN(r, (v ? SCA : VEC).filter((x) => !(c.includes("trung bình") && x.includes("trung bình"))), 3);
      return {
        stem: r.pick([
          `Đại lượng nào sau đây là đại lượng ${v ? "vectơ (có hướng)" : "vô hướng (không có hướng)"}?`,
          `Trong các đại lượng sau, đại lượng nào là đại lượng ${v ? "vectơ" : "vô hướng"}?`,
          `Khi mô tả chuyển động, đại lượng nào sau đây ${v ? "có hướng (là đại lượng vectơ)" : "không có hướng (là đại lượng vô hướng)"}?`,
          `Đại lượng nào sau đây ${v ? "được biểu diễn bằng một mũi tên (vectơ)" : "chỉ có độ lớn, không có phương và chiều"}?`,
          `Đại lượng vật lí nào sau đây ${v ? "có cả độ lớn, phương và chiều" : "là đại lượng vô hướng"}?`,
          `Trong Vật lí, đại lượng nào sau đây ${v ? "là đại lượng vectơ" : "không phải là đại lượng vectơ"}?`,
        ]),
        ...mcq(r, c, w),
        explanation: `Độ dịch chuyển, vận tốc, gia tốc, lực là các đại lượng vectơ (có độ lớn, phương, chiều); quãng đường, tốc độ, thời gian, khối lượng, nhiệt độ là đại lượng vô hướng. Vậy đáp án là "${c}".`,
      };
    },
  },
  {
    id: "l10-doi-don-vi-toc-do", subject: S, grade: G, chapter: C2, topic: "Đổi đơn vị tốc độ km/h – m/s",
    half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const who = r.pick(["Một ô tô", "Một đoàn tàu", "Một xe máy", "Một chiếc ca nô", "Một vận động viên đua xe đạp", "Một máy bay trực thăng"]);
      if (r.chance(0.5)) {
        const kmh = r.pick([18, 36, 45, 54, 72, 90, 108, 126, 144, 180]); const ms = kmh / 3.6;
        return {
          stem: `${who} chuyển động với tốc độ ${kmh} km/h. Tốc độ này bằng`,
          ...mcq(r, U(ms, "m/s"), [U(kmh * 3.6, "m/s", 1), U(kmh / 60, "m/s"), U(kmh / 36, "m/s"), U(kmh * 10 / 36 * 10, "m/s")]),
          explanation: `$1\\ \\text{km/h} = \\dfrac{1000\\ \\text{m}}{3600\\ \\text{s}} = \\dfrac{1}{3{,}6}$ m/s nên $${kmh}\\ \\text{km/h} = \\dfrac{${kmh}}{3{,}6} = ${tex(ms)}$ m/s.`,
        };
      }
      const ms = r.pick([5, 10, 12, 15, 20, 25, 30, 35, 40]); const kmh = ms * 3.6;
      return {
        stem: `${who} chuyển động với tốc độ ${ms} m/s. Tốc độ này bằng`,
        ...mcq(r, U(kmh, "km/h", 1), [U(ms / 3.6, "km/h", 2), U(ms * 60, "km/h"), U(ms * 36, "km/h"), U(ms * 3.6 / 10, "km/h", 2)]),
        explanation: `$1$ m/s $= \\dfrac{0{,}001\\ \\text{km}}{\\frac{1}{3600}\\ \\text{h}} = 3{,}6$ km/h nên $${ms}$ m/s $= ${ms}\\cdot 3{,}6 = ${tex(kmh, 1)}$ km/h.`,
      };
    },
  },
  {
    id: "l10-do-dich-chuyen-quang-duong", subject: S, grade: G, chapter: C2, topic: "Độ dịch chuyển và quãng đường",
    half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const ctx = r.pick([
        { w: `Bạn ${r.pick(NAMES)} đi bộ`, u: "m", k: 10 }, { w: "Một chiếc xe máy chạy", u: "km", k: 1 }, { w: "Một con kiến bò", u: "cm", k: 1 },
        { w: "Một chiếc thuyền đi", u: "km", k: 1 }, { w: "Một người chạy bộ", u: "m", k: 50 },
      ]);
      const askD = r.chance(0.6);
      if (r.chance(0.5)) {
        const [d1, d2] = r.pick([["Đông", "Tây"], ["Tây", "Đông"], ["Bắc", "Nam"], ["Nam", "Bắc"]]);
        const a = r.int(3, 15) * ctx.k, b = r.int(1, 14) * ctx.k; need(a !== b);
        const disp = Math.abs(a - b), dist = a + b;
        const dirTxt = a > b ? `hướng ${d1}` : `hướng ${d2}`;
        const correct = askD ? disp : dist;
        return {
          stem: `${ctx.w} thẳng về hướng ${d1} được ${a} ${ctx.u}, sau đó quay lại đi thẳng về hướng ${d2} được ${b} ${ctx.u}. ${askD ? "Độ lớn độ dịch chuyển" : "Quãng đường đi được"} trong cả quá trình là`,
          ...mcq(r, U(correct, ctx.u), [U(askD ? dist : disp, ctx.u), U(a, ctx.u), U(b, ctx.u), U((a + b) / 2, ctx.u), U(2 * a, ctx.u)]),
          explanation: `Quãng đường $s = ${a} + ${b} = ${dist}$ ${ctx.u}. Độ dịch chuyển là vectơ nối vị trí đầu với vị trí cuối, có độ lớn $d = |${a} - ${b}| = ${disp}$ ${ctx.u}${disp ? `, hướng về ${dirTxt}` : ""}.`,
        };
      }
      const [p, q, c] = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 6, 10], [9, 12, 15], [8, 15, 17], [12, 5, 13], [4, 3, 5]]);
      const a = p * ctx.k, b = q * ctx.k, cc = c * ctx.k;
      const [d1, d2] = r.pick([["Bắc", "Đông"], ["Nam", "Tây"], ["Đông", "Nam"], ["Tây", "Bắc"]]);
      return {
        stem: `${ctx.w} thẳng về hướng ${d1} được ${a} ${ctx.u}, sau đó rẽ sang hướng ${d2} đi thẳng tiếp ${b} ${ctx.u}. ${askD ? "Độ lớn độ dịch chuyển" : "Quãng đường đi được"} trong cả quá trình là`,
        ...mcq(r, U(askD ? cc : a + b, ctx.u), [U(askD ? a + b : cc, ctx.u), U(Math.abs(a - b), ctx.u), U(Math.max(a, b), ctx.u), U(a * a + b * b, ctx.u)]),
        explanation: `Quãng đường $s = ${a} + ${b} = ${a + b}$ ${ctx.u}. Hai đoạn đường vuông góc nên độ lớn độ dịch chuyển $d = \\sqrt{${a}^2 + ${b}^2} = ${cc}$ ${ctx.u}.`,
      };
    },
  },
  {
    id: "l10-toc-do-trung-binh", subject: S, grade: G, chapter: C2, topic: "Tốc độ trung bình",
    half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const ctx = r.pick([{ w: "Một ô tô", lo: 4, hi: 18 }, { w: "Một xe máy", lo: 4, hi: 12 }, { w: `Bạn ${r.pick(NAMES)} đi xe đạp`, lo: 2, hi: 5 }, { w: "Một xe buýt", lo: 4, hi: 12 }]);
      const v1 = r.int(ctx.lo, ctx.hi) * 5, v2 = r.int(ctx.lo, ctx.hi) * 5; need(v1 !== v2);
      const type = r.pick(["halfS", "halfS", "time", "halfT"]);
      if (type === "halfS") {
        const v = 2 * v1 * v2 / (v1 + v2); need(okDp(v, 1));
        return {
          stem: `${ctx.w} đi trên một đoạn đường thẳng. Trên nửa đầu của đoạn đường, xe đi với tốc độ trung bình ${v1} km/h; trên nửa sau, xe đi với tốc độ trung bình ${v2} km/h. Tốc độ trung bình của xe trên cả đoạn đường là`,
          ...mcq(r, U(v, "km/h", 1), [U((v1 + v2) / 2, "km/h", 1), U(round(v1 * v2 / (v1 + v2), 1), "km/h", 1), U(Math.abs(v1 - v2), "km/h"), U(v1 + v2, "km/h")]),
          explanation: `Gọi quãng đường là $2s$. Thời gian đi: $t = \\dfrac{s}{${v1}} + \\dfrac{s}{${v2}}$. Tốc độ trung bình $v = \\dfrac{2s}{t} = \\dfrac{2\\cdot ${v1}\\cdot ${v2}}{${v1} + ${v2}} = ${tex(v, 1)}$ km/h (không phải trung bình cộng hai tốc độ).`,
        };
      }
      if (type === "halfT") {
        const v = (v1 + v2) / 2;
        return {
          stem: `${ctx.w} chuyển động thẳng. Trong nửa đầu thời gian chuyển động, xe đi với tốc độ trung bình ${v1} km/h; trong nửa sau thời gian, xe đi với tốc độ trung bình ${v2} km/h. Tốc độ trung bình của xe trong cả thời gian chuyển động là`,
          ...mcq(r, U(v, "km/h", 1), [U(round(2 * v1 * v2 / (v1 + v2), 1), "km/h", 1), U(v1 + v2, "km/h"), U(Math.abs(v1 - v2), "km/h"), U(round(v1 * v2 / (v1 + v2), 1), "km/h", 1)]),
          explanation: `Gọi mỗi nửa thời gian là $t$. Quãng đường $s = ${v1}t + ${v2}t$. Tốc độ trung bình $v = \\dfrac{s}{2t} = \\dfrac{${v1} + ${v2}}{2} = ${tex(v, 1)}$ km/h.`,
        };
      }
      const t1 = r.pick([0.5, 1, 1.5, 2]), t2 = r.pick([0.5, 1, 1.5, 2, 2.5]);
      const s1 = v1 * t1, s2 = v2 * t2, v = (s1 + s2) / (t1 + t2); need(okDp(v, 1) && t1 !== t2);
      return {
        stem: `${ctx.w} chuyển động thẳng: trong ${vn(t1)} giờ đầu đi với tốc độ ${v1} km/h, trong ${vn(t2)} giờ tiếp theo đi với tốc độ ${v2} km/h. Tốc độ trung bình của xe trong cả quá trình là`,
        ...mcq(r, U(v, "km/h", 1), [U((v1 + v2) / 2, "km/h", 1), U(s1 + s2, "km/h"), U(round(2 * v1 * v2 / (v1 + v2), 1), "km/h", 1), U(round((s1 + s2) / 2, 1), "km/h", 1)]),
        explanation: `Quãng đường: $s = ${v1}\\cdot ${tex(t1)} + ${v2}\\cdot ${tex(t2)} = ${tex(s1 + s2)}$ km. Tốc độ trung bình $v = \\dfrac{s}{t} = \\dfrac{${tex(s1 + s2)}}{${tex(t1 + t2)}} = ${tex(v, 1)}$ km/h.`,
      };
    },
  },
  {
    id: "l10-tong-hop-van-toc", subject: S, grade: G, chapter: C2, topic: "Tổng hợp vận tốc",
    half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const boat = r.pick(["Một ca nô", "Một chiếc thuyền máy", "Một chiếc xuồng máy", "Một con thuyền"]);
      const type = r.pick(["xuoi", "nguoc", "vuong", "tau", "time"]);
      if (type === "vuong") {
        const [p, q, c] = r.pick([[4, 3, 5], [8, 6, 10], [12, 5, 13], [15, 8, 17], [12, 9, 15], [24, 7, 25], [16, 12, 20]]);
        return {
          stem: `${boat} chạy với vận tốc ${p} km/h so với nước, mũi thuyền luôn hướng vuông góc với bờ sông. Nước chảy với vận tốc ${q} km/h so với bờ. Độ lớn vận tốc của thuyền so với bờ là`,
          ...mcq(r, U(c, "km/h"), [U(p + q, "km/h"), U(p - q, "km/h"), U(p, "km/h"), U(round(Math.sqrt(p * p - q * q), 1), "km/h", 1)]),
          explanation: `$\\vec v_{13} = \\vec v_{12} + \\vec v_{23}$ với $\\vec v_{12} \\perp \\vec v_{23}$ nên $v_{13} = \\sqrt{${p}^2 + ${q}^2} = ${c}$ km/h.`,
        };
      }
      if (type === "tau") {
        const vt = r.int(8, 20) * 5, u = r.int(3, 8); const same = r.chance(0.5);
        const vv = same ? vt + u : vt - u;
        return {
          stem: `Một đoàn tàu chạy thẳng đều với tốc độ ${vt} km/h so với mặt đất. Một hành khách đi dọc theo toa tàu với tốc độ ${u} km/h so với toa, ${same ? "cùng chiều" : "ngược chiều"} chuyển động của tàu. Tốc độ của hành khách so với mặt đất là`,
          ...mcq(r, U(vv, "km/h"), [U(same ? vt - u : vt + u, "km/h"), U(vt, "km/h"), U(u, "km/h"), U(round(Math.sqrt(vt * vt + u * u), 1), "km/h", 1)]),
          explanation: `Vận tốc người so với đất $\\vec v_{13} = \\vec v_{12} + \\vec v_{23}$. Hai vận tốc ${same ? "cùng chiều" : "ngược chiều"} nên $v_{13} = ${vt} ${same ? "+" : "-"} ${u} = ${vv}$ km/h.`,
        };
      }
      const vb = r.int(10, 30), vn_ = r.int(2, 6); need(vb > vn_ + 3);
      const down = type === "xuoi" || (type === "time" && r.chance(0.5));
      const v = down ? vb + vn_ : vb - vn_;
      if (type === "time") {
        const t = r.pick([0.5, 1, 1.5, 2, 2.5, 3]); const d = v * t;
        return {
          stem: `${boat} chạy ${down ? "xuôi dòng" : "ngược dòng"} từ bến A đến bến B cách nhau ${vn(d)} km. Vận tốc của thuyền so với nước là ${vb} km/h, vận tốc của nước so với bờ là ${vn_} km/h. Thời gian thuyền đi từ A đến B là`,
          ...mcq(r, U(t, "giờ"), [U(round(d / (down ? vb - vn_ : vb + vn_), 2), "giờ"), U(round(d / vb, 2), "giờ"), U(round(d / vn_, 2), "giờ"), U(round(2 * t, 2), "giờ")]),
          explanation: `Khi ${down ? "xuôi dòng" : "ngược dòng"}: $v = ${vb} ${down ? "+" : "-"} ${vn_} = ${v}$ km/h. Thời gian $t = \\dfrac{${tex(d)}}{${v}} = ${tex(t)}$ giờ.`,
        };
      }
      return {
        stem: `${boat} chạy ${down ? "xuôi dòng" : "ngược dòng"} sông. Vận tốc của thuyền so với nước là ${vb} km/h, vận tốc của dòng nước so với bờ là ${vn_} km/h. Tốc độ của thuyền so với bờ là`,
        ...mcq(r, U(v, "km/h"), [U(down ? vb - vn_ : vb + vn_, "km/h"), U(vb, "km/h"), U(round(Math.sqrt(vb * vb + vn_ * vn_), 1), "km/h", 1), U(round((vb + vn_) / 2, 1), "km/h", 1)]),
        explanation: `$\\vec v_{13} = \\vec v_{12} + \\vec v_{23}$; khi ${down ? "xuôi dòng hai vận tốc cùng chiều" : "ngược dòng hai vận tốc ngược chiều"} nên $v_{13} = ${vb} ${down ? "+" : "-"} ${vn_} = ${v}$ km/h.`,
      };
    },
  },
  {
    id: "l10-do-thi-dich-chuyen-thoi-gian", subject: S, grade: G, chapter: C2, topic: "Đồ thị độ dịch chuyển – thời gian",
    half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const T = r.pick([1, 2, 5]); const k1 = r.pick([2, 3]), k2 = k1 + r.pick([1, 2]);
      const vA = r.int(1, 5), vC = -r.int(1, 4);
      const d: number[] = [];
      for (let i = 0; i <= 6; i++) d.push(i <= k1 ? vA * i * T : i <= k2 ? vA * k1 * T : vA * k1 * T + vC * (i - k2) * T);
      need(d[6] >= 0);
      const ts = d.map((_, i) => i * T);
      const tbl = `$\\begin{array}{|c|c|c|c|c|c|c|c|}\\hline t\\ (\\text{s}) & ${ts.join(" & ")} \\\\ \\hline d\\ (\\text{m}) & ${d.join(" & ")} \\\\ \\hline\\end{array}$`;
      const intro = `Một vật chuyển động thẳng. Đồ thị độ dịch chuyển – thời gian của vật gồm các đoạn thẳng nối liền các điểm cho trong bảng sau:\n\n${tbl}\n\n`;
      const seg = r.pick(["A", "B", "C", "C", "S"]);
      if (seg === "S") {
        const s = vA * k1 * T + Math.abs(vC) * (6 - k2) * T;
        return {
          stem: intro + `Quãng đường vật đi được từ thời điểm $t = 0$ đến $t = ${6 * T}$ s là`,
          ...mcq(r, U(s, "m"), [U(d[6], "m"), U(vA * k1 * T, "m"), U(s + vA * k1 * T, "m"), U(Math.abs(vC) * (6 - k2) * T, "m")]),
          explanation: `Từ $0$ đến $${k1 * T}$ s vật đi được $${vA * k1 * T}$ m; từ $${k1 * T}$ s đến $${k2 * T}$ s vật đứng yên; từ $${k2 * T}$ s đến $${6 * T}$ s vật đi ngược lại $${Math.abs(vC) * (6 - k2) * T}$ m. Quãng đường $s = ${vA * k1 * T} + ${Math.abs(vC) * (6 - k2) * T} = ${s}$ m (độ dịch chuyển chỉ là $${d[6]}$ m).`,
        };
      }
      let a: number, b: number, v: number;
      if (seg === "A") { a = 0; b = k1; v = vA; } else if (seg === "B") { a = k1; b = k2; v = 0; } else { a = k2; b = 6; v = vC; }
      const dd = d[b] - d[a], dt = (b - a) * T;
      const wrong = [U(dd, "m/s"), U(-v || vA, "m/s"), U(round(d[b] / ts[b], 2), "m/s"), U(round(d[6] / ts[6], 2), "m/s"), U(vA, "m/s")];
      return {
        stem: intro + `Vận tốc của vật trong khoảng thời gian từ $t = ${ts[a]}$ s đến $t = ${ts[b]}$ s là`,
        ...mcq(r, U(v, "m/s"), wrong),
        explanation: `Vận tốc bằng độ dốc của đồ thị: $v = \\dfrac{\\Delta d}{\\Delta t} = \\dfrac{${d[b]} - ${d[a]}}{${ts[b]} - ${ts[a]}} = ${tex(dd / dt)}$ m/s${v < 0 ? " (dấu âm: vật chuyển động ngược chiều dương)" : v === 0 ? " (vật đứng yên)" : ""}.`,
      };
    },
  },
  {
    id: "l10-gia-toc-ly-thuyet", subject: S, grade: G, chapter: C2, topic: "Gia tốc, chuyển động biến đổi – lí thuyết",
    half: 1, level: 1, kind: "mcq",
    make: (r) => theory(r, GIATOC_T, GIATOC_F,
      ["Phát biểu nào sau đây là đúng?", "Khi nói về gia tốc và chuyển động thẳng biến đổi đều, phát biểu nào sau đây đúng?", "Khi nói về chuyển động thẳng biến đổi đều và rơi tự do, phát biểu nào sau đây đúng?", "Chọn phát biểu đúng.", "Khi nói về độ dốc và diện tích dưới đồ thị vận tốc – thời gian, cùng các tính chất của gia tốc, phát biểu nào sau đây đúng?"],
      ["Phát biểu nào sau đây là SAI?", "Khi nói về gia tốc và chuyển động thẳng biến đổi đều, phát biểu nào sau đây SAI?", "Khi nói về chuyển động thẳng biến đổi đều và rơi tự do, phát biểu nào sau đây KHÔNG đúng?", "Chọn phát biểu sai.", "Khi nói về độ dốc và diện tích dưới đồ thị vận tốc – thời gian, cùng các tính chất của gia tốc, phát biểu nào sau đây sai?"],
      (c, t) => t ? `"${c}" là phát biểu đúng. Lưu ý: dấu của gia tốc phụ thuộc chiều dương được chọn; chuyển động nhanh dần khi $a$ cùng dấu $v$, chậm dần khi $a$ trái dấu $v$.`
        : `"${c}" là phát biểu sai. Lưu ý: dấu của gia tốc phụ thuộc chiều dương được chọn; chuyển động nhanh dần khi $a$ cùng dấu $v$, chậm dần khi $a$ trái dấu $v$; đồ thị $v - t$ là đoạn thẳng, độ dốc là gia tốc, diện tích là độ dịch chuyển.`),
  },
  {
    id: "l10-phuong-trinh-van-toc", subject: S, grade: G, chapter: C2, topic: "Phương trình vận tốc, độ dịch chuyển của CĐTBĐĐ",
    half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const opt = (v0: number, a: number) => `$v_0 = ${tex(v0)}$ m/s; $a = ${tex(a)}$ m/s²`;
      if (r.chance(0.5)) {
        const v0 = r.nz(-8, 20), a = r.nz(-5, 5); need(v0 !== a);
        return {
          stem: `Vận tốc của một vật chuyển động thẳng biến đổi đều phụ thuộc vào thời gian theo biểu thức $v = ${v0}${a < 0 ? " - " : " + "}${Math.abs(a) === 1 ? "" : Math.abs(a)}t$ ($v$ tính bằng m/s, $t$ tính bằng s). Vận tốc ban đầu và gia tốc của vật lần lượt là`,
          ...mcq(r, opt(v0, a), [opt(a, v0), opt(v0, -a), opt(-v0, a), opt(v0, a / 2), opt(v0, 2 * a)]),
          explanation: `So sánh với $v = v_0 + at$: $v_0 = ${v0}$ m/s, $a = ${a}$ m/s².`,
        };
      }
      const v0 = r.int(1, 12), c = r.nz(-3, 4); need(v0 !== 2 * c && v0 !== c);
      const cT = Math.abs(c) === 1 ? "" : Math.abs(c);
      return {
        stem: `Độ dịch chuyển của một vật chuyển động thẳng biến đổi đều phụ thuộc vào thời gian theo biểu thức $d = ${v0}t${c < 0 ? " - " : " + "}${cT}t^2$ ($d$ tính bằng m, $t$ tính bằng s). Vận tốc ban đầu và gia tốc của vật lần lượt là`,
        ...mcq(r, opt(v0, 2 * c), [opt(v0, c), opt(2 * c, v0), opt(v0, c / 2), opt(v0, -2 * c)]),
        explanation: `So sánh với $d = v_0t + \\dfrac{1}{2}at^2$: $v_0 = ${v0}$ m/s và $\\dfrac{a}{2} = ${c}$ nên $a = ${2 * c}$ m/s².`,
      };
    },
  },
  {
    id: "l10-ham-phanh-cdbdd", subject: S, grade: G, chapter: C2, topic: "Chuyển động thẳng chậm dần đều – hãm phanh",
    half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const who = r.pick(["Một ô tô", "Một xe tải", "Một xe khách", "Một xe buýt", "Một xe máy"]);
      const kmh = r.pick([36, 54, 72, 90, 108]); const v = kmh / 3.6;
      const a = r.pick([0.5, 1, 1.25, 1.5, 2, 2.5, 4, 5]); const t = v / a; need(isInt(t) && t <= 40 && t >= 2);
      const s = v * v / (2 * a);
      const type = r.pick(["a", "s_t", "s_a", "t"]);
      const intro = `${who} đang chuyển động thẳng với tốc độ ${kmh} km/h thì hãm phanh, chuyển động chậm dần đều`;
      if (type === "a") return {
        stem: `${intro} và dừng lại sau ${t} s. Chọn chiều dương là chiều chuyển động. Gia tốc của xe là`,
        ...mcq(r, U(-a, "m/s²"), [U(a, "m/s²"), U(round(-kmh / t, 2), "m/s²"), U(round(-2 * v / t, 2), "m/s²"), U(round(-v / t / 2, 3), "m/s²", 3)]),
        explanation: `$v_0 = ${kmh}$ km/h $= ${tex(v)}$ m/s. $a = \\dfrac{v - v_0}{t} = \\dfrac{0 - ${tex(v)}}{${t}} = ${tex(-a)}$ m/s².`,
      };
      if (type === "s_t") return {
        stem: `${intro} và dừng lại sau ${t} s. Quãng đường xe đi được từ lúc hãm phanh đến khi dừng là`,
        ...mcq(r, U(s, "m", 1), [U(v * t, "m", 1), U(kmh * t / 2, "m", 1), U(kmh * t, "m", 1), U(round(s / 2, 2), "m")]),
        explanation: `$v_0 = ${tex(v)}$ m/s; $a = -\\dfrac{${tex(v)}}{${t}} = ${tex(-a)}$ m/s². $s = v_0t + \\dfrac{1}{2}at^2 = \\dfrac{v_0 t}{2} = \\dfrac{${tex(v)}\\cdot ${t}}{2} = ${tex(s, 1)}$ m.`,
      };
      if (type === "s_a") return {
        stem: `${intro} với gia tốc có độ lớn ${vn(a)} m/s². Quãng đường xe đi được từ lúc hãm phanh đến khi dừng là`,
        ...mcq(r, U(s, "m", 1), [U(v * v / a, "m", 1), U(round(v / (2 * a), 2), "m"), U(round(kmh * kmh / (2 * a), 1), "m", 1), U(t, "m")]),
        explanation: `$v_0 = ${tex(v)}$ m/s. Từ $v^2 - v_0^2 = 2as$ với $v = 0$, $a = -${tex(a)}$ m/s²: $s = \\dfrac{v_0^2}{2|a|} = \\dfrac{${tex(v)}^2}{2\\cdot ${tex(a)}} = ${tex(s, 1)}$ m.`,
      };
      return {
        stem: `${intro} với gia tốc có độ lớn ${vn(a)} m/s². Thời gian từ lúc hãm phanh đến khi xe dừng lại là`,
        ...mcq(r, U(t, "s"), [U(round(kmh / a, 1), "s", 1), U(2 * t, "s"), U(round(t / 2, 1), "s", 1), U(round(v * a, 2), "s")]),
        explanation: `$v_0 = ${kmh}$ km/h $= ${tex(v)}$ m/s. $t = \\dfrac{0 - v_0}{a} = \\dfrac{-${tex(v)}}{-${tex(a)}} = ${t}$ s.`,
      };
    },
  },
  {
    id: "l10-cong-thuc-doc-lap-thoi-gian", subject: S, grade: G, chapter: C2, topic: "Công thức $v^2 - v_0^2 = 2ad$",
    half: 1, level: 3, kind: "mcq",
    make: (r) => {
      const who = r.pick(["Một ô tô", "Một đoàn tàu", "Một xe máy", "Một xe buýt"]);
      const k1 = r.pick([0, 18, 36, 54, 72]), k2 = r.pick([18, 36, 54, 72, 90, 108]); need(k1 !== k2);
      const v1 = k1 / 3.6, v2 = k2 / 3.6;
      const a = r.pick([0.5, 1, 1.5, 2, 2.5, 4]); const s = Math.abs(v2 * v2 - v1 * v1) / (2 * a); need(isInt(s) && s <= 1000);
      const up = k2 > k1;
      const desc = k1 === 0 ? `${who} xuất phát từ trạng thái nghỉ, chuyển động thẳng nhanh dần đều và đạt tốc độ ${k2} km/h` : `${who} chuyển động thẳng ${up ? "nhanh dần đều" : "chậm dần đều"}, tốc độ ${up ? "tăng" : "giảm"} từ ${k1} km/h đến ${k2} km/h`;
      const lab = `$v_0 = ${tex(v1)}$ m/s, $v = ${tex(v2)}$ m/s.`;
      if (r.chance(0.5)) {
        return {
          stem: `${desc} sau khi đi được quãng đường ${s} m. Độ lớn gia tốc của xe là`,
          ...mcq(r, U(a, "m/s²"), [U(round(2 * a, 2), "m/s²"), U(round(Math.pow(v2 - v1, 2) / (2 * s), 2), "m/s²"), U(round(Math.abs(k2 * k2 - k1 * k1) / (2 * s), 1), "m/s²", 1), U(round(Math.abs(v2 - v1) / s, 3), "m/s²", 3)]),
          explanation: `${lab} $|a| = \\dfrac{|v^2 - v_0^2|}{2s} = \\dfrac{|${tex(v2)}^2 - ${tex(v1)}^2|}{2\\cdot ${s}} = ${tex(a)}$ m/s².`,
        };
      }
      return {
        stem: `${desc} với gia tốc có độ lớn ${vn(a)} m/s². Quãng đường xe đi được trong thời gian đó là`,
        ...mcq(r, U(s, "m"), [U(2 * s, "m"), U(round(Math.pow(v2 - v1, 2) / (2 * a), 1), "m", 1), U(round(Math.abs(k2 * k2 - k1 * k1) / (2 * a), 0), "m"), U(round(Math.abs(v2 - v1) / a, 1), "m", 1)]),
        explanation: `${lab} $s = \\dfrac{|v^2 - v_0^2|}{2|a|} = \\dfrac{|${tex(v2)}^2 - ${tex(v1)}^2|}{2\\cdot ${tex(a)}} = ${s}$ m.`,
      };
    },
  },
  {
    id: "l10-roi-tu-do-co-ban", subject: S, grade: G, chapter: C2, topic: "Rơi tự do – thời gian, tốc độ, độ cao",
    half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const g = r.pick([10, 10, 9.8]);
      const obj = r.pick(["Thả rơi một viên bi", "Một hòn đá rơi từ mép một vách đá", "Thả rơi một quả bóng từ tầng thượng một tòa nhà", "Một chiếc chìa khóa rơi từ ban công", "Thả rơi một vật nhỏ từ đỉnh tháp"]);
      const t = r.int(1, 6); const h = g * t * t / 2, v = g * t;
      const type = r.pick(["t", "v", "h", "vt"]);
      const base = `Lấy ${gTxt(g)}, bỏ qua lực cản của không khí.`;
      if (type === "t") return {
        stem: `${obj} không vận tốc đầu từ độ cao ${vn(h, 1)} m so với mặt đất. ${base} Thời gian rơi của vật là`,
        ...mcq(r, U(t, "s"), [U(t * t, "s"), U(round(t / Math.SQRT2, 2), "s"), U(round(h / g, 2), "s"), U(2 * t, "s")]),
        explanation: `$h = \\dfrac{1}{2}gt^2 \\Rightarrow t = \\sqrt{\\dfrac{2h}{g}} = \\sqrt{\\dfrac{2\\cdot ${tex(h, 1)}}{${tex(g)}}} = ${t}$ s.`,
      };
      if (type === "v") return {
        stem: `${obj} không vận tốc đầu từ độ cao ${vn(h, 1)} m so với mặt đất. ${base} Tốc độ của vật ngay trước khi chạm đất là`,
        ...mcq(r, U(v, "m/s", 1), [U(round(v / 2, 2), "m/s"), U(round(Math.sqrt(g * h), 2), "m/s"), U(round(2 * g * h, 1), "m/s", 1), U(round(g * t * t, 1), "m/s", 1)]),
        explanation: `$v = \\sqrt{2gh} = \\sqrt{2\\cdot ${tex(g)}\\cdot ${tex(h, 1)}} = ${tex(v, 1)}$ m/s (hoặc $t = ${t}$ s, $v = gt = ${tex(v, 1)}$ m/s).`,
      };
      if (type === "h") return {
        stem: `${obj} không vận tốc đầu, sau ${t} s thì chạm đất. ${base} Độ cao ban đầu của vật so với mặt đất là`,
        ...mcq(r, U(h, "m", 1), [U(g * t * t, "m", 1), U(g * t, "m", 1), U(round(g * t / 2, 1), "m", 1), U(round(h / 2, 2), "m")]),
        explanation: `$h = \\dfrac{1}{2}gt^2 = \\dfrac{1}{2}\\cdot ${tex(g)}\\cdot ${t}^2 = ${tex(h, 1)}$ m.`,
      };
      return {
        stem: `${obj} không vận tốc đầu. ${base} Tốc độ của vật sau ${t} s kể từ lúc bắt đầu rơi (vật chưa chạm đất) là`,
        ...mcq(r, U(v, "m/s", 1), [U(h, "m/s", 1), U(round(v / 2, 2), "m/s"), U(round(g * t * t, 1), "m/s", 1), U(round(g / t, 2), "m/s")]),
        explanation: `$v = gt = ${tex(g)}\\cdot ${t} = ${tex(v, 1)}$ m/s.`,
      };
    },
  },
  {
    id: "l10-roi-tu-do-giay-thu-n", subject: S, grade: G, chapter: C2, topic: "Rơi tự do – quãng đường trong giây thứ n",
    half: 1, level: 3, kind: "mcq",
    make: (r) => {
      const g = r.pick([10, 9.8]); const n = r.int(3, 8);
      const H = g * n * n / 2;
      const last = r.chance(0.5);
      const k = last ? n : r.int(2, n - 1);
      const ds = g * (2 * k - 1) / 2;
      const stem = last
        ? `Một vật được thả rơi tự do không vận tốc đầu từ độ cao ${vn(H, 1)} m so với mặt đất. Lấy ${gTxt(g)}. Quãng đường vật rơi được trong giây cuối cùng trước khi chạm đất là`
        : `Một vật được thả rơi tự do không vận tốc đầu từ một độ cao đủ lớn. Lấy ${gTxt(g)}. Quãng đường vật rơi được trong giây thứ ${k} là`;
      return {
        stem,
        ...mcq(r, U(ds, "m", 2), [U(g * k * k / 2, "m", 2), U(g * k, "m", 2), U(g * (k - 1) * (k - 1) / 2, "m", 2), U(g * (2 * k + 1) / 2, "m", 2)]),
        explanation: `${last ? `Thời gian rơi $t = \\sqrt{\\dfrac{2h}{g}} = ${n}$ s, giây cuối là giây thứ ${n}. ` : ""}Quãng đường rơi trong giây thứ ${k}: $\\Delta s = \\dfrac{1}{2}g\\cdot ${k}^2 - \\dfrac{1}{2}g\\cdot ${k - 1}^2 = \\dfrac{1}{2}\\cdot ${tex(g)}\\cdot(${k * k} - ${(k - 1) * (k - 1)}) = ${tex(ds)}$ m.`,
      };
    },
  },
  {
    id: "l10-nem-ngang", subject: S, grade: G, chapter: C2, topic: "Chuyển động ném ngang",
    half: 1, level: 3, kind: "mcq",
    make: (r) => {
      const c = r.pick([
        { s: (h: string, v: string) => `Một máy bay cứu trợ bay theo phương ngang ở độ cao ${h} m với tốc độ ${v} m/s thì thả một thùng hàng.`, ts: [6, 7, 8, 9, 10], vs: [50, 60, 70, 80, 90, 100, 120, 150] },
        { s: (h: string, v: string) => `Từ đỉnh một vách đá cao ${h} m so với mặt nước biển, một người ném một hòn đá theo phương ngang với tốc độ ${v} m/s.`, ts: [2, 3, 4, 5], vs: [5, 6, 8, 10, 12, 15, 20] },
        { s: (h: string, v: string) => `Một viên bi lăn khỏi mép một chiếc bàn cao ${h} m với tốc độ ${v} m/s theo phương ngang.`, ts: [0.3, 0.4, 0.5], vs: [1, 1.5, 2, 2.5, 3, 4] },
        { s: (h: string, v: string) => `Từ ban công cao ${h} m, một bạn nhỏ ném một quả bóng theo phương ngang với tốc độ ${v} m/s.`, ts: [1, 1.5, 2], vs: [3, 4, 5, 6, 8, 10] },
      ]);
      const t = r.pick(c.ts), v0 = r.pick(c.vs); const h = 5 * t * t, L = v0 * t;
      const stem0 = c.s(vn(h), vn(v0)) + " Bỏ qua lực cản không khí, lấy $g = 10$ m/s².";
      if (r.chance(0.6)) return {
        stem: `${stem0} Tầm xa của vật (khoảng cách theo phương ngang từ điểm ném đến điểm chạm đất) là`,
        ...mcq(r, U(L, "m"), [U(round(v0 * t * t, 2), "m"), U(round(L / Math.SQRT2, 2), "m"), U(round(L / 2, 2), "m"), U(round(v0 * 2 * h / 10, 2), "m"), U(2 * L, "m")]),
        explanation: `Thời gian rơi $t = \\sqrt{\\dfrac{2h}{g}} = \\sqrt{\\dfrac{2\\cdot ${tex(h)}}{10}} = ${tex(t)}$ s. Tầm xa $L = v_0t = ${tex(v0)}\\cdot ${tex(t)} = ${tex(L)}$ m.`,
      };
      return {
        stem: `${stem0} Thời gian chuyển động của vật kể từ lúc bắt đầu bay ra theo phương ngang đến lúc chạm ${c.s("", "").includes("biển") ? "mặt nước" : "đất"} là`,
        ...mcq(r, U(t, "s"), [U(round(t * t, 2), "s"), U(round(t / Math.SQRT2, 2), "s"), U(round(h / v0, 2), "s"), U(2 * t, "s")]),
        explanation: `Thời gian rơi của vật ném ngang chỉ phụ thuộc độ cao: $t = \\sqrt{\\dfrac{2h}{g}} = \\sqrt{\\dfrac{2\\cdot ${tex(h)}}{10}} = ${tex(t)}$ s.`,
      };
    },
  },

  /* ---------- Đúng/Sai ---------- */
  {
    id: "l10-tf-sai-so-phep-do", subject: S, grade: G, chapter: C1, topic: "Xử lí số liệu, sai số phép đo",
    half: 1, level: 2, kind: "tf",
    make: (r) => {
      const c = r.pick(MEAS), n = 4; const m = measSet(r, n, c.lo, c.hi);
      const D = round(m.dbar + c.dc, 4), del = round(D / m.mean * 100, 2), delW = round(m.dbar / m.mean * 100, 2);
      need(del !== delW);
      const u = c.unit, sy = c.sym;
      const st = tfv(r, [
        [`Giá trị trung bình của phép đo là $\\overline{${sy}} = ${tex(m.mean)}$ ${u}.`, `Giá trị trung bình của phép đo là $\\overline{${sy}} = ${tex(round((Math.max(...m.vals) + Math.min(...m.vals)) / 2 + (m.mean === round((Math.max(...m.vals) + Math.min(...m.vals)) / 2, 3) ? 0.01 : 0), 3), 3)}$ ${u}.`],
        [`Sai số tuyệt đối trung bình (sai số ngẫu nhiên) là $\\overline{\\Delta ${sy}} = ${tex(m.dbar, 4)}$ ${u}.`, `Sai số tuyệt đối trung bình (sai số ngẫu nhiên) là $\\overline{\\Delta ${sy}} = ${tex(m.dbar === m.maxd ? m.absS / 100 : m.maxd, 4)}$ ${u}.`],
        [`Kết quả đo được viết là $${sy} = ${tex(m.mean)} \\pm ${tex(D, 4)}$ (${u}).`, `Kết quả đo được viết là $${sy} = ${tex(m.mean)} \\pm ${tex(m.dbar, 4)}$ (${u}).`],
        [`Sai số tương đối của phép đo xấp xỉ $${tex(del)}\\%$.`, `Sai số tương đối của phép đo xấp xỉ $${tex(delW)}\\%$.`],
      ]);
      return {
        stem: `Một nhóm học sinh đo ${c.what} ${n} lần, được kết quả như bảng dưới. Sai số dụng cụ là $${tex(c.dc)}$ ${u}; sai số tuyệt đối của phép đo bằng tổng sai số ngẫu nhiên và sai số dụng cụ.\n\n${measTable(sy, u, m.vals)}`,
        ...st,
        explanation: tfExp(st.statements, [
          `$\\overline{${sy}} = \\dfrac{${m.vals.map(f2).join(" + ")}}{${n}} = ${tex(m.mean)}$ ${u}`,
          `Các sai số $|${sy}_i - \\overline{${sy}}|$: ${m.d.map((x) => `$${tex(Math.abs(x) / 100)}$`).join("; ")} nên $\\overline{\\Delta ${sy}} = ${tex(m.dbar, 4)}$ ${u}`,
          `$\\Delta ${sy} = \\overline{\\Delta ${sy}} + \\Delta ${sy}_{dc} = ${tex(m.dbar, 4)} + ${tex(c.dc)} = ${tex(D, 4)}$ ${u}, kết quả $${sy} = ${tex(m.mean)} \\pm ${tex(D, 4)}$ (${u})`,
          `$\\delta = \\dfrac{\\Delta ${sy}}{\\overline{${sy}}}\\cdot 100\\% = \\dfrac{${tex(D, 4)}}{${tex(m.mean)}}\\cdot 100\\% \\approx ${tex(del)}\\%$`,
        ]),
      };
    },
  },
  {
    id: "l10-tf-chuyen-dong-bien-doi-deu", subject: S, grade: G, chapter: C2, topic: "Chuyển động thẳng biến đổi đều",
    half: 1, level: 2, kind: "tf",
    make: (r) => {
      const who = r.pick(["Một ô tô", "Một xe máy", "Một xe buýt", "Một xe tải"]);
      const a = r.pick([0.5, 1, 2, 2.5, 4, 5]), v0 = r.pick([10, 12, 15, 20, 25, 30]); const t = v0 / a; need(isInt(t) && t <= 30);
      const s = v0 * v0 / (2 * a); const t1 = r.int(1, Math.max(1, t - 1)); const v1 = v0 - a * t1;
      const aT = a === 1 ? "" : tex(a);
      const st = tfv(r, [
        [`Vận tốc ban đầu của xe là ${v0} m/s.`, `Vận tốc ban đầu của xe là ${v0} km/h.`],
        [`Xe chuyển động chậm dần đều với gia tốc $a = -${tex(a)}$ m/s².`, `Xe chuyển động nhanh dần đều với gia tốc $a = ${tex(a)}$ m/s².`],
        [`Sau ${t1} s kể từ lúc hãm phanh, tốc độ của xe là ${vn(v1)} m/s.`, `Sau ${t1} s kể từ lúc hãm phanh, tốc độ của xe là ${vn(v0 + a * t1)} m/s.`],
        [`Quãng đường xe đi được từ lúc hãm phanh đến khi dừng hẳn là ${vn(s)} m.`, `Quãng đường xe đi được từ lúc hãm phanh đến khi dừng hẳn là ${vn(2 * s)} m.`],
      ]);
      return {
        stem: `${who} đang chuyển động thẳng thì hãm phanh. Chọn chiều dương là chiều chuyển động, gốc thời gian lúc bắt đầu hãm phanh. Vận tốc của xe phụ thuộc thời gian theo biểu thức $v = ${v0} - ${aT}t$ ($v$ tính bằng m/s, $t$ tính bằng s).`,
        ...st,
        explanation: tfExp(st.statements, [
          `So sánh với $v = v_0 + at$: $v_0 = ${v0}$ m/s`,
          `$a = -${tex(a)}$ m/s² ngược dấu với $v$ nên xe chuyển động chậm dần đều`,
          `$v = ${v0} - ${tex(a)}\\cdot ${t1} = ${tex(v1)}$ m/s`,
          `Xe dừng khi $v = 0$; $s = \\dfrac{v_0^2}{2|a|} = \\dfrac{${v0}^2}{2\\cdot ${tex(a)}} = ${tex(s)}$ m`,
        ]),
      };
    },
  },
  {
    id: "l10-tf-roi-tu-do", subject: S, grade: G, chapter: C2, topic: "Rơi tự do",
    half: 1, level: 3, kind: "tf",
    make: (r) => {
      const n = r.int(3, 7), g = 10; const h = 5 * n * n, v = 10 * n, last = 5 * (2 * n - 1);
      const k = r.int(1, n - 1); const hk = 5 * k * k; const rem = h - hk; const vk = 10 * k;
      const obj = r.pick(["Một vật nhỏ", "Một viên bi sắt", "Một hòn sỏi", "Một quả cầu kim loại"]);
      const st = tfv(r, [
        [`Chuyển động của vật là chuyển động thẳng nhanh dần đều với gia tốc bằng $g$.`, `Chuyển động của vật là chuyển động thẳng đều với tốc độ bằng $g$.`],
        [`Thời gian rơi của vật là ${n} s.`, `Thời gian rơi của vật là ${n * n === 2 * h / g ? n * n : 2 * n} s.`],
        [`Quãng đường vật rơi được trong giây cuối cùng là ${last} m.`, `Quãng đường vật rơi được trong giây cuối cùng là ${5 * (n - 1) * (n - 1)} m.`],
        [`Khi vật còn cách mặt đất ${rem} m thì tốc độ của vật là ${vk} m/s.`, `Khi vật còn cách mặt đất ${rem} m thì tốc độ của vật là ${round(Math.sqrt(2 * g * rem), 1) === vk ? vk + 10 : vn(round(Math.sqrt(2 * g * rem), 1), 1)} m/s.`],
      ]);
      return {
        stem: `${obj} được thả rơi tự do không vận tốc đầu từ độ cao ${h} m so với mặt đất. Bỏ qua lực cản không khí, lấy $g = 10$ m/s².`,
        ...st,
        explanation: tfExp(st.statements, [
          `Rơi tự do là chuyển động thẳng nhanh dần đều, gia tốc $g$`,
          `$t = \\sqrt{\\dfrac{2h}{g}} = \\sqrt{\\dfrac{2\\cdot ${h}}{10}} = ${n}$ s`,
          `Trong ${n - 1} s đầu vật rơi $\\dfrac{1}{2}\\cdot 10\\cdot ${n - 1}^2 = ${5 * (n - 1) * (n - 1)}$ m nên giây cuối rơi $${h} - ${5 * (n - 1) * (n - 1)} = ${last}$ m`,
          `Khi đó vật đã rơi $${h} - ${rem} = ${hk}$ m: $v = \\sqrt{2gs} = \\sqrt{2\\cdot 10\\cdot ${hk}} = ${vk}$ m/s`,
        ]),
      };
    },
  },
  {
    id: "l10-tf-nem-ngang", subject: S, grade: G, chapter: C2, topic: "Chuyển động ném ngang",
    half: 1, level: 3, kind: "tf",
    make: (r) => {
      const [t, v0, vv] = r.pick([[2, 15, 25], [3, 40, 50], [4, 30, 50], [2, 21, 29], [4, 9, 41], [3, 16, 34], [4, 42, 58], [1, 24, 26], [3, 72, 78], [2, 48, 52]]);
      const h = 5 * t * t, L = v0 * t;
      const ctx = r.pick(["Từ một điểm ở độ cao", "Từ đỉnh một tòa nhà cao", "Từ mép một vách đá cao"]);
      const st = tfv(r, [
        [`Thời gian chuyển động của vật chỉ phụ thuộc vào độ cao ném, không phụ thuộc vào tốc độ ném.`, `Thời gian chuyển động của vật càng lớn khi tốc độ ném càng lớn.`],
        [`Thời gian từ lúc ném đến lúc vật chạm đất là ${t} s.`, `Thời gian từ lúc ném đến lúc vật chạm đất là ${t * t === t ? 2 * t : t * t} s.`],
        [`Tầm xa của vật là ${L} m.`, `Tầm xa của vật là ${t * t === t ? 2 * L : v0 * t * t} m.`],
        [`Tốc độ của vật ngay trước khi chạm đất là ${vv} m/s.`, `Tốc độ của vật ngay trước khi chạm đất là ${v0 + 10 * t} m/s.`],
      ]);
      return {
        stem: `${ctx} ${h} m so với mặt đất, một vật được ném theo phương ngang với tốc độ ban đầu ${v0} m/s. Bỏ qua lực cản không khí, lấy $g = 10$ m/s².`,
        ...st,
        explanation: tfExp(st.statements, [
          `$t = \\sqrt{\\dfrac{2h}{g}}$ chỉ phụ thuộc $h$`,
          `$t = \\sqrt{\\dfrac{2\\cdot ${h}}{10}} = ${t}$ s`,
          `$L = v_0t = ${v0}\\cdot ${t} = ${L}$ m`,
          `$v_y = gt = ${10 * t}$ m/s, $v = \\sqrt{v_0^2 + v_y^2} = \\sqrt{${v0}^2 + ${10 * t}^2} = ${vv}$ m/s (không cộng trực tiếp hai tốc độ)`,
        ]),
      };
    },
  },

  /* ---------- Trả lời ngắn ---------- */
  {
    id: "l10-s-doi-don-vi", subject: S, grade: G, chapter: C2, topic: "Đổi đơn vị tốc độ",
    half: 1, level: 1, kind: "short",
    make: (r) => {
      const who = r.pick(["một ô tô", "một con báo", "một đoàn tàu", "một vận động viên chạy 100 m", "một chiếc thuyền buồm", "một xe máy"]);
      if (r.chance(0.5)) {
        const kmh = r.pick([18, 27, 36, 45, 54, 63, 72, 81, 90, 99, 108, 117, 126]);
        return { stem: `Tốc độ của ${who} là ${kmh} km/h. Tốc độ này bằng bao nhiêu m/s?`, ...short(kmh / 3.6, 1), explanation: `$${kmh}\\ \\text{km/h} = \\dfrac{${kmh}}{3{,}6} = ${tex(kmh / 3.6, 1)}$ m/s.` };
      }
      const ms = r.pick([2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25, 30, 35]);
      return { stem: `Tốc độ của ${who} là ${vn(ms)} m/s. Tốc độ này bằng bao nhiêu km/h?`, ...short(ms * 3.6, 1), explanation: `$${tex(ms)}$ m/s $= ${tex(ms)}\\cdot 3{,}6 = ${tex(ms * 3.6, 1)}$ km/h.` };
    },
  },
  {
    id: "l10-s-toc-do-trung-binh", subject: S, grade: G, chapter: C2, topic: "Tốc độ trung bình",
    half: 1, level: 2, kind: "short",
    make: (r) => {
      const who = r.pick(["Một ô tô", "Một xe máy", "Một người đi xe đạp", "Một xe khách"]);
      const bk = who.includes("xe đạp"); const v1 = r.int(bk ? 2 : 4, bk ? 5 : 16) * 5, v2 = r.int(bk ? 2 : 4, bk ? 5 : 16) * 5; need(v1 !== v2);
      if (r.chance(0.5)) {
        const v = 2 * v1 * v2 / (v1 + v2); need(ok4(v, 1));
        return {
          stem: `${who} đi từ A đến B: nửa quãng đường đầu đi với tốc độ ${v1} km/h, nửa quãng đường sau đi với tốc độ ${v2} km/h. Tốc độ trung bình trên cả quãng đường AB là bao nhiêu km/h? (làm tròn đến hàng phần mười)`,
          ...short(v, 1),
          explanation: `$v_{tb} = \\dfrac{2v_1v_2}{v_1 + v_2} = \\dfrac{2\\cdot ${v1}\\cdot ${v2}}{${v1 + v2}} ${eq(v, 1)} ${tex(v, 1)}$ km/h.`,
        };
      }
      const big = !who.includes("xe đạp"); const s1 = r.int(2, big ? 30 : 8) * 5, s2 = r.int(2, big ? 30 : 8) * 5; const t1 = s1 / v1, t2 = s2 / v2; const v = (s1 + s2) / (t1 + t2); need(ok4(v, 1));
      return {
        stem: `${who} đi đoạn đường thứ nhất dài ${s1} km với tốc độ ${v1} km/h, sau đó đi tiếp đoạn đường thứ hai dài ${s2} km với tốc độ ${v2} km/h. Tốc độ trung bình trên cả hai đoạn đường là bao nhiêu km/h? (làm tròn đến hàng phần mười)`,
        ...short(v, 1),
        explanation: `$t_1 = \\dfrac{${s1}}{${v1}}$ h, $t_2 = \\dfrac{${s2}}{${v2}}$ h. $v_{tb} = \\dfrac{${s1} + ${s2}}{t_1 + t_2} = \\dfrac{${s1 + s2}}{${tex(round(t1 + t2, 4), 4)}} ${eq(v, 1)} ${tex(v, 1)}$ km/h.`,
      };
    },
  },
  {
    id: "l10-s-do-dich-chuyen", subject: S, grade: G, chapter: C2, topic: "Độ dịch chuyển tổng hợp",
    half: 1, level: 2, kind: "short",
    make: (r) => {
      const name = r.pick(NAMES), k = r.pick([1, 10, 20, 50, 100]);
      const [p, q] = [r.int(1, 12), r.int(1, 12)];
      const [a, b] = [p * k, q * k]; const d = Math.sqrt(a * a + b * b);
      need(ok4(round(d, 1), 1));
      const [d1, d2] = r.pick([["Đông", "Bắc"], ["Bắc", "Tây"], ["Nam", "Đông"], ["Tây", "Nam"]]);
      return {
        stem: `Từ nhà, bạn ${name} đi thẳng về hướng ${d1} ${a} m rồi rẽ sang hướng ${d2} đi thẳng ${b} m thì đến trường. Độ lớn độ dịch chuyển của ${name} từ nhà đến trường là bao nhiêu mét? (làm tròn đến hàng phần mười)`,
        ...short(d, 1),
        explanation: `Hai đoạn vuông góc: $d = \\sqrt{${a}^2 + ${b}^2} = \\sqrt{${a * a + b * b}} ${eq(d, 1)} ${tex(d, 1)}$ m.`,
      };
    },
  },
  {
    id: "l10-s-gia-toc", subject: S, grade: G, chapter: C2, topic: "Tính gia tốc",
    half: 1, level: 2, kind: "short",
    make: (r) => {
      const who = r.pick(["Một ô tô", "Một xe máy", "Một xe buýt", "Một xe tải", "Một xe khách"]);
      const k1 = r.pick([0, 18, 36, 54]), k2 = r.pick([36, 54, 72, 90]); need(k1 !== k2);
      const t = r.int(4, 25); const a = (k2 - k1) / 3.6 / t; need(ok4(round(a, 2), 2));
      const up = k2 > k1;
      return {
        stem: `${who} ${k1 === 0 ? "bắt đầu chuyển động nhanh dần đều từ trạng thái nghỉ" : `đang chuyển động thẳng với tốc độ ${k1} km/h thì ${up ? "tăng tốc" : "giảm tốc"} đều`}, sau ${t} s đạt tốc độ ${k2} km/h. Độ lớn gia tốc của xe là bao nhiêu m/s²? (làm tròn đến hàng phần trăm)`,
        ...short(Math.abs(a), 2),
        explanation: `$v_0 = ${tex(k1 / 3.6)}$ m/s, $v = ${tex(k2 / 3.6)}$ m/s. $|a| = \\dfrac{|v - v_0|}{t} = \\dfrac{${tex(Math.abs(k2 - k1) / 3.6)}}{${t}} \\approx ${tex(Math.abs(a))}$ m/s².`,
      };
    },
  },
  {
    id: "l10-s-quang-duong-cdbdd", subject: S, grade: G, chapter: C2, topic: "Quãng đường trong CĐTBĐĐ",
    half: 1, level: 3, kind: "short",
    make: (r) => {
      const who = r.pick(["Một ô tô", "Một xe máy", "Một xe tải", "Một xe đua"]);
      const v0 = r.pick([0, 2, 4, 5, 10]), a = r.pick([0.5, 1, 1.5, 2, 2.5, 3]), t = r.int(4, 12);
      if (r.chance(0.5)) {
        const s = v0 * t + a * t * t / 2; need(ok4(s, 1));
        return {
          stem: `${who} ${v0 === 0 ? "xuất phát từ trạng thái nghỉ" : `bắt đầu tăng tốc từ tốc độ ${v0} m/s`}, chuyển động thẳng nhanh dần đều với gia tốc ${vn(a)} m/s². Quãng đường xe đi được trong ${t} s đầu là bao nhiêu mét?${okDp(s, 1) ? "" : " (làm tròn đến hàng phần mười)"}`,
          ...short(s, 1),
          explanation: `$s = v_0t + \\dfrac{1}{2}at^2 = ${v0}\\cdot ${t} + \\dfrac{1}{2}\\cdot ${tex(a)}\\cdot ${t}^2 ${eq(s, 1)} ${tex(s, 1)}$ m.`,
        };
      }
      const sN = v0 + a * (2 * t - 1) / 2; need(ok4(sN, 2));
      return {
        stem: `${who} ${v0 === 0 ? "xuất phát từ trạng thái nghỉ" : `bắt đầu tăng tốc từ tốc độ ${v0} m/s`}, chuyển động thẳng nhanh dần đều với gia tốc ${vn(a)} m/s². Quãng đường xe đi được trong giây thứ ${t} là bao nhiêu mét?`,
        ...short(sN, 2),
        explanation: `$s_{${t}} = ${v0}\\cdot ${t} + \\dfrac{1}{2}\\cdot ${tex(a)}\\cdot ${t}^2 = ${tex(v0 * t + a * t * t / 2)}$ m; $s_{${t - 1}} = ${v0}\\cdot ${t - 1} + \\dfrac{1}{2}\\cdot ${tex(a)}\\cdot ${t - 1}^2 = ${tex(v0 * (t - 1) + a * (t - 1) * (t - 1) / 2)}$ m. Quãng đường trong giây thứ ${t}: $${tex(sN)}$ m.`,
      };
    },
  },
  {
    id: "l10-s-roi-tu-do", subject: S, grade: G, chapter: C2, topic: "Rơi tự do",
    half: 1, level: 3, kind: "short",
    make: (r) => {
      const g = r.pick([9.8, 10]);
      const type = r.pick(["t", "v", "last", "h"]);
      if (type === "t") {
        const h = r.int(5, 200); const t = Math.sqrt(2 * h / g); need(!isInt(t * 10));
        return { stem: `Thả rơi tự do một vật từ độ cao ${h} m so với mặt đất. Lấy ${gTxt(g)}, bỏ qua lực cản không khí. Thời gian rơi của vật là bao nhiêu giây? (làm tròn đến hàng phần trăm)`, ...short(t, 2), explanation: `$t = \\sqrt{\\dfrac{2h}{g}} = \\sqrt{\\dfrac{2\\cdot ${h}}{${tex(g)}}} \\approx ${tex(t)}$ s.` };
      }
      if (type === "v") {
        const h = r.int(5, 120); const v = Math.sqrt(2 * g * h); need(!isInt(v));
        return { stem: `Một vật rơi tự do không vận tốc đầu từ độ cao ${h} m. Lấy ${gTxt(g)}, bỏ qua lực cản không khí. Tốc độ của vật ngay trước khi chạm đất là bao nhiêu m/s? (làm tròn đến hàng phần mười)`, ...short(v, 1), explanation: `$v = \\sqrt{2gh} = \\sqrt{2\\cdot ${tex(g)}\\cdot ${h}} \\approx ${tex(v, 1)}$ m/s.` };
      }
      if (type === "h") {
        const t = r.pick([1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6]); const h = g * t * t / 2; need(ok4(round(h, 1), 1));
        return { stem: `Một hòn đá được thả rơi tự do từ miệng một cái giếng, sau ${vn(t)} s thì chạm đáy giếng. Lấy ${gTxt(g)}, bỏ qua lực cản không khí. Độ sâu của giếng là bao nhiêu mét? (làm tròn đến hàng phần mười)`, ...short(h, 1), explanation: `$h = \\dfrac{1}{2}gt^2 = \\dfrac{1}{2}\\cdot ${tex(g)}\\cdot ${tex(t)}^2 ${eq(h, 1)} ${tex(h, 1)}$ m.` };
      }
      const n = r.int(2, 9); const H = g * n * n / 2, ds = g * (2 * n - 1) / 2;
      return { stem: `Một vật rơi tự do không vận tốc đầu từ độ cao ${vn(H, 1)} m. Lấy ${gTxt(g)}, bỏ qua lực cản không khí. Quãng đường vật rơi được trong giây cuối cùng trước khi chạm đất là bao nhiêu mét? (làm tròn đến hàng phần mười)`, ...short(ds, 1), explanation: `$t = \\sqrt{\\dfrac{2h}{g}} = ${n}$ s. Trong ${n - 1} s đầu vật rơi $\\dfrac{1}{2}g\\cdot ${n - 1}^2 = ${tex(g * (n - 1) * (n - 1) / 2)}$ m nên giây cuối rơi $${tex(H)} - ${tex(g * (n - 1) * (n - 1) / 2)} = ${tex(ds)}$ m.` };
    },
  },
  {
    id: "l10-s-nem-ngang", subject: S, grade: G, chapter: C2, topic: "Ném ngang",
    half: 1, level: 3, kind: "short",
    make: (r) => {
      const g = 10;
      if (r.chance(0.5)) {
        const h = r.pick([20, 45, 80, 125, 180, 245, 320, 405, 500]); const t = Math.sqrt(2 * h / g); const v0 = r.int(3, 25) * (h > 200 ? 4 : 1); const L = v0 * t; need(ok4(round(L, 1), 1));
        return { stem: `Từ độ cao ${h} m so với mặt đất, một vật được ném theo phương ngang với tốc độ ${v0} m/s. Bỏ qua lực cản không khí, lấy $g = 10$ m/s². Tầm xa của vật là bao nhiêu mét? (làm tròn đến hàng phần mười)`, ...short(L, 1), explanation: `$t = \\sqrt{\\dfrac{2h}{g}} = \\sqrt{\\dfrac{2\\cdot ${h}}{10}} ${eq(t, 2)} ${tex(t)}$ s; $L = v_0t ${eq(L, 1)} ${tex(L, 1)}$ m.` };
      }
      const h = r.pick([0.8, 1.25, 1.8, 0.45]); const t = Math.sqrt(2 * h / g); const L = r.pick([0.6, 0.8, 1, 1.2, 1.5, 1.8, 2, 2.4]); const v0 = L / t; need(ok4(round(v0, 2), 2));
      return { stem: `Một viên bi lăn khỏi mép bàn cao ${vn(h)} m theo phương ngang và chạm sàn tại điểm cách chân bàn ${vn(L)} m (theo phương ngang). Bỏ qua lực cản không khí, lấy $g = 10$ m/s². Tốc độ của viên bi khi rời mép bàn là bao nhiêu m/s? (làm tròn đến hàng phần trăm)`, ...short(v0, 2), explanation: `$t = \\sqrt{\\dfrac{2h}{g}} = \\sqrt{\\dfrac{2\\cdot ${tex(h)}}{10}} = ${tex(t)}$ s; $v_0 = \\dfrac{L}{t} = \\dfrac{${tex(L)}}{${tex(t)}} ${eq(v0, 2)} ${tex(v0)}$ m/s.` };
    },
  },
];


/* ================= HALF 2: ĐỘNG LỰC HỌC ================= */
const INERTIA = [
  "Hành khách ngả người về phía trước khi xe buýt đang chạy đột ngột hãm phanh",
  "Hành khách ngả người về phía sau khi xe đang đứng yên đột ngột tăng tốc",
  "Giũ mạnh chiếc áo thì bụi bám trên áo bị văng ra",
  "Gõ mạnh đuôi cán búa xuống nền cứng để đầu búa ngập sâu vào cán",
  "Vận động viên chạy 100 m không thể dừng lại ngay sau khi về đích",
  "Người ngồi trên ô tô bị nghiêng sang trái khi xe rẽ gấp sang phải",
  "Rút nhanh tờ giấy đặt dưới cốc nước thì cốc nước gần như vẫn đứng yên",
];
const NOT_INERTIA = [
  "Quả táo chín rơi từ trên cây xuống đất",
  "Người bơi đạp chân vào thành bể để lao về phía trước",
  "Thuyền tiến lên phía trước khi người chèo đẩy mái chèo về phía sau",
  "Quả bóng bị bật ngược lại khi đập vào tường",
  "Tên lửa bay lên khi khí nóng phụt mạnh ra phía sau",
  "Lò xo bị nén lại khi đặt quả nặng lên trên",
  "Kim nam châm quay khi đưa thanh nam châm lại gần",
];
const N3_T = [
  "Lực và phản lực luôn xuất hiện và mất đi đồng thời",
  "Lực và phản lực có cùng giá, cùng độ lớn nhưng ngược chiều",
  "Lực và phản lực luôn cùng loại (cùng bản chất)",
  "Lực và phản lực đặt vào hai vật khác nhau nên không cân bằng nhau",
  "Khi búa đập vào đinh, lực búa tác dụng lên đinh có độ lớn bằng lực đinh tác dụng lên búa",
  "Khi xe tải va chạm với xe con, lực do xe tải tác dụng lên xe con có độ lớn bằng lực do xe con tác dụng lên xe tải",
];
const N3_F = [
  "Lực và phản lực là hai lực cân bằng",
  "Lực và phản lực đặt vào cùng một vật",
  "Lực tác dụng luôn xuất hiện trước phản lực",
  "Lực và phản lực có thể khác bản chất",
  "Khi búa đập vào đinh, lực búa tác dụng lên đinh lớn hơn lực đinh tác dụng lên búa",
  "Khi xe tải va chạm với xe con, lực do xe tải tác dụng lên xe con lớn hơn lực do xe con tác dụng lên xe tải",
];
const FR_T = [
  "Độ lớn của lực ma sát trượt tỉ lệ với độ lớn của áp lực",
  "Lực ma sát trượt không phụ thuộc vào diện tích tiếp xúc của vật",
  "Hệ số ma sát trượt phụ thuộc vào vật liệu và tình trạng của hai mặt tiếp xúc",
  "Lực ma sát trượt có chiều ngược với chiều chuyển động tương đối của vật so với bề mặt",
  "Hệ số ma sát trượt là đại lượng không có đơn vị",
  "Lực ma sát lăn thường nhỏ hơn nhiều so với lực ma sát trượt",
  "Lực cản của không khí tác dụng lên vật tăng khi tốc độ của vật tăng",
  "Lực cản của chất lưu phụ thuộc vào hình dạng của vật",
];
const FR_F = [
  "Lực ma sát trượt tỉ lệ với diện tích tiếp xúc của vật",
  "Hệ số ma sát trượt có đơn vị là niutơn (N)",
  "Lực ma sát trượt luôn cùng chiều với chiều chuyển động của vật",
  "Lực ma sát lúc nào cũng có hại",
  "Lực cản của không khí không phụ thuộc vào hình dạng của vật",
  "Lực ma sát trượt không phụ thuộc vào vật liệu của mặt tiếp xúc",
  "Lực cản của chất lưu giảm khi tốc độ của vật tăng",
];
const EQ_T = [
  "Moment lực đối với một trục quay đặc trưng cho tác dụng làm quay của lực",
  "Đơn vị của moment lực là N·m",
  "Cánh tay đòn của lực là khoảng cách từ trục quay đến giá của lực",
  "Lực có giá đi qua trục quay thì không làm vật quay quanh trục đó",
  "Ngẫu lực là hệ hai lực song song, ngược chiều, có độ lớn bằng nhau và cùng tác dụng vào một vật",
  "Muốn vật có trục quay cố định cân bằng thì tổng moment lực làm vật quay theo chiều kim đồng hồ phải bằng tổng moment lực làm vật quay ngược chiều kim đồng hồ",
  "Một vật rắn cân bằng khi tổng các lực tác dụng lên vật bằng không và tổng moment lực đối với một trục bất kì bằng không",
];
const EQ_F = [
  "Cánh tay đòn của lực là khoảng cách từ trục quay đến điểm đặt của lực",
  "Đơn vị của moment lực là N/m",
  "Ngẫu lực có hợp lực khác không nên làm vật chuyển động tịnh tiến",
  "Lực có giá đi qua trục quay có tác dụng làm quay mạnh nhất",
  "Moment lực không phụ thuộc vào khoảng cách từ trục quay đến giá của lực",
  "Vật rắn luôn cân bằng khi tổng các lực tác dụng lên nó bằng không",
];
const TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20], [7, 24, 25], [15, 20, 25], [20, 21, 29], [10, 24, 26], [12, 9, 15], [16, 12, 20], [30, 40, 50], [24, 10, 26]];
/** F cosα hoặc F sinα dạng LaTeX với α ∈ {30, 45, 60} */
function comp(F: number, ang: number, sin: boolean): { t: string; v: number } {
  const k = F / 2; const kk = k === 1 ? "" : String(k);
  const isHalf = (ang === 30 && sin) || (ang === 60 && !sin);
  if (isHalf) return { t: String(k), v: k };
  if (ang === 45) return { t: `${kk}\\sqrt{2}`, v: k * Math.SQRT2 };
  return { t: `${kk}\\sqrt{3}`, v: k * Math.sqrt(3) };
}
const resF2 = (a: number, b: number, ang: number) => a * a + b * b + 2 * a * b * ({ 0: 1, 60: 0.5, 90: 0, 120: -0.5, 180: -1 } as Record<number, number>)[ang];
const sqN = (n: number) => `$${n === 0 ? "0" : sqrtTex(n)}$ N`;
const KG = [0.2, 0.25, 0.4, 0.5, 0.8, 1, 1.5, 2, 2.5, 4, 5, 8, 10, 12, 20];
const mTxt = (m: number, useG: boolean) => (useG && m < 1 ? `${round(m * 1000)} g` : `${vn(m)} kg`);

const H2: Template[] = [
  {
    id: "l10-tong-hop-hai-luc", subject: S, grade: G, chapter: C3, topic: "Tổng hợp hai lực đồng quy",
    half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const F1 = r.int(2, 15), F2 = r.int(2, 15); need(F1 !== F2);
      const ang = r.pick([0, 60, 90, 90, 120, 180]);
      const all = [0, 60, 90, 120, 180].filter((x) => x !== ang).map((x) => sqN(resF2(F1, F2, x)));
      const F2v = resF2(F1, F2, ang);
      const where = r.pick(["một chất điểm", "một vật nhỏ", "cùng một điểm của một vật", "một chiếc vòng nhỏ"]);
      const cosT = ({ 0: "1", 60: "\\dfrac{1}{2}", 90: "0", 120: "\\left(-\\dfrac{1}{2}\\right)", 180: "(-1)" } as Record<number, string>)[ang];
      return {
        stem: `Hai lực có độ lớn $F_1 = ${F1}$ N và $F_2 = ${F2}$ N cùng tác dụng vào ${where}, hợp với nhau một góc $${ang}^\\circ$. Độ lớn hợp lực của hai lực là`,
        ...mcq(r, sqN(F2v), r.shuffle(all)),
        explanation: `$F = \\sqrt{F_1^2 + F_2^2 + 2F_1F_2\\cos\\alpha} = \\sqrt{${F1}^2 + ${F2}^2 + 2\\cdot ${F1}\\cdot ${F2}\\cdot ${cosT}} = ${F2v === 0 ? "0" : sqrtTex(F2v)}$ N.`,
      };
    },
  },
  {
    id: "l10-hop-luc-gioi-han", subject: S, grade: G, chapter: C3, topic: "Giới hạn độ lớn hợp lực",
    half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const F1 = r.int(3, 20), F2 = r.int(3, 20); const lo = Math.abs(F1 - F2), hi = F1 + F2; need(lo >= 3);
      const okv = r.int(lo, hi);
      const bad = r.shuffle([hi + 1, hi + r.int(2, 6), lo - 1, lo - r.int(2, 3), F1 * F1 + F2 * F2 > 99 ? hi + r.int(7, 12) : F1 * F1 + F2 * F2]);
      const ask = r.chance(0.5) ? "có thể" : "có thể nhận giá trị";
      return {
        stem: `Hai lực đồng quy có độ lớn ${F1} N và ${F2} N. Độ lớn hợp lực của chúng ${ask} là`,
        ...mcq(r, `${okv} N`, bad.filter((x) => x < lo || x > hi).map((x) => `${x} N`)),
        explanation: `$|F_1 - F_2| \\le F \\le F_1 + F_2 \\Rightarrow ${lo}\\ \\text{N} \\le F \\le ${hi}\\ \\text{N}$. Chỉ có giá trị ${okv} N thỏa mãn.`,
      };
    },
  },
  {
    id: "l10-phan-tich-luc", subject: S, grade: G, chapter: C3, topic: "Phân tích lực",
    half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const F = r.int(2, 30) * 2, ang = r.pick([30, 45, 60]);
      const ctx = r.pick([
        { s: "Một người kéo một thùng hàng trên sàn nằm ngang bằng một sợi dây", o: "thùng" },
        { s: "Một bạn học sinh kéo một chiếc vali trên mặt đường nằm ngang bằng tay kéo", o: "vali" },
        { s: "Một con ngựa kéo một chiếc xe trượt tuyết bằng sợi dây", o: "xe" },
        { s: "Một em bé kéo một chiếc xe đồ chơi bằng sợi dây", o: "xe" },
      ]);
      const horiz = r.chance(0.5);
      const c = comp(F, ang, !horiz), w1 = comp(F, ang, horiz);
      return {
        stem: `${ctx.s}. Lực kéo có độ lớn ${F} N, hướng chếch lên và hợp với phương ngang một góc $${ang}^\\circ$. Độ lớn thành phần của lực kéo theo phương ${horiz ? "ngang (làm " + ctx.o + " chuyển động về phía trước)" : "thẳng đứng"} là`,
        ...mcq(r, `$${c.t}$ N`, [`$${w1.t}$ N`, `$${F}$ N`, `$${F / 2 === c.v ? 2 * F : F / 2}$ N`, `$${F}\\sqrt{${ang === 45 ? 2 : 3}}$ N`]),
        explanation: `Phân tích $\\vec F$ thành hai thành phần: $F_x = F\\cos ${ang}^\\circ$ (phương ngang), $F_y = F\\sin ${ang}^\\circ$ (phương thẳng đứng). Vậy ${horiz ? `$F_x = ${F}\\cos ${ang}^\\circ` : `$F_y = ${F}\\sin ${ang}^\\circ`} = ${c.t}$ N.`,
      };
    },
  },
  {
    id: "l10-quan-tinh-newton-1", subject: S, grade: G, chapter: C3, topic: "Định luật I Newton – quán tính",
    half: 2, level: 1, kind: "mcq",
    make: (r) => theory(r, INERTIA, NOT_INERTIA,
      ["Hiện tượng nào sau đây được giải thích bằng quán tính?", "Hiện tượng nào sau đây là biểu hiện của quán tính?", "Trường hợp nào sau đây có liên quan đến quán tính của vật?", "Định luật I Newton (tính quán tính) giải thích được hiện tượng nào sau đây?", "Hiện tượng nào sau đây xảy ra do vật có xu hướng bảo toàn vận tốc?"],
      ["Hiện tượng nào sau đây KHÔNG được giải thích bằng quán tính?", "Hiện tượng nào sau đây KHÔNG phải là biểu hiện của quán tính?", "Trường hợp nào sau đây KHÔNG liên quan đến quán tính của vật?", "Định luật I Newton (tính quán tính) KHÔNG giải thích được hiện tượng nào sau đây?", "Hiện tượng nào sau đây KHÔNG xảy ra do vật có xu hướng bảo toàn vận tốc?"],
      (c, t) => t ? `Quán tính là tính chất của mọi vật có xu hướng bảo toàn vận tốc cả về hướng và độ lớn. "${c}" được giải thích bằng quán tính; các hiện tượng còn lại do tác dụng của trọng lực, lực đàn hồi, lực từ hoặc lực và phản lực (định luật III Newton).`
        : `"${c}" là kết quả tác dụng của lực (trọng lực, lực đàn hồi, lực từ hoặc cặp lực – phản lực), không phải do quán tính; các hiện tượng còn lại là biểu hiện của quán tính (vật có xu hướng bảo toàn vận tốc).`),
  },
  {
    id: "l10-newton-3-ly-thuyet", subject: S, grade: G, chapter: C3, topic: "Định luật III Newton",
    half: 2, level: 1, kind: "mcq",
    make: (r) => theory(r, N3_T, N3_F,
      ["Phát biểu nào sau đây về lực và phản lực là đúng?", "Theo định luật III Newton, phát biểu nào sau đây đúng?", "Khi hai vật tương tác với nhau, phát biểu nào sau đây đúng?", "Chọn phát biểu đúng về cặp lực và phản lực.", "Phát biểu nào sau đây phù hợp với định luật III Newton?"],
      ["Phát biểu nào sau đây về lực và phản lực là SAI?", "Theo định luật III Newton, phát biểu nào sau đây KHÔNG đúng?", "Khi hai vật tương tác với nhau, phát biểu nào sau đây sai?", "Chọn phát biểu sai về cặp lực và phản lực.", "Phát biểu nào sau đây KHÔNG phù hợp với định luật III Newton?"],
      (c, t) => `Định luật III Newton: $\\vec F_{AB} = -\\vec F_{BA}$; lực và phản lực cùng giá, cùng độ lớn, ngược chiều, cùng bản chất, xuất hiện đồng thời và đặt vào hai vật khác nhau (nên không cân bằng nhau). Vậy "${c}" là phát biểu ${t ? "đúng" : "sai"}.`),
  },
  {
    id: "l10-newton-2", subject: S, grade: G, chapter: C3, topic: "Định luật II Newton",
    half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const m = r.pick(KG), a = r.pick([0.5, 1, 1.5, 2, 2.5, 3, 4, 5]); const F = m * a; need(okDp(F, 2));
      const useG = r.chance(0.6); const mt = mTxt(m, useG); const mNum = useG && m < 1 ? m * 1000 : m;
      const obj = r.pick(["Một vật", "Một chiếc xe đồ chơi", "Một khối gỗ", "Một quả bóng", "Một chiếc xe lăn thí nghiệm"]);
      const type = r.pick(["a", "a", "F", "m", "v", "s"]);
      const t = r.int(2, 6);
      if (type === "a") return {
        stem: `${obj} có khối lượng ${mt} chịu tác dụng của hợp lực có độ lớn ${vn(F)} N. Gia tốc của vật có độ lớn là`,
        ...mcq(r, U(a, "m/s²"), [U(round(F / mNum, 4), "m/s²", 4), U(round(F * m, 2), "m/s²"), U(round(m / F, 3), "m/s²", 3), U(round(F * mNum, 2), "m/s²")]),
        explanation: `$m = ${tex(m)}$ kg. Theo định luật II Newton: $a = \\dfrac{F}{m} = \\dfrac{${tex(F)}}{${tex(m)}} = ${tex(a)}$ m/s².`,
      };
      if (type === "F") return {
        stem: `Để truyền cho ${lc(obj)} có khối lượng ${mt} một gia tốc ${vn(a)} m/s² thì hợp lực tác dụng lên vật phải có độ lớn là`,
        ...mcq(r, U(F, "N"), [U(round(mNum * a, 2), "N"), U(round(m / a, 3), "N", 3), U(round(a / m, 3), "N", 3), U(round(m * 10 * a, 2), "N")]),
        explanation: `$m = ${tex(m)}$ kg. $F = ma = ${tex(m)}\\cdot ${tex(a)} = ${tex(F)}$ N.`,
      };
      if (type === "m") return {
        stem: `Một hợp lực có độ lớn ${vn(F)} N tác dụng vào ${lc(obj)} làm vật thu được gia tốc ${vn(a)} m/s². Khối lượng của vật là`,
        ...mcq(r, U(m, "kg"), [U(round(F * a, 2), "kg"), U(round(a / F, 3), "kg", 3), U(round(F / a / 10, 3), "kg", 3), U(round(F / a * 10, 2), "kg")]),
        explanation: `$m = \\dfrac{F}{a} = \\dfrac{${tex(F)}}{${tex(a)}} = ${tex(m)}$ kg.`,
      };
      const v = a * t, s = a * t * t / 2;
      if (type === "v") return {
        stem: `${obj} có khối lượng ${mt} đang đứng yên trên mặt phẳng nằm ngang nhẵn thì chịu tác dụng của lực kéo ${vn(F)} N theo phương ngang. Tốc độ của vật sau ${t} s là`,
        ...mcq(r, U(v, "m/s"), [U(s, "m/s"), U(round(F * t / mNum, 4), "m/s", 4), U(round(v / 2, 2), "m/s"), U(round(F * t, 2), "m/s")]),
        explanation: `$a = \\dfrac{F}{m} = \\dfrac{${tex(F)}}{${tex(m)}} = ${tex(a)}$ m/s²; $v = at = ${tex(a)}\\cdot ${t} = ${tex(v)}$ m/s.`,
      };
      return {
        stem: `${obj} có khối lượng ${mt} đang đứng yên trên mặt phẳng nằm ngang nhẵn thì chịu tác dụng của lực kéo ${vn(F)} N theo phương ngang. Quãng đường vật đi được sau ${t} s là`,
        ...mcq(r, U(s, "m"), [U(a * t * t, "m"), U(v, "m"), U(round(F * t * t / 2 / mNum, 4), "m", 4), U(round(s / 2, 2), "m")]),
        explanation: `$a = \\dfrac{F}{m} = ${tex(a)}$ m/s²; $s = \\dfrac{1}{2}at^2 = \\dfrac{1}{2}\\cdot ${tex(a)}\\cdot ${t}^2 = ${tex(s)}$ m.`,
      };
    },
  },
  {
    id: "l10-trong-luc", subject: S, grade: G, chapter: C3, topic: "Trọng lực, khối lượng và trọng lượng",
    half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const g = r.pick([9.8, 10]);
      const c = r.pick([
        { s: `Một học sinh có khối lượng`, u: "kg", f: 1, vals: [40, 45, 48, 50, 52, 55, 60] },
        { s: `Một quả táo có khối lượng`, u: "g", f: 0.001, vals: [150, 200, 250, 300] },
        { s: `Một chiếc ô tô có khối lượng`, u: "tấn", f: 1000, vals: [1, 1.2, 1.5, 2, 2.5] },
        { s: `Một bao gạo có khối lượng`, u: "kg", f: 1, vals: [5, 10, 20, 25, 50] },
        { s: `Một hộp bút có khối lượng`, u: "g", f: 0.001, vals: [100, 120, 180, 400, 500] },
      ]);
      const mv = r.pick(c.vals); const m = mv * c.f; const P = m * g;
      if (r.chance(0.75)) return {
        stem: `${c.s} ${vn(mv)} ${c.u}. Lấy ${gTxt(g)}. Trọng lượng của ${c.s.replace(/^Một /, "").replace(/ có khối lượng$/, "")} là`,
        ...mcq(r, U(P, "N", 2), [U(mv, "N"), U(round(mv * g, 2), "N"), U(round(m / g, 3), "N", 3), U(round(m * (g === 10 ? 9.8 : 10), 2), "N")]),
        explanation: `$m = ${tex(m, 3)}$ kg; $P = mg = ${tex(m, 3)}\\cdot ${tex(g)} = ${tex(P)}$ N.`,
      };
      const W = [`$P = mg$, có hướng thẳng đứng từ trên xuống, điểm đặt tại trọng tâm của vật`, `$P = mg$, có hướng thẳng đứng từ dưới lên, điểm đặt tại trọng tâm của vật`, `$P = \\dfrac{m}{g}$, có hướng thẳng đứng từ trên xuống`, `$P = mg$, có hướng vuông góc với mặt sàn đặt vật, điểm đặt tại mặt tiếp xúc`];
      return {
        stem: `${c.s} ${vn(mv)} ${c.u}, ở nơi có gia tốc rơi tự do $g$. Trọng lực tác dụng lên vật có độ lớn và hướng là`,
        ...mcq(r, W[0], W.slice(1)),
        explanation: `Trọng lực là lực hấp dẫn của Trái Đất tác dụng lên vật: độ lớn $P = mg$, phương thẳng đứng, chiều từ trên xuống, điểm đặt tại trọng tâm của vật.`,
      };
    },
  },
  {
    id: "l10-ma-sat-ly-thuyet", subject: S, grade: G, chapter: C3, topic: "Lực ma sát, lực cản – lí thuyết",
    half: 2, level: 1, kind: "mcq",
    make: (r) => theory(r, FR_T, FR_F,
      ["Phát biểu nào sau đây về lực ma sát hoặc lực cản là đúng?", "Khi nói về lực ma sát trượt và lực cản của chất lưu, phát biểu nào sau đây đúng?", "Chọn phát biểu đúng.", "Phát biểu nào sau đây đúng?", "Một khối gỗ trượt trên mặt bàn. Phát biểu nào sau đây về lực ma sát (hoặc lực cản) là đúng?"],
      ["Phát biểu nào sau đây về lực ma sát hoặc lực cản là SAI?", "Khi nói về lực ma sát trượt và lực cản của chất lưu, phát biểu nào sau đây sai?", "Chọn phát biểu sai.", "Phát biểu nào sau đây KHÔNG đúng?", "Một khối gỗ trượt trên mặt bàn. Phát biểu nào sau đây về lực ma sát (hoặc lực cản) là sai?"],
      (c, t) => `Lực ma sát trượt $F_{mst} = \\mu N$: tỉ lệ với áp lực, không phụ thuộc diện tích tiếp xúc, phụ thuộc vật liệu và tình trạng mặt tiếp xúc, ngược chiều chuyển động tương đối; $\\mu$ không có đơn vị. Lực cản của chất lưu tăng theo tốc độ và phụ thuộc hình dạng vật. Vậy "${c}" là phát biểu ${t ? "đúng" : "sai"}.`),
  },
  {
    id: "l10-luc-ma-sat-truot", subject: S, grade: G, chapter: C3, topic: "Tính lực ma sát trượt",
    half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const g = r.pick([10, 9.8]);
      const obj = r.pick(["một thùng gỗ", "một chiếc tủ", "một bao xi măng", "một khối gỗ", "một kiện hàng"]);
      const m = r.int(2, 60), mu = r.pick([0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5]); const N = m * g, Fms = mu * N;
      const type = r.pick(["Fms", "mu", "F"]);
      if (type === "mu") return {
        stem: `Kéo ${obj} có khối lượng ${m} kg trượt trên sàn nằm ngang, lực ma sát trượt tác dụng lên vật có độ lớn ${vn(Fms)} N. Lấy ${gTxt(g)}. Hệ số ma sát trượt giữa vật và sàn là`,
        ...mcq(r, vn(mu), [vn(round(Fms / m, 3), 3), vn(round(N / Fms, 2)), vn(round(mu * 10, 2)), vn(round(mu / 2, 3), 3)]),
        explanation: `$N = mg = ${m}\\cdot ${tex(g)} = ${tex(N)}$ N. $\\mu = \\dfrac{F_{mst}}{N} = \\dfrac{${tex(Fms)}}{${tex(N)}} = ${tex(mu)}$.`,
      };
      return {
        stem: type === "Fms"
          ? `${obj.charAt(0).toUpperCase() + obj.slice(1)} có khối lượng ${m} kg trượt trên sàn nằm ngang. Hệ số ma sát trượt giữa vật và sàn là ${vn(mu)}. Lấy ${gTxt(g)}. Độ lớn lực ma sát trượt tác dụng lên vật là`
          : `Một người đẩy ${obj} có khối lượng ${m} kg chuyển động thẳng đều trên sàn nằm ngang bằng lực theo phương ngang. Hệ số ma sát trượt giữa vật và sàn là ${vn(mu)}. Lấy ${gTxt(g)}. Lực đẩy có độ lớn là`,
        ...mcq(r, U(Fms, "N"), [U(mu * m, "N"), U(N, "N"), U(round(N / mu, 1), "N", 1), U(round(Fms + N, 2), "N")]),
        explanation: `$N = mg = ${tex(N)}$ N; $F_{mst} = \\mu N = ${tex(mu)}\\cdot ${tex(N)} = ${tex(Fms)}$ N.${type === "F" ? ` Vật chuyển động thẳng đều nên lực đẩy cân bằng với lực ma sát: $F = F_{mst} = ${tex(Fms)}$ N.` : ""}`,
      };
    },
  },
  {
    id: "l10-keo-vat-co-ma-sat", subject: S, grade: G, chapter: C3, topic: "Định luật II Newton có lực ma sát",
    half: 2, level: 3, kind: "mcq",
    make: (r) => {
      const m = r.int(2, 50), mu = r.pick([0.1, 0.2, 0.25, 0.3, 0.4]), a = r.pick([0.5, 1, 1.5, 2, 2.5, 3]); const g = 10;
      const F = m * (a + mu * g); need(isInt(F));
      const obj = r.pick(["một thùng hàng", "một khối gỗ", "một chiếc xe đẩy chở hàng", "một hộp các-tông đựng sách"]);
      const type = r.pick(["a", "a", "F", "s"]);
      const fms = mu * m * g;
      if (type === "F") return {
        stem: `Kéo ${obj} có khối lượng ${m} kg trên sàn nằm ngang bằng lực $\\vec F$ theo phương ngang. Hệ số ma sát trượt giữa vật và sàn là ${vn(mu)}, lấy $g = 10$ m/s². Để vật chuyển động nhanh dần đều với gia tốc ${vn(a)} m/s² thì độ lớn lực kéo là`,
        ...mcq(r, U(F, "N"), [U(m * a, "N"), U(round(m * a + mu * m, 2), "N"), U(fms, "N"), U(m * (a + g), "N")]),
        explanation: `$F - \\mu mg = ma \\Rightarrow F = m(a + \\mu g) = ${m}(${tex(a)} + ${tex(mu)}\\cdot 10) = ${F}$ N.`,
      };
      const t = r.int(2, 6), s = a * t * t / 2;
      if (type === "s") return {
        stem: `Kéo ${obj} có khối lượng ${m} kg đang đứng yên trên sàn nằm ngang bằng lực ${F} N theo phương ngang. Hệ số ma sát trượt giữa vật và sàn là ${vn(mu)}, lấy $g = 10$ m/s². Quãng đường vật đi được sau ${t} s là`,
        ...mcq(r, U(s, "m"), [U(round(F / m * t * t / 2, 2), "m"), U(a * t * t, "m"), U(round((F + fms) / m * t * t / 2, 2), "m"), U(a * t, "m")]),
        explanation: `$a = \\dfrac{F - \\mu mg}{m} = \\dfrac{${F} - ${tex(fms)}}{${m}} = ${tex(a)}$ m/s²; $s = \\dfrac{1}{2}at^2 = ${tex(s)}$ m.`,
      };
      return {
        stem: `Một người kéo ${obj} có khối lượng ${m} kg trượt trên sàn nằm ngang bằng lực ${F} N theo phương ngang. Hệ số ma sát trượt giữa vật và sàn là ${vn(mu)}, lấy $g = 10$ m/s². Gia tốc của vật là`,
        ...mcq(r, U(a, "m/s²"), [U(round(F / m, 2), "m/s²"), U(round((F + fms) / m, 2), "m/s²"), U(round((F - mu * m) / m, 3), "m/s²", 3), U(round((F - fms) / (m * g), 3), "m/s²", 3)]),
        explanation: `Theo định luật II Newton (chiều dương là chiều chuyển động): $F - \\mu mg = ma \\Rightarrow a = \\dfrac{${F} - ${tex(mu)}\\cdot ${m}\\cdot 10}{${m}} = ${tex(a)}$ m/s².`,
      };
    },
  },
  {
    id: "l10-luc-cang-day", subject: S, grade: G, chapter: C3, topic: "Lực căng dây – vật chuyển động thẳng đứng",
    half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const g = r.pick([10, 9.8]);
      const c = r.pick([
        { s: (m: number) => `Một gàu nước khối lượng ${m} kg được kéo bằng một sợi dây nhẹ`, ms: [2, 3, 4, 5, 6, 8, 10] },
        { s: (m: number) => `Một cần cẩu nâng một kiện hàng khối lượng ${m} kg bằng dây cáp`, ms: [200, 300, 400, 500, 800, 1000] },
        { s: (m: number) => `Một vật khối lượng ${m} kg được treo vào đầu một sợi dây nhẹ`, ms: [1, 2, 3, 4, 5] },
        { s: (m: number) => `Một buồng thang máy khối lượng ${m} kg được treo bằng dây cáp`, ms: [400, 500, 600, 800] },
      ]);
      const m = r.pick(c.ms), a = r.pick([0.5, 1, 1.5, 2, 2.5]);
      const mode = r.pick([
        { t: "chuyển động thẳng đứng đi lên nhanh dần đều", k: 1 }, { t: "chuyển động thẳng đứng đi lên chậm dần đều", k: -1 },
        { t: "chuyển động thẳng đứng đi xuống nhanh dần đều", k: -1 }, { t: "chuyển động thẳng đứng đi xuống chậm dần đều", k: 1 },
      ]);
      const T = m * (g + mode.k * a);
      return {
        stem: `${c.s(m)}, ${mode.t} với gia tốc có độ lớn ${vn(a)} m/s². Lấy ${gTxt(g)}. Lực căng của dây có độ lớn là`,
        ...mcq(r, U(T, "N", 1), [U(m * (g - mode.k * a), "N", 1), U(m * g, "N", 1), U(m * a, "N", 1), U(round(m * (g + mode.k * a) / 2, 2), "N")]),
        explanation: `Gia tốc hướng ${mode.k > 0 ? "lên" : "xuống"} (${mode.t.includes("nhanh") ? "cùng chiều" : "ngược chiều"} chuyển động). Chọn chiều dương hướng lên: $T - mg = ${mode.k > 0 ? "" : "-"}ma \\Rightarrow T = m(g ${mode.k > 0 ? "+" : "-"} a) = ${m}(${tex(g)} ${mode.k > 0 ? "+" : "-"} ${tex(a)}) = ${tex(T, 1)}$ N.`,
      };
    },
  },
  {
    id: "l10-moment-luc", subject: S, grade: G, chapter: C3, topic: "Moment lực",
    half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const ctx = r.pick([
        { s: "Một người dùng cờ lê để vặn đai ốc, tay đặt cách tâm đai ốc", ax: "trục quay qua tâm đai ốc" },
        { s: "Một người đẩy cánh cửa tại tay nắm cách bản lề", ax: "trục quay qua bản lề" },
        { s: "Một bạn học sinh dùng tay quay vô lăng, điểm đặt tay cách tâm vô lăng", ax: "trục quay qua tâm vô lăng" },
        { s: "Một người dùng xà beng để bẩy tảng đá, tay đặt cách điểm tựa", ax: "trục quay qua điểm tựa" },
      ]);
      const F = r.int(2, 30) * 5, dcm = r.pick([15, 20, 25, 30, 40, 50, 60, 80]); const d = dcm / 100;
      const ang = r.pick([90, 90, 30]);
      const arm = ang === 90 ? d : d / 2; const M = F * arm;
      return {
        stem: `${ctx.s} ${dcm} cm. Lực tác dụng có độ lớn ${F} N ${ang === 90 ? "và vuông góc với đoạn thẳng nối điểm đặt lực với trục quay" : "và hợp với đoạn thẳng nối điểm đặt lực với trục quay một góc $30^\\circ$"}. Moment của lực đối với ${ctx.ax} là`,
        ...mcq(r, U(M, "N·m"), [U(F * dcm * (ang === 90 ? 1 : 0.5), "N·m"), U(F * d * (ang === 90 ? 2 : 1), "N·m"), U(round(F / d, 2), "N·m"), U(round(F * d * Math.sqrt(3) / 2, 2), "N·m")]),
        explanation: `${ang === 90 ? `Cánh tay đòn $d = ${tex(d)}$ m.` : `Cánh tay đòn (khoảng cách từ trục quay đến giá của lực) $d = ${tex(d)}\\sin 30^\\circ = ${tex(arm)}$ m.`} $M = Fd = ${F}\\cdot ${tex(arm)} = ${tex(M)}$ N·m.`,
      };
    },
  },
  {
    id: "l10-don-bay-quy-tac-moment", subject: S, grade: G, chapter: C3, topic: "Quy tắc moment – đòn bẩy",
    half: 2, level: 3, kind: "mcq",
    make: (r) => {
      const g = 10;
      if (r.chance(0.5)) {
        const m1 = r.int(2, 20), d1 = r.pick([10, 15, 20, 25, 30, 40]), d2 = r.pick([20, 30, 40, 50, 60, 80, 100]); need(d1 !== d2);
        const P = m1 * g, F = P * d1 / d2; need(okDp(F, 1));
        return {
          stem: `Một thanh cứng nhẹ nằm ngang có thể quay quanh trục O. Treo vào thanh một vật khối lượng ${m1} kg tại điểm cách O ${d1} cm. Ở phía bên kia trục O, tại điểm cách O ${d2} cm, cần tác dụng một lực thẳng đứng hướng xuống có độ lớn bao nhiêu để thanh cân bằng nằm ngang? Lấy $g = 10$ m/s².`,
          ...mcq(r, U(F, "N", 1), [U(round(P * d2 / d1, 1), "N", 1), U(round(m1 * d1 / d2, 2), "N"), U(P, "N"), U(round(P * d1 / 100, 2), "N")]),
          explanation: `$P = mg = ${P}$ N. Quy tắc moment: $P\\cdot d_1 = F\\cdot d_2 \\Rightarrow F = \\dfrac{${P}\\cdot ${d1}}{${d2}} = ${tex(F, 1)}$ N.`,
        };
      }
      const [n1, n2] = pickN(r, NAMES, 2);
      const m1 = r.int(20, 45), m2 = r.int(20, 45); need(m1 !== m2);
      const d1 = r.pick([1, 1.2, 1.5, 1.6, 2]); const d2 = m1 * d1 / m2; need(okDp(d2, 2) && d2 <= 3);
      return {
        stem: `Hai bạn ${n1} (khối lượng ${m1} kg) và ${n2} (khối lượng ${m2} kg) chơi bập bênh. Bạn ${n1} ngồi cách trục quay ${vn(d1)} m. Bỏ qua khối lượng của tấm ván và coi trục quay ở chính giữa. Để bập bênh cân bằng nằm ngang, bạn ${n2} phải ngồi ở phía bên kia, cách trục quay`,
        ...mcq(r, U(d2, "m"), [U(round(m2 * d1 / m1, 2), "m"), U(d1, "m"), U(round(d1 + Math.abs(m1 - m2) / 10, 2), "m"), U(round(m1 * d1 / m2 / 2, 2), "m")]),
        explanation: `Quy tắc moment: $m_1g\\cdot d_1 = m_2g\\cdot d_2 \\Rightarrow d_2 = \\dfrac{${m1}\\cdot ${tex(d1)}}{${m2}} = ${tex(d2)}$ m.`,
      };
    },
  },
  {
    id: "l10-can-bang-ly-thuyet", subject: S, grade: G, chapter: C3, topic: "Moment lực, ngẫu lực, cân bằng vật rắn – lí thuyết",
    half: 2, level: 1, kind: "mcq",
    make: (r) => theory(r, EQ_T, EQ_F,
      ["Phát biểu nào sau đây là đúng?", "Khi nói về moment lực và điều kiện cân bằng của vật rắn, phát biểu nào sau đây đúng?", "Chọn phát biểu đúng về moment lực và ngẫu lực.", "Phát biểu nào sau đây về cân bằng của vật rắn là đúng?", "Một vật rắn có thể quay quanh một trục cố định. Phát biểu nào sau đây đúng?"],
      ["Phát biểu nào sau đây là SAI?", "Khi nói về moment lực và điều kiện cân bằng của vật rắn, phát biểu nào sau đây sai?", "Chọn phát biểu sai về moment lực và ngẫu lực.", "Phát biểu nào sau đây về cân bằng của vật rắn là KHÔNG đúng?", "Một vật rắn có thể quay quanh một trục cố định. Phát biểu nào sau đây sai?"],
      (c, t) => `$M = Fd$ với $d$ là cánh tay đòn (khoảng cách từ trục quay đến giá của lực), đơn vị N·m. Ngẫu lực có hợp lực bằng 0 nhưng làm vật quay. Vật rắn cân bằng khi tổng lực bằng 0 và tổng moment lực bằng 0. Vậy "${c}" là phát biểu ${t ? "đúng" : "sai"}.`),
  },
  {
    id: "l10-mat-phang-nghieng", subject: S, grade: G, chapter: C3, topic: "Vật trượt trên mặt phẳng nghiêng",
    half: 2, level: 3, kind: "mcq",
    make: (r) => {
      const ang = r.pick([30, 37]); const sn = ang === 30 ? 0.5 : 0.6, cs = ang === 30 ? Math.sqrt(3) / 2 : 0.8;
      const mu = r.pick([0, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4]); const g = 10;
      const a = g * (sn - mu * cs); need(a > 0.3);
      const hint = ang === 37 ? " Lấy $\\sin 37^\\circ = 0{,}6$; $\\cos 37^\\circ = 0{,}8$." : "";
      const obj = r.pick(["Một vật nhỏ", "Một khối gỗ", "Một em bé ngồi trên cầu trượt", "Một thùng hàng"]);
      const R = (x: number) => U(round(x, 2), "m/s²");
      return {
        stem: `${obj} trượt xuống trên mặt phẳng nghiêng góc $${ang}^\\circ$ so với phương ngang${mu === 0 ? ", bỏ qua ma sát" : `, hệ số ma sát trượt giữa vật và mặt nghiêng là ${vn(mu)}`}. Lấy $g = 10$ m/s².${hint} Gia tốc của vật ${ang === 30 && mu ? "xấp xỉ " : ""}bằng`,
        ...mcq(r, R(a), [R(g * (sn + mu * cs)), R(g * (cs - mu * sn)), R(g * sn), R(g * cs), R(g)]),
        explanation: `Chiếu định luật II Newton lên phương mặt nghiêng: $mg\\sin\\alpha - \\mu mg\\cos\\alpha = ma \\Rightarrow a = g(\\sin\\alpha - \\mu\\cos\\alpha) = 10(${tex(sn)} - ${tex(mu)}\\cdot ${ang === 30 ? "\\dfrac{\\sqrt{3}}{2}" : "0{,}8"}) ${ang === 30 && mu ? "\\approx" : "="} ${tex(round(a, 2))}$ m/s².`,
      };
    },
  },

  /* ---------- Đúng/Sai ---------- */
  {
    id: "l10-tf-hai-luc-dong-quy", subject: S, grade: G, chapter: C3, topic: "Tổng hợp lực và định luật II Newton",
    half: 2, level: 2, kind: "tf",
    make: (r) => {
      const [F1, F2, F] = r.pick(TRIPLES); const m = r.pick([0.5, 1, 2, 2.5, 4, 5]); const a = F / m; need(okDp(a, 2));
      const st = tfv(r, [
        [`Hợp lực của hai lực có độ lớn lớn nhất bằng ${F1 + F2} N khi hai lực cùng phương, cùng chiều.`, `Hợp lực của hai lực có độ lớn lớn nhất bằng ${F1 + F2} N khi hai lực vuông góc với nhau.`],
        [`Khi hai lực ngược chiều nhau, hợp lực có độ lớn ${Math.abs(F1 - F2)} N.`, `Khi hai lực ngược chiều nhau, hợp lực có độ lớn ${F1 + F2} N.`],
        [`Khi hai lực vuông góc với nhau, hợp lực có độ lớn ${F} N.`, `Khi hai lực vuông góc với nhau, hợp lực có độ lớn ${F1 + F2 === F + 1 ? F + 2 : F1 + F2 - 1} N.`],
        [`Nếu hai lực vuông góc cùng tác dụng vào một vật khối lượng ${vn(m)} kg (bỏ qua các lực khác) thì vật thu được gia tốc ${vn(a)} m/s².`, `Nếu hai lực vuông góc cùng tác dụng vào một vật khối lượng ${vn(m)} kg (bỏ qua các lực khác) thì vật thu được gia tốc ${vn(round((F1 + F2) / m, 2))} m/s².`],
      ]);
      return {
        stem: `Hai lực $\\vec F_1$ và $\\vec F_2$ có độ lớn lần lượt là ${F1} N và ${F2} N cùng tác dụng vào một chất điểm.`,
        ...st,
        explanation: tfExp(st.statements, [
          `$F_{max} = F_1 + F_2 = ${F1 + F2}$ N khi hai lực cùng phương, cùng chiều`,
          `Ngược chiều: $F = |F_1 - F_2| = ${Math.abs(F1 - F2)}$ N`,
          `Vuông góc: $F = \\sqrt{${F1}^2 + ${F2}^2} = ${F}$ N`,
          `$a = \\dfrac{F}{m} = \\dfrac{${F}}{${tex(m)}} = ${tex(a)}$ m/s²`,
        ]),
      };
    },
  },
  {
    id: "l10-tf-keo-vat-ma-sat", subject: S, grade: G, chapter: C3, topic: "Chuyển động có ma sát trên mặt ngang",
    half: 2, level: 2, kind: "tf",
    make: (r) => {
      const m = r.int(4, 40), mu = r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]), a = r.pick([0.5, 1, 1.5, 2, 2.5]);
      const F = m * (a + mu * 10); need(isInt(F));
      const t = r.int(2, 5), s = a * t * t / 2, N = m * 10, fms = mu * N;
      const obj = r.pick(["Một thùng hàng", "Một chiếc tủ gỗ", "Một kiện sách", "Một bao gạo"]);
      const st = tfv(r, [
        [`Phản lực của sàn tác dụng lên vật có độ lớn ${N} N.`, `Phản lực của sàn tác dụng lên vật có độ lớn ${m} N.`],
        [`Lực ma sát trượt tác dụng lên vật có độ lớn ${vn(fms)} N.`, `Lực ma sát trượt tác dụng lên vật có độ lớn ${vn(round(mu * F, 2))} N.`],
        [`Gia tốc của vật là ${vn(a)} m/s².`, `Gia tốc của vật là ${vn(round(F / m, 2))} m/s².`],
        [`Quãng đường vật đi được trong ${t} s đầu là ${vn(s)} m.`, `Quãng đường vật đi được trong ${t} s đầu là ${vn(a * t * t)} m.`],
      ]);
      return {
        stem: `${obj} khối lượng ${m} kg đang đứng yên trên sàn nằm ngang. Người ta kéo vật bằng lực ${F} N theo phương ngang. Hệ số ma sát trượt giữa vật và sàn là ${vn(mu)}. Lấy $g = 10$ m/s².`,
        ...st,
        explanation: tfExp(st.statements, [
          `$N = mg = ${m}\\cdot 10 = ${N}$ N`,
          `$F_{mst} = \\mu N = ${tex(mu)}\\cdot ${N} = ${tex(fms)}$ N (tính theo áp lực, không theo lực kéo)`,
          `$a = \\dfrac{F - F_{mst}}{m} = \\dfrac{${F} - ${tex(fms)}}{${m}} = ${tex(a)}$ m/s²`,
          `$s = \\dfrac{1}{2}at^2 = \\dfrac{1}{2}\\cdot ${tex(a)}\\cdot ${t}^2 = ${tex(s)}$ m`,
        ]),
      };
    },
  },
  {
    id: "l10-tf-thang-may", subject: S, grade: G, chapter: C3, topic: "Áp lực trong thang máy",
    half: 2, level: 3, kind: "tf",
    make: (r) => {
      const m = r.int(40, 70), a = r.pick([0.5, 1, 1.5, 2, 2.5]); const g = 10;
      const name = r.pick(NAMES);
      const P = m * g, up = m * (g + a), dn = m * (g - a);
      const d4 = r.pick([
        [`Khi thang máy đi xuống nhanh dần đều với gia tốc ${vn(a)} m/s², số chỉ của cân là ${vn(dn)} N.`, `Khi thang máy đi xuống nhanh dần đều với gia tốc ${vn(a)} m/s², số chỉ của cân là ${vn(up)} N.`, `Đi xuống nhanh dần đều: gia tốc hướng xuống, $N = m(g - a) = ${tex(dn)}$ N`],
        [`Khi thang máy đi xuống chậm dần đều với gia tốc ${vn(a)} m/s², số chỉ của cân là ${vn(up)} N.`, `Khi thang máy đi xuống chậm dần đều với gia tốc ${vn(a)} m/s², số chỉ của cân là ${vn(dn)} N.`, `Đi xuống chậm dần đều: gia tốc hướng lên, $N = m(g + a) = ${tex(up)}$ N`],
        [`Nếu dây cáp bị đứt và thang máy rơi tự do thì số chỉ của cân bằng 0.`, `Nếu dây cáp bị đứt và thang máy rơi tự do thì số chỉ của cân vẫn là ${P} N.`, `Rơi tự do: $a = g$ hướng xuống, $N = m(g - g) = 0$`],
      ]);
      const st = tfv(r, [
        [`Khi thang máy đứng yên, số chỉ của cân là ${P} N.`, `Khi thang máy đứng yên, số chỉ của cân là ${m} N.`],
        [`Khi thang máy đi lên nhanh dần đều với gia tốc ${vn(a)} m/s², số chỉ của cân là ${vn(up)} N.`, `Khi thang máy đi lên nhanh dần đều với gia tốc ${vn(a)} m/s², số chỉ của cân là ${vn(dn)} N.`],
        [`Khi thang máy đi lên chậm dần đều với gia tốc ${vn(a)} m/s², số chỉ của cân là ${vn(dn)} N.`, `Khi thang máy đi lên chậm dần đều với gia tốc ${vn(a)} m/s², số chỉ của cân là ${vn(up)} N.`],
        [d4[0], d4[1]],
      ]);
      return {
        stem: `Bạn ${name} có khối lượng ${m} kg đứng trên một chiếc cân (chia độ theo đơn vị newton) đặt trên sàn thang máy. Số chỉ của cân bằng độ lớn áp lực của người lên cân. Lấy $g = 10$ m/s².`,
        ...st,
        explanation: tfExp(st.statements, [
          `Đứng yên: $N = mg = ${P}$ N`,
          `Đi lên nhanh dần đều: gia tốc hướng lên, $N - mg = ma \\Rightarrow N = m(g + a) = ${tex(up)}$ N`,
          `Đi lên chậm dần đều: gia tốc hướng xuống, $N = m(g - a) = ${tex(dn)}$ N`,
          d4[2],
        ]),
      };
    },
  },
  {
    id: "l10-tf-don-bay", subject: S, grade: G, chapter: C3, topic: "Quy tắc moment – thanh cân bằng",
    half: 2, level: 3, kind: "tf",
    make: (r) => {
      const P = r.int(2, 12) * 10, a = r.pick([10, 15, 20, 25, 30]), b = r.pick([30, 40, 50, 60, 75, 80]); need(b > a);
      const F = P * a / b; need(okDp(F, 1));
      const x = r.pick([5, 10]); need(x < a); const F2 = P * (a - x) / b; need(okDp(F2, 1));
      const M = P * a / 100;
      const st = tfv(r, [
        [`Moment của trọng lực vật treo ở A đối với trục O có độ lớn ${vn(M)} N·m.`, `Moment của trọng lực vật treo ở A đối với trục O có độ lớn ${P * a} N·m.`],
        [`Lực $\\vec F$ có độ lớn ${vn(F, 1)} N.`, `Lực $\\vec F$ có độ lớn ${vn(round(P * b / a, 1), 1)} N.`],
        [`Lực do trục quay tác dụng lên thanh có độ lớn ${vn(P + F, 1)} N.`, `Lực do trục quay tác dụng lên thanh có độ lớn ${vn(Math.abs(P - F), 1)} N.`],
        [`Nếu dịch điểm treo vật lại gần O thêm ${x} cm thì lực $\\vec F$ cần thiết giảm còn ${vn(F2, 1)} N.`, `Nếu dịch điểm treo vật lại gần O thêm ${x} cm thì lực $\\vec F$ cần thiết tăng lên thành ${vn(round(P * (a + x) / b, 1), 1)} N.`],
      ]);
      return {
        stem: `Một thanh cứng nhẹ AB nằm ngang, có thể quay quanh trục O nằm giữa A và B với OA = ${a} cm, OB = ${b} cm. Treo vào đầu A một vật có trọng lượng ${P} N. Để giữ thanh cân bằng nằm ngang, người ta tác dụng vào đầu B một lực $\\vec F$ thẳng đứng hướng xuống.`,
        ...st,
        explanation: tfExp(st.statements, [
          `$M = P\\cdot OA = ${P}\\cdot ${tex(a / 100)} = ${tex(M)}$ N·m (phải đổi cm sang m)`,
          `$P\\cdot OA = F\\cdot OB \\Rightarrow F = \\dfrac{${P}\\cdot ${a}}{${b}} = ${tex(F, 1)}$ N`,
          `$\\vec P$ và $\\vec F$ cùng hướng xuống, thanh cân bằng nên lực của trục hướng lên có độ lớn $${P} + ${tex(F, 1)} = ${tex(P + F, 1)}$ N`,
          `$F' = \\dfrac{${P}\\cdot ${a - x}}{${b}} = ${tex(F2, 1)}$ N, tức lực cần thiết giảm`,
        ]),
      };
    },
  },

  /* ---------- Trả lời ngắn ---------- */
  {
    id: "l10-s-hop-luc", subject: S, grade: G, chapter: C3, topic: "Độ lớn hợp lực",
    half: 2, level: 2, kind: "short",
    make: (r) => {
      if (r.chance(0.4)) {
        const [F1, F2, F] = r.pick(TRIPLES); const k = r.pick([1, 1, 2, 3]);
        return { stem: `Hai lực có độ lớn ${F1 * k} N và ${F2 * k} N cùng tác dụng vào một chất điểm, giá của hai lực vuông góc với nhau. Độ lớn hợp lực của chúng là bao nhiêu niutơn?`, ...short(F * k, 0), explanation: `$F = \\sqrt{${F1 * k}^2 + ${F2 * k}^2} = ${F * k}$ N.` };
      }
      const F1 = r.int(2, 20), F2 = r.int(2, 20), ang = r.pick([60, 120]); const F2v = resF2(F1, F2, ang); const F = Math.sqrt(F2v); need(!isInt(F));
      return { stem: `Hai lực có độ lớn ${F1} N và ${F2} N cùng tác dụng vào một vật, hợp với nhau góc $${ang}^\\circ$. Độ lớn hợp lực của chúng là bao nhiêu niutơn? (làm tròn đến hàng phần mười)`, ...short(F, 1), explanation: `$F = \\sqrt{F_1^2 + F_2^2 + 2F_1F_2\\cos ${ang}^\\circ} = \\sqrt{${F2v}} \\approx ${tex(F, 1)}$ N.` };
    },
  },
  {
    id: "l10-s-newton-2", subject: S, grade: G, chapter: C3, topic: "Định luật II Newton",
    half: 2, level: 2, kind: "short",
    make: (r) => {
      const mg = r.pick([100, 150, 200, 250, 300, 400, 500, 600, 750, 800]); const m = mg / 1000;
      const F = r.pick([0.5, 1, 1.2, 1.5, 2, 2.4, 3, 4, 5, 6]); const a = F / m; need(ok4(round(a, 2), 2));
      const obj = r.pick(["Một quả bóng", "Một vật nhỏ", "Một xe lăn thí nghiệm", "Một chiếc xe đồ chơi", "Một quả cầu"]);
      if (r.chance(0.6)) return { stem: `${obj} có khối lượng ${mg} g chịu tác dụng của hợp lực có độ lớn ${vn(F)} N. Gia tốc của vật bằng bao nhiêu m/s²? (làm tròn đến hàng phần mười nếu cần)`, ...short(a, 1), explanation: `$m = ${mg}$ g $= ${tex(m)}$ kg; $a = \\dfrac{F}{m} = \\dfrac{${tex(F)}}{${tex(m)}} ${eq(a, 1)} ${tex(a, 1)}$ m/s².` };
      const t = r.pick([0.02, 0.05, 0.1]); const v = a * t; need(ok4(round(v, 1), 1));
      return { stem: `${obj} có khối lượng ${mg} g đang đứng yên thì bị đánh bằng một lực có độ lớn ${vn(F * 100)} N trong thời gian ${vn(t)} s. Tốc độ của vật ngay sau khi bị đánh là bao nhiêu m/s? (làm tròn đến hàng phần mười)`, ...short(v * 100, 1), explanation: `$a = \\dfrac{F}{m} = \\dfrac{${tex(F * 100)}}{${tex(m)}} ${eq(a * 100, 2)} ${tex(a * 100)}$ m/s²; $v = at = \\dfrac{F t}{m} ${eq(v * 100, 1)} ${tex(v * 100, 1)}$ m/s.` };
    },
  },
  {
    id: "l10-s-luc-ham-phanh", subject: S, grade: G, chapter: C3, topic: "Lực hãm và quãng đường hãm",
    half: 2, level: 3, kind: "short",
    make: (r) => {
      const mt = r.pick([1, 1.2, 1.5, 2, 2.5, 3]); const m = mt * 1000;
      const kmh = r.pick([36, 54, 72, 90]); const v = kmh / 3.6;
      const a = r.pick([2, 2.5, 3, 4, 5, 6]); const F = m * a;
      const s = v * v / (2 * a), t = v / a;
      const who = r.pick(["Một ô tô", "Một xe tải nhỏ", "Một xe khách"]);
      if (r.chance(0.6)) {
        need(ok4(round(s, 1), 1));
        return { stem: `${who} khối lượng ${vn(mt)} tấn đang chạy với tốc độ ${kmh} km/h thì hãm phanh. Lực hãm có độ lớn không đổi ${F} N (bỏ qua các lực cản khác). Quãng đường xe đi được từ lúc hãm phanh đến khi dừng lại là bao nhiêu mét? (làm tròn đến hàng phần mười)`, ...short(s, 1), explanation: `$a = \\dfrac{F}{m} = \\dfrac{${F}}{${m}} = ${tex(a)}$ m/s²; $v_0 = ${tex(v)}$ m/s; $s = \\dfrac{v_0^2}{2a} = \\dfrac{${tex(v)}^2}{2\\cdot ${tex(a)}} ${eq(s, 1)} ${tex(s, 1)}$ m.` };
      }
      need(ok4(round(t, 2), 2));
      return { stem: `${who} khối lượng ${vn(mt)} tấn đang chạy với tốc độ ${kmh} km/h thì hãm phanh. Lực hãm có độ lớn không đổi ${F} N (bỏ qua các lực cản khác). Thời gian từ lúc hãm phanh đến khi xe dừng lại là bao nhiêu giây? (làm tròn đến hàng phần trăm)`, ...short(t, 2), explanation: `$a = \\dfrac{F}{m} = ${tex(a)}$ m/s²; $t = \\dfrac{v_0}{a} = \\dfrac{${tex(v)}}{${tex(a)}} ${eq(t, 2)} ${tex(t)}$ s.` };
    },
  },
  {
    id: "l10-s-he-so-ma-sat", subject: S, grade: G, chapter: C3, topic: "Hệ số ma sát trượt",
    half: 2, level: 2, kind: "short",
    make: (r) => {
      const m = r.int(2, 50), mu = r.pick([0.1, 0.12, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5]); const g = r.pick([10, 9.8]);
      const F = mu * m * g; need(okDp(F, 2));
      const obj = r.pick(["một thùng gỗ", "một chiếc ghế", "một bao xi măng", "một thùng sơn", "một hộp đựng dụng cụ"]);
      if (r.chance(0.5)) return { stem: `Một người kéo ${obj} khối lượng ${m} kg chuyển động thẳng đều trên sàn nằm ngang bằng lực ${vn(F)} N theo phương ngang. Lấy ${gTxt(g)}. Hệ số ma sát trượt giữa vật và sàn bằng bao nhiêu?`, ...short(mu, 2), explanation: `Chuyển động thẳng đều: $F = F_{mst} = \\mu mg \\Rightarrow \\mu = \\dfrac{${tex(F)}}{${m}\\cdot ${tex(g)}} = ${tex(mu)}$.` };
      const v0 = r.pick([2, 3, 4, 5, 6]); const a = mu * g; const s = v0 * v0 / (2 * a); need(ok4(round(s, 2), 2));
      return { stem: `Đẩy ${obj} cho trượt trên sàn nằm ngang với tốc độ ban đầu ${v0} m/s rồi thả ra. Hệ số ma sát trượt giữa vật và sàn là ${vn(mu)}. Lấy ${gTxt(g)}. Vật trượt được quãng đường bao nhiêu mét thì dừng lại? (làm tròn đến hàng phần trăm)`, ...short(s, 2), explanation: `Chỉ có ma sát gây gia tốc: $a = -\\mu g = -${tex(a, 3)}$ m/s². $s = \\dfrac{v_0^2}{2\\mu g} = \\dfrac{${v0}^2}{2\\cdot ${tex(a, 3)}} ${eq(s, 2)} ${tex(s)}$ m.` };
    },
  },
  {
    id: "l10-s-luc-cang", subject: S, grade: G, chapter: C3, topic: "Lực căng dây",
    half: 2, level: 2, kind: "short",
    make: (r) => {
      const m = r.int(2, 30), a = r.pick([0.5, 1, 1.5, 2, 2.5, 3]), g = r.pick([10, 9.8]);
      const mode = r.pick([{ t: "đi lên nhanh dần đều", k: 1 }, { t: "đi lên chậm dần đều", k: -1 }, { t: "đi xuống nhanh dần đều", k: -1 }, { t: "đi xuống chậm dần đều", k: 1 }]);
      const T = m * (g + mode.k * a); need(ok4(round(T, 1), 1));
      const obj = r.pick(["Một thùng sơn", "Một xô vữa", "Một bao xi măng", "Một kiện hàng", "Một vật nặng"]);
      return { stem: `${obj} khối lượng ${m} kg được treo vào sợi dây nhẹ và chuyển động thẳng đứng ${mode.t} với gia tốc có độ lớn ${vn(a)} m/s². Lấy ${gTxt(g)}. Lực căng của dây bằng bao nhiêu niutơn? (làm tròn đến hàng phần mười nếu cần)`, ...short(T, 1), explanation: `Gia tốc hướng ${mode.k > 0 ? "lên" : "xuống"}. $T = m(g ${mode.k > 0 ? "+" : "-"} a) = ${m}(${tex(g)} ${mode.k > 0 ? "+" : "-"} ${tex(a)}) = ${tex(T, 1)}$ N.` };
    },
  },
  {
    id: "l10-s-quy-tac-moment", subject: S, grade: G, chapter: C3, topic: "Quy tắc moment",
    half: 2, level: 3, kind: "short",
    make: (r) => {
      if (r.chance(0.5)) {
        const L = r.pick([1, 1.2, 1.5, 2]), W = r.int(2, 10) * 10, P = r.int(2, 15) * 10, oa = r.pick([0.2, 0.25, 0.3, 0.4, 0.5]); need(oa < L / 2);
        const ob = L - oa, xg = L / 2 - oa; const F = (P * oa - W * xg) / ob; need(F > 0 && ok4(round(F, 1), 1));
        return {
          stem: `Một thanh đồng chất, tiết diện đều AB dài ${vn(L)} m, trọng lượng ${W} N, có thể quay quanh trục nằm ngang đi qua điểm O trên thanh với OA = ${vn(oa)} m. Treo vào đầu A một vật có trọng lượng ${P} N. Để thanh cân bằng nằm ngang, cần tác dụng vào đầu B một lực thẳng đứng hướng xuống có độ lớn bao nhiêu niutơn? (làm tròn đến hàng phần mười)`,
          ...short(F, 1),
          explanation: `Trọng tâm G của thanh ở trung điểm, cách O một đoạn $OG = ${tex(L / 2)} - ${tex(oa)} = ${tex(xg)}$ m về phía B; $OB = ${tex(ob)}$ m. Quy tắc moment đối với O: $P\\cdot OA = W\\cdot OG + F\\cdot OB \\Rightarrow F = \\dfrac{${P}\\cdot ${tex(oa)} - ${W}\\cdot ${tex(xg)}}{${tex(ob)}} ${eq(F, 1)} ${tex(F, 1)}$ N.`,
        };
      }
      const m1 = r.int(2, 30), d1 = r.int(2, 12) * 5, F = r.int(2, 30) * 5; const d2 = m1 * 10 * d1 / F; need(ok4(round(d2, 1), 1) && d2 > 2 && d2 <= 200);
      return {
        stem: `Một thanh cứng nhẹ nằm ngang có thể quay quanh trục O. Treo vào thanh một vật khối lượng ${m1} kg tại điểm cách O ${d1} cm. Ở phía bên kia trục O, người ta tác dụng một lực thẳng đứng hướng xuống có độ lớn ${F} N để thanh cân bằng nằm ngang. Lấy $g = 10$ m/s². Điểm đặt của lực này cách O bao nhiêu centimét? (làm tròn đến hàng phần mười)`,
        ...short(d2, 1),
        explanation: `$mg\\cdot d_1 = F\\cdot d_2 \\Rightarrow d_2 = \\dfrac{${m1 * 10}\\cdot ${d1}}{${F}} ${eq(d2, 1)} ${tex(d2, 1)}$ cm.`,
      };
    },
  },
  {
    id: "l10-s-he-vat-noi-day", subject: S, grade: G, chapter: C3, topic: "Hệ hai vật nối bằng dây",
    half: 2, level: 3, kind: "short",
    make: (r) => {
      const m1 = r.int(1, 6), m2 = r.int(1, 6), mu = r.pick([0, 0, 0.1, 0.2]); const g = 10;
      const M = m1 + m2; const F = r.int(2, 12) * 5; const a = F / M - mu * g; need(a > 0);
      const T = F * m1 / M;
      const askT = r.chance(0.6);
      const val = askT ? T : a; need(ok4(round(val, 2), 2));
      return {
        stem: `Hai vật có khối lượng $m_1 = ${m1}$ kg và $m_2 = ${m2}$ kg đặt trên mặt bàn nằm ngang, nối với nhau bằng một sợi dây nhẹ, không dãn. Kéo vật $m_2$ bằng lực ${F} N theo phương ngang (dây nằm ngang) làm cả hệ chuyển động nhanh dần đều. ${mu ? `Hệ số ma sát trượt giữa mỗi vật và mặt bàn là ${vn(mu)}, lấy $g = 10$ m/s².` : "Bỏ qua ma sát."} ${askT ? "Lực căng của sợi dây nối hai vật" : "Gia tốc của hệ"} bằng bao nhiêu ${askT ? "niutơn" : "m/s²"}? (làm tròn đến hàng phần trăm nếu cần)`,
        ...short(val, 2),
        explanation: `Cả hệ: $F - \\mu(m_1 + m_2)g = (m_1 + m_2)a \\Rightarrow a = \\dfrac{${F}${mu ? ` - ${tex(mu)}\\cdot ${M}\\cdot 10` : ""}}{${M}} ${eq(a, 2)} ${tex(a)}$ m/s². Vật $m_1$: $T - \\mu m_1g = m_1a \\Rightarrow T = m_1(a + \\mu g) = \\dfrac{m_1F}{m_1 + m_2} = \\dfrac{${m1}\\cdot ${F}}{${M}} ${eq(T, 2)} ${tex(T)}$ N.`,
      };
    },
  },
];

export const TEMPLATES: Template[] = [...H1, ...H2];
