# Hướng dẫn viết dạng bài tự sinh – Học kì 2 (Toán, Vật lí, Hóa học)

Mỗi "dạng bài" (Template) chọn số liệu ngẫu nhiên theo hạt giống và **tự tính đáp án bằng code**, nên mỗi lần sinh là một câu mới mà đáp án luôn khớp số liệu.

## Việc cần làm
Viết file `lib/gen/<mã><lớp>hk2.ts` (vd `lib/gen/toan11hk2.ts`) export `const TEMPLATES: Template[]`, giống hệt phong cách các file HK1 đã có (`lib/gen/toan11.ts`, `lib/gen/ly11.ts`, `lib/gen/hoa11.ts` — **đọc kĩ một file cùng môn trước khi viết**, và đọc `lib/gen/core.ts`).

Mỗi template có thêm:
- `hk: 2`
- `half: 1 | 2` — 1 = nội dung nửa đầu HK2 (vào đề giữa kì 2 và cuối kì 2), 2 = nửa sau (chỉ cuối kì 2).
- `tk`: khóa chủ đề trong `data/hk/TOPICS.md` (cùng môn, cùng lớp, HK2), vd `"Toán|Đạo hàm"`. Mỗi template phải có `tk`.
- `chapter`: tên chương đúng SGK KNTT, vd "Chương VI. Hàm số mũ và hàm số logarit".
- `id` duy nhất toàn hệ thống, bắt đầu bằng tiền tố môn-lớp-hk2, vd `t11k2-log-tinh-gia-tri`.

## Số lượng, độ phủ
- Khoảng **36–45 dạng**/ file, phủ đều mọi bài trong các chương HK2 của lớp đó.
- Đủ để dựng đề theo ma trận: Toán cần mỗi nửa học kì ≥ 8 mcq, ≥ 3 tf, ≥ 4 short; Lý/Hóa mỗi nửa ≥ 12 mcq, ≥ 3 tf, ≥ 4 short.
- Mức độ: ~40% level 1, 30% level 2, 30% level 3. Có cả câu lí thuyết (chọn từ bảng mục, đổi cách hỏi) lẫn câu tính toán.
- Mỗi template phải sinh được ≥ 10 biến thể khác nhau.

## Quy tắc
- Dùng helper trong core: `mcq`, `tf`, `short`, `vn`, `tex`, `frac`, `sqrtTex`, `poly`, `term`, `coef`, `need`, `round`, `gcd`, `near`.
- Số đẹp: dùng `need(...)` để loại bộ số xấu. Đáp án trả lời ngắn ≤ 4 ký tự (helper `short`), nói rõ cách làm tròn trong đề.
- Phương án nhiễu phải hợp lí (sai lầm học sinh hay mắc), khác nhau, không lộ đáp án.
- Lời giải tiếng Việt, ngắn, có bước tính chính.
- Số thập phân dấu phẩy; trong công thức `{,}` (dùng `tex()`); ngoài công thức dùng `vn()`.
- Không import gì ngoài `./core.ts`. Import kiểu `from "./core.ts"`.

## Kiểm tra (bắt buộc, lặp tới khi 0 lỗi)
```
cd /home/claude/dgnl-app
node --experimental-strip-types scripts/gen-check.ts lib/gen/<file>.ts 300
npx tsc --noEmit -p .
```
Sau đó tự đọc kĩ 2–3 câu sinh ra của mỗi dạng và giải lại bằng tay/ code để chắc đáp án đúng về mặt kiến thức (không chỉ đúng định dạng).
Không sửa file nào khác ngoài file của bạn (người điều phối sẽ đăng ký vào `lib/gen/index.ts`).
