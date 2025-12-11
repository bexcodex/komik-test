"use client";

import { ChapterDetail } from "@/lib/api/komiku";
import { useStore } from "@/store/useStore";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Settings, ArrowUp, FastForward } from "lucide-react";

export default function ReaderClient({ data }: { data: ChapterDetail }) {
    const router = useRouter();
    const { addToHistory } = useStore();
    const [autoScroll, setAutoScroll] = useState(false);
    const [autoNext, setAutoNext] = useState(false);
    const [scrollSpeed, setScrollSpeed] = useState(1); // 1-5
    const [showControls, setShowControls] = useState(true);
    const scrollRef = useRef<number | null>(null);
    const lastScrollY = useRef(0);

    // Save to history on mount
    useEffect(() => {
        addToHistory({
            slug: data.mangaInfo.slug,
            title: data.mangaInfo.title,
            thumbnail: "", // Not available in chapter detail unfortunately, or we could pass it if we had it. 
                           // Actually we can try to get it or just leave empty and fetch later.
                           // For now empty string.
            lastChapter: `Chapter ${data.meta.chapterNumber}`,
            lastChapterLink: `/baca-chapter/${data.meta.slug}/${data.meta.chapterNumber}`,
            lastReadAt: Date.now()
        });
    }, [data, addToHistory]);

    // Handle Auto Scroll
    useEffect(() => {
        if (autoScroll) {
            const scroll = () => {
                window.scrollBy(0, scrollSpeed);
                scrollRef.current = requestAnimationFrame(scroll);
            };
            scrollRef.current = requestAnimationFrame(scroll);
        } else {
            if (scrollRef.current) cancelAnimationFrame(scrollRef.current);
        }
        return () => {
            if (scrollRef.current) cancelAnimationFrame(scrollRef.current);
        };
    }, [autoScroll, scrollSpeed]);

    // Toggle controls on click/scroll
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                 setShowControls(false); // Hide on scroll down
            } else {
                 setShowControls(true); // Show on scroll up
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);


    // Auto Next Logic
    useEffect(() => {
        if (!autoNext || !data.navigation.nextChapter) return;

        const handleScroll = () => {
            // Trigger when near bottom (50px)
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
                router.push(data.navigation.nextChapter!.apiLink);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [autoNext, data.navigation.nextChapter, router]);
    
    return (
        <div className="min-h-screen bg-gray-900 text-gray-200">
            {/* Top Bar */}
            <div className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${showControls ? "translate-y-0" : "-translate-y-full"}`}>
                 <div className="bg-gray-900/90 backdrop-blur-md border-b border-gray-800 p-4 flex items-center justify-between">
                     <Link href={data.mangaInfo.apiLink || "/"} className="flex items-center gap-2 text-sm font-medium hover:text-white">
                         <ChevronLeft className="w-5 h-5" />
                         <span className="truncate max-w-[150px] sm:max-w-md">{data.mangaInfo.title}</span>
                     </Link>
                     <div className="flex items-center gap-4">
                         <span className="text-xs text-gray-400 hidden sm:inline">Ch. {data.meta.chapterNumber}</span>
                         <button onClick={() => setAutoScroll(!autoScroll)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${autoScroll ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"}`}>
                             Auto Scroll
                         </button>
                         <button onClick={() => setAutoNext(!autoNext)} className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${autoNext ? "bg-green-600 text-white" : "bg-gray-800 text-gray-400"}`}>
                             <FastForward className="w-3 h-3" /> Auto Next
                         </button>
                     </div>
                 </div>
            </div>

            {/* Images */}
            <div className="max-w-3xl mx-auto pt-16 pb-32" onClick={() => setShowControls(!showControls)}>
                {data.images.map((img, idx) => (
                    <div key={idx} className="relative w-full">
                         {/* Using standard img tag for simplicity in comic reader to avoid layout shifts issues with Next/Image if aspect ratio unknown */}
                         <img 
                            src={`/api/image?url=${encodeURIComponent(img.src)}`} 
                            alt={`Page ${idx + 1}`}
                            loading="lazy"
                            className="w-full h-auto block"
                         />
                    </div>
                ))}
            </div>

            {/* Bottom Controls */}
             <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${showControls ? "translate-y-0" : "translate-y-full"}`}>
                 <div className="bg-gray-900/90 backdrop-blur-md border-t border-gray-800 p-4">
                     <div className="max-w-3xl mx-auto flex items-center justify-between">
                         {data.navigation.prevChapter ? (
                             <Link href={data.navigation.prevChapter.apiLink} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors">
                                 <ChevronLeft className="w-4 h-4" /> Prev
                             </Link>
                         ) : (
                             <button disabled className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 text-gray-600 rounded-lg text-sm font-medium cursor-not-allowed">
                                 <ChevronLeft className="w-4 h-4" /> Prev
                             </button>
                         )}

                         {/* Speed Control if Auto Scroll is ON */}
                         {autoScroll && (
                             <div className="flex items-center gap-2">
                                 <span className="text-xs uppercase font-bold text-gray-500">Speed</span>
                                 <input 
                                    type="range" 
                                    min="1" 
                                    max="10" 
                                    value={scrollSpeed} 
                                    onChange={(e) => setScrollSpeed(Number(e.target.value))}
                                    className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                 />
                             </div>
                         )}

                         {data.navigation.nextChapter ? (
                             <Link href={data.navigation.nextChapter.apiLink} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                                 Next <ChevronRight className="w-4 h-4" />
                             </Link>
                         ) : (
                             <button disabled className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 text-gray-600 rounded-lg text-sm font-medium cursor-not-allowed">
                                 Next <ChevronRight className="w-4 h-4" />
                             </button>
                         )}
                     </div>
                 </div>
            </div>
            
             {/* Scroll to Top */}
            <button 
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className={`fixed bottom-24 right-6 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all z-40 ${showControls ? "translate-x-0" : "translate-x-20"}`}
            >
                <ArrowUp className="w-5 h-5" />
            </button>

        </div>
    );
}
