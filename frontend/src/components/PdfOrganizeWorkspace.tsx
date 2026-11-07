import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Scissors,
  Files,
  ArrowUpDown,
  RotateCw,
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
  ArrowLeft,
  GripVertical,
  Check
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Input } from './ui/Input';
import { FileUpload } from './ui/FileUpload';
import { Spinner } from './ui/Loading';
import {
  getPdfInfoApi,
  mergePdfsApi,
  splitPdfApi,
  extractPdfPagesApi,
  reorderPdfPagesApi,
  rotatePdfPagesApi,
  PdfPageMeta,
  PdfOrganizeResponse,
  uploadFile,
  UploadedFileMetadata,
  getDownloadUrl,
  getPreviewUrl
} from '../services/api';
import { formatBytes } from '../utils';

export type OrganizeTab = 'merge' | 'split' | 'extract' | 'reorder' | 'rotate';

interface MergeFileItem {
  id: string; // unique local ID for React key
  fileId: string;
  originalName: string;
  size: number;
  pageCount?: number;
}

interface PdfOrganizeWorkspaceProps {
  initialTab?: OrganizeTab;
}

export const PdfOrganizeWorkspace: React.FC<PdfOrganizeWorkspaceProps> = ({
  initialTab = 'merge'
}) => {
  const [activeTab, setActiveTab] = useState<OrganizeTab>(initialTab);

  // Tab 1: Merge State
  const [mergeFiles, setMergeFiles] = useState<MergeFileItem[]>([]);
  const [isUploadingMergeFile, setIsUploadingMergeFile] = useState(false);
  const [mergeOutputName, setMergeOutputName] = useState('merged_document.pdf');
  const mergeFileInputRef = useRef<HTMLInputElement>(null);

  // Tabs 2-5: Single Document Operations State
  const [singleDoc, setSingleDoc] = useState<{
    fileId: string;
    originalName: string;
    size: number;
  } | null>(null);
  const [docPages, setDocPages] = useState<PdfPageMeta[]>([]);
  const [isLoadingDocInfo, setIsLoadingDocInfo] = useState(false);

  // Split options
  const [splitMode, setSplitMode] = useState<'range' | 'every_page'>('range');
  const [splitRange, setSplitRange] = useState('');
  const [splitOutputName, setSplitOutputName] = useState('split_pages.pdf');

  // Extract options
  const [selectedExtractPages, setSelectedExtractPages] = useState<number[]>([]);
  const [extractOutputName, setExtractOutputName] = useState('extracted_document.pdf');

  // Reorder options
  const [reorderedPages, setReorderedPages] = useState<number[]>([]);
  const [draggedPageIndex, setDraggedPageIndex] = useState<number | null>(null);
  const [reorderOutputName, setReorderOutputName] = useState('reordered_document.pdf');

  // Rotate options
  const [rotateScope, setRotateScope] = useState<'all' | 'selected'>('all');
  const [selectedRotatePages, setSelectedRotatePages] = useState<number[]>([]);
  const [rotateAngle, setRotateAngle] = useState<90 | 180 | 270>(90);
  const [rotateOutputName, setRotateOutputName] = useState('rotated_document.pdf');

  // Execution state
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<PdfOrganizeResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Synchronize initialTab if changed by parent router
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // When a single doc is uploaded, fetch its page metadata
  const handleSingleDocUploaded = async (meta: UploadedFileMetadata) => {
    setSingleDoc({
      fileId: meta.fileId,
      originalName: meta.originalName,
      size: meta.size
    });
    setResult(null);
    setErrorMessage(null);
    setIsLoadingDocInfo(true);

    try {
      const info = await getPdfInfoApi(meta.fileId);
      setDocPages(info.pages);
      // Initialize reorder order with 1..N
      const initialSeq = info.pages.map((p) => p.pageNumber);
      setReorderedPages(initialSeq);
      // Sensible defaults
      if (info.pages.length > 0) {
        setSplitRange(info.pages.length > 1 ? `1-${Math.min(3, info.pages.length)}` : '1');
        setSelectedExtractPages([1]);
        setSelectedRotatePages([1]);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to inspect PDF structure.');
    } finally {
      setIsLoadingDocInfo(false);
    }
  };

  const handleClearSingleDoc = () => {
    setSingleDoc(null);
    setDocPages([]);
    setSelectedExtractPages([]);
    setReorderedPages([]);
    setSelectedRotatePages([]);
    setResult(null);
    setErrorMessage(null);
  };

  // Merge: handle multiple file selection
  const handleMergeFilesAdded = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingMergeFile(true);
    setErrorMessage(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
          continue;
        }

        const uploadRes = await uploadFile(file);
        if (uploadRes.success && uploadRes.file) {
          let pageCount: number | undefined = undefined;
          try {
            const info = await getPdfInfoApi(uploadRes.file.fileId);
            pageCount = info.pageCount;
          } catch {
            // Non-fatal if pageCount couldn't be fetched immediately
          }

          setMergeFiles((prev) => [
            ...prev,
            {
              id: `${Date.now()}-${Math.random()}`,
              fileId: uploadRes.file!.fileId,
              originalName: uploadRes.file!.originalName,
              size: uploadRes.file!.size,
              pageCount
            }
          ]);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload PDF file for merging.');
    } finally {
      setIsUploadingMergeFile(false);
      if (mergeFileInputRef.current) {
        mergeFileInputRef.current.value = '';
      }
    }
  };

  const moveMergeFile = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === mergeFiles.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...mergeFiles];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    setMergeFiles(updated);
  };

  const removeMergeFile = (index: number) => {
    setMergeFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Reorder Drag & Drop handlers
  const handleDragStart = (index: number) => {
    setDraggedPageIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedPageIndex === null || draggedPageIndex === dropIndex) return;
    const updated = [...reorderedPages];
    const [removed] = updated.splice(draggedPageIndex, 1);
    updated.splice(dropIndex, 0, removed);
    setReorderedPages(updated);
    setDraggedPageIndex(null);
  };

  const movePageInOrder = (currentIndex: number, direction: 'left' | 'right') => {
    if (
      (direction === 'left' && currentIndex === 0) ||
      (direction === 'right' && currentIndex === reorderedPages.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    const updated = [...reorderedPages];
    const [moved] = updated.splice(currentIndex, 1);
    updated.splice(targetIdx, 0, moved);
    setReorderedPages(updated);
  };

  // Quick extract selections
  const toggleExtractPage = (pageNo: number) => {
    setSelectedExtractPages((prev) =>
      prev.includes(pageNo) ? prev.filter((p) => p !== pageNo) : [...prev, pageNo].sort((a, b) => a - b)
    );
  };

  const selectAllPages = () => {
    setSelectedExtractPages(docPages.map((p) => p.pageNumber));
  };

  const clearAllPages = () => {
    setSelectedExtractPages([]);
  };

  const selectOddPages = () => {
    setSelectedExtractPages(docPages.map((p) => p.pageNumber).filter((p) => p % 2 !== 0));
  };

  const selectEvenPages = () => {
    setSelectedExtractPages(docPages.map((p) => p.pageNumber).filter((p) => p % 2 === 0));
  };

  // Rotate page selection
  const toggleRotatePage = (pageNo: number) => {
    setSelectedRotatePages((prev) =>
      prev.includes(pageNo) ? prev.filter((p) => p !== pageNo) : [...prev, pageNo].sort((a, b) => a - b)
    );
  };

  // Execution Handlers
  const handleExecuteMerge = async () => {
    if (mergeFiles.length < 2) {
      setErrorMessage('Please add at least 2 PDF documents to merge.');
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const fileIds = mergeFiles.map((f) => f.fileId);
      const res = await mergePdfsApi(fileIds, mergeOutputName || 'merged_document.pdf');
      setResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to merge documents.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteSplit = async () => {
    if (!singleDoc) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await splitPdfApi(
        singleDoc.fileId,
        splitMode,
        splitMode === 'range' ? splitRange : undefined,
        splitOutputName || (splitMode === 'every_page' ? 'split_pages.zip' : 'split_document.pdf')
      );
      setResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to split document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteExtract = async () => {
    if (!singleDoc) return;
    if (selectedExtractPages.length === 0) {
      setErrorMessage('Please select at least one page to extract.');
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await extractPdfPagesApi(
        singleDoc.fileId,
        selectedExtractPages,
        extractOutputName || 'extracted_pages.pdf'
      );
      setResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to extract selected pages.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteReorder = async () => {
    if (!singleDoc) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await reorderPdfPagesApi(
        singleDoc.fileId,
        reorderedPages,
        reorderOutputName || 'reordered_document.pdf'
      );
      setResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save reordered document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteRotate = async () => {
    if (!singleDoc) return;
    const targetPages = rotateScope === 'selected' ? selectedRotatePages : undefined;
    if (rotateScope === 'selected' && (!targetPages || targetPages.length === 0)) {
      setErrorMessage('Please select at least one page to rotate.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await rotatePdfPagesApi(
        singleDoc.fileId,
        rotateAngle,
        targetPages,
        rotateOutputName || 'rotated_document.pdf'
      );
      setResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to rotate pages.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartOver = () => {
    setResult(null);
    setErrorMessage(null);
    if (activeTab === 'merge') {
      setMergeFiles([]);
    } else {
      handleClearSingleDoc();
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tab Bar with Accessible Roles */}
      <div
        role="tablist"
        aria-label="PDF Organize Modes"
        className="flex items-center gap-2 p-1.5 bg-[#F8F5EE] dark:bg-[#16120D] rounded-2xl overflow-x-auto border border-[#EDE7D9] dark:border-[#332B20] focus-visible:outline-none"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'merge'}
          aria-controls="panel-merge"
          id="tab-merge"
          onClick={() => {
            setActiveTab('merge');
            setResult(null);
            setErrorMessage(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#FFBF00] focus-visible:outline-none ${
            activeTab === 'merge'
              ? 'bg-[#FFFFFF] dark:bg-[#1E1913] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-sm font-semibold'
              : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:text-[#FFFDF7] hover:bg-[#FFFFFF] dark:bg-[#1E1913]/50 border border-transparent'
          }`}
        >
          <Layers className={`w-4 h-4 ${activeTab === 'merge' ? 'text-[#FF7900] dark:text-[#FFBF00]' : 'text-[#FF7900] dark:text-[#FFBF00]'}`} />
          <span>Merge PDFs</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'split'}
          aria-controls="panel-split"
          id="tab-split"
          onClick={() => {
            setActiveTab('split');
            setResult(null);
            setErrorMessage(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#FFBF00] focus-visible:outline-none ${
            activeTab === 'split'
              ? 'bg-[#FFFFFF] dark:bg-[#1E1913] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-sm font-semibold'
              : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:text-[#FFFDF7] hover:bg-[#FFFFFF] dark:bg-[#1E1913]/50 border border-transparent'
          }`}
        >
          <Scissors className={`w-4 h-4 ${activeTab === 'split' ? 'text-[#FF7900] dark:text-[#FFBF00]' : 'text-[#FF7900]'}`} />
          <span>Split PDF</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'extract'}
          aria-controls="panel-extract"
          id="tab-extract"
          onClick={() => {
            setActiveTab('extract');
            setResult(null);
            setErrorMessage(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#FFBF00] focus-visible:outline-none ${
            activeTab === 'extract'
              ? 'bg-[#FFFFFF] dark:bg-[#1E1913] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-sm font-semibold'
              : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:text-[#FFFDF7] hover:bg-[#FFFFFF] dark:bg-[#1E1913]/50 border border-transparent'
          }`}
        >
          <Files className={`w-4 h-4 ${activeTab === 'extract' ? 'text-[#FF7900] dark:text-[#FFBF00]' : 'text-[#10B981]'}`} />
          <span>Extract Pages</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'reorder'}
          aria-controls="panel-reorder"
          id="tab-reorder"
          onClick={() => {
            setActiveTab('reorder');
            setResult(null);
            setErrorMessage(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#FFBF00] focus-visible:outline-none ${
            activeTab === 'reorder'
              ? 'bg-[#FFFFFF] dark:bg-[#1E1913] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-sm font-semibold'
              : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:text-[#FFFDF7] hover:bg-[#FFFFFF] dark:bg-[#1E1913]/50 border border-transparent'
          }`}
        >
          <ArrowUpDown className={`w-4 h-4 ${activeTab === 'reorder' ? 'text-[#FF7900] dark:text-[#FFBF00]' : 'text-[#FF7900] dark:text-[#FFBF00]'}`} />
          <span>Reorder Pages</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'rotate'}
          aria-controls="panel-rotate"
          id="tab-rotate"
          onClick={() => {
            setActiveTab('rotate');
            setResult(null);
            setErrorMessage(null);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#FFBF00] focus-visible:outline-none ${
            activeTab === 'rotate'
              ? 'bg-[#FFFFFF] dark:bg-[#1E1913] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-sm font-semibold'
              : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:text-[#FFFDF7] hover:bg-[#FFFFFF] dark:bg-[#1E1913]/50 border border-transparent'
          }`}
        >
          <RotateCw className={`w-4 h-4 ${activeTab === 'rotate' ? 'text-[#FF7900] dark:text-[#FFBF00]' : 'text-[#FF7900]'}`} />
          <span>Rotate Pages</span>
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
            <h5 className="font-semibold text-red-100">Processing Error</h5>
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
                  <h3 className="text-lg font-bold font-display uppercase tracking-tight text-[#202020] dark:text-[#FFFDF7]">Operation Successful!</h3>
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
                Process Another
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-6">
            <div className="p-4 rounded-xl bg-[#F8F5EE] dark:bg-[#16120D] border border-[#EDE7D9] dark:border-[#332B20]">
              <div className="text-xs text-[#666666] dark:text-[#B8AF9F] font-medium">Output Document</div>
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
                <div className="text-xs text-[#666666] dark:text-[#B8AF9F] font-medium">Total Pages</div>
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
              <span>Download {result.isZip ? 'ZIP Archive' : 'PDF Document'}</span>
            </a>

            {!result.isZip && (
              <a
                href={getPreviewUrl(result.fileId)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-medium transition-all rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/30 text-[#202020] dark:text-[#FFFDF7] bg-[#F8F5EE] dark:bg-[#16120D] border border-[#EDE7D9] dark:border-[#332B20] hover:bg-[#EDE7D9] dark:hover:bg-[#2A231A] hover:border-[#FFBF00]/40 px-4 py-2.5 text-sm"
              >
                <Eye className="w-4 h-4 text-[#666666] dark:text-[#B8AF9F]" />
                <span>Preview Document</span>
              </a>
            )}
          </div>
        </Card>
      )}

      {/* Processing Spinner State */}
      {isProcessing && (
        <Card className="p-12 text-center border-dashed border-2 border-[#FFBF00]/30 bg-[#F8F5EE] dark:bg-[#16120D]">
          <Spinner size="lg" className="mx-auto text-[#FF7900] dark:text-[#FFBF00] mb-4" />
          <h4 className="text-base font-bold font-display uppercase tracking-tight text-[#202020] dark:text-[#FFFDF7]">Processing Your PDF...</h4>
          <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-1 max-w-sm mx-auto">
            Executing structural page operations with pdf-lib and running structural QPDF verification.
          </p>
        </Card>
      )}

      {/* Main Workspace Contents (Only visible when not showing final result) */}
      {!result && !isProcessing && (
        <div>
          {/* =========================================================================
              TAB 1: MERGE PDFS
              ========================================================================= */}
          {activeTab === 'merge' && (
            <div className="space-y-6">
              <Card className="p-6 sm:p-8">
                <div className="flex items-center justify-between pb-4 border-b border-[#EDE7D9] dark:border-[#332B20]">
                  <div>
                    <h3 className="text-base font-bold font-display uppercase tracking-tight text-[#202020] dark:text-[#FFFDF7]">Merge Multiple PDFs</h3>
                    <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-0.5">
                      Combine two or more PDF files into a single ordered document.
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={mergeFileInputRef}
                    onChange={handleMergeFilesAdded}
                    accept=".pdf,application/pdf"
                    multiple
                    className="hidden"
                    id="merge-file-input"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => mergeFileInputRef.current?.click()}
                    isLoading={isUploadingMergeFile}
                    leftIcon={<Plus className="w-4 h-4 text-[#FF7900] dark:text-[#FFBF00]" />}
                  >
                    Add PDF Files
                  </Button>
                </div>

                {mergeFiles.length === 0 ? (
                  <div
                    onClick={() => mergeFileInputRef.current?.click()}
                    className="my-6 p-10 border-2 border-dashed border-[#EDE7D9] dark:border-[#332B20] hover:border-[#FFBF00]/50 rounded-2xl text-center cursor-pointer transition bg-[#F8F5EE] dark:bg-[#16120D]/60 hover:bg-[#F8F5EE] dark:bg-[#16120D]"
                  >
                    <Layers className="w-10 h-10 text-[#FF7900] dark:text-[#FFBF00] mx-auto mb-3" />
                    <h4 className="text-sm font-semibold text-[#202020] dark:text-[#FFFDF7]">
                      Click to upload or select multiple PDFs
                    </h4>
                    <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-1">
                      Select 2 or more PDF documents from your computer to combine them.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 my-6">
                    <div className="text-xs font-semibold text-[#666666] dark:text-[#B8AF9F] uppercase tracking-wider px-1">
                      Document Order ({mergeFiles.length} {mergeFiles.length === 1 ? 'file' : 'files'})
                    </div>

                    <div className="space-y-2">
                      {mergeFiles.map((file, idx) => (
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
                              <div className="flex items-center gap-2 text-xs text-[#666666] dark:text-[#B8AF9F] mt-0.5">
                                <span>{formatBytes(file.size)}</span>
                                {file.pageCount !== undefined && (
                                  <>
                                    <span>•</span>
                                    <span>{file.pageCount} {file.pageCount === 1 ? 'page' : 'pages'}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => moveMergeFile(idx, 'up')}
                              disabled={idx === 0}
                              title="Move Up"
                              className="p-1.5 rounded-lg hover:bg-[#FFFFFF] dark:bg-[#1E1913] text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:text-[#FFFDF7] disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveMergeFile(idx, 'down')}
                              disabled={idx === mergeFiles.length - 1}
                              title="Move Down"
                              className="p-1.5 rounded-lg hover:bg-[#FFFFFF] dark:bg-[#1E1913] text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:text-[#FFFDF7] disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeMergeFile(idx)}
                              title="Remove File"
                              className="p-1.5 rounded-lg hover:bg-red-500/15 text-[#666666] dark:text-[#B8AF9F] hover:text-red-400 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => mergeFileInputRef.current?.click()}
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                        className="text-xs text-[#FF7900] dark:text-[#FFBF00] hover:text-[#FF7900]"
                      >
                        Add another PDF
                      </Button>
                    </div>
                  </div>
                )}

                {mergeFiles.length > 0 && (
                  <div className="pt-4 border-t border-[#EDE7D9] dark:border-[#332B20] space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#666666] dark:text-[#B8AF9F] mb-1.5">
                        Merged File Name
                      </label>
                      <Input
                        value={mergeOutputName}
                        onChange={(e) => setMergeOutputName(e.target.value)}
                        placeholder="merged_document.pdf"
                        className="max-w-md text-sm"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        variant="primary"
                        onClick={handleExecuteMerge}
                        disabled={mergeFiles.length < 2 || isProcessing}
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        Merge {mergeFiles.length} PDFs
                      </Button>
                      {mergeFiles.length < 2 && (
                        <span className="text-xs text-[#666666] dark:text-[#B8AF9F]">
                          Add at least 2 PDF files to proceed
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* =========================================================================
              TABS 2-5: SINGLE DOCUMENT UPLOAD ZONE
              ========================================================================= */}
          {activeTab !== 'merge' && !singleDoc && (
            <Card className="p-6 sm:p-8">
              <div className="text-center max-w-md mx-auto mb-6">
                <h3 className="text-base font-bold font-display uppercase tracking-tight text-[#202020] dark:text-[#FFFDF7]">
                  {activeTab === 'split' && 'Upload PDF to Split'}
                  {activeTab === 'extract' && 'Upload PDF to Extract Pages'}
                  {activeTab === 'reorder' && 'Upload PDF to Reorder Pages'}
                  {activeTab === 'rotate' && 'Upload PDF to Rotate Pages'}
                </h3>
                <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-1">
                  Upload a PDF file to view its page layout and perform instant modifications.
                </p>
              </div>

              <FileUpload
                accept=".pdf,application/pdf"
                maxSizeMB={50}
                onUploadSuccess={handleSingleDocUploaded}
                onUploadError={(err) => setErrorMessage(err)}
              />
            </Card>
          )}

          {/* Document active workspace */}
          {activeTab !== 'merge' && singleDoc && (
            <div className="space-y-6">
              {/* Document Banner */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F8F5EE] dark:bg-[#16120D] border border-[#EDE7D9] dark:border-[#332B20] shadow-sm">
                <div className="flex items-center gap-3 truncate">
                  <div className="w-10 h-10 rounded-xl bg-[#FFBF00]/10 text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/25 flex items-center justify-center shrink-0">
                    <Files className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-sm font-bold text-[#202020] dark:text-[#FFFDF7] truncate" title={singleDoc.originalName}>
                      {singleDoc.originalName}
                    </h4>
                    <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-0.5">
                      {formatBytes(singleDoc.size)} • {docPages.length} {docPages.length === 1 ? 'page' : 'pages'} total
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearSingleDoc}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Change File
                </Button>
              </div>

              {isLoadingDocInfo ? (
                <Card className="p-10 text-center">
                  <Spinner size="md" className="mx-auto text-[#FF7900] dark:text-[#FFBF00] mb-3" />
                  <p className="text-xs text-[#666666] dark:text-[#B8AF9F]">Reading document pages...</p>
                </Card>
              ) : (
                <>
                  {/* =========================================================================
                      TAB 2: SPLIT PDF
                      ========================================================================= */}
                  {activeTab === 'split' && (
                    <Card className="p-6 sm:p-8 space-y-6">
                      <div>
                        <h3 className="text-base font-bold font-display uppercase tracking-tight text-[#202020] dark:text-[#FFFDF7]">Choose Split Mode</h3>
                        <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-0.5">
                          Extract a range of pages into a new document or split every page into a ZIP archive.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div
                          onClick={() => setSplitMode('range')}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                            splitMode === 'range'
                              ? 'border-[#FFBF00] bg-[#FFBF00]/10 ring-1 ring-[#FFBF00]/30'
                              : 'border-[#EDE7D9] dark:border-[#332B20] bg-[#F8F5EE] dark:bg-[#16120D] hover:border-[#EDE7D9] dark:border-[#42382A]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-[#202020] dark:text-[#FFFDF7]">Page Range</span>
                            {splitMode === 'range' && (
                              <Badge variant="brand" size="sm">
                                Selected
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-1">
                            Extract specific pages or segments (e.g. 1-3, 5).
                          </p>
                        </div>

                        <div
                          onClick={() => setSplitMode('every_page')}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                            splitMode === 'every_page'
                              ? 'border-[#FFBF00] bg-[#FFBF00]/10 ring-1 ring-[#FFBF00]/30'
                              : 'border-[#EDE7D9] dark:border-[#332B20] bg-[#F8F5EE] dark:bg-[#16120D] hover:border-[#EDE7D9] dark:border-[#42382A]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-[#202020] dark:text-[#FFFDF7]">Split Every Page</span>
                            {splitMode === 'every_page' && (
                              <Badge variant="brand" size="sm">
                                Selected
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-1">
                            Break all {docPages.length} pages into single-page PDFs packaged in a ZIP.
                          </p>
                        </div>
                      </div>

                      {splitMode === 'range' && (
                        <div className="space-y-2 p-4 rounded-xl bg-[#F8F5EE] dark:bg-[#16120D] border border-[#EDE7D9] dark:border-[#332B20]">
                          <label className="block text-xs font-semibold text-[#666666] dark:text-[#B8AF9F]">
                            Page Ranges (Document has {docPages.length} {docPages.length === 1 ? 'page' : 'pages'})
                          </label>
                          <Input
                            value={splitRange}
                            onChange={(e) => setSplitRange(e.target.value)}
                            placeholder="e.g. 1-3, 5"
                            className="max-w-md text-sm"
                          />
                          <p className="text-[11px] text-[#666666] dark:text-[#B8AF9F]">
                            Use commas to separate single pages or ranges, e.g. <span className="font-mono text-[#FF7900] dark:text-[#FFBF00]">1-2, 4</span>.
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-[#666666] dark:text-[#B8AF9F] mb-1.5">
                          Output File Name
                        </label>
                        <Input
                          value={splitOutputName}
                          onChange={(e) => setSplitOutputName(e.target.value)}
                          placeholder={splitMode === 'every_page' ? 'split_pages.zip' : 'split_pages.pdf'}
                          className="max-w-md text-sm"
                        />
                      </div>

                      <div className="pt-2 border-t border-[#EDE7D9] dark:border-[#332B20]">
                        <Button
                          variant="primary"
                          onClick={handleExecuteSplit}
                          leftIcon={<Scissors className="w-4 h-4" />}
                        >
                          {splitMode === 'every_page'
                            ? `Split All ${docPages.length} Pages into ZIP`
                            : 'Split PDF Range'}
                        </Button>
                      </div>
                    </Card>
                  )}

                  {/* =========================================================================
                      TAB 3: EXTRACT PAGES
                      ========================================================================= */}
                  {activeTab === 'extract' && (
                    <Card className="p-6 sm:p-8 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EDE7D9] dark:border-[#332B20]">
                        <div>
                          <h3 className="text-base font-bold font-display uppercase tracking-tight text-[#202020] dark:text-[#FFFDF7]">Select Pages to Extract</h3>
                          <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-0.5">
                            {selectedExtractPages.length} of {docPages.length} pages selected.
                          </p>
                        </div>

                        {/* Quick Selection Buttons */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Button variant="outline" size="sm" onClick={selectAllPages} className="text-xs">
                            Select All
                          </Button>
                          <Button variant="outline" size="sm" onClick={selectOddPages} className="text-xs">
                            Odd Pages
                          </Button>
                          <Button variant="outline" size="sm" onClick={selectEvenPages} className="text-xs">
                            Even Pages
                          </Button>
                          <Button variant="ghost" size="sm" onClick={clearAllPages} className="text-xs text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:text-[#FFFDF7]">
                            Clear
                          </Button>
                        </div>
                      </div>

                      {/* Visual Page Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {docPages.map((page) => {
                          const isSelected = selectedExtractPages.includes(page.pageNumber);
                          return (
                            <div
                              key={page.pageNumber}
                              onClick={() => toggleExtractPage(page.pageNumber)}
                              className={`relative p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center select-none ${
                                isSelected
                                  ? 'border-[#FFBF00] bg-[#FFBF00]/15 shadow-sm ring-1 ring-[#FFBF00]/30'
                                  : 'border-[#EDE7D9] dark:border-[#332B20] bg-[#F8F5EE] dark:bg-[#16120D] hover:border-[#EDE7D9] dark:border-[#42382A] hover:bg-[#F8F5EE] dark:bg-[#16120D]/80'
                              }`}
                            >
                              {/* Selection Indicator Checkbox */}
                              <div
                                className={`absolute top-2 right-2 w-5 h-5 rounded-md flex items-center justify-center transition ${
                                  isSelected
                                    ? 'bg-[#FFBF00] text-[#202020]'
                                    : 'border border-[#EDE7D9] dark:border-[#42382A] bg-[#FFFFFF] dark:bg-[#1E1913] text-transparent'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </div>

                              {/* Stylized Miniature Page Preview */}
                              <div className="w-16 h-20 rounded border border-[#EDE7D9] dark:border-[#332B20] bg-[#FFFFFF] dark:bg-[#1E1913] shadow-xs my-2 flex flex-col justify-between p-2">
                                <div className="space-y-1">
                                  <div className="h-1 bg-[rgba(169,182,200,0.2)] rounded w-full" />
                                  <div className="h-1 bg-[rgba(169,182,200,0.2)] rounded w-4/5" />
                                  <div className="h-1 bg-[rgba(169,182,200,0.2)] rounded w-2/3" />
                                </div>
                                <span className="text-[10px] font-bold text-[#666666] dark:text-[#B8AF9F] self-center">
                                  {page.pageNumber}
                                </span>
                              </div>

                              <span className="text-xs font-semibold text-[#202020] dark:text-[#FFFDF7] mt-1">
                                Page {page.pageNumber}
                              </span>
                              <span className="text-[10px] text-[#666666] dark:text-[#B8AF9F]">
                                {Math.round(page.width)} × {Math.round(page.height)} pt
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-4 border-t border-[#EDE7D9] dark:border-[#332B20] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="max-w-xs w-full">
                          <label className="block text-xs font-semibold text-[#666666] dark:text-[#B8AF9F] mb-1">
                            Output File Name
                          </label>
                          <Input
                            value={extractOutputName}
                            onChange={(e) => setExtractOutputName(e.target.value)}
                            placeholder="extracted_pages.pdf"
                            className="text-sm"
                          />
                        </div>

                        <Button
                          variant="primary"
                          onClick={handleExecuteExtract}
                          disabled={selectedExtractPages.length === 0}
                          leftIcon={<Files className="w-4 h-4" />}
                        >
                          Extract {selectedExtractPages.length} Pages
                        </Button>
                      </div>
                    </Card>
                  )}

                  {/* =========================================================================
                      TAB 4: REORDER PAGES
                      ========================================================================= */}
                  {activeTab === 'reorder' && (
                    <Card className="p-6 sm:p-8 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EDE7D9] dark:border-[#332B20]">
                        <div>
                          <h3 className="text-base font-bold font-display uppercase tracking-tight text-[#202020] dark:text-[#FFFDF7]">Reorder Pages</h3>
                          <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-0.5">
                            Drag and drop or use arrows to rearrange the document page sequence.
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReorderedPages(docPages.map((p) => p.pageNumber))}
                          className="text-xs"
                        >
                          Reset Original Order
                        </Button>
                      </div>

                      {/* Visual Reorder Page Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {reorderedPages.map((pageNo, index) => {
                          return (
                            <div
                              key={`${pageNo}-${index}`}
                              draggable
                              onDragStart={() => handleDragStart(index)}
                              onDragOver={handleDragOver}
                              onDrop={() => handleDrop(index)}
                              className={`p-3 rounded-2xl border-2 bg-[#F8F5EE] dark:bg-[#16120D] transition cursor-grab active:cursor-grabbing flex flex-col items-center text-center shadow-xs ${
                                draggedPageIndex === index
                                  ? 'border-[#FFBF00] opacity-50 bg-[#FFBF00]/10'
                                  : 'border-[#EDE7D9] dark:border-[#332B20] hover:border-[#FFBF00]/50 hover:shadow-warm-card'
                              }`}
                            >
                              <div className="w-full flex items-center justify-between text-[#666666] dark:text-[#B8AF9F] mb-1">
                                <GripVertical className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold bg-[#FFFFFF] dark:bg-[#1E1913] px-1.5 py-0.5 rounded text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/25">
                                  #{index + 1}
                                </span>
                              </div>

                              {/* Stylized Miniature Page Preview */}
                              <div className="w-16 h-20 rounded border border-[#EDE7D9] dark:border-[#332B20] bg-[#FFFFFF] dark:bg-[#1E1913] shadow-xs my-2 flex flex-col justify-between p-2">
                                <div className="space-y-1">
                                  <div className="h-1 bg-[rgba(169,182,200,0.2)] rounded w-full" />
                                  <div className="h-1 bg-[rgba(169,182,200,0.2)] rounded w-4/5" />
                                  <div className="h-1 bg-[rgba(169,182,200,0.2)] rounded w-2/3" />
                                </div>
                                <span className="text-[10px] font-bold text-[#FF7900] dark:text-[#FFBF00] self-center">
                                  Page {pageNo}
                                </span>
                              </div>

                              <span className="text-xs font-semibold text-[#202020] dark:text-[#FFFDF7] mt-1">
                                Original: P{pageNo}
                              </span>

                              {/* Left / Right Quick Move Buttons */}
                              <div className="flex items-center gap-1 mt-2">
                                <button
                                  type="button"
                                  onClick={() => movePageInOrder(index, 'left')}
                                  disabled={index === 0}
                                  title="Shift Left"
                                  className="p-1 rounded hover:bg-[#FFFFFF] dark:bg-[#1E1913] text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:text-[#FFFDF7] disabled:opacity-30"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => movePageInOrder(index, 'right')}
                                  disabled={index === reorderedPages.length - 1}
                                  title="Shift Right"
                                  className="p-1 rounded hover:bg-[#FFFFFF] dark:bg-[#1E1913] text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:text-[#FFFDF7] disabled:opacity-30"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-4 border-t border-[#EDE7D9] dark:border-[#332B20] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="max-w-xs w-full">
                          <label className="block text-xs font-semibold text-[#666666] dark:text-[#B8AF9F] mb-1">
                            Output File Name
                          </label>
                          <Input
                            value={reorderOutputName}
                            onChange={(e) => setReorderOutputName(e.target.value)}
                            placeholder="reordered_document.pdf"
                            className="text-sm"
                          />
                        </div>

                        <Button
                          variant="primary"
                          onClick={handleExecuteReorder}
                          leftIcon={<ArrowUpDown className="w-4 h-4" />}
                        >
                          Save Reordered Document
                        </Button>
                      </div>
                    </Card>
                  )}

                  {/* =========================================================================
                      TAB 5: ROTATE PAGES
                      ========================================================================= */}
                  {activeTab === 'rotate' && (
                    <Card className="p-6 sm:p-8 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EDE7D9] dark:border-[#332B20]">
                        <div>
                          <h3 className="text-base font-bold font-display uppercase tracking-tight text-[#202020] dark:text-[#FFFDF7]">Rotate Pages</h3>
                          <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-0.5">
                            Rotate pages clockwise by 90°, 180°, or 270°.
                          </p>
                        </div>

                        {/* Angle Selectors */}
                        <div className="flex items-center gap-2">
                          {([90, 180, 270] as const).map((angle) => (
                            <button
                              key={angle}
                              type="button"
                              onClick={() => setRotateAngle(angle)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                                rotateAngle === angle
                                  ? 'bg-[#FFBF00] text-[#202020] shadow-xs'
                                  : 'bg-[#F8F5EE] dark:bg-[#16120D] text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:text-[#FFFDF7] hover:bg-[#F8F5EE] dark:bg-[#16120D]/80 border border-[#EDE7D9] dark:border-[#332B20]'
                              }`}
                            >
                              {angle === 90 && '+90° (Clockwise)'}
                              {angle === 180 && '180° (Half turn)'}
                              {angle === 270 && '270° (Counter)'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Scope Options */}
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:text-[#FFFDF7]">
                          <input
                            type="radio"
                            name="rotateScope"
                            checked={rotateScope === 'all'}
                            onChange={() => setRotateScope('all')}
                            className="text-[#FF7900] dark:text-[#FFBF00] focus:ring-[#FFBF00]"
                          />
                          <span>Rotate All {docPages.length} Pages</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:text-[#FFFDF7]">
                          <input
                            type="radio"
                            name="rotateScope"
                            checked={rotateScope === 'selected'}
                            onChange={() => setRotateScope('selected')}
                            className="text-[#FF7900] dark:text-[#FFBF00] focus:ring-[#FFBF00]"
                          />
                          <span>Rotate Specific Pages Only</span>
                        </label>
                      </div>

                      {/* Visual Page Grid with live CSS Rotation preview */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {docPages.map((page) => {
                          const isTarget =
                            rotateScope === 'all' || selectedRotatePages.includes(page.pageNumber);
                          const previewDegree = isTarget ? (page.rotation + rotateAngle) % 360 : page.rotation;

                          return (
                            <div
                              key={page.pageNumber}
                              onClick={() => {
                                if (rotateScope === 'selected') {
                                  toggleRotatePage(page.pageNumber);
                                }
                              }}
                              className={`p-3 rounded-2xl border-2 transition flex flex-col items-center text-center select-none ${
                                rotateScope === 'selected' ? 'cursor-pointer' : ''
                              } ${
                                isTarget
                                  ? 'border-[#FFBF00] bg-[#FFBF00]/10 shadow-xs'
                                  : 'border-[#EDE7D9] dark:border-[#332B20] bg-[#F8F5EE] dark:bg-[#16120D] opacity-60'
                              }`}
                            >
                              <div className="w-full flex items-center justify-between text-xs text-[#666666] dark:text-[#B8AF9F] mb-1">
                                <span className="font-semibold text-[#202020] dark:text-[#FFFDF7]">P{page.pageNumber}</span>
                                <span className="font-mono text-[10px] text-[#FF7900] dark:text-[#FFBF00] font-bold">
                                  {previewDegree}°
                                </span>
                              </div>

                              {/* Stylized Miniature Page Preview with dynamic CSS transform */}
                              <div
                                style={{
                                  transform: `rotate(${previewDegree}deg)`,
                                  transition: 'transform 0.3s ease'
                                }}
                                className="w-16 h-20 rounded border border-[#EDE7D9] dark:border-[#332B20] bg-[#FFFFFF] dark:bg-[#1E1913] shadow-xs my-3 flex flex-col justify-between p-2"
                              >
                                <div className="space-y-1">
                                  <div className="h-1 bg-[rgba(169,182,200,0.2)] rounded w-full" />
                                  <div className="h-1 bg-[rgba(169,182,200,0.2)] rounded w-4/5" />
                                </div>
                                <span className="text-[10px] font-bold text-[#666666] dark:text-[#B8AF9F] self-center">
                                  {page.pageNumber}
                                </span>
                              </div>

                              <span className="text-[11px] text-[#666666] dark:text-[#B8AF9F] mt-1">
                                {isTarget ? `Rotating +${rotateAngle}°` : 'Unchanged'}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-4 border-t border-[#EDE7D9] dark:border-[#332B20] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="max-w-xs w-full">
                          <label className="block text-xs font-semibold text-[#666666] dark:text-[#B8AF9F] mb-1">
                            Output File Name
                          </label>
                          <Input
                            value={rotateOutputName}
                            onChange={(e) => setRotateOutputName(e.target.value)}
                            placeholder="rotated_document.pdf"
                            className="text-sm"
                          />
                        </div>

                        <Button
                          variant="primary"
                          onClick={handleExecuteRotate}
                          disabled={rotateScope === 'selected' && selectedRotatePages.length === 0}
                          leftIcon={<RotateCw className="w-4 h-4" />}
                        >
                          Rotate {rotateScope === 'all' ? `All ${docPages.length}` : selectedRotatePages.length} Pages by {rotateAngle}°
                        </Button>
                      </div>
                    </Card>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

