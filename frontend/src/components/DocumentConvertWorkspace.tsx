import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  Download,
  Eye,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Info
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Input } from './ui/Input';
import { FileUpload } from './ui/FileUpload';
import { Spinner } from './ui/Loading';
import {
  getPdfInfoApi,
  convertPdfToImageApi,
  convertImageToPdfApi,
  convertOfficeToPdfApi,
  ConvertResponse,
  uploadFile,
  UploadedFileMetadata,
  getDownloadUrl,
  getPreviewUrl
} from '../services/api';
import { formatBytes } from '../utils';

export type ConvertTab = 'pdf-to-image' | 'image-to-pdf' | 'word-to-pdf' | 'excel-to-pdf';

interface ImageFileItem {
  id: string;
  fileId: string;
  originalName: string;
  size: number;
}

interface DocumentConvertWorkspaceProps {
  initialTab?: ConvertTab;
}

export const DocumentConvertWorkspace: React.FC<DocumentConvertWorkspaceProps> = ({
  initialTab = 'pdf-to-image'
}) => {
  const [activeTab, setActiveTab] = useState<ConvertTab>(initialTab);

  // Tab 1: PDF to Image State
  const [pdfDoc, setPdfDoc] = useState<{
    fileId: string;
    originalName: string;
    size: number;
  } | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);
  const [imageFormat, setImageFormat] = useState<'jpg' | 'png'>('jpg');
  const [dpi, setDpi] = useState<number>(150);
  const [pdfPageScope, setPdfPageScope] = useState<'all' | 'range'>('all');
  const [pageRange, setPageRange] = useState('');
  const [pdfToImgOutputName, setPdfToImgOutputName] = useState('converted_images');

  // Tab 2: Images to PDF State
  const [imagesList, setImagesList] = useState<ImageFileItem[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [pageSize, setPageSize] = useState<'fit' | 'a4'>('fit');
  const [imgToPdfOutputName, setImgToPdfOutputName] = useState('images_combined.pdf');
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Tab 3: Word to PDF State
  const [wordDoc, setWordDoc] = useState<UploadedFileMetadata | null>(null);
  const [wordOutputName, setWordOutputName] = useState('word_document.pdf');

  // Tab 4: Excel to PDF State
  const [excelDoc, setExcelDoc] = useState<UploadedFileMetadata | null>(null);
  const [excelOutputName, setExcelOutputName] = useState('spreadsheet.pdf');

  // Common Execution State
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ConvertResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Handle PDF upload for PDF -> Image
  const handlePdfUploaded = async (meta: UploadedFileMetadata) => {
    setPdfDoc({
      fileId: meta.fileId,
      originalName: meta.originalName,
      size: meta.size
    });
    setResult(null);
    setErrorMessage(null);

    try {
      const info = await getPdfInfoApi(meta.fileId);
      setPdfPageCount(info.pageCount);
      setPageRange(info.pageCount > 1 ? `1-${Math.min(3, info.pageCount)}` : '1');
    } catch {
      // Non-fatal
    }
  };

  // Handle multiple image addition for Images -> PDF
  const handleAddImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    setErrorMessage(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isImg = file.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.name);
        if (!isImg) continue;

        const uploadRes = await uploadFile(file);
        if (uploadRes.success && uploadRes.file) {
          setImagesList((prev) => [
            ...prev,
            {
              id: `${Date.now()}-${Math.random()}`,
              fileId: uploadRes.file!.fileId,
              originalName: uploadRes.file!.originalName,
              size: uploadRes.file!.size
            }
          ]);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload image.');
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === imagesList.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...imagesList];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    setImagesList(updated);
  };

  const removeImage = (index: number) => {
    setImagesList((prev) => prev.filter((_, i) => i !== index));
  };

  // Conversions Execution
  const handleExecutePdfToImage = async () => {
    if (!pdfDoc) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await convertPdfToImageApi({
        fileId: pdfDoc.fileId,
        format: imageFormat,
        dpi,
        pageRange: pdfPageScope === 'range' ? pageRange : undefined,
        outputName: pdfToImgOutputName || `converted_${imageFormat}`
      });
      setResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to render PDF to image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteImageToPdf = async () => {
    if (imagesList.length === 0) {
      setErrorMessage('Please add at least one image to convert to PDF.');
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const fileIds = imagesList.map((img) => img.fileId);
      const res = await convertImageToPdfApi({
        fileIds,
        pageSize,
        outputName: imgToPdfOutputName || 'images_combined.pdf'
      });
      setResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to convert images to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteWordToPdf = async () => {
    if (!wordDoc) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await convertOfficeToPdfApi({
        fileId: wordDoc.fileId,
        originalName: wordDoc.originalName,
        outputName: wordOutputName || 'word_document.pdf'
      });
      setResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to convert Word document to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteExcelToPdf = async () => {
    if (!excelDoc) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await convertOfficeToPdfApi({
        fileId: excelDoc.fileId,
        originalName: excelDoc.originalName,
        outputName: excelOutputName || 'spreadsheet.pdf'
      });
      setResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to convert Excel spreadsheet to PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartOver = () => {
    setResult(null);
    setErrorMessage(null);
    if (activeTab === 'pdf-to-image') {
      setPdfDoc(null);
      setPdfPageCount(null);
    } else if (activeTab === 'image-to-pdf') {
      setImagesList([]);
    } else if (activeTab === 'word-to-pdf') {
      setWordDoc(null);
    } else if (activeTab === 'excel-to-pdf') {
      setExcelDoc(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tab Bar with Accessible Roles */}
      <div
        role="tablist"
        aria-label="Document Converter Modes"
        className="flex items-center gap-2 p-1.5 bg-[#F8F5EE] dark:bg-[#16120D] rounded-2xl overflow-x-auto border border-[#EDE7D9] dark:border-[#332B20] focus-visible:outline-none"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'pdf-to-image'}
          aria-controls="panel-pdf-to-image"
          id="tab-pdf-to-image"
          onClick={() => {
            setActiveTab('pdf-to-image');
            setResult(null);
            setErrorMessage(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#FFBF00] focus-visible:outline-none ${
            activeTab === 'pdf-to-image'
              ? 'bg-[#FFFFFF] dark:bg-[#1E1913] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-sm font-semibold'
              : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:text-[#FFFDF7] hover:bg-[#FFFFFF] dark:bg-[#1E1913]/50 border border-transparent'
          }`}
        >
          <FileImage className={`w-4 h-4 ${activeTab === 'pdf-to-image' ? 'text-[#FF7900] dark:text-[#FFBF00]' : 'text-[#FF7900] dark:text-[#FFBF00]'}`} />
          <span>PDF to JPG / PNG</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'image-to-pdf'}
          aria-controls="panel-image-to-pdf"
          id="tab-image-to-pdf"
          onClick={() => {
            setActiveTab('image-to-pdf');
            setResult(null);
            setErrorMessage(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#FFBF00] focus-visible:outline-none ${
            activeTab === 'image-to-pdf'
              ? 'bg-[#FFFFFF] dark:bg-[#1E1913] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-sm font-semibold'
              : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:text-[#FFFDF7] hover:bg-[#FFFFFF] dark:bg-[#1E1913]/50 border border-transparent'
          }`}
        >
          <FileText className={`w-4 h-4 ${activeTab === 'image-to-pdf' ? 'text-[#FF7900] dark:text-[#FFBF00]' : 'text-[#FF7900]'}`} />
          <span>Images to PDF</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'word-to-pdf'}
          aria-controls="panel-word-to-pdf"
          id="tab-word-to-pdf"
          onClick={() => {
            setActiveTab('word-to-pdf');
            setResult(null);
            setErrorMessage(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#FFBF00] focus-visible:outline-none ${
            activeTab === 'word-to-pdf'
              ? 'bg-[#FFFFFF] dark:bg-[#1E1913] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-sm font-semibold'
              : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:text-[#FFFDF7] hover:bg-[#FFFFFF] dark:bg-[#1E1913]/50 border border-transparent'
          }`}
        >
          <FileText className={`w-4 h-4 ${activeTab === 'word-to-pdf' ? 'text-[#FF7900] dark:text-[#FFBF00]' : 'text-[#FF7900] dark:text-[#FFBF00]'}`} />
          <span>Word to PDF</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'excel-to-pdf'}
          aria-controls="panel-excel-to-pdf"
          id="tab-excel-to-pdf"
          onClick={() => {
            setActiveTab('excel-to-pdf');
            setResult(null);
            setErrorMessage(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#FFBF00] focus-visible:outline-none ${
            activeTab === 'excel-to-pdf'
              ? 'bg-[#FFFFFF] dark:bg-[#1E1913] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-sm font-semibold'
              : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:text-[#FFFDF7] hover:bg-[#FFFFFF] dark:bg-[#1E1913]/50 border border-transparent'
          }`}
        >
          <FileSpreadsheet className={`w-4 h-4 ${activeTab === 'excel-to-pdf' ? 'text-[#FF7900] dark:text-[#FFBF00]' : 'text-[#10B981]'}`} />
          <span>Excel to PDF</span>
        </button>
      </div>

      {/* Error Alert Banner with Screen-Reader Announcement */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-200 text-sm"
        >
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h5 className="font-semibold text-red-100">Conversion Error</h5>
            <p className="mt-0.5 text-xs text-red-200/90">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-300 font-bold ml-2 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Result Display Card (When operation finishes) */}
      {result && (
        <Card className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1E1913] border-emerald-500/30 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EDE7D9] dark:border-[#332B20]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold font-display uppercase tracking-tight text-[#202020] dark:text-[#FFFDF7]">Conversion Complete!</h3>
                  <Badge variant="emerald" size="sm">
                    Verified
                  </Badge>
                </div>
                <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-0.5">{result.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartOver}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Convert Another
              </Button>
            </div>
          </div>

          {/* Honest Fidelity Disclaimer Banner */}
          {result.disclaimer && (
            <div className="my-4 flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FF7900]/10 border border-[#FF7900]/25 text-[#202020] dark:text-[#FFFDF7] text-xs leading-relaxed">
              <Info className="w-4 h-4 text-[#FF7900] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#FF7900]">Conversion Notice: </span>
                {result.disclaimer}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-6">
            <div className="p-4 rounded-xl bg-[#F8F5EE] dark:bg-[#16120D] border border-[#EDE7D9] dark:border-[#332B20]">
              <div className="text-xs text-[#666666] dark:text-[#B8AF9F] font-medium">Output File</div>
              <div className="text-sm font-semibold text-[#202020] dark:text-[#FFFDF7] mt-1 truncate" title={result.outputFilename}>
                {result.outputFilename}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#F8F5EE] dark:bg-[#16120D] border border-[#EDE7D9] dark:border-[#332B20]">
              <div className="text-xs text-[#666666] dark:text-[#B8AF9F] font-medium">Output Size</div>
              <div className="text-sm font-semibold text-[#202020] dark:text-[#FFFDF7] mt-1">
                {formatBytes(result.fileSize)}
              </div>
            </div>
            {result.pageCount !== undefined && (
              <div className="p-4 rounded-xl bg-[#F8F5EE] dark:bg-[#16120D] border border-[#EDE7D9] dark:border-[#332B20] col-span-2 sm:col-span-1">
                <div className="text-xs text-[#666666] dark:text-[#B8AF9F] font-medium">
                  {result.isZip ? 'Rendered Pages' : 'Page Count'}
                </div>
                <div className="text-sm font-semibold text-[#202020] dark:text-[#FFFDF7] mt-1">
                  {result.pageCount} {result.pageCount === 1 ? 'Page' : 'Pages'}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={getDownloadUrl(result.fileId, result.outputFilename)}
              download={result.outputFilename}
              className="inline-flex items-center justify-center gap-2 font-medium transition-all rounded-xl shadow-button focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/40 text-[#202020] bg-[#FFBF00] hover:bg-[#FF7900] active:bg-[#FF7900]/90 px-5 py-2.5 text-sm font-semibold"
            >
              <Download className="w-4 h-4" />
              <span>Download {result.isZip ? 'ZIP Archive' : 'Converted File'}</span>
            </a>

            {!result.isZip && (
              <a
                href={getPreviewUrl(result.fileId)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-medium transition-all rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/30 text-[#202020] dark:text-[#FFFDF7] bg-[#F8F5EE] dark:bg-[#16120D] border border-[#EDE7D9] dark:border-[#332B20] hover:bg-[#EDE7D9] dark:hover:bg-[#2A231A] hover:border-[#FFBF00]/40 px-4 py-2.5 text-sm"
              >
                <Eye className="w-4 h-4 text-[#666666] dark:text-[#B8AF9F]" />
                <span>Open Preview</span>
              </a>
            )}
          </div>
        </Card>
      )}

      {/* Processing State */}
      {isProcessing && (
        <Card className="p-12 text-center border-dashed border-2 border-[#FFBF00]/30 bg-[#F8F5EE] dark:bg-[#16120D]">
          <Spinner size="lg" className="mx-auto text-[#FF7900] dark:text-[#FFBF00] mb-4" />
          <h4 className="text-base font-bold font-display uppercase tracking-tight text-[#202020] dark:text-[#FFFDF7]">Processing Your Conversion...</h4>
          <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-1 max-w-sm mx-auto">
            Executing real document transformation via dedicated engine and validating output structure.
          </p>
        </Card>
      )}

      {/* Workspace Body */}
      {!result && !isProcessing && (
        <div>
          {/* =========================================================================
              TAB 1: PDF TO IMAGE
              ========================================================================= */}
          {activeTab === 'pdf-to-image' && (
            <div className="space-y-6">
              {!pdfDoc ? (
                <Card className="p-6 sm:p-8">
                  <div className="text-center max-w-md mx-auto mb-6">
                    <h3 className="text-base font-bold font-display uppercase tracking-tight text-[#202020] dark:text-[#FFFDF7]">Upload PDF to Convert to Images</h3>
                    <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-1">
                      Render your PDF pages into high-resolution JPG or PNG images powered by Poppler.
                    </p>
                  </div>

                  <FileUpload
                    accept=".pdf,application/pdf"
                    maxSizeMB={50}
                    onUploadSuccess={handlePdfUploaded}
                    onUploadError={(err) => setErrorMessage(err)}
                  />
                </Card>
              ) : (
                <Card className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#EDE7D9] dark:border-[#332B20]">
                    <div>
                      <h4 className="text-sm font-bold text-[#202020] dark:text-[#FFFDF7] truncate" title={pdfDoc.originalName}>
                        {pdfDoc.originalName}
                      </h4>
                      <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-0.5">
                        {formatBytes(pdfDoc.size)}
                        {pdfPageCount !== null && ` • ${pdfPageCount} pages total`}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPdfDoc(null)}
                      leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                    >
                      Change File
                    </Button>
                  </div>

                  {/* Format Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => setImageFormat('jpg')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                        imageFormat === 'jpg'
                          ? 'border-[#FFBF00] bg-[#FFBF00]/10 ring-1 ring-[#FFBF00]/30'
                          : 'border-[#EDE7D9] dark:border-[#332B20] bg-[#F8F5EE] dark:bg-[#16120D] hover:border-[#EDE7D9] dark:border-[#42382A]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#202020] dark:text-[#FFFDF7]">JPG Format</span>
                        {imageFormat === 'jpg' && (
                          <Badge variant="brand" size="sm">
                            Selected
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-1">
                        Best for photos, presentations, and small file sizes.
                      </p>
                    </div>

                    <div
                      onClick={() => setImageFormat('png')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                        imageFormat === 'png'
                          ? 'border-[#FFBF00] bg-[#FFBF00]/10 ring-1 ring-[#FFBF00]/30'
                          : 'border-[#EDE7D9] dark:border-[#332B20] bg-[#F8F5EE] dark:bg-[#16120D] hover:border-[#EDE7D9] dark:border-[#42382A]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#202020] dark:text-[#FFFDF7]">PNG Format</span>
                        {imageFormat === 'png' && (
                          <Badge variant="brand" size="sm">
                            Selected
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-1">
                        Lossless quality with razor-sharp text and graphics.
                      </p>
                    </div>
                  </div>

                  {/* DPI Resolution */}
                  <div>
                    <label className="block text-xs font-semibold text-[#666666] dark:text-[#B8AF9F] mb-2">
                      Rendering Resolution (DPI)
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { label: '150 DPI (Recommended / Crisp)', val: 150 },
                        { label: '300 DPI (High Print Quality)', val: 300 },
                        { label: '72 DPI (Web Screen)', val: 72 }
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setDpi(item.val)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                            dpi === item.val
                              ? 'bg-[#FFBF00] text-[#202020] shadow-xs'
                              : 'bg-[#F8F5EE] dark:bg-[#16120D] text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:text-[#FFFDF7] border border-[#EDE7D9] dark:border-[#332B20]'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Page Selection Scope */}
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-[#666666] dark:text-[#B8AF9F]">
                      Page Selection
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:text-[#FFFDF7]">
                        <input
                          type="radio"
                          name="pdfPageScope"
                          checked={pdfPageScope === 'all'}
                          onChange={() => setPdfPageScope('all')}
                          className="text-[#FF7900] dark:text-[#FFBF00] focus:ring-[#FFBF00]"
                        />
                        <span>All Pages {pdfPageCount ? `(1 to ${pdfPageCount})` : ''}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:text-[#FFFDF7]">
                        <input
                          type="radio"
                          name="pdfPageScope"
                          checked={pdfPageScope === 'range'}
                          onChange={() => setPdfPageScope('range')}
                          className="text-[#FF7900] dark:text-[#FFBF00] focus:ring-[#FFBF00]"
                        />
                        <span>Custom Page Range</span>
                      </label>
                    </div>

                    {pdfPageScope === 'range' && (
                      <div className="max-w-md pt-1">
                        <Input
                          value={pageRange}
                          onChange={(e) => setPageRange(e.target.value)}
                          placeholder="e.g. 1-3, 5"
                          className="text-sm"
                        />
                        <p className="text-[11px] text-[#666666] dark:text-[#B8AF9F] mt-1">
                          Single page outputs a direct image; multiple pages output a ZIP archive.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#EDE7D9] dark:border-[#332B20] flex items-center justify-between gap-4">
                    <div className="max-w-xs w-full">
                      <label className="block text-xs font-semibold text-[#666666] dark:text-[#B8AF9F] mb-1">
                        Output Name
                      </label>
                      <Input
                        value={pdfToImgOutputName}
                        onChange={(e) => setPdfToImgOutputName(e.target.value)}
                        placeholder="converted_images"
                        className="text-sm"
                      />
                    </div>

                    <Button
                      variant="primary"
                      onClick={handleExecutePdfToImage}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Convert PDF to {imageFormat.toUpperCase()}
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* =========================================================================
              TAB 2: IMAGES TO PDF
              ========================================================================= */}
          {activeTab === 'image-to-pdf' && (
            <Card className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#EDE7D9] dark:border-[#332B20]">
                <div>
                  <h3 className="text-base font-bold font-display uppercase tracking-tight text-[#202020] dark:text-[#FFFDF7]">Images to PDF (JPG / PNG)</h3>
                  <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-0.5">
                    Combine single or multiple JPG/PNG images into a clean, valid PDF.
                  </p>
                </div>

                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleAddImages}
                  accept=".jpg,.jpeg,.png,.webp,image/*"
                  multiple
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                  isLoading={isUploadingImage}
                  leftIcon={<Plus className="w-4 h-4 text-[#FF7900] dark:text-[#FFBF00]" />}
                >
                  Add Images
                </Button>
              </div>

              {imagesList.length === 0 ? (
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className="my-6 p-10 border-2 border-dashed border-[#EDE7D9] dark:border-[#332B20] hover:border-[#FFBF00]/50 rounded-2xl text-center cursor-pointer transition bg-[#F8F5EE] dark:bg-[#16120D]/60 hover:bg-[#F8F5EE] dark:bg-[#16120D]"
                >
                  <FileImage className="w-10 h-10 text-[#FF7900] dark:text-[#FFBF00] mx-auto mb-3" />
                  <h4 className="text-sm font-semibold text-[#202020] dark:text-[#FFFDF7]">
                    Click to select JPG or PNG images
                  </h4>
                  <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-1">
                    Select one or more photos from your computer to generate a PDF.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 my-6">
                  <div className="text-xs font-semibold text-[#666666] dark:text-[#B8AF9F] uppercase tracking-wider px-1">
                    Document Image Sequence ({imagesList.length} {imagesList.length === 1 ? 'image' : 'images'})
                  </div>

                  <div className="space-y-2">
                    {imagesList.map((file, idx) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-[#EDE7D9] dark:border-[#332B20] bg-[#F8F5EE] dark:bg-[#16120D] hover:border-[#EDE7D9] dark:border-[#42382A] transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-[#FFFFFF] dark:bg-[#1E1913] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/30 text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div className="truncate">
                            <p className="text-sm font-semibold text-[#202020] dark:text-[#FFFDF7] truncate" title={file.originalName}>
                              {file.originalName}
                            </p>
                            <span className="text-xs text-[#666666] dark:text-[#B8AF9F]">{formatBytes(file.size)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => moveImage(idx, 'up')}
                            disabled={idx === 0}
                            title="Move Up"
                            className="p-1.5 rounded-lg hover:bg-[#FFFFFF] dark:bg-[#1E1913] text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:text-[#FFFDF7] disabled:opacity-30"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(idx, 'down')}
                            disabled={idx === imagesList.length - 1}
                            title="Move Down"
                            className="p-1.5 rounded-lg hover:bg-[#FFFFFF] dark:bg-[#1E1913] text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:text-[#FFFDF7] disabled:opacity-30"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            title="Remove Image"
                            className="p-1.5 rounded-lg hover:bg-red-500/15 text-[#666666] dark:text-[#B8AF9F] hover:text-red-400 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => imageInputRef.current?.click()}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    className="text-xs text-[#FF7900] dark:text-[#FFBF00] hover:text-[#FF7900]"
                  >
                    Add more images
                  </Button>
                </div>
              )}

              {imagesList.length > 0 && (
                <div className="pt-4 border-t border-[#EDE7D9] dark:border-[#332B20] space-y-4">
                  {/* Page Size Setting */}
                  <div>
                    <label className="block text-xs font-semibold text-[#666666] dark:text-[#B8AF9F] mb-2">
                      PDF Page Layout Mode
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                      <div
                        onClick={() => setPageSize('fit')}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition ${
                          pageSize === 'fit'
                            ? 'border-[#FFBF00] bg-[#FFBF00]/10 ring-1 ring-[#FFBF00]/30'
                            : 'border-[#EDE7D9] dark:border-[#332B20] bg-[#F8F5EE] dark:bg-[#16120D] hover:border-[#EDE7D9] dark:border-[#42382A]'
                        }`}
                      >
                        <div className="text-xs font-bold text-[#202020] dark:text-[#FFFDF7]">Fit Image Dimensions</div>
                        <div className="text-[11px] text-[#666666] dark:text-[#B8AF9F] mt-0.5">
                          Page size matches the exact aspect ratio of each photo.
                        </div>
                      </div>

                      <div
                        onClick={() => setPageSize('a4')}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition ${
                          pageSize === 'a4'
                            ? 'border-[#FFBF00] bg-[#FFBF00]/10 ring-1 ring-[#FFBF00]/30'
                            : 'border-[#EDE7D9] dark:border-[#332B20] bg-[#F8F5EE] dark:bg-[#16120D] hover:border-[#EDE7D9] dark:border-[#42382A]'
                        }`}
                      >
                        <div className="text-xs font-bold text-[#202020] dark:text-[#FFFDF7]">Standard A4 Format</div>
                        <div className="text-[11px] text-[#666666] dark:text-[#B8AF9F] mt-0.5">
                          Centers images on standard A4 pages with margins.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#666666] dark:text-[#B8AF9F] mb-1">
                      Output PDF Name
                    </label>
                    <Input
                      value={imgToPdfOutputName}
                      onChange={(e) => setImgToPdfOutputName(e.target.value)}
                      placeholder="images_combined.pdf"
                      className="max-w-md text-sm"
                    />
                  </div>

                  <Button
                    variant="primary"
                    onClick={handleExecuteImageToPdf}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Convert {imagesList.length} {imagesList.length === 1 ? 'Image' : 'Images'} to PDF
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* =========================================================================
              TAB 3: WORD TO PDF
              ========================================================================= */}
          {activeTab === 'word-to-pdf' && (
            <Card className="p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-base font-bold font-display uppercase tracking-tight text-[#202020] dark:text-[#FFFDF7]">Word to PDF Converter</h3>
                <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-0.5">
                  Convert Microsoft Word documents (.docx, .doc) to universally readable PDF files.
                </p>
              </div>

              {/* Fidelity Notice Alert */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FFBF00]/10 border border-[#FFBF00]/25 text-[#666666] dark:text-[#B8AF9F] text-xs leading-relaxed">
                <Info className="w-4 h-4 text-[#FF7900] dark:text-[#FFBF00] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#FF7900] dark:text-[#FFBF00]">Formatting Fidelity Note: </span>
                  Documents are converted using real LibreOffice headless conversion. Complex styling, non-standard embedded fonts, or custom shapes may exhibit subtle formatting variations from Microsoft Word.
                </div>
              </div>

              {!wordDoc ? (
                <FileUpload
                  accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                  maxSizeMB={50}
                  onUploadSuccess={(meta) => setWordDoc(meta)}
                  onUploadError={(err) => setErrorMessage(err)}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8F5EE] dark:bg-[#16120D] border border-[#EDE7D9] dark:border-[#332B20]">
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-10 h-10 rounded-xl bg-[#FFBF00]/10 text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/25 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <h4 className="text-sm font-bold text-[#202020] dark:text-[#FFFDF7] truncate" title={wordDoc.originalName}>
                          {wordDoc.originalName}
                        </h4>
                        <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-0.5">{formatBytes(wordDoc.size)}</p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setWordDoc(null)}
                      leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                    >
                      Change File
                    </Button>
                  </div>

                  <div className="max-w-md">
                    <label className="block text-xs font-semibold text-[#666666] dark:text-[#B8AF9F] mb-1">
                      Output PDF Name
                    </label>
                    <Input
                      value={wordOutputName}
                      onChange={(e) => setWordOutputName(e.target.value)}
                      placeholder="word_document.pdf"
                      className="text-sm"
                    />
                  </div>

                  <Button
                    variant="primary"
                    onClick={handleExecuteWordToPdf}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Convert Word to PDF
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* =========================================================================
              TAB 4: EXCEL TO PDF
              ========================================================================= */}
          {activeTab === 'excel-to-pdf' && (
            <Card className="p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-base font-bold font-display uppercase tracking-tight text-[#202020] dark:text-[#FFFDF7]">Excel to PDF Converter</h3>
                <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-0.5">
                  Convert spreadsheets (.xlsx, .xls) to clean, readable PDF documents with LibreOffice Calc.
                </p>
              </div>

              {/* Fidelity Notice Alert */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 text-[#666666] dark:text-[#B8AF9F] text-xs leading-relaxed">
                <Info className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#10B981]">Formatting Fidelity Note: </span>
                  Spreadsheet page breaks, gridlines, and print margins may vary based on column widths and sheet print configuration.
                </div>
              </div>

              {!excelDoc ? (
                <FileUpload
                  accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  maxSizeMB={50}
                  onUploadSuccess={(meta) => setExcelDoc(meta)}
                  onUploadError={(err) => setErrorMessage(err)}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8F5EE] dark:bg-[#16120D] border border-[#EDE7D9] dark:border-[#332B20]">
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <h4 className="text-sm font-bold text-[#202020] dark:text-[#FFFDF7] truncate" title={excelDoc.originalName}>
                          {excelDoc.originalName}
                        </h4>
                        <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-0.5">{formatBytes(excelDoc.size)}</p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExcelDoc(null)}
                      leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                    >
                      Change File
                    </Button>
                  </div>

                  <div className="max-w-md">
                    <label className="block text-xs font-semibold text-[#666666] dark:text-[#B8AF9F] mb-1">
                      Output PDF Name
                    </label>
                    <Input
                      value={excelOutputName}
                      onChange={(e) => setExcelOutputName(e.target.value)}
                      placeholder="spreadsheet.pdf"
                      className="text-sm"
                    />
                  </div>

                  <Button
                    variant="primary"
                    onClick={handleExecuteExcelToPdf}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Convert Excel to PDF
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
};


