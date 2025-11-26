import { HeroPanelSkeleton, MangaGridSkeleton } from '@/components/manga'

export default function HomeLoading() {
  return (
    <div className="pb-12">
      <HeroPanelSkeleton />
      <MangaGridSkeleton variant="alternate" />
      <MangaGridSkeleton variant="default" />
      <MangaGridSkeleton variant="alternate" />
      <MangaGridSkeleton variant="default" />
    </div>
  )
}
