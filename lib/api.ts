import type { Comic, ComicDetail, ChapterData, Genre, SearchResult } from "./types"

const API_BASE = "https://komikurestapi.vercel.app"

async function fetchApi<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`)
  }
  return res.json()
}

export async function getRecommendations(): Promise<Comic[]> {
  return fetchApi<Comic[]>("/rekomendasi")
}

export async function getPopularComics(): Promise<Comic[]> {
  return fetchApi<Comic[]>("/komik-populer")
}

export async function getColoredComics(): Promise<Comic[]> {
  return fetchApi<Comic[]>("/berwarna")
}

export async function getComicDetail(slug: string): Promise<ComicDetail> {
  return fetchApi<ComicDetail>(`/detail-komik/${slug}`)
}

export async function getChapter(slug: string, chapter: string): Promise<ChapterData> {
  return fetchApi<ChapterData>(`/baca-chapter/${slug}/${chapter}`)
}

export async function getAllGenres(): Promise<Genre[]> {
  return fetchApi<Genre[]>("/genre-all")
}

export async function getGenreComics(slug: string): Promise<Comic[]> {
  return fetchApi<Comic[]>(`/genre/${slug}`)
}

export async function searchComics(query: string): Promise<SearchResult> {
  return fetchApi<SearchResult>(`/search?q=${encodeURIComponent(query)}`)
}
