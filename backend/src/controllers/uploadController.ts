import { Request, Response } from 'express';
import path from 'path';
import { sanitizeFilename, validateFileSignature } from '../utils/fileValidation';
import { cleanupFile, cleanupFileById } from '../utils/cleanup';

export const uploadFile = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded. Please provide a file with field name "file".'
    });
  }

  const uploadedFilePath = req.file.path;
  const sanitizedOriginal = sanitizeFilename(req.file.originalname);
  const ext = path.extname(sanitizedOriginal).toLowerCase();

  try {
    // 1. Deep file signature / magic bytes verification
    const sigCheck = await validateFileSignature(uploadedFilePath, ext);
    if (!sigCheck.valid) {
      // Unlink invalid file immediately
      await cleanupFile(uploadedFilePath);
      return res.status(400).json({
        success: false,
        error: sigCheck.reason || 'File failed integrity inspection.'
      });
    }

    // 2. Extract safe unique file identifier (UUID)
    // Filename on disk is <uuid><ext>
    const diskFilename = path.basename(uploadedFilePath);
    const fileId = path.parse(diskFilename).name;

    // 3. Return sanitized, safe metadata (NO internal filesystem paths)
    return res.status(200).json({
      success: true,
      message: 'File uploaded and verified successfully.',
      file: {
        fileId,
        originalName: sanitizedOriginal,
        mimeType: req.file.mimetype,
        size: req.file.size,
        extension: ext.replace(/^\./, ''),
        uploadedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    // Cleanup file in case of unexpected exceptions
    await cleanupFile(uploadedFilePath);
    console.error('Upload processing error:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while verifying the uploaded file.'
    });
  }
};

export const deleteUploadedFile = async (req: Request, res: Response) => {
  const { fileId } = req.params;
  if (!fileId) {
    return res.status(400).json({
      success: false,
      error: 'File ID is required.'
    });
  }

  const removed = await cleanupFileById(fileId);
  if (!removed) {
    return res.status(404).json({
      success: false,
      error: 'File not found or already deleted.'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Temporary file deleted successfully.'
  });
};

