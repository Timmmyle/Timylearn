import "server-only";
/* Client NavyAI (https://api.navy) — API tương thích OpenAI Chat Completions. Chỉ chạy trên server. */

const BASE = (process.env.NAVY_BASE_URL || "https://api.navy/v1").replace(/\/$/, "");
const KEY = process.env.NAVY_API_KEY || "";
export const MODEL = process.env.NAVY_MODEL || "gpt-5";
export const MODEL_FAST = process.env.NAVY_MODEL_FAST || MODEL;
export const navyEnabled = () => !!KEY;

type Msg = { role: "system" | "user" | "assistant"; content: string };

async function call(body: Record<string, unknown>, signal?: AbortSignal) {
  const r = await fetch(BASE + "/chat/completions", {
    method: "POST",
    headers: { Authorization: "Bearer " + KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    const err = new Error(`NavyAI ${r.status}: ${t.slice(0, 300)}`) as Error & { status?: number };
    err.status = r.status;
    throw err;
  }
  return r;
}

export async function chatText(messages: Msg[], model = MODEL, maxTokens = 4000): Promise<string> {
  const r = await call({ model, messages, max_tokens: maxTokens, temperature: 0.7 }, AbortSignal.timeout(120_000));
  const j = await r.json();
  return String(j?.choices?.[0]?.message?.content ?? "");
}

/** Gọi model và bóc JSON trong câu trả lời (chịu được ```json ... ``` hoặc chữ thừa) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function chatJson(messages: Msg[], model = MODEL): Promise<any> {
  const txt = await chatText(messages, model);
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
  const r = await call({ model, messages, max_tokens: 1200, temperature: 0.5, stream: true }, AbortSignal.timeout(90_000));
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
