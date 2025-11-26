import { Skeleton } from '@/components/ui'

interface ChapterListSkeletonProps {
  count?: number
}

export function ChapterListSkeleton({ count = 9 }: ChapterListSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="manga-skeleton-card p-4 bg-[var(--manga-white)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-grow min-w-0">
              <Skeleton className="h-4 w-3/4 rounded mb-2" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
