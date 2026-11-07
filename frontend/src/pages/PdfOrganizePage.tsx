import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Layers, Scissors, RotateCw } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PdfOrganizeWorkspace, OrganizeTab } from '../components/PdfOrganizeWorkspace';

export const PdfOrganizePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const validTabs: OrganizeTab[] = ['merge', 'split', 'extract', 'reorder', 'rotate'];
  const activeTab: OrganizeTab = validTabs.includes(rawTab as OrganizeTab)
    ? (rawTab as OrganizeTab)
    : 'merge';

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner */}
      <div className="rounded-3xl border border-[#EDE7D9] dark:border-[#332B20] bg-[#FFFFFF] dark:bg-[#1E1913] p-6 sm:p-10 shadow-warm-card backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#FFBF00]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#FF7900]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center gap-2 mb-3 relative z-10">
          <Badge variant="emerald" size="md" dot>
            pdf-lib & QPDF Validated
          </Badge>
          <Badge variant="neutral" size="md" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Auto-Purged Files
          </Badge>
        </div>

        <h1 className="text-3xl sm:text-4xl font-display font-bold uppercase tracking-tight text-[#202020] dark:text-[#FFFDF7] relative z-10">
          PDF Organize & Utility Suite
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#666666] dark:text-[#B8AF9F] max-w-2xl leading-relaxed relative z-10">
          Merge multiple PDFs, split documents by page ranges or into individual ZIP files, extract key pages, reorder sequences, and rotate orientations in seconds.
        </p>

        {/* Feature Highlights */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-[#666666] dark:text-[#B8AF9F] border-t border-[#EDE7D9] dark:border-[#332B20] pt-4 relative z-10">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Multi-document merge & drag reorder</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Split to ranges or all pages to ZIP</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Interactive visual page grid</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Zero permanent storage</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Workspace */}
      <PdfOrganizeWorkspace initialTab={activeTab} />

      {/* Informative Guidance & How It Works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <Card className="p-5">
          <div className="w-9 h-9 rounded-xl bg-[#FFBF00]/10 text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/25 flex items-center justify-center mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-[#202020] dark:text-[#FFFDF7] text-sm">PDF Merge & Sequence</h4>
          <p className="mt-1.5 text-xs text-[#666666] dark:text-[#B8AF9F] leading-relaxed">
            Combine separate PDFs into a unified file. Add multiple documents, rearrange document order with one click, and produce a structurally validated output.
          </p>
        </Card>

        <Card className="p-5">
          <div className="w-9 h-9 rounded-xl bg-[#FF7900]/10 text-[#FF7900] border border-[#FF7900]/25 flex items-center justify-center mb-3">
            <Scissors className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-[#202020] dark:text-[#FFFDF7] text-sm">Split & Extract Pages</h4>
          <p className="mt-1.5 text-xs text-[#666666] dark:text-[#B8AF9F] leading-relaxed">
            Specify comma-separated ranges (e.g. 1-3, 5) or separate every single page into an individual PDF packaged inside a clean ZIP archive.
          </p>
        </Card>

        <Card className="p-5">
          <div className="w-9 h-9 rounded-xl bg-[#FFBF00]/10 text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/30 flex items-center justify-center mb-3">
            <RotateCw className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-[#202020] dark:text-[#FFFDF7] text-sm">Reorder & Rotate</h4>
          <p className="mt-1.5 text-xs text-[#666666] dark:text-[#B8AF9F] leading-relaxed">
            Rearrange pages using drag-and-drop or shift controls. Rotate pages clockwise by 90°, 180°, or 270° with live visual orientation preview.
          </p>
        </Card>
      </div>
    </div>
  );
};

