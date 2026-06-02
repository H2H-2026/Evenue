import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useAssessmentCenters } from "@/stores/assessmentCenters";
import { useAuth } from "@/stores/auth";
import type { AssessmentCenter } from "@/types";

const schema = z.object({
  name: z.string().min(1, "اسم المركز مطلوب"),
  description: z.string().optional(),
  startDate: z.string().min(1, "تاريخ البداية مطلوب"),
  endDate: z.string().min(1, "تاريخ النهاية مطلوب"),
  status: z.enum(["draft", "active", "completed", "cancelled"]),
  maxAssessors: z.number().min(1, "عدد المقيّمين يجب أن يكون على الأقل 1"),
  maxCandidates: z.number().min(1, "عدد المرشحين يجب أن يكون على الأقل 1"),
  location: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  center?: AssessmentCenter;
  onClose: () => void;
}

export function AssessmentCenterForm({ center, onClose }: Props) {
  const { add, update, loading } = useAssessmentCenters();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: center
      ? {
          name: center.name,
          description: center.description,
          startDate: center.startDate,
          endDate: center.endDate,
          status: center.status,
          maxAssessors: center.maxAssessors,
          maxCandidates: center.maxCandidates,
          location: center.location,
        }
      : {
          status: "draft",
          maxAssessors: 5,
          maxCandidates: 15,
        },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      if (center) {
        await update(center.id, { ...data, createdBy: center.createdBy });
      } else {
        await add({ ...data, createdBy: user?.id });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "حدث خطأ");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-auto rounded-2xl border border-white/10 bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {center ? "تعديل مركز التقييم" : "مركز تقييم جديد"}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">اسم المركز *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="مثال: مركز تقييم القيادات التنفيذية"
            />
            {errors.name && (
              <p className="text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="وصف مختصر للمركز وأهدافه"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">تاريخ البداية *</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
              {errors.startDate && (
                <p className="text-sm text-red-400">{errors.startDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">تاريخ النهاية *</Label>
              <Input id="endDate" type="date" {...register("endDate")} />
              {errors.endDate && (
                <p className="text-sm text-red-400">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">الحالة</Label>
            <Select id="status" {...register("status")}>
              <option value="draft">مسودة</option>
              <option value="active">نشط</option>
              <option value="completed">مكتمل</option>
              <option value="cancelled">ملغي</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxAssessors">عدد المقيّمين *</Label>
              <Input
                id="maxAssessors"
                type="number"
                min={1}
                {...register("maxAssessors", { valueAsNumber: true })}
              />
              {errors.maxAssessors && (
                <p className="text-sm text-red-400">{errors.maxAssessors.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxCandidates">عدد المرشحين *</Label>
              <Input
                id="maxCandidates"
                type="number"
                min={1}
                {...register("maxCandidates", { valueAsNumber: true })}
              />
              {errors.maxCandidates && (
                <p className="text-sm text-red-400">{errors.maxCandidates.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">الموقع</Label>
            <Input
              id="location"
              {...register("location")}
              placeholder="مثال: الرياض - مركز التدريب الرئيسي"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-primary to-violet-500"
            >
              {loading ? "جاري الحفظ..." : center ? "حفظ التغييرات" : "إنشاء المركز"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
