import Link from 'next/link'
import type { SerializedMangaListItem } from '@/lib/manga/serialize'

interface MangaCardProps {
  manga: SerializedMangaListItem
  linkToRead?: boolean
}

export function MangaCard({ manga, linkToRead = true }: MangaCardProps) {
  // Always use the thumbnail endpoint for lazy loading (don't embed base64)
  const thumbnailSrc = `/manga/${manga.request.slug}/thumbnail`

  const href = linkToRead
    ? `/manga/${manga.request.slug}/read`
    : `/manga/${manga.request.slug}`

  return (
    <div className="flex-shrink-0 w-32 sm:w-36 snap-start">
      <div className="manga-card overflow-hidden group">
        <Link href={href}>
          <div className="aspect-[7/10] relative overflow-hidden bg-[#1a1a1a]">
            <img
              src={thumbnailSrc}
              alt={`${manga.meta.name} thumbnail`}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
        <div className="text-center px-2 py-2 bg-[var(--manga-white)]">
          <h3 className="text-xs font-bold line-clamp-2 leading-tight">
            <Link href={`/manga/${manga.request.slug}`} className="hover:text-[var(--manga-red)] transition-colors">
              {manga.meta.name}
            </Link>
          </h3>
        </div>
      </div>
    </div>
  )
}
