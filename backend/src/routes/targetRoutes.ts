import { Router } from 'express';
import { handleTargetCompress } from '../controllers/targetController';

const router = Router();

// Target Size Compression Endpoint
router.post('/target/compress', handleTargetCompress);

export default router;

