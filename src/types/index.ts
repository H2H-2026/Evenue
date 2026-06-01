export type UserRole = "admin" | "trainer" | "participant";

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  locale?: "ar" | "en";
}

export type EventStatus = "draft" | "published" | "ongoing" | "completed" | "cancelled";

export interface EventItem {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: EventStatus;
  coverUrl?: string;
}

export interface Venue {
  id: string;
  name: string;
  city?: string;
  address?: string;
  capacity?: number;
}

export interface Session {
  id: string;
  eventId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  trainerId?: string;
  venueId?: string;
  capacity?: number;
}

export type RegistrationStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface Registration {
  id: string;
  eventId: string;
  participantId: string;
  status: RegistrationStatus;
  createdAt: string;
}

export type AttendanceMethod = "qr" | "manual";

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  participantId: string;
  method: AttendanceMethod;
  checkedInAt: string;
  checkedOutAt?: string;
}

export type MaterialType = "link" | "file" | "video";

export interface Material {
  id: string;
  eventId: string;
  sessionId?: string;
  title: string;
  type: MaterialType;
  url: string;
  access?: "public" | "restricted";
}

export interface Quiz {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  questionsCount: number;
}

export interface Feedback {
  id: string;
  eventId: string;
  sessionId?: string;
  participantId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Certificate {
  id: string;
  participantId: string;
  eventId: string;
  code: string;
  issuedAt: string;
}
