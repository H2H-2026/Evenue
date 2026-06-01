import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/stores/auth";
import { useToast } from "@/stores/toast";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Mail, Shield, User, Pencil, Save, X } from "lucide-react";

const schema = z.object({
  fullName: z.string().trim().min(1, "nameRequired"),
});

type FormValues = z.infer<typeof schema>;

export function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const [editing, setEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: user?.fullName ?? "",
    },
  });

  if (!user) return null;

  const handleSave = async (data: FormValues) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: data.fullName })
        .eq("id", user.id);
      if (error) {
        toast.error(t("profile.saveError"));
        return;
      }
    }

    useAuth.setState((s) => ({
      user: s.user ? { ...s.user, fullName: data.fullName } : s.user,
    }));

    setEditing(false);
    toast.success(t("profile.saved"));
  };

  const cancelEdit = () => {
    setEditing(false);
    reset({ fullName: user.fullName });
  };

  return (
    <div>
      <PageHeader title={t("topbar.profile")} description={t("profile.subtitle")} />

      <Card className="mx-auto max-w-xl p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Avatar name={user.fullName} className="h-20 w-20 text-2xl" />
          <div>
            {editing ? (
              <form onSubmit={handleSubmit(handleSave)} className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <Input
                    {...register("fullName")}
                    className="w-60 text-center"
                    autoFocus
                  />
                  <Button size="icon" type="submit" disabled={isSubmitting}>
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" type="button" onClick={cancelEdit}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-400">
                    {t(`profile.errors.${errors.fullName.message}`) || errors.fullName.message}
                  </p>
                )}
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{user.fullName}</h2>
                <Button size="icon" variant="ghost" onClick={() => setEditing(true)} className="h-7 w-7">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            <p className="mt-1 text-sm text-muted-foreground">{t(`roles.${user.role}`)}</p>
          </div>
        </div>


        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
            <Mail className="h-5 w-5 text-violet-400" />
            <div className="text-start">
              <p className="text-xs text-muted-foreground">{t("common.email")}</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
            <Shield className="h-5 w-5 text-violet-400" />
            <div className="text-start">
              <p className="text-xs text-muted-foreground">{t("profile.roleLabel")}</p>
              <p className="font-medium">{t(`roles.${user.role}`)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
            <User className="h-5 w-5 text-violet-400" />
            <div className="text-start">
              <p className="text-xs text-muted-foreground">{t("profile.idLabel")}</p>
              <p className="font-mono text-xs font-medium">{user.id}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
