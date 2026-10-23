# Hướng dẫn soạn đề ôn giữa kì / cuối kì (app "Chinh Phục")

App ôn thi cho học sinh lớp 10–12 chương trình GDPT 2018, thứ tự bài theo bộ **Kết nối tri thức với cuộc sống (KNTT)**.
Bạn đóng vai giáo viên ra đề có kinh nghiệm. Đề phải **đúng kiến thức, đúng phạm vi học kì, đáp án chắc chắn đúng**.
Không chép đề có bản quyền: tự soạn câu mới theo phong cách đề kiểm tra thật.

## Nơi lưu file
- Học kì 1: `data/hk1/src/<lớp>-<mã môn>-<gk1|ck1>.json`
- Học kì 2: `data/hk2/src/<lớp>-<mã môn>-<gk2|ck2>.json`
- Mã môn: toan, ly, hoa, sinh, tin, cn (Công nghệ), ktpl (GD Kinh tế và Pháp luật), anh, van.
- `subject` phải đúng chuỗi: "Toán", "Vật lí", "Hóa học", "Sinh học", "Tin học", "Công nghệ", "GD Kinh tế và Pháp luật", "Tiếng Anh", "Ngữ văn".

## Cấu trúc đề (theo định dạng mới từ 2025)
| Môn | Phần I trắc nghiệm 4 lựa chọn | Phần II Đúng/Sai | Phần III trả lời ngắn | Thời gian |
| --- | --- | --- | --- | --- |
| Toán | 12 | 4 | 6 | 90 |
| Vật lí, Hóa học, Sinh học | 18 | 4 | 6 | 50 |
| Tin học, Công nghệ, GD Kinh tế và Pháp luật | 24 | 4 | 0 | 45 |
| Tiếng Anh | 40 câu trắc nghiệm | – | – | 60 |

Thứ tự trong mảng `questions`: hết mcq → tf → short. Mức độ toàn đề khoảng 40% nhận biết (level 1), 30% thông hiểu (2), 30% vận dụng (3).
Đáp án đúng của phần I rải đều A/B/C/D (không vị trí nào quá 40%).
- Đề **giữa kì** chỉ dùng chủ đề "phần 1" của học kì đó.
- Đề **cuối kì** dùng cả học kì, khoảng 60% câu thuộc "phần 2".

## Định dạng JSON (trắc nghiệm)
```json
{
  "grade": 11, "subject": "Vật lí", "exam": "gk2", "duration_min": 50,
  "title": "Đề ôn giữa học kì 2 – Vật lí 11",
  "scope": "Chương III Điện trường: …",
  "questions": [
    { "qtype": "mcq", "tk": "Vật lí|Điện trường", "topic": "Định luật Coulomb", "level": 1,
      "stem": "…", "options": ["…","…","…","…"], "answer": 2, "explanation": "…" },
    { "qtype": "tf", "tk": "Vật lí|Điện trường", "topic": "…", "level": 2,
      "stem": "Đoạn dẫn chung (tình huống/ thí nghiệm/ đoạn code…)",
      "statements": [ {"t":"…","a":true}, {"t":"…","a":false}, {"t":"…","a":true}, {"t":"…","a":false} ],
      "explanation": "a) Đúng: … b) Sai: … c) … d) …" },
    { "qtype": "short", "tk": "…", "topic": "…", "level": 3, "stem": "… (làm tròn đến hàng phần mười)", "answer_text": "2,5", "explanation": "…" }
  ],
  "self_check": "Ghi bạn đã kiểm tra lại những gì (đã giải lại từng câu, câu tính toán đã kiểm bằng code…)"
}
```
- `tk` **bắt buộc** (trừ Tiếng Anh, khuyến khích có): đúng một khóa trong `data/hk/TOPICS.md`, cùng môn, cùng lớp, cùng học kì.
- `topic`: tên bài/ mục nhỏ cụ thể (vd "Định luật Coulomb", "Vòng lặp for"). Tiếng Anh dùng nhãn như đề HK1: "Phonetics – Pronunciation", "Unit 6 – Grammar: …", "Reading comprehension (Unit 7: …)".
- `answer_text` của câu trả lời ngắn: chỉ số, tối đa 4 ký tự kể cả dấu "-" và dấu phẩy (vd "12", "-3", "0,25", "1250"). Đề phải nói rõ đơn vị và cách làm tròn.
- Câu Đúng/Sai: 4 ý a–d xoay quanh một tình huống, có cả ý đúng và ý sai; không viết "a)" ở đầu ý.

## Viết công thức và chữ
- Công thức, kí hiệu toán/lý/hóa viết LaTeX trong `$...$`: `$\\dfrac{1}{2}$`, `$x^2$`, `$\\vec{F}$`. Trong JSON phải nhân đôi dấu `\`.
- Số thập phân dùng dấu phẩy: ngoài công thức viết `0,5`; trong công thức `$0{,}5$`. Không dùng dấu chấm thập phân.
- Công thức hóa học có thể viết Unicode (H₂SO₄, Fe³⁺) hoặc `$\\mathrm{H_2SO_4}$`.
- Code Tin học: để trong stem như văn bản thường, xuống dòng bằng `\n`, thụt lề bằng dấu cách; không dùng dấu `$` trong code (dùng `\\$` nếu buộc phải có dấu đô-la).
- Tiếng Việt chuẩn, rõ ràng, không dùng "Chọn đáp án đúng nhất" trừ khi cần; mỗi câu chỉ có một đáp án đúng.

## Ngữ văn (đọc hiểu + viết)
Giống file mẫu `data/hk1/src/10-van-gk1.json`: `genre`, `work` {author, title, source, public_domain_reason}, `passage` (nguyên văn, ≥ 200 ký tự), `src` (dòng nguồn + chú thích từ khó), `questions` (5 câu đọc hiểu, mỗi câu {q, type: nhanbiet|thonghieu|vandung, points[], model}), `essays` (2 câu: đoạn văn ~200 chữ và bài văn ~600 chữ, mỗi câu {q, type:"viet", points[], model}).
Chỉ dùng **tác phẩm có thật đã thuộc phạm vi công cộng** (tác giả mất trước 1976, hoặc văn học dân gian/ văn bản cổ), trích **đúng nguyên văn** mà bạn chắc chắn nhớ chính xác; nếu không chắc từng chữ thì chọn đoạn/ tác phẩm khác bạn nhớ chắc. Thể loại theo bài học SGK KNTT của học kì đó.

## Tự kiểm tra (bắt buộc)
1. Giải lại từng câu độc lập. Câu có tính toán: kiểm bằng Python/ Node. Câu code Tin học: chạy thử đoạn code bằng Python.
2. Chạy: `cd /home/claude/dgnl-app && node scripts/data/hk-check.mjs <file…>` cho tới khi tất cả ✓ (đọc cả dòng "lưu ý").
3. Ghi `self_check` trung thực.
