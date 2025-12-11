import Image from "next/image"
import Link from "next/link"
import type { Comic } from "@/lib/types"

export function ComicCard({ comic }: { comic: Comic }) {
  return (
    <Link href={`/komik/${comic.slug}`} className="group block">
      <article className="overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/40">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <Image
            src={comic.thumbnail || "/placeholder.svg?height=320&width=240&query=manga"}
            alt={comic.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            unoptimized
          />
          {comic.type && (
            <span className="absolute left-1.5 top-1.5 rounded bg-primary/90 px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
              {comic.type}
            </span>
          )}
        </div>
        <div className="p-2">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug">{comic.title}</h3>
          {comic.latestChapter && <p className="mt-1 truncate text-xs text-muted-foreground">{comic.latestChapter}</p>}
        </div>
      </article>
    </Link>
  )
}
