import { requireAuth } from '@/lib/auth/middleware'
import {
  getMangaSeriesByGenre,
  getMangaSeriesOnDeck,
  getLastUpdatedSeries,
  getNewUpdates,
  getReadAgainSeries,
} from '@/lib/manga/queries'
import {
  serializeMangaList,
  serializeMangaWithDateList,
  serializeMangasByGenre,
} from '@/lib/manga/serialize'
import { MangaGrid } from '@/components/manga'

export default async function HomePage() {
  // Require authentication
  const user = await requireAuth()

  // Fetch all data in parallel
  const [onDeck, newUpdates, lastUpdated, byGenre, readAgain] =
    await Promise.all([
      getMangaSeriesOnDeck(),
      getNewUpdates(),
      getLastUpdatedSeries(),
      getMangaSeriesByGenre(),
      getReadAgainSeries(),
    ])

  // Helper to check if date is within last 30 days
  const isWithin30Days = (date: Date | undefined) => {
    if (!date) return false
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return new Date(date) > thirtyDaysAgo
  }

  // Split "on deck" into recent and older
  const recentOnDeck = onDeck.filter((m) => isWithin30Days(m.newestRead))
  const olderOnDeck = onDeck.filter((m) => !isWithin30Days(m.newestRead))

  // Serialize data for client components
  const serializedRecentOnDeck = serializeMangaWithDateList(recentOnDeck)
  const serializedOlderOnDeck = serializeMangaWithDateList(olderOnDeck)
  const serializedNewUpdates = serializeMangaWithDateList(newUpdates)
  const serializedLastUpdated = serializeMangaWithDateList(lastUpdated)
  const serializedByGenre = serializeMangasByGenre(byGenre)
  const serializedReadAgain = serializeMangaList(readAgain)

  // Get genre entries
  const genreEntries = Object.entries(serializedByGenre)

  // Get username from email
  const username = user.email?.split('@')[0] || 'Reader'

  // Stats for hero
  const totalOnDeck = onDeck.length // Total: recent + continue reading
  const totalNewUpdates = newUpdates.length

  // Build sections array for proper alternating backgrounds
  type Section = {
    key: string
    mangas: typeof serializedRecentOnDeck
    heading: string
    headingLevel?: 'h2' | 'h3'
    linkToRead?: boolean
  }

  const sections: Section[] = [
    serializedRecentOnDeck.length > 0 && {
      key: 'on-deck',
      mangas: serializedRecentOnDeck,
      heading: 'On Deck',
    },
    serializedOlderOnDeck.length > 0 && {
      key: 'continue-reading',
      mangas: serializedOlderOnDeck,
      heading: 'Continue Reading',
    },
    serializedNewUpdates.length > 0 && {
      key: 'new-updates',
      mangas: serializedNewUpdates,
      heading: 'New Updates',
    },
    serializedLastUpdated.length > 0 && {
      key: 'last-updated',
      mangas: serializedLastUpdated,
      heading: 'Last Updated Series',
    },
    ...genreEntries.map(([genre, mangas]) => ({
      key: `genre-${genre}`,
      mangas,
      heading: genre,
      headingLevel: 'h3' as const,
      linkToRead: false,
    })),
    serializedReadAgain.length > 0 && {
      key: 'read-again',
      mangas: serializedReadAgain,
      heading: 'Read Again',
    },
  ].filter(Boolean) as Section[]

  return (
    <div className="pb-12">
      {/* Welcome Hero */}
      <section className="py-8 md:py-12">
        <div className="container">
          <div className="manga-panel p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Welcome Message */}
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-[var(--manga-red)] mb-1">
                  Welcome back
                </p>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                  {username}!
                </h1>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-6">
                {totalOnDeck > 0 && (
                  <div className="text-center">
                    <div className="text-3xl font-black text-[var(--manga-red)]">
                      {totalOnDeck}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wide opacity-70">
                      On Deck
                    </div>
                  </div>
                )}
                {totalNewUpdates > 0 && (
                  <div className="text-center">
                    <div className="text-3xl font-black text-[var(--manga-red)]">
                      {totalNewUpdates}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wide opacity-70">
                      New Updates
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All sections with alternating backgrounds */}
      {sections.map((section, index) => (
        <MangaGrid
          key={section.key}
          keyPrefix={section.key}
          mangas={section.mangas}
          heading={section.heading}
          headingLevel={section.headingLevel}
          variant={index % 2 === 0 ? 'alternate' : 'default'}
          linkToRead={section.linkToRead}
        />
      ))}
    </div>
  )
}
