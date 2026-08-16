// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { MangaRequests } from './collections/MangaRequests'
import { getMangasCollection } from './lib/db/mongodb'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      icons: [{ url: '/icon.svg', type: 'image/svg+xml' }],
      titleSuffix: '— Manga Admin',
    },
    components: {
      views: {
        login: {
          Component: './components/admin/PayloadLoginView',
        },
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, MangaRequests],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [
    // storage-adapter-placeholder
  ],
  endpoints: [
    {
      path: '/requests',
      method: 'get',
      handler: async (req) => {
        const result = await req.payload.find({
          collection: 'manga-requests',
          limit: 0,
          pagination: false,
        })

        type ExportItem = {
          slug: string
          url: string
          meta?: { source: { url: string; name: string } }
          mangaToBeDeleted?: true
        }

        const exportData: ExportItem[] = result.docs.map((doc) => {
          const item: ExportItem = {
            slug: doc.slug,
            url: doc.url,
          }

          if (doc.meta?.source?.url && doc.meta?.source?.name) {
            item.meta = {
              source: {
                url: doc.meta.source.url,
                name: doc.meta.source.name,
              },
            }
          }

          return item
        })

        const toDelete = await getMangasCollection()
          .find(
            { mangaToBeDeleted: true },
            { projection: { 'request.slug': 1, 'request.url': 1 } }
          )
          .toArray()

        for (const manga of toDelete) {
          const slug = (manga as unknown as { request?: { slug?: string } }).request?.slug
          const url = (manga as unknown as { request?: { url?: string } }).request?.url
          if (!slug) continue
          exportData.push({ slug, url: url ?? '', mangaToBeDeleted: true })
        }

        return Response.json(exportData)
      },
    },
  ],
})
