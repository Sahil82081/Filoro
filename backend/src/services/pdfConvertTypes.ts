export interface PdfToImageOptions {
  fileId: string;
  format: 'jpg' | 'png';
  dpi?: number;
  pageNumbers?: number[];
  pageRange?: string;
  outputName?: string;
}

export interface ImageToPdfOptions {
  fileIds: string[];
  pageSize?: 'fit' | 'a4';
  outputName?: string;
}

export interface OfficeToPdfOptions {
  fileId: string;
  originalName: string;
  outputName?: string;
}

export interface ConvertResult {
  success: boolean;
  fileId: string;
  outputFilename: string;
  mimeType: string;
  fileSize: number;
  pageCount?: number;
  isZip?: boolean;
  downloadUrl: string;
  previewUrl?: string;
  message: string;
  disclaimer?: string;
}

