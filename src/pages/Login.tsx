import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, GraduationCap, User, Languages, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/stores/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { UserRole } from "@/types";
import i18n from "@/i18n";

const ROLES: { role: UserRole; icon: typeof Shield; labelKey: string }[] = [
  { role: "admin", icon: Shield, labelKey: "login.asAdmin" },
  { role: "trainer", icon: GraduationCap, labelKey: "login.asTrainer" },
  { role: "participant", icon: User, labelKey: "login.asParticipant" },
];

export function Login() {
  const { t } = useTranslation();
  const { loginAs, logout, user } = useAuth();
  const navigate = useNavigate();

  const enter = async (role: UserRole) => {
    await loginAs(role);
    navigate(`/${role}`);
  };

  const continueAsUser = () => {
    if (user) navigate(`/${user.role}`);
  };

  return (
    <div className="aurora-bg relative flex min-h-screen items-center justify-center bg-background p-4">
      <Button
        variant="ghost"
        size="icon"
        className="absolute end-4 top-4"
        onClick={() => i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar")}
        title={t("common.language")}
      >
        <Languages className="h-5 w-5" />
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="glass-strong w-full">
          <CardContent className="p-8">
            <div className="mb-8 flex flex-col items-center text-center">
              <Logo markClassName="h-14 w-14" className="mb-3 flex-col gap-2" showHeartToHeart inverted />
              <p className="mt-2 text-sm text-muted-foreground">{t("login.subtitle")}</p>
            </div>

            {user ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
                  <p className="text-sm text-emerald-300">{t("login.alreadyLoggedIn")}</p>
                  <p className="mt-1 font-semibold">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground">{t(`roles.${user.role}`)}</p>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1" onClick={continueAsUser}>{t("login.continue")}</Button>
                  <Button variant="outline" className="flex-1" onClick={() => logout()}>{t("login.switchAccount")}</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {ROLES.map(({ role, icon: Icon, labelKey }) => (
                  <button
                    key={role}
                    onClick={() => enter(role)}
                    className="group flex w-full items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-start transition-all hover:border-[#B31B3D]/50 hover:bg-white/[0.07] hover:shadow-glow-sm"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-[#B31B3D] to-[#8BB8C8] text-white shadow-glow-sm">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{t(`roles.${role}`)}</p>
                      <p className="text-xs text-muted-foreground">{t(labelKey)}</p>
                    </div>
                    <ChevronLeft className="h-5 w-5 text-muted-foreground transition-transform ltr:group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            )}

            <p className="mt-6 text-center text-xs text-muted-foreground">
              {isSupabaseConfigured
                ? t("login.supabaseConnected")
                : t("login.demoMode")}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
