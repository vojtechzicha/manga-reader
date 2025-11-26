import { Skeleton } from '@/components/ui'

export function MangaCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-32 sm:w-36 snap-start">
      <div className="manga-skeleton-card overflow-hidden">
        {/* Image area */}
        <Skeleton className="aspect-[7/10]" />
        {/* Title area */}
        <div className="px-2 py-2 bg-[var(--manga-white)]">
          <Skeleton className="h-3 rounded mb-1" />
          <Skeleton className="h-3 rounded w-3/4" />
        </div>
      </div>
    </div>
  )
}
