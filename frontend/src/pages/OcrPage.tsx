import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, FileText, Image as ImageIcon, FileCheck } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { OcrWorkspace, OcrTab } from '../components/OcrWorkspace';

export const OcrPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  
  let initialTab: OcrTab = 'image-to-text';
  if (rawTab === 'pdf-to-text' || rawTab === 'scanned-pdf-to-text') {
    initialTab = 'pdf-to-text';
  } else if (rawTab === 'pdf-to-word' || rawTab === 'scanned-pdf-to-word' || rawTab === 'pdf-to-docx') {
    initialTab = 'pdf-to-word';
  } else if (rawTab === 'image-to-pdf' || rawTab === 'img-to-pdf') {
    initialTab = 'image-to-pdf';
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner */}
      <div className="rounded-3xl border border-[#EDE7D9] dark:border-[#332B20] bg-[#FFFFFF] dark:bg-[#1E1913] p-6 sm:p-10 shadow-warm-card backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#FFBF00]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#FFE642]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center gap-2 mb-3 relative z-10">
          <Badge variant="emerald" size="md" dot>
            Tesseract OCR Engine
          </Badge>
          <Badge variant="neutral" size="md" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Truthful Progression
          </Badge>
        </div>

        <h1 className="text-3xl sm:text-4xl font-display font-bold uppercase tracking-tight text-[#202020] dark:text-[#FFFDF7] relative z-10">
          OCR & Text Extractor Studio
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#666666] dark:text-[#B8AF9F] max-w-2xl leading-relaxed relative z-10">
          Extract text from photos, screenshots, and multi-page scanned PDF documents with optical character recognition. Download as plain text (.txt), convert scans to editable Word (.docx), or package images into PDF.
        </p>

        {/* Feature Highlights */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-[#666666] dark:text-[#B8AF9F] border-t border-[#EDE7D9] dark:border-[#332B20] pt-4 relative z-10">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Tesseract OCR engine</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Multi-page scanned PDF rendering</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Direct Word (.docx) generation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Real stage progression (no fake progress)</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Workspace */}
      <OcrWorkspace initialTab={initialTab} />

      {/* Information & Best Practice Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-3">
          <div className="p-2.5 bg-[#FFBF00]/10 text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/25 rounded-xl w-fit">
            <ImageIcon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-[#202020] dark:text-[#FFFDF7] text-base">
            High-Contrast Scans
          </h3>
          <p className="text-xs text-[#666666] dark:text-[#B8AF9F] leading-relaxed">
            OCR accuracy is highest when documents are straight, well-lit, and have sharp contrast between black text and white backgrounds.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="p-2.5 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 rounded-xl w-fit">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-[#202020] dark:text-[#FFFDF7] text-base">
            Multi-Page Scans
          </h3>
          <p className="text-xs text-[#666666] dark:text-[#B8AF9F] leading-relaxed">
            Multi-page PDFs are rendered into individual page images at 150 DPI and sequentially recognized by Tesseract before combining into structured text.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="p-2.5 bg-[#FFBF00]/10 text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/30 rounded-xl w-fit">
            <FileCheck className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-[#202020] dark:text-[#FFFDF7] text-base">
            Editable Word Docs
          </h3>
          <p className="text-xs text-[#666666] dark:text-[#B8AF9F] leading-relaxed">
            Scanned PDF to Word preserves paragraph breaks and creates standard OpenXML headings for each scanned page ready for Microsoft Word.
          </p>
        </Card>
      </div>
    </div>
  );
};

