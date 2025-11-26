'use client'

import { useState, useTransition } from 'react'
import { StarRating } from '@/components/manga'
import { rateSeriesAction } from '../../actions/manga'

interface RatingFormProps {
  mangaId: string
  initialRating: number
}

export function RatingForm({ mangaId, initialRating }: RatingFormProps) {
  const [rating, setRating] = useState(initialRating)
  const [isPending, startTransition] = useTransition()

  const handleRatingChange = (newRating: number) => {
    setRating(newRating)
    startTransition(async () => {
      await rateSeriesAction(mangaId, newRating)
    })
  }

  return (
    <div className={`inline-flex items-center ${isPending ? 'opacity-50' : ''}`}>
      <StarRating value={rating} onChange={handleRatingChange} />
      {isPending && (
        <span className="ml-2 text-sm text-gray-500">Saving...</span>
      )}
    </div>
  )
}
