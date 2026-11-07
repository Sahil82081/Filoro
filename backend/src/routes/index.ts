import { Router } from 'express';
import healthRoutes from './healthRoutes';
import uploadRoutes from './uploadRoutes';
import imageRoutes from './imageRoutes';
import pdfRoutes from './pdfRoutes';
import pdfOrganizeRoutes from './pdfOrganizeRoutes';
import pdfConvertRoutes from './pdfConvertRoutes';
import docCompressRoutes from './docCompressRoutes';
import targetRoutes from './targetRoutes';
import ocrRoutes from './ocrRoutes';
import pdfModifyRoutes from './pdfModifyRoutes';
import batchRoutes from './batchRoutes';

const router = Router();

router.use('/', healthRoutes);
router.use('/', uploadRoutes);
router.use('/', imageRoutes);
router.use('/', pdfRoutes);
router.use('/', pdfOrganizeRoutes);
router.use('/', pdfConvertRoutes);
router.use('/', docCompressRoutes);
router.use('/', targetRoutes);
router.use('/', pdfModifyRoutes);
router.use('/', batchRoutes);
router.use('/ocr', ocrRoutes);
router.use('/', ocrRoutes);

export default router;
