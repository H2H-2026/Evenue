import type {
  EventItem,
  Venue,
  Session,
  Profile,
  Registration,
  Material,
  Quiz,
  Certificate,
  AssessmentCenter,
  Candidate,
} from "@/types";

export const mockEvents: EventItem[] = [
  {
    id: "e1",
    title: "ورشة القيادة التنفيذية",
    description: "برنامج تدريبي مكثف لتطوير المهارات القيادية",
    startDate: "2026-06-10",
    endDate: "2026-06-12",
    status: "published",
  },
  {
    id: "e2",
    title: "أساسيات إدارة المشاريع",
    description: "مقدمة عملية لإدارة المشاريع وفق PMI",
    startDate: "2026-06-15",
    endDate: "2026-06-16",
    status: "ongoing",
  },
  {
    id: "e3",
    title: "التحول الرقمي للمؤسسات",
    description: "استراتيجيات التحول الرقمي والابتكار",
    startDate: "2026-07-01",
    endDate: "2026-07-03",
    status: "draft",
  },
];

export const mockVenues: Venue[] = [
  { id: "v1", name: "قاعة الأندلس", city: "الرياض", address: "طريق الملك فهد", capacity: 120 },
  { id: "v2", name: "قاعة الفيصلية", city: "جدة", address: "حي الروضة", capacity: 80 },
  { id: "v3", name: "قاعة النخيل", city: "الدمام", address: "الكورنيش", capacity: 50 },
];

export const mockSessions: Session[] = [
  {
    id: "s1",
    eventId: "e1",
    title: "مقدمة في القيادة",
    startsAt: "2026-06-10T09:00",
    endsAt: "2026-06-10T11:00",
    venueId: "v1",
    capacity: 100,
  },
  {
    id: "s2",
    eventId: "e2",
    title: "تخطيط المشاريع",
    startsAt: "2026-06-15T10:00",
    endsAt: "2026-06-15T12:30",
    venueId: "v2",
    capacity: 60,
  },
];

export const mockUsers: Profile[] = [
  { id: "u1", fullName: "مدير النظام", email: "admin@evenue.app", role: "admin" },
  { id: "u2", fullName: "أحمد المدرّب", email: "trainer@evenue.app", role: "trainer" },
  { id: "u3", fullName: "سارة المشاركة", email: "participant@evenue.app", role: "participant" },
  { id: "u4", fullName: "خالد العتيبي", email: "khaled@evenue.app", role: "participant" },
  { id: "u5", fullName: "نورة الزهراني", email: "noura@evenue.app", role: "trainer" },
  { id: "u6", fullName: "محمد الشهري", email: "mohammed@evenue.app", role: "participant" },
];

export const mockRegistrations: Registration[] = [
  { id: "r1", eventId: "e1", participantId: "u3", status: "approved", createdAt: "2026-05-20" },
  { id: "r2", eventId: "e1", participantId: "u4", status: "pending", createdAt: "2026-05-22" },
  { id: "r3", eventId: "e2", participantId: "u6", status: "pending", createdAt: "2026-05-25" },
  { id: "r4", eventId: "e2", participantId: "u3", status: "rejected", createdAt: "2026-05-26" },
];

export const mockMaterials: Material[] = [
  { id: "m1", eventId: "e1", title: "دليل المشارك (PDF)", type: "file", url: "https://example.com/guide.pdf" },
  { id: "m2", eventId: "e1", title: "عرض القيادة", type: "link", url: "https://example.com/slides" },
  { id: "m3", eventId: "e2", title: "فيديو: مقدمة PMI", type: "video", url: "https://example.com/video" },
];

export const mockQuizzes: Quiz[] = [
  { id: "q1", eventId: "e1", title: "اختبار القيادة الأساسي", description: "تقييم سريع", questionsCount: 10 },
  { id: "q2", eventId: "e2", title: "اختبار إدارة المشاريع", questionsCount: 15 },
];

export const mockCertificates: Certificate[] = [
  { id: "c1", participantId: "u3", eventId: "e1", code: "EVN-2026-0001", issuedAt: "2026-06-13" },
  { id: "c2", participantId: "u3", eventId: "e2", code: "EVN-2026-0002", issuedAt: "2026-06-17" },
];

export const weeklyAttendance = [
  { day: "السبت", value: 42 },
  { day: "الأحد", value: 58 },
  { day: "الاثنين", value: 73 },
  { day: "الثلاثاء", value: 65 },
  { day: "الأربعاء", value: 81 },
  { day: "الخميس", value: 54 },
];

export const statusLabels: Record<EventItem["status"], string> = {
  draft: "مسودة",
  published: "منشور",
  ongoing: "جارٍ",
  completed: "مكتمل",
  cancelled: "ملغي",
};

// Assessment Centers Mock Data
export const mockAssessmentCenters: AssessmentCenter[] = [
  {
    id: "ac1",
    name: "مركز تقييم القيادات التنفيذية",
    description: "تقييم شامل للكفاءات القيادية للموظفين في الشركات",
    startDate: "2026-07-15",
    endDate: "2026-07-17",
    status: "active",
    maxAssessors: 8,
    maxCandidates: 24,
    location: "الرياض - مركز التدريب الرئيسي",
    createdAt: "2026-06-01",
    createdBy: "u1",
  },
  {
    id: "ac2",
    name: "تقييم المواهب الإدارية",
    description: "تقييم الكفاءات الإدارية والتنظيمية",
    startDate: "2026-08-01",
    endDate: "2026-08-03",
    status: "draft",
    maxAssessors: 6,
    maxCandidates: 18,
    location: "جدة - مقر الشركة الفرعي",
    createdAt: "2026-06-10",
    createdBy: "u1",
  },
  {
    id: "ac3",
    name: "برنامج تطوير المديرين",
    description: "تقييم وقياس جاهزية المديرين للمناصب القيادية",
    startDate: "2026-06-20",
    endDate: "2026-06-22",
    status: "completed",
    maxAssessors: 5,
    maxCandidates: 15,
    location: "الدمام - مركز التدريب",
    createdAt: "2026-05-15",
    createdBy: "u1",
  },
];

export const mockCandidates: Candidate[] = [
  {
    id: "can1",
    centerId: "ac1",
    fullName: "فهد السالم",
    email: "fahd@company.com",
    phone: "0501234567",
    jobTitle: "مدير قسم",
    department: "المبيعات",
    status: "scheduled",
    notes: "مرشح قوي - خبرة 5 سنوات",
    createdAt: "2026-06-15",
  },
  {
    id: "can2",
    centerId: "ac1",
    fullName: "مها القحطاني",
    email: "maha@company.com",
    phone: "0509876543",
    jobTitle: "مساعد مدير",
    department: "الموارد البشرية",
    status: "in_progress",
    notes: "تحتاج تطوير في مهارات القيادة",
    createdAt: "2026-06-15",
  },
  {
    id: "can3",
    centerId: "ac1",
    fullName: "عبدالله العنزي",
    email: "abdullah@company.com",
    phone: "0504567890",
    jobTitle: "أخصائي تسويق",
    department: "التسويق",
    status: "completed",
    notes: "أداء ممتاز في جميع الكفاءات",
    createdAt: "2026-06-15",
  },
  {
    id: "can4",
    centerId: "ac2",
    fullName: "نورة المطيري",
    email: "noura.m@company.com",
    phone: "0501122334",
    jobTitle: "محاسبة",
    department: "المالية",
    status: "scheduled",
    createdAt: "2026-06-20",
  },
];
