import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { EventItem, EventStatus } from "@/types";
import type { EventInput } from "@/stores/events";

const STATUSES: EventStatus[] = ["draft", "published", "ongoing", "completed", "cancelled"];

const schema = z
  .object({
    title: z.string().min(1, "titleRequired"),
    description: z.string().optional(),
    startDate: z.string().min(1, "datesRequired"),
    endDate: z.string().min(1, "datesRequired"),
    status: z.enum(["draft", "published", "ongoing", "completed", "cancelled"]),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "endBeforeStart",
    path: ["endDate"],
  });

type FormValues = z.infer<typeof schema>;

export function EventForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: EventItem;
  onSubmit: (values: EventInput) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      startDate: initial?.startDate ?? "",
      endDate: initial?.endDate ?? "",
      status: initial?.status ?? "draft",
    },
  });

  const err = (key?: string) => (key ? t(`events.errors.${key}`) : undefined);

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v))} className="space-y-4">
      <div>
        <Label htmlFor="title">{t("events.fields.title")}</Label>
        <Input id="title" {...register("title")} placeholder={t("events.fields.title")} />
        {errors.title && <p className="mt-1 text-xs text-red-400">{err(errors.title.message)}</p>}
      </div>

      <div>
        <Label htmlFor="description">{t("events.fields.description")}</Label>
        <Textarea id="description" {...register("description")} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="startDate">{t("events.fields.startDate")}</Label>
          <Input id="startDate" type="date" {...register("startDate")} />
          {errors.startDate && (
            <p className="mt-1 text-xs text-red-400">{err(errors.startDate.message)}</p>
          )}
        </div>
        <div>
          <Label htmlFor="endDate">{t("events.fields.endDate")}</Label>
          <Input id="endDate" type="date" {...register("endDate")} />
          {errors.endDate && (
            <p className="mt-1 text-xs text-red-400">{err(errors.endDate.message)}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="status">{t("events.fields.status")}</Label>
        <Select id="status" {...register("status")}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`status.${s}`)}
            </option>
          ))}
        </Select>
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
