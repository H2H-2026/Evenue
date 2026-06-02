import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/stores/auth";
import { cn } from "@/lib/utils";

export function WelcomeBanner({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const today = new Date().toLocaleDateString(i18n.language === "ar" ? "ar-EG" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 p-6 md:p-8",
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#5BA882]/30 via-[#7CC4A4]/20 to-[#8BB8C8]/20" />
      <div className="absolute -end-10 -top-10 h-48 w-48 rounded-full bg-[#7CC4A4]/30 blur-3xl" />
      <div className="relative z-10 flex flex-col gap-1">
        <div className="mb-1 flex items-center gap-2 text-xs font-medium text-[#7CC4A4]">
          <Sparkles className="h-4 w-4" />
          <span>{today}</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          {t("dashboard.welcome")}، <span className="text-gradient">{user?.fullName}</span>
        </h2>
        <p className="max-w-lg text-sm text-muted-foreground">{t("app.tagline")}</p>
      </div>
    </motion.div>
  );
}
