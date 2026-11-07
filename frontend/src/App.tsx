import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { DesignSystemPage } from './pages/DesignSystemPage';
import { ApplicationPhotoPage } from './pages/ApplicationPhotoPage';
import { ImageToolsPage } from './pages/ImageToolsPage';
import { PdfCompressorPage } from './pages/PdfCompressorPage';
import { TargetCompressorPage } from './pages/TargetCompressorPage';
import { PdfOrganizePage } from './pages/PdfOrganizePage';
import { DocumentConvertPage } from './pages/DocumentConvertPage';
import { DocumentCompressPage } from './pages/DocumentCompressPage';
import { OcrPage } from './pages/OcrPage';
import { PdfModifyPage } from './pages/PdfModifyPage';
import { BatchProcessingPage } from './pages/BatchProcessingPage';

// Individual Dedicated Tool Pages (Stage 17)
import { PdfMergePage } from './pages/PdfMergePage';
import { PdfSplitPage } from './pages/PdfSplitPage';
import { ImageCompressorPage } from './pages/ImageCompressorPage';
import { ImageResizerPage } from './pages/ImageResizerPage';
import { PdfToWordPage } from './pages/PdfToWordPage';
import { WordToPdfPage } from './pages/WordToPdfPage';
import { PassportPhotoPage } from './pages/PassportPhotoPage';
import { SignatureResizerPage } from './pages/SignatureResizerPage';
import { GenericToolPage } from './pages/GenericToolPage';
import { ThemeProvider } from './context/ThemeContext';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          
          {/* Individual Dedicated Pages for Implemented Tools */}
          <Route path="pdf-compressor" element={<PdfCompressorPage />} />
          <Route path="target-compressor" element={<TargetCompressorPage />} />
          <Route path="pdf-merge" element={<PdfMergePage />} />
          <Route path="pdf-split" element={<PdfSplitPage />} />
          <Route path="image-compressor" element={<ImageCompressorPage />} />
          <Route path="image-resizer" element={<ImageResizerPage />} />
          <Route path="image-converter" element={<GenericToolPage toolSlug="image-converter" />} />
          <Route path="convert-image" element={<Navigate to="/image-converter" replace />} />
          <Route path="pdf-to-word" element={<PdfToWordPage />} />
          <Route path="word-to-pdf" element={<WordToPdfPage />} />
          <Route path="passport-photo-resizer" element={<PassportPhotoPage />} />
          <Route path="signature-resizer" element={<SignatureResizerPage />} />
          
          {/* PDF Suite Dedicated Routes */}
          <Route path="pdf-extract" element={<GenericToolPage toolSlug="pdf-extract" />} />
          <Route path="pdf-reorder" element={<GenericToolPage toolSlug="pdf-reorder" />} />
          <Route path="pdf-rotate" element={<GenericToolPage toolSlug="pdf-rotate" />} />
          <Route path="pdf-to-image" element={<GenericToolPage toolSlug="pdf-to-image" />} />
          <Route path="image-to-pdf" element={<GenericToolPage toolSlug="image-to-pdf" />} />
          <Route path="excel-to-pdf" element={<GenericToolPage toolSlug="excel-to-pdf" />} />
          <Route path="crop-pdf" element={<GenericToolPage toolSlug="crop-pdf" />} />
          <Route path="watermark-pdf" element={<GenericToolPage toolSlug="watermark-pdf" />} />
          <Route path="page-numbers-pdf" element={<GenericToolPage toolSlug="page-numbers-pdf" />} />
          <Route path="protect-pdf" element={<GenericToolPage toolSlug="protect-pdf" />} />
          <Route path="sign-pdf" element={<GenericToolPage toolSlug="sign-pdf" />} />
          <Route path="compress-word" element={<GenericToolPage toolSlug="compress-word" />} />
          <Route path="compress-powerpoint" element={<GenericToolPage toolSlug="compress-powerpoint" />} />
          
          {/* OCR Suite Dedicated Routes */}
          <Route path="image-to-text" element={<GenericToolPage toolSlug="image-to-text" />} />
          <Route path="scanned-pdf-to-text" element={<GenericToolPage toolSlug="scanned-pdf-to-text" />} />
          
          {/* Broad Category / Suite Hubs */}
          <Route path="design-system" element={<DesignSystemPage />} />
          <Route path="application-photo" element={<ApplicationPhotoPage />} />
          <Route path="image-tools" element={<ImageToolsPage />} />
          <Route path="pdf-organize" element={<PdfOrganizePage />} />
          <Route path="document-convert" element={<DocumentConvertPage />} />
          <Route path="document-compress" element={<DocumentCompressPage />} />
          <Route path="ocr" element={<OcrPage />} />
          <Route path="pdf-modify" element={<PdfModifyPage />} />
          <Route path="batch" element={<BatchProcessingPage />} />
        </Route>
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </ThemeProvider>
  );
};
export default App;
