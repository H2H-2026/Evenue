import { Navigate } from "react-router-dom";
import { useAuth } from "@/stores/auth";
import type { UserRole } from "@/types";

export function RoleGuard({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />;

  return <>{children}</>;
}
