import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDays, BookOpen, Award, FileQuestion, QrCode } from "lucide-react";
import { WelcomeBanner } from "@/components/WelcomeBanner";
import { StatCard } from "@/components/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useAuth } from "@/stores/auth";
import { useEvents } from "@/stores/events";
import { useRegistrations } from "@/stores/registrations";
import { useCertificates } from "@/stores/certificates";

export function ParticipantDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { events, fetch: fetchEvents } = useEvents();
  const { registrations } = useRegistrations();
  const { certificates } = useCertificates();

  const [selectedTicketEventId, setSelectedTicketEventId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const participantId = user?.id;

  // التسجيلات الخاصة بهذا المشارك
  const myRegistrations = useMemo(
    () => registrations.filter((r) => r.participantId === participantId),
    [registrations, participantId],
  );

  // الفعاليات اللي المشارك مسجّل فيها (مقبول أو قيد المراجعة)
  const myEventIds = useMemo(
    () => new Set(myRegistrations.filter((r) => r.status !== "rejected").map((r) => r.eventId)),
    [myRegistrations],
  );
  const myEvents = useMemo(
    () => events.filter((e) => myEventIds.has(e.id)),
    [events, myEventIds],
  );

  // الشهادات الخاصة بالمشارك
  const myCertificates = useMemo(
    () => certificates.filter((c) => c.participantId === participantId),
    [certificates, participantId],
  );

  // الفعاليات المتاحة للتسجيل (لم يسجّل فيها بعد)
  const availableEvents = useMemo(
    () => events.filter((e) => !myEventIds.has(e.id) && (e.status === "published" || e.status === "ongoing")),
    [events, myEventIds],
  );

  return (
    <div>
      <WelcomeBanner className="mb-6" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("nav.myEvents")} value={myEvents.length} icon={CalendarDays} />
        <StatCard label={t("nav.materials")} value="—" icon={BookOpen} />
        <StatCard label={t("nav.quizzes")} value="—" icon={FileQuestion} />
        <StatCard label={t("nav.certificates")} value={myCertificates.length} icon={Award} />
      </div>

      {/* فعالياتي */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("nav.myEvents")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {myEvents.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t("events.empty")}</p>
          ) : (
            myEvents.map((e) => {
              const reg = myRegistrations.find((r) => r.eventId === e.id);
              const isApproved = reg?.status === "approved";
              return (
                <div key={e.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <div>
                    <p className="font-medium">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{e.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {isApproved && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedTicketEventId(e.id)}
                        title={t("common.qrCode") || "QR Code"}
                        className="h-8 w-8 text-violet-400 hover:bg-violet-500/10 hover:text-violet-300"
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                    )}
                    <StatusBadge status={e.status} label={t(`status.${e.status}`)} />
                    {reg && (
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-muted-foreground">
                        {t(`registrations.status.${reg.status}`)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* فعاليات متاحة للتسجيل */}
      {availableEvents.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>{t("nav.events")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableEvents.slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <div>
                  <p className="font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.startDate} — {e.endDate}</p>
                </div>
                <StatusBadge status={e.status} label={t(`status.${e.status}`)} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* نافذة عرض تذكرة الـ QR */}
      <Dialog
        open={!!selectedTicketEventId}
        onClose={() => setSelectedTicketEventId(null)}
        title={t("common.ticket") || "Event Ticket"}
        className="max-w-xs"
      >
        <div className="flex flex-col items-center justify-center gap-4 py-4 text-center">
          <p className="text-sm font-semibold text-foreground">
            {events.find((e) => e.id === selectedTicketEventId)?.title}
          </p>
          <div className="rounded-2xl bg-white p-4 shadow-glow-sm">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${participantId}`}
              alt="QR Badge"
              className="h-44 w-44 object-contain"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {t("common.scanHint") || "Present this QR code to the trainer to record your attendance."}
          </p>
        </div>
      </Dialog>
    </div>
  );
}
