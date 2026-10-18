-- =====================================================================
-- Kho đề và câu hỏi dùng chung (đề tốt nghiệp THPT, ĐGNL, đề học kì…)
-- Chạy sau 0001_init.sql. Dữ liệu được nạp bằng: node scripts/data/upload.mjs
-- =====================================================================

-- ---------- Đề thi ----------
create table if not exists public.exam_sets (
  id text primary key,                       -- vd: vnhsge-math-2023
  source text not null,                      -- nguồn: VNHSGE, BGDDT, HSA…
  kind text not null default 'practice'      -- official: đề chính thức | practice: đề ôn luyện | mock: thi thử
    check (kind in ('official', 'practice', 'mock')),
  exam text not null default 'thpt',         -- thpt | hsa | vact | tsa | spt | gk1 | ck1 | gk2 | ck2
  year int,
  subject text not null,                     -- Toán, Vật lí, Hóa học, Sinh học, Tiếng Anh, Lịch sử, Địa lí, GDCD, Ngữ văn…
  code text,                                 -- mã đề
  title text not null,
  grade int not null default 12,
  curriculum text,                           -- 2006 (chương trình cũ) | 2018 (GDPT 2018)
  question_count int not null default 0,
  duration_min int,
  published boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists exam_sets_list_idx on public.exam_sets (published, exam, subject, year desc);

-- ---------- Câu hỏi trắc nghiệm ----------
create table if not exists public.questions (
  id text primary key,
  set_id text references public.exam_sets(id) on delete cascade,
  ord int not null default 0,                -- thứ tự trong đề
  subject text not null,
  topic text,
  level smallint not null default 2 check (level between 1 and 3),
  stem text not null,                        -- đề bài; công thức đặt trong $...$ (KaTeX)
  options jsonb not null check (jsonb_typeof(options) = 'array' and jsonb_array_length(options) = 4),
  answer smallint not null check (answer between 0 and 3),
  explanation text,
  image_q text,                              -- đường dẫn ảnh trong bucket question-images
  image_a text,
  source_ref text,
  flags text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists questions_set_idx on public.questions (set_id, ord);
create index if not exists questions_subject_idx on public.questions (subject, level);

-- ---------- Đọc hiểu Ngữ văn (Luyện trình bày) ----------
create table if not exists public.write_passages (
  id text primary key,
  source text not null,
  year int,
  title text not null,
  passage text not null,
  src text,
  questions jsonb not null,                  -- [{q, type, points[], model}]
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Quyền: ai cũng đọc được đề đã công bố; chỉ service role (script nạp dữ liệu) được ghi ----------
alter table public.exam_sets enable row level security;
alter table public.questions enable row level security;
alter table public.write_passages enable row level security;

drop policy if exists "exam_sets: đọc đề đã công bố" on public.exam_sets;
create policy "exam_sets: đọc đề đã công bố" on public.exam_sets for select using (published);

drop policy if exists "questions: đọc câu của đề đã công bố" on public.questions;
create policy "questions: đọc câu của đề đã công bố" on public.questions for select
  using (set_id is null or exists (select 1 from public.exam_sets s where s.id = set_id and s.published));

drop policy if exists "write_passages: đọc bài đã công bố" on public.write_passages;
create policy "write_passages: đọc bài đã công bố" on public.write_passages for select using (published);

grant select on public.exam_sets, public.questions, public.write_passages to anon, authenticated;

-- ---------- Lấy ngẫu nhiên câu hỏi theo môn (luyện tập từ đề thật) ----------
create or replace function public.random_questions(subj text, n int default 15, lvl int default null)
returns setof public.questions
language sql volatile security invoker set search_path = public as $$
  select q.* from public.questions q
  join public.exam_sets s on s.id = q.set_id and s.published
  where q.subject = subj and (lvl is null or q.level = lvl)
  order by random()
  limit least(greatest(n, 1), 50);
$$;
grant execute on function public.random_questions(text, int, int) to anon, authenticated;

-- Số câu theo môn (để app biết môn nào có đề thật)
create or replace function public.question_counts()
returns table (subject text, total bigint)
language sql stable security invoker set search_path = public as $$
  select q.subject, count(*) from public.questions q
  join public.exam_sets s on s.id = q.set_id and s.published
  group by q.subject;
$$;
grant execute on function public.question_counts() to anon, authenticated;

-- ---------- Bucket ảnh câu hỏi (công khai để đọc) ----------
do $$
begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public) values ('question-images', 'question-images', true)
    on conflict (id) do update set public = true;
  end if;
end $$;
