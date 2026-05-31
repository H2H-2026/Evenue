import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Venue } from "@/types";
import type { VenueInput } from "@/stores/venues";

const schema = z.object({
  name: z.string().min(1, "nameRequired"),
  city: z.string().optional(),
  address: z.string().optional(),
  capacity: z.coerce.number().int().min(0).optional(),
});

type FormValues = z.infer<typeof schema>;

export function VenueForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Venue;
  onSubmit: (values: VenueInput) => void;
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
      name: initial?.name ?? "",
      city: initial?.city ?? "",
      address: initial?.address ?? "",
      capacity: initial?.capacity,
    },
  });

  const err = (key?: string) => (key ? t(`venues.errors.${key}`) : undefined);

  return (
    <form
      onSubmit={handleSubmit((v) =>
        onSubmit({
          name: v.name,
          city: v.city || undefined,
          address: v.address || undefined,
          capacity: v.capacity,
        }),
      )}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="name">{t("venues.fields.name")}</Label>
        <Input id="name" {...register("name")} placeholder={t("venues.fields.name")} />
        {errors.name && <p className="mt-1 text-xs text-red-400">{err(errors.name.message)}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="city">{t("venues.fields.city")}</Label>
          <Input id="city" {...register("city")} />
        </div>
        <div>
          <Label htmlFor="capacity">{t("venues.fields.capacity")}</Label>
          <Input id="capacity" type="number" min={0} {...register("capacity")} />
        </div>
      </div>

      <div>
        <Label htmlFor="address">{t("venues.fields.address")}</Label>
        <Input id="address" {...register("address")} />
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
