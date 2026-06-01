import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Plus, Search, Check, X, Trash2, ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { useRegistrations } from "@/stores/registrations";
import { useUsers } from "@/stores/users";
import { useEvents } from "@/stores/events";
import { cn } from "@/lib/utils";
import { useToast } from "@/stores/toast";
import { Pagination } from "@/components/ui/pagination";
import type { RegistrationStatus } from "@/types";

const schema = z.object({
  participantId: z.string().min(1, "participantRequired"),
  eventId: z.string().min(1, "eventRequired"),
});

type FormValues = z.infer<typeof schema>;

const STATUS_STYLES: Record<RegistrationStatus, string> = {
  pending: "bg-amber-500/15 text-amber-300",
  approved: "bg-emerald-500/15 text-emerald-300",
  rejected: "bg-red-500/15 text-red-300",
  cancelled: "bg-white/10 text-muted-foreground",
};

const STATUSES: RegistrationStatus[] = ["pending", "approved", "rejected", "cancelled"];

export function RegistrationsPage() {
  const { t } = useTranslation();
  const { registrations, add, setStatus, remove } = useRegistrations();
  const { users } = useUsers();
  const { events, fetch: fetchEvents } = useEvents();
  const toast = useToast();

  useEffect(() => {
    useRegistrations.getState().fetch?.();
    useUsers.getState().fetch?.();
    fetchEvents();
  }, [fetchEvents]);

  const participants = users.filter((u) => u.role === "participant");
  const userName = (id: string) => users.find((u) => u.id === id)?.fullName ?? "—";
  const eventTitle = (id: string) => events.find((e) => e.id === id)?.title ?? "—";

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | "all">("all");
  const [addOpen, setAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      participantId: "",
      eventId: "",
    },
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return registrations.filter((r) => {
      const matchesQuery = userName(r.participantId).toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registrations, query, statusFilter, users]);

  const onSubmit = (data: FormValues) => {
    add({ participantId: data.participantId, eventId: data.eventId, status: "pending" });
    toast.success(t("toast.addSuccess"));
    setAddOpen(false);
    reset();
  };

  return (
    <div>
      <PageHeader
        title={t("registrations.title")}
        description={t("registrations.subtitle")}
        action={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("registrations.new")}
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("registrations.searchPlaceholder")}
            className="ps-9"
          />
        </div>
        <div className="sm:w-52">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RegistrationStatus | "all")}
          >
            <option value="all">{t("registrations.allStatuses")}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`registrations.status.${s}`)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">
        {t("registrations.count", { count: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
          <ClipboardList className="h-10 w-10" />
          <p className="font-medium text-foreground">
            {registrations.length === 0 ? t("registrations.empty") : t("registrations.noResults")}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 text-start font-semibold">{t("registrations.columns.participant")}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t("registrations.columns.event")}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t("registrations.columns.status")}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t("registrations.columns.date")}</th>
                  <th className="px-5 py-3 text-end font-semibold">{t("registrations.columns.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE).map((r, i) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.03 }}
                    className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-4 font-medium text-foreground">{userName(r.participantId)}</td>
                    <td className="px-5 py-4 text-muted-foreground">{eventTitle(r.eventId)}</td>
                    <td className="px-5 py-4">
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", STATUS_STYLES[r.status])}>
                        {t(`registrations.status.${r.status}`)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{r.createdAt}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {r.status !== "approved" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setStatus(r.id, "approved"); toast.success(t("toast.updateSuccess")); }}
                            title={t("registrations.approve")}
                            className="text-emerald-400 hover:bg-emerald-500/10"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {r.status !== "rejected" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setStatus(r.id, "rejected"); toast.success(t("toast.updateSuccess")); }}
                            title={t("registrations.reject")}
                            className="text-amber-400 hover:bg-amber-500/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingId(r.id)}
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

      {/* إضافة تسجيل */}
      <Dialog open={addOpen} onClose={() => { setAddOpen(false); reset(); }} title={t("registrations.addTitle")}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="participant">{t("registrations.fields.participant")}</Label>
            <Select
              id="participant"
              {...register("participantId")}
            >
              <option value="">—</option>
              {participants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName}
                </option>
              ))}
            </Select>
            {errors.participantId && (
              <p className="mt-1 text-xs text-red-400">
                {t(`registrations.errors.${errors.participantId.message}`) || errors.participantId.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="event">{t("registrations.fields.event")}</Label>
            <Select id="event" {...register("eventId")}>
              <option value="">—</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </Select>
            {errors.eventId && (
              <p className="mt-1 text-xs text-red-400">
                {t(`registrations.errors.${errors.eventId.message}`) || errors.eventId.message}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => { setAddOpen(false); reset(); }}>
              {t("common.cancel")}
            </Button>
            <Button type="submit">{t("common.save")}</Button>
          </div>
        </form>
      </Dialog>

      {/* حذف */}
      <Dialog
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        title={t("registrations.deleteTitle")}
        description={t("registrations.deleteConfirm")}
        className="max-w-md"
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => setDeletingId(null)}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (deletingId) remove(deletingId);
              setDeletingId(null);
            }}
          >
            <Trash2 className="h-4 w-4" />
            {t("common.delete")}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
