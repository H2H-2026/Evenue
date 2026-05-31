import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Quiz } from "@/types";
import { mockQuizzes } from "@/lib/mockData";

export type QuizInput = Omit<Quiz, "id">;

interface QuizzesState {
  quizzes: Quiz[];
  add: (input: QuizInput) => void;
  update: (id: string, input: QuizInput) => void;
  remove: (id: string) => void;
}

function uid() {
  return `q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export const useQuizzes = create<QuizzesState>()(
  persist(
    (set) => ({
      quizzes: mockQuizzes,
      add: (input) => set((s) => ({ quizzes: [{ id: uid(), ...input }, ...s.quizzes] })),
      update: (id, input) =>
        set((s) => ({ quizzes: s.quizzes.map((q) => (q.id === id ? { ...q, ...input } : q)) })),
      remove: (id) => set((s) => ({ quizzes: s.quizzes.filter((q) => q.id !== id) })),
    }),
    { name: "quizzes-data" },
  ),
);
