import React, { useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Sparkles,
  Copy,
  Check,
  Download,
  AlertTriangle,
  RefreshCw,
  FileCheck,
  FileType,
  Layers,
  Eye,
  Trash2,
  MoveUp,
  MoveDown,
  CheckCircle2,
  Loader2,
  Circle,
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { FileUpload } from './ui/FileUpload';
import {
  ocrImageToTextApi,
  ocrPdfToTextApi,
  ocrPdfToWordApi,
  convertImageToPdfApi,
  uploadFile,
  OcrResponse,
  ConvertResponse,
} from '../services/api';

export type OcrTab = 'image-to-text' | 'pdf-to-text' | 'pdf-to-word' | 'image-to-pdf';

interface OcrWorkspaceProps {
  initialTab?: OcrTab;
}

type ProcessingStage =
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'recognizing'
  | 'creating'
  | 'complete'
  | 'error';

interface MultiImageItem {
  file: File;
  fileId?: string;
  previewUrl: string;
}

export const OcrWorkspace: React.FC<OcrWorkspaceProps> = ({
  initialTab = 'image-to-text',
}) => {
  const [activeTab, setActiveTab] = useState<OcrTab>(initialTab);

  // Single file state (for image-to-text, pdf-to-text, pdf-to-word)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);

  // Multi-image state (for image-to-pdf)
  const [multiImages, setMultiImages] = useState<MultiImageItem[]>([]);
  const [pageSize, setPageSize] = useState<'fit' | 'a4'>('fit');

  // Options
  const [preprocess, setPreprocess] = useState<boolean>(true);
  const [pageRange, setPageRange] = useState<string>('');

  // Processing stage state machine (Actual stages, NO fake percentages)
  const [stage, setStage] = useState<ProcessingStage>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Results
  const [ocrResult, setOcrResult] = useState<OcrResponse | null>(null);
  const [pdfResult, setPdfResult] = useState<ConvertResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activePagePreview, setActivePagePreview] = useState<number | 'all'>('all');

  // STAGES DEFINITIONS for UI tracker
  const STAGES: { key: ProcessingStage; label: string; desc: string }[] = [
    { key: 'uploading', label: 'Uploading', desc: 'Sending file to server' },
    { key: 'processing', label: 'Processing', desc: 'Validating and rendering pages' },
    { key: 'recognizing', label: 'Recognizing text', desc: 'Tesseract OCR reading characters' },
    { key: 'creating', label: 'Creating result', desc: 'Formatting text and documents' },
    { key: 'complete', label: 'Complete', desc: 'Ready to copy and download' },
  ];

  const getStageIndex = (current: ProcessingStage): number => {
    switch (current) {
      case 'uploading':
        return 0;
      case 'processing':
        return 1;
      case 'recognizing':
        return 2;
      case 'creating':
        return 3;
      case 'complete':
        return 4;
      default:
        return -1;
    }
  };

  const handleTabChange = (tab: OcrTab) => {
    setActiveTab(tab);
    resetState();
  };

  const resetState = () => {
    setSelectedFile(null);
    setFileId(null);
    setMultiImages([]);
    setStage('idle');
    setErrorMessage(null);
    setOcrResult(null);
    setPdfResult(null);
    setCopied(false);
    setActivePagePreview('all');
  };

  // Upload handler for single file
  const handleSingleFileUpload = async (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setFileId(null);
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);
    setOcrResult(null);
    setStage('uploading');

    try {
      const res = await uploadFile(file);
      if (res.success && res.file) {
        setFileId(res.file.fileId);
        setStage('idle');
      } else {
        throw new Error(res.error || 'File upload failed.');
      }
    } catch (err) {
      setStage('error');
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed.');
    }
  };

  // Process Single File OCR (Image -> Text, PDF -> Text, PDF -> Word)
  const processSingleOcr = async () => {
    if (!fileId || !selectedFile) return;

    setErrorMessage(null);
    setCopied(false);

    try {
      setStage('processing');

      // Short delay for visual transition into recognition stage
      await new Promise((r) => setTimeout(r, 200));
      setStage('recognizing');

      let res: OcrResponse;

      if (activeTab === 'image-to-text') {
        res = await ocrImageToTextApi({
          fileId,
          language: 'eng',
          preprocess,
          originalName: selectedFile.name,
        });
      } else if (activeTab === 'pdf-to-text') {
        let pagesArray: number[] | undefined;
        if (pageRange.trim()) {
          pagesArray = pageRange
            .split(',')
            .flatMap((s) => {
              if (s.includes('-')) {
                const [start, end] = s.split('-').map((n) => parseInt(n.trim(), 10));
                if (!isNaN(start) && !isNaN(end) && start <= end) {
                  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
                }
              }
              const p = parseInt(s.trim(), 10);
              return isNaN(p) ? [] : [p];
            })
            .filter((p) => p > 0);
        }

        res = await ocrPdfToTextApi({
          fileId,
          language: 'eng',
          targetPages: pagesArray,
          originalName: selectedFile.name,
        });
      } else {
        // PDF to Word
        res = await ocrPdfToWordApi({
          fileId,
          language: 'eng',
          originalName: selectedFile.name,
        });
      }

      setStage('creating');
      await new Promise((r) => setTimeout(r, 150));

      setOcrResult(res);
      setStage('complete');
    } catch (err) {
      setStage('error');
      setErrorMessage(err instanceof Error ? err.message : 'OCR processing failed.');
    }
  };

  // Multi-image handlers for Image -> PDF
  const handleMultiImageSelect = async (files: File[]) => {
    const valid = files.filter((f) =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    );
    if (valid.length === 0) return;

    const newItems: MultiImageItem[] = valid.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setMultiImages((prev) => [...prev, ...newItems]);
  };

  const removeMultiImage = (index: number) => {
    setMultiImages((prev) => {
      const item = prev[index];
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const moveMultiImage = (index: number, direction: 'up' | 'down') => {
    setMultiImages((prev) => {
      const copy = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  const processImageToPdf = async () => {
    if (multiImages.length === 0) return;
    setErrorMessage(null);

    try {
      setStage('uploading');
      const uploadedIds: string[] = [];

      for (let i = 0; i < multiImages.length; i++) {
        const item = multiImages[i];
        const res = await uploadFile(item.file);
        if (res.success && res.file) {
          uploadedIds.push(res.file.fileId);
        } else {
          throw new Error(`Failed to upload ${item.file.name}`);
        }
      }

      setStage('processing');
      await new Promise((r) => setTimeout(r, 150));

      setStage('creating');
      const result = await convertImageToPdfApi({
        fileIds: uploadedIds,
        pageSize,
        outputName: 'combined_images.pdf',
      });

      setPdfResult(result);
      setStage('complete');
    } catch (err) {
      setStage('error');
      setErrorMessage(err instanceof Error ? err.message : 'Image to PDF conversion failed.');
    }
  };

  const copyToClipboard = () => {
    if (!ocrResult?.text) return;
    navigator.clipboard.writeText(ocrResult.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentStageIndex = getStageIndex(stage);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Tab Switcher with Accessible Roles */}
      <div
        role="tablist"
        aria-label="OCR Suite Modes"
        className="flex flex-wrap items-center justify-center p-1.5 bg-[#F8F5EE] dark:bg-[#16120D] rounded-2xl border border-[#EDE7D9] dark:border-[#332B20]"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'image-to-text'}
          aria-controls="panel-image-to-text"
          id="tab-image-to-text"
          onClick={() => handleTabChange('image-to-text')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#FFBF00] focus-visible:outline-none ${
            activeTab === 'image-to-text'
              ? 'bg-[#FFFFFF] dark:bg-[#2A231A] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-xs font-semibold'
              : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] hover:bg-[#FFFFFF]/50 dark:hover:bg-[#2A231A]/50 border border-transparent'
          }`}
        >
          <ImageIcon className={`w-4 h-4 ${activeTab === 'image-to-text' ? 'text-[#FF7900] dark:text-[#FFBF00]' : 'text-[#FFBF00]'}`} />
          <span>Image → Text (OCR)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'pdf-to-text'}
          aria-controls="panel-pdf-to-text"
          id="tab-pdf-to-text"
          onClick={() => handleTabChange('pdf-to-text')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#FFBF00] focus-visible:outline-none ${
            activeTab === 'pdf-to-text'
              ? 'bg-[#FFFFFF] dark:bg-[#2A231A] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-xs font-semibold'
              : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] hover:bg-[#FFFFFF]/50 dark:hover:bg-[#2A231A]/50 border border-transparent'
          }`}
        >
          <FileText className={`w-4 h-4 ${activeTab === 'pdf-to-text' ? 'text-[#FF7900] dark:text-[#FFBF00]' : 'text-[#FF7900]'}`} />
          <span>Scanned PDF → Text</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'pdf-to-word'}
          aria-controls="panel-pdf-to-word"
          id="tab-pdf-to-word"
          onClick={() => handleTabChange('pdf-to-word')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#FFBF00] focus-visible:outline-none ${
            activeTab === 'pdf-to-word'
              ? 'bg-[#FFFFFF] dark:bg-[#2A231A] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-xs font-semibold'
              : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] hover:bg-[#FFFFFF]/50 dark:hover:bg-[#2A231A]/50 border border-transparent'
          }`}
        >
          <FileType className={`w-4 h-4 ${activeTab === 'pdf-to-word' ? 'text-[#FF7900] dark:text-[#FFBF00]' : 'text-[#FF7900]'}`} />
          <span>Scanned PDF → Word</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'image-to-pdf'}
          aria-controls="panel-image-to-pdf"
          id="tab-image-to-pdf"
          onClick={() => handleTabChange('image-to-pdf')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#FFBF00] focus-visible:outline-none ${
            activeTab === 'image-to-pdf'
              ? 'bg-[#FFFFFF] dark:bg-[#2A231A] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-xs font-semibold'
              : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] hover:bg-[#FFFFFF]/50 dark:hover:bg-[#2A231A]/50 border border-transparent'
          }`}
        >
          <Layers className={`w-4 h-4 ${activeTab === 'image-to-pdf' ? 'text-[#FF7900] dark:text-[#FFBF00]' : 'text-[#FFBF00]'}`} />
          <span>Image → PDF</span>
        </button>
      </div>

      {/* Accuracy Warning Banner (Required) */}
      {(activeTab === 'image-to-text' ||
        activeTab === 'pdf-to-text' ||
        activeTab === 'pdf-to-word') && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl text-amber-800 dark:text-amber-200 text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">OCR Accuracy Notice: </span>
            Optical Character Recognition depends on scan resolution, image contrast, lighting,
            and font clarity. Extracted text may require proofreading and manual corrections.
          </div>
        </div>
      )}

      {/* Main Workspace Card */}
      <Card className="p-6 md:p-8">
        {/* TAB 1: Image -> Text */}
        {activeTab === 'image-to-text' && (
          <div className="space-y-6">
            {!ocrResult && (
              <>
                <FileUpload
                  accept=".png, .jpg, .jpeg, .webp, .bmp"
                  maxSizeMB={25}
                  onFileSelect={handleSingleFileUpload}
                />

                {selectedFile && fileId && stage === 'idle' && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <ImageIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={preprocess}
                          onChange={(e) => setPreprocess(e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Auto-enhance contrast for scans</span>
                      </label>
                    </div>

                    <Button
                      onClick={processSingleOcr}
                      className="w-full py-3 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Extract Text with Tesseract OCR</span>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 2: Scanned PDF -> Text */}
        {activeTab === 'pdf-to-text' && (
          <div className="space-y-6">
            {!ocrResult && (
              <>
                <FileUpload
                  accept=".pdf"
                  maxSizeMB={50}
                  onFileSelect={handleSingleFileUpload}
                />

                {selectedFile && fileId && stage === 'idle' && (
                  <div className="space-y-4 pt-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          Pages (optional):
                        </label>
                        <input
                          type="text"
                          value={pageRange}
                          onChange={(e) => setPageRange(e.target.value)}
                          placeholder="e.g. 1-3, 5 (or all)"
                          className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-36"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={processSingleOcr}
                      className="w-full py-3 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Render Pages & Recognize Text</span>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 3: Scanned PDF -> Word (DOCX) */}
        {activeTab === 'pdf-to-word' && (
          <div className="space-y-6">
            {!ocrResult && (
              <>
                <FileUpload
                  accept=".pdf"
                  maxSizeMB={50}
                  onFileSelect={handleSingleFileUpload}
                />

                {selectedFile && fileId && stage === 'idle' && (
                  <div className="space-y-4 pt-2">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileType className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>

                      <Badge variant="sky">Editable DOCX</Badge>
                    </div>

                    <Button
                      onClick={processSingleOcr}
                      className="w-full py-3 flex items-center justify-center gap-2"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Convert Scanned PDF to Word (.docx)</span>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 4: Image -> PDF */}
        {activeTab === 'image-to-pdf' && (
          <div className="space-y-6">
            {!pdfResult && (
              <>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-indigo-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.webp"
                    id="multi-image-input"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleMultiImageSelect(Array.from(e.target.files));
                      }
                    }}
                  />
                  <label
                    htmlFor="multi-image-input"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      Click to browse or add photos/scans
                    </p>
                    <p className="text-xs text-slate-500">
                      Select one or multiple images (.jpg, .png, .webp) to combine into a PDF
                    </p>
                  </label>
                </div>

                {multiImages.length > 0 && stage === 'idle' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {multiImages.length} Image{multiImages.length > 1 ? 's' : ''} Selected
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Page sizing:</span>
                        <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800">
                          <button
                            onClick={() => setPageSize('fit')}
                            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                              pageSize === 'fit'
                                ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            Fit Image
                          </button>
                          <button
                            onClick={() => setPageSize('a4')}
                            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                              pageSize === 'a4'
                                ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            Standard A4
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {multiImages.map((item, idx) => (
                        <div
                          key={idx}
                          className="relative group p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center"
                        >
                          <img
                            src={item.previewUrl}
                            alt={item.file.name}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate w-full mt-1.5 text-center">
                            {idx + 1}. {item.file.name}
                          </p>

                          <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-sm p-1 rounded-lg">
                            {idx > 0 && (
                              <button
                                onClick={() => moveMultiImage(idx, 'up')}
                                className="p-1 text-white hover:text-indigo-300"
                                title="Move Earlier"
                              >
                                <MoveUp className="w-3 h-3" />
                              </button>
                            )}
                            {idx < multiImages.length - 1 && (
                              <button
                                onClick={() => moveMultiImage(idx, 'down')}
                                className="p-1 text-white hover:text-indigo-300"
                                title="Move Later"
                              >
                                <MoveDown className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={() => removeMultiImage(idx)}
                              className="p-1 text-red-400 hover:text-red-300"
                              title="Remove"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={processImageToPdf}
                      className="w-full py-3 flex items-center justify-center gap-2"
                    >
                      <Layers className="w-4 h-4" />
                      <span>Convert {multiImages.length} Image{multiImages.length > 1 ? 's' : ''} to PDF</span>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* PROCESSING STAGE TRACKER (Visible during active progression) */}
        {stage !== 'idle' && stage !== 'error' && (
          <div className="py-6 border-t border-slate-200 dark:border-slate-700/80 my-4 space-y-6">
            <div className="text-center">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                Processing Progression
              </h3>
            </div>

            {/* Stages Step Indicator */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {STAGES.map((s, idx) => {
                const isPassed = currentStageIndex > idx;
                const isCurrent = currentStageIndex === idx;

                return (
                  <div
                    key={s.key}
                    className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-600 shadow-sm'
                        : isPassed
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="mb-2">
                      {isPassed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : isCurrent ? (
                        <Loader2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        isCurrent
                          ? 'text-indigo-700 dark:text-indigo-300'
                          : isPassed
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-slate-500'
                      }`}
                    >
                      {s.label}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                      {s.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {stage === 'error' && errorMessage && (
          <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Processing Failed</span>
            </div>
            <p className="text-xs text-red-600 dark:text-red-400">{errorMessage}</p>
            <Button variant="secondary" size="sm" onClick={resetState}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Try Again
            </Button>
          </div>
        )}

        {/* OCR RESULTS DISPLAY */}
        {stage === 'complete' && ocrResult && (
          <div className="space-y-6 pt-2">
            {/* Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">
                  Confidence
                </span>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {ocrResult.confidence}%
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">
                  Words
                </span>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {ocrResult.wordCount}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">
                  Characters
                </span>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {ocrResult.characterCount}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">
                  Pages
                </span>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {ocrResult.pageCount}
                </p>
              </div>
            </div>

            {/* Page Selector for Multi-Page PDF */}
            {ocrResult.pages && ocrResult.pages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setActivePagePreview('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    activePagePreview === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  All Pages ({ocrResult.pageCount})
                </button>
                {ocrResult.pages.map((p) => (
                  <button
                    key={p.pageNumber}
                    onClick={() => setActivePagePreview(p.pageNumber)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      activePagePreview === p.pageNumber
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Page {p.pageNumber}
                  </button>
                ))}
              </div>
            )}

            {/* Extracted Text Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>Extracted Text Content</span>
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-medium">Copied to clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                readOnly
                rows={10}
                value={
                  activePagePreview === 'all'
                    ? ocrResult.text
                    : ocrResult.pages?.find((p) => p.pageNumber === activePagePreview)?.text || ''
                }
                className="w-full p-4 font-mono text-xs bg-slate-900 text-slate-100 rounded-xl border border-slate-700 focus:outline-none resize-y leading-relaxed"
              />
            </div>

            {/* Download and Next Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {ocrResult.docxDownloadUrl && (
                <a
                  href={ocrResult.docxDownloadUrl}
                  download
                  className="flex-1 min-w-[200px]"
                >
                  <Button className="w-full flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    <span>Download Word Document (.DOCX)</span>
                  </Button>
                </a>
              )}

              {ocrResult.textDownloadUrl && (
                <a
                  href={ocrResult.textDownloadUrl}
                  download
                  className={ocrResult.docxDownloadUrl ? 'flex-1 min-w-[180px]' : 'flex-1'}
                >
                  <Button
                    variant={ocrResult.docxDownloadUrl ? 'secondary' : 'primary'}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Text (.TXT)</span>
                  </Button>
                </a>
              )}

              <Button variant="secondary" onClick={resetState}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Process Another File
              </Button>
            </div>
          </div>
        )}

        {/* IMAGE TO PDF RESULTS DISPLAY */}
        {stage === 'complete' && pdfResult && (
          <div className="space-y-6 pt-2">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    {pdfResult.outputFilename}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {pdfResult.pageCount || 1} page{(pdfResult.pageCount || 1) > 1 ? 's' : ''} •{' '}
                    {(pdfResult.fileSize / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <Badge variant="emerald">PDF Ready</Badge>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a href={pdfResult.downloadUrl} download className="flex-1 min-w-[200px]">
                <Button className="w-full flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </Button>
              </a>

              {pdfResult.previewUrl && (
                <a
                  href={pdfResult.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[160px]"
                >
                  <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>Preview PDF</span>
                  </Button>
                </a>
              )}

              <Button variant="secondary" onClick={resetState}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Convert More Images
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
