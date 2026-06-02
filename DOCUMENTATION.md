# Evenue - Events Management Platform

## فكرة المشروع

Evenue هو منصة متكاملة لإدارة الفعاليات والتدريب والتقييم. المنصة مصممة لتخدم:
- **الأدمن**: إدارة كاملة للمنصة
- **المدربين**: إدارة الجلسات والمحتوى والحضور
- **المشاركين**: التسجيل في الفعاليات وعرض المحتوى والشهادات

## الوضع الحالي (Current Status)

### ✅ المكتمل

#### 1. نظام المصادقة (Authentication)
- تسجيل دخول بـ 3 أدوار (Admin, Trainer, Participant)
- دعم Supabase Auth مع fallback للـ Demo Mode
- localStorage persistence للـ session

#### 2. إدارة الفعاليات (Events Management)
- CRUD كامل للفعاليات
- حالات: Draft, Published, Ongoing, Completed, Cancelled
- تخزين hybrid (Supabase + localStorage fallback)

#### 3. إدارة المستخدمين (Users Management)
- CRUD للـ profiles
- أدوار: admin, trainer, participant
- localStorage fallback

#### 4. إدارة الأماكن (Venues Management)
- CRUD للقاعات
- سعة القاعة، المدينة، العنوان

#### 5. إدارة الجلسات (Sessions Management)
- ربط الجلسات بالفعاليات
- تحديد المدرب والقاعة
- timeslots

#### 6. التسجيلات (Registrations) - 🚧 WIP
- نظام الموافقة/الرفض
- حالات: pending, approved, rejected, cancelled

#### 7. الحضور (Attendance)
- تسجيل دخول/خروج بالـ QR
- Manual check-in للمدربين

#### 8. المواد التعليمية (Materials)
- رفع ملفات، روابط، فيديوهات
- صلاحيات: Admin/Trainer يعدلون، Participant يشاهد فقط

#### 9. الاختبارات (Quizzes)
- إنشاء اختبارات مرتبطة بالفعاليات
- تتبع عدد الأسئلة

#### 10. الشهادات (Certificates)
- إصدار شهادات بأكواد فريدة
- QR verification

#### 11. التقارير والتحليلات (Reports)
- Charts بالـ Recharts
- Attendance analytics
- Event statistics

#### 12. التصميم والUI
- Dark mode (default)
- Glassmorphism design
- RTL support (Arabic)
- i18n (Arabic/English)
- Framer Motion animations

## البنية التقنية (Architecture)

### Frontend
- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** + **shadcn/ui**
- **Zustand** (state management)
- **React Router v6**
- **React Query** (server state)
- **Framer Motion** (animations)
- **i18next** (localization)
- **Recharts** (charts)

### Backend / Database
- **Supabase** (PostgreSQL + Auth + Realtime)
- **Row Level Security (RLS)** policies
- localStorage fallback للـ offline/demo mode

## البيانات السرية (Sensitive Data)

```env
VITE_SUPABASE_URL=https://ehaqcezbrzpbcioyzbpz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoYXFjZXpicnBiaW95emJweiIsInJvbCI6ImFub24iLCJpYXQiOjE3NDg2NDgzMzUsImV4cCI6MjA2NDIyNDMzNX0.LtVGf5R7hQWv9U4r8gJ6Xq3N8mK2p5Yh8bV4c7aZ9q
```

### بيانات الدخول التجريبية (Demo Credentials)
| البريد | الدور | الباسورد |
|--------|-------|----------|
| admin@evenue.com | Admin | password123 |
| trainer@evenue.com | Trainer | password123 |
| participant@evenue.com | Participant | password123 |

## الخطط المستقبلية (Roadmap)

### المرحلة القادمة: Assessment Centers 🎯

#### الفكرة
نظام إدارة مراكز التقييم والتقويم للموارد البشرية:
- **العميل**: شركات استشارات HR، مراكز التقييم، شركات التدريب
- **المستخدمون**:
  - **المقييمون (Assessors)**: موظفو الشركة اللي بيقيموا المرشحين
  - **المرشحون (Candidates)**: الموظفين المراد تقييمهم
  - **الأدمن**: إدارة المركز بالكامل

#### المميزات المطلوبة

##### 1. إدارة المراكز (Assessment Centers)
```
- اسم المركز
- الفترة الزمنية (من - إلى)
- الحالة: Draft, Active, Completed, Cancelled
- عدد القاعات المتاحة
- عدد المقييمين المطلوب
- عدد المرشحين المتوقع
```

##### 2. إدارة المقييمين (Assessors Management)
```
- ربطهم بالمركز
- تحديد متاحيتهم (Available Time Slots)
- عدد المرشحين اليومي/الأسبوعي لكل مقييم
- التخصصات (Competencies): قيادة، تواصل، تحليل، إلخ
```

##### 3. إدارة المرشحين (Candidates Management)
```
- بيانات شخصية ووظيفية
- ربطهم بمركز تقييم معين
- حالة التقييم: Scheduled, In Progress, Completed
```

##### 4. إدارة القاعات (Rooms Management)
```
- ربط القاعات بالمركز
- السعة
- المعدات المتاحة
- الجدول الزمني للقاعة (Room Schedule)
```

##### 5. الجدولة الذكية (Smart Scheduling)
```
- توزيع المرشحين على المقييمين
- تخصيص قاعات للمقابلات/التقييمات
- تجنب تعارض المواعيد
- تحسين الوقت (minimize idle time)
```

##### 6. أنواع التقييمات (Assessment Types)
```
- مقابلة فردية (One-on-one Interview)
- تقييم جماعي (Group Assessment)
- عرض تقديمي (Presentation)
- دراسة حالة (Case Study)
- اختبار عملي (Practical Test)
```

##### 7. التقييم والتسجيل (Scoring & Recording)
```
- Competency-based scoring
- تعليقات المقييم
- تقارير فردية للمرشحين
- تقارير مقارنة بين المرشحين
```

##### 8. لوحات المعلومات (Dashboards)
```
- مركز التقييم: utilization rate
- المقييم: workload و schedule
- المرشح: progress و results
- الأدمن: overview كامل
```

### مراحل التنفيذ

#### Phase 1: الأساس (2-3 أسابيع)
1. Database schema للـ Assessment Centers
2. Types و Interfaces
3. Store (Zustand) مع Supabase integration
4. الصفحات الأساسية (CRUD)

#### Phase 2: الجدولة (2 أسابيع)
1. Calendar/Scheduler component
2. Algorithm لتخصيص الموارد
3. Conflict detection
4. Auto-scheduling

#### Phase 3: التقييم (2 أسابيع)
1. Scoring forms
2. Competency framework
3. Reports generation
4. Export to PDF/Excel

#### Phase 4: التحسينات (1-2 أسابيع)
1. Notifications (email/push)
2. Reminders
3. Real-time updates
4. Mobile optimization

## الـ Repositories

- **GitHub**: https://github.com/H2H-2026/Evenue
- **Vercel**: (سيتم الإضافة بعد إنشاء المشروع)

## ملاحظات التطوير

### الـ Demo Mode
المنصة شغالة حالياً في Demo Mode مع localStorage. البيانات تتخزن محلياً في المتصفح.

### Supabase Integration
- Auth: مش شغال حالياً بسبب Email Confirmation
- Database: RLS policies تمنع الوصول بدون Auth
- الحل: تفعيل Anonymous access للـ demo أو تثبيت الـ users في Supabase

### الـ Features المعلقة
- Registrations store: محتاج إكمال الـ CRUD operations
- Real-time updates عبر Supabase Realtime
- Notifications system

## الأوامر المتاحة

```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
npx vercel
```

## المساهمون

- التطوير: Cascade (Windsurf AI)
- الفكرة والتوجيه: H2H-2026

---

**آخر تحديث**: 2 يونيو 2025
**الإصدار**: 0.1.0 (Beta)
