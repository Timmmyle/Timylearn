"use client";
/* Đáp án đã được sửa sau khi có người báo sai và AI xác nhận.
   Bản sửa chung lấy từ bảng question_fixes; bản sửa riêng (câu tự sinh, câu AI, hoặc server chưa có khóa ghi) lưu trên máy. */
import { supabase } from "./supabase";
import type { Question } from "./types";

export type Fix = { a?: number; st?: boolean[]; sa?: string; e?: string };
const K = "onthi-fixes";
export const FIX: Record<string, Fix> = {};
try { Object.assign(FIX, JSON.parse(localStorage.getItem(K) || "{}")); } catch { /* chưa có */ }
const save = () => { try { localStorage.setItem(K, JSON.stringify(FIX)); } catch { /* đầy bộ nhớ */ } };

export async function initFixes() {
  if (!supabase) return;
  const { data, error } = await supabase.from("question_fixes").select("qid,data").eq("active", true).limit(5000);
  if (error || !data) return;
  for (const r of data as { qid: string; data: Fix }[]) FIX[r.qid] = r.data;
  save();
}
export function setFix(qid: string, f: Fix) { FIX[qid] = f; save(); }

/** Áp bản sửa vào câu hỏi gốc (thứ tự phương án gốc) */
export function applyFix<T extends Question>(q: T): T {
  const f = FIX[q.id]; if (!f) return q;
  const out = { ...q };
  if (typeof f.a === "number" && f.a >= 0 && f.a < (q.o?.length || 0)) out.a = f.a;
  if (Array.isArray(f.st) && q.st) out.st = q.st.map((x, i) => ({ ...x, a: !!f.st![i] }));
  if (typeof f.sa === "string") out.sa = f.sa;
  if (f.e) out.e = f.e;
  return out;
}
