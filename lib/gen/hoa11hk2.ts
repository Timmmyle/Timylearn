/* Hóa học 11 – học kì 2 (Kết nối tri thức).
   half 1: Chương 4. Hydrocarbon.
   half 2: Chương 5. Dẫn xuất halogen – Alcohol – Phenol; Chương 6. Hợp chất carbonyl – Carboxylic acid. */
import { mcq, tf, short, vn, tex, need, gcd, round, type Template, type Rng } from "./core.ts";

const S = "Hóa học", G = 11 as const, HK = 2 as const;
const C4 = "Chương 4. Hydrocarbon";
const C5 = "Chương 5. Dẫn xuất halogen – Alcohol – Phenol";
const C6 = "Chương 6. Hợp chất carbonyl (Aldehyde – Ketone) – Carboxylic acid";
const K4 = "Hóa học|Hydrocarbon", K5 = "Hóa học|Alcohol – phenol", K6 = "Hóa học|Carbonyl – carboxylic acid";

/* ---------------- tiện ích hóa học ---------------- */
const fx = (s: string) =>
  s.replace(/<=>/g, " \\rightleftharpoons ").replace(/->/g, " \\rightarrow ").replace(/#/g, "\\equiv ").replace(/NaN/g, "Na{}N")
    .replace(/([A-Za-z)\]])(\d+)/g, "$1_{$2}");
const mr = (s: string) => `\\mathrm{${fx(s)}}`;
const ch = (s: string) => `$${mr(s)}$`;
const nf = (name: string, f: string) => `${name} (${ch(f)})`;
const AM: Record<string, number> = { H: 1, C: 12, N: 14, O: 16, Na: 23, Cl: 35.5, Br: 80, Ag: 108, Ca: 40, K: 39, S: 32 };
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
const ntk = (els: string[]) => `(Cho ${els.map((e) => `${e} = ${vn(AM[e])}`).join(", ")})`;
const pickN = <T,>(r: Rng, a: readonly T[], n: number): T[] => r.shuffle([...a]).slice(0, n);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const exact = (x: number, dp: number) => Math.abs(x * 10 ** dp - Math.round(x * 10 ** dp)) < 1e-6;
const V0 = 24.79;
/** phương án nhiễu cho câu đếm */
const nb = (k: number, lo: number, hi: number) => [k - 1, k + 1, k + 2, k - 2, k + 3, k - 3].filter((x) => x >= lo && x <= hi).map(String);
/** short() nhưng tránh số đúng nửa (…5) để làm tròn không mơ hồ */
const sh = (x: number, dp: number) => { const t = Math.abs(x * 10 ** dp) % 1; need(Math.abs(t - 0.5) > 1e-6); return short(x, dp); };
const far = (a: number, b: number, eps = 0.011) => Math.abs(a - b) > eps;
/** CxHy */
const hc = (c: number, h: number) => `C${c > 1 ? c : ""}H${h}`;

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
      stem, ...mcq(r, String(k), nb(k, 0, 5)),
      explanation: items.map((x, i) => `(${i + 1}) ${x[1] ? "đúng" : "sai: " + x[2]}`).join("; ") + `. Vậy có ${k} phát biểu đúng.`,
    };
  }
  if (r.chance(0.5)) {
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

/** Câu danh pháp: công thức → tên, hoặc tên → công thức */
type Nm = [string, string, string[]]; // công thức cấu tạo thu gọn, tên đúng, tên sai hay gặp
function naming(r: Rng, L: Nm[], what: string, rule: string) {
  const x = r.pick(L);
  if (r.chance(0.6)) {
    return {
      stem: `${cap(what)} X có công thức cấu tạo thu gọn ${ch(x[0])}. Tên của X theo danh pháp thay thế là`,
      ...mcq(r, x[1], x[2]),
      explanation: `${rule} Vậy X là ${x[1]}.`,
    };
  }
  const C = atoms(x[0]).C;
  const others = r.shuffle(L.filter((y) => y !== x));
  const pool = [...others.filter((y) => atoms(y[0]).C === C), ...others.filter((y) => atoms(y[0]).C !== C)];
  return {
    stem: `Công thức cấu tạo thu gọn của ${x[1]} là`,
    ...mcq(r, ch(x[0]), pool.map((y) => ch(y[0]))),
    explanation: `${rule} Vậy ${x[1]} có công thức ${ch(x[0])}; các công thức còn lại lần lượt là ${pool.slice(0, 3).map((y) => y[1]).join(", ")}.`,
  };
}

/* ---------------- dữ liệu hydrocarbon ---------------- */
const RULE_ANE = "Chọn mạch carbon dài nhất (có nhiều nhánh nhất) làm mạch chính, đánh số từ đầu gần nhánh hơn; tên = số chỉ vị trí nhánh – tên nhánh + tên mạch chính + ane.";
const ALKN: Nm[] = [
  ["CH3CH(CH3)CH3", "2-methylpropane", ["butane", "1-methylpropane", "2-methylbutane"]],
  ["CH3CH(CH3)CH2CH3", "2-methylbutane", ["3-methylbutane", "2-ethylpropane", "2-methylpentane"]],
  ["C(CH3)4", "2,2-dimethylpropane", ["1,1,1-trimethylethane", "2,2-dimethylbutane", "2-methylbutane"]],
  ["CH3CH(CH3)[CH2]2CH3", "2-methylpentane", ["4-methylpentane", "2-methylhexane", "1,1-dimethylbutane"]],
  ["CH3CH2CH(CH3)CH2CH3", "3-methylpentane", ["2-ethylbutane", "3-methylhexane", "2-methylpentane"]],
  ["CH3CH(CH3)CH(CH3)CH3", "2,3-dimethylbutane", ["2,3-dimethylpentane", "2,2-dimethylbutane", "1,2,3-trimethylpropane"]],
  ["CH3C(CH3)2CH2CH3", "2,2-dimethylbutane", ["3,3-dimethylbutane", "2,2-dimethylpropane", "2-ethyl-2-methylpropane"]],
  ["CH3CH(CH3)CH2CH(CH3)CH3", "2,4-dimethylpentane", ["2,4-dimethylhexane", "2,2-dimethylpentane", "1,1,3-trimethylbutane"]],
  ["CH3CH2CH(C2H5)CH2CH3", "3-ethylpentane", ["2-ethylpentane", "3-methylhexane", "3-ethylhexane"]],
  ["CH3C(CH3)2CH2CH(CH3)CH3", "2,2,4-trimethylpentane", ["2,4,4-trimethylpentane", "2,2,4-trimethylhexane", "2,4-dimethylhexane"]],
  ["CH3CH2CH(CH3)[CH2]2CH3", "3-methylhexane", ["4-methylhexane", "2-ethylpentane", "3-methylheptane"]],
  ["CH3CH2C(CH3)2CH2CH3", "3,3-dimethylpentane", ["2,2-diethylpropane", "3,3-dimethylhexane", "2,2-dimethylpentane"]],
];
const RULE_ENE = "Mạch chính là mạch carbon dài nhất chứa liên kết bội, đánh số từ đầu gần liên kết bội hơn; tên = vị trí nhánh – tên nhánh + tên mạch chính – vị trí liên kết bội – ene (hoặc yne).";
const ALKE: Nm[] = [
  ["CH2=CHCH3", "propene", ["prop-2-ene", "propane", "propyne"]],
  ["CH2=CHCH2CH3", "but-1-ene", ["but-3-ene", "but-2-ene", "but-1-yne"]],
  ["CH3CH=CHCH3", "but-2-ene", ["but-1-ene", "but-2-yne", "2-methylpropene"]],
  ["CH2=C(CH3)CH3", "2-methylpropene", ["but-1-ene", "2-methylprop-2-ene", "2-methylpropane"]],
  ["CH2=C(CH3)CH2CH3", "2-methylbut-1-ene", ["3-methylbut-3-ene", "2-ethylprop-1-ene", "2-methylbut-2-ene"]],
  ["CH3C(CH3)=CHCH3", "2-methylbut-2-ene", ["3-methylbut-2-ene", "2-methylbut-1-ene", "2-methylbutane"]],
  ["CH2=CHCH(CH3)CH3", "3-methylbut-1-ene", ["2-methylbut-3-ene", "3-methylbut-2-ene", "2-methylbut-1-ene"]],
  ["CH2=CH[CH2]2CH3", "pent-1-ene", ["pent-4-ene", "pent-2-ene", "pent-1-yne"]],
  ["CH3CH=CHCH2CH3", "pent-2-ene", ["pent-3-ene", "pent-1-ene", "pent-2-yne"]],
  ["CH#CCH3", "propyne", ["prop-2-yne", "propene", "propane"]],
  ["CH#CCH2CH3", "but-1-yne", ["but-3-yne", "but-2-yne", "but-1-ene"]],
  ["CH3C#CCH3", "but-2-yne", ["but-1-yne", "but-2-ene", "buta-1,3-diene"]],
  ["CH#CCH(CH3)CH3", "3-methylbut-1-yne", ["2-methylbut-3-yne", "3-methylbut-1-ene", "pent-1-yne"]],
  ["CH3C#CCH2CH3", "pent-2-yne", ["pent-3-yne", "pent-2-ene", "pent-1-yne"]],
];
const CT: [string, string, boolean][] = [
  ["but-2-ene", "CH3CH=CHCH3", true], ["pent-2-ene", "CH3CH=CHCH2CH3", true], ["hex-3-ene", "CH3CH2CH=CHCH2CH3", true],
  ["hex-2-ene", "CH3CH=CH[CH2]2CH3", true], ["3-methylpent-2-ene", "CH3CH=C(CH3)CH2CH3", true], ["4-methylpent-2-ene", "CH3CH=CHCH(CH3)2", true],
  ["ethylene", "CH2=CH2", false], ["propene", "CH2=CHCH3", false], ["but-1-ene", "CH2=CHCH2CH3", false], ["2-methylpropene", "CH2=C(CH3)2", false],
  ["2-methylbut-2-ene", "(CH3)2C=CHCH3", false], ["pent-1-ene", "CH2=CH[CH2]2CH3", false], ["2-methylbut-1-ene", "CH2=C(CH3)CH2CH3", false],
  ["2,3-dimethylbut-2-ene", "(CH3)2C=C(CH3)2", false],
];
type P = [string, string];
type MK = { a: P; reag: string; main: P; minor: P; w: P[] };
const MKV: MK[] = [
  { a: ["propene", "CH2=CHCH3"], reag: "HBr", main: ["2-bromopropane", "CH3CHBrCH3"], minor: ["1-bromopropane", "CH3CH2CH2Br"], w: [["1,2-dibromopropane", "CH2BrCHBrCH3"], ["3-bromopropene", "CH2=CHCH2Br"]] },
  { a: ["propene", "CH2=CHCH3"], reag: "H2O", main: ["propan-2-ol", "CH3CH(OH)CH3"], minor: ["propan-1-ol", "CH3CH2CH2OH"], w: [["propane-1,2-diol", "CH2(OH)CH(OH)CH3"], ["propanone", "CH3COCH3"]] },
  { a: ["propene", "CH2=CHCH3"], reag: "HCl", main: ["2-chloropropane", "CH3CHClCH3"], minor: ["1-chloropropane", "CH3CH2CH2Cl"], w: [["1,2-dichloropropane", "CH2ClCHClCH3"], ["3-chloropropene", "CH2=CHCH2Cl"]] },
  { a: ["but-1-ene", "CH2=CHCH2CH3"], reag: "HBr", main: ["2-bromobutane", "CH3CHBrCH2CH3"], minor: ["1-bromobutane", "CH3[CH2]3Br"], w: [["1,2-dibromobutane", "CH2BrCHBrCH2CH3"], ["3-bromobut-1-ene", "CH2=CHCHBrCH3"]] },
  { a: ["but-1-ene", "CH2=CHCH2CH3"], reag: "H2O", main: ["butan-2-ol", "CH3CH(OH)CH2CH3"], minor: ["butan-1-ol", "CH3[CH2]3OH"], w: [["butane-1,2-diol", "CH2(OH)CH(OH)CH2CH3"], ["butanone", "CH3COCH2CH3"]] },
  { a: ["2-methylpropene", "CH2=C(CH3)2"], reag: "HBr", main: ["2-bromo-2-methylpropane", "(CH3)3CBr"], minor: ["1-bromo-2-methylpropane", "(CH3)2CHCH2Br"], w: [["1,2-dibromo-2-methylpropane", "CH2BrCBr(CH3)2"], ["2-bromobutane", "CH3CHBrCH2CH3"]] },
  { a: ["2-methylpropene", "CH2=C(CH3)2"], reag: "H2O", main: ["2-methylpropan-2-ol", "(CH3)3COH"], minor: ["2-methylpropan-1-ol", "(CH3)2CHCH2OH"], w: [["butan-2-ol", "CH3CH(OH)CH2CH3"], ["2-methylpropane-1,2-diol", "CH2(OH)C(OH)(CH3)2"]] },
  { a: ["2-methylbut-2-ene", "(CH3)2C=CHCH3"], reag: "HCl", main: ["2-chloro-2-methylbutane", "(CH3)2CClCH2CH3"], minor: ["2-chloro-3-methylbutane", "(CH3)2CHCHClCH3"], w: [["2,3-dichloro-2-methylbutane", "(CH3)2CClCHClCH3"], ["1-chloro-2-methylbutane", "ClCH2CH(CH3)CH2CH3"]] },
  { a: ["2-methylbut-2-ene", "(CH3)2C=CHCH3"], reag: "H2O", main: ["2-methylbutan-2-ol", "(CH3)2C(OH)CH2CH3"], minor: ["3-methylbutan-2-ol", "(CH3)2CHCH(OH)CH3"], w: [["pentan-2-ol", "CH3CH(OH)[CH2]2CH3"], ["2-methylbutane-2,3-diol", "(CH3)2C(OH)CH(OH)CH3"]] },
  { a: ["2-methylbut-1-ene", "CH2=C(CH3)CH2CH3"], reag: "HBr", main: ["2-bromo-2-methylbutane", "(CH3)2CBrCH2CH3"], minor: ["1-bromo-2-methylbutane", "BrCH2CH(CH3)CH2CH3"], w: [["2-bromopentane", "CH3CHBr[CH2]2CH3"], ["1,2-dibromo-2-methylbutane", "CH2BrCBr(CH3)CH2CH3"]] },
];
const MC: [string, string, string, number][] = [
  ["ethane", "CH3CH3", "C2H6", 1], ["propane", "CH3CH2CH3", "C3H8", 2], ["butane", "CH3[CH2]2CH3", "C4H10", 2], ["2-methylpropane", "CH3CH(CH3)CH3", "C4H10", 2],
  ["pentane", "CH3[CH2]3CH3", "C5H12", 3], ["2-methylbutane", "CH3CH(CH3)CH2CH3", "C5H12", 4], ["2,2-dimethylpropane", "C(CH3)4", "C5H12", 1],
  ["hexane", "CH3[CH2]4CH3", "C6H14", 3], ["2-methylpentane", "CH3CH(CH3)[CH2]2CH3", "C6H14", 5], ["3-methylpentane", "CH3CH2CH(CH3)CH2CH3", "C6H14", 4],
  ["2,3-dimethylbutane", "CH3CH(CH3)CH(CH3)CH3", "C6H14", 2], ["2,2-dimethylbutane", "CH3C(CH3)2CH2CH3", "C6H14", 3],
];
const AGY: P[] = [["acetylene", "CH#CH"], ["propyne", "CH#CCH3"], ["but-1-yne", "CH#CCH2CH3"], ["3-methylbut-1-yne", "CH#CCH(CH3)2"], ["pent-1-yne", "CH#C[CH2]2CH3"]];
const AGN: P[] = [["but-2-yne", "CH3C#CCH3"], ["pent-2-yne", "CH3C#CCH2CH3"], ["ethylene", "CH2=CH2"], ["propene", "CH2=CHCH3"], ["ethane", "CH3CH3"], ["benzene", "C6H6"], ["toluene", "C6H5CH3"], ["but-1-ene", "CH2=CHCH2CH3"]];
/** alkyne → kết tủa với AgNO3/NH3: [tên, CT alkyne, CT kết tủa, M alkyne, M kết tủa] */
const AGP: [string, string, string, number, number][] = [
  ["acetylene", "C2H2", "AgC#CAg", 26, 240], ["propyne", "C3H4", "AgC#CCH3", 40, 147], ["but-1-yne", "C4H6", "AgC#CCH2CH3", 54, 161],
];

/* ---------------- dữ liệu dẫn xuất, alcohol, carbonyl ---------------- */
const ALCN: [string, string, number, string[]][] = [ // CT, tên, bậc (0: polyalcohol), tên sai
  ["CH3CH2CH2OH", "propan-1-ol", 1, ["propan-3-ol", "propan-2-ol", "propanal"]],
  ["CH3CH(OH)CH3", "propan-2-ol", 2, ["propan-1-ol", "propanone", "propane-1,2-diol"]],
  ["CH3[CH2]3OH", "butan-1-ol", 1, ["butan-4-ol", "butan-2-ol", "2-methylpropan-1-ol"]],
  ["CH3CH(OH)CH2CH3", "butan-2-ol", 2, ["butan-3-ol", "butan-1-ol", "2-methylpropan-2-ol"]],
  ["(CH3)2CHCH2OH", "2-methylpropan-1-ol", 1, ["2-methylpropan-3-ol", "butan-1-ol", "2-methylpropan-2-ol"]],
  ["(CH3)3COH", "2-methylpropan-2-ol", 3, ["1,1-dimethylethanol", "butan-2-ol", "2-methylpropan-1-ol"]],
  ["(CH3)2CHCH(OH)CH3", "3-methylbutan-2-ol", 2, ["2-methylbutan-3-ol", "pentan-2-ol", "2-methylbutan-2-ol"]],
  ["(CH3)2C(OH)CH2CH3", "2-methylbutan-2-ol", 3, ["3-methylbutan-3-ol", "2-methylbutan-3-ol", "pentan-2-ol"]],
  ["CH3CH2CH(OH)CH2CH3", "pentan-3-ol", 2, ["pentan-2-ol", "1-ethylpropan-1-ol", "3-methylbutan-2-ol"]],
  ["HOCH2CH2OH", "ethane-1,2-diol", 0, ["ethan-1,2-ol", "propane-1,2-diol", "ethanol"]],
  ["HOCH2CH(OH)CH2OH", "propane-1,2,3-triol", 0, ["propan-1,2,3-ol", "propane-1,2-diol", "ethane-1,2-diol"]],
  ["CH2=CHCH2OH", "prop-2-en-1-ol", 1, ["prop-1-en-3-ol", "propan-1-ol", "prop-2-en-1-al"]],
];
const RULE_OL = "Mạch chính là mạch carbon dài nhất chứa nhóm –OH, đánh số từ đầu gần nhóm –OH hơn; tên = vị trí nhánh – tên nhánh + tên hydrocarbon mạch chính (bỏ e) – vị trí nhóm OH – ol.";
const CARBN: Nm[] = [
  ["HCHO", "methanal", ["methanol", "ethanal", "methanoic acid"]],
  ["CH3CHO", "ethanal", ["ethanol", "ethanoic acid", "methanal"]],
  ["CH3CH2CHO", "propanal", ["propanol", "propanone", "propanoic acid"]],
  ["CH3COCH3", "propanone", ["propanal", "propan-2-ol", "propanoic acid"]],
  ["CH3COCH2CH3", "butanone", ["butan-3-one", "butanal", "butan-2-ol"]],
  ["CH3[CH2]2CHO", "butanal", ["butanone", "butan-1-ol", "2-methylpropanal"]],
  ["(CH3)2CHCHO", "2-methylpropanal", ["butanal", "2-methylpropan-1-ol", "2-methylpropanoic acid"]],
  ["CH3CO[CH2]2CH3", "pentan-2-one", ["pentan-4-one", "pentanal", "pentan-3-one"]],
  ["CH3CH2COCH2CH3", "pentan-3-one", ["pentan-2-one", "pentanal", "pentan-3-ol"]],
  ["HCOOH", "methanoic acid", ["methanal", "ethanoic acid", "methanol"]],
  ["CH3COOH", "ethanoic acid", ["ethanal", "methanoic acid", "propanoic acid"]],
  ["CH3CH2COOH", "propanoic acid", ["propanal", "ethanoic acid", "propan-1-ol"]],
  ["CH3[CH2]2COOH", "butanoic acid", ["butanal", "2-methylpropanoic acid", "propanoic acid"]],
  ["(CH3)2CHCOOH", "2-methylpropanoic acid", ["butanoic acid", "2-methylpropanal", "3-methylpropanoic acid"]],
  ["CH2=CHCOOH", "prop-2-enoic acid", ["propanoic acid", "prop-1-enoic acid", "prop-2-enal"]],
];
const RULE_CO = "Aldehyde: tên hydrocarbon mạch chính (tính cả C của nhóm –CHO, bỏ e) + al; ketone: tên mạch chính (bỏ e) – vị trí nhóm C=O – one; carboxylic acid: tên mạch chính (tính cả C của –COOH, bỏ e) + oic acid; đánh số từ C của nhóm chức (với ketone: từ đầu gần nhóm C=O hơn).";

export const TEMPLATES: Template[] = [
  /* =================================================================== */
  /* ======================= HALF 1 – HYDROCARBON – MCQ ================ */
  {
    id: "h11k2-alkane-danh-phap", subject: S, grade: G, chapter: C4, topic: "Danh pháp alkane",
    hk: HK, half: 1, tk: K4, level: 1, kind: "mcq",
    make: (r) => naming(r, ALKN, "alkane", RULE_ANE),
  },
  {
    id: "h11k2-cong-thuc-chung-hydrocarbon", subject: S, grade: G, chapter: C4, topic: "Công thức chung các dãy đồng đẳng hydrocarbon",
    hk: HK, half: 1, tk: K4, level: 1, kind: "mcq",
    make: (r) => {
      const SR: [string, string, string, number, number][] = [
        ["alkane", "C_nH_{2n+2}", "n \\ge 1", 1, 8], ["alkene", "C_nH_{2n}", "n \\ge 2", 2, 8],
        ["alkyne", "C_nH_{2n-2}", "n \\ge 2", 2, 8], ["arene (dãy đồng đẳng của benzene)", "C_nH_{2n-6}", "n \\ge 6", 6, 9],
      ];
      const H = (i: number, n: number) => [2 * n + 2, 2 * n, 2 * n - 2, 2 * n - 6][i];
      const gen = (i: number) => { const n = r.int(SR[i][3], SR[i][4]); return hc(n, H(i, n)); };
      const note = `Alkane: $${SR[0][1]}$; alkene: $${SR[1][1]}$; alkyne: $${SR[2][1]}$; arene dãy đồng đẳng benzene: $${SR[3][1]}$.`;
      const i = r.int(0, 3); const mode = r.int(0, 2);
      if (mode === 0) {
        return {
          stem: `Công thức chung của dãy đồng đẳng ${SR[i][0]} là`,
          ...mcq(r, `$\\mathrm{${SR[i][1]}}$ ($${SR[i][2]}$)`, SR.filter((_, j) => j !== i).map((s) => `$\\mathrm{${s[1]}}$ ($${s[2]}$)`)),
          explanation: note,
        };
      }
      if (mode === 1) {
        const f = gen(i);
        return {
          stem: `Hydrocarbon X có công thức phân tử ${ch(f)}, thuộc một trong các dãy đồng đẳng alkane, alkene, alkyne, arene (đồng đẳng của benzene). X thuộc dãy đồng đẳng`,
          ...mcq(r, SR[i][0], SR.filter((_, j) => j !== i).map((s) => s[0])),
          explanation: `${note} ${ch(f)} có dạng $\\mathrm{${SR[i][1]}}$ nên X là ${SR[i][0]}.`,
        };
      }
      const f = gen(i); const wr = [0, 1, 2, 3].filter((j) => j !== i).map((j) => gen(j));
      return {
        stem: `Chất nào sau đây thuộc dãy đồng đẳng ${SR[i][0]}?`,
        ...mcq(r, ch(f), wr.map(ch)),
        explanation: `${note} Chỉ ${ch(f)} có dạng $\\mathrm{${SR[i][1]}}$.`,
      };
    },
  },
  {
    id: "h11k2-alkane-li-thuyet", subject: S, grade: G, chapter: C4, topic: "Alkane: cấu tạo, tính chất, ứng dụng",
    hk: HK, half: 1, tk: K4, level: 1, kind: "mcq",
    make: (r) => bank(r,
      ["khi nói về alkane", "về cấu tạo và tính chất của alkane", "khi tìm hiểu về alkane và dầu mỏ"],
      [
        "Alkane là hydrocarbon no, mạch hở, trong phân tử chỉ có liên kết đơn.",
        "Ở điều kiện thường, các alkane từ $\\mathrm{C_1}$ đến $\\mathrm{C_4}$ ở thể khí.",
        "Alkane không tan trong nước và nhẹ hơn nước.",
        "Ở điều kiện thường, alkane tương đối trơ: không phản ứng với dung dịch acid, dung dịch kiềm và dung dịch thuốc tím.",
        `Khi chiếu sáng, methane phản ứng thế với chlorine tạo chloromethane và ${ch("HCl")}.`,
        "Reforming chuyển alkane mạch không nhánh thành alkane mạch nhánh và hydrocarbon mạch vòng, làm tăng chỉ số octane của xăng.",
        `Đốt cháy hoàn toàn alkane thu được số mol ${ch("H2O")} lớn hơn số mol ${ch("CO2")}.`,
        "Nhiệt độ sôi của các alkane mạch không nhánh tăng dần theo chiều tăng số nguyên tử carbon.",
      ],
      [
        [`Alkane làm mất màu dung dịch ${ch("KMnO4")} ở nhiệt độ thường.`, "ở điều kiện thường alkane không phản ứng với dung dịch thuốc tím"],
        ["Các alkane tan tốt trong nước.", "alkane là chất không phân cực, không tan trong nước"],
        ["Trong phân tử alkane có một liên kết đôi C=C.", "alkane chỉ chứa liên kết đơn"],
        [`Đốt cháy hoàn toàn alkane thu được số mol ${ch("CO2")} lớn hơn số mol ${ch("H2O")}.`, `với alkane $n_{\\mathrm{H_2O}} > n_{\\mathrm{CO_2}}$`],
        ["Ở điều kiện thường, pentane và hexane ở thể khí.", "pentane, hexane ở thể lỏng (chỉ $\\mathrm{C_1}$ – $\\mathrm{C_4}$ ở thể khí)"],
        ["Phản ứng đặc trưng của alkane là phản ứng cộng.", "phản ứng đặc trưng của alkane là phản ứng thế"],
        ["Nhiệt độ sôi của các alkane mạch không nhánh giảm dần khi số nguyên tử carbon tăng.", "nhiệt độ sôi tăng theo số nguyên tử carbon"],
        ["Cracking là quá trình chuyển alkane mạch không nhánh thành alkane mạch nhánh có cùng số nguyên tử carbon.", "cracking bẻ gãy phân tử alkane thành các phân tử nhỏ hơn; chuyển mạch không nhánh thành mạch nhánh là reforming"],
      ]),
  },
  {
    id: "h11k2-alkene-alkyne-danh-phap", subject: S, grade: G, chapter: C4, topic: "Danh pháp alkene, alkyne",
    hk: HK, half: 1, tk: K4, level: 1, kind: "mcq",
    make: (r) => naming(r, ALKE, "hydrocarbon", RULE_ENE),
  },
  {
    id: "h11k2-dong-phan-hinh-hoc", subject: S, grade: G, chapter: C4, topic: "Đồng phân hình học của alkene",
    hk: HK, half: 1, tk: K4, level: 2, kind: "mcq",
    make: (r) => {
      const yes = CT.filter((x) => x[2]), no = CT.filter((x) => !x[2]);
      const rule = "Alkene có đồng phân hình học khi mỗi nguyên tử carbon của liên kết đôi liên kết với hai nguyên tử hoặc nhóm nguyên tử khác nhau.";
      const mode = r.int(0, 2);
      if (mode === 0) {
        const x = r.pick(yes), wr = pickN(r, no, 3);
        return { stem: "Chất nào sau đây có đồng phân hình học (cis – trans)?", ...mcq(r, nf(x[0], x[1]), wr.map((y) => nf(y[0], y[1]))), explanation: `${rule} Chỉ ${x[0]} thỏa mãn; ${wr.map((y) => y[0]).join(", ")} có một carbon mang nối đôi liên kết với hai nhóm giống nhau.` };
      }
      if (mode === 1) {
        const x = r.pick(no), wr = pickN(r, yes, 3);
        return { stem: "Chất nào sau đây KHÔNG có đồng phân hình học (cis – trans)?", ...mcq(r, nf(x[0], x[1]), wr.map((y) => nf(y[0], y[1]))), explanation: `${rule} Trong ${x[0]} có nguyên tử carbon mang nối đôi liên kết với hai nhóm giống nhau nên không có đồng phân hình học; các chất còn lại đều có.` };
      }
      const k = r.int(1, 4); const items = r.shuffle([...pickN(r, yes, k), ...pickN(r, no, 5 - k)]);
      return {
        stem: `Cho các alkene: ${items.map((y) => nf(y[0], y[1])).join(", ")}. Số chất có đồng phân hình học là`,
        ...mcq(r, String(k), nb(k, 0, 5)),
        explanation: `${rule} Các chất có đồng phân hình học: ${items.filter((y) => y[2]).map((y) => y[0]).join(", ")}. Có ${k} chất.`,
      };
    },
  },
  {
    id: "h11k2-quy-tac-markovnikov", subject: S, grade: G, chapter: C4, topic: "Phản ứng cộng – quy tắc Markovnikov",
    hk: HK, half: 1, tk: K4, level: 2, kind: "mcq",
    make: (r) => {
      const x = r.pick(MKV);
      const reag = x.reag === "H2O" ? `${ch("H2O")} (xúc tác acid, đun nóng)` : ch(x.reag);
      const minorQ = r.chance(0.3);
      const [right, w0] = minorQ ? [x.minor, x.main] : [x.main, x.minor];
      return {
        stem: `Cho ${nf(x.a[0], x.a[1])} tác dụng với ${reag}. Theo quy tắc Markovnikov, sản phẩm ${minorQ ? "phụ" : "chính"} thu được là`,
        ...mcq(r, nf(right[0], right[1]), [w0, ...x.w].map((y) => nf(y[0], y[1]))),
        explanation: `Quy tắc Markovnikov: khi cộng HX (hoặc ${ch("H2O")}) vào alkene không đối xứng, nguyên tử H ưu tiên gắn vào carbon mang nối đôi có nhiều H hơn, còn X (hoặc OH) gắn vào carbon có ít H hơn. Sản phẩm chính: ${x.main[0]}; sản phẩm phụ: ${x.minor[0]}.`,
      };
    },
  },
  {
    id: "h11k2-the-chlorine-alkane", subject: S, grade: G, chapter: C4, topic: "Phản ứng thế halogen của alkane",
    hk: HK, half: 1, tk: K4, level: 2, kind: "mcq",
    make: (r) => {
      const x = r.pick(MC);
      const rule = "Số dẫn xuất monochloro (đồng phân cấu tạo) bằng số loại nguyên tử hydrogen không tương đương trong phân tử alkane.";
      if (r.chance(0.55)) {
        return {
          stem: `Cho ${nf(x[0], x[1])} tác dụng với ${ch("Cl2")} (chiếu sáng, tỉ lệ mol 1 : 1). Số dẫn xuất monochloro (đồng phân cấu tạo) tối đa thu được là`,
          ...mcq(r, String(x[3]), nb(x[3], 1, 7)),
          explanation: `${rule} ${cap(x[0])} có ${x[3]} loại nguyên tử H khác nhau nên tạo tối đa ${x[3]} dẫn xuất monochloro.`,
        };
      }
      const wr = pickN(r, MC.filter((y) => y[3] !== x[3]), 3);
      const k = x[3];
      return {
        stem: `Alkane nào sau đây khi tác dụng với ${ch("Cl2")} (chiếu sáng, tỉ lệ mol 1 : 1) tạo ${k === 1 ? "một dẫn xuất monochloro duy nhất" : `tối đa ${k} dẫn xuất monochloro (đồng phân cấu tạo)`}?`,
        ...mcq(r, nf(x[0], x[1]), wr.map((y) => nf(y[0], y[1]))),
        explanation: `${rule} ${cap(x[0])} tạo ${k}; ${wr.map((y) => `${y[0]} tạo ${y[3]}`).join("; ")}.`,
      };
    },
  },
  {
    id: "h11k2-alk-1-yne-agno3", subject: S, grade: G, chapter: C4, topic: "Phản ứng của alk-1-yne với AgNO3/NH3",
    hk: HK, half: 1, tk: K4, level: 1, kind: "mcq",
    make: (r) => {
      const rg = `dung dịch ${ch("AgNO3")} trong ${ch("NH3")}`;
      const rule = `Chỉ alkyne có liên kết ba ở đầu mạch (${ch("C#C-H")}, gồm acetylene và các alk-1-yne) mới tạo kết tủa vàng nhạt với ${rg}.`;
      const mode = r.int(0, 2);
      if (mode === 0) {
        const x = r.pick(AGY), wr = pickN(r, AGN, 3);
        return { stem: `Chất nào sau đây tác dụng với ${rg} tạo kết tủa?`, ...mcq(r, nf(x[0], x[1]), wr.map((y) => nf(y[0], y[1]))), explanation: `${rule} Vậy chọn ${x[0]}.` };
      }
      if (mode === 1) {
        const x = r.pick(AGN.slice(0, 2)), wr = pickN(r, AGY, 3);
        return { stem: `Alkyne nào sau đây KHÔNG tạo kết tủa khi tác dụng với ${rg}?`, ...mcq(r, nf(x[0], x[1]), wr.map((y) => nf(y[0], y[1]))), explanation: `${rule} ${cap(x[0])} có liên kết ba ở giữa mạch, không còn H gắn với carbon mang liên kết ba nên không phản ứng.` };
      }
      const k = r.int(1, 4); const items = r.shuffle([...pickN(r, AGY, k), ...pickN(r, AGN, 6 - k)]);
      return {
        stem: `Cho dãy các chất: ${items.map((y) => y[0]).join(", ")}. Số chất trong dãy tác dụng với ${rg} tạo kết tủa là`,
        ...mcq(r, String(k), nb(k, 0, 6)),
        explanation: `${rule} Các chất thỏa mãn: ${items.filter((y) => AGY.includes(y)).map((y) => y[0]).join(", ")} – có ${k} chất.`,
      };
    },
  },
  {
    id: "h11k2-arene-li-thuyet", subject: S, grade: G, chapter: C4, topic: "Arene: benzene, toluene, styrene",
    hk: HK, half: 1, tk: K4, level: 1, kind: "mcq",
    make: (r) => bank(r,
      ["khi nói về benzene và đồng đẳng", "về arene (hydrocarbon thơm)", "khi tìm hiểu tính chất của benzene, toluene và styrene"],
      [
        "Benzene là chất lỏng, không màu, không tan trong nước.",
        "Phân tử benzene có cấu tạo vòng sáu cạnh đều, các nguyên tử cùng nằm trên một mặt phẳng.",
        `Benzene tham gia phản ứng thế bromine (xúc tác ${ch("FeBr3")}) dễ hơn phản ứng cộng.`,
        `Toluene tham gia phản ứng nitro hóa (${ch("HNO3")} đặc, xúc tác ${ch("H2SO4")} đặc) dễ hơn benzene và ưu tiên thế ở vị trí ortho, para.`,
        `Khi đun nóng, toluene làm mất màu dung dịch ${ch("KMnO4")}.`,
        "Styrene làm mất màu dung dịch bromine ở điều kiện thường.",
        "Benzene là chất độc, có thể gây ung thư khi tiếp xúc lâu dài.",
        `Benzene cộng ${ch("H2")} (xúc tác Ni, đun nóng) tạo cyclohexane.`,
      ],
      [
        ["Benzene làm mất màu dung dịch bromine ở điều kiện thường.", "benzene không làm mất màu nước bromine; chỉ thế với bromine khan khi có xúc tác"],
        [`Benzene làm mất màu dung dịch ${ch("KMnO4")} ở nhiệt độ thường.`, "vòng benzene bền, không bị dung dịch thuốc tím oxi hóa"],
        ["Toluene tham gia phản ứng nitro hóa khó hơn benzene.", "nhóm methyl làm phản ứng thế vào vòng của toluene dễ hơn benzene"],
        ["Khi nitro hóa toluene, sản phẩm thế chủ yếu ở vị trí meta.", "nhóm methyl định hướng thế vào vị trí ortho và para"],
        ["Benzene tan tốt trong nước.", "benzene không tan trong nước"],
        ["Styrene không làm mất màu dung dịch bromine vì phân tử có vòng benzene.", "nhóm vinyl ($\\mathrm{CH=CH_2}$) của styrene cộng bromine như alkene"],
        ["Benzene không độc nên được dùng làm dung môi trong chế biến thực phẩm.", "benzene độc, có thể gây ung thư"],
        ["Trong phân tử benzene, các nguyên tử không cùng nằm trên một mặt phẳng.", "phân tử benzene phẳng"],
      ]),
  },
  {
    id: "h11k2-phan-biet-hydrocarbon", subject: S, grade: G, chapter: C4, topic: "Nhận biết, phân biệt các hydrocarbon",
    hk: HK, half: 1, tk: K4, level: 2, kind: "mcq",
    make: (r) => {
      const BR = "dung dịch bromine", AG = `dung dịch ${ch("AgNO3")} trong ${ch("NH3")}`, KM = `dung dịch ${ch("KMnO4")}, đun nóng`, KMc = `dung dịch ${ch("KMnO4")} ở nhiệt độ thường`;
      const GEN = ["dung dịch NaOH", "quỳ tím", "dung dịch HCl", `dung dịch ${ch("NaCl")}`];
      type Pr = [P, P, string, string, string[]];
      const L: Pr[] = [
        [["methane", "CH4"], ["ethylene", "CH2=CH2"], BR, "ethylene làm mất màu dung dịch bromine, methane thì không", [AG]],
        [["ethane", "CH3CH3"], ["ethylene", "CH2=CH2"], BR, "ethylene làm mất màu dung dịch bromine, ethane thì không", [AG]],
        [["propane", "CH3CH2CH3"], ["propene", "CH2=CHCH3"], BR, "propene làm mất màu dung dịch bromine, propane thì không", [AG]],
        [["acetylene", "CH#CH"], ["ethylene", "CH2=CH2"], AG, "acetylene tạo kết tủa vàng nhạt, ethylene thì không (cả hai đều làm mất màu nước bromine và thuốc tím)", [BR, KMc]],
        [["propyne", "CH#CCH3"], ["propene", "CH2=CHCH3"], AG, "propyne tạo kết tủa vàng nhạt, propene thì không (cả hai đều làm mất màu nước bromine)", [BR, KMc]],
        [["but-1-yne", "CH#CCH2CH3"], ["but-2-yne", "CH3C#CCH3"], AG, "but-1-yne có liên kết ba đầu mạch nên tạo kết tủa vàng nhạt, but-2-yne thì không", [BR, KMc]],
        [["benzene", "C6H6"], ["toluene", "C6H5CH3"], KM, "toluene làm mất màu thuốc tím khi đun nóng, benzene thì không (cả hai đều không làm mất màu nước bromine)", [BR, AG, KMc]],
        [["benzene", "C6H6"], ["styrene", "C6H5CH=CH2"], BR, "styrene làm mất màu nước bromine, benzene thì không", [AG]],
        [["benzene", "C6H6"], ["hex-1-ene", "CH2=CH[CH2]3CH3"], BR, "hex-1-ene làm mất màu nước bromine, benzene thì không", [AG]],
      ];
      const x = r.pick(L); const [A, B] = r.chance(0.5) ? [x[0], x[1]] : [x[1], x[0]];
      return {
        stem: `Thuốc thử dùng để phân biệt hai chất ${nf(A[0], A[1])} và ${nf(B[0], B[1])} là`,
        ...mcq(r, x[2], [...r.shuffle([...x[4]]), ...r.shuffle([...GEN])]),
        explanation: `Dùng ${x[2]}: ${x[3]}.`,
      };
    },
  },
  {
    id: "h11k2-ung-dung-hydrocarbon", subject: S, grade: G, chapter: C4, topic: "Ứng dụng của hydrocarbon",
    hk: HK, half: 1, tk: K4, level: 1, kind: "mcq",
    make: (r) => {
      const SUB: Record<string, string> = { acetylene: "C2H2", ethylene: "C2H4", propylene: "C3H6", methane: "CH4", toluene: "C6H5CH3", styrene: "C6H5CH=CH2", naphthalene: "C10H8", benzene: "C6H6", butane: "C4H10" };
      const APP: [string, string][] = [
        ["Khí được dùng trong đèn xì oxygen – acetylene để hàn, cắt kim loại là", "acetylene"],
        ["Chất khí được dùng để kích thích quả mau chín là", "ethylene"],
        ["Monomer dùng để sản xuất polyethylene (PE) là", "ethylene"],
        ["Monomer dùng để sản xuất polypropylene (PP) là", "propylene"],
        ["Thành phần chính của khí thiên nhiên và khí biogas là", "methane"],
        ["Nguyên liệu dùng để sản xuất thuốc nổ TNT là", "toluene"],
        ["Monomer dùng để sản xuất polystyrene (PS) là", "styrene"],
        ["Chất rắn màu trắng, dễ thăng hoa, được dùng làm băng phiến chống gián, mối mọt là", "naphthalene"],
        ["Chất lỏng là nguyên liệu để tổng hợp styrene, phenol và là dung môi trong công nghiệp (nhưng rất độc) là", "benzene"],
        ["Một thành phần của khí hóa lỏng (LPG) dùng làm nhiên liệu đun nấu là", "butane"],
      ];
      const [q, a] = r.pick(APP);
      const wr = pickN(r, Object.keys(SUB).filter((k) => k !== a && !(a === "ethylene" && k === "acetylene" && q.includes("chín"))), 3);
      return { stem: q, ...mcq(r, nf(a, SUB[a]), wr.map((k) => nf(k, SUB[k]))), explanation: `${q.replace(/ là$/, "")}: ${nf(a, SUB[a])}.` };
    },
  },
  {
    id: "h11k2-dot-chay-alkane", subject: S, grade: G, chapter: C4, topic: "Đốt cháy alkane – xác định công thức",
    hk: HK, half: 1, tk: K4, level: 3, kind: "mcq",
    make: (r) => {
      if (r.chance(0.5)) {
        const n = r.int(1, 6), a = r.pick([0.05, 0.1, 0.15, 0.2, 0.25]);
        const nC = a * n, nH = a * (n + 1); const V = nC * V0, m = nH * 18; need(exact(V, 4) && exact(m, 2));
        const wr = [hc(n + 1, 2 * n + 4), n > 1 ? hc(n - 1, 2 * n) : hc(n + 2, 2 * n + 6), hc(n + 2, 2 * n + 6), hc(Math.max(n, 2), 2 * Math.max(n, 2))];
        return {
          stem: `Đốt cháy hoàn toàn một alkane X thu được ${vn(V, 4)} lít khí ${ch("CO2")} (đkc) và ${vn(m, 2)} gam ${ch("H2O")}. Công thức phân tử của X là ${ntk(["H", "C", "O"])}`,
          ...mcq(r, ch(hc(n, 2 * n + 2)), wr.map(ch)),
          explanation: `$n_{\\mathrm{CO_2}} = \\dfrac{${tex(V, 4)}}{24{,}79} = ${tex(nC, 2)}$ mol; $n_{\\mathrm{H_2O}} = \\dfrac{${tex(m, 2)}}{18} = ${tex(nH, 2)}$ mol. Với alkane: $n_X = n_{\\mathrm{H_2O}} - n_{\\mathrm{CO_2}} = ${tex(a, 2)}$ mol; số C $= \\dfrac{${tex(nC, 2)}}{${tex(a, 2)}} = ${n}$. X là ${ch(hc(n, 2 * n + 2))}.`,
        };
      }
      const n = r.int(1, 4), a = r.pick([0.05, 0.1, 0.15, 0.2]), b = r.pick([0.05, 0.1, 0.15, 0.2]);
      const nC = a * n + b * (n + 1), nH = a * (n + 1) + b * (n + 2); const V = nC * V0, m = nH * 18; need(exact(V, 4) && exact(m, 2));
      const pair = (k: number) => `${ch(hc(k, 2 * k + 2))} và ${ch(hc(k + 1, 2 * k + 4))}`;
      const avg = nC / (a + b);
      return {
        stem: `Đốt cháy hoàn toàn hỗn hợp X gồm hai alkane kế tiếp nhau trong dãy đồng đẳng, thu được ${vn(V, 4)} lít khí ${ch("CO2")} (đkc) và ${vn(m, 2)} gam ${ch("H2O")}. Hai alkane trong X là ${ntk(["H", "C", "O"])}`,
        ...mcq(r, pair(n), [1, 2, 3, 4, 5].filter((k) => k !== n).map(pair)),
        explanation: `$n_{\\mathrm{CO_2}} = ${tex(nC, 2)}$ mol; $n_{\\mathrm{H_2O}} = ${tex(nH, 2)}$ mol; $n_X = n_{\\mathrm{H_2O}} - n_{\\mathrm{CO_2}} = ${tex(a + b, 2)}$ mol. Số C trung bình $= \\dfrac{${tex(nC, 2)}}{${tex(a + b, 2)}} \\approx ${tex(avg, 2)}$, nằm giữa ${n} và ${n + 1}, nên hai alkane là ${pair(n)}.`,
      };
    },
  },
  {
    id: "h11k2-alkene-cong-bromine", subject: S, grade: G, chapter: C4, topic: "Alkene cộng bromine – bài toán lượng chất",
    hk: HK, half: 1, tk: K4, level: 3, kind: "mcq",
    make: (r) => {
      const AK: P[] = [["ethylene", "C2H4"], ["propene", "C3H6"], ["butene", "C4H8"], ["pentene", "C5H10"], ["hexene", "C6H12"]];
      if (r.chance(0.5)) {
        const i = r.int(0, 3); const n = r.pick([0.05, 0.1, 0.15, 0.2, 0.25]); const M = 14 * (i + 2);
        const m = n * M, mBr = n * 160;
        return {
          stem: `Cho ${vn(m, 2)} gam một alkene X tác dụng vừa đủ với dung dịch chứa ${vn(mBr, 2)} gam ${ch("Br2")}. Công thức phân tử của X là ${ntk(["H", "C", "Br"])}`,
          ...mcq(r, ch(AK[i][1]), AK.filter((_, j) => j !== i).map((y) => ch(y[1]))),
          explanation: `Alkene cộng ${ch("Br2")} theo tỉ lệ 1 : 1: $n_X = n_{\\mathrm{Br_2}} = \\dfrac{${tex(mBr, 2)}}{160} = ${tex(n, 2)}$ mol; $M_X = \\dfrac{${tex(m, 2)}}{${tex(n, 2)}} = ${M} = 14n \\Rightarrow n = ${i + 2}$. X là ${ch(AK[i][1])}.`,
        };
      }
      const [an, af, ma, kn, kf] = r.pick([["ethylene", "C2H4", 28, "methane", "CH4"], ["ethylene", "C2H4", 28, "ethane", "C2H6"], ["propene", "C3H6", 42, "propane", "C3H8"]] as [string, string, number, string, string][]);
      const nt = r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]); const f = r.pick([20, 25, 30, 40, 50, 60, 75, 80]);
      const na = nt * f / 100; need(exact(na, 3));
      const dm = na * ma; const V = nt * V0;
      const mk = (nt - na) * molar(kf); const pm = dm / (dm + mk) * 100;
      const f22 = na / (V / 22.4) * 100;
      const opt = (x: number) => `${vn(x, 2)}%`;
      return {
        stem: `Dẫn ${vn(V, 4)} lít (đkc) hỗn hợp khí X gồm ${an} và ${kn} qua bình đựng dung dịch bromine dư, thấy khối lượng bình tăng ${vn(dm, 2)} gam. Phần trăm thể tích của ${an} trong X là ${ntk(["H", "C"])}`,
        ...mcq(r, opt(f), [opt(100 - f), opt(pm), opt(f22), opt(f / 2)].filter((s) => s !== opt(f))),
        explanation: `Chỉ ${an} bị hấp thụ: $n_{${mr(af)}} = \\dfrac{${tex(dm, 2)}}{${ma}} = ${tex(na, 3)}$ mol; $n_X = \\dfrac{${tex(V, 4)}}{24{,}79} = ${tex(nt, 2)}$ mol. $\\%V_{${mr(af)}} = \\dfrac{${tex(na, 3)}}{${tex(nt, 2)}} \\cdot 100\\% = ${f}\\%$.`,
      };
    },
  },
  {
    id: "h11k2-alkyne-ket-tua-bac", subject: S, grade: G, chapter: C4, topic: "Alk-1-yne tạo kết tủa với AgNO3/NH3 – tính toán",
    hk: HK, half: 1, tk: K4, level: 3, kind: "mcq",
    make: (r) => {
      const rg = `dung dịch ${ch("AgNO3")} trong ${ch("NH3")}`;
      if (r.chance(0.55)) {
        const [nm, f, pf, Ma, Mp] = r.pick(AGP); const n = r.pick([0.02, 0.04, 0.05, 0.06, 0.08, 0.1, 0.12, 0.15, 0.2, 0.25]);
        const V = n * V0, m = n * Mp;
        const wr = [V / 22.4 * Mp, n * Mp * 2, n * Mp / 2, n * (Ma + 108)].map((x) => vn(x, 2));
        return {
          stem: `Dẫn ${vn(V, 4)} lít khí ${nm} (đkc) vào lượng dư ${rg}, phản ứng hoàn toàn thu được m gam kết tủa. Giá trị của m là ${ntk(["H", "C", "Ag"])}`,
          ...mcq(r, vn(m, 2), wr),
          explanation: `$n_{${mr(f)}} = \\dfrac{${tex(V, 4)}}{24{,}79} = ${tex(n, 2)}$ mol. Kết tủa là ${ch(pf)} (M = ${Mp}), số mol bằng số mol alkyne. m $= ${tex(n, 2)} \\cdot ${Mp} = ${tex(m, 2)}$ gam.`,
        };
      }
      const nt = r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]); const f = r.pick([20, 25, 30, 40, 50, 60, 75, 80]);
      const na = nt * f / 100; need(exact(na, 3));
      const V = nt * V0, m = na * 240; need(exact(m, 2));
      const opt = (x: number) => `${vn(x, 2)}%`;
      const pm = na * 26 / (na * 26 + (nt - na) * 28) * 100;
      return {
        stem: `Dẫn ${vn(V, 4)} lít (đkc) hỗn hợp X gồm acetylene và ethylene vào lượng dư ${rg}, thu được ${vn(m, 2)} gam kết tủa. Phần trăm thể tích của ethylene trong X là ${ntk(["H", "C", "Ag"])}`,
        ...mcq(r, opt(100 - f), [opt(f), opt(100 - pm), opt(100 - na / (V / 22.4) * 100), opt(100 - na * 2 / nt * 100)].filter((s) => s !== opt(100 - f))),
        explanation: `Chỉ acetylene tạo kết tủa ${ch("AgC#CAg")} (M = 240): $n_{\\mathrm{C_2H_2}} = \\dfrac{${tex(m, 2)}}{240} = ${tex(na, 3)}$ mol; $n_X = ${tex(nt, 2)}$ mol. $\\%V_{\\mathrm{C_2H_2}} = ${f}\\%$ nên $\\%V_{\\mathrm{C_2H_4}} = ${100 - f}\\%$.`,
      };
    },
  },

  /* ======================= HALF 1 – TF ======================= */
  {
    id: "h11k2-tf-alkene", subject: S, grade: G, chapter: C4, topic: "Cấu tạo và tính chất của alkene",
    hk: HK, half: 1, tk: K4, level: 2, kind: "tf",
    make: (r) => {
      // tên, CT, có đồng phân hình học, sp chính + HBr, sp sai, alkane khi hydrogen hóa, alkane sai
      const L: [string, string, boolean, string, string, string, string][] = [
        ["propene", "CH2=CHCH3", false, "2-bromopropane", "1-bromopropane", "propane", "ethane"],
        ["but-1-ene", "CH2=CHCH2CH3", false, "2-bromobutane", "1-bromobutane", "butane", "2-methylpropane"],
        ["but-2-ene", "CH3CH=CHCH3", true, "2-bromobutane", "1-bromobutane", "butane", "2-methylpropane"],
        ["2-methylpropene", "CH2=C(CH3)2", false, "2-bromo-2-methylpropane", "1-bromo-2-methylpropane", "2-methylpropane", "butane"],
        ["2-methylbut-2-ene", "(CH3)2C=CHCH3", false, "2-bromo-2-methylbutane", "2-bromo-3-methylbutane", "2-methylbutane", "pentane"],
        ["2-methylbut-1-ene", "CH2=C(CH3)CH2CH3", false, "2-bromo-2-methylbutane", "1-bromo-2-methylbutane", "2-methylbutane", "pentane"],
        ["hex-3-ene", "CH3CH2CH=CHCH2CH3", true, "3-bromohexane", "2-bromohexane", "hexane", "3-methylpentane"],
        ["pent-1-ene", "CH2=CH[CH2]2CH3", false, "2-bromopentane", "1-bromopentane", "pentane", "2-methylbutane"],
      ];
      const x = r.pick(L);
      const say = r.chance(0.5), s2 = r.chance(0.5), s3 = r.chance(0.5), s4 = r.chance(0.5);
      return {
        stem: `${r.pick(["Cho alkene X là", "Xét hydrocarbon X là", "Một học sinh tìm hiểu tính chất của alkene X là", "Trong phòng thí nghiệm có một mẫu alkene X là"])} ${nf(x[0], x[1])}.`,
        ...tf([
          [`X ${say ? "có" : "không có"} đồng phân hình học (cis – trans).`, say === x[2]],
          [s2 ? "X làm mất màu dung dịch bromine ở điều kiện thường." : "X không làm mất màu dung dịch bromine vì phân tử chỉ chứa liên kết bền.", s2],
          [`Cho X tác dụng với HBr, sản phẩm chính thu được là ${s3 ? x[3] : x[4]}.`, s3],
          [`Hydrogen hóa hoàn toàn X (xúc tác Ni, đun nóng) thu được ${s4 ? x[5] : x[6]}.`, s4],
        ]),
        explanation: `${cap(x[0])} ${x[2] ? "có" : "không có"} đồng phân hình học (${x[2] ? "mỗi carbon mang nối đôi liên kết với hai nhóm khác nhau" : "có carbon mang nối đôi liên kết với hai nhóm giống nhau"}). Liên kết π kém bền nên X làm mất màu nước bromine. Cộng HBr ${["but-2-ene", "hex-3-ene"].includes(x[0]) ? "(alkene đối xứng) cho" : "theo quy tắc Markovnikov, sản phẩm chính là"} ${x[3]}. Cộng ${ch("H2")} giữ nguyên mạch carbon, thu được ${x[5]}.`,
      };
    },
  },
  {
    id: "h11k2-tf-acetylene-dat-den", subject: S, grade: G, chapter: C4, topic: "Điều chế và tính chất của acetylene",
    hk: HK, half: 1, tk: K4, level: 3, kind: "tf",
    make: (r) => {
      const m = r.pick([8, 10, 12.8, 16, 20, 25, 32, 40, 50]), p = r.pick([64, 75, 80, 90, 96]);
      const n = m * p / 6400; need(exact(n, 4));
      const V = n * V0, Vw = m / 64 * V0, mk = n * 240, mk2 = n * 133;
      const s1 = r.chance(0.5), s2 = r.chance(0.5), s3 = r.chance(0.5), s4 = r.chance(0.5);
      need(far(V, Vw));
      const t4 = r.pick([
        ["Acetylene được dùng làm nhiên liệu trong đèn xì oxygen – acetylene để hàn, cắt kim loại.", "Acetylene không cháy nên không dùng làm nhiên liệu."],
        [`1 mol acetylene cộng tối đa 2 mol ${ch("Br2")} trong dung dịch.`, `1 mol acetylene cộng tối đa 1 mol ${ch("Br2")} trong dung dịch.`],
        ["Acetylene làm mất màu dung dịch bromine và dung dịch thuốc tím.", "Acetylene không làm mất màu dung dịch bromine."],
      ]);
      return {
        stem: `Đất đèn chứa calcium carbide (${ch("CaC2")}). Cho ${vn(m, 2)} gam đất đèn chứa ${p}% ${ch("CaC2")} về khối lượng (còn lại là tạp chất trơ) vào nước dư, phản ứng hoàn toàn thu được khí X. Các thể tích đo ở đkc. ${ntk(["H", "C", "Ca", "Ag"])}`,
        ...tf([
          [s1 ? `Phương trình phản ứng: $${mr("CaC2 + 2H2O -> Ca(OH)2 + C2H2")}$.` : `Phương trình phản ứng: $${mr("CaC2 + H2O -> CaO + C2H2")}$.`, s1],
          [`Thể tích khí X thu được là ${vn(s2 ? V : Vw, 4)} lít.`, s2],
          [`Dẫn toàn bộ X vào dung dịch ${ch("AgNO3")} trong ${ch("NH3")} dư thu được ${vn(s3 ? mk : mk2, 2)} gam kết tủa vàng nhạt.`, s3],
          [s4 ? t4[0] : t4[1], s4],
        ]),
        explanation: `$\\mathrm{CaC_2 + 2H_2O \\rightarrow Ca(OH)_2 + C_2H_2}$. $n_{\\mathrm{CaC_2}} = \\dfrac{${tex(m, 2)} \\cdot ${tex(p / 100, 2)}}{64} = ${tex(n, 4)}$ mol $= n_{\\mathrm{C_2H_2}}$, $V = ${tex(n, 4)} \\cdot 24{,}79 = ${tex(V, 4)}$ lít. Kết tủa ${ch("AgC#CAg")}: $m = ${tex(n, 4)} \\cdot 240 = ${tex(mk, 2)}$ gam. Acetylene có liên kết ba nên cộng tối đa 2 mol ${ch("Br2")}, làm mất màu nước bromine và thuốc tím; acetylene cháy tỏa nhiều nhiệt, dùng trong đèn xì.`,
      };
    },
  },
  {
    id: "h11k2-tf-toluene-tnt", subject: S, grade: G, chapter: C4, topic: "Toluene và phản ứng nitro hóa",
    hk: HK, half: 1, tk: K4, level: 2, kind: "tf",
    make: (r) => {
      const m = r.pick([4.6, 9.2, 13.8, 18.4, 23, 27.6, 46, 92]), H = r.pick([50, 60, 70, 75, 80, 90]);
      const mT = m / 92 * 227 * H / 100, mT0 = m / 92 * 227;
      const s1 = r.chance(0.5), s2 = r.chance(0.5), s3 = r.chance(0.5), s4 = r.chance(0.5);
      return {
        stem: `Thuốc nổ TNT (2,4,6-trinitrotoluene) được điều chế bằng cách cho toluene tác dụng với hỗn hợp ${ch("HNO3")} đặc và ${ch("H2SO4")} đặc, đun nóng. Từ ${vn(m, 2)} kg toluene, hiệu suất phản ứng ${H}%. ${ntk(["H", "C", "N", "O"])}`,
        ...tf([
          [s1 ? "Toluene tham gia phản ứng nitro hóa dễ hơn benzene." : "Toluene tham gia phản ứng nitro hóa khó hơn benzene.", s1],
          [`Công thức phân tử của TNT là ${ch(s2 ? "C7H5N3O6" : "C7H5N3O3")}.`, s2],
          [`Khối lượng TNT thu được là ${vn(s3 ? mT : mT0, 2)} kg.`, s3],
          [s4 ? `Khi đun nóng, toluene làm mất màu dung dịch ${ch("KMnO4")}.` : "Toluene làm mất màu dung dịch bromine ở điều kiện thường.", s4],
        ]),
        explanation: `Nhóm methyl làm phản ứng thế vào vòng dễ hơn benzene. $\\mathrm{C_6H_5CH_3 + 3HNO_3 \\rightarrow C_6H_2(NO_2)_3CH_3 + 3H_2O}$; TNT là ${ch("C7H5N3O6")} (M = 227). $m_{\\mathrm{TNT}} = \\dfrac{${tex(m, 2)}}{92} \\cdot 227 \\cdot ${tex(H / 100, 2)} \\approx ${tex(mT, 2)}$ kg. Toluene bị ${ch("KMnO4")} oxi hóa khi đun nóng, không làm mất màu nước bromine.`,
      };
    },
  },
  {
    id: "h11k2-tf-khi-gas-lpg", subject: S, grade: G, chapter: C4, topic: "Alkane làm nhiên liệu – khí hóa lỏng LPG",
    hk: HK, half: 1, tk: K4, level: 3, kind: "tf",
    make: (r) => {
      const [a, b] = r.pick([[1, 2], [2, 1], [2, 3], [3, 2], [1, 3], [3, 1], [3, 7], [7, 3]] as [number, number][]);
      const Mu = 44 * a + 58 * b; const Q = 1000 * (2220 * a + 2878 * b) / Mu; const Qw = 1000 * (2220 * b + 2878 * a) / Mu;
      const pm = 44 * a / Mu * 100, pn = a / (a + b) * 100;
      const E = r.pick([10000, 12000, 15000, 20000]), h = r.pick([50, 60, 70, 80]);
      const N = 12 * Q * h / 100 / E, Nw = 12 * Q / E;
      need(Math.abs(Math.round(N) - Math.round(Nw)) >= 2 && far(pm, pn, 0.5) && Math.abs(Math.round(Q) - Math.round(Qw)) >= 10);
      const s1 = r.chance(0.5), s2 = r.chance(0.5), s3 = r.chance(0.5), s4 = r.chance(0.5);
      return {
        stem: `Một bình gas dân dụng chứa 12 kg khí hóa lỏng (LPG) gồm propane và butane với tỉ lệ mol tương ứng ${a} : ${b}. Khi đốt cháy hoàn toàn, 1 mol propane tỏa ra 2220 kJ, 1 mol butane tỏa ra 2878 kJ. Một hộ gia đình cần ${E} kJ nhiệt mỗi ngày, hiệu suất sử dụng nhiệt là ${h}%. ${ntk(["H", "C"])}`,
        ...tf([
          [s1 ? "Ở điều kiện thường, propane và butane là chất khí; trong bình gas chúng được nén ở dạng lỏng." : "Ở điều kiện thường, propane và butane là chất lỏng nên dễ chứa trong bình.", s1],
          [`Phần trăm khối lượng của propane trong LPG là ${vn(s2 ? pm : pn, 2)}%.`, s2],
          [`Đốt cháy hoàn toàn 1 kg LPG trên tỏa ra nhiệt lượng khoảng ${s3 ? round(Q) : round(Qw)} kJ.`, s3],
          [`Hộ gia đình trên dùng hết bình gas trong khoảng ${s4 ? round(N) : round(Nw)} ngày.`, s4],
        ]),
        explanation: `Propane, butane là chất khí, dễ hóa lỏng khi nén. Xét ${a} mol propane và ${b} mol butane: khối lượng $= 44 \\cdot ${a} + 58 \\cdot ${b} = ${Mu}$ g, $\\%m_{\\mathrm{C_3H_8}} = \\dfrac{${44 * a}}{${Mu}} \\cdot 100\\% \\approx ${tex(pm, 2)}\\%$. Nhiệt tỏa ra từ ${Mu} g là $2220 \\cdot ${a} + 2878 \\cdot ${b} = ${2220 * a + 2878 * b}$ kJ, nên 1 kg tỏa $\\approx ${round(Q)}$ kJ. Số ngày $= \\dfrac{12 \\cdot ${tex(Q, 1)} \\cdot ${tex(h / 100, 2)}}{${E}} \\approx ${tex(N, 1)}$, khoảng ${round(N)} ngày.`,
      };
    },
  },

  /* ======================= HALF 1 – SHORT ======================= */
  {
    id: "h11k2-short-dong-phan-hydrocarbon", subject: S, grade: G, chapter: C4, topic: "Đếm số đồng phân hydrocarbon",
    hk: HK, half: 1, tk: K4, level: 2, kind: "short",
    make: (r) => {
      const L: [string, string, number, string][] = [
        ["C4H10", "đồng phân cấu tạo", 2, "butane, 2-methylpropane"],
        ["C5H12", "đồng phân cấu tạo", 3, "pentane, 2-methylbutane, 2,2-dimethylpropane"],
        ["C6H14", "đồng phân cấu tạo", 5, "hexane, 2-methylpentane, 3-methylpentane, 2,2-dimethylbutane, 2,3-dimethylbutane"],
        ["C4H8", "đồng phân cấu tạo thuộc loại alkene", 3, "but-1-ene, but-2-ene, 2-methylpropene"],
        ["C4H8", "đồng phân alkene (kể cả đồng phân hình học)", 4, "but-1-ene, cis-but-2-ene, trans-but-2-ene, 2-methylpropene"],
        ["C5H10", "đồng phân cấu tạo thuộc loại alkene", 5, "pent-1-ene, pent-2-ene, 2-methylbut-1-ene, 3-methylbut-1-ene, 2-methylbut-2-ene"],
        ["C5H10", "đồng phân alkene (kể cả đồng phân hình học)", 6, "pent-1-ene, cis-pent-2-ene, trans-pent-2-ene, 2-methylbut-1-ene, 3-methylbut-1-ene, 2-methylbut-2-ene"],
        ["C4H6", "đồng phân cấu tạo thuộc loại alkyne", 2, "but-1-yne, but-2-yne"],
        ["C5H8", "đồng phân cấu tạo thuộc loại alkyne", 3, "pent-1-yne, pent-2-yne, 3-methylbut-1-yne"],
        ["C5H8", `alkyne tác dụng được với dung dịch ${ch("AgNO3")} trong ${ch("NH3")} tạo kết tủa`, 2, "pent-1-yne, 3-methylbut-1-yne (có liên kết ba đầu mạch)"],
        ["C6H10", "đồng phân cấu tạo thuộc loại alkyne", 7, "hex-1-yne, hex-2-yne, hex-3-yne, 3-methylpent-1-yne, 4-methylpent-1-yne, 4-methylpent-2-yne, 3,3-dimethylbut-1-yne"],
        ["C8H10", "đồng phân cấu tạo là arene (chứa vòng benzene)", 4, "ethylbenzene, 1,2-dimethylbenzene, 1,3-dimethylbenzene, 1,4-dimethylbenzene"],
        ["C9H12", "đồng phân cấu tạo là arene (chứa vòng benzene)", 8, "propylbenzene, isopropylbenzene, ba đồng phân ethylmethylbenzene (ortho, meta, para), ba đồng phân trimethylbenzene (1,2,3-; 1,2,4-; 1,3,5-)"],
      ];
      const [f, q, n, l] = r.pick(L);
      const ctx = r.pick(["", `Hydrocarbon X có công thức phân tử ${ch(f)}. `, `Một học sinh viết các công thức cấu tạo ứng với công thức phân tử ${ch(f)}. `]);
      return {
        stem: ctx ? `${ctx}Có bao nhiêu ${q} ứng với công thức phân tử này?` : `Có bao nhiêu ${q} ứng với công thức phân tử ${ch(f)}?`,
        ...sh(n, 0),
        explanation: `Các đồng phân: ${l}. Có ${n} đồng phân.`,
      };
    },
  },
  {
    id: "h11k2-short-the-tich-oxygen", subject: S, grade: G, chapter: C4, topic: "Phản ứng đốt cháy hydrocarbon – thể tích oxygen, không khí",
    hk: HK, half: 1, tk: K4, level: 2, kind: "short",
    make: (r) => {
      const [nm, f] = r.pick([["methane", "CH4"], ["ethane", "C2H6"], ["propane", "C3H8"], ["butane", "C4H10"], ["ethylene", "C2H4"], ["propene", "C3H6"], ["acetylene", "C2H2"], ["propyne", "C3H4"]] as P[]);
      const a = atoms(f); const k = a.C + a.H / 4;
      const n = r.pick([0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5]); const V = n * V0;
      const air = r.chance(0.4);
      const VO = n * k * V0, Va = VO * 5;
      const val = air ? Va : VO; const dp = val >= 100 ? 0 : 1;
      return {
        stem: `Đốt cháy hoàn toàn ${vn(V, 4)} lít khí ${nm} (đkc). Thể tích ${air ? "không khí (chứa 20% thể tích oxygen)" : "khí oxygen"} (đkc) tối thiểu cần dùng là bao nhiêu lít? (làm tròn kết quả đến hàng ${dp ? "phần mười" : "đơn vị"})`,
        ...sh(val, dp),
        explanation: `$${mr(`${f} + ${vn(k, 1).replace(",", "{,}")}O2 -> ${a.C > 1 ? a.C : ""}CO2 + ${a.H / 2 > 1 ? a.H / 2 : ""}H2O`)}$. $n_{${mr(f)}} = ${tex(n, 2)}$ mol, $n_{\\mathrm{O_2}} = ${tex(k, 1)} \\cdot ${tex(n, 2)} = ${tex(n * k, 3)}$ mol; $V_{\\mathrm{O_2}} = ${tex(VO, 3)}$ lít${air ? `; $V_{kk} = 5V_{\\mathrm{O_2}} \\approx ${tex(Va, 2)}$ lít` : ""}.`,
      };
    },
  },
  {
    id: "h11k2-short-hydrogen-hoa-alkene", subject: S, grade: G, chapter: C4, topic: "Hydrogen hóa alkene – tỉ khối, hiệu suất",
    hk: HK, half: 1, tk: K4, level: 3, kind: "short",
    make: (r) => {
      const [nm, f, Ma] = r.pick([["ethylene", "C2H4", 28], ["propene", "C3H6", 42]] as [string, string, number][]);
      const a = r.pick([0.2, 0.25, 0.4, 0.5, 0.6, 0.75]), b = 1 - a; const H = r.pick([40, 50, 60, 75, 80]);
      const lim = Math.min(a, b); const x = H / 100 * lim;
      const MX = a * Ma + 2 * b, MY = MX / (1 - x); const dX = MX / 2, dY = MY / 2;
      const g = gcd(Math.round(a * 20), Math.round(b * 20)); const pa = Math.round(a * 20) / g, pb = Math.round(b * 20) / g;
      if (r.chance(0.5)) {
        return {
          stem: `Hỗn hợp X gồm ${nm} và ${ch("H2")} có tỉ lệ mol tương ứng ${pa} : ${pb}. Nung nóng X với xúc tác Ni một thời gian, thu được hỗn hợp Y. Hiệu suất phản ứng hydrogen hóa là ${H}%. Tỉ khối của Y so với ${ch("H2")} là bao nhiêu? (làm tròn kết quả đến hàng phần mười) ${ntk(["H", "C"])}`,
          ...sh(dY, 1),
          explanation: `Xét 1 mol X: ${vn(a, 2)} mol ${ch(f)}, ${vn(b, 2)} mol ${ch("H2")}; $m_X = ${tex(MX, 2)}$ g. Hiệu suất tính theo chất thiếu (${a <= b ? nm : ch("H2")}): số mol phản ứng $= ${tex(H / 100, 2)} \\cdot ${tex(lim, 2)} = ${tex(x, 3)}$ mol; mỗi mol phản ứng làm giảm 1 mol khí nên $n_Y = ${tex(1 - x, 3)}$ mol. $M_Y = \\dfrac{${tex(MX, 2)}}{${tex(1 - x, 3)}} \\approx ${tex(MY, 2)}$, $d_{Y/\\mathrm{H_2}} \\approx ${tex(dY, 1)}$.`,
        };
      }
      need(exact(dX, 2) && exact(dY, 2));
      return {
        stem: `Hỗn hợp X gồm ${nm} và ${ch("H2")} có tỉ khối so với ${ch("H2")} là ${vn(dX, 2)}. Nung nóng X với xúc tác Ni một thời gian, thu được hỗn hợp Y có tỉ khối so với ${ch("H2")} là ${vn(dY, 2)}. Hiệu suất của phản ứng hydrogen hóa là bao nhiêu phần trăm? ${ntk(["H", "C"])}`,
        ...sh(H, 0),
        explanation: `Xét 1 mol X: $${Ma}a + 2(1 - a) = ${tex(MX, 2)} \\Rightarrow a = ${tex(a, 2)}$ (${nm}), ${ch("H2")} ${vn(b, 2)} mol. Khối lượng không đổi nên $n_Y = \\dfrac{M_X}{M_Y} = \\dfrac{${tex(dX, 2)}}{${tex(dY, 2)}} = ${tex(1 - x, 3)}$ mol; số mol khí giảm $= ${tex(x, 3)}$ mol $= n$ ${ch("H2")} phản ứng. Hiệu suất tính theo ${a <= b ? nm : ch("H2")}: $H = \\dfrac{${tex(x, 3)}}{${tex(lim, 2)}} \\cdot 100\\% = ${H}\\%$.`,
      };
    },
  },
  {
    id: "h11k2-short-nitro-hoa-arene", subject: S, grade: G, chapter: C4, topic: "Nitro hóa benzene, toluene – hiệu suất",
    hk: HK, half: 1, tk: K4, level: 3, kind: "short",
    make: (r) => {
      const [an, af, Ma, pn, pf, Mp] = r.pick([["benzene", "C6H6", 78, "nitrobenzene", "C6H5NO2", 123], ["toluene", "C6H5CH3", 92, "TNT (2,4,6-trinitrotoluene)", "C6H2(NO2)3CH3", 227]] as [string, string, number, string, string, number][]);
      const H = r.pick([50, 60, 70, 75, 80, 85, 90]);
      const unit = r.pick(["kg", "tấn"]);
      if (r.chance(0.55)) {
        const m = r.pick([1, 2, 3, 5, 0.5, 1.5, 2.5, 4]) * Ma / 10;
        const mp = m / Ma * Mp * H / 100;
        return {
          stem: `Nitro hóa ${vn(m, 2)} ${unit} ${an} bằng hỗn hợp ${ch("HNO3")} đặc và ${ch("H2SO4")} đặc (dư), thu được ${pn} với hiệu suất ${H}%. Khối lượng ${pn} thu được là bao nhiêu ${unit}? (làm tròn kết quả đến hàng phần mười) ${ntk(["H", "C", "N", "O"])}`,
          ...sh(mp, 1),
          explanation: `$${mr(af)} \\rightarrow ${mr(pf)}$: ${Ma} ${unit} ${an} tạo ${Mp} ${unit} ${pn}. $m = \\dfrac{${tex(m, 2)}}{${Ma}} \\cdot ${Mp} \\cdot ${tex(H / 100, 2)} \\approx ${tex(mp, 2)}$ ${unit}.`,
        };
      }
      const mp = r.pick([1, 2, 3, 5, 0.5, 1.5, 2.5, 4]) * Mp / 10;
      const m = mp / Mp * Ma / (H / 100);
      return {
        stem: `Để sản xuất ${vn(mp, 2)} ${unit} ${pn} từ ${an} với hiệu suất cả quá trình là ${H}%, cần dùng bao nhiêu ${unit} ${an}? (làm tròn kết quả đến hàng phần mười) ${ntk(["H", "C", "N", "O"])}`,
        ...sh(m, 1),
        explanation: `${Ma} ${unit} ${an} tạo ${Mp} ${unit} ${pn} (theo lí thuyết). $m = \\dfrac{${tex(mp, 2)}}{${Mp}} \\cdot ${Ma} : ${tex(H / 100, 2)} \\approx ${tex(m, 2)}$ ${unit}.`,
      };
    },
  },

  /* =================================================================== */
  /* ============ HALF 2 – DẪN XUẤT HALOGEN, ALCOHOL, PHENOL – MCQ ====== */
  {
    id: "h11k2-dan-xuat-halogen-li-thuyet", subject: S, grade: G, chapter: C5, topic: "Dẫn xuất halogen",
    hk: HK, half: 2, tk: K5, level: 1, kind: "mcq",
    make: (r) => bank(r,
      ["khi nói về dẫn xuất halogen", "về cấu tạo và tính chất của dẫn xuất halogen", "khi tìm hiểu về dẫn xuất halogen của hydrocarbon"],
      [
        "Khi thay thế một hay nhiều nguyên tử hydrogen trong phân tử hydrocarbon bằng nguyên tử halogen, thu được dẫn xuất halogen.",
        "Liên kết C–X (X là halogen) trong dẫn xuất halogen là liên kết cộng hóa trị phân cực.",
        "Đun nóng bromoethane với dung dịch NaOH thu được ethanol.",
        "Đun nóng 2-bromobutane với KOH trong ethanol, sản phẩm chính là but-2-ene.",
        "Dẫn xuất halogen hầu như không tan trong nước, tan tốt trong các dung môi hữu cơ.",
        "Các hợp chất CFC (freon) từng được dùng làm chất làm lạnh nhưng gây suy giảm tầng ozone.",
        `Tên theo danh pháp thay thế của ${ch("CH3CHClCH3")} là 2-chloropropane.`,
      ],
      [
        ["Đun nóng bromoethane với dung dịch NaOH (trong nước) thu được ethylene.", "đó là phản ứng thế nguyên tử Br bằng nhóm OH, tạo ethanol; phản ứng tách tạo alkene cần KOH trong ethanol"],
        ["Đun nóng 2-bromobutane với KOH trong ethanol, sản phẩm chính là but-1-ene.", "theo quy tắc Zaitsev sản phẩm chính là but-2-ene"],
        ["Dẫn xuất halogen tan tốt trong nước.", "dẫn xuất halogen hầu như không tan trong nước"],
        ["Liên kết C–X trong dẫn xuất halogen là liên kết ion.", "liên kết C–X là liên kết cộng hóa trị phân cực"],
        ["Các hợp chất CFC không ảnh hưởng đến tầng ozone.", "CFC là tác nhân chính gây suy giảm tầng ozone"],
        [`Tên theo danh pháp thay thế của ${ch("CH3CHClCH3")} là 1-chloropropane.`, "nguyên tử Cl gắn ở carbon số 2 nên tên là 2-chloropropane"],
        ["Ở điều kiện thường, tất cả dẫn xuất halogen đều là chất khí.", "chỉ một số dẫn xuất có phân tử khối nhỏ (như chloromethane) là chất khí, phần lớn là chất lỏng hoặc rắn"],
      ]),
  },
  {
    id: "h11k2-tach-zaitsev", subject: S, grade: G, chapter: C5, topic: "Phản ứng tách – quy tắc Zaitsev",
    hk: HK, half: 2, tk: K5, level: 2, kind: "mcq",
    make: (r) => {
      type Z = { s: P; alc: boolean; main: P; minor?: P; w: P[] };
      const L: Z[] = [
        { s: ["2-bromobutane", "CH3CHBrCH2CH3"], alc: false, main: ["but-2-ene", "CH3CH=CHCH3"], minor: ["but-1-ene", "CH2=CHCH2CH3"], w: [["butan-2-ol", "CH3CH(OH)CH2CH3"], ["2-methylpropene", "CH2=C(CH3)2"]] },
        { s: ["2-chloro-2-methylbutane", "(CH3)2CClCH2CH3"], alc: false, main: ["2-methylbut-2-ene", "(CH3)2C=CHCH3"], minor: ["2-methylbut-1-ene", "CH2=C(CH3)CH2CH3"], w: [["2-methylbutan-2-ol", "(CH3)2C(OH)CH2CH3"], ["3-methylbut-1-ene", "CH2=CHCH(CH3)2"]] },
        { s: ["2-bromo-3-methylbutane", "(CH3)2CHCHBrCH3"], alc: false, main: ["2-methylbut-2-ene", "(CH3)2C=CHCH3"], minor: ["3-methylbut-1-ene", "CH2=CHCH(CH3)2"], w: [["3-methylbutan-2-ol", "(CH3)2CHCH(OH)CH3"], ["2-methylbut-1-ene", "CH2=C(CH3)CH2CH3"]] },
        { s: ["2-bromopentane", "CH3CHBr[CH2]2CH3"], alc: false, main: ["pent-2-ene", "CH3CH=CHCH2CH3"], minor: ["pent-1-ene", "CH2=CH[CH2]2CH3"], w: [["pentan-2-ol", "CH3CH(OH)[CH2]2CH3"], ["2-methylbut-2-ene", "(CH3)2C=CHCH3"]] },
        { s: ["3-bromopentane", "CH3CH2CHBrCH2CH3"], alc: false, main: ["pent-2-ene", "CH3CH=CHCH2CH3"], w: [["pent-1-ene", "CH2=CH[CH2]2CH3"], ["pentan-3-ol", "CH3CH2CH(OH)CH2CH3"], ["2-methylbut-2-ene", "(CH3)2C=CHCH3"]] },
        { s: ["butan-2-ol", "CH3CH(OH)CH2CH3"], alc: true, main: ["but-2-ene", "CH3CH=CHCH3"], minor: ["but-1-ene", "CH2=CHCH2CH3"], w: [["butanone", "CH3COCH2CH3"], ["2-methylpropene", "CH2=C(CH3)2"]] },
        { s: ["2-methylbutan-2-ol", "(CH3)2C(OH)CH2CH3"], alc: true, main: ["2-methylbut-2-ene", "(CH3)2C=CHCH3"], minor: ["2-methylbut-1-ene", "CH2=C(CH3)CH2CH3"], w: [["3-methylbut-1-ene", "CH2=CHCH(CH3)2"], ["pent-2-ene", "CH3CH=CHCH2CH3"]] },
        { s: ["3-methylbutan-2-ol", "(CH3)2CHCH(OH)CH3"], alc: true, main: ["2-methylbut-2-ene", "(CH3)2C=CHCH3"], minor: ["3-methylbut-1-ene", "CH2=CHCH(CH3)2"], w: [["2-methylbut-1-ene", "CH2=C(CH3)CH2CH3"], ["3-methylbutan-2-one", "(CH3)2CHCOCH3"]] },
        { s: ["pentan-2-ol", "CH3CH(OH)[CH2]2CH3"], alc: true, main: ["pent-2-ene", "CH3CH=CHCH2CH3"], minor: ["pent-1-ene", "CH2=CH[CH2]2CH3"], w: [["2-methylbut-2-ene", "(CH3)2C=CHCH3"], ["pentan-2-one", "CH3CO[CH2]2CH3"]] },
      ];
      const x = r.pick(L);
      const cond = x.alc ? `đun nóng với ${ch("H2SO4")} đặc ở 170 °C` : "đun nóng với KOH trong ethanol";
      const minorQ = !!x.minor && r.chance(0.3);
      const right = minorQ ? x.minor! : x.main;
      const wr = (minorQ ? [x.main, ...x.w] : [...(x.minor ? [x.minor] : []), ...x.w]).map((y) => nf(y[0], y[1]));
      return {
        stem: `Khi ${cond}, ${nf(x.s[0], x.s[1])} tham gia phản ứng tách ${x.alc ? "nước" : "hydrogen halide"}. Sản phẩm ${minorQ ? "phụ" : "chính"} thu được là`,
        ...mcq(r, nf(right[0], right[1]), wr),
        explanation: `Quy tắc Zaitsev: nhóm ${x.alc ? "–OH" : "–X"} bị tách cùng nguyên tử H ở carbon bên cạnh có bậc cao hơn, tạo alkene có nhiều nhóm thế hơn là sản phẩm chính. Sản phẩm chính: ${x.main[0]}${x.minor ? `; sản phẩm phụ: ${x.minor[0]}` : " (hai phía của nhóm chức tương đương nên chỉ tạo một alkene)"}.`,
      };
    },
  },
  {
    id: "h11k2-alcohol-danh-phap-bac", subject: S, grade: G, chapter: C5, topic: "Danh pháp và bậc alcohol",
    hk: HK, half: 2, tk: K5, level: 1, kind: "mcq",
    make: (r) => {
      if (r.chance(0.35)) {
        const k = r.int(1, 3); const mono = ALCN.filter((x) => x[2] > 0);
        const x = r.pick(mono.filter((y) => y[2] === k)); const wr = pickN(r, mono.filter((y) => y[2] !== k), 3);
        const B = ["", "I", "II", "III"];
        return {
          stem: `Alcohol nào sau đây là alcohol bậc ${B[k]}?`,
          ...mcq(r, nf(x[1], x[0]), wr.map((y) => nf(y[1], y[0]))),
          explanation: `Bậc của alcohol bằng bậc của nguyên tử carbon liên kết với nhóm –OH. ${cap(x[1])} là alcohol bậc ${B[k]}; ${wr.map((y) => `${y[1]} bậc ${B[y[2]]}`).join(", ")}.`,
        };
      }
      return naming(r, ALCN.map((x): Nm => [x[0], x[1], x[3]]), "alcohol", RULE_OL);
    },
  },
  {
    id: "h11k2-alcohol-li-thuyet", subject: S, grade: G, chapter: C5, topic: "Alcohol: tính chất vật lí, hóa học, ứng dụng",
    hk: HK, half: 2, tk: K5, level: 1, kind: "mcq",
    make: (r) => bank(r,
      ["khi nói về alcohol", "về tính chất và ứng dụng của alcohol", "khi tìm hiểu về ethanol, glycerol và các alcohol"],
      [
        "Alcohol là hợp chất hữu cơ có nhóm hydroxy (–OH) liên kết trực tiếp với nguyên tử carbon no.",
        "Ethanol tan vô hạn trong nước do tạo được liên kết hydrogen với nước.",
        "Nhiệt độ sôi của ethanol cao hơn nhiều so với hydrocarbon có phân tử khối tương đương do có liên kết hydrogen giữa các phân tử.",
        `Glycerol hòa tan được ${ch("Cu(OH)2")} tạo dung dịch màu xanh lam.`,
        "Ethanol phản ứng với sodium giải phóng khí hydrogen.",
        "Xăng E5 là xăng sinh học chứa khoảng 5% ethanol về thể tích.",
        "Methanol rất độc, có thể gây mù lòa hoặc tử vong.",
        "Ethanol được sản xuất bằng cách lên men tinh bột hoặc hydrate hóa ethylene.",
      ],
      [
        [`Ethanol hòa tan được ${ch("Cu(OH)2")} tạo dung dịch màu xanh lam.`, `chỉ các polyalcohol có các nhóm –OH liền kề (như glycerol, ethylene glycol) mới hòa tan được ${ch("Cu(OH)2")}`],
        ["Các alcohol đều tan vô hạn trong nước.", "độ tan của alcohol giảm khi mạch carbon tăng"],
        ["Ethanol có nhiệt độ sôi thấp hơn dimethyl ether.", "ethanol có liên kết hydrogen giữa các phân tử nên sôi cao hơn dimethyl ether"],
        ["Methanol không độc nên có thể dùng để pha chế đồ uống.", "methanol rất độc"],
        ["Dung dịch ethanol làm quỳ tím chuyển sang màu đỏ.", "ethanol không làm đổi màu quỳ tím"],
        ["Oxi hóa propan-2-ol bằng CuO, đun nóng thu được propanal.", "alcohol bậc II bị oxi hóa thành ketone (propanone)"],
        ["Alcohol bậc III bị CuO, đun nóng oxi hóa thành ketone.", "alcohol bậc III không bị CuO oxi hóa trong điều kiện này"],
        ["Xăng E5 là xăng chứa khoảng 5% methanol.", "xăng E5 chứa khoảng 5% ethanol"],
      ]),
  },
  {
    id: "h11k2-oxi-hoa-alcohol", subject: S, grade: G, chapter: C5, topic: "Oxi hóa alcohol bằng CuO",
    hk: HK, half: 2, tk: K5, level: 2, kind: "mcq",
    make: (r) => {
      type O = { a: P; b: number; p: P; w: P[] };
      const L: O[] = [
        { a: ["ethanol", "CH3CH2OH"], b: 1, p: ["ethanal", "CH3CHO"], w: [["acetic acid", "CH3COOH"], ["acetone", "CH3COCH3"], ["ethylene", "CH2=CH2"]] },
        { a: ["methanol", "CH3OH"], b: 1, p: ["methanal", "HCHO"], w: [["formic acid", "HCOOH"], ["ethanal", "CH3CHO"], ["dimethyl ether", "CH3OCH3"]] },
        { a: ["propan-1-ol", "CH3CH2CH2OH"], b: 1, p: ["propanal", "CH3CH2CHO"], w: [["propanone", "CH3COCH3"], ["propanoic acid", "CH3CH2COOH"], ["propene", "CH2=CHCH3"]] },
        { a: ["propan-2-ol", "CH3CH(OH)CH3"], b: 2, p: ["propanone", "CH3COCH3"], w: [["propanal", "CH3CH2CHO"], ["propanoic acid", "CH3CH2COOH"], ["propene", "CH2=CHCH3"]] },
        { a: ["butan-1-ol", "CH3[CH2]3OH"], b: 1, p: ["butanal", "CH3[CH2]2CHO"], w: [["butanone", "CH3COCH2CH3"], ["butanoic acid", "CH3[CH2]2COOH"], ["but-1-ene", "CH2=CHCH2CH3"]] },
        { a: ["butan-2-ol", "CH3CH(OH)CH2CH3"], b: 2, p: ["butanone", "CH3COCH2CH3"], w: [["butanal", "CH3[CH2]2CHO"], ["butanoic acid", "CH3[CH2]2COOH"], ["but-2-ene", "CH3CH=CHCH3"]] },
        { a: ["2-methylpropan-1-ol", "(CH3)2CHCH2OH"], b: 1, p: ["2-methylpropanal", "(CH3)2CHCHO"], w: [["butanal", "CH3[CH2]2CHO"], ["2-methylpropanoic acid", "(CH3)2CHCOOH"], ["2-methylpropene", "CH2=C(CH3)2"]] },
        { a: ["pentan-3-ol", "CH3CH2CH(OH)CH2CH3"], b: 2, p: ["pentan-3-one", "CH3CH2COCH2CH3"], w: [["pentanal", "CH3[CH2]3CHO"], ["pentan-2-one", "CH3CO[CH2]2CH3"], ["pent-2-ene", "CH3CH=CHCH2CH3"]] },
      ];
      const T3: P[] = [["2-methylpropan-2-ol", "(CH3)3COH"], ["2-methylbutan-2-ol", "(CH3)2C(OH)CH2CH3"]];
      const rule = "Khi đun nóng với CuO: alcohol bậc I bị oxi hóa thành aldehyde, alcohol bậc II thành ketone, alcohol bậc III không bị oxi hóa.";
      if (r.chance(0.55)) {
        const x = r.pick(L);
        return {
          stem: `Oxi hóa ${nf(x.a[0], x.a[1])} bằng CuO, đun nóng, thu được sản phẩm hữu cơ là`,
          ...mcq(r, nf(x.p[0], x.p[1]), x.w.map((y) => nf(y[0], y[1]))),
          explanation: `${rule} ${cap(x.a[0])} là alcohol bậc ${x.b === 1 ? "I" : "II"} nên tạo ${x.b === 1 ? "aldehyde" : "ketone"} ${x.p[0]}.`,
        };
      }
      const t = r.int(1, 3);
      const pool: [P, number][] = [...L.map((x): [P, number] => [x.a, x.b]), ...T3.map((x): [P, number] => [x, 3])];
      const x = r.pick(pool.filter((y) => y[1] === t)); const wr = pickN(r, pool.filter((y) => y[1] !== t), 3);
      const q = ["", "tạo thành aldehyde", "tạo thành ketone", "KHÔNG bị oxi hóa"][t];
      return {
        stem: `Khi đun nóng với CuO, alcohol nào sau đây ${q}?`,
        ...mcq(r, nf(x[0][0], x[0][1]), wr.map((y) => nf(y[0][0], y[0][1]))),
        explanation: `${rule} ${cap(x[0][0])} là alcohol bậc ${["", "I", "II", "III"][t]}.`,
      };
    },
  },
  {
    id: "h11k2-phenol-li-thuyet", subject: S, grade: G, chapter: C5, topic: "Phenol: cấu tạo và tính chất",
    hk: HK, half: 2, tk: K5, level: 1, kind: "mcq",
    make: (r) => bank(r,
      ["khi nói về phenol", "về cấu tạo và tính chất của phenol", "khi so sánh phenol với alcohol"],
      [
        "Phenol là hợp chất hữu cơ có nhóm –OH liên kết trực tiếp với nguyên tử carbon của vòng benzene.",
        "Phenol tác dụng được với dung dịch NaOH tạo sodium phenoxide.",
        "Phenol tác dụng với nước bromine tạo kết tủa trắng 2,4,6-tribromophenol.",
        `Phenol có tính acid nhưng yếu hơn carbonic acid (${ch("H2CO3")}).`,
        "Dung dịch phenol không làm đổi màu quỳ tím.",
        "Phenol là chất rắn, độc, có thể gây bỏng khi tiếp xúc với da.",
        "Phản ứng thế nguyên tử H của vòng benzene trong phenol xảy ra dễ hơn trong benzene.",
        "Phenol được dùng để sản xuất nhựa phenol formaldehyde, chất diệt nấm mốc, phẩm nhuộm.",
      ],
      [
        ["Dung dịch phenol làm quỳ tím chuyển sang màu đỏ.", "tính acid của phenol rất yếu, không làm đổi màu quỳ tím"],
        ["Phenol có tính acid mạnh hơn acetic acid.", "phenol có tính acid yếu hơn acetic acid và cả carbonic acid"],
        ["Phenol tác dụng với nước bromine tạo kết tủa màu vàng.", "kết tủa 2,4,6-tribromophenol có màu trắng"],
        [`Benzyl alcohol (${ch("C6H5CH2OH")}) thuộc loại phenol.`, "nhóm –OH không gắn trực tiếp vào vòng benzene nên đó là alcohol"],
        ["Phenol không tác dụng với dung dịch NaOH.", "phenol có tính acid nên tác dụng với NaOH"],
        ["Phenol tan vô hạn trong nước ở nhiệt độ thường.", "phenol ít tan trong nước lạnh"],
        ["Ethanol tác dụng được với dung dịch NaOH tương tự phenol.", "ethanol không tác dụng với dung dịch NaOH"],
      ]),
  },
  {
    id: "h11k2-alcohol-tac-dung-natri", subject: S, grade: G, chapter: C5, topic: "Alcohol tác dụng với sodium – bài toán",
    hk: HK, half: 2, tk: K5, level: 3, kind: "mcq",
    make: (r) => {
      const A = ["CH3OH", "C2H5OH", "C3H7OH", "C4H9OH", "C5H11OH"]; const el = ntk(["H", "C", "O"]);
      const mode = r.int(0, 2);
      if (mode === 0) {
        const i = r.int(0, 4); const nH = r.pick([0.025, 0.05, 0.075, 0.1, 0.125, 0.15]); const M = molar(A[i]);
        const m = 2 * nH * M; const V = nH * V0; need(exact(m, 2) && exact(V, 4));
        return {
          stem: `Cho ${vn(m, 2)} gam một alcohol no, đơn chức, mạch hở X tác dụng hết với Na (dư), thu được ${vn(V, 4)} lít khí ${ch("H2")} (đkc). Công thức của X là ${el}`,
          ...mcq(r, ch(A[i]), pickN(r, A.filter((_, j) => j !== i), 3).map(ch)),
          explanation: `$\\mathrm{2ROH + 2Na \\rightarrow 2RONa + H_2}$: $n_X = 2n_{\\mathrm{H_2}} = 2 \\cdot ${tex(nH, 3)} = ${tex(2 * nH, 3)}$ mol; $M_X = \\dfrac{${tex(m, 2)}}{${tex(2 * nH, 3)}} = ${M}$ nên X là ${ch(A[i])}.`,
        };
      }
      if (mode === 1) {
        const i = r.int(0, 3); const a = r.pick([0.05, 0.1, 0.15, 0.2]), b = r.pick([0.05, 0.1, 0.15, 0.2]);
        const m = a * molar(A[i]) + b * molar(A[i + 1]); const nH = (a + b) / 2; const V = nH * V0; need(exact(m, 2));
        const pair = (k: number) => `${ch(A[k])} và ${ch(A[k + 1])}`;
        return {
          stem: `Cho ${vn(m, 2)} gam hỗn hợp X gồm hai alcohol no, đơn chức, mạch hở, kế tiếp nhau trong dãy đồng đẳng tác dụng hết với Na (dư), thu được ${vn(V, 4)} lít khí ${ch("H2")} (đkc). Hai alcohol trong X là ${el}`,
          ...mcq(r, pair(i), [0, 1, 2, 3].filter((k) => k !== i).map(pair)),
          explanation: `$n_X = 2n_{\\mathrm{H_2}} = ${tex(a + b, 2)}$ mol; $\\overline{M} = \\dfrac{${tex(m, 2)}}{${tex(a + b, 2)}} \\approx ${tex(m / (a + b), 2)}$, nằm giữa ${molar(A[i])} và ${molar(A[i + 1])} nên X gồm ${pair(i)}.`,
        };
      }
      const [nm, f] = r.pick([["methanol", "CH3OH"], ["ethanol", "C2H5OH"], ["propan-1-ol", "C3H7OH"], ["propan-2-ol", "C3H7OH"], ["butan-1-ol", "C4H9OH"]] as P[]);
      const n = r.pick([0.05, 0.1, 0.15, 0.2, 0.25, 0.3]); const M = molar(f); const m = n * M; const V = n / 2 * V0;
      return {
        stem: `Cho ${vn(m, 2)} gam ${nf(nm, f)} tác dụng hết với Na (dư), thu được V lít khí ${ch("H2")} (đkc). Giá trị của V là ${el}`,
        ...mcq(r, vn(V, 4), [n * V0, n / 2 * 22.4, n * 2 * V0, n / 4 * V0].map((x) => vn(x, 4))),
        explanation: `$n = \\dfrac{${tex(m, 2)}}{${M}} = ${tex(n, 2)}$ mol; $n_{\\mathrm{H_2}} = \\dfrac{n}{2} = ${tex(n / 2, 3)}$ mol; $V = ${tex(n / 2, 3)} \\cdot 24{,}79 = ${tex(V, 4)}$ lít.`,
      };
    },
  },

  /* ============ HALF 2 – CARBONYL, CARBOXYLIC ACID – MCQ ============ */
  {
    id: "h11k2-nhiet-do-soi-huu-co", subject: S, grade: G, chapter: C6, topic: "So sánh nhiệt độ sôi các hợp chất hữu cơ",
    hk: HK, half: 2, tk: K6, level: 2, kind: "mcq",
    make: (r) => {
      // [hydrocarbon, carbonyl[], alcohol[], acid] cùng phân tử khối xấp xỉ
      const SETS: [P[], P[], P[], P[]][] = [
        [[["propane", "C3H8"]], [["ethanal", "CH3CHO"]], [["ethanol", "C2H5OH"]], [["formic acid", "HCOOH"]]],
        [[["butane", "C4H10"]], [["propanal", "CH3CH2CHO"], ["acetone", "CH3COCH3"]], [["propan-1-ol", "CH3CH2CH2OH"], ["propan-2-ol", "CH3CH(OH)CH3"]], [["acetic acid", "CH3COOH"]]],
        [[["pentane", "C5H12"]], [["butanal", "CH3[CH2]2CHO"], ["butanone", "CH3COCH2CH3"]], [["butan-1-ol", "CH3[CH2]3OH"]], [["propanoic acid", "CH3CH2COOH"]]],
      ];
      const s = r.pick(SETS); const four = s.map((g) => r.pick(g)); // thứ tự tăng dần nhiệt độ sôi
      const why = "Với phân tử khối xấp xỉ nhau: hydrocarbon không có liên kết hydrogen, sôi thấp nhất; aldehyde, ketone phân cực nhưng không có liên kết hydrogen liên phân tử; alcohol có liên kết hydrogen; carboxylic acid có liên kết hydrogen bền hơn (tạo dimer) nên sôi cao nhất.";
      const mode = r.int(0, 2);
      if (mode < 2) {
        const right = mode === 0 ? four[3] : four[0];
        return {
          stem: `Trong các chất: ${r.shuffle([...four]).map((y) => nf(y[0], y[1])).join(", ")}, chất có nhiệt độ sôi ${mode === 0 ? "cao" : "thấp"} nhất là`,
          ...mcq(r, nf(right[0], right[1]), four.filter((y) => y !== right).map((y) => nf(y[0], y[1]))),
          explanation: `${why} Thứ tự tăng dần: ${four.map((y) => y[0]).join(" < ")}.`,
        };
      }
      const seq = (o: number[]) => o.map((k) => ch(four[k][1])).join(", ");
      const perms = [[0, 1, 2, 3], [0, 2, 1, 3], [1, 0, 2, 3], [0, 1, 3, 2], [3, 2, 1, 0], [2, 1, 0, 3], [1, 2, 0, 3]];
      return {
        stem: "Dãy nào sau đây gồm các chất được sắp xếp theo chiều nhiệt độ sôi tăng dần?",
        ...mcq(r, seq(perms[0]), r.shuffle(perms.slice(1)).map(seq)),
        explanation: `${why} Thứ tự tăng dần: ${four.map((y) => y[0]).join(" < ")}.`,
      };
    },
  },
  {
    id: "h11k2-carbonyl-acid-danh-phap", subject: S, grade: G, chapter: C6, topic: "Danh pháp aldehyde, ketone, carboxylic acid",
    hk: HK, half: 2, tk: K6, level: 1, kind: "mcq",
    make: (r) => naming(r, CARBN, "hợp chất", RULE_CO),
  },
  {
    id: "h11k2-carbonyl-li-thuyet", subject: S, grade: G, chapter: C6, topic: "Aldehyde, ketone: tính chất và ứng dụng",
    hk: HK, half: 2, tk: K6, level: 1, kind: "mcq",
    make: (r) => bank(r,
      ["khi nói về hợp chất carbonyl", "về aldehyde và ketone", "khi tìm hiểu tính chất, ứng dụng của aldehyde và ketone"],
      [
        "Hợp chất carbonyl là hợp chất hữu cơ có nhóm C=O trong phân tử.",
        `Khử aldehyde bằng ${ch("NaBH4")} thu được alcohol bậc I.`,
        `Khử ketone bằng ${ch("NaBH4")} thu được alcohol bậc II.`,
        "Aldehyde phản ứng với thuốc thử Tollens tạo lớp bạc sáng bóng.",
        `Aldehyde khử được ${ch("Cu(OH)2")} trong môi trường kiềm khi đun nóng, tạo kết tủa đỏ gạch ${ch("Cu2O")}.`,
        "Acetone hòa tan tốt nhiều chất hữu cơ nên được dùng làm dung môi (như nước rửa sơn móng tay).",
        "Hợp chất có nhóm $\\mathrm{CH_3CO-}$ tham gia phản ứng iodoform tạo kết tủa vàng $\\mathrm{CHI_3}$.",
        "Dung dịch formaldehyde (formalin) được dùng để ngâm mẫu động vật, không được dùng bảo quản thực phẩm.",
      ],
      [
        ["Acetone tham gia phản ứng tráng bạc.", "ketone không phản ứng với thuốc thử Tollens"],
        [`Khử aldehyde bằng ${ch("NaBH4")} thu được alcohol bậc II.`, "aldehyde bị khử thành alcohol bậc I"],
        ["Aldehyde và ketone có nhiệt độ sôi cao hơn alcohol có phân tử khối tương đương.", "aldehyde, ketone không có liên kết hydrogen liên phân tử nên sôi thấp hơn alcohol tương ứng"],
        ["Formalin được dùng để bảo quản thực phẩm như bún, phở.", "formaldehyde độc, bị cấm dùng trong thực phẩm"],
        ["Ở điều kiện thường, methanal là chất lỏng.", "methanal (formaldehyde) là chất khí ở điều kiện thường"],
        [`Ethanal tác dụng với ${ch("Cu(OH)2")}/NaOH khi đun nóng tạo dung dịch màu xanh lam.`, `aldehyde khử ${ch("Cu(OH)2")} tạo kết tủa đỏ gạch ${ch("Cu2O")}`],
        ["Propanal tham gia phản ứng iodoform tạo kết tủa vàng.", "propanal không có nhóm $\\mathrm{CH_3CO-}$"],
      ]),
  },
  {
    id: "h11k2-carboxylic-acid-li-thuyet", subject: S, grade: G, chapter: C6, topic: "Carboxylic acid: tính chất và ứng dụng",
    hk: HK, half: 2, tk: K6, level: 1, kind: "mcq",
    make: (r) => bank(r,
      ["khi nói về carboxylic acid", "về tính chất của acetic acid", "khi tìm hiểu về carboxylic acid và giấm ăn"],
      [
        "Carboxylic acid là hợp chất hữu cơ có nhóm carboxyl (–COOH) liên kết với nguyên tử carbon hoặc nguyên tử hydrogen.",
        "Dung dịch acetic acid làm quỳ tím chuyển sang màu đỏ.",
        `Acetic acid tác dụng với ${ch("CaCO3")} giải phóng khí ${ch("CO2")}.`,
        "Nhiệt độ sôi của carboxylic acid cao hơn alcohol có phân tử khối tương đương.",
        "Giấm ăn là dung dịch acetic acid có nồng độ khoảng 2 – 5%.",
        `Phản ứng ester hóa giữa carboxylic acid và alcohol là phản ứng thuận nghịch, xúc tác ${ch("H2SO4")} đặc.`,
        "Acetic acid là acid yếu, phân li không hoàn toàn trong nước.",
        "Formic acid có trong nọc của một số loài kiến.",
      ],
      [
        ["Acetic acid là acid mạnh, phân li hoàn toàn trong nước.", "acetic acid là acid yếu"],
        [`Acetic acid không tác dụng với ${ch("CaCO3")}.`, `acetic acid mạnh hơn carbonic acid nên đẩy được ${ch("CO2")} ra khỏi muối carbonate`],
        ["Carboxylic acid có nhiệt độ sôi thấp hơn alcohol có phân tử khối tương đương.", "liên kết hydrogen giữa các phân tử acid bền hơn nên acid sôi cao hơn"],
        ["Phản ứng ester hóa là phản ứng một chiều.", "phản ứng ester hóa là phản ứng thuận nghịch"],
        ["Giấm ăn là dung dịch acetic acid có nồng độ khoảng 40 – 50%.", "giấm ăn có nồng độ khoảng 2 – 5%"],
        [`Acetic acid tác dụng với Cu giải phóng khí ${ch("H2")}.`, "Cu đứng sau H trong dãy hoạt động, không tác dụng với acetic acid"],
        ["Acetic acid có tính acid yếu hơn phenol.", "acetic acid có tính acid mạnh hơn phenol"],
      ]),
  },
  {
    id: "h11k2-phan-ung-dac-trung-carbonyl", subject: S, grade: G, chapter: C6, topic: "Phản ứng tráng bạc và phản ứng iodoform",
    hk: HK, half: 2, tk: K6, level: 1, kind: "mcq",
    make: (r) => {
      const L: [string, string, boolean, boolean][] = [ // tên, CT, aldehyde?, có nhóm CH3CO?
        ["methanal", "HCHO", true, false], ["ethanal", "CH3CHO", true, true], ["propanal", "CH3CH2CHO", true, false], ["butanal", "CH3[CH2]2CHO", true, false],
        ["propanone", "CH3COCH3", false, true], ["butanone", "CH3COCH2CH3", false, true], ["pentan-3-one", "CH3CH2COCH2CH3", false, false], ["pentan-2-one", "CH3CO[CH2]2CH3", false, true],
      ];
      const k = r.int(0, 3); const iod = k >= 2; const want = k % 2 === 0;
      const flag = (y: (typeof L)[number]) => (iod ? y[3] : y[2]);
      const x = r.pick(L.filter((y) => flag(y) === want)); const wr = pickN(r, L.filter((y) => flag(y) !== want), 3);
      const what = iod ? `tham gia phản ứng iodoform (với ${ch("I2")} trong NaOH) tạo kết tủa vàng` : "tham gia phản ứng tráng bạc với thuốc thử Tollens";
      const rule = iod ? "Phản ứng iodoform xảy ra với hợp chất carbonyl có nhóm methyl ketone $\\mathrm{CH_3CO-}$ (kể cả ethanal $\\mathrm{CH_3CHO}$)." : "Aldehyde (có nhóm –CHO) tham gia phản ứng tráng bạc; ketone thì không.";
      if (r.chance(0.4)) {
        const c = r.int(1, 4); const items = r.shuffle([...pickN(r, L.filter((y) => flag(y)), c), ...pickN(r, L.filter((y) => !flag(y)), 5 - c)]);
        return {
          stem: `Cho dãy các chất: ${items.map((y) => nf(y[0], y[1])).join(", ")}. Số chất trong dãy ${what} là`,
          ...mcq(r, String(c), nb(c, 0, 5)),
          explanation: `${rule} Các chất thỏa mãn: ${items.filter((y) => flag(y)).map((y) => y[0]).join(", ")} – có ${c} chất.`,
        };
      }
      return {
        stem: `Chất nào sau đây ${want ? "" : "KHÔNG "}${what}?`,
        ...mcq(r, nf(x[0], x[1]), wr.map((y) => nf(y[0], y[1]))),
        explanation: `${rule} Vậy chọn ${x[0]}.`,
      };
    },
  },
  {
    id: "h11k2-trang-bac-aldehyde", subject: S, grade: G, chapter: C6, topic: "Phản ứng tráng bạc – bài toán",
    hk: HK, half: 2, tk: K6, level: 3, kind: "mcq",
    make: (r) => {
      const AL: [string, string, number, number][] = [["methanal", "HCHO", 30, 4], ["ethanal", "CH3CHO", 44, 2], ["propanal", "C2H5CHO", 58, 2], ["butanal", "C3H7CHO", 72, 2]];
      const el = ntk(["H", "C", "O", "Ag"]); const rg = `dung dịch ${ch("AgNO3")} trong ${ch("NH3")}`;
      const i = r.int(0, 3); const [nm, f, M, k] = AL[i];
      const n = r.pick([0.02, 0.025, 0.04, 0.05, 0.06, 0.08, 0.1, 0.15, 0.2]); const m = n * M, mAg = n * k * 108;
      const note = "1 mol RCHO (R ≠ H) tạo 2 mol Ag; riêng 1 mol HCHO tạo 4 mol Ag.";
      if (r.chance(0.5)) {
        return {
          stem: `Cho ${vn(m, 2)} gam ${nf(nm, f)} tác dụng với lượng dư ${rg}, đun nóng. Sau khi phản ứng hoàn toàn, khối lượng Ag thu được là ${el}`,
          ...mcq(r, `${vn(mAg, 2)} gam`, [6 - k, 1, 3, 8].map((j) => `${vn(n * j * 108, 2)} gam`)),
          explanation: `${note} $n = \\dfrac{${tex(m, 2)}}{${M}} = ${tex(n, 3)}$ mol; $n_{\\mathrm{Ag}} = ${k} \\cdot ${tex(n, 3)} = ${tex(n * k, 3)}$ mol; $m_{\\mathrm{Ag}} = ${tex(mAg, 2)}$ gam.`,
        };
      }
      return {
        stem: `Cho ${vn(m, 2)} gam một aldehyde no, đơn chức, mạch hở X tác dụng với lượng dư ${rg}, đun nóng, thu được ${vn(mAg, 2)} gam Ag. X là ${el}`,
        ...mcq(r, nf(nm, f), AL.filter((_, j) => j !== i).map((y) => nf(y[0], y[1]))),
        explanation: `$n_{\\mathrm{Ag}} = \\dfrac{${tex(mAg, 2)}}{108} = ${tex(n * k, 3)}$ mol. ${i === 0 ? `Nếu X là RCHO (R ≠ H) thì $n_X = ${tex(n * 2, 3)}$ mol, $M_X = ${tex(m / (n * 2), 2)}$ – vô lí. Vậy X là HCHO: $n_X = \\dfrac{n_{\\mathrm{Ag}}}{4} = ${tex(n, 3)}$ mol, $M_X = 30$.` : `Nếu X là HCHO thì $n_X = ${tex(n * k / 4, 4)}$ mol, $M_X = ${tex(m / (n * k / 4), 2)} \\ne 30$ – loại. Vậy $n_X = \\dfrac{n_{\\mathrm{Ag}}}{2} = ${tex(n, 3)}$ mol, $M_X = \\dfrac{${tex(m, 2)}}{${tex(n, 3)}} = ${M}$.`} X là ${nm}.`,
      };
    },
  },
  {
    id: "h11k2-acid-tac-dung-naoh", subject: S, grade: G, chapter: C6, topic: "Carboxylic acid tác dụng với base – bài toán",
    hk: HK, half: 2, tk: K6, level: 3, kind: "mcq",
    make: (r) => {
      const AC: [string, string, number][] = [["formic acid", "HCOOH", 46], ["acetic acid", "CH3COOH", 60], ["propanoic acid", "C2H5COOH", 74], ["butanoic acid", "C3H7COOH", 88]];
      const el = ntk(["H", "C", "O", "Na"]);
      const i = r.int(0, 3); const [nm, f, M] = AC[i]; const n = r.pick([0.05, 0.1, 0.15, 0.2, 0.25, 0.3]); const m = n * M;
      if (r.chance(0.5)) {
        const ms = n * (M + 22);
        return {
          stem: `Trung hòa ${vn(m, 2)} gam một carboxylic acid no, đơn chức, mạch hở X bằng dung dịch NaOH vừa đủ, cô cạn dung dịch thu được ${vn(ms, 2)} gam muối khan. X là ${el}`,
          ...mcq(r, nf(nm, f), AC.filter((_, j) => j !== i).map((y) => nf(y[0], y[1]))),
          explanation: `$\\mathrm{RCOOH + NaOH \\rightarrow RCOONa + H_2O}$: 1 mol acid tạo 1 mol muối, khối lượng tăng 22 gam. $n_X = \\dfrac{${tex(ms, 2)} - ${tex(m, 2)}}{22} = ${tex(n, 2)}$ mol; $M_X = \\dfrac{${tex(m, 2)}}{${tex(n, 2)}} = ${M}$. X là ${nm}.`,
        };
      }
      const C = r.pick([0.1, 0.2, 0.25, 0.5, 1]); const V = n / C * 1000; need(V <= 3000 && exact(V, 1));
      return {
        stem: `Thể tích dung dịch NaOH ${vn(C, 2)} M cần dùng để trung hòa vừa đủ ${vn(m, 2)} gam ${nf(nm, f)} là ${el}`,
        ...mcq(r, `${vn(V, 1)} mL`, [2 * V, V / 2, n / C * 100, m / C].map((x) => `${vn(x, 1)} mL`)),
        explanation: `$n_{\\mathrm{NaOH}} = n_{\\text{acid}} = \\dfrac{${tex(m, 2)}}{${M}} = ${tex(n, 2)}$ mol; $V = \\dfrac{${tex(n, 2)}}{${tex(C, 2)}} = ${tex(V / 1000, 3)}$ L $= ${tex(V, 1)}$ mL.`,
      };
    },
  },

  /* ======================= HALF 2 – TF ======================= */
  {
    id: "h11k2-tf-dan-xuat-halogen", subject: S, grade: G, chapter: C5, topic: "Phản ứng thế và tách của dẫn xuất halogen",
    hk: HK, half: 2, tk: K5, level: 1, kind: "tf",
    make: (r) => {
      // tên, CT, bậc, sp thế (NaOH), sp thế sai, sp tách chính, sp tách sai
      const L: [string, string, number, string, string, string, string][] = [
        ["bromoethane", "CH3CH2Br", 1, "ethanol", "ethylene", "ethylene", "ethane"],
        ["1-bromopropane", "CH3CH2CH2Br", 1, "propan-1-ol", "propan-2-ol", "propene", "propane"],
        ["2-bromopropane", "CH3CHBrCH3", 2, "propan-2-ol", "propan-1-ol", "propene", "propane"],
        ["2-bromobutane", "CH3CHBrCH2CH3", 2, "butan-2-ol", "butan-1-ol", "but-2-ene", "but-1-ene"],
        ["2-chlorobutane", "CH3CHClCH2CH3", 2, "butan-2-ol", "but-2-ene", "but-2-ene", "but-1-ene"],
        ["2-chloro-2-methylpropane", "(CH3)3CCl", 3, "2-methylpropan-2-ol", "2-methylpropan-1-ol", "2-methylpropene", "but-1-ene"],
        ["2-bromo-2-methylbutane", "(CH3)2CBrCH2CH3", 3, "2-methylbutan-2-ol", "2-methylbut-2-ene", "2-methylbut-2-ene", "2-methylbut-1-ene"],
      ];
      const x = r.pick(L); const B = ["", "I", "II", "III"];
      const s1 = r.chance(0.5), s2 = r.chance(0.5), s3 = r.chance(0.5), s4 = r.chance(0.5);
      const bw = x[2] === 1 ? 2 : x[2] - 1;
      return {
        stem: `${r.pick(["Cho dẫn xuất halogen X là", "Xét hợp chất X là", "Một nhóm học sinh tìm hiểu tính chất của dẫn xuất halogen X là"])} ${nf(x[0], x[1])}.`,
        ...tf([
          [`X là dẫn xuất halogen bậc ${B[s1 ? x[2] : bw]}.`, s1],
          [`Đun nóng X với dung dịch NaOH (trong nước), sản phẩm hữu cơ thu được là ${s2 ? x[3] : x[4]}.`, s2],
          [`Đun nóng X với KOH trong ethanol, sản phẩm hữu cơ chính thu được là ${s3 ? x[5] : x[6]}.`, s3],
          [s4 ? "X hầu như không tan trong nước." : "X tan tốt trong nước do liên kết C–X phân cực.", s4],
        ]),
        explanation: `Bậc của dẫn xuất halogen là bậc của carbon liên kết với halogen: X bậc ${B[x[2]]}. Với NaOH trong nước xảy ra phản ứng thế tạo alcohol ${x[3]}; với KOH trong ethanol xảy ra phản ứng tách (quy tắc Zaitsev) tạo ${x[5]}. Dẫn xuất halogen hầu như không tan trong nước.`,
      };
    },
  },
  {
    id: "h11k2-tf-len-men-ethanol", subject: S, grade: G, chapter: C5, topic: "Sản xuất ethanol bằng phương pháp lên men",
    hk: HK, half: 2, tk: K5, level: 3, kind: "tf",
    make: (r) => {
      const m = r.pick([18, 27, 36, 45, 54, 72, 90, 180]); const H = r.pick([60, 70, 75, 80, 90]); const d = r.pick([10, 12, 15, 30, 35, 40, 45]);
      const mE = m / 180 * 2 * 46 * H / 100, mEw = m / 180 * 46 * H / 100; const VE = mE / 0.8; const Vw = VE * 100 / d, Vww = mE * 100 / d;
      const s1 = r.chance(0.5), s2 = r.chance(0.5), s3 = r.chance(0.5), s4 = r.chance(0.5);
      return {
        stem: `Lên men ${m} kg glucose (${ch("C6H12O6")}) với hiệu suất ${H}% để sản xuất rượu. Biết khối lượng riêng của ethanol là 0,8 g/mL (tức 0,8 kg/L). ${ntk(["H", "C", "O"])}`,
        ...tf([
          [s1 ? `Phản ứng lên men: $${mr("C6H12O6 -> 2C2H5OH + 2CO2")}$ (xúc tác enzyme).` : `Phản ứng lên men: $${mr("C6H12O6 + 6O2 -> 6CO2 + 6H2O")}$ (xúc tác enzyme).`, s1],
          [`Khối lượng ethanol thu được là ${vn(s2 ? mE : mEw, 2)} kg.`, s2],
          [`Pha loãng toàn bộ lượng ethanol thu được thành rượu ${d}° thì được khoảng ${vn(s3 ? Vw : Vww, 1)} lít rượu.`, s3],
          [s4 ? `Rượu ${d}° nghĩa là trong 100 mL rượu có ${d} mL ethanol nguyên chất.` : `Rượu ${d}° nghĩa là trong 100 gam rượu có ${d} gam ethanol nguyên chất.`, s4],
        ]),
        explanation: `$\\mathrm{C_6H_{12}O_6 \\rightarrow 2C_2H_5OH + 2CO_2}$. $m_{\\mathrm{C_2H_5OH}} = \\dfrac{${m}}{180} \\cdot 2 \\cdot 46 \\cdot ${tex(H / 100, 2)} = ${tex(mE, 2)}$ kg; $V_{\\mathrm{C_2H_5OH}} = \\dfrac{${tex(mE, 2)}}{0{,}8} = ${tex(VE, 3)}$ L; $V_{\\text{rượu}} = \\dfrac{${tex(VE, 3)} \\cdot 100}{${d}} \\approx ${tex(Vw, 1)}$ L. Độ rượu là số mL ethanol nguyên chất trong 100 mL rượu.`,
      };
    },
  },
  {
    id: "h11k2-tf-phenol-bromine", subject: S, grade: G, chapter: C5, topic: "Phenol tác dụng với nước bromine, NaOH",
    hk: HK, half: 2, tk: K5, level: 2, kind: "tf",
    make: (r) => {
      const n = r.pick([0.01, 0.015, 0.02, 0.025, 0.03, 0.04, 0.05, 0.06, 0.08, 0.1, 0.12, 0.15]); const m = n * 94;
      const s1 = r.chance(0.5), s2 = r.chance(0.5), s3 = r.chance(0.5), s4 = r.chance(0.5);
      const t4 = r.pick([
        ["Phenol tham gia phản ứng thế bromine vào vòng dễ hơn benzene do ảnh hưởng của nhóm –OH.", "Benzene cũng tác dụng với nước bromine tạo kết tủa trắng tương tự phenol."],
        ["Phenol tác dụng được với dung dịch NaOH, còn ethanol thì không.", "Phenol và ethanol đều tác dụng được với dung dịch NaOH."],
        [`Sục khí ${ch("CO2")} vào dung dịch sodium phenoxide thấy dung dịch vẩn đục do phenol tách ra.`, "Dung dịch phenol làm quỳ tím chuyển sang màu đỏ."],
      ]);
      return {
        stem: `Nhỏ nước bromine (dư) vào dung dịch chứa ${vn(m, 2)} gam phenol (${ch("C6H5OH")}), phản ứng xảy ra hoàn toàn. ${ntk(["H", "C", "O", "Br"])}`,
        ...tf([
          [s1 ? "Hiện tượng: xuất hiện kết tủa màu trắng." : "Hiện tượng: xuất hiện kết tủa màu vàng.", s1],
          [`Khối lượng kết tủa 2,4,6-tribromophenol thu được là ${vn(s2 ? n * 331 : n * 334, 2)} gam.`, s2],
          [`Số mol ${ch("Br2")} đã phản ứng là ${vn(s3 ? 3 * n : n, 2)} mol.`, s3],
          [s4 ? t4[0] : t4[1], s4],
        ]),
        explanation: `$\\mathrm{C_6H_5OH + 3Br_2 \\rightarrow C_6H_2Br_3OH \\downarrow + 3HBr}$, kết tủa trắng. $n_{\\text{phenol}} = \\dfrac{${tex(m, 2)}}{94} = ${tex(n, 2)}$ mol; $n_{\\mathrm{Br_2}} = ${tex(3 * n, 2)}$ mol; $m_{\\downarrow} = ${tex(n, 2)} \\cdot 331 = ${tex(n * 331, 2)}$ gam. Nhóm –OH làm vòng benzene của phenol dễ thế hơn benzene; phenol có tính acid rất yếu (tác dụng với NaOH, yếu hơn ${ch("H2CO3")}, không đổi màu quỳ), ethanol không tác dụng với NaOH.`,
      };
    },
  },
  {
    id: "h11k2-tf-ester-hoa", subject: S, grade: G, chapter: C6, topic: "Phản ứng ester hóa của acetic acid",
    hk: HK, half: 2, tk: K6, level: 3, kind: "tf",
    make: (r) => {
      const na = r.pick([0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5]), ne = r.pick([0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5]); need(na !== ne);
      const H = r.pick([50, 60, 62.5, 70, 75, 80]);
      const lim = Math.min(na, ne), mx = Math.max(na, ne); const m = lim * 88 * H / 100, mw = mx * 88 * H / 100;
      const limAcid = na < ne;
      const s1 = r.chance(0.5), s2 = r.chance(0.5), s3 = r.chance(0.5), s4 = r.chance(0.5);
      return {
        stem: `Đun nóng hỗn hợp gồm ${vn(na * 60, 2)} gam acetic acid và ${vn(ne * 46, 2)} gam ethanol với ${ch("H2SO4")} đặc làm xúc tác, hiệu suất phản ứng ester hóa là ${vn(H, 1)}%. ${ntk(["H", "C", "O"])}`,
        ...tf([
          [s1 ? "Phản ứng ester hóa là phản ứng thuận nghịch." : "Phản ứng ester hóa là phản ứng một chiều, xảy ra hoàn toàn.", s1],
          [`Hiệu suất phản ứng được tính theo ${(s2 === limAcid) ? "acetic acid" : "ethanol"}.`, s2],
          [`Khối lượng ester thu được là ${vn(s3 ? m : mw, 2)} gam.`, s3],
          [s4 ? `${ch("H2SO4")} đặc vừa làm xúc tác vừa hút nước, giúp tăng hiệu suất tạo ester.` : "Ester thu được có tên là methyl acetate.", s4],
        ]),
        explanation: `$\\mathrm{CH_3COOH + C_2H_5OH \\rightleftharpoons CH_3COOC_2H_5 + H_2O}$ (thuận nghịch). $n_{\\text{acid}} = ${tex(na, 2)}$ mol, $n_{\\text{ethanol}} = ${tex(ne, 2)}$ mol nên hiệu suất tính theo ${limAcid ? "acetic acid" : "ethanol"}. $m_{\\text{ester}} = ${tex(lim, 2)} \\cdot 88 \\cdot ${tex(H / 100, 3)} = ${tex(m, 2)}$ gam. Ester là ethyl acetate; ${ch("H2SO4")} đặc xúc tác và hút nước làm cân bằng chuyển dịch theo chiều thuận.`,
      };
    },
  },

  /* ======================= HALF 2 – SHORT ======================= */
  {
    id: "h11k2-short-do-ruou", subject: S, grade: G, chapter: C5, topic: "Độ rượu",
    hk: HK, half: 2, tk: K5, level: 1, kind: "short",
    make: (r) => {
      const d = r.pick([10, 12, 15, 25, 30, 35, 40, 45]); const V = r.pick([100, 200, 250, 300, 500, 650, 750]);
      const mode = r.int(0, 2);
      if (mode === 0) {
        const VE = V * d / 100;
        return { stem: `Một chai rượu có dung tích ${V} mL, độ rượu ${d}°. Thể tích ethanol nguyên chất có trong chai rượu là bao nhiêu mL? (làm tròn kết quả đến hàng phần mười)`, ...sh(VE, 1), explanation: `Rượu ${d}° chứa ${d} mL ethanol trong 100 mL rượu: $V = \\dfrac{${V} \\cdot ${d}}{100} = ${tex(VE, 1)}$ mL.` };
      }
      if (mode === 1) {
        const mE = V * d / 100 * 0.8;
        return { stem: `Tính khối lượng (gam) ethanol nguyên chất có trong ${V} mL rượu ${d}°, biết khối lượng riêng của ethanol là 0,8 g/mL (làm tròn kết quả đến hàng phần mười).`, ...sh(mE, 1), explanation: `$V_{\\mathrm{C_2H_5OH}} = \\dfrac{${V} \\cdot ${d}}{100} = ${tex(V * d / 100, 1)}$ mL; $m = ${tex(V * d / 100, 1)} \\cdot 0{,}8 = ${tex(mE, 2)}$ gam.` };
      }
      const VE = r.pick([20, 30, 40, 50, 60, 90, 100, 150]); const Vw = VE * 100 / d;
      return { stem: `Pha ${VE} mL ethanol nguyên chất với nước để được rượu ${d}°. Thể tích rượu thu được là bao nhiêu mL? (làm tròn kết quả đến hàng đơn vị)`, ...sh(Vw, 0), explanation: `$V_{\\text{rượu}} = \\dfrac{${VE} \\cdot 100}{${d}} \\approx ${tex(Vw, 1)}$ mL.` };
    },
  },
  {
    id: "h11k2-short-dong-phan-alcohol-carbonyl", subject: S, grade: G, chapter: C6, topic: "Đếm số đồng phân alcohol, phenol, carbonyl, acid",
    hk: HK, half: 2, tk: K6, level: 2, kind: "short",
    make: (r) => {
      const L: [string, string, number, string][] = [
        ["C3H8O", "đồng phân cấu tạo thuộc loại alcohol", 2, "propan-1-ol, propan-2-ol"],
        ["C4H10O", "đồng phân cấu tạo thuộc loại alcohol", 4, "butan-1-ol, butan-2-ol, 2-methylpropan-1-ol, 2-methylpropan-2-ol"],
        ["C4H10O", "alcohol bậc I", 2, "butan-1-ol, 2-methylpropan-1-ol"],
        ["C5H12O", "đồng phân cấu tạo thuộc loại alcohol", 8, "pentan-1-ol, pentan-2-ol, pentan-3-ol, 2-methylbutan-1-ol, 3-methylbutan-1-ol, 2-methylbutan-2-ol, 3-methylbutan-2-ol, 2,2-dimethylpropan-1-ol"],
        ["C5H12O", "alcohol bậc I", 4, "pentan-1-ol, 2-methylbutan-1-ol, 3-methylbutan-1-ol, 2,2-dimethylpropan-1-ol"],
        ["C5H12O", "alcohol bậc II", 3, "pentan-2-ol, pentan-3-ol, 3-methylbutan-2-ol"],
        ["C7H8O", "đồng phân thuộc loại phenol", 3, "2-methylphenol, 3-methylphenol, 4-methylphenol"],
        ["C4H8O", "đồng phân cấu tạo thuộc loại aldehyde", 2, "butanal, 2-methylpropanal"],
        ["C4H8O", "đồng phân cấu tạo là hợp chất carbonyl (aldehyde và ketone) mạch hở, no", 3, "butanal, 2-methylpropanal, butanone"],
        ["C5H10O", "đồng phân cấu tạo thuộc loại aldehyde", 4, "pentanal, 2-methylbutanal, 3-methylbutanal, 2,2-dimethylpropanal"],
        ["C5H10O", "đồng phân cấu tạo thuộc loại ketone", 3, "pentan-2-one, pentan-3-one, 3-methylbutan-2-one"],
        ["C4H8O2", "đồng phân cấu tạo thuộc loại carboxylic acid", 2, "butanoic acid, 2-methylpropanoic acid"],
        ["C5H10O2", "đồng phân cấu tạo thuộc loại carboxylic acid", 4, "pentanoic acid, 2-methylbutanoic acid, 3-methylbutanoic acid, 2,2-dimethylpropanoic acid"],
      ];
      const [f, q, n, l] = r.pick(L);
      const ctx = r.pick(["", `Hợp chất hữu cơ X có công thức phân tử ${ch(f)}. `, `Một học sinh viết các công thức cấu tạo ứng với công thức phân tử ${ch(f)}. `]);
      return {
        stem: ctx ? `${ctx}Có bao nhiêu ${q} ứng với công thức phân tử này?` : `Có bao nhiêu ${q} ứng với công thức phân tử ${ch(f)}?`,
        ...sh(n, 0),
        explanation: `Các đồng phân: ${l}. Có ${n} đồng phân.`,
      };
    },
  },
  {
    id: "h11k2-short-trang-bac-hon-hop", subject: S, grade: G, chapter: C6, topic: "Tráng bạc hỗn hợp aldehyde",
    hk: HK, half: 2, tk: K6, level: 3, kind: "short",
    make: (r) => {
      const [bn, bf, Mb] = r.pick([["ethanal", "CH3CHO", 44], ["propanal", "C2H5CHO", 58]] as [string, string, number][]);
      const a = r.pick([0.01, 0.02, 0.025, 0.03, 0.04, 0.05]), b = r.pick([0.01, 0.02, 0.03, 0.04, 0.05, 0.06]);
      const mAg = (4 * a + 2 * b) * 108; const rg = `dung dịch ${ch("AgNO3")} trong ${ch("NH3")}`;
      return {
        stem: `Cho hỗn hợp gồm ${vn(a * 30, 2)} gam methanal (HCHO) và ${vn(b * Mb, 2)} gam ${nf(bn, bf)} tác dụng với lượng dư ${rg}, đun nóng. Sau khi phản ứng hoàn toàn thu được m gam Ag. Tính m (làm tròn kết quả đến hàng phần mười). ${ntk(["H", "C", "O", "Ag"])}`,
        ...sh(mAg, 1),
        explanation: `$n_{\\mathrm{HCHO}} = ${tex(a, 3)}$ mol (tạo $4 \\cdot ${tex(a, 3)}$ mol Ag); $n_{${mr(bf)}} = ${tex(b, 3)}$ mol (tạo $2 \\cdot ${tex(b, 3)}$ mol Ag). $n_{\\mathrm{Ag}} = ${tex(4 * a + 2 * b, 3)}$ mol; $m = ${tex(4 * a + 2 * b, 3)} \\cdot 108 = ${tex(mAg, 3)}$ gam.`,
      };
    },
  },
  {
    id: "h11k2-short-ester-hoa", subject: S, grade: G, chapter: C6, topic: "Ester hóa – khối lượng ester, hiệu suất",
    hk: HK, half: 2, tk: K6, level: 3, kind: "short",
    make: (r) => {
      const [an, af, Ma, en, Me] = r.pick([["methanol", "CH3OH", 32, "methyl acetate", 74], ["ethanol", "C2H5OH", 46, "ethyl acetate", 88], ["propan-1-ol", "CH3CH2CH2OH", 60, "propyl acetate", 102]] as [string, string, number, string, number][]);
      const na = r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]), nb2 = r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]);
      const H = r.pick([50, 60, 65, 70, 75, 80, 85]); const lim = Math.min(na, nb2); const m = lim * Me * H / 100;
      const el = ntk(["H", "C", "O"]);
      if (r.chance(0.5)) {
        return {
          stem: `Đun nóng ${vn(na * 60, 2)} gam acetic acid với ${vn(nb2 * Ma, 2)} gam ${nf(an, af)} (xúc tác ${ch("H2SO4")} đặc), hiệu suất phản ứng ester hóa ${H}%. Khối lượng ${en} thu được là bao nhiêu gam? (làm tròn kết quả đến hàng phần mười) ${el}`,
          ...sh(m, 1),
          explanation: `$n_{\\text{acid}} = ${tex(na, 2)}$ mol, $n_{\\text{alcohol}} = ${tex(nb2, 2)}$ mol; tính theo chất có số mol nhỏ hơn: ${vn(lim, 2)} mol. $m_{\\text{ester}} = ${tex(lim, 2)} \\cdot ${Me} \\cdot ${tex(H / 100, 2)} = ${tex(m, 3)}$ gam.`,
        };
      }
      need(exact(m, 2));
      return {
        stem: `Đun nóng ${vn(na * 60, 2)} gam acetic acid với ${vn(nb2 * Ma, 2)} gam ${nf(an, af)} (xúc tác ${ch("H2SO4")} đặc), thu được ${vn(m, 2)} gam ${en}. Hiệu suất của phản ứng ester hóa là bao nhiêu phần trăm? ${el}`,
        ...sh(H, 0),
        explanation: `Theo lí thuyết, số mol ester tính theo chất thiếu: ${vn(lim, 2)} mol, tức $${tex(lim * Me, 2)}$ gam. $H = \\dfrac{${tex(m, 2)}}{${tex(lim * Me, 2)}} \\cdot 100\\% = ${H}\\%$.`,
      };
    },
  },
  {
    id: "h11k2-short-giam-an", subject: S, grade: G, chapter: C6, topic: "Xác định hàm lượng acetic acid trong giấm ăn",
    hk: HK, half: 2, tk: K6, level: 2, kind: "short",
    make: (r) => {
      const Va = r.pick([5, 10, 20]); const C = r.pick([0.1, 0.2, 0.5]); const p = r.int(20, 55) / 10;
      const Vb = round(p / 100 * Va / 60 / C * 1000, 1); need(Vb >= 5 && Vb <= 50);
      const n = C * Vb / 1000; const pct = n * 60 / Va * 100; const gL = n * 60 / Va * 1000;
      const ask = r.chance(0.6);
      return {
        stem: `Để xác định hàm lượng acetic acid trong một loại giấm ăn, lấy ${Va},0 mL giấm (coi khối lượng riêng là 1 g/mL) chuẩn độ bằng dung dịch NaOH ${vn(C, 2)} M với chỉ thị phenolphthalein thì hết ${vn(Vb, 1)} mL. ${ask ? "Nồng độ phần trăm khối lượng của acetic acid trong giấm là bao nhiêu %? (làm tròn kết quả đến hàng phần mười)" : "Hàm lượng acetic acid trong giấm là bao nhiêu gam/lít? (làm tròn kết quả đến hàng đơn vị)"} ${ntk(["H", "C", "O"])}`,
        ...(ask ? sh(pct, 1) : sh(gL, 0)),
        explanation: `$\\mathrm{CH_3COOH + NaOH \\rightarrow CH_3COONa + H_2O}$; $n_{\\mathrm{CH_3COOH}} = ${tex(C, 2)} \\cdot ${tex(Vb / 1000, 4)} = ${tex(n, 5)}$ mol, $m = ${tex(n * 60, 4)}$ gam trong ${Va} gam giấm. ${ask ? `$C\\% = \\dfrac{${tex(n * 60, 4)}}{${Va}} \\cdot 100\\% \\approx ${tex(pct, 2)}\\%$.` : `Hàm lượng $= \\dfrac{${tex(n * 60, 4)}}{${tex(Va / 1000, 3)}} \\approx ${tex(gL, 1)}$ g/L.`}`,
      };
    },
  },
];
