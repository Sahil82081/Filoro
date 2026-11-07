import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, FileText, Presentation, Sliders } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { DocumentCompressWorkspace, DocCompressType } from '../components/DocumentCompressWorkspace';

export const DocumentCompressPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const rawType = searchParams.get('type');
  const initialType: DocCompressType = rawType === 'powerpoint' ? 'powerpoint' : 'word';

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner */}
      <div className="rounded-3xl border border-[#EDE7D9] dark:border-[#332B20] bg-[#FFFFFF] dark:bg-[#1E1913] p-6 sm:p-10 shadow-warm-card backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#FFBF00]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#FF7900]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center gap-2 mb-3 relative z-10">
          <Badge variant="emerald" size="md" dot>
            Media & Stream Optimization
          </Badge>
          <Badge variant="neutral" size="md" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Truthful Reporting
          </Badge>
        </div>

        <h1 className="text-3xl sm:text-4xl font-display font-bold uppercase tracking-tight text-[#202020] dark:text-[#FFFDF7] relative z-10">
          Word & PowerPoint Compressor
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#666666] dark:text-[#B8AF9F] max-w-2xl leading-relaxed relative z-10">
          Reduce the file size of Word documents (DOC / DOCX) and PowerPoint presentations (PPT / PPTX) by recompressing embedded high-res graphics and re-deflating package streams.
        </p>

        {/* Feature Highlights */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-[#666666] dark:text-[#B8AF9F] border-t border-[#EDE7D9] dark:border-[#332B20] pt-4 relative z-10">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Embedded media JPEG/PNG recompression</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Resolution downscaling for heavy slides</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Honest metrics (zero fake reductions)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Legacy DOC/PPT modernization</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Workspace */}
      <DocumentCompressWorkspace initialType={initialType} />

      {/* Guidance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <Card className="p-5">
          <div className="w-9 h-9 rounded-xl bg-[#FFBF00]/10 text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/25 flex items-center justify-center mb-3">
            <FileText className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-[#202020] dark:text-[#FFFDF7] text-sm">Word Compression (DOC / DOCX)</h4>
          <p className="mt-1.5 text-xs text-[#666666] dark:text-[#B8AF9F] leading-relaxed">
            Word files grow excessively when screenshots or camera photos are embedded. We recompress individual embedded media elements without modifying text or formatting.
          </p>
        </Card>

        <Card className="p-5">
          <div className="w-9 h-9 rounded-xl bg-[#FF7900]/10 text-[#FF7900] border border-[#FF7900]/25 flex items-center justify-center mb-3">
            <Presentation className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-[#202020] dark:text-[#FFFDF7] text-sm">PowerPoint Compression (PPT / PPTX)</h4>
          <p className="mt-1.5 text-xs text-[#666666] dark:text-[#B8AF9F] leading-relaxed">
            Slide decks often contain multi-megabyte raw photos across dozens of slides. Our engine safely scales oversized graphics down to 1920px Full HD to reduce email attachment weight.
          </p>
        </Card>

        <Card className="p-5">
          <div className="w-9 h-9 rounded-xl bg-[#FFBF00]/10 text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/30 flex items-center justify-center mb-3">
            <Sliders className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-[#202020] dark:text-[#FFFDF7] text-sm">Truthful Reporting</h4>
          <p className="mt-1.5 text-xs text-[#666666] dark:text-[#B8AF9F] leading-relaxed">
            If your document consists only of text or already has optimized media, Filoro will honestly report 0% reduction rather than claiming fake savings or inflating the file.
          </p>
        </Card>
      </div>
    </div>
  );
};


