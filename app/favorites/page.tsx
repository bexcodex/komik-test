"use client"

import { Heart, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { ComicCard } from "@/components/comic-card"
import { Button } from "@/components/ui/button"
import { getFavorites, removeFavorite } from "@/lib/storage"
import type { FavoriteComic } from "@/lib/types"

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteComic[]>([])

  useEffect(() => {
    setFavorites(getFavorites())
  }, [])

  const handleRemove = (slug: string) => {
    removeFavorite(slug)
    setFavorites(getFavorites())
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="mb-6 text-xl font-bold">Favorit</h1>

        {favorites.length === 0 ? (
          <div className="py-20 text-center">
            <Heart className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
            <p className="font-medium">Belum ada favorit</p>
            <p className="mt-1 text-sm text-muted-foreground">Tambahkan komik ke favorit untuk menyimpannya</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {favorites.map((comic) => (
              <div key={comic.slug} className="group relative">
                <ComicCard comic={comic} />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute right-1.5 top-1.5 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => {
                    e.preventDefault()
                    handleRemove(comic.slug)
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
