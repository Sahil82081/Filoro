import React from 'react';
import { ToolPageLayout } from '../components/ToolPageLayout';
import { TargetCompressorWorkspace } from '../components/TargetCompressorWorkspace';
import { TOOL_PAGE_CONFIGS } from '../utils/toolPageConfigs';

export const TargetCompressorPage: React.FC = () => {
  const config = TOOL_PAGE_CONFIGS['target-compressor'];

  return (
    <ToolPageLayout config={config}>
      <TargetCompressorWorkspace />
    </ToolPageLayout>
  );
};

export default TargetCompressorPage;
