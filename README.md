# Fileora — Lightweight, Privacy-First File Utilities Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)

Fileora is a fast, straightforward, privacy-centric web platform for file conversions, compression, PDF utilities, and document processing. Built as a clean, production-ready MERN/TypeScript portfolio project, Fileora emphasizes engineering clarity, honest processing, zero simulated progress bars, and automated temporary file cleanup without cloud infrastructure bloat.

---

## Table of Contents

- [Key Features & Implemented Tools](#key-features--implemented-tools)
- [Architectural Principles & Non-Goals](#architectural-principles--non-goals)
- [Technology Stack](#technology-stack)
- [External Processing Dependencies](#external-processing-dependencies)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Development & Testing Commands](#development--testing-commands)
- [Production Deployment Guide](#production-deployment-guide)
- [Privacy & Security Approach](#privacy--security-approach)

---

## Key Features & Implemented Tools

Fileora implements **27 genuine, functional file utilities** across 5 specialized domains:

### 1. PDF Manipulation & Optimization
- **PDF Compressor (`/pdf-compressor`)**: Basic structural optimization, strong compression, and custom target size settings powered by QPDF.
- **Target-Size Compressor (`/target-compressor`)**: Bounded iterative compression algorithm to converge files directly toward exact target ceilings (e.g. 500 KB, 1 MB).
- **PDF Merge (`/pdf-merge`)**: Combine multiple PDF files in custom order with page count validation.
- **PDF Split (`/pdf-split`)**: Split documents by page range or extract every page into separate files.
- **Extract PDF Pages (`/pdf-extract`)**: Isolate and extract specific page subsets into a fresh document.
- **Reorder PDF Pages (`/pdf-reorder`)**: Visual page sequencing and custom arrangement.
- **Rotate PDF Pages (`/pdf-rotate`)**: Rotate pages by 90°, 180°, or 270°.
- **PDF Crop (`/crop-pdf`)**: Trim margins and bounding boxes by percentage or points.
- **PDF Watermark (`/watermark-pdf`)**: Apply customizable text watermarks with opacity and diagonal positioning.
- **PDF Page Numbers (`/page-numbers-pdf`)**: Insert formatted page numbering (e.g. "Page 1 of 5").
- **PDF Password Protection (`/protect-pdf`)**: Standard PDF user-password encryption.
- **PDF Signature Placement (`/sign-pdf`)**: Interactive visual placement of drawn or uploaded signatures onto document pages.

### 2. High-Performance Image Studio
- **Image Compressor (`/image-compressor`)**: High-throughput compression using native libvips via Sharp (JPEG, PNG, WebP) with EXIF metadata stripping.
- **Image Resizer (`/image-resizer`)**: Exact pixel dimensions or percentage scaling with aspect ratio locking.
- **Image Format Converter (`/image-converter`)**: Transcode between JPG, PNG, and modern WebP formats.
- **Passport Photo Resizer (`/passport-photo-resizer`)**: Standard passport/exam templates with 4-point dimension and byte ceiling validation reports.
- **Signature Resizer (`/signature-resizer`)**: Scale and pad digital signature crops to strict application guidelines.

### 3. Document & Office Conversions
- **Word to PDF (`/word-to-pdf`)**: Headless document compilation for DOC and DOCX files.
- **Excel to PDF (`/excel-to-pdf`)**: Headless spreadsheet rendering for XLS and XLSX files.
- **PDF to JPG / PNG (`/pdf-to-image`)**: Page-by-page high-resolution rendering using Poppler.
- **Images to PDF (`/image-to-pdf`)**: Combine JPG/PNG assets into a standardized PDF document.
- **Compress Word Document (`/compress-word`)**: True package XML media optimization for DOCX.
- **Compress PowerPoint (`/compress-powerpoint`)**: True package XML media optimization for PPTX.

### 4. OCR & Text Extraction
- **Image to Text (`/image-to-text`)**: Extract printed text from images using Tesseract OCR.
- **Scanned PDF to Text (`/scanned-pdf-to-text`)**: Multi-page rasterization and optical character recognition.
- **Scanned PDF to Word (`/pdf-to-word`)**: Generate editable DOCX documents from extracted OCR text.

### 5. Multi-File Batch Studio
- **Batch Processing (`/batch`)**: Bulk image compression, format transcoding, and PDF compression with per-file status reporting and consolidated ZIP bundle downloads.

---

## Architectural Principles & Non-Goals

Fileora strictly avoids premature infrastructure complexity:

- **Local Temporary Filesystem**: Incoming uploads and generated outputs reside on local disk (`backend/uploads/` and `backend/outputs/`) with automated time-to-live (TTL) directory sweepers.
- **Zero Raw Error Leaks**: Error handlers intercept all exceptions, stripping internal filesystem paths (e.g. `C:\...` or `/var/...`) and stack traces before responding to clients.
- **Explicit Non-Goals (DO NOT ADD)**:
  - ❌ **No Redis / BullMQ / Kafka**: Synchronous Express worker architecture is completely sufficient for single-server file utilities.
  - ❌ **No AWS S3 / Cloudflare R2**: All operations are ephemeral; zero permanent cloud object storage.
  - ❌ **No Kubernetes / Microservices**: Monolithic, maintainable structure ideal for portfolio evaluation and single-instance deployments.
  - ❌ **No Fake Progress**: No fake 1%...99% timers; honest loading states with real status feedback.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Router v7, Framer Motion, Lucide React |
| **Backend** | Node.js, Express 4, TypeScript, Multer, Sharp (libvips), pdf-lib, docx, tesseract.js, archiver |
| **System Binaries** | QPDF (structural PDF processing), Poppler (`pdftoppm`), LibreOffice (headless office conversions) |
| **Testing** | Vitest (unit & integration), Playwright (cross-device desktop & mobile E2E) |

---

## External Processing Dependencies

While Sharp and pdf-lib run out-of-the-box via npm, advanced office conversion and PDF rasterization leverage standard open-source command-line utilities. Fileora includes auto-detection fallback logic (`pdfBinFinder.ts`):

1. **Sharp (libvips)**: Pre-compiled binaries installed automatically via `npm install sharp`.
2. **QPDF**:
   - **Ubuntu/Debian**: `sudo apt-get install qpdf`
   - **macOS**: `brew install qpdf`
   - **Windows**: `winget install qpdf` or place `qpdf.exe` in `backend/bin/qpdf/bin/`.
3. **Poppler** (for PDF to Image rasterization):
   - **Ubuntu/Debian**: `sudo apt-get install poppler-utils`
   - **macOS**: `brew install poppler`
   - **Windows**: Download Poppler for Windows and add `bin/` to system PATH.
4. **LibreOffice** (for Word/Excel to PDF conversion):
   - **Ubuntu/Debian**: `sudo apt-get install libreoffice --no-install-recommends`
   - **macOS**: `brew install --cask libreoffice`
   - **Windows**: Install standard LibreOffice to default directory (`C:\Program Files\LibreOffice`).

> *Note: If an optional binary is not installed, Fileora safely catches the invocation and displays an honest notification rather than crashing.*

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your local environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Start development server:
   ```bash
   npm run dev
   ```
   *The API will start on `http://localhost:5000` with automated watch reloads.*

### Frontend Setup

1. In a separate terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create frontend environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Start Vite development server:
   ```bash
   npm run dev
   ```
   *Access the web application at `http://localhost:5173`.*

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port on which the Express server listens |
| `NODE_ENV` | `development` | Environment mode (`development` or `production`) |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed origin for Cross-Origin Resource Sharing |
| `MAX_FILE_SIZE_MB` | `50` | Maximum single-file upload threshold in megabytes |
| `FILE_TTL_MINUTES` | `30` | Age after which temporary files are purged by the background sweeper |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `http://localhost:5000/api` | Base URL pointing to the Express backend API endpoints |

---

## Development & Testing Commands

### Backend Tests (Vitest)
```bash
cd backend
npm test               # Run all 40 unit and integration tests
npm run build          # Compile TypeScript to dist/
npm start              # Run compiled production server
```

### Frontend Tests (Vitest & Playwright)
```bash
cd frontend
npm test               # Run frontend unit tests (SEO, registry, api)
npm run test:e2e       # Run Playwright cross-device E2E tests (Desktop & Mobile)
npm run build          # Generate production distribution in dist/
npm run preview        # Preview production build locally on port 4173
```

---

## Production Deployment Guide

Deploying Fileora is simple and cost-effective because it does not require external database clusters or message brokers.

### 1. Frontend Deployment (Static Hosting)
Deploy `frontend/dist/` to any static CDN host (e.g., Cloudflare Pages, Netlify, Vercel, or Nginx):
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variable**: `VITE_API_URL=https://api.yourdomain.com/api`
- **Single Page App Routing**: Ensure all routes rewrite to `/index.html` (e.g. `/* /index.html 200` on Netlify or standard Nginx `try_files $uri $uri/ /index.html;`).

### 2. Backend Deployment (Node.js VPS or PaaS)
Deploy `backend/` to any Node-compatible container or VM (e.g., Render, Railway, DigitalOcean Droplet, Fly.io, or Ubuntu VPS):
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `PORT=5000`
  - `NODE_ENV=production`
  - `CORS_ORIGIN=https://yourdomain.com`
  - `MAX_FILE_SIZE_MB=50`
  - `FILE_TTL_MINUTES=30`
- **Disk Persistence**: Ensure the process has write permissions to `./uploads` and `./outputs`.

### 3. Database
- **No Database Required**: Fileora is intentionally stateless. All transformations execute in memory or temporary disk storage with automatic cleanup.

---

## Privacy & Security Approach

Fileora is designed around strict digital privacy:

- **Automatic File Purging**: Uploaded inputs and processed outputs are purged immediately after processing where possible, or cleaned up by the automatic background sweeper after 30 minutes.
- **No Permanent Retention**: Files are never stored long-term, indexed, or shared with third parties.
- **Deep Signature Inspection**: Uploaded files undergo magic-byte signature validation to block disguised executables and corrupt data.
- **Path Sanitization**: User-facing responses and error messages are filtered through regular expression sanitizers to ensure internal filesystem directories are never disclosed.
- **Honest Communications**: No misleading claims like "100% military-grade secure"; Fileora provides plain-English, realistic security explanations.

---

## License

This project is open-source under the [MIT License](LICENSE). Built for academic portfolio and portfolio evaluation purposes.

