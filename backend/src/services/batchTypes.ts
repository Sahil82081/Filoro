export interface BatchItemInput {
  fileId: string;
  originalName: string;
}

export type BatchOperation = 'compress-image' | 'convert-image' | 'compress-pdf';

export interface BatchProcessOptions {
  files: BatchItemInput[];
  operation: BatchOperation;
  quality?: number;
  preset?: 'light' | 'balanced' | 'strong';
  targetFormat?: 'webp' | 'jpg' | 'png';
  mode?: 'basic' | 'strong';
}

export interface BatchItemResult {
  fileId: string;
  originalName: string;
  status: 'success' | 'error';
  outputFileId?: string;
  outputFilename?: string;
  downloadUrl?: string;
  originalSize?: number;
  resultSize?: number;
  savedBytes?: number;
  reductionPercent?: number;
  message?: string;
  error?: string;
}

export interface BatchProcessResponse {
  success: boolean;
  operation: BatchOperation;
  totalFiles: number;
  successCount: number;
  failureCount: number;
  items: BatchItemResult[];
  zipFileId?: string;
  zipDownloadUrl?: string;
  totalOriginalSize: number;
  totalResultSize: number;
  totalSavedBytes: number;
  overallReductionPercent: number;
  processingTimeMs: number;
  message: string;
}

