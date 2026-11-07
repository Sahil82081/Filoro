import React, { useState } from 'react';
import {
  Crop,
  Stamp,
  Hash,
  Lock,
  PenTool,
  AlertTriangle,
  Download,
  Eye,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  FileText,
  FileCheck,
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { FileUpload } from './ui/FileUpload';
import {
  uploadFile,
  cropPdfApi,
  watermarkPdfApi,
  pageNumbersPdfApi,
  protectPdfApi,
  signPdfApi,
  PdfModifyResponse,
} from '../services/api';

export type PdfModifyTab = 'crop' | 'watermark' | 'page-numbers' | 'protect' | 'sign';

interface PdfModifyWorkspaceProps {
  initialTab?: PdfModifyTab;
}

export const PdfModifyWorkspace: React.FC<PdfModifyWorkspaceProps> = ({
  initialTab = 'crop',
}) => {
  const [activeTab, setActiveTab] = useState<PdfModifyTab>(initialTab);

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);

  // Common UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<PdfModifyResponse | null>(null);

  // 1. CROP STATE
  const [cropUnit, setCropUnit] = useState<'points' | 'percent'>('points');
  const [cropTop, setCropTop] = useState<number>(36);
  const [cropBottom, setCropBottom] = useState<number>(36);
  const [cropLeft, setCropLeft] = useState<number>(36);
  const [cropRight, setCropRight] = useState<number>(36);

  // 2. WATERMARK STATE
  const [wmText, setWmText] = useState<string>('CONFIDENTIAL');
  const [wmPosition, setWmPosition] = useState<'center-diagonal' | 'center-horizontal' | 'top' | 'bottom'>('center-diagonal');
  const [wmOpacity, setWmOpacity] = useState<number>(0.25);
  const [wmColor, setWmColor] = useState<'gray' | 'red' | 'blue' | 'black'>('gray');
  const [wmFontSize, setWmFontSize] = useState<number>(44);

  // 3. PAGE NUMBERS STATE
  const [numPosition, setNumPosition] = useState<'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right'>('bottom-center');
  const [numFormat, setNumFormat] = useState<string>('Page {page} of {total}');
  const [numSkipFirst, setNumSkipFirst] = useState<boolean>(false);

  // 4. PASSWORD PROTECT STATE
  const [userPassword, setUserPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // 5. SIGNING STATE
  const [sigType, setSigType] = useState<'text' | 'image'>('text');
  const [signerName, setSignerName] = useState<string>('Authorized Signatory');
  const [sigPosition, setSigPosition] = useState<'bottom-right' | 'bottom-left' | 'center' | 'top-right'>('bottom-right');
  const [sigPage, setSigPage] = useState<'last' | 'first' | 'all'>('last');
  const [sigReason, setSignReason] = useState<string>('Reviewed & Verified');
  const [sigImageFile, setSigImageFile] = useState<File | null>(null);
  const [sigImageId, setSigImageId] = useState<string | null>(null);
  const [sigImagePreview, setSigImagePreview] = useState<string | null>(null);

  const resetState = () => {
    setSelectedFile(null);
    setFileId(null);
    setLoading(false);
    setErrorMessage(null);
    setResult(null);
    setUserPassword('');
    setConfirmPassword('');
    setSigImageFile(null);
    setSigImageId(null);
    if (sigImagePreview) URL.revokeObjectURL(sigImagePreview);
    setSigImagePreview(null);
  };

  const handleTabChange = (tab: PdfModifyTab) => {
    setActiveTab(tab);
    resetState();
  };

  // Upload handler for primary PDF
  const handlePdfUpload = async (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setFileId(null);
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await uploadFile(file);
      if (res.success && res.file) {
        setFileId(res.file.fileId);
      } else {
        throw new Error(res.error || 'Failed to upload PDF.');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  // Upload handler for signature image
  const handleSignatureImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSigImageFile(file);
    setSigImagePreview(URL.createObjectURL(file));

    try {
      const res = await uploadFile(file);
      if (res.success && res.file) {
        setSigImageId(res.file.fileId);
      } else {
        throw new Error('Signature image upload failed.');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to upload signature asset.');
    }
  };

  // Apply Quick Crop Presets
  const applyCropPreset = (preset: 'trim5' | 'trim10' | 'standard' | 'reset') => {
    if (preset === 'reset') {
      setCropUnit('points');
      setCropTop(0);
      setCropBottom(0);
      setCropLeft(0);
      setCropRight(0);
    } else if (preset === 'trim5') {
      setCropUnit('percent');
      setCropTop(5);
      setCropBottom(5);
      setCropLeft(5);
      setCropRight(5);
    } else if (preset === 'trim10') {
      setCropUnit('percent');
      setCropTop(10);
      setCropBottom(10);
      setCropLeft(10);
      setCropRight(10);
    } else {
      setCropUnit('points');
      setCropTop(36);
      setCropBottom(36);
      setCropLeft(36);
      setCropRight(36);
    }
  };

  // Process Operation Handler
  const handleProcess = async () => {
    if (!fileId || !selectedFile) return;

    setErrorMessage(null);
    setLoading(true);

    try {
      let res: PdfModifyResponse;

      if (activeTab === 'crop') {
        res = await cropPdfApi({
          fileId,
          originalName: selectedFile.name,
          top: cropTop,
          bottom: cropBottom,
          left: cropLeft,
          right: cropRight,
          unit: cropUnit,
        });
      } else if (activeTab === 'watermark') {
        if (!wmText.trim()) throw new Error('Please enter watermark text.');
        res = await watermarkPdfApi({
          fileId,
          originalName: selectedFile.name,
          text: wmText.trim(),
          position: wmPosition,
          opacity: wmOpacity,
          color: wmColor,
          fontSize: wmFontSize,
        });
      } else if (activeTab === 'page-numbers') {
        res = await pageNumbersPdfApi({
          fileId,
          originalName: selectedFile.name,
          position: numPosition,
          format: numFormat,
          skipFirstPage: numSkipFirst,
        });
      } else if (activeTab === 'protect') {
        if (!userPassword) throw new Error('Please enter a password.');
        if (userPassword !== confirmPassword) throw new Error('Passwords do not match.');
        res = await protectPdfApi({
          fileId,
          originalName: selectedFile.name,
          userPassword,
        });
      } else {
        // Sign
        if (sigType === 'image' && !sigImageId) {
          throw new Error('Please upload a signature photo or image asset.');
        }
        res = await signPdfApi({
          fileId,
          originalName: selectedFile.name,
          signatureType: sigType,
          signerName: signerName.trim() || 'Authorized Signatory',
          signatureFileId: sigImageId || undefined,
          position: sigPosition,
          page: sigPage,
          signReason: sigReason.trim() || undefined,
        });
      }

      setResult(res);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Tab Switcher with Accessible Roles */}
      <div
        role="tablist"
        aria-label="PDF Tools Modes"
        className="flex flex-wrap items-center justify-center p-1.5 bg-[#F8F5EE] dark:bg-[#16120D] rounded-2xl border border-[#EDE7D9] dark:border-[#332B20]"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'crop'}
          aria-controls="panel-crop"
          id="tab-crop"
          onClick={() => handleTabChange('crop')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#FFBF00] focus-visible:outline-none ${
            activeTab === 'crop'
              ? 'bg-[#FFFFFF] dark:bg-[#2A231A] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-xs font-semibold'
              : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] hover:bg-[#FFFFFF]/50 dark:hover:bg-[#2A231A]/50 border border-transparent'
          }`}
        >
          <Crop className={`w-4 h-4 ${activeTab === 'crop' ? 'text-[#FF7900] dark:text-[#FFBF00]' : 'text-[#FFBF00]'}`} />
          <span>Crop PDF</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'watermark'}
          aria-controls="panel-watermark"
          id="tab-watermark"
          onClick={() => handleTabChange('watermark')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#FFBF00] focus-visible:outline-none ${
            activeTab === 'watermark'
              ? 'bg-[#FFFFFF] dark:bg-[#2A231A] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-xs font-semibold'
              : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] hover:bg-[#FFFFFF]/50 dark:hover:bg-[#2A231A]/50 border border-transparent'
          }`}
        >
          <Stamp className={`w-4 h-4 ${activeTab === 'watermark' ? 'text-[#FF7900] dark:text-[#FFBF00]' : 'text-[#FF7900]'}`} />
          <span>Watermark</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'page-numbers'}
          aria-controls="panel-page-numbers"
          id="tab-page-numbers"
          onClick={() => handleTabChange('page-numbers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#FFBF00] focus-visible:outline-none ${
            activeTab === 'page-numbers'
              ? 'bg-[#FFFFFF] dark:bg-[#2A231A] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-xs font-semibold'
              : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] hover:bg-[#FFFFFF]/50 dark:hover:bg-[#2A231A]/50 border border-transparent'
          }`}
        >
          <Hash className={`w-4 h-4 ${activeTab === 'page-numbers' ? 'text-[#FF7900] dark:text-[#FFBF00]' : 'text-[#FFBF00]'}`} />
          <span>Page Numbers</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'protect'}
          aria-controls="panel-protect"
          id="tab-protect"
          onClick={() => handleTabChange('protect')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#FFBF00] focus-visible:outline-none ${
            activeTab === 'protect'
              ? 'bg-[#FFFFFF] dark:bg-[#2A231A] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-xs font-semibold'
              : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] hover:bg-[#FFFFFF]/50 dark:hover:bg-[#2A231A]/50 border border-transparent'
          }`}
        >
          <Lock className={`w-4 h-4 ${activeTab === 'protect' ? 'text-[#FF7900] dark:text-[#FFBF00]' : 'text-[#FF7900]'}`} />
          <span>Protect (Password)</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'sign'}
          aria-controls="panel-sign"
          id="tab-sign"
          onClick={() => handleTabChange('sign')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#FFBF00] focus-visible:outline-none ${
            activeTab === 'sign'
              ? 'bg-[#FFFFFF] dark:bg-[#2A231A] text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/40 shadow-xs font-semibold'
              : 'text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] hover:bg-[#FFFFFF]/50 dark:hover:bg-[#2A231A]/50 border border-transparent'
          }`}
        >
          <PenTool className={`w-4 h-4 ${activeTab === 'sign' ? 'text-[#FF7900] dark:text-[#FFBF00]' : 'text-[#FF7900]'}`} />
          <span>Sign Document</span>
        </button>
      </div>

      {/* Main Workspace Card */}
      <Card className="p-6 md:p-8 space-y-6">
        {/* Step 1: Upload */}
        {!result && (
          <>
            <FileUpload
              accept=".pdf"
              maxSizeMB={50}
              onFileSelect={handlePdfUpload}
            />

            {selectedFile && fileId && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
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

                <Badge variant="emerald">Uploaded & Ready</Badge>
              </div>
            )}
          </>
        )}

        {/* Step 2: Configuration Controls */}
        {selectedFile && fileId && !result && (
          <div className="space-y-6 border-t border-slate-200 dark:border-slate-700/80 pt-6">
            {/* 1. CROP CONTROLS */}
            {activeTab === 'crop' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <Crop className="w-4 h-4 text-indigo-600" />
                    <span>Margin Crop Settings</span>
                  </h4>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => applyCropPreset('trim5')}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                    >
                      Trim 5%
                    </button>
                    <button
                      onClick={() => applyCropPreset('trim10')}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                    >
                      Trim 10%
                    </button>
                    <button
                      onClick={() => applyCropPreset('standard')}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                    >
                      36 pt (0.5 in)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 font-medium block mb-1">Top Margin ({cropUnit})</label>
                    <input
                      type="number"
                      value={cropTop}
                      min={0}
                      onChange={(e) => setCropTop(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-medium block mb-1">Bottom Margin ({cropUnit})</label>
                    <input
                      type="number"
                      value={cropBottom}
                      min={0}
                      onChange={(e) => setCropBottom(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-medium block mb-1">Left Margin ({cropUnit})</label>
                    <input
                      type="number"
                      value={cropLeft}
                      min={0}
                      onChange={(e) => setCropLeft(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-medium block mb-1">Right Margin ({cropUnit})</label>
                    <input
                      type="number"
                      value={cropRight}
                      min={0}
                      onChange={(e) => setCropRight(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. WATERMARK CONTROLS */}
            {activeTab === 'watermark' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">Watermark Text</label>
                  <input
                    type="text"
                    value={wmText}
                    onChange={(e) => setWmText(e.target.value)}
                    placeholder="e.g. CONFIDENTIAL, DRAFT, DO NOT COPY"
                    className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 font-medium block mb-1">Position</label>
                    <select
                      value={wmPosition}
                      onChange={(e: any) => setWmPosition(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg"
                    >
                      <option value="center-diagonal">Center (Diagonal 45°)</option>
                      <option value="center-horizontal">Center (Horizontal)</option>
                      <option value="top">Top Header</option>
                      <option value="bottom">Bottom Footer</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 font-medium block mb-1">Font Size</label>
                    <select
                      value={wmFontSize}
                      onChange={(e) => setWmFontSize(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg"
                    >
                      <option value={28}>28 pt (Compact)</option>
                      <option value={36}>36 pt (Medium)</option>
                      <option value={44}>44 pt (Large)</option>
                      <option value={56}>56 pt (Prominent)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 font-medium block mb-1">
                      Opacity: {Math.round(wmOpacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min={0.08}
                      max={0.8}
                      step={0.05}
                      value={wmOpacity}
                      onChange={(e) => setWmOpacity(parseFloat(e.target.value))}
                      className="w-full mt-2"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 font-medium block mb-1">Color</label>
                    <div className="flex items-center gap-2 mt-1">
                      {(['gray', 'red', 'blue', 'black'] as const).map((c) => (
                        <button
                          key={c}
                          onClick={() => setWmColor(c)}
                          className={`w-7 h-7 rounded-full border-2 capitalize transition-all ${
                            wmColor === c ? 'border-indigo-600 scale-110 shadow-sm' : 'border-transparent'
                          } ${
                            c === 'gray'
                              ? 'bg-slate-400'
                              : c === 'red'
                              ? 'bg-rose-500'
                              : c === 'blue'
                              ? 'bg-blue-500'
                              : 'bg-black'
                          }`}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. PAGE NUMBERS CONTROLS */}
            {activeTab === 'page-numbers' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 font-medium block mb-1">Placement Position</label>
                    <select
                      value={numPosition}
                      onChange={(e: any) => setNumPosition(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg"
                    >
                      <option value="bottom-center">Bottom Center (Standard)</option>
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="top-center">Top Center</option>
                      <option value="top-right">Top Right</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 font-medium block mb-1">Numbering Format</label>
                    <select
                      value={numFormat}
                      onChange={(e) => setNumFormat(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg"
                    >
                      <option value="Page {page} of {total}">Page 1 of 10 (Formal)</option>
                      <option value="Page {page}">Page 1</option>
                      <option value="{page} / {total}">1 / 10</option>
                      <option value="{page}">1 (Simple)</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300 pt-1">
                  <input
                    type="checkbox"
                    checked={numSkipFirst}
                    onChange={(e) => setNumSkipFirst(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Skip first page (Cover / Title page)</span>
                </label>
              </div>
            )}

            {/* 4. PASSWORD PROTECT CONTROLS */}
            {activeTab === 'protect' && (
              <div className="space-y-4">
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-start gap-3 text-xs text-amber-800 dark:text-amber-200">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Zero-Knowledge Security Policy</p>
                    <p className="mt-0.5 text-amber-700 dark:text-amber-300">
                      Your password is used exclusively to execute standard 256-bit AES encryption on our server. It is never logged, stored in databases, or retained anywhere.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 font-medium block mb-1">Set Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        placeholder="Enter secure password"
                        className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 font-medium block mb-1">Confirm Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. SIGNING CONTROLS */}
            {activeTab === 'sign' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-medium">Signature Type:</span>
                  <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800">
                    <button
                      onClick={() => setSigType('text')}
                      className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                        sigType === 'text'
                          ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Formal Script / Name
                    </button>
                    <button
                      onClick={() => setSigType('image')}
                      className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                        sigType === 'image'
                          ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Upload Signature Photo
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 font-medium block mb-1">Signer Full Name</label>
                    <input
                      type="text"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      placeholder="e.g. Sahil Kumar"
                      className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 font-medium block mb-1">Target Page</label>
                    <select
                      value={sigPage}
                      onChange={(e: any) => setSigPage(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl"
                    >
                      <option value="last">Last Page (Standard Signature Line)</option>
                      <option value="first">First Page</option>
                      <option value="all">All Pages</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 font-medium block mb-1">Placement Position</label>
                    <select
                      value={sigPosition}
                      onChange={(e: any) => setSigPosition(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl"
                    >
                      <option value="bottom-right">Bottom Right (Standard)</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="center">Center</option>
                      <option value="top-right">Top Right</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 font-medium block mb-1">Reason / Note (Optional)</label>
                    <input
                      type="text"
                      value={sigReason}
                      onChange={(e) => setSignReason(e.target.value)}
                      placeholder="e.g. Reviewed & Approved"
                      className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl"
                    />
                  </div>
                </div>

                {/* Image Signature Uploader */}
                {sigType === 'image' && (
                  <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center space-y-2">
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      id="sig-img-file"
                      className="hidden"
                      onChange={handleSignatureImageUpload}
                    />
                    <label
                      htmlFor="sig-img-file"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>{sigImageFile ? 'Change Signature Photo' : 'Select Signature PNG/JPG'}</span>
                    </label>

                    {sigImagePreview && (
                      <div className="mt-2 flex justify-center">
                        <img
                          src={sigImagePreview}
                          alt="Signature Preview"
                          className="max-h-16 border rounded bg-white p-1"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Error Display */}
            {errorMessage && (
              <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Process Button */}
            <Button
              onClick={handleProcess}
              disabled={loading}
              className="w-full py-3 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {loading
                  ? 'Processing PDF...'
                  : activeTab === 'crop'
                  ? 'Apply Page Crop'
                  : activeTab === 'watermark'
                  ? 'Apply Watermark'
                  : activeTab === 'page-numbers'
                  ? 'Stamp Page Numbers'
                  : activeTab === 'protect'
                  ? 'Encrypt & Protect PDF'
                  : 'Stamp Signature'}
              </span>
            </Button>
          </div>
        )}

        {/* Step 3: Result & Download */}
        {result && (
          <div className="space-y-6 pt-2">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    {result.outputFilename}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {result.pageCount} page{result.pageCount > 1 ? 's' : ''} •{' '}
                    {(result.fileSize / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <Badge variant="emerald">
                {result.isProtected ? 'Encrypted (256-bit AES)' : 'PDF Ready'}
              </Badge>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              {result.message}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a href={result.downloadUrl} download className="flex-1 min-w-[200px]">
                <Button className="w-full flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>Download Processed PDF</span>
                </Button>
              </a>

              {result.previewUrl && !result.isProtected && (
                <a
                  href={result.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[160px]"
                >
                  <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>Preview in Tab</span>
                  </Button>
                </a>
              )}

              <Button variant="secondary" onClick={resetState}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Process Another PDF
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
