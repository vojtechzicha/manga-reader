'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { formatDistanceToNow } from 'date-fns'
import type { SerializedChapter } from './EditChapterList'

interface SortableChapterRowProps {
  chapter: SerializedChapter
  isSelected: boolean
  onSelect: (chapterId: string, checked: boolean) => void
  onMarkRead: (chapterId: string, asRead: boolean) => void
  onHide: (chapterId: string) => void
  disabled: boolean
}

export function SortableChapterRow({
  chapter,
  isSelected,
  onSelect,
  onMarkRead,
  onHide,
  disabled,
}: SortableChapterRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        grid grid-cols-[auto_auto_1fr_auto_auto_auto] gap-4 p-3 items-center
        border-b border-[var(--manga-border)] border-opacity-20
        hover:bg-[var(--manga-gray)]
        ${!chapter.read ? 'manga-unread-bar' : ''}
        ${isSelected ? 'bg-[var(--manga-cream)]' : ''}
      `}
    >
      {/* Checkbox */}
      <div className="w-6">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(chapter._id, e.target.checked)}
          className="w-4 h-4 cursor-pointer"
        />
      </div>

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="w-6 cursor-grab active:cursor-grabbing text-center opacity-50 hover:opacity-100"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </div>

      {/* Chapter Name */}
      <div className={`min-w-0 truncate ${!chapter.read ? 'font-bold' : 'opacity-70'}`}>
        {chapter.name}
      </div>

      {/* Last Updated */}
      <div className="w-24 text-xs opacity-50">
        {formatDistanceToNow(new Date(chapter.lastUpdated), { addSuffix: true })}
      </div>

      {/* Status */}
      <div className="w-20 text-xs">
        {chapter.read ? (
          <span className="opacity-50">
            {chapter.readAt
              ? formatDistanceToNow(new Date(chapter.readAt), { addSuffix: true })
              : 'read'}
          </span>
        ) : (
          <span className="font-bold text-[var(--manga-red)]">unread</span>
        )}
      </div>

      {/* Actions */}
      <div className="w-32 flex gap-1">
        <button
          onClick={() => onHide(chapter._id)}
          disabled={disabled}
          className="px-2 py-1 text-xs border border-[var(--manga-border)] hover:bg-[var(--manga-black)] hover:text-[var(--manga-white)] disabled:opacity-50 transition-colors"
        >
          hide
        </button>
        {chapter.read ? (
          <button
            onClick={() => onMarkRead(chapter._id, false)}
            disabled={disabled}
            className="px-2 py-1 text-xs border border-[var(--manga-border)] hover:bg-[var(--manga-black)] hover:text-[var(--manga-white)] disabled:opacity-50 transition-colors"
          >
            unread
          </button>
        ) : (
          <button
            onClick={() => onMarkRead(chapter._id, true)}
            disabled={disabled}
            className="px-2 py-1 text-xs border border-[var(--manga-border)] hover:bg-[var(--manga-black)] hover:text-[var(--manga-white)] disabled:opacity-50 transition-colors"
          >
            read
          </button>
        )}
      </div>
    </div>
  )
}
