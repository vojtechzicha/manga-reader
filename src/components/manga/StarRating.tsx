'use client'

import { useState } from 'react'

interface StarRatingProps {
  value: number // 0-10 (half stars)
  onChange?: (value: number) => void
  readonly?: boolean
}

export function StarRating({ value, onChange, readonly = false }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const displayValue = hoverValue !== null ? hoverValue : value

  const handleClick = (newValue: number) => {
    if (!readonly && onChange) {
      onChange(newValue)
    }
  }

  const handleMouseEnter = (starValue: number) => {
    if (!readonly) {
      setHoverValue(starValue)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(null)
    }
  }

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const starValue = star * 2
        const halfStarValue = star * 2 - 1
        const filled = displayValue >= starValue
        const halfFilled = displayValue >= halfStarValue && displayValue < starValue

        return (
          <div
            key={star}
            className={`relative ${readonly ? '' : 'cursor-pointer'}`}
            onMouseLeave={handleMouseLeave}
          >
            {/* Left half (for half-star support) */}
            <div
              className="absolute inset-y-0 left-0 w-1/2 z-10"
              onMouseEnter={() => handleMouseEnter(halfStarValue)}
              onClick={() => handleClick(halfStarValue)}
            />
            {/* Right half */}
            <div
              className="absolute inset-y-0 right-0 w-1/2 z-10"
              onMouseEnter={() => handleMouseEnter(starValue)}
              onClick={() => handleClick(starValue)}
            />
            {/* Star SVG */}
            <svg
              className={`w-5 h-5 ${
                filled
                  ? 'text-yellow-400'
                  : halfFilled
                  ? 'text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              {halfFilled ? (
                <>
                  {/* Half-filled star using clip path */}
                  <defs>
                    <clipPath id={`half-${star}`}>
                      <rect x="0" y="0" width="10" height="20" />
                    </clipPath>
                  </defs>
                  {/* Gray background star */}
                  <path
                    className="text-gray-300 dark:text-gray-600"
                    fill="currentColor"
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                  {/* Yellow half star */}
                  <path
                    clipPath={`url(#half-${star})`}
                    className="text-yellow-400"
                    fill="currentColor"
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </>
              ) : (
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              )}
            </svg>
          </div>
        )
      })}
    </div>
  )
}
