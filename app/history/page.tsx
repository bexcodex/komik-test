"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Clock, Trash2, BookOpen } from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { getHistory, clearHistory, type ReadingHistory } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function HistoryPage() {
  const [history, setHistory] = useState<ReadingHistory[]>([])
  const { toast } = useToast()

  useEffect(() => {
    setHistory(getHistory())
  }, [])

  const handleClearHistory = () => {
    clearHistory()
    setHistory([])
    toast({
      title: "History cleared",
      description: "Your reading history has been cleared.",
    })
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  // Group history by comic
  const groupedHistory = history.reduce(
    (acc, item) => {
      if (!acc[item.comicSlug]) {
        acc[item.comicSlug] = {
          comicTitle: item.comicTitle,
          comicSlug: item.comicSlug,
          chapters: [],
        }
      }
      acc[item.comicSlug].chapters.push(item)
      return acc
    },
    {} as Record<string, { comicTitle: string; comicSlug: string; chapters: ReadingHistory[] }>,
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Reading History</h1>
          </div>

          {history.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear History
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear reading history?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your reading history. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearHistory}>Clear</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="mb-4 h-16 w-16 text-muted-foreground/30" />
            <h2 className="mb-2 text-xl font-semibold">No reading history</h2>
            <p className="mb-6 text-muted-foreground">Start reading comics to track your progress</p>
            <Button asChild>
              <Link href="/">Browse Comics</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.values(groupedHistory).map(({ comicTitle, comicSlug, chapters }) => (
              <div key={comicSlug} className="rounded-lg border border-border bg-card p-4">
                <Link href={`/comic/${comicSlug}`} className="mb-3 block text-lg font-semibold hover:text-primary">
                  {comicTitle}
                </Link>
                <div className="space-y-2">
                  {chapters.slice(0, 3).map((item) => (
                    <Link
                      key={`${item.chapterSlug}-${item.readAt}`}
                      href={`/read/${item.chapterSlug}/${item.chapterNumber}`}
                      className="flex items-center justify-between rounded-md bg-secondary/50 p-3 transition-colors hover:bg-secondary"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">Chapter {item.chapterNumber}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(item.readAt)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-20">
                          <Progress value={item.progress} className="h-1.5" />
                        </div>
                        <span className="text-xs text-muted-foreground">{Math.round(item.progress)}%</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
