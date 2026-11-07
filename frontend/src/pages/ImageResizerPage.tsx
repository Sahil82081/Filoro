import React from 'react';
import { ToolPageLayout } from '../components/ToolPageLayout';
import { ImageToolWorkspace } from '../components/ImageToolWorkspace';
import { TOOL_PAGE_CONFIGS } from '../utils/toolPageConfigs';

export const ImageResizerPage: React.FC = () => {
  const config = TOOL_PAGE_CONFIGS['image-resizer'];

  return (
    <ToolPageLayout config={config}>
      <ImageToolWorkspace initialMode="resize" />
    </ToolPageLayout>
  );
};

export default ImageResizerPage;

