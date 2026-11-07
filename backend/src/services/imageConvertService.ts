import fs from 'fs';
import sharp from 'sharp';

// Disable Sharp libvips file cache to avoid locking files on Windows
sharp.cache(false);
import { ConvertOptions, ImageProcessResult } from './imageTypes';
import { createOutputPath } from './fileStoreService';

export const convertImage = async (
  inputPath: string,
  options: ConvertOptions
): Promise<ImageProcessResult> => {
  const originalStats = await fs.promises.stat(inputPath);
  const originalSize = originalStats.size;

  const image = sharp(inputPath, { failOn: 'error' });
  const meta = await image.metadata();

  if (!meta.format) {
    throw new Error('Could not identify image format.');
  }

  const origFormat = meta.format.toLowerCase() === 'jpeg' ? 'jpg' : meta.format.toLowerCase();
  let targetFormat = options.targetFormat.toLowerCase().replace(/^\./, '');
  if (targetFormat === 'jpeg') targetFormat = 'jpg';

  if (!['jpg', 'png', 'webp'].includes(targetFormat)) {
    throw new Error(`Target format '${targetFormat}' is not supported. Supported: JPG, PNG, WebP.`);
  }

  const quality = options.quality && options.quality >= 1 && options.quality <= 100
    ? Math.round(options.quality)
    : targetFormat === 'webp' ? 80 : 85;

  // Create output destination
  const { outputFileId, outputPath, outputFilename } = createOutputPath(targetFormat);

  // Conversion pipeline
  let pipeline = image.rotate();

  if (targetFormat === 'jpg') {
    // If original image had alpha channel (transparency), flatten onto white background
    if (meta.hasAlpha) {
      pipeline = pipeline.flatten({ background: { r: 255, g: 255, b: 255 } });
    }
    pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  } else if (targetFormat === 'png') {
    pipeline = pipeline.png({ compressionLevel: 8 });
  } else if (targetFormat === 'webp') {
    pipeline = pipeline.webp({ quality, effort: 6 });
  }

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
    mimeType: mimeMap[targetFormat] || `image/${targetFormat}`,
    format: targetFormat,
    original: {
      width: meta.width,
      height: meta.height,
      format: origFormat,
      size: originalSize
    },
    result: {
      width: resultMeta.width || meta.width,
      height: resultMeta.height || meta.height,
      format: targetFormat,
      size: resultSize
    },
    savedBytes,
    reductionPercent: Math.max(0, reductionPercent),
    isOptimized: reductionPercent > 0,
    message: `Converted from ${origFormat.toUpperCase()} to ${targetFormat.toUpperCase()}.`
  };
};
