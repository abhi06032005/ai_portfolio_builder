import { Hono } from 'hono';
import { Env, QueueJobMessage } from '../types/env';
import { DbService } from '../db/client';
import { StorageService } from '../storage/r2';
import { RateLimiter } from '../rate-limit/limiter';
import { QueueProducer } from '../queue/producer';
import { AppError, okResponse } from '../utils/response';
import { logger } from '../utils/logger';

import { sanitizeFilename, verifyFileSignature } from '../utils/security';
import { extractResumeText } from '../resume/extraction';
import { parseResumeWithAI } from '../resume/ai-parser';

export const resumeRouter = new Hono<{ Bindings: Env; Variables: { userId: string } }>();

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'application/octet-stream',
];
const ALLOWED_THEMES = ['minimal', 'modern', 'dark', 'terminal', 'bento'];

/**
 * Common handler for instant synchronous AI resume extraction
 */
const handleParseResume = async (c: any) => {
  const env: Env = c.env;
  let rawText = '';
  let filename = '';

  const contentType = (c.req.header('Content-Type') || '').toLowerCase();

  try {
    if (contentType.includes('application/json')) {
      const json = await c.req.json().catch(() => ({}));
      rawText = (json.text || '').trim();
      filename = json.filename || 'pasted-resume.txt';
    } else {
      const body = await c.req.parseBody().catch(() => ({}));
      const file = body['file'] || body['resume'];

      if (file && typeof file === 'object' && 'arrayBuffer' in file) {
        filename = (file as File).name;
        const arrayBuffer = await (file as File).arrayBuffer();
        const extracted = await extractResumeText(arrayBuffer, (file as File).type || '', filename);
        rawText = extracted.text;
      } else if (typeof body['text'] === 'string') {
        rawText = body['text'].trim();
        filename = 'pasted-resume.txt';
      }
    }
  } catch (err: any) {
    logger.warn('Failed to parse incoming request body', { error: err.message });
  }

  if (!rawText || rawText.length < 5) {
    throw new AppError('No resume text or file provided. Please upload a PDF/DOCX or paste resume text.', 400, 'EMPTY_CONTENT');
  }

  logger.info('Starting synchronous resume parse', { length: rawText.length, filename });
  const parsedData = await parseResumeWithAI(env, rawText, filename);

  return c.json({
    success: true,
    data: parsedData,
  });
};

resumeRouter.post('/parse', handleParseResume);
resumeRouter.post('/upload', handleParseResume);

/**
 * POST /api/resumes
 * Upload resume, permanently save to R2, enqueue background generation job,
 * and return HTTP 202 immediately. (Section 1 & 6)
 * The API request NEVER waits for AI generation!
 */
resumeRouter.post('/', async (c) => {
  const userId = c.get('userId');
  const env = c.env;
  const dbService = new DbService(env.DB);
  const storageService = new StorageService(env.STORAGE);
  const rateLimiter = new RateLimiter(dbService, env);
  const queueProducer = new QueueProducer(env.PORTFOLIO_QUEUE);

  // 1. Rate limiting check (Section 9)
  await rateLimiter.assertCanGenerate(userId);

  // 2. Parse uploaded file
  const body = await c.req.parseBody();
  const file = body['file'];
  const rawTheme = ((body['theme'] as string) || 'minimal').toLowerCase().trim();
  const theme = ALLOWED_THEMES.includes(rawTheme) ? rawTheme : 'minimal';

  if (!file || !(file instanceof File)) {
    throw new AppError('Resume file is required in "file" field', 400, 'FILE_REQUIRED');
  }

  // 3. Sanitize filename and validate extension
  const rawFilename = file.name;
  const filename = sanitizeFilename(rawFilename, 'resume');
  const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    throw new AppError(
      `Unsupported file type "${extension}". Allowed formats: PDF, DOCX, TXT`,
      400,
      'INVALID_FILE_TYPE',
    );
  }

  const mimeType = file.type || 'application/octet-stream';
  if (!ALLOWED_MIME_TYPES.includes(mimeType) && !ALLOWED_EXTENSIONS.includes(extension)) {
    throw new AppError(`Invalid file MIME type: ${mimeType}`, 400, 'INVALID_MIME_TYPE');
  }

  // 4. Validate file size (Section 6 & 22)
  const maxBytes = parseInt(env.MAX_FILE_SIZE_MB || '10', 10) * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new AppError(
      `File exceeds maximum allowed size of ${env.MAX_FILE_SIZE_MB || 10}MB`,
      400,
      'FILE_TOO_LARGE',
    );
  }

  // 5. Read buffer & verify magic byte signature
  const arrayBuffer = await file.arrayBuffer();
  const expectedType = extension === '.pdf' ? 'pdf' : extension === '.docx' ? 'docx' : 'txt';
  const signatureCheck = verifyFileSignature(arrayBuffer, expectedType);
  if (!signatureCheck.valid) {
    throw new AppError(signatureCheck.error || 'Invalid file content signature', 400, 'INVALID_FILE_SIGNATURE');
  }

  // 6. Generate unique resume ID & Job ID
  const resumeId = `resume_${crypto.randomUUID().replace(/-/g, '')}`;
  const jobId = `job_${crypto.randomUUID().replace(/-/g, '')}`;

  // 7. Upload original file to R2 permanent storage (Section 4: Immutable, never overwrite)
  const storageKey = StorageService.getResumeKey(userId, resumeId, filename);

  await storageService.uploadFile(storageKey, arrayBuffer, mimeType, {
    userId,
    resumeId,
    originalFilename: filename,
    uploadedAt: new Date().toISOString(),
  });

  // 7. Create resume record in D1 (Permanent data retention - Section 3)
  await dbService.createResume({
    id: resumeId,
    userId,
    originalFilename: filename,
    storageKey,
    mimeType,
    fileSize: file.size,
  });

  // 8. Create generation job in D1
  await dbService.createJob({
    id: jobId,
    userId,
    resumeId,
    jobType: 'generate_portfolio',
    priority: 5,
  });

  // 9. Send job message to Cloudflare Queue (Section 7)
  const queueMsg: QueueJobMessage = {
    jobId,
    userId,
    resumeId,
    type: 'generate_portfolio',
    attempt: 1,
    theme,
  };
  await queueProducer.enqueueJob(queueMsg);

  logger.info('Resume uploaded and generation job queued successfully', {
    resumeId,
    jobId,
    userId,
    filename,
    fileSize: file.size,
  });

  // 10. Return HTTP 202 immediately
  return c.json(
    {
      resumeId,
      jobId,
      status: 'queued',
      message: 'Resume uploaded successfully. Generation is processing asynchronously in the background.',
    },
    202,
  );
});

/**
 * GET /api/resumes
 * Lists all resumes owned by the authenticated user
 */
resumeRouter.get('/', async (c) => {
  const userId = c.get('userId');
  const dbService = new DbService(c.env.DB);
  const resumes = await dbService.listResumes(userId);
  return okResponse(c, resumes);
});

/**
 * GET /api/resumes/:id
 * Retrieve details of a specific resume
 */
resumeRouter.get('/:id', async (c) => {
  const userId = c.get('userId');
  const resumeId = c.req.param('id');
  const dbService = new DbService(c.env.DB);

  const resume = await dbService.getResume(resumeId, userId);
  if (!resume) {
    throw new AppError('Resume not found or access denied', 404, 'NOT_FOUND');
  }

  return okResponse(c, resume);
});

/**
 * POST /api/resumes/:id/generate
 * Re-triggers generation for an existing stored resume (Section 14 & 26)
 */
resumeRouter.post('/:id/generate', async (c) => {
  const userId = c.get('userId');
  const resumeId = c.req.param('id');
  const env = c.env;
  const dbService = new DbService(env.DB);
  const rateLimiter = new RateLimiter(dbService, env);
  const queueProducer = new QueueProducer(env.PORTFOLIO_QUEUE);

  const resume = await dbService.getResume(resumeId, userId);
  if (!resume) {
    throw new AppError('Resume not found or access denied', 404, 'NOT_FOUND');
  }

  await rateLimiter.assertCanGenerate(userId);

  const body = await c.req.json().catch(() => ({}));
  const theme = (body as any)?.theme || 'minimal';

  const jobId = `job_${crypto.randomUUID().replace(/-/g, '')}`;
  await dbService.createJob({
    id: jobId,
    userId,
    resumeId,
    jobType: 'generate_portfolio',
    priority: 5,
  });

  await queueProducer.enqueueJob({
    jobId,
    userId,
    resumeId,
    type: 'generate_portfolio',
    attempt: 1,
    theme,
  });

  return c.json(
    {
      resumeId,
      jobId,
      status: 'queued',
      message: 'Portfolio generation re-queued for stored resume.',
    },
    202,
  );
});
