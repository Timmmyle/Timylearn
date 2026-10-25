import "server-only";
/* Client NavyAI (https://api.navy) — API tương thích OpenAI Chat Completions. Chỉ chạy trên server. */

const BASE = (process.env.NAVY_BASE_URL || "https://api.navy/v1").replace(/\/$/, "");
const KEY = process.env.NAVY_API_KEY || "";
export const MODEL = process.env.NAVY_MODEL || "gpt-5";
export const MODEL_FAST = process.env.NAVY_MODEL_FAST || MODEL;
export const navyEnabled = () => !!KEY;

type Part = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };
export type Msg = { role: "system" | "user" | "assistant"; content: string | Part[] };

/** Model suy luận (gpt-5, o1, o3, o4…) không nhận temperature và dùng max_completion_tokens */
const isReasoning = (m: string) => /^(gpt-5|o\d)/i.test(m);

async function call(body: Record<string, unknown>, signal?: AbortSignal) {
  const send = (b: Record<string, unknown>) => fetch(BASE + "/chat/completions", {
    method: "POST",
    headers: { Authorization: "Bearer " + KEY, "Content-Type": "application/json" },
    body: JSON.stringify(b),
    signal,
  });
  let b = { ...body };
  if (isReasoning(String(b.model))) { delete b.temperature; if (b.max_tokens) { b.max_completion_tokens = b.max_tokens; delete b.max_tokens; } }
  let r = await send(b);
  // Một số model/cổng từ chối temperature hoặc max_tokens → thử lại một lần với tham số tối giản
  if (r.status === 400) {
    const t = await r.text().catch(() => "");
    if (/temperature|max_tokens|max_completion_tokens|unsupported/i.test(t)) {
      const mt = b.max_tokens || b.max_completion_tokens; b = { ...b }; delete b.temperature; delete b.max_tokens; delete b.max_completion_tokens;
      if (/max_tokens/i.test(t) && mt) b.max_completion_tokens = mt; else if (mt) b.max_tokens = mt;
      r = await send(b);
    } else {
      const err = new Error(`NavyAI 400: ${t.slice(0, 300)}`) as Error & { status?: number }; err.status = 400; throw err;
    }
  }
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    const err = new Error(`NavyAI ${r.status}: ${t.slice(0, 300)}`) as Error & { status?: number };
    err.status = r.status;
    throw err;
  }
  return r;
}

export async function chatText(messages: Msg[], model = MODEL, maxTokens = 4000): Promise<string> {
  // Model suy luận tiêu một phần token cho phần "nghĩ" → cho thêm ngân sách để không bị cắt mất câu trả lời
  const budget = isReasoning(model) ? Math.max(maxTokens * 4, 16000) : maxTokens;
  const r = await call({ model, messages, max_tokens: budget, temperature: 0.7 }, AbortSignal.timeout(170_000));
  const j = await r.json();
  const out = String(j?.choices?.[0]?.message?.content ?? "");
  if (!out.trim()) { const err = new Error("empty_output: " + JSON.stringify(j?.choices?.[0]?.finish_reason || "")) as Error & { status?: number }; err.status = 502; throw err; }
  return out;
}

/** Gọi model và bóc JSON trong câu trả lời (chịu được ```json ... ``` hoặc chữ thừa) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function chatJson(messages: Msg[], model = MODEL, maxTokens = 4000): Promise<any> {
  const txt = await chatText(messages, model, maxTokens);
  return extractJson(txt);
}

// Model đôi khi quên escape "\\" trong LaTeX (vd "\frac" → \f là ký tự form-feed). Sửa các lệnh LaTeX phổ biến về "\\lệnh".
const TEX_CMDS = "dfrac|tfrac|frac|sqrt|times|text|mathrm|cdot|cdots|ldots|dots|left|right|pi|alpha|beta|gamma|delta|Delta|lambda|omega|Omega|varphi|phi|theta|mu|sigma|rho|tau|epsilon|varepsilon|sin|cos|tan|cot|log|ln|lim|int|sum|infty|le|leq|ge|geq|ne|neq|pm|mp|Leftrightarrow|Rightarrow|rightarrow|to|vec|overrightarrow|overline|widehat|hat|bar|cap|cup|setminus|in|notin|subset|perp|parallel|mid|circ|displaystyle|quad|approx|equiv|emptyset|angle|triangle|Big|big|prime|degree|nabla|partial";
const TEX_FIX = new RegExp("(?<!\\\\)\\\\(?=(?:" + TEX_CMDS + ")(?![a-zA-Z]))", "g");
export function fixTexEscapes(raw: string) { return raw.replace(TEX_FIX, "\\\\"); }

export function extractJson(txt: string) {
  const cleaned = fixTexEscapes(txt.replace(/```(?:json)?/gi, "").trim());
  try { return JSON.parse(cleaned); } catch {}
  const starts = [cleaned.indexOf("["), cleaned.indexOf("{")].filter((i) => i >= 0);
  if (!starts.length) throw new Error("no_json");
  const s = Math.min(...starts), open = cleaned[s], close = open === "[" ? "]" : "}";
  const e = cleaned.lastIndexOf(close);
  return JSON.parse(cleaned.slice(s, e + 1));
}

/** Stream văn bản thuần (SSE từ NavyAI → text stream cho trình duyệt) */
export async function chatStream(messages: Msg[], model = MODEL_FAST): Promise<ReadableStream<Uint8Array>> {
  const r = await call({ model, messages, max_tokens: isReasoning(model) ? 8000 : 1200, temperature: 0.5, stream: true }, AbortSignal.timeout(120_000));
  const reader = r.body!.getReader();
  const dec = new TextDecoder(), enc = new TextEncoder();
  let buf = "";
  return new ReadableStream({
    async pull(ctrl) {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) { ctrl.close(); return; }
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop() || "";
        let out = "";
        for (const line of lines) {
          const l = line.trim(); if (!l.startsWith("data:")) continue;
          const data = l.slice(5).trim(); if (data === "[DONE]") continue;
          try { const j = JSON.parse(data); out += j?.choices?.[0]?.delta?.content || ""; } catch {}
        }
        if (out) { ctrl.enqueue(enc.encode(out)); return; }
      }
    },
    cancel() { reader.cancel().catch(() => {}); },
  });
}
