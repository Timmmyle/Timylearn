#!/usr/bin/env node
/* Kho ngữ liệu Ngữ văn đã kiểm nguyên văn (lấy từ đề ôn HK và đề ĐGNL) → lib/server/van-corpus.json
   Dùng khi AI ra đề Văn theo tài liệu: chọn văn bản cùng thể loại thay vì để AI tự "nhớ" trích dẫn.
   node scripts/data/van-corpus.mjs */
import fs from "node:fs";
const out = [];
const genreOf = (g) => /truyện thơ|lục bát/i.test(g) ? "truyen_tho" : /thơ/i.test(g) ? "tho" : /truyện/i.test(g) ? "truyen" : /nghị luận|chính luận|cáo|thư/i.test(g) ? "nghi_luan" : /thông tin/i.test(g) ? "thong_tin" : /kí|ký|tùy bút|tản văn/i.test(g) ? "ki" : /kịch/i.test(g) ? "kich" : "khac";
for (const dir of ["data/hk1/src", "data/hk2/src"]) for (const f of fs.readdirSync(dir).filter((x) => /-van-/.test(x))) {
  const d = JSON.parse(fs.readFileSync(`${dir}/${f}`, "utf8"));
  out.push({ id: "hk-" + f.replace(".json", ""), genre: genreOf(d.genre || ""), genre_label: d.genre, author: d.work?.author || "", title: d.work?.title || "", grade: d.grade, text: d.passage, src: d.src, real: true });
}
// Ngữ liệu trong đề ĐGNL (bỏ dòng "Đọc … sau" ở đầu và dòng nguồn ở cuối)
const EXTRA = [
  ["hsa/de2-van", "p1", "tho", "Thơ trữ tình hiện đại", "Hàn Mặc Tử", "Đây thôn Vĩ Dạ", true],
  ["hsa/de2-van", "p3", "truyen", "Truyện ngắn hiện thực", "Nam Cao", "Chí Phèo (đoạn mở đầu)", true],
  ["hsa/luyen-van", "p2", "tho", "Thơ lục bát (phong trào Thơ mới)", "Nguyễn Bính", "Tương tư (8 câu đầu)", true],
  ["hsa/de1-van", "p4", "thong_tin", "Văn bản thông tin", "", "Đọc sâu trong môi trường số", false],
  ["hsa/de2-van", "p4", "thong_tin", "Văn bản thông tin", "", "Hiện tượng đảo nhiệt đô thị", false],
  ["hsa/luyen-van", "p3", "thong_tin", "Văn bản thông tin", "", "Chữ Nôm", false],
  ["vact/de2-tv", "p1", "thong_tin", "Văn bản thông tin", "", "Rừng ngập mặn", false],
  ["hsa/de1-van", "p5", "nghi_luan", "Văn bản nghị luận xã hội", "", "Năng lực tự học", false],
  ["hsa/de2-van", "p5", "nghi_luan", "Văn bản nghị luận xã hội", "", "Biết lắng nghe", false],
  ["vact/de1-tv", "p3", "nghi_luan", "Văn bản nghị luận xã hội", "", "Đừng sợ thất bại", false],
  ["vact/luyen-tv", "p2", "nghi_luan", "Văn bản nghị luận xã hội", "", "Đọc sách trong thời đại số", false],
  ["vact/de1-tv", "p1", "nghi_luan", "Văn bản nghị luận xã hội", "", "Giữ gìn tiếng Việt", false],
];
for (const [f, k, genre, label, author, title, real] of EXTRA) {
  const d = JSON.parse(fs.readFileSync(`data/dgnl/src/${f}.json`, "utf8"));
  let t = String(d.passages[k]).replace(/^Đọc[^\n]*\n\n/, "");
  const m = /\n\n(\([^)]*\))\s*$/.exec(t); const src = m ? m[1] : "(Văn bản do người soạn đề viết)"; if (m) t = t.slice(0, m.index);
  out.push({ id: `dg-${f.replace("/", "-")}-${k}`, genre, genre_label: label, author, title, grade: 0, text: t.trim(), src: real ? src : "(Văn bản do người soạn đề viết)", real });
}
fs.writeFileSync("lib/server/van-corpus.json", JSON.stringify(out, null, 1));
const c = {}; out.forEach((x) => (c[x.genre] = (c[x.genre] || 0) + 1));
console.log(`✓ ${out.length} văn bản`, c);
