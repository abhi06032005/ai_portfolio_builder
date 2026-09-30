import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { apiRouter } from './api/router';
import { processQueueBatch } from './queue/consumer';
import { AppError, errorResponse } from './utils/response';
import { logger } from './utils/logger';
import { DbService } from './db/client';
import { PortfolioRenderer } from './portfolio/renderer';
import { validateSlug } from './utils/security';
const app = new Hono();
// ── Global CORS Middleware ──────────────────────────────────────────────────
app.use('*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length', 'X-Portfolio-Version'],
    maxAge: 86400,
}));
// ── Global Security Headers Middleware ──────────────────────────────────────
app.use('*', async (c, next) => {
    await next();
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'SAMEORIGIN');
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
});
// ── Global Error Handler ────────────────────────────────────────────────────
app.onError((err, c) => {
    if (err instanceof AppError) {
        return errorResponse(err.message, err.statusCode, err.code);
    }
    logger.error('Unhandled server exception', {
        error: err.message,
        stack: err.stack,
        url: c.req.url,
    });
    return errorResponse('Internal Server Error', 500, 'INTERNAL_SERVER_ERROR');
});
// ── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (c) => {
    return c.json({
        status: 'ok',
        runtime: 'cloudflare-workers',
        timestamp: new Date().toISOString(),
    });
});
// ── Mount Core API ──────────────────────────────────────────────────────────
app.route('/api', apiRouter);
// ── Public Portfolio Shortcut ───────────────────────────────────────────────
app.get('/:slug', async (c) => {
    const slug = c.req.param('slug');
    const slugValidation = validateSlug(slug);
    if (!slugValidation.valid) {
        return c.notFound();
    }
    const cacheKey = new URL(c.req.url).toString();
    const cache = caches.default;
    // 1. Check Cloudflare Edge Cache
    const cachedResponse = await cache?.match(cacheKey);
    if (cachedResponse) {
        logger.info('Edge Cache HIT for public portfolio', { slug });
        return cachedResponse;
    }
    // 2. Cache miss -> Read from D1
    const dbService = new DbService(c.env.DB);
    const portfolio = await dbService.getPortfolioBySlug(slug);
    if (!portfolio || !portfolio.version) {
        return c.text('Portfolio not found or not published', 404);
    }
    const portfolioData = JSON.parse(portfolio.version.portfolio_data_json);
    const html = PortfolioRenderer.renderHTML(portfolioData, {
        theme: portfolio.version.theme,
        slug,
    });
    const response = new Response(html, {
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
    // 3. Cache response at Cloudflare Edge
    if (c.executionCtx && cache) {
        c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
    }
    return response;
});
// ── 404 Handler ─────────────────────────────────────────────────────────────
app.notFound((c) => {
    return errorResponse('Resource not found', 404, 'NOT_FOUND');
});
// ── Cloudflare Worker Export ────────────────────────────────────────────────
export default {
    async fetch(request, env, ctx) {
        return app.fetch(request, env, ctx);
    },
    async queue(batch, env) {
        return processQueueBatch(batch, env);
    },
};
