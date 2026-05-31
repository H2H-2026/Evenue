import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Plus, Star, Trash2, MessageSquare, Inbox } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { FeedbackForm } from "./FeedbackForm";
import { useFeedback, type FeedbackInput } from "@/stores/feedback";
import { useUsers } from "@/stores/users";
import { useEvents } from "@/stores/events";
import { useAuth } from "@/stores/auth";
import { useToast } from "@/stores/toast";

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= value ? "fill-amber-400 text-amber-400" : "text-white/15"}`}
        />
      ))}
    </div>
  );
}

export function FeedbackPage({
  participantId,
}: {
  participantId?: string;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { items, fetch: fetchFeedback, add, remove } = useFeedback();
  const { users } = useUsers();
  const { events } = useEvents();

  const toast = useToast();

  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const userName = (id: string) => users.find((u) => u.id === id)?.fullName ?? "—";
  const eventTitle = (id: string) => events.find((e) => e.id === id)?.title ?? "—";

  // فلترة حسب الدور
  const filtered = useMemo(() => {
    if (participantId) return items.filter((f) => f.participantId === participantId);
    // TODO: Trainer sees feedback for their sessions
    return items;
  }, [items, participantId]);

  // حساب المتوسط
  const avgRating = useMemo(() => {
    if (filtered.length === 0) return 0;
    return +(filtered.reduce((sum, f) => sum + f.rating, 0) / filtered.length).toFixed(1);
  }, [filtered]);

  const handleSubmit = async (values: FeedbackInput) => {
    await add(values);
    toast.success(t("toast.addSuccess"));
    setFormOpen(false);
  };

  const canAdd = !!participantId || user?.role === "participant";
  const canDelete = user?.role === "admin";

  return (
    <div>
      <PageHeader
        title={t("feedback.title")}
        description={t("feedback.subtitle")}
        action={
          canAdd && (
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("feedback.new")}
            </Button>
          )
        }
      />

      {/* ملخص */}
      <Card className="mb-6 flex items-center gap-4 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-glow-sm">
          <Star className="h-6 w-6" />
        </div>
        <div>
          <p className="text-2xl font-bold">{avgRating || "—"}</p>
          <p className="text-sm text-muted-foreground">
            {t("feedback.avgRating")} · {t("feedback.count", { count: filtered.length })}
          </p>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
          <Inbox className="h-10 w-10" />
          <p className="font-medium text-foreground">{t("feedback.empty")}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
            >
              <Card className="group p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar name={userName(f.participantId)} className="h-10 w-10" />
                    <div>
                      <p className="font-medium">{userName(f.participantId)}</p>
                      <p className="text-xs text-muted-foreground">{eventTitle(f.eventId)}</p>
                      <Stars value={f.rating} />
                      {f.comment && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          <MessageSquare className="me-1 inline h-3.5 w-3.5" />
                          {f.comment}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-white/30">{f.createdAt}</p>
                    </div>
                  </div>
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(f.id)}
                      className="text-red-400 opacity-0 transition-opacity hover:bg-red-500/10 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
        title={t("feedback.new")}
      >
        <FeedbackForm
          participantId={participantId || user?.id || ""}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
        />
      </Dialog>
    </div>
  );
}
