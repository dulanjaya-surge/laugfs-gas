# Laugfs Gas - Agent Instructions

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

### Node version

Requires **Node 22+** (Astro 7 needs `>=22.12`). Managed with nvm — `.nvmrc`
files pin `22` at the repo root and in each service:

```bash
nvm use          # picks up .nvmrc
```

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

## Content Model (Strapi ↔ Astro)

The site is a **CMS-driven page builder**. Pages are composed from section
blocks; the frontend renders whatever blocks a page contains.

### Strapi content types (`backend/src/`)

- **`Page`** (collection type — `api/page`): `title`, `slug` (uid),
  `seo` (component), and `sections` (a **dynamic zone** of section components).
  The home page is a `Page` with `slug: "home"`.
- **`Global`** (single type — `api/global`): site-wide content shared on every
  page — `defaultSeo`, `logo`, `logoOnDark`, `favicon`, `navLinks`,
  `footerColumns`, `footerAddress/Phone/Fax`. `logo` is the primary mark (used
  in the footer); `logoOnDark` is the light-on-dark variant used by the hero
  nav, falling back to `logo`. With neither set the text wordmark renders.
  `favicon` overrides the icon bundled in `frontend/public`.

### Components (`backend/src/components/`)

- **`sections/*`** — one component per page section, added to a Page's dynamic
  zone: `hero, capabilities, energy, numbers, product, safety, maritime, story,
  investors, media`. Section components hold that section's fields and nest the
  shared sub-components below.
- **`home/*`** — reusable sub-components: `section-heading` (heading + `accent`
  word), `capability`, `stat`, `spec`, `safety-tip`, `vessel`, `report`,
  `media-card`, `nav-link`, `footer-column`.
- **`shared/seo`** — `metaTitle`, `metaDescription`, `keywords`, `shareImage`,
  `noindex` (default `true`). Used by `Page.seo` and `Global.defaultSeo`.

### Deep-populate + seed + permissions

- Dynamic zones/components are **not** auto-populated. The `page` and `global`
  controllers override `find`/`findOne` with an explicit `populate` object
  (per-component `on: {}` for the dynamic zone). Edit those when you add fields
  that need populating (nested components, media).
- `backend/src/index.ts` `bootstrap()` **seeds** the Global + home Page on first
  run (idempotent) and **auto-grants** the Public role `find`/`findOne`. Keep
  the seed in sync when you add/rename fields.

### Frontend integration (`frontend/src/`)

- **`pages/[...slug].astro`** — catch-all block renderer. Fetches the page by
  slug (`/` → `home`) + global, then maps each block's `__component` to an Astro
  section component via `sectionMap`.
- **`layouts/Base.astro`** — html shell, orbs, fonts, client script, SEO `<head>`
  (title/description/OG/robots from `page.seo` → `global.defaultSeo` → fallback),
  and the global `Header` + `Footer`.
- **`components/Header.astro`** — sticky site header (logo, nav, CTAs). Rendered
  outside `.page`, whose `overflow: hidden` would otherwise become the scroll
  container and stop `position: sticky` from working. It takes its colors from
  the theme variables, so it inverts with the scroll-driven dark dip; the hero
  sizes itself with `calc(100dvh - var(--header-h))` so the two fill one screen.
- **`components/sections/*.astro`** — one per section; receives `block` (and
  `global` where needed). Each has **hardcoded fallbacks**, so the site renders
  even if Strapi is down or a field is empty.
- **`lib/strapi.ts`** — `getPage(slug)`, `getGlobal()`, `mediaUrl(media, fb)`,
  `mediaAlt(media, fb)`. `STRAPI_URL` resolves `import.meta.env` → `process.env`
  → `http://localhost:1337`.
- **`lib/content.ts`** — `pick`, `arr`, `splitAccent` (wrap an accent word in
  `<em>`), `splitWords` (per-word hero/heading reveal). Re-exports media helpers.
- **`scripts/main.ts`** / **`styles/global.css`** — all client JS and CSS live
  here (imported by the page); the `.astro` files stay markup + data only.

### Adding a section type
1. `backend/src/components/sections/<name>.json` (+ any new `home/*` sub-parts).
2. Add it to `Page.sections` dynamic zone `components` list.
3. Add its populate entry in `api/page/controllers/page.ts`.
4. `frontend/src/components/sections/<Name>.astro` (props: `block`).
5. Register `"sections.<name>": <Name>` in `sectionMap` in `[...slug].astro`.
6. Add a default block to the seed in `backend/src/index.ts`.

### Adding a page
Create a `Page` entry in Strapi (set `slug`, add sections). No code change —
`[...slug].astro` renders it. Use `mediaUrl`/`mediaAlt` for any images; set image
**Alternative text** in the Media Library for alt/SEO.

> Both services block indexing (`robots.txt` + `noindex`). Flip `seo.noindex`
> to `false` (per page or on `Global.defaultSeo`) to allow indexing at launch.

## Git Conventions

- Atomic commits with clear messages
- Format: `type: description`
- Types: feat, fix, docs, style, refactor, test, chore
- Example: `feat: add blog post content type`
