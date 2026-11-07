import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Unhandled error:', err);

  // Sanitize internal server paths (Windows C:\... and POSIX /home/...) from user-facing error messages
  const rawMessage = err.message || 'Internal Server Error';
  const sanitizedMessage = rawMessage
    .replace(/[A-Za-z]:\\[^"'\n\r\t<>]+/g, '[file]')
    .replace(/\/(?:[a-zA-Z0-9._-]+\/)+[a-zA-Z0-9._-]+/g, '[file]');

  res.status(500).json({
    status: 'error',
    message: sanitizedMessage
  });
};

