import React, { useState, useEffect } from 'react';
import {
  FileText,
  Presentation,
  Download,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Sliders,
  TrendingDown,
  Info
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Input } from './ui/Input';
import { FileUpload } from './ui/FileUpload';
import { Spinner } from './ui/Loading';
import {
  compressDocumentApi,
  DocCompressResponse,
  UploadedFileMetadata,
  getDownloadUrl
} from '../services/api';
import { formatBytes } from '../utils';

export type DocCompressType = 'word' | 'powerpoint';

interface DocumentCompressWorkspaceProps {
  initialType?: DocCompressType;
}

export const DocumentCompressWorkspace: React.FC<DocumentCompressWorkspaceProps> = ({
  initialType = 'word'
}) => {
  const [activeType, setActiveType] = useState<DocCompressType>(initialType);

  const [uploadedDoc, setUploadedDoc] = useState<UploadedFileMetadata | null>(null);
  const [imageQuality, setImageQuality] = useState<number>(75);
  const [maxDimension, setMaxDimension] = useState<number>(1920);
  const [modernizeLegacy, setModernizeLegacy] = useState<boolean>(true);
  const [outputName, setOutputName] = useState<string>('');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<DocCompressResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setActiveType(initialType);
  }, [initialType]);

  const handleDocUploaded = (meta: UploadedFileMetadata) => {
    setUploadedDoc(meta);
    setResult(null);
    setErrorMessage(null);
    const parsed = meta.originalName.replace(/\.[^/.]+$/, '');
    const ext = meta.extension.toLowerCase();
    const finalExt = ext === 'doc' || ext === 'docx' ? 'docx' : 'pptx';
    setOutputName(`${parsed}_compressed.${finalExt}`);
  };

  const handleExecuteCompress = async () => {
    if (!uploadedDoc) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await compressDocumentApi({
        fileId: uploadedDoc.fileId,
        originalName: uploadedDoc.originalName,
        imageQuality,
        maxImageDimension: maxDimension,
        modernizeLegacy,
        outputName: outputName || undefined
      });
      setResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to compress document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartOver = () => {
    setUploadedDoc(null);
    setResult(null);
    setErrorMessage(null);
  };

  const isWord = activeType === 'word';
  const acceptedTypes = isWord
    ? '.docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword'
    : '.pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint';

  return (
    <div className="space-y-6">
      {/* Category Tab Switcher with Accessible Roles */}
      <div
        role="tablist"
        aria-label="Document Compressor Format Modes"
        className="flex items-center gap-2 p-1.5 bg-[#F8F5EE] dark:bg-[#16120D] rounded-2xl overflow-x-auto border border-[#EDE7D9] dark:border-[#332B20] focus-visible:outline-none"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeType === 'word'}
          aria-controls="panel-word"
          id="tab-word"
          onClick={() => {
            setActiveType('word');
            handleStartOver();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#FFBF00] focus-visible:outline-none ${
            activeType === 'word'
              ? 'bg-[#FFFFFF] dark:bg-[#2A231A] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-xs font-semibold'
              : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] hover:bg-[#FFFFFF]/50 dark:hover:bg-[#2A231A]/50 border border-transparent'
          }`}
        >
          <FileText className={`w-4 h-4 ${activeType === 'word' ? 'text-[#FF7900] dark:text-[#FFBF00]' : 'text-[#FF7900]'}`} />
          <span>Word Documents (DOC / DOCX)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeType === 'powerpoint'}
          aria-controls="panel-powerpoint"
          id="tab-powerpoint"
          onClick={() => {
            setActiveType('powerpoint');
            handleStartOver();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#FFBF00] focus-visible:outline-none ${
            activeType === 'powerpoint'
              ? 'bg-[#FFFFFF] dark:bg-[#2A231A] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-xs font-semibold'
              : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] hover:bg-[#FFFFFF]/50 dark:hover:bg-[#2A231A]/50 border border-transparent'
          }`}
        >
          <Presentation className={`w-4 h-4 ${activeType === 'powerpoint' ? 'text-[#FF7900] dark:text-[#FFBF00]' : 'text-[#FFBF00]'}`} />
          <span>PowerPoint Presentations (PPT / PPTX)</span>
        </button>
      </div>

      {/* Error Alert with Screen-Reader Announcement */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-sm"
        >
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h5 className="font-semibold text-red-700 dark:text-red-300">Compression Error</h5>
            <p className="mt-0.5 text-xs text-red-600/90 dark:text-red-400/90">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-600 dark:text-red-400 hover:underline font-bold ml-2 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Result Display Card */}
      {result && (
        <Card className="p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#1E1913] border border-emerald-500/30 shadow-warm-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EDE7D9] dark:border-[#332B20]">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  result.isOptimized
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-[#FFBF00]/15 border border-[#FFBF00]/30 text-[#FF7900] dark:text-[#FFBF00]'
                }`}
              >
                {result.isOptimized ? (
                  <TrendingDown className="w-6 h-6" />
                ) : (
                  <CheckCircle2 className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold font-display tracking-tight text-[#202020] dark:text-[#FFFDF7]">
                    {result.isOptimized ? 'Document Compressed!' : 'Analysis Complete'}
                  </h3>
                  <Badge variant={result.isOptimized ? 'emerald' : 'neutral'} size="sm">
                    {result.isOptimized ? `Saved ${result.reductionPercent}%` : 'Already Optimized'}
                  </Badge>
                </div>
                <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-0.5">{result.message}</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleStartOver}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Compress Another
            </Button>
          </div>

          {/* Note Banner */}
          {result.note && (
            <div className="my-4 flex items-start gap-2.5 p-3.5 rounded-xl bg-[#F8F5EE] dark:bg-[#16120D] border border-[#EDE7D9] dark:border-[#332B20] text-[#666666] dark:text-[#B8AF9F] text-xs leading-relaxed">
              <Info className="w-4 h-4 text-[#FF7900] dark:text-[#FFBF00] shrink-0 mt-0.5" />
              <div>{result.note}</div>
            </div>
          )}

          {/* Metrics Comparison Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
            <div className="p-4 rounded-xl bg-[#F8F5EE] dark:bg-[#16120D] border border-[#EDE7D9] dark:border-[#332B20]">
              <div className="text-xs text-[#666666] dark:text-[#B8AF9F] font-medium">Original Size</div>
              <div className="text-sm font-semibold text-[#202020] dark:text-[#FFFDF7] mt-1">
                {formatBytes(result.originalSize)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F5EE] dark:bg-[#16120D] border border-[#EDE7D9] dark:border-[#332B20]">
              <div className="text-xs text-[#666666] dark:text-[#B8AF9F] font-medium">Compressed Size</div>
              <div className="text-sm font-bold text-[#FF7900] dark:text-[#FFBF00] mt-1">
                {formatBytes(result.resultSize)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
              <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Reduction</div>
              <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                {result.reductionPercent > 0 ? `-${result.reductionPercent}%` : '0%'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F5EE] dark:bg-[#16120D] border border-[#EDE7D9] dark:border-[#332B20]">
              <div className="text-xs text-[#666666] dark:text-[#B8AF9F] font-medium">Media Optimized</div>
              <div className="text-sm font-semibold text-[#202020] dark:text-[#FFFDF7] mt-1">
                {result.imagesOptimizedCount} {result.imagesOptimizedCount === 1 ? 'Image' : 'Images'}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <a
              href={getDownloadUrl(result.fileId, result.outputFilename)}
              download={result.outputFilename}
              className="inline-flex items-center justify-center gap-2 font-medium transition-all rounded-xl shadow-warm-sm focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/40 text-[#202020] bg-[#FFBF00] hover:bg-[#FF7900] hover:text-white px-5 py-2.5 text-sm font-semibold"
            >
              <Download className="w-4 h-4" />
              <span>Download {result.outputFilename}</span>
            </a>
          </div>
        </Card>
      )}

      {/* Processing State */}
      {isProcessing && (
        <Card className="p-12 text-center border-dashed border-2 border-[#FFBF00]/40 bg-[#FFFFFF] dark:bg-[#1E1913]">
          <Spinner size="lg" className="mx-auto text-[#FFBF00] mb-4" />
          <h4 className="text-base font-bold font-display tracking-tight text-[#202020] dark:text-[#FFFDF7]">Optimizing Document Media & Streams...</h4>
          <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-1 max-w-sm mx-auto">
            Extracting package structures, recompressing embedded graphics with sharp, and re-deflating streams.
          </p>
        </Card>
      )}

      {/* Main Workspace Body */}
      {!result && !isProcessing && (
        <div className="space-y-6">
          {!uploadedDoc ? (
            <Card className="p-6 sm:p-8">
              <div className="text-center max-w-md mx-auto mb-6">
                <h3 className="text-base font-bold font-display tracking-tight text-[#202020] dark:text-[#FFFDF7]">
                  {isWord ? 'Upload Word Document (DOC / DOCX)' : 'Upload PowerPoint (PPT / PPTX)'}
                </h3>
                <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-1">
                  Compress embedded photos, screenshots, and internal OpenXML structures.
                </p>
              </div>

              <FileUpload
                accept={acceptedTypes}
                maxSizeMB={50}
                onUploadSuccess={handleDocUploaded}
                onUploadError={(err) => setErrorMessage(err)}
              />
            </Card>
          ) : (
            <Card className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#EDE7D9] dark:border-[#332B20]">
                <div className="flex items-center gap-3 truncate">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isWord ? 'bg-[#FF7900]/10 text-[#FF7900] border border-[#FF7900]/25' : 'bg-[#FFBF00]/10 text-[#FFBF00] border border-[#FFBF00]/25'
                    }`}
                  >
                    {isWord ? <FileText className="w-5 h-5" /> : <Presentation className="w-5 h-5" />}
                  </div>
                  <div className="truncate">
                    <h4 className="text-sm font-bold text-[#202020] dark:text-[#FFFDF7] truncate" title={uploadedDoc.originalName}>
                      {uploadedDoc.originalName}
                    </h4>
                    <p className="text-xs text-[#666666] dark:text-[#B8AF9F] mt-0.5">{formatBytes(uploadedDoc.size)}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartOver}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Change File
                </Button>
              </div>

              {/* Compression Controls */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#FF7900] dark:text-[#FFBF00]" />
                  <h4 className="text-xs font-bold text-[#202020] dark:text-[#FFFDF7] uppercase tracking-wider">
                    Optimization Settings
                  </h4>
                </div>

                {/* Quality Presets */}
                <div>
                  <label className="block text-xs font-semibold text-[#666666] dark:text-[#B8AF9F] mb-2">
                    Embedded Image Quality
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { label: 'Recommended (75%)', val: 75 },
                      { label: 'High Fidelity (85%)', val: 85 },
                      { label: 'Maximum Reduction (60%)', val: 60 }
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setImageQuality(item.val)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          imageQuality === item.val
                            ? 'bg-[#FFBF00] text-[#202020] shadow-xs'
                            : 'bg-[#F8F5EE] dark:bg-[#16120D] text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] border border-[#EDE7D9] dark:border-[#332B20]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resolution Bounds */}
                <div>
                  <label className="block text-xs font-semibold text-[#666666] dark:text-[#B8AF9F] mb-2">
                    Max Image Resolution
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { label: 'Full HD (1920px max)', val: 1920 },
                      { label: 'Standard HD (1280px max)', val: 1280 },
                      { label: 'Preserve Dimensions', val: 9999 }
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setMaxDimension(item.val)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          maxDimension === item.val
                            ? 'bg-[#FFBF00] text-[#202020] shadow-xs'
                            : 'bg-[#F8F5EE] dark:bg-[#16120D] text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] border border-[#EDE7D9] dark:border-[#332B20]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Legacy Modernization Option */}
                {uploadedDoc.extension.toLowerCase() === 'doc' ||
                uploadedDoc.extension.toLowerCase() === 'ppt' ? (
                  <div className="p-3.5 rounded-xl bg-[#F8F5EE] dark:bg-[#16120D] border border-[#EDE7D9] dark:border-[#332B20]">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={modernizeLegacy}
                        onChange={(e) => setModernizeLegacy(e.target.checked)}
                        className="rounded text-[#FFBF00] focus:ring-[#FFBF00] mt-0.5"
                      />
                      <div className="text-xs">
                        <span className="font-semibold text-[#202020] dark:text-[#FFFDF7]">
                          Modernize to {isWord ? '.DOCX' : '.PPTX'} format (Recommended)
                        </span>
                        <p className="text-[#666666] dark:text-[#B8AF9F] mt-0.5">
                          Converts legacy uncompressed binary format to modern OpenXML, yielding substantially smaller file sizes.
                        </p>
                      </div>
                    </label>
                  </div>
                ) : null}

                {/* Output Filename */}
                <div className="max-w-md">
                  <label className="block text-xs font-semibold text-[#666666] dark:text-[#B8AF9F] mb-1">
                    Output Filename
                  </label>
                  <Input
                    value={outputName}
                    onChange={(e) => setOutputName(e.target.value)}
                    placeholder="compressed_document.docx"
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#EDE7D9] dark:border-[#332B20]">
                <Button
                  variant="primary"
                  onClick={handleExecuteCompress}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Compress {isWord ? 'Word Document' : 'PowerPoint'}
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

