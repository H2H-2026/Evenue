import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Plus, Search, Pencil, Trash2, Clock, CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { SessionForm } from "./SessionForm";
import { useSessions, type SessionInput } from "@/stores/sessions";
import { useEvents } from "@/stores/events";
import { useVenues } from "@/stores/venues";
import type { Session } from "@/types";

function formatDateTime(value: string, locale: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(locale === "ar" ? "ar-EG" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SessionsPage() {
  const { t, i18n } = useTranslation();
  const { sessions, add, update, remove } = useSessions();
  const { events } = useEvents();
  const { venues } = useVenues();

  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Session | null>(null);
  const [deleting, setDeleting] = useState<Session | null>(null);

  const eventTitle = (id: string) => events.find((e) => e.id === id)?.title ?? "—";
  const venueName = (id?: string) => venues.find((v) => v.id === id)?.name ?? t("sessions.noVenue");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sessions.filter((s) => {
      const matchesQuery = s.title.toLowerCase().includes(q);
      const matchesEvent = eventFilter === "all" || s.eventId === eventFilter;
      return matchesQuery && matchesEvent;
    });
  }, [sessions, query, eventFilter]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (s: Session) => {
    setEditing(s);
    setFormOpen(true);
  };
  const handleSubmit = (values: SessionInput) => {
    if (editing) update(editing.id, values);
    else add(values);
    setFormOpen(false);
    setEditing(null);
  };
  const confirmDelete = () => {
    if (deleting) remove(deleting.id);
    setDeleting(null);
  };

  return (
    <div>
      <PageHeader
        title={t("sessions.title")}
        description={t("sessions.subtitle")}
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {t("sessions.new")}
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("sessions.searchPlaceholder")}
            className="ps-9"
          />
        </div>
        <div className="sm:w-56">
          <Select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
            <option value="all">{t("sessions.allEvents")}</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">{t("sessions.count", { count: filtered.length })}</p>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
          <CalendarClock className="h-10 w-10" />
          <div>
            <p className="font-medium text-foreground">
              {sessions.length === 0 ? t("sessions.empty") : t("sessions.noResults")}
            </p>
            {sessions.length === 0 && <p className="text-sm">{t("sessions.emptyHint")}</p>}
          </div>
          {sessions.length === 0 && (
            <Button onClick={openCreate} variant="outline">
              <Plus className="h-4 w-4" />
              {t("sessions.create")}
            </Button>
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 text-start font-semibold">{t("sessions.columns.title")}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t("sessions.columns.event")}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t("sessions.columns.time")}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t("sessions.columns.venue")}</th>
                  <th className="px-5 py-3 text-end font-semibold">{t("sessions.columns.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.03 }}
                    className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-4 font-medium text-foreground">{s.title}</td>
                    <td className="px-5 py-4 text-muted-foreground">{eventTitle(s.eventId)}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {formatDateTime(s.startsAt, i18n.language)} — {formatDateTime(s.endsAt, i18n.language)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-violet-500/15 px-2.5 py-1 text-xs font-medium text-violet-300">
                        {venueName(s.venueId)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(s)} title={t("common.edit")}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleting(s)}
                          title={t("common.delete")}
                          className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? t("sessions.edit") : t("sessions.create")}
      >
        <SessionForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
        />
      </Dialog>

      <Dialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={t("sessions.deleteTitle")}
        description={deleting ? t("sessions.deleteConfirm", { title: deleting.title }) : ""}
        className="max-w-md"
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => setDeleting(null)}>
            {t("common.cancel")}
          </Button>
          <Button variant="destructive" onClick={confirmDelete}>
            <Trash2 className="h-4 w-4" />
            {t("common.delete")}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
