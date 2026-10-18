"use client";
/* Kho đề dùng chung trên Supabase: danh sách đề, câu hỏi, bài đọc hiểu.
   Câu đã tải được lưu vào máy để làm lại / ôn lỗi sai khi không có mạng. */
import { create } from "zustand";
import { supabase } from "./supabase";
import type { Question, WritePassage } from "./types";

export type RemoteSet = {
  id: string; source: string; kind: "official" | "practice" | "mock"; exam: string; year: number | null; subject: string;
  code: string | null; title: string; grade: number; curriculum: string | null; question_count: number; duration_min: number | null;
};
type Row = {
  id: string; set_id: string; ord: number; subject: string; topic: string | null; level: number; stem: string; options: string[];
  answer: number | null; explanation: string | null; image_q: string | null; image_a: string | null;
  qtype?: "mcq" | "tf" | "short" | null; statements?: { t: string; a: boolean }[] | null; answer_text?: string | null;
};

const K_SETS = "onthi-remote-sets", K_Q = "onthi-remote-q", K_W = "onthi-remote-write", K_COUNTS = "onthi-remote-counts";
const MAX_CACHED_Q = 2500;
const SB_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");

const load = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : d; } catch { return d; } };
const save = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* đầy bộ nhớ: bỏ qua */ } };

/** Câu hỏi tải từ máy chủ, tra theo id (dùng trong getQ) */
export const REMOTE_Q: Record<string, Question> = {};
let qOrder: string[] = [];

type RemoteStore = {
  sets: RemoteSet[]; counts: Record<string, number>; passages: WritePassage[];
  status: "idle" | "loading" | "ready" | "offline" | "off";
};
export const useRemote = create<RemoteStore>(() => ({ sets: [], counts: {}, passages: [], status: "idle" }));

export const imageUrl = (p?: string | null) => (p ? (/^https?:/.test(p) ? p : `${SB_URL}/storage/v1/object/public/question-images/${p}`) : "");

function toQ(r: Row): Question {
  return {
    id: r.id, s: r.subject, t: r.topic || "Đề thi", l: r.level || 2, q: r.stem, o: (r.options || []).map(String), a: r.answer ?? -1,
    qt: r.qtype && r.qtype !== "mcq" ? r.qtype : undefined, st: r.statements || undefined, sa: r.answer_text ?? undefined,
    e: r.explanation || "", img: r.image_q || undefined, imgA: r.image_a || undefined, remote: true, setId: r.set_id,
  };
}

function remember(qs: Question[]) {
  for (const q of qs) { if (!REMOTE_Q[q.id]) qOrder.push(q.id); REMOTE_Q[q.id] = q; }
  // Giữ tối đa MAX_CACHED_Q câu, bỏ câu cũ nhất
  while (qOrder.length > MAX_CACHED_Q) { const id = qOrder.shift()!; delete REMOTE_Q[id]; }
  save(K_Q, qOrder.map((id) => REMOTE_Q[id]));
}

/** Gọi một lần khi app khởi động */
export async function initRemote() {
  const cached = load<Question[]>(K_Q, []);
  for (const q of cached) { REMOTE_Q[q.id] = q; qOrder.push(q.id); }
  useRemote.setState({ sets: load(K_SETS, []), counts: load(K_COUNTS, {}), passages: load(K_W, []) });
  if (!supabase) { useRemote.setState({ status: "off" }); return; }
  useRemote.setState({ status: "loading" });
  try {
    const [s, c, w] = await Promise.all([
      supabase.from("exam_sets").select("*").eq("published", true).order("year", { ascending: false, nullsFirst: false }).order("subject").order("id"),
      supabase.rpc("question_counts"),
      supabase.from("write_passages").select("id,title,passage,src,questions,year").eq("published", true).order("year", { ascending: false }),
    ]);
    if (s.error) throw s.error;
    const sets = (s.data || []) as RemoteSet[];
    const counts = Object.fromEntries(((c.data || []) as { subject: string; total: number }[]).map((x) => [x.subject, Number(x.total)]));
    const passages: WritePassage[] = ((w.data || []) as { id: string; title: string; passage: string; src: string; questions: WritePassage["qs"] }[])
      .map((p) => ({ id: p.id, title: p.title, passage: p.passage, src: p.src || "", qs: p.questions || [], remote: true }));
    save(K_SETS, sets); save(K_COUNTS, counts); save(K_W, passages);
    useRemote.setState({ sets, counts, passages, status: "ready" });
  } catch {
    useRemote.setState({ status: "offline" });
  }
}

/** Tải toàn bộ câu của một đề (có cache) */
export async function loadSet(setId: string): Promise<Question[]> {
  const local = Object.values(REMOTE_Q).filter((q) => q.setId === setId);
  const meta = useRemote.getState().sets.find((s) => s.id === setId);
  if (meta && local.length >= meta.question_count) return local;
  if (!supabase) return local;
  const { data, error } = await supabase.from("questions").select("*").eq("set_id", setId).order("ord");
  if (error) { if (local.length) return local; throw error; }
  const qs = (data as Row[]).map(toQ);
  remember(qs);
  return qs;
}

/** Lấy ngẫu nhiên câu thật theo môn để luyện tập */
export async function loadRandom(subject: string, n: number, level?: number): Promise<Question[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("random_questions", { subj: subject, n, lvl: level ?? null });
  if (error) throw error;
  const qs = (data as Row[]).map(toQ);
  remember(qs);
  return qs;
}
