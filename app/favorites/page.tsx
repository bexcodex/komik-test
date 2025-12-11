"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, Trash2 } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { getFavorites, removeFavorite, type FavoriteComic } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteComic[]>([])
  const { toast } = useToast()

  useEffect(() => {
    setFavorites(getFavorites())
  }, [])

  const handleRemove = (slug: string, title: string) => {
    removeFavorite(slug)
    setFavorites(getFavorites())
    toast({
      title: "Removed from favorites",
      description: `${title} has been removed.`,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          <Heart className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Your Favorites</h1>
        </div>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="mb-4 h-16 w-16 text-muted-foreground/30" />
            <h2 className="mb-2 text-xl font-semibold">No favorites yet</h2>
            <p className="mb-6 text-muted-foreground">Start adding comics to your favorites to see them here</p>
            <Button asChild>
              <Link href="/">Browse Comics</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {favorites.map((comic) => (
              <div key={comic.slug} className="group relative overflow-hidden rounded-lg bg-card">
                <Link href={`/comic/${comic.slug}`}>
                  <div className="relative aspect-[3/4]">
                    <Image
                      src={comic.thumbnail || "/placeholder.svg?height=400&width=300&query=comic cover"}
                      alt={comic.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-2 text-sm font-medium">{comic.title}</h3>
                  </div>
                </Link>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => handleRemove(comic.slug, comic.title)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
