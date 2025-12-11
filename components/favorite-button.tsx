"use client"

import { Heart } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { addFavorite, isFavorite, removeFavorite } from "@/lib/storage"
import { toast } from "sonner"

interface Props {
  comic: { slug: string; title: string; thumbnail: string }
}

export function FavoriteButton({ comic }: Props) {
  const [fav, setFav] = useState(false)

  useEffect(() => {
    setFav(isFavorite(comic.slug))
  }, [comic.slug])

  const toggle = () => {
    if (fav) {
      removeFavorite(comic.slug)
      setFav(false)
      toast("Dihapus dari favorit")
    } else {
      addFavorite(comic)
      setFav(true)
      toast("Ditambahkan ke favorit")
    }
  }

  return (
    <Button variant={fav ? "default" : "outline"} size="icon" onClick={toggle} className="h-9 w-9">
      <Heart className={`h-4 w-4 ${fav ? "fill-current" : ""}`} />
    </Button>
  )
}
