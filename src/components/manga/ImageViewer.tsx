'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { saveReadProgress } from '@/app/(frontend)/actions/manga'

interface ImageViewerProps {
  images: string[]
  altText?: string
  initialImageIndex?: number
  mangaPath: string
  chapterPath: string
}

export function ImageViewer({
  images,
  altText = 'Manga page',
  initialImageIndex = 0,
  mangaPath,
  chapterPath,
}: ImageViewerProps) {
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set())
  const imageRefs = useRef<(HTMLDivElement | null)[]>([])
  const highestVisibleRef = useRef(0)
  const lastSavedRef = useRef(-1)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasRestoredRef = useRef(false)

  const handleLoad = useCallback((index: number) => {
    setLoaded((prev) => {
      const next = new Set(prev)
      next.add(index)
      return next
    })
  }, [])

  // Flush pending progress save
  const flush = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    if (highestVisibleRef.current > lastSavedRef.current) {
      saveReadProgress(mangaPath, chapterPath, highestVisibleRef.current)
      lastSavedRef.current = highestVisibleRef.current
    }
  }, [mangaPath, chapterPath])

  // Schedule a debounced save
  const scheduleSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(flush, 2000)
  }, [flush])

  // IntersectionObserver to track visible images
  useEffect(() => {
    if (images.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number(
              (entry.target as HTMLElement).dataset.imageIndex
            )
            if (!isNaN(index) && index > highestVisibleRef.current) {
              highestVisibleRef.current = index
              scheduleSave()
            }
          }
        }
      },
      { threshold: 0.5 }
    )

    for (const el of imageRefs.current) {
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [images.length, scheduleSave])

  // Scroll restoration on mount
  useEffect(() => {
    if (hasRestoredRef.current || images.length === 0 || initialImageIndex <= 0) return
    hasRestoredRef.current = true

    const targetIndex = Math.min(initialImageIndex, images.length - 1)
    const el = imageRefs.current[targetIndex]
    if (el) {
      // Set the initial highest visible to the restored position
      highestVisibleRef.current = targetIndex
      el.scrollIntoView({ behavior: 'instant' })
    }
  }, [initialImageIndex, images.length])

  // Save on visibilitychange, beforeunload, and unmount
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flush()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', flush)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', flush)
      flush()
    }
  }, [flush])

  if (images.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No images available for this chapter
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1">
      {images.map((imgSrc, index) => (
        <div
          key={index}
          className="w-full relative"
          data-image-index={index}
          ref={(el) => {
            imageRefs.current[index] = el
          }}
        >
          {/* Skeleton placeholder — visible until image loads */}
          {!loaded.has(index) && (
            <div
              className="w-full border-2 border-[var(--manga-border)] bg-[var(--manga-white)] overflow-hidden"
              style={{ aspectRatio: '2/3' }}
            >
              <div className="absolute inset-0 manga-skeleton" />
            </div>
          )}
          <img
            src={imgSrc}
            alt={`${altText} ${index + 1}`}
            className={`max-w-full ${loaded.has(index) ? '' : 'absolute invisible'}`}
            loading={index > 2 ? 'lazy' : 'eager'}
            onLoad={() => handleLoad(index)}
          />
        </div>
      ))}
    </div>
  )
}
