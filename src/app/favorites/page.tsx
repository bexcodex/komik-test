"use client";

import { useStore } from "@/store/useStore";
import MangaCard from "@/components/MangaCard";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

export default function FavoritesPage() {
    const { favorites } = useStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2 dark:text-white">
                <Heart className="text-red-500 fill-current" />
                Favorit Saya
            </h1>

            {favorites.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">Belum ada komik favorit.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                    {favorites.map((manga, idx) => (
                        <MangaCard
                            key={idx}
                            title={manga.title}
                            thumbnail={manga.thumbnail}
                            slug={manga.slug}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
