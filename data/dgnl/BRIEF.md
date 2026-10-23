# Hướng dẫn soạn đề luyện thi đánh giá năng lực (app "Chinh Phục")

Bạn đóng vai chuyên gia luyện thi ĐGNL/ĐGTD ở Việt Nam. Soạn câu hỏi MỚI theo đúng phong cách, độ khó và dạng câu của kỳ thi thật (định dạng từ năm 2025), không chép đề có bản quyền. Đáp án phải chắc chắn đúng.
Cấu trúc từng kỳ thi xem `data/dgnl/exams.json` (số câu mỗi phần). Học sinh dùng app là lớp 12 (phạm vi kiến thức chủ yếu lớp 10–12, chương trình GDPT 2018).

## File
Mỗi phần thi một file: `data/dgnl/src/<kỳ thi>/<bộ>-<phần>.json`
- `<bộ>`: `de1`, `de2` = hai đề thi thử (số câu đúng bằng `n` của phần đó); `luyen` = bộ câu luyện thêm (15–20 câu, không trùng đề).
- Ví dụ: `data/dgnl/src/vact/de1-toan.json`, `data/dgnl/src/tsa/luyen-doc.json`.

```json
{
  "exam": "tsa", "part": "doc", "set": "de1",
  "passages": { "p1": "Toàn văn đoạn đọc (có thể vài đoạn, xuống dòng \\n)…", "p2": "…" },
  "questions": [
    { "qtype": "mcq", "passage": "p1", "topic": "Ý chính của đoạn", "level": 2,
      "stem": "…", "options": ["…","…","…","…"], "answer": 1, "explanation": "…" },
    { "qtype": "tf", "topic": "…", "level": 2, "stem": "Tình huống/ dữ kiện chung…",
      "statements": [ {"t":"…","a":true}, {"t":"…","a":false}, {"t":"…","a":true}, {"t":"…","a":false} ], "explanation": "a) … b) … c) … d) …" },
    { "qtype": "short", "topic": "…", "level": 3, "stem": "… (Điền số, làm tròn …)", "answer_text": "12,5", "explanation": "…" }
  ],
  "self_check": "đã kiểm tra những gì"
}
```
- `passage`: tùy chọn; câu nào dùng chung đoạn văn/ bảng số liệu/ mô tả thí nghiệm thì để trong `passages` và trỏ id; app tự hiện đoạn đó phía trên câu hỏi. Nhóm 3–6 câu cho một đoạn như đề thật.
- `qtype`: `mcq` (4 phương án, `answer` 0–3), `tf` (4 ý, có cả đúng và sai), `short` (điền đáp án là SỐ, tối đa 6 ký tự, dấu phẩy thập phân, ví dụ "-2", "0,75", "1250"). Dạng kéo thả/ ghép cặp/ điền từ của đề thật thì chuyển thành `mcq` tương đương.
- `level` 1/2/3 (khoảng 30/40/30). `topic`: tên mảng kiến thức ngắn gọn (vd "Hàm số", "Suy luận logic", "Đọc hiểu – suy luận", "Từ vựng", "Hóa học – cân bằng").
- Đáp án đúng của mcq rải đều A/B/C/D.

## Viết
- Công thức trong `$...$` LaTeX (`$\\dfrac{1}{2}$`), trong JSON nhân đôi `\`. Số thập phân dấu phẩy, trong công thức `{,}`. Không dùng dấu `$` cho tiền: viết "đồng", "USD".
- Bảng số liệu: viết dạng dòng văn bản rõ ràng (vd "Năm 2020: 12,5; Năm 2021: 13,1"), hoặc bảng gạch đứng | đơn giản mỗi hàng một dòng.
- Đoạn văn đọc hiểu: tự viết (văn bản thông tin, khoa học, xã hội) hoặc dùng tác phẩm văn học đã thuộc phạm vi công cộng (tác giả mất trước 1976), trích đúng nguyên văn bạn chắc chắn. Không bịa số liệu thống kê "thật"; số liệu trong đề là giả định thì nói rõ hoặc dùng bối cảnh hư cấu.
- Tiếng Việt chuẩn, mỗi câu chỉ một đáp án đúng, lời giải ngắn có bước chính.

## Kiểm tra (bắt buộc)
1. Mọi câu tính toán/ logic: kiểm bằng Python. Câu suy luận logic: liệt kê trường hợp bằng code nếu được.
2. Chạy `cd /home/claude/dgnl-app && node scripts/data/dgnl-check.mjs <file…>` tới khi ✓.
3. Dùng thư mục nháp RIÊNG (vd `/tmp/claude-0/-home-claude/10ad57bc-ca32-5fb2-9fd9-56c9a68e3b7e/scratchpad/dgnl_<kỳ thi>_<phần>/`), không đặt file ở gốc scratchpad (nhiều người dùng chung).
4. Chỉ tạo đúng các file được giao.
