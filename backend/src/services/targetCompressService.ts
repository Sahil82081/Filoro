import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import { findUploadFile, createOutputPath } from './fileStoreService';
import { cleanupFile } from '../utils/cleanup';
import { getQpdfPath, getGhostscriptPath, getPdftoppmPath } from './pdfBinFinder';
import { validatePdfFile } from './pdfCompressService';
import { TargetCompressOptions, TargetCompressResult } from './targetTypes';

const execFileAsync = promisify(execFile);

/**
 * Format bytes to readable string (e.g. 5 MB, 500 KB)
 */
export const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const safeI = Math.min(i, sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, safeI)).toFixed(1))} ${sizes[safeI]}`;
};

/**
 * Executes a single QPDF run with specified quality and flags
 */
const runQpdfTrial = async (
  qpdfBin: string,
  inputPath: string,
  outputPath: string,
  jpegQuality: number
): Promise<number> => {
  try {
    await execFileAsync(
      qpdfBin,
      [
        '--compress-streams=y',
        '--recompress-flate',
        '--compression-level=9',
        '--object-streams=generate',
        '--linearize',
        '--coalesce-contents',
        '--remove-unreferenced-resources=yes',
        '--optimize-images',
        `--jpeg-quality=${jpegQuality}`,
        '--warning-exit-0',
        inputPath,
        outputPath
      ],
      {
        windowsHide: true,
        maxBuffer: 25 * 1024 * 1024
      }
    );

    if (fs.existsSync(outputPath)) {
      const stat = await fs.promises.stat(outputPath);
      return stat.size;
    }
  } catch (err: any) {
    if (err.code === 3 && fs.existsSync(outputPath)) {
      const stat = await fs.promises.stat(outputPath);
      return stat.size;
    }
  }
  return Infinity;
};

/**
 * Executes Ghostscript downsample trial if GS is available
 */
const runGsTrial = async (
  gsBin: string,
  qpdfBin: string,
  inputPath: string,
  outputPath: string,
  pdfSettings: '/ebook' | '/screen',
  dpi?: number
): Promise<number> => {
  const tempGsPath = `${outputPath}.gs_temp.pdf`;
  try {
    const args = [
      '-sDEVICE=pdfwrite',
      '-dCompatibilityLevel=1.4',
      `-dPDFSETTINGS=${pdfSettings}`,
      '-dNOPAUSE',
      '-dQUIET',
      '-dBATCH',
      '-dDownsampleColorImages=true',
      '-dDownsampleGrayImages=true',
      '-dDownsampleMonoImages=true',
    ];
    if (dpi) {
      args.push(
        `-dColorImageResolution=${dpi}`,
        `-dGrayImageResolution=${dpi}`,
        `-dMonoImageResolution=${dpi}`
      );
    }
    args.push(`-sOutputFile=${tempGsPath}`, inputPath);

    await execFileAsync(gsBin, args, { windowsHide: true, maxBuffer: 25 * 1024 * 1024 });

    if (fs.existsSync(tempGsPath)) {
      await execFileAsync(
        qpdfBin,
        [
          '--compress-streams=y',
          '--recompress-flate',
          '--compression-level=9',
          '--object-streams=generate',
          '--linearize',
          '--warning-exit-0',
          tempGsPath,
          outputPath
        ],
        { windowsHide: true, maxBuffer: 25 * 1024 * 1024 }
      );
      if (fs.existsSync(outputPath)) {
        const stat = await fs.promises.stat(outputPath);
        return stat.size;
      }
    }
  } catch {
    // Non-fatal, return Infinity
  } finally {
    await cleanupFile(tempGsPath);
  }
  return Infinity;
};

/**
 * Executes deep adaptive rasterization using pdftoppm + sharp + pdf-lib
 * Handles PDFs with heavy vector drawings or complex page streams that
 * standard structural compression cannot reduce beneath the target ceiling.
 */
const runRasterPdfTrial = async (
  pdftoppmBin: string,
  qpdfBin: string,
  inputPath: string,
  outputPath: string,
  dpi: number,
  jpegQuality: number
): Promise<number> => {
  const tempPrefix = `${outputPath}.raster_tmp`;
  const tempFilesToClean: string[] = [];

  try {
    await execFileAsync(
      pdftoppmBin,
      ['-jpeg', '-r', dpi.toString(), inputPath, tempPrefix],
      { windowsHide: true, maxBuffer: 25 * 1024 * 1024 }
    );

    const dir = path.dirname(outputPath);
    const prefixBase = path.basename(tempPrefix);
    const files = (await fs.promises.readdir(dir))
      .filter((f) => f.startsWith(`${prefixBase}-`) && f.endsWith('.jpg'))
      .sort((a, b) => {
        const numA = parseInt(a.replace(`${prefixBase}-`, '').replace('.jpg', ''), 10);
        const numB = parseInt(b.replace(`${prefixBase}-`, '').replace('.jpg', ''), 10);
        return numA - numB;
      });

    if (files.length === 0) return Infinity;

    const newPdf = await PDFDocument.create();

    for (const f of files) {
      const pagePath = path.join(dir, f);
      tempFilesToClean.push(pagePath);

      const imgBuffer = await sharp(pagePath)
        .jpeg({ quality: jpegQuality, mozjpeg: true })
        .toBuffer();

      const embeddedImg = await newPdf.embedJpg(imgBuffer);
      const page = newPdf.addPage([embeddedImg.width, embeddedImg.height]);
      page.drawImage(embeddedImg, {
        x: 0,
        y: 0,
        width: embeddedImg.width,
        height: embeddedImg.height,
      });
    }

    const unoptimizedPdfBytes = await newPdf.save({ useObjectStreams: true });
    await fs.promises.writeFile(outputPath, unoptimizedPdfBytes);

    const tempFinalQpdf = `${outputPath}.packed.pdf`;
    tempFilesToClean.push(tempFinalQpdf);
    try {
      await execFileAsync(
        qpdfBin,
        [
          '--compress-streams=y',
          '--recompress-flate',
          '--compression-level=9',
          '--object-streams=generate',
          '--linearize',
          '--warning-exit-0',
          outputPath,
          tempFinalQpdf
        ],
        { windowsHide: true, maxBuffer: 25 * 1024 * 1024 }
      );
      if (fs.existsSync(tempFinalQpdf)) {
        await fs.promises.copyFile(tempFinalQpdf, outputPath);
      }
    } catch {
      // non-fatal
    }

    if (fs.existsSync(outputPath)) {
      const stat = await fs.promises.stat(outputPath);
      return stat.size;
    }
  } catch (err) {
    console.warn('[Raster PDF Trial Warning]:', err);
  } finally {
    for (const f of tempFilesToClean) {
      await cleanupFile(f);
    }
  }
  return Infinity;
};

/**
 * Multi-Tier Iterative PDF Target-Size Compression Engine
 */
async function compressPdfToTarget(
  inputPath: string,
  outputPath: string,
  targetSizeBytes: number,
  originalSize: number,
  maxIterations: number = 5
): Promise<{
  targetReached: boolean;
  iterations: number;
  message: string;
  resultSize: number;
  engineUsed: string;
}> {
  const qpdfBin = getQpdfPath();
  const gsBin = getGhostscriptPath();
  const pdftoppmBin = getPdftoppmPath();
  const trialFiles: string[] = [];

  let iterations = 0;
  let targetReached = false;
  let bestCandidatePath: string | null = null;
  let bestCandidateSize = Infinity;
  let bestValidPath: string | null = null;
  let engineUsed = 'qpdf (iterative adaptive)';

  try {
    // If original file is already smaller than or equal to target
    if (originalSize <= targetSizeBytes) {
      iterations++;
      const size = await runQpdfTrial(qpdfBin, inputPath, outputPath, 85);
      return {
        targetReached: true,
        iterations,
        resultSize: size < Infinity ? size : originalSize,
        engineUsed: 'qpdf (lossless stream optimize)',
        message: `Original document (${formatSize(originalSize)}) is already within your target of ${formatSize(targetSizeBytes)}.`
      };
    }

    // ====================================================
    // STAGE 1: Bounded Structural QPDF Optimization
    // ====================================================
    iterations++;
    const trial1Path = `${outputPath}.trial${iterations}.pdf`;
    trialFiles.push(trial1Path);
    const size1 = await runQpdfTrial(qpdfBin, inputPath, trial1Path, 80);

    if (size1 < bestCandidateSize) {
      bestCandidateSize = size1;
      bestCandidatePath = trial1Path;
    }

    if (size1 <= targetSizeBytes) {
      targetReached = true;
      bestValidPath = trial1Path;
    } else {
      // Probe at Q=15
      iterations++;
      const trial2Path = `${outputPath}.trial${iterations}.pdf`;
      trialFiles.push(trial2Path);
      const size2 = await runQpdfTrial(qpdfBin, inputPath, trial2Path, 15);

      if (size2 < bestCandidateSize) {
        bestCandidateSize = size2;
        bestCandidatePath = trial2Path;
      }

      if (size2 <= targetSizeBytes) {
        targetReached = true;
        bestValidPath = trial2Path;
      }
    }

    // ====================================================
    // STAGE 2: Ghostscript Resampling (if available)
    // ====================================================
    if (!targetReached && gsBin) {
      iterations++;
      const trialGsPath = `${outputPath}.gs_ebook.pdf`;
      trialFiles.push(trialGsPath);
      const gsSize = await runGsTrial(gsBin, qpdfBin, inputPath, trialGsPath, '/screen', 72);

      if (gsSize < bestCandidateSize) {
        bestCandidateSize = gsSize;
        bestCandidatePath = trialGsPath;
      }

      if (gsSize <= targetSizeBytes) {
        targetReached = true;
        bestValidPath = trialGsPath;
        engineUsed = 'ghostscript (downsample /screen)';
      }
    }

    // ====================================================
    // STAGE 3: Adaptive Deep Content Resampling (Poppler + Sharp)
    // Invoked when PDF contains complex vector streams, CAD lines,
    // or uncompressible tables that QPDF cannot shrink below the target.
    // ====================================================
    if (!targetReached && pdftoppmBin) {
      let pageCount = 1;
      try {
        const bytes = await fs.promises.readFile(inputPath);
        const doc = await PDFDocument.load(bytes);
        pageCount = Math.max(1, doc.getPageCount());
      } catch {
        pageCount = 1;
      }

      const budgetPerPage = Math.floor((targetSizeBytes - 2048) / pageCount);

      // Determine starting DPI and quality based on byte budget per page
      let dpi = 72;
      let q = 35;

      if (budgetPerPage >= 45 * 1024) {
        dpi = 96;
        q = 50;
      } else if (budgetPerPage >= 25 * 1024) {
        dpi = 72;
        q = 35;
      } else if (budgetPerPage >= 12 * 1024) {
        dpi = 60;
        q = 25;
      } else {
        dpi = 50;
        q = 20;
      }

      // Adaptive Trial 1
      iterations++;
      const rasterTrial1 = `${outputPath}.raster1.pdf`;
      trialFiles.push(rasterTrial1);
      const rasterSize1 = await runRasterPdfTrial(pdftoppmBin, qpdfBin, inputPath, rasterTrial1, dpi, q);

      if (rasterSize1 < bestCandidateSize) {
        bestCandidateSize = rasterSize1;
        bestCandidatePath = rasterTrial1;
      }

      if (rasterSize1 <= targetSizeBytes) {
        targetReached = true;
        bestValidPath = rasterTrial1;
        engineUsed = 'adaptive content compression (pdftoppm + sharp)';
      } else if (iterations < maxIterations) {
        // Adaptive Trial 2: Further downsample DPI & Quality to strictly reach ceiling
        iterations++;
        const targetDpi2 = Math.max(45, Math.floor(dpi * 0.8));
        const targetQ2 = Math.max(15, q - 7);
        const rasterTrial2 = `${outputPath}.raster2.pdf`;
        trialFiles.push(rasterTrial2);
        const rasterSize2 = await runRasterPdfTrial(
          pdftoppmBin,
          qpdfBin,
          inputPath,
          rasterTrial2,
          targetDpi2,
          targetQ2
        );

        if (rasterSize2 < bestCandidateSize) {
          bestCandidateSize = rasterSize2;
          bestCandidatePath = rasterTrial2;
        }

        if (rasterSize2 <= targetSizeBytes) {
          targetReached = true;
          bestValidPath = rasterTrial2;
          engineUsed = 'adaptive content compression (pdftoppm + sharp)';
        }
      }
    }

    // Choose final file: prefer best valid under target; fallback to closest candidate
    const finalSelectedPath = targetReached && bestValidPath ? bestValidPath : bestCandidatePath;
    if (finalSelectedPath && fs.existsSync(finalSelectedPath)) {
      await fs.promises.copyFile(finalSelectedPath, outputPath);
    } else {
      await runQpdfTrial(qpdfBin, inputPath, outputPath, 20);
    }

    const finalStat = await fs.promises.stat(outputPath);
    const finalSize = finalStat.size;
    targetReached = finalSize <= targetSizeBytes;

    let message: string;
    if (targetReached) {
      message = `Successfully reduced PDF to ${formatSize(finalSize)}, meeting your target ceiling of ${formatSize(targetSizeBytes)}.`;
    } else {
      message = `Target of ${formatSize(targetSizeBytes)} could not be fully reached. Achieved closest possible valid size of ${formatSize(finalSize)} while preserving document readability.`;
    }

    return {
      targetReached,
      iterations,
      resultSize: finalSize,
      engineUsed,
      message
    };
  } finally {
    for (const f of trialFiles) {
      await cleanupFile(f);
    }
  }
}

/**
 * Iterative Image Target-Size Compression Engine (Sharp)
 */
async function compressImageToTarget(
  inputPath: string,
  outputPath: string,
  targetSizeBytes: number,
  originalSize: number,
  maxIterations: number = 5
): Promise<{
  targetReached: boolean;
  iterations: number;
  message: string;
  resultSize: number;
  engineUsed: string;
}> {
  let iterations = 0;
  const trialFiles: string[] = [];

  try {
    if (originalSize <= targetSizeBytes) {
      iterations++;
      await sharp(inputPath).jpeg({ quality: 90 }).toFile(outputPath);
      const stat = await fs.promises.stat(outputPath);
      return {
        targetReached: true,
        iterations,
        resultSize: stat.size,
        engineUsed: 'sharp (mozjpeg lossless)',
        message: `Original image (${formatSize(originalSize)}) is already within target of ${formatSize(targetSizeBytes)}.`
      };
    }

    let lowQ = 10;
    let highQ = 90;
    let bestValidPath: string | null = null;
    let bestCandidatePath: string | null = null;
    let bestCandidateSize = Infinity;

    while (lowQ <= highQ && iterations < maxIterations) {
      iterations++;
      const currentQ = Math.round((lowQ + highQ) / 2);
      const trialPath = `${outputPath}.img_trial${iterations}.jpg`;
      trialFiles.push(trialPath);

      await sharp(inputPath)
        .jpeg({ quality: currentQ, mozjpeg: true })
        .toFile(trialPath);

      const stat = await fs.promises.stat(trialPath);
      const size = stat.size;

      if (size < bestCandidateSize) {
        bestCandidateSize = size;
        bestCandidatePath = trialPath;
      }

      if (size <= targetSizeBytes) {
        bestValidPath = trialPath;
        lowQ = currentQ + 1;
      } else {
        highQ = currentQ - 1;
      }
    }

    // If even Q=10 was too large, downscale dimensions
    if (!bestValidPath && iterations < maxIterations) {
      iterations++;
      const metadata = await sharp(inputPath).metadata();
      const currentWidth = metadata.width || 1200;
      const scaleFactor = Math.min(0.8, Math.sqrt(targetSizeBytes / bestCandidateSize));
      const newWidth = Math.max(200, Math.round(currentWidth * scaleFactor));

      const downscalePath = `${outputPath}.downscale.jpg`;
      trialFiles.push(downscalePath);

      await sharp(inputPath)
        .resize({ width: newWidth, withoutEnlargement: true })
        .jpeg({ quality: 60, mozjpeg: true })
        .toFile(downscalePath);

      const downscaleStat = await fs.promises.stat(downscalePath);
      if (downscaleStat.size <= targetSizeBytes) {
        bestValidPath = downscalePath;
      } else if (downscaleStat.size < bestCandidateSize) {
        bestCandidateSize = downscaleStat.size;
        bestCandidatePath = downscalePath;
      }
    }

    const finalPath = bestValidPath || bestCandidatePath;
    if (finalPath && fs.existsSync(finalPath)) {
      await fs.promises.copyFile(finalPath, outputPath);
    } else {
      await sharp(inputPath).jpeg({ quality: 30 }).toFile(outputPath);
    }

    const finalStat = await fs.promises.stat(outputPath);
    const finalSize = finalStat.size;
    const targetReached = finalSize <= targetSizeBytes;

    let message: string;
    if (targetReached) {
      message = `Successfully reduced image to ${formatSize(finalSize)}, meeting target of ${formatSize(targetSizeBytes)}.`;
    } else {
      message = `Target of ${formatSize(targetSizeBytes)} could not be reached. Achieved closest valid size of ${formatSize(finalSize)}.`;
    }

    return {
      targetReached,
      iterations,
      resultSize: finalSize,
      engineUsed: 'sharp (iterative mozjpeg)',
      message
    };
  } finally {
    for (const f of trialFiles) {
      await cleanupFile(f);
    }
  }
}

/**
 * Universal Target-Size Compression Service Entrypoint
 */
export const compressTargetFile = async (
  options: TargetCompressOptions
): Promise<TargetCompressResult> => {
  const startTime = Date.now();
  const { fileId, targetSizeKB, originalName, maxIterations = 5 } = options;

  if (!fileId) {
    throw new Error('Missing fileId. Please upload a file first.');
  }

  if (!targetSizeKB || targetSizeKB <= 0) {
    throw new Error('Target size must be a positive number greater than 0.');
  }

  const inputPath = await findUploadFile(fileId);
  if (!inputPath || !fs.existsSync(inputPath)) {
    throw new Error('Uploaded file not found or has expired. Please re-upload.');
  }

  const stat = await fs.promises.stat(inputPath);
  const originalSize = stat.size;
  const targetSizeBytes = Math.round(targetSizeKB * 1024);

  const ext = (path.extname(originalName || inputPath) || '').toLowerCase();
  const isPdf = ext === '.pdf';

  if (isPdf) {
    const pdfVal = await validatePdfFile(inputPath);
    if (!pdfVal.valid) {
      await cleanupFile(inputPath);
      throw new Error(pdfVal.error || 'The uploaded PDF is invalid or corrupted.');
    }
  }

  const outputExt = isPdf ? '.pdf' : '.jpg';
  const { outputFileId, outputPath } = createOutputPath(outputExt);

  try {
    let compressionOutcome: {
      targetReached: boolean;
      iterations: number;
      message: string;
      resultSize: number;
      engineUsed: string;
    };

    if (isPdf) {
      compressionOutcome = await compressPdfToTarget(
        inputPath,
        outputPath,
        targetSizeBytes,
        originalSize,
        maxIterations
      );
    } else {
      compressionOutcome = await compressImageToTarget(
        inputPath,
        outputPath,
        targetSizeBytes,
        originalSize,
        maxIterations
      );
    }

    let finalStat = await fs.promises.stat(outputPath);
    let finalSize = finalStat.size;

    // Sizing guarantee: If output somehow exceeds original size
    if (finalSize > originalSize) {
      await fs.promises.copyFile(inputPath, outputPath);
      finalStat = await fs.promises.stat(outputPath);
      finalSize = originalSize;
      compressionOutcome.message = `File was already optimally compressed. Original size (${formatSize(originalSize)}) preserved.`;
    }

    const savedBytes = Math.max(0, originalSize - finalSize);
    const savedPercentage = originalSize > 0 ? Number(((savedBytes / originalSize) * 100).toFixed(1)) : 0;
    const processingTimeMs = Date.now() - startTime;

    const cleanOriginalName = originalName || (isPdf ? 'document.pdf' : 'image.jpg');
    const downloadUrl = `/api/download/${outputFileId}?name=${encodeURIComponent(cleanOriginalName)}`;
    const previewUrl = `/api/preview/${outputFileId}`;

    return {
      success: true,
      fileId: outputFileId,
      fileType: isPdf ? 'pdf' : 'image',
      originalName: cleanOriginalName,
      originalSize,
      targetSizeBytes,
      targetSizeFormatted: formatSize(targetSizeBytes),
      resultSize: finalSize,
      savedBytes,
      savedPercentage,
      targetReached: compressionOutcome.targetReached,
      iterations: compressionOutcome.iterations,
      processingTimeMs,
      downloadUrl,
      previewUrl,
      engineUsed: compressionOutcome.engineUsed,
      message: compressionOutcome.message
    };
  } catch (err) {
    await cleanupFile(outputPath);
    throw err;
  } finally {
    await cleanupFile(inputPath);
  }
};

export const processTargetCompress = compressTargetFile;
