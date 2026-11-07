import React from 'react';
import { Navigate } from 'react-router-dom';
import { ToolPageLayout } from '../components/ToolPageLayout';
import { TOOL_PAGE_CONFIGS } from '../utils/toolPageConfigs';
import { PdfOrganizeWorkspace } from '../components/PdfOrganizeWorkspace';
import { ImageToolWorkspace } from '../components/ImageToolWorkspace';
import { DocumentConvertWorkspace } from '../components/DocumentConvertWorkspace';
import { DocumentCompressWorkspace } from '../components/DocumentCompressWorkspace';
import { OcrWorkspace } from '../components/OcrWorkspace';
import { PdfModifyWorkspace } from '../components/PdfModifyWorkspace';

export interface GenericToolPageProps {
  toolSlug: string;
}

export const GenericToolPage: React.FC<GenericToolPageProps> = ({ toolSlug }) => {
  const config = TOOL_PAGE_CONFIGS[toolSlug];

  if (!config) {
    return <Navigate to="/" replace />;
  }

  const renderToolWorkspace = () => {
    switch (toolSlug) {
      // PDF Organize Suite
      case 'pdf-extract':
        return <PdfOrganizeWorkspace initialTab="extract" />;
      case 'pdf-reorder':
        return <PdfOrganizeWorkspace initialTab="reorder" />;
      case 'pdf-rotate':
        return <PdfOrganizeWorkspace initialTab="rotate" />;

      // Image Suite
      case 'image-converter':
        return <ImageToolWorkspace initialMode="convert" />;

      // Document Converter Suite
      case 'pdf-to-image':
        return <DocumentConvertWorkspace initialTab="pdf-to-image" />;
      case 'image-to-pdf':
        return <DocumentConvertWorkspace initialTab="image-to-pdf" />;
      case 'excel-to-pdf':
        return <DocumentConvertWorkspace initialTab="excel-to-pdf" />;

      // Document Compressor Suite
      case 'compress-word':
        return <DocumentCompressWorkspace initialType="word" />;
      case 'compress-powerpoint':
        return <DocumentCompressWorkspace initialType="powerpoint" />;

      // OCR Suite
      case 'image-to-text':
        return <OcrWorkspace initialTab="image-to-text" />;
      case 'scanned-pdf-to-text':
        return <OcrWorkspace initialTab="pdf-to-text" />;

      // PDF Manipulation Suite
      case 'crop-pdf':
        return <PdfModifyWorkspace initialTab="crop" />;
      case 'watermark-pdf':
        return <PdfModifyWorkspace initialTab="watermark" />;
      case 'page-numbers-pdf':
        return <PdfModifyWorkspace initialTab="page-numbers" />;
      case 'protect-pdf':
        return <PdfModifyWorkspace initialTab="protect" />;
      case 'sign-pdf':
        return <PdfModifyWorkspace initialTab="sign" />;

      default:
        return <div>Tool interface under maintenance.</div>;
    }
  };

  return (
    <ToolPageLayout config={config}>
      {renderToolWorkspace()}
    </ToolPageLayout>
  );
};

export default GenericToolPage;

