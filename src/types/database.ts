/**
 * أنواع جداول قاعدة البيانات (Supabase) — مرآة لـ supabase/migrations/0001_init.sql
 * تُستخدم لاحقًا عند ربط الـ stores بـ supabase-js.
 * يمكن توليدها تلقائيًا عبر: npx supabase gen types typescript --project-id <id>
 */

export type DbUserRole = "admin" | "trainer" | "participant";
export type DbEventStatus = "draft" | "published" | "ongoing" | "completed" | "cancelled";
export type DbRegistrationStatus = "pending" | "approved" | "rejected" | "cancelled";
export type DbAttendanceMethod = "qr" | "manual";
export type DbMaterialType = "link" | "file" | "video";

export interface DbProfile {
  id: string;
  full_name: string;
  email: string;
  role: DbUserRole;
  avatar_url: string | null;
  locale: string | null;
  created_at: string;
}

export interface DbVenue {
  id: string;
  name: string;
  city: string | null;
  address: string | null;
  capacity: number | null;
  created_at: string;
}

export interface DbEvent {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: DbEventStatus;
  cover_url: string | null;
  created_by: string | null;
  created_at: string;
}

export interface DbSession {
  id: string;
  event_id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  trainer_id: string | null;
  venue_id: string | null;
  capacity: number | null;
  created_at: string;
}

export interface DbRegistration {
  id: string;
  event_id: string;
  participant_id: string;
  status: DbRegistrationStatus;
  created_at: string;
}

export interface DbAttendance {
  id: string;
  session_id: string;
  participant_id: string;
  method: DbAttendanceMethod;
  checked_in_at: string;
  checked_out_at: string | null;
}

export interface DbMaterial {
  id: string;
  event_id: string;
  session_id: string | null;
  title: string;
  type: DbMaterialType;
  url: string;
  created_at: string;
}

export interface DbQuiz {
  id: string;
  event_id: string;
  title: string;
  description: string | null;
  questions_count: number;
  created_at: string;
}

export interface DbFeedback {
  id: string;
  event_id: string;
  session_id: string | null;
  participant_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface DbCertificate {
  id: string;
  participant_id: string;
  event_id: string;
  code: string;
  issued_at: string;
}
