# Agent Instructions

Monorepo with Astro frontend and Strapi CMS backend. Deployed on Railway.

## Project Structure

```
/
├── frontend/     # Astro 7.x (SSR mode, vanilla CSS)
├── backend/      # Strapi 5.x (headless CMS)
└── AGENTS.md     # This file
```

## Tech Stack

- **Frontend**: Astro 7.x with Node adapter (SSR)
- **Styling**: Vanilla CSS only. No Tailwind, no CSS frameworks
- **Backend**: Strapi 5.x headless CMS
- **Database**: SQLite (local), PostgreSQL (production)
- **Deployment**: Railway (separate services for frontend/backend)

## Development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on http://localhost:4321

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your secrets
npm install
npm run develop
```

Runs on http://localhost:1337
Admin panel: http://localhost:1337/admin

## Environment Variables

### Frontend (Railway)

| Variable | Description |
|----------|-------------|
| `PORT` | Auto-set by Railway |
| `STRAPI_URL` | Backend API URL |

### Backend (Railway)

| Variable | Description |
|----------|-------------|
| `DATABASE_CLIENT` | Set to `postgres` |
| `DATABASE_URL` | PostgreSQL connection string |
| `DATABASE_SSL` | Set to `true` |
| `APP_KEYS` | Comma-separated keys |
| `API_TOKEN_SALT` | Random string |
| `ADMIN_JWT_SECRET` | Random string |
| `TRANSFER_TOKEN_SALT` | Random string |
| `JWT_SECRET` | Random string |

Generate secrets: `openssl rand -base64 32`

## Railway Deployment

1. Create new Railway project
2. Add PostgreSQL service
3. Add service from GitHub repo, set root to `backend/`
4. Add service from GitHub repo, set root to `frontend/`
5. Set environment variables per above
6. Link `DATABASE_URL` to Postgres service variable

Each service has `railway.toml` with build/deploy config.

## Code Style

- No CSS frameworks or preprocessors
- Keep components in `frontend/src/components/`
- Keep pages in `frontend/src/pages/`
- Content types defined in `backend/src/api/`
- Use environment variables for all config

## Fetching Content

Frontend fetches from Strapi REST API:

```javascript
const response = await fetch(`${import.meta.env.STRAPI_URL}/api/posts`);
const { data } = await response.json();
```

## Git Conventions

- Atomic commits with clear messages
- Format: `type: description`
- Types: feat, fix, docs, style, refactor, test, chore
- Example: `feat: add blog post content type`
