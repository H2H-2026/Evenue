import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Plus, Search, Pencil, Trash2, ExternalLink, FileText, Link2, Video, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { MaterialForm } from "./MaterialForm";
import { useMaterials, type MaterialInput } from "@/stores/materials";
import { useEvents } from "@/stores/events";
import type { Material, MaterialType } from "@/types";

const TYPE_ICON: Record<MaterialType, typeof FileText> = {
  link: Link2,
  file: FileText,
  video: Video,
};

export function MaterialsPage({ readOnly = false }: { readOnly?: boolean }) {
  const { t } = useTranslation();
  const { materials, add, update, remove, fetch: fetchMaterials } = useMaterials();
  const { events, fetch: fetchEvents } = useEvents();

  useEffect(() => {
    fetchMaterials();
    fetchEvents();
  }, [fetchMaterials, fetchEvents]);

  const eventTitle = (id: string) => events.find((e) => e.id === id)?.title ?? "—";

  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [deleting, setDeleting] = useState<Material | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return materials.filter((m) => {
      const matchesQuery = m.title.toLowerCase().includes(q);
      const matchesEvent = eventFilter === "all" || m.eventId === eventFilter;
      return matchesQuery && matchesEvent;
    });
  }, [materials, query, eventFilter]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (m: Material) => {
    setEditing(m);
    setFormOpen(true);
  };
  const handleSubmit = (values: MaterialInput) => {
    if (editing) update(editing.id, values);
    else add(values);
    setFormOpen(false);
    setEditing(null);
  };

  return (
    <div>
      <PageHeader
        title={t("materials.title")}
        description={t("materials.subtitle")}
        action={
          !readOnly && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              {t("materials.new")}
            </Button>
          )
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("materials.searchPlaceholder")}
            className="ps-9"
          />
        </div>
        <div className="sm:w-56">
          <Select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
            <option value="all">{t("materials.allEvents")}</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">{t("materials.count", { count: filtered.length })}</p>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
          <BookOpen className="h-10 w-10" />
          <p className="font-medium text-foreground">
            {materials.length === 0 ? t("materials.empty") : t("materials.noResults")}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m, i) => {
            const Icon = TYPE_ICON[m.type];
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
              >
                <Card className="group h-full">
                  <div className="flex h-full flex-col p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-glow-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      {!readOnly && (
                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(m)} title={t("common.edit")}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleting(m)}
                            title={t("common.delete")}
                            className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold">{m.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{eventTitle(m.eventId)}</p>
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-medium text-violet-300 hover:text-violet-200"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {t("materials.open")}
                    </a>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? t("materials.edit") : t("materials.create")}
      >
        <MaterialForm initial={editing ?? undefined} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} />
      </Dialog>

      <Dialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={t("materials.deleteTitle")}
        description={deleting ? t("materials.deleteConfirm", { title: deleting.title }) : ""}
        className="max-w-md"
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => setDeleting(null)}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (deleting) remove(deleting.id);
              setDeleting(null);
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
