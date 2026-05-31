-- جدول التقييمات / التغذية الراجعة
create table if not exists public.feedback (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid references public.sessions(id) on delete cascade,
  event_id    uuid references public.events(id) on delete cascade,
  participant_id uuid references public.profiles(id) on delete cascade,
  rating      smallint not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz default now()
);

-- RLS
alter table public.feedback enable row level security;

-- الكل يقدر يقرأ
create policy "feedback_read" on public.feedback
  for select using (true);

-- المشارك يقدر يضيف تقييم
create policy "feedback_insert" on public.feedback
  for insert with check (auth.uid() = participant_id);

-- الأدمن يقدر يحذف
create policy "feedback_delete" on public.feedback
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
