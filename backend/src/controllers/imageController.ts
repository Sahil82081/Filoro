import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import {
  findUploadFile,
  findOutputFile,
  compressImage,
  resizeImage,
  convertImage,
  processApplicationPhoto
} from '../services';
import { cleanupFile } from '../utils/cleanup';

const sanitizeError = (err: any, fallback: string): string => {
  const msg = err instanceof Error ? err.message : fallback;
  return msg.replace(/([A-Za-z]:\\[\w\s.-]+|\/[\w\s.-]+)+/g, '[sanitized_path]');
};

export const handleCompress = async (req: Request, res: Response) => {
  const { fileId, preset, quality, stripMetadata } = req.body;

  if (!fileId) {
    return res.status(400).json({ success: false, error: 'File ID is required.' });
  }

  const inputPath = await findUploadFile(fileId);
  if (!inputPath) {
    return res.status(404).json({ success: false, error: 'Uploaded file not found or expired.' });
  }

  try {
    const result = await compressImage(inputPath, {
      preset,
      quality: quality ? parseInt(quality, 10) : undefined,
      stripMetadata: stripMetadata !== undefined ? Boolean(stripMetadata) : true
    });

    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Image compress error:', err);
    return res.status(500).json({
      success: false,
      error: sanitizeError(err, 'Image compression failed.')
    });
  } finally {
    await cleanupFile(inputPath);
  }
};

export const handleResize = async (req: Request, res: Response) => {
  const { fileId, width, height, maintainAspectRatio, fit, scalePercent } = req.body;

  if (!fileId) {
    return res.status(400).json({ success: false, error: 'File ID is required.' });
  }

  const inputPath = await findUploadFile(fileId);
  if (!inputPath) {
    return res.status(404).json({ success: false, error: 'Uploaded file not found or expired.' });
  }

  try {
    const result = await resizeImage(inputPath, {
      width: width ? parseInt(width, 10) : undefined,
      height: height ? parseInt(height, 10) : undefined,
      maintainAspectRatio: maintainAspectRatio !== undefined ? Boolean(maintainAspectRatio) : true,
      fit,
      scalePercent: scalePercent ? parseInt(scalePercent, 10) : undefined
    });

    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Image resize error:', err);
    return res.status(500).json({
      success: false,
      error: sanitizeError(err, 'Image resizing failed.')
    });
  } finally {
    await cleanupFile(inputPath);
  }
};

export const handleConvert = async (req: Request, res: Response) => {
  const { fileId, targetFormat, quality } = req.body;

  if (!fileId) {
    return res.status(400).json({ success: false, error: 'File ID is required.' });
  }

  if (!targetFormat) {
    return res.status(400).json({ success: false, error: 'Target format is required (jpg, png, webp).' });
  }

  const inputPath = await findUploadFile(fileId);
  if (!inputPath) {
    return res.status(404).json({ success: false, error: 'Uploaded file not found or expired.' });
  }

  try {
    const result = await convertImage(inputPath, {
      targetFormat,
      quality: quality ? parseInt(quality, 10) : undefined
    });

    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Image convert error:', err);
    return res.status(500).json({
      success: false,
      error: sanitizeError(err, 'Image conversion failed.')
    });
  } finally {
    await cleanupFile(inputPath);
  }
};

export const handleApplicationResize = async (req: Request, res: Response) => {
  const { fileId, width, height, format, fit, maxSizeKB, minSizeKB, backgroundColor } = req.body;

  if (!fileId) {
    return res.status(400).json({ success: false, error: 'File ID is required.' });
  }

  if (!width || !height) {
    return res.status(400).json({ success: false, error: 'Both width and height are required.' });
  }

  const inputPath = await findUploadFile(fileId);
  if (!inputPath) {
    return res.status(404).json({ success: false, error: 'Uploaded file not found or expired.' });
  }

  try {
    const result = await processApplicationPhoto(inputPath, {
      width: parseInt(width, 10),
      height: parseInt(height, 10),
      format,
      fit,
      maxSizeKB: maxSizeKB ? parseInt(maxSizeKB, 10) : undefined,
      minSizeKB: minSizeKB ? parseInt(minSizeKB, 10) : undefined,
      backgroundColor
    });

    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Application photo resize error:', err);
    return res.status(500).json({
      success: false,
      error: sanitizeError(err, 'Application image resizing failed.')
    });
  } finally {
    await cleanupFile(inputPath);
  }
};

export const handleDownload = async (req: Request, res: Response) => {
  const { fileId } = req.params;
  const originalName = req.query.name as string | undefined;

  if (!fileId) {
    return res.status(400).json({ success: false, error: 'File ID is required.' });
  }

  const outputPath = await findOutputFile(fileId);
  if (!outputPath || !fs.existsSync(outputPath)) {
    return res.status(404).json({ success: false, error: 'Processed file not found or expired.' });
  }

  const ext = path.extname(outputPath);
  const downloadName = originalName
    ? `${path.parse(originalName).name}_optimized${ext}`
    : path.basename(outputPath);

  res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
  res.sendFile(outputPath);
};

export const handlePreview = async (req: Request, res: Response) => {
  const { fileId } = req.params;

  if (!fileId) {
    return res.status(400).json({ success: false, error: 'File ID is required.' });
  }

  // Look in outputs first, then in uploads
  const targetPath = (await findOutputFile(fileId)) || (await findUploadFile(fileId));
  if (!targetPath || !fs.existsSync(targetPath)) {
    return res.status(404).json({ success: false, error: 'File not found.' });
  }

  res.setHeader('Content-Disposition', 'inline');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.sendFile(targetPath);
};
