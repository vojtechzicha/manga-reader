import type { MangaListItem, MangaWithDate, MangasByGenre } from './types'

// Serialized versions for client components
export interface SerializedMangaListItem {
  _id: string
  meta: {
    name: string
  }
  request: {
    slug: string
  }
  rating?: number
  thumbnail?: string // base64 encoded
}

export interface SerializedMangaWithDate extends SerializedMangaListItem {
  newestRead?: string
  updatedAt?: string
}

export interface SerializedMangasByGenre {
  [genre: string]: SerializedMangaListItem[]
}

/**
 * Serialize a manga list item for client components
 */
export function serializeManga(manga: MangaListItem): SerializedMangaListItem {
  return {
    _id: manga._id.toString(),
    meta: {
      name: manga.meta.name,
    },
    request: {
      slug: manga.request.slug,
    },
    rating: manga.rating,
    thumbnail: manga.thumbnail
      ? Buffer.from(manga.thumbnail).toString('base64')
      : undefined,
  }
}

/**
 * Serialize a manga with date for client components
 */
export function serializeMangaWithDate(
  manga: MangaWithDate
): SerializedMangaWithDate {
  return {
    ...serializeManga(manga),
    newestRead: manga.newestRead?.toISOString(),
    updatedAt: manga.updatedAt?.toISOString(),
  }
}

/**
 * Serialize an array of manga list items
 */
export function serializeMangaList(
  mangas: MangaListItem[]
): SerializedMangaListItem[] {
  return mangas.map(serializeManga)
}

/**
 * Serialize an array of manga with dates
 */
export function serializeMangaWithDateList(
  mangas: MangaWithDate[]
): SerializedMangaWithDate[] {
  return mangas.map(serializeMangaWithDate)
}

/**
 * Serialize manga grouped by genre
 */
export function serializeMangasByGenre(
  byGenre: MangasByGenre
): SerializedMangasByGenre {
  const result: SerializedMangasByGenre = {}
  for (const [genre, mangas] of Object.entries(byGenre)) {
    result[genre] = serializeMangaList(mangas)
  }
  return result
}
