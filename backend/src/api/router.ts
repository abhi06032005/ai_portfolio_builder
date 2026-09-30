import { Hono } from 'hono';
import { Env } from '../types/env';
import { authMiddleware } from '../auth/middleware';
import { resumeRouter } from './resumes';
import { jobRouter } from './jobs';
import { portfolioRouter } from './portfolios';
import { assetRouter } from './assets';
import { domainRouter } from './domains';

export const apiRouter = new Hono<{ Bindings: Env }>();

// 1. Resumes - All endpoints require authentication
apiRouter.use('/resumes', authMiddleware);
apiRouter.use('/resumes/*', authMiddleware);
apiRouter.route('/resumes', resumeRouter);

// 2. Jobs - Polling requires authentication
apiRouter.use('/jobs', authMiddleware);
apiRouter.use('/jobs/*', authMiddleware);
apiRouter.route('/jobs', jobRouter);

// 3. Portfolios - Public slug route does not require auth, while management routes do
apiRouter.route('/portfolio', portfolioRouter);

// 4. Assets - Uploads require authentication
apiRouter.use('/assets', authMiddleware);
apiRouter.use('/assets/*', authMiddleware);
apiRouter.route('/assets', assetRouter);

// 5. Domains - Require authentication
apiRouter.use('/domains', authMiddleware);
apiRouter.use('/domains/*', authMiddleware);
apiRouter.route('/domains', domainRouter);

