import { Skeleton } from '@/components/ui'
import { MangaCardSkeleton } from './MangaCardSkeleton'

interface MangaGridSkeletonProps {
  variant?: 'default' | 'alternate'
  cardCount?: number
}

export function MangaGridSkeleton({
  variant = 'default',
  cardCount = 8,
}: MangaGridSkeletonProps) {
  const bgClass =
    variant === 'alternate' ? 'bg-[var(--manga-gray)]' : 'bg-[var(--background)]'

  return (
    <section className={`py-8 ${bgClass}`} aria-busy="true">
      <div className="container">
        {/* Title skeleton */}
        <div className="mb-4 flex items-center justify-between">
          <div className="relative">
            <Skeleton className="h-10 w-40" />
            {/* Red shadow effect */}
            <div className="absolute bottom-[-4px] left-[4px] w-full h-full bg-[var(--manga-red)] opacity-30 -z-10" />
          </div>
          <Skeleton className="h-4 w-16 rounded" />
        </div>

        {/* Horizontal scroll container */}
        <div className="manga-scroll -mx-4 px-4">
          <div className="flex gap-3 pb-4">
            {Array.from({ length: cardCount }).map((_, i) => (
              <MangaCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
