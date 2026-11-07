import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  PenTool,
  CheckCircle2,
  XCircle,
  Download,
  RotateCcw,
  ArrowRight,
  Sliders,
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
} from './ui';
import {
  UploadedFileMetadata,
  PhotoResizeResponse,
  processApplicationPhotoApi,
  getDownloadUrl,
  getPreviewUrl,
  deleteUploadedFile,
} from '../services/api';

export type ApplicationToolType = 'photo' | 'signature';

interface ApplicationPhotoWorkspaceProps {
  initialType?: ApplicationToolType;
}

const PHOTO_PRESETS = [
  { id: 'passport', name: 'Standard Passport Photo', width: 350, height: 450, maxKB: 50, format: 'jpg', fit: 'cover' },
  { id: 'exam', name: 'Exam / Job Application Photo', width: 200, height: 230, maxKB: 50, format: 'jpg', fit: 'cover' },
  { id: 'square', name: 'Square Photo (600x600)', width: 600, height: 600, maxKB: 240, format: 'jpg', fit: 'contain' },
  { id: 'custom', name: 'Custom Specification', width: 350, height: 450, maxKB: 50, format: 'jpg', fit: 'cover' },
];

const SIGNATURE_PRESETS = [
  { id: 'sig-standard', name: 'Standard Signature (140x60)', width: 140, height: 60, maxKB: 20, format: 'jpg', fit: 'contain' },
  { id: 'sig-wide', name: 'Wide Signature (200x100)', width: 200, height: 100, maxKB: 30, format: 'jpg', fit: 'contain' },
  { id: 'sig-highres', name: 'High-Res Signature (300x120)', width: 300, height: 120, maxKB: 50, format: 'jpg', fit: 'contain' },
  { id: 'sig-custom', name: 'Custom Signature', width: 200, height: 100, maxKB: 20, format: 'jpg', fit: 'contain' },
];

export const ApplicationPhotoWorkspace: React.FC<ApplicationPhotoWorkspaceProps> = ({
  initialType = 'photo',
}) => {
  const [toolType, setToolType] = useState<ApplicationToolType>(initialType);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Upload, 2: Requirements, 3: Generate, 4: Validate & Download
  const [uploadedFile, setUploadedFile] = useState<UploadedFileMetadata | null>(null);
  const [result, setResult] = useState<PhotoResizeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Requirements State
  const [width, setWidth] = useState<string>(toolType === 'photo' ? '350' : '140');
  const [height, setHeight] = useState<string>(toolType === 'photo' ? '450' : '60');
  const [format, setFormat] = useState<'jpg' | 'png' | 'webp'>('jpg');
  const [maxSizeKB, setMaxSizeKB] = useState<string>(toolType === 'photo' ? '50' : '20');
  const [minSizeKB, setMinSizeKB] = useState<string>('10');
  const [fit, setFit] = useState<'crop' | 'contain' | 'cover' | 'centered'>('cover');

  const currentPresets = toolType === 'photo' ? PHOTO_PRESETS : SIGNATURE_PRESETS;

  const handleToolTypeChange = (newType: ApplicationToolType) => {
    setToolType(newType);
    if (newType === 'photo') {
      setWidth('350');
      setHeight('450');
      setMaxSizeKB('50');
      setMinSizeKB('10');
      setFit('cover');
    } else {
      setWidth('140');
      setHeight('60');
      setMaxSizeKB('20');
      setMinSizeKB('5');
      setFit('contain');
    }
  };

  const applyPreset = (preset: typeof PHOTO_PRESETS[0]) => {
    setWidth(preset.width.toString());
    setHeight(preset.height.toString());
    setMaxSizeKB(preset.maxKB.toString());
    setFormat(preset.format as any);
    setFit(preset.fit as any);
  };

  const handleUploadSuccess = (meta: UploadedFileMetadata) => {
    setUploadedFile(meta);
    setError(null);
    setStep(2); // Advance to Requirements
  };

  const handleGenerate = async () => {
    if (!uploadedFile) return;

    const parsedWidth = parseInt(width, 10);
    const parsedHeight = parseInt(height, 10);
    const parsedMaxKB = maxSizeKB ? parseInt(maxSizeKB, 10) : undefined;
    const parsedMinKB = minSizeKB ? parseInt(minSizeKB, 10) : undefined;

    if (!parsedWidth || parsedWidth <= 0 || !parsedHeight || parsedHeight <= 0) {
      setError('Please provide valid positive width and height dimensions.');
      return;
    }

    setStep(3); // Generating / Processing
    setError(null);

    try {
      const response = await processApplicationPhotoApi(uploadedFile.fileId, {
        width: parsedWidth,
        height: parsedHeight,
        format,
        fit,
        maxSizeKB: parsedMaxKB,
        minSizeKB: parsedMinKB,
      });

      setResult(response);
      setStep(4); // Advance to Validation & Result
    } catch (err: any) {
      setError(err.message || 'Failed to process application image.');
      setStep(2);
    }
  };

  const handleProcessAnother = () => {
    if (uploadedFile) {
      deleteUploadedFile(uploadedFile.fileId).catch(() => {});
    }
    setUploadedFile(null);
    setResult(null);
    setError(null);
    setStep(1);
  };

  return (
    <div className="space-y-6">
      {/* Tool Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1E1913] border border-[#EDE7D9] dark:border-[#332B20] shadow-warm-xs transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF7900] via-[#FFBF00] to-[#FFE642] p-0.5 shadow-warm-xs">
            <div className="w-full h-full bg-[#FFFFFF] dark:bg-[#1E1913] rounded-[10px] flex items-center justify-center">
              {toolType === 'photo' ? (
                <Camera className="w-5 h-5 text-[#FF7900] dark:text-[#FFBF00]" />
              ) : (
                <PenTool className="w-5 h-5 text-[#FF7900] dark:text-[#FFBF00]" />
              )}
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#202020] dark:text-[#FFFDF7]">
              {toolType === 'photo' ? 'Application & Passport Photo Resizer' : 'Application Signature Resizer'}
            </h3>
            <p className="text-xs text-[#666666] dark:text-[#B8AF9F]">
              Resize and compress photos or signatures to exact application guidelines with strict validation.
            </p>
          </div>
        </div>

        {step < 3 && (
          <div
            role="tablist"
            aria-label="Application Tool Selector"
            className="flex items-center gap-1 p-1 bg-[#F8F5EE] dark:bg-[#16120D] rounded-xl border border-[#EDE7D9] dark:border-[#332B20] w-full sm:w-auto"
          >
            <button
              role="tab"
              aria-selected={toolType === 'photo'}
              type="button"
              onClick={() => handleToolTypeChange('photo')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 min-h-[44px] sm:min-h-0 rounded-lg text-xs font-semibold transition ${
                toolType === 'photo'
                  ? 'bg-[#FFFFFF] dark:bg-[#2A231A] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-xs'
                  : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] border border-transparent'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Photo</span>
            </button>
            <button
              role="tab"
              aria-selected={toolType === 'signature'}
              type="button"
              onClick={() => handleToolTypeChange('signature')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 min-h-[44px] sm:min-h-0 rounded-lg text-xs font-semibold transition ${
                toolType === 'signature'
                  ? 'bg-[#FFFFFF] dark:bg-[#2A231A] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-xs'
                  : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] border border-transparent'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>Signature</span>
            </button>
          </div>
        )}
      </div>

      {/* 5-Step Process Timeline */}
      <div className="flex items-center justify-between px-2 text-xs font-medium text-[#666666] dark:text-[#B8AF9F] overflow-x-auto">
        <div className={`flex items-center gap-1.5 shrink-0 ${step >= 1 ? 'text-[#FF7900] dark:text-[#FFBF00] font-bold' : ''}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 1 ? 'bg-[#FFBF00] text-[#202020]' : 'bg-[#EDE7D9] dark:bg-[#332B20] text-[#666666] dark:text-[#B8AF9F]'}`}>1</span>
          <span>Upload</span>
        </div>
        <div className="flex-1 h-0.5 bg-[#EDE7D9] dark:bg-[#332B20] mx-2 min-w-[12px]" />
        <div className={`flex items-center gap-1.5 shrink-0 ${step >= 2 ? 'text-[#FF7900] dark:text-[#FFBF00] font-bold' : ''}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 2 ? 'bg-[#FFBF00] text-[#202020]' : 'bg-[#EDE7D9] dark:bg-[#332B20] text-[#666666] dark:text-[#B8AF9F]'}`}>2</span>
          <span>Requirements</span>
        </div>
        <div className="flex-1 h-0.5 bg-[#EDE7D9] dark:bg-[#332B20] mx-2 min-w-[12px]" />
        <div className={`flex items-center gap-1.5 shrink-0 ${step >= 3 ? 'text-[#FF7900] dark:text-[#FFBF00] font-bold' : ''}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 3 ? 'bg-[#FFBF00] text-[#202020]' : 'bg-[#EDE7D9] dark:bg-[#332B20] text-[#666666] dark:text-[#B8AF9F]'}`}>3</span>
          <span>Generate</span>
        </div>
        <div className="flex-1 h-0.5 bg-[#EDE7D9] dark:bg-[#332B20] mx-2 min-w-[12px]" />
        <div className={`flex items-center gap-1.5 shrink-0 ${step >= 4 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 4 ? 'bg-emerald-600 text-white' : 'bg-[#EDE7D9] dark:bg-[#332B20] text-[#666666] dark:text-[#B8AF9F]'}`}>4</span>
          <span>Validate & Download</span>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div role="alert" aria-live="assertive" className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-center gap-2.5">
          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: UPLOAD */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Upload {toolType === 'photo' ? 'Your Photo' : 'Your Signature'}
            </CardTitle>
            <CardDescription>
              Select an image from your device. Supported formats: JPG, JPEG, PNG, WebP.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              accept=".jpg,.jpeg,.png,.webp"
              maxSizeMB={25}
              autoUpload={true}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={(err) => setError(err)}
            />
          </CardContent>
        </Card>
      )}

      {/* STEP 2: ENTER REQUIREMENTS */}
      {step === 2 && uploadedFile && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Enter Application Requirements</CardTitle>
                  <CardDescription>
                    Fill in the exact dimensions, format, and file-size ceiling specified by your application instructions.
                  </CardDescription>
                </div>
                <Badge variant="brand" size="sm">
                  {uploadedFile.originalName}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Presets Grid */}
              <div>
                <span id="dimension-presets-label" className="text-xs font-semibold text-slate-700 block mb-2">
                  Quick Standard Dimension Templates:
                </span>
                <div
                  role="radiogroup"
                  aria-labelledby="dimension-presets-label"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5"
                >
                  {currentPresets.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      aria-label={`Select template ${p.name}, ${p.width} by ${p.height} pixels, maximum ${p.maxKB} kilobytes`}
                      onClick={() => applyPreset(p)}
                      className="p-3 min-h-[44px] rounded-xl border border-slate-200 bg-white hover:border-brand-400 hover:bg-brand-50/30 text-left transition"
                    >
                      <p className="text-xs font-bold text-slate-900">{p.name}</p>
                      <p className="text-[11px] text-slate-500 mt-1 font-mono">
                        {p.width}x{p.height} px &bull; Max {p.maxKB}KB
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Requirement Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-slate-100">
                {/* Width */}
                <div>
                  <label htmlFor="req-width-input" className="text-xs font-semibold text-slate-700 block mb-1">
                    Required Width (px)
                  </label>
                  <input
                    id="req-width-input"
                    type="number"
                    min="10"
                    max="10000"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-2 min-h-[42px] sm:min-h-0 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    placeholder="e.g. 350"
                  />
                </div>

                {/* Height */}
                <div>
                  <label htmlFor="req-height-input" className="text-xs font-semibold text-slate-700 block mb-1">
                    Required Height (px)
                  </label>
                  <input
                    id="req-height-input"
                    type="number"
                    min="10"
                    max="10000"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-2 min-h-[42px] sm:min-h-0 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    placeholder="e.g. 450"
                  />
                </div>

                {/* Maximum File Size */}
                <div>
                  <label htmlFor="req-max-kb-input" className="text-xs font-semibold text-slate-700 block mb-1">
                    Max File Size (KB)
                  </label>
                  <input
                    id="req-max-kb-input"
                    type="number"
                    min="1"
                    max="10000"
                    value={maxSizeKB}
                    onChange={(e) => setMaxSizeKB(e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-2 min-h-[42px] sm:min-h-0 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    placeholder="e.g. 50"
                  />
                </div>

                {/* Minimum File Size */}
                <div>
                  <label htmlFor="req-min-kb-input" className="text-xs font-semibold text-slate-700 block mb-1">
                    Min File Size (KB, optional)
                  </label>
                  <input
                    id="req-min-kb-input"
                    type="number"
                    min="1"
                    max="10000"
                    value={minSizeKB}
                    onChange={(e) => setMinSizeKB(e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-2 min-h-[42px] sm:min-h-0 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    placeholder="e.g. 10"
                  />
                </div>
              </div>

              {/* Format & Fitting Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div>
                  <label htmlFor="req-format-select" className="text-xs font-semibold text-slate-700 block mb-1">
                    Output Format
                  </label>
                  <select
                    id="req-format-select"
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className="w-full px-3 py-2 min-h-[42px] sm:min-h-0 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    <option value="jpg">JPG / JPEG (Standard for almost all applications)</option>
                    <option value="png">PNG (Lossless, useful for digital signatures)</option>
                    <option value="webp">WebP (Modern lightweight format)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="req-fit-select" className="text-xs font-semibold text-slate-700 block mb-1">
                    Image Fit Mode
                  </label>
                  <select
                    id="req-fit-select"
                    value={fit}
                    onChange={(e) => setFit(e.target.value as any)}
                    className="w-full px-3 py-2 min-h-[42px] sm:min-h-0 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    <option value="cover">Cover (Fill exact dimensions proportionally)</option>
                    <option value="crop">Crop Focus (Keep center/face in focus)</option>
                    <option value="contain">Contain (Pad image on white background)</option>
                    <option value="centered">Centered Fit (Keep proportions within bounding box)</option>
                  </select>
                </div>
              </div>

              {/* Requirements Live Summary Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-600">
                <span className="font-bold text-slate-800 block">Configured Requirements:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] text-slate-700">
                  <div>Width: <strong>{width} px</strong></div>
                  <div>Height: <strong>{height} px</strong></div>
                  <div>Format: <strong>{format.toUpperCase()}</strong></div>
                  <div>Size: <strong>{minSizeKB ? `${minSizeKB}KB - ` : ''}Max {maxSizeKB} KB</strong></div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col sm:flex-row gap-3 sm:justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                className="w-full sm:w-auto"
              >
                Choose Another Image
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleGenerate}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Generate & Validate Result
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* STEP 3: GENERATING / PROCESSING SPINNER */}
      {step === 3 && (
        <Card className="p-12 text-center flex flex-col items-center justify-center gap-4">
          <Spinner size="lg" variant="brand" />
          <div>
            <h4 className="text-base font-bold text-slate-900">
              Generating & Sizing Image...
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Adjusting dimensions and iteratively targeting exact file size limits using Sharp.
            </p>
          </div>
        </Card>
      )}

      {/* STEP 4: VALIDATE & DOWNLOAD */}
      {step === 4 && result && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Validation Banner */}
            <div
              className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                result.validation.allValid
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50/80 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                {result.validation.allValid ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold">
                    {result.validation.allValid
                      ? 'All Requirements Successfully Satisfied'
                      : 'Some Requirements Were Not Met'}
                  </h4>
                  <p className="text-xs mt-0.5 opacity-90 leading-relaxed">
                    {result.message}
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-auto shrink-0">
                <a
                  href={getDownloadUrl(result.outputFileId, uploadedFile?.originalName)}
                  download
                  className="w-full block sm:inline-block"
                >
                  <Button variant="primary" size="sm" leftIcon={<Download className="w-4 h-4" />} className="w-full sm:w-auto">
                    Download Image
                  </Button>
                </a>
              </div>
            </div>

            {/* Validation Checklist Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements Validation Report</CardTitle>
                <CardDescription>
                  Verified against the actual generated output file on disk.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {result.validation.checklist.map((item) => (
                    <div
                      key={item.label}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2 ${
                        item.passed
                          ? 'bg-emerald-50/40 border-emerald-200/80 text-emerald-900'
                          : 'bg-rose-50/50 border-rose-200 text-rose-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">{item.label}</span>
                        {item.passed ? (
                          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Correct
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                            <XCircle className="w-4 h-4 text-rose-500" />
                            Failed
                          </span>
                        )}
                      </div>

                      <div className="text-xs space-y-0.5 font-mono">
                        <p className="text-slate-500 text-[11px]">Expected: {item.expected}</p>
                        <p className="font-bold text-slate-800">Actual: {item.actual}</p>
                      </div>

                      <p className="text-[11px] leading-tight font-medium">
                        {item.passed ? `✓ ${item.message}` : `✗ ${item.message}`}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Previews: Original vs Result */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <span className="text-xs font-bold text-slate-800 block">
                    Visual Inspection & Preview:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Original Preview */}
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center space-y-2">
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span className="font-semibold">Original Image</span>
                        <span className="font-mono">{result.original.width}x{result.original.height} px &bull; {(result.original.size / 1024).toFixed(1)} KB</span>
                      </div>
                      <div className="h-64 flex items-center justify-center overflow-hidden rounded-lg bg-white border border-slate-200/80 p-2">
                        <img
                          src={getPreviewUrl(uploadedFile!.fileId)}
                          alt="Original"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>

                    {/* Result Preview */}
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center space-y-2">
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span className="font-semibold text-emerald-700">Generated Output</span>
                        <span className="font-mono font-bold text-slate-800">{result.result.width}x{result.result.height} px &bull; {(result.result.size / 1024).toFixed(1)} KB</span>
                      </div>
                      <div className="h-64 flex items-center justify-center overflow-hidden rounded-lg bg-white border border-slate-200/80 p-2">
                        <img
                          src={getPreviewUrl(result.outputFileId)}
                          alt="Generated output"
                          className="max-h-full max-w-full object-contain shadow-card"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex-col sm:flex-row gap-3 sm:justify-between bg-slate-50/50">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleProcessAnother}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  className="w-full sm:w-auto"
                >
                  Process Another {toolType === 'photo' ? 'Photo' : 'Signature'}
                </Button>

                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(2)}
                    leftIcon={<Sliders className="w-3.5 h-3.5" />}
                    className="w-full sm:w-auto"
                  >
                    Adjust Requirements
                  </Button>
                  <a
                    href={getDownloadUrl(result.outputFileId, uploadedFile?.originalName)}
                    download
                    className="w-full sm:w-auto"
                  >
                    <Button variant="primary" size="sm" leftIcon={<Download className="w-4 h-4" />} className="w-full sm:w-auto">
                      Download File
                    </Button>
                  </a>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
