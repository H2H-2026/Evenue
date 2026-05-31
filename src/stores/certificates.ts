import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { mockCertificates } from "@/lib/mockData";
import type { Certificate } from "@/types";

export type CertificateInput = {
  participantId: string;
  eventId: string;
};

const STORAGE_KEY = "certificates-data";

function loadLocal(): Certificate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [...mockCertificates];
  } catch {
    return [...mockCertificates];
  }
}

function saveLocal(items: Certificate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function mapCertificate(row: any): Certificate {
  return {
    id: row.id,
    participantId: row.participant_id,
    eventId: row.event_id,
    code: row.code,
    issuedAt: row.issued_at?.slice(0, 10) ?? row.created_at?.slice(0, 10) ?? "",
  };
}

function uid() {
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function genCode() {
  return `EVN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

interface CertificatesState {
  certificates: Certificate[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  issue: (input: CertificateInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useCertificates = create<CertificatesState>((set) => ({
  certificates: loadLocal(),
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      set({ certificates: loadLocal(), loading: false });
      return;
    }
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .order("issued_at", { ascending: false });
    if (error) {
      if (import.meta.env.DEV) console.warn("⚠️ certificates: Supabase fetch failed:", error.message);
      set({ certificates: loadLocal(), error: null, loading: false });
    } else {
      const mapped = (data || []).map(mapCertificate);
      if (import.meta.env.DEV) console.log(`✅ certificates: loaded ${mapped.length} from Supabase`);
      saveLocal(mapped);
      set({ certificates: mapped, loading: false });
    }
  },

  issue: async (input) => {
    set({ loading: true, error: null });
    const code = genCode();
    const issuedAt = new Date().toISOString().slice(0, 10);

    if (!isSupabaseConfigured || !supabase) {
      const item: Certificate = { id: uid(), code, issuedAt, ...input };
      set((s) => {
        const next = [item, ...s.certificates];
        saveLocal(next);
        return { certificates: next, loading: false };
      });
      return;
    }

    const { data, error } = await supabase
      .from("certificates")
      .insert({
        participant_id: input.participantId,
        event_id: input.eventId,
        code,
        issued_at: issuedAt,
      })
      .select()
      .single();
    if (error) {
      if (import.meta.env.DEV) console.warn("⚠️ certificates: issue failed:", error.message);
      const item: Certificate = { id: uid(), code, issuedAt, ...input };
      set((s) => {
        const next = [item, ...s.certificates];
        saveLocal(next);
        return { certificates: next, error: null, loading: false };
      });
    } else if (data) {
      set((s) => {
        const next = [mapCertificate(data), ...s.certificates];
        saveLocal(next);
        return { certificates: next, loading: false };
      });
    }
  },

  remove: async (id) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      set((s) => {
        const next = s.certificates.filter((c) => c.id !== id);
        saveLocal(next);
        return { certificates: next, loading: false };
      });
      return;
    }
    const { error } = await supabase.from("certificates").delete().eq("id", id);
    if (error) {
      if (import.meta.env.DEV) console.warn("⚠️ certificates: delete failed:", error.message);
    }
    set((s) => {
      const next = s.certificates.filter((c) => c.id !== id);
      saveLocal(next);
      return { certificates: next, error: null, loading: false };
    });
  },
}));
