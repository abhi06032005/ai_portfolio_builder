import { Hono } from 'hono';
import { DbService } from '../db/client';
import { PortfolioRenderer } from '../portfolio/renderer';
import { QueueProducer } from '../queue/producer';
import { RateLimiter } from '../rate-limit/limiter';
import { authMiddleware } from '../auth/middleware';
import { AppError, okResponse } from '../utils/response';
import { logger } from '../utils/logger';
import { validateSlug } from '../utils/security';
export const portfolioRouter = new Hono();
/**
 * GET /api/portfolio/:slug
 * PUBLIC ENDPOINT (Zero-AI, Zero-Queue, Edge-Cached - Section 18)
 * Checks Cloudflare Cache API, falls back to D1, renders modern HTML or JSON, and caches response.
 */
portfolioRouter.get('/:slug', async (c) => {
    const slug = c.req.param('slug');
    const slugValidation = validateSlug(slug);
    if (!slugValidation.valid) {
        throw new AppError(slugValidation.error || 'Invalid portfolio slug', 404, 'NOT_FOUND');
    }
    const cacheKey = new URL(c.req.url).toString();
    const cache = caches.default;
    // 1. Check Cloudflare Cache
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
        logger.info('Serving public portfolio from Cloudflare Edge Cache (Cache HIT)', { slug });
        return cachedResponse;
    }
    // 2. Fetch from D1 on cache miss
    const dbService = new DbService(c.env.DB);
    const portfolio = await dbService.getPortfolioBySlug(slug);
    if (!portfolio || !portfolio.version) {
        throw new AppError('Portfolio not found or not published', 404, 'NOT_FOUND');
    }
    const portfolioData = JSON.parse(portfolio.version.portfolio_data_json);
    const theme = portfolio.version.theme;
    const acceptsHtml = c.req.header('Accept')?.includes('text/html');
    const format = c.req.query('format');
    let response;
    if (acceptsHtml && format !== 'json') {
        // Render modern responsive portfolio HTML
        const html = PortfolioRenderer.renderHTML(portfolioData, { theme, slug });
        response = new Response(html, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=600',
                'X-Portfolio-Version': String(portfolio.version.version_number),
                'Content-Security-Policy': "default-src 'self'; script-src 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src * data:; connect-src 'none'; frame-ancestors 'self';",
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'SAMEORIGIN',
                'Referrer-Policy': 'strict-origin-when-cross-origin',
            },
        });
    }
    else {
        // Return structured JSON
        response = new Response(JSON.stringify({
            success: true,
            data: {
                slug: portfolio.slug,
                theme,
                version: portfolio.version.version_number,
                content: portfolioData,
            },
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=600',
                'X-Content-Type-Options': 'nosniff',
            },
        });
    }
    // 3. Store in Cloudflare Edge Cache asynchronously
    c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
});
/**
 * GET /api/portfolio
 * PRIVATE: Retrieves current user's portfolio and version history
 */
portfolioRouter.get('/', authMiddleware, async (c) => {
    const userId = c.get('userId');
    if (!userId)
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    const validUserId = userId;
    const dbService = new DbService(c.env.DB);
    const portfolio = await dbService.getPortfolioByUserId(validUserId);
    if (!portfolio) {
        return okResponse(c, null);
    }
    return okResponse(c, portfolio);
});
/**
 * PUT /api/portfolio/:id
 * PRIVATE: Update portfolio settings (slug, published)
 */
portfolioRouter.put('/:id', authMiddleware, async (c) => {
    const userId = c.get('userId');
    if (!userId)
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    const validUserId = userId;
    const portfolioId = c.req.param('id');
    const body = await c.req.json();
    if (body.slug !== undefined) {
        const slugValidation = validateSlug(body.slug);
        if (!slugValidation.valid) {
            throw new AppError(slugValidation.error || 'Invalid portfolio slug', 400, 'INVALID_SLUG');
        }
    }
    const dbService = new DbService(c.env.DB);
    await dbService.updatePortfolioSettings(validUserId, portfolioId, {
        slug: body.slug,
        published: body.published !== undefined ? Boolean(body.published) : undefined,
    });
    return okResponse(c, { message: 'Portfolio settings updated successfully' });
});
/**
 * POST /api/portfolio/:id/theme
 * PRIVATE: Switch portfolio theme (Section 12: Zero LLM calls! Simply creates a new version)
 */
portfolioRouter.post('/:id/theme', authMiddleware, async (c) => {
    const userId = c.get('userId');
    if (!userId)
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    const validUserId = userId;
    const portfolioId = c.req.param('id');
    const body = await c.req.json();
    const ALLOWED_THEMES = ['minimal', 'modern', 'dark', 'terminal', 'bento'];
    const requestedTheme = (body.theme || 'minimal').toString().toLowerCase().trim();
    if (!ALLOWED_THEMES.includes(requestedTheme)) {
        throw new AppError(`Unsupported theme "${requestedTheme}". Allowed themes: ${ALLOWED_THEMES.join(', ')}`, 400, 'INVALID_THEME');
    }
    const newTheme = requestedTheme;
    const dbService = new DbService(c.env.DB);
    const newVersionId = await dbService.switchPortfolioTheme(validUserId, portfolioId, newTheme);
    return okResponse(c, {
        message: `Theme switched to "${newTheme}" successfully without LLM regeneration`,
        versionId: newVersionId,
        theme: newTheme,
    });
});
/**
 * POST /api/portfolio/:id/publish
 * PRIVATE: Publish or unpublish portfolio
 */
portfolioRouter.post('/:id/publish', authMiddleware, async (c) => {
    const userId = c.get('userId');
    if (!userId)
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    const validUserId = userId;
    const portfolioId = c.req.param('id');
    const body = await c.req.json().catch(() => ({}));
    const published = body.published !== undefined ? Boolean(body.published) : true;
    const dbService = new DbService(c.env.DB);
    await dbService.updatePortfolioSettings(validUserId, portfolioId, { published });
    return okResponse(c, {
        message: published ? 'Portfolio published successfully' : 'Portfolio unpublished',
        published,
    });
});
/**
 * POST /api/portfolio/:id/regenerate
 * PRIVATE: Re-triggers background AI generation using stored resume data
 */
portfolioRouter.post('/:id/regenerate', authMiddleware, async (c) => {
    const userId = c.get('userId');
    if (!userId)
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    const validUserId = userId;
    const portfolioId = c.req.param('id');
    const env = c.env;
    const dbService = new DbService(env.DB);
    const rateLimiter = new RateLimiter(dbService, env);
    const queueProducer = new QueueProducer(env.PORTFOLIO_QUEUE);
    await rateLimiter.assertCanGenerate(userId);
    const portfolio = await dbService.getPortfolioByUserId(userId);
    if (!portfolio || portfolio.id !== portfolioId) {
        throw new AppError('Portfolio not found', 404, 'NOT_FOUND');
    }
    const latestVersion = portfolio.versions?.[0];
    if (!latestVersion) {
        throw new AppError('No prior version found to regenerate from', 400, 'NO_VERSION');
    }
    const jobId = `job_${crypto.randomUUID().replace(/-/g, '')}`;
    await dbService.createJob({
        id: jobId,
        userId,
        resumeId: latestVersion.resume_id,
        jobType: 'regenerate_portfolio',
        priority: 5,
    });
    const body = await c.req.json().catch(() => ({}));
    const theme = body?.theme || latestVersion.theme || 'minimal';
    await queueProducer.enqueueJob({
        jobId,
        userId,
        resumeId: latestVersion.resume_id,
        type: 'generate_portfolio',
        attempt: 1,
        theme,
    });
    return c.json({
        jobId,
        status: 'queued',
        message: 'Portfolio regeneration queued in background.',
    }, 202);
});
