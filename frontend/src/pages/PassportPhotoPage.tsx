import React from 'react';
import { ToolPageLayout } from '../components/ToolPageLayout';
import { ApplicationPhotoWorkspace } from '../components/ApplicationPhotoWorkspace';
import { TOOL_PAGE_CONFIGS } from '../utils/toolPageConfigs';

export const PassportPhotoPage: React.FC = () => {
  const config = TOOL_PAGE_CONFIGS['passport-photo-resizer'];

  return (
    <ToolPageLayout config={config}>
      <ApplicationPhotoWorkspace initialType="photo" />
    </ToolPageLayout>
  );
};

export default PassportPhotoPage;

