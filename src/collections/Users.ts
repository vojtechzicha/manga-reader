import type { CollectionConfig } from 'payload'
import { parseCookies } from 'payload'
import { getSession } from '@/lib/auth/session'
import { isAdminEmail } from '@/lib/auth/admin'
import { SESSION_COOKIE_NAME } from '@/lib/auth/cookies'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    disableLocalStrategy: true,
    strategies: [
      {
        name: 'microsoft-oauth',
        authenticate: async ({ payload, headers }) => {
          const cookieHeader = headers.get('cookie')
          if (!cookieHeader) return { user: null }

          const cookies = parseCookies(headers)
          const sessionId = cookies.get(SESSION_COOKIE_NAME)
          if (!sessionId) return { user: null }

          const session = await getSession(sessionId)
          if (!session) return { user: null }

          if (!isAdminEmail(session.email)) return { user: null }

          // Find or create user in Payload
          const existing = await payload.find({
            collection: 'users',
            where: { email: { equals: session.email } },
            limit: 1,
          })

          let user
          if (existing.docs.length > 0) {
            user = existing.docs[0]
          } else {
            user = await payload.create({
              collection: 'users',
              data: { email: session.email },
            })
          }

          return { user: { ...user, collection: 'users' as const } }
        },
      },
    ],
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
  ],
}
