import React, { useState } from 'react';
import {
  Download,
  Trash2,
  Search,
  Upload,
  ArrowRight,
  Check,
  FileCheck,
} from 'lucide-react';
import {
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Modal,
  useToast,
  Spinner,
  Skeleton,
  DotsLoading,
  FileCard,
  Progress,
  EmptyState,
  ErrorState,
  SuccessState,
  FileUpload,
} from '../components/ui';

export const DesignSystemPage: React.FC = () => {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [progressVal, setProgressVal] = useState(65);

  const triggerLoading = () => {
    setBtnLoading(true);
    setTimeout(() => setBtnLoading(false), 2000);
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl border border-[#EDE7D9] dark:border-[#332B20] bg-[#FFFFFF] dark:bg-[#1E1913] p-6 sm:p-10 shadow-warm-card backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <Badge variant="brand" size="md">
            Design System
          </Badge>
          <Badge variant="emerald" size="md" dot>
            Production Ready
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold uppercase tracking-tight text-[#202020] dark:text-[#FFFDF7]">
          Filoro Design System
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#666666] dark:text-[#B8AF9F] max-w-2xl leading-relaxed">
          A colorful, modern, premium, and responsive visual component library built for file utilities.
          Featuring subtle micro-interactions, accessible primitives, and consistent styling tokens.
        </p>
      </div>

      {/* 1. Color Palette */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Color System</h2>
          <p className="text-xs text-slate-500">Carefully tuned palette for brand identity, file categories, and statuses.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex flex-col gap-2">
            <div className="h-12 rounded-xl bg-brand-500 shadow-sm" />
            <div>
              <p className="text-xs font-bold text-slate-800">Electric Indigo</p>
              <p className="text-[11px] text-slate-500 font-mono">#6366f1 (Primary)</p>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex flex-col gap-2">
            <div className="h-12 rounded-xl bg-coral-500 shadow-sm" />
            <div>
              <p className="text-xs font-bold text-slate-800">Warm Coral</p>
              <p className="text-[11px] text-slate-500 font-mono">#f43f5e (PDF/Accent)</p>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex flex-col gap-2">
            <div className="h-12 rounded-xl bg-emerald-500 shadow-sm" />
            <div>
              <p className="text-xs font-bold text-slate-800">Emerald</p>
              <p className="text-[11px] text-slate-500 font-mono">#10b981 (Success)</p>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex flex-col gap-2">
            <div className="h-12 rounded-xl bg-amber-500 shadow-sm" />
            <div>
              <p className="text-xs font-bold text-slate-800">Amber</p>
              <p className="text-[11px] text-slate-500 font-mono">#f59e0b (Warning/Zip)</p>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex flex-col gap-2">
            <div className="h-12 rounded-xl bg-sky-500 shadow-sm" />
            <div>
              <p className="text-xs font-bold text-slate-800">Sky Cyan</p>
              <p className="text-[11px] text-slate-500 font-mono">#0ea5e9 (Media/Info)</p>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex flex-col gap-2">
            <div className="h-12 rounded-xl bg-slate-800 shadow-sm" />
            <div>
              <p className="text-xs font-bold text-slate-800">Slate Charcoal</p>
              <p className="text-[11px] text-slate-500 font-mono">#1e293b (Body Text)</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Buttons */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Buttons</h2>
          <p className="text-xs text-slate-500">Accessible buttons with hover lift, tap scale, loading indicators, and icons.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Button Variants & Sizes</CardTitle>
            <CardDescription>Hover and click to preview Framer Motion micro-interactions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="accent">Accent Action</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger" leftIcon={<Trash2 className="w-4 h-4" />}>
                Delete
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
              <Button size="sm" variant="primary">
                Small (sm)
              </Button>
              <Button size="md" variant="primary">
                Medium (md)
              </Button>
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Large (lg)
              </Button>
              <Button
                variant="primary"
                isLoading={btnLoading}
                onClick={triggerLoading}
                leftIcon={<Upload className="w-4 h-4" />}
              >
                {btnLoading ? 'Processing...' : 'Click for Loading State'}
              </Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 3. Form Inputs & Select */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Form Controls</h2>
          <p className="text-xs text-slate-500">Accessible inputs and custom styled select dropdowns.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Input Component</CardTitle>
              <CardDescription>Includes labels, helper hints, error validation, and icons.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Tool Query"
                placeholder="Search tools (e.g. compress pdf, resize image)..."
                leftIcon={<Search className="w-4 h-4" />}
                hint="Type to search available file tools."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />

              <Input
                label="Validated Input (Try typing)"
                placeholder="Enter file naming prefix..."
                error={inputError}
                onChange={(e) => {
                  if (e.target.value.length < 3) {
                    setInputError('Prefix must be at least 3 characters.');
                  } else {
                    setInputError('');
                  }
                }}
                hint="Must be at least 3 characters long."
              />

              <Input label="Disabled State" value="fileora_locked_value.config" disabled />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Dropdown</CardTitle>
              <CardDescription>Clean styled select menus with custom arrow indicators.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Target Conversion Format"
                hint="Choose the file format you want to produce."
                options={[
                  { value: 'pdf', label: 'PDF Document (.pdf)' },
                  { value: 'png', label: 'PNG Image (.png)' },
                  { value: 'webp', label: 'WebP Modern Image (.webp)' },
                  { value: 'zip', label: 'ZIP Archive (.zip)' },
                ]}
              />

              <Select
                label="Quality Preset"
                error="High quality preset requires smaller image size."
                options={[
                  { value: 'low', label: 'Maximum Compression (Smallest Size)' },
                  { value: 'balanced', label: 'Balanced (Recommended)' },
                  { value: 'high', label: 'High Fidelity (Minimal Loss)' },
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 4. Badges & Tags */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Badges & Tags</h2>
          <p className="text-xs text-slate-500">Color-coded badges for formats, statuses, and tags.</p>
        </div>

        <Card>
          <CardContent className="pt-5 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand" dot>
                Brand Indigo
              </Badge>
              <Badge variant="coral" dot>
                Coral PDF
              </Badge>
              <Badge variant="emerald" dot>
                Emerald Success
              </Badge>
              <Badge variant="amber" dot>
                Amber Warning
              </Badge>
              <Badge variant="sky" dot>
                Sky Media
              </Badge>
              <Badge variant="neutral">Neutral File</Badge>
              <Badge variant="outline">Outline Badge</Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
              <Badge variant="brand" size="sm">
                PDF
              </Badge>
              <Badge variant="brand" size="sm">
                PNG
              </Badge>
              <Badge variant="coral" size="sm">
                DOCX
              </Badge>
              <Badge variant="amber" size="sm">
                ZIP
              </Badge>
              <Badge variant="emerald" size="sm" icon={<Check className="w-3 h-3" />}>
                Ready
              </Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 5. Cards & Surfaces */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Cards & Surfaces</h2>
          <p className="text-xs text-slate-500">Structured container cards with crisp elevation and borders.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Standard Card</CardTitle>
              <CardDescription>Default surface for content blocks and settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600">Clean white surface with 1px border and soft drop shadow.</p>
            </CardContent>
            <CardFooter>
              <span className="text-xs text-slate-400">Card Footer</span>
            </CardFooter>
          </Card>

          <Card variant="interactive">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Interactive Card</CardTitle>
                <ArrowRight className="w-4 h-4 text-brand-500" />
              </div>
              <CardDescription>Hover over this card to preview the subtle lift and glow.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600">Perfect for tool cards, selection tiles, and clickable items.</p>
            </CardContent>
            <CardFooter>
              <Badge variant="brand" size="sm">
                Clickable
              </Badge>
            </CardFooter>
          </Card>

          <Card variant="accent">
            <CardHeader>
              <CardTitle>Accent Top Gradient</CardTitle>
              <CardDescription>Featured cards with colorful top line indicator.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-600">Used for highlighted tools, active operations, or alerts.</p>
            </CardContent>
            <CardFooter>
              <span className="text-xs text-brand-600 font-medium">Featured Style</span>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* 6. File Cards */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">File Cards</h2>
          <p className="text-xs text-slate-500">Specialized cards for displaying selected, uploading, and processed files.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FileCard
            name="Quarterly_Financial_Report.pdf"
            size={2458000}
            extension="pdf"
            status="idle"
            onRemove={() => toast.info('File removed', 'Quarterly_Financial_Report.pdf was unselected.')}
          />
          <FileCard
            name="hero_banner_ultra_highres.png"
            size={8740000}
            extension="png"
            status="uploading"
            progress={68}
          />
          <FileCard
            name="dataset_archive_bundle.zip"
            size={45200000}
            extension="zip"
            status="processing"
            progress={100}
          />
          <FileCard
            name="corrupted_upload_sample.docx"
            size={120000}
            extension="docx"
            status="error"
            errorMessage="File validation failed: magic byte signature mismatch."
            onRemove={() => toast.error('Removed invalid file')}
          />
        </div>
      </section>

      {/* 6.5 Interactive File Upload */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">File Upload Component</h2>
          <p className="text-xs text-slate-500">
            Interactive drag & drop with live backend validation (magic bytes, size ceiling, and temporary staging).
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Live Upload Dropzone</CardTitle>
            <CardDescription>
              Drop any PDF, Image, Document, or Archive file to test client validation and backend verification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              maxSizeMB={50}
              onUploadSuccess={(meta) =>
                toast.success('File Verified', `${meta.originalName} (${meta.fileId.slice(0, 8)}) staged successfully.`)
              }
              onUploadError={(err) => toast.error('Upload Rejected', err)}
            />
          </CardContent>
        </Card>
      </section>
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Progress & Loading Indicators</h2>
          <p className="text-xs text-slate-500">Accessible determinate and indeterminate progress bars and spinners.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Linear Progress Bars</CardTitle>
              <CardDescription>Determinate and animated indeterminate bars.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Progress
                value={progressVal}
                label="Conversion Progress"
                showValue
                variant="brand"
              />
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setProgressVal(Math.max(0, progressVal - 15))}>
                  - 15%
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setProgressVal(Math.min(100, progressVal + 15))}>
                  + 15%
                </Button>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <Progress indeterminate label="Server Processing (Indeterminate)" variant="coral" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spinners & Skeletons</CardTitle>
              <CardDescription>Component-level loading states.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Spinner size="sm" variant="brand" />
                <Spinner size="md" variant="coral" />
                <Spinner size="lg" variant="brand" />
                <div className="h-6 w-px bg-slate-200 mx-2" />
                <DotsLoading />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-600">Skeleton Loading Placeholder</p>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 8. Toasts & Modal Dialog */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Interactive Overlays & Notifications</h2>
          <p className="text-xs text-slate-500">Modals with focus management and toast notifications with auto-dismiss.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Trigger Toasts & Modals</CardTitle>
            <CardDescription>Test interactive feedback notifications.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => toast.success('Operation Successful', 'Your file was converted cleanly.')}
            >
              Success Toast
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.error('Upload Failed', 'The file exceeded the maximum size limit of 50MB.')}
            >
              Error Toast
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.warning('High Server Load', 'Processing may take slightly longer than usual.')}
            >
              Warning Toast
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.info('New Feature Ready', 'Batch conversion support is coming soon.')}
            >
              Info Toast
            </Button>

            <div className="h-4 w-px bg-slate-200 mx-1" />

            <Button variant="primary" onClick={() => setModalOpen(true)}>
              Open Interactive Modal
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* 9. Feedback States (Empty, Error, Success) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">System Feedback States</h2>
          <p className="text-xs text-slate-500">Consistent full-component states for empty directories, errors, and completions.</p>
        </div>

        <div className="space-y-4">
          <EmptyState
            title="No files chosen yet"
            description="Drag and drop your documents here, or click to browse files from your computer."
            action={
              <Button variant="primary" leftIcon={<Upload className="w-4 h-4" />}>
                Browse Files
              </Button>
            }
          />

          <ErrorState
            title="Processing Timed Out"
            message="The conversion engine was unable to finish within the 30-second window. Please ensure the file is not password-protected and try again."
            onRetry={() => toast.info('Retrying operation...')}
          />

          <SuccessState
            title="File Compression Complete"
            message="Your PDF has been reduced by 64% without noticeable loss of quality. File is ready to download."
            action={
              <Button
                variant="accent"
                size="sm"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={() => toast.success('Download initiated')}
              >
                Download PDF (840 KB)
              </Button>
            }
          />
        </div>
      </section>

      {/* Modal Instance */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Confirm File Reset"
        description="This action will clear all currently staged files and discard temporary settings."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => {
                setModalOpen(false);
                toast.success('Workspace Cleared', 'All temporary files have been reset.');
              }}
            >
              Confirm Reset
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-slate-600">
          <p>
            Are you sure you want to reset your file workspace? Any unconverted documents in the upload
            queue will need to be re-uploaded.
          </p>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>Local file security: temporary files are wiped automatically.</span>
          </div>
        </div>
      </Modal>
    </div>
  );
};


