export interface CropOptions {
  fileId: string;
  originalName?: string;
  top: number;       // Crop margin in points or percent
  bottom: number;
  left: number;
  right: number;
  unit?: 'points' | 'percent';
  targetPages?: number[];
}

export interface WatermarkOptions {
  fileId: string;
  originalName?: string;
  text: string;
  position?: 'center-diagonal' | 'center-horizontal' | 'top' | 'bottom';
  opacity?: number;  // 0.05 to 1.0 (default 0.25)
  fontSize?: number;
  color?: 'gray' | 'red' | 'blue' | 'black';
  targetPages?: number[];
}

export interface PageNumbersOptions {
  fileId: string;
  originalName?: string;
  position?: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right';
  format?: 'Page {page} of {total}' | 'Page {page}' | '{page} / {total}' | '{page}';
  startNumber?: number;
  skipFirstPage?: boolean;
  fontSize?: number;
  color?: 'gray' | 'black';
}

export interface PasswordProtectOptions {
  fileId: string;
  originalName?: string;
  userPassword: string;     // NEVER log this
  ownerPassword?: string;   // NEVER log this
}

export interface PdfSignOptions {
  fileId: string;
  originalName?: string;
  signatureType: 'text' | 'image';
  signerName?: string;
  signatureFileId?: string; // Uploaded signature image fileId
  page?: 'first' | 'last' | 'all' | number;
  position?: 'bottom-right' | 'bottom-left' | 'center' | 'top-right';
  signDate?: string;
  signReason?: string;
}

export interface PdfModifyResult {
  success: boolean;
  operation: 'crop' | 'watermark' | 'page-numbers' | 'protect' | 'sign';
  fileId: string;
  outputFilename: string;
  fileSize: number;
  pageCount: number;
  downloadUrl: string;
  previewUrl?: string;
  message: string;
  isProtected?: boolean;
}

