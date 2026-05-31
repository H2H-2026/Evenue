import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useEvents } from "@/stores/events";
import type { FeedbackInput } from "@/stores/feedback";
import { cn } from "@/lib/utils";

export function FeedbackForm({
  participantId,
  onSubmit,
  onCancel,
}: {
  participantId: string;
  onSubmit: (values: FeedbackInput) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const { events } = useEvents();

  const [eventId, setEventId] = useState("");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!eventId) return setError(t("feedback.errors.eventRequired"));
    if (rating < 1) return setError(t("feedback.errors.ratingRequired"));
    onSubmit({
      eventId,
      participantId,
      rating,
      comment: comment.trim() || undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>{t("feedback.fields.event")}</Label>
        <Select value={eventId} onChange={(e) => setEventId(e.target.value)}>
          <option value="">—</option>
          {events
            .filter((e) => e.status === "ongoing" || e.status === "completed")
            .map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
        </Select>
      </div>

      <div>
        <Label>{t("feedback.fields.rating")}</Label>
        <div className="mt-1 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(i)}
              className="rounded p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "h-7 w-7 transition-colors",
                  i <= (hovered || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-white/15",
                )}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ms-2 text-sm font-medium text-amber-300">{rating}/5</span>
          )}
        </div>
      </div>

      <div>
        <Label>{t("feedback.fields.comment")}</Label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t("feedback.fields.commentPlaceholder")}
          rows={3}
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button onClick={handleSubmit}>{t("common.save")}</Button>
      </div>
    </div>
  );
}
