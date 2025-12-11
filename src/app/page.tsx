import { getLatest } from "@/lib/api/komiku";
import MangaCard from "@/components/MangaCard";
import Link from "next/link";
import { Search } from "lucide-react";

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const latestManga = await getLatest();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Search Hero */}
      <div className="mb-10 text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
              Baca Komik Online
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Temukan ribuan manga, manhwa, dan manhua favoritmu dalam Bahasa Indonesia.
          </p>
          <div className="max-w-md mx-auto mt-6 relative">
             <Link href="/search" className="block w-full">
                <div className="w-full pl-4 pr-10 py-3 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-left text-gray-400 shadow-sm hover:shadow-md transition-shadow cursor-text flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    <span>Cari komik...</span>
                </div>
             </Link>
          </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                Update Terbaru
            </h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {latestManga.map((manga, index) => (
            <MangaCard
              key={`${manga.title}-${index}`}
              title={manga.title}
              thumbnail={manga.thumbnail}
              type={manga.type}
              latestChapter={manga.latestChapterTitle}
              slug={manga.mangaSlug}
              href={manga.apiDetailLink || undefined}
              updateTime={manga.updateTime}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
