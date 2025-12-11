"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isFavorite, addFavorite, removeFavorite } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface FavoriteButtonProps {
  slug: string
  title: string
  thumbnail: string
  variant?: "default" | "icon"
  className?: string
}

export function FavoriteButton({ slug, title, thumbnail, variant = "default", className }: FavoriteButtonProps) {
  const [isFav, setIsFav] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setIsFav(isFavorite(slug))
  }, [slug])

  const toggleFavorite = () => {
    if (isFav) {
      removeFavorite(slug)
      setIsFav(false)
      toast({
        title: "Removed from favorites",
        description: `${title} has been removed from your favorites.`,
      })
    } else {
      addFavorite({ slug, title, thumbnail })
      setIsFav(true)
      toast({
        title: "Added to favorites",
        description: `${title} has been added to your favorites.`,
      })
    }
  }

  if (variant === "icon") {
    return (
      <Button variant="ghost" size="icon" onClick={toggleFavorite} className={cn("h-10 w-10", className)}>
        <Heart className={cn("h-5 w-5 transition-colors", isFav && "fill-red-500 text-red-500")} />
      </Button>
    )
  }

  return (
    <Button variant={isFav ? "default" : "outline"} onClick={toggleFavorite} className={cn("gap-2", className)}>
      <Heart className={cn("h-4 w-4", isFav && "fill-current")} />
      {isFav ? "Favorited" : "Add to Favorites"}
    </Button>
  )
}
