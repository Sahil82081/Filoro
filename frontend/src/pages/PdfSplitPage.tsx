import React from 'react';
import { ToolPageLayout } from '../components/ToolPageLayout';
import { PdfOrganizeWorkspace } from '../components/PdfOrganizeWorkspace';
import { TOOL_PAGE_CONFIGS } from '../utils/toolPageConfigs';

export const PdfSplitPage: React.FC = () => {
  const config = TOOL_PAGE_CONFIGS['pdf-split'];

  return (
    <ToolPageLayout config={config}>
      <PdfOrganizeWorkspace initialTab="split" />
    </ToolPageLayout>
  );
};

export default PdfSplitPage;

