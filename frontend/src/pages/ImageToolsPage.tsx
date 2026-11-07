import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileImage, ShieldCheck } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { ImageToolWorkspace, ImageToolMode } from '../components/ImageToolWorkspace';

export const ImageToolsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialModeParam = (searchParams.get('mode') as ImageToolMode) || 'compress';
  const targetFormatParam = (searchParams.get('format') as 'jpg' | 'png' | 'webp') || 'webp';

  return (
    <div className="space-y-8 pb-12">
      {/* Banner */}
      <div className="rounded-3xl border border-[#EDE7D9] dark:border-[#332B20] bg-[#FFFFFF] dark:bg-[#1E1913] p-6 sm:p-10 shadow-warm-card backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#FFBF00]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#FFE642]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center gap-2 mb-3 relative z-10">
          <Badge variant="emerald" size="md" dot>
            Real Sharp Processing
          </Badge>
          <Badge variant="neutral" size="md" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Auto-Purged Files
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold uppercase tracking-tight text-[#202020] dark:text-[#FFFDF7] relative z-10">
          Image Processing Studio
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#666666] dark:text-[#B8AF9F] max-w-2xl leading-relaxed relative z-10">
          High-performance image compression, dimension scaling, and WebP/JPG/PNG conversion.
          All operations run locally with automated disk cleanup.
        </p>

        <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-[#EDE7D9] dark:border-[#332B20] text-xs text-[#666666] dark:text-[#B8AF9F] relative z-10">
          <div className="flex items-center gap-1.5">
            <FileImage className="w-4 h-4 text-[#FF7900] dark:text-[#FFBF00]" />
            <span>Supports JPG, JPEG, PNG, WebP</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Automatic temporary file deletion</span>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <ImageToolWorkspace
        initialMode={initialModeParam}
        initialTargetFormat={targetFormatParam}
      />
    </div>
  );
};

