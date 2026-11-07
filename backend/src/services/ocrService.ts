import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';
import sharp from 'sharp';
import { createWorker } from 'tesseract.js';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { findUploadFile, createOutputPath } from './fileStoreService';
import { cleanupFile } from '../utils/cleanup';
import { getPdftoppmPath } from './pdfBinFinder';
import { ImageToTextOptions, PdfOcrOptions, OcrResponse, OcrPageResult } from './ocrTypes';

const execFileAsync = promisify(execFile);

export const OCR_ACCURACY_NOTICE =
  'Notice: Optical Character Recognition (OCR) depends on scan clarity, image resolution, contrast, and font types. Extracted text may require manual proofreading and corrections.';

/**
 * Perform OCR on an uploaded image file (JPG, PNG, WebP, etc.)
 */
export const ocrImageToText = async (
  options: ImageToTextOptions
): Promise<OcrResponse> => {
  const startTime = Date.now();
  const { fileId, language = 'eng', preprocess = true, originalName } = options;

  if (!fileId) {
    throw new Error('Missing fileId. Please upload an image first.');
  }

  const uploadPath = await findUploadFile(fileId);
  if (!uploadPath || !fs.existsSync(uploadPath)) {
    throw new Error('Image file not found or has expired. Please re-upload.');
  }

  let worker: any = null;

  try {
    // Read image buffer
    const imgBuffer = await fs.promises.readFile(uploadPath);

    // Validate image format with sharp
    let preparedBuffer = imgBuffer;
    try {
      const meta = await sharp(imgBuffer).metadata();
      if (!meta.format) {
        throw new Error('Invalid image file format.');
      }

      // Preprocessing for improved OCR accuracy if enabled:
      // Convert to grayscale and normalize contrast
      if (preprocess) {
        preparedBuffer = await sharp(imgBuffer)
          .grayscale()
          .normalize()
          .png()
          .toBuffer();
      }
    } catch (sharpErr) {
      throw new Error(`Invalid or corrupt image file: ${sharpErr instanceof Error ? sharpErr.message : 'Cannot process'}`);
    }

    // Initialize Tesseract worker
    worker = await createWorker(language);

    // Run OCR recognition
    const ret = await worker.recognize(preparedBuffer);
    const rawText = ret.data.text ? ret.data.text.trim() : '';
    const confidence = Math.round(ret.data.confidence || 0);

    // Compute word & char metrics
    const words = rawText.length > 0 ? rawText.split(/\s+/).filter(Boolean) : [];
    const wordCount = words.length;
    const characterCount = rawText.length;

    // Generate output .txt file for direct download
    const cleanBaseName = originalName ? path.parse(originalName).name : 'extracted_text';
    const txtFileName = `${cleanBaseName}.txt`;
    const { outputFileId: txtFileId, outputPath: txtOutputPath } = createOutputPath('.txt');
    await fs.promises.writeFile(txtOutputPath, rawText, 'utf-8');

    const processingTimeMs = Date.now() - startTime;

    return {
      success: true,
      tool: 'image-to-text',
      text: rawText || '(No text could be detected in this image. Ensure the image has clear contrast and readable fonts.)',
      confidence,
      wordCount,
      characterCount,
      pageCount: 1,
      textFileId: txtFileId,
      textDownloadUrl: `/api/download/${txtFileId}?name=${encodeURIComponent(txtFileName)}`,
      originalName,
      message: rawText.length > 0
        ? `Successfully recognized ${wordCount} words (${characterCount} characters) with ${confidence}% confidence.`
        : 'No readable text was detected in the uploaded image.',
      accuracyNotice: OCR_ACCURACY_NOTICE,
      processingTimeMs,
    };
  } finally {
    // Always clean up upload file
    await cleanupFile(uploadPath);
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // Non-fatal
      }
    }
  }
};

/**
 * Perform OCR on a scanned PDF document, extracting text or generating a Word DOCX
 */
export const ocrPdf = async (
  options: PdfOcrOptions
): Promise<OcrResponse> => {
  const startTime = Date.now();
  const { fileId, language = 'eng', targetPages, outputFormat = 'text', originalName } = options;

  if (!fileId) {
    throw new Error('Missing fileId. Please upload a PDF document first.');
  }

  const uploadPath = await findUploadFile(fileId);
  if (!uploadPath || !fs.existsSync(uploadPath)) {
    throw new Error('PDF file not found or has expired. Please re-upload.');
  }

  // Validate PDF magic bytes
  const header = Buffer.alloc(5);
  const fd = await fs.promises.open(uploadPath, 'r');
  await fd.read(header, 0, 5, 0);
  await fd.close();
  if (header.toString('ascii') !== '%PDF-') {
    throw new Error('Uploaded file is not a valid PDF document.');
  }

  const pdftoppm = getPdftoppmPath();
  const tempDir = path.join(path.dirname(uploadPath), `pdf_ocr_${crypto.randomUUID()}`);
  await fs.promises.mkdir(tempDir, { recursive: true });

  let worker: any = null;

  try {
    // Render PDF pages into PNG images at 150 DPI
    const prefix = path.join(tempDir, 'page');
    if (targetPages && targetPages.length > 0) {
      for (const p of targetPages) {
        await execFileAsync(
          pdftoppm,
          ['-png', '-r', '150', '-f', String(p), '-l', String(p), uploadPath, `${prefix}_p${p}`],
          { windowsHide: true, maxBuffer: 30 * 1024 * 1024 }
        );
      }
    } else {
      await execFileAsync(
        pdftoppm,
        ['-png', '-r', '150', uploadPath, prefix],
        { windowsHide: true, maxBuffer: 50 * 1024 * 1024 }
      );
    }

    const allFiles = await fs.promises.readdir(tempDir);
    const renderedImages = allFiles
      .filter((f) => f.toLowerCase().endsWith('.png'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      .map((f) => path.join(tempDir, f));

    if (renderedImages.length === 0) {
      throw new Error('Could not render pages from this PDF. The document may be corrupted or password protected.');
    }

    // Safety limit: process up to 20 pages max in one request
    const maxPages = 20;
    const pagesToProcess = renderedImages.slice(0, maxPages);

    // Initialize Tesseract worker once for all pages
    worker = await createWorker(language);

    const pageResults: OcrPageResult[] = [];
    let combinedTextParts: string[] = [];
    let totalConfidence = 0;

    for (let i = 0; i < pagesToProcess.length; i++) {
      const pageImgPath = pagesToProcess[i];
      const pageNum = i + 1;

      // Enhance page image contrast before OCR
      const pageBuffer = await fs.promises.readFile(pageImgPath);
      const preprocessed = await sharp(pageBuffer)
        .grayscale()
        .normalize()
        .png()
        .toBuffer();

      const ret = await worker.recognize(preprocessed);
      const pageText = ret.data.text ? ret.data.text.trim() : '';
      const pageConf = Math.round(ret.data.confidence || 0);

      const words = pageText.length > 0 ? pageText.split(/\s+/).filter(Boolean) : [];
      pageResults.push({
        pageNumber: pageNum,
        text: pageText,
        confidence: pageConf,
        wordCount: words.length,
        charCount: pageText.length,
      });

      totalConfidence += pageConf;

      if (pagesToProcess.length > 1) {
        combinedTextParts.push(`--- Page ${pageNum} ---\n${pageText}`);
      } else {
        combinedTextParts.push(pageText);
      }
    }

    const fullText = combinedTextParts.join('\n\n');
    const avgConfidence = pageResults.length > 0 ? Math.round(totalConfidence / pageResults.length) : 0;
    const allWords = fullText.length > 0 ? fullText.split(/\s+/).filter(Boolean) : [];
    const totalWordCount = allWords.length;
    const totalCharCount = fullText.length;

    // Clean base name for downloads
    const cleanBaseName = originalName ? path.parse(originalName).name : 'scanned_pdf_ocr';

    // 1. Generate .txt file
    const txtFileName = `${cleanBaseName}.txt`;
    const { outputFileId: txtFileId, outputPath: txtOutputPath } = createOutputPath('.txt');
    await fs.promises.writeFile(txtOutputPath, fullText, 'utf-8');

    let docxFileId: string | undefined;
    let docxDownloadUrl: string | undefined;

    // 2. Generate .docx Word document if requested
    if (outputFormat === 'docx') {
      const docxChildren: Paragraph[] = [
        new Paragraph({
          text: 'Fileora OCR Extracted Document',
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Source File: ${originalName || 'Scanned Document'} | Date: ${new Date().toLocaleDateString()}`,
              italics: true,
              color: '666666',
              size: 20, // 10pt
            }),
          ],
          spacing: { after: 400 },
        }),
      ];

      for (const pageRes of pageResults) {
        if (pageResults.length > 1) {
          docxChildren.push(
            new Paragraph({
              text: `Page ${pageRes.pageNumber}`,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 150 },
            })
          );
        }

        const lines = pageRes.text.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.length > 0) {
            docxChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: trimmed,
                    size: 24, // 12pt
                  }),
                ],
                spacing: { after: 100 },
              })
            );
          }
        }
      }

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: docxChildren,
          },
        ],
      });

      const docxBuffer = await Packer.toBuffer(doc);
      const docxFileName = `${cleanBaseName}.docx`;
      const { outputFileId, outputPath } = createOutputPath('.docx');
      await fs.promises.writeFile(outputPath, docxBuffer);
      docxFileId = outputFileId;
      docxDownloadUrl = `/api/download/${outputFileId}?name=${encodeURIComponent(docxFileName)}`;
    }

    const processingTimeMs = Date.now() - startTime;
    const isDocx = outputFormat === 'docx';

    return {
      success: true,
      tool: isDocx ? 'pdf-to-word' : 'pdf-to-text',
      text: fullText || '(No text could be detected in this scanned PDF.)',
      confidence: avgConfidence,
      wordCount: totalWordCount,
      characterCount: totalCharCount,
      pageCount: pageResults.length,
      pages: pageResults,
      textFileId: txtFileId,
      textDownloadUrl: `/api/download/${txtFileId}?name=${encodeURIComponent(txtFileName)}`,
      docxFileId,
      docxDownloadUrl,
      originalName,
      message: `Successfully extracted text from ${pageResults.length} page${pageResults.length > 1 ? 's' : ''} (${totalWordCount} words) with ${avgConfidence}% confidence.`,
      accuracyNotice: OCR_ACCURACY_NOTICE,
      processingTimeMs,
    };
  } finally {
    // Always clean up uploaded PDF file
    await cleanupFile(uploadPath);
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        // Non-fatal
      }
    }
    // Remove temporary rendering directory
    try {
      if (fs.existsSync(tempDir)) {
        await fs.promises.rm(tempDir, { recursive: true, force: true });
      }
    } catch {
      // Non-fatal
    }
  }
};
