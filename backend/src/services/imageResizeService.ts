import fs from 'fs';
import sharp from 'sharp';
import { ResizeOptions, ImageProcessResult } from './imageTypes';
import { createOutputPath } from './fileStoreService';

type SharpFit = 'contain' | 'cover' | 'fill' | 'inside' | 'outside';

export const resizeImage = async (
  inputPath: string,
  options: ResizeOptions = {}
): Promise<ImageProcessResult> => {
  const originalStats = await fs.promises.stat(inputPath);
  const originalSize = originalStats.size;

  const image = sharp(inputPath, { failOn: 'error' });
  const meta = await image.metadata();

  if (!meta.format || !['jpeg', 'jpg', 'png', 'webp', 'gif', 'svg'].includes(meta.format.toLowerCase())) {
    throw new Error(`Unsupported image format '${meta.format}'. Resizing supports JPEG, PNG, and WebP.`);
  }

  const format = meta.format.toLowerCase() === 'jpeg' ? 'jpg' : meta.format.toLowerCase();
  const origWidth = meta.width || 800;
  const origHeight = meta.height || 600;

  let targetWidth: number | undefined = options.width ? Math.round(options.width) : undefined;
  let targetHeight: number | undefined = options.height ? Math.round(options.height) : undefined;

  // Handle scale percentage
  if (options.scalePercent && options.scalePercent > 0 && options.scalePercent <= 500) {
    const factor = options.scalePercent / 100;
    targetWidth = Math.max(1, Math.round(origWidth * factor));
    targetHeight = Math.max(1, Math.round(origHeight * factor));
  }

  if (!targetWidth && !targetHeight) {
    throw new Error('Please specify at least a width, height, or scale percentage.');
  }

  // Determine fit mode
  const fitMode: SharpFit =
    options.maintainAspectRatio === false
      ? 'fill'
      : (options.fit as SharpFit) || 'inside';

  // Create output destination
  const { outputFileId, outputPath, outputFilename } = createOutputPath(format);

  // Resize pipeline
  let pipeline = image.rotate().resize({
    width: targetWidth,
    height: targetHeight,
    fit: fitMode,
    withoutEnlargement: false
  });

  await pipeline.toFile(outputPath);

  // Verify output
  const resultStats = await fs.promises.stat(outputPath);
  const resultSize = resultStats.size;
  const resultMeta = await sharp(outputPath).metadata();

  const savedBytes = Math.max(0, originalSize - resultSize);
  const reductionPercent = originalSize > 0 ? Math.round(((originalSize - resultSize) / originalSize) * 100) : 0;

  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp'
  };

  return {
    success: true,
    outputFileId,
    outputFilename,
    mimeType: mimeMap[format] || `image/${format}`,
    format,
    original: {
      width: origWidth,
      height: origHeight,
      format,
      size: originalSize
    },
    result: {
      width: resultMeta.width || targetWidth,
      height: resultMeta.height || targetHeight,
      format,
      size: resultSize
    },
    savedBytes,
    reductionPercent: Math.max(0, reductionPercent),
    isOptimized: reductionPercent > 0,
    message: `Resized to ${resultMeta.width}x${resultMeta.height} px.`
  };
};
