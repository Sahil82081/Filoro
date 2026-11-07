import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { useSeo } from '../hooks/useSeo';
import { ToolPageConfig } from '../utils/toolPageConfigs';

export interface ToolPageLayoutProps {
  config: ToolPageConfig;
  children: React.ReactNode;
}

export const ToolPageLayout: React.FC<ToolPageLayoutProps> = ({ config, children }) => {
  // Apply dynamic SEO tags: Title, Meta Description, Canonical URL, Open Graph & Twitter Cards
  useSeo({
    title: config.seoTitle,
    description: config.seoDescription,
    canonicalPath: config.path,
  });

  // State for interactive FAQ accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const getCategoryBadgeVariant = (cat: string) => {
    switch (cat) {
      case 'pdf': return 'orange';
      case 'image': return 'brand';
      case 'document': return 'champagne';
      case 'application': return 'lemon';
      default: return 'neutral';
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'pdf': return 'PDF Tool';
      case 'image': return 'Image Tool';
      case 'document': return 'Document Utility';
      case 'application': return 'Application Photo';
      default: return 'File Utility';
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Header & Hero Section */}
      <div className="rounded-3xl border border-[#EDE7D9] dark:border-[#332B20] bg-[#FFFFFF] dark:bg-[#1E1913] p-6 sm:p-10 shadow-warm-card space-y-4 transition-colors">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#666666] dark:text-[#B8AF9F] font-medium">
          <Link to="/" className="hover:text-[#FF7900] dark:hover:text-[#FFBF00] transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#666666]/60 dark:text-[#B8AF9F]/60" />
          <span className="capitalize">{config.headerCategory} Tools</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#666666]/60 dark:text-[#B8AF9F]/60" />
          <span className="text-[#202020] dark:text-[#FFFDF7] font-semibold">{config.title}</span>
        </nav>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge variant={getCategoryBadgeVariant(config.headerCategory) as any} size="md">
            {getCategoryLabel(config.headerCategory)}
          </Badge>
          <Badge variant="emerald" size="md" dot>
            {config.headerBadge}
          </Badge>
          <Badge variant="neutral" size="md" icon={<ShieldCheck className="w-3.5 h-3.5 text-[#16A34A] dark:text-[#4ADE80]" />}>
            Auto-Deleted Temp Files
          </Badge>
        </div>

        {/* Title & Short Description */}
        <div>
          <h1 className="text-2xl sm:text-4xl font-display font-bold tracking-tight text-[#202020] dark:text-[#FFFDF7] leading-tight">
            {config.title}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#666666] dark:text-[#B8AF9F] max-w-2xl leading-relaxed">
            {config.description}
          </p>
        </div>

        {/* Supported Formats & Constraints Bar */}
        <div className="pt-4 border-t border-[#EDE7D9] dark:border-[#332B20] flex flex-wrap items-center gap-4 text-xs text-[#666666] dark:text-[#B8AF9F]">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-[#666666] dark:text-[#B8AF9F] font-normal">Supported Formats:</span>
            <div className="flex items-center gap-1">
              {config.supportedFormats.map((fmt) => (
                <span
                  key={fmt}
                  className="px-2 py-0.5 rounded-md bg-[#F8F5EE] dark:bg-[#2A231A] border border-[#EDE7D9] dark:border-[#3D3325] font-mono text-[#202020] dark:text-[#FFFDF7] font-semibold"
                >
                  {fmt}
                </span>
              ))}
            </div>
          </div>
          <span className="text-[#EDE7D9] dark:text-[#332B20]">•</span>
          <div className="flex items-center gap-1">
            <span>Max File Size:</span>
            <span className="font-semibold text-[#202020] dark:text-[#FFFDF7]">{config.maxFileSizeMB} MB</span>
          </div>
          <span className="text-[#EDE7D9] dark:text-[#332B20]">•</span>
          <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Files auto-deleted after processing</span>
          </div>
        </div>
      </div>

      {/* 2. Actual Working Tool Interface */}
      <section aria-label={`${config.title} Interface`}>
        {children}
      </section>

      {/* 3. Honest Privacy Banner */}
      <div className="rounded-2xl border border-[#EDE7D9] dark:border-[#3D3325] bg-[#FBF3DF] dark:bg-[#1E1913] p-5 sm:p-6 shadow-warm-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-colors">
        <div className="w-10 h-10 rounded-xl bg-[#FFFFFF] dark:bg-[#2A231A] border border-[#F2CF7E] dark:border-[#4D3F28] flex items-center justify-center text-[#FF7900] dark:text-[#FFBF00] shrink-0 shadow-warm-sm">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1 flex-1">
          <h3 className="text-sm font-display font-bold text-[#202020] dark:text-[#FFFDF7]">
            Privacy & Automatic Temporary File Deletion
          </h3>
          <p className="text-xs text-[#202020]/80 dark:text-[#B8AF9F] leading-relaxed">
            Files are temporarily processed on our server and automatically deleted after processing.
            We do not store your files long-term, inspect personal contents, or make exaggerated claims like "100% secure." Processing occurs strictly in local temporary staging.
          </p>
        </div>
      </div>

      {/* 4. How It Works Section */}
      <section aria-label="How it works" className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-[#202020] dark:text-[#FFFDF7]">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-[#B8AF9F]">
            Follow these simple steps to process your files in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {config.howItWorks.map((step) => (
            <Card key={step.number} className="p-5 flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FBF3DF] dark:bg-[#2A231A] border border-[#F2CF7E] dark:border-[#4D3F28] text-[#202020] dark:text-[#FFE642] font-display font-bold text-sm flex items-center justify-center">
                  {step.number}
                </div>
                <h4 className="text-sm font-bold text-[#202020] dark:text-[#FFFDF7]">
                  {step.title}
                </h4>
                <p className="text-xs text-[#666666] dark:text-[#B8AF9F] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 5. Frequently Asked Questions (FAQ) */}
      {config.faqs.length > 0 && (
        <section aria-label="Frequently Asked Questions" className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-[#202020] dark:text-[#FFFDF7] flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#FF7900] dark:text-[#FFBF00]" />
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] dark:text-[#B8AF9F]">
              Clear, transparent answers about quality, security, and formats.
            </p>
          </div>

          <div className="space-y-3">
            {config.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.question}
                  className="rounded-2xl border border-[#EDE7D9] dark:border-[#332B20] bg-[#FFFFFF] dark:bg-[#1E1913] shadow-warm-sm overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm text-[#202020] dark:text-[#FFFDF7] hover:text-[#FF7900] dark:hover:text-[#FFBF00] transition"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#666666] dark:text-[#B8AF9F] transition-transform ${
                        isOpen ? 'rotate-180 text-[#FF7900] dark:text-[#FFBF00]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs text-[#666666] dark:text-[#B8AF9F] leading-relaxed border-t border-[#EDE7D9] dark:border-[#332B20] pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. Related Tools (Internal Linking Graph) */}
      {config.relatedTools.length > 0 && (
        <section aria-label="Related Tools" className="space-y-4 pt-4 border-t border-[#EDE7D9] dark:border-[#332B20]">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-[#202020] dark:text-[#FFFDF7] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FFBF00]" />
              Related Tools You Might Find Useful
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] dark:text-[#B8AF9F]">
              Seamlessly continue your document and image workflows with these related utilities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {config.relatedTools.map((tool) => (
              <Link
                key={tool.path}
                to={tool.path}
                className="group block rounded-2xl border border-[#EDE7D9] dark:border-[#332B20] bg-[#FFFFFF] dark:bg-[#1E1913] p-4 shadow-warm-card hover:border-[#FFBF00] hover:-translate-y-1 transition duration-200 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={getCategoryBadgeVariant(tool.category) as any} size="sm">
                      {getCategoryLabel(tool.category)}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold text-[#202020] dark:text-[#FFFDF7] group-hover:text-[#FF7900] dark:group-hover:text-[#FFBF00] transition">
                    {tool.title}
                  </h4>
                  <p className="text-xs text-[#666666] dark:text-[#B8AF9F] line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="pt-3 flex items-center gap-1 text-xs font-semibold text-[#FF7900] dark:text-[#FFBF00] group-hover:translate-x-1 transition-all">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
