import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useEvents } from "@/stores/events";
import { useVenues } from "@/stores/venues";
import type { Session } from "@/types";
import type { SessionInput } from "@/stores/sessions";

const schema = z
  .object({
    title: z.string().min(1, "titleRequired"),
    eventId: z.string().min(1, "eventRequired"),
    venueId: z.string().optional(),
    startsAt: z.string().min(1, "timeRequired"),
    endsAt: z.string().min(1, "timeRequired"),
    capacity: z.coerce.number().int().min(0).optional(),
  })
  .refine((d) => d.endsAt >= d.startsAt, { message: "endBeforeStart", path: ["endsAt"] });

type FormValues = z.infer<typeof schema>;

export function SessionForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Session;
  onSubmit: (values: SessionInput) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const { events } = useEvents();
  const { venues } = useVenues();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? "",
      eventId: initial?.eventId ?? "",
      venueId: initial?.venueId ?? "",
      startsAt: initial?.startsAt ?? "",
      endsAt: initial?.endsAt ?? "",
      capacity: initial?.capacity,
    },
  });

  const err = (key?: string) => (key ? t(`sessions.errors.${key}`) : undefined);

  return (
    <form
      onSubmit={handleSubmit((v) =>
        onSubmit({
          title: v.title,
          eventId: v.eventId,
          venueId: v.venueId || undefined,
          startsAt: v.startsAt,
          endsAt: v.endsAt,
          capacity: v.capacity,
        }),
      )}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="title">{t("sessions.fields.title")}</Label>
        <Input id="title" {...register("title")} placeholder={t("sessions.fields.title")} />
        {errors.title && <p className="mt-1 text-xs text-red-400">{err(errors.title.message)}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="eventId">{t("sessions.fields.event")}</Label>
          <Select id="eventId" {...register("eventId")} defaultValue="">
            <option value="" disabled>
              —
            </option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </Select>
          {errors.eventId && <p className="mt-1 text-xs text-red-400">{err(errors.eventId.message)}</p>}
        </div>
        <div>
          <Label htmlFor="venueId">{t("sessions.fields.venue")}</Label>
          <Select id="venueId" {...register("venueId")}>
            <option value="">{t("sessions.noVenue")}</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="startsAt">{t("sessions.fields.startsAt")}</Label>
          <Input id="startsAt" type="datetime-local" {...register("startsAt")} />
          {errors.startsAt && <p className="mt-1 text-xs text-red-400">{err(errors.startsAt.message)}</p>}
        </div>
        <div>
          <Label htmlFor="endsAt">{t("sessions.fields.endsAt")}</Label>
          <Input id="endsAt" type="datetime-local" {...register("endsAt")} />
          {errors.endsAt && <p className="mt-1 text-xs text-red-400">{err(errors.endsAt.message)}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="capacity">{t("sessions.fields.capacity")}</Label>
        <Input id="capacity" type="number" min={0} {...register("capacity")} />
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
