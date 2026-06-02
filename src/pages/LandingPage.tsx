import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, 
  Users, 
  Award, 
  BarChart3, 
  ArrowRight,
  Building2,
  GraduationCap,
  QrCode,
  Globe,
  ChevronDown
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const features = [
  {
    icon: CalendarDays,
    titleAr: "إدارة الفعاليات",
    titleEn: "Event Management",
    descAr: "تنظيم وإدارة الفعاليات والتدريب بكفاءة عالية",
    descEn: "Organize and manage events & training efficiently",
  },
  {
    icon: Users,
    titleAr: "إدارة المشاركين",
    titleEn: "Participant Management",
    descAr: "تسجيل ومتابعة المشاركين والمدربين",
    descEn: "Register and track participants & trainers",
  },
  {
    icon: Award,
    titleAr: "الشهادات",
    titleEn: "Certificates",
    descAr: "إصدار شهادات معتمدة مع QR للتحقق",
    descEn: "Issue accredited certificates with QR verification",
  },
  {
    icon: QrCode,
    titleAr: "الحضور الذكي",
    titleEn: "Smart Attendance",
    descAr: "تتبع الحضور باستخدام QR كود",
    descEn: "Track attendance using QR code technology",
  },
  {
    icon: BarChart3,
    titleAr: "التقارير والتحليلات",
    titleEn: "Reports & Analytics",
    descAr: "لوحات معلومات تفاعلية وتحليلات شاملة",
    descEn: "Interactive dashboards & comprehensive analytics",
  },
  {
    icon: Building2,
    titleAr: "مراكز التقييم",
    titleEn: "Assessment Centers",
    descAr: "إدارة مراكز تقييم الموارد البشرية",
    descEn: "Manage HR assessment centers",
  },
];

const stats = [
  { value: "10+", labelAr: "موديول", labelEn: "Modules" },
  { value: "3", labelAr: "أدوار", labelEn: "Roles" },
  { value: "100%", labelAr: "عربي/إنجليزي", labelEn: "Bilingual" },
  { value: "24/7", labelAr: "دعم", labelEn: "Support" },
];

export function LandingPage() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const isAr = lang === "ar";

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Aurora Background */}
        <div className="absolute inset-0 aurora-bg" />
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
            animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"
            animate={{ y: [0, -40, 0], x: [0, -30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-violet-500 blur-2xl opacity-30" />
                <Logo className="relative h-24 w-24" />
              </div>
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {isAr ? "Evenue" : "Evenue"}
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-muted-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {isAr 
              ? "منصة متكاملة لإدارة الفعاليات والتدريب والتقييم" 
              : "A comprehensive platform for events, training & assessment management"}
          </motion.p>

          <motion.p
            className="text-lg text-muted-foreground/70 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {isAr
              ? "واجهة احترافية • دعم كامل للغة العربية • تقارير ذكية"
              : "Professional Interface • Full Arabic Support • Smart Reports"}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button
              size="lg"
              className="gap-2 bg-gradient-to-r from-primary to-violet-500 hover:opacity-90 text-lg px-8 py-6"
              onClick={() => window.location.href = "/login"}
            >
              {isAr ? "دخول المنصة" : "Enter Platform"}
              <ArrowRight className={`h-5 w-5 ${isAr ? "rotate-180" : ""}`} />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="gap-2 text-lg px-8 py-6"
              onClick={scrollToFeatures}
            >
              {isAr ? "اكتشف المميزات" : "Explore Features"}
              <ChevronDown className="h-5 w-5" />
            </Button>
          </motion.div>

          {/* Language Toggle */}
          <motion.div
            className="flex justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Button
              variant={isAr ? "default" : "ghost"}
              size="sm"
              onClick={() => setLang("ar")}
            >
              العربية
            </Button>
            <Button
              variant={!isAr ? "default" : "ghost"}
              size="sm"
              onClick={() => setLang("en")}
            >
              English
            </Button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="h-6 w-6 text-muted-foreground" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.labelAr}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {isAr ? stat.labelAr : stat.labelEn}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {isAr ? "مميزات المنصة" : "Platform Features"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {isAr 
                ? "كل ما تحتاجه لإدارة فعالياتك ومراكز التقييم بكفاءة واحترافية"
                : "Everything you need to manage your events & assessment centers efficiently"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.titleAr}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 p-3">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {isAr ? feature.titleAr : feature.titleEn}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isAr ? feature.descAr : feature.descEn}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Assessment Centers Highlight */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-violet-500/5 to-primary/5" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="rounded-3xl border border-white/10 bg-card/50 backdrop-blur-sm p-8 md:p-12 text-center">
            <div className="inline-flex rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 p-4 mb-6">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {isAr 
                ? "نظام مراكز التقييم الجديد" 
                : "New Assessment Centers System"}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {isAr
                ? "أداة متكاملة لإدارة مراكز تقييم الموارد البشرية. خطط الجداول، وزع المرشحين على المقييمين، وتابع التقييمات في الوقت الفعلي."
                : "An integrated tool for managing HR assessment centers. Schedule timelines, assign candidates to assessors, and track evaluations in real-time."}
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
                <GraduationCap className="h-4 w-4" />
                {isAr ? "تقييم الكفاءات" : "Competency Assessment"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
                <Users className="h-4 w-4" />
                {isAr ? "إدارة المقييمين" : "Assessor Management"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
                <CalendarDays className="h-4 w-4" />
                {isAr ? "جدولة ذكية" : "Smart Scheduling"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Logo className="h-8 w-8" />
              <span className="font-semibold">Evenue</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>{isAr ? "متاح بالعربية والإنجليزية" : "Available in Arabic & English"}</span>
            </div>

            <Button onClick={() => window.location.href = "/login"}>
              {isAr ? "دخول المنصة →" : "Enter Platform →"}
            </Button>
          </div>
          
          <div className="mt-8 text-center text-xs text-muted-foreground">
            {isAr 
              ? "© 2026 Evenue. منصة إدارة الفعاليات والتقييم. جميع الحقوق محفوظة."
              : "© 2026 Evenue. Events & Assessment Management Platform. All rights reserved."}
          </div>
        </div>
      </footer>
    </div>
  );
}
