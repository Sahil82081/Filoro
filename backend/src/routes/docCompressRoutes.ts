import { Router } from 'express';
import { handleCompressDocument } from '../controllers/docCompressController';

const router = Router();

// Stage 11 Document Compression Routes (DOC, DOCX, PPT, PPTX)
router.post(['/document/compress', '/doc/compress'], handleCompressDocument);

export default router;

