import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Plus, Search, Pencil, Trash2, Users as UsersIcon } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Dialog } from "@/components/ui/dialog";
import { UserForm } from "./UserForm";
import { useUsers, type UserInput } from "@/stores/users";
import { cn } from "@/lib/utils";
import type { Profile, UserRole } from "@/types";

const ROLE_STYLES: Record<UserRole, string> = {
  admin: "bg-fuchsia-500/15 text-fuchsia-300",
  trainer: "bg-violet-500/15 text-violet-300",
  participant: "bg-sky-500/15 text-sky-300",
};

export function UsersPage() {
  const { t } = useTranslation();
  const { users, add, update, remove } = useUsers();

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [deleting, setDeleting] = useState<Profile | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const matchesQuery =
        u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [users, query, roleFilter]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (u: Profile) => {
    setEditing(u);
    setFormOpen(true);
  };
  const handleSubmit = (values: UserInput) => {
    if (editing) update(editing.id, values);
    else add(values);
    setFormOpen(false);
    setEditing(null);
  };
  const confirmDelete = () => {
    if (deleting) remove(deleting.id);
    setDeleting(null);
  };

  return (
    <div>
      <PageHeader
        title={t("users.title")}
        description={t("users.subtitle")}
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {t("users.new")}
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("users.searchPlaceholder")}
            className="ps-9"
          />
        </div>
        <div className="sm:w-52">
          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}>
            <option value="all">{t("users.allRoles")}</option>
            <option value="admin">{t("roles.admin")}</option>
            <option value="trainer">{t("roles.trainer")}</option>
            <option value="participant">{t("roles.participant")}</option>
          </Select>
        </div>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">{t("users.count", { count: filtered.length })}</p>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
          <UsersIcon className="h-10 w-10" />
          <p className="font-medium text-foreground">
            {users.length === 0 ? t("users.empty") : t("users.noResults")}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 text-start font-semibold">{t("users.columns.user")}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t("users.columns.email")}</th>
                  <th className="px-5 py-3 text-start font-semibold">{t("users.columns.role")}</th>
                  <th className="px-5 py-3 text-end font-semibold">{t("users.columns.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.03 }}
                    className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.fullName} className="h-9 w-9" />
                        <span className="font-medium text-foreground">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{u.email}</td>
                    <td className="px-5 py-4">
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", ROLE_STYLES[u.role])}>
                        {t(`roles.${u.role}`)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(u)} title={t("common.edit")}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleting(u)}
                          title={t("common.delete")}
                          className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? t("users.edit") : t("users.create")}
      >
        <UserForm initial={editing ?? undefined} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} />
      </Dialog>

      <Dialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={t("users.deleteTitle")}
        description={deleting ? t("users.deleteConfirm", { name: deleting.fullName }) : ""}
        className="max-w-md"
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => setDeleting(null)}>
            {t("common.cancel")}
          </Button>
          <Button variant="destructive" onClick={confirmDelete}>
            <Trash2 className="h-4 w-4" />
            {t("common.delete")}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
