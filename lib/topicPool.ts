"use client";
/* Bộ câu cho nút "Luyện chủ đề này": trước đây chỉ lấy kho mẫu (≈2 câu/chủ đề).
   Giờ gộp nhiều nguồn, mỗi lần bấm là một bộ mới:
   1) dạng bài tự sinh (đổi số liệu) thuộc đúng chương,
   2) câu trong đề ôn giữa/cuối kì (public/de-hk) cùng chủ đề,
   3) kho mẫu,
   4) kho đề chung trên Supabase (lọc theo chủ đề),
   5) còn thiếu thì nhờ AI soạn thêm đúng chủ đề. */
import type { Question } from "./types";
import { TOP } from "./data/curriculum";
import { qOfTopics } from "./logic";
import { useApp } from "./store";
import { remember, loadRandom } from "./remote";
import { aiJson } from "./api";
import { useHK, type HKSet } from "./hk";

export const TOPIC_N = 12;

type Rule = { gen?: RegExp; hk?: RegExp };
/** khóa chủ đề "Môn|Tên" → chương của dạng tự sinh + nhãn chủ đề trong đề ôn */
const RULES: Record<string, Rule> = {
  "Toán|Mệnh đề – tập hợp": { gen: /Mệnh đề và tập hợp/, hk: /Mệnh đề|[Tt]ập hợp/ },
  "Toán|Bất phương trình bậc nhất hai ẩn": { gen: /Bất phương trình/, hk: /[Bb]ất phương trình bậc nhất hai ẩn/ },
  "Toán|Thống kê": { gen: /Chương V\. Các số đặc trưng/, hk: /Số gần đúng|Số trung bình|Phương sai|Tứ phân vị|số đặc trưng/ },
  "Toán|Thống kê ghép nhóm": { gen: /ghép nhóm/, hk: /ghép nhóm/ },
  "Toán|Thống kê – độ phân tán": { gen: /phân tán/, hk: /Khoảng biến thiên|Phương sai/ },
  "Toán|Hệ thức lượng trong tam giác": { gen: /Hệ thức lượng/, hk: /Định lí (sin|côsin)|Diện tích tam giác|Giải tam giác|Hệ thức lượng|góc từ 0/ },
  "Toán|Vectơ": { gen: /Chương IV\. Vectơ/, hk: /[Vv]ectơ/ },
  "Toán|Lượng giác": { gen: /lượng giác/, hk: /[Ll]ượng giác/ },
  "Toán|Dãy số – cấp số": { gen: /Dãy số/, hk: /Dãy số|Cấp số/ },
  "Toán|Quan hệ song song": { gen: /song song/, hk: /song song|Đường thẳng và mặt phẳng/ },
  "Toán|Giới hạn": { gen: /Giới hạn/, hk: /Giới hạn|liên tục/ },
  "Toán|Ứng dụng đạo hàm": { gen: /đạo hàm/, hk: /đơn điệu|Cực trị|tiệm cận|lớn nhất|tối ưu|Khảo sát/ },
  "Toán|Vectơ trong không gian": { gen: /Vectơ và hệ trục/, hk: /[Vv]ectơ|[Tt]ọa độ/ },
  "Vật lí|Động học": { gen: /Động học|Mở đầu/, hk: /Sai số|dịch chuyển|Tốc độ|vận tốc|Gia tốc|biến đổi đều|Rơi tự do|ném|Đồ thị|Đối tượng|An toàn/ },
  "Vật lí|Động lực học": { gen: /Động lực học/, hk: /[Ll]ực|Newton|Moment|Cân bằng của vật/ },
  "Vật lí|Dao động": { gen: /Dao động/, hk: /[Dd]ao động|Con lắc|Động năng, thế năng/ },
  "Vật lí|Sóng": { gen: /Sóng/, hk: /[Ss]óng|Giao thoa|truyền âm/ },
  "Vật lí|Vật lí nhiệt": { gen: /Vật lí nhiệt/, hk: /Cấu trúc của chất|chuyển thể|Nội năng|Nhiệt|nhiệt động|Thang nhiệt/ },
  "Vật lí|Khí lí tưởng": { gen: /Khí lí tưởng/, hk: /[Kk]hí|Boyle|Charles|Động năng phân tử/ },
  "Hóa học|Cấu tạo nguyên tử": { gen: /Cấu tạo nguyên tử/, hk: /[Nn]guyên tử|Nguyên tố hóa học|Đồng vị|electron|Các loại hạt/ },
  "Hóa học|Mol (kiến thức nền)": { hk: /Nguyên tử khối trung bình|Công thức phân tử/ },
  "Hóa học|Bảng tuần hoàn": { gen: /Bảng tuần hoàn/, hk: /bảng tuần hoàn|Xu hướng|Oxide cao nhất|Định luật tuần hoàn|^Độ âm điện$/ },
  "Hóa học|Liên kết hóa học": { gen: /Liên kết/, hk: /[Ll]iên kết|octet|ion$|Lewis|van der Waals/ },
  "Hóa học|Cân bằng hóa học, pH": { gen: /Cân bằng hóa học/, hk: /[Cc]ân bằng|KC|điện li|Brønsted|pH|Chuẩn độ/ },
  "Hóa học|Nitrogen – sulfur": { gen: /Nitrogen và sulfur/, hk: /Nitrogen|Ammonia|Nitric|Sulfur/ },
  "Hóa học|Đại cương hóa hữu cơ": { gen: /hữu cơ/, hk: /hữu cơ|Nhóm chức|Tách biệt|Phổ|Công thức phân tử|Đồng đẳng|Cấu tạo hóa học/ },
  "Hóa học|Ester – lipid": { gen: /Ester/, hk: /Ester|Chất béo|Xà phòng/ },
  "Hóa học|Carbohydrate": { gen: /Carbohydrate/, hk: /Glucose|Saccharose|Tinh bột|Lên men/ },
  "Hóa học|Amine – amino acid": { gen: /Hợp chất chứa nitrogen/, hk: /Amine|Amino|Peptide|Enzyme/ },
  "Hóa học|Polymer": { gen: /Polymer/, hk: /olymer/ },
  "Tiếng Anh|Phát âm, trọng âm": { hk: /Pronunciation|[Ss]tress/ },
  "Tiếng Anh|Thì của động từ": { hk: /[Pp]resent (simple|continuous|perfect)|[Pp]ast (simple|continuous)|Will vs|Stative/ },
  "Tiếng Anh|Câu bị động": { hk: /[Pp]assive/ },
  "Tiếng Anh|So sánh": { hk: /[Cc]omparative/ },
  "Tiếng Anh|Câu điều kiện": { hk: /[Cc]onditional/ },
  "Tiếng Anh|Mệnh đề quan hệ": { hk: /[Rr]elative|participle clauses/ },
  "Tiếng Anh|Câu tường thuật": { hk: /[Rr]eported/ },
  "Tiếng Anh|Từ vựng, collocation": { hk: /Vocabulary|Closest meaning|Communication/ },
  "Tiếng Anh|Đọc hiểu tiếng Anh": { hk: /Reading|Arrangement/ },
};
const rnd = (n: number) => Math.floor(Math.random() * n);
const shuffle = <T,>(a: T[]) => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const hkCache: Record<string, Promise<Question[]>> = {};
function hkFile(id: string): Promise<Question[]> {
  return (hkCache[id] ||= fetch(`/de-hk/${id}.json`).then((r) => (r.ok ? r.json() : { questions: [] })).then((d) => (d.questions || []) as Question[]).catch(() => { delete hkCache[id]; return []; }));
}
let idxP: Promise<HKSet[]> | null = null;
function hkIndex(): Promise<HKSet[]> {
  const have = useHK.getState().sets; if (have.length) return Promise.resolve(have);
  return (idxP ||= fetch("/de-hk/index.json").then((r) => r.json() as Promise<HKSet[]>).catch(() => { idxP = null; return []; }));
}
/** Câu trong đề ôn soạn sẵn cùng chủ đề: khớp khóa tk; đề cũ chưa gắn tk thì so nhãn bằng regex */
async function fromHK(k: string, subject: string, grades: number[], re?: RegExp): Promise<Question[]> {
  const sets = (await hkIndex()).filter((x) => x.kind === "quiz" && x.subject === subject && grades.includes(x.grade));
  const all = (await Promise.all(sets.map((x) => hkFile(x.id)))).flat();
  const seen = new Set<string>();
  return all.filter((q) => (q.tk ? q.tk === k : !!re && re.test(q.t)) && !seen.has(q.id) && seen.add(q.id));
}

async function fromGen(k: string, subject: string, grade: number, re: RegExp | undefined, n: number): Promise<Question[]> {
  const G = await import("./gen/build");
  const pool = G.TEMPLATES.filter((t) => t.tk ? t.tk === k : !!re && t.subject === subject && t.grade === grade && re.test(t.chapter));
  if (!pool.length) return [];
  // trải đều mức độ: nhận biết → vận dụng, mỗi dạng tối đa 1 câu trong một lượt
  const picks = shuffle([...pool]).slice(0, n).sort((a, b) => a.level - b.level);
  const out: Question[] = [];
  for (const t of picks) { try { out.push(G.toQuestion(t, 1 + rnd(2_000_000_000))); } catch { /* bỏ */ } }
  return out;
}

async function fromAI(subject: string, topic: string, grade: number, n: number): Promise<Question[]> {
  const g = grade || 12;
  const scope = `bài luyện tập môn ${subject}${grade ? ` lớp ${grade}` : ` (học sinh lớp ${g})`}, chương trình GDPT 2018, chỉ trong chủ đề “${topic}”. Đa dạng dạng câu, từ nhận biết đến vận dụng.`;
  const arr = await aiJson<{ topic?: string; q: string; o: string[]; a: number; e?: string }[]>("exam", { scope, level: 2, n });
  if (!Array.isArray(arr)) return [];
  const base = "ait-" + Date.now();
  const qs: Question[] = [];
  arr.forEach((x, i) => {
    if (x && typeof x.q === "string" && Array.isArray(x.o) && x.o.length === 4 && Number.isInteger(x.a) && x.a >= 0 && x.a < 4)
      qs.push({ id: `${base}-${i}`, s: subject, t: topic, l: 2, q: x.q, o: x.o.map(String), a: x.a, e: String(x.e || ""), ai: true, remote: true });
  });
  return qs;
}

/** Danh sách id câu hỏi cho một lượt luyện chủ đề (đã nạp vào bộ nhớ để getQ tìm được) */
export async function topicQuestions(k: string, n = TOPIC_N): Promise<{ ids: string[]; ai: boolean }> {
  const t = TOP[k]; if (!t) return { ids: qOfTopics([k]), ai: false };
  const S = useApp.getState();
  const myGrade = S.S.profile.grade === "free" ? 12 : +S.S.profile.grade || 12;
  const rule = RULES[k] || {};
  const extra: Question[] = [];
  const take = (qs: Question[], max: number) => { const have = new Set(extra.map((q) => q.id)); for (const q of qs) { if (max <= 0) break; if (!have.has(q.id)) { extra.push(q); max--; } } };

  const bank = shuffle(qOfTopics([k]));
  const [gen, hk] = await Promise.all([
    t.g ? fromGen(k, t.s, t.g, rule.gen, Math.ceil(n * 0.6)).catch(() => [] as Question[]) : Promise.resolve([] as Question[]),
    fromHK(k, t.s, t.g ? [t.g] : [10, 11, 12], rule.hk).catch(() => [] as Question[]),
  ]);
  // Tiếng Anh (lớp 0): ưu tiên đề đúng lớp mình
  const hkSorted = t.g ? shuffle(hk) : [...shuffle(hk.filter((q) => q.id.startsWith(`hk-${myGrade}-`))), ...shuffle(hk.filter((q) => !q.id.startsWith(`hk-${myGrade}-`)))];
  take(gen, n);
  take(hkSorted, n - extra.length - Math.min(bank.length, 2));
  let need = n - extra.length - bank.length;

  if (need > 0) {
    // kho đề chung: lọc theo chủ đề
    try {
      const re = rule.hk || new RegExp(t.t.split(/[–,]/)[0].trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      const rq = await loadRandom(t.s, 60);
      take(shuffle(rq.filter((q) => re.test(q.t))), need);
    } catch { /* offline */ }
    need = n - extra.length - bank.length;
  }
  let ai = false;
  if (need >= 3 && S.ai.enabled) {
    try { const qs = await fromAI(t.s, t.t, t.g, Math.min(10, need)); if (qs.length) { take(qs, need); ai = true; } } catch { /* AI lỗi: dùng phần đã có */ }
  }
  remember(extra);
  const ids = shuffle([...extra.map((q) => q.id), ...bank.slice(0, Math.max(0, n - extra.length))]);
  return { ids, ai };
}

/** Chủ đề này có dạng tự sinh không (để ghi chú trên nút) */
const GEN_HK2 = new Set(["Toán", "Vật lí", "Hóa học"]);
export const topicHasGen = (k: string) => { const t = TOP[k]; return !!t && t.g > 0 && (!!RULES[k]?.gen || (t.hk === 2 && GEN_HK2.has(t.s))); };
