import "server-only";
/* Lấy chữ từ file người dùng tải lên (ma trận đề, dàn ý, đề mẫu): txt/md/csv, docx, pdf. Ảnh gửi thẳng cho model. */

export type UpFile = { name: string; type: string; data: string /* base64, không có tiền tố data: */ };
export const MAX_BYTES = 3_500_000;
const IMG = /^image\/(png|jpe?g|webp|gif)$/;

export function isImage(f: UpFile) { return IMG.test(f.type) || /\.(png|jpe?g|webp|gif)$/i.test(f.name); }

export async function extractText(f: UpFile): Promise<string> {
  const buf = Buffer.from(f.data, "base64");
  if (buf.length > MAX_BYTES) throw Object.assign(new Error("file_too_big"), { code: "file_too_big" });
  const name = f.name.toLowerCase();
  if (/\.(txt|md|csv|tsv|json)$/.test(name) || /^text\//.test(f.type)) return buf.toString("utf8");
  if (name.endsWith(".docx")) {
    const mammoth = (await import("mammoth")).default;
    const { value } = await mammoth.extractRawText({ buffer: buf });
    return value;
  }
  if (name.endsWith(".pdf") || f.type === "application/pdf") {
    const { extractText: pdfText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buf));
    const { text } = await pdfText(pdf, { mergePages: true });
    return Array.isArray(text) ? text.join("\n") : text;
  }
  throw Object.assign(new Error("file_type"), { code: "file_type" });
}
