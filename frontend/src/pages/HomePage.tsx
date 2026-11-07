import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  FileImage,
  FileCode,
  AppWindow,
  ArrowRight,
  Upload,
  Layers,
  ShieldCheck,
  Clock,
  Trash2,
  Lock,
  Download,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
} from '../components/ui';
import { TOOLS_DATA, CATEGORIES, ToolItem, ToolCategory } from '../utils/toolsData';
import { ToolPreviewModal } from '../components/ToolPreviewModal';
import { UploadModal } from '../components/UploadModal';
import { ToolSearchModal } from '../components/ToolSearchModal';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);

  const filteredTools = TOOLS_DATA.filter((tool) => {
    const matchesCategory =
      activeCategory === 'all'
        ? true
        : activeCategory === 'popular'
        ? tool.isPopular
        : tool.category === activeCategory;

    const matchesSearch =
      searchQuery.trim() === ''
        ? true
        : tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.fileTypes.some((ft) => ft.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: ToolCategory) => {
    switch (category) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-[#FF7900]" />;
      case 'image':
        return <FileImage className="w-4 h-4 text-[#FFBF00]" />;
      case 'document':
        return <FileCode className="w-4 h-4 text-[#E66D00]" />;
      case 'application':
        return <AppWindow className="w-4 h-4 text-[#202020] dark:text-[#FFFDF7]" />;
    }
  };

  const getCategoryBadgeClass = (category: ToolCategory) => {
    switch (category) {
      case 'pdf':
        return 'bg-[#FFF1E5] dark:bg-[#2E1F14] text-[#FF7900] border-[#FFC699] dark:border-[#52331C]';
      case 'image':
        return 'bg-[#FFF5D6] dark:bg-[#292214] text-[#202020] dark:text-[#FFBF00] border-[#F2CF7E] dark:border-[#4D3F21]';
      case 'document':
        return 'bg-[#FBF3DF] dark:bg-[#262016] text-[#202020] dark:text-[#F2CF7E] border-[#E8C570] dark:border-[#4A3D28]';
      case 'application':
        return 'bg-[#F8F5EE] dark:bg-[#221D16] text-[#202020] dark:text-[#FFFDF7] border-[#EDE7D9] dark:border-[#383025]';
    }
  };

  const scrollToTools = () => {
    const el = document.getElementById('tools');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION: WARM EDITORIAL ASYMMETRIC COMPOSITION */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#EDE7D9] dark:border-[#332B20] bg-[#FFFFFF] dark:bg-[#1E1913] p-5 sm:p-10 md:p-14 shadow-warm-card transition-colors duration-200">
        {/* Soft Champagne Atmospheric Accent in Top Corner */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none opacity-40 dark:opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #F2CF7E 0%, rgba(255, 191, 0, 0.15) 50%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            {/* Main Headline (Exact User Request) */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-[#202020] dark:text-[#FFFDF7] leading-[1.12]">
              <span>Your files, </span>
              <span className="relative inline-block text-[#202020] dark:text-[#FFFDF7]">
                Our tools.
                <span className="absolute bottom-1 left-0 right-0 h-2.5 bg-[#FFBF00]/30 dark:bg-[#FFBF00]/25 -z-10 rounded-sm" />
              </span>
              <br className="hidden sm:inline" />
              <span> One </span>
              <span className="text-[#FF7900]">simple</span>
              <span> place.</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-[#666666] dark:text-[#B8AF9F] leading-relaxed max-w-xl font-normal">
              Convert, compress, edit and organize documents and media effortlessly. Everything processes locally on temporary staging with zero permanent cloud storage.
            </p>

            {/* Action Button */}
            <div className="pt-1">
              <Button
                variant="primary"
                size="lg"
                onClick={scrollToTools}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto shadow-warm-md hover:shadow-gold-glow"
              >
                Choose a Tool
              </Button>
            </div>
          </div>

          {/* Right Column: Instant Working File Dropzone */}
          <div className="lg:col-span-5">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setUploadModalOpen(true);
              }}
              onClick={() => setUploadModalOpen(true)}
              className="group cursor-pointer rounded-2xl sm:rounded-3xl border-2 border-dashed border-[#EDE7D9] dark:border-[#332B20] hover:border-[#FFBF00] dark:hover:border-[#FFBF00] bg-[#F8F5EE]/70 dark:bg-[#16120D]/70 hover:bg-[#FBF3DF]/50 dark:hover:bg-[#1E1913] p-5 sm:p-8 flex flex-col items-center justify-center text-center transition-all duration-200 shadow-warm-xs hover:shadow-warm-md"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#FFBF00]/15 group-hover:bg-[#FFBF00] text-[#FF7900] group-hover:text-[#202020] flex items-center justify-center transition-all duration-200 mb-3 sm:mb-4 shadow-warm-xs">
                <Upload className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-200 group-hover:-translate-y-0.5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold font-display text-[#202020] dark:text-[#FFFDF7] group-hover:text-[#FF7900] dark:group-hover:text-[#FFBF00] transition-colors">
                Drop your file here to get started
              </h3>
              <p className="mt-1 sm:mt-1.5 text-xs text-[#666666] dark:text-[#B8AF9F] max-w-xs leading-relaxed">
                PDFs, Images, Word, Excel, and PowerPoint files supported up to 50 MB
              </p>
              <div className="mt-4 sm:mt-5 inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#FFFFFF] dark:bg-[#221D16] border border-[#EDE7D9] dark:border-[#332B20] text-xs font-semibold text-[#202020] dark:text-[#FFFDF7] group-hover:border-[#FFBF00] transition-colors shadow-warm-xs">
                <span>Browse from Device</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FF7900]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TOOL DISCOVERY SECTION */}
      <section id="tools" className="space-y-8 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#EDE7D9] dark:border-[#332B20] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF7900] mb-1">
              <Layers className="w-4 h-4 text-[#FF7900]" />
              <span>Tool Directory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-[#202020] dark:text-[#FFFDF7]">
              Explore Available & Upcoming Utilities
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] dark:text-[#B8AF9F] mt-1">
              Select any tool below to inspect parameters, supported formats, and processing workflows.
            </p>
          </div>

          {/* Quick Filter Search Input */}
          <div className="w-full md:w-72 relative">
            <Search className="w-4 h-4 text-[#666666] dark:text-[#B8AF9F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter 27 tools..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#FFFFFF] dark:bg-[#1E1913] border border-[#EDE7D9] dark:border-[#332B20] text-[#202020] dark:text-[#FFFDF7] placeholder:text-[#666666]/50 dark:placeholder:text-[#B8AF9F]/40 focus:outline-none focus:border-[#FFBF00] focus:ring-2 focus:ring-[#FFBF00]/25 transition"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div
          role="tablist"
          aria-label="Tool Categories"
          className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-2 text-xs font-semibold rounded-xl transition duration-150 ${
                  isActive
                    ? 'bg-[#FFBF00] text-[#202020] shadow-warm-sm border border-[#E5AC00]'
                    : 'bg-[#FFFFFF] dark:bg-[#1E1913] text-[#666666] dark:text-[#B8AF9F] hover:text-[#202020] dark:hover:text-[#FFFDF7] hover:bg-[#FBF3DF] dark:hover:bg-[#251F17] border border-[#EDE7D9] dark:border-[#332B20]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.map((tool) => (
            <Card
              key={tool.id}
              variant="interactive"
              onClick={() => setSelectedTool(tool)}
              className="flex flex-col justify-between group hover:border-[#FFBF00] transition-all duration-200"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div
                    className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${getCategoryBadgeClass(
                      tool.category
                    )}`}
                  >
                    {getCategoryIcon(tool.category)}
                  </div>
                  {tool.isPopular && (
                    <Badge variant="lemon" size="sm">
                      Popular
                    </Badge>
                  )}
                </div>
                <CardTitle className="group-hover:text-[#FF7900] transition-colors">
                  {tool.name}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {tool.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center justify-between pt-3.5 border-t border-[#EDE7D9] dark:border-[#332B20] text-xs">
                  <div className="flex items-center gap-1 text-[11px] font-mono text-[#666666] dark:text-[#B8AF9F]">
                    {tool.fileTypes.slice(0, 3).join(' ')}
                    {tool.fileTypes.length > 3 && ` +${tool.fileTypes.length - 3}`}
                  </div>
                  <span className="text-xs font-semibold text-[#FF7900] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {tool.isAvailable ? 'Inspect' : 'Details'} <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-12 rounded-2xl border border-dashed border-[#EDE7D9] dark:border-[#332B20] bg-[#FFFFFF] dark:bg-[#1E1913] p-8 space-y-2">
            <h3 className="text-base font-bold text-[#202020] dark:text-[#FFFDF7]">No matching tools found</h3>
            <p className="text-xs text-[#666666] dark:text-[#B8AF9F]">
              Try adjusting your category filter or search query "{searchQuery}".
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="mt-2"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </section>

      {/* 3. ASYMMETRIC CURATED SHOWCASES (AVOIDING REPETITIVE 3-COLUMN CARDS) */}
      <div className="space-y-8">
        {/* Showcase Banner 1: Batch Processing Studio */}
        <section className="relative overflow-hidden rounded-3xl border border-[#EDE7D9] dark:border-[#332B20] bg-[#FFFFFF] dark:bg-[#1E1913] p-6 sm:p-10 shadow-warm-card">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-4">
              <Badge variant="coral" size="md">
                Bulk Workflow Engine
              </Badge>
              <h3 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-[#202020] dark:text-[#FFFDF7]">
                Batch Processing Studio: Multi-File Automation
              </h3>
              <p className="text-xs sm:text-sm text-[#666666] dark:text-[#B8AF9F] leading-relaxed max-w-xl">
                Tired of converting files one-by-one? Upload multiple images and PDFs simultaneously. Choose compression parameters, resize settings, or format transcoding, and download everything as a single consolidated ZIP archive.
              </p>
              <div className="pt-2">
                <Button
                  variant="accent"
                  size="md"
                  onClick={() => navigate('/batch')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Launch Batch Studio
                </Button>
              </div>
            </div>

            <div className="md:col-span-5 bg-[#F8F5EE] dark:bg-[#17130E] border border-[#EDE7D9] dark:border-[#332B20] rounded-2xl p-5 space-y-3">
              <div className="text-xs font-bold text-[#202020] dark:text-[#FFFDF7] uppercase tracking-wider flex items-center justify-between">
                <span>Supported Bulk Actions</span>
                <span className="text-[#FF7900] font-semibold">ZIP Output</span>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Bulk Image Compression & Resizing', badge: 'JPG, PNG, WebP' },
                  { label: 'Multi-Document PDF Compression', badge: 'QPDF Engine' },
                  { label: 'Format Transcoding & Archive Staging', badge: 'Single ZIP' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#FFFFFF] dark:bg-[#1E1913] border border-[#EDE7D9] dark:border-[#332B20] flex items-center justify-between text-xs"
                  >
                    <span className="text-[#202020] dark:text-[#FFFDF7] font-medium">{item.label}</span>
                    <span className="font-mono text-[#FF7900] bg-[#FFF1E5] dark:bg-[#2E1F14] px-2 py-0.5 rounded text-[11px] font-semibold border border-[#FFC699]/60 dark:border-[#52331C]">
                      {item.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Showcase Banner 2: Target-Size Compression Engine */}
        <section className="relative overflow-hidden rounded-3xl border border-[#EDE7D9] dark:border-[#4A3D2A] bg-[#FBF3DF] dark:bg-[#251F17] p-6 sm:p-10 shadow-warm-card">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-4">
              <Badge variant="amber" size="md">
                Government & Exam Compliant
              </Badge>
              <h3 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-[#202020] dark:text-[#FFFDF7]">
                Target-Size Compressor: Strict Byte Ceiling Convergence
              </h3>
              <p className="text-xs sm:text-sm text-[#202020]/80 dark:text-[#FFFDF7]/80 leading-relaxed max-w-xl">
                Application portals, job boards, and universities often enforce rigid file ceilings (e.g. strict 500 KB or 1 MB). Our iterative algorithm converges your PDF or image to land safely just under your required limit without severe artifact distortion.
              </p>
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/target-compressor')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Open Target Compressor
                </Button>
              </div>
            </div>

            <div className="md:col-span-5 bg-[#FFFFFF] dark:bg-[#1E1913] border border-[#E8C570] dark:border-[#4A3D2A] rounded-2xl p-5 space-y-3 shadow-warm-sm">
              <div className="text-xs font-bold text-[#202020] dark:text-[#FFFDF7] uppercase tracking-wider flex items-center justify-between">
                <span>Standard Ceiling Presets</span>
                <span className="text-[#FF7900] font-semibold">Adaptive Tuning</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '200 KB', desc: 'Job Portals & Resumes' },
                  { label: '500 KB', desc: 'Govt & Exam Portals' },
                  { label: '1 MB', desc: 'Standard Email Cap' },
                  { label: '2 MB', desc: 'Document Vaults' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => navigate('/target-compressor')}
                    className="p-2.5 rounded-xl bg-[#F8F5EE] dark:bg-[#17130E] border border-[#EDE7D9] dark:border-[#332B20] hover:border-[#FFBF00] text-left transition-colors cursor-pointer group"
                  >
                    <div className="font-bold text-xs text-[#202020] dark:text-[#FFFDF7] group-hover:text-[#FF7900] transition">
                      {preset.label}
                    </div>
                    <div className="text-[10px] text-[#666666] dark:text-[#B8AF9F] mt-0.5">
                      {preset.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 4. HOW FILORO WORKS: NUMBERED 4-STEP EDITORIAL JOURNEY */}
      <section id="how-it-works" className="scroll-mt-20 space-y-8 pt-4">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge variant="champagne" size="md">
            Direct & Transparent
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-[#202020] dark:text-[#FFFDF7]">
            How Filoro Works
          </h2>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-[#B8AF9F]">
            Straightforward local processing executed without unnecessary third-party hops or persistent databases.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <Card className="relative overflow-hidden group hover:border-[#FFBF00]">
            <CardHeader>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#FBF3DF] dark:bg-[#251F17] border border-[#F2CF7E] dark:border-[#4A3D2A] flex items-center justify-center text-[#202020] dark:text-[#FFFDF7]">
                  <Upload className="w-5 h-5 text-[#FF7900]" />
                </div>
                <span className="text-3xl font-display font-black text-[#F2CF7E] outline-numeral">01</span>
              </div>
              <CardTitle>1. Select or Drop</CardTitle>
              <CardDescription>
                Choose your document or drag it directly onto the tool dropzone.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Step 2 */}
          <Card className="relative overflow-hidden group hover:border-[#FFBF00]">
            <CardHeader>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#FBF3DF] dark:bg-[#251F17] border border-[#F2CF7E] dark:border-[#4A3D2A] flex items-center justify-center text-[#202020] dark:text-[#FFFDF7]">
                  <SlidersHorizontal className="w-5 h-5 text-[#FF7900]" />
                </div>
                <span className="text-3xl font-display font-black text-[#F2CF7E] outline-numeral">02</span>
              </div>
              <CardTitle>2. Set Parameters</CardTitle>
              <CardDescription>
                Configure target file size, compression ratio, page subsets, or format options.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Step 3 */}
          <Card className="relative overflow-hidden group hover:border-[#FFBF00]">
            <CardHeader>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#FBF3DF] dark:bg-[#251F17] border border-[#F2CF7E] dark:border-[#4A3D2A] flex items-center justify-center text-[#202020] dark:text-[#FFFDF7]">
                  <Clock className="w-5 h-5 text-[#FF7900]" />
                </div>
                <span className="text-3xl font-display font-black text-[#F2CF7E] outline-numeral">03</span>
              </div>
              <CardTitle>3. Local Job Run</CardTitle>
              <CardDescription>
                The Node.js Express backend executes your conversion in an isolated temporary folder.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Step 4 */}
          <Card className="relative overflow-hidden group hover:border-[#FFBF00]">
            <CardHeader>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#FBF3DF] dark:bg-[#251F17] border border-[#F2CF7E] dark:border-[#4A3D2A] flex items-center justify-center text-[#202020] dark:text-[#FFFDF7]">
                  <Download className="w-5 h-5 text-[#FF7900]" />
                </div>
                <span className="text-3xl font-display font-black text-[#F2CF7E] outline-numeral">04</span>
              </div>
              <CardTitle>4. Download & Sweep</CardTitle>
              <CardDescription>
                Download your output file. Temporary staging files are unlinked automatically.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* 5. PRIVACY & ARCHITECTURE COMMITMENT: DEEP CHARCOAL CONTRAST BREAK (#242018) */}
      <section
        id="privacy"
        className="scroll-mt-20 rounded-3xl border border-[#EDE7D9] dark:border-[#332B20] bg-[#242018] dark:bg-[#120F0A] p-8 sm:p-12 shadow-warm-elevated space-y-8 text-[#EDE7D9]"
      >
        <div className="max-w-2xl space-y-3">
          <Badge variant="lemon" size="md" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            Transparent Engineering Policy
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-[#FFFDF7]">
            Privacy by Architecture: How We Handle Your Files
          </h2>
          <p className="text-xs sm:text-sm text-[#EDE7D9]/80 leading-relaxed">
            Files are temporarily processed on our server and automatically deleted after processing. We believe in complete transparency and do not make exaggerated claims like "100% secure," but we follow disciplined file lifecycle engineering:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-[#2D281F] dark:bg-[#1B1611] border border-[#EDE7D9]/15 dark:border-[#332B20] space-y-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFBF00]/15 border border-[#FFBF00]/30 flex items-center justify-center text-[#FFBF00] shadow-warm-sm">
              <Clock className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#FFFDF7]">Temporary Local Staging</h4>
            <p className="text-xs text-[#EDE7D9]/75 leading-relaxed">
              Files are streamed directly into an isolated disk folder strictly for the duration needed to run the tool.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#2D281F] dark:bg-[#1B1611] border border-[#EDE7D9]/15 dark:border-[#332B20] space-y-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF7900]/15 border border-[#FF7900]/30 flex items-center justify-center text-[#FF7900] shadow-warm-sm">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#FFFDF7]">Zero Cloud Retention</h4>
            <p className="text-xs text-[#EDE7D9]/75 leading-relaxed">
              We do not persist files into cloud S3 buckets, object stores, or document databases. Zero files are kept long-term.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#2D281F] dark:bg-[#1B1611] border border-[#EDE7D9]/15 dark:border-[#332B20] space-y-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFE642]/15 border border-[#FFE642]/30 flex items-center justify-center text-[#FFE642] shadow-warm-sm">
              <Trash2 className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#FFFDF7]">Automated File Sweeper</h4>
            <p className="text-xs text-[#EDE7D9]/75 leading-relaxed">
              Files are unlinked after download or cleared by the background directory sweeper once their 30-min TTL expires.
            </p>
          </div>
        </div>
      </section>

      {/* Global Modals */}
      <ToolPreviewModal
        tool={selectedTool}
        isOpen={Boolean(selectedTool)}
        onClose={() => setSelectedTool(null)}
      />

      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSelectTool={(tool) => {
          if (tool.isAvailable && tool.route) {
            navigate(tool.route);
          } else {
            setSelectedTool(tool);
          }
        }}
      />

      <ToolSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectTool={(tool) => {
          if (tool.isAvailable && tool.route) {
            navigate(tool.route);
          } else {
            setSelectedTool(tool);
          }
        }}
      />
    </div>
  );
};

export default HomePage;
