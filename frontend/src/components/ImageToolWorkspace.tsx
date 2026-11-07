import React, { useState } from 'react';
import {
  FileImage,
  ArrowRight,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  FileUpload,
  Spinner,
  ResultView,
} from './ui';
import {
  UploadedFileMetadata,
  ImageProcessResponse,
  compressImageApi,
  resizeImageApi,
  convertImageApi,
  getDownloadUrl,
  getPreviewUrl,
  deleteUploadedFile,
} from '../services/api';

export type ImageToolMode = 'compress' | 'resize' | 'convert';

interface ImageToolWorkspaceProps {
  initialMode?: ImageToolMode;
  initialTargetFormat?: 'jpg' | 'png' | 'webp';
  onResetTool?: () => void;
}

const formatBytes = (bytes?: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const ImageToolWorkspace: React.FC<ImageToolWorkspaceProps> = ({
  initialMode = 'compress',
  initialTargetFormat = 'webp',
}) => {
  const [mode, setMode] = useState<ImageToolMode>(initialMode);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Upload, 2: Requirements, 3: Processing, 4: Result
  const [uploadedFile, setUploadedFile] = useState<UploadedFileMetadata | null>(null);
  const [processResult, setProcessResult] = useState<ImageProcessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Compress Options
  const [compressPreset, setCompressPreset] = useState<'light' | 'balanced' | 'strong'>('balanced');
  const [compressQuality, setCompressQuality] = useState<number>(75);
  const [stripMetadata, setStripMetadata] = useState<boolean>(true);

  // Resize Options
  const [resizeMode, setResizeMode] = useState<'percentage' | 'dimensions'>('dimensions');
  const [scalePercent, setScalePercent] = useState<number>(50);
  const [targetWidth, setTargetWidth] = useState<string>('800');
  const [targetHeight, setTargetHeight] = useState<string>('');
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true);
  const [fitMode, setFitMode] = useState<string>('inside');

  // Convert Options
  const [targetFormat, setTargetFormat] = useState<'jpg' | 'png' | 'webp'>(initialTargetFormat);
  const [convertQuality, setConvertQuality] = useState<number>(85);

  const handleUploadSuccess = (meta: UploadedFileMetadata) => {
    setUploadedFile(meta);
    setError(null);
    setStep(2); // Advance to Requirements / Options
  };

  const handleExecute = async () => {
    if (!uploadedFile) return;

    setStep(3);
    setError(null);

    try {
      let result: ImageProcessResponse;

      if (mode === 'compress') {
        result = await compressImageApi(uploadedFile.fileId, {
          preset: compressPreset,
          quality: compressQuality,
          stripMetadata,
        });
      } else if (mode === 'resize') {
        result = await resizeImageApi(uploadedFile.fileId, {
          width: resizeMode === 'dimensions' && targetWidth ? parseInt(targetWidth, 10) : undefined,
          height: resizeMode === 'dimensions' && targetHeight ? parseInt(targetHeight, 10) : undefined,
          scalePercent: resizeMode === 'percentage' ? scalePercent : undefined,
          maintainAspectRatio,
          fit: fitMode,
        });
      } else {
        result = await convertImageApi(uploadedFile.fileId, {
          targetFormat,
          quality: convertQuality,
        });
      }

      setProcessResult(result);
      setStep(4); // Advance to Result
    } catch (err: any) {
      setError(err.message || 'Processing failed.');
      setStep(2);
    }
  };

  const handleProcessAnother = async () => {
    if (uploadedFile) {
      // Clean up uploaded temporary file
      deleteUploadedFile(uploadedFile.fileId).catch(() => {});
    }
    setUploadedFile(null);
    setProcessResult(null);
    setError(null);
    setStep(1);
  };

  return (
    <div className="space-y-6">
      {/* Tool Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shadow-subtle">
            <FileImage className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {mode === 'compress' && 'Image Compression'}
              {mode === 'resize' && 'Image Resizer'}
              {mode === 'convert' && 'Image Format Converter'}
            </h3>
            <p className="text-xs text-slate-500">
              High-performance local image optimization powered by Sharp.
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs (only switchable when not in active result) */}
        {step < 3 && (
          <div
            role="tablist"
            aria-label="Image Operation Modes"
            className="flex items-center gap-1 p-1 bg-[#F8F5EE] dark:bg-[#16120D] rounded-xl border border-[#EDE7D9] dark:border-[#332B20] w-full sm:w-auto"
          >
            <button
              role="tab"
              aria-selected={mode === 'compress'}
              onClick={() => setMode('compress')}
              className={`flex-1 sm:flex-none px-3.5 py-2 sm:py-1.5 min-h-[44px] sm:min-h-0 rounded-lg text-xs font-semibold transition ${
                mode === 'compress'
                  ? 'bg-[#FFFFFF] dark:bg-[#2A231A] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-xs'
                  : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] border border-transparent'
              }`}
            >
              Compress
            </button>
            <button
              role="tab"
              aria-selected={mode === 'resize'}
              onClick={() => setMode('resize')}
              className={`flex-1 sm:flex-none px-3.5 py-2 sm:py-1.5 min-h-[44px] sm:min-h-0 rounded-lg text-xs font-semibold transition ${
                mode === 'resize'
                  ? 'bg-[#FFFFFF] dark:bg-[#2A231A] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-xs'
                  : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] border border-transparent'
              }`}
            >
              Resize
            </button>
            <button
              role="tab"
              aria-selected={mode === 'convert'}
              onClick={() => setMode('convert')}
              className={`flex-1 sm:flex-none px-3.5 py-2 sm:py-1.5 min-h-[44px] sm:min-h-0 rounded-lg text-xs font-semibold transition ${
                mode === 'convert'
                  ? 'bg-[#FFFFFF] dark:bg-[#2A231A] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-xs'
                  : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] border border-transparent'
              }`}
            >
              Convert
            </button>
          </div>
        )}
      </div>

      {/* 5-Step Visual Progress Bar */}
      <div className="flex items-center justify-between px-2 text-xs font-medium text-slate-500 overflow-x-auto">
        <div className={`flex items-center gap-1.5 shrink-0 ${step >= 1 ? 'text-brand-600 font-bold' : ''}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 1 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
          <span>Upload</span>
        </div>
        <div className="flex-1 h-0.5 bg-slate-200 mx-2 min-w-[12px]" />
        <div className={`flex items-center gap-1.5 shrink-0 ${step >= 2 ? 'text-brand-600 font-bold' : ''}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 2 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
          <span>Requirements</span>
        </div>
        <div className="flex-1 h-0.5 bg-slate-200 mx-2 min-w-[12px]" />
        <div className={`flex items-center gap-1.5 shrink-0 ${step >= 3 ? 'text-brand-600 font-bold' : ''}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 3 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
          <span>Process</span>
        </div>
        <div className="flex-1 h-0.5 bg-slate-200 mx-2 min-w-[12px]" />
        <div className={`flex items-center gap-1.5 shrink-0 ${step >= 4 ? 'text-emerald-600 font-bold' : ''}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>4</span>
          <span>Result</span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div role="alert" aria-live="assertive" className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: UPLOAD */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select or Drop Your Image</CardTitle>
            <CardDescription>
              Accepts JPG, JPEG, PNG, and WebP images up to 50MB. Files are verified on upload.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              accept=".jpg,.jpeg,.png,.webp"
              maxSizeMB={50}
              autoUpload={true}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={(err) => setError(err)}
            />
          </CardContent>
        </Card>
      )}

      {/* STEP 2: REQUIREMENTS / OPTIONS */}
      {step === 2 && uploadedFile && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Configure Processing Options</CardTitle>
                <CardDescription>
                  Target file: <span className="font-semibold text-slate-700">{uploadedFile.originalName}</span> ({formatBytes(uploadedFile.size)})
                </CardDescription>
              </div>
              <Badge variant="brand" size="md">
                {uploadedFile.extension.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* COMPRESS OPTIONS */}
            {mode === 'compress' && (
              <div className="space-y-4">
                <div>
                  <span id="compress-preset-label" className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Optimization Preset
                  </span>
                  <div
                    role="radiogroup"
                    aria-labelledby="compress-preset-label"
                    className="grid grid-cols-1 sm:grid-cols-3 gap-2"
                  >
                    {[
                      { id: 'light', label: 'Light', desc: 'Minimal loss, high fidelity (85%)' },
                      { id: 'balanced', label: 'Balanced', desc: 'Recommended balance (75%)' },
                      { id: 'strong', label: 'Strong', desc: 'Maximum size reduction (60%)' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        role="radio"
                        aria-checked={compressPreset === p.id}
                        type="button"
                        onClick={() => {
                          setCompressPreset(p.id as any);
                          setCompressQuality(p.id === 'light' ? 85 : p.id === 'strong' ? 60 : 75);
                        }}
                        className={`p-3 min-h-[44px] rounded-xl border text-left transition ${
                          compressPreset === p.id
                            ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-500'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <p className="text-xs font-bold text-slate-900">{p.label}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{p.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <label htmlFor="compress-quality-slider" className="font-semibold text-slate-700">
                      Custom Quality: {compressQuality}%
                    </label>
                    <span className="text-slate-400">1 - 100</span>
                  </div>
                  <input
                    id="compress-quality-slider"
                    aria-label="Custom Quality percentage"
                    type="range"
                    min="1"
                    max="100"
                    value={compressQuality}
                    onChange={(e) => setCompressQuality(parseInt(e.target.value, 10))}
                    className="w-full h-2 accent-brand-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <input
                    type="checkbox"
                    id="stripExif"
                    checked={stripMetadata}
                    onChange={(e) => setStripMetadata(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                  />
                  <label htmlFor="stripExif" className="text-xs text-slate-700 cursor-pointer">
                    Strip EXIF metadata (camera data, GPS coordinates) to maximize privacy and save bytes
                  </label>
                </div>
              </div>
            )}

            {/* RESIZE OPTIONS */}
            {mode === 'resize' && (
              <div className="space-y-4">
                <div role="tablist" aria-label="Resize calculation method" className="flex items-center gap-1 p-1 bg-[#F8F5EE] dark:bg-[#16120D] rounded-xl border border-[#EDE7D9] dark:border-[#332B20] w-full sm:w-fit">
                  <button
                    role="tab"
                    aria-selected={resizeMode === 'dimensions'}
                    type="button"
                    onClick={() => setResizeMode('dimensions')}
                    className={`flex-1 sm:flex-none px-3.5 py-2 sm:py-1 min-h-[44px] sm:min-h-0 rounded-lg text-xs font-semibold transition ${
                      resizeMode === 'dimensions'
                        ? 'bg-[#FFFFFF] dark:bg-[#2A231A] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-xs'
                        : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] border border-transparent'
                    }`}
                  >
                    Exact Dimensions (px)
                  </button>
                  <button
                    role="tab"
                    aria-selected={resizeMode === 'percentage'}
                    type="button"
                    onClick={() => setResizeMode('percentage')}
                    className={`flex-1 sm:flex-none px-3.5 py-2 sm:py-1 min-h-[44px] sm:min-h-0 rounded-lg text-xs font-semibold transition ${
                      resizeMode === 'percentage'
                        ? 'bg-[#FFFFFF] dark:bg-[#2A231A] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-xs'
                        : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] border border-transparent'
                    }`}
                  >
                    By Percentage (%)
                  </button>
                </div>

                {resizeMode === 'dimensions' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="target-width-input" className="text-xs font-semibold text-slate-700 block mb-1">
                        Target Width (px)
                      </label>
                      <input
                        id="target-width-input"
                        type="number"
                        placeholder="e.g. 1280"
                        value={targetWidth}
                        onChange={(e) => setTargetWidth(e.target.value)}
                        className="w-full px-3 py-2.5 sm:py-2 min-h-[42px] sm:min-h-0 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="target-height-input" className="text-xs font-semibold text-slate-700 block mb-1">
                        Target Height (px, optional)
                      </label>
                      <input
                        id="target-height-input"
                        type="number"
                        placeholder="Leave blank to preserve ratio"
                        value={targetHeight}
                        onChange={(e) => setTargetHeight(e.target.value)}
                        className="w-full px-3 py-2.5 sm:py-2 min-h-[42px] sm:min-h-0 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <label htmlFor="scale-percent-slider" className="font-semibold text-slate-700">Scaling: {scalePercent}%</label>
                      <span className="text-slate-400">10% - 200%</span>
                    </div>
                    <input
                      id="scale-percent-slider"
                      aria-label="Image scaling percentage"
                      type="range"
                      min="10"
                      max="200"
                      step="5"
                      value={scalePercent}
                      onChange={(e) => setScalePercent(parseInt(e.target.value, 10))}
                      className="w-full h-2 accent-brand-600 cursor-pointer"
                    />
                    <div className="flex flex-wrap gap-2">
                      {[25, 50, 75, 100, 150].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          aria-label={`Set scale to ${pct} percent`}
                          onClick={() => setScalePercent(pct)}
                          className="px-3 py-1.5 min-h-[38px] sm:min-h-0 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="maintainAspect"
                      checked={maintainAspectRatio}
                      onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                    <label htmlFor="maintainAspect" className="text-xs text-slate-700 cursor-pointer">
                      Lock aspect ratio (prevents distortion)
                    </label>
                  </div>

                  <div>
                    <label htmlFor="fit-mode-select" className="text-xs font-semibold text-slate-700 block mb-1">
                      Fit Mode
                    </label>
                    <select
                      id="fit-mode-select"
                      value={fitMode}
                      onChange={(e) => setFitMode(e.target.value)}
                      className="w-full px-3 py-2 min-h-[42px] sm:min-h-0 rounded-xl border border-slate-200 text-xs bg-white"
                    >
                      <option value="inside">Inside (Fit within bounding box)</option>
                      <option value="cover">Cover (Crop excess to exact dimensions)</option>
                      <option value="contain">Contain (Pad image to exact size)</option>
                      <option value="fill">Fill (Stretch without preserving ratio)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* CONVERT OPTIONS */}
            {mode === 'convert' && (
              <div className="space-y-4">
                <div>
                  <span id="target-format-label" className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Target Output Format
                  </span>
                  <div
                    role="radiogroup"
                    aria-labelledby="target-format-label"
                    className="grid grid-cols-1 sm:grid-cols-3 gap-2"
                  >
                    {[
                      { id: 'webp', label: 'WebP', desc: 'Modern high compression' },
                      { id: 'jpg', label: 'JPG / JPEG', desc: 'Universal compatibility' },
                      { id: 'png', label: 'PNG', desc: 'Lossless & transparency' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        role="radio"
                        aria-checked={targetFormat === f.id}
                        type="button"
                        onClick={() => setTargetFormat(f.id as any)}
                        className={`p-3 min-h-[44px] rounded-xl border text-left transition ${
                          targetFormat === f.id
                            ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-500'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <p className="text-xs font-bold text-slate-900 uppercase">{f.label}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{f.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {targetFormat !== 'png' && (
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <label htmlFor="convert-quality-slider" className="font-semibold text-slate-700">Quality: {convertQuality}%</label>
                      <span className="text-slate-400">1 - 100</span>
                    </div>
                    <input
                      id="convert-quality-slider"
                      aria-label="Target format quality percentage"
                      type="range"
                      min="1"
                      max="100"
                      value={convertQuality}
                      onChange={(e) => setConvertQuality(parseInt(e.target.value, 10))}
                      className="w-full h-2 accent-brand-600 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col sm:flex-row gap-3 sm:justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(1)}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="w-full sm:w-auto"
            >
              Choose Different File
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleExecute}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Process Image Now
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 3: PROCESSING SPINNER */}
      {step === 3 && (
        <Card className="p-12 text-center flex flex-col items-center justify-center gap-4">
          <Spinner size="lg" variant="brand" />
          <div>
            <h4 className="text-base font-bold text-slate-900">
              Processing Image...
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Applying Sharp transformations on local server. No simulated wait times.
            </p>
          </div>
        </Card>
      )}

      {/* STEP 4: RESULT UI */}
      {step === 4 && processResult && (
        <ResultView
          title={
            mode === 'compress'
              ? 'Image Compressed Successfully'
              : mode === 'resize'
              ? 'Image Resized Successfully'
              : 'Image Converted Successfully'
          }
          subtitle={processResult.message}
          filename={uploadedFile?.originalName || processResult.outputFilename}
          fileType={`${processResult.format.toUpperCase()} Image`}
          originalSize={processResult.original.size}
          resultSize={processResult.result.size}
          savedBytes={processResult.savedBytes}
          reductionPercent={processResult.reductionPercent}
          originalDimensions={
            processResult.original.width && processResult.original.height
              ? { width: processResult.original.width, height: processResult.original.height }
              : undefined
          }
          resultDimensions={
            processResult.result.width && processResult.result.height
              ? { width: processResult.result.width, height: processResult.result.height }
              : undefined
          }
          previewUrl={getPreviewUrl(processResult.outputFileId)}
          previewType="image"
          downloadUrl={getDownloadUrl(processResult.outputFileId, uploadedFile?.originalName)}
          downloadFilename={processResult.outputFilename}
          downloadLabel={`Download ${processResult.format.toUpperCase()}`}
          onProcessAnother={handleProcessAnother}
          isAlreadyOptimized={processResult.isOptimized}
        />
      )}
    </div>
  );
};
