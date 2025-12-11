import { Suspense } from "react"
import { Header } from "@/components/header"
import { ComicGrid } from "@/components/comic-grid"
import { SkeletonGrid } from "@/components/skeleton-card"
import { getRecommendations, getPopularComics, getColoredComics } from "@/lib/api"

async function RecommendedComics() {
  const comics = await getRecommendations()
  return <ComicGrid comics={comics} title="Recommended for You" priority />
}

async function PopularComics() {
  const comics = await getPopularComics()
  return <ComicGrid comics={comics} title="Popular Comics" />
}

async function ColoredComics() {
  const comics = await getColoredComics()
  return <ComicGrid comics={comics} title="Full Color Comics" />
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-7xl space-y-10 px-4 py-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-background to-accent/10 p-8 md:p-12">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Your Ultimate <span className="text-primary">Comic Reading</span> Experience
            </h1>
            <p className="mt-4 text-muted-foreground md:text-lg">
              Discover thousands of manga, manhwa, and manhua. Read your favorites with auto-scroll, track your
              progress, and never miss a chapter.
            </p>
          </div>
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        </section>

        {/* Recommended Comics */}
        <Suspense fallback={<SkeletonGrid count={12} />}>
          <RecommendedComics />
        </Suspense>

        {/* Popular Comics */}
        <Suspense fallback={<SkeletonGrid count={12} />}>
          <PopularComics />
        </Suspense>

        {/* Full Color Comics */}
        <Suspense fallback={<SkeletonGrid count={12} />}>
          <ColoredComics />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          <p>KomikReader - Read your favorite comics online</p>
        </div>
      </footer>
    </div>
  )
}
