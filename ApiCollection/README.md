# Portfolio API Collection (OpenCollection Standard)

Comprehensive OpenCollection (v1.0.0) API test collection covering **100% of all 189 endpoints** across all 15 application modules and system health services.

Compatible with [Bruno](https://www.usebruno.com/), VS Code OpenCollection plugins, and REST client tools.

---

## 📁 Collection Structure

```
ApiCollection/
├── opencollection.yml             # Collection manifest & Bruno integration config
├── environments/
│   ├── dev.yml                    # Development environment (http://localhost:3040)
│   └── prod.yml                   # Production environment (https://api-fi.amanillah.com)
├── Auth/                          # Authentication, OTP, JWT refresh & Google OAuth (14 endpoints)
├── Blog/                          # Posts, categories, tags, reactions, SEO & RSS (26 endpoints)
├── Booking/                       # Calendly-style booking slots, ICS & Google Sync (14 endpoints)
├── CaseStudy/                     # Architecture case studies, tech stack & reactions (15 endpoints)
├── Comment/                       # Blog comments, replies, reactions & moderation (15 endpoints)
├── Contact/                       # Rate-limited contact inquiry dispatches (1 endpoint)
├── Experience/                    # Career milestones, achievements & skills mapping (12 endpoints)
├── Media/                         # S3 / Cloudflare R2 uploads, presigned URLs & asset streaming (15 endpoints)
├── Newsletter/                    # Campaign drafts, spam audit, recipients & scheduling (15 endpoints)
├── Redirect/                      # 301/302 edge vanity redirects & path resolution (7 endpoints)
├── Resume/                        # Multi-version CV management, downloads & activation (9 endpoints)
├── Skill/                         # Categorized skills, proficiency levels & reordering (18 endpoints)
├── Subscriber/                    # Audience list, one-click unsubscribes & token verification (14 endpoints)
├── System/                        # Health check & database/cache probes (1 endpoint)
├── Template/                      # Liquid system & marketing email templates with Plunk sync (13 endpoints)
└── User/                          # Profiles, avatars, resumes, roles & author public pages (14 endpoints)
```

---

## 🚀 Getting Started

### 1. Environments & Variables

Select your active environment in Bruno or your API client:

| Environment | Variable    | Value                          | Description                           |
| :---------- | :---------- | :----------------------------- | :------------------------------------ |
| **dev**     | `baseUrl`   | `http://localhost:3040`        | Local development API server          |
| **dev**     | `authToken` | `""`                           | JWT bearer token for protected routes |
| **prod**    | `baseUrl`   | `https://api-fi.amanillah.com` | Production API server                 |
| **prod**    | `authToken` | `""`                           | JWT bearer token for protected routes |

### 2. Authentication Workflow

1. Open **Auth → Demo Login** or **Auth → Login**.
2. Execute the request:
   - For `Demo-Login.yml`, payload is `{"userId": "user-fi"}` or admin test credentials.
   - For `Login.yml`, payload is `{"email": "fi@amanillah.dev", "password": "Password123!"}`.
3. Copy the returned `accessToken` from the response JSON `data.accessToken`.
4. Update the `authToken` variable in your active environment (`environments/dev.yml`).
5. All administrative (`adminGuard`, `Role.ADMIN`) and profile endpoints will automatically send `Authorization: Bearer {{authToken}}`.

---

## 📑 Complete API Endpoints Catalog (189 Endpoints)

### 1. Auth Module (`/auth/v1/*`) — 14 Endpoints

| Action                  | Method | Route                          | Description                                      |
| :---------------------- | :----- | :----------------------------- | :----------------------------------------------- |
| Initiate Registration   | `POST` | `/auth/v1/register/initiate`   | Start email registration and send OTP            |
| Verify Registration OTP | `POST` | `/auth/v1/register/verify-otp` | Verify OTP code and activate user                |
| Login                   | `POST` | `/auth/v1/login`               | Password sign-in, issues access & refresh tokens |
| Demo Login              | `POST` | `/auth/v1/demo-login`          | 1-Click quick sign-in for testing                |
| Forgot Password         | `POST` | `/auth/v1/forgot-password`     | Request password reset email with OTP            |
| Verify Reset OTP        | `POST` | `/auth/v1/verify-reset-otp`    | Validate password reset OTP                      |
| Reset Password          | `POST` | `/auth/v1/reset-password`      | Set new password using verified OTP              |
| Resend OTP              | `POST` | `/auth/v1/resend-otp`          | Resend registration or reset OTP                 |
| Refresh Token           | `POST` | `/auth/v1/refresh-token`       | Rotate JWT access and refresh tokens             |
| Logout                  | `POST` | `/auth/v1/logout`              | Revoke active refresh token and clear cookies    |
| Get Current User (Me)   | `GET`  | `/auth/v1/me`                  | Retrieve authenticated user profile              |
| Get Google OAuth URL    | `GET`  | `/auth/v1/google`              | Retrieve Google OAuth consent URL                |
| Google OAuth Callback   | `GET`  | `/auth/v1/google/callback`     | OAuth redirect callback handler                  |
| Google Login            | `POST` | `/auth/v1/google`              | Authenticate directly with Google ID token/code  |

### 2. User Module (`/users/v1/*`) — 14 Endpoints

| Action                 | Method   | Route                                | Description                                    |
| :--------------------- | :------- | :----------------------------------- | :--------------------------------------------- |
| Public Resume Metadata | `GET`    | `/users/v1/public/resume`            | Public active resume document info             |
| Public Author Profile  | `GET`    | `/users/v1/public/authors/:username` | Author bio, social links & published articles  |
| Get Profile            | `GET`    | `/users/v1/profile`                  | Current user account profile                   |
| Update Profile         | `PATCH`  | `/users/v1/profile`                  | Update bio, social links, username & headline  |
| Upload Avatar          | `POST`   | `/users/v1/profile/avatar`           | Multipart upload avatar to Cloudflare R2 / S3  |
| Delete Avatar          | `DELETE` | `/users/v1/profile/avatar`           | Remove profile avatar and purge object         |
| Upload Resume          | `POST`   | `/users/v1/profile/resume`           | Multipart upload user resume (PDF/DOCX)        |
| Delete Resume          | `DELETE` | `/users/v1/profile/resume`           | Delete user resume document                    |
| Change Password        | `PATCH`  | `/users/v1/change-password`          | Change account password with verification      |
| Update Subscription    | `PATCH`  | `/users/v1/subscription`             | Toggle newsletter subscription status          |
| Delete Account         | `DELETE` | `/users/v1/account`                  | Permanently delete account and purge data      |
| Admin List Users       | `GET`    | `/users/v1/admin/users`              | Paginated user management list with filters    |
| Admin Update Role      | `PATCH`  | `/users/v1/admin/users/:id/role`     | Update user RBAC role (ADMIN, MODERATOR, USER) |
| Admin Delete User      | `DELETE` | `/users/v1/admin/users/:id`          | Administrative permanent account deletion      |

### 3. Blog Module (`/blogs/v1/*`) — 26 Endpoints

| Category | Method   | Route                                   | Description                                     |
| :------- | :------- | :-------------------------------------- | :---------------------------------------------- |
| Public   | `GET`    | `/blogs/v1/public`                      | Paginated list of published articles            |
| Public   | `GET`    | `/blogs/v1/public/featured`             | Top featured editorial articles                 |
| Public   | `GET`    | `/blogs/v1/public/categories`           | Categories list with published post counts      |
| Public   | `GET`    | `/blogs/v1/public/tags`                 | Tags list with published post counts            |
| Public   | `GET`    | `/blogs/v1/public/rss-feed`             | Structured payload for RSS feed & sitemaps      |
| Public   | `GET`    | `/blogs/v1/public/slug/:slug`           | Article details with breadcrumbs & JSON-LD      |
| Public   | `GET`    | `/blogs/v1/public/slug/:slug/reactions` | Aggregated reactions count & user state         |
| Public   | `POST`   | `/blogs/v1/public/slug/:slug/react`     | Add or toggle reaction on post                  |
| Admin    | `GET`    | `/blogs/v1/admin/stats`                 | Aggregated KPI stats (views, likes, posts)      |
| Admin    | `GET`    | `/blogs/v1/admin/posts`                 | Paginated admin articles table with filters     |
| Admin    | `POST`   | `/blogs/v1/admin/posts`                 | Create a new blog post                          |
| Admin    | `POST`   | `/blogs/v1/admin/posts/bulk-status`     | Bulk update status (DRAFT, PUBLISHED, ARCHIVED) |
| Admin    | `POST`   | `/blogs/v1/admin/posts/bulk-delete`     | Bulk delete multiple articles                   |
| Admin    | `POST`   | `/blogs/v1/admin/posts/seo-preview`     | Real-time SERP preview & SEO score analysis     |
| Admin    | `POST`   | `/blogs/v1/admin/seed-local`            | Sync local JSON repository posts to database    |
| Admin    | `GET`    | `/blogs/v1/admin/posts/:id`             | Get full post details by ID                     |
| Admin    | `PATCH`  | `/blogs/v1/admin/posts/:id`             | Update post content, SEO metadata & status      |
| Admin    | `DELETE` | `/blogs/v1/admin/posts/:id`             | Delete article and related associations         |
| Admin    | `POST`   | `/blogs/v1/admin/posts/:id/duplicate`   | Clone post into draft copy                      |
| Admin    | `GET`    | `/blogs/v1/admin/categories`            | List all blog categories                        |
| Admin    | `POST`   | `/blogs/v1/admin/categories`            | Create blog category                            |
| Admin    | `PATCH`  | `/blogs/v1/admin/categories/:id`        | Update category name, color or description      |
| Admin    | `DELETE` | `/blogs/v1/admin/categories/:id`        | Delete category                                 |
| Admin    | `GET`    | `/blogs/v1/admin/tags`                  | List all blog tags                              |
| Admin    | `POST`   | `/blogs/v1/admin/tags`                  | Create blog tag                                 |
| Admin    | `DELETE` | `/blogs/v1/admin/tags/:id`              | Delete blog tag                                 |

### 4. Booking Module (`/booking/v1/*`) — 14 Endpoints

| Category | Method | Route                                 | Description                                      |
| :------- | :----- | :------------------------------------ | :----------------------------------------------- |
| Public   | `GET`  | `/booking/v1/slots`                   | Available meeting slots by date & timezone       |
| Public   | `GET`  | `/booking/v1/details`                 | Booking details by secret token                  |
| Public   | `GET`  | `/booking/v1/ics`                     | Download .ics calendar invite by token           |
| Public   | `POST` | `/booking/v1/book`                    | Reserve meeting slot & trigger calendar event    |
| Public   | `POST` | `/booking/v1/cancel`                  | Cancel booking using secret token                |
| Public   | `GET`  | `/booking/v1/google/callback`         | Google Calendar OAuth callback handler           |
| Admin    | `GET`  | `/booking/v1/admin/list`              | Filterable list of all bookings                  |
| Admin    | `GET`  | `/booking/v1/admin/stats`             | Booking statistics and upcoming schedule metrics |
| Admin    | `GET`  | `/booking/v1/admin/availability`      | Weekly working hours & availability windows      |
| Admin    | `PUT`  | `/booking/v1/admin/availability`      | Update working hours, buffers & days off         |
| Admin    | `POST` | `/booking/v1/admin/:id/cancel`        | Admin cancellation with custom reason            |
| Admin    | `GET`  | `/booking/v1/admin/google/auth`       | Retrieve Google Calendar OAuth consent link      |
| Admin    | `GET`  | `/booking/v1/admin/google/status`     | Current Google Calendar integration sync status  |
| Admin    | `POST` | `/booking/v1/admin/google/disconnect` | Disconnect Google Calendar OAuth integration     |

### 5. CaseStudy Module (`/case-studies/v1/*`) — 15 Endpoints

| Category | Method   | Route                                      | Description                                  |
| :------- | :------- | :----------------------------------------- | :------------------------------------------- |
| Public   | `GET`    | `/case-studies/v1/public`                  | Published architectural case studies         |
| Public   | `GET`    | `/case-studies/v1/public/featured`         | Featured case studies list                   |
| Public   | `GET`    | `/case-studies/v1/public/slug/:slug`       | Case study by slug with tech stack breakdown |
| Public   | `POST`   | `/case-studies/v1/public/slug/:slug/react` | Add reaction to case study                   |
| Admin    | `GET`    | `/case-studies/v1/admin/stats`             | Aggregated case study metrics                |
| Admin    | `GET`    | `/case-studies/v1/admin/list`              | Admin searchable case studies table          |
| Admin    | `POST`   | `/case-studies/v1/admin/create`            | Create new architecture case study           |
| Admin    | `POST`   | `/case-studies/v1/admin/bulk-status`       | Bulk update status (DRAFT, PUBLISHED)        |
| Admin    | `POST`   | `/case-studies/v1/admin/bulk-delete`       | Bulk delete case studies                     |
| Admin    | `POST`   | `/case-studies/v1/admin/reorder`           | Reorder display priority sequence            |
| Admin    | `POST`   | `/case-studies/v1/admin/seed-local`        | Sync local repository case study JSON to DB  |
| Admin    | `GET`    | `/case-studies/v1/admin/:id`               | Get case study by ID                         |
| Admin    | `PATCH`  | `/case-studies/v1/admin/:id`               | Update case study details, stack & metrics   |
| Admin    | `DELETE` | `/case-studies/v1/admin/:id`               | Delete case study                            |
| Admin    | `POST`   | `/case-studies/v1/admin/:id/duplicate`     | Clone case study                             |

### 6. Comment Module (`/comments/v1/*`) — 15 Endpoints

| Category | Method   | Route                                     | Description                                  |
| :------- | :------- | :---------------------------------------- | :------------------------------------------- |
| Public   | `GET`    | `/comments/v1/public/post/:slug`          | Get threaded comments for blog post          |
| Public   | `POST`   | `/comments/v1/public/post/:slug`          | Create comment or reply to existing comment  |
| Public   | `POST`   | `/comments/v1/public/:id/react`           | Toggle like/upvote reaction on comment       |
| Public   | `POST`   | `/comments/v1/public/:id/report`          | Flag comment for moderation review           |
| Public   | `DELETE` | `/comments/v1/public/:id`                 | Author self-deletion of comment              |
| Admin    | `GET`    | `/comments/v1/admin/stats`                | Moderation queue counts & spam analytics     |
| Admin    | `GET`    | `/comments/v1/admin/comments`             | Paginated searchable comments list           |
| Admin    | `GET`    | `/comments/v1/admin/comments/:id`         | Get comment details with report history      |
| Admin    | `PATCH`  | `/comments/v1/admin/comments/:id/status`  | Update status (APPROVED, SPAM, HIDDEN) & pin |
| Admin    | `DELETE` | `/comments/v1/admin/comments/:id`         | Permanent admin comment deletion             |
| Admin    | `POST`   | `/comments/v1/admin/comments/bulk-status` | Bulk status update                           |
| Admin    | `POST`   | `/comments/v1/admin/comments/bulk-delete` | Bulk delete comments                         |
| Admin    | `GET`    | `/comments/v1/admin/reports`              | Moderation report review queue               |
| Admin    | `PATCH`  | `/comments/v1/admin/reports/:id`          | Resolve report with moderator action         |
| Admin    | `DELETE` | `/comments/v1/admin/reports/:id`          | Delete dismissed report record               |

### 7. Contact Module (`/contact/v1/*`) — 1 Endpoint

| Method | Route              | Description                                       |
| :----- | :----------------- | :------------------------------------------------ |
| `POST` | `/contact/v1/send` | Submit contact form inquiry (rate limited per IP) |

### 8. Experience Module (`/experiences/v1/*`) — 12 Endpoints

| Category | Method   | Route                                 | Description                                    |
| :------- | :------- | :------------------------------------ | :--------------------------------------------- |
| Public   | `GET`    | `/experiences/v1/public`              | Published professional experiences list        |
| Admin    | `GET`    | `/experiences/v1/admin/stats`         | Experience overview KPI counters               |
| Admin    | `GET`    | `/experiences/v1/admin/list`          | Admin filterable experiences table             |
| Admin    | `POST`   | `/experiences/v1/admin/create`        | Create new career experience entry             |
| Admin    | `POST`   | `/experiences/v1/admin/bulk-status`   | Bulk update status (PUBLISHED, DRAFT)          |
| Admin    | `POST`   | `/experiences/v1/admin/bulk-delete`   | Bulk delete experience entries                 |
| Admin    | `POST`   | `/experiences/v1/admin/reorder`       | Update chronological sort orders               |
| Admin    | `POST`   | `/experiences/v1/admin/seed-default`  | Re-seed default experiences from repository    |
| Admin    | `GET`    | `/experiences/v1/admin/:id`           | Get single experience by ID                    |
| Admin    | `PATCH`  | `/experiences/v1/admin/:id`           | Update company, role, dates, tech & highlights |
| Admin    | `DELETE` | `/experiences/v1/admin/:id`           | Delete experience record                       |
| Admin    | `POST`   | `/experiences/v1/admin/:id/duplicate` | Clone experience entry                         |

### 9. Media Module (`/media/v1/*`) — 15 Endpoints

| Category | Method   | Route                         | Description                                       |
| :------- | :------- | :---------------------------- | :------------------------------------------------ |
| Upload   | `POST`   | `/media/v1/upload`            | Multipart form server-side upload to R2/S3        |
| Upload   | `POST`   | `/media/v1/presigned-url`     | Generate direct client-to-R2 presigned upload URL |
| Upload   | `POST`   | `/media/v1/confirm-presigned` | Confirm & register presigned upload in database   |
| Assets   | `GET`    | `/media/v1/stats`             | Storage metrics, bucket usage & distribution      |
| Assets   | `GET`    | `/media/v1/files`             | Paginated media library with tag & folder filter  |
| Assets   | `POST`   | `/media/v1/files/bulk-delete` | Bulk purge media assets from storage & database   |
| Assets   | `POST`   | `/media/v1/files/bulk-update` | Bulk move folder or update tags                   |
| Assets   | `GET`    | `/media/v1/files/:id`         | Get media asset metadata by ID                    |
| Assets   | `PATCH`  | `/media/v1/files/:id`         | Update asset title, alt text, folder & tags       |
| Assets   | `DELETE` | `/media/v1/files/:id`         | Delete single media asset                         |
| Assets   | `GET`    | `/media/v1/download/:id`      | Secure temporary download URL redirect            |
| Assets   | `GET`    | `/media/v1/by-key`            | Lookup media record by query parameter `key`      |
| Assets   | `GET`    | `/media/v1/key/*key`          | Lookup media record by path wildcard `key`        |
| Stream   | `GET`    | `/media/v1/stream/*key`       | Stream public media asset from S3 storage         |
| Purge    | `POST`   | `/media/v1/cleanup`           | Purge unreferenced orphan objects from storage    |

### 10. Newsletter Module (`/newsletter/v1/*`) — 15 Endpoints

| Action          | Method   | Route                                 | Description                                         |
| :-------------- | :------- | :------------------------------------ | :-------------------------------------------------- |
| Stats           | `GET`    | `/newsletter/v1/stats`                | Deliverability rates, subscriber reach & open KPIs  |
| Preview Reach   | `POST`   | `/newsletter/v1/calculate-recipients` | Live recipient count resolver by audience segment   |
| Spam Check      | `POST`   | `/newsletter/v1/spam-check`           | Real-time spam trigger audit & deliverability score |
| Send Test       | `POST`   | `/newsletter/v1/send-test`            | Dispatch test broadcast to review inboxes           |
| List Campaigns  | `GET`    | `/newsletter/v1/`                     | Paginated campaigns list with status filter         |
| Create Campaign | `POST`   | `/newsletter/v1/`                     | Draft new newsletter broadcast campaign             |
| Get Campaign    | `GET`    | `/newsletter/v1/:id`                  | Get campaign details with spam audit report         |
| Update Campaign | `PATCH`  | `/newsletter/v1/:id`                  | Update subject, body, segment & schedule date       |
| Delete Campaign | `DELETE` | `/newsletter/v1/:id`                  | Delete campaign record                              |
| Duplicate       | `POST`   | `/newsletter/v1/:id/duplicate`        | Clone campaign to draft                             |
| Send Now        | `POST`   | `/newsletter/v1/:id/send`             | Broadcast newsletter immediately                    |
| Schedule        | `POST`   | `/newsletter/v1/:id/schedule`         | Schedule newsletter for future automated send       |
| Cancel Send     | `POST`   | `/newsletter/v1/:id/cancel`           | Cancel scheduled or queued delivery                 |
| Sync Plunk      | `POST`   | `/newsletter/v1/:id/sync`             | Sync campaign delivery analytics with Plunk         |
| Delivery Logs   | `GET`    | `/newsletter/v1/:id/logs`             | Inspect recipient delivery events & errors          |

### 11. Redirect Module (`/redirects/v1/*`) — 7 Endpoints

| Category | Method   | Route                             | Description                                        |
| :------- | :------- | :-------------------------------- | :------------------------------------------------- |
| Public   | `GET`    | `/redirects/v1/resolve`           | Edge resolution of path/vanity link to target URL  |
| Admin    | `GET`    | `/redirects/v1/admin/stats`       | Redirect hit counters and top accessed routes      |
| Admin    | `GET`    | `/redirects/v1/admin`             | Paginated redirects list with search & filter      |
| Admin    | `POST`   | `/redirects/v1/admin`             | Create 301/302/307/308 redirect rule               |
| Admin    | `PATCH`  | `/redirects/v1/admin/:id`         | Update redirect source, destination or status code |
| Admin    | `DELETE` | `/redirects/v1/admin/:id`         | Delete redirect rule                               |
| Admin    | `POST`   | `/redirects/v1/admin/bulk-delete` | Bulk delete redirect rules                         |

### 12. Resume Module (`/resume/v1/*`) — 9 Endpoints

| Category | Method   | Route                            | Description                                        |
| :------- | :------- | :------------------------------- | :------------------------------------------------- |
| Public   | `GET`    | `/resume/v1/public/active`       | Get active resume metadata and download link       |
| Public   | `GET`    | `/resume/v1/public/download`     | Track analytics & download current active resume   |
| Public   | `GET`    | `/resume/v1/public/:id/download` | Track analytics & download specific resume version |
| Admin    | `GET`    | `/resume/v1/admin`               | List all uploaded resume versions                  |
| Admin    | `POST`   | `/resume/v1/admin`               | Upload and register a new resume document          |
| Admin    | `GET`    | `/resume/v1/admin/:id`           | Get resume version details and metrics             |
| Admin    | `PATCH`  | `/resume/v1/admin/:id`           | Update resume label, version tag, or notes         |
| Admin    | `PATCH`  | `/resume/v1/admin/:id/activate`  | Promote version to globally active resume          |
| Admin    | `DELETE` | `/resume/v1/admin/:id`           | Delete version and purge document from storage     |

### 13. Skill Module (`/skills/v1/*`) — 18 Endpoints

| Category | Method   | Route                                 | Description                                             |
| :------- | :------- | :------------------------------------ | :------------------------------------------------------ |
| Public   | `GET`    | `/skills/v1/public`                   | Grouped skills by category for portfolio display        |
| Admin    | `GET`    | `/skills/v1/admin/stats`              | Skill inventory counts and category metrics             |
| Admin    | `GET`    | `/skills/v1/admin/list`               | Filterable skills list with proficiency ratings         |
| Admin    | `POST`   | `/skills/v1/admin/create`             | Create new technical skill record                       |
| Admin    | `POST`   | `/skills/v1/admin/bulk-status`        | Bulk update status (PUBLISHED, HIDDEN)                  |
| Admin    | `POST`   | `/skills/v1/admin/bulk-delete`        | Bulk delete skills                                      |
| Admin    | `POST`   | `/skills/v1/admin/reorder`            | Update visual ordering sequence                         |
| Admin    | `POST`   | `/skills/v1/admin/seed-default`       | Re-seed default tech stack & skills                     |
| Admin    | `GET`    | `/skills/v1/admin/categories`         | List skill categories                                   |
| Admin    | `POST`   | `/skills/v1/admin/categories`         | Create skill category                                   |
| Admin    | `POST`   | `/skills/v1/admin/categories/reorder` | Reorder category display hierarchy                      |
| Admin    | `GET`    | `/skills/v1/admin/categories/:id`     | Get skill category by ID                                |
| Admin    | `PATCH`  | `/skills/v1/admin/categories/:id`     | Update category name, slug or icon                      |
| Admin    | `DELETE` | `/skills/v1/admin/categories/:id`     | Delete category and reassign items                      |
| Admin    | `GET`    | `/skills/v1/admin/:id`                | Get single skill by ID                                  |
| Admin    | `PATCH`  | `/skills/v1/admin/:id`                | Update skill proficiency, category & highlighted status |
| Admin    | `DELETE` | `/skills/v1/admin/:id`                | Delete skill                                            |
| Admin    | `POST`   | `/skills/v1/admin/:id/duplicate`      | Clone skill entry                                       |

### 14. Subscriber Module (`/subscriber/v1/*`) — 14 Endpoints

| Category | Method   | Route                              | Description                                      |
| :------- | :------- | :--------------------------------- | :----------------------------------------------- |
| Public   | `POST`   | `/subscriber/v1/subscribe`         | Subscribe email address to newsletter            |
| Public   | `POST`   | `/subscriber/v1/unsubscribe`       | Unsubscribe by email address in JSON body        |
| Public   | `GET`    | `/subscriber/v1/unsubscribe`       | 1-Click unsubscribe from secret email link token |
| Public   | `POST`   | `/subscriber/v1/change-email`      | Update subscriber email with verification        |
| Admin    | `GET`    | `/subscriber/v1/list`              | Searchable subscribers table with status filters |
| Admin    | `GET`    | `/subscriber/v1/admin/stats`       | Churn rate, active counts & source breakdown     |
| Admin    | `POST`   | `/subscriber/v1/admin/create`      | Manually register a subscriber                   |
| Admin    | `POST`   | `/subscriber/v1/admin/bulk-status` | Bulk update status (subscribed, unsubscribed)    |
| Admin    | `POST`   | `/subscriber/v1/admin/bulk-delete` | Bulk delete subscriber records                   |
| Admin    | `POST`   | `/subscriber/v1/admin/:id/resend`  | Resend onboarding welcome email                  |
| Admin    | `GET`    | `/subscriber/v1/admin/export`      | Export subscriber dataset (CSV/JSON)             |
| Admin    | `GET`    | `/subscriber/v1/:id`               | Get subscriber profile details & history         |
| Admin    | `PATCH`  | `/subscriber/v1/:id`               | Update subscriber preferences or tags            |
| Admin    | `DELETE` | `/subscriber/v1/:id`               | Permanently remove subscriber                    |

### 15. Template Module (`/templates/v1/*`) — 13 Endpoints

| Category   | Method   | Route                         | Description                                   |
| :--------- | :------- | :---------------------------- | :-------------------------------------------- |
| Discovery  | `GET`    | `/templates/v1/stats`         | Summary counts of local & synced templates    |
| Discovery  | `GET`    | `/templates/v1/remote`        | Fetch remote templates directly from Plunk    |
| Sync       | `POST`   | `/templates/v1/sync`          | Sync all codebase templates to remote Plunk   |
| Preview    | `POST`   | `/templates/v1/preview`       | Live Liquid variable interpolation preview    |
| Test Email | `POST`   | `/templates/v1/send-test`     | Dispatch test email rendered with sample data |
| CRUD       | `GET`    | `/templates/v1/`              | List all templates with sync statuses         |
| CRUD       | `POST`   | `/templates/v1/`              | Create a custom email template                |
| Action     | `POST`   | `/templates/v1/:id/duplicate` | Clone template                                |
| Action     | `POST`   | `/templates/v1/:id/reset`     | Reset template content to default seed        |
| Sync       | `POST`   | `/templates/v1/:id/sync`      | Sync single template to Plunk                 |
| CRUD       | `GET`    | `/templates/v1/:idOrSlug`     | Retrieve template by ID or slug               |
| CRUD       | `PATCH`  | `/templates/v1/:id`           | Update subject, body, variables & description |
| CRUD       | `DELETE` | `/templates/v1/:id`           | Delete email template                         |

### 16. System Service — 1 Endpoint

| Method | Route     | Description                                            |
| :----- | :-------- | :----------------------------------------------------- |
| `GET`  | `/health` | Application health check, database ping & cache status |
