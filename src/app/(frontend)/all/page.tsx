import { requireAuth } from '@/lib/auth/middleware'
import { getAllMangaSeries } from '@/lib/manga/queries'
import { serializeMangaList } from '@/lib/manga/serialize'
import { MangaTable } from '@/components/manga'

export default async function AllMangasPage() {
  await requireAuth()

  const allSeries = await getAllMangaSeries()
  const serializedAllSeries = serializeMangaList(allSeries)

  return (
    <div className="pb-12">
      <MangaTable mangas={serializedAllSeries} heading="All Mangas" />
    </div>
  )
}
