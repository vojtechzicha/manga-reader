import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { getAuthorizationUrl } from '@/lib/auth/microsoft'
import {
  OAUTH_STATE_COOKIE_NAME,
  getOAuthStateCookieOptions,
} from '@/lib/auth/cookies'

export async function GET() {
  const state = crypto.randomBytes(16).toString('hex')
  const authUrl = getAuthorizationUrl(state)

  const response = NextResponse.redirect(authUrl)
  response.cookies.set(
    OAUTH_STATE_COOKIE_NAME,
    state,
    getOAuthStateCookieOptions()
  )
  return response
}
