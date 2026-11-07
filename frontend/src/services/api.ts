const API_BASE_URL =
  import.meta.env?.VITE_API_URL ||
  (import.meta.env?.PROD ? '/api' : 'http://localhost:5000/api');

export interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
}

export interface UploadedFileMetadata {
  fileId: string;
  originalName: string;
  mimeType: string;
  size: number;
  extension: string;
  uploadedAt: string;
}

export interface UploadResponse {
  success: boolean;
  message?: string;
  file?: UploadedFileMetadata;
  error?: string;
}

export interface ImageDimension {
  width?: number;
  height?: number;
  format?: string;
  size: number;
}

export interface ValidationItem {
  label: string;
  expected: string;
  actual: string;
  passed: boolean;
  message?: string;
}

export interface PhotoResizeResponse {
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
  error?: string;
}

export interface ImageProcessResponse {
  success: boolean;
  outputFileId: string;
  outputFilename: string;
  mimeType: string;
  format: string;
  original: ImageDimension;
  result: ImageDimension;
  savedBytes: number;
  reductionPercent: number;
  isOptimized: boolean;
  message?: string;
  error?: string;
}

export const checkHealth = async (): Promise<HealthResponse> => {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const uploadFile = (
  file: File,
  onProgress?: (percentage: number) => void
): Promise<UploadResponse> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);

    xhr.open('POST', `${API_BASE_URL}/upload`);

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      try {
        const response: UploadResponse = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && response.success) {
          resolve(response);
        } else {
          reject(new Error(response.error || `Upload failed with status ${xhr.status}`));
        }
      } catch {
        reject(new Error(`Server error (${xhr.status}): Failed to parse response`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error: Unable to reach the server.'));
    };

    xhr.send(formData);
  });
};

export const deleteUploadedFile = async (fileId: string): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE_URL}/upload/${fileId}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch {
    return false;
  }
};

export const compressImageApi = async (
  fileId: string,
  options: { preset?: string; quality?: number; stripMetadata?: boolean }
): Promise<ImageProcessResponse> => {
  const res = await fetch(`${API_BASE_URL}/image/compress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId, ...options }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to compress image.');
  }
  return data;
};

export const resizeImageApi = async (
  fileId: string,
  options: {
    width?: number;
    height?: number;
    maintainAspectRatio?: boolean;
    fit?: string;
    scalePercent?: number;
  }
): Promise<ImageProcessResponse> => {
  const res = await fetch(`${API_BASE_URL}/image/resize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId, ...options }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to resize image.');
  }
  return data;
};

export const convertImageApi = async (
  fileId: string,
  options: { targetFormat: string; quality?: number }
): Promise<ImageProcessResponse> => {
  const res = await fetch(`${API_BASE_URL}/image/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId, ...options }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to convert image.');
  }
  return data;
};

export const processApplicationPhotoApi = async (
  fileId: string,
  options: {
    width: number;
    height: number;
    format?: string;
    fit?: string;
    maxSizeKB?: number;
    minSizeKB?: number;
    backgroundColor?: string;
  }
): Promise<PhotoResizeResponse> => {
  const res = await fetch(`${API_BASE_URL}/image/application-resize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId, ...options }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to process application image.');
  }
  return data;
};

export const getDownloadUrl = (outputFileId: string, originalName?: string): string => {
  const query = originalName ? `?name=${encodeURIComponent(originalName)}` : '';
  return `${API_BASE_URL}/download/${outputFileId}${query}`;
};

export const getPreviewUrl = (fileId: string): string => {
  return `${API_BASE_URL}/preview/${fileId}`;
};

export type PdfCompressionMode = 'basic' | 'strong' | 'target';

export interface PdfCompressRequest {
  fileId: string;
  mode: PdfCompressionMode;
  targetSizeKB?: number;
  originalName?: string;
}

export interface PdfCompressResponse {
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

export const compressPdf = async (
  payload: PdfCompressRequest
): Promise<PdfCompressResponse> => {
  const res = await fetch(`${API_BASE_URL}/pdf/compress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to compress PDF.');
  }
  return data;
};

export interface TargetCompressRequest {
  fileId: string;
  targetSizeKB: number;
  originalName?: string;
  maxIterations?: number;
}

export interface TargetCompressResponse {
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

export const targetCompressApi = async (
  payload: TargetCompressRequest
): Promise<TargetCompressResponse> => {
  const res = await fetch(`${API_BASE_URL}/target/compress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to compress to target size.');
  }
  return data;
};

// ==========================================
// STAGE 9: PDF Organize & Utility APIs
// ==========================================

export interface PdfPageMeta {
  pageNumber: number;
  width: number;
  height: number;
  rotation: number;
}

export interface PdfInfoResponse {
  success: boolean;
  pageCount: number;
  fileSize: number;
  pages: PdfPageMeta[];
  message?: string;
  error?: string;
}

export interface PdfOrganizeResponse {
  success: boolean;
  fileId: string;
  outputFilename: string;
  mimeType: string;
  pageCount?: number;
  fileSize: number;
  isZip?: boolean;
  downloadUrl: string;
  previewUrl?: string;
  message: string;
  error?: string;
}

export const getPdfInfoApi = async (fileId: string): Promise<PdfInfoResponse> => {
  const res = await fetch(`${API_BASE_URL}/pdf/organize/info/${fileId}`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to inspect PDF.');
  }
  return data;
};

export const mergePdfsApi = async (
  fileIds: string[],
  outputName?: string
): Promise<PdfOrganizeResponse> => {
  const res = await fetch(`${API_BASE_URL}/pdf/organize/merge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileIds, outputName })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to merge PDFs.');
  }
  return data;
};

export const splitPdfApi = async (
  fileId: string,
  mode: 'range' | 'every_page',
  pageRanges?: string,
  outputName?: string
): Promise<PdfOrganizeResponse> => {
  const res = await fetch(`${API_BASE_URL}/pdf/organize/split`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId, mode, pageRanges, outputName })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to split PDF.');
  }
  return data;
};

export const extractPdfPagesApi = async (
  fileId: string,
  pageNumbers: number[],
  outputName?: string
): Promise<PdfOrganizeResponse> => {
  const res = await fetch(`${API_BASE_URL}/pdf/organize/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId, pageNumbers, outputName })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to extract PDF pages.');
  }
  return data;
};

export const reorderPdfPagesApi = async (
  fileId: string,
  newPageOrder: number[],
  outputName?: string
): Promise<PdfOrganizeResponse> => {
  const res = await fetch(`${API_BASE_URL}/pdf/organize/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId, newPageOrder, outputName })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to reorder PDF pages.');
  }
  return data;
};

export const rotatePdfPagesApi = async (
  fileId: string,
  angle: 90 | 180 | 270,
  pageNumbers?: number[],
  outputName?: string
): Promise<PdfOrganizeResponse> => {
  const res = await fetch(`${API_BASE_URL}/pdf/organize/rotate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileId, angle, pageNumbers, outputName })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to rotate PDF pages.');
  }
  return data;
};

// ==========================================
// STAGE 10: Document & Image Conversion APIs
// ==========================================

export interface ConvertPdfToImageRequest {
  fileId: string;
  format: 'jpg' | 'png';
  dpi?: number;
  pageNumbers?: number[];
  pageRange?: string;
  outputName?: string;
}

export interface ConvertImageToPdfRequest {
  fileIds: string[];
  pageSize?: 'fit' | 'a4';
  outputName?: string;
}

export interface ConvertOfficeToPdfRequest {
  fileId: string;
  originalName: string;
  outputName?: string;
}

export interface ConvertResponse {
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
  error?: string;
}

export const convertPdfToImageApi = async (
  payload: ConvertPdfToImageRequest
): Promise<ConvertResponse> => {
  const res = await fetch(`${API_BASE_URL}/convert/pdf-to-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to convert PDF to image.');
  }
  return data;
};

export const convertImageToPdfApi = async (
  payload: ConvertImageToPdfRequest
): Promise<ConvertResponse> => {
  const res = await fetch(`${API_BASE_URL}/convert/image-to-pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to convert image(s) to PDF.');
  }
  return data;
};

export const convertOfficeToPdfApi = async (
  payload: ConvertOfficeToPdfRequest
): Promise<ConvertResponse> => {
  const res = await fetch(`${API_BASE_URL}/convert/office-to-pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to convert document to PDF.');
  }
  return data;
};

// ==========================================
// STAGE 11: Document Compression APIs (DOC, DOCX, PPT, PPTX)
// ==========================================

export interface DocCompressRequest {
  fileId: string;
  originalName: string;
  imageQuality?: number;
  maxImageDimension?: number;
  modernizeLegacy?: boolean;
  outputName?: string;
}

export interface DocCompressResponse {
  success: boolean;
  fileId: string;
  outputFilename: string;
  mimeType: string;
  format: 'doc' | 'docx' | 'ppt' | 'pptx';
  originalSize: number;
  resultSize: number;
  savedBytes: number;
  reductionPercent: number;
  isOptimized: boolean;
  imagesOptimizedCount: number;
  downloadUrl: string;
  message: string;
  note?: string;
  error?: string;
}

export const compressDocumentApi = async (
  payload: DocCompressRequest
): Promise<DocCompressResponse> => {
  const res = await fetch(`${API_BASE_URL}/document/compress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to compress document.');
  }
  return data;
};

// ==========================================
// STAGE 12: OCR & Text Extractor Suite APIs
// ==========================================

export interface OcrPageResult {
  pageNumber: number;
  text: string;
  confidence: number;
  wordCount: number;
  charCount: number;
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
  error?: string;
}

export interface ImageToTextRequest {
  fileId: string;
  language?: string;
  preprocess?: boolean;
  originalName?: string;
}

export interface PdfOcrRequest {
  fileId: string;
  language?: string;
  targetPages?: number[];
  originalName?: string;
}

export const ocrImageToTextApi = async (
  payload: ImageToTextRequest
): Promise<OcrResponse> => {
  const res = await fetch(`${API_BASE_URL}/ocr/image-to-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to extract text from image.');
  }
  return data;
};

export const ocrPdfToTextApi = async (
  payload: PdfOcrRequest
): Promise<OcrResponse> => {
  const res = await fetch(`${API_BASE_URL}/ocr/pdf-to-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to extract text from scanned PDF.');
  }
  return data;
};

export const ocrPdfToWordApi = async (
  payload: PdfOcrRequest
): Promise<OcrResponse> => {
  const res = await fetch(`${API_BASE_URL}/ocr/pdf-to-word`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to convert scanned PDF to Word document.');
  }
  return data;
};

// ==========================================
// STAGE 13: PDF Manipulation Suite APIs (Crop, Watermark, Numbers, Protect, Sign)
// ==========================================

export interface PdfModifyResponse {
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
  error?: string;
}

export interface CropPdfRequest {
  fileId: string;
  originalName: string;
  top: number;
  bottom: number;
  left: number;
  right: number;
  unit?: 'points' | 'percent';
  targetPages?: number[];
}

export interface WatermarkPdfRequest {
  fileId: string;
  originalName: string;
  text: string;
  position?: 'center-diagonal' | 'center-horizontal' | 'top' | 'bottom';
  opacity?: number;
  fontSize?: number;
  color?: 'gray' | 'red' | 'blue' | 'black';
  targetPages?: number[];
}

export interface PageNumbersPdfRequest {
  fileId: string;
  originalName: string;
  position?: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right';
  format?: string;
  startNumber?: number;
  skipFirstPage?: boolean;
  fontSize?: number;
  color?: 'gray' | 'black';
}

export interface ProtectPdfRequest {
  fileId: string;
  originalName: string;
  userPassword: string;
  ownerPassword?: string;
}

export interface SignPdfRequest {
  fileId: string;
  originalName: string;
  signatureType: 'text' | 'image';
  signerName?: string;
  signatureFileId?: string;
  page?: 'first' | 'last' | 'all' | number;
  position?: 'bottom-right' | 'bottom-left' | 'center' | 'top-right';
  signDate?: string;
  signReason?: string;
}

export const cropPdfApi = async (payload: CropPdfRequest): Promise<PdfModifyResponse> => {
  const res = await fetch(`${API_BASE_URL}/pdf/crop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to crop PDF document.');
  }
  return data;
};

export const watermarkPdfApi = async (payload: WatermarkPdfRequest): Promise<PdfModifyResponse> => {
  const res = await fetch(`${API_BASE_URL}/pdf/watermark`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to apply watermark.');
  }
  return data;
};

export const pageNumbersPdfApi = async (payload: PageNumbersPdfRequest): Promise<PdfModifyResponse> => {
  const res = await fetch(`${API_BASE_URL}/pdf/page-numbers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to stamp page numbers.');
  }
  return data;
};

export const protectPdfApi = async (payload: ProtectPdfRequest): Promise<PdfModifyResponse> => {
  const res = await fetch(`${API_BASE_URL}/pdf/protect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to password protect PDF.');
  }
  return data;
};

export const signPdfApi = async (payload: SignPdfRequest): Promise<PdfModifyResponse> => {
  const res = await fetch(`${API_BASE_URL}/pdf/sign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to sign PDF document.');
  }
  return data;
};

// ==========================================
// STAGE 14: BATCH PROCESSING TYPES & APIS
// ==========================================

export type BatchOperation = 'compress-image' | 'convert-image' | 'compress-pdf';

export interface BatchItemInput {
  fileId: string;
  originalName: string;
}

export interface BatchProcessOptions {
  quality?: number;
  targetFormat?: 'jpg' | 'png' | 'webp';
  compressionLevel?: 'basic' | 'strong';
}

export interface BatchProcessRequest {
  items: BatchItemInput[];
  operation: BatchOperation;
  options?: BatchProcessOptions;
}

export interface BatchUploadResponse {
  success: boolean;
  count: number;
  files: UploadedFileMetadata[];
  error?: string;
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
  totalOriginalBytes: number;
  totalResultBytes: number;
  totalSavedBytes: number;
  overallReductionPercent: number;
  zipDownloadUrl?: string;
  zipFileId?: string;
  items: BatchItemResult[];
  message: string;
}

export const batchUploadApi = async (files: File[]): Promise<BatchUploadResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const res = await fetch(`${API_BASE_URL}/batch/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to upload batch files.');
  }
  return data;
};

export const batchProcessApi = async (payload: BatchProcessRequest): Promise<BatchProcessResponse> => {
  const res = await fetch(`${API_BASE_URL}/batch/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to process batch.');
  }
  return data;
};
