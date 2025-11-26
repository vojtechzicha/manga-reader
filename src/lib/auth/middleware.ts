import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSession, type SessionInfo } from './session'
import { SESSION_COOKIE_NAME } from './cookies'
import { logAuthEvent } from './logger'

/**
 * Require authentication - redirects to login if not authenticated.
 * Returns the session info including a valid access token.
 */
export async function requireAuth(): Promise<SessionInfo> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionId) {
    logAuthEvent('require_auth_missing_cookie')
    redirect('/login')
  }

  const session = await getSession(sessionId)

  if (!session) {
    logAuthEvent('require_auth_invalid_session', { hasSessionId: true })
    redirect('/login')
  }

  return session
}

/**
 * Get current user without requiring authentication.
 * Returns null if not logged in.
 */
export async function getOptionalUser(): Promise<SessionInfo | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionId) return null

  return await getSession(sessionId)
}
