import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { mockMaterials } from "@/lib/mockData";
import type { Material, MaterialType } from "@/types";

export type MaterialInput = Omit<Material, "id">;

const STORAGE_KEY = "materials-data";

function loadLocal(): Material[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [...mockMaterials];
  } catch {
    return [...mockMaterials];
  }
}

function saveLocal(items: Material[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function mapMaterial(row: any): Material {
  return {
    id: row.id,
    eventId: row.event_id,
    sessionId: row.session_id || undefined,
    title: row.title,
    type: row.type as MaterialType,
    url: row.url,
    access: row.access as "public" | "restricted" || "public",
  };
}

function uid() {
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

interface MaterialsState {
  materials: Material[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  add: (input: MaterialInput) => Promise<void>;
  update: (id: string, input: MaterialInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
  uploadFile: (file: File) => Promise<string>;
}

export const useMaterials = create<MaterialsState>((set) => ({
  materials: loadLocal(),
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      set({ materials: loadLocal(), loading: false });
      return;
    }
    const { data, error } = await supabase
      .from("materials")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      if (import.meta.env.DEV) console.warn("⚠️ materials: Supabase fetch failed, using local:", error.message);
      set({ materials: loadLocal(), error: null, loading: false });
    } else {
      const mapped = (data || []).map(mapMaterial);
      if (import.meta.env.DEV) console.log(`✅ materials: loaded ${mapped.length} from Supabase`);
      saveLocal(mapped);
      set({ materials: mapped, loading: false });
    }
  },

  add: async (input) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      const item: Material = { id: uid(), ...input };
      set((s) => {
        const next = [item, ...s.materials];
        saveLocal(next);
        return { materials: next, loading: false };
      });
      return;
    }

    const { data, error } = await supabase
      .from("materials")
      .insert({
        event_id: input.eventId,
        session_id: input.sessionId || null,
        title: input.title,
        type: input.type,
        url: input.url,
        access: input.access || "public",
      })
      .select()
      .single();

    if (error) {
      if (import.meta.env.DEV) console.warn("⚠️ materials: add failed:", error.message);
      set({ error: error.message, loading: false });
    } else if (data) {
      set((s) => {
        const next = [mapMaterial(data), ...s.materials];
        saveLocal(next);
        return { materials: next, loading: false };
      });
    }
  },

  update: async (id, input) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      set((s) => {
        const next = s.materials.map((m) => (m.id === id ? { ...m, ...input } : m));
        saveLocal(next);
        return { materials: next, loading: false };
      });
      return;
    }

    const { data, error } = await supabase
      .from("materials")
      .update({
        event_id: input.eventId,
        session_id: input.sessionId || null,
        title: input.title,
        type: input.type,
        url: input.url,
        access: input.access || "public",
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (import.meta.env.DEV) console.warn("⚠️ materials: update failed:", error.message);
      set({ error: error.message, loading: false });
    } else if (data) {
      set((s) => {
        const next = s.materials.map((m) => (m.id === id ? mapMaterial(data) : m));
        saveLocal(next);
        return { materials: next, loading: false };
      });
    }
  },

  remove: async (id) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      set((s) => {
        const next = s.materials.filter((m) => m.id !== id);
        saveLocal(next);
        return { materials: next, loading: false };
      });
      return;
    }

    const { error } = await supabase.from("materials").delete().eq("id", id);
    if (error) {
      if (import.meta.env.DEV) console.warn("⚠️ materials: delete failed:", error.message);
      set({ error: error.message, loading: false });
    } else {
      set((s) => {
        const final = s.materials.filter((m) => m.id !== id);
        saveLocal(final);
        return { materials: final, loading: false };
      });
    }
  },

  uploadFile: async (file: File): Promise<string> => {
    if (!isSupabaseConfigured || !supabase) {
      // Mock mode fallback
      return `https://example.com/demo-uploads/${Date.now()}_${file.name}`;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("materials")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("materials")
      .getPublicUrl(filePath);

    return data.publicUrl;
  },
}));
