import React, { useState, useRef } from 'react';
import {
  Layers,
  UploadCloud,
  FileImage,
  FileText,
  CheckCircle2,
  XCircle,
  Download,
  Archive,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Sliders,
  ArrowRight
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Spinner } from './ui/Loading';
import {
  batchUploadApi,
  batchProcessApi,
  BatchOperation,
  BatchProcessResponse,
  getDownloadUrl,
} from '../services/api';
import { formatBytes } from '../utils';

const MAX_BATCH_FILES = 15;
const MAX_BATCH_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

interface BatchProcessingWorkspaceProps {
  initialOperation?: BatchOperation;
}

export const BatchProcessingWorkspace: React.FC<BatchProcessingWorkspaceProps> = ({
  initialOperation = 'compress-image',
}) => {
  const [operation, setOperation] = useState<BatchOperation>(initialOperation);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Settings
  const [quality, setQuality] = useState<number>(75);
  const [targetFormat, setTargetFormat] = useState<'webp' | 'jpg' | 'png'>('webp');
  const [compressionLevel, setCompressionLevel] = useState<'basic' | 'strong'>('basic');

  // Processing state
  const [processingState, setProcessingState] = useState<
    'idle' | 'uploading' | 'processing' | 'done' | 'error'
  >('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [batchResult, setBatchResult] = useState<BatchProcessResponse | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate current batch metrics
  const totalSizeBytes = stagedFiles.reduce((acc, f) => acc + f.size, 0);
  const isOverCount = stagedFiles.length > MAX_BATCH_FILES;
  const isOverSize = totalSizeBytes > MAX_BATCH_SIZE_BYTES;

  // File accept attribute based on selected operation
  const acceptedExtensions =
    operation === 'compress-pdf'
      ? '.pdf,application/pdf'
      : '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';

  const handleFilesAdded = (incomingList: FileList | null) => {
    if (!incomingList || incomingList.length === 0) return;
    setGeneralError(null);

    const newFiles = Array.from(incomingList);
    // Merge without duplicates by name and size
    setStagedFiles((prev) => {
      const combined = [...prev];
      for (const f of newFiles) {
        if (!combined.some((item) => item.name === f.name && item.size === f.size)) {
          combined.push(f);
        }
      }
      return combined;
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setStagedFiles([]);
    setBatchResult(null);
    setGeneralError(null);
    setProcessingState('idle');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFilesAdded(e.dataTransfer.files);
  };

  const handleExecuteBatch = async () => {
    if (stagedFiles.length === 0) {
      setGeneralError('Please add at least one file to process.');
      return;
    }
    if (isOverCount) {
      setGeneralError(`Maximum limit is ${MAX_BATCH_FILES} files per batch.`);
      return;
    }
    if (isOverSize) {
      setGeneralError('Total batch size exceeds the 100 MB limit.');
      return;
    }

    setGeneralError(null);
    setBatchResult(null);

    try {
      // 1. Upload files
      setProcessingState('uploading');
      setStatusMessage(`Uploading ${stagedFiles.length} files to server...`);
      const uploadRes = await batchUploadApi(stagedFiles);

      if (!uploadRes.files || uploadRes.files.length === 0) {
        throw new Error('Upload completed but no files were registered.');
      }

      // 2. Process batch
      setProcessingState('processing');
      setStatusMessage(`Executing ${operation === 'compress-pdf' ? 'PDF' : 'image'} batch processing...`);

      const items = uploadRes.files.map((f) => ({
        fileId: f.fileId,
        originalName: f.originalName,
      }));

      const processRes = await batchProcessApi({
        items,
        operation,
        options: {
          quality,
          targetFormat,
          compressionLevel,
        },
      });

      setBatchResult(processRes);
      setProcessingState('done');
      setStatusMessage('Batch processing complete.');
    } catch (err: any) {
      setProcessingState('error');
      setGeneralError(err.message || 'An unexpected error occurred during batch processing.');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900">Batch Processing</h1>
            <Badge variant="brand" size="sm">
              Bulk Tool
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Process multiple files simultaneously. Download individually or as a consolidated ZIP.
          </p>
        </div>

        {/* Operation Selector Tabs */}
        <div
          role="tablist"
          aria-label="Batch Processing Operations"
          className="inline-flex flex-wrap p-1 bg-[#F8F5EE] dark:bg-[#16120D] rounded-xl border border-[#EDE7D9] dark:border-[#332B20] w-full sm:w-auto"
        >
          <button
            role="tab"
            aria-selected={operation === 'compress-image'}
            type="button"
            onClick={() => {
              setOperation('compress-image');
              setStagedFiles([]);
              setBatchResult(null);
            }}
            className={`flex-1 sm:flex-none px-3.5 py-2 sm:py-1.5 min-h-[44px] sm:min-h-0 text-xs font-semibold rounded-lg transition-all ${
              operation === 'compress-image'
                ? 'bg-[#FFFFFF] dark:bg-[#2A231A] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-xs'
                : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] border border-transparent'
            }`}
          >
            Compress Images
          </button>
          <button
            role="tab"
            aria-selected={operation === 'convert-image'}
            type="button"
            onClick={() => {
              setOperation('convert-image');
              setStagedFiles([]);
              setBatchResult(null);
            }}
            className={`flex-1 sm:flex-none px-3.5 py-2 sm:py-1.5 min-h-[44px] sm:min-h-0 text-xs font-semibold rounded-lg transition-all ${
              operation === 'convert-image'
                ? 'bg-[#FFFFFF] dark:bg-[#2A231A] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-xs'
                : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] border border-transparent'
            }`}
          >
            Convert Images
          </button>
          <button
            role="tab"
            aria-selected={operation === 'compress-pdf'}
            type="button"
            onClick={() => {
              setOperation('compress-pdf');
              setStagedFiles([]);
              setBatchResult(null);
            }}
            className={`flex-1 sm:flex-none px-3.5 py-2 sm:py-1.5 min-h-[44px] sm:min-h-0 text-xs font-semibold rounded-lg transition-all ${
              operation === 'compress-pdf'
                ? 'bg-[#FFFFFF] dark:bg-[#2A231A] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-xs'
                : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] border border-transparent'
            }`}
          >
            Compress PDFs
          </button>
        </div>
      </div>

      {/* Operation Options Bar */}
      <Card className="p-4 bg-[#FFFFFF] dark:bg-[#1E1913] border border-[#EDE7D9] dark:border-[#332B20]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#202020] dark:text-[#FFFDF7]">
            <Sliders className="w-4 h-4 text-[#FF7900]" />
            <span>
              {operation === 'compress-image' && 'Image Compression Settings'}
              {operation === 'convert-image' && 'Image Conversion Settings'}
              {operation === 'compress-pdf' && 'PDF Compression Settings'}
            </span>
          </div>

          {operation === 'compress-image' && (
            <div className="flex items-center gap-4 flex-wrap">
              <label htmlFor="batch-quality-range" className="text-xs text-slate-500 font-medium">Quality: {quality}%</label>
              <input
                id="batch-quality-range"
                aria-label="Batch image compression quality"
                type="range"
                min={20}
                max={95}
                step={5}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-36 accent-brand-600 cursor-pointer"
              />
              <div className="flex gap-1 text-xs">
                <button
                  type="button"
                  aria-label="Preset Light 85 percent"
                  onClick={() => setQuality(85)}
                  className={`px-2.5 py-1 min-h-[38px] sm:min-h-0 rounded border text-xs font-medium ${
                    quality === 85 ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600'
                  }`}
                >
                  Light (85%)
                </button>
                <button
                  type="button"
                  aria-label="Preset Balanced 75 percent"
                  onClick={() => setQuality(75)}
                  className={`px-2.5 py-1 min-h-[38px] sm:min-h-0 rounded border text-xs font-medium ${
                    quality === 75 ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600'
                  }`}
                >
                  Balanced (75%)
                </button>
                <button
                  type="button"
                  aria-label="Preset Strong 60 percent"
                  onClick={() => setQuality(60)}
                  className={`px-2.5 py-1 min-h-[38px] sm:min-h-0 rounded border text-xs font-medium ${
                    quality === 60 ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600'
                  }`}
                >
                  Strong (60%)
                </button>
              </div>
            </div>
          )}

          {operation === 'convert-image' && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 font-medium">Convert all to:</span>
              {(['webp', 'jpg', 'png'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  aria-label={`Convert all to ${fmt.toUpperCase()}`}
                  onClick={() => setTargetFormat(fmt)}
                  className={`px-3 py-1.5 min-h-[38px] sm:min-h-0 rounded-lg text-xs font-semibold uppercase border transition-all ${
                    targetFormat === fmt
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          )}

          {operation === 'compress-pdf' && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 font-medium">Compression Level:</span>
              <button
                type="button"
                aria-label="Basic compression level"
                onClick={() => setCompressionLevel('basic')}
                className={`px-3 py-1.5 min-h-[38px] sm:min-h-0 rounded-lg text-xs font-semibold border transition-all ${
                  compressionLevel === 'basic'
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                Basic (Fast & Safe)
              </button>
              <button
                type="button"
                aria-label="Strong compression level"
                onClick={() => setCompressionLevel('strong')}
                className={`px-3 py-1.5 min-h-[38px] sm:min-h-0 rounded-lg text-xs font-semibold border transition-all ${
                  compressionLevel === 'strong'
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                Strong (Maximum)
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Upload & Staging Zone */}
      {processingState !== 'done' && (
        <Card className="p-6">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedExtensions}
            className="hidden"
            onChange={(e) => handleFilesAdded(e.target.files)}
          />

          <div
            tabIndex={0}
            role="button"
            aria-label="Upload files area. Drag and drop files here or press Enter or Space to browse"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
              isDragOver
                ? 'border-brand-500 bg-brand-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-brand-600">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Select or drop multiple {operation === 'compress-pdf' ? 'PDFs' : 'images'}
            </h3>
            <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
              Batch process up to 15 files (100 MB total). Individual downloads and ZIP bundle provided.
            </p>
            <Button
              type="button"
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2"
            >
              Choose Files to Batch
            </Button>
          </div>

          {/* Staged Files Overview */}
          {stagedFiles.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">
                    Staged: {stagedFiles.length} of {MAX_BATCH_FILES} files
                  </span>
                  <span>•</span>
                  <span className={isOverSize ? 'text-red-600 font-semibold' : 'text-slate-600'}>
                    {formatBytes(totalSizeBytes)} / 100 MB
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear list</span>
                </button>
              </div>

              {/* Warnings if limits exceeded */}
              {isOverCount && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Too many files selected ({stagedFiles.length}). Please remove files to stay under {MAX_BATCH_FILES}.</span>
                </div>
              )}
              {isOverSize && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Total batch size exceeds 100 MB limit ({formatBytes(totalSizeBytes)}). Please remove large files.</span>
                </div>
              )}

              {/* File list */}
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 border border-slate-100 rounded-xl p-2 bg-slate-50/50">
                {stagedFiles.map((f, idx) => (
                  <div
                    key={`${f.name}-${idx}`}
                    className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200/80 text-xs hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate max-w-[80%]">
                      {f.name.toLowerCase().endsWith('.pdf') ? (
                        <FileText className="w-4 h-4 text-red-500 shrink-0" />
                      ) : (
                        <FileImage className="w-4 h-4 text-brand-600 shrink-0" />
                      )}
                      <span className="truncate font-medium text-slate-800">{f.name}</span>
                      <span className="text-slate-400 text-[11px] shrink-0">({formatBytes(f.size)})</span>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${f.name} from list`}
                      onClick={() => handleRemoveFile(idx)}
                      disabled={processingState === 'uploading' || processingState === 'processing'}
                      className="text-slate-400 hover:text-red-500 min-h-[38px] min-w-[38px] flex items-center justify-center p-1 rounded-lg transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Execution Button */}
              <div className="pt-2 flex justify-end">
                <Button
                  type="button"
                  variant="primary"
                  disabled={
                    isOverCount ||
                    isOverSize ||
                    stagedFiles.length === 0 ||
                    processingState === 'uploading' ||
                    processingState === 'processing'
                  }
                  onClick={handleExecuteBatch}
                  className="w-full sm:w-auto px-6 py-2.5 flex items-center justify-center gap-2"
                >
                  {processingState === 'uploading' || processingState === 'processing' ? (
                    <>
                      <Spinner size="sm" />
                      <span>{statusMessage}</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-4 h-4" />
                      <span>Process All ({stagedFiles.length} {stagedFiles.length === 1 ? 'file' : 'files'})</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* General Error Banner */}
      {generalError && (
        <div role="alert" aria-live="assertive" className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Batch Processing Error</p>
            <p className="text-xs text-red-700 mt-0.5">{generalError}</p>
          </div>
        </div>
      )}

      {/* Results View */}
      {processingState === 'done' && batchResult && (
        <div className="space-y-6">
          {/* Summary Hero Card */}
          <Card className="p-6 bg-[#FFFFFF] dark:bg-[#1E1913] border border-[#EDE7D9] dark:border-[#332B20] shadow-warm-card transition-colors">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#EDE7D9] dark:border-[#332B20]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={batchResult.failureCount === 0 ? 'emerald' : 'amber'}
                    size="md"
                    dot
                  >
                    {batchResult.failureCount === 0
                      ? 'Batch Succeeded'
                      : `Partial Success (${batchResult.successCount}/${batchResult.totalFiles})`}
                  </Badge>
                  <span className="text-xs text-[#666666] dark:text-[#B8AF9F]">
                    {batchResult.totalFiles} files processed
                  </span>
                </div>
                <h2 className="text-xl font-bold font-display tracking-tight text-[#202020] dark:text-[#FFFDF7]">
                  {batchResult.message}
                </h2>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {batchResult.zipDownloadUrl && (
                  <a
                    href={
                      batchResult.zipDownloadUrl.startsWith('http')
                        ? batchResult.zipDownloadUrl
                        : getDownloadUrl(batchResult.zipDownloadUrl.replace(/^\/api\/(?:files\/)?download\//, ''))
                    }
                    download
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF7900] hover:bg-[#FF7900]/90 text-white rounded-xl text-sm font-semibold shadow-warm-sm hover:shadow-warm-md transition-all"
                  >
                    <Archive className="w-4 h-4" />
                    <span>Download All (ZIP)</span>
                  </a>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearAll}
                  className="flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Process Another Batch</span>
                </Button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
              <div className="p-3 bg-[#F8F5EE] dark:bg-[#16120D] rounded-xl border border-[#EDE7D9] dark:border-[#332B20]">
                <span className="text-xs text-[#666666] dark:text-[#B8AF9F] font-medium">Original Total</span>
                <p className="text-lg font-bold text-[#202020] dark:text-[#FFFDF7]">
                  {formatBytes(batchResult.totalOriginalBytes)}
                </p>
              </div>
              <div className="p-3 bg-[#F8F5EE] dark:bg-[#16120D] rounded-xl border border-[#EDE7D9] dark:border-[#332B20]">
                <span className="text-xs text-[#666666] dark:text-[#B8AF9F] font-medium">Result Total</span>
                <p className="text-lg font-bold text-[#FF7900] dark:text-[#FFBF00]">
                  {formatBytes(batchResult.totalResultBytes)}
                </p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/25">
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Total Saved</span>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                  {formatBytes(batchResult.totalSavedBytes)}
                </p>
              </div>
              <div className="p-3 bg-[#FFBF00]/10 dark:bg-[#FFBF00]/20 rounded-xl border border-[#FFBF00]/30">
                <span className="text-xs text-[#FF7900] dark:text-[#FFBF00] font-medium">Reduction</span>
                <p className="text-lg font-bold text-[#FF7900] dark:text-[#FFBF00]">
                  {batchResult.overallReductionPercent}%
                </p>
              </div>
            </div>
          </Card>

          {/* Individual File Results List */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center justify-between">
              <span>Per-File Processing Status</span>
              <span className="text-xs font-normal text-slate-500">
                {batchResult.successCount} succeeded • {batchResult.failureCount} failed
              </span>
            </h3>

            <div className="space-y-3">
              {batchResult.items.map((item, idx) => {
                const isSuccess = item.status === 'success';
                return (
                  <div
                    key={`${item.fileId}-${idx}`}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border transition-all gap-3 ${
                      isSuccess
                        ? 'bg-white border-slate-200 hover:border-slate-300'
                        : 'bg-red-50/40 border-red-200'
                    }`}
                  >
                    {/* Left: Status Icon and Name */}
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      {isSuccess ? (
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                          <XCircle className="w-4 h-4" />
                        </div>
                      )}

                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-800 truncate">
                            {item.originalName}
                          </span>
                          <span className="text-xs font-bold text-emerald-600">
                            {isSuccess ? '✓' : ''}
                          </span>
                          {!isSuccess && (
                            <span className="text-xs font-bold text-red-600">✗</span>
                          )}
                        </div>

                        {isSuccess ? (
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{formatBytes(item.originalSize || 0)}</span>
                            <span>→</span>
                            <span className="font-medium text-slate-700">
                              {formatBytes(item.resultSize || 0)}
                            </span>
                            {item.reductionPercent !== undefined && item.reductionPercent > 0 && (
                              <Badge variant="emerald" size="sm">
                                -{item.reductionPercent}%
                              </Badge>
                            )}
                            {item.message && (
                              <span className="text-slate-400 italic">({item.message})</span>
                            )}
                          </div>
                        ) : (
                          <p className="text-[11px] text-red-600 mt-0.5 font-medium">
                            {item.error || 'Processing failed'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Individual Action */}
                    <div className="self-end sm:self-center shrink-0">
                      {isSuccess && item.outputFileId && (
                        <a
                          href={getDownloadUrl(item.outputFileId)}
                          download={item.outputFilename || item.originalName}
                          aria-label={`Download ${item.originalName}`}
                          className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-medium transition-colors border border-slate-200"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      )}
                      {!isSuccess && (
                        <span className="text-[11px] text-red-500 italic">
                          Skipped from ZIP
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
