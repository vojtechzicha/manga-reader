'use client'

import { InputHTMLAttributes } from 'react'

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onValueChange?: (value: string) => void
}

export function SearchInput({
  className = '',
  onValueChange,
  onChange,
  ...props
}: SearchInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e)
    onValueChange?.(e.target.value)
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg
          className="w-5 h-5 opacity-50"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <input
        type="text"
        className="w-full bg-[var(--manga-white)] border-2 border-[var(--manga-border)] text-sm font-medium pl-10 pr-4 py-2.5 focus:outline-none focus:border-[var(--manga-red)] focus:ring-0 transition-colors placeholder:opacity-50"
        onChange={handleChange}
        {...props}
      />
    </div>
  )
}
