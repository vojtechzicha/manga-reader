'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth/middleware'
import {
  markChapter,
  markChapterAsSeen,
  rateSeries,
  getNextChapter,
  getPreviousChapter,
  hideChapter,
  showAllChapters,
  markAllChapters,
  markAllChaptersAsSeen,
  reorderChapters,
  resyncManga,
  dedupManga,
  updateReadProgress,
} from '@/lib/manga/queries'

/**
 * Mark current chapter as read and return the URL for the next chapter.
 * Returns a URL string for client-side navigation (avoids redirect() which
 * breaks out of React transitions and triggers loading.tsx).
 */
export async function navigateToNextChapter(
  chapterId: string,
  series: string,
  chapterPath: string
): Promise<string> {
  await requireAuth()

  // Mark current chapter as read
  await markChapter(chapterId, true)

  // Get next chapter
  const nextChapter = await getNextChapter(series, chapterPath)

  if (nextChapter) {
    return `/manga/reader/${series}/${nextChapter.chapterPath}`
  } else {
    return `/manga/${series}`
  }
}

/**
 * Mark current chapter as unread and return the URL for the previous chapter.
 */
export async function navigateToPreviousChapter(
  chapterId: string,
  series: string,
  chapterPath: string
): Promise<string> {
  await requireAuth()

  // Mark current chapter as unread
  await markChapter(chapterId, false)

  // Get previous chapter
  const prevChapter = await getPreviousChapter(series, chapterPath)

  if (prevChapter) {
    return `/manga/reader/${series}/${prevChapter.chapterPath}`
  } else {
    return `/manga/${series}`
  }
}

/**
 * Rate a manga series
 */
export async function rateSeriesAction(mangaId: string, rating: number) {
  await requireAuth()
  await rateSeries(mangaId, rating)
}

/**
 * Mark chapter as seen (update notification dismissed)
 */
export async function markChapterAsSeenAction(
  mangaPath: string,
  chapterPath: string
) {
  await requireAuth()
  await markChapterAsSeen(mangaPath, chapterPath)
}

/**
 * Mark a single chapter as read or unread
 */
export async function markChapterAction(chapterId: string, asRead: boolean) {
  await requireAuth()
  await markChapter(chapterId, asRead)
}

/**
 * Hide a single chapter
 */
export async function hideChapterAction(chapterId: string, mangaPath: string) {
  await requireAuth()
  await hideChapter(chapterId)
  revalidatePath(`/manga/${mangaPath}/edit`)
}

/**
 * Show all chapters and reset order
 */
export async function showAllChaptersAction(mangaPath: string) {
  await requireAuth()
  await showAllChapters(mangaPath)
  revalidatePath(`/manga/${mangaPath}/edit`)
}

/**
 * Mark all chapters as read or unread
 */
export async function markAllChaptersAction(mangaPath: string, asRead: boolean) {
  await requireAuth()
  await markAllChapters(mangaPath, asRead)
  revalidatePath(`/manga/${mangaPath}/edit`)
}

/**
 * Mark all chapters as seen (dismiss NEW badges)
 */
export async function markAllChaptersAsSeenAction(mangaPath: string) {
  await requireAuth()
  await markAllChaptersAsSeen(mangaPath)
}

/**
 * Reorder chapters
 */
export async function reorderChaptersAction(
  chapterOrder: { id: string; newIndex: number }[]
) {
  await requireAuth()
  await reorderChapters(chapterOrder)
}

/**
 * Resync manga - force re-fetch from source
 */
export async function resyncMangaAction(mangaPath: string) {
  await requireAuth()
  await resyncManga(mangaPath)
  revalidatePath(`/manga/${mangaPath}/edit`)
}

/**
 * Request deduplication for a manga
 */
export async function dedupMangaAction(mangaPath: string) {
  await requireAuth()
  await dedupManga(mangaPath)
  revalidatePath(`/manga/${mangaPath}/edit`)
}

/**
 * Save in-chapter reading progress (which image the user has scrolled to)
 */
export async function saveReadProgress(
  mangaPath: string,
  chapterPath: string,
  imageIndex: number
) {
  await requireAuth()
  await updateReadProgress(mangaPath, chapterPath, imageIndex)
}

/**
 * Mark the last chapter as read and return the URL for the completed screen.
 */
export async function completeLastChapter(chapterId: string, series: string): Promise<string> {
  await requireAuth()
  await markChapter(chapterId, true)
  return `/manga/reader/${series}/completed`
}
