import { Router } from 'express';
import { handleUploadMultiple } from '../middleware/uploadMiddleware';
import { handleBatchProcess, handleBatchUpload } from '../controllers/batchController';

const router = Router();

router.post('/batch/upload', handleUploadMultiple, handleBatchUpload);
router.post('/batch/process', handleBatchProcess);

export default router;

