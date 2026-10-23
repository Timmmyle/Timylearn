export type Topic = { s: string; t: string; g: number; hk: number; p: number; th: string; k: string };
export type Question = {
  id: string; s: string; t: string; l: number; q: string; o: string[]; a: number; e: string; ai?: boolean;
  /** ảnh đề bài / ảnh lời giải (đường dẫn trong bucket question-images) */ img?: string; imgA?: string;
  /** câu lấy từ kho đề Supabase */ remote?: boolean; setId?: string;
  /** phần thi (đề ĐGNL) */ sec?: string; /** đoạn văn / dữ kiện chung đặt trên câu hỏi */ ctx?: string;
  /** câu tự sinh từ dạng bài có tham số (id g:dạng:seed) */ gen?: boolean;
  /** khóa chủ đề Vượt Ải "Môn|Chủ đề" (đề ôn soạn sẵn) */ tk?: string;
  /** dạng câu (mặc định mcq): tf = Đúng/Sai 4 ý, short = trả lời ngắn */ qt?: QType;
  /** các ý Đúng/Sai */ st?: { t: string; a: boolean }[];
  /** đáp án trả lời ngắn */ sa?: string;
};
export type QType = "mcq" | "tf" | "short";
/** Lựa chọn của người làm: mcq = chỉ số đáp án, tf = mảng Đúng/Sai, short = chuỗi */
export type Pick = number | string | (boolean | null)[] | null;
export type Exam = {
  id: string; n: string; d: string; school?: boolean; hk?: number; full?: boolean;
  dgnl?: boolean; desc?: string; subs?: string[];
};
export type Bot = { n: string; acc: number; min: number; max: number; r: number };
export type WriteQ = { q: string; type: string; points: string[]; model: string };
export type WritePassage = { id: string; title: string; src: string; passage: string; qs: WriteQ[]; ai?: boolean; remote?: boolean; /** đề ôn giữa/cuối kì */ hk?: boolean };

export type Profile = {
  grade: string; exams: string[]; examOther: string; subjects: string[]; subjectOther: string;
  target: number | ""; minutes: number; examName: string; nameAuto: boolean; examDate: string; days: number[]; time: string;
};
export type Mistake = { box: number; due: string; wrong: number; added?: string };
export type CT = { c: number; t: number };
export type AiSet = { id: string; exam: string; grade: number | string; subject: string; title: string; qids: string[]; created?: string };

export type AppState = {
  v: number;
  onboarded: boolean;
  profile: Profile;
  theme: { mode: "auto" | "light" | "dark"; accent: string; /** phong cách chữ, chưa chọn thì hỏi khi vào app */ font?: "pro" | "comic" };
  xp: number;
  streak: { count: number; last: string | null; freezes: number; best: number };
  stats: Record<string, Record<string, CT>>;
  mistakes: Record<string, Mistake>;
  graduated: number;
  aiQ: Record<string, Question>;
  aiSets: AiSet[];
  aiWrite: WritePassage[];
  fight: { rating: number; w: number; l: number; d: number };
  missions: { day: string | null; c: Record<string, number>; claimed: Record<string, boolean> };
  updatedAt: number;
};

/** Câu hỏi đã trộn đáp án cho một phiên làm bài */
export type PlayQ = Question & { opts: string[]; ans: number };

export type SessionKind = "practice" | "review" | "diag" | "exam" | "fight";
export type QuizSession = {
  kind: SessionKind; title: string; items: PlayQ[]; i: number; picks: Pick[]; start: number;
  /** câu Đúng/Sai, trả lời ngắn đã bấm “Kiểm tra” (chế độ luyện tập) */ checked?: Record<number, boolean>;
  end?: number; done?: boolean; aiex?: Record<number, string>;
  // đấu
  botLv?: number; me?: number; bot?: number; botPlan?: { ok: boolean; t: number }[];
  botRes?: { ok: boolean; t: number }[]; myRes?: { ok: boolean; pts: number }[]; reveal?: boolean; qStart?: number;
  delta?: number; res?: number; durationMin?: number; keepOrder?: boolean;
  /** đề ĐGNL: thang điểm quy đổi (1200, 150, 100) */ scale?: number;
};
export type WriteSession = {
  kind: "write"; p: WritePassage; qi: number; answer: string; busy: boolean; err?: string; recorded?: boolean;
  res: null | { self?: boolean; ai?: boolean; checks: boolean[]; score?: number; dat?: string[]; thieu?: string[]; sua?: string };
};
export type Session = QuizSession | WriteSession;
