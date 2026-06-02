import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Building2, Users, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { useAssessmentCenters } from "@/stores/assessmentCenters";
import type { AssessmentCenter, AssessmentCenterStatus } from "@/types";
import { AssessmentCenterForm } from "./AssessmentCenterForm";
import { useNavigate } from "react-router-dom";

const statusColors: Record<AssessmentCenterStatus, string> = {
  draft: "bg-gray-500/20 text-gray-400",
  active: "bg-green-500/20 text-green-400",
  completed: "bg-blue-500/20 text-blue-400",
  cancelled: "bg-red-500/20 text-red-400",
};

const statusLabels: Record<AssessmentCenterStatus, string> = {
  draft: "مسودة",
  active: "نشط",
  completed: "مكتمل",
  cancelled: "ملغي",
};

export function AssessmentCentersPage() {
  useTranslation();
  const navigate = useNavigate();
  const { centers, loading, error, fetch, remove } = useAssessmentCenters();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AssessmentCenter | null>(null);
  const [deleting, setDeleting] = useState<AssessmentCenter | null>(null);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const filtered = centers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.location?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleting) return;
    await remove(deleting.id);
    setDeleting(null);
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="مراكز التقييم"
        description="إدارة مراكز تقييم الموارد البشرية والكفاءات"
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="البحث في المراكز..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-10"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {filtered.length} مركز
          </span>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 bg-gradient-to-r from-primary to-violet-500 hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            مركز جديد
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="rounded-full bg-primary/10 p-6">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium">لا توجد مراكز تقييم</p>
            <p className="text-sm text-muted-foreground">
              ابدأ بإنشاء مركز تقييم جديد
            </p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            variant="outline"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            إنشاء مركز
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filtered.map((center, i) => (
              <motion.div
                key={center.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
                onClick={() => navigate(`/admin/assessment-centers/${center.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{center.name}</h3>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[center.status]}`}>
                        {statusLabels[center.status]}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {center.description || "بدون وصف"}
                    </p>
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{center.location || "غير محدد"}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{center.maxAssessors} مقيّم</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          <span>{center.maxCandidates} مرشح</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center justify-end gap-2 border-t border-white/10 pt-4 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditing(center);
                    }}
                  >
                    تعديل
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleting(center);
                    }}
                  >
                    حذف
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Dialog */}
      {isCreateOpen && (
        <AssessmentCenterForm
          onClose={() => setIsCreateOpen(false)}
        />
      )}

      {/* Edit Dialog */}
      {editing && (
        <AssessmentCenterForm
          center={editing}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-card p-6">
            <h3 className="mb-2 text-lg font-semibold">تأكيد الحذف</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              هل أنت متأكد من حذف مركز "{deleting?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleting(null)}>
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                حذف
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
