# Evenue — منصة الفعاليات والمقرّات

تطبيق ديسكتوب/تابلت لإدارة الفعاليات التدريبية بثلاثة أدوار: **الأدمن**، **المدرّب**، **المشارك**.
الاسم `Evenue` = دمج **Event + Avenue/Venue (المقر)**. راجع `BRAND.md` لدليل الهوية.
عربي RTL افتراضيًا مع دعم الإنجليزي. مبني على React + TypeScript + Vite + TailwindCSS + Supabase.

## المتطلبات
- Node.js 18+ (مجرّب على Node 26)
- npm 9+

## التشغيل
```bash
npm install
npm run dev
```
ثم افتح: http://localhost:5173

## الإعداد البيئي (Supabase)
انسخ `.env.example` إلى `.env` واملأ القيم:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
بدون هذه القيم يعمل التطبيق في **وضع تجريبي** (Demo) لتسجيل الدخول بالأدوار.

## البنية
```
src/
├─ components/        # UI + layout + RoleGuard
│  ├─ layout/         # Sidebar, Topbar, AppLayout
│  └─ ui/             # button, card (نمط shadcn)
├─ pages/
│  ├─ admin/          # لوحة الأدمن
│  ├─ trainer/        # لوحة المدرّب
│  └─ participant/    # لوحة المشارك
├─ stores/            # zustand: auth, theme
├─ lib/               # supabase, utils, mock data
├─ i18n/              # ar / en + ضبط RTL
├─ types/             # نماذج البيانات
└─ router.tsx         # التوجيه + حُرّاس الأدوار
```

## الحالة الحالية (وفق الخطة)
- [x] الإعداد: Vite + TS + Tailwind + i18n/RTL + ثيم فاتح/داكن
- [x] الأدوار والتوجيه: تسجيل دخول تجريبي + RoleGuard + Layouts
- [x] لوحات تحكم أولية للأدوار الثلاثة
- [ ] ربط Supabase (Auth + DB + RLS)
- [ ] وحدات CRUD الكاملة (إيفينتس/جلسات/حضور/مواد/كويزات/تقارير/شهادات)

راجع `events-app-plan.md` للخطة الكاملة وخارطة الطريق.
