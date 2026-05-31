import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { useEvents } from "@/stores/events";
import { useUsers } from "@/stores/users";
import { useRegistrations } from "@/stores/registrations";
import { useCertificates } from "@/stores/certificates";
import { useAttendance } from "@/stores/attendance";
import { Calendar, Users, ClipboardList, Award } from "lucide-react";

const COLORS = ["#6366F1", "#8B5CF6", "#A855F7", "#EC4899", "#F43F5E"];

export function ReportsPage() {
  const { t, i18n } = useTranslation();
  const { events, fetch: fetchEvents } = useEvents();
  const { users, fetch: fetchUsers } = useUsers();
  const { registrations, fetch: fetchRegistrations } = useRegistrations();
  const { certificates, fetch: fetchCertificates } = useCertificates();
  const { records, fetch: fetchAttendance } = useAttendance();

  useEffect(() => {
    fetchEvents();
    fetchUsers();
    fetchRegistrations();
    fetchCertificates();
    fetchAttendance();
  }, [fetchEvents, fetchUsers, fetchRegistrations, fetchCertificates, fetchAttendance]);

  const eventsByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach((e) => { counts[e.status] = (counts[e.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: t(`status.${name}`), value }));
  }, [events, t]);

  const registrationsByEvent = useMemo(() => {
    const counts: Record<string, number> = {};
    registrations.forEach((r) => {
      const title = events.find((e) => e.id === r.eventId)?.title ?? r.eventId;
      counts[title] = (counts[title] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [registrations, events]);

  // بيانات الحضور الأسبوعي من سجلات فعلية
  const weeklyData = useMemo(() => {
    const days = i18n.language === "ar"
      ? ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = Array(7).fill(0);
    records.forEach((r) => {
      const d = new Date(r.checkedInAt).getDay();
      counts[d]++;
    });
    return days.map((day, i) => ({ day, value: counts[i] }));
  }, [records, i18n.language]);

  return (
    <div>
      <PageHeader title={t("reports.title")} description={t("reports.subtitle")} />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <StatCard label={t("reports.totalEvents")} value={events.length} icon={Calendar} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
          <StatCard label={t("reports.totalUsers")} value={users.length} icon={Users} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <StatCard label={t("reports.totalRegistrations")} value={registrations.length} icon={ClipboardList} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
          <StatCard label={t("reports.totalCertificates")} value={certificates.length} icon={Award} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">{t("reports.eventsByStatus")}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={eventsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {eventsByStatus.map((_, i) => (<Cell key={`c-${i}`} fill={COLORS[i % COLORS.length]} />))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">{t("reports.registrationsByEvent")}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={registrationsByEvent}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} angle={-20} textAnchor="end" height={60} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold">{t("reports.attendanceTrend")}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
