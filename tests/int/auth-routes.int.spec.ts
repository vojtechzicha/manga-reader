import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const getAuthorizationUrl = vi.fn()
const exchangeCodeForTokens = vi.fn()
const decodeIdToken = vi.fn()
const checkRequestsJsonExists = vi.fn()
const createSession = vi.fn()

vi.mock('@/lib/auth/microsoft', () => ({
  getAuthorizationUrl,
  exchangeCodeForTokens,
  decodeIdToken,
}))

vi.mock('@/lib/onedrive/client', () => ({
  checkRequestsJsonExists,
}))

vi.mock('@/lib/auth/session', () => ({
  createSession,
}))

describe('auth routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('AZURE_CLIENT_ID', 'client-id')
    vi.stubEnv('AZURE_CLIENT_SECRET', 'client-secret')
    vi.stubEnv(
      'AZURE_REDIRECT_URI',
      'https://manga.zicha.name/api/auth/callback'
    )
    vi.stubEnv('NODE_ENV', 'production')
  })

  it('sets the oauth state cookie and redirects to Microsoft login', async () => {
    getAuthorizationUrl.mockReturnValueOnce(
      'https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?foo=bar'
    )

    const { GET } = await import('@/app/api/auth/login/route')

    const request = new NextRequest('https://manga.zicha.name/api/auth/login')
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?foo=bar'
    )
    const stateCookie = response.cookies.get('oauth-state')
    expect(stateCookie?.value).toHaveLength(32)
    expect(response.headers.get('set-cookie')).toContain('HttpOnly')
    expect(response.headers.get('set-cookie')).toContain('SameSite=lax')
    expect(response.headers.get('set-cookie')).toContain('Secure')
  })

  it('creates the session cookie and redirects back to the request origin', async () => {
    exchangeCodeForTokens.mockResolvedValueOnce({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      expires_in: 3600,
      id_token: 'id-token',
    })
    decodeIdToken.mockReturnValueOnce({
      email: 'reader@example.com',
      name: 'Reader',
    })
    checkRequestsJsonExists.mockResolvedValueOnce(true)
    createSession.mockResolvedValueOnce('session-123')

    const { GET } = await import('@/app/api/auth/callback/route')
    const request = new NextRequest(
      'https://internal.fly.dev/api/auth/callback?code=abc&state=expected-state',
      {
        headers: {
          cookie: 'oauth-state=expected-state',
          'x-forwarded-host': 'manga.zicha.name',
          'x-forwarded-proto': 'https',
        },
      }
    )

    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://manga.zicha.name/')
    expect(response.cookies.get('manga-session')?.value).toBe('session-123')
    expect(response.headers.getSetCookie().join('\n')).toContain('manga-session=session-123')
    expect(response.headers.getSetCookie().join('\n')).toContain('oauth-state=;')
  })

  it('rejects an invalid oauth state', async () => {
    const { GET } = await import('@/app/api/auth/callback/route')
    const request = new NextRequest(
      'https://manga.zicha.name/api/auth/callback?code=abc&state=wrong-state',
      {
        headers: {
          cookie: 'oauth-state=expected-state',
          'x-forwarded-host': 'manga.zicha.name',
          'x-forwarded-proto': 'https',
        },
      }
    )

    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'https://manga.zicha.name/login?error=invalid_state'
    )
    expect(exchangeCodeForTokens).not.toHaveBeenCalled()
  })
})
