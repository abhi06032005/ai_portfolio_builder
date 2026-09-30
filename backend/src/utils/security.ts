/**
 * Security utilities: input validation, sanitization, XSS prevention,
 * path traversal defense, and file magic byte verification.
 */

const RESERVED_SLUGS = new Set([
  'api',
  'health',
  'admin',
  'auth',
  'login',
  'logout',
  'signup',
  'register',
  'dashboard',
  'settings',
  'static',
  'assets',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'preview',
  'donate',
  'portfolio',
  'resumes',
  'jobs',
  'users',
  'root',
  'system',
  'null',
  'undefined',
]);

const WINDOWS_RESERVED_NAMES = new Set([
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9',
]);

/**
 * Strips path traversal characters, directory separators, null bytes, and control characters.
 * Ensures the filename is safe to store in R2 and database records.
 */
export function sanitizeFilename(rawFilename: string, fallback = 'file'): string {
  if (!rawFilename || typeof rawFilename !== 'string') {
    return `${fallback}_${Date.now()}`;
  }

  // 1. Normalize unicode
  let clean = rawFilename.normalize('NFKC');

  // 2. Strip directory path separators and traversal
  clean = clean.replace(/\\/g, '/');
  const basePart = clean.split('/').pop() || fallback;

  // 3. Remove null bytes and ASCII control characters (0x00-0x1F, 0x7F)
  const noControl = basePart.replace(/[\x00-\x1F\x7F]/g, '');

  // 4. Split name and extension
  const lastDot = noControl.lastIndexOf('.');
  let name = lastDot !== -1 ? noControl.substring(0, lastDot) : noControl;
  let ext = lastDot !== -1 ? noControl.substring(lastDot + 1).toLowerCase() : '';

  // 5. Sanitize extension: only alphanumeric 1-8 chars
  ext = ext.replace(/[^a-z0-9]/g, '').slice(0, 8);

  // 6. Sanitize name: allow alphanumeric, underscore, hyphen, space
  name = name.replace(/[^a-zA-Z0-9_\-\s]/g, '_').trim().slice(0, 50);

  // 7. Check Windows reserved device names
  if (WINDOWS_RESERVED_NAMES.has(name.toUpperCase())) {
    name = `${name}_safe`;
  }

  if (!name) {
    name = `${fallback}_${Date.now()}`;
  }

  return ext ? `${name}.${ext}` : name;
}

/**
 * Sanitizes URLs to prevent javascript: / vbscript: / data: pseudo-protocol XSS attacks.
 * Only allows http:, https:, mailto:, and internal anchors.
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // Anchor links
  if (trimmed.startsWith('#')) {
    return trimmed.replace(/[^a-zA-Z0-9_\-#]/g, '');
  }

  // Mailto links
  if (trimmed.startsWith('mailto:')) {
    const emailPart = trimmed.substring(7);
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailPart)) {
      return `mailto:${emailPart}`;
    }
    return '';
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    // If not a valid URL with protocol, check if it looks like a domain or path
    if (/^[a-zA-Z0-9][-a-zA-Z0-9+&@#/%?=~_|!:,.;]*$/i.test(trimmed)) {
      // Auto-prefix https if it was a plain domain or relative path
      if (!trimmed.includes(':') && !trimmed.startsWith('/')) {
        return `https://${trimmed}`;
      }
    }
  }

  return '';
}

/**
 * Validates portfolio slug format to prevent directory traversal,
 * route shadowing, and URL corruption.
 */
export function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug || typeof slug !== 'string') {
    return { valid: false, error: 'Slug is required' };
  }

  const normalized = slug.trim().toLowerCase();

  if (normalized.length < 3) {
    return { valid: false, error: 'Slug must be at least 3 characters long' };
  }

  if (normalized.length > 50) {
    return { valid: false, error: 'Slug must be at most 50 characters long' };
  }

  if (!/^[a-z0-9]([a-z0-9-]{1,48}[a-z0-9])?$/.test(normalized)) {
    return {
      valid: false,
      error: 'Slug can only contain lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen',
    };
  }

  if (normalized.includes('--')) {
    return { valid: false, error: 'Slug cannot contain consecutive hyphens' };
  }

  if (RESERVED_SLUGS.has(normalized)) {
    return { valid: false, error: `"${normalized}" is a reserved system keyword and cannot be used as a slug` };
  }

  return { valid: true };
}

/**
 * Validates custom domain format strictly conforming to RFC 1035 / RFC 1123.
 */
export function validateDomain(rawDomain: string): { valid: boolean; cleanDomain: string; error?: string } {
  if (!rawDomain || typeof rawDomain !== 'string') {
    return { valid: false, cleanDomain: '', error: 'Domain is required' };
  }

  // Strip protocol, port, and trailing path
  let domain = rawDomain.trim().toLowerCase();
  domain = domain.replace(/^https?:\/\//, '').replace(/:\d+$/, '').replace(/\/.*$/, '');

  if (domain.length > 253) {
    return { valid: false, cleanDomain: domain, error: 'Domain exceeds 253 characters' };
  }

  // Must have at least one dot, cannot start or end with dot
  if (!domain.includes('.') || domain.startsWith('.') || domain.endsWith('.')) {
    return { valid: false, cleanDomain: domain, error: 'Domain must contain a valid top-level domain (e.g. yoursite.com)' };
  }

  // Reject local/internal domains
  const disallowedSuffixes = ['.local', '.internal', '.test', '.example', '.invalid', '.localhost'];
  for (const suffix of disallowedSuffixes) {
    if (domain.endsWith(suffix) || domain === 'localhost') {
      return { valid: false, cleanDomain: domain, error: 'Internal/private domains are not allowed' };
    }
  }

  // Validate labels
  const labelRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
  const labels = domain.split('.');
  if (labels.length < 2) {
    return { valid: false, cleanDomain: domain, error: 'Domain must have at least two labels' };
  }

  for (const label of labels) {
    if (!labelRegex.test(label)) {
      return { valid: false, cleanDomain: domain, error: `Invalid domain label: "${label}"` };
    }
  }

  // TLD must be at least 2 characters and only letters
  const tld = labels[labels.length - 1];
  if (!/^[a-z]{2,24}$/.test(tld)) {
    return { valid: false, cleanDomain: domain, error: `Invalid top-level domain: ".${tld}"` };
  }

  return { valid: true, cleanDomain: domain };
}

/**
 * Validates file magic bytes (signatures) to ensure files are actually the claimed type,
 * preventing disguised executables or dangerous scripts.
 */
export function verifyFileSignature(
  buffer: ArrayBuffer,
  expectedType: 'pdf' | 'docx' | 'txt' | 'image',
): { valid: boolean; detectedType?: string; error?: string } {
  const bytes = new Uint8Array(buffer.slice(0, 32));

  // PDF: %PDF- (0x25 0x50 0x44 0x46 0x2D)
  const isPdf = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;

  // DOCX / ZIP: PK\x03\x04 (0x50 0x4B 0x03 0x04)
  const isZip = bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04;

  // PNG: 0x89 50 4E 47 0D 0A 1A 0A
  const isPng =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;

  // JPEG: 0xFF 0xD8 0xFF
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;

  // WebP: RIFF ... WEBP
  const isWebp =
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50;

  if (expectedType === 'pdf') {
    if (!isPdf) {
      return { valid: false, error: 'File content does not match a valid PDF signature (%PDF-)' };
    }
    return { valid: true, detectedType: 'application/pdf' };
  }

  if (expectedType === 'docx') {
    if (!isZip) {
      return { valid: false, error: 'File content does not match a valid DOCX signature (PK zip)' };
    }
    return { valid: true, detectedType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
  }

  if (expectedType === 'image') {
    if (isPng) return { valid: true, detectedType: 'image/png' };
    if (isJpeg) return { valid: true, detectedType: 'image/jpeg' };
    if (isWebp) return { valid: true, detectedType: 'image/webp' };

    // Check SVG text header
    const textHeader = new TextDecoder().decode(bytes).toLowerCase();
    if (textHeader.includes('<svg') || textHeader.includes('<?xml')) {
      return { valid: true, detectedType: 'image/svg+xml' };
    }

    return { valid: false, error: 'File content is not a supported image format (JPEG, PNG, WebP, SVG)' };
  }

  if (expectedType === 'txt') {
    // Disallow binary null bytes in plain text files
    for (let i = 0; i < Math.min(bytes.length, 512); i++) {
      if (bytes[i] === 0x00) {
        return { valid: false, error: 'File appears to be binary, expected plain text' };
      }
    }
    return { valid: true, detectedType: 'text/plain' };
  }

  return { valid: true };
}
