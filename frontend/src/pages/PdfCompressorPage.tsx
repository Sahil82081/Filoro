import React from 'react';
import { ToolPageLayout } from '../components/ToolPageLayout';
import { PdfCompressorWorkspace } from '../components/PdfCompressorWorkspace';
import { TOOL_PAGE_CONFIGS } from '../utils/toolPageConfigs';

export const PdfCompressorPage: React.FC = () => {
  const config = TOOL_PAGE_CONFIGS['pdf-compressor'];

  return (
    <ToolPageLayout config={config}>
      <PdfCompressorWorkspace />
    </ToolPageLayout>
  );
};

export default PdfCompressorPage;
