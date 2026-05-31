import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { mockRegistrations } from "@/lib/mockData";
import type { Registration, RegistrationStatus } from "@/types";

export type RegistrationInput = Omit<Registration, "id" | "createdAt">;

const STORAGE_KEY = "registrations-data";

function loadLocal(): Registration[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [...mockRegistrations];
  } catch {
    return [...mockRegistrations];
  }
}

function saveLocal(items: Registration[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function mapRegistration(row: any): Registration {
  return {
    id: row.id,
    eventId: row.event_id,
    participantId: row.participant_id,
    status: row.status as RegistrationStatus,
    createdAt: row.created_at?.slice(0, 10) ?? "",
  };
}

function uid() {
  return `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

interface RegistrationsState {
  registrations: Registration[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  add: (input: RegistrationInput) => Promise<void>;
  setStatus: (id: string, status: RegistrationStatus) => Promise<void>;
  remove: (id: string) => Promise<void>;
  subscribeRealtime: () => () => void;
}

export const useRegistrations = create<RegistrationsState>((set) => ({
  registrations: loadLocal(),
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      set({ registrations: loadLocal(), loading: false });
      return;
    }
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      if (import.meta.env.DEV) console.warn("⚠️ registrations: Supabase fetch failed:", error.message);
      set({ registrations: loadLocal(), error: null, loading: false });
    } else {
      const mapped = (data || []).map(mapRegistration);
      if (import.meta.env.DEV) console.log(`✅ registrations: loaded ${mapped.length} from Supabase`);
      saveLocal(mapped);
      set({ registrations: mapped, loading: false });
    }
  },

  add: async (input) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      const item: Registration = {
        id: uid(),
        createdAt: new Date().toISOString().slice(0, 10),
        ...input,
      };
      set((s) => {
        const next = [item, ...s.registrations];
        saveLocal(next);
        return { registrations: next, loading: false };
      });
      return;
    }
    const { data, error } = await supabase
      .from("registrations")
      .insert({
        event_id: input.eventId,
        participant_id: input.participantId,
        status: input.status,
      })
      .select()
      .single();
    if (error) {
      if (import.meta.env.DEV) console.warn("⚠️ registrations: add failed:", error.message);
      const item: Registration = { id: uid(), createdAt: new Date().toISOString().slice(0, 10), ...input };
      set((s) => {
        const next = [item, ...s.registrations];
        saveLocal(next);
        return { registrations: next, error: null, loading: false };
      });
    } else if (data) {
      set((s) => {
        const next = [mapRegistration(data), ...s.registrations];
        saveLocal(next);
        return { registrations: next, loading: false };
      });
    }
  },

  setStatus: async (id, status) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      set((s) => {
        const next = s.registrations.map((r) => (r.id === id ? { ...r, status } : r));
        saveLocal(next);
        return { registrations: next, loading: false };
      });
      return;
    }
    const { error } = await supabase.from("registrations").update({ status }).eq("id", id);
    if (error) {
      if (import.meta.env.DEV) console.warn("⚠️ registrations: setStatus failed:", error.message);
    }
    set((s) => {
      const next = s.registrations.map((r) => (r.id === id ? { ...r, status } : r));
      saveLocal(next);
      return { registrations: next, error: null, loading: false };
    });
  },

  remove: async (id) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      set((s) => {
        const next = s.registrations.filter((r) => r.id !== id);
        saveLocal(next);
        return { registrations: next, loading: false };
      });
      return;
    }
    const { error } = await supabase.from("registrations").delete().eq("id", id);
    if (error) {
      if (import.meta.env.DEV) console.warn("⚠️ registrations: delete failed:", error.message);
    }
    set((s) => {
      const next = s.registrations.filter((r) => r.id !== id);
      saveLocal(next);
      return { registrations: next, error: null, loading: false };
    });
  },

  subscribeRealtime: () => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) return () => {};

    const channel = client
      .channel("registrations-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "registrations" },
        (payload) => {
          if (import.meta.env.DEV) console.log("Realtime registrations payload:", payload);
          if (payload.eventType === "INSERT") {
            const mapped = mapRegistration(payload.new);
            set((s) => {
              if (s.registrations.some((r) => r.id === mapped.id)) return {};
              const next = [mapped, ...s.registrations];
              saveLocal(next);
              return { registrations: next };
            });
          } else if (payload.eventType === "UPDATE") {
            const mapped = mapRegistration(payload.new);
            set((s) => {
              const next = s.registrations.map((r) => (r.id === mapped.id ? mapped : r));
              saveLocal(next);
              return { registrations: next };
            });
          } else if (payload.eventType === "DELETE") {
            const id = payload.old.id;
            set((s) => {
              const next = s.registrations.filter((r) => r.id !== id);
              saveLocal(next);
              return { registrations: next };
            });
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  },
}));
