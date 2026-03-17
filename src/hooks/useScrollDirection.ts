'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface ScrollDirectionState {
  barsVisible: boolean
  isAtBottom: boolean
  resetScroll: () => void
}

export function useScrollDirection(threshold = 10): ScrollDirectionState {
  const [barsVisible, setBarsVisible] = useState(true)
  const [isAtBottom, setIsAtBottom] = useState(false)
  const lastScrollY = useRef(0)
  const suppressUntilUserScroll = useRef(true)

  const resetScroll = useCallback(() => {
    lastScrollY.current = window.scrollY
    suppressUntilUserScroll.current = true
    setBarsVisible(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const delta = currentScrollY - lastScrollY.current

      // At top of page: always show bars
      if (currentScrollY < threshold) {
        setBarsVisible(true)
        setIsAtBottom(false)
        lastScrollY.current = currentScrollY
        suppressUntilUserScroll.current = false
        return
      }

      // After a reset, ignore the first scroll events until we see
      // a small user-initiated scroll (not a programmatic jump)
      if (suppressUntilUserScroll.current) {
        if (Math.abs(delta) > 300) {
          // Large jump — likely programmatic (scrollIntoView), re-anchor
          lastScrollY.current = currentScrollY
          return
        }
        suppressUntilUserScroll.current = false
      }

      // Check if at bottom of page
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 20
      setIsAtBottom(atBottom)

      // Only change visibility when scroll delta exceeds threshold
      if (Math.abs(delta) >= threshold) {
        setBarsVisible(delta < 0) // scrolling up = visible
        lastScrollY.current = currentScrollY
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return { barsVisible, isAtBottom, resetScroll }
}
