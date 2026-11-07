export interface StepItem {
  number: number;
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface RelatedTool {
  path: string;
  title: string;
  description: string;
  category: 'pdf' | 'image' | 'document' | 'application';
}

export interface ToolPageConfig {
  slug: string;
  path: string;
  seoTitle: string;
  seoDescription: string;
  headerBadge: string;
  headerCategory: 'pdf' | 'image' | 'document' | 'application';
  title: string;
  description: string;
  supportedFormats: string[];
  maxFileSizeMB: number;
  howItWorks: StepItem[];
  faqs: FaqItem[];
  relatedTools: RelatedTool[];
}

export const TOOL_PAGE_CONFIGS: Record<string, ToolPageConfig> = {
  'pdf-compressor': {
    slug: 'pdf-compressor',
    path: '/pdf-compressor',
    seoTitle: 'Compress PDF Online — Reduce PDF File Size Free',
    seoDescription: 'Shrink large PDF files while preserving readability. Choose basic optimization, strong compression, or a custom target size ceiling.',
    headerBadge: 'Real QPDF Engine',
    headerCategory: 'pdf',
    title: 'PDF Compressor',
    description: 'Reduce the file size of your PDF documents quickly without sacrificing readable text quality or clarity.',
    supportedFormats: ['.pdf'],
    maxFileSizeMB: 50,
    howItWorks: [
      {
        number: 1,
        title: 'Upload Your PDF',
        description: 'Drag and drop your PDF file or click to select it from your device.',
      },
      {
        number: 2,
        title: 'Choose Compression Mode',
        description: 'Select Basic (preserves maximum fidelity), Strong (maximum space reduction), or Target Size.',
      },
      {
        number: 3,
        title: 'Download Optimized File',
        description: 'Download your optimized PDF immediately. The original upload is automatically purged from the server.',
      },
    ],
    faqs: [
      {
        question: 'Will compression affect the visual quality of my document?',
        answer: 'Basic compression optimizes stream flate compression and object streams without altering text or vector assets. Strong compression recompresses embedded photos to a balanced quality level while maintaining legible text.',
      },
      {
        question: 'Are vector fonts and hyperlinks preserved?',
        answer: 'Yes. QPDF stream optimization keeps embedded font tables, vector line work, and document hyperlinks fully intact.',
      },
      {
        question: 'How long are my files kept on your server?',
        answer: 'Files are temporarily processed on our server and automatically deleted after processing. We do not maintain permanent storage.',
      },
    ],
    relatedTools: [
      { path: '/target-compressor', title: 'Target-Size Compressor', description: 'Compress documents to a specific target KB or MB limit.', category: 'pdf' },
      { path: '/pdf-merge', title: 'Merge PDF', description: 'Combine multiple PDF documents into a single clean file.', category: 'pdf' },
      { path: '/pdf-split', title: 'Split PDF', description: 'Extract pages or split a PDF into separate files.', category: 'pdf' },
      { path: '/protect-pdf', title: 'Protect PDF', description: 'Add 256-bit AES password encryption to sensitive PDFs.', category: 'pdf' },
    ],
  },

  'target-compressor': {
    slug: 'target-compressor',
    path: '/target-compressor',
    seoTitle: 'Target-Size File Compressor — Compress PDF & Images to Exact MB/KB',
    seoDescription: 'Compress PDF files and images to a specific target size such as 5 MB, 1 MB, or 500 KB with iterative tuning and honest reporting.',
    headerBadge: 'Iterative Tuning Engine',
    headerCategory: 'pdf',
    title: 'Target-Size Compressor',
    description: 'Compress PDF documents and images to your exact required file size limit with bounded iterative calibration.',
    supportedFormats: ['.pdf', '.jpg', '.jpeg', '.png', '.webp'],
    maxFileSizeMB: 50,
    howItWorks: [
      {
        number: 1,
        title: 'Upload Document or Photo',
        description: 'Select the PDF or image file you need to compress to a specific file size.',
      },
      {
        number: 2,
        title: 'Specify Your Target Size',
        description: 'Enter your desired ceiling in megabytes (MB) or kilobytes (KB), e.g. 5 MB or 500 KB.',
      },
      {
        number: 3,
        title: 'Iterative Calibration',
        description: 'The engine tests compression iterations within bounded safe limits to match your target without excessive processing.',
      },
    ],
    faqs: [
      {
        question: 'Can any file reach any target size?',
        answer: 'No. Some documents contain non-compressible vector data or uncompressed text streams that cannot be shrunk past a certain point. We honestly report the closest achievable size rather than claiming an impossible exact match.',
      },
      {
        question: 'How many iterations are performed?',
        answer: 'The system runs up to 4 bounded calibration trials to prevent excessive server load and deliver quick results in under a few seconds.',
      },
      {
        question: 'What happens to the trial files?',
        answer: 'All intermediate trials and uploads are automatically unlinked from the server disk as soon as processing completes.',
      },
    ],
    relatedTools: [
      { path: '/pdf-compressor', title: 'PDF Compressor', description: 'Standard basic and strong preset PDF optimization.', category: 'pdf' },
      { path: '/image-compressor', title: 'Image Compressor', description: 'Fast lossy and lossless image compression.', category: 'image' },
      { path: '/passport-photo-resizer', title: 'Passport Photo Resizer', description: 'Resize photos to exact pixel and KB restrictions.', category: 'application' },
      { path: '/batch', title: 'Batch Processing', description: 'Compress multiple files at once with a ZIP archive.', category: 'image' },
    ],
  },

  'pdf-merge': {
    slug: 'pdf-merge',
    path: '/pdf-merge',
    seoTitle: 'Merge PDF Files Online Free — Combine Multiple PDFs into One',
    seoDescription: 'Combine multiple PDF documents into a single organized file in seconds. Reorder documents visually and download your merged PDF.',
    headerBadge: 'Multi-File Merge',
    headerCategory: 'pdf',
    title: 'Merge PDF Files',
    description: 'Combine two or more PDF files into a single, unified document with custom sequencing and fast server processing.',
    supportedFormats: ['.pdf'],
    maxFileSizeMB: 50,
    howItWorks: [
      {
        number: 1,
        title: 'Upload Multiple PDFs',
        description: 'Upload two or more PDF documents you wish to combine into one file.',
      },
      {
        number: 2,
        title: 'Arrange Document Order',
        description: 'Re-sequence your uploaded files using the up and down controls to set the exact document order.',
      },
      {
        number: 3,
        title: 'Combine & Download',
        description: 'Click Merge to generate a single cohesive PDF document, validated and ready to download.',
      },
    ],
    faqs: [
      {
        question: 'Is there a limit on how many PDFs I can merge?',
        answer: 'You can merge up to 10 PDF documents per operation with a total batch size of up to 50 MB.',
      },
      {
        question: 'Does merging preserve original page orientation?',
        answer: 'Yes. Landscape and portrait orientations across different documents are preserved during the merge operation.',
      },
      {
        question: 'Do you keep copies of my merged documents?',
        answer: 'Files are temporarily processed on our server and automatically deleted after processing. No documents are permanently stored.',
      },
    ],
    relatedTools: [
      { path: '/pdf-split', title: 'Split PDF', description: 'Divide a large PDF into individual pages or ranges.', category: 'pdf' },
      { path: '/pdf-organizer', title: 'PDF Organizer Suite', description: 'Full workspace for merging, splitting, and reordering.', category: 'pdf' },
      { path: '/pdf-compressor', title: 'Compress PDF', description: 'Shrink your newly merged PDF for email and uploads.', category: 'pdf' },
      { path: '/word-to-pdf', title: 'Word to PDF', description: 'Convert Word docs to PDF before combining them.', category: 'document' },
    ],
  },

  'pdf-split': {
    slug: 'pdf-split',
    path: '/pdf-split',
    seoTitle: 'Split PDF Online Free — Extract Pages or Split by Range',
    seoDescription: 'Split large PDF documents into smaller files. Specify custom page ranges like 1-3, 5, or split every page into a standalone document.',
    headerBadge: 'Page Range Splitter',
    headerCategory: 'pdf',
    title: 'Split PDF Document',
    description: 'Split your PDF file by specifying custom page ranges or extract each page into its own individual document.',
    supportedFormats: ['.pdf'],
    maxFileSizeMB: 50,
    howItWorks: [
      {
        number: 1,
        title: 'Select Your PDF',
        description: 'Upload the multi-page PDF document you want to split or extract from.',
      },
      {
        number: 2,
        title: 'Set Page Ranges',
        description: 'Choose between a custom page range (e.g. 1-4, 7-10) or split every page individually.',
      },
      {
        number: 3,
        title: 'Download Split Result',
        description: 'Download your split PDF document or a packaged ZIP archive for multi-page splits.',
      },
    ],
    faqs: [
      {
        question: 'How do I specify page ranges?',
        answer: 'You can use commas and hyphens, for example: "1-3, 5, 8-10". Any valid page numbers within the document bounds are included.',
      },
      {
        question: 'What happens if I split every page?',
        answer: 'When splitting every page, Filoro generates individual single-page PDFs and packages them into a convenient ZIP archive.',
      },
      {
        question: 'Will text and images remain sharp?',
        answer: 'Yes. The underlying PDF streams and vector data are sliced cleanly without rasterizing or recompressing text.',
      },
    ],
    relatedTools: [
      { path: '/pdf-merge', title: 'Merge PDF', description: 'Combine multiple PDF files into one clean document.', category: 'pdf' },
      { path: '/pdf-extract', title: 'Extract PDF Pages', description: 'Select and export specific individual pages.', category: 'pdf' },
      { path: '/pdf-compressor', title: 'Compress PDF', description: 'Reduce file size of your split PDF files.', category: 'pdf' },
      { path: '/crop-pdf', title: 'Crop PDF', description: 'Trim whitespace and margins from your pages.', category: 'pdf' },
    ],
  },

  'image-compressor': {
    slug: 'image-compressor',
    path: '/image-compressor',
    seoTitle: 'Compress Images Online Free — JPG, PNG, and WebP Compressor',
    seoDescription: 'Reduce image file size without noticeable quality loss. Optimize JPEG, PNG, and WebP photos with custom compression presets and EXIF stripping.',
    headerBadge: 'Sharp Engine Powered',
    headerCategory: 'image',
    title: 'Image Compressor',
    description: 'Compress JPG, PNG, and WebP images efficiently. Strip unnecessary EXIF camera metadata and save up to 80% bandwidth.',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    maxFileSizeMB: 25,
    howItWorks: [
      {
        number: 1,
        title: 'Upload Your Photo',
        description: 'Select or drag-and-drop any JPG, PNG, or WebP image.',
      },
      {
        number: 2,
        title: 'Select Compression Level',
        description: 'Choose Light (85% quality), Balanced (75% quality), or Strong (60% quality with palette quantization).',
      },
      {
        number: 3,
        title: 'Download Optimized Image',
        description: 'View the before and after file size comparison and download your lightweight compressed image.',
      },
    ],
    faqs: [
      {
        question: 'Does image compression remove transparent backgrounds?',
        answer: 'No. PNG and WebP transparency channels (alpha) are completely preserved during compression.',
      },
      {
        question: 'What is EXIF metadata stripping?',
        answer: 'Cameras and phones embed private details like GPS coordinates, camera model, and timestamp. Stripping this metadata protects privacy and saves extra bytes.',
      },
      {
        question: 'Can I compress multiple photos at once?',
        answer: 'Yes! Use our Batch Processing Studio to upload up to 15 images at once and download them in a single ZIP.',
      },
    ],
    relatedTools: [
      { path: '/image-resizer', title: 'Resize Image', description: 'Scale image dimensions in pixels or percentages.', category: 'image' },
      { path: '/image-converter', title: 'Image Converter', description: 'Convert between JPG, PNG, and WebP formats.', category: 'image' },
      { path: '/batch', title: 'Batch Processing', description: 'Compress multiple images simultaneously.', category: 'image' },
      { path: '/passport-photo-resizer', title: 'Passport Photo Resizer', description: 'Format photos for official application portals.', category: 'application' },
    ],
  },

  'image-resizer': {
    slug: 'image-resizer',
    path: '/image-resizer',
    seoTitle: 'Resize Image Online Free — Change Pixel Dimensions & Percentage',
    seoDescription: 'Resize photos and graphics easily. Enter custom pixel widths and heights with aspect ratio lock or scale by percentage.',
    headerBadge: 'Aspect Ratio Lock',
    headerCategory: 'image',
    title: 'Image Resizer',
    description: 'Resize JPG, PNG, and WebP images to exact pixel dimensions or scale them by percentage with aspect ratio protection.',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp', '.svg'],
    maxFileSizeMB: 25,
    howItWorks: [
      {
        number: 1,
        title: 'Upload Image',
        description: 'Select the image you want to resize from your computer or mobile device.',
      },
      {
        number: 2,
        title: 'Set Dimensions or Scale',
        description: 'Enter your desired width and height in pixels, or choose a percentage scaling factor like 50% or 75%.',
      },
      {
        number: 3,
        title: 'Download Resized Image',
        description: 'Download the newly dimensioned image with crisp interpolation and zero blur.',
      },
    ],
    faqs: [
      {
        question: 'Will resizing distort my photo?',
        answer: 'By default, the aspect ratio lock is enabled, ensuring the original proportions of your image are strictly preserved without stretching.',
      },
      {
        question: 'What interpolation method is used?',
        answer: 'We use high-performance Lanczos3 resampling via libvips/sharp to deliver crisp downscaling and clean edges.',
      },
      {
        question: 'Are my images stored after resizing?',
        answer: 'Files are temporarily processed on our server and automatically deleted after processing. No images are saved permanently.',
      },
    ],
    relatedTools: [
      { path: '/image-compressor', title: 'Compress Image', description: 'Reduce image file size after resizing.', category: 'image' },
      { path: '/image-converter', title: 'Convert Image', description: 'Switch image format between JPG, PNG, and WebP.', category: 'image' },
      { path: '/passport-photo-resizer', title: 'Passport Photo Resizer', description: 'Quick presets for official government photo sizes.', category: 'application' },
      { path: '/signature-resizer', title: 'Signature Resizer', description: 'Resize exam application signatures.', category: 'application' },
    ],
  },

  'pdf-to-word': {
    slug: 'pdf-to-word',
    path: '/pdf-to-word',
    seoTitle: 'PDF to Word Converter Online Free — Scanned PDF to DOCX via OCR',
    seoDescription: 'Convert scanned PDF documents into editable Microsoft Word (.docx) files. Real Tesseract optical character recognition extracts readable text.',
    headerBadge: 'Tesseract OCR Engine',
    headerCategory: 'document',
    title: 'PDF to Word (OCR)',
    description: 'Convert scanned PDF documents into an editable Microsoft Word (.docx) document with recognized text and structured paragraphs.',
    supportedFormats: ['.pdf'],
    maxFileSizeMB: 30,
    howItWorks: [
      {
        number: 1,
        title: 'Upload Scanned PDF',
        description: 'Upload your scanned document or PDF contract containing printed text.',
      },
      {
        number: 2,
        title: 'OCR Recognition',
        description: 'Our engine renders each page at high DPI and runs optical character recognition to extract typed words.',
      },
      {
        number: 3,
        title: 'Download Word DOCX',
        description: 'Download your editable .docx file, ready to open and edit in Microsoft Word, Google Docs, or LibreOffice.',
      },
    ],
    faqs: [
      {
        question: 'How accurate is optical character recognition (OCR)?',
        answer: 'OCR accuracy depends heavily on scan resolution, lighting, contrast, and font clarity. High-resolution printed documents achieve high recognition accuracy, though manual proofreading is always recommended.',
      },
      {
        question: 'Can it convert handwritten notes?',
        answer: 'Tesseract OCR is designed for printed and typed typography. Handwriting or cursive script may yield lower accuracy.',
      },
      {
        question: 'Do you keep any text from my documents?',
        answer: 'Files are temporarily processed on our server and automatically deleted after processing. We never store, index, or inspect document text.',
      },
    ],
    relatedTools: [
      { path: '/word-to-pdf', title: 'Word to PDF', description: 'Convert Word documents back to standard PDF format.', category: 'document' },
      { path: '/image-to-text', title: 'Image to Text', description: 'Extract text from photo scans and screenshots.', category: 'image' },
      { path: '/scanned-pdf-to-text', title: 'Scanned PDF to Text', description: 'Extract plain text from scanned PDF documents.', category: 'pdf' },
      { path: '/pdf-compressor', title: 'Compress PDF', description: 'Reduce file size of your original PDF files.', category: 'pdf' },
    ],
  },

  'word-to-pdf': {
    slug: 'word-to-pdf',
    path: '/word-to-pdf',
    seoTitle: 'Word to PDF Converter Online Free — Convert DOCX & DOC to PDF',
    seoDescription: 'Convert Microsoft Word documents (.docx, .doc) to PDF using real LibreOffice headless conversion with preserved styling and tables.',
    headerBadge: 'LibreOffice Engine',
    headerCategory: 'document',
    title: 'Word to PDF Converter',
    description: 'Convert Microsoft Word (.docx and .doc) files into clean, universal PDF documents with high layout fidelity.',
    supportedFormats: ['.docx', '.doc'],
    maxFileSizeMB: 40,
    howItWorks: [
      {
        number: 1,
        title: 'Upload Word Document',
        description: 'Select your .docx or legacy .doc file from your computer.',
      },
      {
        number: 2,
        title: 'Document Conversion',
        description: 'LibreOffice headless formats your document, maintaining headings, margins, tables, and page numbers.',
      },
      {
        number: 3,
        title: 'Download Valid PDF',
        description: 'Download your converted PDF document, validated with structural integrity checks.',
      },
    ],
    faqs: [
      {
        question: 'Are embedded images and tables preserved?',
        answer: 'Yes. LibreOffice renders embedded images, bulleted lists, header styles, and table borders directly into the PDF layout.',
      },
      {
        question: 'Does formatting differ from Microsoft Word?',
        answer: 'While LibreOffice provides high conversion fidelity, non-standard proprietary Word fonts or complex VBA macro styling may show subtle visual variations.',
      },
      {
        question: 'Are my business documents secure?',
        answer: 'Files are temporarily processed on our server and automatically deleted after processing. No files are retained on our server disks.',
      },
    ],
    relatedTools: [
      { path: '/pdf-to-word', title: 'PDF to Word', description: 'Convert scanned PDF documents into editable Word files.', category: 'document' },
      { path: '/excel-to-pdf', title: 'Excel to PDF', description: 'Convert spreadsheets into readable PDF documents.', category: 'document' },
      { path: '/compress-word', title: 'Compress Word', description: 'Reduce file size of large Word documents with pictures.', category: 'document' },
      { path: '/pdf-merge', title: 'Merge PDF', description: 'Combine your converted PDF with other documents.', category: 'pdf' },
    ],
  },

  'passport-photo-resizer': {
    slug: 'passport-photo-resizer',
    path: '/passport-photo-resizer',
    seoTitle: 'Passport Photo Resizer Online — Format Photos for Govt & Exam Applications',
    seoDescription: 'Resize photos to exact 350x450px or 200x230px dimensions with KB size limits (under 50KB or 20KB). Real-time verification checklist included.',
    headerBadge: 'Automated Checklist Validator',
    headerCategory: 'application',
    title: 'Passport Photo Resizer',
    description: 'Resize passport and competitive exam application photos to exact pixel dimensions and strict file size ceilings with real-time verification.',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    maxFileSizeMB: 20,
    howItWorks: [
      {
        number: 1,
        title: 'Upload Portrait Photo',
        description: 'Select your passport-style photograph with clear lighting and a neutral background.',
      },
      {
        number: 2,
        title: 'Select Application Preset',
        description: 'Choose Standard Passport (350×450px, <50KB), Exam Portal (200×230px, <50KB), or customize your limits.',
      },
      {
        number: 3,
        title: 'Verify & Download',
        description: 'Check the 4-point verification checklist (Width, Height, Format, File Size) and download your compliant photo.',
      },
    ],
    faqs: [
      {
        question: 'What happens if my original photo is over the KB limit?',
        answer: 'Our adaptive compression pipeline carefully tunes JPEG quality to ensure the resulting photo stays strictly below your required maximum KB limit.',
      },
      {
        question: 'What is the 4-point verification checklist?',
        answer: 'The system inspects the generated output file to verify that width, height, format (JPG), and file size strictly meet the target portal specifications.',
      },
      {
        question: 'Do you store or use my photograph?',
        answer: 'Files are temporarily processed on our server and automatically deleted after processing. We do not store or share photos.',
      },
    ],
    relatedTools: [
      { path: '/signature-resizer', title: 'Signature Resizer', description: 'Format digital signatures for job and exam portals.', category: 'application' },
      { path: '/image-resizer', title: 'Image Resizer', description: 'Custom pixel dimensions scaling for any picture.', category: 'image' },
      { path: '/image-compressor', title: 'Image Compressor', description: 'Reduce photo size while preserving visual clarity.', category: 'image' },
      { path: '/target-compressor', title: 'Target Compressor', description: 'Compress photos to an exact KB ceiling.', category: 'pdf' },
    ],
  },

  'signature-resizer': {
    slug: 'signature-resizer',
    path: '/signature-resizer',
    seoTitle: 'Application Signature Resizer Online — Format Signatures for Portals',
    seoDescription: 'Resize scanned signatures to standard 140x60px dimensions and under 20KB limits for government, university, and competitive exam portals.',
    headerBadge: 'Application Preset Mode',
    headerCategory: 'application',
    title: 'Application Signature Resizer',
    description: 'Format scanned signatures to exact dimensions (e.g. 140×60px) and strict file size requirements (under 20KB or 30KB) with instant validation.',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    maxFileSizeMB: 20,
    howItWorks: [
      {
        number: 1,
        title: 'Upload Scanned Signature',
        description: 'Select your signature image written in dark ink on white paper.',
      },
      {
        number: 2,
        title: 'Select Signature Preset',
        description: 'Choose Standard (140×60px, <20KB), Wide (200×100px, <30KB), or High-Res (300×120px, <50KB).',
      },
      {
        number: 3,
        title: 'Verify & Download',
        description: 'Confirm all portal criteria are satisfied on the validation card and download your compliant signature file.',
      },
    ],
    faqs: [
      {
        question: 'Why do application portals reject signatures?',
        answer: 'Most rejections occur because the file exceeds 20KB or 50KB, or has incorrect pixel dimensions. Filoro normalizes both to ensure full compliance.',
      },
      {
        question: 'Will my signature remain legible at 140x60px?',
        answer: 'Yes. The resizer centers the signature with a clean white margin and sharp contrast so lines remain crisp.',
      },
      {
        question: 'Are signatures stored on your server?',
        answer: 'Files are temporarily processed on our server and automatically deleted after processing. Your personal signature is never saved.',
      },
    ],
    relatedTools: [
      { path: '/passport-photo-resizer', title: 'Passport Photo Resizer', description: 'Format passport photos for application portals.', category: 'application' },
      { path: '/sign-pdf', title: 'Sign PDF', description: 'Place your signature directly onto PDF documents.', category: 'pdf' },
      { path: '/image-resizer', title: 'Image Resizer', description: 'Custom dimension resizing for any image.', category: 'image' },
      { path: '/image-compressor', title: 'Image Compressor', description: 'Compress images to reduce size.', category: 'image' },
    ],
  },

  'pdf-to-image': {
    slug: 'pdf-to-image',
    path: '/pdf-to-image',
    seoTitle: 'PDF to Image Converter Online Free — Convert PDF to JPG or PNG',
    seoDescription: 'Render PDF document pages into high-resolution JPG or PNG images. Download individual page images or a complete ZIP archive.',
    headerBadge: 'Poppler pdftoppm Engine',
    headerCategory: 'pdf',
    title: 'PDF to Image Converter',
    description: 'Convert PDF document pages into high-resolution JPG or PNG images. Export individual pages or download all pages in a ZIP archive.',
    supportedFormats: ['.pdf'],
    maxFileSizeMB: 50,
    howItWorks: [
      {
        number: 1,
        title: 'Upload PDF Document',
        description: 'Select the PDF file you wish to render into images.',
      },
      {
        number: 2,
        title: 'Select Format & Resolution',
        description: 'Choose JPG (smaller size) or PNG (lossless crisp graphics) and specify resolution.',
      },
      {
        number: 3,
        title: 'Download Images',
        description: 'Download your high-resolution page images individually or as a complete ZIP archive.',
      },
    ],
    faqs: [
      {
        question: 'What is the rendering resolution?',
        answer: 'Pages are rendered using Poppler pdftoppm at 150 DPI, providing crisp readability for text, illustrations, and tables.',
      },
      {
        question: 'Can I choose between JPG and PNG?',
        answer: 'Yes. Choose JPG for photographs and smaller file sizes, or PNG for diagrams, transparent assets, and text documents.',
      },
      {
        question: 'Are original PDF files deleted after conversion?',
        answer: 'Files are temporarily processed on our server and automatically deleted after processing. Zero files remain on disk.',
      },
    ],
    relatedTools: [
      { path: '/image-to-pdf', title: 'Images to PDF', description: 'Convert JPG and PNG images back into a PDF file.', category: 'image' },
      { path: '/pdf-compressor', title: 'Compress PDF', description: 'Shrink PDF file size before converting.', category: 'pdf' },
      { path: '/pdf-split', title: 'Split PDF', description: 'Extract specific pages before rendering.', category: 'pdf' },
      { path: '/pdf-to-word', title: 'PDF to Word', description: 'Convert scanned PDFs to editable Word DOCX.', category: 'document' },
    ],
  },

  'image-to-pdf': {
    slug: 'image-to-pdf',
    path: '/image-to-pdf',
    seoTitle: 'Images to PDF Converter Online Free — Convert JPG & PNG to PDF',
    seoDescription: 'Combine multiple JPG and PNG images into a clean, structured PDF document. Supports custom A4 margins or exact image fit.',
    headerBadge: 'pdf-lib & Sharp',
    headerCategory: 'image',
    title: 'Images to PDF Converter',
    description: 'Combine one or multiple JPG and PNG photos into a clean, universal PDF document with customizable page sizing.',
    supportedFormats: ['.jpg', '.jpeg', '.png'],
    maxFileSizeMB: 40,
    howItWorks: [
      {
        number: 1,
        title: 'Select Image Files',
        description: 'Upload one or several JPG or PNG images from your device.',
      },
      {
        number: 2,
        title: 'Choose Page Layout',
        description: 'Select Fit (pages match image dimensions exactly) or Standard A4 with centered margins.',
      },
      {
        number: 3,
        title: 'Create & Download PDF',
        description: 'Download your newly generated PDF document, validated with structural integrity checks.',
      },
    ],
    faqs: [
      {
        question: 'Can I add multiple photos into a single PDF?',
        answer: 'Yes. You can upload multiple images at once and combine them into a single multi-page PDF document.',
      },
      {
        question: 'What page sizes are supported?',
        answer: 'You can choose between "Fit to Image" (which sets each page size to the native image resolution) or "Standard A4" (which scales each image neatly within A4 boundaries).',
      },
      {
        question: 'Do you keep copies of my pictures?',
        answer: 'Files are temporarily processed on our server and automatically deleted after processing. No photos are retained.',
      },
    ],
    relatedTools: [
      { path: '/pdf-to-image', title: 'PDF to Image', description: 'Export PDF pages back into JPG or PNG pictures.', category: 'pdf' },
      { path: '/pdf-merge', title: 'Merge PDF', description: 'Combine your new PDF with other existing documents.', category: 'pdf' },
      { path: '/pdf-compressor', title: 'Compress PDF', description: 'Reduce the file size of your generated PDF.', category: 'pdf' },
      { path: '/protect-pdf', title: 'Protect PDF', description: 'Password-protect your new PDF document.', category: 'pdf' },
    ],
  },

  'crop-pdf': {
    slug: 'crop-pdf',
    path: '/crop-pdf',
    seoTitle: 'Crop PDF Online Free — Trim PDF Margins & Page Boundaries',
    seoDescription: 'Crop margins and whitespace from PDF documents. Adjust top, bottom, left, and right margins in points or percentages.',
    headerBadge: 'CropBox & MediaBox',
    headerCategory: 'pdf',
    title: 'Crop PDF Margins',
    description: 'Trim excess margins or crop specific page boundaries across your PDF document for better reading on tablets and e-readers.',
    supportedFormats: ['.pdf'],
    maxFileSizeMB: 50,
    howItWorks: [
      {
        number: 1,
        title: 'Upload PDF Document',
        description: 'Upload the PDF document you wish to crop.',
      },
      {
        number: 2,
        title: 'Set Crop Margins',
        description: 'Specify margins to trim from top, bottom, left, and right in points or percentages.',
      },
      {
        number: 3,
        title: 'Download Cropped PDF',
        description: 'Download your cleanly cropped PDF with normalized CropBox and MediaBox boundaries.',
      },
    ],
    faqs: [
      {
        question: 'What is the difference between CropBox and MediaBox?',
        answer: 'MediaBox defines the physical paper boundary, while CropBox defines the visible viewport in PDF readers. Filoro sets both to ensure universal viewer compatibility.',
      },
      {
        question: 'Will text content be deleted?',
        answer: 'Cropping adjusts the visible boundary coordinates of pages. Text outside the crop boundary is hidden from view.',
      },
      {
        question: 'Are my files kept private?',
        answer: 'Files are temporarily processed on our server and automatically deleted after processing. Zero files are kept.',
      },
    ],
    relatedTools: [
      { path: '/pdf-compressor', title: 'Compress PDF', description: 'Reduce file size after trimming margins.', category: 'pdf' },
      { path: '/page-numbers-pdf', title: 'PDF Page Numbers', description: 'Add clean page numbers to your cropped document.', category: 'pdf' },
      { path: '/watermark-pdf', title: 'Watermark PDF', description: 'Add confidentiality stamps to document pages.', category: 'pdf' },
      { path: '/pdf-split', title: 'Split PDF', description: 'Extract specific pages before cropping.', category: 'pdf' },
    ],
  },

  'protect-pdf': {
    slug: 'protect-pdf',
    path: '/protect-pdf',
    seoTitle: 'Password Protect PDF Online Free — Encrypt PDF with 256-Bit AES',
    seoDescription: 'Secure sensitive PDF documents with standard 256-bit AES encryption and password protection. Passwords are never logged.',
    headerBadge: '256-Bit AES Encryption',
    headerCategory: 'pdf',
    title: 'Protect PDF with Password',
    description: 'Encrypt your PDF documents with industry-standard 256-bit AES encryption. Restrict unauthorized opening with a custom password.',
    supportedFormats: ['.pdf'],
    maxFileSizeMB: 50,
    howItWorks: [
      {
        number: 1,
        title: 'Upload Sensitive PDF',
        description: 'Upload the PDF document you wish to secure with password protection.',
      },
      {
        number: 2,
        title: 'Enter Strong Password',
        description: 'Enter your desired password. Passwords are treated in memory only and never logged.',
      },
      {
        number: 3,
        title: 'Download Encrypted PDF',
        description: 'Download your password-protected PDF file. It will require the password in any standard PDF reader.',
      },
    ],
    faqs: [
      {
        question: 'Do you store or log my password?',
        answer: 'Never. Passwords are passed directly into QPDF encryption arguments in ephemeral memory and are never written to disk or logs.',
      },
      {
        question: 'What encryption standard is applied?',
        answer: 'We apply 256-bit AES encryption (QPDF standard mode), which is compatible with Adobe Acrobat, Chrome, Preview, and all modern PDF viewers.',
      },
      {
        question: 'Can Filoro recover my password if I forget it?',
        answer: 'No. Because we practice zero-knowledge temporary processing and never store passwords, lost passwords cannot be recovered.',
      },
    ],
    relatedTools: [
      { path: '/sign-pdf', title: 'Sign PDF', description: 'Place your signature on sensitive contracts.', category: 'pdf' },
      { path: '/watermark-pdf', title: 'Watermark PDF', description: 'Stamp confidential watermarks on pages.', category: 'pdf' },
      { path: '/pdf-compressor', title: 'Compress PDF', description: 'Optimize your encrypted PDF before sending.', category: 'pdf' },
      { path: '/pdf-merge', title: 'Merge PDF', description: 'Combine documents before encrypting.', category: 'pdf' },
    ],
  },

  'batch-processing': {
    slug: 'batch-processing',
    path: '/batch-processing',
    seoTitle: 'Batch File Processing Online — Bulk Compress & Convert with ZIP',
    seoDescription: 'Process multiple images and PDFs in bulk. Compress, convert, and download all successful results in a single convenient ZIP archive.',
    headerBadge: 'Bulk Processing Studio',
    headerCategory: 'image',
    title: 'Batch Processing Studio',
    description: 'Compress and convert multiple files in a single click with partial failure isolation and one-click ZIP download.',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp', '.pdf'],
    maxFileSizeMB: 100,
    howItWorks: [
      {
        number: 1,
        title: 'Upload Multiple Files',
        description: 'Select up to 15 images or PDFs at once (up to 100 MB total).',
      },
      {
        number: 2,
        title: 'Select Batch Operation',
        description: 'Choose Image Compression, Image Format Conversion, or PDF Compression.',
      },
      {
        number: 3,
        title: 'One-Click ZIP Download',
        description: 'Review the file-by-file status list and download all processed files in a single ZIP archive.',
      },
    ],
    faqs: [
      {
        question: 'What happens if one file in the batch is corrupted?',
        answer: 'Filoro uses partial failure isolation: if one file fails, the remaining valid files still process successfully and are included in the ZIP download.',
      },
      {
        question: 'What is the batch upload limit?',
        answer: 'You can upload up to 15 files with a combined batch limit of 100 MB.',
      },
      {
        question: 'How are batch temporary files cleaned?',
        answer: 'Files are temporarily processed on our server and automatically deleted after processing. Individual inputs are deleted as each item finishes.',
      },
    ],
    relatedTools: [
      { path: '/image-compressor', title: 'Image Compressor', description: 'Compress single images with advanced presets.', category: 'image' },
      { path: '/pdf-compressor', title: 'PDF Compressor', description: 'Compress single PDFs with basic or target modes.', category: 'pdf' },
      { path: '/target-compressor', title: 'Target Compressor', description: 'Compress files to a specific KB limit.', category: 'pdf' },
      { path: '/image-converter', title: 'Image Converter', description: 'Convert images between JPG, PNG, and WebP.', category: 'image' },
    ],
  },

  'pdf-extract': {
    slug: 'pdf-extract',
    path: '/pdf-extract',
    seoTitle: 'Extract PDF Pages Online Free — Save Selected Pages',
    seoDescription: 'Extract specific pages from any PDF document into a clean, standalone file. Select pages visually or by page number.',
    headerBadge: 'Page Extractor',
    headerCategory: 'pdf',
    title: 'Extract PDF Pages',
    description: 'Select individual pages or ranges from a multi-page PDF document and export them into a new, compact PDF file.',
    supportedFormats: ['.pdf'],
    maxFileSizeMB: 50,
    howItWorks: [
      { number: 1, title: 'Upload PDF', description: 'Upload the PDF document you want to extract pages from.' },
      { number: 2, title: 'Select Pages', description: 'Choose the exact page numbers you wish to keep in your extracted document.' },
      { number: 3, title: 'Extract & Download', description: 'Download your new PDF containing only the selected pages.' }
    ],
    faqs: [
      { question: 'Does page extraction preserve formatting?', answer: 'Yes. All fonts, vector paths, illustrations, and formatting remain 100% identical to the source document.' },
      { question: 'Can I extract non-consecutive pages?', answer: 'Yes, you can pick any combination of pages (e.g. pages 1, 4, and 7).' },
      { question: 'Are files kept on your server?', answer: 'Files are temporarily processed on our server and automatically deleted after processing.' }
    ],
    relatedTools: [
      { path: '/pdf-split', title: 'Split PDF', description: 'Split document into page ranges or individual files.', category: 'pdf' },
      { path: '/pdf-merge', title: 'Merge PDF', description: 'Combine extracted pages with other files.', category: 'pdf' },
      { path: '/pdf-reorder', title: 'Reorder PDF', description: 'Visually rearrange pages in any order.', category: 'pdf' },
      { path: '/pdf-compressor', title: 'Compress PDF', description: 'Reduce the file size of your extracted PDF.', category: 'pdf' }
    ]
  },

  'pdf-reorder': {
    slug: 'pdf-reorder',
    path: '/pdf-reorder',
    seoTitle: 'Reorder PDF Pages Online Free — Rearrange PDF Page Order',
    seoDescription: 'Visually rearrange pages in any order. Drag and drop pages or use reordering controls to organize your PDF document.',
    headerBadge: 'Visual Page Sequencer',
    headerCategory: 'pdf',
    title: 'Reorder PDF Pages',
    description: 'Rearrange and re-sequence pages in your PDF document visually. Adjust page order with intuitive controls.',
    supportedFormats: ['.pdf'],
    maxFileSizeMB: 50,
    howItWorks: [
      { number: 1, title: 'Upload PDF File', description: 'Select the PDF document whose page sequence you want to re-organize.' },
      { number: 2, title: 'Rearrange Page Sequence', description: 'Move pages up or down to set your preferred order.' },
      { number: 3, title: 'Save Reordered PDF', description: 'Download the newly re-sequenced PDF document.' }
    ],
    faqs: [
      { question: 'Will hyperlinks and bookmarks still work?', answer: 'Page content and internal references are mapped to the new page sequence accurately.' },
      { question: 'Can I delete unwanted pages while reordering?', answer: 'Yes, you can also use our Extract or Split tools to eliminate unwanted pages.' },
      { question: 'Is my document private?', answer: 'Files are temporarily processed on our server and automatically deleted after processing.' }
    ],
    relatedTools: [
      { path: '/pdf-rotate', title: 'Rotate PDF', description: 'Rotate upside-down or sideways pages.', category: 'pdf' },
      { path: '/pdf-extract', title: 'Extract Pages', description: 'Select and export specific pages.', category: 'pdf' },
      { path: '/pdf-merge', title: 'Merge PDF', description: 'Combine multiple PDF documents together.', category: 'pdf' },
      { path: '/page-numbers-pdf', title: 'Page Numbers', description: 'Stamp updated page numbers onto reordered pages.', category: 'pdf' }
    ]
  },

  'pdf-rotate': {
    slug: 'pdf-rotate',
    path: '/pdf-rotate',
    seoTitle: 'Rotate PDF Pages Online Free — Rotate 90, 180, 270 Degrees',
    seoDescription: 'Rotate PDF pages permanently. Turn landscape or upside-down pages clockwise by 90°, 180°, or 270° in seconds.',
    headerBadge: 'Page Orientation Tool',
    headerCategory: 'pdf',
    title: 'Rotate PDF Pages',
    description: 'Rotate upside-down or sideways pages in your PDF document clockwise by 90°, 180°, or 270° with permanent orientation saving.',
    supportedFormats: ['.pdf'],
    maxFileSizeMB: 50,
    howItWorks: [
      { number: 1, title: 'Upload PDF', description: 'Upload the PDF document with rotated pages.' },
      { number: 2, title: 'Select Rotation Angle', description: 'Choose 90°, 180°, or 270° clockwise rotation across all pages or specific pages.' },
      { number: 3, title: 'Download Rotated Document', description: 'Download the updated PDF with permanent orientation adjustments.' }
    ],
    faqs: [
      { question: 'Is the rotation permanent?', answer: 'Yes. The rotation modifies the PDF page /Rotate attribute so the pages open correctly in all viewers.' },
      { question: 'Can I rotate only specific pages?', answer: 'Yes. You can target all pages or specify selected pages.' },
      { question: 'Does rotating degrade quality?', answer: 'Zero quality loss. Rotating only adjusts metadata angles without re-encoding page content.' }
    ],
    relatedTools: [
      { path: '/crop-pdf', title: 'Crop PDF', description: 'Trim page margins and whitespace.', category: 'pdf' },
      { path: '/pdf-reorder', title: 'Reorder PDF', description: 'Rearrange pages into the correct sequence.', category: 'pdf' },
      { path: '/pdf-compressor', title: 'Compress PDF', description: 'Shrink your document file size.', category: 'pdf' },
      { path: '/pdf-merge', title: 'Merge PDF', description: 'Combine rotated documents together.', category: 'pdf' }
    ]
  },

  'image-converter': {
    slug: 'image-converter',
    path: '/image-converter',
    seoTitle: 'Image Converter Online Free — Convert JPG, PNG, and WebP',
    seoDescription: 'Convert images between JPG, PNG, and WebP formats instantly with preserved colors and transparency.',
    headerBadge: 'Sharp Multi-Format',
    headerCategory: 'image',
    title: 'Image Format Converter',
    description: 'Convert images seamlessly between JPG, PNG, and WebP formats with optimized color preservation and alpha channel handling.',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    maxFileSizeMB: 25,
    howItWorks: [
      { number: 1, title: 'Upload Image', description: 'Select any JPG, PNG, or WebP photo or graphic.' },
      { number: 2, title: 'Select Target Format', description: 'Choose your desired output format: JPG, PNG, or modern WebP.' },
      { number: 3, title: 'Download Converted Image', description: 'Download your converted file with clean encoding.' }
    ],
    faqs: [
      { question: 'What happens to transparency when converting PNG to JPG?', answer: 'Because standard JPG does not support transparent alpha channels, transparent areas are neatly flattened onto a crisp white background.' },
      { question: 'Why should I convert to WebP?', answer: 'WebP offers 25-35% smaller file sizes than JPEG while maintaining equivalent visual quality.' },
      { question: 'Are original photos deleted?', answer: 'Files are temporarily processed on our server and automatically deleted after processing.' }
    ],
    relatedTools: [
      { path: '/image-compressor', title: 'Compress Image', description: 'Optimize image file size without converting format.', category: 'image' },
      { path: '/image-resizer', title: 'Resize Image', description: 'Change width and height dimensions in pixels.', category: 'image' },
      { path: '/image-to-pdf', title: 'Images to PDF', description: 'Combine your images into a PDF document.', category: 'image' },
      { path: '/batch', title: 'Batch Processing', description: 'Convert multiple images in bulk.', category: 'image' }
    ]
  },

  'excel-to-pdf': {
    slug: 'excel-to-pdf',
    path: '/excel-to-pdf',
    seoTitle: 'Excel to PDF Converter Online Free — Convert XLSX & XLS to PDF',
    seoDescription: 'Convert Microsoft Excel spreadsheets (.xlsx, .xls) to PDF using real LibreOffice Calc conversion with clean tables and print bounds.',
    headerBadge: 'LibreOffice Calc',
    headerCategory: 'document',
    title: 'Excel to PDF Converter',
    description: 'Convert Excel spreadsheets (.xlsx and .xls) into clean, professional PDF documents suitable for distribution and archiving.',
    supportedFormats: ['.xlsx', '.xls'],
    maxFileSizeMB: 40,
    howItWorks: [
      { number: 1, title: 'Upload Spreadsheet', description: 'Select your Excel spreadsheet (.xlsx or legacy .xls).' },
      { number: 2, title: 'Sheet Rendering', description: 'LibreOffice Calc formats cell borders, numeric values, and printable margins.' },
      { number: 3, title: 'Download PDF', description: 'Download your formatted PDF document ready to share.' }
    ],
    faqs: [
      { question: 'How are multi-sheet workbooks handled?', answer: 'All active worksheets configured with print areas are sequentially rendered into the PDF document.' },
      { question: 'Are formulas calculated before exporting?', answer: 'Yes. Cell formula values and totals are computed and displayed accurately.' },
      { question: 'Are financial records kept secure?', answer: 'Files are temporarily processed on our server and automatically deleted after processing. No spreadsheet data is stored.' }
    ],
    relatedTools: [
      { path: '/word-to-pdf', title: 'Word to PDF', description: 'Convert Word documents to PDF.', category: 'document' },
      { path: '/pdf-to-word', title: 'PDF to Word', description: 'Convert scanned documents to Word DOCX.', category: 'document' },
      { path: '/pdf-compressor', title: 'Compress PDF', description: 'Shrink your newly converted spreadsheet PDF.', category: 'pdf' },
      { path: '/pdf-merge', title: 'Merge PDF', description: 'Combine financial reports together.', category: 'pdf' }
    ]
  },

  'compress-word': {
    slug: 'compress-word',
    path: '/compress-word',
    seoTitle: 'Compress Word Document Online Free — Shrink DOCX & DOC File Size',
    seoDescription: 'Reduce Word document (.docx, .doc) file sizes by optimizing embedded photos and internal media streams without losing text formatting.',
    headerBadge: 'Media Stream Optimizer',
    headerCategory: 'document',
    title: 'Compress Word Document',
    description: 'Shrink large Microsoft Word documents (.docx and .doc) by optimizing embedded photos and graphics while preserving text styling.',
    supportedFormats: ['.docx', '.doc'],
    maxFileSizeMB: 50,
    howItWorks: [
      { number: 1, title: 'Upload Word File', description: 'Upload your .docx or legacy .doc file.' },
      { number: 2, title: 'Optimize Media', description: 'The engine scans and compresses embedded photos and OpenXML streams.' },
      { number: 3, title: 'Download Optimized DOCX', description: 'Download your lightweight Word document ready for email.' }
    ],
    faqs: [
      { question: 'Why are Word documents so large?', answer: 'Most oversized Word files contain uncompressed camera photos or screenshots. Filoro optimizes those embedded images directly.' },
      { question: 'What if my Word document is already compressed?', answer: 'If no uncompressed media is found, Filoro honestly reports that the document is already optimized rather than claiming fake savings.' },
      { question: 'Are documents deleted after processing?', answer: 'Files are temporarily processed on our server and automatically deleted after processing.' }
    ],
    relatedTools: [
      { path: '/compress-powerpoint', title: 'Compress PowerPoint', description: 'Reduce slide presentation file sizes.', category: 'document' },
      { path: '/word-to-pdf', title: 'Word to PDF', description: 'Convert Word documents to PDF format.', category: 'document' },
      { path: '/pdf-compressor', title: 'Compress PDF', description: 'Reduce PDF file sizes.', category: 'pdf' },
      { path: '/pdf-to-word', title: 'PDF to Word', description: 'Convert scanned PDFs to editable Word.', category: 'document' }
    ]
  },

  'compress-powerpoint': {
    slug: 'compress-powerpoint',
    path: '/compress-powerpoint',
    seoTitle: 'Compress PowerPoint Online Free — Shrink PPTX & PPT File Size',
    seoDescription: 'Reduce PowerPoint presentation (.pptx, .ppt) file sizes by optimizing embedded slide images while preserving slide formatting and animations.',
    headerBadge: 'Slide Media Optimizer',
    headerCategory: 'document',
    title: 'Compress PowerPoint',
    description: 'Shrink large PowerPoint presentation files (.pptx and .ppt) by compressing high-resolution slide images and illustrations.',
    supportedFormats: ['.pptx', '.ppt'],
    maxFileSizeMB: 50,
    howItWorks: [
      { number: 1, title: 'Upload Presentation', description: 'Upload your .pptx or .ppt slide deck.' },
      { number: 2, title: 'Slide Image Recompression', description: 'Embedded high-res graphics and background photos are recompressed efficiently.' },
      { number: 3, title: 'Download Compact PPTX', description: 'Download your smaller presentation file, ready to email.' }
    ],
    faqs: [
      { question: 'Will slide layouts and fonts change?', answer: 'No. Slide layouts, typography, animations, and transitions are 100% preserved.' },
      { question: 'Can it convert legacy .ppt files?', answer: 'Yes. Legacy .ppt presentations can be modernized to .pptx for maximum compression.' },
      { question: 'Do you keep any presentation slides?', answer: 'Files are temporarily processed on our server and automatically deleted after processing.' }
    ],
    relatedTools: [
      { path: '/compress-word', title: 'Compress Word', description: 'Shrink Microsoft Word documents.', category: 'document' },
      { path: '/word-to-pdf', title: 'Word to PDF', description: 'Convert Office documents to PDF.', category: 'document' },
      { path: '/pdf-compressor', title: 'Compress PDF', description: 'Compress exported presentation PDFs.', category: 'pdf' },
      { path: '/batch', title: 'Batch Processing', description: 'Compress multiple files at once.', category: 'image' }
    ]
  },

  'image-to-text': {
    slug: 'image-to-text',
    path: '/image-to-text',
    seoTitle: 'Image to Text OCR Online Free — Extract Text from Photos & Scans',
    seoDescription: 'Extract editable text from images, photos, and screenshots using real Tesseract OCR. Copy to clipboard or download as TXT.',
    headerBadge: 'Tesseract OCR',
    headerCategory: 'image',
    title: 'Image to Text (OCR)',
    description: 'Extract editable text from photographs, document scans, and screenshots with optical character recognition.',
    supportedFormats: ['.png', '.jpg', '.jpeg', '.webp'],
    maxFileSizeMB: 25,
    howItWorks: [
      { number: 1, title: 'Upload Image', description: 'Select an image containing printed or typed text.' },
      { number: 2, title: 'Optical Recognition', description: 'Tesseract OCR normalizes contrast and recognizes words and characters.' },
      { number: 3, title: 'Copy or Download Text', description: 'Copy extracted text with one click or download as a .txt file.' }
    ],
    faqs: [
      { question: 'What languages are supported?', answer: 'English OCR is enabled by default with support for common Latin characters and numbers.' },
      { question: 'Can it extract text from low-quality scans?', answer: 'Pre-processing normalizes contrast and grayscale to maximize accuracy, though crisp scans yield the highest confidence.' },
      { question: 'Is my extracted text stored?', answer: 'Files are temporarily processed on our server and automatically deleted after processing. No text is saved.' }
    ],
    relatedTools: [
      { path: '/scanned-pdf-to-text', title: 'Scanned PDF to Text', description: 'Extract text from multi-page PDF scans.', category: 'pdf' },
      { path: '/pdf-to-word', title: 'PDF to Word', description: 'Convert scanned PDFs to editable Word DOCX.', category: 'document' },
      { path: '/image-to-pdf', title: 'Images to PDF', description: 'Combine images into a PDF document.', category: 'image' },
      { path: '/image-compressor', title: 'Compress Image', description: 'Reduce image file sizes.', category: 'image' }
    ]
  },

  'scanned-pdf-to-text': {
    slug: 'scanned-pdf-to-text',
    path: '/scanned-pdf-to-text',
    seoTitle: 'Scanned PDF to Text Online Free — OCR Multi-Page PDF to TXT',
    seoDescription: 'Extract readable text from multi-page scanned PDF documents. Optical character recognition renders pages and extracts text.',
    headerBadge: 'Multi-Page PDF OCR',
    headerCategory: 'pdf',
    title: 'Scanned PDF to Text',
    description: 'Extract readable, editable text from multi-page scanned PDF documents using high-resolution rendering and Tesseract OCR.',
    supportedFormats: ['.pdf'],
    maxFileSizeMB: 30,
    howItWorks: [
      { number: 1, title: 'Upload Scanned PDF', description: 'Select your scanned PDF document.' },
      { number: 2, title: 'Page-by-Page OCR', description: 'Each page is rendered at 150 DPI and recognized sequentially.' },
      { number: 3, title: 'Download Full Text', description: 'Review per-page metrics and download the complete extracted text file.' }
    ],
    faqs: [
      { question: 'How many pages can be processed at once?', answer: 'You can process up to 20 pages in a single OCR operation.' },
      { question: 'How is confidence measured?', answer: 'The OCR engine reports real calculated character confidence metrics for each page.' },
      { question: 'Are files kept on your server?', answer: 'Files are temporarily processed on our server and automatically deleted after processing.' }
    ],
    relatedTools: [
      { path: '/pdf-to-word', title: 'PDF to Word', description: 'Generate a structured Word DOCX from scans.', category: 'document' },
      { path: '/image-to-text', title: 'Image to Text', description: 'Recognize text in single photo scans.', category: 'image' },
      { path: '/pdf-compressor', title: 'Compress PDF', description: 'Reduce PDF file size before OCR.', category: 'pdf' },
      { path: '/pdf-split', title: 'Split PDF', description: 'Extract specific pages for OCR.', category: 'pdf' }
    ]
  },

  'watermark-pdf': {
    slug: 'watermark-pdf',
    path: '/watermark-pdf',
    seoTitle: 'Watermark PDF Online Free — Add Text Watermarks to PDF Pages',
    seoDescription: 'Stamp customized text watermarks like CONFIDENTIAL or DRAFT onto PDF pages with custom opacity, color, and positioning.',
    headerBadge: 'Custom Text Watermark',
    headerCategory: 'pdf',
    title: 'Watermark PDF Document',
    description: 'Stamp customized text watermarks like "CONFIDENTIAL" or "DRAFT" across your PDF pages with adjustable opacity and diagonal placement.',
    supportedFormats: ['.pdf'],
    maxFileSizeMB: 50,
    howItWorks: [
      { number: 1, title: 'Upload PDF Document', description: 'Select the PDF document you want to watermark.' },
      { number: 2, title: 'Configure Watermark', description: 'Enter your custom text, choose opacity (10%-90%), and select diagonal or horizontal placement.' },
      { number: 3, title: 'Download Watermarked PDF', description: 'Download your stamped document with clean vector text overlays.' }
    ],
    faqs: [
      { question: 'Will the watermark obscure underlying text?', answer: 'Adjustable opacity (default 25%) ensures underlying text remains easily readable.' },
      { question: 'Can I apply watermarks to specific pages only?', answer: 'Yes, you can target all pages or specify page numbers.' },
      { question: 'Are my files stored?', answer: 'Files are temporarily processed on our server and automatically deleted after processing.' }
    ],
    relatedTools: [
      { path: '/protect-pdf', title: 'Protect PDF', description: 'Password-protect sensitive documents.', category: 'pdf' },
      { path: '/page-numbers-pdf', title: 'Page Numbers', description: 'Add clean page numbering headers or footers.', category: 'pdf' },
      { path: '/sign-pdf', title: 'Sign PDF', description: 'Place signatures on document pages.', category: 'pdf' },
      { path: '/crop-pdf', title: 'Crop PDF', description: 'Trim page margins before watermarking.', category: 'pdf' }
    ]
  },

  'page-numbers-pdf': {
    slug: 'page-numbers-pdf',
    path: '/page-numbers-pdf',
    seoTitle: 'Add Page Numbers to PDF Online Free — Custom Headers & Footers',
    seoDescription: 'Add page numbers to PDF documents. Choose header or footer placement, alignment (left, center, right), and exclude cover pages.',
    headerBadge: 'Page Numbering Engine',
    headerCategory: 'pdf',
    title: 'Add PDF Page Numbers',
    description: 'Add clean, professional page numbers to your PDF documents with customizable positioning, format options, and cover page exclusion.',
    supportedFormats: ['.pdf'],
    maxFileSizeMB: 50,
    howItWorks: [
      { number: 1, title: 'Upload PDF', description: 'Select the PDF document requiring page numbers.' },
      { number: 2, title: 'Configure Position & Format', description: 'Choose header or footer placement, alignment, start number, and whether to skip the cover page.' },
      { number: 3, title: 'Download Numbered PDF', description: 'Download your numbered PDF with clean typography.' }
    ],
    faqs: [
      { question: 'Can I skip numbering on the first page?', answer: 'Yes, you can check "Exclude Cover Page" to start numbering from page 2.' },
      { question: 'What numbering styles are available?', answer: 'You can choose "Page X of Y" or simple numbers "X".' },
      { question: 'Are original files deleted?', answer: 'Files are temporarily processed on our server and automatically deleted after processing.' }
    ],
    relatedTools: [
      { path: '/pdf-merge', title: 'Merge PDF', description: 'Combine documents before numbering.', category: 'pdf' },
      { path: '/watermark-pdf', title: 'Watermark PDF', description: 'Add watermark stamps to pages.', category: 'pdf' },
      { path: '/crop-pdf', title: 'Crop PDF', description: 'Adjust page margins before numbering.', category: 'pdf' },
      { path: '/protect-pdf', title: 'Protect PDF', description: 'Secure your numbered document with a password.', category: 'pdf' }
    ]
  },

  'sign-pdf': {
    slug: 'sign-pdf',
    path: '/sign-pdf',
    seoTitle: 'Sign PDF Online Free — Place Signature on PDF Documents',
    seoDescription: 'Place your handwritten or image signature onto PDF documents. Position signatures visually and download signed contracts.',
    headerBadge: 'Signature Placement',
    headerCategory: 'pdf',
    title: 'Sign PDF Document',
    description: 'Place an image signature or styled text signature onto your PDF contracts and forms with custom positioning.',
    supportedFormats: ['.pdf'],
    maxFileSizeMB: 50,
    howItWorks: [
      { number: 1, title: 'Upload PDF Contract', description: 'Select the PDF document you need to sign.' },
      { number: 2, title: 'Upload Signature & Position', description: 'Upload a signature image or enter your name, and choose the target page and position.' },
      { number: 3, title: 'Download Signed PDF', description: 'Download your signed document ready for submission.' }
    ],
    faqs: [
      { question: 'Is this a cryptographic digital certificate?', answer: 'This is an visual signature placement utility for applications and contracts, not an enterprise PKI certificate platform.' },
      { question: 'What signature image formats work best?', answer: 'PNG with a transparent background or clear black ink on white paper works best.' },
      { question: 'Are signatures saved on the server?', answer: 'Files are temporarily processed on our server and automatically deleted after processing. Your signature image is unlinked immediately.' }
    ],
    relatedTools: [
      { path: '/signature-resizer', title: 'Signature Resizer', description: 'Resize signatures for application forms.', category: 'application' },
      { path: '/protect-pdf', title: 'Protect PDF', description: 'Encrypt signed documents with a password.', category: 'pdf' },
      { path: '/watermark-pdf', title: 'Watermark PDF', description: 'Add security watermarks to signed files.', category: 'pdf' },
      { path: '/pdf-compressor', title: 'Compress PDF', description: 'Reduce signed file size for email.', category: 'pdf' }
    ]
  }
};
