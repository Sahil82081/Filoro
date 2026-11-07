import { Request, Response } from 'express';
import {
  getPdfInfo,
  mergePdfs,
  splitPdf,
  extractPdfPages,
  reorderPdfPages,
  rotatePdfPages
} from '../services/pdfOrganizeService';

const sanitizeError = (err: any, defaultMsg: string): string => {
  console.error(defaultMsg, err);
  const msg = (err?.message || '').toString();
  if (
    msg.includes('corrupted') ||
    msg.includes('damaged') ||
    msg.includes('valid PDF') ||
    msg.includes('password-protected') ||
    msg.includes('out of document bounds') ||
    msg.includes('exceeds total') ||
    msg.includes('Invalid page') ||
    msg.includes('least two PDF') ||
    msg.includes('Rotation angle') ||
    msg.includes('not found') ||
    msg.includes('expired')
  ) {
    return msg.replace(/[A-Z]:\\[^\s:]+/gi, '').trim();
  }
  return defaultMsg;
};

export const handleGetPdfInfo = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    if (!fileId) {
      return res.status(400).json({ success: false, error: 'File ID is required.' });
    }
    const result = await getPdfInfo(fileId);
    return res.status(200).json(result);
  } catch (err: any) {
    const error = sanitizeError(err, 'Failed to inspect PDF structure.');
    return res.status(400).json({ success: false, error });
  }
};

export const handleMergePdfs = async (req: Request, res: Response) => {
  try {
    const { fileIds, outputName } = req.body;
    if (!fileIds || !Array.isArray(fileIds) || fileIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Please select at least two PDF files to merge.'
      });
    }
    const result = await mergePdfs({ fileIds, outputName });
    return res.status(200).json(result);
  } catch (err: any) {
    const error = sanitizeError(err, 'Failed to merge PDF documents.');
    return res.status(400).json({ success: false, error });
  }
};

export const handleSplitPdf = async (req: Request, res: Response) => {
  try {
    const { fileId, mode, pageRanges, outputName } = req.body;
    if (!fileId) {
      return res.status(400).json({ success: false, error: 'File ID is required.' });
    }
    if (mode !== 'range' && mode !== 'every_page') {
      return res.status(400).json({
        success: false,
        error: 'Split mode must be either "range" or "every_page".'
      });
    }
    const result = await splitPdf({ fileId, mode, pageRanges, outputName });
    return res.status(200).json(result);
  } catch (err: any) {
    const error = sanitizeError(err, 'Failed to split PDF document.');
    return res.status(400).json({ success: false, error });
  }
};

export const handleExtractPages = async (req: Request, res: Response) => {
  try {
    const { fileId, pageNumbers, outputName } = req.body;
    if (!fileId) {
      return res.status(400).json({ success: false, error: 'File ID is required.' });
    }
    if (!pageNumbers || !Array.isArray(pageNumbers) || pageNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please select at least one page number to extract.'
      });
    }
    const result = await extractPdfPages({ fileId, pageNumbers, outputName });
    return res.status(200).json(result);
  } catch (err: any) {
    const error = sanitizeError(err, 'Failed to extract PDF pages.');
    return res.status(400).json({ success: false, error });
  }
};

export const handleReorderPages = async (req: Request, res: Response) => {
  try {
    const { fileId, newPageOrder, outputName } = req.body;
    if (!fileId) {
      return res.status(400).json({ success: false, error: 'File ID is required.' });
    }
    if (!newPageOrder || !Array.isArray(newPageOrder) || newPageOrder.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid array of reordered page numbers.'
      });
    }
    const result = await reorderPdfPages({ fileId, newPageOrder, outputName });
    return res.status(200).json(result);
  } catch (err: any) {
    const error = sanitizeError(err, 'Failed to reorder PDF pages.');
    return res.status(400).json({ success: false, error });
  }
};

export const handleRotatePages = async (req: Request, res: Response) => {
  try {
    const { fileId, angle, pageNumbers, outputName } = req.body;
    if (!fileId) {
      return res.status(400).json({ success: false, error: 'File ID is required.' });
    }
    const parsedAngle = Number(angle);
    if (![90, 180, 270].includes(parsedAngle)) {
      return res.status(400).json({
        success: false,
        error: 'Angle must be 90, 180, or 270 degrees.'
      });
    }
    const result = await rotatePdfPages({
      fileId,
      angle: parsedAngle as 90 | 180 | 270,
      pageNumbers,
      outputName
    });
    return res.status(200).json(result);
  } catch (err: any) {
    const error = sanitizeError(err, 'Failed to rotate PDF pages.');
    return res.status(400).json({ success: false, error });
  }
};

