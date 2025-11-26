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
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {ERROR_MESSAGES[error] || 'An error occurred. Please try again.'}
        </div>
      )}

      <a href="/api/auth/login">
        <Button type="button" className="w-full">
          Sign in with Microsoft
        </Button>
      </a>
    </div>
  )
}
