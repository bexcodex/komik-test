"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Settings, Play, Pause, Home, List, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { ChapterData } from "@/lib/types"
import { addToHistory, updateHistoryProgress } from "@/lib/storage"
import { cn } from "@/lib/utils"

interface ChapterReaderProps {
  data: ChapterData
}

export function ChapterReader({ data }: ChapterReaderProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [showControls, setShowControls] = useState(true)
  const [autoScroll, setAutoScroll] = useState(false)
  const [scrollSpeed, setScrollSpeed] = useState(50)
  const [progress, setProgress] = useState(0)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const autoScrollRef = useRef<number | null>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Add to history on mount
  useEffect(() => {
    if (data.mangaInfo.slug && data.meta.chapterNumber) {
      addToHistory({
        comicSlug: data.mangaInfo.slug,
        comicTitle: data.mangaInfo.title,
        comicThumbnail: "",
        chapterSlug: data.meta.slug,
        chapterNumber: data.meta.chapterNumber,
        chapterTitle: data.title,
        progress: 0,
      })
    }
  }, [data])

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const currentProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setProgress(currentProgress)
      setShowBackToTop(scrollTop > 500)

      // Update history progress
      if (data.mangaInfo.slug && data.meta.slug) {
        updateHistoryProgress(data.mangaInfo.slug, data.meta.slug, currentProgress)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [data.mangaInfo.slug, data.meta.slug])

  // Auto-scroll functionality
  useEffect(() => {
    if (autoScroll) {
      const scroll = () => {
        window.scrollBy({ top: 1, behavior: "auto" })
        autoScrollRef.current = requestAnimationFrame(scroll)
      }

      const intervalId = setInterval(() => {
        if (autoScrollRef.current) {
          cancelAnimationFrame(autoScrollRef.current)
        }
        autoScrollRef.current = requestAnimationFrame(scroll)
      }, 100 - scrollSpeed)

      return () => {
        clearInterval(intervalId)
        if (autoScrollRef.current) {
          cancelAnimationFrame(autoScrollRef.current)
        }
      }
    } else {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current)
      }
    }
  }, [autoScroll, scrollSpeed])

  // Auto-advance to next chapter
  useEffect(() => {
    if (progress >= 98 && data.navigation.nextChapter && autoScroll) {
      setAutoScroll(false)
      const timer = setTimeout(() => {
        router.push(data.navigation.nextChapter!.apiLink.replace("/baca-chapter/", "/read/"))
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [progress, data.navigation.nextChapter, autoScroll, router])

  // Hide controls after inactivity
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (!autoScroll) return
      setShowControls(false)
    }, 3000)
  }, [autoScroll])

  useEffect(() => {
    const handleMouseMove = () => resetControlsTimeout()
    const handleTouch = () => resetControlsTimeout()

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("touchstart", handleTouch)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchstart", handleTouch)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [resetControlsTimeout])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-background">
      {/* Progress bar */}
      <div className="fixed left-0 right-0 top-0 z-50 h-1 bg-secondary">
        <div className="h-full bg-primary transition-all duration-150" style={{ width: `${progress}%` }} />
      </div>

      {/* Top Controls */}
      <div
        className={cn(
          "fixed left-0 right-0 top-1 z-40 transition-transform duration-300",
          showControls ? "translate-y-0" : "-translate-y-full",
        )}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 bg-background/95 px-4 py-2 backdrop-blur">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/comic/${data.mangaInfo.slug}`}>
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{data.mangaInfo.title}</p>
              <p className="text-xs text-muted-foreground">Chapter {data.meta.chapterNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAutoScroll(!autoScroll)}
              className={cn(autoScroll && "text-primary")}
            >
              {autoScroll ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Reader Settings</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Auto-Scroll Speed</label>
                    <Slider
                      value={[scrollSpeed]}
                      onValueChange={([value]) => setScrollSpeed(value)}
                      min={10}
                      max={90}
                      step={10}
                    />
                    <p className="text-xs text-muted-foreground">
                      {scrollSpeed < 30 ? "Slow" : scrollSpeed < 60 ? "Medium" : "Fast"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Reading Progress</label>
                    <p className="text-2xl font-bold text-primary">{Math.round(progress)}%</p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="mx-auto max-w-3xl px-0 pb-24 pt-16 sm:px-4">
        {data.images.map((image, index) => (
          <div key={image.id || index} className="relative w-full">
            <Image
              src={image.src || "/placeholder.svg"}
              alt={image.alt || `Page ${index + 1}`}
              width={800}
              height={1200}
              className="h-auto w-full"
              priority={index < 3}
              loading={index < 3 ? "eager" : "lazy"}
              unoptimized
            />
          </div>
        ))}

        {/* End of chapter */}
        <div className="mt-8 space-y-4 px-4 text-center">
          <p className="text-muted-foreground">End of Chapter {data.meta.chapterNumber}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {data.navigation.prevChapter && (
              <Button variant="outline" asChild>
                <Link href={data.navigation.prevChapter.apiLink.replace("/baca-chapter/", "/read/")}>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href={`/comic/${data.mangaInfo.slug}`}>
                <List className="mr-1 h-4 w-4" />
                All Chapters
              </Link>
            </Button>
            {data.navigation.nextChapter && (
              <Button asChild>
                <Link href={data.navigation.nextChapter.apiLink.replace("/baca-chapter/", "/read/")}>
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur transition-transform duration-300",
          showControls ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            disabled={!data.navigation.prevChapter}
            asChild={!!data.navigation.prevChapter}
          >
            {data.navigation.prevChapter ? (
              <Link href={data.navigation.prevChapter.apiLink.replace("/baca-chapter/", "/read/")}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Prev
              </Link>
            ) : (
              <>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Prev
              </>
            )}
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            disabled={!data.navigation.nextChapter}
            asChild={!!data.navigation.nextChapter}
          >
            {data.navigation.nextChapter ? (
              <Link href={data.navigation.nextChapter.apiLink.replace("/baca-chapter/", "/read/")}>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            ) : (
              <>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Back to top */}
      {showBackToTop && (
        <Button
          variant="secondary"
          size="icon"
          className="fixed bottom-20 right-4 z-40 rounded-full shadow-lg"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}
