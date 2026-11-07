import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config';

// Ensure outputs directory exists
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

export const findUploadFile = async (fileId: string): Promise<string | null> => {
  const cleanId = path.basename(fileId);
  if (!cleanId) return null;

  const files = await fs.promises.readdir(config.uploadDir);
  for (const file of files) {
    if (file === cleanId || file.startsWith(`${cleanId}.`)) {
      return path.join(config.uploadDir, file);
    }
  }
  return null;
};

export const findOutputFile = async (fileId: string): Promise<string | null> => {
  const cleanId = path.basename(fileId);
  if (!cleanId) return null;

  const files = await fs.promises.readdir(config.outputDir);
  for (const file of files) {
    if (file === cleanId || file.startsWith(`${cleanId}.`)) {
      return path.join(config.outputDir, file);
    }
  }
  return null;
};

export const createOutputPath = (ext: string): { outputFileId: string; outputPath: string; outputFilename: string } => {
  const outputFileId = crypto.randomUUID();
  const normalizedExt = ext.startsWith('.') ? ext : `.${ext}`;
  const outputFilename = `${outputFileId}${normalizedExt}`;
  const outputPath = path.join(config.outputDir, outputFilename);
  return { outputFileId, outputPath, outputFilename };
};
