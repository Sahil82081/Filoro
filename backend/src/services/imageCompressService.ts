import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Disable Sharp libvips file cache to avoid locking files on Windows
sharp.cache(false);
import { CompressOptions, ImageProcessResult } from './imageTypes';
import { createOutputPath } from './fileStoreService';

export const compressImage = async (
  inputPath: string,
  options: CompressOptions = {}
): Promise<ImageProcessResult> => {
  const originalStats = await fs.promises.stat(inputPath);
  const originalSize = originalStats.size;

  const image = sharp(inputPath, { failOn: 'error' });
  const meta = await image.metadata();

  if (!meta.format || !['jpeg', 'jpg', 'png', 'webp'].includes(meta.format.toLowerCase())) {
    throw new Error(`Unsupported image format '${meta.format}'. Compression supports JPEG, PNG, and WebP.`);
  }

  const format = meta.format.toLowerCase() === 'jpeg' ? 'jpg' : meta.format.toLowerCase();

  // Determine quality level
  let quality = 75; // default balanced
  if (options.quality && options.quality >= 1 && options.quality <= 100) {
    quality = Math.round(options.quality);
  } else if (options.preset === 'light') {
    quality = 85;
  } else if (options.preset === 'strong') {
    quality = 60;
  }

  // Create output destination
  const { outputFileId, outputPath, outputFilename } = createOutputPath(format);

  // Apply format-specific compression pipeline
  let pipeline = image.rotate(); // Normalizes orientation

  if (options.stripMetadata !== false) {
    // Sharp strips EXIF metadata by default when not calling .withMetadata()
  }

  if (format === 'jpg') {
    pipeline = pipeline.jpeg({
      quality,
      mozjpeg: true,
      chromaSubsampling: quality < 80 ? '4:2:0' : '4:4:4'
    });
  } else if (format === 'png') {
    const compressionLevel = quality < 70 ? 9 : quality < 85 ? 8 : 6;
    pipeline = pipeline.png({
      compressionLevel,
      palette: options.preset === 'strong' || quality <= 60,
      quality
    });
  } else if (format === 'webp') {
    pipeline = pipeline.webp({
      quality,
      effort: 6
    });
  }

  await pipeline.toFile(outputPath);

  // Verify output
  const resultStats = await fs.promises.stat(outputPath);
  const resultSize = resultStats.size;
  const resultMeta = await sharp(outputPath).metadata();

  const savedBytes = Math.max(0, originalSize - resultSize);
  const reductionPercent = originalSize > 0 ? Math.round(((originalSize - resultSize) / originalSize) * 100) : 0;
  const isAlreadyOptimized = resultSize >= originalSize;

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
      width: meta.width,
      height: meta.height,
      format,
      size: originalSize
    },
    result: {
      width: resultMeta.width || meta.width,
      height: resultMeta.height || meta.height,
      format,
      size: resultSize
    },
    savedBytes: isAlreadyOptimized ? 0 : savedBytes,
    reductionPercent: isAlreadyOptimized ? 0 : Math.max(0, reductionPercent),
    isOptimized: isAlreadyOptimized,
    message: isAlreadyOptimized
      ? 'This image is already well-optimized at this quality level.'
      : `Successfully compressed by ${reductionPercent}% (saved ${(savedBytes / 1024).toFixed(1)} KB)`
  };
};
