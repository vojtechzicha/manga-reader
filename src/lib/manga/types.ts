import type { ObjectId } from 'mongodb'

export interface MangaMeta {
  name: string
  author: string
  genres: string[]
  status: string
  summary: string
  alternativeTitle?: string
  additionalData?: {
    application?: string
    source?: {
      url: string
      name: string
    }
  }
}

export interface MangaRequest {
  slug: string
  url: string
}

export interface Manga {
  _id: ObjectId
  meta: MangaMeta
  request: MangaRequest
  rating?: number
  thumbnail?: Buffer
  lastSync?: Date
  lastSyncWithUpdate?: Date
  dedupRequest?: boolean
}

export interface Chapter {
  _id: ObjectId
  mangaPath: string
  chapterPath: string
  name: string
  index: number
  finalIndex: number
  newIndex: number
  read: boolean
  readAt?: Date | null
  hidden: boolean
  seen: boolean
  lastUpdated: Date
  readProgress?: number | null
}

// Lighter types for list views
export interface MangaListItem {
  _id: ObjectId
  meta: {
    name: string
  }
  request: {
    slug: string
  }
  rating?: number
  thumbnail?: Buffer
}

export interface MangaWithDate extends MangaListItem {
  newestRead?: Date
  updatedAt?: Date
}

export interface MangasByGenre {
  [genre: string]: MangaListItem[]
}
