import { verifyToken } from '@clerk/backend';
import { prisma } from '../db';
import { AppError } from './errorHandler';
import { config } from '../config';
/**
 * requireAuth – verifies the Clerk session token from the Authorization header
 * and attaches req.auth with both the Clerk ID and the internal DB user ID.
 * Auto-provisions the user record in PostgreSQL if webhook has not yet arrived.
 */
export async function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new AppError('Missing or invalid Authorization header', 401);
        }
        const token = authHeader.slice(7);
        // Verify session token with Clerk
        const payload = await verifyToken(token, {
            secretKey: config.clerk.secretKey,
        });
        const clerkUserId = payload.sub;
        if (!clerkUserId) {
            throw new AppError('Invalid token subject', 401);
        }
        // Look up or auto-sync internal user record
        let user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
        });
        if (!user) {
            // Auto-create user if not found yet
            const tokenEmail = payload.email || payload.primary_email || `user_${clerkUserId.slice(0, 8)}@clerk.user`;
            user = await prisma.user.create({
                data: {
                    clerkId: clerkUserId,
                    email: tokenEmail,
                },
            });
        }
        req.auth = { userId: clerkUserId, dbUserId: user.id, userEmail: user.email };
        next();
    }
    catch (error) {
        if (error instanceof AppError) {
            next(error);
        }
        else {
            next(new AppError('Authentication failed', 401));
        }
    }
}
