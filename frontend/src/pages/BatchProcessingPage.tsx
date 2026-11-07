import React from 'react';
import { ToolPageLayout } from '../components/ToolPageLayout';
import { BatchProcessingWorkspace } from '../components/BatchProcessingWorkspace';
import { TOOL_PAGE_CONFIGS } from '../utils/toolPageConfigs';

export const BatchProcessingPage: React.FC = () => {
  const config = TOOL_PAGE_CONFIGS['batch-processing'];

  return (
    <ToolPageLayout config={config}>
      <BatchProcessingWorkspace />
    </ToolPageLayout>
  );
};

export default BatchProcessingPage;
