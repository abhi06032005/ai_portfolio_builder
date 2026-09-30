import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { uploadMiddleware } from '../middleware/upload';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { extractTextFromFile } from '../services/parser.service';
import { extractResumeData } from '../services/ai.service';
import { prisma } from '../db';
import { ok } from '../types/api';
const router = Router();
// All resume routes require auth
router.use(requireAuth);
/**
 * POST /api/resumes/upload
 * Accepts a PDF or DOCX resume, extracts raw text, runs AI parsing via LLM,
 * saves the raw text, extracted email, and structured JSON to Neon DB with Prisma,
 * and returns the parsed ResumeData.
 */
router.post('/upload', (req, res, next) => {
    uploadMiddleware(req, res, (multerError) => {
        if (multerError)
            return next(new AppError(multerError.message, 400));
        next();
    });
}, asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new AppError('No file uploaded', 400);
    }
    // 1. Extract raw text from uploaded PDF/DOCX
    const rawText = await extractTextFromFile(req.file.path);
    if (!rawText.trim()) {
        throw new AppError('Could not extract text from the uploaded file', 422);
    }
    // 2. Call LLM to parse raw text into structured ResumeData
    const parsedData = await extractResumeData(rawText);
    // 3. Extract email from parsed contact or fallback to user auth email
    const extractedEmail = parsedData.contact?.email || req.auth.userEmail || null;
    // 4. Save to Neon DB with Prisma: raw text, email, parsed JSON, file info
    const resume = await prisma.resume.create({
        data: {
            userId: req.auth.dbUserId,
            originalFilename: req.file.originalname,
            filePath: req.file.path,
            email: extractedEmail,
            rawText: rawText,
            parsedData: parsedData,
        },
    });
    res.status(201).json(ok({
        resumeId: resume.id,
        email: resume.email,
        data: parsedData,
        rawTextLength: rawText.length,
    }));
}));
/**
 * GET /api/resumes/:id
 * Returns a single resume with its raw text and parsed data. User must own it.
 */
router.get('/:id', asyncHandler(async (req, res) => {
    const id = req.params.id;
    const resume = await prisma.resume.findFirst({
        where: {
            id,
            userId: req.auth.dbUserId,
        },
    });
    if (!resume)
        throw new AppError('Resume not found', 404);
    res.json(ok(resume));
}));
/**
 * GET /api/resumes
 * Lists all resumes for the current user.
 */
router.get('/', asyncHandler(async (req, res) => {
    const userResumes = await prisma.resume.findMany({
        where: { userId: req.auth.dbUserId },
        orderBy: { createdAt: 'desc' },
    });
    res.json(ok(userResumes));
}));
export default router;
