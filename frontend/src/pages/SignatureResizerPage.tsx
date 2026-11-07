import React from 'react';
import { ToolPageLayout } from '../components/ToolPageLayout';
import { ApplicationPhotoWorkspace } from '../components/ApplicationPhotoWorkspace';
import { TOOL_PAGE_CONFIGS } from '../utils/toolPageConfigs';

export const SignatureResizerPage: React.FC = () => {
  const config = TOOL_PAGE_CONFIGS['signature-resizer'];

  return (
    <ToolPageLayout config={config}>
      <ApplicationPhotoWorkspace initialType="signature" />
    </ToolPageLayout>
  );
};

export default SignatureResizerPage;

