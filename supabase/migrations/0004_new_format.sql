-- =====================================================================
-- Đề cấu trúc mới (tốt nghiệp THPT từ 2025, GDPT 2018):
--   mcq   = trắc nghiệm 4 lựa chọn (options + answer)
--   tf    = Đúng/Sai, mỗi câu 4 ý (statements: [{"t": "...", "a": true}, ...])
--   short = trả lời ngắn (answer_text, vd "2,5")
-- Chạy sau 0003_grants.sql. Chạy lại được.
-- =====================================================================

alter table public.questions add column if not exists qtype text not null default 'mcq';
alter table public.questions add column if not exists statements jsonb;
alter table public.questions add column if not exists answer_text text;

alter table public.questions alter column options drop not null;
alter table public.questions alter column answer drop not null;
alter table public.questions drop constraint if exists questions_options_check;
alter table public.questions drop constraint if exists questions_answer_check;
alter table public.questions drop constraint if exists questions_qtype_check;
alter table public.questions drop constraint if exists questions_shape_check;

alter table public.questions add constraint questions_qtype_check check (qtype in ('mcq', 'tf', 'short'));
alter table public.questions add constraint questions_shape_check check (
  (qtype = 'mcq' and jsonb_typeof(options) = 'array' and jsonb_array_length(options) = 4 and answer between 0 and 3)
  or (qtype = 'tf' and jsonb_typeof(statements) = 'array' and jsonb_array_length(statements) between 2 and 4)
  or (qtype = 'short' and answer_text is not null and length(trim(answer_text)) > 0)
);

create index if not exists questions_qtype_idx on public.questions (subject, qtype);

-- Cột mới nằm trong bảng đã cấp quyền ở 0003, không cần grant thêm.
