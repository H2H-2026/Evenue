import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useEvents } from "@/stores/events";
import type { FeedbackInput } from "@/stores/feedback";
import { cn } from "@/lib/utils";

const schema = z.object({
  eventId: z.string().min(1, "eventRequired"),
  rating: z.coerce.number().int().min(1, "ratingRequired").max(5),
  comment: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

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

  const [hovered, setHovered] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      eventId: "",
      rating: 0,
      comment: "",
    },
  });

  const rating = watch("rating");

  const submitForm = (v: FormValues) => {
    onSubmit({
      eventId: v.eventId,
      participantId,
      rating: v.rating,
      comment: v.comment?.trim() || undefined,
    });
  };

  const err = (key?: string) => {
    if (!key) return undefined;
    return t(`feedback.errors.${key}`) || key;
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
      <div>
        <Label htmlFor="eventId">{t("feedback.fields.event")}</Label>
        <Select id="eventId" {...register("eventId")}>
          <option value="">—</option>
          {events
            .filter((e) => e.status === "ongoing" || e.status === "completed")
            .map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
        </Select>
        {errors.eventId && <p className="mt-1 text-xs text-red-400">{err(errors.eventId.message)}</p>}
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
              onClick={() => setValue("rating", i, { shouldValidate: true })}
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
        {errors.rating && <p className="mt-1 text-xs text-red-400">{err(errors.rating.message)}</p>}
      </div>

      <div>
        <Label htmlFor="comment">{t("feedback.fields.comment")}</Label>
        <Textarea
          id="comment"
          {...register("comment")}
          placeholder={t("feedback.fields.commentPlaceholder")}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {t("common.save")}
        </Button>
      </div>
    </form>
  );
}
