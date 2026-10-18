-- =====================================================================
-- Cấp quyền truy cập bảng cho các vai trò của Supabase Data API.
-- Dự án Supabase mới không còn tự cấp quyền cho bảng tạo bằng SQL,
-- nên thiếu file này sẽ gặp lỗi "permission denied for table ...".
-- Chạy được nhiều lần. RLS vẫn quyết định từng dòng ai được đọc/ghi.
-- =====================================================================

grant usage on schema public to anon, authenticated, service_role;

-- Script nạp dữ liệu (service_role) được toàn quyền
grant all on public.exam_sets, public.questions, public.write_passages to service_role;
grant all on public.profiles, public.user_state to service_role;

-- Kho đề: ai cũng đọc được đề đã công bố (lọc bằng RLS)
grant select on public.exam_sets, public.questions, public.write_passages to anon, authenticated;

-- Tài khoản & tiến độ: chỉ người đã đăng nhập, RLS giới hạn đúng dòng của mình
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.user_state to authenticated;

-- Hàm
grant execute on function public.leaderboard(int) to anon, authenticated, service_role;
grant execute on function public.random_questions(text, int, int) to anon, authenticated, service_role;
grant execute on function public.question_counts() to anon, authenticated, service_role;

-- Ảnh câu hỏi: service_role được ghi vào bucket question-images
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'storage' and table_name = 'objects') then
    execute 'drop policy if exists "question-images: service ghi" on storage.objects';
    execute $p$create policy "question-images: service ghi" on storage.objects for all to service_role
             using (bucket_id = 'question-images') with check (bucket_id = 'question-images')$p$;
  end if;
end $$;
