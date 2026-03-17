import { ObjectId } from 'mongodb'
import { max } from 'date-fns'
import { getMangasCollection, getChaptersCollection } from '../db/mongodb'
import { listImagesForChapter } from '../onedrive/client'
import type { Manga, Chapter, MangaListItem, MangaWithDate, MangasByGenre } from './types'

// Helper function to shuffle array in place
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

/**
 * Get all manga series sorted by name
 */
export async function getAllMangaSeries(): Promise<MangaListItem[]> {
  return await getMangasCollection()
    .find(
      {},
      {
        sort: { 'meta.name': 1 },
        projection: { 'meta.name': 1, 'request.slug': 1, rating: 1 },
      }
    )
    .toArray() as unknown as MangaListItem[]
}

/**
 * Get manga grouped by genre (excluding already-read manga)
 */
export async function getMangaSeriesByGenre(): Promise<MangasByGenre> {
  // Get list of manga paths that have any read chapters
  const readMangaList = (
    await getChaptersCollection()
      .aggregate([
        { $match: { read: true, hidden: false } },
        {
          $group: {
            _id: { mangaPath: '$mangaPath' },
          },
        },
      ])
      .toArray()
  ).map((gr) => gr._id.mangaPath)

  // Get manga that haven't been read, with their genres
  const mangaWithGenres = await getMangasCollection()
    .find(
      { 'request.slug': { $nin: readMangaList } },
      { projection: { 'request.slug': 1, 'meta.name': 1, 'meta.genres': 1 } }
    )
    .toArray()

  // Group manga by genre
  const genreMap: Record<string, MangaListItem[]> = mangaWithGenres
    .reduce<[string, MangaListItem][]>(
      (prev, manga) => [
        ...prev,
        ...((manga as unknown as { meta: { genres: string[] } }).meta.genres || []).map(
          (genre) => [genre, manga as unknown as MangaListItem] as [string, MangaListItem]
        ),
      ],
      []
    )
    .reduce<Record<string, MangaListItem[]>>((prev, [genre, manga]) => {
      if (!prev[genre]) prev[genre] = []
      prev[genre].push(manga)
      return prev
    }, {})

  // Select up to 8 random genres with at least 2 manga each
  const result: MangasByGenre = {}
  const genreKeys = Object.keys(genreMap)
  shuffleArray(genreKeys)

  let count = 0
  for (const genre of genreKeys) {
    if (genreMap[genre].length < 2) continue

    result[genre] = genreMap[genre]
    shuffleArray(result[genre])

    count++
    if (count > 7) break
  }

  return result
}

/**
 * Get related manga by genre for a specific manga
 */
export async function getRelatedMangasByGenre(
  mangaPath: string
): Promise<MangasByGenre> {
  const mangaDoc = await getMangasCollection().findOne(
    { 'request.slug': mangaPath },
    { projection: { 'meta.genres': 1, _id: 0 } }
  )

  if (!mangaDoc) return {}

  const genres = (mangaDoc as unknown as { meta: { genres: string[] } }).meta.genres || []

  const result: MangasByGenre = {}
  shuffleArray(genres)

  let count = 0
  for (const genre of genres) {
    const related = await getMangasCollection()
      .find(
        { 'meta.genres': genre, 'request.slug': { $ne: mangaPath } },
        { projection: { 'request.slug': 1, 'meta.name': 1, rating: 1 } }
      )
      .toArray()

    result[genre] = related as unknown as MangaListItem[]
    shuffleArray(result[genre])

    count++
    if (count > 7) break
  }

  return result
}

/**
 * Get related manga by the same author
 */
export async function getRelatedMangasByAuthor(
  mangaPath: string
): Promise<MangaListItem[]> {
  const mangaDoc = await getMangasCollection().findOne(
    { 'request.slug': mangaPath },
    { projection: { 'meta.author': 1, _id: 0 } }
  )

  if (!mangaDoc) return []

  const author = (mangaDoc as unknown as { meta: { author: string } }).meta.author

  const related = await getMangasCollection()
    .find(
      { 'meta.author': author, 'request.slug': { $ne: mangaPath } },
      { projection: { 'request.slug': 1, 'meta.name': 1, rating: 1 } }
    )
    .toArray()

  shuffleArray(related)
  return related as unknown as MangaListItem[]
}

/**
 * Get manga that have been fully read (for re-reading)
 */
export async function getReadAgainSeries(): Promise<MangaListItem[]> {
  const mangaList = await getChaptersCollection()
    .aggregate([
      { $match: { hidden: false } },
      {
        $group: {
          _id: { mangaPath: '$mangaPath', read: '$read' },
          count: { $count: {} },
          newestRead: { $max: '$readAt' },
        },
      },
    ])
    .toArray()

  // Find manga that have read chapters but no unread chapters
  const mangaPaths = [...new Set(mangaList.map((group) => group._id.mangaPath))]
  const filteredList = mangaPaths
    .map((mangaPath) => ({
      mangaPath,
      readCount:
        mangaList.find((g) => g._id.mangaPath === mangaPath && g._id.read)?.count ?? null,
      unreadCount:
        mangaList.find((g) => g._id.mangaPath === mangaPath && !g._id.read)?.count ?? null,
      newestRead:
        mangaList.find((g) => g._id.mangaPath === mangaPath && g._id.read)?.newestRead ??
        null,
    }))
    .filter((manga) => manga.readCount !== null && manga.unreadCount === null)

  filteredList.sort(
    (a, b) => (a.newestRead?.getTime() ?? 0) - (b.newestRead?.getTime() ?? 0)
  )

  const mangasList = await getMangasCollection()
    .find(
      { 'request.slug': { $in: filteredList.map((i) => i.mangaPath) } },
      {
        sort: { 'meta.name': 1 },
        projection: { 'meta.name': 1, 'request.slug': 1, rating: 1 },
      }
    )
    .toArray()

  return filteredList
    .map((fli) =>
      mangasList.find(
        (mli) => (mli as unknown as { request: { slug: string } }).request.slug === fli.mangaPath
      )
    )
    .filter(Boolean) as unknown as MangaListItem[]
}

/**
 * Get manga "on deck" - have some read and some unread chapters
 */
export async function getMangaSeriesOnDeck(): Promise<MangaWithDate[]> {
  const mangaList = await getChaptersCollection()
    .aggregate([
      { $match: { hidden: false } },
      {
        $group: {
          _id: { mangaPath: '$mangaPath', read: '$read' },
          count: { $count: {} },
          newestRead: { $max: '$readAt' },
          newestUpdate: { $max: '$lastUpdated' },
        },
      },
    ])
    .toArray()

  const filteredList = mangaList
    .map((group) => {
      if (group._id.read) return null
      const readPart = mangaList.find(
        (gr) => gr._id.mangaPath === group._id.mangaPath && gr._id.read
      )
      if (!readPart) return null

      return {
        mangaPath: group._id.mangaPath,
        date: max([
          new Date(group.newestUpdate),
          new Date(readPart.newestUpdate),
          new Date(readPart.newestRead),
        ]),
      }
    })
    .filter((group): group is NonNullable<typeof group> => group !== null)

  filteredList.sort((a, b) => b.date.getTime() - a.date.getTime())

  const mangasList = await getMangasCollection()
    .find(
      { 'request.slug': { $in: filteredList.map((i) => i.mangaPath) } },
      {
        sort: { 'meta.name': 1 },
        projection: { 'meta.name': 1, 'request.slug': 1, rating: 1 },
      }
    )
    .toArray()

  return filteredList.map((fli) => ({
    ...(mangasList.find(
      (mli) => (mli as unknown as { request: { slug: string } }).request.slug === fli.mangaPath
    ) as unknown as MangaListItem),
    newestRead: fli.date,
  }))
}

/**
 * Get manga updated in the last 30 days
 */
export async function getLastUpdatedSeries(): Promise<MangaWithDate[]> {
  const date30DaysBefore = new Date()
  date30DaysBefore.setDate(date30DaysBefore.getDate() - 30)

  const mangaList = await getChaptersCollection()
    .aggregate([
      { $match: { hidden: false } },
      {
        $group: {
          _id: { mangaPath: '$mangaPath' },
          newestUpdate: { $max: '$lastUpdated' },
        },
      },
      { $match: { newestUpdate: { $gt: date30DaysBefore } } },
      { $sort: { newestUpdate: -1 } },
    ])
    .toArray()

  const filteredList = await getMangasCollection()
    .find(
      { 'request.slug': { $in: mangaList.map((i) => i._id.mangaPath) } },
      {
        sort: { 'meta.name': 1 },
        projection: { 'meta.name': 1, 'request.slug': 1, rating: 1 },
      }
    )
    .toArray()

  const joinedList = filteredList.map((ma) => ({
    ...(ma as unknown as MangaListItem),
    updatedAt: mangaList.find(
      (m) => m._id.mangaPath === (ma as unknown as { request: { slug: string } }).request.slug
    )?.newestUpdate,
  }))

  joinedList.sort(
    (a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0)
  )

  return joinedList
}

/**
 * Get manga with unseen chapter updates
 */
export async function getNewUpdates(): Promise<MangaWithDate[]> {
  const mangaList = await getChaptersCollection()
    .aggregate([
      { $match: { hidden: false, seen: { $ne: true } } },
      {
        $group: {
          _id: { mangaPath: '$mangaPath' },
          newestUpdate: { $max: '$lastUpdated' },
        },
      },
      { $sort: { newestUpdate: -1 } },
    ])
    .toArray()

  const filteredList = await getMangasCollection()
    .find(
      { 'request.slug': { $in: mangaList.map((i) => i._id.mangaPath) } },
      {
        sort: { 'meta.name': 1 },
        projection: { 'meta.name': 1, 'request.slug': 1, rating: 1 },
      }
    )
    .toArray()

  const joinedList = filteredList.map((ma) => ({
    ...(ma as unknown as MangaListItem),
    updatedAt: mangaList.find(
      (m) => m._id.mangaPath === (ma as unknown as { request: { slug: string } }).request.slug
    )?.newestUpdate,
  }))

  joinedList.sort(
    (a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0)
  )

  return joinedList
}

/**
 * Get full manga details with chapters
 */
export async function getMangaDetail(
  mangaPath: string
): Promise<{ details: Manga | null; chapters: Chapter[] }> {
  const details = (await getMangasCollection().findOne({
    'request.slug': mangaPath,
  })) as unknown as Manga | null
  const chapters = (await getChaptersCollection()
    .find({ mangaPath }, { sort: { finalIndex: 1 } })
    .toArray()) as unknown as Chapter[]

  return { details, chapters }
}

/**
 * Get images for a chapter
 */
export async function getImages(
  accessToken: string,
  seriesId: string,
  chapterId: string
): Promise<string[]> {
  return await listImagesForChapter(accessToken, seriesId, chapterId)
}

/**
 * Mark a chapter as read or unread
 */
export async function markChapter(
  chapterId: string,
  asRead: boolean,
  readDate: Date | null = null
): Promise<void> {
  await getChaptersCollection().updateOne(
    { _id: new ObjectId(chapterId) },
    {
      $set: {
        read: asRead,
        readAt: asRead ? (readDate ?? new Date()) : null,
        seen: true,
        readProgress: null,
      },
    }
  )
}

/**
 * Mark a chapter as seen (update notification dismissed)
 */
export async function markChapterAsSeen(
  mangaPath: string,
  chapterPath: string
): Promise<void> {
  await getChaptersCollection().updateOne(
    { mangaPath, chapterPath },
    { $set: { seen: true } }
  )
}

/**
 * Mark all chapters for a manga as seen
 */
export async function markAllChaptersAsSeen(mangaPath: string): Promise<void> {
  await getChaptersCollection().updateMany({ mangaPath }, { $set: { seen: true } })
}

/**
 * Rate a manga series
 */
export async function rateSeries(
  mangaId: string,
  rating: number = 0
): Promise<void> {
  await getMangasCollection().updateOne(
    { _id: new ObjectId(mangaId) },
    { $set: { rating } }
  )
}

/**
 * Get the next unread chapter for a manga
 */
export async function getNextUnreadChapter(
  mangaPath: string
): Promise<string | null> {
  const allChapters = (await getChaptersCollection()
    .find({ mangaPath })
    .toArray()) as unknown as Chapter[]
  const chapters = allChapters.filter((ch) => !ch.hidden)

  if (chapters.length === 0) {
    return allChapters.length > 0 ? allChapters[0].chapterPath : null
  }

  // Find the index of the last read chapter
  const lastReadChapterIndex = chapters
    .filter((ch) => ch.read)
    .reduce((prev, cu) => (cu.finalIndex > prev ? cu.finalIndex : prev), -1)

  // Find the next chapter after the last read one
  const thresholdIndex = chapters.reduce(
    (prev, cu) =>
      cu.finalIndex < prev && cu.finalIndex > lastReadChapterIndex
        ? cu.finalIndex
        : prev,
    Number.MAX_SAFE_INTEGER
  )

  if (thresholdIndex === Number.MAX_SAFE_INTEGER) {
    // No unread chapters found, return first chapter
    chapters.sort((a, b) => a.finalIndex - b.finalIndex)
    return chapters[0].chapterPath
  }

  const nextChapter = chapters.find((ch) => ch.finalIndex === thresholdIndex)
  return nextChapter?.chapterPath ?? null
}

/**
 * Get the next chapter after the current one
 */
export async function getNextChapter(
  mangaPath: string,
  chapterPath: string
): Promise<Chapter | null> {
  const chapters = (await getChaptersCollection()
    .find({ mangaPath, hidden: false })
    .toArray()) as unknown as Chapter[]

  if (chapters.length === 0) return null

  const currentChapterIndex = chapters.find(
    (ch) => ch.chapterPath === chapterPath
  )?.finalIndex

  if (currentChapterIndex === null || currentChapterIndex === undefined) {
    return null
  }

  // Find the chapter with the smallest index greater than current
  const thresholdIndex = chapters.reduce(
    (prev, cu) =>
      cu.finalIndex < prev && cu.finalIndex > currentChapterIndex
        ? cu.finalIndex
        : prev,
    Number.MAX_SAFE_INTEGER
  )

  if (thresholdIndex === Number.MAX_SAFE_INTEGER) {
    return null
  }

  return chapters.find((ch) => ch.finalIndex === thresholdIndex) ?? null
}

/**
 * Get the previous chapter before the current one
 */
export async function getPreviousChapter(
  mangaPath: string,
  chapterPath: string
): Promise<Chapter | null> {
  const chapters = (await getChaptersCollection()
    .find({ mangaPath, hidden: false })
    .toArray()) as unknown as Chapter[]

  if (chapters.length === 0) return null

  const currentChapterIndex = chapters.find(
    (ch) => ch.chapterPath === chapterPath
  )?.finalIndex

  if (currentChapterIndex === null || currentChapterIndex === undefined) {
    return null
  }

  // Find the chapter with the largest index smaller than current
  const thresholdIndex = chapters.reduce(
    (prev, cu) =>
      cu.finalIndex > prev && cu.finalIndex < currentChapterIndex
        ? cu.finalIndex
        : prev,
    -1
  )

  if (thresholdIndex === -1) {
    return null
  }

  return chapters.find((ch) => ch.finalIndex === thresholdIndex) ?? null
}

/**
 * Hide a single chapter
 */
export async function hideChapter(chapterId: string): Promise<void> {
  await getChaptersCollection().updateOne(
    { _id: new ObjectId(chapterId) },
    { $set: { hidden: true, seen: true } }
  )
}

/**
 * Show all chapters and reset order to original
 * Sets hidden: false, newIndex: 0, finalIndex: original index, seen: true
 */
export async function showAllChapters(mangaPath: string): Promise<void> {
  await getChaptersCollection().updateMany({ mangaPath }, [
    { $set: { hidden: false, newIndex: 0, finalIndex: '$index', seen: true } },
  ])
}

/**
 * Mark all chapters for a manga as read or unread
 */
export async function markAllChapters(
  mangaPath: string,
  asRead: boolean
): Promise<void> {
  await getChaptersCollection().updateMany(
    { mangaPath },
    {
      $set: {
        read: asRead,
        readAt: asRead ? new Date() : null,
        seen: true,
      },
    }
  )
}

/**
 * Reorder chapters - CRITICAL: This exact algorithm must be preserved
 * as manga-extractor depends on it.
 *
 * The algorithm:
 * - finalIndex: the new position index (0, 1, 2, ...)
 * - newIndex: calculated as (finalIndex - original index) to preserve offset
 */
export async function reorderChapters(
  chapterOrder: { id: string; newIndex: number }[]
): Promise<void> {
  for (const { id, newIndex } of chapterOrder) {
    await getChaptersCollection().updateOne({ _id: new ObjectId(id) }, [
      {
        $set: {
          finalIndex: newIndex,
          newIndex: { $subtract: [newIndex, '$index'] },
        },
      },
    ])
  }
}

/**
 * Resync manga - removes sync timestamps to force re-fetch from source
 */
export async function resyncManga(mangaPath: string): Promise<void> {
  await getMangasCollection().updateOne(
    { 'request.slug': mangaPath },
    { $unset: { lastSync: '', lastSyncWithUpdate: '' } }
  )
}

/**
 * Request deduplication for a manga
 */
export async function dedupManga(mangaPath: string): Promise<void> {
  await getMangasCollection().updateOne(
    { 'request.slug': mangaPath },
    { $set: { dedupRequest: true } }
  )
}

/**
 * Update the in-chapter reading progress (image index)
 */
export async function updateReadProgress(
  mangaPath: string,
  chapterPath: string,
  imageIndex: number
): Promise<void> {
  await getChaptersCollection().updateOne(
    { mangaPath, chapterPath },
    { $set: { readProgress: imageIndex } }
  )
}
