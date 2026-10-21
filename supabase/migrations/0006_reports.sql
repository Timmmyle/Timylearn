-- =====================================================================
-- 0006 – Báo đáp án sai: học sinh báo, AI giải lại; nếu sai thật thì lưu đáp án đúng cho mọi người
-- Chạy sau 0001–0005. Chạy lại nhiều lần được.
-- Ghi bảng question_fixes chỉ bằng khóa service_role ở server (route /api/ai), người dùng không ghi trực tiếp được.
-- =====================================================================

create table if not exists public.question_reports (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  qid text not null,
  source text not null default '',          -- bank | hk | remote | gen | ai
  claim jsonb,                               -- đáp án học sinh cho là đúng
  note text not null default '',
  verdict jsonb,                             -- kết quả AI xem xét
  status text not null default 'open' check (status in ('open','fixed','kept','review')),
  created_at timestamptz not null default now()
);
create index if not exists question_reports_qid_idx on public.question_reports (qid);
create index if not exists question_reports_status_idx on public.question_reports (status, created_at desc);

create table if not exists public.question_fixes (
  qid text primary key,
  data jsonb not null,                       -- {a?: chỉ số đáp án, st?: [bool], sa?: "đáp số", e?: "lời giải"}
  reason text not null default '',
  report_id bigint references public.question_reports(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.question_reports enable row level security;
alter table public.question_fixes enable row level security;

drop policy if exists "reports: tự gửi" on public.question_reports;
create policy "reports: tự gửi" on public.question_reports for insert with check (auth.uid() = user_id);
drop policy if exists "reports: tự xem" on public.question_reports;
create policy "reports: tự xem" on public.question_reports for select using (auth.uid() = user_id);
drop policy if exists "fixes: ai cũng xem" on public.question_fixes;
create policy "fixes: ai cũng xem" on public.question_fixes for select using (active);

grant select, insert on public.question_reports to authenticated;
grant usage, select on sequence public.question_reports_id_seq to authenticated;
grant select on public.question_fixes to anon, authenticated;
grant all on public.question_reports, public.question_fixes to service_role;
grant usage, select on sequence public.question_reports_id_seq to service_role;

-- Giáo viên xem các báo cáo cần duyệt (chạy trong SQL Editor):
--   select id, qid, status, claim, note, verdict->>'explanation', created_at from question_reports order by created_at desc limit 50;
-- Hoàn tác một lần sửa:
--   update question_fixes set active = false where qid = '...';
