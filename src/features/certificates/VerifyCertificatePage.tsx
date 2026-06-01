import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AlertTriangle, ShieldCheck, Search, ArrowRight, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/brand/Logo";
import { useCertificates } from "@/stores/certificates";
import { useUsers } from "@/stores/users";
import { useEvents } from "@/stores/events";
import i18n from "@/i18n";

export function VerifyCertificatePage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { certificates, fetch: fetchCertificates } = useCertificates();
  const { users, fetch: fetchUsers } = useUsers();
  const { events, fetch: fetchEvents } = useEvents();

  const [inputCode, setInputCode] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    fetchCertificates();
    fetchUsers();
    fetchEvents();
  }, [fetchCertificates, fetchUsers, fetchEvents]);

  const queryCode = searchParams.get("code")?.trim() || "";

  useEffect(() => {
    if (queryCode) {
      setInputCode(queryCode);
      setSearched(true);
    }
  }, [queryCode]);

  const verifiedCertificate = useMemo(() => {
    if (!queryCode) return null;
    return certificates.find((c) => c.code.toLowerCase() === queryCode.toLowerCase()) || null;
  }, [queryCode, certificates]);

  const participantName = useMemo(() => {
    if (!verifiedCertificate) return "";
    return users.find((u) => u.id === verifiedCertificate.participantId)?.fullName ?? "—";
  }, [verifiedCertificate, users]);

  const eventTitle = useMemo(() => {
    if (!verifiedCertificate) return "";
    return events.find((e) => e.id === verifiedCertificate.eventId)?.title ?? "—";
  }, [verifiedCertificate, events]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      setSearchParams({ code: inputCode.trim() });
      setSearched(true);
    }
  };

  return (
    <div className="aurora-bg relative flex min-h-screen flex-col items-center justify-center bg-background p-4">
      {/* Language Switcher */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute end-4 top-4 z-20"
        onClick={() => i18n.changeLanguage(i18n.language === "ar" ? "en" : "ar")}
        title={t("common.language")}
      >
        <Languages className="h-5 w-5" />
      </Button>

      <div className="relative z-10 w-full max-w-lg">
        {/* Brand Logo */}
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo markClassName="h-12 w-12" className="mb-2 flex-col gap-1" showTagline />
          <h2 className="text-xl font-black text-foreground mt-4">
            {t("verify.pageTitle") || "نظام التحقق العام من الشهادات"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t("verify.pageSubtitle") || "تأكد من صحة وموثوقية الاعتمادات الصادرة من منصة Evenue"}
          </p>
        </div>

        <Card className="glass-strong w-full overflow-hidden border-indigo-500/10 shadow-glow-sm">
          <CardContent className="p-8">
            
            {/* Search Input Form */}
            <form onSubmit={handleVerify} className="space-y-4 mb-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted-foreground">
                  {t("verify.enterCodeLabel") || "أدخل رمز التحقق (Verification Code):"}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground" />
                    <Input
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="EVN-2026-XXXX"
                      className="ps-9"
                    />
                  </div>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-1 px-4">
                    {t("verify.button") || "تحقق"}
                  </Button>
                </div>
              </div>
            </form>

            {/* Results Display */}
            {searched && (
              <div className="border-t border-black/5 dark:border-white/5 pt-6 animate-fade-in">
                {verifiedCertificate ? (
                  // Valid Certificate Card
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-center flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                      <ShieldCheck className="h-8 w-8" />
                    </div>
                    <div>
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 mb-2">
                        {t("verify.validStatus") || "الشهادة معتمدة وصالحة"} ✓
                      </span>
                      <h3 className="text-lg font-black text-foreground">{participantName}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{t("verify.approvedFor") || "اجتاز بنجاح البرنامج المعتمد:"}</p>
                      <p className="font-bold text-indigo-400 mt-2 text-sm">« {eventTitle} »</p>
                    </div>

                    <div className="w-full border-t border-emerald-500/10 mt-2 pt-3 text-start text-xs text-muted-foreground/80 space-y-1.5 font-sans">
                      <div className="flex justify-between">
                        <span>{t("verify.code") || "رمز الشهادة:"}</span>
                        <span className="font-mono font-bold text-foreground">{verifiedCertificate.code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("verify.issueDate") || "تاريخ الإصدار:"}</span>
                        <span className="font-bold text-foreground">{verifiedCertificate.issuedAt}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Invalid Certificate Card
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-center flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                      <AlertTriangle className="h-8 w-8" />
                    </div>
                    <div>
                      <span className="inline-flex items-center rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400 border border-red-500/20 mb-2">
                        {t("verify.invalidStatus") || "فشل التحقق"} ✗
                      </span>
                      <p className="text-sm font-semibold text-foreground">
                        {t("verify.notFoundTitle") || "رمز التحقق غير صحيح أو غير مسجل بالنظام."}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1.5 max-w-xs mx-auto leading-relaxed">
                        {t("verify.notFoundHint") || "يرجى التأكد من كتابة كود التحقق بشكل صحيح ومطابق تماماً للكود الموجود بالشهادة."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Back Button */}
            <div className="mt-6 text-center">
              <Button
                variant="link"
                size="sm"
                onClick={() => navigate("/login")}
                className="text-indigo-400 hover:text-indigo-300 font-bold gap-1"
              >
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                {t("verify.backToLogin") || "العودة لتسجيل الدخول"}
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
