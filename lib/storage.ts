import type { FavoriteComic, HistoryEntry } from "./types"

const FAVORITES_KEY = "komiku_favorites"
const HISTORY_KEY = "komiku_history"

// Favorites
export function getFavorites(): FavoriteComic[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(FAVORITES_KEY)
  return data ? JSON.parse(data) : []
}

export function addFavorite(comic: Omit<FavoriteComic, "addedAt">): void {
  const favorites = getFavorites()
  if (!favorites.find((f) => f.slug === comic.slug)) {
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

// History
export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(HISTORY_KEY)
  return data ? JSON.parse(data) : []
}

export function addToHistory(entry: Omit<HistoryEntry, "readAt">): void {
  let history = getHistory()
  // Remove existing entry for same comic
  history = history.filter((h) => h.comicSlug !== entry.comicSlug)
  // Add new entry at the beginning
  history.unshift({ ...entry, readAt: Date.now() })
  // Keep only last 50 entries
  history = history.slice(0, 50)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function clearHistory(): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify([]))
}
