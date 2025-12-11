"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronLeft, ChevronRight, Pause, Play, Settings, X } from "lucide-react"
import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { addToHistory } from "@/lib/storage"
import type { ChapterData } from "@/lib/types"

interface Props {
  data: ChapterData
  slug: string
  chapter: string
}

export function ChapterReader({ data, slug, chapter }: Props) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [showUI, setShowUI] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [autoScroll, setAutoScroll] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [current, setCurrent] = useState(1)
  const scrollRef = useRef<number | null>(null)

  useEffect(() => {
    addToHistory({
      comicSlug: data.mangaInfo.slug,
      comicTitle: data.mangaInfo.title,
      thumbnail: "",
      chapterNumber: chapter,
      chapterSlug: slug,
    })
  }, [data.mangaInfo, chapter, slug])

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      const scroll = () => {
        if (containerRef.current) {
          containerRef.current.scrollTop += speed
          scrollRef.current = requestAnimationFrame(scroll)
        }
      }
      scrollRef.current = requestAnimationFrame(scroll)
    } else if (scrollRef.current) {
      cancelAnimationFrame(scrollRef.current)
    }
    return () => {
      if (scrollRef.current) cancelAnimationFrame(scrollRef.current)
    }
  }, [autoScroll, speed])

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    const c = containerRef.current
    const itemH = c.scrollHeight / data.images.length
    const cur = Math.floor(c.scrollTop / itemH) + 1
    setCurrent(Math.min(cur, data.images.length))
  }, [data.images.length])

  const goPrev = () => {
    if (data.navigation.prevChapter) {
      router.push(`/baca/${data.navigation.prevChapter.slug}/${data.navigation.prevChapter.chapter}`)
    }
  }

  const goNext = () => {
    if (data.navigation.nextChapter) {
      router.push(`/baca/${data.navigation.nextChapter.slug}/${data.navigation.nextChapter.chapter}`)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Top Bar */}
      <div
        className={`fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-black/70 to-transparent p-3 transition-transform duration-200 ${showUI ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href={`/komik/${data.mangaInfo.slug}`}>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-white hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{data.mangaInfo.title}</p>
              <p className="text-xs text-white/60">Chapter {chapter}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-white hover:bg-white/10"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Settings */}
      {showSettings && (
        <div className="fixed right-3 top-16 z-50 w-64 rounded-lg bg-card p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-medium">Pengaturan</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowSettings(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Auto Scroll</span>
              <Button size="sm" variant={autoScroll ? "default" : "outline"} onClick={() => setAutoScroll(!autoScroll)}>
                {autoScroll ? <Pause className="mr-1 h-3 w-3" /> : <Play className="mr-1 h-3 w-3" />}
                {autoScroll ? "Stop" : "Start"}
              </Button>
            </div>
            {autoScroll && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Kecepatan</span>
                  <span className="text-muted-foreground">{speed}x</span>
                </div>
                <Slider value={[speed]} min={0.5} max={5} step={0.5} onValueChange={([v]) => setSpeed(v)} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Images */}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto"
        onClick={() => !showSettings && setShowUI((p) => !p)}
        onScroll={handleScroll}
      >
        <div className="mx-auto max-w-3xl">
          {data.images.map((img, i) => (
            <div key={img.id || i} className="w-full">
              <Image
                src={img.src || "/placeholder.svg"}
                alt={img.alt || `Page ${i + 1}`}
                width={800}
                height={1200}
                className="w-full"
                priority={i < 3}
                unoptimized
              />
            </div>
          ))}

          {/* End */}
          <div className="flex flex-col items-center gap-4 bg-background p-8">
            <p className="text-sm text-muted-foreground">Akhir Chapter {chapter}</p>
            <div className="flex gap-2">
              {data.navigation.prevChapter && (
                <Button variant="outline" size="sm" onClick={goPrev}>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Prev
                </Button>
              )}
              {data.navigation.nextChapter && (
                <Button size="sm" onClick={goNext}>
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
            <Link
              href={`/komik/${data.mangaInfo.slug}`}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Daftar Chapter
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 bg-gradient-to-t from-black/70 to-transparent p-3 transition-transform duration-200 ${showUI ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 disabled:opacity-30"
            disabled={!data.navigation.prevChapter}
            onClick={goPrev}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Prev
          </Button>
          <span className="text-sm text-white">
            {current} / {data.images.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 disabled:opacity-30"
            disabled={!data.navigation.nextChapter}
            onClick={goNext}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
