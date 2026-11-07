import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { findUploadFile, createOutputPath } from './fileStoreService';
import { cleanupFile } from '../utils/cleanup';
import { getQpdfPath, getGhostscriptPath } from './pdfBinFinder';
import { PdfCompressOptions, PdfCompressResult } from './pdfTypes';

const execFileAsync = promisify(execFile);

/**
 * Validates a PDF file before attempting compression:
 * 1. Checks file existence & non-empty size
 * 2. Checks magic bytes for %PDF-
 * 3. Runs qpdf --check to inspect structural integrity and detect password encryption
 */
export const validatePdfFile = async (
  filePath: string
): Promise<{ valid: boolean; error?: string; isEncrypted?: boolean }> => {
  if (!fs.existsSync(filePath)) {
    return { valid: false, error: 'PDF file was not found on the server.' };
  }

  const stat = await fs.promises.stat(filePath);
  if (stat.size === 0) {
    return { valid: false, error: 'The uploaded file is empty (0 bytes).' };
  }

  // Check magic bytes
  const fd = await fs.promises.open(filePath, 'r');
  const magic = Buffer.alloc(8);
  await fd.read(magic, 0, 8, 0);
  await fd.close();

  if (!magic.toString('utf-8').startsWith('%PDF-')) {
    return {
      valid: false,
      error: 'The uploaded file does not have a valid PDF header (%PDF-).'
    };
  }

  // Run qpdf --check
  const qpdfBin = getQpdfPath();
  try {
    await execFileAsync(qpdfBin, ['--check', filePath], {
      windowsHide: true,
      maxBuffer: 10 * 1024 * 1024
    });
    return { valid: true };
  } catch (err: any) {
    const stderr = (err?.stderr || '').toString().toLowerCase();
    const stdout = (err?.stdout || '').toString().toLowerCase();
    const combined = `${stderr} ${stdout}`;

    // Exit code 3 means warnings only - qpdf can still process it
    if (err.code === 3) {
      return { valid: true };
    }

    if (
      combined.includes('invalid password') ||
      combined.includes('password required') ||
      combined.includes('is encrypted')
    ) {
      return {
        valid: false,
        isEncrypted: true,
        error: 'This PDF is password-protected. Please remove the password before compressing.'
      };
    }

    if (
      combined.includes('unable to find trailer') ||
      combined.includes('file is damaged') ||
      combined.includes('damaged file') ||
      combined.includes('corrupt')
    ) {
      return {
        valid: false,
        error: 'The PDF file appears to be corrupted or damaged and cannot be safely processed.'
      };
    }

    return {
      valid: false,
      error: 'The PDF document structure could not be parsed. Please verify the file and try again.'
    };
  }
};

/**
 * Runs QPDF with the specified argument array
 */
const runQpdf = async (args: string[]): Promise<void> => {
  const qpdfBin = getQpdfPath();
  try {
    await execFileAsync(qpdfBin, args, {
      windowsHide: true,
      maxBuffer: 20 * 1024 * 1024
    });
  } catch (err: any) {
    // Exit code 3 indicates warnings were produced but the output was still written
    if (err.code === 3) {
      return;
    }
    throw err;
  }
};

/**
 * Executes PDF compression using QPDF (and Ghostscript if available)
 */
export const compressPdf = async (
  options: PdfCompressOptions
): Promise<PdfCompressResult> => {
  const { fileId, mode, targetSizeKB, originalName } = options;

  const inputPath = await findUploadFile(fileId);
  if (!inputPath || !fs.existsSync(inputPath)) {
    throw new Error('Uploaded PDF file not found or has expired. Please re-upload.');
  }

  const initialStat = await fs.promises.stat(inputPath);
  const originalSize = initialStat.size;

  // Validate PDF integrity
  const validation = await validatePdfFile(inputPath);
  if (!validation.valid) {
    // Delete invalid uploaded file
    await cleanupFile(inputPath);
    throw new Error(validation.error || 'Invalid or corrupted PDF file.');
  }

  const { outputFileId, outputPath } = createOutputPath('.pdf');

  try {
    let engineUsed = 'qpdf';
    let targetReached: boolean | undefined = undefined;
    let customMessage: string | undefined = undefined;

  const gsBin = getGhostscriptPath();

  if (mode === 'basic') {
    // Basic Mode:
    // Flate recompression, stream compression, object streams, linearization, moderate image quality (85)
    await runQpdf([
      '--compress-streams=y',
      '--recompress-flate',
      '--compression-level=9',
      '--object-streams=generate',
      '--linearize',
      '--optimize-images',
      '--jpeg-quality=85',
      '--warning-exit-0',
      inputPath,
      outputPath
    ]);
  } else if (mode === 'strong') {
    // Strong Mode:
    // Aggressive JPEG quality (40), remove unreferenced resources, coalesce contents, maximum stream packing
    if (gsBin) {
      // If Ghostscript is present, run Ghostscript /screen downsample first, then QPDF linearize
      const tempGsPath = `${outputPath}.gs.pdf`;
      try {
        await execFileAsync(
          gsBin,
          [
            '-sDEVICE=pdfwrite',
            '-dCompatibilityLevel=1.4',
            '-dPDFSETTINGS=/screen',
            '-dNOPAUSE',
            '-dQUIET',
            '-dBATCH',
            `-sOutputFile=${tempGsPath}`,
            inputPath
          ],
          { windowsHide: true, maxBuffer: 20 * 1024 * 1024 }
        );
        await runQpdf([
          '--compress-streams=y',
          '--object-streams=generate',
          '--linearize',
          '--warning-exit-0',
          tempGsPath,
          outputPath
        ]);
        engineUsed = 'ghostscript+qpdf';
        await cleanupFile(tempGsPath);
      } catch {
        // Fallback to pure QPDF strong mode if Ghostscript encounters an issue
        await runQpdf([
          '--compress-streams=y',
          '--recompress-flate',
          '--compression-level=9',
          '--object-streams=generate',
          '--linearize',
          '--coalesce-contents',
          '--remove-unreferenced-resources=yes',
          '--optimize-images',
          '--jpeg-quality=40',
          '--warning-exit-0',
          inputPath,
          outputPath
        ]);
      }
    } else {
      await runQpdf([
        '--compress-streams=y',
        '--recompress-flate',
        '--compression-level=9',
        '--object-streams=generate',
        '--linearize',
        '--coalesce-contents',
        '--remove-unreferenced-resources=yes',
        '--optimize-images',
        '--jpeg-quality=40',
        '--warning-exit-0',
        inputPath,
        outputPath
      ]);
    }
  } else if (mode === 'target') {
    // Target Size Mode:
    const targetSizeBytes = Math.max(10 * 1024, (targetSizeKB || 500) * 1024);

    if (targetSizeBytes >= originalSize) {
      // File is already smaller than or equal to target
      await runQpdf([
        '--compress-streams=y',
        '--recompress-flate',
        '--compression-level=9',
        '--object-streams=generate',
        '--linearize',
        '--optimize-images',
        '--jpeg-quality=85',
        '--warning-exit-0',
        inputPath,
        outputPath
      ]);
      targetReached = true;
      customMessage = `Document was already within your target size of ${targetSizeKB} KB.`;
    } else {
      // Iterative compression stepping through image qualities
      const qualitySteps = [80, 60, 45, 30, 20, 10];
      let bestPath: string | null = null;
      let bestSize = Infinity;
      const tempCandidates: string[] = [];

      for (const quality of qualitySteps) {
        const candidatePath = `${outputPath}.step${quality}.pdf`;
        tempCandidates.push(candidatePath);

        try {
          await runQpdf([
            '--compress-streams=y',
            '--recompress-flate',
            '--compression-level=9',
            '--object-streams=generate',
            '--linearize',
            '--coalesce-contents',
            '--remove-unreferenced-resources=yes',
            '--optimize-images',
            `--jpeg-quality=${quality}`,
            '--warning-exit-0',
            inputPath,
            candidatePath
          ]);

          if (fs.existsSync(candidatePath)) {
            const candStat = await fs.promises.stat(candidatePath);
            if (candStat.size < bestSize) {
              bestSize = candStat.size;
              bestPath = candidatePath;
            }

            if (candStat.size <= targetSizeBytes) {
              targetReached = true;
              break;
            }
          }
        } catch {
          // Continue to next quality step if an error occurred on this candidate
        }
      }

      if (bestPath && fs.existsSync(bestPath)) {
        await fs.promises.copyFile(bestPath, outputPath);
      } else {
        // Fallback to basic compression
        await runQpdf([
          '--compress-streams=y',
          '--recompress-flate',
          '--compression-level=9',
          '--object-streams=generate',
          '--linearize',
          '--warning-exit-0',
          inputPath,
          outputPath
        ]);
      }

      // Cleanup trial files
      for (const tempFile of tempCandidates) {
        await cleanupFile(tempFile);
      }

      const finalCheckStat = await fs.promises.stat(outputPath);
      if (targetReached === undefined) {
        targetReached = finalCheckStat.size <= targetSizeBytes;
      }

      if (targetReached) {
        customMessage = `Successfully compressed to meet your target of ${targetSizeKB} KB.`;
      } else {
        const finalKB = (finalCheckStat.size / 1024).toFixed(1);
        customMessage = `Achieved closest possible size of ${finalKB} KB (Target: ${targetSizeKB} KB).`;
      }
    }
  }

  // Verify output was created and is non-empty
  if (!fs.existsSync(outputPath)) {
    throw new Error('PDF compression failed to produce an output document.');
  }

  let finalStat = await fs.promises.stat(outputPath);
  let resultSize = finalStat.size;

  // If output size is slightly larger than original (already compressed file)
  if (resultSize > originalSize) {
    // Retain original file content so size never inflates
    await fs.promises.copyFile(inputPath, outputPath);
    finalStat = await fs.promises.stat(outputPath);
    resultSize = originalSize;
    customMessage = customMessage || 'This PDF is already highly optimized. Original size maintained.';
  }

  const savedBytes = Math.max(0, originalSize - resultSize);
  const savedPercentage = originalSize > 0 ? Number(((savedBytes / originalSize) * 100).toFixed(1)) : 0;

    const cleanOriginalName = originalName || 'document.pdf';
    const downloadUrl = `/api/download/${outputFileId}?name=${encodeURIComponent(cleanOriginalName)}`;
    const previewUrl = `/api/preview/${outputFileId}`;

    return {
      success: true,
      fileId: outputFileId,
      originalName: cleanOriginalName,
      originalSize,
      resultSize,
      savedBytes,
      savedPercentage,
      mode,
      targetSizeKB: mode === 'target' ? targetSizeKB : undefined,
      targetReached,
      downloadUrl,
      previewUrl,
      engineUsed,
      message: customMessage
    };
  } catch (err) {
    await cleanupFile(outputPath);
    throw err;
  } finally {
    await cleanupFile(inputPath);
  }
};

