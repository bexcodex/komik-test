import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg bg-card">
      <Skeleton className="aspect-[3/4] w-full" />
      <div className="p-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-2 h-3 w-2/3" />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
