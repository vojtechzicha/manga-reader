import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requireAuth } from '@/lib/auth/middleware'
import {
  getMangaDetail,
  getImages,
  markChapterAsSeen,
  getNextChapter,
  getPreviousChapter,
} from '@/lib/manga/queries'
import { ImageViewer } from '@/components/manga'
import { NavigationForm } from './NavigationForm'

interface ReaderPageProps {
  params: Promise<{ series: string; chapterPath: string }>
}

export default async function ReaderPage({ params }: ReaderPageProps) {
  const session = await requireAuth()

  const { series, chapterPath } = await params

  // Mark chapter as seen
  await markChapterAsSeen(series, chapterPath)

  // Fetch data in parallel
  const [{ details, chapters }, images, nextChapter, prevChapter] = await Promise.all([
    getMangaDetail(series),
    getImages(session.accessToken, series, chapterPath),
    getNextChapter(series, chapterPath),
    getPreviousChapter(series, chapterPath),
  ])

  if (!details) {
    notFound()
  }

  const chapter = chapters.find((ch) => ch.chapterPath === chapterPath)

  if (!chapter) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[var(--manga-gray)]">
      {/* Fixed Header */}
      <div className="bg-[var(--manga-white)] py-4 sticky top-14 z-40 border-b-4 border-[var(--manga-border)]">
        <div className="container">
          <h1 className="text-lg md:text-xl font-bold">
            <Link
              href={`/manga/${series}`}
              className="text-[var(--manga-black)] hover:text-[var(--manga-red)] transition-colors"
            >
              {details.meta.name}
            </Link>
            <span className="text-[var(--manga-red)] mx-2">—</span>
            <span className="font-black text-[var(--manga-black)]">{chapter.name}</span>
          </h1>
        </div>
      </div>

      {/* Images */}
      <section className="py-8 bg-[var(--manga-gray)]">
        <div className="container max-w-4xl">
          <ImageViewer images={images} altText={`${details.meta.name} - ${chapter.name}`} />
        </div>
      </section>

      {/* Navigation Footer */}
      <div className="bg-[var(--manga-white)] py-6 sticky bottom-0 z-40 border-t-4 border-[var(--manga-border)]">
        <div className="container">
          <div className="flex justify-between items-center">
            <NavigationForm
              chapterId={chapter._id.toString()}
              series={series}
              chapterPath={chapterPath}
              direction="previous"
              disabled={!prevChapter}
            />

            <Link
              href={`/manga/${series}`}
              className="px-4 py-2 font-bold text-[var(--manga-black)] hover:text-[var(--manga-red)] transition-colors uppercase tracking-wide text-sm"
            >
              Back to Series
            </Link>

            <NavigationForm
              chapterId={chapter._id.toString()}
              series={series}
              chapterPath={chapterPath}
              direction="next"
              disabled={!nextChapter}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
