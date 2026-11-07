import fs from 'fs';
import sharp from 'sharp';
import { createOutputPath } from './fileStoreService';

export interface PhotoResizeOptions {
  width: number;
  height: number;
  format?: 'jpg' | 'jpeg' | 'png' | 'webp';
  fit?: 'crop' | 'contain' | 'cover' | 'centered';
  maxSizeKB?: number;
  minSizeKB?: number;
  backgroundColor?: string;
}

export interface ValidationItem {
  label: string;
  expected: string;
  actual: string;
  passed: boolean;
  message?: string;
}

export interface PhotoResizeResult {
  success: boolean;
  outputFileId: string;
  outputFilename: string;
  mimeType: string;
  format: string;
  original: {
    width?: number;
    height?: number;
    format: string;
    size: number;
  };
  result: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
  validation: {
    widthMatches: boolean;
    heightMatches: boolean;
    formatMatches: boolean;
    maxSizeValid: boolean;
    minSizeValid: boolean;
    allValid: boolean;
    checklist: ValidationItem[];
  };
  message: string;
}

type SharpFit = 'contain' | 'cover' | 'fill' | 'inside' | 'outside';

export const processApplicationPhoto = async (
  inputPath: string,
  options: PhotoResizeOptions
): Promise<PhotoResizeResult> => {
  const originalStats = await fs.promises.stat(inputPath);
  const originalSize = originalStats.size;

  const originalImage = sharp(inputPath, { failOn: 'error' });
  const meta = await originalImage.metadata();

  if (!meta.format || !['jpeg', 'jpg', 'png', 'webp'].includes(meta.format.toLowerCase())) {
    throw new Error(`Unsupported image format '${meta.format}'. Please upload a JPG, PNG, or WebP image.`);
  }

  const origFormat = meta.format.toLowerCase() === 'jpeg' ? 'jpg' : meta.format.toLowerCase();

  const width = Math.max(10, Math.min(Math.round(options.width), 10000));
  const height = Math.max(10, Math.min(Math.round(options.height), 10000));

  let targetFormat = (options.format || 'jpg').toLowerCase().replace(/^\./, '');
  if (targetFormat === 'jpeg') targetFormat = 'jpg';
  if (!['jpg', 'png', 'webp'].includes(targetFormat)) {
    targetFormat = 'jpg';
  }

  // Map fit mode
  let fitMode: SharpFit = 'cover';
  let positionMode: string | number = 'center';

  if (options.fit === 'contain') {
    fitMode = 'contain';
  } else if (options.fit === 'centered') {
    fitMode = 'inside';
  } else if (options.fit === 'crop') {
    fitMode = 'cover';
    positionMode = 'attention'; // Crops keeping high-entropy/face regions in focus
  } else {
    fitMode = 'cover';
  }

  const { outputFileId, outputPath, outputFilename } = createOutputPath(targetFormat);

  const maxSizeBytes = options.maxSizeKB ? options.maxSizeKB * 1024 : undefined;
  const minSizeBytes = options.minSizeKB ? options.minSizeKB * 1024 : undefined;

  // File-size targeting loop (quality optimization)
  const qualitiesToTest = [85, 80, 75, 70, 60, 50, 40, 30, 20, 15, 10];
  let finalBuffer: Buffer | null = null;
  let lastSize = 0;

  for (let i = 0; i < qualitiesToTest.length; i++) {
    const q = qualitiesToTest[i];
    let pipeline = sharp(inputPath, { failOn: 'error' })
      .rotate()
      .resize({
        width,
        height,
        fit: fitMode,
        position: positionMode as any,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      });

    if (targetFormat === 'jpg') {
      if (meta.hasAlpha) {
        pipeline = pipeline.flatten({ background: { r: 255, g: 255, b: 255 } });
      }
      pipeline = pipeline.jpeg({ quality: q, mozjpeg: true });
    } else if (targetFormat === 'png') {
      const compressionLevel = q < 60 ? 9 : q < 80 ? 8 : 6;
      pipeline = pipeline.png({
        compressionLevel,
        palette: q <= 50,
        quality: q
      });
    } else if (targetFormat === 'webp') {
      pipeline = pipeline.webp({ quality: q, effort: 6 });
    }

    const currentBuffer = await pipeline.toBuffer();
    lastSize = currentBuffer.length;
    finalBuffer = currentBuffer;

    // If max size ceiling is provided, check if we are within budget
    if (maxSizeBytes) {
      if (lastSize <= maxSizeBytes) {
        // Fits under ceiling! Stop stepping down.
        break;
      }
    } else {
      // No ceiling provided, standard 85 quality is optimal
      break;
    }
  }

  // If min size was specified and current file is too small, try increasing quality
  if (minSizeBytes && lastSize < minSizeBytes && finalBuffer) {
    const higherQualities = [90, 95, 98, 100];
    for (const q of higherQualities) {
      let pipeline = sharp(inputPath, { failOn: 'error' })
        .rotate()
        .resize({
          width,
          height,
          fit: fitMode,
          position: positionMode as any,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        });

      if (targetFormat === 'jpg') {
        pipeline = pipeline.jpeg({ quality: q, mozjpeg: false });
      } else if (targetFormat === 'png') {
        pipeline = pipeline.png({ compressionLevel: 0 });
      } else if (targetFormat === 'webp') {
        pipeline = pipeline.webp({ quality: q });
      }

      const highBuffer = await pipeline.toBuffer();
      if (!maxSizeBytes || highBuffer.length <= maxSizeBytes) {
        finalBuffer = highBuffer;
        lastSize = highBuffer.length;
        if (lastSize >= minSizeBytes) break;
      }
    }
  }

  if (!finalBuffer) {
    throw new Error('Failed to generate image buffer.');
  }

  // Write finalized buffer to output path
  await fs.promises.writeFile(outputPath, finalBuffer);

  // Inspect generated output on disk
  const resultStats = await fs.promises.stat(outputPath);
  const actualSize = resultStats.size;
  const resultMeta = await sharp(outputPath).metadata();

  const actualWidth = resultMeta.width || width;
  const actualHeight = resultMeta.height || height;
  const actualFormat = (resultMeta.format || targetFormat).toLowerCase() === 'jpeg' ? 'jpg' : (resultMeta.format || targetFormat).toLowerCase();

  // Validate all requirements strictly
  const widthMatches = actualWidth === width;
  const heightMatches = actualHeight === height;
  const formatMatches = actualFormat === targetFormat;
  const maxSizeValid = maxSizeBytes ? actualSize <= maxSizeBytes : true;
  const minSizeValid = minSizeBytes ? actualSize >= minSizeBytes : true;
  const allValid = widthMatches && heightMatches && formatMatches && maxSizeValid && minSizeValid;

  const actualSizeKB = (actualSize / 1024).toFixed(1);

  // Build checklist items
  const checklist: ValidationItem[] = [
    {
      label: 'Width',
      expected: `${width} px`,
      actual: `${actualWidth} px`,
      passed: widthMatches,
      message: widthMatches ? 'Width correct' : `Width mismatch (expected ${width}px, got ${actualWidth}px)`
    },
    {
      label: 'Height',
      expected: `${height} px`,
      actual: `${actualHeight} px`,
      passed: heightMatches,
      message: heightMatches ? 'Height correct' : `Height mismatch (expected ${height}px, got ${actualHeight}px)`
    },
    {
      label: 'Format',
      expected: targetFormat.toUpperCase(),
      actual: actualFormat.toUpperCase(),
      passed: formatMatches,
      message: formatMatches ? 'Format correct' : `Format mismatch (expected ${targetFormat.toUpperCase()}, got ${actualFormat.toUpperCase()})`
    },
    {
      label: 'File Size',
      expected: maxSizeBytes
        ? minSizeBytes
          ? `${options.minSizeKB} KB - ${options.maxSizeKB} KB`
          : `Max ${options.maxSizeKB} KB`
        : minSizeBytes
          ? `Min ${options.minSizeKB} KB`
          : 'Any size',
      actual: `${actualSizeKB} KB (${actualSize.toLocaleString()} bytes)`,
      passed: maxSizeValid && minSizeValid,
      message: !maxSizeValid
        ? `File size exceeds maximum (${actualSizeKB} KB > ${options.maxSizeKB} KB)`
        : !minSizeValid
          ? `File size below minimum (${actualSizeKB} KB < ${options.minSizeKB} KB)`
          : 'File size correct'
    }
  ];

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
      width: actualWidth,
      height: actualHeight,
      format: actualFormat,
      size: actualSize
    },
    validation: {
      widthMatches,
      heightMatches,
      formatMatches,
      maxSizeValid,
      minSizeValid,
      allValid,
      checklist
    },
    message: allValid
      ? `All requirements satisfied (${actualWidth}x${actualHeight}px, ${actualFormat.toUpperCase()}, ${actualSizeKB} KB).`
      : 'Processed with some requirements not met.'
  };
};
