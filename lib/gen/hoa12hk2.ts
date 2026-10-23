/* Hóa học 12 – Học kì 2 (Kết nối tri thức).
   half 1: Chương 5 Pin điện và điện phân, Chương 6 Đại cương về kim loại.
   half 2: Chương 7 Nguyên tố nhóm IA và nhóm IIA, Chương 8 Kim loại chuyển tiếp thứ nhất và phức chất. */
import { mcq, tf, short, tex, vn, need, round, gcd, type Template, type Rng, type GenOut } from "./core.ts";

const S = "Hóa học" as const, G = 12 as const;
const C5 = "Chương 5. Pin điện và điện phân";
const C6 = "Chương 6. Đại cương về kim loại";
const C7 = "Chương 7. Nguyên tố nhóm IA và nhóm IIA";
const C8 = "Chương 8. Sơ lược về dãy kim loại chuyển tiếp thứ nhất và phức chất";
const P5 = { subject: S, grade: G, hk: 2 as const, half: 1 as const, chapter: C5, tk: "Hóa học|Pin điện – điện phân" };
const P6 = { subject: S, grade: G, hk: 2 as const, half: 1 as const, chapter: C6, tk: "Hóa học|Đại cương kim loại" };
const P7 = { subject: S, grade: G, hk: 2 as const, half: 2 as const, chapter: C7, tk: "Hóa học|Kim loại nhóm IA, IIA" };
const P8 = { subject: S, grade: G, hk: 2 as const, half: 2 as const, chapter: C8, tk: "Hóa học|Kim loại chuyển tiếp, phức chất" };

/* ---------------- Tiện ích ---------------- */
const ce = (s: string) => `$\\mathrm{${s}}$`;
const AM: Record<string, number> = { H: 1, C: 12, N: 14, O: 16, Na: 23, Mg: 24, Al: 27, P: 31, S: 32, Cl: 35.5, K: 39, Ca: 40, Cr: 52, Mn: 55, Fe: 56, Ni: 59, Cu: 64, Zn: 65, Ag: 108, Ba: 137, Li: 7 };
const cho = (...els: string[]) => `(Cho ${els.map((e) => `${e} = ${vn(AM[e])}`).join("; ")}.)`;
const nums = (xs: number[], dp = 2) => xs.filter((x) => Number.isFinite(x) && x > 0).map((x) => vn(x, dp));
const pickTF = (r: Rng, t: string, f: string): [string, boolean] => (r.chance(0.5) ? [t, true] : [f, false]);
const pct = (h: number) => `${vn(h, 1)}%`;
const AB = "abcdefgh";
const VM = 24.79, FA = 96500;
const RND = ["hàng đơn vị", "hàng phần mười", "hàng phần trăm"];
/** số chữ số thập phân để đáp án trả lời ngắn không quá 4 ký tự */
const dpOf = (x: number) => (x < 10 ? 2 : x < 100 ? 1 : 0);
/** "= x" hoặc "= x ≈ làm tròn" trong công thức */
const ap = (x: number, dp: number) => (round(x, dp) === round(x, 4) ? `= ${tex(x, dp)}` : `= ${tex(x, 4)} \\approx ${tex(round(x, dp), dp)}`);
const k1 = (x: number) => (x === 1 ? "" : String(x));
const ox = (x: number) => (x > 0 ? `+${x}` : String(x));

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
    explanation: `${why} Trong dãy, các trường hợp thỏa mãn là: ${yes.length ? yes.join(", ") : "không có trường hợp nào"}. Vậy có ${c}.`,
  };
}

/* ---------------- Thế điện cực chuẩn (V) ---------------- */
type Cp = { M: string; n: number; E: number };
const CPS: Cp[] = [
  { M: "K", n: 1, E: -2.925 }, { M: "Ca", n: 2, E: -2.868 }, { M: "Na", n: 1, E: -2.713 },
  { M: "Mg", n: 2, E: -2.356 }, { M: "Al", n: 3, E: -1.676 }, { M: "Zn", n: 2, E: -0.763 },
  { M: "Fe", n: 2, E: -0.44 }, { M: "Ni", n: 2, E: -0.257 }, { M: "Sn", n: 2, E: -0.137 },
  { M: "Pb", n: 2, E: -0.126 }, { M: "H_2", n: 2, E: 0 }, { M: "Cu", n: 2, E: 0.34 },
  { M: "Ag", n: 1, E: 0.799 }, { M: "Au", n: 3, E: 1.52 },
];
const cp = (m: string) => CPS.find((c) => c.M === m)!;
const chg = (n: number) => (n === 1 ? "+" : `${n}+`);
const ionF = (c: Cp) => (c.M === "H_2" ? "H^{+}" : `${c.M}^{${chg(c.n)}}`);
const cplF = (c: Cp) => (c.M === "H_2" ? "2H^{+}/H_2" : `${ionF(c)}/${c.M}`);
const eoT = (c: Cp) => `E^\\circ_{\\mathrm{${cplF(c)}}}`;
const eoList = (cs: Cp[]) => cs.map((c) => `$${eoT(c)} = ${tex(c.E, 3)}$ V`).join("; ");
/** phương trình ion thu gọn: kim loại của cặp red khử dạng oxi hóa của cặp oxc */
function redox(red: Cp, oxc: Cp): string {
  const g = gcd(red.n, oxc.n), a = oxc.n / g, b = red.n / g;
  if (oxc.M === "H_2") return `${k1(a)}${red.M} + ${k1(2 * b)}H^{+} \\rightarrow ${k1(a)}${ionF(red)} + ${k1(b)}H_2`;
  return `${k1(a)}${red.M} + ${k1(b)}${ionF(oxc)} \\rightarrow ${k1(a)}${ionF(red)} + ${k1(b)}${oxc.M}`;
}
const oxH = (c: Cp) => `${c.M} \\rightarrow ${ionF(c)} + ${k1(c.n)}e`;
const redH = (c: Cp) => `${ionF(c)} + ${k1(c.n)}e \\rightarrow ${c.M}`;
const PIN = ["Mg", "Al", "Zn", "Fe", "Ni", "Sn", "Pb", "Cu", "Ag"];
const SALT: Record<string, string> = { Mg: "MgSO_4", Al: "Al_2(SO_4)_3", Zn: "ZnSO_4", Fe: "FeSO_4", Ni: "NiSO_4", Sn: "SnSO_4", Pb: "Pb(NO_3)_2", Cu: "CuSO_4", Ag: "AgNO_3" };

/* ---------------- Điện phân ---------------- */
type Ep = { s: string; st: 0 | 1 | 2; cat: string; an: string; wc: string; wa: string; why: string };
const EPS: Ep[] = [
  { s: "CuSO_4", st: 0, cat: "Cu", an: "O_2", wc: "H_2", wa: "SO_2", why: "ion $\\mathrm{Cu^{2+}}$ bị khử ở cathode tạo Cu; ion $\\mathrm{SO_4^{2-}}$ không bị oxi hóa nên nước bị oxi hóa ở anode tạo $\\mathrm{O_2}$." },
  { s: "CuCl_2", st: 0, cat: "Cu", an: "Cl_2", wc: "H_2", wa: "O_2", why: "ion $\\mathrm{Cu^{2+}}$ bị khử ở cathode tạo Cu; ion $\\mathrm{Cl^-}$ bị oxi hóa ở anode tạo $\\mathrm{Cl_2}$." },
  { s: "AgNO_3", st: 0, cat: "Ag", an: "O_2", wc: "H_2", wa: "NO_2", why: "ion $\\mathrm{Ag^+}$ bị khử ở cathode tạo Ag; ion $\\mathrm{NO_3^-}$ không bị oxi hóa nên nước bị oxi hóa ở anode tạo $\\mathrm{O_2}$." },
  { s: "NaCl", st: 1, cat: "H_2", an: "Cl_2", wc: "Na", wa: "O_2", why: "ion $\\mathrm{Na^+}$ không bị khử trong dung dịch nên nước bị khử ở cathode tạo $\\mathrm{H_2}$ (và $\\mathrm{OH^-}$); ion $\\mathrm{Cl^-}$ bị oxi hóa ở anode tạo $\\mathrm{Cl_2}$." },
  { s: "KCl", st: 1, cat: "H_2", an: "Cl_2", wc: "K", wa: "O_2", why: "ion $\\mathrm{K^+}$ không bị khử trong dung dịch nên nước bị khử ở cathode tạo $\\mathrm{H_2}$; ion $\\mathrm{Cl^-}$ bị oxi hóa ở anode tạo $\\mathrm{Cl_2}$." },
  { s: "KNO_3", st: 0, cat: "H_2", an: "O_2", wc: "K", wa: "NO_2", why: "cả $\\mathrm{K^+}$ và $\\mathrm{NO_3^-}$ đều không điện phân trong dung dịch: nước bị khử ở cathode tạo $\\mathrm{H_2}$, bị oxi hóa ở anode tạo $\\mathrm{O_2}$ (thực chất là điện phân nước)." },
  { s: "Na_2SO_4", st: 0, cat: "H_2", an: "O_2", wc: "Na", wa: "SO_2", why: "cả $\\mathrm{Na^+}$ và $\\mathrm{SO_4^{2-}}$ đều không điện phân trong dung dịch: nước bị khử ở cathode tạo $\\mathrm{H_2}$, bị oxi hóa ở anode tạo $\\mathrm{O_2}$." },
  { s: "NaCl", st: 2, cat: "Na", an: "Cl_2", wc: "H_2", wa: "O_2", why: "trong NaCl nóng chảy, ion $\\mathrm{Na^+}$ bị khử ở cathode tạo Na; ion $\\mathrm{Cl^-}$ bị oxi hóa ở anode tạo $\\mathrm{Cl_2}$." },
  { s: "MgCl_2", st: 2, cat: "Mg", an: "Cl_2", wc: "H_2", wa: "O_2", why: "trong $\\mathrm{MgCl_2}$ nóng chảy, ion $\\mathrm{Mg^{2+}}$ bị khử ở cathode tạo Mg; ion $\\mathrm{Cl^-}$ bị oxi hóa ở anode tạo $\\mathrm{Cl_2}$." },
  { s: "CaCl_2", st: 2, cat: "Ca", an: "Cl_2", wc: "H_2", wa: "O_2", why: "trong $\\mathrm{CaCl_2}$ nóng chảy, ion $\\mathrm{Ca^{2+}}$ bị khử ở cathode tạo Ca; ion $\\mathrm{Cl^-}$ bị oxi hóa ở anode tạo $\\mathrm{Cl_2}$." },
];
const epHead = (e: Ep) => (e.st === 2 ? `điện phân nóng chảy ${ce(e.s)}` : `điện phân dung dịch ${ce(e.s)} (điện cực trơ${e.st === 1 ? ", có màng ngăn xốp" : ""})`);
const FM = [{ M: "Cu", n: 2, A: 64, s: "CuSO_4" }, { M: "Ag", n: 1, A: 108, s: "AgNO_3" }, { M: "Ni", n: 2, A: 59, s: "NiSO_4" }];
/** chọn I (A), t (s) sao cho số mol electron đẹp */
function pickIT(r: Rng): { I: number; t: number; ne: number } {
  const ne = r.pick([0.02, 0.03, 0.04, 0.05, 0.06, 0.08, 0.1, 0.12, 0.15, 0.2, 0.25, 0.3]);
  const I = r.pick([0.5, 1, 1.5, 1.93, 2, 2.5, 3, 3.86, 4, 5, 9.65]);
  const t = round(ne * FA / I, 6);
  need(Number.isInteger(t) && t >= 300 && t <= 5 * 3600);
  return { I, t, ne };
}
const tTxt = (t: number) => (t % 60 === 0 ? `${t / 60} phút` : `${t} giây`);
const tSec = (t: number) => (t % 60 === 0 ? `$t = ${t / 60}\\cdot 60 = ${t}$ s` : `$t = ${t}$ s`);

/* ---------------- Kim loại ---------------- */
type Mt = { M: string; A: number; v: number };
const ACIDM: Mt[] = [{ M: "Mg", A: 24, v: 2 }, { M: "Al", A: 27, v: 3 }, { M: "Zn", A: 65, v: 2 }, { M: "Fe", A: 56, v: 2 }];
type At = { s: string; z: number; cfg: string; p: number; g: string };
const ATS: At[] = [
  { s: "Li", z: 3, cfg: "[He]2s^{1}", p: 2, g: "IA" },
  { s: "Na", z: 11, cfg: "[Ne]3s^{1}", p: 3, g: "IA" },
  { s: "Mg", z: 12, cfg: "[Ne]3s^{2}", p: 3, g: "IIA" },
  { s: "Al", z: 13, cfg: "[Ne]3s^{2}3p^{1}", p: 3, g: "IIIA" },
  { s: "K", z: 19, cfg: "[Ar]4s^{1}", p: 4, g: "IA" },
  { s: "Ca", z: 20, cfg: "[Ar]4s^{2}", p: 4, g: "IIA" },
  { s: "Cr", z: 24, cfg: "[Ar]3d^{5}4s^{1}", p: 4, g: "VIB" },
  { s: "Mn", z: 25, cfg: "[Ar]3d^{5}4s^{2}", p: 4, g: "VIIB" },
  { s: "Fe", z: 26, cfg: "[Ar]3d^{6}4s^{2}", p: 4, g: "VIIIB" },
  { s: "Cu", z: 29, cfg: "[Ar]3d^{10}4s^{1}", p: 4, g: "IB" },
  { s: "Zn", z: 30, cfg: "[Ar]3d^{10}4s^{2}", p: 4, g: "IIB" },
];
const GRP = ["IA", "IIA", "IIIA", "IB", "IIB", "VIB", "VIIB", "VIIIB", "VIIIA"];

/* ---------------- Kim loại chuyển tiếp, phức chất ---------------- */
const TM = [
  { s: "Sc", z: 21, d: 1, s4: 2 }, { s: "Ti", z: 22, d: 2, s4: 2 }, { s: "V", z: 23, d: 3, s4: 2 }, { s: "Cr", z: 24, d: 5, s4: 1 },
  { s: "Mn", z: 25, d: 5, s4: 2 }, { s: "Fe", z: 26, d: 6, s4: 2 }, { s: "Co", z: 27, d: 7, s4: 2 }, { s: "Ni", z: 28, d: 8, s4: 2 }, { s: "Cu", z: 29, d: 10, s4: 1 },
];
const TION: [string, number][] = [["Fe", 2], ["Fe", 3], ["Cr", 3], ["Cu", 2], ["Cu", 1], ["Mn", 2], ["Co", 2], ["Co", 3], ["Ni", 2], ["V", 3], ["Ti", 3]];
const cfgT = (d: number, s: number) => `[Ar]${d ? `3d^{${d}}` : ""}${s ? `4s^{${s}}` : ""}`;
type Cx = { f: string; c: string; L: [string, number, number, string][]; q: number }; // phối tử: [công thức, số lượng, điện tích, nguyên tử cho]
const CXS: Cx[] = [
  { f: "[Cu(NH_3)_4]^{2+}", c: "Cu", L: [["NH_3", 4, 0, "N"]], q: 2 },
  { f: "[Fe(H_2O)_6]^{3+}", c: "Fe", L: [["H_2O", 6, 0, "O"]], q: 3 },
  { f: "[Co(NH_3)_6]^{3+}", c: "Co", L: [["NH_3", 6, 0, "N"]], q: 3 },
  { f: "[Ag(NH_3)_2]^{+}", c: "Ag", L: [["NH_3", 2, 0, "N"]], q: 1 },
  { f: "[PtCl_4]^{2-}", c: "Pt", L: [["Cl^{-}", 4, -1, "Cl"]], q: -2 },
  { f: "[Fe(CN)_6]^{4-}", c: "Fe", L: [["CN^{-}", 6, -1, "C"]], q: -4 },
  { f: "[Fe(CN)_6]^{3-}", c: "Fe", L: [["CN^{-}", 6, -1, "C"]], q: -3 },
  { f: "[Ni(CO)_4]", c: "Ni", L: [["CO", 4, 0, "C"]], q: 0 },
  { f: "[Zn(OH)_4]^{2-}", c: "Zn", L: [["OH^{-}", 4, -1, "O"]], q: -2 },
  { f: "[Cu(H_2O)_6]^{2+}", c: "Cu", L: [["H_2O", 6, 0, "O"]], q: 2 },
  { f: "[CoCl_4]^{2-}", c: "Co", L: [["Cl^{-}", 4, -1, "Cl"]], q: -2 },
  { f: "[Cr(H_2O)_6]^{3+}", c: "Cr", L: [["H_2O", 6, 0, "O"]], q: 3 },
  { f: "[PtCl_2(NH_3)_2]", c: "Pt", L: [["Cl^{-}", 2, -1, "Cl"], ["NH_3", 2, 0, "N"]], q: 0 },
  { f: "[Co(NH_3)_5Cl]^{2+}", c: "Co", L: [["NH_3", 5, 0, "N"], ["Cl^{-}", 1, -1, "Cl"]], q: 2 },
  { f: "[FeF_6]^{3-}", c: "Fe", L: [["F^{-}", 6, -1, "F"]], q: -3 },
  { f: "[Mn(H_2O)_6]^{2+}", c: "Mn", L: [["H_2O", 6, 0, "O"]], q: 2 },
  { f: "[Cr(NH_3)_6]^{3+}", c: "Cr", L: [["NH_3", 6, 0, "N"]], q: 3 },
  { f: "[Cu(NH_3)_4(H_2O)_2]^{2+}", c: "Cu", L: [["NH_3", 4, 0, "N"], ["H_2O", 2, 0, "O"]], q: 2 },
];
const cxN = (x: Cx) => x.L.reduce((s, l) => s + l[1], 0);
const cxLsum = (x: Cx) => x.L.reduce((s, l) => s + l[1] * l[2], 0);
const cxOx = (x: Cx) => x.q - cxLsum(x);
const cxLig = (x: Cx) => x.L.map((l) => ce(l[0])).join(" và ");
const cxWhy = (x: Cx) => `Trong ${ce(x.f)}: nguyên tử trung tâm là ${x.c}; phối tử là ${cxLig(x)} (liên kết với nguyên tử trung tâm qua nguyên tử ${[...new Set(x.L.map((l) => l[3]))].join(", ")}); số phối trí = ${x.L.length > 1 ? x.L.map((l) => l[1]).join(" + ") + " = " : ""}${cxN(x)}. Số oxi hóa của ${x.c}: $x${x.L.map((l) => (l[2] ? ` + ${l[1]}\\cdot (${l[2]})` : ` + ${l[1]}\\cdot 0`)).join("")} = ${x.q}$ ⇒ $x = ${ox(cxOx(x))}$.`;

/* =================================================================== */
export const TEMPLATES: Template[] = [
  /* ======================= HALF 1 – CHƯƠNG 5: PIN ĐIỆN VÀ ĐIỆN PHÂN ======================= */
  {
    id: "h12k2-the-dien-cuc-so-sanh", ...P5, topic: "Thế điện cực chuẩn – so sánh tính oxi hóa, tính khử", level: 1, kind: "mcq",
    make: (r) => {
      const cs = r.shuffle(CPS.filter((c) => c.M !== "H_2")).slice(0, 4).sort((a, b) => a.E - b.E);
      const q = r.int(0, 3);
      const asks = ["ion có tính oxi hóa mạnh nhất", "ion có tính oxi hóa yếu nhất", "kim loại có tính khử mạnh nhất", "kim loại có tính khử yếu nhất"];
      const right = q === 0 || q === 3 ? cs[3] : cs[0];
      const isIon = q < 2;
      const lab = (c: Cp) => ce(isIon ? ionF(c) : c.M);
      return {
        stem: `Cho thế điện cực chuẩn của các cặp oxi hóa – khử: ${eoList(r.shuffle([...cs]))}. Trong các ${isIon ? "ion" : "kim loại"} sau, ${asks[q]} là`,
        ...mcq(r, lab(right), cs.filter((c) => c !== right).map(lab)),
        explanation: `Thế điện cực chuẩn càng lớn thì dạng oxi hóa (ion kim loại) có tính oxi hóa càng mạnh và dạng khử (kim loại) có tính khử càng yếu. Thứ tự thế điện cực chuẩn: ${cs.map((c) => ce(cplF(c))).join(" < ")}. Vậy ${asks[q]} là ${lab(right)}.`,
      };
    },
  },
  {
    id: "h12k2-chieu-phan-ung-oxi-hoa-khu", ...P5, topic: "Chiều phản ứng oxi hóa – khử theo thế điện cực", level: 2, kind: "mcq",
    make: (r) => {
      const pool = ["Mg", "Al", "Zn", "Fe", "Ni", "Pb", "Cu", "Ag", "H_2"].map(cp);
      const cs = r.shuffle([...pool]).slice(0, 4).sort((a, b) => a.E - b.E);
      type Pr = { s: string; red: Cp; o: Cp };
      const sp: Pr[] = [], ns: Pr[] = [];
      for (const a of cs) for (const b of cs) if (a !== b && a.M !== "H_2") (a.E < b.E ? sp : ns).push({ s: ce(redox(a, b)), red: a, o: b });
      const pos = r.chance(0.6);
      const [good, bad] = pos ? [sp, ns] : [ns, sp];
      const right = r.pick(good);
      return {
        stem: `Cho thế điện cực chuẩn: ${eoList(r.shuffle([...cs]))}. Phản ứng nào sau đây ${pos ? "xảy ra được" : "KHÔNG xảy ra"} ở điều kiện chuẩn?`,
        ...mcq(r, right.s, r.shuffle([...bad]).map((x) => x.s)),
        explanation: `Dạng oxi hóa của cặp có thế điện cực chuẩn lớn hơn oxi hóa được dạng khử của cặp có thế điện cực chuẩn nhỏ hơn. Với phản ứng ${right.s}: $${eoT(right.o)} = ${tex(right.o.E, 3)}$ V ${pos ? ">" : "<"} $${eoT(right.red)} = ${tex(right.red.E, 3)}$ V nên phản ứng ${pos ? "xảy ra được" : "không xảy ra"}${pos ? "" : " (chiều ngược lại mới xảy ra)"}.`,
      };
    },
  },
  {
    id: "h12k2-suat-dien-dong-pin", ...P5, topic: "Sức điện động chuẩn của pin Galvani", level: 2, kind: "mcq",
    make: (r) => {
      const [p, q] = r.shuffle([...PIN, "H_2"]).slice(0, 2).map(cp); need(Math.abs(p.E - q.E) > 0.1);
      const lo = p.E < q.E ? p : q, hi = p.E < q.E ? q : p, E = round(hi.E - lo.E, 3);
      const nm = (c: Cp) => (c.M === "H_2" ? "hydrogen chuẩn" : c.M);
      if (r.chance(0.6)) {
        const w = [lo.E - hi.E, hi.E + lo.E, Math.abs(hi.E) + Math.abs(lo.E), hi.E * hi.n - lo.E * lo.n, 2 * E, E / 2].map((x) => round(x, 3));
        return {
          stem: `Cho ${eoList(r.shuffle([p, q]))}. Sức điện động chuẩn của pin điện hóa tạo bởi hai điện cực ${nm(lo)} và ${nm(hi)} là`,
          ...mcq(r, `${vn(E, 3)} V`, w.filter((x) => x !== E).map((x) => `${vn(x, 3)} V`)),
          explanation: `Cặp có thế điện cực chuẩn nhỏ hơn (${ce(cplF(lo))}) là anode (cực âm), cặp còn lại là cathode. $E^\\circ_{\\text{pin}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}} = ${tex(hi.E, 3)} - (${tex(lo.E, 3)}) = ${tex(E, 3)}$ V (không nhân thế điện cực với hệ số phương trình).`,
        };
      }
      const askHi = r.chance(0.5), known = askHi ? lo : hi, ask = askHi ? hi : lo;
      const w = [askHi ? known.E - E : known.E + E, -ask.E, E - (askHi ? -known.E : known.E), ask.E + (askHi ? 0.2 : -0.2)].map((x) => round(x, 3));
      return {
        stem: `Pin điện hóa ${nm(lo)}–${nm(hi)} có sức điện động chuẩn bằng ${vn(E, 3)} V, trong đó điện cực ${nm(lo)} là cực âm. Biết $${eoT(known)} = ${tex(known.E, 3)}$ V. Thế điện cực chuẩn $${eoT(ask)}$ là`,
        ...mcq(r, `${vn(ask.E, 3)} V`, w.filter((x) => x !== ask.E).map((x) => `${vn(x, 3)} V`)),
        explanation: `$E^\\circ_{\\text{pin}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}}$ với cathode là ${nm(hi)}, anode là ${nm(lo)}. ${askHi ? `$${eoT(ask)} = E^\\circ_{\\text{pin}} + E^\\circ_{\\text{anode}} = ${tex(E, 3)} + (${tex(known.E, 3)}) = ${tex(ask.E, 3)}$ V.` : `$${eoT(ask)} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{pin}} = ${tex(known.E, 3)} - ${tex(E, 3)} = ${tex(ask.E, 3)}$ V.`}`,
      };
    },
  },
  {
    id: "h12k2-pin-galvani-hoat-dong", ...P5, topic: "Cấu tạo và hoạt động của pin Galvani", level: 2, kind: "mcq",
    make: (r) => {
      const [p, q] = r.shuffle([...PIN]).slice(0, 2).map(cp); need(Math.abs(p.E - q.E) > 0.15);
      const an = p.E < q.E ? p : q, ca = p.E < q.E ? q : p;
      const head = `Một pin Galvani gồm điện cực ${an.M} nhúng trong dung dịch ${ce(SALT[an.M])} và điện cực ${ca.M} nhúng trong dung dịch ${ce(SALT[ca.M])}, hai dung dịch nối với nhau bằng cầu muối. Cho ${eoList(r.shuffle([an, ca]))}.`;
      const why = `${an.M} có thế điện cực chuẩn nhỏ hơn nên là anode (cực âm): ${ce(oxH(an))}; ${ca.M} là cathode (cực dương): ${ce(redH(ca))}. Phản ứng trong pin: ${ce(redox(an, ca))}. Electron đi từ ${an.M} sang ${ca.M} qua dây dẫn; điện cực ${an.M} mòn dần, kim loại ${ca.M} bám vào cathode.`;
      const mode = r.int(0, 2);
      if (mode < 2) {
        const atAn = mode === 0;
        return {
          stem: `${head} Quá trình xảy ra ở ${atAn ? "anode" : "cathode"} của pin là`,
          ...mcq(r, ce(atAn ? oxH(an) : redH(ca)), r.shuffle([redH(an), oxH(ca), atAn ? redH(ca) : oxH(an)]).map(ce)),
          explanation: why,
        };
      }
      const T = [
        `Electron di chuyển từ điện cực ${an.M} sang điện cực ${ca.M} qua dây dẫn.`,
        `Khối lượng điện cực ${ca.M} tăng dần.`,
        `Điện cực ${an.M} là cực âm (anode).`,
        `Nồng độ ion ${ce(ionF(an))} trong dung dịch tăng dần.`,
      ];
      const F = [
        `Electron di chuyển từ điện cực ${ca.M} sang điện cực ${an.M} qua dây dẫn.`,
        `Khối lượng điện cực ${an.M} tăng dần.`,
        `Điện cực ${ca.M} là cực âm (anode).`,
        `Nồng độ ion ${ce(ionF(ca))} trong dung dịch tăng dần.`,
        `Electron di chuyển qua cầu muối từ dung dịch này sang dung dịch kia.`,
      ];
      return { stem: `${head} Khi pin hoạt động, phát biểu nào sau đây đúng?`, ...mcq(r, r.pick(T), r.shuffle(F)), explanation: why };
    },
  },
  {
    id: "h12k2-pin-dien-phan-ly-thuyet", ...P5, topic: "Pin điện và điện phân – lí thuyết", level: 1, kind: "mcq",
    make: (r) => theory(r, r.pick(["Về pin Galvani và điện phân", "Khi nói về thế điện cực, pin điện và điện phân", "Về nguồn điện hóa học và sự điện phân"]), [
      "Trong pin Galvani, anode là cực âm, tại đó xảy ra quá trình oxi hóa.",
      "Trong bình điện phân, cathode nối với cực âm của nguồn điện, tại đó xảy ra quá trình khử.",
      "Cầu muối trong pin Galvani có vai trò trung hòa điện tích của các dung dịch điện cực.",
      "Thế điện cực chuẩn của cặp oxi hóa – khử càng lớn thì dạng oxi hóa có tính oxi hóa càng mạnh.",
      "Điện phân dung dịch NaCl (điện cực trơ, có màng ngăn) thu được NaOH, khí $\\mathrm{H_2}$ và khí $\\mathrm{Cl_2}$.",
      "Trong công nghiệp, aluminium được sản xuất bằng cách điện phân nóng chảy $\\mathrm{Al_2O_3}$ có mặt cryolite.",
      "Pin Galvani biến đổi năng lượng của phản ứng oxi hóa – khử thành năng lượng điện.",
      "Khi tinh luyện đồng bằng phương pháp điện phân, đồng thô được dùng làm anode.",
      "Thế điện cực chuẩn của cặp $\\mathrm{2H^+/H_2}$ được quy ước bằng 0 V.",
    ], [
      ["Trong pin Galvani, anode là cực dương, tại đó xảy ra quá trình khử.", "anode của pin Galvani là cực âm, xảy ra quá trình oxi hóa."],
      ["Trong bình điện phân, tại cathode xảy ra quá trình oxi hóa.", "tại cathode luôn xảy ra quá trình khử."],
      ["Trong pin Galvani, electron di chuyển qua cầu muối từ cực âm sang cực dương.", "electron di chuyển qua dây dẫn ở mạch ngoài; cầu muối chỉ cho các ion di chuyển."],
      ["Thế điện cực chuẩn càng âm thì dạng khử có tính khử càng yếu.", "thế điện cực chuẩn càng âm thì dạng khử có tính khử càng mạnh."],
      ["Điện phân dung dịch NaCl (điện cực trơ) thu được kim loại Na ở cathode.", "trong dung dịch, nước bị khử ở cathode tạo $\\mathrm{H_2}$; muốn thu Na phải điện phân NaCl nóng chảy."],
      ["Khi điện phân dung dịch $\\mathrm{CuSO_4}$ (điện cực trơ), ion $\\mathrm{SO_4^{2-}}$ bị oxi hóa ở anode.", "ion $\\mathrm{SO_4^{2-}}$ không bị oxi hóa; nước bị oxi hóa ở anode tạo $\\mathrm{O_2}$."],
      ["Sức điện động chuẩn của pin bằng tổng thế điện cực chuẩn của hai cặp oxi hóa – khử.", "$E^\\circ_{\\text{pin}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}}$."],
      ["Trong công nghiệp, kim loại Na được sản xuất bằng cách điện phân dung dịch NaCl.", "Na được sản xuất bằng cách điện phân NaCl nóng chảy."],
    ]),
  },
  {
    id: "h12k2-dien-phan-san-pham", ...P5, topic: "Sản phẩm điện phân dung dịch, nóng chảy", level: 2, kind: "mcq",
    make: (r) => {
      const e = r.pick(EPS), mode = r.int(0, 2);
      const head = `Khi ${epHead(e)}`;
      const why = `Khi ${epHead(e)}: ${e.why}`;
      if (mode === 0) return { stem: `${head}, chất thu được ở cathode là`, ...mcq(r, ce(e.cat), r.shuffle([e.wc, e.an, e.wa]).map(ce)), explanation: why };
      if (mode === 1) return { stem: `${head}, chất thu được ở anode là`, ...mcq(r, ce(e.an), r.shuffle([e.wa, e.cat, e.wc]).map(ce)), explanation: why };
      const P = (c: string, a: string) => `${ce(c)} ở cathode và ${ce(a)} ở anode`;
      return { stem: `${head}, các sản phẩm thu được ở hai điện cực là`, ...mcq(r, P(e.cat, e.an), r.shuffle([P(e.an, e.cat), P(e.wc, e.an), P(e.cat, e.wa), P(e.wc, e.wa)])), explanation: why };
    },
  },
  {
    id: "h12k2-faraday-khoi-luong", ...P5, topic: "Định luật Faraday – khối lượng kim loại bám vào cathode", level: 2, kind: "mcq",
    make: (r) => {
      const M = r.pick(FM), { I, t, ne } = pickIT(r), m = M.A * ne / M.n;
      return {
        stem: `Điện phân dung dịch ${ce(M.s)} (điện cực trơ) với cường độ dòng điện ${vn(I)} A trong ${tTxt(t)} (muối còn dư sau điện phân, hiệu suất 100%). Khối lượng ${M.M} bám vào cathode là ${cho(M.M)} (Hằng số Faraday $F = 96500$ C/mol.)`,
        ...mcq(r, `${vn(m, 3)} gam`, nums([M.n === 1 ? m / 2 : m * 2, 2 * m, m / 2, m / 60, 1.5 * m], 3).map((x) => x + " gam")),
        explanation: `${tSec(t)}. Áp dụng $m = \\dfrac{AIt}{nF} = \\dfrac{${M.A}\\cdot ${tex(I)}\\cdot ${t}}{${M.n}\\cdot 96500} = ${tex(m, 3)}$ gam (ion ${ce(M.M + "^{" + chg(M.n) + "}")} nhận ${M.n} electron).`,
      };
    },
  },
  {
    id: "h12k2-short-faraday-thoi-gian", ...P5, topic: "Định luật Faraday – tính thời gian, cường độ dòng điện", level: 3, kind: "short",
    make: (r) => {
      const M = r.pick(FM), { I, t, ne } = pickIT(r), m = M.A * ne / M.n;
      if (r.chance(0.5)) {
        const x = t / 60;
        return {
          stem: `Điện phân dung dịch ${ce(M.s)} dư (điện cực trơ) với dòng điện có cường độ ${vn(I)} A. Sau bao nhiêu phút thì thu được ${vn(m, 4)} gam ${M.M} bám vào cathode (làm tròn đến hàng đơn vị)? Biết hiệu suất điện phân 100%, $F = 96500$ C/mol. ${cho(M.M)}`,
          ...short(x, 0),
          explanation: `$t = \\dfrac{m n F}{A I} = \\dfrac{${tex(m, 4)}\\cdot ${M.n}\\cdot 96500}{${M.A}\\cdot ${tex(I)}} = ${t}$ s; đổi ra phút: $\\dfrac{${t}}{60} ${ap(x, 0)}$ phút.`,
        };
      }
      return {
        stem: `Điện phân dung dịch ${ce(M.s)} dư (điện cực trơ) trong ${tTxt(t)}, thu được ${vn(m, 4)} gam ${M.M} bám vào cathode. Cường độ dòng điện đã dùng là bao nhiêu ampe (làm tròn đến hàng phần trăm)? Biết hiệu suất điện phân 100%, $F = 96500$ C/mol. ${cho(M.M)}`,
        ...short(I, 2),
        explanation: `${tSec(t)}. $I = \\dfrac{m n F}{A t} = \\dfrac{${tex(m, 4)}\\cdot ${M.n}\\cdot 96500}{${M.A}\\cdot ${t}} = ${tex(I)}$ A.`,
      };
    },
  },
  {
    id: "h12k2-short-suat-dien-dong", ...P5, topic: "Tính sức điện động chuẩn của pin", level: 1, kind: "short",
    make: (r) => {
      const [p, q] = r.shuffle([...PIN, "H_2", "Au"]).slice(0, 2).map(cp); need(Math.abs(p.E - q.E) > 0.1);
      const lo = p.E < q.E ? p : q, hi = p.E < q.E ? q : p, E = hi.E - lo.E;
      return {
        stem: `Cho ${eoList(r.shuffle([p, q]))}. Sức điện động chuẩn của pin Galvani tạo bởi hai cặp oxi hóa – khử trên là bao nhiêu vôn (làm tròn đến hàng phần trăm)?`,
        ...short(E, 2),
        explanation: `Cặp ${ce(cplF(lo))} có thế nhỏ hơn là anode, cặp ${ce(cplF(hi))} là cathode. $E^\\circ_{\\text{pin}} = ${tex(hi.E, 3)} - (${tex(lo.E, 3)}) ${ap(E, 2)}$ V.`,
      };
    },
  },
  {
    id: "h12k2-short-dien-phan-the-tich-khi", ...P5, topic: "Điện phân – thể tích khí thoát ra", level: 3, kind: "short",
    make: (r) => {
      const { I, t, ne } = pickIT(r);
      const c = r.pick([
        { s: "CuCl_2", head: "dung dịch $\\mathrm{CuCl_2}$ dư (điện cực trơ)", g: "Cl_2", where: "anode", k: 2, eq: "2Cl^- \\rightarrow Cl_2 + 2e" },
        { s: "CuSO_4", head: "dung dịch $\\mathrm{CuSO_4}$ dư (điện cực trơ)", g: "O_2", where: "anode", k: 4, eq: "2H_2O \\rightarrow O_2 + 4H^+ + 4e" },
        { s: "NaCl", head: "dung dịch NaCl dư (điện cực trơ, có màng ngăn)", g: "H_2", where: "cathode", k: 2, eq: "2H_2O + 2e \\rightarrow H_2 + 2OH^-" },
        { s: "NaCl", head: "dung dịch NaCl dư (điện cực trơ, có màng ngăn)", g: "Cl_2", where: "anode", k: 2, eq: "2Cl^- \\rightarrow Cl_2 + 2e" },
        { s: "AgNO_3", head: "dung dịch $\\mathrm{AgNO_3}$ dư (điện cực trơ)", g: "O_2", where: "anode", k: 4, eq: "2H_2O \\rightarrow O_2 + 4H^+ + 4e" },
      ]);
      const V = ne / c.k * VM, dp = dpOf(V);
      return {
        stem: `Điện phân ${c.head} với cường độ dòng điện ${vn(I)} A trong ${tTxt(t)}. Thể tích khí ${ce(c.g)} thoát ra ở ${c.where} (đkc, 1 mol khí chiếm 24,79 L) là bao nhiêu lít (làm tròn đến ${RND[dp]})? Biết hiệu suất 100%, khí không tan trong nước, $F = 96500$ C/mol.`,
        ...short(V, dp),
        explanation: `${tSec(t)}. $n_e = \\dfrac{It}{F} = \\dfrac{${tex(I)}\\cdot ${t}}{96500} = ${tex(ne)}$ mol. Ở ${c.where}: ${ce(c.eq)} ⇒ $n_{\\mathrm{${c.g}}} = \\dfrac{${tex(ne)}}{${c.k}} = ${tex(ne / c.k, 4)}$ mol ⇒ $V = ${tex(ne / c.k, 4)}\\cdot 24{,}79 ${ap(V, dp)}$ L.`,
      };
    },
  },
  {
    id: "h12k2-tf-pin-galvani", ...P5, topic: "Pin Galvani – đúng/sai", level: 2, kind: "tf",
    make: (r) => {
      const [p, q] = r.shuffle([...PIN]).slice(0, 2).map(cp); need(Math.abs(p.E - q.E) > 0.15);
      const an = p.E < q.E ? p : q, ca = p.E < q.E ? q : p, E = round(ca.E - an.E, 3);
      const wE = r.pick([ca.E + an.E, Math.abs(ca.E) + Math.abs(an.E), ca.E * ca.n - an.E * an.n].map((x) => round(x, 3)).filter((x) => x !== E && x > 0).concat([round(E + 0.2, 3)]));
      return {
        stem: `Một pin Galvani được tạo bởi điện cực ${an.M} nhúng trong dung dịch ${ce(SALT[an.M])} và điện cực ${ca.M} nhúng trong dung dịch ${ce(SALT[ca.M])}, nối với nhau bằng cầu muối. Cho ${eoList(r.shuffle([an, ca]))}.`,
        ...tf([
          pickTF(r, `Điện cực ${an.M} là anode (cực âm) của pin.`, `Điện cực ${ca.M} là anode (cực âm) của pin.`),
          pickTF(r, `Sức điện động chuẩn của pin là ${vn(E, 3)} V.`, `Sức điện động chuẩn của pin là ${vn(wE, 3)} V.`),
          pickTF(r, `Trong quá trình pin hoạt động, khối lượng điện cực ${ca.M} tăng dần.`, `Trong quá trình pin hoạt động, khối lượng điện cực ${an.M} tăng dần.`),
          r.chance(0.5)
            ? pickTF(r, `Ở mạch ngoài, electron di chuyển từ điện cực ${an.M} sang điện cực ${ca.M}.`, `Ở mạch ngoài, electron di chuyển từ điện cực ${ca.M} sang điện cực ${an.M}.`)
            : pickTF(r, "Cầu muối có vai trò trung hòa điện tích của hai dung dịch, giúp pin hoạt động liên tục.", "Cầu muối là nơi electron di chuyển giữa hai dung dịch."),
        ]),
        explanation: `${an.M} có thế điện cực chuẩn nhỏ hơn nên là anode (cực âm), bị oxi hóa: ${ce(oxH(an))}; ở cathode: ${ce(redH(ca))} nên khối lượng điện cực ${ca.M} tăng. $E^\\circ_{\\text{pin}} = ${tex(ca.E, 3)} - (${tex(an.E, 3)}) = ${tex(E, 3)}$ V. Electron đi từ anode sang cathode qua dây dẫn; cầu muối chỉ cho ion di chuyển để trung hòa điện tích.`,
      };
    },
  },
  {
    id: "h12k2-tf-dien-phan-cuso4", ...P5, topic: "Điện phân dung dịch CuSO₄ – đúng/sai", level: 3, kind: "tf",
    make: (r) => {
      const { I, t, ne } = pickIT(r), c = r.pick([0.2, 0.5, 1]), V = r.pick([100, 200, 500]), n0 = c * V / 1000;
      need(n0 > ne / 2 + 0.005);
      const mCu = ne / 2 * 64, vO2 = ne / 4 * VM;
      return {
        stem: `Điện phân ${V} mL dung dịch $\\mathrm{CuSO_4}$ ${vn(c)} M (điện cực trơ) với cường độ dòng điện ${vn(I)} A trong ${tTxt(t)}. Giả sử hiệu suất điện phân 100%, khí sinh ra không tan trong nước. ${cho("Cu")} ($F = 96500$ C/mol; ở đkc 1 mol khí chiếm 24,79 L.)`,
        ...tf([
          pickTF(r, "Ở cathode xảy ra quá trình khử ion $\\mathrm{Cu^{2+}}$ thành Cu.", "Ở cathode xảy ra quá trình oxi hóa ion $\\mathrm{Cu^{2+}}$ thành Cu."),
          r.chance(0.5)
            ? pickTF(r, "Khí thoát ra ở anode là $\\mathrm{O_2}$.", r.pick(["Khí thoát ra ở anode là $\\mathrm{SO_2}$.", "Khí thoát ra ở anode là $\\mathrm{H_2}$."]))
            : pickTF(r, `Thể tích khí thoát ra ở anode (đkc) là ${vn(vO2, 3)} L.`, `Thể tích khí thoát ra ở anode (đkc) là ${vn(ne / 2 * VM, 3)} L.`),
          pickTF(r, `Khối lượng Cu bám vào cathode là ${vn(mCu, 3)} gam.`, `Khối lượng Cu bám vào cathode là ${vn(r.pick([ne * 64, mCu / 2]), 3)} gam.`),
          pickTF(r, "pH của dung dịch giảm dần trong quá trình điện phân.", "pH của dung dịch tăng dần trong quá trình điện phân."),
        ]),
        explanation: `${tSec(t)}; $n_e = \\dfrac{${tex(I)}\\cdot ${t}}{96500} = ${tex(ne)}$ mol, $n_{\\mathrm{Cu^{2+}}} = ${tex(n0, 3)}$ mol (dư). Cathode: $\\mathrm{Cu^{2+} + 2e \\rightarrow Cu}$ ⇒ $m_{\\mathrm{Cu}} = \\dfrac{${tex(ne)}}{2}\\cdot 64 = ${tex(mCu, 3)}$ gam. Anode: $\\mathrm{2H_2O \\rightarrow O_2 + 4H^+ + 4e}$ ⇒ $V_{\\mathrm{O_2}} = \\dfrac{${tex(ne)}}{4}\\cdot 24{,}79 = ${tex(vO2, 3)}$ L; ion $\\mathrm{H^+}$ sinh ra làm pH giảm.`,
      };
    },
  },

  /* ======================= HALF 1 – CHƯƠNG 6: ĐẠI CƯƠNG VỀ KIM LOẠI ======================= */
  {
    id: "h12k2-kim-loai-cau-hinh-vi-tri", ...P6, topic: "Cấu hình electron, vị trí kim loại trong bảng tuần hoàn", level: 1, kind: "mcq",
    make: (r) => {
      const a = r.pick(ATS);
      const why = `${a.s} (Z = ${a.z}) có cấu hình electron ${ce(a.cfg)} ⇒ chu kì ${a.p} (${a.p} lớp electron), nhóm ${a.g}.`;
      if (r.chance(0.5)) {
        const near = [...ATS].filter((x) => x !== a).sort((x, y) => Math.abs(x.z - a.z) - Math.abs(y.z - a.z)).map((x) => x.cfg);
        const special = a.s === "Cr" ? ["[Ar]3d^{4}4s^{2}"] : a.s === "Cu" ? ["[Ar]3d^{9}4s^{2}"] : [];
        return { stem: `Cấu hình electron của nguyên tử ${a.s} (Z = ${a.z}) là`, ...mcq(r, ce(a.cfg), [...special, ...near].map(ce)), explanation: why + (special.length ? ` Cấu hình bán bão hòa/ bão hòa phân lớp 3d bền hơn nên một electron 4s chuyển vào 3d.` : "") };
      }
      const pos = (p: number, g: string) => `chu kì ${p}, nhóm ${g}`;
      const w = [...r.shuffle(GRP.filter((g) => g !== a.g)).slice(0, 2).map((g) => pos(a.p, g)), pos(a.p + 1, a.g), pos(a.p - 1, a.g)];
      return { stem: `Nguyên tố ${a.s} (Z = ${a.z}) có vị trí trong bảng tuần hoàn là`, ...mcq(r, pos(a.p, a.g), r.shuffle(w)), explanation: why };
    },
  },
  {
    id: "h12k2-kim-loai-tinh-chat-vat-li", ...P6, topic: "Tính chất vật lí của kim loại", level: 1, kind: "mcq",
    make: (r) => {
      const EXT: [string, string][] = [["dẫn điện tốt nhất", "Ag"], ["dẻo nhất", "Au"], ["cứng nhất", "Cr"], ["có nhiệt độ nóng chảy cao nhất", "W"], ["có nhiệt độ nóng chảy thấp nhất", "Hg"], ["có khối lượng riêng nhỏ nhất", "Li"], ["có khối lượng riêng lớn nhất", "Os"]];
      const POOL = ["Ag", "Cu", "Au", "Al", "Fe", "W", "Hg", "Cr", "Li", "Os", "Na", "Pb"];
      const facts = "Ag dẫn điện tốt nhất, Au dẻo nhất, Cr cứng nhất, W có nhiệt độ nóng chảy cao nhất, Hg có nhiệt độ nóng chảy thấp nhất (lỏng ở điều kiện thường), Li nhẹ nhất, Os nặng nhất.";
      if (r.chance(0.2)) return {
        stem: r.pick(["Các tính chất vật lí chung của kim loại (tính dẻo, tính dẫn điện, tính dẫn nhiệt, ánh kim) gây ra chủ yếu bởi", "Kim loại có tính dẫn điện, dẫn nhiệt, tính dẻo và ánh kim là do"]),
        ...mcq(r, "các electron tự do trong mạng tinh thể kim loại", ["các ion dương kim loại ở nút mạng", "khối lượng nguyên tử của kim loại lớn", "liên kết cộng hóa trị giữa các nguyên tử kim loại", "kim loại có nhiều electron ở lớp ngoài cùng"]),
        explanation: "Trong tinh thể kim loại, các electron hóa trị chuyển động tự do; chính các electron tự do này gây nên tính dẻo, dẫn điện, dẫn nhiệt và ánh kim.",
      };
      const [p, ans] = r.pick(EXT);
      const stem = r.pick([`Kim loại ${p} là`, `Trong tất cả các kim loại, kim loại ${p} là`, `Kim loại nào sau đây ${p}?`]);
      return { stem, ...mcq(r, ans, r.shuffle(POOL.filter((x) => x !== ans))), explanation: facts };
    },
  },
  {
    id: "h12k2-kim-loai-tac-dung-acid", ...P6, topic: "Kim loại tác dụng với dung dịch acid", level: 2, kind: "mcq",
    make: (r) => {
      const m0 = r.pick(ACIDM), n = r.int(1, 8) * 0.05, m = round(n * m0.A, 2), nH = n * m0.v / 2, V = nH * VM;
      const acid = r.pick(["dung dịch HCl", "dung dịch $\\mathrm{H_2SO_4}$ loãng"]);
      const eq = m0.v === 2 ? `$\\mathrm{${m0.M} + 2H^+ \\rightarrow ${m0.M}^{2+} + H_2}$` : `$\\mathrm{2Al + 6H^+ \\rightarrow 2Al^{3+} + 3H_2}$`;
      const el = cho(m0.M);
      if (r.chance(0.5)) {
        const wv = m0.M === "Fe" ? 3 : m0.M === "Al" ? 2 : 1;
        return {
          stem: `Hòa tan hoàn toàn ${vn(m)} gam ${m0.M} trong ${acid} dư, thu được V lít khí $\\mathrm{H_2}$ (đkc, 1 mol khí chiếm 24,79 L). Giá trị của V là ${el}`,
          ...mcq(r, vn(V, 3), nums([n * wv / 2 * VM, nH * 22.4, n * m0.v * VM, n * VM, n / 2 * VM], 3)),
          explanation: `${eq}. $n_{\\mathrm{${m0.M}}} = \\dfrac{${tex(m)}}{${m0.A}} = ${tex(n)}$ mol ⇒ $n_{\\mathrm{H_2}} = ${m0.v === 2 ? tex(n) : `\\dfrac{3}{2}\\cdot ${tex(n)} = ${tex(nH, 3)}`}$ mol ⇒ $V = ${tex(nH, 3)}\\cdot 24{,}79 = ${tex(V, 4)}$ L.`,
        };
      }
      return {
        stem: `Hòa tan hoàn toàn m gam ${m0.M} trong ${acid} dư, thu được ${vn(V, 4)} lít khí $\\mathrm{H_2}$ (đkc, 1 mol khí chiếm 24,79 L). Giá trị của m là ${el}`,
        ...mcq(r, vn(m), nums([nH * m0.A, 2 * nH * m0.A, m0.M === "Fe" ? nH * 2 / 3 * m0.A : nH * m0.A / 2, (V / 22.4) * m0.A / (m0.v / 2)])),
        explanation: `${eq}. $n_{\\mathrm{H_2}} = \\dfrac{${tex(V, 4)}}{24{,}79} = ${tex(nH, 3)}$ mol ⇒ $n_{\\mathrm{${m0.M}}} = ${m0.v === 2 ? tex(nH, 3) : `\\dfrac{2}{3}\\cdot ${tex(nH, 3)} = ${tex(n)}`}$ mol ⇒ $m = ${tex(n)}\\cdot ${m0.A} = ${tex(m)}$ gam.`,
      };
    },
  },
  {
    id: "h12k2-xac-dinh-kim-loai", ...P6, topic: "Xác định kim loại từ phản ứng với acid", level: 3, kind: "mcq",
    make: (r) => {
      const MS = [{ M: "Mg", A: 24 }, { M: "Ca", A: 40 }, { M: "Fe", A: 56 }, { M: "Zn", A: 65 }, { M: "Ba", A: 137 }];
      const x = r.pick(MS), n = r.pick([0.05, 0.1, 0.15, 0.2, 0.25, 0.3]), m = round(n * x.A, 2);
      const others = r.shuffle(MS.filter((y) => y !== x)).map((y) => y.M);
      if (r.chance(0.5)) {
        const ms = round(n * (x.A + 71), 2);
        return {
          stem: `Cho ${vn(m)} gam kim loại M (hóa trị II) tác dụng hết với dung dịch HCl dư, cô cạn dung dịch sau phản ứng thu được ${vn(ms)} gam muối khan. Kim loại M là ${cho("Cl", "Mg", "Ca", "Fe", "Zn", "Ba")}`,
          ...mcq(r, x.M, others),
          explanation: `$\\mathrm{M + 2HCl \\rightarrow MCl_2 + H_2}$. Khối lượng tăng chính là khối lượng chlorine: $${tex(ms)} - ${tex(m)} = ${tex(ms - m)}$ gam ⇒ $n_{\\mathrm{M}} = \\dfrac{${tex(ms - m)}}{71} = ${tex(n)}$ mol ⇒ $M = \\dfrac{${tex(m)}}{${tex(n)}} = ${x.A}$: M là ${x.M}.`,
        };
      }
      const V = n * VM;
      return {
        stem: `Hòa tan hoàn toàn ${vn(m)} gam kim loại M (hóa trị II) trong dung dịch $\\mathrm{H_2SO_4}$ loãng dư, thu được ${vn(V, 4)} lít khí $\\mathrm{H_2}$ (đkc, 1 mol khí chiếm 24,79 L). Kim loại M là ${cho("Mg", "Ca", "Fe", "Zn", "Ba")}`,
        ...mcq(r, x.M, others),
        explanation: `$\\mathrm{M + H_2SO_4 \\rightarrow MSO_4 + H_2}$. $n_{\\mathrm{M}} = n_{\\mathrm{H_2}} = \\dfrac{${tex(V, 4)}}{24{,}79} = ${tex(n)}$ mol ⇒ $M = \\dfrac{${tex(m)}}{${tex(n)}} = ${x.A}$: M là ${x.M}.`,
      };
    },
  },
  {
    id: "h12k2-kim-loai-dung-dich-muoi", ...P6, topic: "Kim loại tác dụng với dung dịch muối – tăng giảm khối lượng", level: 3, kind: "mcq",
    make: (r) => {
      const DM = [
        { R: "Fe", AR: 56, rv: 2, X: "Cu", AX: 64, xv: 2, s: "CuSO_4" }, { R: "Zn", AR: 65, rv: 2, X: "Cu", AX: 64, xv: 2, s: "CuSO_4" },
        { R: "Mg", AR: 24, rv: 2, X: "Cu", AX: 64, xv: 2, s: "CuSO_4" }, { R: "Al", AR: 27, rv: 3, X: "Cu", AX: 64, xv: 2, s: "CuSO_4" },
        { R: "Cu", AR: 64, rv: 2, X: "Ag", AX: 108, xv: 1, s: "AgNO_3" }, { R: "Zn", AR: 65, rv: 2, X: "Ag", AX: 108, xv: 1, s: "AgNO_3" },
      ];
      const d = r.pick(DM), c = r.pick([0.1, 0.2, 0.4, 0.5, 1]), V = r.pick([50, 100, 200, 250]), nX = round(c * V / 1000, 4);
      const nR = nX * d.xv / d.rv, per = d.AX - d.xv / d.rv * d.AR, dm = nX * per, up = dm > 0;
      const eqR = `${d.R}`, ionR = `${d.R}^{${chg(d.rv)}}`, ionX = `${d.X}^{${chg(d.xv)}}`;
      const g = gcd(d.rv, d.xv), a = d.xv / g, b = d.rv / g;
      const eq = ce(`${k1(a)}${eqR} + ${k1(b)}${ionX} \\rightarrow ${k1(a)}${ionR} + ${k1(b)}${d.X}`);
      const step = `${eq}. $n_{\\mathrm{${ionX}}} = ${tex(nX, 4)}$ mol ⇒ $n_{\\mathrm{${d.R}}}$ phản ứng $= ${tex(nR, 4)}$ mol, $n_{\\mathrm{${d.X}}}$ bám vào $= ${tex(nX, 4)}$ mol. $\\Delta m = m_{\\mathrm{${d.X}}} - m_{\\mathrm{${d.R}}} = ${tex(nX * d.AX, 3)} - ${tex(nR * d.AR, 3)} = ${tex(dm, 3)}$ gam`;
      const head = `Nhúng một thanh ${d.R} (dư) vào ${V} mL dung dịch ${ce(d.s)} ${vn(c)} M. Sau khi phản ứng xảy ra hoàn toàn, lấy thanh kim loại ra, rửa nhẹ, làm khô (giả sử toàn bộ kim loại sinh ra bám vào thanh).`;
      if (r.chance(0.5)) {
        const L = (u: boolean, v: number) => `${u ? "tăng" : "giảm"} ${vn(Math.abs(v), 3)} gam`;
        return {
          stem: `${head} So với ban đầu, khối lượng thanh kim loại ${cho(d.R, d.X)}`,
          ...mcq(r, L(up, dm), [L(!up, dm), L(up, nX * d.AX), L(Math.abs(d.AX - d.AR) > 0 ? d.AX > d.AR : up, nX * (d.AX - d.AR)), L(!up, nX * d.AX), L(up, nR * d.AR)]),
          explanation: `${step} ⇒ khối lượng thanh ${up ? "tăng" : "giảm"} ${vn(Math.abs(dm), 3)} gam.`,
        };
      }
      return {
        stem: `Nhúng một thanh ${d.R} vào dung dịch ${ce(d.s)}. Sau một thời gian, lấy thanh kim loại ra, làm khô, thấy khối lượng thanh ${up ? "tăng" : "giảm"} ${vn(Math.abs(dm), 4)} gam so với ban đầu (giả sử toàn bộ kim loại sinh ra bám vào thanh). Khối lượng ${d.X} đã bám vào thanh là ${cho(d.R, d.X)}`,
        ...mcq(r, `${vn(nX * d.AX, 3)} gam`, nums([Math.abs(dm), nR * d.AR, nX * d.AX / 2, nX * d.AX * 2], 3).map((s) => s + " gam")),
        explanation: `${eq}. Cứ 1 mol ${ce(ionX)} phản ứng thì khối lượng thanh ${up ? "tăng" : "giảm"} $|${d.AX} - ${tex(d.xv / d.rv * d.AR, 2)}| = ${tex(Math.abs(per), 2)}$ gam ⇒ $n_{\\mathrm{${d.X}}} = \\dfrac{${tex(Math.abs(dm), 4)}}{${tex(Math.abs(per), 2)}} = ${tex(nX, 4)}$ mol ⇒ $m_{\\mathrm{${d.X}}} = ${tex(nX, 4)}\\cdot ${d.AX} = ${tex(nX * d.AX, 3)}$ gam.`,
      };
    },
  },
  {
    id: "h12k2-dieu-che-kim-loai", ...P6, topic: "Phương pháp điều chế kim loại", level: 1, kind: "mcq",
    make: (r) => {
      const EL = ["Na", "K", "Mg", "Ca", "Al", "Ba"], TH = ["Fe", "Zn", "Pb", "Ni", "Cu", "Sn"], HY = ["Cu", "Ag", "Au"];
      const OXY = ["CuO", "Fe_2O_3", "ZnO", "PbO", "FeO", "Fe_3O_4", "NiO"], OXN = ["Al_2O_3", "MgO", "CaO", "Na_2O", "K_2O", "BaO"];
      const why = "Kim loại hoạt động mạnh (K, Na, Ca, Ba, Mg, Al) chỉ điều chế được bằng điện phân nóng chảy hợp chất của chúng; kim loại hoạt động trung bình và yếu (Zn, Fe, Ni, Sn, Pb, Cu…) điều chế được bằng nhiệt luyện (C, CO, $\\mathrm{H_2}$ khử oxide); kim loại yếu (Cu, Ag, Au) điều chế được bằng thủy luyện. CO chỉ khử được oxide của kim loại đứng sau Al trong dãy hoạt động.";
      const mode = r.int(0, 4);
      if (mode === 0) return { stem: r.pick(["Kim loại nào sau đây được điều chế bằng phương pháp điện phân nóng chảy?", "Trong công nghiệp, kim loại nào sau đây chỉ điều chế được bằng phương pháp điện phân nóng chảy?", "Phương pháp điện phân nóng chảy được dùng để sản xuất kim loại nào sau đây?"]), ...mcq(r, r.pick(EL), r.shuffle([...TH])), explanation: why };
      if (mode === 1) {
        const pos = r.chance(0.5);
        return { stem: pos ? r.pick(["Kim loại nào sau đây có thể điều chế bằng phương pháp nhiệt luyện?", "Dùng CO khử oxide kim loại ở nhiệt độ cao có thể điều chế được kim loại nào sau đây?"]) : r.pick(["Kim loại nào sau đây KHÔNG điều chế được bằng phương pháp nhiệt luyện?", "Không thể dùng CO khử oxide ở nhiệt độ cao để điều chế kim loại nào sau đây?"]), ...mcq(r, pos ? r.pick(TH) : r.pick(EL), r.shuffle(pos ? [...EL] : [...TH])), explanation: why };
      }
      if (mode === 2) return { stem: r.pick(["Kim loại nào sau đây thường được điều chế bằng phương pháp thủy luyện?", "Phương pháp thủy luyện (dùng kim loại mạnh khử ion kim loại trong dung dịch muối) thích hợp để điều chế kim loại nào sau đây?"]), ...mcq(r, r.pick(HY), r.shuffle([...EL])), explanation: why };
      if (mode === 3) {
        const pos = r.chance(0.6);
        return { stem: pos ? "Ở nhiệt độ cao, khí CO khử được oxide nào sau đây?" : "Ở nhiệt độ cao, khí CO KHÔNG khử được oxide nào sau đây?", ...mcq(r, ce(r.pick(pos ? OXY : OXN)), r.shuffle(pos ? [...OXN] : [...OXY]).map(ce)), explanation: why };
      }
      return countQ(r, [...OXY.map((x) => [ce(x), true] as [string, boolean]), ...OXN.map((x) => [ce(x), false] as [string, boolean])], r.int(5, 6), "Cho các oxide", "Số oxide bị khí CO khử thành kim loại ở nhiệt độ cao là", why);
    },
  },
  {
    id: "h12k2-an-mon-ly-thuyet", ...P6, topic: "Ăn mòn kim loại và chống ăn mòn", level: 1, kind: "mcq",
    make: (r) => theory(r, r.pick(["Về sự ăn mòn kim loại", "Khi nói về ăn mòn kim loại và cách chống ăn mòn", "Về ăn mòn hóa học và ăn mòn điện hóa học"]), [
      "Ăn mòn kim loại là sự phá hủy kim loại do tác dụng của các chất trong môi trường.",
      "Bản chất của ăn mòn kim loại là quá trình oxi hóa – khử, trong đó kim loại bị oxi hóa thành ion dương.",
      "Ăn mòn điện hóa học xảy ra khi có hai điện cực khác nhau tiếp xúc trực tiếp hoặc qua dây dẫn và cùng tiếp xúc với dung dịch chất điện li.",
      "Gắn các khối kẽm vào vỏ tàu biển bằng thép là phương pháp bảo vệ điện hóa, kẽm bị ăn mòn thay cho thép.",
      "Trong ăn mòn điện hóa học, kim loại có tính khử mạnh hơn đóng vai trò anode và bị ăn mòn.",
      "Ăn mòn điện hóa học có phát sinh dòng điện.",
      "Sơn, mạ, bôi dầu mỡ lên bề mặt kim loại là phương pháp bảo vệ bề mặt.",
      "Ăn mòn hóa học thường xảy ra ở các thiết bị lò đốt, thiết bị tiếp xúc với hơi nước hoặc khí oxygen ở nhiệt độ cao.",
    ], [
      ["Ăn mòn hóa học có phát sinh dòng điện.", "ăn mòn hóa học không phát sinh dòng điện; electron chuyển trực tiếp từ kim loại sang chất oxi hóa."],
      ["Khi sắt tây (sắt tráng thiếc) bị xây xát sâu tới lớp sắt, thiếc bị ăn mòn trước.", "sắt có tính khử mạnh hơn thiếc nên sắt là anode và bị ăn mòn trước."],
      ["Trong ăn mòn điện hóa học, kim loại có tính khử yếu hơn bị ăn mòn.", "kim loại có tính khử mạnh hơn (anode) bị ăn mòn."],
      ["Gắn các khối đồng vào vỏ tàu biển bằng thép để bảo vệ vỏ tàu.", "đồng có tính khử yếu hơn sắt nên làm thép bị ăn mòn nhanh hơn; phải dùng kẽm."],
      ["Ăn mòn điện hóa học không cần có mặt dung dịch chất điện li.", "các điện cực phải cùng tiếp xúc với dung dịch chất điện li."],
      ["Bản chất của ăn mòn kim loại là kim loại bị khử thành ion dương.", "kim loại bị oxi hóa (nhường electron) thành ion dương."],
      ["Nhúng thanh Zn nguyên chất vào dung dịch HCl chỉ xảy ra ăn mòn điện hóa học.", "chỉ có một kim loại, không có cặp điện cực nên xảy ra ăn mòn hóa học."],
    ]),
  },
  {
    id: "h12k2-an-mon-dien-hoa-cap-kim-loai", ...P6, topic: "Ăn mòn điện hóa – xác định kim loại bị ăn mòn", level: 2, kind: "mcq",
    make: (r) => {
      const FE = ["Cu", "Sn", "Pb", "Ni", "Ag"], PROT = ["Zn", "Mg", "Al"];
      const why = "Trong cặp kim loại tiếp xúc nhau cùng ở trong dung dịch chất điện li, kim loại có thế điện cực chuẩn nhỏ hơn (tính khử mạnh hơn) là anode và bị ăn mòn trước. Thứ tự: Mg < Al < Zn < Fe < Ni < Sn < Pb < Cu < Ag. Vậy Fe bị ăn mòn trước khi ghép với Ni, Sn, Pb, Cu, Ag; còn khi ghép với Zn, Mg, Al thì kim loại kia bị ăn mòn.";
      const mode = r.int(0, 2);
      if (mode === 0) {
        const pos = r.chance(0.5), P = (m: string) => `Fe và ${m}`;
        return {
          stem: `Cho các cặp kim loại tiếp xúc trực tiếp với nhau và cùng nhúng trong dung dịch chất điện li. Cặp kim loại nào sau đây ${pos ? "có Fe bị ăn mòn trước" : "có Fe KHÔNG bị ăn mòn (được bảo vệ)"}?`,
          ...mcq(r, P(r.pick(pos ? FE : PROT)), r.shuffle(pos ? [...PROT] : [...FE]).map(P)), explanation: why,
        };
      }
      if (mode === 1) return {
        stem: r.pick(["Để bảo vệ vỏ tàu biển làm bằng thép theo phương pháp điện hóa, người ta gắn vào mặt ngoài vỏ tàu (phần chìm trong nước biển) các khối kim loại nào sau đây?", "Để bảo vệ ống dẫn bằng thép chôn dưới đất theo phương pháp điện hóa, người ta nối ống thép với kim loại nào sau đây?"]),
        ...mcq(r, r.pick(["Zn", "Mg"]), r.shuffle([...FE])), explanation: `${why} Kim loại dùng làm "anode hi sinh" phải có tính khử mạnh hơn sắt (thường dùng Zn, Mg).`,
      };
      return countQ(r, [...FE.map((m) => [`Fe và ${m}`, true] as [string, boolean]), ...PROT.map((m) => [`Fe và ${m}`, false] as [string, boolean])], r.int(5, 6), "Cho các cặp kim loại tiếp xúc trực tiếp với nhau, cùng để trong không khí ẩm", "Số cặp trong đó Fe bị ăn mòn trước là", why);
    },
  },
  {
    id: "h12k2-hop-kim", ...P6, topic: "Hợp kim", level: 1, kind: "mcq",
    make: (r) => {
      const ALL: [string, string][] = [
        ["thép", "Fe và C (hàm lượng C từ 0,01% đến 2%)"], ["gang", "Fe và C (hàm lượng C từ 2% đến 5%)"], ["inox (thép không gỉ)", "Fe, Cr, Ni"],
        ["duralumin", "Al, Cu, Mn, Mg"], ["đồng thau", "Cu và Zn"], ["đồng bạch", "Cu và Ni"], ["đồng thanh", "Cu và Sn"],
      ];
      const why = `Thép: Fe với C (0,01% – 2%); gang: Fe với C (2% – 5%); inox: Fe, Cr, Ni; duralumin: Al, Cu, Mn, Mg (nhẹ, bền, dùng trong ngành hàng không); đồng thau: Cu – Zn; đồng bạch: Cu – Ni; đồng thanh: Cu – Sn.`;
      const mode = r.int(0, 2);
      const [n, c] = r.pick(ALL), o = r.shuffle(ALL.filter((x) => x[0] !== n));
      if (mode === 0) return { stem: `Thành phần chính của hợp kim ${n} là`, ...mcq(r, c, o.map((x) => x[1])), explanation: why };
      if (mode === 1) return { stem: `Hợp kim có thành phần chính là ${c} được gọi là`, ...mcq(r, n, o.map((x) => x[0])), explanation: why };
      const U: [string, string][] = [["Hợp kim nhẹ, bền, được dùng nhiều trong ngành hàng không là", "duralumin"], ["Hợp kim không gỉ, dùng làm dụng cụ nhà bếp, dụng cụ y tế là", "inox (thép không gỉ)"], ["Hợp kim của sắt chứa từ 2% đến 5% carbon, cứng và giòn, được gọi là", "gang"]];
      const [st, ans] = r.pick(U);
      return { stem: st, ...mcq(r, ans, r.shuffle(ALL.filter((x) => x[0] !== ans)).map((x) => x[0])), explanation: why };
    },
  },
  {
    id: "h12k2-short-quang-san-xuat-gang", ...P6, topic: "Nhiệt luyện – sản xuất gang từ quặng sắt", level: 3, kind: "short",
    make: (r) => {
      const o = r.pick([{ n: "hematite", f: "Fe_2O_3", M: 160, fe: 112 }, { n: "magnetite", f: "Fe_3O_4", M: 232, fe: 168 }]);
      const m = r.pick([1, 2, 5, 10, 20]), p = r.pick([60, 70, 75, 80, 85, 90]), H = r.pick([80, 85, 90, 95]), q = r.pick([92, 94, 95, 96, 98]);
      const x = m * p / 100 * o.fe / o.M * H / 100 / (q / 100), dp = dpOf(x);
      return {
        stem: `Từ ${m} tấn quặng ${o.n} chứa ${p}% ${ce(o.f)} (còn lại là tạp chất không chứa sắt), người ta luyện được gang chứa ${q}% Fe. Biết hiệu suất của cả quá trình là ${H}%. Khối lượng gang thu được là bao nhiêu tấn (làm tròn đến ${RND[dp]})? ${cho("O", "Fe")}`,
        ...short(x, dp),
        explanation: `$m_{\\mathrm{${o.f}}} = ${m}\\cdot ${tex(p / 100)} = ${tex(m * p / 100)}$ tấn; cứ ${o.M} tấn ${ce(o.f)} chứa ${o.fe} tấn Fe ⇒ $m_{\\mathrm{Fe}} = ${tex(m * p / 100)}\\cdot \\dfrac{${o.fe}}{${o.M}}\\cdot ${tex(H / 100)} = ${tex(m * p / 100 * o.fe / o.M * H / 100, 4)}$ tấn ⇒ $m_{\\text{gang}} = \\dfrac{${tex(m * p / 100 * o.fe / o.M * H / 100, 4)}}{${tex(q / 100)}} ${ap(x, dp)}$ tấn.`,
      };
    },
  },
  {
    id: "h12k2-short-hon-hop-kim-loai-acid", ...P6, topic: "Hỗn hợp kim loại tác dụng với acid", level: 3, kind: "short",
    make: (r) => {
      const a = r.pick(ACIDM), x = r.int(1, 6) * 0.05, y = r.int(1, 6) * 0.05, mA = x * a.A, mCu = y * 64, m = round(mA + mCu, 2);
      const nH = x * a.v / 2, V = nH * VM;
      const head = `Cho ${vn(m)} gam hỗn hợp gồm ${a.M} và Cu vào dung dịch HCl dư, sau khi phản ứng xảy ra hoàn toàn thu được ${vn(V, 4)} lít khí $\\mathrm{H_2}$ (đkc, 1 mol khí chiếm 24,79 L).`;
      const step = `Cu không tác dụng với HCl. $n_{\\mathrm{H_2}} = \\dfrac{${tex(V, 4)}}{24{,}79} = ${tex(nH, 3)}$ mol ⇒ $n_{\\mathrm{${a.M}}} = ${a.v === 2 ? tex(x) : `\\dfrac{2}{3}\\cdot ${tex(nH, 3)} = ${tex(x)}`}$ mol ⇒ $m_{\\mathrm{${a.M}}} = ${tex(mA)}$ gam, $m_{\\mathrm{Cu}} = ${tex(m)} - ${tex(mA)} = ${tex(mCu)}$ gam`;
      if (r.chance(0.5)) {
        const p = mCu / m * 100;
        return { stem: `${head} Phần trăm khối lượng Cu trong hỗn hợp là bao nhiêu (làm tròn đến hàng phần mười)? ${cho(a.M, "Cu")}`, ...short(p, 1), explanation: `${step} ⇒ $\\%m_{\\mathrm{Cu}} = \\dfrac{${tex(mCu)}}{${tex(m)}}\\cdot 100\\% ${ap(p, 1)}\\%$.` };
      }
      const dp = dpOf(mCu);
      return { stem: `${head} Khối lượng chất rắn không tan còn lại là bao nhiêu gam (làm tròn đến ${RND[dp]})? ${cho(a.M, "Cu")}`, ...short(mCu, dp), explanation: `${step}. Chất rắn không tan là Cu: ${vn(mCu)} gam.` };
    },
  },
  {
    id: "h12k2-tf-kim-loai", ...P6, topic: "Kim loại – cấu tạo, tính chất, điều chế (đúng/sai)", level: 2, kind: "tf",
    make: (r) => {
      const D: Record<string, { cfg: string; wcfg: string; el: boolean; pas: boolean }> = {
        Mg: { cfg: "[Ne]3s^{2}", wcfg: "[Ne]3s^{1}3p^{1}", el: true, pas: false },
        Al: { cfg: "[Ne]3s^{2}3p^{1}", wcfg: "[Ne]3s^{1}3p^{2}", el: true, pas: true },
        Zn: { cfg: "[Ar]3d^{10}4s^{2}", wcfg: "[Ar]3d^{8}4s^{2}4p^{2}", el: false, pas: false },
        Fe: { cfg: "[Ar]3d^{6}4s^{2}", wcfg: "[Ar]3d^{8}", el: false, pas: true },
      };
      const a = r.pick(ACIDM), d = D[a.M], n = r.int(1, 6) * 0.05, m = round(n * a.A, 2), V = n * a.v / 2 * VM;
      const useEl = r.chance(0.5);
      const s2: [string, boolean] = useEl ? [`Trong công nghiệp, ${a.M} được sản xuất bằng phương pháp điện phân nóng chảy hợp chất của nó.`, d.el] : [`Có thể điều chế ${a.M} bằng cách dùng CO khử oxide của nó ở nhiệt độ cao.`, !d.el];
      return {
        stem: `Cho ${vn(m)} gam kim loại ${a.M} tác dụng hết với dung dịch HCl dư. ${cho(a.M)} (Ở đkc, 1 mol khí chiếm 24,79 L.)`,
        ...tf([
          pickTF(r, `Cấu hình electron của nguyên tử ${a.M} là ${ce(d.cfg)}.`, `Cấu hình electron của nguyên tử ${a.M} là ${ce(d.wcfg)}.`),
          s2,
          pickTF(r, `Thể tích khí $\\mathrm{H_2}$ thu được (đkc) là ${vn(V, 3)} L.`, `Thể tích khí $\\mathrm{H_2}$ thu được (đkc) là ${vn(a.v === 2 ? n * 1.5 * VM : n * VM, 3)} L.`),
          [`${a.M} bị thụ động hóa trong dung dịch $\\mathrm{HNO_3}$ đặc, nguội.`, d.pas],
        ]),
        explanation: `${a.M}: ${ce(d.cfg)}. ${d.el ? `${a.M} là kim loại hoạt động mạnh, chỉ điều chế được bằng điện phân nóng chảy; CO không khử được oxide của nó.` : `${a.M} được điều chế bằng nhiệt luyện (CO, C khử oxide), không sản xuất bằng điện phân nóng chảy.`} $n = \\dfrac{${tex(m)}}{${a.A}} = ${tex(n)}$ mol ⇒ $n_{\\mathrm{H_2}} = ${tex(n * a.v / 2, 3)}$ mol ⇒ $V = ${tex(V, 4)}$ L. ${d.pas ? `${a.M} bị thụ động hóa trong $\\mathrm{HNO_3}$, $\\mathrm{H_2SO_4}$ đặc, nguội.` : `${a.M} không bị thụ động hóa trong $\\mathrm{HNO_3}$ đặc, nguội (chỉ Al, Fe, Cr bị thụ động hóa).`}`,
      };
    },
  },

  /* ======================= HALF 2 – CHƯƠNG 7: NHÓM IA, IIA ======================= */
  {
    id: "h12k2-mau-ngon-lua-kiem", ...P7, topic: "Màu ngọn lửa, cấu hình kim loại nhóm IA, IIA", level: 1, kind: "mcq",
    make: (r) => {
      const FL: [string, string, string][] = [["Li", "đỏ tía", "LiCl"], ["Na", "vàng", "NaCl"], ["K", "tím nhạt", "KCl"], ["Ca", "đỏ cam", "CaCl_2"], ["Ba", "lục", "BaCl_2"]];
      const why = "Màu ngọn lửa: Li – đỏ tía, Na – vàng, K – tím nhạt, Ca – đỏ cam, Ba – lục.";
      const mode = r.int(0, 2);
      if (mode === 0) {
        const [e, c, s] = r.pick(FL), salt = r.chance(0.5) ? s : s.replace(/Cl(_2)?$/, (x) => (x === "Cl_2" ? "(NO_3)_2" : "{}NO_3"));
        return { stem: `Đốt nóng một ít muối ${ce(salt)} trên ngọn lửa đèn khí không màu, ngọn lửa có màu`, ...mcq(r, c, r.shuffle(FL.filter((x) => x[0] !== e)).map((x) => x[1])), explanation: `${why} Muối ${ce(salt)} chứa nguyên tố ${e}.` };
      }
      if (mode === 1) {
        const [e, c] = r.pick(FL);
        return { stem: `Khi thử màu ngọn lửa, một hợp chất cho ngọn lửa màu ${c}. Hợp chất đó chứa nguyên tố`, ...mcq(r, e, r.shuffle(FL.filter((x) => x[0] !== e)).map((x) => x[0])), explanation: why };
      }
      const ia = r.chance(0.5);
      return {
        stem: r.pick([`Cấu hình electron lớp ngoài cùng của nguyên tử kim loại ${ia ? "kiềm" : "kiềm thổ (nhóm IIA)"} là`, `Nguyên tử các nguyên tố nhóm ${ia ? "IA" : "IIA"} có cấu hình electron lớp ngoài cùng dạng`]),
        ...mcq(r, ce(ia ? "ns^{1}" : "ns^{2}"), r.shuffle([ia ? "ns^{2}" : "ns^{1}", "ns^{2}np^{1}", "(n-1)d^{1}ns^{2}", "ns^{2}np^{5}"]).map(ce)),
        explanation: `Nhóm IA có 1 electron lớp ngoài cùng ($\\mathrm{ns^1}$), nhóm IIA có 2 electron lớp ngoài cùng ($\\mathrm{ns^2}$).`,
      };
    },
  },
  {
    id: "h12k2-kim-loai-kiem-ly-thuyet", ...P7, topic: "Kim loại kiềm và hợp chất – lí thuyết", level: 1, kind: "mcq",
    make: (r) => theory(r, r.pick(["Về kim loại kiềm và hợp chất", "Khi nói về các nguyên tố nhóm IA", "Về sodium và hợp chất của sodium"]), [
      "Nguyên tử kim loại kiềm có 1 electron ở lớp ngoài cùng.",
      "Kim loại kiềm được bảo quản bằng cách ngâm chìm trong dầu hỏa.",
      "Kim loại kiềm có nhiệt độ nóng chảy thấp, khối lượng riêng nhỏ và mềm.",
      "Kim loại kiềm tác dụng mạnh với nước ở nhiệt độ thường, tạo dung dịch kiềm và khí $\\mathrm{H_2}$.",
      "$\\mathrm{NaHCO_3}$ được dùng làm bột nở trong thực phẩm và làm thuốc giảm đau dạ dày do thừa acid.",
      "$\\mathrm{Na_2CO_3}$ được dùng trong sản xuất thủy tinh, xà phòng.",
      "Trong hợp chất, kim loại kiềm chỉ có số oxi hóa +1.",
      "Kim loại kiềm được điều chế bằng cách điện phân nóng chảy muối halide của chúng.",
      "Trong nhóm IA, từ Li đến Cs, tính khử của kim loại tăng dần.",
    ], [
      ["Kim loại kiềm được bảo quản bằng cách ngâm trong nước.", "kim loại kiềm phản ứng mạnh với nước; phải ngâm trong dầu hỏa."],
      ["Kim loại kiềm có nhiệt độ nóng chảy cao và rất cứng.", "kim loại kiềm mềm, nhiệt độ nóng chảy thấp do liên kết kim loại yếu."],
      ["Trong nhóm IA, từ Li đến Cs, tính khử của kim loại giảm dần.", "bán kính nguyên tử tăng nên tính khử tăng dần từ Li đến Cs."],
      ["Có thể điều chế Na bằng cách điện phân dung dịch NaCl.", "điện phân dung dịch NaCl không thu được Na; phải điện phân NaCl nóng chảy."],
      ["Dung dịch $\\mathrm{Na_2CO_3}$ có môi trường acid.", "dung dịch $\\mathrm{Na_2CO_3}$ có môi trường base."],
      ["$\\mathrm{NaHCO_3}$ bền với nhiệt, không bị phân hủy khi đun nóng.", "$\\mathrm{NaHCO_3}$ bị nhiệt phân tạo $\\mathrm{Na_2CO_3}$, $\\mathrm{CO_2}$ và $\\mathrm{H_2O}$."],
      ["Nguyên tử kim loại kiềm có 2 electron ở lớp ngoài cùng.", "kim loại kiềm có cấu hình lớp ngoài cùng $\\mathrm{ns^1}$."],
    ]),
  },
  {
    id: "h12k2-kiem-tac-dung-nuoc", ...P7, topic: "Kim loại kiềm, kiềm thổ tác dụng với nước", level: 2, kind: "mcq",
    make: (r) => {
      const W = [{ M: "Li", A: 7, v: 1 }, { M: "Na", A: 23, v: 1 }, { M: "K", A: 39, v: 1 }, { M: "Ca", A: 40, v: 2 }, { M: "Ba", A: 137, v: 2 }];
      const a = r.pick(W), n = r.int(1, 8) * 0.05, m = round(n * a.A, 2), nH = n * a.v / 2, V = nH * VM;
      const hyd = a.v === 1 ? `${a.M}OH` : `${a.M}(OH)_2`, Mh = a.A + 17 * a.v;
      const eq = a.v === 1 ? ce(`2${a.M} + 2H_2O \\rightarrow 2${a.M}OH + H_2`) : ce(`${a.M} + 2H_2O \\rightarrow ${a.M}(OH)_2 + H_2`);
      if (r.chance(0.5)) return {
        stem: `Cho ${vn(m)} gam ${a.M} vào nước dư, thu được V lít khí $\\mathrm{H_2}$ (đkc, 1 mol khí chiếm 24,79 L). Giá trị của V là ${cho(a.M)}`,
        ...mcq(r, vn(V, 3), nums([a.v === 1 ? n * VM : n / 2 * VM, nH * 22.4, n * a.v * VM, 2 * V], 3)),
        explanation: `${eq}. $n_{\\mathrm{${a.M}}} = \\dfrac{${tex(m)}}{${a.A}} = ${tex(n)}$ mol ⇒ $n_{\\mathrm{H_2}} = ${tex(nH, 3)}$ mol ⇒ $V = ${tex(nH, 3)}\\cdot 24{,}79 = ${tex(V, 4)}$ L.`,
      };
      const x = n * Mh;
      return {
        stem: `Cho ${vn(m)} gam ${a.M} tác dụng hết với nước, thu được dung dịch chứa m gam ${ce(hyd)}. Giá trị của m là ${cho("H", "O", a.M)}`,
        ...mcq(r, vn(x), nums([n * (a.A + 17), n * (a.A + 34), n * (a.A + 16 * a.v), n * Mh / 2, 2 * n * Mh].filter((y) => Math.abs(y - x) > 1e-9))),
        explanation: `${eq}. $n_{\\mathrm{${hyd}}} = n_{\\mathrm{${a.M}}} = \\dfrac{${tex(m)}}{${a.A}} = ${tex(n)}$ mol ⇒ $m = ${tex(n)}\\cdot ${Mh} = ${tex(x)}$ gam.`,
      };
    },
  },
  {
    id: "h12k2-nhiet-phan-nahco3-hon-hop", ...P7, topic: "Nhiệt phân NaHCO₃ trong hỗn hợp", level: 3, kind: "mcq",
    make: (r) => {
      const x = r.int(2, 8) * 0.05, y = r.int(1, 6) * 0.05, m = round(84 * x + 106 * y, 2), dm = 31 * x, m2 = round(m - dm, 2);
      const p = 84 * x / m * 100;
      const w = [84 * (dm / 22) / m * 100, 84 * (dm / 62) / m * 100, 100 - p, 84 * (dm / 44) / m * 100].filter((v) => v > 0 && v < 100);
      return {
        stem: `Nung ${vn(m)} gam hỗn hợp X gồm $\\mathrm{NaHCO_3}$ và $\\mathrm{Na_2CO_3}$ đến khối lượng không đổi, thu được ${vn(m2)} gam chất rắn. Phần trăm khối lượng $\\mathrm{NaHCO_3}$ trong X là ${cho("H", "C", "O", "Na")}`,
        ...mcq(r, pct(p), w.map(pct)),
        explanation: `$\\mathrm{2NaHCO_3 \\xrightarrow{t^\\circ} Na_2CO_3 + CO_2 + H_2O}$; $\\mathrm{Na_2CO_3}$ không bị nhiệt phân. Khối lượng giảm $= m_{\\mathrm{CO_2}} + m_{\\mathrm{H_2O}}$: cứ 2 mol $\\mathrm{NaHCO_3}$ giảm 62 gam. $\\Delta m = ${tex(m)} - ${tex(m2)} = ${tex(dm)}$ gam ⇒ $n_{\\mathrm{NaHCO_3}} = \\dfrac{2\\cdot ${tex(dm)}}{62} = ${tex(x)}$ mol ⇒ $\\%m = \\dfrac{${tex(x)}\\cdot 84}{${tex(m)}}\\cdot 100\\% ${ap(p, 1)}\\%$.`,
      };
    },
  },
  {
    id: "h12k2-nhom-iia-ly-thuyet", ...P7, topic: "Nguyên tố nhóm IIA và hợp chất – lí thuyết", level: 1, kind: "mcq",
    make: (r) => theory(r, r.pick(["Về các nguyên tố nhóm IIA", "Khi nói về kim loại nhóm IIA và hợp chất", "Về calcium, magnesium và hợp chất"]), [
      "Nguyên tử các nguyên tố nhóm IIA có 2 electron ở lớp ngoài cùng.",
      "Beryllium không tác dụng với nước kể cả khi đun nóng.",
      "Calcium, strontium và barium tác dụng với nước ở nhiệt độ thường.",
      "Độ tan trong nước của các hydroxide nhóm IIA tăng dần từ $\\mathrm{Mg(OH)_2}$ đến $\\mathrm{Ba(OH)_2}$.",
      "Độ tan trong nước của các muối sulfate nhóm IIA giảm dần từ $\\mathrm{MgSO_4}$ đến $\\mathrm{BaSO_4}$.",
      "Thạch cao nung được dùng để bó bột khi gãy xương, đúc tượng.",
      "Nhiệt phân $\\mathrm{CaCO_3}$ thu được vôi sống CaO và khí $\\mathrm{CO_2}$.",
      "Trong hợp chất, các nguyên tố nhóm IIA có số oxi hóa +2.",
    ], [
      ["Tất cả các kim loại nhóm IIA đều tác dụng mạnh với nước ở nhiệt độ thường.", "Be không tác dụng với nước, Mg phản ứng rất chậm với nước ở nhiệt độ thường."],
      ["Độ tan của các hydroxide nhóm IIA giảm dần từ $\\mathrm{Mg(OH)_2}$ đến $\\mathrm{Ba(OH)_2}$.", "độ tan của hydroxide tăng dần từ Mg đến Ba."],
      ["$\\mathrm{BaSO_4}$ tan tốt trong nước.", "$\\mathrm{BaSO_4}$ hầu như không tan trong nước."],
      ["Nhiệt phân $\\mathrm{CaCO_3}$ thu được Ca và $\\mathrm{CO_2}$.", "nhiệt phân $\\mathrm{CaCO_3}$ thu được CaO và $\\mathrm{CO_2}$."],
      ["Nguyên tử các nguyên tố nhóm IIA có 1 electron ở lớp ngoài cùng.", "nhóm IIA có cấu hình lớp ngoài cùng $\\mathrm{ns^2}$."],
      ["Thạch cao sống có công thức $\\mathrm{CaSO_4}$.", "thạch cao sống là $\\mathrm{CaSO_4\\cdot 2H_2O}$; $\\mathrm{CaSO_4}$ là thạch cao khan."],
      ["Trong hợp chất, các nguyên tố nhóm IIA có số oxi hóa +1.", "số oxi hóa đặc trưng của nhóm IIA là +2."],
    ]),
  },
  {
    id: "h12k2-hop-chat-ten-thuong", ...P7, topic: "Tên thường và công thức hợp chất nhóm IA, IIA", level: 1, kind: "mcq",
    make: (r) => {
      const CPD: [string, string][] = [
        ["vôi sống", "CaO"], ["vôi tôi", "Ca(OH)_2"], ["đá vôi", "CaCO_3"], ["thạch cao sống", "CaSO_4\\cdot 2H_2O"], ["soda", "Na_2CO_3"],
        ["baking soda (thuốc muối)", "NaHCO_3"], ["xút ăn da", "NaOH"], ["muối ăn", "NaCl"], ["dolomite", "CaCO_3\\cdot MgCO_3"],
      ];
      const [n, f] = r.pick(CPD), o = r.shuffle(CPD.filter((x) => x[0] !== n));
      const why = `Vôi sống: CaO; vôi tôi: $\\mathrm{Ca(OH)_2}$; đá vôi: $\\mathrm{CaCO_3}$; thạch cao sống: $\\mathrm{CaSO_4\\cdot 2H_2O}$; soda: $\\mathrm{Na_2CO_3}$; baking soda: $\\mathrm{NaHCO_3}$; xút ăn da: NaOH; dolomite: $\\mathrm{CaCO_3\\cdot MgCO_3}$.`;
      if (r.chance(0.5)) return { stem: `Công thức hóa học của ${n} là`, ...mcq(r, ce(f), o.map((x) => ce(x[1]))), explanation: why };
      return { stem: `Chất có công thức ${ce(f)} có tên thường là`, ...mcq(r, n, o.map((x) => x[0])), explanation: why };
    },
  },
  {
    id: "h12k2-nuoc-cung", ...P7, topic: "Nước cứng – phân loại và làm mềm", level: 2, kind: "mcq",
    make: (r) => {
      const why = "Nước cứng chứa nhiều ion $\\mathrm{Ca^{2+}}$, $\\mathrm{Mg^{2+}}$. Nước cứng tạm thời chứa anion $\\mathrm{HCO_3^-}$ (đun sôi hoặc dùng lượng vừa đủ $\\mathrm{Ca(OH)_2}$ làm mềm được); nước cứng vĩnh cửu chứa $\\mathrm{Cl^-}$, $\\mathrm{SO_4^{2-}}$; nước cứng toàn phần có cả hai loại. $\\mathrm{Na_2CO_3}$, $\\mathrm{Na_3PO_4}$ và phương pháp trao đổi ion làm mềm được mọi loại nước cứng.";
      const mode = r.int(0, 2);
      const TY = ["nước cứng tạm thời", "nước cứng vĩnh cửu", "nước cứng toàn phần", "nước mềm"];
      if (mode === 0) {
        const SETS: [string[], number][] = [
          [["Ca^{2+}", "Mg^{2+}", "HCO_3^{-}"], 0], [["Ca^{2+}", "HCO_3^{-}"], 0], [["Mg^{2+}", "HCO_3^{-}"], 0],
          [["Ca^{2+}", "Mg^{2+}", "Cl^{-}", "SO_4^{2-}"], 1], [["Ca^{2+}", "Cl^{-}"], 1], [["Mg^{2+}", "SO_4^{2-}"], 1], [["Ca^{2+}", "Mg^{2+}", "Cl^{-}"], 1],
          [["Ca^{2+}", "Mg^{2+}", "HCO_3^{-}", "Cl^{-}"], 2], [["Ca^{2+}", "HCO_3^{-}", "SO_4^{2-}"], 2], [["Mg^{2+}", "HCO_3^{-}", "Cl^{-}"], 2],
          [["Na^{+}", "K^{+}", "Cl^{-}"], 3], [["Na^{+}", "HCO_3^{-}", "Cl^{-}"], 3],
        ];
        const [ions, ty] = r.pick(SETS);
        return { stem: `Một mẫu nước chứa các ion: ${r.shuffle([...ions]).map(ce).join(", ")} (bỏ qua các ion khác với nồng độ rất nhỏ). Mẫu nước trên thuộc loại`, ...mcq(r, TY[ty], TY.filter((_, i) => i !== ty)), explanation: why };
      }
      if (mode === 1) {
        const perm = r.chance(0.5);
        const good = perm ? ["Na_2CO_3", "Na_3PO_4"] : ["Na_2CO_3", "Na_3PO_4", "Ca(OH)_2"];
        const bad = perm ? ["NaCl", "HCl", "Ca(OH)_2", "Na{}NO_3", "Na_2SO_4"] : ["NaCl", "HCl", "Na{}NO_3", "Na_2SO_4", "CaCl_2"];
        return { stem: `Chất nào sau đây có thể dùng để làm mềm nước cứng ${perm ? "vĩnh cửu" : "tạm thời"}?`, ...mcq(r, ce(r.pick(good)), r.shuffle(bad).map(ce)), explanation: why };
      }
      const q = r.pick([
        { s: "Đun sôi nước có thể làm mềm được loại nước cứng nào?", a: "nước cứng tạm thời", w: ["nước cứng vĩnh cửu", "nước cứng toàn phần", "mọi loại nước cứng"] },
        { s: "Nước cứng là nước chứa nhiều ion", a: "$\\mathrm{Ca^{2+}}$ và $\\mathrm{Mg^{2+}}$", w: ["$\\mathrm{Na^+}$ và $\\mathrm{K^+}$", "$\\mathrm{Cl^-}$ và $\\mathrm{SO_4^{2-}}$", "$\\mathrm{HCO_3^-}$ và $\\mathrm{Cl^-}$", "$\\mathrm{Na^+}$ và $\\mathrm{Ca^{2+}}$"] },
        { s: "Nước cứng vĩnh cửu chứa các anion nào sau đây?", a: "$\\mathrm{Cl^-}$, $\\mathrm{SO_4^{2-}}$", w: ["$\\mathrm{HCO_3^-}$", "$\\mathrm{HCO_3^-}$, $\\mathrm{Cl^-}$", "$\\mathrm{CO_3^{2-}}$, $\\mathrm{PO_4^{3-}}$"] },
        { s: "Tác hại nào sau đây KHÔNG phải do nước cứng gây ra?", a: "Làm quần áo nhanh phai màu do phản ứng với thuốc nhuộm", w: ["Làm giảm khả năng tạo bọt của xà phòng", "Tạo cặn trong nồi hơi, ấm đun nước", "Làm tắc đường ống dẫn nước nóng", "Làm thực phẩm khó nấu chín"] },
      ]);
      return { stem: q.s, ...mcq(r, q.a, r.shuffle([...q.w])), explanation: why };
    },
  },
  {
    id: "h12k2-co2-tac-dung-kiem-tho", ...P7, topic: "CO₂ tác dụng với dung dịch Ca(OH)₂, Ba(OH)₂", level: 3, kind: "mcq",
    make: (r) => {
      const B = r.pick([{ M: "Ca", P: 100, h: "Ca(OH)_2", c: "CaCO_3" }, { M: "Ba", P: 197, h: "Ba(OH)_2", c: "BaCO_3" }]);
      const b = r.int(2, 8) * 0.05, a = round(r.chance(0.7) ? b + r.int(1, 7) * 0.025 * (b / 0.1) : b * r.pick([0.5, 0.6, 0.8]), 4);
      need(a < 2 * b - 0.01 && a > 0 && Math.abs(a - b) > 1e-6 && round(a, 3) === a);
      const V = a * VM, prec = a <= b ? a : 2 * b - a, x = prec * B.P;
      const step = a <= b
        ? `$\\dfrac{n_{\\mathrm{OH^-}}}{n_{\\mathrm{CO_2}}} = \\dfrac{${tex(2 * b, 3)}}{${tex(a, 3)}} \\geq 2$ ⇒ chỉ tạo ${ce(B.c)}: $n_{\\downarrow} = n_{\\mathrm{CO_2}} = ${tex(a, 3)}$ mol`
        : `$1 < \\dfrac{n_{\\mathrm{OH^-}}}{n_{\\mathrm{CO_2}}} = \\dfrac{${tex(2 * b, 3)}}{${tex(a, 3)}} < 2$ ⇒ tạo cả ${ce(B.c)} và ${ce(`${B.M}(HCO_3)_2`)}: $n_{\\downarrow} = n_{\\mathrm{OH^-}} - n_{\\mathrm{CO_2}} = ${tex(2 * b, 3)} - ${tex(a, 3)} = ${tex(prec, 3)}$ mol`;
      return {
        stem: `Hấp thụ hoàn toàn ${vn(V, 4)} lít khí $\\mathrm{CO_2}$ (đkc, 1 mol khí chiếm 24,79 L) vào dung dịch chứa ${vn(b)} mol ${ce(B.h)}, thu được m gam kết tủa. Giá trị của m là ${cho("C", "O", B.M)}`,
        ...mcq(r, vn(x), nums([a * B.P, b * B.P, Math.abs(a - b) * B.P, (2 * b - a) * B.P, a / 2 * B.P].filter((y) => Math.abs(y - x) > 1e-9))),
        explanation: `$n_{\\mathrm{CO_2}} = ${tex(a, 3)}$ mol; $n_{\\mathrm{OH^-}} = 2\\cdot ${tex(b)} = ${tex(2 * b, 3)}$ mol. ${step} ⇒ $m = ${tex(prec, 3)}\\cdot ${B.P} = ${tex(x)}$ gam.`,
      };
    },
  },
  {
    id: "h12k2-short-nung-da-voi", ...P7, topic: "Nhiệt phân đá vôi sản xuất vôi sống", level: 2, kind: "short",
    make: (r) => {
      const m = r.pick([1, 2, 5, 10, 20, 50]), p = r.pick([80, 85, 90, 95]), H = r.pick([70, 75, 80, 85, 90]);
      const unit = r.chance(0.5) ? "tấn" : "kg";
      if (r.chance(0.5)) {
        const x = m * p / 100 * H / 100 * 56 / 100, dp = dpOf(x);
        return {
          stem: `Nung ${m} ${unit} đá vôi chứa ${p}% $\\mathrm{CaCO_3}$ (còn lại là tạp chất trơ) với hiệu suất phản ứng ${H}%. Khối lượng vôi sống CaO thu được là bao nhiêu ${unit} (làm tròn đến ${RND[dp]})? ${cho("C", "O", "Ca")}`,
          ...short(x, dp),
          explanation: `$\\mathrm{CaCO_3 \\xrightarrow{t^\\circ} CaO + CO_2}$: 100 ${unit} $\\mathrm{CaCO_3}$ → 56 ${unit} CaO. $m_{\\mathrm{CaO}} = ${m}\\cdot ${tex(p / 100)}\\cdot ${tex(H / 100)}\\cdot \\dfrac{56}{100} ${ap(x, dp)}$ ${unit}.`,
        };
      }
      const x = m * p / 100 * H / 100 * 44 / 100, dp = dpOf(x);
      return {
        stem: `Nung ${m} ${unit} đá vôi chứa ${p}% $\\mathrm{CaCO_3}$ (còn lại là tạp chất trơ) với hiệu suất phản ứng ${H}%. Khối lượng khí $\\mathrm{CO_2}$ thải ra là bao nhiêu ${unit} (làm tròn đến ${RND[dp]})? ${cho("C", "O", "Ca")}`,
        ...short(x, dp),
        explanation: `$\\mathrm{CaCO_3 \\xrightarrow{t^\\circ} CaO + CO_2}$: 100 ${unit} $\\mathrm{CaCO_3}$ → 44 ${unit} $\\mathrm{CO_2}$. $m_{\\mathrm{CO_2}} = ${m}\\cdot ${tex(p / 100)}\\cdot ${tex(H / 100)}\\cdot \\dfrac{44}{100} ${ap(x, dp)}$ ${unit}.`,
      };
    },
  },
  {
    id: "h12k2-short-lam-mem-nuoc-cung", ...P7, topic: "Làm mềm nước cứng – tính lượng hóa chất", level: 3, kind: "short",
    make: (r) => {
      const a = r.int(1, 5), b = r.int(1, 4), V = r.pick([10, 20, 50, 100, 200]);
      const useP = r.chance(0.4), n = (a + b) * V / 1000; // mol M2+
      const x = useP ? n * 2 / 3 * 164 : n * 106, dp = dpOf(x);
      const reag = useP ? "Na_3PO_4" : "Na_2CO_3";
      return {
        stem: `Một mẫu nước cứng chứa các ion $\\mathrm{Ca^{2+}}$ (${a} mmol/L), $\\mathrm{Mg^{2+}}$ (${b} mmol/L) cùng các anion $\\mathrm{Cl^-}$, $\\mathrm{SO_4^{2-}}$. Để làm mềm hoàn toàn ${V} lít mẫu nước này cần tối thiểu bao nhiêu gam ${ce(reag)} (làm tròn đến ${RND[dp]})? ${useP ? cho("O", "Na", "P") : cho("C", "O", "Na")}`,
        ...short(x, dp),
        explanation: `$n_{\\mathrm{Ca^{2+}}} + n_{\\mathrm{Mg^{2+}}} = (${a} + ${b})\\cdot ${V} = ${(a + b) * V}$ mmol $= ${tex(n, 3)}$ mol. ${useP ? `$\\mathrm{3M^{2+} + 2PO_4^{3-} \\rightarrow M_3(PO_4)_2}$ ⇒ $n_{\\mathrm{Na_3PO_4}} = \\dfrac{2}{3}\\cdot ${tex(n, 3)}$ mol ⇒ $m = \\dfrac{2}{3}\\cdot ${tex(n, 3)}\\cdot 164 ${ap(x, dp)}$ gam.` : `$\\mathrm{M^{2+} + CO_3^{2-} \\rightarrow MCO_3}$ ⇒ $n_{\\mathrm{Na_2CO_3}} = ${tex(n, 3)}$ mol ⇒ $m = ${tex(n, 3)}\\cdot 106 ${ap(x, dp)}$ gam.`}`,
      };
    },
  },
  {
    id: "h12k2-tf-natri-hydrocarbonat", ...P7, topic: "NaHCO₃ và Na₂CO₃ – đúng/sai", level: 2, kind: "tf",
    make: (r) => {
      const n = r.int(2, 10) * 0.05, m = round(n * 84, 2), ms = n / 2 * 106, V = n / 2 * VM;
      const ctx = r.pick(["Thuốc muối (thành phần chính là $\\mathrm{NaHCO_3}$) được dùng để giảm đau dạ dày do thừa acid.", "Baking soda ($\\mathrm{NaHCO_3}$) được dùng làm bột nở trong chế biến bánh.", "Soda ($\\mathrm{Na_2CO_3}$) và baking soda ($\\mathrm{NaHCO_3}$) là hai muối quan trọng của sodium."]);
      return {
        stem: `${ctx} Nung ${vn(m)} gam $\\mathrm{NaHCO_3}$ đến khối lượng không đổi. ${cho("H", "C", "O", "Na")} (Ở đkc, 1 mol khí chiếm 24,79 L.)`,
        ...tf([
          pickTF(r, "$\\mathrm{NaHCO_3}$ tác dụng được với cả dung dịch HCl và dung dịch NaOH.", "$\\mathrm{NaHCO_3}$ chỉ tác dụng được với dung dịch acid, không tác dụng với dung dịch NaOH."),
          pickTF(r, "Chất rắn thu được sau khi nung là $\\mathrm{Na_2CO_3}$.", "Chất rắn thu được sau khi nung là $\\mathrm{Na_2O}$."),
          r.chance(0.5)
            ? pickTF(r, `Khối lượng chất rắn thu được sau khi nung là ${vn(ms)} gam.`, `Khối lượng chất rắn thu được sau khi nung là ${vn(n * 106)} gam.`)
            : pickTF(r, `Thể tích khí $\\mathrm{CO_2}$ thoát ra (đkc) là ${vn(V, 3)} L.`, `Thể tích khí $\\mathrm{CO_2}$ thoát ra (đkc) là ${vn(n * VM, 3)} L.`),
          pickTF(r, "Dung dịch $\\mathrm{Na_2CO_3}$ làm dung dịch phenolphthalein chuyển sang màu hồng.", "Dung dịch $\\mathrm{Na_2CO_3}$ có pH nhỏ hơn 7."),
        ]),
        explanation: `$\\mathrm{NaHCO_3}$ lưỡng tính: $\\mathrm{NaHCO_3 + HCl \\rightarrow NaCl + CO_2 + H_2O}$; $\\mathrm{NaHCO_3 + NaOH \\rightarrow Na_2CO_3 + H_2O}$. $\\mathrm{2NaHCO_3 \\xrightarrow{t^\\circ} Na_2CO_3 + CO_2 + H_2O}$: $n = \\dfrac{${tex(m)}}{84} = ${tex(n)}$ mol ⇒ $m_{\\mathrm{Na_2CO_3}} = \\dfrac{${tex(n)}}{2}\\cdot 106 = ${tex(ms)}$ gam; $V_{\\mathrm{CO_2}} = \\dfrac{${tex(n)}}{2}\\cdot 24{,}79 = ${tex(V, 4)}$ L. Dung dịch $\\mathrm{Na_2CO_3}$ có môi trường base (pH > 7).`,
      };
    },
  },
  {
    id: "h12k2-tf-nuoc-cung", ...P7, topic: "Nước cứng – đúng/sai", level: 3, kind: "tf",
    make: (r) => {
      const a = r.int(1, 4), b = r.int(1, 3), tot = 2 * (a + b), ty = r.int(0, 2), V = r.pick([10, 20, 50, 100]);
      let hc = 0, cl = 0, so = 0;
      if (ty === 0) hc = tot;
      else if (ty === 1) { so = r.int(1, a + b - 1 || 1); cl = tot - 2 * so; need(cl > 0); }
      else { hc = 2 * r.int(1, a + b - 1 || 1); cl = tot - hc; need(cl > 0); }
      const an = [hc ? `$\\mathrm{HCO_3^-}$ (${hc} mmol/L)` : "", cl ? `$\\mathrm{Cl^-}$ (${cl} mmol/L)` : "", so ? `$\\mathrm{SO_4^{2-}}$ (${so} mmol/L)` : ""].filter(Boolean).join(", ");
      const TY = ["tạm thời", "vĩnh cửu", "toàn phần"], mNa = (a + b) * V / 1000 * 106;
      const wrongTy = TY[r.pick([0, 1, 2].filter((i) => i !== ty))];
      return {
        stem: `Một mẫu nước giếng chứa các ion: $\\mathrm{Ca^{2+}}$ (${a} mmol/L), $\\mathrm{Mg^{2+}}$ (${b} mmol/L), ${an}; bỏ qua các ion khác. Xét ${V} lít mẫu nước này. ${cho("C", "O", "Na")}`,
        ...tf([
          pickTF(r, `Mẫu nước trên là nước cứng ${TY[ty]}.`, `Mẫu nước trên là nước cứng ${wrongTy}.`),
          [`Đun sôi kĩ mẫu nước trên có thể làm mất hoàn toàn tính cứng.`, ty === 0],
          pickTF(r, "Có thể dùng dung dịch $\\mathrm{Na_3PO_4}$ để làm mềm mẫu nước trên.", "Có thể dùng dung dịch NaCl để làm mềm mẫu nước trên."),
          pickTF(r, `Để làm mềm hoàn toàn ${V} lít mẫu nước cần tối thiểu ${vn(mNa, 3)} gam $\\mathrm{Na_2CO_3}$.`, `Để làm mềm hoàn toàn ${V} lít mẫu nước cần tối thiểu ${vn(a * V / 1000 * 106, 3)} gam $\\mathrm{Na_2CO_3}$.`),
        ]),
        explanation: `Nước chứa ${ty === 0 ? "anion $\\mathrm{HCO_3^-}$ duy nhất ⇒ nước cứng tạm thời, đun sôi làm mất hết tính cứng ($\\mathrm{M(HCO_3)_2 \\xrightarrow{t^\\circ} MCO_3 + CO_2 + H_2O}$)" : ty === 1 ? "anion $\\mathrm{Cl^-}$, $\\mathrm{SO_4^{2-}}$ ⇒ nước cứng vĩnh cửu, đun sôi không làm mềm được" : "cả $\\mathrm{HCO_3^-}$ và $\\mathrm{Cl^-}$ ⇒ nước cứng toàn phần, đun sôi chỉ làm mất tính cứng tạm thời"}. $\\mathrm{Na_3PO_4}$, $\\mathrm{Na_2CO_3}$ làm mềm được mọi loại nước cứng; NaCl không làm mềm được. $n_{\\mathrm{Na_2CO_3}} = n_{\\mathrm{Ca^{2+}}} + n_{\\mathrm{Mg^{2+}}} = (${a} + ${b})\\cdot ${V} = ${(a + b) * V}$ mmol ⇒ $m = ${tex((a + b) * V / 1000, 3)}\\cdot 106 = ${tex(mNa, 3)}$ gam.`,
      };
    },
  },

  /* ======================= HALF 2 – CHƯƠNG 8: KIM LOẠI CHUYỂN TIẾP, PHỨC CHẤT ======================= */
  {
    id: "h12k2-chuyen-tiep-cau-hinh", ...P8, topic: "Cấu hình electron nguyên tử, ion kim loại chuyển tiếp", level: 2, kind: "mcq",
    make: (r) => {
      const mode = r.int(0, 2);
      if (mode === 0) {
        const a = r.pick(TM), sp = a.s4 === 1;
        const near = [...TM].filter((x) => x !== a).sort((x, y) => Math.abs(x.z - a.z) - Math.abs(y.z - a.z)).map((x) => cfgT(x.d, x.s4));
        const w = [...(sp ? [cfgT(a.d - 1, 2)] : []), cfgT(a.d + a.s4, 0), ...near];
        return {
          stem: `Cấu hình electron của nguyên tử ${a.s} (Z = ${a.z}) là`, ...mcq(r, ce(cfgT(a.d, a.s4)), w.map(ce)),
          explanation: `${a.s} (Z = ${a.z}): ${ce(cfgT(a.d, a.s4))}.${sp ? " Cấu hình phân lớp 3d bán bão hòa ($\\mathrm{3d^5}$) hoặc bão hòa ($\\mathrm{3d^{10}}$) bền hơn nên một electron 4s chuyển vào 3d." : ""}`,
        };
      }
      const [s, q] = r.pick(TION), a = TM.find((x) => x.s === s)!, tot = a.d + a.s4 - q;
      if (mode === 1) {
        const w = [a.d - q >= 0 ? cfgT(a.d - q, a.s4) : "", cfgT(tot - 1, 1), a.s4 - q >= 0 && a.d !== tot ? cfgT(a.d, a.s4 - q) : "", cfgT(tot + 1, 0), cfgT(tot - 1, 0)].filter(Boolean);
        return {
          stem: `Cấu hình electron của ion ${ce(`${s}^{${chg(q)}}`)} (Z của ${s} = ${a.z}) là`, ...mcq(r, ce(cfgT(tot, 0)), w.map(ce)),
          explanation: `${s}: ${ce(cfgT(a.d, a.s4))}. Khi tạo ion, nguyên tử kim loại chuyển tiếp nhường electron ở phân lớp 4s trước rồi mới đến 3d ⇒ ${ce(`${s}^{${chg(q)}}`)}: ${ce(cfgT(tot, 0))}.`,
        };
      }
      const others = r.shuffle(TION.filter(([s2, q2]) => { const b = TM.find((x) => x.s === s2)!; return b.d + b.s4 - q2 !== tot; })).map(([s2, q2]) => ce(`${s2}^{${chg(q2)}}`));
      return {
        stem: `Ion nào sau đây có cấu hình electron ${ce(cfgT(tot, 0))}?`, ...mcq(r, ce(`${s}^{${chg(q)}}`), others),
        explanation: `${s} (Z = ${a.z}): ${ce(cfgT(a.d, a.s4))}; nhường ${q} electron (4s trước, 3d sau) được ${ce(`${s}^{${chg(q)}}`)}: ${ce(cfgT(tot, 0))}.`,
      };
    },
  },
  {
    id: "h12k2-phuc-chat-cau-tao", ...P8, topic: "Phức chất – nguyên tử trung tâm, phối tử, số phối trí", level: 1, kind: "mcq",
    make: (r) => {
      const x = r.pick(CXS), mode = r.int(0, 2), N = cxN(x);
      if (mode === 0) return { stem: `Số phối trí của nguyên tử trung tâm trong phức chất ${ce(x.f)} là`, ...mcq(r, String(N), r.shuffle([2, 3, 4, 5, 6, 8].filter((v) => v !== N)).map(String)), explanation: cxWhy(x) };
      if (mode === 1) {
        const donors = [...new Set(x.L.map((l) => l[3]))];
        return { stem: `Nguyên tử trung tâm trong phức chất ${ce(x.f)} là`, ...mcq(r, x.c, r.shuffle([...donors, ...x.L.map((l) => ce(l[0])), "H", "Pt", "Fe", "Cu"].filter((v) => v !== x.c))), explanation: cxWhy(x) };
      }
      const w = r.shuffle([ce(x.c), ...x.L.map((l) => ce(l[3])), ...CXS.flatMap((y) => y.L.map((l) => ce(l[0])))].filter((v) => v !== cxLig(x)));
      return { stem: `Phối tử trong phức chất ${ce(x.f)} là`, ...mcq(r, cxLig(x), w), explanation: cxWhy(x) };
    },
  },
  {
    id: "h12k2-phuc-chat-so-oxi-hoa", ...P8, topic: "Số oxi hóa nguyên tử trung tâm, điện tích phức chất", level: 2, kind: "mcq",
    make: (r) => {
      const x = r.pick(CXS), o = cxOx(x);
      if (r.chance(0.6)) {
        const w = [x.q, o + 1, o - 1, o + 2, -o, cxN(x)].filter((v) => v !== o).map(ox);
        return { stem: `Số oxi hóa của nguyên tử trung tâm trong phức chất ${ce(x.f)} là`, ...mcq(r, ox(o), w), explanation: cxWhy(x) };
      }
      const desc = x.L.map((l) => `${l[1]} phối tử ${ce(l[0])}`).join(" và ");
      const qs = (q: number) => (q === 0 ? "0 (phức chất trung hòa)" : ox(q));
      const w = [o, -x.q, x.q + 1, x.q - 1, o + cxN(x)].filter((v) => v !== x.q).map(qs);
      return {
        stem: `Một phức chất được tạo thành từ ion ${ce(`${x.c}${o ? `^{${o}+}` : ""}`)}${o === 0 ? " (nguyên tử " + x.c + " có số oxi hóa 0)" : ""} và ${desc}. Điện tích của phức chất đó là`,
        ...mcq(r, qs(x.q), w), explanation: `Điện tích phức chất = số oxi hóa của nguyên tử trung tâm + tổng điện tích các phối tử = $${ox(o)} + (${cxLsum(x)}) = ${x.q}$. Phức chất là ${ce(x.f)}.`,
      };
    },
  },
  {
    id: "h12k2-sat-dong-crom-ly-thuyet", ...P8, topic: "Tính chất kim loại chuyển tiếp (Fe, Cu, Cr)", level: 1, kind: "mcq",
    make: (r) => theory(r, r.pick(["Về sắt, đồng, chromium và hợp chất", "Khi nói về kim loại chuyển tiếp dãy thứ nhất", "Về tính chất của Fe, Cu, Cr"]), [
      "Sắt tác dụng với dung dịch HCl tạo muối iron(II) chloride và khí $\\mathrm{H_2}$.",
      "Sắt cháy trong khí chlorine tạo iron(III) chloride.",
      "Đồng không tác dụng với dung dịch HCl và dung dịch $\\mathrm{H_2SO_4}$ loãng.",
      "Đồng tác dụng được với dung dịch $\\mathrm{FeCl_3}$ tạo $\\mathrm{FeCl_2}$ và $\\mathrm{CuCl_2}$.",
      "Sắt và chromium bị thụ động hóa trong dung dịch $\\mathrm{HNO_3}$ đặc, nguội.",
      "Chromium là kim loại cứng nhất.",
      "Ion $\\mathrm{Fe^{2+}}$ vừa có tính oxi hóa vừa có tính khử.",
      "Kim loại chuyển tiếp dãy thứ nhất thường có nhiều số oxi hóa trong hợp chất.",
    ], [
      ["Sắt tác dụng với dung dịch HCl tạo $\\mathrm{FeCl_3}$ và $\\mathrm{H_2}$.", "sắt tác dụng với HCl chỉ tạo $\\mathrm{FeCl_2}$."],
      ["Đồng tác dụng với dung dịch $\\mathrm{H_2SO_4}$ loãng giải phóng khí $\\mathrm{H_2}$.", "đồng có thế điện cực chuẩn dương, không khử được $\\mathrm{H^+}$."],
      ["Sắt tác dụng mạnh với dung dịch $\\mathrm{HNO_3}$ đặc, nguội giải phóng khí $\\mathrm{NO_2}$.", "sắt bị thụ động hóa trong $\\mathrm{HNO_3}$ đặc, nguội."],
      ["Đồng không tác dụng được với dung dịch $\\mathrm{FeCl_3}$.", "$\\mathrm{Cu + 2FeCl_3 \\rightarrow CuCl_2 + 2FeCl_2}$."],
      ["Sắt cháy trong khí chlorine tạo $\\mathrm{FeCl_2}$.", "chlorine là chất oxi hóa mạnh, đưa sắt lên số oxi hóa +3 tạo $\\mathrm{FeCl_3}$."],
      ["Kim loại chuyển tiếp dãy thứ nhất chỉ có một số oxi hóa duy nhất trong hợp chất.", "chúng thường có nhiều số oxi hóa (vd Fe: +2, +3; Cr: +2, +3, +6)."],
      ["Kim loại chuyển tiếp dãy thứ nhất thường mềm và có nhiệt độ nóng chảy thấp hơn kim loại kiềm.", "chúng thường cứng, khối lượng riêng lớn, nhiệt độ nóng chảy cao hơn nhiều so với kim loại kiềm."],
    ]),
  },
  {
    id: "h12k2-mau-hop-chat-chuyen-tiep", ...P8, topic: "Màu sắc hợp chất kim loại chuyển tiếp", level: 1, kind: "mcq",
    make: (r) => {
      const COL: [string, string, string][] = [
        ["Fe(OH)_3", "nâu đỏ", "kết tủa"], ["Fe(OH)_2", "trắng hơi xanh", "kết tủa"], ["Cu(OH)_2", "xanh lam", "kết tủa"], ["K_2Cr_2O_7", "da cam", "dung dịch"],
        ["K_2CrO_4", "vàng", "dung dịch"], ["Cr_2O_3", "lục thẫm", "chất rắn"], ["KMnO_4", "tím", "dung dịch"], ["CuSO_4", "trắng", "chất rắn khan"],
      ];
      const why = COL.map(([f, c, s]) => `${s} ${ce(f)}: ${c}`).join("; ") + ".";
      const [f, c, s] = r.pick(COL), o = r.shuffle(COL.filter((x) => x[0] !== f));
      if (r.chance(0.5)) return { stem: `${s[0].toUpperCase() + s.slice(1)} ${ce(f)} có màu`, ...mcq(r, c, o.map((x) => x[1])), explanation: why };
      return { stem: `Chất nào sau đây (ở dạng ${s}) có màu ${c}?`, ...mcq(r, ce(f), o.map((x) => ce(x[0]))), explanation: why };
    },
  },
  {
    id: "h12k2-sat-tinh-toan", ...P8, topic: "Sắt, đồng – phản ứng và tính toán", level: 2, kind: "mcq",
    make: (r) => {
      const n = r.int(1, 8) * 0.05, mode = r.int(0, 2);
      if (mode === 0) {
        const m = round(n * 56, 2), x = n * 127;
        return {
          stem: `Hòa tan hoàn toàn ${vn(m)} gam Fe trong dung dịch HCl dư, cô cạn dung dịch thu được m gam muối khan. Giá trị của m là ${cho("Cl", "Fe")}`,
          ...mcq(r, vn(x), nums([n * 162.5, m + 73 * n, m + 35.5 * n])),
          explanation: `$\\mathrm{Fe + 2HCl \\rightarrow FeCl_2 + H_2}$ (HCl chỉ oxi hóa Fe lên +2). $n_{\\mathrm{FeCl_2}} = n_{\\mathrm{Fe}} = ${tex(n)}$ mol ⇒ $m = ${tex(n)}\\cdot 127 = ${tex(x)}$ gam.`,
        };
      }
      if (mode === 1) {
        const m = round(n * 56, 2), x = n * 162.5;
        return {
          stem: `Đốt cháy hoàn toàn ${vn(m)} gam Fe trong khí $\\mathrm{Cl_2}$ dư, thu được m gam muối. Giá trị của m là ${cho("Cl", "Fe")}`,
          ...mcq(r, vn(x), nums([n * 127, m + 35.5 * n, 2 * n * 162.5, n * 162.5 / 2])),
          explanation: `$\\mathrm{2Fe + 3Cl_2 \\xrightarrow{t^\\circ} 2FeCl_3}$ (chlorine oxi hóa Fe lên +3). $n_{\\mathrm{FeCl_3}} = ${tex(n)}$ mol ⇒ $m = ${tex(n)}\\cdot 162{,}5 = ${tex(x)}$ gam.`,
        };
      }
      const V = r.pick([100, 200, 250, 500]), c = round(n / (V / 1000), 4); need(round(c, 2) === c);
      const x = n / 2 * 64;
      return {
        stem: `Dung dịch $\\mathrm{FeCl_3}$ được dùng để ăn mòn (khắc) mạch in bằng đồng. Khối lượng Cu tối đa bị hòa tan bởi ${V} mL dung dịch $\\mathrm{FeCl_3}$ ${vn(c)} M là ${cho("Cu")}`,
        ...mcq(r, `${vn(x)} gam`, nums([n * 64, n / 3 * 64, n * 1.5 * 64]).map((s) => s + " gam")),
        explanation: `$\\mathrm{Cu + 2FeCl_3 \\rightarrow CuCl_2 + 2FeCl_2}$. $n_{\\mathrm{FeCl_3}} = ${tex(V / 1000)}\\cdot ${tex(c)} = ${tex(n)}$ mol ⇒ $n_{\\mathrm{Cu}} = \\dfrac{${tex(n)}}{2}$ mol ⇒ $m = ${tex(n / 2, 3)}\\cdot 64 = ${tex(x)}$ gam.`,
      };
    },
  },
  {
    id: "h12k2-short-chuan-do-kmno4", ...P8, topic: "Chuẩn độ Fe²⁺ bằng KMnO₄", level: 3, kind: "short",
    make: (r) => {
      const c2 = r.pick([0.01, 0.02, 0.05]), V2 = r.int(50, 200) / 10, nMn = c2 * V2 / 1000, nFe = 5 * nMn;
      const eq = "$\\mathrm{5Fe^{2+} + MnO_4^- + 8H^+ \\rightarrow 5Fe^{3+} + Mn^{2+} + 4H_2O}$";
      if (r.chance(0.5)) {
        const V1 = r.pick([10, 20, 25]), x = nFe / (V1 / 1000);
        return {
          stem: `Chuẩn độ ${V1} mL dung dịch $\\mathrm{FeSO_4}$ (có $\\mathrm{H_2SO_4}$ loãng dư) bằng dung dịch $\\mathrm{KMnO_4}$ ${vn(c2)} M thì hết ${vn(V2, 1)} mL. Nồng độ mol của dung dịch $\\mathrm{FeSO_4}$ là bao nhiêu (làm tròn đến hàng phần trăm)?`,
          ...short(x, 2),
          explanation: `${eq}. $n_{\\mathrm{KMnO_4}} = ${tex(V2, 1)}\\cdot 10^{-3}\\cdot ${tex(c2)} = ${tex(nMn * 1e4, 3)}\\cdot 10^{-4}$ mol ⇒ $n_{\\mathrm{Fe^{2+}}} = 5\\cdot n_{\\mathrm{KMnO_4}} = ${tex(nFe * 1e4, 3)}\\cdot 10^{-4}$ mol ⇒ $C_M = \\dfrac{${tex(nFe * 1e4, 3)}\\cdot 10^{-4}}{${tex(V1 / 1000, 3)}} ${ap(x, 2)}$ M.`,
        };
      }
      const nTot = nFe * 10, p0 = r.int(80, 98), m = round(nTot * 278 / (p0 / 100), 2), x = nTot * 278 / m * 100;
      need(x < 100);
      return {
        stem: `Hòa tan ${vn(m)} gam mẫu muối $\\mathrm{FeSO_4\\cdot 7H_2O}$ có lẫn tạp chất (không phản ứng với $\\mathrm{KMnO_4}$) vào nước, thêm $\\mathrm{H_2SO_4}$ loãng được 100 mL dung dịch. Lấy 10 mL dung dịch này chuẩn độ bằng dung dịch $\\mathrm{KMnO_4}$ ${vn(c2)} M thì hết ${vn(V2, 1)} mL. Phần trăm khối lượng $\\mathrm{FeSO_4\\cdot 7H_2O}$ trong mẫu là bao nhiêu (làm tròn đến hàng phần mười)? ${cho("H", "O", "S", "Fe")}`,
        ...short(x, 1),
        explanation: `${eq}. Trong 10 mL: $n_{\\mathrm{Fe^{2+}}} = 5\\cdot ${tex(V2, 1)}\\cdot 10^{-3}\\cdot ${tex(c2)} = ${tex(nFe * 1e4, 3)}\\cdot 10^{-4}$ mol ⇒ trong 100 mL: $${tex(nTot * 1e3, 3)}\\cdot 10^{-3}$ mol. $M_{\\mathrm{FeSO_4\\cdot 7H_2O}} = 278$ ⇒ $m = ${tex(nTot * 278, 4)}$ gam ⇒ $\\% = \\dfrac{${tex(nTot * 278, 4)}}{${tex(m)}}\\cdot 100\\% ${ap(x, 1)}\\%$.`,
      };
    },
  },
  {
    id: "h12k2-short-phuc-chat", ...P8, topic: "Phức chất – số phối trí, số oxi hóa", level: 1, kind: "short",
    make: (r) => {
      const x = r.pick(CXS);
      if (r.chance(0.5)) return { stem: `Số phối trí của nguyên tử trung tâm trong phức chất ${ce(x.f)} là bao nhiêu?`, ...short(cxN(x), 0), explanation: cxWhy(x) };
      const o = cxOx(x); need(o >= 0);
      return { stem: `Số oxi hóa của nguyên tử trung tâm trong phức chất ${ce(x.f)} là bao nhiêu?`, ...short(o, 0), explanation: cxWhy(x) };
    },
  },
  {
    id: "h12k2-tf-phuc-chat", ...P8, topic: "Phức chất – đúng/sai", level: 2, kind: "tf",
    make: (r) => {
      const x = r.pick(CXS), N = cxN(x), o = cxOx(x), donor = x.L[0][3];
      const ctx = r.pick(["Phức chất có nhiều ứng dụng trong hóa học phân tích, y học và công nghiệp.", "Nhiều ion kim loại chuyển tiếp tạo phức chất có màu đặc trưng trong dung dịch.", "Phức chất gồm nguyên tử trung tâm liên kết với các phối tử."]);
      return {
        stem: `${ctx} Xét phức chất X có công thức ${ce(x.f)}.`,
        ...tf([
          pickTF(r, `Nguyên tử trung tâm trong X là ${x.c}.`, `Nguyên tử trung tâm trong X là ${donor}.`),
          pickTF(r, `Số phối trí của nguyên tử trung tâm trong X là ${N}.`, `Số phối trí của nguyên tử trung tâm trong X là ${r.pick([2, 4, 6, 8].filter((v) => v !== N))}.`),
          pickTF(r, `Số oxi hóa của nguyên tử trung tâm trong X là ${ox(o)}.`, `Số oxi hóa của nguyên tử trung tâm trong X là ${ox(r.pick([x.q, o + 1, o - 1].filter((v) => v !== o)))}.`),
          pickTF(r, "Liên kết giữa nguyên tử trung tâm và phối tử là liên kết cho – nhận, trong đó phối tử cho cặp electron chưa liên kết.", "Liên kết giữa nguyên tử trung tâm và phối tử là liên kết ion, trong đó nguyên tử trung tâm nhường electron cho phối tử."),
        ]),
        explanation: `${cxWhy(x)} Phối tử có cặp electron hóa trị riêng, cho vào orbital trống của nguyên tử trung tâm tạo liên kết cho – nhận (phối trí).`,
      };
    },
  },
];
