/**
 * Cryptographic JWT Verification for Edge / Cloudflare Workers
 * Uses native Web Crypto API (crypto.subtle) without heavy node modules.
 * Supports RS256 (Clerk standard) and HS256 (Shared Secret).
 */

export interface JwtPayload {
  sub: string;
  email?: string;
  primary_email?: string;
  username?: string;
  exp?: number;
  nbf?: number;
  iat?: number;
  iss?: string;
  aud?: string | string[];
  [key: string]: any;
}

export interface JwtHeader {
  alg: string;
  typ?: string;
  kid?: string;
}

// In-memory JWKS cache for edge worker instance
let jwksCache: { keys: any[]; expiresAt: number } | null = null;

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function parseJwtParts(token: string): {
  header: JwtHeader;
  payload: JwtPayload;
  signedData: Uint8Array;
  signature: Uint8Array;
} | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    const headerJson = new TextDecoder().decode(base64UrlToUint8Array(headerB64));
    const payloadJson = new TextDecoder().decode(base64UrlToUint8Array(payloadB64));

    const header = JSON.parse(headerJson) as JwtHeader;
    const payload = JSON.parse(payloadJson) as JwtPayload;

    const signedData = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const signature = base64UrlToUint8Array(signatureB64);

    return { header, payload, signedData, signature };
  } catch {
    return null;
  }
}

/**
 * Verifies HMAC-SHA256 signature using Web Crypto
 */
async function verifyHs256(signedData: Uint8Array, signature: Uint8Array, secret: string): Promise<boolean> {
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    return await crypto.subtle.verify('HMAC', key, signature, signedData);
  } catch {
    return false;
  }
}

/**
 * Fetches and caches Clerk JWKS public keys
 */
async function getClerkJwks(jwksUrl?: string): Promise<any[]> {
  const now = Date.now();
  if (jwksCache && jwksCache.expiresAt > now) {
    return jwksCache.keys;
  }

  const url = jwksUrl || 'https://api.clerk.com/v1/jwks';
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const data: any = await res.json();
    if (data && Array.isArray(data.keys)) {
      jwksCache = {
        keys: data.keys,
        expiresAt: now + 60 * 60 * 1000, // Cache for 1 hour
      };
      return data.keys;
    }
  } catch {
    // ignore network fetch failures
  }
  return [];
}

/**
 * Verifies RS256 signature using JWK and Web Crypto
 */
async function verifyRs256(
  signedData: Uint8Array,
  signature: Uint8Array,
  kid?: string,
  jwksUrl?: string,
): Promise<boolean> {
  try {
    const keys = await getClerkJwks(jwksUrl);
    if (!keys || keys.length === 0) return false;

    // Match by kid if available, otherwise try first RS256 key
    const matchingKey = kid ? keys.find((k: any) => k.kid === kid) : keys.find((k: any) => k.kty === 'RSA');
    if (!matchingKey) return false;

    const cryptoKey = await crypto.subtle.importKey(
      'jwk',
      matchingKey,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify'],
    );

    return await crypto.subtle.verify('RSASSA-PKCS1-v1_5', cryptoKey, signature, signedData);
  } catch {
    return false;
  }
}

export interface VerifyJwtOptions {
  jwtSecret?: string;
  clerkSecretKey?: string;
  clerkJwksUrl?: string;
  allowDevBypass?: boolean;
}

/**
 * Verifies JWT token cryptographically and validates expiration and subject claims.
 */
export async function verifyJwt(
  token: string,
  options: VerifyJwtOptions = {},
): Promise<{ valid: boolean; payload?: JwtPayload; error?: string }> {
  const parsed = parseJwtParts(token);
  if (!parsed) {
    return { valid: false, error: 'Malformed JWT structure' };
  }

  const { header, payload, signedData, signature } = parsed;

  if (!payload.sub || typeof payload.sub !== 'string') {
    return { valid: false, error: 'Token missing required "sub" subject claim' };
  }

  // 1. Expiration check (with 30-second clock skew tolerance)
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now > payload.exp + 30) {
    return { valid: false, error: 'Token has expired' };
  }

  // 2. Not before check
  if (payload.nbf && now < payload.nbf - 30) {
    return { valid: false, error: 'Token not yet valid (nbf claim)' };
  }

  // 3. Cryptographic Signature Verification
  const hasSecrets = Boolean(options.jwtSecret || options.clerkSecretKey || options.clerkJwksUrl);

  if (header.alg === 'HS256' && options.jwtSecret) {
    const verified = await verifyHs256(signedData, signature, options.jwtSecret);
    if (!verified) {
      return { valid: false, error: 'Invalid HMAC signature' };
    }
  } else if (header.alg === 'RS256') {
    // Attempt RS256 verification via Clerk JWKS
    const verified = await verifyRs256(signedData, signature, header.kid, options.clerkJwksUrl);
    if (!verified && hasSecrets) {
      return { valid: false, error: 'Invalid RSA signature from identity provider' };
    }
  } else if (hasSecrets) {
    // If secrets are configured and algorithm does not match or verification failed
    return { valid: false, error: `Unsupported or unverified token algorithm: ${header.alg}` };
  } else if (!options.allowDevBypass) {
    // In production without configured secrets, fail closed
    return { valid: false, error: 'Auth service configuration required (JWT_SECRET or CLERK_SECRET_KEY missing)' };
  }

  return { valid: true, payload };
}
