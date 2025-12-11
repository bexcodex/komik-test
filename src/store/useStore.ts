import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MangaHistory {
  slug: string;
  title: string;
  thumbnail: string;
  lastChapter: string;
  lastChapterLink: string;
  lastReadAt: number;
}

export interface FavoriteManga {
  slug: string;
  title: string;
  thumbnail: string;
  addedAt: number;
}

interface AppState {
  history: MangaHistory[];
  favorites: FavoriteManga[];
  addToHistory: (manga: MangaHistory) => void;
  toggleFavorite: (manga: FavoriteManga) => void;
  isFavorite: (slug: string) => boolean;
  removeFromHistory: (slug: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      history: [],
      favorites: [],
      addToHistory: (manga) =>
        set((state) => {
          const existing = state.history.findIndex((h) => h.slug === manga.slug);
          let newHistory = [...state.history];
          if (existing !== -1) {
            newHistory[existing] = { ...newHistory[existing], ...manga, lastReadAt: Date.now() };
          } else {
            newHistory = [{ ...manga, lastReadAt: Date.now() }, ...newHistory];
          }
          // Keep only last 50 items
          return { history: newHistory.slice(0, 50) };
        }),
      toggleFavorite: (manga) =>
        set((state) => {
          const isFav = state.favorites.some((f) => f.slug === manga.slug);
          if (isFav) {
            return { favorites: state.favorites.filter((f) => f.slug !== manga.slug) };
          } else {
            return { favorites: [{ ...manga, addedAt: Date.now() }, ...state.favorites] };
          }
        }),
      isFavorite: (slug) => get().favorites.some((f) => f.slug === slug),
      removeFromHistory: (slug) =>
        set((state) => ({ history: state.history.filter((h) => h.slug !== slug) })),
    }),
    {
      name: 'komiku-storage',
    }
  )
);
