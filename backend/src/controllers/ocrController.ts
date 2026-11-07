import { Request, Response, NextFunction } from 'express';
import { ocrImageToText, ocrPdf } from '../services/ocrService';
import { convertImagesToPdf } from '../services/pdfConvertService';

export const handleImageToText = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fileId, language, preprocess, originalName } = req.body;

    if (!fileId) {
      res.status(400).json({
        success: false,
        error: 'Missing fileId. Please upload an image file first.',
      });
      return;
    }

    const result = await ocrImageToText({
      fileId,
      language: typeof language === 'string' && language.trim() ? language.trim() : 'eng',
      preprocess: preprocess !== false,
      originalName,
    });

    res.status(200).json(result);
  } catch (error) {
    const rawMsg = error instanceof Error ? error.message : 'Image OCR processing failed.';
    const sanitized = rawMsg.replace(/([A-Za-z]:\\[\w\s.-]+|\/[\w\s.-]+)+/g, '[sanitized_path]');
    res.status(400).json({
      success: false,
      error: sanitized,
    });
  }
};

export const handlePdfToText = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fileId, language, targetPages, originalName } = req.body;

    if (!fileId) {
      res.status(400).json({
        success: false,
        error: 'Missing fileId. Please upload a PDF file first.',
      });
      return;
    }

    let parsedPages: number[] | undefined;
    if (Array.isArray(targetPages)) {
      parsedPages = targetPages.map(Number).filter((n) => Number.isInteger(n) && n > 0);
    }

    const result = await ocrPdf({
      fileId,
      language: typeof language === 'string' && language.trim() ? language.trim() : 'eng',
      targetPages: parsedPages,
      outputFormat: 'text',
      originalName,
    });

    res.status(200).json(result);
  } catch (error) {
    const rawMsg = error instanceof Error ? error.message : 'PDF OCR text extraction failed.';
    const sanitized = rawMsg.replace(/([A-Za-z]:\\[\w\s.-]+|\/[\w\s.-]+)+/g, '[sanitized_path]');
    res.status(400).json({
      success: false,
      error: sanitized,
    });
  }
};

export const handlePdfToWord = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fileId, language, targetPages, originalName } = req.body;

    if (!fileId) {
      res.status(400).json({
        success: false,
        error: 'Missing fileId. Please upload a scanned PDF file first.',
      });
      return;
    }

    let parsedPages: number[] | undefined;
    if (Array.isArray(targetPages)) {
      parsedPages = targetPages.map(Number).filter((n) => Number.isInteger(n) && n > 0);
    }

    const result = await ocrPdf({
      fileId,
      language: typeof language === 'string' && language.trim() ? language.trim() : 'eng',
      targetPages: parsedPages,
      outputFormat: 'docx',
      originalName,
    });

    res.status(200).json(result);
  } catch (error) {
    const rawMsg = error instanceof Error ? error.message : 'Scanned PDF to Word conversion failed.';
    const sanitized = rawMsg.replace(/([A-Za-z]:\\[\w\s.-]+|\/[\w\s.-]+)+/g, '[sanitized_path]');
    res.status(400).json({
      success: false,
      error: sanitized,
    });
  }
};

export const handleImageToPdf = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fileIds, pageSize, outputName } = req.body;

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Please upload at least one image to convert to PDF.',
      });
      return;
    }

    const result = await convertImagesToPdf({
      fileIds,
      pageSize: pageSize === 'a4' ? 'a4' : 'fit',
      outputName,
    });

    res.status(200).json(result);
  } catch (error) {
    const rawMsg = error instanceof Error ? error.message : 'Image to PDF conversion failed.';
    const sanitized = rawMsg.replace(/([A-Za-z]:\\[\w\s.-]+|\/[\w\s.-]+)+/g, '[sanitized_path]');
    res.status(400).json({
      success: false,
      error: sanitized,
    });
  }
};

