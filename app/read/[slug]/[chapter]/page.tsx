import { notFound } from "next/navigation"
import { ChapterReader } from "@/components/chapter-reader"
import { getChapter } from "@/lib/api"

interface ReadPageProps {
  params: Promise<{ slug: string; chapter: string }>
}

export default async function ReadPage({ params }: ReadPageProps) {
  const { slug, chapter } = await params

  let data
  try {
    data = await getChapter(slug, chapter)
  } catch {
    notFound()
  }

  if (!data || !data.images || data.images.length === 0) {
    notFound()
  }

  return <ChapterReader data={data} />
}
