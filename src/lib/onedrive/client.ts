import { cacheGet, cacheSet } from './cache'

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0'

function getBasePath(): string {
  return process.env.ONEDRIVE_BASE_PATH || '/DMS/S3-mangago-bucket'
}

interface DriveItem {
  name: string
  file?: { mimeType: string }
  '@microsoft.graph.downloadUrl'?: string
}

interface DriveItemsResponse {
  value: DriveItem[]
  '@odata.nextLink'?: string
}

/**
 * List and return download URLs for all images in a chapter folder.
 * Filters out non-image files (like lock.txt), sorts numerically by filename.
 */
export async function listImagesForChapter(
  accessToken: string,
  seriesId: string,
  chapterId: string
): Promise<string[]> {
  const cacheKey = `images:${seriesId}:${chapterId}`
  const cached = cacheGet<string[]>(cacheKey)
  if (cached) return cached

  const basePath = getBasePath()
  const folderPath = `${basePath}/${seriesId}/${chapterId}`
  const encodedPath = encodeURIComponent(folderPath).replace(/%2F/g, '/')

  let allItems: DriveItem[] = []
  let url: string | null =
    `${GRAPH_BASE}/me/drive/root:${encodedPath}:/children?$top=200`

  while (url) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Graph API error listing chapter images: ${res.status} ${text}`)
    }

    const data: DriveItemsResponse = await res.json()
    allItems = allItems.concat(data.value)
    url = data['@odata.nextLink'] ?? null
  }

  // Filter to image files only, sort numerically by filename
  const images = allItems
    .filter((item) => item.file && item['@microsoft.graph.downloadUrl'])
    .filter((item) => !item.name.endsWith('.txt'))
    .sort((a, b) => {
      const numA = parseInt(a.name.replace(/\D/g, '') || '0', 10)
      const numB = parseInt(b.name.replace(/\D/g, '') || '0', 10)
      return numA - numB
    })
    .map((item) => item['@microsoft.graph.downloadUrl']!)

  cacheSet(cacheKey, images)
  return images
}

/**
 * Get the download URL for a manga's thumbnail image.
 */
export async function getThumbnailUrl(
  accessToken: string,
  seriesId: string
): Promise<string> {
  const cacheKey = `thumbnail:${seriesId}`
  const cached = cacheGet<string>(cacheKey)
  if (cached) return cached

  const basePath = getBasePath()
  const filePath = `${basePath}/${seriesId}/Thumbnail.jpg`
  const encodedPath = encodeURIComponent(filePath).replace(/%2F/g, '/')

  const res = await fetch(
    `${GRAPH_BASE}/me/drive/root:${encodedPath}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Graph API error getting thumbnail: ${res.status} ${text}`)
  }

  const data = await res.json()
  const url = data['@microsoft.graph.downloadUrl'] as string

  cacheSet(cacheKey, url)
  return url
}

/**
 * Check if requests.json exists at the base path.
 * Used as authorization gate during login.
 */
export async function checkRequestsJsonExists(accessToken: string): Promise<boolean> {
  const basePath = getBasePath()
  const filePath = `${basePath}/requests.json`
  const encodedPath = encodeURIComponent(filePath).replace(/%2F/g, '/')

  const res = await fetch(
    `${GRAPH_BASE}/me/drive/root:${encodedPath}?$select=id`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  return res.ok
}
