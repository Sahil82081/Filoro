export interface ImageMetadata {
  width?: number;
  height?: number;
  format?: string;
  size: number;
}

export interface ImageProcessResult {
  success: boolean;
  outputFileId: string;
  outputFilename: string;
  mimeType: string;
  format: string;
  original: ImageMetadata;
  result: ImageMetadata;
  savedBytes: number;
  reductionPercent: number;
  isOptimized: boolean;
  message?: string;
}

export interface CompressOptions {
  preset?: 'light' | 'balanced' | 'strong';
  quality?: number; // 1-100
  stripMetadata?: boolean;
}

export interface ResizeOptions {
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  fit?: 'inside' | 'cover' | 'contain' | 'fill';
  scalePercent?: number; // e.g. 50 for 50%
}

export interface ConvertOptions {
  targetFormat: 'jpg' | 'jpeg' | 'png' | 'webp';
  quality?: number; // 1-100
}
