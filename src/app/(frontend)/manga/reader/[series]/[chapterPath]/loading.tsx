'use client'

import { ReaderSkeleton } from '@/components/manga'
import { getPendingTransition } from '@/contexts/ReaderTransitionContext'

export default function ReaderLoading() {
  const pending = getPendingTransition()

  return (
    <>
      <div className="manga-loading-bar" />
      <ReaderSkeleton
        mangaName={pending?.mangaName}
        chapterName={pending?.chapterName}
        series={pending?.series}
      />
    </>
  )
}
