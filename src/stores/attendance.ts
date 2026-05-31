import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { AttendanceRecord, AttendanceMethod } from "@/types";

const STORAGE_KEY = "attendance-data";

function loadLocal(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocal(items: AttendanceRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function mapRecord(row: any): AttendanceRecord {
  return {
    id: row.id,
    sessionId: row.session_id,
    participantId: row.participant_id,
    method: (row.method ?? "manual") as AttendanceMethod,
    checkedInAt: row.checked_in_at ?? row.created_at ?? "",
  };
}

function uid() {
  return `a_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

interface AttendanceState {
  records: AttendanceRecord[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  isPresent: (sessionId: string, participantId: string) => boolean;
  toggle: (sessionId: string, participantId: string, method?: AttendanceMethod) => Promise<void>;
  subscribeRealtime: () => () => void;
}

export const useAttendance = create<AttendanceState>((set, get) => ({
  records: loadLocal(),
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      set({ records: loadLocal(), loading: false });
      return;
    }
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .order("checked_in_at", { ascending: false });
    if (error) {
      if (import.meta.env.DEV) console.warn("⚠️ attendance: Supabase fetch failed:", error.message);
      set({ records: loadLocal(), error: null, loading: false });
    } else {
      const mapped = (data || []).map(mapRecord);
      if (import.meta.env.DEV) console.log(`✅ attendance: loaded ${mapped.length} from Supabase`);
      saveLocal(mapped);
      set({ records: mapped, loading: false });
    }
  },

  isPresent: (sessionId, participantId) =>
    get().records.some((r) => r.sessionId === sessionId && r.participantId === participantId),

  toggle: async (sessionId, participantId, method = "manual") => {
    const existing = get().records.find(
      (r) => r.sessionId === sessionId && r.participantId === participantId,
    );

    if (existing) {
      // حذف (uncheck)
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from("attendance").delete().eq("id", existing.id);
        if (error && import.meta.env.DEV) console.warn("⚠️ attendance: delete failed:", error.message);
      }
      set((s) => {
        const next = s.records.filter((r) => r.id !== existing.id);
        saveLocal(next);
        return { records: next };
      });
    } else {
      // إضافة (check-in)
      const newRecord: AttendanceRecord = {
        id: uid(),
        sessionId,
        participantId,
        method,
        checkedInAt: new Date().toISOString(),
      };

      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from("attendance")
          .insert({
            session_id: sessionId,
            participant_id: participantId,
            method,
            checked_in_at: newRecord.checkedInAt,
          })
          .select()
          .single();
        if (error) {
          if (import.meta.env.DEV) console.warn("⚠️ attendance: insert failed:", error.message);
        } else if (data) {
          newRecord.id = data.id;
        }
      }

      set((s) => {
        const next = [...s.records, newRecord];
        saveLocal(next);
        return { records: next };
      });
    }
  },

  subscribeRealtime: () => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) return () => {};

    const channel = client
      .channel("attendance-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendance" },
        (payload) => {
          if (import.meta.env.DEV) console.log("Realtime attendance payload:", payload);
          if (payload.eventType === "INSERT") {
            const mapped = mapRecord(payload.new);
            set((s) => {
              if (s.records.some((r) => r.id === mapped.id)) return {};
              const next = [...s.records, mapped];
              saveLocal(next);
              return { records: next };
            });
          } else if (payload.eventType === "DELETE") {
            const id = payload.old.id;
            set((s) => {
              const next = s.records.filter((r) => r.id !== id);
              saveLocal(next);
              return { records: next };
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
