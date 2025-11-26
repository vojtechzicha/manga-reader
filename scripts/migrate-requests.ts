import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface MangaRequest {
  slug: string
  url: string
  meta?: {
    source?: {
      url: string
      name: string
    }
  }
}

async function migrateRequests() {
  console.log('Starting migration...')

  // Initialize Payload
  const payload = await getPayload({ config })

  // Read the original requests.json
  const requestsPath = path.resolve(__dirname, '../../mangago-downloader/requests.json')
  const requestsData: MangaRequest[] = JSON.parse(fs.readFileSync(requestsPath, 'utf-8'))

  console.log(`Found ${requestsData.length} manga requests to migrate`)

  let successCount = 0
  let skipCount = 0
  let errorCount = 0
  const errors: Array<{ slug: string; error: string }> = []

  for (let i = 0; i < requestsData.length; i++) {
    const request = requestsData[i]

    if (i % 100 === 0) {
      console.log(`Progress: ${i}/${requestsData.length}`)
    }

    try {
      // Check if already exists
      const existing = await payload.find({
        collection: 'manga-requests',
        where: {
          slug: {
            equals: request.slug,
          },
        },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        skipCount++
        continue
      }

      // Create new document
      await payload.create({
        collection: 'manga-requests',
        data: {
          slug: request.slug,
          url: request.url,
          meta: request.meta
            ? {
                source: request.meta.source
                  ? {
                      url: request.meta.source.url,
                      name: request.meta.source.name,
                    }
                  : undefined,
              }
            : undefined,
        },
      })

      successCount++
    } catch (error: unknown) {
      errorCount++
      const errorMessage = error instanceof Error ? error.message : String(error)
      errors.push({ slug: request.slug, error: errorMessage })
      console.error(`Error migrating ${request.slug}:`, errorMessage)
    }
  }

  console.log('\n--- Migration Complete ---')
  console.log(`Success: ${successCount}`)
  console.log(`Skipped (already exists): ${skipCount}`)
  console.log(`Errors: ${errorCount}`)

  if (errors.length > 0) {
    console.log('\nFailed entries:')
    errors.forEach((e) => console.log(`  - ${e.slug}: ${e.error}`))
  }

  process.exit(0)
}

migrateRequests()
