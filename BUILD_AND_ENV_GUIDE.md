# 🏗️ Production Build Guide & Environment Management

A comprehensive technical guide for managing environment variables, compiling builds, and orchestrating production deployments for the **Portfolio Monorepo** (`apps/web`, `apps/dashboard`, and `apps/api`).

---

## 📑 Table of Contents
1. [Architecture & Apps Summary](#-architecture--apps-summary)
2. [Environment Variables Matrix](#-environment-variables-matrix)
3. [Build-Time vs Runtime Variables (Critical)](#-build-time-vs-runtime-variables-critical)
4. [Environment Files Structure](#-environment-files-structure)
5. [Build Commands Reference](#-build-commands-reference)
   - [1. Local Turbo Monorepo Builds](#1-local-turbo-monorepo-builds)
   - [2. Docker Individual Builds](#2-docker-individual-builds)
   - [3. Production Docker Compose](#3-production-docker-compose)
6. [Production Environment Management](#-production-environment-management)
   - [Dokploy Deployment Workflow](#dokploy-deployment-workflow)
   - [Automated Environment Validation (`check:env`)](#automated-environment-validation-checkenv)
   - [Database Migrations & Production Seeding](#database-migrations--production-seeding)
   - [Zero-Downtime Secret Rotation](#zero-downtime-secret-rotation)

---

## 🌟 Architecture & Apps Summary

The monorepo contains 3 distinct applications, each optimized for its specific workload:

```mermaid
graph LR
    subgraph Client-Side / Browser
        Browser[Web Visitor & Admin Browser]
    end

    subgraph apps/web [Astro 5 SSG]
        Nginx[Nginx Web Server :80]
        StaticAssets[Pre-rendered HTML / CSS / JS]
    end

    subgraph apps/dashboard [Next.js 16]
        NodeRunner[Node.js 22 Standalone Server :3001]
    end

    subgraph apps/api [Express 5 + Bun]
        BunRunner[Bun Runtime + Express API :3040]
        Prisma[Prisma Engine]
    end

    subgraph Infrastructure
        Postgres[(PostgreSQL 17 :5432)]
        Redis[(Redis 7 Cache :6379)]
        R2[(Cloudflare R2 Object Storage)]
        Plunk[Plunk Email Gateway]
    end

    Browser -->|Public Traffic| Nginx
    Browser -->|Admin Traffic| NodeRunner
    Browser -->|API Requests / Forms| BunRunner
    NodeRunner -->|API Requests| BunRunner
    BunRunner --> Postgres
    BunRunner --> Redis
    BunRunner --> R2
    BunRunner --> Plunk
```

| Application | Path | Framework / Runtime | Output Target | Serving Method | Production Port |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Web** | `apps/web` | Astro 5 + React | Static Build (`dist/`) | Nginx 1.27 Alpine | `80` (HTTP) |
| **Dashboard** | `apps/dashboard` | Next.js 16 + React 19 | Standalone (`.next/standalone`) | Node 22 Alpine | `3001` (Node) |
| **API** | `apps/api` | Express 5 + Bun + Prisma | Bundled JS (`dist/index.js`) | Bun 1 Alpine | `3040` (Bun) |

---

## 📊 Environment Variables Matrix

### 1. Web Frontend (`apps/web`)
*Compiled at build time into static HTML/JS.*

| Variable | Scope | Type | Default (Dev) | Production Example | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `PUBLIC_WEB_URL` | **Build** | URL | `http://localhost:4321` | `https://fi.amanillah.com` | Canonical base URL for SEO, sitemaps, and RSS |
| `PUBLIC_API_URL` | **Build** | URL | `http://localhost:3040` | `https://api.fi.amanillah.com` | Public API endpoint for newsletter, contact & booking |
| `PUBLIC_TURNSTILE_SITE_KEY` | **Build** | String | `1x00000000000000000000AA` | `0x4AAAAAAAYourKey` | Cloudflare Turnstile public widget site key |
| `NODE_ENV` | Build | Enum | `development` | `production` | Node environment indicator |

---

### 2. Admin Dashboard (`apps/dashboard`)
*Frontend client assets inlined at build time; server runs in standalone Node mode.*

| Variable | Scope | Type | Default (Dev) | Production Example | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | **Build** | URL | `http://localhost:3040` | `https://api.fi.amanillah.com` | Backend API URL for all admin client fetching |
| `NEXT_PUBLIC_SITE_URL` | **Build** | URL | `http://localhost:4321` | `https://fi.amanillah.com` | Public main website URL for preview links |
| `PORT` | **Runtime** | Number | `3001` | `3001` | Server listening port |
| `HOSTNAME` | **Runtime** | String | `localhost` | `0.0.0.0` | Host binding interface (must be `0.0.0.0` in Docker) |
| `NODE_ENV` | Both | Enum | `development` | `production` | Production mode switch |
| `NEXT_TELEMETRY_DISABLED` | Both | Number | `1` | `1` | Disables telemetry reporting to Next.js |

---

### 3. Backend API (`apps/api`)
*Loaded and validated dynamically at server runtime using `@workspace/env` Zod schemas.*

| Variable | Scope | Type | Default (Dev) | Production Example | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Core Server** | | | | | |
| `PORT` | Runtime | Number | `3040` | `3040` | Express server port |
| `NODE_ENV` | Runtime | Enum | `development` | `production` | Runtime mode (`production` triggers strict checks) |
| `REQUEST_TIMEOUT` | Runtime | Number | `30000` | `30000` | HTTP request timeout in milliseconds |
| **Database (PostgreSQL)** | | | | | |
| `DATABASE_URL` | Runtime | URL | `postgresql://fiamanillah:fiamanillah@localhost:5445/portfolio_db?schema=public` | `postgresql://fiamanillah:PASS@postgres:5432/portfolio_db?schema=public` | Prisma PostgreSQL database connection string |
| `DB_LOGGING` | Runtime | Boolean | `true` | `false` | Enable/disable verbose Prisma SQL query logging |
| **Redis Cache** | | | | | |
| `REDIS_HOST` | Runtime | String | `localhost` | `redis` | Redis server hostname |
| `REDIS_PORT` | Runtime | Number | `6380` | `6379` | Redis server port |
| `REDIS_PASSWORD` | Runtime | String | `""` | `""` | Optional Redis authentication password |
| `REDIS_DB` | Runtime | Number | `0` | `0` | Redis logical DB index |
| `REDIS_KEY_PREFIX` | Runtime | String | `portfolio:api:` | `portfolio:api:` | Prefix for all cache keys |
| `REDIS_URL` | Runtime | URL | `redis://localhost:6380` | `redis://redis:6379` | Direct Redis connection URL |
| `REDIS_DEFAULT_TTL` | Runtime | Number | `3600` | `3600` | Default cache expiration time in seconds |
| **Security & Auth** | | | | | |
| `ALLOWED_ORIGINS` | Runtime | CSV | `http://localhost:4321,http://localhost:3001` | `https://fi.amanillah.com,https://admin.fi.amanillah.com` | Allowed CORS origins (comma-separated) |
| `RATE_LIMIT_WINDOW_MS` | Runtime | Number | `900000` | `900000` | Rate limiter sliding window (15 mins) |
| `RATE_LIMIT_MAX` | Runtime | Number | `100` | `100` | Maximum requests per IP per window |
| `JWT_SECRET` | Runtime | Secret | `dev-secret-key...` | `openssl rand -hex 64` | 64-character random hex key for signing tokens |
| `JWT_EXPIRES_IN` | Runtime | String | `7d` | `7d` | JWT token lifespan (e.g. `7d`, `24h`) |
| `JWT_ISSUER` | Runtime | String | `portfolio-api` | `portfolio-api` | JWT token issuer signature |
| **Admin Seed** | | | | | |
| `DEFAULT_ADMIN_EMAIL` | Runtime | Email | `admin@example.com` | `admin@fi.amanillah.com` | Initial admin account email for seeding |
| `DEFAULT_ADMIN_PASSWORD` | Runtime | String | `change-me-immediately` | `ComplexPasswordHere!` | Initial admin account password for seeding |
| **Public Service URLs** | | | | | |
| `PUBLIC_WEB_URL` | Runtime | URL | `http://localhost:4321` | `https://fi.amanillah.com` | Public website URL used for generating links in emails |
| `PUBLIC_API_URL` | Runtime | URL | `http://localhost:3040` | `https://api.fi.amanillah.com` | Public API URL for webhooks and OAuth redirects |
| `PUBLIC_DASHBOARD_URL` | Runtime | URL | `http://localhost:3001` | `https://admin.fi.amanillah.com` | Admin dashboard URL |
| **Email Delivery (Plunk)** | | | | | |
| `PLUNK_SECRET_KEY` | Runtime | Secret | `plunk_sk_...` | `plunk_sk_live_...` | Plunk API secret key |
| `PLUNK_API_URL` | Runtime | URL | `https://next-api.useplunk.com` | `https://next-api.useplunk.com` | Plunk REST API endpoint |
| `PERSONAL_EMAIL` | Runtime | Email | `fi@amanillah.com` | `fi@amanillah.com` | Personal receiving address for contact forms |
| `TRANSACTIONAL_FROM_EMAIL` | Runtime | Email | `hello@mail.amanillah.com` | `hello@mail.amanillah.com` | Verified domain sender for transactional alerts |
| `SYSTEM_FROM_EMAIL` | Runtime | Email | `system@mail.amanillah.com` | `system@mail.amanillah.com` | System notification sender |
| `AUTH_FROM_EMAIL` | Runtime | Email | `auth@mail.amanillah.com` | `auth@mail.amanillah.com` | Password reset & auth email sender |
| `BOOKING_FROM_EMAIL` | Runtime | Email | `bookings@mail.amanillah.com` | `bookings@mail.amanillah.com` | Meeting invite sender |
| `NEWSLETTER_FROM_EMAIL` | Runtime | Email | `newsletter@newsletter.amanillah.com` | `newsletter@newsletter.amanillah.com` | Newsletter broadcast sender |
| **Anti-Bot Security** | | | | | |
| `TURNSTILE_SECRET_KEY` | Runtime | Secret | `1x0000000000000000000000000000000AA` | `0x4AAAAAAAYourSecret` | Cloudflare Turnstile server validation secret |
| **Object Storage (Cloudflare R2)** | | | | | |
| `STORAGE_PROVIDER` | Runtime | Enum | `r2` | `r2` | Storage engine (`r2` or `s3`) |
| `R2_ACCOUNT_ID` | Runtime | String | `your_account_id` | `cloudflare_account_id` | Cloudflare Account ID |
| `R2_ACCESS_KEY_ID` | Runtime | Secret | `your_key_id` | `r2_access_key_id` | Cloudflare R2 S3-compatible Access Key ID |
| `R2_SECRET_ACCESS_KEY` | Runtime | Secret | `your_secret` | `r2_secret_access_key` | Cloudflare R2 Secret Access Key |
| `R2_BUCKET_NAME` | Runtime | String | `portfolio-assets` | `portfolio-assets` | Cloudflare R2 Bucket Name |
| `R2_PUBLIC_DOMAIN` | Runtime | URL | `https://assets.fi.amanillah.com` | `https://assets.fi.amanillah.com` | Public CDN domain connected to the bucket |
| **Google Calendar OAuth** | | | | | |
| `GOOGLE_CLIENT_ID` | Runtime | String | `client_id.apps.googleusercontent.com` | `client_id.apps.googleusercontent.com` | Google Cloud OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | Runtime | Secret | `GOCSPX-secret` | `GOCSPX-secret` | Google Cloud OAuth 2.0 Client Secret |
| `GOOGLE_REDIRECT_URI` | Runtime | URL | `http://localhost:3040/booking/v1/google/callback` | `https://api.fi.amanillah.com/booking/v1/google/callback` | Authorized Google OAuth Redirect URI |

---

## ⚠️ Build-Time vs Runtime Variables (Critical)

> [!IMPORTANT]
> **Understanding the difference between Build-Time and Runtime variables is essential to prevent deployment bugs.**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. BUILD-TIME VARIABLES (Inlined into frontend bundles during compilation)   │
│    - Astro: PUBLIC_WEB_URL, PUBLIC_API_URL, PUBLIC_TURNSTILE_SITE_KEY       │
│    - Next.js: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SITE_URL                     │
│    👉 MUST be passed via Docker `--build-arg` or compose `args:`            │
│    👉 If you change them, you MUST REBUILD the Docker container image.      │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ▲
                                      │
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. RUNTIME VARIABLES (Read on server process start / per request)           │
│    - API: DATABASE_URL, REDIS_URL, JWT_SECRET, R2_*, PLUNK_*, GOOGLE_*       │
│    - Dashboard: PORT, HOSTNAME, NODE_ENV                                    │
│    👉 Passed via Docker `environment:` or Dokploy Environment UI.           │
│    👉 Changing these only requires a CONTAINER RESTART, not a rebuild.       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Environment Files Structure

The monorepo provides paired development (`.env.example`) and production (`.env.production.example`) templates for every level:

```
Portfolio/
├── .env.example                     <-- Full monorepo development template
├── .env.production.example          <-- Full monorepo production template (Docker Compose)
│
├── apps/
│   ├── api/
│   │   ├── .env.example             <-- API dev template
│   │   └── .env.production.example  <-- API production template (Standalone container)
│   ├── dashboard/
│   │   ├── .env.example             <-- Dashboard dev template
│   │   └── .env.production.example  <-- Dashboard production template
│   └── web/
│       ├── .env.example             <-- Web dev template
│       └── .env.production.example  <-- Web production template
│
└── packages/
    ├── db/.env.example              <-- Prisma direct DB template
    └── env/src/                     <-- Zod validation schemas (api.ts, dashboard.ts, web.ts)
```

---

## 🛠️ Build Commands Reference

### 1. Local Turbo Monorepo Builds

To compile all applications locally for testing:

```bash
# Validate all environment variables across all packages
bun run check:env

# Generate Prisma Client & Build all 3 apps in parallel
NODE_ENV=production bun run build

# Build individual applications
bun --filter=@workspace/api build         # Outputs to apps/api/dist/index.js
bun --filter=web build                   # Outputs to apps/web/dist/
bun --filter=@workspace/dashboard build   # Outputs to apps/dashboard/.next/standalone/
```

---

### 2. Docker Individual Builds

When building container images individually (e.g. for Dokploy Applications or CI/CD pipelines):

#### A. Web Frontend (`apps/web` - Astro + Nginx)
```bash
docker build -f Dockerfile.web \
  --build-arg PUBLIC_WEB_URL=https://fi.amanillah.com \
  --build-arg PUBLIC_API_URL=https://api.fi.amanillah.com \
  --build-arg PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAAYourKey \
  -t portfolio-web:latest .
```

#### B. Dashboard (`apps/dashboard` - Next.js 16 Standalone)
```bash
docker build -f Dockerfile.dashboard \
  --build-arg NEXT_PUBLIC_API_URL=https://api.fi.amanillah.com \
  --build-arg NEXT_PUBLIC_SITE_URL=https://fi.amanillah.com \
  -t portfolio-dashboard:latest .
```

#### C. API Server (`apps/api` - Express + Bun + Prisma)
```bash
docker build -f Dockerfile.api -t portfolio-api:latest .
```

---

### 3. Production Docker Compose

To build and start the entire multi-container production stack:

```bash
# 1. Copy the production environment template
cp .env.production.example .env

# 2. Fill in your real production secrets in .env
nano .env

# 3. Build all containers with build arguments from .env
docker compose -f docker-compose.prod.yml build --no-cache

# 4. Start all services in the background
docker compose -f docker-compose.prod.yml up -d

# 5. Inspect container health and logs
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f api
```

---

## 🔒 Production Environment Management

### Dokploy Deployment Workflow

When deploying on **Dokploy**, follow these best practices for managing environment variables:

```mermaid
sequenceDiagram
    participant User as Developer / Admin
    participant Dokploy as Dokploy Control Panel
    participant Registry as Docker Build Engine
    participant App as Running Containers

    User->>Dokploy: 1. Paste Production .env into Service Settings
    User->>Dokploy: 2. Click 'Deploy'
    Dokploy->>Registry: 3. Injects Build Args (PUBLIC_*, NEXT_PUBLIC_*)
    Registry->>App: 4. Generates immutable artifacts
    Dokploy->>App: 5. Injects Runtime Secrets (DATABASE_URL, JWT_SECRET, etc.)
    App->>App: 6. Runs `@workspace/env` Zod validation on startup
```

1. **In Compose Deployment Mode**:
   - Go to your Compose service in Dokploy -> **Environment** tab.
   - Paste the contents of `.env.production.example` (populated with real secrets).
   - Dokploy automatically binds the `.env` file and passes `args` to `docker-compose.prod.yml`.

2. **In Individual Application Mode**:
   - **For `portfolio-web`**: Under **Build Arguments**, set `PUBLIC_WEB_URL`, `PUBLIC_API_URL`, `PUBLIC_TURNSTILE_SITE_KEY`.
   - **For `portfolio-dashboard`**: Under **Build Arguments**, set `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`.
   - **For `portfolio-api`**: Under **Environment Variables**, set all database, Redis, auth, R2, and email credentials.

---

### Automated Environment Validation (`check:env`)

Before running deployments or starting containers, you can validate that all environment variables conform to their required formats and types:

```bash
bun run check:env
```

Output:
```text
🔍 Scanning and Validating Monorepo Environment Variables...

  ✔ @workspace/db        Passed (3 variables validated)
  ✔ @workspace/cache     Passed (8 variables validated)
  ✔ apps/web             Passed (4 variables validated)
  ✔ apps/dashboard       Passed (4 variables validated)
  ✔ apps/api             Passed (54 variables validated)

✨ All environment variables are valid across all monorepo workspaces!
```

If any mandatory variable is missing or invalid in production (e.g. placeholder `JWT_SECRET`), the check exits with code `1` and highlights the exact offending variable with descriptive errors.

---

### Database Migrations & Production Seeding

Once the database container is healthy:

```bash
# 1. Run production migrations (safe, applies pending migrations without reset)
docker compose -f docker-compose.prod.yml exec api bun --filter=@workspace/db db:migrate:prod

# 2. (Optional) Seed the database with the initial administrator account
docker compose -f docker-compose.prod.yml exec api bun --filter=@workspace/db db:seed
```

---

### Zero-Downtime Secret Rotation

To rotate production credentials safely without downtime:

1. **Database Password Rotation**:
   - Update user password in PostgreSQL: `ALTER USER fiamanillah WITH PASSWORD 'NewPassword';`
   - Update `DATABASE_URL` in Dokploy / `.env`.
   - Perform a rolling restart of the `api` container (`docker compose restart api`).

2. **JWT Secret Rotation**:
   - Generate a new 64-byte hex key: `openssl rand -hex 64`
   - Update `JWT_SECRET` in `api` environment variables.
   - Restart `api`. Existing user sessions will be invalidated, prompting them to re-login securely.

3. **Cloudflare R2 / S3 Keys Rotation**:
   - Generate new Access Key in Cloudflare R2 dashboard.
   - Update `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` in `api` environment variables.
   - Restart `api`.
   - Delete the old key from Cloudflare dashboard.
