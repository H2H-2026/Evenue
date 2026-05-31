-- ============================================================
-- Evenue — Initial schema + Row Level Security
-- Run this in Supabase SQL Editor (or via supabase db push)
-- ============================================================

-- Extensions
create extension if not exists "pgcrypto";

-- ---------- ENUMS ----------
do $$ begin
  create type user_role as enum ('admin', 'trainer', 'participant');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_status as enum ('draft', 'published', 'ongoing', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type registration_status as enum ('pending', 'approved', 'rejected', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type attendance_method as enum ('qr', 'manual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type material_type as enum ('link', 'file', 'video');
exception when duplicate_object then null; end $$;

-- ---------- TABLES ----------

-- Profiles (mirrors auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null,
  role user_role not null default 'participant',
  avatar_url text,
  locale text default 'ar',
  created_at timestamptz not null default now()
);

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  address text,
  capacity int,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_date date not null,
  end_date date not null,
  status event_status not null default 'draft',
  cover_url text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  trainer_id uuid references public.profiles (id) on delete set null,
  venue_id uuid references public.venues (id) on delete set null,
  capacity int,
  created_at timestamptz not null default now()
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  participant_id uuid not null references public.profiles (id) on delete cascade,
  status registration_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (event_id, participant_id)
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  participant_id uuid not null references public.profiles (id) on delete cascade,
  method attendance_method not null default 'manual',
  checked_in_at timestamptz not null default now(),
  checked_out_at timestamptz,
  unique (session_id, participant_id)
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  session_id uuid references public.sessions (id) on delete set null,
  title text not null,
  type material_type not null default 'link',
  url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  title text not null,
  description text,
  questions_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  session_id uuid references public.sessions (id) on delete set null,
  participant_id uuid not null references public.profiles (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  code text not null unique,
  issued_at timestamptz not null default now()
);

-- ---------- HELPERS ----------
-- Current user's role (security definer to avoid RLS recursion)
create or replace function public.current_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean language sql stable as $$
  select public.current_role() = 'admin';
$$;

create or replace function public.is_staff()
returns boolean language sql stable as $$
  select public.current_role() in ('admin', 'trainer');
$$;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'participant')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles      enable row level security;
alter table public.venues        enable row level security;
alter table public.events         enable row level security;
alter table public.sessions       enable row level security;
alter table public.registrations  enable row level security;
alter table public.attendance     enable row level security;
alter table public.materials      enable row level security;
alter table public.quizzes        enable row level security;
alter table public.feedback       enable row level security;
alter table public.certificates   enable row level security;

-- PROFILES
create policy "profiles_select_all" on public.profiles
  for select using (auth.role() = 'authenticated');
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- VENUES / EVENTS / SESSIONS / MATERIALS / QUIZZES: read for all, write for staff
do $$
declare tbl text;
begin
  foreach tbl in array array['venues','events','sessions','materials','quizzes']
  loop
    execute format('create policy "%1$s_read" on public.%1$s for select using (auth.role() = ''authenticated'');', tbl);
    execute format('create policy "%1$s_staff_write" on public.%1$s for all using (public.is_staff()) with check (public.is_staff());', tbl);
  end loop;
end $$;

-- REGISTRATIONS
create policy "registrations_select" on public.registrations
  for select using (participant_id = auth.uid() or public.is_staff());
create policy "registrations_insert_own" on public.registrations
  for insert with check (participant_id = auth.uid() or public.is_staff());
create policy "registrations_staff_update" on public.registrations
  for update using (public.is_staff());
create policy "registrations_delete" on public.registrations
  for delete using (participant_id = auth.uid() or public.is_admin());

-- ATTENDANCE
create policy "attendance_select" on public.attendance
  for select using (participant_id = auth.uid() or public.is_staff());
create policy "attendance_staff_write" on public.attendance
  for all using (public.is_staff()) with check (public.is_staff());

-- FEEDBACK
create policy "feedback_insert_own" on public.feedback
  for insert with check (participant_id = auth.uid());
create policy "feedback_select" on public.feedback
  for select using (participant_id = auth.uid() or public.is_staff());

-- CERTIFICATES
create policy "certificates_select" on public.certificates
  for select using (participant_id = auth.uid() or public.is_staff());
create policy "certificates_staff_write" on public.certificates
  for all using (public.is_staff()) with check (public.is_staff());
