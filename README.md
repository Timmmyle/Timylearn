# Ôn Thi – Học và Đấu (Next.js + Supabase + Tailwind)

Phiên bản full-stack của `on-thi.html`: ôn thi THPT, đánh giá năng lực (HSA, V-ACT, TSA, SPT) và kiểm tra học kì theo lộ trình cá nhân. Chạy tốt trên máy tính và điện thoại, cài được như app (PWA) và sẵn sàng đóng gói iOS/Android bằng Capacitor.

## Tính năng (giữ nguyên từ bản gốc)

- **Bắt đầu 4 bước**: lớp, kỳ thi, môn, mục tiêu và ngày thi → lộ trình chủ đề + bài kiểm tra đầu vào.
- **Trang chủ**: đếm ngược ngày thi, chuỗi ngày học (có thẻ giữ chuỗi), XP và cấp độ, nhiệm vụ hằng ngày.
- **Học**: lộ trình, sổ lỗi sai (lặp lại ngắt quãng 1 và 3 ngày), luyện theo môn/mức độ, phần yếu nhất, lý thuyết từng chủ đề, luyện trình bày đọc hiểu Ngữ văn (AI chấm hoặc tự chấm).
- **Đấu trường**: 10 câu, 20 giây/câu, 3 bot, điểm xếp hạng Elo, **bảng xếp hạng** (Supabase).
- **Đề thi**: kho đề mẫu có lọc, thi thử có giờ, **tạo đề bằng AI** đúng phạm vi lớp/kỳ thi.
- **Tiện ích**: công thức, bảng tuần hoàn, lượng giác, đổi đơn vị, tính mol, điều chế và sinh học.
- **Tiến độ**: biểu đồ 7/30/365 ngày, ước tính điểm theo môn, bản đồ chủ đề, lịch học 12 tuần.
- **Cài đặt**: hồ sơ học, xuất lịch `.ics` (điện thoại mở bảng chia sẻ), giao diện sáng/tối, 5 màu chủ đạo.

## Công nghệ

| Phần | Dùng |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Giao diện | Tailwind CSS v4 (token màu theo biến CSS, tự đổi sáng/tối) |
| State | Zustand + Immer, lưu `localStorage`, đồng bộ Supabase |
| Database / Auth | Supabase (Postgres + RLS, email/mật khẩu, Google) |
| AI | NavyAI (`https://api.navy/v1`, chuẩn OpenAI) gọi từ API route phía server |
| Mobile | PWA (manifest + service worker), Capacitor 8 cho iOS/Android |
| Font | Be Vietnam Pro, Chakra Petch tự host (@fontsource) — chạy offline |

## Cài đặt nhanh

```bash
npm install
cp .env.example .env.local      # rồi điền khóa Supabase + NavyAI
npm run dev                     # http://localhost:3000
```

App vẫn chạy được khi **chưa** điền `.env.local`: dữ liệu lưu trên máy, tính năng AI và đăng nhập tự ẩn.

### 1. Supabase

1. Tạo project tại supabase.com.
2. Mở **SQL Editor**, dán và chạy lần lượt `supabase/migrations/0001_init.sql`, `0002_question_bank.sql`, `0003_grants.sql`, `0004_new_format.sql` (tạo bảng `profiles`, `user_state`, hàm `leaderboard`, bật RLS).
3. **Project Settings → API**: chép `Project URL` và `anon public key` vào `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. **Authentication → URL Configuration**: thêm domain của bạn (và `http://localhost:3000`) vào Redirect URLs.
5. (Tùy chọn) Đăng nhập Google: nút “Tiếp tục với Google” chỉ hiện khi provider Google đã bật (nếu chưa bật, Supabase báo `Unsupported provider: provider is not enabled`).
   - Google Cloud Console → APIs & Services → Credentials → Create OAuth client ID (Web application). Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`.
   - Supabase → Authentication → Sign In / Providers → Google → bật, dán Client ID và Client Secret → Save.

Dữ liệu học của mỗi người nằm trong `user_state.data` (JSON), chỉ chủ tài khoản đọc/ghi được (RLS). Khi đăng nhập trên thiết bị mới, app giữ bản có `updatedAt` mới hơn.

### 2. NavyAI

Điền `NAVY_API_KEY` (dạng `sk-navy-...`). Đổi model bằng `NAVY_MODEL` (tạo đề, chấm bài) và `NAVY_MODEL_FAST` (giải thích, có stream). Xem các model tài khoản bạn dùng được:

```bash
curl https://api.navy/v1/models -H "Authorization: Bearer $NAVY_API_KEY"
```

Khóa API chỉ nằm ở server. Client gửi tham số (phạm vi, mức độ, câu hỏi…) đến `POST /api/ai`, server tự soạn prompt nên người dùng không gửi được prompt tùy ý. Mặc định phải đăng nhập mới dùng AI (`AI_REQUIRE_AUTH=true`) và mỗi người tối đa `AI_RATE_LIMIT` lượt/10 phút.

### 3. Nạp kho đề thi thật (đề tốt nghiệp THPT 2019–2023 + đề ôn luyện)

Thư mục `data/vnhsge/` đã có sẵn dữ liệu chuyển đổi từ bộ VNHSGE: **175 đề, 7.005 câu trắc nghiệm** (8 môn: Toán, Lý, Hóa, Sinh, Anh, Sử, Địa, GDCD), 4 đề đọc hiểu Ngữ văn, 203 ảnh (bảng biến thiên, đồ thị…). Trong đó có 47 đề thi tốt nghiệp THPT chính thức 2019–2023.

1. Supabase → SQL Editor: chạy `supabase/migrations/0002_question_bank.sql` (tạo bảng `exam_sets`, `questions`, `write_passages`, hàm `random_questions`, bucket ảnh `question-images`).
   Sau đó chạy tiếp `0003_grants.sql` và `0004_new_format.sql` (dạng câu Đúng/Sai, trả lời ngắn của đề từ 2025).
   (Chi tiết 0003:) `supabase/migrations/0003_grants.sql` (cấp quyền bảng; dự án Supabase mới cần file này, nếu thiếu sẽ báo `permission denied for table`).
2. Thêm `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API → service_role) vào `.env.local`. Khóa này chỉ dùng cho script, không bao giờ đưa vào app.
3. Chạy:
   ```bash
   npm run data:upload        # nạp đề, câu hỏi, ảnh (chạy lại nhiều lần được)
   ```
4. Mở app → **Đề thi**: có bộ lọc Đề chính thức / Đề ôn luyện. Mục **Học** có thêm nút “Luyện 15 câu đề thật” cho từng môn, và môn Lịch sử, Địa lí, GDCD xuất hiện nhờ kho đề.

Câu đã mở được lưu trên máy (tối đa 2.500 câu) nên làm lại / ôn lỗi sai được cả khi mất mạng.

**Tự chuyển đổi lại từ nguồn** (khi VNHSGE cập nhật):
```bash
git clone --depth 1 https://github.com/Xdao85/VNHSGE.git ../VNHSGE
npm run data:vnhsge        # → data/vnhsge (xem report.md và review.json)
```
Script tách 4 phương án, bọc công thức vào `$...$` (KaTeX), kiểm tra từng công thức hiển thị được, đối chiếu đáp án với “Chọn X” trong lời giải, bỏ dòng bảng biến thiên chép dạng chữ khi đã có ảnh, nén ảnh PNG → WebP. Câu không đạt được ghi vào `review.json` kèm lý do (92 câu, khoảng 1%).

**Lưu ý về dữ liệu VNHSGE:**
- Là đề theo **chương trình cũ (2006)**. Từ năm 2025 đề tốt nghiệp theo GDPT 2018 có thêm dạng Đúng/Sai và trả lời ngắn, app đã ghi chú “chương trình cũ” trên từng đề.
- Dữ liệu do nhóm nghiên cứu thu thập, có lỗi chính tả do nhận dạng chữ và **một số đáp án sai** (vd: đề Lịch sử số 32 câu 1). Nên cho giáo viên rà soát trước khi dùng chính thức; câu sai có thể sửa trực tiếp trong bảng `questions` trên Supabase.
- Repo VNHSGE không ghi giấy phép. Đề thi của Bộ GD&ĐT là tài liệu công khai, nhưng lời giải là của nhóm tác giả. Nếu dùng thương mại nên liên hệ tác giả (Dao Xuan Quy và cộng sự) và trích dẫn bài báo VNHSGE.

### Đề tốt nghiệp THPT 2025–2026 (chương trình mới GDPT 2018)

Thư mục `data/bgddt/`: **16 đề, 462 câu** đủ 3 dạng (trắc nghiệm, Đúng/Sai, trả lời ngắn), chép từ ảnh đề chính thức (nguồn trang HOCMAI), kèm 48 ảnh hình vẽ/biểu đồ và 2 bài đọc hiểu Ngữ văn.
- 2025: Toán, Vật lí, Hóa học, Sinh học, Lịch sử, Địa lí, Tiếng Anh, Tin học, GD Kinh tế và Pháp luật. 2026: Toán, Vật lí, Hóa học, Sinh học, Lịch sử, Địa lí, Tiếng Anh.
- Đáp án theo bảng đáp án HOCMAI; đề 2026 ghi “đáp án tham khảo”. Sinh học 2026 (mã 0435) không có đáp án đúng mã nên đáp án tự giải, ghi rõ trên tên đề.
- Các điểm cần rà soát (chữ mờ, đáp án nghi sai…) ghi trong `data/bgddt/report.md`.

Nạp (sau khi đã chạy 0004_new_format.sql):
```bash
node scripts/data/upload.mjs --dir data/bgddt
```

Muốn thêm nguồn khác (đề 2024–2025 của Bộ, đề minh họa HSA/V-ACT/TSA…): xuất ra cùng định dạng `exam_sets.json` / `questions.json` như trong `data/vnhsge` rồi chạy `node scripts/data/upload.mjs --dir <thư mục>`.

### Đề ôn giữa kì / cuối kì lớp 10–12 (soạn theo SGK mới)

`data/hk1/src/`: 30 đề học kì 1 (giữa kì 1 + cuối kì 1) cho lớp 10, 11, 12, môn Toán, Vật lí, Hóa học, Tiếng Anh, Ngữ văn. Đề soạn mới theo chương trình GDPT 2018 (sách Kết nối tri thức), cấu trúc như đề kiểm tra hiện nay; mỗi câu có lời giải, đáp án đã được giải lại độc lập.
- Ngữ văn: văn bản đọc hiểu là tác phẩm có thật thuộc phạm vi công cộng (Nguyễn Khuyến, Nguyễn Bỉnh Khiêm, Hàn Mặc Tử, Thạch Lam, Tú Xương, Hồ Chí Minh), 5 câu đọc hiểu + 2 câu viết, luyện trong mục "Luyện trình bày" và chấm bằng AI hoặc tự chấm.
- Không cần Supabase: `npm run data:hk` tạo file tĩnh trong `public/de-hk/`, app tải khi mở đề (dùng được cả trong app điện thoại).
- Thêm đề học kì 2: đặt file cùng định dạng vào `data/hk1/src/` (exam `gk2`/`ck2`) rồi chạy lại `npm run data:hk`.

### Chế độ game: nhân vật, xu, cửa hàng, đua top

Chạy thêm `supabase/migrations/0005_game.sql` trong SQL Editor (chạy lại nhiều lần được).

- **Nhân vật**: cấp nhân vật = cấp học tập (XP). Từ cấp L lên L+1 cần 100 + 100·L XP. Bậc ngoại hình: Tân binh (1), Chiến binh (5), Hiệp sĩ (10), Paladin (15), Huyền thoại (20).
- **Xu** (bảng `heroes`, sổ `coin_ledger`) chỉ thay đổi qua hàm RPC phía server: `earn_coins`, `buy_item`, `use_item`, `equip_item`, `rename_hero`. Người chơi không ghi thẳng vào bảng được.

| Nguồn xu | Số xu | Tối đa mỗi ngày |
|---|---|---|
| Vượt ải, sửa sai lầm | 2 xu/câu đúng (tối đa 20 câu mỗi lượt) | 200 |
| Thử thách (thi thử) | 5 xu mỗi điểm | 150 |
| Quyết đấu | thắng 25, hòa 10, thua 5 | 150 |
| Nhiệm vụ hằng ngày | 20 xu/nhiệm vụ | 80 |
| Lên cấp | 30 + 20 × cấp mới (mỗi cấp một lần) | – |

- **Cửa hàng**: 29 vật phẩm (vũ khí, khiên, mũ, giáp, áo choàng, thú cưng, hào quang, thẻ giữ chuỗi), có yêu cầu cấp. Thêm hoặc sửa giá trong bảng `shop_items`; hình vẽ của vật phẩm nằm trong `components/game/HeroArt.tsx`, vật phẩm mới cần thêm hình ở đó.
- **Đua Top**: `leaderboard_game('level' | 'rating' | 'week')`. Xu tuần tính từ thứ Hai (giờ Việt Nam).

### 4. Deploy

Deploy như một app Next.js bình thường (Vercel, Railway, VPS với `npm run build && npm start`). Nhớ khai báo các biến môi trường ở nơi deploy.

## Điện thoại

**Cài như app (PWA)** — mở trang đã deploy (HTTPS) trên điện thoại → *Thêm vào màn hình chính*. App có icon, chạy toàn màn hình, tôn trọng tai thỏ/safe-area, có thanh tab dưới, nút bấm ≥ 44px, phím tắt A/B/C/D trên máy tính.

**Đóng gói iOS/Android (Capacitor)**

```bash
# .env.local: NEXT_PUBLIC_API_BASE=https://<domain-đã-deploy>  (AI chạy trên server đó)
npm run build:mobile            # build tĩnh vào out/ (tạm cất app/api trong lúc build)
npx cap add android             # lần đầu; iOS: npx cap add ios (cần macOS + Xcode)
npx cap sync
npx cap open android            # mở Android Studio để chạy/ký app
```

Server cần cho phép origin của app trong `ALLOWED_ORIGINS` (mặc định đã có `capacitor://localhost`, `https://localhost`).

## Cấu trúc thư mục

```
app/                  # Route: / (trang chủ), /hoc, /dau, /de-thi, /tien-ich, /tien-do, /cai-dat, /dang-nhap
  api/ai/route.ts     # API AI (NavyAI) – xác thực Supabase, giới hạn tốc độ, CORS
components/
  AppShell.tsx        # Khung: thanh bên (máy tính) / thanh tab dưới (điện thoại), đồng bộ, theme
  Onboarding.tsx, ProfilePickers.tsx, WritePanel.tsx
  screens/            # Home, Learn, Fight, Exams, Tools, Progress, Settings, Account
  session/            # Luyện tập, thi thử, đấu, kết quả, luyện viết
lib/
  data/curriculum.ts  # Chương trình GDPT 2018, kho câu hỏi, công thức, bảng tuần hoàn…
  logic.ts            # Logic thuần: lộ trình, streak, nhiệm vụ, thống kê, sổ lỗi sai, .ics
  store.ts            # Zustand store + đồng bộ Supabase
  remote.ts           # tải kho đề từ Supabase + cache offline
  api.ts, supabase.ts, toast.ts, types.ts
  server/navy.ts      # Client NavyAI (JSON + stream)
  server/prompts.ts   # Prompt soạn ở server
supabase/migrations/  # SQL schema + RLS (0001: tài khoản, tiến độ; 0002: kho đề)
scripts/data/         # chuyển đổi VNHSGE + nạp dữ liệu lên Supabase
data/vnhsge/          # dữ liệu đề đã chuyển đổi, sẵn sàng nạp
data/bgddt/           # đề tốt nghiệp 2025–2026 (CT mới)
public/               # manifest, service worker, icon
capacitor.config.ts, scripts/build-mobile.mjs
```

## Dạng câu hỏi (đề cấu trúc mới từ 2025)

| `qtype` | Dạng | Dữ liệu | Điểm (theo Bộ GD&ĐT) |
|---|---|---|---|
| `mcq` | Phần I – 4 lựa chọn | `options` (4 phần tử), `answer` 0–3 | 0,25/câu |
| `tf` | Phần II – Đúng/Sai | `statements`: `[{"t": "ý a", "a": true}, …]` (4 ý) | 1 ý 0,1 · 2 ý 0,25 · 3 ý 0,5 · 4 ý 1 |
| `short` | Phần III – trả lời ngắn | `answer_text`, vd `"2,5"` (chấp nhận cả `2.5`) | Toán 0,5/câu, môn khác 0,25/câu |

Điểm bài thi = tổng điểm đạt / tổng điểm tối đa × 10. Đề có nhiều phần hiện bảng số câu theo từng phần như phiếu trả lời.

## Ghi chú và bước tiếp theo

- Kho câu hỏi mẫu (129 câu, 81 chủ đề) nằm trong code để app chạy offline; kho đề thật (7.000+ câu) nằm trong Supabase và được cache trên máy khi mở.
- Điểm xếp hạng đang do client tính rồi lưu lên (giống bản gốc), nên người rành kỹ thuật có thể sửa. Nếu bảng xếp hạng quan trọng, nên chuyển phần chấm trận đấu lên server.
- Giới hạn tốc độ AI đang lưu trong bộ nhớ (đủ cho 1 server). Chạy nhiều instance thì đổi sang Redis/Upstash.
- Câu hỏi do AI tạo có thể sai: app luôn gắn nhãn “AI” và nhắc giáo viên duyệt.
