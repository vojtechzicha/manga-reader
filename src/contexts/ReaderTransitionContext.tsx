'use client'

import { createContext, useContext, useCallback, type ReactNode } from 'react'

interface TransitionInfo {
  mangaName: string
  chapterName: string
  series: string
}

// Module-level variable: synchronously readable by any client component
// in the same bundle, bypassing React's state batching and Suspense boundaries.
let pendingTransition: TransitionInfo | null = null

export function getPendingTransition(): TransitionInfo | null {
  return pendingTransition
}

interface ReaderTransitionContextValue {
  beginTransition: (mangaName: string, chapterName: string, series: string) => void
  resetTransition: () => void
}

const ReaderTransitionContext = createContext<ReaderTransitionContextValue | null>(null)

export function ReaderTransitionProvider({ children }: { children: ReactNode }) {
  const beginTransition = useCallback(
    (mangaName: string, chapterName: string, series: string) => {
      pendingTransition = { mangaName, chapterName, series }
    },
    []
  )

  const resetTransition = useCallback(() => {
    pendingTransition = null
  }, [])

  return (
    <ReaderTransitionContext.Provider value={{ beginTransition, resetTransition }}>
      {children}
    </ReaderTransitionContext.Provider>
  )
}

export function useReaderTransition() {
  const ctx = useContext(ReaderTransitionContext)
  if (!ctx) {
    throw new Error('useReaderTransition must be used within ReaderTransitionProvider')
  }
  return ctx
}
