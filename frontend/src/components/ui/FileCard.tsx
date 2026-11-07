import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  FileText,
  FileImage,
  FileArchive,
  FileCode,
  FileAudio,
  FileVideo,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Badge } from './Badge';

export type FileStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

export interface FileCardProps {
  name: string;
  size?: number | string;
  extension?: string;
  status?: FileStatus;
  progress?: number;
  errorMessage?: string;
  onRemove?: () => void;
  className?: string;
}

const getFileDetails = (name: string, ext?: string) => {
  const fileExt = (ext || name.split('.').pop() || '').toLowerCase();
  switch (fileExt) {
    case 'pdf':
      return {
        icon: <FileText className="w-5 h-5 text-[#FF7900]" />,
        bg: 'bg-[#FF7900]/10 border-[#FF7900]/25',
        badgeVariant: 'coral' as const,
      };
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'webp':
    case 'svg':
    case 'gif':
      return {
        icon: <FileImage className="w-5 h-5 text-[#FFBF00]" />,
        bg: 'bg-[#FFBF00]/10 border-[#FFBF00]/25',
        badgeVariant: 'brand' as const,
      };
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return {
        icon: <FileArchive className="w-5 h-5 text-[#FF7900]" />,
        bg: 'bg-[#FF7900]/10 border-[#FF7900]/25',
        badgeVariant: 'amber' as const,
      };
    case 'mp4':
    case 'mov':
    case 'mkv':
    case 'avi':
      return {
        icon: <FileVideo className="w-5 h-5 text-[#FF7900]" />,
        bg: 'bg-[#FF7900]/10 border-[#FF7900]/25',
        badgeVariant: 'coral' as const,
      };
    case 'mp3':
    case 'wav':
    case 'flac':
      return {
        icon: <FileAudio className="w-5 h-5 text-[#16A34A]" />,
        bg: 'bg-[#16A34A]/10 border-[#16A34A]/25',
        badgeVariant: 'emerald' as const,
      };
    case 'ts':
    case 'js':
    case 'json':
    case 'html':
      return {
        icon: <FileCode className="w-5 h-5 text-[#666666] dark:text-[#B8AF9F]" />,
        bg: 'bg-[#F8F5EE] dark:bg-[#2A231A] border-[#EDE7D9] dark:border-[#332B20]',
        badgeVariant: 'neutral' as const,
      };
    default:
      return {
        icon: <File className="w-5 h-5 text-[#666666] dark:text-[#B8AF9F]" />,
        bg: 'bg-[#F8F5EE] dark:bg-[#2A231A] border-[#EDE7D9] dark:border-[#332B20]',
        badgeVariant: 'neutral' as const,
      };
  }
};

const formatFileSize = (bytes?: number | string): string => {
  if (typeof bytes === 'string') return bytes;
  if (bytes === undefined || bytes === null) return '';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const FileCard: React.FC<FileCardProps> = ({
  name,
  size,
  extension,
  status = 'idle',
  progress = 0,
  errorMessage,
  onRemove,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const fileExt = (extension || name.split('.').pop() || 'FILE').toUpperCase();
  const { icon, bg, badgeVariant } = getFileDetails(name, extension);

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`relative p-3.5 rounded-xl border bg-[#FFFFFF] dark:bg-[#1E1913] border-[#EDE7D9] dark:border-[#332B20] shadow-warm-xs hover:border-[#FFBF00] transition-all flex flex-col gap-2 ${className}`}
    >
      <div className="flex items-center gap-3">
        {/* File Type Icon */}
        <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${bg}`}>
          {icon}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold text-[#202020] dark:text-[#FFFDF7] truncate" title={name}>
              {name}
            </h4>
            <Badge variant={badgeVariant} size="sm">
              {fileExt}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#666666] dark:text-[#B8AF9F] mt-0.5">
            {size && <span>{formatFileSize(size)}</span>}
            {status === 'uploading' && <span className="text-[#FF7900] font-medium">Uploading ({progress}%)</span>}
            {status === 'processing' && <span className="text-[#FFBF00] font-medium">Processing...</span>}
            {status === 'success' && <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Ready</span>}
            {status === 'error' && <span className="text-[#FF7900] font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Failed</span>}
          </div>
        </div>

        {/* Action / Status Icon */}
        <div className="shrink-0 flex items-center gap-1">
          {status === 'uploading' || status === 'processing' ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#FFBF00]" />
          ) : onRemove ? (
            <button
              onClick={onRemove}
              className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-[#666666] dark:text-[#B8AF9F] hover:text-[#FF7900] hover:bg-[#FF7900]/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFBF00]"
              title="Remove file"
              aria-label={`Remove ${name}`}
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Progress Bar during upload/processing */}
      {(status === 'uploading' || status === 'processing') && (
        <div className="w-full bg-[#EDE7D9] dark:bg-[#2E271E] rounded-full h-1.5 overflow-hidden">
          <motion.div
            className={`h-full ${status === 'uploading' ? 'bg-[#FF7900]' : 'bg-[#FFBF00]'}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(5, Math.min(progress, 100))}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      )}

      {/* Error Message */}
      {status === 'error' && errorMessage && (
        <p className="text-[11px] text-[#FF7900] font-medium bg-[#FF7900]/10 p-2 rounded-lg border border-[#FF7900]/25">
          {errorMessage}
        </p>
      )}
    </motion.div>
  );
};

