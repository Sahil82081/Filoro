import { Router } from 'express';
import {
  handleCompress,
  handleResize,
  handleConvert,
  handleApplicationResize,
  handleDownload,
  handlePreview
} from '../controllers/imageController';

const router = Router();

// Image Processing Endpoints
router.post('/image/compress', handleCompress);
router.post('/image/resize', handleResize);
router.post('/image/convert', handleConvert);
router.post('/image/application-resize', handleApplicationResize);

// File Delivery Endpoints
router.get('/download/:fileId', handleDownload);
router.get('/preview/:fileId', handlePreview);
router.get('/files/download/:fileId', handleDownload);
router.get('/files/preview/:fileId', handlePreview);

export default router;
