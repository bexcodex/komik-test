import { Suspense } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { ComicCard } from "@/components/comic-card"
import { Skeleton } from "@/components/ui/skeleton"
import { getRecommendations, getPopular } from "@/lib/scraper"

function GridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[3/4] w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  )
}

async function RecommendedSection() {
  const comics = await getRecommendations()
  if (!comics.length) return null
  return (
    <section>
      <h2 className="mb-3 text-base font-semibold">Rekomendasi</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {comics.slice(0, 10).map((comic) => (
          <ComicCard key={comic.slug} comic={comic} />
        ))}
      </div>
    </section>
  )
}

async function PopularSection() {
  const data = await getPopular()
  return (
    <>
      {data.manga?.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-semibold">Manga Populer</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {data.manga.slice(0, 10).map((comic) => (
              <ComicCard key={comic.slug} comic={comic} />
            ))}
          </div>
        </section>
      )}
      {data.manhwa?.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-semibold">Manhwa Populer</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {data.manhwa.slice(0, 10).map((comic) => (
              <ComicCard key={comic.slug} comic={comic} />
            ))}
          </div>
        </section>
      )}
      {data.manhua?.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-semibold">Manhua Populer</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {data.manhua.slice(0, 10).map((comic) => (
              <ComicCard key={comic.slug} comic={comic} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-6">
        <Link href="/cari" className="block">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent">
            <Search className="h-5 w-5" />
            <span>Cari komik...</span>
          </div>
        </Link>

        <Suspense fallback={<GridSkeleton />}>
          <RecommendedSection />
        </Suspense>

        <Suspense fallback={<GridSkeleton />}>
          <PopularSection />
        </Suspense>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">Komiku Reader</footer>
    </div>
  )
}
