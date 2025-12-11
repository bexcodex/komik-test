// Comic/Manga types based on the API structure
export interface Comic {
  title: string
  slug: string
  thumbnail: string
  type?: string
  genre?: string
  description?: string
  altTitle?: string
  originalLink?: string
  apiDetailLink?: string
}

export interface ComicDetail {
  title: string
  alternativeTitle: string
  description: string
  sinopsis: string
  thumbnail: string
  info: Record<string, string>
  genres: string[]
  slug: string
  firstChapter: ChapterLink
  latestChapter: ChapterLink
  chapters: Chapter[]
  similarKomik: Comic[]
}

export interface ChapterLink {
  title: string
  originalLink: string
  apiLink: string | null
  chapterNumber: string
}

export interface Chapter {
  title: string
  originalLink: string
  apiLink: string | null
  views: string
  date: string
  chapterNumber: string
}

export interface ChapterData {
  title: string
  mangaInfo: {
    title: string
    originalLink: string
    apiLink: string | null
    slug: string
  }
  description: string
  chapterInfo: Record<string, string>
  images: ChapterImage[]
  meta: {
    chapterNumber: string
    totalImages: number
    publishDate: string
    slug: string
  }
  navigation: {
    prevChapter: NavigationChapter | null
    nextChapter: NavigationChapter | null
    allChapters: string | null
  }
}

export interface ChapterImage {
  src: string
  alt: string
  id: string
  fallbackSrc: string
}

export interface NavigationChapter {
  originalLink: string
  apiLink: string
  slug: string
  chapter: string
}

export interface Genre {
  title: string
  slug: string
  apiGenreLink: string
  titleAttr: string
}

export interface SearchResult {
  status: boolean
  message: string
  keyword: string
  total: number
  data: Comic[]
}

export interface FavoriteComic {
  slug: string
  title: string
  thumbnail: string
  addedAt: number
}

export interface ReadingHistory {
  comicSlug: string
  comicTitle: string
  comicThumbnail: string
  chapterSlug: string
  chapterNumber: string
  chapterTitle: string
  readAt: number
  progress: number
}
