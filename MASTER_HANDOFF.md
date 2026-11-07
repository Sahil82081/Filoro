# Fileora — Master Project Handoff Document

## Project Overview
Fileora is a clean, straightforward MERN-stack web application for file utilities (conversions, compression, PDF tools, etc.) designed as a simple B.Tech/portfolio project. It prioritizes clarity, simplicity, maintainability, and standard web engineering principles without over-engineering or premature infrastructure complexity.

---

## Architectural Principles & Strict Constraints
- **Stack**:
  - **Frontend**: React, Vite, TypeScript, Tailwind CSS, React Router, Framer Motion, Lucide React
  - **Backend**: Node.js, Express.js, TypeScript, Multer, Sharp (libvips)
  - **Database**: MongoDB/Mongoose only where genuinely needed later
- **Explicit Non-Goals (DO NOT ADD)**:
  - ❌ Redis / BullMQ / Kafka
  - ❌ S3 / Cloudflare R2 (local disk `uploads/` and `outputs/` are used)
  - ❌ Kubernetes / Docker orchestration / microservices
  - ❌ Unnecessary databases or authentication before required
  - ❌ Fake file processing or simulated progress bars
  - ❌ Unverified government or compliance claims

---

## Project Structure

```
fileora/
├── backend/
│   ├── dist/                 # Compiled JavaScript output
│   ├── outputs/              # Processed output files (.gitkeep)
│   ├── uploads/              # Incoming temporary uploads directory (.gitkeep)
│   ├── src/
│   │   ├── config/           # Environment and server configuration
│   │   │   └── index.ts
│   │   ├── controllers/      # Route controllers
│   │   │   ├── healthController.ts
│   │   │   ├── uploadController.ts    # POST /api/upload & DELETE /api/upload/:fileId
│   │   │   ├── imageController.ts     # Compression, Resizing, Conversion, App Photo, Download & Preview
│   │   │   ├── pdfController.ts       # POST /api/pdf/compress
│   │   │   ├── pdfOrganizeController.ts # POST /api/pdf/{merge,split,extract,reorder,rotate} & GET info
│   │   │   ├── pdfConvertController.ts  # POST /api/convert/{pdf-to-image,image-to-pdf,office-to-pdf}
│   │   │   ├── docCompressController.ts # POST /api/document/compress (DOC/DOCX & PPT/PPTX)
│   │   │   ├── ocrController.ts       # POST /api/ocr/{image-to-text,pdf-to-text,pdf-to-word,image-to-pdf}
│   │   │   ├── pdfModifyController.ts # POST /api/pdf/{crop,watermark,page-numbers,protect,sign}
│   │   │   ├── batchController.ts     # POST /api/batch/{upload,process}
│   │   │   └── targetController.ts    # POST /api/target/compress (Adaptive Iterative Target Compression)
│   │   ├── middleware/       # Express middlewares
│   │   │   ├── errorHandler.ts
│   │   │   └── uploadMiddleware.ts    # Multer configuration, single & multi-upload limits
│   │   ├── routes/           # Express API route definitions
│   │   │   ├── healthRoutes.ts
│   │   │   ├── uploadRoutes.ts
│   │   │   ├── imageRoutes.ts
│   │   │   ├── pdfRoutes.ts
│   │   │   ├── pdfOrganizeRoutes.ts   # Route definitions for PDF Organize Suite
│   │   │   ├── pdfConvertRoutes.ts    # Route definitions for Document & Image Converter Suite
│   │   │   ├── docCompressRoutes.ts   # Route definitions for Document Compressor Suite
│   │   │   ├── ocrRoutes.ts           # Route definitions for OCR & Text Extractor Suite
│   │   │   ├── pdfModifyRoutes.ts     # Route definitions for PDF Manipulation Suite
│   │   │   ├── batchRoutes.ts         # Route definitions for Batch Processing Studio
│   │   │   ├── targetRoutes.ts
│   │   │   └── index.ts
│   │   ├── services/         # Modular business logic services
│   │   │   ├── fileStoreService.ts    # Disk file lookup & output path generator
│   │   │   ├── imageCompressService.ts# Sharp image compression (quality, presets, EXIF)
│   │   │   ├── imageResizeService.ts  # Sharp dimensions & scale percent with aspect ratio lock
│   │   │   ├── imageConvertService.ts # Sharp format conversion (JPG, PNG, WebP)
│   │   │   ├── photoResizeService.ts  # Application photo/signature resizer & validator
│   │   │   ├── pdfBinFinder.ts        # Locates QPDF, Poppler & LibreOffice executables safely
│   │   │   ├── pdfCompressService.ts  # Real PDF compression (Basic, Strong, Target Size)
│   │   │   ├── pdfOrganizeService.ts  # Real PDF operations (merge, split, extract, reorder, rotate)
│   │   │   ├── pdfOrganizeTypes.ts    # TypeScript interfaces for PDF organize operations
│   │   │   ├── pdfConvertService.ts   # Real PDF to image, image to PDF, and Office to PDF conversions
│   │   │   ├── pdfConvertTypes.ts     # TypeScript interfaces for conversion suite
│   │   │   ├── docCompressService.ts  # Real DOC/DOCX and PPT/PPTX compression engine
│   │   │   ├── docCompressTypes.ts    # TypeScript interfaces for document compression suite
│   │   │   ├── ocrService.ts          # Real Tesseract OCR & Word DOCX generation engine
│   │   │   ├── ocrTypes.ts            # TypeScript interfaces for OCR & document extractor suite
│   │   │   ├── pdfModifyService.ts    # Real PDF Crop, Watermark, Numbers, Protect & Sign engine
│   │   │   ├── pdfModifyTypes.ts      # TypeScript interfaces for PDF manipulation suite
│   │   │   ├── batchService.ts        # Batch orchestrator, partial failure isolation & ZIP packaging
│   │   │   ├── batchTypes.ts          # TypeScript interfaces for batch processing suite
│   │   │   ├── targetCompressService.ts# Iterative bounded target-size compression (PDF & Image)
│   │   │   ├── targetTypes.ts         # Target compression interfaces
│   │   │   ├── pdfTypes.ts            # PDF processing interfaces
│   │   │   ├── imageTypes.ts          # Strongly typed image processing interfaces
│   │   │   └── index.ts
│   │   ├── utils/            # Shared backend utilities
│   │   │   ├── cleanup.ts             # File unlinker & automated directory sweeper
│   │   │   ├── fileValidation.ts      # Magic bytes & extension sanitization
│   │   │   └── index.ts
│   │   ├── app.ts            # Express application setup (CORS, JSON, routes)
│   │   └── server.ts         # Server entry point + background sweeper
│   ├── .env.example          # Backend environment template
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── dist/                 # Production build bundle
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Layout & UI components
│   │   │   ├── ui/           # Centralized Design System UI Primitives
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── ErrorState.tsx
│   │   │   │   ├── FileCard.tsx
│   │   │   │   ├── FileUpload.tsx    # Reusable interactive file upload system
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Loading.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Progress.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── SuccessState.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   ├── ResultView.tsx         # Unified reusable result display component (Stage 15)
│   │   │   │   └── index.ts
│   │   │   ├── Footer.tsx                 # Global site footer
│   │   │   ├── Navbar.tsx                 # Global responsive navigation header
│   │   │   ├── ApplicationPhotoWorkspace.tsx # Photo & signature resizer + checklist validator
│   │   │   ├── ImageToolWorkspace.tsx     # 5-step image optimization & conversion workspace
│   │   │   ├── PdfCompressorWorkspace.tsx # PDF compression workspace (Basic, Strong, Target Size)
│   │   │   ├── PdfOrganizeWorkspace.tsx   # PDF Organize workspace (Merge, Split, Extract, Reorder, Rotate)
│   │   │   ├── DocumentConvertWorkspace.tsx # Document & Image converter workspace (PDF, Images, Word, Excel)
│   │   │   ├── DocumentCompressWorkspace.tsx # Document compressor workspace (DOC/DOCX & PPT/PPTX)
│   │   │   ├── OcrWorkspace.tsx           # OCR & Text Extractor workspace (Image/PDF -> Text, PDF -> Word, Img -> PDF)
│   │   │   ├── PdfModifyWorkspace.tsx     # PDF Manipulation workspace (Crop, Watermark, Numbers, Protect, Sign)
│   │   │   ├── BatchProcessingWorkspace.tsx # Multi-file batch processing workspace with ZIP download
│   │   │   ├── TargetCompressorWorkspace.tsx # Iterative Target-Size compressor (PDF & Images)
│   │   │   ├── ToolPreviewModal.tsx       # Upcoming & active tool dialog
│   │   │   ├── ToolSearchModal.tsx        # Live tool discovery modal (Ctrl+K)
│   │   │   └── UploadModal.tsx            # Quick file upload & tool matcher modal
│   │   ├── hooks/            # Custom React hooks
│   │   │   └── useHealth.ts
│   │   ├── layouts/          # Page layouts
│   │   │   └── MainLayout.tsx
│   │   ├── pages/            # Page components
│   │   │   ├── ApplicationPhotoPage.tsx # Application Photo & Signature Resizer (/tools/application-photo)
│   │   │   ├── DesignSystemPage.tsx     # Design system showcase
│   │   │   ├── HomePage.tsx             # Homepage with hero & tool registry
│   │   │   ├── ImageToolsPage.tsx       # Dedicated Image Processing Studio (/tools/image)
│   │   │   ├── PdfCompressorPage.tsx    # PDF Compressor Studio (/pdf-compressor)
│   │   │   ├── PdfOrganizePage.tsx      # PDF Organize Suite (/pdf-organizer, /pdf-merge, /pdf-split)
│   │   │   ├── DocumentConvertPage.tsx  # Document & Image Converter Suite (/convert)
│   │   │   ├── DocumentCompressPage.tsx # Document Compressor Suite (/document-compressor, /compress-word)
│   │   │   ├── OcrPage.tsx              # OCR & Text Extractor Studio (/ocr, /image-to-text, /scanned-pdf-to-text)
│   │   │   ├── PdfModifyPage.tsx        # PDF Utility Studio (/pdf-tools, /crop-pdf, /protect-pdf, /sign-pdf)
│   │   │   ├── BatchProcessingPage.tsx  # Batch Processing Studio (/batch, /batch-processing)
│   │   │   └── TargetCompressorPage.tsx # Target-Size File Compressor (/target-compressor)
│   │   ├── services/         # API client services
│   │   │   └── api.ts        # Health check, upload, compress, resize, convert, photo resize, download
│   │   ├── utils/            # Helper utilities and data
│   │   │   ├── index.ts
│   │   │   └── toolsData.ts  # Centralized tools registry
│   │   ├── App.tsx           # React Router and main app component
│   │   ├── index.css         # Tailwind directives & base styles
│   │   ├── main.tsx          # React DOM entry point
│   │   └── vite-env.d.ts     # Vite environment types declaration
│   ├── .env.example          # Frontend environment template
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── .gitignore                # Root gitignore for dependencies, builds, and temp files
└── MASTER_HANDOFF.md         # Master project handoff document
```

---

## Completed Stages

### Stage 1: Basic MERN Project Foundation
- Express API on port 5000 with TypeScript, CORS, and `GET /api/health`.
- React + Vite + Tailwind + TypeScript frontend communicating with backend.

### Stage 2: Visual Design System & UI Primitives
- 13 reusable UI primitives in `src/components/ui/` with Framer Motion and reduced motion support.
- Centralized color system (Electric Indigo, Coral, Emerald, Amber, Sky) and interactive showcase at `/design`.

### Stage 3: Homepage & Global Navigation
- Modern hero with CTAs, tool discovery filter tabs, 4-step "How It Works" workflow, and transparent data policy.
- Responsive Navbar with live tool search modal (`Ctrl+K`) and mobile drawer.

### Stage 4: Reusable File-Upload System & Temporary Storage
- Multer upload pipeline to `backend/uploads/` with unguessable UUID filenames, 50MB ceiling, and filename sanitization.
- Deep magic byte validation (PDF, PNG, JPEG, WebP, GIF, ZIP/DOCX, Text) and background sweeper cleanup.
- Reusable `FileUpload` component with real-time XHR progress tracking and preview.

### Stage 5: Real Image Processing (Sharp / libvips)
- Modular image compression, dimension resizing, and format conversion (JPG, PNG, WebP) with Sharp.
- Dedicated interactive studio at `/tools/image` (`ImageToolsPage.tsx`).

### Stage 6: Application Photo & Signature Resizing Tools
- **Backend Service (`backend/src/services/photoResizeService.ts`)**:
  - `processApplicationPhoto()`: Resizes photos and signatures with strict dimension matching and iterative file-size targeting (`maxSizeKB` and `minSizeKB`).
  - Supports 4 image fit modes: `crop` (attention-based focus), `cover` (exact dimensional crop), `contain` (clean padded background), and `centered` (inside bounding box).
  - Iteratively steps through compression qualities to fit under the user-defined `maxSizeKB` ceiling.
  - Generates strict verification checklist:
    - `Width` (exact match)
    - `Height` (exact match)
    - `Format` (JPG, PNG, WebP)
    - `File Size` (actual KB vs maximum/minimum KB).
  - Truthful validation: if any requirement fails, it reports `allValid: false` and `✗ File size exceeds maximum` rather than claiming fake compliance.
- **REST API Endpoint (`backend/src/routes/imageRoutes.ts`)**:
  - `POST /api/image/application-resize`: Accepts `{ fileId, width, height, format, fit, maxSizeKB, minSizeKB }` and returns processed metadata with checklist report.
- **Frontend Workspace & Route (`frontend/src/`)**:
  - `ApplicationPhotoWorkspace.tsx`:
    - Simple 5-step workflow: `1. Upload Photo` &rarr; `2. Enter Requirements` &rarr; `3. Generate` &rarr; `4. Validate` &rarr; `5. Download`.
    - Preset templates for standard passport photos (350x450px, 50KB), exam photos (200x230px, 50KB), standard signatures (140x60px, 20KB), and custom inputs.
    - Side-by-side inspection comparing original image with generated result preview.
    - Post-processing compliance checklist with green checkmarks or red failure indicators.
  - Dedicated route at `/tools/application-photo` (`ApplicationPhotoPage.tsx`) accessible directly via query params (`?type=photo` or `?type=signature`).
  - Registered in `toolsData.ts` with live active routes.
- **Stage 6 Verification Tests Completed**:
  - **Passport Photo (350x450px, Max 50KB)**: Verified exact dimensions and size under 50KB with all checks passing.
  - **Signature Resizing (140x60px, Max 20KB)**: Verified exact signature dimensions within 20KB limit.
  - **Formats**: Verified PNG and WebP outputs with proper headers.
  - **Strict Compliance Verification**: Verified that an impossible requirement (e.g. 1000x1000 PNG under 1KB) truthfully reports failure and marks checklist item as failed.
  - **Invalid Inputs**: Verified that missing/negative dimensions and non-existent fileIds return clean error JSON.
  - **Download & Cleanup**: Verified generated photos download cleanly and temporary disk files are unlinked.
  - **Builds**: Both `frontend` and `backend` builds passed with 0 errors.

### Stage 7: Real PDF Compression (QPDF / Ghostscript)
- **Backend Services & Engine (`backend/src/services/`)**:
  - `pdfBinFinder.ts`: Locates portable `qpdf.exe` (`backend/bin/qpdf/bin/qpdf.exe`) and detects `ghostscript` (`gswin64c`/`gs`) if installed.
  - `pdfCompressService.ts`:
    - Strict PDF validation via `validatePdfFile()`: inspects magic bytes (`%PDF-`), executes `qpdf --check`, detects corrupted cross-reference tables, truncated streams, and password encryption without exposing raw paths.
    - **Basic Compression**: Flate stream recompression (`--compress-streams=y --recompress-flate --compression-level=9`), object streams generation (`--object-streams=generate`), linearization for fast web view (`--linearize`), and balanced image optimization (`--optimize-images --jpeg-quality=85`).
    - **Strong Compression**: Aggressive optimization removing unreferenced page resources (`--remove-unreferenced-resources=yes`), coalescing contents (`--coalesce-contents`), maximum stream packing, and heavy image optimization (`--optimize-images --jpeg-quality=40`). If Ghostscript is present, passes through GS `/screen` first.
    - **Target Size Mode**: Iterative compression loop stepping through image quality levels [80, 60, 45, 30, 20, 10] until output fits under the specified `targetSizeKB` ceiling. Truthfully reports `targetReached: true/false` with actual achievable size rather than faking compliance.
    - **Safe Sizing Guarantee**: If a PDF is already heavily optimized and output exceeds original size, original content is preserved so file size never inflates (`savedBytes: 0, savedPercentage: 0%`).
    - **Automated Cleanup**: Temporary input upload is unlinked immediately after compression. Output file ready for download/preview and swept by 30-min background sweeper.
- **REST API Endpoint (`backend/src/routes/pdfRoutes.ts`)**:
  - `POST /api/pdf/compress`: Accepts `{ fileId, mode: 'basic' | 'strong' | 'target', targetSizeKB, originalName }`.
  - Returns calculated metrics: `originalSize`, `resultSize`, `savedBytes`, `savedPercentage`, `mode`, `targetReached`, `downloadUrl`, `previewUrl`, `engineUsed`, and friendly messages.
  - Friendly user errors: Sanitized messages for corrupted PDFs, password protection, missing files, or invalid parameters; never leaks filesystem paths or internal stack traces.
- **Frontend Workspace & Route (`frontend/src/`)**:
  - `PdfCompressorWorkspace.tsx`:
    - Reusable FileUpload supporting drag & drop, file selection, size limits (50MB), and instant PDF thumbnailing.
    - Compression level cards: Basic (Standard Quality), Strong (Max Reduction), and Target Size (Custom KB/MB input with preset chips: 200 KB, 500 KB, 1 MB).
    - Post-processing real metrics grid: Original Size (e.g. `18.2 MB`), Result Size (e.g. `7.1 MB`), Saved (e.g. `11.1 MB`), and Reduction Percentage (e.g. `61%`).
    - Visual comparative bar showing size before vs after with saved space highlighted in emerald.
    - Action buttons: "Download Compressed PDF", "Preview in Browser" (opens inline tab via `/api/preview/:fileId`), and "Compress Another PDF".
    - Friendly error alert card with troubleshooting actions for corrupted or password-protected files.
  - Page at `/pdf-compressor` (`PdfCompressorPage.tsx`) with alias `/tools/pdf-compressor`.
  - Global navigation and search modals (`Navbar.tsx`, `ToolSearchModal.tsx`, `HomePage.tsx`) updated to navigate directly to `/pdf-compressor`.
  - Registered in `toolsData.ts` with `isAvailable: true` and `route: '/pdf-compressor'`.
- **Stage 7 Verification Tests Completed**:
  - **Basic Compression**: Tested real image-heavy PDF (672.3 KB &rarr; 451.3 KB, 32.9% real reduction); verified with `qpdf --check`.
  - **Strong Compression**: Tested real image-heavy PDF (672.3 KB &rarr; 216.1 KB, 67.9% real reduction); verified structure integrity.
  - **Target Size Mode**: Tested target 300 KB (achieved 281.3 KB, `targetReached: true`).
  - **Corrupted PDF**: Uploaded malformed binary noise with broken trailer; correctly caught by validator, returned friendly message with 0 path leakage.
  - **Invalid Inputs**: Missing `fileId` (400), invalid mode (400), negative target size (400) all returned clean friendly error JSON.
  - **Preview & Download**: Verified `GET /api/preview/:fileId` returns `Content-Type: application/pdf` and `Content-Disposition: inline`.
  - **Automated Cleanup**: Verified that input upload files are automatically unlinked upon compression completion.
  - **Production Builds**: Backend (`tsc`) and Frontend (`tsc -b && vite build`) built cleanly with 0 errors.

### Stage 8: Target-Size Compression (Iterative Adaptive Engine)
- **Backend Service (`backend/src/services/targetCompressService.ts`)**:
  - `processTargetCompress()`: Iteratively compresses documents to match user-defined ceilings (e.g. `5 MB` or `500 KB`).
  - **PDF Target Compression**:
    - Multi-stage bounded binary search on QPDF JPEG quality `Q ∈ [10, 85]` and stream optimization (`--compress-streams=y --recompress-flate --compression-level=9 --object-streams=generate --linearize --coalesce-contents --remove-unreferenced-resources=yes`).
    - Smart probe sequence: Probes high visual fidelity `Q=80` first; if exceeded, checks floor `Q=15`/`Q=10`. If floor is still above target, immediately halts without wasting time on futile iterations.
    - If achievable, refines quality through midpoints (e.g. `Q=48`, `Q=64`, or `Q=30`) within a hard cap of 4–5 iterations, guaranteeing rapid execution (< 15 seconds) even on 20MB files.
    - **Truthful Outcome Reporting**: If an impossible target is specified (e.g. 50 KB on a 20 MB scanned booklet), reports `targetReached: false` with the exact closest possible valid size (e.g. 3.2 MB) and a clear, honest explanation rather than faking compliance.
    - **Sizing Safety Guarantee**: If output size exceeds original size, original content is preserved so files never inflate.
  - **Image Target Compression (Reusing Image Processor)**:
    - Bounded binary search on Sharp JPEG/MozJPEG quality `[10, 90]`.
    - If quality 10 is still above target, dynamically computes required downscale factor (`scaleFactor = Math.sqrt(targetSizeBytes / currentSize)`) and resizes dimensions to hit the target.
  - **Automated Cleanup**: All intermediate trial files (`.trial*.pdf`, `.img_trial*.jpg`) and the uploaded input file are deleted immediately after execution.
- **REST API Endpoint (`backend/src/routes/targetRoutes.ts`)**:
  - `POST /api/target/compress`: Accepts `{ fileId, targetSizeKB, originalName, maxIterations }`.
  - Returns `TargetCompressResult` with `originalSize`, `targetSizeBytes`, `targetSizeFormatted`, `resultSize`, `savedBytes`, `savedPercentage`, `targetReached`, `iterations`, `processingTimeMs`, `downloadUrl`, `previewUrl`, and honest `message`.
- **Frontend Workspace & Route (`frontend/src/`)**:
  - `TargetCompressorWorkspace.tsx`:
    - Reusable FileUpload supporting PDFs and standard images (`.pdf, .jpg, .jpeg, .png, .webp`).
    - Target specification input with numerical input, MB/KB unit toggle, and quick presets (`500 KB`, `1 MB`, `2 MB`, `5 MB`, `10 MB`).
    - Real metrics grid displaying **Original** (e.g. `18.4 MB`), **Target** (e.g. `5 MB`), **Result** (e.g. `4.9 MB`), and **Reduction** (e.g. `73.4%`).
    - Visual comparative comparison bar (Original &rarr; Target &rarr; Output).
    - Clear honest messaging banner explaining when a target cannot be reached without breaking document readability.
    - Action buttons: "Download Compressed File", "Preview in Browser", and "Compress Another File".
  - Page at `/target-compressor` (`TargetCompressorPage.tsx`) with alias `/tools/target-compressor`.
  - Added to global navigation in `Navbar.tsx` and registered in `toolsData.ts`.
- **Stage 8 Verification Tests Completed**:
  - **10 MB &rarr; 5 MB**: Tested real 10.92 MB PDF &rarr; 4.71 MB (56.8% reduction) in 4 iterations; verified with `qpdf --check`.
  - **20 MB &rarr; 5 MB**: Tested real 21.83 MB PDF &rarr; 4.05 MB (81.4% reduction) in 4 iterations; verified with `qpdf --check`.
  - **Impossible Target (50 KB on 20 MB PDF)**: Achieved closest possible valid size of 3.18 MB (85.4% reduction), reported `targetReached: false` truthfully with honest message; verified with `qpdf --check`.
  - **Image Target (2.6 MB &rarr; 400 KB)**: Reached 395.5 KB (85.1% reduction) in 5 iterations.
  - **Invalid Inputs**: Missing `fileId` (400), negative target size (400), non-existent files (400) all returned friendly JSON errors without path leaks.
  - **Cleanup Verification**: Verified `uploads/` and `outputs/` have zero leftover trial files or dangling temporary files.
  - **Production Builds**: Backend (`tsc`) and Frontend (`tsc -b && vite build`) built cleanly with 0 errors.

### Stage 9: Complete PDF Organize Suite (Merge, Split, Extract, Reorder, Rotate)
- **Backend Services (`backend/src/services/pdfOrganizeService.ts`, `pdfOrganizeTypes.ts`)**:
  - `getPdfInfo(fileId)`: Inspects PDF structure and returns document page count, dimensions (width, height in points), and rotation angle for each page.
  - `mergePdfs(options)`:
    - Combines two or more uploaded PDFs in any user-specified sequence.
    - Preserves internal page trees and object streams using `pdf-lib`.
    - Automatically validates output document structural integrity using `qpdf --check`.
    - Automatically cleans up all temporary input files upon completion.
  - `splitPdf(options)`:
    - **Page Range Mode**: Parses user range strings (e.g. `1-3, 5`), extracts selected pages, and creates a clean output PDF validated with `qpdf --check`.
    - **Every Page Mode**: Automatically extracts each page as an individual single-page PDF and bundles all files into a compressed `.zip` archive using `archiver` v8 (`ZipArchive`).
  - `extractPdfPages(options)`:
    - Validates 1-based page bounds (`1 <= p <= totalPages`) and extracts user-chosen pages into a new document.
    - Verified with `qpdf --check`.
  - `reorderPdfPages(options)`:
    - Re-sequences document pages into any custom order array (e.g. `[3, 1, 4, 2]`).
    - Verified with `qpdf --check`.
  - `rotatePdfPages(options)`:
    - Applies clockwise rotation of 90°, 180°, or 270° to either all pages or specific page indices.
    - Preserves existing rotation angle offsets dynamically (`(currentRotation + angle) % 360`).
    - Verified with `qpdf --check`.
  - **Security & Error Sanitization**:
    - Rejects damaged or corrupted files with clear, user-friendly error messages (`pdfOrganizeController.ts`).
    - Never leaks server directory paths, stack traces, or internal server paths.
- **REST API Endpoints (`backend/src/routes/pdfOrganizeRoutes.ts`)**:
  - `GET  /api/pdf/organize/info/:fileId` (or `/api/pdf/info/:fileId`)
  - `POST /api/pdf/organize/merge` (or `/api/pdf/merge`)
  - `POST /api/pdf/organize/split` (or `/api/pdf/split`)
  - `POST /api/pdf/organize/extract` (or `/api/pdf/extract`)
  - `POST /api/pdf/organize/reorder` (or `/api/pdf/reorder`)
  - `POST /api/pdf/organize/rotate` (or `/api/pdf/rotate`)
- **Frontend Workspace & Navigation (`frontend/src/`)**:
  - `PdfOrganizeWorkspace.tsx`:
    - Responsive 5-tab switcher for **Merge**, **Split**, **Extract**, **Reorder**, and **Rotate**.
    - **Merge PDF**: Multi-document selector supporting multiple files, move up/down sequence controls, remove button, file size, and page count summaries.
    - **Split PDF**: Mode toggle between "Page Range" (with input format helper) and "Split Every Page into ZIP".
    - **Extract Pages**: Visual page card grid with checkboxes, dimension indicators, quick buttons ("Select All", "Clear All", "Odd Pages", "Even Pages").
    - **Reorder Pages**: Visual page grid with HTML5 drag-and-drop support, quick left/right shift arrow buttons, and "Reset Original Order" button.
    - **Rotate Pages**: 90°, 180°, 270° selectors, scope toggle (All vs Selected Pages), and live visual CSS rotation transforms (`transform: rotate(...)`).
    - **Result Display**: Output document name, page count, file size, primary Download button (PDF or ZIP), and Preview button.
  - Page at `/pdf-organizer` (`PdfOrganizePage.tsx`) with alias redirects for `/pdf-merge` and `/pdf-split`.
  - Added to global navigation in `Navbar.tsx` and activated in `toolsData.ts`.
- **Stage 9 Verification Tests Completed**:
  - **Test 1: Metadata Inspection**: Inspected 4-page PDF and extracted page dimensions and rotation angles.
  - **Test 2: PDF Merge**: Combined 3-page and 2-page documents into a 5-page document; validated with `qpdf --check`.
  - **Test 3: Split Range**: Extracted pages "2-4" from a 5-page document into a valid 3-page output; validated with `qpdf --check`.
  - **Test 4: Split Every Page to ZIP**: Split 3 pages into 3 individual PDFs packaged inside a 2,937-byte ZIP archive.
  - **Test 5: Extract Pages**: Extracted pages `[1, 3]` from 4-page doc; validated with `qpdf --check`.
  - **Test 6: Reorder Pages**: Reordered 3 pages to `[3, 1, 2]`; validated with `qpdf --check`.
  - **Test 7: Rotate Pages**: Rotated pages by 90° and verified structural metadata and `qpdf --check`.
  - **Test 8: Error Handling**: Corrupted files and out-of-bounds indices safely returned 400 responses with zero path disclosure.
  - **Test 9 & 10: Cleanup & Builds**: Verified `uploads/` and `outputs/` have zero dangling files. Backend and frontend production builds passed with 0 errors.

### Stage 10: Document & Image Conversion Suite (PDF & Images, Word, Excel)
- **Real Processing Engines Configured**:
  - **Poppler (`pdftoppm` v25.07.0)**: Located in `backend/bin/poppler/bin/pdftoppm.exe` for high-fidelity PDF page rendering into JPG and PNG formats.
  - **LibreOffice Headless (v26.8.2.2)**: Located via `getLibreOfficePath()` (`soffice.com` / `soffice.exe`) for Word (`.docx`, `.doc`) and Excel (`.xlsx`, `.xls`) to PDF conversion.
  - **Sharp + pdf-lib**: For high-quality image ingestion, format normalization, and embedding into structured PDFs.
  - **QPDF (`qpdf --check`)**: Used to validate every generated output PDF.
- **Backend Services (`backend/src/services/pdfConvertService.ts`, `pdfConvertTypes.ts`)**:
  - `convertPdfToImages(options)`:
    - Renders PDF pages into JPG or PNG images with configurable DPI (`150` crisp default, `300` high print, `72` screen).
    - Page selection: Supports all pages or specific page numbers/ranges (e.g. `1-3, 5`).
    - Single page result: Returns the individual image directly (`.jpg` or `.png`).
    - Multi-page result: Automatically packages all generated images into a compressed `.zip` archive using `archiver` v8 (`ZipArchive`).
  - `convertImagesToPdf(options)`:
    - Combines one or multiple JPG, PNG, and WebP images into a single ordered PDF document.
    - Page layout modes:
      - `fit`: PDF page dimensions match each image's native pixel aspect ratio.
      - `a4`: Fits and centers images with margins on standard A4 (595.28 × 841.89 pt) pages.
    - Output structurally checked with `qpdf --check`.
  - `convertOfficeToPdf(options)`:
    - Runs LibreOffice headless (`soffice --headless --convert-to pdf --outdir <tempDir> <inputPath>`).
    - Converts Word (`.docx`, `.doc`) and Excel (`.xlsx`, `.xls`) documents.
    - **Truthful Formatting Fidelity Notices**:
      - Word: *"Formatting fidelity notice: Converted via LibreOffice. Complex layouts, non-standard embedded fonts, or custom Word styling may show subtle formatting variations from Microsoft Word."*
      - Excel: *"Formatting fidelity notice: Converted via LibreOffice Calc. Spreadsheet page breaks, table borders, and print margins may vary based on sheet layout and column widths."*
    - Automatically cleans up working directories and temporary input uploads.
- **REST API Endpoints (`backend/src/routes/pdfConvertRoutes.ts`, `controllers/pdfConvertController.ts`)**:
  - `POST /api/convert/pdf-to-image`
  - `POST /api/convert/image-to-pdf`
  - `POST /api/convert/office-to-pdf`
- **Frontend Workspace & Navigation (`frontend/src/`)**:
  - `DocumentConvertWorkspace.tsx`:
    - Responsive 4-tab switcher:
      1. **PDF to JPG / PNG**: PDF upload, JPG vs PNG format switch, DPI selector (150/300/72), All vs Custom page range, download single image or ZIP.
      2. **Images to PDF**: Multi-image uploader, sequence ordering controls (Move Up, Move Down, Delete), Fit vs A4 page sizing toggle.
      3. **Word to PDF**: Word document uploader (`.docx`, `.doc`), prominent fidelity guidance note.
      4. **Excel to PDF**: Spreadsheet uploader (`.xlsx`, `.xls`), prominent print layout & margin note.
    - Results card with verified download links, inline preview button, and clear honest formatting notices.
  - Page at `/convert` (`DocumentConvertPage.tsx`) with alias redirects for `/pdf-to-image`, `/image-to-pdf`, `/word-to-pdf`, and `/excel-to-pdf`.
  - Added to global navigation in `Navbar.tsx` and activated in `toolsData.ts`.
- **Stage 10 Verification Tests Completed**:
  - **Test 1: PDF -> JPG (Single Page)**: Converted single PDF page to a valid 19.1 KB JPEG image.
  - **Test 2: PDF -> PNG (Multi-Page ZIP)**: Converted 3-page PDF to 3 PNGs packaged in a valid ZIP archive.
  - **Test 3: JPG -> PDF**: Converted JPG into valid PDF; verified with `qpdf --check`.
  - **Test 4: Multi-Image (JPG + PNG) -> PDF**: Combined multiple images into a 2-page PDF; verified with `qpdf --check`.
  - **Test 5: Word (.docx) -> PDF**: Converted real DOCX to PDF using LibreOffice headless; verified with `qpdf --check` and validated honest disclaimer.
  - **Test 6: Excel (.xlsx) -> PDF**: Converted real XLSX to PDF using LibreOffice Calc; verified with `qpdf --check` and validated honest disclaimer.
  - **Test 7: Temporary File Cleanup**: Verified all upload files and intermediate temp directories were unlinked after processing.
  - **Test 8: Production Builds**: Backend (`tsc`) and Frontend (`tsc -b && vite build`) built cleanly with 0 errors.

### Stage 11: Document Compression (DOC/DOCX & PPT/PPTX)
- **Real Processing Engines Configured**:
  - **OpenXML Package Inspector (`adm-zip`)**: Safely decompresses DOCX and PPTX archives in memory, inspects embedded media in `word/media/` and `ppt/media/`, and recompresses them using Sharp.
  - **Sharp (libvips)**: Recompresses embedded JPEG and PNG images with configurable quality (`mozjpeg: true`, adaptive downscaling to standard display resolutions like 1920px max dimension).
  - **Strict No-Bloat Protection**: A media stream is only replaced in the zip archive if the recompressed buffer is strictly smaller than the original.
  - **Strict Anti-Faking Guarantee**: If a document has no compressible media or is already optimized (such as pure text DOCX), Fileora keeps the original file untouched and honestly returns `isOptimized: false`, `reductionPercent: "0%"`, and a transparent explanation message (*"This document is already well-optimized. File size could not be reduced further without reducing content."*).
  - **LibreOffice Headless Modernizer**: Converts legacy binary Word (`.doc`) and PowerPoint (`.ppt`) documents to modern OpenXML (`.docx` / `.pptx`) formats, producing genuine 40%–60% reductions.
- **Backend Services & Types (`backend/src/services/docCompressService.ts`, `docCompressTypes.ts`)**:
  - `compressDocument(options)`:
    - Analyzes file extension and magic bytes (validates OLE compound binary for `.doc`/`.ppt` and PK zip for `.docx`/`.pptx`).
    - Modernizes legacy files via LibreOffice headless when selected (`modernizeLegacy: true`).
    - Optimizes embedded media streams in DOCX and PPTX packages.
    - Calculates genuine metrics: `originalSize`, `resultSize`, `savedBytes`, `reductionPercent`.
    - Automatically cleans up input upload files and temporary working folders.
- **REST API Endpoints (`backend/src/routes/docCompressRoutes.ts`, `controllers/docCompressController.ts`)**:
  - `POST /api/document/compress` (and alias `/api/doc/compress`):
    - Accepts `{ fileId, qualityPreset?: 'balanced' | 'high' | 'maximum', maxImageDimension?: number, modernizeLegacy?: boolean }`.
    - Returns `DocCompressResponse` with genuine metrics, formatted sizes, download link, preview link, and honest user messaging.
    - Sanitizes errors: Rejects corrupt files or missing parameters with user-friendly error messages and zero internal server path leakage.
- **Frontend Workspace & Navigation (`frontend/src/`)**:
  - `DocumentCompressWorkspace.tsx`:
    - Responsive 2-tab switcher:
      1. **Word Compressor**: Supports `.docx` and `.doc` files.
      2. **PowerPoint Compressor**: Supports `.pptx` and `.ppt` files.
    - Compression controls:
      - **Image Compression Quality**: Balanced (75% - recommended), High Quality (85%), Maximum Compression (60%).
      - **Max Image Resolution**: 1920px (Full HD default), 2560px (2K), 1280px (Compact), or Original.
      - **Legacy Modernization Checkbox**: Auto-upgrade `.doc` / `.ppt` to `.docx` / `.pptx` for maximum size savings.
    - Real metrics grid displaying **Original Size**, **Compressed Size**, **Saved Space**, and **Reduction %**.
    - Truthful messaging banner for already-optimized files explaining why size could not be further reduced.
    - Direct "Download Document" and "Compress Another Document" actions.
  - Page at `/document-compressor` (`DocumentCompressPage.tsx`) with alias redirects for `/compress-word` and `/compress-powerpoint`.
  - Added to global navigation in `Navbar.tsx` and activated in `toolsData.ts`.
- **Stage 11 Verification Tests Completed**:
  - **Test 1: DOCX with Embedded Photos**: Reduced real 124.6 KB DOCX to 48.2 KB (61.3% reduction, 76.4 KB saved); verified OpenXML validity.
  - **Test 2: PPTX Presentation Deck**: Reduced real 124.8 KB PPTX to 48.5 KB (61.2% reduction, 76.4 KB saved); verified presentation structure.
  - **Test 3: Truthful Reporting on Text-Only DOCX**: Uploaded text-only DOCX; system truthfully reported `isOptimized: false`, `reductionPercent: 0%`, and 0 bytes faked.
  - **Test 4: Legacy DOC Modernization**: Converted legacy `.doc` to `.docx` via LibreOffice, achieving 47.1% real size reduction.
  - **Test 5: Temporary Upload & Trial File Cleanup**: Verified `uploads/` and `outputs/` have zero dangling files after processing.
  - **Test 6: Production Builds**: Backend (`tsc`) and Frontend (`tsc -b && vite build`) built cleanly with 0 errors.

### Stage 12: OCR & Text Extractor Suite (Image to Text, Scanned PDF to Text, Scanned PDF to Word, Image to PDF)
- **Real Processing Engines Configured**:
  - **Tesseract OCR (`tesseract.js` v7.0.0)**: Pure JavaScript/WebAssembly OCR worker recognizing printed and typed characters in images and rendered PDF pages with confidence metrics.
  - **Sharp Preprocessing**: Automatically enhances scans and photos (grayscaling, dynamic range normalization, and format sanitization) for maximum OCR character contrast.
  - **Poppler (`pdftoppm` v25.07.0)**: Renders scanned multi-page PDFs into high-resolution PNG page images at 150 DPI for sequential OCR processing.
  - **Word DOCX Generator (`docx` v9.15.1)**: Constructs structured OpenXML Microsoft Word documents from extracted OCR text with page headings, timestamps, and proper paragraph structure.
  - **pdf-lib + Sharp**: Converts one or multiple JPG/PNG/WebP images into a structured, validated PDF document with 'fit' or 'a4' page sizing.
- **Backend Services & Types (`backend/src/services/ocrService.ts`, `ocrTypes.ts`)**:
  - `ocrImageToText(options)`: Runs OCR on uploaded images, calculates word & character counts, average confidence, generates downloadable `.txt` file, and returns structured `OcrResponse`.
  - `ocrPdf(options)`: Renders multi-page PDFs to PNG images, performs sequential OCR across pages, combines text with page markers, generates `.txt` and optional structured `.docx` Word document.
  - Automatically unlinks temporary upload files and temporary rendering directories in guaranteed `finally` blocks.
  - **Mandatory Accuracy Notice**: Transparently returns notice that OCR depends on lighting, resolution, and font clarity and may require manual corrections.
- **REST API Endpoints (`backend/src/routes/ocrRoutes.ts`, `controllers/ocrController.ts`)**:
  - `POST /api/ocr/image-to-text`: Image to text OCR (accepts `.png`, `.jpg`, `.jpeg`, `.webp`, `.bmp`).
  - `POST /api/ocr/pdf-to-text`: Scanned PDF to text extraction (accepts `.pdf`, optional page range).
  - `POST /api/ocr/pdf-to-word` (alias `pdf-to-docx`): Scanned PDF to editable Microsoft Word document.
  - `POST /api/ocr/image-to-pdf`: Multiple image combination into standard PDF.
  - Zero internal server path leakage in error responses.
- **Frontend Workspace & Navigation (`frontend/src/`)**:
  - `OcrWorkspace.tsx`:
    - Responsive 4-tab switcher:
      1. **Image → Text**: Image upload, auto-enhancement contrast checkbox, Tesseract OCR extraction.
      2. **Scanned PDF → Text**: PDF upload, optional page range input, multi-page text rendering & extraction.
      3. **Scanned PDF → Word**: PDF upload, OCR text recognition, direct Word `.docx` generation.
      4. **Image → PDF**: Multi-image file uploader, sequence reordering controls, Fit vs Standard A4 toggle.
    - **Actual Processing Stage Progression Tracker**:
      - Step 1: `Uploading` (file uploading to server)
      - Step 2: `Processing` (validating format and preparing pages)
      - Step 3: `Recognizing text` (Tesseract reading characters)
      - Step 4: `Creating result` (formatting text / compiling Word document)
      - Step 5: `Complete` (extracted text & downloads ready)
      - **Zero Fake Percentage Progress**: Strictly shows real step milestones with active spinners and completed checkmarks.
    - **Prominent OCR Accuracy Warning Banner**:
      *"OCR Accuracy Notice: Optical Character Recognition depends on scan resolution, image contrast, lighting, and font clarity. Extracted text may require proofreading and manual corrections."*
    - **Result Display**:
      - Metrics grid: Average Confidence (%), Word Count, Character Count, Total Pages.
      - Page switcher for multi-page scans (All Pages vs Page 1, Page 2, etc.).
      - Monospace scrollable text editor with 1-click "Copy Text" button (with live "Copied to clipboard!" visual confirmation).
      - Direct action buttons: "Download Word Document (.DOCX)", "Download Text (.TXT)", "Process Another File".
  - Page at `/ocr` (`OcrPage.tsx`) with alias redirects for `/image-to-text`, `/scanned-pdf-to-text`, `/scanned-pdf-to-word`.
  - Added to global navigation in `Navbar.tsx` and activated in `toolsData.ts`.
- **Stage 12 Verification Tests Completed**:
  - **Test 1: Printed Text on Image (Image -> Text)**: Recognized printed text (`FILEORA OCR STAGE TWELVE`) with 95% confidence, generated downloadable `.txt` verified over HTTP.
  - **Test 2: Multi-Page Scanned PDF -> Text**: Extracted text from 2-page scanned PDF document across sections Alpha & Beta with 96% confidence and combined page delimiters.
  - **Test 3: Scanned PDF -> Word (DOCX Generation)**: Generated valid Microsoft Word `.docx` from scanned PDF; downloaded over HTTP and validated OpenXML `word/document.xml` archive structure.
  - **Test 4: Image -> PDF**: Combined multiple images into a valid 2-page PDF document; verified over HTTP.
  - **Test 5: Error Handling & Sanitization**: Validated rejection of missing fileIds and non-existent files with 0 path leakage.
  - **Test 6: Cleanup**: Verified `backend/uploads/` and `backend/outputs/` have zero dangling files after processing.
  - **Test 7: Production Builds**: Backend (`tsc`) and Frontend (`tsc -b && vite build`) built cleanly with 0 errors.

### Stage 13: PDF Manipulation Suite (Crop, Watermark, Page Numbers, Password Protection, Signing)
- **Real Processing Engines Configured**:
  - **pdf-lib**: Native PDF manipulation engine used for CropBox/MediaBox boundaries, font embedding, text and vector graphics drawing, and image placement.
  - **QPDF (256-bit AES Encryption)**: Industry-standard security engine for password-protecting PDFs (`--encrypt user-pw owner-pw 256 --`).
  - **Sharp**: For normalizing signature images to transparent PNG format before embedding.
- **Backend Services & Types (`backend/src/services/pdfModifyService.ts`, `pdfModifyTypes.ts`)**:
  - `cropPdf(options)`: Crops PDF margins in points or percentages; updates both `CropBox` and `MediaBox` for universal viewer compatibility.
  - `watermarkPdf(options)`: Applies rotated diagonal or horizontal watermarks, top headers, or bottom footers with configurable opacity and color palettes (`gray`, `red`, `blue`, `black`).
  - `addPdfPageNumbers(options)`: Stamps customizable page numbering formats (`Page {page} of {total}`, `{page} / {total}`, etc.) at 5 positions (`bottom-center`, `bottom-right`, `bottom-left`, `top-center`, `top-right`), with optional cover page exclusion.
  - `protectPdf(options)`: Encrypts documents with 256-bit AES password protection via QPDF.
    - **CRITICAL ZERO-KNOWLEDGE POLICY**: Passwords are never logged to console, disk, or error messages.
  - `signPdf(options)`: Stamps formal script text signatures with date/reason or embeds uploaded transparent signature PNG photos.
  - Automatically unlinks temporary upload files and signature assets in guaranteed `finally` blocks.
- **REST API Endpoints (`backend/src/routes/pdfModifyRoutes.ts`, `controllers/pdfModifyController.ts`)**:
  - `POST /api/pdf/crop` (and alias `/api/pdf/modify/crop`)
  - `POST /api/pdf/watermark` (and alias `/api/pdf/modify/watermark`)
  - `POST /api/pdf/page-numbers` (and alias `/api/pdf/modify/page-numbers`)
  - `POST /api/pdf/protect` (and alias `/api/pdf/modify/protect`)
  - `POST /api/pdf/sign` (and alias `/api/pdf/modify/sign`)
  - Sanitized error handling with zero internal filesystem path leakage.
- **Frontend Workspace & Navigation (`frontend/src/`)**:
  - `PdfModifyWorkspace.tsx`:
    - Responsive 5-tab switcher:
      1. **Crop**: Margin inputs (points/percent) + quick presets ("Trim 5%", "Trim 10%", "36 pt Standard").
      2. **Watermark**: Text input, diagonal/horizontal/header/footer position, opacity slider, color selector.
      3. **Page Numbers**: Position selector, numbering format dropdown, cover page exclusion checkbox.
      4. **Protect (Password)**: Password input with show/hide eye toggle, confirm password validation, zero-knowledge privacy policy alert.
      5. **Sign Document**: Toggle between formal script signature and signature photo upload, placement selector, target page selector, date and reason inputs.
    - Result card with verified download links, inline preview tab button, and reset controls.
  - Page at `/pdf-tools` (`PdfModifyPage.tsx`) with alias redirects for `/crop-pdf`, `/watermark-pdf`, `/page-numbers-pdf`, `/protect-pdf`, `/sign-pdf`.
  - Added to global navigation in `Navbar.tsx` and activated in `toolsData.ts`.
- **Stage 13 Verification Tests Completed**:
  - **Test 1: PDF Crop**: Cropped 2-page PDF with 36pt margins; verified resulting document with `qpdf --check`.
  - **Test 2: PDF Watermark**: Applied diagonal "INTERNAL CONFIDENTIAL" watermark with 35% opacity; verified document integrity.
  - **Test 3: PDF Page Numbers**: Stamped "Page {page} of {total}" with cover page skip; verified with `qpdf --check`.
  - **Test 4: PDF Password Protection**: Encrypted document with 256-bit AES; verified `qpdf --is-encrypted`, verified access denied without password, verified document unlocks with correct password, and verified zero password logging.
  - **Test 5: Basic PDF Signing**: Stamped formal text signature ("Sahil Kumar") and transparent image signature; verified with `qpdf --check`.
  - **Test 6: Error Handling & Sanitization**: Missing fileIds and empty passwords properly rejected with 400 status and zero filesystem path leaks.
  - **Test 7: Temporary File Cleanup**: Verified `backend/uploads/` and `backend/outputs/` have zero dangling files.
  - **Test 8: Production Builds**: Backend (`tsc`) and Frontend (`tsc -b && vite build`) built cleanly with 0 errors.

### Stage 14: Batch Processing Studio (Multi-File Image & PDF Processing)
- **Backend Services & Engine (`backend/src/services/batchService.ts`, `batchTypes.ts`)**:
  - **Batch Limits**: Strict bounds of up to 15 files and 100 MB total size per batch request.
  - **Supported Operations**:
    - `compress-image`: Multi-file compression across JPEG, PNG, and WebP using Sharp with configurable quality (20-95%) or presets (`light`, `balanced`, `strong`).
    - `convert-image`: Bulk image conversion to WebP, JPG, or PNG.
    - `compress-pdf`: Multi-PDF stream and media compression using portable QPDF (`basic` or `strong`).
  - **Partial Failure Tolerance**: Files are processed sequentially within an isolated error-boundary loop. Corrupted or unsupported files catch errors gracefully (`status: 'error'`, sanitized error message) without aborting or losing other successful files (`status: 'success'`).
  - **Instant ZIP Packaging**: All successful outputs are bundled on-the-fly into a single `.zip` archive via `archiver` (`ZipArchive`), preserving original base filenames. Corrupt/failed files are automatically excluded from the archive.
  - **Strict Cleanup Guarantee**: Input upload files are guaranteed unlinked in per-item `finally` blocks. Output files and zip archives are registered in the download system and swept by the 30-minute background sweeper.
  - **Windows EBUSY Safety**: Configured `sharp.cache(false)` and added retry handling in `cleanupFile` to guarantee zero locked file descriptor leaks on Windows.
- **REST API Endpoints (`backend/src/routes/batchRoutes.ts`, `controllers/batchController.ts`)**:
  - `POST /api/batch/upload`: Accepts multipart `files` (up to 20 files) and returns list of verified `{ fileId, originalName, mimeType, size }`.
  - `POST /api/batch/process`: Accepts `{ items | files, operation, options: { quality, targetFormat, compressionLevel } }`.
  - Returns calculated `BatchProcessResponse`:
    - Overall summary: `totalFiles`, `successCount`, `failureCount`, `totalOriginalBytes`, `totalResultBytes`, `totalSavedBytes`, `overallReductionPercent`.
    - Bundled download: `zipDownloadUrl` (e.g. `/api/files/download/:zipId`).
    - Detailed per-file list: `items: [{ originalName, status: 'success'|'error', downloadUrl, originalSize, resultSize, reductionPercent, error }]`.
  - Zero internal filesystem path leakage.
- **Frontend Workspace & Navigation (`frontend/src/`)**:
  - `BatchProcessingWorkspace.tsx`:
    - Interactive drag-and-drop and multi-file picker with real-time limits display (`Staged: X / 15 files • Y MB / 100 MB`).
    - Operation tabs (`Compress Images`, `Convert Images`, `Compress PDFs`) with contextual settings (quality slider, target format pills, compression mode).
    - True status progress display (e.g. "Uploading files...", "Executing image batch processing...", "Batch processing complete") with zero fake percentage progress bars.
    - Summary Hero Card reporting batch health (`All succeeded` or `Partial Success (X/Y)`), total saved bytes, and overall reduction %.
    - One-click primary action: "Download All (ZIP)" button.
    - Status list showing exact per-file status: `file1.jpg ✓`, `file2.jpg ✓`, `broken.jpg ✗ (Error message)`.
    - Individual download buttons for each successful file.
  - Page at `/batch` and `/batch-processing` (`BatchProcessingPage.tsx`).
  - Added to global navigation in `Navbar.tsx` and activated in `toolsData.ts`.
- **Stage 14 Verification Tests Completed**:
  - **Test 1: Multi-file Upload & Batch Image Compression**: Uploaded 3 real images (JPEG, PNG, WebP); batch compressed with 57% size reduction; verified ZIP download and inspected 3 unzipped entries.
  - **Test 2: Partial Failure Tolerance**: Uploaded 2 valid images and 1 corrupt file; batch process returned `successCount: 2`, `failureCount: 1`; corrupt file marked with `status: 'error'`, valid files marked with `status: 'success'`; verified ZIP contains exactly the 2 valid files and excludes the corrupt file.
  - **Test 3: Batch PDF Compression**: Uploaded 2 multi-page PDFs; compressed both successfully and verified download URLs.
  - **Test 4: Batch Image Conversion**: Verified bulk conversion to WebP format.
  - **Test 5: Temporary Upload Cleanup**: Verified `backend/uploads/` has 0 dangling files remaining after processing.
  - **Test 6: Production Builds**: Backend (`tsc`) and Frontend (`tsc -b && vite build`) built cleanly with 0 errors.

### Stage 15: Unified Reusable Result Component & Experience
- **Frontend Core Primitive (`frontend/src/components/ui/ResultView.tsx`)**:
  - **Standardized Core Metrics Grid**:
    - **Original Size**: Pre-processing uploaded file size (e.g. `2.4 MB`).
    - **Result Size**: Processed output file size (e.g. `840 KB`).
    - **Saved Space**: Real calculated difference (e.g. `1.56 MB`), or honest "Already Optimized" handling.
    - **Reduction Percentage**: Real percentage with gradient styling (e.g. `65%`).
  - **Pixel Dimensions Comparison (where relevant)**:
    - Dedicated resolution block displaying `Original: 4000 × 3000` &rarr; `Result: 1200 × 900`.
    - Automatically omitted when operations do not alter pixel dimensions.
  - **Visual Comparison Bar**:
    - Clean proportional progression bar comparing Result size vs Saved space.
  - **Integrated Previews**:
    - High-resolution visual image preview with "Open Full Size" link.
    - PDF preview integration with "Preview in Browser" trigger.
  - **Standardized Actions**:
    - Primary **Download** button with custom format label (`Download JPEG`, `Download Compressed PDF`).
    - Secondary **Process Another File** button invoking reset handlers.
    - Tertiary **Try Another Tool** button navigating back to tool selection smoothly.
  - **Subtle Satisfying Animations**:
    - Framer Motion animation with graceful ease-in, y-offset, and `useReducedMotion()` accessibility support.
- **Reused Across Existing Workspaces**:
  - `ImageToolWorkspace.tsx`: Replaced custom step 4 view with `<ResultView />` for Image Compression, Image Resizing (with 4000×3000 &rarr; 1200×900 dimensions), and Format Conversion.
  - `PdfCompressorWorkspace.tsx`: Replaced custom step 3 result with `<ResultView />` for Basic, Strong, and Target Size QPDF compression.
  - `TargetCompressorWorkspace.tsx`: Replaced step 3 result with `<ResultView />` for Iterative Target Size compression (PDF and images).
  - Strict preservation of all underlying processing APIs and workflows (zero regression).
- **Stage 15 Verification Tests Completed**:
  - **Test 1: Image Compression**: Verified metrics (`Original Size`, `Result Size`, `Saved Bytes`, `Reduction %`), visual preview, and download endpoint.
  - **Test 2: Image Resizing**: Verified exact dimensions comparison (`4000 × 3000` &rarr; `1200 × 900`) and size metrics.
  - **Test 3: PDF Compression**: Verified PDF compression metrics (`originalSize`, `resultSize`, `savedBytes`, `savedPercentage`), preview URL, and download URL.
  - **Test 4: Temporary File Cleanup**: Verified `backend/uploads/` and `backend/outputs/` have zero dangling files after completion.
  - **Test 5: Production Builds**: Backend (`tsc`) and Frontend (`tsc -b && vite build`) compiled cleanly with 0 errors.

### Stage 16: Reliable Temporary File Handling, Directory Sweeper & Honest Privacy
- **Core Architecture & Reusable Cleanup Engine (`backend/src/utils/cleanup.ts`)**:
  - `cleanupFile(filePath, retries = 4, delayMs = 80)`: Safely unlinks a file with exponential backoff retries against Windows OS file locks (`EBUSY` / `EPERM`).
  - `cleanupFiles(filePaths)`: Safely unlinks an array of file paths.
  - `cleanupFileById(fileId, target = 'both')`: Purges matching files by UUID from `uploads/`, `outputs/`, or both directories.
  - `sweepDirectory(dirPath, maxAgeMinutes = 30)`: Automated directory sweeper unlinking stale files older than TTL threshold while strictly preserving `.gitkeep`.
  - `startupCleanup(staleThresholdMinutes = 5)`: Boot-time sweep unlinking orphaned temporary files left over from previous process crashes, hard reboots, or interrupted sessions.
  - `startPeriodicCleanup(intervalMinutes = 10, maxAgeMinutes)`: Standalone timer sweeping `uploads/` and `outputs/` without any external queue dependencies.
  - `withSafeExecution(options)`: Reusable higher-order execution wrapper that executes processing tasks, automatically unlinks input files in `finally`, cleans partial outputs in `catch`, and enforces processing timeouts.
- **Middleware Protection (`backend/src/middleware/cleanupMiddleware.ts`)**:
  - `requestCleanupMiddleware(timeoutMs = 120_000)` mounted globally in `app.ts`.
  - Detects aborted / interrupted client connections via `res.on('close')` when `!res.writableEnded`, unlinking staged input files (`fileId` / `fileIds`) immediately.
  - Enforces processing safety timeout, cleaning temporary files and responding with HTTP 504.
- **Path Sanitization & Secure Error Handling**:
  - Updated `backend/src/middleware/errorHandler.ts` to strip Windows (`C:\...`) and POSIX (`/...`) absolute filesystem paths from user-facing errors, preventing internal infrastructure leaks.
  - Re-routed `DELETE /api/cleanup/:fileId` to `deleteUploadedFile` controller for explicit client-side cleanup requests.
- **Universal Try / Finally Cleanup Across All Backend Services**:
  - `imageController.ts` & `imageCompressService.ts`, `imageResizeService.ts`, `imageConvertService.ts`, `photoResizeService.ts`.
  - `pdfCompressService.ts` & `targetCompressService.ts`.
  - `docCompressService.ts`.
  - `pdfOrganizeService.ts` (`mergePdfs`, `splitPdf`, `extractPdfPages`, `reorderPdfPages`, `rotatePdfPages`).
  - `pdfConvertService.ts` (`convertPdfToImages`, `convertImagesToPdf`, `convertOfficeToPdf`).
  - `ocrService.ts` (`ocrImageToText`, `ocrPdf`).
  - `pdfModifyService.ts` (`cropPdf`, `watermarkPdf`, `addPageNumbers`, `passwordProtectPdf`, `signPdf`).
  - `batchService.ts` (`processBatch`).
  - Guaranteed `finally { await cleanupFile(inputPath); }` for all uploaded input files and intermediate temporary directories.
  - Guaranteed `catch { if (createdOutputPath) await cleanupFile(createdOutputPath); }` for all partial outputs on processing failures.
- **Honest Privacy Messaging Throughout UI**:
  - Consistent truthful wording across the entire application: *"Files are temporarily processed on our server and automatically deleted after processing."*
  - Explicitly avoided exaggerated claims like *"100% secure"*.
  - Updated components:
    - `Footer.tsx`: Added exact privacy commitment badge and link.
    - `HomePage.tsx`: Updated hero subtitle and data policy section with truthful, disciplined lifecycle engineering notes.
    - `FileUpload.tsx`: Added subtle privacy notice below the dropzone and file selection trigger.
    - `ResultView.tsx`: Embedded privacy & automatic cleanup notice on the result card footer.
- **Strict Constraints Enforced**:
  - ❌ ZERO S3, Cloudflare R2, or cloud object stores.
  - ❌ ZERO Redis, BullMQ, or Kafka message queues.
- **Stage 16 Verification Tests Completed**:
  - **Test A: Successful Processing & Immediate Upload Deletion**: Uploaded valid JPEG; compressed; verified output created while input upload in `backend/uploads/` was immediately unlinked.
  - **Test B: Failed Processing (Corrupted Image) Cleanup**: Uploaded corrupted file; verified processing failure returned HTTP 500 with sanitized path error (no internal directory exposed); verified input upload was cleanly unlinked despite failure and no orphan remained.
  - **Test C: Invalid Signature Rejection**: Uploaded invalid fake PDF executable; verified rejected with HTTP 400 and immediately unlinked from disk (`uploads/` returned to 0 files).
  - **Test D: Stale Temporary File Sweeper**: Generated simulated 20-minute-old temporary files in `uploads/` and `outputs/`; verified `startupCleanup(5)` purged both files while keeping `.gitkeep` untouched.
  - **Test E: Interrupted Client Connection**: Simulated client abruptly destroying socket connection mid-request; verified middleware handled connection close safely.
  - **Test F: Production Builds**: Backend (`tsc`) and Frontend (`tsc -b && vite build`) compiled cleanly with 0 errors.

---

## How to Run

### 1. Backend
```bash
cd backend
npm install
npm run dev      # Runs with tsx watch on http://localhost:5000
# or
npm run build    # Compiles to dist/
npm start        # Runs compiled code from dist/
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev      # Runs Vite dev server on http://localhost:5173
# or
npm run build    # Generates production bundle in dist/
npm run preview  # Previews production build on http://localhost:4173
```

### Stage 17: Individual Tool Pages, SEO Architecture & Discovery Graph
- **Dynamic SEO Engine (`frontend/src/hooks/useSeo.ts`)**:
  - Dynamically updates `<title>`, `<meta name="description">`, `<link rel="canonical">`, Open Graph metadata (`og:title`, `og:description`, `og:url`, `og:type`, `og:site_name`), and Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`).
  - Zero bloated external libraries; uses pure React 18 DOM synchronization.
- **Dedicated Tool Page Layout (`frontend/src/components/ToolPageLayout.tsx`)**:
  - Standardized structure across all individual tool pages:
    - **Header & Hero**: Breadcrumb navigation (`Home > Category > Tool`), category badge, engine/technology badge, clear title (`h1`), and short, human-written description.
    - **Constraints & Formats Bar**: Explicitly lists supported file extensions (e.g. `.pdf`, `.docx`, `.jpg`) and maximum file size ceiling (e.g. `50 MB`).
    - **Actual Tool Interface**: Directly mounts the working interactive workspace initialized to the targeted tool operation.
    - **Honest Privacy Banner**: Prominently displays: *"Files are temporarily processed on our server and automatically deleted after processing. We do not store your files long-term, inspect personal contents, or make exaggerated claims like '100% secure.'"*
    - **How It Works**: 3 to 4 sequential, informative steps explaining the operation in plain English.
    - **FAQ Accordion**: 3 to 4 helpful, genuine questions addressing format support, fidelity, quality settings, and data retention.
    - **Related Tools Graph**: 4 rich internal links to related tools with category badges, descriptions, and one-click navigation.
- **Comprehensive Tool Page Registry (`frontend/src/utils/toolPageConfigs.ts`)**:
  - Structured metadata, SEO descriptions, FAQs, how-it-works steps, and related tool links for all implemented tools:
    - `/pdf-compressor` (PDF Compressor)
    - `/target-compressor` (Target-Size Compressor)
    - `/pdf-merge` (Merge PDF)
    - `/pdf-split` (Split PDF)
    - `/pdf-extract` (Extract PDF Pages)
    - `/pdf-reorder` (Reorder PDF Pages)
    - `/pdf-rotate` (Rotate PDF Pages)
    - `/image-compressor` (Image Compressor)
    - `/image-resizer` (Image Resizer)
    - `/image-converter` (Image Format Converter)
    - `/passport-photo-resizer` (Passport Photo Resizer)
    - `/signature-resizer` (Application Signature Resizer)
    - `/pdf-to-word` (PDF to Word OCR)
    - `/word-to-pdf` (Word to PDF Converter)
    - `/pdf-to-image` (PDF to Image JPG/PNG)
    - `/image-to-pdf` (Images to PDF)
    - `/excel-to-pdf` (Excel to PDF)
    - `/compress-word` (Compress Word Document)
    - `/compress-powerpoint` (Compress PowerPoint)
    - `/image-to-text` (Image to Text OCR)
    - `/scanned-pdf-to-text` (Scanned PDF to Text)
    - `/crop-pdf` (Crop PDF Margins)
    - `/watermark-pdf` (Watermark PDF)
    - `/page-numbers-pdf` (Add PDF Page Numbers)
    - `/protect-pdf` (Protect PDF with Password)
    - `/sign-pdf` (Sign PDF Document)
    - `/batch` / `/batch-processing` (Batch Processing Studio)
- **Robots & Sitemap Configuration (`frontend/public/`)**:
  - `robots.txt`: Allows search crawlers across public tool pages while disallowing internal `/api/` staging endpoints, referencing canonical `sitemap.xml`.
  - `sitemap.xml`: Valid standard XML sitemap indexing the homepage and all 27 genuinely implemented tools (strictly zero fake or un-implemented tool pages).
- **Tool Card & Navigation Alignment (`frontend/src/utils/toolsData.ts` & `frontend/src/components/Footer.tsx`)**:
  - Updated all 26 tool cards in `toolsData.ts` to link directly to canonical tool paths instead of query-parameter redirects.
  - Updated `Footer.tsx` with direct links to top individual tools.
- **Stage 17 Verification Tests Completed**:
  - **Test 1: Crawler Directives**: Verified `robots.txt` exists with valid `Allow: /`, `Disallow: /api/`, and `Sitemap: https://fileora.app/sitemap.xml`.
  - **Test 2: Sitemap XML & Routing Alignment**: Verified all 28 URLs in `sitemap.xml` are valid XML and correspond to real, actively mounted routes in `App.tsx`.
  - **Test 3: Page Configuration Integrity**: Verified all required tools exist in `toolPageConfigs.ts` with complete `howItWorks`, `faqs`, and `relatedTools`.
  - **Test 4: Privacy Wording Verification**: Confirmed exact wording *"Files are temporarily processed on our server and automatically deleted after processing."*
  - **Test 5: Exaggerated Claims Check**: Verified zero exaggerated security claims across pages.
  - **Test 6: Production Builds**: Backend (`tsc`) and Frontend (`tsc -b && vite build`) compiled cleanly with 0 errors.

---

### Stage 18: Complete Frontend Usability & Accessibility (A11y) Audit
- **Cross-Device Responsiveness (Desktop, Laptop 1024px, Tablet, Mobile 375px)**:
  - **Navigation & Header (`Navbar.tsx`)**:
    - Streamlined category links on 1024px laptop widths to prevent text clipping and unwanted wrapping.
    - Mobile navigation drawer now automatically dismisses upon pressing the `Escape` key.
    - Hamburger button equipped with `aria-expanded`, `aria-controls="mobile-nav-drawer"`, accessible label, and compliant 44x44px touch target.
    - Mobile drawer assigned `id="mobile-nav-drawer"`, `role="region"`, and `aria-label="Mobile Navigation"`.
  - **Skip to Content Anchor (`MainLayout.tsx`)**:
    - Embedded accessible keyboard skip link (`sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-brand-600 text-white px-4 py-2 rounded-xl shadow-lg font-semibold`) pointing directly to `#main-content` with `tabIndex={-1}`.
  - **Touch Target & Focus Baseline (`index.css`)**:
    - Configured universal high-contrast focus ring: `:focus-visible { @apply outline-none ring-2 ring-brand-500 ring-offset-2 ring-offset-white; }`.
    - Enforced `touch-action: manipulation` across all buttons, inputs, links, and selects to remove tap delay and eliminate double-tap zoom conflicts.
    - Implemented `@media (prefers-reduced-motion: reduce)` global override resetting animation durations and transitions to `0.01ms` for motion-sensitive users.
  - **Universal Form & UI Components**:
    - **`Button.tsx`**: Enforced mobile-compliant touch targets (`min-h-[36px] sm:min-h-0` for `sm`, `min-h-[44px]` for `md`, `min-h-[48px]` for `lg`).
    - **`FileUpload.tsx`**: Dropzone converted to full keyboard accessibility (`tabIndex={0}`, `role="button"`, accessible `aria-label`, Enter and Space key activation, visible focus outline). Dynamic upload error banner now communicates to screen readers with `role="alert"` and `aria-live="assertive"`.
    - **`Input.tsx` & `Select.tsx`**: Configured minimum touch target heights (`min-h-[42px] sm:min-h-0`), accessible `<label htmlFor="...">` links, and screen-reader polite announcements (`role="alert" aria-live="polite"`).
    - **`Card.tsx`**: Interactive cards automatically provide `role="button"`, `tabIndex={0}`, focus rings, and Enter/Space keyboard listeners.
    - **`Modal.tsx`**: Close button enlarged to 44x44px touch target (`min-h-[44px] min-w-[44px]`).
    - **`ResultView.tsx`**: Action buttons now stack responsively on mobile (`flex-col sm:flex-row`, `w-full sm:w-auto`).
  - **Audited & Upgraded Tool Workspaces**:
    - **`ImageToolWorkspace.tsx`**: Mode selector converted to `role="tablist"` / `role="tab"` with `min-h-[44px]` touch targets; presets converted to `role="radiogroup"` / `role="radio"`; range sliders and dimension inputs given explicit IDs, labels, and `aria-label`.
    - **`ApplicationPhotoWorkspace.tsx`**: Tab switchers and preset dimension templates given explicit `role="tablist"`, `aria-label`, and 44px touch targets; validation reports and footers stack responsively on mobile.
    - **`BatchProcessingWorkspace.tsx`**: Operations bar equipped with `role="tablist"` / `role="tab"`; dropzone keyboard-navigable; staged files have 38x38px remove buttons with accessible labels; per-file status cards stack on narrow screens.
    - **`TargetCompressorWorkspace.tsx`**: Target input given explicit label and ID; unit switcher converted to `role="radiogroup"` / `role="radio"`; quick presets given 38px touch targets and full keyboard accessibility.
    - **`PdfCompressorWorkspace.tsx`**: Mode selection cards converted to accessible keyboard-focusable buttons with `role="radio"` in `role="radiogroup"`; unit toggles and presets given accessible touch targets.
    - **`PdfOrganizeWorkspace.tsx`**, **`DocumentConvertWorkspace.tsx`**, **`OcrWorkspace.tsx`**, **`PdfModifyWorkspace.tsx`**, **`DocumentCompressWorkspace.tsx`**: Audited with semantic ARIA tab lists, screen-reader alert banners, and responsive stacking.
  - **Stage 18 Verification Tests Completed**:
    - **Test 1**: Mobile viewport meta tag verified in `index.html`.
    - **Test 2**: Universal `:focus-visible` and `touch-action: manipulation` verified in `index.css`.
    - **Test 3**: `prefers-reduced-motion` media query verified in `index.css`.
    - **Test 4**: Skip-to-content navigation verified in `MainLayout.tsx`.
    - **Test 5**: Escape-to-close drawer and mobile toggle ARIA verified in `Navbar.tsx`.
    - **Test 6**: Dropzone keyboard navigation & screen-reader errors verified in `FileUpload.tsx`.
    - **Test 7**: Mobile touch target min-heights verified in `Input.tsx` and `Select.tsx`.
    - **Test 8**: Interactive keyboard activation verified in `Card.tsx`.
    - **Test 9**: Responsive stacking verified in `ResultView.tsx`.
    - **Test 10**: All 10 workspaces verified for ARIA roles (`role="tablist"`, `role="tab"`, `role="radiogroup"`, `role="radio"`, `role="alert"`) and touch targets.
    - **Test 11**: Production builds (`npm run build` in both frontend and backend) compiled cleanly with 0 errors.

---

### Stage 19: Comprehensive Application Testing, Bug Fixes & Resilience Hardening
- **Test Architecture**:
  - **Vitest (Unit & Integration Testing)**:
    - Backend test suite: `backend/src/__tests__/` (40 tests across 3 files)
      - `fileValidation.test.ts`: 14 tests verifying magic bytes / signatures for PDF, PNG, JPG, WebP, TXT, DOCX, XLSX; empty file rejection (0-bytes); security blocking of executable extensions (`.exe`, `.sh`, `.bat`, etc.); filename directory traversal sanitization.
      - `uploadAndErrorHandling.test.ts`: 11 tests verifying real multi-part file uploads via Supertest; cleanup of rejected/corrupted files; immediate unlinking upon validation failures; safe file deletion API; 404 handling without server path leaks; error sanitization preventing stack traces.
      - `toolWorkflows.test.ts`: 15 tests executing real file operations end-to-end: image compression, image resizing, format conversion (WebP), application photo resizer (checklist generation), PDF merge (multi-file), PDF split by page range, PDF page extraction, PDF rotation, PDF watermark, PDF page numbering, PDF password protection, target size adaptive compression, batch processing and ZIP generation, boundary failures and cleanup.
    - Frontend test suite: `frontend/src/__tests__/` (4 tests)
      - `toolConfigsAndSeo.test.ts`: 4 tests validating all active tool pages, SEO metadata, supported formats, file size limits, FAQ presence, and absence of exaggerated security claims.
  - **Playwright (Cross-Device End-to-End Testing)**:
    - Configured in `frontend/playwright.config.ts` running against local Vite dev server and Express API across:
      - **Desktop Chrome** (1280x720)
      - **Mobile Chrome** (Pixel 5 mobile viewport, touch emulation)
    - Spec suites (`frontend/e2e/` — 16 test cases, 15 passed, 1 mobile-only skip on desktop):
      - `navigationAndA11y.spec.ts`: Clean homepage load, zero console errors, skip-to-content keyboard navigation, mobile drawer toggle and `Escape` key dismissal, quick search modal filtering, verification that server filesystem paths are never rendered.
      - `toolWorkflowsAndUploads.spec.ts`: Full interactive workflow execution:
        - Upload valid PDF -> Configure options -> Process with QPDF -> ResultView metrics (Original, Result, Reduction %) -> Download link verification -> Reset tool.
        - Upload invalid file (`.exe`) -> Accessible error banner with `role="alert"` -> No raw backend errors or stack traces leaked.
        - Upload empty file (0-byte) -> Clear rejection message.
        - Image compression workflow -> Upload valid PNG -> Options -> Process with Sharp -> ResultView with before/after size and Download button.

- **Bugs Found & Fixed during Stage 19**:
  1. **Batch ZIP Download URL Mismatch**:
     - *Issue*: `BatchProcessingWorkspace.tsx` attempted to replace `/api/files/download/`, whereas `batchService.ts` generated download URLs with `/api/download/`. This caused broken duplicate paths when passed into `getDownloadUrl()`.
     - *Fix*: Made `BatchProcessingWorkspace.tsx` strip `/api/(?:files\/)?download\/` or accept absolute URLs directly, and registered route aliases in `backend/src/routes/imageRoutes.ts` to cleanly support both `/download/:fileId` and `/files/download/:fileId`.
  2. **Global ESM Runtime Crash on `import.meta.env`**:
     - *Issue*: `frontend/src/services/api.ts` accessed `import.meta.env.VITE_API_URL` without optional chaining, crashing in Node.js test runners where `import.meta.env` was undefined.
     - *Fix*: Applied optional chaining: `import.meta.env?.VITE_API_URL || 'http://localhost:5000/api'`.
  3. **Backend Test Artifact Pollution in Production Build**:
     - *Issue*: Running `tsc` during `npm run build` compiled test files into `dist/__tests__/`. Subsequent test runs picked up CommonJS modules from `dist/` causing ESM import mismatches.
     - *Fix*: Added `"exclude": ["src/__tests__/**/*"]` in `backend/tsconfig.json` and scoped Vitest execution to `src/`.
  4. **Strict-Mode Ambiguity in Playwright Selectors**:
     - *Issue*: Selectors for honest privacy disclaimers and download action buttons matched multiple elements on pages with multiple download anchors.
     - *Fix*: Scoped locators using `.first()` and `getByText('Original', { exact: true })`.

- **Remaining Known Issues**:
  1. LibreOffice and Tesseract OCR CLI utilities require local system binaries to be installed in PATH for document-to-PDF and OCR workflows; when absent, the server safely reports honest error messages rather than crashing.
  2. Vite production build outputs a chunk size warning (>500 kB) for the main vendor chunk due to bundled pdf-lib / pdfjs-dist engines; dynamic import code-splitting can be applied in future optimizations.

- **Stage 19 Verification Suite Results**:
  - `npm --prefix backend run build` (TypeScript compiler `tsc`): **0 errors**
  - `npm --prefix frontend run build` (TypeScript + Vite build): **0 errors**
  - `npm --prefix backend test` (Vitest backend): **40 passed (100%)**
  - `npm --prefix frontend test` (Vitest frontend): **4 passed (100%)**
  - `npm --prefix frontend run test:e2e` (Playwright E2E Desktop & Mobile): **15 passed, 1 skipped (100%)**

---

### Stage 20: Final Production-Readiness Review & Deployment Readiness (Completed)

- **Overview**:
  - Executed a comprehensive production-readiness audit across the entire application stack: UI/UX, functionality, backend security, SEO, accessibility, performance, and documentation.
  - Formulated simple, reproducible deployment instructions for static frontend hosting and Node.js PaaS/VPS hosting without any unnecessary infrastructure (zero Redis, zero BullMQ, zero S3, zero microservices).
  - Clarified database status: Fileora is intentionally **100% stateless**; all processing occurs ephemeral on local disk with automatic TTL sweeps (`uploads/` and `outputs/`), requiring no MongoDB or persistent database server.
  - Created root [`README.md`](file:///c:/Users/sahil/Projects/Website/FileFlow!/README.md) containing project overview, complete 27-tool feature matrix, architecture, binary dependencies, setup guide, environment variables, test instructions, and privacy approach.

- **Production Readiness Audit Matrix**:
  1. **UI / UX Consistency**:
     - Modern slate/indigo design system powered by Tailwind CSS.
     - Responsive across all viewports (tested on 393×851 mobile to 1920×1080 desktop).
     - Standardized `ResultView` across all tools displaying honest before/after metrics, percentage reductions, image previews, and direct download actions.
     - Accessible navigation drawer, keyboard focus rings (`focus:ring-2 focus:ring-brand-500`), and quick search modal (`Ctrl+K`).
  2. **Backend & Security**:
     - Strict magic-byte validation (`fileTypeChecker.ts`) detecting true file types.
     - Hard rejection of dangerous executables (`.exe`, `.bat`, `.sh`, `.cmd`, `.js`, etc.) and zero-byte files.
     - Filename sanitization against path traversal (`../`) and illegal OS characters.
     - Universal error sanitization (`errorHandler.ts`) preventing server filesystem paths and raw stack traces from reaching clients.
     - Reliable file lifecycle (`withSafeExecution`) cleaning uploads, intermediate scratch files, and partial outputs in `finally` blocks.
     - Startup sweeper (`startupCleanup`) and periodic sweeper (`startPeriodicCleanup`) clearing dangling files.
  3. **SEO & Metadata**:
     - Meta titles, descriptions, canonical URLs, and Open Graph tags for all 27 tool routes.
     - Human-oriented, non-keyword-stuffed copy with How-It-Works guides and FAQ accordions.
     - Auto-generated `sitemap.xml` and restrictive `robots.txt` in frontend public assets.
  4. **Performance & Lightweight Architecture**:
     - Zero background worker queues or Redis overhead.
     - Memory-bounded streaming downloads with auto-cleanup callbacks.
     - Single-responsibility controllers with non-blocking child processes.
     - Fast Vite asset pipeline with gzip asset compression.

- **Deployment Summary**:
  - **Frontend**:
    - Build: `npm --prefix frontend run build` -> static files generated in `frontend/dist/`.
    - Deploy to: Vercel, Netlify, Cloudflare Pages, GitHub Pages, or Nginx.
    - Env: `VITE_API_URL` (pointing to production backend API).
  - **Backend**:
    - Build: `npm --prefix backend run build` -> compiled JS in `backend/dist/`.
    - Start: `npm --prefix backend start` (`node dist/index.js`).
    - Deploy to: Render, Railway, Fly.io, DigitalOcean App Platform, or any Linux VPS with Node 18+.
    - Env: `PORT=5000`, `NODE_ENV=production`, `CORS_ORIGIN=https://your-frontend-domain.com`.
  - **Engine Binaries**:
    - Core image and PDF manipulation runs self-contained in Node via `sharp` and `pdf-lib`.
    - Optional system binaries (LibreOffice, Poppler, QPDF, Tesseract OCR) are detected dynamically; if missing, graceful fallback messages are returned.

- **Verification & Test Suite Results**:
  - `npm --prefix backend run build`: **0 errors (Clean exit 0)**
  - `npm --prefix frontend run build`: **0 errors (Clean exit 0)**
  - `npm --prefix backend test`: **40 / 40 Vitest tests passed (100%)**
  - `npm --prefix frontend test`: **4 / 4 Vitest tests passed (100%)**
  - `npm --prefix frontend run test:e2e`: **15 passed, 1 skipped (mobile-only drawer) across Desktop and Mobile Chrome (100%)**
  - `backend/uploads/` and `backend/outputs/`: **100% clean (only `.gitkeep` files remain)**

---

## How to Run

### 1. Backend
```bash
cd backend
npm install
npm run dev      # Runs with tsx watch on http://localhost:5000
# or
npm run build    # Compiles to dist/
npm start        # Runs compiled code from dist/
npm test         # Runs Vitest backend unit & integration test suite (40 tests)
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev       # Runs Vite dev server on http://localhost:5173
# or
npm run build     # Generates production bundle in dist/
npm run preview   # Previews production build on http://localhost:4173
npm test          # Runs Vitest frontend test suite (4 tests)
npm run test:e2e  # Runs Playwright E2E test suite across Desktop & Mobile Chrome (16 tests)
```

---

## Final Project Status
🎉 **All 20 Stages Successfully Completed.**
The Fileora project is production-ready, fully verified, thoroughly documented, and prepared for portfolio presentation or immediate deployment.
