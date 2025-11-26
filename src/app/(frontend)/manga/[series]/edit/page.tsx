import { requireAuth } from '@/lib/auth/middleware'
import { getMangaDetail, markAllChaptersAsSeen } from '@/lib/manga/queries'
import { EditChapterList } from '@/components/manga'
import { LinkWithLoading } from '@/components/ui'

interface EditPageProps {
  params: Promise<{ series: string }>
}

export default async function EditPage({ params }: EditPageProps) {
  await requireAuth()
  const { series } = await params

  // Mark all chapters as seen when visiting edit page (removes "New" badges)
  await markAllChaptersAsSeen(series)

  const { chapters } = await getMangaDetail(series)

  // Serialize chapters for client component
  const serializedChapters = chapters.map((ch) => ({
    _id: ch._id.toString(),
    mangaPath: ch.mangaPath,
    chapterPath: ch.chapterPath,
    name: ch.name,
    index: ch.index,
    finalIndex: ch.finalIndex,
    newIndex: ch.newIndex,
    read: ch.read,
    readAt: ch.readAt?.toISOString() ?? null,
    hidden: ch.hidden,
    seen: ch.seen,
    lastUpdated: ch.lastUpdated.toISOString(),
  }))

  // Filter out hidden chapters for display (but keep them for showing all)
  const visibleChapters = serializedChapters.filter((ch) => !ch.hidden)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="manga-section-title">Edit Chapters</h2>
        <LinkWithLoading
          href={`/manga/${series}`}
          className="manga-button"
          variant="manga"
        >
          Back to View
        </LinkWithLoading>
      </div>

      <EditChapterList
        chapters={visibleChapters}
        mangaSlug={series}
      />
    </div>
  )
}
