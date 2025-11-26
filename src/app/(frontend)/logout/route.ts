import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/auth/session'
import {
  SESSION_COOKIE_NAME,
  getExpiredCookieOptions,
} from '@/lib/auth/cookies'
import { logAuthEvent } from '@/lib/auth/logger'

async function handleLogout(request: Request) {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (sessionId) {
    await deleteSession(sessionId)
  }

  logAuthEvent('logout', { hadSession: Boolean(sessionId) })
  const response = NextResponse.redirect(new URL('/login', request.url))
  response.cookies.set(SESSION_COOKIE_NAME, '', getExpiredCookieOptions())
  return response
}

export async function POST(request: Request) {
  return handleLogout(request)
}
