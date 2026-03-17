interface MultiDragOverlayProps {
  chapterName: string
  count: number
}

export function MultiDragOverlay({ chapterName, count }: MultiDragOverlayProps) {
  return (
    <div className="relative w-[400px]">
      {/* Stacked background cards (only for multi-drag) */}
      {count > 1 && (
        <>
          <div className="absolute inset-0 manga-panel rotate-2 translate-x-1 translate-y-1 bg-[var(--manga-white)]" />
          <div className="absolute inset-0 manga-panel -rotate-1 -translate-x-0.5 translate-y-0.5 bg-[var(--manga-white)]" />
        </>
      )}

      {/* Primary card */}
      <div className="relative manga-panel bg-[var(--manga-white)] p-3 flex items-center gap-3">
        {/* Drag handle icon */}
        <div className="opacity-50">
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

        {/* Chapter name */}
        <div className="min-w-0 truncate font-bold flex-1">{chapterName}</div>

        {/* Count badge */}
        {count > 1 && (
          <span className="manga-badge">
            {count} chapters
          </span>
        )}
      </div>
    </div>
  )
}
