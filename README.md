# Manga Reader

A self-hosted manga reader web app. Manga images are stored in OneDrive and served via the Microsoft Graph API. Authentication uses Microsoft OAuth (personal accounts).

Built with [Next.js](https://nextjs.org), [Payload CMS](https://payloadcms.com), and [MongoDB](https://www.mongodb.com).

## Features

- Browse, search, and read manga with a responsive UI
- Chapter tracking (read/unread, "on deck", new updates)
- Manga rating and chapter reordering
- Microsoft OAuth login with OneDrive authorization gate
- Payload CMS admin panel for content management

## Prerequisites

- Node.js 20+
- pnpm 9+
- MongoDB instance
- Azure Entra app registration (for Microsoft OAuth + OneDrive access)
- OneDrive folder with manga images (populated by a separate extractor tool)

## Setup

1. Clone the repo and install dependencies:

   ```bash
   pnpm install
   ```

2. Copy `.env.example` to `.env` and fill in the values:

   ```bash
   cp .env.example .env
   ```

3. Configure your Azure Entra app registration:
   - Add a client secret
   - Add redirect URI: `http://localhost:3000/api/auth/callback`
   - Ensure API permissions include `Files.Read`, `openid`, `email`, `profile`, `offline_access`
   - Supported account types: Personal Microsoft accounts only

4. Start the dev server:

   ```bash
   pnpm dev
   ```

5. Open `http://localhost:3000`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URI` | MongoDB connection string |
| `PAYLOAD_SECRET` | Secret for Payload CMS |
| `AZURE_CLIENT_ID` | Azure app registration client ID |
| `AZURE_CLIENT_SECRET` | Azure app registration client secret |
| `AZURE_REDIRECT_URI` | OAuth callback URL |
| `ONEDRIVE_BASE_PATH` | OneDrive folder path (default: `/DMS/S3-mangago-bucket`) |
| `SESSION_SECRET` | Random string for session signing |

## Deployment

The app is configured for deployment on [Fly.io](https://fly.io) with `output: 'standalone'` in Next.js config. See `fly.toml` for the configuration.

```bash
fly launch --no-deploy
fly secrets set DATABASE_URI=... PAYLOAD_SECRET=... AZURE_CLIENT_ID=... AZURE_CLIENT_SECRET=... AZURE_REDIRECT_URI=... SESSION_SECRET=...
fly deploy
```

## License

[MIT](LICENSE)
