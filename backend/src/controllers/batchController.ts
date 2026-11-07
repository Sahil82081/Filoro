import { Request, Response } from 'express';
import path from 'path';
import { processBatch, MAX_BATCH_FILES } from '../services/batchService';
import { sanitizeFilename, validateFileSignature } from '../utils/fileValidation';
import { cleanupFile } from '../utils/cleanup';

export const handleBatchProcess = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const itemsList = req.body.files || req.body.items;
    const { operation } = req.body;
    const opts = req.body.options || {};
    const quality = req.body.quality ?? opts.quality;
    const preset = req.body.preset ?? opts.preset ?? opts.compressionLevel;
    const targetFormat = req.body.targetFormat ?? opts.targetFormat;
    const mode = req.body.mode ?? opts.mode;

    if (!itemsList || !Array.isArray(itemsList) || itemsList.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No files provided for batch processing. Please upload files first.',
      });
      return;
    }

    if (itemsList.length > MAX_BATCH_FILES) {
      res.status(400).json({
        success: false,
        error: `Batch limit exceeded. Maximum ${MAX_BATCH_FILES} files allowed per batch.`,
      });
      return;
    }

    if (!['compress-image', 'convert-image', 'compress-pdf'].includes(operation)) {
      res.status(400).json({
        success: false,
        error: `Unsupported batch operation '${operation}'. Supported: 'compress-image', 'convert-image', 'compress-pdf'.`,
      });
      return;
    }

    const result = await processBatch({
      files: itemsList,
      operation,
      quality: quality ? Number(quality) : undefined,
      preset,
      targetFormat,
      mode,
    });

    res.status(200).json(result);
  } catch (error) {
    const rawMsg = error instanceof Error ? error.message : 'Batch processing failed.';
    const sanitized = rawMsg.replace(/([A-Za-z]:\\[\w\s.-]+|\/[\w\s.-]+)+/g, '[sanitized_path]');
    res.status(400).json({
      success: false,
      error: sanitized,
    });
  }
};

export const handleBatchUpload = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const rawFiles = req.files as Express.Multer.File[];

    if (!rawFiles || !Array.isArray(rawFiles) || rawFiles.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No files uploaded.',
      });
      return;
    }

    const uploadedList: Array<{
      fileId: string;
      originalName: string;
      mimeType: string;
      size: number;
    }> = [];

    for (const f of rawFiles) {
      const sanitized = sanitizeFilename(f.originalname);
      const fileId = path.parse(f.filename).name;

      uploadedList.push({
        fileId,
        originalName: sanitized,
        mimeType: f.mimetype,
        size: f.size,
      });
    }

    res.status(200).json({
      success: true,
      count: uploadedList.length,
      files: uploadedList,
    });
  } catch (error) {
    const rawMsg = error instanceof Error ? error.message : 'Batch upload failed.';
    const sanitized = rawMsg.replace(/([A-Za-z]:\\[\w\s.-]+|\/[\w\s.-]+)+/g, '[sanitized_path]');
    res.status(400).json({
      success: false,
      error: sanitized,
    });
  }
};

