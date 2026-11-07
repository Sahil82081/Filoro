import { Router } from 'express';
import { handlePdfCompress } from '../controllers/pdfController';

const router = Router();

// PDF Compression Endpoint
router.post('/pdf/compress', handlePdfCompress);

export default router;

