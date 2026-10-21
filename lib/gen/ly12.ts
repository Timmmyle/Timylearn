/* Vật lí 12 – Học kì 1 (Kết nối tri thức)
   half 1: Chương I. Vật lí nhiệt  |  half 2: Chương II. Khí lí tưởng */
import { mcq, tf, short, tex, vn, need, round, type Template, type Rng } from "./core.ts";

const S = "Vật lí", G = 12 as const;
const CH1 = "Chương I. Vật lí nhiệt";
const CH2 = "Chương II. Khí lí tưởng";

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
/** nhiệt độ Celsius */
const dC = (t: number, dp = 1) => `$${tex(t, dp)}\\ ^\\circ\\text{C}$`;
const CU = "\\text{J/(kg}\\cdot\\text{K)}";
const cTxt = (c: number) => `$${tex(c, 2)}\\ ${CU}$`;
const RTXT = `$R = 8{,}31\\ \\text{J/(mol}\\cdot\\text{K)}$`;
const KTXT = `$k = 1{,}38\\cdot 10^{-23}\\ \\text{J/K}$`;
const R = 8.31, KB = 1.38e-23, NA = 6.02e23;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** mcq số: định dạng chung, bỏ nhiễu không hữu hạn */
const nopt = (r: Rng, right: number, wrong: number[], f: (x: number) => string) => {
  need(Number.isFinite(right));
  return mcq(r, f(right), wrong.filter((w) => Number.isFinite(w) && w > 0).map(f));
};
/** chọn k phần tử khác nhau */
const pickN = <T,>(r: Rng, a: readonly T[], k: number): T[] => r.shuffle([...a]).slice(0, k);

const NAMES = ["An", "Bình", "Chi", "Dũng", "Hà", "Khoa", "Lan", "Minh", "Nam", "Phương", "Quân", "Trang"];

/* ---------------- dữ liệu chất ---------------- */
const SUB_C = [
  { n: "nước", c: 4200 }, { n: "nhôm", c: 880 }, { n: "đồng", c: 380 }, { n: "sắt", c: 460 },
  { n: "chì", c: 130 }, { n: "ethanol", c: 2500 }, { n: "thép", c: 460 }, { n: "dầu ăn", c: 2000 },
];
const METALS = [
  { n: "nhôm", c: 880 }, { n: "đồng", c: 380 }, { n: "sắt", c: 460 }, { n: "chì", c: 130 }, { n: "thép", c: 460 }, { n: "đồng thau", c: 400 },
];
const SUB_LAMBDA = [
  { n: "nước đá", l: 3.34e5, t: 0 }, { n: "nhôm", l: 3.97e5, t: 660 }, { n: "đồng", l: 1.8e5, t: 1085 },
  { n: "sắt", l: 2.77e5, t: 1538 }, { n: "chì", l: 0.25e5, t: 327 }, { n: "thiếc", l: 0.59e5, t: 232 },
];
const SUB_L = [
  { n: "nước", L: 2.26e6, t: 100 }, { n: "ethanol", L: 0.85e6, t: 78 }, { n: "ether", L: 0.4e6, t: 35 },
  { n: "nước", L: 2.3e6, t: 100 }, { n: "ammonia lỏng", L: 1.37e6, t: -33 },
];
const GASES = [
  { n: "oxygen", f: "\\mathrm{O_2}", M: 32 }, { n: "nitrogen", f: "\\mathrm{N_2}", M: 28 }, { n: "helium", f: "\\mathrm{He}", M: 4 },
  { n: "hydrogen", f: "\\mathrm{H_2}", M: 2 }, { n: "carbon dioxide", f: "\\mathrm{CO_2}", M: 44 }, { n: "argon", f: "\\mathrm{Ar}", M: 40 },
  { n: "methane", f: "\\mathrm{CH_4}", M: 16 },
];
const gasTxt = (g: { n: string; f: string; M: number }) => `khí ${g.n} ($${g.f}$, $M = ${g.M}\\ \\text{g/mol}$)`;

/* ---------------- ngân hàng phát biểu lí thuyết ---------------- */
const TRUE_NHIET = [
  "Chất rắn kết tinh nóng chảy ở một nhiệt độ xác định ứng với mỗi áp suất.",
  "Trong suốt quá trình nóng chảy của chất rắn kết tinh, nhiệt độ của nó không thay đổi.",
  "Chất rắn vô định hình không có nhiệt độ nóng chảy xác định.",
  "Sự bay hơi xảy ra ở mặt thoáng của chất lỏng ở mọi nhiệt độ.",
  "Sự sôi xảy ra cả ở mặt thoáng và trong lòng chất lỏng.",
  "Trong khi sôi ở áp suất không đổi, nhiệt độ của chất lỏng không thay đổi.",
  "Nhiệt độ sôi của chất lỏng phụ thuộc vào áp suất khí trên mặt chất lỏng.",
  "Nội năng của vật là tổng động năng và thế năng của các phân tử cấu tạo nên vật.",
  "Nội năng của một vật phụ thuộc vào nhiệt độ và thể tích của vật.",
  "Nhiệt độ của vật càng cao thì các phân tử cấu tạo nên vật chuyển động càng nhanh.",
  "Nhiệt độ $0\\ \\text{K}$ là nhiệt độ thấp nhất có thể có, gọi là độ không tuyệt đối.",
  "Nhiệt lượng tự truyền từ vật có nhiệt độ cao hơn sang vật có nhiệt độ thấp hơn.",
  "Độ chênh lệch nhiệt độ $1\\ \\text{K}$ bằng độ chênh lệch nhiệt độ $1\\ ^\\circ\\text{C}$.",
  "Khi nước đá đang tan ở $0\\ ^\\circ\\text{C}$, nội năng của khối nước đá – nước tăng dần.",
];
const FALSE_NHIET = [
  "Chất rắn vô định hình có nhiệt độ nóng chảy xác định.",
  "Trong quá trình nóng chảy, nhiệt độ của chất rắn kết tinh tăng liên tục.",
  "Sự bay hơi chỉ xảy ra ở nhiệt độ sôi của chất lỏng.",
  "Sự sôi chỉ xảy ra ở mặt thoáng của chất lỏng.",
  "Nhiệt độ sôi của chất lỏng không phụ thuộc vào áp suất bên ngoài.",
  "Nội năng của vật chỉ phụ thuộc vào thể tích của vật.",
  "Nhiệt lượng là năng lượng vật chứa sẵn; vật càng nóng thì chứa càng nhiều nhiệt lượng.",
  "Nhiệt lượng có thể tự truyền từ vật lạnh hơn sang vật nóng hơn.",
  "Nhiệt độ $-10\\ \\text{K}$ có thể đạt được trong các phòng thí nghiệm hiện đại.",
  "Độ chênh lệch nhiệt độ $1\\ \\text{K}$ lớn hơn độ chênh lệch nhiệt độ $1\\ ^\\circ\\text{C}$.",
  "Khi nước đá đang tan ở $0\\ ^\\circ\\text{C}$, nội năng của nó không đổi vì nhiệt độ không đổi.",
  "Nội năng của vật chỉ có thể thay đổi bằng cách truyền nhiệt.",
];
const TRUE_KHI = [
  "Chất khí được cấu tạo từ các phân tử có kích thước rất nhỏ so với khoảng cách giữa chúng.",
  "Các phân tử khí chuyển động hỗn loạn không ngừng; nhiệt độ càng cao thì chúng chuyển động càng nhanh.",
  "Khi chuyển động, các phân tử khí va chạm với nhau và va chạm với thành bình.",
  "Áp suất chất khí lên thành bình là do các phân tử khí va chạm với thành bình.",
  "Trong mô hình khí lí tưởng, các phân tử được coi là chất điểm và chỉ tương tác với nhau khi va chạm.",
  "Chuyển động Brown của các hạt nhỏ lơ lửng là bằng chứng các phân tử chất lưu chuyển động hỗn loạn không ngừng.",
  "Động năng tịnh tiến trung bình của phân tử khí tỉ lệ thuận với nhiệt độ tuyệt đối.",
  "Ở cùng nhiệt độ, phân tử khí có khối lượng nhỏ hơn thì có tốc độ chuyển động nhiệt trung bình lớn hơn.",
  "Ở cùng nhiệt độ, động năng tịnh tiến trung bình của phân tử các khí khác nhau là như nhau.",
  "Với một lượng khí xác định, khi giữ nhiệt độ không đổi thì áp suất tỉ lệ nghịch với thể tích.",
];
const FALSE_KHI = [
  "Các phân tử khí đứng yên khi nhiệt độ của khí không đổi.",
  "Lực tương tác giữa các phân tử khí lí tưởng rất mạnh, kể cả khi chúng ở xa nhau.",
  "Áp suất chất khí lên thành bình là do trọng lượng của các phân tử khí.",
  "Chuyển động Brown là chuyển động của chính các phân tử nước.",
  "Ở cùng nhiệt độ, phân tử khí nặng hơn có động năng tịnh tiến trung bình lớn hơn.",
  "Động năng tịnh tiến trung bình của phân tử khí tỉ lệ thuận với nhiệt độ Celsius.",
  "Khi nhiệt độ tăng, kích thước các phân tử khí tăng lên làm thể tích khối khí tăng.",
  "Với một lượng khí xác định ở áp suất không đổi, thể tích tỉ lệ thuận với nhiệt độ Celsius.",
  "Ở cùng nhiệt độ, các phân tử khí khác nhau có tốc độ chuyển động nhiệt trung bình như nhau.",
];

/* ================================================================
   HALF 1 – VẬT LÍ NHIỆT
   ================================================================ */
const STATES = [
  { n: "rắn", f: ["các phân tử sắp xếp có trật tự và chỉ dao động quanh các vị trí cân bằng xác định", "có hình dạng riêng và thể tích riêng xác định", "lực tương tác giữa các phân tử rất mạnh, giữ các phân tử gần như cố định"] },
  { n: "lỏng", f: ["các phân tử dao động quanh các vị trí cân bằng không cố định mà có thể di chuyển được", "có thể tích riêng xác định nhưng không có hình dạng riêng mà có hình dạng phần bình chứa nó", "lực tương tác giữa các phân tử yếu hơn ở thể rắn nhưng đủ giữ các phân tử không tản ra xa nhau"] },
  { n: "khí", f: ["các phân tử chuyển động hỗn loạn không ngừng, khoảng cách giữa chúng rất lớn so với kích thước phân tử", "không có hình dạng riêng và thể tích riêng, luôn chiếm toàn bộ thể tích bình chứa", "lực tương tác giữa các phân tử rất yếu, trừ lúc chúng va chạm nhau"] },
];
const PROC: Record<string, { n: string; a: string; b: string }> = {
  nc: { n: "sự nóng chảy", a: "rắn", b: "lỏng" }, dd: { n: "sự đông đặc", a: "lỏng", b: "rắn" },
  hh: { n: "sự hóa hơi", a: "lỏng", b: "khí" }, nt: { n: "sự ngưng tụ", a: "khí", b: "lỏng" },
  th: { n: "sự thăng hoa", a: "rắn", b: "khí" }, nk: { n: "sự ngưng kết", a: "khí", b: "rắn" },
};
const REV: Record<string, string> = { nc: "dd", dd: "nc", hh: "nt", nt: "hh", th: "nk", nk: "th" };
const PROC_EX: [string, string][] = [
  ["cục nước đá lấy ra khỏi tủ lạnh tan dần thành nước", "nc"],
  ["nước trong khay để ở ngăn đá tủ lạnh dần biến thành đá", "dd"],
  ["quần áo ướt phơi ngoài nắng khô dần", "hh"],
  ["những giọt nước xuất hiện ở mặt ngoài cốc nước đá", "nt"],
  ["viên băng phiến để trong tủ quần áo nhỏ dần rồi biến mất", "th"],
  ["vào đêm đông giá lạnh, hơi nước trong không khí đọng thành lớp tinh thể băng trên lá cây", "nk"],
  ["đồng lỏng rót vào khuôn để nguội tạo thành bức tượng đồng", "dd"],
  ["sáp nến ở gần bấc chảy lỏng ra khi nến cháy", "nc"],
  ["sương đọng thành giọt trên lá cây vào sáng sớm", "nt"],
  ["nước muối phơi trên ruộng muối cạn dần", "hh"],
  ["miếng đá khô ($\\mathrm{CO_2}$ rắn) để ngoài không khí nhỏ dần mà không để lại chất lỏng", "th"],
  ["kính xe ô tô bị mờ đi do hơi nước khi trời lạnh", "nt"],
  ["thiếc hàn bị mỏ hàn nóng làm chảy ra", "nc"],
  ["nến chảy nhỏ xuống bàn rồi cứng lại", "dd"],
];
const WORK_EX = [
  "xoa hai bàn tay vào nhau, tay nóng lên", "cưa gỗ một lúc, lưỡi cưa nóng lên", "bơm xe đạp, thân bơm nóng lên",
  "dùng búa đóng đinh nhiều lần, đinh nóng lên", "mài dao trên đá mài, lưỡi dao nóng lên", "phanh gấp, má phanh xe nóng lên",
  "nén nhanh khí trong xilanh, khí nóng lên", "trượt nhanh xuống cột bằng tay, lòng bàn tay nóng rát",
];
const HEAT_EX = [
  "phơi quần áo ngoài nắng, quần áo nóng lên", "thả thìa kim loại vào cốc nước nóng, thìa nóng lên", "chườm khăn lạnh lên trán, trán mát dần",
  "đun nước trên bếp ga, nước nóng lên", "ủ tay vào cốc trà nóng, tay ấm lên", "cho chai nước vào tủ lạnh, nước lạnh đi",
  "nướng bánh trong lò, bánh nóng lên", "thả cục nước đá vào cốc nước, nước lạnh đi",
];
const DL1_EX: [string, number, number][] = [
  ["khí trong xilanh được đun nóng và đẩy pít-tông chuyển động đi lên", 1, -1],
  ["người ta nén khí trong xilanh, đồng thời khí truyền nhiệt ra môi trường xung quanh", -1, 1],
  ["khí trong xilanh nhận nhiệt từ ngọn lửa và đồng thời bị pít-tông nén lại", 1, 1],
  ["khí giãn nở đẩy pít-tông, đồng thời tỏa nhiệt ra môi trường xung quanh", -1, -1],
  ["hệ nhận nhiệt lượng từ bên ngoài và thực hiện công lên các vật khác", 1, -1],
  ["hệ truyền nhiệt lượng ra bên ngoài và nhận công từ các vật khác", -1, 1],
  ["hệ nhận nhiệt lượng và nhận công từ các vật khác", 1, 1],
  ["hệ tỏa nhiệt lượng ra bên ngoài và thực hiện công lên các vật khác", -1, -1],
  ["hơi nước trong xilanh của máy hơi nước nhận nhiệt từ lò đốt và đẩy pít-tông", 1, -1],
  ["không khí trong bơm xe đạp bị nén nhanh rồi truyền nhiệt cho thân bơm", -1, 1],
];
/** bối cảnh nhiệt độ thực tế: [tên, t min, t max] (°C) */
const TCTX: [string, number, number][] = [
  ["không khí trong một phòng học", 18, 35], ["nước trong một cốc trà", 40, 90], ["không khí ngoài trời", 5, 40],
  ["nước trong một bể bơi", 22, 32], ["không khí trong một lò ấp trứng", 36, 39], ["ngăn đá tủ lạnh", -24, -5],
  ["cơ thể một bệnh nhân đang sốt", 38, 41], ["nước trong một ấm đang đun", 30, 100], ["không khí trong một lò sấy", 50, 120],
];
const signTxt = (a: number, b: number) => `$Q ${a > 0 ? ">" : "<"} 0$ và $A ${b > 0 ? ">" : "<"} 0$`;

const H1: Template[] = [
  /* ---------- MCQ ---------- */
  {
    id: "l12-cau-truc-chat", subject: S, grade: G, chapter: CH1, topic: "Cấu trúc của chất", half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const i = r.int(0, 2), st = STATES[i], others = STATES.filter((_, k) => k !== i).flatMap((x) => x.f);
      const form = r.pick(["is", "not", "which"]);
      if (form === "which") {
        const f = r.pick(st.f);
        const right = `thể ${st.n}`;
        return {
          stem: `Theo mô hình động học phân tử, một chất có đặc điểm: ${f}. Chất đó đang ở`,
          ...mcq(r, right, ["thể rắn", "thể lỏng", "thể khí", "cả ba thể rắn, lỏng và khí"].filter((x) => x !== right)),
          explanation: `Đặc điểm "${f}" là của chất ở thể ${st.n}.`,
        };
      }
      if (form === "is") {
        const f = r.pick(st.f);
        return {
          stem: `Theo mô hình động học phân tử, đặc điểm nào sau đây là của chất ở thể ${st.n}?`,
          ...mcq(r, cap(f), pickN(r, others, 3).map(cap)),
          explanation: `Ở thể ${st.n}: ${st.f.join("; ")}. Các phương án còn lại là đặc điểm của thể khác.`,
        };
      }
      const f = r.pick(others);
      return {
        stem: `Theo mô hình động học phân tử, đặc điểm nào sau đây KHÔNG phải của chất ở thể ${st.n}?`,
        ...mcq(r, cap(f), st.f.map(cap)),
        explanation: `Ở thể ${st.n}: ${st.f.join("; ")}. Đặc điểm "${f}" thuộc thể khác.`,
      };
    },
  },
  {
    id: "l12-su-chuyen-the", subject: S, grade: G, chapter: CH1, topic: "Sự chuyển thể", half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const all = Object.keys(PROC);
      if (r.chance(0.35)) {
        const k = r.pick(all), p = PROC[k];
        const wrong = [PROC[REV[k]].n, ...pickN(r, all.filter((x) => x !== k && x !== REV[k]), 3).map((x) => PROC[x].n)];
        return {
          stem: `Quá trình chuyển ${r.pick(["", "trực tiếp "])}từ thể ${p.a} sang thể ${p.b} được gọi là`,
          ...mcq(r, p.n, wrong),
          explanation: `Chuyển từ thể ${p.a} sang thể ${p.b} là ${p.n}; quá trình ngược lại là ${PROC[REV[k]].n}.`,
        };
      }
      const [ex, k] = r.pick(PROC_EX), p = PROC[k];
      const wrong = [PROC[REV[k]].n, ...pickN(r, all.filter((x) => x !== k && x !== REV[k]), 3).map((x) => PROC[x].n)];
      return {
        stem: `${r.pick(["Hiện tượng", "Quá trình"])}: "${ex}" là ví dụ về`,
        ...mcq(r, p.n, wrong),
        explanation: `Chất chuyển từ thể ${p.a} sang thể ${p.b} nên đó là ${p.n}.`,
      };
    },
  },
  {
    id: "l12-noi-nang-cach-thay-doi", subject: S, grade: G, chapter: CH1, topic: "Nội năng – thực hiện công và truyền nhiệt", half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const work = r.chance(0.5);
      const right = r.pick(work ? WORK_EX : HEAT_EX), wrong = pickN(r, work ? HEAT_EX : WORK_EX, 3);
      return {
        stem: `${r.pick(["Trường hợp nào sau đây", "Trong các hiện tượng sau, hiện tượng nào", "Ở ví dụ nào sau đây", "Trong đời sống, trường hợp nào sau đây", "Trong các tình huống sau, ở tình huống nào", "Hiện tượng nào sau đây cho thấy"])} nội năng của vật thay đổi chủ yếu bằng cách ${work ? "thực hiện công" : "truyền nhiệt"}?`,
        ...mcq(r, cap(right), wrong.map(cap)),
        explanation: work
          ? `"${cap(right)}": có lực tác dụng và sinh công (ma sát, nén) làm nội năng tăng. Các trường hợp còn lại là truyền nhiệt do chênh lệch nhiệt độ.`
          : `"${cap(right)}": nhiệt lượng truyền do chênh lệch nhiệt độ, không có công. Các trường hợp còn lại là thực hiện công (ma sát, nén).`,
      };
    },
  },
  {
    id: "l12-dl1-quy-uoc-dau", subject: S, grade: G, chapter: CH1, topic: "Định luật I nhiệt động lực học – quy ước dấu", half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const [ex, a, b] = r.pick(DL1_EX);
      const right = signTxt(a, b);
      const pre = r.pick([
        "Theo định luật I của nhiệt động lực học $\\Delta U = Q + A$ (quy ước $Q > 0$: hệ nhận nhiệt, $A > 0$: hệ nhận công). Khi",
        "Xét định luật I của nhiệt động lực học $\\Delta U = Q + A$ với quy ước dấu như SGK. Trong quá trình",
      ]);
      return {
        stem: `${pre} ${ex} thì`,
        ...mcq(r, right, [signTxt(a, -b), signTxt(-a, b), signTxt(-a, -b)]),
        explanation: `Hệ ${a > 0 ? "nhận nhiệt nên $Q > 0$" : "truyền nhiệt ra ngoài nên $Q < 0$"}; hệ ${b > 0 ? "nhận công (bị nén) nên $A > 0$" : "thực hiện công (giãn nở) nên $A < 0$"}.`,
      };
    },
  },
  {
    id: "l12-y-nghia-dai-luong-nhiet", subject: S, grade: G, chapter: CH1, topic: "Ý nghĩa nhiệt dung riêng, nhiệt nóng chảy riêng, nhiệt hóa hơi riêng", half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const type = r.pick(["c", "l", "L"]);
      if (type === "c") {
        const s = r.pick(SUB_C), v = tex(s.c, 2);
        const right = `muốn làm cho $1\\ \\text{kg}$ ${s.n} nóng lên thêm $1\\ \\text{K}$ cần truyền cho nó nhiệt lượng $${v}\\ \\text{J}$`;
        return {
          stem: `Nhiệt dung riêng của ${s.n} là ${cTxt(s.c)}. Điều đó có nghĩa là`,
          ...mcq(r, right, [
            `muốn làm cho $1\\ \\text{g}$ ${s.n} nóng lên thêm $1\\ \\text{K}$ cần truyền cho nó nhiệt lượng $${v}\\ \\text{J}$`,
            `muốn làm cho $1\\ \\text{kg}$ ${s.n} nóng lên thêm $${v}\\ \\text{K}$ cần truyền cho nó nhiệt lượng $1\\ \\text{J}$`,
            `$1\\ \\text{kg}$ ${s.n} luôn chứa sẵn nhiệt lượng $${v}\\ \\text{J}$ ở mọi nhiệt độ`,
            `muốn làm $1\\ \\text{kg}$ ${s.n} chuyển hoàn toàn sang thể khác cần nhiệt lượng $${v}\\ \\text{J}$`,
          ]),
          explanation: `Nhiệt dung riêng là nhiệt lượng cần truyền cho $1\\ \\text{kg}$ chất để nhiệt độ tăng thêm $1\\ \\text{K}$ (hay $1\\ ^\\circ\\text{C}$).`,
        };
      }
      if (type === "l") {
        const s = r.pick(SUB_LAMBDA), v = sci(s.l);
        const right = `cần cung cấp nhiệt lượng $${v}\\ \\text{J}$ để làm nóng chảy hoàn toàn $1\\ \\text{kg}$ ${s.n} ở nhiệt độ nóng chảy`;
        return {
          stem: `Nhiệt nóng chảy riêng của ${s.n} là $${v}\\ \\text{J/kg}$. Điều đó có nghĩa là`,
          ...mcq(r, right, [
            `cần cung cấp nhiệt lượng $${v}\\ \\text{J}$ để làm nóng chảy hoàn toàn $1\\ \\text{g}$ ${s.n} ở nhiệt độ nóng chảy`,
            `cần cung cấp nhiệt lượng $${v}\\ \\text{J}$ để làm $1\\ \\text{kg}$ ${s.n} nóng lên thêm $1\\ \\text{K}$`,
            `cần cung cấp nhiệt lượng $${v}\\ \\text{J}$ để làm $1\\ \\text{kg}$ ${s.n} hóa hơi hoàn toàn`,
            `$1\\ \\text{kg}$ ${s.n} tỏa ra nhiệt lượng $${v}\\ \\text{J}$ khi được nung nóng đến nhiệt độ nóng chảy`,
          ]),
          explanation: `Nhiệt nóng chảy riêng $\\lambda$ là nhiệt lượng cần cung cấp để làm nóng chảy hoàn toàn $1\\ \\text{kg}$ chất ở nhiệt độ nóng chảy: $Q = \\lambda m$.`,
        };
      }
      const s = r.pick(SUB_L), v = sci(s.L);
      const right = `cần cung cấp nhiệt lượng $${v}\\ \\text{J}$ để làm $1\\ \\text{kg}$ ${s.n} hóa hơi hoàn toàn ở nhiệt độ sôi`;
      return {
        stem: `Nhiệt hóa hơi riêng của ${s.n} là $${v}\\ \\text{J/kg}$. Điều đó có nghĩa là`,
        ...mcq(r, right, [
          `cần cung cấp nhiệt lượng $${v}\\ \\text{J}$ để làm $1\\ \\text{g}$ ${s.n} hóa hơi hoàn toàn ở nhiệt độ sôi`,
          `cần cung cấp nhiệt lượng $${v}\\ \\text{J}$ để làm $1\\ \\text{kg}$ ${s.n} nóng lên thêm $1\\ \\text{K}$`,
          `cần cung cấp nhiệt lượng $${v}\\ \\text{J}$ để làm $1\\ \\text{kg}$ ${s.n} đông đặc hoàn toàn`,
          `cần cung cấp nhiệt lượng $${v}\\ \\text{J}$ để đun $1\\ \\text{kg}$ ${s.n} từ $0\\ ^\\circ\\text{C}$ đến khi sôi`,
        ]),
        explanation: `Nhiệt hóa hơi riêng $L$ là nhiệt lượng cần để làm $1\\ \\text{kg}$ chất lỏng hóa hơi hoàn toàn ở nhiệt độ sôi: $Q = Lm$.`,
      };
    },
  },
  {
    id: "l12-thang-nhiet-do", subject: S, grade: G, chapter: CH1, topic: "Thang nhiệt độ Celsius, Kelvin, Fahrenheit", half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const form = r.pick(["c2k", "k2c", "c2f", "f2c", "dt"]);
      const [cn, lo, hi] = r.pick(TCTX), ctx = `Nhiệt độ của ${cn}`, tc = r.int(lo, hi);
      const KT = "(lấy $T = t + 273$)";
      if (form === "c2k") {
        const t = tc;
        return {
          stem: `${ctx} là $${t}\\ ^\\circ\\text{C}$. Trong thang Kelvin ${KT}, nhiệt độ này là`,
          ...nopt(r, t + 273, [t - 273, 273 - t, 1.8 * t + 32, t + 373].map(Math.abs), (x) => q(x, "K")),
          explanation: `$T = t + 273 = ${t} + 273 = ${t + 273}\\ \\text{K}$.`,
        };
      }
      if (form === "k2c") {
        const t = tc, T = t + 273;
        need(t !== 0);
        return {
          stem: `${ctx} đo theo thang Kelvin là $${T}\\ \\text{K}$. Trong thang Celsius ${KT}, nhiệt độ này là`,
          ...mcq(r, dC(t, 1), [dC(T + 273), dC(273 - T), dC(round((T - 32) / 1.8, 1)), dC(-t)]),
          explanation: `$t = T - 273 = ${T} - 273 = ${t}\\ ^\\circ\\text{C}$.`,
        };
      }
      const FT = "Biết $t_F = 1{,}8\\,t + 32$, trong đó $t_F$ tính bằng $^\\circ\\text{F}$, $t$ tính bằng $^\\circ\\text{C}$.";
      const dF = (x: number) => `$${tex(x, 1)}\\ ^\\circ\\text{F}$`;
      if (form === "c2f") {
        const t = tc;
        return {
          stem: `${ctx} là $${t}\\ ^\\circ\\text{C}$. ${FT} Nhiệt độ này trong thang Fahrenheit là`,
          ...mcq(r, dF(1.8 * t + 32), [dF(t + 32), dF(1.8 * (t + 32)), dF(round((t - 32) / 1.8, 1)), dF(1.8 * t)]),
          explanation: `$t_F = 1{,}8\\cdot ${t} + 32 = ${tex(1.8 * t + 32, 1)}\\ ^\\circ\\text{F}$.`,
        };
      }
      if (form === "f2c") {
        const t = r.int(0, 8) * 5, F = round(1.8 * t + 32, 1);
        return {
          stem: `Một bản tin thời tiết cho biết nhiệt độ ngoài trời là $${tex(F, 1)}\\ ^\\circ\\text{F}$. ${FT} Nhiệt độ này trong thang Celsius là`,
          ...mcq(r, dC(t), [dC(round(F / 1.8 - 32, 1)), dC(round(1.8 * F + 32, 1)), dC(F - 32), dC(round((F + 32) / 1.8, 1))]),
          explanation: `$t = \\dfrac{t_F - 32}{1{,}8} = \\dfrac{${tex(F, 1)} - 32}{1{,}8} = ${t}\\ ^\\circ\\text{C}$.`,
        };
      }
      const d = r.int(2, 30);
      return {
        stem: `${r.pick(["Nhiệt độ của một vật", "Nhiệt độ của một lượng nước", "Nhiệt độ của một thanh kim loại", "Nhiệt độ của một khối khí"])} tăng thêm $${d}\\ ^\\circ\\text{C}$. Khi đó nhiệt độ tuyệt đối tương ứng tăng thêm`,
        ...nopt(r, d, [d + 273, 273 - d, 1.8 * d], (x) => q(x, "K")),
        explanation: `Độ chia $1\\ \\text{K}$ bằng độ chia $1\\ ^\\circ\\text{C}$ nên $\\Delta T = \\Delta t = ${d}\\ \\text{K}$.`,
      };
    },
  },
  {
    id: "l12-ly-thuyet-nhiet", subject: S, grade: G, chapter: CH1, topic: "Sự chuyển thể, nội năng, nhiệt độ – lí thuyết", half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const askTrue = r.chance(0.5);
      const right = r.pick(askTrue ? TRUE_NHIET : FALSE_NHIET), wrong = pickN(r, askTrue ? FALSE_NHIET : TRUE_NHIET, 3);
      return {
        stem: `${r.pick(["Khi ôn tập về sự chuyển thể, nội năng và nhiệt độ, phát biểu", "Trong giờ thảo luận nhóm về vật lí nhiệt, phát biểu", `Bạn ${r.pick(NAMES)} ghi vào vở một số phát biểu về vật lí nhiệt. Phát biểu`, "Xét các kiến thức về sự chuyển thể và nội năng. Phát biểu"])} nào sau đây là ${askTrue ? "đúng" : "sai"}?`,
        ...mcq(r, right, wrong),
        explanation: askTrue ? `Phát biểu đúng: ${right} Các phát biểu còn lại sai.` : `Phát biểu sai: ${right} Các phát biểu còn lại đúng.`,
      };
    },
  },
  {
    id: "l12-nhiet-luong-mc-dt", subject: S, grade: G, chapter: CH1, topic: "Nhiệt dung riêng – $Q = mc\\Delta t$", half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const s = r.pick(SUB_C), inG = r.chance(0.5);
      const m = inG ? r.int(2, 16) * 50 : r.pick([0.5, 1, 1.5, 2, 2.5, 3, 4, 5]), mk = inG ? m / 1000 : m;
      const t1 = r.int(1, 6) * 5, dt = r.int(2, 12) * 5, t2 = t1 + dt, Q = mk * s.c * dt;
      const mT = q(m, inG ? "g" : "kg"), heat = r.chance(0.5);
      const from = heat ? t1 : t2, to = heat ? t2 : t1;
      const ask = r.pick(["Q", "Q", "c", "t"]);
      if (ask === "Q") {
        return {
          stem: `Biết nhiệt dung riêng của ${s.n} là ${cTxt(s.c)}. Nhiệt lượng ${heat ? "cần cung cấp để đun nóng" : "tỏa ra khi"} ${mT} ${s.n} ${heat ? "" : "nguội đi "}từ ${dC(from, 1)} đến ${dC(to, 1)} là`,
          ...nopt(r, Q, [inG ? m * s.c * dt : Q / 1000, mk * s.c * to, mk * s.c * (t1 + t2), Q / 2], (x) => qs(x / 1000, "kJ")),
          explanation: `$Q = mc\\Delta t = ${tex(mk, 3)}\\cdot ${s.c}\\cdot ${dt} = ${tex(Q, 2)}\\ \\text{J} \\approx ${ts(Q / 1000)}\\ \\text{kJ}$.`,
        };
      }
      if (ask === "c") {
        return {
          stem: `Cung cấp nhiệt lượng ${q(Q, "J")} cho ${mT} một chất thì nhiệt độ của nó tăng từ ${dC(t1, 1)} lên ${dC(t2, 1)} (chất không chuyển thể). Nhiệt dung riêng của chất đó là`,
          ...nopt(r, s.c, [Q / (m * dt), Q / (mk * t2), Q / (mk * t1), 2 * s.c], (x) => `$${ts(x)}\\ ${CU}$`),
          explanation: `$c = \\dfrac{Q}{m\\Delta t} = \\dfrac{${tex(Q, 2)}}{${tex(mk, 3)}\\cdot ${dt}} = ${s.c}\\ ${CU}$${inG ? ` (đổi $${m}\\ \\text{g} = ${tex(mk, 3)}\\ \\text{kg}$)` : ""}.`,
        };
      }
      return {
        stem: `Một khối ${s.n} khối lượng ${mT} đang ở ${dC(from, 1)}. Biết nhiệt dung riêng của ${s.n} là ${cTxt(s.c)}. Nếu ${heat ? `cung cấp cho nó nhiệt lượng ${q(Q, "J")}` : `nó tỏa ra nhiệt lượng ${q(Q, "J")}`} (không chuyển thể) thì nhiệt độ sau cùng của nó là`,
        ...mcq(r, dC(to), [dC(dt), dC(heat ? t1 - dt : t2 + dt), dC(round(from + (heat ? 1 : -1) * Q / (m * s.c), 1)), dC(heat ? t2 + dt : t1 - dt)]),
        explanation: `$\\Delta t = \\dfrac{Q}{mc} = \\dfrac{${tex(Q, 2)}}{${tex(mk, 3)}\\cdot ${s.c}} = ${dt}\\ ^\\circ\\text{C}$, nên $t = ${from} ${heat ? "+" : "-"} ${dt} = ${to}\\ ^\\circ\\text{C}$.`,
      };
    },
  },
  {
    id: "l12-nong-chay-lambda-m", subject: S, grade: G, chapter: CH1, topic: "Nhiệt nóng chảy riêng – $Q = \\lambda m$", half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const s = r.pick(SUB_LAMBDA), inG = r.chance(0.5);
      const m = inG ? r.int(1, 20) * 50 : r.pick([0.2, 0.5, 1, 1.5, 2, 2.5, 3, 4]), mk = inG ? m / 1000 : m;
      const Q = s.l * mk, mT = q(m, inG ? "g" : "kg");
      const lt = `$\\lambda = ${sci(s.l)}\\ \\text{J/kg}$`;
      const ask = r.pick(["Q", "Q", "m", "l"]);
      if (ask === "Q") {
        return {
          stem: `Biết nhiệt nóng chảy riêng của ${s.n} là ${lt}. Nhiệt lượng cần cung cấp để làm nóng chảy hoàn toàn ${mT} ${s.n} ở nhiệt độ nóng chảy ${dC(s.t, 1)} là`,
          ...nopt(r, Q, [inG ? s.l * m : Q * 1000, Q / 1000, s.l / mk, Q / 10], (x) => qs(x / 1000, "kJ")),
          explanation: `$Q = \\lambda m = ${sci(s.l)}\\cdot ${tex(mk, 3)} = ${ts(Q / 1000)}\\ \\text{kJ}$${inG ? ` (đổi $${m}\\ \\text{g} = ${tex(mk, 3)}\\ \\text{kg}$)` : ""}.`,
        };
      }
      if (ask === "m") {
        return {
          stem: `Cung cấp nhiệt lượng ${qs(Q / 1000, "kJ")} cho một khối ${s.n} đang ở nhiệt độ nóng chảy ${dC(s.t, 1)} thì khối ${s.n} vừa nóng chảy hết. Biết ${lt}. Khối lượng của khối ${s.n} là`,
          ...nopt(r, mk * 1000, [Q / s.l, mk * 1e6, s.l / Q * 1000, mk * 100], (x) => qs(x, "g")),
          explanation: `$m = \\dfrac{Q}{\\lambda} = \\dfrac{${ts(Q)}}{${sci(s.l)}} = ${tex(mk, 3)}\\ \\text{kg} = ${tex(mk * 1000, 1)}\\ \\text{g}$ (đổi $\\text{kJ}$ ra $\\text{J}$).`,
        };
      }
      return {
        stem: `Để làm nóng chảy hoàn toàn ${mT} một kim loại ở nhiệt độ nóng chảy cần cung cấp nhiệt lượng ${qs(Q / 1000, "kJ")}. Nhiệt nóng chảy riêng của kim loại đó là`,
        ...nopt(r, s.l, [Q / m, Q * mk, s.l / 1000, s.l * 1000], (x) => `$${sci(x)}\\ \\text{J/kg}$`),
        explanation: `$\\lambda = \\dfrac{Q}{m} = \\dfrac{${ts(Q)}}{${tex(mk, 3)}} = ${sci(s.l)}\\ \\text{J/kg}$.`,
      };
    },
  },
  {
    id: "l12-hoa-hoi-L-m", subject: S, grade: G, chapter: CH1, topic: "Nhiệt hóa hơi riêng – $Q = Lm$", half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const s = r.pick(SUB_L), inG = r.chance(0.6);
      const m = inG ? r.int(1, 16) * 25 : r.pick([0.1, 0.2, 0.5, 1, 1.5, 2]), mk = inG ? m / 1000 : m;
      const Q = s.L * mk, Lt = `$L = ${sci(s.L)}\\ \\text{J/kg}$`;
      if (r.chance(0.5)) {
        return {
          stem: `Biết nhiệt hóa hơi riêng của ${s.n} ở nhiệt độ sôi ${dC(s.t, 1)} là ${Lt}. Nhiệt lượng cần cung cấp để làm ${q(m, inG ? "g" : "kg")} ${s.n} ở nhiệt độ sôi hóa hơi hoàn toàn là`,
          ...nopt(r, Q, [inG ? s.L * m : Q * 1000, Q / 1000, s.L / mk, Q / 10], (x) => qs(x / 1000, "kJ")),
          explanation: `$Q = Lm = ${sci(s.L)}\\cdot ${tex(mk, 3)} = ${ts(Q / 1000)}\\ \\text{kJ}$.`,
        };
      }
      const P = r.pick([500, 800, 1000, 1200, 1500, 2000]), tau = Q / P;
      need(tau >= 20 && tau <= 3600);
      const tauMin = tau / 60;
      return {
        stem: `Một dây đun có công suất ${q(P, "W")} nhúng trong ${s.n} đang sôi ở ${dC(s.t, 1)}. Biết ${Lt}, bỏ qua hao phí. Thời gian cần để làm ${q(m, inG ? "g" : "kg")} ${s.n} hóa hơi hoàn toàn là`,
        ...nopt(r, tau, [tau * 60, inG ? tau * 1000 : tau / 1000, tau / 2, P / s.L * 1e6], (x) => qs(x, "s")),
        explanation: `$Q = Lm = ${ts(Q)}\\ \\text{J}$; $\\tau = \\dfrac{Q}{P} = \\dfrac{${ts(Q)}}{${P}} \\approx ${ts(tau)}\\ \\text{s}$ (khoảng $${ts(tauMin)}$ phút).`,
      };
    },
  },
  {
    id: "l12-dl1-tinh", subject: S, grade: G, chapter: CH1, topic: "Định luật I nhiệt động lực học – tính toán", half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const Qv = r.int(5, 60) * 10 * r.pick([1, -1]), Av = r.int(2, 50) * 10 * r.pick([1, -1]), dU = Qv + Av;
      need(dU !== 0 && Math.abs(Qv) !== Math.abs(Av));
      const sys = r.pick(["Một lượng khí trong xilanh", "Khí trong một động cơ nhiệt", "Một khối khí lí tưởng", "Khí trong một bình có pít-tông"]);
      const tQ = (x: number) => (x > 0 ? `nhận nhiệt lượng $${x}\\ \\text{J}$` : `truyền ra môi trường nhiệt lượng $${-x}\\ \\text{J}$`);
      const tA = (x: number) => (x > 0 ? `nhận công $${x}\\ \\text{J}$` : `thực hiện công $${-x}\\ \\text{J}$`);
      const tU = (x: number) => (x > 0 ? `nội năng của khí tăng $${x}\\ \\text{J}$` : `nội năng của khí giảm $${-x}\\ \\text{J}$`);
      const ask = r.pick(["U", "U", "A", "Q"]);
      if (ask === "U") {
        return {
          stem: `${sys} ${tQ(Qv)} và ${tA(Av)}. Trong quá trình này`,
          ...mcq(r, cap(tU(dU)), [Qv - Av, -Qv + Av, -dU].map((x) => cap(tU(x)))),
          explanation: `$\\Delta U = Q + A = (${Qv}) + (${Av}) = ${dU}\\ \\text{J}$: ${tU(dU)}.`,
        };
      }
      if (ask === "A") {
        return {
          stem: `${sys} ${tQ(Qv)} thì ${tU(dU)}. Trong quá trình đó khí`,
          ...mcq(r, tA(Av), [-Av, dU + Qv, -(dU + Qv)].map(tA)),
          explanation: `$A = \\Delta U - Q = (${dU}) - (${Qv}) = ${Av}\\ \\text{J}$ ${Av < 0 ? "< 0: khí thực hiện công" : "> 0: khí nhận công"} $${Math.abs(Av)}\\ \\text{J}$.`,
        };
      }
      return {
        stem: `${sys} ${tA(Av)} thì ${tU(dU)}. Trong quá trình đó khí`,
        ...mcq(r, tQ(Qv), [-Qv, dU + Av, -(dU + Av)].map(tQ)),
        explanation: `$Q = \\Delta U - A = (${dU}) - (${Av}) = ${Qv}\\ \\text{J}$ ${Qv > 0 ? "> 0: khí nhận nhiệt" : "< 0: khí truyền nhiệt ra ngoài"} $${Math.abs(Qv)}\\ \\text{J}$.`,
      };
    },
  },
  {
    id: "l12-can-bang-nhiet", subject: S, grade: G, chapter: CH1, topic: "Phương trình cân bằng nhiệt", half: 1, level: 3, kind: "mcq",
    make: (r) => {
      const cw = 4200;
      if (r.chance(0.3)) {
        const m1 = r.int(1, 8) * 50, m2 = r.int(1, 8) * 50, t1 = r.int(14, 18) * 5, t2 = r.int(3, 6) * 5;
        need(m1 !== m2);
        const t = (m1 * t1 + m2 * t2) / (m1 + m2);
        return {
          stem: `${r.pick(NAMES)} đổ ${q(m1, "g")} nước ở ${dC(t1, 1)} vào ${q(m2, "g")} nước ở ${dC(t2, 1)}. Bỏ qua sự trao đổi nhiệt với bình và môi trường. Nhiệt độ của nước khi cân bằng nhiệt xấp xỉ là`,
          ...mcq(r, dC(round(t, 1)), [dC(round((t1 + t2) / 2, 1)), dC(round((m1 * t2 + m2 * t1) / (m1 + m2), 1)), dC(round((m1 * t1 - m2 * t2) / (m1 - m2), 1)), dC(round(t1 - t2, 1))]),
          explanation: `$m_1c(t_1 - t) = m_2c(t - t_2) \\Rightarrow t = \\dfrac{m_1t_1 + m_2t_2}{m_1 + m_2} = \\dfrac{${m1}\\cdot ${t1} + ${m2}\\cdot ${t2}}{${m1 + m2}} \\approx ${tex(t, 1)}\\ ^\\circ\\text{C}$.`,
        };
      }
      const M = r.pick(METALS), m1 = r.int(2, 10) * 50, m2 = r.int(2, 10) * 50, t1 = r.int(8, 20) * 10, t2 = r.int(15, 30);
      const a = m1 * M.c, b = m2 * cw, t = (a * t1 + b * t2) / (a + b);
      const intro = `Thả một miếng ${M.n} khối lượng ${q(m1, "g")} đã được nung nóng tới ${dC(t1, 1)} vào ${q(m2, "g")} nước ở ${dC(t2, 1)}. Biết nhiệt dung riêng của ${M.n} và nước lần lượt là ${cTxt(M.c)} và ${cTxt(cw)}; bỏ qua sự trao đổi nhiệt với bình và môi trường.`;
      return {
        stem: `${intro} Nhiệt độ của nước khi có cân bằng nhiệt xấp xỉ là`,
        ...mcq(r, dC(round(t, 1)), [dC(round((m1 * t1 + m2 * t2) / (m1 + m2), 1)), dC(round((t1 + t2) / 2, 1)), dC(round((M.c * t1 + cw * t2) / (M.c + cw), 1)), dC(round((a * t1 - b * t2) / (a - b), 1))]),
        explanation: `Nhiệt lượng ${M.n} tỏa ra bằng nhiệt lượng nước thu vào: $m_1c_1(t_1 - t) = m_2c_2(t - t_2)$ $\\Rightarrow t = \\dfrac{m_1c_1t_1 + m_2c_2t_2}{m_1c_1 + m_2c_2} = \\dfrac{${tex(m1 / 1000, 3)}\\cdot ${M.c}\\cdot ${t1} + ${tex(m2 / 1000, 3)}\\cdot ${cw}\\cdot ${t2}}{${tex(m1 / 1000, 3)}\\cdot ${M.c} + ${tex(m2 / 1000, 3)}\\cdot ${cw}} \\approx ${tex(t, 1)}\\ ^\\circ\\text{C}$.`,
      };
    },
  },
  {
    id: "l12-nuoc-da-nhieu-giai-doan", subject: S, grade: G, chapter: CH1, topic: "Nhiệt lượng qua nhiều giai đoạn chuyển thể", half: 1, level: 3, kind: "mcq",
    make: (r) => {
      const cd = 2100, cn = 4200, lam = 3.34e5, L = 2.3e6;
      const m = r.pick([0.1, 0.2, 0.25, 0.4, 0.5, 1, 1.5, 2]), t1 = r.int(1, 6) * 5;
      const steam = r.chance(0.4), t2 = steam ? 100 : r.int(2, 8) * 10;
      const Q1 = m * cd * t1, Q2 = m * lam, Q3 = m * cn * t2, Q4 = steam ? m * L : 0, Q = Q1 + Q2 + Q3 + Q4;
      const consts = `Biết nhiệt dung riêng của nước đá là ${cTxt(cd)}, của nước là ${cTxt(cn)}; nhiệt nóng chảy riêng của nước đá là $${sci(lam)}\\ \\text{J/kg}$${steam ? `; nhiệt hóa hơi riêng của nước là $${sci(L)}\\ \\text{J/kg}$` : ""}.`;
      const target = steam ? `biến thành hơi nước hoàn toàn ở ${dC(100, 1)}` : `biến thành nước ở ${dC(t2, 1)}`;
      const wrong = [Q - Q1, Q - Q2, Q1 + Q2 + m * cd * t2 + Q4, steam ? Q - Q4 : Q + m * cn * t1, Q - Q1 - Q3];
      return {
        stem: `Cần cung cấp nhiệt lượng bao nhiêu để làm cho ${q(m, "kg")} nước đá ở ${dC(-t1, 1)} ${target}? ${consts}`,
        ...nopt(r, Q, wrong, (x) => qs(x / 1000, "kJ")),
        explanation: `$Q = mc_đ\\Delta t_1 + \\lambda m + mc_n\\Delta t_2${steam ? " + Lm" : ""} = ${ts(Q1, 4)} + ${ts(Q2, 4)} + ${ts(Q3, 4)}${steam ? ` + ${ts(Q4, 4)}` : ""} \\approx ${ts(Q / 1000)}\\ \\text{kJ}$.`,
      };
    },
  },

  /* ---------- TF ---------- */
  {
    id: "l12-tf-ly-thuyet-nhiet", subject: S, grade: G, chapter: CH1, topic: "Cấu trúc chất, chuyển thể, nội năng – Đúng/Sai", half: 1, level: 1, kind: "tf",
    make: (r) => {
      const struct = r.pick(STATES), other = r.pick(STATES.filter((x) => x !== struct));
      const s1: [string, boolean] = r.chance(0.5) ? [`Ở thể ${struct.n}, ${r.pick(struct.f)}.`, true] : [`Ở thể ${struct.n}, ${r.pick(other.f)}.`, false];
      const items: [string, boolean][] = [s1];
      const tr = pickN(r, TRUE_NHIET, 3), fa = pickN(r, FALSE_NHIET, 3);
      for (let i = 0; i < 3; i++) items.push(r.chance(0.5) ? [tr[i], true] : [fa[i], false]);
      return {
        stem: `${r.pick([`Bạn ${r.pick(NAMES)} đưa ra các phát biểu sau`, `Trong giờ thảo luận, nhóm của bạn ${r.pick(NAMES)} nêu các phát biểu sau`, "Xét các phát biểu sau"])} về cấu trúc của chất, sự chuyển thể và nội năng.`,
        ...tf(items),
        explanation: items.map(([t, a]) => `${a ? "Đúng" : "Sai"}: ${t}`).join(" "),
      };
    },
  },
  {
    id: "l12-tf-dl1-xilanh", subject: S, grade: G, chapter: CH1, topic: "Định luật I nhiệt động lực học – Đúng/Sai", half: 1, level: 2, kind: "tf",
    make: (r) => {
      const Qv = r.int(20, 90) * 10, F = r.int(4, 30) * 25, d = r.int(2, 15), A = (F * d) / 100, dU = Qv - A;
      need(dU > 0 && Number.isInteger(A * 10));
      const c1 = r.chance(0.5), c2 = r.chance(0.5), c3 = r.chance(0.5), c4 = r.chance(0.5);
      return {
        stem: `Khí trong một xilanh nhận nhiệt lượng ${q(Qv, "J")} và giãn nở, đẩy pít-tông dịch chuyển đều một đoạn ${q(d, "cm")}. Lực do khí tác dụng lên pít-tông có độ lớn không đổi ${q(F, "N")}. Áp dụng định luật I của nhiệt động lực học $\\Delta U = Q + A$.`,
        ...tf([
          [c1 ? "Khí thực hiện công nên theo quy ước $A < 0$." : "Khí thực hiện công nên theo quy ước $A > 0$.", c1],
          [`Độ lớn công mà khí thực hiện là ${q(c2 ? A : F * d, "J")}.`, c2],
          [`Nội năng của khí tăng ${q(c3 ? dU : Qv + A, "J")}.`, c3],
          [c4 ? `Nếu giữ pít-tông cố định và truyền cho khí cùng nhiệt lượng trên thì nội năng của khí tăng ${q(Qv, "J")}.` : `Nếu giữ pít-tông cố định và truyền cho khí cùng nhiệt lượng trên thì nội năng của khí không thay đổi.`, c4],
        ]),
        explanation: `Khí sinh công nên $A < 0$, $|A| = Fd = ${F}\\cdot ${tex(d / 100, 2)} = ${tex(A, 2)}\\ \\text{J}$ (đổi $\\text{cm}$ ra $\\text{m}$). $\\Delta U = Q + A = ${Qv} - ${tex(A, 2)} = ${tex(dU, 2)}\\ \\text{J}$. Pít-tông cố định thì $A = 0$, $\\Delta U = Q = ${Qv}\\ \\text{J}$.`,
      };
    },
  },
  {
    id: "l12-tf-nuoc-da-dun-nong", subject: S, grade: G, chapter: CH1, topic: "Đun nóng nước đá – Đúng/Sai", half: 1, level: 3, kind: "tf",
    make: (r) => {
      const cd = 2100, cn = 4200, lam = 3.34e5;
      const mg = r.pick([100, 150, 200, 250, 300, 400, 500]), m = mg / 1000, t1 = r.int(1, 4) * 5, t2 = r.int(2, 8) * 10;
      const Q1 = m * cd * t1, Q2 = lam * m, Q3 = m * cn * t2, Q = Q1 + Q2 + Q3;
      const c1 = r.chance(0.5), c2 = r.chance(0.5), c3 = r.chance(0.5), c4 = r.chance(0.5);
      const kJ = (x: number) => qs(x / 1000, "kJ");
      return {
        stem: `Đun nóng ${q(mg, "g")} nước đá ở ${dC(-t1, 1)} cho đến khi biến hoàn toàn thành nước ở ${dC(t2, 1)}. Biết nhiệt dung riêng của nước đá là ${cTxt(cd)}, của nước là ${cTxt(cn)}, nhiệt nóng chảy riêng của nước đá là $${sci(lam)}\\ \\text{J/kg}$; bỏ qua hao phí.`,
        ...tf([
          [c1 ? `Trong quá trình nước đá tan, nhiệt độ của hỗn hợp nước đá và nước luôn bằng $0\\ ^\\circ\\text{C}$.` : `Trong quá trình nước đá tan, nhiệt độ của hỗn hợp nước đá và nước tăng dần.`, c1],
          [`Nhiệt lượng để làm nóng nước đá từ ${dC(-t1, 1)} đến $0\\ ^\\circ\\text{C}$ là ${kJ(c2 ? Q1 : m * cn * t1)}.`, c2],
          [`Nhiệt lượng để làm nóng chảy hoàn toàn lượng nước đá ở $0\\ ^\\circ\\text{C}$ là ${kJ(c3 ? Q2 : lam * mg)}.`, c3],
          [`Tổng nhiệt lượng cần cung cấp cho cả quá trình là ${kJ(c4 ? Q : Q1 + Q3)}.`, c4],
        ]),
        explanation: `Nước đá tan ở nhiệt độ không đổi $0\\ ^\\circ\\text{C}$. $Q_1 = mc_đ\\Delta t = ${tex(m, 3)}\\cdot ${cd}\\cdot ${t1} = ${ts(Q1, 4)}\\ \\text{J}$; $Q_2 = \\lambda m = ${ts(Q2, 4)}\\ \\text{J}$ ($m$ tính bằng kg); $Q_3 = mc_n\\Delta t = ${tex(m, 3)}\\cdot ${cn}\\cdot ${t2} = ${ts(Q3, 4)}\\ \\text{J}$; $Q = Q_1 + Q_2 + Q_3 \\approx ${ts(Q / 1000)}\\ \\text{kJ}$.`,
      };
    },
  },
  {
    id: "l12-tf-do-nhiet-dung-rieng", subject: S, grade: G, chapter: CH1, topic: "Thí nghiệm đo nhiệt dung riêng – Đúng/Sai", half: 1, level: 3, kind: "tf",
    make: (r) => {
      const liq = r.pick([{ n: "nước", c: 4200 }, { n: "dầu ăn", c: 2000 }, { n: "ethanol", c: 2500 }, { n: "glycerol", c: 2400 }]);
      const P = r.pick([500, 600, 800, 1000, 1200]), m = r.pick([0.5, 1, 1.5, 2]), dt = r.int(2, 6) * 5;
      const Qv = m * liq.c * dt, tau = Qv / P;
      need(Number.isInteger(tau) && tau % 60 === 0 && tau >= 60 && tau <= 1800);
      const mins = tau / 60, t1 = r.int(20, 28), dt2 = r.int(1, 4) * 5, tau2 = (m * liq.c * dt2) / P;
      need(Number.isInteger(tau2));
      const c1 = r.chance(0.5), c2 = r.chance(0.5), c3 = r.chance(0.5), c4 = r.chance(0.5);
      return {
        stem: `${r.pick(NAMES)} dùng một dây đun có công suất ${q(P, "W")} để đun ${q(m, "kg")} ${liq.n} trong bình cách nhiệt. Sau ${q(mins, "phút")}, nhiệt độ của ${liq.n} tăng từ ${dC(t1, 1)} lên ${dC(t1 + dt, 1)}. Coi toàn bộ nhiệt lượng do dây đun tỏa ra được ${liq.n} hấp thụ (trừ ý cuối).`,
        ...tf([
          [`Nhiệt lượng dây đun tỏa ra trong thời gian trên là ${qs(c1 ? Qv : P * mins, "J")}.`, c1],
          [`Nhiệt dung riêng của ${liq.n} đo được là ${c2 ? `$${tex(liq.c, 2)}\\ ${CU}$` : `$${ts(P * mins / (m * dt))}\\ ${CU}$`}.`, c2],
          [`Nếu đun tiếp (cùng điều kiện) để ${liq.n} nóng thêm ${dC(dt2, 1)} thì cần thêm ${q(c3 ? tau2 : (m * liq.c * (dt + dt2)) / P, "s")}.`, c3],
          [c4 ? `Trên thực tế có một phần nhiệt lượng hao phí ra môi trường nên giá trị nhiệt dung riêng tính theo cách trên lớn hơn giá trị thực.` : `Trên thực tế có một phần nhiệt lượng hao phí ra môi trường nên giá trị nhiệt dung riêng tính theo cách trên nhỏ hơn giá trị thực.`, c4],
        ]),
        explanation: `$Q = P\\tau = ${P}\\cdot ${tau} = ${Qv}\\ \\text{J}$ (đổi phút ra giây). $c = \\dfrac{Q}{m\\Delta t} = \\dfrac{${Qv}}{${tex(m, 2)}\\cdot ${dt}} = ${liq.c}\\ ${CU}$. Nóng thêm $${dt2}\\ ^\\circ\\text{C}$: $\\tau' = \\dfrac{mc\\Delta t'}{P} = ${tau2}\\ \\text{s}$ (chỉ tính phần nhiệt độ tăng thêm). Có hao phí thì nhiệt lượng thực sự chất lỏng nhận nhỏ hơn $P\\tau$, nên $c$ tính theo $P\\tau$ lớn hơn giá trị thực.`,
      };
    },
  },

  /* ---------- SHORT ---------- */
  {
    id: "l12-s-doi-nhiet-do", subject: S, grade: G, chapter: CH1, topic: "Đổi nhiệt độ giữa các thang đo", half: 1, level: 1, kind: "short",
    make: (r) => {
      const form = r.pick(["c2k", "k2c", "c2f", "f2c"]);
      const [ctx, lo, hi] = r.pick(TCTX), tc = r.int(lo, hi);
      if (form === "c2k") {
        const t = tc;
        return { stem: `Nhiệt độ của ${ctx} là ${dC(t, 1)}. Lấy $T = t + 273$. Nhiệt độ đó trong thang Kelvin là bao nhiêu kelvin?`, ...short(t + 273, 1), explanation: `$T = ${t} + 273 = ${t + 273}\\ \\text{K}$.` };
      }
      if (form === "k2c") {
        const t = tc, T = t + 273;
        return { stem: `Nhiệt độ của ${ctx} là ${q(T, "K")}. Lấy $T = t + 273$. Nhiệt độ đó trong thang Celsius là bao nhiêu $^\\circ\\text{C}$?`, ...short(t, 1), explanation: `$t = T - 273 = ${T} - 273 = ${t}\\ ^\\circ\\text{C}$.` };
      }
      const FT = "Biết $t_F = 1{,}8\\,t + 32$.";
      if (form === "c2f") {
        const t = tc;
        return { stem: `Nhiệt độ của ${ctx} là ${dC(t, 1)}. ${FT} Nhiệt độ đó trong thang Fahrenheit là bao nhiêu $^\\circ\\text{F}$? (Làm tròn đến hàng phần mười.)`, ...short(1.8 * t + 32, 1), explanation: `$t_F = 1{,}8\\cdot ${t} + 32 = ${tex(1.8 * t + 32, 1)}\\ ^\\circ\\text{F}$.` };
      }
      const F = Math.round(1.8 * tc + 32), t = (F - 32) / 1.8;
      return { stem: `Nhiệt độ của ${ctx} là $${F}\\ ^\\circ\\text{F}$. ${FT} Nhiệt độ đó trong thang Celsius là bao nhiêu $^\\circ\\text{C}$? (Làm tròn đến hàng phần mười.)`, ...short(t, 1), explanation: `$t = \\dfrac{${F} - 32}{1{,}8} \\approx ${tex(t, 1)}\\ ^\\circ\\text{C}$.` };
    },
  },
  {
    id: "l12-s-nhiet-luong", subject: S, grade: G, chapter: CH1, topic: "Tính nhiệt lượng $Q = mc\\Delta t$, $Q = \\lambda m$, $Q = Lm$", half: 1, level: 2, kind: "short",
    make: (r) => {
      const type = r.pick(["c", "c", "l", "L"]);
      if (type === "c") {
        const s = r.pick(SUB_C), inG = r.chance(0.5);
        const m = inG ? r.int(2, 20) * 50 : r.pick([0.5, 1, 1.5, 2, 2.5, 3]), mk = inG ? m / 1000 : m;
        const t1 = r.int(15, 30), dt = r.int(2, 15) * 5, Q = mk * s.c * dt;
        return {
          stem: `Biết nhiệt dung riêng của ${s.n} là ${cTxt(s.c)}. Nhiệt lượng cần cung cấp để làm nóng ${q(m, inG ? "g" : "kg")} ${s.n} từ ${dC(t1, 1)} lên ${dC(t1 + dt, 1)} là bao nhiêu kJ? (Làm tròn đến hàng phần mười.)`,
          ...short(Q / 1000, 1),
          explanation: `$Q = mc\\Delta t = ${tex(mk, 3)}\\cdot ${s.c}\\cdot ${dt} = ${tex(Q, 1)}\\ \\text{J} \\approx ${tex(Q / 1000, 1)}\\ \\text{kJ}$.`,
        };
      }
      if (type === "l") {
        const s = r.pick(SUB_LAMBDA), mg = r.int(1, 30) * 50, Q = s.l * mg / 1000;
        return {
          stem: `Biết nhiệt nóng chảy riêng của ${s.n} là $${sci(s.l)}\\ \\text{J/kg}$. Nhiệt lượng cần cung cấp để làm nóng chảy hoàn toàn ${q(mg, "g")} ${s.n} ở nhiệt độ nóng chảy là bao nhiêu kJ? (Làm tròn đến hàng phần mười.)`,
          ...short(Q / 1000, 1),
          explanation: `$Q = \\lambda m = ${sci(s.l)}\\cdot ${tex(mg / 1000, 3)} = ${tex(Q, 1)}\\ \\text{J} \\approx ${tex(Q / 1000, 1)}\\ \\text{kJ}$.`,
        };
      }
      const s = r.pick(SUB_L), mg = r.int(1, 40) * 10, Q = s.L * mg / 1000;
      return {
        stem: `Biết nhiệt hóa hơi riêng của ${s.n} là $${sci(s.L)}\\ \\text{J/kg}$. Nhiệt lượng cần cung cấp để làm ${q(mg, "g")} ${s.n} hóa hơi hoàn toàn ở nhiệt độ sôi là bao nhiêu kJ? (Làm tròn đến hàng đơn vị.)`,
        ...short(round(Q / 1000), 1),
        explanation: `$Q = Lm = ${sci(s.L)}\\cdot ${tex(mg / 1000, 3)} = ${ts(Q, 4)}\\ \\text{J} \\approx ${round(Q / 1000)}\\ \\text{kJ}$.`,
      };
    },
  },
  {
    id: "l12-s-dl1", subject: S, grade: G, chapter: CH1, topic: "Định luật I nhiệt động lực học – tính $\\Delta U$, $A$, $Q$", half: 1, level: 2, kind: "short",
    make: (r) => {
      if (r.chance(0.4)) {
        const Qv = r.int(5, 40) * 50, p = r.int(1, 5), V1 = r.int(1, 10), dV = r.int(1, 5);
        const A = p * 1e5 * dV * 1e-3, dU = Qv - A;
        need(dU !== 0 && Math.abs(dU) < 10000);
        return {
          stem: `Một lượng khí trong xilanh được truyền nhiệt lượng ${q(Qv, "J")} và giãn nở đẳng áp ở áp suất $${p}\\cdot 10^5\\ \\text{Pa}$, thể tích tăng từ ${q(V1, "lít")} lên ${q(V1 + dV, "lít")}. Độ biến thiên nội năng $\\Delta U$ của khí là bao nhiêu jun?`,
          ...short(dU, 1),
          explanation: `Khí sinh công $|A| = p\\Delta V = ${p}\\cdot 10^5\\cdot ${dV}\\cdot 10^{-3} = ${A}\\ \\text{J}$, nên $A = -${A}\\ \\text{J}$. $\\Delta U = Q + A = ${Qv} - ${A} = ${dU}\\ \\text{J}$.`,
        };
      }
      const Qv = r.int(5, 80) * 10 * r.pick([1, -1]), Av = r.int(2, 60) * 10 * r.pick([1, -1]), dU = Qv + Av;
      need(dU !== 0);
      const tQ = Qv > 0 ? `nhận nhiệt lượng ${q(Qv, "J")}` : `tỏa ra nhiệt lượng ${q(-Qv, "J")}`;
      const tA = Av > 0 ? `nhận công ${q(Av, "J")} (bị nén)` : `thực hiện công ${q(-Av, "J")} (giãn nở)`;
      if (r.chance(0.5)) {
        return {
          stem: `Một khối khí ${tQ}, đồng thời ${tA}. Độ biến thiên nội năng $\\Delta U$ của khối khí là bao nhiêu jun?`,
          ...short(dU, 1),
          explanation: `$\\Delta U = Q + A = (${Qv}) + (${Av}) = ${dU}\\ \\text{J}$.`,
        };
      }
      return {
        stem: `Một khối khí ${tQ} thì nội năng của nó ${dU > 0 ? "tăng" : "giảm"} ${q(Math.abs(dU), "J")}. Theo quy ước dấu của định luật I nhiệt động lực học $\\Delta U = Q + A$, công $A$ mà khối khí nhận được là bao nhiêu jun?`,
        ...short(Av, 1),
        explanation: `$A = \\Delta U - Q = (${dU}) - (${Qv}) = ${Av}\\ \\text{J}$${Av < 0 ? " (khí thực hiện công)" : " (khí nhận công)"}.`,
      };
    },
  },
  {
    id: "l12-s-can-bang-nhiet", subject: S, grade: G, chapter: CH1, topic: "Cân bằng nhiệt – tính nhiệt độ cân bằng", half: 1, level: 3, kind: "short",
    make: (r) => {
      const cw = 4200, M = r.pick(METALS);
      const vessel = r.chance(0.5);
      const m1 = r.int(2, 12) * 50, m2 = r.int(2, 10) * 50, t1 = r.int(8, 20) * 10, t2 = r.int(15, 30);
      const mv = vessel ? r.int(1, 6) * 50 : 0, cv = 880;
      const a = m1 * M.c, b = m2 * cw + mv * cv, t = (a * t1 + b * t2) / (a + b);
      return {
        stem: `Thả một quả cầu ${M.n} khối lượng ${q(m1, "g")} ở ${dC(t1, 1)} vào ${vessel ? `một cốc nhôm khối lượng ${q(mv, "g")} chứa ` : ""}${q(m2, "g")} nước ở ${dC(t2, 1)}. Biết nhiệt dung riêng của ${M.n} là ${cTxt(M.c)}, của nước là ${cTxt(cw)}${vessel ? `, của nhôm là ${cTxt(cv)}` : ""}; bỏ qua trao đổi nhiệt với môi trường${vessel ? "" : " và bình"}. Nhiệt độ khi cân bằng nhiệt là bao nhiêu $^\\circ\\text{C}$? (Làm tròn đến hàng phần mười.)`,
        ...short(t, 1),
        explanation: `$m_1c_1(t_1 - t) = ${vessel ? "(m_2c_2 + m_3c_3)" : "m_2c_2"}(t - t_2)$ $\\Rightarrow t = \\dfrac{${tex(a / 1000, 3)}\\cdot ${t1} + ${tex(b / 1000, 3)}\\cdot ${t2}}{${tex(a / 1000, 3)} + ${tex(b / 1000, 3)}} \\approx ${tex(t, 1)}\\ ^\\circ\\text{C}$ (các tích $mc$ tính với $m$ theo kg).`,
      };
    },
  },
  {
    id: "l12-s-thoi-gian-dun", subject: S, grade: G, chapter: CH1, topic: "Ấm điện – thời gian đun, hiệu suất", half: 1, level: 3, kind: "short",
    make: (r) => {
      const cw = 4200, L = 2.3e6, P = r.pick([800, 1000, 1200, 1500, 1800, 2000]), H = r.pick([70, 75, 80, 84, 90, 100]);
      const m = r.pick([0.5, 1, 1.2, 1.5, 2]), t1 = r.int(15, 30), evap = r.chance(0.3), k = evap ? r.pick([10, 20, 25]) : 0;
      const kettle = r.chance(0.4), mk = kettle ? r.pick([0.3, 0.4, 0.5]) : 0, ck = 880;
      const Q = (m * cw + mk * ck) * (100 - t1) + (k / 100) * m * L, tau = Q / (P * H / 100) / 60;
      return {
        stem: `Một ấm điện có công suất ${q(P, "W")}${H < 100 ? `, hiệu suất $${H}\\%$` : " (bỏ qua hao phí)"}, dùng để đun ${q(m, "kg")} nước ${kettle ? `đựng trong ấm nhôm khối lượng ${q(mk, "kg")} ` : ""}từ ${dC(t1, 1)} đến khi sôi ở ${dC(100, 1)}${evap ? ` rồi tiếp tục đun đến khi $${k}\\%$ lượng nước đó hóa hơi` : ""}. Biết nhiệt dung riêng của nước là ${cTxt(cw)}${kettle ? `, của nhôm là ${cTxt(ck)}` : ""}${evap ? `, nhiệt hóa hơi riêng của nước là $${sci(L)}\\ \\text{J/kg}$` : ""}. Thời gian đun là bao nhiêu phút? (Làm tròn đến hàng phần mười.)`,
        ...short(tau, 1),
        explanation: `Nhiệt lượng có ích $Q = ${kettle ? "(m_nc_n + m_ac_a)" : "mc"}\\Delta t${evap ? " + 0{,}01k\\,mL" : ""} = ${ts(Q, 4)}\\ \\text{J}$. Thời gian $\\tau = \\dfrac{Q}{HP} = \\dfrac{${ts(Q, 4)}}{${tex(H / 100, 2)}\\cdot ${P}} \\approx ${ts(tau * 60, 4)}\\ \\text{s} \\approx ${tex(tau, 1)}$ phút.`,
      };
    },
  },
  {
    id: "l12-s-nuoc-da-tan", subject: S, grade: G, chapter: CH1, topic: "Nhiệt nóng chảy riêng – lượng nước đá tan", half: 1, level: 3, kind: "short",
    make: (r) => {
      const lam = 3.34e5, cw = 4200;
      if (r.chance(0.5)) {
        const M = r.pick(METALS), m1 = r.pick([0.2, 0.3, 0.5, 0.8, 1, 1.2, 1.5, 2]), t1 = r.int(5, 20) * 10;
        const mice = (m1 * M.c * t1) / lam * 1000;
        return {
          stem: `Đặt một khối ${M.n} khối lượng ${q(m1, "kg")} đã nung nóng tới ${dC(t1, 1)} lên một tảng nước đá rất lớn ở ${dC(0, 1)}. Biết nhiệt dung riêng của ${M.n} là ${cTxt(M.c)}, nhiệt nóng chảy riêng của nước đá là $${sci(lam)}\\ \\text{J/kg}$; bỏ qua trao đổi nhiệt với môi trường. Khi cân bằng nhiệt, khối lượng nước đá đã tan là bao nhiêu gam? (Làm tròn đến hàng đơn vị.)`,
          ...short(round(mice), 1),
          explanation: `Khối ${M.n} nguội về $0\\ ^\\circ\\text{C}$: $Q = m_1c_1t_1 = ${tex(m1, 2)}\\cdot ${M.c}\\cdot ${t1} = ${ts(m1 * M.c * t1, 4)}\\ \\text{J} = \\lambda m$ $\\Rightarrow m = \\dfrac{Q}{\\lambda} \\approx ${round(mice)}\\ \\text{g}$.`,
        };
      }
      const mw = r.pick([0.3, 0.4, 0.5, 0.6, 0.8, 1]), tw = r.int(3, 8) * 5, tf = r.int(1, 4) * 2;
      need(tf < tw);
      const mice = (mw * cw * (tw - tf)) / (lam + cw * tf) * 1000;
      return {
        stem: `Thả một cục nước đá ở ${dC(0, 1)} vào cốc chứa ${q(mw, "kg")} nước ở ${dC(tw, 1)}. Nước đá tan hết và nhiệt độ cuối cùng của nước là ${dC(tf, 1)}. Biết nhiệt dung riêng của nước là ${cTxt(cw)}, nhiệt nóng chảy riêng của nước đá là $${sci(lam)}\\ \\text{J/kg}$; bỏ qua trao đổi nhiệt với cốc và môi trường. Khối lượng cục nước đá là bao nhiêu gam? (Làm tròn đến hàng đơn vị.)`,
        ...short(round(mice), 1),
        explanation: `$m_nc(t_n - t) = \\lambda m + mct$ $\\Rightarrow m = \\dfrac{${tex(mw, 2)}\\cdot ${cw}\\cdot ${tw - tf}}{${sci(lam)} + ${cw}\\cdot ${tf}} \\approx ${tex(mice / 1000, 4)}\\ \\text{kg} \\approx ${round(mice)}\\ \\text{g}$.`,
      };
    },
  },
  {
    id: "l12-s-dong-nang-thanh-noi-nang", subject: S, grade: G, chapter: CH1, topic: "Chuyển hóa cơ năng thành nội năng", half: 1, level: 3, kind: "short",
    make: (r) => {
      if (r.chance(0.5)) {
        const v = r.int(10, 40) * 10, k = r.pick([40, 50, 60, 80, 100]), c = 130;
        const dt = (k / 100) * v * v / 2 / c;
        return {
          stem: `Một viên đạn bằng chì bay với tốc độ ${q(v, "m/s")} thì cắm vào một bức tường gỗ và dừng lại. Coi $${k}\\%$ động năng của viên đạn chuyển thành nội năng làm viên đạn nóng lên. Biết nhiệt dung riêng của chì là ${cTxt(c)}. Nhiệt độ của viên đạn tăng thêm bao nhiêu $^\\circ\\text{C}$? (Làm tròn đến hàng đơn vị.)`,
          ...short(round(dt), 1),
          explanation: `$${k === 100 ? "" : tex(k / 100, 2) + "\\cdot"}\\dfrac{1}{2}mv^2 = mc\\Delta t \\Rightarrow \\Delta t = \\dfrac{${tex(k / 100, 2)}\\,v^2}{2c} = \\dfrac{${tex(k / 100, 2)}\\cdot ${v}^2}{2\\cdot ${c}} \\approx ${round(dt)}\\ ^\\circ\\text{C}$ (không phụ thuộc khối lượng).`,
        };
      }
      const h = r.int(5, 30) * 10, k = r.pick([50, 60, 80, 100]), g = r.pick([9.8, 10]), c = 4200;
      const dt = (k / 100) * g * h / c;
      return {
        stem: `Nước ở đỉnh một thác cao ${q(h, "m")} đổ xuống chân thác. Coi $${k}\\%$ thế năng của nước chuyển thành nội năng của chính nó. Lấy $g = ${tex(g, 1)}\\ \\text{m/s}^2$, nhiệt dung riêng của nước ${cTxt(c)}. Nhiệt độ của nước ở chân thác tăng thêm bao nhiêu $^\\circ\\text{C}$? (Làm tròn đến hàng phần trăm.)`,
        ...short(dt, 2),
        explanation: `$${k === 100 ? "" : tex(k / 100, 2) + "\\,"}mgh = mc\\Delta t \\Rightarrow \\Delta t = \\dfrac{${k === 100 ? "" : tex(k / 100, 2) + "\\cdot "}${tex(g, 1)}\\cdot ${h}}{${c}} \\approx ${tex(dt, 2)}\\ ^\\circ\\text{C}$.`,
      };
    },
  },
];

/* ================================================================
   HALF 2 – KHÍ LÍ TƯỞNG
   ================================================================ */
const PROC_GAS = [
  { n: "đẳng nhiệt", law: "định luật Boyle", c: "nhiệt độ", rel: "$pV = \\text{hằng số}$", two: "$p_1V_1 = p_2V_2$" },
  { n: "đẳng áp", law: "định luật Charles", c: "áp suất", rel: "$\\dfrac{V}{T} = \\text{hằng số}$", two: "$\\dfrac{V_1}{T_1} = \\dfrac{V_2}{T_2}$" },
  { n: "đẳng tích", law: "định luật Gay-Lussac", c: "thể tích", rel: "$\\dfrac{p}{T} = \\text{hằng số}$", two: "$\\dfrac{p_1}{T_1} = \\dfrac{p_2}{T_2}$" },
];
const REL_WRONG = ["$\\dfrac{p}{V} = \\text{hằng số}$", "$VT = \\text{hằng số}$", "$pT = \\text{hằng số}$"];
const TWO_WRONG = ["$p_1V_2 = p_2V_1$", "$\\dfrac{V_1}{T_2} = \\dfrac{V_2}{T_1}$", "$\\dfrac{p_1}{T_2} = \\dfrac{p_2}{T_1}$", "$p_1T_1 = p_2T_2$"];
const SHAPES = ["đường hypebol", "đường thẳng kéo dài đi qua gốc tọa độ", "đường thẳng vuông góc với trục hoành", "đường thẳng song song với trục hoành"];
/* [quá trình, hệ trục (tung, hoành), chỉ số hình dạng] */
const GRAPH: [string, string, string, number][] = [
  ["đẳng nhiệt", "p", "V", 0], ["đẳng nhiệt", "p", "T", 2], ["đẳng nhiệt", "V", "T", 2],
  ["đẳng áp", "p", "V", 3], ["đẳng áp", "V", "T", 1], ["đẳng áp", "p", "T", 3],
  ["đẳng tích", "p", "T", 1], ["đẳng tích", "p", "V", 2], ["đẳng tích", "V", "T", 3],
];
const GAS_EX: [string, number][] = [
  ["đun nóng khí trong một bình kín bằng thép có thể tích không đổi", 2],
  ["lốp xe đạp đã bơm căng để ngoài trời nắng (coi thể tích lốp không đổi)", 2],
  ["nồi áp suất đậy kín được đun nóng khi van an toàn chưa mở", 2],
  ["nén thật chậm khí trong một bơm tiêm bịt kín đầu, nhiệt độ khí không đổi", 0],
  ["một bọt khí nổi chậm từ đáy hồ lên mặt nước, nhiệt độ nước như nhau ở mọi độ sâu", 0],
  ["kéo từ từ pít-tông của xilanh kín ra, nhiệt độ khí được giữ không đổi", 0],
  ["đun nóng khí trong xilanh có pít-tông nhẹ chuyển động tự do không ma sát, bên ngoài là khí quyển", 1],
  ["làm lạnh khí trong xilanh có pít-tông chuyển động tự do, áp suất khí luôn bằng áp suất khí quyển", 1],
  ["phơi nắng một quả bóng thám không mỏng, lớp vỏ co giãn tự do và áp suất bên trong không đổi", 1],
];

const H2: Template[] = [
  /* ---------- MCQ ---------- */
  {
    id: "l12-mo-hinh-dong-hoc", subject: S, grade: G, chapter: CH2, topic: "Mô hình động học phân tử chất khí", half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const askTrue = r.chance(0.5);
      const right = r.pick(askTrue ? TRUE_KHI : FALSE_KHI), wrong = pickN(r, askTrue ? FALSE_KHI : TRUE_KHI, 3);
      return {
        stem: `${r.pick(["Phát biểu nào sau đây về chất khí theo mô hình động học phân tử", "Theo mô hình động học phân tử chất khí, phát biểu nào sau đây", `Bạn ${r.pick(NAMES)} nêu một số nhận xét về chất khí. Nhận xét nào sau đây`, "Khi nói về cấu tạo chất khí và chuyển động của phân tử khí, phát biểu nào sau đây"])} là ${askTrue ? "đúng" : "sai"}?`,
        ...mcq(r, right, wrong),
        explanation: askTrue ? `Phát biểu đúng: ${right}` : `Phát biểu sai: ${right} (các phát biểu còn lại đúng).`,
      };
    },
  },
  {
    id: "l12-he-thuc-dang-qua-trinh", subject: S, grade: G, chapter: CH2, topic: "Các định luật Boyle, Charles – hệ thức", half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const i = r.int(0, 2), P = PROC_GAS[i], others = PROC_GAS.filter((_, k) => k !== i);
      const form = r.pick(["rel", "two", "name", "law"]);
      const who = r.pick(["một lượng khí xác định", "một khối khí lí tưởng có khối lượng không đổi"]);
      if (form === "rel") return {
        stem: `Đối với ${who}, khi ${P.c} được giữ không đổi thì hệ thức nào sau đây đúng?`,
        ...mcq(r, P.rel, [...others.map((o) => o.rel), ...REL_WRONG]),
        explanation: `Quá trình ${P.n} (${P.law}): ${P.rel}.`,
      };
      if (form === "two") return {
        stem: `Một lượng khí xác định chuyển từ trạng thái 1 sang trạng thái 2 theo quá trình ${P.n}. Hệ thức đúng là`,
        ...mcq(r, P.two, [...pickN(r, TWO_WRONG, 2), ...others.map((o) => o.two)]),
        explanation: `Quá trình ${P.n}: ${P.rel}, nên ${P.two}.`,
      };
      if (form === "name") return {
        stem: `Hệ thức ${r.chance(0.5) ? P.rel : P.two} áp dụng cho ${who} trong quá trình`,
        ...mcq(r, P.n, [...others.map((o) => o.n), "đoạn nhiệt (không trao đổi nhiệt)"]),
        explanation: `${P.rel} khi ${P.c} không đổi: quá trình ${P.n}.`,
      };
      const st = [
        { s: "áp suất tỉ lệ nghịch với thể tích", k: 0 }, { s: "thể tích tỉ lệ thuận với nhiệt độ tuyệt đối", k: 1 }, { s: "áp suất tỉ lệ thuận với nhiệt độ tuyệt đối", k: 2 },
      ];
      const wrongS = ["áp suất tỉ lệ thuận với thể tích", "thể tích tỉ lệ thuận với nhiệt độ Celsius", "áp suất tỉ lệ nghịch với nhiệt độ tuyệt đối", "thể tích tỉ lệ nghịch với nhiệt độ tuyệt đối"];
      return {
        stem: `Theo ${P.law}, đối với ${who} ở ${P.c} không đổi thì`,
        ...mcq(r, st[i].s, [...pickN(r, wrongS, 2), ...st.filter((x) => x.k !== i).map((x) => x.s)]),
        explanation: `Quá trình ${P.n}: ${P.rel}, tức là ${st[i].s}.`,
      };
    },
  },
  {
    id: "l12-do-thi-dang-qua-trinh", subject: S, grade: G, chapter: CH2, topic: "Đồ thị các đẳng quá trình", half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const [p, y, x, k] = r.pick(GRAPH);
      const pre = r.pick(["Trong hệ tọa độ", "Biểu diễn trên hệ tọa độ"]);
      return {
        stem: `${pre} $(${y}, ${x})$ với trục tung $O${y}$ và trục hoành $O${x}$, đường biểu diễn quá trình ${p} của một lượng khí xác định là`,
        ...mcq(r, SHAPES[k], SHAPES.filter((_, j) => j !== k)),
        explanation: k === 0 ? `Đẳng nhiệt: $pV = \\text{hằng số}$ nên đồ thị $(p, V)$ là đường hypebol.`
          : k === 1 ? `Quá trình ${p}: $${y}$ tỉ lệ thuận với $T$ nên đồ thị là đường thẳng kéo dài đi qua gốc tọa độ.`
          : k === 2 ? `Quá trình ${p}: đại lượng trên trục hoành ($${x}$) không đổi nên đồ thị là đường thẳng vuông góc với trục hoành.`
          : `Quá trình ${p}: đại lượng trên trục tung ($${y}$) không đổi nên đồ thị là đường thẳng song song với trục hoành.`,
      };
    },
  },
  {
    id: "l12-nhan-biet-dang-qua-trinh", subject: S, grade: G, chapter: CH2, topic: "Nhận biết quá trình đẳng nhiệt, đẳng áp, đẳng tích", half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const [ex, k] = r.pick(GAS_EX), names = ["đẳng nhiệt", "đẳng áp", "đẳng tích"], cs = ["nhiệt độ", "áp suất", "thể tích"];
      if (r.chance(0.5)) return {
        stem: `Quá trình biến đổi trạng thái của lượng khí trong trường hợp: "${ex}" gần đúng là quá trình`,
        ...mcq(r, names[k], [...names.filter((_, j) => j !== k), "mà cả ba thông số trạng thái đều thay đổi"]),
        explanation: `Trong trường hợp này ${cs[k]} của khí không đổi nên đó là quá trình ${names[k]}.`,
      };
      return {
        stem: `Trong trường hợp: "${ex}", thông số trạng thái nào của lượng khí được coi là không đổi?`,
        ...mcq(r, cap(cs[k]), [...cs.filter((_, j) => j !== k).map(cap), "Không có thông số nào"]),
        explanation: `Đây là quá trình ${names[k]}: ${cs[k]} không đổi.`,
      };
    },
  },
  {
    id: "l12-boyle", subject: S, grade: G, chapter: CH2, topic: "Định luật Boyle – tính áp suất, thể tích", half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const unitP = r.pick(["atm", "kPa", "Pa"]), unitV = r.pick(["lít", "cm³"]);
      const V1 = unitV === "lít" ? r.int(2, 20) : r.int(4, 40) * 10, k = r.pick([[1, 2], [1, 3], [2, 3], [3, 4], [4, 5], [3, 2], [2, 1], [5, 4], [4, 3], [5, 2]]);
      const V2 = (V1 * k[0]) / k[1];
      need(Number.isInteger(V2 * 10));
      const p1 = unitP === "atm" ? r.int(1, 8) : unitP === "kPa" ? r.int(5, 40) * 10 : r.int(1, 5);
      const p2 = (p1 * V1) / V2;
      const fp = (x: number) => (unitP === "Pa" ? `$${ts(x)}\\cdot 10^5\\ \\text{Pa}$` : qs(x, unitP));
      const fV = (x: number) => (unitV === "lít" ? qs(x, "lít") : `$${ts(x)}\\ \\text{cm}^3$`);
      const ctx = r.pick(["Một lượng khí trong xilanh", "Khí trong một bơm tiêm bịt kín đầu", "Một khối khí lí tưởng", "Không khí trong một quả bóng cao su"]);
      const verb = V2 < V1 ? "bị nén đẳng nhiệt" : "giãn nở đẳng nhiệt";
      if (r.chance(0.5)) return {
        stem: `${ctx} có thể tích ${fV(V1)} ở áp suất ${fp(p1)}, ${verb} đến thể tích ${fV(V2)}. Áp suất của khí khi đó là`,
        ...nopt(r, p2, [(p1 * V2) / V1, Math.abs(p2 - p1), (p1 * Math.abs(V1 - V2)) / V1, (p1 * V1) / Math.abs(V1 - V2)], fp),
        explanation: `$p_1V_1 = p_2V_2 \\Rightarrow p_2 = \\dfrac{p_1V_1}{V_2} = \\dfrac{${tex(p1)}\\cdot ${tex(V1)}}{${tex(V2)}} = ${ts(p2)}$ (cùng đơn vị với $p_1$).`,
      };
      return {
        stem: `${ctx} có thể tích ${fV(V1)} ở áp suất ${fp(p1)}. Nén hoặc giãn đẳng nhiệt lượng khí này đến khi áp suất là ${fp(p2)} thì thể tích của khí là`,
        ...nopt(r, V2, [(V1 * p2) / p1, Math.abs(V1 - V2), (V1 * Math.abs(p2 - p1)) / p2, (V1 * p1) / Math.abs(p2 - p1)], fV),
        explanation: `$p_1V_1 = p_2V_2 \\Rightarrow V_2 = \\dfrac{p_1V_1}{p_2} = \\dfrac{${tex(p1)}\\cdot ${tex(V1)}}{${ts(p2)}} = ${ts(V2)}$ (cùng đơn vị với $V_1$).`,
      };
    },
  },
  {
    id: "l12-charles", subject: S, grade: G, chapter: CH2, topic: "Định luật Charles – quá trình đẳng áp", half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const T1 = r.pick([280, 290, 300, 310, 320, 350, 360, 400]), T2 = r.pick([300, 320, 330, 350, 360, 400, 420, 450, 500, 540, 600]);
      need(T1 !== T2);
      const t1 = T1 - 273, t2 = T2 - 273, V1 = r.int(2, 30) / (r.chance(0.5) ? 1 : 2), V2 = (V1 * T2) / T1;
      const ctx = r.pick(["Một lượng khí trong xilanh có pít-tông chuyển động tự do", "Một khối khí lí tưởng", "Không khí trong một bình có nắp di động nhẹ"]);
      const KT = "Lấy $T = t + 273$.";
      if (r.chance(0.55)) return {
        stem: `${ctx} có thể tích ${q(V1, "lít")} ở ${dC(t1, 1)}. ${T2 > T1 ? "Nung nóng" : "Làm lạnh"} đẳng áp lượng khí đến ${dC(t2, 1)}. ${KT} Thể tích của khí khi đó là`,
        ...nopt(r, V2, [(V1 * t2) / t1, (V1 * T1) / T2, (V1 * t1) / t2, V1 + (t2 - t1) / 100], (x) => qs(x, "lít")),
        explanation: `$\\dfrac{V_1}{T_1} = \\dfrac{V_2}{T_2} \\Rightarrow V_2 = V_1\\dfrac{T_2}{T_1} = ${tex(V1)}\\cdot\\dfrac{${T2}}{${T1}} \\approx ${ts(V2)}\\ \\text{lít}$.`,
      };
      const t2w = (t1 * V2) / V1;
      return {
        stem: `${ctx} có thể tích ${q(V1, "lít")} ở ${dC(t1, 1)}. ${KT} Để thể tích của khí là ${qs(V2, "lít")} khi áp suất không đổi thì phải đưa nhiệt độ khí đến`,
        ...mcq(r, dC(t2, 1), [dC(T2, 1), dC(round(t2w, 1)), dC(round((T1 * V1) / V2 - 273, 1)), dC(-t2, 1)]),
        explanation: `$T_2 = T_1\\dfrac{V_2}{V_1} = ${T1}\\cdot\\dfrac{${ts(V2)}}{${tex(V1)}} = ${T2}\\ \\text{K}$ $\\Rightarrow t_2 = ${T2} - 273 = ${t2}\\ ^\\circ\\text{C}$.`,
      };
    },
  },
  {
    id: "l12-dang-tich", subject: S, grade: G, chapter: CH2, topic: "Quá trình đẳng tích – áp suất theo nhiệt độ", half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const T1 = r.pick([280, 290, 300, 310, 320]), T2 = r.pick([300, 320, 330, 350, 360, 400, 420, 450, 600]);
      need(T2 > T1);
      const t1 = T1 - 273, t2 = T2 - 273, p1 = r.pick([1, 1.5, 2, 2.4, 2.5, 3, 4, 5]), p2 = (p1 * T2) / T1;
      const ctx = r.pick([
        ["Khí trong lốp xe ô tô", "Sau khi xe chạy đường dài, nhiệt độ khí trong lốp tăng"],
        ["Khí trong một bình thép kín", "Bình bị phơi nắng, nhiệt độ khí trong bình tăng"],
        ["Khí trơ trong một bóng đèn sợi đốt", "Khi đèn sáng, nhiệt độ khí trong bóng tăng"],
        ["Khí trong một nồi áp suất đậy kín", "Đun nóng nồi khi van chưa mở, nhiệt độ khí tăng"],
        ["Khí trong một bình xịt kín", "Bình bị để gần bếp, nhiệt độ khí trong bình tăng"],
      ]);
      const fp = (x: number) => `$${ts(x)}\\cdot 10^5\\ \\text{Pa}$`;
      return {
        stem: `${ctx[0]} có áp suất ${fp(p1)} ở ${dC(t1, 1)}. ${ctx[1]} đến ${dC(t2, 1)} (coi thể tích không đổi). Lấy $T = t + 273$. Áp suất khí khi đó là`,
        ...nopt(r, p2, [(p1 * t2) / t1, (p1 * T1) / T2, p1 + (t2 - t1) / 100, (p1 * t1) / t2], fp),
        explanation: `$\\dfrac{p_1}{T_1} = \\dfrac{p_2}{T_2} \\Rightarrow p_2 = p_1\\dfrac{T_2}{T_1} = ${tex(p1)}\\cdot\\dfrac{${T2}}{${T1}}\\cdot 10^5 \\approx ${ts(p2)}\\cdot 10^5\\ \\text{Pa}$.`,
      };
    },
  },
  {
    id: "l12-pt-trang-thai", subject: S, grade: G, chapter: CH2, topic: "Phương trình trạng thái khí lí tưởng", half: 2, level: 3, kind: "mcq",
    make: (r) => {
      const T1 = r.pick([280, 290, 300, 310, 320, 350]), T2 = r.pick([273, 300, 320, 330, 350, 360, 400, 420, 450]);
      need(T1 !== T2);
      const t1 = T1 - 273, t2 = T2 - 273;
      const p1 = r.pick([1, 1.5, 2, 2.5, 3, 4]), p2 = r.pick([1, 1.5, 2, 3, 4, 5, 6]), V1 = r.int(2, 30);
      need(p1 !== p2);
      const V2 = (p1 * V1 * T2) / (p2 * T1);
      const ask = r.pick(["V", "V", "p", "t"]);
      const st1 = `Một lượng khí lí tưởng ở trạng thái đầu có áp suất ${q(p1, "atm")}, thể tích ${q(V1, "lít")}, nhiệt độ ${dC(t1, 1)}.`;
      if (ask === "V") return {
        stem: `${st1} Khi chuyển sang trạng thái có áp suất ${q(p2, "atm")} và nhiệt độ ${dC(t2, 1)} thì thể tích của khí là (lấy $T = t + 273$)`,
        ...nopt(r, V2, [t1 !== 0 && t2 !== 0 ? (p1 * V1 * t2) / (p2 * t1) : NaN, (p1 * V1) / p2, (p2 * V1 * T2) / (p1 * T1), (p1 * V1 * T1) / (p2 * T2)], (x) => qs(x, "lít")),
        explanation: `$\\dfrac{p_1V_1}{T_1} = \\dfrac{p_2V_2}{T_2} \\Rightarrow V_2 = \\dfrac{p_1V_1T_2}{p_2T_1} = \\dfrac{${tex(p1)}\\cdot ${V1}\\cdot ${T2}}{${tex(p2)}\\cdot ${T1}} \\approx ${ts(V2)}\\ \\text{lít}$.`,
      };
      if (ask === "p") return {
        stem: `${st1} Khi chuyển sang trạng thái có thể tích ${qs(V2, "lít")} và nhiệt độ ${dC(t2, 1)} thì áp suất của khí là (lấy $T = t + 273$)`,
        ...nopt(r, p2, [(p1 * V1) / V2, (p1 * V1 * T1) / (V2 * T2), (p1 * V2 * T2) / (V1 * T1), t1 !== 0 && t2 !== 0 ? (p1 * V1 * t2) / (V2 * t1) : NaN], (x) => qs(x, "atm")),
        explanation: `$p_2 = \\dfrac{p_1V_1T_2}{V_2T_1} = \\dfrac{${tex(p1)}\\cdot ${V1}\\cdot ${T2}}{${ts(V2)}\\cdot ${T1}} \\approx ${ts(p2)}\\ \\text{atm}$.`,
      };
      return {
        stem: `${st1} Khi chuyển sang trạng thái có áp suất ${q(p2, "atm")} và thể tích ${qs(V2, "lít")} thì nhiệt độ của khí là (lấy $T = t + 273$)`,
        ...mcq(r, dC(t2, 1), [dC(T2, 1), dC(round((p1 * V1 * T1) / (p2 * V2) - 273, 1)), dC(round((t1 * p2 * V2) / (p1 * V1), 1)), dC(-t2, 1)]),
        explanation: `$T_2 = T_1\\dfrac{p_2V_2}{p_1V_1} = ${T1}\\cdot\\dfrac{${tex(p2)}\\cdot ${ts(V2)}}{${tex(p1)}\\cdot ${V1}} \\approx ${T2}\\ \\text{K}$ $\\Rightarrow t_2 = ${t2}\\ ^\\circ\\text{C}$.`,
      };
    },
  },
  {
    id: "l12-pv-nrt", subject: S, grade: G, chapter: CH2, topic: "Phương trình Clapeyron $pV = nRT$", half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const g = r.pick(GASES), V = r.pick([2, 4, 5, 8, 8.31, 10, 12, 16.62, 20, 25]), p = r.pick([1, 1.2, 1.5, 2, 2.5, 3, 4, 5]), t = r.pick([0, 7, 17, 27, 37, 47, 57, 77, 127]);
      const T = t + 273, n = (p * 1e5 * V * 1e-3) / (R * T), m = n * g.M;
      const head = `Một bình kín dung tích ${q(V, "lít")} chứa ${gasTxt(g)} ở nhiệt độ ${dC(t, 1)} và áp suất $${tex(p)}\\cdot 10^5\\ \\text{Pa}$. Lấy ${RTXT}, $T = t + 273$.`;
      const nC = t !== 0 ? (p * 1e5 * V * 1e-3) / (R * t) : NaN;
      const ask = r.pick(["n", "m", "p"]);
      if (ask === "n") return {
        stem: `${head} Số mol khí trong bình là`,
        ...nopt(r, n, [n * 1000, nC, n * R, m], (x) => qs(x, "mol")),
        explanation: `$n = \\dfrac{pV}{RT} = \\dfrac{${tex(p)}\\cdot 10^5\\cdot ${tex(V)}\\cdot 10^{-3}}{8{,}31\\cdot ${T}} \\approx ${ts(n)}\\ \\text{mol}$ (đổi lít ra $\\text{m}^3$).`,
      };
      if (ask === "m") return {
        stem: `${head} Khối lượng khí trong bình là`,
        ...nopt(r, m, [n, m * 1000, nC * g.M, m / 1000], (x) => qs(x, "g")),
        explanation: `$n = \\dfrac{pV}{RT} \\approx ${ts(n)}\\ \\text{mol}$; $m = nM = ${ts(n)}\\cdot ${g.M} \\approx ${ts(m)}\\ \\text{g}$.`,
      };
      const mm = sig(m, 2);
      need(mm > 0);
      const pp = (mm / g.M) * R * T / (V * 1e-3);
      const fp = (x: number) => `$${ts(x / 1e5)}\\cdot 10^5\\ \\text{Pa}$`;
      return {
        stem: `Một bình kín dung tích ${q(V, "lít")} chứa $${tex(mm, 3)}\\ \\text{g}$ ${gasTxt(g)} ở nhiệt độ ${dC(t, 1)}. Lấy ${RTXT}, $T = t + 273$. Áp suất khí trong bình là`,
        ...nopt(r, pp, [pp / 1000, t !== 0 ? pp * t / T : NaN, pp * g.M, pp / g.M * 1000], fp),
        explanation: `$p = \\dfrac{mRT}{MV} = \\dfrac{${tex(mm, 3)}}{${g.M}}\\cdot\\dfrac{8{,}31\\cdot ${T}}{${tex(V)}\\cdot 10^{-3}} \\approx ${ts(pp / 1e5)}\\cdot 10^5\\ \\text{Pa}$.`,
      };
    },
  },
  {
    id: "l12-dong-nang-trung-binh", subject: S, grade: G, chapter: CH2, topic: "Động năng tịnh tiến trung bình của phân tử", half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const form = r.pick(["W", "W", "T", "ratio"]);
      const fW = (x: number) => `$${sci(x)}\\ \\text{J}$`;
      if (form === "W") {
        const t = r.int(-5, 40) * 5, T = t + 273, W = 1.5 * KB * T;
        need(t !== 0);
        return {
          stem: `Lấy ${KTXT} và $T = t + 273$. Động năng tịnh tiến trung bình của một phân tử khí lí tưởng ở ${dC(t, 1)} là`,
          ...nopt(r, W, [KB * T, 0.5 * KB * T, 1.5 * KB * Math.abs(t), 3 * KB * T], fW),
          explanation: `$W_đ = \\dfrac{3}{2}kT = \\dfrac{3}{2}\\cdot 1{,}38\\cdot 10^{-23}\\cdot ${T} \\approx ${sci(W)}\\ \\text{J}$.`,
        };
      }
      if (form === "T") {
        const T = r.int(10, 160) * 5, W = 1.5 * KB * T, Wr = sig(W, 3), Tt = Wr / (1.5 * KB);
        return {
          stem: `Lấy ${KTXT}. Động năng tịnh tiến trung bình của phân tử một khí lí tưởng là $${sci(Wr)}\\ \\text{J}$. Nhiệt độ tuyệt đối của khí xấp xỉ là`,
          ...nopt(r, Tt, [Wr / KB, (2 * Wr) / KB, Tt - 273, Tt + 273], (x) => qs(x, "K")),
          explanation: `$T = \\dfrac{2W_đ}{3k} = \\dfrac{2\\cdot ${sci(Wr)}}{3\\cdot 1{,}38\\cdot 10^{-23}} \\approx ${ts(Tt)}\\ \\text{K}$.`,
        };
      }
      const t1 = r.pick([-73, 0, 27, 77, 127, 227]), t2 = r.pick([27, 127, 227, 327, 527, 627, 873]);
      need(t2 > t1);
      const T1 = t1 + 273, T2 = t2 + 273, k = T2 / T1;
      const fk = (x: number) => `$${ts(x)}$ lần`;
      return {
        stem: `Khi nhiệt độ của một khối khí lí tưởng tăng từ ${dC(t1, 1)} lên ${dC(t2, 1)} thì động năng tịnh tiến trung bình của phân tử khí tăng lên (lấy $T = t + 273$)`,
        ...nopt(r, k, [t1 !== 0 ? t2 / t1 : NaN, Math.sqrt(k), k * k, (k * 3) / 2], fk),
        explanation: `$W_đ = \\dfrac{3}{2}kT$ tỉ lệ với $T$: $\\dfrac{W_2}{W_1} = \\dfrac{T_2}{T_1} = \\dfrac{${T2}}{${T1}} \\approx ${ts(k)}$.`,
      };
    },
  },
  {
    id: "l12-ap-suat-dong-hoc", subject: S, grade: G, chapter: CH2, topic: "Áp suất khí theo mô hình động học phân tử", half: 2, level: 3, kind: "mcq",
    make: (r) => {
      const form = r.pick(["p", "v", "mu"]);
      if (form === "p") {
        const rho = r.int(1, 30) / 10, v = r.int(30, 190) * 10, p = (rho * v * v) / 3;
        return {
          stem: `Một chất khí có khối lượng riêng $${tex(rho, 1)}\\ \\text{kg/m}^3$, các phân tử khí có tốc độ căn quân phương $\\sqrt{\\overline{v^2}} = ${v}\\ \\text{m/s}$. Theo mô hình động học phân tử, áp suất của khí là`,
          ...nopt(r, p, [rho * v * v, (rho * v) / 3, (2 * rho * v * v) / 3, (rho * v * v) / 2], (x) => `$${sci(x)}\\ \\text{Pa}$`),
          explanation: `$p = \\dfrac{1}{3}\\rho\\overline{v^2} = \\dfrac{1}{3}\\cdot ${tex(rho, 1)}\\cdot ${v}^2 \\approx ${sci(p)}\\ \\text{Pa}$.`,
        };
      }
      if (form === "v") {
        const rho = r.pick([0.09, 0.18, 1.25, 1.29, 1.43, 1.98]), p = r.pick([1, 1.5, 2, 3, 4, 5]) * 1e5, v = Math.sqrt((3 * p) / rho);
        return {
          stem: `Một chất khí ở áp suất $${sci(p, 1)}\\ \\text{Pa}$ có khối lượng riêng $${tex(rho)}\\ \\text{kg/m}^3$. Theo mô hình động học phân tử, tốc độ căn quân phương $\\sqrt{\\overline{v^2}}$ của các phân tử khí là`,
          ...nopt(r, v, [Math.sqrt(p / rho), Math.sqrt(p / (3 * rho)), (3 * p) / rho, Math.sqrt((3 * p) / rho / 2)], (x) => qs(x, "m/s")),
          explanation: `$p = \\dfrac{1}{3}\\rho\\overline{v^2} \\Rightarrow \\sqrt{\\overline{v^2}} = \\sqrt{\\dfrac{3p}{\\rho}} = \\sqrt{\\dfrac{3\\cdot ${sci(p, 1)}}{${tex(rho)}}} \\approx ${ts(v)}\\ \\text{m/s}$.`,
        };
      }
      const mu = r.int(10, 90) / 10 * 1e25, W = r.int(40, 120) / 10 * 1e-21, p = (2 / 3) * mu * W;
      return {
        stem: `Một khối khí lí tưởng có mật độ phân tử $\\mu = ${sci(mu, 1)}\\ \\text{m}^{-3}$, động năng tịnh tiến trung bình của mỗi phân tử là $${sci(W, 1)}\\ \\text{J}$. Áp suất của khí là`,
        ...nopt(r, p, [mu * W, (mu * W) / 3, 1.5 * mu * W, (mu * W) / 2], (x) => `$${sci(x)}\\ \\text{Pa}$`),
        explanation: `$p = \\dfrac{2}{3}\\mu\\overline{W_đ} = \\dfrac{2}{3}\\cdot ${sci(mu, 1)}\\cdot ${sci(W, 1)} \\approx ${sci(p)}\\ \\text{Pa}$.`,
      };
    },
  },
  {
    id: "l12-toc-do-can-quan-phuong", subject: S, grade: G, chapter: CH2, topic: "Tốc độ căn quân phương của phân tử khí", half: 2, level: 3, kind: "mcq",
    make: (r) => {
      const form = r.pick(["v", "v", "ratioGas", "ratioT"]);
      if (form === "v") {
        const g = r.pick(GASES), t = r.pick([0, 17, 27, 37, 47, 77, 127, 227]), T = t + 273, v = Math.sqrt((3 * R * T) / (g.M / 1000));
        return {
          stem: `Coi ${gasTxt(g)} là khí lí tưởng ở nhiệt độ ${dC(t, 1)}. Lấy ${RTXT}, $T = t + 273$. Tốc độ căn quân phương của các phân tử khí là`,
          ...nopt(r, v, [Math.sqrt((3 * R * T) / g.M), Math.sqrt((R * T) / (g.M / 1000)), t > 0 ? Math.sqrt((3 * R * t) / (g.M / 1000)) : NaN, (3 * R * T) / (g.M / 1000) / 1000, Math.sqrt((2 * R * T) / (g.M / 1000))], (x) => qs(x, "m/s")),
          explanation: `$\\sqrt{\\overline{v^2}} = \\sqrt{\\dfrac{3RT}{M}} = \\sqrt{\\dfrac{3\\cdot 8{,}31\\cdot ${T}}{${tex(g.M / 1000, 3)}}} \\approx ${ts(v)}\\ \\text{m/s}$ ($M$ đổi ra $\\text{kg/mol}$).`,
        };
      }
      if (form === "ratioGas") {
        const [a, b] = pickN(r, GASES, 2), k = Math.sqrt(b.M / a.M);
        return {
          stem: `Ở cùng một nhiệt độ, tỉ số giữa tốc độ căn quân phương của phân tử ${gasTxt(a)} và của phân tử ${gasTxt(b)} là`,
          ...nopt(r, k, [b.M / a.M, a.M / b.M, Math.sqrt(a.M / b.M), 1], (x) => `$${ts(x)}$`),
          explanation: `$\\sqrt{\\overline{v^2}} = \\sqrt{\\dfrac{3RT}{M}}$ nên $\\dfrac{v_1}{v_2} = \\sqrt{\\dfrac{M_2}{M_1}} = \\sqrt{\\dfrac{${b.M}}{${a.M}}} \\approx ${ts(k)}$.`,
        };
      }
      const t1 = r.pick([-73, 0, 27, 127]), mult = r.pick([2, 3, 4]);
      const T1 = t1 + 273, T2 = T1 * mult * mult, t2 = T2 - 273;
      return {
        stem: `Một khối khí lí tưởng đang ở ${dC(t1, 1)}. Để tốc độ căn quân phương của các phân tử khí tăng gấp ${mult} lần thì phải đưa nhiệt độ của khí lên (lấy $T = t + 273$)`,
        ...mcq(r, dC(t2, 1), [dC(T1 * mult - 273, 1), dC(T2, 1), dC(t1 * mult * mult === 0 ? T1 * mult : t1 * mult * mult, 1), dC(T1 * mult, 1)]),
        explanation: `$v \\sim \\sqrt{T}$ nên $T_2 = ${mult}^2 T_1 = ${mult * mult}\\cdot ${T1} = ${T2}\\ \\text{K}$, tức $t_2 = ${t2}\\ ^\\circ\\text{C}$.`,
      };
    },
  },
  {
    id: "l12-bom-khi", subject: S, grade: G, chapter: CH2, topic: "Bơm khí – vận dụng định luật Boyle", half: 2, level: 3, kind: "mcq",
    make: (r) => {
      const V = r.pick([2, 2.5, 3, 4, 5]), V0 = r.pick([0.1, 0.125, 0.15, 0.2, 0.25]), pi = r.pick([1, 1, 1.2, 1.5]), N = r.int(8, 40);
      const p = pi + (N * 1 * V0) / V;
      const obj = r.pick(["Một quả bóng", "Một săm xe đạp", "Một lốp xe máy", "Một bình chứa"]);
      const fp = (x: number) => qs(x, "atm");
      const pre = `${obj} có dung tích ${q(V, "lít")} (coi không đổi), ban đầu chứa không khí ở áp suất ${q(pi, "atm")}. Mỗi lần bơm đưa được ${q(V0, "lít", 3)} không khí ở áp suất $1\\ \\text{atm}$ vào bên trong. Coi nhiệt độ không đổi.`;
      if (r.chance(0.5)) return {
        stem: `${pre} Sau ${N} lần bơm, áp suất không khí bên trong là`,
        ...nopt(r, p, [(N * V0) / V, (pi * V + N * V0) / (V + N * V0), pi * (N * V0) / V + 1, pi + N * V0], fp),
        explanation: `Boyle cho cả lượng khí: $p_iV + N\\cdot p_0V_0 = pV \\Rightarrow p = ${tex(pi)} + \\dfrac{${N}\\cdot ${tex(V0, 3)}}{${tex(V)}} \\approx ${ts(p)}\\ \\text{atm}$.`,
      };
      const pt = r.pick([2, 2.5, 3, 3.5, 4]);
      need(pt > pi);
      const Nn = ((pt - pi) * V) / V0;
      need(Number.isInteger(round(Nn, 6)));
      return {
        stem: `${pre} Số lần bơm để áp suất bên trong đạt ${q(pt, "atm")} là`,
        ...nopt(r, Nn, [(pt * V) / V0, ((pt - pi) * V) / V0 / pi, (pt * V) / V0 - 1, ((pt - 1) * V) / V0 + 1], (x) => `$${ts(x)}$ lần`),
        explanation: `$p_iV + N p_0V_0 = p V \\Rightarrow N = \\dfrac{(p - p_i)V}{p_0V_0} = \\dfrac{(${tex(pt)} - ${tex(pi)})\\cdot ${tex(V)}}{1\\cdot ${tex(V0, 3)}} = ${round(Nn)}$.`,
      };
    },
  },

  /* ---------- TF ---------- */
  {
    id: "l12-tf-ly-thuyet-khi", subject: S, grade: G, chapter: CH2, topic: "Mô hình động học phân tử chất khí – Đúng/Sai", half: 2, level: 1, kind: "tf",
    make: (r) => {
      const tr = pickN(r, TRUE_KHI, 4), fa = pickN(r, FALSE_KHI, 4);
      const items: [string, boolean][] = [0, 1, 2, 3].map((i) => (r.chance(0.5) ? [tr[i], true] : [fa[i], false]));
      return {
        stem: `${r.pick([`Bạn ${r.pick(NAMES)} đưa ra các phát biểu sau`, `Trong giờ thảo luận, nhóm của bạn ${r.pick(NAMES)} nêu các phát biểu sau`, "Xét các phát biểu sau"])} về chất khí theo mô hình động học phân tử.`,
        ...tf(items),
        explanation: items.map(([t, a]) => `${a ? "Đúng" : "Sai"}: ${t}`).join(" "),
      };
    },
  },
  {
    id: "l12-tf-boyle-xilanh", subject: S, grade: G, chapter: CH2, topic: "Quá trình đẳng nhiệt – Đúng/Sai", half: 2, level: 2, kind: "tf",
    make: (r) => {
      const p1 = r.pick([1, 1.5, 2, 2.5, 3]), V1 = r.int(4, 24), k = r.pick([2, 3, 4, 1.5, 2.5]), V2 = V1 / k, p2 = p1 * k;
      need(Number.isInteger(V2 * 10));
      const p3 = p1 * r.pick([5, 6, 8, 1.2, 1.25]), V3 = (p1 * V1) / p3;
      need(p3 !== p2);
      const c1 = r.chance(0.5), c2 = r.chance(0.5), c3 = r.chance(0.5), c4 = r.chance(0.5);
      const fp = (x: number) => `$${ts(x)}\\cdot 10^5\\ \\text{Pa}$`;
      return {
        stem: `Một lượng khí lí tưởng trong xilanh ở trạng thái (1): áp suất ${fp(p1)}, thể tích ${q(V1, "lít")}, nhiệt độ ${q(r.pick([290, 300, 310]), "K")}. Khí được nén thật chậm, nhiệt độ giữ không đổi, đến trạng thái (2) có thể tích ${qs(V2, "lít")}.`,
        ...tf([
          [c1 ? "Trong quá trình này, tích $pV$ của lượng khí không đổi." : "Trong quá trình này, tỉ số $\\dfrac{p}{V}$ của lượng khí không đổi.", c1],
          [`Áp suất của khí ở trạng thái (2) là ${fp(c2 ? p2 : p1 / k)}.`, c2],
          [c3 ? `Mật độ phân tử khí ở trạng thái (2) lớn gấp $${ts(k)}$ lần ở trạng thái (1).` : `Mật độ phân tử khí ở trạng thái (2) nhỏ hơn $${ts(k)}$ lần so với trạng thái (1).`, c3],
          [`Nếu tiếp tục nén đẳng nhiệt đến khi áp suất là ${fp(p3)} thì thể tích khí là ${qs(c4 ? V3 : (V1 * p3) / p1, "lít")}.`, c4],
        ]),
        explanation: `Đẳng nhiệt: $pV = \\text{hằng số}$. $p_2 = \\dfrac{p_1V_1}{V_2} = ${ts(p2)}\\cdot 10^5\\ \\text{Pa}$. Số phân tử không đổi, thể tích giảm $${ts(k)}$ lần nên mật độ tăng $${ts(k)}$ lần. $V_3 = \\dfrac{p_1V_1}{p_3} = ${ts(V3)}\\ \\text{lít}$.`,
      };
    },
  },
  {
    id: "l12-tf-dong-nang-phan-tu", subject: S, grade: G, chapter: CH2, topic: "Động năng phân tử, tốc độ phân tử – Đúng/Sai", half: 2, level: 2, kind: "tf",
    make: (r) => {
      const [g, h] = pickN(r, GASES, 2), t = r.pick([0, 17, 27, 37, 47, 77, 127]), T = t + 273;
      const W = 1.5 * KB * T, v = Math.sqrt((3 * R * T) / (g.M / 1000)), heavier = g.M > h.M ? g : h, lighter = g.M > h.M ? h : g;
      const c1 = r.chance(0.5), c2 = r.chance(0.5), c3 = r.chance(0.5), c4 = r.chance(0.5);
      const twist2 = r.chance(0.5);
      return {
        stem: `Một bình chứa hỗn hợp ${gasTxt(g)} và ${gasTxt(h)} ở nhiệt độ ${dC(t, 1)}, coi là khí lí tưởng. Lấy ${KTXT}, ${RTXT}, $T = t + 273$.`,
        ...tf([
          [`Động năng tịnh tiến trung bình của một phân tử ${g.n} là $${sci(c1 ? W : KB * T)}\\ \\text{J}$.`, c1],
          twist2
            ? [`Nếu nhiệt độ tuyệt đối của hỗn hợp tăng gấp đôi thì động năng tịnh tiến trung bình của mỗi phân tử ${c2 ? "tăng gấp đôi" : "tăng gấp bốn"}.`, c2]
            : [`Ở cùng nhiệt độ, động năng tịnh tiến trung bình của phân tử ${heavier.n} ${c2 ? "bằng" : "lớn hơn"} của phân tử ${lighter.n}.`, c2],
          [`Tốc độ trung bình của phân tử ${c3 ? lighter.n : heavier.n} lớn hơn của phân tử ${c3 ? heavier.n : lighter.n}.`, c3],
          [`Tốc độ căn quân phương của phân tử ${g.n} xấp xỉ ${qs(c4 ? v : Math.sqrt((3 * R * T) / g.M), "m/s")}.`, c4],
        ]),
        explanation: `$W_đ = \\dfrac{3}{2}kT = ${sci(W)}\\ \\text{J}$, tỉ lệ với $T$ và như nhau với mọi khí ở cùng nhiệt độ. $v = \\sqrt{\\dfrac{3RT}{M}}$: khí nhẹ hơn có tốc độ lớn hơn; với ${g.n}: $v = \\sqrt{\\dfrac{3\\cdot 8{,}31\\cdot ${T}}{${tex(g.M / 1000, 3)}}} \\approx ${ts(v)}\\ \\text{m/s}$.`,
      };
    },
  },
  {
    id: "l12-tf-binh-khi", subject: S, grade: G, chapter: CH2, topic: "Phương trình trạng thái – bình khí – Đúng/Sai", half: 2, level: 3, kind: "tf",
    make: (r) => {
      const g = r.pick(GASES), V = r.pick([5, 8.31, 10, 16.62, 20, 25]), p = r.pick([1, 1.5, 2, 3, 4, 5, 6]), t = r.pick([7, 17, 27, 37, 47]);
      const T = t + 273, n = (p * 1e5 * V * 1e-3) / (R * T), m = n * g.M, N = n * NA;
      const t2 = r.pick([57, 77, 87, 127, 177, 227]), T2 = t2 + 273, p2 = (p * T2) / T;
      const nC = (p * 1e5 * V * 1e-3) / (R * t);
      const c1 = r.chance(0.5), c2 = r.chance(0.5), c3 = r.chance(0.5), c4 = r.chance(0.5);
      const fp = (x: number) => `$${ts(x)}\\cdot 10^5\\ \\text{Pa}$`;
      return {
        stem: `Một bình thép kín dung tích ${q(V, "lít")} chứa ${gasTxt(g)} ở áp suất ${fp(p)} và nhiệt độ ${dC(t, 1)}. Lấy ${RTXT}, $N_A = 6{,}02\\cdot 10^{23}\\ \\text{mol}^{-1}$, $T = t + 273$.`,
        ...tf([
          [`Số mol khí trong bình xấp xỉ ${qs(c1 ? n : nC, "mol")}.`, c1],
          [`Khối lượng khí trong bình xấp xỉ ${qs(c2 ? m : m / 1000, "g")}.`, c2],
          [`Số phân tử khí trong bình xấp xỉ $${sci(c3 ? N : nC * NA)}$.`, c3],
          [`Nếu nung nóng bình đến ${dC(t2, 1)} thì áp suất khí trong bình là ${fp(c4 ? p2 : (p * t2) / t)}.`, c4],
        ]),
        explanation: `$n = \\dfrac{pV}{RT} = \\dfrac{${tex(p)}\\cdot 10^5\\cdot ${tex(V)}\\cdot 10^{-3}}{8{,}31\\cdot ${T}} \\approx ${ts(n)}\\ \\text{mol}$; $m = nM \\approx ${ts(m)}\\ \\text{g}$; $N = nN_A \\approx ${sci(N)}$; đẳng tích: $p_2 = p\\dfrac{T_2}{T} = ${tex(p)}\\cdot\\dfrac{${T2}}{${T}} \\approx ${ts(p2)}\\cdot 10^5\\ \\text{Pa}$.`,
      };
    },
  },

  /* ---------- SHORT ---------- */
  {
    id: "l12-s-boyle", subject: S, grade: G, chapter: CH2, topic: "Định luật Boyle – trả lời ngắn", half: 2, level: 1, kind: "short",
    make: (r) => {
      const V1 = r.int(2, 30), p1 = r.pick([1, 1.5, 2, 2.5, 3, 4]), p2 = r.pick([0.5, 1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6]);
      need(p1 !== p2);
      const V2 = (p1 * V1) / p2;
      if (r.chance(0.5)) return {
        stem: `Một lượng khí có thể tích ${q(V1, "lít")} ở áp suất ${q(p1, "atm")} được ${p2 > p1 ? "nén" : "giãn"} đẳng nhiệt đến khi áp suất là ${q(p2, "atm")}. Thể tích của khí khi đó là bao nhiêu lít? (Làm tròn đến hàng phần mười.)`,
        ...short(V2, 1),
        explanation: `$V_2 = \\dfrac{p_1V_1}{p_2} = \\dfrac{${tex(p1)}\\cdot ${V1}}{${tex(p2)}} \\approx ${tex(V2, 2)}\\ \\text{lít}$.`,
      };
      const dV = r.int(1, 6), dp = r.pick([0.2, 0.25, 0.4, 0.5, 1]);
      // nén từ V0 xuống V0 - dV thì p tăng thêm dp: p0V0 = (p0+dp)(V0-dV) với p0 = ? ; cho V0 → p0 = dp(V0-dV)/dV
      const V0 = dV + r.int(1, 12), P0 = (dp * (V0 - dV)) / dV;
      return {
        stem: `Nén đẳng nhiệt một lượng khí từ thể tích ${q(V0, "lít")} xuống ${q(V0 - dV, "lít")} thì áp suất của khí tăng thêm ${q(dp, "atm")}. Áp suất ban đầu của khí là bao nhiêu atm? (Làm tròn đến hàng phần trăm.)`,
        ...short(P0, 2),
        explanation: `$p_0V_0 = (p_0 + \\Delta p)(V_0 - \\Delta V) \\Rightarrow p_0 = \\dfrac{\\Delta p(V_0 - \\Delta V)}{\\Delta V} = \\dfrac{${tex(dp)}\\cdot ${V0 - dV}}{${dV}} \\approx ${tex(P0, 2)}\\ \\text{atm}$.`,
      };
    },
  },
  {
    id: "l12-s-nhiet-do-khi", subject: S, grade: G, chapter: CH2, topic: "Đẳng áp, đẳng tích – tìm nhiệt độ", half: 2, level: 2, kind: "short",
    make: (r) => {
      const t1 = r.pick([0, 7, 17, 27, 37, 47, 57]), T1 = t1 + 273;
      const k = r.pick([1.1, 1.2, 1.25, 1.5, 2, 0.8, 0.9]), T2 = T1 * k, t2 = T2 - 273;
      if (r.chance(0.5)) {
        const V1 = r.int(2, 20), V2 = V1 * k;
        return {
          stem: `Một lượng khí có thể tích ${q(V1, "lít")} ở ${dC(t1, 1)}. ${k > 1 ? "Nung nóng" : "Làm lạnh"} đẳng áp lượng khí này đến khi thể tích là ${q(V2, "lít")}. Lấy $T = t + 273$. Nhiệt độ của khí khi đó là bao nhiêu $^\\circ\\text{C}$? (Làm tròn đến hàng phần mười.)`,
          ...short(t2, 1),
          explanation: `$T_2 = T_1\\dfrac{V_2}{V_1} = ${T1}\\cdot\\dfrac{${tex(V2)}}{${V1}} = ${tex(T2, 2)}\\ \\text{K}$ $\\Rightarrow t_2 = ${tex(t2, 2)}\\ ^\\circ\\text{C}$.`,
        };
      }
      const p1 = r.pick([1, 1.5, 2, 2.5, 3]), p2 = p1 * k;
      return {
        stem: `Khí trong một bình kín (thể tích không đổi) có áp suất $${tex(p1)}\\cdot 10^5\\ \\text{Pa}$ ở ${dC(t1, 1)}. ${k > 1 ? "Đun nóng" : "Làm lạnh"} bình đến khi áp suất khí là $${tex(p2, 3)}\\cdot 10^5\\ \\text{Pa}$. Lấy $T = t + 273$. Nhiệt độ của khí khi đó là bao nhiêu $^\\circ\\text{C}$? (Làm tròn đến hàng phần mười.)`,
        ...short(t2, 1),
        explanation: `$T_2 = T_1\\dfrac{p_2}{p_1} = ${T1}\\cdot ${tex(k)} = ${tex(T2, 2)}\\ \\text{K}$ $\\Rightarrow t_2 = ${tex(t2, 2)}\\ ^\\circ\\text{C}$.`,
      };
    },
  },
  {
    id: "l12-s-pv-nrt", subject: S, grade: G, chapter: CH2, topic: "Phương trình Clapeyron – trả lời ngắn", half: 2, level: 2, kind: "short",
    make: (r) => {
      const g = r.pick(GASES), V = r.pick([2, 5, 8.31, 10, 12, 16.62, 20]), p = r.pick([1, 1.5, 2, 3, 4, 5]), t = r.pick([7, 17, 27, 37, 47, 77]);
      const T = t + 273, n = (p * 1e5 * V * 1e-3) / (R * T), m = n * g.M;
      if (r.chance(0.5)) return {
        stem: `Một bình kín dung tích ${q(V, "lít")} chứa khí lí tưởng ở áp suất $${tex(p)}\\cdot 10^5\\ \\text{Pa}$ và nhiệt độ ${dC(t, 1)}. Lấy ${RTXT}, $T = t + 273$. Số mol khí trong bình là bao nhiêu? (Làm tròn đến hàng phần trăm.)`,
        ...short(n, 2),
        explanation: `$n = \\dfrac{pV}{RT} = \\dfrac{${tex(p)}\\cdot 10^5\\cdot ${tex(V)}\\cdot 10^{-3}}{8{,}31\\cdot ${T}} \\approx ${tex(n, 2)}\\ \\text{mol}$.`,
      };
      return {
        stem: `Một bình kín dung tích ${q(V, "lít")} chứa ${gasTxt(g)} ở áp suất $${tex(p)}\\cdot 10^5\\ \\text{Pa}$ và nhiệt độ ${dC(t, 1)}. Lấy ${RTXT}, $T = t + 273$. Khối lượng khí trong bình là bao nhiêu gam? (Làm tròn đến hàng phần mười.)`,
        ...short(m, 1),
        explanation: `$m = \\dfrac{pVM}{RT} = \\dfrac{${tex(p)}\\cdot 10^5\\cdot ${tex(V)}\\cdot 10^{-3}\\cdot ${g.M}}{8{,}31\\cdot ${T}} \\approx ${tex(m, 1)}\\ \\text{g}$.`,
      };
    },
  },
  {
    id: "l12-s-dong-nang", subject: S, grade: G, chapter: CH2, topic: "Động năng trung bình phân tử – trả lời ngắn", half: 2, level: 2, kind: "short",
    make: (r) => {
      const t = r.int(-10, 60) * 5, T = t + 273, W = 1.5 * KB * T;
      if (r.chance(0.6)) return {
        stem: `Lấy ${KTXT}, $T = t + 273$. Động năng tịnh tiến trung bình của một phân tử khí lí tưởng ở ${dC(t, 1)} bằng $x\\cdot 10^{-21}\\ \\text{J}$. Tìm $x$ (làm tròn đến hàng phần trăm).`,
        ...short(W / 1e-21, 2),
        explanation: `$W_đ = \\dfrac{3}{2}kT = \\dfrac{3}{2}\\cdot 1{,}38\\cdot 10^{-23}\\cdot ${T} \\approx ${tex(W / 1e-21, 2)}\\cdot 10^{-21}\\ \\text{J}$.`,
      };
      const Wr = round(W / 1e-21, 2), Tt = (Wr * 1e-21) / (1.5 * KB), tt = Tt - 273;
      return {
        stem: `Lấy ${KTXT}, $T = t + 273$. Động năng tịnh tiến trung bình của phân tử một khí lí tưởng là $${tex(Wr, 2)}\\cdot 10^{-21}\\ \\text{J}$. Nhiệt độ của khí là bao nhiêu $^\\circ\\text{C}$? (Làm tròn đến hàng đơn vị.)`,
        ...short(round(tt), 1),
        explanation: `$T = \\dfrac{2W_đ}{3k} = \\dfrac{2\\cdot ${tex(Wr, 2)}\\cdot 10^{-21}}{3\\cdot 1{,}38\\cdot 10^{-23}} \\approx ${tex(Tt, 1)}\\ \\text{K}$ $\\Rightarrow t \\approx ${round(tt)}\\ ^\\circ\\text{C}$.`,
      };
    },
  },
  {
    id: "l12-s-toc-do-phan-tu", subject: S, grade: G, chapter: CH2, topic: "Tốc độ căn quân phương – trả lời ngắn", half: 2, level: 3, kind: "short",
    make: (r) => {
      const g = r.pick(GASES), t = r.pick([0, 17, 27, 37, 47, 77, 127, 227]), T = t + 273, v = Math.sqrt((3 * R * T) / (g.M / 1000));
      if (r.chance(0.6)) return {
        stem: `Coi ${gasTxt(g)} là khí lí tưởng ở nhiệt độ ${dC(t, 1)}. Lấy ${RTXT}, $T = t + 273$. Tốc độ căn quân phương của phân tử khí là bao nhiêu m/s? (Làm tròn đến hàng đơn vị.)`,
        ...short(round(v), 1),
        explanation: `$\\sqrt{\\overline{v^2}} = \\sqrt{\\dfrac{3RT}{M}} = \\sqrt{\\dfrac{3\\cdot 8{,}31\\cdot ${T}}{${tex(g.M / 1000, 3)}}} \\approx ${round(v)}\\ \\text{m/s}$.`,
      };
      const rho = r.pick([0.09, 0.18, 1.25, 1.29, 1.43, 1.98]), p = r.pick([0.5, 1, 1.5, 2, 3]) * 1e5, vv = Math.sqrt((3 * p) / rho);
      return {
        stem: `Một chất khí ở áp suất $${sci(p, 1)}\\ \\text{Pa}$ có khối lượng riêng $${tex(rho)}\\ \\text{kg/m}^3$. Theo mô hình động học phân tử ($p = \\dfrac{1}{3}\\rho\\overline{v^2}$), tốc độ căn quân phương của phân tử khí là bao nhiêu m/s? (Làm tròn đến hàng đơn vị.)`,
        ...short(round(vv), 1),
        explanation: `$\\sqrt{\\overline{v^2}} = \\sqrt{\\dfrac{3p}{\\rho}} = \\sqrt{\\dfrac{3\\cdot ${sci(p, 1)}}{${tex(rho)}}} \\approx ${round(vv)}\\ \\text{m/s}$.`,
      };
    },
  },
  {
    id: "l12-s-bom-khi", subject: S, grade: G, chapter: CH2, topic: "Bơm khí – trả lời ngắn", half: 2, level: 3, kind: "short",
    make: (r) => {
      const V = r.pick([2, 2.5, 3, 4, 5]), V0 = r.pick([0.1, 0.125, 0.2, 0.25]), pi = r.pick([1, 1.2, 1.5]), pt = r.pick([2, 2.5, 3, 3.5, 4]);
      const obj = r.pick(["một quả bóng", "một săm xe đạp", "một lốp xe máy", "một bình chứa"]);
      const N = ((pt - pi) * V) / V0;
      need(Number.isInteger(round(N, 6)));
      if (r.chance(0.5)) return {
        stem: `Dùng bơm tay bơm không khí vào ${obj} có dung tích ${q(V, "lít")} (coi không đổi), ban đầu chứa không khí ở áp suất ${q(pi, "atm")}. Mỗi lần bơm đưa được ${q(V0, "lít", 3)} không khí ở áp suất $1\\ \\text{atm}$ vào. Coi nhiệt độ không đổi. Cần bơm bao nhiêu lần để áp suất bên trong là ${q(pt, "atm")}?`,
        ...short(round(N), 1),
        explanation: `$p_iV + N p_0V_0 = pV \\Rightarrow N = \\dfrac{(${tex(pt)} - ${tex(pi)})\\cdot ${tex(V)}}{1\\cdot ${tex(V0, 3)}} = ${round(N)}$.`,
      };
      const n = r.int(8, 40), p = pi + (n * V0) / V;
      return {
        stem: `Dùng bơm tay bơm không khí vào ${obj} có dung tích ${q(V, "lít")} (coi không đổi), ban đầu chứa không khí ở áp suất ${q(pi, "atm")}. Mỗi lần bơm đưa được ${q(V0, "lít", 3)} không khí ở áp suất $1\\ \\text{atm}$ vào. Coi nhiệt độ không đổi. Sau ${n} lần bơm, áp suất bên trong là bao nhiêu atm? (Làm tròn đến hàng phần trăm.)`,
        ...short(p, 2),
        explanation: `$p = p_i + \\dfrac{N p_0V_0}{V} = ${tex(pi)} + \\dfrac{${n}\\cdot ${tex(V0, 3)}}{${tex(V)}} \\approx ${tex(p, 2)}\\ \\text{atm}$.`,
      };
    },
  },
  {
    id: "l12-s-pt-trang-thai", subject: S, grade: G, chapter: CH2, topic: "Phương trình trạng thái – trả lời ngắn", half: 2, level: 3, kind: "short",
    make: (r) => {
      const t1 = r.pick([7, 17, 27, 37, 47]), t2 = r.pick([0, 27, 57, 77, 127, 177, 227]);
      need(t1 !== t2);
      const T1 = t1 + 273, T2 = t2 + 273, p1 = r.pick([1, 1.5, 2, 3]), p2 = r.pick([1, 2, 2.5, 3, 4, 5]), V1 = r.int(2, 24);
      need(p1 !== p2);
      const V2 = (p1 * V1 * T2) / (p2 * T1);
      if (r.chance(0.6)) return {
        stem: `Một lượng khí lí tưởng ở trạng thái đầu có áp suất ${q(p1, "atm")}, thể tích ${q(V1, "lít")}, nhiệt độ ${dC(t1, 1)}. Khi chuyển sang trạng thái có áp suất ${q(p2, "atm")}, nhiệt độ ${dC(t2, 1)} thì thể tích của khí là bao nhiêu lít? Lấy $T = t + 273$ (làm tròn đến hàng phần mười).`,
        ...short(V2, 1),
        explanation: `$V_2 = \\dfrac{p_1V_1T_2}{p_2T_1} = \\dfrac{${tex(p1)}\\cdot ${V1}\\cdot ${T2}}{${tex(p2)}\\cdot ${T1}} \\approx ${tex(V2, 2)}\\ \\text{lít}$.`,
      };
      // khí cầu / bọt khí: p, V, T cùng đổi – tìm áp suất
      const V2r = round(V2, 1);
      need(V2r > 0);
      const pp = (p1 * V1 * T2) / (V2r * T1);
      return {
        stem: `Một lượng khí lí tưởng ở trạng thái đầu có áp suất ${q(p1, "atm")}, thể tích ${q(V1, "lít")}, nhiệt độ ${dC(t1, 1)}. Khi chuyển sang trạng thái có thể tích ${q(V2r, "lít", 1)}, nhiệt độ ${dC(t2, 1)} thì áp suất của khí là bao nhiêu atm? Lấy $T = t + 273$ (làm tròn đến hàng phần trăm).`,
        ...short(pp, 2),
        explanation: `$p_2 = \\dfrac{p_1V_1T_2}{V_2T_1} = \\dfrac{${tex(p1)}\\cdot ${V1}\\cdot ${T2}}{${tex(V2r, 1)}\\cdot ${T1}} \\approx ${tex(pp, 2)}\\ \\text{atm}$.`,
      };
    },
  },
];

export const TEMPLATES: Template[] = [...H1, ...H2];
