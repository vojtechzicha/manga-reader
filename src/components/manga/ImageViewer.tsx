'use client'

import { useState, useCallback } from 'react'

interface ImageViewerProps {
  images: string[]
  altText?: string
}

export function ImageViewer({ images, altText = 'Manga page' }: ImageViewerProps) {
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set())

  const handleLoad = useCallback((index: number) => {
    setLoaded((prev) => {
      const next = new Set(prev)
      next.add(index)
      return next
    })
  }, [])

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
        <div key={index} className="w-full relative">
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
