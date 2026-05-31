import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Profile, UserRole } from "@/types";

const DEMO_USERS: Record<UserRole, Profile> = {
  admin: {
    id: "demo-admin",
    fullName: "مدير النظام",
    email: "admin@events.local",
    role: "admin",
  },
  trainer: {
    id: "demo-trainer",
    fullName: "أحمد المدرّب",
    email: "trainer@events.local",
    role: "trainer",
  },
  participant: {
    id: "demo-participant",
    fullName: "سارة المشاركة",
    email: "participant@events.local",
    role: "participant",
  },
};

/** بيانات الدخول السريع — غيّرها حسب المستخدمين في Supabase. */
const CREDENTIALS: Record<UserRole, { email: string; password: string }> = {
  admin: { email: "admin@evenue.com", password: "Admin123!" },
  trainer: { email: "trainer@evenue.com", password: "Trainer123!" },
  participant: { email: "participant@evenue.com", password: "Participant123!" },
};

async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error || !data) return null;
  return {
    id: data.id,
    fullName: data.full_name || data.email,
    email: data.email,
    role: data.role as UserRole,
    avatarUrl: data.avatar_url || undefined,
    locale: data.locale || "ar",
  };
}

interface AuthState {
  user: Profile | null;
  loading: boolean;
  error: string | null;
  isDemoMode: boolean;
  loginAs: (role: UserRole) => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  init: () => Promise<void>;
}

export const useAuth = create<AuthState>()((set) => ({
  user: null,
  loading: false,
  error: null,
  isDemoMode: false,

  loginAs: async (role) => {
    set({ loading: true, error: null });
    try {
      if (isSupabaseConfigured && supabase) {
        const cred = CREDENTIALS[role];
        const { data, error } = await supabase.auth.signInWithPassword(cred);
        if (error || !data.user) throw error || new Error("Login failed");
        const profile = await fetchProfile(data.user.id);
        const user = profile || {
          id: data.user.id,
          fullName: data.user.user_metadata?.full_name || data.user.email!,
          email: data.user.email!,
          role: (data.user.user_metadata?.role as UserRole) || "participant",
        };
        if (import.meta.env.DEV) {
          console.log(
            "%c✅ Auth%c Supabase login → " + user.email + " (" + user.role + ")",
            "color:#22c55e;font-weight:bold",
            "color:inherit",
          );
        }
        set({ user, loading: false, isDemoMode: false });
      } else {
        set({ user: DEMO_USERS[role], loading: false, isDemoMode: true });
      }
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.warn("⚠️ Supabase login failed, falling back to demo:", err.message);
      }
      set({ user: DEMO_USERS[role], loading: false, error: null, isDemoMode: true });
    }
  },

  loginWithPassword: async (email, password) => {
    set({ loading: true, error: null });
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const profile = await fetchProfile(data.user.id);
        set({
          user: profile || {
            id: data.user!.id,
            fullName: data.user?.user_metadata?.full_name || email,
            email: data.user!.email!,
            role: (data.user?.user_metadata?.role as UserRole) || "participant",
          },
          loading: false,
        });
      } else {
        const demoUser = Object.values(DEMO_USERS).find((u) => u.email === email);
        if (demoUser) {
          set({ user: demoUser, loading: false });
        } else {
          set({ error: "Invalid credentials (demo mode)", loading: false });
        }
      }
    } catch (err: any) {
      set({ error: err.message || "Login failed", loading: false });
    }
  },

  logout: async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem("events-auth");
    set({ user: null, error: null, isDemoMode: false });
    window.location.replace("/login");
  },

  init: async () => {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const profile = await fetchProfile(data.session.user.id);
        set({
          user: profile || {
            id: data.session.user.id,
            fullName: data.session.user.user_metadata?.full_name || data.session.user.email!,
            email: data.session.user.email!,
            role: (data.session.user.user_metadata?.role as UserRole) || "participant",
          },
          isDemoMode: false,
        });
      }
    }
  },
}));
