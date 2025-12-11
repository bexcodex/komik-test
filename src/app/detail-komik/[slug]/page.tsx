import { getMangaDetail } from "@/lib/api/komiku";
import MangaDetailClient from "./client"; // We'll create a client component for interactivity (favorites)

// Server Component for fetching data
export default async function DetailPage({ params }: { params: { slug: string } }) {
  const data = await getMangaDetail(params.slug);
  
  return <MangaDetailClient data={data} />;
}
