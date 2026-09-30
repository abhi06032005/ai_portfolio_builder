import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { prisma } from '../db';
import { ResumeDataSchema } from '../types/resume';
import { generatePreview } from '../services/preview.service';
import { deployToGitHub } from '../services/github.service';
import { ok } from '../types/api';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
const router = Router();
router.use(requireAuth);
// ── Validation schemas ─────────────────────────────────────────────────────────
const CreatePortfolioSchema = z.object({
    resumeId: z.string().uuid().optional(),
    templateId: z.string().min(1),
    data: ResumeDataSchema,
});
const UpdatePortfolioSchema = z.object({
    templateId: z.string().min(1).optional(),
    data: ResumeDataSchema.partial().optional(),
});
const DeployGithubSchema = z.object({
    repoName: z.string().min(1).max(100),
});
function getId(req) {
    return req.params.id;
}
// ── GET /api/portfolios ────────────────────────────────────────────────────────
router.get('/', asyncHandler(async (req, res) => {
    const rows = await prisma.portfolio.findMany({
        where: { userId: req.auth.dbUserId },
        orderBy: { updatedAt: 'desc' },
        include: { resume: { select: { originalFilename: true, email: true } } },
    });
    res.json(ok(rows));
}));
// ── POST /api/portfolios ───────────────────────────────────────────────────────
router.post('/', asyncHandler(async (req, res) => {
    const parsed = CreatePortfolioSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new AppError(parsed.error.message, 400);
    }
    const { resumeId, templateId, data } = parsed.data;
    const portfolio = await prisma.portfolio.create({
        data: {
            userId: req.auth.dbUserId,
            resumeId: resumeId ?? null,
            templateId,
            data: data,
            status: 'DRAFT',
        },
    });
    res.status(201).json(ok(portfolio));
}));
// ── GET /api/portfolios/:id ────────────────────────────────────────────────────
router.get('/:id', asyncHandler(async (req, res) => {
    const id = getId(req);
    const portfolio = await prisma.portfolio.findFirst({
        where: { id, userId: req.auth.dbUserId },
        include: { resume: true },
    });
    if (!portfolio)
        throw new AppError('Portfolio not found', 404);
    res.json(ok(portfolio));
}));
// ── PATCH /api/portfolios/:id ──────────────────────────────────────────────────
router.patch('/:id', asyncHandler(async (req, res) => {
    const id = getId(req);
    const parsed = UpdatePortfolioSchema.safeParse(req.body);
    if (!parsed.success)
        throw new AppError(parsed.error.message, 400);
    const existing = await prisma.portfolio.findFirst({
        where: { id, userId: req.auth.dbUserId },
    });
    if (!existing)
        throw new AppError('Portfolio not found', 404);
    const updatedData = parsed.data.data
        ? { ...existing.data, ...parsed.data.data }
        : existing.data;
    const updated = await prisma.portfolio.update({
        where: { id },
        data: {
            templateId: parsed.data.templateId ?? existing.templateId,
            data: updatedData,
        },
    });
    res.json(ok(updated));
}));
// ── DELETE /api/portfolios/:id ─────────────────────────────────────────────────
router.delete('/:id', asyncHandler(async (req, res) => {
    const id = getId(req);
    const existing = await prisma.portfolio.findFirst({
        where: { id, userId: req.auth.dbUserId },
    });
    if (!existing)
        throw new AppError('Portfolio not found', 404);
    await prisma.portfolio.delete({ where: { id } });
    res.json(ok({ deleted: true }));
}));
// ── POST /api/portfolios/:id/preview ───────────────────────────────────────────
router.post('/:id/preview', asyncHandler(async (req, res) => {
    const id = getId(req);
    const portfolio = await prisma.portfolio.findFirst({
        where: { id, userId: req.auth.dbUserId },
    });
    if (!portfolio)
        throw new AppError('Portfolio not found', 404);
    const previewToken = uuidv4();
    await generatePreview(portfolio.templateId, portfolio.data, previewToken);
    const updated = await prisma.portfolio.update({
        where: { id },
        data: {
            previewToken,
            status: 'PREVIEW',
        },
    });
    const previewUrl = `/preview/${previewToken}/`;
    res.json(ok({ previewToken, previewUrl, portfolio: updated }));
}));
// ── POST /api/portfolios/:id/deploy ────────────────────────────────────────────
router.post('/:id/deploy', asyncHandler(async (req, res) => {
    const id = getId(req);
    const parsed = DeployGithubSchema.safeParse(req.body);
    if (!parsed.success)
        throw new AppError(parsed.error.message, 400);
    const portfolio = await prisma.portfolio.findFirst({
        where: { id, userId: req.auth.dbUserId },
    });
    if (!portfolio)
        throw new AppError('Portfolio not found', 404);
    const user = await prisma.user.findUnique({
        where: { id: req.auth.dbUserId },
    });
    if (!user?.githubToken) {
        throw new AppError('GitHub account not connected. Please authenticate with GitHub first.', 400);
    }
    const { repoUrl, pagesUrl } = await deployToGitHub(user.githubToken, parsed.data.repoName, portfolio.templateId, portfolio.data);
    const updated = await prisma.portfolio.update({
        where: { id },
        data: {
            githubRepo: parsed.data.repoName,
            status: 'DEPLOYED',
        },
    });
    res.json(ok({ repoUrl, pagesUrl, portfolio: updated }));
}));
// ── GET /api/portfolios/:id/download ───────────────────────────────────────────
router.get('/:id/download', asyncHandler(async (req, res) => {
    const id = getId(req);
    const portfolio = await prisma.portfolio.findFirst({
        where: { id, userId: req.auth.dbUserId },
    });
    if (!portfolio)
        throw new AppError('Portfolio not found', 404);
    const { generatePreview: genPrev, createZipArchive } = await import('../services/preview.service');
    const token = portfolio.previewToken || (await genPrev(portfolio.templateId, portfolio.data));
    const archive = createZipArchive(token);
    res.attachment(`portfolio-${portfolio.id}.zip`);
    res.setHeader('Content-Type', 'application/zip');
    archive.pipe(res);
}));
export default router;
