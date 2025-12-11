"use client"

import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <h1 className="mb-2 text-2xl font-bold">Terjadi Kesalahan</h1>
      <p className="mb-6 text-muted-foreground">Maaf, terjadi kesalahan saat memuat halaman</p>
      <Button onClick={reset} className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Coba Lagi
      </Button>
    </div>
  )
}
