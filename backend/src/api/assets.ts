import { Hono } from 'hono';
import { Env } from '../types/env';
import { DbService } from '../db/client';
import { StorageService } from '../storage/r2';
import { AppError, okResponse } from '../utils/response';

import { sanitizeFilename, verifyFileSignature } from '../utils/security';

export const assetRouter = new Hono<{ Bindings: Env; Variables: { userId: string } }>();

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit for images

/**
 * POST /api/assets/upload
 * Upload avatar or project screenshot to permanent R2 storage
 */
assetRouter.post('/upload', async (c) => {
  const userId = c.get('userId');
  const env = c.env;
  const storageService = new StorageService(env.STORAGE);
  const dbService = new DbService(env.DB);

  const body = await c.req.parseBody();
  const file = body['file'];
  const type = (body['type'] as string) || 'general'; // avatar, project, general
  const portfolioId = (body['portfolioId'] as string) || null;

  if (!file || !(file instanceof File)) {
    throw new AppError('File is required in "file" form field', 400, 'FILE_REQUIRED');
  }

  // 1. File size check
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new AppError('Image file exceeds maximum allowed size of 5MB', 400, 'FILE_TOO_LARGE');
  }

  // 2. MIME type check
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new AppError('Only JPEG, PNG, WebP, and SVG images are allowed', 400, 'INVALID_IMAGE_TYPE');
  }

  // 3. IDOR check if attaching to a specific portfolio
  if (portfolioId) {
    const portfolio = await dbService.getPortfolioByUserId(userId);
    if (!portfolio || portfolio.id !== portfolioId) {
      throw new AppError('Portfolio not found or access denied', 404, 'PORTFOLIO_NOT_FOUND');
    }
  }

  // 4. Sanitize filename to prevent path traversal in R2
  const filename = sanitizeFilename(file.name, 'asset');
  const assetId = `asset_${crypto.randomUUID().replace(/-/g, '')}`;

  // 5. Read buffer & verify magic byte signature
  const arrayBuffer = await file.arrayBuffer();
  const signatureCheck = verifyFileSignature(arrayBuffer, 'image');
  if (!signatureCheck.valid) {
    throw new AppError(signatureCheck.error || 'Invalid image file signature', 400, 'INVALID_FILE_SIGNATURE');
  }

  let r2Key: string;
  if (type === 'avatar') {
    r2Key = StorageService.getAvatarKey(userId, filename);
  } else if (type === 'project' && portfolioId) {
    r2Key = StorageService.getProjectAssetKey(userId, portfolioId, filename);
  } else {
    r2Key = `assets/${userId}/${assetId}/${filename}`;
  }

  await storageService.uploadFile(r2Key, arrayBuffer, file.type, {
    userId,
    assetId,
    originalFilename: filename,
  });

  await dbService.createAsset({
    id: assetId,
    userId,
    portfolioId,
    type,
    r2Key,
    originalFilename: filename,
    mimeType: file.type,
  });

  return okResponse(c, {
    assetId,
    r2Key,
    originalFilename: filename,
    mimeType: file.type,
  });
});

/**
 * GET /api/assets
 * Lists user assets
 */
assetRouter.get('/', async (c) => {
  const userId = c.get('userId');
  const portfolioId = c.req.query('portfolioId');
  const dbService = new DbService(c.env.DB);

  const assets = await dbService.listAssets(userId, portfolioId);
  return okResponse(c, assets);
});
