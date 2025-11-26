'use client'

interface LoadingToastProps {
  message: string
  isVisible: boolean
}

export function LoadingToast({ message, isVisible }: LoadingToastProps) {
  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="manga-toast bg-[var(--manga-black)] text-[var(--manga-white)] px-5 py-3 border-3 border-[var(--manga-border)] shadow-[4px_4px_0_var(--manga-shadow)] transform skew-x-[-5deg]">
        <div className="transform skew-x-[5deg] flex items-center gap-3">
          {/* Spinner */}
          <div className="w-4 h-4 border-2 border-[var(--manga-white)] border-t-[var(--manga-red)] rounded-full animate-spin" />
          <span className="font-bold text-sm uppercase tracking-wide">{message}</span>
        </div>
      </div>
    </div>
  )
}
