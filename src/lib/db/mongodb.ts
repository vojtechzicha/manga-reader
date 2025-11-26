import { MongoClient, type Collection, type Db } from 'mongodb'
import type { Manga, Chapter } from '../manga/types'
import type { SessionDoc } from '../auth/session'

// Global variable to preserve client across hot reloads in development
declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined
  // eslint-disable-next-line no-var
  var _mongoDb: Db | undefined
}

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

// Parse database name from URI or use default
function getDatabaseName(uri: string): string {
  try {
    const url = new URL(uri)
    const pathname = url.pathname
    // Remove leading slash and get database name
    const dbName = pathname.slice(1).split('?')[0]
    return dbName || 'manga-reader-database'
  } catch {
    return 'manga-reader-database'
  }
}

function getClient(): { client: MongoClient; db: Db } {
  const DATABASE_URI = process.env.DATABASE_URI

  if (!DATABASE_URI) {
    throw new Error('Missing DATABASE_URI in environment variables.')
  }

  if (process.env.NODE_ENV === 'production') {
    if (!cachedClient || !cachedDb) {
      cachedClient = new MongoClient(DATABASE_URI)
      cachedClient.connect()
      cachedDb = cachedClient.db(getDatabaseName(DATABASE_URI))
    }
    return { client: cachedClient, db: cachedDb }
  } else {
    if (!global._mongoClient || !global._mongoDb) {
      global._mongoClient = new MongoClient(DATABASE_URI)
      global._mongoClient.connect()
      global._mongoDb = global._mongoClient.db(getDatabaseName(DATABASE_URI))
    }
    return { client: global._mongoClient, db: global._mongoDb }
  }
}

export function getMangasCollection(): Collection<Manga> {
  const { db } = getClient()
  return db.collection('mangas')
}

export function getChaptersCollection(): Collection<Chapter> {
  const { db } = getClient()
  return db.collection('chapters')
}

export function getSessionsCollection(): Collection<SessionDoc> {
  const { db } = getClient()
  return db.collection('sessions')
}

// For backwards compatibility - lazy getters
export const mangasCollection = {
  get collection() {
    return getMangasCollection()
  },
}

export const chaptersCollection = {
  get collection() {
    return getChaptersCollection()
  },
}
