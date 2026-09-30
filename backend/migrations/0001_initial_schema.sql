-- ==============================================================================
-- 0001_initial_schema.sql - Cloudflare D1 Relational Schema
-- ==============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT UNIQUE,
  tier TEXT NOT NULL DEFAULT 'normal', -- 'normal' | 'paid'
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Resumes Table (Permanent Immutable Storage)
CREATE TABLE IF NOT EXISTS resumes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_filename TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  extracted_text TEXT,
  parsed_data_json TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 3. Generation Jobs Table (Queue Tracking & State Machine)
CREATE TABLE IF NOT EXISTS generation_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resume_id TEXT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL DEFAULT 'generate_portfolio',
  status TEXT NOT NULL DEFAULT 'queued', -- 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
  stage TEXT NOT NULL DEFAULT 'queued',   -- 'queued' | 'extracting' | 'analyzing' | 'generating' | 'validating' | 'publishing' | 'completed' | 'failed'
  priority INTEGER NOT NULL DEFAULT 5,   -- 1 = high/paid, 5 = normal, 10 = low
  attempts INTEGER NOT NULL DEFAULT 0,
  progress INTEGER NOT NULL DEFAULT 0,   -- 0 to 100
  error_code TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  started_at TEXT,
  completed_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 4. Portfolios Table
CREATE TABLE IF NOT EXISTS portfolios (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_version_id TEXT,
  slug TEXT NOT NULL UNIQUE,
  published INTEGER NOT NULL DEFAULT 1, -- 1 = true, 0 = false
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 5. Portfolio Versions Table (Permanent Historical Retention)
CREATE TABLE IF NOT EXISTS portfolio_versions (
  id TEXT PRIMARY KEY,
  portfolio_id TEXT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  resume_id TEXT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  portfolio_data_json TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'minimal',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 6. Assets Table
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  portfolio_id TEXT REFERENCES portfolios(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- 'resume' | 'avatar' | 'project' | 'asset'
  r2_key TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 7. Domains Table
CREATE TABLE IF NOT EXISTS domains (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  portfolio_id TEXT NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'verified' | 'active' | 'failed'
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for high-concurrency read/write operations
CREATE INDEX IF NOT EXISTS idx_resumes_user ON resumes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_user_status ON generation_jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_jobs_status_priority ON generation_jobs(status, priority ASC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_portfolios_user ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON portfolios(slug);
CREATE INDEX IF NOT EXISTS idx_versions_portfolio ON portfolio_versions(portfolio_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_assets_user ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_domains_domain ON domains(domain);
