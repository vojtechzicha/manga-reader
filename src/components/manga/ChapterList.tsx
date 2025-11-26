import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import type { Chapter } from '@/lib/manga/types'

interface ChapterListProps {
  chapters: Chapter[]
  mangaSlug: string
}

export function ChapterList({ chapters, mangaSlug }: ChapterListProps) {
  // Filter out hidden chapters
  const visibleChapters = chapters.filter((ch) => !ch.hidden)

  if (visibleChapters.length === 0) {
    return (
      <div className="manga-panel p-8 text-center opacity-70">
        No chapters available
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {visibleChapters.map((chapter) => {
        const isUnread = !chapter.read

        return (
          <Link
            key={chapter._id.toString()}
            href={`/manga/reader/${mangaSlug}/${chapter.chapterPath}`}
            className={`
              manga-card speed-lines relative block p-4 overflow-hidden
              ${isUnread ? 'manga-unread-bar' : ''}
            `}
          >
            {/* Content */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-grow min-w-0">
                <h3
                  className={`
                    text-sm leading-tight mb-1 truncate
                    ${isUnread ? 'font-bold' : 'font-normal opacity-70'}
                  `}
                >
                  {chapter.name}
                </h3>
                <p className="text-xs opacity-50">
                  {chapter.lastUpdated
                    ? formatDistanceToNow(new Date(chapter.lastUpdated), {
                        addSuffix: true,
                      })
                    : '-'}
                </p>
              </div>

              {/* New Badge */}
              {!chapter.seen && (
                <span className="manga-badge flex-shrink-0">
                  NEW
                </span>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
