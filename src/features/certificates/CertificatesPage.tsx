import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Plus, Search, Download, Trash2, Award, FileBadge } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { useCertificates } from "@/stores/certificates";
import { useUsers } from "@/stores/users";
import { useEvents } from "@/stores/events";
import { useRegistrations } from "@/stores/registrations";

const schema = z.object({
  participantId: z.string().min(1, "participantRequired"),
  eventId: z.string().min(1, "eventRequired"),
});

type FormValues = z.infer<typeof schema>;

export function CertificatesPage({ readOnly = false, participantId }: { readOnly?: boolean; participantId?: string }) {
  const { t } = useTranslation();
  const { certificates, issue, remove } = useCertificates();
  const { users } = useUsers();
  const { events } = useEvents();
  const { registrations } = useRegistrations();

  useEffect(() => {
    certificates.length === 0 && useCertificates.getState().fetch?.();
  }, []);

  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      participantId: "",
      eventId: "",
    },
  });

  // For admin: show all; for participant: filter by participantId
  const filtered = useMemo(() => {
    let list = certificates;
    if (participantId) list = list.filter((c) => c.participantId === participantId);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((c) =>
        c.code.toLowerCase().includes(q) ||
        users.find((u) => u.id === c.participantId)?.fullName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [certificates, participantId, query, users]);

  const userName = (id: string) => users.find((u) => u.id === id)?.fullName ?? "—";
  const eventTitle = (id: string) => events.find((e) => e.id === id)?.title ?? "—";

  // Participants with approved registrations (eligible for certificates)
  const approvedParticipants = useMemo(() => {
    const approvedIds = new Set(registrations.filter((r) => r.status === "approved").map((r) => r.participantId));
    return users.filter((u) => u.role === "participant" && approvedIds.has(u.id));
  }, [users, registrations]);

  const onSubmit = (data: FormValues) => {
    issue({ participantId: data.participantId, eventId: data.eventId });
    setAddOpen(false);
    reset();
  };

  const handleDownload = (c: any) => {
    const participantName = userName(c.participantId);
    const eventName = eventTitle(c.eventId);
    const issuedDate = c.issuedAt;
    const verificationUrl = `${window.location.origin}/verify-certificate?code=${c.code}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}`;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>شهادة اجتياز - ${participantName}</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: 'Cairo', 'Tajawal', system-ui, -apple-system, sans-serif;
              background-color: #f8fafc;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              direction: rtl;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .certificate-container {
              width: 297mm;
              height: 210mm;
              background: #ffffff;
              box-sizing: border-box;
              padding: 2.5rem;
              position: relative;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              border: 16px double #7CC4A4;
              box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            }
            .certificate-container::before {
              content: "";
              position: absolute;
              top: 0; left: 0; right: 0; bottom: 0;
              border: 2px solid #5BA882;
              margin: 4px;
              pointer-events: none;
            }
            .header {
              text-align: center;
              margin-top: 1.5rem;
            }
            .brand-logo {
              color: #5BA882;
              font-size: 2.25rem;
              font-weight: 900;
              letter-spacing: -0.05em;
              margin-bottom: 0.5rem;
            }
            .cert-title {
              font-size: 2.5rem;
              font-weight: 800;
              color: #1e1b4b;
              margin: 1.5rem 0 0.5rem;
              letter-spacing: 0.05em;
            }
            .subtitle {
              font-size: 1.1rem;
              color: #475569;
              margin-bottom: 2rem;
            }
            .recipient-name {
              font-size: 2.75rem;
              font-weight: 900;
              color: #7CC4A4;
              margin: 1rem 0;
              border-bottom: 2px dashed #cbd5e1;
              display: inline-block;
              padding-bottom: 0.5rem;
              min-width: 50%;
            }
            .statement {
              font-size: 1.25rem;
              color: #334155;
              max-w: 80%;
              margin: 1rem auto;
              line-height: 1.8;
            }
            .event-name {
              font-weight: 800;
              color: #1e1b4b;
            }
            .footer-section {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 2rem;
              padding: 0 2rem;
            }
            .signature-block {
              text-align: center;
              border-top: 1px solid #cbd5e1;
              padding-top: 0.5rem;
              width: 180px;
            }
            .signature-title {
              font-size: 0.9rem;
              color: #1e1b4b;
              font-weight: bold;
            }
            .signature-dept {
              font-size: 0.75rem;
              color: #64748b;
            }
            .qr-block {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 0.25rem;
            }
            .qr-image {
              width: 85px;
              height: 85px;
              border: 1px solid #e2e8f0;
              padding: 2px;
              background: #fff;
            }
            .verification-text {
              font-size: 0.65rem;
              color: #64748b;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="certificate-container">
            <div class="header">
              <div class="brand-logo">Evenue</div>
              <div class="cert-title">شهادة اجتياز برنامج تدريبي</div>
              <div class="subtitle">تُمنح هذه الشهادة رسمياً إلى المتميز/ة:</div>
            </div>

            <div style="text-align: center;">
              <div class="recipient-name">${participantName}</div>
              <div class="statement">
                وذلك تقديراً لحضوره واجتيازه الفعالية التدريبية المعتمدة بنجاح:<br>
                <span class="event-name">«${eventName}»</span>
              </div>
            </div>

            <div class="footer-section">
              <div class="signature-block">
                <div style="font-family: 'Georgia', serif; font-style: italic; color: #4f46e5; margin-bottom: 0.25rem; font-size: 1.1rem;">Evenue Admin</div>
                <div class="signature-title">إدارة التدريب والبرامج</div>
                <div class="signature-dept">منصة Evenue العالمية</div>
              </div>

              <div style="text-align: center;">
                <p style="font-size: 0.8rem; color: #64748b; margin: 0 0 0.25rem 0;">تاريخ الإصدار</p>
                <p style="font-size: 0.95rem; font-weight: bold; color: #1e1b4b; margin: 0;">${issuedDate}</p>
              </div>

              <div class="qr-block">
                <img class="qr-image" src="${qrCodeUrl}" alt="Verification QR Code" />
                <span class="verification-text">${c.code}</span>
                <span style="font-size: 0.6rem; color: #94a3b8;">امسح للتحقق من الصلاحية</span>
              </div>
            </div>
          </div>
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

  return (
    <div>
      <PageHeader
        title={t("certificates.title")}
        description={t("certificates.subtitle")}
        action={!readOnly && (
          <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" />{t("certificates.issue")}</Button>
        )}
      />

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("materials.searchPlaceholder")} className="ps-9" />
      </div>

      <p className="mb-3 text-sm text-muted-foreground">{t("certificates.count", { count: filtered.length })}</p>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
          <Award className="h-10 w-10" />
          <p className="font-medium text-foreground">{certificates.length === 0 ? t("certificates.empty") : t("certificates.noResults")}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.03 }}>
              <Card className="group h-full">
                <div className="flex h-full flex-col p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow-sm">
                      <FileBadge className="h-5 w-5" />
                    </div>
                    {!readOnly && (
                      <Button variant="ghost" size="icon" onClick={() => remove(c.id)} className="text-red-400 hover:bg-red-500/10 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("certificates.code")}</p>
                  <h3 className="text-lg font-bold">{c.code}</h3>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p><span className="text-foreground">{t("certificates.columns.participant")}:</span> {userName(c.participantId)}</p>
                    <p><span className="text-foreground">{t("certificates.columns.event")}:</span> {eventTitle(c.eventId)}</p>
                    <p className="mt-1 text-xs">{c.issuedAt}</p>
                  </div>
                  <Button variant="outline" size="sm" className="mt-auto" onClick={() => handleDownload(c)}>
                    <Download className="h-4 w-4" /><span className="ms-2">{t("certificates.download")}</span>
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {!readOnly && (
        <Dialog open={addOpen} onClose={() => { setAddOpen(false); reset(); }} title={t("certificates.issueTitle")}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="participant">{t("certificates.fields.participant")}</Label>
              <Select id="participant" {...register("participantId")}>
                <option value="">—</option>
                {approvedParticipants.map((p) => (<option key={p.id} value={p.id}>{p.fullName}</option>))}
              </Select>
              {errors.participantId && (
                <p className="mt-1 text-xs text-red-400">
                  {t(`certificates.errors.${errors.participantId.message}`) || errors.participantId.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="event">{t("certificates.fields.event")}</Label>
              <Select id="event" {...register("eventId")}>
                <option value="">—</option>
                {events.map((e) => (<option key={e.id} value={e.id}>{e.title}</option>))}
              </Select>
              {errors.eventId && (
                <p className="mt-1 text-xs text-red-400">
                  {t(`certificates.errors.${errors.eventId.message}`) || errors.eventId.message}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" type="button" onClick={() => { setAddOpen(false); reset(); }}>{t("common.cancel")}</Button>
              <Button type="submit">{t("common.save")}</Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
