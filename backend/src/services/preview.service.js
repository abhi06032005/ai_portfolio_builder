import fs from 'fs';
import path from 'path';
// archiver is CJS; require gives us the factory function directly
// eslint-disable-next-line @typescript-eslint/no-var-requires
const archiverFactory = require('archiver');
import { v4 as uuidv4 } from 'uuid';
import { renderTemplate, getTemplateAssets } from './template.service';
// Directory to store generated preview sites
const PREVIEWS_DIR = path.resolve(__dirname, '../../previews');
if (!fs.existsSync(PREVIEWS_DIR)) {
    fs.mkdirSync(PREVIEWS_DIR, { recursive: true });
}
/**
 * Generates a static preview site for a portfolio.
 * Returns the preview token (used to serve the site at /preview/:token).
 */
export async function generatePreview(templateId, data, existingToken) {
    const token = existingToken || uuidv4();
    const previewDir = path.join(PREVIEWS_DIR, token);
    // Clean up old preview if regenerating
    if (fs.existsSync(previewDir)) {
        fs.rmSync(previewDir, { recursive: true, force: true });
    }
    fs.mkdirSync(previewDir, { recursive: true });
    // Write rendered index.html
    const html = renderTemplate(templateId, data);
    fs.writeFileSync(path.join(previewDir, 'index.html'), html, 'utf-8');
    // Write data.json (some templates load it via fetch)
    fs.writeFileSync(path.join(previewDir, 'data.json'), JSON.stringify(data, null, 2), 'utf-8');
    // Copy static assets (css, js, images)
    const assets = getTemplateAssets(templateId);
    const templateDir = path.resolve(__dirname, '../../../templates', templateId);
    for (const assetPath of assets) {
        const relative = path.relative(templateDir, assetPath);
        const destPath = path.join(previewDir, relative);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.copyFileSync(assetPath, destPath);
    }
    return token;
}
/**
 * Returns the filesystem path to a preview directory.
 */
export function getPreviewDir(token) {
    return path.join(PREVIEWS_DIR, token);
}
/**
 * Creates a zip archive of the generated portfolio site.
 * Returns a readable stream of the zip.
 */
export function createZipArchive(token) {
    const previewDir = getPreviewDir(token);
    const archive = archiverFactory('zip', { zlib: { level: 9 } });
    archive.directory(previewDir, false);
    archive.finalize();
    return archive;
}
/**
 * Cleans up preview directories older than the given age in hours.
 */
export function cleanupOldPreviews(maxAgeHours = 24) {
    const now = Date.now();
    const entries = fs.readdirSync(PREVIEWS_DIR, { withFileTypes: true });
    for (const entry of entries) {
        if (!entry.isDirectory())
            continue;
        const full = path.join(PREVIEWS_DIR, entry.name);
        const stat = fs.statSync(full);
        const ageHours = (now - stat.mtimeMs) / (1000 * 60 * 60);
        if (ageHours > maxAgeHours) {
            fs.rmSync(full, { recursive: true, force: true });
            console.log(`Cleaned up preview: ${entry.name}`);
        }
    }
}
