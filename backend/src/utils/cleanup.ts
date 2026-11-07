import fs from 'fs';
import path from 'path';
import { config } from '../config';

/**
 * Safely unlinks a specific file from disk if it exists.
 * Retries on Windows EBUSY / EPERM locks with exponential backoff.
 */
export const cleanupFile = async (
  filePath?: string | null,
  retries: number = 4,
  delayMs: number = 80
): Promise<boolean> => {
  if (!filePath || typeof filePath !== 'string') return false;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch (err: any) {
      if ((err?.code === 'EBUSY' || err?.code === 'EPERM') && attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
        continue;
      }
      // Non-fatal logging
      console.warn(`[Cleanup] Notice: Could not unlink ${filePath}: ${err?.message || err}`);
      return false;
    }
  }
  return false;
};

/**
 * Safely unlinks an array of file paths.
 */
export const cleanupFiles = async (
  filePaths: Array<string | undefined | null>
): Promise<number> => {
  let cleaned = 0;
  const validPaths = filePaths.filter((p): p is string => Boolean(p && typeof p === 'string'));

  await Promise.all(
    validPaths.map(async (filePath) => {
      const ok = await cleanupFile(filePath);
      if (ok) cleaned++;
    })
  );

  return cleaned;
};

/**
 * Safely unlinks files matching a fileId prefix in uploads, outputs, or both.
 */
export const cleanupFileById = async (
  fileId: string,
  target: 'uploads' | 'outputs' | 'both' = 'both'
): Promise<number> => {
  const cleanId = path.basename(fileId);
  if (!cleanId) return 0;

  let cleaned = 0;
  const dirsToSearch: string[] = [];
  if (target === 'uploads' || target === 'both') dirsToSearch.push(config.uploadDir);
  if (target === 'outputs' || target === 'both') dirsToSearch.push(config.outputDir);

  for (const dir of dirsToSearch) {
    try {
      if (!fs.existsSync(dir)) continue;
      const files = await fs.promises.readdir(dir);
      for (const file of files) {
        if (file !== '.gitkeep' && file.startsWith(cleanId)) {
          const fullPath = path.join(dir, file);
          const ok = await cleanupFile(fullPath);
          if (ok) cleaned++;
        }
      }
    } catch (err) {
      console.warn(`[Cleanup] Error scanning ${dir} for id ${cleanId}:`, err);
    }
  }

  return cleaned;
};

/**
 * Sweeps a directory and removes any files older than maxAgeMinutes.
 * Always preserves .gitkeep files.
 */
export const sweepDirectory = async (
  dirPath: string,
  maxAgeMinutes: number = 30
): Promise<number> => {
  let cleanedCount = 0;
  try {
    if (!fs.existsSync(dirPath)) {
      return 0;
    }

    const now = Date.now();
    const maxAgeMs = maxAgeMinutes * 60 * 1000;
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile() && entry.name !== '.gitkeep') {
        const fullPath = path.join(dirPath, entry.name);
        try {
          const stats = await fs.promises.stat(fullPath);
          const ageMs = now - stats.mtimeMs;

          if (ageMs > maxAgeMs) {
            const ok = await cleanupFile(fullPath);
            if (ok) cleanedCount++;
          }
        } catch {
          // File might have been cleaned concurrently
        }
      }
    }
  } catch (err) {
    console.warn(`[Cleanup] Error sweeping directory ${dirPath}:`, err);
  }
  return cleanedCount;
};

/**
 * Performs startup sweep on boot to purge any dangling stale files
 * left by prior process crashes or interrupted sessions.
 */
export const startupCleanup = async (
  staleThresholdMinutes: number = 5
): Promise<{ uploadsCleaned: number; outputsCleaned: number }> => {
  const uploadsCleaned = await sweepDirectory(config.uploadDir, staleThresholdMinutes);
  const outputsCleaned = await sweepDirectory(config.outputDir, staleThresholdMinutes);

  if (uploadsCleaned > 0 || outputsCleaned > 0) {
    console.log(
      `[Startup Cleanup] Purged ${uploadsCleaned} stale upload(s) and ${outputsCleaned} stale output(s).`
    );
  }

  return { uploadsCleaned, outputsCleaned };
};

/**
 * Starts a recurring background cleanup interval for uploads and outputs.
 */
export const startPeriodicCleanup = (
  intervalMinutes: number = 10,
  maxAgeMinutes: number = config.fileTtlMinutes
): NodeJS.Timeout => {
  const runSweep = async () => {
    const sweptUploads = await sweepDirectory(config.uploadDir, maxAgeMinutes);
    const sweptOutputs = await sweepDirectory(config.outputDir, maxAgeMinutes);
    if (sweptUploads > 0 || sweptOutputs > 0) {
      console.log(`[Sweeper] Cleaned ${sweptUploads} upload(s) and ${sweptOutputs} output(s).`);
    }
  };

  // Run initial startup sweep immediately
  startupCleanup(5).catch(() => {});

  const intervalMs = intervalMinutes * 60 * 1000;
  return setInterval(runSweep, intervalMs);
};

export interface SafeExecutionOptions<T> {
  inputUploads?: Array<string | undefined | null>;
  intermediateFiles?: Array<string | undefined | null>;
  onFailOutputs?: Array<string | undefined | null>;
  operation: () => Promise<T>;
  timeoutMs?: number;
}

/**
 * Reliable processing wrapper ensuring:
 * 1. inputUploads are ALWAYS cleaned up in finally.
 * 2. intermediateFiles are ALWAYS cleaned up in finally.
 * 3. onFailOutputs are cleaned up if the operation throws/fails or times out.
 * 4. Timeout enforcement to avoid hanging processes.
 */
export const withSafeExecution = async <T>(
  options: SafeExecutionOptions<T>
): Promise<T> => {
  const {
    inputUploads = [],
    intermediateFiles = [],
    onFailOutputs = [],
    operation,
    timeoutMs,
  } = options;

  let timer: NodeJS.Timeout | null = null;

  try {
    const opPromise = operation();

    if (timeoutMs && timeoutMs > 0) {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`Operation timed out after ${Math.round(timeoutMs / 1000)} seconds.`));
        }, timeoutMs);
      });

      return await Promise.race([opPromise, timeoutPromise]);
    } else {
      return await opPromise;
    }
  } catch (err) {
    // If processing failed, clean up any incomplete/corrupt outputs
    await cleanupFiles(onFailOutputs);
    throw err;
  } finally {
    if (timer) clearTimeout(timer);
    // Guarantee cleanup of uploads and intermediate scratch files
    await cleanupFiles([...inputUploads, ...intermediateFiles]);
  }
};
