import { Router } from 'express';
import { uploadFile, deleteUploadedFile } from '../controllers/uploadController';
import { handleUpload } from '../middleware/uploadMiddleware';

const router = Router();

// POST /api/upload - Upload and validate a temporary file
router.post('/upload', handleUpload, uploadFile);

// DELETE /api/upload/:fileId - Manually delete temporary file
router.delete('/upload/:fileId', deleteUploadedFile);

// DELETE /api/cleanup/:fileId - Purge temporary output or upload file
router.delete('/cleanup/:fileId', deleteUploadedFile);

export default router;

