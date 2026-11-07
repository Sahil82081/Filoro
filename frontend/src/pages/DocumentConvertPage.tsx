import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, FileImage, FileText, FileSpreadsheet } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { DocumentConvertWorkspace, ConvertTab } from '../components/DocumentConvertWorkspace';

export const DocumentConvertPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const validTabs: ConvertTab[] = ['pdf-to-image', 'image-to-pdf', 'word-to-pdf', 'excel-to-pdf'];
  const activeTab: ConvertTab = validTabs.includes(rawTab as ConvertTab)
    ? (rawTab as ConvertTab)
    : 'pdf-to-image';

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner */}
      <div className="rounded-3xl border border-[#EDE7D9] dark:border-[#332B20] bg-[#FFFFFF] dark:bg-[#1E1913] p-6 sm:p-10 shadow-warm-card backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#FFBF00]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#FFE642]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center gap-2 mb-3 relative z-10">
          <Badge variant="emerald" size="md" dot>
            Poppler & LibreOffice Engines
          </Badge>
          <Badge variant="neutral" size="md" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Auto-Purged Files
          </Badge>
        </div>

        <h1 className="text-3xl sm:text-4xl font-display font-bold uppercase tracking-tight text-[#202020] dark:text-[#FFFDF7] relative z-10">
          Document & Image Converter Suite
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#666666] dark:text-[#B8AF9F] max-w-2xl leading-relaxed relative z-10">
          Convert PDF documents to crisp JPG/PNG images, transform image collections into structured PDFs, and turn Word or Excel files into clean PDFs with real headless processing engines.
        </p>

        {/* Feature Highlights */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-[#666666] dark:text-[#B8AF9F] border-t border-[#EDE7D9] dark:border-[#332B20] pt-4 relative z-10">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>High-DPI Poppler rendering (150/300 DPI)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Multi-image sequence & A4/Fit modes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Real LibreOffice Writer & Calc engines</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>QPDF structural verification</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Workspace */}
      <DocumentConvertWorkspace initialTab={activeTab} />

      {/* Informative Guidance & How It Works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <Card className="p-5">
          <div className="w-9 h-9 rounded-xl bg-[#FFBF00]/10 text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/25 flex items-center justify-center mb-3">
            <FileImage className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-[#202020] dark:text-[#FFFDF7] text-sm">PDF to Image (JPG / PNG)</h4>
          <p className="mt-1.5 text-xs text-[#666666] dark:text-[#B8AF9F] leading-relaxed">
            Extract individual pages or full documents into sharp JPG or PNG images. Single pages download directly; multiple pages are bundled into a convenient ZIP archive.
          </p>
        </Card>

        <Card className="p-5">
          <div className="w-9 h-9 rounded-xl bg-[#FF7900]/10 text-[#FF7900] border border-[#FF7900]/25 flex items-center justify-center mb-3">
            <FileText className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-[#202020] dark:text-[#FFFDF7] text-sm">Images to PDF</h4>
          <p className="mt-1.5 text-xs text-[#666666] dark:text-[#B8AF9F] leading-relaxed">
            Combine multiple photos or screenshots into a single ordered PDF file. Choose between natural image dimensions or centered standard A4 document layout.
          </p>
        </Card>

        <Card className="p-5">
          <div className="w-9 h-9 rounded-xl bg-[#FFBF00]/10 text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/30 flex items-center justify-center mb-3">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-[#202020] dark:text-[#FFFDF7] text-sm">Word & Excel to PDF</h4>
          <p className="mt-1.5 text-xs text-[#666666] dark:text-[#B8AF9F] leading-relaxed">
            Convert DOCX, DOC, XLSX, and XLS documents using real LibreOffice headless conversion. Honest formatting notices inform you of potential styling differences.
          </p>
        </Card>
      </div>
    </div>
  );
};


