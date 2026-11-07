import { Router } from 'express';
import {
  handlePdfToImage,
  handleImageToPdf,
  handleOfficeToPdf
} from '../controllers/pdfConvertController';

const router = Router();

// Stage 10 Document & Image Conversion Routes
router.post(['/convert/pdf-to-image', '/pdf/to-image'], handlePdfToImage);
router.post(['/convert/image-to-pdf', '/image/to-pdf'], handleImageToPdf);
router.post(['/convert/office-to-pdf', '/office/to-pdf'], handleOfficeToPdf);

export default router;

