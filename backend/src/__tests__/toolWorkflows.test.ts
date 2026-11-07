import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import app from '../app';
import { config } from '../config';
import { cleanupFile } from '../utils/cleanup';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

describe('Stage 19: Complete Tool Workflows with Real Files', () => {
  const fixtureDir = path.resolve(__dirname, 'workflow_fixtures');
  let singlePagePdfPath: string;
  let multiPagePdfPath: string;
  let samplePngPath: string;
  let sampleJpgPath: string;

  beforeAll(async () => {
    if (!fs.existsSync(fixtureDir)) {
      await fs.promises.mkdir(fixtureDir, { recursive: true });
    }

    // 1. Create a real 1-page PDF
    const doc1 = await PDFDocument.create();
    doc1.addPage([400, 400]);
    singlePagePdfPath = path.join(fixtureDir, 'single.pdf');
    await fs.promises.writeFile(singlePagePdfPath, await doc1.save());

    // 2. Create a real 3-page PDF
    const doc3 = await PDFDocument.create();
    doc3.addPage([300, 300]);
    doc3.addPage([300, 300]);
    doc3.addPage([300, 300]);
    multiPagePdfPath = path.join(fixtureDir, 'multi3.pdf');
    await fs.promises.writeFile(multiPagePdfPath, await doc3.save());

    // 3. Create a real PNG image (200x200)
    samplePngPath = path.join(fixtureDir, 'sample.png');
    const pngBuf = await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 4,
        background: { r: 60, g: 120, b: 240, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
    await fs.promises.writeFile(samplePngPath, pngBuf);

    // 4. Create a real JPG image (200x200)
    sampleJpgPath = path.join(fixtureDir, 'sample.jpg');
    const jpgBuf = await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 3,
        background: { r: 240, g: 80, b: 60 },
      },
    })
      .jpeg()
      .toBuffer();
    await fs.promises.writeFile(sampleJpgPath, jpgBuf);
  });

  afterAll(async () => {
    if (fs.existsSync(fixtureDir)) {
      await fs.promises.rm(fixtureDir, { recursive: true, force: true });
    }
  });

  describe('Image Processing Suite', () => {
    it('executes real image compression, downloads output, and cleans up', async () => {
      // 1. Upload
      const uploadRes = await request(app)
        .post('/api/upload')
        .attach('file', sampleJpgPath);
      expect(uploadRes.status).toBe(200);
      const fileId = uploadRes.body.file.fileId;

      // 2. Process: Compress
      const compRes = await request(app)
        .post('/api/image/compress')
        .send({
          fileId,
          preset: 'balanced',
          quality: 75,
          stripMetadata: true,
        });

      expect(compRes.status).toBe(200);
      expect(compRes.body.success).toBe(true);
      expect(compRes.body.outputFileId).toBeDefined();
      expect(['jpg', 'jpeg']).toContain(compRes.body.format);
      expect(compRes.body.original.size).toBeGreaterThan(0);
      expect(compRes.body.result.size).toBeGreaterThan(0);

      // 3. Download generated file
      const dlRes = await request(app).get(`/api/download/${compRes.body.outputFileId}`);
      expect(dlRes.status).toBe(200);
      expect(dlRes.header['content-disposition']).toContain('attachment');
      expect(dlRes.body.length).toBeGreaterThan(0);

      // Clean up output
      await cleanupFile(path.join(config.outputDir, `${compRes.body.outputFileId}.jpeg`));
    });

    it('executes real image resizing with aspect ratio preservation', async () => {
      const uploadRes = await request(app)
        .post('/api/upload')
        .attach('file', samplePngPath);
      const fileId = uploadRes.body.file.fileId;

      const resizeRes = await request(app)
        .post('/api/image/resize')
        .send({
          fileId,
          width: 100,
          maintainAspectRatio: true,
        });

      expect(resizeRes.status).toBe(200);
      expect(resizeRes.body.success).toBe(true);
      expect(resizeRes.body.result.width).toBe(100);
      expect(resizeRes.body.result.height).toBe(100);

      await cleanupFile(path.join(config.outputDir, `${resizeRes.body.outputFileId}.png`));
    });

    it('executes real image format conversion to WebP', async () => {
      const uploadRes = await request(app)
        .post('/api/upload')
        .attach('file', samplePngPath);
      const fileId = uploadRes.body.file.fileId;

      const convRes = await request(app)
        .post('/api/image/convert')
        .send({
          fileId,
          targetFormat: 'webp',
          quality: 80,
        });

      expect(convRes.status).toBe(200);
      expect(convRes.body.success).toBe(true);
      expect(convRes.body.format).toBe('webp');

      await cleanupFile(path.join(config.outputDir, `${convRes.body.outputFileId}.webp`));
    });

    it('executes application photo resizer and generates checklist validation', async () => {
      const uploadRes = await request(app)
        .post('/api/upload')
        .attach('file', sampleJpgPath);
      const fileId = uploadRes.body.file.fileId;

      const photoRes = await request(app)
        .post('/api/image/application-resize')
        .send({
          fileId,
          width: 350,
          height: 450,
          format: 'jpg',
          maxSizeKB: 50,
          fit: 'cover',
        });

      expect(photoRes.status).toBe(200);
      expect(photoRes.body.success).toBe(true);
      expect(photoRes.body.validation).toBeDefined();
      expect(photoRes.body.validation.checklist).toHaveLength(4);
      expect(photoRes.body.result.width).toBe(350);
      expect(photoRes.body.result.height).toBe(450);

      await cleanupFile(path.join(config.outputDir, `${photoRes.body.outputFileId}.jpg`));
    });
  });

  describe('PDF Operations Suite', () => {
    it('merges multiple real PDFs into a single valid PDF', async () => {
      const up1 = await request(app).post('/api/upload').attach('file', singlePagePdfPath);
      const up2 = await request(app).post('/api/upload').attach('file', multiPagePdfPath);

      const mergeRes = await request(app)
        .post('/api/pdf/merge')
        .send({
          fileIds: [up1.body.file.fileId, up2.body.file.fileId],
          outputName: 'merged_test.pdf',
        });

      expect(mergeRes.status).toBe(200);
      expect(mergeRes.body.success).toBe(true);
      expect(mergeRes.body.pageCount).toBe(4); // 1 + 3

      // Verify merged output opens with pdf-lib
      const outputPath = path.join(config.outputDir, `${mergeRes.body.fileId}.pdf`);
      const outputBytes = await fs.promises.readFile(outputPath);
      const loaded = await PDFDocument.load(outputBytes);
      expect(loaded.getPageCount()).toBe(4);

      await cleanupFile(outputPath);
    });

    it('splits a real multi-page PDF by page range', async () => {
      const up = await request(app).post('/api/upload').attach('file', multiPagePdfPath);

      const splitRes = await request(app)
        .post('/api/pdf/split')
        .send({
          fileId: up.body.file.fileId,
          mode: 'range',
          pageRanges: '1-2',
        });

      expect(splitRes.status).toBe(200);
      expect(splitRes.body.success).toBe(true);
      expect(splitRes.body.pageCount).toBe(2);

      const outputPath = path.join(config.outputDir, `${splitRes.body.fileId}.pdf`);
      await cleanupFile(outputPath);
    });

    it('extracts specific pages from a real PDF', async () => {
      const up = await request(app).post('/api/upload').attach('file', multiPagePdfPath);

      const extractRes = await request(app)
        .post('/api/pdf/extract')
        .send({
          fileId: up.body.file.fileId,
          pageNumbers: [1, 3],
        });

      expect(extractRes.status).toBe(200);
      expect(extractRes.body.success).toBe(true);
      expect(extractRes.body.pageCount).toBe(2);

      const outputPath = path.join(config.outputDir, `${extractRes.body.fileId}.pdf`);
      await cleanupFile(outputPath);
    });

    it('rotates pages of a real PDF document', async () => {
      const up = await request(app).post('/api/upload').attach('file', singlePagePdfPath);

      const rotateRes = await request(app)
        .post('/api/pdf/rotate')
        .send({
          fileId: up.body.file.fileId,
          angle: 90,
        });

      expect(rotateRes.status).toBe(200);
      expect(rotateRes.body.success).toBe(true);

      const outputPath = path.join(config.outputDir, `${rotateRes.body.fileId}.pdf`);
      await cleanupFile(outputPath);
    });

    it('adds a watermark to a real PDF document', async () => {
      const up = await request(app).post('/api/upload').attach('file', singlePagePdfPath);

      const waterRes = await request(app)
        .post('/api/pdf/watermark')
        .send({
          fileId: up.body.file.fileId,
          text: 'CONFIDENTIAL',
          opacity: 0.3,
        });

      expect(waterRes.status).toBe(200);
      expect(waterRes.body.success).toBe(true);

      const outputPath = path.join(config.outputDir, `${waterRes.body.fileId}.pdf`);
      await cleanupFile(outputPath);
    });

    it('adds page numbers to a real multi-page PDF', async () => {
      const up = await request(app).post('/api/upload').attach('file', multiPagePdfPath);

      const numRes = await request(app)
        .post('/api/pdf/page-numbers')
        .send({
          fileId: up.body.file.fileId,
          position: 'bottom-center',
          format: 'Page {n} of {total}',
        });

      expect(numRes.status).toBe(200);
      expect(numRes.body.success).toBe(true);

      const outputPath = path.join(config.outputDir, `${numRes.body.fileId}.pdf`);
      await cleanupFile(outputPath);
    });

    it('protects a real PDF with password encryption', async () => {
      const up = await request(app).post('/api/upload').attach('file', singlePagePdfPath);

      const protectRes = await request(app)
        .post('/api/pdf/protect')
        .send({
          fileId: up.body.file.fileId,
          userPassword: 'SecretPassword123',
        });

      expect(protectRes.status).toBe(200);
      expect(protectRes.body.success).toBe(true);

      const outputPath = path.join(config.outputDir, `${protectRes.body.fileId}.pdf`);
      await cleanupFile(outputPath);
    });
  });

  describe('Target Size Adaptive Compressor', () => {
    it('iteratively compresses an image to hit target size ceiling', async () => {
      const up = await request(app).post('/api/upload').attach('file', sampleJpgPath);

      const targetRes = await request(app)
        .post('/api/target/compress')
        .send({
          fileId: up.body.file.fileId,
          targetSizeKB: 20,
          originalName: 'sample.jpg',
          maxIterations: 4,
        });

      expect(targetRes.status).toBe(200);
      expect(targetRes.body.success).toBe(true);
      expect(targetRes.body.iterations).toBeGreaterThanOrEqual(1);

      await cleanupFile(path.join(config.outputDir, `${targetRes.body.fileId}.jpg`));
    });
  });

  describe('Batch Processing Suite', () => {
    it('uploads multiple files and processes them in bulk with ZIP creation', async () => {
      // Multi-upload
      const batchUp = await request(app)
        .post('/api/batch/upload')
        .attach('files', samplePngPath)
        .attach('files', sampleJpgPath);

      expect(batchUp.status).toBe(200);
      expect(batchUp.body.success).toBe(true);
      expect(batchUp.body.files).toHaveLength(2);

      // Process batch
      const batchRes = await request(app)
        .post('/api/batch/process')
        .send({
          items: batchUp.body.files.map((f: any) => ({
            fileId: f.fileId,
            originalName: f.originalName,
          })),
          operation: 'compress-image',
          options: { quality: 70 },
        });

      expect(batchRes.status).toBe(200);
      expect(batchRes.body.success).toBe(true);
      expect(batchRes.body.totalFiles).toBe(2);
      expect(batchRes.body.successCount).toBe(2);
      expect(batchRes.body.zipDownloadUrl).toBeDefined();

      // Verify ZIP download works
      const zipUrl = batchRes.body.zipDownloadUrl;
      const dlRes = await request(app).get(zipUrl);
      expect(dlRes.status).toBe(200);
      expect(dlRes.header['content-type']).toContain('zip');
    });
  });

  describe('Processing Failures & Boundary Safety', () => {
    it('returns clean error for non-existent file ID on processing', async () => {
      const res = await request(app)
        .post('/api/image/compress')
        .send({
          fileId: 'non_existent_file_id_00000',
          quality: 80,
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.body.success).toBe(false);

      // Verify error message has no server filesystem paths
      const bodyStr = JSON.stringify(res.body);
      expect(bodyStr).not.toMatch(/[A-Za-z]:\\[^"'\n\r\t<>]+/);
      expect(bodyStr).not.toContain(config.uploadDir);
    });

    it('returns clean error when splitting with invalid page range', async () => {
      const up = await request(app).post('/api/upload').attach('file', singlePagePdfPath);

      const splitRes = await request(app)
        .post('/api/pdf/split')
        .send({
          fileId: up.body.file.fileId,
          pageRange: '50-60', // Single page only has 1 page
        });

      expect(splitRes.status).toBeGreaterThanOrEqual(400);
      expect(splitRes.body.success).toBe(false);
      expect(splitRes.body.error).toBeDefined();

      await cleanupFile(path.join(config.uploadDir, `${up.body.file.fileId}.pdf`));
    });
  });

  afterAll(async () => {
    // Clean test fixture directory
    if (fs.existsSync(fixtureDir)) {
      await fs.promises.rm(fixtureDir, { recursive: true, force: true }).catch(() => {});
    }

    // Clean any generated output test files
    try {
      if (fs.existsSync(config.outputDir)) {
        const files = await fs.promises.readdir(config.outputDir);
        for (const file of files) {
          if (file !== '.gitkeep') {
            await cleanupFile(path.join(config.outputDir, file));
          }
        }
      }
      if (fs.existsSync(config.uploadDir)) {
        const files = await fs.promises.readdir(config.uploadDir);
        for (const file of files) {
          if (file !== '.gitkeep') {
            await cleanupFile(path.join(config.uploadDir, file));
          }
        }
      }
    } catch {}
  });
});
