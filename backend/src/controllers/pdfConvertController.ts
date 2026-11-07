import { Request, Response } from 'express';
import {
  convertPdfToImages,
  convertImagesToPdf,
  convertOfficeToPdf
} from '../services/pdfConvertService';

const sanitizeError = (err: any, defaultMsg: string): string => {
  const msg = (err?.message || defaultMsg).toString();
  // Strip out full local filesystem paths so internal paths are never exposed
  return msg.replace(/[a-zA-Z]:\\[^:\n\r]+|[a-zA-Z]:\/[^:\n\r]+/g, '[system path]');
};

export const handlePdfToImage = async (req: Request, res: Response) => {
  try {
    const { fileId, format, dpi, pageNumbers, pageRange, outputName } = req.body;

    if (!fileId) {
      return res.status(400).json({ success: false, error: 'File ID is required.' });
    }

    if (!format || (format !== 'jpg' && format !== 'png')) {
      return res.status(400).json({ success: false, error: "Format must be either 'jpg' or 'png'." });
    }

    const result = await convertPdfToImages({
      fileId,
      format,
      dpi: dpi ? Number(dpi) : 150,
      pageNumbers,
      pageRange,
      outputName
    });

    return res.status(200).json(result);
  } catch (err: any) {
    const error = sanitizeError(err, 'Failed to convert PDF to images.');
    return res.status(400).json({ success: false, error });
  }
};

export const handleImageToPdf = async (req: Request, res: Response) => {
  try {
    const { fileIds, pageSize, outputName } = req.body;

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one image is required to generate a PDF.' });
    }

    const result = await convertImagesToPdf({
      fileIds,
      pageSize: pageSize === 'a4' ? 'a4' : 'fit',
      outputName
    });

    return res.status(200).json(result);
  } catch (err: any) {
    const error = sanitizeError(err, 'Failed to convert images to PDF.');
    return res.status(400).json({ success: false, error });
  }
};

export const handleOfficeToPdf = async (req: Request, res: Response) => {
  try {
    const { fileId, originalName, outputName } = req.body;

    if (!fileId) {
      return res.status(400).json({ success: false, error: 'File ID is required.' });
    }

    const result = await convertOfficeToPdf({
      fileId,
      originalName: originalName || 'document',
      outputName
    });

    return res.status(200).json(result);
  } catch (err: any) {
    const error = sanitizeError(err, 'Failed to convert Office document to PDF.');
    return res.status(400).json({ success: false, error });
  }
};

