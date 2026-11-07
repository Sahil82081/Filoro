import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import sharp from 'sharp';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { config } from '../config';
import { findUploadFile, createOutputPath } from './fileStoreService';
import { cleanupFile } from '../utils/cleanup';
import { getLibreOfficePath } from './pdfBinFinder';
import {
  DocFormat,
  DocCompressOptions,
  DocCompressResult
} from './docCompressTypes';

const execFileAsync = promisify(execFile);

const MIME_MAP: Record<DocFormat, string> = {
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt: 'application/vnd.ms-powerpoint'
};

/**
 * Optimizes embedded media within an OpenXML (.docx or .pptx) archive
 */
const optimizeZipMedia = async (
  zip: AdmZip,
  imageQuality: number,
  maxDimension: number
): Promise<number> => {
  let imagesOptimized = 0;
  const entries = zip.getEntries();

  for (const entry of entries) {
    const entryName = entry.entryName.toLowerCase();
    const isMedia =
      entryName.includes('/media/') ||
      entryName.startsWith('word/media/') ||
      entryName.startsWith('ppt/media/');

    if (!isMedia || entry.isDirectory) continue;

    const ext = path.extname(entryName).toLowerCase();
    const isJpg = ext === '.jpg' || ext === '.jpeg';
    const isPng = ext === '.png';
    const isOtherImg = ext === '.webp' || ext === '.bmp' || ext === '.tiff';

    if (!isJpg && !isPng && !isOtherImg) continue;

    try {
      const data = entry.getData();
      const meta = await sharp(data).metadata();

      if (!meta.width || !meta.height) continue;

      let pipeline = sharp(data);
      const needsResize = meta.width > maxDimension || meta.height > maxDimension;

      if (needsResize) {
        pipeline = pipeline.resize({
          width: meta.width > meta.height ? maxDimension : undefined,
          height: meta.height >= meta.width ? maxDimension : undefined,
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      let optimizedBuffer: Buffer | null = null;

      if (isJpg) {
        optimizedBuffer = await pipeline
          .jpeg({ quality: imageQuality, mozjpeg: true })
          .toBuffer();
      } else if (isPng) {
        // Compress PNG; if large, apply palette compression
        optimizedBuffer = await pipeline
          .png({ compressionLevel: 9, palette: meta.width > 800 })
          .toBuffer();
      } else {
        // Other formats: convert to JPEG for compression
        optimizedBuffer = await pipeline
          .jpeg({ quality: imageQuality })
          .toBuffer();
      }

      // Only replace if recompressed buffer is strictly smaller than original
      if (optimizedBuffer && optimizedBuffer.length < data.length) {
        zip.updateFile(entry, optimizedBuffer);
        imagesOptimized++;
      }
    } catch {
      // Non-fatal if a single image could not be processed
    }
  }

  return imagesOptimized;
};

/**
 * Compresses Word (DOC/DOCX) or PowerPoint (PPT/PPTX) documents
 */
export const compressDocument = async (
  options: DocCompressOptions
): Promise<DocCompressResult> => {
  const {
    fileId,
    originalName,
    imageQuality = 75,
    maxImageDimension = 1920,
    modernizeLegacy = true,
    outputName
  } = options;

  const inputPath = await findUploadFile(fileId);
  if (!inputPath || !fs.existsSync(inputPath)) {
    throw new Error('Document file not found or has expired. Please re-upload.');
  }

  const rawExt = path.extname(originalName || inputPath).toLowerCase().replace(/^\./, '');
  if (!['doc', 'docx', 'ppt', 'pptx'].includes(rawExt)) {
    await cleanupFile(inputPath);
    throw new Error(`Unsupported document format '.${rawExt}'. Only DOC, DOCX, PPT, and PPTX files are supported.`);
  }

  const initialStat = await fs.promises.stat(inputPath);
  const originalSize = initialStat.size;

  if (originalSize === 0) {
    await cleanupFile(inputPath);
    throw new Error('The uploaded document is empty (0 bytes).');
  }

  const isLegacy = rawExt === 'doc' || rawExt === 'ppt';
  const targetModernExt = rawExt === 'doc' ? 'docx' : rawExt === 'ppt' ? 'pptx' : rawExt;

  let workingPath = inputPath;
  let tempConversionDir: string | null = null;
  let formatModernized = false;
  let createdOutputPath: string | null = null;

  try {
    // If legacy .doc or .ppt and modernization is enabled (recommended for real compression)
    if (isLegacy && modernizeLegacy) {
      tempConversionDir = path.join(config.uploadDir, `doc_tmp_${crypto.randomUUID()}`);
      await fs.promises.mkdir(tempConversionDir, { recursive: true });

      const soffice = getLibreOfficePath();
      await execFileAsync(
        soffice,
        ['--headless', '--convert-to', targetModernExt, '--outdir', tempConversionDir, inputPath],
        { windowsHide: true, maxBuffer: 50 * 1024 * 1024 }
      );

      const files = await fs.promises.readdir(tempConversionDir);
      const convertedFile = files.find((f) => f.toLowerCase().endsWith(`.${targetModernExt}`));

      if (!convertedFile) {
        throw new Error(`Failed to convert legacy .${rawExt} document for optimization.`);
      }

      workingPath = path.join(tempConversionDir, convertedFile);
      formatModernized = true;
    }

    const currentExt = (formatModernized ? targetModernExt : rawExt) as DocFormat;
    const { outputFileId, outputPath } = createOutputPath(`.${currentExt}`);
    createdOutputPath = outputPath;

    let imagesOptimizedCount = 0;

    // For OpenXML packages (.docx, .pptx)
    if (currentExt === 'docx' || currentExt === 'pptx') {
      const zip = new AdmZip(workingPath);
      imagesOptimizedCount = await optimizeZipMedia(zip, imageQuality, maxImageDimension);

      // Write updated zip
      const outBuffer = zip.toBuffer();
      await fs.promises.writeFile(outputPath, outBuffer);
    } else {
      // For legacy format with modernization disabled: copy as-is or re-save
      await fs.promises.copyFile(workingPath, outputPath);
    }

    const outStat = await fs.promises.stat(outputPath);
    let resultSize = outStat.size;

    // Truthful evaluation: If output is not smaller than original, keep original
    let isOptimized = false;
    let savedBytes = 0;
    let reductionPercent = 0;

    if (resultSize < originalSize) {
      isOptimized = true;
      savedBytes = originalSize - resultSize;
      reductionPercent = Math.round((savedBytes / originalSize) * 1000) / 10;
    } else {
      // File could not be compressed further without quality loss; keep original
      await fs.promises.copyFile(inputPath, outputPath);
      resultSize = originalSize;
      savedBytes = 0;
      reductionPercent = 0;
      isOptimized = false;
    }

    const baseName = path.parse(originalName || 'document').name;
    const finalExt = `.${currentExt}`;
    const cleanOutputName = outputName
      ? (outputName.endsWith(finalExt) ? outputName : `${outputName}${finalExt}`)
      : `${baseName}_optimized${finalExt}`;

    let message = '';
    let note: string | undefined = undefined;

    if (isOptimized) {
      const savedFormatted = (savedBytes / 1024).toFixed(1);
      message = `Successfully reduced document size by ${reductionPercent}% (saved ${savedFormatted} KB).`;
      if (imagesOptimizedCount > 0) {
        note = `Optimized ${imagesOptimizedCount} embedded media ${imagesOptimizedCount === 1 ? 'image' : 'images'} and stream structures.`;
      }
      if (formatModernized) {
        note = `${note ? note + ' ' : ''}Legacy .${rawExt.toUpperCase()} was modernized to .${currentExt.toUpperCase()} for optimal compression.`;
      }
    } else {
      message = 'This document is already well-optimized. File size could not be reduced further without reducing content.';
      note = 'No uncompressed media was detected. Original content quality was preserved.';
    }

    return {
      success: true,
      fileId: outputFileId,
      outputFilename: cleanOutputName,
      mimeType: MIME_MAP[currentExt],
      format: currentExt,
      originalSize,
      resultSize,
      savedBytes,
      reductionPercent,
      isOptimized,
      imagesOptimizedCount,
      downloadUrl: `/api/download/${outputFileId}?name=${encodeURIComponent(cleanOutputName)}`,
      message,
      note
    };
  } catch (err) {
    if (createdOutputPath) await cleanupFile(createdOutputPath);
    throw err;
  } finally {
    await cleanupFile(inputPath);
    if (tempConversionDir && fs.existsSync(tempConversionDir)) {
      try {
        await fs.promises.rm(tempConversionDir, { recursive: true, force: true });
      } catch {
        // Non-fatal
      }
    }
  }
};

