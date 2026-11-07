import fs from 'fs';
import path from 'path';
import { findUploadFile, createOutputPath } from './fileStoreService';
import { cleanupFile } from '../utils/cleanup';
import { compressImage } from './imageCompressService';
import { convertImage } from './imageConvertService';
import { compressPdf } from './pdfCompressService';
import { config } from '../config';
import {
  BatchProcessOptions,
  BatchProcessResponse,
  BatchItemResult,
} from './batchTypes';

// Archiver v8
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ZipArchive } = require('archiver');

export const MAX_BATCH_FILES = 15;
export const MAX_BATCH_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

/**
 * Process a batch of files for a specific operation
 */
export const processBatch = async (
  options: BatchProcessOptions
): Promise<BatchProcessResponse> => {
  const startTime = Date.now();
  const { files, operation, quality, preset, targetFormat, mode } = options;

  if (!files || !Array.isArray(files) || files.length === 0) {
    throw new Error('No files provided for batch processing.');
  }

  if (files.length > MAX_BATCH_FILES) {
    throw new Error(`Batch limit exceeded: Maximum ${MAX_BATCH_FILES} files allowed per batch.`);
  }

  // Pre-validate total size of uploaded batch files
  let totalBatchBytes = 0;
  for (const item of files) {
    const p = await findUploadFile(item.fileId);
    if (p && fs.existsSync(p)) {
      const st = await fs.promises.stat(p);
      totalBatchBytes += st.size;
    }
  }

  if (totalBatchBytes > MAX_BATCH_SIZE_BYTES) {
    throw new Error(
      `Batch total size limit exceeded: Maximum 100 MB allowed (batch size is ${(totalBatchBytes / (1024 * 1024)).toFixed(1)} MB).`
    );
  }

  const items: BatchItemResult[] = [];
  let totalOriginal = 0;
  let totalResult = 0;
  let successCount = 0;
  let failureCount = 0;

  for (const item of files) {
    let uploadPath: string | null = null;
    try {
      uploadPath = await findUploadFile(item.fileId);
      if (!uploadPath || !fs.existsSync(uploadPath)) {
        items.push({
          fileId: item.fileId,
          originalName: item.originalName,
          status: 'error',
          error: 'File not found or temporary upload expired.',
        });
        failureCount++;
        continue;
      }

      if (operation === 'compress-image') {
        const compRes = await compressImage(uploadPath, { quality, preset });
        const origSize = compRes.original.size;
        const resSize = compRes.result.size;
        const saved = compRes.savedBytes;
        const redPct = compRes.reductionPercent;

        totalOriginal += origSize;
        totalResult += resSize;
        successCount++;

        items.push({
          fileId: item.fileId,
          originalName: item.originalName,
          status: 'success',
          outputFileId: compRes.outputFileId,
          outputFilename: item.originalName,
          downloadUrl: `/api/download/${compRes.outputFileId}?name=${encodeURIComponent(item.originalName)}`,
          originalSize: origSize,
          resultSize: resSize,
          savedBytes: saved,
          reductionPercent: redPct,
          message: compRes.message,
        });
      } else if (operation === 'convert-image') {
        const rawTarget = targetFormat ? targetFormat.toLowerCase() : 'webp';
        const targetExt = (rawTarget === 'jpeg' ? 'jpg' : rawTarget) as 'jpg' | 'png' | 'webp';
        const convRes = await convertImage(uploadPath, {
          targetFormat: targetExt,
          quality: quality || 80,
        });

        const parsedName = path.parse(item.originalName);
        const convertedFilename = `${parsedName.name}.${targetExt}`;
        const origSize = convRes.original.size;
        const resSize = convRes.result.size;

        totalOriginal += origSize;
        totalResult += resSize;
        successCount++;

        items.push({
          fileId: item.fileId,
          originalName: item.originalName,
          status: 'success',
          outputFileId: convRes.outputFileId,
          outputFilename: convertedFilename,
          downloadUrl: `/api/download/${convRes.outputFileId}?name=${encodeURIComponent(convertedFilename)}`,
          originalSize: origSize,
          resultSize: resSize,
          savedBytes: convRes.savedBytes,
          reductionPercent: convRes.reductionPercent,
          message: `Converted to ${targetExt.toUpperCase()} (${(resSize / 1024).toFixed(1)} KB)`,
        });
      } else if (operation === 'compress-pdf') {
        const pdfRes = await compressPdf({
          fileId: item.fileId,
          mode: mode || 'basic',
          originalName: item.originalName,
        });

        const origSize = pdfRes.originalSize;
        const resSize = pdfRes.resultSize;
        const pdfOutputFilename = item.originalName.toLowerCase().endsWith('.pdf')
          ? item.originalName
          : `${item.originalName}.pdf`;

        totalOriginal += origSize;
        totalResult += resSize;
        successCount++;

        items.push({
          fileId: item.fileId,
          originalName: item.originalName,
          status: 'success',
          outputFileId: pdfRes.fileId,
          outputFilename: pdfOutputFilename,
          downloadUrl: pdfRes.downloadUrl,
          originalSize: origSize,
          resultSize: resSize,
          savedBytes: pdfRes.savedBytes,
          reductionPercent: pdfRes.savedPercentage,
          message: pdfRes.message,
        });
      } else {
        throw new Error(`Unsupported batch operation '${operation}'.`);
      }
    } catch (itemErr: any) {
      failureCount++;
      const rawMsg = itemErr instanceof Error ? itemErr.message : 'Processing failed';
      const cleanMsg = rawMsg.replace(/([A-Za-z]:\\[\w\s.-]+|\/[\w\s.-]+)+/g, '[sanitized_path]');
      items.push({
        fileId: item.fileId,
        originalName: item.originalName,
        status: 'error',
        error: cleanMsg,
      });
    } finally {
      // Ensure input upload is cleaned up
      if (uploadPath) {
        try {
          await cleanupFile(uploadPath);
        } catch {
          // Non-fatal
        }
      }
    }
  }

  // Package successful outputs into a ZIP archive if at least 1 succeeded
  let zipFileId: string | undefined;
  let zipDownloadUrl: string | undefined;

  const successfulItems = items.filter((it) => it.status === 'success' && it.outputFileId);

  if (successfulItems.length > 0) {
    const { outputFileId: zipId, outputPath: zipPath } = createOutputPath('.zip');
    const zipOutputStream = fs.createWriteStream(zipPath);
    const archive = new ZipArchive({ zlib: { level: 6 } });

    await new Promise<void>((resolve, reject) => {
      zipOutputStream.on('close', resolve);
      archive.on('error', reject);
      archive.pipe(zipOutputStream);

      try {
        const usedNames = new Set<string>();
        for (const item of successfulItems) {
          const ext = path.extname(item.outputFilename || '.bin');
          const diskPath = path.join(config.outputDir, `${item.outputFileId}${ext}`);

          if (fs.existsSync(diskPath)) {
            let entryName = item.outputFilename || `${item.outputFileId}${ext}`;
            let counter = 1;
            while (usedNames.has(entryName)) {
              const parsed = path.parse(item.outputFilename || 'file');
              entryName = `${parsed.name}_${counter}${parsed.ext}`;
              counter++;
            }
            usedNames.add(entryName);
            archive.append(fs.createReadStream(diskPath), { name: entryName });
          }
        }
        archive.finalize();
      } catch (zipErr) {
        reject(zipErr);
      }
    });

    zipFileId = zipId;
    const cleanZipName = `batch_${operation}_${Date.now()}.zip`;
    zipDownloadUrl = `/api/download/${zipId}?name=${encodeURIComponent(cleanZipName)}`;
  }

  const totalSaved = Math.max(0, totalOriginal - totalResult);
  const overallReduction = totalOriginal > 0 ? Math.round((totalSaved / totalOriginal) * 100) : 0;
  const processingTimeMs = Date.now() - startTime;

  return {
    success: successCount > 0,
    operation,
    totalFiles: files.length,
    successCount,
    failureCount,
    items,
    zipFileId,
    zipDownloadUrl,
    totalOriginalSize: totalOriginal,
    totalResultSize: totalResult,
    totalSavedBytes: totalSaved,
    overallReductionPercent: overallReduction,
    processingTimeMs,
    message: `Batch processed: ${successCount} successful, ${failureCount} failed.`,
  };
};
