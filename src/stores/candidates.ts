import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { mockCandidates } from "@/lib/mockData";
import type { Candidate } from "@/types";

export type CandidateInput = Omit<Candidate, "id" | "createdAt">;

const STORAGE_KEY = "candidates-data";

function loadLocal(): Candidate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [...mockCandidates];
  } catch {
    return [...mockCandidates];
  }
}

function saveLocal(candidates: Candidate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
}

function mapCandidate(row: any): Candidate {
  return {
    id: row.id,
    centerId: row.center_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone || undefined,
    jobTitle: row.job_title || undefined,
    department: row.department || undefined,
    status: row.status as Candidate["status"],
    notes: row.notes || undefined,
    createdAt: row.created_at,
  };
}

function uid() {
  return `can_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

interface CandidatesState {
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  fetch: (centerId?: string) => Promise<void>;
  fetchByCenter: (centerId: string) => Candidate[];
  add: (input: CandidateInput) => Promise<void>;
  update: (id: string, input: Partial<CandidateInput>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useCandidates = create<CandidatesState>((set, get) => ({
  candidates: loadLocal(),
  loading: false,
  error: null,

  fetch: async (centerId?: string) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      const all = loadLocal();
      const filtered = centerId ? all.filter((c) => c.centerId === centerId) : all;
      set({ candidates: filtered, loading: false });
      return;
    }
    let query = supabase.from("candidates").select("*").order("created_at", { ascending: false });
    if (centerId) {
      query = query.eq("center_id", centerId);
    }
    const { data, error } = await query;
    if (error) {
      console.warn("Supabase fetch failed, using local:", error.message);
      const all = loadLocal();
      const filtered = centerId ? all.filter((c) => c.centerId === centerId) : all;
      set({ candidates: filtered, error: null, loading: false });
    } else {
      const mapped = (data || []).map(mapCandidate);
      // Merge with local storage to keep all candidates
      const existing = loadLocal();
      const merged = [...existing.filter((c) => !mapped.find((m) => m.id === c.id)), ...mapped];
      saveLocal(merged);
      set({ candidates: mapped, loading: false });
    }
  },

  fetchByCenter: (centerId: string) => {
    const all = get().candidates;
    return all.filter((c) => c.centerId === centerId);
  },

  add: async (input) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      const now = new Date().toISOString();
      const item: Candidate = { id: uid(), ...input, createdAt: now };
      set((s) => {
        const next = [item, ...s.candidates];
        saveLocal(next);
        return { candidates: next, loading: false };
      });
      return;
    }
    const { data, error } = await supabase
      .from("candidates")
      .insert({
        center_id: input.centerId,
        full_name: input.fullName,
        email: input.email,
        phone: input.phone,
        job_title: input.jobTitle,
        department: input.department,
        status: input.status,
        notes: input.notes,
      })
      .select()
      .single();
    if (error) {
      console.warn("Supabase add failed, using local:", error.message);
      const now = new Date().toISOString();
      const item: Candidate = { id: uid(), ...input, createdAt: now };
      set((s) => {
        const next = [item, ...s.candidates];
        saveLocal(next);
        return { candidates: next, error: null, loading: false };
      });
    } else if (data) {
      set((s) => {
        const next = [mapCandidate(data), ...s.candidates];
        saveLocal(next);
        return { candidates: next, loading: false };
      });
    }
  },

  update: async (id, input) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      set((s) => {
        const next = s.candidates.map((c) => (c.id === id ? { ...c, ...input } : c));
        saveLocal(next);
        return { candidates: next, loading: false };
      });
      return;
    }
    const updateData: any = {};
    if (input.centerId !== undefined) updateData.center_id = input.centerId;
    if (input.fullName !== undefined) updateData.full_name = input.fullName;
    if (input.email !== undefined) updateData.email = input.email;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.jobTitle !== undefined) updateData.job_title = input.jobTitle;
    if (input.department !== undefined) updateData.department = input.department;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.notes !== undefined) updateData.notes = input.notes;

    const { data, error } = await supabase
      .from("candidates")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.warn("Supabase update failed, using local:", error.message);
      set((s) => {
        const next = s.candidates.map((c) => (c.id === id ? { ...c, ...input } : c));
        saveLocal(next);
        return { candidates: next, error: null, loading: false };
      });
    } else if (data) {
      set((s) => {
        const next = s.candidates.map((c) => (c.id === id ? mapCandidate(data) : c));
        saveLocal(next);
        return { candidates: next, loading: false };
      });
    }
  },

  remove: async (id) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      set((s) => {
        const next = s.candidates.filter((c) => c.id !== id);
        saveLocal(next);
        return { candidates: next, loading: false };
      });
      return;
    }
    const { error } = await supabase.from("candidates").delete().eq("id", id);
    if (error) {
      console.warn("Supabase delete failed, using local:", error.message);
      set((s) => {
        const next = s.candidates.filter((c) => c.id !== id);
        saveLocal(next);
        return { candidates: next, error: null, loading: false };
      });
    } else {
      set((s) => {
        const next = s.candidates.filter((c) => c.id !== id);
        saveLocal(next);
        return { candidates: next, loading: false };
      });
    }
  },
}));
