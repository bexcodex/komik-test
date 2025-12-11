"use client"

import type React from "react"

import { Search, X, Loader2 } from "lucide-react"
import { useState, useTransition } from "react"
import { ComicCard } from "@/components/comic-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { searchComics } from "@/lib/actions"
import type { Comic } from "@/lib/types"

export function SearchForm() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Comic[]>([])
  const [searched, setSearched] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSearch = () => {
    if (!query.trim()) return
    startTransition(async () => {
      const data = await searchComics(query)
      setResults(data)
      setSearched(true)
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch()
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari komik..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-11 pl-10 pr-10"
            autoFocus
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
              onClick={() => {
                setQuery("")
                setResults([])
                setSearched(false)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button onClick={handleSearch} disabled={isPending || !query.trim()} className="h-11 px-6">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cari"}
        </Button>
      </div>

      {!searched && !isPending && (
        <div className="py-16 text-center text-muted-foreground">
          <Search className="mx-auto mb-3 h-10 w-10 opacity-40" />
          <p>Ketik untuk mencari komik</p>
        </div>
      )}

      {isPending && (
        <div className="py-16 text-center text-muted-foreground">
          <Loader2 className="mx-auto mb-3 h-10 w-10 animate-spin opacity-40" />
          <p>Mencari...</p>
        </div>
      )}

      {searched && !isPending && results.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          <p>Tidak ada hasil untuk "{query}"</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {results.map((comic) => (
            <ComicCard key={comic.slug} comic={comic} />
          ))}
        </div>
      )}
    </div>
  )
}
