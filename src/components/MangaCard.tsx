import Link from "next/link";
import Image from "next/image";
import { Clock, Eye } from "lucide-react";

interface MangaCardProps {
  title: string;
  thumbnail: string;
  type?: string;
  latestChapter?: string;
  slug?: string;
  href?: string;
  updateTime?: string;
}

export default function MangaCard({
  title,
  thumbnail,
  type,
  latestChapter,
  slug,
  href,
  updateTime
}: MangaCardProps) {
    const link = href || (slug ? `/detail-komik/${slug}` : "#");

    // Use proxy for images
    const imageUrl = `/api/image?url=${encodeURIComponent(thumbnail)}`;

  return (
    <Link href={link} className="group flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {type && (
          <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-medium uppercase tracking-wider">
            {type}
          </span>
        )}
      </div>
      <div className="flex flex-col flex-grow p-3">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-sm leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <div className="mt-auto pt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
           {latestChapter && (
             <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300 truncate max-w-[60%]">
               {latestChapter}
             </span>
           )}
           {updateTime && (
             <div className="flex items-center gap-1 ml-auto">
               <Clock className="w-3 h-3" />
               <span>{updateTime}</span>
             </div>
           )}
        </div>
      </div>
    </Link>
  );
}
