import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Check, X, Users, CalendarCheck, QrCode } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Dialog } from "@/components/ui/dialog";
import { useSessions } from "@/stores/sessions";
import { useRegistrations } from "@/stores/registrations";
import { useUsers } from "@/stores/users";
import { useEvents } from "@/stores/events";
import { useAttendance } from "@/stores/attendance";
import { cn } from "@/lib/utils";
import { Html5QrcodeScanner } from "html5-qrcode";
import type { Profile } from "@/types";

interface QrScannerDialogProps {
  open: boolean;
  onClose: () => void;
  onScan: (participantId: string) => Promise<void>;
  participants: Profile[];
  t: (key: string) => string;
}

function QrScannerDialog({ open, onClose, onScan, participants, t }: QrScannerDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSuccess(null);

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 220, height: 220 } },
      /* verbose= */ false
    );

    scanner.render(
      async (decodedText) => {
        try {
          setError(null);
          await onScan(decodedText);
          setSuccess(t("attendance.checkedIn"));
          setTimeout(() => {
            onClose();
          }, 1500);
        } catch (err: any) {
          setError(err.message || t("attendance.invalidQR"));
        }
      },
      () => {
        // Quietly ignore scan errors (frequent during search)
      }
    );

    return () => {
      scanner.clear().catch((err) => console.error("Failed to clear scanner", err));
    };
  }, [open, onScan, onClose, t]);

  return (
    <Dialog open={open} onClose={onClose} title={t("attendance.qrScannerTitle")} className="max-w-md">
      <div className="flex flex-col items-center justify-center gap-4 py-4 text-center">
        <div id="qr-reader" className="w-full max-w-[300px] overflow-hidden rounded-xl border border-white/10 bg-black/20" />
        
        {error && <p className="text-sm font-medium text-red-400">{error}</p>}
        {success && <p className="text-sm font-medium text-green-400">{success}</p>}

        <div className="w-full border-t border-white/10 pt-4 text-start">
          <Label htmlFor="simulate-select" className="text-xs text-muted-foreground mb-1.5 block">
            {t("attendance.simulateScanHint")}
          </Label>
          <Select
            id="simulate-select"
            defaultValue=""
            onChange={async (e) => {
              const val = e.target.value;
              if (val) {
                try {
                  setError(null);
                  await onScan(val);
                  setSuccess(t("attendance.checkedIn"));
                  setTimeout(() => {
                    onClose();
                  }, 1000);
                } catch (err: any) {
                  setError(err.message || t("attendance.invalidQR"));
                }
              }
            }}
          >
            <option value="" disabled>
              {t("attendance.chooseParticipant")}
            </option>
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </Dialog>
  );
}

export function AttendancePage() {
  const { t } = useTranslation();
  const { sessions, fetch: fetchSessions } = useSessions();
  const { registrations } = useRegistrations();
  const { users, fetch: fetchUsers } = useUsers();
  const { events } = useEvents();
  const { records, isPresent, toggle, fetch: fetchAttendance } = useAttendance();

  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    fetchSessions();
    fetchUsers();
    fetchAttendance();
  }, [fetchSessions, fetchUsers, fetchAttendance]);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);
  const eventTitle = (id: string) => events.find((e) => e.id === id)?.title ?? "—";

  // Approved participants for the event of selected session
  const approvedParticipantIds = useMemo(() => {
    if (!selectedSession) return new Set<string>();
    const eventId = selectedSession.eventId;
    return new Set(
      registrations
        .filter((r) => r.eventId === eventId && r.status === "approved")
        .map((r) => r.participantId)
    );
  }, [registrations, selectedSession]);

  const participants = useMemo(() => {
    return users.filter((u) => u.role === "participant" && approvedParticipantIds.has(u.id));
  }, [users, approvedParticipantIds]);

  const presentCount = useMemo(() => {
    if (!selectedSessionId) return 0;
    return participants.filter((p) => isPresent(selectedSessionId, p.id)).length;
  }, [participants, selectedSessionId, isPresent, records]);

  const handleScan = async (participantId: string) => {
    const participant = participants.find((p) => p.id === participantId);
    if (!participant) {
      throw new Error(t("attendance.invalidQR"));
    }
    if (isPresent(selectedSessionId, participantId)) {
      throw new Error(t("attendance.alreadyPresent"));
    }
    await toggle(selectedSessionId, participantId, "qr");
  };

  return (
    <div>
      <PageHeader
        title={t("attendance.title")}
        description={t("attendance.subtitle")}
        action={
          selectedSession && participants.length > 0 && (
            <Button onClick={() => setScannerOpen(true)}>
              <QrCode className="h-4 w-4" />
              {t("attendance.scanQR")}
            </Button>
          )
        }
      />

      <Card className="mb-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="session">{t("attendance.selectSession")}</Label>
            <Select id="session" value={selectedSessionId} onChange={(e) => setSelectedSessionId(e.target.value)}>
              <option value="">—</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({eventTitle(s.eventId)})
                </option>
              ))}
            </Select>
          </div>
          {selectedSession && (
            <div className="text-sm text-muted-foreground">
              {t("attendance.presentCount", { present: presentCount, total: participants.length })}
            </div>
          )}
        </div>
      </Card>

      {!selectedSession ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
          <CalendarCheck className="h-10 w-10" />
          <p className="font-medium text-foreground">{t("attendance.noSessions")}</p>
        </Card>
      ) : participants.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
          <Users className="h-10 w-10" />
          <p className="font-medium text-foreground">{t("attendance.noParticipants")}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {participants.map((p, i) => {
            const present = isPresent(selectedSessionId, p.id);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.02 }}
              >
                <Card className={cn("flex items-center justify-between p-4", present && "border-emerald-500/30 bg-emerald-500/5")}>
                  <div className="flex items-center gap-3">
                    <Avatar name={p.fullName} className="h-10 w-10" />
                    <div>
                      <p className="font-medium">{p.fullName}</p>
                      <p className="text-xs text-muted-foreground">{p.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={present ? "default" : "outline"}
                    onClick={() => toggle(selectedSessionId, p.id)}
                    className={cn(present ? "bg-emerald-600 hover:bg-emerald-500" : "")}
                  >
                    {present ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    <span className="ms-2">{present ? t("attendance.present") : t("attendance.absent")}</span>
                  </Button>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {scannerOpen && (
        <QrScannerDialog
          open={scannerOpen}
          onClose={() => setScannerOpen(false)}
          onScan={handleScan}
          participants={participants}
          t={t}
        />
      )}
    </div>
  );
}
