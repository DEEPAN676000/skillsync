import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  console.error('[Error Handler]:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id ${err.value}`;
    res.status(404).json({ success: false, message });
    return;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `A record with this ${field} already exists.`;
    res.status(400).json({ success: false, message });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val: any) => val.message)
      .join(', ');
    res.status(400).json({ success: false, message });
    return;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Internal Error',
  });
};

