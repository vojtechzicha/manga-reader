import { Skeleton } from '@/components/ui'

export function HeroPanelSkeleton() {
  return (
    <section className="py-8 md:py-12">
      <div className="container">
        <div className="manga-skeleton-panel p-6 md:p-8 mb-8 bg-[var(--manga-white)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Welcome Message skeleton */}
            <div>
              <Skeleton className="h-4 w-24 rounded mb-2" />
              <Skeleton className="h-10 w-48 rounded" />
            </div>

            {/* Quick Stats skeleton */}
            <div className="flex gap-6">
              <div className="text-center">
                <Skeleton className="h-8 w-12 rounded mb-1 mx-auto" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
              <div className="text-center">
                <Skeleton className="h-8 w-12 rounded mb-1 mx-auto" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
