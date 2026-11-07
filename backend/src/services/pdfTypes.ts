export type PdfCompressionMode = 'basic' | 'strong' | 'target';

export interface PdfCompressOptions {
  fileId: string;
  mode: PdfCompressionMode;
  targetSizeKB?: number;
  originalName?: string;
}

export interface PdfCompressResult {
  success: boolean;
  fileId: string;
  originalName?: string;
  originalSize: number;
  resultSize: number;
  savedBytes: number;
  savedPercentage: number;
  mode: PdfCompressionMode;
  targetSizeKB?: number;
  targetReached?: boolean;
  downloadUrl: string;
  previewUrl: string;
  engineUsed: string;
  message?: string;
  error?: string;
}

