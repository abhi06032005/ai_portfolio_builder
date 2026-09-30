import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
// pdf-parse ships as CJS with no default export declaration
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>;

/**
 * Extracts plain text from an uploaded resume file.
 * Supports PDF and Word (.docx / .doc) formats.
 */
export async function extractTextFromFile(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    const buffer = fs.readFileSync(filePath);
    const result = await pdfParse(buffer);
    return result.text;
  }

  if (ext === '.docx' || ext === '.doc') {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  throw new Error(`Unsupported file type: ${ext}`);
}
