import express, { Application } from 'express';
import cors from 'cors';
import { config } from './config';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { requestCleanupMiddleware } from './middleware/cleanupMiddleware';

const app: Application = express();

const allowedOrigin = config.corsOrigin === '*'
  ? true
  : (config.corsOrigin.includes(',')
      ? config.corsOrigin.split(',').map((s) => s.trim())
      : config.corsOrigin);

app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Automatic cleanup & safety timeout middleware
app.use(requestCleanupMiddleware(120_000));

// API Routes
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);

export default app;

