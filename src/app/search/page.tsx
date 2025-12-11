"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { searchManga, SearchResult } from "@/lib/api/komiku";
import MangaCard from "@/components/MangaCard";
import { Search, Loader2 } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const router = useRouter();

  // Debounce search input if we want auto-search, but explicit search is better for scraping APIs to avoid rate limits
  // I'll stick to manual search or debounced.

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    
    // Update URL
    router.replace(`/search?q=${encodeURIComponent(query)}`);

    setLoading(true);
    setSearched(true);
    try {
        // Since searchManga is a server-side function, we need a Server Action or an API route. 
        // But wait, I imported `searchManga` which uses axios/cheerio. 
        // In Next.js App Router, if I import this in a Client Component, it might fail if it relies on Node.js specific modules not polyfilled (like fs, net, etc. - but cheerio/axios usually work or polyfill).
        // Actually, cheerio and axios are fine, but CORS might be an issue if running from browser to komiku.org directly.
        // `searchManga` runs on server side if called from Server Component.
        // If called from Client Component, it runs in browser. Browser cannot scrape `komiku.org` due to CORS.
        // So I MUST Create an API Route for search or use Server Actions.
        
        // I'll fetch from my own API route.
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
    } catch (error) {
      console.error(error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      if (initialQuery) {
          handleSearch();
      }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       <div className="max-w-2xl mx-auto mb-10">
        <form onSubmit={handleSearch} className="relative">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari judul komik..."
                className="w-full pl-5 pr-12 py-3 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm"
            />
            <button 
                type="submit"
                className="absolute right-2 top-1.5 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                disabled={loading}
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            </button>
        </form>
       </div>

       {searched && !loading && results.length === 0 && (
           <div className="text-center text-gray-500 mt-10">
               Tidak ada hasil ditemukan untuk "{query}"
           </div>
       )}

       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
           {results.map((manga, idx) => (
                <MangaCard
                    key={idx}
                    title={manga.title}
                    thumbnail={manga.thumbnail}
                    type={manga.type}
                    slug={manga.slug}
                />
           ))}
       </div>
    </div>
  );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>}>
            <SearchContent />
        </Suspense>
    )
}
