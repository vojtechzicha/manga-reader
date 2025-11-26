import { Skeleton } from '@/components/ui'
import { MangaGridSkeleton } from './MangaGridSkeleton'
import { ChapterListSkeleton } from './ChapterListSkeleton'

export function MangaDetailSkeleton() {
  return (
    <div className="bg-[var(--manga-gray)]">
      {/* Manga Header - Splash Panel */}
      <section className="py-8 md:py-12">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cover Panel skeleton */}
            <div className="flex-shrink-0 flex justify-center lg:justify-start">
              <div className="manga-skeleton-panel manga-cover w-56 h-80 bg-[var(--manga-white)]">
                <Skeleton className="w-full h-full" />
              </div>
            </div>

            {/* Details Panel skeleton */}
            <div className="flex-grow">
              {/* Title Block */}
              <div className="mb-4">
                <Skeleton className="h-10 w-3/4 rounded mb-2" />
                <Skeleton className="h-4 w-1/2 rounded" />
              </div>

              {/* Meta Info Strip */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-[var(--manga-red)]" />
                  <Skeleton className="h-5 w-24 rounded" />
                </div>
                <Skeleton className="h-7 w-20 rounded" />
              </div>

              {/* Genres skeleton */}
              <div className="flex flex-wrap gap-2 mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-20 rounded" />
                ))}
              </div>

              {/* Rating skeleton */}
              <div className="flex items-center gap-3 mb-6">
                <Skeleton className="h-4 w-12 rounded" />
                <Skeleton className="h-6 w-32 rounded" />
              </div>

              {/* External Links skeleton */}
              <div className="flex flex-wrap gap-3 mb-8">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>

              {/* CTA Buttons skeleton */}
              <div className="flex gap-3 flex-wrap">
                <Skeleton className="h-12 w-36 transform skew-x-[-5deg]" />
                <Skeleton className="h-12 w-24 rounded" />
              </div>
            </div>
          </div>

          {/* Summary skeleton */}
          <div className="mt-10">
            <div className="manga-skeleton-card p-6 max-w-4xl bg-[var(--manga-cream)]">
              <Skeleton className="h-4 w-full rounded mb-2" />
              <Skeleton className="h-4 w-full rounded mb-2" />
              <Skeleton className="h-4 w-3/4 rounded" />
            </div>
          </div>
        </div>
      </section>

      {/* Chapters List skeleton - container only, title is in nested page */}
      <section className="py-8 bg-[var(--background)]">
        <div className="container">
          <div className="space-y-6">
            <div className="relative inline-block">
              <Skeleton className="h-10 w-32" />
              <div className="absolute bottom-[-4px] left-[4px] w-full h-full bg-[var(--manga-red)] opacity-30 -z-10" />
            </div>
            <ChapterListSkeleton />
          </div>
        </div>
      </section>

      {/* Related by Author skeleton */}
      <MangaGridSkeleton variant="alternate" cardCount={6} />

      {/* Related by Genre skeletons (up to 3 sections) */}
      <MangaGridSkeleton variant="default" cardCount={6} />
      <MangaGridSkeleton variant="alternate" cardCount={6} />
    </div>
  )
}
