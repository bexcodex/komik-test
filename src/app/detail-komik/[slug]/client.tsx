"use client";

import { MangaDetail } from "@/lib/api/komiku";
import { useStore } from "@/store/useStore";
import Image from "next/image";
import Link from "next/link";
import { Heart, Eye, BookOpen, Calendar, Share2, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function MangaDetailClient({ data }: { data: MangaDetail }) {
    const { toggleFavorite, isFavorite, history } = useStore();
    const [isFav, setIsFav] = useState(false);
    
    // Check hydration match
    useEffect(() => {
        setIsFav(isFavorite(data.slug));
    }, [isFavorite, data.slug]);

    const handleToggleFavorite = () => {
        toggleFavorite({
            slug: data.slug,
            title: data.title,
            thumbnail: data.thumbnail,
            addedAt: Date.now()
        });
        setIsFav(!isFav);
    };

    // Find if in history to highlight last read
    const historyItem = history.find(h => h.slug === data.slug);

    const imageUrl = `/api/image?url=${encodeURIComponent(data.thumbnail)}`;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* Header Background Blur */}
                <div className="h-48 md:h-64 relative overflow-hidden">
                     <div className="absolute inset-0 bg-gray-900/50 z-10"></div>
                     <Image 
                        src={imageUrl} 
                        alt="Background" 
                        fill 
                        className="object-cover blur-xl opacity-50"
                     />
                </div>

                <div className="relative z-20 -mt-32 md:-mt-40 px-6 pb-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0 mx-auto md:mx-0 w-48 md:w-64 relative rounded-xl shadow-2xl overflow-hidden border-4 border-white dark:border-gray-800 aspect-[3/4]">
                            <Image 
                                src={imageUrl} 
                                alt={data.title} 
                                fill 
                                className="object-cover"
                                priority
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-grow pt-4 md:pt-32 text-center md:text-left">
                            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">{data.title}</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{data.alternativeTitle}</p>
                            
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                                {data.genres.map((g, i) => (
                                    <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-xs font-medium">
                                        {g}
                                    </span>
                                ))}
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                                <button 
                                    onClick={handleToggleFavorite}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                        isFav 
                                        ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" 
                                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                    }`}
                                >
                                    <Heart className={`w-5 h-5 ${isFav ? "fill-current" : ""}`} />
                                    {isFav ? "Favorit" : "Tambah Favorit"}
                                </button>
                                
                                {historyItem && (
                                    <Link 
                                        href={historyItem.lastChapterLink}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        <BookOpen className="w-5 h-5" />
                                        Lanjut Baca {historyItem.lastChapter}
                                    </Link>
                                )}
                            </div>

                             {/* Metadata Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                {Object.entries(data.info).map(([key, value]) => (
                                    <div key={key}>
                                        <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase">{key}</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Synopsis */}
                <div className="px-6 pb-8 border-b border-gray-100 dark:border-gray-700">
                     <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Sinopsis</h3>
                     <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                         {data.sinopsis}
                     </p>
                </div>

                {/* Chapters */}
                <div className="px-6 py-8">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Daftar Chapter</h3>
                    <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                         <div className="space-y-2">
                             {data.chapters.map((chapter, idx) => (
                                 <Link 
                                    key={idx}
                                    href={chapter.apiLink || "#"}
                                    className={`flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-gray-100 dark:border-gray-700 ${
                                        historyItem?.lastChapterLink === chapter.apiLink ? "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800" : ""
                                    }`}
                                 >
                                     <div className="flex items-center gap-3">
                                         <span className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md text-xs font-bold">
                                             {data.chapters.length - idx}
                                         </span>
                                         <div>
                                            <p className={`font-medium text-sm ${historyItem?.lastChapterLink === chapter.apiLink ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"}`}>
                                                {chapter.title}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{chapter.date}</p>
                                         </div>
                                     </div>
                                     <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                         <span className="hidden sm:flex items-center gap-1"><Eye className="w-3 h-3"/> {chapter.views}</span>
                                         <ArrowRight className="w-4 h-4" />
                                     </div>
                                 </Link>
                             ))}
                         </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
