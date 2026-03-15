import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizationUrl } from '@/lib/auth/microsoft'
import {
  OAUTH_STATE_COOKIE_NAME,
  RETURN_TO_COOKIE_NAME,
  getOAuthStateCookieOptions,
  getReturnToCookieOptions,
} from '@/lib/auth/cookies'

export async function GET(request: NextRequest) {
  const state = crypto.randomBytes(16).toString('hex')
  const authUrl = getAuthorizationUrl(state)

  const response = NextResponse.redirect(authUrl)
  response.cookies.set(
    OAUTH_STATE_COOKIE_NAME,
    state,
    getOAuthStateCookieOptions()
  )

  // Store returnTo destination if provided (only allow relative URLs)
  const returnTo = request.nextUrl.searchParams.get('returnTo')
  if (returnTo && returnTo.startsWith('/')) {
    response.cookies.set(
      RETURN_TO_COOKIE_NAME,
      returnTo,
      getReturnToCookieOptions()
    )
  }

  return response
}
