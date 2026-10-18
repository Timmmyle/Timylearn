/* Gọi API AI của server Next.js. Trên app di động (bản build tĩnh) đặt NEXT_PUBLIC_API_BASE trỏ về server đã deploy. */
import { supabase } from "./supabase";

const BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(public code: string, message?: string) { super(message || code); }
}

async function authHeader(): Promise<Record<string, string>> {
  if (!supabase) return {};
  const { data } = await supabase.auth.getSession();
  const t = data.session?.access_token;
  return t ? { Authorization: "Bearer " + t } : {};
}

export async function aiStatus(): Promise<{ enabled: boolean; needAuth: boolean }> {
  try {
    const r = await fetch(BASE + "/api/ai", { cache: "no-store" });
    if (!r.ok) return { enabled: false, needAuth: false };
    return await r.json();
  } catch { return { enabled: false, needAuth: false }; }
}

async function post(body: unknown) {
  const r = await fetch(BASE + "/api/ai", { method: "POST", headers: { "Content-Type": "application/json", ...(await authHeader()) }, body: JSON.stringify(body) });
  if (!r.ok) {
    let code = "error";
    try { code = (await r.json()).code || code; } catch {}
    throw new ApiError(code);
  }
  return r;
}

/** Tác vụ trả về JSON (tạo đề, chấm bài, tạo văn bản) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function aiJson<T = any>(task: string, params: Record<string, unknown>): Promise<T> {
  const r = await post({ task, ...params });
  return (await r.json()).data as T;
}

/** Tác vụ trả về văn bản dạng stream (giải thích) */
export async function aiStream(task: string, params: Record<string, unknown>, onText: (full: string) => void): Promise<string> {
  const r = await post({ task, ...params });
  if (!r.body) { const t = await r.text(); onText(t); return t; }
  const reader = r.body.getReader(); const dec = new TextDecoder(); let full = "";
  for (;;) { const { done, value } = await reader.read(); if (done) break; full += dec.decode(value, { stream: true }); onText(full); }
  return full;
}

export function aiErrorText(e: unknown, fallback: string) {
  const code = e instanceof ApiError ? e.code : "";
  if (code === "unauthorized") return "Đăng nhập để dùng tính năng AI.";
  if (code === "rate_limited") return "Bạn đang dùng AI quá nhanh. Đợi một chút rồi thử lại.";
  if (code === "disabled") return "Server chưa cấu hình NavyAI API.";
  return fallback;
}
