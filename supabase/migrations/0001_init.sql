-- =====================================================================
-- Ôn Thi – Học và Đấu: schema Supabase
-- Chạy trong Supabase Dashboard → SQL Editor (hoặc `supabase db push`)
-- =====================================================================

-- ---------- Hồ sơ người dùng ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Học sinh',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: tự đọc" on public.profiles;
create policy "profiles: tự đọc" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles: tự sửa" on public.profiles;
create policy "profiles: tự sửa" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Tự tạo profile khi có tài khoản mới
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), nullif(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Trạng thái học tập (toàn bộ tiến độ dạng JSON, đồng bộ giữa các thiết bị) ----------
create table if not exists public.user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  -- Cột sinh tự động để xếp hạng / thống kê nhanh
  rating int generated always as (coalesce((data->'fight'->>'rating')::int, 1000)) stored,
  wins int generated always as (coalesce((data->'fight'->>'w')::int, 0)) stored,
  xp int generated always as (coalesce((data->>'xp')::int, 0)) stored
);

create index if not exists user_state_rating_idx on public.user_state (rating desc);

alter table public.user_state enable row level security;

drop policy if exists "user_state: tự đọc" on public.user_state;
create policy "user_state: tự đọc" on public.user_state for select using (auth.uid() = user_id);
drop policy if exists "user_state: tự thêm" on public.user_state;
create policy "user_state: tự thêm" on public.user_state for insert with check (auth.uid() = user_id);
drop policy if exists "user_state: tự sửa" on public.user_state;
create policy "user_state: tự sửa" on public.user_state for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "user_state: tự xóa" on public.user_state;
create policy "user_state: tự xóa" on public.user_state for delete using (auth.uid() = user_id);

-- ---------- Bảng xếp hạng đấu trường (chỉ lộ tên hiển thị + điểm, không lộ dữ liệu học) ----------
create or replace function public.leaderboard(lim int default 10)
returns table (display_name text, rating int, wins int, is_me boolean)
language sql stable security definer set search_path = public as $$
  select coalesce(p.display_name, 'Học sinh'), s.rating, s.wins, s.user_id = auth.uid()
  from public.user_state s
  left join public.profiles p on p.id = s.user_id
  where coalesce((s.data->'fight'->>'w')::int, 0) + coalesce((s.data->'fight'->>'l')::int, 0) + coalesce((s.data->'fight'->>'d')::int, 0) > 0
  order by s.rating desc, s.wins desc
  limit least(greatest(lim, 1), 100);
$$;

grant execute on function public.leaderboard(int) to anon, authenticated;
