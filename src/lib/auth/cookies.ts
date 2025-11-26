const SESSION_COOKIE_MAX_AGE = 30 * 24 * 60 * 60
const OAUTH_STATE_COOKIE_MAX_AGE = 10 * 60

export const SESSION_COOKIE_NAME = 'manga-session'
export const OAUTH_STATE_COOKIE_NAME = 'oauth-state'

function isSecureCookie(): boolean {
  return process.env.NODE_ENV === 'production'
}

function getBaseCookieOptions() {
  return {
    httpOnly: true,
    path: '/',
    sameSite: 'lax' as const,
    secure: isSecureCookie(),
  }
}

export function getSessionCookieOptions() {
  return {
    ...getBaseCookieOptions(),
    maxAge: SESSION_COOKIE_MAX_AGE,
  }
}

export function getOAuthStateCookieOptions() {
  return {
    ...getBaseCookieOptions(),
    maxAge: OAUTH_STATE_COOKIE_MAX_AGE,
  }
}

export function getExpiredCookieOptions() {
  return {
    ...getBaseCookieOptions(),
    maxAge: 0,
  }
}
