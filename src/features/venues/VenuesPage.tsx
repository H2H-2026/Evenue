import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Plus, Search, Pencil, Trash2, MapPin, Building2, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { VenueForm } from "./VenueForm";
import { useVenues, type VenueInput } from "@/stores/venues";
import type { Venue } from "@/types";

export function VenuesPage() {
  const { t } = useTranslation();
  const { venues, add, update, remove } = useVenues();

  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Venue | null>(null);
  const [deleting, setDeleting] = useState<Venue | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return venues.filter(
      (v) => v.name.toLowerCase().includes(q) || (v.city ?? "").toLowerCase().includes(q),
    );
  }, [venues, query]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (v: Venue) => {
    setEditing(v);
    setFormOpen(true);
  };
  const handleSubmit = (values: VenueInput) => {
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
        title={t("venues.title")}
        description={t("venues.subtitle")}
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {t("venues.new")}
          </Button>
        }
      />

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("venues.searchPlaceholder")}
          className="ps-9"
        />
      </div>

      <p className="mb-3 text-sm text-muted-foreground">{t("venues.count", { count: filtered.length })}</p>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
          <Building2 className="h-10 w-10" />
          <div>
            <p className="font-medium text-foreground">
              {venues.length === 0 ? t("venues.empty") : t("venues.noResults")}
            </p>
            {venues.length === 0 && <p className="text-sm">{t("venues.emptyHint")}</p>}
          </div>
          {venues.length === 0 && (
            <Button onClick={openCreate} variant="outline">
              <Plus className="h-4 w-4" />
              {t("venues.create")}
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
            >
              <Card className="group h-full">
                <div className="flex h-full flex-col p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#7CC4A4] to-[#5BA882] text-white shadow-glow-sm">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(v)} title={t("common.edit")}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleting(v)}
                        title={t("common.delete")}
                        className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold">{v.name}</h3>
                  {(v.city || v.address) && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {[v.city, v.address].filter(Boolean).join(" — ")}
                    </p>
                  )}
                  {v.capacity != null && (
                    <p className="mt-auto flex items-center gap-1.5 pt-3 text-sm text-[#7CC4A4]/70">
                      <Users className="h-4 w-4" />
                      {v.capacity}
                    </p>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? t("venues.edit") : t("venues.create")}
      >
        <VenueForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
        />
      </Dialog>

      <Dialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={t("venues.deleteTitle")}
        description={deleting ? t("venues.deleteConfirm", { name: deleting.name }) : ""}
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
