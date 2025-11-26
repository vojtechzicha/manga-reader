import type { CollectionConfig } from 'payload'

export const MangaRequests: CollectionConfig = {
  slug: 'manga-requests',
  labels: {
    singular: 'Manga Request',
    plural: 'Manga Requests',
  },
  admin: {
    useAsTitle: 'slug',
    defaultColumns: ['slug', 'url', 'updatedAt'],
    description: 'Manga download requests for the mangago-downloader',
    listSearchableFields: ['slug', 'url', 'meta.source.name'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Unique identifier, URL-safe (e.g., "killing-stalking")',
      },
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        description: 'MangaGo.me URL (e.g., "https://www.mangago.me/read-manga/killing_stalking/")',
      },
    },
    {
      name: 'meta',
      type: 'group',
      admin: {
        description: 'Optional metadata about the manga',
      },
      fields: [
        {
          name: 'source',
          type: 'group',
          admin: {
            description: 'Alternate official source information',
          },
          fields: [
            {
              name: 'url',
              type: 'text',
              admin: {
                description: 'Official source URL (e.g., Lezhin)',
              },
            },
            {
              name: 'name',
              type: 'text',
              admin: {
                description: 'Source platform name (e.g., "Lezhin US")',
              },
            },
          ],
        },
      ],
    },
  ],
}
