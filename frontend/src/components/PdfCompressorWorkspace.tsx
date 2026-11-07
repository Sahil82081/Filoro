import React, { useState } from 'react';
import {
  FileText,
  Minimize2,
  Zap,
  Target,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Input } from './ui/Input';
import { FileUpload } from './ui/FileUpload';
import { Spinner } from './ui/Loading';
import { ResultView } from './ui/ResultView';
import {
  compressPdf,
  PdfCompressionMode,
  PdfCompressResponse,
  getDownloadUrl,
  getPreviewUrl,
  UploadedFileMetadata
} from '../services/api';
import { formatBytes } from '../utils';

interface UploadedPdfMeta {
  fileId: string;
  originalName: string;
  size: number;
}

export const PdfCompressorWorkspace: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<UploadedPdfMeta | null>(null);
  const [mode, setMode] = useState<PdfCompressionMode>('basic');
  const [targetSize, setTargetSize] = useState<number>(500);
  const [targetUnit, setTargetUnit] = useState<'KB' | 'MB'>('KB');

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<PdfCompressResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle successful file upload via FileUpload component
  const handleUploadSuccess = (fileMeta: UploadedFileMetadata) => {
    setUploadedFile({
      fileId: fileMeta.fileId,
      originalName: fileMeta.originalName,
      size: fileMeta.size,
    });
    setResult(null);
    setErrorMessage(null);

    // Sensible default target size based on uploaded file size
    const uploadedKB = Math.round(fileMeta.size / 1024);
    if (uploadedKB > 1024) {
      setTargetSize(Math.max(200, Math.round(uploadedKB * 0.5)));
      setTargetUnit('KB');
    } else {
      setTargetSize(Math.max(50, Math.round(uploadedKB * 0.6)));
      setTargetUnit('KB');
    }
  };

  const handleUploadRemove = () => {
    setUploadedFile(null);
    setResult(null);
    setErrorMessage(null);
  };

  const handleCompress = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const targetKB =
        mode === 'target'
          ? targetUnit === 'MB'
            ? Math.round(targetSize * 1024)
            : Math.round(targetSize)
          : undefined;

      const response = await compressPdf({
        fileId: uploadedFile.fileId,
        mode,
        targetSizeKB: targetKB,
        originalName: uploadedFile.originalName,
      });

      setResult(response);
    } catch (err: any) {
      console.error('Compression execution error:', err);
      setErrorMessage(
        err.message || 'An error occurred while compressing your PDF. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setUploadedFile(null);
    setResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-8">
      {/* Friendly Error Banner */}
      {errorMessage && (
        <div role="alert" aria-live="assertive" className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 sm:p-5 flex items-start gap-3.5 shadow-sm animate-fade-in">
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-red-100">Compression Failed</h4>
            <p className="mt-1 text-sm text-red-200/90 leading-relaxed">{errorMessage}</p>
            <div className="mt-3 flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setErrorMessage(null)}
                className="border-red-500/30 text-red-300 hover:bg-red-500/20"
              >
                Dismiss
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleReset}
              >
                Try Another File
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Upload (if not yet uploaded or when starting over) */}
      {!uploadedFile && !result && (
        <Card className="p-6 sm:p-8 border-dashed border-2 border-[#EDE7D9] dark:border-[#332B20] bg-[#FFFFFF] dark:bg-[#1E1913] shadow-warm-xs">
          <div className="max-w-xl mx-auto">
            <FileUpload
              accept=".pdf"
              maxSizeMB={50}
              onUploadSuccess={handleUploadSuccess}
              onFileRemove={handleUploadRemove}
            />
          </div>
        </Card>
      )}

      {/* Step 2: Configuration & Compression Trigger */}
      {uploadedFile && !result && (
        <div className="space-y-6">
          {/* File summary badge */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#F8F5EE] dark:bg-[#1E1913] border border-[#EDE7D9] dark:border-[#332B20] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF7900]/10 text-[#FF7900] border border-[#FF7900]/25 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#202020] dark:text-[#FFFDF7] truncate max-w-xs sm:max-w-md">
                  {uploadedFile.originalName}
                </p>
                <p className="text-xs text-[#666666] dark:text-[#B8AF9F]">
                  Original Size: <span className="font-semibold text-[#202020] dark:text-[#FFFDF7]">{formatBytes(uploadedFile.size)}</span>
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUploadRemove}
              disabled={isProcessing}
              className="text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7]"
            >
              Change PDF
            </Button>
          </div>

          {/* Mode Selection Cards */}
          <div className="space-y-3">
            <span id="compression-level-label" className="text-sm font-semibold text-[#202020] dark:text-[#FFFDF7] block">
              Select Compression Level
            </span>
            <div
              role="radiogroup"
              aria-labelledby="compression-level-label"
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {/* Basic Mode */}
              <button
                type="button"
                role="radio"
                aria-checked={mode === 'basic'}
                onClick={() => !isProcessing && setMode('basic')}
                className={`relative cursor-pointer rounded-2xl border p-5 transition-all text-left focus:outline-none focus:ring-2 focus:ring-[#FFBF00] focus:ring-offset-2 dark:focus:ring-offset-[#14110C] ${
                  mode === 'basic'
                    ? 'border-[#FFBF00] bg-[#FFBF00]/10 ring-1 ring-[#FFBF00]/30 shadow-warm-xs'
                    : 'border-[#EDE7D9] dark:border-[#332B20] bg-[#FFFFFF] dark:bg-[#1E1913] hover:border-[#FFBF00]/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl ${mode === 'basic' ? 'bg-[#FFBF00] text-[#202020]' : 'bg-[#F8F5EE] dark:bg-[#2A231A] text-[#FF7900] dark:text-[#FFBF00] border border-[#EDE7D9] dark:border-[#3D3325]'}`}>
                    <Minimize2 className="w-5 h-5" />
                  </div>
                  <Badge variant={mode === 'basic' ? 'brand' : 'neutral'} size="sm">
                    Recommended
                  </Badge>
                </div>
                <h3 className="mt-3 font-bold text-sm text-[#202020] dark:text-[#FFFDF7]">Basic Compression</h3>
                <p className="mt-1 text-xs text-[#666666] dark:text-[#B8AF9F] leading-relaxed">
                  Balances size reduction while maintaining sharp text and vector graphics. Ideal for formal documents, resumes, and portfolios.
                </p>
              </button>

              {/* Strong Mode */}
              <button
                type="button"
                role="radio"
                aria-checked={mode === 'strong'}
                onClick={() => !isProcessing && setMode('strong')}
                className={`relative cursor-pointer rounded-2xl border p-5 transition-all text-left focus:outline-none focus:ring-2 focus:ring-[#FFBF00] focus:ring-offset-2 dark:focus:ring-offset-[#14110C] ${
                  mode === 'strong'
                    ? 'border-[#FFBF00] bg-[#FFBF00]/10 ring-1 ring-[#FFBF00]/30 shadow-warm-xs'
                    : 'border-[#EDE7D9] dark:border-[#332B20] bg-[#FFFFFF] dark:bg-[#1E1913] hover:border-[#FFBF00]/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl ${mode === 'strong' ? 'bg-[#FFBF00] text-[#202020]' : 'bg-[#F8F5EE] dark:bg-[#2A231A] text-[#FF7900] dark:text-[#FFBF00] border border-[#EDE7D9] dark:border-[#3D3325]'}`}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <Badge variant={mode === 'strong' ? 'brand' : 'neutral'} size="sm">
                    Max Reduction
                  </Badge>
                </div>
                <h3 className="mt-3 font-bold text-sm text-[#202020] dark:text-[#FFFDF7]">Strong Compression</h3>
                <p className="mt-1 text-xs text-[#666666] dark:text-[#B8AF9F] leading-relaxed">
                  Aggressive optimization reducing high-resolution scans and images. Best for email attachments and portal upload restrictions.
                </p>
              </button>

              {/* Target Size Mode */}
              <button
                type="button"
                role="radio"
                aria-checked={mode === 'target'}
                onClick={() => !isProcessing && setMode('target')}
                className={`relative cursor-pointer rounded-2xl border p-5 transition-all text-left focus:outline-none focus:ring-2 focus:ring-[#FFBF00] focus:ring-offset-2 dark:focus:ring-offset-[#14110C] ${
                  mode === 'target'
                    ? 'border-[#FFBF00] bg-[#FFBF00]/10 ring-1 ring-[#FFBF00]/30 shadow-warm-xs'
                    : 'border-[#EDE7D9] dark:border-[#332B20] bg-[#FFFFFF] dark:bg-[#1E1913] hover:border-[#FFBF00]/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl ${mode === 'target' ? 'bg-[#FFBF00] text-[#202020]' : 'bg-[#F8F5EE] dark:bg-[#2A231A] text-[#FF7900] dark:text-[#FFBF00] border border-[#EDE7D9] dark:border-[#3D3325]'}`}>
                    <Target className="w-5 h-5" />
                  </div>
                  <Badge variant={mode === 'target' ? 'brand' : 'neutral'} size="sm">
                    Exact Ceiling
                  </Badge>
                </div>
                <h3 className="mt-3 font-bold text-sm text-[#202020] dark:text-[#FFFDF7]">Target Size</h3>
                <p className="mt-1 text-xs text-[#666666] dark:text-[#B8AF9F] leading-relaxed">
                  Specify your desired maximum file size (e.g., 500 KB). Filoro iteratively tunes image quality to fit your target.
                </p>
              </button>
            </div>
          </div>

          {/* Target Size Controls */}
          {mode === 'target' && (
            <Card className="p-5 bg-[#F8F5EE] dark:bg-[#1E1913] border border-[#EDE7D9] dark:border-[#332B20] animate-fade-in">
              <label htmlFor="pdf-target-size-input" className="text-xs font-semibold text-[#666666] dark:text-[#B8AF9F] uppercase tracking-wider block mb-2">
                Specify Maximum Target File Size
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-full sm:w-40">
                  <Input
                    id="pdf-target-size-input"
                    aria-label="Target file size value"
                    type="number"
                    min={10}
                    step={targetUnit === 'MB' ? 0.1 : 10}
                    value={targetSize}
                    onChange={(e) => setTargetSize(Math.max(1, Number(e.target.value)))}
                    disabled={isProcessing}
                  />
                </div>
                <div role="radiogroup" aria-label="PDF target size unit" className="flex items-center rounded-xl bg-[#FFFFFF] dark:bg-[#16120D] border border-[#EDE7D9] dark:border-[#332B20] p-1">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={targetUnit === 'KB'}
                    aria-label="Kilobytes"
                    onClick={() => {
                      if (targetUnit !== 'KB') {
                        setTargetSize(Math.round(targetSize * 1024));
                        setTargetUnit('KB');
                      }
                    }}
                    className={`px-3.5 py-2 sm:py-1.5 min-h-[38px] sm:min-h-0 text-xs font-semibold rounded-lg transition-all ${
                      targetUnit === 'KB' ? 'bg-[#FFBF00] text-[#202020] shadow-xs' : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7]'
                    }`}
                  >
                    KB
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={targetUnit === 'MB'}
                    aria-label="Megabytes"
                    onClick={() => {
                      if (targetUnit !== 'MB') {
                        setTargetSize(Math.max(0.1, Number((targetSize / 1024).toFixed(2))));
                        setTargetUnit('MB');
                      }
                    }}
                    className={`px-3.5 py-2 sm:py-1.5 min-h-[38px] sm:min-h-0 text-xs font-semibold rounded-lg transition-all ${
                      targetUnit === 'MB' ? 'bg-[#FFBF00] text-[#202020] shadow-xs' : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7]'
                    }`}
                  >
                    MB
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#666666] dark:text-[#B8AF9F] w-full sm:w-auto mt-1 sm:mt-0">
                  <span className="font-medium mr-1">Presets:</span>
                  {[200, 500, 1000].map((presetKb) => (
                    <button
                      key={presetKb}
                      type="button"
                      aria-label={`Preset ${presetKb >= 1000 ? `${presetKb / 1000} Megabytes` : `${presetKb} Kilobytes`}`}
                      onClick={() => {
                        setTargetUnit('KB');
                        setTargetSize(presetKb);
                      }}
                      className="px-2.5 py-1.5 min-h-[38px] sm:min-h-0 rounded-md bg-[#FFFFFF] dark:bg-[#2A231A] border border-[#EDE7D9] dark:border-[#332B20] hover:border-[#FFBF00] text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] font-medium transition-colors"
                    >
                      {presetKb >= 1000 ? `${presetKb / 1000} MB` : `${presetKb} KB`}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Action Trigger */}
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto min-w-[200px]"
              onClick={handleCompress}
              disabled={isProcessing}
              rightIcon={!isProcessing ? <ArrowRight className="w-4 h-4" /> : undefined}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" variant="white" />
                  <span>Compressing PDF with QPDF...</span>
                </div>
              ) : (
                <span>Compress PDF</span>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Result View */}
      {result && (
        <ResultView
          title="PDF Compressed Successfully"
          subtitle={result.message || `Engine used: ${result.engineUsed}`}
          filename={result.originalName || 'Compressed Document.pdf'}
          fileType="PDF Document"
          originalSize={result.originalSize}
          resultSize={result.resultSize}
          savedBytes={result.savedBytes}
          reductionPercent={result.savedPercentage}
          previewUrl={getPreviewUrl(result.fileId)}
          previewType="pdf"
          downloadUrl={getDownloadUrl(result.fileId, result.originalName)}
          downloadFilename={result.originalName}
          downloadLabel="Download Compressed PDF"
          onProcessAnother={handleReset}
          isAlreadyOptimized={result.resultSize >= result.originalSize}
          badgeText={
            result.targetReached !== undefined
              ? result.targetReached
                ? 'Target Met'
                : 'Closest Fit'
              : 'Compression Complete'
          }
          badgeVariant={result.targetReached === false ? 'amber' : 'emerald'}
        />
      )}
    </div>
  );
};
