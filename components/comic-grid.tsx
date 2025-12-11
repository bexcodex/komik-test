import type { Comic } from "@/lib/types"
import { ComicCard } from "./comic-card"

interface ComicGridProps {
  comics: Comic[]
  title?: string
  priority?: boolean
}

export function ComicGrid({ comics, title, priority = false }: ComicGridProps) {
  if (!comics || comics.length === 0) return null

  return (
    <section className="space-y-4">
      {title && <h2 className="text-xl font-semibold tracking-tight">{title}</h2>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {comics.map((comic, index) => (
          <ComicCard key={comic.slug || index} comic={comic} priority={priority && index < 6} />
        ))}
      </div>
    </section>
  )
}
