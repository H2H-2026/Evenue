import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { mockSessions } from "@/lib/mockData";
import type { Session } from "@/types";

export type SessionInput = Omit<Session, "id">;

const STORAGE_KEY = "sessions-data";

function loadLocal(): Session[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [...mockSessions];
  } catch {
    return [...mockSessions];
  }
}

function saveLocal(sessions: Session[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function mapSession(row: any): Session {
  return {
    id: row.id,
    eventId: row.event_id,
    title: row.title,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    trainerId: row.trainer_id || undefined,
    venueId: row.venue_id || undefined,
    capacity: row.capacity || undefined,
  };
}

function uid() {
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

interface SessionsState {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  add: (input: SessionInput) => Promise<void>;
  update: (id: string, input: SessionInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useSessions = create<SessionsState>((set) => ({
  sessions: loadLocal(),
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      set({ sessions: loadLocal(), loading: false });
      return;
    }
    const { data, error } = await supabase.from("sessions").select("*").order("created_at", { ascending: false });
    if (error) {
      if (import.meta.env.DEV) console.warn("⚠️ sessions: Supabase fetch failed, using local:", error.message);
      set({ sessions: loadLocal(), error: null, loading: false });
    } else {
      const mapped = (data || []).map(mapSession);
      if (import.meta.env.DEV) console.log(`✅ sessions: loaded ${mapped.length} from Supabase`);
      saveLocal(mapped);
      set({ sessions: mapped, loading: false });
    }
  },

  add: async (input) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      const item: Session = { id: uid(), ...input };
      set((s) => {
        const next = [item, ...s.sessions];
        saveLocal(next);
        return { sessions: next, loading: false };
      });
      return;
    }
    const { data, error } = await supabase.from("sessions").insert({
      event_id: input.eventId,
      title: input.title,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      trainer_id: input.trainerId,
      venue_id: input.venueId,
      capacity: input.capacity,
    }).select().single();
    if (error) {
      console.warn("Supabase add failed, using local:", error.message);
      const item: Session = { id: uid(), ...input };
      set((s) => {
        const next = [item, ...s.sessions];
        saveLocal(next);
        return { sessions: next, error: null, loading: false };
      });
    } else if (data) {
      set((s) => {
        const next = [mapSession(data), ...s.sessions];
        saveLocal(next);
        return { sessions: next, loading: false };
      });
    }
  },

  update: async (id, input) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      set((s) => {
        const next = s.sessions.map((x) => (x.id === id ? { ...x, ...input } : x));
        saveLocal(next);
        return { sessions: next, loading: false };
      });
      return;
    }
    const { data, error } = await supabase.from("sessions").update({
      event_id: input.eventId,
      title: input.title,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      trainer_id: input.trainerId,
      venue_id: input.venueId,
      capacity: input.capacity,
    }).eq("id", id).select().single();
    if (error) {
      console.warn("Supabase update failed, using local:", error.message);
      set((s) => {
        const next = s.sessions.map((x) => (x.id === id ? { ...x, ...input } : x));
        saveLocal(next);
        return { sessions: next, error: null, loading: false };
      });
    } else if (data) {
      set((s) => {
        const next = s.sessions.map((x) => (x.id === id ? mapSession(data) : x));
        saveLocal(next);
        return { sessions: next, loading: false };
      });
    }
  },

  remove: async (id) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      set((s) => {
        const next = s.sessions.filter((x) => x.id !== id);
        saveLocal(next);
        return { sessions: next, loading: false };
      });
      return;
    }
    const { error } = await supabase.from("sessions").delete().eq("id", id);
    if (error) {
      console.warn("Supabase delete failed, using local:", error.message);
      set((s) => {
        const next = s.sessions.filter((x) => x.id !== id);
        saveLocal(next);
        return { sessions: next, error: null, loading: false };
      });
    } else {
      set((s) => {
        const next = s.sessions.filter((x) => x.id !== id);
        saveLocal(next);
        return { sessions: next, loading: false };
      });
    }
  },
}));
