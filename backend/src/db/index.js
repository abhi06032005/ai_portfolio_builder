import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();
// Global prisma client instance for connection pooling in development/production
const globalForPrisma = global;
export const prisma = globalForPrisma.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = prisma;
export default prisma;
