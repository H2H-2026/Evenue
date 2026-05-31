import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { Profile, UserRole } from "@/types";
import type { UserInput } from "@/stores/users";

const ROLES: UserRole[] = ["admin", "trainer", "participant"];

const schema = z.object({
  fullName: z.string().min(1, "nameRequired"),
  email: z.string().min(1, "emailRequired").email("emailInvalid"),
  role: z.enum(["admin", "trainer", "participant"]),
});

type FormValues = z.infer<typeof schema>;

export function UserForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Profile;
  onSubmit: (values: UserInput) => void;
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
      fullName: initial?.fullName ?? "",
      email: initial?.email ?? "",
      role: initial?.role ?? "participant",
    },
  });

  const err = (key?: string) => (key ? t(`users.errors.${key}`) : undefined);

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v))} className="space-y-4">
      <div>
        <Label htmlFor="fullName">{t("users.fields.name")}</Label>
        <Input id="fullName" {...register("fullName")} />
        {errors.fullName && <p className="mt-1 text-xs text-red-400">{err(errors.fullName.message)}</p>}
      </div>
      <div>
        <Label htmlFor="email">{t("users.fields.email")}</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && <p className="mt-1 text-xs text-red-400">{err(errors.email.message)}</p>}
      </div>
      <div>
        <Label htmlFor="role">{t("users.fields.role")}</Label>
        <Select id="role" {...register("role")}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {t(`roles.${r}`)}
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
