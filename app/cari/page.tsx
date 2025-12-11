import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { SearchForm } from "@/components/search-form"
import { Skeleton } from "@/components/ui/skeleton"

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Suspense
          fallback={
            <div className="space-y-6">
              <Skeleton className="h-12 w-full" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] w-full rounded-lg" />
                ))}
              </div>
            </div>
          }
        >
          <SearchForm />
        </Suspense>
      </main>
    </div>
  )
}
