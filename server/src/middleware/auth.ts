import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User, { IUser } from '../models/User.js';
import localStore from '../utils/localStore.js';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please log in.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'skillsync_jwt_super_secure_secret_key_2026_dev'
    ) as { id: string };

    let user: any = null;

    if (mongoose.connection.readyState === 1) {
      user = await User.findById(decoded.id);
    } else {
      user = localStore.users.find(
        (u) => u._id === decoded.id || u.id === decoded.id
      );
    }

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'No user found with this id.',
      });
      return;
    }

    req.user = user;
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      message: 'Authentication token is invalid or expired. Please log in again.',
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `User role '${req.user?.role}' is not authorized to perform this action.`,
      });
      return;
    }
    next();
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'skillsync_jwt_super_secure_secret_key_2026_dev'
    ) as { id: string };

    let user: any = null;
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(decoded.id);
    } else {
      user = localStore.users.find(
        (u) => u._id === decoded.id || u.id === decoded.id
      );
    }

    if (user) {
      req.user = user;
    }
  } catch (err) {
    // Ignore invalid token on optionalAuth
  }
  next();
};
