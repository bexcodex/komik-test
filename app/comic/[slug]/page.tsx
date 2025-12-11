import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, Play, Clock } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FavoriteButton } from "@/components/favorite-button"
import { ComicGrid } from "@/components/comic-grid"
import { getComicDetail } from "@/lib/api"

interface ComicPageProps {
  params: Promise<{ slug: string }>
}

export default async function ComicPage({ params }: ComicPageProps) {
  const { slug } = await params

  let comic
  try {
    comic = await getComicDetail(slug)
  } catch {
    notFound()
  }

  const latestChapterLink = comic.latestChapter?.apiLink?.replace("/baca-chapter/", "/read/")
  const firstChapterLink = comic.firstChapter?.apiLink?.replace("/baca-chapter/", "/read/")

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-7xl px-4 py-6">
        {/* Back button */}
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href="/">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>

        {/* Comic Info */}
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Thumbnail */}
          <div className="mx-auto w-full max-w-xs shrink-0 lg:mx-0">
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl shadow-2xl">
              <Image
                src={comic.thumbnail || "/placeholder.svg?height=400&width=300&query=comic cover"}
                alt={comic.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{comic.title}</h1>
              {comic.alternativeTitle && <p className="mt-1 text-sm text-muted-foreground">{comic.alternativeTitle}</p>}
            </div>

            {/* Genres */}
            {comic.genres && comic.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {comic.genres.map((genre) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}

            {/* Info Table */}
            {comic.info && Object.keys(comic.info).length > 0 && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(comic.info).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-muted-foreground">{key}:</span> <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Synopsis */}
            {comic.sinopsis && (
              <div>
                <h2 className="mb-2 font-semibold">Synopsis</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{comic.sinopsis}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              {firstChapterLink && (
                <Button asChild>
                  <Link href={firstChapterLink}>
                    <Play className="mr-2 h-4 w-4" />
                    Start Reading
                  </Link>
                </Button>
              )}
              {latestChapterLink && latestChapterLink !== firstChapterLink && (
                <Button variant="outline" asChild>
                  <Link href={latestChapterLink}>
                    <Clock className="mr-2 h-4 w-4" />
                    Latest Chapter
                  </Link>
                </Button>
              )}
              <FavoriteButton slug={comic.slug} title={comic.title} thumbnail={comic.thumbnail} />
            </div>
          </div>
        </div>

        {/* Chapters List */}
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-semibold">Chapters ({comic.chapters?.length || 0})</h2>
          <div className="max-h-[500px] overflow-y-auto rounded-lg border border-border">
            {comic.chapters && comic.chapters.length > 0 ? (
              <div className="divide-y divide-border">
                {comic.chapters.map((chapter) => {
                  const chapterLink = chapter.apiLink?.replace("/baca-chapter/", "/read/")
                  return (
                    <Link
                      key={chapter.chapterNumber}
                      href={chapterLink || "#"}
                      className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-secondary"
                    >
                      <div>
                        <p className="font-medium">{chapter.title || `Chapter ${chapter.chapterNumber}`}</p>
                        <p className="text-xs text-muted-foreground">{chapter.date}</p>
                      </div>
                      {chapter.views && <span className="text-xs text-muted-foreground">{chapter.views} views</span>}
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">No chapters available</div>
            )}
          </div>
        </section>

        {/* Similar Comics */}
        {comic.similarKomik && comic.similarKomik.length > 0 && (
          <section className="mt-10">
            <ComicGrid comics={comic.similarKomik} title="Similar Comics" />
          </section>
        )}
      </main>
    </div>
  )
}
