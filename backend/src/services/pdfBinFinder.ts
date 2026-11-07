import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

let cachedQpdfPath: string | null = null;
let cachedGsPath: string | null = null;
let cachedPopplerPath: string | null = null;
let cachedLibreOfficePath: string | null = null;

/**
 * Locate QPDF executable
 */
export const getQpdfPath = (): string => {
  if (cachedQpdfPath) return cachedQpdfPath;

  const candidatePaths = [
    // Local project bin directory
    path.resolve(process.cwd(), 'bin', 'qpdf', 'bin', 'qpdf.exe'),
    path.resolve(process.cwd(), 'backend', 'bin', 'qpdf', 'bin', 'qpdf.exe'),
    path.resolve(__dirname, '..', '..', 'bin', 'qpdf', 'bin', 'qpdf.exe'),
    path.resolve(__dirname, '..', '..', '..', 'bin', 'qpdf', 'bin', 'qpdf.exe'),
    path.resolve(__dirname, '..', '..', '..', 'backend', 'bin', 'qpdf', 'bin', 'qpdf.exe'),
    'C:\\Program Files\\qpdf\\bin\\qpdf.exe',
    'C:\\Program Files (x86)\\qpdf\\bin\\qpdf.exe',
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      cachedQpdfPath = candidate;
      return candidate;
    }
  }

  // Check PATH
  try {
    const whichCmd = process.platform === 'win32' ? 'where.exe qpdf' : 'which qpdf';
    const out = execSync(whichCmd, { stdio: ['pipe', 'pipe', 'ignore'], encoding: 'utf-8' }).trim();
    if (out) {
      const firstLine = out.split('\n')[0].trim();
      if (fs.existsSync(firstLine)) {
        cachedQpdfPath = firstLine;
        return firstLine;
      }
    }
  } catch {
    // Not found in PATH
  }

  // Fallback to command name
  return 'qpdf';
};

/**
 * Locate Ghostscript executable (if available on the system)
 */
export const getGhostscriptPath = (): string | null => {
  if (cachedGsPath !== null) return cachedGsPath;

  const gsCandidates = [
    path.resolve(process.cwd(), 'bin', 'gs', 'bin', 'gswin64c.exe'),
    path.resolve(process.cwd(), 'backend', 'bin', 'gs', 'bin', 'gswin64c.exe'),
    'C:\\Program Files\\gs\\gs10.08.0\\bin\\gswin64c.exe',
    'C:\\Program Files\\gs\\gs10.04.0\\bin\\gswin64c.exe',
    'C:\\Program Files\\gs\\gs10.03.0\\bin\\gswin64c.exe',
    'C:\\Program Files\\gs\\gs10.02.0\\bin\\gswin64c.exe',
    'C:\\Program Files\\gs\\gs9.56.1\\bin\\gswin64c.exe',
  ];

  for (const candidate of gsCandidates) {
    if (fs.existsSync(candidate)) {
      cachedGsPath = candidate;
      return candidate;
    }
  }

  // Check system PATH
  const names = process.platform === 'win32' ? ['gswin64c', 'gswin32c', 'gs'] : ['gs'];
  for (const name of names) {
    try {
      const whichCmd = process.platform === 'win32' ? `where.exe ${name}` : `which ${name}`;
      const out = execSync(whichCmd, { stdio: ['pipe', 'pipe', 'ignore'], encoding: 'utf-8' }).trim();
      if (out) {
        const firstLine = out.split('\n')[0].trim();
        if (fs.existsSync(firstLine)) {
          cachedGsPath = firstLine;
          return firstLine;
        }
      }
    } catch {
      // Continue checking
    }
  }

  return null;
};

/**
 * Locate Poppler pdftoppm executable
 */
export const getPdftoppmPath = (): string => {
  if (cachedPopplerPath) return cachedPopplerPath;

  const candidatePaths = [
    path.resolve(process.cwd(), 'bin', 'poppler', 'bin', 'pdftoppm.exe'),
    path.resolve(process.cwd(), 'backend', 'bin', 'poppler', 'bin', 'pdftoppm.exe'),
    path.resolve(__dirname, '..', '..', 'bin', 'poppler', 'bin', 'pdftoppm.exe'),
    path.resolve(__dirname, '..', '..', '..', 'bin', 'poppler', 'bin', 'pdftoppm.exe'),
    path.resolve(__dirname, '..', '..', '..', 'backend', 'bin', 'poppler', 'bin', 'pdftoppm.exe'),
    'C:\\Users\\sahil\\AppData\\Local\\Microsoft\\WinGet\\Packages\\oschwartz10612.Poppler_Microsoft.Winget.Source_8wekyb3d8bbwe\\poppler-25.07.0\\Library\\bin\\pdftoppm.exe',
    'C:\\Program Files\\poppler\\bin\\pdftoppm.exe',
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      cachedPopplerPath = candidate;
      return candidate;
    }
  }

  // Check PATH
  try {
    const whichCmd = process.platform === 'win32' ? 'where.exe pdftoppm' : 'which pdftoppm';
    const out = execSync(whichCmd, { stdio: ['pipe', 'pipe', 'ignore'], encoding: 'utf-8' }).trim();
    if (out) {
      const firstLine = out.split('\n')[0].trim();
      if (fs.existsSync(firstLine)) {
        cachedPopplerPath = firstLine;
        return firstLine;
      }
    }
  } catch {
    // Not found in PATH
  }

  return 'pdftoppm';
};

/**
 * Locate LibreOffice executable (soffice.com or soffice.exe)
 */
export const getLibreOfficePath = (): string => {
  if (cachedLibreOfficePath) return cachedLibreOfficePath;

  const candidatePaths = [
    'C:\\Users\\sahil\\libreoffice\\program\\soffice.com',
    'C:\\Users\\sahil\\libreoffice\\program\\soffice.exe',
    path.resolve(process.cwd(), 'bin', 'libreoffice', 'program', 'soffice.com'),
    path.resolve(process.cwd(), 'backend', 'bin', 'libreoffice', 'program', 'soffice.com'),
    'C:\\Program Files\\LibreOffice\\program\\soffice.com',
    'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
    'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.com',
    'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      cachedLibreOfficePath = candidate;
      return candidate;
    }
  }

  // Check PATH
  const names = process.platform === 'win32' ? ['soffice.com', 'soffice.exe', 'soffice', 'libreoffice'] : ['libreoffice', 'soffice'];
  for (const name of names) {
    try {
      const whichCmd = process.platform === 'win32' ? `where.exe ${name}` : `which ${name}`;
      const out = execSync(whichCmd, { stdio: ['pipe', 'pipe', 'ignore'], encoding: 'utf-8' }).trim();
      if (out) {
        const firstLine = out.split('\n')[0].trim();
        if (fs.existsSync(firstLine)) {
          cachedLibreOfficePath = firstLine;
          return firstLine;
        }
      }
    } catch {
      // Continue searching
    }
  }

  return 'soffice';
};


