import { Router, Request, Response } from 'express';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { listTemplates } from '../services/template.service';
import { ok } from '../types/api';

const router = Router();

/**
 * GET /api/templates
 * Returns the list of available portfolio templates.
 * Public – no auth required.
 */
router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const templates = listTemplates();
    res.json(ok(templates));
  }),
);

export default router;
