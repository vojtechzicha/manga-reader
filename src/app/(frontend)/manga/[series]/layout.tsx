import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/auth/middleware'
import {
  getMangaDetail,
  getRelatedMangasByGenre,
  getRelatedMangasByAuthor,
} from '@/lib/manga/queries'
import { getThumbnailUrl } from '@/lib/onedrive/client'
import { serializeMangaList, serializeMangasByGenre } from '@/lib/manga/serialize'
import { MangaGrid } from '@/components/manga'
import { LinkWithLoading } from '@/components/ui'
import { RatingForm } from './RatingForm'

interface MangaLayoutProps {
  children: React.ReactNode
  params: Promise<{ series: string }>
}

export default async function MangaLayout({ children, params }: MangaLayoutProps) {
  const session = await requireAuth()

  const { series } = await params
  const { details } = await getMangaDetail(series)

  if (!details) {
    notFound()
  }

  // Fetch related manga and thumbnail in parallel
  const [relatedByGenre, relatedByAuthor, thumbnailUrl] = await Promise.all([
    getRelatedMangasByGenre(series),
    getRelatedMangasByAuthor(series),
    getThumbnailUrl(session.accessToken, series),
  ])

  // Serialize for client components
  const serializedRelatedByAuthor = serializeMangaList(relatedByAuthor)
  const serializedRelatedByGenre = serializeMangasByGenre(relatedByGenre)

  const genreEntries = Object.entries(serializedRelatedByGenre).slice(0, 3)

  return (
    <div className="bg-[var(--manga-gray)]">
      {/* Manga Header - Splash Panel */}
      <section className="py-8 md:py-12">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cover Panel */}
            <div className="flex-shrink-0 flex justify-center lg:justify-start">
              <div className="manga-panel manga-panel-hover manga-cover w-56 h-80 !bg-[#1a1a1a] flex items-center justify-center">
                <img
                  src={thumbnailUrl}
                  alt={`${details.meta.name} cover`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>

            {/* Details Panel */}
            <div className="flex-grow">
              {/* Title Block */}
              <div className="mb-4">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 transition-transform hover:-translate-y-0.5">
                  {details.meta.name}
                </h1>
                {details.meta.alternativeTitle && (
                  <p className="text-sm opacity-70 italic">
                    Also known as: {details.meta.alternativeTitle}
                  </p>
                )}
              </div>

              {/* Meta Info Strip */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {/* Author */}
                <div className="flex items-center gap-2">
                  <span className="w-1 h-6 bg-[var(--manga-red)]"></span>
                  <span className="font-bold">{details.meta.author}</span>
                </div>

                {/* Status Badge */}
                <span className="manga-status">
                  {details.meta.status}
                </span>
              </div>

              {/* Genres */}
              {details.meta.genres && details.meta.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {details.meta.genres.map((genre) => (
                    <span key={genre} className="manga-tag">
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <span className="font-bold text-sm uppercase tracking-wide opacity-70">
                  Rating
                </span>
                <RatingForm
                  mangaId={details._id.toString()}
                  initialRating={details.rating ?? 0}
                />
              </div>

              {/* External Links */}
              <div className="flex flex-wrap gap-3 mb-8">
                {details.request.url && (
                  <a
                    href={details.request.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold underline underline-offset-2 hover:text-[var(--manga-red)] transition-colors"
                  >
                    View Source
                  </a>
                )}
                {details.meta.additionalData?.source?.url && (
                  <a
                    href={details.meta.additionalData.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold underline underline-offset-2 hover:text-[var(--manga-red)] transition-colors"
                  >
                    {details.meta.additionalData.source.name || 'Official'}
                  </a>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-3 flex-wrap">
                <LinkWithLoading
                  href={`/manga/${series}/read`}
                  className="manga-button text-lg"
                  variant="manga"
                >
                  Start Reading
                </LinkWithLoading>
                <LinkWithLoading
                  href={`/manga/${series}/edit`}
                  className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[var(--manga-border)] font-bold hover:bg-[var(--manga-black)] hover:text-[var(--manga-white)] transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                    />
                  </svg>
                  Edit
                </LinkWithLoading>
              </div>
            </div>
          </div>

          {/* Summary - Narration Box */}
          {details.meta.summary && (
            <div className="mt-10">
              <div className="manga-narration p-6 max-w-4xl">
                <p className="text-base leading-relaxed whitespace-pre-line">
                  {details.meta.summary}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Chapters List */}
      <section className="py-8 bg-[var(--background)]">
        <div className="container">
          {children}
        </div>
      </section>

      {/* Related by Author */}
      {serializedRelatedByAuthor.length > 0 && (
        <MangaGrid
          mangas={serializedRelatedByAuthor}
          heading={`More by ${details.meta.author}`}
          variant="alternate"
          maxRows={1}
          linkToRead={false}
          keyPrefix="related-author"
        />
      )}

      {/* Related by Genre */}
      {genreEntries.map(([genre, mangas], index) => (
        <MangaGrid
          key={genre}
          keyPrefix={`related-${genre}`}
          mangas={mangas}
          heading={`More ${genre}`}
          headingLevel="h3"
          variant={index % 2 === 0 ? 'default' : 'alternate'}
          maxRows={1}
          linkToRead={false}
        />
      ))}
    </div>
  )
}
