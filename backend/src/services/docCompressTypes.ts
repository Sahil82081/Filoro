export type DocFormat = 'doc' | 'docx' | 'ppt' | 'pptx';

export interface DocCompressOptions {
  fileId: string;
  originalName: string;
  imageQuality?: number; // 10 - 90, default 75
  maxImageDimension?: number; // default 1920
  modernizeLegacy?: boolean; // convert doc->docx or ppt->pptx for maximum compression
  outputName?: string;
}

export interface DocCompressResult {
  success: boolean;
  fileId: string;
  outputFilename: string;
  mimeType: string;
  format: DocFormat;
  originalSize: number;
  resultSize: number;
  savedBytes: number;
  reductionPercent: number;
  isOptimized: boolean;
  imagesOptimizedCount: number;
  downloadUrl: string;
  message: string;
  note?: string;
}

