import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, BookOpen } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { ComicCard } from "@/components/comic-card"
import { FavoriteButton } from "@/components/favorite-button"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getComicDetail } from "@/lib/scraper"

interface Props {
  params: Promise<{ slug: string }>
}

async function ComicContent({ slug }: { slug: string }) {
  const comic = await getComicDetail(slug)
  if (!comic?.title) notFound()

  const firstChapter = comic.chapters[comic.chapters.length - 1]
  const latestChapter = comic.chapters[0]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="mx-auto w-40 shrink-0 sm:mx-0">
          <Image
            src={comic.thumbnail || "/placeholder.svg?height=280&width=200&query=manga"}
            alt={comic.title}
            width={160}
            height={224}
            className="aspect-[3/4] w-full rounded-lg object-cover"
            priority
            unoptimized
          />
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-xl font-bold">{comic.title}</h1>
            {comic.alternativeTitle && <p className="mt-1 text-sm text-muted-foreground">{comic.alternativeTitle}</p>}
          </div>

          {comic.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {comic.genres.map((g) => (
                <Badge key={g} variant="secondary" className="text-xs">
                  {g}
                </Badge>
              ))}
            </div>
          )}

          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {Object.entries(comic.info).map(([k, v]) => (
              <div key={k} className="flex gap-1">
                <dt className="text-muted-foreground">{k}:</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap gap-2">
            {firstChapter && (
              <Link href={`/baca/${slug}/${firstChapter.chapterNumber}`}>
                <Button size="sm" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Mulai Baca
                </Button>
              </Link>
            )}
            {latestChapter && latestChapter !== firstChapter && (
              <Link href={`/baca/${slug}/${latestChapter.chapterNumber}`}>
                <Button size="sm" variant="outline">
                  Ch. Terbaru
                </Button>
              </Link>
            )}
            <FavoriteButton comic={{ slug, title: comic.title, thumbnail: comic.thumbnail || "" }} />
          </div>
        </div>
      </div>

      {(comic.sinopsis || comic.description) && (
        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-2 font-semibold">Sinopsis</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{comic.sinopsis || comic.description}</p>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-semibold">Daftar Chapter ({comic.chapters.length})</h2>
        <div className="grid gap-1.5">
          {comic.chapters.map((ch) => (
            <Link
              key={ch.chapterNumber}
              href={`/baca/${slug}/${ch.chapterNumber}`}
              className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2.5 text-sm transition-colors hover:bg-accent"
            >
              <span className="font-medium">{ch.title}</span>
              <span className="text-xs text-muted-foreground">{ch.date}</span>
            </Link>
          ))}
        </div>
      </section>

      {comic.similarKomik.length > 0 && (
        <section>
          <h2 className="mb-3 font-semibold">Komik Serupa</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {comic.similarKomik.slice(0, 5).map((c) => (
              <ComicCard key={c.slug} comic={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ComicSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 sm:flex-row">
        <Skeleton className="mx-auto h-56 w-40 rounded-lg sm:mx-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-14" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      </div>
      <Skeleton className="h-28 w-full rounded-lg" />
    </div>
  )
}

export default async function ComicPage({ params }: Props) {
  const { slug } = await params
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>
        <Suspense fallback={<ComicSkeleton />}>
          <ComicContent slug={slug} />
        </Suspense>
      </main>
    </div>
  )
}
