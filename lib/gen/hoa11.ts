/* Hóa học 11 – học kì 1 (Kết nối tri thức).
   half 1: Cân bằng hóa học + Nitrogen và sulfur; half 2: Đại cương về hóa học hữu cơ. */
import { mcq, tf, short, vn, tex, need, gcd, round, type Template, type Rng } from "./core.ts";

const S = "Hóa học", G = 11 as const;
const C1 = "Chương 1. Cân bằng hóa học";
const C2 = "Chương 2. Nitrogen và sulfur";
const C3 = "Chương 3. Đại cương về hóa học hữu cơ";

/* ---------------- tiện ích hóa học ---------------- */
/** "2H2SO4 <=> ..." → TeX bên trong \mathrm: chỉ số dưới, mũi tên, liên kết ba (#) */
const fx = (s: string) =>
  s.replace(/<=>/g, " \\rightleftharpoons ").replace(/->/g, " \\rightarrow ").replace(/#/g, "\\equiv ").replace(/NaN/g, "Na{}N")
    .replace(/([A-Za-z)\]])(\d+)/g, "$1_{$2}");
const mr = (s: string) => `\\mathrm{${fx(s)}}`;
const ch = (s: string) => `$${mr(s)}$`;
const AM: Record<string, number> = { H: 1, C: 12, N: 14, O: 16, S: 32, Cl: 35.5, Na: 23, K: 39, Mg: 24, Al: 27, Fe: 56, Cu: 64, Zn: 65, Ba: 137, Ca: 40, P: 31, Br: 80, I: 127, Mn: 55 };
function atoms(f: string): Record<string, number> {
  const st: Record<string, number>[] = [{}]; let i = 0;
  const num = () => { let n = ""; while (i < f.length && /\d/.test(f[i])) n += f[i++]; return n ? +n : 1; };
  while (i < f.length) {
    const c = f[i];
    if (c === "(" || c === "[") { st.push({}); i++; }
    else if (c === ")" || c === "]") { i++; const k = num(); const g = st.pop()!; const top = st[st.length - 1]; for (const e in g) top[e] = (top[e] || 0) + g[e] * k; }
    else if (/[A-Z]/.test(c)) { let e = c; i++; if (i < f.length && /[a-z]/.test(f[i]) && AM[e + f[i]]) e += f[i++]; const k = num(); const top = st[st.length - 1]; top[e] = (top[e] || 0) + k; }
    else i++;
  }
  return st[0];
}
const molar = (f: string) => { const a = atoms(f); let m = 0; for (const e in a) m += AM[e] * a[e]; return round(m, 2); };
const ORDER = ["C", "H", "O", "N", "Cl", "S"];
const fml = (a: Record<string, number>) => ORDER.filter((e) => a[e]).map((e) => e + (a[e] > 1 ? a[e] : "")).join("");
const simplest = (f: string) => { const a = atoms(f); let g = 0; for (const e in a) g = gcd(g, a[e]); const b: Record<string, number> = {}; for (const e in a) b[e] = a[e] / g; return fml(b); };
const scale = (f: string, k: number) => { const a = atoms(f); const b: Record<string, number> = {}; for (const e in a) b[e] = a[e] * k; return fml(b); };
const valid = (f: string) => { const a = atoms(f); return a.H % 2 === 0 && a.H <= 2 * a.C + 2; };
const ntk = (els: string[]) => `(Cho ${els.map((e) => `${e} = ${vn(AM[e])}`).join(", ")})`;
const elsOf = (fs: string[]) => { const s = new Set<string>(); fs.forEach((f) => Object.keys(atoms(f)).forEach((e) => s.add(e))); return Object.keys(AM).filter((e) => s.has(e)); };
const pickN = <T,>(r: Rng, a: readonly T[], n: number): T[] => r.shuffle([...a]).slice(0, n);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const exact = (x: number, dp: number) => Math.abs(x * 10 ** dp - Math.round(x * 10 ** dp)) < 1e-6;
const V0 = 24.79;
/** phương án nhiễu cho câu đếm: k±1, k±2 trong [lo, hi] */
const near = (k: number, lo: number, hi: number) => [k - 1, k + 1, k + 2, k - 2, k + 3, k - 3].filter((x) => x >= lo && x <= hi).map(String);
/** short() nhưng tránh số đúng nửa (…5) để làm tròn không mơ hồ */
const sh = (x: number, dp: number) => { const t = Math.abs(x * 10 ** dp) % 1; need(Math.abs(t - 0.5) > 1e-6); return short(x, dp); };
const cf = (k: number) => (k === 1 ? "" : String(k));
const lg = (x: number) => Math.log10(x);

/** Câu lí thuyết từ ngân hàng phát biểu đúng / sai (có lời sửa). */
function bank(r: Rng, about: string[], T: string[], F: [string, string][]) {
  if (r.chance(0.5)) {
    const k = r.int(1, 4);
    const items: [string, boolean, string][] = r.shuffle([
      ...pickN(r, T, k).map((t): [string, boolean, string] => [t, true, ""]),
      ...pickN(r, F, 5 - k).map(([t, c]): [string, boolean, string] => [t, false, c]),
    ]);
    const stem = `${cap(r.pick(about))}, cho các phát biểu sau: ${items.map((x, i) => `(${i + 1}) ${x[0].replace(/\.$/, "")}`).join("; ")}. Số phát biểu đúng là`;
    return {
      stem, ...mcq(r, String(k), near(k, 0, 5)),
      explanation: items.map((x, i) => `(${i + 1}) ${x[1] ? "đúng" : "sai: " + x[2]}`).join("; ") + `. Vậy có ${k} phát biểu đúng.`,
    };
  }
  const askTrue = r.chance(0.5);
  if (askTrue) {
    const right = r.pick(T); const wrong = pickN(r, F, 3);
    return {
      stem: `${cap(r.pick(about))}, phát biểu nào sau đây đúng?`, ...mcq(r, right, wrong.map((x) => x[0])),
      explanation: `Phát biểu đúng: ${right} Các phát biểu còn lại sai vì: ${wrong.map((x) => x[1]).join("; ")}.`,
    };
  }
  const right = r.pick(F); const wrong = pickN(r, T, 3);
  return {
    stem: `${cap(r.pick(about))}, phát biểu nào sau đây sai?`, ...mcq(r, right[0], wrong),
    explanation: `Phát biểu "${right[0].replace(/\.$/, "")}" sai vì ${right[1]}. Các phát biểu còn lại đều đúng.`,
  };
}

/* ---------------- cân bằng hóa học ---------------- */
type Sp = [string, number, "g" | "s"];
type Rx = { r: Sp[]; p: Sp[]; dH: number };
const RX: Rx[] = [
  { r: [["N2", 1, "g"], ["H2", 3, "g"]], p: [["NH3", 2, "g"]], dH: -92 },
  { r: [["SO2", 2, "g"], ["O2", 1, "g"]], p: [["SO3", 2, "g"]], dH: -198 },
  { r: [["H2", 1, "g"], ["I2", 1, "g"]], p: [["HI", 2, "g"]], dH: -9 },
  { r: [["N2O4", 1, "g"]], p: [["NO2", 2, "g"]], dH: 58 },
  { r: [["CaCO3", 1, "s"]], p: [["CaO", 1, "s"], ["CO2", 1, "g"]], dH: 178 },
  { r: [["C", 1, "s"], ["H2O", 1, "g"]], p: [["CO", 1, "g"], ["H2", 1, "g"]], dH: 131 },
  { r: [["CO", 1, "g"], ["H2O", 1, "g"]], p: [["CO2", 1, "g"], ["H2", 1, "g"]], dH: -41 },
  { r: [["NO", 2, "g"], ["O2", 1, "g"]], p: [["NO2", 2, "g"]], dH: -114 },
  { r: [["PCl5", 1, "g"]], p: [["PCl3", 1, "g"], ["Cl2", 1, "g"]], dH: 88 },
  { r: [["C", 1, "s"], ["CO2", 1, "g"]], p: [["CO", 2, "g"]], dH: 172 },
  { r: [["N2", 1, "g"], ["O2", 1, "g"]], p: [["NO", 2, "g"]], dH: 180 },
  { r: [["Fe2O3", 1, "s"], ["CO", 3, "g"]], p: [["Fe", 2, "s"], ["CO2", 3, "g"]], dH: -25 },
];
const rev = (x: Rx): Rx => ({ r: x.p, p: x.r, dH: -x.dH });
const side = (a: Sp[]) => a.map(([f, c, p]) => `${c > 1 ? c : ""}${f}(${p})`).join(" + ");
const eqTex = (x: Rx) => `$${mr(`${side(x.r)} <=> ${side(x.p)}`)}$`;
const gasN = (a: Sp[]) => a.filter((s) => s[2] === "g").reduce((t, s) => t + s[1], 0);
const dHtex = (x: Rx, num: boolean) => `$\\Delta_r H^\\circ_{298} ${num ? "= " + x.dH + "\\ \\mathrm{kJ}" : x.dH > 0 ? "> 0" : "< 0"}$`;
type KO = { solid?: boolean; noExp?: boolean; sum?: boolean; mult?: boolean };
const prodTex = (a: Sp[], o: KO) => a.filter((s) => o.solid || s[2] === "g")
  .map(([f, c]) => `${o.mult && c > 1 ? c : ""}[${mr(f)}]${c > 1 && !o.noExp && !o.mult ? `^{${c}}` : ""}`).join(o.sum ? " + " : "");
const kcTex = (num: Sp[], den: Sp[], o: KO = {}) => { const N = prodTex(num, o) || "1", D = prodTex(den, o); return D ? `\\dfrac{${N}}{${D}}` : N; };

/* ---------------- dung dịch ---------------- */
const dec = (x: number) => vn(x, 6);

/* ---------------- HNO3: cân bằng theo bảo toàn electron ---------------- */
const GAS: Record<string, { e: number; nN: number; name: string }> = {
  NO2: { e: 1, nN: 1, name: "nitrogen dioxide" }, NO: { e: 3, nN: 1, name: "nitrogen monoxide" },
  N2O: { e: 8, nN: 2, name: "dinitrogen monoxide" }, N2: { e: 10, nN: 2, name: "nitrogen" }, NH4NO3: { e: 8, nN: 1, name: "ammonium nitrate" },
};
function balHNO3(n: number, gas: string) {
  const { e, nN } = GAS[gas]; const g = gcd(n, e);
  let a = e / g, b = n / g;
  let hno3 = a * n + b * nN + (gas === "NH4NO3" ? b : 0);
  let w2 = gas === "NH4NO3" ? hno3 - 4 * b : hno3;
  if (w2 % 2) { a *= 2; b *= 2; hno3 *= 2; w2 *= 2; }
  return { a, b, hno3, h2o: w2 / 2, ox: b * nN };
}
const METALS: Record<string, { M: number; n: number; name: string }> = {
  Cu: { M: 64, n: 2, name: "copper" }, Mg: { M: 24, n: 2, name: "magnesium" }, Al: { M: 27, n: 3, name: "aluminium" },
  Zn: { M: 65, n: 2, name: "zinc" }, Fe: { M: 56, n: 3, name: "iron" },
};

/* ---------------- hữu cơ ---------------- */
type Iso = { f: string; q: string; n: number; l: string[] };
const ISO: Iso[] = [
  { f: "C4H10", q: "đồng phân cấu tạo", n: 2, l: ["CH3CH2CH2CH3", "CH3CH(CH3)CH3"] },
  { f: "C5H12", q: "đồng phân cấu tạo", n: 3, l: ["CH3[CH2]3CH3", "CH3CH(CH3)CH2CH3", "C(CH3)4"] },
  { f: "C6H14", q: "đồng phân cấu tạo", n: 5, l: ["CH3[CH2]4CH3", "CH3CH(CH3)[CH2]2CH3", "CH3CH2CH(CH3)CH2CH3", "CH3CH(CH3)CH(CH3)CH3", "CH3C(CH3)2CH2CH3"] },
  { f: "C2H6O", q: "đồng phân cấu tạo", n: 2, l: ["CH3CH2OH", "CH3OCH3"] },
  { f: "C3H8O", q: "đồng phân cấu tạo", n: 3, l: ["CH3CH2CH2OH", "CH3CH(OH)CH3", "CH3OCH2CH3"] },
  { f: "C4H10O", q: "đồng phân cấu tạo", n: 7, l: ["CH3[CH2]3OH", "CH3CH2CH(OH)CH3", "(CH3)2CHCH2OH", "(CH3)3COH", "CH3OCH2CH2CH3", "CH3OCH(CH3)2", "CH3CH2OCH2CH3"] },
  { f: "C4H10O", q: "đồng phân cấu tạo thuộc loại alcohol", n: 4, l: ["CH3[CH2]3OH", "CH3CH2CH(OH)CH3", "(CH3)2CHCH2OH", "(CH3)3COH"] },
  { f: "C5H12O", q: "đồng phân cấu tạo thuộc loại alcohol", n: 8, l: ["CH3[CH2]4OH", "CH3CH(OH)[CH2]2CH3", "CH3CH2CH(OH)CH2CH3", "(CH3)2CH[CH2]2OH", "(CH3)2CHCH(OH)CH3", "(CH3)2C(OH)CH2CH3", "CH3CH2CH(CH3)CH2OH", "(CH3)3CCH2OH"] },
  { f: "C3H7Cl", q: "đồng phân cấu tạo", n: 2, l: ["CH3CH2CH2Cl", "CH3CHClCH3"] },
  { f: "C4H9Cl", q: "đồng phân cấu tạo", n: 4, l: ["CH3[CH2]3Cl", "CH3CH2CHClCH3", "(CH3)2CHCH2Cl", "(CH3)3CCl"] },
  { f: "C2H7N", q: "đồng phân cấu tạo", n: 2, l: ["CH3CH2NH2", "CH3NHCH3"] },
  { f: "C3H9N", q: "đồng phân cấu tạo", n: 4, l: ["CH3CH2CH2NH2", "CH3CH(NH2)CH3", "CH3NHCH2CH3", "(CH3)3N"] },
  { f: "C4H8", q: "đồng phân cấu tạo mạch hở", n: 3, l: ["CH2=CHCH2CH3", "CH3CH=CHCH3", "CH2=C(CH3)2"] },
  { f: "C5H10", q: "đồng phân cấu tạo mạch hở", n: 5, l: ["CH2=CH[CH2]2CH3", "CH3CH=CHCH2CH3", "CH2=C(CH3)CH2CH3", "CH2=CHCH(CH3)2", "(CH3)2C=CHCH3"] },
  { f: "C4H8O2", q: "đồng phân cấu tạo thuộc loại carboxylic acid", n: 2, l: ["CH3CH2CH2COOH", "(CH3)2CHCOOH"] },
  { f: "C4H8O2", q: "đồng phân cấu tạo thuộc loại ester", n: 4, l: ["HCOOCH2CH2CH3", "HCOOCH(CH3)2", "CH3COOCH2CH3", "CH3CH2COOCH3"] },
  { f: "C3H6O2", q: "đồng phân cấu tạo thuộc loại ester", n: 2, l: ["HCOOCH2CH3", "CH3COOCH3"] },
];
/** Công thức CxHyOz có cùng phân tử khối M (để làm phương án nhiễu "chỉ dựa vào M") */
function sameM(M: number): string[] {
  const out: string[] = [];
  for (let z = 0; z <= 4; z++) for (let x = 1; 12 * x + 16 * z < M; x++) {
    const y = M - 12 * x - 16 * z;
    if (y >= x && y % 2 === 0 && y <= 2 * x + 2) out.push(fml({ C: x, H: y, O: z }));
  }
  return out;
}
const PCT = ["C2H4O2", "C3H6O", "C2H6O", "C4H8O2", "C3H6O2", "C4H10O", "C3H8O", "C2H4O", "CH2O2", "C4H8O", "C5H10O", "C3H4O2", "C6H12O6", "C3H6O3", "C5H10O2", "C4H6O2"];
const HC = ["C4H10", "C6H6", "C3H6", "C5H12", "C3H8", "C4H8", "C2H2", "C2H6", "C5H10", "C6H14", "C3H4", "C4H6"];
type Pair = [string, string, string, string, string]; // X, tên X, Y, tên Y, loại đồng phân
const PAIRS: Pair[] = [
  ["CH3CH2CH2CH3", "butane", "CH3CH(CH3)CH3", "2-methylpropane", "mạch carbon"],
  ["CH3[CH2]3CH3", "pentane", "C(CH3)4", "2,2-dimethylpropane", "mạch carbon"],
  ["CH3[CH2]3OH", "butan-1-ol", "(CH3)2CHCH2OH", "2-methylpropan-1-ol", "mạch carbon"],
  ["CH3CH2CH2OH", "propan-1-ol", "CH3CH(OH)CH3", "propan-2-ol", "vị trí nhóm chức"],
  ["CH3[CH2]3OH", "butan-1-ol", "CH3CH2CH(OH)CH3", "butan-2-ol", "vị trí nhóm chức"],
  ["CH2=CHCH2CH3", "but-1-ene", "CH3CH=CHCH3", "but-2-ene", "vị trí liên kết bội"],
  ["CH#CCH2CH3", "but-1-yne", "CH3C#CCH3", "but-2-yne", "vị trí liên kết bội"],
  ["CH3CH2OH", "ethanol", "CH3OCH3", "dimethyl ether", "nhóm chức"],
  ["CH3COOH", "acetic acid", "HCOOCH3", "methyl formate", "nhóm chức"],
  ["CH3CH2CHO", "propanal", "CH3COCH3", "acetone", "nhóm chức"],
  ["CH3CH2CH2OH", "propan-1-ol", "CH3OCH2CH3", "ethyl methyl ether", "nhóm chức"],
];
const ISOTYPE = ["mạch carbon", "vị trí nhóm chức", "vị trí liên kết bội", "nhóm chức"];

/* =================================================================== */
export const TEMPLATES: Template[] = [
  /* ======================= HALF 1 – MCQ ======================= */
  {
    id: "h11-kc-bieu-thuc", subject: S, grade: G, chapter: C1, topic: "Biểu thức hằng số cân bằng KC",
    half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const x = r.chance(0.5) ? r.pick(RX) : rev(r.pick(RX));
      const right = `$K_C = ${kcTex(x.p, x.r)}$`;
      const wrong = [kcTex(x.r, x.p), kcTex(x.p, x.r, { solid: true }), kcTex(x.p, x.r, { noExp: true }), kcTex(x.p, x.r, { mult: true }), kcTex(x.p, x.r, { sum: true }), kcTex(x.r, x.p, { solid: true }), kcTex(x.r, x.p, { sum: true })].map((s) => `$K_C = ${s}$`);
      const hasS = [...x.r, ...x.p].some((s) => s[2] === "s");
      return {
        stem: `Cho cân bằng hóa học: ${eqTex(x)}. Biểu thức hằng số cân bằng $K_C$ của phản ứng trên là`,
        ...mcq(r, right, wrong),
        explanation: `$K_C$ bằng tích nồng độ cân bằng của các chất sản phẩm chia cho tích nồng độ cân bằng của các chất tham gia, mỗi nồng độ có số mũ bằng hệ số tỉ lượng${hasS ? "; chất rắn (s) không có mặt trong biểu thức $K_C$" : ""}. Vậy ${right}.`,
      };
    },
  },
  {
    id: "h11-chuyen-dich-can-bang", subject: S, grade: G, chapter: C1, topic: "Chuyển dịch cân bằng (Le Chatelier)",
    half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const x = r.chance(0.7) ? r.pick(RX) : rev(r.pick(RX));
      const dn = gasN(x.p) - gasN(x.r);
      const dirTxt = (d: number) => (d > 0 ? "chiều thuận" : d < 0 ? "chiều nghịch" : "không chuyển dịch");
      const M: [string, number, string][] = [];
      const t = x.dH > 0 ? 1 : -1;
      M.push(["tăng nhiệt độ của hệ", t, `tăng nhiệt độ, cân bằng chuyển dịch theo chiều thu nhiệt, tức ${dirTxt(t)}`]);
      M.push(["giảm nhiệt độ của hệ", -t, `giảm nhiệt độ, cân bằng chuyển dịch theo chiều tỏa nhiệt, tức ${dirTxt(-t)}`]);
      const pz = dn < 0 ? 1 : dn > 0 ? -1 : 0;
      const pr = dn === 0 ? "số mol khí ở hai vế bằng nhau nên áp suất không làm chuyển dịch cân bằng" : "";
      M.push(["tăng áp suất chung của hệ (nén bình)", pz, pr ? "tăng áp suất: " + pr : `tăng áp suất, cân bằng chuyển dịch theo chiều làm giảm số mol khí, tức ${dirTxt(pz)}`]);
      M.push(["giảm áp suất chung của hệ", -pz || 0, pr ? "giảm áp suất: " + pr : `giảm áp suất, cân bằng chuyển dịch theo chiều làm tăng số mol khí, tức ${dirTxt(-pz)}`]);
      M.push(["thêm chất xúc tác", 0, "chất xúc tác làm tăng tốc độ cả hai chiều như nhau nên không làm chuyển dịch cân bằng"]);
      const gr = x.r.filter((s) => s[2] === "g"), gp = x.p.filter((s) => s[2] === "g");
      const sr = [...x.r, ...x.p].filter((s) => s[2] === "s");
      if (gr.length) { const f = r.pick(gr)[0]; M.push([`thêm khí ${ch(f)} vào bình`, 1, `thêm ${ch(f)} (chất tham gia), cân bằng chuyển dịch theo chiều làm giảm ${ch(f)}, tức chiều thuận`]); const f2 = r.pick(gr)[0]; M.push([`lấy bớt khí ${ch(f2)} ra khỏi bình`, -1, `lấy bớt ${ch(f2)}, cân bằng chuyển dịch theo chiều tạo thêm ${ch(f2)}, tức chiều nghịch`]); }
      if (gp.length) { const f = r.pick(gp)[0]; M.push([`lấy bớt khí ${ch(f)} ra khỏi bình`, 1, `lấy bớt ${ch(f)} (sản phẩm), cân bằng chuyển dịch theo chiều tạo thêm ${ch(f)}, tức chiều thuận`]); const f2 = r.pick(gp)[0]; M.push([`thêm khí ${ch(f2)} vào bình`, -1, `thêm ${ch(f2)} (sản phẩm), cân bằng chuyển dịch theo chiều làm giảm ${ch(f2)}, tức chiều nghịch`]); }
      if (sr.length) { const f = r.pick(sr)[0]; M.push([`thêm một lượng chất rắn ${ch(f)}`, 0, `${ch(f)} là chất rắn, không có mặt trong $K_C$ nên thêm nó không làm chuyển dịch cân bằng`]); }
      const target = r.pick([1, -1, 0, 1, -1]);
      const good = M.filter((m) => m[1] === target), bad = M.filter((m) => m[1] !== target);
      need(good.length && bad.length >= 3);
      const right = r.pick(good); const wr = pickN(r, bad, 3);
      const q = target === 0 ? "Biện pháp nào sau đây KHÔNG làm chuyển dịch cân bằng trên?" : `Biện pháp nào sau đây làm cân bằng chuyển dịch theo chiều ${target > 0 ? "thuận" : "nghịch"}?`;
      return {
        stem: `Cho cân bằng hóa học trong bình kín: ${eqTex(x)}; ${dHtex(x, r.chance(0.5))}. ${q}`,
        ...mcq(r, cap(right[0]), wr.map((m) => cap(m[0]))),
        explanation: `${cap(right[2])}. Các phương án khác: ${wr.map((m) => m[2]).join("; ")}.`,
      };
    },
  },
  {
    id: "h11-chat-dien-li", subject: S, grade: G, chapter: C1, topic: "Chất điện li mạnh, điện li yếu, không điện li",
    half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const ST = ["HCl", "HNO3", "H2SO4", "NaOH", "KOH", "NaCl", "KNO3", "Na2SO4", "NH4Cl", "Ba(OH)2", "CuSO4", "K2CO3"];
      const WK = ["CH3COOH", "HF", "H2S", "HNO2", "H2SO3", "H2CO3", "HClO"];
      const NO = ["C2H5OH", "C12H22O11", "C6H12O6", "CH3OH", "C3H5(OH)3"];
      const kinds: [string, string[], string][] = [["chất điện li mạnh", ST, "phân li hoàn toàn thành ion"], ["chất điện li yếu", WK, "chỉ phân li một phần thành ion"], ["chất không điện li", NO, "không phân li ra ion"]];
      const ki = r.int(0, 2); const [nm, list, why] = kinds[ki];
      const others = kinds.filter((_, i) => i !== ki).flatMap((k) => k[1]);
      const note = `Acid mạnh (HCl, $\\mathrm{HNO_3}$, $\\mathrm{H_2SO_4}$), base mạnh (NaOH, KOH, $\\mathrm{Ba(OH)_2}$) và hầu hết muối tan là chất điện li mạnh; acid yếu (như $\\mathrm{CH_3COOH}$, HF, $\\mathrm{H_2S}$, $\\mathrm{HNO_2}$) là chất điện li yếu; ethanol, saccharose, glucose, glycerol… không điện li.`;
      if (r.chance(0.5)) {
        const k = r.int(1, 4); const items = r.shuffle([...pickN(r, list, k), ...pickN(r, others, 6 - k)]);
        return {
          stem: `Cho dãy các chất: ${items.map(ch).join(", ")}. Số ${nm} trong dãy là`,
          ...mcq(r, String(k), near(k, 0, 6)),
          explanation: `${note} Các ${nm} trong dãy: ${items.filter((f) => list.includes(f)).map(ch).join(", ")} (${why}) – có ${k} chất.`,
        };
      }
      const right = r.pick(list); const wr = pickN(r, others, 3);
      const items = r.shuffle([right, ...wr]);
      return {
        stem: `Trong các chất ${items.map(ch).join(", ")}, chất nào là ${nm}?`,
        ...mcq(r, ch(right), wr.map(ch)),
        explanation: `${note} Vậy ${ch(right)} là ${nm} (${why}).`,
      };
    },
  },
  {
    id: "h11-ph-acid-base-manh", subject: S, grade: G, chapter: C1, topic: "pH của dung dịch acid, base mạnh",
    half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const [f, k, ac] = r.pick([["HCl", 1, 1], ["HNO3", 1, 1], ["H2SO4", 2, 1], ["NaOH", 1, -1], ["KOH", 1, -1], ["Ba(OH)2", 2, -1]] as [string, number, number][]);
      const n = r.int(1, 4);
      const C = k === 1 ? 10 ** -n : 5 * 10 ** -(n + 1);
      const pH = ac > 0 ? n : 14 - n;
      const ion = ac > 0 ? "[H^+]" : "[OH^-]";
      const step = `$${ion} = ${k === 2 ? "2 \\cdot " + tex(C, 6) : tex(C, 6)} = 10^{-${n}}$ M` + (ac > 0 ? ` nên pH $= ${n}$.` : `, pOH $= ${n}$ nên pH $= 14 - ${n} = ${pH}$.`);
      const cs = (x: number) => { if (x >= 1e-4) return `${dec(round(x, 8))} M`; const e = Math.floor(-lg(x) + 1e-9); const m = round(x * 10 ** (e + 1), 3); return Math.abs(x * 10 ** e - 1) < 1e-9 ? `$10^{-${e}}$ M` : `$${tex(m)} \\cdot 10^{-${e + 1}}$ M`; };
      if (r.chance(0.6)) {
        const raw = -lg(C);
        const wr = ac > 0 ? [14 - n, raw, n + 1, n - 1 > 0 ? n - 1 : n + 2] : [n, 14 - raw, pH - 1, pH + 1 <= 14 ? pH + 1 : 13 - n];
        return {
          stem: `Dung dịch ${ch(f)} ${vn(C, 6)} M có pH bằng (coi ${ch(f)} phân li hoàn toàn)`,
          ...mcq(r, vn(pH, 1), wr.map((x) => vn(x, 1))),
          explanation: step,
        };
      }
      const wr = [C === 10 ** -n ? 10 ** -(n + 1) : 10 ** -n, k === 2 ? 2 * 10 ** -n : 10 ** -(14 - n), 10 ** -(14 - n), k === 1 ? 10 ** -(n + 1) * 5 : 10 ** -(n + 1)];
      return {
        stem: `Một dung dịch ${ch(f)} có pH $= ${pH}$. Nồng độ mol của ${ch(f)} trong dung dịch là (coi ${ch(f)} phân li hoàn toàn)`,
        ...mcq(r, cs(C), wr.map(cs)),
        explanation: ac > 0
          ? `pH $= ${pH}$ nên $[H^+] = 10^{-${n}}$ M; ${k === 2 ? `$C_{\\mathrm{H_2SO_4}} = \\dfrac{[H^+]}{2} = ${tex(C, 6)}$ M.` : `$C = [H^+] = ${tex(C, 6)}$ M.`}`
          : `pH $= ${pH}$ nên pOH $= ${n}$, $[OH^-] = 10^{-${n}}$ M; ${k === 2 ? `$C_{\\mathrm{Ba(OH)_2}} = \\dfrac{[OH^-]}{2} = ${tex(C, 6)}$ M.` : `$C = [OH^-] = ${tex(C, 6)}$ M.`}`,
      };
    },
  },
  {
    id: "h11-moi-truong-ph", subject: S, grade: G, chapter: C1, topic: "pH và môi trường, chất chỉ thị",
    half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const O = {
        A: "môi trường acid, làm quỳ tím chuyển sang màu đỏ", B: "môi trường base, làm quỳ tím chuyển sang màu xanh",
        N: "môi trường trung tính, không làm đổi màu quỳ tím", X: "môi trường acid, làm quỳ tím chuyển sang màu xanh", Y: "môi trường base, làm quỳ tím chuyển sang màu đỏ",
      };
      const mode = r.int(0, 3); let stem = "", env: "A" | "B" | "N", why = "";
      if (mode === 0) {
        const p = r.pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 2.4, 3.5, 5.6, 7.4, 8.3, 10.5, 12.6]);
        env = p < 7 ? "A" : p > 7 ? "B" : "N"; stem = `Ở 25 °C, một dung dịch có pH $= ${tex(p)}$. Dung dịch đó có`;
        why = `Ở 25 °C: pH < 7 là môi trường acid (quỳ hóa đỏ), pH = 7 trung tính, pH > 7 là môi trường base (quỳ hóa xanh). Ở đây pH $= ${tex(p)}$.`;
      } else if (mode === 1) {
        const a = r.int(1, 13); env = a < 7 ? "A" : a > 7 ? "B" : "N";
        stem = `Ở 25 °C, một dung dịch có $[H^+] = 10^{-${a}}$ M. Dung dịch đó có`; why = `pH $= -\\lg[H^+] = ${a}$, so sánh với 7.`;
      } else if (mode === 2) {
        const b = r.int(1, 13); env = 14 - b < 7 ? "A" : 14 - b > 7 ? "B" : "N";
        stem = `Ở 25 °C, một dung dịch có $[OH^-] = 10^{-${b}}$ M. Dung dịch đó có`;
        why = `$[H^+] = \\dfrac{10^{-14}}{[OH^-]} = 10^{-${14 - b}}$ M nên pH $= ${14 - b}$, so sánh với 7.`;
      } else {
        const [nm, e] = r.pick([["dung dịch sodium chloride (NaCl)", "N"], ["giấm ăn (dung dịch acetic acid)", "A"], ["nước chanh", "A"], ["dung dịch ammonia", "B"], ["nước vôi trong (dung dịch $\\mathrm{Ca(OH)_2}$)", "B"], ["dung dịch potassium nitrate ($\\mathrm{KNO_3}$)", "N"], ["dung dịch nitric acid", "A"], ["dung dịch sodium hydroxide", "B"], ["dung dịch sulfuric acid loãng", "A"], ["dung dịch sodium carbonate ($\\mathrm{Na_2CO_3}$)", "B"]] as [string, "A" | "B" | "N"][]);
        env = e; stem = `Ở 25 °C, ${nm} có`;
        why = `${cap(nm)} có ${e === "A" ? "pH < 7" : e === "B" ? "pH > 7" : "pH = 7"}.`;
      }
      const all = ["A", "B", "N", "X", "Y"] as const;
      return { stem, ...mcq(r, O[env], all.filter((k) => k !== env).map((k) => O[k])), explanation: `${why} Vậy dung dịch có ${O[env]}.` };
    },
  },
  {
    id: "h11-bronsted-lowry", subject: S, grade: G, chapter: C1, topic: "Acid – base theo Brønsted – Lowry",
    half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const L: [string, string, string, string, string, string, string, string][] = [
        // A, B, C, D (A + B <=> C + D), acid thuận, base thuận, acid nghịch, base nghịch
        ["NH3", "H2O", "NH4^+", "OH^-", "H2O", "NH3", "NH4^+", "OH^-"],
        ["CH3COOH", "H2O", "CH3COO^-", "H3O^+", "CH3COOH", "H2O", "H3O^+", "CH3COO^-"],
        ["HF", "H2O", "F^-", "H3O^+", "HF", "H2O", "H3O^+", "F^-"],
        ["CO3^{2-}", "H2O", "HCO3^-", "OH^-", "H2O", "CO3^{2-}", "HCO3^-", "OH^-"],
        ["NH4^+", "H2O", "NH3", "H3O^+", "NH4^+", "H2O", "H3O^+", "NH3"],
        ["HCO3^-", "H2O", "H2CO3", "OH^-", "H2O", "HCO3^-", "H2CO3", "OH^-"],
        ["HCO3^-", "H2O", "CO3^{2-}", "H3O^+", "HCO3^-", "H2O", "H3O^+", "CO3^{2-}"],
        ["S^{2-}", "H2O", "HS^-", "OH^-", "H2O", "S^{2-}", "HS^-", "OH^-"],
        ["CH3COO^-", "H2O", "CH3COOH", "OH^-", "H2O", "CH3COO^-", "CH3COOH", "OH^-"],
        ["HNO2", "H2O", "NO2^-", "H3O^+", "HNO2", "H2O", "H3O^+", "NO2^-"],
      ];
      const x = r.pick(L);
      const k = r.int(0, 3);
      const role = ["acid trong phản ứng thuận", "base trong phản ứng thuận", "acid trong phản ứng nghịch", "base trong phản ứng nghịch"][k];
      const right = x[4 + k];
      const wr = x.slice(0, 4).filter((s) => s !== right);
      return {
        stem: `Theo thuyết Brønsted – Lowry, trong cân bằng $${mr(`${x[0]} + ${x[1]} <=> ${x[2]} + ${x[3]}`)}$, chất (hoặc ion) đóng vai trò ${role} là`,
        ...mcq(r, ch(right), wr.map(ch)),
        explanation: `Acid là chất cho $\\mathrm{H^+}$, base là chất nhận $\\mathrm{H^+}$. Chiều thuận: ${ch(x[4])} cho $\\mathrm{H^+}$ cho ${ch(x[5])} nên ${ch(x[4])} là acid, ${ch(x[5])} là base. Chiều nghịch: ${ch(x[6])} cho $\\mathrm{H^+}$ cho ${ch(x[7])} nên ${ch(x[6])} là acid, ${ch(x[7])} là base. Đáp án: ${ch(right)}.`,
      };
    },
  },
  {
    id: "h11-nitrogen-ammonia-li-thuyet", subject: S, grade: G, chapter: C2, topic: "Nitrogen, ammonia, muối ammonium",
    half: 1, level: 1, kind: "mcq",
    make: (r) => bank(r,
      ["khi nói về nitrogen và ammonia", "về đơn chất nitrogen, ammonia và muối ammonium", "khi tìm hiểu tính chất của ammonia và muối ammonium"],
      [
        `Ở nhiệt độ thường, ${ch("N2")} khá trơ về mặt hóa học do liên kết ba $\\mathrm{N\\equiv N}$ rất bền.`,
        "Nitrogen chiếm khoảng 78% thể tích không khí.",
        "Ammonia là chất khí không màu, mùi khai, tan rất nhiều trong nước.",
        "Dung dịch ammonia làm quỳ tím chuyển sang màu xanh.",
        `Trong phản ứng đốt cháy với oxygen, ${ch("NH3")} thể hiện tính khử.`,
        `Muối ammonium tác dụng với dung dịch kiềm khi đun nóng giải phóng khí ${ch("NH3")} có mùi khai.`,
        `Trong công nghiệp, ${ch("NH3")} được tổng hợp từ ${ch("N2")} và ${ch("H2")} theo quá trình Haber với xúc tác iron.`,
        "Hầu hết các muối ammonium đều dễ tan trong nước.",
        `Số oxi hóa của nitrogen trong ${ch("NH3")} là $-3$.`,
      ],
      [
        ["Nitrogen chiếm khoảng 21% thể tích không khí.", "nitrogen chiếm khoảng 78% thể tích không khí (21% là oxygen)"],
        [`Ở nhiệt độ thường, ${ch("N2")} hoạt động hóa học mạnh vì nitrogen có độ âm điện lớn.`, `${ch("N2")} khá trơ ở nhiệt độ thường do liên kết ba bền vững`],
        ["Dung dịch ammonia làm phenolphthalein chuyển sang màu đỏ cam.", "dung dịch ammonia có tính base, làm phenolphthalein chuyển sang màu hồng"],
        ["Ammonia hầu như không tan trong nước nên được thu bằng cách đẩy nước.", "ammonia tan rất nhiều trong nước"],
        [`Trong phản ứng với oxygen, ${ch("NH3")} thể hiện tính oxi hóa.`, `nitrogen trong ${ch("NH3")} có số oxi hóa thấp nhất ($-3$) nên ${ch("NH3")} thể hiện tính khử`],
        [`Để nhận biết ion ${ch("NH4^+")}, người ta dùng dung dịch ${ch("BaCl2")}.`, `ion ${ch("NH4^+")} được nhận biết bằng dung dịch kiềm (khí mùi khai làm quỳ ẩm hóa xanh)`],
        [`Số oxi hóa của nitrogen trong ${ch("NH3")} là $+3$.`, `nitrogen trong ${ch("NH3")} có số oxi hóa $-3$`],
        ["Phản ứng tổng hợp ammonia trong quá trình Haber là phản ứng một chiều.", "đó là phản ứng thuận nghịch"],
        ["Các muối ammonium đều bền với nhiệt, không bị phân hủy khi đun nóng.", "muối ammonium kém bền nhiệt, dễ bị nhiệt phân"],
      ]),
  },
  {
    id: "h11-sulfur-nitric-li-thuyet", subject: S, grade: G, chapter: C2, topic: "Nitric acid, sulfur, sulfuric acid",
    half: 1, level: 1, kind: "mcq",
    make: (r) => bank(r,
      ["khi nói về nitric acid và sulfuric acid", "về sulfur, các hợp chất của sulfur và nitric acid", "khi tìm hiểu về tính chất, ứng dụng và an toàn với các acid mạnh"],
      [
        `Kim loại Al, Fe bị thụ động hóa trong dung dịch ${ch("HNO3")} đặc, nguội.`,
        `Khi pha loãng ${ch("H2SO4")} đặc, phải rót từ từ acid vào nước và khuấy đều.`,
        `${ch("H2SO4")} đặc có tính háo nước, làm than hóa đường saccharose.`,
        `Khí ${ch("SO2")} là một trong những tác nhân chính gây ra mưa acid.`,
        `Để nhận biết ion ${ch("SO4^{2-}")}, dùng dung dịch chứa ion ${ch("Ba^{2+}")}, tạo kết tủa trắng ${ch("BaSO4")}.`,
        `Trong ${ch("HNO3")}, nitrogen có số oxi hóa $+5$ nên ${ch("HNO3")} có tính oxi hóa mạnh.`,
        "Đơn chất sulfur vừa có tính oxi hóa vừa có tính khử.",
        `Copper tác dụng với dung dịch ${ch("HNO3")} loãng giải phóng khí ${ch("NO")} không màu, hóa nâu trong không khí.`,
      ],
      [
        [`Khi pha loãng ${ch("H2SO4")} đặc, rót nhanh nước vào acid.`, "rót nước vào acid đặc làm nước sôi bùng, bắn acid ra ngoài; phải rót từ từ acid vào nước"],
        [`Iron tác dụng mạnh với ${ch("HNO3")} đặc, nguội giải phóng khí ${ch("NO2")}.`, `iron bị thụ động hóa trong ${ch("HNO3")} đặc, nguội`],
        [`Copper tác dụng với dung dịch ${ch("H2SO4")} loãng giải phóng khí ${ch("H2")}.`, `copper đứng sau hydrogen, không tác dụng với ${ch("H2SO4")} loãng`],
        [`${ch("BaSO4")} là kết tủa màu vàng.`, `${ch("BaSO4")} là kết tủa màu trắng`],
        [`Trong ${ch("SO2")}, sulfur có số oxi hóa $+6$ nên ${ch("SO2")} chỉ có tính oxi hóa.`, `sulfur trong ${ch("SO2")} có số oxi hóa $+4$ (trung gian) nên ${ch("SO2")} vừa có tính oxi hóa vừa có tính khử`],
        [`Khí ${ch("CH4")} là tác nhân chính gây ra mưa acid.`, `tác nhân chính gây mưa acid là ${ch("SO2")} và các oxide của nitrogen`],
        [`Dung dịch ${ch("HNO3")} tác dụng với kim loại luôn giải phóng khí ${ch("H2")}.`, `${ch("HNO3")} có tính oxi hóa mạnh, sản phẩm khử là các hợp chất của nitrogen (NO, ${ch("NO2")}…), không phải ${ch("H2")}`],
        ["Đơn chất sulfur chỉ có tính oxi hóa, không có tính khử.", `sulfur có số oxi hóa 0 (trung gian) nên còn có tính khử (ví dụ cháy trong oxygen tạo ${ch("SO2")})`],
      ]),
  },
  {
    id: "h11-so2-vai-tro", subject: S, grade: G, chapter: C2, topic: "Tính chất của sulfur dioxide",
    half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const K = "tính khử", O = "tính oxi hóa", A = "tính chất của oxide acid (số oxi hóa của S không đổi)";
      const RX2: [string, string, string][] = [
        ["SO2 + Br2 + 2H2O -> H2SO4 + 2HBr", K, "S tăng từ +4 lên +6"],
        ["2SO2 + O2 <=> 2SO3", K, "S tăng từ +4 lên +6"],
        ["SO2 + Cl2 + 2H2O -> H2SO4 + 2HCl", K, "S tăng từ +4 lên +6"],
        ["5SO2 + 2KMnO4 + 2H2O -> K2SO4 + 2MnSO4 + 2H2SO4", K, "S tăng từ +4 lên +6"],
        ["SO2 + 2H2S -> 3S + 2H2O", O, "S trong $\\mathrm{SO_2}$ giảm từ +4 xuống 0"],
        ["SO2 + 2Mg -> S + 2MgO", O, "S giảm từ +4 xuống 0"],
        ["SO2 + 2NaOH -> Na2SO3 + H2O", A, "S giữ nguyên số oxi hóa +4"],
        ["SO2 + CaO -> CaSO3", A, "S giữ nguyên số oxi hóa +4"],
        ["SO2 + H2O <=> H2SO3", A, "S giữ nguyên số oxi hóa +4"],
        ["SO2 + Ca(OH)2 -> CaSO3 + H2O", A, "S giữ nguyên số oxi hóa +4"],
      ];
      if (r.chance(0.6)) {
        const x = r.pick(RX2);
        return {
          stem: `Trong phản ứng $${mr(x[0])}$, ${ch("SO2")} thể hiện`,
          ...mcq(r, x[1], [K, O, A, "đồng thời tính oxi hóa và tính khử"].filter((s) => s !== x[1])),
          explanation: `Trong phản ứng này ${x[2]} nên ${ch("SO2")} thể hiện ${x[1]}.`,
        };
      }
      const t = r.pick([K, O, A]);
      const right = r.pick(RX2.filter((x) => x[1] === t)); const wr = pickN(r, RX2.filter((x) => x[1] !== t), 3);
      return {
        stem: `Phản ứng nào sau đây ${ch("SO2")} thể hiện ${t}?`,
        ...mcq(r, `$${mr(right[0])}$`, wr.map((x) => `$${mr(x[0])}$`)),
        explanation: `Đáp án $${mr(right[0])}$: ${right[2]}. Các phản ứng còn lại: ${wr.map((x) => `$${mr(x[0])}$ – ${x[1]}`).join("; ")}.`,
      };
    },
  },
  {
    id: "h11-kim-loai-hno3", subject: S, grade: G, chapter: C2, topic: "Kim loại tác dụng với HNO3 (bảo toàn electron)",
    half: 1, level: 3, kind: "mcq",
    make: (r) => {
      const opts: Record<string, string[]> = { Cu: ["NO", "NO2"], Fe: ["NO", "NO2"], Al: ["NO", "N2O", "N2"], Mg: ["NO", "N2O", "N2"], Zn: ["NO", "N2O"] };
      const me = r.pick(Object.keys(opts)); const g = r.pick(opts[me]);
      const { M, n, name } = METALS[me]; const e = GAS[g].e;
      const ng = r.pick([0.03, 0.05, 0.06, 0.1, 0.12, 0.15, 0.2, 0.25, 0.3]);
      const nm = ng * e / n; const m = nm * M;
      need(exact(m, 2) && exact(nm, 4));
      const V = ng * V0;
      const acid = g === "NO2" ? "đặc, nóng (dư)" : "loãng (dư)";
      const ctx = r.pick(["Hòa tan hoàn toàn", "Cho", "Một học sinh hòa tan hết"]);
      const ex = `Bảo toàn electron: $${n} \\cdot n_{\\mathrm{${me}}} = ${e} \\cdot n_{${mr(g)}}$; $n_{${mr(g)}} = \\dfrac{${tex(V, 4)}}{24{,}79} = ${tex(ng, 2)}$ mol nên $n_{\\mathrm{${me}}} = ${tex(nm, 4)}$ mol`;
      if (r.chance(0.55)) {
        const wr = [ng * M, ng * e * M, round(V / 22.4, 4) * e / n * M, ng * n / e * M].map((x) => vn(x, 2));
        return {
          stem: `${ctx} m gam ${name} (${me}) trong dung dịch ${ch("HNO3")} ${acid}, thu được ${vn(V, 4)} lít khí ${ch(g)} (sản phẩm khử duy nhất, ở đkc). Giá trị của m là ${ntk([me])}`,
          ...mcq(r, vn(m, 2), wr),
          explanation: `${ex}; m $= ${tex(nm, 4)} \\cdot ${M} = ${tex(m, 2)}$ gam.`,
        };
      }
      const wr = [ng * 22.4, nm * V0, nm * n * V0, nm * e / n * V0].map((x) => vn(x, 4));
      return {
        stem: `${ctx} ${vn(m, 2)} gam ${name} (${me}) trong dung dịch ${ch("HNO3")} ${acid}, thu được V lít khí ${ch(g)} (sản phẩm khử duy nhất, ở đkc). Giá trị của V là ${ntk([me])}`,
        ...mcq(r, vn(V, 4), wr),
        explanation: `$n_{\\mathrm{${me}}} = \\dfrac{${tex(m, 2)}}{${M}} = ${tex(nm, 4)}$ mol. Bảo toàn electron: $${n} \\cdot ${tex(nm, 4)} = ${e} \\cdot n_{${mr(g)}}$ nên $n_{${mr(g)}} = ${tex(ng, 2)}$ mol; V $= ${tex(ng, 2)} \\cdot 24{,}79 = ${tex(V, 4)}$ lít.`,
      };
    },
  },
  {
    id: "h11-sulfuric-acid-tinh-toan", subject: S, grade: G, chapter: C2, topic: "Tính toán với sulfuric acid",
    half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const mode = r.int(0, 3);
      if (mode === 0) {
        const V = r.pick([50, 100, 150, 200, 250]), C = r.pick([0.1, 0.2, 0.05, 0.4, 0.5]);
        const n = V * C / 1000; need(exact(n, 4));
        const m = n * 233;
        const wr = [n * 208, n * 233 * 1000, n * 98, n * 233 / 2].map((x) => vn(x, 2));
        return {
          stem: `Cho dung dịch ${ch("BaCl2")} dư vào ${V} mL dung dịch ${ch("H2SO4")} ${vn(C, 2)} M, thu được m gam kết tủa trắng. Giá trị của m là ${ntk(["H", "O", "S", "Cl", "Ba"])}`,
          ...mcq(r, vn(m, 2), wr),
          explanation: `$${mr("Ba^{2+} + SO4^{2-} -> BaSO4")}$; $n_{\\mathrm{BaSO_4}} = n_{\\mathrm{H_2SO_4}} = ${tex(V / 1000, 3)} \\cdot ${tex(C, 2)} = ${tex(n, 4)}$ mol; m $= ${tex(n, 4)} \\cdot 233 = ${tex(m, 2)}$ gam.`,
        };
      }
      if (mode === 1) {
        const me = r.pick(["Fe", "Mg", "Zn", "Al"]); const { M, name } = METALS[me];
        const v = me === "Al" ? 3 : 2;
        const nm = r.pick([0.1, 0.2, 0.05, 0.15, 0.3, 0.4]); const m = nm * M; const nH = nm * v / 2; need(exact(nH, 4));
        const V = nH * V0; need(exact(V, 4));
        const wr = [nH * 22.4, nm * V0, nm * 1.5 * V0, nm * 2 * V0, nm * 0.5 * V0].map((x) => vn(x, 4));
        return {
          stem: `Cho ${vn(m, 2)} gam ${name} (${me}) tác dụng hết với dung dịch ${ch("H2SO4")} loãng, dư, thu được V lít khí ${ch("H2")} (đkc). Giá trị của V là ${ntk([me])}`,
          ...mcq(r, vn(V, 4), wr),
          explanation: `$${mr(me === "Al" ? "2Al + 3H2SO4 -> Al2(SO4)3 + 3H2" : `${me} + H2SO4 -> ${me}SO4 + H2`)}$; $n_{\\mathrm{${me}}} = ${tex(nm, 2)}$ mol nên $n_{\\mathrm{H_2}} = ${tex(nH, 4)}$ mol; V $= ${tex(nH, 4)} \\cdot 24{,}79 = ${tex(V, 4)}$ lít.`,
        };
      }
      const me = mode === 2 ? "Cu" : "Fe"; const { M, name } = METALS[me];
      const nm = r.pick([0.1, 0.2, 0.05, 0.15, 0.3, 0.4]); const m = nm * M;
      const k = me === "Cu" ? 1 : 1.5; const ns = nm * k; need(exact(ns, 4));
      const V = ns * V0; need(exact(V, 4));
      const wr = [ns * 22.4, nm * (me === "Cu" ? 2 : 1) * V0, nm * (me === "Cu" ? 0.5 : 3) * V0, nm * 3 * V0].map((x) => vn(x, 4));
      return {
        stem: `Hòa tan hoàn toàn ${vn(m, 2)} gam ${name} (${me}) trong dung dịch ${ch("H2SO4")} đặc, nóng, dư, thu được V lít khí ${ch("SO2")} (sản phẩm khử duy nhất, ở đkc). Giá trị của V là ${ntk([me])}`,
        ...mcq(r, vn(V, 4), wr),
        explanation: `$${mr(me === "Cu" ? "Cu + 2H2SO4 -> CuSO4 + SO2 + 2H2O" : "2Fe + 6H2SO4 -> Fe2(SO4)3 + 3SO2 + 6H2O")}$ (bảo toàn electron: $${me === "Cu" ? 2 : 3} n_{\\mathrm{${me}}} = 2 n_{\\mathrm{SO_2}}$); $n_{\\mathrm{SO_2}} = ${tex(k, 1)} \\cdot ${tex(nm, 2)} = ${tex(ns, 4)}$ mol; V $= ${tex(V, 4)}$ lít.`,
      };
    },
  },
  {
    id: "h11-kc-tinh-toan", subject: S, grade: G, chapter: C1, topic: "Tính hằng số cân bằng từ số mol",
    half: 1, level: 3, kind: "mcq",
    make: (r) => {
      const fmt = (x: number) => (x < 1 ? vn(x, 3) : vn(x, 2));
      if (r.chance(0.5)) {
        const a = r.pick([0.2, 0.4, 0.5, 1, 1.2, 2]), b = r.pick([0.2, 0.4, 0.5, 1, 1.5, 2]);
        const x = round(Math.min(a, b) * r.pick([0.4, 0.5, 0.6, 0.75, 0.8, 0.9]), 3); need(x < Math.min(a, b) && exact(2 * x, 2));
        const V = r.pick([1, 2, 5, 10]);
        const K = 4 * x * x / ((a - x) * (b - x)); need(K >= 0.05 && K < 1000);
        const wr = [x * x / ((a - x) * (b - x)), 2 * x / ((a - x) * (b - x)), 4 * x * x / (a * b), 1 / K].map(fmt);
        return {
          stem: `Cho ${vn(a)} mol ${ch("H2")} và ${vn(b)} mol ${ch("I2")} vào bình kín dung tích ${V} lít rồi nung nóng đến nhiệt độ T: $${mr("H2(g) + I2(g) <=> 2HI(g)")}$. Khi hệ đạt trạng thái cân bằng, trong bình có ${vn(2 * x)} mol HI. Hằng số cân bằng $K_C$ của phản ứng ở T là`,
          ...mcq(r, fmt(K), wr),
          explanation: `Số mol $\\mathrm{H_2}$ (và $\\mathrm{I_2}$) đã phản ứng $= \\dfrac{${tex(2 * x)}}{2} = ${tex(x, 3)}$ mol. Cân bằng: $\\mathrm{H_2}$: ${vn(a - x, 3)} mol; $\\mathrm{I_2}$: ${vn(b - x, 3)} mol; HI: ${vn(2 * x)} mol. Vì tổng hệ số hai vế bằng nhau nên thể tích bị triệt tiêu: $K_C = \\dfrac{${tex(2 * x)}^2}{${tex(a - x, 3)} \\cdot ${tex(b - x, 3)}} \\approx ${fmt(K).replace(",", "{,}")}$.`,
        };
      }
      const a = r.pick([0.1, 0.2, 0.3, 0.4, 0.5, 1]); const x = round(a * r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]), 3); need(exact(x, 3));
      const V = r.pick([1, 2, 0.5]);
      const K = (2 * x / V) ** 2 / ((a - x) / V); need(K >= 0.005 && K < 1000);
      const wr = [2 * x / (a - x), 4 * x * x / (a - x), x * x / (V * (a - x)), 4 * x * x / (V * a), 1 / K].map(fmt);
      return {
        stem: `Cho ${vn(a)} mol ${ch("N2O4")} vào bình kín dung tích ${vn(V)} lít, giữ ở nhiệt độ T: $${mr("N2O4(g) <=> 2NO2(g)")}$. Khi hệ đạt trạng thái cân bằng, trong bình còn ${vn(a - x, 3)} mol ${ch("N2O4")}. Hằng số cân bằng $K_C$ của phản ứng ở T là`,
        ...mcq(r, fmt(K), wr),
        explanation: `$n_{\\mathrm{N_2O_4}}$ phản ứng $= ${tex(x, 3)}$ mol nên $n_{\\mathrm{NO_2}} = ${tex(2 * x, 3)}$ mol. $[\\mathrm{NO_2}] = ${tex(2 * x / V, 4)}$ M, $[\\mathrm{N_2O_4}] = ${tex((a - x) / V, 4)}$ M; $K_C = \\dfrac{[\\mathrm{NO_2}]^2}{[\\mathrm{N_2O_4}]} \\approx ${fmt(K).replace(",", "{,}")}$.`,
      };
    },
  },
  {
    id: "h11-phan-dam-phan-tram-n", subject: S, grade: G, chapter: C2, topic: "Muối ammonium, phân đạm – hàm lượng nitrogen",
    half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const F: [string, string][] = [["NH4NO3", "ammonium nitrate"], ["(NH4)2SO4", "ammonium sulfate"], ["NH4Cl", "ammonium chloride"], ["(NH2)2CO", "urea"], ["NH4HCO3", "ammonium hydrogencarbonate"], ["KNO3", "potassium nitrate"], ["Ca(NO3)2", "calcium nitrate"], ["NaNO3", "sodium nitrate"]];
      const pN = (f: string) => (atoms(f).N * 14 / molar(f)) * 100;
      if (r.chance(0.5)) {
        const [f, nm] = r.pick(F); const nN = atoms(f).N; const M = molar(f);
        const wr = [1, 2, 3].filter((k) => k !== nN).map((k) => vn(k * 14 / M * 100, 2));
        wr.push(vn(atoms(f).O ? atoms(f).O * 16 / M * 100 : atoms(f).H * 100 / M, 2), vn(nN * 14 / (M - 14) * 100, 2));
        return {
          stem: `Một loại phân đạm chứa ${nm} (${ch(f)}) nguyên chất. Phần trăm khối lượng nitrogen trong phân đạm này là ${ntk(elsOf([f]))}`,
          ...mcq(r, vn(pN(f), 2) + "%", wr.map((s) => s + "%")),
          explanation: `$M_{${mr(f)}} = ${tex(M)}$; %N $= \\dfrac{${nN} \\cdot 14}{${tex(M)}} \\cdot 100\\% \\approx ${tex(pN(f), 2)}\\%$.`,
        };
      }
      const four = pickN(r, F, 4); const hi = r.chance(0.6);
      const best = four.reduce((p, q) => ((hi ? pN(q[0]) > pN(p[0]) : pN(q[0]) < pN(p[0])) ? q : p));
      return {
        stem: `Trong các loại phân bón chứa chất nguyên chất sau, loại nào có hàm lượng nitrogen (tính theo khối lượng) ${hi ? "cao" : "thấp"} nhất? ${ntk(elsOf(four.map((x) => x[0])))}`,
        ...mcq(r, `${cap(best[1])} (${ch(best[0])})`, four.filter((x) => x !== best).map((x) => `${cap(x[1])} (${ch(x[0])})`)),
        explanation: four.map((x) => `${ch(x[0])}: ${vn(pN(x[0]), 2)}%`).join("; ") + `. Vậy ${best[1]} có hàm lượng nitrogen ${hi ? "cao" : "thấp"} nhất.`,
      };
    },
  },
  /* ======================= HALF 1 – TF ======================= */
  {
    id: "h11-tf-can-bang-le-chatelier", subject: S, grade: G, chapter: C1, topic: "Cân bằng hóa học và các yếu tố ảnh hưởng",
    half: 1, level: 2, kind: "tf",
    make: (r) => {
      const x0 = r.pick(RX.filter((x) => gasN(x.p) !== gasN(x.r)));
      const x = r.chance(0.25) ? rev(x0) : x0;
      const dn = gasN(x.p) - gasN(x.r);
      const s1 = r.chance(0.5);
      const kc = s1 ? kcTex(x.p, x.r) : r.pick([kcTex(x.r, x.p), kcTex(x.p, x.r, { solid: true }), kcTex(x.p, x.r, { noExp: true })]);
      need(s1 || kc !== kcTex(x.p, x.r));
      const tUp = r.chance(0.5); const tDir = (x.dH > 0) === tUp ? "thuận" : "nghịch";
      const s2 = r.chance(0.5); const tSay = s2 ? tDir : tDir === "thuận" ? "nghịch" : "thuận";
      const pDir = dn < 0 ? "thuận" : "nghịch"; const s3 = r.chance(0.5); const pSay = s3 ? pDir : pDir === "thuận" ? "nghịch" : "thuận";
      const s4 = r.chance(0.5);
      const st4 = s4 ? "Thêm chất xúc tác vào hệ không làm chuyển dịch cân bằng mà chỉ giúp hệ nhanh đạt tới trạng thái cân bằng." : r.pick(["Thêm chất xúc tác vào hệ làm cân bằng chuyển dịch theo chiều thuận, làm tăng hiệu suất phản ứng.", "Thêm chất xúc tác vào hệ làm tăng giá trị hằng số cân bằng $K_C$."]);
      return {
        stem: `Cho cân bằng hóa học trong bình kín: ${eqTex(x)}; ${dHtex(x, r.chance(0.5))}.`,
        ...tf([
          [`Biểu thức hằng số cân bằng của phản ứng là $K_C = ${kc}$.`, s1],
          [`Khi ${tUp ? "tăng" : "giảm"} nhiệt độ, cân bằng chuyển dịch theo chiều ${tSay}.`, s2],
          [`Khi tăng áp suất chung của hệ (nén bình), cân bằng chuyển dịch theo chiều ${pSay}.`, s3],
          [st4, s4],
        ]),
        explanation: `$K_C = ${kcTex(x.p, x.r)}$ (chất rắn không có mặt). Phản ứng thuận ${x.dH > 0 ? "thu" : "tỏa"} nhiệt nên ${tUp ? "tăng" : "giảm"} nhiệt độ làm cân bằng chuyển dịch theo chiều ${tDir}. Số mol khí vế phải ${dn > 0 ? "lớn" : "nhỏ"} hơn vế trái nên tăng áp suất làm cân bằng chuyển dịch theo chiều giảm số mol khí – chiều ${pDir}. Chất xúc tác không làm chuyển dịch cân bằng và không làm thay đổi $K_C$.`,
      };
    },
  },
  {
    id: "h11-tf-chuan-do-acid-base", subject: S, grade: G, chapter: C1, topic: "Chuẩn độ acid – base",
    half: 1, level: 3, kind: "tf",
    make: (r) => {
      const Va = r.pick([10, 20, 25]); const Cb = r.pick([0.1, 0.2]);
      const Vm = round(r.int(90, 150) / 10, 1);
      const vs = r.shuffle([Vm - 0.1, Vm, Vm + 0.1].map((v) => round(v, 1)));
      const Ca = Cb * Vm / Va; const pH = -lg(Ca);
      const s1 = r.chance(0.5), s2 = r.chance(0.5), s3 = r.chance(0.5), s4 = r.chance(0.5);
      const v2 = s2 ? Vm : round(Vm + r.pick([-0.1, 0.1, 0.2]), 1);
      const c3 = s3 ? Ca : Cb * Va / Vm;
      const p4 = s4 ? pH : -lg(Cb);
      need(s3 || Math.abs(c3 - Ca) > 0.001); need(s4 || Math.abs(p4 - pH) > 0.01);
      return {
        stem: `Để xác định nồng độ dung dịch HCl, một học sinh lấy ${Va},0 mL dung dịch HCl cho vào bình tam giác, thêm 2 – 3 giọt phenolphthalein rồi chuẩn độ bằng dung dịch NaOH ${vn(Cb, 3)} M. Thể tích dung dịch NaOH đã dùng trong 3 lần chuẩn độ lần lượt là ${vs.map((v) => vn(v, 1)).join(" mL; ")} mL.`,
        ...tf([
          [s1 ? "Kết thúc chuẩn độ khi dung dịch trong bình tam giác chuyển từ không màu sang màu hồng nhạt (bền khoảng 20 giây)." : "Kết thúc chuẩn độ khi dung dịch trong bình tam giác chuyển từ màu hồng sang không màu.", s1],
          [`Thể tích trung bình dung dịch NaOH đã dùng là ${vn(v2, 2)} mL.`, s2],
          [`Nồng độ mol của dung dịch HCl là ${vn(c3, 4)} M.`, s3],
          [`pH của dung dịch HCl ban đầu xấp xỉ bằng ${vn(p4, 2)}.`, s4],
        ]),
        explanation: `HCl ban đầu không màu với phenolphthalein; khi NaOH vừa dư 1 giọt dung dịch chuyển sang hồng nhạt. $V_{tb} = \\dfrac{${vs.map((v) => tex(v)).join(" + ")}}{3} = ${tex(Vm)}$ mL. $C_{\\mathrm{HCl}} = \\dfrac{${tex(Cb)} \\cdot ${tex(Vm)}}{${Va}} = ${tex(Ca, 4)}$ M; pH $= -\\lg ${tex(Ca, 4)} \\approx ${tex(pH, 2)}$.`,
      };
    },
  },
  {
    id: "h11-tf-ammonia-haber", subject: S, grade: G, chapter: C2, topic: "Ammonia và quá trình Haber",
    half: 1, level: 2, kind: "tf",
    make: (r) => {
      const m = r.pick([17, 34, 51, 68, 85, 102, 170]); const H = r.pick([20, 25, 40, 50, 60, 80]);
      const mN2 = m * 28 / 34 / (H / 100);
      const s1 = r.chance(0.5), s2 = r.chance(0.5), s3 = r.chance(0.5), s4 = r.chance(0.5);
      const val = s3 ? mN2 : m * 28 / 34 * (H / 100);
      return {
        stem: `Ammonia được sản xuất trong công nghiệp theo quá trình Haber: $${mr("N2(g) + 3H2(g) <=> 2NH3(g)")}$; $\\Delta_r H^\\circ_{298} = -92\\ \\mathrm{kJ}$, xúc tác iron, khoảng 400 – 450 °C, 150 – 200 bar. Một nhà máy cần sản xuất ${m} tấn ${ch("NH3")} với hiệu suất chuyển hóa ${H}% (tính theo ${ch("N2")}). ${ntk(["H", "N"])}`,
        ...tf([
          [s1 ? "Phản ứng tổng hợp ammonia là phản ứng tỏa nhiệt." : "Phản ứng tổng hợp ammonia là phản ứng thu nhiệt.", s1],
          [s2 ? "Thực hiện phản ứng ở áp suất cao giúp cân bằng chuyển dịch theo chiều tạo ammonia." : "Thực hiện phản ứng ở áp suất thấp giúp cân bằng chuyển dịch theo chiều tạo ammonia.", s2],
          [`Khối lượng ${ch("N2")} tối thiểu cần dùng là ${vn(val, 2)} tấn.`, s3],
          [s4 ? `Ammonia là nguyên liệu sản xuất nitric acid; trong giai đoạn đầu, ${ch("NH3")} bị oxi hóa bởi oxygen thành ${ch("NO")}.` : `Ammonia là nguyên liệu sản xuất nitric acid; trong giai đoạn đầu, ${ch("NH3")} đóng vai trò chất oxi hóa khi phản ứng với oxygen.`, s4],
        ]),
        explanation: `$\\Delta_r H^\\circ_{298} < 0$ nên phản ứng tỏa nhiệt. Vế trái 4 mol khí, vế phải 2 mol khí nên tăng áp suất làm cân bằng chuyển dịch theo chiều thuận. Theo phương trình 28 tấn $\\mathrm{N_2}$ tạo 34 tấn $\\mathrm{NH_3}$, nên $m_{\\mathrm{N_2}} = \\dfrac{${m} \\cdot 28}{34} : ${tex(H / 100)} \\approx ${tex(mN2, 2)}$ tấn. $\\mathrm{4NH_3 + 5O_2 \\rightarrow 4NO + 6H_2O}$: N tăng từ $-3$ lên $+2$, $\\mathrm{NH_3}$ là chất khử.`,
      };
    },
  },
  {
    id: "h11-tf-sulfuric-acid", subject: S, grade: G, chapter: C2, topic: "Sulfuric acid loãng và đặc",
    half: 1, level: 3, kind: "tf",
    make: (r) => {
      const n = r.pick([0.05, 0.06, 0.08, 0.1, 0.12, 0.15, 0.2, 0.25, 0.3, 0.4]); const m = n * 56;
      const intro = r.pick(["Sulfuric acid là hóa chất quan trọng hàng đầu trong công nghiệp.", "Một nhóm học sinh so sánh tính chất của sulfuric acid loãng và đặc.", "Tính chất hóa học của sulfuric acid phụ thuộc vào nồng độ của acid."]);
      const V1 = n * V0, V2 = 1.5 * n * V0; const mS = n / 2 * 400; need(exact(V2, 4));
      const s1 = r.chance(0.5), s2 = r.chance(0.5), s3 = r.chance(0.5), s4 = r.chance(0.5);
      return {
        stem: `${intro} Thí nghiệm 1: cho ${vn(m, 2)} gam iron (Fe) vào dung dịch ${ch("H2SO4")} loãng, dư. Thí nghiệm 2: cho ${vn(m, 2)} gam Fe vào dung dịch ${ch("H2SO4")} đặc, nóng, dư (khí ${ch("SO2")} là sản phẩm khử duy nhất). Các thể tích khí đo ở đkc. ${ntk(["O", "S", "Fe"])}`,
        ...tf([
          [s1 ? `Khi pha loãng ${ch("H2SO4")} đặc, phải rót từ từ acid vào nước và khuấy đều.` : `Khi pha loãng ${ch("H2SO4")} đặc, phải rót từ từ nước vào acid và khuấy đều.`, s1],
          [`Thể tích khí ${ch("H2")} thu được ở thí nghiệm 1 là ${vn(s2 ? V1 : V2, 4)} lít.`, s2],
          [`Thể tích khí thu được ở thí nghiệm 2 ${s3 ? "gấp 1,5 lần" : "bằng"} thể tích khí ở thí nghiệm 1.`, s3],
          [`Khối lượng muối thu được ở thí nghiệm 2 là ${vn(s4 ? mS : n * 152, 2)} gam.`, s4],
        ]),
        explanation: `Pha loãng: rót acid vào nước. TN1: $\\mathrm{Fe + H_2SO_4 \\rightarrow FeSO_4 + H_2}$, $n_{\\mathrm{H_2}} = n_{\\mathrm{Fe}} = ${tex(n)}$ mol, $V = ${tex(V1, 4)}$ lít. TN2: $\\mathrm{2Fe + 6H_2SO_4 \\rightarrow Fe_2(SO_4)_3 + 3SO_2 + 6H_2O}$, $n_{\\mathrm{SO_2}} = 1{,}5 n_{\\mathrm{Fe}}$ nên thể tích gấp 1,5 lần (${vn(V2, 4)} lít); $m_{\\mathrm{Fe_2(SO_4)_3}} = \\dfrac{${tex(n)}}{2} \\cdot 400 = ${tex(mS, 2)}$ gam.`,
      };
    },
  },
  /* ======================= HALF 1 – SHORT ======================= */
  {
    id: "h11-short-ph-dung-dich", subject: S, grade: G, chapter: C1, topic: "Tính pH dung dịch acid, base mạnh",
    half: 1, level: 1, kind: "short",
    make: (r) => {
      const [f, k, ac] = r.pick([["HCl", 1, 1], ["HNO3", 1, 1], ["H2SO4", 2, 1], ["NaOH", 1, -1], ["KOH", 1, -1], ["Ba(OH)2", 2, -1]] as [string, number, number][]);
      const C = r.pick([1, 2, 5, 1, 2.5]) * 10 ** -r.int(2, 4);
      const ion = k * C; const p = -lg(ion); const pH = ac > 0 ? p : 14 - p;
      const ctx = r.pick(["Tính pH của", "Một học sinh pha được", "Trong phòng thí nghiệm có"]);
      const stem = ctx === "Tính pH của" ? `Tính pH của dung dịch ${ch(f)} ${vn(C, 6)} M (coi ${ch(f)} phân li hoàn toàn; kết quả làm tròn đến hàng phần mười).`
        : `${ctx} dung dịch ${ch(f)} ${vn(C, 6)} M. Coi ${ch(f)} phân li hoàn toàn, pH của dung dịch này bằng bao nhiêu? (làm tròn kết quả đến hàng phần mười)`;
      return {
        stem, ...sh(pH, 1),
        explanation: ac > 0 ? `$[H^+] = ${k === 2 ? `2 \\cdot ${tex(C, 6)} = ` : ""}${tex(ion, 6)}$ M; pH $= -\\lg ${tex(ion, 6)} \\approx ${tex(pH, 1)}$.`
          : `$[OH^-] = ${k === 2 ? `2 \\cdot ${tex(C, 6)} = ` : ""}${tex(ion, 6)}$ M; pOH $= -\\lg ${tex(ion, 6)} \\approx ${tex(p, 2)}$; pH $= 14 - \\mathrm{pOH} \\approx ${tex(pH, 1)}$.`,
      };
    },
  },
  {
    id: "h11-short-ph-tron-dung-dich", subject: S, grade: G, chapter: C1, topic: "pH khi trộn dung dịch acid và base",
    half: 1, level: 3, kind: "short",
    make: (r) => {
      const [fa, ka] = r.pick([["HCl", 1], ["HNO3", 1], ["H2SO4", 2]] as [string, number][]);
      const [fb, kb] = r.pick([["NaOH", 1], ["KOH", 1], ["Ba(OH)2", 2]] as [string, number][]);
      const V1 = r.pick([50, 100, 150, 200, 250]), V2 = r.pick([50, 100, 150, 200, 250]);
      const C1 = r.pick([0.01, 0.02, 0.05, 0.1, 0.12, 0.15, 0.2]), C2 = r.pick([0.01, 0.02, 0.05, 0.1, 0.12, 0.15, 0.2]);
      const nH = ka * C1 * V1 / 1000, nOH = kb * C2 * V2 / 1000; const Vt = (V1 + V2) / 1000;
      need(Math.abs(nH - nOH) > 1e-6);
      const ex = Math.abs(nH - nOH) / Vt; need(ex <= 0.5 && ex >= 1e-4);
      const pH = nH > nOH ? -lg(ex) : 14 + lg(ex);
      return {
        stem: `Trộn ${V1} mL dung dịch ${ch(fa)} ${vn(C1, 3)} M với ${V2} mL dung dịch ${ch(fb)} ${vn(C2, 3)} M, thu được ${V1 + V2} mL dung dịch X. Tính pH của dung dịch X (coi các chất phân li hoàn toàn; kết quả làm tròn đến hàng phần mười).`,
        ...sh(pH, 1),
        explanation: `$n_{\\mathrm{H^+}} = ${ka === 2 ? "2 \\cdot " : ""}${tex(C1, 3)} \\cdot ${tex(V1 / 1000, 3)} = ${tex(nH, 5)}$ mol; $n_{\\mathrm{OH^-}} = ${kb === 2 ? "2 \\cdot " : ""}${tex(C2, 3)} \\cdot ${tex(V2 / 1000, 3)} = ${tex(nOH, 5)}$ mol. $\\mathrm{H^+ + OH^- \\rightarrow H_2O}$: dư ${nH > nOH ? "$\\mathrm{H^+}$" : "$\\mathrm{OH^-}$"} ${vn(Math.abs(nH - nOH), 5)} mol, nồng độ $= \\dfrac{${tex(Math.abs(nH - nOH), 5)}}{${tex(Vt, 2)}} \\approx ${tex(ex, 5)}$ M; ${nH > nOH ? `pH $= -\\lg ${tex(ex, 5)}$` : `pOH $= -\\lg ${tex(ex, 5)}$, pH = 14 − pOH`} $\\approx ${tex(pH, 1)}$.`,
      };
    },
  },
  {
    id: "h11-short-kc", subject: S, grade: G, chapter: C1, topic: "Hằng số cân bằng KC – tính toán",
    half: 1, level: 3, kind: "short",
    make: (r) => {
      const mode = r.int(0, 2);
      if (mode < 2) {
        const [rf, pf1, pf2] = mode === 0 ? ["N2O4", "NO2", ""] : ["PCl5", "PCl3", "Cl2"];
        const a = r.pick([0.1, 0.2, 0.3, 0.4, 0.5, 0.8, 1]); const x = round(a * r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6]), 3); need(exact(x, 3));
        const V = r.pick([1, 2, 0.5]);
        const K = mode === 0 ? (2 * x / V) ** 2 / ((a - x) / V) : (x / V) ** 2 / ((a - x) / V);
        need(K >= 0.05 && K < 100); const dp = K < 10 ? 2 : 1;
        const eq = mode === 0 ? "N2O4(g) <=> 2NO2(g)" : "PCl5(g) <=> PCl3(g) + Cl2(g)";
        const tell = r.chance(0.5) ? `trong bình còn ${vn(a - x, 3)} mol ${ch(rf)}` : `trong bình có ${vn(mode === 0 ? 2 * x : x, 3)} mol ${ch(pf1)}`;
        return {
          stem: `Cho ${vn(a)} mol ${ch(rf)} vào bình kín dung tích ${vn(V)} lít, giữ ở nhiệt độ T: $${mr(eq)}$. Khi hệ đạt trạng thái cân bằng, ${tell}. Tính hằng số cân bằng $K_C$ của phản ứng ở T (làm tròn kết quả đến hàng ${dp === 2 ? "phần trăm" : "phần mười"}).`,
          ...sh(K, dp),
          explanation: mode === 0
            ? `$\\mathrm{N_2O_4}$ phản ứng ${vn(x, 3)} mol, cân bằng: $\\mathrm{N_2O_4}$ ${vn(a - x, 3)} mol, $\\mathrm{NO_2}$ ${vn(2 * x, 3)} mol. $K_C = \\dfrac{(${tex(2 * x, 3)}/${tex(V)})^2}{${tex(a - x, 3)}/${tex(V)}} \\approx ${tex(K, dp)}$.`
            : `$\\mathrm{PCl_5}$ phản ứng ${vn(x, 3)} mol, cân bằng: $\\mathrm{PCl_5}$ ${vn(a - x, 3)} mol, $\\mathrm{PCl_3}$ và $\\mathrm{Cl_2}$ đều ${vn(x, 3)} mol. $K_C = \\dfrac{(${tex(x, 3)}/${tex(V)})^2}{${tex(a - x, 3)}/${tex(V)}} \\approx ${tex(K, dp)}$.` + (pf2 ? "" : ""),
        };
      }
      const a = r.int(1, 10) / 10, b = r.int(1, 10) / 10; const x = a * b / (a + b); need(exact(x, 2));
      const ask = r.pick(["CO2", "H2", "CO", "H2O"]);
      const val = ask === "CO" ? a - x : ask === "H2O" ? b - x : x;
      return {
        stem: `Cho cân bằng $${mr("CO(g) + H2O(g) <=> CO2(g) + H2(g)")}$ có $K_C = 1$ ở nhiệt độ T. Cho ${vn(a)} mol CO và ${vn(b)} mol hơi nước vào bình kín dung tích 1 lít rồi nung đến T. Khi hệ đạt cân bằng, số mol ${ch(ask)} trong bình là bao nhiêu? (làm tròn kết quả đến hàng phần trăm)`,
        ...sh(val, 2),
        explanation: `Gọi x là số mol CO phản ứng: $K_C = \\dfrac{x^2}{(${tex(a)} - x)(${tex(b)} - x)} = 1 \\Rightarrow x = \\dfrac{${tex(a)} \\cdot ${tex(b)}}{${tex(a)} + ${tex(b)}} = ${tex(x, 3)}$. Số mol ${ch(ask)} $= ${tex(val, 3)}$ mol.`,
      };
    },
  },
  {
    id: "h11-short-chuan-do", subject: S, grade: G, chapter: C1, topic: "Chuẩn độ acid – base: tính nồng độ",
    half: 1, level: 3, kind: "short",
    make: (r) => {
      const [fa, k, ctx] = r.pick([["HCl", 1, "dung dịch HCl"], ["HNO3", 1, "dung dịch nitric acid"], ["H2SO4", 2, "dung dịch sulfuric acid"], ["CH3COOH", 1, "giấm ăn (acetic acid)"]] as [string, number, string][]);
      const Va = r.pick([10, 20, 25]); const Cb = r.pick([0.1, 0.2, 0.5]); const Vb = round(r.int(80, 250) / 10, 1);
      const Ca = Cb * Vb / (k * Va);
      if (r.chance(0.6)) {
        return {
          stem: `Để xác định nồng độ của ${ctx}, người ta lấy ${Va},0 mL mẫu cho vào bình tam giác, thêm vài giọt phenolphthalein rồi chuẩn độ bằng dung dịch NaOH ${vn(Cb, 2)} M thì hết ${vn(Vb, 1)} mL. Nồng độ mol của ${ch(fa)} trong mẫu là bao nhiêu M? (làm tròn kết quả đến hàng phần trăm)`,
          ...sh(Ca, 2),
          explanation: `$${mr(k === 2 ? "H2SO4 + 2NaOH -> Na2SO4 + 2H2O" : fa === "CH3COOH" ? "CH3COOH + NaOH -> CH3COONa + H2O" : `${fa} + NaOH -> Na${fa.slice(1)} + H2O`)}$. $n_{\\mathrm{NaOH}} = ${tex(Cb)} \\cdot ${tex(Vb / 1000, 4)} = ${tex(Cb * Vb / 1000, 5)}$ mol; $C = \\dfrac{${tex(Cb * Vb / 1000, 5)}${k === 2 ? " : 2" : ""}}{${tex(Va / 1000, 3)}} \\approx ${tex(Ca, 2)}$ M.`,
        };
      }
      const Ca2 = r.pick([0.05, 0.08, 0.1, 0.12, 0.15, 0.2]); const Vb2 = k * Ca2 * Va / Cb; need(Vb2 >= 2 && Vb2 < 100);
      return {
        stem: `Chuẩn độ ${Va},0 mL ${ctx} ${vn(Ca2, 2)} M bằng dung dịch NaOH ${vn(Cb, 2)} M với chất chỉ thị phenolphthalein. Thể tích dung dịch NaOH cần dùng để đạt điểm tương đương là bao nhiêu mL? (làm tròn kết quả đến hàng phần mười)`,
        ...sh(Vb2, 1),
        explanation: `$n_{\\mathrm{NaOH}} = ${k === 2 ? "2 \\cdot " : ""}n_{${mr(fa)}} = ${k === 2 ? "2 \\cdot " : ""}${tex(Ca2)} \\cdot ${tex(Va / 1000, 3)} = ${tex(k * Ca2 * Va / 1000, 5)}$ mol; $V = \\dfrac{${tex(k * Ca2 * Va / 1000, 5)}}{${tex(Cb)}} = ${tex(Vb2 / 1000, 5)}$ L $\\approx ${tex(Vb2, 1)}$ mL.`,
      };
    },
  },
  {
    id: "h11-short-can-bang-hno3", subject: S, grade: G, chapter: C2, topic: "Cân bằng phản ứng kim loại với HNO3",
    half: 1, level: 3, kind: "short",
    make: (r) => {
      const me = r.pick(["Cu", "Mg", "Al", "Zn", "Fe"]); const { n, name } = METALS[me];
      const g = r.pick(me === "Cu" ? ["NO", "NO2"] : me === "Fe" ? ["NO", "NO2", "N2O"] : ["NO", "NO2", "N2O", "N2", "NH4NO3"]);
      const b = balHNO3(n, g);
      const salt = `${me}(NO3)${n}`;
      const ask = r.int(0, 2);
      const total = b.a + b.hno3 + b.a + b.b + b.h2o;
      const val = [total, b.hno3, b.ox][ask];
      const q = ["tổng hệ số (nguyên, tối giản) của các chất trong phương trình", `hệ số của ${ch("HNO3")}`, `số phân tử ${ch("HNO3")} đóng vai trò chất oxi hóa (bị khử)`][ask];
      return {
        stem: `Cho phản ứng của ${name} với nitric acid: $${mr(`${me} + HNO3 -> ${salt} + ${g} + H2O`)}$. Sau khi cân bằng với các hệ số nguyên, tối giản, ${q} là bao nhiêu?`,
        ...sh(val, 1),
        explanation: `Bảo toàn electron: $\\overset{0}{\\mathrm{${me}}} \\rightarrow \\overset{+${n}}{\\mathrm{${me}}} + ${n}e$; ${g === "NH4NO3" ? "$\\overset{+5}{\\mathrm{N}} + 8e \\rightarrow \\overset{-3}{\\mathrm{N}}$" : `$${cf(GAS[g].nN)}\\overset{+5}{\\mathrm{N}} + ${GAS[g].e}e \\rightarrow ${mr(g)}$`}. Phương trình: $${mr(`${cf(b.a)}${me} + ${b.hno3}HNO3 -> ${cf(b.a)}${salt} + ${cf(b.b)}${g} + ${cf(b.h2o)}H2O`)}$. Tổng hệ số ${total}; có ${b.ox} phân tử $\\mathrm{HNO_3}$ bị khử, còn lại tạo muối. Đáp án: ${val}.`,
      };
    },
  },

  /* ======================= HALF 2 – MCQ ======================= */
  {
    id: "h11-hop-chat-huu-co", subject: S, grade: G, chapter: C3, topic: "Hợp chất hữu cơ và vô cơ",
    half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const ORG = ["CH4", "C2H5OH", "CH3COOH", "C6H12O6", "C2H2", "CH3Cl", "C6H6", "CH3NH2", "HCOOH", "C2H4", "C3H8", "CH3CHO"];
      const INC = ["CO", "CO2", "Na2CO3", "CaCO3", "HCN", "NaHCO3", "CaC2", "KCN", "Al4C3", "H2CO3"];
      const NOC = ["H2SO4", "NaCl", "NH3", "HNO3", "KOH"];
      const note = "Hợp chất hữu cơ là hợp chất của carbon, trừ một số hợp chất như carbon monoxide, carbon dioxide, muối carbonate, cyanide, carbide…";
      const mode = r.int(0, 2);
      if (mode === 0) {
        const k = r.int(1, 5); const items = r.shuffle([...pickN(r, ORG, k), ...pickN(r, [...INC, ...NOC], 6 - k)]);
        return {
          stem: `Cho dãy các chất: ${items.map(ch).join(", ")}. Số hợp chất hữu cơ trong dãy là`,
          ...mcq(r, String(k), near(k, 0, 6)),
          explanation: `${note} Các hợp chất hữu cơ: ${items.filter((f) => ORG.includes(f)).map(ch).join(", ")} – có ${k} chất.`,
        };
      }
      if (mode === 1) {
        const right = r.pick(ORG); const wr = [...pickN(r, INC, 2), r.pick(NOC)];
        return { stem: `Cho các chất ${r.shuffle([right, ...wr]).map(ch).join(", ")}. Chất nào là hợp chất hữu cơ?`, ...mcq(r, ch(right), wr.map(ch)), explanation: `${note} Vậy ${ch(right)} là hợp chất hữu cơ.` };
      }
      const right = r.pick(INC); const wr = pickN(r, ORG, 3);
      return { stem: `Chất nào sau đây chứa carbon nhưng KHÔNG phải là hợp chất hữu cơ: ${r.shuffle([right, ...wr]).map(ch).join(", ")}?`, ...mcq(r, ch(right), wr.map(ch)), explanation: `${note} Vậy ${ch(right)} là hợp chất vô cơ, các chất còn lại là hợp chất hữu cơ.` };
    },
  },
  {
    id: "h11-hydrocarbon-dan-xuat", subject: S, grade: G, chapter: C3, topic: "Phân loại: hydrocarbon và dẫn xuất",
    half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const HCs = ["CH4", "C2H4", "C2H2", "C6H6", "C3H8", "C4H10", "C2H6", "C3H6"];
      const DX = ["C2H5OH", "CH3Cl", "CH3COOH", "CH3NH2", "C2H5Br", "CH3CHO", "C6H5OH", "CCl4", "CH3OCH3"];
      const isH = r.chance(0.5); const [A, B] = isH ? [HCs, DX] : [DX, HCs];
      const nm = isH ? "hydrocarbon" : "dẫn xuất của hydrocarbon";
      const note = "Hydrocarbon chỉ chứa C và H; dẫn xuất của hydrocarbon chứa thêm nguyên tố khác (O, N, halogen…).";
      if (r.chance(0.5)) {
        const k = r.int(1, 4); const items = r.shuffle([...pickN(r, A, k), ...pickN(r, B, 6 - k)]);
        return { stem: `Cho dãy các chất: ${items.map(ch).join(", ")}. Số ${nm} trong dãy là`, ...mcq(r, String(k), near(k, 0, 6)), explanation: `${note} Các ${nm}: ${items.filter((f) => A.includes(f)).map(ch).join(", ")} – có ${k} chất.` };
      }
      const right = r.pick(A); const wr = pickN(r, B, 3);
      return { stem: `Trong các chất ${r.shuffle([right, ...wr]).map(ch).join(", ")}, chất nào là ${nm}?`, ...mcq(r, ch(right), wr.map(ch)), explanation: `${note} Vậy ${ch(right)} là ${nm}.` };
    },
  },
  {
    id: "h11-nhom-chuc", subject: S, grade: G, chapter: C3, topic: "Nhóm chức và loại hợp chất hữu cơ",
    half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const K: [string, string, string[]][] = [
        ["alcohol", "-OH", ["CH3CH2OH", "CH3OH", "CH3CH2CH2OH"]],
        ["aldehyde", "-CHO", ["CH3CHO", "CH3CH2CHO", "HCHO"]],
        ["ketone", "-CO-", ["CH3COCH3", "CH3COCH2CH3"]],
        ["carboxylic acid", "-COOH", ["CH3COOH", "HCOOH", "CH3CH2COOH"]],
        ["ester", "-COO-", ["CH3COOCH3", "HCOOCH2CH3", "CH3COOCH2CH3"]],
        ["amine", "-NH2", ["CH3NH2", "CH3CH2NH2"]],
        ["ether", "-O-", ["CH3OCH3", "CH3CH2OCH2CH3"]],
      ];
      const i = r.int(0, K.length - 1); const [cls, grp, list] = K[i]; const oth = K.filter((_, j) => j !== i);
      const mode = r.int(0, 2);
      if (mode === 0) {
        const f = r.pick(list);
        return { stem: `Hợp chất hữu cơ có công thức cấu tạo thu gọn ${ch(f)} thuộc loại`, ...mcq(r, cls, pickN(r, oth, 3).map((x) => x[0])), explanation: `${ch(f)} chứa nhóm chức $${mr(grp)}$ nên thuộc loại ${cls}.` };
      }
      if (mode === 1) {
        return { stem: `Nhóm chức $${mr(grp)}$ là nhóm chức đặc trưng của loại hợp chất nào sau đây?`, ...mcq(r, cls, pickN(r, oth, 3).map((x) => x[0])), explanation: `Nhóm $${mr(grp)}$ đặc trưng cho ${cls}, ví dụ ${list.map(ch).join(", ")}.` };
      }
      const right = r.pick(list); const wo = pickN(r, oth, 3);
      return { stem: `Chất nào sau đây thuộc loại ${cls}?`, ...mcq(r, ch(right), wo.map((x) => ch(r.pick(x[2])))), explanation: `${cls.charAt(0).toUpperCase() + cls.slice(1)} chứa nhóm $${mr(grp)}$, đó là ${ch(right)}. Các chất khác thuộc loại ${wo.map((x) => x[0]).join(", ")}.` };
    },
  },
  {
    id: "h11-tach-tinh-che", subject: S, grade: G, chapter: C3, topic: "Phương pháp tách biệt và tinh chế",
    half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const Mth: Record<string, string> = {
        "chưng cất": "nhiệt độ sôi khác nhau", "chiết": "khả năng hòa tan khác nhau trong hai dung môi không trộn lẫn vào nhau",
        "kết tinh": "độ tan thay đổi theo nhiệt độ", "sắc kí cột": "khả năng bị hấp phụ khác nhau trên chất hấp phụ (pha tĩnh)",
      };
      const APP: [string, string][] = [
        ["nấu rượu: đun hỗn hợp tinh bột đã lên men, hơi bay lên được làm lạnh để thu rượu", "chưng cất"],
        ["tách tinh dầu sả bằng cách cho hơi nước đi qua lá sả rồi ngưng tụ hơi thoát ra", "chưng cất"],
        ["chế biến dầu mỏ thành xăng, dầu hỏa, dầu diesel theo các khoảng nhiệt độ sôi", "chưng cất"],
        ["làm đường cát từ nước mía: cô đặc nước mía rồi để nguội cho đường tách ra", "kết tinh"],
        ["tinh chế benzoic acid lẫn tạp chất bằng cách hòa tan vào nước nóng, lọc rồi để nguội", "kết tinh"],
        ["ngâm thảo dược trong rượu (ethanol) để hòa tan các hoạt chất vào rượu", "chiết"],
        ["tách lớp dầu ăn ra khỏi nước bằng phễu chiết", "chiết"],
        ["giã lá chàm, ngâm vào nước để lấy chất màu nhuộm vải", "chiết"],
        ["tách các chất màu trong lá cây khi cho dịch chiết đi qua cột chứa chất hấp phụ", "sắc kí cột"],
      ];
      const ms = Object.keys(Mth);
      const mode = r.int(0, 2);
      if (mode === 0) {
        const [a, m] = r.pick(APP);
        return { stem: `Hoạt động "${a}" là ứng dụng của phương pháp tách biệt và tinh chế nào?`, ...mcq(r, `Phương pháp ${m}`, ms.filter((x) => x !== m).map((x) => `Phương pháp ${x}`)), explanation: `Phương pháp ${m} dựa trên ${Mth[m]}; hoạt động trên áp dụng đúng nguyên tắc này.` };
      }
      const m = r.pick(ms);
      if (mode === 1) return { stem: `Phương pháp ${m} dùng để tách các chất dựa trên sự khác nhau về`, ...mcq(r, Mth[m], ms.filter((x) => x !== m).map((x) => Mth[x])), explanation: `Phương pháp ${m} dựa trên ${Mth[m]}.` };
      const right = r.pick(APP.filter((x) => x[1] === m)); const wr = pickN(r, APP.filter((x) => x[1] !== m), 3);
      return { stem: `Hoạt động nào sau đây ứng dụng phương pháp ${m}?`, ...mcq(r, cap(right[0]), wr.map((x) => cap(x[0]))), explanation: `${cap(right[0])}: dùng phương pháp ${m} (dựa trên ${Mth[m]}). Các hoạt động còn lại: ${wr.map((x) => x[1]).join(", ")}.` };
    },
  },
  {
    id: "h11-pho-ir", subject: S, grade: G, chapter: C3, topic: "Phổ hồng ngoại (IR) nhận biết nhóm chức",
    half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const cm = "$\\mathrm{cm^{-1}}$";
      const Gs: { k: string; list: [string, string][]; desc: () => string; band: string }[] = [
        { k: "alcohol", list: [["CH3CH2OH", "ethanol"], ["CH3OH", "methanol"], ["CH3CH2CH2OH", "propan-1-ol"], ["CH3CH(OH)CH3", "propan-2-ol"]], desc: () => `một peak hấp thụ rộng, mạnh ở khoảng ${r.pick([3320, 3350, 3380, 3400])} ${cm} và không có peak hấp thụ trong vùng 1650 – 1750 ${cm}`, band: `peak rộng của liên kết O–H alcohol (3200 – 3600 ${cm})` },
        { k: "carbonyl", list: [["CH3COCH3", "acetone"], ["CH3CHO", "ethanal"], ["CH3CH2CHO", "propanal"], ["CH3COCH2CH3", "butanone"]], desc: () => `peak hấp thụ mạnh ở khoảng ${r.pick([1715, 1720, 1725, 1730])} ${cm} và không có peak hấp thụ rộng trong vùng 2500 – 3600 ${cm}`, band: `peak của liên kết C=O (1670 – 1740 ${cm}), không có O–H` },
        { k: "carboxylic acid", list: [["CH3COOH", "acetic acid"], ["HCOOH", "formic acid"], ["CH3CH2COOH", "propanoic acid"]], desc: () => `peak hấp thụ rất rộng trong vùng 2500 – 3300 ${cm} và peak mạnh ở khoảng ${r.pick([1705, 1710, 1715])} ${cm}`, band: `peak rộng của O–H carboxylic acid (2500 – 3300 ${cm}) và peak C=O` },
        { k: "amine", list: [["CH3NH2", "methylamine"], ["CH3CH2NH2", "ethylamine"]], desc: () => `peak hấp thụ trung bình ở khoảng ${r.pick([3300, 3360, 3400, 3450])} ${cm} (liên kết N–H) và không có peak trong vùng 1650 – 1750 ${cm}`, band: `peak của liên kết N–H (3300 – 3500 ${cm})` },
      ];
      const i = r.int(0, 3); const g = Gs[i];
      if (r.chance(0.6)) {
        const [f, nm] = r.pick(g.list);
        const wr = Gs.filter((_, j) => j !== i).map((x) => r.pick(x.list)).map(([a, b]) => `${b} (${ch(a)})`);
        return { stem: `Phổ hồng ngoại (IR) của hợp chất hữu cơ X có ${g.desc()}. X có thể là chất nào sau đây?`, ...mcq(r, `${nm} (${ch(f)})`, wr), explanation: `Phổ IR của X có ${g.band}, đặc trưng cho ${g.k === "carbonyl" ? "hợp chất carbonyl (aldehyde, ketone)" : g.k}. Vậy X có thể là ${nm}.` };
      }
      const [f, nm] = r.pick(g.list);
      return { stem: `Trên phổ hồng ngoại (IR) của ${nm} (${ch(f)}), tín hiệu đặc trưng giúp nhận biết nhóm chức của chất này là`, ...mcq(r, g.band, Gs.filter((_, j) => j !== i).map((x) => x.band)), explanation: `${cap(nm)} thuộc loại ${g.k === "carbonyl" ? "hợp chất carbonyl" : g.k}, phổ IR có ${g.band}.` };
    },
  },
  {
    id: "h11-pho-ms-phan-tu-khoi", subject: S, grade: G, chapter: C3, topic: "Phổ khối lượng (MS) – phân tử khối",
    half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const P: [string, string][] = [["CH4", "methane"], ["C2H6", "ethane"], ["C3H8", "propane"], ["C4H10", "butane"], ["C2H4", "ethylene"], ["C2H2", "acetylene"], ["C6H6", "benzene"], ["CH3OH", "methanol"], ["C2H5OH", "ethanol"], ["CH3CHO", "ethanal"], ["CH3COCH3", "acetone"], ["CH3COOH", "acetic acid"], ["HCOOH", "formic acid"], ["CH3COOCH3", "methyl acetate"], ["CH3NH2", "methylamine"], ["CH3Cl", "chloromethane"], ["C6H12O6", "glucose"], ["C3H6", "propene"]];
      const x = r.pick(P); const M = molar(x[0]);
      const pool = r.shuffle(P.filter((y) => molar(y[0]) !== M)); const wr: [string, string][] = [];
      for (const y of pool) if (!wr.some((z) => molar(z[0]) === molar(y[0]))) { wr.push(y); if (wr.length === 3) break; }
      const all = [x, ...wr];
      return {
        stem: `Trên phổ khối lượng (MS) của hợp chất hữu cơ X, peak ion phân tử $[\\mathrm{M^+}]$ có giá trị m/z lớn nhất bằng ${vn(M)}. X có thể là chất nào sau đây? ${ntk(elsOf(all.map((y) => y[0])))}`,
        ...mcq(r, `${x[1]} (${ch(x[0])})`, wr.map((y) => `${y[1]} (${ch(y[0])})`)),
        explanation: `Peak ion phân tử cho biết $M_X = ${tex(M)}$. ${all.map((y) => `$M_{${mr(y[0])}} = ${tex(molar(y[0]))}$`).join("; ")}. Vậy X có thể là ${x[1]}.`,
      };
    },
  },
  {
    id: "h11-cong-thuc-don-gian-nhat", subject: S, grade: G, chapter: C3, topic: "Công thức đơn giản nhất và công thức phân tử",
    half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const P = ["C6H12O6", "C2H4O2", "C6H6", "C2H2", "C4H10", "C2H6", "C3H6", "C4H8O2", "C8H8", "C6H14", "C4H8", "C2H6O2", "C3H6O3", "C2H2O4", "C6H10O4", "C4H6"];
      const f = r.pick(P); const s = simplest(f); need(s !== f);
      if (r.chance(0.6)) {
        const a = atoms(f);
        const wr = [f, scale(s, 2) !== f ? scale(s, 2) : scale(s, 3), fml({ C: 1, H: Math.round(a.H / a.C), O: a.O ? 1 : 0 }), ...P.map(simplest).filter((x) => x !== s)];
        return { stem: `Công thức đơn giản nhất của hợp chất có công thức phân tử ${ch(f)} là`, ...mcq(r, ch(s), [...wr.slice(0, 3), ...r.shuffle(wr.slice(3))].map(ch)), explanation: `Công thức đơn giản nhất biểu thị tỉ lệ tối giản số nguyên tử các nguyên tố: chia các chỉ số của ${ch(f)} cho ước chung lớn nhất ta được ${ch(s)}.` };
      }
      const wr = r.shuffle(P.filter((x) => simplest(x) !== s)).slice(0, 3);
      return { stem: `Chất nào sau đây có công thức đơn giản nhất là ${ch(s)}?`, ...mcq(r, ch(f), wr.map(ch)), explanation: `${ch(f)} có tỉ lệ số nguyên tử tối giản là ${ch(s)}; các chất còn lại có công thức đơn giản nhất lần lượt là ${wr.map((x) => ch(simplest(x))).join(", ")}.` };
    },
  },
  {
    id: "h11-phan-tram-ra-ctpt", subject: S, grade: G, chapter: C3, topic: "Lập công thức phân tử từ phần trăm khối lượng",
    half: 2, level: 3, kind: "mcq",
    make: (r) => {
      const f = r.pick([...PCT, ...HC]); const a = atoms(f); const M = molar(f);
      const pC = a.C * 12 / M * 100, pH = a.H / M * 100, pO = (a.O || 0) * 16 / M * 100;
      const s = simplest(f);
      const wr = [...r.shuffle(sameM(M).filter((x) => x !== f && (a.O ? !!atoms(x).O : !atoms(x).O))), s !== f ? s : scale(s, 2), scale(s, M / molar(s) + 1), scale(s, M / molar(s) + 2)].filter((x) => x !== f && (x === s || valid(x)));
      const showO = a.O && r.chance(0.4);
      const comp = a.O ? (showO ? `phần trăm khối lượng carbon và oxygen lần lượt là ${vn(pC, 2)}% và ${vn(pO, 2)}%` : `phần trăm khối lượng carbon và hydrogen lần lượt là ${vn(pC, 2)}% và ${vn(pH, 2)}%`) : `phần trăm khối lượng carbon là ${vn(pC, 2)}%`;
      const ratioH = a.O && showO ? (100 - pC - pO) : pH;
      return {
        stem: `Hợp chất hữu cơ X ${a.O ? "chứa C, H, O" : "là hydrocarbon"} có ${comp}. Trên phổ khối lượng của X, peak ion phân tử có m/z = ${vn(M)}. Công thức phân tử của X là ${ntk(elsOf([f]))}`,
        ...mcq(r, ch(f), wr.map(ch)),
        explanation: `%H $= ${tex(ratioH, 2)}\\%$${a.O ? `, %O $= ${tex(pO, 2)}\\%$` : ""}. Tỉ lệ $C : H${a.O ? " : O" : ""} = \\dfrac{${tex(pC, 2)}}{12} : \\dfrac{${tex(ratioH, 2)}}{1}${a.O ? ` : \\dfrac{${tex(pO, 2)}}{16}` : ""} = ${atoms(s).C} : ${atoms(s).H}${a.O ? " : " + atoms(s).O : ""}$ nên công thức đơn giản nhất là ${ch(s)} (M = ${vn(molar(s))}). Vì $M_X = ${tex(M)}$ nên X là ${ch(f)}.`,
      };
    },
  },
  {
    id: "h11-dong-dang", subject: S, grade: G, chapter: C3, topic: "Đồng đẳng",
    half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const SER: [string, string[]][] = [
        ["alkane", ["CH4", "CH3CH3", "CH3CH2CH3", "CH3CH2CH2CH3"]],
        ["alkene", ["CH2=CH2", "CH2=CHCH3", "CH2=CHCH2CH3"]],
        ["alcohol no, đơn chức", ["CH3OH", "CH3CH2OH", "CH3CH2CH2OH"]],
        ["carboxylic acid no, đơn chức", ["HCOOH", "CH3COOH", "CH3CH2COOH"]],
        ["aldehyde no, đơn chức", ["HCHO", "CH3CHO", "CH3CH2CHO"]],
      ];
      const BAD: [string, string, string][] = [
        ["CH3CH2OH", "CH3OCH3", "là đồng phân (cùng công thức phân tử), không phải đồng đẳng"],
        ["CH3OH", "CH3OCH3", "hơn kém nhau nhóm $\\mathrm{CH_2}$ nhưng khác loại hợp chất (alcohol và ether)"],
        ["CH2=CH2", "CH3CH3", "hơn kém nhau $\\mathrm{H_2}$, không phải nhóm $\\mathrm{CH_2}$"],
        ["CH#CH", "CH2=CH2", "hơn kém nhau $\\mathrm{H_2}$ và khác loại"],
        ["CH3COOH", "HCOOCH3", "là đồng phân (cùng $\\mathrm{C_2H_4O_2}$)"],
        ["HCOOH", "CH3CHO", "khác loại hợp chất (acid và aldehyde)"],
        ["CH3CH2OH", "CH3COOH", "khác loại hợp chất (alcohol và acid)"],
        ["CH4", "CH3Cl", "khác loại (hydrocarbon và dẫn xuất halogen)"],
        ["CH3CH2CH3", "CH2=CHCH3", "khác dãy đồng đẳng (alkane và alkene)"],
        ["CH3CHO", "CH3COCH3", "khác loại (aldehyde và ketone)"],
      ];
      const [nm, list] = r.pick(SER);
      const [x, y] = pickN(r, list, 2);
      if (r.chance(0.5)) {
        const wr = pickN(r, BAD, 3);
        return { stem: "Cặp chất nào sau đây là đồng đẳng của nhau?", ...mcq(r, `${ch(x)} và ${ch(y)}`, wr.map((b) => `${ch(b[0])} và ${ch(b[1])}`)), explanation: `Đồng đẳng: cùng loại, cấu tạo tương tự, hơn kém nhau một hay nhiều nhóm $\\mathrm{CH_2}$. ${ch(x)} và ${ch(y)} cùng là ${nm}. Các cặp khác: ${wr.map((b) => `${ch(b[0])} và ${ch(b[1])} ${b[2]}`).join("; ")}.` };
      }
      const others = SER.filter((s) => s[0] !== nm).flatMap((s) => s[1]);
      const wr = pickN(r, others, 3);
      return { stem: `Chất nào sau đây là đồng đẳng của ${ch(x)}?`, ...mcq(r, ch(y), wr.map(ch)), explanation: `${ch(x)} và ${ch(y)} cùng là ${nm}, hơn kém nhau nhóm $\\mathrm{CH_2}$ nên là đồng đẳng. Các chất còn lại thuộc dãy đồng đẳng khác.` };
    },
  },
  {
    id: "h11-so-dong-phan", subject: S, grade: G, chapter: C3, topic: "Số đồng phân cấu tạo",
    half: 2, level: 3, kind: "mcq",
    make: (r) => {
      const x = r.pick(ISO);
      const wr = [x.n + 1, x.n - 1, x.n + 2, x.n - 2, x.n * 2].filter((k) => k > 0).map(String);
      return {
        stem: `Số ${x.q} ứng với công thức phân tử ${ch(x.f)} là`,
        ...mcq(r, String(x.n), wr),
        explanation: `Các ${x.q} của ${ch(x.f)}: ${x.l.map(ch).join("; ")}. Có ${x.n} đồng phân.`,
      };
    },
  },
  {
    id: "h11-thuyet-cau-tao", subject: S, grade: G, chapter: C3, topic: "Đặc điểm hợp chất hữu cơ, thuyết cấu tạo hóa học",
    half: 2, level: 1, kind: "mcq",
    make: (r) => bank(r,
      ["về đặc điểm của hợp chất hữu cơ", "theo thuyết cấu tạo hóa học", "khi nói về hợp chất hữu cơ, đồng đẳng và đồng phân"],
      [
        "Trong hợp chất hữu cơ, carbon luôn có hóa trị IV.",
        "Các nguyên tử carbon có thể liên kết với nhau tạo thành mạch hở (không nhánh, có nhánh) hoặc mạch vòng.",
        "Tính chất của hợp chất hữu cơ phụ thuộc vào thành phần phân tử và cấu tạo hóa học.",
        "Liên kết hóa học chủ yếu trong phân tử hợp chất hữu cơ là liên kết cộng hóa trị.",
        "Phần lớn hợp chất hữu cơ dễ cháy và kém bền với nhiệt.",
        "Phản ứng của hợp chất hữu cơ thường xảy ra chậm, không hoàn toàn và theo nhiều hướng khác nhau.",
        "Đồng phân là những hợp chất khác nhau nhưng có cùng công thức phân tử.",
        "Các chất đồng đẳng có thành phần phân tử hơn kém nhau một hay nhiều nhóm $\\mathrm{CH_2}$ và có tính chất hóa học tương tự nhau.",
      ],
      [
        ["Trong hợp chất hữu cơ, carbon có thể có hóa trị II hoặc IV.", "trong hợp chất hữu cơ carbon luôn có hóa trị IV"],
        ["Liên kết hóa học chủ yếu trong hợp chất hữu cơ là liên kết ion.", "liên kết chủ yếu là liên kết cộng hóa trị"],
        ["Phần lớn hợp chất hữu cơ tan tốt trong nước và khó cháy.", "phần lớn hợp chất hữu cơ ít tan trong nước, dễ cháy"],
        ["Phản ứng của hợp chất hữu cơ thường xảy ra nhanh và theo một hướng xác định.", "phản ứng hữu cơ thường chậm, theo nhiều hướng"],
        ["Các chất có cùng phân tử khối là đồng phân của nhau.", "đồng phân phải có cùng công thức phân tử (cùng M chưa đủ, ví dụ $\\mathrm{C_3H_8O}$ và $\\mathrm{C_2H_4O_2}$)"],
        ["Các chất có thành phần phân tử hơn kém nhau một nhóm $\\mathrm{CH_2}$ luôn là đồng đẳng của nhau.", "còn cần có cấu tạo và tính chất tương tự (ví dụ $\\mathrm{CH_3OH}$ và $\\mathrm{CH_3OCH_3}$ không là đồng đẳng)"],
        ["Các chất có cùng công thức đơn giản nhất thì có cùng công thức phân tử.", "ví dụ $\\mathrm{C_2H_2}$ và $\\mathrm{C_6H_6}$ cùng công thức đơn giản nhất CH nhưng khác công thức phân tử"],
        ["Tính chất của hợp chất hữu cơ chỉ phụ thuộc vào thành phần phân tử.", "tính chất còn phụ thuộc vào cấu tạo hóa học"],
        ["Phân tử hợp chất hữu cơ nhất thiết phải chứa carbon, hydrogen và oxygen.", "hợp chất hữu cơ bắt buộc chứa carbon; nhiều chất không có oxygen (như $\\mathrm{CH_4}$) hoặc không có hydrogen (như $\\mathrm{CCl_4}$)"],
      ]),
  },
  {
    id: "h11-loai-dong-phan", subject: S, grade: G, chapter: C3, topic: "Các loại đồng phân cấu tạo",
    half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const p = r.pick(PAIRS);
      if (r.chance(0.55)) {
        return {
          stem: `Hai chất ${p[1]} (${ch(p[0])}) và ${p[3]} (${ch(p[2])}) là đồng phân cấu tạo thuộc loại`,
          ...mcq(r, `đồng phân ${p[4]}`, ISOTYPE.filter((t) => t !== p[4]).map((t) => `đồng phân ${t}`)),
          explanation: `Hai chất cùng công thức phân tử ${ch(fml(atoms(p[0])))}; chúng khác nhau về ${p[4]} nên là đồng phân ${p[4]}.`,
        };
      }
      const t = p[4]; const others = ISOTYPE.filter((x) => x !== t).map((tt) => r.pick(PAIRS.filter((q) => q[4] === tt)));
      const show = (q: Pair) => `${ch(q[0])} và ${ch(q[2])}`;
      return {
        stem: `Cặp chất nào sau đây là đồng phân ${t} của nhau?`, ...mcq(r, show(p), others.map(show)),
        explanation: `${show(p)} khác nhau về ${t}. Các cặp còn lại: ${others.map((q) => `${show(q)} – đồng phân ${q[4]}`).join("; ")}.`,
      };
    },
  },

  /* ======================= HALF 2 – TF ======================= */
  {
    id: "h11-tf-dot-chay-ctpt", subject: S, grade: G, chapter: C3, topic: "Lập công thức phân tử từ phản ứng đốt cháy",
    half: 2, level: 3, kind: "tf",
    make: (r) => {
      const f = r.pick(["C2H6O", "C2H4O2", "C3H8O", "C3H6O", "C4H8O2", "C2H4O", "C3H6O2", "CH4O", "C4H10O", "C3H8", "C4H10", "C2H6", "C6H6", "C3H6O3"]);
      const a = atoms(f); const M = molar(f); const n = r.pick([0.05, 0.1, 0.15, 0.2]);
      const mX = n * M, mCO2 = n * a.C * 44, mH2O = n * a.H / 2 * 18; const mC = n * a.C * 12;
      need(exact(mX, 2) && exact(mH2O, 2));
      const hasO = !!a.O; const s = simplest(f);
      const s1 = r.chance(0.5), s2 = r.chance(0.5), s3 = r.chance(0.5), s4 = r.chance(0.5);
      const alt = r.shuffle(sameM(M).filter((x) => x !== f))[0] || scale(s, 2);
      const sW = s !== f ? f : scale(s, 2); need(valid(sW));
      need(s4 || alt !== f);
      return {
        stem: `Đốt cháy hoàn toàn ${vn(mX, 2)} gam chất hữu cơ X thu được ${vn(mCO2, 2)} gam ${ch("CO2")} và ${vn(mH2O, 2)} gam ${ch("H2O")}. Trên phổ khối lượng của X, peak ion phân tử có m/z = ${vn(M)}. ${ntk(["H", "C", "O"])}`,
        ...tf([
          [s1 === hasO ? "X có chứa nguyên tố oxygen." : "X là hydrocarbon (chỉ chứa C và H).", s1],
          [`Khối lượng carbon có trong ${vn(mX, 2)} gam X là ${vn(s2 ? mC : mH2O * 12 / 18, 2)} gam.`, s2 || Math.abs(mC - mH2O * 12 / 18) < 0.005],
          [`Công thức đơn giản nhất của X là ${ch(s3 ? s : sW)}.`, s3 || sW === s],
          [`Công thức phân tử của X là ${ch(s4 ? f : alt)}.`, s4],
        ]),
        explanation: `$n_{\\mathrm{C}} = n_{\\mathrm{CO_2}} = ${tex(n * a.C, 2)}$ mol ($m_C = ${tex(mC, 2)}$ g); $n_{\\mathrm{H}} = 2n_{\\mathrm{H_2O}} = ${tex(n * a.H, 2)}$ mol ($m_H = ${tex(n * a.H, 2)}$ g); $m_O = ${tex(mX, 2)} - ${tex(mC, 2)} - ${tex(n * a.H, 2)} = ${tex(mX - mC - n * a.H, 2)}$ g${hasO ? ` ($n_O = ${tex(n * a.O, 2)}$ mol)` : " nên X không chứa oxygen"}. Tỉ lệ cho công thức đơn giản nhất ${ch(s)}; $M_X = ${tex(M)}$ nên X là ${ch(f)}.`,
      };
    },
  },
  {
    id: "h11-tf-dong-phan-dong-dang", subject: S, grade: G, chapter: C3, topic: "Đồng phân, đồng đẳng, phổ IR",
    half: 2, level: 2, kind: "tf",
    make: (r) => {
      const p = r.pick(PAIRS); const F = fml(atoms(p[0])); const M = molar(p[0]);
      const s1 = r.chance(0.5), s2 = r.chance(0.5), s3 = r.chance(0.5), s4 = r.chance(0.5);
      const wrongF = scale(F, 1).replace(/H(\d+)/, (_, h) => `H${+h + 2}`);
      const wrongT = r.pick(ISOTYPE.filter((t) => t !== p[4]));
      const st4: [string, boolean] = p[4] === "nhóm chức"
        ? [s4 ? `Có thể dùng phổ IR để phân biệt ${p[1]} và ${p[3]} vì chúng có nhóm chức khác nhau.` : `Phổ IR của ${p[1]} và ${p[3]} hoàn toàn giống nhau vì chúng có cùng công thức phân tử.`, s4]
        : [s4 ? `${cap(p[1])} và ${p[3]} là hai chất khác nhau nên có thể có nhiệt độ sôi khác nhau.` : `${cap(p[1])} và ${p[3]} là đồng đẳng của nhau.`, s4];
      return {
        stem: `Cho hai chất hữu cơ: ${p[1]} (${ch(p[0])}) và ${p[3]} (${ch(p[2])}). ${ntk(elsOf([F]))}`,
        ...tf([
          [`Hai chất có cùng công thức phân tử ${ch(s1 ? F : wrongF)}.`, s1],
          [`Hai chất là đồng phân ${s2 ? p[4] : wrongT} của nhau.`, s2],
          [`Phân tử khối của hai chất đều bằng ${vn(s3 ? M : M + 2)}.`, s3],
          st4,
        ]),
        explanation: `Cả hai chất có công thức phân tử ${ch(F)} (M = ${vn(M)}) nhưng khác nhau về ${p[4]} nên là đồng phân ${p[4]}, không phải đồng đẳng. Đồng phân là các chất khác nhau nên tính chất vật lí (nhiệt độ sôi…) có thể khác nhau${p[4] === "nhóm chức" ? "; khác nhóm chức nên phổ IR khác nhau, dùng IR để phân biệt được" : ""}.`,
      };
    },
  },
  {
    id: "h11-tf-tach-tinh-che", subject: S, grade: G, chapter: C3, topic: "Tách biệt và tinh chế trong đời sống",
    half: 2, level: 1, kind: "tf",
    make: (r) => {
      const APP: [string, string, string][] = [
        ["nấu rượu: đun hỗn hợp tinh bột đã lên men, hơi bay lên được làm lạnh để thu rượu", "chưng cất", "ethanol có nhiệt độ sôi thấp hơn nước"],
        ["làm đường cát từ nước mía: cô đặc rồi để nguội cho đường tách ra", "kết tinh", "độ tan của đường giảm khi nhiệt độ giảm"],
        ["tách dầu ăn khỏi nước bằng phễu chiết", "chiết", "dầu và nước không tan vào nhau, tách thành hai lớp"],
        ["ngâm thảo dược trong rượu để lấy hoạt chất", "chiết", "hoạt chất tan tốt trong ethanol"],
        ["tách tinh dầu sả bằng hơi nước", "chưng cất", "tinh dầu bị hơi nước lôi cuốn rồi ngưng tụ"],
        ["tách các sắc tố trong lá cây qua cột chứa chất hấp phụ", "sắc kí cột", "các chất bị hấp phụ khác nhau nên di chuyển với tốc độ khác nhau"],
        ["giã lá chàm, ngâm nước lấy chất màu", "chiết", "chất màu tan trong nước được tách khỏi bã lá"],
        ["tinh chế benzoic acid bằng cách hòa tan trong nước nóng rồi để nguội", "kết tinh", "độ tan của benzoic acid tăng mạnh theo nhiệt độ"],
      ];
      const MS = ["chưng cất", "chiết", "kết tinh", "sắc kí cột"];
      const sel = pickN(r, APP, 4);
      const items: [string, boolean][] = sel.map((x, i) => { const ok = r.chance(0.5); return [`Hoạt động (${i + 1}) sử dụng phương pháp ${ok ? x[1] : r.pick(MS.filter((m) => m !== x[1]))}.`, ok]; });
      return {
        stem: `Một số hoạt động trong đời sống và sản xuất: ${sel.map((x, i) => `(${i + 1}) ${x[0]}`).join("; ")}.`,
        ...tf(items),
        explanation: sel.map((x, i) => `(${i + 1}) ${x[1]}: ${x[2]}`).join("; ") + ".",
      };
    },
  },

  /* ======================= HALF 2 – SHORT ======================= */
  {
    id: "h11-short-phan-tram-nguyen-to", subject: S, grade: G, chapter: C3, topic: "Phần trăm khối lượng nguyên tố",
    half: 2, level: 1, kind: "short",
    make: (r) => {
      const P: [string, string][] = [["C2H5OH", "ethanol"], ["CH3COOH", "acetic acid"], ["C6H12O6", "glucose"], ["CH3COCH3", "acetone"], ["CH3NH2", "methylamine"], ["C6H6", "benzene"], ["CH4", "methane"], ["C3H8", "propane"], ["CH3CHO", "ethanal"], ["HCOOH", "formic acid"], ["C2H5NH2", "ethylamine"], ["CH3OH", "methanol"], ["CH3COOC2H5", "ethyl acetate"], ["(NH2)2CO", "urea"]];
      const [f, nm] = r.pick(P); const a = atoms(f); const M = molar(f);
      const e = r.pick(Object.keys(a)); const p = a[e] * AM[e] / M * 100; need(p < 99.95);
      const ctx = r.pick([`${cap(nm)} (${ch(f)})`, `Hợp chất ${nm} có công thức ${ch(f)}`, `Một mẫu ${nm} tinh khiết (${ch(f)})`]);
      return {
        stem: `${ctx}. Phần trăm khối lượng của nguyên tố ${e} trong hợp chất này là bao nhiêu? (làm tròn kết quả đến hàng phần mười) ${ntk(elsOf([f]))}`,
        ...sh(p, 1),
        explanation: `$M = ${tex(M)}$; $\\%${e} = \\dfrac{${a[e]} \\cdot ${tex(AM[e])}}{${tex(M)}} \\cdot 100\\% \\approx ${tex(p, 1)}\\%$.`,
      };
    },
  },
  {
    id: "h11-short-ctpt-tu-phan-tram", subject: S, grade: G, chapter: C3, topic: "Lập công thức phân tử – số nguyên tử",
    half: 2, level: 3, kind: "short",
    make: (r) => {
      const f = r.pick([...PCT, ...HC]); const a = atoms(f); const M = molar(f);
      const pC = a.C * 12 / M * 100, pH = a.H / M * 100;
      const ask = r.int(0, 2); const tot = a.C + a.H + (a.O || 0);
      const val = [tot, a.H, a.C][ask]; const q = ["Tổng số nguyên tử trong một phân tử X", "Số nguyên tử hydrogen trong một phân tử X", "Số nguyên tử carbon trong một phân tử X"][ask];
      const s = simplest(f);
      return {
        stem: `Chất hữu cơ X (${a.O ? "chứa C, H, O" : "là hydrocarbon"}) có phần trăm khối lượng C và H lần lượt là ${vn(pC, 2)}% và ${vn(pH, 2)}%. Phổ khối lượng của X có peak ion phân tử ở m/z = ${vn(M)}. ${q} là bao nhiêu? ${ntk(elsOf([f]))}`,
        ...sh(val, 1),
        explanation: `${a.O ? `%O $= 100 - ${tex(pC, 2)} - ${tex(pH, 2)} = ${tex(100 - pC - pH, 2)}\\%$. ` : ""}$C : H${a.O ? " : O" : ""} = \\dfrac{${tex(pC, 2)}}{12} : \\dfrac{${tex(pH, 2)}}{1}${a.O ? ` : \\dfrac{${tex(100 - pC - pH, 2)}}{16}` : ""}$ $= ${atoms(s).C} : ${atoms(s).H}${a.O ? " : " + atoms(s).O : ""}$, công thức đơn giản nhất ${ch(s)}; M = ${vn(M)} nên X là ${ch(f)}. Đáp án: ${val}.`,
      };
    },
  },
  {
    id: "h11-short-dot-chay-hydrocarbon", subject: S, grade: G, chapter: C3, topic: "Đốt cháy hydrocarbon – công thức phân tử",
    half: 2, level: 3, kind: "short",
    make: (r) => {
      const f = r.pick(HC); const a = atoms(f); const M = molar(f);
      const n = r.pick([0.05, 0.1, 0.15, 0.2]);
      const V = n * a.C * V0, mH2O = n * a.H / 2 * 18; need(exact(mH2O, 2));
      const ask = r.int(0, 2); const val = [M, a.H, a.C][ask];
      const q = ["Phân tử khối của X là bao nhiêu?", "Số nguyên tử hydrogen trong một phân tử X là bao nhiêu?", "Số nguyên tử carbon trong một phân tử X là bao nhiêu?"][ask];
      return {
        stem: `Đốt cháy hoàn toàn ${vn(n)} mol hydrocarbon X thu được ${vn(V, 4)} lít khí ${ch("CO2")} (đkc) và ${vn(mH2O, 2)} gam ${ch("H2O")}. ${q} ${ntk(["H", "C", "O"])}`,
        ...sh(val, 1),
        explanation: `$n_{\\mathrm{CO_2}} = \\dfrac{${tex(V, 4)}}{24{,}79} = ${tex(n * a.C, 2)}$ mol; $n_{\\mathrm{H_2O}} = \\dfrac{${tex(mH2O, 2)}}{18} = ${tex(n * a.H / 2, 3)}$ mol. Số C $= \\dfrac{${tex(n * a.C, 2)}}{${tex(n)}} = ${a.C}$; số H $= \\dfrac{2 \\cdot ${tex(n * a.H / 2, 3)}}{${tex(n)}} = ${a.H}$. X là ${ch(f)}, M = ${M}.`,
      };
    },
  },
  {
    id: "h11-short-so-dong-phan", subject: S, grade: G, chapter: C3, topic: "Đếm số đồng phân cấu tạo",
    half: 2, level: 2, kind: "short",
    make: (r) => {
      const x = r.pick(ISO);
      const ctx = r.pick(["", `Chất X có công thức phân tử ${ch(x.f)}. `, `Một học sinh viết công thức cấu tạo các chất có công thức phân tử ${ch(x.f)}. `]);
      return {
        stem: ctx ? `${ctx}Có bao nhiêu ${x.q} ứng với công thức phân tử này?` : `Có bao nhiêu ${x.q} ứng với công thức phân tử ${ch(x.f)}?`,
        ...sh(x.n, 1),
        explanation: `${x.l.map(ch).join("; ")}. Có ${x.n} đồng phân.`,
      };
    },
  },
  {
    id: "h11-short-ctdgn-ra-ctpt", subject: S, grade: G, chapter: C3, topic: "Từ công thức đơn giản nhất và phổ MS đến công thức phân tử",
    half: 2, level: 2, kind: "short",
    make: (r) => {
      const f = r.pick(["C6H12O6", "C2H4O2", "C6H6", "C2H2", "C4H10", "C2H6", "C3H6", "C4H8O2", "C8H8", "C6H14", "C4H8", "C2H6O2", "C3H6O3", "C6H10O4", "C4H6", "C8H10"]);
      const s = simplest(f); need(s !== f); const M = molar(f); const a = atoms(f);
      const ask = r.int(0, 2); const tot = a.C + a.H + (a.O || 0);
      const val = [tot, a.H, a.C][ask]; const q = ["tổng số nguyên tử", "số nguyên tử hydrogen", "số nguyên tử carbon"][ask];
      return {
        stem: `Chất hữu cơ X có công thức đơn giản nhất là ${ch(s)}. Trên phổ khối lượng của X, peak ion phân tử có m/z = ${vn(M)}. Trong một phân tử X, ${q} là bao nhiêu? ${ntk(elsOf([f]))}`,
        ...sh(val, 1),
        explanation: `X có dạng $(${mr(s)})_n$ với $${tex(molar(s))}n = ${tex(M)} \\Rightarrow n = ${M / molar(s)}$. X là ${ch(f)}; ${q}: ${val}.`,
      };
    },
  },
];
