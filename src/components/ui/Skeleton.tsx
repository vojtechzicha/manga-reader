interface SkeletonProps {
  className?: string
  variant?: 'default' | 'panel' | 'card'
}

export function Skeleton({ className = '', variant = 'default' }: SkeletonProps) {
  const variantClass =
    variant === 'panel'
      ? 'manga-skeleton-panel'
      : variant === 'card'
        ? 'manga-skeleton-card'
        : ''

  return <div className={`manga-skeleton ${variantClass} ${className}`} />
}
