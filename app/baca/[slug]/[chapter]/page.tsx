import { notFound } from "next/navigation"
import { ChapterReader } from "@/components/chapter-reader"
import { getChapter } from "@/lib/scraper"

interface Props {
  params: Promise<{ slug: string; chapter: string }>
}

export default async function ReadPage({ params }: Props) {
  const { slug, chapter } = await params

  let data
  try {
    data = await getChapter(slug, chapter)
  } catch {
    notFound()
  }

  if (!data?.images?.length) notFound()

  return <ChapterReader data={data} slug={slug} chapter={chapter} />
}
