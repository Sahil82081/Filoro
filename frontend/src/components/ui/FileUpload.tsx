import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  FileImage,
  FileArchive,
  FileCode,
  File,
  X,
  AlertCircle,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';
import { Progress } from './Progress';
import { uploadFile, UploadedFileMetadata } from '../../services/api';

export interface FileUploadProps {
  accept?: string;
  maxSizeMB?: number;
  autoUpload?: boolean;
  onFileSelect?: (file: File | null) => void;
  onUploadSuccess?: (metadata: UploadedFileMetadata) => void;
  onUploadError?: (error: string) => void;
  onFileRemove?: () => void;
  className?: string;
}

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  maxSizeMB = 50,
  autoUpload = true,
  onFileSelect,
  onUploadSuccess,
  onUploadError,
  onFileRemove,
  className = '',
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedData, setUploadedData] = useState<UploadedFileMetadata | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Create & cleanup object URL for image previews
  useEffect(() => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreview(null);
    }
  }, [file]);

  const validateFile = (selectedFile: File): string | null => {
    // 1. Size validation
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      return `File exceeds maximum limit of ${maxSizeMB}MB (${formatSize(selectedFile.size)}).`;
    }

    if (selectedFile.size === 0) {
      return 'File is empty (0 bytes).';
    }

    // 2. Extension validation if accept is specified
    if (accept) {
      const allowedExts = accept
        .split(',')
        .map((ext) => ext.trim().toLowerCase().replace(/^\./, ''));
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase() || '';

      if (!allowedExts.includes(fileExt) && !allowedExts.includes('*')) {
        return `File format '.${fileExt}' is not allowed. Supported: ${accept}`;
      }
    }

    return null;
  };

  const processUpload = async (fileToUpload: File) => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const res = await uploadFile(fileToUpload, (percent) => {
        setProgress(percent);
      });

      if (res.success && res.file) {
        setUploadedData(res.file);
        if (onUploadSuccess) {
          onUploadSuccess(res.file);
        }
      }
    } catch (err: any) {
      const msg = err.message || 'File upload failed.';
      setError(msg);
      if (onUploadError) {
        onUploadError(msg);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectedFile = (selectedFile: File) => {
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      setFile(null);
      setUploadedData(null);
      if (onUploadError) onUploadError(validationError);
      return;
    }

    setError(null);
    setFile(selectedFile);
    setUploadedData(null);
    if (onFileSelect) onFileSelect(selectedFile);

    if (autoUpload) {
      processUpload(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const removeFile = () => {
    setFile(null);
    setImagePreview(null);
    setUploadedData(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileRemove) onFileRemove();
  };

  const getFileCategoryIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-[#FF7900]" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
        return <FileImage className="w-6 h-6 text-[#FFBF00]" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <FileArchive className="w-6 h-6 text-[#FF7900]" />;
      case 'json':
      case 'csv':
      case 'txt':
      case 'md':
      case 'docx':
        return <FileCode className="w-6 h-6 text-[#F2CF7E]" />;
      default:
        return <File className="w-6 h-6 text-[#666666] dark:text-[#B8AF9F]" />;
    }
  };

  return (
    <div className={`w-full space-y-3 ${className}`}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept={accept}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleSelectedFile(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* Dropzone Area with Keyboard Accessibility & Focus Indicator */}
      {!file ? (
        <motion.div
          tabIndex={0}
          role="button"
          aria-label="Upload file dropzone. Press Enter or Space to open file picker, or drag and drop a file here."
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          whileHover={!shouldReduceMotion ? { scale: 1.005 } : undefined}
          whileTap={!shouldReduceMotion ? { scale: 0.995 } : undefined}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3.5 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFBF00] ${
            isDragOver
              ? 'border-[#FFBF00] bg-[#FBF3DF]/70 dark:bg-[#251F17] ring-2 ring-[#FFBF00]/30'
              : 'border-[#EDE7D9] dark:border-[#332B20] hover:border-[#FFBF00] dark:hover:border-[#FFBF00] bg-[#FFFFFF] dark:bg-[#1E1913] hover:bg-[#FBF3DF]/25 dark:hover:bg-[#251F17] shadow-warm-card'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF7900]/15 to-[#FFBF00]/25 dark:from-[#FF7900]/25 dark:to-[#FFBF00]/35 border border-[#F2CF7E] dark:border-[#4A3D2A] flex items-center justify-center text-[#FF7900] shadow-warm-sm">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div>
            <h4 className="text-sm sm:text-base font-display font-bold text-[#202020] dark:text-[#FFFDF7]">
              {isDragOver ? 'Drop file to upload' : 'Click to upload or drag & drop'}
            </h4>
            <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-1 max-w-sm">
              {accept ? `Supports: ${accept}` : 'Supports PDF, Images, Documents, and Archives'} (up to {maxSizeMB}MB)
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Browse from Computer
          </Button>

          <p className="text-[11px] text-[#666666]/70 dark:text-[#B8AF9F]/70 max-w-xs text-center">
            Files are temporarily processed on our server and automatically deleted after processing.
          </p>
        </motion.div>
      ) : (
        /* Selected & Uploaded File Card */
        <AnimatePresence mode="wait">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            className="rounded-2xl border border-[#EDE7D9] dark:border-[#332B20] bg-[#FFFFFF] dark:bg-[#1E1913] p-5 shadow-warm-card space-y-4"
          >
            <div className="flex items-start gap-4">
              {/* Thumbnail preview for images or icon */}
              {imagePreview ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#EDE7D9] dark:border-[#332B20] shrink-0 bg-[#F8F5EE] dark:bg-[#17130E] shadow-warm-sm group">
                  <img
                    src={imagePreview}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[#FFFFFF]">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-[#F8F5EE] dark:bg-[#17130E] border border-[#EDE7D9] dark:border-[#332B20] flex items-center justify-center shrink-0 shadow-warm-sm">
                  {getFileCategoryIcon(file.name)}
                </div>
              )}

              {/* File Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-display font-bold text-[#202020] dark:text-[#FFFDF7] truncate max-w-xs" title={file.name}>
                    {file.name}
                  </h4>
                  <Badge variant="brand" size="sm">
                    {file.name.split('.').pop()?.toUpperCase() || 'FILE'}
                  </Badge>
                  {uploadedData && (
                    <Badge variant="emerald" size="sm" dot>
                      Verified & Uploaded
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-1">
                  Size: <span className="font-semibold text-[#202020] dark:text-[#FFFDF7]">{formatSize(file.size)}</span>
                  {file.type && ` • Type: ${file.type}`}
                </p>

                {uploadedData && (
                  <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 mt-1">
                    ID: {uploadedData.fileId.slice(0, 12)}... (Temp Staging)
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="shrink-0 flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Replace file"
                  aria-label="Replace file"
                  disabled={isUploading}
                >
                  <RefreshCw className="w-4 h-4 text-[#666666] dark:text-[#B8AF9F]" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={removeFile}
                  title="Remove file"
                  aria-label="Remove file"
                  disabled={isUploading}
                >
                  <X className="w-4 h-4 text-[#666666] dark:text-[#B8AF9F] hover:text-red-500" />
                </Button>
              </div>
            </div>

            {/* Upload Progress Bar */}
            {isUploading && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#FF7900] flex items-center gap-1.5 font-display">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Uploading & Validating...
                  </span>
                  <span className="font-mono text-[#666666] dark:text-[#B8AF9F]">{progress}%</span>
                </div>
                <Progress value={progress} variant="brand" size="sm" />
              </div>
            )}

            {/* Manual Upload Trigger if autoUpload is disabled */}
            {!autoUpload && !uploadedData && !isUploading && (
              <div className="pt-2 border-t border-[#EDE7D9] dark:border-[#332B20] flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => processUpload(file)}
                  leftIcon={<UploadCloud className="w-4 h-4" />}
                >
                  Start Upload
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Validation / Server Error Alert with Screen-Reader Announcement */}
      {error && (
        <motion.div
          role="alert"
          aria-live="assertive"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-xl border border-rose-800/60 bg-rose-950/40 text-rose-300 text-xs flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="font-semibold">Validation Error:</span> {error}
          </div>
          {file && (
            <button
              onClick={() => processUpload(file)}
              className="text-xs font-semibold text-rose-300 hover:underline shrink-0"
            >
              Retry
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default FileUpload;
