import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ExternalLink,
  FileText,
  Link2,
  Video,
  BookOpen,
  Lock,
  Printer,
  Notebook,
  Save,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { MaterialForm } from "./MaterialForm";
import { useMaterials, type MaterialInput } from "@/stores/materials";
import { useEvents } from "@/stores/events";
import { useAuth } from "@/stores/auth";
import { useNotes } from "@/stores/notes";
import { cn } from "@/lib/utils";
import type { Material, MaterialType } from "@/types";

const TYPE_ICON: Record<MaterialType, typeof FileText> = {
  link: Link2,
  file: FileText,
  video: Video,
};

const getSimulatedSlides = (title: string) => {
  return [
    {
      title: "مقدمة وتوجيهات عامة",
      content: `مرحباً بك في العرض التقديمي لبرنامج: ${title}.
هذا المستند محمي وخاص ببرنامج تطوير المهارات. يرجى قراءة المحتويات بعناية وتدوين الملاحظات لتفعيل خيار الطباعة والمذاكرة.`,
    },
    {
      title: "المحور الأول: المفاهيم الأساسية والأهداف",
      content: `نستعرض في هذا المحور المفاهيم الأساسية للمادة التدريبية:
1. فهم الهيكل العام لتطوير المهارة.
2. تحديد الأهداف الذكية (SMART Goals) التي يسعى البرنامج لتحقيقها.
3. كيفية ربط هذه الجدارات بمتطلبات سوق العمل.`,
    },
    {
      title: "المحور الثاني: الجدارات المهنية والتطبيق",
      content: `التطبيق العملي وتفاعل المتدربين:
- دراسة حالات واقعية ومناقشتها.
- الأنشطة الفردية والجماعية داخل ورشة العمل.
- الممارسات الفضلى والأخطاء الشائعة لتجنبها أثناء التطبيق.`,
    },
    {
      title: "المحور الثالث: التقييم وقياس الأثر",
      content: `كيف نقيس مدى اكتساب المتدرب للمهارات؟
- الاختبارات المعرفية القصيرة (Quizzes) بعد كل وحدة.
- مشاريع التخرج العملية وتصحيحها من قبل المدرب.
- استطلاعات الرأي والتقييمات الذاتية المستمرة لتطوير الأداء.`,
    },
    {
      title: "الخاتمة والتوصيات النهائية",
      content: `نصائح وتوصيات للاستمرار في تطوير الذات:
1. استمر في التدرب العملي اليومي على هذه المهارة.
2. تواصل مع المدرب والمشرفين لطرح الاستفسارات.
3. شارك في مجتمعات التعلم المهنية لتحديث معارفك بانتظام.`,
    },
  ];
};

function InteractiveReaderDialog({
  open,
  onClose,
  material,
  user,
}: {
  open: boolean;
  onClose: () => void;
  material: Material;
  user: any;
}) {
  const { t } = useTranslation();
  const { saveNote, getNote, hasNotesForMaterial } = useNotes();
  const [slideIndex, setSlideIndex] = useState(0);
  const [noteText, setNoteText] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const slides = useMemo(() => getSimulatedSlides(material.title), [material]);

  useEffect(() => {
    if (user?.id) {
      setNoteText(getNote(material.id, slideIndex, user.id));
    }
  }, [slideIndex, material.id, user?.id, getNote]);

  const handleSaveNote = async () => {
    if (!user?.id) return;
    await saveNote(material.id, slideIndex, user.id, noteText);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const isRestricted = material.access === "restricted";
  const userHasNotes = user?.id ? hasNotesForMaterial(material.id, user.id) : false;
  const isPrintDisabled = isRestricted && !userHasNotes;

  const handlePrint = () => {
    if (isPrintDisabled) return;
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const allNotesHtml = slides
      .map((slide, idx) => {
        const slideNote = user?.id ? getNote(material.id, idx, user.id) : "";
        return `
          <div class="slide-block">
            <div class="slide-content">
              <div class="slide-title">شريحة ${idx + 1}: ${slide.title}</div>
              <div class="slide-body">${slide.content.replace(/\n/g, "<br>")}</div>
            </div>
            <div class="slide-notes">
              <div class="notes-title">ملاحظاتي العلمية</div>
              <div class="notes-body">${slideNote ? slideNote.replace(/\n/g, "<br>") : "<em>لم يتم تدوين ملاحظات عن هذه الشريحة.</em>"}</div>
            </div>
          </div>
        `;
      })
      .join("");

    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>${material.title} - ملخص ملاحظات المذاكرة</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; direction: rtl; padding: 2.5rem; color: #1e293b; line-height: 1.6; }
            .header { border-bottom: 2px solid #7CC4A4; padding-bottom: 1.25rem; margin-bottom: 2.5rem; display: flex; justify-content: space-between; align-items: flex-end; }
            .header h1 { margin: 0; color: #5BA882; font-size: 1.8rem; font-weight: 800; }
            .header p { margin: 0.5rem 0 0; font-size: 0.9rem; color: #64748b; }
            .watermark-print { font-size: 0.75rem; color: #cbd5e1; border: 1px dashed #cbd5e1; padding: 0.25rem 0.5rem; border-radius: 0.25rem; }
            .slide-block { page-break-inside: avoid; border: 1px solid #e2e8f0; border-radius: 0.75rem; margin-bottom: 2rem; overflow: hidden; display: flex; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
            .slide-content { flex: 3; padding: 1.5rem; background-color: #f8fafc; border-left: 1px solid #e2e8f0; }
            .slide-title { font-weight: 800; font-size: 1.15rem; color: #1e1b4b; margin-bottom: 0.75rem; }
            .slide-body { font-size: 0.95rem; color: #334155; }
            .slide-notes { flex: 2; padding: 1.5rem; background: #fff; display: flex; flex-col; justify-content: flex-start; }
            .notes-title { font-size: 0.75rem; font-weight: 900; text-transform: uppercase; color: #7CC4A4; margin-bottom: 0.75rem; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.25rem; }
            .notes-body { font-size: 0.9rem; color: #0f172a; font-style: italic; white-space: pre-wrap; }
            @media print {
              body { padding: 0; background: none; }
              .slide-block { border-color: #94a3b8; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>${material.title}</h1>
              <p>مستند المذاكرة التفاعلي المخصص للمتدرب: <strong>${user?.fullName}</strong> (${user?.email})</p>
            </div>
            <div class="watermark-print">تحقق النظام: ${new Date().toLocaleDateString("ar-EG")}</div>
          </div>
          ${allNotesHtml}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const currentSlide = slides[slideIndex];
  const watermarkText = `${user?.fullName} • ${user?.email} • ${new Date().toLocaleDateString()}`;

  return (
    <Dialog open={open} onClose={onClose} title={material.title} className="max-w-5xl w-full h-[85vh] flex flex-col p-0 overflow-hidden">
      <div className="flex flex-1 h-full overflow-hidden divide-x divide-x-reverse divide-black/5 dark:divide-white/5">
        
        <div className="flex-[3] flex flex-col justify-between p-6 bg-black/[0.02] dark:bg-black/20 relative select-none" onContextMenu={(e) => isRestricted && e.preventDefault()}>
          
          {isRestricted && (
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-wrap gap-x-16 gap-y-16 p-8 justify-around items-center opacity-[0.06] dark:opacity-[0.03] select-none overflow-hidden rotate-[-15deg]">
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} className="text-xs font-bold font-mono tracking-wider whitespace-nowrap text-foreground">
                  {watermarkText}
                </span>
              ))}
            </div>
          )}

          <div className="flex-1 flex flex-col justify-center items-center text-center px-8 relative z-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#7CC4A4] mb-3 font-mono">
              {t("materials.slideIndex") || "الشريحة"} {slideIndex + 1} / {slides.length}
            </span>
            <h2 className="text-2xl font-black text-foreground mb-4 select-none leading-relaxed">
              {currentSlide.title}
            </h2>
            <div className="text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed whitespace-pre-wrap select-none">
              {currentSlide.content}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-4 mt-4 relative z-20">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSlideIndex((prev) => Math.max(0, prev - 1))}
                disabled={slideIndex === 0}
              >
                <ChevronRight className="h-4 w-4 ms-1 rtl:rotate-180" />
                {t("common.previous") || "السابق"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
                disabled={slideIndex === slides.length - 1}
              >
                {t("common.next") || "التالي"}
                <ChevronLeft className="h-4 w-4 me-1 rtl:rotate-180" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {isRestricted && isPrintDisabled && (
                <div className="hidden lg:flex items-center gap-1 text-[11px] text-amber-500 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/10">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {t("materials.noteRequiredHint") || "اكتب ملاحظة واحدة لفتح خيار الطباعة"}
                </div>
              )}
              <Button
                size="sm"
                variant={isPrintDisabled ? "secondary" : "default"}
                onClick={handlePrint}
                disabled={isPrintDisabled}
                className={cn(
                  "gap-1.5 font-bold transition-all",
                  !isPrintDisabled && "bg-[#7CC4A4] hover:bg-[#5BA882] text-white shadow-glow-sm"
                )}
                title={isPrintDisabled ? "ميزة الطباعة مقفلة حتى تدوين الملاحظات" : "طباعة المادة العلمية وملخص الملاحظات"}
              >
                {isPrintDisabled ? (
                  <>
                    <Lock className="h-3.5 w-3.5 text-amber-500" />
                    <span>{t("materials.locked") || "مغلق"}</span>
                  </>
                ) : (
                  <>
                    <Printer className="h-3.5 w-3.5" />
                    <span>{t("materials.print") || "طباعة الملخص"}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-[1.2] flex flex-col justify-between p-6 bg-background">
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 text-[#7CC4A4] mb-4 border-b border-black/5 dark:border-white/5 pb-3">
              <Notebook className="h-5 w-5" />
              <h3 className="font-bold text-sm text-foreground">
                {t("materials.myNotes") || "ملاحظاتي الشخصية"}
              </h3>
            </div>
            
            <p className="text-xs text-muted-foreground mb-2">
              {t("materials.notesHint") || "اكتب ملاحظاتك العلمية لهذه الشريحة، وسيتم حفظها وطباعتها مع المستند:"}
            </p>

            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="flex-1 w-full rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.02] p-3 text-sm text-foreground outline-none resize-none focus:border-[#7CC4A4]/50 focus:ring-1 focus:ring-[#7CC4A4]/20 placeholder:text-muted-foreground/40 transition-all font-sans leading-relaxed"
              placeholder="اكتب ملاحظاتك هنا..."
            />
          </div>

          <div className="pt-4 border-t border-black/5 dark:border-white/5 mt-4 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              {saveSuccess ? (
                <span className="text-green-500 font-semibold">{t("materials.saved") || "تم الحفظ تلقائياً"}</span>
              ) : (
                t("materials.autoSave") || "مسودة المذاكرة"
              )}
            </span>
            <Button size="sm" onClick={handleSaveNote} className="gap-1 bg-[#7CC4A4] hover:bg-[#5BA882] text-white font-bold">
              <Save className="h-3.5 w-3.5" />
              {t("common.save") || "حفظ"}
            </Button>
          </div>
        </div>

      </div>
    </Dialog>
  );
}

export function MaterialsPage({ readOnly = false }: { readOnly?: boolean }) {
  const { t } = useTranslation();
  const { materials, add, update, remove, fetch: fetchMaterials } = useMaterials();
  const { events, fetch: fetchEvents } = useEvents();
  const { user } = useAuth();
  const [selectedReaderMaterial, setSelectedReaderMaterial] = useState<Material | null>(null);

  useEffect(() => {
    fetchMaterials();
    fetchEvents();
  }, [fetchMaterials, fetchEvents]);

  const eventTitle = (id: string) => events.find((e) => e.id === id)?.title ?? "—";

  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [deleting, setDeleting] = useState<Material | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return materials.filter((m) => {
      const matchesQuery = m.title.toLowerCase().includes(q);
      const matchesEvent = eventFilter === "all" || m.eventId === eventFilter;
      return matchesQuery && matchesEvent;
    });
  }, [materials, query, eventFilter]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (m: Material) => {
    setEditing(m);
    setFormOpen(true);
  };
  const handleSubmit = (values: MaterialInput) => {
    if (editing) update(editing.id, values);
    else add(values);
    setFormOpen(false);
    setEditing(null);
  };

  return (
    <div>
      <PageHeader
        title={t("materials.title")}
        description={t("materials.subtitle")}
        action={
          !readOnly && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              {t("materials.new")}
            </Button>
          )
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("materials.searchPlaceholder")}
            className="ps-9"
          />
        </div>
        <div className="sm:w-56">
          <Select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
            <option value="all">{t("materials.allEvents")}</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">{t("materials.count", { count: filtered.length })}</p>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
          <BookOpen className="h-10 w-10" />
          <p className="font-medium text-foreground">
            {materials.length === 0 ? t("materials.empty") : t("materials.noResults")}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m, i) => {
            const Icon = TYPE_ICON[m.type];
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
              >
                <Card className="group h-full">
                  <div className="flex h-full flex-col p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#7CC4A4] to-[#5BA882] text-white shadow-glow-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      {!readOnly && (
                        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(m)} title={t("common.edit")}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleting(m)}
                            title={t("common.delete")}
                            className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold">{m.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{eventTitle(m.eventId)}</p>
                    {m.type === "file" ? (
                      <button
                        type="button"
                        onClick={() => setSelectedReaderMaterial(m)}
                        className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-medium text-[#7CC4A4] hover:text-[#5BA882] transition-colors text-start w-fit"
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>{t("materials.interactiveRead") || "قراءة تفاعلية وملاحظات"}</span>
                        {m.access === "restricted" && <Lock className="h-3.5 w-3.5 text-amber-500 ms-1" />}
                      </button>
                    ) : (
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-medium text-[#7CC4A4]/70 hover:text-[#7CC4A4]"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {t("materials.open")}
                      </a>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? t("materials.edit") : t("materials.create")}
      >
        <MaterialForm initial={editing ?? undefined} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} />
      </Dialog>

      <Dialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={t("materials.deleteTitle")}
        description={deleting ? t("materials.deleteConfirm", { title: deleting.title }) : ""}
        className="max-w-md"
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => setDeleting(null)}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (deleting) remove(deleting.id);
              setDeleting(null);
            }}
          >
            <Trash2 className="h-4 w-4" />
            {t("common.delete")}
          </Button>
        </div>
      </Dialog>

      {selectedReaderMaterial && (
        <InteractiveReaderDialog
          open={!!selectedReaderMaterial}
          onClose={() => setSelectedReaderMaterial(null)}
          material={selectedReaderMaterial}
          user={user}
        />
      )}
    </div>
  );
}
