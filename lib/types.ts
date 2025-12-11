export interface Comic {
  title: string
  slug: string
  thumbnail: string
  type?: string
  genre?: string
  latestChapter?: string
  readers?: string
}

export interface ComicDetail {
  title: string
  alternativeTitle?: string
  description?: string
  sinopsis?: string
  thumbnail?: string
  info: Record<string, string>
  genres: string[]
  slug: string
  firstChapter?: ChapterLink
  latestChapter?: ChapterLink
  chapters: Chapter[]
  similarKomik: Comic[]
}

export interface ChapterLink {
  title: string
  originalLink?: string
  apiLink?: string
  chapterNumber: string
}

export interface Chapter {
  title: string
  originalLink?: string
  apiLink?: string
  views?: string
  date?: string
  chapterNumber: string
}

export interface ChapterData {
  title: string
  mangaInfo: {
    title: string
    slug: string
  }
  images: ChapterImage[]
  meta: {
    chapterNumber: string
    totalImages: number
  }
  navigation: {
    prevChapter?: { slug: string; chapter: string } | null
    nextChapter?: { slug: string; chapter: string } | null
  }
}

export interface ChapterImage {
  src: string
  alt?: string
  id?: string
}

export interface SearchResult {
  title: string
  slug: string
  thumbnail: string
  type?: string
  genre?: string
  description?: string
}

export interface FavoriteComic {
  slug: string
  title: string
  thumbnail: string
  addedAt: number
}

export interface HistoryEntry {
  comicSlug: string
  comicTitle: string
  thumbnail: string
  chapterNumber: string
  chapterSlug: string
  readAt: number
}
