import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  uploadDir: path.resolve(__dirname, '../../uploads'),
  outputDir: path.resolve(__dirname, '../../outputs'),
  maxFileSizeMB: process.env.MAX_FILE_SIZE_MB ? parseInt(process.env.MAX_FILE_SIZE_MB, 10) : 50,
  fileTtlMinutes: process.env.FILE_TTL_MINUTES ? parseInt(process.env.FILE_TTL_MINUTES, 10) : 30
};
