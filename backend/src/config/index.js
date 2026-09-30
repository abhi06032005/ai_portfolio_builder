import dotenv from 'dotenv';
dotenv.config();
export const config = {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: process.env.DATABASE_URL,
    clerk: {
        secretKey: process.env.CLERK_SECRET_KEY,
        publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
        webhookSecret: process.env.CLERK_WEBHOOK_SECRET,
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
    },
    github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        redirectUri: process.env.GITHUB_REDIRECT_URI,
    },
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    previewBaseUrl: process.env.PREVIEW_BASE_URL || 'http://localhost:3001/preview',
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
};
// Validate required env vars
const required = [
    'DATABASE_URL',
    'CLERK_SECRET_KEY',
    'CLERK_WEBHOOK_SECRET',
    'OPENAI_API_KEY',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
];
for (const key of required) {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
}
