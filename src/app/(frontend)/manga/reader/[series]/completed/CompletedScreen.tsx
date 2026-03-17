'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface CompletedScreenProps {
  mangaName: string
  series: string
}

export function CompletedScreen({ mangaName, series }: CompletedScreenProps) {
  const router = useRouter()
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 4500)
    const navTimer = setTimeout(() => router.push(`/manga/${series}`), 5000)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(navTimer)
    }
  }, [router, series])

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[var(--manga-gray)] p-4 transition-opacity duration-500"
      style={{ opacity: fadeOut ? 0 : 1 }}
    >
      <div className="manga-panel p-8 md:p-12 max-w-lg w-full text-center">
        <div className="mb-6">
          <span className="manga-section-title text-2xl md:text-3xl tracking-wider">
            COMPLETE
          </span>
        </div>

        <p className="text-xl md:text-2xl font-bold text-[var(--manga-black)] mb-6">
          {mangaName}
        </p>

        <div className="manga-narration p-4 mb-8 text-left">
          <p className="text-[var(--manga-black)]">
            And so, the final page has been turned. Another story etched into
            memory, its characters now resting until the next chapter arrives...
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-[var(--manga-gray)] border border-[var(--manga-border)] rounded-sm mb-6 overflow-hidden">
          <div
            className="h-full bg-[var(--manga-red)]"
            style={{
              width: '100%',
              animation: 'shrink 5s linear forwards',
            }}
          />
        </div>

        <Link href={`/manga/${series}`} className="manga-button text-sm uppercase tracking-wider">
          <span>Back to Series</span>
        </Link>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  )
}
