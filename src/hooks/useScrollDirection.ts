'use client'

import { useState, useEffect, useRef } from 'react'

interface ScrollDirectionState {
  barsVisible: boolean
  isAtBottom: boolean
}

export function useScrollDirection(threshold = 10): ScrollDirectionState {
  const [barsVisible, setBarsVisible] = useState(true)
  const [isAtBottom, setIsAtBottom] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const delta = currentScrollY - lastScrollY.current

      // At top of page: always show bars
      if (currentScrollY < threshold) {
        setBarsVisible(true)
        setIsAtBottom(false)
        lastScrollY.current = currentScrollY
        return
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

  return { barsVisible, isAtBottom }
}
