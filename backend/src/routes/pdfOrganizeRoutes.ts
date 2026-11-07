import { Router } from 'express';
import {
  handleGetPdfInfo,
  handleMergePdfs,
  handleSplitPdf,
  handleExtractPages,
  handleReorderPages,
  handleRotatePages
} from '../controllers/pdfOrganizeController';

const router = Router();

// PDF Organization Endpoints (supports both /pdf/... and /pdf/organize/...)
router.get(['/pdf/info/:fileId', '/pdf/organize/info/:fileId'], handleGetPdfInfo);
router.post(['/pdf/merge', '/pdf/organize/merge'], handleMergePdfs);
router.post(['/pdf/split', '/pdf/organize/split'], handleSplitPdf);
router.post(['/pdf/extract', '/pdf/organize/extract'], handleExtractPages);
router.post(['/pdf/reorder', '/pdf/organize/reorder'], handleReorderPages);
router.post(['/pdf/rotate', '/pdf/organize/rotate'], handleRotatePages);

export default router;

