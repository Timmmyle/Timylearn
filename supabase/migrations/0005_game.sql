-- =====================================================================
-- 0005 – Chế độ game: nhân vật, xu, cửa hàng, bảng xếp hạng
-- Chạy sau 0001–0004 trong Supabase → SQL Editor. Chạy lại nhiều lần được.
--
-- Xu và đồ chỉ thay đổi qua các hàm SECURITY DEFINER bên dưới:
-- người chơi đọc được dữ liệu của mình nhưng không ghi thẳng vào bảng,
-- mỗi nguồn xu có trần theo ngày và mỗi phần thưởng chỉ nhận một lần (ref duy nhất).
-- =====================================================================

-- ---------- Danh mục vật phẩm ----------
create table if not exists public.shop_items (
  id text primary key,
  name text not null,
  slot text not null check (slot in ('weapon','shield','helmet','armor','cape','pet','aura','consumable')),
  price int not null check (price >= 0),
  min_level int not null default 1,
  rarity text not null default 'thuong' check (rarity in ('thuong','hiem','suthi','huyenthoai')),
  description text not null default '',
  sort int not null default 0,
  active boolean not null default true
);

-- ---------- Nhân vật + ví xu ----------
create table if not exists public.heroes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Hiệp sĩ',
  coins int not null default 0 check (coins >= 0),
  equip jsonb not null default '{}'::jsonb,
  claimed_level int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null references public.shop_items(id) on delete cascade,
  qty int not null default 1,
  acquired_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

create table if not exists public.coin_ledger (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  ref text not null,
  amount int not null,
  day date not null default (now() at time zone 'Asia/Ho_Chi_Minh')::date,
  created_at timestamptz not null default now(),
  unique (user_id, kind, ref)
);
create index if not exists coin_ledger_user_day_idx on public.coin_ledger (user_id, day);
create index if not exists coin_ledger_day_idx on public.coin_ledger (day);

alter table public.shop_items enable row level security;
alter table public.heroes enable row level security;
alter table public.inventory enable row level security;
alter table public.coin_ledger enable row level security;

drop policy if exists "shop_items: ai cũng xem" on public.shop_items;
create policy "shop_items: ai cũng xem" on public.shop_items for select using (active);
drop policy if exists "heroes: tự xem" on public.heroes;
create policy "heroes: tự xem" on public.heroes for select using (auth.uid() = user_id);
drop policy if exists "inventory: tự xem" on public.inventory;
create policy "inventory: tự xem" on public.inventory for select using (auth.uid() = user_id);
drop policy if exists "coin_ledger: tự xem" on public.coin_ledger;
create policy "coin_ledger: tự xem" on public.coin_ledger for select using (auth.uid() = user_id);
-- Không có policy insert/update/delete: chỉ các hàm bên dưới được ghi.

grant select on public.shop_items to anon, authenticated;
grant select on public.heroes, public.inventory, public.coin_ledger to authenticated;
grant all on public.shop_items, public.heroes, public.inventory, public.coin_ledger to service_role;
grant usage, select on sequence public.coin_ledger_id_seq to service_role;

-- ---------- Cấp độ: từ cấp L lên L+1 cần 100 + 100·L XP (cấp 2 ở 200 XP, cấp 5 ở 1.400, cấp 10 ở 5.400) ----------
create or replace function public.hero_level(p_xp int)
returns int language plpgsql immutable as $$
declare n int := 1; need int;
begin
  loop
    need := 50 * (n + 1) * n + 100 * n;   -- tổng XP để đạt cấp n+1
    exit when coalesce(p_xp, 0) < need or n >= 200;
    n := n + 1;
  end loop;
  return n;
end $$;

create or replace function public._hero_row()
returns public.heroes language plpgsql security definer set search_path = public as $$
declare h public.heroes; uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Cần đăng nhập' using errcode = '28000'; end if;
  insert into public.heroes (user_id, name)
  values (uid, coalesce((select left(display_name, 24) from public.profiles where id = uid), 'Hiệp sĩ'))
  on conflict (user_id) do nothing;
  select * into h from public.heroes where user_id = uid;
  return h;
end $$;
revoke all on function public._hero_row() from public, anon, authenticated;

create or replace function public._my_xp()
returns int language sql stable security definer set search_path = public as $$
  select coalesce((select xp from public.user_state where user_id = auth.uid()), 0);
$$;
revoke all on function public._my_xp() from public, anon, authenticated;

-- ---------- Đọc trạng thái game ----------
create or replace function public.game_state()
returns jsonb language plpgsql security definer set search_path = public as $$
declare h public.heroes; uid uuid := auth.uid(); today date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
begin
  h := public._hero_row();
  return jsonb_build_object(
    'name', h.name, 'coins', h.coins, 'equip', h.equip, 'claimed_level', h.claimed_level,
    'xp', public._my_xp(), 'level', public.hero_level(public._my_xp()),
    'inventory', coalesce((select jsonb_object_agg(item_id, qty) from public.inventory where user_id = uid), '{}'::jsonb),
    'today', coalesce((select jsonb_object_agg(kind, s) from (select kind, sum(amount) s from public.coin_ledger where user_id = uid and day = today and amount > 0 group by kind) t), '{}'::jsonb)
  );
end $$;

-- ---------- Nhận xu ----------
-- practice: n = số câu đúng (tối đa 20 câu tính xu) → 2 xu/câu, trần 200 xu/ngày
-- exam:     n = điểm × 10 (0–100) → n/2 xu, trần 150 xu/ngày
-- fight:    n = 2 thắng / 1 hòa / 0 thua → 25 / 10 / 5 xu, trần 150 xu/ngày
-- mission:  ref = 'YYYY-MM-DD:<id nhiệm vụ>' của hôm nay → 20 xu, trần 80 xu/ngày
-- level:    ref = cấp vừa đạt (≤ cấp tính từ XP đã đồng bộ) → 30 + 20 × cấp
create or replace function public.earn_coins(p_kind text, p_ref text, p_n int default 0)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid(); h public.heroes; today date := (now() at time zone 'Asia/Ho_Chi_Minh')::date;
  amount int := 0; cap int := null; used int; granted int; lv int; ins int;
begin
  h := public._hero_row();
  p_ref := left(coalesce(p_ref, ''), 80);
  if p_ref = '' then raise exception 'Thiếu mã phần thưởng'; end if;
  if p_kind = 'practice' then amount := least(greatest(coalesce(p_n, 0), 0), 20) * 2; cap := 200;
  elsif p_kind = 'exam' then amount := least(greatest(coalesce(p_n, 0), 0), 100) / 2; cap := 150;
  elsif p_kind = 'fight' then amount := case coalesce(p_n, 0) when 2 then 25 when 1 then 10 else 5 end; cap := 150;
  elsif p_kind = 'mission' then
    if split_part(p_ref, ':', 1) <> to_char(today, 'YYYY-MM-DD') or split_part(p_ref, ':', 2) not in ('practice','fight','review','answers') then
      return jsonb_build_object('granted', 0, 'coins', h.coins, 'reason', 'invalid');
    end if;
    amount := 20; cap := 80;
  elsif p_kind = 'level' then
    lv := nullif(regexp_replace(p_ref, '\D', '', 'g'), '')::int;
    if lv is null or lv < 2 or lv > public.hero_level(public._my_xp()) then
      return jsonb_build_object('granted', 0, 'coins', h.coins, 'reason', 'level');
    end if;
    p_ref := lv::text; amount := 30 + 20 * lv;
  else
    raise exception 'Loại phần thưởng không hợp lệ: %', p_kind;
  end if;

  if cap is not null then
    select coalesce(sum(l.amount), 0) into used from public.coin_ledger l where l.user_id = uid and l.kind = p_kind and l.day = today and l.amount > 0;
    granted := greatest(0, least(amount, cap - used));
  else
    granted := amount;
  end if;

  insert into public.coin_ledger (user_id, kind, ref, amount) values (uid, p_kind, p_ref, granted)
  on conflict (user_id, kind, ref) do nothing;
  get diagnostics ins = row_count;
  if ins = 0 then return jsonb_build_object('granted', 0, 'coins', h.coins, 'reason', 'claimed'); end if;

  update public.heroes set coins = coins + granted, updated_at = now(),
    claimed_level = case when p_kind = 'level' then greatest(claimed_level, lv) else claimed_level end
  where user_id = uid returning * into h;
  return jsonb_build_object('granted', granted, 'coins', h.coins, 'reason', case when granted < amount then 'cap' else 'ok' end);
end $$;

-- ---------- Mua đồ ----------
create or replace function public.buy_item(p_item text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); h public.heroes; it public.shop_items; lv int;
begin
  h := public._hero_row();
  select * into it from public.shop_items where id = p_item and active;
  if not found then raise exception 'Không có vật phẩm này'; end if;
  lv := public.hero_level(public._my_xp());
  if lv < it.min_level then raise exception 'Cần đạt cấp % để mua', it.min_level; end if;
  if it.slot <> 'consumable' and exists (select 1 from public.inventory where user_id = uid and item_id = it.id) then
    raise exception 'Bạn đã có vật phẩm này';
  end if;
  if it.slot = 'consumable' and coalesce((select qty from public.inventory where user_id = uid and item_id = it.id), 0) >= 3 then
    raise exception 'Chỉ giữ tối đa 3 vật phẩm này';
  end if;
  update public.heroes set coins = coins - it.price, updated_at = now() where user_id = uid and coins >= it.price returning * into h;
  if not found then raise exception 'Không đủ xu'; end if;
  insert into public.inventory (user_id, item_id, qty) values (uid, it.id, 1)
  on conflict (user_id, item_id) do update set qty = inventory.qty + 1;
  insert into public.coin_ledger (user_id, kind, ref, amount) values (uid, 'buy', it.id || ':' || extract(epoch from clock_timestamp())::text, -it.price);
  -- Mua trang bị thì mặc luôn
  if it.slot <> 'consumable' then
    update public.heroes set equip = equip || jsonb_build_object(it.slot, it.id) where user_id = uid returning * into h;
  end if;
  return jsonb_build_object('coins', h.coins, 'equip', h.equip, 'item', it.id);
end $$;

-- Dùng vật phẩm tiêu hao (vd thẻ giữ chuỗi): trừ 1 trong túi đồ
create or replace function public.use_item(p_item text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); q int;
begin
  perform public._hero_row();
  update public.inventory set qty = qty - 1 where user_id = uid and item_id = p_item and qty > 0
    and exists (select 1 from public.shop_items s where s.id = p_item and s.slot = 'consumable')
  returning qty into q;
  if not found then raise exception 'Không còn vật phẩm này'; end if;
  if q = 0 then delete from public.inventory where user_id = uid and item_id = p_item; end if;
  return jsonb_build_object('item', p_item, 'left', q);
end $$;

-- ---------- Mặc / tháo đồ ----------
create or replace function public.equip_item(p_slot text, p_item text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); h public.heroes;
begin
  h := public._hero_row();
  if p_slot not in ('weapon','shield','helmet','armor','cape','pet','aura') then raise exception 'Ô trang bị không hợp lệ'; end if;
  if p_item is null then
    update public.heroes set equip = equip - p_slot, updated_at = now() where user_id = uid returning * into h;
  else
    if not exists (select 1 from public.inventory i join public.shop_items s on s.id = i.item_id
                   where i.user_id = uid and i.item_id = p_item and s.slot = p_slot) then
      raise exception 'Bạn chưa có vật phẩm này';
    end if;
    update public.heroes set equip = equip || jsonb_build_object(p_slot, p_item), updated_at = now() where user_id = uid returning * into h;
  end if;
  return jsonb_build_object('equip', h.equip);
end $$;

create or replace function public.rename_hero(p_name text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); n text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
begin
  perform public._hero_row();
  if char_length(n) < 2 or char_length(n) > 24 then raise exception 'Tên nhân vật cần 2–24 ký tự'; end if;
  update public.heroes set name = n, updated_at = now() where user_id = uid;
  return jsonb_build_object('name', n);
end $$;

-- ---------- Bảng xếp hạng ----------
-- p_kind: 'level' (XP), 'rating' (điểm đấu), 'week' (xu kiếm được từ thứ Hai tuần này)
create or replace function public.leaderboard_game(p_kind text default 'level', lim int default 20)
returns table (rank int, display_name text, hero_name text, equip jsonb, level int, value int, is_me boolean)
language sql stable security definer set search_path = public as $$
  with week_start as (
    select date_trunc('week', now() at time zone 'Asia/Ho_Chi_Minh')::date d
  ), base as (
    select u.id uid,
      coalesce(p.display_name, 'Học sinh') dn,
      coalesce(h.name, coalesce(p.display_name, 'Hiệp sĩ')) hn,
      coalesce(h.equip, '{}'::jsonb) eq,
      coalesce(s.xp, 0) xp,
      coalesce(s.rating, 1000) rating,
      coalesce(s.wins, 0) + coalesce((s.data->'fight'->>'l')::int, 0) + coalesce((s.data->'fight'->>'d')::int, 0) games,
      coalesce((select sum(l.amount) from public.coin_ledger l, week_start w where l.user_id = u.id and l.amount > 0 and l.day >= w.d), 0)::int week
    from auth.users u
    left join public.profiles p on p.id = u.id
    left join public.user_state s on s.user_id = u.id
    left join public.heroes h on h.user_id = u.id
  ), scored as (
    select *, case p_kind when 'rating' then rating when 'week' then week else xp end v from base
    where case p_kind when 'rating' then games > 0 when 'week' then week > 0 else xp > 0 end
  )
  select (row_number() over (order by v desc, xp desc))::int, dn, hn, eq, public.hero_level(xp), v::int, uid = auth.uid()
  from scored order by v desc, xp desc
  limit least(greatest(lim, 1), 100);
$$;

grant execute on function public.hero_level(int) to anon, authenticated;
grant execute on function public.game_state(), public.earn_coins(text, text, int), public.buy_item(text),
  public.use_item(text), public.equip_item(text, text), public.rename_hero(text) to authenticated;
grant execute on function public.leaderboard_game(text, int) to anon, authenticated;

-- ---------- Vật phẩm ----------
insert into public.shop_items (id, name, slot, price, min_level, rarity, description, sort) values
  ('kiem-sat',        'Kiếm sắt',               'weapon',  120,  1, 'thuong',     'Thanh kiếm đầu tiên của mọi hiệp sĩ.', 10),
  ('truong-kiem',     'Trường kiếm',            'weapon',  400,  5, 'hiem',       'Lưỡi dài, chém gọn mọi câu hỏi khó.', 11),
  ('riu-chien',       'Rìu chiến',              'weapon',  650,  6, 'hiem',       'Nặng tay, phá tan sổ lỗi sai.', 12),
  ('gay-phep',        'Gậy phép tri thức',      'weapon',  900,  8, 'suthi',      'Viên ngọc phát sáng mỗi lần bạn trả lời đúng.', 13),
  ('kiem-lua',        'Kiếm lửa',               'weapon', 1800, 12, 'suthi',      'Rèn từ những chuỗi ngày học không nghỉ.', 14),
  ('thanh-kiem',      'Thánh kiếm',             'weapon', 3500, 20, 'huyenthoai', 'Chỉ dành cho người đã vượt qua mọi thử thách.', 15),
  ('khien-go',        'Khiên gỗ',               'shield',  100,  1, 'thuong',     'Đỡ được vài câu hỏi bẫy.', 20),
  ('khien-sat',       'Khiên sắt',              'shield',  350,  4, 'hiem',       'Chắc chắn, đáng tin trước giờ thi.', 21),
  ('khien-rong',      'Khiên vảy rồng',         'shield', 1500, 12, 'suthi',      'Làm từ vảy của con rồng tên Đạo Hàm.', 22),
  ('khien-vang',      'Khiên hoàng kim',        'shield', 3000, 18, 'huyenthoai', 'Phản chiếu ánh sáng của điểm 10.', 23),
  ('mu-vai',          'Mũ vải',                 'helmet',   80,  1, 'thuong',     'Giữ ấm đầu óc khi học khuya.', 30),
  ('mu-sat',          'Mũ sắt',                 'helmet',  300,  4, 'hiem',       'Không câu hỏi nào làm bạn choáng.', 31),
  ('mu-hiep-si',      'Mũ hiệp sĩ',             'helmet',  800,  8, 'suthi',      'Có chùm lông đỏ của đội cận vệ.', 32),
  ('mu-sung',         'Mũ sừng',                'helmet', 1200, 10, 'suthi',      'Dũng mãnh như chiến binh phương Bắc.', 33),
  ('vuong-mien',      'Vương miện học giả',     'helmet', 4000, 22, 'huyenthoai', 'Dành cho bậc thầy của mọi môn học.', 34),
  ('ao-da',           'Áo da',                  'armor',   150,  2, 'thuong',     'Nhẹ và linh hoạt.', 40),
  ('giap-xich',       'Giáp xích',              'armor',   500,  5, 'hiem',       'Từng mắt xích là một bài đã học.', 41),
  ('giap-tam',        'Giáp tấm',               'armor',  1200, 10, 'suthi',      'Áo giáp của hiệp sĩ thực thụ.', 42),
  ('giap-vang',       'Giáp hoàng kim',         'armor',  3200, 18, 'huyenthoai', 'Lấp lánh như bảng vàng thành tích.', 43),
  ('ao-choang-do',    'Áo choàng đỏ',           'cape',    250,  3, 'thuong',     'Bay phấp phới khi bạn thắng trận.', 50),
  ('ao-choang-xanh',  'Áo choàng xanh',         'cape',    250,  3, 'thuong',     'Màu của sự bình tĩnh trong phòng thi.', 51),
  ('ao-choang-hoang-gia','Áo choàng hoàng gia', 'cape',   1600, 14, 'suthi',      'Viền vàng, dành cho nhà vô địch.', 52),
  ('meo-mun',         'Mèo mun',                'pet',     600,  5, 'hiem',       'Ngồi cạnh bạn suốt những đêm ôn bài.', 60),
  ('cu-tri-thuc',     'Cú tri thức',            'pet',     900,  7, 'suthi',      'Biết hết công thức nhưng chỉ nhắc khi cần.', 61),
  ('rong-con',        'Rồng con',               'pet',    2500, 15, 'huyenthoai', 'Một ngày nào đó sẽ lớn, giống như bạn.', 62),
  ('hao-quang-xanh',  'Hào quang xanh',         'aura',    700,  6, 'hiem',       'Tỏa sáng khi bạn tập trung.', 70),
  ('hao-quang-vang',  'Hào quang vàng',         'aura',   2000, 15, 'suthi',      'Ánh vàng của người đứng đầu.', 71),
  ('hao-quang-cau-vong','Hào quang cầu vồng',   'aura',   5000, 25, 'huyenthoai', 'Hiếm như điểm 10 tuyệt đối.', 72),
  ('the-giu-chuoi',   'Thẻ giữ chuỗi',          'consumable', 150, 1, 'thuong',   'Giữ chuỗi ngày học khi lỡ nghỉ một ngày. Giữ tối đa 3 thẻ.', 90)
on conflict (id) do update set name = excluded.name, slot = excluded.slot, price = excluded.price, min_level = excluded.min_level,
  rarity = excluded.rarity, description = excluded.description, sort = excluded.sort, active = true;
