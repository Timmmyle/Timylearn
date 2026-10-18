#!/usr/bin/env node
/**
 * Nạp đề + câu hỏi + ảnh vào Supabase.
 *
 *   # .env.local cần NEXT_PUBLIC_SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY (Project Settings → API → service_role)
 *   node scripts/data/upload.mjs --dir data/vnhsge            # nạp tất cả
 *   node scripts/data/upload.mjs --dir data/vnhsge --dry-run  # chỉ kiểm tra, không ghi
 *
 * Chạy lại nhiều lần được (upsert theo id). KHÔNG đưa service_role key vào code phía client.
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => (x.startsWith("--") ? [...a, [x.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : true]] : a), []));
const DIR = path.resolve(args.dir || "data/vnhsge");
const DRY = !!args["dry-run"];

// Đọc .env.local / .env nếu có
for (const f of [".env.local", ".env"]) {
  if (!fs.existsSync(f)) continue;
  for (const line of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const read = (f) => (fs.existsSync(path.join(DIR, f)) ? JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")) : []);
const sets = read("exam_sets.json"), questions = read("questions.json"), passages = read("write_passages.json");
const imgDir = path.join(DIR, "images");
const images = fs.existsSync(imgDir) ? fs.readdirSync(imgDir) : [];
console.log(`Thư mục: ${DIR}\n  ${sets.length} đề, ${questions.length} câu, ${passages.length} bài đọc hiểu, ${images.length} ảnh`);

// Kiểm tra nhanh trước khi ghi
const setIds = new Set(sets.map((s) => s.id));
const okShape = (q) => {
  const t = q.qtype || "mcq";
  if (t === "tf") return Array.isArray(q.statements) && q.statements.length >= 2 && q.statements.every((x) => x && typeof x.t === "string" && typeof x.a === "boolean");
  if (t === "short") return typeof q.answer_text === "string" && q.answer_text.trim() !== "";
  return Array.isArray(q.options) && q.options.length === 4 && q.answer >= 0 && q.answer <= 3;
};
const bad = questions.filter((q) => !setIds.has(q.set_id) || !okShape(q));
if (bad.length) { console.error(`✗ ${bad.length} câu không hợp lệ, ví dụ:`, bad[0]?.id); process.exit(1); }
if (DRY) { console.log("✓ Dữ liệu hợp lệ (dry-run, chưa ghi gì)."); process.exit(0); }
if (!URL || !KEY) { console.error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local"); process.exit(1); }

const sb = createClient(URL, KEY, { auth: { persistSession: false } });

async function upsert(table, rows, size = 500) {
  for (let i = 0; i < rows.length; i += size) {
    const { error } = await sb.from(table).upsert(rows.slice(i, i + size), { onConflict: "id" });
    if (error) throw new Error(`${table} [${i}]: ${error.message}`);
    process.stdout.write(`\r  ${table}: ${Math.min(i + size, rows.length)}/${rows.length}`);
  }
  if (rows.length) process.stdout.write("\n");
}

try {
  await upsert("exam_sets", sets);
  await upsert("questions", questions);
  await upsert("write_passages", passages, 50);
  let n = 0;
  for (const f of images) {
    const { error } = await sb.storage.from("question-images").upload(f, fs.readFileSync(path.join(imgDir, f)), { contentType: "image/webp", upsert: true, cacheControl: "31536000" });
    if (error) throw new Error(`ảnh ${f}: ${error.message}`);
    process.stdout.write(`\r  ảnh: ${++n}/${images.length}`);
  }
  if (images.length) process.stdout.write("\n");
  console.log("✓ Xong. Mở app → Đề thi để xem các đề vừa nạp.");
} catch (e) {
  console.error("\n✗", e.message);
  if (/relation .* does not exist|schema cache/i.test(e.message)) console.error("  → Chạy supabase/migrations/0002_question_bank.sql trong SQL Editor trước.");
  if (/permission denied/i.test(e.message)) console.error("  → Chạy supabase/migrations/0003_grants.sql trong SQL Editor (cấp quyền bảng cho service_role), rồi chạy lại.\n    Kiểm tra SUPABASE_SERVICE_ROLE_KEY là khóa service_role / secret, không phải anon / publishable.");
  if (/Bucket not found/i.test(e.message)) console.error("  → Tạo bucket công khai tên question-images (Storage → New bucket) hoặc chạy lại 0002_question_bank.sql.");
  process.exit(1);
}
