import { Request, Response } from 'express';
import { compressPdf } from '../services/pdfCompressService';
import { PdfCompressionMode } from '../services/pdfTypes';

/**
 * Handles PDF compression requests
 * POST /api/pdf/compress
 */
export const handlePdfCompress = async (req: Request, res: Response) => {
  try {
    const { fileId, mode, targetSizeKB, originalName } = req.body;

    if (!fileId || typeof fileId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'A valid file ID is required.'
      });
    }

    const validModes: PdfCompressionMode[] = ['basic', 'strong', 'target'];
    if (!mode || !validModes.includes(mode)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid compression mode. Please choose basic, strong, or target.'
      });
    }

    let parsedTargetSize: number | undefined = undefined;
    if (mode === 'target') {
      parsedTargetSize = Number(targetSizeKB);
      if (isNaN(parsedTargetSize) || parsedTargetSize <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid target size greater than 0 KB.'
        });
      }
    }

    const result = await compressPdf({
      fileId: fileId.trim(),
      mode,
      targetSizeKB: parsedTargetSize,
      originalName: typeof originalName === 'string' ? originalName : undefined
    });

    return res.status(200).json(result);
  } catch (err: any) {
    console.error('PDF compression error:', err);

    // Sanitize error message to ensure no backend filesystem paths or stack traces are leaked
    const rawMessage = (err?.message || '').toString();
    let friendlyError = 'An error occurred while compressing your PDF. Please check the file and try again.';

    if (
      rawMessage.includes('password-protected') ||
      rawMessage.includes('corrupted') ||
      rawMessage.includes('damaged') ||
      rawMessage.includes('valid PDF header') ||
      rawMessage.includes('empty (0 bytes)') ||
      rawMessage.includes('not found') ||
      rawMessage.includes('expired')
    ) {
      // Strip any file paths if present
      friendlyError = rawMessage.replace(/[A-Z]:\\[^\s:]+/gi, '').trim();
    }

    return res.status(400).json({
      success: false,
      error: friendlyError
    });
  }
};

