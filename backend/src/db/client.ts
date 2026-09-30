import { Env } from '../types/env';

export interface DbUser {
  id: string;
  email: string;
  username: string | null;
  tier: string;
  created_at: string;
  updated_at: string;
}

export interface DbResume {
  id: string;
  user_id: string;
  original_filename: string;
  storage_key: string;
  mime_type: string;
  file_size: number;
  extracted_text: string | null;
  parsed_data_json: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface DbGenerationJob {
  id: string;
  user_id: string;
  resume_id: string;
  job_type: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  stage: string;
  priority: number;
  attempts: number;
  progress: number;
  error_code: string | null;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string;
}

export interface DbPortfolio {
  id: string;
  user_id: string;
  current_version_id: string | null;
  slug: string;
  published: number;
  created_at: string;
  updated_at: string;
}

export interface DbPortfolioVersion {
  id: string;
  portfolio_id: string;
  resume_id: string;
  version_number: number;
  portfolio_data_json: string;
  theme: string;
  created_at: string;
}

export class DbService {
  constructor(private db: D1Database) {}

  // ── RESUMES ─────────────────────────────────────────────────────────────
  async createResume(data: {
    id: string;
    userId: string;
    originalFilename: string;
    storageKey: string;
    mimeType: string;
    fileSize: number;
  }): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO resumes (id, user_id, original_filename, storage_key, mime_type, file_size, version, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))`,
      )
      .bind(data.id, data.userId, data.originalFilename, data.storageKey, data.mimeType, data.fileSize)
      .run();
  }

  async getResume(id: string, userId?: string): Promise<DbResume | null> {
    const query = userId
      ? 'SELECT * FROM resumes WHERE id = ? AND user_id = ? LIMIT 1'
      : 'SELECT * FROM resumes WHERE id = ? LIMIT 1';
    const stmt = userId ? this.db.prepare(query).bind(id, userId) : this.db.prepare(query).bind(id);
    return await stmt.first<DbResume>();
  }

  async updateResumeExtraction(id: string, extractedText: string, parsedDataJson: string): Promise<void> {
    await this.db
      .prepare(
        `UPDATE resumes SET extracted_text = ?, parsed_data_json = ?, updated_at = datetime('now') WHERE id = ?`,
      )
      .bind(extractedText, parsedDataJson, id)
      .run();
  }

  async listResumes(userId: string): Promise<DbResume[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM resumes WHERE user_id = ? ORDER BY created_at DESC')
      .bind(userId)
      .all<DbResume>();
    return results || [];
  }

  // ── JOBS ────────────────────────────────────────────────────────────────
  async createJob(data: {
    id: string;
    userId: string;
    resumeId: string;
    priority?: number;
    jobType?: string;
  }): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO generation_jobs (id, user_id, resume_id, job_type, status, stage, priority, attempts, progress, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'queued', 'queued', ?, 0, 0, datetime('now'), datetime('now'))`,
      )
      .bind(data.id, data.userId, data.resumeId, data.jobType || 'generate_portfolio', data.priority ?? 5)
      .run();
  }

  async getJob(id: string, userId?: string): Promise<DbGenerationJob | null> {
    const query = userId
      ? 'SELECT * FROM generation_jobs WHERE id = ? AND user_id = ? LIMIT 1'
      : 'SELECT * FROM generation_jobs WHERE id = ? LIMIT 1';
    const stmt = userId ? this.db.prepare(query).bind(id, userId) : this.db.prepare(query).bind(id);
    return await stmt.first<DbGenerationJob>();
  }

  async updateJobProgress(id: string, stage: string, progress: number, started = false): Promise<void> {
    if (started) {
      await this.db
        .prepare(
          `UPDATE generation_jobs 
           SET status = 'processing', stage = ?, progress = ?, started_at = COALESCE(started_at, datetime('now')), updated_at = datetime('now')
           WHERE id = ?`,
        )
        .bind(stage, progress, id)
        .run();
    } else {
      await this.db
        .prepare(
          `UPDATE generation_jobs 
           SET stage = ?, progress = ?, updated_at = datetime('now')
           WHERE id = ?`,
        )
        .bind(stage, progress, id)
        .run();
    }
  }

  async markJobCompleted(id: string): Promise<void> {
    await this.db
      .prepare(
        `UPDATE generation_jobs 
         SET status = 'completed', stage = 'completed', progress = 100, completed_at = datetime('now'), updated_at = datetime('now')
         WHERE id = ?`,
      )
      .bind(id)
      .run();
  }

  async markJobFailed(id: string, errorCode: string, errorMessage: string, attemptCount: number): Promise<void> {
    await this.db
      .prepare(
        `UPDATE generation_jobs 
         SET status = 'failed', stage = 'failed', error_code = ?, error_message = ?, attempts = ?, updated_at = datetime('now')
         WHERE id = ?`,
      )
      .bind(errorCode, errorMessage, attemptCount, id)
      .run();
  }

  // ── PORTFOLIOS & VERSIONS (TRANSACTIONAL) ────────────────────────────────
  async getPortfolioBySlug(slug: string): Promise<(DbPortfolio & { version?: DbPortfolioVersion }) | null> {
    const portfolio = await this.db
      .prepare('SELECT * FROM portfolios WHERE slug = ? AND published = 1 LIMIT 1')
      .bind(slug)
      .first<DbPortfolio>();

    if (!portfolio || !portfolio.current_version_id) return null;

    const version = await this.db
      .prepare('SELECT * FROM portfolio_versions WHERE id = ? LIMIT 1')
      .bind(portfolio.current_version_id)
      .first<DbPortfolioVersion>();

    return {
      ...portfolio,
      version: version || undefined,
    };
  }

  async getPortfolioByUserId(userId: string): Promise<(DbPortfolio & { versions: DbPortfolioVersion[] }) | null> {
    const portfolio = await this.db
      .prepare('SELECT * FROM portfolios WHERE user_id = ? LIMIT 1')
      .bind(userId)
      .first<DbPortfolio>();

    if (!portfolio) return null;

    const { results } = await this.db
      .prepare('SELECT * FROM portfolio_versions WHERE portfolio_id = ? ORDER BY version_number DESC')
      .bind(portfolio.id)
      .all<DbPortfolioVersion>();

    return {
      ...portfolio,
      versions: results || [],
    };
  }

  /**
   * Persists portfolio and new portfolio version atomically using D1 batch transaction.
   * Section 21: Never mark completed before portfolio data has successfully persisted!
   */
  async savePortfolioAndVersion(params: {
    userId: string;
    resumeId: string;
    portfolioDataJson: string;
    theme?: string;
    slug?: string;
  }): Promise<{ portfolioId: string; versionId: string }> {
    // 1. Check if user already has a portfolio
    let portfolio = await this.db
      .prepare('SELECT id, slug FROM portfolios WHERE user_id = ? LIMIT 1')
      .bind(params.userId)
      .first<{ id: string; slug: string }>();

    const portfolioId = portfolio?.id || crypto.randomUUID();
    const versionId = crypto.randomUUID();
    const theme = params.theme || 'minimal';

    let versionNumber = 1;
    if (portfolio) {
      const latest = await this.db
        .prepare('SELECT MAX(version_number) as max_v FROM portfolio_versions WHERE portfolio_id = ?')
        .bind(portfolioId)
        .first<{ max_v: number | null }>();
      versionNumber = (latest?.max_v || 0) + 1;
    }

    const finalSlug = portfolio?.slug || params.slug || `portfolio-${params.userId.slice(0, 8)}`;

    // Atomic D1 batch execution:
    // 1) Upsert portfolio record
    // 2) Insert new immutable portfolio version
    // 3) Point portfolio.current_version_id to this new version
    await this.db.batch([
      this.db
        .prepare(
          `INSERT INTO portfolios (id, user_id, current_version_id, slug, published, created_at, updated_at)
           VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'))
           ON CONFLICT(id) DO UPDATE SET current_version_id = ?, updated_at = datetime('now')`,
        )
        .bind(portfolioId, params.userId, versionId, finalSlug, versionId),

      this.db
        .prepare(
          `INSERT INTO portfolio_versions (id, portfolio_id, resume_id, version_number, portfolio_data_json, theme, created_at)
           VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
        )
        .bind(versionId, portfolioId, params.resumeId, versionNumber, params.portfolioDataJson, theme),
    ]);

    return { portfolioId, versionId };
  }

  /**
   * Section 12: Changing theme without calling LLM.
   * Creates a new portfolio version copying previous data but with new theme.
   */
  async switchPortfolioTheme(userId: string, portfolioId: string, newTheme: string): Promise<string> {
    const portfolio = await this.db
      .prepare('SELECT current_version_id FROM portfolios WHERE id = ? AND user_id = ? LIMIT 1')
      .bind(portfolioId, userId)
      .first<{ current_version_id: string }>();

    if (!portfolio || !portfolio.current_version_id) {
      throw new Error('Portfolio or active version not found');
    }

    const currentVersion = await this.db
      .prepare('SELECT * FROM portfolio_versions WHERE id = ? LIMIT 1')
      .bind(portfolio.current_version_id)
      .first<DbPortfolioVersion>();

    if (!currentVersion) {
      throw new Error('Active portfolio version data missing');
    }

    const latest = await this.db
      .prepare('SELECT MAX(version_number) as max_v FROM portfolio_versions WHERE portfolio_id = ?')
      .bind(portfolioId)
      .first<{ max_v: number | null }>();
    const nextVersionNumber = (latest?.max_v || 0) + 1;

    const newVersionId = crypto.randomUUID();

    await this.db.batch([
      this.db
        .prepare(
          `INSERT INTO portfolio_versions (id, portfolio_id, resume_id, version_number, portfolio_data_json, theme, created_at)
           VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
        )
        .bind(
          newVersionId,
          portfolioId,
          currentVersion.resume_id,
          nextVersionNumber,
          currentVersion.portfolio_data_json,
          newTheme,
        ),
      this.db
        .prepare('UPDATE portfolios SET current_version_id = ?, updated_at = datetime(\'now\') WHERE id = ?')
        .bind(newVersionId, portfolioId),
    ]);

    return newVersionId;
  }

  async updatePortfolioSettings(
    userId: string,
    portfolioId: string,
    data: { slug?: string; published?: boolean },
  ): Promise<void> {
    const updates: string[] = ["updated_at = datetime('now')"];
    const params: (string | number)[] = [];

    if (data.slug !== undefined) {
      updates.push('slug = ?');
      params.push(data.slug);
    }
    if (data.published !== undefined) {
      updates.push('published = ?');
      params.push(data.published ? 1 : 0);
    }

    params.push(portfolioId, userId);
    await this.db
      .prepare(`UPDATE portfolios SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`)
      .bind(...params)
      .run();
  }

  // ── RATE LIMITING & CONCURRENCY CHECKS ───────────────────────────────────
  async getUserActiveJobCount(userId: string): Promise<number> {
    const res = await this.db
      .prepare(
        `SELECT COUNT(*) as count FROM generation_jobs 
         WHERE user_id = ? AND status IN ('queued', 'processing')`,
      )
      .bind(userId)
      .first<{ count: number }>();
    return res?.count || 0;
  }

  async getUserHourlyJobCount(userId: string): Promise<number> {
    const res = await this.db
      .prepare(
        `SELECT COUNT(*) as count FROM generation_jobs 
         WHERE user_id = ? AND created_at >= datetime('now', '-1 hour')`,
      )
      .bind(userId)
      .first<{ count: number }>();
    return res?.count || 0;
  }

  async incrementJobAttempt(id: string): Promise<number> {
    const res = await this.db
      .prepare(
        `UPDATE generation_jobs 
         SET attempts = attempts + 1, updated_at = datetime('now') 
         WHERE id = ? 
         RETURNING attempts`,
      )
      .bind(id)
      .first<{ attempts: number }>();
    return res?.attempts || 1;
  }

  // ── ASSETS ──────────────────────────────────────────────────────────────
  async createAsset(data: {
    id: string;
    userId: string;
    portfolioId: string | null;
    type: string;
    r2Key: string;
    originalFilename: string;
    mimeType: string;
  }): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO assets (id, user_id, portfolio_id, type, r2_key, original_filename, mime_type, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      )
      .bind(
        data.id,
        data.userId,
        data.portfolioId,
        data.type,
        data.r2Key,
        data.originalFilename,
        data.mimeType,
      )
      .run();
  }

  async listAssets(userId: string, portfolioId?: string): Promise<any[]> {
    const query = portfolioId
      ? 'SELECT * FROM assets WHERE user_id = ? AND portfolio_id = ? ORDER BY created_at DESC'
      : 'SELECT * FROM assets WHERE user_id = ? ORDER BY created_at DESC';
    const stmt = portfolioId ? this.db.prepare(query).bind(userId, portfolioId) : this.db.prepare(query).bind(userId);
    const { results } = await stmt.all();
    return results || [];
  }

  // ── DOMAINS ─────────────────────────────────────────────────────────────
  async createDomain(data: {
    id: string;
    userId: string;
    portfolioId: string;
    domain: string;
  }): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO domains (id, user_id, portfolio_id, domain, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'pending', datetime('now'), datetime('now'))`,
      )
      .bind(data.id, data.userId, data.portfolioId, data.domain)
      .run();
  }

  async listDomains(userId: string): Promise<any[]> {
    const { results } = await this.db
      .prepare('SELECT * FROM domains WHERE user_id = ? ORDER BY created_at DESC')
      .bind(userId)
      .all();
    return results || [];
  }
}

