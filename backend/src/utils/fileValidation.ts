import fs from 'fs';
import path from 'path';

// Dangerous file extensions that should NEVER be allowed
export const BLOCKED_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'sh', 'bin', 'msi', 'com', 'scr', 'vbs', 'js', 'jar',
  'php', 'phtml', 'php3', 'php4', 'php5', 'phps', 'asp', 'aspx', 'jsp',
  'cgi', 'pl', 'py', 'dll', 'so', 'dylib', 'app'
]);

// Allowed file types mapping extension to expected MIME types
export const ALLOWED_FORMATS: Record<string, string[]> = {
  // Documents
  pdf: ['application/pdf'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  doc: ['application/msword'],
  pptx: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  ppt: ['application/vnd.ms-powerpoint'],
  xlsx: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ],
  xls: ['application/vnd.ms-excel'],
  txt: ['text/plain'],
  md: ['text/markdown', 'text/plain'],
  // Images
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  webp: ['image/webp'],
  svg: ['image/svg+xml', 'text/xml', 'application/xml'],
  gif: ['image/gif'],
  // Data
  json: ['application/json', 'text/plain'],
  csv: ['text/csv', 'application/csv', 'text/plain'],
  // Archives
  zip: ['application/zip', 'application/x-zip-compressed']
};

/**
 * Sanitizes original filename:
 * - Strips directory traversal (../, ..\)
 * - Strips null bytes and control chars
 * - Truncates excessively long names while keeping extension
 */
export const sanitizeFilename = (originalName: string): string => {
  // Normalize and take only the base name (prevents path traversal)
  const baseName = path.basename(originalName);

  // Remove null bytes and non-printable control characters
  const cleanBase = baseName.replace(/[\0\x00-\x1F\x7F]/g, '');

  // Extract extension safely
  const parsed = path.parse(cleanBase);
  const ext = parsed.ext.toLowerCase();
  
  // Sanitize the name part: replace characters outside alphanumeric, dashes, underscores, dots, spaces
  const safeName = parsed.name
    .replace(/[^\w\s.-]/gi, '_')
    .trim()
    .slice(0, 100); // Max length limit

  return `${safeName || 'file'}${ext}`;
};

/**
 * Validates file signature (magic bytes) against expected formats.
 */
export const validateFileSignature = async (
  filePath: string,
  extension: string
): Promise<{ valid: boolean; reason?: string }> => {
  const ext = extension.toLowerCase().replace(/^\./, '');

  // Reject strictly blocked executable extensions
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return { valid: false, reason: `File type '.${ext}' is strictly prohibited for security.` };
  }

  // Reject unallowed formats
  if (!ALLOWED_FORMATS[ext]) {
    return { valid: false, reason: `Unsupported file format '.${ext}'.` };
  }

  try {
    // Read first 32 bytes of the file for magic bytes inspection
    const fd = await fs.promises.open(filePath, 'r');
    const buffer = Buffer.alloc(32);
    const { bytesRead } = await fd.read(buffer, 0, 32, 0);
    await fd.close();

    if (bytesRead === 0) {
      return { valid: false, reason: 'File is empty (0 bytes).' };
    }

    // 1. PDF: Must start with %PDF (0x25, 0x50, 0x44, 0x46)
    if (ext === 'pdf') {
      const isPdf = buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
      if (!isPdf) {
        return { valid: false, reason: 'Invalid file signature: Content is not a valid PDF document.' };
      }
      return { valid: true };
    }

    // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
    if (ext === 'png') {
      const isPng =
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4E &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0D &&
        buffer[5] === 0x0A &&
        buffer[6] === 0x1A &&
        buffer[7] === 0x0A;
      if (!isPng) {
        return { valid: false, reason: 'Invalid file signature: Content is not a valid PNG image.' };
      }
      return { valid: true };
    }

    // 3. JPEG/JPG: FF D8 FF
    if (ext === 'jpg' || ext === 'jpeg') {
      const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
      if (!isJpeg) {
        return { valid: false, reason: 'Invalid file signature: Content is not a valid JPEG image.' };
      }
      return { valid: true };
    }

    // 4. WebP: Starts with RIFF, then 4 bytes of size, then WEBP (0x57, 0x45, 0x42, 0x50)
    if (ext === 'webp') {
      const isRiff = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
      const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
      if (!isRiff || !isWebp) {
        return { valid: false, reason: 'Invalid file signature: Content is not a valid WebP image.' };
      }
      return { valid: true };
    }

    // 5. GIF: GIF87a or GIF89a
    if (ext === 'gif') {
      const isGif = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38;
      if (!isGif) {
        return { valid: false, reason: 'Invalid file signature: Content is not a valid GIF image.' };
      }
      return { valid: true };
    }

    // 6. ZIP, DOCX, XLSX, PPTX (OpenXML PK zip packages)
    if (ext === 'zip' || ext === 'docx' || ext === 'xlsx' || ext === 'pptx') {
      const isZip =
        buffer[0] === 0x50 &&
        buffer[1] === 0x4B &&
        ((buffer[2] === 0x03 && buffer[3] === 0x04) || (buffer[2] === 0x05 && buffer[3] === 0x06));
      if (!isZip) {
        return {
          valid: false,
          reason: `Invalid file signature: Content is not a valid ${ext.toUpperCase()} archive package.`
        };
      }
      return { valid: true };
    }

    // 7. Legacy Office binary files (DOC, XLS, PPT - OLE Compound Document: D0 CF 11 E0)
    if (ext === 'doc' || ext === 'xls' || ext === 'ppt') {
      const isOle =
        buffer[0] === 0xD0 &&
        buffer[1] === 0xCF &&
        buffer[2] === 0x11 &&
        buffer[3] === 0xE0;
      if (!isOle) {
        return {
          valid: false,
          reason: `Invalid file signature: Content is not a valid ${ext.toUpperCase()} binary document.`
        };
      }
      return { valid: true };
    }

    // 7. Text-based files (txt, md, json, csv, svg): Verify no binary null bytes
    if (['txt', 'md', 'json', 'csv', 'svg'].includes(ext)) {
      // Check first 32 bytes for null byte
      for (let i = 0; i < bytesRead; i++) {
        if (buffer[i] === 0x00) {
          return { valid: false, reason: `Binary NULL bytes detected in text file (expected UTF-8 text).` };
        }
      }
      return { valid: true };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      reason: `Could not verify file contents: ${error instanceof Error ? error.message : 'Read error'}`
    };
  }
};

