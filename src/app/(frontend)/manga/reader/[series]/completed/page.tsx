import { requireAuth } from '@/lib/auth/middleware'
import { getMangaDetail } from '@/lib/manga/queries'
import { CompletedScreen } from './CompletedScreen'

interface CompletedPageProps {
  params: Promise<{ series: string }>
}

export default async function CompletedPage({ params }: CompletedPageProps) {
  await requireAuth()
  const { series } = await params
  const { details } = await getMangaDetail(series)
  const mangaName = details?.meta.name ?? series

  return <CompletedScreen mangaName={mangaName} series={series} />
}
