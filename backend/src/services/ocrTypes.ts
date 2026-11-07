export interface OcrPageResult {
  pageNumber: number;
  text: string;
  confidence: number;
  wordCount: number;
  charCount: number;
}

export interface ImageToTextOptions {
  fileId: string;
  language?: string;
  preprocess?: boolean;
  originalName?: string;
}

export interface PdfOcrOptions {
  fileId: string;
  language?: string;
  targetPages?: number[];
  outputFormat?: 'text' | 'docx';
  originalName?: string;
}

export interface OcrResponse {
  success: boolean;
  tool: 'image-to-text' | 'pdf-to-text' | 'pdf-to-word';
  text: string;
  confidence: number;
  wordCount: number;
  characterCount: number;
  pageCount: number;
  pages?: OcrPageResult[];
  textFileId?: string;
  textDownloadUrl?: string;
  docxFileId?: string;
  docxDownloadUrl?: string;
  originalName?: string;
  message: string;
  accuracyNotice: string;
  processingTimeMs: number;
}

export { ImageToPdfOptions } from './pdfConvertTypes';
