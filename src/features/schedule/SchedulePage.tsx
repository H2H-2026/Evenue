import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { CalendarDays, Clock, MapPin, CalendarX } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { useSessions } from "@/stores/sessions";
import { useEvents } from "@/stores/events";
import { useVenues } from "@/stores/venues";
import { useRegistrations } from "@/stores/registrations";

export function SchedulePage({
  trainerId,
  participantId,
}: {
  trainerId?: string;
  participantId?: string;
}) {
  const { t, i18n } = useTranslation();
  const { sessions, fetch: fetchSessions } = useSessions();
  const { events, fetch: fetchEvents } = useEvents();
  const { venues } = useVenues();
  const { registrations } = useRegistrations();

  useEffect(() => {
    fetchSessions();
    fetchEvents();
  }, [fetchSessions, fetchEvents]);

  const filtered = useMemo(() => {
    if (trainerId) {
      return sessions.filter((s) => s.trainerId === trainerId);
    }
    if (participantId) {
      // فلترة بالفعاليات اللي المشارك مسجّل فيها (مقبول)
      const myEventIds = new Set(
        registrations
          .filter((r) => r.participantId === participantId && r.status === "approved")
          .map((r) => r.eventId),
      );
      return sessions.filter((s) => myEventIds.has(s.eventId));
    }
    return sessions;
  }, [sessions, trainerId, participantId, registrations]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  }, [filtered]);

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
      <PageHeader title={t("schedule.title")} description={t("schedule.subtitle")} />

      {sorted.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
          <CalendarX className="h-10 w-10" />
          <p className="font-medium text-foreground">{t("schedule.empty")}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, delay: i * 0.05 }}>
              <Card className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{s.title}</p>
                    <p className="text-sm text-muted-foreground">{eventTitle(s.eventId)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground sm:justify-end">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {formatDateTime(s.startsAt)} — {formatDateTime(s.endsAt)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1">
                    <MapPin className="h-4 w-4" />
                    {venueName(s.venueId)}
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
