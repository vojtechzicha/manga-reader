'use client'

import { useRouter } from 'next/navigation'
import { useTransition, ReactNode } from 'react'

interface LinkWithLoadingProps {
  href: string
  children: ReactNode
  className?: string
  variant?: 'manga' | 'default'
}

function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ${className}`}
    />
  )
}

export function LinkWithLoading({
  href,
  children,
  className = '',
  variant = 'default',
}: LinkWithLoadingProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    startTransition(() => {
      router.push(href)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`${className} ${isPending ? 'opacity-70 cursor-wait' : ''}`}
    >
      {isPending && <div className="manga-loading-bar" />}
      <span className="inline-flex items-center justify-center">
        {isPending ? <Spinner /> : children}
      </span>
    </button>
  )
}
