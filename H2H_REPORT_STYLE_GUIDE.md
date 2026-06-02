# Heart to Heart Assessment Report - Style Guide

## الهوية البصرية لتقارير Heart to Heart

### الألوان الرئيسية (Brand Colors)

| اللون | الكود | الاستخدام |
|-------|-------|-----------|
| Violet Primary | `#9333ea` | العناصر الرئيسية، الأزرار، التدرجات |
| Fuchsia Secondary | `#c026d3` | التدرجات، التأكيد |
| Pink Accent | `#ec4899` | التأكيد، الأيقونات، العناصر التفاعلية |
| Purple Dark | `#581c87` | الخلفيات الداكنة |
| Purple Light | `#f3e8ff` | الخلفيات الفاتحة، البطاقات |

### التدرج الرئيسي (Primary Gradient)
```css
background: linear-gradient(135deg, #9333ea 0%, #c026d3 50%, #ec4899 100%);
```

### الخطوط (Typography)

**العربية:**
- Tajawal (Google Font) - للعناوين والنصوص
- Weights: 300, 400, 500, 700, 800

**الإنجليزية:**
- Bricolage Grotesque - للعناوين
- Libre Baskerville - للنصوص المائلة/تمييزية
- Caveat - للتوقيعات والعناصر اليدوية

### عناصر التصميم

#### 1. الشعار (Logo)
- دائرة بقطر 40px
- تدرج Violet → Fuchsia
- أيقونة قلب بيضاء في المنتصف
- ظلال: `box-shadow: 0 0 0 2.5px white, 0 0 0 4px #9333ea, 2px 3px 10px rgba(147,51,234,0.3)`

#### 2. العنوان الرئيسي (Hero Title)
- خط Tajawal/Bricolage Grotesque
- حجم: clamp(42px, 6vw, 84px)
- weight: 800
- الكلمة المميزة بتدرج الألوان

#### 3. البطاقات (Cards)
- border-radius: 18px
- خلفية: أبيض أو تدرج خفيف
- ظل عند hover: `box-shadow: 0 12px 40px rgba(147,51,234,0.12)`

#### 4. أشرطة التقدم (Progress Bars)
- الألوان حسب المستوى:
  - ممتاز: تدرج Violet → Fuchsia
  - جيد: Violet مع شفافية
  - متوسط: Blue (#8BB8C8)
  - يحتاج تطوير: Violet فاتح

### هيكل التقرير

```
1. غلاف (Cover)
   - خلفية داكنة مع تدرجات بنفسجية
   - اسم المرشح والمنصب
   - تاريخ التقييم

2. شريط الأخبار (Ticker)
   - بنفسجي → فوشي
   - كلمات مفتاحية للتقييم

3. نظرة عامة (Overview)
   - 4 بطاقات إحصائيات
   - الدرجة الكلية، الأدوات، المدة، التوصية

4. الكفاءات (Competencies)
   - أشرطة تقدم للكفاءات المقاسة
   - تقسيم حسب المستوى

5. خطة التطوير (Development Plan)
   - بطاقات برامج تطويرية مقترحة
   - أرقام وعناوين ووصف

6. الخاتمة (Closing)
   - رسالة ختامية
   - توقيع

7. Footer
   - شعار Heart to Heart
   - معلومات الاتصال
   - إخلاء مسؤولية
```

### ملاحظات التنفيذ

1. **الرسوم المتحركة:**
   - fade-up للعناصر عند التمرير
   - transition: opacity .6s ease, transform .6s ease
   - delay متدرج للعناصر المتتالية

2. **التأثيرات البصرية:**
   - radial-gradient للخلفية مع animation pulse
   - grid pattern خفيف للخلفيات
   - backdrop-filter: blur للـ navbar

3. **الاستجابة (Responsive):**
   - Mobile-first approach
   - Breakpoints: 1024px, 768px
   - Grid يتحول من 4→2→1 أعمدة

### الروابط والموارد

- **الموقع:** https://h2hconsulting.org
- **البريد:** info@h2hconsulting.org
- **شعار أبيض:** https://h2hconsulting.org/wp-content/uploads/2022/06/Logo-white-1.png
- **الشعار الملون:** يُصمّح مباشرة بالـ CSS

### أمثلة CSS

```css
/* التدرج الرئيسي */
--h2h-gradient: linear-gradient(135deg, #9333ea 0%, #c026d3 50%, #ec4899 100%);

/* الظل النموذجي */
--h2h-shadow: 0 12px 40px rgba(147,51,234,0.12);

/* خلفية متحركة */
@keyframes pulse-glow {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
}
```

---

**جاهز للاستخدام!** 💜
