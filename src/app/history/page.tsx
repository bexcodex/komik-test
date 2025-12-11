"use client";

import { useStore } from "@/store/useStore";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { History as HistoryIcon, Clock, Trash2 } from "lucide-react";

export default function HistoryPage() {
    const { history, removeFromHistory } = useStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2 dark:text-white">
                <HistoryIcon className="text-blue-500" />
                Riwayat Baca
            </h1>

            {history.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">Belum ada riwayat baca.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {history.map((manga, idx) => {
                         const imageUrl = manga.thumbnail ? `/api/image?url=${encodeURIComponent(manga.thumbnail)}` : null;

                        return (
                            <div key={idx} className="flex bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                                {imageUrl && (
                                     <div className="flex-shrink-0 w-20 h-28 relative rounded-lg overflow-hidden mr-4">
                                        <Image src={imageUrl} alt={manga.title} fill className="object-cover" />
                                    </div>
                                )}
                                <div className="flex-grow flex flex-col justify-between">
                                    <div>
                                        <Link href={`/detail-komik/${manga.slug}`} className="font-bold text-lg text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                                            {manga.title}
                                        </Link>
                                        <div className="mt-2">
                                            <Link href={manga.lastChapterLink} className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                                Lanjut {manga.lastChapter}
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                            <Clock className="w-3 h-3" />
                                            {new Date(manga.lastReadAt).toLocaleDateString()} {new Date(manga.lastReadAt).toLocaleTimeString()}
                                        </div>
                                        <button 
                                            onClick={() => removeFromHistory(manga.slug)}
                                            className="text-red-500 hover:text-red-600 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                                            title="Hapus dari riwayat"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
