import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { mockUsers } from "@/lib/mockData";
import type { Profile, UserRole } from "@/types";

export type UserInput = Omit<Profile, "id">;

const STORAGE_KEY = "users-data";

function loadLocal(): Profile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [...mockUsers];
  } catch {
    return [...mockUsers];
  }
}

function saveLocal(users: Profile[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function mapProfile(row: any): Profile {
  return {
    id: row.id,
    fullName: row.full_name || row.email,
    email: row.email,
    role: row.role as UserRole,
    avatarUrl: row.avatar_url || undefined,
    locale: row.locale || "ar",
  };
}

function uid() {
  return `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

interface UsersState {
  users: Profile[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  add: (input: UserInput) => Promise<void>;
  update: (id: string, input: UserInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useUsers = create<UsersState>((set) => ({
  users: loadLocal(),
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      set({ users: loadLocal(), loading: false });
      return;
    }
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) {
      if (import.meta.env.DEV) console.warn("⚠️ users: Supabase fetch failed, using local:", error.message);
      set({ users: loadLocal(), error: null, loading: false });
    } else {
      const mapped = (data || []).map(mapProfile);
      if (import.meta.env.DEV) console.log(`✅ users: loaded ${mapped.length} from Supabase`);
      saveLocal(mapped);
      set({ users: mapped, loading: false });
    }
  },

  add: async (input) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      const item: Profile = { id: uid(), ...input };
      set((s) => {
        const next = [item, ...s.users];
        saveLocal(next);
        return { users: next, loading: false };
      });
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        full_name: input.fullName,
        email: input.email,
        role: input.role,
        avatar_url: input.avatarUrl,
        locale: input.locale,
      })
      .select()
      .single();
    if (error) {
      console.warn("Supabase add failed, using local:", error.message);
      const item: Profile = { id: uid(), ...input };
      set((s) => {
        const next = [item, ...s.users];
        saveLocal(next);
        return { users: next, error: null, loading: false };
      });
    } else if (data) {
      set((s) => {
        const next = [mapProfile(data), ...s.users];
        saveLocal(next);
        return { users: next, loading: false };
      });
    }
  },

  update: async (id, input) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      set((s) => {
        const next = s.users.map((u) => (u.id === id ? { ...u, ...input } : u));
        saveLocal(next);
        return { users: next, loading: false };
      });
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: input.fullName,
        email: input.email,
        role: input.role,
        avatar_url: input.avatarUrl,
        locale: input.locale,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.warn("Supabase update failed, using local:", error.message);
      set((s) => {
        const next = s.users.map((u) => (u.id === id ? { ...u, ...input } : u));
        saveLocal(next);
        return { users: next, error: null, loading: false };
      });
    } else if (data) {
      set((s) => {
        const next = s.users.map((u) => (u.id === id ? mapProfile(data) : u));
        saveLocal(next);
        return { users: next, loading: false };
      });
    }
  },

  remove: async (id) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      set((s) => {
        const next = s.users.filter((u) => u.id !== id);
        saveLocal(next);
        return { users: next, loading: false };
      });
      return;
    }
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) {
      console.warn("Supabase delete failed, using local:", error.message);
      set((s) => {
        const next = s.users.filter((u) => u.id !== id);
        saveLocal(next);
        return { users: next, error: null, loading: false };
      });
    } else {
      set((s) => {
        const next = s.users.filter((u) => u.id !== id);
        saveLocal(next);
        return { users: next, loading: false };
      });
    }
  },
}));
