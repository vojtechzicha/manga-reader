# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # Start dev server (port 3000)
pnpm build            # Production build
pnpm lint             # ESLint (next/core-web-vitals + next/typescript)
pnpm test             # Run all tests (integration + e2e)
pnpm test:int         # Integration tests only (vitest)
pnpm test:e2e         # E2E tests only (playwright, starts dev server)
pnpm generate:types   # Regenerate Payload CMS types (run after collection schema changes)
```

Run a single integration test:
```bash
cross-env NODE_OPTIONS=--no-deprecation vitest run --config ./vitest.config.mts tests/int/auth-routes.int.spec.ts
```

## Architecture

**Stack:** Next.js 15 (App Router) + Payload CMS 3 + MongoDB + Microsoft OAuth + OneDrive (Microsoft Graph API) + Tailwind CSS 4. Package manager is pnpm. ESM modules throughout.

### Route groups

- `src/app/(frontend)/` — User-facing manga reader (home, manga detail, chapter reader, login/logout)
- `src/app/(payload)/` — Payload CMS admin panel at `/admin`
- `src/app/api/auth/` — OAuth login and callback routes

### Key layers

- **`src/lib/auth/`** — Microsoft OAuth flow (Azure Entra), session management stored in MongoDB `sessions` collection, cookie-based auth. Sessions auto-refresh expired access tokens. An "authorization gate" checks the user has a `requests.json` file at the OneDrive base path. Admin access controlled by `ADMIN_EMAILS` env var.
- **`src/lib/manga/queries.ts`** — All MongoDB queries for manga/chapter data (mangas and chapters collections). This is the primary data access layer.
- **`src/lib/manga/serialize.ts`** — Converts MongoDB documents to plain objects for client components.
- **`src/lib/onedrive/client.ts`** — Microsoft Graph API client for listing chapters and images from OneDrive. Has in-memory cache (`cache.ts`, 5-min TTL).
- **`src/collections/`** — Payload CMS collection definitions (Users, Media, MangaRequests).
- **`src/app/(frontend)/actions/manga.ts`** — Server actions for mutations (mark read, rate, reorder chapters).

### Data model (MongoDB, not via Payload)

The `mangas` and `chapters` collections are accessed directly via the MongoDB driver (not through Payload CMS). Payload manages its own `users` collection and `manga-requests`.

- **mangas**: `meta.{name, author, genres[], status, summary}`, `request.{slug, url}`, `rating`, `thumbnail`
- **chapters**: `mangaPath`, `chapterPath`, `name`, `index`, `read`, `hidden`, `finalIndex`

### Authentication integration with Payload

Payload CMS uses a custom auth strategy (`src/collections/Users.ts`) that reads the session cookie and validates against the MongoDB sessions collection, bridging Microsoft OAuth with Payload's user system.

## Code style

- TypeScript strict mode, `@typescript-eslint/no-explicit-any` is warn (not error)
- Unused variables prefixed with `_` are allowed
- Prettier: single quotes, trailing commas
- ESLint ignores `.next/` directory
