import { useTranslation } from "react-i18next";
import { Languages, Moon, Sun, Search, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Dropdown } from "@/components/ui/dropdown";
import { useAuth } from "@/stores/auth";
import { useTheme } from "@/stores/theme";
import { useLayout } from "@/stores/layout";
import i18n, { type AppLanguage } from "@/i18n";

export function Topbar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const { setMobileOpen } = useLayout();

  const switchLang = () => {
    const next: AppLanguage = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(next);
  };

  return (
    <header className="glass flex h-16 items-center gap-3 border-b border-white/10 px-4 md:px-6">
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground md:hidden"
        title={t("common.search")}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden max-w-md flex-1 sm:block">
        <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={t("topbar.searchPlaceholder")}
          className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.03] ps-9 pe-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-violet-400/50 focus:bg-white/[0.06]"
        />
      </div>

      <div className="flex flex-1 items-center justify-end gap-1.5">
        <Button variant="ghost" size="icon" onClick={switchLang} title={t("common.language")}>
          <Languages className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={toggle} title={t("common.theme")}>
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Dropdown
          trigger={
            <span className="relative flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground">
              <Bell className="h-5 w-5" />
            </span>
          }
        >
          {() => (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              {t("topbar.noNotifications")}
            </div>
          )}
        </Dropdown>

        {user && (
          <span className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] py-1.5 ps-2 pe-3">
            <Avatar name={user.fullName} className="h-8 w-8" />
            <span className="hidden flex-col items-start leading-tight sm:flex">
              <span className="text-sm font-semibold">{user.fullName}</span>
              <span className="text-xs text-muted-foreground">{t(`roles.${user.role}`)}</span>
            </span>
          </span>
        )}
      </div>
    </header>
  );
}
