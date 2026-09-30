import { AppError } from '../utils/response';
import { sanitizeFilename } from '../utils/security';
export class StorageService {
    storage;
    constructor(storage) {
        this.storage = storage;
    }
    /**
     * Generates canonical permanent storage key for original uploaded resume
     * Pattern: resumes/{userId}/{resumeId}/original.{ext}
     */
    static getResumeKey(userId, resumeId, filename) {
        const cleanUser = userId.replace(/[^a-zA-Z0-9_\-]/g, '_');
        const cleanResume = resumeId.replace(/[^a-zA-Z0-9_\-]/g, '_');
        const safeName = sanitizeFilename(filename, 'resume');
        const ext = safeName.split('.').pop() || 'pdf';
        return `resumes/${cleanUser}/${cleanResume}/original.${ext}`;
    }
    /**
     * Permanent asset storage key
     */
    static getAssetKey(userId, assetType, assetId, filename) {
        const cleanUser = userId.replace(/[^a-zA-Z0-9_\-]/g, '_');
        const cleanType = assetType.replace(/[^a-zA-Z0-9_\-]/g, '_');
        const cleanId = assetId.replace(/[^a-zA-Z0-9_\-]/g, '_');
        const safeName = sanitizeFilename(filename, 'asset');
        return `assets/${cleanUser}/${cleanType}/${cleanId}_${safeName}`;
    }
    static getAvatarKey(userId, filename) {
        const cleanUser = userId.replace(/[^a-zA-Z0-9_\-]/g, '_');
        const safeName = sanitizeFilename(filename, 'avatar');
        return `avatars/${cleanUser}/${safeName}`;
    }
    static getProjectAssetKey(userId, projectId, filename) {
        const cleanUser = userId.replace(/[^a-zA-Z0-9_\-]/g, '_');
        const cleanProject = projectId.replace(/[^a-zA-Z0-9_\-]/g, '_');
        const safeName = sanitizeFilename(filename, 'project');
        return `projects/${cleanUser}/${cleanProject}/${safeName}`;
    }
    /**
     * Stores a file permanently in R2.
     * Enforces immutability: will fail if attempting to overwrite an existing original file.
     */
    async put(key, data, options) {
        const existing = await this.storage.head(key);
        if (existing) {
            throw new AppError(`Storage key already exists: ${key}. Original assets are immutable.`, 409, 'ALREADY_EXISTS');
        }
        const object = await this.storage.put(key, data, {
            httpMetadata: {
                contentType: options.contentType,
            },
            customMetadata: options.metadata,
        });
        if (!object) {
            throw new AppError(`Failed to upload object to R2 for key: ${key}`, 500, 'R2_UPLOAD_FAILED');
        }
        return object;
    }
    /**
     * Convenience wrapper to upload file with metadata
     */
    async uploadFile(key, data, mimeType, metadata) {
        return this.put(key, data, {
            contentType: mimeType,
            metadata,
        });
    }
    /**
     * Retrieves an object from R2 as an ArrayBuffer
     */
    async getBuffer(key) {
        const object = await this.storage.get(key);
        if (!object) {
            throw new AppError(`Object not found in storage: ${key}`, 404, 'STORAGE_NOT_FOUND');
        }
        const data = await object.arrayBuffer();
        const contentType = object.httpMetadata?.contentType || 'application/octet-stream';
        return { data, contentType };
    }
    /**
     * Retrieves the raw ArrayBuffer of a file
     */
    async getFile(key) {
        const { data } = await this.getBuffer(key);
        return data;
    }
    /**
     * Retrieves an object stream directly
     */
    async getStream(key) {
        return await this.storage.get(key);
    }
}
