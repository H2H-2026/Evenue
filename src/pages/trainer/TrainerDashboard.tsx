import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CalendarCheck, Users, BookOpen, Star, Clock, MapPin } from "lucide-react";
import { WelcomeBanner } from "@/components/WelcomeBanner";
import { StatCard } from "@/components/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/stores/auth";
import { useSessions } from "@/stores/sessions";
import { useEvents } from "@/stores/events";
import { useVenues } from "@/stores/venues";
import { useRegistrations } from "@/stores/registrations";

export function TrainerDashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { sessions, fetch: fetchSessions } = useSessions();
  const { events, fetch: fetchEvents } = useEvents();
  const { venues } = useVenues();
  const { registrations } = useRegistrations();

  useEffect(() => {
    fetchSessions();
    fetchEvents();
  }, [fetchSessions, fetchEvents]);

  const trainerId = user?.id;

  // جلسات هذا المدرّب
  const mySessions = useMemo(
    () => sessions.filter((s) => s.trainerId === trainerId),
    [sessions, trainerId],
  );

  // الجلسات القادمة
  const upcoming = useMemo(() => {
    const now = new Date();
    return mySessions
      .filter((s) => new Date(s.startsAt) > now)
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  }, [mySessions]);

  // عدد المشاركين المسجّلين في فعاليات المدرّب
  const participantCount = useMemo(() => {
    const myEventIds = new Set(mySessions.map((s) => s.eventId));
    const ids = new Set(
      registrations.filter((r) => myEventIds.has(r.eventId) && r.status === "approved").map((r) => r.participantId),
    );
    return ids.size;
  }, [mySessions, registrations]);

  const eventTitle = (id: string) => events.find((e) => e.id === id)?.title ?? "—";
  const venueName = (id?: string) => venues.find((v) => v.id === id)?.name ?? t("sessions.noVenue");

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(i18n.language === "ar" ? "ar-EG" : "en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <WelcomeBanner className="mb-6" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("dashboard.upcomingSessions")} value={upcoming.length} icon={CalendarCheck} />
        <StatCard label={t("dashboard.totalParticipants")} value={participantCount} icon={Users} />
        <StatCard label={t("nav.materials")} value={mySessions.length} icon={BookOpen} hint={t("nav.sessions")} />
        <StatCard label={t("nav.feedback")} value="—" icon={Star} hint={t("common.loading")} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("dashboard.upcomingSessions")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcoming.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t("schedule.empty")}</p>
          ) : (
            upcoming.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{eventTitle(s.eventId)}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDateTime(s.startsAt)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-xs">
                    <MapPin className="h-3 w-3" />
                    {venueName(s.venueId)}
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
