import fs from 'fs';
import path from 'path';
import { PDFDocument, degrees } from 'pdf-lib';
import { execFile } from 'child_process';
import { promisify } from 'util';

// Archiver v8 export
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ZipArchive } = require('archiver');
import { findUploadFile, createOutputPath } from './fileStoreService';
import { cleanupFile } from '../utils/cleanup';
import { getQpdfPath } from './pdfBinFinder';
import { validatePdfFile } from './pdfCompressService';
import {
  PdfInfoResult,
  PdfOrganizeResult,
  MergePdfOptions,
  SplitPdfOptions,
  ExtractPagesOptions,
  ReorderPagesOptions,
  RotatePagesOptions
} from './pdfOrganizeTypes';

const execFileAsync = promisify(execFile);

/**
 * Validates generated output PDF using QPDF structural checker
 */
const verifyOutputPdf = async (filePath: string): Promise<void> => {
  const qpdfBin = getQpdfPath();
  try {
    await execFileAsync(qpdfBin, ['--check', filePath], {
      windowsHide: true,
      maxBuffer: 10 * 1024 * 1024
    });
  } catch (err: any) {
    if (err.code === 3) {
      // Exit code 3 means warnings only - file is valid
      return;
    }
    throw new Error('Generated PDF failed structural validation check.');
  }
};

/**
 * Parses user range strings such as "1-3, 5, 7-10" into 1-based page numbers
 */
export const parsePageRanges = (rangeStr: string, totalPages: number): number[] => {
  const pages: number[] = [];
  const parts = rangeStr.split(',').map((p) => p.trim()).filter(Boolean);

  if (parts.length === 0) {
    throw new Error('Please specify at least one page number or range (e.g. 1-3, 5).');
  }

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
        throw new Error(`Invalid page range "${part}". Start page must be 1 or greater and less than or equal to end page.`);
      }

      if (start > totalPages || end > totalPages) {
        throw new Error(`Page range "${part}" exceeds total page count (${totalPages}).`);
      }

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (isNaN(pageNum) || pageNum < 1) {
        throw new Error(`Invalid page number "${part}". Page numbers must be positive integers.`);
      }
      if (pageNum > totalPages) {
        throw new Error(`Page ${pageNum} exceeds total document pages (${totalPages}).`);
      }
      if (!pages.includes(pageNum)) pages.push(pageNum);
    }
  }

  return pages;
};

/**
 * Retrieves page count and metadata (dimensions, rotation) for a PDF
 */
export const getPdfInfo = async (fileId: string): Promise<PdfInfoResult> => {
  const inputPath = await findUploadFile(fileId);
  if (!inputPath || !fs.existsSync(inputPath)) {
    throw new Error('PDF file not found or has expired. Please re-upload.');
  }

  const validation = await validatePdfFile(inputPath);
  if (!validation.valid) {
    throw new Error(validation.error || 'The uploaded file is not a valid PDF.');
  }

  const fileBytes = await fs.promises.readFile(inputPath);
  const pdfDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });

  const totalPages = pdfDoc.getPageCount();
  const pages = pdfDoc.getPages().map((page, index) => {
    const { width, height } = page.getSize();
    const rotation = page.getRotation().angle;
    return {
      pageNumber: index + 1,
      width: Math.round(width),
      height: Math.round(height),
      rotation
    };
  });

  const stat = await fs.promises.stat(inputPath);

  return {
    success: true,
    fileId,
    originalName: path.basename(inputPath),
    pageCount: totalPages,
    fileSize: stat.size,
    pages
  };
};

/**
 * Merges multiple PDFs into a single document in the specified order
 */
export const mergePdfs = async (options: MergePdfOptions): Promise<PdfOrganizeResult> => {
  const { fileIds, outputName } = options;

  if (!fileIds || !Array.isArray(fileIds) || fileIds.length < 2) {
    throw new Error('At least two PDF files are required for merging.');
  }

  const inputPaths: string[] = [];
  let generatedOutputPath: string | null = null;

  try {
    for (const id of fileIds) {
      const p = await findUploadFile(id);
      if (!p || !fs.existsSync(p)) {
        throw new Error(`One of the uploaded files (${id}) was not found or expired.`);
      }
      const val = await validatePdfFile(p);
      if (!val.valid) {
        throw new Error(`File ${path.basename(p)} is corrupted or invalid: ${val.error}`);
      }
      inputPaths.push(p);
    }

    const mergedPdf = await PDFDocument.create();
    let totalPages = 0;

    for (const filePath of inputPaths) {
      const bytes = await fs.promises.readFile(filePath);
      const sourcePdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
      for (const page of copiedPages) {
        mergedPdf.addPage(page);
        totalPages++;
      }
    }

    const mergedBytes = await mergedPdf.save({ useObjectStreams: true });
    const { outputFileId, outputPath } = createOutputPath('.pdf');
    generatedOutputPath = outputPath;
    await fs.promises.writeFile(outputPath, mergedBytes);

    // Validate output PDF
    await verifyOutputPdf(outputPath);

    const finalStat = await fs.promises.stat(outputPath);
    const cleanName = outputName || 'merged_document.pdf';

    return {
      success: true,
      fileId: outputFileId,
      outputFilename: cleanName,
      mimeType: 'application/pdf',
      pageCount: totalPages,
      fileSize: finalStat.size,
      downloadUrl: `/api/download/${outputFileId}?name=${encodeURIComponent(cleanName)}`,
      previewUrl: `/api/preview/${outputFileId}`,
      message: `Successfully merged ${fileIds.length} PDFs into a single ${totalPages}-page document.`
    };
  } catch (err) {
    if (generatedOutputPath) await cleanupFile(generatedOutputPath);
    throw err;
  } finally {
    for (const p of inputPaths) {
      await cleanupFile(p);
    }
  }
};

/**
 * Splits a PDF by page range, or splits every page into a ZIP archive
 */
export const splitPdf = async (options: SplitPdfOptions): Promise<PdfOrganizeResult> => {
  const { fileId, mode, pageRanges, outputName } = options;

  const inputPath = await findUploadFile(fileId);
  if (!inputPath || !fs.existsSync(inputPath)) {
    throw new Error('PDF file not found or has expired. Please re-upload.');
  }

  let generatedOutputPath: string | null = null;

  try {
    const validation = await validatePdfFile(inputPath);
    if (!validation.valid) {
      throw new Error(validation.error || 'The uploaded file is not a valid PDF.');
    }

    const sourceBytes = await fs.promises.readFile(inputPath);
    const sourceDoc = await PDFDocument.load(sourceBytes, { ignoreEncryption: true });
    const totalPages = sourceDoc.getPageCount();

    if (mode === 'every_page') {
      const { outputFileId, outputPath: zipOutputPath } = createOutputPath('.zip');
      generatedOutputPath = zipOutputPath;
      const outputStream = fs.createWriteStream(zipOutputPath);
      const archive = new ZipArchive({ zlib: { level: 9 } });

      await new Promise<void>(async (resolve, reject) => {
        outputStream.on('close', resolve);
        archive.on('error', reject);
        archive.pipe(outputStream);

        try {
          for (let i = 0; i < totalPages; i++) {
            const singlePageDoc = await PDFDocument.create();
            const [copiedPage] = await singlePageDoc.copyPages(sourceDoc, [i]);
            singlePageDoc.addPage(copiedPage);
            const pageBytes = await singlePageDoc.save({ useObjectStreams: true });
            const paddedNum = String(i + 1).padStart(2, '0');
            archive.append(Buffer.from(pageBytes), { name: `page_${paddedNum}.pdf` });
          }
          archive.finalize();
        } catch (err) {
          reject(err);
        }
      });

      const zipStat = await fs.promises.stat(zipOutputPath);
      const cleanZipName = outputName ? (outputName.endsWith('.zip') ? outputName : `${outputName}.zip`) : 'split_pages.zip';

      return {
        success: true,
        fileId: outputFileId,
        outputFilename: cleanZipName,
        mimeType: 'application/zip',
        pageCount: totalPages,
        fileSize: zipStat.size,
        isZip: true,
        downloadUrl: `/api/download/${outputFileId}?name=${encodeURIComponent(cleanZipName)}`,
        message: `Successfully split ${totalPages} individual pages into a ZIP archive.`
      };
    } else {
      if (!pageRanges || typeof pageRanges !== 'string') {
        throw new Error('Please specify a page range (e.g. 1-3, 5).');
      }

      const selectedPages = parsePageRanges(pageRanges, totalPages);
      if (selectedPages.length === 0) {
        throw new Error('No valid pages found in specified range.');
      }

      const splitDoc = await PDFDocument.create();
      const zeroBasedIndices = selectedPages.map((p) => p - 1);
      const copiedPages = await splitDoc.copyPages(sourceDoc, zeroBasedIndices);
      copiedPages.forEach((p) => splitDoc.addPage(p));

      const outBytes = await splitDoc.save({ useObjectStreams: true });
      const { outputFileId, outputPath } = createOutputPath('.pdf');
      generatedOutputPath = outputPath;
      await fs.promises.writeFile(outputPath, outBytes);

      await verifyOutputPdf(outputPath);

      const stat = await fs.promises.stat(outputPath);
      const cleanPdfName = outputName || 'split_document.pdf';

      return {
        success: true,
        fileId: outputFileId,
        outputFilename: cleanPdfName,
        mimeType: 'application/pdf',
        pageCount: selectedPages.length,
        fileSize: stat.size,
        downloadUrl: `/api/download/${outputFileId}?name=${encodeURIComponent(cleanPdfName)}`,
        previewUrl: `/api/preview/${outputFileId}`,
        message: `Successfully split and generated a ${selectedPages.length}-page document from range (${pageRanges}).`
      };
    }
  } catch (err) {
    if (generatedOutputPath) await cleanupFile(generatedOutputPath);
    throw err;
  } finally {
    await cleanupFile(inputPath);
  }
};

export const extractPdfPages = async (options: ExtractPagesOptions): Promise<PdfOrganizeResult> => {
  const { fileId, pageNumbers, outputName } = options;

  if (!pageNumbers || !Array.isArray(pageNumbers) || pageNumbers.length === 0) {
    throw new Error('Please select at least one page to extract.');
  }

  const inputPath = await findUploadFile(fileId);
  if (!inputPath || !fs.existsSync(inputPath)) {
    throw new Error('PDF file not found or has expired. Please re-upload.');
  }

  let generatedOutputPath: string | null = null;

  try {
    const validation = await validatePdfFile(inputPath);
    if (!validation.valid) {
      throw new Error(validation.error || 'The uploaded file is not a valid PDF.');
    }

    const sourceBytes = await fs.promises.readFile(inputPath);
    const sourceDoc = await PDFDocument.load(sourceBytes, { ignoreEncryption: true });
    const totalPages = sourceDoc.getPageCount();

    for (const num of pageNumbers) {
      if (num < 1 || num > totalPages) {
        throw new Error(`Page number ${num} is out of document bounds (1-${totalPages}).`);
      }
    }

    const extractDoc = await PDFDocument.create();
    const zeroBasedIndices = pageNumbers.map((p) => p - 1);
    const copiedPages = await extractDoc.copyPages(sourceDoc, zeroBasedIndices);
    copiedPages.forEach((p) => extractDoc.addPage(p));

    const outBytes = await extractDoc.save({ useObjectStreams: true });
    const { outputFileId, outputPath } = createOutputPath('.pdf');
    generatedOutputPath = outputPath;
    await fs.promises.writeFile(outputPath, outBytes);

    await verifyOutputPdf(outputPath);

    const stat = await fs.promises.stat(outputPath);
    const cleanName = outputName || 'extracted_pages.pdf';

    return {
      success: true,
      fileId: outputFileId,
      outputFilename: cleanName,
      mimeType: 'application/pdf',
      pageCount: pageNumbers.length,
      fileSize: stat.size,
      downloadUrl: `/api/download/${outputFileId}?name=${encodeURIComponent(cleanName)}`,
      previewUrl: `/api/preview/${outputFileId}`,
      message: `Successfully extracted ${pageNumbers.length} pages into a new document.`
    };
  } catch (err) {
    if (generatedOutputPath) await cleanupFile(generatedOutputPath);
    throw err;
  } finally {
    await cleanupFile(inputPath);
  }
};

export const reorderPdfPages = async (options: ReorderPagesOptions): Promise<PdfOrganizeResult> => {
  const { fileId, newPageOrder, outputName } = options;

  if (!newPageOrder || !Array.isArray(newPageOrder) || newPageOrder.length === 0) {
    throw new Error('Please specify a valid page order.');
  }

  const inputPath = await findUploadFile(fileId);
  if (!inputPath || !fs.existsSync(inputPath)) {
    throw new Error('PDF file not found or has expired. Please re-upload.');
  }

  let generatedOutputPath: string | null = null;

  try {
    const validation = await validatePdfFile(inputPath);
    if (!validation.valid) {
      throw new Error(validation.error || 'The uploaded file is not a valid PDF.');
    }

    const sourceBytes = await fs.promises.readFile(inputPath);
    const sourceDoc = await PDFDocument.load(sourceBytes, { ignoreEncryption: true });
    const totalPages = sourceDoc.getPageCount();

    for (const p of newPageOrder) {
      if (p < 1 || p > totalPages) {
        throw new Error(`Invalid page ${p}. Must be between 1 and ${totalPages}.`);
      }
    }

    const reorderedDoc = await PDFDocument.create();
    const zeroBasedIndices = newPageOrder.map((p) => p - 1);
    const copiedPages = await reorderedDoc.copyPages(sourceDoc, zeroBasedIndices);
    copiedPages.forEach((p) => reorderedDoc.addPage(p));

    const outBytes = await reorderedDoc.save({ useObjectStreams: true });
    const { outputFileId, outputPath } = createOutputPath('.pdf');
    generatedOutputPath = outputPath;
    await fs.promises.writeFile(outputPath, outBytes);

    await verifyOutputPdf(outputPath);

    const stat = await fs.promises.stat(outputPath);
    const cleanName = outputName || 'reordered_document.pdf';

    return {
      success: true,
      fileId: outputFileId,
      outputFilename: cleanName,
      mimeType: 'application/pdf',
      pageCount: newPageOrder.length,
      fileSize: stat.size,
      downloadUrl: `/api/download/${outputFileId}?name=${encodeURIComponent(cleanName)}`,
      previewUrl: `/api/preview/${outputFileId}`,
      message: `Successfully reordered ${newPageOrder.length} pages.`
    };
  } catch (err) {
    if (generatedOutputPath) await cleanupFile(generatedOutputPath);
    throw err;
  } finally {
    await cleanupFile(inputPath);
  }
};

export const rotatePdfPages = async (options: RotatePagesOptions): Promise<PdfOrganizeResult> => {
  const { fileId, angle, pageNumbers, outputName } = options;

  const validAngles = [90, 180, 270];
  if (!validAngles.includes(angle)) {
    throw new Error('Rotation angle must be 90, 180, or 270 degrees.');
  }

  const inputPath = await findUploadFile(fileId);
  if (!inputPath || !fs.existsSync(inputPath)) {
    throw new Error('PDF file not found or has expired. Please re-upload.');
  }

  let generatedOutputPath: string | null = null;

  try {
    const validation = await validatePdfFile(inputPath);
    if (!validation.valid) {
      throw new Error(validation.error || 'The uploaded file is not a valid PDF.');
    }

    const sourceBytes = await fs.promises.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(sourceBytes, { ignoreEncryption: true });
    const allPages = pdfDoc.getPages();
    const totalPages = allPages.length;

    const targetPages = pageNumbers && pageNumbers.length > 0 ? pageNumbers : allPages.map((_, i) => i + 1);

    for (const pageNum of targetPages) {
      if (pageNum >= 1 && pageNum <= totalPages) {
        const page = allPages[pageNum - 1];
        const currentAngle = page.getRotation().angle;
        page.setRotation(degrees((currentAngle + angle) % 360));
      }
    }

    const outBytes = await pdfDoc.save({ useObjectStreams: true });
    const { outputFileId, outputPath } = createOutputPath('.pdf');
    generatedOutputPath = outputPath;
    await fs.promises.writeFile(outputPath, outBytes);

    await verifyOutputPdf(outputPath);

    const stat = await fs.promises.stat(outputPath);
    const cleanName = outputName || 'rotated_document.pdf';

    return {
      success: true,
      fileId: outputFileId,
      outputFilename: cleanName,
      mimeType: 'application/pdf',
      pageCount: totalPages,
      fileSize: stat.size,
      downloadUrl: `/api/download/${outputFileId}?name=${encodeURIComponent(cleanName)}`,
      previewUrl: `/api/preview/${outputFileId}`,
      message: `Successfully rotated ${targetPages.length} pages by ${angle}°.`
    };
  } catch (err) {
    if (generatedOutputPath) await cleanupFile(generatedOutputPath);
    throw err;
  } finally {
    await cleanupFile(inputPath);
  }
};
