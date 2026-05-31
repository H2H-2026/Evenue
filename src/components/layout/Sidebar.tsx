import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  ClipboardList,
  QrCode,
  BookOpen,
  FileQuestion,
  Star,
  BarChart3,
  Award,
  CalendarCheck,
  ChevronsLeft,
  UserCircle,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { useAuth } from "@/stores/auth";
import { useLayout } from "@/stores/layout";
import type { UserRole } from "@/types";

type NavEntry = { to: string; labelKey: string; icon: typeof LayoutDashboard };
type NavGroup = { groupKey: string; entries: NavEntry[] };

const NAV_BY_ROLE: Record<UserRole, NavGroup[]> = {
  admin: [
    {
      groupKey: "overview",
      entries: [{ to: "/admin", labelKey: "nav.dashboard", icon: LayoutDashboard }],
    },
    {
      groupKey: "management",
      entries: [
        { to: "/admin/events", labelKey: "nav.events", icon: CalendarDays },
        { to: "/admin/sessions", labelKey: "nav.sessions", icon: Clock },
        { to: "/admin/venues", labelKey: "nav.venues", icon: MapPin },
      ],
    },
    {
      groupKey: "people",
      entries: [
        { to: "/admin/users", labelKey: "nav.users", icon: Users },
        { to: "/admin/registrations", labelKey: "nav.registrations", icon: ClipboardList },
      ],
    },
    {
      groupKey: "analytics",
      entries: [{ to: "/admin/reports", labelKey: "nav.reports", icon: BarChart3 }],
    },
  ],
  trainer: [
    {
      groupKey: "overview",
      entries: [{ to: "/trainer", labelKey: "nav.dashboard", icon: LayoutDashboard }],
    },
    {
      groupKey: "training",
      entries: [
        { to: "/trainer/schedule", labelKey: "nav.schedule", icon: CalendarCheck },
        { to: "/trainer/attendance", labelKey: "nav.attendance", icon: QrCode },
        { to: "/trainer/materials", labelKey: "nav.materials", icon: BookOpen },
        { to: "/trainer/quizzes", labelKey: "nav.quizzes", icon: FileQuestion },
      ],
    },
    {
      groupKey: "tracking",
      entries: [{ to: "/trainer/feedback", labelKey: "nav.feedback", icon: Star }],
    },
  ],
  participant: [
    {
      groupKey: "overview",
      entries: [{ to: "/participant", labelKey: "nav.dashboard", icon: LayoutDashboard }],
    },
    {
      groupKey: "journey",
      entries: [
        { to: "/participant/events", labelKey: "nav.myEvents", icon: CalendarDays },
        { to: "/participant/schedule", labelKey: "nav.schedule", icon: CalendarCheck },
        { to: "/participant/materials", labelKey: "nav.materials", icon: BookOpen },
        { to: "/participant/quizzes", labelKey: "nav.quizzes", icon: FileQuestion },
      ],
    },
    {
      groupKey: "achievements",
      entries: [
        { to: "/participant/certificates", labelKey: "nav.certificates", icon: Award },
        { to: "/participant/feedback", labelKey: "nav.feedback", icon: Star },
      ],
    },
  ],
};

export function SidebarContent({
  role,
  collapsed = false,
  onNavigate,
}: {
  role: UserRole;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const groups = NAV_BY_ROLE[role];

  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-16 items-center border-b border-white/10", collapsed ? "justify-center px-2" : "px-5")}>
        {collapsed ? <LogoMark className="h-9 w-9" /> : <Logo />}
      </div>

      <nav className="no-scrollbar flex-1 space-y-5 overflow-y-auto p-3">
        {groups.map((group) => (
          <div key={group.groupKey} className="space-y-1">
            {!collapsed && (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {t(`navGroups.${group.groupKey}`)}
              </p>
            )}
            {group.entries.map(({ to, labelKey, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === `/${role}`}
                onClick={onNavigate}
                title={collapsed ? t(labelKey) : undefined}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    collapsed && "justify-center px-0",
                    isActive
                      ? "bg-gradient-to-r from-indigo-500/90 to-violet-500/90 text-white shadow-glow-sm"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="truncate">{t(labelKey)}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {user && (
        <div className="border-t border-white/10 p-4">
          {!collapsed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-bold text-white shadow-glow-sm">
                  {user.fullName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold">{user.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  <p className="truncate text-xs text-violet-400">{t(`roles.${user.role}`)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <NavLink
                  to={`/${user.role}/profile`}
                  onClick={onNavigate}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10"
                >
                  <UserCircle className="h-4 w-4" />
                  {t("topbar.profile")}
                </NavLink>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
                >
                  <LogOut className="h-4 w-4" />
                  {t("common.logout")}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-glow-sm">
                {user.fullName.charAt(0)}
              </div>
              <button
                type="button"
                onClick={() => logout()}
                className="text-red-400"
                title={t("common.logout")}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ role }: { role: UserRole }) {
  const { collapsed, toggleCollapsed } = useLayout();

  return (
    <aside
      className={cn(
        "glass relative z-10 hidden shrink-0 flex-col border-e border-white/10 transition-[width] duration-300 md:flex",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <SidebarContent role={role} collapsed={collapsed} />
      <button
        type="button"
        onClick={toggleCollapsed}
        className="absolute top-20 z-20 hidden h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-card text-muted-foreground shadow-glow-sm transition-colors hover:text-foreground md:flex"
        style={{ insetInlineEnd: "-0.875rem" }}
        title="طي/فتح"
      >
        <ChevronsLeft className={cn("h-4 w-4 transition-transform rtl:rotate-180", collapsed && "rotate-180 rtl:rotate-0")} />
      </button>
    </aside>
  );
}
