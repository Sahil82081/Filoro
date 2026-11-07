export interface TargetCompressOptions {
  fileId: string;
  targetSizeKB: number;
  originalName?: string;
  maxIterations?: number;
}

export interface TargetCompressResult {
  success: boolean;
  fileId: string;
  fileType: 'pdf' | 'image';
  originalName: string;
  originalSize: number;
  targetSizeBytes: number;
  targetSizeFormatted: string;
  resultSize: number;
  savedBytes: number;
  savedPercentage: number;
  targetReached: boolean;
  iterations: number;
  processingTimeMs: number;
  downloadUrl: string;
  previewUrl: string;
  engineUsed: string;
  message: string;
  error?: string;
}

