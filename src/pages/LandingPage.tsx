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
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:44px_44px]">
        {/* Aurora Background */}
        <div className="absolute inset-0 aurora-bg opacity-70" />
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-[#B31B3D]/10 rounded-full blur-3xl"
            animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-[#8BB8C8]/10 rounded-full blur-3xl"
            animate={{ y: [0, -40, 0], x: [0, -30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col justify-center min-h-[calc(100vh-64px)] pt-12 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#B31B3D] to-[#8BB8C8] blur-2xl opacity-20" />
                <div className="flex flex-col items-center gap-1.5">
                  <Logo className="relative h-28 w-28" inverted={true} showHeartToHeart={false} />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.h1
            className="text-6xl md:text-8xl font-black mb-4 tracking-tight text-white leading-none font-display"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Even<span className="font-serif italic font-normal text-primary relative">ue.</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-muted-foreground/90 mb-6 font-medium max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {isAr 
              ? "منصة متكاملة لإدارة الفعاليات والتدريب والتقييم" 
              : "A comprehensive platform for events, training & assessment management"}
          </motion.p>

          {/* Metadata Grid Row (Editorial Style) */}
          <motion.div 
            className="flex gap-6 justify-center items-center flex-wrap my-6 text-start max-w-3xl mx-auto border-y border-white/10 py-5 w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <div className="flex flex-col gap-1 min-w-[120px]">
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">{isAr ? "المنصة" : "Platform"}</span>
              <span className="text-sm font-semibold text-white">Evenue v2.0</span>
            </div>
            <div className="w-px h-8 bg-white/10 hidden sm:block" />
            <div className="flex flex-col gap-1 min-w-[150px]">
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">{isAr ? "الجهة المنفذة" : "Prepared By"}</span>
              <span className="text-sm font-semibold text-white">Heart to Heart Consulting</span>
            </div>
            <div className="w-px h-8 bg-white/10 hidden sm:block" />
            <div className="flex flex-col gap-1 min-w-[180px]">
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">{isAr ? "الخدمات" : "Services"}</span>
              <span className="text-sm font-semibold text-white">{isAr ? "تقييم وتنمية القيادات" : "Leadership Diagnostic & Dev"}</span>
            </div>
          </motion.div>

          {/* Tool Chips/Pills Row */}
          <motion.div 
            className="flex flex-wrap gap-2.5 justify-center mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span className="rounded-full px-4 py-1.5 text-xs font-semibold bg-white/5 border border-white/10 text-white/80">{isAr ? "تقييم الشخصية MBTI" : "MBTI® Personality Assessment"}</span>
            <span className="rounded-full px-4 py-1.5 text-xs font-semibold bg-white/5 border border-white/10 text-white/80">{isAr ? "ملف القيادة CPI260" : "CPI260 Leadership Profile"}</span>
            <span className="rounded-full px-4 py-1.5 text-xs font-semibold bg-white/5 border border-white/10 text-white/80">{isAr ? "الذكاء العاطفي EIP3" : "EIP3 Emotional Intelligence"}</span>
            <span className="rounded-full px-4 py-1.5 text-xs bg-primary/20 border border-primary/40 text-primary font-bold">{isAr ? "الحضور الذكي والشهادات" : "Smart Attendance & Certificates"}</span>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button
              size="lg"
              className="gap-2 bg-gradient-to-r from-[#B31B3D] to-[#8BB8C8] hover:opacity-95 text-lg px-8 py-6 rounded-xl font-bold shadow-glow"
              onClick={() => window.location.href = "/login"}
            >
              {isAr ? "دخول المنصة" : "Enter Platform"}
              <ArrowRight className={`h-5 w-5 ${isAr ? "rotate-180" : ""}`} />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="gap-2 text-lg px-8 py-6 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white"
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
              className={isAr ? "bg-primary text-white" : "text-white/60 hover:text-white hover:bg-white/5"}
            >
              العربية
            </Button>
            <Button
              variant={!isAr ? "default" : "ghost"}
              size="sm"
              onClick={() => setLang("en")}
              className={!isAr ? "bg-primary text-white" : "text-white/60 hover:text-white hover:bg-white/5"}
            >
              English
            </Button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="h-6 w-6 text-white/50" />
        </motion.div>

        {/* Brand Bottom Gradient Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-gradient-to-r from-primary via-accent to-primary" />
      </section>

      {/* Ticker Ribbon */}
      <div className="w-full bg-primary py-3.5 overflow-hidden border-y border-white/5 relative z-20">
        <div className="animate-ticker whitespace-nowrap flex items-center gap-12">
          {Array(4).fill([
            isAr ? "إدارة الفعاليات التدريبية" : "EVENT MANAGEMENT",
            "◆",
            isAr ? "تسجيل الحضور الذكي QR" : "SMART QR ATTENDANCE",
            "◆",
            isAr ? "نظام مراكز التقييم" : "ASSESSMENT CENTERS",
            "◆",
            isAr ? "إصدار الشهادات المعتمدة" : "ACCREDITED CERTIFICATES",
            "◆",
            isAr ? "تحليلات ولوحات بيانات تفاعلية" : "REPORTS & INTERACTIVE DASHBOARDS",
            "◆",
            "HEART TO HEART CONSULTING",
            "◆"
          ]).flat().map((item, idx) => (
            <span key={idx} className="text-[11px] font-extrabold tracking-widest text-white/90 uppercase flex items-center gap-4">
              {item}
            </span>
          ))}
        </div>
      </div>

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
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 transition-all hover:border-[#B31B3D]/30 hover:shadow-lg hover:shadow-[#B31B3D]/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-[#B31B3D]/20 to-[#8BB8C8]/20 p-3">
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
        <div className="absolute inset-0 bg-gradient-to-r from-[#B31B3D]/5 via-[#8BB8C8]/5 to-[#B31B3D]/5" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="rounded-3xl border border-white/10 bg-card/50 backdrop-blur-sm p-8 md:p-12 text-center">
            <div className="inline-flex rounded-2xl bg-gradient-to-br from-[#B31B3D]/20 to-[#8BB8C8]/20 p-4 mb-6">
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
              ? "© 2026 Heart to Heart Consulting. منصة Evenue لإدارة الفعاليات والتقييم."
              : "© 2026 Heart to Heart Consulting. Evenue Events & Assessment Management Platform."}
          </div>
        </div>
      </footer>
    </div>
  );
}
