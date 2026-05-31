import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Plus, Search, Pencil, Trash2, CalendarRange, Inbox } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { EventForm } from "./EventForm";
import { useEvents, type EventInput } from "@/stores/events";
import { useToast } from "@/stores/toast";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import type { EventItem, EventStatus } from "@/types";

const STATUSES: EventStatus[] = ["draft", "published", "ongoing", "completed", "cancelled"];

export function EventsPage() {
  const { t } = useTranslation();
  const { events, add, update, remove, fetch, loading, error } = useEvents();
  const toast = useToast();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [deleting, setDeleting] = useState<EventItem | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => {
    fetch();
  }, [fetch]);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchesQuery = e.title.toLowerCase().includes(query.trim().toLowerCase());
      const matchesStatus = statusFilter === "all" || e.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [events, query, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (event: EventItem) => {
    setEditing(event);
    setFormOpen(true);
  };

  const handleSubmit = async (values: EventInput) => {
    if (editing) {
      await update(editing.id, values);
      toast.success(t("toast.updateSuccess"));
    } else {
      await add(values);
      toast.success(t("toast.addSuccess"));
    }
    setFormOpen(false);
    setEditing(null);
  };

  const confirmDelete = async () => {
    if (deleting) {
      await remove(deleting.id);
      toast.success(t("toast.deleteSuccess"));
    }
    setDeleting(null);
  };

  return (
    <div>
      <PageHeader
        title={t("events.title")}
        description={t("events.subtitle")}
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {t("events.new")}
          </Button>
        }
      />

      {/* شريط الأدوات */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("events.searchPlaceholder")}
            className="ps-9"
          />
        </div>
        <div className="sm:w-52">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as EventStatus | "all")}
          >
            <option value="all">{t("events.allStatuses")}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`status.${s}`)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {loading && events.length === 0 && <TableSkeleton rows={5} cols={4} />}

      {!loading && error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <p className="mb-3 text-sm text-muted-foreground">{t("events.count", { count: filtered.length })}</p>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
          <Inbox className="h-10 w-10" />
          <div>
            <p className="font-medium text-foreground">
              {events.length === 0 ? t("events.empty") : t("events.noResults")}
            </p>
            {events.length === 0 && <p className="text-sm">{t("events.emptyHint")}</p>}
          </div>
          {events.length === 0 && (
            <Button onClick={openCreate} variant="outline">
              <Plus className="h-4 w-4" />
              {t("events.create")}
            </Button>
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 text-start font-semibold">{t("events.columns.title")}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t("events.columns.dates")}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t("events.columns.status")}</th>
                  <th className="px-5 py-3 text-end font-semibold">{t("events.columns.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((e, i) => (
                  <motion.tr
                    key={e.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.03 }}
                    className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground">{e.title}</p>
                      {e.description && (
                        <p className="mt-0.5 max-w-md truncate text-xs text-muted-foreground">
                          {e.description}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarRange className="h-4 w-4" />
                        {e.startDate} — {e.endDate}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={e.status} label={t(`status.${e.status}`)} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(e)} title={t("common.edit")}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleting(e)}
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
          <Pagination page={page} totalPages={Math.ceil(filtered.length / PER_PAGE)} onPageChange={setPage} />
        </Card>
      )}

      {/* مودال إنشاء/تعديل */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? t("events.edit") : t("events.create")}
      >
        <EventForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
        />
      </Dialog>

      {/* تأكيد الحذف */}
      <Dialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={t("events.deleteTitle")}
        description={deleting ? t("events.deleteConfirm", { title: deleting.title }) : ""}
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
