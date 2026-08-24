# 🚀 Dokploy Production Deployment Guide

This guide provides step-by-step instructions for deploying the **Portfolio Full-Stack Monorepo** (Web, Dashboard, API, PostgreSQL, and Redis) on [Dokploy](https://dokploy.com/) using Docker containers.

> [!TIP]
> For a detailed breakdown of all environment variables, build arguments, and build commands across all 3 applications, see the [Production Build & Environment Management Guide](file:///home/fiamanillah/Projects/Portfolio/BUILD_AND_ENV_GUIDE.md).

---

## 🌟 Architecture Overview

```mermaid
graph TD
    Client[Web Visitors & Admin] --> Traefik[Dokploy Reverse Proxy / Traefik (HTTPS / SSL)]
    
    subgraph Dokploy Server
        Traefik -->|fi.amanillah.com| Web[Astro Frontend - Port 80]
        Traefik -->|admin.fi.amanillah.com| Dashboard[Next.js Dashboard - Port 3001]
        Traefik -->|api.fi.amanillah.com| API[Express + Bun API - Port 3040]
        
        API --> Postgres[(PostgreSQL 17 Database)]
        API --> Redis[(Redis 7 Cache)]
    end
    
    API --> CloudflareR2[(Cloudflare R2 Storage)]
    API --> Plunk[Plunk Email Service]
```

| Service | Technology | Dockerfile | Container Port | Base Image | Characteristics |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Web** | Astro 5 (SSG) | `Dockerfile.web` | `80` | `nginx:1.27-alpine` | Ultra-lean (~28MB), 1y cache headers, gzip, <10MB RAM |
| **Dashboard** | Next.js 16 | `Dockerfile.dashboard` | `3001` | `node:22-alpine` | Standalone output (~120MB), non-root user |
| **API** | Express + Bun + Prisma | `Dockerfile.api` | `3040` | `oven/bun:1-alpine` | Bundled distribution (~140MB), OpenSSL Prisma engine |
| **PostgreSQL**| Postgres 17 | `postgres:17-alpine` | `5432` | Alpine | Persistent Volume, auto-restarts |
| **Redis** | Redis 7 | `redis:7-alpine` | `6379` | Alpine | Append-only persistence |

---

## 🛠️ Method 1: Deploy with Dokploy Docker Compose (Recommended)

This is the fastest, simplest method to deploy the entire stack together with automated internal networking and health checks.

### Step 1: Create a Project in Dokploy
1. Log into your **Dokploy Dashboard**.
2. Click **Create Project** (e.g. `Portfolio`).
3. Click **Add Service** -> Choose **Compose**.
4. Name the service: `portfolio-stack`.

### Step 2: Configure the Git Repository
1. Select **Source Type**: `Git` (or `GitHub` / `GitLab`).
2. Provide your repository URL: `https://github.com/<your-username>/Portfolio.git`.
3. Set **Branch**: `main` (or your default branch).
4. Set **Compose Path**: `docker-compose.prod.yml`.

### Step 3: Configure Environment Variables
In the **Environment** tab of your Compose service in Dokploy, paste the required variables (from your `.env`):

```dotenv
# General Server Configuration
NODE_ENV=production
PORT=3040

# Database Configuration (Internal Docker service)
POSTGRES_USER=fiamanillah
POSTGRES_PASSWORD=generate_a_strong_password_here
POSTGRES_DB=portfolio_db
DATABASE_URL=postgresql://fiamanillah:generate_a_strong_password_here@postgres:5432/portfolio_db?schema=public

# Redis Configuration (Internal Docker service)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_URL=redis://redis:6379

# Public Domain URLs
PUBLIC_WEB_URL=https://fi.amanillah.com
PUBLIC_API_URL=https://api.fi.amanillah.com
NEXT_PUBLIC_API_URL=https://api.fi.amanillah.com
PUBLIC_DASHBOARD_URL=https://admin.fi.amanillah.com

# Security & Secrets
ALLOWED_ORIGINS=https://fi.amanillah.com,https://admin.fi.amanillah.com
JWT_SECRET=replace_with_a_64_char_secure_random_hex_string
JWT_EXPIRES_IN=7d
JWT_ISSUER=portfolio-api

# Admin Seed Account
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=replace_with_a_secure_admin_password

# Object Storage (Cloudflare R2)
STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=portfolio-assets
R2_PUBLIC_DOMAIN=https://assets.fi.amanillah.com

# Email Delivery (Plunk)
PLUNK_SECRET_KEY=plunk_sk_your_key_here
PERSONAL_EMAIL=fi@amanillah.com
SYSTEM_FROM_EMAIL=system@mail.amanillah.com
AUTH_FROM_EMAIL=auth@mail.amanillah.com
```

### Step 4: Configure Domains & SSL (Traefik)
In Dokploy, add domains for each exposed service:
1. **Web Frontend**:
   - **Domain**: `fi.amanillah.com`
   - **Service**: `web`
   - **Container Port**: `80`
   - **HTTPS / Certificate**: Enabled (Let's Encrypt automatic SSL)
2. **Admin Dashboard**:
   - **Domain**: `admin.fi.amanillah.com`
   - **Service**: `dashboard`
   - **Container Port**: `3001`
   - **HTTPS / Certificate**: Enabled
3. **Backend API**:
   - **Domain**: `api.fi.amanillah.com`
   - **Service**: `api`
   - **Container Port**: `3040`
   - **HTTPS / Certificate**: Enabled

### Step 5: Deploy & Run Initial Database Migrations
1. Click **Deploy**. Dokploy will pull the repo, build all Docker containers in parallel, and spin up the stack.
2. Once the containers are running healthy, go to the **Terminal** tab for the `api` container in Dokploy (or run via SSH):
   ```bash
   cd /app/packages/db && bun run db:migrate:prod
   ```
   *(Optional)* To seed the database with initial admin credentials:
   ```bash
   cd /app/packages/db && bun run db:seed
   ```

---

## 🧩 Method 2: Deploy as Individual Dokploy Applications

If you prefer deploying each component as an independent Dokploy Application with dedicated scaling and resource limits:

### Step 1: Create Managed PostgreSQL & Redis in Dokploy
1. In Dokploy, go to **Databases** -> **Create Database** -> Select **PostgreSQL**.
   - Database Name: `portfolio_db`
   - User: `fiamanillah`
   - Password: `<secure-password>`
2. Go to **Databases** -> **Create Database** -> Select **Redis**.
3. Note down the internal connection strings.

### Step 2: Deploy API (`apps/api`)
1. Create **Application** -> Name: `portfolio-api`.
2. Source: Your Git Repository.
3. Build Type: **Dockerfile**.
4. **Dockerfile Path**: `Dockerfile.api` (or `apps/api/Dockerfile`).
5. **Context Path**: `.` (Root directory of repo).
6. **Environment Variables**: Add all backend environment variables (`DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `R2 credentials`, etc.).
7. **Domain**: `api.fi.amanillah.com` -> Container Port: `3040`.
8. Click **Deploy**.

### Step 3: Deploy Web Frontend (`apps/web`)
1. Create **Application** -> Name: `portfolio-web`.
2. Source: Your Git Repository.
3. Build Type: **Dockerfile**.
4. **Dockerfile Path**: `Dockerfile.web` (or `apps/web/Dockerfile`).
5. **Context Path**: `.`.
6. **Build Arguments**:
   - `PUBLIC_WEB_URL`: `https://fi.amanillah.com`
   - `PUBLIC_API_URL`: `https://api.fi.amanillah.com`
7. **Domain**: `fi.amanillah.com` -> Container Port: `80`.
8. Click **Deploy**.

### Step 4: Deploy Dashboard (`apps/dashboard`)
1. Create **Application** -> Name: `portfolio-dashboard`.
2. Source: Your Git Repository.
3. Build Type: **Dockerfile**.
4. **Dockerfile Path**: `Dockerfile.dashboard` (or `apps/dashboard/Dockerfile`).
5. **Context Path**: `.`.
6. **Build Arguments & Environment**:
   - `NEXT_PUBLIC_API_URL`: `https://api.fi.amanillah.com`
   - `NEXT_PUBLIC_SITE_URL`: `https://fi.amanillah.com`
7. **Domain**: `admin.fi.amanillah.com` -> Container Port: `3001`.
8. Click **Deploy**.

---

## ⚡ Performance & Optimization Best Practices

1. **Docker Layer Caching**: All Dockerfiles are structured so that `package.json`, `bun.lock`, and package manifests are copied and installed in an early cached stage. Code changes rebuild in seconds without re-downloading `node_modules`.
2. **Minimal Image Footprints**:
   - Web Nginx image: **~28MB**
   - Dashboard Next.js standalone image: **~78MB**
   - API Bun image: **~250MB**
3. **Security (Non-Root Users)**:
   - `api` runs under unprivileged `bun` user (`UID 1000`).
   - `dashboard` runs under unprivileged `nextjs:nodejs` user (`UID 1001`).
   - `web` runs under optimized Nginx worker processes.
4. **Automated Continuous Deployment**:
   - In Dokploy, go to each Application/Compose Stack -> **Deployments** -> Copy the **Webhook URL**.
   - Add this Webhook URL to your GitHub/GitLab repository settings under **Webhooks** (`push` event) for zero-downtime automated deployments on every git push.
