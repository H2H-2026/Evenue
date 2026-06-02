import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { mockAssessmentCenters } from "@/lib/mockData";
import type { AssessmentCenter, AssessmentCenterStatus } from "@/types";

export type AssessmentCenterInput = Omit<AssessmentCenter, "id" | "createdAt">;

const STORAGE_KEY = "assessment-centers-data";

function loadLocal(): AssessmentCenter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [...mockAssessmentCenters];
  } catch {
    return [...mockAssessmentCenters];
  }
}

function saveLocal(centers: AssessmentCenter[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(centers));
}

function mapCenter(row: any): AssessmentCenter {
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status as AssessmentCenterStatus,
    maxAssessors: row.max_assessors,
    maxCandidates: row.max_candidates,
    location: row.location || undefined,
    createdAt: row.created_at,
    createdBy: row.created_by || undefined,
  };
}

function uid() {
  return `ac_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

interface AssessmentCentersState {
  centers: AssessmentCenter[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  add: (input: AssessmentCenterInput) => Promise<void>;
  update: (id: string, input: AssessmentCenterInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useAssessmentCenters = create<AssessmentCentersState>((set) => ({
  centers: loadLocal(),
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      set({ centers: loadLocal(), loading: false });
      return;
    }
    const { data, error } = await supabase
      .from("assessment_centers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.warn("Supabase fetch failed, using local:", error.message);
      set({ centers: loadLocal(), error: null, loading: false });
    } else {
      const mapped = (data || []).map(mapCenter);
      saveLocal(mapped);
      set({ centers: mapped, loading: false });
    }
  },

  add: async (input) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      const now = new Date().toISOString();
      const item: AssessmentCenter = { id: uid(), ...input, createdAt: now };
      set((s) => {
        const next = [item, ...s.centers];
        saveLocal(next);
        return { centers: next, loading: false };
      });
      return;
    }
    const { data, error } = await supabase
      .from("assessment_centers")
      .insert({
        name: input.name,
        description: input.description,
        start_date: input.startDate,
        end_date: input.endDate,
        status: input.status,
        max_assessors: input.maxAssessors,
        max_candidates: input.maxCandidates,
        location: input.location,
        created_by: input.createdBy,
      })
      .select()
      .single();
    if (error) {
      console.warn("Supabase add failed, using local:", error.message);
      const now = new Date().toISOString();
      const item: AssessmentCenter = { id: uid(), ...input, createdAt: now };
      set((s) => {
        const next = [item, ...s.centers];
        saveLocal(next);
        return { centers: next, error: null, loading: false };
      });
    } else if (data) {
      set((s) => {
        const next = [mapCenter(data), ...s.centers];
        saveLocal(next);
        return { centers: next, loading: false };
      });
    }
  },

  update: async (id, input) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      set((s) => {
        const next = s.centers.map((c) => (c.id === id ? { ...c, ...input } : c));
        saveLocal(next);
        return { centers: next, loading: false };
      });
      return;
    }
    const { data, error } = await supabase
      .from("assessment_centers")
      .update({
        name: input.name,
        description: input.description,
        start_date: input.startDate,
        end_date: input.endDate,
        status: input.status,
        max_assessors: input.maxAssessors,
        max_candidates: input.maxCandidates,
        location: input.location,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.warn("Supabase update failed, using local:", error.message);
      set((s) => {
        const next = s.centers.map((c) => (c.id === id ? { ...c, ...input } : c));
        saveLocal(next);
        return { centers: next, error: null, loading: false };
      });
    } else if (data) {
      set((s) => {
        const next = s.centers.map((c) => (c.id === id ? mapCenter(data) : c));
        saveLocal(next);
        return { centers: next, loading: false };
      });
    }
  },

  remove: async (id) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      set((s) => {
        const next = s.centers.filter((c) => c.id !== id);
        saveLocal(next);
        return { centers: next, loading: false };
      });
      return;
    }
    const { error } = await supabase.from("assessment_centers").delete().eq("id", id);
    if (error) {
      console.warn("Supabase delete failed, using local:", error.message);
      set((s) => {
        const next = s.centers.filter((c) => c.id !== id);
        saveLocal(next);
        return { centers: next, error: null, loading: false };
      });
    } else {
      set((s) => {
        const next = s.centers.filter((c) => c.id !== id);
        saveLocal(next);
        return { centers: next, loading: false };
      });
    }
  },
}));
