'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SearchInput } from '../ui/SearchInput'
import { StarRating } from './StarRating'
import type { SerializedMangaListItem } from '@/lib/manga/serialize'

interface MangaTableProps {
  mangas: SerializedMangaListItem[]
  heading: string
}

export function MangaTable({ mangas, heading }: MangaTableProps) {
  const [searchText, setSearchText] = useState('')

  const filteredMangas = mangas.filter(
    (manga) =>
      searchText === '' ||
      manga.meta.name.toLowerCase().includes(searchText.toLowerCase()) ||
      manga.request.slug.includes(searchText.toLowerCase())
  )

  return (
    <section className="py-8 md:py-12">
      <div className="container">
        {/* Header with search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h2 className="manga-section-title">
            {heading}
          </h2>
          <SearchInput
            placeholder="Search manga..."
            value={searchText}
            onValueChange={setSearchText}
            className="sm:max-w-xs"
          />
        </div>

        {/* Results count */}
        <p className="text-sm opacity-70 mb-4">
          {filteredMangas.length} {filteredMangas.length === 1 ? 'series' : 'series'} found
        </p>

        {/* Manga List */}
        <div className="space-y-2">
          {filteredMangas.map((manga) => (
            <Link
              key={manga._id.toString()}
              href={`/manga/${manga.request.slug}`}
              className="manga-card speed-lines block p-4 flex items-center justify-between gap-4"
            >
              <div className="flex-grow min-w-0">
                <h3 className="font-bold truncate">
                  {manga.meta.name}
                </h3>
              </div>
              <div className="flex-shrink-0">
                {(manga.rating ?? 0) > 0 ? (
                  <StarRating value={manga.rating ?? 0} readonly />
                ) : (
                  <span className="text-xs opacity-40 italic">not rated</span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {filteredMangas.length === 0 && (
          <div className="manga-panel p-8 text-center opacity-70">
            No manga found matching &ldquo;{searchText}&rdquo;
          </div>
        )}
      </div>
    </section>
  )
}
