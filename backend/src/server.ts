import app from './app';
import { config } from './config';
import { startupCleanup, startPeriodicCleanup } from './utils/cleanup';

const PORT = config.port;

// Perform immediate boot-time sweep for any orphaned temporary files
startupCleanup(config.fileTtlMinutes).catch((err) => {
  console.warn('[Startup] Cleanup sweep warning:', err);
});

// Start background temporary file sweeper (every 10 minutes)
startPeriodicCleanup(10, config.fileTtlMinutes);

const server = app.listen(PORT, () => {
  console.log(`Fileora Backend running on http://localhost:${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
  console.log(`Upload endpoint available at POST http://localhost:${PORT}/api/upload`);
});

export default server;
