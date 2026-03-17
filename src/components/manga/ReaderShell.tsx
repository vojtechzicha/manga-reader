'use client'

import { useEffect, type ReactNode } from 'react'
import { useScrollDirection } from '@/hooks/useScrollDirection'

interface ReaderShellProps {
  children: ReactNode
}

export function ReaderShell({ children }: ReaderShellProps) {
  const { barsVisible, isAtBottom } = useScrollDirection(10)

  // Set reader mode on mount, clean up on unmount
  useEffect(() => {
    document.documentElement.dataset.readerMode = 'true'
    return () => {
      delete document.documentElement.dataset.readerMode
      delete document.documentElement.dataset.barsHidden
      delete document.documentElement.dataset.atBottom
    }
  }, [])

  // Toggle bars hidden state
  useEffect(() => {
    if (barsVisible) {
      delete document.documentElement.dataset.barsHidden
    } else {
      document.documentElement.dataset.barsHidden = 'true'
    }
  }, [barsVisible])

  // Toggle bottom state
  useEffect(() => {
    if (isAtBottom) {
      document.documentElement.dataset.atBottom = 'true'
    } else {
      delete document.documentElement.dataset.atBottom
    }
  }, [isAtBottom])

  return <>{children}</>
}
