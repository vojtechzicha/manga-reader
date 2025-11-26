import { MangaCard } from './MangaCard'
import type { SerializedMangaListItem } from '@/lib/manga/serialize'

interface MangaGridProps {
  mangas: SerializedMangaListItem[]
  heading: string
  maxRows?: number // kept for API compatibility but ignored
  variant?: 'default' | 'alternate'
  headingLevel?: 'h2' | 'h3'
  linkToRead?: boolean
  keyPrefix?: string // Optional prefix for unique keys when same manga appears in multiple grids
}

export function MangaGrid({
  mangas,
  heading,
  variant = 'default',
  headingLevel = 'h2',
  linkToRead = true,
  keyPrefix,
}: MangaGridProps) {
  // Deduplicate mangas by ID
  const uniqueMangas = mangas.filter(
    (manga, index, self) => self.findIndex((m) => m._id === manga._id) === index
  )

  if (uniqueMangas.length === 0) return null

  const bgClass =
    variant === 'alternate'
      ? 'bg-[var(--manga-gray)]'
      : 'bg-[var(--background)]'

  const HeadingTag = headingLevel

  return (
    <section className={`py-8 ${bgClass}`}>
      <div className="container">
        <div className="mb-4 flex items-center justify-between">
          <HeadingTag className="manga-section-title">
            {heading}
          </HeadingTag>
          <span className="text-xs font-bold uppercase tracking-wide opacity-50">
            {mangas.length} titles
          </span>
        </div>

        {/* Horizontal scroll container */}
        <div className="manga-scroll -mx-4 px-4">
          <div className="flex gap-3 pb-4">
            {mangas.map((manga) => (
              <MangaCard
                key={keyPrefix ? `${keyPrefix}-${manga._id}` : manga._id.toString()}
                manga={manga}
                linkToRead={linkToRead}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
