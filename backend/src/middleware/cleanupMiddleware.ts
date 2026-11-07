import { Request, Response, NextFunction } from 'express';
import { cleanupFileById } from '../utils/cleanup';

/**
 * Middleware ensuring reliable cleanup on:
 * - Client disconnect / aborted processing
 * - Request processing timeout
 */
export const requestCleanupMiddleware = (timeoutMs: number = 120_000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    let timer: NodeJS.Timeout | null = null;

    const cleanupTargetFiles = async () => {
      const fileId = req.body?.fileId || req.params?.fileId || (req as any).fileId;
      if (fileId && typeof fileId === 'string') {
        await cleanupFileById(fileId, 'both');
      }
      if (Array.isArray(req.body?.fileIds)) {
        for (const id of req.body.fileIds) {
          if (typeof id === 'string') {
            await cleanupFileById(id, 'both');
          }
        }
      }
    };

    // Client aborted or closed tab before response completed
    res.on('close', () => {
      if (timer) clearTimeout(timer);
      if (!res.writableEnded) {
        cleanupTargetFiles().catch(() => {});
      }
    });

    // Timeout protection for hanging operations
    timer = setTimeout(async () => {
      if (!res.headersSent && !res.writableEnded) {
        await cleanupTargetFiles().catch(() => {});
        res.status(504).json({
          success: false,
          error: 'Processing timed out. All temporary files have been automatically removed.',
        });
      }
    }, timeoutMs);

    res.on('finish', () => {
      if (timer) clearTimeout(timer);
    });

    next();
  };
};

export default requestCleanupMiddleware;
