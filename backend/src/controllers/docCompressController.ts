import { Request, Response } from 'express';
import { compressDocument } from '../services/docCompressService';

const sanitizeError = (err: any, defaultMsg: string): string => {
  const msg = (err?.message || defaultMsg).toString();
  return msg.replace(/[a-zA-Z]:\\[^:\n\r]+|[a-zA-Z]:\/[^:\n\r]+/g, '[system path]');
};

export const handleCompressDocument = async (req: Request, res: Response) => {
  try {
    const {
      fileId,
      originalName,
      imageQuality,
      maxImageDimension,
      modernizeLegacy,
      outputName
    } = req.body;

    if (!fileId) {
      return res.status(400).json({ success: false, error: 'File ID is required.' });
    }

    const result = await compressDocument({
      fileId,
      originalName: originalName || 'document',
      imageQuality: imageQuality ? Number(imageQuality) : 75,
      maxImageDimension: maxImageDimension ? Number(maxImageDimension) : 1920,
      modernizeLegacy: modernizeLegacy !== false,
      outputName
    });

    return res.status(200).json(result);
  } catch (err: any) {
    const error = sanitizeError(err, 'Failed to compress document.');
    return res.status(400).json({ success: false, error });
  }
};

