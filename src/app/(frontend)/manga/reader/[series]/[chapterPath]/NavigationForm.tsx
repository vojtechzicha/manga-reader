'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui'
import {
  navigateToNextChapter,
  navigateToPreviousChapter,
} from '../../../../actions/manga'

interface NavigationFormProps {
  chapterId: string
  series: string
  chapterPath: string
  direction: 'next' | 'previous'
  disabled?: boolean
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
}: NavigationFormProps) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    // Scroll to top
    window.scrollTo(0, 0)

    startTransition(async () => {
      if (direction === 'next') {
        await navigateToNextChapter(chapterId, series, chapterPath)
      } else {
        await navigateToPreviousChapter(chapterId, series, chapterPath)
      }
    })
  }

  return (
    <>
      {/* Loading bar at top of viewport */}
      {isPending && <div className="manga-loading-bar" />}

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
        ) : direction === 'next' ? (
          'Next Chapter →'
        ) : (
          '← Previous Chapter'
        )}
      </Button>
    </>
  )
}
