import React from 'react';
import { ToolPageLayout } from '../components/ToolPageLayout';
import { DocumentConvertWorkspace } from '../components/DocumentConvertWorkspace';
import { TOOL_PAGE_CONFIGS } from '../utils/toolPageConfigs';

export const WordToPdfPage: React.FC = () => {
  const config = TOOL_PAGE_CONFIGS['word-to-pdf'];

  return (
    <ToolPageLayout config={config}>
      <DocumentConvertWorkspace initialTab="word-to-pdf" />
    </ToolPageLayout>
  );
};

export default WordToPdfPage;

