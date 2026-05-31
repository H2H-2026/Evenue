import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { mockEvents } from "@/lib/mockData";
import type { EventItem, EventStatus } from "@/types";

export type EventInput = Omit<EventItem, "id">;

const STORAGE_KEY = "events-data";

function loadLocal(): EventItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [...mockEvents];
  } catch {
    return [...mockEvents];
  }
}

function saveLocal(events: EventItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function mapEvent(row: any): EventItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status as EventStatus,
    coverUrl: row.cover_url || undefined,
  };
}

function uid() {
  return `e_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

interface EventsState {
  events: EventItem[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  add: (input: EventInput) => Promise<void>;
  update: (id: string, input: EventInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useEvents = create<EventsState>((set) => ({
  events: loadLocal(),
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      set({ events: loadLocal(), loading: false });
      return;
    }
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      if (import.meta.env.DEV) console.warn("⚠️ events: Supabase fetch failed, using local:", error.message);
      set({ events: loadLocal(), error: null, loading: false });
    } else {
      const mapped = (data || []).map(mapEvent);
      if (import.meta.env.DEV) console.log(`✅ events: loaded ${mapped.length} from Supabase`);
      saveLocal(mapped);
      set({ events: mapped, loading: false });
    }
  },

  add: async (input) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      const item: EventItem = { id: uid(), ...input };
      set((s) => {
        const next = [item, ...s.events];
        saveLocal(next);
        return { events: next, loading: false };
      });
      return;
    }
    const { data, error } = await supabase
      .from("events")
      .insert({
        title: input.title,
        description: input.description,
        start_date: input.startDate,
        end_date: input.endDate,
        status: input.status,
        cover_url: input.coverUrl,
      })
      .select()
      .single();
    if (error) {
      console.warn("Supabase add failed, using local:", error.message);
      const item: EventItem = { id: uid(), ...input };
      set((s) => {
        const next = [item, ...s.events];
        saveLocal(next);
        return { events: next, error: null, loading: false };
      });
    } else if (data) {
      set((s) => {
        const next = [mapEvent(data), ...s.events];
        saveLocal(next);
        return { events: next, loading: false };
      });
    }
  },

  update: async (id, input) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      set((s) => {
        const next = s.events.map((e) => (e.id === id ? { ...e, ...input } : e));
        saveLocal(next);
        return { events: next, loading: false };
      });
      return;
    }
    const { data, error } = await supabase
      .from("events")
      .update({
        title: input.title,
        description: input.description,
        start_date: input.startDate,
        end_date: input.endDate,
        status: input.status,
        cover_url: input.coverUrl,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.warn("Supabase update failed, using local:", error.message);
      set((s) => {
        const next = s.events.map((e) => (e.id === id ? { ...e, ...input } : e));
        saveLocal(next);
        return { events: next, error: null, loading: false };
      });
    } else if (data) {
      set((s) => {
        const next = s.events.map((e) => (e.id === id ? mapEvent(data) : e));
        saveLocal(next);
        return { events: next, loading: false };
      });
    }
  },

  remove: async (id) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      set((s) => {
        const next = s.events.filter((e) => e.id !== id);
        saveLocal(next);
        return { events: next, loading: false };
      });
      return;
    }
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      console.warn("Supabase delete failed, using local:", error.message);
      set((s) => {
        const next = s.events.filter((e) => e.id !== id);
        saveLocal(next);
        return { events: next, error: null, loading: false };
      });
    } else {
      set((s) => {
        const next = s.events.filter((e) => e.id !== id);
        saveLocal(next);
        return { events: next, loading: false };
      });
    }
  },
}));
