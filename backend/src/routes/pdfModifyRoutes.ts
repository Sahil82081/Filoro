import { Router } from 'express';
import {
  handleCrop,
  handleWatermark,
  handlePageNumbers,
  handleProtect,
  handleSign,
} from '../controllers/pdfModifyController';

const router = Router();

// Dedicated PDF manipulation endpoints
router.post('/pdf/crop', handleCrop);
router.post('/pdf/watermark', handleWatermark);
router.post('/pdf/page-numbers', handlePageNumbers);
router.post('/pdf/protect', handleProtect);
router.post('/pdf/sign', handleSign);

// Aliases under /pdf/modify/*
router.post('/pdf/modify/crop', handleCrop);
router.post('/pdf/modify/watermark', handleWatermark);
router.post('/pdf/modify/page-numbers', handlePageNumbers);
router.post('/pdf/modify/protect', handleProtect);
router.post('/pdf/modify/sign', handleSign);

export default router;

