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
  if (code === "disabled") return "Server chưa cấu hình NavyAI API (biến NAVY_API_KEY trên Vercel).";
  if (code === "bad_key") return "Khóa NavyAI trên server không hợp lệ hoặc hết hạn mức. Kiểm tra NAVY_API_KEY trên Vercel.";
  if (code === "upstream_400") return "NavyAI từ chối yêu cầu (có thể tên model trong NAVY_MODEL không đúng). Kiểm tra cấu hình trên Vercel.";
  if (code === "timeout") return "AI trả lời quá lâu. Thử lại với ít câu hơn.";
  if (code === "bad_output" || code === "empty_output") return "AI trả về kết quả không đọc được. Bấm tạo lại nhé.";
  if (code === "file_too_big") return "Tệp quá lớn (tối đa khoảng 3 MB). Hãy chụp/cắt phần ma trận hoặc lưu thành PDF nhỏ hơn.";
  if (code === "file_type") return "Chưa đọc được loại tệp này. Dùng PDF, Word (.docx), ảnh, hoặc .txt/.csv.";
  if (code === "file_read") return "Không đọc được nội dung tệp. Thử lưu lại thành PDF hoặc dán chữ vào ô bên dưới.";
  if (code === "no_guide") return "Hãy dán nội dung hoặc chọn ít nhất một tệp.";
  if (code === "error" || code === "upstream_error") return fallback + " (mã: " + code + ")";
  return fallback;
}
