/* Hóa học 10 – học kì 1 (KNTT): dạng bài có tham số.
   half 1: Cấu tạo nguyên tử + Bảng tuần hoàn; half 2: Liên kết hóa học. */
import { mcq, tf, short, tex, vn, need, round, gcd, Retry, type Template, type Rng } from "./core.ts";

const S = "Hóa học", G = 10 as const;
const C1 = "Chương 1. Cấu tạo nguyên tử";
const C2 = "Chương 2. Bảng tuần hoàn các nguyên tố hóa học";
const C3 = "Chương 3. Liên kết hóa học";

/* ======================= Bảng dữ kiện nguyên tố (Z ≤ 36) =======================
   z, kí hiệu, tên IUPAC (theo SGK), độ âm điện Pauling (0 = khí hiếm, không dùng),
   A = số khối đồng vị phổ biến nhất, M = nguyên tử khối dùng trong tính toán,
   k: "kl" kim loại, "pk" phi kim, "kh" khí hiếm, "" không xếp loại trong đề */
type El = { z: number; s: string; name: string; en: number; A: number; M: number; k: string };
const RAW: [number, string, string, number, number, number, string][] = [
  [1, "H", "hydrogen", 2.2, 1, 1, "pk"], [2, "He", "helium", 0, 4, 4, "kh"],
  [3, "Li", "lithium", 0.98, 7, 7, "kl"], [4, "Be", "beryllium", 1.57, 9, 9, "kl"],
  [5, "B", "boron", 2.04, 11, 11, "pk"], [6, "C", "carbon", 2.55, 12, 12, "pk"],
  [7, "N", "nitrogen", 3.04, 14, 14, "pk"], [8, "O", "oxygen", 3.44, 16, 16, "pk"],
  [9, "F", "fluorine", 3.98, 19, 19, "pk"], [10, "Ne", "neon", 0, 20, 20, "kh"],
  [11, "Na", "sodium", 0.93, 23, 23, "kl"], [12, "Mg", "magnesium", 1.31, 24, 24, "kl"],
  [13, "Al", "aluminium", 1.61, 27, 27, "kl"], [14, "Si", "silicon", 1.9, 28, 28, "pk"],
  [15, "P", "phosphorus", 2.19, 31, 31, "pk"], [16, "S", "sulfur", 2.58, 32, 32, "pk"],
  [17, "Cl", "chlorine", 3.16, 35, 35.5, "pk"], [18, "Ar", "argon", 0, 40, 40, "kh"],
  [19, "K", "potassium", 0.82, 39, 39, "kl"], [20, "Ca", "calcium", 1.0, 40, 40, "kl"],
  [21, "Sc", "scandium", 1.36, 45, 45, "kl"], [22, "Ti", "titanium", 1.54, 48, 48, "kl"],
  [23, "V", "vanadium", 1.63, 51, 51, "kl"], [24, "Cr", "chromium", 1.66, 52, 52, "kl"],
  [25, "Mn", "manganese", 1.55, 55, 55, "kl"], [26, "Fe", "iron", 1.83, 56, 56, "kl"],
  [27, "Co", "cobalt", 1.88, 59, 59, "kl"], [28, "Ni", "nickel", 1.91, 58, 59, "kl"],
  [29, "Cu", "copper", 1.9, 63, 64, "kl"], [30, "Zn", "zinc", 1.65, 64, 65, "kl"],
  [31, "Ga", "gallium", 1.81, 69, 70, "kl"], [32, "Ge", "germanium", 2.01, 74, 73, ""],
  [33, "As", "arsenic", 2.18, 75, 75, ""], [34, "Se", "selenium", 2.55, 80, 79, "pk"],
  [35, "Br", "bromine", 2.96, 79, 80, "pk"], [36, "Kr", "krypton", 0, 84, 84, "kh"],
];
const ELS: El[] = RAW.map(([z, s, name, en, A, M, k]) => ({ z, s, name, en, A, M, k }));
const E = (z: number): El => { const e = ELS[z - 1]; need(e); return e; };
const bySym = (s: string): El => { const e = ELS.find((x) => x.s === s); if (!e) throw new Error("không có " + s); return e; };

/* ======================= Tiện ích ======================= */
const RO = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const m = (f: string) => `$\\mathrm{${f}}$`;                                  // công thức hóa học
const iso = (A: number, Z: number, s: string) => `$^{${A}}_{${Z}}\\mathrm{${s}}$`;
const ionF = (s: string, q: number) => q === 0 ? s : `${s}^{${Math.abs(q) === 1 ? "" : Math.abs(q)}${q > 0 ? "+" : "-"}}`;
const sub = (n: number) => (n === 1 ? "" : `_{${n}}`);
const nm = (e: El) => `${e.name} (${e.s})`;
const lab = (e: El) => `${e.s} (Z = ${e.z})`;
const st = (ok: boolean, t: string, f: string): [string, boolean] => (ok ? [t, true] : [f, false]);
const pickN = <T,>(r: Rng, a: readonly T[], k: number): T[] => r.shuffle([...a]).slice(0, k);
const enT = (x: number) => x.toFixed(2).replace(".", "{,}");
const enV = (x: number) => x.toFixed(2).replace(".", ",");

/* ---------- Cấu hình electron ---------- */
type Sub = { n: number; l: number; e: number };
const ORDER: [number, number][] = [[1, 0], [2, 0], [2, 1], [3, 0], [3, 1], [4, 0], [3, 2], [4, 1], [5, 0]];
const LL = "spdf";
function fillE(ne: number): Sub[] {
  const out: Sub[] = []; let k = ne;
  for (const [n, l] of ORDER) { if (k <= 0) break; const e = Math.min(k, 2 * (2 * l + 1)); out.push({ n, l, e }); k -= e; }
  need(k === 0); return out;
}
function atomConf(z: number): Sub[] {
  const c = fillE(z);
  if (z === 24 || z === 29) { const s = c.find((x) => x.n === 4 && x.l === 0)!, d = c.find((x) => x.n === 3 && x.l === 2)!; s.e = 1; d.e = z === 24 ? 5 : 10; }
  return c;
}
const clone = (c: Sub[]) => c.map((x) => ({ ...x }));
const sorted = (c: Sub[]) => c.filter((x) => x.e > 0).sort((a, b) => a.n - b.n || a.l - b.l);
const subT = (x: Sub) => `${x.n}${LL[x.l]}^{${x.e}}`;
/** cấu hình theo thứ tự lớp; core = viết gọn bằng khí hiếm */
function confTex(c: Sub[], core = false): string {
  const s = sorted(c);
  if (core) {
    const tot = s.reduce((a, x) => a + x.e, 0);
    for (const [ne, k, g] of [[18, 5, "Ar"], [10, 3, "Ne"], [2, 1, "He"]] as [number, number, string][]) {
      const head = s.slice(0, k);
      if (tot > ne && head.length === k && head.every((x, i) => x.n === ORDER[i][0] && x.l === ORDER[i][1] && x.e === 2 * (2 * x.l + 1)))
        return `[\\mathrm{${g}}]` + s.slice(k).map(subT).join("");
    }
  }
  return s.map(subT).join("");
}
/** thứ tự điền theo mức năng lượng */
const fillTex = (z: number) => fillE(z).map(subT).join("");
function removeE(c0: Sub[], k: number): Sub[] {
  const c = clone(c0);
  for (let i = 0; i < k; i++) {
    const t = c.filter((x) => x.e > 0).sort((a, b) => b.n - a.n || b.l - a.l)[0]; need(t); t.e--;
  }
  return c.filter((x) => x.e > 0);
}
const ionConf = (z: number, q: number) => (q > 0 ? removeE(atomConf(z), q) : fillE(z - q));
const unp = (c: Sub[]) => c.reduce((a, x) => { const o = 2 * x.l + 1; return a + (x.e <= o ? x.e : 2 * o - x.e); }, 0);
const eSum = (c: Sub[], f: (x: Sub) => boolean) => c.filter(f).reduce((a, x) => a + x.e, 0);

type Pos = { per: number; g: number; grp: string; block: string; outer: number };
function pos(z: number): Pos {
  const c = atomConf(z); const per = Math.max(...c.map((x) => x.n));
  const outer = eSum(c, (x) => x.n === per);
  if (z >= 21 && z <= 30) {
    const g = eSum(c, (x) => (x.n === 3 && x.l === 2) || (x.n === 4 && x.l === 0));
    const grp = g <= 7 ? RO[g] + "B" : g <= 10 ? "VIIIB" : g === 11 ? "IB" : "IIB";
    return { per, g, grp, block: "d", outer };
  }
  const g = z === 2 ? 8 : outer;
  return { per, g, grp: RO[g] + "A", block: eSum(c, (x) => x.n === per && x.l === 1) > 0 ? "p" : "s", outer };
}
const posT = (p: { per: number; grp: string }) => `chu kì ${p.per}, nhóm ${p.grp}`;
function confExplain(z: number): string {
  const f = fillTex(z), c = confTex(atomConf(z));
  let s = `Thứ tự điền electron theo mức năng lượng: $${f}$`;
  if (z === 24 || z === 29) s += `; nhưng cấu hình $3d^{${z === 24 ? 5 : 10}}4s^{1}$ (phân lớp d ${z === 24 ? "bán bão hòa" : "bão hòa"}) bền hơn`;
  s += f === c ? "." : `; viết theo thứ tự lớp: $${c}$.`;
  return s;
}

/* ---------- Oxide, hydroxide cao nhất ---------- */
const oxide = (s: string, v: number) => (v % 2 ? `${s}_{2}O${sub(v)}` : `${s}O${sub(v / 2)}`);
const baseF = (s: string, n: number) => (n === 1 ? `${s}OH` : `${s}(OH)_{${n}}`);
const hydride = (s: string, v: number) => (v >= 6 ? `H${sub(8 - v)}${s}` : `${s}H${sub(8 - v)}`);
const HYD: Record<number, string> = {
  3: "LiOH", 4: "Be(OH)_{2}", 5: "H_{3}BO_{3}", 6: "H_{2}CO_{3}", 7: "HNO_{3}", 11: "NaOH", 12: "Mg(OH)_{2}", 13: "Al(OH)_{3}",
  14: "H_{2}SiO_{3}", 15: "H_{3}PO_{4}", 16: "H_{2}SO_{4}", 17: "HClO_{4}", 19: "KOH", 20: "Ca(OH)_{2}", 31: "Ga(OH)_{3}",
  33: "H_{3}AsO_{4}", 34: "H_{2}SeO_{4}",
};
const LOWACID: Record<number, string> = { 7: "HNO_{2}", 15: "H_{3}PO_{3}", 16: "H_{2}SO_{3}", 17: "HClO_{3}", 33: "H_{3}AsO_{3}", 34: "H_{2}SeO_{3}" };
const HIGH = [3, 4, 5, 6, 7, 11, 12, 13, 14, 15, 16, 17, 19, 20, 31, 32, 33, 34];

/* ---------- Đồng vị ---------- */
type Iso = { name: string; s: string; z: number; a1: number; a2: number; p: number; comp: { f: string; k: number; rest: number; cho: string }[] };
const ISO: Iso[] = [
  { name: "chlorine", s: "Cl", z: 17, a1: 35, a2: 37, p: 75.77, comp: [{ f: "NaCl", k: 1, rest: 23, cho: "Na = 23" }, { f: "CaCl_{2}", k: 2, rest: 40, cho: "Ca = 40" }, { f: "HClO_{4}", k: 1, rest: 65, cho: "H = 1, O = 16" }] },
  { name: "copper", s: "Cu", z: 29, a1: 63, a2: 65, p: 69.15, comp: [{ f: "CuO", k: 1, rest: 16, cho: "O = 16" }, { f: "Cu_{2}O", k: 2, rest: 16, cho: "O = 16" }, { f: "CuSO_{4}", k: 1, rest: 96, cho: "S = 32, O = 16" }] },
  { name: "bromine", s: "Br", z: 35, a1: 79, a2: 81, p: 50.69, comp: [{ f: "KBr", k: 1, rest: 39, cho: "K = 39" }, { f: "MgBr_{2}", k: 2, rest: 24, cho: "Mg = 24" }, { f: "NaBr", k: 1, rest: 23, cho: "Na = 23" }] },
  { name: "boron", s: "B", z: 5, a1: 10, a2: 11, p: 19.9, comp: [{ f: "B_{2}O_{3}", k: 2, rest: 48, cho: "O = 16" }, { f: "H_{3}BO_{3}", k: 1, rest: 51, cho: "H = 1, O = 16" }] },
  { name: "lithium", s: "Li", z: 3, a1: 6, a2: 7, p: 7.59, comp: [{ f: "Li_{2}O", k: 2, rest: 16, cho: "O = 16" }, { f: "LiF", k: 1, rest: 19, cho: "F = 19" }] },
  { name: "gallium", s: "Ga", z: 31, a1: 69, a2: 71, p: 60.11, comp: [{ f: "Ga_{2}O_{3}", k: 2, rest: 48, cho: "O = 16" }, { f: "GaCl_{3}", k: 1, rest: 106.5, cho: "Cl = 35,5" }] },
  { name: "potassium", s: "K", z: 19, a1: 39, a2: 41, p: 93.26, comp: [{ f: "KCl", k: 1, rest: 35.5, cho: "Cl = 35,5" }, { f: "K_{2}O", k: 2, rest: 16, cho: "O = 16" }] },
  { name: "silver", s: "Ag", z: 47, a1: 107, a2: 109, p: 51.84, comp: [{ f: "AgNO_{3}", k: 1, rest: 62, cho: "N = 14, O = 16" }, { f: "AgCl", k: 1, rest: 35.5, cho: "Cl = 35,5" }] },
  { name: "rubidium", s: "Rb", z: 37, a1: 85, a2: 87, p: 72.17, comp: [{ f: "RbCl", k: 1, rest: 35.5, cho: "Cl = 35,5" }] },
  { name: "antimony", s: "Sb", z: 51, a1: 121, a2: 123, p: 57.21, comp: [{ f: "Sb_{2}O_{3}", k: 2, rest: 48, cho: "O = 16" }] },
];
const isoT = (A: number, s: string) => `$^{${A}}\\mathrm{${s}}$`;

/* ---------- Liên kết: hợp chất 2 nguyên tố để xét hiệu độ âm điện ---------- */
const COMP: [string, string, string][] = [
  ["NaCl", "Na", "Cl"], ["KCl", "K", "Cl"], ["NaF", "Na", "F"], ["MgO", "Mg", "O"], ["CaO", "Ca", "O"], ["KBr", "K", "Br"],
  ["LiF", "Li", "F"], ["CaCl_{2}", "Ca", "Cl"], ["MgCl_{2}", "Mg", "Cl"], ["Na_{2}O", "Na", "O"], ["K_{2}O", "K", "O"],
  ["CaF_{2}", "Ca", "F"], ["MgF_{2}", "Mg", "F"], ["LiCl", "Li", "Cl"], ["NaBr", "Na", "Br"], ["K_{2}S", "K", "S"],
  ["HCl", "H", "Cl"], ["H_{2}O", "H", "O"], ["NH_{3}", "N", "H"], ["HBr", "H", "Br"], ["CO_{2}", "C", "O"], ["SO_{2}", "S", "O"],
  ["AlCl_{3}", "Al", "Cl"], ["BeCl_{2}", "Be", "Cl"], ["PCl_{3}", "P", "Cl"], ["SiCl_{4}", "Si", "Cl"], ["OF_{2}", "O", "F"],
  ["CCl_{4}", "C", "Cl"], ["SiO_{2}", "Si", "O"], ["CF_{4}", "C", "F"], ["NF_{3}", "N", "F"],
  ["H_{2}", "H", "H"], ["Cl_{2}", "Cl", "Cl"], ["N_{2}", "N", "N"], ["O_{2}", "O", "O"], ["F_{2}", "F", "F"], ["Br_{2}", "Br", "Br"],
  ["CH_{4}", "C", "H"], ["H_{2}S", "H", "S"], ["PH_{3}", "P", "H"], ["CS_{2}", "C", "S"], ["NCl_{3}", "N", "Cl"], ["SiH_{4}", "Si", "H"],
];
type BT = "ion" | "cp" | "ck";
const BTN: Record<BT, string> = { ion: "liên kết ion", cp: "liên kết cộng hóa trị phân cực", ck: "liên kết cộng hóa trị không phân cực" };
const dEN = (a: string, b: string) => round(Math.abs(bySym(a).en - bySym(b).en), 2);
const btype = (d: number): BT => (d < 0.4 ? "ck" : d < 1.7 ? "cp" : "ion");
const CTYPE = COMP.map(([f, a, b]) => ({ f, a, b, d: dEN(a, b), t: btype(dEN(a, b)) }));
const RULE = "Quy ước: $\\Delta\\chi < 0{,}4$: liên kết cộng hóa trị không phân cực; $0{,}4 \\le \\Delta\\chi < 1{,}7$: liên kết cộng hóa trị phân cực; $\\Delta\\chi \\ge 1{,}7$: liên kết ion.";
const enList = (syms: string[]) => [...new Set(syms)].map((s) => `${s} = ${enV(bySym(s).en)}`).join("; ");
const dExpl = (c: { f: string; a: string; b: string; d: number; t: BT }) =>
  c.a === c.b ? `${m(c.f)}: $\\Delta\\chi = 0$ → ${BTN[c.t]}` : `${m(c.f)}: $\\Delta\\chi = |${enT(bySym(c.a).en)} - ${enT(bySym(c.b).en)}| = ${enT(c.d)}$ → ${BTN[c.t]}`;

/* ---------- Phân tử cộng hóa trị đơn giản (công thức Lewis) ----------
   sig, pi, lpC = số cặp e riêng của nguyên tử trung tâm (-1: không có nguyên tử trung tâm), lpT = tổng cặp e riêng, bp = số cặp e chung */
type Mol = { f: string; name: string; st: string; sig: number; pi: number; lpC: number; lpT: number; bp: number; hb: boolean; c?: string };
const MOL: Mol[] = [
  { f: "H_{2}", name: "hydrogen", st: "H-H", sig: 1, pi: 0, lpC: -1, lpT: 0, bp: 1, hb: false },
  { f: "Cl_{2}", name: "chlorine", st: "Cl-Cl", sig: 1, pi: 0, lpC: -1, lpT: 6, bp: 1, hb: false },
  { f: "F_{2}", name: "fluorine", st: "F-F", sig: 1, pi: 0, lpC: -1, lpT: 6, bp: 1, hb: false },
  { f: "O_{2}", name: "oxygen", st: "O=O", sig: 1, pi: 1, lpC: -1, lpT: 4, bp: 2, hb: false },
  { f: "N_{2}", name: "nitrogen", st: "N\\equiv N", sig: 1, pi: 2, lpC: -1, lpT: 2, bp: 3, hb: false },
  { f: "HCl", name: "hydrogen chloride", st: "H-Cl", sig: 1, pi: 0, lpC: -1, lpT: 3, bp: 1, hb: false },
  { f: "HF", name: "hydrogen fluoride", st: "H-F", sig: 1, pi: 0, lpC: -1, lpT: 3, bp: 1, hb: true },
  { f: "H_{2}O", name: "nước", st: "H-O-H", sig: 2, pi: 0, lpC: 2, lpT: 2, bp: 2, hb: true, c: "O" },
  { f: "NH_{3}", name: "ammonia", st: "", sig: 3, pi: 0, lpC: 1, lpT: 1, bp: 3, hb: true, c: "N" },
  { f: "CH_{4}", name: "methane", st: "", sig: 4, pi: 0, lpC: 0, lpT: 0, bp: 4, hb: false, c: "C" },
  { f: "CO_{2}", name: "carbon dioxide", st: "O=C=O", sig: 2, pi: 2, lpC: 0, lpT: 4, bp: 4, hb: false, c: "C" },
  { f: "HCN", name: "hydrogen cyanide", st: "H-C\\equiv N", sig: 2, pi: 2, lpC: 0, lpT: 1, bp: 4, hb: false, c: "C" },
  { f: "H_{2}S", name: "hydrogen sulfide", st: "H-S-H", sig: 2, pi: 0, lpC: 2, lpT: 2, bp: 2, hb: false, c: "S" },
  { f: "PH_{3}", name: "phosphine", st: "", sig: 3, pi: 0, lpC: 1, lpT: 1, bp: 3, hb: false, c: "P" },
  { f: "CCl_{4}", name: "carbon tetrachloride", st: "", sig: 4, pi: 0, lpC: 0, lpT: 12, bp: 4, hb: false, c: "C" },
  { f: "CH_{2}O", name: "formaldehyde", st: "H_{2}C=O", sig: 3, pi: 1, lpC: 0, lpT: 2, bp: 4, hb: false, c: "C" },
  { f: "NCl_{3}", name: "nitrogen trichloride", st: "", sig: 3, pi: 0, lpC: 1, lpT: 10, bp: 3, hb: false, c: "N" },
  { f: "OF_{2}", name: "oxygen difluoride", st: "F-O-F", sig: 2, pi: 0, lpC: 2, lpT: 8, bp: 2, hb: false, c: "O" },
  { f: "C_{2}H_{4}", name: "ethylene", st: "CH_{2}=CH_{2}", sig: 5, pi: 1, lpC: -1, lpT: 0, bp: 6, hb: false },
  { f: "C_{2}H_{2}", name: "acetylene", st: "HC\\equiv CH", sig: 3, pi: 2, lpC: -1, lpT: 0, bp: 5, hb: false },
];
const molN = (x: Mol) => `${x.name} (${m(x.f)})`;
/* Phân tử hữu cơ/vô cơ có công thức cấu tạo để đếm σ, π */
type SP = { name: string; st: string; sig: number; pi: number };
const SPM: SP[] = [
  { name: "ethane", st: "CH_{3}-CH_{3}", sig: 7, pi: 0 }, { name: "ethylene", st: "CH_{2}=CH_{2}", sig: 5, pi: 1 },
  { name: "acetylene", st: "HC\\equiv CH", sig: 3, pi: 2 }, { name: "propane", st: "CH_{3}-CH_{2}-CH_{3}", sig: 10, pi: 0 },
  { name: "propene", st: "CH_{2}=CH-CH_{3}", sig: 8, pi: 1 }, { name: "propyne", st: "HC\\equiv C-CH_{3}", sig: 6, pi: 2 },
  { name: "acetic acid", st: "CH_{3}-C(=O)-O-H", sig: 7, pi: 1 }, { name: "formic acid", st: "H-C(=O)-O-H", sig: 4, pi: 1 },
  { name: "ethanol", st: "CH_{3}-CH_{2}-O-H", sig: 8, pi: 0 }, { name: "acetaldehyde", st: "CH_{3}-CH=O", sig: 6, pi: 1 },
  { name: "buta-1,3-diene", st: "CH_{2}=CH-CH=CH_{2}", sig: 9, pi: 2 }, { name: "acetonitrile", st: "CH_{3}-C\\equiv N", sig: 5, pi: 2 },
  { name: "vinyl chloride", st: "CH_{2}=CH-Cl", sig: 5, pi: 1 }, { name: "methanol", st: "CH_{3}-O-H", sig: 5, pi: 0 },
  { name: "carbon dioxide", st: "O=C=O", sig: 2, pi: 2 }, { name: "hydrogen cyanide", st: "H-C\\equiv N", sig: 2, pi: 2 },
  { name: "nitrogen", st: "N\\equiv N", sig: 1, pi: 2 }, { name: "oxygen", st: "O=O", sig: 1, pi: 1 },
  { name: "formaldehyde", st: "H_{2}C=O", sig: 3, pi: 1 }, { name: "acrylonitrile", st: "CH_{2}=CH-C\\equiv N", sig: 6, pi: 3 },
];
const spExpl = (x: SP) => `Mỗi liên kết đơn là 1 liên kết $\\sigma$; liên kết đôi gồm 1 $\\sigma$ + 1 $\\pi$; liên kết ba gồm 1 $\\sigma$ + 2 $\\pi$. Trong ${x.name} ($\\mathrm{${x.st}}$): ${x.sig} liên kết $\\sigma$ và ${x.pi} liên kết $\\pi$.`;

/* ---------- Ion đơn nguyên tử ---------- */
const NOBLE: Record<number, string> = { 2: "helium", 10: "neon", 18: "argon", 36: "krypton" };
const SION: [number, number][] = [[3, 1], [11, 1], [12, 2], [13, 3], [19, 1], [20, 2], [7, -3], [8, -2], [9, -1], [15, -3], [16, -2], [17, -1], [35, -1]];

/* ---------- Nhiệt độ sôi ---------- */
type BP = { f: string; name: string; M: number; bp: number; hb: boolean };
const SER: { note: string; xs: BP[] }[] = [
  { note: "Các halogen đều không phân cực, chỉ có tương tác van der Waals; khối lượng phân tử càng lớn thì tương tác càng mạnh.", xs: [
    { f: "F_{2}", name: "fluorine", M: 38, bp: -188, hb: false }, { f: "Cl_{2}", name: "chlorine", M: 71, bp: -34, hb: false },
    { f: "Br_{2}", name: "bromine", M: 160, bp: 59, hb: false }, { f: "I_{2}", name: "iodine", M: 254, bp: 184, hb: false }] },
  { note: "Các khí hiếm chỉ có tương tác van der Waals giữa các nguyên tử; kích thước và khối lượng càng lớn thì tương tác càng mạnh.", xs: [
    { f: "He", name: "helium", M: 4, bp: -269, hb: false }, { f: "Ne", name: "neon", M: 20, bp: -246, hb: false },
    { f: "Ar", name: "argon", M: 40, bp: -186, hb: false }, { f: "Kr", name: "krypton", M: 84, bp: -153, hb: false }] },
  { note: "Các alkane không phân cực, chỉ có tương tác van der Waals; khối lượng phân tử càng lớn thì tương tác càng mạnh.", xs: [
    { f: "CH_{4}", name: "methane", M: 16, bp: -162, hb: false }, { f: "C_{2}H_{6}", name: "ethane", M: 30, bp: -89, hb: false },
    { f: "C_{3}H_{8}", name: "propane", M: 44, bp: -42, hb: false }, { f: "C_{4}H_{10}", name: "butane", M: 58, bp: -1, hb: false }] },
  { note: "Giữa các phân tử HF có liên kết hydrogen nên HF sôi cao bất thường; các hydrogen halide còn lại (HCl, HBr, HI) chỉ có tương tác van der Waals tăng theo khối lượng phân tử.", xs: [
    { f: "HF", name: "hydrogen fluoride", M: 20, bp: 20, hb: true }, { f: "HCl", name: "hydrogen chloride", M: 36.5, bp: -85, hb: false },
    { f: "HBr", name: "hydrogen bromide", M: 81, bp: -67, hb: false }, { f: "HI", name: "hydrogen iodide", M: 128, bp: -35, hb: false }] },
  { note: "Giữa các phân tử nước có liên kết hydrogen nên nước sôi cao bất thường; từ H₂S đến H₂Te chỉ có tương tác van der Waals tăng theo khối lượng phân tử.".replace("H₂S", "$\\mathrm{H_{2}S}$").replace("H₂Te", "$\\mathrm{H_{2}Te}$"), xs: [
    { f: "H_{2}O", name: "nước", M: 18, bp: 100, hb: true }, { f: "H_{2}S", name: "hydrogen sulfide", M: 34, bp: -60, hb: false },
    { f: "H_{2}Se", name: "hydrogen selenide", M: 81, bp: -41, hb: false }, { f: "H_{2}Te", name: "hydrogen telluride", M: 130, bp: -2, hb: false }] },
  { note: "Các chất này có khối lượng phân tử gần bằng nhau. Methane không có liên kết hydrogen; nước tạo được nhiều liên kết hydrogen nhất (mỗi phân tử có 2 nguyên tử H và 2 cặp electron riêng trên O) nên sôi cao nhất; liên kết hydrogen giữa các phân tử HF mạnh hơn giữa các phân tử $\\mathrm{NH_{3}}$ (F có độ âm điện lớn hơn N).", xs: [
    { f: "CH_{4}", name: "methane", M: 16, bp: -162, hb: false }, { f: "NH_{3}", name: "ammonia", M: 17, bp: -33, hb: true },
    { f: "HF", name: "hydrogen fluoride", M: 20, bp: 20, hb: true }, { f: "H_{2}O", name: "nước", M: 18, bp: 100, hb: true }] },
  { note: "Propane và dimethyl ether không có liên kết hydrogen giữa các phân tử (dimethyl ether phân cực hơn nên sôi cao hơn propane); methanol và ethanol có liên kết hydrogen, ethanol có khối lượng phân tử lớn hơn nên sôi cao hơn.", xs: [
    { f: "C_{3}H_{8}", name: "propane", M: 44, bp: -42, hb: false }, { f: "CH_{3}OCH_{3}", name: "dimethyl ether", M: 46, bp: -24, hb: false },
    { f: "CH_{3}OH", name: "methanol", M: 32, bp: 65, hb: true }, { f: "C_{2}H_{5}OH", name: "ethanol", M: 46, bp: 78, hb: true }] },
  { note: "Các alcohol đều có liên kết hydrogen giữa các phân tử; mạch carbon càng dài (khối lượng phân tử càng lớn) thì tương tác van der Waals càng mạnh nên nhiệt độ sôi càng cao.", xs: [
    { f: "CH_{3}OH", name: "methanol", M: 32, bp: 65, hb: true }, { f: "C_{2}H_{5}OH", name: "ethanol", M: 46, bp: 78, hb: true },
    { f: "C_{3}H_{7}OH", name: "propan-1-ol", M: 60, bp: 97, hb: true }, { f: "C_{4}H_{9}OH", name: "butan-1-ol", M: 74, bp: 117, hb: true }] },
];

/* ======================= HALF 1: Nguyên tử + Bảng tuần hoàn ======================= */
const H1: Template[] = [
  {
    id: "h10-so-hat-tu-ki-hieu", subject: S, grade: G, chapter: C1, topic: "Số hạt trong nguyên tử từ kí hiệu", half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const e = E(r.int(3, 36)), Z = e.z, A = e.A, N = A - Z;
      const asks: [string, number, string][] = [
        ["số proton", Z, `Số proton bằng số hiệu nguyên tử: $Z = ${Z}$.`],
        ["số neutron", N, `Số neutron $N = A - Z = ${A} - ${Z} = ${N}$.`],
        ["số electron", Z, `Nguyên tử trung hòa về điện nên số electron bằng số proton $= ${Z}$.`],
        ["tổng số hạt proton, neutron và electron", 2 * Z + N, `$N = ${A} - ${Z} = ${N}$; tổng số hạt $= 2Z + N = 2\\cdot ${Z} + ${N} = ${2 * Z + N}$.`],
        ["số hạt mang điện", 2 * Z, `Hạt mang điện gồm proton và electron: $p + e = 2Z = ${2 * Z}$.`],
        ["số hạt không mang điện", N, `Hạt không mang điện là neutron: $N = A - Z = ${A} - ${Z} = ${N}$.`],
      ];
      const [q, v, ex] = r.pick(asks);
      const pool = r.shuffle([A, Z, N, A + Z, 2 * Z, 2 * Z + N, 2 * N].filter((x) => x !== v)).map(String);
      return {
        stem: r.pick([`Nguyên tử ${e.name} có kí hiệu ${iso(A, Z, e.s)}. ${cap(q)} trong nguyên tử này là`, `Cho kí hiệu nguyên tử ${iso(A, Z, e.s)}. ${cap(q)} của nguyên tử ${e.name} này bằng`]),
        ...mcq(r, String(v), pool), explanation: `Trong kí hiệu $^{A}_{Z}\\mathrm{X}$: $A = ${A}$ là số khối, $Z = ${Z}$ là số hiệu nguyên tử. ${ex}`,
      };
    },
  },
  {
    id: "h10-ki-hieu-nguyen-tu", subject: S, grade: G, chapter: C1, topic: "Viết kí hiệu nguyên tử", half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const e = E(r.int(3, 36)), Z = e.z, A = e.A, N = A - Z;
      const mode = r.int(0, 3);
      const given = [`${Z} proton và ${N} neutron`, `${Z} electron và ${N} neutron`, `số khối bằng ${A} và có ${Z} electron`, `tổng số hạt proton, neutron, electron là ${2 * Z + N}, trong đó có ${N} neutron`][mode];
      const ex = [`$Z = p = ${Z}$; $A = Z + N = ${Z} + ${N} = ${A}$.`, `$Z = p = e = ${Z}$; $A = Z + N = ${Z} + ${N} = ${A}$.`, `$Z = e = ${Z}$, $A = ${A}$.`,
        `$2Z + N = ${2 * Z + N}$ với $N = ${N}$ nên $Z = ${Z}$; $A = Z + N = ${A}$.`][mode];
      const pool = r.shuffle([iso(Z, A, e.s), iso(N, Z, e.s), iso(A + Z, Z, e.s), iso(A, N, e.s), iso(2 * Z + N, Z, e.s)]);
      return {
        stem: `Nguyên tử của nguyên tố ${e.name} (kí hiệu ${e.s}) có ${given}. Kí hiệu nguyên tử nào sau đây là đúng?`,
        ...mcq(r, iso(A, Z, e.s), pool), explanation: `${ex} Kí hiệu nguyên tử: ${iso(A, Z, e.s)} (số khối ghi phía trên, số hiệu nguyên tử ghi phía dưới).`,
      };
    },
  },
  {
    id: "h10-dong-vi-nhan-biet", subject: S, grade: G, chapter: C1, topic: "Đồng vị, cùng số khối, cùng số neutron", half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const Z = r.int(6, 30), N = Z + r.int(0, 6), A = Z + N, d = r.pick([1, 2]), e2 = r.pick([1, 2]);
      const at: [number, number][] = r.shuffle([[A, Z], [A + d, Z], [A, Z + e2], [A + 1, Z + 1]] as [number, number][]);
      const L = r.pick([["X", "Y", "R", "T"], ["A", "B", "D", "E"], ["X", "Y", "Z", "T"], ["M", "N", "Q", "R"]]);
      const pairs: [number, number][] = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
      const ask = r.pick([
        ["là đồng vị của nhau", (x: [number, number], y: [number, number]) => x[1] === y[1], "cùng số proton (cùng Z), khác số khối"],
        ["có cùng số khối", (x: [number, number], y: [number, number]) => x[0] === y[0], "cùng số khối A"],
        ["có cùng số neutron", (x: [number, number], y: [number, number]) => x[0] - x[1] === y[0] - y[1], "cùng số neutron $N = A - Z$"],
      ] as [string, (x: [number, number], y: [number, number]) => boolean, string][]);
      const good = pairs.filter(([i, j]) => ask[1](at[i], at[j])); need(good.length === 1);
      const P = ([i, j]: [number, number]) => `${L[i]} và ${L[j]}`;
      const atomT = at.map(([a2, z2], i) => `$^{${a2}}_{${z2}}\\mathrm{${L[i]}}$`).join(", ");
      return {
        stem: `Cho các nguyên tử: ${atomT}. Cặp nguyên tử nào sau đây ${ask[0]}?`,
        ...mcq(r, P(good[0]), r.shuffle(pairs.filter((p) => p !== good[0])).map(P)),
        explanation: `Số neutron lần lượt: ${at.map(([a2, z2], i) => `${L[i]}: $${a2} - ${z2} = ${a2 - z2}$`).join("; ")}. Cặp ${P(good[0])} ${ask[2]}${ask[0] === "là đồng vị của nhau" ? " nên là đồng vị" : ""}.`,
      };
    },
  },
  {
    id: "h10-lop-phan-lop", subject: S, grade: G, chapter: C1, topic: "Lớp, phân lớp, orbital", half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const n = r.int(1, 4), L = "KLMN"[n - 1], l = r.int(0, 3), sl = LL[l];
      const asks: [string, number, number[], string][] = [
        [`Số electron tối đa trên lớp ${L} (n = ${n}) là`, 2 * n * n, [n * n, 2 * n, 8, 18, 32, 2], `Lớp thứ n chứa tối đa $2n^2 = 2\\cdot ${n}^2 = ${2 * n * n}$ electron.`],
        [`Số orbital nguyên tử trong lớp ${L} (n = ${n}) là`, n * n, [2 * n * n, n, 2 * n, n + 1], `Lớp thứ n có $n^2 = ${n * n}$ orbital.`],
        [`Lớp ${L} (n = ${n}) có số phân lớp là`, n, [n + 1, 2 * n, n * n + 1, 2 * n * n].filter((x) => x !== n), `Lớp thứ n có n phân lớp; lớp ${L} có ${n} phân lớp (${["1s", "2s, 2p", "3s, 3p, 3d", "4s, 4p, 4d, 4f"][n - 1]}).`],
        [`Phân lớp ${sl} chứa tối đa bao nhiêu electron?`, 2 * (2 * l + 1), [2, 6, 10, 14, 2 * l + 1, 8], `Phân lớp ${sl} có ${2 * l + 1} orbital, mỗi orbital chứa tối đa 2 electron nên chứa tối đa ${2 * (2 * l + 1)} electron.`],
        [`Phân lớp ${sl} có bao nhiêu orbital?`, 2 * l + 1, [1, 3, 5, 7, 2 * (2 * l + 1)], `Phân lớp s, p, d, f lần lượt có 1, 3, 5, 7 orbital; phân lớp ${sl} có ${2 * l + 1} orbital.`],
      ];
      const [q, v, w, ex] = r.pick(asks);
      return { stem: q, ...mcq(r, String(v), r.shuffle(w.filter((x) => x !== v)).map(String)), explanation: ex };
    },
  },
  {
    id: "h10-cau-hinh-electron", subject: S, grade: G, chapter: C1, topic: "Cấu hình electron nguyên tử", half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const z = r.int(5, 35), e = E(z), core = z > 10 && r.chance(0.5);
      const ct = (c: Sub[]) => `$${confTex(c, core)}$`;
      const right = ct(atomConf(z)); const w: string[] = [];
      if (z === 24 || z === 29) { w.push(ct(fillE(z))); const c = fillE(z); c.find((x) => x.l === 2)!.e += 2; c.find((x) => x.n === 4)!.e = 0; if (z === 24) w.push(ct(c)); }
      else if (z >= 21 && z <= 30) { const c = clone(atomConf(z)); const s4 = c.find((x) => x.n === 4)!, d3 = c.find((x) => x.l === 2)!; const mv = Math.min(s4.e, 10 - d3.e); d3.e += mv; s4.e -= mv; if (mv) w.push(ct(c)); }
      else if (z === 19 || z === 20) { w.push(ct([...fillE(18), { n: 3, l: 2, e: z - 18 }])); }
      else if (z >= 31) { const c = clone(atomConf(z)); c.find((x) => x.n === 4 && x.l === 0)!.e = 1; c.find((x) => x.n === 4 && x.l === 1)!.e += 1; w.push(ct(c)); }
      w.push(...r.shuffle([ct(atomConf(z - 1)), ct(atomConf(z + 1)), ct(atomConf(z - 2))]));
      if (r.chance(0.35)) {
        const opts = [z, z - 1, z + 1, z - 2].map((k) => nm(E(k)));
        return { stem: `Nguyên tử của nguyên tố X ở trạng thái cơ bản có cấu hình electron là ${right}. X là`, ...mcq(r, opts[0], opts.slice(1)),
          explanation: `Tổng số electron là ${z} nên $Z = ${z}$: X là ${e.name}. ${confExplain(z)}` };
      }
      return { stem: `Cấu hình electron của nguyên tử ${e.name} (Z = ${z}) ở trạng thái cơ bản là`, ...mcq(r, right, w), explanation: confExplain(z) };
    },
  },
  {
    id: "h10-electron-doc-than-lop-ngoai", subject: S, grade: G, chapter: C1, topic: "Electron độc thân, electron lớp ngoài cùng", half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const z = r.int(5, 35), e = E(z), c = atomConf(z), p = pos(z), u = unp(c);
      const last = fillE(z).slice(-1)[0];
      const asks: [string, number, string][] = [
        ["số electron độc thân", u, `Phân lớp ngoài chưa bão hòa được điền theo quy tắc Hund (mỗi orbital 1 electron trước) nên có ${u} electron độc thân.`],
        ["số electron ở lớp ngoài cùng", p.outer, `Lớp ngoài cùng là lớp n = ${p.per}, có ${p.outer} electron.`],
        ["số lớp electron", p.per, `Electron phân bố trên ${p.per} lớp (n = 1 đến n = ${p.per}).`],
      ];
      if (z !== 24 && z !== 29) asks.push([`số electron trên phân lớp có mức năng lượng cao nhất`, last.e, `Phân lớp có mức năng lượng cao nhất là ${last.n}${LL[last.l]}, chứa ${last.e} electron.`]);
      const [q, v, ex] = r.pick(asks);
      const pool = r.shuffle([u, p.outer, p.per, last.e, unp(atomConf(z + 1)), v + 1, v + 2, Math.abs(v - 1)].filter((x) => x !== v)).map(String);
      return { stem: `Ở trạng thái cơ bản, nguyên tử ${e.name} (Z = ${z}) có ${q} là`, ...mcq(r, String(v), pool),
        explanation: `Cấu hình electron: $${confTex(c)}$. ${ex}` };
    },
  },
  {
    id: "h10-vi-tri-tu-cau-hinh", subject: S, grade: G, chapter: C2, topic: "Xác định vị trí nguyên tố trong bảng tuần hoàn", half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const z = r.pick([...Array.from({ length: 34 }, (_, i) => i + 3)].filter((k) => k !== 10 && k !== 18)), e = E(z), p = pos(z), c = atomConf(z);
      const swapAB = p.grp.endsWith("A") ? p.grp.replace(/A$/, "B") : p.grp.replace(/B$/, "A");
      const w = [posT({ per: p.per, grp: swapAB }), posT({ per: p.per + 1, grp: p.grp }), posT({ per: p.per - 1, grp: p.grp })];
      if (p.block === "p") w.unshift(posT({ per: p.per, grp: RO[eSum(c, (x) => x.n === p.per && x.l === 1)] + "A" }));
      if (p.block === "d") w.unshift(posT({ per: p.per, grp: "IIA" }));
      if (p.block === "s") w.unshift(posT({ per: p.per + 1, grp: swapAB }));
      const giveZ = r.chance(0.5);
      const stem = giveZ ? `Nguyên tố ${e.name} có số hiệu nguyên tử Z = ${z}. Vị trí của nguyên tố này trong bảng tuần hoàn là`
        : `Nguyên tử của nguyên tố X có cấu hình electron $${confTex(c, z > 18)}$. Vị trí của X trong bảng tuần hoàn là`;
      const ex = p.block === "d"
        ? `Cấu hình $${confTex(c, true)}$: có ${p.per} lớp electron → chu kì ${p.per}; nguyên tố d, tổng số electron $(n-1)d + ns = ${p.g}$ → nhóm ${p.grp}.`
        : `Cấu hình $${confTex(c)}$: có ${p.per} lớp electron → chu kì ${p.per}; nguyên tố ${p.block}, có ${p.outer} electron lớp ngoài cùng → nhóm ${p.grp}.`;
      return { stem, ...mcq(r, posT(p), w), explanation: ex };
    },
  },
  {
    id: "h10-z-tu-vi-tri", subject: S, grade: G, chapter: C2, topic: "Tìm số hiệu nguyên tử từ vị trí", half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const z = r.pick([3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 19, 20, 31, 32, 33, 34, 35]), p = pos(z);
      const same = ELS.filter((x) => x.z !== z && x.z > 2 && x.z <= 36 && !(x.z >= 21 && x.z <= 30) && pos(x.z).grp === p.grp).map((x) => x.z);
      const w = [...(z >= 31 ? [z - 10] : []), ...r.shuffle(same), z + 1, z - 1, z + 8];
      const ex = z >= 31
        ? `Chu kì 4, nhóm ${p.grp}: cấu hình $[\\mathrm{Ar}]3d^{10}4s^{2}4p^{${p.g - 2}}$ nên $Z = 18 + 10 + ${p.g} = ${z}$ (chú ý phân lớp 3d đã bão hòa 10 electron).`
        : `Chu kì ${p.per} có ${p.per} lớp electron, nhóm ${p.grp} có ${p.g} electron lớp ngoài cùng: $${confTex(atomConf(z), z > 10)}$, nên $Z = ${z}$.`;
      return { stem: r.pick([`Nguyên tố X thuộc chu kì ${p.per}, nhóm ${p.grp} của bảng tuần hoàn. Số hiệu nguyên tử của X là`, `Nguyên tố R nằm ở chu kì ${p.per}, nhóm ${p.grp}. Số proton trong hạt nhân nguyên tử R là`]),
        ...mcq(r, String(z), w.map(String)), explanation: ex };
    },
  },
  {
    id: "h10-xu-huong-sap-xep", subject: S, grade: G, chapter: C2, topic: "Xu hướng biến đổi bán kính, độ âm điện, tính kim loại", half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const sets: { zs: number[]; per: boolean; d: string }[] = [
        { zs: [3, 4, 5, 6, 7, 8, 9], per: true, d: "chu kì 2" }, { zs: [11, 12, 13, 14, 15, 16, 17], per: true, d: "chu kì 3" },
        { zs: [19, 20, 31, 32, 33, 34, 35], per: true, d: "chu kì 4" }, { zs: [3, 11, 19], per: false, d: "nhóm IA" },
        { zs: [4, 12, 20], per: false, d: "nhóm IIA" }, { zs: [7, 15, 33], per: false, d: "nhóm VA" },
        { zs: [8, 16, 34], per: false, d: "nhóm VIA" }, { zs: [9, 17, 35], per: false, d: "nhóm VIIA" },
      ];
      const set = r.pick(sets); const zs = pickN(r, set.zs, set.per ? r.pick([3, 4]) : 3).sort((a, b) => a - b);
      const props: [string, number][] = [["bán kính nguyên tử", set.per ? -1 : 1], ["độ âm điện", set.per ? 1 : -1], ["tính kim loại", set.per ? -1 : 1], ["tính phi kim", set.per ? 1 : -1]];
      const [pn, sgn] = r.pick(props); const inc = r.chance(0.5);
      const ord = [...zs].sort((a, b) => (inc ? 1 : -1) * sgn * (a - b));
      if (pn === "độ âm điện") for (let i = 1; i < ord.length; i++) need((inc ? 1 : -1) * (E(ord[i]).en - E(ord[i - 1]).en) > 0);
      const T = (o: number[]) => o.map((k) => E(k).s).join(", ");
      const perms = (a: number[]): number[][] => a.length <= 1 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p]));
      const w = [T([...ord].reverse()), ...r.shuffle(perms(ord).map(T))];
      const rule = set.per
        ? "Trong một chu kì, theo chiều tăng điện tích hạt nhân, bán kính nguyên tử giảm, độ âm điện tăng, tính kim loại giảm và tính phi kim tăng."
        : "Trong một nhóm A, theo chiều tăng điện tích hạt nhân (từ trên xuống), bán kính nguyên tử tăng, độ âm điện giảm, tính kim loại tăng và tính phi kim giảm.";
      return {
        stem: `Cho các nguyên tố: ${zs.map((k) => lab(E(k))).join(", ")}. Dãy các nguyên tố được sắp xếp theo chiều ${pn} ${inc ? "tăng" : "giảm"} dần là`,
        ...mcq(r, T(ord), w), explanation: `Các nguyên tố trên cùng thuộc ${set.d}. ${rule} Vậy theo chiều ${pn} ${inc ? "tăng" : "giảm"} dần: ${T(ord)}.`,
      };
    },
  },
  {
    id: "h10-oxide-hydroxide-cao-nhat", subject: S, grade: G, chapter: C2, topic: "Oxide và hydroxide cao nhất", half: 1, level: 1, kind: "mcq",
    make: (r) => {
      const z = r.pick(HIGH), e = E(z), v = pos(z).g, p = pos(z);
      const askHyd = HYD[z] !== undefined && ![5, 6, 14].includes(z) && r.chance(0.5);
      const useR = r.chance(0.5), X = useR ? "R" : e.s;
      const intro = useR ? `Nguyên tố R có số hiệu nguyên tử Z = ${z}.` : `Nguyên tố ${e.name} thuộc chu kì ${p.per}, nhóm ${p.grp}.`;
      if (!askHyd) {
        const w = [v + 1, v - 1, 8 - v, v + 2, v - 2].filter((x) => x >= 1 && x <= 7 && x !== v).map((x) => m(oxide(X, x)));
        if (e.k === "pk") w.splice(1, 0, m(hydride(X, v)));
        return { stem: `${intro} Công thức oxide cao nhất của nguyên tố này là`, ...mcq(r, m(oxide(X, v)), w),
          explanation: `Nguyên tố thuộc nhóm ${p.grp} nên hóa trị cao nhất với oxygen là ${RO[v]}; oxide cao nhất: ${m(oxide(X, v))}.` };
      }
      const right = m(HYD[z].replace(e.s, X));
      const w = e.k === "kl" ? [v + 1, v - 1, v + 2].filter((x) => x >= 1).map((x) => m(baseF(X, x))) : [m(LOWACID[z].replace(e.s, X)), m(hydride(X, v))];
      w.push(m(oxide(X, v)));
      return { stem: `${intro} Hydroxide ứng với oxide cao nhất của nguyên tố này là`, ...mcq(r, right, r.shuffle(w)),
        explanation: `Nhóm ${p.grp}: hóa trị cao nhất ${RO[v]}, oxide cao nhất ${m(oxide(X, v))}, hydroxide tương ứng ${right}${e.k === "kl" ? " (là base" + (z === 13 || z === 4 || z === 31 ? ", có tính lưỡng tính)" : ")") : " (là acid)"}.` };
    },
  },
  {
    id: "h10-so-sanh-acid-base-hydroxide", subject: S, grade: G, chapter: C2, topic: "So sánh tính acid, base của hydroxide", half: 1, level: 3, kind: "mcq",
    make: (r) => {
      const sets: { zs: number[]; acid: boolean }[] = [
        { zs: [19, 11, 12, 13], acid: false }, { zs: [19, 20, 12, 13], acid: false }, { zs: [19, 11, 3, 4], acid: false }, { zs: [19, 20, 12, 4], acid: false },
        { zs: [17, 16, 15, 14], acid: true }, { zs: [17, 16, 15, 33], acid: true },
      ];
      const s = r.pick(sets); const f = (k: number) => m(HYD[k]); const kind = s.acid ? "acid" : "base";
      const ask = r.int(0, 2);
      const why = s.acid ? "tính phi kim của nguyên tố càng mạnh thì hydroxide cao nhất có tính acid càng mạnh" : "tính kim loại của nguyên tố càng mạnh thì hydroxide có tính base càng mạnh";
      const ex = `Cho Z: ${s.zs.map((k) => `${E(k).s} = ${k}`).join(", ")}. Theo xu hướng trong chu kì và nhóm, ${why}. Thứ tự tính ${kind} giảm dần: ${s.zs.map(f).join(" > ")}.`;
      const zText = `(cho Z: ${[...s.zs].sort((a, b) => a - b).map((k) => `${E(k).s} = ${k}`).join(", ")})`;
      const list = r.shuffle([...s.zs]);
      if (ask < 2) {
        const right = ask === 0 ? s.zs[0] : s.zs[3];
        return { stem: `Trong các hydroxide sau ${zText}, chất có tính ${kind} ${ask === 0 ? "mạnh" : "yếu"} nhất là`, ...mcq(r, f(right), list.filter((k) => k !== right).map(f)), explanation: ex };
      }
      const inc = [...s.zs].reverse(); const T = (o: number[]) => o.map(f).join(", ");
      const w = [T(s.zs), T([inc[1], inc[0], inc[2], inc[3]]), T([inc[0], inc[2], inc[1], inc[3]]), T([inc[0], inc[1], inc[3], inc[2]])];
      return { stem: `Dãy các hydroxide được sắp xếp theo chiều tính ${kind} tăng dần ${zText} là`, ...mcq(r, T(inc), w), explanation: ex };
    },
  },
  {
    id: "h10-tim-nguyen-to-tu-so-hat", subject: S, grade: G, chapter: C1, topic: "Tìm nguyên tố từ tổng số hạt", half: 1, level: 3, kind: "mcq",
    make: (r) => {
      const e = E(r.int(6, 30)), Z = e.z, N = e.A - Z, Sm = 2 * Z + N, D = 2 * Z - N;
      const stem0 = `Nguyên tử của nguyên tố X có tổng số hạt proton, neutron và electron là ${Sm}, trong đó số hạt mang điện nhiều hơn số hạt không mang điện là ${D}.`;
      const ex = `Gọi số proton = số electron = Z, số neutron = N. Ta có $2Z + N = ${Sm}$ và $2Z - N = ${D}$ nên $Z = \\dfrac{${Sm} + ${D}}{4} = ${Z}$, $N = ${N}$, $A = Z + N = ${e.A}$.`;
      if (r.chance(0.5)) {
        const ks = [Z, Z - 1, Z + 1, r.pick([Z + 2, Z - 2])], sortedK = [...ks].sort((a, b) => a - b);
        return { stem: `${stem0} Biết Z của ${sortedK.map((k) => E(k).s).join(", ")} lần lượt là ${sortedK.join(", ")}. X là`, ...mcq(r, nm(e), ks.slice(1).map((k) => nm(E(k)))), explanation: `${ex} Vậy X là ${e.name}.` };
      }
      return { stem: `${stem0} Số khối của X là`, ...mcq(r, String(e.A), r.shuffle([Z, N, 2 * Z, 2 * N, e.A + Z]).map(String)), explanation: ex };
    },
  },
  {
    id: "h10-ntk-trung-binh", subject: S, grade: G, chapter: C1, topic: "Nguyên tử khối trung bình", half: 1, level: 2, kind: "mcq",
    make: (r) => {
      const x = r.pick(ISO), p = round(x.p + r.int(-20, 20) / 10, 2), q = round(100 - p, 2);
      const M = round((x.a1 * p + x.a2 * q) / 100, 2), sw = round((x.a1 * q + x.a2 * p) / 100, 2);
      const w = [tex(sw), tex((x.a1 + x.a2) / 2), String(p > 50 ? x.a1 : x.a2), tex(round(M + (x.a2 - x.a1) / 10, 2))];
      return {
        stem: `${r.pick(["Trong tự nhiên,", "Trong thiên nhiên,"])} ${x.name} có hai đồng vị bền là ${isoT(x.a1, x.s)} (chiếm ${vn(p)}% số nguyên tử) và ${isoT(x.a2, x.s)} (chiếm ${vn(q)}% số nguyên tử). Coi nguyên tử khối của mỗi đồng vị bằng số khối. Nguyên tử khối trung bình của ${x.name} là`,
        ...mcq(r, `$${tex(M)}$`, w.map((s) => `$${s}$`)),
        explanation: `$\\bar{A} = \\dfrac{${x.a1}\\cdot ${tex(p)} + ${x.a2}\\cdot ${tex(q)}}{100} \\approx ${tex(M)}$.`,
      };
    },
  },
];

const H1B: Template[] = [
  {
    id: "h10-tf-thanh-phan-nguyen-tu", subject: S, grade: G, chapter: C1, topic: "Thành phần nguyên tử và cấu hình electron", half: 1, level: 1, kind: "tf",
    make: (r) => {
      const z = r.pick(ELS.filter((x) => x.z >= 6 && x.z <= 35 && (x.k === "kl" || x.k === "pk")).map((x) => x.z));
      const e = E(z), Z = z, A = e.A, N = A - Z, c = atomConf(z), p = pos(z), kl = e.k === "kl";
      const wN = N !== Z ? [N, Z] : [Z, A];
      const wTot = r.pick([A, 2 * N + Z].filter((x) => x !== 2 * Z + N));
      const wOut = p.block === "d" ? p.g : r.pick([p.outer + 1, p.outer > 1 ? p.outer - 1 : p.outer + 2]);
      const ct = `$${confTex(c, z > 18)}$`;
      const why = p.block === "d" ? "là nguyên tố d" : `nguyên tử có ${p.outer} electron lớp ngoài cùng`;
      return {
        stem: `Cho nguyên tử ${e.name} có kí hiệu ${iso(A, Z, e.s)}.`,
        ...tf([
          st(r.chance(0.5), `Hạt nhân nguyên tử ${e.name} có ${Z} proton và ${N} neutron.`, `Hạt nhân nguyên tử ${e.name} có ${wN[0]} proton và ${wN[1]} neutron.`),
          st(r.chance(0.5), `Tổng số hạt proton, neutron và electron trong nguyên tử này là ${2 * Z + N}.`, `Tổng số hạt proton, neutron và electron trong nguyên tử này là ${wTot}.`),
          st(r.chance(0.5), `Cấu hình electron của nguyên tử là ${ct}, lớp ngoài cùng có ${p.outer} electron.`, `Cấu hình electron của nguyên tử là ${ct}, lớp ngoài cùng có ${wOut} electron.`),
          st(r.chance(0.5), `${cap(e.name)} là ${kl ? "kim loại" : "phi kim"} vì ${why}.`, `${cap(e.name)} là ${kl ? "phi kim" : "kim loại"} vì ${why}.`),
        ]),
        explanation: `$Z = ${Z}$ nên có ${Z} proton, ${Z} electron; $N = A - Z = ${A} - ${Z} = ${N}$. Tổng số hạt $= 2Z + N = ${2 * Z + N}$ (số khối ${A} chỉ gồm proton và neutron). Cấu hình ${ct}: lớp ngoài cùng (n = ${p.per}) có ${p.outer} electron. ${p.block === "d" ? `${cap(e.name)} là nguyên tố d` : `Nguyên tử ${e.name} có ${p.outer} electron lớp ngoài cùng`} nên ${e.name} là ${kl ? "kim loại" : "phi kim"}.`,
      };
    },
  },
  {
    id: "h10-tf-dong-vi-ntk", subject: S, grade: G, chapter: C1, topic: "Đồng vị và nguyên tử khối trung bình", half: 1, level: 3, kind: "tf",
    make: (r) => {
      const x = r.pick(ISO), p = round(x.p + r.int(-20, 20) / 10, 2), q = round(100 - p, 2);
      const M = round((x.a1 * p + x.a2 * q) / 100, 2), sw = round((x.a1 * q + x.a2 * p) / 100, 2);
      need(M !== sw);
      const cp = r.pick(x.comp), Mc = round(cp.k * M + cp.rest, 2);
      const pct = round((cp.k * p * x.a1) / Mc, 2);
      const wrong = cp.k > 1 ? round((p * x.a1) / Mc, 2) : round((x.a1 / Mc) * 100, 2);
      const i1 = isoT(x.a1, x.s), i2 = isoT(x.a2, x.s);
      return {
        stem: `Trong tự nhiên, ${x.name} (Z = ${x.z}) có hai đồng vị bền là ${i1} (chiếm ${vn(p)}% số nguyên tử) và ${i2} (chiếm ${vn(q)}% số nguyên tử). Coi nguyên tử khối của mỗi đồng vị bằng số khối; cho nguyên tử khối: ${cp.cho}. Lấy nguyên tử khối trung bình của ${x.name} làm tròn đến hàng phần trăm.`,
        ...tf([
          st(r.chance(0.5), `Hai đồng vị trên đều có ${x.z} proton trong hạt nhân.`, `Hai đồng vị trên có cùng số neutron nhưng khác số proton.`),
          st(r.chance(0.5), `Hạt nhân đồng vị ${i2} có ${x.a2 - x.z} neutron.`, `Hạt nhân đồng vị ${i2} có ${x.a2} neutron.`),
          st(r.chance(0.5), `Nguyên tử khối trung bình của ${x.name} là ${vn(M)}.`, `Nguyên tử khối trung bình của ${x.name} là ${vn(sw)}.`),
          st(r.chance(0.5), `Phần trăm khối lượng của đồng vị ${i1} trong ${m(cp.f)} xấp xỉ ${vn(pct)}%.`, `Phần trăm khối lượng của đồng vị ${i1} trong ${m(cp.f)} xấp xỉ ${vn(wrong)}%.`),
        ]),
        explanation: `Đồng vị cùng số proton (${x.z}), khác số neutron. Đồng vị ${i2} có $N = ${x.a2} - ${x.z} = ${x.a2 - x.z}$. $\\bar{A} = \\dfrac{${x.a1}\\cdot ${tex(p)} + ${x.a2}\\cdot ${tex(q)}}{100} \\approx ${tex(M)}$. $M_{\\mathrm{${cp.f}}} = ${cp.k > 1 ? cp.k + "\\cdot " : ""}${tex(M)} + ${tex(cp.rest)} = ${tex(Mc)}$; phần trăm khối lượng ${i1} $= \\dfrac{${cp.k > 1 ? cp.k + "\\cdot " : ""}${x.a1}\\cdot ${tex(p / 100, 4)}}{${tex(Mc)}}\\cdot 100\\% \\approx ${tex(pct)}\\%$.`,
      };
    },
  },
  {
    id: "h10-tf-vi-tri-tinh-chat", subject: S, grade: G, chapter: C2, topic: "Vị trí và tính chất nguyên tố", half: 1, level: 2, kind: "tf",
    make: (r) => {
      const z = r.pick([3, 4, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 19, 20, 31, 34, 35, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]);
      const e = E(z), p = pos(z), c = atomConf(z), d = p.block === "d", kl = e.k === "kl", v = p.g;
      const wPer = d ? 3 : r.pick([p.per + 1, p.per - 1]);
      const wGrp = d ? p.grp.replace(/B$/, "A") : p.block === "p" ? RO[eSum(c, (x) => x.n === p.per && x.l === 1)] + "A" : p.grp.replace(/A$/, "B");
      let s4: [string, boolean], e4: string;
      if (HIGH.includes(z)) {
        const wv = r.pick([v - 1, v + 1].filter((x) => x >= 1 && x <= 7));
        s4 = st(r.chance(0.5), `Oxide cao nhất của X có công thức ${m(oxide("X", v))}.`, `Oxide cao nhất của X có công thức ${m(oxide("X", wv))}.`);
        e4 = `Hóa trị cao nhất với oxygen bằng số thứ tự nhóm (${RO[v]}) nên oxide cao nhất là ${m(oxide("X", v))}.`;
      } else if (d) {
        const u = unp(c);
        s4 = st(r.chance(0.5), `Ở trạng thái cơ bản, nguyên tử X có ${u} electron độc thân.`, `Ở trạng thái cơ bản, nguyên tử X có ${u + r.pick([1, 2])} electron độc thân.`);
        e4 = `Phân lớp 3d có ${eSum(c, (x) => x.l === 2)} electron, 4s có ${eSum(c, (x) => x.n === 4)} electron; theo quy tắc Hund, tổng số electron độc thân là ${u}.`;
      } else {
        s4 = st(r.chance(0.5), `Khi tham gia liên kết, nguyên tử X có xu hướng nhận ${8 - v} electron để đạt cấu hình electron của khí hiếm.`, `Khi tham gia liên kết, nguyên tử X có xu hướng nhường ${v} electron để đạt cấu hình electron của khí hiếm.`);
        e4 = `X có ${v} electron lớp ngoài cùng nên dễ nhận thêm ${8 - v} electron để đạt octet.`;
      }
      return {
        stem: r.chance(0.5) ? `Nguyên tử của nguyên tố X có cấu hình electron $${confTex(c, z > 18)}$.` : `Cho nguyên tố X có số hiệu nguyên tử Z = ${z}.`,
        ...tf([
          st(r.chance(0.5), `X thuộc chu kì ${p.per} của bảng tuần hoàn.`, `X thuộc chu kì ${wPer} của bảng tuần hoàn.`),
          st(r.chance(0.5), `X là nguyên tố ${p.block}, thuộc nhóm ${p.grp}.`, `X là nguyên tố ${p.block}, thuộc nhóm ${wGrp}.`),
          st(r.chance(0.5), `X là ${kl ? "kim loại" : "phi kim"}.`, `X là ${kl ? "phi kim" : "kim loại"}.`),
          s4,
        ]),
        explanation: `Cấu hình $${confTex(c, z > 18)}$ (Z = ${z}, X là ${e.name}): ${p.per} lớp electron → chu kì ${p.per}; ${d ? `nguyên tố d, $(n-1)d + ns$ có ${v} electron → nhóm ${p.grp}` : `nguyên tố ${p.block}, ${v} electron lớp ngoài cùng → nhóm ${p.grp}`}; X là ${kl ? "kim loại" : "phi kim"}. ${e4}`,
      };
    },
  },
  {
    id: "h10-tf-xu-huong-bien-doi", subject: S, grade: G, chapter: C2, topic: "So sánh tính chất hai nguyên tố", half: 1, level: 3, kind: "tf",
    make: (r) => {
      const sets: { zs: number[]; per: boolean }[] = [
        { zs: [11, 12, 13, 14, 15, 16, 17], per: true }, { zs: [3, 4, 5, 6, 7], per: true },
        { zs: [3, 11, 19], per: false }, { zs: [4, 12, 20], per: false }, { zs: [7, 15, 33], per: false },
      ];
      const s = r.pick(sets); const [a, b] = pickN(r, s.zs, 2).sort((x, y) => x - y); const A = E(a), B = E(b);
      const big = s.per ? A : B, small = s.per ? B : A;                 // bán kính
      const hiEN = s.per ? B : A, loEN = s.per ? A : B;
      need((hiEN.en - loEN.en) > 0);
      const acidHi = s.per ? b : a, acidLo = s.per ? a : b;           // hydroxide có tính acid mạnh hơn / yếu hơn
      const both = (k: string) => A.k === k && B.k === k;
      const [X, Y] = r.chance(0.5) ? [A, B] : [B, A];
      const rad = X === big, en = X === hiEN, met = X === loEN;
      const ac = X.z === acidHi;
      const hs = (e: El) => m(HYD[e.z]);
      let s4: [string, boolean];
      if (both("kl")) s4 = [`${hs(X)} có tính base mạnh hơn ${hs(Y)}.`, !ac];
      else s4 = [`${hs(X)} có tính acid mạnh hơn ${hs(Y)}.`, ac];
      const items: [string, boolean][] = [
        [`Bán kính nguyên tử ${X.s} lớn hơn bán kính nguyên tử ${Y.s}.`, rad],
        [`Độ âm điện của ${X.s} lớn hơn độ âm điện của ${Y.s}.`, en],
        [`Tính kim loại của ${X.s} mạnh hơn ${Y.s}.`, met],
        s4,
      ];
      return {
        stem: `Cho hai nguyên tố ${A.name} (Z = ${a}) và ${B.name} (Z = ${b}).`,
        ...tf(items),
        explanation: `${A.s} và ${B.s} cùng thuộc ${s.per ? `chu kì ${pos(a).per}` : `nhóm ${pos(a).grp}`}. ${s.per ? "Trong một chu kì, theo chiều tăng điện tích hạt nhân: bán kính giảm, độ âm điện tăng, tính kim loại giảm, tính acid của hydroxide cao nhất tăng (tính base giảm)." : "Trong một nhóm A, từ trên xuống: bán kính tăng, độ âm điện giảm, tính kim loại tăng, tính base của hydroxide tăng (tính acid giảm)."} Do đó: bán kính ${big.s} > ${small.s}; độ âm điện ${hiEN.s} > ${loEN.s}; tính kim loại ${loEN.s} > ${hiEN.s}; hydroxide ${m(HYD[acidHi])} có tính acid mạnh hơn (tính base yếu hơn) ${m(HYD[acidLo])}.`,
      };
    },
  },
  /* ---------- Trả lời ngắn half 1 ---------- */
  {
    id: "h10-short-tong-so-hat", subject: S, grade: G, chapter: C1, topic: "Tính số hạt trong nguyên tử, ion", half: 1, level: 1, kind: "short",
    make: (r) => {
      if (r.chance(0.5)) {
        const e = E(r.int(3, 36)), Z = e.z, N = e.A - Z;
        const [q, v, ex] = r.pick([["tổng số hạt proton, neutron và electron", 2 * Z + N, `$2Z + N = 2\\cdot ${Z} + ${N} = ${2 * Z + N}$`], ["tổng số hạt mang điện", 2 * Z, `$p + e = 2\\cdot ${Z} = ${2 * Z}$`]] as [string, number, string][]);
        return { stem: `Tính ${q} trong nguyên tử ${iso(e.A, Z, e.s)}.`, ...short(v), explanation: `$N = ${e.A} - ${Z} = ${N}$; ${ex}.` };
      }
      const [z, qq] = r.pick(SION), e = E(z), Z = z, N = e.A - Z, ne = Z - qq;
      const [q, v] = r.pick([["tổng số hạt proton, neutron và electron", Z + N + ne], ["số electron", ne], ["tổng số hạt mang điện", Z + ne]] as [string, number][]);
      return { stem: `Nguyên tử ${iso(e.A, Z, e.s)} ${qq > 0 ? `nhường ${qq}` : `nhận ${-qq}`} electron tạo thành ion ${m(ionF(e.s, qq))}. Tính ${q} trong ion ${m(ionF(e.s, qq))}.`, ...short(v),
        explanation: `Ion ${m(ionF(e.s, qq))} có ${Z} proton, $N = ${e.A} - ${Z} = ${N}$ neutron và $${Z} ${qq > 0 ? "-" : "+"} ${Math.abs(qq)} = ${ne}$ electron. Vậy ${q} là ${v}.` };
    },
  },
  {
    id: "h10-short-electron-phan-lop", subject: S, grade: G, chapter: C1, topic: "Đếm electron trên phân lớp, lớp", half: 1, level: 2, kind: "short",
    make: (r) => {
      const z = r.int(8, 35), e = E(z), c = atomConf(z);
      const asks: [string, number][] = [
        ["tổng số electron trên các phân lớp p", eSum(c, (x) => x.l === 1)], ["tổng số electron trên các phân lớp s", eSum(c, (x) => x.l === 0)],
        ["số electron độc thân", unp(c)],
      ];
      if (z >= 11) asks.push(["số electron ở lớp M (n = 3)", eSum(c, (x) => x.n === 3)]);
      if (z >= 21) asks.push(["số electron trên phân lớp 3d", eSum(c, (x) => x.l === 2)]);
      const [q, v] = r.pick(asks); need(v > 0);
      return { stem: `Nguyên tử ${e.name} có Z = ${z}. Ở trạng thái cơ bản, ${q} của nguyên tử ${e.name} là bao nhiêu?`, ...short(v),
        explanation: `${confExplain(z)} Vậy ${q} là ${v}.` };
    },
  },
  {
    id: "h10-short-z-tu-cau-hinh", subject: S, grade: G, chapter: C1, topic: "Số hiệu nguyên tử từ cấu hình electron", half: 1, level: 2, kind: "short",
    make: (r) => {
      const mode = r.int(0, 2);
      if (mode === 0) {
        const z = r.pick([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 31, 32, 33, 34, 35, 36]), p = pos(z), c = atomConf(z);
        const outer = sorted(c).filter((x) => x.n === p.per).map(subT).join("");
        return { stem: `Nguyên tử của nguyên tố X có cấu hình electron lớp ngoài cùng là $${outer}$. Số hiệu nguyên tử của X là bao nhiêu?`, ...short(z),
          explanation: `Cấu hình đầy đủ: $${confTex(c)}$${z >= 31 ? " (lưu ý phân lớp $3d^{10}$ đã được điền trước $4p$)" : ""}. Tổng số electron là ${z} nên $Z = ${z}$.` };
      }
      if (mode === 1) {
        const z = r.int(21, 30), c = atomConf(z);
        const val = `3d^{${eSum(c, (x) => x.l === 2)}}4s^{${eSum(c, (x) => x.n === 4)}}`;
        return { stem: `Nguyên tử của nguyên tố X có cấu hình electron ở phân lớp ngoài là $${val}$. Số hiệu nguyên tử của X là bao nhiêu?`, ...short(z),
          explanation: `Cấu hình đầy đủ: $[\\mathrm{Ar}]${val}$ nên $Z = 18 + ${z - 18} = ${z}$.` };
      }
      const [z, q] = r.pick([...SION, [26, 2], [26, 3], [29, 2], [30, 2], [24, 3], [25, 2]] as [number, number][]);
      const c = ionConf(z, q), ne = z - q;
      return { stem: `Ion $\\mathrm{${ionF("X", q)}}$ có cấu hình electron $${confTex(c, ne > 18)}$. Số hiệu nguyên tử của X là bao nhiêu?`, ...short(z),
        explanation: `Ion có ${ne} electron. Nguyên tử X ${q > 0 ? `đã nhường ${q}` : `đã nhận ${-q}`} electron nên $Z = ${ne} ${q > 0 ? "+" : "-"} ${Math.abs(q)} = ${z}$.` };
    },
  },
  {
    id: "h10-short-phan-tram-dong-vi", subject: S, grade: G, chapter: C1, topic: "Phần trăm số nguyên tử đồng vị", half: 1, level: 3, kind: "short",
    make: (r) => {
      const x = r.pick(ISO), p = Math.round(x.p) + r.int(-3, 3); need(p > 0 && p < 100);
      const M = round((x.a1 * p + x.a2 * (100 - p)) / 100, 2), first = r.chance(0.5), ans = first ? p : 100 - p;
      const ctx = r.pick(["", ` ${cap(x.name)} là nguyên tố có nhiều ứng dụng trong công nghiệp và đời sống.`]);
      return {
        stem: `${ctx ? ctx.trim() + " " : ""}Trong tự nhiên, ${x.name} có hai đồng vị bền là ${isoT(x.a1, x.s)} và ${isoT(x.a2, x.s)}; nguyên tử khối trung bình của ${x.name} là ${vn(M)}. Coi nguyên tử khối mỗi đồng vị bằng số khối. Phần trăm số nguyên tử của đồng vị ${isoT(first ? x.a1 : x.a2, x.s)} là bao nhiêu (%)?`,
        ...short(ans),
        explanation: `Gọi phần trăm số nguyên tử của ${isoT(x.a1, x.s)} là $x$: $\\dfrac{${x.a1}x + ${x.a2}(100 - x)}{100} = ${tex(M)}$ ⇒ $x = \\dfrac{100(${x.a2} - ${tex(M)})}{${x.a2 - x.a1}} = ${p}$. Vậy ${isoT(first ? x.a1 : x.a2, x.s)} chiếm ${ans}%.`,
      };
    },
  },
  {
    id: "h10-short-so-hat-ion", subject: S, grade: G, chapter: C1, topic: "Tổng số hạt trong ion", half: 1, level: 3, kind: "short",
    make: (r) => {
      const [z, q] = r.pick([...SION, [26, 2], [26, 3], [29, 2], [30, 2]] as [number, number][]);
      const e = E(z), N = e.A - z, ne = z - q, Sm = z + N + ne, D = z + ne - N; need(D > 0);
      const [ask, v] = r.pick([["Số khối của nguyên tử X", e.A], ["Số hiệu nguyên tử của X", z], ["Số neutron trong hạt nhân nguyên tử X", N]] as [string, number][]);
      return {
        stem: `Ion $\\mathrm{${ionF("X", q)}}$ có tổng số hạt proton, neutron và electron là ${Sm}, trong đó số hạt mang điện nhiều hơn số hạt không mang điện là ${D}. ${ask} là bao nhiêu?`,
        ...short(v),
        explanation: `Ion $\\mathrm{${ionF("X", q)}}$ có Z proton, $Z ${q > 0 ? "-" : "+"} ${Math.abs(q)}$ electron và N neutron: $2Z ${q > 0 ? "-" : "+"} ${Math.abs(q)} + N = ${Sm}$ và $2Z ${q > 0 ? "-" : "+"} ${Math.abs(q)} - N = ${D}$. Suy ra $N = \\dfrac{${Sm} - ${D}}{2} = ${N}$, $Z = ${z}$, $A = Z + N = ${e.A}$ (X là ${e.name}).`,
      };
    },
  },
  {
    id: "h10-short-oxide-cao-nhat-phan-tram", subject: S, grade: G, chapter: C2, topic: "Phần trăm khối lượng trong oxide cao nhất", half: 1, level: 3, kind: "short",
    make: (r) => {
      const e = E(r.pick([6, 14, 7, 15, 16, 34, 17])), v = pos(e.z).g, M = e.M, h = 8 - v;
      const ox = oxide("R", v), nR = v % 2 ? 2 : 1, nO = v % 2 ? v : v / 2, Mo = nR * M + 16 * nO;
      const pR = (nR * M / Mo) * 100, pO = 100 - pR, pH = (h / (M + h)) * 100;
      const mode = r.int(0, 2), cho = "Cho nguyên tử khối: H = 1, O = 16.";
      if (mode === 0) {
        const ph = round(pH, 2), Ms = (h * (100 - ph)) / ph, pRs = (nR * Ms / (nR * Ms + 16 * nO)) * 100;
        need(round(pRs, 1) === round(pR, 1));
        return { stem: `Nguyên tố R thuộc nhóm ${RO[v]}A. Trong hợp chất khí với hydrogen ($\\mathrm{${hydride("R", v)}}$), hydrogen chiếm ${vn(ph)}% về khối lượng. Tính phần trăm khối lượng của R trong oxide cao nhất (làm tròn đến hàng phần mười, đơn vị %). ${cho}`,
          ...short(round(pR, 1), 1),
          explanation: `$\\dfrac{${h}}{M_R + ${h}} = ${tex(ph / 100, 4)}$ ⇒ $M_R \\approx ${tex(Ms, 1)}$ (R là ${e.name}). Oxide cao nhất $\\mathrm{${ox}}$: $\\%R = \\dfrac{${nR > 1 ? nR + "\\cdot " : ""}${tex(M, 1)}}{${tex(Mo, 1)}}\\cdot 100\\% \\approx ${tex(pR, 1)}\\%$.` };
      }
      const usePO = mode === 2, pv = round(usePO ? pO : pR, 2);
      const Ms = usePO ? (16 * nO * (100 - pv)) / (pv * nR) : (16 * nO * pv) / ((100 - pv) * nR);
      need(round(Ms, 1) === round(M, 1));
      return { stem: `Nguyên tố R thuộc nhóm ${RO[v]}A. Trong oxide cao nhất của R, ${usePO ? "oxygen" : "R"} chiếm ${vn(pv)}% về khối lượng. Nguyên tử khối của R là bao nhiêu (làm tròn đến hàng phần mười)? ${cho}`,
        ...short(round(M, 1), 1),
        explanation: `Nhóm ${RO[v]}A nên oxide cao nhất là $\\mathrm{${ox}}$. Ta có $\\dfrac{${nR > 1 ? nR : ""}M_R}{${nR > 1 ? nR : ""}M_R + ${16 * nO}} = ${tex((usePO ? 100 - pv : pv) / 100, 4)}$ ⇒ $M_R \\approx ${tex(round(M, 1), 1)}$ (R là ${e.name}).` };
    },
  },
];

/* ======================= HALF 2: Liên kết hóa học ======================= */
const METALS = [3, 11, 19, 12, 20, 13];
const NONMET = [9, 17, 35, 8, 16, 7];
const nobleOf = (ne: number) => NOBLE[ne];
/** công thức hợp chất ion từ điện tích */
function ionicFormula(a: string, qa: number, b: string, qb: number) { const g = gcd(qa, qb); return { na: qb / g, nb: qa / g, f: `${a}${sub(qb / g)}${b}${sub(qa / g)}` }; }

const H2: Template[] = [
  {
    id: "h10-octet-hinh-thanh-ion", subject: S, grade: G, chapter: C3, topic: "Quy tắc octet và sự hình thành ion", half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const z = r.pick([3, 11, 19, 12, 20, 13, 7, 8, 9, 15, 16, 17, 35]), e = E(z), v = pos(z).g, kl = e.k === "kl";
      const k = kl ? v : 8 - v, q = kl ? v : -(8 - v), ne = z - q;
      const ex = `${cap(e.name)} có cấu hình $${confTex(atomConf(z), z > 10)}$, lớp ngoài cùng có ${v} electron nên có xu hướng ${kl ? `nhường ${k}` : `nhận thêm ${k}`} electron để đạt cấu hình bền của khí hiếm ${nobleOf(ne)}, tạo thành ion ${m(ionF(e.s, q))}.`;
      if (r.chance(0.5)) {
        const T = (give: boolean, n: number) => `${give ? "Nhường" : "Nhận"} ${n} electron tạo thành ion ${m(ionF(e.s, give ? n : -n))}`;
        return { stem: `Theo quy tắc octet, khi tham gia liên kết hóa học, nguyên tử ${e.name} (Z = ${z}) có xu hướng nào sau đây?`,
          ...mcq(r, T(kl, k), [T(!kl, k), T(kl, 8 - k), T(!kl, 8 - k), T(kl, k + 1)]), explanation: ex };
      }
      return { stem: `Nguyên tử ${e.name} (Z = ${z}) đạt được cấu hình electron bền vững của khí hiếm bằng cách tạo thành ion nào sau đây?`,
        ...mcq(r, m(ionF(e.s, q)), [m(ionF(e.s, -q)), m(ionF(e.s, kl ? -(8 - v) : 8 - v)), ...[q + 1, q - 1].filter((t) => t !== 0).map((t) => m(ionF(e.s, t)))]), explanation: ex };
    },
  },
  {
    id: "h10-cau-hinh-ion", subject: S, grade: G, chapter: C3, topic: "Cấu hình electron của ion", half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const [z, q] = r.pick([...SION, [26, 2], [26, 3], [29, 2], [29, 1], [30, 2], [24, 3], [25, 2]] as [number, number][]);
      const e = E(z), ne = z - q, core = ne > 18 || z > 20;
      const ct = (c: Sub[]) => `$${confTex(c, core)}$`;
      const right = ct(ionConf(z, q)); const w: string[] = [];
      if (z > 20 && q > 0) { const c = clone(atomConf(z)); const d = c.find((x) => x.l === 2)!; need(d.e >= q); d.e -= q; w.push(ct(c)); }
      w.push(ct(atomConf(z)), ct(fillE(z + q)), ct(fillE(ne + (q > 0 ? -1 : 1))));
      return {
        stem: `Cấu hình electron của ion ${m(ionF(e.s, q))} (Z của ${e.s} là ${z}) là`, ...mcq(r, right, w),
        explanation: `Nguyên tử ${e.s}: $${confTex(atomConf(z), core)}$. Ion ${m(ionF(e.s, q))} có $${z} ${q > 0 ? "-" : "+"} ${Math.abs(q)} = ${ne}$ electron${q > 0 && z > 20 ? "; khi tạo cation, electron bị tách ra từ lớp ngoài cùng (4s) trước rồi mới đến 3d" : q > 0 ? ", nhường electron lớp ngoài cùng" : ", nhận thêm electron vào phân lớp ngoài cùng"}: ${right}.`,
      };
    },
  },
  {
    id: "h10-ion-giong-khi-hiem", subject: S, grade: G, chapter: C3, topic: "Ion có cấu hình khí hiếm", half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const ions: [number, number][] = [...SION, [26, 2], [29, 2], [30, 2], [26, 3]];
      const ne = (x: [number, number]) => x[0] - x[1];
      if (r.chance(0.5)) {
        const g = r.pick([10, 18]); const yes = ions.filter((x) => ne(x) === g), no = ions.filter((x) => ne(x) !== g);
        const T = (x: [number, number]) => m(ionF(E(x[0]).s, x[1]));
        const neg = r.chance(0.3);
        const [right, wrong] = neg ? [r.pick(no), pickN(r, yes, 3)] : [r.pick(yes), pickN(r, no, 3)];
        return { stem: `Ion nào sau đây ${neg ? "không có" : "có"} cấu hình electron giống khí hiếm ${NOBLE[g]} (Z = ${g})? (Cho Z: ${[right, ...wrong].map((x) => `${E(x[0]).s} = ${x[0]}`).join(", ")})`,
          ...mcq(r, T(right), wrong.map(T)),
          explanation: `Ion có cấu hình giống ${NOBLE[g]} khi có ${g} electron. ${[right, ...wrong].map((x) => `${T(x)}: $${x[0]} ${x[1] > 0 ? "-" : "+"} ${Math.abs(x[1])} = ${ne(x)}$`).join("; ")} electron.` };
      }
      const x = r.pick(SION.filter((t) => t[0] > 3)), g = ne(x), q = x[1], z = x[0];
      const ks = [z, g - q, g, (g === 18 ? 10 : 18) - q].filter((k) => k >= 1 && k <= 36);
      need(new Set(ks).size === 4);
      return { stem: `Ion $\\mathrm{${ionF("X", q)}}$ có cấu hình electron giống khí hiếm ${NOBLE[g]} (Z = ${g}). Nguyên tố X là`,
        ...mcq(r, nm(E(z)), ks.slice(1).map((k) => nm(E(k)))),
        explanation: `Ion $\\mathrm{${ionF("X", q)}}$ có ${g} electron; nguyên tử X ${q > 0 ? `đã nhường ${q}` : `đã nhận ${-q}`} electron nên $Z_X = ${g} ${q > 0 ? "+" : "-"} ${Math.abs(q)} = ${z}$: X là ${E(z).name}.` };
    },
  },
  {
    id: "h10-cong-thuc-hop-chat-ion", subject: S, grade: G, chapter: C3, topic: "Công thức và loại liên kết trong hợp chất ion", half: 2, level: 3, kind: "mcq",
    make: (r) => {
      const a = E(r.pick(METALS)), b = E(r.pick(NONMET)); need(dEN(a.s, b.s) >= 1.7);
      const qa = pos(a.z).g, qb = 8 - pos(b.z).g, F = ionicFormula("X", qa, "Y", qb);
      const alt = [`X${sub(F.nb)}Y${sub(F.na)}`, "XY", "X_{2}Y", "XY_{2}", "X_{3}Y", "XY_{3}", "X_{2}Y_{3}", "X_{3}Y_{2}"].filter((f) => f !== F.f);
      const [w1, w2] = [alt[0] === F.f ? alt[1] : alt[0], r.pick(alt.slice(1))];
      const O = (f: string, ion: boolean) => `${m(f)}, ${ion ? "liên kết ion" : "liên kết cộng hóa trị"}`;
      return {
        stem: `Nguyên tố X có số hiệu nguyên tử Z = ${a.z}, nguyên tố Y có Z = ${b.z}. Hợp chất tạo bởi X và Y có công thức và loại liên kết là`,
        ...mcq(r, O(F.f, true), [O(F.f, false), O(w1, true), O(w2, true), O(w2, false)]),
        explanation: `X (${a.name}, $${confTex(atomConf(a.z), a.z > 10)}$) là kim loại, nhường ${qa} electron tạo $\\mathrm{X^{${qa > 1 ? qa : ""}+}}$; Y (${b.name}, $${confTex(atomConf(b.z), b.z > 10)}$) là phi kim, nhận ${qb} electron tạo $\\mathrm{Y^{${qb > 1 ? qb : ""}-}}$. Hợp chất trung hòa điện: ${m(F.f)}; liên kết giữa các ion trái dấu là liên kết ion.`,
      };
    },
  },
  {
    id: "h10-chon-chat-theo-loai-lien-ket", subject: S, grade: G, chapter: C3, topic: "Dựa vào hiệu độ âm điện chọn chất", half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const t = r.pick(["ion", "cp", "ck"] as BT[]);
      const right = r.pick(CTYPE.filter((c) => c.t === t)), others = CTYPE.filter((c) => c.t !== t);
      const wrong = [r.pick(others.filter((c) => c.t !== t && c.t === (t === "ion" ? "cp" : "ion"))), ...pickN(r, others, 4)];
      const ws = [...new Map(wrong.map((c) => [c.f, c])).values()].slice(0, 3); need(ws.length === 3);
      const all = [right, ...ws];
      return {
        stem: `Cho độ âm điện: ${enList(all.flatMap((c) => [c.a, c.b]))}. ${RULE} Chất nào sau đây có ${BTN[t]}?`,
        ...mcq(r, m(right.f), ws.map((c) => m(c.f))), explanation: all.map(dExpl).join("; ") + ".",
      };
    },
  },
  {
    id: "h10-phan-loai-lien-ket-hieu-am-dien", subject: S, grade: G, chapter: C3, topic: "Phân loại liên kết theo hiệu độ âm điện", half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const c = r.pick(CTYPE.filter((x) => x.a !== x.b));
      const opts = [BTN.ion, BTN.cp, BTN.ck, "liên kết hydrogen"];
      return {
        stem: `Cho độ âm điện: ${enList([c.a, c.b])}. ${RULE} Liên kết giữa các nguyên tử trong ${m(c.f)} thuộc loại`,
        ...mcq(r, BTN[c.t], opts.filter((o) => o !== BTN[c.t])), explanation: dExpl(c) + ".",
      };
    },
  },
  {
    id: "h10-dem-lien-ket-sigma-pi", subject: S, grade: G, chapter: C3, topic: "Liên kết σ và liên kết π", half: 2, level: 2, kind: "mcq",
    make: (r) => {
      const x = r.pick(SPM.filter((y) => y.pi > 0)), A = (s: number, p: number) => `${s} và ${p}`;
      return {
        stem: `Phân tử ${x.name} có công thức cấu tạo $\\mathrm{${x.st}}$. Số liên kết $\\sigma$ và số liên kết $\\pi$ trong một phân tử ${x.name} lần lượt là`,
        ...mcq(r, A(x.sig, x.pi), [A(x.sig + x.pi, x.pi), A(x.pi, x.sig), A(x.sig + x.pi, 0), A(x.sig - x.pi, x.pi), A(x.sig, 2 * x.pi)].filter((s) => !s.startsWith("0 "))),
        explanation: spExpl(x),
      };
    },
  },
  {
    id: "h10-cap-electron-lewis", subject: S, grade: G, chapter: C3, topic: "Công thức Lewis: cặp electron chung và riêng", half: 2, level: 3, kind: "mcq",
    make: (r) => {
      const x = r.pick(MOL);
      const asks: [string, number, string][] = [
        [`tổng số cặp electron hóa trị riêng (chưa liên kết) trong phân tử`, x.lpT, `tổng số cặp electron riêng là ${x.lpT}`],
        [`số cặp electron dùng chung trong phân tử`, x.bp, `số cặp electron dùng chung là ${x.bp}`],
      ];
      if (x.lpC >= 0) asks.push([`số cặp electron hóa trị riêng của nguyên tử trung tâm ${x.c}`, x.lpC, `nguyên tử trung tâm ${x.c} còn ${x.lpC} cặp electron riêng`]);
      const [q, v, ex] = r.pick(asks);
      const pool = r.shuffle([x.lpT, x.bp, x.lpC, x.sig, v + 1, v + 2, Math.abs(v - 1), 2 * v].filter((k) => k >= 0 && k !== v)).map(String);
      return {
        stem: `Trong công thức Lewis của phân tử ${molN(x)}, ${q} là`, ...mcq(r, String(v), pool),
        explanation: `Trong công thức Lewis của ${m(x.f)}${x.st ? ` (công thức cấu tạo $\\mathrm{${x.st}}$)` : ""}: mỗi nguyên tử (trừ H) đạt octet; có ${x.bp} cặp electron dùng chung (${x.sig} liên kết $\\sigma$, ${x.pi} liên kết $\\pi$), ${x.lpT} cặp electron riêng${x.lpC >= 0 ? `, trong đó nguyên tử trung tâm ${x.c} còn ${x.lpC} cặp` : ""}. Vậy ${ex}.`,
      };
    },
  },
  {
    id: "h10-lien-ket-don-doi-ba", subject: S, grade: G, chapter: C3, topic: "Liên kết đơn, đôi, ba", half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const kindOf = (x: Mol) => (x.f === "N_{2}" || x.f === "HCN" || x.f === "C_{2}H_{2}" ? 3 : x.pi > 0 ? 2 : 1);
      const t = r.pick([1, 2, 3]), tn = ["", "chỉ có liên kết đơn", "có liên kết đôi", "có liên kết ba"][t];
      const right = r.pick(MOL.filter((x) => kindOf(x) === t)), wrong = pickN(r, MOL.filter((x) => kindOf(x) !== t), 3);
      const all = [right, ...wrong];
      return {
        stem: `Cho các phân tử: ${r.shuffle([...all]).map(molN).join(", ")}. Phân tử ${tn} là`, ...mcq(r, m(right.f), wrong.map((x) => m(x.f))),
        explanation: all.map((x) => `${m(x.f)}: ${["", "chỉ có liên kết đơn", "có liên kết đôi", "có liên kết ba"][kindOf(x)]}`).join("; ") + `. Phân tử ${tn} là ${m(right.f)}.`,
      };
    },
  },
  {
    id: "h10-chat-co-lien-ket-hydrogen", subject: S, grade: G, chapter: C3, topic: "Nhận biết liên kết hydrogen", half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const HB = [["H_{2}O", "nước"], ["NH_{3}", "ammonia"], ["HF", "hydrogen fluoride"], ["CH_{3}OH", "methanol"], ["C_{2}H_{5}OH", "ethanol"], ["CH_{3}COOH", "acetic acid"]];
      const NO = [["CH_{4}", "methane"], ["H_{2}S", "hydrogen sulfide"], ["HCl", "hydrogen chloride"], ["PH_{3}", "phosphine"], ["C_{2}H_{6}", "ethane"], ["CH_{3}OCH_{3}", "dimethyl ether"], ["CO_{2}", "carbon dioxide"], ["CH_{3}Cl", "chloromethane"]];
      const T = (x: string[]) => `${x[1]} (${m(x[0])})`; const neg = r.chance(0.35);
      const [right, wrong] = neg ? [r.pick(NO), pickN(r, HB, 3)] : [r.pick(HB), pickN(r, NO, 3)];
      return {
        stem: `Cho các chất: ${r.shuffle([right, ...wrong]).map(T).join(", ")}. Chất mà giữa các phân tử ${neg ? "không có" : "có"} liên kết hydrogen là`,
        ...mcq(r, m(right[0]), wrong.map((x) => m(x[0]))),
        explanation: `Liên kết hydrogen hình thành giữa nguyên tử H (đã liên kết với nguyên tử có độ âm điện lớn như F, O, N) với nguyên tử F, O, N còn cặp electron riêng của phân tử khác. ${neg ? `${m(right[0])} không có nguyên tử H liên kết trực tiếp với F, O hoặc N nên không tạo liên kết hydrogen; ${wrong.map((x) => m(x[0])).join(", ")} đều có.` : `${m(right[0])} có H liên kết trực tiếp với ${right[0].includes("F") ? "F" : right[0].includes("N") ? "N" : "O"}; ${wrong.map((x) => m(x[0])).join(", ")} thì không.`}`,
      };
    },
  },
  {
    id: "h10-so-sanh-nhiet-do-soi", subject: S, grade: G, chapter: C3, topic: "So sánh nhiệt độ sôi (liên kết hydrogen, van der Waals)", half: 2, level: 3, kind: "mcq",
    make: (r) => {
      const s = r.pick(SER), xs = s.xs, ask = r.int(0, 2);
      const byBp = [...xs].sort((a, b) => a.bp - b.bp), T = (x: BP) => m(x.f), L = (o: BP[]) => o.map(T).join(" < ");
      const ex = `${s.note} Thứ tự nhiệt độ sôi tăng dần: ${L(byBp)}.`;
      if (ask < 2) {
        const right = ask === 0 ? byBp[3] : byBp[0];
        return { stem: `Cho các chất: ${r.shuffle([...xs]).map((x) => `${x.name} (${T(x)})`).join(", ")}. Chất có nhiệt độ sôi ${ask === 0 ? "cao" : "thấp"} nhất là`,
          ...mcq(r, T(right), xs.filter((x) => x !== right).map(T)), explanation: ex };
      }
      const byM = [...xs].sort((a, b) => a.M - b.M);
      const w = [L([...byBp].reverse()), L(byM), L([byBp[1], byBp[0], byBp[2], byBp[3]]), L([byBp[0], byBp[2], byBp[1], byBp[3]]), L([byBp[0], byBp[1], byBp[3], byBp[2]])];
      return { stem: `Dãy các chất được sắp xếp theo chiều nhiệt độ sôi tăng dần là (cho khối lượng phân tử: ${xs.map((x) => `${T(x)} = ${vn(x.M, 1)}`).join("; ")})`,
        ...mcq(r, L(byBp), w), explanation: ex };
    },
  },
  {
    id: "h10-khai-niem-lien-ket", subject: S, grade: G, chapter: C3, topic: "Khái niệm các loại liên kết", half: 2, level: 1, kind: "mcq",
    make: (r) => {
      const B: [string, string, string[], string][] = [
        ["Liên kết ion được hình thành do", "lực hút tĩnh điện giữa các ion mang điện tích trái dấu", ["sự dùng chung cặp electron giữa hai nguyên tử", "sự xen phủ bên của hai orbital p", "lực hút giữa nguyên tử H và nguyên tử có độ âm điện lớn"], "Liên kết ion là liên kết được hình thành bởi lực hút tĩnh điện giữa các ion mang điện tích trái dấu."],
        ["Liên kết cộng hóa trị là liên kết được tạo nên giữa hai nguyên tử bằng", "một hay nhiều cặp electron dùng chung", ["lực hút tĩnh điện giữa cation và anion", "sự chuyển hẳn electron từ nguyên tử này sang nguyên tử kia", "lực hút giữa các lưỡng cực tạm thời"], "Liên kết cộng hóa trị được tạo nên bởi một hay nhiều cặp electron dùng chung giữa hai nguyên tử."],
        ["Liên kết $\\sigma$ được hình thành do", "sự xen phủ trục của hai orbital", ["sự xen phủ bên của hai orbital p", "lực hút tĩnh điện giữa hai ion trái dấu", "sự cho – nhận cặp electron giữa hai phân tử"], "Liên kết $\\sigma$ hình thành do sự xen phủ trục (vùng xen phủ nằm trên trục nối hai hạt nhân)."],
        ["Liên kết $\\pi$ được hình thành do", "sự xen phủ bên của hai orbital p", ["sự xen phủ trục của hai orbital s", "sự xen phủ trục của orbital s và orbital p", "lực hút tĩnh điện giữa hai ion trái dấu"], "Liên kết $\\pi$ hình thành do sự xen phủ bên của hai orbital p (vùng xen phủ nằm hai bên trục nối hai hạt nhân)."],
        ["Một liên kết ba giữa hai nguyên tử gồm", "1 liên kết $\\sigma$ và 2 liên kết $\\pi$", ["3 liên kết $\\sigma$", "2 liên kết $\\sigma$ và 1 liên kết $\\pi$", "3 liên kết $\\pi$"], "Liên kết bội luôn có 1 liên kết $\\sigma$, các liên kết còn lại là $\\pi$: liên kết ba = 1 $\\sigma$ + 2 $\\pi$."],
        ["Một liên kết đôi giữa hai nguyên tử gồm", "1 liên kết $\\sigma$ và 1 liên kết $\\pi$", ["2 liên kết $\\sigma$", "2 liên kết $\\pi$", "1 liên kết ion và 1 liên kết cộng hóa trị"], "Liên kết đôi gồm 1 liên kết $\\sigma$ và 1 liên kết $\\pi$."],
        ["Trong liên kết cộng hóa trị phân cực, cặp electron dùng chung", "lệch về phía nguyên tử có độ âm điện lớn hơn", ["nằm chính giữa hai nguyên tử", "lệch về phía nguyên tử có độ âm điện nhỏ hơn", "chuyển hẳn sang nguyên tử có độ âm điện lớn hơn"], "Cặp electron chung bị hút lệch về phía nguyên tử có độ âm điện lớn hơn; nếu chuyển hẳn thì thành liên kết ion."],
        ["Liên kết cho – nhận là liên kết cộng hóa trị trong đó", "cặp electron dùng chung chỉ do một nguyên tử đóng góp", ["mỗi nguyên tử góp một electron", "electron chuyển hẳn từ nguyên tử này sang nguyên tử kia", "hai nguyên tử có độ âm điện bằng nhau"], "Trong liên kết cho – nhận, cặp electron chung do một nguyên tử (nguyên tử cho) đóng góp."],
        ["Liên kết hydrogen là liên kết", "yếu, hình thành giữa nguyên tử H (đã liên kết với F, O, N) và nguyên tử có độ âm điện lớn còn cặp electron riêng", ["cộng hóa trị giữa hai nguyên tử hydrogen", "ion giữa cation $\\mathrm{H^+}$ và anion", "bền hơn liên kết cộng hóa trị, có trong mọi hợp chất chứa hydrogen"], "Liên kết hydrogen là tương tác yếu giữa H (mang một phần điện tích dương, đã liên kết với nguyên tử F, O, N) và nguyên tử có độ âm điện lớn còn cặp electron riêng."],
        ["Tương tác van der Waals là", "tương tác tĩnh điện lưỡng cực – lưỡng cực giữa các nguyên tử hoặc phân tử", ["lực hút tĩnh điện giữa các ion trái dấu trong tinh thể", "liên kết do các cặp electron dùng chung", "liên kết giữa nguyên tử H và nguyên tử F, O, N"], "Tương tác van der Waals là tương tác tĩnh điện lưỡng cực – lưỡng cực (kể cả lưỡng cực tạm thời và cảm ứng) giữa các nguyên tử, phân tử."],
        ["Khi khối lượng phân tử và kích thước phân tử tăng (với các chất có cấu tạo tương tự), tương tác van der Waals", "tăng, làm nhiệt độ sôi, nhiệt độ nóng chảy tăng", ["giảm, làm nhiệt độ sôi giảm", "không đổi", "tăng, làm nhiệt độ sôi giảm"], "Phân tử càng lớn, càng dễ bị phân cực tạm thời nên tương tác van der Waals càng mạnh, nhiệt độ sôi và nóng chảy càng cao."],
        ["Theo quy tắc octet, khi hình thành liên kết, nguyên tử các nguyên tố nhóm A có xu hướng", "đạt tới cấu hình electron bền vững của khí hiếm gần nhất", ["đạt tới cấu hình electron của kim loại kiềm gần nhất", "luôn nhường hết electron lớp ngoài cùng", "luôn nhận thêm 8 electron"], "Quy tắc octet: nguyên tử nhường, nhận hoặc góp chung electron để đạt lớp ngoài cùng 8 electron (2 với He) như khí hiếm."],
        ["Ở điều kiện thường, hợp chất ion thường", "ở trạng thái rắn, có nhiệt độ nóng chảy cao, khi nóng chảy hoặc tan trong nước thì dẫn điện", ["ở trạng thái khí, dễ bay hơi", "có nhiệt độ nóng chảy thấp, không tan trong nước", "dẫn điện tốt ở trạng thái rắn"], "Lực hút tĩnh điện giữa các ion rất mạnh nên hợp chất ion là chất rắn, nóng chảy ở nhiệt độ cao; ở trạng thái nóng chảy hoặc dung dịch có ion chuyển động tự do nên dẫn điện."],
        ["Cation được tạo thành khi", "nguyên tử nhường electron", ["nguyên tử nhận thêm electron", "nguyên tử nhận thêm proton", "nguyên tử góp chung electron"], "Nguyên tử trung hòa nhường electron thì số proton lớn hơn số electron nên tạo ion dương (cation)."],
      ];
      const [q, right, w, ex] = r.pick(B);
      return { stem: q, ...mcq(r, right, w), explanation: ex };
    },
  },
];

const H2B: Template[] = [
  {
    id: "h10-tf-lien-ket-ion", subject: S, grade: G, chapter: C3, topic: "Sự hình thành liên kết ion", half: 2, level: 2, kind: "tf",
    make: (r) => {
      const a = E(r.pick(METALS)), b = E(r.pick(NONMET)); need(dEN(a.s, b.s) >= 1.7);
      const qa = pos(a.z).g, qb = 8 - pos(b.z).g, F = ionicFormula(a.s, qa, b.s, qb);
      let Fw = `${a.s}${sub(F.nb)}${b.s}${sub(F.na)}`; if (Fw.includes("NaN")) Fw = `${a.s}_{2}${b.s}`;
      const gb = b.z + qb, gw = gb === 18 ? 10 : 18, ne = F.na * qa;
      const gas: Record<number, string> = { 8: "khí oxygen", 9: "khí fluorine", 17: "khí chlorine", 35: "hơi bromine", 16: "sulfur", 7: "khí nitrogen" };
      return {
        stem: `Khi đốt ${a.name} (Z = ${a.z}) trong ${gas[b.z]} (${b.s}, Z = ${b.z}), thu được hợp chất ion tạo bởi ${a.name} và ${b.name}.`,
        ...tf([
          st(r.chance(0.5), `Mỗi nguyên tử ${a.s} nhường ${qa} electron tạo thành ion ${m(ionF(a.s, qa))}.`, r.chance(0.5) ? `Mỗi nguyên tử ${a.s} nhận ${8 - qa} electron tạo thành ion ${m(ionF(a.s, -(8 - qa)))}.` : `Mỗi nguyên tử ${a.s} nhường ${qa + 1} electron tạo thành ion ${m(ionF(a.s, qa + 1))}.`),
          st(r.chance(0.5), `Ion ${m(ionF(b.s, -qb))} có cấu hình electron giống khí hiếm ${NOBLE[gb]}.`, `Ion ${m(ionF(b.s, -qb))} có cấu hình electron giống khí hiếm ${NOBLE[gw]}.`),
          F.f !== Fw ? st(r.chance(0.5), `Công thức của hợp chất là ${m(F.f)}.`, `Công thức của hợp chất là ${m(Fw)}.`) : st(r.chance(0.5), `Công thức của hợp chất là ${m(F.f)}.`, `Công thức của hợp chất là ${m(`${a.s}_{2}${b.s}`)}.`),
          st(r.chance(0.5), `Để tạo thành một đơn vị công thức ${m(F.f)}, tổng số electron mà các nguyên tử ${a.s} đã nhường là ${ne}.`, `Để tạo thành một đơn vị công thức ${m(F.f)}, tổng số electron mà các nguyên tử ${a.s} đã nhường là ${ne === qa ? qa + qb : qa}.`),
        ]),
        explanation: `${a.s} có ${qa} electron lớp ngoài cùng → nhường ${qa} electron tạo ${m(ionF(a.s, qa))}; ${b.s} có ${8 - qb} electron lớp ngoài cùng → nhận ${qb} electron tạo ${m(ionF(b.s, -qb))} (${gb} electron, giống ${NOBLE[gb]}). Tổng điện tích bằng 0 nên công thức là ${m(F.f)}; ${F.na} nguyên tử ${a.s} nhường tổng cộng $${F.na}\\cdot ${qa} = ${ne}$ electron cho ${F.nb} nguyên tử ${b.s} (mỗi nguyên tử nhận ${qb}).`,
      };
    },
  },
  {
    id: "h10-tf-hieu-do-am-dien", subject: S, grade: G, chapter: C3, topic: "Hiệu độ âm điện và loại liên kết", half: 2, level: 3, kind: "tf",
    make: (r) => {
      const pick = (t: BT) => r.pick(CTYPE.filter((c) => c.t === t && c.a !== c.b));
      const cs = r.shuffle([pick("ion"), pick("cp"), pick("ck")]), pc = r.pick(CTYPE.filter((c) => c.t === "cp" && !cs.includes(c)));
      const other = (t: BT): BT => r.pick((["ion", "cp", "ck"] as BT[]).filter((x) => x !== t));
      const items = cs.map((c) => { const ok = r.chance(0.5), t = ok ? c.t : other(c.t); return [`Liên kết giữa các nguyên tử trong ${m(c.f)} là ${BTN[t]}.`, ok] as [string, boolean]; });
      const [hi, lo] = bySym(pc.a).en > bySym(pc.b).en ? [pc.a, pc.b] : [pc.b, pc.a];
      const ok4 = r.chance(0.5);
      items.push([`Trong phân tử ${m(pc.f)}, các cặp electron dùng chung lệch về phía nguyên tử ${ok4 ? hi : lo}.`, ok4]);
      return {
        stem: `Cho độ âm điện (theo Pauling): ${enList([...cs, pc].flatMap((c) => [c.a, c.b]))}. ${RULE}`,
        ...tf(items),
        explanation: [...cs, pc].map(dExpl).join("; ") + `. Trong ${m(pc.f)}, cặp electron chung lệch về phía ${hi} (độ âm điện lớn hơn).`,
      };
    },
  },
  {
    id: "h10-tf-phan-tu-cong-hoa-tri", subject: S, grade: G, chapter: C3, topic: "Cấu tạo phân tử cộng hóa trị", half: 2, level: 2, kind: "tf",
    make: (r) => {
      const x = r.pick(MOL.filter((y) => y.f !== "F_{2}"));
      const s3: [string, boolean] = x.lpC >= 0
        ? st(r.chance(0.5), `Trong công thức Lewis, nguyên tử trung tâm ${x.c} còn ${x.lpC} cặp electron hóa trị riêng.`, `Trong công thức Lewis, nguyên tử trung tâm ${x.c} còn ${x.lpC === 0 ? 1 : x.lpC + r.pick([1, -1])} cặp electron hóa trị riêng.`)
        : st(r.chance(0.5), `Trong công thức Lewis của phân tử có tổng cộng ${x.lpT} cặp electron hóa trị riêng.`, `Trong công thức Lewis của phân tử có tổng cộng ${x.lpT === 0 ? 2 : x.lpT + r.pick([1, -1, 2])} cặp electron hóa trị riêng.`);
      return {
        stem: `Xét phân tử ${molN(x)}${x.st ? ` có công thức cấu tạo $\\mathrm{${x.st}}$` : ""}.`,
        ...tf([
          st(r.chance(0.5), `Phân tử có ${x.sig} liên kết $\\sigma$.`, `Phân tử có ${x.sig + x.pi === x.sig ? x.sig + 1 : x.sig + x.pi} liên kết $\\sigma$.`),
          st(r.chance(0.5), `Phân tử có ${x.pi} liên kết $\\pi$.`, `Phân tử có ${x.pi === 0 ? 1 : x.pi + r.pick([1, -1])} liên kết $\\pi$.`),
          s3,
          st(r.chance(0.5), `Giữa các phân tử ${m(x.f)} ${x.hb ? "có" : "không có"} liên kết hydrogen.`, `Giữa các phân tử ${m(x.f)} ${x.hb ? "không có" : "có"} liên kết hydrogen.`),
        ]),
        explanation: `Trong ${m(x.f)}: ${x.sig} liên kết $\\sigma$, ${x.pi} liên kết $\\pi$ (liên kết đôi = 1 $\\sigma$ + 1 $\\pi$, liên kết ba = 1 $\\sigma$ + 2 $\\pi$); ${x.lpT} cặp electron riêng${x.lpC >= 0 ? `, nguyên tử trung tâm ${x.c} còn ${x.lpC} cặp` : ""}. ${x.hb ? `Phân tử có H liên kết trực tiếp với nguyên tử độ âm điện lớn (${x.f.includes("F") ? "F" : x.f.includes("N") ? "N" : "O"}) còn cặp electron riêng nên giữa các phân tử có liên kết hydrogen.` : "Phân tử không có H liên kết với F, O, N nên giữa các phân tử không có liên kết hydrogen, chỉ có tương tác van der Waals."}`,
      };
    },
  },
  {
    id: "h10-tf-nhiet-do-soi", subject: S, grade: G, chapter: C3, topic: "Liên kết hydrogen, van der Waals và nhiệt độ sôi", half: 2, level: 3, kind: "tf",
    make: (r) => {
      const s = r.pick(SER.filter((x) => x.xs.some((y) => y.hb) || r.chance(0.3)));
      const xs = pickN(r, s.xs, 3).sort((a, b) => a.M - b.M), T = (x: BP) => m(x.f);
      const byBp = [...xs].sort((a, b) => a.bp - b.bp);
      const X = r.pick(xs), [P, Q] = pickN(r, xs, 2);
      const noHB = xs.filter((x) => !x.hb);
      let s3: [string, boolean];
      if (noHB.length >= 2) {
        const [u, v] = pickN(r, noHB, 2).sort((a, b) => b.M - a.M);
        s3 = st(r.chance(0.5), `Tương tác van der Waals giữa các phân tử ${T(u)} mạnh hơn giữa các phân tử ${T(v)}.`, `Tương tác van der Waals giữa các phân tử ${T(v)} mạnh hơn giữa các phân tử ${T(u)}.`);
      } else s3 = [`Chất có nhiệt độ sôi cao nhất trong ba chất là ${T(byBp[2])}.`, true];
      const ordOk = r.chance(0.5), wrongOrd = byBp.map((x) => x.M).join() === xs.map((x) => x.M).join() ? [...byBp].reverse() : xs;
      return {
        stem: `Cho ba chất: ${xs.map((x) => `${x.name} (${T(x)}, M = ${vn(x.M, 1)})`).join(", ")}.`,
        ...tf([
          [`Giữa các phân tử ${T(X)} có liên kết hydrogen.`, X.hb],
          [`${T(P)} có nhiệt độ sôi cao hơn ${T(Q)}.`, P.bp > Q.bp],
          s3,
          [`Thứ tự nhiệt độ sôi tăng dần là ${(ordOk ? byBp : wrongOrd).map(T).join(" < ")}.`, ordOk || wrongOrd.map((x) => x.f).join() === byBp.map((x) => x.f).join()],
        ]),
        explanation: `${s.note} Nhiệt độ sôi (ở 1 bar): ${byBp.map((x) => `${T(x)}: $${x.bp}$ °C`).join("; ")}.`,
      };
    },
  },
  /* ---------- Trả lời ngắn half 2 ---------- */
  {
    id: "h10-short-dem-sigma-pi", subject: S, grade: G, chapter: C3, topic: "Đếm liên kết σ, π", half: 2, level: 1, kind: "short",
    make: (r) => {
      const x = r.pick(SPM), [q, v] = r.pick([["số liên kết $\\sigma$", x.sig], ["số liên kết $\\pi$", x.pi], ["tổng số liên kết $\\sigma$ và $\\pi$", x.sig + x.pi]] as [string, number][]);
      need(v > 0);
      return { stem: `Phân tử ${x.name} có công thức cấu tạo $\\mathrm{${x.st}}$. Trong một phân tử ${x.name}, ${q} là bao nhiêu?`, ...short(v), explanation: spExpl(x) };
    },
  },
  {
    id: "h10-short-electron-ion-da-nguyen-tu", subject: S, grade: G, chapter: C3, topic: "Số electron, proton trong ion đa nguyên tử", half: 2, level: 3, kind: "short",
    make: (r) => {
      const IONS: [string, [string, number][], number][] = [
        ["SO_{4}^{2-}", [["S", 1], ["O", 4]], -2], ["NO_{3}^{-}", [["N", 1], ["O", 3]], -1], ["NH_{4}^{+}", [["N", 1], ["H", 4]], 1],
        ["CO_{3}^{2-}", [["C", 1], ["O", 3]], -2], ["PO_{4}^{3-}", [["P", 1], ["O", 4]], -3], ["OH^{-}", [["O", 1], ["H", 1]], -1],
        ["H_{3}O^{+}", [["H", 3], ["O", 1]], 1], ["SO_{3}^{2-}", [["S", 1], ["O", 3]], -2], ["NO_{2}^{-}", [["N", 1], ["O", 2]], -1],
        ["ClO_{4}^{-}", [["Cl", 1], ["O", 4]], -1], ["HCO_{3}^{-}", [["H", 1], ["C", 1], ["O", 3]], -1], ["ClO_{3}^{-}", [["Cl", 1], ["O", 3]], -1],
        ["HSO_{4}^{-}", [["H", 1], ["S", 1], ["O", 4]], -1], ["ClO^{-}", [["Cl", 1], ["O", 1]], -1], ["MnO_{4}^{-}", [["Mn", 1], ["O", 4]], -1],
      ];
      const [f, at, q] = r.pick(IONS), p = at.reduce((a, [s, k]) => a + k * bySym(s).z, 0), ne = p - q;
      const [ask, v] = r.pick([["tổng số electron", ne], ["tổng số proton", p], ["tổng số hạt mang điện (proton và electron)", p + ne]] as [string, number][]);
      return {
        stem: `Tính ${ask} trong ion ${m(f)}. Cho số hiệu nguyên tử: ${at.map(([s]) => `${s} = ${bySym(s).z}`).join(", ")}.`, ...short(v),
        explanation: `Tổng số proton $= ${at.map(([s, k]) => (k > 1 ? `${k}\\cdot ${bySym(s).z}` : `${bySym(s).z}`)).join(" + ")} = ${p}$. Ion mang điện tích $${Math.abs(q) > 1 ? Math.abs(q) : ""}${q > 0 ? "+" : "-"}$ nên số electron $= ${p} ${q > 0 ? "-" : "+"} ${Math.abs(q)} = ${ne}$. Vậy ${ask} là ${v}.`,
      };
    },
  },
  {
    id: "h10-short-mol-electron-nhuong", subject: S, grade: G, chapter: C3, topic: "Số mol electron nhường, nhận khi tạo hợp chất ion", half: 2, level: 3, kind: "short",
    make: (r) => {
      const a = E(r.pick([11, 19, 3, 12, 20, 13])), v = pos(a.z).g;
      const nonm = r.pick([["O_{2}", "oxygen", 2], ["Cl_{2}", "chlorine", 1]] as [string, string, number][]);
      const F = nonm[0] === "O_{2}" ? ionicFormula(a.s, v, "O", 2).f : ionicFormula(a.s, v, "Cl", 1).f;
      if (r.chance(0.6)) {
        const n = r.int(1, 10) * 0.05, mass = round(n * a.M, 2), ne = round(n * v, 2);
        return { stem: `Đốt cháy hoàn toàn ${vn(mass)} gam ${a.name} trong khí ${nonm[1]} dư, thu được hợp chất ion ${m(F)}. Tính số mol electron mà ${a.name} đã nhường (làm tròn đến hàng phần trăm). Cho nguyên tử khối: ${a.s} = ${a.M}.`,
          ...short(ne), explanation: `$n_{\\mathrm{${a.s}}} = \\dfrac{${tex(mass)}}{${a.M}} = ${tex(n)}$ mol. Mỗi nguyên tử ${a.s} nhường ${v} electron tạo $\\mathrm{${ionF(a.s, v)}}$ nên $n_e = ${v}\\cdot ${tex(n)} = ${tex(ne)}$ mol.` };
      }
      const n = r.int(1, 6) * 0.1, V = round(n * 24.79, 3), k = nonm[0] === "O_{2}" ? 4 : 2, ne = round(n * k, 2);
      return { stem: `Cho ${a.name} phản ứng vừa đủ với ${vn(V, 3)} lít khí ${nonm[1]} (${m(nonm[0])}, đo ở điều kiện chuẩn 25 °C, 1 bar) tạo thành hợp chất ion ${m(F)}. Tính số mol electron mà ${m(nonm[0])} đã nhận (làm tròn đến hàng phần trăm). Biết ở điều kiện chuẩn, 1 mol khí chiếm thể tích 24,79 lít.`,
        ...short(ne), explanation: `$n_{\\mathrm{${nonm[0]}}} = \\dfrac{${tex(V, 3)}}{24{,}79} = ${tex(n)}$ mol. Mỗi phân tử ${m(nonm[0])} nhận ${k} electron (${nonm[0] === "O_{2}" ? "mỗi nguyên tử O nhận 2 electron tạo $\\mathrm{O^{2-}}$" : "mỗi nguyên tử Cl nhận 1 electron tạo $\\mathrm{Cl^{-}}$"}) nên $n_e = ${k}\\cdot ${tex(n)} = ${tex(ne)}$ mol.` };
    },
  },
  {
    id: "h10-short-hieu-do-am-dien", subject: S, grade: G, chapter: C3, topic: "Tính hiệu độ âm điện", half: 2, level: 1, kind: "short",
    make: (r) => {
      const c = r.pick(CTYPE.filter((x) => x.a !== x.b));
      return { stem: `Cho độ âm điện: ${enList([c.a, c.b])}. Tính hiệu độ âm điện $\\Delta\\chi$ giữa hai nguyên tử ${c.a} và ${c.b} trong phân tử ${m(c.f)}.`, ...short(c.d),
        explanation: `${dExpl(c)}.` };
    },
  },
  {
    id: "h10-short-dem-chat-theo-lien-ket", subject: S, grade: G, chapter: C3, topic: "Đếm số chất theo loại liên kết", half: 2, level: 2, kind: "short",
    make: (r) => {
      const t = r.pick(["ion", "cp", "ck"] as BT[]), cs = pickN(r, CTYPE, 6), v = cs.filter((c) => c.t === t).length;
      need(v >= 1 && v <= 4);
      return { stem: `Cho độ âm điện: ${enList(cs.flatMap((c) => [c.a, c.b]))}. ${RULE} Trong các chất: ${cs.map((c) => m(c.f)).join(", ")}, có bao nhiêu chất mà liên kết giữa các nguyên tử là ${BTN[t]}?`,
        ...short(v), explanation: cs.map(dExpl).join("; ") + `. Có ${v} chất.` };
    },
  },
  {
    id: "h10-short-hop-chat-ion-khi-hiem", subject: S, grade: G, chapter: C3, topic: "Hợp chất ion có ion cấu hình khí hiếm", half: 2, level: 3, kind: "short",
    make: (r) => {
      const cat = r.pick([[11, 1], [12, 2], [13, 3], [19, 1], [20, 2]]), an = r.pick([[9, 1], [8, 2], [7, 3], [17, 1], [16, 2]]);
      const M = E(cat[0]), X = E(an[0]), F = ionicFormula("M", cat[1], "X", an[1]);
      if (cat[0] === 13) need(an[0] === 9 || an[0] === 8);
      const gM = cat[0] - cat[1], gX = an[0] + an[1];
      const p = F.na * cat[0] + F.nb * an[0], e = F.na * gM + F.nb * gX;
      const [ask, v] = r.pick([["tổng số proton", p], ["tổng số electron", e], ["tổng số hạt mang điện", p + e]] as [string, number][]);
      return {
        stem: `Hợp chất ion A được tạo bởi cation $\\mathrm{${ionF("M", cat[1])}}$ và anion $\\mathrm{${ionF("X", -an[1])}}$. Ion $\\mathrm{${ionF("M", cat[1])}}$ có cấu hình electron giống khí hiếm ${NOBLE[gM]} (Z = ${gM}), ion $\\mathrm{${ionF("X", -an[1])}}$ có cấu hình electron giống khí hiếm ${NOBLE[gX]} (Z = ${gX}). Tính ${ask} trong một đơn vị công thức của A.`,
        ...short(v),
        explanation: `$Z_M = ${gM} + ${cat[1]} = ${cat[0]}$ (${M.name}), $Z_X = ${gX} - ${an[1]} = ${an[0]}$ (${X.name}). Công thức A: ${m(ionicFormula(M.s, cat[1], X.s, an[1]).f)} (${F.na} cation, ${F.nb} anion). Số proton $= ${F.na}\\cdot ${cat[0]} + ${F.nb}\\cdot ${an[0]} = ${p}$; số electron $= ${F.na}\\cdot ${gM} + ${F.nb}\\cdot ${gX} = ${e}$. Vậy ${ask} là ${v}.`,
      };
    },
  },
];

export const TEMPLATES: Template[] = [...H1, ...H1B, ...H2, ...H2B];
void Retry;
