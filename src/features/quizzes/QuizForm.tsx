import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useEvents } from "@/stores/events";
import type { Quiz } from "@/types";
import type { QuizInput } from "@/stores/quizzes";

const schema = z.object({
  title: z.string().min(1, "titleRequired"),
  eventId: z.string().min(1, "eventRequired"),
  description: z.string().optional(),
  questionsCount: z.coerce.number().int().min(0).default(0),
});

type FormValues = z.infer<typeof schema>;

export function QuizForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Quiz;
  onSubmit: (values: QuizInput) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const { events } = useEvents();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? "",
      eventId: initial?.eventId ?? "",
      description: initial?.description ?? "",
      questionsCount: initial?.questionsCount ?? 0,
    },
  });

  const err = (key?: string) => (key ? t(`quizzes.errors.${key}`) : undefined);

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v))} className="space-y-4">
      <div>
        <Label htmlFor="title">{t("quizzes.fields.title")}</Label>
        <Input id="title" {...register("title")} />
        {errors.title && <p className="mt-1 text-xs text-red-400">{err(errors.title.message)}</p>}
      </div>
      <div>
        <Label htmlFor="eventId">{t("quizzes.fields.event")}</Label>
        <Select id="eventId" {...register("eventId")} defaultValue="">
          <option value="" disabled>—</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </Select>
        {errors.eventId && <p className="mt-1 text-xs text-red-400">{err(errors.eventId.message)}</p>}
      </div>
      <div>
        <Label htmlFor="description">{t("quizzes.fields.description")}</Label>
        <Textarea id="description" {...register("description")} />
      </div>
      <div>
        <Label htmlFor="questionsCount">{t("quizzes.fields.questionsCount")}</Label>
        <Input id="questionsCount" type="number" min={0} {...register("questionsCount")} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>{t("common.cancel")}</Button>
        <Button type="submit" disabled={isSubmitting}>{t("common.save")}</Button>
      </div>
    </form>
  );
}
