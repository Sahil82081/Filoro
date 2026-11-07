import { Request, Response } from 'express';
import { processTargetCompress } from '../services/targetCompressService';

/**
 * Handles Target-Size Compression requests
 * POST /api/target/compress
 */
export const handleTargetCompress = async (req: Request, res: Response) => {
  try {
    const { fileId, targetSizeKB, originalName, maxIterations } = req.body;

    if (!fileId || typeof fileId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'A valid file ID is required.'
      });
    }

    const parsedTargetSize = Number(targetSizeKB);
    if (isNaN(parsedTargetSize) || parsedTargetSize <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Please specify a positive target file size in KB.'
      });
    }

    const parsedIterations = maxIterations ? Math.min(10, Math.max(1, Number(maxIterations))) : 5;

    const result = await processTargetCompress({
      fileId: fileId.trim(),
      targetSizeKB: parsedTargetSize,
      originalName: typeof originalName === 'string' ? originalName : undefined,
      maxIterations: parsedIterations
    });

    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Target size compression error:', err);

    // Sanitize message to prevent path leakage
    const rawMessage = (err?.message || '').toString();
    let friendlyError = 'An error occurred during target size compression. Please check the file and try again.';

    if (
      rawMessage.includes('password-protected') ||
      rawMessage.includes('corrupted') ||
      rawMessage.includes('damaged') ||
      rawMessage.includes('valid PDF header') ||
      rawMessage.includes('empty (0 bytes)') ||
      rawMessage.includes('not found') ||
      rawMessage.includes('expired') ||
      rawMessage.includes('supports PDF') ||
      rawMessage.includes('positive target size')
    ) {
      friendlyError = rawMessage.replace(/[A-Z]:\\[^\s:]+/gi, '').trim();
    }

    return res.status(400).json({
      success: false,
      error: friendlyError
    });
  }
};

