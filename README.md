# PortfolioCraft – AI Portfolio Generator

Turn your resume into a live, deployed portfolio website in seconds.

- **Frontend**: React 18 + Vite + TypeScript + Vanilla CSS (Aeline 3D design system)
- **Auth**: Clerk Authentication (`@clerk/clerk-react` & `@clerk/backend`)
- **Database**: Neon DB PostgreSQL
- **ORM**: Prisma ORM v6
- **AI Extraction**: OpenAI GPT-4o-mini
- **Deploy**: 1-Click GitHub Pages via Octokit REST API

---

## Architecture & Features

1. **Resume Ingestion & Raw Text Storage**:
   - Accepts PDF or DOCX files.
   - Text parsed via `mammoth` and `pdf-parse`.
   - **Both raw resume text and extracted contact email** are persisted to Neon DB in the `resumes` table along with the full structured JSON.

2. **LLM Extraction**:
   - Structured JSON generation matching canonical schema (`name`, `headline`, `about`, `skills`, `experience`, `projects`, `education`, `links`).

3. **Manageable Clerk Auth**:
   - Seamless `<ClerkProvider>` setup on frontend.
   - Session tokens passed via `Authorization: Bearer <token>`.
   - Auto-provisions and syncs user records in PostgreSQL.

4. **Template System**:
   - Multi-template architecture (Minimal, Modern, Terminal).
   - Generates static site files (`index.html`, `data.json`, CSS assets).
   - Instant isolated preview URL (`/preview/:token`).
   - One-click public GitHub Pages repository creation and deployment.

---

## Quick Start

### 1. Database & Prisma Setup (Neon DB)

In `backend/.env`:
```env
DATABASE_URL="postgresql://neondb_owner:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"
CLERK_SECRET_KEY="sk_test_..."
CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."
OPENAI_API_KEY="sk-..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

Generate Prisma client and push schema to Neon DB:
```bash
cd backend
npx prisma generate
npx prisma db push
npm run dev
```

Backend API runs at `http://localhost:3001`.

### 2. Frontend Setup (React + Vite)

In `frontend/.env`:
```env
VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
```

Run Vite development server:
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000` with automatic `/api` proxy to the backend.

---

## Database Schema (Prisma)

- **`User`**: `id`, `clerkId`, `email`, `githubToken`, `resumes`, `portfolios`
- **`Resume`**: `id`, `userId`, `originalFilename`, `filePath`, `email`, `rawText`, `parsedData` (JSON)
- **`Portfolio`**: `id`, `userId`, `resumeId`, `templateId`, `data` (JSON), `previewToken`, `githubRepo`, `status` (`DRAFT`, `PREVIEW`, `DEPLOYED`)
