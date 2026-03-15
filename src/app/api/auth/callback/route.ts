import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForTokens, decodeIdToken } from '@/lib/auth/microsoft'
import { checkRequestsJsonExists } from '@/lib/onedrive/client'
import { createSession } from '@/lib/auth/session'
import { getAuthConfig } from '@/lib/auth/config'
import {
  OAUTH_STATE_COOKIE_NAME,
  RETURN_TO_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  getExpiredCookieOptions,
  getSessionCookieOptions,
} from '@/lib/auth/cookies'
import { logAuthEvent } from '@/lib/auth/logger'

function buildRedirect(location: string): NextResponse {
  return NextResponse.redirect(location)
}

export async function GET(request: NextRequest) {
  const config = getAuthConfig()
  const origin = config.azureRedirectOrigin
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    const description = searchParams.get('error_description') || error
    console.error('OAuth error from Microsoft:', description)
    logAuthEvent('callback_oauth_error', { error: description })
    return buildRedirect(`${origin}/login?error=oauth`)
  }

  if (!code || !state) {
    logAuthEvent('callback_missing_params', {
      hasCode: Boolean(code),
      hasState: Boolean(state),
    })
    return buildRedirect(`${origin}/login?error=missing_params`)
  }

  const storedState = request.cookies.get(OAUTH_STATE_COOKIE_NAME)?.value
  if (!storedState || storedState !== state) {
    logAuthEvent('callback_invalid_state', {
      hasStoredState: Boolean(storedState),
    })
    return buildRedirect(`${origin}/login?error=invalid_state`)
  }

  try {
    const tokens = await exchangeCodeForTokens(code)

    const authorized = await checkRequestsJsonExists(tokens.access_token)
    if (!authorized) {
      return buildRedirect(`${origin}/login?error=unauthorized`)
    }

    const userInfo = tokens.id_token ? decodeIdToken(tokens.id_token) : {}
    const sessionId = await createSession(tokens, userInfo)

    // Check for returnTo cookie to redirect back to the original page
    const returnTo = request.cookies.get(RETURN_TO_COOKIE_NAME)?.value
    const redirectPath = returnTo && returnTo.startsWith('/') ? returnTo : '/'

    const response = buildRedirect(`${origin}${redirectPath}`)
    response.cookies.set(
      SESSION_COOKIE_NAME,
      sessionId,
      getSessionCookieOptions()
    )
    response.cookies.set(
      OAUTH_STATE_COOKIE_NAME,
      '',
      getExpiredCookieOptions()
    )
    // Clear returnTo cookie
    response.cookies.set(
      RETURN_TO_COOKIE_NAME,
      '',
      getExpiredCookieOptions()
    )
    logAuthEvent('callback_session_created', {
      email: userInfo.email ?? 'unknown',
    })
    return response
  } catch (err) {
    console.error('OAuth callback error:', err)
    logAuthEvent('callback_failed', {
      message: err instanceof Error ? err.message : 'unknown',
    })
    return buildRedirect(`${origin}/login?error=callback_failed`)
  }
}
