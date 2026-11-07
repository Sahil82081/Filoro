import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  TrendingDown,
  HardDrive,
  FileCheck,
  Maximize2,
  ArrowRight,
  Eye,
  ExternalLink,
  FileText,
  FileImage,
  Info
} from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { Badge } from './Badge';

export interface ResultDimensions {
  width?: number;
  height?: number;
}

export interface ResultViewProps {
  title?: string;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: 'emerald' | 'brand' | 'amber' | 'neutral';
  filename: string;
  fileType?: string;
  originalSize: number;
  resultSize: number;
  savedBytes?: number;
  reductionPercent?: number;
  originalDimensions?: ResultDimensions;
  resultDimensions?: ResultDimensions;
  previewUrl?: string;
  previewType?: 'image' | 'pdf' | 'none';
  downloadUrl: string;
  downloadFilename?: string;
  downloadLabel?: string;
  onProcessAnother?: () => void;
  onTryAnotherTool?: () => void;
  isAlreadyOptimized?: boolean;
  extraInfo?: string;
  className?: string;
}

export const formatResultBytes = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    const kb = bytes / 1024;
    return kb >= 100 ? `${Math.round(kb)} KB` : `${parseFloat(kb.toFixed(1))} KB`;
  }
  const mb = bytes / (1024 * 1024);
  return `${parseFloat(mb.toFixed(2))} MB`;
};

export const ResultView: React.FC<ResultViewProps> = ({
  title = 'Processing Complete',
  subtitle,
  badgeText = 'Ready for Download',
  badgeVariant = 'emerald',
  filename,
  fileType,
  originalSize,
  resultSize,
  savedBytes: propSavedBytes,
  reductionPercent: propReductionPercent,
  originalDimensions,
  resultDimensions,
  previewUrl,
  previewType = 'none',
  downloadUrl,
  downloadFilename,
  downloadLabel,
  onProcessAnother,
  onTryAnotherTool,
  isAlreadyOptimized = false,
  extraInfo,
  className = '',
}) => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  // Calculate metrics accurately if not provided
  const savedBytes = propSavedBytes !== undefined
    ? propSavedBytes
    : Math.max(0, originalSize - resultSize);

  const reductionPercent = propReductionPercent !== undefined
    ? propReductionPercent
    : originalSize > 0
    ? Math.max(0, Math.round(((originalSize - resultSize) / originalSize) * 100))
    : 0;

  const hasDimensions =
    Boolean(
      (originalDimensions?.width && originalDimensions?.height) ||
      (resultDimensions?.width && resultDimensions?.height)
    );

  const isPdf = filename.toLowerCase().endsWith('.pdf');

  const handleDefaultTryAnother = () => {
    if (onTryAnotherTool) {
      onTryAnotherTool();
    } else {
      navigate('/#tools');
    }
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`w-full max-w-4xl mx-auto space-y-6 ${className}`}
    >
      <Card className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1E1913] border border-[#EDE7D9] dark:border-[#332B20] shadow-warm-card transition-colors">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EDE7D9] dark:border-[#332B20]">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={badgeVariant} size="md" dot>
                {badgeText}
              </Badge>
              {fileType && (
                <Badge variant="neutral" size="sm">
                  {fileType}
                </Badge>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-[#202020] dark:text-[#FFFDF7]">
              {title}
            </h2>
            {subtitle ? (
              <p className="text-xs sm:text-sm text-[#666666] dark:text-[#B8AF9F]">{subtitle}</p>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-[#666666] dark:text-[#B8AF9F]">
                {isPdf ? (
                  <FileText className="w-3.5 h-3.5 text-[#FF7900]" />
                ) : (
                  <FileImage className="w-3.5 h-3.5 text-[#FFBF00]" />
                )}
                <span className="font-semibold text-[#202020] dark:text-[#FFFDF7] truncate max-w-sm">{filename}</span>
              </div>
            )}
          </div>

          {/* Quick Top Download Button */}
          <div className="shrink-0 self-start sm:self-center">
            <a
              href={downloadUrl}
              download={downloadFilename || filename}
              className="inline-flex"
            >
              <Button
                variant="primary"
                size="md"
                leftIcon={<Download className="w-4 h-4" />}
                className="shadow-warm-sm hover:shadow-warm-md"
              >
                {downloadLabel || 'Download File'}
              </Button>
            </a>
          </div>
        </div>

        {/* 4 Core Metrics Grid */}
        <div className="pt-6 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* 1. Original */}
            <div className="rounded-2xl bg-[#F8F5EE] dark:bg-[#16120D] border border-[#EDE7D9] dark:border-[#332B20] p-4 sm:p-5 transition-all">
              <div className="flex items-center gap-1.5 text-[#666666] dark:text-[#B8AF9F] mb-1">
                <HardDrive className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Original</span>
              </div>
              <p className="text-2xl sm:text-3xl font-display font-bold text-[#202020] dark:text-[#FFFDF7]">
                {formatResultBytes(originalSize)}
              </p>
              <p className="text-[11px] text-[#666666]/70 dark:text-[#B8AF9F]/70 mt-1">Uploaded size</p>
            </div>

            {/* 2. Result */}
            <div className="rounded-2xl bg-[#FFBF00]/10 dark:bg-[#FFBF00]/15 border border-[#FFBF00]/30 p-4 sm:p-5 transition-all">
              <div className="flex items-center gap-1.5 text-[#FF7900] dark:text-[#FFBF00] mb-1">
                <FileCheck className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Result</span>
              </div>
              <p className="text-2xl sm:text-3xl font-display font-bold text-[#FF7900] dark:text-[#FFBF00]">
                {formatResultBytes(resultSize)}
              </p>
              <p className="text-[11px] text-[#FF7900]/80 dark:text-[#FFBF00]/80 mt-1">Processed output</p>
            </div>

            {/* 3. Saved */}
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/25 p-4 sm:p-5 transition-all">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 mb-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Saved</span>
              </div>
              <p className="text-2xl sm:text-3xl font-display font-bold text-emerald-700 dark:text-emerald-400">
                {isAlreadyOptimized ? '0 B' : formatResultBytes(savedBytes)}
              </p>
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                {isAlreadyOptimized ? 'Optimal size' : 'Space liberated'}
              </p>
            </div>

            {/* 4. Reduction */}
            <div className="rounded-2xl bg-gradient-to-br from-[#FFFDF7] to-[#FBF3DF] dark:from-[#241E17] dark:to-[#1E1913] border border-[#FFBF00]/50 p-4 sm:p-5 shadow-warm-xs transition-transform">
              <div className="flex items-center gap-1.5 text-[#FF7900] dark:text-[#FFBF00] mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Reduction</span>
              </div>
              <p className="text-3xl sm:text-4xl font-display font-black tracking-tight text-[#FF7900] dark:text-[#FFBF00]">
                {isAlreadyOptimized ? '0%' : `${reductionPercent}%`}
              </p>
              <p className="text-[11px] text-[#666666] dark:text-[#B8AF9F] mt-1">
                {isAlreadyOptimized ? 'Already optimized' : 'Size reduced'}
              </p>
            </div>
          </div>

          {/* Dimensions Comparison (Where Relevant) */}
          {hasDimensions && (
            <div className="p-4 bg-[#F8F5EE] dark:bg-[#16120D] rounded-2xl border border-[#EDE7D9] dark:border-[#332B20] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[#202020] dark:text-[#FFFDF7]">
                <div className="w-7 h-7 rounded-lg bg-[#FFBF00]/15 border border-[#FFBF00]/30 flex items-center justify-center text-[#FF7900] dark:text-[#FFBF00]">
                  <Maximize2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#202020] dark:text-[#FFFDF7] block">Pixel Dimensions</span>
                  <span className="text-[11px] text-[#666666] dark:text-[#B8AF9F]">Image resolution before and after processing</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold self-start sm:self-center bg-[#FFFFFF] dark:bg-[#1E1913] px-3.5 py-2 rounded-xl border border-[#EDE7D9] dark:border-[#332B20] shadow-warm-xs">
                {originalDimensions?.width && originalDimensions?.height && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#666666] dark:text-[#B8AF9F] font-normal">Original:</span>
                    <span className="text-[#202020] dark:text-[#FFFDF7]">
                      {originalDimensions.width} × {originalDimensions.height}
                    </span>
                  </div>
                )}
                {originalDimensions && resultDimensions && (
                  <ArrowRight className="w-3.5 h-3.5 text-[#666666] dark:text-[#B8AF9F]" />
                )}
                {resultDimensions?.width && resultDimensions?.height && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#666666] dark:text-[#B8AF9F] font-normal">Result:</span>
                    <span className="text-[#FF7900] dark:text-[#FFBF00] font-bold">
                      {resultDimensions.width} × {resultDimensions.height}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Visual Size Comparison Progression Bar */}
          <div className="rounded-2xl bg-[#F8F5EE] dark:bg-[#16120D] border border-[#EDE7D9] dark:border-[#332B20] p-4 sm:p-5 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#202020] dark:text-[#FFFDF7]">
              <span>File Size Comparison</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {isAlreadyOptimized
                  ? 'File is already at optimal compression'
                  : `${reductionPercent}% smaller than original`}
              </span>
            </div>

            <div className="h-3.5 w-full bg-[#EDE7D9] dark:bg-[#2E271E] rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{
                  width: `${Math.max(5, isAlreadyOptimized ? 100 : 100 - reductionPercent)}%`,
                }}
                className="bg-[#FFBF00] h-full transition-all duration-700 rounded-l-full"
              />
              {!isAlreadyOptimized && reductionPercent > 0 && (
                <div
                  style={{ width: `${reductionPercent}%` }}
                  className="bg-[#FF7900] h-full transition-all duration-700 rounded-r-full"
                />
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#666666] dark:text-[#B8AF9F] pt-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFBF00] inline-block" />
                <span>Result: {formatResultBytes(resultSize)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF7900] inline-block" />
                <span>Saved: {formatResultBytes(savedBytes)}</span>
              </div>
            </div>
          </div>

          {/* Extra Notice (if applicable) */}
          {extraInfo && (
            <div className="p-3 bg-[#FFBF00]/10 border border-[#FFBF00]/30 rounded-xl text-xs text-[#202020] dark:text-[#FFFDF7] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#FF7900] dark:text-[#FFBF00] shrink-0" />
              <span>{extraInfo}</span>
            </div>
          )}

          {/* Visual Preview Section */}
          {previewType === 'image' && previewUrl && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#202020] dark:text-[#FFFDF7] flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#FFBF00]" />
                  Visual Preview
                </span>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#FF7900] dark:text-[#FFBF00] hover:underline flex items-center gap-1 font-medium transition-colors"
                >
                  <span>Open Full Size</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-[#EDE7D9] dark:border-[#332B20] bg-[#F8F5EE] dark:bg-[#16120D] p-4 flex items-center justify-center min-h-[220px] max-h-96">
                <img
                  src={previewUrl}
                  alt={filename}
                  className="max-h-80 max-w-full rounded-xl object-contain shadow-warm-sm"
                  loading="lazy"
                />
              </div>
            </div>
          )}

          {/* PDF Preview Shortcut */}
          {previewType === 'pdf' && previewUrl && (
            <div className="p-4 bg-[#F8F5EE] dark:bg-[#16120D] rounded-2xl border border-[#EDE7D9] dark:border-[#332B20] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FF7900]/10 text-[#FF7900] flex items-center justify-center border border-[#FF7900]/25">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#202020] dark:text-[#FFFDF7] block">PDF Preview Available</span>
                  <span className="text-[11px] text-[#666666] dark:text-[#B8AF9F]">Inspect page contents in an inline browser viewer</span>
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.open(previewUrl, '_blank')}
                leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                Preview in Browser
              </Button>
            </div>
          )}

          {/* Action Buttons Row */}
          <div className="pt-4 border-t border-[#EDE7D9] dark:border-[#332B20] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-wrap">
              {onProcessAnother && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={onProcessAnother}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                  className="w-full sm:w-auto"
                >
                  Process Another File
                </Button>
              )}

              <Button
                variant="ghost"
                size="md"
                onClick={handleDefaultTryAnother}
                leftIcon={<Sparkles className="w-4 h-4 text-[#FFBF00]" />}
                className="w-full sm:w-auto text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7]"
              >
                Try Another Tool
              </Button>
            </div>

            <a
              href={downloadUrl}
              download={downloadFilename || filename}
              className="inline-flex w-full sm:w-auto"
            >
              <Button
                variant="primary"
                size="md"
                leftIcon={<Download className="w-4 h-4" />}
                className="w-full sm:w-auto shadow-warm-sm"
              >
                {downloadLabel || 'Download File'}
              </Button>
            </a>
          </div>

          {/* Privacy & Lifecycle Note */}
          <div className="pt-2 border-t border-[#EDE7D9] dark:border-[#332B20] flex items-center justify-center gap-1.5 text-[11px] text-[#666666] dark:text-[#B8AF9F]">
            <span>Files are temporarily processed on our server and automatically deleted after processing.</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ResultView;

