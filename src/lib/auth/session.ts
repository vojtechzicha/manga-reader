import crypto from 'crypto'
import { getSessionsCollection } from '../db/mongodb'
import { refreshAccessToken, type TokenResponse } from './microsoft'
import { cacheGet, cacheSet, cacheDelete } from '../onedrive/cache'

export interface SessionDoc {
  _id: string
  accessToken: string
  refreshToken: string
  expiresAt: Date
  email: string
  name?: string
  createdAt: Date
}

export interface SessionInfo {
  email: string
  name?: string
  accessToken: string
}

/**
 * Create a new session in MongoDB and return the session ID.
 */
export async function createSession(
  tokens: TokenResponse,
  userInfo: { email?: string; name?: string }
): Promise<string> {
  const sessionId = crypto.randomBytes(32).toString('hex')

  const doc: SessionDoc = {
    _id: sessionId,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    email: userInfo.email || 'unknown',
    name: userInfo.name,
    createdAt: new Date(),
  }

  await getSessionsCollection().insertOne(doc as any)

  cacheSet(`session:${sessionId}`, doc, 5 * 60 * 1000) // 5 min cache

  return sessionId
}

/**
 * Get a session by ID. Auto-refreshes expired access tokens.
 * Returns null if the session doesn't exist.
 */
export async function getSession(sessionId: string): Promise<SessionInfo | null> {
  // Check in-memory cache first
  let doc: SessionDoc | undefined = cacheGet<SessionDoc>(`session:${sessionId}`)

  if (!doc) {
    const found = await getSessionsCollection().findOne({ _id: sessionId } as any)
    if (!found) return null
    doc = found as unknown as SessionDoc
  }

  // Check if access token is expired (with 5 min buffer)
  if (new Date(doc.expiresAt).getTime() - 5 * 60 * 1000 < Date.now()) {
    try {
      const tokens = await refreshAccessToken(doc.refreshToken)

      doc.accessToken = tokens.access_token
      doc.refreshToken = tokens.refresh_token
      doc.expiresAt = new Date(Date.now() + tokens.expires_in * 1000)

      await getSessionsCollection().updateOne(
        { _id: sessionId },
        {
          $set: {
            accessToken: doc.accessToken,
            refreshToken: doc.refreshToken,
            expiresAt: doc.expiresAt,
          },
        }
      )
    } catch {
      // Refresh failed — session is invalid
      await deleteSession(sessionId)
      return null
    }
  }

  cacheSet(`session:${sessionId}`, doc, 5 * 60 * 1000)

  return {
    email: doc.email,
    name: doc.name,
    accessToken: doc.accessToken,
  }
}

/**
 * Delete a session from both cache and MongoDB.
 */
export async function deleteSession(sessionId: string): Promise<void> {
  cacheDelete(`session:${sessionId}`)
  await getSessionsCollection().deleteOne({ _id: sessionId } as any)
}
