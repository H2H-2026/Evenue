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
  const { registrations, fetch: fetchRegistrations } = useRegistrations();
  const { certificates, fetch: fetchCertificates } = useCertificates();

  const [selectedTicketEventId, setSelectedTicketEventId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
    fetchRegistrations();
    fetchCertificates();
  }, [fetchEvents, fetchRegistrations, fetchCertificates]);

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

  // Find the next upcoming approved event
  const nextEvent = useMemo(() => {
    const approvedEvents = myEvents.filter((e) => {
      const reg = myRegistrations.find((r) => r.eventId === e.id);
      return reg?.status === "approved" && new Date(e.startDate).getTime() > Date.now();
    });
    return approvedEvents.sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )[0];
  }, [myEvents, myRegistrations]);

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (!nextEvent) {
      setTimeLeft(null);
      return;
    }
    const target = new Date(nextEvent.startDate).getTime();
    const update = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [nextEvent]);

  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    const rotateX = -y / (box.height / 30);
    const rotateY = x / (box.width / 30);
    setTiltStyle({
      transform: `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      transition: "transform 0.1s ease-out",
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(600px) rotateX(0deg) rotateY(0deg)",
      transition: "transform 0.5s ease-out",
    });
  };

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

      {nextEvent && timeLeft && (
        <Card className="mb-6 overflow-hidden border-[#7CC4A4]/20 bg-gradient-to-r from-[#7CC4A4]/10 via-transparent to-transparent p-6 hover-glow-card">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <span className="inline-flex items-center rounded-full bg-[#7CC4A4]/10 px-2.5 py-0.5 text-xs font-semibold text-[#7CC4A4] animate-pulse-glow">
                {t("dashboard.upcomingEvent")}
              </span>
              <h3 className="text-xl font-bold text-foreground">{nextEvent.title}</h3>
              <p className="text-sm text-muted-foreground">
                {nextEvent.startDate}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {[
                { label: t("dashboard.days"), val: timeLeft.days },
                { label: t("dashboard.hours"), val: timeLeft.hours },
                { label: t("dashboard.minutes"), val: timeLeft.minutes },
                { label: t("dashboard.seconds"), val: timeLeft.seconds },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center min-w-[70px] rounded-xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-md">
                  <span className="text-2xl font-black text-[#7CC4A4] font-mono tracking-wider">
                    {String(item.val).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground mt-1">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

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
                        className="h-8 w-8 text-[#7CC4A4] hover:bg-[#7CC4A4]/10 hover:text-[#5BA882]"
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
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={tiltStyle}
            className="rounded-2xl bg-white p-6 shadow-glow-lg border border-white/20 select-none cursor-pointer transform-gpu w-56 mx-auto text-center"
          >
            <div className="text-[10px] font-black uppercase tracking-widest text-[#5BA882] mb-3 font-mono">
              Evenue Badge
            </div>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${participantId}`}
              alt="QR Badge"
              className="h-40 w-40 object-contain mx-auto"
            />
            <div className="text-[9px] text-muted-foreground mt-3 font-mono">
              ID: {participantId?.slice(0, 8).toUpperCase()}...
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("common.scanHint") || "Present this QR code to the trainer to record your attendance."}
          </p>
        </div>
      </Dialog>
    </div>
  );
}
