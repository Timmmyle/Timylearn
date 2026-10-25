import "server-only";
/* Chọn ngữ liệu đọc hiểu cho đề Văn: ưu tiên kho văn bản đã kiểm nguyên văn, cùng thể loại,
   khác tác phẩm trong tài liệu (để học sinh gặp văn bản mới); nếu không có thì dùng văn bản trong tài liệu. */
import CORPUS from "./van-corpus.json";

type Item = { id: string; genre: string; genre_label: string; author: string; title: string; grade: number; text: string; src: string; real: boolean };
export type Passage = { text: string; title: string; author: string; src: string; mine: boolean; genre: string; id?: string };
const norm = (x: string) => x.toLowerCase().normalize("NFC").replace(/[^\p{L}\p{N} ]/gu, "").trim();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function pickPassage(spec: any): Passage | null {
  const v = spec.van || {};
  const want = String(v.genre || "");
  const docTitle = norm(String(v.work_in_doc?.title || "")), docAuthor = norm(String(v.work_in_doc?.author || ""));
  const same = (x: Item) => (docTitle && norm(x.title).includes(docTitle.slice(0, 12))) || (docAuthor && docTitle && norm(x.author) === docAuthor && norm(x.title).startsWith(docTitle.slice(0, 6)));
  const pool = (CORPUS as Item[]).filter((x) => x.genre === want && !same(x));
  // Văn bản thơ/truyện có thật được ưu tiên; nghị luận/thông tin dùng được cả văn bản tự soạn
  const real = pool.filter((x) => x.real);
  const list = real.length ? real : pool;
  if (list.length) {
    const g = +spec.grade || 0;
    const byGrade = list.filter((x) => !x.grade || x.grade <= g || !g);
    const pickFrom = byGrade.length ? byGrade : list;
    const x = pickFrom[Math.floor(Math.random() * pickFrom.length)];
    return { text: x.text, title: x.title, author: x.author, src: x.src, mine: !x.real, genre: x.genre, id: x.id };
  }
  const doc = String(v.doc_passage || "").trim();
  if (doc.length >= 200) {
    const w = v.work_in_doc || {};
    return { text: doc.slice(0, 5000), title: String(w.title || ""), author: String(w.author || ""), src: `(${[w.author, w.title].filter(Boolean).join(", ") || "Văn bản trong tài liệu của bạn"})`, mine: false, genre: want };
  }
  return null;
}
