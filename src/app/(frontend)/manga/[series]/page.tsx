import { getMangaDetail } from '@/lib/manga/queries'
import { ChapterList } from '@/components/manga'

interface MangaPageProps {
  params: Promise<{ series: string }>
}

export default async function MangaPage({ params }: MangaPageProps) {
  const { series } = await params
  const { chapters } = await getMangaDetail(series)

  return (
    <div className="space-y-6">
      <h2 className="manga-section-title">Chapters</h2>
      <ChapterList chapters={chapters} mangaSlug={series} />
    </div>
  )
}
