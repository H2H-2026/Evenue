import { lazy, Suspense, type ComponentType, type ReactElement } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { RoleGuard } from "@/components/RoleGuard";
import { RouteFallback } from "@/components/RouteFallback";

/** تحميل كسول للصفحات (named exports) مع Suspense */
function el(
  loader: () => Promise<Record<string, ComponentType>>,
  name: string,
): ReactElement {
  const Comp = lazy(async () => ({ default: (await loader())[name] }));
  return (
    <Suspense fallback={<RouteFallback />}>
      <Comp />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: el(() => import("@/pages/Login"), "Login") },
  {
    path: "/admin",
    element: (
      <RoleGuard role="admin">
        <AppLayout role="admin" />
      </RoleGuard>
    ),
    children: [
      { index: true, element: el(() => import("@/pages/admin/AdminDashboard"), "AdminDashboard") },
      { path: "events", element: el(() => import("@/features/events/EventsPage"), "EventsPage") },
      { path: "sessions", element: el(() => import("@/features/sessions/SessionsPage"), "SessionsPage") },
      { path: "venues", element: el(() => import("@/features/venues/VenuesPage"), "VenuesPage") },
      { path: "users", element: el(() => import("@/features/users/UsersPage"), "UsersPage") },
      { path: "registrations", element: el(() => import("@/features/registrations/RegistrationsPage"), "RegistrationsPage") },
      { path: "reports", element: el(() => import("@/features/reports/ReportsPage"), "ReportsPage") },
      { path: "profile", element: el(() => import("@/features/profile/ProfilePage"), "ProfilePage") },
    ],
  },
  {
    path: "/trainer",
    element: (
      <RoleGuard role="trainer">
        <AppLayout role="trainer" />
      </RoleGuard>
    ),
    children: [
      { index: true, element: el(() => import("@/pages/trainer/TrainerDashboard"), "TrainerDashboard") },
      { path: "schedule", element: el(() => import("@/features/schedule/SchedulePage"), "SchedulePage") },
      { path: "attendance", element: el(() => import("@/features/attendance/AttendancePage"), "AttendancePage") },
      { path: "materials", element: el(() => import("@/features/materials/MaterialsPage"), "MaterialsPage") },
      { path: "quizzes", element: el(() => import("@/features/quizzes/QuizzesPage"), "QuizzesPage") },
      { path: "feedback", element: el(() => import("@/features/feedback/FeedbackPage"), "FeedbackPage") },
      { path: "profile", element: el(() => import("@/features/profile/ProfilePage"), "ProfilePage") },
    ],
  },
  {
    path: "/participant",
    element: (
      <RoleGuard role="participant">
        <AppLayout role="participant" />
      </RoleGuard>
    ),
    children: [
      { index: true, element: el(() => import("@/pages/participant/ParticipantDashboard"), "ParticipantDashboard") },
      { path: "events", element: el(() => import("@/features/events/ParticipantEventsPage"), "ParticipantEventsPage") },
      { path: "schedule", element: el(() => import("@/features/schedule/SchedulePage"), "SchedulePage") },
      { path: "materials", element: el(() => import("@/features/materials/MaterialsPage"), "MaterialsPage") },
      { path: "quizzes", element: el(() => import("@/features/quizzes/QuizzesPage"), "QuizzesPage") },
      { path: "certificates", element: el(() => import("@/features/certificates/CertificatesPage"), "CertificatesPage") },
      { path: "feedback", element: el(() => import("@/features/feedback/FeedbackPage"), "FeedbackPage") },
      { path: "profile", element: el(() => import("@/features/profile/ProfilePage"), "ProfilePage") },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
], {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  },
});
