import { Router } from 'express';
import {
  handleImageToText,
  handlePdfToText,
  handlePdfToWord,
  handleImageToPdf,
} from '../controllers/ocrController';

const router = Router();

// OCR routes
router.post('/image-to-text', handleImageToText);
router.post('/pdf-to-text', handlePdfToText);
router.post('/pdf-to-word', handlePdfToWord);
router.post('/pdf-to-docx', handlePdfToWord); // Alias
router.post('/image-to-pdf', handleImageToPdf);

export default router;

