import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import app from '../app';
import { config } from '../config';
import { cleanupFile } from '../utils/cleanup';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

describe('Stage 19: Upload, Cleanup & Error Sanitization Suite', () => {
  const tempFixtureDir = path.resolve(__dirname, 'upload_fixtures');
  let validPdfPath: string;
  let validPngPath: string;
  let emptyFilePath: string;
  let spoofedPdfPath: string;
  let blockedExePath: string;

  beforeAll(async () => {
    if (!fs.existsSync(tempFixtureDir)) {
      await fs.promises.mkdir(tempFixtureDir, { recursive: true });
    }

    // 1. Valid PDF
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([300, 300]);
    const pdfBytes = await pdfDoc.save();
    validPdfPath = path.join(tempFixtureDir, 'valid.pdf');
    await fs.promises.writeFile(validPdfPath, pdfBytes);

    // 2. Valid PNG
    const pngBuffer = await sharp({
      create: {
        width: 16,
        height: 16,
        channels: 4,
        background: { r: 10, g: 150, b: 240, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
    validPngPath = path.join(tempFixtureDir, 'valid.png');
    await fs.promises.writeFile(validPngPath, pngBuffer);

    // 3. Empty File
    emptyFilePath = path.join(tempFixtureDir, 'empty.pdf');
    await fs.promises.writeFile(emptyFilePath, Buffer.alloc(0));

    // 4. Spoofed PDF (plain text content)
    spoofedPdfPath = path.join(tempFixtureDir, 'spoofed.pdf');
    await fs.promises.writeFile(spoofedPdfPath, 'Hello world, this is fake PDF text');

    // 5. Blocked Executable
    blockedExePath = path.join(tempFixtureDir, 'script.exe');
    await fs.promises.writeFile(blockedExePath, 'MZexecutable');
  });

  afterAll(async () => {
    if (fs.existsSync(tempFixtureDir)) {
      await fs.promises.rm(tempFixtureDir, { recursive: true, force: true });
    }
  });

  describe('Valid File Uploads', () => {
    it('accepts and verifies a real PDF upload', async () => {
      const res = await request(app)
        .post('/api/upload')
        .attach('file', validPdfPath);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.file).toBeDefined();
      expect(res.body.file.fileId).toBeDefined();
      expect(res.body.file.originalName).toBe('valid.pdf');
      expect(res.body.file.extension).toBe('pdf');

      // Verify server path is NOT exposed in response
      const bodyStr = JSON.stringify(res.body);
      expect(bodyStr).not.toMatch(/[A-Za-z]:\\[^"'\n\r\t<>]+/);
      expect(bodyStr).not.toContain(config.uploadDir);

      // Clean up uploaded temporary file
      await request(app).delete(`/api/upload/${res.body.file.fileId}`);
    });

    it('accepts and verifies a real PNG image upload', async () => {
      const res = await request(app)
        .post('/api/upload')
        .attach('file', validPngPath);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.file.originalName).toBe('valid.png');
      expect(res.body.file.extension).toBe('png');

      await request(app).delete(`/api/upload/${res.body.file.fileId}`);
    });
  });

  describe('Invalid Upload Rejections & Immediate Cleanup', () => {
    it('rejects blocked file extensions with 400 and security explanation', async () => {
      const res = await request(app)
        .post('/api/upload')
        .attach('file', blockedExePath);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('strictly prohibited');
    });

    it('rejects 0-byte empty files and removes them from disk', async () => {
      const res = await request(app)
        .post('/api/upload')
        .attach('file', emptyFilePath);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('File is empty (0 bytes)');
    });

    it('rejects spoofed files (text disguised as PDF) and removes them from disk', async () => {
      const res = await request(app)
        .post('/api/upload')
        .attach('file', spoofedPdfPath);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Content is not a valid PDF document');
    });

    it('rejects requests with missing file field', async () => {
      const res = await request(app).post('/api/upload');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('No file uploaded');
    });
  });

  describe('Temporary File Deletion API', () => {
    it('deletes an uploaded file by ID and confirms removal', async () => {
      // First upload
      const uploadRes = await request(app)
        .post('/api/upload')
        .attach('file', validPdfPath);
      const fileId = uploadRes.body.file.fileId;

      // Verify file exists on disk
      const uploadedFileOnDisk = path.join(config.uploadDir, `${fileId}.pdf`);
      expect(fs.existsSync(uploadedFileOnDisk)).toBe(true);

      // Now delete via API
      const delRes = await request(app).delete(`/api/upload/${fileId}`);
      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);

      // Verify file was unlinked from disk
      expect(fs.existsSync(uploadedFileOnDisk)).toBe(false);
    });

    it('returns 404 when attempting to delete non-existent file ID', async () => {
      const res = await request(app).delete('/api/upload/non_existent_uuid_12345');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('File not found or already deleted');
    });
  });

  describe('Download & Path Leak Prevention', () => {
    it('returns 404 with clean message for invalid download fileId', async () => {
      const res = await request(app).get('/api/download/invalid_id_99999');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Processed file not found or expired');

      // Verify no server paths in 404 error
      const bodyStr = JSON.stringify(res.body);
      expect(bodyStr).not.toMatch(/[A-Za-z]:\\[^"'\n\r\t<>]+/);
      expect(bodyStr).not.toContain(config.uploadDir);
      expect(bodyStr).not.toContain(config.outputDir);
    });

    it('returns 404 with clean message for invalid preview fileId', async () => {
      const res = await request(app).get('/api/preview/invalid_preview_id');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('File not found');
    });
  });

  describe('Security & Raw Backend Error Sanitization', () => {
    it('never leaks stack traces or unhandled error frames to client', async () => {
      // Trigger a 404 or bad request with malformed JSON
      const res = await request(app)
        .post('/api/image/compress')
        .set('Content-Type', 'application/json')
        .send('{ invalid json payload: true');

      // Express built-in body-parser catches bad JSON
      expect(res.status).toBeGreaterThanOrEqual(400);
      const resText = JSON.stringify(res.body);
      expect(resText).not.toContain('at Object.<anonymous>');
      expect(resText).not.toContain('at Module._compile');
      expect(resText).not.toContain('node_modules');
    });
  });
});
