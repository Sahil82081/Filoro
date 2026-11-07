import React, { useState } from 'react';
import {
  Target,
  FileText,
  FileImage,
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
  targetCompressApi,
  TargetCompressResponse,
  UploadedFileMetadata,
  getDownloadUrl,
  getPreviewUrl
} from '../services/api';
import { formatBytes } from '../utils';

interface UploadedFileMeta {
  fileId: string;
  originalName: string;
  size: number;
  mimeType: string;
  isPdf: boolean;
}

export const TargetCompressorWorkspace: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFileMeta | null>(null);
  const [targetValue, setTargetValue] = useState<number>(5);
  const [targetUnit, setTargetUnit] = useState<'MB' | 'KB'>('MB');

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<TargetCompressResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUploadSuccess = (fileMeta: UploadedFileMetadata) => {
    const isPdf = fileMeta.originalName.toLowerCase().endsWith('.pdf') || fileMeta.mimeType === 'application/pdf';
    setUploadedFile({
      fileId: fileMeta.fileId,
      originalName: fileMeta.originalName,
      size: fileMeta.size,
      mimeType: fileMeta.mimeType,
      isPdf,
    });
    setResult(null);
    setErrorMessage(null);

    // Set intelligent default target based on file size
    const fileMB = fileMeta.size / (1024 * 1024);
    if (fileMB >= 10) {
      setTargetValue(5);
      setTargetUnit('MB');
    } else if (fileMB >= 2) {
      setTargetValue(1);
      setTargetUnit('MB');
    } else {
      const fileKB = Math.round(fileMeta.size / 1024);
      setTargetValue(Math.max(50, Math.round(fileKB * 0.6)));
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
      const targetKB = targetUnit === 'MB' ? targetValue * 1024 : targetValue;

      const response = await targetCompressApi({
        fileId: uploadedFile.fileId,
        targetSizeKB: Math.round(targetKB),
        originalName: uploadedFile.originalName,
        maxIterations: 5,
      });

      setResult(response);
    } catch (err: any) {
      console.error('Target compression error:', err);
      setErrorMessage(
        err.message || 'An error occurred while compressing to target size. Please try again.'
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
        <div role="alert" aria-live="assertive" className="rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5 flex items-start gap-3.5 shadow-sm animate-fade-in">
          <div className="p-2 rounded-xl bg-red-100 text-red-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-red-900">Compression Error</h4>
            <p className="mt-1 text-sm text-red-700 leading-relaxed">{errorMessage}</p>
            <div className="mt-3 flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setErrorMessage(null)}
                className="border-red-200 text-red-700 hover:bg-red-100"
              >
                Dismiss
              </Button>
              <Button variant="secondary" size="sm" onClick={handleReset}>
                Try Another File
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Upload Dropzone */}
      {!uploadedFile && !result && (
        <Card className="p-6 sm:p-8 border-dashed border-2 border-[#EDE7D9] dark:border-[#332B20] bg-[#FFFFFF] dark:bg-[#1E1913] shadow-warm-xs">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="text-center">
              <div className="inline-flex p-3 rounded-2xl bg-[#FFBF00]/10 text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/25 mb-2">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold font-display tracking-tight text-[#202020] dark:text-[#FFFDF7]">
                Upload Document or Image for Target Compression
              </h3>
              <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-1">
                Upload a large PDF or image file. Filoro will iteratively adapt its compression to hit your exact target ceiling.
              </p>
            </div>
            <FileUpload
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              maxSizeMB={50}
              onUploadSuccess={handleUploadSuccess}
              onFileRemove={handleUploadRemove}
            />
          </div>
        </Card>
      )}

      {/* Step 2: Configure Target Size */}
      {uploadedFile && !result && (
        <div className="space-y-6">
          {/* Selected File Summary Card */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#F8F5EE] dark:bg-[#1E1913] border border-[#EDE7D9] dark:border-[#332B20] transition-colors">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FF7900]/10 text-[#FF7900] border border-[#FF7900]/25 flex items-center justify-center shrink-0">
                {uploadedFile.isPdf ? (
                  <FileText className="w-5 h-5" />
                ) : (
                  <FileImage className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#202020] dark:text-[#FFFDF7] truncate max-w-xs sm:max-w-md">
                    {uploadedFile.originalName}
                  </p>
                  <Badge variant={uploadedFile.isPdf ? 'coral' : 'brand'} size="sm">
                    {uploadedFile.isPdf ? 'PDF' : 'IMAGE'}
                  </Badge>
                </div>
                <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-0.5">
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
              Change File
            </Button>
          </div>

          {/* Target Size Specification Box */}
          <Card className="p-6 bg-[#FFFFFF] dark:bg-[#1E1913] border border-[#EDE7D9] dark:border-[#332B20] space-y-4">
            <div>
              <label htmlFor="target-size-value-input" className="text-xs font-bold uppercase tracking-wider text-[#666666] dark:text-[#B8AF9F] block">
                Desired Target File Size
              </label>
              <p className="text-xs text-[#666666]/80 dark:text-[#B8AF9F]/80 mt-0.5">
                Set the ceiling size you need. Filoro uses bounded iterative testing to reach this target without unnecessary quality loss.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="w-full sm:w-44">
                <Input
                  id="target-size-value-input"
                  aria-label="Target file size value"
                  type="number"
                  min={0.1}
                  step={targetUnit === 'MB' ? 0.1 : 10}
                  value={targetValue}
                  onChange={(e) => setTargetValue(Math.max(0.01, Number(e.target.value)))}
                  disabled={isProcessing}
                />
              </div>

              {/* Unit Toggle Button Group */}
              <div role="radiogroup" aria-label="Target size unit" className="flex items-center rounded-xl bg-[#F8F5EE] dark:bg-[#16120D] border border-[#EDE7D9] dark:border-[#332B20] p-1">
                <button
                  type="button"
                  role="radio"
                  aria-checked={targetUnit === 'MB'}
                  aria-label="Megabytes"
                  onClick={() => {
                    if (targetUnit !== 'MB') {
                      setTargetValue(Math.max(0.1, Number((targetValue / 1024).toFixed(2))));
                      setTargetUnit('MB');
                    }
                  }}
                  className={`px-3.5 py-2 sm:py-1.5 min-h-[38px] sm:min-h-0 text-xs font-bold rounded-lg transition-all ${
                    targetUnit === 'MB' ? 'bg-[#FFBF00] text-[#202020] shadow-xs' : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7]'
                  }`}
                >
                  MB
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={targetUnit === 'KB'}
                  aria-label="Kilobytes"
                  onClick={() => {
                    if (targetUnit !== 'KB') {
                      setTargetValue(Math.round(targetValue * 1024));
                      setTargetUnit('KB');
                    }
                  }}
                  className={`px-3.5 py-2 sm:py-1.5 min-h-[38px] sm:min-h-0 text-xs font-bold rounded-lg transition-all ${
                    targetUnit === 'KB' ? 'bg-[#FFBF00] text-[#202020] shadow-xs' : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7]'
                  }`}
                >
                  KB
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#666666] dark:text-[#B8AF9F] w-full sm:w-auto mt-1 sm:mt-0">
                <span className="font-medium mr-1">Presets:</span>
                {[
                  { label: '500 KB', val: 500, unit: 'KB' as const },
                  { label: '1 MB', val: 1, unit: 'MB' as const },
                  { label: '2 MB', val: 2, unit: 'MB' as const },
                  { label: '5 MB', val: 5, unit: 'MB' as const },
                  { label: '10 MB', val: 10, unit: 'MB' as const },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    aria-label={`Set target preset to ${preset.label}`}
                    onClick={() => {
                      setTargetUnit(preset.unit);
                      setTargetValue(preset.val);
                    }}
                    className="px-2.5 py-1.5 min-h-[38px] sm:min-h-0 rounded-md bg-[#F8F5EE] dark:bg-[#2A231A] border border-[#EDE7D9] dark:border-[#332B20] hover:border-[#FFBF00] text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] font-medium transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Calculation Preview */}
            <div className="p-3 rounded-xl bg-[#F8F5EE] dark:bg-[#16120D] border border-[#EDE7D9] dark:border-[#332B20] text-xs text-[#666666] dark:text-[#B8AF9F] flex items-center justify-between">
              <span>Target: <strong className="text-[#202020] dark:text-[#FFFDF7]">{targetValue} {targetUnit}</strong></span>
              {uploadedFile.size > 0 && (
                <span>
                  Expected Reduction: approx.{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    {Math.max(
                      0,
                      Math.round(
                        ((uploadedFile.size -
                          (targetUnit === 'MB' ? targetValue * 1024 * 1024 : targetValue * 1024)) /
                          uploadedFile.size) *
                          100
                      )
                    )}%
                  </strong>
                </span>
              )}
            </div>
          </Card>

          {/* Action Trigger */}
          <div>
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto min-w-[220px]"
              onClick={handleCompress}
              disabled={isProcessing}
              rightIcon={!isProcessing ? <ArrowRight className="w-4 h-4" /> : undefined}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" variant="white" />
                  <span>Iteratively Compressing (Adaptive Loop)...</span>
                </div>
              ) : (
                <span>Compress to Target Size</span>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Result View */}
      {result && (
        <ResultView
          title={result.targetReached ? 'Target Size Reached' : 'Closest Achievable Size'}
          subtitle={result.message}
          filename={result.originalName}
          fileType={result.fileType.toUpperCase()}
          originalSize={result.originalSize}
          resultSize={result.resultSize}
          savedBytes={result.savedBytes}
          reductionPercent={result.savedPercentage}
          previewUrl={getPreviewUrl(result.fileId)}
          previewType={result.fileType === 'pdf' ? 'pdf' : 'image'}
          downloadUrl={getDownloadUrl(result.fileId, result.originalName)}
          downloadFilename={result.originalName}
          downloadLabel={`Download ${result.fileType.toUpperCase()}`}
          onProcessAnother={handleReset}
          isAlreadyOptimized={result.resultSize >= result.originalSize}
          badgeText={result.targetReached ? `Target Met (${result.targetSizeFormatted})` : `Closest Fit (Target: ${result.targetSizeFormatted})`}
          badgeVariant={result.targetReached ? 'emerald' : 'amber'}
          extraInfo={`Tuned over ${result.iterations} iterations using ${result.engineUsed} in ${result.processingTimeMs}ms.`}
        />
      )}
    </div>
  );
};
