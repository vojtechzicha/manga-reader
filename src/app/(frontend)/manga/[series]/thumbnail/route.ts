import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getThumbnailUrl } from '@/lib/onedrive/client'
import { SESSION_COOKIE_NAME } from '@/lib/auth/cookies'
import { logAuthEvent } from '@/lib/auth/logger'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ series: string }> }
) {
  const { series } = await params

  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value

  if (!sessionId) {
    logAuthEvent('thumbnail_missing_session_cookie', { series })
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const session = await getSession(sessionId)
  if (!session) {
    logAuthEvent('thumbnail_invalid_session', { series })
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const url = await getThumbnailUrl(session.accessToken, series)
    return NextResponse.redirect(url)
  } catch (error) {
    console.error('Failed to get thumbnail for', series, error)
    return new NextResponse('Thumbnail not found', { status: 404 })
  }
}
