# ربط Evenue بـ Supabase

دليل تجهيز قاعدة البيانات وربطها. التطبيق حاليًا يعمل على **تخزين محلي** (zustand + persist)،
وكل شيء جاهز للتحويل إلى Supabase بأقل تعديل.

## 1) إنشاء المشروع
1. أنشئ مشروعًا على [supabase.com](https://supabase.com).
2. من **Project Settings → API** انسخ:
   - `Project URL`
   - `anon public key`
3. أنشئ ملف `.env` في جذر المشروع (انسخ من `.env.example`):
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```

## 2) إنشاء السكيما + RLS
- افتح **SQL Editor** في لوحة تحكم Supabase.
- الصق محتوى `supabase/migrations/0001_init.sql` ثم Run.
- هذا ينشئ: الجداول، الـ enums، الدوال المساعدة (`current_role`, `is_admin`, `is_staff`)،
  trigger إنشاء البروفايل تلقائيًا عند التسجيل، وكل سياسات **RLS**.

## 3) المستخدمون التجريبيون
- من **Authentication → Users → Add user** أنشئ:
  - `admin@evenue.app`
  - `trainer@evenue.app`
  - `participant@evenue.app`
- ثم شغّل `supabase/seed.sql` (يضبط الأدوار + يزرع مقرّات وفعاليات تجريبية).

## 4) ربط الكود (لاحقًا)
- العميل جاهز في `src/lib/supabase.ts` (يقرأ متغيرات البيئة). `isSupabaseConfigured` تتحول إلى `true` تلقائيًا عند ضبط `.env`.
- أنواع الجداول جاهزة في `src/types/database.ts` (أو ولّدها: `npx supabase gen types typescript --project-id <id> > src/types/database.ts`).
- خطوات التحويل لكل وحدة (Events/Sessions/Venues/Users/Registrations...):
  1. استبدل قراءة الـ seed في الـ store بـ `supabase.from('<table>').select()`.
  2. استبدل `add/update/remove` بـ `insert/update/delete` عبر supabase-js.
  3. استخدم **TanStack Query** (مثبّت) لإدارة الجلب/التخزين المؤقت وإعادة التحقق.
- **Auth:** استبدل تسجيل الدخول التجريبي في `src/stores/auth.ts` بـ
  `supabase.auth.signInWithPassword` + جلب البروفايل من جدول `profiles`.

## مخطّط الجداول
`profiles, venues, events, sessions, registrations, attendance, materials, quizzes, feedback, certificates`

كل الجداول عليها **RLS**:
- قراءة عامة للمصادَقين على بيانات المحتوى (events/sessions/venues/materials/quizzes).
- الكتابة للطاقم (`admin`/`trainer`).
- المشارك يرى/ينشئ تسجيلاته وشهاداته وتقييماته الخاصة فقط.
