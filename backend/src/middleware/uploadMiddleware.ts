import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { sanitizeFilename, BLOCKED_EXTENSIONS, ALLOWED_FORMATS } from '../utils/fileValidation';

// Ensure uploads directory exists
import fs from 'fs';
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (_req, file, cb) => {
    const sanitized = sanitizeFilename(file.originalname);
    const ext = path.extname(sanitized).toLowerCase();
    const uniqueId = crypto.randomUUID();
    // Unique temporary filename: <uuid><ext>
    const tempFilename = `${uniqueId}${ext}`;
    cb(null, tempFilename);
  }
});

// File filter for basic extension & security check
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const sanitized = sanitizeFilename(file.originalname);
  const ext = path.extname(sanitized).toLowerCase().replace(/^\./, '');

  if (BLOCKED_EXTENSIONS.has(ext)) {
    return cb(new Error(`File type '.${ext}' is strictly prohibited for security.`));
  }

  if (!ALLOWED_FORMATS[ext]) {
    return cb(new Error(`Unsupported file type '.${ext}'. Allowed types: PDF, Images (PNG, JPG, WebP, SVG, GIF), Docs (DOCX, DOC, PPTX, PPT, XLSX, XLS, MD, TXT), Data (JSON, CSV), Archives (ZIP).`));
  }

  cb(null, true);
};

// Multer upload instance for single files
export const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSizeMB * 1024 * 1024,
    files: 1
  },
  fileFilter
});

// Multer upload instance for multiple files (up to 20 files per batch)
export const uploadMultiple = multer({
  storage,
  limits: {
    fileSize: config.maxFileSizeMB * 1024 * 1024,
    files: 20
  },
  fileFilter
});

/**
 * Custom wrapper middleware for multiple file uploads
 */
export const handleUploadMultiple = (req: Request, res: Response, next: NextFunction) => {
  const uploadArray = uploadMultiple.array('files', 20);

  uploadArray(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: `One of the files exceeds the maximum allowed limit of ${config.maxFileSizeMB}MB.`
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          error: 'Maximum 20 files allowed per upload.'
        });
      }
      return res.status(400).json({
        success: false,
        error: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: err.message || 'File upload failed validation.'
      });
    }

    next();
  });
};

/**
 * Custom wrapper middleware to handle Multer errors and return clean JSON
 */
export const handleUpload = (req: Request, res: Response, next: NextFunction) => {
  const uploadSingle = upload.single('file');

  uploadSingle(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: `File size exceeds the maximum allowed limit of ${config.maxFileSizeMB}MB.`
        });
      }
      return res.status(400).json({
        success: false,
        error: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: err.message || 'File upload failed validation.'
      });
    }

    next();
  });
};

