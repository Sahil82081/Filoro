import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import crypto from 'crypto';
import { config } from '../config';
import { findUploadFile, createOutputPath } from './fileStoreService';
import { cleanupFile } from '../utils/cleanup';
import { getPdftoppmPath, getLibreOfficePath, getQpdfPath } from './pdfBinFinder';
import { validatePdfFile } from './pdfCompressService';
import { parsePageRanges } from './pdfOrganizeService';
import {
  PdfToImageOptions,
  ImageToPdfOptions,
  OfficeToPdfOptions,
  ConvertResult
} from './pdfConvertTypes';

// Archiver v8
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ZipArchive } = require('archiver');

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
 * Converts a PDF into individual JPG or PNG images (single image or zipped package)
 */
export const convertPdfToImages = async (
  options: PdfToImageOptions
): Promise<ConvertResult> => {
  const { fileId, format, dpi = 150, pageNumbers, pageRange, outputName } = options;

  const inputPath = await findUploadFile(fileId);
  if (!inputPath || !fs.existsSync(inputPath)) {
    throw new Error('PDF file not found or has expired. Please re-upload.');
  }

  const validation = await validatePdfFile(inputPath);
  if (!validation.valid) {
    await cleanupFile(inputPath);
    throw new Error(validation.error || 'The uploaded file is not a valid PDF.');
  }

  const sourceBytes = await fs.promises.readFile(inputPath);
  const pdfDoc = await PDFDocument.load(sourceBytes, { ignoreEncryption: true });
  const totalPages = pdfDoc.getPageCount();

  let targetPages: number[] | null = null;
  if (pageNumbers && Array.isArray(pageNumbers) && pageNumbers.length > 0) {
    targetPages = pageNumbers.filter((p) => p >= 1 && p <= totalPages);
  } else if (pageRange && typeof pageRange === 'string') {
    targetPages = parsePageRanges(pageRange, totalPages);
  }

  const tempDir = path.join(config.uploadDir, `ppm_tmp_${crypto.randomUUID()}`);
  await fs.promises.mkdir(tempDir, { recursive: true });

  const pdftoppm = getPdftoppmPath();
  const formatFlag = format === 'png' ? '-png' : '-jpeg';
  const prefix = path.join(tempDir, 'page');

  try {
    // If specific pages selected
    if (targetPages && targetPages.length > 0) {
      for (const p of targetPages) {
        await execFileAsync(
          pdftoppm,
          [formatFlag, '-r', String(dpi), '-f', String(p), '-l', String(p), inputPath, `${prefix}_p${p}`],
          { windowsHide: true, maxBuffer: 20 * 1024 * 1024 }
        );
      }
    } else {
      // Convert entire document
      await execFileAsync(
        pdftoppm,
        [formatFlag, '-r', String(dpi), inputPath, prefix],
        { windowsHide: true, maxBuffer: 50 * 1024 * 1024 }
      );
    }

    const ext = format === 'png' ? '.png' : '.jpg';
    const allFiles = await fs.promises.readdir(tempDir);
    const renderedImages = allFiles
      .filter((f) => f.toLowerCase().endsWith(ext))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      .map((f) => path.join(tempDir, f));

    if (renderedImages.length === 0) {
      throw new Error(`Failed to render PDF pages into ${format.toUpperCase()} images.`);
    }

    // Clean up input PDF upload
    await cleanupFile(inputPath);

    if (renderedImages.length === 1) {
      // Single image output
      const { outputFileId, outputPath } = createOutputPath(ext);
      await fs.promises.copyFile(renderedImages[0], outputPath);
      const stat = await fs.promises.stat(outputPath);

      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const cleanName = outputName
        ? (outputName.endsWith(ext) ? outputName : `${outputName}${ext}`)
        : `converted_page_1${ext}`;

      return {
        success: true,
        fileId: outputFileId,
        outputFilename: cleanName,
        mimeType,
        fileSize: stat.size,
        pageCount: 1,
        downloadUrl: `/api/download/${outputFileId}?name=${encodeURIComponent(cleanName)}`,
        previewUrl: `/api/preview/${outputFileId}`,
        message: `Successfully rendered PDF page into high-quality ${format.toUpperCase()} image.`
      };
    } else {
      // Multiple images output -> Package inside ZIP
      const { outputFileId, outputPath: zipOutputPath } = createOutputPath('.zip');
      const outputStream = fs.createWriteStream(zipOutputPath);
      const archive = new ZipArchive({ zlib: { level: 9 } });

      await new Promise<void>((resolve, reject) => {
        outputStream.on('close', resolve);
        archive.on('error', reject);
        archive.pipe(outputStream);

        try {
          renderedImages.forEach((imgFilePath, idx) => {
            const padded = String(idx + 1).padStart(2, '0');
            archive.append(fs.createReadStream(imgFilePath), { name: `page_${padded}${ext}` });
          });
          archive.finalize();
        } catch (err) {
          reject(err);
        }
      });

      const stat = await fs.promises.stat(zipOutputPath);
      const cleanZipName = outputName
        ? (outputName.endsWith('.zip') ? outputName : `${outputName}.zip`)
        : `converted_pages_${format.toUpperCase()}.zip`;

      return {
        success: true,
        fileId: outputFileId,
        outputFilename: cleanZipName,
        mimeType: 'application/zip',
        fileSize: stat.size,
        pageCount: renderedImages.length,
        isZip: true,
        downloadUrl: `/api/download/${outputFileId}?name=${encodeURIComponent(cleanZipName)}`,
        message: `Successfully converted ${renderedImages.length} PDF pages into a ${format.toUpperCase()} ZIP archive.`
      };
    }
  } finally {
    // Clean up input PDF upload file
    await cleanupFile(inputPath);
    // Clean up temporary rendering folder
    try {
      if (fs.existsSync(tempDir)) {
        await fs.promises.rm(tempDir, { recursive: true, force: true });
      }
    } catch {
      // Non-fatal
    }
  }
};

/**
 * Converts one or more JPG/PNG images into a structured, validated PDF document
 */
export const convertImagesToPdf = async (
  options: ImageToPdfOptions
): Promise<ConvertResult> => {
  const { fileIds, pageSize = 'fit', outputName } = options;

  if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
    throw new Error('Please select at least one image to convert to PDF.');
  }

  const imagePaths: string[] = [];
  for (const id of fileIds) {
    const p = await findUploadFile(id);
    if (!p || !fs.existsSync(p)) {
      throw new Error(`Image file (${id}) was not found or has expired.`);
    }
    imagePaths.push(p);
  }

  let createdOutputPath: string | null = null;
  try {
    const pdfDoc = await PDFDocument.create();

    for (const imgPath of imagePaths) {
      const imgBuffer = await fs.promises.readFile(imgPath);
      // Use sharp to normalize and determine dimensions
      const meta = await sharp(imgBuffer).metadata();
      const width = meta.width || 600;
      const height = meta.height || 800;

      // Convert to standard JPEG buffer for clean universal embedding
      const normalizedJpg = await sharp(imgBuffer).jpeg({ quality: 92 }).toBuffer();
      const embeddedImage = await pdfDoc.embedJpg(normalizedJpg);

      if (pageSize === 'a4') {
        // Standard A4: 595.28 x 841.89 points
        const a4Width = 595.28;
        const a4Height = 841.89;
        const page = pdfDoc.addPage([a4Width, a4Height]);

        const margin = 20;
        const maxWidth = a4Width - margin * 2;
        const maxHeight = a4Height - margin * 2;

        const scale = Math.min(maxWidth / width, maxHeight / height, 1);
        const drawWidth = width * scale;
        const drawHeight = height * scale;

        const x = (a4Width - drawWidth) / 2;
        const y = (a4Height - drawHeight) / 2;

        page.drawImage(embeddedImage, {
          x,
          y,
          width: drawWidth,
          height: drawHeight
        });
      } else {
        // 'fit' mode: Page dimensions match image dimensions exactly
        const page = pdfDoc.addPage([width, height]);
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width,
          height
        });
      }
    }

    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    const { outputFileId, outputPath } = createOutputPath('.pdf');
    createdOutputPath = outputPath;
    await fs.promises.writeFile(outputPath, pdfBytes);

    // Structural QPDF check
    await verifyOutputPdf(outputPath);

    const stat = await fs.promises.stat(outputPath);
    const cleanPdfName = outputName
      ? (outputName.endsWith('.pdf') ? outputName : `${outputName}.pdf`)
      : 'images_combined.pdf';

    return {
      success: true,
      fileId: outputFileId,
      outputFilename: cleanPdfName,
      mimeType: 'application/pdf',
      fileSize: stat.size,
      pageCount: imagePaths.length,
      downloadUrl: `/api/download/${outputFileId}?name=${encodeURIComponent(cleanPdfName)}`,
      previewUrl: `/api/preview/${outputFileId}`,
      message: `Successfully converted ${imagePaths.length} ${imagePaths.length === 1 ? 'image' : 'images'} into a valid PDF document.`
    };
  } catch (err) {
    if (createdOutputPath) {
      await cleanupFile(createdOutputPath);
    }
    throw err;
  } finally {
    // Clean up all input image files
    for (const p of imagePaths) {
      await cleanupFile(p);
    }
  }
};

/**
 * Converts Word (.docx, .doc) or Excel (.xlsx, .xls) documents into PDF using LibreOffice headless
 */
export const convertOfficeToPdf = async (
  options: OfficeToPdfOptions
): Promise<ConvertResult> => {
  const { fileId, originalName, outputName } = options;

  const inputPath = await findUploadFile(fileId);
  if (!inputPath || !fs.existsSync(inputPath)) {
    throw new Error('Document file not found or has expired. Please re-upload.');
  }

  const ext = path.extname(originalName || inputPath).toLowerCase();
  const isWord = ext === '.docx' || ext === '.doc';
  const isExcel = ext === '.xlsx' || ext === '.xls';

  if (!isWord && !isExcel) {
    await cleanupFile(inputPath);
    throw new Error(`Unsupported document extension '${ext}'. Only Word (.docx, .doc) and Excel (.xlsx, .xls) files are supported.`);
  }

  const tempDir = path.join(config.uploadDir, `office_tmp_${crypto.randomUUID()}`);
  await fs.promises.mkdir(tempDir, { recursive: true });

  const soffice = getLibreOfficePath();
  let createdOutputPath: string | null = null;

  try {
    // Run LibreOffice headless conversion
    await execFileAsync(
      soffice,
      ['--headless', '--convert-to', 'pdf', '--outdir', tempDir, inputPath],
      { windowsHide: true, maxBuffer: 50 * 1024 * 1024 }
    );

    // Locate the output PDF file in tempDir
    const tempFiles = await fs.promises.readdir(tempDir);
    const convertedPdfName = tempFiles.find((f) => f.toLowerCase().endsWith('.pdf'));

    if (!convertedPdfName) {
      throw new Error('LibreOffice failed to generate a PDF document. Please check the document contents and formatting.');
    }

    const generatedPdfPath = path.join(tempDir, convertedPdfName);
    const { outputFileId, outputPath } = createOutputPath('.pdf');
    createdOutputPath = outputPath;
    await fs.promises.copyFile(generatedPdfPath, outputPath);

    // Validate generated output PDF with QPDF
    await verifyOutputPdf(outputPath);

    // Inspect page count of generated PDF
    let pageCount: number | undefined = undefined;
    try {
      const generatedBytes = await fs.promises.readFile(outputPath);
      const generatedDoc = await PDFDocument.load(generatedBytes, { ignoreEncryption: true });
      pageCount = generatedDoc.getPageCount();
    } catch {
      // Non-fatal
    }

    const stat = await fs.promises.stat(outputPath);
    const cleanOutputName = outputName
      ? (outputName.endsWith('.pdf') ? outputName : `${outputName}.pdf`)
      : `${path.parse(originalName || 'document').name}.pdf`;

    const disclaimer = isWord
      ? 'Formatting fidelity notice: Converted via LibreOffice. Complex layouts, non-standard embedded fonts, or custom Word styling may show subtle formatting variations from Microsoft Word.'
      : 'Formatting fidelity notice: Converted via LibreOffice Calc. Spreadsheet page breaks, table borders, and print margins may vary based on sheet layout and column widths.';

    return {
      success: true,
      fileId: outputFileId,
      outputFilename: cleanOutputName,
      mimeType: 'application/pdf',
      fileSize: stat.size,
      pageCount,
      downloadUrl: `/api/download/${outputFileId}?name=${encodeURIComponent(cleanOutputName)}`,
      previewUrl: `/api/preview/${outputFileId}`,
      message: `Successfully converted ${isWord ? 'Word document' : 'Excel spreadsheet'} to PDF.`,
      disclaimer
    };
  } catch (err) {
    if (createdOutputPath) {
      await cleanupFile(createdOutputPath);
    }
    throw err;
  } finally {
    // Clean up input upload file
    await cleanupFile(inputPath);
    try {
      if (fs.existsSync(tempDir)) {
        await fs.promises.rm(tempDir, { recursive: true, force: true });
      }
    } catch {
      // Non-fatal
    }
  }
};
