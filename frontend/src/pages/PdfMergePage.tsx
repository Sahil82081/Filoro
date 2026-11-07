import React from 'react';
import { ToolPageLayout } from '../components/ToolPageLayout';
import { PdfOrganizeWorkspace } from '../components/PdfOrganizeWorkspace';
import { TOOL_PAGE_CONFIGS } from '../utils/toolPageConfigs';

export const PdfMergePage: React.FC = () => {
  const config = TOOL_PAGE_CONFIGS['pdf-merge'];

  return (
    <ToolPageLayout config={config}>
      <PdfOrganizeWorkspace initialTab="merge" />
    </ToolPageLayout>
  );
};

export default PdfMergePage;

