import "server-only";
/* Prompt được soạn ở server từ tham số — client không gửi được prompt tùy ý. */

const LV: Record<number, string> = { 1: "dễ", 2: "vừa", 3: "khó" };
const s = (v: unknown, max = 2000) => String(v ?? "").slice(0, max);
const SYSTEM = "Bạn là trợ lý giáo dục cho học sinh THPT Việt Nam. Luôn trả lời bằng tiếng Việt, chính xác, đúng chương trình GDPT 2018.";
export { SYSTEM };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function examPrompt(p: any) {
  const n = Math.min(15, Math.max(1, Math.round(+p.n || 10)));
  const level = [1, 2, 3].includes(+p.level) ? +p.level : 2;
  return `Bạn là giáo viên ra đề ở Việt Nam. Soạn đúng ${n} câu trắc nghiệm 4 lựa chọn bằng tiếng Việt cho ${s(p.scope, 1500)} Mức độ: ${LV[level]} (${level === 1 ? "nhận biết" : level === 2 ? "thông hiểu" : "vận dụng, vận dụng cao"}). Bám sát phong cách đề thật. Với phần đọc hiểu, đưa đoạn văn ngắn vào ngay trong câu hỏi. Mỗi câu chỉ có đúng một đáp án đúng; tự giải lại từng câu để chắc đáp án chính xác. Mọi công thức, phân số, căn, số mũ, kí hiệu toán/lí/hóa phải viết bằng LaTeX đặt trong cặp dấu $ (ví dụ: $\\dfrac{3}{4}$, $\\sqrt{2}$, $x^2$, $\\log_2 8$, $\\vec{u}$); chữ tiếng Việt để ngoài dấu $. Số thập phân dùng dấu phẩy, trong công thức viết $0{,}5$. Trong JSON nhớ escape dấu gạch chéo ngược thành \\\\ (ví dụ "$\\\\dfrac{1}{2}$").
Trả lời CHỈ bằng một mảng JSON, mỗi phần tử dạng {"topic":"chủ đề ngắn","q":"nội dung câu hỏi","o":["A","B","C","D"],"a":0,"e":"lời giải ngắn gọn"}, trong đó "a" là chỉ số (0–3) của đáp án đúng trong "o".`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function explainPrompt(p: any) {
  return `Bạn là gia sư ở Việt Nam, đang kèm học sinh ${s(p.gradeLabel, 40)}. Học sinh vừa làm sai câu sau (môn ${s(p.subject, 80)}, chủ đề ${s(p.topic, 120)}${+p.grade ? ", lớp " + +p.grade : ""}).
Câu hỏi: ${s(p.question)}
Các lựa chọn: ${s(p.options)}
Học sinh chọn: ${s(p.picked, 200)}. Đáp án đúng: ${s(p.correct, 200)}.
Lời giải gốc: ${s(p.solution)}
Giải thích ngắn gọn (dưới 150 từ), bằng tiếng Việt, không dùng markdown (không in đậm, không gạch đầu dòng); công thức viết bằng LaTeX trong cặp dấu $ như $\\dfrac{1}{2}$, $\\sqrt{3}$, chỉ dùng kiến thức học sinh đã học: vì sao lựa chọn của học sinh sai, các bước làm đúng, và một mẹo để lần sau không nhầm.`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function gradePrompt(p: any) {
  const points = Array.isArray(p.points) ? p.points.slice(0, 10).map((x: unknown, i: number) => i + 1 + ") " + s(x, 300)).join("; ") : "";
  return `Bạn là giáo viên Ngữ văn THPT ở Việt Nam, chấm câu trả lời đọc hiểu của học sinh ${s(p.gradeLabel, 40)}.
Văn bản:
${s(p.passage, 3000)}

Câu hỏi: ${s(p.question, 600)}
Các ý cần có: ${points}
Đáp án gợi ý: ${s(p.model, 2000)}

Câu trả lời của học sinh:
${s(p.answer, 4000)}

Chấm theo thang 10, xét cả nội dung (đủ ý, đúng) và cách trình bày (viết thành câu hoàn chỉnh, dùng đúng thuật ngữ, đúng độ dài yêu cầu, không chép lại văn bản). Chấp nhận cách diễn đạt khác nếu đúng ý. Nhận xét ngắn gọn, thân thiện, bằng tiếng Việt.
Trả lời CHỈ bằng JSON: {"score": số từ 0 đến 10 (bước 0.5), "dat": ["điểm làm tốt"], "thieu": ["ý còn thiếu hoặc lỗi trình bày"], "sua": "gợi ý viết lại câu trả lời hoàn chỉnh, dựa trên bài của học sinh"}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function passagePrompt(p: any) {
  const kinds = ["tản văn", "đoạn văn nghị luận xã hội", "truyện ngắn rất ngắn", "bài thơ tự do ngắn"];
  const kind = kinds[Math.floor(Math.random() * kinds.length)];
  return `Bạn là giáo viên Ngữ văn THPT. Hãy TỰ SÁNG TÁC một văn bản mới (không trích tác phẩm có sẵn), thể loại ${kind}, dài 120–180 chữ, phù hợp học sinh ${s(p.gradeLabel, 40)}, có ít nhất một biện pháp tu từ rõ ràng. Sau đó soạn 3 câu hỏi đọc hiểu theo các dạng: nhận biết, tác dụng biện pháp tu từ hoặc thông hiểu, vận dụng (bày tỏ quan điểm 5–7 dòng).
Trả lời CHỈ bằng JSON: {"title":"tên văn bản","passage":"văn bản","questions":[{"q":"câu hỏi","type":"nhanbiet|tutu|noidung|quandiem","points":["ý cần có"],"model":"đáp án gợi ý viết thành đoạn hoàn chỉnh"}]}`;
}
