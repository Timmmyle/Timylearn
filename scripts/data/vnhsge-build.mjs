#!/usr/bin/env node
/**
 * Chuyển bộ dữ liệu VNHSGE (https://github.com/Xdao85/VNHSGE) sang định dạng câu hỏi của app.
 *
 *   git clone --depth 1 https://github.com/Xdao85/VNHSGE.git ../VNHSGE
 *   node scripts/data/vnhsge-build.mjs --src ../VNHSGE --out data/vnhsge
 *
 * Kết quả (thư mục --out):
 *   exam_sets.json       danh sách đề
 *   questions.json       câu hỏi đã chuẩn hóa (chỉ câu “sạch”)
 *   write_passages.json  đề đọc hiểu Ngữ văn (dùng cho Luyện trình bày)
 *   review.json          câu bị loại hoặc cần người xem lại, kèm lý do
 *   images/*.webp        ảnh câu hỏi/lời giải đã nén
 *   report.md            thống kê
 *
 * Việc chuẩn hóa: tách 4 phương án A–D, bỏ tiền tố “Câu n”, bọc công thức vào $...$ để app hiển thị bằng KaTeX,
 * kiểm tra từng công thức render được, đối chiếu đáp án với “Chọn X” trong lời giải, nén ảnh PNG → WebP.
 */
import fs from "node:fs";
import path from "node:path";
import katex from "katex";

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => (x.startsWith("--") ? [...a, [x.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : true]] : a), []));
const SRC = path.resolve(args.src || "../VNHSGE");
const OUT = path.resolve(args.out || "data/vnhsge");
const NO_IMAGES = !!args["no-images"];
const ROOT = path.join(SRC, "Dataset/VNHSGE-V/JSON format");
if (!fs.existsSync(ROOT)) { console.error("Không thấy thư mục dữ liệu:", ROOT); process.exit(1); }

const SUBJ = {
  Mathematics: { vi: "Toán", code: "math", min: 90, stem: true },
  Physics: { vi: "Vật lí", code: "phy", min: 50, stem: true },
  Chemistry: { vi: "Hóa học", code: "chem", min: 50, stem: true, chem: true },
  Biology: { vi: "Sinh học", code: "bio", min: 50, stem: true },
  English: { vi: "Tiếng Anh", code: "eng", min: 60 },
  History: { vi: "Lịch sử", code: "his", min: 50 },
  Geography: { vi: "Địa lí", code: "geo", min: 50 },
  CivicEducation: { vi: "GDCD", code: "civ", min: 50 },
};

/* ------------------------------------------------------------------ */
/* 1. Tách phương án                                                    */
/* ------------------------------------------------------------------ */
const MARK = /(^|\n|\t| {2,}| {2,})[ \t ]*([A-D])[ \t ]*[.)][ \t ]*/g;
function splitOptions(text) {
  const marks = [];
  let m;
  MARK.lastIndex = 0;
  while ((m = MARK.exec(text))) marks.push({ L: m[2], at: m.index, end: m.index + m[0].length });
  // Ưu tiên chuỗi A,B,C,D liên tiếp đúng thứ tự
  for (let i = 0; i + 3 < marks.length; i++) {
    const q = marks.slice(i, i + 4);
    if (q.map((x) => x.L).join("") === "ABCD") {
      const opts = q.map((x, k) => text.slice(x.end, k < 3 ? q[k + 1].at : (marks[i + 4]?.at ?? text.length)));
      // Nếu sau D còn một chuỗi A–D khác (đề lặp), cắt ở đó
      return { stem: text.slice(0, q[0].at), opts, how: "seq" };
    }
  }
  // Thứ tự lộn (A C B D) hoặc lặp dòng: lấy lần xuất hiện đầu của mỗi chữ cái
  const first = {};
  marks.forEach((x, idx) => { if (!(x.L in first)) first[x.L] = idx; });
  if (Object.keys(first).length === 4) {
    const order = Object.values(first).sort((a, b) => a - b);
    const opts = {};
    order.forEach((idx, k) => { const x = marks[idx]; const next = order[k + 1] !== undefined ? marks[order[k + 1]].at : (marks[idx + 1]?.at ?? text.length); opts[x.L] = text.slice(x.end, next); });
    return { stem: text.slice(0, marks[order[0]].at), opts: ["A", "B", "C", "D"].map((L) => opts[L]), how: "relaxed" };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* 2. Chuẩn hóa công thức → $...$                                      */
/* ------------------------------------------------------------------ */
const VI = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
const MATH_WORDS = new Set(["sin", "cos", "tan", "cot", "log", "ln", "lim", "max", "min", "dx", "dt", "dy", "exp", "arcsin", "arccos", "arctan", "tg", "cotg"]);

function cleanTex(s, chem) {
  let t = s
    .replace(/\{(log|ln|sin|cos|tan|cot|lim|max|min)\}/g, "\\$1 ")
    .replace(/(^|[^\\a-zA-Z])(log|ln|sin|cos|tan|cot|lim)(?=[_^({\s\d a-zA-Z])/g, "$1\\$2 ")
    .replace(/\\left\s*\(/g, "(").replace(/\\right\s*\)/g, ")")
    .replace(/(\w|\))\*(\w|\\|\()/g, "$1 \\cdot $2")
    .replace(/[’′]/g, "'")
    .replace(/×/g, "\\times ")
    .replace(/≤/g, "\\le ").replace(/≥/g, "\\ge ").replace(/≠/g, "\\ne ")
    .replace(/⇔/g, "\\Leftrightarrow ").replace(/⇒/g, "\\Rightarrow ").replace(/→/g, "\\rightarrow ")
    .replace(/(?<![\d.,])(\d+)\/(\d+)(?![\d.,])/g, "\\dfrac{$1}{$2}")
    .replace(/&/g, s.includes("\\begin") ? "&" : ";\\ ")
    .replace(/\s+/g, " ")
    .trim();
  if (chem) t = "\\mathrm{" + t + "}";
  return t;
}

function okTex(src) {
  try { katex.renderToString(src, { throwOnError: true, strict: "ignore" }); return true; } catch { return false; }
}

/** Văn bản đã có $...$: chỉ làm sạch bên trong và kiểm tra */
function fixDelimited(text, chem, flags) {
  return text.replace(/\$\$([^$]+)\$\$|\$([^$]+)\$/g, (all, d, i) => {
    const raw = d ?? i;
    const t = cleanTex(raw, chem);
    if (okTex(t)) return "$" + t + "$";
    flags.add("tex_error");
    return raw;
  });
}

function looksMath(tok) {
  if (!tok) return false;
  if (VI.test(tok)) return false;
  if (/[\\^_=<>{}|+]/.test(tok)) return true;
  if (/^[-–−]$/.test(tok)) return "op";
  if (/\d/.test(tok)) return true;
  const core = tok.replace(/[.,;:?!()]+$/g, "").replace(/^[(]+/, "");
  if (!core) return /[()]/.test(tok);
  if (/[()\/]/.test(tok)) return true;
  if (/^[A-Za-z]$/.test(core)) return true;
  if (/^[A-Z]{2,4}'?$/.test(core)) return true;      // AB, ABC, SA
  if (MATH_WORDS.has(core.toLowerCase())) return true;
  return false;
}

/** Văn bản chưa có $: tìm các cụm công thức và bọc lại */
function wrapRaw(text, chem, flags) {
  return text.split("\n").map((line) => {
    const toks = line.split(/(\s+)/);
    const out = []; let run = [];
    const flush = () => {
      if (!run.length) return;
      // tách khoảng trắng & dấu câu cuối ra ngoài
      let s = run.join("");
      const lead = s.match(/^\s*/)[0], trail = s.match(/[\s.,;:?!]*$/)[0];
      s = s.slice(lead.length, s.length - trail.length);
      run = [];
      if (!s) { out.push(lead + trail); return; }
      const onlyPlain = /^[A-Za-z]{1,4}$|^\d+([.,]\d+)?$/.test(s); // chữ cái/số đơn: không cần bọc (trừ môn tự nhiên vẫn đẹp hơn khi bọc)
      const t = cleanTex(s, chem);
      if (onlyPlain && !/[A-Za-z]/.test(s)) { out.push(lead + s + trail); return; }
      if (okTex(t)) out.push(lead + "$" + t + "$" + trail);
      else { flags.add("tex_error"); if (process.env.DBG) console.error("RENDER:", JSON.stringify(t)); out.push(lead + s + trail); }
    };
    for (let i = 0; i < toks.length; i++) {
      const tk = toks[i];
      if (/^\s+$/.test(tk)) { if (run.length) run.push(tk); else out.push(tk); continue; }
      const m = looksMath(tk);
      if (m === true || (m === "op" && run.length)) run.push(tk);
      else { flush(); out.push(tk); }
    }
    flush();
    return out.join("");
  }).join("\n");
}

// tách công thức dính chữ: "\frac{BD}{bd}giảm", "\right]dxbằng"
const glue = (t) => t.replace(/([})\]])(?=[A-Za-zÀ-ỹđĐ])/g, "$1 ").replace(/([\s)\]}])(d[xt])(?=[a-zA-Z]*[À-ỹđ])/g, "$1$2 ");

function normText(text, cfg, flags) {
  let t = String(text || "").replace(/ /g, " ").replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  // \[...\] và \(...\) → $...$
  t = t.replace(/\\\[([\s\S]+?)\\\]/g, (_, m) => "$" + m + "$").replace(/\\\(([\s\S]+?)\\\)/g, (_, m) => "$" + m + "$");
  if (!cfg.stem) {
    t = t.replace(/\$/g, "").replace(/\\underline\{([^}]*)\}/g, (_, w) => "$\\underline{\\text{" + w + "}}$");
  } else if (t.includes("$")) {
    t = fixDelimited(t, cfg.chem, flags);
    // phần nằm ngoài $...$ nhưng vẫn còn lệnh LaTeX → bọc thêm
    t = t.split(/(\$[^$]*\$)/).map((part, i) => (i % 2 === 0 && /\\[a-zA-Z]/.test(part) ? wrapRaw(glue(part), cfg.chem, flags) : part)).join("");
  } else if (cfg.code === "math" || /[\\^_]|\d\/\d/.test(t)) t = wrapRaw(glue(t), cfg.chem, flags);
  // Còn lệnh LaTeX nằm ngoài $...$ (vd \begin{align}) → không hiển thị được
  if (/\\[a-zA-Z]{2,}/.test(t.replace(/\$[^$]*\$/g, ""))) { flags.add("tex_error"); if (process.env.DBG) console.error("OUTSIDE:", JSON.stringify(t.slice(0, 300))); }
  return t;
}

/* ------------------------------------------------------------------ */
/* 3. Duyệt dữ liệu                                                     */
/* ------------------------------------------------------------------ */
const sets = [], questions = [], review = [], passages = [], images = new Map();
const stat = { files: 0, raw: 0, ok: 0, rejected: {}, flagged: {} };
const bump = (o, k) => (o[k] = (o[k] || 0) + 1);

function setMeta(file, subj, split) {
  const base = path.basename(file, ".json");
  const cfg = SUBJ[subj];
  let m;
  if ((m = base.match(/^MET_\w+?_(IE|OE)_(\d{4})(?:_(\d+))?$/))) {
    const year = +m[2], code = m[3] || null;
    return { id: `vnhsge-${cfg.code}-${year}${code ? "-" + code : ""}`, kind: "official", year, code, title: `Đề thi tốt nghiệp THPT ${year} – ${cfg.vi}${code ? ` (mã đề ${code})` : ""}` };
  }
  m = base.match(/_(\d+)$/);
  const n = m ? +m[1] : 0;
  return { id: `vnhsge-${cfg.code}-on-${n}`, kind: "practice", year: null, code: null, title: `Đề ôn thi tốt nghiệp THPT – ${cfg.vi} số ${n}`, split };
}

function levelOf(i, n) { const r = i / n; return r < 0.5 ? 1 : r < 0.8 ? 2 : 3; }

for (const split of ["eval", "test", "train"]) {
  const dir = path.join(ROOT, split);
  if (!fs.existsSync(dir)) continue;
  for (const subjDir of fs.readdirSync(dir)) {
    const subj = subjDir.replace(/\s/g, "");
    const cfg = SUBJ[subj];
    const files = fs.readdirSync(path.join(dir, subjDir)).filter((f) => f.endsWith(".json")).sort();
    for (const f of files) {
      const full = path.join(dir, subjDir, f);
      stat.files++;
      if (subj === "Literature") { readLiterature(full); continue; }
      if (!cfg) continue;
      const meta = setMeta(full, subj, split);
      const data = JSON.parse(fs.readFileSync(full, "utf8"));
      const qids = [];
      data.forEach((x, i) => {
        stat.raw++;
        const id = `${meta.id}-${String(i + 1).padStart(2, "0")}`;
        const flags = new Set();
        let txt = String(x.Question || "").replace(/ /g, " ").replace(/\r/g, "");
        // Bỏ tiền tố “Câu 12:” / “CÂU 12)” / “Question 3:”
        txt = txt.replace(/(^|\n)\s*(Câu|CÂU|Question)\s*\d+\s*[:.)]?\s*/, "$1").trim();
        const sp = splitOptions(txt);
        const reject = (why) => { bump(stat.rejected, why); review.push({ id, set: meta.id, why, question: x.Question, choice: x.Choice, explanation: x.Explanation }); };
        if (!sp) return reject("khong_tach_duoc_4_phuong_an");
        let opts = sp.opts.map((o) => o.replace(/\s+/g, " ").trim().replace(/^[.)]\s*/, ""));
        // Bỏ dấu chấm cuối với phương án ngắn (không phải câu tiếng Anh)
        opts = opts.map((o) => (o.length < 40 && !/\.\.$/.test(o) ? o.replace(/[.;]\s*$/, "") : o));
        if (opts.some((o) => !o)) return reject("phuong_an_rong");
        if (new Set(opts).size < 4) return reject("phuong_an_trung");
        const ans = "ABCD".indexOf(String(x.Choice || "").trim().toUpperCase().charAt(0));
        if (ans < 0) return reject("thieu_dap_an");
        const exp = String(x.Explanation || "");
        const chosen = [...exp.matchAll(/Chọn\s*(?:đáp án\s*)?([A-D])\b/gi)].map((m) => m[1].toUpperCase());
        if (chosen.length && chosen[chosen.length - 1] !== "ABCD"[ans]) return reject("dap_an_lech_loi_giai");
        if (sp.how === "relaxed") flags.add("thu_tu_phuong_an");

        // Đề có ảnh bảng biến thiên: bỏ các dòng chép lại bảng dạng chữ (“x -\infty 0 2 +\infty”, “f’(x) - 0 + 0 -”)
        let rawStem = sp.stem;
        if (x.Image_Question) rawStem = rawStem.split("\n").filter((l) => !/^\s*(x|t|y|y['’]|[fgh]\(x\)|[fgh]['’]\(x\)|[fgh]['’]?)\s+\S+(\s+\S+){2,}\s*$/.test(l) || /=|[À-ỹđ]/.test(l)).join("\n");
        const stem = normText(rawStem, cfg, flags);
        const options = opts.map((o) => normText(o, cfg, flags));
        const eflags = new Set();
        let explanation = normText(exp.replace(/\n?\s*(=>|⇒|\$\\Rightarrow\$)?\s*Chọn\s*(đáp án\s*)?[A-D]\.?\s*$/i, "").replace(/^\s*Chọn\s*(đáp án\s*)?[A-D]\.?\s*\n/i, ""), cfg, eflags);
        if (flags.has("tex_error")) { bump(stat.flagged, "tex_error"); return reject("cong_thuc_loi"); }
        // Lời giải lỗi định dạng: giữ câu hỏi, bỏ lời giải
        if (eflags.has("tex_error")) { explanation = ""; flags.add("bo_loi_giai"); bump(stat.flagged, "bo_loi_giai"); }
        if (!stem || stem.length < 3) return reject("de_bai_rong");

        const imgQ = x.Image_Question ? registerImage(path.join(dir, subjDir, x.Image_Question)) : null;
        const imgA = x.Image_Answer ? registerImage(path.join(dir, subjDir, x.Image_Answer)) : null;
        if (x.Image_Question && !imgQ) return reject("thieu_anh");

        questions.push({
          id, set_id: meta.id, ord: i + 1, subject: cfg.vi, topic: meta.kind === "official" ? "Đề thi tốt nghiệp" : "Đề ôn tốt nghiệp",
          level: levelOf(i, data.length), stem, options, answer: ans, explanation: explanation || null,
          image_q: imgQ, image_a: imgA, source_ref: `VNHSGE ${split}/${subjDir}/${path.basename(f)}#${x.ID}`, flags: [...flags],
        });
        qids.push(id); stat.ok++;
      });
      if (qids.length) {
        sets.push({
          id: meta.id, source: "VNHSGE", kind: meta.kind, exam: "thpt", year: meta.year, subject: cfg.vi, code: meta.code,
          title: meta.title, grade: 12, curriculum: "2006", question_count: qids.length, duration_min: cfg.min, published: true,
        });
      }
    }
  }
}

function registerImage(p) {
  if (!fs.existsSync(p)) return null;
  const name = path.relative(ROOT, p).replace(/[\\/ ]+/g, "_").replace(/\.png$/i, ".webp").toLowerCase();
  images.set(name, p);
  return name;
}

/* ---------------- Ngữ văn: đọc hiểu → Luyện trình bày ---------------- */
function guessType(q) {
  const s = q.toLowerCase();
  if (/biện pháp|tác dụng|hiệu quả/.test(s)) return "tutu";
  if (/rút ra|bài học|đồng tình|quan điểm|suy nghĩ|thông điệp.*ý nghĩa nhất|anh\/chị có/.test(s)) return "quandiem";
  if (/xác định|chỉ ra|theo (đoạn trích|văn bản|tác giả)|tìm|nêu (phương thức|thể thơ)/.test(s)) return "nhanbiet";
  return "noidung";
}
function toPoints(ans) {
  const lines = String(ans).split(/\n+/).map((l) => l.replace(/^[-–•+*\s]+/, "").trim()).filter((l) => l.length > 3);
  return (lines.length ? lines : [String(ans).trim()]).slice(0, 6);
}
function readLiterature(full) {
  const data = JSON.parse(fs.readFileSync(full, "utf8"));
  const base = path.basename(full, ".json");
  const year = +(base.match(/(\d{4})/) || [])[1];
  const first = data[0]?.["Câu hỏi"] || "";
  const m = first.match(/Đọc (?:đoạn trích|văn bản|bài thơ)[^:\n]*:?\s*\n([\s\S]*?)\n\s*(?:Thực hiện (?:các )?yêu cầu[^\n]*\n)?\s*Câu 1[.:]\s*([\s\S]*)$/i);
  if (!m) { review.push({ id: base, why: "van_khong_tach_duoc_doan_trich" }); return; }
  let passage = m[1].trim();
  let srcNote = "";
  const sm = passage.match(/\n\s*(\(?(Trích|Theo)[^\n]*\)?)\s*$/);
  if (sm) { srcNote = sm[1].replace(/^\(|\)$/g, ""); passage = passage.slice(0, sm.index).trim(); }
  const qs = [];
  const items = [{ q: m[2].trim(), x: data[0] }, ...data.slice(1).filter((x) => !/LÀM VĂN|\(\s*[2-5][,.]0 điểm\)/i.test(x["Câu hỏi"])).map((x) => ({ q: x["Câu hỏi"].replace(/^Câu\s*\d+[.:]\s*/i, "").trim(), x }))];
  for (const it of items) {
    if (/LÀM VĂN/i.test(it.q)) break;
    const model = String(it.x["Gợi ý trả lời"] || "").trim();
    const points = toPoints(it.x["Đáp án"] || model);
    if (!it.q || !model) continue;
    qs.push({ q: it.q, type: guessType(it.q), points, model });
  }
  if (qs.length) passages.push({
    id: `vnhsge-van-${year}`, source: "VNHSGE", year, title: `Đọc hiểu – Đề thi tốt nghiệp THPT ${year}`,
    passage, src: (srcNote ? srcNote + ". " : "") + `Đề thi tốt nghiệp THPT ${year} môn Ngữ văn`, questions: qs, published: true,
  });
}

/* ------------------------------------------------------------------ */
/* 4. Ghi kết quả                                                      */
/* ------------------------------------------------------------------ */
fs.mkdirSync(path.join(OUT, "images"), { recursive: true });
const used = new Set(questions.flatMap((q) => [q.image_q, q.image_a]).filter(Boolean));
let imgBytes = 0;
for (const f of fs.readdirSync(path.join(OUT, "images"))) if (!used.has(f)) fs.unlinkSync(path.join(OUT, "images", f)); // bỏ ảnh cũ không dùng
if (!NO_IMAGES && used.size) {
  const sharp = (await import("sharp")).default;
  for (const name of used) {
    const dst = path.join(OUT, "images", name);
    if (!fs.existsSync(dst)) await sharp(images.get(name)).resize({ width: 1000, withoutEnlargement: true }).flatten({ background: "#ffffff" }).webp({ quality: 80 }).toFile(dst);
    imgBytes += fs.statSync(dst).size;
  }
}
sets.sort((a, b) => (b.kind === "official") - (a.kind === "official") || (b.year || 0) - (a.year || 0) || a.subject.localeCompare(b.subject, "vi") || a.id.localeCompare(b.id, "en", { numeric: true }));
const W = (f, d) => fs.writeFileSync(path.join(OUT, f), JSON.stringify(d, null, 1));
W("exam_sets.json", sets); W("questions.json", questions); W("write_passages.json", passages); W("review.json", review);

const bySubj = {};
for (const q of questions) { const s = (bySubj[q.subject] ||= { q: 0, off: 0 }); s.q++; if (q.set_id.match(/-\d{4}/)) s.off++; }
const report = `# VNHSGE → Ôn Thi

- Tệp đọc: ${stat.files}
- Câu gốc (trắc nghiệm): ${stat.raw}
- Câu nhập được: **${stat.ok}** (${Math.round((stat.ok / stat.raw) * 100)}%)
- Đề: ${sets.length} (chính thức ${sets.filter((s) => s.kind === "official").length}, ôn luyện ${sets.filter((s) => s.kind === "practice").length})
- Đọc hiểu Ngữ văn: ${passages.length} đề, ${passages.reduce((a, p) => a + p.questions.length, 0)} câu
- Ảnh: ${used.size} tệp, ${(imgBytes / 1048576).toFixed(1)} MB sau nén

## Theo môn
| Môn | Câu | Trong đề chính thức |
|---|---|---|
${Object.entries(bySubj).map(([k, v]) => `| ${k} | ${v.q} | ${v.off} |`).join("\n")}

## Câu bị loại (xem review.json)
${Object.entries(stat.rejected).sort((a, b) => b[1] - a[1]).map(([k, v]) => `- ${k}: ${v}`).join("\n")}
`;
fs.writeFileSync(path.join(OUT, "report.md"), report);
console.log(report);
