export interface PageMeta {
  pageNumber: number; // 1-indexed
  width: number;
  height: number;
  rotation: number;
}

export interface PdfInfoResult {
  success: boolean;
  fileId: string;
  originalName: string;
  pageCount: number;
  fileSize: number;
  pages: PageMeta[];
}

export interface PdfOrganizeResult {
  success: boolean;
  fileId: string;
  outputFilename: string;
  mimeType: string;
  pageCount: number;
  fileSize: number;
  downloadUrl: string;
  previewUrl?: string;
  isZip?: boolean;
  message: string;
  error?: string;
}

export interface MergePdfOptions {
  fileIds: string[];
  outputName?: string;
}

export interface SplitPdfOptions {
  fileId: string;
  mode: 'range' | 'every_page';
  pageRanges?: string; // e.g. "1-3, 5, 7-10"
  outputName?: string;
}

export interface ExtractPagesOptions {
  fileId: string;
  pageNumbers: number[]; // 1-indexed, e.g. [1, 3, 5]
  outputName?: string;
}

export interface ReorderPagesOptions {
  fileId: string;
  newPageOrder: number[]; // 1-indexed array of all or subset of pages in new sequence
  outputName?: string;
}

export interface RotatePagesOptions {
  fileId: string;
  angle: 90 | 180 | 270;
  pageNumbers?: number[]; // If undefined/empty, rotates all pages
  outputName?: string;
}

