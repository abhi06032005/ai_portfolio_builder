import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import resumeRoutes from './routes/resume.routes';
import portfolioRoutes from './routes/portfolio.routes';
import templateRoutes from './routes/template.routes';
import githubRoutes from './routes/github.routes';
import webhookRoutes from './routes/webhook.routes';
import { errorHandler } from './middleware/errorHandler';
import { createZipArchive, getPreviewDir } from './services/preview.service';

const app = express();

// Security & Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // allow inline scripts & styles inside previews/iframes
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Previews Static Directory
const previewsDir = path.resolve(__dirname, '../previews');
if (!fs.existsSync(previewsDir)) {
  fs.mkdirSync(previewsDir, { recursive: true });
}

// Serve preview files directly with proper caching and mime types
app.use(
  '/preview',
  express.static(previewsDir, {
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('X-Frame-Options', 'ALLOWALL');
    },
  }),
);

// Direct token-based zip download (public endpoint for preview modal & studio)
const downloadHandler = (req: express.Request, res: express.Response): void => {
  const token = typeof req.params.token === 'string' ? req.params.token : String(req.params.token || '');
  if (!token) {
    res.status(400).json({ error: 'Token is required' });
    return;
  }
  const dir = getPreviewDir(token);
  if (!fs.existsSync(dir)) {
    res.status(404).json({ error: 'Preview not found or expired' });
    return;
  }
  const archive = createZipArchive(token);
  res.attachment(`portfolio-${token.slice(0, 8)}.zip`);
  res.setHeader('Content-Type', 'application/zip');
  archive.pipe(res);
};

app.get('/preview/:token/download', downloadHandler);
app.get('/api/preview/:token/download', downloadHandler);

// Mount API Routes
app.use('/api/resumes', resumeRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/webhooks', webhookRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'portfoliocraft-backend',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Centralized error handling
app.use(errorHandler);

const PORT = config.port || 3001;

// Only start listening when run directly (not when imported in tests)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n🚀 PortfolioCraft API Server running at http://localhost:${PORT}`);
    console.log(`👁️ Previews accessible at http://localhost:${PORT}/preview/:token/`);
    console.log(`📦 Direct ZIP download at http://localhost:${PORT}/preview/:token/download\n`);
  });
}

export default app;
