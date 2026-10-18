import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { chatJson, chatStream, MODEL, MODEL_FAST, navyEnabled } from "@/lib/server/navy";
import { examPrompt, explainPrompt, gradePrompt, passagePrompt, SYSTEM } from "@/lib/server/prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL, SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const sb = SB_URL && SB_ANON ? createClient(SB_URL, SB_ANON, { auth: { persistSession: false } }) : null;
const REQUIRE_AUTH = !!sb && process.env.AI_REQUIRE_AUTH !== "false";
const LIMIT = +(process.env.AI_RATE_LIMIT || 20);
const WINDOW = 10 * 60_000;
const ORIGINS = (process.env.ALLOWED_ORIGINS || "").split(",").map((x) => x.trim()).filter(Boolean);

/* ---- CORS cho app di động (Capacitor) ---- */
function cors(req: NextRequest, res: Response) {
  const o = req.headers.get("origin");
  if (o && ORIGINS.includes(o)) {
    res.headers.set("Access-Control-Allow-Origin", o);
    res.headers.set("Vary", "Origin");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  }
  return res;
}
const fail = (req: NextRequest, code: string, status: number) => cors(req, NextResponse.json({ code }, { status }));

/* ---- Giới hạn tốc độ đơn giản trong bộ nhớ (đủ cho 1 instance; nhiều instance thì dùng Redis/Upstash) ---- */
const hits = new Map<string, number[]>();
function limited(key: string) {
  const now = Date.now(); const arr = (hits.get(key) || []).filter((t) => now - t < WINDOW);
  if (arr.length >= LIMIT) { hits.set(key, arr); return true; }
  arr.push(now); hits.set(key, arr); return false;
}

export async function OPTIONS(req: NextRequest) {
  return cors(req, new Response(null, { status: 204 }));
}

export async function GET(req: NextRequest) {
  return cors(req, NextResponse.json({ enabled: navyEnabled(), needAuth: REQUIRE_AUTH }));
}

export async function POST(req: NextRequest) {
  if (!navyEnabled()) return fail(req, "disabled", 503);

  // Xác thực người dùng bằng access token Supabase
  let who = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "anon";
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (sb && token) {
    const { data } = await sb.auth.getUser(token);
    if (data.user) who = data.user.id;
    else if (REQUIRE_AUTH) return fail(req, "unauthorized", 401);
  } else if (REQUIRE_AUTH) return fail(req, "unauthorized", 401);
  if (limited(who)) return fail(req, "rate_limited", 429);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return fail(req, "bad_request", 400); }

  try {
    const sys = { role: "system" as const, content: SYSTEM };
    switch (body.task) {
      case "explain": {
        const stream = await chatStream([sys, { role: "user", content: explainPrompt(body) }], MODEL_FAST);
        return cors(req, new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } }));
      }
      case "exam": {
        const data = await chatJson([sys, { role: "user", content: examPrompt(body) }], MODEL);
        const arr = Array.isArray(data) ? data : Array.isArray(data?.questions) ? data.questions : null;
        if (!arr) return fail(req, "bad_output", 502);
        return cors(req, NextResponse.json({ data: arr }));
      }
      case "grade": {
        const data = await chatJson([sys, { role: "user", content: gradePrompt(body) }], MODEL);
        return cors(req, NextResponse.json({ data }));
      }
      case "passage": {
        const data = await chatJson([sys, { role: "user", content: passagePrompt(body) }], MODEL);
        return cors(req, NextResponse.json({ data }));
      }
      default:
        return fail(req, "bad_task", 400);
    }
  } catch (e) {
    console.error("[api/ai]", (e as Error).message);
    const st = (e as { status?: number }).status;
    return fail(req, st === 429 ? "rate_limited" : "upstream_error", st === 429 ? 429 : 502);
  }
}
