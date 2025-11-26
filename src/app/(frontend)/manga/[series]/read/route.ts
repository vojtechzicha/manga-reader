import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth/session'
import { SESSION_COOKIE_NAME } from '@/lib/auth/cookies'
import { getNextUnreadChapter } from '@/lib/manga/queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ series: string }> }
) {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionId) {
    redirect('/login')
  }

  const session = await getSession(sessionId)
  if (!session) {
    redirect('/login')
  }

  const { series } = await params

  const chapterPath = await getNextUnreadChapter(series)

  if (chapterPath) {
    redirect(`/manga/reader/${series}/${chapterPath}`)
  } else {
    redirect(`/manga/${series}`)
  }
}
