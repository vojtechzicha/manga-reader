import { Skeleton } from '@/components/ui'

interface MangaTableSkeletonProps {
  rowCount?: number
}

export function MangaTableSkeleton({ rowCount = 10 }: MangaTableSkeletonProps) {
  return (
    <section className="py-8 md:py-12" aria-busy="true">
      <div className="container">
        {/* Header with search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="relative">
            <Skeleton className="h-10 w-36" />
            {/* Red shadow effect */}
            <div className="absolute bottom-[-4px] left-[4px] w-full h-full bg-[var(--manga-red)] opacity-30 -z-10" />
          </div>
          <Skeleton className="h-10 w-full sm:w-64 rounded" />
        </div>

        {/* Results count skeleton */}
        <Skeleton className="h-4 w-24 rounded mb-4" />

        {/* Table rows skeleton */}
        <div className="space-y-2">
          {Array.from({ length: rowCount }).map((_, i) => (
            <div
              key={i}
              className="manga-skeleton-card p-4 flex items-center justify-between gap-4 bg-[var(--manga-white)]"
            >
              <Skeleton className="h-5 flex-grow rounded" />
              <Skeleton className="h-4 w-24 flex-shrink-0 rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
