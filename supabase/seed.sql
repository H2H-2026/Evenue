-- ============================================================
-- Evenue — Seed data (demo)
-- Run AFTER 0001_init.sql, and AFTER creating auth users.
-- NOTE: profiles are created automatically via the on_auth_user_created
-- trigger when users sign up. For demo seed, create users in
-- Authentication > Users, then update their roles below by email.
-- ============================================================

-- Promote demo users by email (adjust emails to your created users)
update public.profiles set role = 'admin',       full_name = 'مدير النظام'   where email = 'admin@evenue.app';
update public.profiles set role = 'trainer',      full_name = 'أحمد المدرّب'  where email = 'trainer@evenue.app';
update public.profiles set role = 'participant',  full_name = 'سارة المشاركة' where email = 'participant@evenue.app';

-- Venues
insert into public.venues (name, city, address, capacity) values
  ('قاعة الأندلس', 'الرياض', 'طريق الملك فهد', 120),
  ('قاعة الفيصلية', 'جدة', 'حي الروضة', 80),
  ('قاعة النخيل', 'الدمام', 'الكورنيش', 50)
on conflict do nothing;

-- Events
insert into public.events (title, description, start_date, end_date, status) values
  ('ورشة القيادة التنفيذية', 'برنامج تدريبي مكثف لتطوير المهارات القيادية', '2026-06-10', '2026-06-12', 'published'),
  ('أساسيات إدارة المشاريع', 'مقدمة عملية لإدارة المشاريع وفق PMI', '2026-06-15', '2026-06-16', 'ongoing'),
  ('التحول الرقمي للمؤسسات', 'استراتيجيات التحول الرقمي والابتكار', '2026-07-01', '2026-07-03', 'draft')
on conflict do nothing;
