/* Hóa học 12 – Học kì 1 (Kết nối tri thức).
   half 1: Chương 1 Ester – Lipid, Chương 2 Carbohydrate.
   half 2: Chương 3 Hợp chất chứa nitrogen, Chương 4 Polymer. */
import { mcq, tf, short, tex, vn, need, round, type Template, type Rng, type GenOut } from "./core.ts";

const S = "Hóa học", G = 12 as const;
const C1 = "Chương 1. Ester – Lipid";
const C2 = "Chương 2. Carbohydrate";
const C3 = "Chương 3. Hợp chất chứa nitrogen";
const C4 = "Chương 4. Polymer";

/* ---------------- Tiện ích ---------------- */
const ce = (s: string) => `$\\mathrm{${s}}$`;
const AM: Record<string, number> = { H: 1, C: 12, N: 14, O: 16, F: 19, Na: 23, Cl: 35.5, K: 39, Br: 80, Ag: 108 };
const cho = (...els: string[]) => `(Cho ${els.map((e) => `${e} = ${vn(AM[e])}`).join("; ")}.)`;
const sub = (n: number) => (n === 1 ? "" : `_{${n}}`);
/** công thức phân tử theo thứ tự C, H, N, O */
const cthc = (c: number, h: number, o = 0, n = 0) => `C${sub(c)}H${sub(h)}${n ? "N" + sub(n) : ""}${o ? "O" + sub(o) : ""}`;
const nums = (xs: number[], dp = 2) => xs.filter((x) => Number.isFinite(x) && x > 0).map((x) => vn(x, dp));
const pickTF = (r: Rng, t: string, f: string): [string, boolean] => (r.chance(0.5) ? [t, true] : [f, false]);
const arrow = (l: string, rr: string, cond = "t^\\circ") => `$\\mathrm{${l}} \\xrightarrow{${cond}} \\mathrm{${rr}}$`;
const pct = (h: number) => `${vn(h, 1)}%`;
const AB = "abcdefgh";
/** "= x" hoặc "= x ≈ làm tròn" trong công thức */
const ap = (x: number, dp: number) => (round(x, dp) === round(x, 4) ? `= ${tex(x, dp)}` : `= ${tex(x, 4)} \\approx ${tex(round(x, dp), dp)}`);

/** Câu lý thuyết: chọn phát biểu đúng / sai / đếm số phát biểu đúng. falses: [phát biểu sai, giải thích] */
function theory(r: Rng, lead: string, trues: string[], falses: [string, string][]): GenOut {
  const mode = r.int(0, 2);
  if (mode === 0) {
    const right = r.pick(trues); const w = r.shuffle([...falses]).slice(0, 3);
    return {
      stem: `${lead}, phát biểu nào sau đây đúng?`, ...mcq(r, right, w.map((x) => x[0])),
      explanation: `Phát biểu đúng: ${right} Các phát biểu còn lại sai: ${w.map((x) => x[1]).join(" ")}`,
    };
  }
  if (mode === 1) {
    const f = r.pick(falses); const w = r.shuffle([...trues]).slice(0, 3);
    return { stem: `${lead}, phát biểu nào sau đây sai?`, ...mcq(r, f[0], w), explanation: `Phát biểu sai: ${f[0]} Thực tế: ${f[1]}` };
  }
  const k = r.int(1, 4);
  const items: [string, boolean, string][] = r.shuffle([
    ...r.shuffle([...trues]).slice(0, k).map((t) => [t, true, ""] as [string, boolean, string]),
    ...r.shuffle([...falses]).slice(0, 5 - k).map(([t, e]) => [t, false, e] as [string, boolean, string]),
  ]);
  const opts = r.shuffle([k - 1, k + 1, k + 2, k - 2, 5].filter((x) => x >= 0 && x <= 5 && x !== k)).map(String);
  return {
    stem: `${lead}, cho các phát biểu sau:<br>${items.map((x, i) => `(${AB[i]}) ${x[0]}`).join("<br>")}<br>Số phát biểu đúng là`,
    ...mcq(r, String(k), opts),
    explanation: `Các phát biểu đúng: ${items.map((x, i) => (x[1] ? `(${AB[i]})` : "")).filter(Boolean).join(", ")}. ` +
      items.map((x, i) => (x[1] ? "" : `(${AB[i]}) sai: ${x[2]}`)).filter(Boolean).join(" ") + ` Vậy có ${k} phát biểu đúng.`,
  };
}

/** Câu đếm: "Cho các chất: ... Số chất ... là" */
function countQ(r: Rng, pool: [string, boolean][], k: number, lead: string, ask: string, why: string): GenOut {
  const sel = r.shuffle([...pool]).slice(0, k);
  const c = sel.filter((x) => x[1]).length;
  const yes = sel.filter((x) => x[1]).map((x) => x[0]);
  const opts = r.shuffle([c - 1, c + 1, c + 2, c - 2, c + 3].filter((x) => x >= 0 && x <= k && x !== c)).map(String);
  return {
    stem: `${lead}: ${sel.map((x) => x[0]).join(", ")}. ${ask}`,
    ...mcq(r, String(c), opts),
    explanation: `${why} Trong dãy, các chất thỏa mãn là: ${yes.length ? yes.join(", ") : "không có chất nào"}. Vậy có ${c} chất.`,
  };
}

/* ---------------- Dữ liệu ester ---------------- */
type Ac = { r: string; name: string; acid: string; c: number; h: number; alk: number };
const ACIDS: Ac[] = [
  { r: "H", name: "formate", acid: "formic acid", c: 0, h: 1, alk: -1 },
  { r: "CH_3", name: "acetate", acid: "acetic acid", c: 1, h: 3, alk: 0 },
  { r: "C_2H_5", name: "propionate", acid: "propionic acid", c: 2, h: 5, alk: 1 },
  { r: "CH_2{=}CH", name: "acrylate", acid: "acrylic acid", c: 2, h: 3, alk: 4 },
  { r: "C_6H_5", name: "benzoate", acid: "benzoic acid", c: 6, h: 5, alk: 5 },
];
type Al = { r: string; name: string; c: number; h: number; acid: number; alc?: string; alcName?: string };
const ALKS: Al[] = [
  { r: "CH_3", name: "methyl", c: 1, h: 3, acid: 1, alc: "CH_3OH", alcName: "methanol" },
  { r: "C_2H_5", name: "ethyl", c: 2, h: 5, acid: 2, alc: "C_2H_5OH", alcName: "ethanol" },
  { r: "CH_2CH_2CH_3", name: "propyl", c: 3, h: 7, acid: -1, alc: "CH_3CH_2CH_2OH", alcName: "propan-1-ol" },
  { r: "CH(CH_3)_2", name: "isopropyl", c: 3, h: 7, acid: -1, alc: "CH_3CH(OH)CH_3", alcName: "propan-2-ol" },
  { r: "CH{=}CH_2", name: "vinyl", c: 2, h: 3, acid: 3 },
  { r: "C_6H_5", name: "phenyl", c: 6, h: 5, acid: 4 },
  { r: "CH_2C_6H_5", name: "benzyl", c: 7, h: 7, acid: -1, alc: "C_6H_5CH_2OH", alcName: "benzyl alcohol" },
  { r: "CH_2CH_2CH(CH_3)_2", name: "isoamyl", c: 5, h: 11, acid: -1, alc: "(CH_3)_2CHCH_2CH_2OH", alcName: "isoamyl alcohol" },
];
const NORMAL = [0, 1, 2, 3, 6, 7];
const esF = (a: Ac, b: Al) => `${a.r}COO${b.r}`;
const esName = (a: Ac, b: Al) => `${b.name} ${a.name}`;
const esC = (a: Ac, b: Al) => a.c + 1 + b.c;
const esH = (a: Ac, b: Al) => a.h + b.h;
const esM = (a: Ac, b: Al) => 12 * esC(a, b) + esH(a, b) + 32;
const saltM = (a: Ac, metal: number) => 12 * (a.c + 1) + a.h + 32 + metal;
const alcM = (b: Al) => 12 * b.c + b.h + 17;
const rM = (a: Ac) => 12 * a.c + a.h;
type Base = { f: string; M: number; met: string; m: number };
const BASES: Base[] = [{ f: "NaOH", M: 40, met: "Na", m: 23 }, { f: "KOH", M: 56, met: "K", m: 39 }];
/** các cặp (acid, gốc) khác cặp đã cho – làm phương án nhiễu */
function esterNeighbors(r: Rng, ai: number, bi: number): [number, number][] {
  const a = ACIDS[ai], b = ALKS[bi];
  const out: [number, number][] = [];
  if (a.alk >= 0 && b.acid >= 0 && !(b.acid === ai && a.alk === bi)) out.push([b.acid, a.alk]);
  const others: [number, number][] = [];
  ACIDS.forEach((_, i) => { if (i !== ai) others.push([i, bi]); });
  ALKS.forEach((_, j) => { if (j !== bi) others.push([ai, j]); });
  return [...out, ...r.shuffle(others)];
}

/* ---------------- Chất béo ---------------- */
type Fat = { name: string; r: string; acid: string; M: number; salt: string; Ms: number; liquid: boolean };
const FATS: Fat[] = [
  { name: "tristearin", r: "C_{17}H_{35}", acid: "stearic acid", M: 890, salt: "sodium stearate", Ms: 306, liquid: false },
  { name: "tripalmitin", r: "C_{15}H_{31}", acid: "palmitic acid", M: 806, salt: "sodium palmitate", Ms: 278, liquid: false },
  { name: "triolein", r: "C_{17}H_{33}", acid: "oleic acid", M: 884, salt: "sodium oleate", Ms: 304, liquid: true },
  { name: "trilinolein", r: "C_{17}H_{31}", acid: "linoleic acid", M: 878, salt: "sodium linoleate", Ms: 302, liquid: true },
];
const fatF = (f: Fat) => `(${f.r}COO)_3C_3H_5`;

/* ---------------- Carbohydrate ---------------- */
const CLS = ["monosaccharide", "disaccharide", "polysaccharide"];
type Carb = { n: string; cls: number; f: string; src: string };
const CARBS: Carb[] = [
  { n: "glucose", cls: 0, f: "C_6H_{12}O_6", src: "có nhiều trong quả nho chín nên còn được gọi là đường nho" },
  { n: "fructose", cls: 0, f: "C_6H_{12}O_6", src: "chiếm khoảng 40% trong mật ong, làm mật ong có vị ngọt sắc" },
  { n: "saccharose", cls: 1, f: "C_{12}H_{22}O_{11}", src: "có nhiều trong cây mía, củ cải đường, hoa thốt nốt" },
  { n: "maltose", cls: 1, f: "C_{12}H_{22}O_{11}", src: "là thành phần chính của mạch nha" },
  { n: "tinh bột", cls: 2, f: "(C_6H_{10}O_5)_n", src: "là thành phần chính của hạt gạo, hạt ngô, củ khoai" },
  { n: "cellulose", cls: 2, f: "(C_6H_{10}O_5)_n", src: "là thành phần chính của sợi bông, gỗ, đay" },
];

/* ---------------- Amine, amino acid ---------------- */
type Amine = { f: string; sub: string; com: string; bac: number; M: number; arom: boolean };
const AMINES: Amine[] = [
  { f: "CH_3NH_2", sub: "methanamine", com: "methylamine", bac: 1, M: 31, arom: false },
  { f: "C_2H_5NH_2", sub: "ethanamine", com: "ethylamine", bac: 1, M: 45, arom: false },
  { f: "CH_3CH_2CH_2NH_2", sub: "propan-1-amine", com: "propylamine", bac: 1, M: 59, arom: false },
  { f: "CH_3CH(NH_2)CH_3", sub: "propan-2-amine", com: "isopropylamine", bac: 1, M: 59, arom: false },
  { f: "C_6H_5NH_2", sub: "benzenamine", com: "aniline", bac: 1, M: 93, arom: true },
  { f: "(CH_3)_2NH", sub: "N-methylmethanamine", com: "dimethylamine", bac: 2, M: 45, arom: false },
  { f: "CH_3NHC_2H_5", sub: "N-methylethanamine", com: "ethylmethylamine", bac: 2, M: 59, arom: false },
  { f: "(C_2H_5)_2NH", sub: "N-ethylethanamine", com: "diethylamine", bac: 2, M: 73, arom: false },
  { f: "C_6H_5NHCH_3", sub: "N-methylbenzenamine", com: "N-methylaniline", bac: 2, M: 107, arom: true },
  { f: "(CH_3)_3N", sub: "N,N-dimethylmethanamine", com: "trimethylamine", bac: 3, M: 59, arom: false },
  { f: "(CH_3)_2NC_2H_5", sub: "N,N-dimethylethanamine", com: "ethyldimethylamine", bac: 3, M: 73, arom: false },
];
const BAC = ["", "một", "hai", "ba"];
type AA = { name: string; ab: string; f: string; M: number; nh2: number; cooh: number; c: number; h: number; o: number; n: number; color: number };
// color: 0 không đổi màu, 1 xanh, 2 đỏ
const AAS: AA[] = [
  { name: "glycine", ab: "Gly", f: "H_2N{-}CH_2{-}COOH", M: 75, nh2: 1, cooh: 1, c: 2, h: 5, o: 2, n: 1, color: 0 },
  { name: "alanine", ab: "Ala", f: "CH_3{-}CH(NH_2){-}COOH", M: 89, nh2: 1, cooh: 1, c: 3, h: 7, o: 2, n: 1, color: 0 },
  { name: "valine", ab: "Val", f: "(CH_3)_2CH{-}CH(NH_2){-}COOH", M: 117, nh2: 1, cooh: 1, c: 5, h: 11, o: 2, n: 1, color: 0 },
  { name: "lysine", ab: "Lys", f: "H_2N{-}[CH_2]_4{-}CH(NH_2){-}COOH", M: 146, nh2: 2, cooh: 1, c: 6, h: 14, o: 2, n: 2, color: 1 },
  { name: "glutamic acid", ab: "Glu", f: "HOOC{-}[CH_2]_2{-}CH(NH_2){-}COOH", M: 147, nh2: 1, cooh: 2, c: 5, h: 9, o: 4, n: 1, color: 2 },
];
const COLOR = ["không làm đổi màu quỳ tím", "làm quỳ tím chuyển sang màu xanh", "làm quỳ tím chuyển sang màu đỏ"];

/* ---------------- Polymer ---------------- */
type Poly = { p: string; m: string; mf: string; Mm: number };
const POLYS: Poly[] = [
  { p: "polyethylene (PE)", m: "ethylene", mf: "CH_2{=}CH_2", Mm: 28 },
  { p: "polypropylene (PP)", m: "propylene", mf: "CH_2{=}CH{-}CH_3", Mm: 42 },
  { p: "poly(vinyl chloride) (PVC)", m: "vinyl chloride", mf: "CH_2{=}CH{-}Cl", Mm: 62.5 },
  { p: "polystyrene (PS)", m: "styrene", mf: "C_6H_5{-}CH{=}CH_2", Mm: 104 },
  { p: "poly(methyl methacrylate) (PMMA)", m: "methyl methacrylate", mf: "CH_2{=}C(CH_3){-}COOCH_3", Mm: 100 },
  { p: "polyacrylonitrile (tơ nitron)", m: "acrylonitrile", mf: "CH_2{=}CH{-}CN", Mm: 53 },
  { p: "polybuta-1,3-diene (cao su buna)", m: "buta-1,3-diene", mf: "CH_2{=}CH{-}CH{=}CH_2", Mm: 54 },
  { p: "polytetrafluoroethylene (teflon)", m: "tetrafluoroethylene", mf: "CF_2{=}CF_2", Mm: 100 },
];
const polyEls = (p: Poly) => (p.mf.includes("Cl") ? ["H", "C", "Cl"] : p.mf.includes("F") ? ["C", "F"] : p.mf.includes("N") ? ["H", "C", "N"] : p.mf.includes("O") ? ["H", "C", "O"] : ["H", "C"]);

const seqName = (s: AA[]) => s.map((x) => x.ab).join("-");
const PEP = ["", "", "dipeptide", "tripeptide", "tetrapeptide", "pentapeptide"];

/* =================================================================== */
export const TEMPLATES: Template[] = [
  /* ======================= HALF 1: ESTER – LIPID ======================= */
  {
    id: "h12-ester-goi-ten", subject: S, grade: G, chapter: C1, topic: "Gọi tên ester", half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const ai = r.int(0, 4), bi = r.int(0, 7), a = ACIDS[ai], b = ALKS[bi];
      const nb = esterNeighbors(r, ai, bi);
      const byName = r.chance(0.5);
      const exp = `Ester ${ce(esF(a, b))} tạo bởi gốc acid ${ce(a.r + "COO{-}")} (từ ${a.acid}) và gốc ${ce("{-}" + b.r)} (${b.name}). Tên ester = tên gốc hydrocarbon gắn với O + tên gốc acid (đuôi "ate") nên là ${esName(a, b)}.`;
      const flavor = bi === 7 && ai === 1 ? " (có mùi chuối chín)" : bi === 6 && ai === 1 ? " (có mùi hoa nhài)" : "";
      if (byName) return {
        stem: `Công thức cấu tạo của ester ${esName(a, b)}${flavor} là`,
        ...mcq(r, ce(esF(a, b)), nb.map(([i, j]) => ce(esF(ACIDS[i], ALKS[j])))), explanation: exp,
      };
      return {
        stem: `Ester có công thức ${ce(esF(a, b))}${flavor} có tên gọi là`,
        ...mcq(r, esName(a, b), nb.map(([i, j]) => esName(ACIDS[i], ALKS[j]))), explanation: exp,
      };
    },
  },
  {
    id: "h12-ester-ctpt-phan-tu-khoi", subject: S, grade: G, chapter: C1, topic: "Công thức phân tử, phân tử khối ester", half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const ai = r.int(0, 4), bi = r.int(0, 7), a = ACIDS[ai], b = ALKS[bi];
      const C = esC(a, b), H = esH(a, b), M = esM(a, b);
      const exp = `${esName(a, b)} có công thức ${ce(esF(a, b))}: số C = ${a.c + 1} + ${b.c} = ${C}, số H = ${a.h} + ${b.h} = ${H} ⇒ công thức phân tử ${ce(cthc(C, H, 2))}, $M = 12\\cdot ${C} + ${H} + 16\\cdot 2 = ${M}$.`;
      if (r.chance(0.5)) return {
        stem: `Công thức phân tử của ester ${esName(a, b)} là`,
        ...mcq(r, ce(cthc(C, H, 2)), r.shuffle([cthc(C, H + 2, 2), cthc(C, H - 2, 2), cthc(C + 1, H + 2, 2), cthc(C - 1, H, 2), cthc(C, H, 1)]).map(ce)), explanation: exp,
      };
      return {
        stem: `Phân tử khối của ester ${esName(a, b)} là ${cho("H", "C", "O")}`,
        ...mcq(r, String(M), r.shuffle([M + 2, M - 2, M + 14, M - 14]).map(String)), explanation: exp,
      };
    },
  },
  {
    id: "h12-ester-thuy-phan-san-pham", subject: S, grade: G, chapter: C1, topic: "Sản phẩm thủy phân ester trong kiềm", half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const ai = r.int(0, 4), bi = r.pick([0, 1, 2, 3, 4, 4, 5, 5, 6, 7]), a = ACIDS[ai], b = ALKS[bi];
      const salt = `${a.r}COONa`;
      const prod2 = (j: number) => (j === 4 ? "CH_3CHO" : j === 5 ? "C_6H_5ONa" : ALKS[j].alc!);
      const P = (x: string, y: string) => `${ce(x)} và ${ce(y)}`;
      const right = P(salt, prod2(bi));
      const w: string[] = [];
      w.push(P(`${a.r}COOH`, bi === 5 ? "C_6H_5OH" : prod2(bi)));
      w.push(bi === 4 ? P(salt, "CH_2{=}CH{-}OH") : bi === 5 ? P(salt, "C_6H_5OH") : P(salt, `${b.r}ONa`));
      if (a.alk >= 0 && b.acid >= 0 && !(b.acid === ai && a.alk === bi)) w.push(P(`${ACIDS[b.acid].r}COONa`, prod2(a.alk)));
      w.push(P(`${ACIDS[(ai + 1) % 5].r}COONa`, prod2(bi)), P(`${ACIDS[(ai + 2) % 5].r}COONa`, prod2(bi)));
      const eqn = bi === 4 ? `${arrow(`${esF(a, b)} + NaOH`, `${salt} + CH_3CHO`)} (vinyl alcohol $\\mathrm{CH_2{=}CH{-}OH}$ sinh ra không bền, chuyển thành acetaldehyde).`
        : bi === 5 ? `${arrow(`${esF(a, b)} + 2NaOH`, `${salt} + C_6H_5ONa + H_2O`)} (phenol sinh ra phản ứng tiếp với NaOH tạo sodium phenolate).`
          : `${arrow(`${esF(a, b)} + NaOH`, `${salt} + ${b.alc}`)}.`;
      return {
        stem: `Thủy phân ester ${esName(a, b)} (${ce(esF(a, b))}) trong dung dịch NaOH dư, đun nóng. Các sản phẩm hữu cơ thu được là`,
        ...mcq(r, right, w), explanation: `Thủy phân trong môi trường kiềm (phản ứng xà phòng hóa) tạo muối của acid: ${eqn}`,
      };
    },
  },
  {
    id: "h12-ester-xa-phong-hoa-khoi-luong", subject: S, grade: G, chapter: C1, topic: "Xà phòng hóa ester – khối lượng muối", half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const ai = r.int(0, 3), bi = r.pick(NORMAL), a = ACIDS[ai], b = ALKS[bi], B = r.pick(BASES), O = BASES.find((x) => x !== B)!;
      const n = r.int(1, 8) * 0.05, M = esM(a, b), m = round(n * M, 2), Ms = saltM(a, B.m);
      const ask = r.int(0, 2); // 0 muối, 1 alcohol
      const head = `Xà phòng hóa hoàn toàn ${vn(m)} gam ${esName(a, b)}${r.chance(0.5) ? ` (${ce(esF(a, b))})` : ""} bằng dung dịch ${B.f} vừa đủ, đun nóng.`;
      const step = `$n_{\\text{ester}} = \\dfrac{${tex(m)}}{${M}} = ${tex(n)}$ mol. ${arrow(`${esF(a, b)} + ${B.f}`, `${a.r}COO${B.met} + ${b.alc}`)}.`;
      if (ask === 1) {
        const x = n * alcM(b);
        return {
          stem: `${head} Khối lượng alcohol thu được là ${cho("H", "C", "O", B.met)}`,
          ...mcq(r, `${vn(x)} gam`, r.shuffle(nums([n * Ms, m, n * (alcM(b) + 14), n * B.M])).map((s) => s + " gam")),
          explanation: `${step} $n_{\\text{alcohol}} = ${tex(n)}$ mol ⇒ $m = ${tex(n)}\\cdot ${alcM(b)} = ${tex(x)}$ gam.`,
        };
      }
      const x = n * Ms;
      return {
        stem: `${head} Cô cạn dung dịch sau phản ứng thu được m gam muối khan. Giá trị của m là ${cho("H", "C", "O", B.met)}`,
        ...mcq(r, vn(x), r.shuffle(nums([n * saltM(a, O.m), n * alcM(b), m + n * B.M, m]))),
        explanation: `${step} $n_{\\text{muối}} = n_{\\text{ester}} = ${tex(n)}$ mol ⇒ $m = ${tex(n)}\\cdot ${Ms} = ${tex(x)}$ gam.`,
      };
    },
  },
  {
    id: "h12-ester-xac-dinh-ten-tu-muoi", subject: S, grade: G, chapter: C1, topic: "Xác định ester từ khối lượng muối", half: 1, level: 3, kind: "mcq",
    make: (r) => {
      const ISO: Record<number, [number, number][]> = { 3: [[0, 1], [1, 0]], 4: [[0, 2], [0, 3], [1, 1], [2, 0]], 5: [[1, 2], [1, 3], [2, 1]] };
      const C = r.pick([3, 4, 4, 5]); const [ai, bi] = r.pick(ISO[C]); const a = ACIDS[ai], b = ALKS[bi], B = r.pick(BASES);
      const n = r.pick([0.05, 0.1, 0.15, 0.2, 0.25, 0.3]), M = esM(a, b), m = round(n * M, 2), Ms = saltM(a, B.m), ms = round(n * Ms, 2);
      const cand: [number, number][] = [...r.shuffle(ISO[C].filter(([i]) => i !== ai)), ...r.shuffle([[ai, 0], [ai, 1], [ai, 2], [(ai + 1) % 3, bi], [(ai + 2) % 3, bi], [ai, 7]] as [number, number][])];
      const wrong = cand.filter(([i, j]) => !(i === ai && ALKS[j].c === b.c)).map(([i, j]) => esName(ACIDS[i], ALKS[j]));
      return {
        stem: `Xà phòng hóa hoàn toàn ${vn(m)} gam ester X có công thức phân tử ${ce(cthc(C, 2 * C, 2))} bằng dung dịch ${B.f} vừa đủ, thu được ${vn(ms)} gam muối. Tên gọi của X là ${cho("H", "C", "O", B.met)}`,
        ...mcq(r, esName(a, b), wrong),
        explanation: `$M_X = ${M}$ ⇒ $n_X = \\dfrac{${tex(m)}}{${M}} = ${tex(n)}$ mol = $n_{\\text{muối}}$. $M_{\\text{muối}} = \\dfrac{${tex(ms)}}{${tex(n)}} = ${Ms}$. Muối $\\mathrm{RCOO${B.met}}$: $R = ${Ms} - 44 - ${B.m} = ${rM(a)}$ ⇒ gốc ${ce(a.r)}, muối ${ce(`${a.r}COO${B.met}`)}. Vậy X là ${ce(esF(a, b))}: ${esName(a, b)}.`,
      };
    },
  },
  {
    id: "h12-ester-hieu-suat-ester-hoa", subject: S, grade: G, chapter: C1, topic: "Hiệu suất phản ứng ester hóa", half: 1, level: 3, kind: "mcq",
    make: (r) => {
      const ai = r.int(0, 2), bi = r.int(0, 1), a = ACIDS[ai], b = ALKS[bi];
      const Mac = rM(a) + 45, Mal = alcM(b), Me = esM(a, b);
      const n1 = r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]), n2 = round(n1 + r.pick([0.05, 0.1, 0.2, 0.3]), 2);
      const acidLim = r.chance(0.6); const na = acidLim ? n1 : n2, nb = acidLim ? n2 : n1;
      const H = r.pick([50, 60, 62.5, 75, 80]), lim = n1, mes = round(lim * H / 100 * Me, 2);
      const ma = round(na * Mac, 2), mb = round(nb * Mal, 2);
      const head = `Đun nóng ${vn(ma)} gam ${a.acid} với ${vn(mb)} gam ${b.alcName} (xúc tác $\\mathrm{H_2SO_4}$ đặc)`;
      const step = `$n_{\\text{acid}} = \\dfrac{${tex(ma)}}{${Mac}} = ${tex(na)}$ mol; $n_{\\text{alcohol}} = \\dfrac{${tex(mb)}}{${Mal}} = ${tex(nb)}$ mol. ${arrow(`${a.r}COOH + ${b.alc}`, `${esF(a, b)} + H_2O`, "H_2SO_4, t^\\circ")} (tỉ lệ 1 : 1) ⇒ hiệu suất tính theo ${acidLim ? "acid" : "alcohol"} (${vn(lim)} mol).`;
      if (r.chance(0.5)) {
        const ws = [H * n1 / n2, (mes / (acidLim ? ma : mb)) * 100, (mes / (ma + mb)) * 100, 100 - H].filter((x) => x > 0 && x < 100);
        return {
          stem: `${head}, thu được ${vn(mes)} gam ${esName(a, b)}. Hiệu suất của phản ứng ester hóa là ${cho("H", "C", "O")}`,
          ...mcq(r, pct(H), r.shuffle(ws).map(pct)),
          explanation: `${step} $m_{\\text{ester (lí thuyết)}} = ${tex(lim)}\\cdot ${Me} = ${tex(lim * Me)}$ gam ⇒ $H = \\dfrac{${tex(mes)}}{${tex(lim * Me)}}\\cdot 100\\% = ${tex(H, 1)}\\%$.`,
        };
      }
      return {
        stem: `${head}. Biết hiệu suất phản ứng ester hóa là ${pct(H)}, khối lượng ${esName(a, b)} thu được là ${cho("H", "C", "O")}`,
        ...mcq(r, `${vn(mes)} gam`, r.shuffle(nums([n2 * H / 100 * Me, lim * Me, lim * Me / (H / 100)])).map((s) => s + " gam")),
        explanation: `${step} $m_{\\text{ester}} = ${tex(lim)}\\cdot ${Me}\\cdot ${tex(H / 100, 3)} = ${tex(mes)}$ gam.`,
      };
    },
  },
  {
    id: "h12-chat-beo-cong-thuc", subject: S, grade: G, chapter: C1, topic: "Công thức, tên gọi chất béo", half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const i = r.int(0, 3), f = FATS[i], o = FATS.filter((x) => x !== f);
      const ask = r.int(0, 3);
      const exp = `${f.name} là triester của glycerol với ${f.acid} ${ce(f.r + "COOH")}, công thức ${ce(fatF(f))}; ở điều kiện thường ${f.name} là chất béo ${f.liquid ? "lỏng (gốc acid béo không no)" : "rắn (gốc acid béo no)"}.`;
      if (ask === 0) return { stem: `Công thức của ${f.name} là`, ...mcq(r, ce(fatF(f)), o.map((x) => ce(fatF(x)))), explanation: exp };
      if (ask === 1) return { stem: `Chất béo có công thức ${ce(fatF(f))} có tên gọi là`, ...mcq(r, f.name, o.map((x) => x.name)), explanation: exp };
      if (ask === 2) return {
        stem: `Xà phòng hóa ${f.name} bằng dung dịch NaOH, thu được glycerol và muối có công thức là`,
        ...mcq(r, ce(f.r + "COONa"), o.map((x) => ce(x.r + "COONa"))), explanation: `${exp} Muối thu được là ${f.salt} ${ce(f.r + "COONa")}.`,
      };
      return { stem: `Acid béo tạo nên chất béo ${f.name} là`, ...mcq(r, `${f.acid} (${ce(f.r + "COOH")})`, o.map((x) => `${x.acid} (${ce(x.r + "COOH")})`)), explanation: exp };
    },
  },
  {
    id: "h12-chat-beo-xa-phong-hoa", subject: S, grade: G, chapter: C1, topic: "Xà phòng hóa chất béo – tính khối lượng", half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const f = r.pick(FATS), B = r.pick(BASES), O = BASES.find((x) => x !== B)!;
      const n = r.pick([0.01, 0.02, 0.04, 0.05, 0.1, 0.15, 0.2]), m = round(n * f.M, 2);
      const Ms = f.Ms - 23 + B.m, Mo = f.Ms - 23 + O.m;
      const ask = r.int(0, 2);
      const head = `Xà phòng hóa hoàn toàn ${vn(m)} gam ${f.name} ${ce(fatF(f))} bằng dung dịch ${B.f} vừa đủ.`;
      const step = `$n = \\dfrac{${tex(m)}}{${f.M}} = ${tex(n)}$ mol; ${arrow(`${fatF(f)} + 3${B.f}`, `3${f.r}COO${B.met} + C_3H_5(OH)_3`)}.`;
      const el = cho("H", "C", "O", B.met);
      if (ask === 0) {
        const x = n * 92;
        return { stem: `${head} Khối lượng glycerol thu được là ${el}`, ...mcq(r, `${vn(x)} gam`, r.shuffle(nums([3 * n * 92, n * 92 / 3, 3 * n * B.M])).map((s) => s + " gam")), explanation: `${step} $n_{\\text{glycerol}} = ${tex(n)}$ mol ⇒ $m = ${tex(n)}\\cdot 92 = ${tex(x)}$ gam.` };
      }
      if (ask === 1) {
        const x = 3 * n * Ms;
        return { stem: `${head} Khối lượng xà phòng (muối) thu được là ${el}`, ...mcq(r, `${vn(x)} gam`, r.shuffle(nums([n * Ms, 3 * n * Mo, m + 3 * n * B.M])).map((s) => s + " gam")), explanation: `${step} $n_{\\text{muối}} = 3\\cdot ${tex(n)} = ${tex(3 * n)}$ mol ⇒ $m = ${tex(3 * n)}\\cdot ${Ms} = ${tex(x)}$ gam (hoặc bảo toàn khối lượng: $m_{\\text{muối}} = m_{\\text{chất béo}} + m_{\\mathrm{${B.f}}} - m_{\\text{glycerol}}$).` };
      }
      const x = 3 * n * B.M;
      return { stem: `${head} Khối lượng ${B.f} đã phản ứng là ${el}`, ...mcq(r, `${vn(x)} gam`, r.shuffle(nums([n * B.M, 3 * n * O.M, n * O.M])).map((s) => s + " gam")), explanation: `${step} $n_{\\mathrm{${B.f}}} = 3n = ${tex(3 * n)}$ mol ⇒ $m = ${tex(3 * n)}\\cdot ${B.M} = ${tex(x)}$ gam.` };
    },
  },
  {
    id: "h12-xa-phong-chat-beo-ly-thuyet", subject: S, grade: G, chapter: C1, topic: "Chất béo, xà phòng, chất giặt rửa", half: 1, level: 1, kind: "mcq",
    make: (r) => theory(r, r.pick(["Về chất béo, xà phòng và chất giặt rửa", "Khi nói về lipid và xà phòng", "Về ester và chất béo"]), [
      "Chất béo là triester của glycerol với các acid béo.",
      "Thành phần chính của xà phòng là muối sodium hoặc potassium của acid béo.",
      "Phân tử xà phòng gồm đầu ưa nước $\\mathrm{-COO^-}$ và đuôi hydrocarbon dài kị nước.",
      "Chất giặt rửa tổng hợp vẫn dùng được với nước cứng.",
      "Hydrogen hóa chất béo lỏng (xúc tác Ni, đun nóng) thu được chất béo rắn.",
      "Chất béo không tan trong nước và nhẹ hơn nước.",
      "Xà phòng hóa chất béo luôn thu được glycerol.",
      "Ester thường có mùi thơm, được dùng làm hương liệu trong thực phẩm và mĩ phẩm.",
    ], [
      ["Chất béo là triester của ethylene glycol với các acid béo.", "chất béo là triester của glycerol."],
      ["Xà phòng có tác dụng giặt rửa tốt trong nước cứng.", "xà phòng tạo kết tủa với ion $\\mathrm{Ca^{2+}}$, $\\mathrm{Mg^{2+}}$ nên kém tác dụng trong nước cứng."],
      ["Đuôi hydrocarbon trong phân tử xà phòng là phần ưa nước.", "đuôi hydrocarbon kị nước, ưa dầu mỡ."],
      ["Dầu thực vật chứa chủ yếu gốc acid béo no nên ở trạng thái lỏng.", "dầu thực vật lỏng vì chứa chủ yếu gốc acid béo không no."],
      ["Chất béo tan tốt trong nước.", "chất béo không tan trong nước, tan trong dung môi hữu cơ."],
      ["Thủy phân chất béo trong môi trường acid là phản ứng một chiều.", "thủy phân trong môi trường acid là phản ứng thuận nghịch; trong môi trường kiềm mới là một chiều."],
      ["Để tách xà phòng ra khỏi hỗn hợp sau phản ứng, người ta thêm dung dịch HCl.", "người ta thêm dung dịch NaCl bão hòa để xà phòng tách ra và nổi lên trên."],
      ["Ester có nhiệt độ sôi cao hơn alcohol có cùng phân tử khối.", "ester không có liên kết hydrogen giữa các phân tử nên sôi thấp hơn alcohol tương ứng."],
    ]),
  },
  /* ======================= HALF 1: CARBOHYDRATE ======================= */
  {
    id: "h12-carbohydrate-phan-loai", subject: S, grade: G, chapter: C2, topic: "Phân loại, công thức, nguồn gốc carbohydrate", half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const ask = r.int(0, 2), c = r.pick(CARBS);
      if (ask === 0) {
        const others = r.shuffle(CARBS.filter((x) => x.cls !== c.cls)).map((x) => x.n);
        return { stem: `Chất nào sau đây thuộc loại ${CLS[c.cls]}?`, ...mcq(r, c.n, others), explanation: `Monosaccharide: glucose, fructose; disaccharide: saccharose, maltose; polysaccharide: tinh bột, cellulose. Vậy chọn ${c.n}.` };
      }
      if (ask === 1) return {
        stem: `Carbohydrate X ${c.src}. X là`,
        ...mcq(r, c.n, r.shuffle(CARBS.filter((x) => x !== c && !(c.cls === 0 && x.cls === 0))).map((x) => x.n)),
        explanation: `Carbohydrate ${c.src} là ${c.n} (${ce(c.f)}).`,
      };
      return {
        stem: `Công thức phân tử của ${c.n} là`,
        ...mcq(r, ce(c.f), r.shuffle(["C_6H_{12}O_6", "C_{12}H_{22}O_{11}", "(C_6H_{10}O_5)_n", "C_6H_{10}O_5", "C_{12}H_{24}O_{12}"].filter((x) => x !== c.f)).map(ce)),
        explanation: `${c.n} thuộc loại ${CLS[c.cls]}, công thức ${ce(c.f)}.`,
      };
    },
  },
  {
    id: "h12-carbohydrate-tinh-chat", subject: S, grade: G, chapter: C2, topic: "Tính chất hóa học của carbohydrate", half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const PROPS = [
        { p: "tham gia phản ứng tráng bạc", yes: [0, 1, 3] },
        { p: "bị thủy phân trong môi trường acid", yes: [2, 3, 4, 5] },
        { p: "hòa tan được $\\mathrm{Cu(OH)_2}$ ở nhiệt độ thường tạo dung dịch màu xanh lam", yes: [0, 1, 2, 3] },
        { p: "làm mất màu nước bromine", yes: [0, 3] },
        { p: "tạo màu xanh tím với dung dịch iodine", yes: [4] },
      ];
      const P = r.pick(PROPS), yes = CARBS.filter((_, i) => P.yes.includes(i)), no = CARBS.filter((_, i) => !P.yes.includes(i));
      const why = `Các chất ${P.p}: ${yes.map((x) => x.n).join(", ")}; các chất không có tính chất này: ${no.map((x) => x.n).join(", ")}.`;
      const mode = r.int(0, 2);
      if (mode === 2) return countQ(r, CARBS.map((x, i) => [x.n, P.yes.includes(i)] as [string, boolean]), r.int(4, 6), "Cho các chất", `Số chất ${P.p} là`, why);
      const pos = mode === 0 ? no.length >= 3 : yes.length < 3;
      if (pos) return { stem: `Chất nào sau đây ${P.p}?`, ...mcq(r, r.pick(yes).n, r.shuffle(no).map((x) => x.n)), explanation: why };
      return { stem: `Chất nào sau đây KHÔNG ${P.p}?`, ...mcq(r, r.pick(no).n, r.shuffle(yes).map((x) => x.n)), explanation: why };
    },
  },
  {
    id: "h12-trang-bac-glucose", subject: S, grade: G, chapter: C2, topic: "Phản ứng tráng bạc – tính khối lượng", half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const sg = r.pick([{ n: "glucose", M: 180, f: "C_6H_{12}O_6" }, { n: "fructose", M: 180, f: "C_6H_{12}O_6" }, { n: "glucose", M: 180, f: "C_6H_{12}O_6" }, { n: "maltose", M: 342, f: "C_{12}H_{22}O_{11}" }]);
      const n = r.pick([0.02, 0.04, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3]), m = round(n * sg.M, 2), mAg = round(2 * n * 108, 2);
      const Mw = sg.M === 180 ? 162 : 180;
      const el = cho("H", "C", "O", "Ag");
      const ctx = r.pick(["Cho", "Cho dung dịch chứa", "Thực hiện phản ứng tráng gương bằng cách cho"]);
      const step = `Mỗi phân tử ${sg.n} phản ứng với thuốc thử Tollens tạo 2 Ag: $n_{\\mathrm{Ag}} = 2n_{\\text{${sg.n}}}$.`;
      if (r.chance(0.5)) return {
        stem: `${ctx} ${vn(m)} gam ${sg.n} tác dụng hoàn toàn với lượng dư thuốc thử Tollens, đun nóng, thu được m gam Ag. Giá trị của m là ${el}`,
        ...mcq(r, vn(mAg), r.shuffle(nums([n * 108, 4 * n * 108, (m / Mw) * 2 * 108]))),
        explanation: `$n = \\dfrac{${tex(m)}}{${sg.M}} = ${tex(n)}$ mol. ${step} ⇒ $m = 2\\cdot ${tex(n)}\\cdot 108 = ${tex(mAg)}$ gam.`,
      };
      return {
        stem: `${ctx} m gam ${sg.n} tác dụng hoàn toàn với lượng dư thuốc thử Tollens, đun nóng, thu được ${vn(mAg)} gam Ag. Giá trị của m là ${el}`,
        ...mcq(r, vn(m), r.shuffle(nums([2 * n * sg.M, (n / 2) * sg.M, n * Mw]))),
        explanation: `$n_{\\mathrm{Ag}} = \\dfrac{${tex(mAg)}}{108} = ${tex(2 * n)}$ mol. ${step} ⇒ $n = ${tex(n)}$ mol, $m = ${tex(n)}\\cdot ${sg.M} = ${tex(m)}$ gam.`,
      };
    },
  },
  {
    id: "h12-len-men-glucose", subject: S, grade: G, chapter: C2, topic: "Lên men glucose – hiệu suất", half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const n = r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.75, 1]), H = r.pick([50, 60, 75, 80, 90]), m = round(n * 180, 2), h = H / 100;
      const ctx = r.pick([`Lên men ${vn(m)} gam glucose thành ethanol`, `Một cơ sở làm rượu vang lên men nước nho chứa ${vn(m)} gam glucose`, `Ủ men ${vn(m)} gam glucose (từ nước ép trái cây) để tạo ethanol`]);
      const eq = arrow("C_6H_{12}O_6", "2C_2H_5OH + 2CO_2", "\\text{enzyme}");
      if (r.chance(0.5)) {
        const v = 2 * n * h * 24.79;
        return {
          stem: `${ctx} với hiệu suất ${H}%. Thể tích khí $\\mathrm{CO_2}$ thu được ở điều kiện chuẩn (25 °C, 1 bar; 1 mol khí chiếm 24,79 L) là ${cho("H", "C", "O")}`,
          ...mcq(r, `${vn(v)} L`, r.shuffle(nums([2 * n * 24.79, n * h * 24.79, (2 * n / h) * 24.79, 2 * n * h * 22.4])).map((s) => s + " L")),
          explanation: `${eq}. $n_{\\text{glucose}} = \\dfrac{${tex(m)}}{180} = ${tex(n)}$ mol ⇒ $n_{\\mathrm{CO_2}} = 2\\cdot ${tex(n)}\\cdot ${tex(h)} = ${tex(2 * n * h, 3)}$ mol ⇒ $V = ${tex(2 * n * h, 3)}\\cdot 24{,}79 = ${tex(v)}$ L.`,
        };
      }
      const x = 2 * n * h * 46;
      return {
        stem: `${ctx} với hiệu suất ${H}%. Khối lượng ethanol thu được là ${cho("H", "C", "O")}`,
        ...mcq(r, `${vn(x)} gam`, r.shuffle(nums([2 * n * 46, n * h * 46, (2 * n / h) * 46])).map((s) => s + " gam")),
        explanation: `${eq}. $n_{\\text{glucose}} = ${tex(n)}$ mol ⇒ $n_{\\mathrm{C_2H_5OH}} = 2\\cdot ${tex(n)}\\cdot ${tex(h)} = ${tex(2 * n * h, 3)}$ mol ⇒ $m = ${tex(2 * n * h, 3)}\\cdot 46 = ${tex(x)}$ gam.`,
      };
    },
  },
  {
    id: "h12-tinh-bot-san-xuat-ethanol", subject: S, grade: G, chapter: C2, topic: "Sản xuất ethanol từ tinh bột, cellulose", half: 1, level: 3, kind: "mcq",
    make: (r) => {
      const src = r.pick([{ t: "gạo", c: "tinh bột" }, { t: "ngô (bắp)", c: "tinh bột" }, { t: "sắn (khoai mì)", c: "tinh bột" }, { t: "mùn cưa", c: "cellulose" }, { t: "rơm rạ", c: "cellulose" }]);
      const p = r.pick([40, 50, 60, 65, 70, 75, 80]), m = r.pick([100, 162, 200, 324, 500, 810, 1000]), H = r.pick([50, 60, 70, 75, 80, 81, 90]);
      const k = (m * p / 100) / 162; const x = k * 2 * 46 * H / 100;
      return {
        stem: `Từ ${m} kg ${src.t} chứa ${p}% ${src.c} (còn lại là tạp chất trơ), người ta sản xuất ethanol theo sơ đồ: ${src.c} → glucose → ethanol, với hiệu suất cả quá trình là ${H}%. Khối lượng ethanol thu được là ${cho("H", "C", "O")}`,
        ...mcq(r, `${vn(x)} kg`, r.shuffle(nums([k * 46 * H / 100, (m * p / 100) / 180 * 92 * H / 100, k * 92 / (H / 100), (m / 162) * 92 * H / 100])).map((s) => s + " kg")),
        explanation: `$m_{\\text{${src.c}}} = ${m}\\cdot ${tex(p / 100)} = ${tex(m * p / 100)}$ kg. $\\mathrm{(C_6H_{10}O_5)_n} \\to n\\,\\mathrm{C_6H_{12}O_6} \\to 2n\\,\\mathrm{C_2H_5OH}$: cứ 162 kg → 92 kg ethanol. $m = \\dfrac{${tex(m * p / 100)}}{162}\\cdot 92\\cdot ${tex(H / 100)} = ${tex(x)}$ kg.`,
      };
    },
  },
  /* ----- half 1: Đúng/Sai ----- */
  {
    id: "h12-tf-ester", subject: S, grade: G, chapter: C1, topic: "Ester – cấu tạo, tính chất, xà phòng hóa", half: 1, level: 2, kind: "tf",
    make: (r) => {
      const ai = r.int(0, 2), bi = r.int(0, 3), a = ACIDS[ai], b = ALKS[bi];
      const C = esC(a, b), H = esH(a, b), M = esM(a, b), n = r.pick([0.05, 0.1, 0.15, 0.2]), m = round(n * M, 2), ms = n * saltM(a, 23);
      const nb = esterNeighbors(r, ai, bi).filter(([i, j]) => !(i === ai && ALKS[j].c === b.c));
      const wn = esName(ACIDS[nb[0][0]], ALKS[nb[0][1]]);
      const hasAg = ai === 0;
      const it3 = pickTF(r, hasAg ? "X có tham gia phản ứng tráng bạc." : "X không tham gia phản ứng tráng bạc.", hasAg ? "X không tham gia phản ứng tráng bạc." : "X có tham gia phản ứng tráng bạc.");
      const it4 = pickTF(r, `Khối lượng muối thu được là ${vn(ms)} gam.`, `Khối lượng muối thu được là ${vn(r.pick([n * alcM(b), n * saltM(a, 39), m + n * 40]))} gam.`);
      return {
        stem: `Ester X có công thức cấu tạo ${ce(esF(a, b))}. Xà phòng hóa hoàn toàn ${vn(m)} gam X bằng dung dịch NaOH vừa đủ, đun nóng. ${cho("H", "C", "O", "Na")}`,
        ...tf([
          pickTF(r, `X có công thức phân tử ${ce(cthc(C, H, 2))}.`, `X có công thức phân tử ${ce(cthc(C, H + 2, 2))}.`),
          pickTF(r, `Tên gọi của X là ${esName(a, b)}.`, `Tên gọi của X là ${wn}.`),
          it3, it4,
        ]),
        explanation: `X là ${esName(a, b)}, công thức phân tử ${ce(cthc(C, H, 2))} ($M = ${M}$). ${hasAg ? "X là ester của formic acid (có nhóm $\\mathrm{HCOO-}$) nên có phản ứng tráng bạc." : "X không phải ester của formic acid nên không tráng bạc."} $n_X = ${tex(n)}$ mol ⇒ $m_{\\text{muối}} = ${tex(n)}\\cdot ${saltM(a, 23)} = ${tex(ms)}$ gam (${ce(a.r + "COONa")}).`,
      };
    },
  },
  {
    id: "h12-tf-chat-beo", subject: S, grade: G, chapter: C1, topic: "Chất béo – cấu tạo, tính chất, xà phòng hóa", half: 1, level: 3, kind: "tf",
    make: (r) => {
      const f = r.pick(FATS), o = r.pick(FATS.filter((x) => x !== f)), n = r.pick([0.01, 0.02, 0.05, 0.1, 0.2]), m = round(n * f.M, 2);
      const soap = r.chance(0.5);
      const it4 = soap
        ? pickTF(r, `Khối lượng muối thu được là ${vn(3 * n * f.Ms)} gam.`, `Khối lượng muối thu được là ${vn(n * f.Ms)} gam.`)
        : pickTF(r, `Khối lượng glycerol thu được là ${vn(n * 92)} gam.`, `Khối lượng glycerol thu được là ${vn(3 * n * 92)} gam.`);
      return {
        stem: `Chất béo X là ${f.name}. Xà phòng hóa hoàn toàn ${vn(m)} gam X bằng dung dịch NaOH vừa đủ, thu được glycerol và muối. ${cho("H", "C", "O", "Na")}`,
        ...tf([
          pickTF(r, `Công thức của X là ${ce(fatF(f))}.`, `Công thức của X là ${ce(fatF(o))}.`),
          pickTF(r, `Ở điều kiện thường, X ở trạng thái ${f.liquid ? "lỏng" : "rắn"}.`, `Ở điều kiện thường, X ở trạng thái ${f.liquid ? "rắn" : "lỏng"}.`),
          pickTF(r, f.liquid ? "X có phản ứng cộng $\\mathrm{H_2}$ (xúc tác Ni, đun nóng)." : "X không có phản ứng cộng $\\mathrm{H_2}$ (xúc tác Ni, đun nóng).", f.liquid ? "X không có phản ứng cộng $\\mathrm{H_2}$ (xúc tác Ni, đun nóng)." : "X có phản ứng cộng $\\mathrm{H_2}$ (xúc tác Ni, đun nóng)."),
          it4,
        ]),
        explanation: `${f.name}: ${ce(fatF(f))}, $M = ${f.M}$, gốc ${f.liquid ? "acid béo không no ⇒ chất béo lỏng, cộng được $\\mathrm{H_2}$" : "acid béo no ⇒ chất béo rắn, không cộng $\\mathrm{H_2}$"}. $n_X = \\dfrac{${tex(m)}}{${f.M}} = ${tex(n)}$ mol ⇒ $n_{\\text{glycerol}} = ${tex(n)}$ mol ($${tex(n * 92)}$ gam), $n_{\\text{muối}} = 3n = ${tex(3 * n)}$ mol ⇒ $m_{\\text{muối}} = ${tex(3 * n)}\\cdot ${f.Ms} = ${tex(3 * n * f.Ms)}$ gam.`,
      };
    },
  },
  {
    id: "h12-tf-glucose-fructose", subject: S, grade: G, chapter: C2, topic: "Glucose và fructose", half: 1, level: 2, kind: "tf",
    make: (r) => {
      const n = r.pick([0.05, 0.1, 0.15, 0.2, 0.25]), sg = r.pick(["glucose", "fructose"]), m = round(n * 180, 2), mAg = 2 * n * 108;
      const ctx = r.pick(["Glucose và fructose là hai monosaccharide phổ biến trong tự nhiên.", "Glucose có nhiều trong quả nho chín, fructose có nhiều trong mật ong.", "Glucose và fructose đều có trong nhiều loại quả chín và mật ong."]);
      return {
        stem: `${ctx} Cho ${vn(m)} gam ${sg} tác dụng hoàn toàn với lượng dư thuốc thử Tollens, đun nóng. ${cho("H", "C", "O", "Ag")}`,
        ...tf([
          pickTF(r, "Glucose và fructose là đồng phân của nhau, có cùng công thức phân tử $\\mathrm{C_6H_{12}O_6}$.", "Glucose và fructose là đồng phân của nhau, có cùng công thức phân tử $\\mathrm{C_{12}H_{22}O_{11}}$."),
          pickTF(r, "Glucose và fructose đều hòa tan được $\\mathrm{Cu(OH)_2}$ ở nhiệt độ thường tạo dung dịch màu xanh lam.", "Chỉ glucose hòa tan được $\\mathrm{Cu(OH)_2}$ ở nhiệt độ thường, fructose thì không."),
          pickTF(r, "Có thể dùng nước bromine để phân biệt dung dịch glucose và dung dịch fructose.", "Có thể dùng thuốc thử Tollens để phân biệt dung dịch glucose và dung dịch fructose."),
          pickTF(r, `Khối lượng Ag thu được là ${vn(mAg)} gam.`, `Khối lượng Ag thu được là ${vn(r.pick([n * 108, 4 * n * 108]))} gam.`),
        ]),
        explanation: `Glucose và fructose cùng là $\\mathrm{C_6H_{12}O_6}$, đều có nhiều nhóm OH kề nhau nên hòa tan $\\mathrm{Cu(OH)_2}$; cả hai đều tráng bạc (fructose chuyển thành glucose trong môi trường kiềm) nên không phân biệt được bằng Tollens; chỉ glucose (có nhóm CHO) làm mất màu nước bromine. $n = \\dfrac{${tex(m)}}{180} = ${tex(n)}$ mol ⇒ $n_{\\mathrm{Ag}} = ${tex(2 * n)}$ mol ⇒ $m_{\\mathrm{Ag}} = ${tex(mAg)}$ gam.`,
      };
    },
  },
  {
    id: "h12-tf-tinh-bot-cellulose", subject: S, grade: G, chapter: C2, topic: "Tinh bột và cellulose", half: 1, level: 3, kind: "tf",
    make: (r) => {
      const m = r.pick([1, 1.62, 2, 3.24, 5, 8.1, 10]), p = r.pick([50, 60, 70, 75, 80]), H = r.pick([60, 70, 75, 80, 90]);
      const x = round(m * p / 100 / 162 * 92 * H / 100, 2);
      const ctx = r.pick(["Tinh bột và cellulose là nguồn nguyên liệu để sản xuất ethanol sinh học (pha xăng E5, E10).", "Tinh bột có nhiều trong gạo, ngô, sắn; cellulose có nhiều trong bông, gỗ, đay.", "Tinh bột và cellulose là hai polysaccharide quan trọng trong tự nhiên."]);
      return {
        stem: `${ctx} Một nhà máy dùng ${vn(m)} tấn sắn khô chứa ${p}% tinh bột để sản xuất ethanol với hiệu suất cả quá trình ${H}%. ${cho("H", "C", "O")}`,
        ...tf([
          pickTF(r, "Tinh bột và cellulose đều có công thức chung $\\mathrm{(C_6H_{10}O_5)_n}$.", "Tinh bột và cellulose là đồng phân của nhau vì có cùng công thức $\\mathrm{(C_6H_{10}O_5)_n}$."),
          pickTF(r, "Nhỏ dung dịch iodine vào mặt cắt củ sắn thấy xuất hiện màu xanh tím.", "Nhỏ dung dịch iodine vào bông nõn (cellulose) thấy xuất hiện màu xanh tím."),
          pickTF(r, "Thủy phân hoàn toàn tinh bột hoặc cellulose trong môi trường acid đều thu được glucose.", "Thủy phân hoàn toàn tinh bột trong môi trường acid thu được glucose và fructose."),
          pickTF(r, `Khối lượng ethanol thu được là ${vn(x)} tấn.`, `Khối lượng ethanol thu được là ${vn(round(x / 2, 2))} tấn.`),
        ]),
        explanation: `Tinh bột và cellulose có cùng công thức chung nhưng giá trị n khác nhau nên không phải đồng phân. Chỉ tinh bột tạo màu xanh tím với iodine. Thủy phân hoàn toàn cả hai chỉ thu được glucose. $m_{\\text{tinh bột}} = ${tex(m)}\\cdot ${tex(p / 100)} = ${tex(m * p / 100, 3)}$ tấn; 162 tấn tinh bột → 92 tấn ethanol ⇒ $m = \\dfrac{${tex(m * p / 100, 3)}}{162}\\cdot 92\\cdot ${tex(H / 100)} = ${tex(x)}$ tấn.`,
      };
    },
  },
  /* ----- half 1: Trả lời ngắn ----- */
  {
    id: "h12-short-dong-phan-ester", subject: S, grade: G, chapter: C1, topic: "Số đồng phân ester", half: 1, level: 2, kind: "short",
    make: (r) => {
      const D: Record<string, number[]> = { "C_2H_4O_2": [1, 1, 2], "C_3H_6O_2": [2, 1, 3], "C_4H_8O_2": [4, 2, 6], "C_5H_{10}O_2": [9, 4, 13] };
      const f = r.pick(Object.keys(D)), q = r.int(0, 2), v = D[f][q];
      const asks = [
        r.pick(["Có bao nhiêu ester ứng với công thức phân tử", "Số đồng phân cấu tạo ester ứng với công thức phân tử"]),
        r.pick(["Có bao nhiêu ester có phản ứng tráng bạc ứng với công thức phân tử", "Số đồng phân cấu tạo ester của formic acid ứng với công thức phân tử"]),
        r.pick(["Có bao nhiêu hợp chất đơn chức, mạch hở (acid và ester) ứng với công thức phân tử", "Số đồng phân cấu tạo đơn chức, mạch hở tác dụng được với dung dịch NaOH ứng với công thức phân tử"]),
      ];
      const L: Record<string, string> = {
        "C_2H_4O_2": "ester: $\\mathrm{HCOOCH_3}$; acid: $\\mathrm{CH_3COOH}$",
        "C_3H_6O_2": "ester: $\\mathrm{HCOOC_2H_5}$, $\\mathrm{CH_3COOCH_3}$; acid: $\\mathrm{C_2H_5COOH}$",
        "C_4H_8O_2": "ester: $\\mathrm{HCOOCH_2CH_2CH_3}$, $\\mathrm{HCOOCH(CH_3)_2}$, $\\mathrm{CH_3COOC_2H_5}$, $\\mathrm{C_2H_5COOCH_3}$; acid: $\\mathrm{CH_3CH_2CH_2COOH}$, $\\mathrm{(CH_3)_2CHCOOH}$",
        "C_5H_{10}O_2": "ester: 4 ester $\\mathrm{HCOOC_4H_9}$, 2 ester $\\mathrm{CH_3COOC_3H_7}$, 1 ester $\\mathrm{C_2H_5COOC_2H_5}$, 2 ester $\\mathrm{C_3H_7COOCH_3}$ (tổng 9); acid: 4 acid $\\mathrm{C_4H_9COOH}$",
      };
      return {
        stem: `${asks[q]} ${ce(f)}?`, ...short(v, 1),
        explanation: `Liệt kê theo gốc: ${L[f]}. ${["Số ester", "Số ester dạng $\\mathrm{HCOOR}$ (tráng bạc được)", "Tổng số acid và ester"][q]} là ${v}.`,
      };
    },
  },
  {
    id: "h12-short-ester-chat-ran", subject: S, grade: G, chapter: C1, topic: "Xà phòng hóa ester, kiềm dư – chất rắn khan", half: 1, level: 3, kind: "short",
    make: (r) => {
      const ai = r.int(0, 2), bi = r.int(0, 2), a = ACIDS[ai], b = ALKS[bi], B = r.pick(BASES);
      const n = r.pick([0.05, 0.1, 0.15, 0.2]), ex = r.pick([0.02, 0.05, 0.1]), C = r.pick([0.5, 1, 2]);
      const nB = round(n + ex, 3), V = round(nB / C * 1000, 1); need(Number.isInteger(V));
      const m = round(n * esM(a, b), 2), x = n * saltM(a, B.m) + ex * B.M;
      return {
        stem: `Xà phòng hóa hoàn toàn ${vn(m)} gam ${esName(a, b)} bằng ${V} mL dung dịch ${B.f} ${vn(C)} M. Cô cạn dung dịch sau phản ứng thu được m gam chất rắn khan. Tính m (làm tròn đến hàng phần mười). ${cho("H", "C", "O", B.met)}`,
        ...short(x, 1),
        explanation: `$n_{\\text{ester}} = \\dfrac{${tex(m)}}{${esM(a, b)}} = ${tex(n)}$ mol; $n_{\\mathrm{${B.f}}} = ${tex(V / 1000, 3)}\\cdot ${tex(C)} = ${tex(nB, 3)}$ mol (dư ${vn(ex)} mol). Chất rắn gồm ${ce(`${a.r}COO${B.met}`)} (${vn(n)} mol) và ${B.f} dư: $m = ${tex(n)}\\cdot ${saltM(a, B.m)} + ${tex(ex)}\\cdot ${B.M} ${ap(x, 1)}$ gam (alcohol bay hơi khi cô cạn).`,
      };
    },
  },
  {
    id: "h12-short-chi-so-chat-beo", subject: S, grade: G, chapter: C1, topic: "Chỉ số acid, chỉ số xà phòng hóa", half: 1, level: 3, kind: "short",
    make: (r) => {
      const t = r.int(0, 2);
      if (t === 0) {
        const f = r.pick(FATS), x = 3 * 56000 / f.M;
        return {
          stem: `Chỉ số xà phòng hóa của chất béo là số miligam KOH cần để xà phòng hóa hết lượng triglyceride và trung hòa hết acid béo tự do có trong 1 gam chất béo. Tính chỉ số xà phòng hóa của ${r.pick(["một mẫu", "mẫu"])} ${f.name} tinh khiết ${r.pick(["(làm tròn đến hàng phần mười)", "(kết quả làm tròn đến hàng phần mười)"])}. ${cho("H", "C", "O", "K")}`,
          ...short(x, 1),
          explanation: `1 mol ${f.name} ($M = ${f.M}$) cần 3 mol KOH. 1 gam chất béo cần $\\dfrac{3}{${f.M}}$ mol KOH ⇒ $\\dfrac{3\\cdot 56\\cdot 1000}{${f.M}} ${ap(x, 1)}$ mg.`,
        };
      }
      if (t === 1) {
        const m = r.pick([5, 8, 10, 14, 20, 28]), V = r.int(2, 12), C = r.pick([0.05, 0.1, 0.2]), B = r.pick(BASES);
        const x = V * C * 56 / m;
        return {
          stem: `Chỉ số acid của chất béo là số miligam KOH cần để trung hòa acid béo tự do có trong 1 gam chất béo. Để trung hòa lượng acid béo tự do trong ${m} gam một mẫu chất béo cần ${V} mL dung dịch ${B.f} ${vn(C)} M. Chỉ số acid của mẫu chất béo là bao nhiêu (làm tròn đến hàng phần mười)? (Cho K = 39; O = 16; H = 1.)`,
          ...short(x, 1),
          explanation: `$n_{\\mathrm{OH^-}} = ${V}\\cdot 10^{-3}\\cdot ${tex(C)} = ${tex(V * C, 3)}\\cdot 10^{-3}$ mol. Lượng KOH tương ứng: $${tex(V * C, 3)}\\cdot 10^{-3}\\cdot 56 = ${tex(V * C * 56 / 1000, 4)}$ g $= ${tex(V * C * 56, 2)}$ mg${B.f === "NaOH" ? " (chỉ số tính theo KOH dù dùng NaOH)" : ""}. Chỉ số acid $= \\dfrac{${tex(V * C * 56, 2)}}{${m}} ${ap(x, 1)}$.`,
        };
      }
      const idx = r.pick([4, 5, 6, 7, 8, 9]), m = r.pick([10, 20, 25, 50, 100]), B = r.pick(BASES);
      const x = idx * m * B.M / 56;
      return {
        stem: `Một mẫu chất béo có chỉ số acid bằng ${idx}. Khối lượng ${B.f} (tính theo miligam) cần để trung hòa lượng acid béo tự do có trong ${m} gam mẫu chất béo đó là bao nhiêu (làm tròn đến hàng phần mười)? ${cho("H", "O", B.met)}`,
        ...short(x, 1),
        explanation: `Chỉ số acid ${idx}: 1 gam chất béo cần ${idx} mg KOH ⇒ ${m} gam cần $${idx} \\cdot ${m} = ${idx * m}$ mg KOH${B.f === "NaOH" ? `, tức $\\dfrac{${idx * m}}{56}$ mmol OH⁻ ⇒ $m_{\\mathrm{NaOH}} = \\dfrac{${idx * m}}{56}\\cdot 40 ${ap(x, 1)}$ mg` : ""}.`,
      };
    },
  },
  {
    id: "h12-short-len-men", subject: S, grade: G, chapter: C2, topic: "Lên men glucose – tính ethanol, CO₂", half: 1, level: 2, kind: "short",
    make: (r) => {
      const n = r.pick([0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5]), H = r.pick([50, 60, 70, 75, 80, 90]), m = round(n * 180, 2), h = H / 100;
      const ctx = r.pick(["Lên men", "Người ta lên men", "Trong phòng thí nghiệm, lên men"]);
      if (r.chance(0.5)) {
        const x = 2 * n * h * 46;
        return { stem: `${ctx} ${vn(m)} gam glucose với hiệu suất ${H}%. Khối lượng ethanol thu được là bao nhiêu gam (làm tròn đến hàng phần mười)? ${cho("H", "C", "O")}`, ...short(x, 1), explanation: `$n_{\\text{glucose}} = ${tex(n)}$ mol ⇒ $n_{\\mathrm{C_2H_5OH}} = 2\\cdot ${tex(n)}\\cdot ${tex(h)} = ${tex(2 * n * h, 3)}$ mol ⇒ $m = ${tex(2 * n * h, 3)}\\cdot 46 ${ap(x, 1)}$ gam.` };
      }
      const x = 2 * n * h * 24.79;
      return { stem: `${ctx} ${vn(m)} gam glucose với hiệu suất ${H}%. Thể tích khí $\\mathrm{CO_2}$ (đkc, 1 mol khí chiếm 24,79 L) thu được là bao nhiêu lít (làm tròn đến hàng phần mười)? ${cho("H", "C", "O")}`, ...short(x, 1), explanation: `$n_{\\mathrm{CO_2}} = 2\\cdot ${tex(n)}\\cdot ${tex(h)} = ${tex(2 * n * h, 3)}$ mol ⇒ $V = ${tex(2 * n * h, 3)}\\cdot 24{,}79 ${ap(x, 1)}$ L.` };
    },
  },
  {
    id: "h12-short-dich-truyen-glucose", subject: S, grade: G, chapter: C2, topic: "Nồng độ dung dịch glucose", half: 1, level: 1, kind: "short",
    make: (r) => {
      const c = r.pick([5, 10, 20, 30]), t = r.int(0, 2);
      if (t === 0) {
        const m = r.pick([100, 250, 500, 1000]), x = m * c / 100;
        return { stem: `Một ${r.pick(["chai", "túi"])} dịch truyền chứa ${m} gam dung dịch glucose ${c}%. Khối lượng glucose (gam) trong ${r.pick(["chai", "bình"])} dịch truyền là bao nhiêu?`, ...short(x, 1), explanation: `$m_{\\text{glucose}} = ${m}\\cdot ${c}\\% = ${tex(x, 1)}$ gam.` };
      }
      if (t === 1) {
        const V = r.pick([100, 250, 500]), d = r.pick([1.02, 1.04, 1.08, 1.1]), x = V * d * c / 100;
        return { stem: `Một chai dịch truyền chứa ${V} mL dung dịch glucose ${c}% (khối lượng riêng ${vn(d)} g/mL). Khối lượng glucose trong chai là bao nhiêu gam (làm tròn đến hàng phần mười)?`, ...short(x, 1), explanation: `$m_{\\text{dd}} = ${V}\\cdot ${tex(d)} = ${tex(V * d)}$ gam ⇒ $m_{\\text{glucose}} = ${tex(V * d)}\\cdot ${c}\\% ${ap(x, 1)}$ gam.` };
      }
      const m = r.pick([180, 250, 360, 500, 900]), x = m * c / 100 / 180;
      return { stem: `Một bình chứa ${m} gam dung dịch glucose ${c}%. Số mol glucose trong bình là bao nhiêu (làm tròn đến hàng phần trăm)? ${cho("H", "C", "O")}`, ...short(x, 2), explanation: `$m_{\\text{glucose}} = ${m}\\cdot ${c}\\% = ${tex(m * c / 100)}$ gam ⇒ $n = \\dfrac{${tex(m * c / 100)}}{180} ${ap(x, 2)}$ mol.` };
    },
  },
  {
    id: "h12-short-saccharose-trang-bac", subject: S, grade: G, chapter: C2, topic: "Thủy phân saccharose rồi tráng bạc", half: 1, level: 3, kind: "short",
    make: (r) => {
      const n = r.pick([0.02, 0.05, 0.1, 0.15, 0.2]), H = r.pick([50, 60, 75, 80, 90]), m = round(n * 342, 2), x = n * H / 100 * 4 * 108;
      return {
        stem: `Thủy phân ${vn(m)} gam saccharose trong môi trường acid với hiệu suất ${H}%. Trung hòa dung dịch sau phản ứng rồi cho tác dụng với lượng dư thuốc thử Tollens, đun nóng, thu được m gam Ag. Tính m (làm tròn đến hàng phần mười). ${cho("H", "C", "O", "Ag")}`,
        ...short(x, 1),
        explanation: `$n_{\\text{sac}} = \\dfrac{${tex(m)}}{342} = ${tex(n)}$ mol, bị thủy phân $${tex(n * H / 100, 4)}$ mol → ${vn(n * H / 100, 4)} mol glucose + ${vn(n * H / 100, 4)} mol fructose; cả hai đều tráng bạc (1 → 2 Ag), saccharose dư không tráng bạc. $n_{\\mathrm{Ag}} = 4\\cdot ${tex(n * H / 100, 4)} = ${tex(4 * n * H / 100, 4)}$ mol ⇒ $m = ${tex(4 * n * H / 100, 4)}\\cdot 108 ${ap(x, 1)}$ gam.`,
      };
    },
  },

  /* ======================= HALF 2: HỢP CHẤT CHỨA NITROGEN ======================= */
  {
    id: "h12-amine-bac", subject: S, grade: G, chapter: C3, topic: "Bậc của amine", half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const why = `Bậc của amine bằng số gốc hydrocarbon liên kết trực tiếp với nguyên tử N (không phải bậc của nguyên tử C mang nhóm $\\mathrm{NH_2}$).`;
      if (r.chance(0.6)) {
        const k = r.int(1, 3), right = r.pick(AMINES.filter((x) => x.bac === k)), o = r.shuffle(AMINES.filter((x) => x.bac !== k));
        const useName = r.chance(0.3);
        const lab = (x: Amine) => (useName ? `${x.com} (${ce(x.f)})` : ce(x.f));
        return { stem: `Chất nào sau đây là amine bậc ${BAC[k]}?`, ...mcq(r, lab(right), o.map(lab)), explanation: `${why} ${[right, ...o.slice(0, 3)].map((x) => `${ce(x.f)}: bậc ${BAC[x.bac]}`).join("; ")}.` };
      }
      const k = r.int(1, 3);
      return countQ(r, AMINES.map((x) => [ce(x.f), x.bac === k] as [string, boolean]), r.int(5, 6), "Cho các amine", `Số amine bậc ${BAC[k]} là`, `${why} Amine bậc ${BAC[k]} có dạng ${["", "$\\mathrm{R{-}NH_2}$", "$\\mathrm{R{-}NH{-}R'}$", "$\\mathrm{R{-}N(R')R''}$"][k]}.`);
    },
  },
  {
    id: "h12-amine-goi-ten", subject: S, grade: G, chapter: C3, topic: "Gọi tên amine", half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const a = r.pick(AMINES), o = [...r.shuffle(AMINES.filter((x) => x !== a && x.M === a.M)), ...r.shuffle(AMINES.filter((x) => x.M !== a.M))];
      const exp = `${ce(a.f)} là amine bậc ${BAC[a.bac]}, tên thay thế ${a.sub}, tên thường ${a.com}.`;
      const t = r.int(0, 2);
      if (t === 0) return { stem: `Amine ${ce(a.f)} có tên thay thế là`, ...mcq(r, a.sub, o.map((x) => x.sub)), explanation: exp };
      if (t === 1) return { stem: `Công thức cấu tạo của ${a.sub} là`, ...mcq(r, ce(a.f), o.map((x) => ce(x.f))), explanation: exp };
      return { stem: `Amine có tên thường ${a.com} có tên thay thế là`, ...mcq(r, a.sub, o.map((x) => x.sub)), explanation: exp };
    },
  },
  {
    id: "h12-quy-tim-hop-chat-nitrogen", subject: S, grade: G, chapter: C3, topic: "Tính acid – base, đổi màu quỳ tím", half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const POOL: [string, number][] = [
        ["methylamine", 1], ["ethylamine", 1], ["dimethylamine", 1], ["trimethylamine", 1], ["lysine", 1],
        ["aniline", 0], ["glycine", 0], ["alanine", 0], ["valine", 0],
        ["glutamic acid", 2], ["acetic acid", 2],
      ];
      const why = "Amine no (methylamine, ethylamine, …) và lysine (2 nhóm $\\mathrm{NH_2}$, 1 nhóm COOH) làm quỳ hóa xanh; aniline có tính base rất yếu và các amino acid có số nhóm $\\mathrm{NH_2}$ bằng số nhóm COOH (glycine, alanine, valine) không làm đổi màu quỳ; glutamic acid (2 nhóm COOH) và acetic acid làm quỳ hóa đỏ.";
      const c = r.int(0, 2);
      if (r.chance(0.35)) return countQ(r, POOL.map(([n, k]) => [n, k === c] as [string, boolean]), r.int(5, 6), "Cho các dung dịch", `Số dung dịch ${COLOR[c]} là`, why);
      const yes = POOL.filter((x) => x[1] === c), no = r.shuffle(POOL.filter((x) => x[1] !== c));
      return { stem: `Dung dịch chất nào sau đây ${COLOR[c]}?`, ...mcq(r, r.pick(yes)[0], no.map((x) => x[0])), explanation: why };
    },
  },
  {
    id: "h12-amine-hcl-khoi-luong-muoi", subject: S, grade: G, chapter: C3, topic: "Amine tác dụng với HCl – khối lượng muối", half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const a = r.pick(AMINES), n = r.chance(0.5) ? r.int(1, 10) * 0.02 : r.int(1, 3) * 0.1, m = round(n * a.M, 2), x = round(n * (a.M + 36.5), 2);
      const el = cho("H", "C", "N", "Cl");
      const salt = a.f.replace(/NH_2$/, "NH_3Cl");
      const eq = `$\\mathrm{${a.f} + HCl \\rightarrow ${a.bac === 1 && /NH_2$/.test(a.f) ? salt : `muối ammonium`}}$`;
      if (r.chance(0.5)) return {
        stem: `Cho ${vn(m)} gam ${a.com} (${ce(a.f)}) tác dụng vừa đủ với dung dịch HCl, thu được m gam muối. Giá trị của m là ${el}`,
        ...mcq(r, vn(x), r.shuffle(nums([m + n * 35.5, n * 36.5, m + 2 * n * 36.5]))),
        explanation: `$n = \\dfrac{${tex(m)}}{${a.M}} = ${tex(n)}$ mol; amine đơn chức phản ứng với HCl tỉ lệ 1 : 1 ⇒ $m_{\\text{muối}} = m_{\\text{amine}} + m_{\\mathrm{HCl}} = ${tex(m)} + ${tex(n)}\\cdot 36{,}5 = ${tex(x)}$ gam.`,
      };
      const C = r.pick([0.5, 1, 2]), V = round(n / C * 1000, 1);
      return {
        stem: `Để trung hòa ${vn(m)} gam ${a.com} (${ce(a.f)}) cần vừa đủ V mL dung dịch HCl ${vn(C)} M. Giá trị của V là ${el}`,
        ...mcq(r, vn(V, 1), r.shuffle(nums([2 * V, V / 2, n / C, n * C * 1000], 3))),
        explanation: `$n_{\\text{amine}} = \\dfrac{${tex(m)}}{${a.M}} = ${tex(n)}$ mol = $n_{\\mathrm{HCl}}$ ⇒ $V = \\dfrac{${tex(n)}}{${tex(C)}} = ${tex(n / C, 3)}$ L = ${vn(V, 1)} mL.`,
      };
    },
  },
  {
    id: "h12-amine-xac-dinh-cong-thuc", subject: S, grade: G, chapter: C3, topic: "Xác định công thức amine", half: 2, level: 3, kind: "mcq",
    make: (r) => {
      const k = r.int(1, 4), M = 14 * k + 17, n = r.int(1, 10) * 0.02, m = round(n * M, 2), ms = round(n * (M + 36.5), 2);
      const others = r.shuffle([1, 2, 3, 4, 5].filter((x) => x !== k)).map((j) => ce(cthc(j, 2 * j + 3, 0, 1)));
      return {
        stem: `Cho ${vn(m)} gam một amine no, đơn chức, mạch hở X tác dụng vừa đủ với dung dịch HCl, thu được ${vn(ms)} gam muối. Công thức phân tử của X là ${cho("H", "C", "N", "Cl")}`,
        ...mcq(r, ce(cthc(k, 2 * k + 3, 0, 1)), others),
        explanation: `Bảo toàn khối lượng: $m_{\\mathrm{HCl}} = ${tex(ms)} - ${tex(m)} = ${tex(ms - m)}$ gam ⇒ $n_X = n_{\\mathrm{HCl}} = \\dfrac{${tex(ms - m)}}{36{,}5} = ${tex(n)}$ mol ⇒ $M_X = \\dfrac{${tex(m)}}{${tex(n)}} = ${M}$. X là $\\mathrm{C_nH_{2n+3}N}$: $14n + 17 = ${M}$ ⇒ $n = ${k}$, X là ${ce(cthc(k, 2 * k + 3, 0, 1))}.`,
      };
    },
  },
  {
    id: "h12-amino-acid-cong-thuc", subject: S, grade: G, chapter: C3, topic: "Công thức, tên gọi amino acid", half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const a = r.pick(AAS), o = r.shuffle(AAS.filter((x) => x !== a)), t = r.int(0, 3);
      const exp = `${a.name} (${a.ab}): ${ce(a.f)}, công thức phân tử ${ce(cthc(a.c, a.h, a.o, a.n))}, $M = ${a.M}$.`;
      if (t === 0) return { stem: `Công thức cấu tạo của ${a.name} là`, ...mcq(r, ce(a.f), o.map((x) => ce(x.f))), explanation: exp };
      if (t === 1) return { stem: `Amino acid có công thức ${ce(a.f)} có tên thường là`, ...mcq(r, a.name, o.map((x) => x.name)), explanation: exp };
      if (t === 2) return { stem: `Phân tử khối của ${a.name} là ${cho("H", "C", "N", "O")}`, ...mcq(r, String(a.M), o.map((x) => String(x.M))), explanation: exp };
      return { stem: `Kí hiệu viết tắt của ${a.name} là`, ...mcq(r, a.ab, o.map((x) => x.ab)), explanation: exp };
    },
  },
  {
    id: "h12-amino-acid-muoi", subject: S, grade: G, chapter: C3, topic: "Amino acid tác dụng với HCl, NaOH", half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const a = r.pick(AAS), acid = r.chance(0.5), k = acid ? a.nh2 : a.cooh, d = acid ? 36.5 : 22;
      const n = r.chance(0.5) ? r.int(1, 10) * 0.02 : r.int(1, 3) * 0.1, m = round(n * a.M, 2), x = m + n * k * d;
      const k2 = k === 1 ? 2 : 1;
      const el = acid ? cho("H", "C", "N", "O", "Cl") : cho("H", "C", "N", "O", "Na");
      return {
        stem: `Cho ${vn(m)} gam ${a.name} (${ce(a.f)}) tác dụng vừa đủ với dung dịch ${acid ? "HCl" : "NaOH"}, thu được m gam muối. Giá trị của m là ${el}`,
        ...mcq(r, vn(x), r.shuffle(nums([m + n * k2 * d, m + n * k * (acid ? 35.5 : 40), m + n * k * (acid ? 22 : 36.5)]))),
        explanation: `$n = \\dfrac{${tex(m)}}{${a.M}} = ${tex(n)}$ mol. ${a.name} có ${acid ? `${a.nh2} nhóm $\\mathrm{NH_2}$ ⇒ $n_{\\mathrm{HCl}} = ${tex(n * k)}$ mol, $m_{\\text{muối}} = ${tex(m)} + ${tex(n * k)}\\cdot 36{,}5` : `${a.cooh} nhóm COOH ⇒ mỗi nhóm COOH thành COONa làm khối lượng tăng 22: $m_{\\text{muối}} = ${tex(m)} + ${tex(n * k)}\\cdot 22`} = ${tex(x)}$ gam.`,
      };
    },
  },
  {
    id: "h12-peptide-cau-tao", subject: S, grade: G, chapter: C3, topic: "Cấu tạo peptide", half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const L = r.int(2, 5), seq = Array.from({ length: L }, () => r.pick(AAS.slice(0, 3))), X = seqName(seq), t = r.int(0, 3);
      const head = `Cho peptide X: ${X}.`;
      if (t === 0) return {
        stem: `${head} Số liên kết peptide trong phân tử X là`, ...mcq(r, String(L - 1), r.shuffle([L, L + 1, L - 2, 2 * L].filter((x) => x >= 0)).map(String)),
        explanation: `X là ${PEP[L]} (${L} gốc α-amino acid) nên có $${L} - 1 = ${L - 1}$ liên kết peptide $\\mathrm{-CO{-}NH-}$.`,
      };
      if (t === 1 || t === 2) {
        const end = t === 1 ? seq[0] : seq[L - 1];
        return {
          stem: `${head} Amino acid ở đầu ${t === 1 ? "N" : "C"} của X là`, ...mcq(r, end.name, r.shuffle(AAS.filter((x) => x !== end)).map((x) => x.name)),
          explanation: `Theo quy ước, peptide được viết từ đầu N (còn nhóm $\\mathrm{NH_2}$ tự do, bên trái) đến đầu C (còn nhóm COOH tự do, bên phải). Đầu ${t === 1 ? "N" : "C"} của X là ${end.ab} (${end.name}).`,
        };
      }
      const dd = new Set(seq.map((x) => x.ab)).size;
      return {
        stem: `${head} Thủy phân hoàn toàn X thu được bao nhiêu loại α-amino acid khác nhau?`, ...mcq(r, String(dd), r.shuffle([L, dd + 1, dd - 1, L + 1, L - 1].filter((x) => x >= 1 && x !== dd)).map(String)),
        explanation: `Các gốc trong X: ${seq.map((x) => x.ab).join(", ")} ⇒ có ${dd} loại α-amino acid (${[...new Set(seq.map((x) => x.name))].join(", ")}).`,
      };
    },
  },
  {
    id: "h12-peptide-thuy-phan-khoi-luong", subject: S, grade: G, chapter: C3, topic: "Thủy phân peptide – tính khối lượng", half: 2, level: 3, kind: "mcq",
    make: (r) => {
      const L = r.int(2, 4), seq = Array.from({ length: L }, () => r.pick(AAS.slice(0, 3))), X = seqName(seq);
      const sumM = seq.reduce((s, x) => s + x.M, 0), Mp = sumM - 18 * (L - 1), n = r.pick([0.05, 0.1, 0.15, 0.2]), m = round(n * Mp, 2);
      const step = `$M_X = ${seq.map((x) => x.M).join(" + ")} - 18\\cdot ${L - 1} = ${Mp}$ ⇒ $n_X = \\dfrac{${tex(m)}}{${Mp}} = ${tex(n)}$ mol.`;
      if (r.chance(0.5)) {
        const x = n * sumM;
        return {
          stem: `Thủy phân hoàn toàn ${vn(m)} gam ${PEP[L]} ${X} trong môi trường acid (vừa đủ nước), thu được m gam hỗn hợp amino acid. Giá trị của m là ${cho("H", "C", "N", "O")}`,
          ...mcq(r, vn(x), r.shuffle(nums([m, m + n * L * 18, m - n * 18 * (L - 1)]))),
          explanation: `${step} Thủy phân cần $${L - 1}$ phân tử $\\mathrm{H_2O}$: $m = ${tex(m)} + ${tex(n)}\\cdot ${L - 1}\\cdot 18 = ${tex(x)}$ gam.`,
        };
      }
      const x = n * (sumM + 22 * L);
      return {
        stem: `Thủy phân hoàn toàn ${vn(m)} gam ${PEP[L]} ${X} bằng dung dịch NaOH vừa đủ, đun nóng, thu được m gam muối. Giá trị của m là ${cho("H", "C", "N", "O", "Na")}`,
        ...mcq(r, vn(x), r.shuffle(nums([m + n * L * 40, n * sumM, n * (sumM + 23 * L)]))),
        explanation: `${step} ${X} + ${L}NaOH → muối + $\\mathrm{H_2O}$: $m_{\\text{muối}} = ${tex(m)} + ${tex(n)}\\cdot ${L}\\cdot 40 - ${tex(n)}\\cdot 18 = ${tex(x)}$ gam.`,
      };
    },
  },
  {
    id: "h12-protein-enzyme-ly-thuyet", subject: S, grade: G, chapter: C3, topic: "Peptide, protein, enzyme", half: 2, level: 1, kind: "mcq",
    make: (r) => theory(r, r.pick(["Về peptide và protein", "Khi nói về protein và enzyme", "Về hợp chất chứa nitrogen"]), [
      "Protein bị đông tụ khi đun nóng hoặc khi gặp acid, base, một số muối.",
      "Nhỏ dung dịch $\\mathrm{HNO_3}$ đặc vào lòng trắng trứng thấy xuất hiện kết tủa màu vàng.",
      "Tripeptide và protein đều có phản ứng màu biuret với $\\mathrm{Cu(OH)_2}$ trong môi trường kiềm.",
      "Phần lớn enzyme có bản chất là protein.",
      "Liên kết $\\mathrm{-CO{-}NH-}$ giữa hai đơn vị α-amino acid gọi là liên kết peptide.",
      "Thủy phân hoàn toàn protein đơn giản thu được các α-amino acid.",
      "Enzyme có tính chọn lọc (đặc hiệu) cao.",
      "Aniline tác dụng với nước bromine tạo kết tủa trắng.",
    ], [
      ["Dipeptide có phản ứng màu biuret.", "dipeptide chỉ có 1 liên kết peptide nên không có phản ứng màu biuret."],
      ["Nhỏ dung dịch $\\mathrm{HNO_3}$ đặc vào lòng trắng trứng thấy xuất hiện màu tím.", "$\\mathrm{HNO_3}$ đặc tạo kết tủa màu vàng; màu tím là của phản ứng biuret."],
      ["Enzyme hoạt động tốt ở mọi nhiệt độ.", "enzyme chỉ hoạt động tốt trong khoảng nhiệt độ và pH thích hợp."],
      ["Tất cả protein đều tan tốt trong nước.", "protein dạng sợi (keratin, collagen…) không tan trong nước."],
      ["Thủy phân hoàn toàn protein đơn giản thu được glucose.", "thủy phân protein đơn giản thu được các α-amino acid."],
      ["Tripeptide có 3 liên kết peptide.", "tripeptide có 2 liên kết peptide."],
      ["Liên kết $\\mathrm{-CO{-}NH-}$ giữa hai đơn vị β-amino acid gọi là liên kết peptide.", "liên kết peptide chỉ hình thành giữa các đơn vị α-amino acid."],
      ["Aniline làm quỳ tím chuyển sang màu xanh.", "aniline có tính base rất yếu, không làm đổi màu quỳ tím."],
    ]),
  },
  /* ======================= HALF 2: POLYMER ======================= */
  {
    id: "h12-polymer-monomer", subject: S, grade: G, chapter: C4, topic: "Monomer tạo polymer", half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const p = r.pick(POLYS), o = r.shuffle(POLYS.filter((x) => x !== p)), t = r.int(0, 2);
      const exp = `${p.p} được điều chế bằng phản ứng trùng hợp ${p.m} ${ce(p.mf)}.`;
      if (t === 0) return { stem: `Monomer dùng để điều chế ${p.p} là`, ...mcq(r, `${p.m} (${ce(p.mf)})`, o.map((x) => `${x.m} (${ce(x.mf)})`)), explanation: exp };
      if (t === 1) return { stem: `Trùng hợp ${p.m} thu được polymer nào sau đây?`, ...mcq(r, p.p, o.map((x) => x.p)), explanation: exp };
      return { stem: `Công thức của monomer dùng để điều chế ${p.p} là`, ...mcq(r, ce(p.mf), o.map((x) => ce(x.mf))), explanation: exp };
    },
  },
  {
    id: "h12-polymer-trung-hop-trung-ngung", subject: S, grade: G, chapter: C4, topic: "Phản ứng trùng hợp, trùng ngưng", half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const ADD = ["polyethylene", "poly(vinyl chloride)", "polystyrene", "polypropylene", "poly(methyl methacrylate)", "polyacrylonitrile", "cao su buna", "teflon"];
      const COND = ["nylon-6,6", "poly(ethylene terephthalate)", "nhựa phenol – formaldehyde"];
      const why = "Trùng hợp: monomer có liên kết bội (hoặc vòng kém bền) như ethylene, vinyl chloride, styrene, propylene, methyl methacrylate, acrylonitrile, buta-1,3-diene, tetrafluoroethylene. Trùng ngưng: monomer có ít nhất hai nhóm chức phản ứng, giải phóng phân tử nhỏ ($\\mathrm{H_2O}$): nylon-6,6 (hexamethylenediamine + adipic acid), poly(ethylene terephthalate) (ethylene glycol + terephthalic acid), nhựa phenol – formaldehyde.";
      const mode = r.int(0, 2);
      if (mode === 2) {
        const cond = r.chance(0.5);
        return countQ(r, [...ADD.map((x) => [x, !cond] as [string, boolean]), ...COND.map((x) => [x, cond] as [string, boolean])], r.int(5, 6), "Cho các polymer", `Số polymer được điều chế bằng phản ứng ${cond ? "trùng ngưng" : "trùng hợp"} là`, why);
      }
      if (mode === 0) return { stem: "Polymer nào sau đây được điều chế bằng phản ứng trùng ngưng?", ...mcq(r, r.pick(COND), r.shuffle([...ADD])), explanation: why };
      return { stem: "Polymer nào sau đây được điều chế bằng phản ứng trùng hợp?", ...mcq(r, r.pick(ADD), r.shuffle([...COND])), explanation: why };
    },
  },
  {
    id: "h12-vat-lieu-polymer", subject: S, grade: G, chapter: C4, topic: "Vật liệu polymer: chất dẻo, tơ, cao su", half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const G1: Record<string, string[]> = {
        "tơ thiên nhiên": ["sợi bông", "tơ tằm", "len lông cừu"],
        "tơ bán tổng hợp (nhân tạo)": ["tơ visco", "tơ cellulose acetate"],
        "tơ tổng hợp": ["nylon-6,6", "tơ nitron (olon)", "tơ capron"],
      };
      const G2: Record<string, string[]> = {
        "chất dẻo": ["polyethylene", "poly(vinyl chloride)", "polystyrene", "poly(methyl methacrylate)"],
        "cao su": ["cao su buna", "cao su isoprene", "cao su thiên nhiên"],
        "tơ": ["nylon-6,6", "tơ nitron (olon)", "tơ tằm"],
      };
      const grp = r.chance(0.5) ? G1 : G2, cats = Object.keys(grp), c = r.pick(cats);
      const why = cats.map((k) => `${k}: ${grp[k].join(", ")}`).join("; ") + ".";
      const other = cats.filter((k) => k !== c).flatMap((k) => grp[k]);
      if (r.chance(0.3)) return countQ(r, [...grp[c].map((x) => [x, true] as [string, boolean]), ...other.map((x) => [x, false] as [string, boolean])], 5, "Cho các vật liệu", `Số vật liệu thuộc loại ${c} là`, why);
      const noun = grp === G1 ? "Tơ" : "Vật liệu";
      return { stem: `${noun} nào sau đây thuộc loại ${c}?`, ...mcq(r, r.pick(grp[c]), r.shuffle(other)), explanation: why };
    },
  },
  {
    id: "h12-he-so-polymer-hoa", subject: S, grade: G, chapter: C4, topic: "Hệ số polymer hóa, phân tử khối polymer", half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const p = r.pick(POLYS.filter((x) => x.Mm !== 54)), n = r.int(4, 60) * 250, M = round(n * p.Mm, 1);
      const el = cho(...polyEls(p));
      const fmt = (x: number) => String(Math.round(x));
      if (r.chance(0.5)) return {
        stem: `Một mẫu ${p.p} có phân tử khối trung bình là ${vn(M, 1)}. Hệ số polymer hóa trung bình của mẫu polymer đó là ${el}`,
        ...mcq(r, fmt(n), r.shuffle([2 * n, n / 2, M / (p.Mm - 2), M / (p.Mm + 14)].map(fmt))),
        explanation: `Mắt xích của ${p.p} có khối lượng bằng monomer ${ce(p.mf)}: $M = ${tex(p.Mm, 1)}$ ⇒ $n = \\dfrac{${tex(M, 1)}}{${tex(p.Mm, 1)}} = ${n}$.`,
      };
      return {
        stem: `Một mẫu ${p.p} có hệ số polymer hóa trung bình là ${n}. Phân tử khối trung bình của mẫu polymer đó là ${el}`,
        ...mcq(r, vn(M, 1), r.shuffle([2 * M, n * (p.Mm - 2), n * (p.Mm + 2), M / 2].map((x) => vn(x, 1)))),
        explanation: `Mắt xích có khối lượng bằng monomer ${ce(p.mf)} ($${tex(p.Mm, 1)}$) ⇒ $M = ${n}\\cdot ${tex(p.Mm, 1)} = ${tex(M, 1)}$.`,
      };
    },
  },
  {
    id: "h12-polymer-hieu-suat-dieu-che", subject: S, grade: G, chapter: C4, topic: "Điều chế polymer – hiệu suất", half: 2, level: 3, kind: "mcq",
    make: (r) => {
      const t = r.int(0, 2);
      if (t === 0) {
        const m = r.pick([4.6, 9.2, 23, 46, 92]), H1 = r.pick([60, 75, 80, 90]), H2 = r.pick([80, 90, 95]);
        const x = m / 46 * 28 * H1 / 100 * H2 / 100;
        return {
          stem: `Sản xuất polyethylene (PE) từ ethanol theo sơ đồ: $\\mathrm{C_2H_5OH} \\xrightarrow{H_1} \\mathrm{CH_2{=}CH_2} \\xrightarrow{H_2} \\mathrm{PE}$, với $H_1 = ${H1}\\%$, $H_2 = ${H2}\\%$. Từ ${vn(m)} tấn ethanol thu được bao nhiêu tấn PE? ${cho("H", "C", "O")}`,
          ...mcq(r, `${vn(x)} tấn`, r.shuffle(nums([m * H1 / 100 * H2 / 100, m / 46 * 28, m / 46 * 28 * H1 / 100, m / 46 * 28 / (H1 / 100 * H2 / 100)])).map((s) => s + " tấn")),
          explanation: `46 tấn ethanol → 28 tấn ethylene → 28 tấn PE (bảo toàn khối lượng khi trùng hợp). $m_{\\text{PE}} = \\dfrac{${tex(m)}}{46}\\cdot 28\\cdot ${tex(H1 / 100)}\\cdot ${tex(H2 / 100)} = ${tex(x)}$ tấn.`,
        };
      }
      if (t === 1) {
        const m = r.pick([2.6, 5.2, 13, 26]), H1 = r.pick([75, 80, 90]), H2 = r.pick([80, 90, 95]);
        const x = m / 26 * 62.5 * H1 / 100 * H2 / 100;
        return {
          stem: `Điều chế PVC theo sơ đồ: $\\mathrm{C_2H_2} \\xrightarrow{+\\,HCl,\\ H_1} \\mathrm{CH_2{=}CHCl} \\xrightarrow{H_2} \\mathrm{PVC}$, với $H_1 = ${H1}\\%$, $H_2 = ${H2}\\%$. Từ ${vn(m)} tấn acetylene thu được bao nhiêu tấn PVC? ${cho("H", "C", "Cl")}`,
          ...mcq(r, `${vn(x)} tấn`, r.shuffle(nums([m * H1 / 100 * H2 / 100, m / 26 * 62.5, m / 26 * 62.5 * H1 / 100, m / 26 * 62.5 / (H1 / 100 * H2 / 100)])).map((s) => s + " tấn")),
          explanation: `26 tấn $\\mathrm{C_2H_2}$ → 62,5 tấn vinyl chloride → 62,5 tấn PVC. $m = \\dfrac{${tex(m)}}{26}\\cdot 62{,}5\\cdot ${tex(H1 / 100)}\\cdot ${tex(H2 / 100)} = ${tex(x)}$ tấn.`,
        };
      }
      const p = r.pick(POLYS.slice(0, 5)), y = r.pick([1, 2, 5, 10, 25]), H = r.pick([62.5, 75, 80, 90]);
      const x = y / (H / 100);
      return {
        stem: `Để sản xuất ${y} tấn ${p.p} bằng phản ứng trùng hợp ${p.m} với hiệu suất ${pct(H)}, khối lượng ${p.m} cần dùng là`,
        ...mcq(r, `${vn(x)} tấn`, r.shuffle(nums([y * H / 100, y, y * (1 + H / 100)])).map((s) => s + " tấn")),
        explanation: `Trùng hợp bảo toàn khối lượng: lí thuyết cần ${y} tấn monomer; vì hiệu suất ${pct(H)} nên cần $\\dfrac{${y}}{${tex(H / 100, 3)}} = ${tex(x)}$ tấn.`,
      };
    },
  },
  /* ----- half 2: Đúng/Sai ----- */
  {
    id: "h12-tf-amine", subject: S, grade: G, chapter: C3, topic: "Amine – cấu tạo, tính chất", half: 2, level: 2, kind: "tf",
    make: (r) => {
      const a = r.pick([AMINES[0], AMINES[1], AMINES[5], AMINES[9], AMINES[4], AMINES[4]]);
      const n = r.int(1, 10) * 0.02, m = round(n * a.M, 2), x = m + n * 36.5;
      const kw = r.pick([1, 2, 3].filter((k) => k !== a.bac));
      const it3 = a.arom
        ? pickTF(r, `Cho X vào nước bromine thấy xuất hiện kết tủa trắng.`, `X không phản ứng với nước bromine.`)
        : pickTF(r, `Trong dung dịch nước, X có tính base mạnh hơn ammonia.`, `Trong dung dịch nước, X có tính base yếu hơn ammonia.`);
      return {
        stem: `Amine X có công thức ${ce(a.f)} (${a.com}). Cho ${vn(m)} gam X tác dụng vừa đủ với dung dịch HCl, thu được m gam muối. ${cho("H", "C", "N", "Cl")}`,
        ...tf([
          pickTF(r, `X là amine bậc ${BAC[a.bac]}.`, `X là amine bậc ${BAC[kw]}.`),
          pickTF(r, a.arom ? "Dung dịch X không làm đổi màu quỳ tím." : "Dung dịch X làm quỳ tím chuyển sang màu xanh.", a.arom ? "Dung dịch X làm quỳ tím chuyển sang màu xanh." : "Dung dịch X không làm đổi màu quỳ tím."),
          it3,
          pickTF(r, `Giá trị của m là ${vn(x)}.`, `Giá trị của m là ${vn(r.pick([m + n * 35.5, m + 2 * n * 36.5]))}.`),
        ]),
        explanation: `${ce(a.f)} là amine bậc ${BAC[a.bac]}. ${a.arom ? "Aniline có tính base rất yếu (yếu hơn ammonia), không làm đổi màu quỳ tím; phản ứng với nước bromine tạo kết tủa trắng 2,4,6-tribromoaniline." : "Amine no có gốc alkyl đẩy electron nên tính base mạnh hơn ammonia, làm quỳ tím hóa xanh."} $n_X = \\dfrac{${tex(m)}}{${a.M}} = ${tex(n)}$ mol ⇒ $m = ${tex(m)} + ${tex(n)}\\cdot 36{,}5 = ${tex(x)}$ gam.`,
      };
    },
  },
  {
    id: "h12-tf-amino-acid", subject: S, grade: G, chapter: C3, topic: "Amino acid – cấu tạo, tính chất", half: 2, level: 2, kind: "tf",
    make: (r) => {
      const a = r.pick(AAS), n = r.int(1, 10) * 0.02, m = round(n * a.M, 2), x = m + n * a.cooh * 22;
      const wc = r.pick([0, 1, 2].filter((c) => c !== a.color));
      return {
        stem: `Cho amino acid X là ${a.name} có công thức ${ce(a.f)}. Cho ${vn(m)} gam X tác dụng vừa đủ với dung dịch NaOH. ${cho("H", "C", "N", "O", "Na")}`,
        ...tf([
          pickTF(r, `X có công thức phân tử ${ce(cthc(a.c, a.h, a.o, a.n))}.`, `X có công thức phân tử ${ce(cthc(a.c, a.h + 2, a.o, a.n))}.`),
          pickTF(r, "Ở điều kiện thường, X là chất rắn kết tinh, dễ tan trong nước, có nhiệt độ nóng chảy cao.", "Ở điều kiện thường, X là chất lỏng, khó tan trong nước."),
          pickTF(r, `Dung dịch X ${COLOR[a.color]}.`, `Dung dịch X ${COLOR[wc]}.`),
          pickTF(r, `Khối lượng muối thu được là ${vn(x)} gam.`, `Khối lượng muối thu được là ${vn(m + n * (a.cooh === 1 ? 2 : 1) * 22)} gam.`),
        ]),
        explanation: `${a.name}: ${ce(cthc(a.c, a.h, a.o, a.n))}, $M = ${a.M}$, có ${a.nh2} nhóm $\\mathrm{NH_2}$ và ${a.cooh} nhóm COOH ⇒ dung dịch ${COLOR[a.color]}. Amino acid tồn tại chủ yếu dạng ion lưỡng cực nên là chất rắn, dễ tan, nóng chảy cao. $n = ${tex(n)}$ mol ⇒ $m_{\\text{muối}} = ${tex(m)} + ${tex(n)}\\cdot ${a.cooh}\\cdot 22 = ${tex(x)}$ gam.`,
      };
    },
  },
  {
    id: "h12-tf-peptide", subject: S, grade: G, chapter: C3, topic: "Peptide – cấu tạo, tính chất", half: 2, level: 2, kind: "tf",
    make: (r) => {
      const L = r.int(2, 4), seq = Array.from({ length: L }, () => r.pick(AAS.slice(0, 3))), X = seqName(seq);
      const sumM = seq.reduce((s, x) => s + x.M, 0), Mp = sumM - 18 * (L - 1);
      const wN = r.pick(AAS.slice(0, 3).filter((x) => x !== seq[0]));
      return {
        stem: `Cho peptide mạch hở X có trình tự ${X}. ${cho("H", "C", "N", "O")}`,
        ...tf([
          pickTF(r, `Phân tử X có ${L - 1} liên kết peptide.`, `Phân tử X có ${L} liên kết peptide.`),
          pickTF(r, `Amino acid đầu N của X là ${seq[0].name}.`, `Amino acid đầu N của X là ${wN.name}.`),
          pickTF(r, L >= 3 ? "X có phản ứng màu biuret với $\\mathrm{Cu(OH)_2}$ trong môi trường kiềm." : "X không có phản ứng màu biuret.", L >= 3 ? "X không có phản ứng màu biuret." : "X có phản ứng màu biuret với $\\mathrm{Cu(OH)_2}$ trong môi trường kiềm."),
          pickTF(r, `Phân tử khối của X là ${Mp}.`, `Phân tử khối của X là ${r.pick([sumM, sumM - 18 * L])}.`),
        ]),
        explanation: `X là ${PEP[L]} gồm ${L} gốc nên có ${L - 1} liên kết peptide; đầu N là ${seq[0].ab}. ${L >= 3 ? "Từ tripeptide trở lên có phản ứng màu biuret (màu tím)." : "Dipeptide không có phản ứng màu biuret."} $M_X = ${seq.map((x) => x.M).join(" + ")} - 18\\cdot ${L - 1} = ${Mp}$.`,
      };
    },
  },
  {
    id: "h12-tf-polymer", subject: S, grade: G, chapter: C4, topic: "Polymer – điều chế, tính chất, hệ số polymer hóa", half: 2, level: 3, kind: "tf",
    make: (r) => {
      const p = r.pick(POLYS.slice(0, 4)), wm = r.pick(POLYS.filter((x) => x !== p)), n = r.int(4, 60) * 250, M = n * p.Mm;
      const ctx = r.pick([`Polymer ${p.p} được dùng phổ biến để sản xuất đồ gia dụng, bao bì, ống dẫn.`, `Polymer ${p.p} là một chất dẻo quan trọng trong đời sống.`, `Trong công nghiệp, ${p.p} được sản xuất với sản lượng lớn.`]);
      return {
        stem: `${ctx} Một mẫu polymer này có phân tử khối trung bình ${vn(M, 1)}. ${cho(...polyEls(p))}`,
        ...tf([
          pickTF(r, `Polymer được điều chế bằng phản ứng trùng hợp ${p.m} (${ce(p.mf)}).`, `Polymer được điều chế bằng phản ứng trùng hợp ${wm.m} (${ce(wm.mf)}).`),
          pickTF(r, "Polymer này thuộc loại polymer tổng hợp, được dùng làm chất dẻo.", "Polymer này thuộc loại polymer thiên nhiên."),
          pickTF(r, "Polymer này không có nhiệt độ nóng chảy xác định.", "Polymer này có nhiệt độ nóng chảy xác định như các chất tinh khiết phân tử nhỏ."),
          pickTF(r, `Hệ số polymer hóa trung bình của mẫu là ${n}.`, `Hệ số polymer hóa trung bình của mẫu là ${r.pick([2 * n, n / 2])}.`),
        ]),
        explanation: `${p.p} là polymer tổng hợp, điều chế bằng trùng hợp ${p.m}; là hỗn hợp các phân tử có n khác nhau nên nóng chảy trong một khoảng nhiệt độ. $n = \\dfrac{${tex(M, 1)}}{${tex(p.Mm, 1)}} = ${n}$.`,
      };
    },
  },
  /* ----- half 2: Trả lời ngắn ----- */
  {
    id: "h12-short-amine-so-nguyen-tu", subject: S, grade: G, chapter: C3, topic: "Xác định amine từ phản ứng với HCl", half: 2, level: 3, kind: "short",
    make: (r) => {
      const k = r.int(1, 5), M = 14 * k + 17, n = r.int(1, 10) * 0.02, m = round(n * M, 2), ms = round(n * (M + 36.5), 2);
      const askH = r.chance(0.4), v = askH ? 2 * k + 3 : k;
      return {
        stem: `Cho ${vn(m)} gam amine no, đơn chức, mạch hở X tác dụng vừa đủ với dung dịch HCl, thu được ${vn(ms)} gam muối. Số nguyên tử ${askH ? "hydrogen" : "carbon"} trong phân tử X là bao nhiêu? ${cho("H", "C", "N", "Cl")}`,
        ...short(v, 1),
        explanation: `$n_X = n_{\\mathrm{HCl}} = \\dfrac{${tex(ms)} - ${tex(m)}}{36{,}5} = ${tex(n)}$ mol ⇒ $M_X = ${M}$ ⇒ $14n + 17 = ${M}$, $n = ${k}$: X là ${ce(cthc(k, 2 * k + 3, 0, 1))}, có ${v} nguyên tử ${askH ? "H" : "C"}.`,
      };
    },
  },
  {
    id: "h12-short-dong-phan-amine", subject: S, grade: G, chapter: C3, topic: "Số đồng phân amine", half: 2, level: 2, kind: "short",
    make: (r) => {
      const D: Record<string, [number, number, number, number, string]> = {
        "C_2H_7N": [2, 1, 1, 0, "$\\mathrm{C_2H_5NH_2}$ (bậc một), $\\mathrm{(CH_3)_2NH}$ (bậc hai)"],
        "C_3H_9N": [4, 2, 1, 1, "$\\mathrm{CH_3CH_2CH_2NH_2}$, $\\mathrm{CH_3CH(NH_2)CH_3}$ (bậc một); $\\mathrm{CH_3NHC_2H_5}$ (bậc hai); $\\mathrm{(CH_3)_3N}$ (bậc ba)"],
        "C_4H_{11}N": [8, 4, 3, 1, "4 amine bậc một ($\\mathrm{C_4H_9NH_2}$); 3 amine bậc hai ($\\mathrm{CH_3NHC_3H_7}$ ×2, $\\mathrm{C_2H_5NHC_2H_5}$); 1 amine bậc ba ($\\mathrm{(CH_3)_2NC_2H_5}$)"],
      };
      const f = r.pick(Object.keys(D)), q = r.int(0, 3), v = D[f][q] as number; need(v > 0);
      const ask = q === 0 ? r.pick(["Có bao nhiêu amine ứng với công thức phân tử", "Số đồng phân cấu tạo amine ứng với công thức phân tử"]) : r.pick([`Có bao nhiêu amine bậc ${BAC[q]} ứng với công thức phân tử`, `Số đồng phân cấu tạo là amine bậc ${BAC[q]} có công thức phân tử`]);
      return { stem: `${ask} ${ce(f)}?`, ...short(v, 1), explanation: `Các amine ${ce(f)}: ${D[f][4]}. Đáp số: ${v}.` };
    },
  },
  {
    id: "h12-short-amino-acid-muoi", subject: S, grade: G, chapter: C3, topic: "Amino acid – khối lượng muối", half: 2, level: 2, kind: "short",
    make: (r) => {
      const a = r.pick(AAS), acid = r.chance(0.5), k = acid ? a.nh2 : a.cooh, d = acid ? 36.5 : 22;
      const n = r.pick([0.05, 0.1, 0.15, 0.2]), m = round(n * a.M, 2), x = m + n * k * d;
      return {
        stem: `Cho ${vn(m)} gam ${a.name} (${ce(a.f)}) tác dụng vừa đủ với dung dịch ${acid ? "HCl" : "NaOH"}. Khối lượng muối thu được là bao nhiêu gam (làm tròn đến hàng phần mười)? ${acid ? cho("H", "C", "N", "O", "Cl") : cho("H", "C", "N", "O", "Na")}`,
        ...short(x, 1),
        explanation: `$n = ${tex(n)}$ mol; ${a.name} có ${acid ? `${a.nh2} nhóm $\\mathrm{NH_2}$ ⇒ $m = ${tex(m)} + ${tex(n * k)}\\cdot 36{,}5` : `${a.cooh} nhóm COOH ⇒ $m = ${tex(m)} + ${tex(n * k)}\\cdot 22`} ${ap(x, 1)}$ gam.`,
      };
    },
  },
  {
    id: "h12-short-peptide", subject: S, grade: G, chapter: C3, topic: "Peptide – đếm số peptide, thủy phân", half: 2, level: 3, kind: "short",
    make: (r) => {
      if (r.chance(0.5)) {
        const k = r.int(2, 3), L = r.int(k, 4), names = r.shuffle(AAS.slice(0, 3)).slice(0, k).map((x) => x.ab), all = r.chance(0.5);
        const C = (a: number, b: number) => { let s = 1; for (let i = 0; i < b; i++) s = s * (a - i) / (i + 1); return s; };
        let v = 0; for (let j = 0; j <= k; j++) v += (j % 2 ? -1 : 1) * C(k, j) * Math.pow(k - j, L);
        const tot = Math.pow(k, L), ans = all ? v : tot;
        return {
          stem: `Từ các amino acid ${names.join(", ")} có thể tạo được tối đa bao nhiêu ${PEP[L]} mạch hở${all ? ` chứa đồng thời cả ${k} loại gốc amino acid đó` : " (mỗi gốc có thể lặp lại)"}?`,
          ...short(ans, 1),
          explanation: all
            ? `Mỗi ${PEP[L]} là một dãy ${L} vị trí (có thứ tự từ đầu N đến đầu C). Tổng số dãy: $${k}^{${L}} = ${tot}$; trừ các dãy thiếu ít nhất một loại (nguyên lí bù trừ) còn $${v}$.`
            : `Mỗi vị trí trong ${L} vị trí (thứ tự từ đầu N đến đầu C) có ${k} cách chọn ⇒ $${k}^{${L}} = ${tot}$.`,
        };
      }
      const L = r.int(2, 4), seq = Array.from({ length: L }, () => r.pick(AAS.slice(0, 3))), X = seqName(seq);
      const sumM = seq.reduce((s, x) => s + x.M, 0), Mp = sumM - 18 * (L - 1), n = r.pick([0.02, 0.05, 0.1, 0.15]), m = round(n * Mp, 2), x = n * sumM;
      return {
        stem: `Thủy phân hoàn toàn ${vn(m)} gam peptide ${X} trong môi trường acid (vừa đủ nước), thu được m gam hỗn hợp amino acid. Tính m (làm tròn đến hàng phần mười). ${cho("H", "C", "N", "O")}`,
        ...short(x, 1),
        explanation: `$M = ${sumM} - 18\\cdot ${L - 1} = ${Mp}$ ⇒ $n = ${tex(n)}$ mol; cần $${L - 1}$ phân tử nước: $m = ${tex(m)} + ${tex(n)}\\cdot ${L - 1}\\cdot 18 ${ap(x, 1)}$ gam.`,
      };
    },
  },
  {
    id: "h12-short-he-so-polymer", subject: S, grade: G, chapter: C4, topic: "Hệ số polymer hóa", half: 2, level: 2, kind: "short",
    make: (r) => {
      const p = r.pick(POLYS), n = r.int(4, 99) * 100, M = n * p.Mm;
      const ctx = r.pick(["Một mẫu", "Một loại", "Một đoạn mạch"]);
      return {
        stem: `${ctx} ${p.p} có phân tử khối trung bình là ${vn(M, 1)}. Hệ số polymer hóa trung bình của polymer đó là bao nhiêu? ${cho(...polyEls(p))}`,
        ...short(n, 1),
        explanation: `Khối lượng mắt xích bằng khối lượng monomer ${ce(p.mf)}: $${tex(p.Mm, 1)}$ ⇒ $n = \\dfrac{${tex(M, 1)}}{${tex(p.Mm, 1)}} = ${n}$.`,
      };
    },
  },
  {
    id: "h12-short-aniline-bromine", subject: S, grade: G, chapter: C3, topic: "Aniline tác dụng với nước bromine", half: 2, level: 3, kind: "short",
    make: (r) => {
      const n = r.pick([0.01, 0.02, 0.03, 0.05, 0.1, 0.15, 0.2, 0.25]), m = round(n * 93, 2), t = r.int(0, 2);
      const eq = "$\\mathrm{C_6H_5NH_2 + 3Br_2 \\rightarrow C_6H_2Br_3NH_2\\downarrow + 3HBr}$";
      const el = cho("H", "C", "N", "Br");
      if (t === 0) return { stem: `Cho ${vn(m)} gam aniline tác dụng với lượng dư nước bromine, thu được m gam kết tủa trắng. Tính m (làm tròn đến hàng phần mười). ${el}`, ...short(330 * n, 1), explanation: `${eq}. $n = \\dfrac{${tex(m)}}{93} = ${tex(n)}$ mol ⇒ $m = ${tex(n)}\\cdot 330 = ${tex(330 * n)} $ gam.` };
      if (t === 1) return { stem: `Cho aniline tác dụng với lượng dư nước bromine thu được ${vn(330 * n)} gam kết tủa 2,4,6-tribromoaniline. Khối lượng aniline đã phản ứng là bao nhiêu gam (làm tròn đến hàng phần mười)? ${el}`, ...short(m, 1), explanation: `${eq}. $n_{\\downarrow} = \\dfrac{${tex(330 * n)}}{330} = ${tex(n)}$ mol ⇒ $m = ${tex(n)}\\cdot 93 = ${tex(m)}$ gam.` };
      return { stem: `Cho ${vn(m)} gam aniline tác dụng vừa đủ với nước bromine. Khối lượng bromine đã phản ứng là bao nhiêu gam (làm tròn đến hàng phần mười)? ${el}`, ...short(480 * n, 1), explanation: `${eq}. $n_{\\mathrm{Br_2}} = 3\\cdot ${tex(n)} = ${tex(3 * n)}$ mol ⇒ $m = ${tex(3 * n)}\\cdot 160 = ${tex(480 * n)}$ gam.` };
    },
  },
];
