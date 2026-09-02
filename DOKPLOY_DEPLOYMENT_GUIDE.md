# 🚀 Dokploy Production Deployment Guide

This guide provides a comprehensive, step-by-step walkthrough for deploying the **Portfolio Full-Stack Monorepo** as individual, isolated services (API, Web, Dashboard, PostgreSQL, and Redis) on [Dokploy](https://dokploy.com/).

> [!TIP]
> For a full breakdown of all environment variables, build arguments, and build commands across all 3 applications, refer to the [Production Build & Environment Management Guide](file:///home/fiamanillah/Projects/Portfolio/BUILD_AND_ENV_GUIDE.md).

---

## 📑 Table of Contents

1. [Architecture & Topology](#-architecture--topology)
2. [Step 1: Provision Managed Databases (PostgreSQL & Redis)](#step-1-provision-managed-databases-postgresql--redis)
3. [Step 2: Deploy Backend API (`portfolio-api`)](#step-2-deploy-backend-api-portfolio-api)
4. [Step 3: Run Production Database Migrations & Seeding](#step-3-run-production-database-migrations--seeding)
5. [Step 4: Deploy Web Frontend (`portfolio-web`)](#step-4-deploy-web-frontend-portfolio-web)
6. [Step 5: Deploy Admin Dashboard (`portfolio-dashboard`)](#step-5-deploy-admin-dashboard-portfolio-dashboard)
7. [Step 6: Configure Automated Continuous Deployment (CI/CD)](#step-6-configure-automated-continuous-deployment-cicd)
8. [Step 7: Verification, Health Checks & Troubleshooting](#step-7-verification-health-checks--troubleshooting)

---

## 🌟 Architecture & Topology

Each application is deployed as an independent container service managed by Dokploy, connected via Dokploy's internal Docker network with automated SSL termination provided by Traefik.

```mermaid
graph TD
    Client[Web Visitors & Admin] --> Traefik[Dokploy Reverse Proxy / Traefik (HTTPS / SSL)]

    subgraph Dokploy Server (Internal Docker Network)
        Traefik -->|fi.amanillah.com| Web[Astro Frontend - Port 80]
        Traefik -->|admin-fi.amanillah.com| Dashboard[Next.js Dashboard - Port 3001]
        Traefik -->|api-fi.amanillah.com| API[Express + Bun API - Port 3040]

        API --> Postgres[(Dokploy Managed PostgreSQL 17)]
        API --> Redis[(Dokploy Managed Redis 7)]
    end

    API --> CloudflareR2[(Cloudflare R2 Storage)]
    API --> Plunk[Plunk Email Gateway]
    API --> CloudflareTurnstile[Cloudflare Turnstile Verification]
```

### Services Summary

| Service        | Technology             | Source Options                               | Internal Port | Public Domain                     |
| :------------- | :--------------------- | :------------------------------------------- | :------------ | :-------------------------------- |
| **PostgreSQL** | Postgres 17 Alpine     | Dokploy Managed Database                     | `5432`        | _(Internal only or exposed port)_ |
| **Redis**      | Redis 7 Alpine         | Dokploy Managed Database                     | `6379`        | _(Internal only)_                 |
| **API**        | Bun + Express + Prisma | Docker Image or Git (`Dockerfile.api`)       | `3040`        | `https://api-fi.amanillah.com`    |
| **Web**        | Astro 5 + Nginx        | Docker Image or Git (`Dockerfile.web`)       | `80`          | `https://fi.amanillah.com`        |
| **Dashboard**  | Next.js 16 Standalone  | Docker Image or Git (`Dockerfile.dashboard`) | `3001`        | `https://admin-fi.amanillah.com`  |

---

## Step 1: Provision Managed Databases (PostgreSQL & Redis)

Before deploying the applications, provision the persistent storage layers in Dokploy.

### 1. PostgreSQL 17 Database

1. In the Dokploy sidebar, navigate to **Databases** -> Click **Create Database**.
2. Select **PostgreSQL**.
3. Fill in the database details:
   - **Name**: `portfolio-db`
   - **Database Name**: `portfolio_db`
   - **User**: `fiamanillah`
   - **Password**: `<Generate-Strong-Password>`
4. Click **Deploy**.
5. Once deployed, note down the **Internal Connection String** (or internal Docker network hostname).
   - Format: `postgresql://fiamanillah:<password>@portfolio-db:5432/portfolio_db?schema=public`

> [!NOTE]
> If you want to connect to PostgreSQL from your local machine to run migrations or inspect data with Prisma Studio, enable **External Access** on a designated host port (e.g. `5445`).

### 2. Redis 7 Database

1. Go to **Databases** -> Click **Create Database**.
2. Select **Redis**.
3. Fill in the details:
   - **Name**: `portfolio-redis`
   - **Password**: _(Optional or set a strong password)_
4. Click **Deploy**.
5. Note the **Internal Connection String**:
   - Format: `redis://portfolio-redis:6379` (or `redis://:password@portfolio-redis:6379`)

---

## Step 2: Deploy Backend API (`portfolio-api`)

The API service runs Express 5 on Bun and interacts directly with PostgreSQL, Redis, Cloudflare R2, and Plunk.

### 1. Create the Application in Dokploy

1. In Dokploy, go to **Projects** -> Select your Project (or click **Create Project**).
2. Click **Add Service** -> Choose **Application**.
3. Set **Name**: `portfolio-api`.

### 2. Configure Source & Build Type

Choose either **Option A (Docker Image)** or **Option B (Git Repository)**:

#### Option A: Deploy Pre-built Docker Hub Image (Recommended for speed)

_If you built and pushed your image using `docker build -t <username>/portfolio-api -f Dockerfile.api . && docker push <username>/portfolio-api`_:

- **Source Type**: `Docker`
- **Image**: `fiamanillah/portfolio-api:latest` (replace with your image tag)

#### Option B: Build from Git Repository in Dokploy

- **Source Type**: `Git` (or `GitHub` / `GitLab`)
- **Repository URL**: `https://github.com/<your-username>/Portfolio.git`
- **Branch**: `main`
- **Build Type**: `Dockerfile`
- **Dockerfile Path**: `Dockerfile.api`
- **Context Path**: `.` _(the root directory of the monorepo)_

### 3. Configure Environment Variables

In the **Environment** tab of `portfolio-api`, paste the following production configuration:

```dotenv
# General Server Configuration
NODE_ENV=production
PORT=3040

# Database Configuration (Use internal Dokploy service name or connection string)
DATABASE_URL=postgresql://fiamanillah:<your-db-password>@portfolio-db:5432/portfolio_db?schema=public

# Redis Configuration (Use internal Dokploy service name)
REDIS_HOST=portfolio-redis
REDIS_PORT=6379
REDIS_URL=redis://portfolio-redis:6379

# Public Domain URLs
PUBLIC_WEB_URL=https://fi.amanillah.com
PUBLIC_API_URL=https://api-fi.amanillah.com
NEXT_PUBLIC_API_URL=https://api-fi.amanillah.com
PUBLIC_DASHBOARD_URL=https://admin-fi.amanillah.com

# Security & CORS Origins
ALLOWED_ORIGINS=https://fi.amanillah.com,https://admin-fi.amanillah.com
JWT_SECRET=replace_with_a_64_char_secure_random_hex_string
JWT_EXPIRES_IN=7d
JWT_ISSUER=portfolio-api

# Admin Seed Account
DEFAULT_ADMIN_EMAIL=admin@fi.amanillah.com
DEFAULT_ADMIN_PASSWORD=replace_with_a_secure_admin_password

# Object Storage (Cloudflare R2)
STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=portfolio-assets
R2_PUBLIC_DOMAIN=https://assets-fi.amanillah.com

# Cloudflare Turnstile CAPTCHA Validation
TURNSTILE_SECRET_KEY=0x4AAAAAAAYourSecretKey
TURNSTILE_VERIFY_URL=https://challenges.cloudflare.com/turnstile/v0/siteverify

# Email Delivery (Plunk)
PLUNK_SECRET_KEY=plunk_sk_your_key_here
PERSONAL_EMAIL=fi@amanillah.com
SYSTEM_FROM_EMAIL=system@mail.amanillah.com
AUTH_FROM_EMAIL=auth@mail.amanillah.com
```

### 4. Configure Domains & Health Check

1. Go to the **Domains** tab:
   - **Domain**: `api-fi.amanillah.com`
   - **Container Port**: `3040`
   - **HTTPS / Certificate**: Enabled (Let's Encrypt automatic SSL)
2. Go to the **Health Check** settings (or Advanced):
   - **Path**: `/health`
   - **Interval**: `15s`
   - **Timeout**: `5s`
   - **Retries**: `3`
3. Click **Deploy**.

---

## Step 3: Run Production Database Migrations & Seeding

> [!IMPORTANT]
> In production, you must run `prisma migrate deploy` (NOT `prisma migrate dev` or `prisma db push`).
> `prisma migrate deploy` applies all unapplied database migrations safely without creating new migrations or resetting data.

Here are the 3 recommended ways to run migrations on your production database:

### Method 1: Dokploy Web Terminal (Easiest & Recommended)

1. Open your Dokploy Dashboard and go to the deployed **`portfolio-api`** application.
2. Click on the **Terminal** (or **Console / Execute Command**) tab.
3. Open a shell session (default is `/bin/sh` or `/bin/bash`).
4. Execute the following commands:

```bash
# 1. Navigate to the database package directory
cd /app/packages/db

# 2. Check current migration status (optional)
bunx prisma migrate status

# 3. Apply pending migrations to production
bun run db:migrate:prod
# (Equivalent to: bunx prisma migrate deploy)

# 4. Seed the initial production Admin account from environment variables
bun run db:seed:prod
```

> [!TIP]
> `bun run db:seed:prod` securely reads `DEFAULT_ADMIN_EMAIL` and `DEFAULT_ADMIN_PASSWORD` from your environment to create/upsert your admin account without inserting dummy sample data. If you wish to populate all demo blog posts, case studies, and mock users for testing, run `bun run db:seed`.

### Method 2: Remote Migration from Local Machine

If your Dokploy PostgreSQL database is accessible from your local machine (e.g. external port `5445` exposed):

```bash
# Apply migrations:
DATABASE_URL="postgresql://fiamanillah:<password>@<dokploy-server-ip>:5445/portfolio_db?schema=public" \
bun --filter=@workspace/db db:migrate:prod

# Seed production admin:
DATABASE_URL="postgresql://fiamanillah:<password>@<dokploy-server-ip>:5445/portfolio_db?schema=public" \
DEFAULT_ADMIN_EMAIL="admin@fi.amanillah.com" \
DEFAULT_ADMIN_PASSWORD="YourStrongPassword" \
bun --filter=@workspace/db db:seed:prod
```

### Method 3: Via SSH on your Dokploy Server Host

If you have SSH access to your VPS server:

```bash
# 1. SSH into your VPS
ssh user@your-server-ip

# 2. Find the running API container ID
docker ps --filter "name=portfolio-api"

# 3. Execute the migration inside the running API container
docker exec -it <CONTAINER_ID_OR_NAME> sh -c "cd /app/packages/db && bun run db:migrate:prod"

# 4. Seed the production admin user
docker exec -it <CONTAINER_ID_OR_NAME> sh -c "cd /app/packages/db && bun run db:seed:prod"
```

---

## Step 4: Deploy Web Frontend (`portfolio-web`)

The web frontend is built with Astro 5 as a static build and served by a high-performance, tuned Nginx server on port `80`.

### 1. Build and Push Docker Image (or configure Git build)

**If using Docker Hub (Recommended):**

```bash
# From local repository root:
docker build \
  -t fiamanillah/portfolio-web:latest \
  -f Dockerfile.web \
  --build-arg PUBLIC_WEB_URL="https://fi.amanillah.com" \
  --build-arg PUBLIC_API_URL="https://api-fi.amanillah.com" \
  --build-arg PUBLIC_TURNSTILE_SITE_KEY="0x4AAAAAAAYourKey" \
  .

docker push fiamanillah/portfolio-web:latest
```

### 2. Configure in Dokploy

1. In Dokploy, click **Add Service** -> **Application** -> Name: `portfolio-web`.
2. **Source**:
   - **Docker Image**: `fiamanillah/portfolio-web:latest`
   - _OR_ **Git**: Dockerfile `Dockerfile.web`, Context `.`, and provide Build Arguments under the Build tab:
     - `PUBLIC_WEB_URL`: `https://fi.amanillah.com`
     - `PUBLIC_API_URL`: `https://api-fi.amanillah.com`
     - `PUBLIC_TURNSTILE_SITE_KEY`: `0x4AAAAAAAYourKey`
3. **Domains Tab**:
   - **Domain**: `fi.amanillah.com`
   - **Container Port**: `80`
   - **HTTPS / Certificate**: Enabled
4. **Health Check**:
   - **Path**: `/health`
   - **Port**: `80`
5. Click **Deploy**.

---

## Step 5: Deploy Admin Dashboard (`portfolio-dashboard`)

The dashboard is built with Next.js 16 in Standalone output mode and served by Node.js 22 on port `3001`.

### 1. Build and Push Docker Image (or configure Git build)

**If using Docker Hub (Recommended):**

```bash
# From local repository root:
docker build \
  -t fiamanillah/portfolio-dashboard:latest \
  -f Dockerfile.dashboard \
  --build-arg NEXT_PUBLIC_API_URL="https://api-fi.amanillah.com" \
  --build-arg NEXT_PUBLIC_SITE_URL="https://fi.amanillah.com" \
  .

docker push fiamanillah/portfolio-dashboard:latest
```

### 2. Configure in Dokploy

1. In Dokploy, click **Add Service** -> **Application** -> Name: `portfolio-dashboard`.
2. **Source**:
   - **Docker Image**: `fiamanillah/portfolio-dashboard:latest`
   - _OR_ **Git**: Dockerfile `Dockerfile.dashboard`, Context `.`, with Build Arguments:
     - `NEXT_PUBLIC_API_URL`: `https://api-fi.amanillah.com`
     - `NEXT_PUBLIC_SITE_URL`: `https://fi.amanillah.com`
3. **Environment Tab**:
   ```dotenv
   NODE_ENV=production
   PORT=3001
   HOSTNAME=0.0.0.0
   NEXT_TELEMETRY_DISABLED=1
   ```
4. **Domains Tab**:
   - **Domain**: `admin-fi.amanillah.com`
   - **Container Port**: `3001`
   - **HTTPS / Certificate**: Enabled
5. Click **Deploy**.

---

## Step 6: Configure Automated Continuous Deployment (CI/CD)

Dokploy provides incoming webhook triggers for zero-downtime automated redeployments whenever you push new images or commits.

### Setting up Dokploy Webhooks:

1. In Dokploy, go to each Application (`portfolio-api`, `portfolio-web`, `portfolio-dashboard`).
2. Open the **Deployments** or **Webhooks** tab.
3. Copy the **Webhook URL**.
4. In your GitHub repository settings:
   - Go to **Settings** -> **Webhooks** -> **Add webhook**.
   - Paste the Dokploy Webhook URL as the **Payload URL**.
   - Content type: `application/json`.
   - Select event: **Just the push event** (or trigger via GitHub Actions after Docker build step).

---

## Step 7: Verification, Health Checks & Troubleshooting

### 1. Automated Health Check Verification

Once all services are deployed and running, verify each endpoint:

```bash
# 1. Verify Backend API health
curl -I https://api-fi.amanillah.com/health
# Expected: HTTP/1.1 200 OK -> {"status":"ok",...}

# 2. Verify Astro Frontend
curl -I https://fi.amanillah.com/health
# Expected: HTTP/1.1 200 OK

# 3. Verify Admin Dashboard
curl -I https://admin-fi.amanillah.com
# Expected: HTTP/1.1 200 OK or 307 Redirect to /login
```

### 2. Common Production Issues & Solutions

#### Issue: Database connection fails on API startup (`P1001: Can't reach database server`)

- **Cause**: The API container cannot resolve the PostgreSQL hostname on the Docker network.
- **Solution**: In Dokploy, ensure both `portfolio-api` and `portfolio-db` are on the same Docker network (Dokploy default network). Use the internal service name (e.g. `portfolio-db:5432`) in `DATABASE_URL`, not `localhost` or `127.0.0.1`.

#### Issue: CORS errors when Admin Dashboard or Web calls API

- **Cause**: Origin not listed in `ALLOWED_ORIGINS`.
- **Solution**: Ensure `ALLOWED_ORIGINS=https://fi.amanillah.com,https://admin-fi.amanillah.com` in the `portfolio-api` environment variables, without trailing slashes.

#### Issue: Pending migrations on new feature deployment

- **Solution**: Whenever new Prisma migrations are added to the repository, trigger the migration via Dokploy Web Terminal:
  ```bash
  cd /app/packages/db && bun run db:migrate:prod
  ```
