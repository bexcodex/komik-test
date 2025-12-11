"use client"

import Image from "next/image"
import Link from "next/link"
import type { Comic } from "@/lib/types"

interface ComicCardProps {
  comic: Comic
  priority?: boolean
}

export function ComicCard({ comic, priority = false }: ComicCardProps) {
  const slug = comic.slug || comic.apiDetailLink?.replace("/detail-komik/", "") || ""

  return (
    <Link
      href={`/comic/${slug}`}
      className="group relative flex flex-col overflow-hidden rounded-lg bg-card transition-all duration-300 hover:ring-2 hover:ring-primary/50"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={comic.thumbnail || "/placeholder.svg?height=400&width=300&query=comic cover"}
          alt={comic.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          priority={priority}
        />
        {comic.type && (
          <span className="absolute left-2 top-2 rounded bg-primary/90 px-2 py-0.5 text-xs font-medium text-primary-foreground">
            {comic.type}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-tight text-card-foreground">{comic.title}</h3>
        {comic.genre && <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{comic.genre}</p>}
      </div>
    </Link>
  )
}
