'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui'

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized: 'Your account is not authorized to access this application.',
  oauth: 'Authentication with Microsoft failed. Please try again.',
  invalid_state: 'Invalid authentication state. Please try again.',
  missing_params: 'Missing authentication parameters. Please try again.',
  callback_failed: 'An error occurred during login. Please try again.',
}

export function LoginForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="space-y-6">
      {error && (
        <div className="border-2 border-[var(--manga-border)] bg-red-50 dark:bg-red-950 text-[var(--manga-red)] px-4 py-3 font-semibold text-sm">
          {ERROR_MESSAGES[error] || 'An error occurred. Please try again.'}
        </div>
      )}

      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/api/auth/login" className="block">
        <Button type="button" variant="manga" size="lg" className="w-full text-base uppercase tracking-wider">
          Sign in with Microsoft
        </Button>
      </a>
    </div>
  )
}
