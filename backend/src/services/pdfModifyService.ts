import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import {
  PDFDocument,
  rgb,
  degrees,
  StandardFonts,
} from 'pdf-lib';
import sharp from 'sharp';
import { findUploadFile, createOutputPath } from './fileStoreService';
import { cleanupFile } from '../utils/cleanup';
import { getQpdfPath } from './pdfBinFinder';
import {
  CropOptions,
  WatermarkOptions,
  PageNumbersOptions,
  PasswordProtectOptions,
  PdfSignOptions,
  PdfModifyResult,
} from './pdfModifyTypes';

const execFileAsync = promisify(execFile);

/**
 * PDF CROP: Trim or crop page boundaries (CropBox & MediaBox)
 */
export const cropPdf = async (options: CropOptions): Promise<PdfModifyResult> => {
  const { fileId, originalName, top, bottom, left, right, unit = 'points', targetPages } = options;

  if (!fileId) throw new Error('Missing fileId. Please upload a PDF file first.');

  const uploadPath = await findUploadFile(fileId);
  if (!uploadPath || !fs.existsSync(uploadPath)) {
    throw new Error('PDF file not found or has expired. Please re-upload.');
  }

  try {
    const fileBytes = await fs.promises.readFile(uploadPath);
    const pdfDoc = await PDFDocument.load(fileBytes);
    const pages = pdfDoc.getPages();

    if (pages.length === 0) {
      throw new Error('PDF document contains no pages.');
    }

    const pagesToCrop = targetPages && targetPages.length > 0
      ? targetPages.map((p) => p - 1).filter((idx) => idx >= 0 && idx < pages.length)
      : Array.from({ length: pages.length }, (_, i) => i);

    for (const idx of pagesToCrop) {
      const page = pages[idx];
      const { width, height } = page.getSize();

      let leftPts = left;
      let rightPts = right;
      let topPts = top;
      let bottomPts = bottom;

      if (unit === 'percent') {
        leftPts = (left / 100) * width;
        rightPts = (right / 100) * width;
        topPts = (top / 100) * height;
        bottomPts = (bottom / 100) * height;
      }

      const newWidth = width - leftPts - rightPts;
      const newHeight = height - topPts - bottomPts;

      if (newWidth < 10 || newHeight < 10) {
        throw new Error(`Crop margins are too large for page ${idx + 1} (${Math.round(width)}x${Math.round(height)} pt). Resulting page would be less than 10 points.`);
      }

      // Set CropBox and MediaBox to ensure universal viewer support
      page.setCropBox(leftPts, bottomPts, newWidth, newHeight);
      page.setMediaBox(leftPts, bottomPts, newWidth, newHeight);
    }

    const modifiedBytes = await pdfDoc.save();
    const cleanBase = originalName ? path.parse(originalName).name : 'cropped_document';
    const outputFilename = `${cleanBase}_cropped.pdf`;

    const { outputFileId, outputPath } = createOutputPath('.pdf');
    await fs.promises.writeFile(outputPath, modifiedBytes);
    const stat = await fs.promises.stat(outputPath);

    return {
      success: true,
      operation: 'crop',
      fileId: outputFileId,
      outputFilename,
      fileSize: stat.size,
      pageCount: pages.length,
      downloadUrl: `/api/download/${outputFileId}?name=${encodeURIComponent(outputFilename)}`,
      previewUrl: `/api/preview/${outputFileId}`,
      message: `Successfully cropped ${pagesToCrop.length} page${pagesToCrop.length > 1 ? 's' : ''} with clean margins.`,
    };
  } finally {
    await cleanupFile(uploadPath);
  }
};

/**
 * PDF WATERMARK: Add custom watermark text with position and opacity
 */
export const watermarkPdf = async (options: WatermarkOptions): Promise<PdfModifyResult> => {
  const {
    fileId,
    originalName,
    text,
    position = 'center-diagonal',
    opacity = 0.25,
    fontSize,
    color = 'gray',
    targetPages,
  } = options;

  if (!fileId) throw new Error('Missing fileId. Please upload a PDF file first.');
  if (!text || text.trim().length === 0) throw new Error('Watermark text cannot be empty.');

  const uploadPath = await findUploadFile(fileId);
  if (!uploadPath || !fs.existsSync(uploadPath)) {
    throw new Error('PDF file not found or has expired. Please re-upload.');
  }

  try {
    const fileBytes = await fs.promises.readFile(uploadPath);
    const pdfDoc = await PDFDocument.load(fileBytes);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();

    if (pages.length === 0) {
      throw new Error('PDF document contains no pages.');
    }

    // Color mapping
    let textColor = rgb(0.45, 0.45, 0.45); // default gray
    if (color === 'red') textColor = rgb(0.85, 0.2, 0.2);
    else if (color === 'blue') textColor = rgb(0.2, 0.45, 0.85);
    else if (color === 'black') textColor = rgb(0.1, 0.1, 0.1);

    const safeOpacity = Math.min(Math.max(opacity, 0.05), 1.0);

    const pagesToWatermark = targetPages && targetPages.length > 0
      ? targetPages.map((p) => p - 1).filter((idx) => idx >= 0 && idx < pages.length)
      : Array.from({ length: pages.length }, (_, i) => i);

    for (const idx of pagesToWatermark) {
      const page = pages[idx];
      const { width, height } = page.getSize();
      const actualFontSize = fontSize || Math.max(24, Math.min(width, height) / 10);

      const textWidth = font.widthOfTextAtSize(text, actualFontSize);
      const textHeight = font.heightAtSize(actualFontSize);

      if (position === 'center-diagonal') {
        const rad = (45 * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const cx = width / 2;
        const cy = height / 2;

        const x = cx - (textWidth * cos - textHeight * sin) / 2;
        const y = cy - (textWidth * sin + textHeight * cos) / 2;

        page.drawText(text, {
          x,
          y,
          size: actualFontSize,
          font,
          color: textColor,
          opacity: safeOpacity,
          rotate: degrees(45),
        });
      } else if (position === 'center-horizontal') {
        const x = (width - textWidth) / 2;
        const y = (height - textHeight) / 2;
        page.drawText(text, {
          x,
          y,
          size: actualFontSize,
          font,
          color: textColor,
          opacity: safeOpacity,
        });
      } else if (position === 'top') {
        const x = (width - textWidth) / 2;
        const y = height - 40 - textHeight;
        page.drawText(text, {
          x,
          y,
          size: actualFontSize,
          font,
          color: textColor,
          opacity: safeOpacity,
        });
      } else {
        // bottom
        const x = (width - textWidth) / 2;
        const y = 40;
        page.drawText(text, {
          x,
          y,
          size: actualFontSize,
          font,
          color: textColor,
          opacity: safeOpacity,
        });
      }
    }

    const modifiedBytes = await pdfDoc.save();
    const cleanBase = originalName ? path.parse(originalName).name : 'watermarked_document';
    const outputFilename = `${cleanBase}_watermarked.pdf`;

    const { outputFileId, outputPath } = createOutputPath('.pdf');
    await fs.promises.writeFile(outputPath, modifiedBytes);
    const stat = await fs.promises.stat(outputPath);

    return {
      success: true,
      operation: 'watermark',
      fileId: outputFileId,
      outputFilename,
      fileSize: stat.size,
      pageCount: pages.length,
      downloadUrl: `/api/download/${outputFileId}?name=${encodeURIComponent(outputFilename)}`,
      previewUrl: `/api/preview/${outputFileId}`,
      message: `Successfully applied watermark "${text}" across ${pagesToWatermark.length} page${pagesToWatermark.length > 1 ? 's' : ''}.`,
    };
  } finally {
    await cleanupFile(uploadPath);
  }
};

/**
 * PDF PAGE NUMBERS: Add customized page numbers with positioning and formats
 */
export const addPdfPageNumbers = async (options: PageNumbersOptions): Promise<PdfModifyResult> => {
  const {
    fileId,
    originalName,
    position = 'bottom-center',
    format = 'Page {page} of {total}',
    startNumber = 1,
    skipFirstPage = false,
    fontSize = 10,
    color = 'gray',
  } = options;

  if (!fileId) throw new Error('Missing fileId. Please upload a PDF file first.');

  const uploadPath = await findUploadFile(fileId);
  if (!uploadPath || !fs.existsSync(uploadPath)) {
    throw new Error('PDF file not found or has expired. Please re-upload.');
  }

  try {
    const fileBytes = await fs.promises.readFile(uploadPath);
    const pdfDoc = await PDFDocument.load(fileBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();

    if (pages.length === 0) {
      throw new Error('PDF document contains no pages.');
    }

    const textColor = color === 'black' ? rgb(0.1, 0.1, 0.1) : rgb(0.45, 0.45, 0.45);
    const totalPages = pages.length;

    for (let i = 0; i < pages.length; i++) {
      if (skipFirstPage && i === 0) continue;

      const page = pages[i];
      const { width, height } = page.getSize();
      const pageNum = startNumber + i - (skipFirstPage ? 1 : 0);

      const text = format
        .replace('{page}', String(pageNum))
        .replace('{total}', String(totalPages));

      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const textHeight = font.heightAtSize(fontSize);

      let x = 0;
      let y = 0;
      const margin = 28;

      switch (position) {
        case 'bottom-center':
          x = (width - textWidth) / 2;
          y = margin;
          break;
        case 'bottom-right':
          x = width - textWidth - margin;
          y = margin;
          break;
        case 'bottom-left':
          x = margin;
          y = margin;
          break;
        case 'top-center':
          x = (width - textWidth) / 2;
          y = height - margin - textHeight;
          break;
        case 'top-right':
          x = width - textWidth - margin;
          y = height - margin - textHeight;
          break;
      }

      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: textColor,
      });
    }

    const modifiedBytes = await pdfDoc.save();
    const cleanBase = originalName ? path.parse(originalName).name : 'numbered_document';
    const outputFilename = `${cleanBase}_numbered.pdf`;

    const { outputFileId, outputPath } = createOutputPath('.pdf');
    await fs.promises.writeFile(outputPath, modifiedBytes);
    const stat = await fs.promises.stat(outputPath);

    return {
      success: true,
      operation: 'page-numbers',
      fileId: outputFileId,
      outputFilename,
      fileSize: stat.size,
      pageCount: pages.length,
      downloadUrl: `/api/download/${outputFileId}?name=${encodeURIComponent(outputFilename)}`,
      previewUrl: `/api/preview/${outputFileId}`,
      message: `Successfully stamped page numbers on ${pages.length - (skipFirstPage ? 1 : 0)} pages.`,
    };
  } finally {
    await cleanupFile(uploadPath);
  }
};

/**
 * PDF PASSWORD PROTECTION: Encrypt PDF using QPDF 256-bit AES
 * STRICT RULE: Never log password
 */
export const protectPdf = async (options: PasswordProtectOptions): Promise<PdfModifyResult> => {
  const { fileId, originalName, userPassword, ownerPassword } = options;

  if (!fileId) throw new Error('Missing fileId. Please upload a PDF file first.');
  if (!userPassword || userPassword.length === 0) {
    throw new Error('Please enter a password to protect this document.');
  }

  const uploadPath = await findUploadFile(fileId);
  if (!uploadPath || !fs.existsSync(uploadPath)) {
    throw new Error('PDF file not found or has expired. Please re-upload.');
  }

  const qpdf = getQpdfPath();
  const cleanBase = originalName ? path.parse(originalName).name : 'protected_document';
  const outputFilename = `${cleanBase}_protected.pdf`;
  const { outputFileId, outputPath } = createOutputPath('.pdf');

  try {
    const effectiveOwner = ownerPassword && ownerPassword.length > 0 ? ownerPassword : userPassword;

    // Call QPDF with password arguments directly (never logged)
    await execFileAsync(
      qpdf,
      ['--encrypt', userPassword, effectiveOwner, '256', '--', uploadPath, outputPath],
      { windowsHide: true }
    );

    const stat = await fs.promises.stat(outputPath);

    return {
      success: true,
      operation: 'protect',
      fileId: outputFileId,
      outputFilename,
      fileSize: stat.size,
      pageCount: 1,
      isProtected: true,
      downloadUrl: `/api/download/${outputFileId}?name=${encodeURIComponent(outputFilename)}`,
      message: 'PDF successfully encrypted with 256-bit AES password protection.',
    };
  } catch (err) {
    throw new Error('Failed to encrypt PDF document. Ensure the original file is not corrupted.');
  } finally {
    await cleanupFile(uploadPath);
  }
};

/**
 * BASIC PDF SIGNING: Stamp signature (image or formal signature block)
 */
export const signPdf = async (options: PdfSignOptions): Promise<PdfModifyResult> => {
  const {
    fileId,
    originalName,
    signatureType = 'text',
    signerName = 'Authorized Signatory',
    signatureFileId,
    page = 'last',
    position = 'bottom-right',
    signDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    signReason,
  } = options;

  if (!fileId) throw new Error('Missing fileId. Please upload a PDF file first.');

  const uploadPath = await findUploadFile(fileId);
  if (!uploadPath || !fs.existsSync(uploadPath)) {
    throw new Error('PDF file not found or has expired. Please re-upload.');
  }

  let signatureUploadPath: string | null = null;
  if (signatureType === 'image') {
    if (!signatureFileId) {
      throw new Error('Missing signature image. Please upload a signature photo or drawing.');
    }
    signatureUploadPath = await findUploadFile(signatureFileId);
    if (!signatureUploadPath || !fs.existsSync(signatureUploadPath)) {
      throw new Error('Signature image file was not found.');
    }
  }

  try {
    const fileBytes = await fs.promises.readFile(uploadPath);
    const pdfDoc = await PDFDocument.load(fileBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
    const pages = pdfDoc.getPages();

    if (pages.length === 0) {
      throw new Error('PDF document contains no pages.');
    }

    // Determine target page index
    let targetIndices: number[] = [];
    if (page === 'first') {
      targetIndices = [0];
    } else if (page === 'last') {
      targetIndices = [pages.length - 1];
    } else if (page === 'all') {
      targetIndices = pages.map((_, i) => i);
    } else if (typeof page === 'number' && page >= 1 && page <= pages.length) {
      targetIndices = [page - 1];
    } else {
      targetIndices = [pages.length - 1]; // Default to last page
    }

    // If signature image provided, prepare PNG buffer
    let embeddedImg: any = null;
    let imgWidth = 140;
    let imgHeight = 50;

    if (signatureType === 'image' && signatureUploadPath) {
      const rawImg = await fs.promises.readFile(signatureUploadPath);
      const pngBuffer = await sharp(rawImg).png().toBuffer();
      const meta = await sharp(pngBuffer).metadata();
      embeddedImg = await pdfDoc.embedPng(pngBuffer);

      const origW = meta.width || 140;
      const origH = meta.height || 50;
      const scale = Math.min(140 / origW, 55 / origH, 1);
      imgWidth = Math.round(origW * scale);
      imgHeight = Math.round(origH * scale);
    }

    for (const idx of targetIndices) {
      const targetPage = pages[idx];
      const { width, height } = targetPage.getSize();

      let x = width - 180;
      let y = 60;

      if (position === 'bottom-left') {
        x = 45;
        y = 60;
      } else if (position === 'center') {
        x = (width - 160) / 2;
        y = (height - 80) / 2;
      } else if (position === 'top-right') {
        x = width - 180;
        y = height - 120;
      }

      if (signatureType === 'image' && embeddedImg) {
        // Draw embedded image signature
        targetPage.drawImage(embeddedImg, {
          x,
          y: y + 20,
          width: imgWidth,
          height: imgHeight,
        });

        // Draw signature line beneath
        targetPage.drawLine({
          start: { x, y: y + 16 },
          end: { x: x + Math.max(imgWidth, 140), y: y + 16 },
          thickness: 0.75,
          color: rgb(0.2, 0.2, 0.2),
        });

        // Draw metadata
        const labelText = `Signed by: ${signerName}`;
        targetPage.drawText(labelText, {
          x,
          y: y + 4,
          size: 8,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });

        const dateText = `Date: ${signDate}${signReason ? ` • ${signReason}` : ''}`;
        targetPage.drawText(dateText, {
          x,
          y: y - 6,
          size: 7,
          font,
          color: rgb(0.45, 0.45, 0.45),
        });
      } else {
        // Text-based formal signature block
        const sigName = signerName.trim() || 'Authorized Signatory';
        const nameWidth = fontItalic.widthOfTextAtSize(sigName, 18);
        const lineWidth = Math.max(nameWidth + 20, 150);

        // Script-style signature name
        targetPage.drawText(sigName, {
          x,
          y: y + 22,
          size: 18,
          font: fontItalic,
          color: rgb(0.05, 0.15, 0.5), // Subtle blue pen ink color
        });

        // Signature line
        targetPage.drawLine({
          start: { x, y: y + 16 },
          end: { x: x + lineWidth, y: y + 16 },
          thickness: 0.75,
          color: rgb(0.2, 0.2, 0.2),
        });

        // Signer caption
        targetPage.drawText(`Digitally Signed by: ${sigName}`, {
          x,
          y: y + 4,
          size: 8,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });

        // Date & Reason
        const caption = `Date: ${signDate}${signReason ? ` | ${signReason}` : ''}`;
        targetPage.drawText(caption, {
          x,
          y: y - 6,
          size: 7,
          font,
          color: rgb(0.45, 0.45, 0.45),
        });
      }
    }

    const modifiedBytes = await pdfDoc.save();
    const cleanBase = originalName ? path.parse(originalName).name : 'signed_document';
    const outputFilename = `${cleanBase}_signed.pdf`;

    const { outputFileId, outputPath } = createOutputPath('.pdf');
    await fs.promises.writeFile(outputPath, modifiedBytes);
    const stat = await fs.promises.stat(outputPath);

    return {
      success: true,
      operation: 'sign',
      fileId: outputFileId,
      outputFilename,
      fileSize: stat.size,
      pageCount: pages.length,
      downloadUrl: `/api/download/${outputFileId}?name=${encodeURIComponent(outputFilename)}`,
      previewUrl: `/api/preview/${outputFileId}`,
      message: `Successfully stamped signature on page ${targetIndices.map((n) => n + 1).join(', ')}.`,
    };
  } finally {
    await cleanupFile(uploadPath);
    if (signatureUploadPath) {
      await cleanupFile(signatureUploadPath);
    }
  }
};

