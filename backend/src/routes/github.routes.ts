import { Router, Request, Response } from 'express';
import axios from 'axios';
import { requireAuth } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { prisma } from '../db';
import { config } from '../config';
import { ok } from '../types/api';

const router = Router();

/**
 * GET /api/github/auth
 * Redirects the user to GitHub OAuth authorization page.
 * State param is the user's DB ID so we can associate the token on callback.
 */
router.get('/auth', requireAuth, (req: Request, res: Response) => {
  const params = new URLSearchParams({
    client_id: config.github.clientId,
    redirect_uri: config.github.redirectUri,
    scope: 'repo,user',
    state: req.auth.dbUserId,
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

/**
 * GET /api/github/callback
 * Exchanges the OAuth code for an access token and saves it to the user record.
 * Redirects back to the frontend with a success flag.
 */
router.get(
  '/callback',
  asyncHandler(async (req: Request, res: Response) => {
    const { code, state: dbUserId } = req.query as {
      code: string;
      state: string;
    };

    if (!code || !dbUserId) {
      throw new AppError('Missing OAuth callback parameters', 400);
    }

    // Exchange code for token
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        code,
        redirect_uri: config.github.redirectUri,
      },
      { headers: { Accept: 'application/json' } },
    );

    const { access_token, error } = response.data;
    if (error || !access_token) {
      throw new AppError('GitHub OAuth failed: ' + (error || 'no token'), 400);
    }

    // Persist token in PostgreSQL using Prisma
    await prisma.user.update({
      where: { id: dbUserId },
      data: { githubToken: access_token },
    });

    // Redirect back to the frontend
    res.redirect(`${config.frontendUrl}/settings?github=connected`);
  }),
);

/**
 * DELETE /api/github/disconnect
 * Removes the stored GitHub token from the user record.
 */
router.delete(
  '/disconnect',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    await prisma.user.update({
      where: { id: req.auth.dbUserId },
      data: { githubToken: null },
    });

    res.json(ok({ disconnected: true }));
  }),
);

/**
 * GET /api/github/status
 * Returns whether the current user has a GitHub token connected.
 */
router.get(
  '/status',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.auth.dbUserId },
      select: { githubToken: true },
    });

    res.json(ok({ connected: !!user?.githubToken }));
  }),
);

export default router;
