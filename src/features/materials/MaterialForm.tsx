import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useEvents } from "@/stores/events";
import { useMaterials } from "@/stores/materials";
import type { Material, MaterialType } from "@/types";
import type { MaterialInput } from "@/stores/materials";

const TYPES: MaterialType[] = ["link", "file", "video"];

const schema = z.object({
  title: z.string().min(1, "titleRequired"),
  eventId: z.string().min(1, "eventRequired"),
  type: z.enum(["link", "file", "video"]),
  url: z.string().min(1, "urlRequired"),
  access: z.enum(["public", "restricted"]),
});

type FormValues = z.infer<typeof schema>;

export function MaterialForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Material;
  onSubmit: (values: MaterialInput) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const { events } = useEvents();
  const { uploadFile } = useMaterials();
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? "",
      eventId: initial?.eventId ?? "",
      type: initial?.type ?? "link",
      url: initial?.url ?? "",
      access: initial?.access ?? "public",
    },
  });

  const selectedType = watch("type");
  const currentUrl = watch("url");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const publicUrl = await uploadFile(file);
      setValue("url", publicUrl, { shouldValidate: true });
    } catch (err) {
      console.error("Upload failed:", err);
      alert(t("materials.uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  const err = (key?: string) => (key ? t(`materials.errors.${key}`) : undefined);

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v))} className="space-y-4">
      <div>
        <Label htmlFor="title">{t("materials.fields.title")}</Label>
        <Input id="title" {...register("title")} />
        {errors.title && <p className="mt-1 text-xs text-red-400">{err(errors.title.message)}</p>}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="eventId">{t("materials.fields.event")}</Label>
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
          <Label htmlFor="type">{t("materials.fields.type")}</Label>
          <Select id="type" {...register("type")}>
            {TYPES.map((ty) => (
              <option key={ty} value={ty}>
                {t(`materials.types.${ty}`)}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="url">{t("materials.fields.url")}</Label>
        {selectedType === "file" ? (
          <div className="flex flex-col gap-2">
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              disabled={uploading}
              className="cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-violet-500/10 file:text-violet-400 hover:file:bg-violet-500/20"
            />
            {uploading && (
              <p className="text-sm text-violet-400 flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
                {t("materials.uploading")}
              </p>
            )}
            {currentUrl && !uploading && (
              <p className="text-xs text-green-400 truncate">
                {t("materials.uploaded")}: {currentUrl}
              </p>
            )}
            <input type="hidden" {...register("url")} />
          </div>
        ) : (
          <Input id="url" {...register("url")} placeholder={selectedType === "video" ? "https://youtube.com/..." : "https://..."} />
        )}
        {errors.url && <p className="mt-1 text-xs text-red-400">{err(errors.url.message)}</p>}
      </div>
      <div>
        <Label htmlFor="access">{t("materials.fields.access") || "صلاحية الوصول للمادة"}</Label>
        <Select id="access" {...register("access")}>
          <option value="public">
            {t("materials.access.public") || "عام / مفتوح المصدر (يمكن للجميع القراءة والتحميل)"}
          </option>
          <option value="restricted">
            {t("materials.access.restricted") || "مقيد / محمي (قراءة تفاعلية + علامة مائية + طباعة مقفلة)"}
          </option>
        </Select>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting || uploading}>
          {t("common.save")}
        </Button>
      </div>
    </form>
  );
}
