import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  sanitizeFilename,
  validateFileSignature,
  BLOCKED_EXTENSIONS,
  ALLOWED_FORMATS,
} from '../utils/fileValidation';
import { cleanupFile } from '../utils/cleanup';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

describe('Stage 19: File Validation & Security Verification', () => {
  const testDir = path.resolve(__dirname, 'temp_fixtures');

  beforeAll(async () => {
    if (!fs.existsSync(testDir)) {
      await fs.promises.mkdir(testDir, { recursive: true });
    }
  });

  afterAll(async () => {
    if (fs.existsSync(testDir)) {
      await fs.promises.rm(testDir, { recursive: true, force: true });
    }
  });

  describe('Filename Sanitization', () => {
    it('strips directory traversal vectors from filenames', () => {
      const malicious = '../../../etc/passwd.pdf';
      const clean = sanitizeFilename(malicious);
      expect(clean).not.toContain('..');
      expect(clean).not.toContain('/');
      expect(clean).toBe('passwd.pdf');
    });

    it('strips null bytes and non-printable control characters', () => {
      const dirty = 'photo\0\x08_malicious.png';
      const clean = sanitizeFilename(dirty);
      expect(clean).not.toContain('\0');
      expect(clean).not.toContain('\x08');
      expect(clean).toBe('photo_malicious.png');
    });

    it('sanitizes dangerous characters while preserving valid extensions', () => {
      const input = 'my document (1) [final] <test>*.pdf';
      const clean = sanitizeFilename(input);
      expect(clean).not.toContain('<');
      expect(clean).not.toContain('>');
      expect(clean).not.toContain('*');
      expect(clean.endsWith('.pdf')).toBe(true);
    });
  });

  describe('Blocked Extensions', () => {
    it('strictly forbids executables and script formats', () => {
      const executables = ['exe', 'bat', 'cmd', 'sh', 'php', 'js', 'py', 'vbs'];
      for (const ext of executables) {
        expect(BLOCKED_EXTENSIONS.has(ext)).toBe(true);
      }
    });

    it('rejects blocked extensions during file signature check', async () => {
      const fakeExePath = path.join(testDir, 'payload.exe');
      await fs.promises.writeFile(fakeExePath, 'MZdummydata');
      const result = await validateFileSignature(fakeExePath, '.exe');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('strictly prohibited');
      await cleanupFile(fakeExePath);
    });
  });

  describe('Empty & Corrupted Files', () => {
    it('rejects 0-byte empty files with informative error', async () => {
      const emptyPath = path.join(testDir, 'empty.pdf');
      await fs.promises.writeFile(emptyPath, Buffer.alloc(0));
      const result = await validateFileSignature(emptyPath, '.pdf');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('File is empty (0 bytes).');
      await cleanupFile(emptyPath);
    });

    it('rejects text files pretending to be PDF documents (MIME/magic byte mismatch)', async () => {
      const spoofedPdf = path.join(testDir, 'fake.pdf');
      await fs.promises.writeFile(spoofedPdf, 'This is plain text pretending to be a PDF.');
      const result = await validateFileSignature(spoofedPdf, '.pdf');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Content is not a valid PDF document');
      await cleanupFile(spoofedPdf);
    });

    it('rejects text files pretending to be PNG images', async () => {
      const spoofedPng = path.join(testDir, 'fake.png');
      await fs.promises.writeFile(spoofedPng, 'Not a real PNG header.');
      const result = await validateFileSignature(spoofedPng, '.png');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Content is not a valid PNG image');
      await cleanupFile(spoofedPng);
    });

    it('rejects corrupt/truncated images pretending to be JPEG', async () => {
      const corruptJpg = path.join(testDir, 'corrupt.jpg');
      await fs.promises.writeFile(corruptJpg, Buffer.from([0x00, 0x01, 0x02, 0x03]));
      const result = await validateFileSignature(corruptJpg, '.jpg');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Content is not a valid JPEG image');
      await cleanupFile(corruptJpg);
    });
  });

  describe('Valid Real File Signatures', () => {
    it('validates a real genuine PDF document', async () => {
      const realPdfPath = path.join(testDir, 'real.pdf');
      const doc = await PDFDocument.create();
      doc.addPage([200, 200]);
      const pdfBytes = await doc.save();
      await fs.promises.writeFile(realPdfPath, pdfBytes);

      const result = await validateFileSignature(realPdfPath, '.pdf');
      expect(result.valid).toBe(true);
      await cleanupFile(realPdfPath);
    });

    it('validates a real genuine PNG image', async () => {
      const realPngPath = path.join(testDir, 'real.png');
      const pngBuffer = await sharp({
        create: {
          width: 10,
          height: 10,
          channels: 4,
          background: { r: 255, g: 0, b: 0, alpha: 1 },
        },
      })
        .png()
        .toBuffer();
      await fs.promises.writeFile(realPngPath, pngBuffer);

      const result = await validateFileSignature(realPngPath, '.png');
      expect(result.valid).toBe(true);
      await cleanupFile(realPngPath);
    });

    it('validates a real genuine JPEG image', async () => {
      const realJpgPath = path.join(testDir, 'real.jpg');
      const jpgBuffer = await sharp({
        create: {
          width: 10,
          height: 10,
          channels: 3,
          background: { r: 0, g: 128, b: 255 },
        },
      })
        .jpeg()
        .toBuffer();
      await fs.promises.writeFile(realJpgPath, jpgBuffer);

      const result = await validateFileSignature(realJpgPath, '.jpg');
      expect(result.valid).toBe(true);
      await cleanupFile(realJpgPath);
    });

    it('validates a real genuine WebP image', async () => {
      const realWebpPath = path.join(testDir, 'real.webp');
      const webpBuffer = await sharp({
        create: {
          width: 10,
          height: 10,
          channels: 4,
          background: { r: 50, g: 200, b: 50, alpha: 1 },
        },
      })
        .webp()
        .toBuffer();
      await fs.promises.writeFile(realWebpPath, webpBuffer);

      const result = await validateFileSignature(realWebpPath, '.webp');
      expect(result.valid).toBe(true);
      await cleanupFile(realWebpPath);
    });

    it('validates plain text files without null bytes', async () => {
      const txtPath = path.join(testDir, 'readme.txt');
      await fs.promises.writeFile(txtPath, 'Hello, Fileora! Pure UTF-8 text file.', 'utf8');
      const result = await validateFileSignature(txtPath, '.txt');
      expect(result.valid).toBe(true);
      await cleanupFile(txtPath);
    });
  });
});

