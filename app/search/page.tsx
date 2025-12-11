import { Suspense } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { Header } from "@/components/header"
import { ComicGrid } from "@/components/comic-grid"
import { SkeletonGrid } from "@/components/skeleton-card"
import { Button } from "@/components/ui/button"
import { searchComics } from "@/lib/api"

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

async function SearchResults({ query }: { query: string }) {
  const results = await searchComics(query)

  if (!results.data || results.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Search className="mb-4 h-16 w-16 text-muted-foreground/30" />
        <h2 className="mb-2 text-xl font-semibold">No results found</h2>
        <p className="mb-6 text-muted-foreground">Try searching with different keywords</p>
        <Button asChild>
          <Link href="/">Browse Comics</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-6 text-muted-foreground">
        Found {results.total} results for &quot;{query}&quot;
      </p>
      <ComicGrid comics={results.data} />
    </div>
  )
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = q || ""

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Search Results</h1>

        {query ? (
          <Suspense fallback={<SkeletonGrid count={12} />}>
            <SearchResults query={query} />
          </Suspense>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="mb-4 h-16 w-16 text-muted-foreground/30" />
            <h2 className="mb-2 text-xl font-semibold">Enter a search term</h2>
            <p className="text-muted-foreground">Search for your favorite comics by title</p>
          </div>
        )}
      </main>
    </div>
  )
}
