import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Plus, Search, Pencil, Trash2, FileQuestion, HelpCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { QuizForm } from "./QuizForm";
import { useQuizzes, type QuizInput } from "@/stores/quizzes";
import { useEvents } from "@/stores/events";
import type { Quiz } from "@/types";

export function QuizzesPage({ readOnly = false }: { readOnly?: boolean }) {
  const { t } = useTranslation();
  const { quizzes, add, update, remove } = useQuizzes();
  const { events } = useEvents();

  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Quiz | null>(null);
  const [deleting, setDeleting] = useState<Quiz | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return quizzes.filter((qz) => {
      const matchesQuery = qz.title.toLowerCase().includes(q);
      const matchesEvent = eventFilter === "all" || qz.eventId === eventFilter;
      return matchesQuery && matchesEvent;
    });
  }, [quizzes, query, eventFilter]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (qz: Quiz) => { setEditing(qz); setFormOpen(true); };
  const handleSubmit = (values: QuizInput) => {
    if (editing) update(editing.id, values); else add(values);
    setFormOpen(false); setEditing(null);
  };

  return (
    <div>
      <PageHeader
        title={t("quizzes.title")}
        description={t("quizzes.subtitle")}
        action={!readOnly && (
          <Button onClick={openCreate}><Plus className="h-4 w-4" />{t("quizzes.new")}</Button>
        )}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("quizzes.searchPlaceholder")} className="ps-9" />
        </div>
        <div className="sm:w-56">
          <Select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
            <option value="all">{t("materials.allEvents")}</option>
            {events.map((e) => (<option key={e.id} value={e.id}>{e.title}</option>))}
          </Select>
        </div>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">{t("quizzes.count", { count: filtered.length })}</p>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
          <HelpCircle className="h-10 w-10" />
          <p className="font-medium text-foreground">{quizzes.length === 0 ? t("quizzes.empty") : t("quizzes.noResults")}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((qz, i) => (
            <motion.div key={qz.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.03 }}>
              <Card className="group h-full">
                <div className="flex h-full flex-col p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-glow-sm">
                      <FileQuestion className="h-5 w-5" />
                    </div>
                    {!readOnly && (
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(qz)} title={t("common.edit")}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleting(qz)} title={t("common.delete")} className="text-red-400 hover:bg-red-500/10 hover:text-red-300"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold">{qz.title}</h3>
                  {qz.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{qz.description}</p>}
                  <p className="mt-auto pt-3 text-sm text-violet-300">{t("quizzes.questions", { count: qz.questionsCount })}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} title={editing ? t("quizzes.edit") : t("quizzes.create")}>
        <QuizForm initial={editing ?? undefined} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} />
      </Dialog>

      <Dialog open={!!deleting} onClose={() => setDeleting(null)} title={t("quizzes.deleteTitle")} description={deleting ? t("quizzes.deleteConfirm", { title: deleting.title }) : ""} className="max-w-md">
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => setDeleting(null)}>{t("common.cancel")}</Button>
          <Button variant="destructive" onClick={() => { if (deleting) remove(deleting.id); setDeleting(null); }}><Trash2 className="h-4 w-4" />{t("common.delete")}</Button>
        </div>
      </Dialog>
    </div>
  );
}
