import { Request, Response } from 'express';
import {
  cropPdf,
  watermarkPdf,
  addPdfPageNumbers,
  protectPdf,
  signPdf,
} from '../services/pdfModifyService';

export const handleCrop = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileId, originalName, top, bottom, left, right, unit, targetPages } = req.body;

    if (!fileId) {
      res.status(400).json({ success: false, error: 'Missing fileId. Please upload a PDF file first.' });
      return;
    }

    const result = await cropPdf({
      fileId,
      originalName,
      top: Number(top) || 0,
      bottom: Number(bottom) || 0,
      left: Number(left) || 0,
      right: Number(right) || 0,
      unit: unit === 'percent' ? 'percent' : 'points',
      targetPages: Array.isArray(targetPages) ? targetPages.map(Number).filter((n) => n > 0) : undefined,
    });

    res.status(200).json(result);
  } catch (error) {
    const rawMsg = error instanceof Error ? error.message : 'PDF crop failed.';
    const sanitized = rawMsg.replace(/([A-Za-z]:\\[\w\s.-]+|\/[\w\s.-]+)+/g, '[sanitized_path]');
    res.status(400).json({ success: false, error: sanitized });
  }
};

export const handleWatermark = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileId, originalName, text, position, opacity, fontSize, color, targetPages } = req.body;

    if (!fileId) {
      res.status(400).json({ success: false, error: 'Missing fileId. Please upload a PDF file first.' });
      return;
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Watermark text cannot be empty.' });
      return;
    }

    const result = await watermarkPdf({
      fileId,
      originalName,
      text: text.trim(),
      position,
      opacity: typeof opacity === 'number' ? opacity : parseFloat(opacity) || 0.25,
      fontSize: Number(fontSize) || undefined,
      color,
      targetPages: Array.isArray(targetPages) ? targetPages.map(Number).filter((n) => n > 0) : undefined,
    });

    res.status(200).json(result);
  } catch (error) {
    const rawMsg = error instanceof Error ? error.message : 'Watermark application failed.';
    const sanitized = rawMsg.replace(/([A-Za-z]:\\[\w\s.-]+|\/[\w\s.-]+)+/g, '[sanitized_path]');
    res.status(400).json({ success: false, error: sanitized });
  }
};

export const handlePageNumbers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileId, originalName, position, format, startNumber, skipFirstPage, fontSize, color } = req.body;

    if (!fileId) {
      res.status(400).json({ success: false, error: 'Missing fileId. Please upload a PDF file first.' });
      return;
    }

    const result = await addPdfPageNumbers({
      fileId,
      originalName,
      position,
      format,
      startNumber: Number(startNumber) || 1,
      skipFirstPage: Boolean(skipFirstPage),
      fontSize: Number(fontSize) || 10,
      color,
    });

    res.status(200).json(result);
  } catch (error) {
    const rawMsg = error instanceof Error ? error.message : 'Page numbering failed.';
    const sanitized = rawMsg.replace(/([A-Za-z]:\\[\w\s.-]+|\/[\w\s.-]+)+/g, '[sanitized_path]');
    res.status(400).json({ success: false, error: sanitized });
  }
};

/**
 * STRICT SECURITY REQUIREMENT: Never log user password.
 */
export const handleProtect = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileId, originalName, userPassword, ownerPassword } = req.body;

    if (!fileId) {
      res.status(400).json({ success: false, error: 'Missing fileId. Please upload a PDF file first.' });
      return;
    }

    if (!userPassword || typeof userPassword !== 'string' || userPassword.length === 0) {
      res.status(400).json({ success: false, error: 'Please enter a password to protect the document.' });
      return;
    }

    const result = await protectPdf({
      fileId,
      originalName,
      userPassword,
      ownerPassword,
    });

    res.status(200).json(result);
  } catch (error) {
    const rawMsg = error instanceof Error ? error.message : 'PDF password encryption failed.';
    const sanitized = rawMsg.replace(/([A-Za-z]:\\[\w\s.-]+|\/[\w\s.-]+)+/g, '[sanitized_path]');
    res.status(400).json({ success: false, error: sanitized });
  }
};

export const handleSign = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      fileId,
      originalName,
      signatureType,
      signerName,
      signatureFileId,
      page,
      position,
      signDate,
      signReason,
    } = req.body;

    if (!fileId) {
      res.status(400).json({ success: false, error: 'Missing fileId. Please upload a PDF file first.' });
      return;
    }

    const result = await signPdf({
      fileId,
      originalName,
      signatureType: signatureType === 'image' ? 'image' : 'text',
      signerName,
      signatureFileId,
      page,
      position,
      signDate,
      signReason,
    });

    res.status(200).json(result);
  } catch (error) {
    const rawMsg = error instanceof Error ? error.message : 'PDF signature stamping failed.';
    const sanitized = rawMsg.replace(/([A-Za-z]:\\[\w\s.-]+|\/[\w\s.-]+)+/g, '[sanitized_path]');
    res.status(400).json({ success: false, error: sanitized });
  }
};

