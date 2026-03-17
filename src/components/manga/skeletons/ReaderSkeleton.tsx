import Link from 'next/link'

interface ReaderSkeletonProps {
  mangaName?: string
  chapterName?: string
  series?: string
}

export function ReaderSkeleton({ mangaName, chapterName, series }: ReaderSkeletonProps) {
  const hasInfo = mangaName && chapterName

  return (
    <div className="min-h-screen bg-[var(--manga-gray)]">
      {/* Header */}
      <div className="reader-header bg-[var(--manga-white)] py-4 sticky top-14 z-40 border-b-4 border-[var(--manga-border)]">
        <div className="container">
          {hasInfo ? (
            <h1 className="text-lg md:text-xl font-bold">
              {series ? (
                <Link
                  href={`/manga/${series}`}
                  className="text-[var(--manga-black)] hover:text-[var(--manga-red)] transition-colors"
                >
                  {mangaName}
                </Link>
              ) : (
                <span className="text-[var(--manga-black)]">{mangaName}</span>
              )}
              <span className="text-[var(--manga-red)] mx-2">&mdash;</span>
              <span className="font-black text-[var(--manga-black)]">{chapterName}</span>
            </h1>
          ) : (
            <div className="flex items-center gap-2">
              <div className="manga-skeleton h-6 w-40 rounded" />
              <span className="text-[var(--manga-red)] mx-1">&mdash;</span>
              <div className="manga-skeleton h-6 w-32 rounded" />
            </div>
          )}
        </div>
      </div>

      {/* Reader content area — manga page placeholders */}
      <section className="py-8 bg-[var(--manga-gray)]">
        <div className="container max-w-4xl">
          <div className="flex flex-col items-center gap-1">
            {/* Simulate stacked manga pages with bordered panels */}
            {[
              { h: 'aspect-[2/3]', delay: '0s' },
              { h: 'aspect-[3/4]', delay: '0.15s' },
              { h: 'aspect-[2/3]', delay: '0.3s' },
              { h: 'aspect-[3/4]', delay: '0.45s' },
            ].map((page, i) => (
              <div
                key={i}
                className={`w-full ${page.h} border-2 border-[var(--manga-border)] bg-[var(--manga-white)] relative overflow-hidden`}
                style={{ opacity: 1 - i * 0.1 }}
              >
                <div
                  className="absolute inset-0 manga-skeleton"
                  style={{ animationDelay: page.delay }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="reader-footer bg-[var(--manga-white)] py-6 sticky bottom-0 z-40 border-t-4 border-[var(--manga-border)]">
        <div className="container">
          <div className="flex justify-between items-center">
            <div className="manga-skeleton h-10 w-40 rounded transform skew-x-[-5deg]" />
            <span className="px-4 py-2 font-bold text-[var(--manga-black)] opacity-40 uppercase tracking-wide text-sm">
              Back to Series
            </span>
            <div className="manga-skeleton h-10 w-36 rounded transform skew-x-[-5deg]" />
          </div>
        </div>
      </div>
    </div>
  )
}
