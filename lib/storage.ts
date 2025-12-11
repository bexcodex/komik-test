import type { FavoriteComic, ReadingHistory } from "./types"

const FAVORITES_KEY = "komik-favorites"
const HISTORY_KEY = "komik-history"

// Favorites
export function getFavorites(): FavoriteComic[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(FAVORITES_KEY)
  return stored ? JSON.parse(stored) : []
}

export function addFavorite(comic: Omit<FavoriteComic, "addedAt">): void {
  const favorites = getFavorites()
  const exists = favorites.some((f) => f.slug === comic.slug)
  if (!exists) {
    favorites.unshift({ ...comic, addedAt: Date.now() })
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }
}

export function removeFavorite(slug: string): void {
  const favorites = getFavorites().filter((f) => f.slug !== slug)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
}

export function isFavorite(slug: string): boolean {
  return getFavorites().some((f) => f.slug === slug)
}

// Reading History
export function getHistory(): ReadingHistory[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(HISTORY_KEY)
  return stored ? JSON.parse(stored) : []
}

export function addToHistory(entry: Omit<ReadingHistory, "readAt">): void {
  let history = getHistory()
  // Remove existing entry for same chapter
  history = history.filter((h) => !(h.comicSlug === entry.comicSlug && h.chapterSlug === entry.chapterSlug))
  // Add new entry at the beginning
  history.unshift({ ...entry, readAt: Date.now() })
  // Keep only last 100 entries
  history = history.slice(0, 100)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function updateHistoryProgress(comicSlug: string, chapterSlug: string, progress: number): void {
  const history = getHistory()
  const index = history.findIndex((h) => h.comicSlug === comicSlug && h.chapterSlug === chapterSlug)
  if (index !== -1) {
    history[index].progress = progress
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  }
}

export function clearHistory(): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify([]))
}

export function getLastReadChapter(comicSlug: string): ReadingHistory | null {
  const history = getHistory()
  return history.find((h) => h.comicSlug === comicSlug) || null
}
