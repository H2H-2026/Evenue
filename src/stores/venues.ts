import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { mockVenues } from "@/lib/mockData";
import type { Venue } from "@/types";

export type VenueInput = Omit<Venue, "id">;

const STORAGE_KEY = "venues-data";

function loadLocal(): Venue[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [...mockVenues];
  } catch {
    return [...mockVenues];
  }
}

function saveLocal(venues: Venue[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(venues));
}

function mapVenue(row: any): Venue {
  return {
    id: row.id,
    name: row.name,
    city: row.city || undefined,
    address: row.address || undefined,
    capacity: row.capacity || undefined,
  };
}

function uid() {
  return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

interface VenuesState {
  venues: Venue[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  add: (input: VenueInput) => Promise<void>;
  update: (id: string, input: VenueInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useVenues = create<VenuesState>((set) => ({
  venues: loadLocal(),
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      set({ venues: loadLocal(), loading: false });
      return;
    }
    const { data, error } = await supabase.from("venues").select("*").order("created_at", { ascending: false });
    if (error) {
      if (import.meta.env.DEV) console.warn("⚠️ venues: Supabase fetch failed, using local:", error.message);
      set({ venues: loadLocal(), error: null, loading: false });
    } else {
      const mapped = (data || []).map(mapVenue);
      if (import.meta.env.DEV) console.log(`✅ venues: loaded ${mapped.length} from Supabase`);
      saveLocal(mapped);
      set({ venues: mapped, loading: false });
    }
  },

  add: async (input) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      const item: Venue = { id: uid(), ...input };
      set((s) => {
        const next = [item, ...s.venues];
        saveLocal(next);
        return { venues: next, loading: false };
      });
      return;
    }
    const { data, error } = await supabase.from("venues").insert({
      name: input.name,
      city: input.city,
      address: input.address,
      capacity: input.capacity,
    }).select().single();
    if (error) {
      console.warn("Supabase add failed, using local:", error.message);
      const item: Venue = { id: uid(), ...input };
      set((s) => {
        const next = [item, ...s.venues];
        saveLocal(next);
        return { venues: next, error: null, loading: false };
      });
    } else if (data) {
      set((s) => {
        const next = [mapVenue(data), ...s.venues];
        saveLocal(next);
        return { venues: next, loading: false };
      });
    }
  },

  update: async (id, input) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      set((s) => {
        const next = s.venues.map((v) => (v.id === id ? { ...v, ...input } : v));
        saveLocal(next);
        return { venues: next, loading: false };
      });
      return;
    }
    const { data, error } = await supabase.from("venues").update({
      name: input.name,
      city: input.city,
      address: input.address,
      capacity: input.capacity,
    }).eq("id", id).select().single();
    if (error) {
      console.warn("Supabase update failed, using local:", error.message);
      set((s) => {
        const next = s.venues.map((v) => (v.id === id ? { ...v, ...input } : v));
        saveLocal(next);
        return { venues: next, error: null, loading: false };
      });
    } else if (data) {
      set((s) => {
        const next = s.venues.map((v) => (v.id === id ? mapVenue(data) : v));
        saveLocal(next);
        return { venues: next, loading: false };
      });
    }
  },

  remove: async (id) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      set((s) => {
        const next = s.venues.filter((v) => v.id !== id);
        saveLocal(next);
        return { venues: next, loading: false };
      });
      return;
    }
    const { error } = await supabase.from("venues").delete().eq("id", id);
    if (error) {
      console.warn("Supabase delete failed, using local:", error.message);
      set((s) => {
        const next = s.venues.filter((v) => v.id !== id);
        saveLocal(next);
        return { venues: next, error: null, loading: false };
      });
    } else {
      set((s) => {
        const next = s.venues.filter((v) => v.id !== id);
        saveLocal(next);
        return { venues: next, loading: false };
      });
    }
  },
}));
