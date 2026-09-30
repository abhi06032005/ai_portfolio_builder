# AI Resume-to-Portfolio SaaS Backend

Production-ready, Cloudflare-first asynchronous backend built for high-concurrency resume processing, permanent data preservation, and instant edge-cached portfolio delivery.

---

## 🏗️ Architecture & Technology Stack

- **API & Background Compute:** Cloudflare Workers (TypeScript + [Hono](https://hono.dev))
- **Asynchronous Queue:** Cloudflare Queues (`portfolio-generation-queue`) with controlled concurrency buffer (`AI_MAX_CONCURRENCY=5`)
- **Primary Database:** Cloudflare D1 (Serverless SQLite at the edge with ACID transactions)
- **Permanent Storage:** Cloudflare R2 (`portfolio-maker-storage`) — original resumes and assets are **100% immutable** and permanently retained
- **Caching & Public CDN:** Cloudflare Cache API & Edge KV for instant public portfolio loading (Zero-AI, Zero-Queue on public visits)
- **AI Layer:** Resilient multi-provider abstraction (`OpenAIProvider`, `GeminiProvider`, `GroqProvider`) with automated transient fallback

---

## ⚡ Core Product Flow

```
User (Browser/Client)
       │
       ▼  (POST /api/resumes - multipart/form-data)
┌──────────────────────────────────────────────────────────┐
│ API Worker                                               │
│  1. Authenticate user & check rate limits (max 2 active) │
│  2. Validate file (PDF, DOCX, TXT <= 10MB)               │
│  3. Save original file permanently to Cloudflare R2      │
│  4. Insert resume & generation_job records into D1       │
│  5. Publish message to Cloudflare Queue                  │
│  6. Return HTTP 202 { resumeId, jobId, status: "queued" }│
└──────────────────────────────────────────────────────────┘
       │  (Returns in < 50ms - NEVER waits for AI!)
       ▼
Cloudflare Queue (Buffer for high-traffic spikes)
       │
       ▼  (Controlled Concurrency: AI_MAX_CONCURRENCY=5)
┌──────────────────────────────────────────────────────────┐
│ Background Queue Consumer Worker                         │
│  Stage 1: Text extraction (unpdf / mammoth)              │
│  Stage 2: AI structured JSON parsing -> saved in D1      │
│  Stage 3: AI portfolio copywriting & layout generation   │
│  Stage 4: Strict JSON schema validation & repair         │
│  Stage 5: D1 ACID transaction (Portfolio & Version)      │
│  Stage 6: Mark job completed (progress: 100%)            │
└──────────────────────────────────────────────────────────┘
```

---

## 📁 Modular Directory Structure

```
backend/
├── migrations/
│   └── 0001_initial_schema.sql     # D1 relational schema (7 tables + indexes)
├── src/
│   ├── api/
│   │   ├── resumes.ts              # Resume upload & generation trigger
│   │   ├── jobs.ts                 # Job polling (status, stage, progress 0-100%)
│   │   ├── portfolios.ts           # User portfolio & edge-cached public route
│   │   ├── assets.ts               # R2 asset uploads (avatars, screenshots)
│   │   ├── domains.ts              # Custom domain configuration
│   │   └── router.ts               # Route composition & auth guards
│   ├── auth/
│   │   └── middleware.ts           # JWT authentication & auto-provisioning
│   ├── db/
│   │   ├── client.ts               # D1 queries & atomic batch transactions
│   │   └── schema.ts               # TypeScript D1 schema typings
│   ├── queue/
│   │   ├── producer/index.ts       # Cloudflare Queue job dispatcher
│   │   └── consumer/index.ts       # Asynchronous staged pipeline consumer
│   ├── ai/
│   │   ├── provider.ts             # AIProvider interface
│   │   ├── openai.ts               # OpenAI GPT-4o-mini implementation
│   │   ├── gemini.ts               # Google Gemini 1.5 Flash implementation
│   │   ├── groq.ts                 # Groq Llama 3.3 70B implementation
│   │   └── index.ts                # Resilient fallback orchestrator
│   ├── resume/
│   │   ├── extraction.ts           # Web-native PDF (unpdf) & DOCX (mammoth)
│   │   ├── parser.ts               # Resume parsing & D1 persistence
│   │   └── schema.ts               # Strict Zod schema for structured resumes
│   ├── portfolio/
│   │   ├── generator.ts            # Staged portfolio generation & D1 persistence
│   │   ├── validator.ts            # Structured JSON repair & Zod validation
│   │   └── renderer.ts             # Server-side HTML renderer with modern themes
│   ├── storage/
│   │   └── r2.ts                   # Immutable R2 permanent storage service
│   ├── rate-limit/
│   │   └── limiter.ts              # Per-user active job & hourly rate limiter
│   ├── jobs/
│   │   └── tracker.ts              # Stage transitions & progress tracking
│   ├── utils/
│   │   ├── logger.ts               # Observability & structured JSON logging
│   │   └── response.ts             # Standardized HTTP response helpers
│   ├── types/
│   │   ├── env.ts                  # Cloudflare Worker bindings (D1, R2, Queues)
│   │   ├── resume.ts               # Zod resume models
│   │   └── portfolio.ts            # Zod portfolio models
│   └── index.ts                    # Worker entrypoint (fetch + queue exports)
├── wrangler.toml                   # Cloudflare infrastructure configuration
└── package.json
```

---

## 🔒 Permanent Data Retention (Section 3)

The system **never** automatically deletes or overwrites user data upon job completion:
- Original resume files are immutable in R2: `resumes/{userId}/{resumeId}/original.pdf`.
- Extracted raw text and normalized JSON are permanently stored in D1.
- Portfolio history is versioned in `portfolio_versions` with monotonic version numbers.
- Switching themes (`POST /api/portfolio/:id/theme`) creates a new version from existing data with **zero LLM calls** (Section 12).

---

## 🚀 Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Apply Local D1 Database Migrations
```bash
npx wrangler d1 migrations apply portfolio_maker --local
```

### 3. Configure Secrets (in `.dev.vars`)
Create a `.dev.vars` file in `backend/`:
```ini
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
GROQ_API_KEY=gsk_...
CLERK_SECRET_KEY=sk_test_...
```

### 4. Run Locally
```bash
npx wrangler dev
```

---

## 📡 API Reference

### 1. Upload Resume
```http
POST /api/resumes
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data

file: <resume.pdf>
theme: modern
```
**Response (HTTP 202 Accepted - Immediate):**
```json
{
  "resumeId": "resume_9f8d1e2a",
  "jobId": "job_3c7b5a1f",
  "status": "queued",
  "message": "Resume uploaded successfully. Generation is processing asynchronously in the background."
}
```

### 2. Poll Job Progress
```http
GET /api/jobs/job_3c7b5a1f
Authorization: Bearer <jwt-token>
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "job_3c7b5a1f",
    "resumeId": "resume_9f8d1e2a",
    "status": "processing",
    "stage": "generating",
    "progress": 65,
    "attempts": 1,
    "errorCode": null,
    "createdAt": "2026-09-30T00:00:00Z"
  }
}
```

### 3. View Public Portfolio (Edge-Cached, Zero AI, Zero Queue)
```http
GET /api/portfolio/john-doe
Accept: text/html
```
Or directly via vanity URL:
```http
GET /john-doe
```
Returns ultra-fast server-rendered modern HTML with `Cache-Control: public, max-age=3600, s-maxage=86400`.

### 4. Switch Theme (Zero LLM Calls)
```http
POST /api/portfolio/portfolio_123/theme
Authorization: Bearer <jwt-token>
Content-Type: application/json

{ "theme": "dark" }
```

### 5. Upload Assets
```http
POST /api/assets/upload
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data

file: <avatar.jpg>
type: avatar
```

---

## 🚢 Production Deployment

```bash
# 1. Create Cloudflare Resources
npx wrangler d1 create portfolio-maker-d1
npx wrangler r2 bucket create portfolio-maker-storage
npx wrangler queues create portfolio-generation-queue
npx wrangler queues create portfolio-generation-dlq

# 2. Apply Migrations to Remote D1
npx wrangler d1 migrations apply portfolio_maker --remote

# 3. Set API Secrets
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put GEMINI_API_KEY

# 4. Deploy to Cloudflare Workers
npx wrangler deploy
```
