import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { CalendarDays, Search, CheckCircle, Clock, XCircle, CalendarX } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { useAuth } from "@/stores/auth";
import { useEvents } from "@/stores/events";
import { useRegistrations } from "@/stores/registrations";
import { useToast } from "@/stores/toast";

const REG_ICON: Record<string, typeof CheckCircle> = {
  approved: CheckCircle,
  pending: Clock,
  rejected: XCircle,
};

const REG_COLOR: Record<string, string> = {
  approved: "text-emerald-400",
  pending: "text-amber-400",
  rejected: "text-red-400",
};

export function ParticipantEventsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { events, fetch: fetchEvents } = useEvents();
  const { registrations, add: addRegistration, fetch: fetchRegistrations } = useRegistrations();
  const toast = useToast();

  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchEvents();
    fetchRegistrations();
  }, [fetchEvents, fetchRegistrations]);

  const participantId = user?.id ?? "";

  // تسجيلاتي
  const myRegs = useMemo(
    () => registrations.filter((r) => r.participantId === participantId),
    [registrations, participantId],
  );
  const regByEvent = useMemo(() => {
    const map = new Map<string, (typeof myRegs)[0]>();
    myRegs.forEach((r) => map.set(r.eventId, r));
    return map;
  }, [myRegs]);

  // فعاليات مرئية (مقبول/قيد المراجعة + متاحة للتسجيل)
  const visibleEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (q && !e.title.toLowerCase().includes(q) && !e.description?.toLowerCase().includes(q)) return false;
      // أظهر الفعاليات اللي مسجّل فيها + المنشورة/الجارية
      const reg = regByEvent.get(e.id);
      if (reg) return true;
      return e.status === "published" || e.status === "ongoing";
    });
  }, [events, query, regByEvent]);

  const handleRegister = async (eventId: string) => {
    await addRegistration({ eventId, participantId, status: "pending" });
    toast.success(t("participant.registered"));
  };

  return (
    <div>
      <PageHeader title={t("nav.myEvents")} description={t("participant.eventsSubtitle")} />

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("events.searchPlaceholder")}
          className="ps-9"
        />
      </div>

      <p className="mb-3 text-sm text-muted-foreground">
        {t("events.count", { count: visibleEvents.length })}
      </p>

      {visibleEvents.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
          <CalendarX className="h-10 w-10" />
          <p className="font-medium text-foreground">{t("events.empty")}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleEvents.map((e, i) => {
            const reg = regByEvent.get(e.id);
            const Icon = reg ? REG_ICON[reg.status] ?? Clock : null;
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
              >
                <Card className="flex h-full flex-col p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-glow-sm">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <StatusBadge status={e.status} label={t(`status.${e.status}`)} />
                  </div>
                  <h3 className="text-lg font-bold">{e.title}</h3>
                  {e.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{e.description}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {e.startDate} — {e.endDate}
                  </p>

                  <div className="mt-auto pt-4">
                    {reg ? (
                      <div className={`flex items-center gap-2 text-sm ${REG_COLOR[reg.status] ?? ""}`}>
                        {Icon && <Icon className="h-4 w-4" />}
                        <span>{t(`registrations.status.${reg.status}`)}</span>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleRegister(e.id)}
                      >
                        {t("participant.register")}
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
