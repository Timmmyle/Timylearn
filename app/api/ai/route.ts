import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { chatJson, chatStream, MODEL, MODEL_FAST, navyEnabled } from "@/lib/server/navy";
import { customPrompt, examPrompt, explainPrompt, gradePrompt, passagePrompt, quizMakePrompt, specPrompt, SYSTEM, vanCheckPrompt, vanMakePrompt, vanOriginalPrompt } from "@/lib/server/prompts";
import { pickPassage } from "@/lib/server/vanPick";
import { extractText, isImage, type UpFile } from "@/lib/server/extract";
import { reviewReport } from "@/lib/server/review";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

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

/** Gom chữ + ảnh từ phần dán và tối đa 3 tệp người dùng tải lên */
async function gather(body: Record<string, unknown>): Promise<{ guide: string; images: string[] } | { error: string; status: number }> {
  const files = (Array.isArray(body.files) ? body.files : []).slice(0, 3) as UpFile[];
  const texts: string[] = [], images: string[] = [];
  if (typeof body.text === "string" && body.text.trim()) texts.push(body.text.slice(0, 12000));
  for (const f of files) {
    if (!f || typeof f.data !== "string" || typeof f.name !== "string") return { error: "bad_request", status: 400 };
    if (isImage(f)) { if (f.data.length > 4_700_000) return { error: "file_too_big", status: 413 }; images.push(`data:${f.type || "image/png"};base64,${f.data}`); continue; }
    try { const t = (await extractText(f)).trim(); if (t) texts.push(`[Tệp ${String(f.name).slice(0, 80)}]\n` + t); }
    catch (e) { return { error: (e as { code?: string }).code || "file_read", status: 400 }; }
  }
  const guide = texts.join("\n\n").slice(0, 16000);
  if (!guide && !images.length) return { error: "no_guide", status: 400 };
  return { guide, images };
}
const withImages = (prompt: string, images: string[]) => (images.length ? [{ type: "text" as const, text: prompt }, ...images.map((url) => ({ type: "image_url" as const, image_url: { url } }))] : prompt);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asObj = (x: unknown): any => (x && typeof x === "object" && !Array.isArray(x) ? x : null);

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
  let userId: string | null = null;
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (sb && token) {
    const { data } = await sb.auth.getUser(token);
    if (data.user) { who = data.user.id; userId = data.user.id; }
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
      case "custom": {
        // Đề theo tài liệu của người dùng: chữ dán vào + tối đa 3 file (txt, md, csv, docx, pdf, ảnh)
        const files = (Array.isArray(body.files) ? body.files : []).slice(0, 3) as UpFile[];
        const texts: string[] = [], images: string[] = [];
        if (typeof body.text === "string" && body.text.trim()) texts.push(body.text.slice(0, 12000));
        for (const f of files) {
          if (!f || typeof f.data !== "string" || typeof f.name !== "string") return fail(req, "bad_request", 400);
          if (isImage(f)) { if (f.data.length > 4_700_000) return fail(req, "file_too_big", 413); images.push(`data:${f.type || "image/png"};base64,${f.data}`); continue; }
          try { const t = (await extractText(f)).trim(); if (t) texts.push(`[Tệp ${String(f.name).slice(0, 80)}]\n` + t); }
          catch (e) { return fail(req, (e as { code?: string }).code || "file_read", 400); }
        }
        const guide = texts.join("\n\n").slice(0, 16000);
        if (!guide && !images.length) return fail(req, "no_guide", 400);
        const prompt = customPrompt(body, guide);
        const content = images.length ? [{ type: "text" as const, text: prompt }, ...images.map((url) => ({ type: "image_url" as const, image_url: { url } }))] : prompt;
        const data = await chatJson([sys, { role: "user", content }], MODEL, 8000);
        const arr = Array.isArray(data) ? data : Array.isArray(data?.questions) ? data.questions : null;
        if (!arr || !arr.length) return fail(req, "bad_output", 502);
        return cors(req, NextResponse.json({ data: { title: typeof data?.title === "string" ? data.title.slice(0, 80) : "", questions: arr } }));
      }
      case "spec": {
        // B1: đọc ma trận / đặc tả / dàn ý → phiếu đặc tả
        const g = await gather(body); if ("error" in g) return fail(req, g.error, g.status);
        const spec = asObj(await chatJson([sys, { role: "user", content: withImages(specPrompt(body, g.guide), g.images) }], MODEL, 6000));
        if (!spec || !(spec.kind === "van" ? asObj(spec.van)?.reading : asObj(spec.quiz)?.sections)) return fail(req, "bad_output", 502);
        return cors(req, NextResponse.json({ data: spec }));
      }
      case "van_make": {
        // B2 (Văn): chọn ngữ liệu đúng thể loại rồi soạn đề + hướng dẫn chấm
        const spec = asObj(body.spec); if (!spec || !asObj(spec.van)) return fail(req, "bad_request", 400);
        let passage = pickPassage(spec);
        if (!passage) {
          const o = asObj(await chatJson([sys, { role: "user", content: vanOriginalPrompt(spec) }], MODEL, 3000));
          if (!o || typeof o.text !== "string" || o.text.length < 150) return fail(req, "bad_output", 502);
          passage = { text: o.text, title: String(o.title || ""), author: "", src: "(Văn bản do AI viết làm ngữ liệu, không phải tác phẩm có thật)", mine: true, genre: String(spec.van.genre || "") };
        }
        const exam = asObj(await chatJson([sys, { role: "user", content: vanMakePrompt(spec, passage) }], MODEL, 9000));
        if (!exam || !Array.isArray(exam.questions) || !exam.questions.length) return fail(req, "bad_output", 502);
        return cors(req, NextResponse.json({ data: { exam, passage } }));
      }
      case "van_check": {
        // B3 (Văn): phản biện đề với phiếu đặc tả, sửa chỗ lệch
        const spec = asObj(body.spec), exam = asObj(body.exam); if (!spec || !exam || typeof body.passage !== "string") return fail(req, "bad_request", 400);
        const fixed = asObj(await chatJson([sys, { role: "user", content: vanCheckPrompt(spec, exam, body.passage) }], MODEL, 9000));
        if (!fixed || !Array.isArray(fixed.questions) || !fixed.questions.length) return fail(req, "bad_output", 502);
        return cors(req, NextResponse.json({ data: fixed }));
      }
      case "quiz_make": {
        // B2 (môn khác): soạn câu hỏi theo một nhóm dòng ma trận (client chia nhóm để mỗi lần ≤ 14 câu)
        const spec = asObj(body.spec), sections = Array.isArray(body.sections) ? body.sections.slice(0, 8) : null;
        if (!spec || !sections || !sections.length) return fail(req, "bad_request", 400);
        const data = await chatJson([sys, { role: "user", content: quizMakePrompt(spec, sections) }], MODEL, 9000);
        const arr = Array.isArray(data) ? data : Array.isArray(data?.questions) ? data.questions : null;
        if (!arr || !arr.length) return fail(req, "bad_output", 502);
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
      case "review": {
        // Báo đáp án sai: cần đăng nhập để chống spam
        if (!userId && sb) return fail(req, "unauthorized", 401);
        const out = await reviewReport(body, { userId, token: token || null, origin: req.nextUrl.origin });
        if ("error" in out) return fail(req, out.error as string, 400);
        return cors(req, NextResponse.json(out));
      }
      default:
        return fail(req, "bad_task", 400);
    }
  } catch (e) {
    console.error("[api/ai]", (e as Error).message);
    const st = (e as { status?: number }).status, msg = (e as Error).message || "";
    if (st === 429) return fail(req, "rate_limited", 429);
    if (/no_json|Unexpected token|JSON/.test(msg)) return fail(req, "bad_output", 502);
    if (/empty_output/.test(msg)) return fail(req, "empty_output", 502);
    if (/TimeoutError|aborted|timeout/i.test(msg) || (e as Error).name === "TimeoutError") return fail(req, "timeout", 504);
    if (st === 401 || st === 403) return fail(req, "bad_key", 502);
    if (st === 400) return fail(req, "upstream_400", 502);
    return fail(req, "upstream_error", 502);
  }
}
