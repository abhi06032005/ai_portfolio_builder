import { extractText } from 'unpdf';
import mammoth from 'mammoth';
import { logger } from '../utils/logger';
/**
 * Stage 1: Text extraction (Section 10)
 * Deterministic text extraction from PDF, DOCX, or text files on Cloudflare Worker runtime.
 */
export async function extractResumeText(buffer, mimeType, filename) {
    const lowerName = filename.toLowerCase();
    const lowerMime = mimeType.toLowerCase();
    try {
        // 1. PDF Handling via unpdf (web-native pdf.js)
        if (lowerMime.includes('pdf') || lowerName.endsWith('.pdf')) {
            logger.info('Extracting text from PDF using unpdf', { filename, mimeType });
            const { text } = await extractText(buffer);
            const cleaned = cleanExtractedText(Array.isArray(text) ? text.join('\n') : text);
            return {
                text: cleaned,
                charCount: cleaned.length,
                format: 'pdf',
            };
        }
        // 2. DOCX Handling via mammoth
        if (lowerMime.includes('word') ||
            lowerMime.includes('officedocument') ||
            lowerName.endsWith('.docx')) {
            logger.info('Extracting text from DOCX using mammoth', { filename });
            const nodeBuffer = Buffer.from(buffer);
            const result = await mammoth.extractRawText({ buffer: nodeBuffer });
            const cleaned = cleanExtractedText(result.value);
            return {
                text: cleaned,
                charCount: cleaned.length,
                format: 'docx',
            };
        }
        // 3. Plain Text / Markdown
        logger.info('Extracting raw text from buffer', { filename });
        const textDecoder = new TextDecoder('utf-8');
        const text = cleanExtractedText(textDecoder.decode(buffer));
        return {
            text,
            charCount: text.length,
            format: 'txt',
        };
    }
    catch (error) {
        logger.error('Resume text extraction failed', {
            filename,
            mimeType,
            error: error.message,
        });
        throw new Error(`Failed to extract text from resume (${filename}): ${error.message}`);
    }
}
/**
 * Cleans up raw extracted text: removes multiple continuous blank lines and control characters
 */
function cleanExtractedText(raw) {
    if (!raw)
        return '';
    return raw
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '') // remove ASCII control characters
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}
