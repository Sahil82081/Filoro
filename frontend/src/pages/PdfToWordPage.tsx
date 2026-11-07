import React from 'react';
import { ToolPageLayout } from '../components/ToolPageLayout';
import { OcrWorkspace } from '../components/OcrWorkspace';
import { TOOL_PAGE_CONFIGS } from '../utils/toolPageConfigs';

export const PdfToWordPage: React.FC = () => {
  const config = TOOL_PAGE_CONFIGS['pdf-to-word'];

  return (
    <ToolPageLayout config={config}>
      <OcrWorkspace initialTab="pdf-to-word" />
    </ToolPageLayout>
  );
};

export default PdfToWordPage;

