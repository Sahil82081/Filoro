import React from 'react';
import { ToolPageLayout } from '../components/ToolPageLayout';
import { ImageToolWorkspace } from '../components/ImageToolWorkspace';
import { TOOL_PAGE_CONFIGS } from '../utils/toolPageConfigs';

export const ImageCompressorPage: React.FC = () => {
  const config = TOOL_PAGE_CONFIGS['image-compressor'];

  return (
    <ToolPageLayout config={config}>
      <ImageToolWorkspace initialMode="compress" />
    </ToolPageLayout>
  );
};

export default ImageCompressorPage;

