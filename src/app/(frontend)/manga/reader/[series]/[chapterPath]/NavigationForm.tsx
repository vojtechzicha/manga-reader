'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { useReaderTransition } from '@/contexts/ReaderTransitionContext'
import {
  navigateToNextChapter,
  navigateToPreviousChapter,
  completeLastChapter,
} from '../../../../actions/manga'

interface NavigationFormProps {
  chapterId: string
  series: string
  chapterPath: string
  direction: 'next' | 'previous'
  disabled?: boolean
  isLastChapter?: boolean
  mangaName: string
  targetChapterName: string | null
}

function Spinner() {
  return (
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
  )
}

export function NavigationForm({
  chapterId,
  series,
  chapterPath,
  direction,
  disabled = false,
  isLastChapter = false,
  mangaName,
  targetChapterName,
}: NavigationFormProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { beginTransition } = useReaderTransition()

  const handleClick = () => {
    // Scroll to top
    window.scrollTo(0, 0)

    // Show skeleton with target chapter info (skip for "Finish Manga" — no target chapter)
    if (targetChapterName) {
      beginTransition(mangaName, targetChapterName, series)
    }

    startTransition(async () => {
      let url: string
      if (direction === 'next' && isLastChapter) {
        url = await completeLastChapter(chapterId, series)
      } else if (direction === 'next') {
        url = await navigateToNextChapter(chapterId, series, chapterPath)
      } else {
        url = await navigateToPreviousChapter(chapterId, series, chapterPath)
      }
      // Navigate within the transition so React keeps the old UI
      // and loading.tsx is NOT shown
      router.push(url)
    })
  }

  const label =
    direction === 'next'
      ? isLastChapter
        ? 'Finish Manga ★'
        : 'Next Chapter →'
      : '← Previous Chapter'

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isPending}
      variant={disabled ? 'ghost' : 'manga'}
    >
      {isPending ? (
        <span className="flex items-center gap-2">
          <Spinner />
          <span>Loading...</span>
        </span>
      ) : (
        label
      )}
    </Button>
  )
}
