/* Hóa học 10 – học kì 2 (KNTT): dạng bài có tham số.
   half 1: Phản ứng oxi hóa – khử, Năng lượng hóa học, Tốc độ phản ứng; half 2: Nguyên tố nhóm VIIA (halogen). */
import { mcq, tf, short, tex, vn, need, round, type Template, type Rng, type GenOut, type Kind } from "./core.ts";

const S = "Hóa học", G = 10 as const;
const C4 = "Chương 4. Phản ứng oxi hóa – khử";
const C5 = "Chương 5. Năng lượng hóa học";
const C6 = "Chương 6. Tốc độ phản ứng hóa học";
const C7 = "Chương 7. Nguyên tố nhóm VIIA";
const TK: Record<string, string> = {
  [C4]: "Hóa học|Phản ứng oxi hóa – khử", [C5]: "Hóa học|Năng lượng hóa học",
  [C6]: "Hóa học|Tốc độ phản ứng", [C7]: "Hóa học|Halogen",
};
const T = (id: string, chapter: string, topic: string, half: 1 | 2, level: 1 | 2 | 3, kind: Kind, make: (r: Rng) => GenOut): Template =>
  ({ id: "h10k2-" + id, subject: S, grade: G, hk: 2, half, tk: TK[chapter], chapter, topic, level, kind, make });

/* ======================= Tiện ích ======================= */
const fx = (s: string) => s.replace(/([A-Za-z)])(\d+)/g, "$1_{$2}").replace(/NaN/g, "Na{N}");
/** công thức (có thể kèm điện tích sau dấu ^, vd "SO4^2-") → LaTeX trong \mathrm */
const mf = (s: string) => { const i = s.indexOf("^"); return i < 0 ? fx(s) : `${fx(s.slice(0, i))}^{${s.slice(i + 1)}}`; };
const m = (s: string) => `$\\mathrm{${mf(s)}}$`;
const noSt = (f: string) => f.replace(/\((s|l|g|aq)\)$/, "");
const st = (ok: boolean, t: string, f: string): [string, boolean] => (ok ? [t, true] : [f, false]);
const pickN = <X,>(r: Rng, a: readonly X[], k: number): X[] => r.shuffle([...a]).slice(0, k);
const sg = (v: number) => (v > 0 ? `+${v}` : `${v}`);
const onT = (v: number) => `$${sg(v)}$`;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const DH = "\\Delta_{r}H^{\\circ}_{298}", DF = "\\Delta_{f}H^{\\circ}_{298}";
const VM = 24.79;
const VMT = "Ở điều kiện chuẩn (25 °C, 1 bar), 1 mol khí chiếm 24,79 lít.";
const perms = <X,>(a: X[]): X[][] => a.length <= 1 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p]));
/** kiểm tra số có tối đa dp chữ số thập phân */
const exact = (x: number, dp: number) => Math.abs(x * 10 ** dp - Math.round(x * 10 ** dp)) < 1e-6;

/* ---------- Nguyên tử khối (SGK) và phân tích công thức ---------- */
const AM: Record<string, number> = {
  H: 1, C: 12, N: 14, O: 16, F: 19, Na: 23, Mg: 24, Al: 27, S: 32, Cl: 35.5, K: 39, Ca: 40, Mn: 55, Cr: 52,
  Fe: 56, Cu: 64, Zn: 65, Br: 80, Ag: 108, I: 127, Ba: 137,
};
function atoms(f0: string): Record<string, number> {
  const f = noSt(f0.replace(/\^.*$/, "")); let i = 0;
  const num = () => { const x = /^\d+/.exec(f.slice(i)); if (!x) return 1; i += x[0].length; return +x[0]; };
  const grp = (): Record<string, number> => {
    const o: Record<string, number> = {};
    while (i < f.length && f[i] !== ")") {
      if (f[i] === "(") { i++; const g = grp(); i++; const n = num(); for (const k in g) o[k] = (o[k] || 0) + g[k] * n; }
      else { const x = /^[A-Z][a-z]?/.exec(f.slice(i)); if (!x) throw new Error("công thức lạ: " + f0); i += x[0].length; const n = num(); o[x[0]] = (o[x[0]] || 0) + n; }
    }
    return o;
  };
  return grp();
}
const Mw = (f: string) => { let s = 0; for (const [k, n] of Object.entries(atoms(f))) { const a = AM[k]; if (a === undefined) throw new Error("thiếu NTK " + k); s += a * n; } return round(s, 2); };
const chargeOf = (sp: string) => { const i = sp.indexOf("^"); if (i < 0) return 0; const t = sp.slice(i + 1); const n = parseInt(t) || 1; return t.endsWith("-") ? -n : n; };

/* ---------- Phương trình hóa học dạng chữ: "2KMnO4 + 16HCl -> ..." ("=>" là có đun nóng) ---------- */
type Sp = { c: number; f: string };
function sides(e: string): { re: Sp[]; pr: Sp[] } {
  const [L, R] = e.split(/\s*(?:->|=>)\s*/);
  const one = (s: string): Sp[] => s.split(" + ").map((t) => { const x = /^(\d*)(.+)$/.exec(t.trim())!; return { c: x[1] ? +x[1] : 1, f: x[2] }; });
  return { re: one(L), pr: one(R) };
}
function eqT(e: string, bal = true): string {
  const { re, pr } = sides(e);
  const s = (xs: Sp[]) => xs.map((x) => (bal && x.c > 1 ? x.c : "") + mf(x.f)).join(" + ");
  return `$\\mathrm{${s(re)} ${e.includes("=>") ? "\\xrightarrow{t^{\\circ}}" : "\\rightarrow"} ${s(pr)}}$`;
}
const coefSum = (e: string) => { const { re, pr } = sides(e); return [...re, ...pr].reduce((a, x) => a + x.c, 0); };

/* ======================= CHƯƠNG 4: dữ kiện ======================= */
/* Số oxi hóa: [chất (ion ghi ^điện tích), nguyên tố cần xét] */
const KN: Record<string, number> = { H: 1, O: -2, Na: 1, K: 1, Ca: 2, Mg: 2, Ba: 2, F: -1, Cl: -1, Al: 3 };
const ONS: [string, string][] = [
  ["NH3", "N"], ["NH4^+", "N"], ["N2O", "N"], ["NO", "N"], ["N2O3", "N"], ["HNO2", "N"], ["NO2", "N"], ["HNO3", "N"], ["NO3^-", "N"], ["NaNO2", "N"], ["N2O5", "N"], ["KNO3", "N"],
  ["H2S", "S"], ["Na2S", "S"], ["SO2", "S"], ["Na2SO3", "S"], ["SO3^2-", "S"], ["H2SO4", "S"], ["SO4^2-", "S"], ["SO3", "S"], ["K2SO4", "S"],
  ["HCl", "Cl"], ["HClO", "Cl"], ["NaClO", "Cl"], ["KClO3", "Cl"], ["HClO4", "Cl"], ["ClO4^-", "Cl"], ["Cl2O7", "Cl"], ["HClO2", "Cl"], ["ClO3^-", "Cl"], ["Cl2O", "Cl"],
  ["KMnO4", "Mn"], ["MnO4^-", "Mn"], ["K2MnO4", "Mn"], ["MnO2", "Mn"], ["MnCl2", "Mn"], ["MnO", "Mn"],
  ["K2Cr2O7", "Cr"], ["Cr2O7^2-", "Cr"], ["K2CrO4", "Cr"], ["Cr2O3", "Cr"], ["CrCl3", "Cr"], ["CrO3", "Cr"],
  ["CH4", "C"], ["CO", "C"], ["CO2", "C"], ["CaCO3", "C"], ["CO3^2-", "C"], ["CH3OH", "C"], ["HCHO", "C"], ["Al4C3", "C"], ["C2H6", "C"], ["C2H4", "C"], ["C2H2", "C"],
  ["PH3", "P"], ["P2O5", "P"], ["H3PO4", "P"], ["PO4^3-", "P"], ["H3PO3", "P"], ["Ca3(PO4)2", "P"],
  ["FeO", "Fe"], ["Fe2O3", "Fe"], ["Fe(OH)2", "Fe"], ["Fe(OH)3", "Fe"], ["FeCl3", "Fe"], ["FeCl2", "Fe"],
  ["H2O2", "O"], ["OF2", "O"], ["Na2O2", "O"], ["BaO2", "O"], ["NaH", "H"], ["CaH2", "H"],
];
function onOf(sp: string, el: string): { v: number; ex: string } {
  const a = atoms(sp), q = chargeOf(sp); let sum = 0; const parts: string[] = [];
  for (const [k, n] of Object.entries(a)) {
    if (k === el) { parts.push(n > 1 ? `${n}x` : "x"); continue; }
    const v = KN[k]; if (v === undefined) throw new Error("thiếu số oxi hóa " + k);
    sum += n * v; parts.push(`${n > 1 ? `${n}\\cdot` : ""}(${sg(v)})`);
  }
  const x = (q - sum) / a[el]; need(Number.isInteger(x));
  const ion = q !== 0;
  return { v: x, ex: `Tổng số oxi hóa của các nguyên tử trong ${ion ? "ion bằng điện tích của ion" : "phân tử bằng 0"}. Gọi số oxi hóa của ${el} trong ${m(sp)} là x: $${parts.join(" + ")} = ${q}$ $\\Rightarrow x = ${sg(x)}$.` };
}

/* Phản ứng oxi hóa – khử: o = chất oxi hóa, r = chất khử; [công thức, nguyên tố, số oxi hóa đầu, cuối, số phân tử đóng vai trò, số e mỗi phân tử]
   med: acid vừa là chất oxi hóa/khử vừa là môi trường ("o"/"r", số phân tử làm môi trường) */
type Role = { f: string; el: string; a: string; b: string; n: number; e: number };
type RX = { e: string; o: Role; r: Role; med?: ["o" | "r", number]; c?: string };
const Ro = (f: string, el: string, a: string, b: string, n: number, e: number): Role => ({ f, el, a, b, n, e });
const HCLD = `dung dịch ${m("HCl")} đặc`, HNO3D = `dung dịch ${m("HNO3")} đặc`, HNO3L = `dung dịch ${m("HNO3")} loãng`, H2SO4D = `${m("H2SO4")} đặc, nóng`;
const RXS: RX[] = [
  { e: "Fe2O3 + 3CO => 2Fe + 3CO2", o: Ro("Fe2O3", "Fe", "+3", "0", 1, 6), r: Ro("CO", "C", "+2", "+4", 3, 2) },
  { e: "Fe2O3 + 3H2 => 2Fe + 3H2O", o: Ro("Fe2O3", "Fe", "+3", "0", 1, 6), r: Ro("H2", "H", "0", "+1", 3, 2) },
  { e: "4NH3 + 5O2 => 4NO + 6H2O", o: Ro("O2", "O", "0", "-2", 5, 4), r: Ro("NH3", "N", "-3", "+2", 4, 5) },
  { e: "MnO2 + 4HCl => MnCl2 + Cl2 + 2H2O", o: Ro("MnO2", "Mn", "+4", "+2", 1, 2), r: Ro("HCl", "Cl", "-1", "0", 2, 1), med: ["r", 2], c: HCLD },
  { e: "2KMnO4 + 16HCl -> 2KCl + 2MnCl2 + 5Cl2 + 8H2O", o: Ro("KMnO4", "Mn", "+7", "+2", 2, 5), r: Ro("HCl", "Cl", "-1", "0", 10, 1), med: ["r", 6], c: HCLD },
  { e: "K2Cr2O7 + 14HCl -> 2KCl + 2CrCl3 + 3Cl2 + 7H2O", o: Ro("K2Cr2O7", "Cr", "+6", "+3", 1, 6), r: Ro("HCl", "Cl", "-1", "0", 6, 1), med: ["r", 8], c: HCLD },
  { e: "Cu + 4HNO3 -> Cu(NO3)2 + 2NO2 + 2H2O", o: Ro("HNO3", "N", "+5", "+4", 2, 1), r: Ro("Cu", "Cu", "0", "+2", 1, 2), med: ["o", 2], c: HNO3D },
  { e: "3Cu + 8HNO3 -> 3Cu(NO3)2 + 2NO + 4H2O", o: Ro("HNO3", "N", "+5", "+2", 2, 3), r: Ro("Cu", "Cu", "0", "+2", 3, 2), med: ["o", 6], c: HNO3L },
  { e: "Fe + 4HNO3 -> Fe(NO3)3 + NO + 2H2O", o: Ro("HNO3", "N", "+5", "+2", 1, 3), r: Ro("Fe", "Fe", "0", "+3", 1, 3), med: ["o", 3], c: HNO3L },
  { e: "3Mg + 8HNO3 -> 3Mg(NO3)2 + 2NO + 4H2O", o: Ro("HNO3", "N", "+5", "+2", 2, 3), r: Ro("Mg", "Mg", "0", "+2", 3, 2), med: ["o", 6], c: HNO3L },
  { e: "4Mg + 10HNO3 -> 4Mg(NO3)2 + NH4NO3 + 3H2O", o: Ro("HNO3", "N", "+5", "-3", 1, 8), r: Ro("Mg", "Mg", "0", "+2", 4, 2), med: ["o", 9], c: HNO3L },
  { e: "4Zn + 10HNO3 -> 4Zn(NO3)2 + NH4NO3 + 3H2O", o: Ro("HNO3", "N", "+5", "-3", 1, 8), r: Ro("Zn", "Zn", "0", "+2", 4, 2), med: ["o", 9], c: HNO3L },
  { e: "8Al + 30HNO3 -> 8Al(NO3)3 + 3N2O + 15H2O", o: Ro("HNO3", "N", "+5", "+1", 6, 4), r: Ro("Al", "Al", "0", "+3", 8, 3), med: ["o", 24], c: HNO3L },
  { e: "Cu + 2H2SO4 -> CuSO4 + SO2 + 2H2O", o: Ro("H2SO4", "S", "+6", "+4", 1, 2), r: Ro("Cu", "Cu", "0", "+2", 1, 2), med: ["o", 1], c: H2SO4D },
  { e: "2Fe + 6H2SO4 -> Fe2(SO4)3 + 3SO2 + 6H2O", o: Ro("H2SO4", "S", "+6", "+4", 3, 2), r: Ro("Fe", "Fe", "0", "+3", 2, 3), med: ["o", 3], c: H2SO4D },
  { e: "2Al + 6H2SO4 -> Al2(SO4)3 + 3SO2 + 6H2O", o: Ro("H2SO4", "S", "+6", "+4", 3, 2), r: Ro("Al", "Al", "0", "+3", 2, 3), med: ["o", 3], c: H2SO4D },
  { e: "Zn + 2H2SO4 -> ZnSO4 + SO2 + 2H2O", o: Ro("H2SO4", "S", "+6", "+4", 1, 2), r: Ro("Zn", "Zn", "0", "+2", 1, 2), med: ["o", 1], c: H2SO4D },
  { e: "C + 2H2SO4 => CO2 + 2SO2 + 2H2O", o: Ro("H2SO4", "S", "+6", "+4", 2, 2), r: Ro("C", "C", "0", "+4", 1, 4), c: `${m("H2SO4")} đặc` },
  { e: "2H2S + SO2 -> 3S + 2H2O", o: Ro("SO2", "S", "+4", "0", 1, 4), r: Ro("H2S", "S", "-2", "0", 2, 2) },
  { e: "10FeSO4 + 2KMnO4 + 8H2SO4 -> 5Fe2(SO4)3 + K2SO4 + 2MnSO4 + 8H2O", o: Ro("KMnO4", "Mn", "+7", "+2", 2, 5), r: Ro("FeSO4", "Fe", "+2", "+3", 10, 1) },
  { e: "5SO2 + 2KMnO4 + 2H2O -> K2SO4 + 2MnSO4 + 2H2SO4", o: Ro("KMnO4", "Mn", "+7", "+2", 2, 5), r: Ro("SO2", "S", "+4", "+6", 5, 2) },
  { e: "Cl2 + 2NaBr -> 2NaCl + Br2", o: Ro("Cl2", "Cl", "0", "-1", 1, 2), r: Ro("NaBr", "Br", "-1", "0", 2, 1) },
  { e: "Cl2 + 2KI -> 2KCl + I2", o: Ro("Cl2", "Cl", "0", "-1", 1, 2), r: Ro("KI", "I", "-1", "0", 2, 1) },
  { e: "Br2 + 2NaI -> 2NaBr + I2", o: Ro("Br2", "Br", "0", "-1", 1, 2), r: Ro("NaI", "I", "-1", "0", 2, 1) },
  { e: "2FeCl2 + Cl2 -> 2FeCl3", o: Ro("Cl2", "Cl", "0", "-1", 1, 2), r: Ro("FeCl2", "Fe", "+2", "+3", 2, 1) },
  { e: "2FeCl3 + Cu -> 2FeCl2 + CuCl2", o: Ro("FeCl3", "Fe", "+3", "+2", 2, 1), r: Ro("Cu", "Cu", "0", "+2", 1, 2) },
  { e: "Fe + CuSO4 -> FeSO4 + Cu", o: Ro("CuSO4", "Cu", "+2", "0", 1, 2), r: Ro("Fe", "Fe", "0", "+2", 1, 2) },
  { e: "2Al + 3CuO => Al2O3 + 3Cu", o: Ro("CuO", "Cu", "+2", "0", 3, 2), r: Ro("Al", "Al", "0", "+3", 2, 3) },
  { e: "2Mg + CO2 => 2MgO + C", o: Ro("CO2", "C", "+4", "0", 1, 4), r: Ro("Mg", "Mg", "0", "+2", 2, 2) },
  { e: "4FeS2 + 11O2 => 2Fe2O3 + 8SO2", o: Ro("O2", "O", "0", "-2", 11, 4), r: Ro("FeS2", "Fe và S", "+2 \\text{ và } -1", "+3 \\text{ và } +4", 4, 11) },
  { e: "8Al + 3Fe3O4 => 4Al2O3 + 9Fe", o: Ro("Fe3O4", "Fe", "+\\frac{8}{3}", "0", 3, 8), r: Ro("Al", "Al", "0", "+3", 8, 3) },
  { e: "Zn + 2HCl -> ZnCl2 + H2", o: Ro("HCl", "H", "+1", "0", 2, 1), r: Ro("Zn", "Zn", "0", "+2", 1, 2) },
  { e: "2Al + 6HCl -> 2AlCl3 + 3H2", o: Ro("HCl", "H", "+1", "0", 6, 1), r: Ro("Al", "Al", "0", "+3", 2, 3) },
  { e: "2Na + Cl2 -> 2NaCl", o: Ro("Cl2", "Cl", "0", "-1", 1, 2), r: Ro("Na", "Na", "0", "+1", 2, 1) },
];
const unit = (f: string) => (Object.keys(atoms(f)).length === 1 && Object.values(atoms(f))[0] === 1 ? "nguyên tử" : "phân tử");
const rxStem = (x: RX, bal: boolean) => `Cho phản ứng${x.c ? ` (với ${x.c})` : ""}: ${eqT(x.e, bal)}`;
const rxNote = (x: RX) => `Chất khử là ${m(x.r.f)} (${x.r.el}: $${x.r.a} \\rightarrow ${x.r.b}$, nhường electron); chất oxi hóa là ${m(x.o.f)} (${x.o.el}: $${x.o.a} \\rightarrow ${x.o.b}$, nhận electron).`;
const rxBal = (x: RX) => `${rxNote(x)} Thăng bằng electron: ${x.r.n} ${unit(x.r.f)} ${m(x.r.f)} nhường $${x.r.n}\\cdot ${x.r.e} = ${x.r.n * x.r.e}$ electron, ${x.o.n} ${unit(x.o.f)} ${m(x.o.f)} nhận $${x.o.n}\\cdot ${x.o.e} = ${x.o.n * x.o.e}$ electron. Phương trình: ${eqT(x.e)}.`;
const NONRX: string[] = [
  "CaCO3 => CaO + CO2", "NaOH + HCl -> NaCl + H2O", "BaCl2 + H2SO4 -> BaSO4 + 2HCl", "CuO + 2HCl -> CuCl2 + H2O",
  "AgNO3 + NaCl -> AgCl + NaNO3", "2Fe(OH)3 => Fe2O3 + 3H2O", "CaO + H2O -> Ca(OH)2", "SO3 + H2O -> H2SO4",
  "Na2CO3 + 2HCl -> 2NaCl + CO2 + H2O", "NH3 + HCl -> NH4Cl", "Cu(OH)2 => CuO + H2O", "Fe2O3 + 6HCl -> 2FeCl3 + 3H2O",
  "2NaHCO3 => Na2CO3 + CO2 + H2O", "Al(OH)3 + 3HCl -> AlCl3 + 3H2O",
];

/* ======================= CHƯƠNG 5: dữ kiện ======================= */
const FH: Record<string, number> = {
  "CO2(g)": -393.5, "H2O(l)": -285.8, "H2O(g)": -241.8, "CH4(g)": -74.6, "C2H6(g)": -84.0, "C2H4(g)": 52.4, "C2H2(g)": 227.4,
  "C3H8(g)": -103.8, "C2H5OH(l)": -277.6, "CH3OH(l)": -238.7, "CO(g)": -110.5, "CaCO3(s)": -1206.9, "CaO(s)": -635.1,
  "Fe2O3(s)": -824.2, "Al2O3(s)": -1675.7, "NH3(g)": -45.9, "NO(g)": 90.3, "NO2(g)": 33.2, "SO2(g)": -296.8, "SO3(g)": -395.7,
  "H2S(g)": -20.6, "MgO(s)": -601.6, "MgCO3(s)": -1095.8, "ZnO(s)": -350.5, "ZnS(s)": -206.0,
};
const FR: string[] = [
  "CH4(g) + 2O2(g) -> CO2(g) + 2H2O(l)", "C2H4(g) + 3O2(g) -> 2CO2(g) + 2H2O(l)", "2C2H2(g) + 5O2(g) -> 4CO2(g) + 2H2O(l)",
  "C3H8(g) + 5O2(g) -> 3CO2(g) + 4H2O(l)", "C2H5OH(l) + 3O2(g) -> 2CO2(g) + 3H2O(l)", "2CH3OH(l) + 3O2(g) -> 2CO2(g) + 4H2O(l)",
  "2C2H6(g) + 7O2(g) -> 4CO2(g) + 6H2O(l)", "CaCO3(s) -> CaO(s) + CO2(g)", "MgCO3(s) -> MgO(s) + CO2(g)",
  "Fe2O3(s) + 3CO(g) -> 2Fe(s) + 3CO2(g)", "2Al(s) + Fe2O3(s) -> Al2O3(s) + 2Fe(s)", "4NH3(g) + 5O2(g) -> 4NO(g) + 6H2O(g)",
  "2SO2(g) + O2(g) -> 2SO3(g)", "2NO(g) + O2(g) -> 2NO2(g)", "2CO(g) + O2(g) -> 2CO2(g)", "2H2S(g) + 3O2(g) -> 2SO2(g) + 2H2O(l)",
  "CO(g) + H2O(g) -> CO2(g) + H2(g)", "C2H4(g) + H2(g) -> C2H6(g)", "2ZnS(s) + 3O2(g) -> 2ZnO(s) + 2SO2(g)", "CH4(g) + H2O(g) -> CO(g) + 3H2(g)",
];
const fOf = (f: string) => { if (FH[f] !== undefined) return FH[f]; if (Object.keys(atoms(f)).length === 1) return 0; throw new Error("thiếu ΔfH " + f); };
function dHf(e: string) {
  const { re, pr } = sides(e);
  const sp = pr.reduce((a, x) => a + x.c * fOf(x.f), 0), sr = re.reduce((a, x) => a + x.c * fOf(x.f), 0);
  const raw = pr.reduce((a, x) => a + fOf(x.f), 0) - re.reduce((a, x) => a + fOf(x.f), 0);
  const cmp = [...new Set([...re, ...pr].map((x) => x.f).filter((f) => fOf(f) !== 0))];
  const term = (xs: Sp[]) => xs.filter((x) => fOf(x.f) !== 0).map((x) => `${x.c > 1 ? `${x.c}\\cdot` : ""}(${tex(fOf(x.f), 1)})`).join(" + ") || "0";
  return { v: round(sp - sr, 1), raw: round(raw, 1), cmp, calc: `$${DH} = [${term(pr)}] - [${term(re)}] = ${tex(round(sp - sr, 1), 1)}$ kJ` };
}
const fhList = (fs: string[]) => fs.map((f) => `${m(f)}: $${tex(FH[f], 1)}$`).join("; ");

/* Năng lượng liên kết (kJ/mol), các chất đều ở thể khí */
const BE: Record<string, number> = {
  "H–H": 436, "Cl–Cl": 243, "Br–Br": 193, "I–I": 151, "F–F": 159, "H–F": 565, "H–Cl": 432, "H–Br": 366, "H–I": 299,
  "O=O": 498, "O–H": 467, "N≡N": 945, "N–H": 391, "C–H": 413, "C–C": 347, "C=C": 614, "C≡C": 839, "C=O": 799, "C–Cl": 339,
};
type BR = { eq: string; re: Record<string, number>; pr: Record<string, number>; note?: string };
const BRS: BR[] = [
  { eq: "H_{2}(g) + Cl_{2}(g) \\rightarrow 2HCl(g)", re: { "H–H": 1, "Cl–Cl": 1 }, pr: { "H–Cl": 2 } },
  { eq: "H_{2}(g) + Br_{2}(g) \\rightarrow 2HBr(g)", re: { "H–H": 1, "Br–Br": 1 }, pr: { "H–Br": 2 } },
  { eq: "H_{2}(g) + I_{2}(g) \\rightarrow 2HI(g)", re: { "H–H": 1, "I–I": 1 }, pr: { "H–I": 2 } },
  { eq: "H_{2}(g) + F_{2}(g) \\rightarrow 2HF(g)", re: { "H–H": 1, "F–F": 1 }, pr: { "H–F": 2 } },
  { eq: "N_{2}(g) + 3H_{2}(g) \\rightarrow 2NH_{3}(g)", re: { "N≡N": 1, "H–H": 3 }, pr: { "N–H": 6 } },
  { eq: "2H_{2}(g) + O_{2}(g) \\rightarrow 2H_{2}O(g)", re: { "H–H": 2, "O=O": 1 }, pr: { "O–H": 4 } },
  { eq: "CH_{4}(g) + 2O_{2}(g) \\rightarrow CO_{2}(g) + 2H_{2}O(g)", re: { "C–H": 4, "O=O": 2 }, pr: { "C=O": 2, "O–H": 4 }, note: "phân tử carbon dioxide có cấu tạo O=C=O" },
  { eq: "CH_{2}=CH_{2}(g) + H_{2}(g) \\rightarrow CH_{3}-CH_{3}(g)", re: { "C=C": 1, "C–H": 4, "H–H": 1 }, pr: { "C–C": 1, "C–H": 6 } },
  { eq: "HC\\equiv CH(g) + 2H_{2}(g) \\rightarrow CH_{3}-CH_{3}(g)", re: { "C≡C": 1, "C–H": 2, "H–H": 2 }, pr: { "C–C": 1, "C–H": 6 } },
  { eq: "HC\\equiv CH(g) + H_{2}(g) \\rightarrow CH_{2}=CH_{2}(g)", re: { "C≡C": 1, "C–H": 2, "H–H": 1 }, pr: { "C=C": 1, "C–H": 4 } },
  { eq: "CH_{4}(g) + Cl_{2}(g) \\rightarrow CH_{3}Cl(g) + HCl(g)", re: { "C–H": 4, "Cl–Cl": 1 }, pr: { "C–H": 3, "C–Cl": 1, "H–Cl": 1 } },
  { eq: "CH_{2}=CH_{2}(g) + Cl_{2}(g) \\rightarrow CH_{2}Cl-CH_{2}Cl(g)", re: { "C=C": 1, "C–H": 4, "Cl–Cl": 1 }, pr: { "C–C": 1, "C–H": 4, "C–Cl": 2 } },
  { eq: "Cl_{2}(g) + 2HBr(g) \\rightarrow 2HCl(g) + Br_{2}(g)", re: { "Cl–Cl": 1, "H–Br": 2 }, pr: { "H–Cl": 2, "Br–Br": 1 } },
  { eq: "2HI(g) \\rightarrow H_{2}(g) + I_{2}(g)", re: { "H–I": 2 }, pr: { "H–H": 1, "I–I": 1 } },
  { eq: "2NH_{3}(g) \\rightarrow N_{2}(g) + 3H_{2}(g)", re: { "N–H": 6 }, pr: { "N≡N": 1, "H–H": 3 } },
  { eq: "2HCl(g) \\rightarrow H_{2}(g) + Cl_{2}(g)", re: { "H–Cl": 2 }, pr: { "H–H": 1, "Cl–Cl": 1 } },
];
const sumB = (o: Record<string, number>) => Object.entries(o).reduce((a, [k, n]) => a + n * BE[k], 0);
const dHb = (b: BR) => sumB(b.re) - sumB(b.pr);
const bonds = (b: BR) => [...new Set([...Object.keys(b.re), ...Object.keys(b.pr)])];
const bTerm = (o: Record<string, number>, hid = "") => Object.entries(o).map(([k, n]) => `${n > 1 ? `${n}\\cdot ` : ""}${k === hid ? "x" : BE[k]}`).join(" + ");
const bCalc = (b: BR) => `$${DH} = \\sum E_{b}(\\text{cđ}) - \\sum E_{b}(\\text{sp}) = (${bTerm(b.re)}) - (${bTerm(b.pr)}) = ${dHb(b)}$ kJ`;
const bList = (ks: string[]) => ks.map((k) => `${k}: ${BE[k]}`).join("; ");

/* Phương trình nhiệt hóa học (giá trị ΔrH cho sẵn) */
type TH = { e: string; h: number; k: string };
const THS: TH[] = [
  { e: "CaCO3(s) -> CaO(s) + CO2(g)", h: 178.3, k: "CaCO3" }, { e: "N2(g) + O2(g) -> 2NO(g)", h: 180.6, k: "N2" },
  { e: "C(s) + H2O(g) -> CO(g) + H2(g)", h: 131.3, k: "C" }, { e: "N2O4(g) -> 2NO2(g)", h: 57.2, k: "N2O4" },
  { e: "2H2O(l) -> 2H2(g) + O2(g)", h: 571.6, k: "H2O" }, { e: "2NH3(g) -> N2(g) + 3H2(g)", h: 91.8, k: "NH3" },
  { e: "MgCO3(s) -> MgO(s) + CO2(g)", h: 100.6, k: "MgCO3" },
  { e: "CH4(g) + 2O2(g) -> CO2(g) + 2H2O(l)", h: -890.3, k: "CH4" }, { e: "2H2(g) + O2(g) -> 2H2O(l)", h: -571.6, k: "H2" },
  { e: "C(s) + O2(g) -> CO2(g)", h: -393.5, k: "C" }, { e: "N2(g) + 3H2(g) -> 2NH3(g)", h: -91.8, k: "N2" },
  { e: "H2(g) + Cl2(g) -> 2HCl(g)", h: -184.6, k: "H2" }, { e: "2SO2(g) + O2(g) -> 2SO3(g)", h: -197.8, k: "SO2" },
  { e: "2Na(s) + Cl2(g) -> 2NaCl(s)", h: -822.4, k: "Na" }, { e: "CaO(s) + H2O(l) -> Ca(OH)2(s)", h: -65.2, k: "CaO" },
  { e: "2CO(g) + O2(g) -> 2CO2(g)", h: -566.0, k: "CO" },
];
const thT = (x: TH) => `${eqT(x.e).slice(0, -1)}\\quad ${DH} = ${tex(x.h, 1)}\\ \\text{kJ}$`;
const thCoef = (x: TH) => sides(x.e).re.find((s) => noSt(s.f) === x.k)!.c;

/* ======================= CHƯƠNG 6: dữ kiện ======================= */
const RR: string[] = [
  "2N2O5(g) -> 4NO2(g) + O2(g)", "2H2O2(aq) -> 2H2O(l) + O2(g)", "Br2(aq) + HCOOH(aq) -> 2HBr(aq) + CO2(g)", "2NO2(g) -> 2NO(g) + O2(g)",
  "H2(g) + I2(g) -> 2HI(g)", "N2(g) + 3H2(g) -> 2NH3(g)", "2SO2(g) + O2(g) -> 2SO3(g)", "2HI(g) -> H2(g) + I2(g)",
  "CO(g) + Cl2(g) -> COCl2(g)", "2NO(g) + O2(g) -> 2NO2(g)",
];
function sciT(x: number): string {
  need(x > 0);
  let e = Math.floor(Math.log10(x) + 1e-9); let mt = round(x / 10 ** e, 3);
  if (mt >= 10) { mt = round(mt / 10, 3); e++; }
  if (e >= -2) return tex(round(x, 4), 4);
  return `${tex(mt, 3)}\\cdot 10^{${e}}`;
}
type RS = { e: string; f: string; c: number; R: boolean; dt: number; dC: number; C1: number; C2: number; v: number };
function rateSetup(r: Rng): RS {
  const e = r.pick(RR), { re, pr } = sides(e);
  const cand = [...re.map((x) => ({ ...x, R: true })), ...pr.map((x) => ({ ...x, R: false }))].filter((x) => !/\((l|s)\)$/.test(x.f));
  const sp = r.pick(cand), dt = r.pick([10, 20, 25, 40, 50, 100, 200]), dC = r.int(1, 24) * 0.01 * (sp.c > 1 ? 1 : 0.5);
  const C1 = sp.R ? round(dC + r.int(1, 30) * 0.01, 3) : r.chance(0.6) ? 0 : r.int(1, 10) * 0.01;
  const C2 = sp.R ? round(C1 - dC, 3) : round(C1 + dC, 3);
  const v = dC / (sp.c * dt); need(exact(v, 8));
  return { e, f: noSt(sp.f), c: sp.c, R: sp.R, dt, dC: round(dC, 3), C1, C2, v };
}
const rsText = (s: RS) => `Sau ${s.dt} giây, nồng độ của ${m(s.f)} ${s.R ? `giảm từ ${vn(s.C1, 3)} M xuống ${vn(s.C2, 3)} M` : `tăng từ ${vn(s.C1, 3)} M lên ${vn(s.C2, 3)} M`}`;
const rsCalc = (s: RS) => `$\\bar{v} = ${s.R ? "-" : ""}\\dfrac{1}{${s.c}}\\cdot\\dfrac{\\Delta C_{\\mathrm{${mf(s.f)}}}}{\\Delta t} = \\dfrac{1}{${s.c}}\\cdot\\dfrac{${tex(s.dC, 3)}}{${s.dt}} = ${sciT(s.v)}$ mol/(L·s)`;

/* ======================= CHƯƠNG 7: dữ kiện halogen ======================= */
type Hal = { s: string; z: number; name: string; per: number; st: string; col: string; M: number; ag: string };
const HAL: Hal[] = [
  { s: "F", z: 9, name: "fluorine", per: 2, st: "khí", col: "lục nhạt", M: 19, ag: "không tạo kết tủa" },
  { s: "Cl", z: 17, name: "chlorine", per: 3, st: "khí", col: "vàng lục", M: 35.5, ag: "kết tủa màu trắng" },
  { s: "Br", z: 35, name: "bromine", per: 4, st: "lỏng", col: "nâu đỏ", M: 80, ag: "kết tủa màu vàng nhạt" },
  { s: "I", z: 53, name: "iodine", per: 5, st: "rắn", col: "tím đen", M: 127, ag: "kết tủa màu vàng" },
];
const hal = (s: string) => HAL.find((h) => h.s === s)!;
/* Kim loại: kí hiệu, M, hóa trị, tên */
const MET: Record<string, [number, number, string]> = {
  Mg: [24, 2, "magnesium"], Ca: [40, 2, "calcium"], Fe: [56, 2, "iron"], Zn: [65, 2, "zinc"], Ba: [137, 2, "barium"],
  Al: [27, 3, "aluminium"], Na: [23, 1, "sodium"], K: [39, 1, "potassium"], Cu: [64, 2, "copper"],
};
const saltCl = (s: string, v: number) => (v === 1 ? `${s}Cl` : `${s}Cl${v}`);
/* Chất với dung dịch HCl loãng: [công thức, có phản ứng, tạo khí] */
const HCLSUB: [string, boolean, boolean][] = [
  ["Fe", true, true], ["Zn", true, true], ["Mg", true, true], ["Al", true, true], ["Cu", false, false], ["Ag", false, false],
  ["CaCO3", true, true], ["Na2CO3", true, true], ["NaHCO3", true, true], ["CuO", true, false], ["Fe2O3", true, false], ["MgO", true, false],
  ["NaOH", true, false], ["Fe(OH)3", true, false], ["AgNO3", true, false], ["BaSO4", false, false], ["NaCl", false, false], ["KNO3", false, false],
];

/* ======================= HALF 1 – CHƯƠNG 4 ======================= */
const H4: Template[] = [
  T("so-oxi-hoa", C4, "Xác định số oxi hóa", 1, 1, "mcq", (r) => {
    const [sp, el] = r.pick(ONS), { v, ex } = onOf(sp, el);
    const same = [...new Set(ONS.filter((x) => x[1] === el).map((x) => onOf(x[0], el).v))];
    const pool = r.shuffle([-v, v + 1, v - 1, v + 2, v - 2, ...same, 0].filter((x) => x !== v && Math.abs(x) <= 8));
    const ion = sp.includes("^");
    return {
      stem: r.pick([`Số oxi hóa của ${el} trong ${m(sp)} là`, `Trong ${ion ? "ion" : "hợp chất"} ${m(sp)}, nguyên tố ${el} có số oxi hóa là`]),
      ...mcq(r, onT(v), pool.map(onT)), explanation: ex,
    };
  }),
  T("so-oxi-hoa-day", C4, "So sánh số oxi hóa trong các chất", 1, 2, "mcq", (r) => {
    const els = [...new Set(ONS.map((x) => x[1]))].filter((e) => new Set(ONS.filter((x) => x[1] === e).map((x) => onOf(x[0], e).v)).size >= 4);
    const el = r.pick(els);
    const pool = r.shuffle(ONS.filter((x) => x[1] === el).map((x) => ({ sp: x[0], v: onOf(x[0], el).v })));
    const chosen: { sp: string; v: number }[] = [];
    for (const p of pool) if (!chosen.some((c) => c.v === p.v)) chosen.push(p);
    const ex = (xs: { sp: string; v: number }[]) => xs.map((x) => `${m(x.sp)}: ${onT(x.v)}`).join("; ");
    if (r.chance(0.5)) {
      const xs = chosen.slice(0, 3), vs = xs.map((x) => x.v);
      const T3 = (a: number[]) => `$${a.map(sg).join(";\\ ")}$`;
      const w: number[][] = [[...vs].reverse(), [vs[1], vs[0], vs[2]], [vs[0], vs[2], vs[1]], vs.map((x, i) => (i === 0 ? -x : x)), vs.map((x, i) => (i === 2 ? x - 1 : x))];
      return { stem: `Số oxi hóa của ${el} trong các chất ${xs.map((x) => m(x.sp)).join(", ")} lần lượt là`, ...mcq(r, T3(vs), w.map(T3)), explanation: `Áp dụng quy tắc: H thường là +1, O thường là −2, tổng số oxi hóa trong phân tử bằng 0, trong ion bằng điện tích ion. ${ex(xs)}.` };
    }
    const xs = chosen.slice(0, 4), hi = r.chance(0.5);
    const best = xs.reduce((a, b) => ((hi ? b.v > a.v : b.v < a.v) ? b : a));
    return { stem: `Trong các chất sau, chất mà nguyên tố ${el} có số oxi hóa ${hi ? "cao" : "thấp"} nhất là`, ...mcq(r, m(best.sp), xs.filter((x) => x !== best).map((x) => m(x.sp))), explanation: `Số oxi hóa của ${el}: ${ex(xs)}. ${hi ? "Cao" : "Thấp"} nhất là ${m(best.sp)}.` };
  }),
  T("khai-niem-oxi-hoa-khu", C4, "Chất oxi hóa, chất khử, quá trình oxi hóa, quá trình khử", 1, 1, "mcq", (r) => {
    if (r.chance(0.35)) {
      const D = ["nhường electron, số oxi hóa tăng sau phản ứng", "nhận electron, số oxi hóa giảm sau phản ứng", "nhường electron, số oxi hóa giảm sau phản ứng", "nhận electron, số oxi hóa tăng sau phản ứng"];
      const P = ["sự nhường electron", "sự nhận electron", "sự nhường proton", "sự nhận proton"];
      const it = r.pick([
        ["Chất khử (chất bị oxi hóa) là chất", D[0], D], ["Chất oxi hóa (chất bị khử) là chất", D[1], D],
        ["Trong phản ứng oxi hóa – khử, chất khử là chất", D[0], D], ["Trong phản ứng oxi hóa – khử, chất oxi hóa là chất", D[1], D],
        ["Quá trình oxi hóa (sự oxi hóa) là", P[0], P], ["Quá trình khử (sự khử) là", P[1], P],
      ] as [string, string, string[]][]);
      return { stem: it[0], ...mcq(r, it[1], it[2].filter((x) => x !== it[1])), explanation: "Chất khử nhường electron (số oxi hóa tăng), còn gọi là chất bị oxi hóa; chất oxi hóa nhận electron (số oxi hóa giảm), còn gọi là chất bị khử. Quá trình oxi hóa là quá trình nhường electron; quá trình khử là quá trình nhận electron." };
    }
    const EL: Record<string, number[]> = { Fe: [0, 2, 3], N: [-3, 0, 1, 2, 4, 5], S: [-2, 0, 4, 6], Cl: [-1, 0, 1, 5, 7], Mn: [2, 4, 6, 7], Cr: [3, 6], Cu: [0, 1, 2], C: [-4, 0, 2, 4] };
    const ov = (v: number, e: string) => `\\overset{${v === 0 ? "0" : sg(v)}}{\\mathrm{${e}}}`;
    const half = (ox: boolean): string => {
      const e = r.pick(Object.keys(EL)); const [a, b] = pickN(r, EL[e], 2).sort((x, y) => (ox ? x - y : y - x)); const n = Math.abs(a - b);
      return ox ? `$${ov(a, e)} \\rightarrow ${ov(b, e)} + ${n}e$` : `$${ov(a, e)} + ${n}e \\rightarrow ${ov(b, e)}$`;
    };
    if (r.chance(0.5)) {
      const e = r.pick(Object.keys(EL)), [a, b] = pickN(r, EL[e], 2), n = Math.abs(a - b), o = b > a;
      const hr = o ? `$${ov(a, e)} \\rightarrow ${ov(b, e)} + ${n}e$` : `$${ov(a, e)} + ${n}e \\rightarrow ${ov(b, e)}$`;
      const opt = (p: boolean, g: boolean) => `quá trình ${p ? "oxi hóa" : "khử"}, ${e} ${g ? "nhường" : "nhận"} ${n} electron`;
      return { stem: `Quá trình ${hr} là`, ...mcq(r, opt(o, o), [opt(!o, !o), opt(o, !o), opt(!o, o)]),
        explanation: `Số oxi hóa của ${e} ${o ? "tăng" : "giảm"} từ ${onT(a)} ${o ? "lên" : "xuống"} ${onT(b)}: ${e} ${o ? "nhường" : "nhận"} ${n} electron nên đây là quá trình ${o ? "oxi hóa" : "khử"}.` };
    }
    const ox = r.chance(0.5), right = half(ox), w = [half(!ox), half(!ox), half(!ox), half(!ox), half(!ox)];
    return { stem: `Quá trình nào sau đây là quá trình ${ox ? "oxi hóa" : "khử"}?`, ...mcq(r, right, w),
      explanation: `Quá trình oxi hóa là quá trình nhường electron (số oxi hóa tăng); quá trình khử là quá trình nhận electron (số oxi hóa giảm). Quá trình ${right} ${ox ? "nhường electron, số oxi hóa tăng" : "nhận electron, số oxi hóa giảm"}.` };
  }),
  T("nhan-biet-phan-ung-oxh", C4, "Nhận biết phản ứng oxi hóa – khử", 1, 1, "mcq", (r) => {
    const redox = r.chance(0.6), red = pickN(r, RXS, 3), non = pickN(r, NONRX, 3);
    const good = redox ? red[0].e : non[0];
    const list = r.shuffle(redox ? [good, ...non] : [good, ...red.map((x) => x.e)]);
    const k = list.indexOf(good) + 1, L = (i: number) => `Phản ứng (${i})`;
    const x = red[0];
    return {
      stem: `Cho các phản ứng sau: ${list.map((e, i) => `(${i + 1}) ${eqT(e)}`).join("; ")}. Phản ứng nào ${redox ? "là" : "không phải là"} phản ứng oxi hóa – khử?`,
      ...mcq(r, L(k), [1, 2, 3, 4].filter((i) => i !== k).map(L)),
      explanation: redox
        ? `Phản ứng oxi hóa – khử có sự thay đổi số oxi hóa của một số nguyên tố. Trong phản ứng (${k}): ${x.r.el} $${x.r.a} \\rightarrow ${x.r.b}$, ${x.o.el} $${x.o.a} \\rightarrow ${x.o.b}$. Các phản ứng còn lại không có nguyên tố nào thay đổi số oxi hóa.`
        : `Trong phản ứng (${k}) không có nguyên tố nào thay đổi số oxi hóa. Các phản ứng còn lại đều có sự thay đổi số oxi hóa, ví dụ ${eqT(x.e)}: ${x.r.el} $${x.r.a} \\rightarrow ${x.r.b}$, ${x.o.el} $${x.o.a} \\rightarrow ${x.o.b}$.`,
    };
  }),
  T("chat-oxi-hoa-chat-khu", C4, "Xác định chất oxi hóa, chất khử trong phản ứng", 1, 1, "mcq", (r) => {
    const x = r.pick(RXS), { re, pr } = sides(x.e);
    const [ask, right] = r.pick([["chất oxi hóa", x.o.f], ["chất khử", x.r.f], ["chất bị oxi hóa", x.r.f], ["chất bị khử", x.o.f]] as [string, string][]);
    const w = [...r.shuffle(re.map((s) => s.f).filter((f) => f !== right)), ...r.shuffle(pr.map((s) => s.f))];
    return { stem: `${rxStem(x, true)}. Trong phản ứng trên, ${ask} là`, ...mcq(r, m(right), [...new Set(w)].map(m)), explanation: `${rxNote(x)} Chất khử còn gọi là chất bị oxi hóa; chất oxi hóa còn gọi là chất bị khử.` };
  }),
  T("can-bang-he-so", C4, "Cân bằng phản ứng bằng phương pháp thăng bằng electron", 1, 2, "mcq", (r) => {
    const x = r.pick(RXS), { re, pr } = sides(x.e), all = [...re, ...pr], sum = coefSum(x.e);
    need(all.some((s) => s.c > 1));
    if (r.chance(0.5)) {
      const sr = re.reduce((a, s) => a + s.c, 0), sp = sum - sr;
      return { stem: `${rxStem(x, false)}. Sau khi cân bằng với hệ số là các số nguyên, tối giản, tổng hệ số của các chất trong phương trình là`,
        ...mcq(r, String(sum), r.shuffle([sr, sp, sum + 1, sum - 1, sum + 2, sum - 2].filter((v) => v > 0 && v !== sum)).map(String)), explanation: `${rxBal(x)} Tổng hệ số: ${all.map((s) => s.c).join(" + ")} = ${sum}.` };
    }
    const sp = r.pick(all.filter((s) => s.c > 1));
    const others = all.filter((s) => s.c !== sp.c).map((s) => s.c);
    return { stem: `${rxStem(x, false)}. Sau khi cân bằng với hệ số là các số nguyên, tối giản, hệ số của ${m(sp.f)} là`,
      ...mcq(r, String(sp.c), r.shuffle([...others, sp.c + 1, sp.c - 1, 2 * sp.c].filter((v) => v > 0 && v !== sp.c)).map(String)), explanation: `${rxBal(x)} Hệ số của ${m(sp.f)} là ${sp.c}.` };
  }),
  T("tf-phan-ung-oxh", C4, "Phân tích một phản ứng oxi hóa – khử", 1, 2, "tf", (r) => {
    const x = r.pick(RXS), sum = coefSum(x.e), toN = Number(x.o.b);
    const wTo = r.pick([toN + 1, toN - 1, toN + 2].filter((v) => v !== Number(x.o.a)));
    const items: [string, boolean][] = [
      st(r.chance(0.5), `${m(x.o.f)} là chất oxi hóa, ${m(x.r.f)} là chất khử.`, `${m(x.r.f)} là chất oxi hóa, ${m(x.o.f)} là chất khử.`),
      st(r.chance(0.5), `Mỗi ${unit(x.r.f)} ${m(x.r.f)} đóng vai trò chất khử đã nhường ${x.r.e} electron.`, r.chance(0.5) ? `Mỗi ${unit(x.r.f)} ${m(x.r.f)} đóng vai trò chất khử đã nhận ${x.r.e} electron.` : `Mỗi ${unit(x.r.f)} ${m(x.r.f)} đóng vai trò chất khử đã nhường ${x.r.e + 1} electron.`),
      st(r.chance(0.5), `Trong quá trình khử, số oxi hóa của ${x.o.el} thay đổi từ $${x.o.a}$ về $${x.o.b}$.`, `Trong quá trình khử, số oxi hóa của ${x.o.el} thay đổi từ $${x.o.a}$ về ${onT(wTo)}.`),
      st(r.chance(0.5), `Tổng hệ số (nguyên, tối giản) của các chất trong phương trình là ${sum}.`, `Tổng hệ số (nguyên, tối giản) của các chất trong phương trình là ${sum + r.pick([-2, -1, 1, 2])}.`),
    ];
    if (x.med) {
      const role = x.med[0] === "o" ? x.o : x.r, tot = role.n + x.med[1];
      items.push(st(r.chance(0.5), `Trong ${tot} phân tử ${m(role.f)} tham gia phản ứng, có ${x.med[1]} phân tử đóng vai trò môi trường.`, `Trong ${tot} phân tử ${m(role.f)} tham gia phản ứng, có ${role.n} phân tử đóng vai trò môi trường.`));
    }
    const pick = pickN(r, items, 4);
    const medEx = x.med ? ` Trong phản ứng, ${(x.med[0] === "o" ? x.o : x.r).n} phân tử ${m((x.med[0] === "o" ? x.o : x.r).f)} đóng vai trò chất ${x.med[0] === "o" ? "oxi hóa" : "khử"}, ${x.med[1]} phân tử còn lại đóng vai trò môi trường (tạo muối).` : "";
    return { stem: `${rxStem(x, false)}.`, ...tf(pick), explanation: `${rxBal(x)} Tổng hệ số là ${sum}.${medEx}` };
  }),
  T("short-tong-he-so", C4, "Tổng hệ số sau khi cân bằng", 1, 2, "short", (r) => {
    const x = r.pick(RXS), sum = coefSum(x.e), { re } = sides(x.e);
    if (r.chance(0.6)) return { stem: `${rxStem(x, false)}. Sau khi cân bằng phương trình với hệ số là các số nguyên, tối giản, tổng hệ số của các chất là bao nhiêu?`, ...short(sum), explanation: `${rxBal(x)} Tổng hệ số là ${sum}.` };
    const sr = re.reduce((a, s) => a + s.c, 0);
    return { stem: `${rxStem(x, false)}. Sau khi cân bằng phương trình với hệ số là các số nguyên, tối giản, tổng hệ số của các chất tham gia phản ứng là bao nhiêu?`, ...short(sr), explanation: `${rxBal(x)} Tổng hệ số các chất tham gia: ${re.map((s) => s.c).join(" + ")} = ${sr}.` };
  }),
  T("short-vai-tro-acid", C4, "Acid vừa là chất oxi hóa (khử) vừa là môi trường", 1, 3, "short", (r) => {
    const x = r.pick(RXS.filter((y) => y.med)), [k, med] = x.med!, role = k === "o" ? x.o : x.r, tot = role.n + med;
    const [ask, v] = r.pick([[`đóng vai trò chất ${k === "o" ? "oxi hóa" : "khử"}`, role.n], ["chỉ đóng vai trò môi trường (tạo muối)", med]] as [string, number][]);
    return { stem: `${rxStem(x, false)}. Sau khi cân bằng với hệ số nguyên, tối giản, trong số các phân tử ${m(role.f)} tham gia phản ứng có bao nhiêu phân tử ${ask}?`, ...short(v),
      explanation: `${rxBal(x)} Có ${tot} phân tử ${m(role.f)}: ${role.n} phân tử ${k === "o" ? "nhận" : "nhường"} electron (chất ${k === "o" ? "oxi hóa" : "khử"}), ${med} phân tử còn lại giữ nguyên số oxi hóa, chỉ tạo muối (môi trường). Đáp số: ${v}.` };
  }),
  T("short-bao-toan-electron", C4, "Bảo toàn electron trong phản ứng oxi hóa – khử", 1, 3, "short", (r) => {
    const mode = r.int(0, 2);
    if (mode === 2) {
      const V1 = r.pick([10, 20, 25]), C1 = r.pick([0.05, 0.1, 0.15, 0.2]), C2 = r.pick([0.01, 0.02, 0.025, 0.05]);
      const V2 = (V1 * C1) / (5 * C2); need(exact(V2, 1) && V2 <= 99.9 && V2 >= 2);
      return { stem: `Chuẩn độ ${V1} mL dung dịch ${m("FeSO4")} ${vn(C1)} M (môi trường ${m("H2SO4")} loãng) bằng dung dịch ${m("KMnO4")} ${vn(C2, 3)} M. Theo phản ứng ${eqT("10FeSO4 + 2KMnO4 + 8H2SO4 -> 5Fe2(SO4)3 + K2SO4 + 2MnSO4 + 8H2O")}, thể tích dung dịch ${m("KMnO4")} cần dùng để phản ứng vừa đủ là bao nhiêu mL? (làm tròn đến hàng phần mười)`,
        ...short(V2, 1), explanation: `$n_{\\mathrm{Fe^{2+}}} = ${tex(V1 / 1000, 3)}\\cdot ${tex(C1)} = ${tex((V1 * C1) / 1000, 5)}$ mol. Bảo toàn electron: $\\mathrm{Fe^{+2}} \\rightarrow \\mathrm{Fe^{+3}} + 1e$, $\\mathrm{Mn^{+7}} + 5e \\rightarrow \\mathrm{Mn^{+2}}$ nên $n_{\\mathrm{KMnO_4}} = \\dfrac{n_{\\mathrm{Fe^{2+}}}}{5} = ${tex((V1 * C1) / 5000, 6)}$ mol; $V = \\dfrac{${tex((V1 * C1) / 5000, 6)}}{${tex(C2, 3)}} = ${tex(V2 / 1000, 4)}$ L $= ${tex(V2, 1)}$ mL.` };
    }
    const s = r.pick(["Mg", "Al", "Zn", "Fe", "Cu"]), [M, , name] = MET[s], k = s === "Fe" || s === "Al" ? 3 : 2;
    const gas = r.pick([{ f: "SO2", g: 2, acid: `dung dịch ${m("H2SO4")} đặc, nóng, dư`, ch: "\\mathrm{S^{+6}} + 2e \\rightarrow \\mathrm{S^{+4}}" }, { f: "NO", g: 3, acid: `dung dịch ${m("HNO3")} loãng, dư`, ch: "\\mathrm{N^{+5}} + 3e \\rightarrow \\mathrm{N^{+2}}" }]);
    const nG = r.int(1, 16) * 0.025, ne = nG * gas.g, nM = ne / k, mass = round(nM * M, 4), V = nG * VM;
    need(exact(mass, 2));
    const head = `$\\mathrm{${s}} \\rightarrow \\mathrm{${s}^{${k}+}} + ${k}e$; $${gas.ch}$. Bảo toàn electron: $${k}n_{\\mathrm{${s}}} = ${gas.g}n_{\\mathrm{${mf(gas.f)}}}$.`;
    if (mode === 0) {
      return { stem: `Hòa tan hoàn toàn ${vn(mass)} gam ${name} (${s}) trong ${gas.acid}, thu được V lít khí ${m(gas.f)} (sản phẩm khử duy nhất, đo ở điều kiện chuẩn). Tính V (làm tròn đến hàng phần trăm). Cho ${s} = ${M}. ${VMT}`,
        ...short(V, 2), explanation: `$n_{\\mathrm{${s}}} = \\dfrac{${tex(mass)}}{${M}} = ${tex(nM, 4)}$ mol. ${head} $\\Rightarrow n_{\\mathrm{${mf(gas.f)}}} = \\dfrac{${k}\\cdot ${tex(nM, 4)}}{${gas.g}} = ${tex(nG, 3)}$ mol; $V = ${tex(nG, 3)}\\cdot 24{,}79 \\approx ${tex(V, 2)}$ lít.` };
    }
    return { stem: `Hòa tan hoàn toàn m gam ${name} (${s}) trong ${gas.acid}, thu được ${vn(V, 4)} lít khí ${m(gas.f)} (sản phẩm khử duy nhất, đo ở điều kiện chuẩn). Tính m (làm tròn đến hàng phần trăm). Cho ${s} = ${M}. ${VMT}`,
      ...short(mass, 2), explanation: `$n_{\\mathrm{${mf(gas.f)}}} = \\dfrac{${tex(V, 4)}}{24{,}79} = ${tex(nG, 3)}$ mol. ${head} $\\Rightarrow n_{\\mathrm{${s}}} = \\dfrac{${gas.g}\\cdot ${tex(nG, 3)}}{${k}} = ${tex(nM, 4)}$ mol; $m = ${tex(nM, 4)}\\cdot ${M} = ${tex(mass)}$ gam.` };
  }),
];

/* ======================= HALF 1 – CHƯƠNG 5 ======================= */
const H5: Template[] = [
  T("toa-thu-nhiet", C5, "Phản ứng tỏa nhiệt, phản ứng thu nhiệt", 1, 1, "mcq", (r) => {
    const exo = r.chance(0.5);
    if (r.chance(0.5)) {
      const EXO = ["Đốt cháy than trong không khí", "Đốt cháy khí gas (butane) khi đun nấu", "Phản ứng trung hòa giữa dung dịch HCl và dung dịch NaOH", "Cho vôi sống (CaO) vào nước",
        "Cho mẩu sodium vào nước", "Đốt cháy cồn (ethanol) trong đèn cồn", "Quá trình hô hấp tế bào (oxi hóa glucose)", "Phản ứng nhiệt nhôm giữa Al và Fe₂O₃", "Đốt cháy dải magnesium trong không khí"];
      const ENDO = ["Nung đá vôi (CaCO₃) để sản xuất vôi sống", "Quá trình quang hợp của cây xanh", "Nhiệt phân copper(II) hydroxide", "Điện phân nước tạo hydrogen và oxygen",
        "Cho hơi nước đi qua than nóng đỏ tạo khí than ướt", "Nung NaHCO₃ tạo Na₂CO₃", "Phân hủy nước thành H₂ và O₂ bằng năng lượng mặt trời"];
      const fix = (s: string) => s.replace("Fe₂O₃", m("Fe2O3")).replace("CaCO₃", m("CaCO3")).replace("KMnO₄", m("KMnO4")).replace("NaHCO₃", m("NaHCO3")).replace("Na₂CO₃", m("Na2CO3")).replace("H₂", m("H2")).replace("O₂", m("O2"));
      const right = fix(r.pick(exo ? EXO : ENDO)), w = pickN(r, exo ? ENDO : EXO, 3).map(fix);
      return { stem: `Quá trình nào sau đây là ${exo ? "tỏa" : "thu"} nhiệt?`, ...mcq(r, right, w),
        explanation: `Phản ứng tỏa nhiệt giải phóng năng lượng dạng nhiệt ra môi trường (sự đốt cháy, phản ứng trung hòa, vôi sống tác dụng với nước, hô hấp...). Phản ứng thu nhiệt cần cung cấp năng lượng liên tục (nung, nhiệt phân, điện phân, quang hợp...). Vậy quá trình ${exo ? "tỏa" : "thu"} nhiệt là: ${right}.` };
    }
    if (r.chance(0.4)) {
      const x = r.pick(THS), ex2 = x.h < 0;
      const o = (a: boolean, b: boolean) => `${a ? "tỏa" : "thu"} nhiệt, năng lượng của hệ ${b ? "giảm" : "tăng"}`;
      return { stem: `Cho phương trình nhiệt hóa học: ${thT(x)}. Phản ứng trên là phản ứng`, ...mcq(r, o(ex2, ex2), [o(!ex2, !ex2), o(ex2, !ex2), o(!ex2, ex2)]),
        explanation: `$${DH} = ${tex(x.h, 1)}$ kJ ${ex2 ? "< 0: phản ứng tỏa nhiệt, hệ giải phóng nhiệt ra môi trường nên năng lượng của hệ giảm" : "> 0: phản ứng thu nhiệt, hệ nhận nhiệt từ môi trường nên năng lượng của hệ tăng"}.` };
    }
    const good = r.pick(THS.filter((x) => (x.h < 0) === exo)), w = pickN(r, THS.filter((x) => (x.h < 0) !== exo), 3);
    return { stem: `Phản ứng nào sau đây là phản ứng ${exo ? "tỏa" : "thu"} nhiệt?`, ...mcq(r, thT(good), w.map(thT)),
      explanation: `Phản ứng tỏa nhiệt có $${DH} < 0$, phản ứng thu nhiệt có $${DH} > 0$. Phản ứng ${eqT(good.e)} có $${DH} = ${tex(good.h, 1)}$ kJ ${exo ? "< 0" : "> 0"} nên ${exo ? "tỏa" : "thu"} nhiệt.` };
  }),
  T("khai-niem-enthalpy", C5, "Enthalpy tạo thành, điều kiện chuẩn, năng lượng liên kết", 1, 1, "mcq", (r) => {
    const items: (() => [string, string, string[], string])[] = [
      () => [r.pick(["Phản ứng tỏa nhiệt là phản ứng có", "Phản ứng nào sau đây được gọi là phản ứng tỏa nhiệt? Phản ứng có"]), `$${DH} < 0$`, [`$${DH} > 0$`, `$${DH} = 0$`, `$${DH} \\ge 0$`], `Phản ứng tỏa nhiệt giải phóng nhiệt ra môi trường, hệ mất năng lượng nên $${DH} < 0$.`],
      () => [r.pick(["Phản ứng thu nhiệt là phản ứng có", "Một phản ứng thu nhiệt luôn có"]), `$${DH} > 0$`, [`$${DH} < 0$`, `$${DH} = 0$`, `$${DH} \\le 0$`], `Phản ứng thu nhiệt nhận nhiệt từ môi trường nên $${DH} > 0$.`],
      () => [r.pick(["Enthalpy tạo thành chuẩn của một đơn chất bền nhất bằng", "Ở điều kiện chuẩn, enthalpy tạo thành của đơn chất bền vững nhất có giá trị"]), "0", ["1 kJ/mol", "−1 kJ/mol", "nhiệt lượng tỏa ra khi đốt cháy 1 mol đơn chất đó"], "Theo quy ước, enthalpy tạo thành chuẩn của các đơn chất ở dạng bền vững nhất bằng 0."],
      () => [r.pick([`Enthalpy tạo thành chuẩn ($${DF}$) của một chất là`, `Biến thiên enthalpy tạo thành chuẩn của một chất được định nghĩa là`]), "nhiệt kèm theo phản ứng tạo thành 1 mol chất đó từ các đơn chất bền nhất ở điều kiện chuẩn",
        ["nhiệt tỏa ra khi đốt cháy hoàn toàn 1 mol chất đó ở điều kiện chuẩn", "nhiệt kèm theo phản ứng tạo thành 1 gam chất đó từ các đơn chất bền nhất", "năng lượng cần để phá vỡ hết các liên kết trong 1 mol chất đó ở thể khí"], "Enthalpy tạo thành chuẩn là nhiệt kèm theo phản ứng tạo thành 1 mol chất từ các đơn chất bền nhất ở điều kiện chuẩn."],
      () => [r.pick(["Điều kiện chuẩn dùng để xác định biến thiên enthalpy chuẩn gồm", "Biến thiên enthalpy chuẩn được xác định ở điều kiện chuẩn, đó là"]), "áp suất 1 bar (chất khí), nồng độ 1 mol/L (chất tan), nhiệt độ thường chọn 298 K",
        ["áp suất 1 atm, nhiệt độ 0 °C", "áp suất 1 bar, nồng độ 1 mol/L, nhiệt độ 0 K", "áp suất 2 bar, nồng độ 0,1 mol/L, nhiệt độ 273 K"], "Điều kiện chuẩn: áp suất 1 bar đối với chất khí, nồng độ 1 mol/L đối với chất tan, nhiệt độ thường chọn là 25 °C (298 K)."],
      () => [r.pick(["Đơn vị thường dùng của enthalpy tạo thành chuẩn là", "Enthalpy tạo thành chuẩn của các chất thường được biểu diễn theo đơn vị"]), "kJ/mol", ["kJ", "J/g", "mol/kJ"], "Enthalpy tạo thành chuẩn tính cho 1 mol chất nên có đơn vị kJ/mol."],
      () => [r.pick(["Biến thiên enthalpy chuẩn của phản ứng tính theo enthalpy tạo thành chuẩn là", "Công thức tính biến thiên enthalpy chuẩn của phản ứng từ enthalpy tạo thành chuẩn của các chất là"]),
        `$${DH} = \\sum ${DF}(\\text{sp}) - \\sum ${DF}(\\text{cđ})$`, [`$${DH} = \\sum ${DF}(\\text{cđ}) - \\sum ${DF}(\\text{sp})$`, `$${DH} = \\sum ${DF}(\\text{sp}) + \\sum ${DF}(\\text{cđ})$`, `$${DH} = \\sum E_{b}(\\text{sp}) - \\sum E_{b}(\\text{cđ})$`],
        "Tổng enthalpy tạo thành của sản phẩm trừ tổng enthalpy tạo thành của chất đầu (nhân với hệ số tương ứng)."],
      () => [r.pick(["Biến thiên enthalpy chuẩn của phản ứng (các chất đều ở thể khí) tính theo năng lượng liên kết là", "Với phản ứng mà các chất đều ở thể khí, công thức tính biến thiên enthalpy theo năng lượng liên kết là"]),
        `$${DH} = \\sum E_{b}(\\text{cđ}) - \\sum E_{b}(\\text{sp})$`, [`$${DH} = \\sum E_{b}(\\text{sp}) - \\sum E_{b}(\\text{cđ})$`, `$${DH} = \\sum E_{b}(\\text{sp}) + \\sum E_{b}(\\text{cđ})$`, `$${DH} = \\sum ${DF}(\\text{cđ}) - \\sum ${DF}(\\text{sp})$`],
        "Phá vỡ liên kết trong chất đầu cần năng lượng, hình thành liên kết trong sản phẩm giải phóng năng lượng nên $\\Delta_{r}H = \\sum E_{b}(\\text{cđ}) - \\sum E_{b}(\\text{sp})$."],
      () => {
        const OK = ["O2(g)", "N2(g)", "Cl2(g)", "H2(g)", "Br2(l)", "I2(s)", "Na(s)", "Fe(s)", "S(s)"], BAD = ["O3(g)", "Br2(g)", "I2(g)", "H2O(l)", "CO2(g)", "Na(g)", "H(g)", "Cl(g)", "NaCl(s)"];
        const g = r.pick(OK);
        return [r.pick(["Chất nào sau đây có enthalpy tạo thành chuẩn bằng 0?", "Ở điều kiện chuẩn, chất nào sau đây có $\\Delta_{f}H^{\\circ}_{298} = 0$?"]), m(g), pickN(r, BAD, 3).map(m), `Chỉ đơn chất ở dạng bền nhất (ở điều kiện chuẩn) mới có enthalpy tạo thành chuẩn bằng 0; ${m(g)} là dạng bền của đơn chất đó.`];
      },
    ];
    const [s, c, w, ex] = r.pick(items)();
    return { stem: s, ...mcq(r, c, w), explanation: ex };
  }),
  T("dHr-tu-enthalpy-tao-thanh", C5, "Tính biến thiên enthalpy theo enthalpy tạo thành", 1, 2, "mcq", (r) => {
    const e = r.pick(FR), d = dHf(e), K = (v: number) => `$${tex(v, 1)}$ kJ`;
    const { re, pr } = sides(e);
    const noCoef = d.raw, sumAll = round(pr.reduce((a, x) => a + x.c * fOf(x.f), 0) + re.reduce((a, x) => a + x.c * fOf(x.f), 0), 1);
    const w = [-d.v, noCoef, -noCoef, sumAll, round(d.v + r.pick([-1, 1]) * r.int(20, 80), 1)].filter((v) => v !== d.v);
    return { stem: `Cho phản ứng: ${eqT(e)}. Biết enthalpy tạo thành chuẩn $${DF}$ (kJ/mol): ${fhList(d.cmp)}. Biến thiên enthalpy chuẩn của phản ứng là`,
      ...mcq(r, K(d.v), w.map(K)), explanation: `Đơn chất bền có $${DF} = 0$. ${d.calc}.` };
  }),
  T("tim-nang-luong-lien-ket", C5, "Tìm năng lượng liên kết từ biến thiên enthalpy", 1, 3, "mcq", (r) => {
    const b = r.pick(BRS), dH = dHb(b);
    const hid = r.pick(bonds(b).filter((k) => (b.re[k] || 0) !== (b.pr[k] || 0)));
    const net = (k: string) => (b.re[k] || 0) - (b.pr[k] || 0);
    const K = bonds(b).filter((k) => k !== hid).reduce((a, k) => a + net(k) * BE[k], 0), n = net(hid);
    const E = (dH - K) / n; need(E === BE[hid]);
    const w = [(-dH - K) / n, (dH + K) / n, dH - K, (dH - K) / (n * 2), E + r.pick([-1, 1]) * r.int(15, 60)].filter((v) => Number.isInteger(v) && v > E / 4 && v < E * 4 && v !== E);
    const known = bonds(b).filter((k) => k !== hid);
    return { stem: `Cho phản ứng (các chất đều ở thể khí): $\\mathrm{${b.eq}}$ có $${DH} = ${dH}$ kJ.${b.note ? ` Biết ${b.note}.` : ""} Biết năng lượng liên kết (kJ/mol): ${bList(known)}. Năng lượng liên kết ${hid} (kJ/mol) là`,
      ...mcq(r, String(E), w.map(String)), explanation: `$${DH} = \\sum E_{b}(\\text{cđ}) - \\sum E_{b}(\\text{sp})$. Gọi năng lượng liên kết ${hid} là x: $(${bTerm(b.re, hid)}) - (${bTerm(b.pr, hid)}) = ${dH}$ $\\Rightarrow x = ${E}$ kJ/mol.` };
  }),
  T("short-dHr-lien-ket", C5, "Tính biến thiên enthalpy theo năng lượng liên kết", 1, 2, "short", (r) => {
    const b = r.pick(BRS), dH = dHb(b);
    return { stem: `Cho phản ứng (các chất đều ở thể khí): $\\mathrm{${b.eq}}$.${b.note ? ` Biết ${b.note}.` : ""} Biết năng lượng liên kết (kJ/mol): ${bList(bonds(b))}. Tính biến thiên enthalpy chuẩn $${DH}$ của phản ứng (kJ).`,
      ...short(dH, 0), explanation: `${bCalc(b)}.` };
  }),
  T("short-nhiet-luong-dot-chay", C5, "Nhiệt lượng tỏa ra khi đốt cháy nhiên liệu", 1, 3, "short", (r) => {
    const FU: { e: string; f: string; c: number; h: number; name: string }[] = [
      { e: "CH4(g) + 2O2(g) -> CO2(g) + 2H2O(l)", f: "CH4", c: 1, h: -890, name: "methane" },
      { e: "C3H8(g) + 5O2(g) -> 3CO2(g) + 4H2O(l)", f: "C3H8", c: 1, h: -2220, name: "propane" },
      { e: "2C4H10(g) + 13O2(g) -> 8CO2(g) + 10H2O(l)", f: "C4H10", c: 2, h: -5756, name: "butane" },
      { e: "C2H5OH(l) + 3O2(g) -> 2CO2(g) + 3H2O(l)", f: "C2H5OH", c: 1, h: -1367, name: "ethanol" },
      { e: "2H2(g) + O2(g) -> 2H2O(l)", f: "H2", c: 2, h: -571.6, name: "hydrogen" },
      { e: "C(s) + O2(g) -> CO2(g)", f: "C", c: 1, h: -393.5, name: "carbon" },
      { e: "2C2H2(g) + 5O2(g) -> 4CO2(g) + 2H2O(l)", f: "C2H2", c: 2, h: -2600, name: "acetylene" },
    ];
    const x = r.pick(FU), M = Mw(x.f), per = -x.h / x.c;
    const thx = `${eqT(x.e).slice(0, -1)}\\quad ${DH} = ${tex(x.h, 1)}\\ \\text{kJ}$`;
    if (r.chance(0.5)) {
      const n = r.int(1, 30) * 0.1, mass = round(n * M, 2), Q = n * per; need(Q >= 10 && Q < 9999.5);
      return { stem: `Cho phương trình nhiệt hóa học: ${thx}. Tính nhiệt lượng (kJ) tỏa ra khi đốt cháy hoàn toàn ${vn(mass)} gam ${x.name} (làm tròn đến hàng đơn vị). Cho H = 1, C = 12, O = 16.`,
        ...short(Q, 0), explanation: `$n = \\dfrac{${tex(mass)}}{${M}} = ${tex(n, 1)}$ mol. Theo phương trình, đốt ${x.c} mol ${x.name} tỏa ${tex(-x.h, 1)} kJ nên 1 mol tỏa $${tex(per, 2)}$ kJ. $Q = ${tex(n, 1)}\\cdot ${tex(per, 2)} \\approx ${round(Q)}$ kJ.` };
    }
    const mw = r.pick([1, 1.5, 2, 2.5, 3, 4, 5]), T1 = r.pick([20, 25, 30]), H = r.pick([60, 70, 75, 80, 90, 100]);
    const Qw = (mw * 1000 * 4.2 * (100 - T1)) / 1000, Qf = Qw / (H / 100), n = Qf / per, mass = n * M; need(mass < 99.95 && mass >= 1);
    return { stem: `Cho phương trình nhiệt hóa học: ${thx}. Cần đốt cháy hoàn toàn bao nhiêu gam ${x.name} để đun nóng ${vn(mw)} kg nước từ ${T1} °C lên 100 °C? Biết nhiệt dung riêng của nước là 4,2 J/(g·K)${H < 100 ? ` và chỉ ${H}% nhiệt lượng tỏa ra được nước hấp thụ` : ", toàn bộ nhiệt tỏa ra được nước hấp thụ"}. (Làm tròn đến hàng phần mười; H = 1, C = 12, O = 16.)`,
      ...short(mass, 1), explanation: `Nhiệt nước cần: $Q = m c \\Delta t = ${mw * 1000}\\cdot 4{,}2\\cdot ${100 - T1} = ${tex(Qw * 1000, 0)}$ J $= ${tex(Qw, 1)}$ kJ. Nhiệt nhiên liệu phải tỏa: $${H < 100 ? `\\dfrac{${tex(Qw, 1)}}{${tex(H / 100, 2)}} = ` : ""}${tex(Qf, 2)}$ kJ. 1 mol ${x.name} tỏa $${tex(per, 2)}$ kJ nên $n = ${tex(n, 4)}$ mol, $m = n\\cdot ${M} \\approx ${tex(mass, 1)}$ gam.` };
  }),
  T("tf-phuong-trinh-nhiet-hoa-hoc", C5, "Phương trình nhiệt hóa học", 1, 2, "tf", (r) => {
    const x = r.pick(THS), exo = x.h < 0, c = thCoef(x), n = r.int(1, 10) * (c > 1 ? 0.2 : 0.1), Q = round((n / c) * Math.abs(x.h), 2);
    const wQ = round(c > 1 ? n * Math.abs(x.h) : Q * 2, 2);
    return { stem: `Cho phương trình nhiệt hóa học: ${thT(x)}.`, ...tf([
      st(r.chance(0.5), `Phản ứng trên là phản ứng ${exo ? "tỏa" : "thu"} nhiệt.`, `Phản ứng trên là phản ứng ${exo ? "thu" : "tỏa"} nhiệt.`),
      st(r.chance(0.5), `Tổng năng lượng (enthalpy) của các sản phẩm ${exo ? "nhỏ" : "lớn"} hơn tổng năng lượng của các chất đầu.`, `Tổng năng lượng (enthalpy) của các sản phẩm ${exo ? "lớn" : "nhỏ"} hơn tổng năng lượng của các chất đầu.`),
      st(r.chance(0.5), `Phản ứng nghịch (theo chiều ngược lại với cùng hệ số) có $${DH} = ${tex(-x.h, 1)}$ kJ.`, `Phản ứng nghịch (theo chiều ngược lại với cùng hệ số) có $${DH} = ${tex(x.h, 1)}$ kJ.`),
      st(r.chance(0.5), `Khi có ${vn(n)} mol ${m(x.k)} phản ứng hết, lượng nhiệt ${exo ? "tỏa ra" : "thu vào"} là ${vn(Q)} kJ.`, `Khi có ${vn(n)} mol ${m(x.k)} phản ứng hết, lượng nhiệt ${exo ? "tỏa ra" : "thu vào"} là ${vn(wQ)} kJ.`),
    ]), explanation: `$${DH} = ${tex(x.h, 1)}$ kJ ${exo ? "< 0: phản ứng tỏa nhiệt, sản phẩm có tổng enthalpy nhỏ hơn chất đầu" : "> 0: phản ứng thu nhiệt, sản phẩm có tổng enthalpy lớn hơn chất đầu"}. Phản ứng nghịch có biến thiên enthalpy đổi dấu: $${tex(-x.h, 1)}$ kJ. Theo phương trình, ${c} mol ${m(x.k)} ứng với $${tex(Math.abs(x.h), 1)}$ kJ nên ${vn(n)} mol ứng với $\\dfrac{${tex(n)}}{${c}}\\cdot ${tex(Math.abs(x.h), 1)} = ${tex(Q)}$ kJ.` };
  }),
  T("tf-enthalpy-tao-thanh", C5, "Biến thiên enthalpy theo enthalpy tạo thành", 1, 3, "tf", (r) => {
    const e = r.pick(FR), d = dHf(e), exo = d.v < 0, { re } = sides(e), key = re[0], c = key.c, n = r.int(1, 10) * 0.1;
    const Q = round((n / c) * Math.abs(d.v), 2), wQ = round(c > 1 ? n * Math.abs(d.v) : Q * 2, 2);
    const cp = r.pick(d.cmp);
    return { stem: `Cho phản ứng: ${eqT(e)}. Biết enthalpy tạo thành chuẩn $${DF}$ (kJ/mol): ${fhList(d.cmp)}.`, ...tf([
      st(r.chance(0.5), `Biến thiên enthalpy chuẩn của phản ứng là $${tex(d.v, 1)}$ kJ.`, `Biến thiên enthalpy chuẩn của phản ứng là $${tex(-d.v, 1)}$ kJ.`),
      st(r.chance(0.5), `Phản ứng trên là phản ứng ${exo ? "tỏa" : "thu"} nhiệt.`, `Phản ứng trên là phản ứng ${exo ? "thu" : "tỏa"} nhiệt.`),
      st(r.chance(0.5), `Giá trị $${DF}$ của ${m(cp)} là nhiệt kèm theo phản ứng tạo thành 1 mol ${m(cp)} từ các đơn chất bền nhất ở điều kiện chuẩn.`, `Giá trị $${DF}$ của ${m(cp)} là nhiệt kèm theo phản ứng tạo thành 1 mol ${m(cp)} từ các nguyên tử ở thể khí.`),
      st(r.chance(0.5), `Khi ${vn(n)} mol ${m(noSt(key.f))} phản ứng hết theo phương trình trên, lượng nhiệt ${exo ? "tỏa ra" : "thu vào"} là ${vn(Q)} kJ.`, `Khi ${vn(n)} mol ${m(noSt(key.f))} phản ứng hết theo phương trình trên, lượng nhiệt ${exo ? "tỏa ra" : "thu vào"} là ${vn(wQ)} kJ.`),
    ]), explanation: `${d.calc} (${exo ? "< 0, tỏa nhiệt" : "> 0, thu nhiệt"}). Enthalpy tạo thành chuẩn của một chất là nhiệt kèm theo phản ứng tạo thành 1 mol chất đó từ các đơn chất bền nhất. ${c} mol ${m(noSt(key.f))} ứng với $${tex(Math.abs(d.v), 1)}$ kJ nên ${vn(n)} mol ứng với $${tex(Q)}$ kJ.` };
  }),
];

/* ======================= HALF 1 – CHƯƠNG 6 ======================= */
const FACT = ["nhiệt độ", "nồng độ", "diện tích bề mặt tiếp xúc", "chất xúc tác", "áp suất"];
const H6: Template[] = [
  T("yeu-to-anh-huong-toc-do", C6, "Các yếu tố ảnh hưởng đến tốc độ phản ứng", 1, 1, "mcq", (r) => {
    if (r.chance(0.5)) {
      const SIT: [string, number][] = [
        ["nghiền nhỏ đá vôi trước khi cho vào lò nung vôi", 2], ["chẻ nhỏ củi khi nhóm bếp", 2], ["làm than tổ ong có nhiều lỗ", 2], ["dùng kẽm bột thay cho kẽm viên khi cho tác dụng với acid", 2],
        ["bảo quản thực phẩm trong tủ lạnh để chậm bị ôi thiu", 0], ["muối dưa ở nơi ấm để dưa nhanh chua", 0], ["nung đá vôi ở nhiệt độ cao (khoảng 900 °C)", 0], ["ngâm rau quả trong nước lạnh để giữ tươi lâu", 0],
        ["thổi không khí (quạt gió) vào lò than", 1], ["dùng oxygen tinh khiết thay cho không khí trong đèn xì hàn cắt kim loại", 1], ["dùng dung dịch acid đặc hơn để kim loại tan nhanh hơn", 1],
        ["dùng men để ủ rượu, làm bánh mì", 3], ["cho thêm bột manganese dioxide khi phân hủy hydrogen peroxide", 3], ["dùng bột sắt khi tổng hợp ammonia từ nitrogen và hydrogen", 3],
        ["nén hỗn hợp khí nitrogen và hydrogen ở áp suất cao khi tổng hợp ammonia", 4],
      ];
      const [t, k] = r.pick(SIT);
      return { stem: `Trong thực tế, người ta ${t}. Yếu tố nào đã được sử dụng để làm thay đổi tốc độ phản ứng?`, ...mcq(r, FACT[k], r.shuffle(FACT.filter((_, i) => i !== k))),
        explanation: `Biện pháp "${t}" làm thay đổi ${FACT[k]}, từ đó thay đổi tốc độ phản ứng.` };
    }
    const X = r.pick([["Zn", "viên"], ["Fe", "viên"], ["Mg", "mảnh"], ["CaCO3", "viên (đá vôi)"]]), acid = r.pick(["HCl", "H2SO4"]);
    const solid = m(X[0]);
    const INC = [`đun nóng dung dịch ${m(acid)}`, `thay ${solid} dạng ${X[1]} bằng ${solid} dạng bột (cùng khối lượng)`, `dùng dung dịch ${m(acid)} có nồng độ lớn hơn`];
    const DEC = [`làm lạnh dung dịch ${m(acid)}`, `pha loãng dung dịch ${m(acid)} bằng nước`, `thay ${solid} dạng bột bằng ${solid} dạng ${X[1].split(" ")[0]} (cùng khối lượng)`];
    const inc = r.chance(0.5), good = r.pick(inc ? INC : DEC);
    return { stem: `Cho ${solid} tác dụng với dung dịch ${m(acid)} loãng. Biện pháp nào sau đây làm ${inc ? "tăng" : "giảm"} tốc độ phản ứng?`, ...mcq(r, cap(good), (inc ? DEC : INC).map(cap)),
      explanation: "Tăng nhiệt độ, tăng nồng độ acid, tăng diện tích bề mặt tiếp xúc (dùng chất rắn dạng bột) đều làm tăng tốc độ phản ứng; làm lạnh, pha loãng, dùng chất rắn dạng khối lớn làm giảm tốc độ phản ứng." };
  }),
  T("chat-xuc-tac", C6, "Chất xúc tác, năng lượng hoạt hóa", 1, 1, "mcq", (r) => {
    const items: (() => [string, string, string[], string])[] = [
      () => [r.pick(["Chất xúc tác là chất", "Trong phản ứng hóa học, chất xúc tác là chất"]), "làm tăng tốc độ phản ứng nhưng không bị biến đổi về chất và lượng sau phản ứng",
        ["làm tăng tốc độ phản ứng và bị tiêu hao hoàn toàn sau phản ứng", "làm giảm tốc độ phản ứng và không bị biến đổi sau phản ứng", "làm tăng lượng sản phẩm tạo thành nhưng không làm thay đổi tốc độ phản ứng"], "Chất xúc tác làm tăng tốc độ phản ứng, sau phản ứng vẫn giữ nguyên về chất và lượng."],
      () => [r.pick(["Chất xúc tác làm tăng tốc độ phản ứng là do", "Nguyên nhân chất xúc tác làm tăng tốc độ phản ứng là"]), "làm giảm năng lượng hoạt hóa của phản ứng",
        ["làm tăng năng lượng hoạt hóa của phản ứng", "làm tăng nhiệt độ của hệ phản ứng", "làm tăng nồng độ các chất phản ứng"], "Chất xúc tác tạo ra con đường phản ứng có năng lượng hoạt hóa thấp hơn nên số va chạm hiệu quả tăng."],
      () => [r.pick(["Năng lượng hoạt hóa là", "Khái niệm năng lượng hoạt hóa của phản ứng là"]), "năng lượng tối thiểu mà các hạt cần có để va chạm hiệu quả gây ra phản ứng",
        ["năng lượng tỏa ra khi phản ứng xảy ra", "năng lượng cần để phá vỡ hết các liên kết trong chất đầu", "năng lượng của các sản phẩm sau phản ứng"], "Năng lượng hoạt hóa là năng lượng tối thiểu các hạt cần có để va chạm hiệu quả."],
      () => [r.pick(["Khi tăng nhiệt độ, tốc độ phản ứng tăng chủ yếu là do", "Tăng nhiệt độ làm tốc độ phản ứng tăng vì"]), "số va chạm hiệu quả giữa các hạt chất phản ứng tăng",
        ["năng lượng hoạt hóa của phản ứng tăng", "nồng độ các chất phản ứng tăng", "chất xúc tác được tạo ra"], "Tăng nhiệt độ, các hạt chuyển động nhanh hơn, số hạt đủ năng lượng hoạt hóa tăng nên số va chạm hiệu quả tăng."],
      () => {
        const CAT: [string, string][] = [["tổng hợp ammonia từ nitrogen và hydrogen", "Fe"], ["oxi hóa sulfur dioxide thành sulfur trioxide trong sản xuất sulfuric acid", "V2O5"],
          ["phân hủy hydrogen peroxide (nước oxy già) trong phòng thí nghiệm", "MnO2"], ["oxi hóa ammonia thành nitrogen monoxide trong sản xuất nitric acid", "Pt"], ["phản ứng cộng hydrogen vào chất béo lỏng (dầu thực vật)", "Ni"]];
        const [t, c] = r.pick(CAT), w = CAT.filter((x) => x[1] !== c).map((x) => m(x[1]));
        return [`Chất xúc tác thường dùng trong phản ứng ${t} là`, m(c), w, `Trong phản ứng ${t}, chất xúc tác là ${m(c)}.`];
      },
    ];
    const [s, c, w, ex] = r.pick(items)();
    return { stem: s, ...mcq(r, c, pickN(r, w, 3)), explanation: ex };
  }),
  T("toc-do-trung-binh", C6, "Tính tốc độ trung bình của phản ứng", 1, 1, "mcq", (r) => {
    const s = rateSetup(r), K = (v: number) => `$${sciT(v)}$`;
    const w = [s.dC / s.dt, (s.c * s.dC) / s.dt, s.v * 10, s.v / 10, s.dC / (s.c * s.dt * 60)].filter((v) => Math.abs(v - s.v) > 1e-12);
    return { stem: `Cho phản ứng: ${eqT(s.e)}. ${rsText(s)}. Tốc độ trung bình của phản ứng (mol/(L·s)) trong khoảng thời gian trên là`,
      ...mcq(r, K(s.v), w.map(K)), explanation: `Với phản ứng $aA + bB \\rightarrow cC + dD$: $\\bar{v} = -\\dfrac{1}{a}\\dfrac{\\Delta C_A}{\\Delta t} = \\dfrac{1}{c}\\dfrac{\\Delta C_C}{\\Delta t}$. Ở đây ${m(s.f)} có hệ số ${s.c}: ${rsCalc(s)}.` };
  }),
  T("dinh-luat-tac-dung-khoi-luong", C6, "Định luật tác dụng khối lượng", 1, 2, "mcq", (r) => {
    const RL: [string, number, number, string, string][] = [
      ["2NO(g) + O2(g) -> 2NO2(g)", 2, 1, "NO", "O2"], ["H2(g) + I2(g) -> 2HI(g)", 1, 1, "H2", "I2"], ["2NO(g) + Cl2(g) -> 2NOCl(g)", 2, 1, "NO", "Cl2"],
      ["2A(g) + B(g) -> 2C(g)", 2, 1, "A", "B"], ["A(g) + 2B(g) -> C(g)", 1, 2, "A", "B"], ["A(g) + B(g) -> 2C(g)", 1, 1, "A", "B"], ["A(g) + 3B(g) -> 2C(g)", 1, 3, "A", "B"],
    ];
    const [e, a, b, A, B] = r.pick(RL), x = r.pick([2, 3, 4]), y = r.pick([2, 3]), k = r.pick([2, 3]);
    const mode = r.int(0, 3);
    const ok = (f: number) => f > 0 && (Number.isInteger(round(f, 9)) || Number.isInteger(round(1 / f, 9)));
    const ft = (f: number) => (Math.abs(f - 1) < 1e-9 ? "không thay đổi" : f > 1 ? `tăng ${round(f, 6)} lần` : `giảm ${round(1 / f, 6)} lần`);
    let q = "", f = 1, w: number[] = [], ex = "";
    const law = `$v = k\\cdot C_{\\mathrm{${mf(A)}}}^{${a}}\\cdot C_{\\mathrm{${mf(B)}}}^{${b}}$`;
    if (mode === 0) { q = `nồng độ của ${m(A)} tăng ${x} lần, nồng độ của ${m(B)} giữ nguyên`; f = x ** a; w = [x, a * x, x ** (a + 1), x ** b, 1 / x ** a]; ex = `$v' / v = ${x}^{${a}} = ${f}$`; }
    else if (mode === 1) { q = `nồng độ của ${m(A)} tăng ${x} lần và nồng độ của ${m(B)} tăng ${y} lần`; f = x ** a * y ** b; w = [x * y, x ** b * y ** a, x ** a * y, x ** a + y ** b, x * y * (a + b)]; ex = `$v' / v = ${x}^{${a}}\\cdot ${y}^{${b}} = ${f}$`; }
    else if (mode === 2) { q = `áp suất của hệ tăng ${k} lần (giảm thể tích bình ${k} lần, nhiệt độ không đổi)`; f = k ** (a + b); w = [k, k ** a, k * (a + b), 1 / k ** (a + b), k ** (a + b + 1)]; ex = `Nồng độ mọi chất khí đều tăng ${k} lần: $v' / v = ${k}^{${a}}\\cdot ${k}^{${b}} = ${f}$`; }
    else { q = `nồng độ của ${m(A)} tăng ${x} lần và nồng độ của ${m(B)} giảm ${y} lần`; f = x ** a / y ** b; need(ok(f)); w = [x ** a * y ** b, x / y, x ** a, 1 / f, x ** b / y ** a]; ex = `$v' / v = \\dfrac{${x}^{${a}}}{${y}^{${b}}} = ${frac(x ** a, y ** b)}$`; }
    need(ok(f));
    return { stem: `Cho phản ứng đơn giản: ${eqT(e)}. Tốc độ phản ứng tuân theo định luật tác dụng khối lượng. Khi ${q} thì tốc độ phản ứng`,
      ...mcq(r, ft(f), w.filter(ok).map(ft)), explanation: `Biểu thức tốc độ: ${law}. ${ex} → tốc độ phản ứng ${ft(f)}.` };
  }),
  T("he-so-nhiet-do-van-t-hoff", C6, "Hệ số nhiệt độ Van't Hoff", 1, 3, "mcq", (r) => {
    const g = r.pick([2, 3, 4]), n = r.int(1, g === 2 ? 5 : 3), T1 = r.pick([20, 25, 30, 40, 50]), T2 = T1 + 10 * n, F = g ** n;
    const mode = r.int(0, 3), rule = `Quy tắc Van't Hoff: $\\dfrac{v_{2}}{v_{1}} = \\gamma^{\\frac{T_{2} - T_{1}}{10}}$.`;
    if (mode === 0) {
      return { stem: `Một phản ứng có hệ số nhiệt độ Van't Hoff $\\gamma = ${g}$. Khi tăng nhiệt độ từ ${T1} °C lên ${T2} °C thì tốc độ phản ứng tăng`,
        ...mcq(r, `${F} lần`, [g * n, g ** (n + 1), n ** g, g + n, 10 * n].filter((v) => v !== F && v > 1).map((v) => `${v} lần`)), explanation: `${rule} $\\dfrac{v_{2}}{v_{1}} = ${g}^{\\frac{${T2} - ${T1}}{10}} = ${g}^{${n}} = ${F}$.` };
    }
    if (mode === 1) {
      const t2 = r.pick([1, 2, 3, 4, 5, 6, 8, 10, 12, 15]), t1 = t2 * F; need(t1 <= 9999);
      const u = r.pick(["giây", "phút"]);
      return { stem: `Ở ${T1} °C, một phản ứng kết thúc sau ${t1} ${u}. Biết hệ số nhiệt độ của phản ứng là $\\gamma = ${g}$. Ở ${T2} °C, phản ứng đó kết thúc sau`,
        ...mcq(r, `${t2} ${u}`, [round(t1 / (g * n), 2), t1 * F, round(t1 / g ** (n + 1), 2), round(t1 / g, 2), round(t1 / n, 2)].filter((v) => v !== t2 && v > 0).map((v) => `${vn(v)} ${u}`)),
        explanation: `${rule} Tốc độ tăng $${g}^{${n}} = ${F}$ lần nên thời gian giảm ${F} lần: $t_{2} = \\dfrac{${t1}}{${F}} = ${t2}$ ${u}.` };
    }
    if (mode === 2) {
      const t2 = r.pick([2, 3, 4, 5, 6, 8, 10]), t1 = t2 * F;
      return { stem: `Ở ${T1} °C, một phản ứng xảy ra hết trong ${t1} giây; ở ${T2} °C, phản ứng đó xảy ra hết trong ${t2} giây. Hệ số nhiệt độ Van't Hoff của phản ứng là`,
        ...mcq(r, String(g), [2, 3, 4, 5, round(F / n, 2), n].filter((v) => v !== g).map((v) => vn(v))),
        explanation: `$\\dfrac{v_{2}}{v_{1}} = \\dfrac{t_{1}}{t_{2}} = \\dfrac{${t1}}{${t2}} = ${F} = \\gamma^{\\frac{${T2} - ${T1}}{10}} = \\gamma^{${n}}$ $\\Rightarrow \\gamma = ${g}$.` };
    }
    return { stem: `Một phản ứng có hệ số nhiệt độ $\\gamma = ${g}$, đang xảy ra ở ${T1} °C. Để tốc độ phản ứng tăng ${F} lần thì cần thực hiện phản ứng ở nhiệt độ`,
      ...mcq(r, `${T2} °C`, [T1 + 10 * round(F / g), T1 + F, T1 + 10 * (n + 1), T1 + 10 * n * g, T1 + 10 * (n - 1)].filter((v) => v !== T2 && v > T1).map((v) => `${v} °C`)),
      explanation: `${rule} $${g}^{\\frac{T_{2} - ${T1}}{10}} = ${F} = ${g}^{${n}}$ $\\Rightarrow T_{2} - ${T1} = ${10 * n}$ $\\Rightarrow T_{2} = ${T2}$ °C.` };
  }),
  T("short-toc-do-trung-binh", C6, "Tốc độ trung bình, nồng độ theo thời gian", 1, 2, "short", (r) => {
    const s = rateSetup(r);
    if (r.chance(0.5)) {
      const x = s.v * 1000; need(x >= 0.1 && x < 100 && exact(x, 2));
      return { stem: `Cho phản ứng: ${eqT(s.e)}. ${rsText(s)}. Tốc độ trung bình của phản ứng trong khoảng thời gian đó là $x\\cdot 10^{-3}$ mol/(L·s). Tìm x.`,
        ...short(x, 2), explanation: `${rsCalc(s)} $= ${tex(x, 2)}\\cdot 10^{-3}$ mol/(L·s) nên $x = ${tex(x, 2)}$.` };
    }
    need(s.R && exact(s.C2, 2) && s.C2 > 0);
    return { stem: `Cho phản ứng: ${eqT(s.e)}. Nồng độ ban đầu của ${m(s.f)} là ${vn(s.C1, 3)} M. Tốc độ trung bình của phản ứng trong ${s.dt} giây đầu là $${sciT(s.v)}$ mol/(L·s). Tính nồng độ mol của ${m(s.f)} sau ${s.dt} giây (làm tròn đến hàng phần trăm).`,
      ...short(s.C2, 2), explanation: `$\\bar{v} = -\\dfrac{1}{${s.c}}\\dfrac{\\Delta C}{\\Delta t}$ $\\Rightarrow$ $\\Delta C = ${s.c}\\cdot ${sciT(s.v)}\\cdot ${s.dt} = ${tex(s.dC, 3)}$ M. Nồng độ còn lại: $${tex(s.C1, 3)} - ${tex(s.dC, 3)} = ${tex(s.C2, 3)}$ M.` };
  }),
  T("short-van-t-hoff", C6, "Tính thời gian, nhiệt độ theo hệ số Van't Hoff", 1, 3, "short", (r) => {
    const g = r.pick([2, 2.5, 3, 4]), n = r.int(1, 4), T1 = r.pick([20, 25, 30, 40, 50, 60]), F = g ** n;
    const rule = `Quy tắc Van't Hoff: $\\dfrac{v_{2}}{v_{1}} = \\gamma^{\\frac{T_{2} - T_{1}}{10}}$; thời gian phản ứng tỉ lệ nghịch với tốc độ.`;
    const mode = r.int(0, 2);
    if (mode === 0) {
      const t2 = r.int(1, 30), t1 = t2 * F; need(Number.isInteger(t1) && t1 <= 9999);
      return { stem: `Ở ${T1} °C, một phản ứng kết thúc sau ${t1} giây. Hệ số nhiệt độ của phản ứng là ${vn(g)}. Hỏi ở ${T1 + 10 * n} °C phản ứng kết thúc sau bao nhiêu giây?`, ...short(t2, 0),
        explanation: `${rule} $\\dfrac{v_{2}}{v_{1}} = ${tex(g)}^{${n}} = ${tex(F, 4)}$ nên $t_{2} = \\dfrac{${t1}}{${tex(F, 4)}} = ${t2}$ giây.` };
    }
    if (mode === 1) {
      const t1 = r.int(2, 40), t2 = t1 * F; need(Number.isInteger(t2) && t2 <= 9999);
      return { stem: `Ở ${T1 + 10 * n} °C, một phản ứng kết thúc sau ${t1} phút. Hệ số nhiệt độ của phản ứng là ${vn(g)}. Hỏi ở ${T1} °C phản ứng kết thúc sau bao nhiêu phút?`, ...short(t2, 0),
        explanation: `${rule} Hạ nhiệt độ ${10 * n} °C thì tốc độ giảm $${tex(g)}^{${n}} = ${tex(F, 4)}$ lần nên thời gian tăng ${vn(F, 4)} lần: $t = ${t1}\\cdot ${tex(F, 4)} = ${t2}$ phút.` };
    }
    need(Number.isInteger(F));
    return { stem: `Một phản ứng có hệ số nhiệt độ bằng ${vn(g)}, đang xảy ra ở ${T1} °C. Cần thực hiện phản ứng ở nhiệt độ bao nhiêu °C để tốc độ phản ứng tăng ${F} lần?`, ...short(T1 + 10 * n, 0),
      explanation: `${rule} $${tex(g)}^{\\frac{T_{2} - ${T1}}{10}} = ${F} = ${tex(g)}^{${n}}$ $\\Rightarrow T_{2} = ${T1} + ${10 * n} = ${T1 + 10 * n}$ °C.` };
  }),
  T("tf-toc-do-phan-ung", C6, "Thí nghiệm về tốc độ phản ứng", 1, 2, "tf", (r) => {
    const X = r.pick([["Zn", "viên"], ["Fe", "viên"], ["Mg", "mảnh"], ["CaCO3", "viên"]]), V = r.pick([50, 100, 200]);
    const C1 = r.pick([1, 1.5, 2]), dC = r.pick([0.1, 0.2, 0.25, 0.4, 0.5]), dt = r.pick([20, 40, 50, 100]);
    const v = dC / (2 * dt); need(exact(v, 6));
    const g = r.pick([2, 3]), n = r.int(1, 3), T1 = r.pick([20, 25, 30]), F = g ** n;
    const prod = X[0] === "CaCO3" ? `${m("CaCl2")}, ${m("CO2")} và ${m("H2O")}` : `${m(saltCl(X[0], 2))} và ${m("H2")}`;
    return { stem: `Cho ${X[0] === "CaCO3" ? "đá vôi " : ""}${m(X[0])} dạng ${X[1]} vào ${V} mL dung dịch ${m("HCl")} ${vn(C1)} M ở ${T1} °C, tạo thành ${prod}. Sau ${dt} giây, nồng độ ${m("HCl")} giảm ${vn(dC)} M. Biết hệ số nhiệt độ của phản ứng là ${g}.`, ...tf([
      st(r.chance(0.5), `Thay ${m(X[0])} dạng ${X[1]} bằng ${m(X[0])} dạng bột (cùng khối lượng) thì tốc độ phản ứng tăng.`, `Thay ${m(X[0])} dạng ${X[1]} bằng ${m(X[0])} dạng bột (cùng khối lượng) thì tốc độ phản ứng giảm.`),
      st(r.chance(0.5), `Pha loãng dung dịch ${m("HCl")} bằng nước thì tốc độ phản ứng giảm.`, `Pha loãng dung dịch ${m("HCl")} bằng nước thì tốc độ phản ứng tăng.`),
      st(r.chance(0.5), `Tốc độ trung bình của phản ứng trong ${dt} giây đầu là $${sciT(v)}$ mol/(L·s).`, `Tốc độ trung bình của phản ứng trong ${dt} giây đầu là $${sciT(2 * v)}$ mol/(L·s).`),
      st(r.chance(0.5), `Nếu thực hiện ở ${T1 + 10 * n} °C thì tốc độ phản ứng tăng ${F} lần.`, `Nếu thực hiện ở ${T1 + 10 * n} °C thì tốc độ phản ứng tăng ${g * n === F ? F * g : g * n} lần.`),
    ]), explanation: `Dạng bột có diện tích bề mặt tiếp xúc lớn hơn nên phản ứng nhanh hơn; pha loãng làm giảm nồng độ nên phản ứng chậm hơn. ${m("HCl")} có hệ số 2 trong phương trình nên $\\bar{v} = \\dfrac{1}{2}\\cdot\\dfrac{${tex(dC)}}{${dt}} = ${sciT(v)}$ mol/(L·s). Theo Van't Hoff: $\\dfrac{v_{2}}{v_{1}} = ${g}^{${n}} = ${F}$.` };
  }),
];

/* ======================= HALF 2 – CHƯƠNG 7 ======================= */
const X2 = (h: Hal) => m(`${h.s}2`);
const H7: Template[] = [
  T("halogen-trang-thai-mau-sac", C7, "Trạng thái, màu sắc của đơn chất halogen", 2, 1, "mcq", (r) => {
    const F = HAL[0], Cl = HAL[1], Br = HAL[2], I = HAL[3];
    const items: (() => [string, string, string[], string])[] = [
      () => ["Ở điều kiện thường, đơn chất halogen tồn tại ở thể lỏng là", X2(Br), [X2(F), X2(Cl), X2(I)], "Ở điều kiện thường: fluorine, chlorine là chất khí; bromine là chất lỏng; iodine là chất rắn."],
      () => ["Ở điều kiện thường, đơn chất halogen tồn tại ở thể rắn là", X2(I), [X2(F), X2(Cl), X2(Br)], "Ở điều kiện thường: fluorine, chlorine là chất khí; bromine là chất lỏng; iodine là chất rắn."],
      () => ["Đơn chất halogen dễ thăng hoa khi đun nóng là", X2(I), [X2(F), X2(Cl), X2(Br)], "Iodine là chất rắn, khi đun nóng dễ thăng hoa thành hơi màu tím."],
      () => ["Đơn chất halogen tạo với hồ tinh bột hợp chất màu xanh tím là", X2(I), [X2(F), X2(Cl), X2(Br)], "Iodine tạo với hồ tinh bột hợp chất có màu xanh tím (dùng để nhận biết iodine)."],
      () => [r.pick(["Đơn chất halogen có tính oxi hóa mạnh nhất là", "Trong các đơn chất halogen, chất oxi hóa mạnh nhất là"]), X2(F), [X2(Cl), X2(Br), X2(I)], "Tính oxi hóa giảm dần từ fluorine đến iodine."],
      () => { const h = r.pick(HAL); return [`Ở điều kiện thường, đơn chất halogen có màu ${h.col} là`, X2(h), HAL.filter((y) => y !== h).map(X2), `${cap(h.name)} (${X2(h)}) là chất ${h.st}, màu ${h.col}.`]; },
      () => { const h = r.pick(HAL); const d = (y: Hal) => `chất ${y.st}, màu ${y.col}`; const wr = [...HAL.filter((y) => y !== h).map(d), `chất ${h.st === "khí" ? "lỏng" : "khí"}, màu ${h.col}`];
        return [`Ở điều kiện thường, ${h.name} (${X2(h)}) là`, d(h), wr, `${cap(h.name)} là ${d(h)}.`]; },
    ];
    const [s, c, w, ex] = r.pick(items)();
    return { stem: s, ...mcq(r, c, pickN(r, w, 3)), explanation: ex };
  }),
  T("halogen-cau-hinh-so-oxi-hoa", C7, "Cấu hình electron, số oxi hóa của halogen", 2, 1, "mcq", (r) => {
    const mode = r.int(0, 2);
    if (mode === 0) {
      const h = r.pick(HAL), n = h.per;
      return { stem: `Nguyên tử ${h.name} (Z = ${h.z}) có cấu hình electron lớp ngoài cùng là`, ...mcq(r, `$${n}s^{2}${n}p^{5}$`, [`$${n}s^{2}${n}p^{6}$`, `$${n}s^{2}${n}p^{4}$`, `$${n + 1}s^{2}${n + 1}p^{5}$`, `$${n}s^{1}${n}p^{6}$`, `$${n - 1}s^{2}${n - 1}p^{5}$`]),
        explanation: `${cap(h.name)} thuộc chu kì ${n}, nhóm VIIA nên lớp ngoài cùng có 7 electron: $${n}s^{2}${n}p^{5}$.` };
    }
    if (mode === 1) {
      const sp = r.pick(["NaClO", "KClO3", "HClO4", "HClO2", "Cl2O", "Cl2O7", "KBrO3", "HBrO", "KIO3", "HIO4", "NaIO3", "HClO", "CaCl2", "KBr", "NaI"]);
      const el = sp.includes("Br") ? "Br" : sp.includes("I") && !sp.includes("Cl") ? "I" : "Cl";
      const v = (() => { const a = atoms(sp); let s = 0; for (const [k, c] of Object.entries(a)) if (k !== el) s += c * (k === "O" ? -2 : k === "H" ? 1 : k === "Ca" ? 2 : 1); return -s / a[el]; })();
      return { stem: `Số oxi hóa của ${el} trong ${m(sp)} là`, ...mcq(r, onT(v), [-1, 1, 3, 5, 7, 0].filter((x) => x !== v).slice(0, 5).map(onT)),
        explanation: `Trong ${m(sp)}: H là +1, O là −2, kim loại kiềm là +1, Ca là +2; tổng số oxi hóa bằng 0 nên ${el} có số oxi hóa ${onT(v)}.` };
    }
    const it = r.pick([
      ["Trong các hợp chất, fluorine chỉ có số oxi hóa là", "$-1$", ["$+1$", "$-1, +1, +3, +5, +7$", "$+7$"], "Fluorine có độ âm điện lớn nhất nên trong hợp chất chỉ có số oxi hóa −1."],
      ["Khi tham gia phản ứng, nguyên tử halogen có xu hướng", "nhận thêm 1 electron", ["nhường 7 electron", "nhường 1 electron", "nhận thêm 2 electron"], "Nguyên tử halogen có 7 electron lớp ngoài cùng nên dễ nhận thêm 1 electron để đạt cấu hình bền của khí hiếm."],
      ["Số electron lớp ngoài cùng của nguyên tử các nguyên tố nhóm VIIA là", "7", ["5", "6", "8"], "Các halogen có cấu hình electron lớp ngoài cùng $ns^{2}np^{5}$ (7 electron)."],
      ["Trong hợp chất, chlorine có thể có các số oxi hóa là", "$-1, +1, +3, +5, +7$", ["chỉ có $-1$", "$-2, +4, +6$", "$-3, +3, +5$"], "Ngoài số oxi hóa −1, chlorine (có phân lớp d trống) còn có các số oxi hóa +1, +3, +5, +7 trong hợp chất với oxygen."],
    ] as [string, string, string[], string][]);
    return { stem: it[0], ...mcq(r, it[1], it[2]), explanation: it[3] };
  }),
  T("halogen-xu-huong-bien-doi", C7, "Xu hướng biến đổi tính chất trong nhóm VIIA", 2, 2, "mcq", (r) => {
    const P: [string, number[], (h: Hal) => string, string][] = [
      ["tính oxi hóa của các đơn chất", [4, 3, 2, 1], X2, "Từ fluorine đến iodine, tính oxi hóa của đơn chất giảm dần."],
      ["độ âm điện", [4, 3, 2, 1], (h) => h.s, "Từ F đến I, độ âm điện giảm dần."],
      ["bán kính nguyên tử", [1, 2, 3, 4], (h) => h.s, "Từ F đến I, số lớp electron tăng nên bán kính nguyên tử tăng."],
      ["nhiệt độ sôi của các đơn chất", [1, 2, 3, 4], X2, "Từ F₂ đến I₂, khối lượng phân tử tăng, tương tác van der Waals tăng nên nhiệt độ sôi tăng.".replace("F₂", m("F2")).replace("I₂", m("I2"))],
      ["tính acid của các dung dịch hydrohalic acid", [1, 2, 3, 4], (h) => m(`H${h.s}`), "Tính acid tăng dần: HF < HCl < HBr < HI (liên kết H–X kém bền dần)."],
      ["tính khử của các hydrogen halide", [1, 2, 3, 4], (h) => m(`H${h.s}`), "Tính khử của HX (ion halide) tăng dần từ HF đến HI."],
      ["độ bền liên kết H–X trong các hydrogen halide", [4, 3, 2, 1], (h) => m(`H${h.s}`), "Bán kính X tăng nên liên kết H–X kém bền dần từ HF đến HI."],
      ["nhiệt độ sôi của các hydrogen halide", [4, 1, 2, 3], (h) => m(`H${h.s}`), "Từ HCl đến HI nhiệt độ sôi tăng theo khối lượng phân tử; riêng HF có liên kết hydrogen giữa các phân tử nên sôi cao bất thường (cao nhất)."],
    ];
    const [pn, vals, show, ex] = r.pick(P), k = r.pick([3, 4]);
    const idx = pickN(r, [0, 1, 2, 3], k).sort();
    const inc = r.chance(0.5), ord = [...idx].sort((a, b) => (inc ? vals[a] - vals[b] : vals[b] - vals[a]));
    const T4 = (o: number[]) => o.map((i) => show(HAL[i])).join(", ");
    const w = [T4([...ord].reverse()), ...r.shuffle(perms(ord).map(T4))];
    return { stem: `Dãy nào sau đây được sắp xếp theo chiều ${pn} ${inc ? "tăng" : "giảm"} dần?`, ...mcq(r, T4(ord), w), explanation: `${ex} Vậy theo chiều ${pn} ${inc ? "tăng" : "giảm"} dần: ${T4(ord)}.` };
  }),
  T("halogen-tinh-chat-don-chat", C7, "Tính chất hóa học của đơn chất halogen", 2, 2, "mcq", (r) => {
    const Mx = r.pick(["Fe", "Al", "Cu", "Na", "Mg", "Zn"]), v = Mx === "Fe" || Mx === "Al" ? 3 : MET[Mx][1];
    const items: [string, string, string[], string][] = [
      [`Đốt nóng ${MET[Mx][2]} (${m(Mx)}) trong khí chlorine dư, sản phẩm thu được là`, m(saltCl(Mx, v)), Mx === "Fe" ? [m("FeCl2"), `${m("FeCl2")} và ${m("FeCl3")}`, m("Fe2Cl3")] : [m(saltCl(Mx, v === 1 ? 2 : 1)), m(saltCl(Mx, v === 3 ? 2 : 3)), `${m(saltCl(Mx, v))} và ${m("H2")}`],
        `Chlorine là chất oxi hóa mạnh, oxi hóa kim loại lên số oxi hóa cao: ${Mx === "Fe" ? eqT("2Fe + 3Cl2 => 2FeCl3") : `sản phẩm là ${m(saltCl(Mx, v))}`}.`],
      ["Dẫn khí chlorine vào dung dịch NaOH ở nhiệt độ thường, sản phẩm thu được là", `${m("NaCl")}, ${m("NaClO")}, ${m("H2O")}`, [`${m("NaCl")}, ${m("NaClO3")}, ${m("H2O")}`, `${m("NaClO")}, ${m("H2")}`, `${m("NaCl")}, ${m("H2O")}, ${m("O2")}`], `Ở nhiệt độ thường: ${eqT("Cl2 + 2NaOH -> NaCl + NaClO + H2O")} (nước Javel).`],
      ["Dẫn khí chlorine vào dung dịch KOH đặc, đun nóng ở khoảng 70 °C, sản phẩm thu được là", `${m("KCl")}, ${m("KClO3")}, ${m("H2O")}`, [`${m("KCl")}, ${m("KClO")}, ${m("H2O")}`, `${m("KClO3")}, ${m("H2")}`, `${m("KCl")}, ${m("H2O")}, ${m("O2")}`], `Khi đun nóng: ${eqT("3Cl2 + 6KOH => 5KCl + KClO3 + 3H2O")}.`],
      ["Khi hòa tan chlorine vào nước, một phần chlorine phản ứng tạo thành", `${m("HCl")} và ${m("HClO")}`, [`${m("HCl")} và ${m("O2")}`, `${m("HClO3")} và ${m("H2")}`, `${m("HClO4")} và ${m("HCl")}`], "$\\mathrm{Cl_{2} + H_{2}O \\rightleftharpoons HCl + HClO}$ (phản ứng thuận nghịch)."],
      ["Đơn chất halogen phản ứng với hydrogen gây nổ mạnh ngay cả trong bóng tối, ở nhiệt độ rất thấp là", X2(HAL[0]), [X2(HAL[1]), X2(HAL[2]), X2(HAL[3])], "Fluorine có tính oxi hóa mạnh nhất, phản ứng nổ với hydrogen ngay ở −252 °C trong bóng tối; chlorine cần chiếu sáng; bromine, iodine cần đun nóng."],
      ["Đơn chất halogen phản ứng mãnh liệt với nước, giải phóng khí oxygen là", X2(HAL[0]), [X2(HAL[1]), X2(HAL[2]), X2(HAL[3])], `${eqT("2F2 + 2H2O -> 4HF + O2")}.`],
      [`Trong phản ứng ${eqT("Cl2 + 2NaOH -> NaCl + NaClO + H2O")}, chlorine đóng vai trò`, "vừa là chất oxi hóa, vừa là chất khử", ["chỉ là chất oxi hóa", "chỉ là chất khử", "không là chất oxi hóa, không là chất khử"], "Cl từ 0 xuống −1 (trong NaCl) và lên +1 (trong NaClO) nên chlorine vừa là chất oxi hóa vừa là chất khử."],
      ["Phản ứng giữa hydrogen và chlorine xảy ra khi", "chiếu sáng hoặc đốt nóng hỗn hợp", ["để hỗn hợp trong bóng tối ở −252 °C", "chỉ khi có xúc tác Pt", "không thể xảy ra ở bất kì điều kiện nào"], `${eqT("H2 + Cl2 -> 2HCl")} xảy ra khi chiếu sáng (ánh sáng mặt trời) hoặc đốt nóng.`],
    ];
    const [s, c, w, ex] = r.pick(items);
    return { stem: s, ...mcq(r, c, w), explanation: ex };
  }),
  T("halogen-day-nhau", C7, "Halogen mạnh đẩy halogen yếu khỏi dung dịch muối", 2, 2, "mcq", (r) => {
    const cat = r.pick(["Na", "K"]), ion = ["Cl", "Br", "I"];
    const salt = (y: string) => m(`${cat}${y}`), rx = (x: string, y: string) => `$\\mathrm{${x}_{2} + 2${cat}${y} \\rightarrow}$`;
    const mode = r.int(0, 2);
    if (mode === 0) {
      const x = r.pick(["Cl", "Br"]), goods = ion.filter((y) => ion.indexOf(y) > ion.indexOf(x)), good = r.pick(goods);
      const bad = ["F", ...ion.filter((y) => ion.indexOf(y) <= ion.indexOf(x))].map((y) => salt(y));
      return { stem: `Cho ${hal(x).name} (${m(x + "2")}) vào dung dịch muối ${cat === "Na" ? "sodium" : "potassium"} halide nào sau đây thì xảy ra phản ứng?`, ...mcq(r, salt(good), [...bad, ...(bad.length < 3 ? [m(`${cat}NO3`)] : [])]),
        explanation: `Halogen có tính oxi hóa mạnh hơn đẩy halogen yếu hơn ra khỏi dung dịch muối (tính oxi hóa: $\\mathrm{Cl_{2} > Br_{2} > I_{2}}$): ${eqT(`${x}2 + 2${cat}${good} -> 2${cat}${x} + ${good}2`)}.` };
    }
    if (mode === 1) {
      const pairs: [string, string][] = [["Cl", "Br"], ["Cl", "I"], ["Br", "I"], ["Br", "Cl"], ["I", "Cl"], ["I", "Br"]];
      const occ = (p: [string, string]) => ion.indexOf(p[0]) < ion.indexOf(p[1]);
      const yes = r.chance(0.5), good = r.pick(pairs.filter((p) => occ(p) === yes)), w = pairs.filter((p) => occ(p) !== yes);
      return { stem: `Cho đơn chất halogen vào dung dịch muối ${cat === "Na" ? "sodium" : "potassium"} halide. Phản ứng nào sau đây ${yes ? "" : "không "}xảy ra?`.replace("  ", " "), ...mcq(r, rx(...good), w.map((p) => rx(...p))),
        explanation: `Tính oxi hóa: $\\mathrm{Cl_{2} > Br_{2} > I_{2}}$; halogen mạnh hơn mới đẩy được halogen yếu hơn ra khỏi dung dịch muối. ${yes ? `${eqT(`${good[0]}2 + 2${cat}${good[1]} -> 2${cat}${good[0]} + ${good[1]}2`)} xảy ra.` : `${m(good[0] + "2")} yếu hơn ${m(good[1] + "2")} nên không phản ứng với ${salt(good[1])}.`}` };
    }
    const x = r.pick(["Cl", "Br"]);
    return { stem: `Cho ${x === "Cl" ? "nước chlorine" : "nước bromine"} vào ống nghiệm chứa dung dịch ${salt("I")}, sau đó nhỏ thêm vài giọt hồ tinh bột. Hiện tượng quan sát được là`,
      ...mcq(r, "dung dịch chuyển sang màu xanh tím", ["xuất hiện kết tủa màu trắng", "có khí màu vàng lục thoát ra", "dung dịch không đổi màu", "xuất hiện kết tủa màu vàng"]),
      explanation: `${eqT(`${x}2 + 2${cat}I -> 2${cat}${x} + I2`)}; iodine sinh ra tạo với hồ tinh bột hợp chất màu xanh tím.` };
  }),
  T("hydrohalic-acid", C7, "Hydrogen halide và hydrohalic acid", 2, 1, "mcq", (r) => {
    const items: (() => [string, string, string[], string])[] = [
      () => [r.pick(["Hydrohalic acid được dùng để khắc chữ, khắc hoa văn lên thủy tinh là", "Dung dịch acid nào sau đây ăn mòn được thủy tinh?"]), m("HF"), [m("HCl"), m("HBr"), m("HI")], `${eqT("SiO2 + 4HF -> SiF4 + 2H2O")}: HF hòa tan $\\mathrm{SiO_{2}}$ có trong thủy tinh.`],
      () => [r.pick(["Trong dung dịch nước, hydrohalic acid có tính acid yếu là", "Dãy HF, HCl, HBr, HI: acid yếu nhất là"]), m("HF"), [m("HCl"), m("HBr"), m("HI")], "HF là acid yếu (liên kết H–F rất bền); HCl, HBr, HI là các acid mạnh, tính acid tăng từ HCl đến HI."],
      () => { const g = r.pick(["Cu", "Ag"]); return [`Kim loại nào sau đây không tác dụng với dung dịch ${m("HCl")} loãng?`, m(g), pickN(r, ["Fe", "Zn", "Mg", "Al"], 3).map(m), `${m(g)} đứng sau hydrogen trong dãy hoạt động hóa học nên không tác dụng với dung dịch HCl loãng.`]; },
      () => [`Cho ${m("Fe")} tác dụng với dung dịch ${m("HCl")} dư, sản phẩm thu được là`, `${m("FeCl2")} và ${m("H2")}`, [`${m("FeCl3")} và ${m("H2")}`, `${m("FeCl2")} và ${m("Cl2")}`, `${m("FeCl3")} và ${m("H2O")}`], `${eqT("Fe + 2HCl -> FeCl2 + H2")}: ion $\\mathrm{H^{+}}$ chỉ oxi hóa Fe lên +2.`],
      () => [`Trong phản ứng ${eqT("MnO2 + 4HCl => MnCl2 + Cl2 + 2H2O")}, ${m("HCl")} thể hiện`, "tính khử và tính acid (môi trường)", ["chỉ tính oxi hóa", "tính oxi hóa và tính acid", "chỉ tính base"], "2 phân tử HCl bị oxi hóa thành $\\mathrm{Cl_{2}}$ (Cl: −1 → 0, tính khử), 2 phân tử HCl tạo muối $\\mathrm{MnCl_{2}}$ (tính acid)."],
      () => [`Trong phản ứng ${eqT("Zn + 2HCl -> ZnCl2 + H2")}, ${m("HCl")} đóng vai trò`, "chất oxi hóa", ["chất khử", "vừa là chất oxi hóa, vừa là chất khử", "môi trường, không thay đổi số oxi hóa"], "H từ +1 xuống 0 nên HCl là chất oxi hóa."],
      () => { const g = r.pick(["CaCO3", "Na2CO3", "NaHCO3"]); return [`Chất nào sau đây tác dụng với dung dịch ${m("HCl")} giải phóng khí ${m("CO2")}?`, m(g), [m("CuO"), m("NaOH"), m("AgNO3"), m("Fe(OH)3")], `Muối carbonate tác dụng với HCl giải phóng $\\mathrm{CO_{2}}$, ví dụ ${eqT(g === "CaCO3" ? "CaCO3 + 2HCl -> CaCl2 + CO2 + H2O" : g === "Na2CO3" ? "Na2CO3 + 2HCl -> 2NaCl + CO2 + H2O" : "NaHCO3 + HCl -> NaCl + CO2 + H2O")}.`]; },
      () => [r.pick(["Ở điều kiện thường, các hydrogen halide (HF, HCl, HBr, HI) đều là", "Hydrogen chloride ở điều kiện thường là"]), "chất khí, tan nhiều trong nước", ["chất lỏng, không tan trong nước", "chất rắn, tan ít trong nước", "chất khí, không tan trong nước"], "Ở điều kiện thường các hydrogen halide là chất khí, tan rất nhiều trong nước tạo thành dung dịch hydrohalic acid."],
    ];
    const [s, c, w, ex] = r.pick(items)();
    return { stem: s, ...mcq(r, c, pickN(r, w, 3)), explanation: ex };
  }),
  T("nhan-biet-ion-halide", C7, "Nhận biết ion halide bằng dung dịch silver nitrate", 2, 1, "mcq", (r) => {
    const cat = r.pick(["Na", "K"]), COL = HAL.map((h) => h.ag), mode = r.int(0, 2);
    if (mode === 0) {
      const h = r.pick(HAL);
      return { stem: `Nhỏ dung dịch ${m("AgNO3")} vào dung dịch ${m(cat + h.s)}, hiện tượng quan sát được là`, ...mcq(r, h.ag, [...COL.filter((c) => c !== h.ag), "kết tủa màu đen"].slice(0, 3)),
        explanation: `AgF tan trong nước; AgCl kết tủa trắng, AgBr kết tủa vàng nhạt, AgI kết tủa vàng. Với ${m(cat + h.s)}: ${h.ag}.` };
    }
    if (mode === 1) {
      const h = r.pick(HAL.slice(1));
      return { stem: `Dung dịch muối X tác dụng với dung dịch ${m("AgNO3")} tạo ${h.ag}. X có thể là`, ...mcq(r, m(cat + h.s), HAL.filter((y) => y !== h).map((y) => m(cat + y.s))),
        explanation: `${eqT(`AgNO3 + ${cat}${h.s} -> Ag${h.s} + ${cat}NO3`)}; ${m("Ag" + h.s)} là ${h.ag.replace("kết tủa ", "kết tủa ")}.` };
    }
    const it = r.pick([
      [`Thuốc thử dùng để phân biệt ba dung dịch ${m(cat + "Cl")}, ${m(cat + "Br")}, ${m(cat + "I")} đựng trong ba lọ mất nhãn là`, `dung dịch ${m("AgNO3")}`, [`quỳ tím`, `dung dịch ${m("NaOH")}`, `dung dịch ${m("HCl")}`], "Dùng AgNO3: tạo kết tủa trắng (AgCl), vàng nhạt (AgBr), vàng (AgI)."],
      [`Dung dịch muối nào sau đây không tạo kết tủa khi tác dụng với dung dịch ${m("AgNO3")}?`, m(cat + "F"), [m(cat + "Cl"), m(cat + "Br"), m(cat + "I")], "AgF tan trong nước nên dung dịch fluoride không tạo kết tủa với AgNO3."],
    ] as [string, string, string[], string][]);
    return { stem: it[0], ...mcq(r, it[1], it[2]), explanation: it[3] };
  }),
  T("dieu-che-ung-dung-halogen", C7, "Điều chế và ứng dụng của halogen, hợp chất", 2, 1, "mcq", (r) => {
    const items: (() => [string, string, string[], string])[] = [
      () => { const g = r.pick(["MnO2", "KMnO4"]); return [`Trong phòng thí nghiệm, khí chlorine được điều chế bằng cách cho dung dịch ${m("HCl")} đặc tác dụng với`, m(g), [m("NaCl"), m("Zn"), m("CaCO3"), m("CuO")], `Dùng chất oxi hóa mạnh như $\\mathrm{MnO_{2}}$, $\\mathrm{KMnO_{4}}$ oxi hóa HCl đặc thành $\\mathrm{Cl_{2}}$.`]; },
      () => ["Trong công nghiệp, chlorine được sản xuất bằng phương pháp", "điện phân dung dịch NaCl bão hòa có màng ngăn", ["điện phân dung dịch NaCl không có màng ngăn", "cho HCl đặc tác dụng với MnO₂", "nhiệt phân NaCl ở nhiệt độ cao"].map((s) => s.replace("MnO₂", m("MnO2"))), `${eqT("2NaCl + 2H2O -> 2NaOH + H2 + Cl2")} (điện phân có màng ngăn).`],
      () => ["Nước Javel (dùng để tẩy màu, sát khuẩn) có thành phần chính là", `${m("NaCl")} và ${m("NaClO")}`, [`${m("NaCl")} và ${m("NaClO3")}`, `${m("HCl")} và ${m("HClO")}`, `${m("NaCl")} và ${m("NaOH")}`], `Nước Javel được tạo thành khi cho chlorine tác dụng với dung dịch NaOH ở nhiệt độ thường: ${eqT("Cl2 + 2NaOH -> NaCl + NaClO + H2O")}.`],
      () => [r.pick(["Chất khí được dùng để khử trùng nước sinh hoạt là", "Trong các nhà máy nước, chất thường được dùng để sát khuẩn nước là"]), m("Cl2"), [m("O2"), m("CO2"), m("N2"), m("H2")], "Chlorine (lượng nhỏ) được dùng để khử trùng nước sinh hoạt nhờ tính oxi hóa mạnh của HClO tạo thành."],
      () => { const g = r.pick(["KI", "KIO3"]); return [`Muối iodine (muối ăn có bổ sung iodine) có trộn thêm một lượng nhỏ hợp chất nào sau đây?`, m(g), [m("KBr"), m("NaF"), m("KClO3"), m("AgBr")], `Muối iodine là muối ăn có trộn thêm một lượng nhỏ $\\mathrm{KI}$ hoặc $\\mathrm{KIO_{3}}$ để phòng bệnh bướu cổ.`]; },
      () => [r.pick(["Hợp chất được thêm vào kem đánh răng giúp chống sâu răng là", "Kem đánh răng chứa hợp chất của fluorine để bảo vệ men răng, đó là"]), m("NaF"), [m("NaCl"), m("NaBr"), m("KI")], "NaF (hoặc SnF₂) trong kem đánh răng giúp tăng độ bền men răng.".replace("SnF₂", m("SnF2"))],
      () => ["Hợp chất nhạy cảm với ánh sáng, từng được dùng để tráng phim ảnh là", m("AgBr"), [m("AgCl"), m("NaBr"), m("AgNO3")], "AgBr bị phân hủy khi chiếu sáng: $\\mathrm{2AgBr \\rightarrow 2Ag + Br_{2}}$ nên được dùng làm phim ảnh."],
      () => [`Trong phòng thí nghiệm, khí ${m("HCl")} được điều chế bằng cách`, `cho ${m("NaCl")} rắn tác dụng với ${m("H2SO4")} đặc, đun nóng`, [`cho dung dịch ${m("NaCl")} tác dụng với dung dịch ${m("H2SO4")} loãng`, `điện phân dung dịch ${m("NaCl")}`, `cho ${m("NaCl")} rắn tác dụng với dung dịch ${m("NaOH")}`], `${eqT("NaCl + H2SO4 => NaHSO4 + HCl")} (phương pháp sulfate).`],
    ];
    const [s, c, w, ex] = r.pick(items)();
    return { stem: s, ...mcq(r, c, pickN(r, w, 3)), explanation: ex };
  }),
  T("tim-kim-loai-tac-dung-hcl", C7, "Xác định kim loại tác dụng với hydrochloric acid", 2, 3, "mcq", (r) => {
    const LIST = ["Mg", "Ca", "Fe", "Zn", "Ba"], s = r.pick(LIST), [M, , name] = MET[s], nH = r.int(1, 8) * 0.05, mass = round(nH * M, 3), V = nH * VM;
    const cho = `Cho nguyên tử khối: ${LIST.map((x) => `${x} = ${MET[x][0]}`).join("; ")}; Cl = 35,5.`;
    if (r.chance(0.5)) {
      return { stem: `Hòa tan hoàn toàn ${vn(mass, 3)} gam kim loại M (hóa trị II) trong dung dịch ${m("HCl")} dư, thu được ${vn(V, 4)} lít khí ${m("H2")} (đkc). ${cho} ${VMT} Kim loại M là`,
        ...mcq(r, `${name} (${s})`, LIST.filter((x) => x !== s).map((x) => `${MET[x][2]} (${x})`)),
        explanation: `$\\mathrm{M + 2HCl \\rightarrow MCl_{2} + H_{2}}$. $n_{\\mathrm{H_{2}}} = \\dfrac{${tex(V, 4)}}{24{,}79} = ${tex(nH)}$ mol $= n_{\\mathrm{M}}$ $\\Rightarrow M = \\dfrac{${tex(mass, 3)}}{${tex(nH)}} = ${M}$: ${name}.` };
    }
    const ms = round(nH * (M + 71), 3);
    return { stem: `Hòa tan hoàn toàn ${vn(mass, 3)} gam kim loại M (hóa trị II) trong dung dịch ${m("HCl")} vừa đủ, cô cạn dung dịch thu được ${vn(ms, 3)} gam muối khan. ${cho} Kim loại M là`,
      ...mcq(r, `${name} (${s})`, LIST.filter((x) => x !== s).map((x) => `${MET[x][2]} (${x})`)),
      explanation: `$\\mathrm{M \\rightarrow MCl_{2}}$: khối lượng tăng $m_{\\mathrm{Cl}} = ${tex(ms, 3)} - ${tex(mass, 3)} = ${tex(ms - mass, 3)}$ gam, $n_{\\mathrm{M}} = \\dfrac{${tex(ms - mass, 3)}}{71} = ${tex(nH)}$ mol $\\Rightarrow M = \\dfrac{${tex(mass, 3)}}{${tex(nH)}} = ${M}$: ${name}.` };
  }),
  T("tim-halogen", C7, "Xác định halogen từ dữ kiện phản ứng", 2, 3, "mcq", (r) => {
    const h = r.pick(HAL.slice(1)), opts = HAL.map((y) => `${y.name} (${y.s})`), right = `${h.name} (${h.s})`;
    if (r.chance(0.5)) {
      const cat = r.pick(["Na", "K"]), Mc = MET[cat][0], n = r.int(2, 20) * 0.01, m1 = round(n * (Mc + h.M), 4), m2 = round(n * (108 + h.M), 4);
      return { stem: `Cho dung dịch chứa ${vn(m1, 4)} gam muối ${cat}X (X là halogen) tác dụng với dung dịch ${m("AgNO3")} dư, thu được ${vn(m2, 4)} gam kết tủa. Cho ${cat} = ${Mc}; Ag = 108; F = 19; Cl = 35,5; Br = 80; I = 127. X là`,
        ...mcq(r, right, opts.filter((o) => o !== right)),
        explanation: `$\\mathrm{${cat}X + AgNO_{3} \\rightarrow AgX + ${cat}{NO_{3}}}$. 1 mol ${cat}X chuyển thành 1 mol AgX thì khối lượng tăng $108 - ${Mc} = ${108 - Mc}$ gam; $n = \\dfrac{${tex(m2, 4)} - ${tex(m1, 4)}}{${108 - Mc}} = ${tex(n)}$ mol. $M_{\\mathrm{${cat}X}} = \\dfrac{${tex(m1, 4)}}{${tex(n)}} = ${tex(Mc + h.M, 1)}$ $\\Rightarrow X = ${tex(h.M, 1)}$: ${h.name}. (AgF tan nên X không thể là fluorine.)` };
    }
    const s = r.pick(["Mg", "Ca", "Zn", "Al", "Na"]), [M, v, name] = MET[s], nm = r.int(1, 10) * 0.02, mM = round(nm * M, 3), ms = round(nm * (M + v * h.M), 3);
    return { stem: `Cho ${vn(mM, 3)} gam ${name} (${s}) tác dụng hết với đơn chất halogen $\\mathrm{X_{2}}$ dư, thu được ${vn(ms, 3)} gam muối. Cho ${s} = ${M}; F = 19; Cl = 35,5; Br = 80; I = 127. Halogen X là`,
      ...mcq(r, right, opts.filter((o) => o !== right)),
      explanation: `$n_{\\mathrm{${s}}} = \\dfrac{${tex(mM, 3)}}{${M}} = ${tex(nm)}$ mol; muối $\\mathrm{${s}X${v > 1 ? `_{${v}}` : ""}}$ nên $n_{\\mathrm{X}} = ${v}\\cdot ${tex(nm)} = ${tex(v * nm)}$ mol. $M_{\\mathrm{X}} = \\dfrac{${tex(ms, 3)} - ${tex(mM, 3)}}{${tex(v * nm)}} = ${tex(h.M, 1)}$: ${h.name}.` };
  }),
  T("khoi-luong-muoi-kim-loai-chlorine", C7, "Kim loại tác dụng với chlorine", 2, 2, "mcq", (r) => {
    const s = r.pick(["Fe", "Al", "Cu", "Mg", "Zn", "Na"]), [M, v0, name] = MET[s], v = s === "Fe" ? 3 : v0, salt = saltCl(s, v), Ms = M + 35.5 * v;
    const n = r.int(1, 10) * (v === 3 ? 0.02 : 0.05), mM = round(n * M, 3), mS = round(n * Ms, 3), K = (x: number) => `${vn(x, 3)} gam`;
    const w = [n * (M + 35.5 * (v === 3 ? 2 : v === 2 ? 1 : 2)), n * (M + 35.5), n * (M + 71 * v), mM + 71 * n, n * Ms * 2].map((x) => round(x, 3)).filter((x) => x !== mS);
    return { stem: `Đốt cháy hoàn toàn ${vn(mM, 3)} gam ${name} (${s}) trong khí chlorine dư. Khối lượng muối thu được là (cho ${s} = ${M}; Cl = 35,5)`,
      ...mcq(r, K(mS), w.map(K)), explanation: `${eqT(v === 3 ? `2${s} + 3Cl2 => 2${salt}` : v === 1 ? `2${s} + Cl2 => 2${salt}` : `${s} + Cl2 => ${salt}`)}. $n_{\\mathrm{${mf(salt)}}} = n_{\\mathrm{${s}}} = \\dfrac{${tex(mM, 3)}}{${M}} = ${tex(n)}$ mol; $m = ${tex(n)}\\cdot ${tex(Ms, 1)} = ${tex(mS, 3)}$ gam.` };
  }),
  T("the-tich-chlorine-dieu-che", C7, "Điều chế chlorine từ chất oxi hóa và HCl đặc", 2, 3, "mcq", (r) => {
    const OX: [string, number, number, number, string][] = [
      ["KMnO4", 158, 5, 2, "2KMnO4 + 16HCl -> 2KCl + 2MnCl2 + 5Cl2 + 8H2O"], ["MnO2", 87, 1, 1, "MnO2 + 4HCl => MnCl2 + Cl2 + 2H2O"], ["K2Cr2O7", 294, 3, 1, "K2Cr2O7 + 14HCl -> 2KCl + 2CrCl3 + 3Cl2 + 7H2O"],
    ];
    const [f, M, a, b, e] = r.pick(OX), n = r.int(1, 10) * 0.02, mo = round(n * M, 3), H = r.pick([100, 100, 80, 75, 90]);
    const nC = (n * a) / b, V = round(nC * VM * (H / 100), 4), K = (x: number) => `${vn(x, 4)} lít`;
    const w = [n * VM * (H / 100), ((n * b) / a) * VM * (H / 100), nC * VM, (nC * VM) / (H / 100), nC * VM * 2 * (H / 100)].map((x) => round(x, 4)).filter((x) => x !== V);
    return { stem: `Cho ${vn(mo, 3)} gam ${m(f)} tác dụng với dung dịch ${m("HCl")} đặc, dư${H < 100 ? `. Hiệu suất phản ứng là ${H}%` : ""}. Thể tích khí chlorine thu được (đkc) là (cho H = 1, O = 16, K = 39, Cr = 52, Mn = 55; ${VMT.replace("Ở", "ở")})`,
      ...mcq(r, K(V), w.map(K)), explanation: `${eqT(e)}. $n_{\\mathrm{${mf(f)}}} = \\dfrac{${tex(mo, 3)}}{${M}} = ${tex(n)}$ mol $\\Rightarrow n_{\\mathrm{Cl_{2}}} = ${tex(n)}\\cdot\\dfrac{${a}}{${b}} = ${tex(nC, 3)}$ mol${H < 100 ? ` (lí thuyết); thực tế thu được $${tex(nC, 3)}\\cdot ${tex(H / 100)}$ mol` : ""}. $V = ${tex(V, 4)}$ lít.` };
  }),
  T("tf-tinh-chat-hai-halogen", C7, "So sánh tính chất hai nguyên tố halogen", 2, 1, "tf", (r) => {
    const [X, Y] = pickN(r, HAL, 2), sx = X.z < Y.z;
    const other = HAL.filter((h) => h.st !== X.st)[0];
    const yCol = r.pick(HAL.map((h) => h.ag).filter((c) => c !== Y.ag));
    const items: [string, boolean][] = [
      st(r.chance(0.5), `X thuộc chu kì ${X.per} của bảng tuần hoàn.`, `X thuộc chu kì ${X.per + r.pick([-1, 1])} của bảng tuần hoàn.`),
      st(r.chance(0.5), `Ở điều kiện thường, đơn chất $\\mathrm{X_{2}}$ là chất ${X.st}.`, `Ở điều kiện thường, đơn chất $\\mathrm{X_{2}}$ là chất ${other.st}.`),
      [`Tính oxi hóa của đơn chất $\\mathrm{X_{2}}$ mạnh hơn của $\\mathrm{Y_{2}}$.`, sx],
      [`Bán kính nguyên tử X lớn hơn bán kính nguyên tử Y.`, !sx],
      st(r.chance(0.5), `Nhỏ dung dịch $\\mathrm{AgNO_{3}}$ vào dung dịch NaY thu được ${Y.ag}.`, `Nhỏ dung dịch $\\mathrm{AgNO_{3}}$ vào dung dịch NaY thu được ${yCol}.`),
      st(r.chance(0.5), `Nguyên tử Y có 7 electron ở lớp ngoài cùng.`, `Nguyên tử Y có ${r.pick([5, 6, 8])} electron ở lớp ngoài cùng.`),
    ];
    return { stem: `Cho hai nguyên tố X (Z = ${X.z}) và Y (Z = ${Y.z}) thuộc nhóm VIIA.`, ...tf(pickN(r, items, 4)),
      explanation: `X là ${X.name} (chu kì ${X.per}, đơn chất là chất ${X.st}, màu ${X.col}); Y là ${Y.name} (chu kì ${Y.per}). Các halogen có 7 electron lớp ngoài cùng. Trong nhóm VIIA, từ trên xuống bán kính nguyên tử tăng, tính oxi hóa của đơn chất giảm nên ${sx ? "X mạnh hơn Y, bán kính X nhỏ hơn Y" : "X yếu hơn Y, bán kính X lớn hơn Y"}. Dung dịch NaY với $\\mathrm{AgNO_{3}}$: ${Y.ag}.` };
  }),
  T("tf-chat-tac-dung-hcl", C7, "Tính chất của dung dịch hydrochloric acid", 2, 2, "tf", (r) => {
    let L: [string, boolean, boolean][] = [];
    for (let i = 0; i < 20; i++) { L = pickN(r, HCLSUB, 6); if (L.some((x) => !x[1]) && L.some((x) => x[2]) && L.some((x) => x[1] && !x[2])) break; }
    need(L.some((x) => !x[1]) && L.some((x) => x[2]));
    const nR = L.filter((x) => x[1]).length, nG = L.filter((x) => x[2]).length;
    const a = r.pick(L), b = r.pick(L.filter((x) => x !== a)), fe = L.find((x) => x[0] === "Fe");
    const s3: [string, boolean] = fe && r.chance(0.6)
      ? st(r.chance(0.5), `Cho ${m("Fe")} vào dung dịch ${m("HCl")} thu được muối ${m("FeCl2")}.`, `Cho ${m("Fe")} vào dung dịch ${m("HCl")} thu được muối ${m("FeCl3")}.`)
      : [`Khi cho ${m(a[0])} vào dung dịch ${m("HCl")} có khí thoát ra.`, a[2]];
    return { stem: `Cho lần lượt các chất: ${L.map((x) => m(x[0])).join(", ")} vào dung dịch ${m("HCl")} loãng, dư.`, ...tf([
      st(r.chance(0.5), `Có ${nR} chất phản ứng với dung dịch ${m("HCl")}.`, `Có ${nR + r.pick([-1, 1])} chất phản ứng với dung dịch ${m("HCl")}.`),
      st(r.chance(0.5), `Có ${nG} trường hợp tạo ra chất khí.`, `Có ${nG === 1 ? 2 : nG + r.pick([-1, 1])} trường hợp tạo ra chất khí.`),
      s3,
      [`${m(b[0])} không phản ứng với dung dịch ${m("HCl")}.`, !b[1]],
    ]), explanation: `Phản ứng với HCl: ${L.filter((x) => x[1]).map((x) => m(x[0])).join(", ")} (${nR} chất); tạo khí: ${L.filter((x) => x[2]).map((x) => m(x[0])).join(", ")} (${nG} chất: kim loại đứng trước H tạo $\\mathrm{H_{2}}$, muối carbonate tạo $\\mathrm{CO_{2}}$). Không phản ứng: ${L.filter((x) => !x[1]).map((x) => m(x[0])).join(", ")}. Fe tác dụng với HCl chỉ tạo $\\mathrm{FeCl_{2}}$.` };
  }),
  T("tf-hon-hop-kim-loai-hcl", C7, "Bài toán hỗn hợp kim loại tác dụng với HCl", 2, 3, "tf", (r) => {
    const [A, B] = pickN(r, ["Mg", "Al", "Zn", "Fe"], 2), [MA, vA0] = MET[A], [MB, vB0] = MET[B];
    const vA = vA0, vB = vB0, nA = r.int(1, 6) * 0.05, nB = r.int(1, 6) * 0.05;
    const mA = nA * MA, mB = nB * MB, mt = round(mA + mB, 3), nH = (vA * nA + vB * nB) / 2; need(exact(nH, 3));
    const V = round(nH * VM, 4), pA = round((mA / mt) * 100, 2), pMol = round((nA / (nA + nB)) * 100, 2), msalt = round(mt + 71 * nH, 3);
    need(Math.abs(pA - pMol) > 0.5);
    return { stem: `Hòa tan hoàn toàn ${vn(mt, 3)} gam hỗn hợp X gồm ${m(A)} và ${m(B)} trong dung dịch ${m("HCl")} dư, thu được ${vn(V, 4)} lít khí ${m("H2")} (đkc). Cho ${A} = ${MA}; ${B} = ${MB}; Cl = 35,5. ${VMT}`, ...tf([
      st(r.chance(0.5), `Số mol ${m(A)} trong X là ${vn(nA)} mol.`, `Số mol ${m(A)} trong X là ${vn(nB === nA ? nA + 0.05 : nB)} mol.`),
      st(r.chance(0.5), `Phần trăm khối lượng của ${m(A)} trong X là ${vn(pA)}%.`, `Phần trăm khối lượng của ${m(A)} trong X là ${vn(Math.abs(pA - pMol) > 0.5 ? pMol : round(100 - pA, 2))}%.`),
      st(r.chance(0.5), `Số mol ${m("HCl")} đã phản ứng là ${vn(2 * nH, 3)} mol.`, `Số mol ${m("HCl")} đã phản ứng là ${vn(nH, 3)} mol.`),
      st(r.chance(0.5), `Cô cạn dung dịch sau phản ứng thu được ${vn(msalt, 3)} gam muối khan.`, `Cô cạn dung dịch sau phản ứng thu được ${vn(round(mt + 35.5 * nH, 3), 3)} gam muối khan.`),
    ]), explanation: `$n_{\\mathrm{H_{2}}} = \\dfrac{${tex(V, 4)}}{24{,}79} = ${tex(nH, 3)}$ mol. Gọi $a, b$ là số mol ${A}, ${B}: $${MA}a + ${MB}b = ${tex(mt, 3)}$ và $${vA}a + ${vB}b = 2\\cdot ${tex(nH, 3)}$ $\\Rightarrow a = ${tex(nA)}$, $b = ${tex(nB)}$. $\\%m_{\\mathrm{${A}}} = \\dfrac{${tex(mA, 2)}}{${tex(mt, 3)}}\\cdot 100\\% \\approx ${tex(pA)}\\%$. $n_{\\mathrm{HCl}} = 2n_{\\mathrm{H_{2}}} = ${tex(2 * nH, 3)}$ mol; $m_{\\text{muối}} = m_{\\text{KL}} + m_{\\mathrm{Cl^{-}}} = ${tex(mt, 3)} + 71\\cdot ${tex(nH, 3)} = ${tex(msalt, 3)}$ gam.` };
  }),
  T("short-muoi-kim-loai-hcl", C7, "Khối lượng muối, thể tích khí khi kim loại tác dụng với HCl", 2, 2, "short", (r) => {
    if (r.chance(0.5)) {
      const nH = r.int(2, 20) * 0.025, V = round(nH * VM, 4), mt = r.int(20, 150) / 10, ms = mt + 71 * nH; need(ms < 99.95);
      const mix = r.pick([["Mg", "Zn"], ["Mg", "Fe"], ["Al", "Zn"], ["Fe", "Zn"], ["Al", "Mg"], ["Mg", "Al", "Zn"]]);
      return { stem: `Hòa tan hoàn toàn ${vn(mt, 1)} gam hỗn hợp gồm ${mix.map(m).join(", ")} trong dung dịch ${m("HCl")} vừa đủ, thu được ${vn(V, 4)} lít khí ${m("H2")} (đkc). Cô cạn dung dịch thu được bao nhiêu gam muối khan? (Làm tròn đến hàng phần mười; Cl = 35,5. ${VMT})`,
        ...short(ms, 1), explanation: `$n_{\\mathrm{H_{2}}} = \\dfrac{${tex(V, 4)}}{24{,}79} = ${tex(nH, 3)}$ mol; $n_{\\mathrm{Cl^{-}}} = n_{\\mathrm{HCl}} = 2n_{\\mathrm{H_{2}}} = ${tex(2 * nH, 3)}$ mol. $m_{\\text{muối}} = ${tex(mt, 1)} + 35{,}5\\cdot ${tex(2 * nH, 3)} \\approx ${tex(ms, 1)}$ gam.` };
    }
    const s = r.pick(["Mg", "Al", "Zn", "Fe"]), [M, v, name] = MET[s], n = r.int(1, 20) * 0.02, mass = round(n * M, 3), V = n * (v / 2) * VM;
    return { stem: `Hòa tan hoàn toàn ${vn(mass, 3)} gam ${name} (${s}) trong dung dịch ${m("HCl")} dư. Tính thể tích khí ${m("H2")} thu được (lít, đkc; làm tròn đến hàng phần trăm). Cho ${s} = ${M}. ${VMT}`,
      ...short(V, 2), explanation: `${eqT(s === "Al" ? "2Al + 6HCl -> 2AlCl3 + 3H2" : `${s} + 2HCl -> ${s}Cl2 + H2`)}. $n_{\\mathrm{${s}}} = \\dfrac{${tex(mass, 3)}}{${M}} = ${tex(n)}$ mol $\\Rightarrow n_{\\mathrm{H_{2}}} = ${tex(n * v / 2, 3)}$ mol; $V = ${tex(n * v / 2, 3)}\\cdot 24{,}79 \\approx ${tex(V, 2)}$ lít.` };
  }),
  T("short-ket-tua-silver-halide", C7, "Khối lượng kết tủa silver halide", 2, 3, "short", (r) => {
    const PAIR: [string, string][] = [["NaCl", "NaBr"], ["NaCl", "NaI"], ["KCl", "KBr"], ["NaF", "NaCl"], ["NaBr", "NaI"], ["KF", "KBr"], ["NaF", "NaI"]];
    const [A, B] = r.pick(PAIR), a = r.int(1, 10) * 0.01, b = r.int(1, 10) * 0.01;
    const MA = Mw(A), MB = Mw(B), mt = round(a * MA + b * MB, 3);
    const ag = (f: string) => (f.endsWith("F") ? 0 : Mw("Ag" + f.replace(/^(Na|K)/, "")));
    const mp = a * ag(A) + b * ag(B); need(mp < 99.95 && mp > 0.5);
    const hasF = A.endsWith("F");
    return { stem: `Hòa tan ${vn(mt, 3)} gam hỗn hợp gồm ${m(A)} và ${m(B)} (tỉ lệ mol tương ứng ${Math.round(a / gcd2(a, b))} : ${Math.round(b / gcd2(a, b))}) vào nước rồi cho tác dụng với dung dịch ${m("AgNO3")} dư. Tính khối lượng kết tủa thu được (gam, làm tròn đến hàng phần mười). Cho Na = 23; K = 39; F = 19; Cl = 35,5; Br = 80; I = 127; Ag = 108.`,
      ...short(mp, 1), explanation: `Gọi số mol ${A} là ${Math.round(a / gcd2(a, b))}t, ${B} là ${Math.round(b / gcd2(a, b))}t: $${tex(MA, 1)}\\cdot ${Math.round(a / gcd2(a, b))}t + ${tex(MB, 1)}\\cdot ${Math.round(b / gcd2(a, b))}t = ${tex(mt, 3)}$ $\\Rightarrow$ $n_{\\mathrm{${mf(A)}}} = ${tex(a)}$, $n_{\\mathrm{${mf(B)}}} = ${tex(b)}$ mol. ${hasF ? `AgF tan nên chỉ ${m(B)} tạo kết tủa: $m = ${tex(b)}\\cdot ${tex(ag(B), 1)} \\approx ${tex(mp, 1)}$ gam.` : `$m = ${tex(a)}\\cdot ${tex(ag(A), 1)} + ${tex(b)}\\cdot ${tex(ag(B), 1)} \\approx ${tex(mp, 1)}$ gam.`}` };
  }),
  T("short-dem-chat-halide", C7, "Đếm chất phản ứng với HCl, với AgNO3", 2, 1, "short", (r) => {
    if (r.chance(0.5)) {
      const L = pickN(r, HCLSUB, 6), v = L.filter((x) => x[1]).length; need(v >= 1 && v <= 5);
      return { stem: `Cho các chất: ${L.map((x) => m(x[0])).join(", ")}. Có bao nhiêu chất tác dụng được với dung dịch ${m("HCl")} loãng?`, ...short(v, 0),
        explanation: `Tác dụng được với HCl loãng: ${L.filter((x) => x[1]).map((x) => m(x[0])).join(", ")}. Không phản ứng: ${L.filter((x) => !x[1]).map((x) => m(x[0])).join(", ") || "không có"} (Cu, Ag đứng sau H; muối/ chất không tạo được chất kết tủa, khí hay chất điện li yếu). Có ${v} chất.` };
    }
    const AG: [string, boolean][] = [["NaF", false], ["NaCl", true], ["KBr", true], ["NaI", true], ["HCl", true], ["KF", false], ["NaNO3", false], ["CaCl2", true], ["HF", false], ["BaCl2", true], ["KNO3", false], ["MgBr2", true], ["KI", true], ["HBr", true]];
    const L = pickN(r, AG, 6), v = L.filter((x) => x[1]).length; need(v >= 1 && v <= 5);
    return { stem: `Cho dung dịch ${m("AgNO3")} lần lượt vào các dung dịch: ${L.map((x) => m(x[0])).join(", ")}. Có bao nhiêu trường hợp tạo kết tủa?`, ...short(v, 0),
      explanation: `Ion $\\mathrm{Cl^{-}}$, $\\mathrm{Br^{-}}$, $\\mathrm{I^{-}}$ tạo kết tủa AgCl (trắng), AgBr (vàng nhạt), AgI (vàng); AgF và $\\mathrm{AgNO_{3}}$ tan. Tạo kết tủa: ${L.filter((x) => x[1]).map((x) => m(x[0])).join(", ")}. Có ${v} trường hợp.` };
  }),
  T("short-dung-dich-hcl-can-dung", C7, "Thể tích, nồng độ dung dịch HCl cần dùng", 2, 3, "short", (r) => {
    const SUB: [string, number, string][] = [["Fe2O3", 6, "Fe2O3 + 6HCl -> 2FeCl3 + 3H2O"], ["CuO", 2, "CuO + 2HCl -> CuCl2 + H2O"], ["MgO", 2, "MgO + 2HCl -> MgCl2 + H2O"], ["Al2O3", 6, "Al2O3 + 6HCl -> 2AlCl3 + 3H2O"],
      ["ZnO", 2, "ZnO + 2HCl -> ZnCl2 + H2O"], ["CaCO3", 2, "CaCO3 + 2HCl -> CaCl2 + CO2 + H2O"], ["CaO", 2, "CaO + 2HCl -> CaCl2 + H2O"], ["Zn", 2, "Zn + 2HCl -> ZnCl2 + H2"], ["Mg", 2, "Mg + 2HCl -> MgCl2 + H2"]];
    const [f, k, e] = r.pick(SUB), M = Mw(f), n = r.int(1, 20) * 0.01, mass = round(n * M, 3), nHCl = n * k;
    if (r.chance(0.5)) {
      const C = r.pick([0.5, 1, 1.5, 2]), V = (nHCl / C) * 1000; need(exact(V, 0) && V <= 9999);
      return { stem: `Để hòa tan vừa hết ${vn(mass, 3)} gam ${m(f)} cần dùng V mL dung dịch ${m("HCl")} ${vn(C)} M. Tính V. (H = 1; C = 12; O = 16; Mg = 24; Al = 27; Ca = 40; Fe = 56; Cu = 64; Zn = 65)`,
        ...short(V, 0), explanation: `${eqT(e)}. $n_{\\mathrm{${mf(f)}}} = \\dfrac{${tex(mass, 3)}}{${M}} = ${tex(n)}$ mol $\\Rightarrow n_{\\mathrm{HCl}} = ${k}\\cdot ${tex(n)} = ${tex(nHCl)}$ mol; $V = \\dfrac{${tex(nHCl)}}{${tex(C)}} = ${tex(V / 1000, 3)}$ L $= ${V}$ mL.` };
    }
    const mdd = r.pick([50, 100, 120, 150, 200, 250]), C = (nHCl * 36.5 / mdd) * 100; need(C < 99.95 && C >= 1);
    return { stem: `Hòa tan vừa hết ${vn(mass, 3)} gam ${m(f)} cần dùng ${mdd} gam dung dịch ${m("HCl")} a%. Tính a (làm tròn đến hàng phần mười). (H = 1; C = 12; O = 16; Mg = 24; Al = 27; Cl = 35,5; Ca = 40; Fe = 56; Cu = 64; Zn = 65)`,
      ...short(C, 1), explanation: `${eqT(e)}. $n_{\\mathrm{${mf(f)}}} = ${tex(n)}$ mol $\\Rightarrow n_{\\mathrm{HCl}} = ${tex(nHCl)}$ mol, $m_{\\mathrm{HCl}} = ${tex(nHCl)}\\cdot 36{,}5 = ${tex(nHCl * 36.5, 3)}$ gam. $a = \\dfrac{${tex(nHCl * 36.5, 3)}}{${mdd}}\\cdot 100 \\approx ${tex(C, 1)}$.` };
  }),
];

/* ---------- phụ trợ ---------- */
function gcd2(a: number, b: number): number { const A = Math.round(a * 100), B = Math.round(b * 100); let x = A, y = B; while (y) [x, y] = [y, x % y]; return x / 100; }
function frac(p: number, q: number): string { let a = p, b = q; while (b) [a, b] = [b, a % b]; const P = p / a, Q = q / a; return Q === 1 ? String(P) : `\\dfrac{${P}}{${Q}}`; }

export const TEMPLATES: Template[] = [...H4, ...H5, ...H6, ...H7];
