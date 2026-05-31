# خطة تطبيق إدارة الإيفينتس (Admin / Trainer / Participant)

تطبيق ديسكتوب/تابلت عالمي لإدارة الإيفينتس التدريبية، مبني على React + TypeScript + Supabase، عربي RTL افتراضيًا مع إنجليزي، يغطي الإدارة والترينر والمشارك بثلاثة أدوار وواجهة حديثة responsive وقابلة للتثبيت كـ PWA/Desktop.

> **قرارات محسومة:** عربي RTL افتراضي + تبديل إنجليزي · ديسكتوب/تابلت فقط (PWA + Tauri اختياري) · شهادات PDF مع تحقق QR · بدون دفع أونلاين في هذه المرحلة.

---

## 1. القرار التقني (Tech Stack)

- **الواجهة (Frontend):** React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui + Lucide icons.
- **التصميم:** Responsive (Desktop + Tablet فقط) مع دعم اللمس، RTL عربي افتراضي + i18n إنجليزي (تبديل لغة).
- **التدويل (i18n):** react-i18next + ضبط `dir=rtl/ltr` ديناميكي + خط عربي مناسب (Cairo/Tajawal).
- **الديسكتوب (اختياري):** تغليف بـ **Tauri** لتطبيق ديسكتوب native خفيف (Windows/Mac/Linux)، مع PWA كبديل للتثبيت السريع.
- **الباك إند السحابي:** **Supabase** = PostgreSQL + Auth (RBAC) + Storage (ملفات/شهادات) + Realtime (تحديثات لحظية) + Edge Functions.
- **إدارة الحالة والبيانات:** TanStack Query (server state) + Zustand (UI state) + React Hook Form + Zod.
- **رسوم بيانية وتصدير:** Recharts للوحات + xlsx + jsPDF للتقارير + qrcode/zxing لمسح QR في الـ check-in.

**ليه الاختيار ده:** أحدث وأقوى ecosystem للواجهات، responsive ممتاز للتابلت اللمسي، Supabase يوفّر مصادقة وأدوار ومزامنة سحابية جاهزة بأقل تعقيد، مع إمكانية التوسّع لاحقاً لموبايل.

---

## 2. المعمارية العامة (Architecture)

- **3 واجهات بأدوار (Role-based):** Admin Portal، Trainer Portal، Participant Portal داخل نفس التطبيق مع توجيه حسب الدور.
- **الأمان:** Supabase Auth + Row Level Security (RLS) على كل جدول، الأدوار: `admin` / `trainer` / `participant`.
- **الطبقات:** UI Components → Feature Modules → Data Layer (Supabase client + TanStack Query) → Database (Postgres + RLS).
- **التحديثات اللحظية:** Realtime channels للحضور والإشعارات.
- **التخزين:** Supabase Storage للمواد التدريبية، الشهادات، صور الإيفينتس.

---

## 3. نموذج البيانات (Core Entities)

- **users / profiles:** الدور، الاسم، البريد، الصورة، اللغة.
- **events:** عنوان، وصف، تاريخ بداية/نهاية، الحالة، الغلاف.
- **sessions:** جلسات تابعة للإيفينت (موعد، قاعة، الترينر، السعة).
- **venues / rooms:** القاعات والمواقع.
- **registrations:** ربط participant ↔ event/session + حالة التسجيل.
- **attendance:** check-in/out، طريقة (QR/manual)، الوقت.
- **materials:** مواد تدريبية مرفوعة لكل جلسة/إيفينت.
- **quizzes / questions / submissions:** اختبارات وكويزات ونتائج.
- **surveys / feedback:** استبيانات تقييم للترينر/الإيفينت.
- **certificates:** شهادات حضور/إتمام بصيغة PDF + رمز تحقق فريد (verification code).
- **certificate_verifications:** سجل التحقق العام عبر QR/رابط (هل الشهادة صالحة + بيانات صاحبها).
- **notifications:** إشعارات داخل التطبيق.

---

## 4. الوحدات الوظيفية (Modules)

### أ. جزء الأدمن (Admin)
- لوحة تحكم رئيسية (Dashboard) بإحصائيات الإيفينتس والحضور والأداء.
- إدارة الإيفينتس والجلسات والقاعات + تقويم/Calendar + دعوات.
- إدارة المستخدمين والأدوار (إضافة ترينرز ومشاركين).
- إدارة التسجيلات والموافقات.
- التقارير المتقدمة وتصدير Excel/PDF.

### ب. جزء الترينر (Trainer)
- جدول جلساته القادمة والتقويم.
- إدارة الحضور (check-in عبر QR أو يدوي على التابلت).
- رفع المواد التدريبية وإنشاء الكويزات/الاختبارات.
- مشاهدة فيدباك وتقييمات المشاركين.
- تقارير حضور وأداء جلساته.

### ج. جزء المشارك (Participant)
- تصفّح الإيفينتس والتسجيل فيها.
- جدوله الشخصي والتقويم + إشعارات التذكير.
- الوصول للمواد التدريبية وحل الكويزات.
- تعبئة استبيانات التقييم/الفيدباك.
- تحميل شهادات الحضور/الإتمام.

---

## 5. هيكل المشروع (Folder Structure)

```
00-Events/
├─ src/
│  ├─ app/            # routing + role guards + layouts
│  ├─ features/
│  │  ├─ admin/
│  │  ├─ trainer/
│  │  └─ participant/
│  ├─ components/ui/  # shadcn/ui
│  ├─ lib/            # supabase client, query, utils
│  ├─ hooks/
│  ├─ i18n/           # ar / en (RTL)
│  └─ types/
├─ supabase/          # migrations + RLS policies + seed
├─ public/
└─ src-tauri/         # (اختياري) تغليف الديسكتوب
```

---

## 6. خطة التنفيذ على مراحل (Roadmap)

1. **الإعداد:** Vite + TS + Tailwind + shadcn + Supabase project + i18n/RTL + theme.
2. **المصادقة والأدوار:** Auth + profiles + RLS + توجيه حسب الدور + layouts.
3. **قاعدة البيانات:** جداول الـ entities + migrations + seed بيانات تجريبية.
4. **وحدة الأدمن:** Dashboard + CRUD للإيفينتس/الجلسات/القاعات + Calendar + إدارة المستخدمين.
5. **التسجيل والحضور:** تسجيل المشاركين + check-in عبر QR/يدوي + Realtime.
6. **المحتوى والتقييمات:** رفع المواد + كويزات + استبيانات فيدباك.
7. **وحدة الترينر:** جدول + حضور + مواد + كويزات + فيدباك جلساته.
8. **وحدة المشارك:** تصفّح/تسجيل + جدول + مواد + كويزات + استبيانات + شهادات.
9. **التقارير:** Dashboards + Recharts + تصدير Excel/PDF + شهادات PDF.
10. **التغليف والتلميع:** PWA + (Tauri اختياري) + اختبارات + تحسين الأداء والـ UX.

---

## 7. القرارات المحسومة
- **اللغة:** عربي RTL افتراضيًا مع تبديل للإنجليزي (i18n كامل).
- **المنصة:** ديسكتوب/تابلت فقط — PWA قابل للتثبيت + تغليف Tauri اختياري لاحقًا (بلا موبايل حاليًا).
- **الشهادات:** توليد PDF تلقائي + صفحة/رمز QR للتحقق العام من صحة الشهادة.
- **الدفع:** غير مطلوب في هذه المرحلة (التسجيل مجاني/بموافقة الأدمن).
