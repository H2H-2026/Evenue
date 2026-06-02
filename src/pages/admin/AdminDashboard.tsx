import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { CalendarDays, Users, Clock, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { WelcomeBanner } from "@/components/WelcomeBanner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { useEvents } from "@/stores/events";
import { useUsers } from "@/stores/users";
import { useSessions } from "@/stores/sessions";
import { useRegistrations } from "@/stores/registrations";
import { useAttendance } from "@/stores/attendance";
import { StatSkeleton } from "@/components/ui/skeleton";

export function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const { events, fetch: fetchEvents } = useEvents();
  const { users, fetch: fetchUsers } = useUsers();
  const { sessions, fetch: fetchSessions } = useSessions();
  const { registrations } = useRegistrations();
  const { records } = useAttendance();

  useEffect(() => {
    fetchEvents();
    fetchUsers();
    fetchSessions();
  }, [fetchEvents, fetchUsers, fetchSessions]);

  const totalEvents = events.length;
  const totalParticipants = useMemo(
    () => users.filter((u) => u.role === "participant").length,
    [users],
  );
  const upcomingSessions = useMemo(() => {
    const now = new Date();
    return sessions.filter((s) => new Date(s.startsAt) > now).length;
  }, [sessions]);
  const attendanceRate = useMemo(() => {
    if (registrations.length === 0) return "—";
    const totalSlots = sessions.length * totalParticipants;
    if (totalSlots === 0) return "—";
    const rate = Math.round((records.length / totalSlots) * 100);
    return `${rate}%`;
  }, [sessions, totalParticipants, records]);

  // بيانات الحضور الأسبوعي من سجلات فعلية
  const weeklyData = useMemo(() => {
    const days = i18n.language === "ar"
      ? ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = Array(7).fill(0);
    records.forEach((r) => {
      const d = new Date(r.checkedInAt).getDay();
      counts[d]++;
    });
    return days.map((day, i) => ({ day, value: counts[i] }));
  }, [records, i18n.language]);

  // أحدث الفعاليات (أحدث 5)
  const recentEvents = useMemo(() => events.slice(0, 5), [events]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      <WelcomeBanner className="lg:col-span-4" />

      {events.length === 0 && users.length === 0 ? (
        <>
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
        </>
      ) : (
        <>
          <StatCard label={t("dashboard.totalEvents")} value={totalEvents} icon={CalendarDays} />
          <StatCard label={t("dashboard.totalParticipants")} value={totalParticipants} icon={Users} />
          <StatCard label={t("dashboard.upcomingSessions")} value={upcomingSessions} icon={Clock} />
          <StatCard label={t("dashboard.attendanceRate")} value={attendanceRate} icon={TrendingUp} />
        </>
      )}

      <Card className="lg:col-span-3 lg:row-span-2 hover-glow-card">
        <CardHeader>
          <CardTitle>{t("dashboard.weeklyAttendance")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="attFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#B31B3D" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#B31B3D" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="#B31B3D" strokeWidth={2.5} fill="url(#attFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-1 lg:row-span-2 hover-glow-card">
        <CardHeader>
          <CardTitle>{t("dashboard.recentEvents")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentEvents.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t("events.empty")}</p>
          ) : (
            recentEvents.map((e) => (
              <div key={e.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="font-medium">{e.title}</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{e.startDate}</p>
                  <StatusBadge status={e.status} label={t(`status.${e.status}`)} />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
