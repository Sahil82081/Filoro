import { Request, Response } from 'express';

export const getHealth = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Fileora API is running',
    timestamp: new Date().toISOString()
  });
};

