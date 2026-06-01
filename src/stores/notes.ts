import { create } from "zustand";

export interface Note {
  id: string;
  userId: string;
  materialId: string;
  slideIndex: number;
  content: string;
  updatedAt: string;
}

const STORAGE_KEY = "participant-notes";

interface NotesState {
  notes: Note[];
  loading: boolean;
  saveNote: (materialId: string, slideIndex: number, userId: string, content: string) => Promise<void>;
  getNote: (materialId: string, slideIndex: number, userId: string) => string;
  hasNotesForMaterial: (materialId: string, userId: string) => boolean;
}

export const useNotes = create<NotesState>((set, get) => ({
  notes: (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })(),
  loading: false,

  saveNote: async (materialId, slideIndex, userId, content) => {
    set({ loading: true });
    const currentNotes = get().notes;
    const filtered = currentNotes.filter(
      (n) => !(n.materialId === materialId && n.slideIndex === slideIndex && n.userId === userId)
    );

    if (content.trim()) {
      filtered.push({
        id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        userId,
        materialId,
        slideIndex,
        content: content.trim(),
        updatedAt: new Date().toISOString(),
      });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    set({ notes: filtered, loading: false });
  },

  getNote: (materialId, slideIndex, userId) => {
    return (
      get().notes.find(
        (n) => n.materialId === materialId && n.slideIndex === slideIndex && n.userId === userId
      )?.content ?? ""
    );
  },

  hasNotesForMaterial: (materialId, userId) => {
    return get().notes.some((n) => n.materialId === materialId && n.userId === userId && n.content.trim().length > 0);
  },
}));
