import { getChapter } from "@/lib/api/komiku";
import ReaderClient from "./client";

export default async function ChapterPage({ params }: { params: { slug: string; chapter: string } }) {
    const data = await getChapter(params.slug, params.chapter);
    return <ReaderClient data={data} />;
}
