import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Plus, Search, Download, Trash2, Award, FileBadge } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { useCertificates } from "@/stores/certificates";
import { useUsers } from "@/stores/users";
import { useEvents } from "@/stores/events";
import { useRegistrations } from "@/stores/registrations";

export function CertificatesPage({ readOnly = false, participantId }: { readOnly?: boolean; participantId?: string }) {
  const { t } = useTranslation();
  const { certificates, issue, remove } = useCertificates();
  const { users } = useUsers();
  const { events } = useEvents();
  const { registrations } = useRegistrations();

  useEffect(() => {
    certificates.length === 0 && useCertificates.getState().fetch?.();
  }, []);

  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newParticipant, setNewParticipant] = useState("");
  const [newEvent, setNewEvent] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  // For admin: show all; for participant: filter by participantId
  const filtered = useMemo(() => {
    let list = certificates;
    if (participantId) list = list.filter((c) => c.participantId === participantId);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((c) =>
        c.code.toLowerCase().includes(q) ||
        users.find((u) => u.id === c.participantId)?.fullName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [certificates, participantId, query, users]);

  const userName = (id: string) => users.find((u) => u.id === id)?.fullName ?? "—";
  const eventTitle = (id: string) => events.find((e) => e.id === id)?.title ?? "—";

  // Participants with approved registrations (eligible for certificates)
  const approvedParticipants = useMemo(() => {
    const approvedIds = new Set(registrations.filter((r) => r.status === "approved").map((r) => r.participantId));
    return users.filter((u) => u.role === "participant" && approvedIds.has(u.id));
  }, [users, registrations]);

  const handleIssue = () => {
    if (!newParticipant) return setAddError(t("certificates.errors.participantRequired"));
    if (!newEvent) return setAddError(t("certificates.errors.eventRequired"));
    issue({ participantId: newParticipant, eventId: newEvent });
    setAddOpen(false);
    setNewParticipant("");
    setNewEvent("");
    setAddError(null);
  };

  return (
    <div>
      <PageHeader
        title={t("certificates.title")}
        description={t("certificates.subtitle")}
        action={!readOnly && (
          <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" />{t("certificates.issue")}</Button>
        )}
      />

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("materials.searchPlaceholder")} className="ps-9" />
      </div>

      <p className="mb-3 text-sm text-muted-foreground">{t("certificates.count", { count: filtered.length })}</p>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
          <Award className="h-10 w-10" />
          <p className="font-medium text-foreground">{certificates.length === 0 ? t("certificates.empty") : t("certificates.noResults")}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.03 }}>
              <Card className="group h-full">
                <div className="flex h-full flex-col p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow-sm">
                      <FileBadge className="h-5 w-5" />
                    </div>
                    {!readOnly && (
                      <Button variant="ghost" size="icon" onClick={() => remove(c.id)} className="text-red-400 hover:bg-red-500/10 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("certificates.code")}</p>
                  <h3 className="text-lg font-bold">{c.code}</h3>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p><span className="text-foreground">{t("certificates.columns.participant")}:</span> {userName(c.participantId)}</p>
                    <p><span className="text-foreground">{t("certificates.columns.event")}:</span> {eventTitle(c.eventId)}</p>
                    <p className="mt-1 text-xs">{c.issuedAt}</p>
                  </div>
                  <Button variant="outline" size="sm" className="mt-auto" onClick={() => alert(t("certificates.download") + ": " + c.code)}>
                    <Download className="h-4 w-4" /><span className="ms-2">{t("certificates.download")}</span>
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {!readOnly && (
        <Dialog open={addOpen} onClose={() => setAddOpen(false)} title={t("certificates.issueTitle")}>
          <div className="space-y-4">
            <div>
              <Label>{t("certificates.fields.participant")}</Label>
              <Select value={newParticipant} onChange={(e) => setNewParticipant(e.target.value)}>
                <option value="">—</option>
                {approvedParticipants.map((p) => (<option key={p.id} value={p.id}>{p.fullName}</option>))}
              </Select>
            </div>
            <div>
              <Label>{t("certificates.fields.event")}</Label>
              <Select value={newEvent} onChange={(e) => setNewEvent(e.target.value)}>
                <option value="">—</option>
                {events.map((e) => (<option key={e.id} value={e.id}>{e.title}</option>))}
              </Select>
            </div>
            {addError && <p className="text-xs text-red-400">{addError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setAddOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleIssue}>{t("common.save")}</Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
