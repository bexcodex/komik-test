"use client"

import Link from "next/link"
import { History, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { clearHistory, getHistory } from "@/lib/storage"
import type { HistoryEntry } from "@/lib/types"

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    setHistory(getHistory())
  }, [])

  const handleClear = () => {
    clearHistory()
    setHistory([])
  }

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold">Riwayat Baca</h1>
          {history.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClear} className="gap-1.5 text-muted-foreground">
              <Trash2 className="h-4 w-4" />
              Hapus
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="py-20 text-center">
            <History className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
            <p className="font-medium">Belum ada riwayat</p>
            <p className="mt-1 text-sm text-muted-foreground">Komik yang kamu baca akan muncul di sini</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {history.map((entry) => (
              <Link
                key={`${entry.comicSlug}-${entry.readAt}`}
                href={`/baca/${entry.chapterSlug}/${entry.chapterNumber}`}
                className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3 transition-colors hover:bg-accent"
              >
                <div>
                  <p className="font-medium">{entry.comicTitle}</p>
                  <p className="text-sm text-muted-foreground">Chapter {entry.chapterNumber}</p>
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(entry.readAt)}</span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
