import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { ApplicationPhotoWorkspace, ApplicationToolType } from '../components/ApplicationPhotoWorkspace';

export const ApplicationPhotoPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialType = (searchParams.get('type') as ApplicationToolType) || 'photo';

  return (
    <div className="space-y-8 pb-12">
      {/* Banner */}
      <div className="rounded-3xl border border-[#EDE7D9] dark:border-[#332B20] bg-[#FFFFFF] dark:bg-[#1E1913] p-6 sm:p-10 shadow-warm-card backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#FFBF00]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#FFE642]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center gap-2 mb-3 relative z-10">
          <Badge variant="emerald" size="md" dot>
            Requirement Validator
          </Badge>
          <Badge variant="neutral" size="md" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Auto-Purged Files
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold uppercase tracking-tight text-[#202020] dark:text-[#FFFDF7] relative z-10">
          Application Photo & Signature Resizer
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#666666] dark:text-[#B8AF9F] max-w-2xl leading-relaxed relative z-10">
          Prepare photos and signatures to exact pixel dimensions and strict file-size limits (KB).
          Features instant verification and automated compliance checking.
        </p>

        <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-[#EDE7D9] dark:border-[#332B20] text-xs text-[#666666] dark:text-[#B8AF9F] relative z-10">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Exact width & height enforcement</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#FF7900] dark:text-[#FFBF00]" />
            <span>Targeted maximum & minimum file size (KB)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Local temporary processing & auto-cleanup</span>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <ApplicationPhotoWorkspace initialType={initialType} />
    </div>
  );
};


