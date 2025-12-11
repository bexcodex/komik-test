import Link from "next/link"
import { Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <h1 className="mb-2 text-6xl font-bold">404</h1>
      <p className="mb-6 text-lg text-muted-foreground">Halaman tidak ditemukan</p>
      <Link href="/">
        <Button className="gap-2">
          <Home className="h-4 w-4" />
          Kembali ke Beranda
        </Button>
      </Link>
    </div>
  )
}
