import { Hono } from 'hono';
import { DbService } from '../db/client';
import { AppError, okResponse } from '../utils/response';
import { validateDomain } from '../utils/security';
export const domainRouter = new Hono();
/**
 * GET /api/domains
 * Lists custom domains configured for user
 */
domainRouter.get('/', async (c) => {
    const userId = c.get('userId');
    const dbService = new DbService(c.env.DB);
    const domains = await dbService.listDomains(userId);
    return okResponse(c, domains);
});
/**
 * POST /api/domains
 * Connects a custom domain to a portfolio
 */
domainRouter.post('/', async (c) => {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { portfolioId, domain } = body;
    if (!portfolioId || !domain) {
        throw new AppError('portfolioId and domain are required', 400, 'MISSING_FIELDS');
    }
    // 1. Strict domain format validation (RFC 1035 / RFC 1123)
    const domainValidation = validateDomain(domain);
    if (!domainValidation.valid) {
        throw new AppError(domainValidation.error || 'Invalid domain format', 400, 'INVALID_DOMAIN');
    }
    const cleanDomain = domainValidation.cleanDomain;
    const dbService = new DbService(c.env.DB);
    // 2. Ownership verification: Prevent IDOR (connecting domain to someone else's portfolio)
    const portfolio = await dbService.getPortfolioByUserId(userId);
    if (!portfolio || portfolio.id !== portfolioId) {
        throw new AppError('Portfolio not found or access denied', 404, 'PORTFOLIO_NOT_FOUND');
    }
    const domainId = `domain_${crypto.randomUUID().replace(/-/g, '')}`;
    await dbService.createDomain({
        id: domainId,
        userId,
        portfolioId,
        domain: cleanDomain,
    });
    return okResponse(c, {
        domainId,
        domain: cleanDomain,
        status: 'pending',
        message: 'Domain registered. Configure CNAME to point to portfolio maker edge.',
    });
});
