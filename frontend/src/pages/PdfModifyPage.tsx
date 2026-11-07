import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Crop, Lock, PenTool } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PdfModifyWorkspace, PdfModifyTab } from '../components/PdfModifyWorkspace';

export const PdfModifyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');

  let initialTab: PdfModifyTab = 'crop';
  if (rawTab === 'watermark') initialTab = 'watermark';
  else if (rawTab === 'page-numbers' || rawTab === 'number') initialTab = 'page-numbers';
  else if (rawTab === 'protect' || rawTab === 'password') initialTab = 'protect';
  else if (rawTab === 'sign') initialTab = 'sign';

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner */}
      <div className="rounded-3xl border border-[#EDE7D9] dark:border-[#332B20] bg-[#FFFFFF] dark:bg-[#1E1913] p-6 sm:p-10 shadow-warm-card backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#FFBF00]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#FF7900]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center gap-2 mb-3 relative z-10">
          <Badge variant="emerald" size="md" dot>
            PDF Manipulation Suite
          </Badge>
          <Badge variant="neutral" size="md" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Zero-Knowledge Privacy
          </Badge>
        </div>

        <h1 className="text-3xl sm:text-4xl font-display font-bold uppercase tracking-tight text-[#202020] dark:text-[#FFFDF7] relative z-10">
          PDF Utility Studio
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#666666] dark:text-[#B8AF9F] max-w-2xl leading-relaxed relative z-10">
          Crop page margins, add customizable text watermarks, stamp page numbering headers and footers, secure documents with 256-bit AES encryption, or place signatures onto pages.
        </p>

        {/* Feature Highlights */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-[#666666] dark:text-[#B8AF9F] border-t border-[#EDE7D9] dark:border-[#332B20] pt-4 relative z-10">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Precise margin & preset cropping</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Diagonal & header watermarks</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Custom page numbering with cover exclusion</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>256-bit AES password encryption</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Formal text & image signature placement</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Workspace */}
      <PdfModifyWorkspace initialTab={initialTab} />

      {/* Feature Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-3">
          <div className="p-2.5 bg-[#FFBF00]/10 text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/25 rounded-xl w-fit">
            <Crop className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-[#202020] dark:text-[#FFFDF7] text-base">
            Universal Page Cropping
          </h3>
          <p className="text-xs text-[#666666] dark:text-[#B8AF9F] leading-relaxed">
            Sets both standard CropBox and MediaBox boundaries to guarantee that cropped pages display identically across all modern PDF readers, browsers, and mobile devices.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="p-2.5 bg-[#FFBF00]/10 text-[#FF7900] dark:text-[#FFBF00] border border-[#FFBF00]/30 rounded-xl w-fit">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-[#202020] dark:text-[#FFFDF7] text-base">
            Zero-Knowledge Passwords
          </h3>
          <p className="text-xs text-[#666666] dark:text-[#B8AF9F] leading-relaxed">
            Passwords are used solely for encryption execution and are never recorded in application logs, database storage, or server traces.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="p-2.5 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 rounded-xl w-fit">
            <PenTool className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-[#202020] dark:text-[#FFFDF7] text-base">
            Clean Signature Placement
          </h3>
          <p className="text-xs text-[#666666] dark:text-[#B8AF9F] leading-relaxed">
            Stamp transparent signature PNG photos or formal script signature blocks with date and verification remarks directly onto document signature lines.
          </p>
        </Card>
      </div>
    </div>
  );
};

