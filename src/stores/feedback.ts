import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Feedback } from "@/types";

export type FeedbackInput = {
  eventId: string;
  sessionId?: string;
  participantId: string;
  rating: number;
  comment?: string;
};

const STORAGE_KEY = "feedback-data";

function loadLocal(): Feedback[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocal(items: Feedback[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function mapFeedback(row: any): Feedback {
  return {
    id: row.id,
    eventId: row.event_id,
    sessionId: row.session_id || undefined,
    participantId: row.participant_id,
    rating: row.rating,
    comment: row.comment || undefined,
    createdAt: row.created_at?.slice(0, 10) ?? "",
  };
}

function uid() {
  return `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

interface FeedbackState {
  items: Feedback[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  add: (input: FeedbackInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
  subscribeRealtime: () => () => void;
}

export const useFeedback = create<FeedbackState>((set) => ({
  items: loadLocal(),
  loading: false,
  error: null,

  fetch: async () => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      set({ items: loadLocal(), loading: false });
      return;
    }
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      if (import.meta.env.DEV) console.warn("⚠️ feedback: Supabase fetch failed:", error.message);
      set({ items: loadLocal(), error: null, loading: false });
    } else {
      const mapped = (data || []).map(mapFeedback);
      if (import.meta.env.DEV) console.log(`✅ feedback: loaded ${mapped.length} from Supabase`);
      saveLocal(mapped);
      set({ items: mapped, loading: false });
    }
  },

  add: async (input) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      const item: Feedback = {
        id: uid(),
        createdAt: new Date().toISOString().slice(0, 10),
        ...input,
      };
      set((s) => {
        const next = [item, ...s.items];
        saveLocal(next);
        return { items: next, loading: false };
      });
      return;
    }
    const { data, error } = await supabase
      .from("feedback")
      .insert({
        event_id: input.eventId,
        session_id: input.sessionId || null,
        participant_id: input.participantId,
        rating: input.rating,
        comment: input.comment || null,
      })
      .select()
      .single();
    if (error) {
      if (import.meta.env.DEV) console.warn("⚠️ feedback: add failed:", error.message);
      const item: Feedback = { id: uid(), createdAt: new Date().toISOString().slice(0, 10), ...input };
      set((s) => {
        const next = [item, ...s.items];
        saveLocal(next);
        return { items: next, error: null, loading: false };
      });
    } else if (data) {
      set((s) => {
        const next = [mapFeedback(data), ...s.items];
        saveLocal(next);
        return { items: next, loading: false };
      });
    }
  },

  remove: async (id) => {
    set({ loading: true, error: null });
    if (!isSupabaseConfigured || !supabase) {
      set((s) => {
        const next = s.items.filter((f) => f.id !== id);
        saveLocal(next);
        return { items: next, loading: false };
      });
      return;
    }
    const { error } = await supabase.from("feedback").delete().eq("id", id);
    if (error && import.meta.env.DEV) console.warn("⚠️ feedback: delete failed:", error.message);
    set((s) => {
      const next = s.items.filter((f) => f.id !== id);
      saveLocal(next);
      return { items: next, error: null, loading: false };
    });
  },

  subscribeRealtime: () => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) return () => {};

    const channel = client
      .channel("feedback-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feedback" },
        (payload) => {
          if (import.meta.env.DEV) console.log("Realtime feedback payload:", payload);
          if (payload.eventType === "INSERT") {
            const mapped = mapFeedback(payload.new);
            set((s) => {
              if (s.items.some((f) => f.id === mapped.id)) return {};
              const next = [mapped, ...s.items];
              saveLocal(next);
              return { items: next };
            });
          } else if (payload.eventType === "DELETE") {
            const id = payload.old.id;
            set((s) => {
              const next = s.items.filter((f) => f.id !== id);
              saveLocal(next);
              return { items: next };
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
